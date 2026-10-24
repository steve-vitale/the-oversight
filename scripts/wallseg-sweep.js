#!/usr/bin/env node
// wallseg-sweep.js — wall end-binding re-attribution census on the FULL
// landed substrate (flesh-out loop arm sim-wallseg, axis scale-onramp, run
// fleshout-20261024T0215Z). STANDING DIRECTIVE: every run attacks the
// scale wall.
//
// DIAG arm: instrument-side, ZERO src/js changes. Re-draws the wall map
// the defer5-rediag DIAG drew WITHOUT the since-landed levers TRUSTBUFFER=1
// and VETFORMATION=1 (that map: end bindings defer5 10, stand-raw 8,
// plenty-cap 4, w3rung 1, unlocked 1 — now STALE).
//
// Substrate (pinned, ONE substrate across the whole sweep):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1
//   LINKFORM=2
// LINKFORM=2 is REQUIRED for TRUSTBUFFER=1 to engage: at mode 0
// trustbuffer.daily delegates to linkform.daily -> leadcourt.daily and the
// buffer tend pass never fires (linkform.js:36-44, trustbuffer.js gate).
// The trustbuffer lever LANDED as LINKFORM=2 + TRUSTBUFFER=1; without it
// the "full landed substrate" claim would be false. Documented in the
// evidence header's pre-registration.
// KILLDISC=1 is honored game-side (no policy layer needed).
//
// Policy (composed, policy-side only, zero src/js):
//   leadfeast:   VF.withVetformation(TB.trustbufferArmedFor(), 'wallseg-lead', ...)
//   belongfeast:  VF.withVetformation(TB.trustbufferBelongArmedFor(), 'wallseg-belong', ...)
// The trustbuffer census chain (feastscale->tribfloor->windefer->seatdrive->
// armorydrive->armorvillage, LINKFORM=2 + TRUSTBUFFER=1) with the
// vetformation formation/finishing layer OUTSIDE (VETFORMATION=1).
// At LINKFORM=2 the lead/belong dim is inert (trustbuffer metric review:
// the mode-2 road courtships collapse to one code path) — replication,
// effective n=12 seeds.
//
// Seeds: FRESH 70201-70212 (C1 freshness gate below; 0 hits across all
// evidence/**/perseed-* corpora 2026-10-24) x {leadfeast, belongfeast} =
// 24 configs, 180d death-aware (dead villages stop, +10d tail max; never a
// fixed 200d).
//
// Instruments: scripts/w5gates-lib.js UNMODIFIED (dailyGateTrace +
// gateVector) + direct state.waveKillLog read (dedup on (d,mid,by,via,trick)
// in the analyzer per backlog #844). The daily trace records t.dip
// (diplomacy points) and t.links per day — the stand-raw dip/links
// decomposition source. Per-seed JSONs written ONCE to
// evidence/2026-10-24/perseed-wallseg/ with sha256-after-write readback
// (the selective write-denial class is real). Sweep outputs to the worktree
// evidence dir, NEVER /tmp.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TB = require(path.join(REPO, 'scripts', 'policies', 'trustbuffer'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));

// Banned seed blocks: every block a prior corpus used (checked
// evidence/**/perseed-* 2026-10-24). C1 FRESHNESS GATE — any sweep seed in
// this list fails loudly.
const BANNED = [
  68901, 68912, 68501, 68508, 68401, 68408, 65511, 65522,
  65611, 65618, 65721, 65729, 65801, 65808, 66301, 66316,
  66401, 66416, 66501, 66516,
  67501, 67532, 67601, 67608, 67701, 67708, 68301, 68308,
  68601, 68608, 68805, 68814, 69001, 69012, 70111, 70122,
  92801, 92816,
];
function freshnessOK(seed) {
  for (let i = 0; i < BANNED.length; i += 2) {
    if (seed >= BANNED[i] && seed <= BANNED[i + 1]) return false;
  }
  return true;
}

