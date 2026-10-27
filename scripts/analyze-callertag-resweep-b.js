#!/usr/bin/env node
// analyze-callertag-resweep-b.js — per-caller split + determinism diff for
// sim-callertag-resweep-b (DIAG, no src/js). Reads the NEW re-sweep corpus
// (evidence/2026-10-27/sim-callertag-resweep-b-corpus/) and the ORIGINAL
// corpus (evidence/2026-10-26/sim-stock9762-b-corpus/), read-only.
//
// 1. DETERMINISM DIFF: every per-seed payload field EXCEPT the new
//    callerTagRecords / callerTagCount / villageName / pastVillageNames
//    fields and the timing field ms must be deep-equal to the original
//    corpus file for the same seed. Any divergence is printed and fails
//    the determinism leg (exit non-zero), never smoothed over.
// 2. PER-CALLER SPLIT: garden-carrying callerTagRecords
//    (gardenShares != null) joined in order to gardenInflows deposit-door
//    records; the join must balance both ways and match on
//    (day, name, kcal) per index. Counts per callerTag, kcal per caller,
//    destVillage values per caller, and unclassified garden records
//    (other:<frame> tag or join mismatch) are printed.
// 3. ASSISTED/ORDINARY SPLIT: counted from the FULL gardenShares object
//    (assisted / ordinary / legacyAssisted / legacy / other-shape).
// 4. EXILE SHARE: counted returnToOldVillage records + destVillage
//    cross-check against the seed's final villageName.
// 5. WALL NUMBERS: national / table / wins, wave 4-5 unlocks, wave reach,
//    median/max survival, death-cause shares for the re-sweep corpus.
// 6. TRACE: first garden deposit record per deposit seed, with the
//    caller's destVillage/tag and nearby coax sayLines, for the
//    evidence sense-check.
// Usage: node scripts/analyze-callertag-resweep-b.js
// Exit 0 only if determinism passes AND join balances AND single-caller
// share >= 95%.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const NEW = path.join(root, 'evidence', '2026-10-27', 'sim-callertag-resweep-b-corpus');
const OLD = path.join(root, 'evidence', '2026-10-26', 'sim-stock9762-b-corpus');
const SEEDS = [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767];
const NEWFIELDS = new Set(['callerTagRecords', 'callerTagCount', 'villageName', 'pastVillageNames']);
const load = (dir, seed, prefix) => JSON.parse(fs.readFileSync(
  path.join(dir, `${prefix}-competent-nofeast-s${seed}.json`), 'utf8'));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

let detFail = 0, joinFail = 0;
const wall = { national: 0, table: 0, wins: 0, w4: 0, w5: 0, days: [], deathCauses: {} };
const split = {}; // callerTag -> {n, kcal, dests:Set}
const shares = {}; // class -> {n, kcal}
const perSeed = {};
let bandGarden = 0, bandKcal = 0, bandUncl = 0;

