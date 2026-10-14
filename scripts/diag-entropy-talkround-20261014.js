'use strict';
// diag-entropy-talkround-20261014.js — instrument talkRound's branch inputs.
// Logs (day, knownPlants, rosterLen, villagerId, vidInRoster, earlyReturn)
// for every talkRound call on days 100-115, in both runs of a pair.
// Catches the first divergent pair (max 6 attempts) and reports it.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const competentMod = require('./policies/competent');
const { leadfeast } = require('./policies/feastscale');

const talkLog = [];
let curTalkLog = null;

// Wrap the exported talkRound to log its branch inputs.
const origTalkRound = competentMod.talkRound;
competentMod.talkRound = function (Game, ctx) {
  if (curTalkLog) {
    try {
      const day = (Game.state.scholar || {}).day || 0;
      if (day >= 100 && day <= 115) {
        const vv = Game.state.village || {};
        const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
        const known = Object.keys((Game.state.codex || {}).plants || {}).length;
        curTalkLog.push({
          day,
          known,
          rosterLen: (vv.roster || []).length,
          filteredLen: roster.length,
          vidInRoster: (vv.roster || []).includes(Game.villagerId),
          earlyReturn: roster.length === 0 || !Game.talkTo,
        });
      }
    } catch (e) {}
  }
  return origTalkRound(Game, ctx);
};

async function one(seed, runNo) {
  curTalkLog = [];
  const { Game } = await loadGame({ seed, mode: 'entropy-talkround' });
  await setupGame(Game);
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => base(G, ctx);
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  talkLog[runNo] = curTalkLog; curTalkLog = null;
  return { days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44, 0), b = await one(44, 1);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    const A = talkLog[0], B = talkLog[1];
    console.log('talkRound calls A:', A.length, 'B:', B.length);
    const n = Math.min(A.length, B.length);
    let first = -1;
    for (let i = 0; i < n; i++) {
      if (JSON.stringify(A[i]) !== JSON.stringify(B[i])) { first = i; break; }
    }
    if (first < 0 && A.length !== B.length) first = n;
    console.log('first differing talkRound call idx:', first);
    for (let i = Math.max(0, first - 2); i < Math.min(Math.max(A.length, B.length), first + 3); i++) {
      const sa = i < A.length ? JSON.stringify(A[i]) : '(none)';
      const sb = i < B.length ? JSON.stringify(B[i]) : '(none)';
      console.log(i, 'A:', sa, '\n' + i, 'B:', sb, sa === sb ? '' : '  <--');
    }
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
