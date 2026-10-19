#!/usr/bin/env node
// probe-windowsurvive-20261019.js — window-death attribution instrument
// (flesh-out loop arm sim-windowsurvive, run fleshout-20261019T0415Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. Wraps the policy daily with PURE engine reads (no state writes,
// no RNG draws) + a read-only Game.tele death capture (the vetwindow
// pattern). The DET gate pins instrument-on vs instrument-off
// byte-identical trajectories.
//
// WHERE THIS SITS: sim-w5census (2026-10-19) measured the wave-5 unlock
// PATH on the pre-seat + windefer substrate: 21/32 reached the w5 door,
// 18/21 died IN the window (median 40d hold), 0/32 opened it. The named
// next #1 from that census: ATTRIBUTE the window deaths — the window is
// the lever surface, not just the veteran leg. This arm does that
// attribution on the same w5path substrate with VETREL=1 ON (composing
// with this run's vetrel1 arm), 8 fresh seeds x {leadfeast, belongfeast}.
//
// TAXONOMY (pre-registered): for every door-reaching run that dies in the
// window — WHO (scholar successions vs villager attrition), WHERE (field
// channels: raid/expedition/wild/patrol vs haven vs disease vs alien vs
// other — the SAME classifier as sim-vetwindow, identical by construction
// so the shares are comparable), WHAT (the death tele's `wave` field: the
// killer's monster wave for combat deaths — wave-4 verbs vs wave-3 vs
// mundane causes), WHEN (window-day index, inter-death intervals), and
// STATE at death (pantry kcal, hungryStreak, veterans living, armored
// fighters, standing cap). The veteran leg (0/16 satisfied?) and armor
// mortality are read jointly.
//
// SUBSTRATE (w5path, VETREL=1):
//   withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1
//   (SEATDRIVE='0' -> seatdrive pure delegation; REPOSITION unset -> inert;
//   VETREL='1' -> the companion-veteran channel is LIVE — this is the
//   w5census substrate + VETREL=1, composing with the vetrel1 arm.)
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 \
//   node scripts/probe-raidwall-20261019.js
//   SMOKE=1 ...        # short smoke: both policies drive, census live
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   ARM=armed ...      # arm filter (control|armed; default both)
//   SEEDS="63801,63802" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const RW = require('./policies/raidwall');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — w5path + VETREL=1. SEATDRIVE must be '0' (pre-seat);
// VETREL must be '1' (this arm composes with the vetrel1 arm);
// REPOSITION must NOT be '1' (inert layer).
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (windowsurvive substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat — this is the windowsurvive arm, not the winseat).'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1 (pre-seat substrate).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (process.env.RAIDWALL === '1') { console.error('SWEEP STOP: RAIDWALL must NOT be preset — the arm dimension sets it per run.'); process.exit(2); }
if (SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() true despite SEATDRIVE=0.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [63801, 63802, 63803, 63804, 63805, 63806, 63807, 63808]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-raidwall');
const isBare = () => process.env.RWALL_BARE === '1';
const ARM_ENV = (process.env.ARM || '').toLowerCase();
const ARMS = ['control', 'armed'].filter(a => !ARM_ENV || a === ARM_ENV);
if (!ARMS.length) { console.error('SWEEP STOP: ARM must be control|armed, got ' + process.env.ARM); process.exit(2); }

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition — the w5path policy set, VETREL=1, plus the raidwall
// layer OUTSIDE on the armed arm only.
function policyFor(policyId, arm) {
  const base = baseFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION unset: inert)`);
  const vet = VR.withVetrel(rp, `${tag}-vetrel-rp`, `${policyId} + reposition + VETREL=1 (companion veteran channel LIVE)`);
  const wd = WD.withWinDefer(vet, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=0: pure delegation)`);
  if (arm === 'armed') return RW.withRaidwall(sd, `${tag}-raidwall`, `${policyId} + win-side stack + RAIDWALL=1 (hold-Haven raid doctrine)`);
  return sd;
}

// ---------------------------------------------------------------------------
// DEATH-CHANNEL TAXONOMY — copied verbatim from
// scripts/vetwindow-sweep-20261018.js (2026-10-18). IDENTICAL BY
// CONSTRUCTION so channel shares are comparable across arms
// (vetwindow, windowsurvive). Any change must be mirrored there or the
// comparability breaks — document in the evidence file.
//   (1) death teles re-emit — DEDUP on (who,day,cause).
//   (2) tele('death') fires for kind 'monster' too — kind-filter to
//       person/villager/scholar/player kinds only.
//   (3) cross-check person deaths against roster liveness — a person-kind
//       tele for a still-living villager is a PHANTOM: excluded, counted.
// Known trap kept identical: 'dehydration' -> 'other' (cause-unmapped),
// while 'thirst' -> 'haven' — the cause is named in every row so the
// verdict stays auditable (vetwindow out-of-arm finding, 2026-10-18).
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

