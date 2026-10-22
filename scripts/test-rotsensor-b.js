#!/usr/bin/env node
// test-rotsensor-b.js — RED->GREEN + DET proof for the fixed-phase rot
// sensor (scripts/rotsensor-b.js, #817).
//
// RED:  the legacy dawn-phase scan (sleep wrap, AFTER the engine's call —
//        the starvechan phase) reads 0 on every narrated-rot day, on the
//        SAME run where the engine voices rot. Instrument silence, proved.
// GREEN: the fixed-phase sensor (sweepSpoiled before-call — the
//        fragilityfeast measure's phase) reads spoiledKcal > 0 on
//        narrated-rot days (pantry voice), and total swept rot > 0.
// DET:   instrumented (both sensors) vs pristine: compact outcome
//        projection byte-identical on the same seed (no RNG draws, no
//        state writes in the wraps). Uninstall restores original refs.
// REPEAT: same seed twice -> sweeps + voice byte-identical.
// UNIT:  drawSpoiled wrap tallies spoiled kcal eaten on a synthetic
//        spoiled pantry (call-through, no game-state touch).
//
// "Narrated-rot day" = a day where the engine's own say stream carries
// the pantry rot voice ("threw out spoiled stores ... (pantry)") —
// SENSE-TESTING LAW: the fiction, not the instrument, defines the day.
//
// Usage (ENV TRAP — read before running):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-rotsensor-b.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('PROOF STOP: FEASTSCALE_R13=1 required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const RS = require(path.join(REPO, 'scripts', 'rotsensor-b'));
const { belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));

const PROBE_SEEDS = [66101, 66102, 66103, 66104];
const DAYS = 100;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name + (extra ? ' — ' + extra : '')); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function projection(Game, result) {
  var dead = 0;
  try {
    var roster = ((Game.state || {}).village || {}).roster || [];
    for (var i = 0; i < roster.length; i++) {
      try { var p = Game.getPerson ? Game.getPerson(roster[i]) : null; if (p && p.dead) dead++; } catch (e) {}
    }
  } catch (e) {}
  var pan = 0;
  try {
    pan = (((Game.state || {}).village || {}).pantry || [])
      .reduce(function (t, it) { return t + ((it && it.kcalEach) || 0) * ((it && it.units) || 1); }, 0);
  } catch (e) {}
  return {
    days: result.days, endReason: result.endReason,
    gameDays: ((Game.state || {}).scholar || {}).day || 0,
    over: !!Game.over, dead: dead, pantryKcal: Math.round(pan),
  };
}

