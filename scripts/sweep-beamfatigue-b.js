#!/usr/bin/env node
// sweep-beamfatigue-b.js — 8-seed pilot for the gallowdeer beam-fatigue lever.
// Pre-registered (2026-10-13): 8 seeds (11/22/33/44/55/66/77/88), 150d
// death-aware, identical-seed before/after. The lever gates on BEAM_FATIGUE
// env (default ON); run once with BEAM_FATIGUE=0 (before) and once without
// (after), then compare.
// GO: (1) no gallowdeer beam-fight >200 deer turns (stalemate never recurs);
//     (2) wave-1 player death share no worse than baseline.
// Metrics per seed: max gallowdeer-fight deer-turns, gallowdeer-attributed
// player deaths, all player death causes, max scale reached, days survived.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const OUT = process.env.OUT || '/tmp/beamfatigue-pilot.json';

function bucket(c) {
  c = String(c || '').toLowerCase().trim();
  if (/gallowdeer|highbeam/.test(c)) return 'gallowdeer';
  if (/beam/.test(c)) return 'beam';
  if (/the night|starvat/.test(c)) return 'starvation';
  if (/contest/.test(c)) return 'contest';
  if (/thirst|dehydrat/.test(c)) return 'thirst';
  if (/disease|sick|plague|pox|gutrot|trichinosis|lockjaw|eurika/.test(c)) return 'disease';
  if (/wound|injur|bled|mauled/.test(c)) return 'wound';
  if (/monster|combat/.test(c)) return 'combat';
  return 'other';
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'beamfatigue-pilot' });
  await setupGame(Game);
  // telemetry: track gallowdeer fights
  const fights = []; // {deerTurns, declares}
  let curFight = null;
  const origStart = Game.startCombat.bind(Game);
  Game.startCombat = function (mid) {
    const r = origStart(mid);
    try {
      const deer = Game.tbfight && Game.tbfight.fighters.find(
        x => x.kind === 'monster' && x.mdef && x.mdef.id === 'gallowdeer');
      if (deer) curFight = { deerTurns: 0, declares: 0, deer };
    } catch (e) {}
    return r;
  };
  const origMT = Game.tbMonsterTurn.bind(Game);
  Game.tbMonsterTurn = function (m) {
    if (curFight && m === curFight.deer) curFight.deerTurns++;
    return origMT(m);
  };
  const origChoose = Game.tbChooseMove.bind(Game);
  Game.tbChooseMove = function (m, foe) {
    const atk = origChoose(m, foe);
    if (curFight && m === curFight.deer && atk && /ocular/i.test(atk.name || '')) {
      curFight.declares++;
    }
    return atk;
  };
  // end-of-fight hook: record
  const origEnd = Game.tbEndCheck.bind(Game);
  Game.tbEndCheck = function () {
    const r = origEnd();
    try {
      if (r && curFight) {
        fights.push({ deerTurns: curFight.deerTurns, declares: curFight.declares });
        curFight = null;
      }
    } catch (e) {}
    return r;
  };

  const deaths = [];
  const origDie = Game.killScholar ? Game.killScholar.bind(Game) : null;
  // track via state: check scholar alive after run
  await quietLog(() => runDays(Game, competent, DAYS));
  const s = Game.state.scholar;
  const alive = s && s.alive !== false;
  // death cause from the last death record
  let deathCause = null;
  try {
    const dl = Game.state.deathLog || [];
    if (dl.length) deathCause = dl[dl.length - 1].cause || dl[dl.length - 1].how;
  } catch (e) {}
  const maxDeerTurns = fights.reduce((mx, f) => Math.max(mx, f.deerTurns), 0);
  const totalDeclares = fights.reduce((t, f) => t + f.declares, 0);
  return {
    seed,
    days: DAYS,
    alive,
    deathCause: deathCause,
    deathBucket: alive ? null : bucket(deathCause),
    gallowdeerFights: fights.length,
    maxDeerTurns,
    totalDeclares,
    maxScale: (Game.state.scale || 'village'),
  };
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`seed ${seed}...`);
    try {
      results.push(await runSeed(seed));
    } catch (e) {
      console.error(`seed ${seed} FATAL:`, e.message);
      results.push({ seed, error: String(e.message || e) });
    }
  }
  const summary = {
    lever: process.env.BEAM_FATIGUE === '0' ? 'OFF' : 'ON',
    seeds: SEEDS,
    days: DAYS,
    results,
    maxDeerTurns: Math.max(...results.map(r => r.maxDeerTurns || 0)),
    gallowdeerDeaths: results.filter(r => r.deathBucket === 'gallowdeer').length,
    totalDeaths: results.filter(r => !r.alive && !r.error).length,
  };
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(`wrote ${OUT}`);
  console.log(JSON.stringify(summary, null, 2));
})().catch(e => { console.error('FATAL', e.stack || e); process.exit(1); });
