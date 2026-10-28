// wave4demand-diag — wave-4 fight-demand recorder (sim-wave4demand-a,
// 2026-10-28, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, policy-side recorder only).
//
// QUESTION (from sim-w4convert-a, same band): villages meet wave 4
// and kill nothing. This arm measures the DEMAND side: was any
// wave-4 fight the demanded undertaking — a party, fully geared —
// or was it solo / under-equipped play? Per wave-4 fight, at fight
// start: participants (count + identities), solo vs party, each
// participant's armed state, armored state (P >= 10), veteran
// (wave-3+ kill) presence, village tricks held, and the outcome.
//
// MECHANISM, READ FROM CODE (never invented):
//   - Field fights route through Game.fieldFight (vid, mdef, m,
//     opts) — the choke point w4damage-diag already wraps. opts
//     carries allies (count), allyVids (named participants),
//     cornered, allyFromStart. Raid context lives only at the
//     resolve/havenRaidTick level (resolve does NOT forward
//     opts.raid to fieldFight, per the defwound-diag mechanism
//     note) — hence this recorder wraps havenRaidTick with a
//     depth counter: a fieldFight inside the tick window is
//     channel 'raid', otherwise 'field'. Expedition-leg fights
//     (worldMonster false, expedition stack) are channel 'other'.
//   - TB fights start at Game.startCombat (game.js): fighters =
//     'p' (the scholar, current villagerId) + up to 4 roster
//     villagers within 4 squares (tbHumanFighter: key 'v_'+vid,
//     villagerId on the fighter). This recorder snapshots
//     tbfight.fighters AFTER startCombat returns (the fight is
//     set up, not yet fought) and joins the tbEnd by monster id
//     (oldest pending start whose mid matches the end's monster
//     fighter id). Refused calls (a fight already live at entry)
//     push nothing; direct-build fights (tbEnd with no matching
//     start, per nonworldkill-diag) are UNMATCHED, never forced
//     onto a pending start.
//   - Gear reads MIRROR Game.waveCombatReadiness(4)
//     (src/js/standing.js) exactly: scholar via armorBonus() +
//     equippedWeapon() non-unarmed or a weapon item carried in
//     scholar inventory; villager via S.equipment.armorOf /
//     meleeWeaponOf / rangedWeaponOf or a weapon item carried
//     in vp.items (def.weapon on Game.data.items). Veterans read
//     state.waveKillLog (by == vid, w >= 3). Tricks read the
//     monsterCounterKnown convention over state.monsterCounters
//     (a VILLAGE count by construction — no per-fighter tricks
//     value exists in state; the prereg's proxy, labeled).
//   - World-origin reads NEVER call playerMonster() (it can
//     adopt a detached scholar.monster alias and mutate state
//     on a refused call, per nonworldkill-diag): the origin is
//     the world monster on the player tile from
//     Game.worldMonsters() by (map.px, map.py).
//
// OBSERVATIONAL ONLY. W4DEMAND=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx
// surface, no record. Wraps record AFTER delegating (fieldFight
// pre-reads are pure state reads taken before the call, never
// writes), write nothing to game state, draw no RNG, never
// throw into the engine (recording errors are counted, and a
// startCombat throw from the engine itself is recorded and
// RETHROWN unchanged), and return the original value untouched.
// Installed FIRST at sweep setup (before the w4convert stack)
// so nonworldkill's startCombat wrap stays outermost and its
// stack-based door classification sees the true caller, and so
// w4damage's fieldFight caller classification sees the true
// caller. Install is idempotent via _wave4demandDiagInstalled.
'use strict';

const MAX_EVENTS = 60000;

