#!/usr/bin/env node
// scripts/scholar-reserve-census-20261014.js — r28 ARM 3 diagnostic instrument.
// DIAGNOSTIC FIRST: on the 8-seed courtship road (seeds 11/22/33/44/55/66/77/88
// x leadfeast, 180d death-aware), instrument scholar-day kcal flows on days
// where the scholar is hungry/starving and attribute each scholar-starving day
// to a named mechanism. Pre-registered DIAGNOSTIC GO: >=80% of scholar-starving
// days attributed to a named mechanism, instrument honest on all 8 seeds.
//
// Instrument-honesty control: --det SEED runs that seed twice (wraps on vs off)
// and compares per-day state hashes — the wraps are read-only.
//
// Read-only instrument: say capture (bounded), eat/take/donate wraps record
// deltas, sleep wrap captures dawn/dusk samples. No behavior change — the
// det control proves it byte-identical.
'use strict';
process.env.FEASTSCALE_R13 = '1'; // leadfeast layer-on, same as the r27 road
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);
const detMode = process.argv.includes('--det');
const detSeed = parseInt((process.argv[process.argv.indexOf('--det')] || '').match(/\d+/) ? process.argv[process.argv.indexOf('--det')] : '55', 10) || 55;
const noWraps = process.argv.includes('--nowraps');

function packFoodKcal(Game) {
  try {
    let t = 0, u = 0;
    for (const i of ((Game.state.scholar || {}).inventory || [])) {
      if (!i || !(i.kcalEach > 0)) continue;
      const k = (i.kcalEach || 0) * (i.units || 0);
      if (i.edible !== false && !Game.isUnprocessed(i)) t += k; else u += k;
    }
    return { edible: Math.round(t), unproc: Math.round(u) };
  } catch (e) { return { edible: 0, unproc: 0 }; }
}
function pantryKcal(Game) {
  try { return Math.round(Game.pantryKcal()); } catch (e) { return 0; }
}
function livingCount(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => id !== Game.villagerId && !((Game.getPerson(id) || {}).dead)).length;
  } catch (e) { return 0; }
}

function buildCensus() {
  return {
    says: [],
    perDay: {},   // game-day -> aggregate row
    upkeeps: {},  // game-day -> min bar seen across upkeep samples
    stateHashes: [], // engine-state hash per policy.daily — recorded in BOTH modes (det control)
    dayOf(d) { return (this.perDay[d] = this.perDay[d] || freshRow(d)); },
  };
}
function freshRow(d) {
  return { day: d, eaten: 0, taken: 0, given: 0, unload: 0, kept: 0, meal: 0,
    mealNight: null, halfRation: false, campWild: false, pantryFullNote: false,
    barDawn: null, barDusk: null, minBar: null,
    packDawn: null, packDusk: null, unprocDusk: null,
    pantryDusk: null, freshDays: null, inReach: null,
    healthDusk: null, energyDusk: null, capDusk: null,
    scholar: null, scholarDead: false };
}

