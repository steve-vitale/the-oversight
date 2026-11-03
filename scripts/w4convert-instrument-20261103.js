// w4convert-instrument-20261103.js — wave-4 kill-conversion split
// instrument (arm sim-w4convert-a, run fleshout-20261103T1819Z).
// DIAG-ONLY, scripts only, zero src/js. Splits the vetbar census
// (71 spawns / 37 TB starts / 33 field fights / 5 kills, seeds
// 99101-99108) by fight type, party size at fight start, and lead
// fighter gear at fight start, and splits killer deaths into
// same-fight vs later with engine-recorded causes.
//
// LINKAGE (attribution-wrap caution, 2026-11-03 sensor/findings
// backlog): fight identity is captured at fight START (startCombat
// PRE-call identity + POST-call fighter snapshot; fieldFight
// PRE-call identity). Kill linkage is exact, never day-joined:
//  - TB kills fire INSIDE tbEnd while Game.tbfight still points at
//    the fight, so a kill row links by tbfight object identity.
//  - Field kills fire in the CALLER after fieldFight returns (the
//    wild/patrol/agency call sites call recordWaveKill after the
//    fight), so a vKill field exposure arms a pending latch
//    {seq, mid, vid}; the next kill row matching mid+vid consumes
//    it. The latch is cleared by the next fight start, the next
//    field fight, or the next daily snapshot, so it can never
//    mis-link a kill days later. A kill row matching neither is
//    reported unlinked, never force-joined.
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
// weapon items. READ-ONLY: none of these write state.
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

function killerInfo(Game, by) {
  const info = { by: by, isScholarNow: false, vpDead: false };
  try { info.isScholarNow = (by != null && by === Game.villagerId); } catch (e) {}
  try { info.vpDead = !!((typeof Game.vpOf === 'function' ? Game.vpOf(by) : null) || {}).dead; } catch (e) {}
  info.aliveRecount = info.isScholarNow ? true : !info.vpDead;
  return info;
}

