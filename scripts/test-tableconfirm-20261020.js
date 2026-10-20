#!/usr/bin/env node
// test-tableconfirm-20261020.js — proof for the sim-tablepathdriver
// scoped confirm (flesh-out loop, 2026-10-20). Modes (argv[2]):
//
//   rotation (default): the slot lists in tableconfirm-slots-20261020.js
//     map every fresh seed to relay|witness on its policy's OWN rotation
//     (8 relay + 4 witness per policy) — the driver's policy file is
//     read-only; placement is the only lever.
//   fidelity:  FIDELITY=1 OFF-side (TABLEPATHDRIVER/RELAYDARK unset) on
//     pilot seeds 64201, 64202 × {leadfeast, belongfeast}: day-hashes
//     byte-identical to the re-measured control corpus
//     (evidence/2026-10-20/perseed-tablepathdriver-control/). Proves the
//     pilot's corpus still holds on the current tip (the dipholdbar
//     evidence's engine-drift lesson) BEFORE the confirm sweep burns.
//   det:       armed layers-ON twice on 2 fresh slotted seeds (60d):
//     byte-identical hashes (no unseeded RNG in the new layers).
//   smoke:     armed full 180d run on 1 fresh relay seed + 1 fresh witness
//     seed: completes, assigned door as slotted, 0 engine errors.
//   complete:  COMPLETE=1 post-sweep gate — all 48 confirm files exist,
//     every run has hashes, 0 engine errors on all armed runs.
//
// Usage: node scripts/test-tableconfirm-20261020.js [rotation|fidelity|det|smoke|complete]
'use strict';
const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'rotation';
const REPO = path.join(__dirname, '..');
const { FRESH_SEEDS, SLOTS, EXPECTED } = require('./tableconfirm-slots-20261020');

const SUBSTRATE = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'NODEWITNESS', 'KILLDISC'];

if (mode === 'fidelity') {
  process.env.FIDELITY = '1'; // OFF-side guard mode; layers unset below
  delete process.env.TABLEPATHDRIVER;
  delete process.env.RELAYDARK;
  process.env.SEEDS = '64201,64202,64203,64204,64205,64206,64207,64208'; // pilot seed list: seedIdx matches the control corpus
} else {
  process.env.TABLEPATHDRIVER = '1';
  process.env.RELAYDARK = '1';
  // Default slot list for DET/smoke: leadfeast's (mode passes POLICY for slot choice).
  process.env.SEEDS = (process.env.CONFIRM_POLICY === 'belongfeast' ? SLOTS.belongfeast : SLOTS.leadfeast).join(',');
}
for (const k of SUBSTRATE) if (process.env[k] !== '1') process.env[k] = '1';

const SW = require('./probe-tablepathdriver-20261020');
const TPD = require('./policies/tablepathdriver');

let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

async function mRotation() {
  for (const policy of ['leadfeast', 'belongfeast']) {
    const counts = { relay: 0, witness: 0, other: [] };
    for (const seed of FRESH_SEEDS) {
      const idx = SLOTS[policy].indexOf(seed);
      if (idx < 0) { counts.other.push(`${seed}:NOT-IN-SLOTS`); continue; }
      const door = TPD.assignedDoor(policy, idx);
      if (door === 'relay' || door === 'witness') counts[door]++;
      else counts.other.push(`${seed}:idx${idx}->${door}`);
    }
    check(`${policy} slots all relay|witness`, counts.other.length === 0, counts.other.join('; ') || 'ok');
    check(`${policy} relay=8`, counts.relay === 8, `relay=${counts.relay}`);
    check(`${policy} witness=4`, counts.witness === 4, `witness=${counts.witness}`);
  }
  check('no pilot seeds reused', !FRESH_SEEDS.some(s => s >= 64201 && s <= 64208), FRESH_SEEDS.join(','));
}

