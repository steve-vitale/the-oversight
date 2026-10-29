#!/usr/bin/env node
// creekpath-transcript-armc-b.js — sense-test instrument for Arm C.
// Runs competent + thief grant + trip-home detour gate on one seed and
// prints, for each day, the evening tile plus the day's captured narration
// and travel steps, so a routed-return evening can be READ for meaning,
// not just counted. Display-only wrappers (say/sysSay/travelTo logging);
// trajectories are the same substrate as the judged legs.
// Env: SEED (default 10757), DAYS (default 30), SHOWDAYS (comma list of
// loop-days to print in full; default: all days with standingHomeDays>0).
// Harness gates: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
// GRANT_THIEF=1 COMPETENT_TRIPHOME_ROUTE_AROUND=1 (asserted FATAL here).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');

for (const [k, v] of [['COMPETENT_FEAST', '0'], ['SEATDRIVE', '0'], ['PLENTYDEPRI', '0'], ['DEPOSITGATE', '1'], ['GRANT_THIEF', '1'], ['COMPETENT_TRIPHOME_ROUTE_AROUND', '1'], ['COMPETENT_STANDING_HOME', '1']]) {
  if (process.env[k] !== v) { console.error(`FATAL: ${k}=${v} must be set explicitly`); process.exit(2); }
}
const SEED = parseInt(process.env.SEED || '10757', 10);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const SHOW = process.env.SHOWDAYS ? process.env.SHOWDAYS.split(',').map((s) => parseInt(s.trim(), 10)) : null;

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'creekpath-armc-transcript', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const s = Game.state.scholar;
  const abs = (s.abilities || []);
  if (!abs.some((a) => (a.id || a) === 'thief')) abs.push({ id: 'thief', level: 1 });
  s.abilities = abs;
  console.log('grantThief=' + !!Game.hasAbility('thief'));
  const lines = [];
  const origSay = Game.say, origSys = Game.sysSay, origTravel = Game.travelTo;
  Game.say = function () { try { lines.push('say: ' + Array.prototype.slice.call(arguments).join(' ')); } catch (e) {} return origSay && origSay.apply(Game, arguments); };
  Game.sysSay = function () { try { lines.push('sys: ' + Array.prototype.slice.call(arguments).join(' ')); } catch (e) {} return origSys && origSys.apply(Game, arguments); };
  Game.travelTo = function (x, y) { const r = origTravel.apply(Game, arguments); try { lines.push(`travel->(${x},${y}) now=(${Game.map.px},${Game.map.py})` + (r && r.blockType ? ` REFUSED ${r.blockType}` : '')); } catch (e) {} return r; };
  const base = require('./policies/competent');
  const basePolicy = base.competent;
  let callIdx = 0;
  const rows = [];
  const policy = Object.assign({}, basePolicy, {
    daily(Game2, ctx) {
      callIdx++;
      const mark = lines.length;
      const detBefore = (ctx && ctx.tripHomeDetours) || 0;
      const standBefore = (ctx && ctx.standingHomeDays) || 0;
      const standDetBefore = (ctx && ctx.standingHomeDetours) || 0;
      basePolicy.daily(Game2, ctx);
      const dayLines = lines.slice(mark);
      rows.push({ day: callIdx, tile: (() => { try { const t = Game2.playerTile(); return t ? t.type : null; } catch (e) { return null; } })(),
        pos: '(' + Game2.map.px + ',' + Game2.map.py + ')', detours: ((ctx && ctx.tripHomeDetours) || 0) - detBefore,
        standingDays: ((ctx && ctx.standingHomeDays) || 0) - standBefore,
        standingDetours: ((ctx && ctx.standingHomeDetours) || 0) - standDetBefore, lines: dayLines });
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  console.log(`seed=${SEED} daysAlive=${result.days} end=${result.endReason}`);
  for (const r of rows) {
    const show = SHOW ? SHOW.includes(r.day) : (r.standingDays > 0);
    console.log(`day ${r.day}: ${r.tile} ${r.pos} detours=${r.detours} standingDays=${r.standingDays} standingDetours=${r.standingDetours}`);
    if (show) for (const l of r.lines) console.log('    ' + l.slice(0, 300));
  }
}
main().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
