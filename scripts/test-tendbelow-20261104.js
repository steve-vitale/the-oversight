// test-tendbelow-20261104.js — proof for the tend-below-seasoned-bar
// leg with a decision-time tend classifier (arm sim-tendbelow-b).
// Fixture tests for: the tendbelow policy (EXACTLY the
// seasoned-bar restriction added to tend-through; tend-through,
// leadcourt, and tendseason-b untouched), the belowSeasonedBar
// predicate boundaries, the decision-time wrapper (unit-tested
// against a fake Game, including the tendseason 99209 pattern:
// snapshot trust 46 seasoned vs decision trust 38 below bar),
// decision-time-only summarize (snapshots never classify tends),
// survival bands, ever-faced wave detection, pooled hold-share,
// and the prereg GO judge (all five legs + insufficient-data),
// plus a live harness smoke test: loadGame + diplo instrument +
// decision wrapper + 2-day leadcourt-tendbelow-b run, 0
// instrument errors. Writes nothing to the repo (in-memory only).
// Usage: node scripts/test-tendbelow-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const WRAP = require(path.join(REPO, 'scripts', 'test-tendbelow-analyze-20261104'));
const INST = require(path.join(REPO, 'scripts', 'diplo-instrument-20261104'));
const DRV = require(path.join(REPO, 'scripts', 'test-tendbelow-driver-20261104'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}

// 1. Tendbelow policy: exactly one restriction added to tend-through.
const belowText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendbelow-b.js'), 'utf8');
const throughText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough.js'), 'utf8');
const seasonText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendseason-b.js'), 'utf8');
const leadText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'leadcourt.js'), 'utf8');
eq('below gate helper present', belowText.indexOf('belowSeasonedBar') >= 0, true);
eq('below gate age bar 30', belowText.indexOf('age < 30') >= 0, true);
eq('below gate trust bar 40', belowText.indexOf('(link.trust || 0) < 40') >= 0, true);
eq('below keeps weekly check', belowText.indexOf('link.tendedWeek !== week') >= 0, true);
eq('below keeps Haven-primary tend', belowText.indexOf("link.primary === 'haven'") >= 0, true);
eq('below keeps proposal gate 12000', belowText.indexOf('pantryKcal(Game) > 12000') >= 0, true);
eq('below has no 20000 tend gate', belowText.indexOf('pantryKcal(Game) > 20000'), -1);
eq('below has no 13500 floor gate', belowText.indexOf('pantryKcal(Game) > 13500'), -1);
eq('tendthrough has no below gate', throughText.indexOf('belowSeasonedBar'), -1);
eq('tendseason file untouched by this arm (still own id)', seasonText.indexOf('leadcourt-tendseason-b') >= 0, true);
eq('leadcourt still has 20000 tend gate', leadText.indexOf('pantryKcal(Game) > 20000') >= 0, true);
const pol = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendbelow-b')).leadcourtTendbelowB;
eq('below id', pol.id, 'leadcourt-tendbelow-b');
eq('below daily fn', typeof pol.daily, 'function');
const polBase = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendthrough')).leadcourtTendthrough;
eq('baseline id', polBase.id, 'leadcourt-tendthrough');

// 2. Predicate boundaries (fake Game: scholar day + link day/trust).
const belowFn = require(path.join(REPO, 'scripts', 'policies', 'leadcourt-tendbelow-b')).belowSeasonedBar;
function fakeGame(day) { return { state: { scholar: { day: day } } }; }
eq('predicate age30 trust40 = seasoned (not below)', belowFn(fakeGame(100), { day: 70, trust: 40 }), false);
eq('predicate age30 trust39 = below', belowFn(fakeGame(100), { day: 70, trust: 39 }), true);
eq('predicate age29 trust99 = below', belowFn(fakeGame(100), { day: 71, trust: 99 }), true);
eq('predicate age100 trust40 = seasoned', belowFn(fakeGame(100), { day: 0, trust: 40 }), false);
eq('predicate age0 trust30 = below', belowFn(fakeGame(50), { day: 50, trust: 30 }), true);
eq('predicate age68 trust38 = below (99209 pattern)', belowFn(fakeGame(97), { day: 29, trust: 38 }), false === false ? true : false);

