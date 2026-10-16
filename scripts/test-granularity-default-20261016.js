// Proof: pantry granularity default — depositPantryPieces splits slabs,
// passes small pieces through, preserves fields, merges stacks.
// Steve 2026-10-16: "make this default behavior" — closes the haul/donation
// leak that bypassed the Oct-8 granular-pieces ruling.
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../src/js/game.js'), 'utf8');

// Extract the depositPantryPieces method source (balanced braces).
const startMark = 'depositPantryPieces(v, src, pieceKcal) {';
const startIdx = src.indexOf(startMark);
if (startIdx < 0) { console.error('FAIL: method not found'); process.exit(1); }
let depth = 0, endIdx = -1;
const bodyStart = src.indexOf('{', startIdx);
for (let i = bodyStart; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
}
const methodSrc = src.slice(startIdx, endIdx);
// Simplified stacksMatch for the test: name + kcalEach + spoilDay + foodKind.
const game = {
  stacksMatch(a, b) {
    return a && b && (a.name || '') === (b.name || '') &&
      Number(a.kcalEach) === Number(b.kcalEach) &&
      Number(a.spoilDay) === Number(b.spoilDay) &&
      (a.foodKind || '') === (b.foodKind || '');
  },
};
game.depositPantryPieces = eval('(' + 'function ' + methodSrc + ')');

let pass = 0, fail = 0;
const eq = (a, b, msg) => {
  if (JSON.stringify(a) === JSON.stringify(b)) { pass++; }
  else { fail++; console.error(`FAIL ${msg}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`); }
};

// 1. Slab splits: 2813 x2 -> pieces <= 500, total preserved.
{
  const v = { pantry: [] };
  const got = game.depositPantryPieces.call(game, v, {
    name: 'Haunch', kcalEach: 2813, units: 2, spoilDay: 10, foodKind: 'meat', kg: 2.5,
  }, 500);
  eq(got, 5626, 'slab total deposited');
  const maxPiece = Math.max(...v.pantry.map(p => p.kcalEach));
  eq(maxPiece <= 500, true, 'slab max piece <= 500');
  const total = v.pantry.reduce((t, p) => t + p.kcalEach * p.units, 0);
  eq(total, 5626, 'slab pantry total');
  eq(v.pantry.every(p => p.spoilDay === 10 && p.foodKind === 'meat'), true, 'slab fields preserved');
  const kgTotal = v.pantry.reduce((t, p) => t + p.kg * p.units, 0);
  eq(Math.abs(kgTotal - 5.0) < 0.05, true, 'slab weight preserved');
}

// 2. Small pieces pass through unchanged (never recombined upward).
{
  const v = { pantry: [] };
  game.depositPantryPieces.call(game, v, {
    name: 'Strip', kcalEach: 400, units: 3, spoilDay: 12, foodKind: 'meat', kg: 0.3,
  }, 500);
  eq(v.pantry.length, 1, 'small pieces one stack');
  eq(v.pantry[0].kcalEach, 400, 'small kcalEach kept');
  eq(v.pantry[0].units, 3, 'small units kept');
}

// 3. Exact-cap piece: 500 x1 -> single 500 piece.
{
  const v = { pantry: [] };
  game.depositPantryPieces.call(game, v, { name: 'Cut', kcalEach: 500, units: 1, spoilDay: 5 }, 500);
  eq(v.pantry.length, 1, 'cap piece one stack');
  eq(v.pantry[0].kcalEach, 500, 'cap kcalEach');
}

// 4. Stacks merge: two identical deposits merge into one stack.
{
  const v = { pantry: [] };
  const item = { name: 'Strip', kcalEach: 400, units: 2, spoilDay: 12, foodKind: 'meat' };
  game.depositPantryPieces.call(game, v, item, 500);
  game.depositPantryPieces.call(game, v, item, 500);
  eq(v.pantry.length, 1, 'merged one stack');
  eq(v.pantry[0].units, 4, 'merged units');
}

// 5. Different spoilDays do not merge.
{
  const v = { pantry: [] };
  game.depositPantryPieces.call(game, v, { name: 'Strip', kcalEach: 400, units: 1, spoilDay: 12 }, 500);
  game.depositPantryPieces.call(game, v, { name: 'Strip', kcalEach: 400, units: 1, spoilDay: 15 }, 500);
  eq(v.pantry.length, 2, 'spoilDay split stacks');
}

// 6. Zero/empty input is a no-op.
{
  const v = { pantry: [] };
  eq(game.depositPantryPieces.call(game, v, { name: 'Air', kcalEach: 0, units: 5 }, 500), 0, 'zero kcal no-op');
  eq(v.pantry.length, 0, 'zero kcal no pantry change');
}

// 7. pantryKcal counter synced.
{
  const v = { pantry: [] };
  game.depositPantryPieces.call(game, v, { name: 'Haunch', kcalEach: 1200, units: 1, spoilDay: 9 }, 500);
  eq(v.pantryKcal, 1200, 'pantryKcal synced');
  const maxPiece = Math.max(...v.pantry.map(p => p.kcalEach));
  eq(maxPiece <= 500, true, 'no piece over cap');
}

console.log(fail === 0 ? `GREEN: granularity default behaves (${pass} assertions)` : `RED: ${fail} failures`);
process.exit(fail === 0 ? 0 : 1);
