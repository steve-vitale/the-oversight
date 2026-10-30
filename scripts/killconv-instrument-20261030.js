#!/usr/bin/env node
// killconv-instrument-20261030.js — kill-conversion diagnostic instrument
// (sim-killconv-a, 2026-10-30, axis scale-onramp). DIAGNOSTIC — no lever.
//
// Measures full-seat conversion through the kill-conversion / veterans-bar
// channel under the gating freeze: the wave-5 bar needs 2 DISTINCT LIVING
// villagers with wave-4+ kills (standing.js waveCombatReadiness). This
// instrument decomposes every bar shortfall into OPPORTUNITY / SURVIVORSHIP
// / ACCOUNTING. It extends the killdisc-v2 pattern (scripts/
// killdisc-instrument-20261021.js) with a readiness(5) daily census and
// wave-4 fight transcript snapshots for sense-testing.
//
// Env-gated on KILLCONV=1. Contract: instrumentOn(), install(Game, t),
// uninstall; when unset the wrappers are never installed and the sim path
// is byte-identical to base — the proof test's det-gate pins that.
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.recordWaveKill / recordPyrrhicKill — kill records (day, mid,
//     base wave from data, killer vid, via, pyrrhic flag).
//   Game.fieldFight — villager-side engagements, wave>=3, outcome class
//     (evade|vKill|mFlee|vFlee|vDie|alreadyDead|unresolved) + transcript
//     snapshot for wave>=4 fights (capped per outcome class).
//   Game.startCombat / tbEnd / tbBarrierExit — scholar TB engagements +
//     end outcomes, wave>=3, with transcript snapshots for wave>=4.
//   Game.castMonster / spawnWorldMonster — spawn census (id, base wave,
//     veteran flag — world spawns read it from the mdef/opts object).
//   Game.sleep — daily census: unlocked wave, standing total, readiness(4)
//     and readiness(5) (veterans count + short bars + armored/armed/tricks),
//     scale rank.
//   Game.say — narration ring buffer (last 400 lines) feeding the fight
//     transcript snapshots only; never written to per-seed JSON wholesale.
//
// Determinism: tbfight.id contains Date.now() — used ONLY as an in-run map
// key, NEVER written to per-seed JSON. Transcript snapshots are narration
// text (RNG-determined, re-run identical); snapshot selection is by first
// occurrence per outcome class, so re-runs are byte-comparable.
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.KILLCONV === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function waveOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    const d = defs.find(m => m && m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}

function classifyFieldFight(rec) {
  try {
    if (!rec || typeof rec !== 'object') return 'unresolved';
    const o = rec.outcome;
    if (o === 'evade' || o === 'vKill' || o === 'mFlee' || o === 'vFlee' || o === 'vDie' || o === 'alreadyDead') return o;
    return 'unresolved';
  } catch (e) { return 'unresolved'; }
}

// livingVids(Game): roster vids alive at read time, mirroring standing.js
// isLiving (current scholar counts as living; vp.dead marks the rest).
function livingVids(Game) {
  const out = new Set();
  try {
    const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
    const scholarId = Game.villagerId;
    for (const vid of roster) {
      if (vid === scholarId) { out.add(vid); continue; }
      let vp = null;
      try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; } catch (e) { vp = null; }
      if (vp && !vp.dead) out.add(vid);
    }
  } catch (e) {}
  return out;
}

function readinessOf(Game, w) {
  try {
    const r = (typeof Game.waveCombatReadiness === 'function') ? Game.waveCombatReadiness(w) : null;
    if (!r) return null;
    return { ready: !!r.ready, veterans: r.veterans | 0, armored: r.armored | 0, armed: r.armed | 0, tricks: r.tricks | 0, short: (r.short || []).slice() };
  } catch (e) { return null; }
}

// snapshotEnd(Game): end-of-run read for bar accounting. Pure reads.
function snapshotEnd(Game) {
  const s = {};
  try { s.waveKillLog = JSON.parse(JSON.stringify((Game.state && Game.state.waveKillLog) || [])); } catch (e) { s.waveKillLog = []; }
  try { s.living = Array.from(livingVids(Game)).sort(); } catch (e) { s.living = []; }
  try { s.roster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) { s.roster = []; }
  try { s.scholarVid = Game.villagerId || null; } catch (e) { s.scholarVid = null; }
  try { s.readiness4 = readinessOf(Game, 4); } catch (e) { s.readiness4 = null; }
  try { s.readiness5 = readinessOf(Game, 5); } catch (e) { s.readiness5 = null; }
  try { s.unlockedWave = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) { s.unlockedWave = null; }
  try { s.scaleRank = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null; } catch (e) { s.scaleRank = null; }
  try { const pg = (typeof Game.progState === 'function') ? Game.progState() : {}; s.tableWaiting = !!pg.tableWaiting; s.tableDone = !!pg.tableDone; } catch (e) { s.tableWaiting = false; s.tableDone = false; }
  try { s.won = !!Game.won; s.villageLost = !!Game.villageLost; s.over = !!Game.over; } catch (e) {}
  try { const dg = (typeof Game.deedGateReady === 'function') ? Game.deedGateReady() : null; s.deedGateOk = dg ? !!dg.ok : null; } catch (e) { s.deedGateOk = null; }
  return s;
}

