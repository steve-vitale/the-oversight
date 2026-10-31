#!/usr/bin/env node
// heraldpos-detgate-run-20261031.js — recorder-OFF leg of the
// sim-heraldpos-a trajectory det-gate (seed 87127).
//
// Runs the heraldpos policy stack with NO recorders installed
// (no herald instrument, no muster diag, no position instrument)
// and prints trajectory fields + daily dayHash hashes to stdout.
// No file writes at all, so it runs cleanly during the EPERM flap.
// The parent (heraldpos-detgate-20261031.js) compares this output
// against the recorder-ON sweep's stdout for the same seed.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT']) {
  if (process.env[k] !== '1') { console.error(`DETGATE STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEED = parseInt(process.env.SEEDS || '87127', 10) || 87127;

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

(async () => {
  const policy = policyFor();
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  let w4Day = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      try {
        if (w4Day === null && typeof Gm.unlockedWave === 'function' && (Gm.unlockedWave() | 0) >= 4) w4Day = Gm.state.scholar.day;
      } catch (e) {}
      return policy.daily(Gm, ctx);
    },
  });
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: 200, manifest: undefined, sampleEvery: 30 }); });
  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let endOmenStage = null, endOmenDay = null;
  try {
    const om = ((st.titans || {}).omens || {}).herald;
    if (om) { endOmenStage = om.stage != null ? om.stage : null; endOmenDay = om.day != null ? om.day : null; }
  } catch (e) {}
  console.log(JSON.stringify({
    seed: SEED, gameDays: (st.scholar && st.scholar.day) || 0, won: won,
    national: national, table: table, maxWave: result.maxWaveUnlocked || 1,
    w4Day: w4Day, endReason: result.endReason,
    endOmenStage: endOmenStage, endOmenDay: endOmenDay, hashes: hashes,
  }));
})();
