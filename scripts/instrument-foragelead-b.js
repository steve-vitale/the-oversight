#!/usr/bin/env node
// scripts/instrument-foragelead-b.js — FORAGE-STREAM ATTRIBUTION AUDIT
// (flesh-out loop B, 2026-10-17, arm sim-foragelead-b, sim-huntduty-b's
// second named next).
//
// sim-huntduty-b measured 893 forage-duty resolutions across 16 runs with NO
// matching policy assignTask attempt. The contender mechanism is the
// engine's taskLeads path (game.js 6079: resolveOneAssignment for
// v.taskLeads entries; ch.task defaults 'forage' at 6124) — but attribution
// is unproven. Foraging is the village's baseline food verb; this instrument
// classifies 100% of the forage stream on the feastscale substrate:
//
//   forage events: EVERY 'Foraged food' pantry inflow (stockPantry name
//     match + depositPantryPieces homecoming) -> {day, kcal, bucket, vid,
//     occupation, taskIn/taskOut, caller}. Named residual bucket:
//     'unclassified-forage' (must be 0 or documented).
//   dutyForage: every resolveOneAssignment with taskIn==='forage'
//     -> {vid, taskIn, taskOut, via} (mirrors the 893 finding).
//   inflow: ALL stockPantry calls by name per day -> forage share of intake.
//   assigns: every Game.assignTask attempt (policy verbs only go through here).
//   leads: per-day v.taskLeads occupancy snapshots (mechanism from state).
//   deaths/wall: wall metrics (national/table/wins/wave/survival).
//
// INSTRUMENT HONESTY: read-only wraps (stack capture + counters + pure
// state reads; zero RNG draws; zero game-state writes — Game._flbCtx is a
// transient attribution slot on the engine object, cleared per call).
// Every wrapper forwards with orig.apply(this, arguments) — NEVER an
// explicit arg list. (2026-10-17: an explicit (id, deed) forward on
// creditDeed silently dropped the third arg trackOverride, perturbing the
// wave-ledger XP and diverging the 7622 trajectory at day 52. Caught by
// the det-gate; fixed by apply-through.)
// The det-gate in scripts/test-foragelead-b.js proves byte-identical
// trajectories (instrument on vs off).
//
// ZERO src/js, ZERO scripts/policies edits. Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/instrument-foragelead-b.js
// Targeted: SEEDS="7621" POLICIES="leadfeast" DAYS=60 SMOKE=1 ...
'use strict';
const fs = require('fs');
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7621, 7622, 7623, 7624, 7625, 7626, 7627, 7628]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-foragelead');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// ---- attribution ----
// Policy code is real files (not eval'd), so paths show in the stack.
function classifyActor() {
  let st = '';
  try { st = new Error().stack || ''; } catch (e) { st = ''; }
  const pm = st.match(/scripts\/policies\/([^\):\n]+)/);
  if (pm) return 'policy:' + pm[1].replace(/\.js$/, '');
  if (/resolveOneAssignment/.test(st)) return 'duty-resolve';
  if (/test-foragelead-b\.js/.test(st)) return 'fixture';
  if (/scripts\/instrument-foragelead-b\.js/.test(st) && /daily/.test(st)) return 'instrument';
  if (/src\/js\/app\.js/.test(st)) return 'ui';
  if (/src\/js\/game\.js|src\/js\/food\.js|src\/js\/npc/.test(st)) return 'engine';
  return 'unknown';
}
function stackText() {
  try { return new Error().stack || ''; } catch (e) { return ''; }
}

// Fallback bucket when no ctx slot is set (should be rare — every known
// 'Foraged food' call site is covered by an explicit ctx wrapper).
function stackBucket(st) {
  if (/villageLives/.test(st)) return 'ambient:villageLives';
  if (/npcNodeTravel/.test(st)) return 'ambient:away-forage';
  if (/villagerInitiative/.test(st)) return 'ambient-social:gratitude';
  if (/ambientSocial/.test(st)) return 'ambient-social:fireside';
  if (/npcTakeAction|npcChildAction/.test(st)) return 'ambient:self-forage';
  if (/checkQuest/.test(st)) return 'player:quest-turnin';
  return 'unclassified-forage';
}

function occOf(Game, vid) {
  try {
    const p = Game.getPerson(vid);
    if (!p) return null;
    return String(p.formerOccupation || p.occupation || '?');
  } catch (e) { return null; }
}

