// @ontology
// system: finishLog
// description: Finishing instrument (2026-11-05, winnability chain): records how every wild wave-4+ fight ends, round by round, into game telemetry. Field fights carry per-round records on the returned record (built in fieldFights.js); player turn-based fights are observed via wraps here. Observe-only: no RNG, no outcome reads, no state writes except the telemetry ring and its own runtime ring.
// provides:
//   - finishLogOff()
//   - finishLogField(rec, meta)
//   - finishLogEmit(record)
//   - finishLogCloseOpen(reason)
// rules:
//   - observe_only: every wrap calls the original first and returns its result unchanged (tbEnd snapshots before, emits after) (code: finishLog.js)
//   - no_rng: no Math.random anywhere in this module (code: finishLog.js)
//   - record_only: the only writes are the telemetry ring, the runtime _finishLog ring, and record fields nothing in the engine reads (code: finishLog.js)
//   - wave4_only: only wave-4+ fights are recorded or emitted (code: finishLog.js)
// consumes:
//   - tele(), startCombat(), tbAdvance(), tbEnd(), useAbility(), waveKillLog (state)
(function () {
  'use strict';
  var S = globalThis.Scattering;
  var G = S && S.Game;
  if (!G) return;
  // WRAP-ONCE (telemetry-hooks precedent): double-loading must never
  // double-wrap startCombat/tbEnd or double-count a fight.
  if (G._finishLogInstalled) return;
  G._finishLogInstalled = true;

  var MAX_RING = 200;
  G._finishLog = G._finishLog || [];
  G._finishLogErrors = G._finishLogErrors || [];
  // Open player-TB finish record (runtime only, never saved): set at
  // startCombat for wave-4+ fights, closed at tbEnd (or by the sim
  // driver's finalize via finishLogCloseOpen when the village dies
  // mid-fight). Null when no wave-4+ TB fight is open.
  G._finishLogOpenTb = null;

  function err(where, e) {
    try { G._finishLogErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  // FINISHLOG_OFF=1 (node env, NODEWITNESS=1 precedent): skips every
  // finishLog code path, so the off leg runs byte-identical engine
  // behavior. In the browser process is undefined: always on.
  G.finishLogOff = function () {
    try { return typeof process !== 'undefined' && process.env && process.env.FINISHLOG_OFF === '1'; } catch (e) { return false; }
  };

  function dayOf(g) { try { return ((g.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

  var _waveById = null, _waveByIdN = -1;
  function waveOfMid(g, mid) {
    try {
      var mons = ((g.data || {}).monsters) || [];
      if (!_waveById || _waveByIdN !== mons.length) {
        _waveById = {}; _waveByIdN = mons.length;
        mons.forEach(function (m) { if (m && m.id) _waveById[m.id] = (m.wave | 0) || 1; });
      }
      return (mid && _waveById[mid]) || null;
    } catch (e) { return null; }
  }

  // Field ending map (analyzer-facing). The round cap is a timeout even
  // though the engine's outcome reads vFlee/mFlee (judges' call): the
  // fight ended because the rounds ran out, not because anyone chose to
  // leave. outcomeRaw always carries the engine's own outcome alongside.
  function mapFieldEnding(outcome, roundCap) {
    if (outcome === 'vKill') return 'kill';
    if (outcome === 'vDie') return 'death';
    if (outcome === 'mFlee' || outcome === 'vFlee') return roundCap ? 'timeout' : 'flee';
    if (outcome === 'evade') return 'evade';
    return 'other';
  }

  // finishLogEmit(record): one record into the runtime ring (bounded) and
  // one fight_finish event into the telemetry ring. Record-only.
  G.finishLogEmit = function (record) {
    try {
      if (!record) return;
      G._finishLog.push(record);
      if (G._finishLog.length > MAX_RING) G._finishLog.splice(0, G._finishLog.length - MAX_RING);
      try { if (G.tele) G.tele('fight_finish', record); } catch (e) { err('tele', e); }
    } catch (e) { err('emit', e); }
  };

  // finishLogField(rec, meta): called from fieldFight's return path (after
  // vHpLeft/mHpLeft are set, before the damage seal). Builds the finish
  // record from the engine's own record + the call-site locals passed in
  // meta. Wave-4+ only; anything else returns null and emits nothing.
  G.finishLogField = function (rec, meta) {
    try {
      if (this.finishLogOff()) return null;
      meta = meta || {};
      var wave = (meta.wave | 0) || 1;
      if (wave < 4) return null;
      var rounds = rec.roundsDetail || [];
      var entryHp = (rec.mHpStart != null) ? rec.mHpStart : (rec.mMaxHp || null);
      var dealt = rec.mDealt | 0;
      var record = {
        channel: 'field', day: dayOf(this), fighter: meta.vid || null,
        fighters: [meta.vid || null].concat(rec.allyVid ? [rec.allyVid] : []),
        mid: (meta.mdef && meta.mdef.id) || null, wave: wave,
        entryHp: entryHp, entryVHp: (meta.vHpStart != null) ? meta.vHpStart : null,
        rounds: rec.rounds | 0, roundsDetail: rounds, last3: rounds.slice(-3),
        outcomeRaw: rec.outcome || null, ending: mapFieldEnding(rec.outcome, !!rec.roundCap),
        roundCap: !!rec.roundCap, damageDealt: dealt,
        damageFrac: (entryHp != null && entryHp > 0) ? dealt / entryHp : null,
        // Pre-round damage (opening volley / closing strike, before round
        // 1): the per-round deltas sum to damageDealt minus this.
        preRoundDealt: (rec.flPreRoundDealt | 0),
        vTaken: rec.vTaken | 0, allyDealt: rec.allyDealt | 0, allyTaken: rec.allyTaken | 0,
        gear: { weaponBonus: (meta.wb != null) ? meta.wb : null, armor: (meta.varmor != null) ? meta.varmor : null, abilitiesHeld: (meta.vAbs || []).slice() },
        abilitiesUsed: (rec.ffFired || []).slice(), tricks: (rec.trickLog || []).slice(),
        intent: rec.intent || null, intentWhy: rec.intentWhy || null,
        partySize: (rec.partySize | 0) || 1, allyVid: rec.allyVid || null,
        vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft,
      };
      G.finishLogEmit(record);
      return record;
    } catch (e) { err('field', e); return null; }
  };

  // ---- player turn-based fights (wraps; the engine is never edited) ----

  function tbFighters(f) {
    try {
      return (f.fighters || []).map(function (x) {
        return { key: x.key || null, kind: x.kind || null, vid: x.villagerId || null, hp: (x.hp != null) ? (x.hp | 0) : null, maxHp: (x.maxHp != null) ? (x.maxHp | 0) : null, alive: !!x.alive };
      });
    } catch (e) { return []; }
  }
  function tbMonsterHp(f) {
    try {
      return (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile'); })
        .reduce(function (s, x) { return s + (((x.hp || 0) > 0) ? (x.hp | 0) : 0); }, 0);
    } catch (e) { return null; }
  }
  function tbMonsterWave(g, f) {
    var w = null;
    try {
      (f.fighters || []).forEach(function (x) {
        if (!x || (x.kind !== 'monster' && x.kind !== 'hostile')) return;
        var mid = (x.mdef && x.mdef.id) || x.monsterId || x.id || null;
        var mw = waveOfMid(g, mid);
        if (mw != null && (w == null || mw > w)) w = mw;
      });
    } catch (e) {}
    return w;
  }
  function tbHumanVids(f, g) {
    try {
      var vids = (f.fighters || []).filter(function (x) { return x && (x.kind === 'player' || x.kind === 'villager' || x.kind === 'ally') && x.villagerId; })
        .map(function (x) { return x.villagerId; });
      // SCHOLAR-VID (secondkiller correction): the scholar's own tbfight
      // entry often carries no villagerId (kind 'player', key 'p'), so a
      // solo scholar fight would list no human fighters at all.
      if (!vids.length && g.villagerId) vids = [g.villagerId];
      return vids;
    } catch (e) { return g.villagerId ? [g.villagerId] : []; }
  }

  // snapshotTb(open): one entry per round number, holding END-of-round
  // HPs. A second snapshot in the same round replaces the first (the
  // round's final state); a new round number pushes a new entry.
  function snapshotTb(open) {
    var f = G.tbfight;
    if (!f || !open) return;
    var snap = { round: (f.round | 0) || 0, fighters: tbFighters(f), monsterHp: tbMonsterHp(f) };
    var last = open.roundsDetail[open.roundsDetail.length - 1];
    if (last && last.round === snap.round) open.roundsDetail[open.roundsDetail.length - 1] = snap;
    else open.roundsDetail.push(snap);
  }

  function buildTbRecord(open, result, ending, killMatched) {
    var endHp = open.roundsDetail.length ? open.roundsDetail[open.roundsDetail.length - 1].monsterHp : null;
    var dealt = (open.entryHp != null && endHp != null) ? Math.max(0, open.entryHp - endHp) : null;
    var lastRound = open.roundsDetail.length ? open.roundsDetail[open.roundsDetail.length - 1].round : 0;
    return {
      channel: 'player-tb', day: open.day, fighter: open.fighter, fighters: open.fighters,
      mid: open.mid, wave: open.wave, entryHp: open.entryHp,
      rounds: lastRound, roundsDetail: open.roundsDetail, last3: open.roundsDetail.slice(-3),
      outcomeRaw: result || null, ending: ending, killMatched: !!killMatched,
      damageDealt: dealt, damageFrac: (dealt != null && open.entryHp > 0) ? dealt / open.entryHp : null,
      abilitiesUsed: (open.abilitiesUsed || []).slice(),
      gear: null, partySize: (open.fighters && open.fighters.length) || 1,
    };
  }

  // STRICT KILL MATCH (secondkiller correction): a waveKillLog row makes
  // a TB 'won' a kill only when its monster id and day match this fight
  // AND its killer is one of this fight's fighters (the scholar counts as
  // 'player' as well as by villager id). A 'won' with no matching row is
  // a rout — the monster broke, nobody's kill is logged — never a kill.
  function tbKillMatched(g, open) {
    try {
      var log = ((g.state || {}).waveKillLog) || [];
      return log.some(function (e2) {
        return e2 && e2.mid === open.mid && (e2.d | 0) === (open.day | 0) &&
          (e2.by === 'player' || (open.fighters || []).indexOf(e2.by) >= 0);
      });
    } catch (e) { return false; }
  }

  var origStart = G.startCombat;
  if (typeof origStart === 'function') {
    G.startCombat = function () {
      var r = origStart.apply(this, arguments);
      try {
        if (!G.finishLogOff() && G.tbfight) {
          var f = G.tbfight;
          var wave = tbMonsterWave(G, f);
          if (wave != null && wave >= 4) {
            var mon = (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile'); })[0];
            var mid = mon ? ((mon.mdef && mon.mdef.id) || mon.monsterId || mon.id || null) : null;
            G._finishLogOpenTb = {
              channel: 'player-tb', day: dayOf(G), fighter: G.villagerId || null,
              fighters: tbHumanVids(f, G), mid: mid, wave: wave,
              entryHp: tbMonsterHp(f), roundsDetail: [], abilitiesUsed: [],
            };
            snapshotTb(G._finishLogOpenTb);
          } else { G._finishLogOpenTb = null; }
        }
      } catch (e) { err('startCombat', e); }
      return r;
    };
  } else { err('startCombat-missing', new Error('no startCombat')); }

  var origAdvance = G.tbAdvance;
  if (typeof origAdvance === 'function') {
    G.tbAdvance = function () {
      var r = origAdvance.apply(this, arguments);
      try {
        if (!G.finishLogOff() && G._finishLogOpenTb && G.tbfight) snapshotTb(G._finishLogOpenTb);
      } catch (e) { err('tbAdvance', e); }
      return r;
    };
  } else { err('tbAdvance-missing', new Error('no tbAdvance')); }

  var origUseAbility = G.useAbility;
  if (typeof origUseAbility === 'function') {
    G.useAbility = function () {
      var r = origUseAbility.apply(this, arguments);
      try {
        var open = G._finishLogOpenTb;
        if (open && arguments.length && typeof arguments[0] === 'string' && open.abilitiesUsed.indexOf(arguments[0]) < 0) open.abilitiesUsed.push(arguments[0]);
      } catch (e) { err('useAbility', e); }
      return r;
    };
  }

  var origTbEnd = G.tbEnd;
  if (typeof origTbEnd === 'function') {
    G.tbEnd = function (result) {
      var open = G._finishLogOpenTb;
      // Capture the final snapshot BEFORE the original: tbEnd may null
      // tbfight, and the final round's end state lives in it.
      try { if (open && G.tbfight) snapshotTb(open); } catch (e) { err('tbEnd-snap', e); }
      var r = origTbEnd.apply(this, arguments);
      try {
        if (open && !G.finishLogOff()) {
          var killed = (result === 'won') ? tbKillMatched(G, open) : false;
          var ending;
          if (result === 'won') ending = killed ? 'kill' : 'rout';
          else if (result === 'fled') ending = 'flee';
          else if (result === 'lost') ending = 'death';
          else ending = 'other';
          G.finishLogEmit(buildTbRecord(open, result, ending, killed));
        }
      } catch (e) { err('tbEnd', e); }
      if (open) G._finishLogOpenTb = null;
      return r;
    };
  } else { err('tbEnd-missing', new Error('no tbEnd')); }

  // finishLogCloseOpen(reason): the sim driver's finalize closes a TB
  // fight still open when the run ends (village died mid-fight). The
  // fight is recorded as 'unfinished', never dropped silently.
  G.finishLogCloseOpen = function (reason) {
    try {
      var open = G._finishLogOpenTb;
      if (!open) return null;
      try { if (G.tbfight) snapshotTb(open); } catch (e) { err('closeOpen-snap', e); }
      var record = buildTbRecord(open, reason || 'unfinished', 'unfinished', false);
      G.finishLogEmit(record);
      G._finishLogOpenTb = null;
      return record;
    } catch (e) { err('closeOpen', e); return null; }
  };
})(typeof window !== 'undefined' ? window : global);
