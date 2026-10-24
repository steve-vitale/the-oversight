#!/usr/bin/env node
// defer5rediag-sweep.js — wave-5 defer5 coincidence-trap RE-DIAGNOSTIC
// (flesh-out loop arm sim-defer5-rediag, axis scale-onramp, run
// fleshout-20261023T2217Z). STANDING DIRECTIVE: every run attacks the
// scale wall.
//
// DIAG arm: instrument-side, ZERO src/js changes. Re-attributes the defer5
// wave-5 coincidence trap on CURRENT master, where master moved
// substantially since the original DIAG (armorvillage landed, armored15
// confirmed, vetformation landed; defer4transfer: "defer5 (the 2-veteran
// coincidence) and stand-raw (dip+links zero, the diplomatic layer) are
// [the wall segments]" — defer4 veterans no longer the wall here).
//
// Substrate (pinned, ONE substrate across the whole sweep — confirmed pin
// from defer5gate/defer4transfer evidence headers + ARMORVILLAGE=1, the
// current best armor substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1
//   policy = AV.armedFor(base) (armorvillage's armedFor wraps armorydrive's)
// Seeds: FRESH 70111-70122 (C1 freshness gate below; the banned blocks are
// 68901-68912, 68501-68508, 68401-68408, 65511-65522 plus every other block
// a prior corpus used — verified 2026-10-23 against evidence/**/perseed-*) x
// {leadfeast, belongfeast} = 24 configs, 180d death-aware.
//
// Day-by-day bar tracking: for each config, the daily trace records the
// r5 bar values (armored@P>=15, armed, tricks, living wave-4+ killers);
// the analyzer derives: per-bar release day (first day met), peak, last-met
// day, and coincidence overlap days (all four simultaneously).
//
// Instruments: scripts/w5gates-lib.js UNMODIFIED (dailyGateTrace +
// gateVector + attribute) + direct state.waveKillLog read (dedup on
// (d,mid,by,via,trick) in the analyzer per backlog #844). Per-seed JSONs
// written ONCE to evidence/2026-10-23/perseed-defer5rediag/ with
// sha256-after-write readback (the selective write-denial class is real).
// Sweep outputs to the worktree evidence dir, NEVER /tmp.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));

// Banned seed blocks: every block a prior corpus used (checked
// evidence/**/perseed-* 2026-10-23; the task's named five are a subset).
// C1 FRESHNESS GATE — any sweep seed in this list fails loudly.
const BANNED = [
  68901, 68912, 68501, 68508, 68401, 68408, 65511, 65522,
  65611, 65618, 65721, 65729, 65801, 65808, 66301, 66316,
  67501, 67532, 67601, 67608, 67701, 67708, 68301, 68308,
  68601, 68608, 68805, 68814, 92801, 92816,
];
function freshnessOK(seed) {
  for (let i = 0; i < BANNED.length; i += 2) {
    if (seed >= BANNED[i] && seed <= BANNED[i + 1]) return false;
  }
  return true;
}

