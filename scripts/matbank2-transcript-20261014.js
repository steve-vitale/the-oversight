#!/usr/bin/env node
// matbank2-transcript-20261014.js — sense-read probe: capture Game.say lines
// around vine/stick/craft/fire events on a short armed run, so the evidence
// can judge whether the banking beats read as a person deciding.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

const SEED = parseInt(process.env.SEED || '11', 10);
const DAYS = parseInt(process.env.DAYS || '40', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'matbank2-transcript' });
  await setupGame(Game);
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const day = (Game.state.scholar || {}).day || 0;
      const m = String(msg || '');
      if (/crafting material|You make a|comes apart in your hands|thicket|check the snares|Snares were/i.test(m)) {
        said.push(`d${day}: ${m.slice(0, 160)}`);
      }
    } catch (e) {}
    return _say.apply(this, arguments);
  };
  const policy = Object.assign({}, leadcourt);
  await runDays(Game, policy, { days: DAYS, manifest: { seed: SEED, policy: 'leadcourt' } });
  const inv = (Game.state.scholar.inventory || [])
    .filter(i => i && (i.material === 'vine' || i.material === 'stick'))
    .map(i => `${i.material}x${i.units}`).join(', ');
  console.log(`MATBANK2=${process.env.MATBANK2 === '1' ? '1' : 'off'} seed=${SEED} days=${DAYS}`);
  console.log(`end pack vine/stick: ${inv || '(none)'}`);
  console.log('--- material/craft/fire say lines ---');
  const seen = new Set();
  for (const line of said) {
    const key = line.replace(/^d\d+: /, '').slice(0, 80);
    if (seen.has(key)) continue; // dedupe repeats
    seen.add(key);
    console.log(line);
    if (seen.size >= 40) break;
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
