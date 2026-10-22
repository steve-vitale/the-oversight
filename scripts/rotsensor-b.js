// rotsensor-b.js — fixed-phase rot sensor instrument (#817).
//
// The dawn rot scan in starvechan-instrument-b.js wraps Game.sleep AFTER the
// engine's call — but sweepSpoiled() discards rot INSIDE the dawn sequence
// (game.js:30900, inside sleep()). The scan raced the sweep and read 0
// across 16 runs while the game narrates rot ("White Oak Acorns went bad").
// The `rot` channel boolean could never fire: instrument silence, not
// evidence of absence (evidence/2026-10-22/sim-deathcause-b.md, metric
// review item 4; hidden_files/sim-findings.md #817).
//
// FIX: wrap Game.sweepSpoiled with a BEFORE-call scan of the village pantry
// — the fragilityfeast measure's phase (scripts/measure-fragilityfeast-b.js).
// The sensor reads the pantry as the sweep sees it, before anything is
// discarded. Instrument-only: ZERO src/js changes, zero game-state writes,
// zero Math.random draws. Pure reads in the gaps of a call-through wrap.
//
// Usage (node):
//   const RS = require('./scripts/rotsensor-b');
//   const inst = RS.installRotSensor(Game);   // fixed phase
//   const old  = RS.installOldPhase(Game);    // legacy broken phase (proof only)
//   ... run ...
//   const K = inst.K;                          // sweeps, voice, rotEaten
//   inst.uninstall(); old.uninstall();
//
// Env: none. The instrument is substrate-neutral.
'use strict';

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; }
  catch (e) { return 0; }
}

// Pure read: spoiled kcal currently sitting in the village pantry, split
// fresh vs preserved (same split as the fragilityfeast measure).
function pantrySpoiledKcal(Game) {
  var fresh = 0, pres = 0, names = [];
  try {
    var pantry = ((Game.state || {}).village || {}).pantry || [];
    for (var i = 0; i < pantry.length; i++) {
      var it = pantry[i];
      if (!it) continue;
      var sp = false;
      try { sp = Game.isSpoiled ? !!Game.isSpoiled(it) : false; } catch (e) {}
      if (!sp) continue;
      var k = (it.kcalEach || 0) * (it.units || 1);
      if (!(k > 0)) continue;
      if (it.foodState === 'preserved' || it.foodState === 'rendered' ||
          (it.foodKind || '') === 'pemmican') pres += k;
      else fresh += k;
      var nm = it.name || 'something';
      if (names.indexOf(nm) < 0) names.push(nm);
    }
  } catch (e) {}
  return { fresh: fresh, pres: pres, names: names };
}

function pantryKcal(Game) {
  try {
    return (((Game.state || {}).village || {}).pantry || [])
      .reduce(function (t, i) { return t + ((i && i.kcalEach || 0) * (i && i.units || 1)); }, 0);
  } catch (e) { return 0; }
}

// installRotSensor(Game) -> { K, uninstall }. K:
//   sweeps: [{d, spoiledFresh, spoiledPres, spoiledKcal, names[],
//             pantryBefore, pantryAfter}] — one entry per sweepSpoiled call
//   voice:  [{d, line, pantry}] — rot narration captured from the say stream
//           (pantry=true for the village's "(pantry)" voice)
//   rotEaten: spoiled kcal eaten in desperation via drawSpoiled (after-call)
//   errors:  instrument-internal errors (never game errors)
function installRotSensor(Game) {
  var K = { sweeps: [], voice: [], rotEaten: 0, errors: [] };
  var wrapped = [];
  function pushErr(m) {
    K.errors.push(m);
    if (K.errors.length > 50) K.errors.shift();
  }
  function wrap(name, maker) {
    var o = Game[name];
    if (typeof o !== 'function') { pushErr('wrap-missing: ' + name); return; }
    wrapped.push([name, o]);
    Game[name] = maker(o);
  }

  // THE FIX (#817): before-call scan — the pantry as the sweep sees it.
  wrap('sweepSpoiled', function (oSweep) {
    return function () {
      var d = gday(Game), before = 0, sc = null;
      try { before = pantryKcal(Game); sc = pantrySpoiledKcal(Game); }
      catch (e) { pushErr('pre-scan: ' + String((e && e.message) || e)); }
      var r, threw = null;
      try { r = oSweep.apply(this, arguments); }
      catch (e) { threw = e; }
      try {
        var after = pantryKcal(Game);
        var sf = sc ? sc.fresh : 0, sp = sc ? sc.pres : 0;
        K.sweeps.push({
          d: d,
          spoiledFresh: Math.round(sf), spoiledPres: Math.round(sp),
          spoiledKcal: Math.round(sf + sp),
          names: sc ? sc.names : [],
          pantryBefore: Math.round(before), pantryAfter: Math.round(after),
        });
      } catch (e) { pushErr('record: ' + String((e && e.message) || e)); }
      if (threw) throw threw;
      return r;
    };
  });

  // Rot narration capture: the village's pantry voice ("threw out spoiled
  // stores: ... (pantry)") and the scholar's pack voice ("went bad —
  // beyond saving"). Lets the proof define "narrated-rot days" from the
  // engine's own fiction, not the instrument's numbers.
  wrap('say', function (oSay) {
    return function (line) {
      var r = oSay.apply(this, arguments);
      try {
        var s = String(line == null ? '' : line);
        if (s.indexOf('threw out spoiled stores') >= 0 ||
            s.indexOf('went bad \u2014 beyond saving') >= 0) {
          K.voice.push({ d: gday(Game), line: s.slice(0, 220),
            pantry: s.indexOf('(pantry)') >= 0 });
        }
      } catch (e) {}
      return r;
    };
  });

  // drawSpoiled after-call (unchanged from the starvechan channel): spoiled
  // kcal EATEN in desperation, not lost. Proves the desperation path fires.
  wrap('drawSpoiled', function (oDS) {
    return function () {
      var r = oDS.apply(this, arguments);
      try { var k = Number(r); if (k > 0) K.rotEaten += k; }
      catch (e) {}
      return r;
    };
  });

  function uninstall() {
    for (var i = wrapped.length - 1; i >= 0; i--) {
      try { Game[wrapped[i][0]] = wrapped[i][1]; } catch (e) {}
    }
    wrapped.length = 0;
  }
  return { K: K, uninstall: uninstall };
}

// installOldPhase(Game) -> { K, uninstall }. Replicates the BROKEN
// starvechan dawn scan (sleep wrap, AFTER the engine's call) for the RED
// leg of the proof: on the same run it must read 0 on narrated-rot days.
// Proof-only — never ship this phase in a sweep.
function installOldPhase(Game) {
  var K = { rotDays: [] };
  var oSleep = Game.sleep;
  if (typeof oSleep === 'function') {
    Game.sleep = function () {
      var r, threw = null;
      try { r = oSleep.apply(this, arguments); }
      catch (e) { threw = e; }
      try {
        var sc = pantrySpoiledKcal(Game);
        K.rotDays.push({ d: gday(Game), rotStock: Math.round(sc.fresh + sc.pres) });
      } catch (e) {}
      if (threw) throw threw;
      return r;
    };
  }
  function uninstall() {
    try { Game.sleep = oSleep; } catch (e) {}
  }
  return { K: K, uninstall: uninstall };
}

module.exports = {
  installRotSensor: installRotSensor,
  installOldPhase: installOldPhase,
  pantrySpoiledKcal: pantrySpoiledKcal,
};
