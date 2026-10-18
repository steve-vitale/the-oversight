// build-r18-tele.js — per-arm telemetry aggregates for telemetry-check.
const fs = require('fs');
const path = require('path');
const EVIDIR = path.join(__dirname, '..', 'evidence', '2026-10-18');
for (const arm of ['grey', 'trial']) {
  const agg = { wins: 0, table: 0, tableSceneFired: 0, tableSceneCompleted: 0, seatApproach: 0, ascensions: 0, exiled: 0 };
  for (const seed of [8961, 8962, 8963, 8964]) {
    const f = path.join(EVIDIR, `journey-endgame-r18-${arm}-s${seed}.json`);
    if (!fs.existsSync(f)) continue;
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    const m = d.m || {};
    if (m.announceDay != null) agg.seatApproach++;
    if ((m.doorEntries || []).length) { agg.table++; agg.tableSceneFired++; }
    if (d.won) { agg.wins++; agg.tableSceneCompleted++; }
  }
  const out = path.join(EVIDIR, `tele-r18-${arm}.json`);
  fs.writeFileSync(out, JSON.stringify(agg, null, 1));
  console.log(arm, JSON.stringify(agg));
}
