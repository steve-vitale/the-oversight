#!/usr/bin/env node
// scripts/test-flip73676-guardfire.js — sim-flip73676-a guard-fire log.
//
// METHOD (why this file exists): during this run the container EPERM
// flap blocked ALL disk writes from node/shell processes, so the
// bisect experiments could not edit src/js/game.js on disk. Instead
// this script re-inserts the e68a15e5f dead-teacher guards into the
// game.js source IN MEMORY (via an fs.readFileSync patch applied
// before the harness loads) and runs seed 73676 under the
// tableseat-nowait substrate. The disk tree is never touched, so
// the experiment is checkout-safe by construction.
//
// The guard-fire log is collected in a global array, NOT via
// console.log: the harness's quietLog silences console.log inside
// the day loop, which made an earlier console.log version report
// zero fires while still reproducing the winning endpoint.
//
// PRECONDITION: the disk tree's game.js must be in guards-OFF state
// (both e68a15e5f blocks removed), as it was during the E4
// experiments — this script RE-INSERTS the guards in memory, and
// its anchors throw if the guards are already present (as on
// HEAD). The 3 r52 files must also be at their e8f2ccad7 versions
// for the e8f2ccad7-base expectations below.
//
// Usage: node scripts/test-flip73676-guardfire.js
// Prints: PATCHED + LOADFAILS, the E3 endpoint row, the guard-fire
// count, and every guard fire (day, pid/aid, discoverer/learner).
// Measured on seed 73676 (e8f2ccad7 engine state, both guards on):
// 160d won, 55 deaths, 81 PLANT fires, all pid=masoor_lentil
// discoveredBy=nadia_khoury, first fire day 54, zero ANIMAL fires.
'use strict';
const fs = require('fs');
const origRead = fs.readFileSync;
global.__guardFires = [];
let patched = false;
fs.readFileSync = function (p, enc) {
  const s = origRead.apply(this, arguments);
  if (typeof p === 'string' && p.endsWith('src/js/game.js') && typeof s === 'string') {
    let out = s;
    const animalOld = "          if (this.grantKnowledge('animal', aid, 1, { type: 'taught', by: teacher })) {";
    const animalNew = "          let aTeacherDead = false;\n"
      + "          try { const avp = this.vpOf ? this.vpOf(vAnim[aid].learnedBy) : null; aTeacherDead = !!(avp && avp.dead); if (aTeacherDead) { try { global.__guardFires.push('ANIMAL day=' + ((this.state.scholar || {}).day || 0) + ' aid=' + aid + ' learnedBy=' + (vAnim[aid].learnedBy || '')); } catch (e) {} } } catch (e) {}\n"
      + "          if (!aTeacherDead && this.grantKnowledge('animal', aid, 1, { type: 'taught', by: teacher })) {";
    if (out.split(animalOld).length !== 2) throw new Error('animal anchor count != 1');
    out = out.replace(animalOld, animalNew);
    const plantGuardOld = '      const entry = shared[pid];\n';
    const plantGuardNew = '      const entry = shared[pid];\n'
      + "      try { const dvp = this.vpOf ? this.vpOf(entry.discoveredBy) : null; if (dvp && dvp.dead) { try { global.__guardFires.push('PLANT day=' + ((this.state.scholar || {}).day || 0) + ' pid=' + pid + ' discoveredBy=' + entry.discoveredBy); } catch (e) {} return; } } catch (e) {}\n";
    if (out.split(plantGuardOld).length !== 2) throw new Error('plant guard anchor count != 1');
    out = out.replace(plantGuardOld, plantGuardNew);
    patched = true;
    return out;
  }
  return s;
};
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
async function main() {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const seed = 73676;
  const { Game, loadFails } = await loadGame({ seed, mode: 'flip73676-guardfire', fullTelemetry: false });
  console.log('PATCHED=' + patched + ' LOADFAILS=' + JSON.stringify(loadFails));
  await setupGame(Game);
  const result = await runDays(Game, tableseatNowait, { days: 180, manifest: undefined, sampleEvery: 1 });
  let arc = 1, te = false, rank = 'village', won = false;
  try { won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; arc = pg.arc || 1; te = !!pg.tableDone; } catch (e) {}
  try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  console.log('E3-RESULT seed=' + seed + ' days=' + result.days + ' end=' + result.endReason
    + ' won=' + (won ? 1 : 0) + ' arc=' + arc + ' rank=' + rank + ' entered=' + (te ? 1 : 0)
    + ' deaths=' + (result.samples.deaths || []).length);
  console.log('GUARDFIRE-COUNT=' + global.__guardFires.length);
  for (const f of global.__guardFires) console.log('GUARDFIRE ' + f);
}
main().catch(e => { console.error('GUARDFIRE FAILED:', (e && e.stack) || e); process.exit(1); });
