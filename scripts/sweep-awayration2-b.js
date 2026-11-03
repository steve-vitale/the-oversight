#!/usr/bin/env node
// sweep-awayration2-b.js — away-ration DIAG + before/after instrument
// (sim-awayration2-b, 2026-11-03, oversight-flesh-out-loop-b, axis
// food-economy; resume of the dead 1330Z awayrationfix arm, which died
// with zero commits, so this arm starts fresh on master 991609dfe.)
//
// QUESTION: on current master (post-packtail top-up), what actually
// limits an away villager's pack meal — the dawn sizing formula, the
// meal-time top-up's pantry limit, or the hunger deduction? The 2026-10-24
// size-b DIAG measured the PRE-top-up world (dawn pack median 880 kcal
// vs ~2,000 need, pack/need median 0.432, hunger at pack median 98).
// This instrument measures the POST-top-up world per away pack meal:
//   dayWant (packMeal's want arg = need - ownEat, the true shortfall),
//   dawn pack kcal (p.dawnKcal at meal time), top-up drawn (pantryDraw
//   calls inside packMeal, phased dawn vs top-up), take (return),
//   shortfall = want - take, hunger at pack time, pantry at meal time.
// DECOMPOSITION (analyzer, fixed before sims):
//   dawnGap  = want - dawnKcal        (what the formula left uncovered)
//   topUpGap = max(0, dawnGap - topUp) (what the pantry could not cover
//                                       at meal time = top-up limit)
//   theftGap = dawnKcal - poolBefore   (spends before the meal, only
//                                       when the pack was NOT already
//                                       topped-up that day; else 0)
//   shortfall should equal topUpGap + theftGap up to piece/ceil
//   overshoot (reported as signed residual, never hidden).
//
// INSTRUMENT ONLY: every wrapper reads and calls through. No RNG is
// consumed by any wrapper, no game value is changed, no Math.random
// is read. The same file runs the BASELINE cell (this branch before
// the fix) and the ARMED cell (after the fix) on identical seeds —
// the only difference is the src/js under test.
//
// DERIVED from scripts/sweep-awayration-size-b.js. Declared deltas:
//   1. Names/paths: awayration2-b-*, corpus
//      evidence/2026-11-03/perseed-awayration2-b/.
//   2. Seeds: PILOT 96101-96108, CONFIRM 96109-96124 (fresh bands:
//      no per-seed filename s96101..s96124 exists in the git index
//      at run start; the analyzer re-asserts seed identity).
//      The sweep refuses any other seed list. DAYS must be exactly
//      100 (death-aware cap: away travel + food basics are an
//      early/mid lever; the 150d size-b pilot yielded 3,336 away
//      days, so 100d still yields far above the 200-day floor).
//   3. packMeal wrapper (NEW): records EVERY call (no dedupe —
//      duplicate villagerMealDay calls on one day are themselves
//      evidence), with want, dawnKcal, poolBefore/After, topUpDone
//      before, pantry before/after, hunger at meal, roster position,
//      and the phased pantryDraw totals (dawn vs top-up).
//   4. pantryDraw wrapper (NEW): active ONLY while a packMeal call
//      is on the stack; otherwise a bare call-through. Phase: on a
//      reseed packMeal call the first draw is the dawn draw, the
//      rest are top-up; on a non-reseed call every draw is top-up.
//   5. packKcal wrapper: reseed rows only (as size-b), plus dayPart
//      at reseed — this proves WHEN the "dawn" pack is actually
//      drawn (lazy first-call time, not literal dawn).
//   6. villagerMealDay wrapper (as size-b): last-wins dedupe per
//      (vid,day) + dup count, so packMeal rows can join to ate,
//      ownEat (= ate - drawn for away rows), fasting, needEst.
//   7. Say window (last 30) + awayLines: every say line naming an
//      away-from-haven meal, capped at 300, for the SENSE test.
//   8. writeRobust (300 attempts, 2s backoff) + stdout streaming
//      to the caller's pipe, never redirected to a file (EPERM
//      lesson #904). Checkpoint corpora live in the worktree
//      evidence dir, NOT /tmp (a prior run lost /tmp checkpoints
//      on a runtime restart).
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
const PILOT = [96101, 96102, 96103, 96104, 96105, 96106, 96107, 96108];
const CONFIRM = [96109, 96110, 96111, 96112, 96113, 96114, 96115, 96116,
  96117, 96118, 96119, 96120, 96121, 96122, 96123, 96124];
