#!/usr/bin/env node
// scripts/diag-racks-hungry-20261013.js — does the famine-aware guard's
// override condition ever co-occur with racks-full? Logs per cook resolution:
// preservedKcal, rackCap, pantryDays, and whether the lever would stand down.
// Usage: SEEDS="11,22" DAYS=60 FOODLEVER_R5=1 node scripts/diag-racks-hungry-20261013.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seeds = (process.env.SEEDS || '11,22').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '60', 10);
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'rackshungry' });
    await setupGame(Game);
    const stat = { res: 0, guardFires: 0, hungryAndFull: 0, samples: [] };
    const orig = Game.resolveOneAssignment;
    Game.resolveOneAssignment = function (vid, a) {
      if (a && a.task === 'cook') {
        try {
          const v = Game.state.village;
          let pk = 0;
          for (const it of (v.pantry || []))
            if (it && (it.foodState === 'preserved' || it.foodState === 'rendered')) pk += (it.kcalEach || 0) * (it.units || 1);
          // rackCap needs skill; approximate with unskilled (15d shelf)
          const rackCap = 125 * ((v.roster || []).length || 10) * 13;
          let pd = 999;
          try { pd = Game.pantryDaysEstimate(); } catch (e) {}
          stat.res++;
          const full = pk >= rackCap;
          const hungry = pd < 7;
          if (full) stat.guardFires++;
          if (full && hungry) { stat.hungryAndFull++; stat.samples.push(`d${(Game.state.scholar||{}).day}:pk=${Math.round(pk/1000)}k,pd=${pd}`); }
        } catch (e) {}
      }
      return orig.apply(this, arguments);
    };
    const policy = Object.assign({}, competent);
    await runDays(Game, policy, { days });
    console.log(`seed ${seed}: cookRes=${stat.res} guardWouldFire=${stat.guardFires} hungryAndFull=${stat.hungryAndFull}`);
    for (const s of stat.samples.slice(0, 5)) console.log('  ', s);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
