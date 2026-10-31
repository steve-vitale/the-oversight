#!/usr/bin/env node
// waitsalign-sleep-probe-b.js — single-value sleep-threshold
// probe (sim-waitsalign-a). One node process = one harness
// instance (never two harnesses in one process).
// Usage: EVE=<evening dayTicks> SEED=<seed> node
//   scripts/waitsalign-sleep-probe-b.js
// Flow: loadGame + setupGame (the shared strand substrate's
// setup), advance the clock with tickAction in 32-tick chunks
// to EVE (no direct clock writes), then Game.sleep() exactly
// as the harness calls it, then 3 x doAction('wait') exactly
// as the harness's morning loop does. Prints ONE JSON line:
// eve, dayBefore/After sleep, dayTicks after sleep, dayTicks
// after each wait, sleepRefused (day unchanged + refusal
// line), morning (= dayTicks after the 3rd wait),
// interrupted (fight/encounter/game-over during the probe).
// POLICY-SIDE DIAG ONLY: zero src/js changes.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const EVE = parseInt(process.env.EVE || '451', 10);
  const SEED = parseInt(process.env.SEED || '15215', 10);
  const { Game } = await loadGame({ seed: SEED, mode: 'nighttravel-b', fullTelemetry: false, narration: true });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { sayLines.push(String(args[0] || '').slice(0, 300)); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const sch = Game.state.scholar || {};
  let cur = sch.dayTicks || 0;
  let interrupted = null;
  // Advance to EVE in 32-tick chunks (sleep-loop granularity).
  while (cur < EVE && !interrupted) {
    const step = Math.min(32, EVE - cur);
    try { Game.tickAction(step); } catch (e) { interrupted = 'tickAction:' + String(e.message).slice(0, 100); break; }
    cur = (Game.state.scholar || {}).dayTicks || 0;
    if (Game.over) interrupted = 'game-over';
    else if (Game.tbfight && !Game.tbfight.over) interrupted = 'fight';
    else if (Game.pendingEncounter) interrupted = 'encounter';
    else if ((Game.state.scholar || {}).day !== sch.day) interrupted = 'day-rolled-early';
  }
  const dayBefore = (Game.state.scholar || {}).day || 0;
  const ticksBeforeSleep = (Game.state.scholar || {}).dayTicks || 0;
  const sayBefore = sayLines.length;
  let sleepErr = null;
  try { Game.sleep(); } catch (e) { sleepErr = String(e.message).slice(0, 120); }
  const sleepLines = sayLines.slice(sayBefore);
  const refusalLine = sleepLines.find((l) => /too late for real sleep|Dawn's an hour off/i.test(l)) || null;
  const dayAfterSleep = (Game.state.scholar || {}).day || 0;
  const ticksAfterSleep = (Game.state.scholar || {}).dayTicks || 0;
  const waits = [];
  for (let i = 0; i < 3; i++) {
    if (Game.over || interrupted) { waits.push(null); continue; }
    try { Game.doAction('wait'); } catch (e) { waits.push(null); interrupted = 'wait:' + String(e.message).slice(0, 100); continue; }
    waits.push((Game.state.scholar || {}).dayTicks || 0);
    if (Game.over) interrupted = 'game-over-after-wait';
  }
  const morning = waits[2] === undefined ? null : waits[2];
  console.log(JSON.stringify({
    seed: SEED, eve: EVE, reachedTicks: ticksBeforeSleep,
    dayBefore, dayAfterSleep, dayRolledInSleep: dayAfterSleep !== dayBefore,
    ticksAfterSleep, waits, morning,
    sleepRefused: dayAfterSleep === dayBefore && refusalLine !== null,
    refusalLine: refusalLine ? refusalLine.slice(0, 160) : null,
    sleepErr, interrupted,
  }));
})().catch((e) => { console.error('WAITSALIGN PROBE CRASH', e && (e.stack || e)); process.exit(2); });
