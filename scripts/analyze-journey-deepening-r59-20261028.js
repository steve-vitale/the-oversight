// analyze-journey-deepening-r59-20261028.js -- panel summary for the R59 run.
// Reads r59 seed JSONs + transcripts from the goal evidence dir (2026-10-28)
// and prints invite-decision counts, betrayal-menu outcomes, and the r55/r58
// panel aggregates for comparison. Reads only; writes nothing.
// Usage: node scripts/analyze-journey-deepening-r59-20261028.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-28');
const R58 = {
  42001: { days: 101, fights: 17, deaths: 29, alive: 10, vine: 5, made: 0 },
  42002: { days: 101, fights: 20, deaths: 36, alive: 2, vine: 12, made: 1 },
  42003: { days: 101, fights: 15, deaths: 21, alive: 8, vine: 5, made: 0 },
  42004: { days: 75, fights: 23, deaths: 34, alive: 0, vine: 8, made: 0 },
};
let totalInv = 0, totalAcc = 0;
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r59-seed${seed}.json`);
  if (!fs.existsSync(fp)) { console.log(`=== ${seed}: SEED JSON MISSING`); continue; }
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = (a.matflow || {}).intraday || {};
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  const made = (ca.made && ca.made.bark_armor) || 0;
  const inv = d.inviteDecisions || [];
  totalInv += inv.length; totalAcc += inv.filter(x => x.accept).length;
  const byKind = {};
  for (const x of inv) { const k = x.kind || '?'; byKind[k] = byKind[k] || { n: 0, acc: 0 }; byKind[k].n++; if (x.accept) byKind[k].acc++; }
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  vs r58: days=${d.maxGameDay} (r58: ${R58[seed].days}) fightsTotal=${d.fightsTotal} (r58: ${R58[seed].fights}) deaths=${(d.deaths || []).length} (r58: ${R58[seed].deaths}) alive=${alive} (r58: ${R58[seed].alive}) vineGainCalls=${mf.forageVineGainCalls} (r58: ${R58[seed].vine}) madeBark=${made} (r58: ${R58[seed].made})`);
  console.log(`  inviteDecisions: n=${inv.length} accept=${inv.filter(x => x.accept).length} byKind=${JSON.stringify(byKind)}`);
  for (const x of inv) console.log(`    invite d${x.day} kind=${x.kind} ${x.inviter} -> ${x.invitee} chance=${x.chance} accept=${x.accept} reasons=${JSON.stringify(x.reasons)}`);
  for (const day of [45, 60, 80]) {
    const tfp = path.join(EVIDIR, `journey-deepening-r59-transcript-${seed}-day${day}.txt`);
    if (!fs.existsSync(tfp)) { console.log(`  transcript d${day}: MISSING`); continue; }
    const txt = fs.readFileSync(tfp, 'utf8');
    const wantLine = (txt.match(/want: .*$/m) || ['?'])[0];
    const finalLine = (txt.match(/want final: .*$/m) || ['?'])[0];
    const offered = [...txt.matchAll(/\(offered=\[([^\]]*)\] thread=(\S+) want=(\S+) stage=(\d+)\)/g)];
    const betrayalTurns = offered.filter(m => /,betrayal:accept(,|$)/.test(',' + m[1] + ',')).length;
    const betrayalOnly = offered.filter(m => {
      const ids = m[1].split(',').filter(Boolean);
      return ids.includes('betrayal:accept') && ids.every(id => /^betrayal:|^leave$|^silence$/.test(id));
    }).length;
    const youBetrayal = (txt.match(/YOU: \[betrayal:/g) || []).length;
    const steers = (txt.match(/\(STEER58: gated\)/g) || []).length;
    console.log(`  transcript d${day}: ${wantLine} | ${finalLine} | offeredTurns=${offered.length} betrayalAcceptTurns=${betrayalTurns} betrayalOnlyTurns=${betrayalOnly} youBetrayalPicks=${youBetrayal} steers=${steers}`);
  }
}
console.log(`TOTAL inviteDecisions=${totalInv} accept=${totalAcc}`);
