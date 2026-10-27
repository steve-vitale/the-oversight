// analyze-journey-deepening-r56-20261027.js -- panel summary for the R56 panel
// vs the r55 panel (values read from the r55 run note + r55 seed JSONs, not
// copied from any analyzer's stale column). Reads the r56 seed JSONs +
// transcripts from the goal evidence dir; prints to stdout.
// Usage: node scripts/analyze-journey-deepening-r56-20261027.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-27');
// r55 panel (run note, verified against r55 seed JSONs at r55 closeout):
const R55 = {
  42001: { days: 101, fights: 17, deaths: 29, alive: 10, vine: 5, made: 0 },
  42002: { days: 101, fights: 20, deaths: 36, alive: 2, vine: 12, made: 1 },
  42003: { days: 101, fights: 15, deaths: 21, alive: 8, vine: 5, made: 0 },
  42004: { days: 75, fights: 23, deaths: 34, alive: 0, vine: 8, made: 0 },
};
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r56-seed${seed}.json`);
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = (a.matflow || {}).intraday || {};
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  const made = (ca.made && ca.made.bark_armor) || 0;
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  vs r55: days=${d.maxGameDay} (r55: ${R55[seed].days}) fightsTotal=${d.fightsTotal} (r55: ${R55[seed].fights}) deaths=${(d.deaths || []).length} (r55: ${R55[seed].deaths}) alive=${alive} (r55: ${R55[seed].alive}) vineGainCalls=${mf.forageVineGainCalls} (r55: ${R55[seed].vine}) madeBark=${made} (r55: ${R55[seed].made})`);
  console.log(`  crafts: fails=${JSON.stringify(ca.fails)} w3fights=${(d.w3fights || []).length} engagedW3=${(d.engaged || {}).w3}`);
  for (const day of [45, 60, 80]) {
    const tfp = path.join(EVIDIR, `journey-deepening-r56-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(tfp)) { console.log(`  transcript d${day}: MISSING`); continue; }
    const txt = fs.readFileSync(tfp, 'utf8');
    const wantLine = (txt.match(/want: .*$/m) || ['?'])[0];
    const finalLine = (txt.match(/want final: .*$/m) || ['?'])[0];
    const offered = [...txt.matchAll(/\(offered=\[([^\]]*)\] thread=(\S+) want=(\S+) stage=(\d+)\)/g)];
    const wantOffered = offered.filter(m => /alive:want:|dlg:help/.test(m[1])).length;
    const steers = (txt.match(/\(STEER: stage-0 want\)/g) || []).length;
    const subjectOffered = offered.some(m => /,dlg:subject(,|$)/.test(',' + m[1] + ','));
    console.log(`  transcript d${day}: ${wantLine} | ${finalLine} | offeredTurns=${offered.length} wantOrHelpOfferedTurns=${wantOffered} steers=${steers} subjectOffered=${subjectOffered}`);
  }
}
