#!/usr/bin/env node
// muster3-screen-20261101.js — sim-muster3-a longevity screen (STDOUT RUNNER).
//
// Runs the census policy stack with NO herald/muster recorders and
// records ONLY longevity fields per seed. This file is a SCREEN, not
// judged sims: it records no attempts, no field fights, no snapshots,
// no muster verbs, so selection on its output cannot peek at Herald
// content.
//
// STDOUT-RUNNER PATTERN: prints one JSON line per seed to stdout and
// writes nothing itself; scripts/muster3-split-20261101.js (idle
// process) writes the screen file and computes the selection.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 \
//   SEEDS=90101,90102 node scripts/muster3-screen-20261101.js > evidence/2026-11-01/perseed-muster3/screen.stdout 2> evidence/2026-11-01/perseed-muster3/screen.stderr
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

// Pure selection rule (exported for the proof test and the splitter).
// Input rows carry {seed, gameDays, won}. Output: {pilot, confirm,
// tiers} where tiers maps seed -> 'A' | 'B' | 'C'. Tier A: un-won &&
// gameDays >= 120. Tier B: won && gameDays > 120. Tier C: un-won,
// longest gameDays first (only fills what A+B cannot). Within a tier,
// ascending seed order, except tier C which is gameDays-desc then
// seed-asc. Confirm = ALL remaining selected seeds (fixes
// heraldcontact-a's fixed-12 deviation: a pool yielding 19 selectable
// seeds cannot supply a fixed 12 without either dropping selected
// seeds or adding unselected ones).
function selectBand(rows) {
  const tierA = rows.filter(r => !r.won && r.gameDays >= 120).sort((a, b) => a.seed - b.seed);
  const tierB = rows.filter(r => r.won && r.gameDays > 120).sort((a, b) => a.seed - b.seed);
  const tierC = rows.filter(r => !r.won && r.gameDays < 120)
    .sort((a, b) => (b.gameDays - a.gameDays) || (a.seed - b.seed));
  const ordered = tierA.concat(tierB, tierC);
  const pilot = ordered.slice(0, 8).map(r => r.seed);
  const confirm = ordered.slice(8).map(r => r.seed);
  const tiers = {};
  tierA.forEach(r => { tiers[r.seed] = 'A'; });
  tierB.forEach(r => { tiers[r.seed] = 'B'; });
  tierC.forEach(r => { tiers[r.seed] = 'C'; });
  return { pilot, confirm, tiers, tierCounts: { A: tierA.length, B: tierB.length, C: tierC.length } };
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  let endOmenStage = null, endOmenDay = null;
  try {
    const om = (st.titans || {}).omens ? st.titans.omens.herald : null;
    if (om) { endOmenStage = (om.stage != null ? om.stage : null); endOmenDay = (om.day != null ? om.day : null); }
  } catch (e) {}
  let endScaleRank = null;
  try { endScaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  return {
    seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1,
    won: !!Game.won ? 1 : 0, national, table,
    endOmenStage, endOmenDay, endScaleRank,
  };
}

if (require.main === module) (async () => {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT']) {
    if (process.env[k] !== '1') { console.error(`SCREEN STOP: ${k}=1 is required (census policy stack).`); process.exit(2); }
  }
  if (!TF.layerOn()) { console.error('SCREEN STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
  if (!WD.layerOn()) { console.error('SCREEN STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
  if (!SD.layerOn()) { console.error('SCREEN STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
  if (!FD.layerOn()) { console.error('SCREEN STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
  if (!SEEDS.length) { console.error('SCREEN STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify(r));
      console.error(`screen s${seed}: days=${r.gameDays} won=${r.won} end=${r.endReason} maxWave=${r.maxWave} nat=${r.national} table=${r.table} omen=${r.endOmenStage}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();

module.exports = { selectBand, anchor: ANCHOR };
