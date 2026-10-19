#!/usr/bin/env node
// diag: why didn't the murder-spree policy murder? Run competent daily to day 20,
// report player position, atHaven, witnesses, hp on each murder-day.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const { competent } = require(path.join(ROOT, 'scripts', 'policies', 'competent'));

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'diag-murder' });
  await setupGame(Game);
  const wrap = Object.assign({}, competent, {
    daily(G, ctx) {
      try { competent.daily(G, ctx); } catch (e) {}
      const s = G.state.scholar || {};
      const day = s.day || 0;
      if (day >= 10 && day <= 22) {
        let atHaven = '?', wits = '?', pos = '?';
        try { atHaven = G.playerAtHaven ? G.playerAtHaven() : 'no-fn'; } catch (e) { atHaven = 'threw'; }
        try { const w = G.witnesses(6); wits = w == null ? 'null' : w.length; } catch (e) { wits = 'threw'; }
        try { pos = `${s.mx},${s.my} map=${G.map && G.map.px},${G.map && G.map.py}`; } catch (e) {}
        console.log(`day=${day} atHaven=${atHaven} wits=${wits} pos=${pos} hp=${s.health} tbfight=${!!G.tbfight}`);
      }
    },
  });
  await runDays(Game, wrap, { days: 24 });
  console.log('done, gameday', (Game.state.scholar || {}).day);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
