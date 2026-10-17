#!/usr/bin/env node
// scripts/census-feastvoice-b.js — FOOD-AXIS HUMANITY CENSUS (flesh-out loop B,
// 2026-10-17, run fleshout-b-2026-10-17T11-06-35Z, arm sim-feastvoice-b).
//
// Evidence-only villager-humanity census on the food axis. 16-run baseline
// sweep (8 fresh seeds x {leadfeast,belongfeast}, FEASTSCALE_R13=1,
// SEATDRIVE=0 EXPLICIT, 180d death-aware via runDays engine tail).
// Captures eating/feast/aid/hunger/half-ration beats with speaker + day +
// context. ZERO src/js, ZERO scripts/policies edits — instrument + analysis
// only.
//
// Substrate asserts: FEASTSCALE_R13=1 (feastscale-wrapped courtship policies;
// without it no feast beats fire at all), SEATDRIVE=0 explicit (pre-seat).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/census-feastvoice-b.js
// Targeted: SEEDS="6101" POLICIES="leadfeast" DAYS=60 SMOKE=1 ...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [6101, 6102, 6103, 6104, 6105, 6106, 6107, 6108]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'feastvoice-b-perseed');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'feastvoice-b-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// NOTE (2026-10-17 sim-feastvoice-b): the pilot-food gossip V2 variant
// ("Found a parcel by the hollow. Dried meat, clean water...") contains no
// food|meal|feast token — the filter MUST name its markers or the variant
// is silently dropped from the corpus (0/120 observed before the fix).
const FOOD_BEAT_RE = /feast|ration|hungr|starv|meal|cook|grumb|mutter|\beat\b|eating|share|gave|give|food|dinner|breakfast|pantry|spoil|parcel|hollow/i;
const HALF_RATION_RE = /Half ration/;
const IKNOWWHY_RE = /I know why/i;
const IDKW_RE = /I don't know why/i;
const AID_RE = /\bgave\b|\bgive\b|shared|sharing|aid\b|helped/i;

const stripTags = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
const msgText = (msg) => stripTags((msg && (msg.text || msg.msg || msg.message)) || msg || '');

function freshDays(Game) {
  try { return Game.pantryFreshDays ? Game.pantryFreshDays() : null; } catch (e) { return null; }
}

