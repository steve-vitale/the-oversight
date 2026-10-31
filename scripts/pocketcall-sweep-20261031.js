#!/usr/bin/env node
// pocketcall-sweep-20261031.js — sim-pocketcall-a single-base census sweep.
// Same seeds, policy stack, horizon and death-aware stop as
// deadfall-sweep-20261031.js (its substrate, staffing ON), PLUS the
// pocket-call census instrument (PCDIAG=1). SINGLE BASE: no baseline
// arm exists — ARM must be 'census' and DEADFALL_B=1 is required.
//   withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))
// + AMMODIAG v1 + SUPPLYDIAG v1 read-only instruments.
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-31/perseed-pocketcall-a/<arm>/s<seed>.json and prints
// a summary. No timestamps or timings are written, so re-runs are
// byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 AMMODIAG=1 SUPPLYDIAG=1 STICKFIBERDIAG=1 \
//   SEEDS=85101,85102 ARM=census DEADFALL_B=1 node scripts/pocketcall-sweep-20261031.js
// ARM defaults to 'baseline'; EVID overrides the output root.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const AD = require(path.join(REPO, 'scripts', 'ammo-diag-20261031'));
const SUP = require(path.join(REPO, 'scripts', 'supply-diag-20261031'));
const SF = require(path.join(REPO, 'scripts', 'stickfiber-diag-20261031'));
const DF = require(path.join(REPO, 'scripts', 'policies', 'deadfall-b'));
const PC = require(path.join(REPO, 'scripts', 'pocketcall-diag-20261031'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'AMMODIAG', 'SUPPLYDIAG', 'STICKFIBERDIAG', 'PCDIAG']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!AD.instrumentOn()) { console.error('SWEEP STOP: AMMODIAG instrument off despite AMMODIAG=1.'); process.exit(2); }
if (!SUP.instrumentOn()) { console.error('SWEEP STOP: SUPPLYDIAG instrument off despite SUPPLYDIAG=1.'); process.exit(2); }
if (!SF.instrumentOn()) { console.error('SWEEP STOP: STICKFIBERDIAG instrument off despite STICKFIBERDIAG=1.'); process.exit(2); }
const ARM_EARLY = process.env.ARM || 'census';
if (ARM_EARLY !== 'census') { console.error('SWEEP STOP: this sweep is single-base; ARM must be census.'); process.exit(2); }
if (process.env.DEADFALL_B !== '1') { console.error('SWEEP STOP: ARM=census requires DEADFALL_B=1 (staffed substrate).'); process.exit(2); }
if (!PC.instrumentOn()) { console.error('SWEEP STOP: PCDIAG instrument off despite PCDIAG=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const ARM = process.env.ARM || 'census';
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-pocketcall-a');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
  return DF.withDeadfall(fd, 'lead-deadfall', 'leadfeast + full-seat stack + deadfall staffing (DEADFALL_B=1 arms it)');
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'deadfall-diag', fullTelemetry: false });
  const t = { fights: [], pocketCalls: [], departures: [], weaponFirstSeen: {}, pocketOverflow: 0, instrumentErrors: [],
    fieldFightCalls: 0, lowWaveFights: 0,
    supplyPocketCalls: [], supplyDaily: [], supplyErrors: [], supplyOverflow: 0, stickfiberRows: [], stickfiberErrors: [],
    pcFights: [], pcDepartures: [], pcErrors: [], pcLowWave: 0 };
  const uninstallAD = AD.install(Game, t);
  const uninstallSUP = SUP.install(Game, t);
  const uninstallSF = SF.install(Game, t);
  const uninstallPC = PC.install(Game, t);

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      const r = policy.daily(Gm, ctx);
      try { AD.scanDay(Gm, t); } catch (e) {}
      try { SUP.scanDay(Gm, t); } catch (e) {}
      try { SF.scanDay(Gm, t); } catch (e) {}
      return r;
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let supplyEnd = null;
  try { supplyEnd = SUP.endCensus(Game); } catch (e) {}
  try { uninstallPC(); } catch (e) {}
  try { uninstallSF(); } catch (e) {}
  try { uninstallSUP(); } catch (e) {}
  try { uninstallAD(); } catch (e) {}
  const st = Game.state || {};
  let national = 0, table = 0, endWave = null, endRank = null;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; endRank = r; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { endWave = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}

  const out = {
    seed, policyId: 'leadfeast', instrument: 'ammodiag-v1+supplydiag-v1+stickfiberdiag-v1+pocketcalldiag-v1', arm: ARM,
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + AMMODIAG=1 + SUPPLYDIAG=1 + STICKFIBERDIAG=1',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    endUnlockedWave: endWave, endScaleRank: endRank,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    fights: t.fights, fightCount: t.fights.length,
    pocketCalls: t.pocketCalls, departures: t.departures, weaponFirstSeen: t.weaponFirstSeen,
    pocketOverflow: t.pocketOverflow,
    fieldFightCalls: t.fieldFightCalls, lowWaveFights: t.lowWaveFights,
    supplyPocketCalls: t.supplyPocketCalls, supplyDaily: t.supplyDaily, supplyEnd: supplyEnd,
    supplyOverflow: t.supplyOverflow, stickfiberRows: t.stickfiberRows,
    deadfallHauls: Game._deadfallHauls || 0, deadfallSticks: Game._deadfallSticks || 0, deadfallFiber: Game._deadfallFiber || 0,
    pcFights: t.pcFights, pcDepartures: t.pcDepartures, pcLowWave: t.pcLowWave, pcErrors: t.pcErrors,
    deaths, hashes,
    instrumentErrors: t.instrumentErrors, supplyErrors: t.supplyErrors, stickfiberErrors: t.stickfiberErrors,
  };
  const dir = path.join(EVID, ARM);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  const fc = {};
  for (const f of t.fights) fc[f.outcome] = (fc[f.outcome] || 0) + 1;
  return { out, fc };
}

(async () => {
  for (const seed of SEEDS) {
    try {
      const { out, fc } = await oneRun(seed);
      console.log(`done s${seed}: maxWave=${out.maxWave} fights=${out.fightCount} ${JSON.stringify(fc)} nat=${out.national} table=${out.table} won=${out.won} end=${out.endReason} days=${out.gameDays} errs=${out.instrumentErrors.length}/${out.supplyErrors.length}/${out.stickfiberErrors.length}/${out.pcErrors.length} calls=${out.fieldFightCalls} pockets=${out.pocketCalls.length} supplyPockets=${out.supplyPocketCalls.length} pcFights=${out.pcFights.length} pcDeps=${out.pcDepartures.length}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
