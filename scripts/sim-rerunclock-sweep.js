#!/usr/bin/env node
// sim-rerunclock-sweep.js — RERUN-CLOCK census on CURRENT master (arm
// sim-rerunclock, axis scale-onramp). DIAG arm: instrument-only, ZERO
// src/js changes, ZERO policy changes (the pure scripts/policies/
// competent.js policy is used as-is; the only wrapper is the read-only
// daily trace in scripts/sim-rerunclock-instrument.js plus the proven
// scripts/postunlock-instrument.js, both read-only recorders).
//
// PRE-REGISTRATION (binding, MEASUREMENT.md §14 — written in the
// evidence header BEFORE this sweep ran; the sweep below only executes
// it, never revises it):
//   POLICY: pure competent (scripts/policies/competent.js, no env-gated
//     levers, no wallseg/trustbuffer/vetformation stack). This is a
//     DELIBERATE substrate difference from sim-postunlock2-b (wallseg
//     stack, 708xx): comparisons to postunlock2-b are RATE-LEVEL and
//     failure-mode-level only, never matched-config.
//   SEEDS: FRESH band 73101-73108 x competent = 8 configs (pilot).
//     Verified unused at run start: no exact s7310[1-8] / -7310[1-8].json
//     filename anywhere in this worktree's evidence/ tree, and no 7310x
//     hit in evidence/2026-10-24/ content. (719/709/710-style collisions
//     are small-seed filenames, not this 5-digit band.)
//   HORIZON: 180d death-aware (dead villages stop; never a fixed 200d).
//   EXTENSION RULE (decided now, not mid-run): if qualifying configs
//     (national==1 OR door w5Day!=null) number < 2 after the pilot,
//     extend to 73109-73116 (8 more configs, same policy). If >= 2, the
//     pilot stands as the census.
//   DIAG-GO BAR (binding): census complete (every planned config
//     present) AND overtime-tier trajectory + rerun-fight counts named
//     for EVERY door-open / national-reached config, with a verdict
//     naming whether the rerun clock or a single apex fight is the
//     post-door killer. A miss is NO-GO, never re-scored mid-run.
//   CENSUS VERDICT RULE (pre-registered, in the instrument): the
//     census verdict is 'rerun-clock' iff a majority of LOST qualifying
//     configs classify rerun-clock; 'single-apex' iff a majority classify
//     single-apex; otherwise 'mixed/other' (or 'no lost qualifying
//     configs' / 'no qualifying configs' when those populations are
//     empty — those are findings, not failures of the rule).
//
// Sweep outputs to the worktree evidence dir, NEVER /tmp (the sibling
// /tmp wipe class, AGENTS.md 2026-10-23). Per-seed writes go through the
// proven fresh-process chunked writer scripts/sim-postunlock2-b-
// writer.js (read-only reuse; it takes the path as argv and the JSON
// body on stdin) because the container EPERM write flap kills large
// in-process writes from game-loaded processes (postunlock2-b lesson).
//
// Usage:
//   node scripts/sim-rerunclock-sweep.js [SEEDS=73101,73102 EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
const RI = require(path.join(REPO, 'scripts', 'sim-rerunclock-instrument'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const BAND_SEEDS = [73101, 73102, 73103, 73104, 73105, 73106, 73107, 73108,
  73109, 73110, 73111, 73112, 73113, 73114, 73115, 73116];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : BAND_SEEDS.slice(0, 8)).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BAND_SEEDS.indexOf(s) < 0) { console.error(`SWEEP STOP: seed ${s} is outside the fresh 731xx band (73101-73116).`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-rerunclock');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'sim-rerunclock-sweep-runlog.txt');
function logLine(s) {
  console.log(s);
  try { fs.appendFileSync(RUNLOG, new Date().toISOString() + ' ' + s + '\n'); } catch (e) {}
}
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function seedFile(seed) { return path.join(EVID, `s${seed}-competent.json`); }
function payloadComplete(d, seed, anchor) {
  return d && d.seed === seed && d.anchorCommit === anchor &&
    Array.isArray(d.rerunclockDaily) && d.rerunclockDaily.length > 0 &&
    Array.isArray(d.postunlockDeaths) && Array.isArray(d.postunlockFights) &&
    d.unlock && ('w4Day' in d.unlock) && ('w5Day' in d.unlock);
}

async function oneRun(seed, opts) {
  opts = opts || {};
  const write = opts.write !== false;
  const days = opts.days || DAYS;
  const evidDir = opts.evidDir || EVID;
  const t = {};
  const { Game } = await loadGame({ seed, mode: 'rerunclock', fullTelemetry: false });
  const uninstall = PI.install(Game, t);
  const policy = RI.wrapPolicy(competent, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { t.instrumentErrors.push('uninstall: ' + String((e && e.message) || e)); }

  const st = Game.state || {};
  let national = 0, table = 0, exiled = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const traj = RI.deriveTrajectory(t.rerunclockDaily, t.postunlockFights, t.postunlockDeaths, t.unlock,
    { endReason: result.endReason, days: result.days, national });
  let sayRing = t.sayRing || [];
  if (t.unlock && t.unlock.w5Day != null) sayRing = sayRing.filter(s => s && s.day >= t.unlock.w5Day - 14);
  if (sayRing.length > 400) sayRing = sayRing.slice(sayRing.length - 400);

  const out = { seed, base: 'competent', policyId: 'competent',
    instrument: 'sim-rerunclock-instrument daily overtime-tier trace + postunlock-instrument fights/deaths (read-only)',
    substrate: 'PURE competent policy, no env-gated levers (deliberate difference from postunlock2-b wallseg stack)',
    anchorCommit: ANCHOR, priorCensus: 'sim-postunlock2-b (73d344a87/7ee04fd0f lineage): wallseg stack, 708xx, 4/32 doors, all lost 48-63d post-door at tier 6',
    unlock: t.unlock || { w4Day: null, w5Day: null },
    maxWave, national, table, won, exiled,
    days: result.days, endReason: result.endReason,
    trajectory: traj,
    nRerunclockDaily: (t.rerunclockDaily || []).length, rerunclockDaily: t.rerunclockDaily || [],
    rerunclockErrors: t.rerunclockErrors || [],
    nPostunlockDeaths: (t.postunlockDeaths || []).length, postunlockDeaths: t.postunlockDeaths || [],
    nPostunlockFights: (t.postunlockFights || []).length, postunlockFights: t.postunlockFights || [],
    nSayRing: sayRing.length, sayRing,
    sayLive: !!t.sayLive,
    instrumentErrors: t.instrumentErrors || [] };
  if (write) {
    fs.mkdirSync(evidDir, { recursive: true });
    const fn = seedFile(seed);
    const body = JSON.stringify(out, null, 1) + '\n';
    let wrote = false, lastErr = null;
    for (let attempt = 0; attempt < 10 && !wrote; attempt++) {
      try {
        const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), fn], { input: body, encoding: 'utf8', timeout: 300000 });
        if (r.error) throw r.error;
        if (r.status !== 0) throw new Error(`writer exit ${r.status}: ${(r.stderr || '').trim()}`);
        wrote = true;
      } catch (e) {
        lastErr = e;
        const waitMs = Math.min(60000, 2000 * Math.pow(2, attempt));
        logLine(`WRITE-RETRY ${fn} attempt ${attempt + 1}/10: ${String((e && e.message) || e)}; waiting ${waitMs}ms`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
      }
    }
    if (!wrote) { console.error(`WRITE-DENIAL after 10 child-writer attempts for ${fn}: ${String((lastErr && lastErr.message) || lastErr)}`); process.exit(3); }
  }
  return out;
}

async function main() {
  const rows = [];
  for (const s of SEEDS) {
    const fn = seedFile(s);
    let skip = false;
    if (fs.existsSync(fn)) {
      try { const d = JSON.parse(fs.readFileSync(fn, 'utf8')); if (payloadComplete(d, s, ANCHOR)) { skip = true; logLine(`skip ${s} (resume, anchor ${ANCHOR})`); } } catch (e) {}
    }
    if (skip) { rows.push({ seed: s, skipped: true }); continue; }
    const r = await oneRun(s);
    rows.push({ seed: r.seed, w4Day: r.unlock.w4Day, w5Day: r.unlock.w5Day, days: r.days, endReason: r.endReason, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, qualifying: r.trajectory.qualifying, nationalDay: r.trajectory.nationalDay, tierAtEnd: r.trajectory.tierAtEnd, rerunAll: r.trajectory.rerun.all, rerunWindow: r.trajectory.rerun.postWindow, killerClass: r.trajectory.killerClass, instrumentErrors: (r.instrumentErrors || []).length });
    logLine(JSON.stringify(rows[rows.length - 1]));
  }
  logLine('SIM-RERUNCLOCK-SWEEP-DONE ' + JSON.stringify({ seeds: SEEDS, anchor: ANCHOR }));
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun, seedFile, payloadComplete, BAND_SEEDS, SEEDS, ANCHOR };
