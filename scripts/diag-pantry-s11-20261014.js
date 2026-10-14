#!/usr/bin/env node
// scripts/diag-pantry-s11-20261014.js — who touches the pantry on s11 days 38-46?
// Wraps Game._removePantryKcal + tracks pantry item-count; runs twice in-process.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays } = require('./sim-harness');

function pantryKcal(Game) {
  try { return Math.round(((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return -1; }
}
function pantryN(Game) { try { return (Game.state.village || {}).pantry.length; } catch (e) { return -1; } }

async function runOnce(tag) {
  const { Game } = await loadGame({ seed: 11, mode: 'pantry-s11' });
  await setupGame(Game);
  const log = [];
  const orig = Game._removePantryKcal;
  if (typeof orig === 'function') {
    Game._removePantryKcal = function (kcal) {
      const day = (Game.state.scholar || {}).day || 0;
      if (day >= 36 && day <= 48) {
        let site = '?';
        try {
          const st = new Error().stack.split('\n');
          site = st.slice(2, 6).map(l => l.trim().replace(/.*\//, '').slice(0, 80)).join(' <- ');
        } catch (e) {}
        log.push({ day, kcal, site });
      }
      return orig.apply(this, arguments);
    };
  }
  const dailyPantry = [];
  const wrapped = Object.assign({}, leadfeast);
  const base = leadfeast.daily;
  wrapped.daily = (G, ctx) => {
    const day = (Game.state.scholar || {}).day || 0;
    if (day >= 36 && day <= 48) dailyPantry.push({ day, kcal: pantryKcal(Game), n: pantryN(Game) });
    return base(G, ctx);
  };
  const r = await runDays(Game, wrapped, { days: 180, sampleEvery: 1 });
  return { log, dailyPantry, days: r.days, endReason: r.endReason };
}

async function main() {
  const A = await runOnce('A');
  const B = await runOnce('B');
  console.log(`A: ${A.days}/${A.endReason} B: ${B.days}/${B.endReason}`);
  console.log('--- daily pantry A vs B (days 36-48) ---');
  const n = Math.max(A.dailyPantry.length, B.dailyPantry.length);
  for (let i = 0; i < n; i++) {
    const a = A.dailyPantry[i], b = B.dailyPantry[i];
    const mark = (a && b && (a.kcal !== b.kcal || a.n !== b.n)) ? '  <-- DIFF' : '';
    console.log(`d${a ? a.day : '?'}: A ${a ? a.kcal + '/' + a.n : '-'}  B ${b ? b.kcal + '/' + b.n : '-'}${mark}`);
  }
  console.log('--- _removePantryKcal calls A (days 36-48) ---');
  for (const e of A.log) console.log(`  d${e.day} -${e.kcal}: ${e.site}`);
  console.log('--- _removePantryKcal calls B (days 36-48) ---');
  for (const e of B.log) console.log(`  d${e.day} -${e.kcal}: ${e.site}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
