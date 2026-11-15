#!/usr/bin/env node
// scripts/test-journey-crisis-r216-analyzer-dup-20261115.js — journey-crisis
// r216 proof: the analyzer's R154 drift-duplicate census must key by SEED
// as well as (id, episode, day, label). Panel finding: seed 14461 and
// seed 14464 both drifted an ad_break on day 45, episode 1, label
// player-drawn-off — two legitimate records on two seeds — and the
// analyzer's panel-wide `seen` map (key without seed) flagged the second
// as a duplicate ("drift duplicates in panel JSONs=1"), while every
// driver's driftDupesSkipped stayed 0. The driver is innocent; the
// analyzer's key is missing the seed.
//
// Cases (each runs the real analyzer on synthetic minimal JSONs in a
// temp dir, and greps its stdout):
//   cross-seed   seeds 1+2, one identical drift each -> duplicates=0
//                (RED on the unfixed analyzer: 1).
//   same-seed    seed 3, two identical drifts in one JSON -> duplicates=1
//                (control: a TRUE duplicate is still caught; must pass
//                before and after the fix).
// Usage: node scripts/test-journey-crisis-r216-analyzer-dup-20261115.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const repo = path.join(__dirname, '..');

function minimal(seed, drifts) {
  return {
    seed, days: 100, endReason: 'game-over', raids: [], gorgeNights: [],
    sorties: [], convosDriven: [], fabricHits: [], drifts,
    lingerBook: [], sayLines: [], aidResolutions: [], lingerTickParts: [],
    deaths: [], pantryDaily: [],
    supply: { ruinSearches: 0, forageByTile: {}, scavengeItems: [], medAcquisitions: [], pharmacyDeposits: [] },
    census: {}, stranger: {}, phoenixBurns: [], clearedGorgeAfter: [],
    driftDupesSkipped: 0,
  };
}
function drift(day) {
  return { day, id: 'ad_break', name: 'Ad Break', firstSeenDay: day, firstSeenEver: day,
    episode: 1, lastSeenDay: day, nightsWaited: 0, nightsWaitedOld: 0,
    sortiesBefore: 0, clearedBySortieDay: null, label: 'player-drawn-off', evidence: 'test' };
}
function runAnalyzer(dir) {
  const o = execFileSync('node', [path.join(repo, 'scripts', 'analyze-crisis-r216-delayed-20261115.js'), dir],
    { cwd: repo, encoding: 'utf8', timeout: 60000 });
  const m = /drift duplicates in panel JSONs=(\d+)/.exec(o);
  return m ? Number(m[1]) : null;
}
function runCase(kase) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r216-dup-' + kase + '-'));
  let files;
  if (kase === 'cross-seed') {
    files = [[1, [drift(45)]], [2, [drift(45)]]];
  } else if (kase === 'same-seed') {
    files = [[3, [drift(45), drift(45)]]];
  } else {
    console.log(JSON.stringify({ case: kase, pass: false, err: 'unknown case' }));
    process.exit(2);
  }
  for (const [s, drs] of files) {
    fs.writeFileSync(path.join(dir, 'journey-crisis-r216-delayed-seed' + s + '.json'),
      JSON.stringify(minimal(s, drs)), 'utf8');
  }
  let dupes = null, err = null;
  try { dupes = runAnalyzer(dir); } catch (e) { err = String((e && e.message) || e).slice(0, 200); }
  const want = kase === 'cross-seed' ? 0 : 1;
  const pass = err === null && dupes === want;
  console.log(JSON.stringify({ case: kase, pass, err, duplicates: dupes, want }));
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  return pass;
}

const results = [];
let failed = false;
for (const c of ['cross-seed', 'same-seed']) {
  const p = runCase(c);
  results.push(c + ':' + (p ? 'PASS' : 'FAIL'));
  if (!p) failed = true;
}
console.log(JSON.stringify({ case: 'all', pass: !failed, cases: results }));
process.exit(failed ? 1 : 0);
