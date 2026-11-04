// test-tendbelow-confirm-analyze-20261104.js — tend-below-seasoned-bar
// CONFIRM analyzer (arm sim-tendbelow-confirm-b). Reuses the pilot
// analyzer's summarizeLeg/pairSeeds/judgeGo VERBATIM (via require —
// the pilot file is NOT edited) and adds ONLY the prereg leg (f)
// RUNG GUARD: paired end-state scaleRank comparison.
//   Rung order (docs/SCALE.md ladder + hierarchy.js scaleRank()):
//   village 0, regional 1, national 2, global 3.
//   A seed is an ARMED downgrade iff order(armed) < order(baseline);
//   a BASELINE downgrade iff order(baseline) < order(armed) (the
//   armed leg ends a rung higher — the symmetric paired
//   comparison). Ties are neither. A seed with a null/unknown
//   rank on either leg counts for neither side and is listed;
//   > 2 such seeds => INSUFFICIENT-DATA (rung guard unjudgeable).
//   Leg (f) passes iff armedDowngrades <= baselineDowngrades
//   (net rung movement not negative). On the pilot band this
//   guard would have read armed 2 vs baseline 0 and FAILED.
// When run directly, reads
// evidence/2026-11-04/perseed-tendbelow-confirm-b/ and prints one
// JSON line per seed pair plus the six-leg verdict.
// Usage: node scripts/test-tendbelow-confirm-analyze-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const PILOT = require(path.join(__dirname, 'test-tendbelow-analyze-20261104'));

const RUNG_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function rungOf(rank) {
  if (typeof rank !== 'string') return null;
  const v = RUNG_ORDER[rank.toLowerCase()];
  return (v === undefined) ? null : v;
}

function rungJudge(pairs) {
  let armedDown = 0, baseDown = 0;
  const downgrades = [], upgrades = [], unknown = [];
  let nationalBase = 0, nationalArmed = 0, globalBase = 0, globalArmed = 0;
  for (const p of pairs) {
    const rb = rungOf(p.base.scaleRank), ra = rungOf(p.armed.scaleRank);
    if (rb === null || ra === null) { unknown.push(p.seed); continue; }
    if (ra < rb) { armedDown++; downgrades.push({ seed: p.seed, base: p.base.scaleRank, armed: p.armed.scaleRank }); }
    else if (rb < ra) { baseDown++; upgrades.push({ seed: p.seed, base: p.base.scaleRank, armed: p.armed.scaleRank }); }
    if (rb >= 2) nationalBase++;
    if (ra >= 2) nationalArmed++;
    if (rb === 3) globalBase++;
    if (ra === 3) globalArmed++;
  }
  return { legF_pass: armedDown <= baseDown, armedDowngrades: armedDown,
    baselineDowngrades: baseDown, downgrades: downgrades, upgrades: upgrades,
    unknownRankSeeds: unknown, nationalBase: nationalBase, nationalArmed: nationalArmed,
    globalBase: globalBase, globalArmed: globalArmed };
}

// Six-leg judge: pilot judge (a)–(e) + rung guard (f).
function judgeGo6(pairs) {
  const pilot = PILOT.judgeGo(pairs);
  const rung = rungJudge(pairs);
  let verdict, insufficientReason = pilot.insufficientReason;
  if (!insufficientReason && rung.unknownRankSeeds.length > 2) {
    insufficientReason = 'unknown end-state scaleRank on ' + rung.unknownRankSeeds.length + ' seeds: rung guard unjudgeable';
  }
  if (insufficientReason) verdict = 'INSUFFICIENT-DATA';
  else if (pilot.verdict === 'GO' && rung.legF_pass) verdict = 'GO';
  else verdict = 'NO-GO';
  return Object.assign({}, pilot, { verdict: verdict, insufficientReason: insufficientReason,
    legF_pass: rung.legF_pass, legF_armedDowngrades: rung.armedDowngrades,
    legF_baselineDowngrades: rung.baselineDowngrades, legF_downgrades: rung.downgrades,
    legF_upgrades: rung.upgrades, legF_unknownRankSeeds: rung.unknownRankSeeds,
    nationalBase: rung.nationalBase, nationalArmed: rung.nationalArmed,
    globalBase: rung.globalBase, globalArmed: rung.globalArmed });
}

module.exports = { summarizeLeg: PILOT.summarizeLeg, pairSeeds: PILOT.pairSeeds,
  judgeGo: PILOT.judgeGo, rungJudge: rungJudge, judgeGo6: judgeGo6,
  rungOf: rungOf, RUNG_ORDER: RUNG_ORDER };

if (require.main === module) {
  const dir = path.join(__dirname, '..', 'evidence', '2026-11-04', 'perseed-tendbelow-confirm-b');
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  const bySeed = {};
  for (const f of files) {
    const out = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (out.run !== 'tendbelow-confirm-base' && out.run !== 'tendbelow-confirm-armed') continue;
    bySeed[out.seed] = bySeed[out.seed] || {};
    bySeed[out.seed][out.run] = out;
  }
  const pairs = [];
  for (const seed of Object.keys(bySeed).sort(function (a, b) { return a - b; })) {
    const g = bySeed[seed];
    if (!g['tendbelow-confirm-base'] || !g['tendbelow-confirm-armed']) { console.log(JSON.stringify({ seed: Number(seed), error: 'missing leg' })); continue; }
    const p = PILOT.pairSeeds(g['tendbelow-confirm-base'], g['tendbelow-confirm-armed']);
    pairs.push(p);
    console.log(JSON.stringify({ seed: p.seed, daysBase: p.base.days, daysArmed: p.armed.days, deltaDays: p.deltaDays,
      bandBase: p.baseBand, bandArmed: p.armedBand, regressed: p.regressed,
      scaleBase: p.base.scaleRank, scaleArmed: p.armed.scaleRank,
      maxWaveBase: p.base.maxWave, maxWaveArmed: p.armed.maxWave,
      everW4Base: p.base.everW4, everW4Armed: p.armed.everW4,
      everW5Base: p.base.everW5, everW5Armed: p.armed.everW5,
      trajBase: p.base.trajectory, trajArmed: p.armed.trajectory,
      holdBase: p.base.holdShare, holdArmed: p.armed.holdShare,
      dropsBase: p.base.drops.length, dropsArmed: p.armed.drops.length,
      recovBase: p.base.recoveries.length, recovArmed: p.armed.recoveries.length,
      readyBase: p.base.readyDays, readyArmed: p.armed.readyDays,
      tendBase: p.base.tendTotal, tendArmed: p.armed.tendTotal,
      tendArmedBelow: p.armed.tendBelowBar, tendArmedSeasoned: p.armed.tendSeasoned, tendArmedUnknown: p.armed.tendUnknown,
      tendArmedPaid: p.armed.tendPaidCount, tendArmedPaidKcal: p.armed.tendPaidKcal,
      tendBasePaid: p.base.tendPaidCount, tendBasePaidKcal: p.base.tendPaidKcal,
      decisionMatchBase: p.base.tendDecisionMatch, decisionMatchArmed: p.armed.tendDecisionMatch,
      errorsBase: p.base.instrumentErrors, errorsArmed: p.armed.instrumentErrors,
      deathTotalBase: p.base.deathTotal, deathTotalArmed: p.armed.deathTotal }));
  }
  console.log(JSON.stringify(judgeGo6(pairs)));
}
