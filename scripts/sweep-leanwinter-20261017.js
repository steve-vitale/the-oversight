#!/usr/bin/env node
// scripts/sweep-leanwinter-20261017.js — LEAN-SEASON STARVATION CENSUS +
// PEOPLE-FOOD BEATS (flesh-out loop B, 2026-10-17, food-economy axis).
//
// TWO read-only diagnostic instruments sharing ONE 16-run sweep (no armed
// leg, diagnostics only). ZERO src/js, ZERO scripts/policies edits.
//
// ARM 1 (sim-leanwinter-b): attribute EVERY starvation death (100%
//   binding): pantry fresh-days at onset, season/day-of-year, road, scholar
//   vs villager; half-ration rates (the #340 watch); thirst/dehydration
//   deaths per the sim-thirstcause-b contract (match BOTH 'thirst' and
//   'dehydration', split by player:true); per-seed heterogeneity map.
// ARM 2 (sim-peoplefood-b): food beats (feasts, sharing, refusal, grumbling,
//   openers) captured on the same runs for sense reads (SENSE-TESTING LAW).
//
// SUBSTRATE (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT
// (pre-seat). Policies leadfeast/belongfeast (feastscale-wrapped courtship
// policies). 180d death-aware (+10d tail, engine-side in runDays).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-leanwinter-20261017.js
// Targeted: SEEDS="5101,5102" POLICIES="leadfeast" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-leanwinter-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [5101, 5102, 5103, 5104, 5105, 5106, 5107, 5108]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-leanwinter-b');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'leanwinter-b-foodbeats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// ---- death classifier (starvation contract for this census) ----
// STARVATION: cause matches /starv/i — the engine's honest starvation label
//   (calories.js overnight killedBy >= STARVATION_THRESHOLD; village famine
//   culling at game.js:28173).
// WATER-DEHYDRATION / WATER-THIRST: the sim-thirstcause-b contract (#418) —
//   match BOTH strings; the instrument never merges them.
// NIGHT-OVER: 'the night' — overnight death with trivial deficit or a
//   pre-damaged body (calories.js honesty rule). Hunger-adjacent, NOT
//   starvation; counted separately so the census never inflates starvation.
// NON-HUNGER: everything else.
const DEHYDR_RE = /dehydr/i;
const THIRST_RE = /thirst/i;
const STARV_RE = /starv/i;
const NIGHT_RE = /the night/i;
function classifyDeath(cause) {
  const c = String(cause == null ? '' : cause);
  if (DEHYDR_RE.test(c)) return { cls: 'WATER-DEHYDRATION' };
  if (THIRST_RE.test(c)) return { cls: 'WATER-THIRST' };
  if (STARV_RE.test(c)) return { cls: 'STARVATION' };
  if (NIGHT_RE.test(c)) return { cls: 'NIGHT-OVER' };
  return { cls: 'NON-HUNGER' };
}

function pantryPieces(Game) {
  try { const v = (Game.state || {}).village || {}; return ((v.pantry || []).length) | 0; } catch (e) { return null; }
}
function pantryKcal(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
  } catch (e) { return null; }
}

// Read-only death instrument: verbatim tele capture + at-onset snapshot
// (pantry fresh-days/total/empty + season id/day-of-year). No mutation.
function attachDeathInstrument(Game, t) {
  t.deaths = [];
  t.errors = 0;
  const snap = () => {
    try {
      const d = gday(Game);
      let s = null;
      try { s = Game.season ? Game.season(d) : null; } catch (e) {}
      const sid = s && s.id != null ? String(s.id) : null;
      return {
        freshDays: num((() => { try { return Game.pantryFreshDays(); } catch (e) { return null; } })()),
        totalKcal: pantryKcal(Game),
        empty: pantryPieces(Game) === 0,
        pieces: pantryPieces(Game),
        seasonId: sid,
        dayOfYear: s && num(s.dayOfYear),
        lean: sid != null && /winter/i.test(sid),
      };
    } catch (e) { t.errors++; return { err: true }; }
  };
  const oTele = Game.tele ? Game.tele.bind(Game) : null;
  Game.tele = function (type, data) {
    const r = oTele ? oTele.apply(this, arguments) : undefined;
    try {
      if (type === 'death') {
        const cause = data && (data.cause == null ? null : String(data.cause));
        t.deaths.push({
          day: gday(Game),
          kind: data && data.kind,
          who: data && data.who,
          cause,
          player: !!(data && data.player),
          cls: classifyDeath(cause).cls,
          at: snap(),
        });
      }
    } catch (e) { t.errors++; }
    return r;
  };
}

