// wave5face-instrument-20261109.js — wave-5 facing recorder (arm
// sim-wave5face-b, run fleshout-loop-b-20261110T0122Z). Scripts only,
// zero src/js. DIAG ONLY: characterization, no lever.
//
// Layers on the finishersize instrument (which layers grind /
// partydamage / stageally / bankkiller / killerdeath) and adds the
// wave-5 engagement entry point the vetfinish arm named as the next
// blank (standaccum-b "Next blanks" #3; vetfinish-b "the chain binds
// at wave-5 facing"). The finishersize stack already records field
// rows, TB traces, daily snapshots (readiness5, gated standing,
// unlockedWaveSnap), killerTrack, waveKillLog, wavesFaced, scaleRank.
// This layer adds:
//
//  - SPAWNS: Game.spawnWorldMonster wrapped (the spawn choke point:
//    tile-entry casts, wanderer contacts, traps, finale nodes all pass
//    through it; it returns the world entity). Every wave-5 spawn
//    recorded with day, mid, veteran flag, hp/maxHp, tile, and a
//    spawnSeq (own WeakMap id on the returned entity object).
//    removeWorldMonster wrapped to record removal day per spawn.
//  - CASTS: Game.castMonster wrapped: every wave-5 pick recorded
//    (day, mid, veteran). A cast is a spawn CHOICE, not a spawn: the
//    wanderer cast becomes a world entity only on contact
//    (triggerEncounter -> spawnWorldMonster); a feast-draw cast never
//    does. Casts are reported separately from spawns, never conflated.
//  - WANDERER BIRTHS: daily snapshot diff of Game.wanderer
//    (monsterId, bornDay, veteran) — the true wanderer-birth record,
//    as a cross-check on casts (a cast matching a same-day wanderer
//    birth is a wanderer spawn-choice; others are feast/other draws).
//  - MEETINGS: field fights join to spawns EXACTLY by instance id
//    (the field row's `m` object IS the world entity the spawn wrap
//    tagged). TB fights join in the ANALYZER by the preregged rule
//    (mid + day window), because the TB fighter is a fresh object, not
//    the world entity — the trace carries the scholar-monster WeakMap
//    id when state.scholar.monster is the world entity, as a join aid.
//  - VETERAN-AT-MEETING: for each wave-5 meeting, whether the fighter
//    was a living veteran that day (wave-4+ kill in waveKillLog with
//    d <= meeting day + alive via getPerson), recorded live on the
//    field row and on the TB trace.
//  - SIMULTANEITY: daily snapshot of living veterans (distinct wave-4+
//    killers alive today), count + ids — yields max simultaneous
//    living veterans and the day-count of 2+ living veterans.
//
// Wrappers never throw into game code: a recording failure is counted
// in instrumentErrors and the original call's result is returned
// untouched. The wrappers add zero RNG draws and zero game-state
// writes.
//
// Usage: const INST = require('./wave5face-instrument-20261109');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
//   inst.t.w5spawns / w5casts / w5wanderers / w5livingVets hold the facing records.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const FS = require(path.join(REPO, 'scripts', 'finishersize-instrument-20261106'));

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function monsterWave(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(function (m) { return m && m.id === mid; });
    return def && def.wave != null ? (def.wave | 0) : null;
  } catch (e) { return null; }
}

function isAlive(Game, vid) {
  if (vid == null) return null;
  try {
    if (vid === Game.villagerId) return true; // the scholar is the current adventurer
    const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
    if (p) return !p.dead;
    const fallen = (((Game.state || {}).village || {}).fallen) || [];
    return !fallen.some(function (f) { return f && f.villagerId === vid; });
  } catch (e) { return null; }
}

// Living-veteran status of one fighter on one day: has a wave-4+ kill
// on/before that day AND is alive that day. Pure read.
function veteranStatus(Game, vid, day) {
  const out = { veteran: false, alive: null, killDays: [] };
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    log.forEach(function (e) {
      if (e && e.by === vid && ((e.w | 0) >= 4) && ((e.d | 0) <= day)) out.killDays.push(e.d | 0);
    });
    if (!out.killDays.length) return out;
    out.veteran = true;
    out.alive = isAlive(Game, vid);
    return out;
  } catch (e) { return out; }
}

