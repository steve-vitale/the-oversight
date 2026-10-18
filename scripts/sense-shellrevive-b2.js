#!/usr/bin/env node
// sense-shellrevive-b2 — capture say-beats around counter-shelling days.
// Reads the narration on shell days per the SENSE-TESTING LAW: the beats must
// read as a person taking stock, not a robot.
//
// Usage: node scripts/sense-shellrevive-b2.js [seed] [policy]
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const SR = require('./policies/shellrevive-b');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0'; process.env.SHELLREVIVE_B = '1';

const seed = parseInt(process.argv[2] || '7302', 10);
const pid = process.argv[3] || 'leadfeast';
const base = pid === 'leadfeast' ? leadfeast : belongfeast;

(async () => {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const policy = SR.withShellRevive(base, pid + '+shellrevive', 'sense');
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (m) {
    try {
      const s = String((m && (m.text || m.msg || m.message)) || m);
      if (/shell|crack|nut|Nothing edible|starv|hunger|counter|Put away|pantry|ration/i.test(s))
        beats.push(`d${(Game.state.scholar || {}).day}: ${s.slice(0, 240)}`);
      if (beats.length > 800) beats.splice(0, 200);
    } catch (e) {}
    return oSay(m);
  };
  let shellDays = 0;
  const oUp = policy.upkeep;
  const ctx = {};
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  const crackDays = [];
  for (const b of beats) if (/crack and pick/i.test(b)) { const d = b.split(':')[0]; if (!crackDays.includes(d)) crackDays.push(d); }
  console.log(`shell days (${crackDays.length}): ${crackDays.join(', ')}`);
  const show = crackDays.slice(0, 3);
  for (const b of beats) {
    const d = b.split(':')[0];
    if (show.includes(d)) console.log(b);
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
