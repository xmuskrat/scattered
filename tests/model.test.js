import test from 'node:test';
import assert from 'node:assert/strict';
import { placementFromKey } from '../src/interactions.js';
import { normalizeRadar, placementForPoint, validateRadar } from '../src/model.js';

const data = { bands: [{ id: 'near', name: 'Near' }, { id: 'far', name: 'Far' }], slices: [{ id: 'east', name: 'East', color: '#123456' }, { id: 'west', name: 'West', color: '#abcdef' }], items: [{ id: 'one', name: 'One', band: 'near', slice: 'east' }] };
test('validates a complete radar', () => assert.equal(validateRadar(data), data));
test('rejects items outside the schema', () => assert.throws(() => validateRadar({ ...data, items: [{ id: 'bad', name: 'Bad', band: 'missing', slice: 'east' }] })));
test('maps a point to its slice, band, and durable in-cell position', () => {
  const placement = placementForPoint(-80, 0, data, 100);
  assert.equal(placement.slice, 'west');
  assert.equal(placement.band, 'far');
  assert.ok(placement.position.angle >= 0.08 && placement.position.angle <= 0.92);
});
test('accepts the original radar document shape', () => {
  const radar = normalizeRadar({ radar: [{ name: 'One', points: [{ name: 'Item', band: 'near' }] }], bands: { near: { value: 1, name: 'Near' } } });
  assert.deepEqual(radar.items[0].band, 'near');
  assert.equal(radar.slices[0].name, 'One');
});

test('moves a focused item with arrow keys and wraps across slices', () => {
  const item = data.items[0];
  assert.equal(placementFromKey(item, 'ArrowRight', data).slice, 'west');
  assert.equal(placementFromKey({ ...item, slice: 'west' }, 'ArrowRight', data).slice, 'east');
  assert.equal(placementFromKey(item, 'ArrowLeft', data).slice, 'west');
  assert.equal(placementFromKey(item, 'ArrowDown', data).band, 'far');
  assert.equal(placementFromKey(item, 'ArrowUp', data).band, 'near');
});

test('supports WASD shortcuts and keeps movement inside the available bands', () => {
  const item = data.items[0];
  assert.equal(placementFromKey(item, 'd', data).slice, 'west');
  assert.equal(placementFromKey(item, 'A', data).slice, 'west');
  assert.equal(placementFromKey(item, 's', data).band, 'far');
  assert.equal(placementFromKey(item, 'W', data).band, 'near');
  assert.equal(placementFromKey({ ...item, band: 'far' }, 's', data).band, 'far');
  assert.equal(placementFromKey(item, 'x', data), null);
});