const FOOD_BEAT_RE = /feast|ration|hungr|starv|meal|cook|grumb|eat\b|eating|share|gave|give|food|dinner|breakfast|pantry/i;
const HALF_RATION_RE = /Half ration/;

// Read-only food instruments:
//  - villageMeal wrap (the ledgerdiag pattern): per-day {halfRation, taken}
//  - top-level say/sysSay wrap: food beats (bounded, for ARM 2 sense reads)
function attachFoodInstruments(Game, t) {
  t.meals = {};
  t.foodBeats = [];
  t.errors = t.errors || 0;
  try {
    const oSay = Game.say ? Game.say.bind(Game) : null;
    const oSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
    const push = (msg, src) => {
      try {
        const s = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 320);
        if (FOOD_BEAT_RE.test(s)) {
          t.foodBeats.push({ day: gday(Game), src, text: s });
          if (t.foodBeats.length > 6000) t.foodBeats.splice(0, 1000);
        }
      } catch (e) {}
    };
    if (oSay) Game.say = function (msg) { push(msg, 'say'); return oSay(msg); };
    if (oSys) Game.sysSay = function (msg) { push(msg, 'sys'); return oSys.apply(this, arguments); };
  } catch (e) { t.errors++; }
  try {
    if (typeof Game.villageMeal === 'function') {
      const orig = Game.villageMeal;
      Game.villageMeal = function () {
        const beats = [];
        const oSay = this.say;
        this.say = function (msg) { try { beats.push(String(msg && (msg.text || msg.msg || msg.message) || msg || '')); } catch (e) {} return oSay.apply(this, arguments); };
        let out;
        try { out = orig.apply(this, arguments); }
        catch (e) { this.say = oSay; throw e; }
        this.say = oSay;
        try {
          const day = gday(Game);
          const text = beats.join('\n');
          const v = (Game.state || {}).village || {};
          t.meals[day] = {
            day,
            halfRation: HALF_RATION_RE.test(text),
            taken: num(v.lastPlayerMeal) || 0,
          };
        } catch (e) { t.errors++; }
        return out;
      };
    }
  } catch (e) { t.errors++; }
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const inst = {};
  attachDeathInstrument(Game, inst);
  attachFoodInstruments(Game, inst);
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
    } catch (e) { inst.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  const gameDays = result.gameDays;
  const causeCounts = {};
  const clsCounts = {};
  for (const d of inst.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
  }
  const halfRationDays = Object.values(inst.meals).filter(m => m.halfRation).length;
  const mealsDays = Object.keys(inst.meals).length;
  const out = {
    seed, policyId,
    days: result.days, gameDays, medianDays: gameDays, endReason: result.endReason,
    // wall-metric key set as NUMBERS (schema-drift LOUD class):
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    sits: 0, // SEATDRIVE=0: no sitting substrate — schema completeness
    wave4: waveMax >= 4 ? 1 : 0,
    wave5: waveMax >= 5 ? 1 : 0,
    maxWave: waveMax, wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    maxRank: hist.maxRank,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays,
    halfRationDays, halfRationRate: mealsDays ? +(halfRationDays / Math.max(1, gameDays)).toFixed(4) : 0,
    causeCounts, clsCounts, deaths: inst.deaths,
    instrumentErrors: inst.errors | 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  if (inst.foodBeats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(inst.foodBeats));
  }
  console.log(`  [${policyId} s${seed}] d=${gameDays} end=${out.endReason} deaths=${inst.deaths.length} starv=${clsCounts.STARVATION || 0} water=${(clsCounts['WATER-THIRST'] || 0) + (clsCounts['WATER-DEHYDRATION'] || 0)} halfr=${halfRationDays} nat=${out.national} wave=${waveMax} err=${inst.errors}`);
  return out;
}