// 3. Decision wrapper unit tests (fake Game).
(function () {
  function fakeGame2(day, links, paid) {
    const inner = function (id) { return paid; };
    return { state: { scholar: { day: day } },
      hierarchyState: function () { return links; }, tendLink: inner, _inner: inner };
  }
  // Seasoned link, paid tend.
  let g = fakeGame2(100, [{ id: 'l1', day: 70, trust: 70 }], 1500);
  const before1 = g.tendLink;
  const w1 = DRV.installDecisionWrapper(g, []);
  const ret1 = g.tendLink('l1');
  eq('wrapper passthrough paid', ret1, 1500);
  eq('wrapper seasoned event cls', w1.events.length === 1 && w1.events[0].cls, 'seasoned');
  eq('wrapper seasoned preTrust', w1.events[0].preTrust, 70);
  eq('wrapper seasoned preAge', w1.events[0].preAge, 30);
  w1.restore();
  eq('wrapper restore returns inner', g.tendLink, before1);
  // 99209 pattern: decision trust 38, age 68, refused (paid 0) -> below.
  g = fakeGame2(97, [{ id: 'lx', day: 29, trust: 38 }], 0);
  const w2 = DRV.installDecisionWrapper(g, []);
  g.tendLink('lx');
  eq('wrapper 99209 pattern cls below', w2.events[0].cls, 'below');
  eq('wrapper 99209 pattern paid 0', w2.events[0].paid, 0);
  eq('wrapper 99209 pattern preTrust 38', w2.events[0].preTrust, 38);
  // Missing link -> unknown.
  g = fakeGame2(50, [{ id: 'other', day: 10, trust: 90 }], 1500);
  const w3 = DRV.installDecisionWrapper(g, []);
  g.tendLink('ghost');
  eq('wrapper missing link unknown', w3.events[0].cls, 'unknown');
  // Inner throw propagates, no event recorded.
  const g4 = { state: { scholar: { day: 10 } }, hierarchyState: function () { return []; },
    tendLink: function () { throw new Error('boom'); } };
  const w4 = DRV.installDecisionWrapper(g4, []);
  let threw = false;
  try { g4.tendLink('x'); } catch (e) { threw = true; }
  eq('wrapper throw propagates', threw, true);
  eq('wrapper throw records no event', w4.events.length, 0);
})();

// 4. Survival bands.
eq('band A horizon', WRAP.bandFor(300, 'horizon'), 'A');
eq('band B', WRAP.bandFor(200, 'lost'), 'B');
eq('band C', WRAP.bandFor(143, 'lost'), 'C');
eq('band D', WRAP.bandFor(98, 'lost'), 'D');

// 5. Median.
eq('median even', WRAP.median([10, -4, 3, 7]), 5);
eq('median odd', WRAP.median([1, 2, 9]), 2);

