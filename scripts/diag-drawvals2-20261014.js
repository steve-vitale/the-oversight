#!/usr/bin/env node
// scripts/diag-drawvals2-20261014.js — capture RNG draw values+stacks in the
// split window via the harness hook; diff A vs B.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays } = require('./sim-harness');

async function runOnce() {
  global.__countRng = true; global.__rngDraws = 0;
  global.__logDraws = true; global.__drawLo = 136700; global.__drawHi = 140500;
  global.__drawLog = [];
  const { Game } = await loadGame({ seed: 11, mode: 'drawvals2-s11' });
  await setupGame(Game);
  const r = await runDays(Game, leadfeast, { days: 60, sampleEvery: 1 });
  global.__countRng = false; global.__logDraws = false;
  const log = global.__drawLog; global.__drawLog = [];
  return { log, days: r.days };
}

async function main() {
  const A = await runOnce();
  const B = await runOnce();
  console.log(`A draws: ${A.log.length}, B draws: ${B.log.length}, days ${A.days}/${B.days}`);
  const n = Math.min(A.log.length, B.log.length);
  for (let i = 0; i < n; i++) {
    if (A.log[i].v !== B.log[i].v) {
      console.log(`FIRST VALUE DIVERGENCE at log idx ${i} (draw #${A.log[i].n}):`);
      console.log(`  A: v=${A.log[i].v}\n     ${A.log[i].site}`);
      console.log(`  B: v=${B.log[i].v}\n     ${B.log[i].site}`);
      for (let j = i; j < Math.min(i + 5, B.log.length); j++)
        console.log(`  B[+${j - i}] #${B.log[j].n} v=${B.log[j].v}\n     ${B.log[j].site}`);
      return;
    }
  }
  if (A.log.length !== B.log.length)
    console.log(`values identical; count differs A ${A.log.length} vs B ${B.log.length}`);
  else console.log('IDENTICAL across window');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
