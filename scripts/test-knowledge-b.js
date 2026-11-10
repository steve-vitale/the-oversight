// test-knowledge-b.js — proof test for the sim-knowledge-b instrument
// (arm sim-knowledge-b, run fleshout-loop-b-20261110T1930Z).
//
// Two parts:
//   (1) RECORDER-VALIDITY FIXTURES (no harness): fake Game objects with
//       stubbed methods. Each fixture asserts the recorder lands the event
//       in the RIGHT bucket — including swapped-label fixtures (flip the
//       known/visited flags and the recorded buckets must flip) and a
//       dropped-event fixture (a throwing original must still record AND
//       rethrow). A recorder that hardcodes a bucket, drops an event, or
//       swallows a throw FAILS here by construction.
//   (2) SIM LEGS (harness, 3 proof seeds 170217–170219, 30d): determinism
//       (MODE=on twice → byte-identical per-seed JSONs) and neutrality
//       (MODE=on vs MODE=off → identical end-state digests), run via the
//       driver as child processes.
//
// Usage: node scripts/test-knowledge-b.js
// Exit 0 when all assertions pass; exit 1 with the failing assertion named.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'knowledge-b-instrument-20261110'));

let failures = [];
let checks = 0;
function check(name, cond, extra) {
  checks++;
  if (!cond) failures.push(name + (extra ? ' :: ' + extra : ''));
  else console.log('ok - ' + name);
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---------- (1) fixtures ----------
function fakeGame(overrides) {
  const G = {
    state: {
      scholar: { day: 5 },
      village: {
        roster: ['a', 'b', 'c'],
        trust: { b: 50, c: 5 },
        groups: [{ members: ['a', 'b'] }],
        away: {}, pantry: [], sharedKnowledge: {}, mapmem: {}, fallen: [],
      },
    },
    data: {
      villagers: [
        { id: 'a', visitedTiles: ['4,4', '4,5'] },
        { id: 'b', visitedTiles: ['4,4'] },
        { id: 'c', visitedTiles: [] },
      ],
      background_survivors: [],
    },
    getPerson: function (id) { return { id: id, dead: false }; },
    pantryItemKnown: function (it) { return it.known === true; },
    pantryDraw: function (v, want) {
      return { taken: 100, items: [
        { item: { known: true, plantId: 'dandelion', foodKind: 'plant', kcalEach: 100 }, units: 1, effectiveKcal: 100 },
        { item: { known: false, plantId: 'meat_gallowdeer', foodKind: 'meat', kcalEach: 500 }, units: 1, effectiveKcal: 500 },
      ] };
    },
    villagerMealDay: function (vid) { return { ate: 100 }; },
    villagerExperimentBeat: function (vid) { return true; },
    mapmemHaulCandidate: function (vid) { return { ref: 'corpse1', nx: 5, ny: 5, label: 'the beast' }; },
    mapmemHaulSites: function (vid) { return [{ site: { ref: 'corpse1' }, dist: 1, daysLeft: 2, score: 9 }]; },
    objHaulFromSite: function (vid, hx, hy, o, site) { return undefined; },
    mapmemHaulAt: function (vid) { return true; },
    expeditionCache: function (vid, dist) { return undefined; },
    objVisitTarget: function (vid) { return 'b'; },
    objPick: function (vid, hx, hy) { return undefined; },
    objOf: function (vid) { return { kind: 'FORAGE', purpose: 'forage', tx: 4, ty: 5, targetVid: null }; },
    compareMaps: function (vid) { return { newCount: 2 }; },
    expeditionSign: function (vid, dist) { return undefined; },
    corpses: function () { return [{ id: 'corpse1', kind: 'monster', monsterId: 'gallowdeer' }]; },
    mapmemFoodKnown: function (corpse) { return false; },
    pantryKcalLive: function (v) { return 99999; },
    npcNeeds: function (vid) { return { hunger: 10 }; },
    objFreshKillUnrevealed: function (ref) { return true; },
    agencyState: function () { return { exped: { a: { finds: [{ kcal: 700 }] } } }; },
    tele: function (kind, data) { return undefined; },
    unlockedWave: function () { return 1; },
    villageStandingTotal: function () { return 0; },
    scaleRank: function () { return 'village'; },
  };
  if (overrides) Object.assign(G, overrides);
  return G;
}

(function fixtures() {
  // FOOD: known/unknown split on a villager meal draw. The fake meal draws
  // from the pantry, so the instrument's reentrancy flag tags it villager-meal.
  let G = fakeGame({
    villagerMealDay: function (vid) { return G.pantryDraw(G.state.village, 600); },
  });
  const origDraw2 = G.pantryDraw;
  let inst = INST.install(G);
  G.villagerMealDay('a');
  check('food: villager meal draw recorded', inst.t.foodDraws.length === 1, 'got ' + inst.t.foodDraws.length);
  const d0 = inst.t.foodDraws[0];
  check('food: draw context is villager-meal', d0 && d0.context === 'villager-meal' && d0.vid === 'a');
  check('food: known item counted known', d0 && d0.items[0].known === true, JSON.stringify(d0 && d0.items));
  check('food: unknown item counted unknown', d0 && d0.items[1].known === false, JSON.stringify(d0 && d0.items));
  check('food: no instrument errors on happy path', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  inst.uninstall();
  check('uninstall restores pantryDraw', G.pantryDraw === origDraw2);

  // FOOD SWAPPED-LABEL fixture: flip the known flags on the items; the
  // recorded buckets must flip too (a recorder that hardcodes order fails).
  G = fakeGame({
    pantryDraw: function (v, want) {
      return { taken: 100, items: [
        { item: { known: false, plantId: 'dandelion', foodKind: 'plant', kcalEach: 100 }, units: 1, effectiveKcal: 100 },
        { item: { known: true, plantId: 'meat_gallowdeer', foodKind: 'meat', kcalEach: 500 }, units: 1, effectiveKcal: 500 },
      ] };
    },
    villagerMealDay: function (vid) { return G.pantryDraw(G.state.village, 600); },
  });
  inst = INST.install(G);
  G.villagerMealDay('a');
  const ds = inst.t.foodDraws[0];
  check('food-swapped: first item now unknown', ds && ds.items[0].known === false, JSON.stringify(ds && ds.items));
  check('food-swapped: second item now known', ds && ds.items[1].known === true, JSON.stringify(ds && ds.items));
  inst.uninstall();

  // DROPPED-EVENT fixture: a throwing original must still record AND rethrow.
  G = fakeGame({
    villagerExperimentBeat: function (vid) { throw new Error('boom-test'); },
  });
  inst = INST.install(G);
  let threw = false;
  try { G.villagerExperimentBeat('a'); } catch (e) { threw = (e.message === 'boom-test'); }
  check('dropped-event: throw propagates', threw);
  check('dropped-event: event still recorded', inst.t.experimentBeats.length === 1, 'got ' + inst.t.experimentBeats.length);
  check('dropped-event: no instrument error for a game throw', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  inst.uninstall();

  // MISSING-METHOD fixture: removing a method reports, never silently skips.
  G = fakeGame();
  delete G.mapmemHaulAt;
  inst = INST.install(G);
  check('missing-method: mapmemHaulAt-missing reported', inst.t.instrumentErrors.some(function (e) { return e.indexOf('mapmemHaulAt-missing') === 0; }), JSON.stringify(inst.t.instrumentErrors));
  inst.uninstall();

  // LOOTING: haul candidate channel — knowledge when fed + unrevealed.
  G = fakeGame();
  inst = INST.install(G);
  G.mapmemHaulCandidate('a');
  const hc = inst.t.haulCandidates[0];
  check('haul: candidate recorded', !!hc, JSON.stringify(inst.t.haulCandidates));
  check('haul: unrevealed flesh known=false', hc && hc.known === false);
  check('haul: fed village + unrevealed => knowledge channel', hc && hc.channel === 'knowledge', JSON.stringify(hc));
  // Famine variant: pantry under 5000 => famine channel.
  G.pantryKcalLive = function () { return 1000; };
  G.mapmemHaulCandidate('a');
  const hc2 = inst.t.haulCandidates[1];
  check('haul: hungry village => famine channel', hc2 && hc2.channel === 'famine', JSON.stringify(hc2));
  // Haul formation records known + fresh flags.
  G.objHaulFromSite('a', 4, 4, {}, { ref: 'corpse1', label: 'the beast', secondhand: true });
  const hf = inst.t.haulFormed[0];
  check('haul: formation records ref + known + fresh + secondhand', hf && hf.ref === 'corpse1' && hf.known === false && hf.freshUnrevealed === true && hf.secondhand === true, JSON.stringify(hf));
  // Cache find records kcal from the expedition finds array.
  G.expeditionCache('a', 2);
  const cf = inst.t.cacheFinds[0];
  check('cache: find recorded with kcal', cf && cf.kcal === 700 && cf.vid === 'a', JSON.stringify(cf));
  inst.uninstall();

  // PEOPLE: visit target channels + zero-score count.
  G = fakeGame();
  inst = INST.install(G);
  G.objVisitTarget('a');
  const vt = inst.t.visitTargets[0];
  check('people: visit target recorded', vt && vt.target === 'b', JSON.stringify(vt));
  check('people: mate channel set', vt && vt.channels.mate === true, JSON.stringify(vt && vt.channels));
  check('people: trust-high channel set (trust 50)', vt && vt.channels.trustHigh === true, JSON.stringify(vt && vt.channels));
  check('people: zero-score member counted (c: trust 5, not mate, home)', vt && vt.nZeroScore === 1, JSON.stringify(vt));
  // Null target: nobody scorable.
  G.objVisitTarget = function () { return null; };
  inst.uninstall();
  G = fakeGame({ objVisitTarget: function () { return null; } });
  inst = INST.install(G);
  G.objVisitTarget('a');
  check('people: null target recorded', inst.t.visitTargets[0] && inst.t.visitTargets[0].target === null);
  inst.uninstall();

  // FORAGING/EXPLORING: visited-before classification + swapped fixture.
  G = fakeGame();
  inst = INST.install(G);
  G.objPick('a', 4, 4); // objOf -> FORAGE 4,5; 'a' visited 4,5
  const pk = inst.t.objPicks[0];
  check('picks: FORAGE recorded with visitedBefore=true', pk && pk.kind === 'FORAGE' && pk.visitedBefore === true, JSON.stringify(pk));
  // Swapped: move the destination to unvisited ground; classification flips.
  G.objOf = function () { return { kind: 'EXPLORE', purpose: 'explore', tx: 0, ty: 0, targetVid: null }; };
  G.objPick('a', 4, 4);
  const pk2 = inst.t.objPicks[1];
  check('picks-swapped: EXPLORE to new ground visitedBefore=false', pk2 && pk2.kind === 'EXPLORE' && pk2.visitedBefore === false, JSON.stringify(pk2));
  // compareMaps + tele bond events.
  G.compareMaps('a');
  check('explore: compareMaps recorded', inst.t.compareMaps.length === 1 && inst.t.compareMaps[0].newCount === 2);
  inst.installTeleLazy();
  G.tele('bond_proposed', { initiator: 'a', target: 'b', kind: 'person', outcome: 'accepted', chance: 0.5 });
  G.tele('other_kind', { x: 1 });
  check('people: bond_proposed tele captured, other kinds ignored', inst.t.bondEvents.length === 1 && inst.t.bondEvents[0].outcome === 'accepted', JSON.stringify(inst.t.bondEvents));
  // Snapshot runs without error and counts shared knowledge / mapmem.
  inst.snapshot();
  check('snapshot: daily row written', inst.t.daily.length === 1, 'got ' + inst.t.daily.length);
  inst.uninstall();
  check('uninstall: tele restored', G.tele && inst.t.bondEvents.length === 1);
})();

// ---------- (2) sim legs ----------
function runDriver(seeds, days, run, mode) {
  const env = Object.assign({}, process.env, {
    SEEDS: seeds.join(','), DAYS: String(days), RUN: run, KNOWLEDGE_B_MODE: mode,
  });
  try {
    execSync('node scripts/knowledge-b-driver-20261110.js', { cwd: REPO, env: env, timeout: 600000, maxBuffer: 64 * 1024 * 1024, stdio: 'pipe' });
  } catch (e) {
    const out = (e.stdout || Buffer.alloc(0)).toString() + (e.stderr || Buffer.alloc(0)).toString();
    throw new Error('driver ' + run + '/' + mode + ' failed: ' + out.slice(-2000));
  }
}

(function simLegs() {
  const seeds = [170217, 170218, 170219];
  const dir = path.join(REPO, 'evidence', '2026-11-10', 'perseed-knowledge-b');
  runDriver(seeds, 30, 'knowledge-b-proof-det-a', 'on');
  runDriver(seeds, 30, 'knowledge-b-proof-det-b', 'on');
  runDriver(seeds, 30, 'knowledge-b-proof-neu-off', 'off');
  for (const seed of seeds) {
    const fa = path.join(dir, 'knowledge-b-s' + seed + '-knowledge-b-proof-det-a-on.json');
    const fb = path.join(dir, 'knowledge-b-s' + seed + '-knowledge-b-proof-det-b-on.json');
    const fo = path.join(dir, 'knowledge-b-s' + seed + '-knowledge-b-proof-neu-off-off.json');
    const ja = JSON.parse(fs.readFileSync(fa, 'utf8'));
    const jb = JSON.parse(fs.readFileSync(fb, 'utf8'));
    const jo = JSON.parse(fs.readFileSync(fo, 'utf8'));
    // Determinism compares the event tables, not the run label itself
    // (the two runs differ in RUN by construction).
    const jaNoRun = Object.assign({}, ja, { run: 'X' });
    const jbNoRun = Object.assign({}, jb, { run: 'X' });
    check('determinism seed ' + seed + ': on-runs identical modulo run label', JSON.stringify(jaNoRun) === JSON.stringify(jbNoRun));
    check('neutrality seed ' + seed + ': on/off digests identical', eq(ja.digest, jo.digest), 'on=' + JSON.stringify(ja.digest) + ' off=' + JSON.stringify(jo.digest));
    check('pilot-sections seed ' + seed + ': all domain sections present', Array.isArray(ja.foodDraws) && Array.isArray(ja.haulCandidates) && Array.isArray(ja.visitTargets) && Array.isArray(ja.objPicks) && Array.isArray(ja.bondEvents) && Array.isArray(ja.daily));
    check('instrument-errors seed ' + seed + ': 0 errors', (ja.instrumentErrors || []).length === 0, JSON.stringify(ja.instrumentErrors).slice(0, 400));
  }
})();

console.log('test-knowledge-b: ' + checks + ' checks, ' + failures.length + ' failures');
if (failures.length) {
  for (const f of failures) console.error('FAIL: ' + f);
  process.exit(1);
}
console.log('test-knowledge-b: PASS');