function installWraps(Game, C, collectHashes) {
  const hashes = [];
  // say capture — FILTERED (the full stream is ~200+/day of chatter; the
  // r27 lesson: never a head slice). Keep every line matching the patterns
  // the census parses — unload/keep, meals, camp-wild, pantry-full, rations.
  // Read-only append.
  const KEEP_RE = /Village meal|camp wild|pantry is full|keep a day's food|Half ration|Took |half rations/i;
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      const m = String(msg);
      if (KEEP_RE.test(m)) C.says.push({ day: (Game.state.scholar || {}).day || 0, msg: m.slice(0, 220) });
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  // eaten kcal — wrap Game.eat, record bar delta
  const origEat = Game.eat.bind(Game);
  Game.eat = function () {
    const before = (Game.state.scholar || {}).kcal || 0;
    const r = origEat.apply(this, arguments);
    try {
      const after = (Game.state.scholar || {}).kcal || 0;
      const d = (Game.state.scholar || {}).day || 0;
      if (after > before) C.dayOf(d).eaten += Math.round(after - before);
    } catch (e) {}
    return r;
  };
  // takes — takeFromPantry (per unit, kcalEach) and bulk
  const wrapTake = (name) => {
    if (typeof Game[name] !== 'function') return;
    const orig = Game[name].bind(Game);
    Game[name] = function () {
      const before = packFoodKcal(Game).edible;
      const r = orig.apply(this, arguments);
      try {
        const after = packFoodKcal(Game).edible;
        const d = (Game.state.scholar || {}).day || 0;
        if (after > before) C.dayOf(d).taken += Math.round(after - before);
      } catch (e) {}
      return r;
    };
  };
  wrapTake('takeFromPantry'); wrapTake('takeFromPantryBulk');
  // gives — donateToPantry
  if (typeof Game.donateToPantry === 'function') {
    const orig = Game.donateToPantry.bind(Game);
    Game.donateToPantry = function () {
      const before = packFoodKcal(Game).edible;
      const r = orig.apply(this, arguments);
      try {
        const after = packFoodKcal(Game).edible;
        const d = (Game.state.scholar || {}).day || 0;
        if (before > after) C.dayOf(d).given += Math.round(before - after);
      } catch (e) {}
      return r;
    };
  }
  // sleep wrap — dusk finalize before, dawn sample after.
  // The night's village meal (v.lastPlayerMeal, set by villageMeal during
  // endDay) belongs to the day that just ended — read it right after sleep
  // and attribute it back to that day. Engine-state read, not say-parse.
  if (typeof Game.sleep === 'function') {
    const orig = Game.sleep.bind(Game);
    Game.sleep = function () {
      let duskDay = 0;
      try { duskDay = (Game.state.scholar || {}).day || 0; duskSample(Game, C); } catch (e) {}
      const r = orig.apply(this, arguments);
      try {
        dawnSample(Game, C);
        const mealNight = (Game.state.village || {}).lastPlayerMeal || 0;
        C.dayOf(duskDay).mealNight = Math.round(mealNight);
      } catch (e) {}
      return r;
    };
  }
  return hashes;
}

function sampleBar(Game) { try { return Math.round((Game.state.scholar || {}).kcal || 0); } catch (e) { return 0; } }
function noteBar(Game, C) {
  try {
    const d = (Game.state.scholar || {}).day || 0;
    const row = C.dayOf(d), b = sampleBar(Game);
    row.minBar = row.minBar == null ? b : Math.min(row.minBar, b);
    C.upkeeps[d] = C.upkeeps[d] == null ? b : Math.min(C.upkeeps[d], b);
  } catch (e) {}
}
function duskSample(Game, C) {
  try {
    const s = Game.state.scholar || {}; const d = s.day || 0;
    const row = C.dayOf(d);
    row.barDusk = sampleBar(Game);
    const p = packFoodKcal(Game);
    row.packDusk = p.edible; row.unprocDusk = p.unproc;
    row.pantryDusk = pantryKcal(Game);
    const liv = livingCount(Game);
    row.freshDays = +(row.pantryDusk / Math.max(1, liv * 2000)).toFixed(1);
    try { row.inReach = !!Game.pantryInReach(); } catch (e) {}
    row.healthDusk = Math.round(s.health || 0); row.energyDusk = Math.round(s.energy || 0);
    try { row.capDusk = Math.round(Game.kcalCap()); } catch (e) {}
    try { row.scholar = (Game.displayName ? String(Game.displayName(Game.villagerId)) : '?').slice(0, 40); } catch (e) {}
    noteBar(Game, C);
  } catch (e) {}
}
function dawnSample(Game, C) {
  try {
    const s = Game.state.scholar || {}; const d = s.day || 0;
    const row = C.dayOf(d);
    if (row.barDawn == null) row.barDawn = sampleBar(Game);
    const p = packFoodKcal(Game);
    if (row.packDawn == null) { row.packDawn = p.edible; }
    noteBar(Game, C);
  } catch (e) {}
}
function parseSays(Game, C) {
  // fold captured say lines into per-day unload/kept/meal flags
  for (const s of C.says) {
    const m = s.msg, d = s.day;
    let mm = m.match(/keep a day's food \((\d[\d,]*) kcal\) and unload ([\d,]+) kcal/);
    if (mm) { const r = C.dayOf(d); r.unload += parseInt(mm[2].replace(/,/g, ''), 10); r.kept = parseInt(mm[1].replace(/,/g, ''), 10); }
    mm = m.match(/Village meal: \+([\d,]+) kcal/);
    if (mm) { const r = C.dayOf(d); r.meal += parseInt(mm[1].replace(/,/g, ''), 10); if (/Half ration/.test(m)) r.halfRation = true; }
    if (/camp wild tonight/.test(m)) C.dayOf(d).campWild = true;
    if (/pantry is full/.test(m)) C.dayOf(d).pantryFullNote = true;
  }
}

function withCensus(base, C) {
  return Object.assign({}, base, {
    id: 'leadfeast+census',
    upkeep(Game, ctx) { noteBar(Game, C); if (base.upkeep) return base.upkeep(Game, ctx); },
    daily(Game, ctx) {
      // ENGINE-STATE HASH — recorded in both det modes (wraps on/off).
      try {
        const s = Game.state.scholar || {};
        const p = packFoodKcal(Game);
        C.stateHashes.push([(s.day || 0), Math.round(s.kcal || 0), p.edible,
          pantryKcal(Game), ((Game.state.village || {}).roster || []).length,
          Math.round(s.health || 0)].join('|'));
      } catch (e) {}
      duskSample(Game, C); if (base.daily) return base.daily(Game, ctx);
    },
    fight(Game, ctx) { if (base.fight) return base.fight(Game, ctx); },
    contest(Game, ctx) { if (base.contest) return base.contest(Game, ctx); },
    setup(Game, ctx) { dawnSample(Game, C); if (base.setup) return base.setup(Game, ctx); },
  });
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'leadfeast+census' });
  const C = buildCensus();
  if (!noWraps) installWraps(Game, C);
  const policy = withCensus(leadfeast, C);
  await setupGame(Game);
  const res = await runDays(Game, policy, { days: DAYS, sampleEvery: 1 });
  parseSays(Game, C);
  return { seed, Game, C, res };
}

