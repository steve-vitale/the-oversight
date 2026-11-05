// killersim-instrument-20261105.js — killer-simultaneity instrument
// (arm sim-killersim-a, run fleshout-loop-a-20261105T0915Z). Scripts only,
// zero src/js. Thin wrapper over secondkiller-instrument-20261105 (reused
// verbatim: wave-4+ fight wrappers, recordWaveKill killsLive rows,
// playerDeath context, daily snapshots with readiness5, killerTrack,
// finalize copies of waveKillLog + fallen + wavesFaced + scaleRank +
// unlockedWave + deadMap). EXTENDED with exactly the exit tracking no
// sibling instrument records:
//  - finalize ALSO copies state.village.exiles (the removal choke
//    point's record of every non-death exit: {vid, day, how} —
//    'exiled', 'fled', 'splinter', 'relay', 'ambushed', 'left').
//  - snapshot ALSO appends live derived fields to that day's entry:
//    livingKillersDerived (L(d) by the vetprod rule, but with
//    exitDay = min(deathDay, exileDay) — an exiled killer is no
//    longer a living roster veteran, so the interval ends at exit),
//    engineVets (readiness5.veterans at snapshot time), ready5,
//    scholarAtHaven.
// Wrappers never throw into game code: a recording failure is counted
// in instrumentErrors and the original call's result is returned
// untouched (inherited from the base instrument).
// Usage: const INST = require('./killersim-instrument-20261105');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';
const SECOND = require('./secondkiller-instrument-20261105');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function install(Game) {
  const base = SECOND.install(Game);
  const t = base.t;
  t.exilesSeen = [];

  function livingDerived() {
    // Live L(d): killers from waveKillLog (w>=4), firstDay per killer,
    // exitDay = earliest of fallen deathDay >= firstDay / exiles day >=
    // firstDay; living iff firstDay <= today < exitDay (exitDay null =
    // living through today). Same-day kill-and-exit contributes to NO day.
    const out = { living: null, killersEver: 0 };
    try {
      const today = dayOf(Game);
      const log = (((Game.state || {}).waveKillLog) || []).filter(function (e) { return ((e && e.w) | 0) >= 4 && e.by; });
      const fallen = (((Game.state || {}).village || {}).fallen) || [];
      const exiles = (((Game.state || {}).village || {}).exiles) || [];
      const first = {};
      log.forEach(function (e) { if (first[e.by] == null || (e.d | 0) < first[e.by]) first[e.by] = (e.d | 0); });
      const vids = Object.keys(first);
      out.killersEver = vids.length;
      let living = 0;
      vids.forEach(function (vid) {
        const fd = first[vid];
        let exit = null;
        fallen.forEach(function (f) {
          if (f.villagerId === vid && (f.day | 0) >= fd && (exit == null || (f.day | 0) < exit)) exit = (f.day | 0);
        });
        exiles.forEach(function (x) {
          if (x.vid === vid && (x.day | 0) >= fd && (exit == null || (x.day | 0) < exit)) exit = (x.day | 0);
        });
        if (fd <= today && (exit == null || today < exit)) living++;
      });
      out.living = living;
    } catch (e) { t.instrumentErrors.push('livingDerived: ' + String(e.message).slice(0, 80)); }
    return out;
  }

  function snapshot() {
    const snap = base.snapshot();
    try {
      const ld = livingDerived();
      snap.livingKillersDerived = ld.living;
      snap.killersEverLive = ld.killersEver;
      const r5 = snap.readiness5 || null;
      snap.engineVets = r5 ? (r5.veterans | 0) : null;
      snap.ready5 = r5 ? !!r5.ready : null;
      snap.scholarAtHaven = (snap.scholarAtHaven != null) ? snap.scholarAtHaven : null;
    } catch (e) { t.instrumentErrors.push('killersim-snapshot: ' + String(e.message).slice(0, 80)); }
    return snap;
  }

  function finalize() {
    const out = base.finalize();
    try { out.exiles = (((Game.state || {}).village || {}).exiles || []).slice(); } catch (e) { out.exiles = null; t.instrumentErrors.push('exiles-final: ' + String(e.message).slice(0, 80)); }
    return out;
  }

  function uninstall() { base.uninstall(); }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall, _helpers: { livingDerived: livingDerived } };
}

module.exports = { install: install };
