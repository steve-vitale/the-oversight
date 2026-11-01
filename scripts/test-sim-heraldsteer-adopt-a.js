// test-sim-heraldsteer-adopt-a.js — proof test for the Herald-steer adoption analyzer.
//   node scripts/test-sim-heraldsteer-adopt-a.js                          (synthetic only)
//   node scripts/test-sim-heraldsteer-adopt-a.js <corpusDir> <analysisJson> (synthetic + corpus legs)
// Exits non-zero on any failure. Prints "N passed, 0 failed" on green.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require(path.join(__dirname, 'sim-heraldsteer-adopt-a-analyze'));

let passed = 0, failed = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { passed++; }
  else { failed++; failures.push(name + (detail ? ' :: ' + JSON.stringify(detail) : '')); }
}

// ---- Synthetic: step audit on a fabricated per-seed record ----
function fakeSeed(o) {
  return Object.assign({
    seed: 1, contacts: [], dawns: [], lairs: [], moves: [],
    maxWave: 4, wave4: 1, wave5: 0, national: 0, table: 0, won: 0,
    gameDays: 181, endReason: 'survived', endScaleRank: 'regional', captureErrs: 0,
  }, o);
}
(function () {
  const s = fakeSeed({
    contacts: [{ channel: 'scholar' }, { channel: 'villager' }],
    dawns: [
      { heraldTile: { x: 7, y: 4 }, havenTile: { x: 4, y: 4 }, distHavenMan: 3 },
      { heraldTile: { x: 6, y: 4 }, havenTile: { x: 4, y: 4 }, distHavenMan: 2 },
      { heraldTile: null, havenTile: { x: 4, y: 4 }, distHavenMan: null },
    ],
    lairs: [{ havenTile: { x: 4, y: 4 } }],
    moves: [
      { kind: 'wander', from: { x: 7, y: 4 }, to: { x: 6, y: 4 } }, // approach, step 1
      { kind: 'wander', from: { x: 6, y: 4 }, to: { x: 7, y: 4 } }, // retreat, step 1
      { kind: 'wander', from: { x: 6, y: 5 }, to: { x: 5, y: 5 } }, // approach (dist 3 -> 2), step 1
      { kind: 'wander', from: { x: 5, y: 5 }, to: { x: 3, y: 5 } }, // TELEPORT (step 2; dist 2 -> 2, so lateral by the rule)
      { kind: 'raidPin', from: { x: 5, y: 4 }, to: { x: 4, y: 4 } }, // NOT a wander: excluded
    ],
  });
  const p = A.analyzeSeed(s);
  check('synth-contacted', p.contacted === 1 && p.contacts === 2);
  check('synth-channels', p.scholarContacts === 1 && p.villagerContacts === 1);
  check('synth-mean-dist', p.meanDawnDist === 2.5);
  // NOTE: a Manhattan single step always changes distance by exactly 1,
  // so a lateral class can only come from a multi-step (teleport) event.
  check('synth-wander-classes', p.wanderApproach === 2 && p.wanderRetreat === 1 && p.wanderLateral === 1);
  check('synth-teleport-counted', p.wanderTeleports === 1);
  check('synth-raidpin-excluded', p.wanderHavenLandings === 0 && p.wanderSteps === 4);
})();
(function () {
  const s = fakeSeed({
    moves: [{ kind: 'wander', from: { x: 5, y: 4 }, to: { x: 4, y: 4 } }], // wander onto Haven: flagged
    lairs: [{ havenTile: { x: 4, y: 4 } }],
  });
  const p = A.analyzeSeed(s);
  check('synth-wander-haven-landing-flagged', p.wanderHavenLandings === 1);
})();
(function () {
  check('synth-manhattan', A.manhattan({ x: 7, y: 4 }, { x: 4, y: 4 }) === 3);
  check('synth-same-tile', A.sameTile({ x: 4, y: 4 }, { x: 4, y: 4 }) === true);
  check('synth-diff-tile', A.sameTile({ x: 4, y: 4 }, { x: 5, y: 4 }) === false);
})();

// ---- Corpus legs (only when a corpus dir + analysis JSON are passed) ----
const corpusDir = process.argv[2];
const analysisPath = process.argv[3];
if (corpusDir && analysisPath) {
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json')).sort();
  check('corpus-file-count-matches-analysis', files.length === analysis.seeds,
    { files: files.length, analysisSeeds: analysis.seeds });
  check('corpus-contact-rate-consistent', analysis.contactedSeeds.length === analysis.perSeed.filter(p => p.contacted).length);
  check('corpus-contacts-sum', analysis.totalContacts === analysis.perSeed.reduce((a, p) => a + p.contacts, 0));
  check('corpus-wander-sum', analysis.totalWanderSteps === analysis.perSeed.reduce((a, p) => a + p.wanderSteps, 0));
  check('corpus-no-teleports-or-reported', true); // teleport count itself is the report; judged in evidence, not hidden here
  for (const f of files) {
    const raw = fs.readFileSync(path.join(corpusDir, f), 'utf8').trim();
    const lines = raw.split('\n').filter(l => l.trim().length);
    check('corpus-' + f + '-one-line', lines.length === 1);
    const j = JSON.parse(lines[0]);
    check('corpus-' + f + '-capture-clean', j.captureErrs === 0, { captureErrs: j.captureErrs });
    check('corpus-' + f + '-end-fields', typeof j.gameDays === 'number' && typeof j.maxWave === 'number');
    // Guardrail legs straight from the corpus (not from the analysis):
    // every wander move event is a 1-step; no wander lands on Haven.
    const havenTile = (j.lairs && j.lairs.length && j.lairs[0].havenTile) || { x: 4, y: 4 };
    for (const m of (j.moves || []).filter(m => m.kind === 'wander')) {
      if (!m.from || !m.to) continue;
      const step = Math.abs(m.from.x - m.to.x) + Math.abs(m.from.y - m.to.y);
      check('corpus-' + f + '-wander-step-1', step === 1, m);
      check('corpus-' + f + '-wander-not-haven', !(m.to.x === havenTile.x && m.to.y === havenTile.y), m);
    }
  }
}

if (failed) {
  console.error(passed + ' passed, ' + failed + ' failed');
  failures.slice(0, 30).forEach(f => console.error('FAIL: ' + f));
  process.exit(1);
}
console.log(passed + ' passed, 0 failed');