function layerOn() { try { return process.env.W4DEMAND === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    fights: [], starts: [], tbEnds: [], raidTicks: [],
    errs: 0, errors: [], overflow: {},
    installed: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function seqOf(m) {
  try { return (m && m._spawnSeq != null) ? m._spawnSeq : null; } catch (e) { return null; }
}
function waveOf(Game, m) {
  try {
    if (m && m.id && typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m) | 0;
      if (w) return w;
    }
  } catch (e) { /* fall through */ }
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}

// Caller classification from the Error stack at wrap entry.
// Same classifier as w4damage-diag (order matters: aid before
// resolve; sortie/patrol call fieldFight directly).
function classifyCaller() {
  let stack = '';
  try { stack = (new Error()).stack || ''; } catch (e) { stack = ''; }
  const names = [];
  try {
    for (const line of stack.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m && names.indexOf(m[1]) < 0) names.push(m[1]);
    }
  } catch (e) { /* names best-effort */ }
  let cls = 'other';
  if (names.indexOf('lingererSortie') >= 0) cls = 'sortie';
  else if (names.indexOf('resolvePatrol') >= 0) cls = 'patrol';
  else if (names.indexOf('aidFight') >= 0) cls = 'aid';
  else if (names.indexOf('resolveWildMonsterEncounter') >= 0) cls = 'resolve';
  return { cls: cls, stack: names.slice(0, 20).join(','), full: stack, expedition: /expedition/i.test(stack) };
}

function resolveEquipment() {
  try {
    const gt = (typeof globalThis !== 'undefined') ? globalThis : {};
    if (gt.Scattering && gt.Scattering.equipment && gt.Scattering.equipment.armorOf) return gt.Scattering.equipment;
    if (gt.S && gt.S.equipment && gt.S.equipment.armorOf) return gt.S.equipment;
    if (gt.Scattering && gt.Scattering.S && gt.Scattering.S.equipment && gt.Scattering.S.equipment.armorOf) return gt.Scattering.S.equipment;
  } catch (e) { /* fall through */ }
  return null;
}

// Gear for one participant, mirroring waveCombatReadiness(4)
// exactly. Returns { vid, isScholar, armed, armorP } with nulls
// (never invented numbers) when the read is unavailable.
function gearOfVid(Game, vid) {
  const out = { vid: vid != null ? String(vid) : null, isScholar: null, armed: null, armorP: null, veteranW3: null };
  try {
    const scholarId = Game.villagerId;
    const isScholar = (vid === scholarId || vid === 'player');
    out.isScholar = isScholar;
    const itemDefs = (Game.data && Game.data.items) || [];
    const carriesWeapon = (items) => {
      for (const e of (items || [])) {
        const iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
        if (!iid) continue;
        const def = itemDefs.find(d => d && d.id === iid);
        if (def && def.weapon) return true;
      }
      return false;
    };
    if (isScholar) {
      try { out.armorP = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : null; } catch (e) { out.armorP = null; }
      let wp = false, wpKnown = false;
      try { const ew = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null; wp = !!(ew && !ew.unarmed); wpKnown = true; } catch (e) { wpKnown = false; }
      if (!wp) { try { wp = carriesWeapon((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []); wpKnown = true; } catch (e) { /* keep */ } }
      out.armed = wpKnown ? wp : null;
    } else {
      const eq = resolveEquipment();
      let vp = null;
      try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; } catch (e) { vp = null; }
      if (!vp || !eq) { out.armed = null; out.armorP = null; }
      else {
        try { out.armorP = (eq.armorOf(vp, itemDefs) || 0) | 0; } catch (e) { out.armorP = null; }
        let wp = false;
        try { wp = !!((typeof eq.meleeWeaponOf === 'function' && eq.meleeWeaponOf(vp)) || (typeof eq.rangedWeaponOf === 'function' && eq.rangedWeaponOf(vp))); } catch (e) { wp = false; }
        if (!wp) { try { wp = carriesWeapon(vp.items); } catch (e) { wp = false; } }
        out.armed = wp;
      }
    }
    // Veteran: a wave-3+ kill by this vid in state.waveKillLog.
    // The scholar's log vid is the villagerId (or 'player' for
    // TB kills); match both spellings for a scholar participant.
    try {
      const log = (Game.state && Game.state.waveKillLog) || [];
      const keys = isScholar ? [vid, scholarId, 'player'] : [vid];
      out.veteranW3 = log.some(e => e && keys.indexOf(e.by) >= 0 && ((e.w | 0) >= 3));
    } catch (e) { out.veteranW3 = null; }
  } catch (e) { /* nulls stand; caller counts the error */ }
  return out;
}

