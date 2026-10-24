#!/usr/bin/env node
// sweep-pooledblock-b.js — pooled-block homecoming sign-flip sweep
// (sim-pooledblock-b, 2026-10-23). MEASUREMENT ONLY — zero src/js changes.
// NAMESPACE COPY of scripts/sweep-homecoming-diag-b.js: third pre-registered
// seed block 92831-92846, identical instrument + substrate, so pooling across
// blocks is legitimate. Diff only: seeds, mode string, per-seed/output names.
//
// Design: {PLENTYDEPRI=0/1}x{DEPOSITGATE=0/1} x {leadfeast,belongfeast} x 16
// fresh seeds (9250-9265; scanned scripts/*.js — zero sim-seed hits) = 64
// configs, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0 (asserted FATAL).
// Instrument: scripts/homecoming-instruments-b.js — per-seed per-day
// marginal-glut inflow attribution into the named channels + unexplained,
// with funnel.share EASED-share kcal and away_wild kcal separated.
//
// CELL=pd0dg0|pd0dg1|pd1dg0|pd1dg1 POLICY=leadfeast|belongfeast SEEDS=.. DAYS=100
//   OUT=<path> PERSEED_DIR=<dir> node scripts/sweep-easingchannels-b.js
// PILOT=1 runs 2 seeds (9250,9251) on the given POLICY (instrument proof).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachEC, dayOf, canonCause } = require('./homecoming-instruments-b');
// Persistent scratch: NEVER /tmp — sibling cleanups wipe /tmp mid-run
// (2026-10-23: a full /tmp wipe destroyed a completed 64-config sweep).
const SCRATCH = path.join(os.homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-pooledblock-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const CELL = process.env.CELL || 'pd0dg0';
const PD = CELL.startsWith('pd1') ? '1' : '0';
const DG = CELL.endsWith('dg1') ? '1' : '0';
// STRICT: unset means default-ON in the game gates, so env must be EXPLICIT.
if (process.env.PLENTYDEPRI !== PD) {
  console.error(`FATAL: CELL=${CELL} requires PLENTYDEPRI=${PD} explicitly (unset = default-ON in game)`);
  process.exit(2);
}
if (process.env.DEPOSITGATE !== DG) {
  console.error(`FATAL: CELL=${CELL} requires DEPOSITGATE=${DG} explicitly (unset = default-ON in game)`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const PILOT = process.env.PILOT === '1';
const SEEDS = (process.env.SEEDS || (PILOT ? '92831,92832' : '92831,92832,92833,92834,92835,92836,92837,92838,92839,92840,92841,92842,92843,92844,92845,92846'))
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(SCRATCH, 'sweep-' + CELL + '-' + POLICY_ID + '.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(__dirname, '..', 'evidence', '2026-10-23', 'perseed-pooledblock-b');

const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const NAMED = ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul'];
// EPERM-flap-resilient write (this VM intermittently EPERMs file writes in
// waves lasting many minutes; retry persistently with 5s backoff, up to
// ~10 min, before giving up — a sweep must not lose data to a flap).
function writeFileRetry(p, data, tries) {
  tries = tries || 120;
  let last = null;
  for (let i = 0; i < tries; i++) {
    try { fs.writeFileSync(p, data); return true; }
    catch (e) {
      last = e;
      if (i < tries - 1) { const t = Date.now(); while (Date.now() - t < 5000); }
    }
  }
  console.error('WRITE FAIL after ' + tries + ' tries: ' + p + ' — ' + (last && last.message));
  return false;
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'pooledblock-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const inst = attachEC(Game);
  const W = inst.W;

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  let lastCtx = null;
  policy.daily = (G, ctx) => {
    lastCtx = ctx;
    inst.daily(G);
    try {
      const rk = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
      W._ranks = W._ranks || [];
      W._ranks.push(rk);
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  inst.readLedgers(Game);
  const policyTrips = (lastCtx && lastCtx.forageTrips) || 0;
  const policyDonatedKcal = Math.round((lastCtx && lastCtx.donatedKcal) || 0);
  const policyDonations = (lastCtx && lastCtx.donated) || 0;

  // ---- marginal-glut aggregates (arrival-time sensor basis) ----
  // "glut days" for per-day normalization: days where the daily-sampled
  // sensor read plentiful (the lever's own plenty-regime measure).
  let glutDays = 0, villageDays = 0;
  for (const [ds, g] of Object.entries(W.dayGlut)) if (g) glutDays++;
  const glutIn = { funnelShare: 0, scholarHomecoming: 0, tributeDeposit: 0, awayReturn: 0, ambientBighaul: 0, other: 0 };
  let glutTotal = 0;
  for (const [ds, cell] of Object.entries(W.glutInflow)) {
    for (const ch of NAMED) { const k = cell[ch] || 0; glutIn[ch] += k; glutTotal += k; }
    const o = cell.other || 0; glutIn.other += o; glutTotal += o;
  }
  let funnelShareGlut = 0, awayReturnGlut = 0;
  for (const [ds, cell] of Object.entries(W.glutInflow)) {
    funnelShareGlut += (cell.funnelShare || 0);
    awayReturnGlut += (cell.awayReturn || 0);
  }
  const awayWildGlut = W.awayWildGlut || 0;
  for (const [ds, r] of Object.entries(W.dayRoster)) villageDays += (r || 0);
  const namedGlut = NAMED.reduce((t, ch) => t + glutIn[ch], 0);
  const attribution = glutTotal > 0 ? namedGlut / glutTotal : null;

  // ---- run totals by channel ----
  const glutChannels = {};
  for (const ch of NAMED) glutChannels[ch] = Math.round(W.inflow[ch] || 0);
  glutChannels.other = Math.round(W.inflow.other || 0);

  // ---- deaths ----
  const deathCauses = {};
  for (const dd of W.deaths) {
    const c = dd.kind + ':' + dd.cause;
    deathCauses[c] = (deathCauses[c] || 0) + 1;
  }
  let starveDeaths = 0;
  for (const dd of W.deaths) if (/starv|hunger/.test(dd.cause)) starveDeaths++;

  // ---- wall fields (engine's own verdicts) ----
  let national = 0, everNational = 0, table = 0, exiled = 0, won = 0, maxWave = 1, rank = '?', arc = 1;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; rank = r; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { for (const r of (W._ranks || [])) if (r === 'national' || r === 'global') { everNational = 1; break; } } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  try { arc = (Game.progState() || {}).arc || 1; } catch (e) {}
  let rosterEnd = 0;
  try { rosterEnd = ((Game.state.village || {}).roster || []).length; } catch (e) {}

  const freshMed = med(W.freshSeries);
  const easedKcal = Math.round((W.funnelShareEased || 0) + (W.returnEased || 0) + (W.bigHaulEased || 0));
  const rotTotal = Math.round((W.rotFresh || 0) + (W.rotPreserved || 0));

  const out = {
    seed, policy: POLICY_ID,
    plentydepri: +PD, depositgate: +DG,
    daysAlive: result.days, villageDays,
    rotFreshKcal: Math.round(W.rotFresh || 0), rotPreservedKcal: Math.round(W.rotPreserved || 0),
    depriKcal: Math.round(W.depriKcal || 0),
    easedKcal,
    glutChannels,
    freshDaysMedian: freshMed == null ? null : Math.round(freshMed * 10) / 10,
    deathCauses,
    national, table, win: won, waveReach: [maxWave], medianSurvival: result.days,
    extra: {
      endReason: result.endReason, rank, everNational, exiled, rosterEnd, arc,
      wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
      glutDays, attribution: attribution == null ? null : +attribution.toFixed(4),
      glutArrivalDays: Object.keys(W.glutDaysSet).length,
      glutInflowTotal: Math.round(glutTotal),
      glutInflowByChannel: Object.fromEntries(Object.entries(glutIn).map(([k, x]) => [k, Math.round(x)])),
      funnelShareGlut: Math.round(funnelShareGlut),
      awayReturnGlut: Math.round(awayReturnGlut),
      awayWildGlut: Math.round(awayWildGlut),
      awayWildTotal: Math.round(W.awayWild || 0),
      funnelShareEased: Math.round(W.funnelShareEased || 0),
      returnEasedKcal: Math.round(W.returnEased || 0),
      bigHaulEasedKcal: Math.round(W.bigHaulEased || 0),
      tributeWaived: Math.round(W.tributeWaived || 0),
      depriDays: W.depriDays, depriDec: W.depriDec,
      funnelShareEasedPerGlutDay: glutDays ? +((W.funnelShareEased || 0) / glutDays).toFixed(1) : null,
      depriKcalPerGlutDay: glutDays ? +(W.depriKcal / glutDays).toFixed(1) : null,
      funnelSharePerGlutDay: glutDays ? +(funnelShareGlut / glutDays).toFixed(1) : null,
      awayWildPerGlutDay: glutDays ? +(awayWildGlut / glutDays).toFixed(1) : null,
      starveDays: W.starveDays, starveDeaths,
      rot100d: result.days ? +((rotTotal / result.days) * 100).toFixed(0) : 0,
      // --- homecoming sub-channel decomposition (DIAG) ---
      hc: Object.assign({}, W.hc, {
        // per-glut-day normalization uses the lever's own plenty-regime
        // measure (dayGlut), same basis as the channel table
        broughtPerGlutDay: glutDays ? +(W.hc.glutBrought / glutDays).toFixed(1) : null,
        keptPerGlutDay: glutDays ? +(W.hc.glutKept / glutDays).toFixed(1) : null,
        depositPerGlutDay: glutDays ? +(W.hc.glutDeposit / glutDays).toFixed(1) : null,
        keepRaisePerGlutDay: glutDays ? +(W.hc.glutKeepRaise / glutDays).toFixed(1) : null,
        decisionsPerGlutDay: glutDays ? +(W.hc.glutDecisions / glutDays).toFixed(3) : null,
        broughtPerDecision: W.hc.decisions ? Math.round(W.hc.brought / W.hc.decisions) : null,
        keptPerDecision: W.hc.decisions ? Math.round(W.hc.kept / W.hc.decisions) : null,
        depositPerDecision: W.hc.decisions ? Math.round(W.hc.deposit / W.hc.decisions) : null,
        // channel-identity check: hc.deposit must equal the scholarHomecoming
        // choke-point channel total (asserted in the proof test per seed)
        channelScholarHomecoming: Math.round(W.inflow.scholarHomecoming || 0),
      }),
      scholarPackEaten: Math.round(W.scholarPackEaten || 0),
      scholarPantryDrawn: Math.round(W.scholarPantryDrawn || 0),
      policyTrips, policyDonatedKcal, policyDonations,
      dayInflow: W.dayInflow, dayGlut: W.dayGlut,
      glutInflow: W.glutInflow,
      otherRaw: Object.fromEntries(Object.entries(W.otherRaw || {}).map(([k, x]) => [k, Math.round(x)])),
      glutOtherRaw: Object.fromEntries(Object.entries(W.glutOtherRaw || {}).map(([k, x]) => [k, Math.round(x)])),
      sayLines: W.sayLines, ms,
      env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: PD, DEPOSITGATE: DG },
    },
  };
  return { seed, out };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, out } = await oneRun(seed, DAYS);
    rows.push(out);
    try {
      fs.mkdirSync(PERSEED_DIR, { recursive: true });
      // sense lines go to a separate per-cell file (they dwarf the corpus schema)
      const ex = Object.assign({}, out.extra);
      delete ex.sayLines; delete ex.dayInflow; delete ex.dayGlut;
      const schemaOut = Object.assign({}, out, { extra: Object.assign({}, ex, {
        sayLineCount: (out.extra.sayLines || []).length,
        dayInflow: out.extra.dayInflow, dayGlut: out.extra.dayGlut,
      }) });
      if (!writeFileRetry(path.join(PERSEED_DIR, `pooledblock-b-${CELL}-${POLICY_ID}-s${s}.json`), JSON.stringify(schemaOut, null, 1)))
        console.error('PERSEED WRITE FAIL', s);
    } catch (e) { console.error('PERSEED WRITE FAIL', e.message); }
    const e = out.extra;
    console.log(`done seed=${s} days=${out.daysAlive} end=${e.endReason} rank=${e.rank} wave=${out.waveReach[0]} rot100d=${e.rot100d} glutDays=${e.glutDays} attr=${e.attribution} fs/gd=${e.funnelSharePerGlutDay} aw/gd=${e.awayWildPerGlutDay} depri/gd=${e.depriKcalPerGlutDay} won=${out.win} (${e.ms}ms)`);
    // COMPACT: single-line JSON summary for stdout capture (survives file-write flaps)
    const gic = e.glutInflowByChannel || {};
    const fiveG = (gic.funnelShare || 0) + (gic.scholarHomecoming || 0) + (gic.tributeDeposit || 0) + (gic.awayReturn || 0) + (gic.ambientBighaul || 0);
    const totG = Object.values(gic).reduce((t, x) => t + x, 0);
    const compact = {
      seed: s, cell: CELL, policy: POLICY_ID, pd: +PD, dg: +DG,
      days: out.daysAlive, villageDays: out.villageDays, endReason: e.endReason,
      rank: e.rank, everNational: e.everNational, national: out.national, table: out.table, win: out.win,
      wave: out.waveReach[0], wave4: e.wave4, wave5: e.wave5, arc: e.arc, exiled: e.exiled,
      rotFresh: out.rotFreshKcal, rotPreserved: out.rotPreservedKcal, rot100d: e.rot100d,
      depriKcal: out.depriKcal, easedKcal: out.easedKcal,
      funnelShareEased: e.funnelShareEased, returnEasedKcal: e.returnEasedKcal, bigHaulEasedKcal: e.bigHaulEasedKcal, tributeWaived: e.tributeWaived,
      glutDays: e.glutDays, attribution: e.attribution,
      fiveCov: totG > 0 ? +(fiveG / totG).toFixed(4) : null,
      glutChannels: out.glutChannels,
      glutInflowByChannel: e.glutInflowByChannel, glutInflowTotal: e.glutInflowTotal,
      funnelShareGlut: e.funnelShareGlut, awayReturnGlut: e.awayReturnGlut, awayWildGlut: e.awayWildGlut, awayWildTotal: e.awayWildTotal,
      funnelSharePerGlutDay: e.funnelSharePerGlutDay, awayWildPerGlutDay: e.awayWildPerGlutDay,
      awayReturnPerGlutDay: e.glutDays ? +((e.awayReturnGlut || 0) / e.glutDays).toFixed(1) : null,
      depriKcalPerGlutDay: e.depriKcalPerGlutDay, funnelShareEasedPerGlutDay: e.funnelShareEasedPerGlutDay,
      hcDecisions: e.hc.decisions, hcTripDecisions: e.hc.tripDecisions, hcOldDecisions: e.hc.oldDecisions,
      hcBrought: e.hc.brought, hcKept: e.hc.kept, hcDeposit: e.hc.deposit,
      hcSpoiled: e.hc.spoiled, hcCapStranded: e.hc.capStranded, hcKeepRaise: e.hc.keepRaise,
      hcKeepRaiseEvents: e.hc.keepRaiseEvents, hcCapDecisions: e.hc.capDecisions,
      hcBroughtPerGlutDay: e.hc.broughtPerGlutDay, hcKeptPerGlutDay: e.hc.keptPerGlutDay,
      hcDepositPerGlutDay: e.hc.depositPerGlutDay, hcKeepRaisePerGlutDay: e.hc.keepRaisePerGlutDay,
      hcBroughtPerDecision: e.hc.broughtPerDecision, hcKeptPerDecision: e.hc.keptPerDecision,
      hcDepositPerDecision: e.hc.depositPerDecision,
      hcChannelIdentity: e.hc.channelScholarHomecoming,
      scholarPackEaten: e.scholarPackEaten, scholarPantryDrawn: e.scholarPantryDrawn,
      policyTrips: e.policyTrips, policyDonatedKcal: e.policyDonatedKcal, policyDonations: e.policyDonations,
      freshDaysMedian: out.freshDaysMedian, starveDays: e.starveDays, starveDeaths: e.starveDeaths,
      deathCauses: out.deathCauses, ms: e.ms,
    };
    console.log('COMPACT ' + JSON.stringify(compact));
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  if (!writeFileRetry(OUT, JSON.stringify({ meta: { cell: CELL, policy: POLICY_ID, days: DAYS, seeds: SEEDS, pilot: PILOT, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: PD, DEPOSITGATE: DG } }, rows: rows.map(r => { const c = Object.assign({}, r); c.extra = Object.assign({}, r.extra); delete c.extra.sayLines; return c; }) }, null, 1)))
    throw new Error('OUT WRITE FAIL (EPERM flap persisted): ' + OUT);
  try {
    const sense = {};
    for (const r of rows) sense['s' + r.seed] = r.extra.sayLines || [];
    if (!writeFileRetry(path.join(SCRATCH, `say-pooledblock-b-${CELL}-${POLICY_ID}.json`), JSON.stringify({ meta: { cell: CELL, policy: POLICY_ID }, say: sense }, null, 1)))
      console.error('SAY WRITE FAIL');
  } catch (e) { console.error('SAY WRITE FAIL', e.message); }
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e && e.stack ? e.stack : e); process.exit(2); });
