// vetfirst-instrument-20261111.js — veterans first-numbers recorder
// (arm sim-vetfirst-b, run fleshout-loop-b-20261111T0835Z). Scripts only,
// zero src/js.
//
// Records, per seed:
//   (1) KILL CALLS (recordWaveKill wrap — the choke-point accounting):
//       every call with day/mid/wave/by/via/trick + the dup verdict
//       (whether an identical entry already sits in the log at call
//       time). The vetcount-b fix made the counter follow the log; this
//       counts the re-fires themselves.
//   (2) PYRRHIC CALLS (recordPyrrhicKill wrap): every pyrrhic entry
//       (day/mid/by/via) — kills that score nothing but still make
//       veterans.
//   (3) MONSTER-VETERAN CASTS (castMonster wrap): every return
//       {id, veteran} (+ string fallback) with the current unlocked
//       wave read from the daily snapshot, not the wrap (no
//       villageStandingTotal() calls mid-run — the vetkill-diag
//       discipline).
//   (4) WORLD SPAWNS (spawnWorldMonster wrap): every spawn with
//       id/wave/veteran/hp/maxHp + caller frame.
//   (5) FIGHTS (startCombat wrap, post): the monster-side fighters at
//       fight start (mid, veteran, veteranVariant, hp, maxHp, speed,
//       def hp/speed) — the live stat check (hp x1.5 / spd +1 / the
//       +3 damage question, which no damage path in the code applies
//       — see prereg Canon).
//   (6) TELES (tele wrap): counts of every type + full rows only for
//       veteran-relevant types (teach/mentor/party/veteran/kill/tale/
//       companion/invite/blood) with a short payload summary.
//   (7) DEATHS (registerDeath wrap): every death row (day, kind,
//       villagerId, name, cause, killerId) — cross-checked against
//       vpOf liveness in the daily snapshot (the #530 phantom-death
//       lesson: a tele without a dead record does not count).
//   (8) DAILY SNAPSHOT: waveKillLog copy (kill-time-keyed), waveKills
//       counters, wave4Slain, living-veteran recomputation (w4 bar:
//       wave-3+ killers; w5 bar: wave-4+ killers; scholar-at-kill-time
//       flagged per killer from the daily scholarId series),
//       per-veteran behavior rows (inParty, armorP, weapon, assignment,
//       hp), roster liveness, scholarId, waveUnlockReady(4/5) pure
//       reads. NEVER calls villageStandingTotal() / unlockedWave()
//       mid-run (both release peaks / emit beats).
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-vetfirst-b.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. The waveKillLog snapshot is the
// backstop: if the recordWaveKill wrap is dead, the kills are still
// counted from the daily log copies.
//
// Usage: const VF = require('./vetfirst-instrument-20261111');
//   const vf = VF.install(Game); vf.snapshot(); ... vf.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('vetfirst-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') return m[1];
    }
    return null;
  } catch (e) { return null; }
}

function personName(Game, vid) {
  try {
    if (typeof Game.getPerson === 'function') {
      const p = Game.getPerson(vid);
      if (p) return p.name || p.displayName || vid;
    }
  } catch (e) {}
  try {
    const v = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; });
    if (v) return v.name || vid;
  } catch (e) {}
  return vid;
}