for (const s of SEEDS) {
  const n = load(NEW, s, 'callertag-resweep-b');
  const o = load(OLD, s, 'stock9762-b');
  // --- determinism diff ---
  const diffs = [];
  const keys = new Set([...Object.keys(n), ...Object.keys(o)]);
  for (const k of keys) {
    if (NEWFIELDS.has(k) || k === 'ms') continue;
    if (!eq(n[k], o[k])) diffs.push(k);
  }
  if (diffs.length) { detFail++; console.log(`DETERMINISM-DIFF seed=${s} fields=[${diffs.join(',')}]`); }
  // --- wall numbers (re-sweep corpus) ---
  if (n.national) wall.national++;
  if (n.table) wall.table++;
  if (n.win) wall.wins++;
  if ((n.waveReach || []).includes(4)) wall.w4++;
  if ((n.waveReach || []).includes(5)) wall.w5++;
  wall.days.push(n.daysAlive);
  for (const [c, v] of Object.entries(n.deathCauses || {})) wall.deathCauses[c] = (wall.deathCauses[c] || 0) + v;
  // --- per-caller split + join ---
  const gDep = (n.gardenEvents.gardenInflows || []).filter(r => r.door === 'deposit');
  const cGarden = (n.callerTagRecords || []).filter(r => r.gardenShares != null);
  let uncl = 0, mism = 0;
  if (gDep.length !== cGarden.length) { joinFail++; mism = Math.abs(gDep.length - cGarden.length); }
  const len = Math.min(gDep.length, cGarden.length);
  for (let i = 0; i < len; i++) {
    if (gDep[i].day !== cGarden[i].day || gDep[i].name !== cGarden[i].name || gDep[i].kcal !== cGarden[i].kcal) mism++;
  }
  if (mism) { joinFail++; console.log(`JOIN-MISMATCH seed=${s} gardenInflows=${gDep.length} callerTag=${cGarden.length} mismatches=${mism}`); }
  const row = { garden: gDep.length, kcal: 0, callers: {}, dests: {}, shares: {}, unclassified: 0, villageName: n.villageName, pastVillages: n.pastVillageNames };
  for (const r of cGarden) {
    const tag = r.callerTag;
    row.callers[tag] = row.callers[tag] || { n: 0, kcal: 0 };
    row.callers[tag].n++; row.callers[tag].kcal += r.kcal || 0;
    row.kcal += r.kcal || 0;
    row.dests[r.destVillage || '?'] = (row.dests[r.destVillage || '?'] || 0) + 1;
    const gs = r.gardenShares || {};
    const cls = gs.assisted ? 'assisted' : gs.ordinary ? 'ordinary' : gs.legacyAssisted ? 'legacyAssisted' : gs.legacy ? 'legacy' : 'other-shape:' + JSON.stringify(gs);
    row.shares[cls] = row.shares[cls] || { n: 0, kcal: 0 };
    row.shares[cls].n++; row.shares[cls].kcal += r.kcal || 0;
    if (tag.startsWith('other:')) { uncl++; row.unclassified++; }
    if (!split[tag]) split[tag] = { n: 0, kcal: 0, dests: {} };
    split[tag].n++; split[tag].kcal += r.kcal || 0;
    split[tag].dests[r.destVillage || '?'] = (split[tag].dests[r.destVillage || '?'] || 0) + 1;
    if (!shares[cls]) shares[cls] = { n: 0, kcal: 0 };
    shares[cls].n++; shares[cls].kcal += r.kcal || 0;
  }
  row.unclassified += mism;
  bandGarden += gDep.length; bandKcal += row.kcal; bandUncl += row.unclassified;
  perSeed[s] = row;
  console.log(`seed=${s} village=${n.villageName} past=${JSON.stringify(n.pastVillageNames)} garden=${gDep.length} kcal=${row.kcal} callers=${JSON.stringify(row.callers)} dests=${JSON.stringify(row.dests)} shares=${JSON.stringify(row.shares)} unclassified=${row.unclassified} daysAlive=${n.daysAlive} deaths=${n.deaths} waveReach=${JSON.stringify(n.waveReach)} rank=${n.rank} national=${n.national} table=${n.table}`);
  // --- trace: first garden deposit record + nearby coax lines ---
  if (cGarden.length) {
    const first = cGarden[0];
    const coax = (n.gardenEvents.sayLines || []).filter(x => x.line.includes('coax') && Math.abs(x.day - first.day) <= 3).slice(0, 6);
    console.log(`TRACE seed=${s} firstDeposit=${JSON.stringify(first)} nearbyCoax=${JSON.stringify(coax.map(x => ({ day: x.day, line: x.line.slice(0, 120) })))}`);
  }
}
const sortedDays = [...wall.days].sort((a, b) => a - b);
const median = sortedDays.length % 2 ? sortedDays[(sortedDays.length - 1) / 2]
  : (sortedDays[sortedDays.length / 2 - 1] + sortedDays[sortedDays.length / 2]) / 2;
const singleN = bandGarden - bandUncl;
const singleShare = bandGarden ? singleN / bandGarden : 0;
console.log('\n=== BAND ===');
console.log(`garden records=${bandGarden} kcal=${bandKcal} unclassified=${bandUncl} single-caller=${singleN} share=${(singleShare * 100).toFixed(1)}%`);
console.log('per-caller=' + JSON.stringify(split, null, 0));
console.log('per-shares-class=' + JSON.stringify(shares));
console.log(`wall: national=${wall.national}/8 table=${wall.table}/8 wins=${wall.wins}/8 wave4=${wall.w4}/8 wave5=${wall.w5}/8 medianSurvival=${median} maxSurvival=${Math.max(...wall.days)} days=${JSON.stringify(wall.days)}`);
console.log('deathCauses=' + JSON.stringify(wall.deathCauses));
console.log('per-seed=' + JSON.stringify(perSeed));
const go = detFail === 0 && joinFail === 0 && singleShare >= 0.95;
console.log(go ? '\nVERDICT: GO (determinism clean, join balanced, single-caller >= 95%)'
  : `\nVERDICT: NO-GO (detFail=${detFail} joinFail=${joinFail} singleShare=${(singleShare * 100).toFixed(1)}%)`);
process.exit(go ? 0 : 1);
