#!/usr/bin/env node
// probe-landing-grief-20261015.js — landing-window grief sense probe.
// A villager dies on day 5 via the REAL registerDeath hook; day 6 the player
// talks to someone at haven. Captures the FULL transcript for sense-reading.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, quietLog, ROOT } = require('./sim-harness');
const OUT = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-15');
(async () => {
  const { Game } = await loadGame({ seed: 77, mode: 'landing-grief-probe' });
  Game.debugRegion = 'na_eastern_woodlands';
  await quietLog(async () => {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  });
  const L = [];
  const log = (s) => L.push(s);
  const others = () => Game.state.village.roster.filter(id => id !== Game.villagerId);
  Game.state.scholar.day = 5;
  const dead = others()[3];
  const deadName = Game.displayName(dead);
  Game.registerDeath({ kind: 'villager', villagerId: dead, name: deadName, cause: 'sickness', mx: 4, my: 4 });
  log(`[day 5] ${deadName} died of sickness. village.grief=${Game.state.village.grief}`);
  Game.state.scholar.day = 6;
  const partner = others().find(id => id !== dead && Game.commLevel(id).level !== 'none') || others().find(id => id !== dead);
  log(`[day 6] talking to ${Game.displayName(partner)}`);
  log('');
  let r = Game.startConvo(partner);
  const sayThem = (line) => log('THEM: ' + String(line || '(no line)').slice(0, 400));
  sayThem(r.line);
  for (let i = 0; i < 10 && r && !r.ended; i++) {
    const choices = r.choices || [];
    const ids = choices.map(c => c.id);
    // prefer grief-engaging choices when present
    const pick = ids.find(x => x === 'dlg:comfort') || ids.find(x => x === 'dlg:empathize')
      || ids.find(x => x === 'dlg:askwhy') || ids.find(x => x === 'goon')
      || ids.find(x => x.indexOf('ans:') === 0) || ids.find(x => x === 'silence') || ids[0];
    const label = (choices.find(c => c.id === pick) || {}).label || '';
    log(`YOU: [${pick}] ${String(label).slice(0, 90)}`);
    if (!pick || pick === 'leave') break;
    r = Game.convoTurn(partner, pick);
    sayThem(r.line);
    if (r.ended) { log('(ended by engine)'); break; }
  }
  try { const e = Game.endConvo(partner, 'done'); if (e && e.line) log('CLOSING: ' + e.line); } catch (err) {}
  fs.writeFileSync(path.join(OUT, 'journey-landing-r16-grief-probe.txt'), L.join('\n') + '\n');
  console.log(L.join('\n'));
})();
