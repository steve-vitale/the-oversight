#!/usr/bin/env node
// sim-postunlock2-b-sweep.js — POST-UNLOCK door census on CURRENT master
// (flesh-out loop arm sim-postunlock2-b, axis scale-onramp, run
// fleshout-20261024T0925Z). DIAG arm: instrument-side, ZERO src/js changes.
// Namespace sim-postunlock2-b-* (new files only; the proven
// scripts/postunlock-instrument.js is REQUIRED read-only, never edited,
// and the identical wallseg policy objects come from
// scripts/wallseg-sweep.js policyFor(), also read-only).
//
// BRIEF (postunlock-b's proposed revision, now pre-registered): re-measure
// the door census on current master FIRST (fresh seed band, same
// substrate+policies); attribute post-unlock deaths only on the band that
// actually opens. Master moved be55cfc2c -> 73d344a87 (incl. journey-scale
// r28) since postunlock-b's rebase census (2/8 doors on be55cfc2c).
//
// FRESH SEED BAND: 70801-70808 x {leadfeast, belongfeast} = 16 configs
// (pilot). Verified unused: no 7080x seed or s708xx filename anywhere in
// this worktree's evidence/ tree at run start (701xx aidcrisis, 702xx
// wallseg/postunlock, 705xx vetcontact are the live bands; 703/706/710xx
// appear only as bare old seeds in 2026-10-13/15 corpora, never as a
// 708xx band). Sibling worktrees are never touched; filenames here live
// under evidence/2026-10-24/perseed-postunlock2-b/, disjoint by
// construction from every sibling corpus dir name.
// Substrate (pinned, identical to postunlock-b / wallseg):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1
//   LINKFORM=2
// Horizon: 180d death-aware (dead villages stop; +10d tail max is the
// harness's own endReason behavior — never a fixed 200d).
//
// EXTENSION RULE (pre-registered, decided now not mid-run): if door-open
// configs number <4 after the pilot, extend to 12-16 seeds per policy
// (SEEDS env, same band family 70809+) to gain post-unlock attribution
// power; if >=4, the pilot stands as the census.
//
// Sweep outputs to the worktree evidence dir, NEVER /tmp.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 \
//   node scripts/sim-postunlock2-b-sweep.js [SEEDS=70801,70802 POLICIES=lead EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

// Pinned-substrate env guard: wallseg-sweep runs checkEnv() at module
// scope (see its header). Requiring it enforces the identical substrate.
const WS = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));

// FRESH-BAND GATE: only 708xx seeds. Any other seed is a loud stop —
// reusing a live run's band would corrupt the census this run exists to
// re-baseline.
const BAND_SEEDS = [70801, 70802, 70803, 70804, 70805, 70806, 70807, 70808,
  70809, 70810, 70811, 70812, 70813, 70814, 70815, 70816];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : BAND_SEEDS.slice(0, 8)).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BAND_SEEDS.indexOf(s) < 0) { console.error(`SWEEP STOP: seed ${s} is outside the fresh 708xx band (70801-70816).`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock2-b');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'sim-postunlock2-b-sweep-runlog.txt');
function logLine(s) {
  console.log(s);
  try { fs.appendFileSync(RUNLOG, new Date().toISOString() + ' ' + s + '\n'); } catch (e) {}
}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`);
  process.exit(2);
}
function seedFile(seed, base) {
  return path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`);
}

function payloadComplete(d, seed, anchor) {
  return d && d.seed === seed && d.anchorCommit === anchor &&
    Array.isArray(d.postunlockDeaths) && Array.isArray(d.postunlockFights) &&
    Array.isArray(d.waveKillLog) && d.unlock && d.unlock.w5Day != null;
}
// NOTE: payloadComplete requires w5Day != null, which the postunlock-b
// sweep used as its "complete" signal — but on a census where most configs
// NEVER open, that predicate would re-run every non-door config on resume.
// For THIS census, completeness is: anchor matches AND the instrument
// arrays exist AND unlock was polled (w4Day/w5Day keys present, even if
// null). Keep the original predicate name for the test's sake but use
// the census-correct version here.
function payloadCompleteCensus(d, seed, anchor) {
  return d && d.seed === seed && d.anchorCommit === anchor &&
    Array.isArray(d.postunlockDeaths) && Array.isArray(d.postunlockFights) &&
    Array.isArray(d.waveKillLog) && d.unlock && ('w4Day' in d.unlock) && ('w5Day' in d.unlock);
}

