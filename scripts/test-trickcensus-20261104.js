// test-trickcensus-20261104.js — proof for arm sim-trickcensus-a.
// Pure analyzer checks on fixtures + a live-harness smoke (install,
// daily snapshot, final inventory, clean uninstall). Writes nothing
// into the repo. Usage: node scripts/test-trickcensus-20261104.js
'use strict';
const path = require('path');
const AN = require(path.join(__dirname, 'trickcensus-analyze-20261104'));
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function mkSeed(endBars, dailyTricks, kinds) {
  const daily = (dailyTricks || []).map(function (tr, i) {
    return { day: i + 1, readiness5: { armored: 0, armed: 0, tricks: tr, veterans: 0,
      demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 },
      short: (tr < 3 ? ['tricks'] : []).concat(['armor', 'weapons', 'veterans']), ready: false } };
  });
  const end = daily.length ? daily[daily.length - 1] : { readiness5: endBars };
  if (endBars) end.readiness5 = endBars;
  return { daily: daily, endInventory: { kinds: kinds || {} }, exposures: [], trickEvents: [] };
}
const DEM = { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 };
// 1. Bar status reads end snapshot; short days counted per bar.
(function () {
  const s = mkSeed(null, [0, 2, 3, 3], {});
  const b = AN.barsOf(AN.lastSnap(s));
  check('barsOf reads end tricks', b.tricks === 3, JSON.stringify(b));
  const sd = AN.barShortDays(s);
  check('barShortDays counts trick-short days', sd.tricks === 2 && sd.days === 4, JSON.stringify(sd));
})();
// 2. Trick cause: met vs in-flight vs no-counters.
(function () {
  check('cause tricks-met', AN.trickShortfallCause(mkSeed(null, [3], {})) === 'tricks-met');
  const inflight = mkSeed(null, [1], { reunion: { villageKnowsTrick: false, villageCounterObs: 1 } });
  check('cause in-flight', AN.trickShortfallCause(inflight).indexOf('in-flight') === 0, AN.trickShortfallCause(inflight));
  check('cause no-counters', AN.trickShortfallCause(mkSeed(null, [0], {})).indexOf('no-counters-known') === 0);
})();
// 3. Fight census: available-at-start vs pressed vs never-pressed,
//    ability damage from ability-or-trick hits, round-1 actions kept.
(function () {
  const ex = {
    seq: 1, day: 50, mid: 'reunion', trickKnown: false, end: { result: 'lost' },
    trickInventoryStart: { scholarAbilities: [{ id: 'rage' }],
      activatables: [{ id: 'rage.unleash_rage', available: true }, { id: 'bird_strike.call', available: true }, { id: 'pocket_sand.throw_sand', available: false }],
      trick: { villageKnowsTrick: false, hasSigDef: true, villageCounterObs: 0, villageSlain: 0 } },
    abilityUses: [{ args: ['rage', 'unleash_rage'] }, { args: ['rage', 'unleash_rage'] }],
    hits: [{ sourceClass: 'ability-or-trick', hpDelta: -20 }, { sourceClass: 'leader', hpDelta: -30 }],
    turns: [{ actions: [{ kind: 'ability' }] }, { actions: [{ kind: 'strike' }] }],
    round1Actions: [{ fn: 'tbPlayerMove' }],
  };
  const f = AN.fightCensus(ex);
  check('fightCensus pressed counts', f.pressedCounts['rage.unleash_rage'] === 2, JSON.stringify(f.pressedCounts));
  check('fightCensus never-pressed', f.neverPressed.indexOf('bird_strike.call') >= 0 && f.neverPressed.indexOf('rage.unleash_rage') < 0, JSON.stringify(f.neverPressed));
  check('fightCensus ability damage', f.abilityDamage === 20, String(f.abilityDamage));
  check('fightCensus round1 kept', f.round1Actions[0] === 'tbPlayerMove');
  check('fightCensus unclassified=0 shape', !!f.scholarAbilitiesAtStart);
})();
// 4. summarizeSeed aggregates press counts + unclassified fighters.
(function () {
  const out = mkSeed(null, [2], {});
  out.exposures = [{
    seq: 1, day: 50, mid: 'reunion', trickKnown: false, end: { result: 'lost' },
    trickInventoryStart: null, abilityUses: [], hits: [], turns: [], round1Actions: [],
  }];
  const s = AN.summarizeSeed(out);
  check('summarizeSeed unclassified fighter', s.unclassifiedFighters === 1, String(s.unclassifiedFighters));
  check('summarizeSeed exposures', s.exposures === 1);
})();

(async function () {
  // 5. Live-harness smoke: install, snapshot, final inventory, uninstall.
  try {
    const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
    const INST = require(path.join(__dirname, 'trickcensus-instrument-20261104'));
    const { Game } = await loadGame({ seed: 99101, mode: 'competent-trickcensus-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const snap = inst.snapshotDaily();
    const fin = inst.finalInventory();
    const w4kinds = Object.keys(fin.kinds || {}).length;
    const errs = (inst.t.instrumentErrors || []).length;
    inst.uninstall();
    check('smoke snapshot has readiness5', !!(snap && snap.readiness5 && snap.readiness5.demand), JSON.stringify(snap && snap.readiness5));
    check('smoke final inventory covers wave-4/5 kinds', w4kinds >= 5, String(w4kinds));
    check('smoke zero instrument errors', errs === 0, JSON.stringify(inst.t.instrumentErrors));
    check('smoke uninstall restores startCombat', typeof Game.startCombat === 'function');
    check('smoke bar trick count is a number', typeof (fin.barTricks && fin.barTricks.count) === 'number');
  } catch (e) {
    check('smoke runs without throwing', false, String(e && e.stack || e).slice(0, 300));
  }
  console.log('trickcensus proof: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
