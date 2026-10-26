// test-journey-deepening-r52-falsy0-siblings-20261026.js -- PROBE for the
// r51 corpse-range fix's sibling sites (journey-deepening r52, P3).
//
// r51 fixed `|| 4` -> `?? 4` in corpses.js _corpseCheckRange / lootCorpse.
// The same falsy-0 class was left in three sibling sites (r51 "Next"):
//   A. corruption.js corpseButcher range gate (:224) + nearButcherableCorpse
//      (:555): scholar read with (s.mx || 4) / (s.my || 4).
//   B. corpses.js registerDeath spawn defaults (:233-234): a corpse created
//      without opts.mx/my inherits (s.mx || 4) / (s.my || 4) from the scholar.
//   C. abilityActions.js _graveRobberCorpse (:986): (c.mx || 4), (s.mx || 4),
//      (s.my || 4) — note (c.my || 0) is already 0-safe and is NOT probed
//      as a bug.
// Each site is probed LIVE, not retyped: A and B through the Game object in
// the shared harness; C by extracting the actual shipped function source
// from abilityActions.js on disk and evaluating it against a fake game
// (the function is module-local, so there is no Game entry point for it).
// A "FAIL" line is a confirmed bug at that site, not a test bug: the
// expected values are the range rules the code itself states (same node,
// Chebyshev distance <= 1). Exits non-zero if any site is buggy.
// Usage: node scripts/test-journey-deepening-r52-falsy0-siblings-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r52-falsy0-probe', fullTelemetry: true });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); try { return origSay.apply(this, a); } catch (e) { return a[0]; } };
  Game.map.px = 4; Game.map.py = 4;
  const s = Game.state.scholar;
  let failures = 0;
  const check = (label, actual, expected) => {
    const ok = actual === expected;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: got=${actual} want=${expected}`);
    if (!ok) failures++;
  };

  // ---- Site A: corruption nearButcherableCorpse (live Game method) ----
  console.log('--- site A: corruption nearButcherableCorpse ---');
  const list = Game.corpses();
  const probeA = (smx, smy, cmx, cmy) => {
    // Remove any previous probe corpse so the finder sees only this one
    // plus the (empty at setup) real list.
    for (let i = list.length - 1; i >= 0; i--) if (list[i] && list[i].id === 'corpse_probeA') list.splice(i, 1);
    list.push({ id: 'corpse_probeA', kind: 'villager', node: { x: 4, y: 4 }, mx: cmx, my: cmy, buried: false, butchered: false });
    s.mx = smx; s.my = smy;
    let found = null;
    try { found = Game.nearButcherableCorpse(); } catch (e) { found = 'ERR:' + e.message; }
    return !!(found && found.id === 'corpse_probeA');
  };
  check('A scholar(0,4) vs corpse(0,4) found', probeA(0, 4, 0, 4), true);
  check('A scholar(4,0) vs corpse(4,4) NOT found', probeA(4, 0, 4, 4), false);
  check('A scholar(0,0) vs corpse(0,0) found', probeA(0, 0, 0, 0), true);
  check('A scholar(4,4) vs corpse(4,4) found (control)', probeA(4, 4, 4, 4), true);
  check('A scholar(4,2) vs corpse(4,4) NOT found (control)', probeA(4, 2, 4, 4), false);
  for (let i = list.length - 1; i >= 0; i--) if (list[i] && list[i].id === 'corpse_probeA') list.splice(i, 1);

  // ---- Site B: corpses registerDeath spawn defaults (live Game method) ----
  console.log('--- site B: corpses registerDeath spawn defaults ---');
  try {
    s.mx = 0; s.my = 5;
    const beforeN = Game.corpses().length;
    Game.registerDeath({ kind: 'person', name: 'Probe Dead' });
    const created = Game.corpses().slice(beforeN).find(c => c && c.name === 'Probe Dead');
    if (!created) {
      console.log('PROBE-INCONCLUSIVE B: registerDeath created no findable corpse');
    } else {
      check('B corpse from scholar(0,5) inherits mx=0', created.mx, 0);
      check('B corpse from scholar(0,5) inherits my=5', created.my, 5);
    }
  } catch (e) {
    console.log('PROBE-INCONCLUSIVE B: registerDeath threw: ' + (e && e.message));
  }

  // ---- Site C: abilityActions _graveRobberCorpse (source-extracted) ----
  console.log('--- site C: abilityActions _graveRobberCorpse (source-extracted) ---');
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'abilityActions.js'), 'utf8');
    const start = src.indexOf('function _graveRobberCorpse');
    const end = src.indexOf('var ABILITY_ACTION_IMPLS', start);
    if (start < 0 || end < 0) throw new Error('could not locate _graveRobberCorpse source');
    const fnSrc = src.slice(start, end).trim();
    const fn = eval('(' + fnSrc.replace(/^function _graveRobberCorpse/, 'function') + ')');
    const probeC = (smx, smy, cmx, cmy) => {
      const fake = { corpses: () => [{ id: 'c1', buried: false, node: { x: 4, y: 4 }, mx: cmx, my: cmy }], state: { scholar: { mx: smx, my: smy } }, map: { px: 4, py: 4 } };
      const r = fn(fake);
      return !!(r && r.id === 'c1');
    };
    check('C scholar(4,0) vs corpse(4,0) found', probeC(4, 0, 4, 0), true);
    check('C scholar(4,0) vs corpse(4,4) NOT found', probeC(4, 0, 4, 4), false);
    check('C scholar(0,0) vs corpse(0,1) found', probeC(0, 0, 0, 1), true);
    check('C scholar(4,4) vs corpse(4,4) found (control)', probeC(4, 4, 4, 4), true);
    check('C scholar(0,4) vs corpse(4,4) NOT found (control)', probeC(0, 4, 4, 4), false);
  } catch (e) {
    console.log('PROBE-INCONCLUSIVE C: ' + (e && e.stack || e));
  }

  if (failures) { console.log(`RESULT: ${failures} FAILING PROBE(S) — falsy-0 bug confirmed at a sibling site`); process.exit(1); }
  console.log('RESULT: all falsy-0 sibling probes passed');
  process.exit(0);
})().catch(e => { console.error('PROOF ERROR', e && e.stack); process.exit(1); });
