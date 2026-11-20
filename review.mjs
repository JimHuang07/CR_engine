import { readFile } from 'node:fs/promises';
import { rankDefenses } from './engine.mjs';

try {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: node review.mjs <scenario.json>');
  const scenario = JSON.parse(await readFile(input, 'utf8'));
  console.log(JSON.stringify(rankDefenses(scenario), null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