// Kill-time-keyed living-veteran recomputation, mirroring the gate's
// rule (standing.js waveCombatReadiness + ladder.js
// countLivingVeterans): distinct killer vids with a wave-minWave+ kill
// in the log who are alive NOW. Scholar-at-kill-time is flagged per
// killer from the caller-supplied scholarIdByDay map (day -> scholar
// vid that day); a killer counts as scholar-at-kill for a kill on day
// d when scholarIdByDay[d] === by.
function livingVeterans(Game, minWave, scholarIdByDay) {
  const out = { count: 0, killers: [] };
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    const scholarId = Game.villagerId || null;
    const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
    const isLiving = function (vid) {
      if (!vid) return false;
      if (vid === scholarId) return true;
      if (roster.indexOf(vid) < 0) return false;
      try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); }
      catch (e) { return true; }
    };
    const seen = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < (minWave | 0))) continue;
      if (!isLiving(e.by)) continue;
      const k = seen[e.by] || (seen[e.by] = {
        by: e.by, name: personName(Game, e.by),
        firstDay: e.d, lastDay: e.d, maxWave: (e.w | 0), kills: 0,
        scholarAtKill: false, pyrrhicKills: 0,
      });
      k.kills++;
      if (e.d < k.firstDay) k.firstDay = e.d;
      if (e.d > k.lastDay) k.lastDay = e.d;
      if ((e.w | 0) > k.maxWave) k.maxWave = (e.w | 0);
      if (e.pyrrhic) k.pyrrhicKills++;
      if (scholarIdByDay && scholarIdByDay[e.d] === e.by) k.scholarAtKill = true;
    }
    out.killers = Object.keys(seen).map(function (k) { return seen[k]; });
    out.count = out.killers.length;
  } catch (e) { out.error = String((e && e.message) || e).slice(0, 120); }
  return out;
}

