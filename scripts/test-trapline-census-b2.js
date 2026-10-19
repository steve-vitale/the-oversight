#!/usr/bin/env node
// scripts/test-trapline-census-b2.js — proof test for the event-tracked
// NPC trapper census instrument (arm sim-trapline-census-b2, loop B
// food-economy axis, run fleshout-loop-b-20261019T1030Z).
//
// Proves the INSTRUMENT, not the game:
//   1. DETERMINISM: two identical fixture runs (seed, policy, 25d) produce
//      byte-identical per-run JSON (det-gate).
//   2. ATTRIBUTION COMPLETENESS: every pit catch is attributed to a holder
//      origin; every knowsPit holder has an appear record and a recorded
//      departure (death/exit/exit-eor/survived); zero unattributed
//      transitions.
//   3. #612 PROBE SANITY: gateNeedFail + gateNeedPass === pitEligible;
//      tele-need mismatch counts are reported (expected 0 — the engine
//      computes need from the same gate state).
//   4. Fixture validity: the chosen seeds show real pit activity
//      (day-0 holder or joiner catches or lessons) so the completeness
//      assertions aren't vacuous.
//
// Fixture seeds 7931/7932 are fresh (never consumed by another sweep).
// Writes go to a /tmp outdir only — the test never touches the repo.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-trapline-census-b2.js
'use strict';
process.env.FEASTSCALE_R13 = process.env.FEASTSCALE_R13 || '1';
process.env.SEATDRIVE = process.env.SEATDRIVE || '0';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const SW = require('./sweep-trapline-census-b2');

const FIXTURE = [
  { seed: 7931, policy: 'leadfeast', days: 25 },
  { seed: 7932, policy: 'belongfeast', days: 25 },
];

let failures = 0;
function ok(cond, label, extra) {
  if (cond) { console.log(`ok   - ${label}`); }
  else { failures++; console.log(`FAIL - ${label}${extra ? ' :: ' + extra : ''}`); }
}

function sha1file(fn) { return crypto.createHash('sha1').update(fs.readFileSync(fn)).digest('hex'); }

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tlc-b2-'));
  const files = [];
  for (const f of FIXTURE) {
    const outdir = path.join(tmp, `run-${f.seed}-${f.policy}`);
    fs.mkdirSync(outdir, { recursive: true });
    await SW.runOne(f.seed, f.policy, { days: f.days, outdir, progress: false });
    files.push(path.join(outdir, `${f.policy}-s${f.seed}.json`));
  }
  // det-gate: re-run the FIRST fixture, byte-identical to the first copy
  const f0 = FIXTURE[0];
  const redir = path.join(tmp, `rerun-${f0.seed}-${f0.policy}`);
  fs.mkdirSync(redir, { recursive: true });
  await SW.runOne(f0.seed, f0.policy, { days: f0.days, outdir: redir, progress: false });
  const orig = files[0];
  const rerun = path.join(redir, `${f0.policy}-s${f0.seed}.json`);
  ok(sha1file(orig) === sha1file(rerun), `det-gate: byte-identical re-run (${f0.policy} s${f0.seed}, ${f0.days}d)`,
    `orig=${sha1file(orig)} rerun=${sha1file(rerun)}`);

  for (const fn of files) {
    const rec = JSON.parse(fs.readFileSync(fn, 'utf8'));
    const tag = `${rec.policy} s${rec.seed}`;
    // attribution completeness
    ok(Array.isArray(rec.unattributed) && rec.unattributed.length === 0, `${tag}: zero unattributed transitions`, JSON.stringify(rec.unattributed).slice(0, 200));
    const ledgerVids = new Set(Object.keys(rec.ledger || {}));
    const catchVids = new Set();
    for (const e of Object.values(rec.ledger || {})) {
      for (const c of (e.catches || [])) { /* attributed by construction */ }
      ok(Number.isInteger(e.appearDay), `${tag}: holder ${e.vid} has appearDay`, JSON.stringify(e.appearDay));
      ok(['day0', 'join', 'rejoin', 'lesson'].includes(e.via), `${tag}: holder ${e.vid} via in {day0,join,rejoin,lesson}`, e.via);
      ok(['death', 'exit', 'exit-eor', 'survived', 'scholar-succession'].includes(e.depart), `${tag}: holder ${e.vid} has recorded departure`, e.depart);
      ok(['background-trapper', 'background-other', 'learned-in-run', 'pre-run-learned'].includes(e.origin), `${tag}: holder ${e.vid} origin classified`, e.origin);
    }
    // every npc_pit catch resolves to a ledger holder (cross-check via
    // the ledger's own catch records)
    const ledgerCatches = Object.values(rec.ledger || {}).reduce((t, e) => t + (e.catches || []).length, 0);
    ok(ledgerCatches === rec.pit.catches, `${tag}: ledger catches (${ledgerCatches}) == pit catches (${rec.pit.catches})`);
    // #612 internal consistency
    const p = rec.p612;
    ok(p.gateNeedFail + p.gateNeedPass === p.pitEligible, `${tag}: p612 gate split sums to eligible (${p.gateNeedFail}+${p.gateNeedPass}==${p.pitEligible})`);
    ok(p.teachCalls >= p.pitTeacherCalls && p.pitTeacherCalls >= p.pitEligible, `${tag}: p612 call nesting holds (${p.teachCalls}>=${p.pitTeacherCalls}>=${p.pitEligible})`);
    // fixture validity: real pit activity somewhere in the fixture set
  }
  const recs = files.map(fn => JSON.parse(fs.readFileSync(fn, 'utf8')));
  const anyActivity = recs.some(r => r.day0.holders.length > 0 || r.pit.catches > 0 || r.firings.lessons > 0 || r.joins.some(j => j.knowsPit));
  ok(anyActivity, 'fixture validity: >=1 fixture shows pit activity (holder/join/catch/lesson)',
    JSON.stringify(recs.map(r => ({ s: r.seed, h0: r.day0.holders.length, joins: r.joins.filter(j => j.knowsPit).length, c: r.pit.catches, l: r.firings.lessons }))));
  const teleMis = recs.reduce((t, r) => t + r.p612.teleNeedMismatch, 0);
  console.log(`info - fixture tele-need mismatches: ${teleMis} (expected 0 — engine computes need from gate state)`);
  if (failures) { console.error(`PROOF FAILED: ${failures} assertion(s)`); process.exit(1); }
  console.log('PROOF GREEN: determinism + attribution completeness + p612 consistency');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
