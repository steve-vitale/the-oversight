// taxonomy-recalldiag-b.js — expedition-recall trigger DIAG instrument (OFFLINE).
//
// Develops the recall trigger rule against the existing meal-row corpus
// (evidence/2026-10-22/perseed-deathcause-b/) and measures:
//   (1) trigger lead time per trail-starvation death (trailstarve-census-b.json),
//   (2) false-positive trigger-episode rate on surviving runs,
//   (3) wound-beat retention (backlog #818): a retainer scanning deathDayLines
//       AND lossDayLines so the next census names wound-compounding.
//
// ZERO sims, ZERO src/js changes, ZERO policy edits. Pure offline data
// processing. Reads the corpus read-only; runDiag() returns plain data
// (byte-identical across runs — see test-recalldiag-b.js DET section).
//
// Usage: node scripts/taxonomy-recalldiag-b.js   (prints the judged summary)

'use strict';
var fs = require('fs');
var path = require('path');

var CORPUS_DIR = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-deathcause-b');
var CENSUS_PATH = path.join(__dirname, '..', 'evidence', '2026-10-22', 'trailstarve-census-b.json');

// ---------- RECALL-TRIGGER v1 (pre-registered) ----------
// Per villager-day d. FIRE iff ALL hold:
//   1. away[d]
//   2. away-majority: >=4 of last 7 calendar days away
//   3. cliff: produced[d] <= 0.40 * mean(produced over trailing 7 away-days
//      before d), >=3 away-days in baseline, baseline mean >= 800
//   4. pack-draw: drawn[d] >= 0.30 * need[d]
//   5. (Rule B only) pantryKcal[d] >= 5000  [System-knowable; Rule A is
//      villager-knowable]

function indexMeals(meals) {
  var byVid = new Map();
  meals.forEach(function (r) {
    if (!byVid.has(r.vid)) byVid.set(r.vid, new Map());
    byVid.get(r.vid).set(r.d, r);
  });
  return byVid;
}

function trailingAwayProd(rowsByDay, d, n) {
  var vals = [];
  for (var dd = d - 1; dd >= 1 && vals.length < n; dd--) {
    var r = rowsByDay.get(dd);
    if (r && r.away) vals.push(r.produced);
  }
  return vals;
}

function triggerDay(rowsByDay, pantryByDay, d, ruleB) {
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
  var base = trailingAwayProd(rowsByDay, d, 7);
  if (base.length < 3) return { fire: false, why: 'thin-baseline', baseN: base.length };
  var mean = base.reduce(function (a, b) { return a + b; }, 0) / base.length;
  if (mean < 800) return { fire: false, why: 'baseline-too-low', baseline: Math.round(mean) };
  if (!(r.produced <= 0.40 * mean)) return { fire: false, why: 'no-cliff', ratio: r.produced / mean };
  if (!(r.drawn >= 0.30 * r.need)) return { fire: false, why: 'no-pack-draw', drawn: r.drawn };
  if (ruleB) {
    var pan = pantryByDay.get(d);
    if (pan === undefined || pan < 5000) return { fire: false, why: 'pantry-not-ample', pantry: pan };
  }
  return { fire: true, baseline: Math.round(mean), ratio: r.produced / mean,
           drawn: r.drawn, need: r.need };
}

function fireDaysFor(rowsByDay, pantryByDay, ruleB) {
  var days = Array.from(rowsByDay.keys()).sort(function (a, b) { return a - b; });
  var fires = [];
  days.forEach(function (d) {
    var t = triggerDay(rowsByDay, pantryByDay, d, ruleB);
    if (t.fire) fires.push({ d: d, baseline: t.baseline, ratio: +t.ratio.toFixed(3) });
  });
  return fires;
}

// Maximal runs of fire-days with gaps <= 2.
function episodes(fireDays) {
  var eps = [];
  var cur = null;
  fireDays.forEach(function (f) {
    if (!cur || f.d - cur.last > 2) {
      cur = { first: f.d, last: f.d, fires: [f] };
      eps.push(cur);
    } else {
      cur.last = f.d;
      cur.fires.push(f);
    }
  });
  return eps;
}

