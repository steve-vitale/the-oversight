// strikefall-check-analyze-20261113.js — judge for the strikefall check/after
// corpora (arm sim-strikefall-a). Reads per-seed JSONs from one corpus dir
// (or two: check + after) and reports:
//   #2303 STRIKE-AFTER-FALL: monster "falls." lines immediately followed
//     (next say line in the stream, strike.seq === falls.seq + 1) by a
//     "You STRIKE the <target>" line naming the fallen monster (normalized
//     label match). Every adjacent falls->STRIKE pair is listed for review,
//     matched or not — adjacency alone is the glitch.
//   #2304 DUPLICATE SQUARE-SCREAM: Static Kite DIP lines grouped by
//     (seed, fight); groups of size >= 2 are duplicates. Each group's kite
//     fighter count (from the live-fight snapshot at the line) decides the
//     mechanism: 1 kite = one kite resolving twice; 2+ kites = two honest
//     dips with identical text.
//   Controls: freezeline / applyStatus / bellow totals (must not move).
//   Comparison mode (two dirs): survival/wave byte-identity per seed.
// Usage:
//   node scripts/strikefall-check-analyze-20261113.js <corpusDir> [<afterDir>]
'use strict';
const path = require('path');
const fs = require('fs');

function loadCorpus(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    if (!/\.json$/.test(f)) continue;
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[d.seed] = d;
  }
  return out;
}

