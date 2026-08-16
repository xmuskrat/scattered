import { radarEvent } from './events.js';
import { isSelectionKey, placementFromKey, placementFromPointer } from './interactions.js';
import { normalizeRadar } from './model.js';
import { renderRadar, styles } from './renderer.js';

/**
 * A framework-neutral radial classification board.
 *
 * Provide data through the `data` property or a JSON `data-src` attribute.
 * Listen for `select` and `change` events at the component or any ancestor.
 */
export class ScatteredRadar extends HTMLElement {
  static observedAttributes = ['data-src', 'readonly'];
  #data;
  #filter = '';
  #selectedId;
  #root = this.attachShadow({ mode: 'open' });

  set data(value) {
    this.#data = normalizeRadar(structuredClone(value));
    this.#selectedId ??= this.#data.items[0]?.id;
    this.render();
  }

  get data() { return this.#data && structuredClone(this.#data); }

  set filter(value) {
    this.#filter = String(value || '');
    this.render();
  }

  get filter() { return this.#filter; }

  set selectedId(value) {
    this.#selectedId = value;
    this.render();
  }

  get selectedId() { return this.#selectedId; }
  get readonly() { return this.hasAttribute('readonly'); }
  set readonly(value) { this.toggleAttribute('readonly', Boolean(value)); }

  connectedCallback() {
    if (this.hasAttribute('data-src')) this.#loadData();
    else if (this.#data) this.render();
  }

  attributeChangedCallback(name) {
    if (name === 'data-src' && this.isConnected) this.#loadData();
    if (name === 'readonly' && this.#data) this.render();
  }

  async #loadData() {
    const source = this.getAttribute('data-src');
    if (!source) return;

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Could not load chart data (${response.status}).`);
      this.data = await response.json();
      this.dispatchEvent(radarEvent('load', { data: this.data }));
    } catch (error) {
      this.dispatchEvent(radarEvent('error', { error }));
    }
  }

  render() {
    if (!this.#data) return;

    const style = document.createElement('style');
    style.textContent = styles;
    const svg = renderRadar(this.#data, {
      filter: this.#filter,
      onFocus: (item) => this.#select(item, { render: false }),
      onKeyDown: (item, event) => this.#moveWithKeys(item, event),
      onPointerDown: (...args) => this.#drag(...args),
      onSelect: (item) => this.#select(item),
      selectedId: this.#selectedId,
    });
    this.#root.replaceChildren(style, svg);
  }

  #select(item, { render = true } = {}) {
    this.#selectedId = item.id;
    this.dispatchEvent(radarEvent('select', { item: structuredClone(item) }));
    if (render) this.render();
  }

  #change(item, previous) {
    this.#selectedId = item.id;
    this.dispatchEvent(radarEvent('change', {
      data: this.data,
      item: structuredClone(item),
      previous: structuredClone(previous),
    }));
    this.render();
  }

  #drag(item, point, event, radius) {
    if (this.readonly) return;
    point.setPointerCapture(event.pointerId);

    // The item is the source of truth. A drag only emits its updated placement;
    // hosts decide whether and how to persist the emitted `change` event.
    const finish = (endEvent) => {
      if (endEvent.type === 'pointercancel') return;
      const previous = structuredClone(item);
      Object.assign(item, placementFromPointer(endEvent, point.ownerSVGElement, this.#data, radius));
      this.#change(item, previous);
    };

    point.addEventListener('pointerup', finish, { once: true });
    point.addEventListener('pointercancel', finish, { once: true });
  }

  #moveWithKeys(item, event) {
    if (isSelectionKey(event.key)) {
      event.preventDefault();
      this.#select(item);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#selectedId = undefined;
      this.render();
      return;
    }

    const moved = placementFromKey(item, event.key, this.#data);
    if (!moved || this.readonly) return;
    event.preventDefault();
    const previous = structuredClone(item);
    Object.assign(item, moved);
    this.#change(item, previous);
  }
}

export function defineScatteredRadar() {
  if (!customElements.get('scattered-radar')) customElements.define('scattered-radar', ScatteredRadar);
}
