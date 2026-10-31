// finishgate-analyze-20261031.js — sim-finishgate-a (DIAG, analyzer-only).
// Measures, from the landed fieldfinish2 pilot corpora alone, how far the
// committed-finish one-strike gate falls short on wave-3 field fights.
// Reads ONLY the per-seed JSONs; writes nothing (stdout only). No harness,
// no game code, no new sims. Classification per
// evidence/2026-10-31/sim-finishgate-a-prereg.md.
// Precedence note (operationalization, stated in the evidence): class B
// (contact-break) takes precedence over class G (multi-striker) — a beast
// met below the line is a contact flight whatever its log holds; G fires
// only for fought, non-contact rows. Class F (missing fields) is evaluated
// before any ratio class, since ratios are undefined without HP fields.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BREAK_FRAC = 0.15;
const STRIKE_RE = /^R\d+: (.+?) strikes for (\d+)/;

function parseStrikes(log) {
  const strikes = [];
  for (const line of (log || [])) {
    const m = STRIKE_RE.exec(line);
    if (m) strikes.push({ name: m[1], vd: parseInt(m[2], 10) });
  }
  return strikes;
}

function isNum(x) { return typeof x === 'number' && Number.isFinite(x); }

// Returns { cls, reason, maxStrike, secondStrike, gap, twoStrikeReach, strikers }
function classify(row) {
  const log = row.log;
  if (log === null || log === undefined || (Array.isArray(log) && log.length === 0)) {
    return { cls: 'unlogged', reason: 'no log' };
  }
  const lines = Array.isArray(log) ? log : [String(log)];
  if (!isNum(row.mHpLeft) || !isNum(row.mMaxHp) || !isNum(row.mHpStart)) {
    return { cls: 'missing-fields', reason: 'missing HP fields' };
  }
  const line = BREAK_FRAC * row.mMaxHp;
  if (row.mHpStart < line) {
    return { cls: 'contact-break', reason: 'met already below the break line' };
  }
  const strikes = parseStrikes(lines);
  if (strikes.length === 0) {
    return { cls: 'no-lead-strike', reason: 'no lead strike in log' };
  }
  const strikers = [...new Set(strikes.map(s => s.name))];
  if (strikers.length > 1) {
    return { cls: 'multi-striker', reason: 'more than one striker name in log', strikers };
  }
  const vds = strikes.map(s => s.vd).sort((a, b) => b - a);
  const maxStrike = vds[0];
  const secondStrike = vds.length > 1 ? vds[1] : 0;
  const gap = row.mHpLeft - maxStrike;
  const twoStrikeReach = row.mHpLeft <= maxStrike + secondStrike;
  if (row.mHpLeft < line) {
    return { cls: 'gap-table', reason: 'break-line flight', maxStrike, secondStrike, gap, twoStrikeReach, strikers };
  }
  return { cls: 'non-break-flight', reason: 'fled above the break line', maxStrike, secondStrike, gap, twoStrikeReach, strikers };
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function distribution(values) {
  const s = [...values].sort((a, b) => a - b);
  return {
    n: s.length,
    min: s.length ? s[0] : null,
    q1: percentile(s, 0.25),
    median: percentile(s, 0.5),
    q3: percentile(s, 0.75),
    max: s.length ? s[s.length - 1] : null,
  };
}

function analyzeLeg(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const out = {
    dir, files: files.length, seeds: [],
    fieldFights: 0, waveTotals: {}, w3Outcomes: {},
    w3MFleeTotal: 0, classes: {}, gapRows: [], classifiedRows: [],
    unclassified: [],
  };
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out.seeds.push(doc.seed);
    for (const r of (doc.fieldFights || [])) {
      out.fieldFights += 1;
      const w = String(r.wave);
      out.waveTotals[w] = (out.waveTotals[w] || 0) + 1;
      if (r.wave === 3) {
        out.w3Outcomes[r.outcome] = (out.w3Outcomes[r.outcome] || 0) + 1;
        if (r.outcome === 'mFlee') {
          out.w3MFleeTotal += 1;
          const c = classify(r);
          out.classes[c.cls] = (out.classes[c.cls] || 0) + 1;
          const rec = {
            seed: doc.seed, day: r.day, vid: r.vid, mid: r.mid,
            rounds: r.rounds, intent: r.intent, noFlee: r.noFlee,
            committedFinish: r.committedFinish,
            mHpStart: r.mHpStart, mMaxHp: r.mMaxHp, mHpLeft: r.mHpLeft,
            breakLine: 0.15 * r.mMaxHp, cls: c.cls, reason: c.reason,
            maxStrike: c.maxStrike !== undefined ? c.maxStrike : null,
            secondStrike: c.secondStrike !== undefined ? c.secondStrike : null,
            gap: c.gap !== undefined ? c.gap : null,
            twoStrikeReach: c.twoStrikeReach !== undefined ? c.twoStrikeReach : null,
          };
          out.classifiedRows.push(rec);
          if (c.cls === 'gap-table') out.gapRows.push(rec);
          if (c.cls === 'unclassified' || !c.cls) out.unclassified.push(rec);
        }
      }
    }
  }
  // Reconciliation assertions (also re-proven by the proof test).
  const classSum = Object.values(out.classes).reduce((a, b) => a + b, 0);
  const waveSum = Object.values(out.waveTotals).reduce((a, b) => a + b, 0);
  const w3OutcomeSum = Object.values(out.w3Outcomes).reduce((a, b) => a + b, 0);
  out.reconciliation = {
    classSumEqualsMFlee: classSum === out.w3MFleeTotal,
    waveSumEqualsFieldFights: waveSum === out.fieldFights,
    w3OutcomeSumEqualsW3Total: w3OutcomeSum === (out.waveTotals['3'] || 0),
    unclassified: out.unclassified.length,
    classSum, waveSum, w3OutcomeSum,
  };
  const g = out.gapRows;
  out.gapSummary = {
    n: g.length,
    mHpStart: distribution(g.map(r => r.mHpStart)),
    mHpLeft: distribution(g.map(r => r.mHpLeft)),
    gap: distribution(g.map(r => r.gap)),
    maxStrike: distribution(g.map(r => r.maxStrike)),
    gapLE0: g.filter(r => r.gap <= 0).length,
    gapLE0Share: g.length ? g.filter(r => r.gap <= 0).length / g.length : null,
    twoStrikeReach: g.filter(r => r.twoStrikeReach).length,
    twoStrikeReachShare: g.length ? g.filter(r => r.twoStrikeReach).length / g.length : null,
    committedFinishTrue: g.filter(r => r.committedFinish === true).length,
  };
  out.coverage = out.w3MFleeTotal
    ? (out.w3MFleeTotal - out.unclassified.length) / out.w3MFleeTotal : null;
  return out;
}

