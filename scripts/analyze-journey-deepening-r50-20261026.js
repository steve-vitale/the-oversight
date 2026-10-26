// analyze-journey-deepening-r50-20261026.js -- panel summary for the R50
// corpse+intraday holder-trace run: P1 succession reconciliation (predecessor
// armor located same-day in corpse / dead-roster / successor / pack), P2
// determinism vs the r49 panel, M5 winnable, stay-green, faucet watch.
// Reads the r50 seed JSONs from the goal evidence dir; prints to stdout.
// Usage: node scripts/analyze-journey-deepening-r50-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-26');
const R49 = {
  42001: { vineGains: 1, maxVine: 1, made: 0, failsBark: 0 },
  42002: { vineGains: 3, maxVine: 2, made: 0, failsBark: 1 },
  42003: { vineGains: 5, maxVine: 3, made: 2, failsBark: 0 },
  42004: { vineGains: 13, maxVine: 4, made: 0, failsBark: 0 },
};
function totalArmor(map) {
  if (!map) return 0;
  let t = map.scholarPack.bark + map.scholarPack.hide + map.pantry.bark + map.pantry.hide + map.stash.bark + map.stash.hide;
  for (const v of (map.villagers || [])) t += v.pack.bark + v.pack.hide;
  for (const c of (map.corpses || [])) t += (c.pack.bark + c.pack.hide);
  for (const v of (map.deadVillagers || [])) t += v.pack.bark + v.pack.hide;
  return t;
}
function wearers(map) {
  const out = [];
  if (!map) return out;
  if (map.scholarTorso === 'bark_armor' || map.scholarTorso === 'hide_armor') out.push('scholar:' + map.scholarTorso);
  for (const v of (map.villagers || [])) {
    if (v.torso === 'bark_armor' || v.torso === 'hide_armor') out.push(v.name + ':' + v.torso);
  }
  return out;
}
function corpseStr(map) {
  if (!map) return '[]';
  const carrying = (map.corpses || []).filter(c => c.pack.bark || c.pack.hide);
  if (!carrying.length) return 'none-carrying';
  return carrying.map(c => `${c.name || c.vid}(d${c.dayDied},bark=${c.pack.bark},hide=${c.pack.hide}${c.buried ? ',buried' : ''})`).join('; ');
}
for (const seed of [42001, 42002, 42003, 42004]) {
  const fp = path.join(EVIDIR, `journey-deepening-r50-seed${seed}.json`);
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const a = d.armor || {};
  const ca = a.craftArmor || {};
  const mf = a.matflow || {};
  const intra = mf.intraday || {};
  const mh = ca.matHist || {};
  const diag = ca.diag || [];
  const sufDiag = diag.filter(e => (e.rid === 'bark_armor' && e.bark >= 3 && e.vine >= 2) || (e.rid === 'hide_armor' && e.hide >= 2 && e.vine >= 1));
  const alive = (d.census || []).filter(c => c.alive).length;
  const total = (d.census || []).length;
  const mis = ((d.deathHonesty || {}).mislabels || []).length;
  const holder = a.holder || {};
  console.log(`=== ${seed} day=${d.maxGameDay} end=${d.endReason} wave=${d.finalWave} alive=${alive}/${total} mislabels=${mis}`);
  console.log(`  P2 determinism vs r49: vineGainCalls=${intra.forageVineGainCalls} (r49: ${R49[seed].vineGains}) maxVine=${mf.maxVine} (r49: ${R49[seed].maxVine}) made=${JSON.stringify(ca.made)} (r49 made ${R49[seed].made}) fails=${JSON.stringify(ca.fails)} fightsTotal=${d.fightsTotal} deaths=${(d.deaths || []).length}`);
  console.log(`  P2 crafts: matHist=${JSON.stringify(mh)} diagN=${diag.length} sufDiagN=${sufDiag.length}`);
  for (const e of sufDiag) console.log(`    SUF: d${e.day} ${e.rid} bark=${e.bark} vine=${e.vine} hide=${e.hide} lvl=${e.level} -> ${e.result}`);
  console.log(`  P1 holder: makes=${(holder.makes || []).length} deltas=${(holder.deltas || []).length} intraday=${(holder.intraday || []).length} scholarChanges=${(holder.scholarChanges || []).length}`);
  for (const mk of (holder.makes || [])) {
    const beforeTot = totalArmor(mk.before), afterTot = totalArmor(mk.after);
    console.log(`    MAKE d${mk.day} ${mk.rid} L${mk.level} maker=${mk.makerName} scholarPack ${mk.before.scholarPack.bark}/${mk.before.scholarPack.hide} -> ${mk.after.scholarPack.bark}/${mk.after.scholarPack.hide} totalArmor ${beforeTot} -> ${afterTot} wearersAfter=[${wearers(mk.after).join(', ')}] corpsesAfter=[${corpseStr(mk.after)}]`);
  }
  for (const sc of (holder.scholarChanges || [])) {
    console.log(`    SCHOLAR d${sc.day}: ${sc.fromName} -> ${sc.toName}`);
    for (const idl of (holder.intraday || []).filter(x => x.day === sc.day)) {
      console.log(`      INTRA d${idl.day} ${idl.fromPhase}->${idl.toPhase} scholar=${idl.scholarVid} changed=[${idl.changed.join(', ')}]`);
    }
    const eod = (holder.deltas || []).filter(x => x.day === sc.day);
    for (const dl of eod) console.log(`      EOD d${dl.day} scholar=${dl.scholarName} changed=[${dl.changed.join(', ')}] scholarPack=${dl.map.scholarPack.bark}/${dl.map.scholarPack.hide} scholarTorso=${dl.map.scholarTorso} pantry=${dl.map.pantry.bark}/${dl.map.pantry.hide} wearers=[${wearers(dl.map).join(', ')}] corpses=[${corpseStr(dl.map)}]`);
    if (!eod.length) console.log(`      (no EOD delta on succession day — armor counts unchanged at day resolution)`);
  }
  for (const dl of (holder.deltas || [])) {
    if (!(dl.changed || []).some(c => c.startsWith('corpse') || c.startsWith('deadVillager'))) continue;
    console.log(`    CORPSE-DELTA d${dl.day} scholar=${dl.scholarName} changed=[${dl.changed.join(', ')}] corpses=[${corpseStr(dl.map)}]`);
  }
  for (const idl of (holder.intraday || [])) {
    if (!(idl.changed || []).some(c => c.startsWith('corpse') || c.startsWith('deadVillager'))) continue;
    console.log(`    CORPSE-INTRA d${idl.day} ${idl.fromPhase}->${idl.toPhase} changed=[${idl.changed.join(', ')}]`);
  }
  console.log(`  w3fights=${(d.w3fights || []).length} engagedW3=${(d.engaged || {}).w3} popEnd=${alive}`);
}
