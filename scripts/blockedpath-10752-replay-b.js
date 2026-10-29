#!/usr/bin/env node
// blockedpath-10752-replay-b.js — trip-clearance vs hop-refusal trace
// for creekpath Arm C seed 10752 day 12 (MEASUREMENT ONLY).
//
// Replays the creekpath Arm C substrate (competent + thief grant +
// COMPETENT_TRIPHOME_ROUTE_AROUND=1) in two modes:
//   MODE=before: COMPETENT_STANDING_HOME unset (Arm C before leg)
//   MODE=after:  COMPETENT_STANDING_HOME=1 (Arm C after leg)
// and records, for loop-days 1..14, every Game.clearBlockage call
// (tile, blockFrom before, player position before, return) and every
// 'clear the rubble' say line, plus the end-of-day blockFrom at
// (2,4) and the non-destructive direct-hop probe home. The question
// it settles: did the day-12 trip clear the SAME (2,4) rubble the
// evening hop then hit, a different tile's rubble, or nothing — and
// is the (2,4) blockage still present at evening?
// Display/call wrappers only; no trajectory steering.
// Env (asserted FATAL): COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
// DEPOSITGATE=1 GRANT_THIEF=1 COMPETENT_TRIPHOME_ROUTE_AROUND=1
//   MODE=before|after  DAYS=14 (default)  OUT (default
//   evidence/2026-10-29/sim-blockedpath-diag-b-10752.json)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { directHopBlockage, bfsRouteAround } = require('./creekpath-probe-b');

for (const [k, v] of [['COMPETENT_FEAST', '0'], ['SEATDRIVE', '0'], ['PLENTYDEPRI', '0'], ['DEPOSITGATE', '1'], ['GRANT_THIEF', '1'], ['COMPETENT_TRIPHOME_ROUTE_AROUND', '1']]) {
  if (process.env[k] !== v) { console.error(`FATAL: ${k}=${v} must be set explicitly`); process.exit(2); }
}
const MODE = process.env.MODE || 'before';
if (MODE !== 'before' && MODE !== 'after') { console.error('FATAL: MODE=before|after'); process.exit(2); }
if (MODE === 'after' && process.env.COMPETENT_STANDING_HOME !== '1') { console.error('FATAL: MODE=after needs COMPETENT_STANDING_HOME=1'); process.exit(2); }
if (MODE === 'before' && process.env.COMPETENT_STANDING_HOME) { console.error('FATAL: MODE=before needs COMPETENT_STANDING_HOME unset'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '14', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-blockedpath-diag-b-10752.json');

async function main() {
  const { Game } = await loadGame({ seed: 10752, mode: 'creekpath-10752-replay', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const s = Game.state.scholar;
  const abs = (s.abilities || []);
  if (!abs.some((a) => (a.id || a) === 'thief')) abs.push({ id: 'thief', level: 1 });
  s.abilities = abs;
  let curDay = 0;
  const clears = [];
  const clearLines = [];
  const travelRefusals = [];
  const origClear = Game.clearBlockage;
  Game.clearBlockage = function (x, y) {
    let bfBefore = null;
    try { const t = Game.tileAt(x, y); bfBefore = t && t.blockFrom ? { ...t.blockFrom } : null; } catch (e) {}
    const px = Game.map ? Game.map.px : null, py = Game.map ? Game.map.py : null;
    const r = origClear.apply(Game, arguments);
    clears.push({ loopDay: curDay, x, y, blockFromBefore: bfBefore, playerBefore: [px, py], returned: (r === false ? false : true) });
    return r;
  };
  const origSay = Game.say;
  Game.say = function () {
    try {
      const line = String(arguments[0] || '');
      if (/clear the rubble|cut through the fallen tree|scramble through|lash logs together/.test(line)) {
        clearLines.push({ loopDay: curDay, line, player: Game.map ? [Game.map.px, Game.map.py] : null });
      }
    } catch (e) {}
    return origSay && origSay.apply(Game, arguments);
  };
  const origTravel = Game.travelTo;
  Game.travelTo = function (x, y) {
    const r = origTravel.apply(Game, arguments);
    try {
      if (r && typeof r === 'object' && r.blockType) {
        travelRefusals.push({ loopDay: curDay, to: [x, y], from: [Game.map.px, Game.map.py], blockType: r.blockType, blockX: r.x, blockY: r.y });
      }
    } catch (e) {}
    return r;
  };
  const base = require('./policies/competent');
  const basePolicy = base.competent;
  let callIdx = 0;
  const days = [];
  const policy = Object.assign({}, basePolicy, {
    daily(Game2, ctx) {
      callIdx++; curDay = callIdx;
      basePolicy.daily(Game2, ctx);
      let bf24 = null, probe = null, route = null;
      try { const t = Game2.tileAt(2, 4); bf24 = t && t.blockFrom ? { ...t.blockFrom } : null; } catch (e) {}
      try { probe = directHopBlockage(Game2, 4, 4); } catch (e) { probe = { error: String(e && e.message).slice(0, 120) }; }
      try { route = bfsRouteAround(Game2, 4, 4); } catch (e) {}
      days.push({ loopDay: callIdx, pos: [Game2.map.px, Game2.map.py],
        tile: (() => { try { const t = Game2.playerTile(); return t ? t.type : null; } catch (e) { return null; } })(),
        blockFrom24: bf24, hopProbe: probe, routeAround: route || null,
        tripHomeDetours: (ctx && ctx.tripHomeDetours) || 0,
        standingHomeDays: (ctx && ctx.standingHomeDays) || 0 });
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  const out = { seed: 10752, mode: MODE, daysAlive: result.days, endReason: result.endReason, days, clears, clearLines, travelRefusals };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(`mode=${MODE} daysAlive=${result.days} clears=${clears.length} clearLines=${clearLines.length} refusals=${travelRefusals.length} wrote ${OUT}`);
  for (const d of days) console.log(`day ${d.loopDay}: pos=${d.pos} tile=${d.tile} bf24=${JSON.stringify(d.blockFrom24)} probe=${JSON.stringify(d.hopProbe)}`);
  for (const c of clears) console.log(`CLEAR day ${c.loopDay}: tile=(${c.x},${c.y}) bfBefore=${JSON.stringify(c.blockFromBefore)} playerBefore=${c.playerBefore}`);
  for (const l of clearLines) console.log(`LINE day ${l.loopDay}: ${l.line} player=${l.player}`);
}
main().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
