#!/usr/bin/env node
// test-deathcensus-b.js — proof for the sim-deathcensus-b instrument
// (scripts/deathcensus-instrument-20261021.js). DIAG arm: ZERO src/js changes,
// ZERO policy changes. All instrument state is closure-local (K), never
// Game.state, never the save stream.
//
// RUN WITH THE SWEEP ENV (ENV TRAP — see scripts/test-surpluskeep2-b.js):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-deathcensus-b.js
//
// PART A: pure fixtures — classifyDeath taxonomy on synthetic rows
//         (every named class), attributeVillageLost on constructed states.
// PART B: instrument honesty — ≥4 trial runs (60d): death rows reconcile
//         with the engine's own death aggregates (harness live tele capture
//         + tele ring), ≥99% row completeness, 0 unexplained person rows.
// PART C: RED-equivalent — instrumented vs pristine, same commit/seeds:
//         outcome fields byte-identical (the instrument adds zero drift).
// PART D: det-gate — paired instrumented re-runs byte-identical.
// PART E: village-lost end-to-end (150d): trigger site + verbatim beat
//         captured on a real loss (needs ≥1 loss in 2 seeds; INCONCLUSIVE,
//         not fail, if both survive).
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const DC = require(path.join(REPO, 'scripts', 'deathcensus-instrument-20261021'));

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('PROOF STOP: run with FEASTSCALE_R13=1 SEATDRIVE=0 (the sweep env).');
  process.exit(2);
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const MIDX = {
  byId: { bulldozer: { id: 'bulldozer', name: 'Bulldozer', wave: 1 }, highbeam_deer: { id: 'highbeam_deer', name: 'Highbeam Deer', wave: 1 } },
  byName: { 'bulldozer': 'bulldozer', 'highbeam deer': 'highbeam_deer', 'the callback': 'callback' },
};

// ---------- PART A: fixtures ----------

function rowOf(cause, kind, extra) {
  return Object.assign({ day: 10, who: 'Nina', vid: 'v1', kind: kind || 'villager',
    cause: cause, player: false, monsterId: null, monsterName: null, wave: null }, extra || {});
}

console.log('PART A: classifyDeath fixtures');
var cases = [
  ['starvation', 'villager', 'starvation'],
  ['hunger', 'villager', 'starvation'],
  ['thirst', 'villager', 'dehydration'],
  ['dehydration', 'villager', 'dehydration'],
  ["a wound that wouldn't close", 'villager', 'wound'],
  ['injuries', 'villager', 'wound'],
  ['festering wound', 'villager', 'wound'],
  ['the trembles', 'villager', 'sickness-trembles'],
  ['lockjaw', 'villager', 'sickness-lockjaw'],
  ['gutrot', 'villager', 'sickness-gutrot'],
  ['tick fever', 'villager', 'sickness-tick fever'],
  ['sickness', 'villager', 'sickness-sickness'],
  ['The Callback', 'villager', 'combat-callback'],
  ['split-fight: The Callback', 'villager', 'combat-callback'],
  ['combat', 'villager', 'combat-unknown'],
  ['patrol combat', 'villager', 'combat-unknown'],
  ['the wild', 'villager', 'combat-unknown'],
  ['raid', 'person', 'raid'],
  ['raid-defense', 'person', 'raid'],
  ['ambush', 'person', 'other: ambush (villager-on-villager)'],
  ['alien', 'person', 'other: alien-alien'],
  ['alien_beam', 'person', 'other: alien-alien_beam'],
  ['the phoenix link', 'villager', 'other: alien-the-phoenix-link'],
  ['the phoenix link (broken)', 'villager', 'other: alien-the-phoenix-link-(broken)'],
  ['contest', 'villager', 'contest'],
  ['some unheard-of mishap', 'villager', 'other: some unheard-of mishap'],
];
for (const [cause, kind, want] of cases) {
  const got = DC.classifyDeath(rowOf(cause, kind), MIDX).class;
  ok('classify ' + JSON.stringify(cause) + ' -> ' + want, got === want, 'got ' + got);
}
ok('monsterId wins', DC.classifyDeath(rowOf('combat', 'villager', { monsterId: 'bulldozer', monsterName: 'Bulldozer' }), MIDX).class === 'combat-bulldozer');
ok('contest venue without monster -> contest', DC.classifyDeath(rowOf('combat', 'villager', { venue: 'contest' }), MIDX).class === 'contest');
ok('contest venue with monster -> combat-<id> tagged',
  (function () { var a = DC.classifyDeath(rowOf('combat', 'villager', { monsterId: 'bulldozer', venue: 'contest' }), MIDX); return a.class === 'combat-bulldozer' && /contest venue/.test(a.detail); })());
ok('wild combat-unknown stays', DC.classifyDeath(rowOf('combat', 'villager', { venue: null }), MIDX).class === 'combat-unknown');
ok('live-fight monsterName resolves', DC.classifyDeath(rowOf('combat', 'villager', { monsterName: 'Highbeam Deer' }), MIDX).class === 'combat-highbeam_deer');
ok('monster kind out of taxonomy', DC.classifyDeath(rowOf('patrol combat', 'monster', { monsterId: 'bulldozer' }), MIDX).class === 'monster:monster');
ok('animal kind out of taxonomy', DC.classifyDeath(rowOf('combat', 'animal'), MIDX).class === 'monster:animal');
ok('missing cause -> unexplained', DC.classifyDeath({ day: 1, kind: 'villager', cause: null }, MIDX).class === 'unexplained');
ok('player flag survives', DC.classifyDeath(rowOf('starvation', 'villager', { player: true }), MIDX).class === 'starvation');

console.log('PART A: attributeVillageLost fixtures');
function fakeGame(lost, vflags, lineageOutcomes) {
  return {
    villageLost: lost,
    state: { village: Object.assign({ scattered: false, extinct: false }, vflags) },
    lineage: function () { return (lineageOutcomes || []).map(function (o) { return { outcome: o }; }); },
  };
}
function fakeK(sayLines, vlDay) {
  return { sayLines: sayLines || [], _vlDay: vlDay == null ? null : vlDay };
}
var scat = 'Haven couldn\'t hold. On the third hungry day, people started walking — in different directions. The scattering, again.';
var ext = 'Nobody is left. Not scattered, not gone looking for food — dead, every one, and the fire has nobody left to warm. The village ends here, the way villages end when the teeth find them first.';
var suc = 'No one is left to pick up the Codex. The village dies out — quietly, the way villages do. The season ends here.';
var a1 = DC.attributeVillageLost(fakeGame(true, { scattered: true }, []), fakeK([{ d: 100, line: scat }], 101));
ok('scattering site', a1.site === 'scattering' && a1.lost === true);
ok('scattering beat verbatim', a1.beat === scat && a1.day === 100);
var a2 = DC.attributeVillageLost(fakeGame(true, { extinct: true }, []), fakeK([{ d: 90, line: ext }], 91));
ok('extinction site+beat', a2.site === 'extinction' && a2.beat === ext);
var a3 = DC.attributeVillageLost(fakeGame(true, {}, ['village-lost']), fakeK([{ d: 72, line: suc }], 73));
ok('succession site+beat', a3.site === 'succession' && a3.beat === suc);
var a4 = DC.attributeVillageLost(fakeGame(true, {}, []), fakeK([], 55));
ok('unknown site when no marker', a4.site === 'unknown' && a4.lost === true && a4.day === 55);
var a5 = DC.attributeVillageLost(fakeGame(false, {}, []), fakeK([], null));
ok('not lost', a5.lost === false && a5.site === 'none');

// ---------- PART B/C/D/E: live runs ----------

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { leadfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));

async function oneRun(seed, days, instrumented) {
  const { Game } = await loadGame({ seed: seed, mode: 'deathcensus-proof', fullTelemetry: false });
  let inst = null, K = null;
  if (instrumented) { inst = DC.install(Game); K = inst.K; }
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, leadfeast, { days: days, manifest: undefined, sampleEvery: 30 }); });
  let fin = null;
  if (instrumented) { fin = DC.finalize(Game, K); try { inst.uninstall(); } catch (e) {} }
  return { Game: Game, result: result, fin: fin };
}

function outcomeFields(Game, result) {
  // Canonical projection for RED-equivalence: fields the game itself reports.
  var deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      var k = String((dd && dd.cause) || 'unknown') + '|' + String((dd && dd.kind) || '?');
      deathCauses[k] = (deathCauses[k] || 0) + 1;
    }
  } catch (e) {}
  var endPop = -1, endPantry = -1, natLive = false;
  try { endPop = DC.livingPop(Game); } catch (e) {}
  try { endPantry = Math.round(DC.pantryKcal(Game)); } catch (e) {}
  try { natLive = !!((Game.state || {}).nationalLive); } catch (e) {}
  return {
    days: result.days, gameDays: (Game.state.scholar || {}).day || 0,
    endReason: result.endReason, maxWaveUnlocked: result.maxWaveUnlocked || 1,
    endPop: endPop, endPantry: endPantry, natLive: natLive,
    scholarDeaths: (result.samples.deaths || []).filter(function (d) { return d && d.player; }).length,
    deathsTotal: (result.samples.deaths || []).length,
    deathCauses: deathCauses,
  };
}

function personDeaths(samples) {
  return (samples.deaths || []).filter(function (d) {
    var k = String(d && d.kind || '').toLowerCase();
    return k === 'person' || k === 'villager';
  });
}

(async () => {
  console.log('PART B: instrument honesty (5 seeds x 60d)');
  const bSeeds = [66101, 66102, 66103, 66104, 66105];
  let totRows = 0, totHarness = 0, totUnexpl = 0, totErrs = 0;
  for (const s of bSeeds) {
    const { Game, result, fin } = await oneRun(s, 60, true);
    const h = personDeaths(result.samples);
    const mine = fin.deaths.filter(function (r) { return r.kind === 'person' || r.kind === 'villager'; });
    // Row completeness: every harness person death must have a matching row.
    // The harness's `who` is the villagerId (tele record), ours is the name —
    // match on vid<->who (both are the engine's villager id).
    let matched = 0;
    for (const hd of h) {
      const m = mine.find(function (r) {
        return r.day === hd.day && String(r.vid) === String(hd.who) && String(r.cause) === String(hd.cause);
      });
      if (m) matched++;
    }
    const completeness = h.length ? matched / h.length : 1;
    totRows += mine.length; totHarness += h.length;
    totUnexpl += fin.unexplained; totErrs += fin.instrumentErrors.length;
    ok('s' + s + ' reconcile ' + mine.length + '/' + h.length + ' rows',
      h.length === 0 || (completeness >= 0.99 && mine.length >= h.length),
      'matched ' + matched + '/' + h.length);
    ok('s' + s + ' daily rows non-empty', fin.daily.length > 0, String(fin.daily.length));
    ok('s' + s + ' unexplained=0', fin.unexplained === 0, JSON.stringify(fin.unexplainedRows.slice(0, 2)));
    ok('s' + s + ' instrumentErrors=0', fin.instrumentErrors.length === 0, fin.instrumentErrors.slice(0, 2).join(';'));
    // Every person row carries the brief's fields.
    const bad = mine.filter(function (r) {
      return r.day == null || !r.who || !r.vid && r.vid !== null || !r.kind || r.cause == null || typeof r.player !== 'boolean' || !r.pclass;
    });
    ok('s' + s + ' row schema', bad.length === 0, JSON.stringify(bad.slice(0, 1)));
  }
  ok('PART B aggregate: >=99% row completeness', totHarness === 0 || totRows >= totHarness,
    totRows + ' rows vs ' + totHarness + ' harness person deaths');
  ok('PART B aggregate: 0 unexplained', totUnexpl === 0, String(totUnexpl));
  ok('PART B aggregate: 0 instrument errors', totErrs === 0, String(totErrs));

  console.log('PART C: RED-equivalent (instrumented vs pristine, 2 seeds x 60d)');
  for (const s of [66106, 66107]) {
    const a = await oneRun(s, 60, true);
    const b = await oneRun(s, 60, false);
    const fa = JSON.stringify(outcomeFields(a.Game, a.result));
    const fb = JSON.stringify(outcomeFields(b.Game, b.result));
    ok('s' + s + ' instrumented == pristine', fa === fb,
      fa === fb ? '' : ('A=' + fa.slice(0, 300) + ' B=' + fb.slice(0, 300)));
  }

  console.log('PART D: det-gate (paired re-run byte-identical)');
  {
    const a = await oneRun(66108, 60, true);
    const b = await oneRun(66108, 60, true);
    const fa = JSON.stringify({ d: a.fin.deaths, y: a.fin.daily, v: a.fin.villageLost, r: a.fin.realmNatEvents, s: a.fin.deathDayLines, l: a.fin.lossDayLines });
    const fb = JSON.stringify({ d: b.fin.deaths, y: b.fin.daily, v: b.fin.villageLost, r: b.fin.realmNatEvents, s: b.fin.deathDayLines, l: b.fin.lossDayLines });
    ok('paired re-run byte-identical', fa === fb, 'len ' + fa.length + ' vs ' + fb.length);
  }

  console.log('PART E: village-lost end-to-end (2 seeds x 150d)');
  let sawLoss = 0;
  for (const s of [66109, 66110]) {
    const { Game, result, fin } = await oneRun(s, 150, true);
    const vl = fin.villageLost;
    console.log('  s' + s + ': end=' + result.endReason + ' days=' + result.days +
      ' lost=' + vl.lost + ' site=' + vl.site + ' beatDay=' + vl.day);
    if (vl.lost) {
      sawLoss++;
      ok('s' + s + ' trigger site named', ['scattering', 'extinction', 'succession'].indexOf(vl.site) >= 0, vl.site);
      ok('s' + s + ' trigger beat verbatim', typeof vl.beat === 'string' && vl.beat.length > 20,
        String(vl.beat).slice(0, 80));
    }
  }
  if (sawLoss === 0) console.log('  INCONCLUSIVE: no village loss in 2x150d — beat path unproven (not a fail)');

  console.log('\nproof: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error('PROOF FATAL', e && e.stack ? e.stack : e); process.exit(2); });
