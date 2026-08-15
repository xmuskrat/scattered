import { defineScatteredRadar } from './scattered-radar.js';

defineScatteredRadar();

const chart = document.querySelector('#chart');
const itemName = document.querySelector('#item-name');
const itemDetail = document.querySelector('#item-detail');
const changeTitle = document.querySelector('#change-log-title');
const changeDetail = document.querySelector('#change-log-detail');
const undo = document.querySelector('#undo');
const search = document.querySelector('#search');
const readonly = document.querySelector('#readonly');
const legend = document.querySelector('#legend');
let lastChange;

/** Update the adjacent inspector without duplicating the component's state. */
function describe(item, data) {
  const slice = data.slices.find(({ id }) => id === item.slice);
  const band = data.bands.find(({ id }) => id === item.band);
  itemName.textContent = item.name;
  itemDetail.textContent = `${slice.name} · ${band.name}${item.description ? ` — ${item.description}` : ''}`;
}

chart.addEventListener('load', ({ detail: { data } }) => {
  legend.replaceChildren(...data.slices.map((slice) => {
    const entry = document.createElement('li');
    entry.innerHTML = `<span style="background:${slice.color}"></span>${slice.name}`;
    return entry;
  }));
  describe(data.items[0], data);
});

chart.addEventListener('select', ({ detail: { item } }) => describe(item, chart.data));
chart.addEventListener('change', ({ detail }) => {
  lastChange = detail;
  undo.disabled = false;
  changeTitle.textContent = `${detail.item.name}: ${detail.previous.slice} / ${detail.previous.band} → ${detail.item.slice} / ${detail.item.band}`;
  changeDetail.textContent = 'Captured for this session. Use Undo or connect this event to your own persistence layer.';
});

search.addEventListener('input', () => { chart.filter = search.value; });
readonly.addEventListener('change', () => { chart.readonly = readonly.checked; });
undo.addEventListener('click', () => {
  if (!lastChange) return;
  const data = chart.data;
  Object.assign(data.items.find(({ id }) => id === lastChange.item.id), lastChange.previous);
  chart.data = data;
  undo.disabled = true;
  changeTitle.textContent = 'Last move undone.';
  changeDetail.textContent = 'The radar is back to its prior classification.';
  lastChange = undefined;
});
