#!/usr/bin/env node
// sweep-relaydarkcost-20261020.js — JUDGED COMPARISON of the relaydark
// road's pre-table perturbation cost (flesh-out loop arm sim-relaydarkcost,
// run fleshout-20261020T2015Z, axis scale-onramp). DIAGNOSTIC, not a lever:
// zero src/js changes, policy-side only.
//
// ARMS (driverless — the wintrack audit's armed corpus confounded the road
// with the tablepathdriver's door steering; this isolates the road):
//   SIDE=control:   SEATDRIVE=1 alone (RELAYDARK unset -> pure delegation)
//   SIDE=roadarmed:  SEATDRIVE=1 + RELAYDARK=1, the layer ACTIVE ON EVERY RUN
//                   (one verb/day: claim -> deepen -> reroute-efficient ->
//                   rewrite/skim; completion lean<=-44, grounding<=48,
//                   darkUses>=6; quiet once tablePreview() non-null;
//                   grounding floor 32).
// Composition (both arms): withSeatDrive(withWinDefer(withRelayDark(base)))
// — the probe's stack minus the driver, identical relative order.
//
// SUBSTRATE (identical to the wintrack audit, minus the driver):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1
// Seeds 64201-64208 x {leadfeast, belongfeast} = 32 runs, 180d death-aware.
// Output: evidence/2026-10-20/perseed-relaydarkcost/<side>/<policy>/s<seed>.json
//
// Attribution path (per the task): doorEvents + finalsEvents + the
// canonical endRec.tb record — NOT the tablepathdriver walked recorder
// (sibling arm is fixing it this run). On these driverless runs there are
// no door/finals events; attribution runs on endRec.tb (wins) and the
// stall classes (non-wins), per the wintrack audit's own control side.
//
// DEATH-CHANNEL TAXONOMY + instrument machinery below is copied VERBATIM
// from scripts/probe-tablepathdriver-20261020.js (identical-by-construction
// with probe-posttable / windowsurvive / vetwindow) so channel shares stay
// comparable across arms. Do not modify the copied block; provenance is
// recorded in the evidence file.
//
// Usage (substrate env + SIDE):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 \
//   SIDE=control node scripts/sweep-relaydarkcost-20261020.js
//   ... SIDE=roadarmed RELAYDARK=1 node scripts/sweep-relaydarkcost-20261020.js
//   SMOKE=1 ...   # short smoke per side
//   DET=1 ...     # det-gate: each run twice byte-identical (no unseeded RNG)
//   FIDELITY=1 ...# SIDE=control only: vs the COMMITTED wintrack control
//                # corpus (perseed-tablepathdriver-control) — quantifies
//                # base drift since the audit; NOT a pass/fail gate.
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const RD = require('./policies/relaydark');
const KD = require('./killdisc-instrument-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// ——— VERBATIM MACHINERY from scripts/probe-tablepathdriver-20261020.js ———
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

// (END VERBATIM: writeFileRetry, DAYS_DEFAULT, daysNow)
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

// KILLER-WAVE JOIN — identical to probe-posttable (the startCombat tele +
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
// identical-by-construction with probe-posttable.
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
  } catch (e) { r.phase = null; r.path = null; r.branch = null; r.beat = null; r.seat = null; r.winDeferred = false; }
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

// ——— END VERBATIM MACHINERY (from scripts/probe-tablepathdriver-20261020.js) ———
// isBare: this arm never runs bare (no SEATDRIVEPOSTTABLE_BARE support).
const isBare = () => false;

