#!/usr/bin/env node
// sweep-plentydepri-b.js — PLENTYDEPRI measurement sweep (sim-plentydepri-b, 2026-10-21).
//
// Steve's ruling (DECISIONS.md 2026-10-21): SURPLUSFEED's post-hoc share trim
// is REMOVED; villagers deprioritize PRODUCTION at the production decision
// itself when food is plentiful (>4 fresh days, duty-PRODTHROTTLE's own
// plenty definition; hungryStreak>=3 stands it down).
//
// Pre-registered PRIMARY: (rot:preserved + rot:fresh) ABSOLUTE per 100 days
// alive — armed <= 0.80x control.
// ENGAGEMENT (kill-fast): plenty-depri eased kcal > 0 on >= 6/16 runs.
// Guardrails: starvation deaths <= control+2 (pair sums); median survival >=
// control-10d; national(end) >= control-1; no new death modes (kind-filtered,
// deduped, thirst/dehydration canonicalized); laundering: named channel
// deltas (share_surplus/away/tribute/traps/duty/system/ambient) — no
// unthrottled channel may grow >2x control; det-gate byte-identical gate-off.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); PLENTYDEPRI=0
// control | =1 armed.
// SIDE=control|armed SEEDS="9001,...,9008" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-plentydepri-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'control';
const WANT = SIDE === 'armed' ? '1' : '0';
if ((process.env.PLENTYDEPRI || '0') !== WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires PLENTYDEPRI=${WANT}`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9001,9002,9003,9004,9005,9006,9007,9008')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-plentydepri-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

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
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
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
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round((end.rotFresh + end.rotPreserved) / 1000)}k starveD=${end.starveDays} won=${end.won} depri=${end.depriDec} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: WANT } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
