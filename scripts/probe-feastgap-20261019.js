#!/usr/bin/env node
// probe-feastgap-20261019.js — lead-vs-belong deferral-5 divergence diagnostic
// instrument (flesh-out loop arm sim-feastgap, run fleshout-20261019T1415Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. Wraps the policy daily with PURE engine reads (no state writes,
// no RNG draws) + a read-only Game.tele death capture (the vetwindow pattern)
// + call-through Game.payTribute / Game.tendLink / Game.hostFeast flow
// recording + the KILLDISC read-only kill census (KILLDISC=1). The DET gate
// pins instrument-on vs instrument-off byte-identical trajectories.
//
// WHERE THIS SITS: sim-windowsurvive (2026-10-19, evidence/2026-10-19/
// sim-windowsurvive.md) found on the same pre-seat full win-side substrate:
// leadfeast reached deferral-5 on 8/8 seeds (first d57-d107), belongfeast only
// 2/8 (d74, d113). WHY the policy gap exists is unmeasured. This arm
// measures, per seed-pair, the divergence DAY and the named MECHANISM:
// when each policy enters each deferral, where belong stalls vs lead —
// pantry curves, starvation events, scholar deaths, raid deaths, roster size,
// wave-4 reach, combat readiness legs, and the tribute/tend/feast flows that
// separate the two roads (lead TENDS its subordinates outward; belong PAYS
// tribute upward as a subordinate).
//
// SUBSTRATE (pre-seat win-side stack, NO vetrel):
//   withSeatDrive(withWinDefer(withReposition(TF base)))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1
//   (SEATDRIVE='0' -> seatdrive pure delegation; REPOSITION unset -> inert;
//   VETREL unset -> companion-veteran channel OFF — the pure tribfloor
//   divergence surface; KILLDISC='1' -> read-only kill census installed.)
//
// The door (windowsurvive-identical): deferral(5) true >= 1 day, i.e.
// Game.standingDeferral(5).deferred — capped standing >= t5 while the wave-5
// readiness bar is unmet.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   node scripts/probe-feastgap-20261019.js
//   SMOKE=1 ...        # short smoke: both policies drive, census live
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="64201,64202" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const KD = require('./killdisc-instrument-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — pre-seat win-side stack, NO vetrel. All ones must be
// '1'; SEATDRIVE must be '0'; REPOSITION and VETREL must NOT be '1'.
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (feastgap substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1 (pre-seat substrate).'); process.exit(2); }
if (process.env.VETREL === '1') { console.error('SWEEP STOP: VETREL must NOT be 1 (feastgap is the no-vetrel divergence surface).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() true despite SEATDRIVE=0.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-feastgap');
const isBare = () => process.env.FEASTGAP_BARE === '1';

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition — the pre-seat win-side stack, NO vetrel.
function policyFor(policyId) {
  const base = baseFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION unset: inert)`);
  const wd = WD.withWinDefer(rp, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack (SEATDRIVE=0: pure delegation)`);
}

// ---------------------------------------------------------------------------
// DEATH-CHANNEL TAXONOMY — copied verbatim from
// scripts/probe-windowsurvive-20261019.js (2026-10-19), itself the
// vetwindow-identical classifier (2026-10-18). IDENTICAL BY CONSTRUCTION so
// channel shares stay comparable across arms. Known trap kept identical:
// 'dehydration' -> 'other' (cause-unmapped), while 'thirst' -> 'haven'.
// The cause is named in every row so the verdict stays auditable.
const DISEASE_IDS = new Set(['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles',
  'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind',
  'eurika', 'east_nile', 'lemons']);
const DISEASE_RES = [/^sickness$/i, /food poisoning|bad belly|spoiled gut|poisoned/i,
  /^(wound fever|gut rot|tick fever)$/i];

function classifyDeath(causeRaw, ctx, monsterNames) {
  const cause = String(causeRaw == null ? 'unknown' : causeRaw);
  const lc = cause.toLowerCase();
  ctx = ctx || {};
  monsterNames = monsterNames || new Set();
  if (cause === 'raid' || cause === 'raid-defense') return ['raid', 'cause'];
  if (cause === 'expedition') return ['expedition', 'cause'];
  if (monsterNames.has(lc)) return ['expedition', 'monster-name=expedDeath'];
  if (cause === 'aid-runner' || cause === 'sortie combat' || cause.startsWith('split-fight:')) {
    return ['expedition', 'cause'];
  }
  if (ctx.onExped && (cause === 'monster' || cause === 'combat' || cause === 'injuries')) {
    return ['expedition', 'ctx:on-expedition'];
  }
  if (cause === 'the wild') return ['wild', 'cause'];
  if (cause === 'patrol combat') return ['patrol', 'cause'];
  if (cause === 'hunting') return ['wild', 'cause'];
  if (cause === 'alien' || cause === 'alien_beam') return ['alien', 'cause'];
  if (DISEASE_IDS.has(lc) || DISEASE_RES.some(re => re.test(cause))) return ['disease', 'cause'];
  if (cause === 'starvation' || cause === 'thirst') return ['haven', 'cause'];
  if (cause === 'injuries' || cause === "a wound that wouldn't close") return ['haven', 'cause'];
  if (cause === 'monster' || cause === 'combat') {
    if (ctx.aid) return ['raid', 'ctx:aid-crisis'];
    if (ctx.router === 'patrol') return ['patrol', 'ctx:router'];
    if (ctx.router === 'wild') return ['wild', 'ctx:router'];
    if (cause === 'combat' && ctx.atHaven) return ['raid', 'ctx:scholar-fight-at-haven'];
    if (cause === 'combat') return ['wild', 'ctx:scholar-fight-in-wild'];
    return ['other', 'ctx:unresolved-monster'];
  }
  return ['other', 'cause-unmapped'];
}

function isPersonDeath(t) {
  return !!(t.player || t.kind === 'person' || t.kind === 'villager' || t.kind === 'scholar' || t.kind == null);
}

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Phantom check: did `who` actually die? roster-living => phantom
// (excluded, counted); no person record and absent from roster =>
// dead-and-removed (real); missing who => null (unverifiable, LOUD).
function diedForReal(Game, who) {
  if (who == null || who === '?' || who === 'unknown') return null;
  try {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(who) : null;
    if (vp) return !!vp.dead;
    const roster = (((Game.state && Game.state.village) || {}).roster || []).map(String);
    if (roster.includes(String(who))) return false;
    return true;
  } catch (e) { return null; }
}

function monsterNameSet(Game) {
  const set = new Set();
  try {
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (m && m.name) set.add(String(m.name).toLowerCase());
      if (m && m.id) set.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m && m.id) set.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  return set;
}

// Per-run death capture: wraps Game.tele (records death teles — incl. the
// engine's `wave` field). Pure recording — no state writes, no RNG draws.
// Kill-time fight-start records (recFight) let the analyzer join combat
// deaths to killer waves (the windowsurvive killer-wave join, carried over).
function installDeathCapture(Game, C, monsterNames) {
  C.deathRecs = [];
  C.fightStarts = [];
  function recFight(mid, wave, via) {
    try {
      if (mid == null) return;
      C.fightStarts.push({ day: scholarDay(Game), mid: String(mid), wave: wave == null ? null : (wave | 0), via });
    } catch (e) { C.instrumentErrors++; }
  }
  function wrapRouterFn(name, flag, midOf) {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function () {
      const prev = C._router; C._router = flag;
      try {
        const mid = midOf ? midOf(arguments) : null;
        if (mid) recFight(mid, null, 'router:' + flag);
      } catch (e) { C.instrumentErrors++; }
      try { return orig.apply(this, arguments); }
      finally { C._router = prev; }
    };
  }
  wrapRouterFn('resolvePatrol', 'patrol', (args) => (args[1] && args[1].id) || null);
  wrapRouterFn('resolveWildMonsterEncounter', 'wild', (args) => (args[1] && args[1].id) || null);
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try { recFight(mdef && mdef.id, mdef && mdef.wave, 'aidFight'); }
        catch (e) { C.instrumentErrors++; }
        return oAid.apply(this, arguments);
      };
    } else { C.instrumentErrors++; }
  } catch (e) { C.instrumentErrors++; }
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'combat_start') {
          recFight(data && data.vs, data && data.wave, 'combat_start');
        }
        if (type === 'death') {
          const rec = {
            day: scholarDay(Game),
            who: data && data.who != null ? String(data.who) : null,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
            wave: (data && data.wave != null) ? (data.wave | 0) : null,
            ctx: { aid: false, atHaven: false, inTb: false, router: C._router || null, onExped: false },
          };
          try { rec.ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) {}
          try { rec.ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
          try { rec.ctx.inTb = !!Game.tbfight; } catch (e) {}
          try {
            const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
            rec.ctx.onExped = !!(st && st.exped && rec.who && st.exped[rec.who]);
          } catch (e) {}
          C.deathRecs.push(rec);
        }
      } catch (e) { C.instrumentErrors++; }
      return r;
    };
  } catch (e) { C.instrumentErrors++; }
}

