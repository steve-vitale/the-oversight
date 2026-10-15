#!/usr/bin/env node
// scripts/sense-aidspoil-20261015.js — sense-test for SIM-AIDSPOIL.
// Runs aidLead armed 120d on seed 33 and dumps the aid/feast/tribute
// drawdown beats for a human read (SENSE-TESTING LAW — judge meaning,
// not counts). INFO-SKIP when the driver is absent.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let AS = null;
try { AS = require('./policies/aidspoil'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: aidspoil driver absent; sense status in evidence/2026-10-15/sim-aidspoil-b.md');
    process.exit(0);
  }
  throw e;
}

(async () => {
  const { Game } = await loadGame({ seed: 33, mode: 'aidspoil-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Haven sends .* kcal of grain|not the rot|eats itself|Tribute paid|Tribute short|tended/i.test(s))
        beats.push({ day: (Game.state.scholar || {}).day, text: s });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, AS.aidLead, { days: 120, sampleEvery: 10 }); });
  console.log(`sense run: seed 33, armed, ${beats.length} drawdown beats`);
  for (const b of beats.slice(0, 40)) console.log(`[d${b.day}] ${b.text.slice(0, 220)}`);
  if (beats.length > 40) console.log(`... (${beats.length - 40} more)`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