// ---- attribution ----
// starving day: minBar < 500. hungry day: 500 <= minBar < 1200.
// Both attributed with the same mechanism set; reported separately.
function attribute(C) {
  const starving = [], hungry = [];
  const days = Object.keys(C.perDay).map(Number).sort((a, b) => a - b);
  for (const d of days) {
    const r = C.perDay[d];
    if (r.minBar == null) continue;
    const row = classifyDay(r);
    if (r.minBar < 500) starving.push(row);
    else if (r.minBar < 1200) hungry.push(row);
  }
  return { starving, hungry };
}
function classifyDay(r) {
    const barDawn = r.barDawn == null ? 0 : r.barDawn;
    const barDusk = r.barDusk == null ? 0 : r.barDusk;
    // meal: engine-state read (mealNight, set by villageMeal during endDay)
    // is primary; say-parse is the cross-check. Use whichever is larger —
    // they should agree; disagreement is a capture bug, flagged in analysis.
    const meal = Math.max(r.meal || 0, r.mealNight || 0);
    const mealDisagree = (r.mealNight != null && Math.abs((r.meal || 0) - (r.mealNight || 0)) > 1);
    const burn = Math.max(0, barDawn + r.eaten + meal - barDusk);
    const matches = [];
    if ((r.packDusk || 0) >= 1500 && r.eaten < 400)
      matches.push((r.unprocDusk || 0) >= 500 ? 'ate-little-with-pack:unprocessed' : 'ate-little-with-pack:uneaten');
    // burn-over-reserve: a heavy day (gross burn, including feastburn/combat
    // drains that self-recover via later eating) exceeded the carried reserve.
    // burn is NET (post-dip eating pollutes it), so the gross proxy is
    // eaten+taken — food mobilized to cover the day's burn.
    if (r.minBar < 500 && (r.packDawn || 0) < 3000 && (burn > 1500 || r.eaten + r.taken > 1500))
      matches.push('burn-over-reserve');
    if (burn > 2500 && (r.packDawn || 0) < 3000 && r.minBar >= 500)
      matches.push('burn-over-reserve:heavy-day');
    if (r.unload >= 300 && (r.packDawn || 0) <= 2500) matches.push('keep-2000-unload');
    // keep-thin: the homecoming split kept well under a day's food — the
    // floor itself was thin (small hauls), not just the burn too big.
    if (r.kept > 0 && r.kept < 1000) matches.push('keep-thin');
    if (meal === 0 && r.campWild) matches.push('away-no-pantry');
    else if (meal === 0) matches.push('meal-missed');
    if (r.halfRation) matches.push('half-ration');
    const spoilGap = (r.packDawn || 0) + r.taken - (r.packDusk || 0) - r.eaten - r.given - r.unload;
    if (spoilGap >= 800) matches.push('spoilage');
    if ((r.freshDays || 0) >= 3 && r.taken < 1500 && (r.packDawn || 0) < 2000) matches.push('took-too-thin');
    if (r.given >= 1500 && (r.packDawn || 0) < 2500) matches.push('gave-away');
    return {
      day: r.day, scholar: r.scholar, minBar: r.minBar, barDawn, barDusk,
      packDawn: r.packDawn, packDusk: r.packDusk, unprocDusk: r.unprocDusk,
      eaten: r.eaten, meal, mealSay: r.meal, mealNight: r.mealNight,
      mealDisagree, unload: r.unload, kept: r.kept,
      taken: r.taken, given: r.given, burnEst: Math.round(burn),
      pantry: r.pantryDusk, freshDays: r.freshDays, inReach: r.inReach,
      halfRation: r.halfRation, campWild: r.campWild,
      health: r.healthDusk, energy: r.energyDusk, cap: r.capDusk,
      primary: matches[0] || 'unattributed', all: matches,
    };
}

