'use strict';
// diag-entropy-roster-20261014.js — log the ROSTER (order + attributes, no IDs)
// at days 100-115 in both runs. If the order differs, talkRound picks a
// different person with the same RNG index -> divergent conversations.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const rosterLog = [];
let curLog = null;

async function one(seed, runNo) {
  curLog = [];
  const { Game } = await loadGame({ seed, mode: 'entropy-roster' });
  await setupGame(Game);
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => {
    const day = (Game.state.scholar || {}).day || 0;
    if (day >= 100 && day <= 115) {
      try {
        const vv = Game.state.village || {};
        const list = (vv.roster || []).map((id, idx) => {
          let p = null;
          try { p = Game.getPerson(id); } catch (e) {}
          return (idx + ':' + (id === Game.villagerId ? 'SCHOLAR' : (p && p.occupationId) || '?'));
        });
        curLog.push({ day, roster: list.join(',') });
      } catch (e) { curLog.push({ day, err: e.message }); }
    }
    return base(G, ctx);
  };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  rosterLog[runNo] = curLog; curLog = null;
  return { days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44, 0), b = await one(44, 1);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    const A = rosterLog[0], B = rosterLog[1];
    const n = Math.min(A.length, B.length);
    for (let i = 0; i < n; i++) {
      if (A[i].roster !== B[i].roster) {
        console.log('FIRST ROSTER DIFF at day', A[i].day);
        console.log('  A:', A[i].roster);
        console.log('  B:', B[i].roster);
        break;
      }
    }
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
