// tbleth-instrument-20261103.js — turn-based lethality decomposition
// instrument (arm sim-tbleth-a, run fleshout-20261103T1945Z).
// DIAG-ONLY, scripts only, zero src/js. Decomposes WHY turn-based
// (TB) wave-4 fights lose, following the w4convert instrument
// pattern: identity captured at fight START, RNG-neutral
// call-through wraps, exact kill linkage, UNRECORDED where the
// engine records nothing — never guessed. Field fights are NOT
// exposures here (win-fielddmg territory); they are counted only
// in wrapCounts.
//
// Damage ledger: tbDamage is the single incoming-damage
// integration point (game.js: returns the ACTUAL damage applied).
// Each hit records round, sourceKey + sourceLabel verbatim,
// requested dmg, returned landed dmg, and target HP before/after;
// the ledger reconciles on hpDelta sums (damage that stuck),
// never on returned values, so redirects (intercept, static arc,
// leech) cannot double-count. Recursive inner tbDamage calls
// record as their own hits on their own targets.
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

// Gear read, mirroring waveCombatReadiness (standing.js): scholar via
// armorBonus/equippedWeapon + carried weapon items; other villagers
// via S.equipment.armorOf/meleeWeaponOf/rangedWeaponOf + carried
// weapon items. READ-ONLY: none of these write state. (Copied from
// the w4convert instrument, unchanged rule.)
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
  let openTb = null; // {seq, fight} — tbfight object identity, not id
  let abilityDepth = 0; // >0 while inside a useAbility/shout/offerFood call stack
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
    // Source classification, fixed by the prereg. Resolved at hit time
    // from the live fighter list; ability-or-trick = inside a
    // useAbility/shout/offerFood call stack.
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
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (isW4) {
          const fight = Game.tbfight || null;
          if (fight && fight !== beforeFight) {
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
            t.exposures.push({
              seq: seq, type: 'tb', day: dayOf(Game), mid: effId, wave: 4,
              fightId: fight.id || null, scholarAtStart: scholarId,
              leadVid: scholarId, partySizeStart: snap.humans.length,
              party: humans, monsters: monsters, leadGear: scholarId ? gearOf(Game, scholarId) : null,
              scholarStart: scholarStartState(), trickKnown: trickKnown,
              hits: [], transcript: [], transcriptOverflow: false,
              abilityUses: [], shoutUses: 0, offerFoodUses: 0,
              end: null, kills: [], superseded: false,
            });
            openTb = { seq: seq, fight: fight, ended: false };
          }
        }
      } catch (e) { err('start.post', e); }
      return r;
    };
  } else { err('install.startCombat', new Error('not a function')); }

  // --- turn-based end: PRE-call snapshot (fighters still present) ---
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

  // --- field fights: counted only, never exposures (fielddmg territory) ---
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

  // --- damage: the ledger ---
  if (typeof Game.tbDamage === 'function') {
    orig.tbDamage = Game.tbDamage;
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey, opts) {
      count('tbDamage');
      const ex = currentExposure();
      let target = null, hpBefore = null, roundPre = null;
      try {
        if (ex && Game.tbfight === openTb.fight && typeof Game.tbFighter === 'function') {
          target = Game.tbFighter(targetKey);
          if (target) hpBefore = target.hp;
          roundPre = Game.tbfight.round != null ? Game.tbfight.round : null;
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
          };
          hit.sourceClass = classifyHit(ex, hit);
          // Mid-fight joiner bookkeeping: a monster fighter not in the
          // start list gets a join-HP start, flagged, so its ledger
          // does not open a false gap.
          if (hit.targetKind === 'monster' && hit.targetMid && waveOf(Game, hit.targetMid) === 4) {
            const known = ex.monsters.find(function (mm) { return mm.key === hit.targetKey; });
            if (!known) {
              ex.monsters.push({ key: hit.targetKey, mid: hit.targetMid, hpStart: hpBefore,
                maxHp: target.maxHp != null ? target.maxHp : null,
                wave: 4, joinedMidFight: true });
            }
          }
          ex.hits.push(hit);
        }
      } catch (e) { err('tbDamage.post', e); }
      return r;
    };
  } else { err('install.tbDamage', new Error('not a function')); }

  // --- transcript capture (sense-testing) ---
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

  // --- trick / ability use counts (call-stack flag for classification) ---
  function wrapUse(fnName, kind) {
    if (typeof Game[fnName] !== 'function') { t.notes.push(fnName + ' not a function at install'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      count(fnName);
      const ex = currentExposure();
      const inFight = !!(ex && Game.tbfight === openTb.fight);
      abilityDepth++;
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { abilityDepth--; throw e; }
      abilityDepth--;
      try {
        if (inFight && ex) {
          if (kind === 'ability') ex.abilityUses.push({ fn: fnName, args: Array.prototype.slice.call(arguments, 0, 2).map(String), round: (Game.tbfight && Game.tbfight.round) || null });
          else if (kind === 'shout') ex.shoutUses++;
          else if (kind === 'offerFood') ex.offerFoodUses++;
        }
      } catch (e) { err(fnName + '.post', e); }
      return r;
    };
  }
  wrapUse('useAbility', 'ability');
  wrapUse('tbPlayerShout', 'shout');
  wrapUse('tbPlayerOfferFood', 'offerFood');

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
