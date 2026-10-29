#!/usr/bin/env node
// test-clearhabit-b.js — KILL-STATE proof for sim-clearhabit-b.
//
// The arm was KILLED at pilot per its prereg (rescue rate 0.227 <
// 0.50 bar, opportunity n=22 >= 8; analysis verdict NO-GO), and the
// lever was reverted zero-trace: scripts/policies/clearhabit.js
// deleted, the nighttravel.js hook removed. The original T0–T6
// synthetic behavior checks tested the deleted policy's functions
// and CANNOT run on the killed state — they are retired with the
// policy, not faked and not skipped silently. This proof instead
// asserts the kill is clean and the verdict data is what the
// analysis claims:
//   K1–K4: zero-trace kill (policy file absent, no clearhabit
//     reference in any policy file, nighttravel policy loads).
//   T7–T10: corpus checks over the committed before/after corpora
//     and the analysis JSON (unchanged from the pre-kill proof).
//   T11: analysis verdict is NO-GO under the prereg bar.
// Exit non-zero on any failure; print PROOF-GREEN only when all
// executed checks pass. Writes nothing into the repo.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POLICY_FILE = path.join(ROOT, 'scripts', 'policies', 'clearhabit.js');
const NIGHTTRAVEL_FILE = path.join(ROOT, 'scripts', 'policies', 'nighttravel.js');
const POLICIES_DIR = path.join(ROOT, 'scripts', 'policies');
const BEFORE_DIR = path.join(ROOT, 'evidence', '2026-10-29', 'sim-clearhabit-b-corpus-before');
const AFTER_DIR = path.join(ROOT, 'evidence', '2026-10-29', 'sim-clearhabit-b-corpus-after');
const ANALYSIS = path.join(ROOT, 'evidence', '2026-10-29', 'sim-clearhabit-b-analysis.json');

let failures = [];
let skipped = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ' — ' + detail : ''}`);
  if (!cond) failures.push(name);
}
function skip(name) { console.log(`SKIP ${name}`); skipped++; }

function main() {
  // K1: the killed policy file is gone.
  check('K1 clearhabit policy file deleted', !fs.existsSync(POLICY_FILE));
  // K2: nighttravel carries no hook or reference to the killed arm.
  const ntSrc = fs.readFileSync(NIGHTTRAVEL_FILE, 'utf8');
  check('K2 nighttravel.js has no clearhabit reference', !ntSrc.includes('clearhabit'));
  // K3: the nighttravel policy still loads after the hook removal.
  let ntLoaded = false;
  try { const p = require('./policies/nighttravel'); ntLoaded = !!(p && p.nighttravel); } catch (e) { ntLoaded = false; }
  check('K3 nighttravel policy loads after hook removal', ntLoaded);
  // K4: no policy file references the killed arm at all.
  const policyHits = [];
  for (const f of fs.readdirSync(POLICIES_DIR).sort()) {
    if (!f.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(POLICIES_DIR, f), 'utf8');
    if (src.includes('clearhabit')) policyHits.push(f);
  }
  check('K4 no policy file references clearhabit', policyHits.length === 0, `hits=${policyHits.join(',') || 'none'}`);

  // Corpus checks (skip until legs exist).
  const hasCorpora = fs.existsSync(BEFORE_DIR) && fs.existsSync(AFTER_DIR) && fs.existsSync(ANALYSIS);
  if (!hasCorpora) {
    skip('T7 before/after seed sets equal (no corpora yet)');
    skip('T8 gate-OFF legs never fired the habit (no corpora yet)');
    skip('T9 analysis pooled numbers recompute (no corpora yet)');
    skip('T10 G3 zero violations in analysis (no corpora yet)');
    skip('T11 analysis verdict NO-GO under prereg bar (no corpora yet)');
  } else {
    const loadDir = (dir) => {
      const out = {};
      for (const f of fs.readdirSync(dir).sort()) {
        if (!f.endsWith('.json')) continue;
        const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        out[j.seed] = j;
      }
      return out;
    };
    const before = loadDir(BEFORE_DIR), after = loadDir(AFTER_DIR);
    const a = JSON.parse(fs.readFileSync(ANALYSIS, 'utf8'));
    const bSeeds = Object.keys(before).sort(), aSeeds = Object.keys(after).sort();
    check('T7 before/after seed sets equal', JSON.stringify(bSeeds) === JSON.stringify(aSeeds), `before=${bSeeds.length} after=${aSeeds.length}`);
    let gateOffFired = 0;
    for (const s of bSeeds) for (const e of (before[s].evenings || [])) if (e.clearhabit && e.clearhabit.attempted) gateOffFired++;
    check('T8 gate-OFF legs never fired the habit', gateOffFired === 0, `fired=${gateOffFired}`);
    const OPP = new Set(['cleared', 'unaffordable', 'unclearable-creek', 'unclearable-other', 'walk-failed', 'clear-failed', 'moved-during-clear', 'died-walking', 'combat-walking', 'no-blockfrom']);
    let opp = 0, resc = 0;
    for (const s of aSeeds) for (const e of (after[s].evenings || [])) {
      if (e.eveningOutcome === 'game-over') continue;
      const ch = e.clearhabit || {};
      if (ch.opportunity && OPP.has(ch.status)) { opp++; if (e.inside === true && e.tile === 'haven') resc++; }
    }
    check('T9 analysis pooled numbers recompute',
      a.pooled.afterOpportunity === opp && a.pooled.afterRescued === resc,
      `analysis ${a.pooled.afterOpportunity}/${a.pooled.afterRescued} recomputed ${opp}/${resc}`);
    const g3t = a.pooled.g3Totals;
    const g3sum = g3t.movedDuringClear + g3t.rescuedInCombat + g3t.rescuedClearUnverified + g3t.creekCleared;
    check('T10 G3 zero violations in analysis', g3sum === 0, `g3=${JSON.stringify(g3t)}`);
    check('T10 partition flag true', a.pooled.partitionOk === true);
    // T11: the kill verdict itself — prereg bar 0.50, minimum n 8.
    const v = a.verdict || {};
    const rate = a.pooled.afterOpportunity ? a.pooled.afterRescued / a.pooled.afterOpportunity : null;
    check('T11 analysis verdict NO-GO under prereg bar',
      v.verdict === 'NO-GO' && v.goBar === false && a.pooled.afterOpportunity >= 8 && rate !== null && rate < 0.50,
      `verdict=${v.verdict} rate=${rate} opportunity=${a.pooled.afterOpportunity}`);
  }

  if (failures.length) { console.log(`PROOF-RED: ${failures.length} failures: ${failures.join(', ')}`); process.exit(1); }
  console.log(`PROOF-GREEN: all clearhabit kill-state checks pass (skipped corpus checks: ${skipped})`);
}

main();
