// stayrecover-instrument-20261105.js — per-round turn-economy instrument
// (arm sim-stayrecover-a).
// Copy of the fleerepair instrument (2026-11-04) with ONE delta: the eat
// verb is wrapped as a player action (kind 'eat'), counted per exposure
// (ex.eatUses) and recorded with the usual pre/post snapshots, so the
// analyzer can read HP restored per eat. All other behavior is the
// fleerepair instrument verbatim, including the ROUND-1 PENDING BUFFER.
// RNG-neutral: the eat wrap adds no Math.random use and stays
// call-through. DIAG-ONLY, scripts only, zero src/js.
//
// Built on the tbleth instrument pattern (identity at fight START,
// RNG-neutral call-through wraps, exact kill linkage, UNRECORDED where
// the engine records nothing) and extended with turn economy:
//  - tbBeginTurn: opens a player-turn record (start snapshot).
//  - tbAdvance: closes the open player turn at entry while tbCurrent
//    is still the player — i.e. the post-action, pre-monster-turn
//    state. (Closing at the NEXT tbBeginTurn would fold monster-turn
//    damage/movement into the player's turn; closing here does not.)
//  - Player-action wraps (strike/move/wait/study/shout/offer/talk/
//    rally/warcry/flip/endTurn/barrierExit/eat/useAbility): appended to
//    the turn open at CALL time, even when the call itself advances
//    the fight (strike/wait auto-advance inside the original call).
//  - tbMonsterTurn / tbVillagerTurn brackets: per-NPC-turn class
//    (damage / telegraph / non-damage / ally-damage / ally-heal / ...)
//    from hits and position/telegraph deltas inside the bracket.
//  - tbDamage hits are stamped with turnSeq + actor + phase so the
//    analyzer attributes damage to the turn that produced it.
//  - tbEnd pre-call closes any open player turn (fight-end snapshot).
//
// All wraps are RNG-neutral (no Math.random use) and call-through;
// every catch reports into t.instrumentErrors, never silently.
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}

function gearOf(Game, vid) {
  const g = { vid: vid, armorP: 0, armed: false, weapon: null, vpFound: false, readError: null };
  try {
    const itemDefs = (Game.data && Game.data.items) || [];
    const carriesWeapon = function (items) {
      for (const e of (items || [])) {
        const iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
        if (!iid) continue;
        const def = itemDefs.find(function (d) { return d && d.id === iid; });
        if (def && def.weapon) return true;
      }
      return false;
    };
    if (vid === Game.villagerId) {
      try { g.armorP = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : 0; } catch (e) { g.armorP = 0; }
      try {
        const ew = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null;
        if (ew && !ew.unarmed) { g.armed = true; g.weapon = ew.name || ew.id || 'equipped'; }
      } catch (e) {}
      if (!g.armed) {
        try { g.armed = carriesWeapon((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []); } catch (e) {}
      }
      g.vpFound = true;
      return g;
    }
    let vp = null;
    try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; } catch (e) { vp = null; }
    try {
      const inData = (Game.data.villagers || []).some(function (x) { return x && x.id === vid; });
      const rc = ((Game.state || {}).village || {}).rosterChars || {};
      g.vpFound = !!(inData || Object.prototype.hasOwnProperty.call(rc, vid));
    } catch (e) {}
    if (!vp || typeof vp !== 'object') return g;
    try {
      const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
      const eq = S.equipment || null;
      if (eq && typeof eq.armorOf === 'function') g.armorP = eq.armorOf(vp, itemDefs) || 0;
    } catch (e) {}
    try {
      const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
      const eq = S.equipment || null;
      let w = null;
      if (eq) {
        if (typeof eq.meleeWeaponOf === 'function') w = eq.meleeWeaponOf(vp);
        if (!w && typeof eq.rangedWeaponOf === 'function') w = eq.rangedWeaponOf(vp);
      }
      if (w) { g.armed = true; g.weapon = (typeof w === 'string') ? w : (w.name || w.id || 'equipped'); }
    } catch (e) {}
    if (!g.armed) { try { g.armed = carriesWeapon(vp.items); } catch (e) {} }
  } catch (e) { g.readError = String(e.message).slice(0, 80); }
  return g;
}

