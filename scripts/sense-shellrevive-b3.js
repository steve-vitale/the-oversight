#!/usr/bin/env node
// scripts/sense-shellrevive-b3.js — capture say-beats around shelling days.
// Usage: SEED=7002 POLICY=belongfeast node scripts/sense-shellrevive-b3.js
'use strict';
const SEED = parseInt(process.env.SEED || '7002', 10);
const POLICY = process.env.POLICY || 'belongfeast';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const ST = require('./policies/shelltask-b');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0'; process.env.SHELLCAMP = '1';

(async () => {
  const base = POLICY === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed: SEED, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const policy = ST.withShellTask(base, POLICY + '+shell', 'sense');
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (m) {
    try {
      const s = String((m && (m.text || m.msg || m.message)) || m);
      if (/shell|crack|nut|Nothing edible|starv|hunger|pantry/i.test(s))
        beats.push(`d${(Game.state.scholar || {}).day}: ${s.slice(0, 220)}`);
      if (beats.length > 500) beats.splice(0, 100);
    } catch (e) {}
    return oSay(m);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  const crackDays = new Set();
  for (const b of beats) if (/crack and pick/i.test(b)) crackDays.add(b.split(':')[0]);
  console.log(`SEED=${SEED} POLICY=${POLICY} shell days:`, [...crackDays].join(', '));
  for (const b of beats) {
    const d = b.split(':')[0];
    if (crackDays.has(d)) console.log(b);
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
