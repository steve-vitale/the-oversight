// silentvanish-d137-full.js — focused check: FULL unfiltered say stream
// d136-139 on seed 190392, plus the visjoin_136 join (visitorInteract) and
// its removal (removeVillager wrap with stack). Answers: did the join fire,
// when exactly, and was the death voiced — by name, on which day, through
// which channel?
'use strict';
const path = require('path');
const REPO = '/home/hatch/workspace/worktrees/sim-silentvanish-b';
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
function gday(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
(async function () {
  const { Game } = await loadGame({ seed: 190392, mode: 'silentvanish-d137-full', fullTelemetry: false });
  const says = [];
  const events = [];
  const origSay = Game.say;
  Game.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') {
        const d = gday(Game);
        if (d >= 136 && d <= 139) says.push('d' + d + ': ' + String(arg).slice(0, 300));
      }
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const origVI = Game.visitorInteract.bind(Game);
  Game.visitorInteract = function (visitorId, how) {
    const v = this.state.village || {};
    const before = (v.roster || []).slice();
    const ret = origVI(visitorId, how);
    const after = (v.roster || []).slice();
    if (how === 'invite') {
      events.push('d' + gday(Game) + ' visitorInteract(' + visitorId + ',' + how + ') roster ' + before.length + '->' + after.length +
        ' added=' + JSON.stringify(after.filter(function (x) { return before.indexOf(x) < 0; })) +
        ' names=' + JSON.stringify(after.filter(function (x) { return before.indexOf(x) < 0; }).map(function (id) { try { return Game.displayName(id); } catch (e) { return id; } })));
    }
    return ret;
  };
  const origRV = Game.removeVillager.bind(Game);
  Game.removeVillager = function (vid, how) {
    if (typeof vid === 'string' && vid.indexOf('visjoin_') === 0) {
      let site = '';
      try { site = new Error('t').stack.split('\n').slice(2, 5).map(function (l) { return l.trim(); }).filter(function (l) { return /src\/js\//.test(l); }).join(' | '); } catch (e) {}
      events.push('d' + gday(Game) + ' removeVillager(' + vid + ',' + how + ') name=' + (function () { try { return Game.displayName(vid); } catch (e) { return vid; } })() + ' :: ' + site);
    }
    return origRV(vid, how);
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
            if (d >= 134 && d <= 141) {
              const ros = ((Game.state || {}).village || {}).roster || [];
              events.push('d' + d + ' snapshot roster(' + ros.length + '): ' + JSON.stringify(ros));
            }
          }
        } catch (e) {}
      }
    },
  });
  await quietLog(async function () { await runDays(Game, wrapped, { days: 141, manifest: undefined, sampleEvery: 1 }); });
  console.log('=== EVENTS ===');
  events.forEach(function (l) { console.log(l); });
  console.log('=== SAY d136-139 (full, unfiltered) ===');
  says.forEach(function (l) { console.log(l); });
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