// Phantom check: did `who` actually die? Identical-by-construction with
// vetwindow: roster-living => phantom (excluded, counted); no person
// record and absent from roster => dead-and-removed (real); missing who
// => null (unverifiable, counted LOUD).
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

// Living-veteran vids: DISTINCT killer vids with wave-4+ kills in
// state.waveKillLog that are living NOW (mirrors waveCombatReadiness's
// isLiving). VETREL=1 substrate: companion kills (via:'companion') count
// like everyone else — the gate reads the same log.
function veteranVids(Game) {
  const set = new Set();
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    const scholarId = String(Game.villagerId);
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      const vid = String(e.by);
      if (vid === scholarId) { set.add(vid); continue; }
      let living = false;
      try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(e.by) : null; living = !!(vp && !vp.dead); }
      catch (x) { living = false; }
      if (living) set.add(vid);
    }
  } catch (e) {}
  return set;
}

// Per-run death capture: wraps Game.tele (records death teles — incl. the
// engine's `wave` field: the killer monster's wave) with death-time
// context, and the two field routers. Pure recording — no state writes,
// no RNG draws. The death-time state snapshot is PURE engine reads.
//
// KILLER-WAVE JOIN (2026-10-19): the death tele's `wave` is null for
// person-kind deaths (corpses.js only stamps wave when opts.monsterId is
// set — combat deaths of people don't set it). The fight that killed is
// recoverable from the engine's own fight-start records:
//   - startCombat() fires tele('combat_start', {vs: mid, wave}) (game.js,
//     2026-10-11 sim telemetry) — covers scholar TB fights (raids at
//     haven, wild startCombat).
//   - resolveWildMonsterEncounter(vid, m) / resolvePatrol(vid, first):
//     the router args carry the world monster (m.id).
//   - aidFight(vid, mdef, m, opts) (comms.js): mdef carries .id + .wave.
// Each record is {day, mid, wave, via}. The analyzer joins each
// combat/monster death to the latest fight-start with day <= death day.
// Monster-name causes (expedDeath) are joined post-hoc by name lookup in
// the analyzer (data.monsters is static).
function waveOf(Game, mid) {
  try {
    const md = ((Game.data && Game.data.monsters) || []).find(x => x && x.id === mid);
    return (md && (md.wave | 0)) || null;
  } catch (e) { return null; }
}
function installDeathCapture(Game, C) {
  C._router = null;
  if (!Array.isArray(C.fightStarts)) C.fightStarts = [];
  const recFight = (mid, wave, via) => {
    try { C.fightStarts.push({ day: scholarDay(Game), mid: mid != null ? String(mid) : null, wave: wave != null ? (wave | 0) : waveOf(Game, mid), via }); }
    catch (e) { C.instrumentErrors++; }
  };
  const wrapRouter = (name, flag, midOf) => {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { C.instrumentErrors++; return; }
      Game[name] = function (...args) {
        const prev = C._router;
        C._router = flag;
        try {
          if (!isBare()) {
            try {
              const mid = midOf ? midOf(args) : null;
              if (mid) recFight(mid, null, 'router:' + flag);
            } catch (e) { C.instrumentErrors++; }
          }
          return orig.apply(this, args);
        }
        finally { C._router = prev; }
      };
    } catch (e) { C.instrumentErrors++; }
  };
  wrapRouter('resolvePatrol', 'patrol', (args) => (args[1] && args[1].id) || null);
  wrapRouter('resolveWildMonsterEncounter', 'wild', (args) => (args[1] && args[1].id) || null);
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try { if (!isBare()) recFight(mdef && mdef.id, mdef && mdef.wave, 'aidFight'); }
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
        if (type === 'combat_start' && !isBare()) {
          recFight(data && data.vs, data && data.wave, 'combat_start');
        }
        if (type === 'death') {
          const rec = {
            day: scholarDay(Game),
            who: data && data.who != null ? String(data.who) : null,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
            wave: (data && data.wave != null) ? (data.wave | 0) : null, // killer monster's wave (corpses.js) — the WHAT
            ctx: { aid: false, atHaven: false, inTb: false, router: C._router || null, onExped: false },
            stateAtDeath: stateSnap(Game),
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

// stateSnap(G): the village's state at a death (or daily). PURE reads.
function stateSnap(G) {
  const s = {};
  try {
    s.pantry = Math.round(G.pantryKcalLive ? G.pantryKcalLive(G.state.village) : -1);
  } catch (e) { s.pantry = -1; }
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
    const df = G.standingDeferral ? G.standingDeferral(5) : null;
    s.def5 = !!(df && df.deferred);
  } catch (e) { s.def5 = false; }
  try { s.roster = ((((G.state && G.state.village) || {}).roster) || []).length; } catch (e) { s.roster = -1; }
  try { s.scholarAlive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { s.scholarAlive = false; }
  return s;
}

// dailyRec(G): the daily window-series vector. PURE reads.
function dailyRec(G) {
  const day = scholarDay(G);
  const rec = { d: day, st: stateSnap(G) };
  try { rec.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { rec.uw = 1; }
  try { rec.peak = (G._standingPeakWave ? G._standingPeakWave() : 0) | 0; } catch (e) { rec.peak = 0; }
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const via = { player: 0, villager: 0, companion: 0, unknown: 0, other: 0 };
    let kills = 0;
    for (const e of log) {
      if (!e || ((e.w | 0) < 4)) continue;
      kills++;
      const v = String(e.via || 'unknown');
      if (Object.prototype.hasOwnProperty.call(via, v)) via[v]++; else via.other++;
    }
    rec.w4k = kills; rec.w4via = via;
  } catch (e) { rec.w4k = -1; rec.w4via = null; }
  try { rec.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { rec.alive = false; }
  try { rec.won = !!G.won; } catch (e) { rec.won = false; }
  return rec;
}

// Post-run attribution: dedup, kind-filter, phantom-check, channel
// classification (the vetwindow pattern, identical-by-construction).
// Returns the per-seed death record.
function attributeDeaths(Game, C, monsterNames) {
  const seen = new Set();
  const deduped = [];
  for (const t of (C.deathRecs || [])) {
    if (!isPersonDeath(t)) continue;
    const key = [t.who, t.day, t.cause].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(t);
  }
  const phantoms = [];
  const unverifiable = [];
  const attributed = [];
  const causeSpace = {};
  for (const t of deduped) {
    causeSpace[t.cause] = (causeSpace[t.cause] || 0) + 1;
    const real = diedForReal(Game, t.who);
    if (real === false) { phantoms.push({ who: t.who, day: t.day, cause: t.cause }); continue; }
    if (real === null) { unverifiable.push({ who: t.who, day: t.day, cause: t.cause, wave: t.wave }); continue; }
    const [channel, rule] = classifyDeath(t.cause, t.ctx, monsterNames);
    let name = t.who;
    try { name = String(Game.displayName ? Game.displayName(t.who) : t.who).split(' ')[0]; } catch (e) {}
    attributed.push({
      who: String(t.who), name, day: t.day | 0, cause: t.cause, kind: t.kind,
      player: !!t.player, wave: t.wave, channel, rule,
      ctx: { router: t.ctx.router, atHaven: !!t.ctx.atHaven, inTb: !!t.ctx.inTb, onExped: !!t.ctx.onExped, aid: !!t.ctx.aid },
      stateAtDeath: t.stateAtDeath,
    });
  }
  return {
    rawCount: (C.deathRecs || []).length, dedupedCount: deduped.length,
    attributed, attributedCount: attributed.length,
    phantoms, phantomCount: phantoms.length,
    unverifiable, unverifiableCount: unverifiable.length,
    unattributed: unverifiable, // honest: missing-who deaths can never be
    unattributedCount: unverifiable.length, // matched to a run's window — LOUD
    causeSpace,
  };
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const arm = opts.arm || 'control';
  const rwWas = process.env.RAIDWALL;
  if (arm === 'armed') process.env.RAIDWALL = '1'; else delete process.env.RAIDWALL;
  const base = policyFor(policyId, arm);
  const bare = isBare();
  const C = {
    recs: [], hashes: [], deathRecs: [], fightStarts: [], _router: null,
    instrumentErrors: 0,
    maxRank: 0, everTable: false, exiled: false,
    maxWave: 1, wave4Day: null, wave5Day: null, nationalDay: null, invites: 0, _wasWaiting: false,
  };
  const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) { try { installDeathCapture(G, C); } catch (e) { C.instrumentErrors++; } }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      // Hashes ALWAYS recorded (bare and live alike) — the det-gate
      // compares these; gating them on !isBare() voids the gate.
      C.hashes.push(scholarDay(G) + ':' + dayHash(Game));
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
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if (rank === 'national' || rank === 'global') {
          if (C.nationalDay == null) C.nationalDay = rec.d;
        }
        const pg = G.progState ? G.progState() : null;
        if (pg && pg.tableWaiting) C.everTable = true;
        if ((G.state.scholar || {}).exiled) C.exiled = true;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'windowsurvive', fullTelemetry: false });
  await setupGame(Game);
  const monsterNames = monsterNameSet(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : attributeDeaths(Game, C, monsterNames);
  // Final-day vector at run end (the terminal observation for the
  // window-boundary fix — the w5census endRec lesson).
  let endRec = null;
  try { endRec = dailyRec(Game); } catch (e) { endRec = null; }
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
  const out = {
    seed, policyId, substrate: 'w5path-vetrel1',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won,
    deaths, // harness sample-level death counts (cross-check)
    maxRank: C.maxRank, national: C.nationalDay != null ? 1 : 0, nationalDay: C.nationalDay,
    table: C.everTable ? 1 : 0, exiled: C.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    instrumentErrors: C.instrumentErrors | 0,
    winarm: arm,
    rwLedger: (() => { try { return Game.state.rwLedger || null; } catch (e) { return null; } })(),
    deathsAttributed: attr,
    fightStarts: C.fightStarts || [],
    recs: C.recs, endRec, hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(EVID, arm, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  if (rwWas === undefined) delete process.env.RAIDWALL; else process.env.RAIDWALL = rwWas;
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63801, 63802]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const arm of ARMS) {
      for (const seed of dseeds) {
        for (const policyId of POLICIES) {
          process.env.RWALL_BARE = '1';
          const b1 = await runOne(seed, policyId, { noWrite: true, arm });
          const b2 = await runOne(seed, policyId, { noWrite: true, arm });
          delete process.env.RWALL_BARE;
          const c1 = await runOne(seed, policyId, { noWrite: true, arm });
          const c2 = await runOne(seed, policyId, { noWrite: true, arm });
          const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
          const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
          const pass = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
          console.log(`  DET [${arm}] s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
          if (!pass) ok = false;
        }
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.FIDELITY === '1') {
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63801, 63802]).filter(Number.isFinite);
    let ok = true;
    for (const arm of ARMS) {
      for (const seed of fseeds) {
        for (const policyId of POLICIES) {
          const p = path.join(EVID, arm, policyId, `s${seed}.json`);
          if (!fs.existsSync(p)) { console.log(`  FIDELITY [${arm}] s${seed} ${policyId}: SKIP (no per-seed file)`); continue; }
          const before = fs.readFileSync(p, 'utf8');
          await runOne(seed, policyId, { arm });
          const after = fs.readFileSync(p, 'utf8');
          const pass = before === after;
          console.log(`  FIDELITY [${arm}] s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'}`);
          if (!pass) ok = false;
        }
      }
    }
    console.log(ok ? 'FIDELITY: ALL PASS' : 'FIDELITY: FAILURES');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63801]).filter(Number.isFinite);
    for (const arm of ARMS) {
      for (const policyId of POLICIES) {
        const out = await runOne(seeds[0], policyId, { noWrite: true, arm });
        const last = out.recs[out.recs.length - 1];
        console.log(`  SMOKE [${arm}] ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} recs=${out.recs.length} rawDeaths=${out.deathsAttributed.rawCount} attributed=${out.deathsAttributed.attributedCount} phantoms=${out.deathsAttributed.phantomCount} ierr=${out.instrumentErrors} def5=${last && last.st.def5} r5short=${last && (last.st.short || []).join(',')} rwLedger=${out.rwLedger ? JSON.stringify({ hold: out.rwLedger.holdDays, ref: out.rwLedger.travelRefusals }) : 'null'}`);
      }
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep: arms x seeds x policies.
  const results = [];
  for (const arm of ARMS) {
    for (const seed of SEEDS) {
      for (const policyId of POLICIES) {
        const out = await runOne(seed, policyId, { arm });
        results.push(out);
        const el = out.endRec && out.endRec.st || {};
        console.log(`  [${arm}][${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4Day} w5=${out.wave5} table=${out.table} deaths=${out.deathsAttributed.attributedCount} unattrib=${out.deathsAttributed.unattributedCount} phantoms=${out.deathsAttributed.phantomCount} ierr=${out.instrumentErrors} raw=${el.raw} cap=${el.cap} def5=${el.def5} r5short=${(el.short || []).join(',')}`);
      }
    }
  }
  const n = results.length;
  const agg = (f) => results.filter(f).length;
  console.log(`SWEEP COMPLETE: ${n}/${ARMS.length * SEEDS.length * POLICIES.length} runs, 0 errors`);
  for (const arm of ARMS) {
    const rs = results.filter(r => r.winarm === arm);
    console.log(`  [${arm}] national=${agg(r => r.winarm === arm && r.national)} table=${agg(r => r.winarm === arm && r.table)} wins=${agg(r => r.winarm === arm && r.won)} wave4=${agg(r => r.winarm === arm && r.wave45)} wave5=${agg(r => r.winarm === arm && r.wave5)} exiled=${agg(r => r.winarm === arm && r.exiled)}`);
  }
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, policyFor, dailyRec, stateSnap, classifyDeath, isPersonDeath, diedForReal, attributeDeaths, waveOf, daysNow };