// 6. Summarize: decision-time classification ONLY — snapshots
// never classify tends. Fixture: snapshots all say link l1 is
// seasoned (trust 46, age 67), but the decision event for the
// day-97 tend says preTrust 38 (below bar, refused). The analyzer
// must count BELOW 1, SEASONED 0 — the tendseason mislabel,
// corrected. A second tend with a seasoned decision event
// counts seasoned; paid totals come from decision events.
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
  function detailFor(day) {
    return [link('l1', 46, 29, true, 'active')];
  }
  const daily = [].concat(
    daysRange(60, 96, function (d) { return snap(d, 102, detailFor(d), 30000, d === 70, false); }),
    daysRange(97, 100, function (d) { return snap(d, 0, detailFor(d), 0, false, false); }));
  const out = { seed: 91501, policy: 'leadcourt-tendbelow-b', run: 'test', anchorCommit: 'test',
    days: 100, endReason: 'lost', won: false, villageLost: true, scaleRank: 'regional',
    maxWave: 4, endUnlockedWave: 4, endCallMovedPeak: false, daily: daily,
    proposalEvents: [], courtshipEvents: [
      { day: 97, fn: 'tendLink', target: 'l1' },
      { day: 80, fn: 'tendLink', target: 'l1' },
    ],
    tendDecisionEvents: [
      { day: 97, link: 'l1', preTrust: 38, preDay: 29, preAge: 68, preSeasoned: false, paid: 0, cls: 'below' },
      { day: 80, link: 'l1', preTrust: 70, preDay: 29, preAge: 51, preSeasoned: true, paid: 1500, cls: 'seasoned' },
    ],
    travelCalls: [], linkFormedEvents: [], deathEvents: [], sayLines: [], wrapCounts: {}, instrumentErrors: [] };
  const s = WRAP.summarizeLeg(out);
  eq('summarize decision tend total', s.tendTotal, 2);
  eq('summarize decision total matches', s.tendDecisionMatch, true);
  eq('summarize decision below (99209 pattern)', s.tendBelowBar, 1);
  eq('summarize decision seasoned', s.tendSeasoned, 1);
  eq('summarize decision unknown', s.tendUnknown, 0);
  eq('summarize paid count', s.tendPaidCount, 1);
  eq('summarize paid kcal', s.tendPaidKcal, 1500);
  eq('summarize everW4 from mid-run snapshot', s.everW4, true);
  eq('summarize everW5 false', s.everW5, false);
  eq('summarize band', s.survivalBand, 'C');
  // Mismatch fixture: 2 calls, 1 decision record -> match false.
  const out2 = Object.assign({}, out, { tendDecisionEvents: [out.tendDecisionEvents[0]] });
  eq('summarize decision mismatch flagged', WRAP.summarizeLeg(out2).tendDecisionMatch, false);
})();

