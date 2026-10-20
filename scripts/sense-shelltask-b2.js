#!/usr/bin/env node
// sense-shelltask-b2 — capture say-beats around shelling days (armed run).
// Usage: SEED=8001 POLICY=belongfeast node scripts/sense-shelltask-b2.js
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const ST = require('./policies/shelltask-b2');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0'; process.env.SHELLCAMP = '1';

const SEED = parseInt(process.env.SEED || '8001', 10);
const POLICY = process.env.POLICY || 'belongfeast';
const base = POLICY === 'leadfeast' ? leadfeast : belongfeast;

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const policy = ST.withShellTask(base, POLICY + '+shelltask', 'sense');
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (m) {
    try {
      const s = String((m && (m.text || m.msg || m.message)) || m);
      if (/shell|crack|nut|Nothing edible|starv|hunger/i.test(s))
        beats.push(`d${(Game.state.scholar || {}).day}: ${s.slice(0, 220)}`);
      if (beats.length > 400) beats.splice(0, 100);
    } catch (e) {}
    return oSay(m);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  // print beats from days with shelling (crack beats) plus neighbors
  const crackDays = new Set();
  for (const b of beats) if (/crack and pick/i.test(b)) crackDays.add(b.split(':')[0]);
  console.log('shell days:', [...crackDays].join(', '));
  for (const b of beats) {
    const d = b.split(':')[0];
    if (crackDays.has(d)) console.log(b);
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
