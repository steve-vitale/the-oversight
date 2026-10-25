#!/usr/bin/env node
// sweep-overtime-pacing-l887.js — L887 overtime-pacing pilot sweep.
// Pre-registration: evidence/2026-10-24/l887-overtime-pacing-prereg.md
// (commit 3f95ccd7d), BINDING under MEASUREMENT.md §14. Judge ONLY against
// its header; a miss is NO-GO, never re-scored.
// Substrate: pinned wallseg substrate (scripts/wallseg-sweep.js checkEnv
// runs at import). Lever: armed configs override
// Game.data.titans._overtime.daysPerTier 7 -> 14 post-load; control is the
// identical substrate with no override. maxTier stays 6 in both arms.
// Pilot: seeds 70201,70202,70204,70209 x lead,belong, 180d death-aware.
// PRIMARY: post-door survival days (door-open day -> village-lost day, or
// 180d cap): armed median >= control median + 20d AND seats-taken(armed)
// >= seats-taken(control). Guardrails: wins(armed) >= wins(control);
// national rate not lower; table reach not lower.
// Door = wave-5 unlock day (first day unlockedWave() >= 5, daily poll with
// postunlock-instrument endDay-poll fallback) — the postunlock2 definition.
// Usage (one arm per process so the post-load override can never leak):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 \
//   ARM=0 SEEDS=70201,70202,70204,70209 POLICIES=lead,belong DAYS=180 \
//   EVID=evidence/2026-10-25/perseed-l887-control node scripts/sweep-overtime-pacing-l887.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

// wallseg-sweep runs checkEnv() at import: the pinned substrate guard.
const WS = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PU = require(path.join(REPO, 'scripts', 'postunlock-instrument'));

const ARMED = process.env.ARM === '1';
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70201, 70202, 70204, 70209]).filter(Number.isFinite);
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', ARMED ? 'perseed-l887-armed' : 'perseed-l887-control');
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, base) {
  const policy = WS.policyFor(base);
  const tag = WS.policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'wallseg', fullTelemetry: false });
  const t = {};
  const uninstall = PU.install(Game, t);
  let doorDay = null, doorSnapshot = null;
  const oDaily = policy.daily;
  const wrappedPolicy = Object.assign({}, policy, {
    daily(G, ctx) {
      try {
        if (doorDay == null && typeof G.unlockedWave === 'function' && (G.unlockedWave() | 0) >= 5) {
          doorDay = (((G.state || {}).scholar || {}).day) | 0;
          try { doorSnapshot = PU.barCounts(G); } catch (e) { doorSnapshot = null; }
        }
      } catch (e) {}
      return oDaily(G, ctx);
    },
  });
  await setupGame(Game);
  // The arm's only lever, post-load override — no repo data change.
  if (ARMED) {
    try { Game.data.titans._overtime.daysPerTier = 14; } catch (e) { console.error('OVERRIDE FAILED', e); process.exit(2); }
  }
  let otDays = null, otMax = null;
  try { otDays = Game.data.titans._overtime.daysPerTier; otMax = Game.data.titans._overtime.maxTier; } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  if (doorDay == null && t.unlock && t.unlock.w5Day != null) doorDay = t.unlock.w5Day;

  const st = Game.state || {};
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let national = 0, table = 0, seats = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; if (pg.tableDone) seats = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  // Post-door survival: door day -> village-lost day, or 180d cap if alive
  // at cap. gameDays is the end day in both arms, so the comparison is
  // apples-to-apples (any +10d death tail applies to both arms equally).
  let postDoor = null;
  if (doorDay != null) {
    const endDay = gameDays >= DAYS ? DAYS : gameDays;
    postDoor = endDay - doorDay;
  }
  let waveKillLog = [];
  try {
    waveKillLog = (st.waveKillLog || []).map(e => ({ d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0, by: e && e.by, via: e && e.via, trick: e && e.trick }));
  } catch (e) {}
  const out = {
    seed, base: WS.normBase(base), policyId: tag, arm: ARMED ? 'armed' : 'control',
    instrument: 'wallseg substrate + postunlock-instrument (postunlockDeaths/postunlockFights/unlock) + daily door poll',
    substrate: 'pinned wallseg: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2',
    lever: ARMED ? 'titans._overtime.daysPerTier 7->14 post-load override (maxTier stays 6)' : 'none (control)',
    otDays, otMax, anchorCommit: ANCHOR,
    doorDay, doorSnapshot, unlock: t.unlock || null,
    days: result.days, gameDays, endReason: result.endReason,
    postDoor, national, table, seats, won,
    nPostunlockDeaths: (t.postunlockDeaths || []).length,
    postunlockDeaths: t.postunlockDeaths || [],
    nPostunlockFights: (t.postunlockFights || []).length,
    postunlockFights: t.postunlockFights || [],
    nWaveKillLog: waveKillLog.length, waveKillLog,
    instrumentErrors: t.instrumentErrors || [],
  };
  fs.mkdirSync(EVID, { recursive: true });
  const fn = path.join(EVID, `s${seed}-${WS.normBase(base) === 'belongfeast' ? 'belong' : 'lead'}-${ARMED ? 'armed' : 'control'}.json`);
  const body = JSON.stringify(out, null, 1) + '\n';
  fs.writeFileSync(fn, body);
  const shaWrote = crypto.createHash('sha256').update(body).digest('hex');
  const shaRead = crypto.createHash('sha256').update(fs.readFileSync(fn)).digest('hex');
  if (shaWrote !== shaRead) { console.error(`WRITE-DENIAL: hash mismatch after write for ${fn}`); process.exit(3); }
  return out;
}

async function main() {
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const r = await oneRun(s, b);
      const line = { seed: r.seed, base: r.base, arm: r.arm, otDays: r.otDays, doorDay: r.doorDay, gameDays: r.gameDays, endReason: r.endReason, postDoor: r.postDoor, national: r.national, table: r.table, seats: r.seats, won: r.won, nDeaths: r.nPostunlockDeaths };
      rows.push(line);
      console.log(JSON.stringify(line));
    }
  }
  console.log('L887-SWEEP-DONE ' + JSON.stringify({ arm: ARMED ? 'armed' : 'control', seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun };
