'use strict';
// compare-havenneedgossip-20261016.js — judge the paired sweep.
// Reads evidence/2026-10-16/perseed-havenneedgossip/{control,fixed}/*.json.
//
// PRIMARY GO (binding, per the pre-registered header): the truncated
// single-letter LISTENER pattern — sum over fixed == 0 AND sum over
// control >= 1, on identical seeds.
// Also reported (defect class, same line of code): the SPEAKER-side
// truncation "🗣️ A to <name>" — the finding's code had the identical bug
// in the speaker slot; the fix covers both.
// Guardrails: det-gate — every (policy, seed) pair's stateHash identical
//   across arms (display-only fix moves nothing); no beats lost — paired
//   gossip-beat counts equal.
// Exit 0 = GO, 1 = NO-GO (or missing data).

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-havenneedgossip');
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [238, 248, 258, 268, 278, 298, 308, 318];

function load(arm, policy, seed) {
  const p = path.join(DIR, arm, `${policy}-s${seed}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const failures = [];
let tLControl = 0, tLFixed = 0, tSControl = 0, tSFixed = 0;
let bControl = 0, bFixed = 0, detOK = 0, detTotal = 0;

for (const policy of POLICIES) {
  for (const seed of SEEDS) {
    const c = load('control', policy, seed);
    const f = load('fixed', policy, seed);
    if (!c || !f) { failures.push(`missing pair data: ${policy} s${seed}`); continue; }
    tLControl += c.truncatedListener || 0; tLFixed += f.truncatedListener || 0;
    tSControl += c.truncatedSpeaker || 0;   tSFixed += f.truncatedSpeaker || 0;
    bControl += c.gossipBeats; bFixed += f.gossipBeats;
    detTotal++;
    if (c.stateHash === f.stateHash) detOK++;
    else failures.push(`det-gate MISS: ${policy} s${seed} control=${c.stateHash} fixed=${f.stateHash}`);
    if (f.gossipBeats !== c.gossipBeats) {
      failures.push(`beat-count drift: ${policy} s${seed} control=${c.gossipBeats} fixed=${f.gossipBeats}`);
    }
    if ((c.bareAFirstNames || 0) > 0 || (f.bareAFirstNames || 0) > 0) {
      failures.push(`bare-"A" first name on roster would false-positive: ${policy} s${seed}`);
    }
  }
}

console.log('=== havenneedgossip sweep verdict ===');
console.log(`PRIMARY (listener "to A,"): control ${tLControl} vs fixed ${tLFixed} (16 paired runs)`);
console.log(`defect-class (speaker "A to"): control ${tSControl} vs fixed ${tSFixed}`);
console.log(`gossip beats total: control ${bControl} vs fixed ${bFixed}`);
console.log(`det-gate (state hash identical per pair): ${detOK}/${detTotal}`);
const go = tLFixed === 0 && tLControl >= 1 && failures.length === 0;
console.log(go ? 'VERDICT: GO' : 'VERDICT: NO-GO');
for (const f of failures) console.log('  MISS:', f);
// Print every truncated control beat for the evidence file.
for (const policy of POLICIES) {
  for (const seed of SEEDS) {
    const c = load('control', policy, seed);
    if (!c) continue;
    for (const b of (c.allBeats || [])) {
      if (/ to A, by the fire/.test(b) || /🗣️ A to /.test(b)) console.log(`  TRUNC control ${policy} s${seed}: ${b.slice(0, 160)}`);
    }
  }
}
process.exit(go ? 0 : 1);