// ---------------------------------------------------------------------------
// FLOW RECORDING — call-through wraps on the pantry-outflow verbs that
// separate the two roads: belongfeast PAYS tribute upward (Game.payTribute,
// weekly, arrears-0 priority); leadfeast TENDS its subordinates outward
// (Game.tendLink, 1,500 kcal each, weekly); both roads fire feasts through
// Game.hostFeast (the r13 feast discipline). All wraps are call-through,
// record engine return values (actual kcal paid, 0 on refusal), write no
// state, draw no RNG.
function installFlowRecording(Game, C) {
  C.flows = [];   // {day, kind:'tribute'|'tend'|'feast', kcalPaid}
  function wrap(name, kind) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { C.instrumentErrors++; return; }
      Game[name] = function () {
        const day = scholarDay(Game);
        const r = orig.apply(this, arguments);
        try {
          let paid = 0;
          if (kind === 'feast') paid = (r && r.ok) ? 1 : 0;
          else if (typeof r === 'number' && isFinite(r)) paid = r;
          else if (r && typeof r.kcal === 'number') paid = r.kcal;
          C.flows.push({ day, kind, paid: Math.round(paid) });
        } catch (e) { C.instrumentErrors++; }
        return r;
      };
    } catch (e) { C.instrumentErrors++; }
  }
  wrap('payTribute', 'tribute');
  wrap('tendLink', 'tend');
  wrap('hostFeast', 'feast');
}

