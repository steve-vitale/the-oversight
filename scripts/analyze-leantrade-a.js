// sim-leantrade-a: leanlink village-loss decomposition from COMMITTED corpora only.
// Pure corpus reader: no game eval, no new sims. Deterministic output:
// same inputs -> byte-identical JSON (sorted keys, fixed row order).
// Usage: node scripts/analyze-leantrade-a.js <competent.json> <leanlink.json> <out.json>
// When required as a module, exports analyze() + classify() for the proof test.
'use strict';
const fs = require('fs');

// Cause classes. Corpus `deaths` keys are "<who>:<cause>" aggregates with no
// timestamps and no terminal-cause field, so attribution is by dominant
// share, NOT proven terminal cause (see prereg metric review).
function classify(key) {
  if (key.startsWith('monster:') || key === 'villager:monster') return 'monster-combat';
  if (key === 'player:the wild' || key === 'player:the night' ||
      key === 'player:a stranger' || key.startsWith('person:')) return 'player-field';
  if (key === 'player:the arena' || key === 'player:contest') return 'player-arena-contest';
  if (key === 'player:starvation' || key === 'villager:thirst' ||
      key === 'player:dehydration' || key === 'player:sickness' ||
      key === 'villager:sickness' || key === 'villager:a wound that wouldn\'t close') {
    return 'sustenance-disease';
  }
  return 'other-named';
}

function summarizeDeaths(deaths) {
  const byClass = {};
  let total = 0;
  for (const [k, v] of Object.entries(deaths || {})) {
    const c = classify(k);
    byClass[c] = (byClass[c] || 0) + v;
    total += v;
  }
  const ranked = Object.entries(byClass).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = ranked[0] || null;
  const second = ranked[1] || null;
  const margin = top && second ? top[1] - second[1] : (top ? top[1] : 0);
  // Margin <= 2 deaths => mixed/ambiguous, never forced (prereg rule).
  const primary = top && margin > 2 ? top[0] : (top ? 'mixed/ambiguous' : 'none');
  return { total, byClass, ranked, primary, margin, top: top ? top[0] : null, second: second ? second[0] : null };
}

function bucket(day) {
  if (day < 100) return 'early (<100d)';
  if (day <= 150) return 'mid-ambition (100-150d)';
  return 'late (>150d)';
}