function install(Game) {
  const base = FS.install(Game);
  const t = base.t;
  t.w5spawns = [];
  t.w5casts = [];
  t.w5wanderers = [];
  t.w5livingVets = [];
  t._w5seq = 0;
  t._w5ids = new WeakMap();
  t._w5lastWandererKey = null;

  function spawnSeqOf(obj) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return null;
    try {
      let id = t._w5ids.get(obj);
      if (!id) { t._w5seq += 1; id = 's' + t._w5seq; t._w5ids.set(obj, id); }
      return id;
    } catch (e) { return null; }
  }

  // ---- spawnWorldMonster: the spawn choke point ----
  const origSpawn = Game.spawnWorldMonster;
  if (typeof origSpawn === 'function') {
    Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
      let mon = null;
      try { mon = origSpawn.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (mon && typeof mon === 'object') {
          let wave = (mon.wave != null) ? (mon.wave | 0) : null;
          if (wave == null) wave = monsterWave(Game, mon.id);
          if (wave === 5) {
            const seq = spawnSeqOf(mon);
            t.w5spawns.push({
              seq: seq, day: dayOf(Game), mid: mon.id || null, wave: 5,
              veteran: !!mon.veteran, hp: (mon.hp != null ? mon.hp : null),
              maxHp: (mon.maxHp != null ? mon.maxHp : null),
              tx: (tx != null ? tx : null), ty: (ty != null ? ty : null),
              mx: (mon.mx != null ? mon.mx : null), my: (mon.my != null ? mon.my : null),
              removedDay: null,
            });
          }
        }
      } catch (e) { t.instrumentErrors.push('spawnWorldMonster-w5: ' + String(e.message).slice(0, 80)); }
      return mon;
    };
  } else { t.instrumentErrors.push('spawnWorldMonster-missing'); }

  // ---- removeWorldMonster: removal day per spawn ----
  const origRemove = Game.removeWorldMonster;
  if (typeof origRemove === 'function') {
    Game.removeWorldMonster = function (m) {
      let ret;
      try { ret = origRemove.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (m && typeof m === 'object') {
          const id = t._w5ids.get(m);
          if (id) {
            const rec = t.w5spawns.find(function (s) { return s.seq === id; });
            if (rec && rec.removedDay == null) rec.removedDay = dayOf(Game);
          }
        }
      } catch (e) { t.instrumentErrors.push('removeWorldMonster-w5: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('removeWorldMonster-missing'); }

  // ---- castMonster: the spawn choice (not the spawn) ----
  const origCast = Game.castMonster;
  if (typeof origCast === 'function') {
    Game.castMonster = function () {
      let ret;
      try { ret = origCast.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const mid = (ret && typeof ret === 'object') ? (ret.id || null) : (typeof ret === 'string' ? ret : null);
        const veteran = !!(ret && typeof ret === 'object' && ret.veteran);
        if (mid && monsterWave(Game, mid) === 5) {
          t.w5casts.push({ day: dayOf(Game), mid: mid, veteran: veteran });
        }
      } catch (e) { t.instrumentErrors.push('castMonster-w5: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('castMonster-missing'); }

  // ---- fieldFight: exact instance join + veteran-at-meeting ----
  // Sits OUTSIDE the finishersize wrap, so the row is complete when read.
  const innerFF = Game.fieldFight;
  if (typeof innerFF === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      const before = (t.fieldFights || []).length;
      let rec = null;
      try { rec = innerFF.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const rows = t.fieldFights || [];
        if (rows.length > before) {
          const row = rows[rows.length - 1];
          let seq = null;
          try { if (m && typeof m === 'object') seq = t._w5ids.get(m) || null; } catch (e) {}
          row.w5spawnSeq = seq;
          if ((row.wave | 0) === 5) {
            const vs = veteranStatus(Game, vid, row.day);
            row.w5veteranAtMeeting = !!(vs.veteran && vs.alive);
            row.w5fighterHadKill = !!vs.veteran;
            row.w5fighterAlive = vs.alive;
            row.w5vetKillDays = vs.killDays.slice();
          }
        }
      } catch (e) { t.instrumentErrors.push('fieldFight-w5-row: ' + String(e.message).slice(0, 80)); }
      return rec;
    };
  } else { t.instrumentErrors.push('fieldFight-missing-w5'); }

  // ---- startCombat: TB-trace join aid + fighter veteran status ----
  // Sits OUTSIDE the partydamage/grind wraps; t._trace is the fresh trace.
  const innerStart = Game.startCombat;
  if (typeof innerStart === 'function') {
    Game.startCombat = function () {
      let ret;
      try { ret = innerStart.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const tr = t._trace;
        if (tr && (tr.wave | 0) >= 5) {
          let seq = null;
          try {
            const sm = ((Game.state || {}).scholar || {}).monster;
            if (sm && typeof sm === 'object') seq = t._w5ids.get(sm) || null;
          } catch (e) {}
          tr.w5scholarMonsterSeq = seq;
          const day = dayOf(Game);
          tr.w5fightersVeteran = {};
          (tr.fighters || []).forEach(function (vid) {
            try {
              const vs = veteranStatus(Game, vid, day);
              tr.w5fightersVeteran[vid] = { veteran: !!(vs.veteran && vs.alive), hadKill: !!vs.veteran, alive: vs.alive, killDays: vs.killDays.slice() };
            } catch (e2) {}
          });
        }
      } catch (e) { t.instrumentErrors.push('startCombat-w5: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing-w5'); }

  // ---- snapshot: living veterans + wanderer births + release flag ----
  const origSnapshot = base.snapshot;
  base.snapshot = function () {
    const snap = origSnapshot();
    try {
      const log = ((Game.state || {}).waveKillLog) || [];
      const seen = {};
      log.forEach(function (e) {
        if (e && e.by && ((e.w | 0) >= 4)) {
          if (isAlive(Game, e.by)) seen[e.by] = true;
        }
      });
      const ids = Object.keys(seen).sort();
      snap.w5livingVets = { count: ids.length, ids: ids };
      t.w5livingVets.push({ day: snap.day, count: ids.length, ids: ids.slice() });
    } catch (e) { snap.w5livingVets = null; t.instrumentErrors.push('snapshot-w5vets: ' + String(e.message).slice(0, 80)); }
    try {
      const w = Game.wanderer || null;
      if (w && w.monsterId) {
        const key = String(w.monsterId) + '@' + String(w.bornDay);
        if (key !== t._w5lastWandererKey) {
          t._w5lastWandererKey = key;
          t.w5wanderers.push({
            day: dayOf(Game), bornDay: (w.bornDay != null ? w.bornDay : null),
            mid: w.monsterId, wave: monsterWave(Game, w.monsterId),
            veteran: !!w.veteran,
          });
        }
      } else if (!w) { t._w5lastWandererKey = null; }
      snap.w5wanderer = w ? { mid: w.monsterId, bornDay: (w.bornDay != null ? w.bornDay : null), veteran: !!w.veteran } : null;
    } catch (e) { snap.w5wanderer = null; t.instrumentErrors.push('snapshot-w5wanderer: ' + String(e.message).slice(0, 80)); }
    try { snap.w5releaseDay = ((snap.unlockedWaveSnap | 0) >= 5); } catch (e) { snap.w5releaseDay = null; }
    return snap;
  };

  const origUninstall = base.uninstall;
  base.uninstall = function () {
    try { if (typeof origSpawn === 'function') Game.spawnWorldMonster = origSpawn; } catch (e) {}
    try { if (typeof origRemove === 'function') Game.removeWorldMonster = origRemove; } catch (e) {}
    try { if (typeof origCast === 'function') Game.castMonster = origCast; } catch (e) {}
    try { if (typeof innerFF === 'function') Game.fieldFight = innerFF; } catch (e) {}
    try { if (typeof innerStart === 'function') Game.startCombat = innerStart; } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };

  return base;
}

module.exports = { install: install, veteranStatus: veteranStatus, monsterWave: monsterWave };
