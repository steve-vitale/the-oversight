#!/usr/bin/env node
// sweep-fullpantry-casecount-b.js — full-pantry starvation CASE-COUNT confirm (measurement only)
// (sim-fullpantry-casecount-b, 2026-10-24, oversight-flesh-out-loop-b run fleshout-loop-b-20261025T0030Z; CASE-COUNT confirm of diag-b/confirm-b. Derived, not overwritten: diag/confirm scripts untouched. Intended bands 94501+ collided with awayration-size-b seeds 94501-94508, so per pre-reg shift rule the bands start at 94601.)
//
// DIAG arm: measurement only, ZERO new lever, zero src/js changes. Answers
// ONLY whether full-pantry starvation deaths (pantry >= 8000 kcal AND
// freshDays >= 3.0 at death) are away-ration failures, haven-distribution
// failures, or something else — on competent policy, fresh seeds, 150d
// death-aware horizons. Follow-up to sim-pantrystarve-b, which found
// 5/5 away on seeds 94301-94308 but DIAG-NO-GO on sample size (n<8).
//
// DERIVED from scripts/sweep-pantrystarve-b.js. Declared deltas (verified by
// scripts/test-fullpantry-casecount-b.js):
//   1. Names/paths: fullpantry-casecount-b-*, corpus evidence/2026-10-24/fullpantry-casecount-b-corpus/.
//   2. Seeds: 32-seed batches B1 94601-94632, B2 94633-94664, B3 94665-94696,
//      B4 94697-94728 (shifted +100 from the pre-reg 94501 start after the
//      awayration-size-b 94501-94508 collision). The sweep itself refuses
//      any seed list other than exactly one batch; days 150 ONLY.
//   3. Meal-row DEDUPE (pantrystarve metric-review fix): a second
//      villagerMealDay caller produced 23 duplicate (vid,day) rows in
//      8,685 (0.26%). Here a duplicate key REPLACES the stored row
//      (keeps the last call) and increments mealDupCount; stored
//      mealRows contain one row per (vid,day). Classification window
//      counts are therefore day counts, not row counts.
//   4b. CASECOUNT deltas vs confirm-b: 32-seed batches (shifted to 94601+ after the 94501 collision), sweep accepts exactly one batch per invocation, corpus fullpantry-casecount-b-corpus.
//   4. Everything else byte-identical in behavior to pantrystarve-b:
//      competent FIXED, PLENTYDEPRI=1/DEPOSITGATE=1 FATAL-asserted,
//      registerDeath CALLS THROUGH (capture before call-through),
//      villagerMealDay wrapper (reads only, no RNG), extended death
//      ctx, writeRobust (300 attempts, 2s real-time backoff via
//      performance.now), stdout streams to the caller's pipe, never
//      redirected to a file (EPERM lesson #904).
// The full-pantry gate itself (kcal + fresh days) lives in the
// ANALYZER, not the sweep: the sweep retains every death row, so the
// gate can be audited against the raw corpus.
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
const B1 = Array.from({length: 32}, (_, i) => 94601 + i);
const B2 = Array.from({length: 32}, (_, i) => 94633 + i);
const B3 = Array.from({length: 32}, (_, i) => 94665 + i);
const B4 = Array.from({length: 32}, (_, i) => 94697 + i);
const BATCHES = [B1, B2, B3, B4];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!BATCHES.some(b => isList(b))) {
  console.error('FATAL: seeds must be exactly one 32-seed batch B1 94601-94632, B2 94633-94664, B3 94665-94696, or B4 94697-94728, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 150) {
  console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'fullpantry-casecount-b-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'fullpantry-casecount-b-corpus');

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
  const { Game } = await loadGame({ seed, mode: 'fullpantry-casecount-b-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
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
    daySeries: W.daySeries, national,
    table: won, win: won,
    waveReach, medianSurvival: null,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
  };
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup, ms,
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
    writeRobust(path.join(PERSEED_DIR, `fullpantry-casecount-b-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} won=${perSeed.win} (${diag.ms}ms)`);
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

module.exports = { oneRun, BATCHES, B1, B2, B3, B4, DAYS };
