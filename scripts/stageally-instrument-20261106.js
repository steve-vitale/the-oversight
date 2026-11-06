// stageally-instrument-20261106.js — companion-staging + rally instrument
// (arm sim-stageally-a, run fleshout-loop-b-20261106T0615Z). Scripts only,
// zero src/js. Pure-read wrappers + daily snapshots + killer tracking; zero
// game-state writes, zero RNG draws. Wrappers never throw into game code: a
// recording failure is counted in instrumentErrors and the original call's
// result is returned untouched.
//
// This module REUSES the bankkiller instrument verbatim (require, not a
// copy — which itself reuses the killerdeath instrument) and adds exactly
// three things:
//   (1) fight-level TB rows: startCombat/tbEnd wraps record each turn-based
//       fight at entry (allies and party members in the fight, monster
//       wave) and at end (outcome, scholar death in that fight, scholar
//       and monster HP fractions). This REPLACES bankkiller's day-join TB
//       survival secondary, which overcounted deaths (see its metric
//       review: 26 deaths / 25 fights) — fight ends are now tracked at
//       fight level, never joined by day.
//   (2) party snapshot fields on every daily row: party size + ids,
//       staging-gate state (raw standing, unlocked wave), traveling-with
//       count — so the analyzer can verify the party actually formed and
//       traveled, since runDays does not return the policy ctx.
//   (3) a playerDeath chain-wrap marking scholar-death-in-fight on the
//       current TB row (the killerdeath playerDeath wrap still records the
//       scholarDeaths row; this only flags the fight).
// Usage: const INST = require('./stageally-instrument-20261106');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';
const BK = require('./bankkiller-instrument-20261105');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function install(Game) {
  const bk = BK.install(Game);
  const t = bk.t;
  t.tbFights = [];
  t._tbSeq = 0;
  t._currentTb = null;
  t._currentTbFight = null;
  t._lastTbFight = null;

  function waveOfFighter(o) {
    try {
      if (o && o.mdef && o.mdef.wave != null) return (o.mdef.wave | 0);
      if (o && o.monsterId) {
        const list = ((Game.data || {}).monsters || []);
        const m = list.find(function (x) { return x && x.id === o.monsterId; });
        if (m && m.wave != null) return (m.wave | 0);
      }
    } catch (e) {}
    return null;
  }

  // --- (1) startCombat wrap: fight-level entry row (chained on top of the
  // killerdeath wrap — uninstall restores the chained wrapper, then the
  // bankkiller uninstall restores the original).
  const origStart = Game.startCombat;
  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      const mid = arguments.length ? arguments[0] : null;
      let ret;
      try { ret = origStart.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        // STALE CURRENT ROW: a fight dissolved without tbEnd (mantle-death
        // path sets f.result='dissolved' directly) leaves _currentTb set
        // with no outcome. Close it from the fight object's own result
        // before starting the new row — never leave two fights current.
        if (t._currentTb && t._currentTbFight && t._currentTbFight.over) {
          t._currentTb.outcome = t._currentTbFight.result != null ? String(t._currentTbFight.result) : 'dissolved';
          t._currentTb = null;
          t._currentTbFight = null;
        }
        const f = Game.tbfight;
        // startCombat refuses re-entry ("Already in a fight"): the fight
        // object is unchanged — do not record a second row for it.
        if (f && !f.over && f !== t._lastTbFight) {
          t._lastTbFight = f;
          t._tbSeq += 1;
          let party = [];
          try { party = (typeof Game.partyMembers === 'function') ? (Game.partyMembers() || []) : []; } catch (e) { party = []; }
          const row = { seq: t._tbSeq, day: dayOf(Game), mid: mid || null, wave: null,
            alliesAtEntry: 0, partyAtEntry: 0, allyIds: [], partyIds: [],
            outcome: null, scholarDiedInFight: false, scholarHpFracEnd: null,
            monsterHpFracEnd: null, rounds: null };
          let maxWave = null;
          (f.fighters || []).forEach(function (o) {
            if (!o) return;
            if ((o.kind === 'monster' || o.kind === 'hostile')) {
              const w = waveOfFighter(o);
              if (w != null && (maxWave == null || w > maxWave)) maxWave = w;
            } else if ((o.kind === 'ally' || o.kind === 'villager') && o.key !== 'p') {
              if (!o.alive || o.fled) return;
              row.alliesAtEntry += 1;
              if (o.villagerId) row.allyIds.push(o.villagerId);
              if (o.villagerId && party.indexOf(o.villagerId) !== -1) {
                row.partyAtEntry += 1;
                row.partyIds.push(o.villagerId);
              }
            }
          });
          row.wave = maxWave;
          t.tbFights.push(row);
          t._currentTb = row;
          t._currentTbFight = f;
        }
      } catch (e) { t.instrumentErrors.push('startCombat-tbrow: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }

  // --- (1b) tbEnd wrap: fight-level outcome row.
  const origTbEnd = Game.tbEnd;
  if (typeof origTbEnd === 'function') {
    Game.tbEnd = function (result) {
      // tbEnd nulls Game.tbfight — capture the fight BEFORE the original
      // runs, and read the end state off the captured object (it survives
      // detachment; its fighters still carry end HP).
      const f0 = Game.tbfight;
      const row0 = t._currentTb;
      const isCurrent = !!(row0 && t._currentTbFight && f0 === t._currentTbFight);
      let ret;
      try { ret = origTbEnd.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (row0 && isCurrent) {
          row0.outcome = (result == null ? null : String(result));
          try { row0.rounds = (f0 && f0.round != null) ? f0.round : null; } catch (e2) {}
          try {
            const p = (f0 && f0.fighters ? f0.fighters : []).find(function (o) { return o && o.key === 'p'; });
            if (p) row0.scholarHpFracEnd = +(((p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1)).toFixed(3));
          } catch (e2) {}
          try {
            let hp = 0, max = 0;
            (f0.fighters || []).forEach(function (o) {
              if (o && (o.kind === 'monster' || o.kind === 'hostile')) { hp += Math.max(0, o.hp || 0); max += Math.max(0, o.maxHp || o.hp || 0); }
            });
            if (max > 0) row0.monsterHpFracEnd = +(hp / max).toFixed(3);
          } catch (e2) {}
          t._currentTb = null;
          t._currentTbFight = null;
        }
      } catch (e) { t.instrumentErrors.push('tbEnd-tbrow: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('tbEnd-missing'); }

  // --- (3) playerDeath chain-wrap: flag scholar-death-in-fight.
  const origPlayerDeath = Game.playerDeath;
  if (typeof origPlayerDeath === 'function') {
    Game.playerDeath = function () {
      let ret;
      try { ret = origPlayerDeath.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (t._currentTb && t._currentTbFight && Game.tbfight === t._currentTbFight) t._currentTb.scholarDiedInFight = true;
      } catch (e) { t.instrumentErrors.push('playerDeath-tbflag: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('playerDeath-missing'); }

  // --- (2) snapshot wrap: party + gate fields on every daily row.
  const origSnapshot = bk.snapshot;
  bk.snapshot = function () {
    const snap = origSnapshot();
    try {
      let party = [];
      try { party = (typeof Game.partyMembers === 'function') ? (Game.partyMembers() || []) : []; } catch (e) {}
      snap.partySize = party.length;
      snap.partyIds = party.slice();
      try { snap.travelingWith = (typeof Game.travelingWith === 'function') ? (Game.travelingWith() || []).length : null; } catch (e) { snap.travelingWith = null; }
      try { const st = Game.villageStanding ? Game.villageStanding() : null; snap.rawStanding = st ? (st.total | 0) : null; } catch (e) { snap.rawStanding = null; }
      try { snap.unlockedWaveSnap = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.unlockedWaveSnap = null; }
      try { snap.partyUnlockedSnap = (typeof Game.partyUnlocked === 'function') ? !!Game.partyUnlocked() : null; } catch (e) { snap.partyUnlockedSnap = null; }
    } catch (e) { t.instrumentErrors.push('snapshot-party: ' + String(e.message).slice(0, 80)); }
    return snap;
  };

  const origUninstall = bk.uninstall;
  bk.uninstall = function () {
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origTbEnd === 'function') Game.tbEnd = origTbEnd; } catch (e) {}
    try { if (typeof origPlayerDeath === 'function') Game.playerDeath = origPlayerDeath; } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };
  return bk;
}

module.exports = { install: install };
