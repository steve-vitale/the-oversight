// scratch: instrument the d137 wanderer invite — what does visitorInteract
// actually do to the roster on seed 190392?
'use strict';
const path = require('path');
const REPO = '/home/hatch/workspace/worktrees/sim-silentvanish-b';
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
function gday(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
(async function () {
  const { Game } = await loadGame({ seed: 190392, mode: 'silentvanish-d137-instr', fullTelemetry: false });
  const log = [];
  // Wrap visitorInteract: record roster before/after + return value.
  const origVI = Game.visitorInteract.bind(Game);
  Game.visitorInteract = function (visitorId, how) {
    const v = this.state.village || {};
    const before = (v.roster || []).slice();
    let ret, err = null;
    try { ret = origVI(visitorId, how); } catch (e) { err = String(e && e.message); }
    const after = (v.roster || []).slice();
    if (how === 'invite' || gday(Game) >= 130) {
      log.push('d' + gday(Game) + ' visitorInteract(' + visitorId + ',' + how + ') -> ' + JSON.stringify(ret) +
        ' err=' + err + ' roster ' + before.length + '->' + after.length +
        ' added=' + JSON.stringify(after.filter(function (x) { return before.indexOf(x) < 0; })) +
        ' removed=' + JSON.stringify(before.filter(function (x) { return after.indexOf(x) < 0; })));
    }
    if (err) throw new Error(err);
    return ret;
  };
  // Wrap villageAutoRecruit: record visitors seen + roster before/after.
  if (typeof Game.villageAutoRecruit === 'function') {
    const origAR = Game.villageAutoRecruit.bind(Game);
    Game.villageAutoRecruit = function () {
      const v = this.state.village || {};
      const before = (v.roster || []).slice();
      const vis = (v.visitors || []).map(function (x) { return x.id + ':' + x.type + ':d' + x.day + (x.hostile ? ':hostile' : '') + (x.shady ? ':shady' : ''); });
      const r = origAR();
      const after = (v.roster || []).slice();
      if (gday(Game) >= 130 && (vis.length || before.length !== after.length)) {
        log.push('d' + gday(Game) + ' autoRecruit visitors=[' + vis.join(',') + '] roster ' + before.length + '->' + after.length);
      }
      return r;
    };
  }
  await setupGame(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: 141, manifest: undefined, sampleEvery: 1 }); });
  log.forEach(function (l) { console.log(l); });
  console.log('final roster d141: ' + JSON.stringify(((Game.state || {}).village || {}).roster || []));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
