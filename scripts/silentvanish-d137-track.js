// scratch: track the d137 visjoin_136 newcomer — when does it leave the
// roster, and what (if anything) is said about it? Seed 190392.
'use strict';
const path = require('path');
const REPO = '/home/hatch/workspace/worktrees/sim-silentvanish-b';
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
function gday(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
(async function () {
  const { Game } = await loadGame({ seed: 190392, mode: 'silentvanish-d137-track', fullTelemetry: false });
  const snaps = [];
  const says = [];
  const origSay = Game.say;
  Game.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string' && gday(Game) >= 136 && gday(Game) <= 139) says.push('d' + gday(Game) + ': ' + String(arg).slice(0, 160));
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  await setupGame(Game);
  let prevDay = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== prevDay) {
            prevDay = d;
            if (d >= 136 && d <= 140) {
              snaps.push('d' + d + ' roster(' + (((Game.state || {}).village || {}).roster || []).length + '): ' + JSON.stringify(((Game.state || {}).village || {}).roster || []));
            }
          }
        } catch (e) {}
      }
    },
  });
  await quietLog(async function () { await runDays(Game, wrapped, { days: 141, manifest: undefined, sampleEvery: 1 }); });
  snaps.forEach(function (l) { console.log(l); });
  console.log('--- say lines d136-139 mentioning wanderer / visjoin / death / gone / leaves ---');
  says.filter(function (l) { return /wanderer|visjoin|dies|dead|gone|leaves|walks|taken in/i.test(l); }).forEach(function (l) { console.log(l); });
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
