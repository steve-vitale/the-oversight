// analyze-journey-deepening-r55-20261027.js -- panel summary for the R55 panel
// vs the r54 panel (values read from the r54 run note + r54 seed JSONs, not
// copied from any analyzer's stale column). Reads the r55 seed JSONs +
// transcripts from the goal evidence dir; prints to stdout.
// Usage: node scripts/analyze-journey-deepening-r55-20261027.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-27');
// r54 panel (run note, verified against r54 seed JSONs at r54 closeout):
const R54 = {
  42001: { days: 101, fights: 7, deaths: 16, alive: 8, vine: 4, made: 0 },
  42002: { days: 90, fights: 24, deaths: 33, alive: 0, vine: 8, made: 2 },
  42003: { days: 101, fights: 15, deaths: 21, alive: 8, vine: 5, made: 0 },
  42004: { days: 101, fights: 15, deaths: 24, alive: 11, vine: 8, made: 0 },
};
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r55-seed${seed}.json`);
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = (a.matflow || {}).intraday || {};
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  const made = (ca.made && ca.made.bark_armor) || 0;
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  vs r54: days=${d.maxGameDay} (r54: ${R54[seed].days}) fightsTotal=${d.fightsTotal} (r54: ${R54[seed].fights}) deaths=${(d.deaths || []).length} (r54: ${R54[seed].deaths}) alive=${alive} (r54: ${R54[seed].alive}) vineGainCalls=${mf.forageVineGainCalls} (r54: ${R54[seed].vine}) madeBark=${made} (r54: ${R54[seed].made})`);
  console.log(`  crafts: fails=${JSON.stringify(ca.fails)} w3fights=${(d.w3fights || []).length} engagedW3=${(d.engaged || {}).w3}`);
  for (const day of [45, 60, 80]) {
    const tfp = path.join(EVIDIR, `journey-deepening-r55-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(tfp)) { console.log(`  transcript d${day}: MISSING`); continue; }
    const txt = fs.readFileSync(tfp, 'utf8');
    const wantLine = (txt.match(/want: .*$/m) || ['?'])[0];
    const finalLine = (txt.match(/want final: .*$/m) || ['?'])[0];
    const offered = [...txt.matchAll(/\(offered=\[([^\]]*)\] thread=(\S+) want=(\S+) stage=(\d+)\)/g)];
    const wantOffered = offered.filter(m => /alive:want:|dlg:help/.test(m[1])).length;
    console.log(`  transcript d${day}: ${wantLine} | ${finalLine} | offeredTurns=${offered.length} wantOrHelpOfferedTurns=${wantOffered}`);
  }
}
