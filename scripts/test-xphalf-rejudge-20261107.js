// test-xphalf-rejudge-20261107.js — reproduction gate for the XP-half re-judgment
// (arm sim-xphalf-rejudge-b, run fleshout-loop-b-20261108T0245Z). DIAG, zero src/js.
// Verifies the judged corpora against the CORRECTED C1 bar (prereg
// evidence/2026-11-07/sim-xphalf-rejudge-b-prereg.md): C1 median + sits +
// per-seed headline match vs the bisect's C1 table; P1 early deaths +
// median + sits. The first-death leg is DROPPED (findings #1901) — this
// gate asserts the #1901 fact instead (C1 first deaths before d28 on
// exactly 53001/53004/53005/53007/53008) and contains no first-death >= d28
// assertion anywhere. Also verifies anchors, 0 instrument errors, the
// analyzer's classifications on the three early-death seeds (re-verified,
// not re-scored), and the scale-wall numbers.
// Usage:
//   node scripts/test-xphalf-rejudge-20261107.js [c1dir] [p1dir]
// Defaults to the committed corpora under evidence/2026-11-07/xphalf-c1/
// and evidence/2026-11-07/xphalf-p1/ (paths relative to the repo root).
// Exit 0 when every check passes; exit 1 otherwise.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./analyze-xphalf-20261107');

const REPO = path.resolve(__dirname, '..');
const c1dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-07', 'xphalf-c1');
const p1dir = process.argv[3] || path.join(REPO, 'evidence', '2026-11-07', 'xphalf-p1');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// Bisect C1 table (evidence/2026-11-07/sim-frozenband-bisect-b.md §C1→C2):
// seed -> { days, seat: null | 'lesser d90' etc, standing, w4 }.
const C1_EXPECTED = {
  53001: { days: 150, seat: null, standing: 175, w4: 0 },
  53002: { days: 79, seat: null, standing: 125, w4: 0 },
  53003: { days: 150, seat: 'lesser d90', standing: 344, w4: 3 },
  53004: { days: 150, seat: 'lesser d94', standing: 260, w4: 2 },
  53005: { days: 97, seat: 'lesser d90', standing: 230, w4: 3 },
  53006: { days: 150, seat: 'lesser d90', standing: 849, w4: 8 },
  53007: { days: 86, seat: null, standing: 99, w4: 0 },
  53008: { days: 150, seat: 'lesser d90', standing: 199, w4: 0 },
};
const P1_EARLY = { 53003: 45, 53005: 62, 53007: 55 };
// #1901 fact: C1 first deaths before d28 on exactly these seeds.
const C1_EARLY_FIRST_DEATH = { 53001: 22, 53004: 19, 53005: 18, 53007: 13, 53008: 10 };
// Analyzer classifications observed in the 0214Z run (re-verified, not re-scored).
const P1_CLASSIFICATIONS = {
  53003: 'attrition-after-thinning',
  53005: 'attrition-after-thinning',
  53007: 'sickness-first',
};

function loadDir(dir, label) {
  const out = {};
  if (!fs.existsSync(dir)) { check(label + ' dir exists', false, dir + ' missing'); return out; }
  for (let s = 53001; s <= 53008; s++) {
    const f = path.join(dir, 'doorwalk-b-s' + s + '-doorwalk-baseline.json');
    if (!fs.existsSync(f)) { check(label + ' ' + s + ' file exists', false, f + ' missing'); continue; }
    try {
      const raw = fs.readFileSync(f, 'utf8');
      check(label + ' ' + s + ' parses (non-empty JSON)', raw.length > 0, '0 bytes');
      out[s] = JSON.parse(raw);
      check(label + ' ' + s + ' has seed field', out[s].seed === s);
    } catch (e) { check(label + ' ' + s + ' parses', false, e.message); }
  }
  check(label + ' has all 8 seeds', Object.keys(out).length === 8, Object.keys(out).length + '/8');
  return out;
}