// install(Game, t): t = {kills, engagements, fieldFights, spawns,
// tbOutcomes, census, transcripts, instrumentErrors}. Returns uninstall.
function install(Game, t) {
  if (!t.fieldFights) t.fieldFights = [];
  if (!t.spawns) t.spawns = [];
  if (!t.tbOutcomes) t.tbOutcomes = {};
  if (!t.transcripts) t.transcripts = [];
  const orig = {};

  // Narration ring buffer (last 400 say lines) — transcript source only.
  const ring = [];
  const snapCount = {};
  function snapTranscript(cls, meta) {
    try {
      const n = snapCount[cls] || 0;
      if (n >= 3) return; // at most 3 snapshots per outcome class per run
      snapCount[cls] = n + 1;
      t.transcripts.push(Object.assign({ cls }, meta, { lines: ring.slice(-120) }));
    } catch (e) { err(t, 'snapTranscript', e); }
  }
  const wrap = (name, before, after) => {
    const o = Game[name];
    if (typeof o !== 'function') { err(t, 'install.missing:' + name, new Error('not a function')); return; }
    orig[name] = o;
    Game[name] = function () {
      let pre = null;
      try { if (before) pre = before.apply(this, arguments); } catch (e) { err(t, name + '.before', e); }
      let r;
      try { r = o.apply(this, arguments); } catch (e) { err(t, name + '.call', e); throw e; }
      try { if (after) after.call(this, r, pre, arguments); } catch (e) { err(t, name + '.after', e); }
      return r;
    };
  };

  if (typeof Game.say === 'function') {
    wrap('say', function () {
      try {
        const line = Array.prototype.map.call(arguments, a => (a === undefined || a === null) ? '' : String(a)).join(' ');
        ring.push(line);
        if (ring.length > 400) ring.shift();
      } catch (e) {}
      return null;
    }, null);
  } else { err(t, 'install.missing:say', new Error('not a function')); }

  const pushKill = (pre, pyrrhic) => {
    if (!pre) return;
    try {
      t.kills.push({ day: pre.day, mid: pre.monsterId, wave: waveOf(Game, pre.monsterId), by: pre.killerVid, via: pre.via, pyrrhic: !!pyrrhic });
    } catch (e) { err(t, 'pushKill', e); }
  };
  wrap('recordWaveKill',
    function (monsterId, killerVid, via) { return { monsterId, killerVid: killerVid || null, via: via || 'unknown', day: gday(Game) }; },
    function (r, pre) { pushKill(pre, false); });
  wrap('recordPyrrhicKill',
    function (monsterId, killerVid, via) { return { monsterId, killerVid: killerVid || null, via: via || 'unknown', day: gday(Game) }; },
    function (r, pre) { pushKill(pre, true); });

  wrap('startCombat',
    function (monsterId) {
      let beforeId = null;
      try { beforeId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      return { monsterId, wave: waveOf(Game, monsterId), day: gday(Game), beforeId };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        let afterId = null;
        try { afterId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
        const started = !!(afterId && afterId !== pre.beforeId);
        if ((pre.wave | 0) >= 3) t.engagements.push({ day: pre.day, mid: pre.monsterId, wave: pre.wave, fightId: started ? afterId : null, started: started });
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  wrap('tbEnd',
    function (result) {
      let fightId = null, wave = 0, mid = null;
      try { fightId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      try {
        const eng = (t.engagements || []).find(e => e.fightId === fightId);
        if (eng) { wave = eng.wave; mid = eng.mid; }
      } catch (e) {}
      return { fightId, result: (result === undefined || result === null) ? 'unknown' : String(result), wave, mid, day: gday(Game) };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        if (pre.fightId) t.tbOutcomes[pre.fightId] = pre.result;
        else t.tbOutcomes['no-fight-id:' + pre.result] = (t.tbOutcomes['no-fight-id:' + pre.result] || 0) + 1;
        if ((pre.wave | 0) >= 4 && pre.fightId) snapTranscript('tb-' + pre.result, { day: pre.day, mid: pre.mid, wave: pre.wave, kind: 'tb', outcome: pre.result });
      } catch (e) { err(t, 'tbEnd.push', e); }
    });

  wrap('tbBarrierExit',
    function () {
      let f = null, holderVid = null, over = false;
      try { f = Game.tbfight || null; } catch (e) {}
      try { holderVid = Game.villagerId; } catch (e) {}
      try { over = !!Game.over; } catch (e) {}
      return { fightId: f ? (f.id || null) : null, hadFight: !!f, holderVid, over };
    },
    function (r, pre) {
      if (!pre || !pre.fightId || !pre.hadFight) return;
      try {
        if (t.tbOutcomes[pre.fightId]) return;
        if (Game.tbfight) return;
        let nb = null, nover = false;
        try { nb = Game.villagerId; } catch (e) {}
        try { nover = !!Game.over; } catch (e) {}
        if (nover || nb !== pre.holderVid) t.tbOutcomes[pre.fightId] = 'dissolved';
      } catch (e) { err(t, 'tbBarrierExit.push', e); }
    });

  wrap('fieldFight',
    function (vid, mdef) {
      let mid = null;
      try { mid = (mdef && mdef.id) || null; } catch (e) {}
      return { vid: (vid === undefined || vid === null) ? null : String(vid), mid, wave: mid ? waveOf(Game, mid) : 0, day: gday(Game) };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        if ((pre.wave | 0) < 3) return;
        const rec = (r && typeof r === 'object') ? r : null;
        const outcome = classifyFieldFight(rec);
        t.fieldFights.push({ day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave, outcome, rounds: rec && rec.rounds != null ? rec.rounds : null, vTaken: rec && rec.vTaken != null ? rec.vTaken : null, mDealt: rec && rec.mDealt != null ? rec.mDealt : null, vHpLeft: rec && rec.vHpLeft != null ? rec.vHpLeft : null, mHpLeft: rec && rec.mHpLeft != null ? rec.mHpLeft : null });
        if ((pre.wave | 0) >= 4) snapTranscript('ff-' + outcome, { day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave, kind: 'fieldFight', outcome });
      } catch (e) { err(t, 'fieldFight.push', e); }
    });

  wrap('castMonster',
    function () { return { day: gday(Game) }; },
    function (r, pre) {
      if (!pre) return;
      try {
        let mid = null, veteran = false;
        if (typeof r === 'string') mid = r;
        else if (r && typeof r === 'object') { mid = r.id || null; veteran = !!r.veteran; }
        if (!mid) return;
        t.spawns.push({ day: pre.day, mid, wave: waveOf(Game, mid), veteran, src: 'cast' });
      } catch (e) { err(t, 'castMonster.push', e); }
    });

  wrap('spawnWorldMonster',
    function (mdef, tx, ty, opts) { return { day: gday(Game), mdef: mdef, opts: opts || null }; },
    function (r, pre) {
      if (!pre) return;
      try {
        let mid = null, veteran = false;
        const md = pre.mdef;
        if (typeof md === 'string') mid = md;
        else if (md && typeof md === 'object') { mid = md.id || null; veteran = !!md.veteran; }
        if (!veteran && pre.opts && typeof pre.opts === 'object') veteran = !!pre.opts.veteran;
        if (!mid) return;
        const wave = waveOf(Game, mid) | 0;
        if (wave < 3) return;
        t.spawns.push({ day: pre.day, mid, wave, veteran, src: 'world' });
      } catch (e) { err(t, 'spawnWorldMonster.push', e); }
    });

  const origSleep = Game.sleep;
  if (typeof origSleep === 'function') {
    orig.sleep = origSleep;
    Game.sleep = function () {
      try {
        const day = gday(Game);
        const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
        let raw = null;
        try { const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; raw = vs ? (vs.total | 0) : null; } catch (e) { err(t, 'sleep.raw', e); }
        let rank = null;
        try { rank = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null; } catch (e) { err(t, 'sleep.rank', e); }
        t.census.push({ day, uw, raw, rank, r4: readinessOf(Game, 4), r5: readinessOf(Game, 5) });
      } catch (e) { err(t, 'sleep', e); }
      return origSleep.apply(this, arguments);
    };
  } else { err(t, 'install.missing:sleep', new Error('not a function')); }

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, snapshotEnd, livingVids, readinessOf, waveOf, classifyFieldFight };