// 7. GO judge fixtures (prereg: (a) no regression, (b) median
// delta >= -5, (c) pooled hold within 0.05, (d) wave guard within
// 1, (e) drop guard armed <= base + 1; insufficient-data on bad
// seeds, zero baseline diplomacy, decision mismatch, armed
// unknown, armed seasoned, or zero below-bar tends).
function leg(seed, days, firstDiplo, postFirst, hold, everW4, everW5, errors, drops, below, seasoned, unknown, match) {
  return { seed: seed, days: days, endReason: 'lost', firstDiploDay: firstDiplo,
    postFirstSnapshots: postFirst, holdShare: hold, everW4: everW4, everW5: everW5,
    instrumentErrors: errors || 0, drops: drops || [], tendBelowBar: below || 0, tendSeasoned: seasoned || 0,
    tendUnknown: unknown || 0, tendDecisionMatch: match !== false, tendTotal: (below || 0) + (seasoned || 0) };
}
function band(d) { return d >= 300 ? 'A' : d >= 150 ? 'B' : d >= 100 ? 'C' : 'D'; }
function pair(seed, baseDays, armedDays, baseHold, armedHold, baseW4, armedW4, baseW5, armedW5, baseDrops, armedDrops, armedBelow, armedSeasoned, armedUnknown, match) {
  const BAND = { D: 0, C: 1, B: 2, A: 3 };
  const b = leg(seed, baseDays, 60, 40, baseHold, baseW4, baseW5, 0, baseDrops, 0, 0, 0, true);
  const a = leg(seed, armedDays, 60, 40, armedHold, armedW4, armedW5, 0, armedDrops, armedBelow, armedSeasoned, armedUnknown, match);
  return { seed: seed, base: b, armed: a, deltaDays: armedDays - baseDays,
    baseBand: band(baseDays), armedBand: band(armedDays),
    regressed: BAND[band(armedDays)] < BAND[band(baseDays)] };
}
(function () {
  const go = [pair(1, 120, 118, 1.0, 1.0, true, true, false, false, [], [], 5, 0, 0, true),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge GO', WRAP.judgeGo(go).verdict, 'GO');
  const drop = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [{}, {}], 5, 0, 0, true),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge NO-GO drop guard', WRAP.judgeGo(drop).verdict, 'NO-GO');
  eq('judge drop legE false', WRAP.judgeGo(drop).legE_pass, false);
  const reg = [pair(1, 120, 90, 1.0, 1.0, true, true, false, false, [], [], 5, 0, 0, true),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge NO-GO regression', WRAP.judgeGo(reg).verdict, 'NO-GO');
  const med2 = [pair(1, 160, 152, 1.0, 1.0, true, true, false, false, [], [], 5, 0, 0, true),
    pair(2, 140, 132, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge NO-GO median', WRAP.judgeGo(med2).verdict, 'NO-GO');
  const hold = [pair(1, 120, 120, 1.0, 0.90, true, true, false, false, [], [], 5, 0, 0, true),
    pair(2, 140, 140, 1.0, 0.90, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge NO-GO hold', WRAP.judgeGo(hold).verdict, 'NO-GO');
  const wave2 = [pair(1, 120, 120, 1.0, 1.0, true, false, true, false, [], [], 5, 0, 0, true),
    pair(2, 140, 140, 1.0, 1.0, true, false, true, false, [], [], 5, 0, 0, true)];
  eq('judge NO-GO wave guard', WRAP.judgeGo(wave2).verdict, 'NO-GO');
  const viol = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 5, 1, 0, true),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge insufficient decision seasoned violation', WRAP.judgeGo(viol).verdict, 'INSUFFICIENT-DATA');
  const unk = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 5, 0, 1, true),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge insufficient unknown decision', WRAP.judgeGo(unk).verdict, 'INSUFFICIENT-DATA');
  const mis = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 5, 0, 0, false),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  eq('judge insufficient decision mismatch', WRAP.judgeGo(mis).verdict, 'INSUFFICIENT-DATA');
  const nofire = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 0, 0, 0, true),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 0, 0, 0, true)];
  eq('judge insufficient lever never fired', WRAP.judgeGo(nofire).verdict, 'INSUFFICIENT-DATA');
  const bad = [pair(1, 120, 120, 1.0, 1.0, true, true, false, false, [], [], 5, 0, 0, true),
    pair(2, 140, 140, 1.0, 1.0, true, true, true, true, [], [], 5, 0, 0, true)];
  bad[0].armed.instrumentErrors = 3;
  bad[1].base.instrumentErrors = 3;
  bad[0].base.instrumentErrors = 3;
  eq('judge insufficient-data bad seeds', WRAP.judgeGo(bad).verdict, 'INSUFFICIENT-DATA');
})();

// Live harness smoke: tendbelow 2-day run, instrument + decision wrapper clean.
(async function () {
  try {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 91501, mode: 'tendbelow-smoke', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const instWrapped = Game.tendLink;
    const dw = DRV.installDecisionWrapper(Game, []);
    const s0 = inst.snapshot();
    eq('smoke snapshot ovs array', Array.isArray(s0.ovs), true);
    eq('smoke snapshot funnel shape', typeof (s0.linkFunnel && s0.linkFunnel.total), 'number');
    eq('smoke decision wrapper installed', Game.tendLink !== instWrapped, true);
    await quietLog(async function () { await runDays(Game, pol, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    inst.snapshot();
    eq('smoke instrument errors zero', inst.t.instrumentErrors.length, 0);
    eq('smoke snapshots taken', inst.t.daily.length >= 2, true);
    eq('smoke decision events array', Array.isArray(dw.events), true);
    dw.restore();
    eq('smoke decision restore returns instrument wrap', Game.tendLink, instWrapped);
    inst.uninstall();
  } catch (e) {
    fail++;
    console.log('FAIL live smoke: ' + (e && e.stack ? e.stack.slice(0, 500) : e));
  }
  console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.log('FAIL harness: ' + e.stack); process.exitCode = 1; });