function attachForageInstrument(Game, t) {
  // FLB_NOWRAP: comma-separated wrapper names to skip (det-gate bisect only).
  const NOWRAP = new Set((process.env.FLB_NOWRAP || '').split(',').map(s => s.trim()).filter(Boolean));
  const skip = (n) => NOWRAP.has(n);
  t.forage = [];      // every 'Foraged food' pantry inflow, attributed
  t.inflow = {};      // day -> {name -> kcal} for ALL stockPantry (denominator)
  t.dutyForage = [];  // resolveOneAssignment resolutions with taskIn==='forage'
  t.assigns = [];     // Game.assignTask attempts
  t.beats = [];       // forage-flavored beats (sense reads)
  t.leads = [];       // per-day taskLeads occupancy snapshots
  t.errors = t.errors || 0;

  if (!skip('assignTask')) {
  // ---- assignTask: the complete policy duty-verb surface (policy-side
  // assignBest/assignAnother both funnel through Game.assignTask).
  try {
    if (typeof Game.assignTask !== 'function') { t.errors++; }
    else {
      const orig = Game.assignTask.bind(Game);
      Game.assignTask = function () {
        const vid = arguments[0], task = arguments[1];
        const caller = classifyActor();
        let out = null, thrownErr = null;
        try { out = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
        try {
          let outcome = 'unknown';
          if (thrownErr) outcome = 'threw';
          else if (out && out.ok === true) outcome = 'assigned';
          else if (out && out.ok === false) outcome = out.refused ? 'refused' : 'failed';
          else if (out === null) outcome = 'gate-null';
          t.assigns.push({ day: gday(Game), task: String(task), vid: String(vid), caller, outcome });
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }
  }

  if (!skip('resolveOneAssignment')) {
  // ---- resolveOneAssignment: duty stream context. via: 'duty' (the call
  // received v.assignments[vid] itself), 'tasklead' (v.taskLeads[task]===vid),
  // 'unmapped' (fixture / anything else). Sets Game._flbCtx for the inner
  // stockPantry attribution; restores on exit (reentrancy-safe via prev).
  try {
    if (typeof Game.resolveOneAssignment !== 'function') { t.errors++; }
    else {
      const orig = Game.resolveOneAssignment.bind(Game);
      Game.resolveOneAssignment = function () {
        const vid = arguments[0], a = arguments[1];
        const taskIn = a && a.task ? String(a.task) : '?';
        let via = 'unmapped';
        try {
          const v = Game.state.village || {};
          const asg = v.assignments || {};
          const leads = v.taskLeads || {};
          if (a && asg[vid] === a) via = 'duty';
          else if (leads[taskIn] === vid) via = 'tasklead';
        } catch (e) {}
        const prev = Game._flbCtx || null;
        Game._flbCtx = { path: 'resolve', vid: String(vid), taskIn, taskOut: taskIn, via };
        let out = null, thrownErr = null;
        try { out = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
        try {
          const taskOut = a && a.task ? String(a.task) : '?';
          const day = gday(Game);
          if (taskIn === 'forage') {
            t.dutyForage.push({ day, vid: String(vid), taskIn, taskOut, via, caller: classifyActor(), threw: !!thrownErr });
            // patch the forage event(s) this resolution produced (redirects
            // produce none): name the bucket honestly.
            for (let i = t.forage.length - 1; i >= 0; i--) {
              const e = t.forage[i];
              if (e.day !== day) break;
              if (e.taskIn === 'forage' && e.vid === String(vid) && !e._patched) {
                e._patched = true;
                e.taskOut = taskOut;
                e.bucket = via === 'duty'
                  ? (taskIn === taskOut ? 'duty:forage' : 'duty:forage-redirect')
                  : via === 'tasklead'
                    ? (taskIn === taskOut ? 'tasklead:forage' : 'tasklead:forage-redirect')
                    : e.bucket;
              }
            }
          } else if (taskIn === 'scout') {
            // scout-branch cache finds: name them.
            for (let i = t.forage.length - 1; i >= 0; i--) {
              const e = t.forage[i];
              if (e.day !== day) break;
              if (e.taskIn === 'scout' && e.vid === String(vid) && e.bucket === 'resolve') {
                e.bucket = via + ':scout-cache';
              }
            }
          }
        } catch (e) { t.errors++; }
        Game._flbCtx = prev;
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }
  }

  if (!skip('stockPantry')) {
  // ---- stockPantry: the single pantry-inflow verb. Every call feeds the
  // denominator; 'Foraged food' calls become attributed forage events.
  try {
    if (typeof Game.stockPantry !== 'function') { t.errors++; }
    else {
      const orig = Game.stockPantry.bind(Game);
      Game.stockPantry = function () {
        const kcal = arguments[0], name = arguments[1];
        const day = gday(Game);
        const k = num(kcal);
        try {
          const nm = String(name || '?');
          t.inflow[day] = t.inflow[day] || {};
          t.inflow[day][nm] = (t.inflow[day][nm] || 0) + (k || 0);
        } catch (e) { t.errors++; }
        let out = null, thrownErr = null;
        try { out = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
        try {
          if (String(name) === 'Foraged food') {
            const ctx = Game._flbCtx || null;
            let bucket, vid = ctx && ctx.vid ? String(ctx.vid) : null;
            let taskIn = (ctx && ctx.taskIn) || null, taskOut = (ctx && ctx.taskOut) || null;
            if (ctx && ctx.path === 'resolve') bucket = 'resolve'; // named by the resolve wrapper post-pass
            else if (ctx && ctx.path) bucket = ctx.path;
            else bucket = stackBucket(stackText());
            t.forage.push({ day, kcal: k, bucket, vid, occ: vid ? occOf(Game, vid) : null, taskIn, taskOut, caller: classifyActor(), threw: !!thrownErr });
          }
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }
  }

  if (!skip('villageLives')) {
  // ---- villageLives: the ambient free-villager loop (big-day + haul
  // branches). ctx marks the bucket; the forager's identity arrives via
  // creditDeed(id,'foraging') right after stockPantry in the same branch.
  try {
    if (typeof Game.villageLives === 'function') {
      const orig = Game.villageLives.bind(Game);
      Game.villageLives = function () {
        const prev = Game._flbCtx || null;
        Game._flbCtx = { path: 'ambient:villageLives', vid: null, taskIn: null, taskOut: null };
        let out = null, thrownErr = null;
        try { out = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
        Game._flbCtx = prev;
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }
  }
  if (!skip('creditDeed')) {
  try {
    if (typeof Game.creditDeed === 'function') {
      const orig = Game.creditDeed.bind(Game);
      Game.creditDeed = function () {
        const id = arguments[0], deed = arguments[1];
        let out = null, thrownErr = null;
        try { out = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
        try {
          if (deed === 'foraging' && /villageLives/.test(stackText())) {
            for (let i = t.forage.length - 1; i >= 0; i--) {
              const ev = t.forage[i];
              if (ev.bucket === 'ambient:villageLives' && !ev.vid) {
                ev.vid = String(id); ev.occ = occOf(Game, id); break;
              }
            }
          }
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }
  }

  if (!skip('npcTakeAction')) {
  // ---- npcTakeAction: hunger-driven self-foraging (villagers forage an
  // adjacent green, eat some, bring some home). rid is the first arg.
  try {
    if (typeof Game.npcTakeAction === 'function') {
      const orig = Game.npcTakeAction.bind(Game);
      Game.npcTakeAction = function () {
        const rid = arguments[0];
        const prev = Game._flbCtx || null;
        Game._flbCtx = { path: 'ambient:self-forage', vid: String(rid), taskIn: null, taskOut: null };
        let out = null, thrownErr = null;
        try { out = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
        Game._flbCtx = prev;
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }
  }

  if (!skip('depositPantryPieces')) {
  // ---- depositPantryPieces: homecoming hauls (player-side trail haul).
  // Only record when the resolved name is 'Foraged food'.
  try {
    if (typeof Game.depositPantryPieces === 'function') {
      const orig = Game.depositPantryPieces.bind(Game);
      Game.depositPantryPieces = function () {
        const item = arguments[1];
        const st = stackText();
        const caller = classifyActor();
        let out = null, thrownErr = null;
        try { out = orig.apply(this, arguments); } catch (e) { thrownErr = e; }
        try {
          const nm = item && item.name ? String(item.name) : 'Foraged food';
          if (nm === 'Foraged food') {
            // depositPantryPieces returns the exact kcal deposited.
            const k = num(out);
            let bucket = 'player:homecoming-other';
            if (/returnToVillage/.test(st)) bucket = 'player:homecoming-haven';
            else if (/returnToOldVillage/.test(st)) bucket = 'player:homecoming-old';
            t.forage.push({ day: gday(Game), kcal: k, bucket, vid: null, occ: null, taskIn: null, taskOut: null, caller, threw: !!thrownErr });
          }
        } catch (e) { t.errors++; }
        if (thrownErr) throw thrownErr;
        return out;
      };
    }
  } catch (e) { t.errors++; }
  }

  if (!skip('say')) {
  // ---- forage beat ring (sense reads): any say() mentioning foraging.
  try {
    const base = Game.say && Game.say.bind(Game);
    if (!base) { t.errors++; }
    else {
      const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
      Game.say = function () {
        const msg = arguments[0];
        try {
          const s = strip(msg);
          if (/forag|🌿|pantry breathes|armful of something edible/i.test(s)) {
            t.beats.push({ day: gday(Game), text: s });
            if (t.beats.length > 3000) t.beats.splice(0, 600);
          }
        } catch (e) { t.errors++; }
        return base.apply(this, arguments);
      };
    }
  } catch (e) { t.errors++; }
  }
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
          t.deaths.push({ day: gday(Game), who: data && data.who, cause: data && data.cause == null ? null : String(data && data.cause), player: !!(data && data.player) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
}

// taskLeads occupancy snapshot (pure reads): mechanism-from-state.
function leadsSnapshot(Game) {
  const out = [];
  try {
    const v = Game.state.village || {};
    const leads = v.taskLeads || {};
    for (const task of Object.keys(leads)) {
      const lead = leads[task];
      const onRoster = (v.roster || []).includes(lead);
      out.push({ task, lead: String(lead), onRoster, occ: occOf(Game, lead) });
    }
  } catch (e) {}
  return out;
}

// day-0 roster occupation histogram (pure reads).
function rosterOccHist(Game) {
  const hist = {};
  try {
    const v = Game.state.village || {};
    for (const vid of (v.roster || [])) {
      let occ = '?';
      try {
        const p = Game.getPerson(vid);
        if (p && !p.dead) occ = String(p.formerOccupation || p.occupation || '?');
        else continue;
      } catch (e) { continue; }
      hist[occ] = (hist[occ] || 0) + 1;
    }
  } catch (e) {}
  return hist;
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'foragelead-audit', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const t = { errors: 0 };
  attachForageInstrument(Game, t);
  attachDeathInstrument(Game, t);
  const occ0 = rosterOccHist(Game);
  const hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, wins: false };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting || pg.tableDone) hist.table = true;
      if (G.won) hist.wins = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
      if (day % 10 === 0 || day === 1) t.leads.push({ day, entries: leadsSnapshot(G) });
    } catch (e) { t.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const days = num(result && result.days);
  // strip the internal _patched flag before writing
  for (const e of t.forage) delete e._patched;
  const out = {
    schema: 'foragelead-audit/1', seed, policy: policyId, days, errors: t.errors,
    rosterOccDay0: occ0,
    forage: t.forage,
    inflow: t.inflow,
    dutyForage: t.dutyForage,
    assigns: t.assigns,
    deaths: t.deaths,
    leads: t.leads,
    beats: t.beats,
    wall: {
      maxRank: hist.maxRank, table: hist.table, wins: hist.wins, exiled: hist.exiled,
      starvedDays: hist.starvedDays, maxArc: hist.maxArc, maxWave: hist.maxWave,
    },
  };
  out.schemaClean = Array.isArray(out.forage) && Array.isArray(out.dutyForage) && Array.isArray(out.assigns)
    && out.forage.every(e => e.day != null && typeof e.kcal === 'number' && e.bucket)
    && out.dutyForage.every(e => e.taskIn && e.taskOut && e.via);
  out.unclassified = out.forage.filter(e => e.bucket === 'unclassified-forage').length;
  return out;
}

// ---- per-seed panel-schema JSON (wall + forage audit) ----
function panelRow(r) {
  const deathCauses = {};
  for (const d of (r.deaths || [])) {
    const c = (d.cause || 'unknown');
    deathCauses[c] = (deathCauses[c] || 0) + 1;
  }
  const byBucket = {};
  let forageKcal = 0;
  for (const e of (r.forage || [])) {
    byBucket[e.bucket] = byBucket[e.bucket] || { events: 0, kcal: 0 };
    byBucket[e.bucket].events++;
    byBucket[e.bucket].kcal += (e.kcal || 0);
    forageKcal += (e.kcal || 0);
  }
  let inflowKcal = 0;
  for (const d of Object.keys(r.inflow || {})) for (const n of Object.keys(r.inflow[d])) inflowKcal += r.inflow[d][n];
  return {
    schemaVersion: 1, schema: 'foragelead-wall/1', seed: r.seed, policy: r.policy,
    substrate: 'courtship FEASTSCALE_R13=1 SEATDRIVE=0', days: r.days,
    metrics: {
      national: r.wall.maxRank >= 2 ? 1 : 0,
      table: r.wall.table ? 1 : 0,
      wins: r.wall.wins ? 1 : 0,
      maxArc: r.wall.maxArc, maxWave: r.wall.maxWave,
      exiled: r.wall.exiled ? 1 : 0,
      starvedDays: r.wall.starvedDays,
      deaths: (r.deaths || []).length,
      deathCauses,
      medianSurvival: null, // filled by the analyzer across the corpus
    },
    forageAudit: {
      forageKcal, inflowKcal,
      forageShareOfInflow: inflowKcal > 0 ? forageKcal / inflowKcal : null,
      byBucket,
      dutyForageResolutions: (r.dutyForage || []).length,
      taskleadForageResolutions: (r.dutyForage || []).filter(e => e.via === 'tasklead').length,
      dutyForageAssignAttempts: (r.assigns || []).filter(e => e.task === 'forage').length,
      unclassified: r.unclassified,
    },
  };
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      fs.writeFileSync(path.join(EVID, `${pid}-${seed}.json`), JSON.stringify(r, null, 1));
      fs.writeFileSync(path.join(EVID, `wall-${pid}-${seed}.json`), JSON.stringify(panelRow(r), null, 1));
      rows.push(r);
      console.log(`${pid}-${seed}: days=${r.days} forageEvents=${r.forage.length} forageKcal=${r.forage.reduce((t, e) => t + (e.kcal || 0), 0)} dutyForageRes=${r.dutyForage.length} unclassified=${r.unclassified} errors=${r.errors} schemaClean=${r.schemaClean}`);
    }
  }
  const byBucket = {};
  for (const r of rows) for (const e of r.forage) {
    byBucket[e.bucket] = byBucket[e.bucket] || { events: 0, kcal: 0 };
    byBucket[e.bucket].events++;
    byBucket[e.bucket].kcal += (e.kcal || 0);
  }
  console.log('\n=== forage buckets (all runs): events / kcal ===');
  for (const k of Object.keys(byBucket).sort()) console.log(`  ${k}: ${byBucket[k].events} / ${byBucket[k].kcal} kcal`);
  const byVia = {};
  for (const r of rows) for (const e of r.dutyForage) {
    const k = `${e.via}|${e.taskIn}${e.taskIn !== e.taskOut ? '->' + e.taskOut : ''}`;
    byVia[k] = (byVia[k] || 0) + 1;
  }
  console.log('\n=== dutyForage resolutions via|taskIn[->taskOut] (all runs) ===');
  for (const k of Object.keys(byVia).sort()) console.log(`  ${k}: ${byVia[k]}`);
  const forageAssigns = rows.reduce((t, r) => t + r.assigns.filter(e => e.task === 'forage').length, 0);
  console.log(`\n=== policy forage assignTask attempts: ${forageAssigns} ===`);
  let inflowKcal = 0, forageKcal = 0;
  for (const r of rows) {
    for (const e of r.forage) forageKcal += (e.kcal || 0);
    for (const d of Object.keys(r.inflow)) for (const n of Object.keys(r.inflow[d])) inflowKcal += r.inflow[d][n];
  }
  console.log(`=== inflow: forage ${forageKcal} kcal / total ${inflowKcal} kcal = ${(100 * forageKcal / Math.max(1, inflowKcal)).toFixed(1)}% ===`);
  const wall = { national: 0, table: 0, wins: 0, maxWave4: 0, maxWave5: 0 };
  for (const r of rows) {
    if (r.wall.maxRank >= 2) wall.national++;
    if (r.wall.table) wall.table++;
    if (r.wall.wins) wall.wins++;
    if (r.wall.maxWave >= 4) wall.maxWave4++;
    if (r.wall.maxWave >= 5) wall.maxWave5++;
  }
  console.log(`\n=== wall (${rows.length} runs) === national=${wall.national} table=${wall.table} wins=${wall.wins} wave4=${wall.maxWave4} wave5=${wall.maxWave5}`);
  const err = rows.filter(r => r.errors > 0 || !r.schemaClean || r.unclassified > 0);
  console.log(`\nerrors/schemaDirty/unclassified>0: ${err.length}/${rows.length}`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { attachForageInstrument, attachDeathInstrument, classifyActor, occOf, leadsSnapshot, rosterOccHist, EVID, oneRun, panelRow };