// Pinned-substrate env guard (wallseg namespace). The FULL landed
// substrate: every env-gated lever ON. LINKFORM=2 is required (not merely
// allowed) because TRUSTBUFFER=1 is inert without it. BLOODRESTRAINT is the
// sibling arm's game-side lever — explicitly required OFF here so the
// census measures the landed substrate, not the sibling's in-flight lever.
const REQUIRE1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE', 'VETFORMATION', 'TRUSTBUFFER'];
const REQUIRE0 = ['FEASTDISC', 'HOMECOMING', 'SCHOLARDIST', 'VETREL', 'REPOSITION', 'VGEAR', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'VETFORMATION2', 'BLOODRESTRAINT'];
function checkEnv() {
  for (const k of REQUIRE1) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.LINKFORM !== '2') { console.error('SWEEP STOP: LINKFORM=2 is required (TRUSTBUFFER=1 is inert at mode 0).'); process.exit(2); }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of REQUIRE0) {
    if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, sibling namespaces untouched).`); process.exit(2); }
  }
  if (!TB.trustbufferMode || TB.trustbufferMode() !== 1) { console.error('SWEEP STOP: TRUSTBUFFER=1 not honored (trustbufferMode() !== 1).'); process.exit(2); }
  if (!VF.vfOn || !VF.vfOn()) { console.error('SWEEP STOP: VETFORMATION=1 not honored (vfOn() false).'); process.exit(2); }
  if (typeof TB.trustbufferArmedFor !== 'function' || typeof TB.trustbufferBelongArmedFor !== 'function') { console.error('SWEEP STOP: trustbuffer armedFor missing.'); process.exit(2); }
  if (typeof VF.withVetformation !== 'function') { console.error('SWEEP STOP: VF.withVetformation missing.'); process.exit(2); }
}
checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70201, 70202, 70203, 70204, 70205, 70206, 70207, 70208, 70209, 70210, 70211, 70212]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (!freshnessOK(s)) { console.error(`SWEEP STOP: seed ${s} fails the C1 freshness gate (banned corpus block).`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-wallseg');

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`);
  process.exit(2);
}
// The FULL landed stack: trustbuffer census chain inside, vetformation
// formation/finishing layer outside. VETFORMATION=1 and TRUSTBUFFER=1 both
// honored (checked above); gate-off delegation is byte-identical per the
// two layers' own proof tests.
function policyFor(base) {
  const nb = normBase(base);
  const inner = nb === 'leadfeast' ? TB.trustbufferArmedFor() : TB.trustbufferBelongArmedFor();
  const tag = nb === 'leadfeast' ? 'lead' : 'belong';
  return VF.withVetformation(inner, `wallseg-${tag}`,
    `${nb} trustbuffer census chain (LINKFORM=2 + TRUSTBUFFER=1) + VETFORMATION=1 formation/finishing layer outside: the full landed substrate`);
}
function policyTag(base) { return (normBase(base) === 'belongfeast' ? 'belong' : 'lead') + '-wallseg'; }

async function oneRun(seed, base, opts) {
  opts = opts || {};
  const write = opts.write !== false;
  const days = opts.days || DAYS;
  const evidDir = opts.evidDir || EVID;
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'wallseg', fullTelemetry: false });
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
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days, manifest: undefined, sampleEvery: 30 }); });

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
    instrument: 'wallseg sweep on w5gates-lib daily trace + direct waveKillLog read (full landed substrate)',
    substrate: 'pinned: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 — trustbuffer census chain + vetformation layer outside',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2',
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
  if (write) {
    fs.mkdirSync(evidDir, { recursive: true });
    const fn = path.join(evidDir, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`);
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
      const r = await oneRun(s, b);
      rows.push({ seed: r.seed, base: r.base, binding: r.binding, w4Day: r.w4Day, w5Day: r.w5Day, overlapDays: r.overlapDays, defer5HeldDays: r.defer5HeldDays, days: r.days, gameDays: r.gameDays, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won });
      console.log(JSON.stringify(rows[rows.length - 1]));
    }
  }
  console.log('WALLSEG-SWEEP-DONE ' + JSON.stringify({ seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
}
module.exports = { oneRun, policyFor, policyTag, normBase, freshnessOK, checkEnv, SEEDS, BASES, ANCHOR };
