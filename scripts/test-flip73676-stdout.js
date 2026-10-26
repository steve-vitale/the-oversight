#!/usr/bin/env node
// scripts/test-flip73676-stdout.js — sim-flip73676-a guard-mode runner.
//
// Runs seed 73676 under the tableseat-nowait substrate and prints
// ONLY the endpoint row to stdout (no file writes), so it works
// even during the container EPERM flap that blocks node/shell
// disk writes. The mode argument names the guard STRIPPED in
// memory from the disk tree's game.js (which must already contain
// both e68a15e5f guards, as HEAD does):
//
//   both   — strip neither (both guards active)
//   plant  — strip the plant guard only (animal guard active)
//   animal — strip the animal guard only (plant guard active)
//   none   — strip both guards
//
// Measured 73676 endpoints (the script asserts nothing, it prints):
//   on the e8f2ccad7 engine state (r52 3-file set restored):
//     both 160d won / 55, plant 156d lost / 64,
//     animal 160d won / 55, none 156d lost / 64.
//   on current HEAD (806ef430e, r52 fixes in):
//     both 144d won / 43, plant 147d lost / 52,
//     animal 144d won / 43, none 147d lost / 52.
// On BOTH bases the plant guard alone decides win/loss on this
// seed and the animal guard is inert (both == animal, plant == none).
// Endpoints are base-relative: never compare a mode row across
// bases without stating the base.
// The strip is the exact inverse of the e68a15e5f hunk, applied to
// the in-memory source via an fs.readFileSync patch before the
// harness loads; the disk tree is never touched.
//
// Usage: node scripts/test-flip73676-stdout.js <both|plant|animal|none>
'use strict';
const fs = require('fs');
const origRead = fs.readFileSync;
const mode = process.argv[2] || 'both';
if (['both', 'plant', 'animal', 'none'].indexOf(mode) < 0) {
  console.error('usage: test-flip73676-stdout.js <both|plant|animal|none>');
  process.exit(2);
}
// Guards to STRIP for each mode (guards ACTIVE are the complement).
const stripAnimal = (mode === 'animal' || mode === 'none');
const stripPlant = (mode === 'plant' || mode === 'none');
fs.readFileSync = function (p, enc) {
  const s = origRead.apply(this, arguments);
  if (typeof p === 'string' && p.endsWith('src/js/game.js') && typeof s === 'string') {
    let out = s;
    if (stripAnimal) {
      const oldBlock = '          // DEAD TEACHERS DON\'T TEACH (journey crisis r51 2026-10-26): the\n'
        + '          // story is told by its learner — a dead learner tells no stories.\n'
        + '          let aTeacherDead = false;\n'
        + '          try { const avp = this.vpOf ? this.vpOf(vAnim[aid].learnedBy) : null; aTeacherDead = !!(avp && avp.dead); } catch (e) {}\n'
        + "          if (!aTeacherDead && this.grantKnowledge('animal', aid, 1, { type: 'taught', by: teacher })) {";
      const newLine = "          if (this.grantKnowledge('animal', aid, 1, { type: 'taught', by: teacher })) {";
      if (out.split(oldBlock).length !== 2) throw new Error('animal guard anchor count != 1');
      out = out.replace(oldBlock, newLine);
    }
    if (stripPlant) {
      const oldBlock = '      // DEAD TEACHERS DON\'T TEACH (journey crisis r51 2026-10-26): the queue\n'
        + '      // is written while the discoverer lives but drains later — a\n'
        + '      // discoverer who died in between (e.g. on a sortie) was still voiced\n'
        + '      // at the fire. Skip the lesson and leave the entry untaught, so a\n'
        + '      // later call may pick another entry; no deed credit for the dead.\n'
        + '      try {\n'
        + '        const dvp = this.vpOf ? this.vpOf(entry.discoveredBy) : null;\n'
        + '        if (dvp && dvp.dead) return;\n'
        + '      } catch (e) {}\n';
      if (out.split(oldBlock).length !== 2) throw new Error('plant guard anchor count != 1');
      out = out.replace(oldBlock, '');
    }
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
  const { Game, loadFails } = await loadGame({ seed, mode: 'flip73676-stdout-' + mode, fullTelemetry: false });
  if (loadFails && loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(Game);
  const result = await runDays(Game, tableseatNowait, { days: 180, manifest: undefined, sampleEvery: 1 });
  let arc = 1, te = false, rank = 'village', won = false;
  try { won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; arc = pg.arc || 1; te = !!pg.tableDone; } catch (e) {}
  try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  const deaths = result.samples.deaths || [];
  const map = {};
  for (const d of deaths) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    map[k] = (map[k] || 0) + 1;
  }
  console.log(JSON.stringify({
    cfg: 'mode=' + mode, seed, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason, won: won ? 1 : 0, arc, rank,
    tableEntered: te ? 1 : 0, deathTotal: deaths.length, deaths: map,
  }));
}
main().catch(e => { console.error('STDOUT-RUN FAILED:', (e && e.stack) || e); process.exit(1); });