async function oneRun(seed, base, opts) {
  opts = opts || {};
  const write = opts.write !== false;
  const days = opts.days || DAYS;
  const evidDir = opts.evidDir || EVID;
  const policy = WS.policyFor(base);
  const nb = normBase(base);
  const t = {};
  const { Game } = await loadGame({ seed, mode: 'wallseg', fullTelemetry: false });
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { t.instrumentErrors.push('uninstall: ' + String((e && e.message) || e)); }

  const st = Game.state || {};
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  let national = 0, table = 0, exiled = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;

  const deaths = {};
  let starvation = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starvation++;
    }
  } catch (e) { t.instrumentErrors.push('deaths: ' + String((e && e.message) || e)); }

  let waveKillLog = [];
  try {
    waveKillLog = (st.waveKillLog || []).map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { t.instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  const w5Day = t.unlock ? t.unlock.w5Day : null;
  let sayRing = t.sayRing || [];
  if (w5Day != null) sayRing = sayRing.filter(s => s && s.day >= w5Day - 14);
  if (sayRing.length > 400) sayRing = sayRing.slice(sayRing.length - 400);

  const out = {
    seed, base: nb, policyId: policy.id,
    instrument: 'postunlock-instrument (per-death rows + fight composition + overtime tier + say-ring)',
    substrate: 'pinned: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 — fresh-band door census on current master (postunlock-b revision)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2',
    anchorCommit: ANCHOR,
    wallsegAnchor: 'c76a52480b09',
    priorCensus: 'postunlock-b rebase anchor 071b00b26 on be55cfc2c: 2/8 doors',
    unlock: t.unlock || { w4Day: null, w5Day: null },
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    deaths, starvation,
    nWaveKillLog: waveKillLog.length, waveKillLog,
    nPostunlockDeaths: (t.postunlockDeaths || []).length, postunlockDeaths: t.postunlockDeaths || [],
    nPostunlockFights: (t.postunlockFights || []).length, postunlockFights: t.postunlockFights || [],
    nSayRing: sayRing.length, sayRing,
    sayLive: !!t.sayLive,
    instrumentErrors: t.instrumentErrors || [],
  };
  if (write) {
    fs.mkdirSync(evidDir, { recursive: true });
    const fn = seedFile(seed, nb);
    const body = JSON.stringify(out, null, 1) + '\n';
    // EPERM-FLAP WORKAROUND (2026-10-24, this arm): the game-loaded
    // sweep process hits EPERM on every large per-seed writeFileSync
    // (10 consecutive failures across two processes), while fresh node
    // processes write the identical body to the identical path fine
    // and the sweep's own small runlog appends succeed. Delegate each
    // per-seed write to a fresh child (scripts/sim-postunlock2-b-
    // writer.js) that never loads game code; retry the spawn with
    // backoff. Never force ref surgery; never silently drop a config.
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
    for (const b of BASES) {
      const fn = seedFile(s, b);
      let skip = false;
      if (fs.existsSync(fn)) {
        try {
          const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
          if (payloadCompleteCensus(d, s, ANCHOR)) { skip = true; logLine(`skip ${s}-${b} (resume, anchor ${ANCHOR})`); }
        } catch (e) {}
      }
      if (skip) { rows.push({ seed: s, base: b, skipped: true }); continue; }
      const r = await oneRun(s, b);
      const lastDeathDay = (r.postunlockDeaths || []).reduce((m, dr) => Math.max(m, dr.day | 0), -1);
      rows.push({ seed: r.seed, base: r.base, w4Day: r.unlock.w4Day, w5Day: r.unlock.w5Day, days: r.days, endReason: r.endReason, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, nDeaths: r.nPostunlockDeaths, nFights: r.nPostunlockFights, lastDeathDay, instrumentErrors: (r.instrumentErrors || []).length });
      logLine(JSON.stringify(rows[rows.length - 1]));
    }
  }
  logLine('SIM-POSTUNLOCK2-B-SWEEP-DONE ' + JSON.stringify({ seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun, normBase, seedFile, payloadComplete, payloadCompleteCensus, BAND_SEEDS, SEEDS, BASES, ANCHOR };