// Pinned-substrate env guard (defer5rediag namespace). ONE substrate only:
// armorvillage's armedFor (armorydrive pinned + ARMORVILLAGE=1). The sibling
// arms' layers (VETFORMATION, LINKFORM, FEASTDISC-*, HOMECOMING-*, SCHOLARDIST-*)
const REQUIRE1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE'];
const REQUIRE0 = ['VETFORMATION', 'LINKFORM', 'FEASTDISC', 'HOMECOMING', 'SCHOLARDIST', 'VETREL', 'REPOSITION', 'VGEAR', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'VETFORMATION2'];
function checkEnv() {
  for (const k of REQUIRE1) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of REQUIRE0) {
    if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, one arm only).`); process.exit(2); }
  }
  if (!AV.avOn || !AV.avOn()) { console.error('SWEEP STOP: ARMORVILLAGE=1 not honored (armorvillage.avOn() false).'); process.exit(2); }
  if (typeof AV.armedFor !== 'function') { console.error('SWEEP STOP: AV.armedFor missing (armorvillage not on master?).'); process.exit(2); }
}
checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70111, 70112, 70113, 70114, 70115, 70116, 70117, 70118, 70119, 70120, 70121, 70122]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (!freshnessOK(s)) { console.error(`SWEEP STOP: seed ${s} fails the C1 freshness gate (banned corpus block).`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-defer5rediag');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`);
  process.exit(2);
}
function policyFor(base) { return AV.armedFor(normBase(base)); }
function policyTag(base) { return (normBase(base) === 'belongfeast' ? 'belong' : 'lead') + '-armorvillage'; }

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'defer5rediag', fullTelemetry: false });
  const instrumentErrors = [];
  const gateTrace = [];
  const oDaily = policy.daily;
  const wrappedPolicy = Object.assign({}, policy, {
    daily(G, ctx) {
      try { gateTrace.push(G5.dailyGateTrace(G)); } catch (e) { instrumentErrors.push('gateTrace: ' + String((e && e.message) || e)); }
      return oDaily(G, ctx);
    },
  });

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Wall numbers.
  let national = 0, table = 0, exiled = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;

  // Deaths (guardrails: starvation count, new death kinds).
  const deaths = {};
  let starvation = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starvation++;
    }
  } catch (e) { instrumentErrors.push('deaths: ' + String((e && e.message) || e)); }

  // waveKillLog DIRECT (the source the veterans bar reads — standing.js:278).
  // Raw entries; dedup on (d,mid,by,via,trick) in the analyzer per #844.
  let waveKillLog = [];
  try {
    waveKillLog = (st.waveKillLog || []).map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  // Live demands (standingCfg — recalibrated 2026-10-18).
  let demand4 = null, demand5 = null;
  try {
    const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
    if (sc && sc.readyDemand) { demand4 = sc.readyDemand[4] || null; demand5 = sc.readyDemand[5] || null; }
  } catch (e) {}

  // Bar-window sensors from the daily trace: release day (first met), peak,
  // last-met day per bar — for BOTH defer4 and defer5 bar sets.
  function barSensors(rkey, demand) {
    const bars = ['armored', 'armed', 'tricks', 'veterans'];
    const out = {};
    for (const b of bars) {
      let release = null, peak = -1, lastMet = null;
      const dem = (demand && (demand[b] | 0)) || 0;
      for (const t of gateTrace) {
        const bv = ((t[rkey] || {})[b] | 0);
        if (bv > peak) peak = bv;
        if (release == null && bv >= dem && dem > 0) release = t.d | 0;
        if (bv >= dem && dem > 0) lastMet = t.d | 0;
      }
      out[b] = { demand: dem, release, peak, lastMet };
    }
    return out;
  }
  const sensors4 = barSensors('r4', demand4);
  const sensors5 = barSensors('r5', demand5);

  // Coincidence overlap: days where ALL FOUR r5 bars are simultaneously met.
  let overlapDays = 0, firstOverlapDay = null, overlapWindows = [];
  {
    const d5 = (demand5 && demand5.armored | 0) || 0, dW = (demand5 && demand5.armed | 0) || 0,
          dT = (demand5 && demand5.tricks | 0) || 0, dV = (demand5 && demand5.veterans | 0) || 0;
    let winStart = null;
    for (const t of gateTrace) {
      const b = t.r5 || {};
      const met = d5 > 0 && (b.armored | 0) >= d5 && (b.armed | 0) >= dW && (b.tricks | 0) >= dT && (b.veterans | 0) >= dV;
      if (met) {
        overlapDays++;
        if (firstOverlapDay == null) firstOverlapDay = t.d | 0;
        if (winStart == null) winStart = t.d | 0;
      } else if (winStart != null) {
        overlapWindows.push([winStart, (t.d | 0) - 1]);
        winStart = null;
      }
    }
    if (winStart != null && gateTrace.length) overlapWindows.push([winStart, (gateTrace[gateTrace.length - 1].d | 0)]);
  }

  // Mid-run deferral windows: rows where the defer5/defer4 hold is live
  // (capped>=200 && !ready && peak<5; raw>=100 && !r4.ready && peak<4).
  let defer5HeldDays = 0, defer4HeldDays = 0, firstDefer5Day = null, firstDefer4Day = null;
  let w4Day = null, w5Day = null;
  for (const t of gateTrace) {
    if (w4Day == null && (t.uw | 0) >= 4) w4Day = t.d | 0;
    if (w5Day == null && (t.uw | 0) >= 5) w5Day = t.d | 0;
    if ((t.capped | 0) >= 200 && !(t.r5 || {}).ready && (t.peak | 0) < 5) {
      defer5HeldDays++;
      if (firstDefer5Day == null) firstDefer5Day = t.d | 0;
    }
    if ((t.raw | 0) >= 100 && !(t.r4 || {}).ready && (t.peak | 0) < 4) {
      defer4HeldDays++;
      if (firstDefer4Day == null) firstDefer4Day = t.d | 0;
    }
  }

  // End-of-run gate vector + attribution (w5gates-lib UNMODIFIED).
  let gateVector = null, gateErr = null;
  try { gateVector = G5.gateVector(Game); } catch (e) { gateErr = String((e && e.message) || e); }
  const binding = (gateVector && gateVector.attr && gateVector.attr.binding) || null;

  const out = {
    seed, base: normBase(base), policyId: tag,
    instrument: 'defer5rediag sweep on w5gates-lib daily trace + direct waveKillLog read',
    substrate: 'pinned: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 — armorvillage.armedFor (armorydrive pinned substrate + armor-economy drive)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1',
    anchorCommit: ANCHOR,
    maxWave, w4Day, w5Day,
    demand4, demand5, sensors4, sensors5,
    overlapDays, firstOverlapDay, overlapWindows,
    defer5HeldDays, firstDefer5Day, defer4HeldDays, firstDefer4Day,
    binding,
    national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    deaths, starvation,
    nWaveKillLog: waveKillLog.length, waveKillLog,
    nGateTraceDays: gateTrace.length, gateTrace,
    gateVector, gateErr,
    instrumentErrors,
  };
  const fn = path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`);
  const body = JSON.stringify(out, null, 1) + '\n';
  fs.writeFileSync(fn, body);
  const shaWrote = crypto.createHash('sha256').update(body).digest('hex');
  const shaRead = crypto.createHash('sha256').update(fs.readFileSync(fn)).digest('hex');
  if (shaWrote !== shaRead) { console.error(`WRITE-DENIAL: hash mismatch after write for ${fn}`); process.exit(3); }
  return {
    seed, base: normBase(base), binding, w4Day, w5Day,
    overlapDays, defer5HeldDays,
    days: result.days, gameDays, maxWave, national, table, won,
  };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const r = await oneRun(s, b);
      rows.push(r);
      console.log(JSON.stringify(r));
    }
  }
  console.log('DEFER5REDIAG-SWEEP-DONE ' + JSON.stringify({ seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
