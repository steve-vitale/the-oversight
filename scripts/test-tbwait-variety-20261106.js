// scripts/test-tbwait-variety-20261106.js — proof test for journey-endgame
// r147, Fix B volume (r144 carry-forward, question 6).
//
// BUG (r144 pilot): the r143 Fix B narrated wait ("<name> holds and
// watches.") fired 547x on seed 89701, clustering in threes — one fixed
// line repeated until it read as a stuck record. The wait is narrated
// (canon: no silent actions) but the wording never varies.
//   FIX (game.js tbVillagerTurn + tbVillagerWaitLine): the hold line
// rotates through a fixed set of 5, picked by a transient fight-level
// counter (f._waitCount), so consecutive waits in one fight never read
// the same line twice. Deterministic, no RNG, no mechanics change. The
// first line stays "holds and watches" — the r143 Fix B proof
// (test-ruth-wait-v1a-r143 Part C) asserts a fresh fight's first wait
// says exactly that.
// GREEN means:
//   (1) 12 forced waits in one fight all narrate (no silent wait);
//   (2) no two consecutive hold lines are identical;
//   (3) all 5 lines are reached across the 12 waits;
//   (4) the first wait says "holds and watches" (r143 compatibility);
//   (5) no line monopolizes: the first line appears at most ceil(12/5)
//       times across the 12 waits;
//   (6) the rotation is per-fight: a fresh fight object starts at line 0.
// Usage: node scripts/test-tbwait-variety-20261106.js
'use strict';
const assert = require('assert');
const L = require('./godpath/lib.js');

const HOLD_RES = [
  /holds and watches/,
  /waits, eyes on the beast/,
  /holds position, watching for an opening/,
  /stands ready, watching/,
  /keeps their distance and watches/,
];
function holdIndex(line) {
  for (let i = 0; i < HOLD_RES.length; i++) if (HOLD_RES[i].test(line)) return i;
  return -1;
}

(async () => {
  // ---- Direct unit check: the rotation method on a bare fight object.
  const Gu = await L.load({ seed: 99102 });
  L.newRun(Gu, 'Columbus, Ohio');
  Gu.tbfight = {};
  const direct = [];
  for (let i = 0; i < 6; i++) direct.push(Gu.tbVillagerWaitLine({ name: 'Test' }));
  console.log('direct rotation:', JSON.stringify(direct));
  assert.strictEqual(direct[0], 'Test holds and watches.', 'rotation must start at line 0 on a fresh fight');
  assert.strictEqual(direct[1], 'Test waits, eyes on the beast.', 'rotation must advance to line 1');
  assert.strictEqual(direct[5], 'Test holds and watches.', 'rotation must wrap after 5 lines');
  for (let i = 1; i < direct.length; i++) assert.notStrictEqual(direct[i], direct[i - 1], 'adjacent direct lines must differ');
  // Fresh fight object restarts the rotation.
  Gu.tbfight = {};
  assert.strictEqual(Gu.tbVillagerWaitLine({ name: 'Test' }), 'Test holds and watches.', 'a new fight must restart the rotation at line 0');

  // ---- Live turn check: 12 forced waits in one field fight.
  const Game2 = await L.load({ seed: 99101 });
  L.newRun(Game2, 'Columbus, Ohio');
  L.fight(Game2, 'hummice', { party: true });
  assert.ok(Game2.tbfight && !Game2.tbfight.over, 'field fight must be live');
  const fighters = Game2.tbfight.fighters || [];
  const vill = fighters.find(f => f.kind === 'villager' && f.alive);
  assert.ok(vill, 'a living villager fighter must exist');
  const foe = fighters.find(f => f.kind === 'monster' && f.alive);
  assert.ok(foe, 'a living monster fighter must exist');
  const p2 = Game2.tbFighter('p');
  // Isolate the decide path: cautious, full HP, no abilities (villagerId
  // null skips the ability/field-medicine hooks), far from the foe.
  vill.ai = 'cautious';
  vill.villagerId = null;
  if (p2) { p2.hp = p2.maxHp; }
  const lines = L.captureSays(Game2);
  const holdLines = [];
  for (let i = 0; i < 12; i++) {
    vill.hp = vill.maxHp;
    vill.mx = 0; vill.my = 0;
    foe.mx = 7; foe.my = 4;
    if (p2) { p2.hp = p2.maxHp; }
    const before = lines.length;
    Game2.tbVillagerTurn(vill);
    const fresh = lines.slice(before);
    const hold = fresh.find(l => holdIndex(String(l)) >= 0);
    assert.ok(hold, `wait ${i + 1} must narrate a hold line (got: ${JSON.stringify(fresh)})`);
    holdLines.push(String(hold));
  }
  lines.restore();
  console.log('hold lines:', JSON.stringify(holdLines));
  assert.strictEqual(holdLines.length, 12, 'all 12 waits must narrate');
  assert.ok(holdLines[0].indexOf('holds and watches') >= 0, 'first wait must say "holds and watches" (r143 compatibility)');
  for (let i = 1; i < holdLines.length; i++) {
    assert.notStrictEqual(holdLines[i], holdLines[i - 1], `consecutive hold lines must differ (waits ${i} and ${i + 1} both: ${holdLines[i]})`);
  }
  const seen = new Set(holdLines.map(holdIndex));
  assert.strictEqual(seen.size, 5, `all 5 hold lines must be reached (saw ${[...seen].sort().join(',')})`);
  const firstCount = holdLines.filter(l => l.indexOf('holds and watches') >= 0).length;
  assert.ok(firstCount <= 3, `first line must not monopolize (appeared ${firstCount}x in 12 waits, max 3)`);
  console.log('PASS test-tbwait-variety-20261106');
  process.exit(0);
})().catch(e => { console.error('FAIL test-tbwait-variety-20261106:', e && e.message); process.exit(1); });
