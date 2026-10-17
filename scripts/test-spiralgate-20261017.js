#!/usr/bin/env node
// scripts/test-spiralgate-20261017.js — sim-spiralgate-b proof (RED->GREEN).
//
// sim-findings #457: the "STARVING: health and energy falling. The spiral
// has started." beat fired on day 1 while the village was still
// establishing — alarm where the fiction is an empty stomach on arrival.
// The fix (engine/calories.js) gates the spiral FRAMING behind the second
// consecutive starving night; the hunger STATE (STARVING:/WARNING, damage,
// killedBy) is untouched. Voice-only, zero RNG draws in the voice path.
//
// PART 0 (RED, executes the PRISTINE module): first-tick hunger fires the
//   spiral alarm on the pre-fix tree.
// PART A (GREEN fixtures on the fixed tree): first tick -> honest framing
//   without spiral language; second consecutive tick -> spiral alarm;
//   fed night resets; WARNING telegraph intact.
// PART B (det-gate): pristine vs fixed module trajectories are byte-
//   identical except the new hungerNights counter; no Math.random in the
//   file (voice path RNG scan).
// PART C (real-sim wiring): the beats actually voice through endDay on the
//   fixed tree; no pre-gate spiral beats in the wild.
//
// Usage: node scripts/test-spiralgate-20261017.js
// Exit 0 only when every applicable part passes.
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let fails = [];
function ok(cond, name, extra) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) fails.push(name);
}

// Pristine base: the tree this work started from (before the spiralgate
// fix). The RED part executes THIS, not HEAD (which carries the fix).
const SPIRALGATE_BASE = process.env.SPIRALGATE_BASE || 'ab046665286a47d7ea3ed0a100ef7add86fb214e';