function analyze(comp, lean) {
  const compRuns = comp.runs || [];
  const leanRuns = lean.runs || [];
  const compSeeds = compRuns.map(r => r.seed).sort((a, b) => a - b);
  const leanSeeds = leanRuns.map(r => r.seed).sort((a, b) => a - b);
  const pairing = JSON.stringify(compSeeds) === JSON.stringify(leanSeeds) &&
    comp.policy === 'competent' && lean.policy === 'leanlink';
  const bySeed = {};
  for (const r of compRuns) (bySeed[r.seed] = bySeed[r.seed] || {}).competent = r;
  for (const r of leanRuns) (bySeed[r.seed] = bySeed[r.seed] || {}).leanlink = r;

  const lost = [];
  const paired = [];
  for (const seed of compSeeds) {
    const c = bySeed[seed].competent;
    const l = bySeed[seed].leanlink;
    if (!l) throw new Error(`seed ${seed} present in competent corpus but missing from leanlink corpus — pairing broken, refusing to analyze`);
    const cDeaths = summarizeDeaths(c.deaths);
    const lDeaths = summarizeDeaths(l.deaths);
    if (c.endReason === 'village-lost' || l.endReason === 'village-lost') {
      lost.push({
        seed,
        competent: c.endReason === 'village-lost' ? {
          days: c.days, bucket: bucket(c.days), national: c.national, table: c.table,
          maxRank: c.maxRank, wave: c.waveReach, arc: c.maxArc,
          deaths: c.deaths, deathSummary: cDeaths,
          court: c.court, endGateRank: (c.endGate && c.endGate.rank) || null,
        } : null,
        leanlink: l.endReason === 'village-lost' ? {
          days: l.days, bucket: bucket(l.days), national: l.national, table: l.table,
          maxRank: l.maxRank, wave: l.waveReach, arc: l.maxArc,
          deaths: l.deaths, deathSummary: lDeaths,
          court: l.court, endGateRank: (l.endGate && l.endGate.rank) || null,
          endGateLinks: (l.endGate && l.endGate.links) || null,
        } : null,
      });
    }
    paired.push({
      seed,
      competentDays: c.days, competentEnd: c.endReason,
      leanlinkDays: l.days, leanlinkEnd: l.endReason,
      dayDeltaLeanMinusComp: l.days - c.days,
      competentDeaths: cDeaths.total, leanlinkDeaths: lDeaths.total,
      deathDeltaLeanMinusComp: lDeaths.total - cDeaths.total,
      competentNational: c.national, leanlinkNational: l.national,
      competentTable: c.table, leanlinkTable: l.table,
      competentRank: c.maxRank, leanlinkRank: l.maxRank,
      competentCourt: c.court, leanlinkCourt: l.court,
    });
  }

  const leanLostDays = lost.filter(x => x.leanlink).map(x => x.leanlink.days).sort((a, b) => a - b);
  const compLostDays = lost.filter(x => x.competent).map(x => x.competent.days).sort((a, b) => a - b);
  const countBucket = days => {
    const out = { 'early (<100d)': 0, 'mid-ambition (100-150d)': 0, 'late (>150d)': 0 };
    for (const d of days) out[bucket(d)] += 1;
    return out;
  };

  // Column death totals by class (all 8 seeds each, for the "dominated by" check).
  const columnClass = runs => {
    const acc = {};
    for (const r of runs) {
      const s = summarizeDeaths(r.deaths);
      for (const [k, v] of Object.entries(s.byClass)) acc[k] = (acc[k] || 0) + v;
    }
    return acc;
  };

  // Tribute/proposal quantification from corpus ONLY: court counts + endGate
  // links/trust. No pantry series, no tribute-payment events exist in the
  // corpus (grep-verified) — flagged as a gap, not estimated.
  const courtTotals = runs => {
    const acc = {};
    for (const r of runs) for (const [k, v] of Object.entries(r.court || {})) acc[k] = (acc[k] || 0) + v;
    return acc;
  };

  return {
    corpora: {
      competent: { label: comp.label, policy: comp.policy, seeds: compSeeds, days: comp.days },
      leanlink: { label: lean.label, policy: lean.policy, seeds: leanSeeds, days: lean.days },
      seedPairingConfirmed: pairing,
    },
    lossInventory: lost,
    lossDays: {
      competent: compLostDays, leanlink: leanLostDays,
      competentBuckets: countBucket(compLostDays), leanlinkBuckets: countBucket(leanLostDays),
    },
    paired: paired,
    columnDeathClassTotals: { competent: columnClass(compRuns), leanlink: columnClass(leanRuns) },
    courtTotals: { competent: courtTotals(compRuns), leanlink: courtTotals(leanRuns) },
    gaps: [
      'No pantry time series in either corpus: tribute kcal actually paid cannot be quantified from the corpus.',
      'No proposal/tribute event log in either corpus: proposal timing vs loss timing cannot be established.',
      'No timestamped death log and no terminal-cause field: primary-cause attribution is by aggregate dominant share only, not proven terminal cause.',
      'No population time series: the final-decline shape (slow bleed vs sudden wipe) cannot be reconstructed.',
    ],
  };
}

function main() {
  const [compPath, leanPath, outPath] = process.argv.slice(2);
  if (!compPath || !leanPath || !outPath) {
    console.error('usage: node scripts/analyze-leantrade-a.js <competent.json> <leanlink.json> <out.json>');
    process.exit(2);
  }
  const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
  const lean = JSON.parse(fs.readFileSync(leanPath, 'utf8'));
  const result = analyze(comp, lean);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
  console.log(`wrote ${outPath} pairing=${result.corpora.seedPairingConfirmed} lostSeeds=${result.lossInventory.length}`);
}

if (require.main === module) main();
module.exports = { analyze, classify, summarizeDeaths, bucket };
