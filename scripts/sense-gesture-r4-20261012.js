#!/usr/bin/env node
// sense-gesture-r4-20261012.js — read the played gesture beat: gesture lines,
// rep loans + returns, tribute/debt beats, foreign 4-realm news. SEED=10.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');
const SEED = parseInt(process.env.SEED || '10', 10);
const OUT = process.env.OUT || '/tmp/r4-gesture-sense.txt';
const policy = Object.assign({}, winseek, {
  id: 'travelwinseek',
  daily(Game, ctx) {
    try { if (winseek.daily) winseek.daily(Game, ctx); } catch (e) {}
    try {
      if (!Game._sense) {
        Game._sense = { lines: [] };
        const oSay = Game.say.bind(Game);
        Game.say = function (m) { try { if (typeof m === 'string') Game._sense.lines.push(m); } catch (e) {} return oSay(m); };
      }
    } catch (e) {}
  },
});
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'travelwinseek', fullTelemetry: false });
  await setupGame(Game);
  const res = await runDays(Game, policy, { days: 200 });
  const re = /first gesture|2,000 kcal|walks out to sit|ink dries|walks back in|never made it home|is back|bound itself|bound together|arrears|Arrears|tribute|Tribute|Dawn|NETWORK|Binding|oath/i;
  const lines = (Game._sense.lines || []).filter(m => re.test(m));
  fs.writeFileSync(OUT, `seed ${SEED} gameDays=${res.gameDays} ${res.endReason}\n` + lines.map(m => m.replace(/\n/g, ' | ')).join('\n') + '\n');
  console.log('wrote ' + OUT + ' (' + lines.length + ' of ' + Game._sense.lines.length + ')');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
