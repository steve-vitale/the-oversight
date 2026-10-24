#!/usr/bin/env node
// sim-rerunclock-wallseg-sweep.js — RERUN-CLOCK census on the WALLSEG STACK
// (arm sim-rerunclock-wallseg, run fleshout-20261024T1347Z, axis
// scale-onramp). Retry of the 1215Z run's never-started arm. DIAG arm:
// instrument-only, ZERO src/js changes, ZERO daysPerTier override (the
// L887 pacing lever belongs to the gap loop, not this arm).
//
// Question: on the wallseg stack where doors exist, is the post-door
// killer the rerun clock or a single apex fight? (sim-rerunclock's named
// next; sim-postunlock2-b established 4/4 door villages lost 48-63d
// post-door; L887 names the tier-6 rerun grind.)
//
// Substrate (pinned, exact — same as wallseg/postunlock2-b):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1
//   LINKFORM=2
// Policy: policyFor() from scripts/wallseg-sweep.js (read-only reuse —
// its checkEnv gate runs on require and stops the sweep unless the
// pinned substrate holds). Instruments (read-only reuse): scripts/
// postunlock-instrument.js (fights/deaths/unlock/say-ring) +
// scripts/sim-rerunclock-instrument.js (daily overtime-tier trace +
// pre-registered killer-class rule) + the gap-W2 attribution instrument
// (scripts/analyze-postunlock-deaths.js / sim-instrument-kit.js, applied
// OFFLINE by the analyzer, never in the sweep) + the door-bar wrapper in
// scripts/sim-rerunclock-wallseg-instrument.js (this arm, new).
//
// PRE-REGISTRATION (binding, MEASUREMENT.md §14 — written in the
// evidence header BEFORE this sweep ran; the sweep only executes it):
//   Pilot seeds: FRESH band 73201-73208 x {leadfeast, belongfeast} = 16
//     configs. BOTH policies run even though postunlock2-b found
//     lead/belong byte-identical on 708xx — identity/divergence is
//     reported, never leaned on.
//   Extension rule (decided now): if door-open configs number <2 after
//     the pilot, extend to 73209-73216 x 2 policies (16 more). If still
//     <2, verdict is NO-GO (population too thin).
//   PRIMARY: census complete AND every door-open config window-attributed
//     (door day, days post-door to lost/cap, overtime tier trajectory
//     1..6 with days-at-tier, rerun counts all/w4/w5/post-door, killer
//     class per the rerunclock rule) AND verdict named (rerun-clock iff a
//     majority of LOST door configs classify rerun-clock; single-apex iff
//     a majority classify single-apex; otherwise mixed/other).
//     GO iff >=2 door-open configs attributed AND verdict named.
//   Secondary (reported, NOT judged): door-reproduction on current master
//     — the 8 known wallseg door configs (70201/70202/70204/70209 x
//     lead/belong), reported as doors reproduced /8. If doors don't
//     reproduce, the gap-loop pacing pilot is UNTESTABLE, not NO-GO.
//     The 702xx configs are NEVER the primary population.
//   Horizon: 180d death-aware (dead villages stop, +10d tail max).
//
// Sweep outputs to the worktree evidence dir, NEVER /tmp. Per-seed writes
// go through the proven fresh-process chunked writer scripts/
// sim-postunlock2-b-writer.js (read-only reuse) because the container
// EPERM write flap kills large in-process writes (postunlock2-b lesson).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 \
//   node scripts/sim-rerunclock-wallseg-sweep.js [SEEDS=73201,73202 EVID=... DAYS=180]
//   SENSE_SEED=73211 SENSE_POLICY=lead ... (narration:true replay, writes
//   sim-rerunclock-wallseg-sense.txt; MARKED NON-MEASURED, never enters
//   the census — the analyzer reads only s<seed>-<policy>.json files)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
const RI = require(path.join(REPO, 'scripts', 'sim-rerunclock-instrument'));
const WI = require(path.join(REPO, 'scripts', 'sim-rerunclock-wallseg-instrument'));
// NOTE: requiring wallseg-sweep runs its checkEnv() gate at load time —
// the pinned-substrate guard. If the env is wrong this require exits(2)
// before any sim runs. policyFor/policyTag/normBase are read-only reuse.
const WS = require(path.join(REPO, 'scripts', 'wallseg-sweep'));

