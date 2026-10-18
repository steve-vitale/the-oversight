#!/usr/bin/env node
// detgate-rackscap-b.js — gate-off determinism for the RACKSCAP_B game-code arm.
//
// With RACKSCAP_B unset the changed game.js must be behaviorally identical to
// pristine game.js (byte-identical canonical end-state digests). Workflow:
//   node scripts/detgate-rackscap-b.js record   # on PRISTINE game.js (before the edit)
//   <make the game.js edit>
//   node scripts/detgate-rackscap-b.js verify   # asserts identical digests
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); RACKSCAP_B unset (asserted).
// 2 seeds x 2 policies x 60d death-aware, plain courtship policies (no wrappers).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.RACKSCAP_B !== undefined && process.env.RACKSCAP_B !== '') {
  console.error('FATAL: RACKSCAP_B must be unset for the det-gate');
  process.exit(2);
}

const SEEDS = [5111, 5112];
const POLICIES = { leadfeast, belongfeast };
const DAYS = 60;
const DIGESTS = path.join(__dirname, 'detgate-rackscap-b.digests.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function digest(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: 'detgate-rackscap', fullTelemetry: false });
  await setupGame(Game);
  const r = await runDays(Game, POLICIES[policyId], { days: DAYS, manifest: null });
  const deaths = [];
  // Death count via roster liveness delta (kind-safe: only real person losses).
  try {
    for (const id of (((Game.state || {}).village || {}).roster || [])) {
      const p = Game.getPerson ? Game.getPerson(id) : null;
      if (p && p.dead) deaths.push(id);
    }
  } catch (e) {}
  const v = Game.state.village || {};
  const out = {
    days: r.days, endReason: String(r.endReason || ''),
    pk: Math.round(pantryKcal(Game)), roster: (v.roster || []).length,
    sk: Math.round((Game.state.scholar || {}).kcal || 0),
    sd: (Game.state.scholar || {}).day || 0,
    deadRoster: deaths.length,
  };
  return JSON.stringify(out);
}

(async () => {
  const mode = process.argv[2] || 'verify';
  const got = {};
  for (const seed of SEEDS) {
    for (const pid of Object.keys(POLICIES)) {
      got[`${pid}-${seed}`] = await digest(seed, pid);
      console.log(`done ${pid} s${seed}`);
    }
  }
  if (mode === 'record') {
    fs.writeFileSync(DIGESTS, JSON.stringify(got, null, 1));
    console.log('recorded ' + DIGESTS);
    return;
  }
  let expected;
  try { expected = JSON.parse(fs.readFileSync(DIGESTS, 'utf8')); }
  catch (e) { console.error('FATAL: no digests file — run "record" on pristine game.js first'); process.exit(2); }
  let fail = 0;
  for (const k of Object.keys(got)) {
    const same = got[k] === expected[k];
    console.log(`${k}: ${same ? 'IDENTICAL' : 'DIFFERENT'}`);
    if (!same) { console.log('  got      ' + got[k]); console.log('  expected ' + expected[k]); fail++; }
  }
  console.log(fail ? 'DET-GATE FAIL' : 'DET-GATE GREEN (gate-off byte-identical)');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DETGATE ERROR', e); process.exit(2); });
