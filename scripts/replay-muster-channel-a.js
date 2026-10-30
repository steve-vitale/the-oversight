// replay-muster-channel-a — focused replay, NOT a judged sweep.
// Loads one seed, runs the tableseat-nowait policy (bare, no
// recorders), and logs every startCombat call's argument plus the
// pending-encounter state at that moment, to pin the FACE CHANNEL
// of the seed-75123 day-84 Herald refusals (worldOrigin None,
// tile 4,4, no herald in the census).
// Usage: SEEDS not used. node scripts/replay-muster-channel-a.js [seed] [days] [outJson]
// Env: LEANLINKRESCUE=1 TABLESEATNOWAIT=1 (same policy gates as the
// muster sweep). No game code is touched; the startCombat wrap
// delegates and only logs.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

async function main() {
  const seed = parseInt(process.argv[2] || '75123', 10);
  const days = parseInt(process.argv[3] || '85', 10);
  const outPath = process.argv[4] || path.join(REPO, 'evidence', '2026-10-30', 'perseed-muster-a', 'replay-s' + seed + '.json');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'chainclose-a-pilot', fullTelemetry: false });
  await setupGame(Game);
  const log = [];
  const origStart = Game.startCombat;
  Game.startCombat = function () {
    const s = (Game.state || {}).scholar || {};
    let entry = { day: s.day || 0, arg: arguments.length ? String(arguments[0]) : null,
      feastDraw: s.feastDraw ? { monsterId: s.feastDraw.monsterId, day: s.feastDraw.day } : null,
      pendingEncounter: !!Game.pendingEncounter, pendingMonsterId: Game.pendingMonsterId || null,
      omenStage: null, musterExists: false };
    try {
      const tt = Game.state.titans || {};
      entry.omenStage = (tt.omens && tt.omens.herald) ? tt.omens.herald.stage : null;
      entry.musterExists = !!(tt.musters && tt.musters.herald);
    } catch (e) { void e; }
    log.push(entry);
    return origStart.apply(this, arguments);
  };
  const origFace = Game.faceFeastDraw;
  if (typeof origFace === 'function') {
    Game.faceFeastDraw = function () {
      const s = (Game.state || {}).scholar || {};
      log.push({ day: s.day || 0, arg: 'faceFeastDraw-call', feastDraw: s.feastDraw ? { monsterId: s.feastDraw.monsterId } : null });
      return origFace.apply(this, arguments);
    };
  }
  const result = await runDays(Game, tableseatNowait, { days, manifest: undefined, sampleEvery: 10 });
  const heraldCalls = log.filter(function (e) { return e.arg === 'herald'; });
  const out = { seed, days: result.days, endReason: result.endReason,
    startCombatCalls: log.length, heraldCalls: heraldCalls,
    faceFeastDrawCalls: log.filter(function (e) { return e.arg === 'faceFeastDraw-call'; }) };
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('seed', seed, 'days', result.days, 'end', result.endReason);
  console.log('startCombat calls:', log.length, 'herald calls:', heraldCalls.length);
  for (const h of heraldCalls) console.log('  HERALD-CALL', JSON.stringify(h));
  console.log('wrote', outPath);
}
main().catch(function (e) { console.error(e); process.exit(1); });
