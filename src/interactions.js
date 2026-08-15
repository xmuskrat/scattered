import { placementForPoint } from './model.js';

export const isSelectionKey = (key) => key === 'Enter' || key === ' ';

export function placementFromPointer(event, svg, data, radius) {
  const bounds = svg.getBoundingClientRect();
  const scale = 760 / bounds.width;
  return placementForPoint((event.clientX - bounds.left - bounds.width / 2) * scale, (event.clientY - bounds.top - bounds.height / 2) * scale, data, radius);
}

export function placementFromKey(item, key, data) {
  const sliceIndex = data.slices.findIndex(({ id }) => id === item.slice);
  const bandIndex = data.bands.findIndex(({ id }) => id === item.band);
  if (key === 'ArrowRight' || key === 'ArrowLeft') return { ...item, slice: data.slices[(sliceIndex + (key === 'ArrowRight' ? 1 : -1) + data.slices.length) % data.slices.length].id };
  if (key === 'ArrowUp' || key === 'ArrowDown') return { ...item, band: data.bands[Math.max(0, Math.min(data.bands.length - 1, bandIndex + (key === 'ArrowDown' ? 1 : -1)))].id };
  return null;
}
