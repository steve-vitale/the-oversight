// bankkiller-instrument-20261105.js — rally-the-line instrument
// (arm sim-bankkiller-b, run fleshout-loop-b-20261105T2130Z). Scripts only,
// zero src/js. Pure-read wrappers + daily snapshots + killer tracking; zero
// game-state writes, zero RNG draws. Wrappers never throw into game code: a
// recording failure is counted in instrumentErrors and the original call's
// result is returned untouched.
//
// This module REUSES the killerdeath instrument verbatim (require, not a
// copy) and adds exactly one wrap:
//   tbPlayerRally — every rally call is recorded (day, round, allies
//   present in the fight, live wave-4+ monsters, return value), so the
//   probe's application is observable from the engine call, independent
//   of the policy's own counters (which the driver also captures per seed
//   via resetBankkillerStats/bankkillerStats).
// Usage: const INST = require('./bankkiller-instrument-20261105');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';
const KD = require('./killerdeath-instrument-20261105');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function install(Game) {
  const kd = KD.install(Game);
  const t = kd.t;
  t.rallyCalls = [];

  const origRally = Game.tbPlayerRally;
  if (typeof origRally === 'function') {
    Game.tbPlayerRally = function () {
      let rec = null;
      try {
        const f = Game.tbfight;
        let allies = 0, w4 = 0, w4mids = [];
        try {
          (f && f.fighters ? f.fighters : []).forEach(function (o) {
            if (!o || !o.alive || o.fled) return;
            if ((o.kind === 'ally' || o.kind === 'villager') && o.key !== 'p') allies++;
            if ((o.kind === 'monster' || o.kind === 'hostile')) {
              const w = (o.mdef && o.mdef.wave != null) ? (o.mdef.wave | 0) : null;
              if (w != null && w >= 4) { w4++; w4mids.push(o.mdef ? o.mdef.id : (o.monsterId || '?')); }
            }
          });
        } catch (e2) {}
        rec = { day: dayOf(Game), round: (f && f.round) || null, allies: allies,
          w4monsters: w4, w4mids: w4mids, result: null };
      } catch (e) { t.instrumentErrors.push('tbPlayerRally-ctx: ' + String(e.message).slice(0, 80)); }
      let ret;
      try { ret = origRally.apply(this, arguments); }
      catch (e) { throw e; }
      try { if (rec) { rec.result = !!ret; t.rallyCalls.push(rec); } } catch (e) { t.instrumentErrors.push('tbPlayerRally-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('tbPlayerRally-missing'); }

  const origUninstall = kd.uninstall;
  kd.uninstall = function () {
    try { if (typeof origRally === 'function') Game.tbPlayerRally = origRally; } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };
  return kd;
}

module.exports = { install: install };
