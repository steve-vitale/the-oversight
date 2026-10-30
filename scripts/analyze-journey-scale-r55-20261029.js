// scripts/analyze-journey-scale-r55-20261029.js — journey-scale r54 analyzer.
// Deterministic read of evidence files only (no engine load, no RNG):
//  - per-talk classification table from r54 transcripts (want, open thread,
//    stage at open, stage at pre-close, pre-talk seed, alive:want menu items)
//  - quad census table from r54 trust JSONs.
// Usage: node scripts/analyze-journey-scale-r55-20261029.js [evidir]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = process.argv[2] || path.join(ROOT, 'evidence', '2026-10-29', 'journey-scale-r55');

const files = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r55-transcript-.*-day\d+\.txt$/.test(f)).sort();
console.log('=== R55 TALK CLASSIFICATION ===');
console.log('seed day npc want stageOpen openThread fromSeed preTalkSeed stageClose aliveWantItems');
for (const f of files) {
  const txt = fs.readFileSync(path.join(EVIDIR, f), 'utf8');
  const m = /^journey-scale-r55-transcript-(\d+)-day(\d+)\.txt$/.exec(f);
  const head = /^=== seed \d+ day \d+ — conversation with (.+?) \((.+?)\) ===/m.exec(txt) || [];
  const want = /^want: (\S+) \(stage (\d+)\)/m.exec(txt) || [];
  const thread = /^open thread: (\S+) fromSeed=(\S+)/m.exec(txt) || [];
  const seed = /^\(pre-talk seed: (.+?); takenWantDay=(\d+); convoCount=(\d+)\)/m.exec(txt) || [];
  const preclose = /^pre-close: want (\S+) stage (\d+) thread (\S+)/m.exec(txt) || [];
  const aliveWant = [...new Set([...txt.matchAll(/alive:want:([a-z_]+)/g)].map(x => x[1]))];
  const openLine = (txt.split('\n').find(l => l.startsWith('THEM:')) || '').slice(0, 100);
  console.log(`${m[1]} d${m[2]} ${head[1] || '?'} want=${want[1] || '?'} stageOpen=${want[2] || '?'} thread=${thread[1] || '?'} fromSeed=${thread[2] || '?'} preSeed=${seed[1] || '?'} stageClose=${preclose[2] || '?'} aliveWant=[${aliveWant.join(',') || '-'}]`);
  console.log(`    open: ${openLine}`);
}

console.log('\n=== R55 QUAD CENSUS ===');
console.log('seed day over pop pantry rank nationalDay globalDay firstCourt seat arc deaths covTrusts maxWave pilgrimages fusion abilities');
const jfiles = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r55-trust-\d+\.json$/.test(f)).sort();
for (const f of jfiles) {
  const j = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8'));
  const c = j.census || {};
  const cov = (c.covLinks || []).map(l => l.trust).join('/');
  const deaths = (c.deathLog || []).length;
  console.log(`${c.seed} d${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} rank=${c.scaleRank} nat=${c.nationalDay} glob=${c.globalDay} court=${c.firstCourtDay} seat=${c.tableSeat} arc=${c.arcNow} deaths=${deaths} cov=${cov} maxWave=${c.maxWave} pilg=${c.pilgrimages} fusion=${c.fusionInstalled} abilities=[${(c.abilitiesHeld||[]).join(',')}]`);
}
