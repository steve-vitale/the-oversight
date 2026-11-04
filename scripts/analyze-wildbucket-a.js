'use strict';
// analyze-wildbucket-a.js — decompose the registerDeath cause bucket
// 'the wild' from rich death records written by
// scripts/sweep-wildbucket-a.js. Pure classification over recorded
// fields only: every assigned cause traces to a named field (or a
// quoted transcript line, reported separately). No invented causes.
//
// Rules (prereg order, first match wins):
//  1 TB-MONSTER (certain): live tbfight at death has >=1 monster
//    fighter and no hostile fighter.
//  2 CORPSE-MONSTER (certain): record's own monsterId/monsterName.
//  3 LAST-HURT-MONSTER (probable): last hurt cause 'monster' on the
//    SAME day as the death.
//  4 RESIDUAL: reason recorded from the actual fields (never folded
//    into a cause).
const fs = require('fs');
const path = require('path');

function monsterFighterName(f) {
  if (!f) return null;
  return f.name || f.monsterId || null;
}

function classify(rec) {
  if (!rec || rec.cause !== 'the wild') return null;
  const tb = rec.tbfight || null;
  const fighters = (tb && Array.isArray(tb.fighters)) ? tb.fighters : [];
  const hasMonster = fighters.some((x) => x && x.kind === 'monster');
  const hasHostile = fighters.some((x) => x && x.kind === 'hostile');
  if (tb && hasMonster && !hasHostile) {
    const mf = fighters.find((x) => x && x.kind === 'monster');
    return { rule: 'TB-MONSTER', certain: true, specific: 'monster kill, turn-based wild fight',
      monster: monsterFighterName(mf), field: 'tbfight.fighters' };
  }
  if (rec.monsterId || rec.monsterName) {
    return { rule: 'CORPSE-MONSTER', certain: true, specific: 'monster kill (monsterId on record)',
      monster: rec.monsterName || rec.monsterId, field: 'monsterId/monsterName' };
  }
  const lh = rec.lastHurt || null;
  if (lh && lh.cause === 'monster' && lh.day === rec.day) {
    return { rule: 'LAST-HURT-MONSTER', certain: false, specific: 'monster kill, probable (last hurt monster, same day)',
      monster: null, field: 'lastHurt' };
  }
  let reason;
  if (tb && fighters.length && hasMonster && hasHostile) reason = 'tbfight has monster + hostile fighters';
  else if (tb && fighters.length && !hasMonster) reason = 'tbfight present but no monster fighter';
  else if (lh && lh.cause !== 'monster') reason = 'last hurt non-monster';
  else if (lh && lh.day !== rec.day) reason = 'last hurt older than same day';
  else reason = 'no tbfight, no monsterId, no same-day monster hurt';
  return { rule: 'RESIDUAL', certain: false, specific: null, monster: null, field: null, reason };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => /^wildbucket-a-competent-s\d+\.json$/.test(f)).sort();
  const perSeed = [];
  let deaths = 0, wild = 0;
  const byRule = {};
  const residualReasons = {};
  const wildRecords = [];
  for (const f of files) {
    const ps = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const ds = ps.deaths || [];
    let w = 0;
    for (const d of ds) {
      deaths += 1;
      if (d.cause === 'the wild') {
        wild += 1; w += 1;
        const c = classify(d);
        wildRecords.push({ seed: ps.seed, death: d, classification: c });
        byRule[c.rule] = (byRule[c.rule] || 0) + 1;
        if (c.rule === 'RESIDUAL') residualReasons[c.reason] = (residualReasons[c.reason] || 0) + 1;
      }
    }
    perSeed.push({ seed: ps.seed, daysAlive: ps.daysAlive, deaths: ds.length, wild: w, errors: (ps.errors || []).length });
  }
  const assigned = wild - (byRule.RESIDUAL || 0);
  const certain = (byRule['TB-MONSTER'] || 0) + (byRule['CORPSE-MONSTER'] || 0);
  const maxResidualReason = Object.entries(residualReasons).sort((a, b) => b[1] - a[1])[0] || null;
  return { dir, seeds: files.length, perSeed, deaths, wild, byRule, residualReasons,
    assigned, assignedShare: wild ? assigned / wild : null,
    certain, certainShare: wild ? certain / wild : null,
    maxResidualReason: maxResidualReason ? { reason: maxResidualReason[0], count: maxResidualReason[1],
      share: wild ? maxResidualReason[1] / wild : null } : null,
    wildShare: deaths ? wild / deaths : null, wildRecords };
}

function printReport(title, rep) {
  console.log('=== ' + title + ' ===');
  console.log('seeds=' + rep.seeds + ' deaths=' + rep.deaths + ' wild=' + rep.wild +
    ' wildShare=' + (rep.wildShare == null ? 'null' : rep.wildShare.toFixed(3)));
  console.log('byRule=' + JSON.stringify(rep.byRule));
  console.log('residualReasons=' + JSON.stringify(rep.residualReasons));
  console.log('assigned=' + rep.assigned + ' share=' + (rep.assignedShare == null ? 'null' : rep.assignedShare.toFixed(3)));
  console.log('certain=' + rep.certain + ' share=' + (rep.certainShare == null ? 'null' : rep.certainShare.toFixed(3)));
  console.log('maxResidualReason=' + JSON.stringify(rep.maxResidualReason));
  console.log('perSeed=' + JSON.stringify(rep.perSeed));
  // Absent-field census over residual records (DIAG evidence, prereg).
  const res = rep.wildRecords.filter((r) => r.classification.rule === 'RESIDUAL');
  const census = { total: res.length,
    noTbfight: res.filter((r) => !r.death.tbfight).length,
    noMonsterId: res.filter((r) => !r.death.monsterId && !r.death.monsterName).length,
    noLastHurt: res.filter((r) => !r.death.lastHurt).length,
    playerFlag: res.filter((r) => r.death.player).length,
    scholarFlag: res.filter((r) => r.death.isScholar).length };
  console.log('residualAbsentFieldCensus=' + JSON.stringify(census));
  return rep;
}

if (require.main === module) {
  const dirs = process.argv.slice(2);
  if (!dirs.length) { console.error('usage: node scripts/analyze-wildbucket-a.js <per-seed-dir> [...]'); process.exit(2); }
  const reps = dirs.map((d) => printReport(d, analyzeDir(d)));
  if (reps.length > 1) {
    const pooled = { seeds: reps.reduce((a, r) => a + r.seeds, 0),
      deaths: reps.reduce((a, r) => a + r.deaths, 0), wild: reps.reduce((a, r) => a + r.wild, 0),
      byRule: {}, residualReasons: {}, wildRecords: [] };
    for (const r of reps) {
      for (const [k, v] of Object.entries(r.byRule)) pooled.byRule[k] = (pooled.byRule[k] || 0) + v;
      for (const [k, v] of Object.entries(r.residualReasons)) pooled.residualReasons[k] = (pooled.residualReasons[k] || 0) + v;
      pooled.wildRecords.push(...r.wildRecords);
    }
    pooled.assigned = pooled.wild - (pooled.byRule.RESIDUAL || 0);
    pooled.assignedShare = pooled.wild ? pooled.assigned / pooled.wild : null;
    pooled.certain = (pooled.byRule['TB-MONSTER'] || 0) + (pooled.byRule['CORPSE-MONSTER'] || 0);
    pooled.certainShare = pooled.wild ? pooled.certain / pooled.wild : null;
    const mx = Object.entries(pooled.residualReasons).sort((a, b) => b[1] - a[1])[0] || null;
    pooled.maxResidualReason = mx ? { reason: mx[0], count: mx[1], share: pooled.wild ? mx[1] / pooled.wild : null } : null;
    pooled.wildShare = pooled.deaths ? pooled.wild / pooled.deaths : null;
    pooled.perSeed = reps.flatMap((r) => r.perSeed);
    printReport('POOLED', pooled);
  }
}
module.exports = { classify, analyzeDir };
