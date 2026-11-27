#!/usr/bin/env node
// departfit-driver-b.js — departure-fitness measurement driver (arm
// sim-departfit-b, Loop B 20261127, axis winnability-chain).
// One process per seed; never two harnesses in one process. Prints one
// JSON summary line per seed to stdout and writes one per-seed JSON file
// into the OUTDIR leg directory (sims write once, on purpose, into
// evidence/<date>/). Refuses to overwrite an existing per-seed file.
//
// POLICY: competent verbatim (scripts/policies/competent.js). No policy
// variant, no env flags. Instrument:
// scripts/departfit-b-instrument.js stamps HP + weapon + loaded state +
// ammo per party member at every hold/launch departure, PRE-call AND
// POST-call (the post stamp is the true departure loadout).
//
// LEGS (paired, identical seeds, one lever apart): RUN=departfit-b with
// OUTDIR=perseed-departfit-b-ctl (baseline, current master, no lever)
// vs OUTDIR=perseed-departfit-b-arm (lever). The lever is the game code
// on the branch; the driver is identical on both legs.
//
// The driver also counts ammo_craft / weapon_craft telemetry events per
// seed (the double-craft interaction: the check moves the first load
// attempt earlier, startExpedition still calls villagerPocketAmmo
// afterwards) by wrapping Game.tele after setupGame and before runDays
// (runDays wraps tele again and delegates through, chain-safe), and
// snapshots village.departFit counters at the end of the run.
//
// Usage:
//   DAYS=150 SEEDS=111301,...,111308 RUN=departfit-b OUTDIR=evidence/2026-11-27/perseed-departfit-b-ctl node scripts/departfit-driver-b.js
// Determinism re-run: same SEEDS + RUN=departfit-b-rerun into a second
// OUTDIR, then cmp the per-seed files (B5).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'departfit-b-instrument'));
const { writeFileFlapSafe } = require(path.join(REPO, 'scripts', 'muster-b-write'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'departfit-b';
if (!SEEDS.length) { console.error('DEPARTFIT-B STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-27', 'perseed-departfit-b-ctl');
function mkdirRetry(dir) {
  let last = null;
  for (let attempt = 1; attempt <= 30; attempt++) {
    try { fs.mkdirSync(dir, { recursive: true }); return; }
    catch (e) { last = e; if (!/EPERM|EACCES/.test(String(e.code || e.message))) throw e; }
    try { execSync('sleep 10'); } catch (e) {}
  }
  throw last;
}
mkdirRetry(outDir);
for (const seed of SEEDS) {
  const file = path.join(outDir, 'departfit-b-s' + seed + '.json');
  if (fs.existsSync(file)) { console.error('DEPARTFIT-B STOP: refusing to overwrite ' + file); process.exit(3); }
}

async function oneRun(seed) {
  const policy = competent; // policy object (not a factory)
  const { Game } = await loadGame({ seed: seed, mode: 'departfit-b', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);

  // Craft-attempt counting: wrap Game.tele BEFORE runDays (runDays wraps
  // tele again and delegates through this wrapper, chain-safe). Counts
  // ammo_craft + weapon_craft events; the death capture inside runDays
  // is unaffected (it reads the same tele stream).
  const craftCounts = { ammo_craft: 0, ammo_craft_ok: 0, weapon_craft: 0, weapon_craft_ok: 0 };
  try {
    const _origTele = Game.tele;
    Game.tele = function (type, data) {
      try {
        if (type === 'ammo_craft') { craftCounts.ammo_craft++; if (data && data.ok) craftCounts.ammo_craft_ok++; }
        if (type === 'weapon_craft') { craftCounts.weapon_craft++; if (data && data.ok) craftCounts.weapon_craft_ok++; }
      } catch (e) {}
      return _origTele.apply(this, arguments);
    };
  } catch (e) { errors.push('tele-wrap: ' + String(e.message).slice(0, 80)); }

  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let endUnlockedWave = null;
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  let national = 0, table = 0;
  try { const r = scaleRank || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) { errors.push('prog: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { errors.push('standing: ' + String(e.message).slice(0, 80)); }
  let departFit = null;
  try { departFit = ((st.village || {}).departFit) ? JSON.parse(JSON.stringify((st.village || {}).departFit)) : null; } catch (e) { errors.push('departFit: ' + String(e.message).slice(0, 80)); }

  const departs = inst.departs || [];
  const launches = departs.filter(function (d) { return d.result === 'launch'; });
  const holds = departs.filter(function (d) { return d.result === 'hold'; });
  const deaths = (((result || {}).samples || {}).deaths || []).slice();
  const out = {
    seed: seed, arm: 'departfit-b', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    national: national, table: table, standing: standing,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    deaths: deaths,
    departs: departs,
    departCount: departs.length, launchCount: launches.length, holdCount: holds.length,
    stampedComplete: departs.filter(function (d) { return d.complete; }).length,
    stampedCompletePost: departs.filter(function (d) { return d.completePost; }).length,
    instrumentErrors: inst.errors.concat(errors),
    craftCounts: craftCounts,
    departFit: departFit,
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'departfit-b-s' + seed + '.json');
    writeFileFlapSafe(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, standing: out.standing, maxWave: out.maxWave,
      endUnlockedWave: out.endUnlockedWave,
      departs: out.departCount, launches: out.launchCount, holds: out.holdCount,
      stampedComplete: out.stampedComplete, stampedCompletePost: out.stampedCompletePost,
      deaths: out.deaths.length,
      craftCounts: out.craftCounts, departFit: out.departFit,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error('DEPARTFIT-B FATAL: ' + (e && e.stack || e)); process.exit(1); });
