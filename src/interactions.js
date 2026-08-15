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
  const normalizedKey = key.toLowerCase();
  const movesRight = key === 'ArrowRight' || normalizedKey === 'd';
  const movesLeft = key === 'ArrowLeft' || normalizedKey === 'a';
  const movesInward = key === 'ArrowUp' || normalizedKey === 'w';
  const movesOutward = key === 'ArrowDown' || normalizedKey === 's';

  if (movesRight || movesLeft) {
    const direction = movesRight ? 1 : -1;
    return { ...item, slice: data.slices[(sliceIndex + direction + data.slices.length) % data.slices.length].id };
  }
  if (movesInward || movesOutward) {
    const direction = movesOutward ? 1 : -1;
    const nextBand = Math.max(0, Math.min(data.bands.length - 1, bandIndex + direction));
    return { ...item, band: data.bands[nextBand].id };
  }
  return null;
}
