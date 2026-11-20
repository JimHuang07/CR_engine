// Each outcome is an estimate supplied by a scenario or a future simulator.
function evaluate({ towerDamage, elixirSpent }) {
  return towerDamage + 100 * elixirSpent;
}

export function rankDefenses({ hand, nextCard, elixir, candidates }) {
  if (!Array.isArray(hand) || hand.length !== 4 ||
      new Set([...hand, nextCard]).size !== 5 ||
      [...hand, nextCard].some(card => typeof card !== 'string' || !card.trim()) ||
      !Number.isFinite(elixir) || elixir < 0 || elixir > 10 ||
      !Array.isArray(candidates)) {
    throw new Error('Expected four distinct hand cards, a distinct next card, 0–10 elixir, and candidates.');
  }

  const ranked = candidates.flatMap(({ label, plays, towerDamage }) => {
    if (typeof label !== 'string' || !label.trim() || !Array.isArray(plays) ||
        !Number.isFinite(towerDamage) || towerDamage < 0) {
      throw new Error('Each candidate needs a label, plays array, and nonnegative estimated tower damage.');
    }

    // Track only the known draw. A later unknown draw cannot unlock a card.
    const available = new Set(hand);
    let elixirSpent = 0;
    for (const [index, { card, cost }] of plays.entries()) {
      if (!Number.isInteger(cost) || cost < 1 || cost > 10 || typeof card !== 'string') {
        throw new Error('Each play needs a card and an integer cost from 1 to 10.');
      }
      elixirSpent += cost;
      if (!available.delete(card) || elixirSpent > elixir) return [];
      if (index === 0) available.add(nextCard);
    }

    const result = { label, plays, towerDamage, elixirSpent, elixirRemaining: elixir - elixirSpent };
    return [{ ...result, score: evaluate(result) }];
  });

  return ranked.sort((a, b) => a.score - b.score || a.towerDamage - b.towerDamage);
}
