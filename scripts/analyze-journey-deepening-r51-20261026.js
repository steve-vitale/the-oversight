// analyze-journey-deepening-r51-20261026.js -- panel summary for the R51
// Amanda + bark-geography + loot run: P1 Amanda choice-log, P2 determinism
// vs the r50 panel, P3 bark geography (tree-proximity snaps), M5 winnable,
// stay-green. Reads the r51 seed JSONs + transcripts from the goal evidence
// dir; prints to stdout.
// Usage: node scripts/analyze-journey-deepening-r51-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-26');
// r50 panel values (journey-deepening-r50.md table + seed JSONs).
const R50 = {
  42001: { vineGains: 1, maxVine: 1, made: 0, fights: 9 },
  42002: { vineGains: 4, maxVine: 3, made: 1, fights: 11 },
  42003: { vineGains: 5, maxVine: 3, made: 2, fights: 7 },
  42004: { vineGains: 13, maxVine: 4, made: 0, fights: 21 },
};
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r51-seed${seed}.json`);
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = a.matflow || {};
  const intra = mf.intraday || {};
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  const made = (ca.made && ca.made.bark_armor) || 0;
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  P2 vs r50: vineGainCalls=${intra.forageVineGainCalls} (r50: ${R50[seed].vineGains}) maxVine=${mf.maxVine} (r50: ${R50[seed].maxVine}) madeBark=${made} (r50: ${R50[seed].made}) fightsTotal=${d.fightsTotal} (r50: ${R50[seed].fights}) deaths=${(d.deaths || []).length}`);
  console.log(`  P2 crafts: fails=${JSON.stringify(ca.fails)} matHist=${JSON.stringify(ca.matHist)}`);
  const ga = a.gatherAttempts || [];
  const gaCount = {};
  for (const g of ga) gaCount[g.result] = (gaCount[g.result] || 0) + 1;
  console.log(`  gatherAttempts n=${ga.length} ${JSON.stringify(gaCount)} gatherCalls=${intra.gatherCalls} gatherBarkTotal=${intra.gatherBarkTotal}`);
  const ts = a.treeSnaps || [];
  const byPhase = {};
  for (const t of ts) {
    byPhase[t.phase] = byPhase[t.phase] || { n: 0, trees: 0 };
    byPhase[t.phase].n++;
    if (t.treeIn3x3) byPhase[t.phase].trees++;
  }
  console.log(`  P3 treeSnaps n=${ts.length} byPhase=${JSON.stringify(byPhase)}`);
  console.log(`  lootArm entries=${(a.lootArm || []).length} convoMode=${a.convoMode} lootBarkOn=${a.lootBarkOn}`);
  console.log(`  w3fights=${(d.w3fights || []).length} engagedW3=${(d.engaged || {}).w3}`);
  for (const day of [45, 60, 80]) {
    const tfp = path.join(EVIDIR, `journey-deepening-r51-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(tfp)) { console.log(`  transcript d${day}: MISSING`); continue; }
    const txt = fs.readFileSync(tfp, 'utf8');
    const wantLine = (txt.match(/want: .*$/m) || ['?'])[0];
    const finalLine = (txt.match(/want final: .*$/m) || ['?'])[0];
    const offered = [...txt.matchAll(/\(offered=\[([^\]]*)\] thread=(\S+) want=(\S+) stage=(\d+)\)/g)];
    const wantOffered = offered.filter(m => /alive:want:|dlg:help/.test(m[1])).length;
    console.log(`  transcript d${day}: ${wantLine} | ${finalLine} | offeredTurns=${offered.length} wantOrHelpOfferedTurns=${wantOffered}`);
  }
}
