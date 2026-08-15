const ensureUniqueNamed = (values, kind) => {
  if (!Array.isArray(values) || values.length === 0) throw new Error(`A radar needs at least one ${kind}.`);
  const ids = new Set();
  values.forEach(({ id, name, color }) => {
    if (!id || !name) throw new Error(`Each ${kind} needs an id and name.`);
    if (ids.has(id)) throw new Error(`Duplicate ${kind} id: ${id}.`);
    if (kind === 'slice' && (!color || (typeof CSS !== 'undefined' && !CSS.supports('color', color)))) throw new Error(`Slice ${id} needs a valid color.`);
    ids.add(id);
  });
  return ids;
};

export function validateRadar(data) {
  if (!data || !Array.isArray(data.bands) || !Array.isArray(data.slices) || !Array.isArray(data.items)) throw new Error('A radar needs bands, slices, and items arrays.');
  const bands = ensureUniqueNamed(data.bands, 'band');
  const slices = ensureUniqueNamed(data.slices, 'slice');
  const itemIds = new Set();
  data.items.forEach((item) => {
    if (!item.id || !item.name || !bands.has(item.band) || !slices.has(item.slice)) throw new Error(`Invalid item: ${item.id || item.name || 'unnamed'}.`);
    if (itemIds.has(item.id)) throw new Error(`Duplicate item id: ${item.id}.`);
    if (item.position && (!Number.isFinite(item.position.angle) || !Number.isFinite(item.position.radius))) throw new Error(`Invalid position for ${item.id}.`);
    itemIds.add(item.id);
  });
  return data;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const stableOffset = (id) => [...id].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 0) / 2 ** 32;

/** Convert the 2018 `{ radar, bands }` document into the public 2026 model. */
export function normalizeRadar(data) {
  if (Array.isArray(data?.bands)) return validateRadar(data);
  if (!Array.isArray(data?.radar) || !data?.bands || Array.isArray(data.bands)) return validateRadar(data);
  const palette = ['#ea1', '#00f', '#090', '#909', '#099', '#c00'];
  const bands = Object.entries(data.bands).sort(([, left], [, right]) => left.value - right.value).map(([id, band]) => ({ id, name: band.name }));
  const items = [];
  const slices = data.radar.map((segment, sliceIndex) => ({ id: `slice-${sliceIndex + 1}`, name: segment.name, color: palette[sliceIndex % palette.length] }));
  data.radar.forEach((segment, sliceIndex) => segment.points?.forEach((point, pointIndex) => {
    const id = `${segment.name}-${point.name}-${pointIndex}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    items.push({ id, name: point.name, slice: slices[sliceIndex].id, band: point.band, description: point.description });
  }));
  return validateRadar({ title: data.report?.name, bands, slices, items });
}

export function polarForItem(item, data, radius) {
  const sliceIndex = data.slices.findIndex(({ id }) => id === item.slice);
  const bandIndex = data.bands.findIndex(({ id }) => id === item.band);
  const sliceAngle = (Math.PI * 2) / data.slices.length;
  const angleOffset = clamp(item.position?.angle ?? (0.2 + stableOffset(item.id) * 0.6), 0.08, 0.92);
  const radiusOffset = clamp(item.position?.radius ?? 0.55, 0.15, 0.85);
  const angle = sliceIndex * sliceAngle + sliceAngle * angleOffset;
  const ring = radius * ((bandIndex + radiusOffset) / data.bands.length);
  return { x: Math.cos(angle) * ring, y: Math.sin(angle) * ring };
}

export function placementForPoint(x, y, data, radius) {
  const distance = Math.min(Math.hypot(x, y), radius - 1);
  const rawAngle = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
  const sliceIndex = Math.floor(rawAngle / ((Math.PI * 2) / data.slices.length));
  const bandIndex = Math.min(data.bands.length - 1, Math.floor((distance / radius) * data.bands.length));
  const sliceSize = (Math.PI * 2) / data.slices.length;
  const localAngle = (rawAngle - sliceIndex * sliceSize) / sliceSize;
  const localRadius = (distance / radius) * data.bands.length - bandIndex;
  return { slice: data.slices[sliceIndex].id, band: data.bands[bandIndex].id, position: { angle: clamp(localAngle, 0.08, 0.92), radius: clamp(localRadius, 0.15, 0.85) } };
}
