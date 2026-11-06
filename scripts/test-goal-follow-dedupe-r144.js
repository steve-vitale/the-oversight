// test-goal-follow-dedupe-r144.js — proof for the r144 goalFollow fix.
// r141's M4 read found two defects in src/data/characterGen.json convo.goalFollow:
//  (1) goalFollow.lead holds two different lines saying the same beat two turns
//      apart ("Someone asked me what we should do yesterday. I had an answer..."
//      / "Someone asked me yesterday what the plan was. I had one...") — the
//      text-based repeat ledger (CONVERSATIONS.md "No repeats, ever") cannot
//      catch different strings carrying one beat.
//  (2) goalFollow.remember lists "Tell me something you remember about before.
//      Anything. I collect them." TWICE, verbatim.
// Data-only checks (no game load): fail pre-fix, pass post-fix.
// Usage: node scripts/test-goal-follow-dedupe-r144.js
'use strict';
const fs = require('fs'), path = require('path');
const cg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'));
const gf = (cg.convo || {}).goalFollow;
if (!gf) { console.error('FAIL: no convo.goalFollow in characterGen.json'); process.exit(1); }
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
let failures = 0;
// (1) No exact-duplicate line inside any goalFollow pool.
for (const [pool, lines] of Object.entries(gf)) {
  const seen = new Map();
  let poolDupes = 0;
  for (const l of lines) {
    const k = norm(l);
    if (seen.has(k)) { console.error(`FAIL exact-duplicate in goalFollow.${pool}: ${l}`); failures++; poolDupes++; }
    else seen.set(k, l);
  }
  console.log(`pool ${pool}: ${lines.length} lines, exact-dupes ${poolDupes}`);
}
// (2) The lead pool holds no two lines opening with "someone asked me"
// (the r141 beat-repeat pair, normalized first-3-words).
const lead = gf.lead || [];
const openers = {};
for (const l of lead) {
  const k = norm(l).split(' ').slice(0, 3).join(' ');
  if (k === 'someone asked me') {
    if (openers[k]) { console.error(`FAIL lead beat-repeat: ${openers[k]} || ${l}`); failures++; }
    else openers[k] = l;
  }
}
if (failures) { console.error(`RESULT: FAIL (${failures} defect(s) present)`); process.exit(1); }
console.log('RESULT: PASS — no exact-duplicate goalFollow lines; no lead "someone asked me" pair');