// Village-level tricks + readiness readout at fight start.
// tricksKnown mirrors the gate's TRICKS bar (monsterCounterKnown
// over state.monsterCounters); readiness is the gate's own
// function, called read-only.
function villageReadout(Game) {
  const out = { tricksKnown: null, readiness: null };
  try {
    const mc = (Game.state && Game.state.monsterCounters) || {};
    let n = 0, ok = true;
    for (const mid of Object.keys(mc)) {
      try { if (typeof Game.monsterCounterKnown === 'function' && Game.monsterCounterKnown(mid)) n++; } catch (e) { ok = false; }
    }
    out.tricksKnown = ok ? n : null;
  } catch (e) { out.tricksKnown = null; }
  try {
    if (typeof Game.waveCombatReadiness === 'function') {
      const r = Game.waveCombatReadiness(4);
      out.readiness = r ? { armored: r.armored | 0, armed: r.armed | 0, tricks: r.tricks | 0, veterans: r.veterans | 0, ready: !!r.ready, short: (r.short || []).slice() } : null;
    }
  } catch (e) { out.readiness = null; }
  return out;
}

function monsterCounterKnown(Game, mid) {
  try { return (typeof Game.monsterCounterKnown === 'function' && mid) ? !!Game.monsterCounterKnown(mid) : null; } catch (e) { return null; }
}

