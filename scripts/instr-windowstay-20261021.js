#!/usr/bin/env node
// instr-windowstay-20261021.js — post-unlock-window SURVIVAL CENSUS instrument
// (flesh-out loop arm sim-windowstay-r2, run fleshout-20261021T1215Z, axis
// scale-onramp). INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero
// scripts/policies changes.
//
// CONTEXT: sim-windowreach-r2 (landed 3cfb5f4ef, DIAG-insufficient-data)
// closed the wave-5 door as a LAGGING INDICATOR of a village about to win
// (2/3 measured unlocks won through the window, 1 died in it). Its named
// next is THIS arm: pre-screen on known-unlocking seeds s64406/s64703/s64858
// and measure what happens IN the window on the VGEAR winning substrate:
// what kills villages in the post-unlock window, is wave-5 ever actually
// FOUGHT, and did the unlock change the village's fate?
//
// LAYER: installed ON TOP of the killdisc v2 base
// (scripts/killdisc-instrument-20261021.js, on master, proven non-perturbing)
// and the windowreach window layer
// (scripts/windowreach-instrument-20261021.js, on master via 3cfb5f4ef).
// install(Game, t) installs: killdisc v2 -> window layer -> death-capture
// layer. The ONLY engine mutation anywhere in this arm's tooling is the
// POST-WIN CONTINUATION hook, which lives in the SWEEP
// (scripts/windowstay-sweep-20261021.js, POSTWIN-ALLOW) — NOT in this
// instrument. This file performs ZERO game-state writes and ZERO RNG draws;
// the E3 gate scans it for exactly that.
//
// POST-WIN CONTINUATION (the documented hook): the stock harness
// (scripts/sim-harness.js runDays) loops `for (day = 1; day <= days &&
// !Game.over; day++)`. Every win path in src/js/table.js sets
// `this.over = true; this.won = true;` (table.js:858/963/1046/1075) and
// calls this.wipe() — which removes ONLY the save key, not the in-memory
// state. So a won village is fully alive in memory; the harness just stops
// driving it. THAT is the truncation that killed the s64703 and s64858
// window measurements (wins at ~d90, door at d75-97). The sweep's hook:
// after runDays returns with Game.won, record winDay + winPath
// (tableState().path), set Game.over = false (the one documented flip),
// and call runDays AGAIN for (180 - winDay) loop-days. The village's
// counterfactual window (unlock day -> 180d death-aware) is then a real
// census instead of a truncated one. T.phase='done' + tableWaiting=false
// prevent a second win; a post-win village-lost sets Game.over WITHOUT
// Game.won and the hook never fires — death-aware end preserved.
//
// All reads below are PURE. Every catch reports into t.instrumentErrors
// (the shared killdisc error sink — the PRIMARY gate counts 0 across the
// whole stack). Fight ids contain Date.now: in-run map keys only, never
// persisted (the sweep joins them in-process, like windowreach).
'use strict';
const KD = require('./killdisc-instrument-20261021');
const WR = require('./windowreach-instrument-20261021');

function instrumentOn() { return KD.instrumentOn(); } // same gate: KILLDISC=1

