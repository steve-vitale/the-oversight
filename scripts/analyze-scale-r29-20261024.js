// scripts/analyze-scale-r29-20261024.js — journey-scale r29 analyzer.
// Reads the r29 covenant census JSONs and prints the pre-registered verdict
// table (C1 pool fills, C2 draw-when-armed, L1 national, L5 voiced endings)
// plus the mechanism evidence (poolWatch max, govWatch class counts, links).
// Usage: node scripts/analyze-scale-r29-20261024.js [EVIDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-24', 'journey-scale-r29-covenant');
const files = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r29-covenant-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('no census JSONs in ' + EVIDIR); process.exit(1); }
const rows = [];
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8')).census;
  const gw = c.govWatch || [];
  const cnt = (cls) => gw.filter(g => g.cls === cls).length;
  const covN = (c.links || []).filter(l => l.kind === 'covenant').length;
  const scatterVoiced = (() => {
    try {
      const cap = fs.readFileSync(path.join(EVIDIR, f.replace(/covenant-(\d+)\.json$/, 'capture-$1.txt')), 'utf8');
      return /couldn't hold/.test(cap);
    } catch (e) { return null; }
  })();
  rows.push({ seed: c.seed, day: c.day, over: c.over, pop: c.popAlive + '/' + c.popTotal,
    rank: c.scaleRank, nat: c.nationalDay, covN, poolEnd: c.leaguePoolKcal,
    poolMax: c.poolEverMax, granDraw: cnt('granaryDraw'), tribArr: cnt('tribArrive'),
    tribShort: cnt('tribShort'), courtPost: null, scatterVoiced });
  console.log(`seed ${c.seed}: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} rank=${c.scaleRank} nat=${c.nationalDay} covLinks=${covN} poolEnd=${c.leaguePoolKcal} poolMax=${c.poolEverMax} granDraw=${cnt('granaryDraw')} tribArr=${cnt('tribArrive')} tribShort=${cnt('tribShort')} scatterVoiced=${scatterVoiced}`);
}
const withCov = rows.filter(r => r.covN >= 1);
console.log(`\nC1: seeds with >=1 covenant link: ${withCov.length}/4 (bar: >=3 to judge pool-fill; pool>0 on ${withCov.filter(r => r.poolMax > 0).length} of them)`);
console.log(`C2: granaryDraw lines total: ${rows.reduce((a, r) => a + r.granDraw, 0)} (armed-day check needs bare-day evidence — see run note)`);
console.log(`L1: national <=d140: ${rows.filter(r => r.nat && r.nat <= 140).length}/4`);
console.log(`L5: scattered seeds with voiced ending: ${rows.filter(r => r.over && r.scatterVoiced).length}/${rows.filter(r => r.over).length} over-seeds`);
