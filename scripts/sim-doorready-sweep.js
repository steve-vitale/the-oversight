#!/usr/bin/env node
// sim-doorready-sweep.js — matched before/after sweep for arm sim-doorready
// (axis scale-onramp, run 2026-10-24). POLICY-SIDE ONLY: zero src/js changes.
// KILLED 2026-10-24 (NO-GO at pilot, 0 matched doors): the policy file
// scripts/policies/doorready.js was deleted, so this sweep no longer runs —
// it requires the deleted module and fails loudly without it. Retained as
// method documentation for the next door arm; the verdict instrument that
// still runs is scripts/sim-doorready-analyze.js over the landed corpus.
//
// Baseline: the competent-player policy, PLAIN (no env suite — the sweep
// clears the known suite gates in-process so "competent" means default
// competent, byte-identical to scripts/policies/competent.js defaults).
// Armed: scripts/policies/doorready.js (feast deferral in the w4 window
// while margin bars are short; see that file's header for the exact bars).
// Shared instrument: scripts/postunlock-instrument.js (read-only), plus a
// sweep-level endDay poll that snapshots the wave-5 readiness bars ON THE
// DOOR DAY (bars at end-of-run are collapse artifacts, not door state).
//
// FRESH SEED BAND: 71901-71908 x {competent, doorready} = 16 pilot configs.
// Verified unused at run start by seed identity (no s7190x filename, no
// "seed":7190x, no SEEDS list with 7190x anywhere in evidence/; the only
// 7190x tokens found are "da71901e" (a tenure-instrument pattern id) and
// a kcal figure 71903 — neither is a seed).
// Horizon: 180d death-aware (dead villages stop; never a fixed 200d).
// Per-seed writes go through scripts/sim-postunlock2-b-writer.js
// (read-only reuse: fresh-process chunked-append writer, EPERM-flap proof).
// Outputs to evidence/2026-10-24/perseed-doorready/, NEVER /tmp.
//
// Usage:
//   node scripts/sim-doorready-sweep.js [SEEDS=71901,71902 POLICIES=competent EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
const DR = require(path.join(REPO, 'scripts', 'policies', 'doorready'));

// PLAIN-COMPETENT GUARD: "the competent-player policy" means defaults.
// Any suite gate left set in the parent shell would silently change the
// baseline (and the armed arm's delegation). Clear them in-process and
// record that fact in every per-seed payload.
const SUITE_VARS = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE',
  'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE', 'VETFORMATION', 'TRUSTBUFFER', 'LINKFORM',
  'COMPETENT_TALK', 'COMPETENT_SURPLUS_FEAST', 'COMPETENT_FEAST', 'COMPETENT_AID',
  'COMPETENT_TRAUMA_RELIEF', 'VETSHAPE', 'LOOT_ALL', 'EAT_FRAC', 'DAWNREFUSE_GATE',
  'NOTHINGEDIBLE_GATE', 'COMPETENT_WARM', 'COMPETENT_SEEK_FIGHTS'];
for (const v of SUITE_VARS) { try { delete process.env[v]; } catch (e) {} }

