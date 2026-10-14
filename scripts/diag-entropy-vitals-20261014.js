'use strict';
// diag-entropy-vitals-20261014.js — log the talkRound branch inputs from the
// GAME side (not the policy): day, rosterLen, villagerId, vidInRoster,
// codexPlants, talkToExists. Catches a divergent pair and shows where the
// inputs first differ.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const vitalsLog = [];
let curVitals = null;

async function one(seed, runNo) {
  curVitals = [];
  const { Game } = await loadGame({ seed, mode: 'entropy-vitals' });
  await setupGame(Game);
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => {
    const day = (Game.state.scholar || {}).day || 0;
    if (day >= 100 && day <= 115) {
      try {
        const vv = Game.state.village || {};
        curVitals.push({
          day,
          rosterLen: (vv.roster || []).length,
          vid: String(Game.villagerId).slice(0, 20),
          vidInRoster: (vv.roster || []).includes(Game.villagerId),
          codexPlants: Object.keys((Game.state.codex || {}).plants || {}).length,
          talkTo: !!Game.talkTo,
          scholarAlive: !((Game.state.scholar || {}).dead),
        });
      } catch (e) { curVitals.push({ day, err: e.message }); }
    }
    return base(G, ctx);
  };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  vitalsLog[runNo] = curVitals; curVitals = null;
  return { days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44, 0), b = await one(44, 1);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    const A = vitalsLog[0], B = vitalsLog[1];
    const n = Math.min(A.length, B.length);
    // Ignore the vid field (timestamp-based ID, benign) — compare the rest
    const strip = o => { const c = Object.assign({}, o); delete c.vid; return JSON.stringify(c); };
    for (let i = 0; i < n; i++) {
      const sa = strip(A[i]), sb = strip(B[i]);
      if (sa !== sb) {
        console.log('FIRST REAL VITALS DIFF at log idx', i, '(day', A[i].day + ')');
        console.log('  A:', sa);
        console.log('  B:', sb);
        break;
      }
    }
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