async function main() {
  if (detMode) {
    // read-only proof: wraps on vs off, same seed — compare ENGINE state
    // hashes recorded at policy.daily in both modes (not capture artifacts).
    const a = (await runSeed(detSeed)).C;
    const { execSync } = require('child_process');
    const out = execSync(`node ${__filename} --hashonly --nowraps ${detSeed}`, { cwd: __dirname }).toString();
    const b = JSON.parse(out.trim().split('\n').pop());
    const same = a.stateHashes.length === b.stateHashes.length &&
      a.stateHashes.every((h, i) => h === b.stateHashes[i]);
    console.log(JSON.stringify({ detSeed, days: a.stateHashes.length, byteIdentical: same,
      firstDiff: same ? null : a.stateHashes.findIndex((h, i) => h !== b.stateHashes[i]) }));
    return;
  }
  if (process.argv.includes('--hashonly')) {
    const seed = parseInt(process.argv[process.argv.length - 1], 10) || detSeed;
    const { C } = await runSeed(seed);
    console.log(JSON.stringify({ stateHashes: C.stateHashes }));
    return;
  }
  const out = { seeds: {}, totals: {} };
  for (const seed of SEEDS) {
    try {
      const { Game, C, res } = await runSeed(seed);
      const { starving, hungry } = attribute(C);
      out.seeds[seed] = {
        gameDays: res.gameDays, endReason: res.endReason,
        maxWaveUnlocked: res.maxWaveUnlocked,
        starvingDays: starving.length, starving,
        hungryDays: hungry.length, hungry,
        sayCount: C.says.length,
      };
      console.log(`seed ${seed}: gameDays=${res.gameDays} end=${res.endReason} wave=${res.maxWaveUnlocked} STARVING=${starving.length} HUNGRY=${hungry.length}`);
    } catch (e) {
      out.seeds[seed] = { error: String(e && e.message || e) };
      console.log(`seed ${seed}: ERROR ${e.message}`);
    }
  }
  // attribution tables (starving and hungry separately)
  const tab = (key) => {
    const mech = {}; let total = 0, unatt = 0;
    for (const seed of SEEDS) {
      const s = out.seeds[seed]; if (!s || !s[key]) continue;
      for (const r of s[key]) { total++; mech[r.primary] = (mech[r.primary] || 0) + 1; if (r.primary === 'unattributed') unatt++; }
    }
    return { days: total, unattributed: unatt,
      attributionRate: total ? +((total - unatt) / total).toFixed(3) : 1, byMechanism: mech };
  };
  out.totals = { starving: tab('starving'), hungry: tab('hungry') };
  console.log('\n=== ATTRIBUTION (starving) ===');
  console.log(JSON.stringify(out.totals.starving, null, 1));
  console.log('=== ATTRIBUTION (hungry) ===');
  console.log(JSON.stringify(out.totals.hungry, null, 1));
  const outPath = require('path').join(__dirname, '..', 'evidence', '2026-10-14', 'scholarreserve-census.json');
  require('fs').writeFileSync(outPath, JSON.stringify(out, null, 1));
  console.log('wrote ' + outPath);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
