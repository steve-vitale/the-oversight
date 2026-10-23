#!/usr/bin/env node
// sweep-plentydepri-confirm-b.js — PLENTYDEPRI CONFIRM sweep
// (sim-plentydepri-confirm-b, 2026-10-23).
//
// CONFIRM of arm sim-plentydepri-b (landed df66ebaff): Steve's 2026-10-21
// ruling — SURPLUSFEED's post-hoc share trim REMOVED; villagers ease 50% of
// the surplus push above their own meal-need estimate when the pantry is
// plentiful (>4 fresh days, duty-PRODTHROTTLE's own definition;
// hungryStreak>=3 stands it down; own meal sacred by construction).
// Env gate: PLENTYDEPRI=1 armed (default-ON as landed); PLENTYDEPRI=0 control.
// No game-code change needed for control — same source both sides.
//
// Derived from the pilot's instrument scripts/sweep-plentydepri-b.js (cited;
// reused where sound). Changes vs the pilot sweep:
//   - daily pantryFreshDays() series -> run-median freshDays per run
//     (guardrail (e): pantry median freshDays not collapsing vs control)
//   - writes per-seed JSONs (for telemetry-check --current glob) in
//     addition to the per side-policy sweep files
//   - default seeds = 16 FRESH seeds (pilot used 9001-9008, prior confirm
//     9009-9016; scan scripts/ + evidence/ filenames/contents before reuse)
//   - default DAYS=100 (death-aware; dead villages stop, +10d tail)
//
// Pre-registered PRIMARY (per feast-side): (rotFresh+rotPreserved) absolute
// kcal per 100 days alive, armed/control <= 0.80
// (pilot 0.542x leadfeast / 0.622x; prior 16-seed confirm 0.348x/0.508x).
// Guardrails: (a) median paired (armed-control) survival-diff >= -10d;
// (b) exposure-normalized starvation armedRate <= controlRate + 2/(armedVD/100);
// (c) no new death modes (kind-filtered, pooled control corpus);
// (d) national reach not collapsing vs control (report numbers, >= control-2);
// (e) pantry median-of-run-medians freshDays armed >= 0.5x control (report both).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); PLENTYDEPRI=0
// control | =1 armed.
// SIDE=control|armed SEEDS="9209,...,9240" POLICY=leadfeast|belongfeast
//   DAYS=100 OUT=<path> PERSEED_DIR=<dir> node scripts/sweep-plentydepri-confirm-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
// Persistent scratch: NEVER /tmp — sibling cleanups wipe /tmp mid-run
// (2026-10-23: a full /tmp wipe destroyed a completed 64-config sweep).
const SCRATCH = path.join(os.homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-plentydepri-confirm-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'control';
const WANT = SIDE === 'armed' ? '1' : '0';
// STRICT: unset PLENTYDEPRI means default-ON in the game gate
// (_plentyDepriOn: `process.env.PLENTYDEPRI !== '0'`), so the env must be
// EXPLICIT — otherwise "control" would silently run armed.
if (process.env.PLENTYDEPRI !== WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires PLENTYDEPRI=${WANT} explicitly (unset = default-ON in game)`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9209,9222,9223,9224,9225,9227,9228,9229,9230,9232,9233,9234,9236,9237,9239,9240')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(SCRATCH, 'sweep-' + SIDE + '-' + POLICY_ID + '.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(SCRATCH, 'perseed');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// channel attribution for stockPantry callers (named channels from the
// glutprobe taxonomy; ambient:villagelives = autonomous villager paths
// that stock the pantry directly — meal leftovers, ambient hauls).
function channelOf() {
  const st = new Error().stack || '';
  if (/checkTraps/.test(st)) return 'traps';
  if (/catchUpSim|tribute/i.test(st)) return 'tribute';
  if (/donat/i.test(st)) return 'scholar_home';
  if (/resolveOneAssignment/.test(st)) return 'duty';
  if (/packMeal|homecoming|awayReturn|npcNodeTravel|objReturnEffect/i.test(st)) return 'away_wild';
  if (/hostFeast|Trial|replicated|System/i.test(st)) return 'system';
  if (/villageLives|ambientSocial|mealLeftover/i.test(st)) return 'ambient:villagelives';
  return 'ambient:other';
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'plentydepri-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), chan: {}, shareKcal: 0, starveDays: 0 };

  // --- rot:fresh vs rot:preserved (dedupe by item identity) ---
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  // --- inflow channel attribution ---
  const oSP = Game.stockPantry;
  if (typeof oSP === 'function') Game.stockPantry = function (kcal, name, opts) {
    try { const c = channelOf(); W.chan[c] = (W.chan[c] || 0) + (kcal || 0); }
    catch (e) {}
    return oSP.apply(this, arguments);
  };
  const oSS = Game.stockSurplus;
  if (typeof oSS === 'function') Game.stockSurplus = function (v, give) {
    const r = oSS.apply(this, arguments);
    // count what actually STORED (the honest inflow), not the attempted give
    try { W.shareKcal += Math.max(0, r || 0); } catch (e) {}
    return r;
  };

  // --- deaths: kind-aware, dedup on (who,day,cause) ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
        }
      }
    } catch (e) {}
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  const freshSeries = []; // daily pantryFreshDays() samples (guardrail e)
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      if (G.pantryFreshDays) freshSeries.push(G.pantryFreshDays());
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  let depriDays = 0, depriKcal = 0, depriDec = 0;
  try {
    const lg = (Game.state.village || {})._plentyDepri;
    if (lg) for (const d of Object.values(lg.days || {})) {
      depriDays++; depriDec += (d.depri || 0); depriKcal += (d.kcal || 0);
    }
  } catch (e) {}
  let exiled = 0, rosterEnd = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    nationalEnd: (() => { try { const r = Game.scaleRank(); return /national/i.test(String(r)); } catch (e) { return false; } })(),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled,
    rotFresh: Math.round(W.rot_fresh || 0), rotPreserved: Math.round(W.rot_preserved || 0),
    starveDays: W.starveDays,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
    freshDaysMax: freshSeries.length ? Math.max.apply(null, freshSeries) : null,
    plentyDays: freshSeries.filter(x => x > 4).length, // days pantry read plentiful
    depriDays, depriDec, depriKcal: Math.round(depriKcal),
    chan: Object.fromEntries(Object.entries(W.chan).map(([k, x]) => [k, Math.round(x)])),
    shareKcal: Math.round(W.shareKcal),
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    // per-seed JSON (telemetry-check --current glob reads these)
    try {
      fs.mkdirSync(PERSEED_DIR, { recursive: true });
      fs.writeFileSync(path.join(PERSEED_DIR, `plentydepri-confirm-b-${SIDE}-${POLICY_ID}-s${s}.json`),
        JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seed: s, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: WANT } }, end }, null, 1));
    } catch (e) { console.error('PERSEED WRITE FAIL', e.message); }
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round((end.rotFresh + end.rotPreserved) / 1000)}k starveD=${end.starveDays} won=${end.won} depri=${end.depriDec} freshMed=${end.freshDaysMedian} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: WANT } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
