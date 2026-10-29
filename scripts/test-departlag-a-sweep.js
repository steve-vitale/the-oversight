#!/usr/bin/env node
// scripts/test-departlag-a-sweep.js — sim-departlag-a fresh band.
// THIN WRAPPER ONLY: it pins the prereg's two overrides (EVID to the
// new perseed-departlag-a dir, SEEDS to the funnel-a band verbatim)
// and delegates to scripts/test-funnel-a-sweep.js VERBATIM (never
// edited). Substrate, recorders, horizon, and policy are therefore
// exactly the funnel-a sweep's. Passes --one <seed> / --summary
// through. Refuses to run if EVID or SEEDS were already set to
// something else in the environment, so a stale override cannot
// silently redirect the corpus.
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const WANT_EVID = path.join(REPO, 'evidence', '2026-10-29', 'perseed-departlag-a');
const WANT_SEEDS = '75101,75102,75103,75104,75105,75106,75107,75108,75109,75110,75111,75112,75113,75114,75115,75116';
if (process.env.EVID && path.resolve(process.env.EVID) !== path.resolve(WANT_EVID)) {
  console.error(`DEPARTLAG-SWEEP-REFUSAL: EVID already set to ${process.env.EVID}, want ${WANT_EVID}`);
  process.exit(1);
}
if (process.env.SEEDS && process.env.SEEDS !== WANT_SEEDS) {
  console.error(`DEPARTLAG-SWEEP-REFUSAL: SEEDS already set to ${process.env.SEEDS}, want ${WANT_SEEDS}`);
  process.exit(1);
}
const env = Object.assign({}, process.env, { EVID: WANT_EVID, SEEDS: WANT_SEEDS });
const r = spawnSync(process.execPath, [path.join(__dirname, 'test-funnel-a-sweep.js')].concat(process.argv.slice(2)), { stdio: 'inherit', env });
process.exit(r.status === null ? 1 : r.status);