// stateSnap(G): the village's deferral/scale state on a day (or at a
// death). PURE engine reads.
function stateSnap(G) {
  const s = {};
  try { s.pantry = Math.round(G.pantryKcalLive ? G.pantryKcalLive(G.state.village) : -1); } catch (e) { s.pantry = -1; }
  try { const pg = G.progState ? G.progState() : null; s.hungryStreak = (pg && (pg.hungryStreak | 0)) || 0; } catch (e) { s.hungryStreak = -1; }
  try {
    const r5 = G.waveUnlockReady ? G.waveUnlockReady(5) : null;
    if (r5) { s.armored = r5.armored | 0; s.armed = r5.armed | 0; s.vets = r5.veterans | 0; s.tricks = r5.tricks | 0; s.short = (r5.short || []).slice(); s.rdy = !!r5.ready; }
    else { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['no-read']; s.rdy = false; }
  } catch (e) { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['read-error']; s.rdy = false; }
  try {
    const vs = G.villageStanding ? G.villageStanding() : {};
    s.raw = (vs.total | 0) || 0; s.war = (vs.war | 0) || 0; s.dip = (vs.diplomacy | 0) || 0; s.plenty = (vs.plenty | 0) || 0;
  } catch (e) { s.raw = -1; s.war = -1; s.dip = -1; s.plenty = -1; }
  try { s.cap = G.standingPlentyCappedTotal ? (G.standingPlentyCappedTotal() | 0) : -1; } catch (e) { s.cap = -1; }
  try {
    const cfg = (G.standingCfg ? G.standingCfg() : {}) || {};
    s.t4 = (cfg.t4 | 0) || 100; s.t5 = (cfg.t5 | 0) || 200;
  } catch (e) { s.t4 = 100; s.t5 = 200; }
  try {
    const d4 = G.standingDeferral ? G.standingDeferral(4) : null;
    s.def4 = !!(d4 && d4.deferred);
  } catch (e) { s.def4 = false; }
  try {
    const d5 = G.standingDeferral ? G.standingDeferral(5) : null;
    s.def5 = !!(d5 && d5.deferred);
    s.def5grand = !!(d5 && d5.grandfathered);
    s.def5rdy = !!(d5 && d5.ready);
  } catch (e) { s.def5 = false; s.def5grand = false; s.def5rdy = false; }
  try { s.roster = ((((G.state && G.state.village) || {}).roster) || []).length; } catch (e) { s.roster = -1; }
  try { s.scholarAlive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { s.scholarAlive = false; }
  try { s.scholarVid = String(G.villagerId || '?'); } catch (e) { s.scholarVid = '?'; }
  try { s.feasted = !!(G.feastedActive && G.feastedActive()); } catch (e) { s.feasted = false; }
  // Links: lead's subordinate bonds (primary==='haven') vs belong's upward
  // bond (someone else's primary). Arrears on the upward bond is the
  // belong-road stall channel.
  try {
    const ls = (G.hierarchyState ? G.hierarchyState() : []) || [];
    const act = ls.filter(l => l && l.status === 'active');
    s.links = {
      active: act.length,
      ours: act.filter(l => l.primary === 'haven').length,
      theirs: act.filter(l => l.primary && l.primary !== 'haven').length,
      oursTrust: act.filter(l => l.primary === 'haven').map(l => (l.trust | 0) || 0),
      theirsTrust: act.filter(l => l.primary && l.primary !== 'haven').map(l => (l.trust | 0) || 0),
      theirsArrears: act.filter(l => l.primary && l.primary !== 'haven').reduce((t, l) => t + (((l.arrears | 0) || 0)), 0),
    };
  } catch (e) { s.links = { active: -1, ours: -1, theirs: -1, oursTrust: [], theirsTrust: [], theirsArrears: -1 }; }
  return s;
}

// dailyRec(G): the daily divergence-series vector. PURE reads.
function dailyRec(G) {
  const day = scholarDay(G);
  const rec = { d: day, st: stateSnap(G) };
  try { rec.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { rec.uw = 1; }
  try { rec.peak = (G._standingPeakWave ? G._standingPeakWave() : 0) | 0; } catch (e) { rec.peak = 0; }
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    let kills = 0, scholarK = 0, villagerK = 0, compK = 0, otherK = 0;
    const sid = String(G.villagerId);
    for (const e of log) {
      if (!e || ((e.w | 0) < 4)) continue;
      kills++;
      const by = String(e.by || '');
      const via = String(e.via || 'unknown');
      if (by === sid) scholarK++;
      else if (via === 'companion') compK++;
      else if (via === 'player') villagerK++;
      else otherK++;
    }
    rec.w4k = kills; rec.w4scholar = scholarK; rec.w4villager = villagerK; rec.w4comp = compK; rec.w4other = otherK;
  } catch (e) { rec.w4k = 0; rec.w4scholar = 0; rec.w4villager = 0; rec.w4comp = 0; rec.w4other = 0; }
  return rec;
}

// attributeDeaths(Game, C, monsterNames): dedup + kind-filter + phantom
// cross-check (vetwindow-identical), then channel classification.
function attributeDeaths(Game, C, monsterNames) {
  const seen = new Set();
  const attributed = [];
  let rawCount = 0, phantomCount = 0, nullWho = 0;
  for (const rec of (C.deathRecs || [])) {
    rawCount++;
    if (!isPersonDeath(rec)) continue;
    const key = rec.who + '|' + rec.day + '|' + rec.cause;
    if (seen.has(key)) continue;
    seen.add(key);
    const real = diedForReal(Game, rec.who);
    if (real === false) { phantomCount++; continue; }
    if (real === null) { nullWho++; }
    const [channel, rule] = classifyDeath(rec.cause, rec.ctx, monsterNames);
    attributed.push({ day: rec.day, who: rec.who, cause: rec.cause, player: rec.player, channel, rule, killerWave: rec.wave });
  }
  return { rawCount, attributedCount: attributed.length, phantomCount, nullWho, deaths: attributed };
}

// ---------------------------------------------------------------------------
// runOne(seed, policyId, opts): one instrumented 180d death-aware run.
async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const bare = isBare();
  const C = { instrumentErrors: 0, hashes: [], recs: [], maxWave: 1, wave4Day: null, wave5Day: null,
    maxRank: 0, nationalDay: null, everTable: false, exiled: false, _router: null };
  const base = policyFor(policyId);
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) {
      try { installDeathCapture(G, C, monsterNames); } catch (e) { C.instrumentErrors++; }
      try { installFlowRecording(G, C); } catch (e) { C.instrumentErrors++; }
      try {
        if (KD.instrumentOn()) {
          C.kd = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
          C.kdUninstall = KD.install(G, C.kd);
        }
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      // Hashes ALWAYS recorded (bare and live alike) — the det-gate
      // compares these; gating them on !isBare() voids the gate.
      C.hashes.push(scholarDay(G) + ':' + dayHash(G));
    } catch (e) {}
    if (!bare) {
      try {
        const rec = dailyRec(G);
        C.recs.push(rec);
        if (rec.uw > C.maxWave) C.maxWave = rec.uw;
        if (rec.uw >= 4 && C.wave4Day == null) C.wave4Day = rec.d;
        if (rec.uw >= 5 && C.wave5Day == null) C.wave5Day = rec.d;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if (rank === 'national' || rank === 'global') {
          if (C.nationalDay == null) C.nationalDay = rec.d;
        }
        const pg = G.progState ? G.progState() : null;
        if (pg && (pg.tableWaiting || pg.tableDone)) C.everTable = true;
        if ((G.state.scholar || {}).exiled) C.exiled = true;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  const monsterNames = monsterNameSet(Game); // Game.data is available post-loadGame
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  try { if (C.kdUninstall) C.kdUninstall(); } catch (e) {}
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : attributeDeaths(Game, C, monsterNames);
  // Final-day vector at run end (the terminal observation for the window
  // boundary — the w5census endRec lesson carried over).
  let endRec = null;
  try { endRec = bare ? null : dailyRec(G); } catch (e) { endRec = null; }
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let maxWave = C.maxWave;
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && C.wave5Day == null) C.wave5Day = gameDays;
    if (maxWave >= 4 && C.wave4Day == null) C.wave4Day = gameDays;
  } catch (e) {}
  // KILLDISC aggregates (w4+ kills only; per-source damage shares).
  let kdAgg = null;
  if (!bare && C.kd) {
    try {
      let k4 = 0, dSch = 0, dComp = 0, dOth = 0, hits = 0;
      for (const k of (C.kd.kills || [])) {
        if ((k.wave | 0) < 4) continue;
        k4++;
        const d = k.dmg || null;
        if (d) { dSch += d.scholar | 0; dComp += d.companion | 0; dOth += d.other | 0; hits += d.hits | 0; }
      }
      kdAgg = { w4kills: k4, dmgScholar: dSch, dmgCompanion: dComp, dmgOther: dOth, hits,
        engagements: (C.kd.engagements || []).length, kdErrors: (C.kd.instrumentErrors || []).length };
    } catch (e) { kdAgg = { error: String(e && e.message) }; }
  }
  // Flow aggregates: cumulative tribute/tend paid (actual kcal), feasts fired.
  let flowAgg = null;
  if (!bare && C.flows) {
    try {
      let trib = 0, tribN = 0, tend = 0, tendN = 0, feast = 0;
      const feastDays = [];
      for (const f of C.flows) {
        if (f.kind === 'tribute') { trib += f.paid; tribN++; }
        else if (f.kind === 'tend') { tend += f.paid; tendN++; }
        else if (f.kind === 'feast' && f.paid > 0) { feast++; feastDays.push(f.day); }
      }
      flowAgg = { tributePaid: trib, tributeCalls: tribN, tendPaid: tend, tendCalls: tendN, feasts: feast, feastDays };
    } catch (e) { flowAgg = { error: String(e && e.message) }; }
  }
  // Scholar succession count: distinct scholar vids seen across the census.
  let successions = 0;
  if (!bare) {
    try {
      const vids = new Set();
      for (const r of C.recs) vids.add(r.st.scholarVid);
      successions = Math.max(0, vids.size - 1);
    } catch (e) {}
  }
  const out = {
    seed, policyId, substrate: 'pre-seat-winside-novetrel',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won,
    deaths, // harness sample-level death counts (cross-check)
    maxRank: C.maxRank, national: C.nationalDay != null, nationalDay: C.nationalDay,
    table: !!C.everTable, exiled: !!C.exiled,
    maxWave, wave45: maxWave >= 4, wave5: maxWave >= 5,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    successions,
    instrumentErrors: C.instrumentErrors | 0,
    deathsAttributed: attr,
    fightStarts: bare ? [] : (C.fightStarts || []),
    flows: bare ? [] : (C.flows || []),
    flowAgg, kdAgg,
    recs: C.recs, endRec, hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.FEASTGAP_BARE = '1';
        const b1 = await runOne(seed, policyId, { noWrite: true });
        const b2 = await runOne(seed, policyId, { noWrite: true });
        delete process.env.FEASTGAP_BARE;
        const c1 = await runOne(seed, policyId, { noWrite: true });
        const c2 = await runOne(seed, policyId, { noWrite: true });
        const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        const pass = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.FIDELITY === '1') {
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
    let ok = true;
    for (const seed of fseeds) {
      for (const policyId of POLICIES) {
        const p = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(p)) { console.log(`  FIDELITY s${seed} ${policyId}: SKIP (no per-seed file)`); continue; }
        const before = fs.readFileSync(p, 'utf8');
        await runOne(seed, policyId);
        const after = fs.readFileSync(p, 'utf8');
        const pass = before === after;
        console.log(`  FIDELITY s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'}`);
        if (!pass) ok = false;
      }
    }
    console.log(ok ? 'FIDELITY: ALL PASS' : 'FIDELITY: FAILURES');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201]).filter(Number.isFinite);
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId, { noWrite: true });
      const last = out.recs[out.recs.length - 1];
      const a = out.deathsAttributed;
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} recs=${out.recs.length} rawDeaths=${a && a.rawCount} attributed=${a && a.attributedCount} phantoms=${a && a.phantomCount} ierr=${out.instrumentErrors} flows=${out.flows.length} feasts=${out.flowAgg && out.flowAgg.feasts} def5=${last && last.st.def5} def4=${last && last.st.def4} cap=${last && last.st.cap} r5short=${last && (last.st.short || []).join(',')}`);
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep.
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const out = await runOne(seed, policyId);
      const el = out.endRec;
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4Day} table=${out.table} deaths=${out.deathsAttributed.attributedCount} unattrib=? ierr=${out.instrumentErrors} flows=${out.flows.length} feasts=${out.flowAgg && out.flowAgg.feasts} trib=${out.flowAgg && out.flowAgg.tributePaid} tend=${out.flowAgg && out.flowAgg.tendPaid} def5=${el && el.st.def5} cap=${el && el.st.cap}`);
    }
  }
  console.log('SWEEP: done');
}

module.exports = { policyFor, runOne, classifyDeath, stateSnap, dailyRec, attributeDeaths, installFlowRecording, SEEDS, POLICIES, EVID };

if (require.main === module) {
  main().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
}
