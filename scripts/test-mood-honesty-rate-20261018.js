// test-mood-honesty-rate-20261018.js — proof for the journey-deepening r13
// CENSUS-RATE fix.
//
// FINDING: the r12 sign fix (company satisfies, -8 both lingerers) was right
// but rate-starved. tickNeeds accrues +6/part = +24/day, while the 50% linger
// lottery fired ~0.8x/day in the r13 audits — communally-embedded villagers
// (8 shared meals/10d, trust 90) still pinned at social=94-100 and read
// 'lonely'. The instrument stayed coarse at census scale.
//
// FIX: logSitting — company always counts when the fire is shared (no 50%
// lottery), and one shared lingering meal satisfies more than a day of
// accrual (-32 > +24/day). Villagers who eat together daily drain toward
// honest-steady; villagers who eat alone still climb to honest-lonely.
//
// This test: (a) unit — one shared sitting moves both lingerers 80 -> 48;
// (b) economy — 10 days of 1 shared sitting/day against real tickNeeds
// accrual ends under the lonely line; (c) isolation — 10 days with no shared
// sittings ends over the lonely line (honestly lonely).
// RED on the r12 code (unit: 80 -> 72 not 48; economy: +24-8 = +16/day,
// stays pinned at 100 — the census skew the audits measured).
// Usage: node scripts/test-mood-honesty-rate-20261018.js
'use strict';
const assert = require('assert');

async function main() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 4242, mode: 'mood-honesty-rate-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 2, 'need 2+ villagers');
  const [a, b] = roster;
  const _rnd = Math.random;
  Math.random = () => 0; // deterministic co-eater pick (only one other present)

  // ---- (a) unit: one shared sitting satisfies a full day and more ----
  Game.npcNeeds(a).social = 80; Game.npcNeeds(b).social = 80;
  v.mealLog = [{ vid: b, part: 'dusk', place: 'haven' }];
  v.away = {};
  Game.logSitting(v, a, 'dusk');
  const nA1 = Game.npcNeeds(a).social, nB1 = Game.npcNeeds(b).social;
  console.log(`shared sitting: A 80 -> ${nA1}, B 80 -> ${nB1}`);
  assert(nA1 === 48, `FAIL(a1): one shared sitting should move 80 -> 48 (got ${nA1})`);
  assert(nB1 === 48, `FAIL(a2): co-eater should move 80 -> 48 (got ${nB1})`);

  // ---- (b) economy: daily company drains the need against real accrual ----
  Game.npcNeeds(a).social = 100; Game.npcNeeds(b).social = 100;
  for (let day = 0; day < 10; day++) {
    for (let part = 0; part < 4; part++) Game.tickNeeds(); // +24/day real path
    v.mealLog = [{ vid: b, part: 'dusk', place: 'haven' }];
    v.away = {};
    Game.logSitting(v, a, 'dusk'); // one shared lingering meal
  }
  const sA = Game.npcNeeds(a).social, sB = Game.npcNeeds(b).social;
  console.log(`10d 1 shared meal/day: A 100 -> ${sA} (${Game.npcMood(a)}), B 100 -> ${sB} (${Game.npcMood(b)})`);
  assert(sA < 78, `FAIL(b1): daily company should end under the lonely line (got ${sA})`);
  assert(sB < 78, `FAIL(b2): co-eater should end under the lonely line (got ${sB})`);

  // ---- (c) isolation: no company still climbs to honestly-lonely ----
  const { Game: G2 } = await loadGame({ seed: 4243, mode: 'mood-honesty-rate-proof2', fullTelemetry: true });
  await setupGame(G2);
  const v2 = G2.state.village;
  const r2 = (v2.roster || []).filter(id => id !== G2.villagerId);
  const [c] = r2;
  G2.npcNeeds(c).social = 0;
  for (let day = 0; day < 10; day++) {
    for (let part = 0; part < 4; part++) G2.tickNeeds();
    // no logSitting: this villager eats alone
  }
  const sC = G2.npcNeeds(c).social;
  console.log(`10d alone: C 0 -> ${sC} (${G2.npcMood(c)})`);
  assert(sC > 78, `FAIL(c): eating alone 10 days should read honestly lonely (got ${sC})`);

  Math.random = _rnd;
  console.log('\nALL MOOD-HONESTY-RATE PROOF ASSERTIONS PASSED');
}

main().catch(e => { console.error('PROOF FAILED:', e.message); process.exit(1); });
