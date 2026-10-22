// taxonomy-recallsignal-b.js — earlier-signal DIAG instrument (OFFLINE).
//
// Named next of sim-recalldiag-b: the RECALL-TRIGGER v1 cliff trigger is a
// complete detector (5/5 collapses fired) but buys only 1-2d lead (bar 3d+).
// This instrument measures, on the EXISTING meal-row corpus (zero new sims,
// zero src/js, zero policy edits), whether the steve-call's earlier-signal
// variants buy the missing lead time:
//
//   (a) PACK    — pack kcal at decision time (pack buffer < X days of need).
//                 Corpus check: is any pack-kcal field retained per
//                 villager-day? Proxy: pre-cliff `drawn` (did any case draw
//                 from pack in the 3 days BEFORE the cliff?).
//   (b) HP-GATE — HP-gated ranging (HP below threshold gates the away
//                 decision). Corpus check: is per-day HP retained? Proxy:
//                 wound-beat retainer over [cliffDay-7, deathDay] and over
//                 [expeditionStart-7, expeditionStart] (expeditionStart =
//                 first away-day of the maximal trailing away-run ending on
//                 the death day).
//   (c) FORECAST— the engine's `expected` patch-yield forecast voiced
//                 prospectively: triggerDayF = v1 Rule A with the cliff
//                 condition on `expected` instead of `produced`
//                 (expected[d] <= 0.50 x mean(expected trailing 7 away-days),
//                 >=3 away-days in baseline, baseline mean >= 800).
//
// Extends taxonomy-recalldiag-b.js (RECALLSIGNAL_B namespace): reuses
// triggerDay/fireDaysFor/episodes/leadTime/woundBeats/MAUL_RE/HURT_RE —
// nothing is re-implemented.
//
// Usage: node scripts/taxonomy-recallsignal-b.js   (prints the judged summary)

'use strict';
var fs = require('fs');
var path = require('path');
var base = require('./taxonomy-recalldiag-b.js');

var CORPUS_DIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-deathcause-b');
var CENSUS_PATH = path.join(__dirname, '..', 'evidence', '2026-10-22', 'trailstarve-census-b.json');

// ---------- (c) FORECAST trigger: cliff on `expected`, not `produced` ----------

function trailingAwayExpected(rowsByDay, d, n) {
  var vals = [];
  for (var dd = d - 1; dd >= 1 && vals.length < n; dd--) {
    var r = rowsByDay.get(dd);
    if (r && r.away) vals.push(r.expected);
  }
  return vals;
}

function triggerDayF(rowsByDay, d) {
  var r = rowsByDay.get(d);
  if (!r) return { fire: false, why: 'no-row' };
  if (!r.away) return { fire: false, why: 'not-away' };
  var awayN = 0, winN = 0;
  for (var dd = Math.max(1, d - 6); dd <= d; dd++) {
    var w = rowsByDay.get(dd);
    if (!w) continue;
    winN++;
    if (w.away) awayN++;
  }
  if (awayN < 4) return { fire: false, why: 'no-majority', awayN: awayN };
  var bx = trailingAwayExpected(rowsByDay, d, 7);
  if (bx.length < 3) return { fire: false, why: 'thin-baseline', baseN: bx.length };
  var mean = bx.reduce(function (a, b) { return a + b; }, 0) / bx.length;
  if (mean < 800) return { fire: false, why: 'baseline-too-low', baseline: Math.round(mean) };
  if (!(r.expected <= 0.50 * mean))
    return { fire: false, why: 'no-expected-dip', ratio: r.expected / mean };
  if (!(r.drawn >= 0.30 * r.need)) return { fire: false, why: 'no-pack-draw', drawn: r.drawn };
  return { fire: true, baseline: Math.round(mean), ratio: r.expected / mean,
           drawn: r.drawn, need: r.need };
}

function fireDaysForF(rowsByDay) {
  var days = Array.from(rowsByDay.keys()).sort(function (a, b) { return a - b; });
  var fires = [];
  days.forEach(function (d) {
    var t = triggerDayF(rowsByDay, d);
    if (t.fire) fires.push({ d: d, baseline: t.baseline, ratio: +t.ratio.toFixed(3) });
  });
  return fires;
}

// ---------- expedition start: first away-day of the maximal trailing
// away-run ending on the death day ----------

function expeditionStart(rowsByDay, deathDay) {
  var d = deathDay;
  while (rowsByDay.get(d) && rowsByDay.get(d).away) d--;
  return d + 1; // first away-day (may be 1)
}

// ---------- (a) PACK proxy: drawn on d-3..d-1 before the cliff ----------

function preCliffDrawn(rowsByDay, cliffDay) {
  var out = [];
  for (var d = cliffDay - 3; d <= cliffDay - 1; d++) {
    var r = rowsByDay.get(d);
    out.push({ d: d, away: !!(r && r.away),
               drawn: r ? r.drawn : null, need: r ? r.need : null });
  }
  return out;
}

