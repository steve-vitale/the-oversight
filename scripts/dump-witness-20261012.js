#!/usr/bin/env node
// dump-witness-20261012.js — SENSE-TESTING: capture villager witness lines
// around kills (combatWitnessReact) + betrayal/justice trauma reactions.
// One seed replay, full say stream, filtered to witness/kill/gossip lines.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = parseInt(process.env.SEED || '11', 10);
  const days = parseInt(process.env.DAYS || '90', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'competent', fullTelemetry: true });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (line, ...rest) => { said.push({ day: (Game.state.scholar || {}).day, line: String(line) }); return origSay(line, ...rest); };
  const policy = Object.assign({}, competent);
  const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
  const tele = result.telemetry || [];
  const pat = /watches|jaw tight|stares at the body|whoops|Remind me not to cross|It's dead|You're bleeding|backs away|pale|RUN|freezes|What IS that|spits|Coward|Good call|raw after the killing|raw after the exile|room is wrong|will dream|trauma/i;
  const seen = new Set();
  for (const s of said) {
    if (!pat.test(s.line)) continue;
    const k = s.line.slice(0, 90);
    if (seen.has(k)) continue;
    seen.add(k);
    console.log('day ' + s.day + ' | ' + s.line.slice(0, 200));
  }
  // count kill moments vs witness lines
  const kills = tele.filter(e => e.type === 'combat_end' && /won/i.test(e.result || '')).length;
  console.log('\ncombats won (kill moments):', kills, '| unique witness-ish lines:', seen.size);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
