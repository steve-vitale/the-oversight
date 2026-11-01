'use strict';
// sim-heraldplace-a-lib — pure helpers shared by the heraldplace sweep
// and its proof test. NO game state, NO IO.
function manhattan(a, b) {
  if (!a || !b) return null;
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function chebyshev(a, b) {
  if (!a || !b) return null;
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
// Step classification vs one target tile: approach / retreat /
// lateral / sit. from/to are tiles or null (absent).
function stepClass(from, to, target) {
  if (!from || !to) return 'absent';
  if (from.x === to.x && from.y === to.y) return 'sit';
  if (!target) return 'lateral';
  const d0 = manhattan(from, target), d1 = manhattan(to, target);
  if (d1 < d0) return 'approach';
  if (d1 > d0) return 'retreat';
  return 'lateral';
}
// Day classification from dawn-to-dawn herald tiles + contact flag.
// prev/cur are tiles or null; contact is boolean.
function dayClass(prev, cur, contact, scholarTile) {
  if (contact) return 'CONTACT';
  if (!cur) return 'ABSENT';
  if (!prev) return 'WANDER'; // appeared without a previous dawn tile (placement day itself is PLACEMENT, handled by caller)
  if (prev.x === cur.x && prev.y === cur.y) return 'SIT';
  if (!scholarTile) return 'WANDER';
  const d0 = manhattan(prev, scholarTile), d1 = manhattan(cur, scholarTile);
  return (d1 < d0) ? 'APPROACH' : 'WANDER';
}
module.exports = { manhattan, chebyshev, stepClass, dayClass };
