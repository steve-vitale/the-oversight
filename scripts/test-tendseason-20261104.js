// test-tendseason-20261104.js — proof for the tend-below-seasoned-bar
// leg (arm sim-tendseason-b). Fixture tests for: the tendseason policy
// (EXACTLY the seasoned-bar restriction added to tend-through;
// tend-through and leadcourt untouched), survival bands, tend
// classification by pre-tend seasoned state, ever-faced wave
// detection, pooled hold-share, and the prereg GO judge (all five
// legs + insufficient-data), plus a live harness smoke test:
// loadGame + diplo instrument + 2-day leadcourt-tendseason-b run,
// 0 instrument errors. Writes nothing to the repo (in-memory only).
// Usage: node scripts/test-tendseason-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const WRAP = require(path.join(REPO, 'scripts', 'test-tendseason-analyze-20261104'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}

// 1. Tendseason policy: exactly one restriction added to tend-through.
const seasonText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendseason-b.js'), 'utf8');
const throughText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough.js'), 'utf8');
const leadText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt.js'), 'utf8');
eq('season gate helper present', seasonText.indexOf('belowSeasonedBar') >= 0, true);
eq('season gate age bar 30', seasonText.indexOf('age < 30') >= 0, true);
eq('season gate trust bar 40', seasonText.indexOf('(link.trust || 0) < 40') >= 0, true);
eq('season keeps weekly check', seasonText.indexOf('link.tendedWeek !== week') >= 0, true);
eq('season keeps Haven-primary tend', seasonText.indexOf("link.primary === 'haven'") >= 0, true);
eq('season keeps proposal gate 12000', seasonText.indexOf('pantryKcal(Game) > 12000') >= 0, true);
eq('season has no 20000 tend gate', seasonText.indexOf('pantryKcal(Game) > 20000'), -1);
eq('season has no 13500 floor gate', seasonText.indexOf('pantryKcal(Game) > 13500'), -1);
eq('tendthrough has no season gate', throughText.indexOf('belowSeasonedBar'), -1);
eq('tendthrough still unconditional tend', throughText.indexOf('pantryKcal(Game) > 13500'), -1);
eq('leadcourt still has 20000 tend gate', leadText.indexOf('pantryKcal(Game) > 20000') >= 0, true);
const pol = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendseason-b')).leadcourtTendseasonB;
eq('season id', pol.id, 'leadcourt-tendseason-b');
eq('season daily fn', typeof pol.daily, 'function');
const polBase = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough')).leadcourtTendthrough;
eq('baseline id', polBase.id, 'leadcourt-tendthrough');

// 2. Survival bands.
eq('band A horizon', WRAP.bandFor(300, 'horizon'), 'A');
eq('band B', WRAP.bandFor(200, 'lost'), 'B');
eq('band C', WRAP.bandFor(143, 'lost'), 'C');
eq('band D', WRAP.bandFor(98, 'lost'), 'D');

// 3. Median.
eq('median even', WRAP.median([10, -4, 3, 7]), 5);
eq('median odd', WRAP.median([1, 2, 9]), 2);

