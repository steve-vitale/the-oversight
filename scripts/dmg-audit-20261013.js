#!/usr/bin/env node
// scripts/dmg-audit-20261013.js — per-fight damage instrument (scale-wall r16
// arm B: wave-1/2 damage-number audit). Attaches to a live Game and records
// every player turn-based fight: monster, wave, armor, DPR dealt/taken per
// turn, rounds-to-kill vs rounds-to-die, declined/fled/fought, outcome.
//
// Method: wrap the engine's three fight choke points:
//   Game.startCombat(mid)  — open a fight record
//   Game.tbDamage(...)     — accumulate actual landed damage (the wrapper
//                            returns the REAL damage; the return value is
//                            faithfully passed through)
//   Game.tbEnd(result)     — close the record
// Round counting: wrap tbAfterPlayerAction (one player action = one round)
// and tbMonsterTurn (one monster action). firstBlood records who dealt the
// first damage (ambush/first-strike signal). The last 60 say() lines are
// kept for fights where the scholar went down — the sense-test transcript.
//
// Policy-side decline telemetry is NOT here (it lives in competent.js ctx:
// faDeclined/faSkipped/fledBad/fled) — the sweep driver reports it from ctx.
//
// TOOLING only. No game-code balance changes.
'use strict';

const SAY_KEEP = 60;

function monsterWave(Game, mid) {
  try {
    const d = (((Game.data || {}).monsters || []).find(m => m && m.id === mid)) || null;
    return (d && d.wave) || null;
  } catch (e) { return null; }
}

// mid from a live fight object (covers direct tbfight opens that bypass
// startCombat: encounters.js person-arenas, justice.js uprisings,
// party.js betrayal fights).
function midFromFight(f) {
  try {
    const fs = (f && f.fighters) || [];
    const m = fs.find(x => x && (x.kind === 'monster' || x.kind === 'hostile') && !x.fled);
    if (m) return m.monsterId || (m.mdef && m.mdef.id) || m.id || 'unknown';
    const other = fs.find(x => x && x.kind !== 'player' && x.kind !== 'villager');
    if (other) return other.monsterId || (other.mdef && other.mdef.id) || other.name || 'person-fight';
  } catch (e) {}
  return 'unknown';
}