function install(Game) {
  const t = {
    killCalls: [],   // {day, mid, wave, by, via, trick, dup}
    pyrrhicCalls: [],// {day, mid, by, via}
    casts: [],       // {day, id, veteran, retShape}
    spawns: [],      // {day, id, wave, veteran, hp, maxHp, caller}
    fights: [],      // {day, mid, veteran, veteranVariant, hp, maxHp, speed, defHp, defSpeed, name}
    teleCounts: {},  // type -> n
    teleRows: [],    // veteran-relevant tele rows {day, type, summary}
    deaths: [],      // {day, kind, villagerId, name, cause, killerId}
    daily: [],       // snapshots
    instrumentErrors: [],
    wrapLive: {},
  };
  const wrapped = {};
  const scholarIdByDay = {};

  function err(site, e) {
    try { t.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        let pre = null;
        try { pre = record.pre ? record.pre(Array.prototype.slice.call(arguments)) : null; } catch (e) { err(name + '-pre', e); }
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try {
          t.wrapLive[name] = true;
          if (record.post) record.post(Array.prototype.slice.call(arguments), r, threw, pre);
        } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  function monsterWave(mid) {
    try {
      const m = ((Game.data || {}).monsters || []).find(function (x) { return x && x.id === mid; });
      return m ? (m.wave || 1) : null;
    } catch (e) { return null; }
  }
  function monsterDef(mid) {
    try { return ((Game.data || {}).monsters || []).find(function (x) { return x && x.id === mid; }) || null; }
    catch (e) { return null; }
  }

  // (1) recordWaveKill — the choke-point accounting.
  wrapMethod('recordWaveKill', {
    pre: function (args) {
      const day = dayOf(Game);
      let dup = false;
      try {
        const log = (Game.state && Game.state.waveKillLog) || [];
        const mid = args[0], by = args[1] || null, via = args[2] || 'unknown', trick = args[3] || null;
        dup = log.some(function (e) {
          return e && e.d === day && e.mid === mid && (e.by || null) === by
            && (e.via || 'unknown') === via && (e.trick || null) === trick;
        });
      } catch (e) { err('recordWaveKill-dup', e); }
      return { day: day, dup: dup };
    },
    post: function (args, r, threw, pre) {
      t.killCalls.push({
        day: (pre && pre.day) || dayOf(Game),
        mid: args[0] || null, wave: monsterWave(args[0]),
        by: args[1] || null, via: args[2] || null, trick: args[3] || null,
        dup: !!(pre && pre.dup), threw: !!threw,
      });
    },
  });

  // (2) recordPyrrhicKill.
  wrapMethod('recordPyrrhicKill', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      t.pyrrhicCalls.push({
        day: (pre && pre.day) || dayOf(Game),
        mid: args[0] || null, wave: monsterWave(args[0]),
        by: args[1] || null, via: args[2] || null, threw: !!threw,
      });
    },
  });

  // (3) castMonster — the monster-veteran spawn decision.
  wrapMethod('castMonster', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      let id = null, veteran = null, shape = typeof r;
      try {
        if (r && typeof r === 'object') { id = r.id || null; veteran = !!r.veteran; }
        else if (typeof r === 'string') { id = r; veteran = false; }
      } catch (e) { err('castMonster-read', e); }
      t.casts.push({ day: (pre && pre.day) || dayOf(Game), id: id, veteran: veteran, retShape: shape, threw: !!threw });
    },
  });

  // (4) spawnWorldMonster — the world-side veteran share.
  wrapMethod('spawnWorldMonster', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      let id = null, wave = null, veteran = null, hp = null, maxHp = null;
      try {
        if (r && typeof r === 'object') {
          id = r.id || null; wave = (r.wave | 0) || monsterWave(r.id);
          veteran = !!r.veteran; hp = r.hp; maxHp = r.maxHp;
        } else if (args[0]) {
          id = (typeof args[0] === 'string') ? args[0] : (args[0].id || null);
          wave = monsterWave(id); veteran = !!(args[0] && args[0].veteran);
        }
      } catch (e) { err('spawnWorldMonster-read', e); }
      t.spawns.push({
        day: (pre && pre.day) || dayOf(Game), id: id, wave: wave, veteran: veteran,
        hp: hp, maxHp: maxHp, caller: firstFrame((pre && pre.stack) || ''), threw: !!threw,
      });
    },
  });

  // (5) startCombat — monster-side fighters at fight start.
  wrapMethod('startCombat', {
    pre: function (args) { return { day: dayOf(Game), mid: args[0] || null }; },
    post: function (args, r, threw, pre) {
      try {
        const fight = Game.tbfight;
        if (!fight || !fight.fighters) return;
        for (const f of fight.fighters) {
          if (!f || f.kind !== 'monster') continue;
          const def = monsterDef(f.monsterId);
          t.fights.push({
            day: (pre && pre.day) || dayOf(Game),
            mid: f.monsterId || null, name: f.name || null,
            veteran: !!f.veteran, veteranVariant: f.veteranVariant || null,
            hp: f.hp, maxHp: f.maxHp, speed: f.speed,
            defHp: def && def.hp ? def.hp.slice() : null,
            defSpeed: def ? (def.speed || null) : null,
            defDamage: def && def.attack && def.attack.damage ? def.attack.damage.slice() : null,
            threw: !!threw,
          });
        }
      } catch (e) { err('startCombat-read', e); }
    },
  });

  // (6) tele — counts of every type, rows only for veteran-relevant types.
  const TELE_RE = /teach|mentor|party|veteran|kill|tale|companion|invite|blood|veteran/i;
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        const type = args[0];
        t.teleCounts[type] = (t.teleCounts[type] || 0) + 1;
        if (TELE_RE.test(String(type || ''))) {
          let summary = '';
          try { summary = JSON.stringify(args[1] || null); } catch (e) { summary = String(args[1]); }
          t.teleRows.push({
            day: dayOf(Game), type: type,
            summary: String(summary || '').slice(0, 300), threw: !!threw,
          });
        }
      } catch (e) { err('tele-record', e); }
    },
  });

  // (7) registerDeath — every death row.
  wrapMethod('registerDeath', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      try {
        const o = args[0] || {};
        t.deaths.push({
          day: (pre && pre.day) || dayOf(Game),
          kind: o.kind || null, villagerId: o.villagerId || null,
          name: o.name || null, cause: o.cause || null,
          killerId: o.killerId || null, threw: !!threw,
        });
      } catch (e) { err('registerDeath-record', e); }
    },
  });

  // (8) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { scholarIdByDay[snap.day] = Game.villagerId || null; } catch (e) {}
    snap.scholarId = Game.villagerId || null;
    try {
      const log = (Game.state && Game.state.waveKillLog) || [];
      snap.waveKillLog = log.map(function (e) {
        return e ? { d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via, trick: e.trick || null, pyrrhic: !!e.pyrrhic } : null;
      });
      snap.waveKills = Object.assign({}, (Game.state && Game.state.waveKills) || {});
      snap.wave4Slain = (Game.state && Game.state.wave4Slain) || 0;
    } catch (e) { snap.waveKillLog = null; err('snap-log', e); }
    try {
      snap.vetsW3 = livingVeterans(Game, 3, scholarIdByDay);
      snap.vetsW4 = livingVeterans(Game, 4, scholarIdByDay);
    } catch (e) { snap.vetsW3 = null; snap.vetsW4 = null; err('snap-vets', e); }
    try {
      const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
      snap.roster = roster.map(function (vid) {
        let dead = null, name = null;
        try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; dead = !!(vp && vp.dead); name = (vp && vp.name) || null; }
        catch (e) { dead = null; }
        return { vid: vid, name: name, dead: dead };
      });
    } catch (e) { snap.roster = null; err('snap-roster', e); }
    try {
      // Per-veteran behavior rows: party, gear, duty, hp.
      const eq = ((Game.state || {}).equipment) || null;
      const itemDefs = ((Game.data || {}).items) || [];
      const party = (typeof Game.partyMembers === 'function') ? Game.partyMembers() : [];
      const asg = ((Game.state && Game.state.village && Game.state.village.assignments) || {});
      const vets = (((snap.vetsW3 || {}).killers) || []);
      snap.veteranRows = vets.map(function (k) {
        const row = { by: k.by, name: k.name, inParty: party.indexOf(k.by) >= 0, armorP: null, weapon: null, assignment: null, hp: null };
        try {
          if (k.by === snap.scholarId) {
            row.armorP = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : null;
            const ew = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null;
            row.weapon = ew ? (ew.name || ew.id || 'weapon') : null;
            const s = (Game.state && Game.state.scholar) || {};
            row.hp = (typeof s.health === 'number') ? s.health : null;
          } else {
            const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(k.by) : null;
            if (vp) {
              try { row.armorP = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) || 0) : null; } catch (e) { row.armorP = null; }
              try {
                const mw = (eq && typeof eq.meleeWeaponOf === 'function') ? eq.meleeWeaponOf(vp) : null;
                const rw = (!mw && eq && typeof eq.rangedWeaponOf === 'function') ? eq.rangedWeaponOf(vp) : null;
                const w = mw || rw;
                row.weapon = w ? (w.name || w.id || w.itemId || 'weapon') : null;
              } catch (e) { row.weapon = null; }
              row.hp = (typeof vp.hp === 'number') ? vp.hp : ((typeof vp.health === 'number') ? vp.health : null);
            }
          }
        } catch (e) { err('snap-vetrow-' + k.by, e); }
        try { const a = asg[k.by]; row.assignment = a ? (a.task || null) : null; } catch (e) {}
        return row;
      });
      snap.partyMembers = party.slice();
    } catch (e) { snap.veteranRows = null; err('snap-vetrows', e); }
    try {
      // Readiness bars (pure reads — the deferral layers read these).
      const r4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : null;
      const r5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
      snap.ready4 = r4 ? { ready: !!r4.ready, armored: r4.armored | 0, armed: r4.armed | 0, tricks: r4.tricks | 0, veterans: r4.veterans | 0, short: r4.short || [] } : null;
      snap.ready5 = r5 ? { ready: !!r5.ready, armored: r5.armored | 0, armed: r5.armed | 0, tricks: r5.tricks | 0, veterans: r5.veterans | 0, short: r5.short || [] } : null;
    } catch (e) { snap.ready4 = null; snap.ready5 = null; err('snap-ready', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall, livingVeterans: livingVeterans };
}

module.exports = {
  install: install,
  livingVeterans: livingVeterans,
};