// ---------- (b) HP proxy: wound beats over arbitrary windows ----------

function firstName(n) { return String(n).split(/\s+/)[0].toLowerCase(); }

function woundBeatsWindow(corpus, who, lo, hi) {
  var lines = (corpus.deathDayLines || []).concat(corpus.lossDayLines || []);
  var hits = [];
  var want = firstName(who);
  lines.forEach(function (e) {
    if (e.d < lo || e.d > hi) return;
    var text = e.line || '';
    var m = base.MAUL_RE.exec(text);
    if (m && firstName(m[1]) === want) {
      hits.push({ d: e.d, kind: 'maul', dmg: +m[2], line: text.slice(0, 140) });
      return;
    }
    var h = base.HURT_RE.exec(text);
    if (h && firstName(h[1]) === want) {
      hits.push({ d: e.d, kind: 'hurting', hp: +h[2], line: text.slice(0, 140) });
    }
  });
  return hits;
}

// ---------- corpus-blindness audit: is any pack-kcal or per-day HP retained? ----------

function corpusBlindness() {
  var files = fs.readdirSync(CORPUS_DIR).filter(function (f) {
    return /^deathcause-(belong|lead)-s\d+\.json$/.test(f);
  }).sort();
  var keys = {}, packFiles = 0, hpFiles = 0;
  files.forEach(function (f) {
    var d = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, f), 'utf8'));
    var hasPack = false, hasHp = false;
    d.starvechan.meals.forEach(function (r) {
      Object.keys(r).forEach(function (k) {
        keys[k] = (keys[k] || 0) + 1;
        if (/pack/i.test(k)) hasPack = true;
        if (/^hp$|health/i.test(k)) hasHp = true;
      });
    });
    if (hasPack) packFiles++;
    if (hasHp) hpFiles++;
  });
  return { files: files.length,
           mealKeyUnion: Object.keys(keys).sort(),
           filesWithPackField: packFiles,
           filesWithHpField: hpFiles,
           totalMealRows: Object.keys(keys).length ? keys[Object.keys(keys)[0]] : 0 };
}

// ---------- corpus driver ----------

function loadCorpus() {
  var files = fs.readdirSync(CORPUS_DIR).filter(function (f) {
    return /^deathcause-(belong|lead)-s\d+\.json$/.test(f);
  }).sort();
  return files.map(function (f) {
    var d = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, f), 'utf8'));
    d._file = f;
    return d;
  });
}

function indexMeals(meals) {
  var byVid = new Map();
  meals.forEach(function (r) {
    if (!byVid.has(r.vid)) byVid.set(r.vid, new Map());
    byVid.get(r.vid).set(r.d, r);
  });
  return byVid;
}

function trailCases(census, corpora) {
  var out = [];
  census.runs.forEach(function (r) {
    (r.starvationDeaths || []).forEach(function (s) {
      if (s.channel === 'trail-starvation') {
        var corpus = corpora.filter(function (x) { return x._file === r.file; })[0];
        out.push({ policy: r.policy, seed: r.seed, who: s.who, day: s.day,
                   vid: s.vid, file: r.file, corpus: corpus });
      }
    });
  });
  return out;
}

