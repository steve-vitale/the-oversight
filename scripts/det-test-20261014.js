'use strict';
// Within-process determinism test: same seed+policy twice in ONE process.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('/home/hatch/workspace/worktrees/sim-wave5cond/scripts/sim-harness');
const { leadfeast } = require('/home/hatch/workspace/worktrees/sim-wave5cond/scripts/policies/feastscale');
async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'det-test' });
  await setupGame(Game);
  const r = await runDays(Game, leadfeast, { days: 180, sampleEvery: 10 });
  return { seed, days: r.days, endReason: r.endReason,
    deaths: (r.samples && r.samples.deaths || []).map(d => d.day + ':' + d.kind + ':' + (d.player?'P':'V')).join(',') };
}
(async () => {
  for (const seed of [44, 88]) {
    const a = await one(seed), b = await one(seed);
    const same = JSON.stringify(a) === JSON.stringify(b);
    console.log('seed', seed, same ? 'IDENTICAL' : 'DIVERGED');
    if (!same) { console.log('  A:', JSON.stringify(a).slice(0,300)); console.log('  B:', JSON.stringify(b).slice(0,300)); }
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
