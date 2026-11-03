#!/usr/bin/env node
// winfunnel-ext-instrument-20261103.js — extension instrument for the
// winnability-push funnel-tracking arm (arm 3, after arms 1+2). It adds
// ONLY the fields the baseline w5faced-competent instrument does not
// carry, and changes nothing about the game:
//   (1) wild ally-join: wraps villagerFightAllies (arm 1's live sensing
//       helper), aidFight, and fieldFight, recording how many field
//       fights carry >= 1 ally (opts.allies / opts.allyVids) and how
//       often the sensing helper returns >= 1 villager. A wild ally-join
//       is counted on the fight row, not on the helper call alone: the
//       helper may be consulted on paths that never become a fight.
//   (2) daily scale rank: snapshot() records Game.scaleRank() per day,
//       so "national reached" means reached on ANY day, not only held
//       at run end (the baseline instrument records scale only at end).
// Install AFTER the baseline instrument (this file wraps whatever
// Game.fieldFight currently is, including the baseline wrap). All wraps
// are call-through; zero RNG draws; zero game-state writes (all counts
// live in the returned `t` object). uninstall() restores originals.
'use strict';

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function waveOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    const d = defs.find(function (m) { return m && m.id === mid; });
    if (d) return d.wave || 1;
  } catch (e) {}
  return 1;
}

function install(Game) {
  const t = {
    senseCalls: [], // villagerFightAllies calls: {day, vid, returned}
    aidRows: [],    // aidFight calls: {day, vid, id, wave, allies, allyVids}
    allyFieldRows: [], // fieldFight calls with opts: {day, vid, id, wave, outcome, allies, allyVids, caller}
    scaleDaily: [], // {day, rank}
    instrumentErrors: [],
  };
  const orig = {};
  const errs = t.instrumentErrors;

  function callerFromStack() {
    try {
      const stack = new Error().stack || '';
      const lines = stack.split('\n').slice(2);
      const names = ['villagerMonsterTick', 'resolveWildMonsterEncounter', 'fieldFight', 'aidFight', 'startCombat'];
      for (const ln of lines) {
        for (const name of names) {
          if (ln.indexOf(name) !== -1) return name;
        }
      }
      return 'other';
    } catch (e) { return 'unknown'; }
  }

  if (typeof Game.villagerFightAllies === 'function') {
    orig.villagerFightAllies = Game.villagerFightAllies;
    Game.villagerFightAllies = function (vid) {
      const r = orig.villagerFightAllies.apply(this, arguments);
      try {
        t.senseCalls.push({ day: dayOf(Game), vid: vid, returned: Array.isArray(r) ? r.length : 0 });
      } catch (e) { errs.push('villagerFightAllies: ' + String(e.message).slice(0, 80)); }
      return r;
    };
  } else {
    errs.push('villagerFightAllies: not a function, skipped');
  }

  if (typeof Game.aidFight === 'function') {
    orig.aidFight = Game.aidFight;
    Game.aidFight = function (vid, mdef, m, opts) {
      const rec = orig.aidFight.apply(this, arguments);
      try {
        const mid = (m && m.id) || (mdef && mdef.id) || null;
        t.aidRows.push({
          day: dayOf(Game), vid: vid, id: mid, wave: m ? (m.wave || waveOf(Game, mid)) : waveOf(Game, mid),
          allies: opts ? (opts.allies || 0) : 0,
          allyVids: opts && Array.isArray(opts.allyVids) ? opts.allyVids.length : 0,
          outcome: rec ? rec.outcome : null,
        });
      } catch (e) { errs.push('aidFight: ' + String(e.message).slice(0, 80)); }
      return rec;
    };
  } else {
    errs.push('aidFight: not a function, skipped');
  }

  if (typeof Game.fieldFight === 'function') {
    orig.fieldFight = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      const rec = orig.fieldFight.apply(this, arguments);
      try {
        const mid = (m && m.id) || (mdef && mdef.id) || null;
        t.allyFieldRows.push({
          day: dayOf(Game), vid: vid, id: mid, wave: m ? (m.wave || waveOf(Game, mid)) : waveOf(Game, mid),
          outcome: rec ? rec.outcome : null,
          allies: opts ? (opts.allies || 0) : 0,
          allyVids: opts && Array.isArray(opts.allyVids) ? opts.allyVids.length : 0,
          caller: callerFromStack(),
        });
      } catch (e) { errs.push('fieldFight: ' + String(e.message).slice(0, 80)); }
      return rec;
    };
  } else {
    errs.push('fieldFight: not a function, skipped');
  }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.rank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.rank = null; }
    t.scaleDaily.push(snap);
    return snap;
  }

  function uninstall() {
    for (const name of Object.keys(orig)) Game[name] = orig[name];
  }

  return { t: t, uninstall: uninstall, snapshot: snapshot };
}

module.exports = { install: install };
