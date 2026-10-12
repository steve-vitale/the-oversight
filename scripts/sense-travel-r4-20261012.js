#!/usr/bin/env node
// sense-travel-r4-20261012.js — capture the full regional transcript of one seed.
// Usage: SEED=12 OUT=/tmp/r4-sense-12.txt DAYS=200 node scripts/sense-travel-r4-20261012.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');
const SEED = parseInt(process.env.SEED || '12', 10);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/r4-sense.txt';
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
      Game._sense.day = (Game.state.scholar || {}).day || 0;
    } catch (e) {}
  },
});
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'travelwinseek', fullTelemetry: false });
  await setupGame(Game);
  const res = await runDays(Game, policy, { days: DAYS });
  const re = /⛓️|🚶|🎁|🌾|🧳|📯|🤝|🔥|📡|tribute|accord|gesture|link|realm|court|polity|village|fire|speaker|representative|demand|arrears|oath|binding|schism|split/i;
  const lines = (Game._sense.lines || []).filter(m => re.test(m));
  const txt = `seed ${SEED} gameDays=${res.gameDays} endReason=${res.endReason}\n` +
    lines.map(m => m.replace(/\n/g, ' | ')).join('\n') + '\n';
  fs.writeFileSync(OUT, txt);
  console.log('wrote ' + OUT + ' (' + lines.length + ' regional lines of ' + Game._sense.lines.length + ' total)');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