const FULL = PILOT.concat(CONFIRM);
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!isList(PILOT) && !isList(CONFIRM) && !isList(FULL)) {
  console.error('FATAL: seeds must be exactly PILOT 96101-96108, CONFIRM 96109-96124, or FULL 96101-96124, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 100) {
  console.error('FATAL: DAYS must be exactly 100, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-03', 'perseed-awayration2-b', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-03', 'perseed-awayration2-b');

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
  const { Game } = await loadGame({ seed, mode: 'awayration2-b-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
    packRows: [], packSkip: 0, packMealRows: [],
    daySeries: [], hungrySeries: [], sayWin: [], teleWin: [], awayLines: [],
    villageDays: 0, starveDays: 0,
    inPackMeal: null, // { draws: [{taken, want}] } while a packMeal call is on the stack
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);
  const pantryKcal = () => { try { return Game.pantryKcalLive ? Math.round(Game.pantryKcalLive(Game.state.village)) : null; } catch (e) { return null; } };

  const snapContext = () => {
    let freshDays = null, pantryKcalV = null, freshKcal = null, spoiledKcal = 0,
      itemCount = 0, unknownCount = 0, pop = null, hungry = 0, awayAtDeath = null;
    try { if (Game.pantryFreshDays) freshDays = Math.round(Game.pantryFreshDays() * 10) / 10; } catch (e) {}
    try { pantryKcalV = pantryKcal(); } catch (e) {}
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
    return { freshDays, pantryKcal: pantryKcalV, pantryFreshKcal: freshKcal, pantrySpoiledKcal: spoiledKcal,
      pantryItemCount: itemCount, unknownKcal0Count: unknownCount, pop, hungry, awayAtDeath };
  };

  // --- deaths: CALL-THROUGH capture ---
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
    try {
      const line = 'd' + (((Game.state || {}).scholar || {}).day || 0) + ' ' + trunc(txt);
      W.sayWin.push(line); if (W.sayWin.length > 30) W.sayWin.shift();
      if (/away from the haven/i.test(String(txt)) && W.awayLines.length < 300) W.awayLines.push(line);
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const oTele = Game.tele;
  if (typeof oTele === 'function') Game.tele = function (type, data) {
    try {
      W.teleWin.push('d' + (((Game.state || {}).scholar || {}).day || 0) + ' ' + String(type) + ' ' + trunc(data ? JSON.stringify(data) : '')); if (W.teleWin.length > 20) W.teleWin.shift();
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  // --- pantryDraw wrapper: records ONLY inside a packMeal call ---
  const oDraw = Game.pantryDraw;
  if (typeof oDraw === 'function') Game.pantryDraw = function (v, want, opts) {
    const result = oDraw.apply(this, arguments);
    try {
      if (W.inPackMeal && result) W.inPackMeal.draws.push({ taken: Math.round(result.taken || 0), want: Math.round(want || 0) });
    } catch (e) {}
    return result;
  };

  // --- packKcal wrapper: reseed rows only, reads only, no RNG ---
  const oPack = Game.packKcal;
  if (typeof oPack === 'function') Game.packKcal = function (vid) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let pre = null, hungerAtPack = null, temper = null, needEst = 2000, pantryKcalAtPack = null, dayPart = null;
    try { pre = (((Game.state || {}).village || {}).pack || {})[vid] || null; } catch (e) {}
    const isReseed = !pre || pre.day !== day;
    if (isReseed) {
      try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAtPack = n ? (n.hunger || 0) : null; } catch (e) {}
      try { temper = Game.npcTemper ? Game.npcTemper(vid) : null; } catch (e) {}
      try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.kcalPerDay) needEst = p.kcalPerDay; } catch (e) {}
      try { pantryKcalAtPack = pantryKcal(); } catch (e) {}
      try { dayPart = Game.dayPart; } catch (e) {}
    }
    const result = oPack.apply(this, arguments);
    if (isReseed) {
      try {
        const post = (((Game.state || {}).village || {}).pack || {})[vid] || null;
        const packDay = post ? post.day : null;
        const key = String(vid) + '|' + day;
        if (!W.packRows.some(r => r._key === key)) {
          W.packRows.push({ _key: key, vid: String(vid).slice(0, 24), day, packKcal: result,
            packDay, needEst, hungerAtPack, temper, pantryKcalAtPack, dayPart });
        } else W.packSkip++;
      } catch (e) {}
    } else W.packSkip++;
    return result;
  };

  // --- packMeal wrapper: EVERY call, no dedupe (dup calls are evidence) ---
  const oPackMeal = Game.packMeal;
  if (typeof oPackMeal === 'function') Game.packMeal = function (vid, want, exposure) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    const v = (Game.state || {}).village || {};
    let pre = null, poolBefore = null, dawnBefore = null, topUpDoneBefore = null;
    let hungerAtMeal = null, healthAtMeal = null, away = null, rosterPos = null, pantryBefore = null;
    try { pre = ((v.pack || {})[vid]) || null; } catch (e) {}
    try { poolBefore = pre ? (pre.kcal ?? null) : null; } catch (e) {}
    try { dawnBefore = pre ? (pre.dawnKcal ?? null) : null; } catch (e) {}
    try { topUpDoneBefore = pre ? !!pre.topUpDone : null; } catch (e) {}
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAtMeal = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthAtMeal = (v.health || {})[vid]; if (healthAtMeal === undefined) healthAtMeal = 100; } catch (e) {}
    try { away = !!((v.away || {})[vid]); } catch (e) {}
    try { rosterPos = (v.roster || []).indexOf(vid); } catch (e) {}
    try { pantryBefore = pantryKcal(); } catch (e) {}
    const reseedNeeded = !pre || pre.day !== day;
    const preDay = pre ? pre.day : null;
    const buf = { draws: [] };
    const prev = W.inPackMeal;
    W.inPackMeal = buf;
    let take = null;
    try { take = oPackMeal.apply(this, arguments); } finally { W.inPackMeal = prev; }
    let dawnKcal = null, poolAfter = null, topUpDoneAfter = null;
    try { const post = ((v.pack || {})[vid]) || null; if (post) { dawnKcal = post.dawnKcal ?? null; poolAfter = post.kcal ?? null; topUpDoneAfter = !!post.topUpDone; } } catch (e) {}
    let dawnDrawn = 0, topUpDrawn = 0;
    buf.draws.forEach((d, i) => { if (reseedNeeded && i === 0) dawnDrawn += d.taken; else topUpDrawn += d.taken; });
    let pantryAfter = null;
    try { pantryAfter = pantryKcal(); } catch (e) {}
    W.packMealRows.push({ vid: String(vid).slice(0, 24), day, want: Math.round(want || 0),
      away, rosterPos, hungerAtMeal, healthAtMeal, pantryBefore, pantryAfter,
      poolBefore, dawnBefore, topUpDoneBefore, dawnKcal, poolAfter, topUpDoneAfter,
      dawnDrawn, topUpDrawn, draws: buf.draws.length, take: (take == null ? null : Math.round(take)),
      reseeded: reseedNeeded, preDay });
    return take;
  };

  // --- villagerMealDay wrapper: reads only, last-wins dedupe ---
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
    const row = { _key: key, vid: String(vid).slice(0, 24), day, away: awayBefore,
      ate: result ? (result.ate ?? null) : null, drawn: result ? (result.drawn ?? null) : null,
      fasting: result ? !!result.fasting : false,
      hungerBefore, hungerAfter, healthBefore, healthAfter, needEst };
    const dupIdx = W.mealRows.findIndex(r => r._key === key);
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
    endReason: result.endReason,
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    deathCauses, deathRows: W.deaths,
    mealRows: W.mealRows.map(({ _key, ...r }) => r),
    packRows: W.packRows.map(({ _key, ...r }) => r),
    packMealRows: W.packMealRows,
    daySeries: W.daySeries, national,
    table: won, win: won,
    waveReach, medianSurvival: null,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
    awayLines: W.awayLines,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup,
    packRowCount: W.packRows.length, packSkipCount: W.packSkip,
    packMealRowCount: W.packMealRows.length, ms,
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
    writeRobust(path.join(PERSEED_DIR, `awayration2-b-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} packMeals=${diag.packMealRowCount} won=${perSeed.win} (${diag.ms}ms)`);
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
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a.seed - b.seed);
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, PILOT, CONFIRM, FULL, DAYS };
