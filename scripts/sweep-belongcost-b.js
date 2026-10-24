#!/usr/bin/env node
// sweep-belongcost-b.js — belongfeast PD=1 COST CONCENTRATION DIAG (measurement only)
// (sim-belongcost-b, 2026-10-24, oversight-flesh-out-loop-b run fleshout-loop-b-20261024T1130Z, axis food-economy; backlog #889).
//
// DIAG arm: measurement only, ZERO new lever, zero src/js changes. Answers
// ONLY why pdvalue-b's belongfeast PD=1 starvation + new-mode (dehydration,
// alien) excess happens — it does NOT re-litigate the PD=1 value verdict and
// does NOT re-score its guardrails.
//
// DERIVED from scripts/sweep-pdvalue-b.js (cited). Declared deltas vs the
// source instrument (verified by scripts/test-belongcost-b.js, which
// normalizes these and asserts the rest byte-identical):
//   1. Output paths/names: evidence/2026-10-24/belongcost-b-corpus/,
//      belongcost-b-<SIDE>-<DG>-<POLICY>-s<seed>.json; mode 'belongcost-b-*'.
//   2. Default seed list 94101-94108 (pilot ONLY; the runner mechanically
//      refuses any other list — the pdvalue 1030Z confirm-after-kill anomaly
//      must be impossible, not discouraged).
//   3. DEATH-ROW RETENTION (the only measurement change): the registerDeath
//      wrapper keeps its capture semantics byte-identical (including the
//      sweep family's no-call-through behavior — see evidence header metric
//      review) but each death row now carries a context snapshot taken at
//      capture time {pantryFreshDays, pantryKcalLive, pop, hungry,
//      freshTrail7, hungryTrail7, depriDecToDate, depriKcalToDate,
//      dgEasedToDate} plus a transcript window {last 8 Game.say lines,
//      last 8 Game.tele events} truncated at 170 chars. Daily series
//      {day, pop, hungry, freshDays, pantryKcal} retained per config.
//   4. Comments reworded for the DIAG context.
//   5. (mid-pilot, 2026-10-24) writeRobust retry budget 60 -> 300 attempts
//      (2s backoff each, up to ~10min per file): cell pd0-dg1-belongfeast
//      failed its first-seed write on FOUR consecutive attempts, each
//      burning the full 120s budget inside one EPERM-flap window, while
//      direct writes from other processes succeeded between windows.
//      UNPROVEN at amendment time: the first 300-budget run (test P2
//      re-run) ALSO burned the full ~10min budget and failed on the
//      same file — the flap window can exceed 10min. The budget raise
//      is retained (it cannot hurt correctness), but the real
//      mitigation is fresh-process retry + waiting out windows, not
//      a bigger in-process budget. No other write-path behavior
//      changes (atomic temp+rename + read-back).
// Everything else — rot capture, inflow channels, DG ledger, FATAL env
// asserts, death-aware horizons, merge semantics, EPERM-resilient writes —
// is byte-identical to pdvalue-b.
//
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'pd0'; // pd0 | pd1 (PLENTYDEPRI side; PD=2 stripped — see header)
const DG = process.env.DG || 'dg0';     // dg0 | dg1 (DEPOSITGATE side)
const PD_WANT = SIDE === 'pd1' ? '1' : '0';
const DG_WANT = DG === 'dg1' ? '1' : '0';
// STRICT: both gates default-ON in node when unset, so env must be EXPLICIT —
if (process.env.PLENTYDEPRI !== PD_WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires PLENTYDEPRI=${PD_WANT} explicitly (unset = default-ON)`);
  process.exit(2);
}
if (process.env.DEPOSITGATE !== DG_WANT) {
  console.error(`FATAL: DG=${DG} requires DEPOSITGATE=${DG_WANT} explicitly (unset = default-ON)`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS ||
  '94101,94102,94103,94104,94105,94106,94107,94108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'belongcost-b-corpus', `sweep-${SIDE}-${DG}-${POLICY_ID}.json`);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'belongcost-b-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// channel attribution for stockPantry callers (confirm sweep taxonomy)
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

// EPERM-FLAP-RESILIENT WRITE (2026-10-23): this container intermittently
// EPERMs fs.writeFileSync (same flap class as the jest chown EPERM in
// AGENTS.md — writes fail even for root, in fresh processes, then recover
// minutes later). Sweep evidence must not silently go missing: write atomically
// (temp + rename, so a failed attempt never leaves a 0-byte truncation) with
// retries, verify by read-back, and FAIL LOUDLY if the window never opens.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 300; i++) {
    try {
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      // REAL 2s backoff on performance.now() — the flap recovers on a
      // minutes timescale, so retries must actually WAIT. Date.now() is
      // REPLACED by the harness's deterministic clock after loadGame
      // (sim-harness.js: Date.now = () => BASE + callCount), so a
      // Date.now()-based wait completes in ~2000 instant iterations
      // and all 60 retries burn in milliseconds instead of riding out
      // the flap — found 2026-10-24 when the pdvalue confirm run died
      // on EPERM with instant WRITE FAILs. performance.now() is real
      // monotonic time and is never replaced (harness comment confirms
      // pacing telemetry uses it). Proof leg P8 in test-pdvalue-b.js.
      const t0 = performance.now(); while (performance.now() - t0 < 2000) {}
    }
  }
}

// Output routing: STDOUT_SPLIT=1 sends file payloads to stdout with
// @@FILE/@@SWEEP markers for a shell splitter (bash redirection has been
// 100% reliable during EPERM windows; node fs writes flap). Progress goes
// to stderr in that mode.
const STDOUT_SPLIT = process.env.STDOUT_SPLIT === '1';
function emitFile(filePath, data) {
  if (STDOUT_SPLIT) {
    process.stdout.write('@@FILE ' + path.basename(filePath) + '\n');
    process.stdout.write(data + '\n');
    return;
  }
  writeRobust(filePath, data);
}
function emitSweep(data) {
  if (STDOUT_SPLIT) {
    process.stdout.write('@@SWEEP\n');
    process.stdout.write(data + '\n');
    return;
  }
  writeRobust(OUT, data);
}
const progress = (...a) => { if (STDOUT_SPLIT) console.error(...a); else console.log(...a); };

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'belongcost-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), chan: {}, shareKcal: 0, starveDays: 0,
    villageDays: 0, dgHoldbackKcal: 0, rot_fast: 0, rot_preserved: 0,
    daySeries: [], hungrySeries: [], sayWin: [], teleWin: [],
  };
  // --- belongcost: context snapshot helpers (declared delta 3) ---
  const ledgerToDate = (lg, day, field) => {
    let tot = 0, dec = 0;
    try {
      const days = (lg || {}).days || {};
      for (const [k, d] of Object.entries(days)) {
        const kd = Number(k);
        if (!Number.isNaN(kd) && kd > day) continue;
        dec += 1; tot += (d[field] || 0);
      }
    } catch (e) {}
    return { tot: Math.round(tot), dec };
  };
  const snapContext = (day) => {
    let freshDays = null, pantryKcal = null, pop = null, hungry = 0;
    try { if (Game.pantryFreshDays) freshDays = Game.pantryFreshDays(); } catch (e) {}
    try { if (Game.pantryKcalLive) pantryKcal = Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) {}
    try {
      const roster = ((Game.state || {}).village || {}).roster || [];
      pop = roster.length;
      for (const id of roster) { try { if (Game.npcNeeds && (Game.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e2) {} }
    } catch (e) {}
    const depri = ledgerToDate((Game.state.village || {})._plentyDepri, day, 'kcal');
    const dg = ledgerToDate((Game.state.village || {})._depositGate, day, 'shareEased');
    const past7 = W.daySeries.length >= 7 ? W.daySeries[W.daySeries.length - 7] : null;
    const depriDec7d = Math.max(0, depri.dec - (past7 && past7.depriDecCum != null ? past7.depriDecCum : 0));
    return {
      depriDec7d,
      freshDays: (freshDays == null ? null : Math.round(freshDays * 10) / 10),
      pantryKcal, pop, hungry,
      freshTrail7: W.daySeries.slice(-7).map(x => x.freshDays),
      hungryTrail7: W.daySeries.slice(-7).map(x => x.hungry),
      depriDecToDate: depri.dec, depriKcalToDate: depri.tot, dgEasedToDate: dg.tot,
    };
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);

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

  // --- inflow channel attribution: stockPantry (call-path) + stockSurplus (the share funnel) ---
  const oSP = Game.stockPantry;
  if (typeof oSP === 'function') Game.stockPantry = function (kcal, name, opts) {
    try { const c = channelOf(); W.chan[c] = (W.chan[c] || 0) + (kcal || 0); }
    catch (e) {}
    return oSP.apply(this, arguments);
  };
  const oSS = Game.stockSurplus;
  if (typeof oSS === 'function') Game.stockSurplus = function (v, give) {
    const r = oSS.apply(this, arguments);
    try { W.shareKcal += Math.max(0, r || 0); } catch (e) {}
    return r;
  };

  // --- DEPOSITGATE holdback kcal (away.return / ambient.bighaul; the funnel.share
  //     ease is recorded by the game ledger as shareEased kcal) ---
  const oHB = Game._depositGateHoldback;
  if (typeof oHB === 'function') Game._depositGateHoldback = function (vid, kcal, kind) {
    const r = oHB.apply(this, arguments);
    try { if (r > 0) W.dgHoldbackKcal += r; } catch (e) {}
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
          let whoName = who.slice(0, 24);
          try {
            const nm = Game.npcName && Game.npcName(who);
            if (nm && nm !== 'Someone') whoName = String(nm).slice(0, 24);
          } catch (e) {}
          W.deaths.push({ day, who: who.slice(0, 24), whoName, kind, cause,
            ctx: snapContext(day),
            sayWin: W.sayWin.slice(-8), teleWin: W.teleWin.slice(-8) });
        }
      }
    } catch (e) {}
  };

  // --- belongcost: transcript windows (declared delta 3) ---
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (txt) {
    try { W.sayWin.push('d' + (((Game.state || {}).scholar || {}).day || 0) + ' ' + trunc(txt)); if (W.sayWin.length > 20) W.sayWin.shift(); } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const oTele = Game.tele;
  if (typeof oTele === 'function') Game.tele = function (type, data) {
    try {
      W.teleWin.push('d' + (((Game.state || {}).scholar || {}).day || 0) + ' ' + String(type) + ' ' + trunc(data ? JSON.stringify(data) : ''));
      if (W.teleWin.length > 20) W.teleWin.shift();
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  const freshSeries = [];
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      const roster = ((G.state || {}).village || {}).roster || [];
      W.villageDays += roster.length; // exposure: villager-days alive today
      for (const id of roster) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      let fd = null, pk = null;
      if (G.pantryFreshDays) { fd = G.pantryFreshDays(); freshSeries.push(fd); }
      try { if (G.pantryKcalLive) pk = Math.round(G.pantryKcalLive(G.state.village)); } catch (e) {}
      let depriDecCum = null, depriKcalCum = null, dgEasedCum = null;
      try {
        const d0 = (G.state.village || {})._plentyDepri || {};
        depriDecCum = Object.keys(d0.days || {}).length;
        depriKcalCum = Math.round(Object.values(d0.days || {}).reduce((a, d) => a + (d.kcal || 0), 0));
        dgEasedCum = Math.round(Object.values(((G.state.village || {})._depositGate || {}).days || {}).reduce((a, d) => a + (d.shareEased || 0), 0));
      } catch (e) {}
      W.daySeries.push({ day: ((G.state || {}).scholar || {}).day || 0, pop: roster.length, hungry, freshDays: (fd == null ? null : Math.round(fd * 10) / 10), pantryKcal: pk, depriDecCum, depriKcalCum, dgEasedCum });
      W.hungrySeries.push(hungry);
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  // --- PD ledger (eased production decisions; DR dimension stripped — see header) ---
  let depriKcal = 0, depriDec = 0;
  try {
    const lg = (Game.state.village || {})._plentyDepri;
    if (lg) for (const d of Object.values(lg.days || {})) {
      depriDec += (d.depri || 0); depriKcal += (d.kcal || 0);
    }
  } catch (e) {}
  // --- DG ledger (funnel.share eased kcal) + holdback kcal (away.return/bighaul) ---
  let dgShareEased = 0, dgDays = 0;
  try {
    const lg = (Game.state.village || {})._depositGate;
    if (lg) for (const d of Object.values(lg.days || {})) {
      dgDays++; dgShareEased += (d.shareEased || 0);
    }
  } catch (e) {}
  const easedKcal = Math.round(dgShareEased + W.dgHoldbackKcal);

  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);

  // glutChannels partition (schema-exact; analyzer asserts sum ~= total inflow)
  const ch = W.chan;
  const r0 = v => Math.round(v || 0);
  const glutChannels = {
    funnelShare: r0(W.shareKcal + (ch.duty || 0) + (ch.traps || 0)),
    scholarHomecoming: r0(ch.scholar_home || 0),
    tributeDeposit: r0(ch.tribute || 0),
    awayReturn: r0(ch.away_wild || 0),
    ambientBighaul: r0(ch['ambient:villagelives'] || 0),
    other: r0((ch.system || 0) + (ch['ambient:other'] || 0)),
  };

  const perSeed = {
    seed, policy: POLICY_ID,
    plentydepri: PD_WANT === '1' ? 1 : 0, depositgate: DG_WANT === '1' ? 1 : 0,
    daysAlive: result.days, villageDays: W.villageDays,
    rotFreshKcal: Math.round(W.rot_fresh || 0), rotPreservedKcal: Math.round(W.rot_preserved || 0),
    depriKcal: Math.round(depriKcal), easedKcal,
    glutChannels,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
    deathCauses, deathRows: W.deaths, daySeries: W.daySeries, national,
    table: won, win: won, // the win flag IS the table: table.js sets Game.won
    waveReach, medianSurvival: null, // patched by the analyzer with the cell median
  };
  // extra diagnostic fields (NOT in the sibling schema; kept alongside for the analyzer)
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length, depriDec,
    dgDays, dgShareEased: Math.round(dgShareEased),
    dgHoldbackKcal: Math.round(W.dgHoldbackKcal),
    plentyDays: freshSeries.filter(x => x > 4).length,
    freshDaysMax: freshSeries.length ? Math.max.apply(null, freshSeries) : null,
    shareKcal: Math.round(W.shareKcal), chan: Object.fromEntries(Object.entries(ch).map(([k, x]) => [k, r0(x)])),
    inflowTotal: Math.round(W.shareKcal + Object.values(ch).reduce((a, b) => a + (b || 0), 0)),
    ms,
  };
  return { seed, perSeed, diag };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try {
      fs.mkdirSync(PERSEED_DIR, { recursive: true });
    } catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    emitFile(path.join(PERSEED_DIR, `belongcost-b-${SIDE}-${DG}-${POLICY_ID}-s${s}.json`),
      JSON.stringify(perSeed));
    const rotK = Math.round((perSeed.rotFreshKcal + perSeed.rotPreservedKcal) / 1000);
    progress(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} rot=${rotK}k depriK=${Math.round(perSeed.depriKcal / 1000)} easedK=${Math.round(perSeed.easedKcal / 1000)} freshMed=${perSeed.freshDaysMedian} won=${perSeed.win} (${diag.ms}ms)`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  // MERGE (2026-10-24): the summary merges rows by seed with any existing
  // summary file (pilot + full runs share one 16-seed summary per cell).
  // Re-running identical seeds is byte-identical (seeded RNG, same
  // instrument), so merges are idempotent. The merge READ also runs in
  // STDOUT_SPLIT mode (reads don't flap; only the split write goes
  // through bash).
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) {
    if (!STDOUT_SPLIT) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
    // STDOUT_SPLIT: a missing/unreadable summary just means "first run" —
    // the shell verifier enforces the 16-row merge downstream.
  }
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  emitSweep(JSON.stringify({ meta: { cell: SIDE + '-' + DG, policy: POLICY_ID, days: DAYS, seeds: allSeeds, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: PD_WANT, DEPOSITGATE: DG_WANT } }, rows: merged }));
  progress('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
