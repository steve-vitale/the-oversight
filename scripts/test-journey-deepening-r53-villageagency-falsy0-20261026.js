// test-journey-deepening-r53-villageagency-falsy0-20261026.js -- PROBE for
// journey-deepening r53 P3 (r52 out-of-scope observation): villageAgency.js
// lines 481 and 1324 use `v.x || 4` / `v.y || 4` for OTHER-VILLAGE map
// positions. genVillages() (game.js) places villages on the full 0..8 grid
// (only the Manhattan-<3 haven zone is excluded), so x=0 and y=0 are live
// coordinates, not "missing" — the same falsy-0 class as r51/r52, one hop
// further out. Each site is probed LIVE through the Game object:
//   A. _vaMakeSplinterVillage: a parent at x=0 must splinter to x=1 (not
//      5), a parent at y=0 must splinter at y=0 (not 4).
//   B. _vaRumorText: a village at (0,5) must be rumored "southwest" of
//      Haven (directionTo(4,4,0,5)), not "south" (directionTo(4,4,4,5)).
// Exits non-zero if any probe fails. Fix: `|| 4` -> `?? 4` at both sites.
// Usage: node scripts/test-journey-deepening-r53-villageagency-falsy0-20261026.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r53-va-falsy0-probe', fullTelemetry: true });
  await setupGame(Game);
  let failures = 0;
  const check = (label, actual, expected) => {
    const ok = actual === expected;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: got=${actual} want=${expected}`);
    if (!ok) failures++;
  };

  // ---- Site A: splinter placement -----------------------------------
  console.log('--- site A: _vaMakeSplinterVillage ---');
  const splinter = (x, y) => {
    try {
      const nv = Game._vaMakeSplinterVillage({ id: 'v_probe', name: 'Probeville', x, y }, ['a', 'b'], 'peaceful', 1000, 10);
      return nv;
    } catch (e) { return { err: String(e && e.message) }; }
  };
  const s1 = splinter(0, 5);
  check('A parent(0,5) splinter x', s1.x, 1);
  check('A parent(0,5) splinter y', s1.y, 5);
  const s2 = splinter(3, 0);
  check('A parent(3,0) splinter x', s2.x, 4);
  check('A parent(3,0) splinter y', s2.y, 0);
  const s3 = splinter(4, 4);
  check('A parent(4,4) splinter x (control)', s3.x, 5);
  check('A parent(4,4) splinter y (control)', s3.y, 4);

  // ---- Site B: rumor direction --------------------------------------
  console.log('--- site B: _vaRumorText direction ---');
  try {
    const t1 = Game._vaRumorText({ id: 'v_probe2', name: 'Testville', x: 0, y: 5 }, 'famine', false, {});
    console.log('B rumor (0,5): ' + t1);
    check('B village(0,5) rumored southwest', !!(t1 && t1.includes('southwest')), true);
    const t2 = Game._vaRumorText({ id: 'v_probe3', name: 'Testville', x: 5, y: 0 }, 'famine', false, {});
    console.log('B rumor (5,0): ' + t2);
    check('B village(5,0) rumored northeast', !!(t2 && t2.includes('northeast')), true);
  } catch (e) {
    console.log('PROBE-INCONCLUSIVE B: _vaRumorText threw: ' + (e && e.stack || e));
    failures++;
  }

  if (failures) { console.log(`RESULT: ${failures} FAILING PROBE(S) — falsy-0 bug confirmed at a villageAgency site`); process.exit(1); }
  console.log('RESULT: all villageAgency falsy-0 probes passed');
  process.exit(0);
})().catch(e => { console.error('PROOF ERROR', e && e.stack); process.exit(1); });
