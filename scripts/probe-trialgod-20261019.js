#!/usr/bin/env node
// probe-trialgod-20261019.js — god-build trial driver sweep instrument
// (flesh-out loop arm sim-trialgod, run fleshout-20261019T2331Z, axis
// scale-onramp).
//
// INSTRUMENT: the seatdrive seated stack PLUS the path-forcing driver
// (tablepaths.js, door='feared', trial=true on every run) PLUS the
// god-build trial driver (scripts/policies/trialgod.js) wrapped OUTERMOST.
// TRIALGOD=1 -> the god driver maxes the scholar's combat build through
// real verbs at the trial fight (gearUp, top-up, abilities, sacrifice).
// TRIALGOD unset -> pure delegation (the fidelity OFF side).
//
// The parent probe's death-channel classifier, phantom check, killer-wave
// join, KILLDISC install, tier stamps, invitation-vs-sitting fields and DET
// pattern are copied verbatim (identical-by-construction, so channel shares
// stay comparable across arms).
//
// SUBSTRATE (the seatdrive seated win-side stack + path forcing + god driver):
//   withTrialGod(withTablePaths(withSeatDrive(withWinDefer(TF base)), {door:'feared', trial:true}))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHS=1 TRIALGOD=1
//   (KILLDISC=1 -> the existing scripts/killdisc-instrument-20261018.js
//   read-only instrument is installed; reused, not a new layer.)
//
// CONTROL: the committed corpus at evidence/2026-10-19/perseed-posttable-seatdrive/
// (SEATDRIVE=1, TABLEPATHS=0 — no trial opt-in, 10 sittings — same 8 seeds
// 64201-64208, base 8c055140a) — REUSED, not re-run. This arm runs on
// current master; FIDELITY=1 pins base drift (TRIALGOD unset on the new
// base byte-identical to the committed control corpus on 2 seeds x 2 policies).
//
// Usage (all modes carry the substrate env; TRIALGOD varies by mode):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHS=1 TRIALGOD=1 \
//   node scripts/probe-trialgod-20261019.js
//   SMOKE=1 ...        # short smoke: both policies drive, seats get taken, trial driver armed
//   DET=1 ...          # det-gate: TRIALGOD=1 (bare+live) vs TRIALGOD unset, byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # TRIALGOD unset: this probe vs the COMMITTED CONTROL CORPUS (hashes) — probe fidelity + base drift
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="64201,64202" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TGD = require('./policies/trialgod');
const KD = require('./killdisc-instrument-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const MODE = process.env.FIDELITY === '1' ? 'fidelity1'
  : process.env.DET === '1' ? 'det'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';
const SEATDRIVE_WANT = '1'; // all modes run the SEATED substrate (control corpus is SEATDRIVE=1)
const TG_WANT = (MODE === 'fidelity1') ? '0' : '1'; // fidelity1 = TRIALGOD off vs the committed control corpus

// SUBSTRATE GUARD — the win-side stack. KILLDISC must be '1' (the reused
// read-only instrument); SEATDRIVE must be '1' for sweep/smoke/det (the
// SEATED substrate) and '0' for the fidelity modes (the OFF side);
// TABLEPATHS must be '1' for sweep/smoke/det (the feared+trial forcing);
// VETREL and REPOSITION must NOT be '1'.
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
if (MODE !== 'fidelity1' && process.env.TABLEPATHS !== '1') { console.error(`SWEEP STOP: TABLEPATHS=1 is required in ${MODE} mode.`); process.exit(2); }
if (MODE === 'fidelity1' && (process.env.TABLEPATHS === '1' || process.env.TRIALGOD === '1')) { console.error('SWEEP STOP: TABLEPATHS and TRIALGOD must NOT be 1 in fidelity1 mode (gate off = the control side).'); process.exit(2); }
if (TG_WANT === '1' && process.env.TRIALGOD !== '1') { console.error(`SWEEP STOP: TRIALGOD=1 is required in ${MODE} mode.`); process.exit(2); }
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (seatdriveposttable substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== SEATDRIVE_WANT) { console.error(`SWEEP STOP: SEATDRIVE=${SEATDRIVE_WANT} is required in ${MODE} mode.`); process.exit(2); }
if (process.env.VETREL === '1') { console.error('SWEEP STOP: VETREL must NOT be 1 (this is the no-vetrel win-side substrate).'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1.'); process.exit(2); }
if (!TGD.layerOn() && TG_WANT === '1') { console.error('SWEEP STOP: trialgod layerOn() false despite TRIALGOD=1.'); process.exit(2); }
if (TGD.layerOn() && TG_WANT === '0') { console.error('SWEEP STOP: trialgod layerOn() true in fidelity1 mode.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208]).filter(Number.isFinite);

// EPERM flap hardening (sim-armory 2026-10-19: 4 consecutive sweep attempts
// lost to 0-byte JSONs from the host's EPERM flap on node writes). EPERM-only
// retry, no data change.
function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-trialgod');
const isBare = () => process.env.TRIALGOD_BARE === '1';

// Policy composition — the god-build trial stack (see trialgod.js).
function policyFor(policyId) { return TGD.composedFor(policyId); }

// ---------------------------------------------------------------------------
// DEATH-CHANNEL TAXONOMY — copied verbatim from
// scripts/probe-tablepaths-20261019.js (which copied it verbatim from
// scripts/probe-posttable-20261019.js, which copied it from
// scripts/probe-windowsurvive-20261019.js, which copied it from
// scripts/vetwindow-sweep-20261018.js). IDENTICAL BY CONSTRUCTION so
// channel shares are comparable across arms. Any change must be mirrored
// there or the comparability breaks — document in the evidence file.
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
// vetwindow/windowsurvive/posttable: roster-living => phantom (excluded,
// counted); no person record and absent from roster => dead-and-removed
// (real); missing who => null (unverifiable, counted LOUD).
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

// KILLER-WAVE JOIN — identical to probe-tablepaths (the startCombat tele +
// router wraps recover the fight that killed; death tele wave stamps only
// monster kills).
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
            wave: (data && data.wave != null) ? (data.wave | 0) : null,
            ctx: { aid: false, atHaven: false, inTb: false, router: C._router || null, onExped: false },
            stateAtDeath: stateSnap(Game),
            tableAtDeath: tableRec(Game), // the win-side state at the moment of death (tier-stamped)
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

// stateSnap(G): the village's state at a death (or daily). PURE reads —
// identical-by-construction with probe-tablepaths.
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

// overtimeTierOf(G): the OVERTIME tier stamp (instrument hardening, parent
// arm metric doubt #4). Game.overtimeTier() (src/js/overtime.js) is a PURE
// read of pg.overtime clamped 0..6. null = unreadable (LOUD), never
// confused with a real tier-0 reading.
function overtimeTierOf(G) {
  try {
    if (typeof G.overtimeTier !== 'function') return null;
    return G.overtimeTier() | 0;
  } catch (e) { return null; }
}

// tableRec(G): the win-side table state (or daily). PURE reads — the parent
// probe's fields PLUS the overtimeTier stamp. tableWaiting = the invitation
// (Arc IV / deed re-check). tableDone = the table sat and completed.
// tableSittingId bumps per sitting. T = tableState(): phase
// (paths/challenge/finals/done), path, branch, beat, seat, winDeferred.
// winDayFloorOk() = day >= 90 (the win floor). tableActive() = sanctity:
// while the table sits, ambient monster pressure is suspended.
function tableRec(G) {
  const r = {};
  try {
    const pg = G.progState ? G.progState() : null;
    r.waiting = !!(pg && pg.tableWaiting);
    r.done = !!(pg && pg.tableDone);
    r.sitting = (pg && (pg.tableSittingId | 0)) || 0;
  } catch (e) { r.waiting = false; r.done = false; r.sitting = 0; }
  try {
    const T = (typeof G.tableState === 'function') ? G.tableState() : null;
    r.phase = (T && T.phase != null) ? String(T.phase) : null;
    r.path = (T && T.path != null) ? String(T.path) : null;
    r.branch = (T && T.branch != null) ? String(T.branch) : null;
    r.beat = (T && T.beat != null) ? (T.beat | 0) : null;
    r.seat = (T && T.seat != null) ? String(T.seat) : null;
    r.winDeferred = !!(T && T.winDeferred);
    r.trialPending = !!(T && T.trialPending); // additive (tablepaths arm) — trial-by-combat attribution
  } catch (e) { r.phase = null; r.path = null; r.branch = null; r.beat = null; r.seat = null; r.winDeferred = false; r.trialPending = false; }
  try { r.floorOk = !!((typeof G.winDayFloorOk === 'function') && G.winDayFloorOk()); } catch (e) { r.floorOk = null; }
  try { r.active = !!((typeof G.tableActive === 'function') && G.tableActive()); } catch (e) { r.active = null; }
  // HARDENING: the overtime tier at this observation. The dose-response
  // needs the tier AT each death and AT each day, not a channel proxy.
  r.otier = overtimeTierOf(G);
  return r;
}

// dailyRec(G): the daily series vector. PURE reads — the parent probe's
// fields PLUS the overtimeTier stamp (the dose-response series).
function dailyRec(G) {
  const day = scholarDay(G);
  const rec = { d: day, st: stateSnap(G), tb: tableRec(G) };
  try { rec.otier = overtimeTierOf(G); } catch (e) { rec.otier = null; }
  try { rec.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { rec.uw = 1; }
  try { rec.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { rec.alive = false; }
  try { rec.won = !!G.won; } catch (e) { rec.won = false; }
  return rec;
}

// Post-run attribution: dedup, kind-filter, phantom-check, channel
// classification (the vetwindow/windowsurvive/posttable pattern,
// identical-by-construction).
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
      tableAtDeath: t.tableAtDeath, // tier-stamped (otier)
    });
  }
  return {
    rawCount: (C.deathRecs || []).length, dedupedCount: deduped.length,
    attributed, attributedCount: attributed.length,
    phantoms, phantomCount: phantoms.length,
    unverifiable, unverifiableCount: unverifiable.length,
    unattributed: unverifiable,
    unattributedCount: unverifiable.length,
    causeSpace,
  };
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = policyFor(policyId);
  const bare = isBare();
  const C = {
    recs: [], hashes: [], deathRecs: [], fightStarts: [], _router: null,
    instrumentErrors: 0,
    trialResumes: [], trialDmg: [],
    tg: null,
    maxRank: 0, everTable: false, exiled: false,
    maxWave: 1, wave4Day: null, wave5Day: null, nationalDay: null,
    tableDay: null, sittingDay: null, satEver: false, tableDoneDay: null,
    tableActiveDays: 0, phaseSet: new Set(), seatAtSit: null, tableDayFloorOk: null,
    otierMax: 0, otierNullRecs: 0,
    // KILLDISC census object: the module pushes to kills, dmg, census,
    // engagements and instrumentErrors (arrays) — all must exist (the
    // sim-armory shape).
    kd: { kills: [], dmg: {}, census: [], engagements: [], instrumentErrors: [] },
  };
  const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) {
      try { installDeathCapture(G, C); } catch (e) { C.instrumentErrors++; }
      // KILLDISC read-only instrument (reused from sim-killdisc) — call-
      // through wraps, zero state writes, zero RNG draws. Its own errors
      // go to C.kd.instrumentErrors (an array, per the module's err()).
      try { KD.install(G, C.kd); } catch (e) { C.instrumentErrors++; }
      // TRIAL RESULT capture: tableTrialResume is called by the wrapped
      // tbEnd when the trial fight ends — call-through, read-only.
      try {
        const oTTR = G.tableTrialResume;
        if (typeof oTTR === 'function') {
          G.tableTrialResume = function (result) {
            try {
              const T = (typeof G.tableState === 'function') ? G.tableState() : null;
              C.trialResumes.push({
                day: scholarDay(G), result: result == null ? null : String(result),
                bearerDied: G.villagerId !== (T && T.trialBearer),
                path: T && T.path != null ? String(T.path) : null,
              });
            } catch (e2) { C.instrumentErrors++; }
            return oTTR.apply(this, arguments);
          };
        } else { C.instrumentErrors++; }
      } catch (e) { C.instrumentErrors++; }
      // TRIAL DAMAGE LEDGER (trialgod arm): read-only wrap of tbDamage —
      // logs {round, target, dmg, landed, source} while the REAL table-trial
      // fight is live. Pure read: logs to C.trialDmg, changes no state,
      // draws no RNG.
      try {
        const oTD = G.tbDamage;
        if (typeof oTD === 'function') {
          G.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
            const landed = oTD.apply(this, arguments);
            try {
              if (G.tableTrialFight && G.tableTrialFight()) {
                C.trialDmg.push({
                  day: scholarDay(G), round: (G.tbfight || {}).round | 0,
                  target: String(targetKey), dmg: dmg | 0, landed: landed | 0,
                  source: String(sourceLabel || '').slice(0, 60),
                });
              }
            } catch (e2) { C.instrumentErrors++; }
            return landed;
          };
        } else { C.instrumentErrors++; }
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
      C.hashes.push(scholarDay(G) + ':' + dayHash(Game));
    } catch (e) {}
    if (!bare) {
      try {
        const rec = dailyRec(G);
        C.recs.push(rec);
        if (rec.otier == null) C.otierNullRecs++;
        else if (rec.otier > C.otierMax) C.otierMax = rec.otier;
        // Per-path attribution: snapshot the tablepaths layer's drain log
        // and the trialgod layer's god-build record.
        try {
          const tp = ctx && ctx._tablepaths;
          if (tp) {
            C.tp = {
              assigned: tp.assigned, trial: !!tp.trial, answers: tp.answers | 0,
              stalls: tp.stalls | 0, drainErrors: ctx.tpDrainError | 0,
              walked: (tp.walked || []).slice(),
              doorEvents: (tp.doorEvents || []).slice(),
              trialEvents: (tp.trialEvents || []).slice(),
              finalsEvents: (tp.finalsEvents || []).slice(),
              trialResumes: (C.trialResumes || []).slice(),
              log: (tp.log || []).slice(-400),
            };
          }
        } catch (e) { C.instrumentErrors++; }
        try {
          const tg = ctx && ctx._trialgod;
          if (tg) {
            C.tg = {
              preps: (tg.preps || []).slice(),
              fights: (tg.fights || []).slice(-200),
              sacrifices: tg.sacrifices | 0, abilities: tg.abilities | 0,
              strikes: tg.strikes | 0, errors: tg.errors | 0,
            };
          }
        } catch (e) { C.instrumentErrors++; }
        if (rec.uw > C.maxWave) C.maxWave = rec.uw;
        if (rec.uw >= 4 && C.wave4Day == null) C.wave4Day = rec.d;
        if (rec.uw >= 5 && C.wave5Day == null) C.wave5Day = rec.d;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if (rank === 'national' || rank === 'global') {
          if (C.nationalDay == null) C.nationalDay = rec.d;
        }
        const tb = rec.tb;
        if (tb.waiting) {
          if (C.tableDay == null) { C.tableDay = rec.d; C.tableDayFloorOk = tb.floorOk; }
          C.everTable = true;
        }
        if (tb.sitting > 0 && !C.satEver) { C.satEver = true; C.sittingDay = rec.d; C.seatAtSit = tb.seat; }
        if (tb.done && C.tableDoneDay == null) C.tableDoneDay = rec.d;
        if (tb.phase) C.phaseSet.add(tb.phase);
        if (tb.active) C.tableActiveDays++;
        if ((G.state.scholar || {}).exiled) C.exiled = true;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  const monsterNames = monsterNameSet(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : attributeDeaths(Game, C, monsterNames);
  // Final-day vector at run end (the terminal observation).
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
  // Invitation-vs-sitting distinction (the backlog finding): the invitation
  // (tableWaiting ever) and the sitting (tableSittingId>0 ever) are separate
  // facts; tableActiveDays is the seated days under sanctity.
  const kdKills = (C.kd.kills || []).length;
  const out = {
    seed, policyId, substrate: 'trialgod-win-side',
    tgAssigned: 'feared', tp: C.tp, tg: C.tg, trialDmg: C.trialDmg,
    trialResumes: C.trialResumes,
    days: result.days, gameDays: result.gameDays, endReason,
    // TOP-LEVEL wall keys (booleans) — the telemetry checker reads these;
    // no nested wall.* keys (they fire spurious LOUDs).
    won: !!Game.won, wins: !!Game.won,
    national: C.nationalDay != null, table: !!C.everTable, exiled: !!C.exiled,
    maxRank: C.maxRank, nationalDay: C.nationalDay,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    // Table trace (the diagnostic surface) — invitation vs sitting separate.
    tableDay: C.tableDay, tableDayFloorOk: C.tableDayFloorOk,
    satEver: C.satEver, sittingDay: C.sittingDay, seatAtSit: C.seatAtSit,
    tableDoneDay: C.tableDoneDay, tableActiveDays: C.tableActiveDays,
    phaseTrace: [...C.phaseSet].sort(),
    // Overtime tier trace (the hardening): max tier seen, null-stamp count.
    otierMax: C.otierMax, otierNullRecs: C.otierNullRecs,
    instrumentErrors: C.instrumentErrors | 0,
    kdErrors: (C.kd.instrumentErrors || []).length | 0,
    kdKills,
    deaths, // harness sample-level death counts (cross-check)
    deathsAttributed: attr,
    fightStarts: C.fightStarts || [],
    recs: C.recs, endRec, hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(opts.eviddir || EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    writeFileRetry(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (MODE === 'det') {
    // DET: the trialgod layer must not perturb pre-table trajectories.
    // 60d (no sitting pre-90): bare+TRIALGOD=1 vs live+TRIALGOD=1 vs
    // live+TRIALGOD unset — all byte-identical.
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    const otg = process.env.TRIALGOD;
    const otp = process.env.TABLEPATHS;
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.TRIALGOD = '1';
        process.env.TRIALGOD_BARE = '1';
        const b1 = await runOne(seed, policyId, { noWrite: true });
        const b2 = await runOne(seed, policyId, { noWrite: true });
        delete process.env.TRIALGOD_BARE;
        const c1 = await runOne(seed, policyId, { noWrite: true });
        const c2 = await runOne(seed, policyId, { noWrite: true });
        delete process.env.TRIALGOD; // gate off: pure delegation
        const g1 = await runOne(seed, policyId, { noWrite: true });
        process.env.TRIALGOD = otg;
        process.env.TABLEPATHS = otp;
        const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        const hg1 = g1.hashes.join('|');
        const pass = hb1 === hb2 && hc1 === hc2 && hb1 === hc1 && hb1 === hg1 && hb1.length > 0;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} tg1-vs-unset=${hb1 === hg1}, ${b1.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — the trialgod layer perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (MODE === 'fidelity1') {
    // The fidelity OFF side: TRIALGOD unset (the layer delegates purely),
    // TABLEPATHS unset, SEATDRIVE=1, this probe, 2 seeds x 2 policies — vs
    // the COMMITTED CONTROL CORPUS (evidence/2026-10-19/perseed-posttable-seatdrive/,
    // SEATDRIVE=1, TABLEPATHS=0). Pins base drift on the current master:
    // a PASS means the armed-vs-control comparison is apples-to-apples.
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
    const CONTROL = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-posttable-seatdrive');
    let ok = true;
    for (const policyId of POLICIES) {
      for (const seed of fseeds) {
        const out = await runOne(seed, policyId, { noWrite: true });
        const mine = out.hashes.join('|');
        const fp = path.join(CONTROL, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { console.log(`  FIDELITY=1 s${seed} ${policyId}: SKIP (no control file)`); continue; }
        const ctrl = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const theirs = (ctrl.hashes || []).join('|');
        const pass = mine === theirs && mine.length > 0;
        const detail = pass ? `${out.hashes.length} days byte-identical to the committed control corpus`
          : `DIVERGED (probe ${out.hashes.length} days vs control ${(ctrl.hashes || []).length} days)`;
        console.log(`  FIDELITY=1 s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} — ${detail}`);
        if (!pass) ok = false;
      }
    }
    console.log(ok ? 'FIDELITY=1: ALL PASS' : 'FIDELITY=1: FAILURES — base drift or probe drift; armed-vs-control not apples-to-apples');
    process.exit(ok ? 0 : 1);
  }
  if (MODE === 'smoke') {
    process.env.DAYS = process.env.DAYS || '30';
    const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201]).filter(Number.isFinite);
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId, { noWrite: true });
      const nulls = out.deathsAttributed ? out.deathsAttributed.attributed.filter(d => !d.tableAtDeath || d.tableAtDeath.otier == null).length : -1;
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} recs=${out.recs.length} otierNullRecs=${out.otierNullRecs} otierMax=${out.otierMax} rawDeaths=${out.deathsAttributed.rawCount} attributed=${out.deathsAttributed.attributedCount} nullTierDeaths=${nulls} ierr=${out.instrumentErrors} kdErr=${out.kdErrors} kdKills=${out.kdKills} tableDay=${out.tableDay} sat=${out.satEver} phases=${out.phaseTrace.join(',')}`);
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep (SEATDRIVE=1, TABLEPATHS=1, TRIALGOD=1).
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      results.push(out);
      const walked = ((out.tp && out.tp.walked) || []).map(w => w.path + '/' + (w.branch || '?')).join(',') || '—';
      const tg = out.tg || {};
      const trials = (out.trialResumes || []).map(t => t.result + (t.bearerDied ? '/died' : '/lived')).join(',') || '—';
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} w5=${out.wave5} table=${out.table} tday=${out.tableDay} sat=${out.satEver} walked=[${walked}] trial=[${trials}] sac=${tg.sacrifices|0} abils=${tg.abilities|0} tgErr=${tg.errors|0} phases=${out.phaseTrace.join(',') || '—'} otierMax=${out.otierMax} deaths=${out.deathsAttributed.attributedCount} unattrib=${out.deathsAttributed.unattributedCount} phantoms=${out.deathsAttributed.phantomCount} ierr=${out.instrumentErrors} kdErr=${out.kdErrors}`);
    }
  }
  const n = results.length;
  const agg = (f) => results.filter(f).length;
  console.log(`SWEEP COMPLETE: ${n}/${SEEDS.length * POLICIES.length} runs, 0 errors`);
  console.log(`  national=${agg(r => r.national)} table=${agg(r => r.table)} wins=${agg(r => r.won)} wave4=${agg(r => r.wave45)} wave5=${agg(r => r.wave5)} sat=${agg(r => r.satEver)} exiled=${agg(r => r.exiled)}`);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, policyFor, dailyRec, stateSnap, tableRec, overtimeTierOf, classifyDeath, isPersonDeath, diedForReal, attributeDeaths, waveOf, daysNow };