function attachDmgAudit(Game) {
  const audit = {
    fights: [],        // closed fight records
    open: null,        // current open record
    sayBuf: [],        // rolling narration buffer (rebuilt per fight)
    declines: { mapSkipped: 0, fightDisengaged: 0 },
  };

  function openRecord(mid) {
    const s = (Game.state || {}).scholar || {};
    const f = Game.tbfight;
    const fighters = (f && f.fighters) || [];
    const mons = fighters.filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0);
    let armorP = 0;
    try { armorP = (typeof Game.armorBonus === 'function' ? Game.armorBonus() : 0) || 0; } catch (e) {}
    let day = 0;
    try { day = (s.day || 0); } catch (e) {}
    // encounter vector: was the fight forced by a world monster that walked
    // into the scholar (pendingMonsterId set / s.monster), or did the
    // scholar walk into it?
    let forced = false;
    try { forced = !!(Game.pendingMonsterId && Game.pendingMonsterId === mid); } catch (e) {}
    let atHaven = false;
    try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
    const rec = {
      mid, wave: monsterWave(Game, mid), veteran: !!((fighters[1] || {}).veteran),
      day, armorP: Math.round(armorP),
      forced, atHaven,
      phpStart: Math.round((s.hp != null ? s.hp : s.health) || 0),
      phpMax: 0, monHpStart: 0, monCount: mons.length,
      playerRounds: 0, monsterActs: 0,
      dmgDealt: 0, dmgTaken: 0, partyDealt: 0, partyTaken: 0,
      firstBlood: null,
      result: null, phpEnd: 0, playerDied: false,
      transcript: null,
    };
    try { rec.phpMax = Game.maxHealth ? Math.round(Game.maxHealth()) : 100; } catch (e) { rec.phpMax = 100; }
    for (const m of mons) { try { rec.monHpStart += Math.max(0, m.hp || 0); } catch (e2) {} }
    return rec;
  }

  function recordDamage(sourceKey, targetKey, dmg) {
    const rec = audit.open;
    if (!rec || dmg == null || !(dmg > 0)) return;
    const f = Game.tbfight;
    let sk = null, tk = null;
    try {
      const sf = f && Game.tbFighter ? Game.tbFighter(sourceKey) : null;
      const tf = f && Game.tbFighter ? Game.tbFighter(targetKey) : null;
      sk = sf && sf.kind; tk = tf && tf.kind;
    } catch (e) {}
    if (!rec.firstBlood) {
      if (sk === 'monster') rec.firstBlood = 'monster';
      else if (sk === 'player' || sk === 'villager') rec.firstBlood = 'player-side';
    }
    if (tk === 'monster' && sk === 'player') rec.dmgDealt += dmg;
    else if (tk === 'monster' && sk === 'villager') rec.partyDealt += dmg;
    else if (tk === 'player' && sk === 'monster') rec.dmgTaken += dmg;
    else if (tk === 'villager' && sk === 'monster') rec.partyTaken += dmg;
  }

  // Close a dangling record: the open fight ended WITHOUT tbEnd. The
  // barrier-push flee path (game.js tbBarrierExit) dissolves the fight
  // (over=true, result='dissolved', tbfight=null) instead of calling
  // tbEnd — without this, the record dangles and the next fight's open
  // mislabels it 'superseded'. A fight replaced while still live (direct
  // tbfight clobber) keeps the honest 'superseded' label.
  function closeIfAbandoned() {
    const rec = audit.open;
    if (!rec) return;
    const cur = Game.tbfight;
    const of = audit.openFight;
    if (cur && of && cur === of) return; // same live fight — nothing to do
    if (of && !of.over) closeRecord(rec, 'superseded');       // clobbered live
    else closeRecord(rec, (of && of.result) || 'dissolved');   // dissolved path
  }

  // Identity-tracked open: fights can open through startCombat OR through
  // direct tbfight assignment (encounters/justice/party arenas). The
  // per-action wrappers call closeIfAbandoned() then ensureOpen() so every
  // live fight gets a record keyed by the tbfight OBJECT — never
  // misattributed, never missed.
  function ensureOpen() {
    const f = Game.tbfight;
    if (!f || f.over) return;
    if (audit.open && audit.openFight === f) return;
    audit.open = openRecord(midFromFight(f));
    audit.openFight = f;
    audit.sayBuf = [];
  }

  // --- wrap say() for the transcript -------------------------------------
  const origSay = Game.say;
  if (typeof origSay === 'function' && !origSay._dmgWrapped) {
    const w = function () {
      try {
        const line = Array.prototype.map.call(arguments, a => String(a)).join(' ');
        audit.sayBuf.push(line);
        if (audit.sayBuf.length > SAY_KEEP) audit.sayBuf.shift();
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
    w._dmgWrapped = true;
    Game.say = w;
  }

  // --- wrap startCombat ----------------------------------------------------
  const origSC = Game.startCombat;
  if (typeof origSC === 'function' && !origSC._dmgWrapped) {
    const w = function (monsterId) {
      const mid = monsterId || this.pendingMonsterId || 'bulldozer';
      // NO SILENT CLOBBER (game.js): startCombat REFUSES when a fight is
      // live — it does not open a new fight. Only open a record when the
      // tbfight object is actually NEW afterwards. A dissolved (barrier-
      // push fled) fight dangles its record — close it first so it reads
      // 'dissolved', not 'superseded'.
      try { closeIfAbandoned(); } catch (e) {}
      const before = Game.tbfight;
      let r;
      try { r = origSC.apply(this, arguments); } catch (e) { throw e; }
      try {
        const f = Game.tbfight;
        if (f && !f.over && f !== before) {
          audit.open = openRecord(mid);
          audit.openFight = f;
          audit.sayBuf = [];
        }
      } catch (e) {}
      return r;
    };
    w._dmgWrapped = true;
    Game.startCombat = w;
  }

  // --- wrap tbDamage -------------------------------------------------------
  const origTD = Game.tbDamage;
  if (typeof origTD === 'function' && !origTD._dmgWrapped) {
    const w = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      let applied;
      try { closeIfAbandoned(); ensureOpen(); } catch (e) {}
      try { applied = origTD.apply(this, arguments); } catch (e) { throw e; }
      // AUDIT FIX 2026-10-14: player strikes pass sourceKey null + label 'you'
      try { recordDamage(sourceKey == null && sourceLabel === 'you' ? 'p' : sourceKey, targetKey, applied); } catch (e) {}
      return applied;
    };
    w._dmgWrapped = true;
    Game.tbDamage = w;
  }

  // --- wrap tbAfterPlayerAction (one player action = one round) ------------
  const origAPA = Game.tbAfterPlayerAction;
  if (typeof origAPA === 'function' && !origAPA._dmgWrapped) {
    const w = function () {
      let r;
      try { closeIfAbandoned(); ensureOpen(); } catch (e) {}
      try { r = origAPA.apply(this, arguments); } catch (e) { throw e; }
      try { if (audit.open) audit.open.playerRounds += 1; } catch (e) {}
      return r;
    };
    w._dmgWrapped = true;
    Game.tbAfterPlayerAction = w;
  }

  // --- wrap tbMonsterTurn (one monster action) ------------------------------
  const origMT = Game.tbMonsterTurn;
  if (typeof origMT === 'function' && !origMT._dmgWrapped) {
    const w = function (m) {
      let r;
      try { closeIfAbandoned(); ensureOpen(); } catch (e) {}
      try { r = origMT.apply(this, arguments); } catch (e) { throw e; }
      try { if (audit.open) audit.open.monsterActs += 1; } catch (e) {}
      return r;
    };
    w._dmgWrapped = true;
    Game.tbMonsterTurn = w;
  }

  // --- wrap tbEnd (close the record) ---------------------------------------
  function closeRecord(rec, result) {
    const s = (Game.state || {}).scholar || {};
    rec.result = result;
    const p = null;
    try {
      const f = Game.tbFighter ? Game.tbFighter('p') : null;
      const shp = Math.round((s.hp != null ? s.hp : s.health) || 0);
      rec.phpEnd = f ? Math.round(f.hp || 0) : shp;
      // playerDied: the fighter went down, OR the scholar's own HP is 0 at
      // close. The second clause catches real deaths: tbFighter('p') can be
      // null after a death-driven fight end (the 'lost' death flow runs
      // playerDeath before tbEnd), while cheat-death saves restore HP and
      // correctly read alive. Caveat: a pending phoenix-link hold reads as
      // a death here — the fire decides later.
      rec.playerDied = !!(f && ((f.hp || 0) <= 0 || f.alive === false)) || shp <= 0;
    } catch (e) {
      rec.phpEnd = Math.round((s.hp != null ? s.hp : s.health) || 0);
    }
    const rounds = Math.max(1, rec.playerRounds);
    rec.monsterDPR = +(rec.dmgTaken / rounds).toFixed(2);          // dealt per player-turn
    rec.playerDPR = +((rec.dmgDealt + rec.partyDealt) / rounds).toFixed(2);
    rec.roundsToKill = rec.playerDPR > 0 ? +(rec.monHpStart / rec.playerDPR).toFixed(1) : null;
    rec.roundsToDie = rec.monsterDPR > 0 ? +(rec.phpStart / rec.monsterDPR).toFixed(1) : null;
    // sense-test transcript: keep narration for fights that nearly or
    // actually killed the scholar
    if (rec.playerDied || (rec.phpEnd < rec.phpMax * 0.3)) {
      rec.transcript = audit.sayBuf.slice();
    }
    audit.fights.push(rec);
    if (audit.open === rec) { audit.open = null; audit.openFight = null; }
  }

  const origTE = Game.tbEnd;
  if (typeof origTE === 'function' && !origTE._dmgWrapped) {
    const w = function (result) {
      const rec = audit.open;
      // AUDIT FIX 2026-10-14: snapshot the bearer BEFORE tbEnd — a 'lost'
      // fight runs playerDeath inside tbEnd and restores a SUCCESSOR, so
      // reading HP afterwards recorded deaths as full-HP survivals.
      let pre = null;
      try {
        const f0 = this.tbFighter ? this.tbFighter('p') : null;
        const s0 = (this.state || {}).scholar || {};
        pre = { hp: f0 ? Math.round(f0.hp || 0) : Math.round((s0.hp != null ? s0.hp : s0.health) || 0), alive: f0 ? f0.alive !== false : true, vid: this.villagerId };
      } catch (e) {}
      let r;
      try { r = origTE.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (rec) {
          closeRecord(rec, result);
          if (pre) {
            rec.phpEnd = pre.hp;
            const succeeded = pre.vid != null && this.villagerId !== pre.vid;
            rec.playerDied = pre.hp <= 0 || !pre.alive || succeeded || !!this.over;
            rec.succession = succeeded;
          }
        }
      } catch (e) {}
      return r;
    };
    w._dmgWrapped = true;
    Game.tbEnd = w;
  }

  Game._dmgAudit = audit;
  return audit;
}

module.exports = { attachDmgAudit };