// ---- instruments ----
// 1. ambientLine wrap: exact speaker + beat-key + variant text. The eat-class
//    beats (and ambient voice generally) all render through here.
function attachAmbientInstrument(Game, t) {
  t.ambient = [];
  try {
    if (typeof Game.ambientLine === 'function') {
      const orig = Game.ambientLine.bind(Game);
      Game.ambientLine = function (key, vid, nm, arg) {
        let out = null;
        try { out = orig(key, vid, nm, arg); } catch (e) { out = null; }
        try {
          if (out) t.ambient.push({ day: gday(Game), key: String(key), vid: String(vid), nm: stripTags(nm), text: stripTags(out) });
        } catch (e) { t.errors++; }
        return out;
      };
    } else { t.errors++; }
  } catch (e) { t.errors++; }
}
// 2. say/sysSay wrap: food-class beats the narrator voices (feast voicing,
//    status lines, grumbles, village meal narrative, spoil mutters...).
function attachSayInstrument(Game, t) {
  t.saybeats = [];
  t.iKnowWhy = 0; t.iDontKnowWhy = 0; t.halfRationLines = 0; t.aidBeats = 0;
  const push = (msg, src) => {
    try {
      const s = msgText(msg);
      if (!s || !FOOD_BEAT_RE.test(s)) return;
      t.saybeats.push({ day: gday(Game), src, text: s, fd: num(freshDays(Game)) });
      if (t.saybeats.length > 8000) t.saybeats.splice(0, 1500);
      if (IKNOWWHY_RE.test(s)) t.iKnowWhy++;
      if (IDKW_RE.test(s)) t.iDontKnowWhy++;
      if (HALF_RATION_RE.test(s)) t.halfRationLines++;
      if (AID_RE.test(s)) t.aidBeats++;
    } catch (e) {}
  };
  try {
    const oSay = Game.say ? Game.say.bind(Game) : null;
    const oSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
    if (oSay) Game.say = function (msg) { push(msg, 'say'); return oSay(msg); };
    if (oSys) Game.sysSay = function (msg) { push(msg, 'sys'); return oSys.apply(this, arguments); };
  } catch (e) { t.errors++; }
}
// 3. feastEmotionBit wrap: the feast register (which emotional variant fired)
//    with its honest inputs.
function attachFeastInstrument(Game, t) {
  t.feasts = [];
  try {
    if (typeof Game.feastEmotionBit === 'function') {
      const orig = Game.feastEmotionBit.bind(Game);
      Game.feastEmotionBit = function (day, spent, have, quality) {
        let out = null;
        try { out = orig(day, spent, have, quality); } catch (e) { out = null; }
        try {
          t.feasts.push({ day: num(day), spent: num(spent), have: num(have), quality: num(quality), text: stripTags(out) });
        } catch (e) { t.errors++; }
        return out;
      };
    }
  } catch (e) { t.errors++; }
}
// 4. villageMeal wrap: per-day half-ration regime + player take (the #385 class
//    — do deprivation beats acknowledge rationing honestly?).
function attachMealInstrument(Game, t) {
  t.meals = {};
  try {
    if (typeof Game.villageMeal === 'function') {
      const orig = Game.villageMeal;
      Game.villageMeal = function () {
        const beats = [];
        const oSay = this.say;
        this.say = function (msg) { try { beats.push(msgText(msg)); } catch (e) {} return oSay.apply(this, arguments); };
        let out;
        try { out = orig.apply(this, arguments); } catch (e) { this.say = oSay; throw e; }
        this.say = oSay;
        try {
          const day = gday(Game);
          const text = beats.join('\n');
          const v = (Game.state || {}).village || {};
          t.meals[day] = { day, halfRation: HALF_RATION_RE.test(text), taken: num(v.lastPlayerMeal) || 0, fd: num(freshDays(Game)) };
        } catch (e) { t.errors++; }
        return out;
      };
    }
  } catch (e) { t.errors++; }
}
// 5. death tele: wall metrics.
const DEHYDR_RE = /dehydr/i, THIRST_RE = /thirst/i, STARV_RE = /starv/i, NIGHT_RE = /the night/i;
function attachDeathInstrument(Game, t) {
  t.deaths = [];
  const cls = (cause) => {
    const c = String(cause == null ? '' : cause);
    if (DEHYDR_RE.test(c)) return 'WATER-DEHYDRATION';
    if (THIRST_RE.test(c)) return 'WATER-THIRST';
    if (STARV_RE.test(c)) return 'STARVATION';
    if (NIGHT_RE.test(c)) return 'NIGHT-OVER';
    return 'NON-HUNGER';
  };
  try {
    const oTele = Game.tele ? Game.tele.bind(Game) : null;
    Game.tele = function (type, data) {
      const r = oTele ? oTele.apply(this, arguments) : undefined;
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause, player: !!(data && data.player), cls: cls(cause) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const inst = { errors: 0 };
  attachAmbientInstrument(Game, inst);
  attachSayInstrument(Game, inst);
  attachFeastInstrument(Game, inst);
  attachMealInstrument(Game, inst);
  attachDeathInstrument(Game, inst);
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxWave: 1 };
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
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) { inst.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const causeCounts = {}, clsCounts = {};
  for (const d of inst.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
  }
  const halfRationDays = Object.values(inst.meals).filter(m => m.halfRation).length;
  const out = {
    seed, policyId, days: result.days, gameDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    maxRank: hist.maxRank, maxArc: hist.maxArc,
    arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays,
    halfRationDays, halfRationRate: + (halfRationDays / Math.max(1, gameDays)).toFixed(4),
    causeCounts, clsCounts, deaths: inst.deaths,
    iKnowWhy: inst.iKnowWhy, iDontKnowWhy: inst.iDontKnowWhy,
    halfRationLines: inst.halfRationLines, aidBeats: inst.aidBeats,
    nAmbient: inst.ambient.length, nSay: inst.saybeats.length, nFeasts: inst.feasts.length,
    instrumentErrors: inst.errors | 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out));
  fs.mkdirSync(BEATS, { recursive: true });
  fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`),
    JSON.stringify({ seed, policyId, ambient: inst.ambient, saybeats: inst.saybeats, feasts: inst.feasts, meals: inst.meals }));
  console.log(`  [${policyId} s${seed}] d=${gameDays} end=${out.endReason} deaths=${inst.deaths.length} amb=${inst.ambient.length} say=${inst.saybeats.length} feasts=${inst.feasts.length} halfr=${halfRationDays} nat=${out.national} wave=${waveMax} err=${inst.errors}`);
  return out;
}

if (process.env.FEASTVOICE_LIB === '1') {
  module.exports = { attachAmbientInstrument, attachSayInstrument, attachFeastInstrument, attachMealInstrument, attachDeathInstrument };
} else {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required EXPLICITLY.'); process.exit(2); }
  (async () => {
    const all = [];
    for (const seed of SEEDS) {
      for (const p of POLICIES) all.push(await oneRun(seed, p));
    }
    console.log('SWEEP DONE', JSON.stringify({ runs: all.length }));
  })().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
}
