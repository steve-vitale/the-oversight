#!/usr/bin/env node
// analyze-crisis-r38-20261021.js — M3a/M3b/M4/M5 analysis for journey-crisis r38.
// Usage: node scripts/analyze-crisis-r38-20261021.js /tmp/r38/seed101.json [...]
'use strict';
const fs = require('fs');

const GRIEF_RE = /💀|mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|didn't come back/i;

function firstName(n) { return String(n || 'Someone').split(' ')[0].toLowerCase(); }

for (const f of process.argv.slice(2)) {
  const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`\n######## SEED ${r.seed} ########`);
  const personDeaths = r.deaths.filter(d => d.person && d.day >= 20);
  console.log(`personDeaths(d20+): ${personDeaths.length}`);
  for (const d of personDeaths) console.log(`  d${d.day} ${d.name} (${d.cause}) present=${d.present}`);

  // stable-tail: no other person death in (d, d+2]
  const days = personDeaths.map(d => d.day);
  const stable = [], compound = [];
  for (const d of personDeaths) {
    (days.some(x => x > d.day && x <= d.day + 2) ? compound : stable).push(d);
  }
  console.log(`stable-tail: ${stable.length}, compound: ${compound.length}`);

  const sig = (d) => {
    const fn = firstName(d.name);
    const sayHit = (r.sayLog || []).filter(s => s.day >= d.day && s.day <= d.day + 7 && GRIEF_RE.test(s.line));
    const named = sayHit.filter(s => s.line.toLowerCase().includes(fn));
    const lately = (r.latelyConvos || []).find(c => c.deathDay === d.day && c.forVid === d.vid);
    return { sayHit: sayHit.length, named: named.length, latelyMourn: lately ? lately.surfacedMourning : 'n/a', signal: sayHit.length > 0 || (lately && lately.surfacedMourning) };
  };
  let m3aHit = 0;
  console.log('--- stable-tail coverage ---');
  for (const d of stable) {
    const s = sig(d);
    if (s.signal) m3aHit++;
    console.log(`  d${d.day} ${firstName(d.name)}: sayGrief=${s.sayHit} (named=${s.named}) latelyMourn=${s.latelyMourn} => ${s.signal ? 'SIGNAL' : 'SILENT'}`);
  }
  console.log(`M3a: ${m3aHit}/${stable.length}`);
  console.log('--- compound coverage (unbound) ---');
  let m3bHit = 0;
  for (const d of compound) {
    const s = sig(d);
    if (s.signal) m3bHit++;
    console.log(`  d${d.day} ${firstName(d.name)}: sayGrief=${s.sayHit} (named=${s.named}) latelyMourn=${s.latelyMourn} => ${s.signal ? 'SIGNAL' : 'SILENT'}`);
  }
  console.log(`M3b: ${m3bHit}/${compound.length}`);

  // M4 episodes
  console.log('--- lingering episodes ---');
  for (const e of (r.episodes || [])) {
    console.log(`  start d${e.startDay} (n=${e.startLingering}, max=${e.maxLingering}) -> d${e.endDay} (${e.days}d) via ${e.resolution}; gorge=${Math.round(e.gorge)} kcal`);
  }
  const gorgeLines = (r.sayLog || []).filter(s => /gorges at the treeline/.test(s.line));
  const gorgeRecs = r.gorges || [];
  const zeroGorgeClaims = gorgeLines.filter(s => !/ 0 kcal/.test(s.line) && gorgeRecs.some(g => g.day === s.day && g.got === 0));
  console.log(`gorge say-lines: ${gorgeLines.length}, pillage records: ${gorgeRecs.length}, claims-with-zero-pillage: ${zeroGorgeClaims.length}`);

  // M2
  const defended = r.raids.filter(x => (r.raidFights || []).some(f => f.day === x.day)).length;
  console.log(`M1 raids=${r.raids.length} (>=3: ${r.raids.length >= 3 ? 'GO' : 'NO-GO'}); M2 defended ${defended}/${r.raids.length}`);
  console.log(`telemetry: defenderFights=${r.defenderFights} playerFights=${r.playerFights} defendedCount=${r.defendedCount} latelyDefenseCount=${r.latelyDefenseCount}`);
  console.log(`unburied person corpses: ${(r.unburiedPersonCorpses || []).length}`);
}