function loadModuleFromSource(src) {
  const sandbox = {};
  vm.runInNewContext(src, sandbox, { filename: 'calories-fixture.js' });
  return sandbox.Scattering.calories;
}
function pristineModule() {
  const src = execSync(`git -C "${ROOT}" show ${SPIRALGATE_BASE}:src/js/engine/calories.js`,
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  return loadModuleFromSource(src);
}
function fixedModule() {
  return loadModuleFromSource(fs.readFileSync(path.join(ROOT, 'src/js/engine/calories.js'), 'utf8'));
}
function scholar(kcal, extra) {
  return Object.assign({ kcal, hydration: 100, energy: 100, health: 100, injuries: [] }, extra || {});
}
// dailyNeed = 2200 (no injuries), hydrationBurn = 30+12 = 42 (temperate, 0 ticks).
const OPTS = { weather: 'temperate', dayTicks: 0 };

// ---------------- PART 0: RED (pristine module executes) ----------------
function part0() {
  console.log('== PART 0: RED — pristine module, first-tick hunger ==');
  const cal = pristineModule();
  // day-1 arrival: the scholar shows up with 0 reserves.
  const s = scholar(0);
  const res = cal.resolveDay(s, {}, OPTS);
  ok(res.warnings.some(w => /spiral has started/i.test(w)),
    'RED-457: pristine fires "The spiral has started." on the FIRST starving night', res.warnings[0]);
  ok(!('hungerNights' in s), 'RED-457: pristine has no hungerNights ledger (nothing gates the alarm)');
  // the damage itself is real on pristine — the blank is framing, not state
  ok(s.health < 100 && s.energy === 75,
    'RED-457: pristine starvation damage is real (health down, energy -25)',
    `health=${s.health.toFixed(1)} energy=${s.energy}`);
}

// ---------------- PART A: GREEN fixtures (fixed module) ----------------
function partA() {
  console.log('== PART A: GREEN fixtures — the gate ==');
  const cal = fixedModule();

  // night 1: starving, first tick -> honest framing, no spiral language
  let s = scholar(0);
  let res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 1, 'A1: first starving night counts hungerNights=1');
  ok(res.warnings.some(w => /STARVING:/.test(w) && !/spiral has started/i.test(w)),
    'A1: first tick keeps the STARVING: state report (honest, not silent)', res.warnings[0]);
  ok(res.warnings.some(w => /health and energy falling/.test(w)),
    'A1: first tick still reports the damage honestly');
  ok(s.health < 100 && s.energy === 75,
    'A1: the underlying starvation damage is UNCHANGED by the gate',
    `health=${s.health.toFixed(1)} energy=${s.energy}`);

  // night 2: starving again, consecutive -> the spiral alarm is earned
  s.kcal = 0; s.hydration = 100;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 2, 'A2: second consecutive starving night counts hungerNights=2');
  ok(res.warnings.some(w => /spiral has started/i.test(w)),
    'A2: second consecutive starving night fires the spiral framing', res.warnings[0]);

  // night 3: still starving -> spiral language persists
  s.kcal = 0; s.hydration = 100;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 3 && res.warnings.some(w => /spiral has started/i.test(w)),
    'A3: sustained hunger keeps the spiral framing (nights 3+)');

  // a fed night breaks the spiral: no damage, counter resets, telegraph fires
  s.kcal = 2400; s.hydration = 100; // 2400-2200 = 200 < 500 -> WARNING, not STARVING
  const hBefore = s.health;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 0, 'A4: a non-starving night resets hungerNights to 0');
  ok(res.warnings.some(w => /WARNING: reserves critical/.test(w)),
    'A4: the reserve telegraph still fires (before-the-spiral warning intact)');
  ok(!res.warnings.some(w => /STARVING:/.test(w)), 'A4: no STARVING state on a fed night');
  ok(s.health === hBefore, 'A4: no starvation damage on a fed night', `health=${s.health.toFixed(1)} unchanged`);

  // hunger returns after the break -> first-tick framing again, not the alarm
  s.kcal = 0; s.hydration = 100;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 1, 'A5: hunger after a fed night restarts at 1');
  ok(res.warnings.some(w => /STARVING:/.test(w) && !/spiral has started/i.test(w)),
    'A5: broken-streak hunger gets the honest framing, not the alarm', res.warnings[0]);

  // deep-fed night (kcal >= 500 after burn): silence is honest, counter reset
  s.kcal = 4000; s.hydration = 100;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 0 && res.warnings.length === 0,
    'A6: a well-fed night resets the counter with no warning at all');

  // MANTLE: the bearer changes mid-streak (the mantle passes by mutating
  // the scholar object in place — ledger.js playerDeath / mantleBecome).
  // The new bearer is a new stomach: no inherited spiral alarm.
  s.villagerId = 'giulia_bianchi';
  s.kcal = 0; s.hydration = 100;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 1 && !/spiral has started/i.test(res.warnings[0]),
    'A7: giulia night 1 — honest framing');
  s.kcal = 0; s.hydration = 100;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 2 && /spiral has started/i.test(res.warnings[0]),
    'A7: giulia night 2 — the spiral is earned');
  s.villagerId = 'nino_kapanadze'; // the mantle passes: same object, new person
  s.kcal = 0; s.hydration = 100;
  res = cal.resolveDay(s, {}, OPTS);
  ok(s.hungerNights === 1, 'A7: mantle transfer restarts hungerNights at 1');
  ok(res.warnings.some(w => /STARVING:/.test(w) && !/spiral has started/i.test(w)),
    'A7: the new bearer gets the honest first-tick framing, not the inherited alarm', res.warnings[0]);
}

