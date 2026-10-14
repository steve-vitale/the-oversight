'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('/home/hatch/workspace/worktrees/sim-wave5cond/scripts/sim-harness');
const { leadfeast } = require('/home/hatch/workspace/worktrees/sim-wave5cond/scripts/policies/feastscale');
function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health||0), Math.round(s.kcal||0),
      (v.roster||[]).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry||[]).reduce((t,i)=>t+(i.kcalEach||0)*(i.units||1),0))/100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}
async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'bisect' });
  await setupGame(Game);
  const base = leadfeast.daily, hashes = [];
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base(G, ctx); };
  const r = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  return hashes;
}
(async () => {
  const a = await one(44), b = await one(44);
  let first = -1;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) { first = i; break; }
  }
  console.log('lenA', a.length, 'lenB', b.length, 'firstDivIdx', first);
  for (let i = Math.max(0, first - 2); i < Math.min(a.length, first + 3); i++)
    console.log(i, 'A:', a[i], ' B:', b[i], a[i] === b[i] ? '' : ' <-- DIVERGE');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
