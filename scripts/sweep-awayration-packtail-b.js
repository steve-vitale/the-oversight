#!/usr/bin/env node
// sweep-awayration-packtail-b.js — away-ration TAIL PACK re-try (baseline vs armed corpora, same instrument).
// Adapted from sweep-awayration-cover-b.js: same capture PLUS a packMeal wrapper (want/pool/take), fresh pilot band 94901-94908.
// (sim-awayration-size-b, 2026-10-24, oversight-flesh-out-loop-b; backlog
// #942, follow-up to sim-fullpantry-diag-b, which classified 3/3
// full-pantry starvation deaths as away-ration but never quantified the
// ration itself).
//
// DIAG arm: measurement only, ZERO src/js changes, no lever re-pricing,
// no away-ration fix landed. Answers ONLY how big the away-ration
// shortfall is: dawn pack kcal vs needEst on away villager-days,
// away meal adequacy, consecutive-inadequate-away-day streaks, and the
// linkage from each villager starvation death back to its preceding
// inadequate-away-day streak — on competent policy, fresh seeds, 150d
// death-aware horizons.
//
// DERIVED from scripts/sweep-fullpantry-diag-b.js. Declared deltas
// (verified by scripts/test-awayration-cover-b.js):
//   1. Names/paths: awayration-size-b-*, corpus
//      evidence/2026-10-25/sim-packtail-b-corpus/{baseline,armed}/.
//   2. Seeds: single BAND 94701-94732 (32 seeds, competent, 150d death-aware).
//      The sweep itself refuses any seed list other than the BAND.
//   3. PACK CAPTURE (new): packKcal wrapper, reads only, no RNG. A pack
//      row is recorded ONLY at a reseed — the pre-call pack entry is
//      absent or stale-day — so the recorded kcal is the dawn-drawn
//      ration before any packSpend. First-wins dedupe: a later same-day
//      packKcal call returns the post-spend remainder and must never
//      overwrite the dawn value (it increments packSkipCount instead).
//      Pack-day alignment is therefore provable: recorded packDay must
//      equal the meal day, and the analyzer hard-fails on any mismatch
//      rather than publishing pack/need ratios.
//   4. Meal-row DEDUPE unchanged from fullpantry: a duplicate (vid,day)
//      key REPLACES the stored row (last call wins) and increments
//      mealDupCount; stored mealRows contain one row per (vid,day).
//   5. Everything else identical in behavior to fullpantry-diag-b:
//      competent FIXED, PLENTYDEPRI=1/DEPOSITGATE=1 FATAL-asserted,
//      registerDeath CALLS THROUGH (capture before call-through),
//      villagerMealDay wrapper (reads only, no RNG), extended death
//      ctx, writeRobust (300 attempts, 2s real-time backoff via
//      performance.now), stdout streams to the caller's pipe, never
//      redirected to a file (EPERM lesson #904).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
  process.exit(2);
}
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BAND = [94901, 94902, 94903, 94904, 94905, 94906, 94907, 94908];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!isList(BAND)) {
  console.error('FATAL: seeds must be exactly BAND 94901-94908, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 150) {
  console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-25', 'sim-packtail-b-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-25', 'sim-packtail-b-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

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
      const t0 = performance.now(); while (performance.now() - t0 < 2000) {}
    }
  }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'packtail-b-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
    packRows: [], packSkip: 0,
    packMealRows: [], packMealDup: 0,
    daySeries: [], hungrySeries: [], sayWin: [], teleWin: [],
    villageDays: 0, starveDays: 0,
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);

  const snapContext = () => {
    let freshDays = null, pantryKcal = null, freshKcal = null, spoiledKcal = 0,
      itemCount = 0, unknownCount = 0, pop = null, hungry = 0, awayAtDeath = null;
    try { if (Game.pantryFreshDays) freshDays = Math.round(Game.pantryFreshDays() * 10) / 10; } catch (e) {}
    try { if (Game.pantryKcalLive) pantryKcal = Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) {}
    try { if (Game.pantryFreshKcal) freshKcal = Math.round(Game.pantryFreshKcal()); } catch (e) {}
    try {
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      itemCount = pantry.length;
      for (const it of pantry) {
        if (!it) continue;
        if ((it.kcalEach || 0) <= 0) unknownCount++;
        try { if (Game.isSpoiled && Game.isSpoiled(it)) spoiledKcal += (it.kcalEach || 0) * (it.units || 1); } catch (e2) {}
      }
      spoiledKcal = Math.round(spoiledKcal);
    } catch (e) {}
    try {
      const roster = ((Game.state || {}).village || {}).roster || [];
      pop = roster.length;
      for (const id of roster) { try { if (Game.npcNeeds && (Game.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e2) {} }
    } catch (e) {}
    return { freshDays, pantryKcal, pantryFreshKcal: freshKcal, pantrySpoiledKcal: spoiledKcal,
      pantryItemCount: itemCount, unknownKcal0Count: unknownCount, pop, hungry, awayAtDeath };
  };

  // --- deaths: CALL-THROUGH capture (declared delta 3) ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    let row = null;
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const whoId = String((opts && (opts.villagerId || '')) || '');
        const who = whoId || String((opts && opts.name) || '?');
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
          const ctx = snapContext();
          const v = (Game.state || {}).village || {};
          ctx.awayAtDeath = whoId ? !!((v.away || {})[whoId]) : null;
          row = { day, who: who.slice(0, 24), whoName, kind, cause,
            isPlayer: whoId ? (whoId === Game.villagerId) : false,
            ctx, sayWin: W.sayWin.slice(-8), teleWin: W.teleWin.slice(-8) };
          W.deaths.push(row);
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  // --- transcript windows ---
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

  // --- villagerMealDay wrapper (declared delta 4): reads only, no RNG ---
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function (vid, person, v, ctx) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let hungerBefore = null, healthBefore = null, needEst = 2000, awayBefore = null;
    try { awayBefore = !!(((v || Game.state.village || {}).away || {})[vid]); } catch (e) {}
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerBefore = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthBefore = ((v || Game.state.village || {}).health || {})[vid]; if (healthBefore === undefined) healthBefore = 100; } catch (e) {}
    try { const p = person || (Game.getPerson && Game.getPerson(vid)); if (p && p.kcalPerDay) needEst = p.kcalPerDay; } catch (e) {}
    let result = null;
    try { result = oMeal.apply(this, arguments); } catch (e) { throw e; }
    let hungerAfter = null, healthAfter = null;
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAfter = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthAfter = ((v || Game.state.village || {}).health || {})[vid]; if (healthAfter === undefined) healthAfter = null; } catch (e) {}
    const key = String(vid) + '|' + day;
    // DEDUPE (fullpantry delta 3): a second villagerMealDay caller fires on
    // some days (pantrystarve: 23 dups / 8,685 rows). Keep ONE row per
    // (vid,day) — the last call wins — and count the replacement.
    const dupIdx = W.mealRows.findIndex(r => r._key === key);
    const row = { _key: key, vid: String(vid).slice(0, 24), day, away: awayBefore,
      ate: result ? (result.ate ?? null) : null, drawn: result ? (result.drawn ?? null) : null,
      fasting: result ? !!result.fasting : false,
      hungerBefore, hungerAfter, healthBefore, healthAfter, needEst };
    if (dupIdx >= 0) { W.mealDup++; W.mealRows[dupIdx] = row; }
    else W.mealRows.push(row);
    return result;
  };

  // --- packKcal wrapper (awayration delta 3): reads only, no RNG ---
  // A pack row is recorded ONLY at a reseed: the pre-call pack entry is
  // absent or stale-day. The post-call value is then the dawn-drawn
  // ration, before any packSpend by the caller. A later same-day call
  // returns the cached (possibly post-spend) remainder and must never
  // overwrite the dawn value — it increments packSkipCount instead.
  // This is what makes pack-day alignment provable: every stored row
  // was written at its own day's reseed, with packDay == day.
  const oPack = Game.packKcal;
  if (typeof oPack === 'function') Game.packKcal = function (vid) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let pre = null, hungerAtPack = null, temper = null, needEst = 2000, pantryKcalAtPack = null;
    try { pre = (((Game.state || {}).village || {}).pack || {})[vid] || null; } catch (e) {}
    const isReseed = !pre || pre.day !== day;
    if (isReseed) {
      try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAtPack = n ? (n.hunger || 0) : null; } catch (e) {}
      try { temper = Game.npcTemper ? Game.npcTemper(vid) : null; } catch (e) {}
      try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.kcalPerDay) needEst = p.kcalPerDay; } catch (e) {}
      try { if (Game.pantryKcalLive) pantryKcalAtPack = Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) {}
    }
    const result = oPack.apply(this, arguments);
    if (isReseed) {
      try {
        const post = (((Game.state || {}).village || {}).pack || {})[vid] || null;
        const packDay = post ? post.day : null;
        const key = String(vid) + '|' + day;
        if (!W.packRows.some(r => r._key === key)) {
          W.packRows.push({ _key: key, vid: String(vid).slice(0, 24), day, packKcal: result,
            packDay, needEst, hungerAtPack, temper, pantryKcalAtPack });
        } else W.packSkip++;
      } catch (e) {}
    } else W.packSkip++;
    return result;
  };

  // --- packMeal wrapper (packtail delta): reads only, no RNG, no draw ---
  // At each packMeal call, record want (the dayWant argument), poolAtMeal
  // (packKcal before the call — the wrapped packKcal reseeds if stale,
  // the same single reseed packMeal itself would trigger, so RNG
  // consumption is unchanged), and take (the packMeal return). The
  // wrapper never draws, never spends, never uses RNG. First-wins
  // dedupe: a second same-day call increments packMealDupCount.
  const oPackMeal = Game.packMeal;
  if (typeof oPackMeal === 'function') Game.packMeal = function (vid, want, exposure) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let poolAtMeal = null;
    try { poolAtMeal = Game.packKcal(vid); } catch (e) {}
    let take = null;
    try { take = oPackMeal.apply(this, arguments); } catch (e) { throw e; }
    const key = String(vid) + '|' + day;
    if (!W.packMealRows.some(r => r._key === key)) {
      W.packMealRows.push({ _key: key, vid: String(vid).slice(0, 24), day, want: want, poolAtMeal, take });
    } else W.packMealDup++;
    return take;
  };

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      const roster = ((G.state || {}).village || {}).roster || [];
      W.villageDays += roster.length;
      for (const id of roster) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      let fd = null, pk = null;
      if (G.pantryFreshDays) { fd = G.pantryFreshDays(); }
      try { if (G.pantryKcalLive) pk = Math.round(G.pantryKcalLive(G.state.village)); } catch (e) {}
      W.daySeries.push({ day: ((G.state || {}).scholar || {}).day || 0, pop: roster.length, hungry,
        freshDays: (fd == null ? null : Math.round(fd * 10) / 10), pantryKcal: pk });
      W.hungrySeries.push(hungry);
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
  const freshSeries = W.daySeries.map(x => x.freshDays).filter(x => x != null);

  const perSeed = {
    seed, policy: 'competent',
    plentydepri: 1, depositgate: 1,
    daysAlive: result.days, villageDays: W.villageDays,
    deathCauses, deathRows: W.deaths,
    mealRows: W.mealRows.map(({ _key, ...r }) => r),
    packRows: W.packRows.map(({ _key, ...r }) => r),
    packMealRows: W.packMealRows.map(({ _key, ...r }) => r),
    daySeries: W.daySeries, national,
    table: won, win: won,
    waveReach, medianSurvival: null,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
  };
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup,
    packRowCount: W.packRows.length, packSkipCount: W.packSkip, packMealRowCount: W.packMealRows.length, packMealDupCount: W.packMealDup, ms,
  };
  return { seed, perSeed, diag };
}

if (require.main === module) (async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `packtail-b-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} packs=${diag.packRowCount} packMeals=${diag.packMealRowCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BAND, DAYS };