// ---------------- PART B: det-gate ----------------
function partB() {
  console.log('== PART B: det-gate — pristine vs fixed trajectories ==');
  const src = fs.readFileSync(path.join(ROOT, 'src/js/engine/calories.js'), 'utf8');
  ok(!/Math\.random/.test(src), 'B: no Math.random anywhere in calories.js (zero RNG draws in the voice path)');

  const oldM = pristineModule();
  const newM = fixedModule();
  // scripted 6-night trajectory: starve, starve, feed, warn, starve, feed.
  // starts: [0, 0, 2600, 2400, 0, 4000] kcal at bedtime.
  const starts = [0, 0, 2600, 2400, 0, 4000];
  // villagerId set so the fixed module's mantle stamp exercises (pristine
  // has no stamp; the det-gate allows the two new ledger fields).
  const so = scholar(starts[0], { villagerId: 'test_bearer' });
  const sn = scholar(starts[0], { villagerId: 'test_bearer' });
  let trajIdentical = true, onlyDiff = null;
  for (let i = 0; i < starts.length; i++) {
    if (i > 0) { so.kcal = starts[i]; sn.kcal = starts[i]; so.hydration = sn.hydration = 100; }
    const ro = oldM.resolveDay(so, {}, OPTS);
    const rn = newM.resolveDay(sn, {}, OPTS);
    const ko = Object.keys(so).sort(), kn = Object.keys(sn).sort();
    const extraNew = kn.filter(k => !ko.includes(k));
    const shared = ko.filter(k => kn.includes(k));
    for (const k of shared) {
      if (JSON.stringify(so[k]) !== JSON.stringify(sn[k])) { trajIdentical = false; onlyDiff = `night${i + 1}.${k}`; }
    }
    if (extraNew.length === 0 || !extraNew.every(k => ['hungerNights', '_hungerVid'].includes(k))) { trajIdentical = false; onlyDiff = `night${i + 1}.newfields=${extraNew}`; }
    if (ro.ok !== rn.ok || ro.killedBy !== rn.killedBy) { trajIdentical = false; onlyDiff = `night${i + 1}.outcome`; }
  }
  ok(trajIdentical, 'B: state trajectories byte-identical except the new hungerNights ledger',
    onlyDiff ? 'DIFF AT ' + onlyDiff : '6-night trajectory, all shared fields equal');
  ok(!('hungerNights' in so) && ('hungerNights' in sn) && ('_hungerVid' in sn),
    'B: ledger (hungerNights + _hungerVid) exists only on the fixed module (pristine untouched by reads)');

  // warnings framing diff is the ONLY voice diff
  const w = scholar(0);
  const wo = oldM.resolveDay(scholar(0), {}, OPTS).warnings;
  const wn = newM.resolveDay(w, {}, OPTS).warnings;
  ok(wo.length === wn.length && /spiral has started/i.test(wo[0]) && !/spiral has started/i.test(wn[0]),
    'B: night-1 voice diff is framing only (alarm -> honest empty-stomach line)');
}

// ---------------- PART C: real-sim wiring ----------------
async function partC() {
  console.log('== PART C: real-sim wiring (fixed tree, belongfeast, 40d) ==');
  const FS = require('./policies/feastscale');
  const sayBuf = [];
  await quietLog(async () => {
    const { Game } = await loadGame({ seed: 1103, mode: 'spiralgate-proof' });
    await setupGame(Game);
    const oSay = Game.say;
    Game.say = function (t) {
      try {
        const s = Game.state.scholar || {};
        sayBuf.push({ day: s.day || 0, vid: s.villagerId || Game.villagerId || '?', text: String(t).slice(0, 300) });
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
    try { await runDays(Game, FS.belongfeast, { days: 40, sampleEvery: 1 }); }
    finally { Game.say = oSay; }
  });
  const starving = sayBuf.filter(b => /STARVING:/.test(b.text));
  const lastDay = {};
  let preGateSpiral = 0, postGateSpiral = 0, preGateHonest = 0;
  starving.sort((a, b2) => a.day - b2.day);
  for (const s of starving) {
    const key = String(s.vid);
    const preGate = lastDay[key] !== s.day - 1;
    lastDay[key] = s.day;
    if (/spiral has started/i.test(s.text)) { if (preGate) preGateSpiral++; else postGateSpiral++; }
    else if (preGate) preGateHonest++;
  }
  console.log(`  starving beats: ${starving.length}, preGateSpiral=${preGateSpiral}, postGateSpiral=${postGateSpiral}, preGateHonest=${preGateHonest}`);
  ok(starving.length > 0, 'C: starving beats fired in the sim (wiring live)');
  ok(preGateSpiral === 0, 'C: ZERO pre-gate "spiral has started" beats in the wild');
  if (starving.length > 0) {
    ok(preGateHonest > 0 || postGateSpiral > 0,
      'C: first-tick beats carry the honest framing in the wild', `preGateHonest=${preGateHonest}`);
    if (preGateHonest > 0) {
      const sample = starving.find(s => !/spiral has started/i.test(s.text));
      console.log('  first-tick framing sample: ' + (sample ? sample.text : '(n/a)'));
    }
  }
}

(async () => {
  try {
    part0();
    partA();
    partB();
    await partC();
  } catch (e) { console.error('HARNESS ERROR: ' + (e && e.stack || e)); fails.push('harness'); }
  console.log(`\n${fails.length ? 'RED/FAIL' : 'GREEN'} — ${fails.length} failure(s)${fails.length ? ': ' + fails.join('; ') : ''}`);
  process.exit(fails.length ? 1 : 0);
})();