function install(Game) {
  const t = {
    exposures: [], killRows: [], unlinkedKills: [], spawns: [],
    orphanTbEnds: [], instrumentErrors: [], notes: [],
    wrapCounts: {}, tbCalls: 0, fieldCallsW4: 0,
  };
  const orig = {};
  let seq = 0;
  let turnSeq = 0;
  let openTb = null;
  let openPlayerTurn = null; // turn record object (also in ex.turns)
  let npcBracket = null; // {kind,key,round,pre,hitsStart,sayMark}
  let abilityDepth = 0;
  // ROUND-1 PENDING BUFFER (sim-fleerepair-a): recorded while a
  // startCombat call is in flight, attached (or discarded) when it
  // returns. pendingDepth nests: only the outermost exit clears.
  // Residual gap, disclosed: round-1 NPC turns are not bracketed as
  // npcTurns (their hits still land in the ledger, turnSeq null).
  let pendingActive = false;
  let pendingDepth = 0;
  let pendingActions = [];
  let pendingHits = [];
  let pendingRound = null;
  let pendingFight = null;
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  function fighterSnap(fight) {
    const humans = [], monsters = [];
    try {
      for (const f of ((fight && fight.fighters) || [])) {
        if (!f) continue;
        if (f.kind === 'monster') {
          const mid = ((f.mdef || {}).id || f.monsterId || f.id) || null;
          monsters.push({ key: f.key || null, mid: mid, alive: !!f.alive, fled: !!f.fled,
            hp: (f.hp != null ? f.hp : null), maxHp: (f.maxHp != null ? f.maxHp : null) });
        } else if (f.key === 'p' || f.kind === 'villager' || f.kind === 'ally') {
          const vid = f.villagerId || (f.key === 'p' ? (Game.villagerId || null) : null);
          humans.push({ key: f.key || null, kind: f.kind || null, vid: vid,
            alive: (f.alive !== false), fled: !!f.fled,
            hp: (f.hp != null ? f.hp : null), maxHp: (f.maxHp != null ? f.maxHp : null) });
        }
      }
    } catch (e) { err('fighterSnap', e); }
    return { humans: humans, monsters: monsters };
  }

  function scholarStartState() {
    const s = { health: null, energy: null, food: 'UNRECORDED' };
    try { const sch = (Game.state || {}).scholar || {}; if (sch.health != null) s.health = sch.health; if (sch.energy != null) s.energy = sch.energy; } catch (e) {}
    return s;
  }

  function currentExposure() {
    if (!openTb) return null;
    return t.exposures.find(function (x) { return x.seq === openTb.seq; }) || null;
  }

  function classifyHit(ex, hit) {
    if (abilityDepth > 0) return 'ability-or-trick';
    if (hit.sourceKey === 'p' || hit.sourceKey === 'player' ||
        (hit.sourceKey == null && hit.sourceLabel === 'you')) return 'leader';
    if (hit.sourceKey) {
      try {
        const f = Game.tbfight || null;
        const src = (f && f.fighters || []).find(function (x) { return x && x.key === hit.sourceKey; });
        if (src && (src.kind === 'villager' || src.kind === 'ally')) return 'ally';
        if (src && src.kind === 'monster') return 'other';
      } catch (e) {}
    }
    return 'other';
  }

  function gridMax() {
    try { if (typeof Game.tbGridSize === 'function') return Game.tbGridSize() - 1; } catch (e) {}
    return 8;
  }
  function weaponInfo() {
    try {
      const w = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null;
      if (w) return { range: (w.range != null ? w.range : null), name: w.name || w.id || null, unarmed: !!w.unarmed };
    } catch (e) {}
    return { range: null, name: null, unarmed: null };
  }
  function distToMonster(p, m) {
    if (!p || !m) return null;
    try {
      if (typeof Game.fighterDistTo === 'function') {
        const d = Game.fighterDistTo(m, p.mx, p.my);
        if (d != null) return d;
      }
    } catch (e) {}
    if (p.mx == null || p.my == null || m.mx == null || m.my == null) return null;
    return Math.max(Math.abs(m.mx - p.mx), Math.abs(m.my - p.my));
  }
  function playerSnap() {
    try {
      const p = (typeof Game.tbFighter === 'function') ? Game.tbFighter('p') : null;
      if (!p) return null;
      return { mx: p.mx != null ? p.mx : null, my: p.my != null ? p.my : null,
        moveLeft: p.moveLeft != null ? p.moveLeft : null, acted: !!p.acted,
        hp: p.hp != null ? p.hp : null, maxHp: p.maxHp != null ? p.maxHp : null,
        stunned: p.stunned != null ? p.stunned : 0, stunFull: !!p.stunFull,
        blindTurns: p.blindTurns != null ? p.blindTurns : 0,
        speed: p.speed != null ? p.speed : null, alive: !!p.alive, fled: !!p.fled };
    } catch (e) { err('playerSnap', e); return null; }
  }
  function monstersSnap() {
    const out = [];
    try {
      const f = Game.tbfight || null;
      for (const m of ((f && f.fighters) || [])) {
        if (!m || m.kind !== 'monster') continue;
        out.push({ key: m.key || null, mid: ((m.mdef || {}).id || m.monsterId || m.id) || null,
          mx: m.mx != null ? m.mx : null, my: m.my != null ? m.my : null,
          hp: m.hp != null ? m.hp : null, maxHp: m.maxHp != null ? m.maxHp : null,
          alive: !!m.alive, fled: !!m.fled, telegraph: !!m.telegraph,
          telegraphCells: (m.telegraph && Array.isArray(m.telegraph.cells)) ? m.telegraph.cells.length : null });
      }
    } catch (e) { err('monstersSnap', e); }
    return out;
  }
  function turnStartSnap() {
    const p = playerSnap();
    const w = weaponInfo();
    const mons = monstersSnap();
    const dists = [];
    if (p) {
      for (const m of mons) {
        if (!m.alive || m.fled) continue;
        const d = distToMonster(p, m);
        dists.push({ key: m.key, mid: m.mid, dist: d, inRange: (d != null && w.range != null) ? d <= w.range : null });
      }
    }
    return { player: p, weapon: w, monsters: mons, dists: dists };
  }

  function openPlayerTurnFn(extra) {
    const ex = currentExposure();
    if (!ex) return null;
    if (openPlayerTurn) closePlayerTurnFn('begin-overlap');
    turnSeq++;
    const snap = turnStartSnap();
    const rec = { turnSeq: turnSeq, round: null, extra: !!extra,
      start: snap, actions: [], sayMark: ex.transcript.length,
      end: null, closeReason: null, sayLines: [] };
    try { rec.round = (Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null; } catch (e) {}
    ex.turns.push(rec);
    openPlayerTurn = rec;
    return rec;
  }
  function closePlayerTurnFn(reason) {
    if (!openPlayerTurn) return;
    const rec = openPlayerTurn;
    openPlayerTurn = null;
    try {
      const ex = currentExposure();
      const snap = turnStartSnap();
      rec.end = { player: snap.player, weapon: snap.weapon, monsters: snap.monsters, dists: snap.dists };
      rec.closeReason = reason;
      if (ex) {
        try { rec.sayLines = ex.transcript.slice(rec.sayMark).map(function (x) { return x.line; }); } catch (e) {}
      }
    } catch (e) { err('closePlayerTurn', e); }
  }

  // --- spawn (census reconciliation only) ---
  if (typeof Game.spawnWorldMonster === 'function') {
    orig.spawnWorldMonster = Game.spawnWorldMonster;
    Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
      count('spawnWorldMonster');
      const mon = orig.spawnWorldMonster.apply(this, arguments);
      try {
        const mid = mon ? mon.id : (typeof mdef === 'string' ? mdef : (mdef && mdef.id));
        if (mid && waveOf(Game, mid) === 4) t.spawns.push({ day: dayOf(Game), id: mid, tx: tx, ty: ty });
      } catch (e) { err('spawn', e); }
      return mon;
    };
  } else { err('install.spawnWorldMonster', new Error('not a function')); }

  // --- turn-based: identity at START ---
  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function (mid) {
      count('startCombat');
      let effId = null;
      try {
        let worldId = null, pendingId = null;
        try { const s = Game.state.scholar || {}; if (s.monster) worldId = s.monster.id || null; } catch (e) {}
        try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
        effId = mid || pendingId || worldId || null;
      } catch (e) { err('start.pre', e); }
      const isW4 = !!(effId && waveOf(Game, effId) === 4);
      if (isW4) t.tbCalls++;
      const beforeFight = Game.tbfight || null;
      if (pendingDepth === 0) {
        pendingActions = []; pendingHits = []; pendingRound = null; pendingFight = null;
      }
      pendingDepth++;
      pendingActive = true;
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) {
        pendingDepth--;
        if (pendingDepth === 0) { pendingActive = false; pendingActions = []; pendingHits = []; }
        throw e;
      }
      try {
        if (isW4) {
          const fight = Game.tbfight || null;
          if (fight && fight !== beforeFight) {
            if (openPlayerTurn) closePlayerTurnFn('superseded');
            if (openTb && !openTb.ended) {
              const prev = t.exposures.find(function (x) { return x.seq === openTb.seq; });
              if (prev) prev.superseded = true;
            }
            seq++;
            const snap = fighterSnap(fight);
            const scholarId = Game.villagerId || null;
            const humans = snap.humans.map(function (h) {
              return { key: h.key, kind: h.kind, vid: h.vid,
                hpStart: h.hp, maxHp: h.maxHp,
                gear: h.vid ? gearOf(Game, h.vid) : null };
            });
            const monsters = snap.monsters.map(function (m) {
              return { key: m.key, mid: m.mid, hpStart: m.hp, maxHp: m.maxHp,
                wave: (m.mid ? waveOf(Game, m.mid) : null), joinedMidFight: false };
            });
            let trickKnown = 'UNRECORDED';
            try { trickKnown = (typeof Game.monsterCounterKnown === 'function') ? !!Game.monsterCounterKnown(effId) : 'UNRECORDED'; } catch (e) { trickKnown = 'UNRECORDED'; }
            const newEx = {
              seq: seq, type: 'tb', day: dayOf(Game), mid: effId, wave: 4,
              fightId: fight.id || null, scholarAtStart: scholarId,
              leadVid: scholarId, partySizeStart: snap.humans.length,
              party: humans, monsters: monsters, leadGear: scholarId ? gearOf(Game, scholarId) : null,
              scholarStart: scholarStartState(), trickKnown: trickKnown,
              hits: [], transcript: [], transcriptOverflow: false,
              abilityUses: [], shoutUses: 0, offerFoodUses: 0,
              turns: [], npcTurns: [],
              end: null, kills: [], superseded: false,
            };
            t.exposures.push(newEx);
            // ROUND-1 ATTACH: actions recorded during this startCombat
            // call become the exposure's first turn (turnSeq 0). Only
            // when the pending fight IS this fight; otherwise discard
            // (stale buffer from a nested/other call). No actions ->
            // no turn (a fight with no round-1 player action gets none).
            if (pendingActions.length > 0 && pendingFight === fight) {
              const firstA = pendingActions[0];
              const lastA = pendingActions[pendingActions.length - 1];
              newEx.turns.unshift({ turnSeq: 0, round: pendingRound, extra: false,
                start: firstA.pre, actions: pendingActions.slice(),
                sayMark: 0,
                end: { player: lastA.post ? lastA.post.player : null,
                  weapon: lastA.post ? lastA.post.weapon : null,
                  monsters: lastA.post ? lastA.post.monsters : null,
                  dists: lastA.post ? lastA.post.dists : null },
                closeReason: 'round1-pending', sayLines: [] });
              for (const h of pendingHits) newEx.hits.push(h);
              // Consumed: a nested outer startCombat post-call must not
              // attach the same round-1 turn to a second exposure.
              pendingActions = []; pendingHits = [];
            }
            openTb = { seq: seq, fight: fight, ended: false };
          }
        }
      } catch (e) { err('start.post', e); }
      pendingDepth--;
      if (pendingDepth === 0) {
        pendingActive = false; pendingActions = []; pendingHits = [];
        pendingRound = null; pendingFight = null;
      }
      return r;
    };
  } else { err('install.startCombat', new Error('not a function')); }

  // --- player-turn open: tbBeginTurn (BEFORE the original runs) ---
  if (typeof Game.tbBeginTurn === 'function') {
    orig.tbBeginTurn = Game.tbBeginTurn;
    Game.tbBeginTurn = function () {
      count('tbBeginTurn');
      try {
        const f = Game.tbfight || null;
        if (f && openTb && f === openTb.fight && !openTb.ended) {
          let cur = null;
          try { cur = (typeof Game.tbCurrent === 'function') ? Game.tbCurrent() : null; } catch (e) {}
          if (cur && cur.kind === 'player') {
            const ex = currentExposure();
            const alreadyThisRound = ex ? ex.turns.some(function (tr) { return tr.round === f.round; }) : false;
            openPlayerTurnFn(alreadyThisRound);
          }
        }
      } catch (e) { err('tbBeginTurn.pre', e); }
      return orig.tbBeginTurn.apply(this, arguments);
    };
  } else { t.notes.push('tbBeginTurn not a function at install'); }

  // --- player-turn close: tbAdvance entry while it is still the player's turn ---
  if (typeof Game.tbAdvance === 'function') {
    orig.tbAdvance = Game.tbAdvance;
    Game.tbAdvance = function () {
      count('tbAdvance');
      try {
        const f = Game.tbfight || null;
        if (f && openTb && f === openTb.fight && !openTb.ended && openPlayerTurn) {
          let cur = null;
          try { cur = (typeof Game.tbCurrent === 'function') ? Game.tbCurrent() : null; } catch (e) {}
          if (cur && cur.kind === 'player') closePlayerTurnFn('advance');
        }
      } catch (e) { err('tbAdvance.pre', e); }
      return orig.tbAdvance.apply(this, arguments);
    };
  } else { t.notes.push('tbAdvance not a function at install'); }

  // --- turn-based end: PRE-call snapshot + close open player turn ---
  if (typeof Game.tbEnd === 'function') {
    orig.tbEnd = Game.tbEnd;
    Game.tbEnd = function (result) {
      count('tbEnd');
      let pre = null;
      try {
        const f = Game.tbfight || null;
        if (f && !f.over) {
          const snap = fighterSnap(f);
          const w4 = snap.monsters.some(function (m) { return m.mid && waveOf(Game, m.mid) === 4; });
          pre = { fight: f, result: result, snap: snap, hasW4: w4, round: f.round || null };
        }
      } catch (e) { err('tbEnd.pre', e); }
      if (pre && pre.hasW4 && openTb && openTb.fight === pre.fight && !openTb.ended && openPlayerTurn) {
        closePlayerTurnFn('fight-end');
      }
      let r;
      try { r = orig.tbEnd.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (pre && pre.hasW4) {
          if (openTb && openTb.fight === pre.fight && !openTb.ended) {
            const ex = t.exposures.find(function (x) { return x.seq === openTb.seq; });
            if (ex) {
              ex.end = {
                result: (pre.result === undefined || pre.result === null) ? 'unknown' : String(pre.result),
                day: dayOf(Game), round: pre.round,
                monsters: pre.snap.monsters, humans: pre.snap.humans,
                monsterDeadW4: pre.snap.monsters.filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4 && !m.alive; }).length,
                monsterTotalW4: pre.snap.monsters.filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4; }).length,
                humansDead: pre.snap.humans.filter(function (h) { return !h.alive; }).map(function (h) { return h.vid; }),
                humansFled: pre.snap.humans.filter(function (h) { return !!h.fled; }).map(function (h) { return h.vid; }),
                monstersFled: pre.snap.monsters.filter(function (m) { return !!m.fled; }).map(function (m) { return m.mid; }),
              };
            }
            openTb.ended = true; openTb = null;
          } else {
            t.orphanTbEnds.push({ day: dayOf(Game), result: String(pre.result), monsters: pre.snap.monsters });
          }
        }
      } catch (e) { err('tbEnd.post', e); }
      return r;
    };
  } else { err('install.tbEnd', new Error('not a function')); }

  // --- field fights: counted only, never exposures ---
  if (typeof Game.fieldFight === 'function') {
    orig.fieldFight = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      count('fieldFight');
      try {
        const mid = (typeof mdef === 'string') ? mdef : ((mdef && mdef.id) || (m && m.id) || null);
        if (mid && waveOf(Game, mid) >= 4) t.fieldCallsW4++;
      } catch (e) { err('field.pre', e); }
      return orig.fieldFight.apply(this, arguments);
    };
  } else { t.notes.push('fieldFight not a function at install'); }

  // --- damage: the ledger, stamped with turn + actor + phase ---
  if (typeof Game.tbDamage === 'function') {
    orig.tbDamage = Game.tbDamage;
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      count('tbDamage');
      const ex = currentExposure();
      const inPendingDmg = !ex && pendingActive && !!Game.tbfight && !Game.tbfight.over;
      let target = null, hpBefore = null, roundPre = null;
      try {
        if ((ex && Game.tbfight === openTb.fight) || inPendingDmg) {
          if (typeof Game.tbFighter === 'function') {
            target = Game.tbFighter(targetKey);
            if (target) hpBefore = target.hp;
            roundPre = Game.tbfight.round != null ? Game.tbfight.round : null;
          }
        }
      } catch (e) { err('tbDamage.pre', e); }
      let r;
      try { r = orig.tbDamage.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (ex && target && hpBefore != null) {
          const hpAfter = target.hp;
          const hit = {
            round: roundPre,
            targetKey: targetKey, targetKind: target.kind || null,
            targetVid: target.villagerId || null,
            targetMid: ((target.mdef || {}).id || target.monsterId || target.id) || null,
            sourceKey: (sourceKey == null ? null : sourceKey),
            sourceLabel: (sourceLabel == null ? null : String(sourceLabel)),
            requested: dmg, returned: r, hpBefore: hpBefore, hpAfter: hpAfter,
            hpDelta: (hpAfter != null ? hpAfter - hpBefore : null),
            turnSeq: openPlayerTurn ? openPlayerTurn.turnSeq : null,
            actorKey: npcBracket ? npcBracket.key : (openPlayerTurn ? 'p' : null),
            actorKind: npcBracket ? npcBracket.kind : (openPlayerTurn ? 'player' : null),
            phase: npcBracket ? 'npc-turn' : (openPlayerTurn ? 'player-turn' : 'between-turns'),
          };
          hit.sourceClass = classifyHit(ex, hit);
          if (hit.targetKind === 'monster' && hit.targetMid && waveOf(Game, hit.targetMid) === 4) {
            const known = ex.monsters.find(function (mm) { return mm.key === hit.targetKey; });
            if (!known) {
              ex.monsters.push({ key: hit.targetKey, mid: hit.targetMid, hpStart: hpBefore,
                maxHp: target.maxHp != null ? target.maxHp : null,
                wave: 4, joinedMidFight: true });
            }
          }
          ex.hits.push(hit);
        } else if (inPendingDmg && target && hpBefore != null) {
          // ROUND-1 hit: player-phase hits get turnSeq 0 (they belong
          // to the pending player turn); NPC-phase hits get null (they
          // reconcile the ledger but are not player-turn damage).
          const phit = {
            round: roundPre,
            targetKey: targetKey, targetKind: target.kind || null,
            targetVid: target.villagerId || null,
            targetMid: ((target.mdef || {}).id || target.monsterId || target.id) || null,
            sourceKey: (sourceKey == null ? null : sourceKey),
            sourceLabel: (sourceLabel == null ? null : String(sourceLabel)),
            requested: dmg, returned: r, hpBefore: hpBefore, hpAfter: target.hp,
            hpDelta: (target.hp != null ? target.hp - hpBefore : null),
            turnSeq: npcBracket ? null : 0,
            actorKey: npcBracket ? npcBracket.key : 'p',
            actorKind: npcBracket ? npcBracket.kind : 'player',
            phase: npcBracket ? 'npc-turn' : 'player-turn',
          };
          phit.sourceClass = classifyHit(null, phit);
          pendingHits.push(phit);
        }
      } catch (e) { err('tbDamage.post', e); }
      return r;
    };
  } else { err('install.tbDamage', new Error('not a function')); }

  // --- transcript capture (sense-testing + failure reasons) ---
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') { t.notes.push(fnName + ' not a function at install'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (line) {
      const ex = currentExposure();
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { throw e; }
      try {
        if (ex && Game.tbfight === openTb.fight) {
          if (ex.transcript.length < 400) ex.transcript.push({ kind: fnName, line: String(line) });
          else ex.transcriptOverflow = true;
        }
      } catch (e) { err(fnName + '.post', e); }
      return r;
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  // --- player-action wraps: attributed to the turn open at CALL time ---
  function wrapPlayerAction(fnName, kind) {
    if (typeof Game[fnName] !== 'function') { t.notes.push(fnName + ' not a function at install'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      count(fnName);
      const turnAtCall = openPlayerTurn;
      const inFight = !!(currentExposure() && Game.tbfight === openTb.fight);
      const inPending = !inFight && pendingActive && !!(Game.tbfight && !Game.tbfight.over);
      const pre = (inFight || inPending) ? turnStartSnap() : null;
      if (inPending) {
        if (!pendingFight) pendingFight = Game.tbfight;
        if (pendingRound == null) {
          try { pendingRound = Game.tbfight.round != null ? Game.tbfight.round : 1; } catch (e2) { pendingRound = 1; }
        }
      }
      const args = Array.prototype.slice.call(arguments).map(function (a) {
        try { return (a && typeof a === 'object') ? '[obj]' : String(a); } catch (e) { return '[?]'; }
      });
      let r, threw = null;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { threw = e; }
      try {
        if (inFight && turnAtCall) {
          const post = turnStartSnap();
          turnAtCall.actions.push({ fn: fnName, kind: kind, args: args,
            returned: (threw ? ('THREW:' + String(threw.message).slice(0, 60)) : (r === undefined ? null : r)),
            pre: pre, post: post });
        }
        if (inPending) {
          const post = turnStartSnap();
          pendingActions.push({ fn: fnName, kind: kind, args: args,
            returned: (threw ? ('THREW:' + String(threw.message).slice(0, 60)) : (r === undefined ? null : r)),
            pre: pre, post: post });
        }
        const ex = currentExposure();
        if (inFight && ex) {
          if (kind === 'shout') ex.shoutUses++;
          else if (kind === 'offerFood') ex.offerFoodUses++;
          else if (kind === 'eat') ex.eatUses = (ex.eatUses || 0) + 1;
          else if (kind === 'ability') ex.abilityUses.push({ fn: fnName, args: args.slice(0, 2), round: (Game.tbfight && Game.tbfight.round) || null });
        }
      } catch (e) { err(fnName + '.post', e); }
      if (threw) throw threw;
      return r;
    };
  }
  wrapPlayerAction('tbPlayerStrike', 'strike');
  wrapPlayerAction('tbPlayerMove', 'move');
  wrapPlayerAction('tbPlayerWait', 'wait');
  wrapPlayerAction('tbPlayerStudy', 'study');
  wrapPlayerAction('tbPlayerShout', 'shout');
  wrapPlayerAction('tbPlayerOfferFood', 'offerFood');
  wrapPlayerAction('tbPlayerTalk', 'talk');
  wrapPlayerAction('tbPlayerRally', 'rally');
  wrapPlayerAction('tbPlayerWarCry', 'warcry');
  wrapPlayerAction('tbPlayerFlip', 'flip');
  wrapPlayerAction('tbPlayerEndTurn', 'endTurn');
  wrapPlayerAction('tbBarrierExit', 'barrierExit');
  wrapPlayerAction('tbEatRations', 'eat');

  // --- useAbility (call-stack flag for hit classification + turn action) ---
  function wrapUse(fnName, kind) {
    if (typeof Game[fnName] !== 'function') { t.notes.push(fnName + ' not a function at install'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      count(fnName);
      const turnAtCall = openPlayerTurn;
      const inFight = !!(currentExposure() && Game.tbfight === openTb.fight);
      const inPending = !inFight && pendingActive && !!(Game.tbfight && !Game.tbfight.over);
      const pre = (inFight || inPending) ? turnStartSnap() : null;
      if (inPending) {
        if (!pendingFight) pendingFight = Game.tbfight;
        if (pendingRound == null) {
          try { pendingRound = Game.tbfight.round != null ? Game.tbfight.round : 1; } catch (e2) { pendingRound = 1; }
        }
      }
      abilityDepth++;
      let r, threw = null;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { threw = e; }
      abilityDepth--;
      try {
        if (inFight && turnAtCall) {
          turnAtCall.actions.push({ fn: fnName, kind: kind,
            args: Array.prototype.slice.call(arguments, 0, 2).map(String),
            returned: (threw ? ('THREW:' + String(threw.message).slice(0, 60)) : (r === undefined ? null : r)),
            pre: pre, post: turnStartSnap() });
        }
        if (inPending) {
          pendingActions.push({ fn: fnName, kind: kind,
            args: Array.prototype.slice.call(arguments, 0, 2).map(String),
            returned: (threw ? ('THREW:' + String(threw.message).slice(0, 60)) : (r === undefined ? null : r)),
            pre: pre, post: turnStartSnap() });
        }
        const ex = currentExposure();
        if (inFight && ex) ex.abilityUses.push({ fn: fnName, args: Array.prototype.slice.call(arguments, 0, 2).map(String), round: (Game.tbfight && Game.tbfight.round) || null });
      } catch (e) { err(fnName + '.post', e); }
      if (threw) throw threw;
      return r;
    };
  }
  wrapUse('useAbility', 'ability');

  // --- NPC turn brackets: monster + ally ---
  function wrapNpcTurn(fnName, kind) {
    if (typeof Game[fnName] !== 'function') { t.notes.push(fnName + ' not a function at install'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (actor) {
      count(fnName);
      const ex = currentExposure();
      const inFight = !!(ex && Game.tbfight === openTb.fight);
      const key = (actor && actor.key) || null;
      const pre = inFight ? { pos: { mx: actor.mx, my: actor.my }, hp: actor.hp, alive: !!actor.alive, fled: !!actor.fled,
        telegraph: !!actor.telegraph, telegraphCells: (actor.telegraph && Array.isArray(actor.telegraph.cells)) ? actor.telegraph.cells.length : null } : null;
      const hitsStart = inFight ? ex.hits.length : 0;
      const sayMark = inFight ? ex.transcript.length : 0;
      const round = inFight ? ((Game.tbfight && Game.tbfight.round) || null) : null;
      const prevBracket = npcBracket;
      if (inFight) npcBracket = { kind: kind, key: key, round: round };
      let r, threw = null;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { threw = e; }
      npcBracket = prevBracket;
      try {
        if (inFight && ex) {
          const post = { pos: { mx: actor.mx, my: actor.my }, hp: actor.hp, alive: !!actor.alive, fled: !!actor.fled,
            telegraph: !!actor.telegraph, telegraphCells: (actor.telegraph && Array.isArray(actor.telegraph.cells)) ? actor.telegraph.cells.length : null };
          const hits = ex.hits.slice(hitsStart);
          ex.npcTurns.push({ fn: fnName, kind: kind, key: key, mid: ((actor.mdef || {}).id || actor.monsterId || null),
            vid: actor.villagerId || null, round: round, pre: pre, post: post,
            hits: hits.map(function (h) { return { targetKey: h.targetKey, targetKind: h.targetKind, targetMid: h.targetMid,
              sourceClass: h.sourceClass, requested: h.requested, hpDelta: h.hpDelta, round: h.round }; }),
            sayLines: ex.transcript.slice(sayMark).map(function (x) { return x.line; }),
            threw: threw ? String(threw.message).slice(0, 60) : null });
        }
      } catch (e) { err(fnName + '.post', e); }
      if (threw) throw threw;
      return r;
    };
  }
  wrapNpcTurn('tbMonsterTurn', 'monster');
  wrapNpcTurn('tbVillagerTurn', 'ally');

  // --- kill choke points: exact linkage ---
  function wrapKill(fnName, pyrrhic) {
    if (typeof Game[fnName] !== 'function') { err('install.' + fnName, new Error('not a function')); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (monsterId, killerVid, via, detail) {
      count(fnName);
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { err(fnName, e); throw e; }
      try {
        const w = waveOf(Game, monsterId);
        if (w != null && w >= 4) {
          let linkSeq = null, linkHow = null;
          if (openTb && Game.tbfight === openTb.fight) { linkSeq = openTb.seq; linkHow = 'tb-open'; }
          const row = {
            day: dayOf(Game), fn: fnName, pyrrhic: !!pyrrhic, mid: monsterId, wave: w,
            by: (killerVid == null ? null : killerVid), via: via || 'unknown',
            scholarAtKill: Game.villagerId || null,
            linkSeq: linkSeq, linkHow: linkHow,
          };
          t.killRows.push(row);
          if (linkSeq != null) {
            const ex = t.exposures.find(function (x) { return x.seq === linkSeq; });
            if (ex) ex.kills.push(row);
            else t.unlinkedKills.push(row);
          } else {
            t.unlinkedKills.push(row);
          }
        }
      } catch (e) { err(fnName + '-row', e); }
      return r;
    };
  }
  wrapKill('recordWaveKill', false);
  wrapKill('recordPyrrhicKill', true);

  function uninstall() { Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} }); }
  return { t: t, uninstall: uninstall, gearOf: gearOf };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, gearOf: gearOf };