// 4. Summarize: tend classification by PRE-TEND seasoned state.
function link(id, trust, formedDay, seasoned, status) {
  return { id: id, kind: null, primary: 'haven', subordinate: 'v' + id, status: status || 'active',
    trust: trust, day: formedDay, seasoned: seasoned, regionalPlus: seasoned };
}
function snap(day, diplo, detail, pantry, w4, w5) {
  const seasoned = detail.filter(function (d) { return d.seasoned; }).length;
  return { day: day, tile: { x: 4, y: 4 }, insideHaven: true, ovs: [], onVillageTile: null,
    linkFunnel: { total: detail.length, active: detail.filter(function (d) { return d.status === 'active'; }).length,
      seasoned: seasoned, regionalPlus: seasoned, seasonedNotRegional: 0, detail: detail },
    pending: { counter: false, accord: false, national: false, global: false, counterDetail: null },
    standing: { total: diplo, war: 0, diplomacy: diplo, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    capped: diplo, peak: null, scaleRank: 'village', readiness5: { ready: false },
    w4faced: !!w4, w5faced: !!w5, roster: [], livingCount: 3, pantryKcal: pantry == null ? 10000 : pantry };
}
function daysRange(a, b, fn) { const out = []; for (let d = a; d <= b; d++) out.push(fn(d)); return out; }
(function () {
  // l1: formed day 20, trust 70 — seasoned at every snapshot >= day 50.
  // l2: formed day 50, trust 80 — below bar until day 80 (age), seasoned after.
  // l3: formed day 55, trust 38 — below bar on trust throughout.
  function detailFor(day) {
    return [link('l1', 70, 20, day >= 50, 'active'),
      link('l2', 80, 50, day >= 80, 'active'),
      link('l3', 38, 55, false, 'active')];
  }
  const daily = [].concat(
    daysRange(60, 88, function (d) { return snap(d, 102, detailFor(d), 30000, d === 70, false); }),
    daysRange(89, 100, function (d) { return snap(d, 0, detailFor(d), 5000, false, false); }));
  const out = { seed: 99209, policy: 'leadcourt-tendseason-b', run: 'test', anchorCommit: 'test',
    days: 100, endReason: 'lost', won: false, villageLost: true, scaleRank: 'regional',
    maxWave: 4, endUnlockedWave: 4, endCallMovedPeak: false, daily: daily,
    proposalEvents: [], courtshipEvents: [
      { day: 70, fn: 'tendLink', target: 'l1' },   // pre-tend day 69: age 49, trust 70 -> seasoned
      { day: 65, fn: 'tendLink', target: 'l2' },   // pre-tend day 64: age 14 -> below
      { day: 90, fn: 'tendLink', target: 'l3' },   // pre-tend day 89: trust 38 -> below
      { day: 95, fn: 'tendLink', target: 'lX' },   // no detail anywhere -> unknown
    ],
    travelCalls: [], linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {}, instrumentErrors: [] };
  const s = WRAP.summarizeLeg(out);
  eq('summarize tend total', s.tendTotal, 4);
  eq('summarize tend below-bar', s.tendBelowBar, 2);
  eq('summarize tend seasoned', s.tendSeasoned, 1);
  eq('summarize tend unknown', s.tendUnknown, 1);
  eq('summarize everW4 from mid-run snapshot', s.everW4, true);
  eq('summarize everW5 false', s.everW5, false);
  eq('summarize band', s.survivalBand, 'C');
  // seasonedBefore unit checks on the same fixture.
  eq('seasonedBefore seasoned link', WRAP.seasonedBefore(out, 'l1', 70), true);
  eq('seasonedBefore young link', WRAP.seasonedBefore(out, 'l2', 65), false);
  eq('seasonedBefore low-trust link', WRAP.seasonedBefore(out, 'l3', 90), false);
  eq('seasonedBefore missing link', WRAP.seasonedBefore(out, 'lX', 95), null);
})();

// 5. GO judge fixtures (prereg: (a) no regression, (b) median delta
// >= -5, (c) pooled hold within 0.05, (d) wave guard within 1,
// (e) drop guard armed <= base + 1; insufficient-data on bad seeds,
// zero baseline diplomacy, armed seasoned tends, or zero below-bar tends).
function leg(seed, days, firstDiplo, postFirst, hold, everW4, everW5, errors, drops, below, seasoned) {
  return { seed: seed, days: days, endReason: 'lost', firstDiploDay: firstDiplo,
    postFirstSnapshots: postFirst, holdShare: hold, everW4: everW4, everW5: everW5,
    instrumentErrors: errors || 0, drops: drops || [], tendBelowBar: below || 0, tendSeasoned: seasoned || 0 };
}
function band(d) { return d >= 300 ? 'A' : d >= 150 ? 'B' : d >= 100 ? 'C' : 'D'; }
function pair(seed, baseDays, armedDays, baseHold, armedHold, baseW4, armedW4, baseW5, armedW5, baseDrops, armedDrops, armedBelow, armedSeasoned) {
  const BAND = { D: 0, C: 1, B: 2, A: 3 };
  const b = leg(seed, baseDays, 60, 40, baseHold, baseW4, baseW5, 0, baseDrops, 0, 0);
  const a = leg(seed, armedDays, 60, 40, armedHold, armedW4, armedW5, 0, armedDrops, armedBelow, armedSeasoned);
  return { seed: seed, base: b, armed: a, deltaDays: armedDays - baseDays,
    baseBand: band(baseDays), armedBand: band(armedDays),
    regressed: BAND[band(armedDays)] < BAND[band(baseDays)] };
}
(function () {
  const go = [pair(1, 120, 118, 1.0, 1.0, true, true, false, false, [], [], 5, 0),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0)];
  eq('judge GO', WRAP.judgeGo(go).verdict, 'GO');
  const drop = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [{}, {}], 5, 0),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0)];
  eq('judge NO-GO drop guard', WRAP.judgeGo(drop).verdict, 'NO-GO');
  eq('judge drop legE false', WRAP.judgeGo(drop).legE_pass, false);
  const dropOk = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [{}], 5, 0),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0)];
  eq('judge drop within-1 passes', WRAP.judgeGo(dropOk).verdict, 'GO');
  const reg = [pair(1, 120, 90, 1.0, 1.0, true, true, false, false, [], [], 5, 0),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0)];
  eq('judge NO-GO regression', WRAP.judgeGo(reg).verdict, 'NO-GO');
  const med2 = [pair(1, 160, 152, 1.0, 1.0, true, true, false, false, [], [], 5, 0),
    pair(2, 140, 132, 1.0, 1.0, true, true, true, true, [], [], 5, 0)];
  eq('judge NO-GO median', WRAP.judgeGo(med2).verdict, 'NO-GO');
  const hold = [pair(1, 120, 120, 1.0, 0.90, true, true, false, false, [], [], 5, 0),
    pair(2, 140, 140, 1.0, 0.90, true, true, true, true, [], [], 5, 0)];
  eq('judge NO-GO hold', WRAP.judgeGo(hold).verdict, 'NO-GO');
  const wave2 = [pair(1, 120, 120, 1.0, 1.0, true, false, true, false, [], [], 5, 0),
    pair(2, 140, 140, 1.0, 1.0, true, false, true, false, [], [], 5, 0)];
  eq('judge NO-GO wave guard', WRAP.judgeGo(wave2).verdict, 'NO-GO');
  const viol = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 5, 1),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0)];
  eq('judge insufficient seasoned violation', WRAP.judgeGo(viol).verdict, 'INSUFFICIENT-DATA');
  const nofire = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 0, 0),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 0, 0)];
  eq('judge insufficient lever never fired', WRAP.judgeGo(nofire).verdict, 'INSUFFICIENT-DATA');
  const bad = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 5, 0),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0)];
  bad[0].armed.instrumentErrors = 3;
  bad[1].base.instrumentErrors = 3;
  bad[0].base.instrumentErrors = 3;
  eq('judge insufficient-data bad seeds', WRAP.judgeGo(bad).verdict, 'INSUFFICIENT-DATA');
})();

// Live harness smoke: tendseason 2-day run, instrument clean.
(async function () {
  try {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 99209, mode: 'tendseason-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const s0 = inst.snapshot();
    eq('smoke snapshot ovs array', Array.isArray(s0.ovs), true);
    eq('smoke snapshot funnel shape', typeof (s0.linkFunnel && s0.linkFunnel.total), 'number');
    await quietLog(async function () { await runDays(Game, pol, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    inst.snapshot();
    eq('smoke instrument errors zero', inst.t.instrumentErrors.length, 0);
    eq('smoke snapshots taken', inst.t.daily.length >= 2, true);
    inst.uninstall();
  } catch (e) {
    fail++;
    console.log('FAIL live smoke: ' + (e && e.stack ? e.stack.slice(0, 500) : e));
  }
  console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.log('FAIL harness: ' + e.stack); process.exitCode = 1; });