// lib-guard: proof scripts require() this module with LEANWINTER_LIB=1
// to reuse classifyDeath/attachDeathInstrument/attachFoodInstruments
// without running the sweep.
if (process.env.LEANWINTER_LIB === '1') {
  module.exports = { classifyDeath, attachDeathInstrument, attachFoodInstruments, HALF_RATION_RE, FOOD_BEAT_RE };
} else {
for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }
(async () => {
  const recs = [];
  for (const policyId of POLICIES) for (const seed of SEEDS) recs.push(await oneRun(seed, policyId));

  // ---- starvation census inventory ----
  const inv = {};
  let total = 0, starvTotal = 0;
  for (const r of recs) for (const d of r.deaths) {
    total++;
    if (d.cls === 'STARVATION') starvTotal++;
    const key = (d.cause == null ? '<null>' : d.cause);
    const e = inv[key] || (inv[key] = { n: 0, cls: d.cls, player: 0, villager: 0, lead: 0, belong: 0 });
    e.n++; if (d.player) e.player++; else e.villager++;
    if (r.policyId === 'leadfeast') e.lead++; else e.belong++;
  }
  console.log('\n== LEAN-WINTER STARVATION CENSUS: cause inventory ==');
  console.log(`runs=${recs.length} total deaths=${total} starvation=${starvTotal}`);
  for (const [cs, e] of Object.entries(inv).sort((a, b) => b[1].n - a[1].n))
    console.log(`  '${cs}': n=${e.n} cls=${e.cls} player=${e.player} villager=${e.villager} lead=${e.lead} belong=${e.belong}`);

  // ---- thirst/dehydration contract (#418) ----
  let tThirst = 0, tDehyd = 0, tThirstP = 0, tDehydP = 0;
  for (const r of recs) for (const d of r.deaths) {
    if (d.cls === 'WATER-THIRST') { tThirst++; if (d.player) tThirstP++; }
    if (d.cls === 'WATER-DEHYDRATION') { tDehyd++; if (d.player) tDehydP++; }
  }
  console.log(`\nWATER CONTRACT (#418): 'thirst'=${tThirst} (player=${tThirstP}) 'dehydration'=${tDehyd} (player=${tDehydP}) — strings kept separate, roles split`);

  // ---- wall numbers ----
  const s = (f) => recs.reduce((a, r) => a + (r[f] | 0), 0);
  const gd = recs.map(r => r.gameDays).sort((a, b) => a - b);
  const med = gd.length % 2 ? gd[gd.length >> 1] : (gd[gd.length / 2 - 1] + gd[gd.length / 2]) / 2;
  const n = recs.length;
  console.log(`\n== wall numbers ==`);
  console.log(`n=${n} national=${s('national')}/${n} table=${s('table')}/${n} wins=${s('wins')}/${n} exiled=${s('exiled')}/${n} ` +
    `wave4=${s('wave4')}/${n} wave5=${s('wave5')}/${n} arc2=${s('arc2')}/${n} arc3=${s('arc3')}/${n} arc4=${s('arc4')}/${n} fourRealm=${s('fourRealm')}/${n} ` +
    `median=${med.toFixed(1)}d max=${gd[gd.length - 1]}d starvedDays=${s('starvedDays')} halfRationDays=${s('halfRationDays')}`);
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
}
