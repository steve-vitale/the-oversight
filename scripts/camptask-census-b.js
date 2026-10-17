#!/usr/bin/env node
// scripts/camptask-census-b.js — CAMPTASK COVERAGE CENSUS (flesh-out loop B,
// 2026-10-17, arm sim-camptasks-b, finding #479 second half).
//
// Diagnostic census of the camp food-processing surface on the courtship
// substrate (FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT, 8 fresh seeds x
// {leadfeast,belongfeast}, 180d death-aware via runDays engine tail).
// Two questions:
//   (1) Which camp food-processing verbs EVER fire (scholar-side +
//       duty-side), which never fire, and who fires them.
//   (2) How much processable-but-unprocessed kcal sits in pack/pantry on
//       lean/starvation days, by pool.
//
// Verbs under observation:
//   Scholar-side (Game methods, engine or policy may call):
//     shell  = shellNuts (in-shell nuts -> shelled nutmeats, 0.75x net)
//     butcher= cleanCarcass (carcass -> cleaned meat, knife gated)
//     cook_single = cookFood (one raw item at a fire)
//     cook_batch  = cookAll (all raw in container at a fire)
//     preserve    = preserveFood (smoke racks, cleaned/cooked meat)
//     render      = renderFat (raw fat -> rendered tallow)
//     pemmican    = makePemmican (2 preserved meat + 1 fat + 2 berries)
//   Duty-side (engine, inline in game.js):
//     duty_preserve = the cook duty's smoke-racks drive (beat: "worked the
//                     smoke racks too"; refusal beat: "racks are already full")
//     duty_cook     = the cook duty's haven meals (beat: "cooked for the haven")
//     hunt_duty_clean = villagerHuntResolve kill (flat 0.60/0.78 cleaning)
// Note: Field Dress (ability) runs the same carcassToMeat pipeline as
// cleanCarcass but is NOT cleanCarcass — it is an ability, not a camp task,
// and is deliberately out of scope (ability actions are not counted).
//
// INSTRUMENT HONESTY: wraps are read-only (stack capture + counters only,
// zero RNG draws, zero state writes); attribution comes from the call
// stack classified against policy/engine frames. The det-gate in
// scripts/test-camptasks-b.js proves byte-identical trajectories
// (instrument on vs off).
//
// ZERO src/js, ZERO scripts/policies edits. Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/camptask-census-b.js
// Targeted: SEEDS="7101" POLICIES="leadfeast" DAYS=60 SMOKE=1 ...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7101, 7102, 7103, 7104, 7105, 7106, 7107, 7108]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-camptask');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// ---- attribution ----
// The call stack of each verb firing is classified against the policy
// engine frames. Policy code is real files (not eval'd), so paths show.
function classifyActor() {
  let st = '';
  try { st = new Error().stack || ''; } catch (e) { st = ''; }
  const pm = st.match(/scripts\/policies\/([^\):\n]+)/);
  if (pm) return 'policy:' + pm[1].replace(/\.js$/, '');
  if (/test-camptasks-b\.js/.test(st)) return 'fixture';
  if (/abilityActions\.js/.test(st)) return 'ability';
  if (/src\/js\/game\.js|src\/js\/food\.js|src\/js\/npc/.test(st)) return 'engine';
  return 'unknown';
}

function classifyContainer(Game, c) {
  try {
    if (!c) return 'pack';
    if (c === Game.state.scholar.inventory) return 'pack';
    const st = Game.prepStash();
    if (st && c === st) return 'stash';
  } catch (e) {}
  return 'other';
}

const SCHOLAR_VERBS = [
  ['shellNuts', 'shell'],
  ['cookFood', 'cook_single'],
  ['cookAll', 'cook_batch'],
  ['cleanCarcass', 'butcher'],
  ['preserveFood', 'preserve'],
  ['renderFat', 'render'],
  ['makePemmican', 'pemmican'],
];

const DUTY_PRESERVE_RE = /worked the smoke racks too/i;
const RACKS_FULL_RE = /racks are already full/i;
const DUTY_COOK_RE = /cooked for the haven/i;

