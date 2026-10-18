#!/usr/bin/env node
// compchan-instrument-20261018.js — companion→veteran funnel census instrument
// (sim-compchan, 2026-10-18, axis scale-onramp). DIAGNOSTIC — no lever.
//
// READ-ONLY observation wraps. Env-gated: install(Game, t) is called by the
// sweep ONLY when process.env.COMPCHAN === '1'. When unset the wrappers are
// never installed and the policy path is byte-identical to the tribfloor
// base (the proof test's det-gate pins that).
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.recordWaveKill      — kill-time ctx capture per kill
//   Game.recordPyrrhicKill   — same (pyrrhic=true)
//   Game.startCombat         — engagement census (scholar TB fights)
//   Game.sleep               — daily readiness census (standing, veterans, window)
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
//
// Kill-time ctx (captured BEFORE the call-through, so successions and
// tbfight teardown can't move it):
//   day, scholarVid (Game.villagerId AT KILL TIME — successions change it),
//   aid (aidCrisis live), atHaven (playerAtHaven), inTb (Game.tbfight live —
//   tbEnd nulls it in a finally AFTER the kill ledger, game.js:41332, so
//   scholar-TB kills see inTb=true), onExped (state.exped[scholarVid]),
//   partyVids (state.village.party at kill time).
'use strict';

function instrumentOn() { return process.env.COMPCHAN === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function partyVids(Game) {
  try {
    const p = ((Game.state || {}).village || {}).party || [];
    return p.map(x => {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object') return x.vid || x.id || null;
      return null;
    }).filter(Boolean);
  } catch (e) { return []; }
}

// killCtx(Game, t): the kill-time context snapshot. Pure reads.
function killCtx(Game, t) {
  const ctx = { day: gday(Game), scholarVid: null, aid: false, atHaven: false, inTb: false, onExped: false, partyVids: [] };
  try { ctx.scholarVid = Game.villagerId || null; } catch (e) { err(t, 'ctx.scholarVid', e); }
  try { ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) { err(t, 'ctx.aid', e); }
  try { ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { err(t, 'ctx.atHaven', e); }
  try { ctx.inTb = !!Game.tbfight; } catch (e) { err(t, 'ctx.inTb', e); }
  try {
    const st = Game.state || {};
    ctx.onExped = !!(st.exped && ctx.scholarVid && st.exped[ctx.scholarVid]);
  } catch (e) { err(t, 'ctx.onExped', e); }
  try { ctx.partyVids = partyVids(Game); } catch (e) { err(t, 'ctx.party', e); }
  return ctx;
}

// classifyKill(entry, ctx): fight-shape taxonomy for a waveKillLog entry.
// Adapted from the vetwindow death-channel taxonomy (sim-vetwindow,
// 2026-10-18), applied to kills. entry: {via, w}. Returns one of:
// raid | expedition | wild | haven-TB | agency | patrol | contest | unknown.
function classifyKill(entry, ctx) {
  const via = (entry && entry.via) || 'unknown';
  ctx = ctx || {};
  if (ctx.aid || via === 'aid-crisis') return 'raid';
  if (via === 'agency') return 'agency';
  if (via === 'sortie') return 'expedition';
  if (via === 'patrol') return 'patrol';
  if (via === 'contest') return 'contest';
  if (ctx.onExped) return 'expedition';
  if (via === 'wild') return 'wild';
  if (ctx.atHaven && ctx.inTb) return 'haven-TB';
  if (ctx.inTb) return 'wild'; // scholar TB fight in the wild
  if (via === 'player' || via === 'companion') return ctx.atHaven ? 'haven-TB' : 'wild';
  return 'unknown';
}

function waveOf(Game, monsterId) {
  try {
    const m = ((Game.data || {}).monsters || []).find(x => x && x.id === monsterId);
    return (m && m.wave) || 0;
  } catch (e) { return 0; }
}

// install(Game, t): installs the read-only wraps. t = {kills, engagements,
// census, instrumentErrors}. Returns an uninstall function (restores the
// originals) so the sweep leaves Game pristine for post-run reads.
function install(Game, t) {
  const orig = {};
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

  // Kill attribution: recordWaveKill(monsterId, killerVid, via, detail).
  wrap('recordWaveKill',
    function (monsterId, killerVid, via) {
      const ctx = killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', ctx, pyrrhic: false };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        t.kills.push({
          day: pre.ctx.day, mid: pre.monsterId, wave: waveOf(Game, pre.monsterId),
          by: pre.killerVid, via: pre.via, pyrrhic: false, ctx: pre.ctx,
        });
      } catch (e) { err(t, 'recordWaveKill.push', e); }
    });

  // Pyrrhic kills: recordPyrrhicKill(monsterId, killerVid, via, detail).
  wrap('recordPyrrhicKill',
    function (monsterId, killerVid, via) {
      const ctx = killCtx(Game, t);
      return { monsterId, killerVid: killerVid || null, via: via || 'unknown', ctx, pyrrhic: true };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        t.kills.push({
          day: pre.ctx.day, mid: pre.monsterId, wave: waveOf(Game, pre.monsterId),
          by: pre.killerVid, via: pre.via, pyrrhic: true, ctx: pre.ctx,
        });
      } catch (e) { err(t, 'recordPyrrhicKill.push', e); }
    });

  // Engagement census: startCombat(monsterId) — the scholar's TB entry.
  wrap('startCombat',
    function (monsterId) {
      const ctx = killCtx(Game, t);
      return { monsterId, wave: waveOf(Game, monsterId), ctx };
    },
    function (r, pre) {
      if (!pre) return;
      try {
        t.engagements.push({
          day: pre.ctx.day, mid: pre.monsterId, wave: pre.wave,
          shape: classifyKill({ via: 'player' }, pre.ctx),
          partySize: pre.ctx.partyVids.length,
        });
      } catch (e) { err(t, 'startCombat.push', e); }
    });

  // Daily readiness census (header: cannot perturb the sim — pure reads).
  const origSleep = Game.sleep;
  if (typeof origSleep === 'function') {
    orig.sleep = origSleep;
    Game.sleep = function () {
      try {
        const day = gday(Game);
        const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
        let st = null;
        try { st = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null; } catch (e) { err(t, 'sleep.standing', e); }
        let rd = null;
        try { rd = (typeof Game.waveCombatReadiness === 'function') ? Game.waveCombatReadiness(4) : null; } catch (e) { err(t, 'sleep.readiness', e); }
        t.census.push({
          day, uw, st,
          veterans: rd ? (rd.veterans | 0) : null,
          short: rd ? (rd.short || []).slice() : null,
        });
      } catch (e) { err(t, 'sleep', e); }
      return origSleep.apply(this, arguments);
    };
  } else { err(t, 'install.missing:sleep', new Error('not a function')); }

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, classifyKill, killCtx, waveOf, partyVids };
