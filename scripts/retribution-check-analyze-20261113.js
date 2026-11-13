// retribution-check-analyze-20261113.js — judge for the retribution
// check/after corpora (arm sim-retribution-b). Reads per-seed JSONs from
// one corpus dir (or two: check + after) and reports:
//   RETRIBUTION-AFTER-KILL: a monster "falls." line whose seq falls
//     strictly between a RETRIBUTION unleash line (BA.unleash, said
//     BEFORE the tbDamage loop) and the following RETRIBUTION summary
//     line (said AFTER the loop) in the same fight — the kill announced
//     before the blow that caused it. Each such falls line is one
//     inversion instance. Fallback: if a summary line has no unleash
//     line before it in the same fight, the run of falls lines directly
//     preceding it (adjacent seqs ending at summary.seq - 1) counts
//     instead, reported separately as fallback inversions.
//   Contact: retribution summary / unleash / stored / no-adjacent counts
//     per seed — zero contact on a band is a SUBSTRATE finding (§14b),
//     not a fix verdict.
//   Controls: freezeline / applyStatus / bellow totals (must not move).
//   Comparison mode (two dirs): survival/wave byte-identity per seed
//     (reuses the strikefall analyzer's SURVIVAL_FIELDS + compare).
// Usage:
//   node scripts/retribution-check-analyze-20261113.js <corpusDir> [<afterDir>]
'use strict';
const path = require('path');
const fs = require('fs');
const STRIKE_A = require(path.join(__dirname, 'strikefall-check-analyze-20261113'));

function loadCorpus(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    if (!/\.json$/.test(f)) continue;
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[d.seed] = d;
  }
  return out;
}

// Judge one seed: pair each summary line with the most recent unleash
// line before it in the same fight (no other summary between them);
// every non-person falls line with seq strictly between the two is one
// inversion. Falls lines AFTER the summary line are correct order —
// the blow first, its kill second — and never count.
function judgeOne(seed, d) {
  const summaries = (d.retribSummaryLines || []).slice().sort(function (a, b) { return a.seq - b.seq; });
  const unleashes = (d.retribUnleashLines || []).slice().sort(function (a, b) { return a.seq - b.seq; });
  const falls = (d.fallsLines || []).filter(function (f) { return !f.person; });
  const instances = [];
  let fallbackCount = 0;
  for (const s of summaries) {
    // Most recent unleash in the same fight before this summary.
    let u = null;
    for (const cand of unleashes) {
      if (cand.fight !== s.fight) continue;
      if (cand.seq >= s.seq) continue;
      if (u && cand.seq <= u.seq) continue;
      u = cand;
    }
    // Guard: another summary between u and s means u belongs to an
    // earlier unleash (should not happen — one unleash emits one of
    // each — but never attribute across it).
    if (u) {
      const between = summaries.some(function (o) { return o !== s && o.fight === s.fight && o.seq > u.seq && o.seq < s.seq; });
      if (between) u = null;
    }
    if (u) {
      for (const f of falls) {
        if (f.fight !== s.fight) continue;
        if (f.seq > u.seq && f.seq < s.seq) {
          instances.push({
            day: f.day, fight: f.fight, fallsSeq: f.seq,
            unleashSeq: u.seq, summarySeq: s.seq,
            falls: f.line, unleash: u.line, summary: s.line,
          });
        }
      }
    } else {
      // Fallback: adjacent run of falls lines directly before the
      // summary (seqs summary.seq-1, summary.seq-2, ...).
      const bySeq = {};
      for (const f of falls) { if (f.fight === s.fight) bySeq[f.seq] = f; }
      let q = s.seq - 1;
      while (bySeq[q]) {
        const f = bySeq[q];
        instances.push({
          day: f.day, fight: f.fight, fallsSeq: f.seq,
          unleashSeq: null, summarySeq: s.seq,
          falls: f.line, unleash: null, summary: s.line, fallback: true,
        });
        fallbackCount++;
        q--;
      }
    }
  }
  return {
    seed: seed,
    days: d.days, endReason: d.endReason, won: d.won, maxWave: d.maxWave,
    standing: d.standing, scaleRank: d.scaleRank,
    fallsCount: d.fallsCount,
    retribSummaryCount: d.retribSummaryCount, retribUnleashCount: d.retribUnleashCount,
    retribStoredCount: d.retribStoredCount, retribNoAdjCount: d.retribNoAdjCount,
    inversions: instances.length,
    inversionsFallback: fallbackCount,
    inversionInstances: instances,
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
      inversions: tot('inversions'),
      inversionsFallback: tot('inversionsFallback'),
      retribSummaryCount: tot('retribSummaryCount'),
      retribUnleashCount: tot('retribUnleashCount'),
      retribStoredCount: tot('retribStoredCount'),
      retribNoAdjCount: tot('retribNoAdjCount'),
      fallsCount: tot('fallsCount'),
      freezelineCount: tot('freezelineCount'), applyCount: tot('applyCount'),
      bellowCount: tot('bellowCount'),
    },
  };
}

if (require.main === module) (function () {
  const dirA = process.argv[2];
  const dirB = process.argv[3] || null;
  if (!dirA) { console.error('Usage: node scripts/retribution-check-analyze-20261113.js <corpusDir> [<afterDir>]'); process.exit(2); }
  const sumA = summarize(loadCorpus(dirA));
  console.log('=== ' + dirA + ' ===');
  for (const r of sumA.rows) {
    console.log(JSON.stringify({
      seed: r.seed, days: r.days, end: r.endReason, maxWave: r.maxWave, standing: r.standing,
      falls: r.fallsCount, retribSummary: r.retribSummaryCount, retribUnleash: r.retribUnleashCount,
      retribStored: r.retribStoredCount, retribNoAdj: r.retribNoAdjCount,
      inversions: r.inversions, inversionsFallback: r.inversionsFallback,
      freezeline: r.freezelineCount, apply: r.applyCount, bellow: r.bellowCount,
      errors: r.errors,
    }));
  }
  console.log('TOTALS ' + JSON.stringify(sumA.totals));
  for (const r of sumA.rows) {
    for (const p of r.inversionInstances) {
      console.log('INVERSION seed ' + r.seed + ' d' + p.day + ' fight ' + p.fight +
        ' falls@' + p.fallsSeq + (p.unleashSeq != null ? ' unleash@' + p.unleashSeq : ' NO-UNLEASH') +
        ' summary@' + p.summarySeq + (p.fallback ? ' (fallback)' : '') +
        ' :: ' + p.falls + ' || ' + p.summary);
    }
  }
  if (dirB) {
    const corpusB = loadCorpus(dirB);
    const sumB = summarize(corpusB);
    console.log('=== ' + dirB + ' ===');
    for (const r of sumB.rows) {
      console.log(JSON.stringify({
        seed: r.seed, days: r.days, end: r.endReason, maxWave: r.maxWave, standing: r.standing,
        falls: r.fallsCount, retribSummary: r.retribSummaryCount, retribUnleash: r.retribUnleashCount,
        retribStored: r.retribStoredCount, retribNoAdj: r.retribNoAdjCount,
        inversions: r.inversions, inversionsFallback: r.inversionsFallback,
        freezeline: r.freezelineCount, apply: r.applyCount, bellow: r.bellowCount,
        errors: r.errors,
      }));
    }
    console.log('TOTALS ' + JSON.stringify(sumB.totals));
    const diffs = STRIKE_A.compareSurvival(loadCorpus(dirA), corpusB);
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

module.exports = { loadCorpus: loadCorpus, judgeOne: judgeOne, summarize: summarize };