// "The RERUN ×1 The Congregation falls." -> ["congregation"]
// "The Static Kite falls." -> ["static", "kite"]
function fallsTokens(line) {
  let s = line.replace(/ falls\.$/, '');
  s = s.replace(/^The\s+/i, '').replace(/^RERUN ×\d+\s+/i, '').replace(/^The\s+/i, '');
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// "You STRIKE the congregation for 18 (Kitchen knife)." -> ["congregation"]
function strikeTokens(line) {
  const m = line.match(/^You STRIKE the (.+) for \d+/);
  if (!m) return [];
  return m[1].toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// Match iff the shorter token set is a subset of the longer one:
// "kite" vs ["static","kite"] matches; "congregation" vs ["congregation"]
// matches; "ducks in a row (head)" vs ["scarred","ducks","in","a","row","head"]
// matches (encShortLabel vs encSubject differ by the scarred prefix).
function labelsMatch(a, b) {
  if (!a.length || !b.length) return false;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  return short.every(function (t) { return long.indexOf(t) !== -1; });
}

function judgeOne(seed, d) {
  const strikesBySeq = {};
  for (const s of (d.strikeLines || [])) strikesBySeq[s.seq] = s;
  const pairs = [];
  for (const f of (d.fallsLines || [])) {
    if (f.person) continue; // villager/ally falls — different line, out of scope
    const nxt = strikesBySeq[f.seq + 1];
    if (nxt) {
      pairs.push({
        day: f.day, fight: f.fight, fallsSeq: f.seq,
        falls: f.line, strike: nxt.line,
        matched: labelsMatch(fallsTokens(f.line), strikeTokens(nxt.line)),
      });
    }
  }
  // DIP groups by (fight, day); fight null falls back to (day) alone.
  const dipGroups = {};
  for (const l of (d.dipLines || [])) {
    const k = (l.fight == null ? 'nofight' : 'f' + l.fight) + '|d' + l.day;
    (dipGroups[k] = dipGroups[k] || []).push(l);
  }
  const dupGroups = [];
  for (const k of Object.keys(dipGroups)) {
    const g = dipGroups[k];
    if (g.length >= 2) {
      dupGroups.push({
        key: k, size: g.length, day: g[0].day, fight: g[0].fight,
        seqs: g.map(function (x) { return x.seq; }),
        adjacent: g.slice(1).every(function (x, i) { return x.seq === g[i].seq + 1; }),
        kiteCounts: g.map(function (x) {
          return (x.fighters || []).filter(function (o) { return o.monsterId === 'statickite'; }).length;
        }),
        kiteKeys: g.map(function (x) {
          return (x.fighters || []).filter(function (o) { return o.monsterId === 'statickite'; }).map(function (o) { return o.key + (o.alive ? '' : '(dead)'); });
        }),
        lines: g.map(function (x) { return x.line; }),
      });
    }
  }
  return {
    seed: seed,
    days: d.days, endReason: d.endReason, won: d.won, maxWave: d.maxWave,
    standing: d.standing, scaleRank: d.scaleRank,
    fallsCount: d.fallsCount, strikeCount: d.strikeCount,
    strikeAfterFall: pairs.filter(function (p) { return p.matched; }).length,
    strikeAfterFallPairs: pairs,
    dipCount: d.dipCount, dipShortCount: d.dipShortCount,
    dupDipGroups: dupGroups.length,
    dupDipDetail: dupGroups,
    freezelineCount: d.freezelineCount, applyCount: d.applyCount,
    bellowCount: d.bellowCount, sayCount: d.sayCount,
    errors: (d.instrumentErrors || []).length,
  };
}

function summarize(corpus) {
  const seeds = Object.keys(corpus).map(Number).sort(function (a, b) { return a - b; });
  const rows = seeds.map(function (s) { return judgeOne(s, corpus[s]); });
  const tot = function (k) { return rows.reduce(function (a, r) { return a + (r[k] || 0); }, 0); };
  return {
    seeds: seeds, rows: rows,
    totals: {
      strikeAfterFall: tot('strikeAfterFall'),
      dipCount: tot('dipCount'), dupDipGroups: tot('dupDipGroups'),
      fallsCount: tot('fallsCount'), strikeCount: tot('strikeCount'),
      freezelineCount: tot('freezelineCount'), applyCount: tot('applyCount'),
      bellowCount: tot('bellowCount'),
    },
  };
}

const SURVIVAL_FIELDS = ['days', 'gameDays', 'endReason', 'won', 'over', 'villageLost', 'scaleRank', 'maxWave', 'unlockedWave', 'standing', 'endPantryKcal', 'deaths'];
function compareSurvival(check, after) {
  const diffs = [];
  for (const s of Object.keys(check).map(Number).sort(function (a, b) { return a - b; })) {
    const c = check[s], a = after[s];
    if (!a) { diffs.push({ seed: s, field: '(missing after leg)' }); continue; }
    for (const f of SURVIVAL_FIELDS) {
      if (JSON.stringify(c[f]) !== JSON.stringify(a[f])) {
        diffs.push({ seed: s, field: f, check: c[f], after: a[f] });
      }
    }
  }
  return diffs;
}

if (require.main === module) (function () {
  const dirA = process.argv[2];
  const dirB = process.argv[3] || null;
  if (!dirA) { console.error('Usage: node scripts/strikefall-check-analyze-20261113.js <corpusDir> [<afterDir>]'); process.exit(2); }
  const sumA = summarize(loadCorpus(dirA));
  console.log('=== ' + dirA + ' ===');
  for (const r of sumA.rows) {
    console.log(JSON.stringify({
      seed: r.seed, days: r.days, end: r.endReason, maxWave: r.maxWave, standing: r.standing,
      falls: r.fallsCount, strikes: r.strikeCount, strikeAfterFall: r.strikeAfterFall,
      dips: r.dipCount, dupDipGroups: r.dupDipGroups,
      freezeline: r.freezelineCount, apply: r.applyCount, bellow: r.bellowCount,
      errors: r.errors,
    }));
  }
  console.log('TOTALS ' + JSON.stringify(sumA.totals));
  for (const r of sumA.rows) {
    for (const p of r.strikeAfterFallPairs) {
      console.log('PAIR seed ' + r.seed + ' d' + p.day + ' fight ' + p.fight + ' matched=' + p.matched + ' :: ' + p.falls + ' || ' + p.strike);
    }
    for (const g of r.dupDipDetail) {
      console.log('DUPDIP seed ' + r.seed + ' ' + g.key + ' size=' + g.size + ' adjacent=' + g.adjacent + ' seqs=' + g.seqs.join(',') + ' kiteCounts=' + g.kiteCounts.join(',') + ' kiteKeys=' + JSON.stringify(g.kiteKeys));
    }
  }
  if (dirB) {
    const corpusB = loadCorpus(dirB);
    const sumB = summarize(corpusB);
    console.log('=== ' + dirB + ' ===');
    for (const r of sumB.rows) {
      console.log(JSON.stringify({
        seed: r.seed, days: r.days, end: r.endReason, maxWave: r.maxWave, standing: r.standing,
        falls: r.fallsCount, strikes: r.strikeCount, strikeAfterFall: r.strikeAfterFall,
        dips: r.dipCount, dupDipGroups: r.dupDipGroups,
        freezeline: r.freezelineCount, apply: r.applyCount, bellow: r.bellowCount,
        errors: r.errors,
      }));
    }
    console.log('TOTALS ' + JSON.stringify(sumB.totals));
    const diffs = compareSurvival(loadCorpus(dirA), corpusB);
    console.log('SURVIVAL-DIFFS ' + (diffs.length ? JSON.stringify(diffs, null, 2) : 'none — byte-identical on all shared seeds'));
    const ctrlDiffs = [];
    for (const s of sumA.seeds) {
      const a = sumA.rows.find(function (r) { return r.seed === s; });
      const b = sumB.rows.find(function (r) { return r.seed === s; });
      if (!a || !b) continue;
      for (const k of ['freezelineCount', 'applyCount', 'bellowCount']) {
        if (a[k] !== b[k]) ctrlDiffs.push({ seed: s, field: k, check: a[k], after: b[k] });
      }
    }
    console.log('CONTROL-DIFFS ' + (ctrlDiffs.length ? JSON.stringify(ctrlDiffs, null, 2) : 'none'));
  }
})();

module.exports = { loadCorpus: loadCorpus, judgeOne: judgeOne, summarize: summarize, compareSurvival: compareSurvival, fallsTokens: fallsTokens, strikeTokens: strikeTokens, labelsMatch: labelsMatch };