function main() {
  const baselineDir = path.join(ROOT, 'evidence/2026-10-31/perseed-fieldfinish2-baseline-pilot/leadfeast');
  const leverDir = path.join(ROOT, 'evidence/2026-10-31/perseed-fieldfinish2-pilot/leadfeast');
  const baseline = analyzeLeg(baselineDir);
  const lever = analyzeLeg(leverDir);
  const report = { baseline, lever };
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
    return report;
  }
  for (const [name, leg] of [['BASELINE (PRIMARY)', baseline], ['LEVER (secondary)', lever]]) {
    console.log(`== ${name}: ${leg.dir}`);
    console.log(` files=${leg.files} seeds=${leg.seeds.join(',')}`);
    console.log(` fieldFights=${leg.fieldFights} waveTotals=${JSON.stringify(leg.waveTotals)}`);
    console.log(` w3Outcomes=${JSON.stringify(leg.w3Outcomes)} w3MFlee=${leg.w3MFleeTotal}`);
    console.log(` classes=${JSON.stringify(leg.classes)} coverage=${leg.coverage}`);
    console.log(` reconciliation=${JSON.stringify(leg.reconciliation)}`);
    const s = leg.gapSummary;
    console.log(` gap-table n=${s.n} gapLE0=${s.gapLE0} (${s.gapLE0Share}) twoStrikeReach=${s.twoStrikeReach} (${s.twoStrikeReachShare}) committedFinishTrue=${s.committedFinishTrue}`);
    console.log(`  mHpStart dist=${JSON.stringify(s.mHpStart)}`);
    console.log(`  mHpLeft  dist=${JSON.stringify(s.mHpLeft)}`);
    console.log(`  gap      dist=${JSON.stringify(s.gap)}`);
    console.log(`  maxStrike dist=${JSON.stringify(s.maxStrike)}`);
    console.log('  gap rows (seed day mid mHpStart mMaxHp mHpLeft breakLine maxStrike second gap twoReach committed):');
    for (const r of leg.gapRows) {
      console.log(`   ${r.seed} d${r.day} ${r.mid} start=${r.mHpStart} max=${r.mMaxHp} left=${r.mHpLeft} line=${r.breakLine} maxStrike=${r.maxStrike} second=${r.secondStrike} gap=${r.gap} twoReach=${r.twoStrikeReach} committed=${r.committedFinish} intent=${r.intent} rounds=${r.rounds}`);
    }
  }
  return report;
}

if (require.main === module) main();
module.exports = { parseStrikes, classify, percentile, distribution, analyzeLeg };