function installWave4demandDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._wave4demandDiagStore === store && Game._wave4demandDiagInstalled) return Game._wave4demandDiagUninstall || function () {};
  const uninstalls = [];
  let raidDepth = 0;
  const pendingStarts = []; // { startIdx, mid } in start order
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // (a) fieldFight: pre-read demand state, post-record outcome.
  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    const caller = classifyCaller();
    const inRaid = raidDepth > 0;
    let pre = null;
    try {
      const live = m || null;
      const defObj = mdef || null;
      const seq = seqOf(live) != null ? seqOf(live) : seqOf(defObj);
      const mid = (live && live.id) || (defObj && defObj.id) || null;
      const wave = waveOf(Game, live || defObj);
      const allyVids = (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.slice() : [];
      const named = [];
      const seen = new Set();
      const pushVid = (v) => {
        if (v == null) return;
        const k = String(v);
        if (seen.has(k)) return;
        seen.add(k); named.push(v);
      };
      pushVid(vid);
      for (const a of allyVids) pushVid(a);
      const parts = named.map(v => gearOfVid(Game, v));
      const vr = villageReadout(Game);
      pre = {
        day: dayOf(Game),
        vid: vid != null ? String(vid) : null,
        seq: seq, mid: mid, wave: wave,
        caller: caller.cls, stack: caller.stack,
        worldMonster: !!m, expeditionStack: !!caller.expedition,
        channel: (!m && caller.expedition) ? 'other' : (inRaid ? 'raid' : 'field'),
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : ((defObj && defObj.hp != null) ? roundHp(defObj.hp) : null),
        mHpMax: (live && live.maxHp != null) ? roundHp(live.maxHp) : ((defObj && defObj.maxHp != null) ? roundHp(defObj.maxHp) : null),
        engineAllies: (opts && opts.allies != null) ? (opts.allies | 0) : null,
        allyVids: allyVids.map(a => (a != null ? String(a) : null)),
        cornered: !!(opts && opts.cornered),
        allyFromStart: !!(opts && opts.allyFromStart),
        participants: parts,
        tricksKnown: vr.tricksKnown,
        monsterCounterKnown: monsterCounterKnown(Game, mid),
        readiness: vr.readiness,
      };
    } catch (e) { noteErr(store, 'fieldFight.pre', e); }
    const rec = orig.apply(this, arguments);
    try {
      if (pre) {
        pre.outcome = rec ? (rec.outcome || null) : null;
        pre.rounds = rec ? (rec.rounds | 0) : null;
        pre.mDealt = rec ? (rec.mDealt | 0) : null;
        pre.mHpLeft = rec ? roundHp(rec.mHpLeft) : null;
        pre.corneredHold = !!(rec && rec.corneredHold);
        pre.calledHelp = !!(rec && rec.calledHelp);
        pre.joinedAllyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pushCapped(store, 'fights', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  // (c) havenRaidTick: per-object pre/post + in-window fights.
  wrap('havenRaidTick', (orig) => function () {
    let preList = null, ffStart = store.fights.length, day = dayOf(Game);
    try {
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      preList = list.map(m => ({
        obj: m, seq: seqOf(m), type: m.id || null, wave: waveOf(Game, m),
        hp: roundHp(m.hp), maxHp: roundHp(m.maxHp), tx: m.tx, ty: m.ty,
      }));
    } catch (e) { noteErr(store, 'raid.pre', e); }
    raidDepth++;
    let r = null;
    try { r = orig.apply(this, arguments); }
    finally { raidDepth--; }
    try {
      day = dayOf(Game);
      const ffEnd = store.fights.length;
      const changes = [];
      for (const p of (preList || [])) {
        let postHp = null, present = false;
        try { if (p.obj) { present = true; postHp = roundHp(p.obj.hp); } } catch (e) { present = false; }
        if (present && postHp !== p.hp) {
          changes.push({ seq: p.seq, type: p.type, wave: p.wave, preHp: p.hp, maxHp: p.maxHp, postHp: postHp, delta: (postHp != null && p.hp != null) ? (postHp - p.hp) : null });
        }
      }
      const inWindow = store.fights.slice(ffStart, ffEnd);
      pushCapped(store, 'raidTicks', {
        day: day, ffWindowStart: ffStart, ffWindowEnd: ffEnd,
        ffInWindow: inWindow.map(f => ({ seq: f.seq, mid: f.mid, caller: f.caller, channel: f.channel, outcome: f.outcome, mDealt: f.mDealt })),
        changes: changes,
      });
    } catch (e) { noteErr(store, 'raid.rec', e); }
    return r;
  });

  // (b) startCombat / tbEnd: TB demand snapshot + outcome join.
  wrap('startCombat', (orig) => function (monsterId, options) {
    const day = dayOf(Game);
    let liveAtEntry = false;
    try { liveAtEntry = !!(Game.tbfight && !Game.tbfight.over); } catch (e) { liveAtEntry = false; }
    let mid = null, wave = null, originSeq = null, originType = null, worldHpPre = null;
    try {
      mid = monsterId || Game.pendingMonsterId || 'bulldozer';
      const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
      wave = def ? (def.wave | 0) : null;
      // World origin: monster on the player tile (never playerMonster()).
      try {
        const px = (Game.map && Game.map.px != null) ? Game.map.px : ((Game.state && Game.state.scholar && Game.state.scholar.mx != null) ? Game.state.scholar.mx : 4);
        const py = (Game.map && Game.map.py != null) ? Game.map.py : ((Game.state && Game.state.scholar && Game.state.scholar.my != null) ? Game.state.scholar.my : 4);
        const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
        const onTile = list.filter(m => m && m.tx === px && m.ty === py);
        // Prefer a monster whose id matches the argued mid; else the
        // first on-tile monster (the engine lifts s.monster, the
        // player-tile monster, whatever its id). The origin TYPE is
        // recorded so the analyzer can spot the world-origin
        // mismatch class (argued monster != tile monster).
        const origin = onTile.find(m => m.id === mid) || onTile[0] || null;
        if (origin) { originSeq = seqOf(origin); originType = origin.id || null; worldHpPre = roundHp(origin.hp); }
      } catch (e) { /* origin best-effort */ }
    } catch (e) { noteErr(store, 'startCombat.pre', e); }
    if (liveAtEntry) {
      try { pushCapped(store, 'starts', { day: day, mid: mid, wave: wave, originSeq: originSeq, originType: originType, worldHpPre: worldHpPre, refused: true, reason: 'live-fight' }); } catch (e) { noteErr(store, 'startCombat.refused', e); }
      return orig.apply(this, arguments);
    }
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) {
      try { pushCapped(store, 'starts', { day: day, mid: mid, wave: wave, originSeq: originSeq, originType: originType, worldHpPre: worldHpPre, threw: true, error: String((e && e.message) || e).slice(0, 120) }); } catch (e2) { noteErr(store, 'startCombat.throw', e2); }
      throw e;
    }
    try {
      const tf = Game.tbfight || null;
      if (!tf || !Array.isArray(tf.fighters)) {
        pushCapped(store, 'starts', { day: day, mid: mid, wave: wave, originSeq: originSeq, originType: originType, worldHpPre: worldHpPre, failed: true, reason: 'no-tbfight-post' });
      } else {
        const humans = tf.fighters.filter(f => f && (f.kind === 'player' || f.kind === 'villager' || f.kind === 'ally'));
        const monsters = tf.fighters.filter(f => f && f.kind === 'monster');
        const parts = humans.map(f => {
          const vid = (f.key === 'p') ? Game.villagerId : (f.villagerId || null);
          const g = gearOfVid(Game, vid);
          g.fighterKey = f.key || null;
          return g;
        });
        const vr = villageReadout(Game);
        const startIdx = store.starts.length;
        pushCapped(store, 'starts', {
          day: day, mid: mid, wave: wave, originSeq: originSeq, originType: originType, worldHpPre: worldHpPre,
          startIdx: startIdx,
          tbMonsterHpStart: monsters.length ? roundHp(monsters[0].hp) : null,
          tbMonsterMaxStart: monsters.length ? roundHp(monsters[0].maxHp) : null,
          tbMonsterIds: monsters.map(f => f.monsterId || null),
          participants: parts,
          tricksKnown: vr.tricksKnown,
          monsterCounterKnown: monsterCounterKnown(Game, mid),
          readiness: vr.readiness,
        });
        pendingStarts.push({ startIdx: startIdx, mid: mid });
      }
    } catch (e) { noteErr(store, 'startCombat.post', e); }
    return ret;
  });

  wrap('tbEnd', (orig) => function (result) {
    let pre = null;
    try {
      const tf = Game.tbfight || null;
      const fighters = (tf && Array.isArray(tf.fighters)) ? tf.fighters.map(f => ({ key: f.key || null, kind: f.kind || null, villagerId: f.villagerId || null, monsterId: f.monsterId || null, hp: roundHp(f.hp), maxHp: roundHp(f.maxHp), alive: !!f.alive, fled: !!f.fled })) : [];
      const origin = tf ? tf.worldOrigin : null;
      const monsterIds = fighters.filter(f => f.kind === 'monster').map(f => f.monsterId || null);
      pre = {
        day: dayOf(Game), result: (result === undefined || result === null) ? null : String(result),
        fighters: fighters, worldOriginSeq: origin ? seqOf(origin) : null, worldOriginType: origin ? (origin.id || null) : null,
        monsterIds: monsterIds,
      };
    } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      if (pre) {
        // Join: oldest pending start whose mid matches the end's
        // monster id (first monster fighter, else origin type).
        const endMid = (pre.monsterIds && pre.monsterIds[0]) || pre.worldOriginType || null;
        let qi = -1;
        for (let i = 0; i < pendingStarts.length; i++) {
          if (pendingStarts[i].mid === endMid) { qi = i; break; }
        }
        if (qi >= 0) {
          const joined = pendingStarts.splice(qi, 1)[0];
          pre.startIdx = joined.startIdx;
          pre.matched = true;
        } else {
          pre.startIdx = null;
          pre.matched = false;
        }
        pushCapped(store, 'tbEnds', pre);
      }
    } catch (e) { noteErr(store, 'tbEnd.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._wave4demandDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._wave4demandDiagStore = store;
    Game._wave4demandDiagInstalled = true;
    Game._wave4demandDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withWave4demandDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installWave4demandDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._wave4demand = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installWave4demandDiag, withWave4demandDiag, MAX_EVENTS };
