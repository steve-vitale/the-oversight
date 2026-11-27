// reunionwild2-b-instrument-20261127.js — Reunionwild findings-cluster
// instrument (arm sim-reunionwild2-b). Scripts only, zero src/js.
// The bloodcluster-b instrument
// (scripts/bloodcluster-b-instrument-20261124.js) required VERBATIM as
// the base (fieldFight + startCombat wraps, tbKillCtx, daily snapshots,
// kill/death events), PLUS two additive, call-through, RNG-neutral
// annotations, frozen in the prereg §3:
//   (a) live-fight context on every tbStarts row — captured BEFORE the
//       wrapped startCombat runs: the live tbfight's fightId, monster
//       ids, and over flag (null when no fight is live); attached to
//       the row the inner wrap pushes. This is the herald-refusal
//       classifier.
//   (b) playerDeath wrap mirroring the wilddeath instrument
//       (scripts/wilddeath-b-instrument-20261124.js ~116-210) — one
//       row per scholar death with tb.fightId, monsterIds,
//       monsterWaves, sayTail, victimName, day. This is the
//       succession classifier on the fresh band.
// All wraps are call-through; every catch reports into
// t.instrumentErrors, never silently.
// Usage: const INST = require('./reunionwild2-b-instrument-20261127');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

const BASE = require('./bloodcluster-b-instrument-20261124');
const WILD = require('./wilddeath-b-instrument-20261124');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function install(Game) {
  const base = BASE.install(Game);
  const t = base.t;
  t.playerDeaths = [];
  const orig = {};
  const sayRing = [];
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  // --- (a) live-fight context on every tbStarts row ---
  // The inner (bloodcluster) wrap pushes exactly one tbStarts row per
  // startCombat call, AFTER the original returns. This outer wrap
  // captures the live fight BEFORE the inner wrap runs, then attaches
  // it to the row the inner wrap just pushed (last row, if the length
  // grew by one). A refused call (fight live, tbfight.id unchanged)
  // therefore carries the fight that refused it; a genuine start
  // carries the fight that was live before it (usually null).
  if (typeof Game.startCombat === 'function') {
    orig.startCombat = Game.startCombat;
    Game.startCombat = function (monsterId) {
      let live = null;
      try {
        const tf = Game.tbfight || null;
        if (tf) {
          const fighters = Array.isArray(tf.fighters) ? tf.fighters : [];
          live = {
            fightId: tf.id || null,
            over: !!tf.over,
            monsterIds: fighters.filter(function (f) { return f && f.kind === 'monster' && f.mdef; }).map(function (f) { return f.mdef.id; }),
          };
        }
      } catch (e) { err('startCombat-liveFight', e); }
      const beforeLen = (t.tbStarts || []).length;
      let r;
      try { r = orig.startCombat.apply(this, arguments); } catch (e) { throw e; }
      try {
        if ((t.tbStarts || []).length === beforeLen + 1) {
          t.tbStarts[t.tbStarts.length - 1].liveFight = live;
        } else {
          err('startCombat-liveFight', new Error('inner wrap pushed ' + ((t.tbStarts || []).length - beforeLen) + ' rows, expected 1'));
        }
      } catch (e) { err('startCombat-liveFight', e); }
      return r;
    };
  } else { err('install.startCombat', new Error('not a function')); }

  // --- (b) playerDeath wrap mirroring the wilddeath instrument ---
  // Say ring (last 30 lines, any content), chained after the base
  // wraps; sayTail is the last 8. The death row is captured BEFORE
  // the original runs (succession changes the scholar id and tbEnd
  // clears tbfight in its finally AFTER the loss branch calls
  // playerDeath — so the live fight is still readable here).
  // parseStack / tbCtx / whereCtx are the wilddeath module's own
  // helpers, reused verbatim (not re-implemented).
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayRing.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 300) });
          if (sayRing.length > 30) sayRing.splice(0, sayRing.length - 30);
        }
      } catch (e) { err(fnName + '-ring', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  function sayTail() {
    try { return sayRing.slice(-8).map(function (x) { return { day: x.day, via: x.via, line: x.line }; }); }
    catch (e) { return []; }
  }

  if (typeof Game.playerDeath === 'function') {
    orig.playerDeath = Game.playerDeath;
    Game.playerDeath = function (cause) {
      let row = null;
      try {
        const stk = WILD.parseStack();
        const tb = WILD.tbCtx(Game);
        row = {
          day: dayOf(Game),
          causeArg: (cause === undefined) ? '<undefined>' : (cause === null ? '<null>' : String(cause)),
          site: stk.site, hasTbEnd: stk.hasTbEnd, stackFrames: stk.frames,
          tb: tb,
          where: WILD.whereCtx(Game),
          sayTail: sayTail(),
        };
        try {
          row.victimName = (typeof Game.displayName === 'function')
            ? Game.displayName(Game.villagerId) : null;
        } catch (e) { row.victimName = null; }
      } catch (e) { err('playerDeath-ctx', e); }
      let r;
      try { r = orig.playerDeath.apply(this, arguments); }
      finally {
        try {
          if (row) { row.afterOver = !!Game.over; t.playerDeaths.push(row); }
        } catch (e) { err('playerDeath-row', e); }
      }
      return r;
    };
  } else { err('install.playerDeath', new Error('not a function')); }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshot: base.snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf };
