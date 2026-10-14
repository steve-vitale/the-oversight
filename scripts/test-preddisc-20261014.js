#!/usr/bin/env node
// test-preddisc-20261014.js — proof test for the RAID-PREDATION vs
// INCOME-SHORTFALL discriminator (sim-findings #163, flesh-out 2026-10-14).
// INSTRUMENT ONLY — scripts/preddisc-20261014.js; zero game-code changes.
// Reuses scripts/predation-lib-20261014.js for gorge/lingerer telemetry.
//
// RED PHASE: run this against the stub preddisc-20261014.js — the
// classifyRun / findCollapseWindow assertions must FAIL (stub returns
// 'unclassified' / null). Then implement; all parts must go GREEN.
//
// PART P (pure): classifyRun on synthetic telemetry — s44-shaped (raid-driven
//   pantry collapse: fresh-days 24->1.6, ~4.4k kcal/night gorged) must read
//   'predation'; s22-shaped (pantry dips, no gorge, forage income collapsed)
//   must read 'income'; a both-causes shape must read 'mixed'; a run with no
//   collapse window must read 'no-spiral'.
// PART W (pure): findCollapseWindow on synthetic pantry series — finds the
//   <3-fresh-days span, merges <4d gaps, drops <3d blips.
// PART M (pure): the marker set a future conditional-posture arm consumes —
//   every verb class named by the spiralverb kill has a keyed marker.
// PART H (live honesty): 60d sim with vs without the wraps — per-day state
//   hashes must be BYTE-IDENTICAL (read-only instrument).
// PART S (live smoke): 40d instrumented sim — every telemetry stream flows,
//   classifyRun returns a valid class, marker keys present.
//
// Usage: node scripts/test-preddisc-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attachPreddisc, finalizePreddisc, classifyRun, findCollapseWindow } =
  require('./preddisc-20261014');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; process.stderr.write('  FAIL ' + name + (extra ? ' — ' + extra : '') + '\n'); }
}

// ---- synthetic telemetry builders (shaped from the evidence record) ----

// s44-shaped (spiralverb r29 autopsy): pantry collapses 24.0->1.6 fresh-days
// in days; ~4.4k kcal/night stripped by lingerers; scholar forage trips
// already returning empty on worked-out patches.
function synthPredation() {
  const pantry = [];
  for (let d = 60; d <= 80; d++) {
    const kcal = d <= 63 ? 24000 : Math.max(1500, 24000 - (d - 63) * 3800);
    pantry.push({ day: d, kcal, freshDays: d <= 63 ? 24 - (d - 60) * 0.5 : Math.max(1.2, 22 - (d - 63) * 3.4) });
  }
  // force the window days under 3 fresh-days
  for (const p of pantry) if (p.day >= 68) p.freshDays = Math.max(1.0, 6 - (p.day - 68) * 1.2);
  const gorge = [64, 65, 66, 68, 70].map(d => ({ day: d, totalGorged: 4400, events: [{ got: 4400, wave: 5 }] }));
  const episodes = [{ id: 'cancellation', firstDay: 63, lastDay: 71, gorgeNights: 5, gorgeKcal: 22000, resolution: 'lingering-at-end' }];
  const forage = [];
  for (let d = 60; d <= 80; d++) forage.push({ day: d, attempts: 3, success: d < 64 ? 2 : 0, kcal: d < 64 ? 2600 : 150 });
  return { window: null, days: 80, pantry, gorge, episodes, forage,
           workedOut: [], scholarDeaths: [63, 68, 71] };
}

// s22-shaped (spiralverb r29 autopsy): pantry dips (10.2->2.3 etc.) with NO
// gorge activity; income verbs (+58d) answered it — an income shortfall.
function synthIncome() {
  const pantry = [];
  for (let d = 70; d <= 100; d++) {
    const inDip = d >= 84 && d <= 93;
    pantry.push({ day: d,
      kcal: inDip ? Math.max(1800, 9000 - (d - 84) * 800) : 12000,
      freshDays: inDip ? Math.max(1.2, 10.2 - (d - 84) * 1.1) : 8 });
  }
  const forage = [];
  for (let d = 70; d <= 100; d++) {
    const inDip = d >= 84 && d <= 93;
    forage.push({ day: d, attempts: 3, success: inDip ? 1 : 3, kcal: inDip ? 700 : 3400 });
  }
  return { window: null, days: 100, pantry, gorge: [], episodes: [],
           forage, workedOut: [], scholarDeaths: [82, 85] };
}

// both-causes shape: real gorge AND collapsed income, neither explaining
// the whole drain.
function synthMixed() {
  const pantry = [];
  for (let d = 50; d <= 64; d++) {
    pantry.push({ day: d, kcal: 18000 - (d - 50) * 1100,
                  freshDays: d < 56 ? 9 - (d - 50) : Math.max(1.4, 3 - (d - 56) * 0.3) });
  }
  const gorge = [57, 59].map(d => ({ day: d, totalGorged: 1500, events: [{ got: 1500, wave: 2 }] }));
  const episodes = [{ id: 'hushwolf', firstDay: 56, lastDay: 60, gorgeNights: 2, gorgeKcal: 3000, resolution: 'moved-on' }];
  const forage = [];
  for (let d = 50; d <= 64; d++) forage.push({ day: d, attempts: 3, success: d < 56 ? 3 : 1, kcal: d < 56 ? 3200 : 900 });
  return { window: null, days: 64, pantry, gorge, episodes, forage,
           workedOut: [], scholarDeaths: [55] };
}

function synthNoSpiral() {
  const pantry = [];
  for (let d = 1; d <= 60; d++) pantry.push({ day: d, kcal: 20000 + (d % 3) * 500, freshDays: 12 });
  const forage = [];
  for (let d = 1; d <= 60; d++) forage.push({ day: d, attempts: 2, success: 2, kcal: 3000 });
  return { window: null, days: 60, pantry, gorge: [], episodes: [], forage,
           workedOut: [], scholarDeaths: [] };
}

function partP() {
  console.log('PART P — classifyRun on synthetic shapes');
  const p = classifyRun(synthPredation());
  check('s44-shaped -> predation', p.class === 'predation', 'got ' + p.class);
  check('s44 raidExplains high', p.features && p.features.raidExplains >= 0.4,
    'got ' + (p.features && p.features.raidExplains));
  const i = classifyRun(synthIncome());
  check('s22-shaped -> income', i.class === 'income', 'got ' + i.class);
  check('s22 gorge nights zero', i.features && i.features.gorgeNights === 0,
    'got ' + (i.features && i.features.gorgeNights));
  const m = classifyRun(synthMixed());
  check('both-causes -> mixed', m.class === 'mixed', 'got ' + m.class);
  const n = classifyRun(synthNoSpiral());
  check('no collapse -> no-spiral', n.class === 'no-spiral', 'got ' + n.class);
  for (const [nm, r] of [['predation', p], ['income', i], ['mixed', m], ['no-spiral', n]]) {
    check(nm + ' carries features', !!r.features && typeof r.features.raidExplains === 'number', '');
    check(nm + ' carries markers', !!r.markers && !!r.markers['spiral.type'], '');
    check(nm + ' carries verbFor', typeof r.verbFor === 'string' && r.verbFor.length > 0, '');
  }
}

function partW() {
  console.log('PART W — findCollapseWindow');
  // dip below 3 fresh-days d10-16, blip d30-31 (<3d, dropped), dip d40-48
  // with a 2d gap at d43-44 (merged: gap < 4d)
  const series = [];
  for (let d = 1; d <= 55; d++) {
    let fd = 10;
    if (d >= 10 && d <= 16) fd = 2.0;
    if (d >= 30 && d <= 31) fd = 2.5;
    if (d >= 40 && d <= 48 && !(d === 43 || d === 44)) fd = 1.8;
    series.push({ day: d, kcal: 10000, freshDays: fd });
  }
  const w = findCollapseWindow(series);
  check('window found', !!w, 'got null');
  check('window spans the merged dip', w && w.startDay === 40 && w.endDay === 48,
    w ? (w.startDay + '-' + w.endDay) : 'null');
  check('first dip ignored (not longest)', true, '');
  const none = findCollapseWindow(series.map(s => ({ day: s.day, kcal: s.kcal, freshDays: 10 })));
  check('no dip -> null', none === null, 'got ' + JSON.stringify(none));
}

function partM() {
  console.log('PART M — marker set for the future conditional-posture arm');
  const r = classifyRun(synthPredation());
  const mk = r.markers || {};
  // The spiralverb kill names the verb classes; each must have a keyed marker.
  check('marker: spiral.type', typeof mk['spiral.type'] === 'string', '');
  check('marker: spiral.predation (raid-spiral -> raid defense)',
    !!mk['spiral.predation'] && typeof mk['spiral.predation'].gorgeNights7d === 'number', '');
  check('marker: spiral.income (pantry-spiral -> ranging/income priority)',
    !!mk['spiral.income'] && typeof mk['spiral.income'].forageKcal7d === 'number', '');
  check('marker: spiral.window', !!mk['spiral.window'] && typeof mk['spiral.window'].startDay === 'number', '');
  check('marker: spiral.deaths (combat-spiral -> homebound brace)',
    !!mk['spiral.deaths'] && typeof mk['spiral.deaths'].accel === 'boolean', '');
  check('verbs map covers all classes',
    r.verbs && r.verbs.combat && r.verbs.pantryIncome && r.verbs.pantryRaid && r.verbs.mixed && r.verbs.none,
    JSON.stringify(r.verbs));
}

function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    const pk = ((Game.state.village || {}).pantry || [])
      .reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Math.round(pk / 100)].join('|');
  } catch (e) { return 'ERR'; }
}

async function runShort(seed, useWraps, hashes) {
  const { Game } = await loadGame({ seed, mode: 'preddisc', fullTelemetry: false });
  await setupGame(Game);
  let track = null;
  if (useWraps) track = attachPreddisc(Game);
  const policy = {
    id: 'honesty-idle',
    daily(G) {
      try { if (track && track.sampleDay) track.sampleDay(); } catch (e) {}
      hashes.push(dayHash(G));
    },
  };
  await runDays(Game, policy, { days: 60 });
  return track;
}

async function partH() {
  console.log('PART H — live honesty: wraps vs no-wraps byte-identical (s44, 60d)');
  const hOn = [], hOff = [];
  const t1 = await runShort(44, true, hOn);
  const t2 = await runShort(44, false, hOff);
  check('instrument attached cleanly', !!t1 && !t1.stub, 'stub or null');
  check('same day count sampled', hOn.length === hOff.length && hOn.length >= 30,
    hOn.length + ' vs ' + hOff.length);
  let diffs = 0, firstDiff = -1;
  for (let i = 0; i < Math.min(hOn.length, hOff.length); i++) {
    if (hOn[i] !== hOff[i]) { diffs++; if (firstDiff < 0) firstDiff = i; }
  }
  check('per-day state hashes byte-identical', diffs === 0,
    diffs + ' diffs, first at sample ' + firstDiff);
  check('no instrument errors', t1 && (t1.instrErrors || []).length === 0,
    t1 ? (t1.instrErrors || []).join('; ') : 'no track');
}

async function partS() {
  console.log('PART S — live smoke: 40d instrumented sim, streams flow');
  const { Game } = await loadGame({ seed: 22, mode: 'preddisc', fullTelemetry: false });
  await setupGame(Game);
  const track = attachPreddisc(Game);
  const { leadfeast } = require('./policies/feastscale');
  process.env.FEASTSCALE_R13 = '1';
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  policy.daily = (G, ctx) => {
    try { track.sampleDay(); } catch (e) {}
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
  };
  await runDays(Game, policy, { days: 40 });
  delete process.env.FEASTSCALE_R13;
  const T = finalizePreddisc(Game, track);
  check('pantry stream flowed', (T.pantry || []).length >= 20, 'got ' + (T.pantry || []).length);
  check('predation-lib gorge stream present', Array.isArray(T.gorge), 'missing');
  check('forage stream flowed', (T.forage || []).length >= 0, 'missing');
  check('no instrument errors', (track.instrErrors || []).length === 0,
    (track.instrErrors || []).join('; ').slice(0, 200));
  const r = classifyRun(T);
  check('classifyRun returns a valid class',
    ['predation', 'income', 'mixed', 'no-spiral'].indexOf(r.class) >= 0, 'got ' + r.class);
  check('marker keys present', !!r.markers && !!r.markers['spiral.type'] && !!r.verbs, 'missing');
}

(async () => {
  partP();
  partW();
  partM();
  await quietLog(async () => { await partH(); });
  await quietLog(async () => { await partS(); });
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILURE', e); process.exit(2); });
