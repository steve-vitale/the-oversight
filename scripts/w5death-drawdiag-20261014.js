#!/usr/bin/env node
// scripts/w5death-drawdiag-20261014.js — diagnostic: what share of post-unlock
// scholar deaths were feast-draw fights? Wraps Game.playerDeath like the audit
// instrument, plus captures feastedActive() and s.feastDraw at death.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 44, 55, 77, 303];

async function run(seed) {
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'drawdiag' });
  await setupGame(Game);
  const deaths = [];
  let unlockDay5 = null;
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const rec = { day: null, cause, feasted: false, drawPending: false, monsters: [] };
    try {
      const s = Game.state.scholar || {};
      rec.day = s.day || 0;
      rec.feasted = !!(Game.feastedActive && Game.feastedActive());
      rec.drawPending = !!(s.feastDraw && s.feastDraw.monsterId);
      const f = Game.tbfight;
      if (f && f.fighters) {
        for (const x of f.fighters) {
          if (x && x.kind === 'monster') {
            const md = (Game.data.monsters || []).find(m => m.id === x.monsterId) || {};
            rec.monsters.push({ id: x.monsterId, wave: md.wave || '?' });
          }
        }
      }
      const uw = Game.unlockedWave ? Game.unlockedWave() : 1;
      if (uw >= 5 && unlockDay5 == null) unlockDay5 = s.day || 0;
    } catch (e) {}
    deaths.push(rec);
    return origPD(cause);
  };
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily ? leadfeast.daily.bind(leadfeast) : null;
  policy.daily = (G, ctx) => {
    try {
      const uw = G.unlockedWave ? G.unlockedWave() : 1;
      if (uw >= 5 && unlockDay5 == null) unlockDay5 = (G.state.scholar || {}).day || 0;
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  return { seed, unlockDay5, deaths };
}

async function main() {
  let post = 0, feastedDeaths = 0, drawDeaths = 0, w5deaths = 0;
  for (const seed of SEEDS) {
    const r = await run(seed);
    console.log(`seed ${seed}: unlock d${r.unlockDay5}`);
    for (const d of r.deaths) {
      const postU = r.unlockDay5 != null && d.day >= r.unlockDay5;
      const w5 = d.monsters.some(m => m.wave === 5);
      console.log(`  d${d.day} ${d.cause}${postU ? ' [post]' : ''} feasted=${d.feasted} draw=${d.drawPending} vs ${d.monsters.map(m => m.id + '(w' + m.wave + ')').join(',') || 'nofight'}`);
      if (postU) {
        post++;
        if (d.feasted) feastedDeaths++;
        if (d.drawPending) drawDeaths++;
        if (w5) w5deaths++;
      }
    }
  }
  console.log('---');
  console.log(`post-unlock deaths: ${post}; feasted at death: ${feastedDeaths} (${(feastedDeaths / Math.max(1, post) * 100).toFixed(1)}%)`);
  console.log(`feastDraw marker live at death: ${drawDeaths}; w5-killer deaths: ${w5deaths}`);
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
