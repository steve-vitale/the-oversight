// triggerbuild-instrument-20261105.js — trigger-BUILD instrument
// (arm sim-triggerbuild-b, run fleshout-loop-b-20261105T0139Z). Copy of
// trigger-instrument-20261104.js with two extensions only: (a) mtCall
// records carry viaTravel (stack names travelTo — the parting turn);
// (b) SAY_PAT gains /turn to leave/ (the parting line). Everything else
// identical: pure-read wrappers + daily snapshots, zero game-state
// writes, zero RNG draws, instance identity by object reference.
// Usage: const INST = require('./triggerbuild-instrument-20261104');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Raw stack text minus instrument frames, for token classification.
function stackText() {
  try {
    return (new Error().stack || '').split('\n').slice(1)
      .filter(function (ln) { return ln.indexOf('triggerbuild-instrument') < 0; }).join('\n');
  } catch (e) { return ''; }
}
function stackFn() {
  try {
    const lines = (new Error().stack || '').split('\n').slice(1);
    for (const ln of lines) {
      if (ln.indexOf('triggerbuild-instrument') >= 0) continue;
      const m = ln.match(/at (?:async )?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)/);
      if (m) return m[1];
    }
    return null;
  } catch (e) { return null; }
}
function stackHas(needle) {
  try {
    const st = new Error().stack || '';
    const lines = st.split('\n').slice(1).filter(function (ln) { return ln.indexOf('triggerbuild-instrument') < 0; });
    return lines.some(function (ln) { return ln.indexOf(needle) >= 0; });
  } catch (e) { return false; }
}

// Fight stack class, precedence fixed in the prereg:
// contest > feast > trap > world > other.
function classifyFight(st, worldMatched) {
  if (/contest/i.test(st)) return 'contest';
  if (/feast/i.test(st)) return 'feast';
  if (/trap/i.test(st)) return 'trap';
  if (worldMatched) return 'world';
  if (/monsterTurn|resolveWildMonsterEncounter|villagerMonsterTick|checkEncounter|worldTick/i.test(st)) return 'world';
  return 'other';
}

