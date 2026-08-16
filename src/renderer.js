import { polarForItem } from './model.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const VIEWBOX_SIZE = 760;
const CHART_RADIUS = VIEWBOX_SIZE * 0.39;

export const styles = `
  :host { display: block; min-width: 0; user-select: none; -webkit-user-select: none; }
  svg { display: block; width: 100%; height: auto; overflow: visible; }
  .ring, .spoke { fill: none; stroke: #81786f; stroke-width: 1.5; stroke-dasharray: 3 5; }
  .band-label { fill: #625b54; font: 11px system-ui, sans-serif; text-anchor: middle; }
  .slice-label { font: 750 15px system-ui, sans-serif; text-anchor: middle; }
  .point { cursor: grab; stroke: #fff; stroke-width: 3; transition: r .15s ease; }
  .point:hover, .point:focus { r: 17; outline: none; }
  .point:focus { stroke: #191719; }
  .point[aria-pressed="true"] { stroke: #191719; stroke-width: 5; }
  .point-number { fill: #fff; font: 800 11px system-ui, sans-serif; pointer-events: none; text-anchor: middle; }
`;

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function appendBandGuides(svg, bands) {
  for (const [index, band] of bands.entries()) {
    const ringRadius = CHART_RADIUS * ((index + 1) / bands.length);
    svg.append(svgElement('circle', { class: 'ring', r: ringRadius }));

    const label = svgElement('text', { class: 'band-label', x: -CHART_RADIUS * ((index + 0.5) / bands.length), y: 4 });
    label.textContent = band.name;
    svg.append(label);
  }
}

function appendSliceGuides(svg, slices) {
  for (const [index, slice] of slices.entries()) {
    const angle = (Math.PI * 2 * index) / slices.length;
    const labelAngle = angle + Math.PI / slices.length;
    svg.append(svgElement('line', { class: 'spoke', x1: 0, y1: 0, x2: Math.cos(angle) * CHART_RADIUS, y2: Math.sin(angle) * CHART_RADIUS }));

    const label = svgElement('text', { class: 'slice-label', fill: slice.color, x: Math.cos(labelAngle) * CHART_RADIUS * 1.1, y: Math.sin(labelAngle) * CHART_RADIUS * 1.1 });
    label.textContent = slice.name;
    svg.append(label);
  }
}

function matchesFilter(item, slice, band, filter) {
  if (!filter) return true;
  const searchable = [item.name, item.description, slice.name, band.name].filter(Boolean).join(' ').toLowerCase();
  return searchable.includes(filter.toLowerCase());
}

function appendPoint(svg, item, number, data, selectedId, callbacks) {
  const slice = data.slices.find(({ id }) => id === item.slice);
  const band = data.bands.find(({ id }) => id === item.band);
  const { x, y } = polarForItem(item, data, CHART_RADIUS);
  const point = svgElement('circle', {
    'aria-label': `${item.name}, ${slice.name}, ${band.name}`,
    'aria-pressed': item.id === selectedId,
    class: 'point', cx: x, cy: y, fill: slice.color, r: 13, role: 'button', tabindex: 0,
  });

  // Native SVG titles preserve the original hover detail, while the accessible
  // name gives keyboard and screen-reader users the same context.
  const title = svgElement('title');
  title.textContent = `${item.name} — ${slice.name}, ${band.name}`;
  point.append(title);

  point.addEventListener('click', () => callbacks.onSelect(item));
  // Pointer down gives an SVG point focus before the drag completes. Keep that
  // focus update render-free so it cannot replace the active pointer target.
  point.addEventListener('focus', () => callbacks.onFocus(item));
  point.addEventListener('pointerdown', (event) => callbacks.onPointerDown(item, point, event, CHART_RADIUS));
  point.addEventListener('keydown', (event) => callbacks.onKeyDown(item, event));
  svg.append(point);

  const label = svgElement('text', { class: 'point-number', x, y: y + 4 });
  label.textContent = number;
  svg.append(label);
}

/** Render the stateless SVG view used by the <scattered-radar> custom element. */
export function renderRadar(data, {
  selectedId,
  filter,
  onFocus,
  onSelect,
  onPointerDown,
  onKeyDown,
}) {
  const svg = svgElement('svg', {
    'aria-label': data.title || 'Interactive radar chart',
    role: 'img',
    viewBox: `${-VIEWBOX_SIZE / 2} ${-VIEWBOX_SIZE / 2} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`,
  });

  appendBandGuides(svg, data.bands);
  appendSliceGuides(svg, data.slices);

  const callbacks = { onFocus, onSelect, onPointerDown, onKeyDown };
  const visibleItems = data.items.filter((item) => {
    const slice = data.slices.find(({ id }) => id === item.slice);
    const band = data.bands.find(({ id }) => id === item.band);
    return matchesFilter(item, slice, band, filter);
  });

  visibleItems.forEach((item, index) => appendPoint(svg, item, index + 1, data, selectedId, callbacks));
  return svg;
}
