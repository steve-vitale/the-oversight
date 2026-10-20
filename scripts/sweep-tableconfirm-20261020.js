#!/usr/bin/env node
// sweep-tableconfirm-20261020.js — scoped confirm sweep for the
// sim-tablepathdriver pilot GO (flesh-out loop, 2026-10-20).
//
// SCOPE (the pilot's "Named nexts" #1): relay/dark + witness on fresh
// seeds. 12 fresh seeds (81301–81312, NOT the pilot's 64201–64208) ×
// {leadfeast, belongfeast} × {control, armed} = 48 runs, 180d death-aware.
// Door assignment: relay 8 + witness 4 per policy via slot placement in
// the driver's OWN rotation (scripts/tableconfirm-slots-20261020.js);
// the landed policy files are read-only.
//
//   SIDE=armed:   TABLEPATHDRIVER=1 + RELAYDARK=1 (the 7-door driver + the
//                 dark-relay road) — the treated side.
//   SIDE=control: both unset (pure delegation) — the before side.
//   POLICY=leadfeast|belongfeast (required).
//
// Substrate (identical to the pilot, seatdrive seated stack):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1
// (TABLEPATHDRIVER/RELAYDARK per SIDE; FIDELITY=1 is set internally for the
// control side ONLY to satisfy the probe module's substrate guard — the
// probe's main() never runs, so no stale-corpus comparison happens; the
// guard just verifies the OFF delegation composition.)
//
// Output: evidence/2026-10-20/perseed-tableconfirm/<side>/<policy>/s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');

const POLICY = process.env.POLICY;
const SIDE = process.env.SIDE || 'armed';
if (POLICY !== 'leadfeast' && POLICY !== 'belongfeast') {
  console.error('STOP: POLICY=leadfeast|belongfeast is required.'); process.exit(2);
}
if (SIDE !== 'armed' && SIDE !== 'control') {
  console.error('STOP: SIDE=armed|control.'); process.exit(2);
}

const { FRESH_SEEDS, SLOTS } = require('./tableconfirm-slots-20261020');
// The probe's seedIdx = SEEDS.indexOf(seed); placing the fresh seeds at the
// policy's scoped slots makes the driver's OWN rotation assign relay/witness.
process.env.SEEDS = SLOTS[POLICY].join(',');

if (SIDE === 'control') {
  // Layers OFF. FIDELITY=1 mode exists precisely for this: the guard
  // requires TABLEPATHDRIVER/RELAYDARK unset in fidelity mode, and both
  // new layers then delegate byte-identically to the control composition.
  // The probe's main() (which would compare against the stale 2026-10-19
  // corpus) never runs — only the exported runOne is called below.
  process.env.FIDELITY = '1';
  delete process.env.TABLEPATHDRIVER;
  delete process.env.RELAYDARK;
} else {
  process.env.TABLEPATHDRIVER = '1';
  process.env.RELAYDARK = '1';
}
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'NODEWITNESS', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 is required (confirm substrate).`); process.exit(2); }
}

const SW = require('./probe-tablepathdriver-20261020');
const TPD = require('./policies/tablepathdriver');

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tableconfirm', SIDE, POLICY);
fs.mkdirSync(OUTDIR, { recursive: true });

(async () => {
  // Verify the slot placement BEFORE burning sims: every fresh seed must
  // map to relay or witness on this policy's rotation, 8 + 4.
  const counts = { relay: 0, witness: 0 };
  for (const seed of FRESH_SEEDS) {
    const idx = SLOTS[POLICY].indexOf(seed);
    const door = TPD.assignedDoor(POLICY, idx);
    if (door !== 'relay' && door !== 'witness') {
      console.error(`SLOT FAIL: ${POLICY} s${seed} idx=${idx} door=${door} (expected relay|witness)`); process.exit(2);
    }
    counts[door]++;
  }
  if (counts.relay !== 8 || counts.witness !== 4) {
    console.error(`SLOT FAIL: ${POLICY} relay=${counts.relay} witness=${counts.witness} (expected 8/4)`); process.exit(2);
  }
  console.log(`slots OK: ${POLICY} relay=8 witness=4 (fresh seeds 81301-81312)`);

  // RESUME (2026-10-20): a host service restart can kill this process
  // mid-sweep (/tmp wiped, processes gone). Per-seed JSONs are written
  // incrementally, so a re-run skips seeds with a valid completed file
  // (hashes present) instead of re-burning them.
  const EVIDSIDE = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tableconfirm', SIDE);
  let n = 0, skipped = 0;
  for (const seed of FRESH_SEEDS) {
    const fp = path.join(EVIDSIDE, POLICY, `s${seed}.json`);
    try {
      const prev = JSON.parse(fs.readFileSync(fp, 'utf8'));
      if (prev && (prev.hashes || []).length > 0) {
        console.log(`  [${POLICY} s${seed} ${SIDE}] resume-skip (already complete: ${prev.hashes.length} days)`);
        skipped++;
        continue;
      }
    } catch (e) { /* missing or unreadable: run it */ }
    const out = await SW.runOne(seed, POLICY, { eviddir: EVIDSIDE });
    const tpd = out.tpdSummary || {};
    const walked = (tpd.doorEvents || []).map(d => String(d.picked || '').replace(/^path:/, '')).join(',') || '—';
    const errs = (tpd.drainError | 0) + (((out.rdSummary || {}).verbError | 0)) + (((out.rdSummary || {}).rdError | 0)) + (out.instrumentErrors | 0);
    console.log(`  [${POLICY} s${seed} ${SIDE}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} table=${out.table} sat=${out.satEver} door=${out.tpAssigned} walked=[${walked}] errs=${errs}`);
    n++;
  }
  console.log(`CONFIRM SWEEP COMPLETE: ${POLICY}/${SIDE} ${n} ran + ${skipped} resume-skipped = ${n + skipped}/${FRESH_SEEDS.length} -> ${OUTDIR}`);
})().catch(e => { console.error('CONFIRM SWEEP FATAL:', e && e.stack || e); process.exit(1); });