function attachVerbInstrument(Game, t) {
  t.events = [];
  t.errors = t.errors || 0;
  // 1. scholar-side verbs: wrap the Game method, count, attribute.
  for (const [method, verb] of SCHOLAR_VERBS) {
    try {
      if (typeof Game[method] !== 'function') { t.errors++; continue; }
      const orig = Game[method].bind(Game);
      Game[method] = function (idx, container) {
        const actor = classifyActor();
        const cont = classifyContainer(Game, container);
        let out = null, thrownErr = null;
        try { out = orig(idx, container); } catch (e) { thrownErr = e; }
        try {
          t.events.push({ day: gday(Game), verb, actor, container: cont, threw: !!thrownErr });
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    } catch (e) { t.errors++; }
  }
  // 2. hunt-duty cleaning: wrap villagerHuntResolve; a kill (kcal>0) is the
  //    duty's own flat cleaning — counted as one cleaning event with its kcal.
  try {
    if (typeof Game.villagerHuntResolve === 'function') {
      const orig = Game.villagerHuntResolve.bind(Game);
      Game.villagerHuntResolve = function (vid, eff) {
        const out = orig(vid, eff);
        try {
          const kcal = num(out && out.kcal);
          if (kcal && kcal > 0) {
            let who = String(vid);
            try { const p = Game.getPerson(vid); if (p && p.name) who = String(p.name).split(' ')[0]; } catch (e) {}
            t.events.push({ day: gday(Game), verb: 'hunt_duty_clean', actor: 'duty:hunt:' + who, container: 'havenduty', kcal });
          }
        } catch (e) { t.errors++; }
        return out;
      };
    } else { t.errors++; }
  } catch (e) { t.errors++; }
  // 3. duty beats: the cook duty's smoke-racks drive and haven meals are
  //    inline in game.js — captured off the beats they name honestly.
  try {
    const oSay = Game.say ? Game.say.bind(Game) : null;
    if (!oSay) { t.errors++; return; }
    const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 500);
    Game.say = function (msg) {
      try {
        const s = strip(msg);
        if (DUTY_PRESERVE_RE.test(s)) {
          let kcal = null;
          const m = s.match(/~([\d,]+)\s*kcal/);
          if (m) kcal = parseInt(m[1].replace(/,/g, ''), 10);
          t.events.push({ day: gday(Game), verb: 'duty_preserve', actor: 'duty:cook', container: 'pantry', kcal });
        } else if (RACKS_FULL_RE.test(s)) {
          t.events.push({ day: gday(Game), verb: 'duty_preserve_refused', actor: 'duty:cook', container: 'pantry', kcal: null });
        } else if (DUTY_COOK_RE.test(s)) {
          t.events.push({ day: gday(Game), verb: 'duty_cook', actor: 'duty:cook', container: 'haven', kcal: null });
        }
      } catch (e) { t.errors++; }
      return oSay(msg);
    };
    t._oSay = oSay;
  } catch (e) { t.errors++; }
}

// ---- counterfactual pools on lean days ----
// A lean day: the scholar's own bar below half — the policy's own needTrip
// threshold class (finding #477). Pools are raw gross kcal (kcalEach|hiddenKcal)*units.
function poolKcal(items, pred) {
  let k = 0;
  for (const it of (items || [])) {
    if (!it || !pred(it)) continue;
    k += ((it.kcalEach || it.hiddenKcal || 0)) * (it.units || 1);
  }
  return Math.round(k);
}
function samplePools(Game, day) {
  try {
    const s = Game.state.scholar || {};
    const v = Game.state.village || {};
    const inv = s.inventory || [];
    const stash = Game.prepStash ? Game.prepStash() : [];
    const pantry = v.pantry || [];
    const isNut = (it) => it.foodKind === 'nut' && it.foodState === 'in_shell';
    const isCookableRaw = (it) => (it.foodKind === 'meat' && it.foodState === 'cleaned') || !!it.needsCooking;
    const isRawFat = (it) => it.foodKind === 'fat' && it.foodState === 'raw';
    const isCarcass = (it) => it.foodState === 'carcass';
    const isCleanedAtRisk = (it) => it.foodKind === 'meat' && it.foodState === 'cleaned'
      && (it.spoilDay != null) && (it.spoilDay <= day + 2);
    const nuts = poolKcal(inv, isNut) + poolKcal(stash, isNut) + poolKcal(pantry, isNut);
    const cookable = poolKcal(inv, isCookableRaw) + poolKcal(stash, isCookableRaw) + poolKcal(pantry, isCookableRaw);
    const atRisk = poolKcal(pantry, isCleanedAtRisk);
    const rawFat = poolKcal(inv, isRawFat) + poolKcal(stash, isRawFat) + poolKcal(pantry, isRawFat);
    const carcasses = poolKcal(inv, isCarcass) + poolKcal(stash, isCarcass) + poolKcal(pantry, isCarcass);
    let fire = null;
    try { fire = !!Game.nearFire(); } catch (e) { fire = null; }
    return {
      day, scholarKcal: num(s.kcal),
      nuts, cookableRaw: cookable, cleanedAtRisk: atRisk, rawFat, carcasses,
      fireNearby: fire,
      errors: 0,
    };
  } catch (e) { return { day, error: true }; }
}

// ---- food-beat ring (sense reads) ----
const FOOD_BEAT_RE = /shell|crack|nuts?|carcass|clean|cook|smoke|preserve|render|pemmican|fat|nothing edible|nothing to eat|spoil|rotten|went bad|dinner|meal|pantry/i;
function attachBeatRing(Game, t) {
  t.beats = [];
  try {
    const base = Game.say && Game.say.bind(Game);
    const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
    Game.say = function (msg) {
      try {
        const s = strip(msg);
        if (FOOD_BEAT_RE.test(s)) {
          t.beats.push({ day: gday(Game), text: s });
          if (t.beats.length > 3000) t.beats.splice(0, 600);
        }
      } catch (e) {}
      return base(msg);
    };
  } catch (e) { t.errors++; }
}

// ---- death tele (wall metrics) ----
function attachDeathInstrument(Game, t) {
  t.deaths = [];
  try {
    const oTele = Game.tele ? Game.tele.bind(Game) : null;
    Game.tele = function (type, data) {
      const r = oTele ? oTele.apply(this, arguments) : undefined;
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), who: data && data.who, cause, player: !!(data && data.player) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'camptask-census', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const t = { errors: 0 };
  attachBeatRing(Game, t);
  attachVerbInstrument(Game, t);
  attachDeathInstrument(Game, t);
  const hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, leanDays: 0 };
  const leanSamples = [];
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting || pg.tableDone) hist.table = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
      // lean-day pool sampling: scholar bar below half-cap.
      try {
        const cap = G.kcalCap ? G.kcalCap() : 2500;
        if (((G.state.scholar || {}).kcal || 0) < 0.5 * cap) {
          hist.leanDays++;
          const sample = samplePools(G, day);
          if (sample && !sample.error) leanSamples.push(sample);
        }
      } catch (e) { t.errors++; }
    } catch (e) { t.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const days = num(result && result.days);
  const out = {
    schema: 'camptask-census-b/1', seed, policy: policyId, days, errors: t.errors,
    events: t.events,
    leanDays: hist.leanDays, leanSamples,
    deaths: t.deaths,
    beats: t.beats,
    wall: { maxRank: hist.maxRank, table: hist.table, exiled: hist.exiled, starvedDays: hist.starvedDays, maxArc: hist.maxArc, maxWave: hist.maxWave },
  };
  // schema-clean gate: required keys present, every event attributable.
  out.schemaClean = !!(out.events && out.leanSamples && out.deaths && out.beats && out.wall)
    && out.events.every(e => e.verb && e.actor && e.day != null);
  out.unattributed = out.events.filter(e => e.actor === 'unknown').length;
  return out;
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      const fn = `${pid}-${seed}.json`;
      fs.writeFileSync(path.join(EVID, fn), JSON.stringify(r, null, 1));
      rows.push(r);
      console.log(`${pid}-${seed}: days=${r.days} events=${r.events.length} leanDays=${r.leanDays} errors=${r.errors} unattributed=${r.unattributed} schemaClean=${r.schemaClean}`);
    }
  }
  // summary to stdout for the evidence file
  const byVerb = {};
  for (const r of rows) for (const e of r.events) {
    const k = `${e.verb}|${e.actor}|${e.container}`;
    byVerb[k] = (byVerb[k] || 0) + 1;
  }
  console.log('\n=== verb|actor|container counts (16 runs) ===');
  for (const k of Object.keys(byVerb).sort()) console.log(`  ${k}: ${byVerb[k]}`);
  const poolSums = { nuts: 0, cookableRaw: 0, cleanedAtRisk: 0, rawFat: 0, carcasses: 0 };
  let nLean = 0;
  for (const r of rows) for (const s of r.leanSamples) {
    nLean++;
    for (const k of Object.keys(poolSums)) poolSums[k] += (s[k] || 0);
  }
  console.log(`\n=== lean-day pool kcal (${nLean} lean-day samples) ===`);
  for (const k of Object.keys(poolSums).sort((a, b) => poolSums[b] - poolSums[a]))
    console.log(`  ${k}: total=${poolSums[k]} kcal, mean-per-lean-day=${nLean ? Math.round(poolSums[k] / nLean) : 0} kcal`);
  const wall = { national: 0, table: 0, maxWave4: 0, maxWave5: 0 };
  for (const r of rows) {
    if (r.wall.maxRank >= 2) wall.national++;
    if (r.wall.table) wall.table++;
    if (r.wall.maxWave >= 4) wall.maxWave4++;
    if (r.wall.maxWave >= 5) wall.maxWave5++;
  }
  console.log(`\n=== wall (16 runs) === national=${wall.national} table=${wall.table} wave4=${wall.maxWave4} wave5=${wall.maxWave5}`);
  const err = rows.filter(r => r.errors > 0 || !r.schemaClean);
  console.log(`\nerrors/schemaDirty: ${err.length}/16`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { attachVerbInstrument, attachBeatRing, attachDeathInstrument, samplePools, classifyActor, SCHOLAR_VERBS, EVID, oneRun };