const BAND_SEEDS = [71901, 71902, 71903, 71904, 71905, 71906, 71907, 71908];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : BAND_SEEDS.slice()).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BAND_SEEDS.indexOf(s) < 0) { console.error(`SWEEP STOP: seed ${s} is outside the fresh 719xx band (71901-71908).`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['competent', 'doorready']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-doorready');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'sim-doorready-sweep-runlog.txt');
function logLine(s) {
  console.log(s);
  try { fs.appendFileSync(RUNLOG, new Date().toISOString() + ' ' + s + '\n'); } catch (e) {}
}
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'competent') return 'competent';
  if (base === 'doorready') return 'doorready';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`); process.exit(2);
}
function seedFile(seed, base) {
  return path.join(EVID, `s${seed}-${normBase(base)}.json`);
}
function payloadComplete(d, seed, anchor) {
  return d && d.seed === seed && d.anchorCommit === anchor &&
    Array.isArray(d.postunlockDeaths) && Array.isArray(d.postunlockFights) &&
    d.unlock && ('w4Day' in d.unlock) && ('w5Day' in d.unlock) && d.doorSnapshot && ('w5Day' in d.doorSnapshot);
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day) | 0 || 0; } catch (e) { return 0; }
}

async function oneRun(seed, base, opts) {
  opts = opts || {};
  const write = opts.write !== false;
  const days = opts.days || DAYS;
  const evidDir = opts.evidDir || EVID;
  const nb = normBase(base);
  const policy = nb === 'doorready' ? DR.doorready() : DR.baseline();
  const t = {};
  const { Game } = await loadGame({ seed, mode: 'doorready', fullTelemetry: false });
  const uninstall = PI.install(Game, t);
  // Door-day snapshot (outer endDay wrap; PI's inner wrap polls unlock days).
  const doorSnapshot = { w4Day: null, w5Day: null, atDoor: null };
  try {
    const oEndDay = Game.endDay;
    if (typeof oEndDay === 'function') {
      Game.endDay = function () {
        const r = oEndDay.apply(this, arguments);
        try {
          if (typeof Game.unlockedWave === 'function') {
            const uw = Game.unlockedWave() | 0;
            if (doorSnapshot.w4Day == null && uw >= 4) doorSnapshot.w4Day = gday(Game);
            if (doorSnapshot.w5Day == null && uw >= 5) {
              doorSnapshot.w5Day = gday(Game);
              try {
                const wr = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
                doorSnapshot.atDoor = {
                  ready: wr ? !!wr.ready : null,
                  bars: wr && wr.bars ? { ...wr.bars } : PI.barCounts(Game),
                  raw: wr ? (wr.raw | 0) : null, capped: wr ? (wr.capped | 0) : null,
                  threshold: wr ? (wr.threshold | 0) : null,
                };
              } catch (e) { doorSnapshot.atDoor = { err: String((e && e.message) || e) }; }
            }
          }
        } catch (e) { t.instrumentErrors.push('doorSnapshot: ' + String((e && e.message) || e)); }
        return r;
      };
    }
  } catch (e) { t.instrumentErrors.push('doorSnapshot.install: ' + String((e && e.message) || e)); }
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
  let sayRing = [];
  if (w5Day != null) {
    sayRing = (t.sayRing || []).filter(s => s && s.day >= w5Day - 14);
    if (sayRing.length > 400) sayRing = sayRing.slice(sayRing.length - 400);
  }
  const lastRun = policy.lastRun || {};
  const out = {
    seed, base: nb, policyId: policy.id,
    instrument: 'postunlock-instrument + door-day readiness snapshot (waveUnlockReady(5) at first w5 day)',
    substrate: 'plain competent (no env suite; suite vars cleared in-process at sweep start)',
    env: 'plain',
    anchorCommit: ANCHOR,
    unlock: t.unlock || { w4Day: null, w5Day: null },
    doorSnapshot,
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    deaths, starvation,
    nWaveKillLog: waveKillLog.length, waveKillLog,
    nPostunlockDeaths: (t.postunlockDeaths || []).length, postunlockDeaths: t.postunlockDeaths || [],
    nPostunlockFights: (t.postunlockFights || []).length, postunlockFights: t.postunlockFights || [],
    nSayRing: sayRing.length, sayRing,
    sayLive: !!t.sayLive,
    instrumentErrors: t.instrumentErrors || [],
    doorready: {
      feastsFinal: lastRun.feastsFinal || 0,
      deferStartDay: lastRun.deferStartDay != null ? lastRun.deferStartDay : null,
      releaseDay: lastRun.releaseDay != null ? lastRun.releaseDay : null,
      nSnapshots: (lastRun.snapshots || []).length,
      snapshots: lastRun.snapshots || [],
    },
  };
  if (write) {
    fs.mkdirSync(evidDir, { recursive: true });
    const fn = path.join(evidDir, `s${seed}-${nb}.json`);
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
    for (const b of BASES) {
      const fn = seedFile(s, b);
      let skip = false;
      if (fs.existsSync(fn)) {
        try {
          const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
          if (payloadComplete(d, s, ANCHOR)) { skip = true; logLine(`skip ${s}-${b} (resume, anchor ${ANCHOR})`); }
        } catch (e) {}
      }
      if (skip) { rows.push({ seed: s, base: b, skipped: true }); continue; }
      const r = await oneRun(s, b);
      rows.push({ seed: r.seed, base: r.base, w4Day: r.unlock.w4Day, w5Day: r.unlock.w5Day, days: r.days, endReason: r.endReason, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, feasts: r.doorready.feastsFinal, deferStart: r.doorready.deferStartDay, release: r.doorready.releaseDay, instrumentErrors: (r.instrumentErrors || []).length });
      logLine(JSON.stringify(rows[rows.length - 1]));
    }
  }
  logLine('SIM-DOORREADY-SWEEP-DONE ' + JSON.stringify({ seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun, normBase, seedFile, payloadComplete, BAND_SEEDS, SEEDS, BASES, ANCHOR };
