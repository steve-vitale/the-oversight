#!/usr/bin/env node
// titanroute-probe-97307.js — one-seed probe for sim-titanroute-a: WHY did
// every march on 97307 refuse? Wraps Game.travelTo to log returns
// (blockType/blocked) and Game.travelBlockage for march-window attempts.
// Same frozen stack + titanroute arm as the judged driver; instrument
// only, no policy change. Usage (same env flags as the driver):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   node scripts/titanroute-probe-97307.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 is required.`); process.exit(2); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'x');
  const full = FD.withFullseatDiag(sd, 'lead-fullseat', 'x');
  const policy = TR.withTitanRoute(full, 'lead-titanroute', 'x');
  const { Game } = await loadGame({ seed: 97307, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const travelLog = [];
  let capturedCtx = null;
  try {
    const origTT = Game.travelTo;
    Game.travelTo = function (x, y) {
      const day = gday(Game);
      const before = Game.map ? { x: Game.map.px, y: Game.map.py } : null;
      let block = null;
      try { block = (typeof Game.travelBlockage === 'function') ? Game.travelBlockage(x, y, before.x, before.y) : null; } catch (e) { block = 'err:' + String(e.message).slice(0, 60); }
      let r = null, err = null;
      try { r = origTT.apply(this, arguments); } catch (e) { err = String(e.message).slice(0, 120); }
      const after = Game.map ? { x: Game.map.px, y: Game.map.py } : null;
      if (day >= 129) {
        travelLog.push({ day: day, from: before, target: { x: x, y: y }, after: after,
          blockage: (block && typeof block === 'object') ? (block.blockType || block.type || JSON.stringify(block).slice(0, 120)) : block,
          ret: (r && typeof r === 'object') ? (r.blockType || r.blocked || r.kind || JSON.stringify(r).slice(0, 120)) : r,
          err: err });
      }
      if (err) throw new Error(err);
      return r;
    };
  } catch (e) { console.error('travel wrap failed: ' + e.message); }
  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
  });
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, wrapped, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort; probe ends here */ }
  const tc = capturedCtx ? capturedCtx.titan : null;
  console.log('MARCHES: ' + JSON.stringify(tc ? tc.marches : null));
  // Only the march-window eastward attempts (targets x>=5 on the lair row
  // or the lair itself), first 40, so the refusal reason reads clearly.
  const east = travelLog.filter(l => l.target.x >= 5 && l.target.y === 4);
  console.log('EASTWARD TRAVEL ATTEMPTS (days>=129, target y=4, x>=5): ' + east.length);
  for (const l of east.slice(0, 40)) console.log(JSON.stringify(l));
  const byTarget = {};
  for (const l of east) {
    const k = l.target.x + ',' + l.target.y + '|moved=' + (l.after.x === l.target.x && l.after.y === l.target.y);
    byTarget[k] = (byTarget[k] || 0) + 1;
  }
  console.log('BY TARGET: ' + JSON.stringify(byTarget));
  const moved = east.filter(l => l.after.x === l.target.x && l.after.y === l.target.y).length;
  console.log('EASTWARD MOVED: ' + moved + '/' + east.length);
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
