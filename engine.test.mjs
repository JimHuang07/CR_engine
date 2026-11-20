import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { rankDefenses } from './engine.mjs';

const example = JSON.parse(readFileSync(new URL('./example.json', import.meta.url), 'utf8'));

test('ranks legal sequences, including the known draw and the option to hold', () => {
  const ranked = rankDefenses(example);
  assert.deepEqual(ranked.map(result => result.label), [
    'Skeletons into Knight', 'Cannon', 'Hold elixir'
  ]);
  assert.equal(ranked[0].elixirRemaining, 0);
  assert.equal(ranked[0].score, 400);
});

test('excludes a card that has already been played and a sequence over budget', () => {
  const repeat = { label: 'Repeat', plays: Array(2).fill({ card: 'Skeletons', cost: 1 }), towerDamage: 0 };
  const ranked = rankDefenses({ ...example, elixir: 3, candidates: [...example.candidates, repeat] });
  assert.deepEqual(ranked.map(result => result.label), ['Cannon', 'Hold elixir']);
});

test('rejects a next card already in hand', () => {
  assert.throws(() => rankDefenses({ ...example, nextCard: 'Cannon' }));
});
