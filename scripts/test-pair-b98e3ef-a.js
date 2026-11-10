// test-pair-b98e3ef-a.js — proof for the bandfreeze stability re-confirm
// (arm sim-pair-b98e3ef-a). G1 det-gate (classifier + broken-classifier /
// broken-recorder sensitivity + the 'the arena' registration + BAND-RULE
// judge synthetics + reproduction legs: every new corpus replays the
// bandfreeze corpus it re-checks), G3 corpus integrity on every new corpus.
// G2 recorder neutrality is CARRIED from bandfreeze-b (recorder unchanged
// since fd306cac1; frozen-instrument diff over the range is empty) and is
// NOT re-run here — see the prereg. Fixture-based; no sim, no harness load.
// Real-corpus legs run when the committed corpora exist and SKIP otherwise.
// Legs: F0r freeze re-check (8 seeds, current master 1fc09bbe3) must
// reproduce F0 exactly; L3r/L4r judge b98ac0730 (MOVER confirmed iff
// verdict MOVER, 5/8 with, 0 against, per-seed identical to bandfreeze);
// L5r/L6r judge e3ef2b612 (INERT confirmed iff verdict INERT, 0/8 move,
// daily rows byte-identical to bandfreeze). A single-seed move is a
// trajectory note, never a finger.
// Run: node scripts/test-pair-b98e3ef-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./analyze-53007-20261108');

