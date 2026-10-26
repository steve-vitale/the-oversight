#!/usr/bin/env node
// inflow-days.js — racks-bound-day inflow attribution (sim-inflow-b).
//
// Shared by scripts/test-inflow-b.js (T1 fixtures, T2 corpus) and
// scripts/analyze-inflow-b.js, so attribution cannot drift between
// proof and report. Input: one seed's substrate day table (rows with
// .day + pantry/preserved/fresh snapshots) + inflow records.
// Output: one row per racks-bound day, exactly one dominant class
// OR one named prior-stock reason — never neither, never both.
//
// Class mapping (pre-registered; first match wins; total over all
// recorded names — unknown stock names land in other-stock with
// their verbatim name kept on the record, never aggregated away):
//   stock door: 'Garden harvest'->garden, 'Fish catch'->fish,
//     'Foraged food'->forage, 'Game meat'/'Snared meat'/^Pit meat/
//     'Expedition meat'/'Emergency hunt meat'->hunt,
//     'Expedition haul'->expedition, /^Aid from /'Aid crew haul'/
//     ^Remedy stores from /'Restitution'/'Weregild'/
//     'Refunded trade goods'/'Ration returned'/^Tribute grain from /
//     ->trade-aid, 'Trial feast'/^System-replicated/'Genesis fruit'/
//     "Hoarder's interest"/'Meal leftovers'->system-feast, else other-stock.
//   deposit door -> donated-pack (any name; name kept verbatim).
//   pantryAdd door -> finished-putaway iff added===true; a
//     pantryAdd record with added===false contributes 0 kcal and no
//     class (cap refusal, not inflow) — it is still counted in
//     refusedCount so the row can say so.
// Dominant = max class kcal that day; ties break by earliest first
// arrival (lowest record seq among that class's records that day).
// A day with total inflow 0 gets dominantClass null and a
// prior-stock reason string carrying its pantry snapshot.
'use strict';

function classifyInflow(rec) {
  if (!rec) return null;
  if (rec.door === 'deposit') return 'donated-pack';
  if (rec.door === 'pantryAdd') return rec.added ? 'finished-putaway' : null;
  if (rec.door !== 'stock') return 'other-stock';
  const n = rec.name || '';
  if (n === 'Garden harvest') return 'garden';
  if (n === 'Fish catch') return 'fish';
  if (n === 'Foraged food') return 'forage';
  if (n === 'Game meat' || n === 'Snared meat' || n === 'Expedition meat' || n === 'Emergency hunt meat' || /^Pit meat/.test(n)) return 'hunt';
  if (n === 'Expedition haul') return 'expedition';
  if (/^Aid from /.test(n) || n === 'Aid crew haul' || /^Remedy stores from /.test(n) || n === 'Restitution' || n === 'Weregild' || n === 'Refunded trade goods' || n === 'Ration returned' || /^Tribute grain from /.test(n)) return 'trade-aid';
  if (n === 'Trial feast' || /^System-replicated/.test(n) || n === 'Genesis fruit' || n === "Hoarder's interest" || n === 'Meal leftovers') return 'system-feast';
  return 'other-stock';
}

function inflowKcal(rec) {
  if (!rec) return 0;
  if (rec.door === 'pantryAdd' && !rec.added) return 0;
  const k = Math.round(rec.kcal || 0);
  return k > 0 ? k : 0;
}

function buildAttributionTable(dayTable, inflows) {
  const byDay = new Map();
  for (const rec of (inflows || [])) {
    const d = rec.day;
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(rec);
  }
  const rows = [];
  for (const drow of (dayTable || [])) {
    const day = drow.day;
    const recs = byDay.get(day) || [];
    const byClass = {};
    const firstSeq = {};
    const namesByClass = {};
    let total = 0, count = 0, refused = 0;
    for (const rec of recs) {
      if (rec.door === 'pantryAdd' && !rec.added) { refused++; continue; }
      const cls = classifyInflow(rec);
      if (!cls) { refused++; continue; }
      const k = inflowKcal(rec);
      if (k <= 0) continue;
      count++;
      total += k;
      byClass[cls] = (byClass[cls] || 0) + k;
      if (firstSeq[cls] == null || rec.seq < firstSeq[cls]) firstSeq[cls] = rec.seq;
      if (!namesByClass[cls]) namesByClass[cls] = {};
      const nm = rec.name || '(unnamed)';
      namesByClass[cls][nm] = (namesByClass[cls][nm] || 0) + k;
    }
    let dominantClass = null, dominantKcal = 0;
    for (const cls of Object.keys(byClass)) {
      const k = byClass[cls];
      if (dominantClass === null || k > dominantKcal ||
        (k === dominantKcal && firstSeq[cls] < firstSeq[dominantClass])) {
        dominantClass = cls; dominantKcal = k;
      }
    }
    const attributed = total > 0 && dominantClass !== null;
    let reason = null;
    if (!attributed) {
      reason = 'prior-stock: no recorded inflow this day; pantry at first bound line held ' +
        drow.pantryFirst + ' kcal (' + drow.freshFirst + ' fresh days), so the racks smoked from stock accumulated on earlier days (including starting stock)';
    }
    rows.push({
      day, attributed, dominantClass, dominantKcal,
      dominantShare: total > 0 ? dominantKcal / total : 0,
      totalInflowKcal: total, inflowRecords: count, refusedPantryAdd: refused,
      byClass, namesByClass,
      pantryFirst: drow.pantryFirst, preservedFirst: drow.preservedFirst,
      freshFirst: drow.freshFirst, pantryLast: drow.pantryLast,
      reason,
    });
  }
  rows.sort((a, b) => a.day - b.day);
  return rows;
}

module.exports = { classifyInflow, inflowKcal, buildAttributionTable };