async function mFidelity() {
  // The pilot's re-measured control corpus (OFF composition, base f83c41ea6).
  // Current tip adds only the ship-loop version bump (no game code) — the
  // corpus must still be byte-identical on the day hashes.
  const pairs = [[64201, 'leadfeast'], [64201, 'belongfeast'], [64202, 'leadfeast'], [64202, 'belongfeast']];
  for (const [seed, policy] of pairs) {
    const out = await SW.runOne(seed, policy, { noWrite: true });
    const mine = (out.hashes || []).join('|');
    const fp = path.join(REPO, 'evidence', '2026-10-20', 'perseed-tablepathdriver-control', policy, `s${seed}.json`);
    if (!fs.existsSync(fp)) { check(`fidelity s${seed}/${policy}`, false, 'control file missing'); continue; }
    const ctrl = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const theirs = (ctrl.hashes || []).join('|');
    check(`fidelity s${seed}/${policy} byte-identical to control corpus`,
      mine === theirs && mine.length > 0,
      mine === theirs ? `${out.hashes.length} days identical` : `DIVERGED (probe ${out.hashes.length}d vs corpus ${(ctrl.hashes || []).length}d)`);
  }
}

async function mDet() {
  const policy = process.env.CONFIRM_POLICY === 'belongfeast' ? 'belongfeast' : 'leadfeast';
  const seeds = [81302, 81311]; // one relay slot, one witness slot on leadfeast
  for (const seed of seeds) {
    const c1 = await SW.runOne(seed, policy, { noWrite: true, days: 60 });
    const c2 = await SW.runOne(seed, policy, { noWrite: true, days: 60 });
    const h1 = (c1.hashes || []).join('|'), h2 = (c2.hashes || []).join('|');
    check(`DET ${policy} s${seed} armed-stable`, h1 === h2 && h1.length > 0, `${c1.hashes.length} days, door=${c1.tpAssigned}`);
  }
}

async function mSmoke() {
  const policy = process.env.CONFIRM_POLICY === 'belongfeast' ? 'belongfeast' : 'leadfeast';
  for (const seed of [81302, 81311]) {
    const out = await SW.runOne(seed, policy, { noWrite: true });
    const tpd = out.tpdSummary || {}, rd = out.rdSummary || {};
    const errs = (tpd.drainError | 0) + (rd.verbError | 0) + (rd.rdError | 0) + (out.instrumentErrors | 0);
    const idx = SLOTS[policy].indexOf(seed);
    check(`SMOKE ${policy} s${seed}`, out.gameDays > 0 && errs === 0 && out.tpAssigned === TPD.assignedDoor(policy, idx),
      `days=${out.gameDays} end=${out.endReason} door=${out.tpAssigned} errs=${errs} relayHeld=${(out.relayAtEnd || {}).held}`);
  }
}

async function mComplete() {
  const dir = path.join(REPO, 'evidence', '2026-10-20', 'perseed-tableconfirm');
  let n = 0, bad = 0, armedErrs = 0;
  for (const side of ['armed', 'control']) {
    for (const policy of ['leadfeast', 'belongfeast']) {
      for (const seed of FRESH_SEEDS) {
        const fp = path.join(dir, side, policy, `s${seed}.json`);
        if (!fs.existsSync(fp)) { bad++; continue; }
        n++;
        const r = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const tpd = r.tpdSummary || {}, rd = r.rdSummary || {};
        if (!(r.hashes || []).length) { bad++; console.log(`  BAD ${side}/${policy}/s${seed}: no hashes`); continue; }
        if (side === 'armed') {
          const errs = (tpd.drainError | 0) + (rd.verbError | 0) + (rd.rdError | 0) + (r.instrumentErrors | 0);
          if (errs > 0) { armedErrs++; console.log(`  ERR ${side}/${policy}/s${seed}: engineErrors=${errs}`); }
        }
      }
    }
  }
  check('COMPLETE all 48 files present with hashes', n === 48 && bad === 0, `${n}/48 ok, ${bad} bad`);
  check('COMPLETE 0 engine errors on armed runs', armedErrs === 0, `${armedErrs} armed runs with errors`);
}

(async () => {
  console.log(`test-tableconfirm-20261020 [${mode}]`);
  if (mode === 'rotation') await mRotation();
  else if (mode === 'fidelity') await mFidelity();
  else if (mode === 'det') await mDet();
  else if (mode === 'smoke') await mSmoke();
  else if (mode === 'complete') await mComplete();
  else { console.error('unknown mode'); process.exit(2); }
  console.log(failures ? `RESULT: ${failures} FAILURES` : 'RESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL:', e && e.stack || e); process.exit(1); });