const PILOT_SEEDS = [73201, 73202, 73203, 73204, 73205, 73206, 73207, 73208];
const EXT_SEEDS = [73209, 73210, 73211, 73212, 73213, 73214, 73215, 73216];
const DOOR_REPRO_SEEDS = [70201, 70202, 70204, 70209];
const ALL_BAND = PILOT_SEEDS.concat(EXT_SEEDS).concat(DOOR_REPRO_SEEDS);
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : PILOT_SEEDS.slice()).filter(Number.isFinite);
for (const s of SEEDS) {
  if (ALL_BAND.indexOf(s) < 0) { console.error(`SWEEP STOP: seed ${s} is outside this arm's bands (73201-73216 pilot+extension, 70201/70202/70204/70209 secondary).`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
for (const b of POLICIES) {
  if (b !== 'lead' && b !== 'belong') { console.error(`SWEEP STOP: unrecognized POLICIES entry "${b}".`); process.exit(2); }
}
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-rerunclock-wallseg');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'sim-rerunclock-wallseg-sweep-runlog.txt');
function logLine(s) {
  console.log(s);
  try { fs.appendFileSync(RUNLOG, new Date().toISOString() + ' ' + s + '\n'); } catch (e) {}
}
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function seedFile(seed, base) { return path.join(EVID, `s${seed}-${base}.json`); }
function payloadComplete(d, seed, base, anchor) {
  // NOTE (resume bug fixed post-secondary): saved files carry
  // WS.normBase(base) ('leadfeast'/'belongfeast'), while seedFile() and
  // the main loop use the raw base ('lead'/'belong'). Comparing against
  // the raw base made resume NEVER skip — the secondary sweep re-ran
  // s70201-lead after its first run's exec was aborted. Normalize here.
  return d && d.seed === seed && d.base === WS.normBase(base) && d.anchorCommit === anchor &&
    Array.isArray(d.rerunclockDaily) && d.rerunclockDaily.length > 0 &&
    Array.isArray(d.doorBars) && d.doorBars.length > 0 &&
    Array.isArray(d.postunlockDeaths) && Array.isArray(d.postunlockFights) &&
    d.unlock && ('w4Day' in d.unlock) && ('w5Day' in d.unlock) &&
    d.trajectory && d.trajectory.trajectoryComplete;
}

async function oneRun(seed, base, opts) {
  opts = opts || {};
  const write = opts.write !== false;
  const days = opts.days || DAYS;
  const evidDir = opts.evidDir || EVID;
  const narration = !!opts.narration;
  const t = {};
  const { Game } = await loadGame({ seed, mode: 'wallseg', fullTelemetry: false, narration });
  const uninstall = PI.install(Game, t);
  const rawPolicy = WS.policyFor(base);
  const policy = WI.wrapPolicyWithBars(rawPolicy, t);
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
  const doorSnap = WI.snapshotAtDoor(t.doorBars, t.unlock ? t.unlock.w5Day : null);
  const eulogyCascade = WI.eulogyCascadeCount(t.postunlockDeaths, traj.windowOpen);
  let sayRing = t.sayRing || [];
  if (sayRing.length > 400) sayRing = sayRing.slice(sayRing.length - 400);

  const out = { seed, base: WS.normBase(base), policyId: WS.policyTag(base),
    instrument: 'wallseg policyFor + postunlock-instrument fights/deaths + rerunclock daily tier trace + door-bar snapshots (read-only)',
    substrate: 'pinned wallseg: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 — NO daysPerTier override (L887 lever belongs to the gap loop)',
    anchorCommit: ANCHOR, priorCensus: 'sim-postunlock2-b (708xx, wallseg stack): 4/32 doors, all lost 48-63d post-door at tier 6; sim-rerunclock (731xx, pure competent): 0/16 doors, tier 0 throughout',
    unlock: t.unlock || { w4Day: null, w5Day: null },
    maxWave, national, table, won, exiled,
    days: result.days, endReason: result.endReason,
    trajectory: traj,
    doorSnapshot: doorSnap,
    eulogyCascadePostWindow: eulogyCascade,
    nRerunclockDaily: (t.rerunclockDaily || []).length, rerunclockDaily: t.rerunclockDaily || [],
    nDoorBars: (t.doorBars || []).length, doorBars: t.doorBars || [],
    rerunclockErrors: t.rerunclockErrors || [],
    doorBarErrors: t.doorBarErrors || [],
    nPostunlockDeaths: (t.postunlockDeaths || []).length, postunlockDeaths: t.postunlockDeaths || [],
    nPostunlockFights: (t.postunlockFights || []).length, postunlockFights: t.postunlockFights || [],
    nSayRing: sayRing.length, sayRing,
    sayLive: !!t.sayLive,
    instrumentErrors: t.instrumentErrors || [] };
  if (write) {
    fs.mkdirSync(evidDir, { recursive: true });
    const fn = seedFile(seed, base);
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
  // SENSE mode: narration:true replay of one config; transcript file only.
  if (process.env.SENSE_SEED) {
    const sSeed = parseInt(process.env.SENSE_SEED, 10);
    const sBase = process.env.SENSE_POLICY || 'lead';
    const r = await oneRun(sSeed, sBase, { write: false, narration: true });
    const ring = r.sayRing || [];
    const dayRange = ring.length ? `${ring[0].day}..${ring[ring.length - 1].day}` : 'empty';
    const header = [
      'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
      `seed=${sSeed} policy=${sBase} days=${r.days} endReason=${r.endReason} maxWave=${r.maxWave} w4Day=${r.unlock.w4Day} w5Day=${r.unlock.w5Day} nationalDay=${r.trajectory.nationalDay} windowOpen=${r.trajectory.windowOpen} tierAtEnd=${r.trajectory.tierAtEnd} rerunAll=${r.trajectory.rerun.all} rerunPostWindow=${r.trajectory.rerun.postWindow} killerClass=${r.trajectory.killerClass} eulogyCascade=${r.eulogyCascadePostWindow} sayLive=${r.sayLive} ringLines=${ring.length} ringDayRange=${dayRange}`,
      '',
    ].join('\n');
    const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
    const outPath = path.join(EVID, 'sim-rerunclock-wallseg-sense.txt');
    fs.writeFileSync(outPath, body);
    console.log(`SENSE-DONE seed=${sSeed} policy=${sBase} end=${r.endReason} w5Day=${r.unlock.w5Day} tierAtEnd=${r.trajectory.tierAtEnd} sayLive=${r.sayLive} ring=${ring.length} -> ${outPath}`);
    return;
  }
  const rows = [];
  for (const s of SEEDS) {
    for (const b of POLICIES) {
      const fn = seedFile(s, b);
      let skip = false;
      if (fs.existsSync(fn)) {
        try { const d = JSON.parse(fs.readFileSync(fn, 'utf8')); if (payloadComplete(d, s, b, ANCHOR)) { skip = true; logLine(`skip ${s}-${b} (resume, anchor ${ANCHOR})`); } } catch (e) {}
      }
      if (skip) { rows.push({ seed: s, base: b, skipped: true }); continue; }
      const r = await oneRun(s, b);
      rows.push({ seed: r.seed, base: r.base, w4Day: r.unlock.w4Day, w5Day: r.unlock.w5Day, days: r.days, endReason: r.endReason, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, qualifying: r.trajectory.qualifying, nationalDay: r.trajectory.nationalDay, tierAtEnd: r.trajectory.tierAtEnd, rerunAll: r.trajectory.rerun.all, rerunWindow: r.trajectory.rerun.postWindow, killerClass: r.trajectory.killerClass, eulogyCascade: r.eulogyCascadePostWindow, instrumentErrors: (r.instrumentErrors || []).length });
      logLine(JSON.stringify(rows[rows.length - 1]));
    }
  }
  logLine('SIM-RERUNCLOCK-WALLSEG-SWEEP-DONE ' + JSON.stringify({ seeds: SEEDS, policies: POLICIES, anchor: ANCHOR }));
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun, seedFile, payloadComplete, PILOT_SEEDS, EXT_SEEDS, DOOR_REPRO_SEEDS, SEEDS, POLICIES, ANCHOR };
