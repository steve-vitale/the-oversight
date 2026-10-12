#!/usr/bin/env node
// sense probe (r5): full transcript around trader pool-growth events.
// Seed 4: Krzysztof (fishing guide) deepened a plant and sold a deep plant.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { tradeRound } = require('./trade-hook');

(async () => {
  const { Game } = await loadGame({ seed: 4, mode: 'competent+ask', fullTelemetry: false });
  await setupGame(Game);
  const sayAll = [];
  const _say = Game.say;
  Game.say = function (m) { sayAll.push({ day: (Game.state.scholar || {}).day, m: String(m || '') }); return _say.call(this, m); };
  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  const askRound = (G) => {
    try {
      const v = G.state.village || {};
      const news = v.explorerNews || {};
      for (const vid of Object.keys(news).filter(id => id !== G.villagerId)) {
        try {
          if (!((v.roster || []).includes(vid))) continue;
          const st = G.startConvo(vid);
          if (!st) continue;
          const ac = (G.convoChoices(vid) || []).find(c => c.id && String(c.id).indexOf('agency:') === 0);
          if (ac) { try { G.convoTurn(vid, ac.id); } catch (e) {} }
          try { G.endConvo(vid, 'left'); } catch (e) {}
        } catch (e) {}
      }
    } catch (e) {}
  };
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try { askRound(G); } catch (e) {}
    try { tradeRound(G, {}); } catch (e) {}
  };
  await runDays(Game, policy, { days: 200, sampleEvery: 10 });
  Game.say = _say;
  // find deepening lines and deep trades
  const deepIdx = [];
  sayAll.forEach((e, i) => { if (/deep enough to teach/.test(e.m)) deepIdx.push(i); });
  console.log('deepening events:', deepIdx.length);
  for (const i of deepIdx) {
    console.log(`\n===== day ${sayAll[i].day} — deepening =====`);
    for (let j = Math.max(0, i - 6); j <= Math.min(sayAll.length - 1, i + 4); j++) {
      console.log((j === i ? '>>> ' : '    ') + `[d${sayAll[j].day}] ` + sayAll[j].m.slice(0, 200));
    }
  }
  // deep-plant trade sequences: find TRADED KNOWLEDGE lines and check viaTrade plants
  const cxp = Game.state.codex.plants || {};
  const td = (Game.state.village.traderDeep || {});
  console.log('\n===== traderDeep store at end =====');
  for (const [vid, rec] of Object.entries(td)) {
    let nm = vid;
    try { nm = Game.displayName(vid); } catch (e) {}
    for (const [pid, e] of Object.entries(rec)) {
      if (pid.charAt(0) === '_') continue;
      const p = (Game.data.plants || []).find(x => x.id === pid) || {};
      console.log(`${nm}: ${p.name || pid} deep=${!!e.deep} via=${e.via} day=${e.day} playerLevel=${(cxp[pid] || {}).level || 0}`);
    }
  }
  const tradedIdx = [];
  sayAll.forEach((e, i) => { if (/TRADED KNOWLEDGE/.test(e.m)) tradedIdx.push(i); });
  console.log('\nTRADED KNOWLEDGE events:', tradedIdx.length);
  for (const i of tradedIdx.slice(-4)) {
    console.log(`\n----- day ${sayAll[i].day} -----`);
    for (let j = Math.max(0, i - 4); j <= Math.min(sayAll.length - 1, i + 2); j++) {
      console.log((j === i ? '>>> ' : '    ') + `[d${sayAll[j].day}] ` + sayAll[j].m.slice(0, 200));
    }
  }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
