#!/usr/bin/env node
// postunlock-sweep.js — POST-UNLOCK RETENTION autopsy census (flesh-out loop
// arm sim-postunlock-b2, axis scale-onramp, run fleshout-20261024T0615Z).
// DIAG arm: instrument-side, ZERO src/js changes. Namespace postunlock-*.
//
// DELIBERATE RE-SWEEP (vetautopsy pattern): seeds are the 8 configs that
// opened the wave-5 door on the landed wallseg census
// (fleshout-20261024T0215Z, arm sim-wallseg, anchor c76a52480b09):
//   70201, 70202, 70204, 70209 x {leadfeast, belongfeast}
// The C1 freshness gate does NOT apply — these seeds are re-swept
// DELIBERATELY with the new postunlock instrument. Any other seed is a
// loud stop.
// Substrate (pinned, identical to the wallseg census — enforced by
// requiring scripts/wallseg-sweep.js, whose module-scope checkEnv() guards
// the FULL landed substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1
//   LINKFORM=2
// Policy: the identical wallseg policy objects (trustbuffer census chain +
// vetformation layer) — reused from scripts/wallseg-sweep.js policyFor()
// so trajectories are behaviorally identical to the landed corpus.
// Instruments: scripts/postunlock-instrument.js (per-death rows with
// opponent linkage, hp/armor, village bar counts, overtime tier,
// killing-fight composition + rerun flag; unlock-day poll; say-ring).
//
// Resume-safe: per-seed JSONs are written once with sha256-after-write
// readback; an existing file with a matching anchor + complete instrument
// payloads is skipped (the instrument is deterministic — a re-run is
// byte-identical on the judged fields, verified in
// scripts/test-postunlock-b.js E1). Anchor mismatch is re-run LOUD.
// Sweep outputs to the worktree evidence dir, NEVER /tmp.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 \
//   node scripts/postunlock-sweep.js [SEEDS=70201,70202 POLICIES=lead EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

// Pinned-substrate env guard: wallseg-sweep runs checkEnv() at module
// scope (REQUIRE1 FEASTSCALE_R13/TRIBFLOOR/WINPURSUIT/WINDEFER/KILLDISC/
// ARMORYDRIVE/ARMORVILLAGE/VETFORMATION/TRUSTBUFFER=1, LINKFORM=2,
// SEATDRIVE=0, REQUIRE0 all unset). Requiring it enforces the identical
// substrate this DIAG re-sweeps.
const WS = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));

// DELIBERATE RE-SWEEP GATE: only the 8 wave-5-door configs from the landed
// wallseg census. The C1 freshness gate does NOT apply here (these seeds
// are re-swept deliberately with a new instrument, asserted below).
const DOOR_SEEDS = [70201, 70202, 70204, 70209];
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : DOOR_SEEDS).filter(Number.isFinite);
for (const s of SEEDS) {
  if (DOOR_SEEDS.indexOf(s) < 0) { console.error(`SWEEP STOP: seed ${s} is not one of the 8 wave-5-door configs (deliberate re-sweep band 70201/70202/70204/70209).`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-postunlock');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'postunlock-sweep-runlog.txt');
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

async function oneRun(seed, base, opts) {
  opts = opts || {};
  const write = opts.write !== false;
  const days = opts.days || DAYS;
  const evidDir = opts.evidDir || EVID;
  // The IDENTICAL wallseg policy objects (behavioral trajectory match with
  // the landed corpus is the E2 gate in test-postunlock-b.js).
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

  // sayRing: keep the post-unlock window + a pre-unlock margin for the
  // sense pass; cap by JSON size (lines are already 400-char capped).
  const w5Day = t.unlock ? t.unlock.w5Day : null;
  let sayRing = t.sayRing || [];
  if (w5Day != null) sayRing = sayRing.filter(s => s && s.day >= w5Day - 14);
  if (sayRing.length > 400) sayRing = sayRing.slice(sayRing.length - 400);

  const out = {
    seed, base: nb, policyId: policy.id,
    instrument: 'postunlock-instrument (per-death rows + fight composition + overtime tier + say-ring)',
    substrate: 'pinned: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 — deliberate re-sweep of the 8 wallseg door configs',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2',
    anchorCommit: ANCHOR,
    wallsegAnchor: 'c76a52480b09',
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
    fs.writeFileSync(fn, body);
    const shaWrote = crypto.createHash('sha256').update(body).digest('hex');
    const shaRead = crypto.createHash('sha256').update(fs.readFileSync(fn)).digest('hex');
    if (shaWrote !== shaRead) { console.error(`WRITE-DENIAL: hash mismatch after write for ${fn}`); process.exit(3); }
  }
  return out;
}

async function main() {
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const fn = seedFile(s, b);
      // Resume: an existing file with a matching anchor + complete payload
      // is deterministic-identical; skip.
      let skip = false;
      if (fs.existsSync(fn)) {
        try {
          const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
          if (payloadComplete(d, s, ANCHOR)) { skip = true; logLine(`skip ${s}-${b} (resume, anchor ${ANCHOR})`); }
        } catch (e) {}
      }
      if (skip) { rows.push({ seed: s, base: b, skipped: true }); continue; }
      const r = await oneRun(s, b);
      const lastDeathDay = (r.postunlockDeaths || []).reduce((m, dr) => Math.max(m, dr.day | 0), -1);
      rows.push({ seed: r.seed, base: r.base, w4Day: r.unlock.w4Day, w5Day: r.unlock.w5Day, days: r.days, endReason: r.endReason, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, nDeaths: r.nPostunlockDeaths, nFights: r.nPostunlockFights, lastDeathDay, instrumentErrors: (r.instrumentErrors || []).length });
      logLine(JSON.stringify(rows[rows.length - 1]));
    }
  }
  logLine('POSTUNLOCK-SWEEP-DONE ' + JSON.stringify({ seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun, normBase, seedFile, payloadComplete, DOOR_SEEDS, SEEDS, BASES, ANCHOR };