async function runWith(seed, installBoth) {
  const { Game } = await loadGame({ seed: seed, mode: 'rotsensor-proof', fullTelemetry: false });
  var oSweep = Game.sweepSpoiled, oSleep = Game.sleep, oSay = Game.say, oDS = Game.drawSpoiled;
  var inst = null, old = null;
  if (installBoth) {
    old = RS.installOldPhase(Game);
    inst = RS.installRotSensor(Game);
  }
  await setupGame(Game);
  var result;
  await quietLog(async () => { result = await runDays(Game, belongfeast, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  var proj = projection(Game, result);
  if (inst) inst.uninstall();
  if (old) old.uninstall();
  var restored = (Game.sweepSpoiled === oSweep) && (Game.sleep === oSleep) &&
                 (Game.say === oSay) && (Game.drawSpoiled === oDS);
  return { Game: Game, result: result, proj: proj, K: inst ? inst.K : null,
           OK: old ? old.K : null, restored: restored };
}

(async () => {
  // ---- PROBE: find a seed with >=1 pantry-rot-voice day ----
  console.log('PROBE: hunting a narrated-rot seed (pantry voice), ' + DAYS + 'd');
  var chosen = null, cr = null;
  for (var si = 0; si < PROBE_SEEDS.length; si++) {
    var seed = PROBE_SEEDS[si];
    var r = await runWith(seed, true);
    var pantryVoiceDays = (r.K.voice || []).filter(function (v) { return v.pantry; });
    console.log('  seed ' + seed + ': pantry-voice days=' + pantryVoiceDays.length +
      ', sweeps=' + r.K.sweeps.length + ', rotEaten=' + Math.round(r.K.rotEaten) +
      ', K.errors=' + r.K.errors.length);
    if (!chosen && pantryVoiceDays.length >= 1) { chosen = seed; cr = r; }
    if (chosen && si >= 1) break; // one spare seed for context, then stop burning
  }
  ok('probe found a narrated-rot seed', !!chosen, chosen ? 'seed ' + chosen : 'none in ' + PROBE_SEEDS.join(','));
  if (!chosen) { console.log('RESULT: ' + pass + '/' + (pass + fail) + ' — FAIL LOUDLY: no rot voice in probe'); process.exit(1); }

  var K = cr.K, OK = cr.OK;
  var voiceDays = {};
  (K.voice || []).forEach(function (v) { if (v.pantry) voiceDays[v.d] = true; });
  var voiceDayList = Object.keys(voiceDays).map(Number).sort(function (a, b) { return a - b; });

  // ---- RED: old-phase scan reads 0 on every narrated-rot day ----
  console.log('RED: legacy dawn-phase scan on narrated-rot days ' + JSON.stringify(voiceDayList));
  var oldOnVoice = (OK.rotDays || []).filter(function (rd) { return voiceDays[rd.d]; });
  ok('red: old-phase rows exist on voice days', oldOnVoice.length >= voiceDayList.length,
    oldOnVoice.length + ' rows / ' + voiceDayList.length + ' voice days');
  var oldAllZero = oldOnVoice.every(function (rd) { return rd.rotStock === 0; });
  ok('red: old-phase reads 0 on ALL narrated-rot days (instrument silence)',
    oldAllZero, 'max=' + Math.max.apply(null, oldOnVoice.map(function (rd) { return rd.rotStock; }).concat([0])));

  // ---- GREEN: fixed-phase sensor reads rot on narrated-rot days ----
  console.log('GREEN: fixed-phase sensor on narrated-rot days');
  var sweepsByDay = {};
  (K.sweeps || []).forEach(function (s) { sweepsByDay[s.d] = s; });
  var greenDays = voiceDayList.filter(function (d) {
    var s = sweepsByDay[d]; return s && s.spoiledKcal > 0;
  });
  ok('green: sensor>0 on >=1 narrated-rot day', greenDays.length >= 1,
    greenDays.length + '/' + voiceDayList.length + ' days, e.g. d' + (greenDays[0] || '?') +
    '=' + (greenDays[0] != null ? sweepsByDay[greenDays[0]].spoiledKcal : 0) + ' kcal');
  var totalSwept = (K.sweeps || []).reduce(function (t, s) { return t + (s.spoiledKcal || 0); }, 0);
  ok('green: total swept rot > 0 across the run', totalSwept > 0, Math.round(totalSwept) + ' kcal');
  // The fiction must match the instrument: every pantry voice day should
  // have a same-day sweep entry (the voice fires inside the sweep).
  var voiceCovered = voiceDayList.every(function (d) { return !!sweepsByDay[d]; });
  ok('green: every pantry-voice day has a same-day sweep record', voiceCovered);

  // ---- DET: instrumented vs pristine byte-identical projection ----
  console.log('DET: instrumented vs pristine, seed ' + chosen);
  var pr = await runWith(chosen, false);
  var detSame = JSON.stringify(cr.proj) === JSON.stringify(pr.proj);
  ok('det: outcome projection byte-identical (instrumented vs pristine)',
    detSame, JSON.stringify(cr.proj));
  ok('det: uninstall restores all 4 original refs (===)', cr.restored);

  // ---- REPEAT: same seed twice, sensor output identical ----
  console.log('REPEAT: seed ' + chosen + ' twice');
  var r2 = await runWith(chosen, true);
  var repSweeps = JSON.stringify(cr.K.sweeps) === JSON.stringify(r2.K.sweeps);
  var repVoice = JSON.stringify(cr.K.voice) === JSON.stringify(r2.K.voice);
  ok('repeat: sweeps byte-identical', repSweeps, cr.K.sweeps.length + ' sweeps');
  ok('repeat: voice lines byte-identical', repVoice, cr.K.voice.length + ' lines');
  if (r2.K) { /* instances GC'd with the run */ }

  // ---- UNIT: drawSpoiled wrap tallies on a synthetic spoiled pantry ----
  console.log('UNIT: drawSpoiled wrap on synthetic spoiled pantry');
  const g3 = await loadGame({ seed: 66105, mode: 'rotsensor-unit', fullTelemetry: false });
  const Game3 = g3.Game;
  await setupGame(Game3);
  var inst3 = RS.installRotSensor(Game3);
  var fakeV = { pantry: [
    { name: 'Old Acorns', kcalEach: 200, units: 3, spoilDay: 1 },
    { name: 'Fresh Berries', kcalEach: 100, units: 5, spoilDay: 99999 },
  ]};
  var got = Game3.drawSpoiled(fakeV, 10000, Game3.freshExposure());
  ok('unit: drawSpoiled eats spoiled kcal (call-through)', got === 600, 'got=' + got);
  ok('unit: rotEaten tallies the eaten kcal', Math.round(inst3.K.rotEaten) === 600,
    'rotEaten=' + Math.round(inst3.K.rotEaten));
  ok('unit: fresh stack untouched by drawSpoiled',
    fakeV.pantry.length === 1 && fakeV.pantry[0].name === 'Fresh Berries');
  inst3.uninstall();

  console.log('RESULT: ' + pass + '/' + (pass + fail) + (fail ? ' — FAIL LOUDLY' : ' — ALL GREEN'));
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error('PROOF CRASH: ' + (e && e.stack ? e.stack : e)); process.exit(1); });
