#!/usr/bin/env node
// diag-winpathscenes-20261012.js — capture win-path scene dialogue (oath,
// Watchers, table approach) from an organic run for SENSE-TESTING (winpath r5).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fedseek } = require('./policies/winseek');
const seed = +process.argv[2] || 1;
(async () => {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const kept = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    const s = String(t);
    if (day >= 55 && /oath|OATH|swear|swore|Watchers|WATCHERS|table is being set|TABLE|tribute|TRIBUTE|realm|REALM/i.test(s)) {
      kept.push(`[d${day}] ${s.slice(0, 600)}`);
    }
    return origSay(t);
  };
  const res = await runDays(Game, Object.assign({}, fedseek), { days: 200, seed });
  console.log(`days=${res.days} end=${res.endReason} won=${!!Game.won}`);
  console.log('=== WIN-PATH SCENE LINES (d55+) ===');
  const seen = new Set();
  for (const k of kept) {
    const key = k.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    console.log('\n' + k);
  }
  console.log('\n(total kept: ' + kept.length + ', unique: ' + seen.size + ')');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