function install(Game) {
  const t = { spawns: [], removals: [], casts: [], fights: [], daily: [], mtCalls: [], tileChanges: [], sayLines: [], instrumentErrors: [] };
  let evt = 0;
  const nextEvt = function () { evt += 1; return evt; };
  const waveById = {};
  try {
    const mons = ((Game.data || {}).monsters) || [];
    mons.forEach(function (m) { if (m && m.id) waveById[m.id] = (m.wave | 0) || 1; });
  } catch (e) { t.instrumentErrors.push('monster-map: ' + String(e.message).slice(0, 80)); }

  function waveOf(mid, mdef) {
    if (mdef && (mdef.wave | 0)) return (mdef.wave | 0);
    if (mid && waveById[mid]) return waveById[mid];
    return null;
  }

  // Instance tracking by object reference.
  const instances = new Map();
  let seqCounter = 0;
  let npcsOnNodeMissing = false;
  try {
    if (typeof Game.npcsOnNode !== 'function') { npcsOnNodeMissing = true; t.instrumentErrors.push('npcsOnNode-missing'); }
  } catch (e) { npcsOnNodeMissing = true; t.instrumentErrors.push('npcsOnNode-check: ' + String(e.message).slice(0, 80)); }
  let npcErrCount = 0;
  try {
    if (typeof Game.monsterAt !== 'function') t.instrumentErrors.push('monsterAt-missing');
  } catch (e) { t.instrumentErrors.push('monsterAt-check: ' + String(e.message).slice(0, 80)); }

  // Shared mutable context so nested wrappers can report into the
  // enclosing monsterTurn record (fight fired / removal fired inside).
  const ctx = { mtActiveSeq: null, mtFight: null, mtRemoved: null };

  function playerTile() {
    try { return { px: Game.map.px, py: Game.map.py }; } catch (e) { return { px: null, py: null }; }
  }
  function scholarPos() {
    try { const s = (Game.state || {}).scholar || {}; return { mx: (s.mx != null ? s.mx : 4), my: (s.my != null ? s.my : 4) }; } catch (e) { return { mx: null, my: null }; }
  }
  // Pure read: the monster on the player's tile, without the alias
  // adoption side effect of playerMonster().
  function tileMonster() {
    try {
      const pt = playerTile();
      if (pt.px == null) return null;
      return (typeof Game.monsterAt === 'function') ? Game.monsterAt(pt.px, pt.py) : null;
    } catch (e) { return null; }
  }

  const origSpawn = Game.spawnWorldMonster;
  const origRemove = Game.removeWorldMonster;
  const origCast = Game.castMonster;
  const origStart = Game.startCombat;
  const origField = Game.fieldFight;
  const origMT = Game.monsterTurn;
  const origSay = Game.say;

  if (typeof origSpawn === 'function') {
    Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
      let mon = null;
      try { mon = origSpawn.apply(this, arguments); } catch (e) { throw e; }
      try {
        const pt = playerTile();
        const fn = stackFn();
        let source = 'other';
        if (fn && fn.indexOf('maintainWorldMonsters') >= 0) source = 'background';
        else if (fn && fn.indexOf('checkEncounter') >= 0) source = 'checkEncounter';
        else if (stackHas('maintainWorldMonsters')) source = 'background';
        else if (stackHas('checkEncounter')) source = 'checkEncounter';
        const id = (mon && mon.id) || ((typeof mdef === 'string') ? mdef : (mdef && mdef.id)) || null;
        const wave = (mon && mon.wave != null) ? (mon.wave | 0) : waveOf(id, (typeof mdef === 'object') ? mdef : null);
        seqCounter++;
        if (mon && typeof mon === 'object') instances.set(mon, seqCounter);
        t.spawns.push({
          idx: nextEvt(), seq: seqCounter, day: dayOf(Game), id: id, wave: wave,
          tx: (mon && mon.tx != null) ? mon.tx : tx, ty: (mon && mon.ty != null) ? mon.ty : ty,
          mx: (mon && mon.mx != null) ? mon.mx : null, my: (mon && mon.my != null) ? mon.my : null,
          px: pt.px, py: pt.py,
          dist: (pt.px != null && mon) ? (Math.abs(mon.tx - pt.px) + Math.abs(mon.ty - pt.py)) : null,
          onPlayerTile: (pt.px != null && mon) ? (mon.tx === pt.px && mon.ty === pt.py) : null,
          source: source, stackFn: fn, veteran: !!(mon && mon.veteran),
        });
      } catch (e) { t.instrumentErrors.push('spawn-record: ' + String(e.message).slice(0, 80)); }
      return mon;
    };
  } else { t.instrumentErrors.push('spawnWorldMonster-missing'); }

  if (typeof origRemove === 'function') {
    Game.removeWorldMonster = function (m) {
      const seq = (m && typeof m === 'object' && instances.has(m)) ? instances.get(m) : null;
      let ret;
      try { ret = origRemove.apply(this, arguments); } catch (e) { throw e; }
      try {
        const fn = stackFn();
        const st = stackText();
        let rclass = 'other';
        if (/startCombat|fieldFight|resolveWild|resolvePatrol|villagerMonsterTick|patrol/.test(st)) rclass = 'fight-settlement';
        else if (fn && fn.indexOf('monsterTurn') >= 0) rclass = 'monsterTurn';
        if (ctx.mtActiveSeq != null && seq != null && seq === ctx.mtActiveSeq && ctx.mtRemoved == null) ctx.mtRemoved = seq;
        t.removals.push({ idx: nextEvt(), seq: seq, day: dayOf(Game), id: (m && m.id) || null, stackFn: fn, rclass: rclass });
      } catch (e) { t.instrumentErrors.push('remove-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('removeWorldMonster-missing'); }

  if (typeof origCast === 'function') {
    Game.castMonster = function () {
      let ret = null;
      try { ret = origCast.apply(this, arguments); } catch (e) { throw e; }
      try {
        const fn = stackFn();
        let source = 'other';
        if (fn && fn.indexOf('checkEncounter') >= 0) source = 'wanderer-cast';
        else if (stackHas('contest')) source = 'contest-cast';
        else if (stackHas('checkEncounter')) source = 'wanderer-cast';
        const id = (ret && typeof ret === 'object') ? ret.id : ret;
        t.casts.push({ idx: nextEvt(), day: dayOf(Game), id: id || null, wave: waveOf(id, null), veteran: !!(ret && typeof ret === 'object' && ret.veteran), source: source, stackFn: fn });
      } catch (e) { t.instrumentErrors.push('cast-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('castMonster-missing'); }

  // Fight wrappers: classify BEFORE calling orig (the fight may remove
  // the world monster, so the instance match must be captured first).
  // For startCombat, the world instance is state.scholar.monster, but
  // only when its id matches the fight's monster id (a contest beast
  // id must never inherit the tile monster's instance).
  if (typeof origStart === 'function') {
    Game.startCombat = function (monsterId, options) {
      let cls = 'other', seq = null, mid = null, worldMatched = false;
      try {
        const st = stackText();
        mid = monsterId || null;
        try {
          const sm = ((Game.state || {}).scholar || {}).monster;
          if (sm && typeof sm === 'object' && instances.has(sm)) {
            const smId = sm.id || null;
            if (mid == null || smId === mid) { seq = instances.get(sm); worldMatched = true; }
          }
        } catch (e) {}
        cls = classifyFight(st, worldMatched);
      } catch (e) { t.instrumentErrors.push('startCombat-classify: ' + String(e.message).slice(0, 80)); }
      let ret;
      try { ret = origStart.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (ctx.mtActiveSeq != null && seq != null && seq === ctx.mtActiveSeq && ctx.mtFight == null) ctx.mtFight = seq;
        t.fights.push({ idx: nextEvt(), day: dayOf(Game), channel: 'player-tb', fighter: null, mid: mid, wave: waveOf(mid, null), optsKeys: [], outcome: null, cls: cls, seq: seq });
      } catch (e) { t.instrumentErrors.push('startCombat-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }
  if (typeof origField === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      let cls = 'other', seq = null, mid = null, worldMatched = false;
      try {
        const st = stackText();
        mid = (mdef && mdef.id) || (m && m.id) || null;
        if (m && typeof m === 'object' && instances.has(m)) { seq = instances.get(m); worldMatched = true; }
        cls = classifyFight(st, worldMatched);
      } catch (e) { t.instrumentErrors.push('fieldFight-classify: ' + String(e.message).slice(0, 80)); }
      let ret;
      try { ret = origField.apply(this, arguments); } catch (e) { throw e; }
      try {
        const keys = opts ? Object.keys(opts).sort() : [];
        let outcome = null;
        try { outcome = (ret && (ret.outcome || ret.result)) || null; } catch (e2) {}
        if (ctx.mtActiveSeq != null && seq != null && seq === ctx.mtActiveSeq && ctx.mtFight == null) ctx.mtFight = seq;
        t.fights.push({ idx: nextEvt(), day: dayOf(Game), channel: 'field', fighter: vid || null, mid: mid, wave: waveOf(mid, mdef), optsKeys: keys, outcome: outcome, cls: cls, seq: seq });
      } catch (e) { t.instrumentErrors.push('fieldFight-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('fieldFight-missing'); }

  // monsterTurn detail trace. Full detail only when the player monster
  // is wave-4; a tile-change marker fires on every call regardless.
  let lastTileKey = null;
  let untrackedWarned = new Set();
  if (typeof origMT === 'function') {
    Game.monsterTurn = function () {
      let mon = null, monSeq = null, monWave = null, viaTravel = false;
      try {
        const pt = playerTile();
        const key = (pt.px != null) ? (pt.px + ',' + pt.py) : null;
        if (key !== null && lastTileKey !== null && key !== lastTileKey) {
          const parts = lastTileKey.split(',');
          t.tileChanges.push({ idx: nextEvt(), day: dayOf(Game), from: [parseInt(parts[0], 10), parseInt(parts[1], 10)], to: [pt.px, pt.py] });
        }
        if (key !== null) lastTileKey = key;
        mon = tileMonster();
        if (mon && typeof mon === 'object') {
          monWave = (mon.wave != null) ? (mon.wave | 0) : waveOf(mon.id, null);
          if ((monWave | 0) === 4) {
            if (instances.has(mon)) monSeq = instances.get(mon);
            else if (!untrackedWarned.has(mon)) { untrackedWarned.add(mon); t.instrumentErrors.push('monsterTurn-untracked-w4'); }
          }
          // TRIGGERBUILD (2026-11-05): parting-turn attribution — a
          // monsterTurn reached from travelTo is the parting turn, not
          // a step/interact turn. No other path calls monsterTurn from
          // inside travelTo, so viaTravel is a clean mechanism signal.
          try { if (monSeq != null) viaTravel = stackHas('travelTo'); } catch (e) { viaTravel = false; }
        }
      } catch (e) { t.instrumentErrors.push('monsterTurn-pre: ' + String(e.message).slice(0, 80)); }
      const sp = scholarPos();
      const before = (mon && monSeq != null) ? { mx: mon.mx, my: mon.my, lostSight: mon.lostSight || 0, stance: mon.stance || null } : null;
      const prevFight = ctx.mtFight, prevRemoved = ctx.mtRemoved;
      if (monSeq != null) { ctx.mtActiveSeq = monSeq; ctx.mtFight = null; ctx.mtRemoved = null; }
      let ret;
      try { ret = origMT.apply(this, arguments); } catch (e) {
        ctx.mtActiveSeq = null; ctx.mtFight = null; ctx.mtRemoved = null;
        throw e;
      }
      try {
        if (monSeq != null) {
          const pt = playerTile();
          const after = { mx: mon.mx, my: mon.my, lostSight: mon.lostSight || 0, stance: mon.stance || null };
          const distBefore = (before && sp.mx != null) ? Math.max(Math.abs(sp.mx - before.mx), Math.abs(sp.my - before.my)) : null;
          const distAfter = (sp.mx != null && after.mx != null) ? Math.max(Math.abs(sp.mx - after.mx), Math.abs(sp.my - after.my)) : null;
          t.mtCalls.push({
            idx: nextEvt(), day: dayOf(Game), seq: monSeq, id: mon.id, wave: 4,
            px: pt.px, py: pt.py, pmx: sp.mx, pmy: sp.my,
            before: before, after: after, distBefore: distBefore, distAfter: distAfter,
            fightFired: ctx.mtFight === monSeq, removedFired: ctx.mtRemoved === monSeq,
            viaTravel: viaTravel,
          });
        }
      } catch (e) { t.instrumentErrors.push('monsterTurn-record: ' + String(e.message).slice(0, 80)); }
      ctx.mtActiveSeq = null; ctx.mtFight = null; ctx.mtRemoved = null;
      if (monSeq == null) { ctx.mtFight = prevFight; ctx.mtRemoved = prevRemoved; }
      return ret;
    };
  } else { t.instrumentErrors.push('monsterTurn-missing'); }

  // Say wrapper: pattern lines only, sharing the event index.
  const SAY_PAT = /lost your trail|followed you|stops at the (treeline|boundary)|Something moves out there|Something pads into|Something big is HERE|Something big is moving|turn to leave/i;
  let sayCount = 0;
  if (typeof origSay === 'function') {
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_PAT.test(arg)) t.sayLines.push({ idx: nextEvt(), day: dayOf(Game), line: String(arg).slice(0, 300) });
        }
      } catch (e) { t.instrumentErrors.push('say-record: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } else { t.instrumentErrors.push('say-missing'); }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try {
      const roster = (((Game.state || {}).village || {}).roster || []).slice();
      snap.rosterSize = roster.length;
      let living = 0;
      roster.forEach(function (vid) {
        if (vid === snap.scholarId) { living++; return; }
        try { const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null; if (p && !p.dead) living++; } catch (e) {}
      });
      snap.living = living;
    } catch (e) { snap.rosterSize = null; snap.living = null; t.instrumentErrors.push('roster: ' + String(e.message).slice(0, 80)); }
    try {
      const st = Game.villageStanding ? Game.villageStanding() : null;
      snap.raw = st ? (st.total | 0) : null;
    } catch (e) { snap.raw = null; t.instrumentErrors.push('standing: ' + String(e.message).slice(0, 80)); }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; t.instrumentErrors.push('gated: ' + String(e.message).slice(0, 80)); }
    try { snap.unlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.unlockedWave = null; t.instrumentErrors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try { snap.worldCap = Game.worldMonsterCap ? Game.worldMonsterCap() : null; } catch (e) { snap.worldCap = null; }
    const pt = playerTile();
    snap.px = pt.px; snap.py = pt.py;
    try {
      const w = (typeof Game.wanderer !== 'undefined' && Game.wanderer) ? { id: Game.wanderer.monsterId || null, veteran: !!Game.wanderer.veteran } : null;
      snap.wanderer = w;
    } catch (e) { snap.wanderer = null; }
    try {
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      snap.world = list.map(function (m) {
        let npcCount = null;
        if (!npcsOnNodeMissing) {
          try { npcCount = Game.npcsOnNode(m.tx, m.ty).length; }
          catch (e) { if (npcErrCount < 3) { npcErrCount++; t.instrumentErrors.push('npcsOnNode: ' + String(e.message).slice(0, 80)); } }
        }
        return {
          seq: instances.has(m) ? instances.get(m) : null, id: m.id, wave: (m.wave | 0) || waveOf(m.id, null),
          tx: m.tx, ty: m.ty, mx: m.mx, my: m.my,
          dist: (pt.px != null) ? (Math.abs(m.tx - pt.px) + Math.abs(m.ty - pt.py)) : null,
          onPlayerTile: (pt.px != null) ? (m.tx === pt.px && m.ty === pt.py) : null,
          npcCount: npcCount,
        };
      });
    } catch (e) { snap.world = null; t.instrumentErrors.push('world-snap: ' + String(e.message).slice(0, 80)); }
    try { snap.w4facedTypes = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : null; } catch (e) { snap.w4facedTypes = null; }
    t.daily.push(snap);
    return snap;
  }

  function finalize() {
    const out = {};
    try { out.waveKillLog = (((Game.state || {}).waveKillLog) || []).slice(); } catch (e) { out.waveKillLog = null; t.instrumentErrors.push('killlog-final: ' + String(e.message).slice(0, 80)); }
    try { out.fallen = (((Game.state || {}).village || {}).fallen || []).slice(); } catch (e) { out.fallen = null; t.instrumentErrors.push('fallen-final: ' + String(e.message).slice(0, 80)); }
    try {
      const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
      out.wavesFaced = (ds && ds.wavesFaced) || null;
    } catch (e) { out.wavesFaced = null; t.instrumentErrors.push('deed-final: ' + String(e.message).slice(0, 80)); }
    try { out.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { out.scaleRank = null; }
    try { out.unlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { out.unlockedWave = null; }
    try { out.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { out.standing = null; }
    try { out.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { out.readiness5 = null; }
    try {
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      out.finalWorld = list.map(function (m) { return { seq: instances.has(m) ? instances.get(m) : null, id: m.id, wave: (m.wave | 0) || waveOf(m.id, null), tx: m.tx, ty: m.ty, mx: m.mx, my: m.my }; });
    } catch (e) { out.finalWorld = null; }
    out.sayCount = sayCount;
    return out;
  }

  function uninstall() {
    try { if (typeof origSpawn === 'function') Game.spawnWorldMonster = origSpawn; } catch (e) {}
    try { if (typeof origRemove === 'function') Game.removeWorldMonster = origRemove; } catch (e) {}
    try { if (typeof origCast === 'function') Game.castMonster = origCast; } catch (e) {}
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origField === 'function') Game.fieldFight = origField; } catch (e) {}
    try { if (typeof origMT === 'function') Game.monsterTurn = origMT; } catch (e) {}
    try { if (typeof origSay === 'function') Game.say = origSay; } catch (e) {}
  }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall };
}

module.exports = { install: install, classifyFight: classifyFight };
