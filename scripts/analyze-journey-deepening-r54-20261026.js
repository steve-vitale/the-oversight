// analyze-journey-deepening-r54-20261026.js -- panel summary for the R54
// Amanda + bark-geography + loot run: P1 Amanda choice-log, P2 determinism
// vs the r52 panel, P3 bark geography (tree-proximity snaps), M5 winnable,
// stay-green. Reads the r54 seed JSONs + transcripts from the goal evidence
// dir; prints to stdout.
// Usage: node scripts/analyze-journey-deepening-r54-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-26');
// R54 FIX (r53 note: the r53 analyzer's comparison column carried stale values):
// r53 panel values below are read DIRECTLY from the r53 seed JSONs in the
// evidence dir (verified 2026-10-26: vineCalls/maxVine/madeBark/fights/days/
// alive/deaths/mislabels), not copied from any prior analyzer or run note.
// If a future analyzer copies this table, re-derive it from that run's JSONs.
const R53 = {
  42001: { vineGains: 4, maxVine: 2, made: 0, fights: 7, days: 101, alive: 8, deaths: 16, mis: 0 },
  42002: { vineGains: 8, maxVine: 4, made: 2, fights: 24, days: 90, alive: 0, deaths: 33, mis: 0 },
  42003: { vineGains: 5, maxVine: 2, made: 0, fights: 15, days: 101, alive: 8, deaths: 21, mis: 0 },
  42004: { vineGains: 8, maxVine: 9, made: 0, fights: 15, days: 101, alive: 11, deaths: 24, mis: 0 },
};
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r54-seed${seed}.json`);
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
  console.log(`  P2 vs r53: vineGainCalls=${intra.forageVineGainCalls} (r53: ${R53[seed].vineGains}) maxVine=${mf.maxVine} (r53: ${R53[seed].maxVine}) madeBark=${made} (r53: ${R53[seed].made}) fightsTotal=${d.fightsTotal} (r53: ${R53[seed].fights}) deaths=${(d.deaths || []).length} (r53: ${R53[seed].deaths}) days=${d.maxGameDay} (r53: ${R53[seed].days}) alive=${alive} (r53: ${R53[seed].alive})`);
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
    const tfp = path.join(EVIDIR, `journey-deepening-r54-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(tfp)) { console.log(`  transcript d${day}: MISSING`); continue; }
    const txt = fs.readFileSync(tfp, 'utf8');
    const wantLine = (txt.match(/want: .*$/m) || ['?'])[0];
    const finalLine = (txt.match(/want final: .*$/m) || ['?'])[0];
    const offered = [...txt.matchAll(/\(offered=\[([^\]]*)\] thread=(\S+) want=(\S+) stage=(\d+)\)/g)];
    const wantOffered = offered.filter(m => /alive:want:|dlg:help/.test(m[1])).length;
    console.log(`  transcript d${day}: ${wantLine} | ${finalLine} | offeredTurns=${offered.length} wantOrHelpOfferedTurns=${wantOffered}`);
  }
}
