// bloodcluster-b-instrument-20261124.js — bloodings-cluster decomposition
// instrument (arm sim-bloodcluster-b). Scripts only, zero src/js.
// Reuses the standing-gearready instrument VERBATIM as the base
// (daily snapshots, killEvents, deathEvents, standing lines) and ADDS
// two call-through, RNG-neutral wraps:
//   - fieldFight(vid, mdef, m, opts): one scalar row per fight, ALL
//     waves — outcome, rounds, damage both ways, party actually
//     standing (allyVid/ally2Vid/ally3Vid), join path (allyFromStart
//     vs hopeless-shout via calledHelp), intent. rec.log[] is NOT
//     stored (volume); only scalars.
//   - startCombat(monsterId, ...): one row per TB fight entry —
//     monster wave, entry party from Game.tbfight.fighters (scholar
//     + villager joiners), read AFTER the original returns.
// The base instrument already wraps recordWaveKill /
// recordPyrrhicKill (killEvents, deduped-log cross-check), so kills
// are never double-wrapped here. All wraps are call-through; every
// catch reports into t.instrumentErrors, never silently.
// Usage: const INST = require('./bloodcluster-b-instrument-20261124');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

const BASE = require('./standing-gearready-b-instrument-20261124');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}

function install(Game) {
  const base = BASE.install(Game);
  const t = base.t;
  t.fieldFights = [];
  t.tbStarts = [];
  // Settle-time TB context: one row per recordWaveKill /
  // recordPyrrhicKill call, captured while the live tbfight is
  // still the fight that produced the kill (tbEnd calls
  // recordWaveKill BEFORE clearing tbfight). This is the ONLY
  // reliable TB linkage: startCombat is not the only TB entry
  // (direct tbfight builders exist), startCombat REFUSES while a
  // fight is live (stale tbfight — see tbStarts 'rebuilt'), and
  // the scholar's villager id changes on succession, so an
  // end-of-run scholar id cannot identify the killer's fight.
  // Field kills (via wild/agency/...) carry a tbCtx only when a
  // TB fight happens to be live; the analyzer uses tbCtx ONLY for
  // via player/companion kills.
  t.tbKillCtx = [];
  let tbCtxSeq = 0;
  const orig = {};
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  // --- field fights: every call, all waves (analyzer filters wave>=4) ---
  if (typeof Game.fieldFight === 'function') {
    orig.fieldFight = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      opts = opts || {};
      let rec;
      try { rec = orig.fieldFight.apply(this, arguments); } catch (e) { throw e; }
      try {
        const mid = (mdef && mdef.id) || (m && m.id) || null;
        const alliesJoined = [rec.allyVid, rec.ally2Vid, rec.ally3Vid].filter(function (x) { return x != null; });
        t.fieldFights.push({
          day: dayOf(Game), vid: (vid == null ? null : vid), mid: mid,
          wave: (mdef && mdef.wave) || waveOf(Game, mid),
          outcome: rec.outcome || null, rounds: rec.rounds | 0,
          vTaken: rec.vTaken | 0, mDealt: rec.mDealt | 0,
          allyDealt: (rec.allyDealt | 0) + (rec.ally2Dealt | 0) + (rec.ally3Dealt | 0),
          partySizeRec: rec.partySize | 0,
          // Honest party at the kill: leader + allies who actually
          // joined (rec.partySize counts opts.allies at entry, even
          // when nobody ever joined — it overstates solo fights).
          partySize: 1 + alliesJoined.length,
          alliesAvailable: opts.allies | 0,
          allyFromStart: !!opts.allyFromStart,
          allyVidsAtEntry: Array.isArray(opts.allyVids) ? opts.allyVids.slice() : [],
          allyVid: rec.allyVid || null, ally2Vid: rec.ally2Vid || null, ally3Vid: rec.ally3Vid || null,
          allyJoined: alliesJoined.slice(),
          calledHelp: !!rec.calledHelp,
          intent: rec.intent || null, intentWhy: rec.intentWhy || null,
          vHpLeft: rec.vHpLeft | 0, mHpLeft: rec.mHpLeft | 0,
          packCount: rec.packCount | 0,
          everWinning: !!rec.everWinning, everHopeless: !!rec.everHopeless,
          minHpFrac: (rec.minHpFrac == null ? null : rec.minHpFrac),
          fleeHopeless: rec.fleeHopeless, fleeHpFrac: rec.fleeHpFrac,
        });
      } catch (e) { err('fieldFight-row', e); }
      return rec;
    };
  } else { err('install.fieldFight', new Error('not a function')); }

  // --- TB fights: entry party only (startCombat builds the fight
  // synchronously and stores it in Game.tbfight; the fight then
  // resolves over later policy steps). A call made while a fight
  // is live is REFUSED (startCombat returns early, "Already in a
  // fight") — the tbfight it leaves behind is STALE, so the row is
  // flagged rebuilt=false by comparing tbfight.id before/after and
  // must NOT count as a contact. scholarId is the scholar AT ENTRY
  // (succession changes it constantly — 13 distinct scholar ids on
  // seed 109310 alone — so an end-of-run id cannot identify a
  // killer's fight). ---
  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function (monsterId) {
      const beforeId = (Game.tbfight && Game.tbfight.id) || null;
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { throw e; }
      try {
        const mid = monsterId || Game.pendingMonsterId || null;
        const tf = Game.tbfight || null;
        const afterId = (tf && tf.id) || null;
        const fighters = (tf && Array.isArray(tf.fighters)) ? tf.fighters : [];
        const villagers = fighters.filter(function (f) { return f && (f.kind === 'villager' || f.kind === 'ally') && f.villagerId; })
          .map(function (f) { return f.villagerId; });
        t.tbStarts.push({
          day: dayOf(Game), mid: mid, wave: waveOf(Game, mid),
          fightId: afterId, rebuilt: afterId !== beforeId,
          scholarId: Game.villagerId || null,
          partySize: 1 + villagers.length,
          scholarPresent: fighters.some(function (f) { return f && f.kind === 'player'; }),
          villagerJoiners: villagers,
          fighterKinds: fighters.map(function (f) { return (f && f.kind) || null; }),
          monsterCount: fighters.filter(function (f) { return f && f.kind === 'monster'; }).length,
        });
      } catch (e) { err('startCombat-row', e); }
      return r;
    };
  } else { err('install.startCombat', new Error('not a function')); }

  // --- settle-time TB context on every kill call (see above) ---
  function wrapKillCtx(fnName) {
    if (typeof Game[fnName] !== 'function') { err('install.' + fnName, new Error('not a function')); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (monsterId, killerVid, via, detail) {
      try {
        const tf = Game.tbfight || null;
        const fighters = (tf && Array.isArray(tf.fighters)) ? tf.fighters : [];
        const vFighters = fighters.filter(function (f) { return f && (f.kind === 'villager' || f.kind === 'ally' || f.kind === 'player') && (f.villagerId || f.kind === 'player'); });
        t.tbKillCtx.push({
          seq: tbCtxSeq++, day: dayOf(Game), fn: fnName,
          mid: monsterId || null, wave: waveOf(Game, monsterId),
          by: (killerVid == null ? null : killerVid), via: via || 'unknown',
          inTbFight: !!tf, fightId: (tf && tf.id) || null,
          tbOver: tf ? !!tf.over : null,
          tbResult: (tf && tf.result) || null,
          partySize: tf ? vFighters.length : null,
          scholarPresent: fighters.some(function (f) { return f && f.kind === 'player'; }),
          villagerFighters: vFighters.filter(function (f) { return f.kind !== 'player'; }).map(function (f) { return f.villagerId; }),
          monsterIds: fighters.filter(function (f) { return f && f.kind === 'monster' && f.mdef; }).map(function (f) { return f.mdef.id; }),
        });
      } catch (e) { err(fnName + '-ctx', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapKillCtx('recordWaveKill');
  wrapKillCtx('recordPyrrhicKill');

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshot: base.snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf };
