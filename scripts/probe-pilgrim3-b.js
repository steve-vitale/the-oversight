// probe-pilgrim3-b.js — DIAGNOSTIC ONLY (no corpus written). Does
// Game.travelTo itself move the scholar on seed 100604? Direct calls
// outside any policy: print position, travelTargets, travelBlockage,
// then call travelTo toward village_0 step by step and print each
// return value + position. Usage: node scripts/probe-pilgrim3-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { courtshipPolicy, resetCourtshipStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-courtship-b'));

(async function () {
  resetCourtshipStats();
  const { Game } = await loadGame({ seed: 100604, mode: 'probe-pilgrim3-b', fullTelemetry: false });
  await setupGame(Game);
  console.log('day ' + Game.state.scholar.day + ' pos ' + Game.map.px + ',' + Game.map.py +
    ' tbfight ' + !!Game.tbfight + ' over ' + !!Game.over);
  const ovs = Game.state.otherVillages || [];
  console.log('villages ' + JSON.stringify(ovs.map(function (v) { return { id: v.id, x: v.x, y: v.y }; })));
  const tgts = Game.travelTargets();
  console.log('travelTargets n=' + tgts.length + ' ' + JSON.stringify(tgts.slice(0, 12)));
  const tv = ovs[0];
  // walkTo verbatim, with logging of every travelTo return.
  let guard = 0;
  while ((Game.map.px !== tv.x || Game.map.py !== tv.y) && guard++ < 10 && !Game.over && !Game.tbfight) {
    let best = null, bd = 1e9;
    const targets = Game.travelTargets() || [];
    for (const tt of targets) {
      const d = Math.abs(tt.x - tv.x) + Math.abs(tt.y - tv.y);
      if (d < bd) { bd = d; best = tt; }
    }
    if (!best) { console.log('hop ' + guard + ': NO BEST'); break; }
    const px0 = Game.map.px, py0 = Game.map.py;
    let ret;
    try { ret = Game.travelTo(best.x, best.y); } catch (e) { console.log('hop ' + guard + ': travelTo THREW ' + e.message); break; }
    console.log('hop ' + guard + ': travelTo(' + best.x + ',' + best.y + ') -> ' +
      JSON.stringify(ret && typeof ret === 'object' ? { blocked: ret.blocked, kind: ret.kind, blockType: ret.blockType } : ret) +
      ' pos ' + px0 + ',' + py0 + ' -> ' + Game.map.px + ',' + Game.map.py +
      ' blockage=' + JSON.stringify(Game.travelBlockage(best.x, best.y)));
    if (Game.map.px === px0 && Game.map.py === py0) { console.log('hop ' + guard + ': NO MOVEMENT, stop'); break; }
  }
  console.log('after walk: pos ' + Game.map.px + ',' + Game.map.py + ' day ' + Game.state.scholar.day);
  // Now run 3 days of the real courtship policy and print position each morning.
  const rec = Object.assign({}, courtshipPolicy, {
    daily: function (G, ctx) {
      process.stdout.write('MORNING d' + G.state.scholar.day + ' pos ' + G.map.px + ',' + G.map.py +
        ' pilgrim ' + (ctx._pilgrim ? ctx._pilgrim.vid + '@d' + ctx._pilgrim.day : '-') +
        ' returning ' + !!ctx._returning);
      const r = courtshipPolicy.daily(G, ctx);
      process.stdout.write('EVENING d' + G.state.scholar.day + ' pos ' + G.map.px + ',' + G.map.py +
        ' pilgrim ' + (ctx._pilgrim ? ctx._pilgrim.vid + '@d' + ctx._pilgrim.day : '-') +
        ' returning ' + !!ctx._returning);
      return r;
    },
  });
  await quietLog(async function () {
    await runDays(Game, rec, { days: 6, manifest: undefined, sampleEvery: 1 });
  });
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
