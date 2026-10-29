#!/usr/bin/env node
// debug-adjacenttile-10772.js — DIAGNOSTIC ONLY (not a judged leg).
// Replays seed 10772 for 12 days under the after-guard config and prints
// the captured narration lines for gameDays 9-11, so the sense-test can
// judge whether the rescued evenings read as a real return home.
// Capture wraps Game.emit (the single text stream); the Game.log ring
// holds only the last 40 lines, so per-day capture must wrap emit.
// Substrate identical to the trace driver: GRANT_THIEF=1, FATAL gates,
// COMPETENT_TRIPHOME_ROUTE_AROUND=1, COMPETENT_STANDING_HOME=<env, default 1>.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }

async function main() {
  // narration:true keeps say/sysSay live (harness silences them by default);
  // say() only writes the log ring, so this diagnostic replay's trajectory
  // must match the judged after-pilot corpus for 10772 evening by evening.
  const { Game } = await loadGame({ seed: 10772, mode: 'adjacenttile-debug', fullTelemetry: false, narration: true });
  await setupGame(Game);
  if (process.env.GRANT_THIEF === '1') {
    try {
      const s = Game.state.scholar;
      const abs = (s.abilities || []);
      if (!abs.some((a) => (a.id || a) === 'thief')) abs.push({ id: 'thief', level: 1 });
      s.abilities = abs;
    } catch (e) {}
  }
  const byDay = {};
  let emitCalls = 0;
  console.log('emit typeof before wrap: ' + typeof Game.emit);
  const origEmit = Game.emit.bind(Game);
  Game.emit = function (text, surface) {
    emitCalls++;
    try {
      const d = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0;
      (byDay[d] = byDay[d] || []).push(`[${surface || 'narration'}] ${String(text)}`);
    } catch (e) {}
    return origEmit(text, surface);
  };
  const base = require('./policies/competent');
  const basePolicy = base.competent || base;
  let callIdx = 0;
  const evenings = [];
  const policy = Object.assign({}, basePolicy, {
    daily(Game2, ctx) {
      callIdx++;
      const prevStanding = (ctx && ctx.standingHomeDays) || 0;
      basePolicy.daily(Game2, ctx);
      const sch = (Game2.state || {}).scholar || {};
      const stood = ((ctx && ctx.standingHomeDays) || 0) - prevStanding;
      // NOTE: runDays silences console.log inside the day loop (quietLog),
      // so evenings must be recorded and printed AFTER runDays returns.
      evenings.push(`EVENING loopDay=${callIdx} gameDay=${sch.day} pos=(${Game2.map ? Game2.map.px : '?'}${','}${Game2.map ? Game2.map.py : '?'}) ` +
        `kcal=${Math.round(sch.kcal || 0)} standingFired=${stood} over=${!!Game2.over}`);
    },
  });
  await runDays(Game, policy, { days: 12, manifest: null });
  console.log('emitCalls=' + emitCalls + ' byDay keys=' + Object.keys(byDay).sort((a, b) => a - b).join(','));
  for (const line of evenings) console.log(line);
  for (const d of [9, 10, 11, 12]) {
    console.log(`\n===== gameDay ${d} narration (${(byDay[d] || []).length} lines) =====`);
    for (const line of (byDay[d] || [])) console.log(line);
  }
}
main().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