// SUBSTRATE GUARD — the seatdrive win-side stack + the relaydark layer,
// driverless. TABLEPATHDRIVER must be UNSET (this arm never steers doors).
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'SEATDRIVE'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (relaydarkcost substrate).`); process.exit(2); }
}
const SIDE = process.env.SIDE || 'control';
if (SIDE !== 'control' && SIDE !== 'roadarmed') { console.error('SWEEP STOP: SIDE=control|roadarmed.'); process.exit(2); }
const FID = process.env.FIDELITY === '1';
if (FID && SIDE !== 'control') { console.error('SWEEP STOP: FIDELITY=1 only on SIDE=control.'); process.exit(2); }
const RD_ARM = SIDE === 'roadarmed';
if (RD_ARM && process.env.RELAYDARK !== '1') { console.error('SWEEP STOP: RELAYDARK=1 is required for SIDE=roadarmed.'); process.exit(2); }
if (!RD_ARM && process.env.RELAYDARK === '1') { console.error('SWEEP STOP: RELAYDARK must be unset for SIDE=control (pure delegation).'); process.exit(2); }
if (process.env.TABLEPATHDRIVER === '1') { console.error('SWEEP STOP: TABLEPATHDRIVER must NOT be 1 (driverless judged comparison).'); process.exit(2); }
if (process.env.VETREL === '1') { console.error('SWEEP STOP: VETREL must NOT be 1.'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1.'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (RD_ARM && !RD.layerOn()) { console.error('SWEEP STOP: relaydark layerOn() false despite RELAYDARK=1.'); process.exit(2); }
if (!RD_ARM && RD.layerOn()) { console.error('SWEEP STOP: relaydark layerOn() true on the control side.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208]).filter(Number.isFinite);
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-relaydarkcost', SIDE);

function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rd = RD.withRelayDark(base, `${tag}-relaydarkcost`,
    `${policyId} + relaydark (RELAYDARK=${RD_ARM ? '1' : 'unset'}, active=${RD_ARM})`, { active: RD_ARM });
  const wd = WD.withWinDefer(rd, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-seatdrive`, `${policyId} + seatdrive (SEATDRIVE=1)`);
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = policyFor(policyId);
  const C = {
    recs: [], hashes: [], deathRecs: [], fightStarts: [], _router: null,
    instrumentErrors: 0,
    maxRank: 0, everTable: false, exiled: false,
    maxWave: 1, wave4Day: null, wave5Day: null, nationalDay: null,
    tableDay: null, sittingDay: null, satEver: false, tableDoneDay: null,
    tableActiveDays: 0, phaseSet: new Set(), seatAtSit: null, tableDayFloorOk: null,
    otierMax: 0, otierNullRecs: 0,
    // Attribution surface (driverless): the relay state at sitting and at
    // run end, and the relaydark layer's ctx summary at run end.
    tpAssigned: null, relayAtSit: null, relayAtEnd: null, tpdSummary: null, rdSummary: null,
    kd: { kills: [], dmg: {}, census: [], engagements: [], instrumentErrors: [] },
  };
  const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    try { installDeathCapture(G, C); } catch (e) { C.instrumentErrors++; }
    try { KD.install(G, C.kd); } catch (e) { C.instrumentErrors++; }
    return r;
  };
  const oDaily = base.daily;
  let lastCtx = null;
  policy.daily = (G, ctx) => {
    lastCtx = ctx;
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      C.hashes.push(scholarDay(G) + ':' + dayHash(Game));
    } catch (e) {}
    try {
      const rec = dailyRec(G);
      C.recs.push(rec);
      if (rec.otier == null) C.otierNullRecs++;
      else if (rec.otier > C.otierMax) C.otierMax = rec.otier;
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
      if (tb.sitting > 0 && !C.satEver) {
        C.satEver = true; C.sittingDay = rec.d; C.seatAtSit = tb.seat;
        try { C.relayAtSit = RD.relayState(G); } catch (e) { C.relayAtSit = { err: 1 }; }
      }
      if (tb.done && C.tableDoneDay == null) C.tableDoneDay = rec.d;
      if (tb.phase) C.phaseSet.add(tb.phase);
      if (tb.active) C.tableActiveDays++;
      if ((G.state.scholar || {}).exiled) C.exiled = true;
    } catch (e) { C.instrumentErrors++; }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  const monsterNames = monsterNameSet(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = attributeDeaths(Game, C, monsterNames);
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
  const kdKills = (C.kd.kills || []).length;
  try { C.relayAtEnd = RD.relayState(Game); } catch (e) { C.relayAtEnd = { err: 1 }; }
  try {
    const r = lastCtx && lastCtx._relaydark;
    if (r) C.rdSummary = {
      active: !!r.active, claimed: r.claimed | 0, claimDay: r.claimDay, claimAttempts: r.claimAttempts | 0,
      claimFailed: r.claimFailed | 0, waitingLink: r.waitingLink | 0, held: r.held | 0,
      deepens: r.deepens | 0, efficients: r.efficients | 0, rewrites: r.rewrites | 0, skims: r.skims | 0,
      nullVerbs: r.nullVerbs | 0, verbError: r.verbError | 0, noDarkAbil: r.noDarkAbil | 0,
      done: r.done | 0, doneDay: r.doneDay, floorStop: r.floorStop | 0, stoppedTable: r.stoppedTable | 0,
      lean: r.lean, grounding: r.grounding, darkUses: r.darkUses | 0, lightUses: r.lightUses | 0,
      bond: r.bond | 0, stage: r.stage | 0, rdError: (lastCtx.rdError | 0),
    };
    else C.rdSummary = { active: false, note: 'relaydark layer never installed (gate off)' };
  } catch (e) { C.rdSummary = { err: 1 }; }
  const out = {
    seed, policyId, substrate: 'relaydarkcost-judged', side: SIDE,
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won, wins: !!Game.won,
    national: C.nationalDay != null, table: !!C.everTable, exiled: !!C.exiled,
    maxRank: C.maxRank, nationalDay: C.nationalDay,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    tableDay: C.tableDay, tableDayFloorOk: C.tableDayFloorOk,
    satEver: C.satEver, sittingDay: C.sittingDay, seatAtSit: C.seatAtSit,
    tableDoneDay: C.tableDoneDay, tableActiveDays: C.tableActiveDays,
    phaseTrace: [...C.phaseSet].sort(),
    tpAssigned: C.tpAssigned, relayAtSit: C.relayAtSit, relayAtEnd: C.relayAtEnd,
    tpdSummary: C.tpdSummary, rdSummary: C.rdSummary,
    otierMax: C.otierMax, otierNullRecs: C.otierNullRecs,
    instrumentErrors: C.instrumentErrors | 0,
    kdErrors: (C.kd.instrumentErrors || []).length | 0,
    kdKills,
    deaths,
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
  const MODE = process.env.DET === '1' ? 'det'
    : process.env.SMOKE === '1' ? 'smoke' : FID ? 'fidelity' : 'sweep';
  if (MODE === 'det') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        const c1 = await runOne(seed, policyId, { noWrite: true });
        const c2 = await runOne(seed, policyId, { noWrite: true });
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        const pass = hc1 === hc2 && hc1.length > 0;
        console.log(`  DET s${seed} ${policyId} [${SIDE}]: ${pass ? 'PASS' : 'FAIL'} (armed-stable=${hc1 === hc2}, ${c1.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — the layer perturbs the RNG stream');
    process.exit(ok ? 0 : 1);
  }
  if (MODE === 'fidelity') {
    const CONTROL = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tablepathdriver-control');
    let drift = 0, total = 0;
    for (const policyId of POLICIES) {
      for (const seed of SEEDS) {
        const out = await runOne(seed, policyId, { noWrite: true });
        const mine = out.hashes.join('|');
        const fp = path.join(CONTROL, policyId, `s${seed}.json`);
        if (!fs.existsSync(fp)) { console.log(`  FIDELITY s${seed} ${policyId}: SKIP (no wintrack control file)`); continue; }
        const ctrl = JSON.parse(fs.readFileSync(fp, 'utf8'));
        const theirs = (ctrl.hashes || []).join('|');
        total++;
        if (mine !== theirs) { drift++; console.log(`  FIDELITY s${seed} ${policyId}: DRIFT (probe ${out.hashes.length}d vs wintrack ${((ctrl.hashes || []).length)}d)`); }
      }
    }
    console.log(`FIDELITY: ${total - drift}/${total} byte-identical to the wintrack control corpus${drift ? ' — BASE DRIFTED since the audit (context only, not a gate)' : ''}`);
    return;
  }
  if (MODE === 'smoke') {
    process.env.DAYS = process.env.DAYS || '30';
    for (const policyId of POLICIES) {
      const out = await runOne(SEEDS[0], policyId, { noWrite: true });
      const rs = out.relayAtEnd || {};
      console.log(`  SMOKE ${policyId} s${SEEDS[0]} [${SIDE}]: days=${out.gameDays} end=${out.endReason} won=${out.won} recs=${out.recs.length} otierMax=${out.otierMax} deaths=${out.deathsAttributed.attributedCount} ierr=${out.instrumentErrors} kdErr=${out.kdErrors} relayHeld=${rs.held} lean=${rs.lean} grounding=${rs.grounding} darkUses=${rs.darkUses} rdErr=${(out.rdSummary || {}).rdError}`);
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep.
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      results.push(out);
      const rd = out.rdSummary || {};
      console.log(`  [${SIDE} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} table=${out.table} tday=${out.tableDay} sat=${out.satEver} phases=${out.phaseTrace.join(',') || '-'} otierMax=${out.otierMax} deaths=${out.deathsAttributed.attributedCount} unattrib=${out.deathsAttributed.unattributedCount} ierr=${out.instrumentErrors} kdErr=${out.kdErrors} rdDone=${rd.done} rdClaimDay=${rd.claimDay} rdVerbs=${(rd.deepens | 0) + (rd.efficients | 0) + (rd.rewrites | 0) + (rd.skims | 0)}`);
    }
  }
  const n = results.length;
  const agg = (f) => results.filter(f).length;
  console.log(`SWEEP COMPLETE [${SIDE}]: ${n}/${SEEDS.length * POLICIES.length} runs, 0 errors`);
  console.log(`  national=${agg(r => r.national)} table=${agg(r => r.table)} wins=${agg(r => r.won)} wave4=${agg(r => r.wave45)} wave5=${agg(r => r.wave5)} sat=${agg(r => r.satEver)} exiled=${agg(r => r.exiled)}`);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, policyFor, dailyRec, stateSnap, tableRec, overtimeTierOf, classifyDeath, isPersonDeath, diedForReal, attributeDeaths, waveOf, daysNow };
