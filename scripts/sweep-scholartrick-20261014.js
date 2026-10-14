#!/usr/bin/env node
// scripts/sweep-scholartrick-20261014.js — scholartrick lever measurement.
//
// 8 seeds x leadcourt/belongseek, 180d death-aware, identical seeds
// before/after. Baseline (pristine) via SCHOLARTRICK_GAMEJS pointing at a
// pristine game.js (generated: git show <pre-change-sha>:src/js/game.js).
//
// Usage:
//   SCHOLARTRICK_GAMEJS=/tmp/scholartrick-gamejs-pristine.js OUT=/tmp/base.json node scripts/sweep-scholartrick-20261014.js
//   OUT=/tmp/after.json node scripts/sweep-scholartrick-20261014.js
//   SEEDS="11,22" POLICIES="leadcourt" — filters
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { runDays, setupGame } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const ROOT = path.resolve(__dirname, '..');
const GAMEJS_OVERRIDE = process.env.SCHOLARTRICK_GAMEJS || null;
const OUT = process.env.OUT || null;
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const POLICIES = { leadcourt, belongseek };
const POLICY_IDS = (process.env.POLICIES || 'leadcourt,belongseek').split(',').map(s => s.trim()).filter(s => POLICIES[s]);
const DAYS = 180;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// loader: sim-harness's loadGame pattern + SCHOLARTRICK_GAMEJS override
// (game.js is the only file this arm changes, so pristine game.js + the
// rest of the tree = the exact pre-change baseline).
async function loadGameSeed(seed) {
  Math.random = mulberry32(seed);
  global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
  const order = execSync(`grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  const gameIdx = order.indexOf('src/js/game.js');
  const evalFile = (f) => {
    const module = { exports: {} };
    const exports = module.exports;
    let src;
    if (f === 'src/js/game.js' && GAMEJS_OVERRIDE) src = fs.readFileSync(GAMEJS_OVERRIDE, 'utf8');
    else src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    eval(src);
  };
  order.forEach((f, i) => { if (gameIdx < 0 || i < gameIdx) evalFile(f); });
  if (gameIdx >= 0) evalFile(order[gameIdx]);
  global.Game = globalThis.Scattering.Game;
  order.forEach((f, i) => { if (i > gameIdx) evalFile(f); });
  delete global.window;
  await new Promise(r => setTimeout(r, 0));
  const G = globalThis.Scattering.Game;
  G.say = function () {}; G.sysSay = function () {}; G.audioEvent = function () {};
  if (G.drama === undefined) G.drama = function () {};
  await G.init();
  return G;
}

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

(async () => {
  const runs = [];
  for (const pid of POLICY_IDS) {
    for (const seed of SEEDS) {
      const Game = await loadGameSeed(seed);
      await setupGame(Game);
      // instrument: scholar channel counts (call-through wrappers — no RNG, no state mutation)
      let scholarObs = 0, scholarDisc = 0, villObs = 0;
      if (typeof Game.noteScholarTrickObservation === 'function') {
        const o = Game.noteScholarTrickObservation;
        Game.noteScholarTrickObservation = function (mid) { scholarObs++; return o.call(this, mid); };
      }
      if (typeof Game.noteVillagerTrickObservation === 'function') {
        const o = Game.noteVillagerTrickObservation;
        Game.noteVillagerTrickObservation = function (vid, mid) { if (vid !== 'player') villObs++; return o.call(this, vid, mid); };
      }
      if (typeof Game.discoverMonsterCounter === 'function') {
        const o = Game.discoverMonsterCounter;
        Game.discoverMonsterCounter = function (mid, via) { if (via === 'scholar-observed') scholarDisc++; return o.call(this, mid, via); };
      }
      const policy = Object.assign({}, POLICIES[pid]);
      const hist = { maxRank: 0, maxArc: 1, everTable: false };
      const origDaily = POLICIES[pid].daily;
      policy.daily = (G, ctx) => {
        try {
          const r = (G.scaleRank ? G.scaleRank() : 'village') || 'village';
          hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[r] || 0);
          const pg = G.progState ? G.progState() : {};
          hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
          if (pg.tableWaiting) hist.everTable = true;
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
      let endRank = 'village';
      try { endRank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
      let won = false;
      try { won = !!Game.won; } catch (e) {}
      const deaths = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const k = String(d.cause || d.kind || 'unknown');
          deaths[k] = (deaths[k] || 0) + 1;
        }
      } catch (e) {}
      const row = {
        policy: pid, seed, days: result.days, endReason: result.endReason,
        won: won ? 1 : 0, waveReach: result.maxWaveUnlocked || 1,
        maxArc: hist.maxArc, maxRank: endRank,
        national: (RANK_ORDER[endRank] || 0) >= 2 ? 1 : 0,
        table: hist.everTable ? 1 : 0,
        scholarObs, scholarDisc, villObs,
        deaths,
      };
      runs.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank} won=${row.won} scholarObs=${row.scholarObs} scholarDisc=${row.scholarDisc}`);
      // free the engine for the next seed
      delete global.Game;
    }
  }
  const report = {
    label: GAMEJS_OVERRIDE ? 'scholartrick-BASELINE(pristine)' : 'scholartrick-AFTER',
    code: GAMEJS_OVERRIDE ? 'pristine' : 'change',
    seeds: SEEDS, policies: POLICY_IDS, days: DAYS, runs,
    generated: new Date().toISOString(),
  };
  if (OUT) { fs.writeFileSync(OUT, JSON.stringify(report, null, 1)); console.log('wrote ' + OUT); }
  else console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