function err(t, where, e) {
  try { t.instrumentErrors.push('windowstay.' + where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function i0(x) { const n = +x; return Number.isFinite(n) ? (n | 0) : -1; }
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

// ---------------------------------------------------------------------------
// DEATH-CHANNEL TAXONOMY — copied VERBATIM from
// scripts/probe-windowsurvive-20261019.js (2026-10-19, DIAG-GO: 72 deaths,
// 0 unattributed). IDENTICAL BY CONSTRUCTION so channel shares are
// comparable across arms (windowsurvive: raids 40/72 the #1 window killer;
// scholars die more than villagers (42 vs 30); they die rich not starving).
// Any change must be mirrored there or the comparability breaks — document
// in the evidence file.
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

// diedForReal(Game, who): phantom check — roster-living => false (phantom,
// excluded, counted); no person record and absent from roster => true
// (dead-and-removed, real); missing who => null (unverifiable, counted LOUD).
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

function waveOf(Game, mid) {
  try {
    const md = ((Game.data && Game.data.monsters) || []).find(x => x && x.id === mid);
    return (md && (md.wave | 0)) || null;
  } catch (e) { return null; }
}

// installDeathCapture(Game, t): the windowsurvive death-capture pattern —
// wraps Game.tele (records death teles with death-time ctx), the two field
// routers (resolvePatrol, resolveWildMonsterEncounter), aidFight, and the
// combat_start tele — all as pure recorders into t.deathRecs / t.fightStarts.
// No state writes, no RNG draws. Returns an uninstall function.
function installDeathCapture(Game, t) {
  if (!Array.isArray(t.deathRecs)) t.deathRecs = [];
  if (!Array.isArray(t.fightStarts)) t.fightStarts = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
  const uninstalls = [];
  let router = null;

  const recFight = (mid, wave, via) => {
    try {
      t.fightStarts.push({
        day: gday(Game),
        mid: mid != null ? String(mid) : null,
        wave: wave != null ? (wave | 0) : waveOf(Game, mid),
        via,
      });
    } catch (e) { err(t, 'recFight', e); }
  };

  const wrapRouter = (name, flag, midOf) => {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { err(t, 'install.missing:' + name, new Error('not a function')); return; }
      Game[name] = function (...args) {
        const prev = router;
        router = flag;
        try {
          try {
            const mid = midOf ? midOf(args) : null;
            if (mid) recFight(mid, null, 'router:' + flag);
          } catch (e) { err(t, name + '.rec', e); }
          return orig.apply(this, args);
        } finally { router = prev; }
      };
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { err(t, 'wrapRouter.' + name, e); }
  };
  wrapRouter('resolvePatrol', 'patrol', (args) => (args[1] && args[1].id) || null);
  wrapRouter('resolveWildMonsterEncounter', 'wild', (args) => (args[1] && args[1].id) || null);

  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try { recFight(mdef && mdef.id, mdef && mdef.wave, 'aidFight'); }
        catch (e) { err(t, 'aidFight.rec', e); }
        return oAid.apply(this, arguments);
      };
      uninstalls.push(() => { try { Game.aidFight = oAid; } catch (e) {} });
    } else { err(t, 'install.missing:aidFight', new Error('not a function')); }
  } catch (e) { err(t, 'aidFight.wrap', e); }

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
            day: gday(Game),
            who: data && data.who != null ? String(data.who) : null,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
            wave: (data && data.wave != null) ? (data.wave | 0) : null, // killer monster's wave (corpses.js)
            ctx: { aid: false, atHaven: false, inTb: false, router: router || null, onExped: false },
            stateAtDeath: stateSnap(Game),
          };
          try { rec.ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) {}
          try { rec.ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
          try { rec.ctx.inTb = !!Game.tbfight; } catch (e) {}
          try {
            const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
            rec.ctx.onExped = !!(st && st.exped && rec.who && st.exped[rec.who]);
          } catch (e) {}
          t.deathRecs.push(rec);
        }
      } catch (e) { err(t, 'tele.rec', e); }
      return r;
    };
    uninstalls.push(() => { try { Game.tele = oTele; } catch (e) {} });
  } catch (e) { err(t, 'tele.wrap', e); }

  return function uninstallDeathCapture() {
    for (const u of uninstalls) { try { u(); } catch (e) {} }
  };
}

// stateSnap(Game): the village's state at a death. PURE reads (verbatim
// from probe-windowsurvive-20261019.js).
function stateSnap(Game) {
  const s = {};
  try { s.pantry = Math.round(Game.pantryKcalLive ? Game.pantryKcalLive(Game.state.village) : -1); }
  catch (e) { s.pantry = -1; }
  try { const pg = Game.progState ? Game.progState() : null; s.hungryStreak = (pg && (pg.hungryStreak | 0)) || 0; } catch (e) { s.hungryStreak = -1; }
  try {
    const r5 = Game.waveUnlockReady ? Game.waveUnlockReady(5) : null;
    if (r5) { s.armored = r5.armored | 0; s.armed = r5.armed | 0; s.vets = r5.veterans | 0; s.tricks = r5.tricks | 0; s.short = (r5.short || []).slice(); s.rdy = !!r5.ready; }
    else { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['no-read']; s.rdy = false; }
  } catch (e) { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['read-error']; s.rdy = false; }
  try {
    const vs = Game.villageStanding ? Game.villageStanding() : {};
    s.raw = (vs.total | 0) || 0; s.war = (vs.war | 0) || 0; s.dip = (vs.diplomacy | 0) || 0; s.plenty = (vs.plenty | 0) || 0;
  } catch (e) { s.raw = -1; s.war = -1; s.dip = -1; s.plenty = -1; }
  try { s.cap = Game.standingPlentyCappedTotal ? (Game.standingPlentyCappedTotal() | 0) : -1; } catch (e) { s.cap = -1; }
  try {
    const df = Game.standingDeferral ? Game.standingDeferral(5) : null;
    s.def5 = !!(df && df.deferred);
  } catch (e) { s.def5 = false; }
  try { s.roster = ((((Game.state && Game.state.village) || {}).roster) || []).length; } catch (e) { s.roster = -1; }
  try { s.scholarAlive = !!(Game.state && Game.state.scholar && !Game.state.scholar.dead); } catch (e) { s.scholarAlive = false; }
  return s;
}

// install(Game, t): killdisc v2 base first, then the windowreach window
// layer, then the death-capture layer. Uninstall restores in reverse order.
// PURE observation — zero game-state writes, zero RNG draws.
function install(Game, t) {
  if (!Array.isArray(t.deathRecs)) t.deathRecs = [];
  if (!Array.isArray(t.fightStarts)) t.fightStarts = [];
  if (!Array.isArray(t.instrumentErrors)) t.instrumentErrors = [];
  const killUninstall = KD.install(Game, t);
  const windowUninstall = WR.installWindowLayer(Game, t);
  const deathUninstall = installDeathCapture(Game, t);
  return function uninstall() {
    try { deathUninstall(); } catch (e) {}
    try { windowUninstall(); } catch (e) {}
    try { killUninstall(); } catch (e) {}
  };
}

module.exports = {
  instrumentOn, install, installDeathCapture, classifyDeath, isPersonDeath,
  diedForReal, monsterNameSet, stateSnap, waveOf, gday,
};
