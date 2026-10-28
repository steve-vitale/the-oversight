// analyze-journey-deepening-r60-20261028.js -- panel summary for the R60 run.
// Reads r60 seed JSONs + transcripts from the goal evidence dir (2026-10-28)
// and prints, per seed: survival/wave/fights/deaths, invite-decision counts
// with distinct pairs, betrayal-plot formation (ever-seen ids + checkpoint
// snapshots), pantry monster-meat snapshots + test-call counts, and the
// r59-style transcript betrayal-only stats. R60 IS the new baseline: no
// pass/fail is scored here against r55-r59 aggregates; values are printed
// for the run note to adopt as the baseline.
// Usage: node scripts/analyze-journey-deepening-r60-20261028.js
// Reads only; writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-28');
let totalInv = 0, totalAcc = 0, totalPlots = 0, totalTests = 0, totalFormations = 0;
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r60-seed${seed}.json`);
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
  const pairs = new Set();
  for (const x of inv) {
    const k = x.kind || '?';
    byKind[k] = byKind[k] || { n: 0, acc: 0 };
    byKind[k].n++; if (x.accept) byKind[k].acc++;
    pairs.add(`${x.inviter}->${x.invitee}`);
  }
  const plotsEver = d.plotIdsEver || [];
  totalPlots += plotsEver.length;
  const tests = d.meatTestCalls || [];
  totalTests += tests.length;
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  fightsTotal=${d.fightsTotal} deaths=${(d.deaths || []).length} vineGainCalls=${mf.forageVineGainCalls} madeBark=${made}`);
  console.log(`  inviteDecisions: n=${inv.length} accept=${inv.filter(x => x.accept).length} pairs=${pairs.size} byKind=${JSON.stringify(byKind)}`);
  for (const x of inv) console.log(`    invite d${x.day} kind=${x.kind} ${x.inviter} -> ${x.invitee} chance=${x.chance} accept=${x.accept} reasons=${JSON.stringify(x.reasons)}`);
  console.log(`  plotsEver: n=${plotsEver.length} ${plotsEver.map(p => `${p.id}(d${p.day} ${p.inviter}->${p.target})`).join(' ')}`);
  const formations = d.plotFormations || [];
  totalFormations += formations.length;
  console.log(`  plotFormations: n=${formations.length} ${formations.map(f => `${f.id}(d${f.day} ${f.leader}->${f.target})`).join(' ')}`);
  for (const s of (d.plotSnaps || [])) console.log(`    plotSnap d${s.day}: total=${s.total} active=${s.active} sprung=${s.sprung} resolved=${s.resolved}`);
  console.log(`  meatTestCalls: n=${tests.length} ${tests.map(t => `d${t.day}`).join(' ')}`);
  const meatSnaps = d.meatPantrySnaps || [];
  const meatDays = [...new Set(meatSnaps.filter(s => (s.units || 0) > 0).map(s => s.day))];
  const maxMeatUnits = meatSnaps.reduce((m, s) => Math.max(m, s.units || 0), 0);
  console.log(`  meatPantry: snaps=${meatSnaps.length} daysWithMeat=${meatDays.length} [${meatDays.join(',')}] maxUnits=${maxMeatUnits}`);
  for (const s of meatSnaps.filter(s => (s.units || 0) > 0)) {
    const states = {};
    for (const r of (s.rows || [])) { const k = r.foodState || '?'; states[k] = (states[k] || 0) + (r.units || 0); }
    console.log(`    meatPantry d${s.day}(${s.phase}): rows=${s.n} units=${s.units} cookedUnits=${s.cookedUnits} states=${JSON.stringify(states)} ids=${(s.rows || []).map(r => r.id || r.plantId).join(',')}`);
  }
  for (const day of [45, 60, 80]) {
    const tfp = path.join(EVIDIR, `journey-deepening-r60-transcript-${seed}-day${day}.txt`);
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
console.log(`TOTAL inviteDecisions=${totalInv} accept=${totalAcc} plotsEver=${totalPlots} plotFormations=${totalFormations} meatTestCalls=${totalTests}`);
