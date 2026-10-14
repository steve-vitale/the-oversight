'use strict';
// diag-entropy-encounter-20261014.js — log expeditionMonster calls (day, vid)
// in both runs of a divergent pair. When do the encounters happen?
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const encLog = [];
let curEnc = null;

async function one(seed, runNo) {
  curEnc = [];
  const { Game } = await loadGame({ seed, mode: 'entropy-encounter' });
  await setupGame(Game);
  const orig = Game.expeditionMonster;
  if (typeof orig === 'function') {
    Game.expeditionMonster = function (vid, dist, playerAtHaven) {
      try {
        const day = (Game.state.scholar || {}).day || 0;
        if (day >= 100 && day <= 115) curEnc.push(day + ':encounter:dist' + dist);
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
  const r = await runDays(Game, leadfeast, { days: 180, sampleEvery: 10 });
  encLog[runNo] = curEnc; curEnc = null;
  return { days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44, 0), b = await one(44, 1);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    console.log('encounters A (' + encLog[0].length + '):', encLog[0].join(' | '));
    console.log('encounters B (' + encLog[1].length + '):', encLog[1].join(' | '));
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