function seatOf(j) {
  const ts = j.takeseatStats || {};
  if ((ts.seatTaken | 0) > 0) return (ts.seatKind || '?') + ' d' + ts.seatDay;
  return null;
}
function w4Of(j) {
  return ((j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); })).length;
}
function w5Of(j) {
  return ((j.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 5); })).length;
}
// First death by the fallen-entry death day (not the daily-living drop,
// which lags by a day when the death is recorded late in the day — e.g.
// C1 53001 Sanjay dies d22 but the living row drops on d23). This is the
// death day the #1901 finding cites.
function fallenFirstDeathDay(j) {
  const dated = A.deathCensus(j).entries.filter(function (e) { return e.day != null; })
    .sort(function (a, b) { return a.day - b.day; });
  return dated.length ? dated[0].day : null;
}

function main() {
  const c1 = loadDir(c1dir, 'C1');
  const p1 = loadDir(p1dir, 'P1');
  if (Object.keys(c1).length !== 8 || Object.keys(p1).length !== 8) {
    console.log('STOP: incomplete corpus — re-run the sweeps, do not judge.');
    process.exit(1);
  }

  // Anchors (construction identity).
  Object.keys(c1).forEach(function (s) {
    check('C1 ' + s + ' anchor 16369893cd64', c1[s].anchorCommit === '16369893cd64', String(c1[s].anchorCommit));
  });
  Object.keys(p1).forEach(function (s) {
    check('P1 ' + s + ' anchor 50881fbf2f64', p1[s].anchorCommit === '50881fbf2f64', String(p1[s].anchorCommit));
  });

  // Instrument errors: 0 everywhere.
  let errs = 0;
  [c1, p1].forEach(function (corpus) {
    Object.keys(corpus).forEach(function (s) { errs += ((corpus[s].instrumentErrors || []).length); });
  });
  check('instrument errors 0 across all 16 files', errs === 0, errs + ' errors');

  // C1 corrected bar: per-seed headline match vs the bisect table.
  Object.keys(C1_EXPECTED).forEach(function (s) {
    const e = C1_EXPECTED[s], j = c1[s];
    check('C1 ' + s + ' days ' + e.days, j.days === e.days, 'got ' + j.days);
    check('C1 ' + s + ' seat/sat ' + (e.seat || '—'), seatOf(j) === e.seat, 'got ' + seatOf(j));
    check('C1 ' + s + ' standing ' + e.standing, j.standing === e.standing, 'got ' + j.standing);
    check('C1 ' + s + ' w4 kills ' + e.w4, w4Of(j) === e.w4, 'got ' + w4Of(j));
  });
  const c1days = Object.keys(c1).map(function (s) { return c1[s].days; });
  const c1sits = Object.keys(c1).filter(function (s) { return seatOf(c1[s]) !== null; }).length;
  check('C1 median 150d', A.median(c1days) === 150, 'got ' + A.median(c1days));
  check('C1 sits 5/8', c1sits === 5, 'got ' + c1sits + '/8');

  // P1 bar: early deaths + median + sits.
  Object.keys(P1_EARLY).forEach(function (s) {
    check('P1 ' + s + ' early death ' + P1_EARLY[s] + 'd', p1[s].days === P1_EARLY[s], 'got ' + p1[s].days);
  });
  const p1days = Object.keys(p1).map(function (s) { return p1[s].days; });
  const p1sits = Object.keys(p1).filter(function (s) { return seatOf(p1[s]) !== null; }).length;
  check('P1 median 150d', A.median(p1days) === 150, 'got ' + A.median(p1days));
  check('P1 sits 4/8', p1sits === 4, 'got ' + p1sits + '/8');

  // #1901 regression fact: the corrected bar contains NO first-death leg
  // because the healthy C1 corpus itself has early first deaths. Assert the
  // exact set, so any future re-registration of a d28 leg fails loudly.
  Object.keys(C1_EARLY_FIRST_DEATH).forEach(function (s) {
    check('C1 ' + s + ' first death d' + C1_EARLY_FIRST_DEATH[s] + ' (#1901: before d28)',
      fallenFirstDeathDay(c1[s]) === C1_EARLY_FIRST_DEATH[s], 'got d' + fallenFirstDeathDay(c1[s]));
  });
  const c1Late = Object.keys(c1).filter(function (s) {
    return !(s in C1_EARLY_FIRST_DEATH);
  });
  check('C1 remaining seeds first death >= d28', c1Late.every(function (s) {
    return fallenFirstDeathDay(c1[s]) >= 28;
  }), c1Late.map(function (s) { return s + ':d' + fallenFirstDeathDay(c1[s]); }).join(' '));
  // The three shared early deaths: same seed, day, and person in C1 and P1
  // (pre-divergence trajectory — #1901).
  [['53001', 22, 'Sanjay'], ['53004', 19, 'Fritz'], ['53008', 10, 'Dieter']].forEach(function (row) {
    const seed = row[0], day = row[1], name = row[2];
    function firstOf(j) {
      const dated = A.deathCensus(j).entries.filter(function (e) { return e.day != null; })
        .sort(function (a, b) { return a.day - b.day; });
      return dated.length ? dated[0] : null;
    }
    const fc = firstOf(c1[seed]), fp = firstOf(p1[seed]);
    check('shared early death ' + seed + ' d' + day + ' ' + name + ' in C1 and P1',
      fc && fp && fc.day === day && fp.day === day && fc.name === name && fp.name === name,
      'C1:' + (fc ? 'd' + fc.day + ' ' + fc.name : '?') + ' P1:' + (fp ? 'd' + fp.day + ' ' + fp.name : '?'));
  });

  // Classifications re-verified on the judged corpora (observed, not re-scored).
  Object.keys(P1_CLASSIFICATIONS).forEach(function (s) {
    const got = A.classifyMechanism(p1[s]).mechanism;
    check('P1 ' + s + ' classification ' + P1_CLASSIFICATIONS[s], got === P1_CLASSIFICATIONS[s], 'got ' + got);
  });

  // Scale-wall numbers (reported, not a GO leg).
  function wall(corpus, label) {
    const seeds = Object.keys(corpus);
    const national = seeds.filter(function (s) { return corpus[s].scaleRank === 'national'; }).length;
    const wins = seeds.filter(function (s) { return !!corpus[s].won; }).length;
    const w4u = seeds.filter(function (s) { return (corpus[s].maxWave | 0) >= 4; }).length;
    const w5u = seeds.filter(function (s) { return (corpus[s].maxWave | 0) >= 5; }).length;
    console.log('WALL ' + label + ': national ' + national + '/8, table-sat ' +
      seeds.filter(function (s) { return seatOf(corpus[s]) !== null; }).length +
      '/8, wins ' + wins + '/8, wave-4 unlocks ' + w4u + '/8, wave-5 unlocks ' + w5u +
      '/8, median survival ' + A.median(seeds.map(function (s) { return corpus[s].days; })) + 'd');
    return { national: national, wins: wins, w4u: w4u, w5u: w5u };
  }
  const wc = wall(c1, 'C1');
  const wp = wall(p1, 'P1');
  check('C1 wall: national 0/8, wins 0/8, w4 7/8, w5 4/8',
    wc.national === 0 && wc.wins === 0 && wc.w4u === 7 && wc.w5u === 4,
    JSON.stringify(wc));
  check('P1 wall: national 0/8, wins 0/8, w4 6/8, w5 1/8',
    wp.national === 0 && wp.wins === 0 && wp.w4u === 6 && wp.w5u === 1,
    JSON.stringify(wp));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

if (require.main === module) main();
module.exports = { C1_EXPECTED: C1_EXPECTED, P1_EARLY: P1_EARLY, C1_EARLY_FIRST_DEATH: C1_EARLY_FIRST_DEATH };
