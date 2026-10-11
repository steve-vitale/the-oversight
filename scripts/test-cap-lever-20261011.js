#!/usr/bin/env node
// PROOF TEST: perTypeCap 2 vs 3 semantics (longsim wave lever r2 2026-10-11,
// dial 1: perTypeCap breadth pressure).
//
// The question: is cap 2 vs 3 on the wave-2 (and wave-3) ledger the right
// call? The morning run measured cap 2 binding hard (54 w1 hits, 9 w2 per
// 20-run sweep) and called it honest, but wave-2 kill throughput is only
// ~1.9 kills/run. This test pins the EXACT scoring semantics at both caps
// (including the counter-kill clipping quirk: perType banks POINTS, so a
// counter-kill against 1 banked point adds only 1) and the breadth minimums
// (types needed to fill each bar) at cap 2 vs 3 — the design facts the
// sweep comparison then measures in the wild.
//
// Breadth facts (bar B, cap C -> min types = ceil(B/C)):
//   cap 2: w1 bar 5 -> 3 types | w2 bar 4 -> 2 | w3 bar 4 -> 2 | w4 bar 3 -> 2 | w5 bar 2 -> 1
//   cap 3: w1 bar 5 -> 2 types | w2 bar 4 -> 2 | w3 bar 4 -> 2 | w4 bar 3 -> 1 | w5 bar 2 -> 1
// So cap 3 preserves w2/w3 breadth (still needs 2 types) but WEAKENS w1
// (3->2 types) and w4 (2->1 type). The sweep decides whether the w2/w3
// throughput gain is worth it.
//
// Green: node scripts/test-cap-lever-20261011.js
'use strict';
const H = require('./sim-harness.js');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

(async () => {
  const { Game } = await H.loadGame({ seed: 20261011 });
  await H.setupGame(Game);
  Game.say = function () {}; Game.sysSay = function () {};
  console.log('== PERTYPECAP 2 vs 3 — SEMANTICS PROOF ==');

  const w2 = Game.data.monsters.filter(m => (m.wave || 1) === 2).map(m => m.id);
  const w1 = Game.data.monsters.filter(m => (m.wave || 1) === 1).map(m => m.id);
  ok('rosters non-empty', w2.length >= 3 && w1.length >= 3);
  const reset = () => { Game.state.waveLedger = null; Game.ledgerState(); Game.state.monsterCounters = {}; };
  const pts = (w) => Game.waveLedgerPoints(w);

  // --- cap 2 (current JSON): 3rd kill of a type scores 0 ---
  Game.data.waveLedger.perTypeCap = 2;
  ok('cfg reads cap 2', Game.waveLedgerCfg().perTypeCap === 2);
  reset();
  const a2 = [Game.scoreLedgerKill(w2[0]), Game.scoreLedgerKill(w2[0]), Game.scoreLedgerKill(w2[0])];
  ok('cap 2: kill sequence scores [1,1,0]', JSON.stringify(a2) === '[1,1,0]', JSON.stringify(a2));
  ok('cap 2: one type banks exactly 2', pts(2) === 2, String(pts(2)));
  // counter-kill clipping: plain (1pt banked) then counter-kill (+2 nominal) -> +1 only
  reset();
  Game.scoreLedgerKill(w2[1]); // +1
  Game.state.monsterCounters[w2[1]] = true; // counter now known
  const clip = Game.scoreLedgerKill(w2[1]); // nominally +2, room is 1
  ok('cap 2: counter-kill against 1 banked point adds only 1 (points-banked quirk)',
    clip === 1 && pts(2) === 2, `add=${clip} total=${pts(2)}`);
  // counter-kill first: full 2 in one kill, type exhausted
  reset();
  Game.state.monsterCounters[w2[2]] = true;
  const ck = [Game.scoreLedgerKill(w2[2]), Game.scoreLedgerKill(w2[2])];
  ok('cap 2: counter-kill first scores 2, next kill 0', JSON.stringify(ck) === '[2,0]', JSON.stringify(ck));

  // --- cap 3: 3rd kill scores, 4th does not ---
  Game.data.waveLedger.perTypeCap = 3;
  ok('cfg reads cap 3', Game.waveLedgerCfg().perTypeCap === 3);
  reset();
  const a3 = [Game.scoreLedgerKill(w2[0]), Game.scoreLedgerKill(w2[0]), Game.scoreLedgerKill(w2[0]), Game.scoreLedgerKill(w2[0])];
  ok('cap 3: kill sequence scores [1,1,1,0]', JSON.stringify(a3) === '[1,1,1,0]', JSON.stringify(a3));
  ok('cap 3: one type banks exactly 3', pts(2) === 3, String(pts(2)));
  reset();
  Game.state.monsterCounters[w2[1]] = true;
  const c3 = [Game.scoreLedgerKill(w2[1]), Game.scoreLedgerKill(w2[1]), Game.scoreLedgerKill(w2[1])];
  ok('cap 3: counter-kill(2) + plain(1) = 3, then 0', JSON.stringify(c3) === '[2,1,0]', JSON.stringify(c3));

  // --- breadth minimums at each cap (pure, from cfg bars) ---
  const bars = Game.waveLedgerCfg().barsPerWave;
  const minTypes = (bar, cap) => Math.ceil(bar / cap);
  const b2 = { 1: minTypes(bars[1], 2), 2: minTypes(bars[2], 2), 3: minTypes(bars[3], 2), 4: minTypes(bars[4], 2), 5: minTypes(bars[5], 2) };
  const b3 = { 1: minTypes(bars[1], 3), 2: minTypes(bars[2], 3), 3: minTypes(bars[3], 3), 4: minTypes(bars[4], 3), 5: minTypes(bars[5], 3) };
  ok('cap 2 breadth minimums {w1:3,w2:2,w3:2,w4:2,w5:1}', JSON.stringify(b2) === '{"1":3,"2":2,"3":2,"4":2,"5":1}', JSON.stringify(b2));
  ok('cap 3 breadth minimums {w1:2,w2:2,w3:2,w4:1,w5:1}', JSON.stringify(b3) === '{"1":2,"2":2,"3":2,"4":1,"5":1}', JSON.stringify(b3));
  ok('cap 3 preserves w2/w3 breadth (>=2 types)', b3[2] >= 2 && b3[3] >= 2);
  ok('cap 3 weakens w1 breadth (3->2 types) — documented tradeoff', b3[1] === 2 && b2[1] === 3);
  ok('cap 3 weakens w4 breadth (2->1 type) — documented tradeoff', b3[4] === 1 && b2[4] === 2);

  // restore JSON value (2) so the unit run leaves no trace
  Game.data.waveLedger.perTypeCap = 2;

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
