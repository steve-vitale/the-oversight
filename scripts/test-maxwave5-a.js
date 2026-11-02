'use strict';
// Corpus validator for sim-maxwave5-a: reproduces the verdict from the
// corpus JSON alone (no sim re-run). Exit 0 = corpus complete and
// verdict reproduced; exit 1 = corpus problem.
// Usage: node scripts/test-maxwave5-a.js [corpus-dir]
const fs = require('fs');
const path = require('path');
const { classifyReplay } = require('./maxwave5-classify-20261102');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-02', 'perseed-maxwave5-a');
const files = fs.readdirSync(dir).filter(f => /^replay-s\d+\.json$/.test(f));
if (!files.length) { console.error('test-maxwave5-a: no replay-s*.json in ' + dir); process.exit(1); }
let fails = 0;
for (const f of files) {
  const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const r = doc.maxwave5 || doc;
  if (!r || typeof r.seed !== 'number') { console.error(f + ': missing seed row'); fails++; continue; }
  const c = classifyReplay(r);
  const stored = (r.classification || {}).verdict;
  if (c.verdict !== stored) { console.error(f + ': verdict mismatch stored=' + stored + ' recomputed=' + c.verdict); fails++; }
  if (c.unclassifiedCount !== 0) { console.error(f + ': unclassified events present'); fails++; }
  // every wave-5 spawn in the corpus must carry a class in the recomputation
  if (c.spawnClasses.length !== (r.spawns || []).filter(s => (s.wave | 0) === 5).length) {
    console.error(f + ': spawn class count mismatch'); fails++;
  }
  if (!Array.isArray(r.dailyTrace) || !r.dailyTrace.length) { console.error(f + ': dailyTrace empty'); fails++; }
  if (!Array.isArray(r.spawns)) { console.error(f + ': spawns missing'); fails++; }
  if (!r.deedFacedByWave || !r.waveKillLogByWave) { console.error(f + ': deed/killlog end-state missing'); fails++; }
  console.log(f + ': seed=' + r.seed + ' maxWave=' + r.maxWave + ' verdict=' + c.verdict +
    ' unlockDay=' + c.firstUnlockDay + ' spawns5=' + c.spawnClasses.length +
    ' playerFights5=' + c.playerFights5.length + ' villagerFights5=' + c.villagerFights5.length +
    ' deed5=' + c.deedFaced5.length + ' kills5=' + c.kills5.length);
}
if (fails) { console.error('test-maxwave5-a: ' + fails + ' failure(s)'); process.exit(1); }
console.log('test-maxwave5-a: corpus validator green on ' + files.length + ' replay file(s)');