const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function checkSkip(name, cond, extra) {
  if (cond === null) { skip++; console.log('SKIP ' + name + (extra ? ' — ' + extra : '')); }
  else check(name, cond, extra);
}
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}
function file(p) { return path.join(REPO, p); }
function w4kills(c) { return ((c.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length; }
function w4faced(c) { return ((c.finalSeat || {}).detail || {}).w4; }
function fallenN(c) { return (c.fallen || []).length; }
function seatDay(c) { return (c.takeseatStats || {}).seatDay; }

// --- The 'the arena' registration (this arm's classifier, carried) ---
const VIOLENT_PA = Object.assign({}, A.VIOLENT, { 'the arena': 1 });
function causeOf(f) { return (f && f.cause) ? String(f.cause) : 'unknown'; }
function classifyCorrected(fallen, livingAt30) {
  fallen = (fallen || []).slice().sort(function (a, b) { return (a.day | 0) - (b.day | 0); });
  const n = fallen.length;
  if (!n) return { mech: 'no-deaths', detail: 'no fallen entries' };
  const sick = fallen.filter(function (f) { return causeOf(f) === 'sickness'; });
  const violent = fallen.filter(function (f) { return !!VIOLENT_PA[causeOf(f)]; });
  const attr = fallen.filter(function (f) { return !!A.ATTRITION[causeOf(f)]; });
  const firstViolentDay = violent.length ? Math.min.apply(null, violent.map(function (f) { return f.day | 0; })) : null;
  const thirdSickDay = sick.length >= 3 ? sick[2].day : null;
  if (causeOf(fallen[0]) === 'sickness' && sick.length / n >= 0.4 &&
      (firstViolentDay == null || thirdSickDay == null || firstViolentDay > thirdSickDay)) {
    return { mech: 'sickness-first', detail: 'first death sickness d' + fallen[0].day + '; sickness ' + sick.length + '/' + n + '; first violent ' + (firstViolentDay == null ? 'never' : 'd' + firstViolentDay) };
  }
  const first3Violent = fallen.length >= 3 && fallen.slice(0, 3).every(function (f) { return !!VIOLENT_PA[causeOf(f)]; });
  const lateAttr = attr.filter(function (f) { return (f.day | 0) > 30; }).length;
  if (first3Violent && livingAt30 != null && livingAt30 < 8 && lateAttr >= 3) {
    return { mech: 'attrition-after-thinning', detail: 'first 3 deaths violent; living d30=' + livingAt30 + '; ' + lateAttr + ' attrition deaths after d30' };
  }
  const starv = fallen.filter(function (f) { return causeOf(f) === 'starvation'; });
  const lastDay = fallen[n - 1].day;
  const tail = fallen.filter(function (f) { return (f.day | 0) >= lastDay - 7; });
  const tailStarv = tail.filter(function (f) { return causeOf(f) === 'starvation'; }).length;
  if (starv.length >= 2 && tailStarv >= 1 && tailStarv >= Math.ceil(tail.filter(function (f) { return !!A.ATTRITION[causeOf(f)]; }).length / 2)) {
    return { mech: 'starvation-led', detail: starv.length + ' starvation deaths; ' + tailStarv + ' in the final 7 days' };
  }
  if (violent.length / n >= 0.6) {
    return { mech: 'combat-led', detail: 'violent ' + violent.length + '/' + n };
  }
  const mix = {};
  fallen.forEach(function (f) { const c = causeOf(f); mix[c] = (mix[c] || 0) + 1; });
  return { mech: 'mixed/other', detail: 'cause mix ' + JSON.stringify(mix) };
}

// --- THE BAND RULE (binding, carried verbatim from the bandfreeze prereg) ---
// standing: DOWN if fix-pre <= -6, UP if >= +6, else stable (±5 tolerance).
// w4 kills: DOWN if fix < pre, UP if fix > pre, else stable.
// fallen count: UP if fix > pre, DOWN if fix < pre, else stable.
// Pair (b): per-field majority direction read off the data; a seed moves
// with the pair iff >=2 of its 3 fields move in their majority direction
// and none moves opposite. MOVER iff >=5/8 with and 0 opposite; INERT iff
// no seed moves on any field; else MIXED.
function fieldMoves(pre, fix) {
  const dStanding = (fix.standing | 0) - (pre.standing | 0);
  const standing = dStanding <= -6 ? -1 : (dStanding >= 6 ? 1 : 0);
  const dW4 = w4kills(fix) - w4kills(pre);
  const w4 = dW4 < 0 ? -1 : (dW4 > 0 ? 1 : 0);
  const dFallen = fallenN(fix) - fallenN(pre);
  const fallen = dFallen > 0 ? 1 : (dFallen < 0 ? -1 : 0);
  return { standing: standing, w4: w4, fallen: fallen };
}
function seedMoveVs(pre, fix, dir) {
  const m = fieldMoves(pre, fix);
  let withDir = 0, against = 0;
  Object.keys(dir).forEach(function (k) {
    if (m[k] === dir[k]) withDir++;
    else if (m[k] === -dir[k]) against++;
  });
  if (withDir >= 2 && against === 0) return 'with';
  if (against >= 2 && withDir === 0) return 'against';
  return 'none';
}
function judgePairB(preBySeed, fixBySeed) {
  const seeds = Object.keys(preBySeed).sort();
  const moves = {};
  seeds.forEach(function (s) { moves[s] = fieldMoves(preBySeed[s], fixBySeed[s]); });
  const dir = {};
  ['standing', 'w4', 'fallen'].forEach(function (k) {
    let up = 0, down = 0;
    seeds.forEach(function (s) { if (moves[s][k] === 1) up++; if (moves[s][k] === -1) down++; });
    dir[k] = up > down ? 1 : (down > up ? -1 : 0);
  });
  const effDir = {};
  Object.keys(dir).forEach(function (k) { if (dir[k] !== 0) effDir[k] = dir[k]; });
  const perSeed = {};
  let withN = 0, againstN = 0, anyMove = 0;
  seeds.forEach(function (s) {
    const m = moves[s];
    if (m.standing !== 0 || m.w4 !== 0 || m.fallen !== 0) anyMove++;
    const mv = seedMoveVs(preBySeed[s], fixBySeed[s], effDir);
    perSeed[s] = mv;
    if (mv === 'with') withN++;
    if (mv === 'against') againstN++;
  });
  const verdict = (withN >= 5 && againstN === 0) ? 'MOVER'
    : (anyMove === 0) ? 'INERT' : 'MIXED';
  return { verdict: verdict, with: withN, against: againstN, anyMove: anyMove, dir: dir, perSeed: perSeed };
}

// bandEndpoint(corpus): the binding-field tuple for freeze stability.
function bandEndpoint(c) {
  return {
    days: c.days, endReason: c.endReason, villageLost: !!c.villageLost,
    standing: c.standing | 0, seatDay: seatDay(c), w4: w4kills(c),
    w4faced: w4faced(c), fallen: (c.fallen || []).slice(),
    living: (c.daily && c.daily.length) ? c.daily[c.daily.length - 1].living : null,
  };
}
function endpointsEqual(a, b) {
  return JSON.stringify(bandEndpoint(a)) === JSON.stringify(bandEndpoint(b));
}

// corporaEqualModuloRun(a, b): the two corpora are identical except for the
// leg label ('run') and the known anchor quirk ('anchorCommit' reads the
// worktree tip, not the SHA under test). Anything else differing is drift.
function corporaEqualModuloRun(a, b) {
  const ka = Object.keys(a).filter(function (k) { return k !== 'run' && k !== 'anchorCommit'; });
  const kb = Object.keys(b).filter(function (k) { return k !== 'run' && k !== 'anchorCommit'; });
  if (ka.length !== kb.length) return false;
  return ka.every(function (k) {
    return JSON.stringify(a[k]) === JSON.stringify(b[k]);
  });
}

// firstDivergence(a, b): first day whose (living, pantry, sick, wounded,
// hungry) first-row-per-day differs between two corpora; null when none.
function firstDivergence(a, b) {
  if (!a || !b || !a.daily || !b.daily) return null;
  const firstA = {}, firstB = {};
  a.daily.forEach(function (r) { if (firstA[r.day] === undefined) firstA[r.day] = r; });
  b.daily.forEach(function (r) { if (firstB[r.day] === undefined) firstB[r.day] = r; });
  const days = Object.keys(firstA).concat(Object.keys(firstB).filter(function (d) { return firstA[d] === undefined; }))
    .map(function (d) { return d | 0; }).sort(function (x, y) { return x - y; });
  for (const day of days) {
    const ra = firstA[day], rb = firstB[day];
    if (!ra || !rb) continue;
    const da = ra.diag || {}, db = rb.diag || {};
    if (ra.living !== rb.living || da.pantryKcal !== db.pantryKcal || da.sickN !== db.sickN ||
        da.woundedN !== db.woundedN || da.hungryN !== db.hungryN) return day;
  }
  return null;
}

// --- G1: 'the arena' registration (carried) ---
check('G1: "the arena" IS registered VIOLENT in this arm classifier',
  !!VIOLENT_PA['the arena']);
check('G1: "the arena" is NOT in the frozen analyzer VIOLENT map (unchanged overlay)',
  !A.VIOLENT['the arena']);
const arenaFixture = [
  { day: 31, cause: 'the arena' }, { day: 40, cause: 'monster' }, { day: 44, cause: 'contest' },
  { day: 45, cause: 'sickness' }, { day: 50, cause: 'sickness' },
];
check('G1: arena fixture classifies combat-led under the corrected rule (3/5 violent with arena)',
  classifyCorrected(arenaFixture, 11).mech === 'combat-led');
check('G1: same arena fixture classifies mixed/other under the frozen rule (named, not re-scored)',
  A.classify(arenaFixture, 11).mech === 'mixed/other');

// --- G1: band-rule synthetics (the judge itself, tested before it judges) ---
function synthEndpoint(standing, w4, fallen) {
  const kills = [];
  for (let i = 0; i < w4; i++) kills.push({ d: 50 + i, mid: 'x', w: 4, by: 'v', via: 'wild', trick: null });
  const fl = [];
  for (let i = 0; i < fallen; i++) fl.push({ day: 20 + i, name: 'V' + i, cause: 'sickness' });
  return { seed: 53011, days: 150, gameDays: 150, endReason: 'survived', villageLost: false, standing: standing, takeseatStats: { seatDay: 90 }, waveKillLog: kills, fallen: fl, daily: [], instrumentErrors: [] };
}
function bandOf(preFn, fixFn) {
  const pre = {}, fix = {};
  for (let s = 53011; s <= 53018; s++) { pre[s] = preFn(s); fix[s] = fixFn(s); }
  return { pre: pre, fix: fix };
}
(function () {
  // MOVER: 5 seeds move standing+w4 up, 3 stable, 0 opposite, fallen tied.
  const b = bandOf(
    function () { return synthEndpoint(199, 0, 10); },
    function (s) { return s <= 53015 ? synthEndpoint(300, 3, 10) : synthEndpoint(199, 0, 10); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 5/8 move with the pair, 0 opposite => MOVER (with=' + j.with + ')',
    j.verdict === 'MOVER' && j.with === 5 && j.against === 0);
})();
(function () {
  // INERT: all 8 identical.
  const b = bandOf(
    function () { return synthEndpoint(199, 2, 10); },
    function () { return synthEndpoint(199, 2, 10); });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 0/8 move on any field => INERT (anyMove=' + j.anyMove + ')',
    j.verdict === 'INERT' && j.anyMove === 0);
})();
(function () {
  // MIXED: 3 with, 2 against (field direction reads up, 3 up vs 2 down).
  const b = bandOf(
    function () { return synthEndpoint(300, 2, 6); },
    function (s) {
      if (s <= 53013) return synthEndpoint(400, 4, 6);
      if (s <= 53015) return synthEndpoint(200, 0, 6);
      return synthEndpoint(300, 2, 6);
    });
  const j = judgePairB(b.pre, b.fix);
  check('G1 band (b): 3 with, 2 against => MIXED (with=' + j.with + ', against=' + j.against + ')',
    j.verdict === 'MIXED' && j.with === 3 && j.against === 2);
})();
(function () {
  // ±5 standing tolerance: a 5-point standing move alone never moves a seed.
  const pre = synthEndpoint(199, 2, 10);
  const fix = synthEndpoint(204, 2, 10);
  const m = fieldMoves(pre, fix);
  check('G1 band (b): standing +5 alone is stable (tolerance boundary)',
    m.standing === 0 && m.w4 === 0 && m.fallen === 0);
  const fix2 = synthEndpoint(205, 2, 10);
  check('G1 band (b): standing +6 moves UP (tolerance boundary)',
    fieldMoves(pre, fix2).standing === 1);
})();

// --- G3: integrity synthetics (a broken recorder must fail) ---
function goodCorpus() {
  const daily = [];
  for (let d = 2; d <= 10; d++) {
    if (d === 3) continue;
    daily.push({ day: d, living: d < 5 ? 12 : 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  }
  daily.push({ day: 10, living: 11, diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null } });
  return { seed: 53011, days: 10, gameDays: 10, endReason: 'village-lost', daily: daily, fallen: [{ day: 5, name: 'X', cause: 'sickness' }], instrumentErrors: [] };
}
check('G3: good synthetic corpus (instrument shape) PASSES integrity', A.checkCorpus(goodCorpus()).ok);
const noDiag = goodCorpus();
noDiag.daily[3].diag = null;
check('G3: broken recorder (diag dropped on a row) FAILS integrity', !A.checkCorpus(noDiag).ok);
const withErr = goodCorpus();
withErr.instrumentErrors = ['diag-53007: boom'];
check('G3: instrument errors FAIL integrity', !A.checkCorpus(withErr).ok);

// --- Real corpora: this run's legs vs the bandfreeze reference ---
const NEWDIR = 'evidence/2026-11-09/perseed-pair-b98e3ef-a/';
const OLD_DIR = 'evidence/2026-11-09/perseed-bandfreeze-b/';
const SEEDS = [53011, 53012, 53013, 53014, 53015, 53016, 53017, 53018];
function loadNew(run) {
  const out = {};
  SEEDS.forEach(function (s) {
    out[s] = readJson(file(NEWDIR + 'doorwalk-53007-a-s' + s + '-' + run + '.json'));
  });
  return out;
}
function loadOld(run) {
  const out = {};
  SEEDS.forEach(function (s) {
    out[s] = readJson(file(OLD_DIR + 'doorwalk-53007-a-s' + s + '-' + run + '.json'));
  });
  return out;
}
const f0r = loadNew('pair-b98e3ef-a-freeze');
const f0 = loadOld('bandfreeze-b-freeze');
const l3r = loadNew('pair-b98e3ef-a-pre-b98f');
const l3 = loadOld('bandfreeze-b-pre-b98f');
const l4r = loadNew('pair-b98e3ef-a-b98f');
const l4 = loadOld('bandfreeze-b-b98f');
const l5r = loadNew('pair-b98e3ef-a-pre-e3ef');
const l5 = loadOld('bandfreeze-b-pre-e3ef');
const l6r = loadNew('pair-b98e3ef-a-e3ef');
const l6 = loadOld('bandfreeze-b-e3ef');

['pair-b98e3ef-a-freeze', 'pair-b98e3ef-a-pre-b98f', 'pair-b98e3ef-a-b98f', 'pair-b98e3ef-a-pre-e3ef', 'pair-b98e3ef-a-e3ef'].forEach(function (run) {
  const leg = loadNew(run);
  SEEDS.forEach(function (s) {
    checkSkip('G3 real: ' + run + ' seed ' + s + ' corpus integrity',
      leg[s] ? A.checkCorpus(leg[s]).ok : null,
      leg[s] ? A.checkCorpus(leg[s]).problems.join('; ') : 'no corpus for ' + s + ' yet');
    checkSkip('G3 real: ' + run + ' seed ' + s + ' has 0 instrument errors',
      leg[s] ? (leg[s].instrumentErrors || []).length === 0 : null,
      leg[s] ? ('errors: ' + (leg[s].instrumentErrors || []).join('; ')) : 'no corpus for ' + s + ' yet');
  });
});

// F0r: freeze STABLE on current master — endpoints exact, corpora identical
// modulo the leg label and the known anchor quirk.
SEEDS.forEach(function (s) {
  checkSkip('G1 real: F0r STABLE seed ' + s + ' (endpoint == F0 endpoint, exact)',
    (f0r[s] && f0[s]) ? endpointsEqual(f0r[s], f0[s]) : null,
    (f0r[s] && f0[s]) ? 'F0r ' + JSON.stringify(bandEndpoint(f0r[s])) + ' vs F0 ' + JSON.stringify(bandEndpoint(f0[s])) : 'F0r/F0 pair not present yet');
  checkSkip('G1 real: F0r seed ' + s + ' corpus == F0 modulo run/anchorCommit',
    (f0r[s] && f0[s]) ? corporaEqualModuloRun(f0r[s], f0[s]) : null,
    'F0r/F0 pair not present yet');
});

// Pair legs: reproduction of the bandfreeze corpora, exact.
[['L3r pre-secret', l3r, l3], ['L4r secret', l4r, l4], ['L5r pre-place', l5r, l5], ['L6r place', l6r, l6]].forEach(function (t) {
  SEEDS.forEach(function (s) {
    checkSkip('G1 real: ' + t[0] + ' seed ' + s + ' endpoint == bandfreeze',
      (t[1][s] && t[2][s]) ? endpointsEqual(t[1][s], t[2][s]) : null,
      (t[1][s] && t[2][s]) ? 'new ' + JSON.stringify(bandEndpoint(t[1][s])) + ' vs old ' + JSON.stringify(bandEndpoint(t[2][s])) : 'pair not present yet');
    checkSkip('G1 real: ' + t[0] + ' seed ' + s + ' corpus == bandfreeze modulo run/anchorCommit',
      (t[1][s] && t[2][s]) ? corporaEqualModuloRun(t[1][s], t[2][s]) : null,
      'pair not present yet');
  });
});

// Pair verdicts, judged on the NEW corpora under the band rule.
checkSkip('G1 real: pair (b/b98f) re-confirm judges MOVER, 5 with, 0 against',
  (l3r[53011] && l4r[53011]) ? (function () {
    const j = judgePairB(l3r, l4r);
    console.log('    pair (b/b98f) re-run verdict: ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', anyMove=' + j.anyMove + ', dir=' + JSON.stringify(j.dir) + ', per-seed=' + JSON.stringify(j.perSeed) + ')');
    return j.verdict === 'MOVER' && j.with === 5 && j.against === 0;
  })() : null, 'L3r/L4r never ran');
checkSkip('G1 real: pair (b/b98f) per-seed map identical to bandfreeze (53013/14/15/17/18 with)',
  (l3r[53011] && l4r[53011]) ? (function () {
    const j = judgePairB(l3r, l4r);
    const want = { 53011: 'none', 53012: 'none', 53013: 'with', 53014: 'with', 53015: 'with', 53016: 'none', 53017: 'with', 53018: 'with' };
    return SEEDS.every(function (s) { return j.perSeed[s] === want[s]; });
  })() : null, 'L3r/L4r never ran');
checkSkip('G1 real: pair (b/b98f) first divergences identical to bandfreeze (d11/d29/d21/d9/d18/d75/d15/d9)',
  (l3r[53011] && l4r[53011]) ? (function () {
    const want = { 53011: 11, 53012: 29, 53013: 21, 53014: 9, 53015: 18, 53016: 75, 53017: 15, 53018: 9 };
    return SEEDS.every(function (s) { return firstDivergence(l3r[s], l4r[s]) === want[s]; });
  })() : null, 'L3r/L4r never ran');
checkSkip('G1 real: pair (b/e3ef) re-confirm judges INERT, 0 moves',
  (l5r[53011] && l6r[53011]) ? (function () {
    const j = judgePairB(l5r, l6r);
    console.log('    pair (b/e3ef) re-run verdict: ' + j.verdict + ' (with=' + j.with + ', against=' + j.against + ', anyMove=' + j.anyMove + ', dir=' + JSON.stringify(j.dir) + ', per-seed=' + JSON.stringify(j.perSeed) + ')');
    return j.verdict === 'INERT' && j.anyMove === 0 && j.with === 0 && j.against === 0;
  })() : null, 'L5r/L6r never ran');
checkSkip('G1 real: pair (b/e3ef) first divergence is null on all 8 seeds',
  (l5r[53011] && l6r[53011]) ? SEEDS.every(function (s) { return firstDivergence(l5r[s], l6r[s]) === null; }) : null,
  'L5r/L6r never ran');

// Per-seed table values match the bandfreeze evidence tables (standing / w4 /
// fallen) — the verdict binds to the tables, not to the evidence text totals.
const TABLE_L3 = { 53011: [199, 4, 16], 53012: [125, 0, 8], 53013: [199, 0, 7], 53014: [199, 3, 19], 53015: [199, 1, 18], 53016: [669, 4, 13], 53017: [135, 0, 6], 53018: [159, 0, 12] };
const TABLE_L4 = { 53011: [199, 0, 15], 53012: [125, 0, 9], 53013: [284, 3, 4], 53014: [325, 4, 14], 53015: [495, 5, 13], 53016: [559, 6, 15], 53017: [695, 12, 26], 53018: [199, 3, 16] };
const TABLE_L5 = { 53011: [199, 2, 14], 53012: [125, 0, 8], 53013: [199, 0, 7], 53014: [345, 3, 19], 53015: [754, 11, 8], 53016: [539, 7, 12], 53017: [135, 0, 6], 53018: [159, 0, 12] };
[['L3r', l3r, TABLE_L3], ['L4r', l4r, TABLE_L4], ['L5r', l5r, TABLE_L5], ['L6r', l6r, TABLE_L5]].forEach(function (t) {
  checkSkip('G1 real: ' + t[0] + ' per-seed (standing, w4, fallen) == bandfreeze evidence table',
    t[1][53011] ? SEEDS.every(function (s) {
      return t[1][s].standing === t[2][s][0] && w4kills(t[1][s]) === t[2][s][1] && fallenN(t[1][s]) === t[2][s][2];
    }) : null, 'leg never ran');
});

// Cost bar (scalemetric-adapted): medians and starvation counts equal the
// bandfreeze legs exactly (bar allows median within 20d, starvation +2).
function medianDays(leg) {
  const ds = SEEDS.map(function (s) { return leg[s].days; }).sort(function (a, b) { return a - b; });
  return (ds[3] + ds[4]) / 2;
}
function starvN(leg) {
  let n = 0;
  SEEDS.forEach(function (s) { (leg[s].fallen || []).forEach(function (f) { if (f.cause === 'starvation') n++; }); });
  return n;
}
[['L3r', l3r, 95, 5], ['L4r', l4r, 115, 4], ['L5r', l5r, 72.5, 4], ['L6r', l6r, 72.5, 4]].forEach(function (t) {
  checkSkip('G1 real: cost bar ' + t[0] + ' median ' + medianDays(t[1]) + 'd vs bandfreeze ' + t[2] + 'd (within 20d)',
    t[1][53011] ? Math.abs(medianDays(t[1]) - t[2]) <= 20 : null, 'leg never ran');
  checkSkip('G1 real: cost bar ' + t[0] + ' starvation ' + starvN(t[1]) + ' vs bandfreeze ' + t[3] + ' (<= +2)',
    t[1][53011] ? starvN(t[1]) <= t[3] + 2 : null, 'leg never ran');
});

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
