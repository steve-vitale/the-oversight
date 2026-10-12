#!/usr/bin/env node
// transcript-aid-20261012.js — capture aid-beat transcript lines for sense-testing.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt');

async function main() {
  const { Game } = await loadGame({ seed: 22, mode: 'scale-food' });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say;
  Game.say = function (msg) { try { said.push(String(msg)); } catch (e) {} return origSay.apply(this, arguments); };
  const policy = Object.assign({}, scalecourt);
  await runDays(Game, policy, 60, {});
  const aidLines = said.filter(m => /pack-mules|eating bark|fire network|walks in with|bins are echoing|grain to spare|remember it|FOR\./.test(m));
  console.log('=== aid-beat transcript (seed 22, 60d) ===');
  aidLines.slice(0, 12).forEach(m => console.log('•', m.slice(0, 220)));
  console.log('\n=== nearby context for first beg/offer ===');
  const idx = said.findIndex(m => /pack-mules|eating bark/.test(m));
  if (idx >= 0) for (let i = Math.max(0, idx - 2); i < Math.min(said.length, idx + 3); i++)
    console.log((i === idx ? '>> ' : '   ') + said[i].slice(0, 200));
}
main().catch(e => { console.error('FAIL', e); process.exit(2); });
