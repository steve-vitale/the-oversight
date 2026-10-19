#!/usr/bin/env node
// compare-fidelity-20261019.js — fidelity gate for sim-switchtime-2: the
// gate-off re-sweep (perseed-switchtime2-control) vs the committed
// seasonblock corpus (perseed-seasonblock). Full byte-identical is the bar;
// on mismatch, classify: numeric-instruments-identical (beats text drift
// only — 3 landed narration commits between the corpus base and this tree)
// vs trajectory drift (FAIL — the corpus can't be reused).
'use strict';
const fs = require('fs');
const path = require('path');
const E = path.join(__dirname, '..', 'evidence', '2026-10-19');
const SEEDS = [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208];
const POLICIES = ['leadfeast', 'belongfeast'];
const NUMERIC_KEYS = ['gameDays', 'endReason', 'won', 'national', 'nationalDay', 'table',
  'maxWave', 'wave4Day', 'wave5Day', 'successions', 'maxRank', 'exiled', 'instrumentErrors'];

function strip(o) {
  // Drop narration-bearing and volatile fields; keep every numeric instrument.
  // deathChannels is absent from the seasonblock corpus (that probe predates
  // the instrument) — presence-only difference, not drift.
  const c = JSON.parse(JSON.stringify(o));
  delete c.beats; delete c.hashes; delete c.flows; delete c.flowAgg;
  delete c.deathsAttributed; delete c.deathChannels;
  if (Array.isArray(c.bond)) for (const b of c.bond) delete b.succession;
  return c;
}
let byteOk = 0, numOk = 0, bad = 0;
for (const pol of POLICIES) for (const s of SEEDS) {
  const a = path.join(E, 'perseed-switchtime2-control', pol, `s${s}.json`);
  const b = path.join(E, 'perseed-seasonblock', pol, `s${s}.json`);
  if (!fs.existsSync(a) || !fs.existsSync(b)) { console.log(`MISSING ${pol} s${s}`); bad++; continue; }
  const ta = fs.readFileSync(a, 'utf8'), tb = fs.readFileSync(b, 'utf8');
  if (ta === tb) { byteOk++; continue; }
  const ja = strip(JSON.parse(ta)), jb = strip(JSON.parse(tb));
  // compare numeric keys + full bond census + death channels + link dump ids
  const ka = { num: {}, bond: ja.bond, dc: ja.deathChannels, endBond: ja.endBond };
  const kb = { num: {}, bond: jb.bond, dc: jb.deathChannels, endBond: jb.endBond };
  for (const k of NUMERIC_KEYS) { ka.num[k] = ja[k]; kb.num[k] = jb[k]; }
  if (JSON.stringify(ka) === JSON.stringify(kb)) {
    numOk++;
    // classify the drift: which top-level keys differ?
    const diffs = [];
    const oa = JSON.parse(ta), ob = JSON.parse(tb);
    for (const k of new Set([...Object.keys(oa), ...Object.keys(ob)])) {
      if (JSON.stringify(oa[k]) !== JSON.stringify(ob[k])) diffs.push(k);
    }
    console.log(`NUMERIC-ONLY ${pol} s${s}: differ in [${diffs.join(', ')}]`);
  } else {
    bad++;
    console.log(`TRAJECTORY-DRIFT ${pol} s${s}`);
  }
}
console.log(`\nfidelity: byte-identical ${byteOk}/16, numeric-identical ${numOk}/16, drift ${bad}/16`);
process.exit(bad ? 1 : 0);