// Lead time: death_day - first fire day of the LAST episode ending within
// 7d before death (episode.last <= deathDay, episode.last >= deathDay - 7).
// 0 = never fired in time.
function leadTime(fireDays, deathDay) {
  var eps = episodes(fireDays).filter(function (e) {
    return e.last <= deathDay && e.last >= deathDay - 7;
  });
  if (!eps.length) return { lead: 0, episode: null };
  var last = eps[eps.length - 1];
  return { lead: deathDay - last.first, episode: last };
}

// ---------- wound-beat retainer (backlog #818) ----------
// Scans deathDayLines AND lossDayLines (the prior instrument scanned
// deathDayLines only). Beat patterns name the victim:
//   maul:    "mauled <Name> (-N health)"
//   hurting: "<Name> is (still )?hurting (N HP)"
var MAUL_RE = /mauled\s+([A-Z\u00C0-\u024F][\p{L}'\u2019\-]*(?:\s+[A-Z\u00C0-\u024F][\p{L}'\u2019\-]*)?)\s+\(-(\d+)\s+health\)/u;
var HURT_RE = /([A-Z\u00C0-\u024F][\p{L}'\u2019\-]*(?:\s+[A-Z\u00C0-\u024F][\p{L}'\u2019\-]*)?)\s+is\s+(?:still\s+)?hurting\s+\((\d+)\s+HP\)/u;

function firstName(n) { return String(n).split(/\s+/)[0].toLowerCase(); }

