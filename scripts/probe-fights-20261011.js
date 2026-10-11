#!/usr/bin/env node
// probe-fights-20261011.js — per-fight facts: pack size, player HP at entry,
// monster ids, rounds, outcome. Answers: WHY do sims lose 39% of wave-1 fights?
'use strict';
const { loadGame, setupGame, runDays, driveFights } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seeds = [1, 2, 3, 4, 5];
  const fights = [];
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: true });
    await setupGame(Game);
    const policy = Object.assign({}, competent);
    const origFight = competent.fight;
    // wrap: record fight start state
    let cur = null;
    const wrapped = Object.assign({}, policy);
    const baseDaily = competent.daily;
    wrapped.daily = (G, ctx) => { if (baseDaily) try { return baseDaily(G, ctx); } catch (e) {} };
    // hook combat via telemetry pairing: simpler — poll tbfight in daily
    let lastFight = null;
    const origUpkeep = competent.upkeep;
    wrapped.upkeep = (G, ctx) => {
      try {
        if (G.tbfight && !G.tbfight.over && !lastFight) {
          const ms = G.tbfight.fighters.filter(x => x.kind === 'monster').map(x => ((x.mdef || {}).id || '?') + '@' + Math.round(x.hp || 0));
          const p = G.tbFighter('p');
          lastFight = { seed, wave: ((G.data.monsters || []).find(m => m.id === ((G.tbfight.fighters.find(x => x.kind === 'monster') || {}).mdef || {}).id) || {}).wave || '?', mons: ms, php0: Math.round((p || {}).hp || 0), maxhp: Math.round((p || {}).maxHp || 0), day: (G.state.scholar || {}).day || 0 };
        }
        if ((!G.tbfight || G.tbfight.over) && lastFight) {
          lastFight.result = (G.tbfight && G.tbfight.result) || 'interrupted';
          fights.push(lastFight);
          lastFight = null;
        }
      } catch (e) {}
      if (origUpkeep) try { return origUpkeep(G, ctx); } catch (e) {}
    };
    if (origFight) wrapped.fight = origFight;
    await runDays(Game, wrapped, { days: 200 });
  }
  const byWave = {};
  for (const f of fights) {
    byWave[f.wave] = byWave[f.wave] || [];
    byWave[f.wave].push(f);
  }
  for (const w of Object.keys(byWave).sort()) {
    const fs = byWave[w];
    const lost = fs.filter(f => f.result === 'lost');
    console.log(`\n=== WAVE ${w}: ${fs.length} fights, ${lost.length} lost (${(100 * lost.length / fs.length).toFixed(1)}%) ===`);
    const packSizes = {};
    for (const f of fs) { const n = f.mons.length; packSizes[n] = (packSizes[n] || 0) + 1; }
    console.log('pack sizes:', JSON.stringify(packSizes));
    const hp0 = lost.map(f => f.php0 + '/' + f.maxhp);
    console.log('lost fights: player HP at entry (hp/max):', hp0.slice(0, 20).join(' '));
    const monIds = {};
    for (const f of lost) for (const m of f.mons) { const id = m.split('@')[0]; monIds[id] = (monIds[id] || 0) + 1; }
    console.log('lost fights: monster counts:', JSON.stringify(monIds));
    const days = lost.map(f => f.day);
    console.log('lost fight days:', days.slice(0, 20).join(','));
  }
})();
