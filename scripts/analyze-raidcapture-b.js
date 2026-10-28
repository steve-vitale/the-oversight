#!/usr/bin/env node
// analyze-raidcapture-b.js — fold-closure analyzer (DIAG only,
// sim-raidcapture-b). Judged ONLY against
// evidence/2026-10-27/sim-raidcapture-b-prereg.md.
//
// Per per-seed payload from scripts/sweep-raidcapture-b.js:
//   OLD residual = boundary-aware (post-run finalPantry) family residual
//     computed by the REUSED analyzer (analyze-stockdoors-b-2030.js
//     perSeedBa) on a copy of the payload with the folded
//     'remove-pantry-kcal' directRecords EXCLUDED — i.e. the old
//     instrument's ledger, which is blind to _removePantryKcal takes.
//   Folded kcal = sum of the folded records' items for that family.
//   NEW residual = OLD + folded (folded takes are draws the old
//     ledger missed, so adding them moves a negative residual to 0).
// Judged families: the generic family's DRIED channel ('Foraged food'
// driedResidualBa) and Canned soup (family residualBa).
// Consistency check: perSeedBa on the UNFILTERED payload must equal
// OLD + folded exactly — if it does not, some record other than the
// folded door moved, and the closure claim is void.
// Optionally (second argv: driedhunt corpus dir) compares the folded
// records against the driedhunt step-2 takes for the same seeds
// (day, caller, asked, ret, item sums) — the folded door must
// reproduce the probe it replaces.
// Usage: node scripts/analyze-raidcapture-b.js <corpusDir> [driedhuntDir]
// When required, exports { judgeSeed, foldedSums }.
'use strict';
const fs = require('fs');
const path = require('path');
const { perSeedBa, famOf, isDried } = require('./analyze-stockdoors-b-2030');

function foldedSums(ps) {
  const recs = (ps.directRecords || []).filter(r => r.path === 'remove-pantry-kcal');
  let dried = 0, soup = 0, total = 0;
  const byCaller = {};
  const byFamily = {};
  for (const r of recs) {
    for (const it of (r.items || [])) {
      const k = (it.units || 0) * (it.kcalEach || 0);
      total += k;
      const f = famOf(String(it.name));
      byFamily[f] = (byFamily[f] || 0) + k;
      if (f === 'Foraged food' && isDried(it.name)) dried += k;
      if (String(it.name) === 'Canned soup') soup += k;
    }
    const c = r.caller || '?';
    byCaller[c] = (byCaller[c] || 0) + (r.totalKcal || 0);
  }
  return { records: recs.length, total, dried, soup, byCaller, byFamily, recs };
}

function rowOf(rows, family) {
  return rows.find(r => r.family === family) || null;
}

function judgeSeed(ps) {
  const full = perSeedBa(ps);
  const stripped = JSON.parse(JSON.stringify(ps));
  stripped.directRecords = (stripped.directRecords || []).filter(r => r.path !== 'remove-pantry-kcal');
  const old = perSeedBa(stripped);
  const f = foldedSums(ps);
  const genOld = rowOf(old.rows, 'Foraged food');
  const genFull = rowOf(full.rows, 'Foraged food');
  const soupOld = rowOf(old.rows, 'Canned soup');
  const soupFull = rowOf(full.rows, 'Canned soup');
  const oldDried = genOld ? genOld.driedResidualBa : null;
  const oldSoup = soupOld ? soupOld.residualBa : null;
  const newDried = oldDried == null ? null : oldDried + f.dried;
  const newSoup = oldSoup == null ? null : oldSoup + f.soup;
  // Consistency: the unfiltered ledger must equal OLD + folded exactly.
  const fullDried = genFull ? genFull.driedResidualBa : null;
  const fullSoup = soupFull ? soupFull.residualBa : null;
  const consistent = (fullDried === newDried) && (fullSoup === newSoup);
  const passLeg = (oldV, newV, foldedV) => {
    if (oldV == null) return null;
    if (oldV === 0) return foldedV === 0 ? true : 'ANOMALY';
    return Math.abs(newV) <= 0.10 * Math.abs(oldV);
  };
  return { seed: ps.seed, daysAlive: ps.daysAlive, deaths: ps.deaths,
    waveReach: ps.waveReach, national: ps.national, table: ps.table, win: ps.win,
    rank: ps.rank, finalFresh: (ps.finalPantry || {}).freshKcal,
    oldDried, foldedDried: f.dried, newDried, driedPass: passLeg(oldDried, newDried, f.dried),
    oldSoup, foldedSoup: f.soup, newSoup, soupPass: passLeg(oldSoup, newSoup, f.soup),
    foldedRecords: f.records, foldedTotal: f.total, foldedByCaller: f.byCaller,
    foldedByFamily: f.byFamily, consistent, fullDried, fullSoup,
    wrappedPaths: ((ps.directCounters || {}).wrappedPaths || []),
    missingPaths: ((ps.directCounters || {}).missingPaths || []),
    removeCalls: ((ps.directCounters || {}).calls || {})['remove-pantry-kcal'] || 0 };
}

