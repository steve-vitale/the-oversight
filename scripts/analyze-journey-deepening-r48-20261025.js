// analyze-journey-deepening-r48-20261025.js -- panel summary for the R48
// deepening run: vine arrival (P1), full-run sufficient attempts + roll
// outcomes (P2), winnable (M5), stay-green, faucet watch. Compares against
// the r47 panel values recorded in the prereg. Reads the r48 seed JSONs
// from the goal evidence dir; prints a compact summary to stdout.
// Usage: node scripts/analyze-journey-deepening-r48-20261025.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-25');
const R47 = {
  42001: { vineGains: 4, maxVine: 2, sufBark: 1, sufHide: 0, made: 0, failsBark: 1 },
  42002: { vineGains: 2, maxVine: 2, sufBark: 1, sufHide: 0, made: 0, failsBark: 1 },
  42003: { vineGains: 2, maxVine: 1, sufBark: 0, sufHide: 0, made: 0, failsBark: 0 },
  42004: { vineGains: 13, maxVine: 4, sufBark: 0, sufHide: 0, made: 0, failsBark: 0 },
};
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r48-seed${seed}.json`);
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = (a.matflow || {});
  const intra = mf.intraday || {};
  const mh = ca.matHist || {};
  const diag = ca.diag || [];
  const sufDiag = diag.filter(e => (e.rid === 'bark_armor' && e.bark >= 3 && e.vine >= 2) || (e.rid === 'hide_armor' && e.hide >= 2 && e.vine >= 1));
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  P1 vine: gainCalls=${intra.forageVineGainCalls} (r47: ${R47[seed].vineGains}) maxVine=${mf.maxVine} (r47: ${R47[seed].maxVine}) daysVinePos=${mf.daysVinePos} thicketCalls=${intra.thicketCalls} seekTrips=${(d.ctxSummary || {}).armorVineSeekTrips} gainByTile=${JSON.stringify(intra.forageVineGainByTile)}`);
  console.log(`  P2 crafts: matHist=${JSON.stringify(mh)} made=${JSON.stringify(ca.made)} fails=${JSON.stringify(ca.fails)} diagN=${diag.length} sufDiagN=${sufDiag.length}`);
  for (const e of sufDiag) console.log(`    SUF: d${e.day} ${e.rid} bark=${e.bark} vine=${e.vine} hide=${e.hide} lvl=${e.level} -> ${e.result}`);
  console.log(`  w3fights=${(d.w3fights || []).length} engagedW3=${(d.engaged || {}).w3} popEnd=${alive}`);
}