function woundBeats(corpus, who, deathDay) {
  var lines = (corpus.deathDayLines || []).concat(corpus.lossDayLines || []);
  var hits = [];
  var want = firstName(who);
  lines.forEach(function (e) {
    if (e.d < deathDay - 3 || e.d > deathDay) return;
    var text = e.line || '';
    var m = MAUL_RE.exec(text);
    if (m && firstName(m[1]) === want) {
      hits.push({ d: e.d, kind: 'maul', dmg: +m[2], line: text.slice(0, 140) });
      return;
    }
    var h = HURT_RE.exec(text);
    if (h && firstName(h[1]) === want) {
      hits.push({ d: e.d, kind: 'hurting', hp: +h[2], line: text.slice(0, 140) });
    }
  });
  return hits;
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

function runDiag() {
  var corpora = loadCorpus();
  var census = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf8'));
  var trailCases = [];
  census.runs.forEach(function (r) {
    (r.starvationDeaths || []).forEach(function (s) {
      if (s.channel === 'trail-starvation') {
        trailCases.push({ policy: r.policy, seed: r.seed, who: s.who,
                          day: s.day, vid: s.vid, file: r.file });
      }
    });
  });

  // (1) lead times per trail-starvation case, Rule A and Rule B
  var leads = trailCases.map(function (c) {
    var corpus = corpora.filter(function (x) { return x._file === c.file; })[0];
    var byVid = indexMeals(corpus.starvechan.meals);
    var pantryByDay = new Map(corpus.daily.map(function (r) { return [r.day, r.pantryKcal]; }));
    var rows = byVid.get(c.vid) || new Map();
    var firesA = fireDaysFor(rows, pantryByDay, false);
    var firesB = fireDaysFor(rows, pantryByDay, true);
    var la = leadTime(firesA, c.day);
    var lb = leadTime(firesB, c.day);
    return { who: c.who, policy: c.policy, seed: c.seed, day: c.day,
             firesA: firesA.map(function (f) { return f.d; }),
             firesB: firesB.map(function (f) { return f.d; }),
             leadA: la.lead, leadB: lb.lead,
             episodeA: la.episode ? { first: la.episode.first, last: la.episode.last } : null };
  });

  // (2) false positives on surviving runs
  var survivors = corpora.filter(function (c) { return c.endReason === 'survived'; });
  var fpEpisodes = [], tpEpisodes = [], totalDays = 0, totalVillagerDays = 0;
  survivors.forEach(function (corpus) {
    totalDays += corpus.days;
    var byVid = indexMeals(corpus.starvechan.meals);
    var pantryByDay = new Map(corpus.daily.map(function (r) { return [r.day, r.pantryKcal]; }));
    var deathByVid = new Map();
    (corpus.deaths || []).forEach(function (x) {
      if (x.vid && (x.kind === 'villager' || x.kind === undefined || x.cause)) {
        if (!deathByVid.has(x.vid) || x.day < deathByVid.get(x.vid)) deathByVid.set(x.vid, x.day);
      }
    });
    byVid.forEach(function (rows, vid) {
      totalVillagerDays += rows.size;
      var fires = fireDaysFor(rows, pantryByDay, false);
      episodes(fires).forEach(function (ep) {
        var dd = deathByVid.get(vid);
        var rec = { file: corpus._file, vid: vid, first: ep.first, last: ep.last,
                    deathDay: dd === undefined ? null : dd };
        if (dd !== undefined && dd <= ep.last + 10) tpEpisodes.push(rec);
        else fpEpisodes.push(rec);
      });
    });
  });
  var weeks = totalDays / 7;

  // (3) wound-beat retainer re-run over all 13 starvation deaths
  var wounds = [];
  census.runs.forEach(function (r) {
    var corpus = corpora.filter(function (x) { return x._file === r.file; })[0];
    (r.starvationDeaths || []).forEach(function (s) {
      var beats = woundBeats(corpus, s.who, s.day);
      wounds.push({ who: s.who, policy: r.policy, seed: r.seed, day: s.day,
                    channel: s.channel,
                    censusFlags: s.channelFlags,
                    retainerHits: beats.length,
                    retainerWoundCompounded: beats.length > 0,
                    beats: beats });
    });
  });

  return {
    leads: leads,
    fp: { episodes: fpEpisodes.length, tp: tpEpisodes.length,
          weeks: +weeks.toFixed(1), ratePerWeek: +(fpEpisodes.length / weeks).toFixed(3),
          totalDays: totalDays, totalVillagerDays: totalVillagerDays,
          fpEpisodes: fpEpisodes },
    wounds: wounds,
  };
}

if (require.main === module) {
  var out = runDiag();
  console.log('=== lead times (Rule A villager-knowable / Rule B +pantry) ===');
  out.leads.forEach(function (l) {
    console.log(l.who + ' ' + l.policy + ' s' + l.seed + ' d' + l.day +
      ' | firesA [' + l.firesA.join(',') + '] leadA=' + l.leadA +
      ' | firesB [' + l.firesB.join(',') + '] leadB=' + l.leadB);
  });
  var go = out.leads.filter(function (l) { return l.leadA >= 3; }).length;
  console.log('Rule A >=3d: ' + go + '/' + out.leads.length + ' (bar >=4/5)');
  console.log('=== false positives (surviving runs) ===');
  console.log('FP episodes: ' + out.fp.episodes + ', TP: ' + out.fp.tp +
    ', weeks: ' + out.fp.weeks + ', rate: ' + out.fp.ratePerWeek + '/week (bar <=1/week)');
  console.log('=== wound retainer ===');
  out.wounds.forEach(function (w) {
    console.log(w.who + ' ' + w.policy + ' s' + w.seed + ' d' + w.day + ' ' + w.channel +
      ' | censusFlags [' + w.censusFlags.join(',') + ']' +
      ' | retainer: ' + (w.retainerWoundCompounded ? 'WOUND-COMPOUNDED' : '—') +
      (w.beats.length ? ' ' + w.beats.map(function (b) { return b.kind + '@d' + b.d; }).join(',') : ''));
  });
}

module.exports = {
  triggerDay: triggerDay, fireDaysFor: fireDaysFor, episodes: episodes,
  leadTime: leadTime, woundBeats: woundBeats, runDiag: runDiag,
  MAUL_RE: MAUL_RE, HURT_RE: HURT_RE,
};