function compareToDriedhunt(ps, driedhuntDir) {
  const f = path.join(driedhuntDir, `driedhunt-b-competent-nofeast-s${ps.seed}.json`);
  if (!fs.existsSync(f)) return { present: false };
  const old = JSON.parse(fs.readFileSync(f, 'utf8'));
  const oldTakes = old.driedhuntTakes || [];
  const folded = foldedSums(ps).recs;
  const key = (t) => [t.day, t.caller, t.asked, t.ret,
    (t.items || []).map(i => `${i.name}x${i.units}`).sort().join(',')].join('|');
  const a = oldTakes.map(key).sort();
  const b = folded.map(r => key({ day: r.day, caller: r.caller, asked: r.asked,
    ret: r.retTaken, items: r.items })).sort();
  return { present: true, oldTakes: oldTakes.length, folded: folded.length,
    identical: JSON.stringify(a) === JSON.stringify(b),
    oldOnly: a.filter(x => b.indexOf(x) < 0), newOnly: b.filter(x => a.indexOf(x) < 0) };
}

if (require.main === module) {
  const dir = process.argv[2];
  const dhDir = process.argv[3] || null;
  if (!dir) { console.error('usage: analyze-raidcapture-b.js <corpusDir> [driedhuntDir]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  for (const fn of files) {
    const ps = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
    const j = judgeSeed(ps);
    console.log(`seed ${j.seed}: days=${j.daysAlive} deaths=${j.deaths} wave=${(j.waveReach || []).length} rank=${j.rank} finalFresh=${j.finalFresh}`);
    console.log(`  dried: old=${j.oldDried} folded=${j.foldedDried} new=${j.newDried} pass=${j.driedPass} consistent=${j.consistent}`);
    console.log(`  soup:  old=${j.oldSoup} folded=${j.foldedSoup} new=${j.newSoup} pass=${j.soupPass}`);
    console.log(`  folded: records=${j.foldedRecords} total=${j.foldedTotal} calls=${j.removeCalls} byCaller=${JSON.stringify(j.foldedByCaller)} byFamily=${JSON.stringify(j.foldedByFamily)}`);
    console.log(`  wrapped=${j.wrappedPaths.join(',')} missing=${j.missingPaths.join(',') || 'none'}`);
    if (dhDir) {
      const c = compareToDriedhunt(ps, dhDir);
      console.log(`  vs driedhunt probe: present=${c.present} oldTakes=${c.oldTakes} folded=${c.folded} identical=${c.identical}` +
        (c.identical === false ? ` oldOnly=${JSON.stringify(c.oldOnly)} newOnly=${JSON.stringify(c.newOnly)}` : ''));
    }
  }
}

module.exports = { judgeSeed, foldedSums, compareToDriedhunt };
