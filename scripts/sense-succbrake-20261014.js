#!/usr/bin/env node
// sense-succbrake-20261014.js — SENSE-TESTING for the succbrake arm: read the
// fortify/guard-posture transcript. Does it read as people grieving and
// regrouping, or as a robot hiding?
'use strict';
process.env.FOURTHLINK = '1';
process.env.SUCCBRAKE = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { succbrake } = require('./policies/succbrake');

const SAYRE = /holds Haven|sets a watch|mantle|died|dead|grief|funeral|🕯|fortif/i;

async function main() {
  const seed = parseInt(process.env.SEEDS || '44', 10);
  const { Game } = await loadGame({ seed, mode: 'succbrake-sense', fullTelemetry: true });
  await setupGame(Game);
  const gday = () => ((Game.state || {}).scholar || {}).day || 0;
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (SAYRE.test(text) && lines.length < 120) {
        lines.push({ day: gday(), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260) });
      }
    } catch (e) {}
    return origSay(msg);
  };
  await quietLog(() => runDays(Game, succbrake, { days: 150, sampleEvery: 10 }));
  console.log(`--- sense transcript: seed ${seed}, ${lines.length} lines ---`);
  for (const l of lines) console.log(`[d${l.day}] ${l.text}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
