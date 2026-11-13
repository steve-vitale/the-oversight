// scratch: focused check — roster d135-140 on seed 190392, current master.
// Does the d137 "curious wanderer" invite actually grow the roster?
'use strict';
const path = require('path');
const REPO = '/home/hatch/workspace/worktrees/sim-silentvanish-b';
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
function gday(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
(async function () {
  const { Game } = await loadGame({ seed: 190392, mode: 'silentvanish-d137-check', fullTelemetry: false });
  await setupGame(Game);
  let prevDay = -1;
  const seen = [];
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== prevDay) {
            prevDay = d;
            if (d >= 134 && d <= 141) {
              const ros = ((Game.state || {}).village || {}).roster || [];
              seen.push('d' + d + ' roster(' + ros.length + '): ' + JSON.stringify(ros));
            }
          }
        } catch (e) {}
      }
    },
  });
  await quietLog(async function () { await runDays(Game, wrapped, { days: 141, manifest: undefined, sampleEvery: 1 }); });
  seen.forEach(function (l) { console.log(l); });
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
