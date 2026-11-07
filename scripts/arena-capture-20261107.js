// arena-capture-20261107.js — arena / stranger death capture wrapper
// (arm sim-arena-b, run fleshout-loop-b-20261107T0230Z). Scripts only,
// zero src/js. Pure-read wrappers; zero game-state writes, zero RNG
// draws. Wrappers never throw into game code.
//
// Captures, at every tbEnd and every playerDeath, the contest/arena
// state the per-seed corpora never recorded:
//   - state.arenaContest (contestId, waves, waveIdx) — live iff this
//     tbEnd is a Blood-contest arena bout;
//   - state.activeContest (contestId) — which contest, if any;
//   - state.alienEncounter.pid — which alien-player persona, if any;
//   - the live tbfight's fighters (key, kind, alienPid, name, monster
//     id, HP) — so a 'stranger' death names its fighter;
//   - the Game.log tail at death (last 25 entries, text + surface) —
//     so the 📺 arena death lines and the alien-encounter intro lines
//     are quoted from the run, not reconstructed.
// Install LAST (outermost), after the stageally instrument, so the
// pre-call captures read state before the mantle passes.
// Usage: const CAP = require('./arena-capture-20261107');
//   const cap = CAP.install(Game); ... cap.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function cloneArena(arc) {
  if (!arc) return null;
  try {
    return { contestId: arc.contestId || null,
      waves: Array.isArray(arc.waves) ? arc.waves.slice() : null,
      waveIdx: (arc.waveIdx != null) ? arc.waveIdx : null };
  } catch (e) { return { contestId: null, waves: null, waveIdx: null }; }
}

function summarizeFighters(Game) {
  try {
    const f = Game.tbfight;
    if (!f || !Array.isArray(f.fighters)) return null;
    return f.fighters.map(function (o) {
      if (!o) return null;
      return { key: o.key || null, kind: o.kind || null,
        alienPid: o.alienPid || null, name: o.name || null,
        monsterId: (o.mdef && o.mdef.id) || o.monsterId || o.id || null,
        hp: (o.hp != null) ? o.hp : null,
        maxHp: (o.maxHp != null) ? o.maxHp : null,
        alive: (o.alive !== false) };
    });
  } catch (e) { return null; }
}

function logTail(Game, n) {
  try {
    const log = Game.log || [];
    return log.slice(-(n || 25)).map(function (e) {
      try {
        if (e == null) return null;
        if (typeof e === 'string') return { text: e, surface: null };
        return { text: String(e.text != null ? e.text : (e.msg != null ? e.msg : e)), surface: e.surface || null };
      } catch (e2) { return null; }
    });
  } catch (e) { return null; }
}

function install(Game) {
  const t = { tbEnds: [], deaths: [], sayTail: [], instrumentErrors: [] };

  // SAY TAIL (sim-arena-b 2026-11-07): the sim harness stubs say/sysSay
  // to no-ops (sim-harness.js loadGame, unless opts.narration), so
  // Game.log stays empty in sims and a logTail read finds nothing — the
  // 53004/53006 replay legs recorded empty logTails for exactly this
  // reason. Record the say stream here instead: wrap say/sysSay and keep
  // the last 200 lines with their day, so a death capture can quote the
  // lines that led to it. Pure recording; the originals still run.
  function recordSay(via, args) {
    try {
      const text = Array.prototype.slice.call(args || []).join(' ');
      if (!text) return;
      t.sayTail.push({ day: dayOf(Game), via: via, text: String(text).slice(0, 600) });
      if (t.sayTail.length > 200) t.sayTail.splice(0, t.sayTail.length - 200);
    } catch (e) { t.instrumentErrors.push('sayTail-record: ' + String(e.message).slice(0, 80)); }
  }
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function () { recordSay('say', arguments); return origSay.apply(this, arguments); };
  }
  const origSysSay = Game.sysSay;
  if (typeof origSysSay === 'function') {
    Game.sysSay = function () { recordSay('sysSay', arguments); return origSysSay.apply(this, arguments); };
  }

  function arenaState() {
    let arc = null, activeId = null, alienPid = null;
    try { arc = cloneArena(Game.state && Game.state.arenaContest); } catch (e) {}
    try { activeId = (Game.state && Game.state.activeContest && Game.state.activeContest.contestId) || null; } catch (e) {}
    try { alienPid = (Game.state && Game.state.alienEncounter && Game.state.alienEncounter.pid) || null; } catch (e) {}
    return { arenaContest: arc, activeContestId: activeId, alienEncounterPid: alienPid };
  }

  const origTbEnd = Game.tbEnd;
  if (typeof origTbEnd === 'function') {
    Game.tbEnd = function (result) {
      try {
        const st = arenaState();
        t.tbEnds.push({ day: dayOf(Game), result: (result == null ? null : String(result)),
          arenaContest: st.arenaContest, activeContestId: st.activeContestId,
          alienEncounterPid: st.alienEncounterPid, fighters: summarizeFighters(Game) });
      } catch (e) { t.instrumentErrors.push('tbEnd-capture: ' + String(e.message).slice(0, 80)); }
      return origTbEnd.apply(this, arguments);
    };
  } else { t.instrumentErrors.push('tbEnd-missing'); }

  const origPlayerDeath = Game.playerDeath;
  if (typeof origPlayerDeath === 'function') {
    Game.playerDeath = function (cause) {
      try {
        const st = arenaState();
        t.deaths.push({ day: dayOf(Game), scholarId: Game.villagerId || null,
          causeArg: (cause == null ? null : String(cause)),
          arenaContest: st.arenaContest, activeContestId: st.activeContestId,
          alienEncounterPid: st.alienEncounterPid, inCombat: !!Game.tbfight,
          fighters: summarizeFighters(Game), logTail: logTail(Game, 25),
          sayTail: t.sayTail.slice(-25) });
      } catch (e) { t.instrumentErrors.push('playerDeath-capture: ' + String(e.message).slice(0, 80)); }
      return origPlayerDeath.apply(this, arguments);
    };
  } else { t.instrumentErrors.push('playerDeath-missing'); }

  function uninstall() {
    try { if (typeof origTbEnd === 'function') Game.tbEnd = origTbEnd; } catch (e) {}
    try { if (typeof origPlayerDeath === 'function') Game.playerDeath = origPlayerDeath; } catch (e) {}
    try { if (typeof origSay === 'function') Game.say = origSay; } catch (e) {}
    try { if (typeof origSysSay === 'function') Game.sysSay = origSysSay; } catch (e) {}
  }

  return { t: t, uninstall: uninstall };
}

module.exports = { install: install };
