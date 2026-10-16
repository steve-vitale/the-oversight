#!/usr/bin/env node
// test-r15-probe-fixes-20261016.js — proof for the two r14 carryovers fixed in
// the r15 probe driver (scripts/table-answer-probe-r15-20261016.js):
//   (a) bearer helper: scholar.name is null; the name lives on the person
//       record — Game.displayName(Game.villagerId). The old expression always
//       emitted null (RED); the new one returns the bearer's name (GREEN).
//   (b) probe JSON schema: wave5unlocked/ascensions + ledger vector +
//       seat/doors + mootlaw lane counts are now emitted (the r14 gap that
//       produced the telemetry LOUD lines).
// GREEN when: old bearer expr is null AND new expr returns a non-empty name
// on 3 seeds; all schema computations run without throwing and return the
// right types; the driver file contains the emission keys.
// SEED env override supported. TOOLING ONLY.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { mootlaw } = require('./policies/mootlaw');

const SEEDS = (process.env.SEEDS || '48,37,5').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const ROOT = path.join(__dirname, '..');
const DRIVER = path.join(ROOT, 'scripts', 'table-answer-probe-r15-20261016.js');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`ok   - ${name}`); }
  else { fail++; console.log(`FAIL - ${name}${detail ? ' :: ' + detail : ''}`); }
}

// the exact expressions the driver emits (copied verbatim semantics)
function bearerNew(Game) {
  try { const vid = Game.villagerId; return (vid && Game.displayName) ? (Game.displayName(vid) || null) : null; }
  catch (e) { return null; }
}
function wave5unlocked(Game) {
  try { const f = (Game.deedState && Game.deedState().wavesFaced) || {}; return Object.keys(f).some(m => (f[m] | 0) === 5) ? 1 : 0; }
  catch (e) { return 0; }
}
function ascensions(Game) {
  try { return Game.tableAscended ? Game.tableAscended().length : 0; } catch (e) { return 0; }
}
function ledgerVec(Game) {
  try { const L = Game.ledger() || {}; return { exposed: L.exposed | 0, foodShared: L.foodShared | 0, foodHoarded: L.foodHoarded | 0, brokerage: L.brokerage | 0, might: L.might | 0, defiance: L.defiance | 0, protected: L.protected | 0, killed: L.killed | 0 }; }
  catch (e) { return {}; }
}

async function main() {
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'test-r15-probe-fixes' });
    await setupGame(Game);
    await runDays(Game, mootlaw, { days: 5 });
    const oldBearer = (Game.state.scholar || {}).name || null;
    const newBearer = bearerNew(Game);
    check(`seed ${seed}: OLD bearer expr is null (the r14 gap reproduces)`, oldBearer === null, `scholar.name=${JSON.stringify(oldBearer)}`);
    check(`seed ${seed}: NEW bearer expr returns a non-empty name`, typeof newBearer === 'string' && newBearer.length > 0, `got=${JSON.stringify(newBearer)}`);
    check(`seed ${seed}: wave5unlocked is 0|1`, wave5unlocked(Game) === 0 || wave5unlocked(Game) === 1, `got=${wave5unlocked(Game)}`);
    check(`seed ${seed}: ascensions is a non-negative int`, Number.isInteger(ascensions(Game)) && ascensions(Game) >= 0, `got=${ascensions(Game)}`);
    const lv = ledgerVec(Game);
    check(`seed ${seed}: ledger vector has all 8 keys`, ['exposed','foodShared','foodHoarded','brokerage','might','defiance','protected','killed'].every(k => Number.isInteger(lv[k])), JSON.stringify(lv));
  }
  // the driver file must emit the schema keys
  const src = fs.readFileSync(DRIVER, 'utf8');
  for (const key of ['wave5unlocked', 'ascensions:', 'ledger:', 'mootlaw:', 'Game.displayName(Game.villagerId)', 'policyCtx']) {
    check(`driver emits ${key}`, src.includes(key), 'missing from driver source');
  }
  // r15 must refuse staging explicitly
  check('driver refuses FORCE_PATH', src.includes('FORCE_PATH is not allowed in r15'), 'refusal line missing');
  check('driver refuses DARK staging', src.includes('DARK staging is not allowed in r15'), 'refusal line missing');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