function install(Game) {
  const t = {
    exposures: [], killRows: [], unlinkedKills: [], spawns: [], daily: [],
    deathEvents: [], orphanTbEnds: [], instrumentErrors: [],
    wrapCounts: {}, tbCalls: 0,
  };
  const orig = {};
  let seq = 0;
  let openTb = null; // {seq, fight} — tbfight object identity, not id
  let pendingField = null; // {seq, mid, vid}
  const prevAlive = {};
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  function fighterSnap(fight) {
    const humans = [], monsters = [];
    try {
      for (const f of ((fight && fight.fighters) || [])) {
        if (!f) continue;
        if (f.kind === 'monster') {
          const mid = ((f.mdef || {}).id || f.monsterId || f.id) || null;
          monsters.push({ mid: mid, alive: !!f.alive, hp: (f.hp != null ? f.hp : null) });
        } else if (f.key === 'p' || f.kind === 'villager' || f.kind === 'ally') {
          const vid = f.villagerId || (f.key === 'p' ? (Game.villagerId || null) : null);
          humans.push({ key: f.key || null, kind: f.kind || null, vid: vid, alive: (f.alive !== false), hp: (f.hp != null ? f.hp : null) });
        }
      }
    } catch (e) { err('fighterSnap', e); }
    return { humans: humans, monsters: monsters };
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
      // PRE-call identity (census definition counts the call).
      let effId = null;
      try {
        let worldId = null, pendingId = null;
        try { const s = Game.state.scholar || {}; if (s.monster) worldId = s.monster.id || null; } catch (e) {}
        try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
        effId = mid || pendingId || worldId || null;
      } catch (e) { err('start.pre', e); }
      const isW4 = !!(effId && waveOf(Game, effId) === 4);
      if (isW4) t.tbCalls++;
      // A stale pending-field latch dies here: field kills are recorded
      // synchronously by their caller, so a later startCombat can never
      // be that kill's recorder.
      if (pendingField) pendingField = null;
      const beforeFight = Game.tbfight || null;
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (isW4) {
          const fight = Game.tbfight || null;
          if (fight && fight !== beforeFight) {
            // A previous open fight with no tbEnd is dissolved/unended.
            if (openTb && !openTb.ended) {
              const prev = t.exposures.find(function (x) { return x.seq === openTb.seq; });
              if (prev) prev.superseded = true;
            }
            seq++;
            const snap = fighterSnap(fight);
            const humans = snap.humans.map(function (h) {
              return { vid: h.vid, kind: h.kind, gear: h.vid ? gearOf(Game, h.vid) : null };
            });
            const scholarId = Game.villagerId || null;
            const leadGear = scholarId ? gearOf(Game, scholarId) : null;
            t.exposures.push({
              seq: seq, type: 'tb', day: dayOf(Game), mid: effId, wave: 4,
              fightId: fight.id || null, scholarAtStart: scholarId,
              leadVid: scholarId, partySizeStart: snap.humans.length,
              party: humans, monsters: snap.monsters, leadGear: leadGear,
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
          pre = { fight: f, result: result, snap: snap, hasW4: w4 };
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
                day: dayOf(Game),
                monsters: pre.snap.monsters, humans: pre.snap.humans,
                monsterDeadW4: pre.snap.monsters.filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4 && !m.alive; }).length,
                monsterTotalW4: pre.snap.monsters.filter(function (m) { return m.mid && waveOf(Game, m.mid) === 4; }).length,
                humansDead: pre.snap.humans.filter(function (h) { return !h.alive; }).map(function (h) { return h.vid; }),
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

  // --- field fights: identity at START (PRE-call) ---
  if (typeof Game.fieldFight === 'function') {
    orig.fieldFight = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      count('fieldFight');
      let pre = null;
      try {
        const mid = (typeof mdef === 'string') ? mdef : ((mdef && mdef.id) || (m && m.id) || null);
        if (mid && waveOf(Game, mid) >= 4) {
          const o = opts || {};
          pre = {
            vid: (vid === undefined || vid === null) ? null : String(vid),
            mid: mid, wave: waveOf(Game, mid), day: dayOf(Game),
            offeredAllies: o.allies || 0,
            offeredAllyVids: (o.allyVids || []).slice(),
          };
          // A new field fight invalidates any stale latch.
          pendingField = null;
          seq++;
          pre.seq = seq;
          t.exposures.push({
            seq: seq, type: 'field', day: pre.day, mid: mid, wave: pre.wave,
            leadVid: pre.vid, partySizeStart: Math.max(1, (o.allies || 0) + 1),
            offeredAllies: pre.offeredAllies, offeredAllyVids: pre.offeredAllyVids,
            leadGear: pre.vid ? gearOf(Game, pre.vid) : null,
            end: null, kills: [], superseded: false,
          });
        }
      } catch (e) { err('field.pre', e); }
      let rec;
      try { rec = orig.fieldFight.apply(this, arguments); } catch (e) {
        if (pre) {
          const ex = t.exposures.find(function (x) { return x.seq === pre.seq; });
          if (ex) ex.end = { outcome: 'threw', day: dayOf(Game), error: String(e.message).slice(0, 80) };
        }
        throw e;
      }
      try {
        if (pre) {
          const ex = t.exposures.find(function (x) { return x.seq === pre.seq; });
          if (ex) {
            const r = (rec && typeof rec === 'object') ? rec : {};
            ex.end = {
              outcome: (r.outcome === undefined || r.outcome === null) ? null : String(r.outcome),
              day: dayOf(Game), rounds: (r.rounds != null ? r.rounds : null),
              partySizeEnd: (r.partySize != null ? r.partySize : null),
              allyVid: r.allyVid || null, calledHelp: !!r.calledHelp,
              vTaken: (r.vTaken != null ? r.vTaken : null),
              mDealt: (r.mDealt != null ? r.mDealt : null),
              vHpLeft: (r.vHpLeft != null ? r.vHpLeft : null),
              mHpLeft: (r.mHpLeft != null ? r.mHpLeft : null),
              intent: r.intent || null,
            };
            if (ex.end.outcome === 'vKill') pendingField = { seq: pre.seq, mid: pre.mid, vid: pre.vid };
          }
        }
      } catch (e) { err('field.post', e); }
      return rec;
    };
  } else { err('install.fieldFight', new Error('not a function')); }

  // --- kill choke points: exact linkage ---
  function killerDeadAtRecord(by) {
    try {
      const f = Game.tbfight || null;
      if (!f) return null;
      const snap = fighterSnap(f);
      const h = snap.humans.find(function (x) { return x.vid === by; });
      if (h) return !h.alive;
      if (by === Game.villagerId) { const p = snap.humans.find(function (x) { return x.key === 'p'; }); if (p) return !p.alive; }
    } catch (e) {}
    return null;
  }
  function wrapKill(fnName, pyrrhic) {
    if (typeof Game[fnName] !== 'function') { err('install.' + fnName, new Error('not a function')); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (monsterId, killerVid, via, detail) {
      count(fnName);
      let before = null;
      try { before = ((Game.state || {}).waveKillLog || []).length; } catch (e) {}
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { err(fnName, e); throw e; }
      try {
        const after = ((Game.state || {}).waveKillLog || []).length;
        const w = waveOf(Game, monsterId);
        if (w != null && w >= 4) {
          let linkSeq = null, linkHow = null;
          if (openTb && Game.tbfight === openTb.fight) { linkSeq = openTb.seq; linkHow = 'tb-open'; }
          else if (pendingField && monsterId === pendingField.mid && killerVid === pendingField.vid) {
            linkSeq = pendingField.seq; linkHow = 'field-latch'; pendingField = null;
          }
          const row = {
            day: dayOf(Game), fn: fnName, pyrrhic: !!pyrrhic, mid: monsterId, wave: w,
            by: (killerVid == null ? null : killerVid), via: via || 'unknown',
            scholarAtKill: Game.villagerId || null,
            wasScholar: (killerVid != null && killerVid === Game.villagerId),
            logLenBefore: before, logLenAfter: after, entryAdded: (before != null && after != null && after > before),
            linkSeq: linkSeq, linkHow: linkHow,
            killerDeadAtRecord: killerDeadAtRecord(killerVid),
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

  // --- engine-recorded death causes (tele 'death' hook) ---
  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'death' && data && typeof data === 'object') {
          t.deathEvents.push({ day: dayOf(Game), kind: data.kind || null, who: data.who || null, cause: data.cause || null, player: !!data.player });
        }
      } catch (e) { err('tele', e); }
      return r;
    };
  } else { err('install.tele', new Error('not a function')); }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.roster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) { snap.roster = []; }
    try {
      const log = ((Game.state || {}).waveKillLog || []).filter(function (e) { return e && (e.w | 0) >= 4; });
      snap.logW4 = log.map(function (e) { return { d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via }; });
    } catch (e) { snap.logW4 = null; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; }
    try {
      const killers = {};
      (snap.logW4 || []).forEach(function (e) {
        const k = killers[e.by] || (killers[e.by] = { kills: 0, firstDay: e.d, lastDay: e.d, vias: {} });
        k.kills++; if (e.d < k.firstDay) k.firstDay = e.d; if (e.d > k.lastDay) k.lastDay = e.d;
        k.vias[e.via || 'unknown'] = (k.vias[e.via || 'unknown'] || 0) + 1;
      });
      snap.killers = {};
      Object.keys(killers).forEach(function (by) {
        const info = killerInfo(Game, by);
        snap.killers[by] = Object.assign({}, killers[by], info);
        if (prevAlive[by] && !info.aliveRecount && t.deathDays[by] == null) t.deathDays[by] = snap.day;
        prevAlive[by] = info.aliveRecount;
      });
      snap.gateSet = Object.keys(snap.killers).filter(function (by) { return snap.killers[by].aliveRecount; });
      snap.gateCount = snap.gateSet.length;
    } catch (e) { err('snapshot-killers', e); snap.killers = null; }
    // Snapshot cadence is the stale-latch guard: a field kill is
    // recorded synchronously by its caller, so any latch surviving
    // to a snapshot is stale and must not link a later kill.
    pendingField = null;
    t.daily.push(snap);
    return snap;
  }

  function uninstall() { Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} }); }
  return { t: t, snapshot: snapshot, uninstall: uninstall, gearOf: gearOf };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, gearOf: gearOf };
