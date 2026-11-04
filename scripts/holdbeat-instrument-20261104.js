// holdbeat-instrument-20261104.js — hold-beat / overlap-window instrument
// (arm sim-holdbeat-a, run fleshout-20261104T0820Z). Scripts only, zero
// src/js. DIAG ONLY: all wraps are call-through and RNG-neutral; every
// catch reports into t.instrumentErrors, never silently.
// Daily snapshots (standacc shape): villageStanding breakdown, capped
// total, readiness-5 bars + waveKillLog veteran recount (wave-4+
// killers, living), _standingPeakWave (door state), scale rank, wave
// faced. The snapshot NEVER calls villageStandingTotal() or
// unlockedWave() (side-effecting: peak recording + beats). Door opens
// are observed only as the ENGINE announces them (release say-lines +
// peak transitions). ONE end-of-run unlockedWave() call is made by the
// DRIVER after the run and reported separately, never counted as a
// natural door-open.
// Q1: overlap days (recount >= 2) carry standing/capped/ready/peak +
// the day's NATURAL villageStandingTotal() call count (call-through
// wrap), so "release never evaluated" vs "evaluated and held" split.
// Q2: ONE global sequence counter across all captured events. Kill
// credit (recordWaveKill/recordPyrrhicKill exit), hold/veteran-kill/
// release say-lines, and villageStandingTotal entry/exit all carry
// seq. On a hold-beat line, the wrap ALSO records the live
// waveCombatReadiness(5).veterans + waveKillLog length AT THAT MOMENT
// (read-only reads) — the beat's own contemporaneous count.
// Beast HP at fight start: startCombat post-call monster snapshot
// (mid/hp/maxHp), looked up by kill wraps — best effort, null outside
// TB. At kill time the beast is dead (hp 0), so the fight-start
// snapshot is the only fresh-vs-mop-up signal.
// Usage: const INST = require('./holdbeat-instrument-20261104');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}
const HOLD_RE = /blood your fighters \((\d+) of (\d+) veterans\)/;
const VETKILL_RE = /veteran kill, folks/i;
const RELEASE5_RE = /greenlit the fifth draft/i;
const RELEASE4_RE = /RATINGS ARE UP/i;
const SAY_RE = /fifth draft|producers|RATINGS|stays in the wings|bread alone|next act|ready to FIGHT|talent has been released|greenlit|veteran|feast|polity|realm|\bStanding \d+ \(/i;

function install(Game) {
  const t = {
    daily: [], killEvents: [], beatEvents: [], gateCalls: [],
    standingLines: [], deathEvents: [], instrumentErrors: [],
    wrapCounts: {}, seq: 0, lastFightStart: [],
  };
  const orig = {};
  function nextSeq() { t.seq += 1; return t.seq; }
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }
  function killLogLen() { try { return ((Game.state || {}).waveKillLog || []).length; } catch (e) { return null; } }
  function beatMomentVeterans() {
    try { const rd = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; return rd ? (rd.veterans | 0) : null; } catch (e) { return null; }
  }

  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function () {
      count('startCombat');
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { throw e; }
      try {
        const mons = [];
        const f = Game.tbfight || null;
        for (const m of ((f && f.fighters) || [])) {
          if (!m || m.kind !== 'monster') continue;
          mons.push({ mid: ((m.mdef || {}).id || m.monsterId || m.id) || null,
            hp: m.hp != null ? m.hp : null, maxHp: m.maxHp != null ? m.maxHp : null });
        }
        t.lastFightStart = mons;
      } catch (e) { err('startCombat-snap', e); }
      return r;
    };
  }

  function wrapKill(fnName, pyrrhic) {
    if (typeof Game[fnName] !== 'function') { err('install.' + fnName, new Error('not a function')); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (monsterId, killerVid, via, detail) {
      count(fnName);
      const seqEntry = nextSeq();
      const before = killLogLen();
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { throw e; }
      const seqCredit = nextSeq();
      try {
        const after = killLogLen();
        const w = waveOf(Game, monsterId);
        let fightStart = null;
        try { fightStart = (t.lastFightStart || []).find(function (m) { return m.mid === monsterId; }) || null; } catch (e) {}
        t.killEvents.push({ day: dayOf(Game), fn: fnName, pyrrhic: !!pyrrhic,
          mid: monsterId, wave: w, by: (killerVid == null ? null : killerVid),
          via: via || 'unknown', logLenBefore: before, logLenAfter: after,
          entryAdded: (before != null && after != null && after > before),
          seqEntry: seqEntry, seqCredit: seqCredit,
          beastHpAtFightStart: fightStart ? fightStart.hp : null,
          beastMaxHp: fightStart ? fightStart.maxHp : null });
      } catch (e) { err(fnName + '-row', e); }
      return r;
    };
  }
  wrapKill('recordWaveKill', false);
  wrapKill('recordPyrrhicKill', true);

  if (typeof Game.villageStandingTotal === 'function') {
    orig.villageStandingTotal = Game.villageStandingTotal;
    Game.villageStandingTotal = function () {
      count('villageStandingTotal');
      const seqEntry = nextSeq();
      const d = dayOf(Game);
      let r;
      try { r = orig.villageStandingTotal.apply(this, arguments); } catch (e) { throw e; }
      const seqExit = nextSeq();
      try { t.gateCalls.push({ day: d, seqEntry: seqEntry, seqExit: seqExit, gated: r }); } catch (e) { err('gate-row', e); }
      return r;
    };
  } else { err('install.villageStandingTotal', new Error('not a function')); }

  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'death' && data && typeof data === 'object') {
          t.deathEvents.push({ day: dayOf(Game), kind: data.kind || null, who: data.who || null, cause: data.cause || null, player: !!data.player });
        }
      } catch (e) { err('tele', e); }
      return r;
    };
  } else { err('install.tele', new Error('not a function')); }

  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (typeof arg === 'string' && SAY_RE.test(arg)) {
          const seq = nextSeq();
          const line = String(arg).slice(0, 600);
          t.standingLines.push({ day: dayOf(Game), via: fnName, seq: seq, line: line });
          let kind = 'other';
          if (RELEASE5_RE.test(line)) kind = 'release5';
          else if (RELEASE4_RE.test(line)) kind = 'release4';
          else if (HOLD_RE.test(line)) kind = 'hold';
          else if (VETKILL_RE.test(line)) kind = 'vetkill';
          if (kind !== 'other') {
            const beat = { day: dayOf(Game), via: fnName, seq: seq, kind: kind, line: line };
            if (kind === 'hold') {
              const m = line.match(HOLD_RE);
              beat.beatVeterans = m ? parseInt(m[1], 10) : null;
              beat.beatDemand = m ? parseInt(m[2], 10) : null;
              beat.momentVeterans = beatMomentVeterans();
              beat.momentLogLen = killLogLen();
            }
            t.beatEvents.push(beat);
          }
        }
      } catch (e) { err(fnName + '-wrap', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  function isLiving(Game, vid, scholarId) {
    if (vid === scholarId) return true;
    try {
      const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
      return !!(vp && !vp.dead);
    } catch (e) { return false; }
  }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.roster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) { snap.roster = []; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; err('readiness5', e); }
    try { snap.standing = Game.villageStanding ? Game.villageStanding() : null; } catch (e) { snap.standing = null; err('standing', e); }
    try { snap.capped = Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; } catch (e) { snap.capped = null; err('capped', e); }
    try { snap.peak = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) { snap.peak = null; err('peak', e); }
    try { snap.deferral5 = Game.standingDeferral ? Game.standingDeferral(5) : null; } catch (e) { snap.deferral5 = null; err('deferral5', e); }
    try { snap.w4faced = Game.waveEngaged ? Game.waveEngaged(4) : null; } catch (e) { snap.w4faced = null; err('w4faced', e); }
    try { snap.w5faced = Game.waveEngaged ? Game.waveEngaged(5) : null; } catch (e) { snap.w5faced = null; err('w5faced', e); }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; err('scaleRank', e); }
    try {
      const log = ((Game.state || {}).waveKillLog || []).filter(function (e) { return e && (e.w | 0) >= 4; });
      snap.logW4 = log.map(function (e) { return { d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via }; });
      const vets = {};
      log.forEach(function (e) { if (e.by) vets[e.by] = true; });
      snap.veteranVids = Object.keys(vets).filter(function (vid) { return isLiving(Game, vid, snap.scholarId); });
      snap.veteranVidsAll = Object.keys(vets);
      snap.veteranRecount = snap.veteranVids.length;
      snap.veteranMismatch = (snap.readiness5 && snap.readiness5.veterans != null)
        ? (snap.veteranRecount !== (snap.readiness5.veterans | 0)) : null;
    } catch (e) { snap.logW4 = null; snap.veteranVids = null; err('veterans', e); }
    try {
      snap.livingCount = snap.roster.filter(function (vid) { return isLiving(Game, vid, snap.scholarId); }).length;
    } catch (e) { snap.livingCount = null; err('livingCount', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() { Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} }); }
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, HOLD_RE: HOLD_RE, VETKILL_RE: VETKILL_RE, RELEASE5_RE: RELEASE5_RE };
