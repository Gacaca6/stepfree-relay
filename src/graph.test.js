import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import init, { RelateDb } from '@relate/relate-wasm';
import { createTransitGraph } from './graph.js';

await init({ module_or_path: await readFile(new URL(import.meta.resolve('@relate/relate-wasm/relate_bg.wasm'))) });
const db = new RelateDb();
const graph = createTransitGraph(db);
after(() => db.free());

test('the 18-minute step-free baseline uses the Union and Civic elevators', () => {
  const { current, blockedBy, addedMinutes } = graph.compare('clinic', []);
  assert.equal(current.minutes, 18);
  assert.deepEqual(current.assets.filter(Boolean), ['UN-02', 'CV-03']);
  assert.deepEqual(blockedBy, []);
  assert.equal(addedMinutes, 0);
});

test('a Union outage routes via Riverside and identifies the broken connection', () => {
  const { current, blockedBy, addedMinutes } = graph.compare('clinic', ['UN-02']);
  assert.equal(current.minutes, 25);
  assert.equal(addedMinutes, 7);
  assert.deepEqual(current.assets.filter(Boolean), ['RV-01', 'CV-03']);
  assert.deepEqual(blockedBy, ['UN-02']);
});

test('a Civic outage ends clinic routing without offering stairs or blocking the library', () => {
  const result = graph.compare('clinic', ['CV-03']);
  assert.equal(result.current, undefined);
  assert.deepEqual(result.blockedBy, ['CV-03']);
  assert.equal(graph.compare('library', ['CV-03']).current.minutes, 14);
});