function runSignalDiag() {
  var corpora = loadCorpus();
  var census = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf8'));
  var cases = trailCases(census, corpora);
  var blindness = corpusBlindness();

  // per-case: v1 fires (cliff day), FORECAST fires, pack proxy, HP proxy
  var perCase = cases.map(function (c) {
    var byVid = indexMeals(c.corpus.starvechan.meals);
    var rows = byVid.get(String(c.vid)) || new Map();
    var firesA = base.fireDaysFor(rows, new Map(), false);
    var cliffDay = firesA.length ? Math.min.apply(null, firesA.map(function (f) { return f.d; })) : null;
    var firesF = fireDaysForF(rows);
    var lF = base.leadTime(firesF, c.day);
    var lA = base.leadTime(firesA, c.day);
    var expStart = expeditionStart(rows, c.day);
    // lead-lag: expected vs produced on the 3 days before the cliff
    var leadLag = [];
    if (cliffDay !== null) {
      for (var d = cliffDay - 3; d <= cliffDay - 1; d++) {
        var r = rows.get(d);
        if (r && r.away) leadLag.push({ d: d, produced: r.produced, expected: r.expected });
      }
    }
    // (a) homecoming coverage: did this vid ever come home with invKcal?
    var homecomings = (c.corpus.starvechan.homecomings || []).filter(function (h) {
      return String(h.vid) === String(c.vid);
    });
    return {
      who: c.who, policy: c.policy, seed: c.seed, day: c.day, vid: c.vid,
      cliffDay: cliffDay,
      firesA: firesA.map(function (f) { return f.d; }),
      firesF: firesF.map(function (f) { return f.d; }),
      leadA: lA.lead, leadF: lF.lead,
      expeditionStart: expStart,
      leadLag: leadLag,
      preCliffDrawn: cliffDay !== null ? preCliffDrawn(rows, cliffDay) : null,
      woundsPreCliff: cliffDay !== null
        ? woundBeatsWindow(c.corpus, c.who, cliffDay - 7, c.day) : [],
      woundsAtDeparture: woundBeatsWindow(c.corpus, c.who, expStart - 7, expStart),
      homecomingRows: homecomings.length,
    };
  });

  // SECONDARY: FP rate of FORECAST on the 7 surviving runs (same conservative
  // definition as the parent arm).
  var survivors = corpora.filter(function (c) { return c.endReason === 'survived'; });
  var fpEpisodes = [], tpEpisodes = [], totalDays = 0;
  survivors.forEach(function (corpus) {
    totalDays += corpus.days;
    var byVid = indexMeals(corpus.starvechan.meals);
    var deathByVid = new Map();
    (corpus.deaths || []).forEach(function (x) {
      if (x.vid) {
        if (!deathByVid.has(x.vid) || x.day < deathByVid.get(x.vid)) deathByVid.set(x.vid, x.day);
      }
    });
    byVid.forEach(function (rows, vid) {
      base.episodes(fireDaysForF(rows)).forEach(function (ep) {
        var dd = deathByVid.get(vid);
        var rec = { file: corpus._file, vid: vid, first: ep.first, last: ep.last,
                    deathDay: dd === undefined ? null : dd };
        if (dd !== undefined && dd <= ep.last + 10) tpEpisodes.push(rec);
        else fpEpisodes.push(rec);
      });
    });
  });
  var weeks = totalDays / 7;

  return {
    blindness: blindness,
    perCase: perCase,
    fp: { episodes: fpEpisodes.length, tp: tpEpisodes.length,
          weeks: +weeks.toFixed(1), ratePerWeek: +(fpEpisodes.length / weeks).toFixed(3),
          fpEpisodes: fpEpisodes },
  };
}

if (require.main === module) {
  var out = runSignalDiag();
  console.log('=== corpus blindness: pack/hp fields retained? ===');
  console.log('files: ' + out.blindness.files +
    ', meal-key union: [' + out.blindness.mealKeyUnion.join(',') + ']' +
    ', files with pack field: ' + out.blindness.filesWithPackField +
    ', files with hp field: ' + out.blindness.filesWithHpField);
  console.log('=== per-case: v1 lead vs FORECAST lead ===');
  out.perCase.forEach(function (c) {
    console.log(c.who + ' ' + c.policy + ' s' + c.seed + ' d' + c.day +
      ' | cliff=' + c.cliffDay +
      ' | firesA [' + c.firesA.join(',') + '] leadA=' + c.leadA +
      ' | firesF [' + c.firesF.join(',') + '] leadF=' + c.leadF +
      ' | expStart=d' + c.expeditionStart + ' homecomings=' + c.homecomingRows);
    console.log('    leadLag(d-3..d-1): ' +
      c.leadLag.map(function (x) { return 'd' + x.d + ' prod=' + x.produced + ' exp=' + x.expected; }).join(' | '));
    console.log('    preCliffDrawn: ' +
      (c.preCliffDrawn || []).map(function (x) { return 'd' + x.d + ' drawn=' + x.drawn + '/' + x.need; }).join(' | '));
    console.log('    woundsPreCliff[cliff-7..death]: ' +
      (c.woundsPreCliff.map(function (w) { return w.kind + '@d' + w.d; }).join(',') || 'none'));
    console.log('    woundsAtDeparture[expStart-7..expStart]: ' +
      (c.woundsAtDeparture.map(function (w) { return w.kind + '@d' + w.d; }).join(',') || 'none'));
  });
  var go = out.perCase.filter(function (c) { return c.leadF >= 3; }).length;
  console.log('FORECAST >=3d: ' + go + '/' + out.perCase.length + ' (bar >=4/5)');
  console.log('=== FORECAST false positives (surviving runs) ===');
  console.log('FP episodes: ' + out.fp.episodes + ', TP: ' + out.fp.tp +
    ', weeks: ' + out.fp.weeks + ', rate: ' + out.fp.ratePerWeek + '/week (bar <=1/week)');
}

module.exports = {
  triggerDayF: triggerDayF, fireDaysForF: fireDaysForF,
  expeditionStart: expeditionStart, preCliffDrawn: preCliffDrawn,
  woundBeatsWindow: woundBeatsWindow, corpusBlindness: corpusBlindness,
  runSignalDiag: runSignalDiag,
};
