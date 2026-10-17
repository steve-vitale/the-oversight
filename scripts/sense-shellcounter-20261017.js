#!/usr/bin/env node
// sense-shellcounter — capture say-beats around counter-shelling days
// (s7302 leadfeast armed: 14 shell days, 71,779 lean kcal).
'use strict';
const { leadfeast } = require('./policies/feastscale');
const SC = require('./policies/shellcounter');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0'; process.env.SHELLCOUNTER = '1';

(async () => {
  const { Game } = await loadGame({ seed: 7302, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const policy = SC.withShellCounter(leadfeast, 'leadfeast+shellcounter', 'sense');
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (m) {
    try {
      const s = String((m && (m.text || m.msg || m.message)) || m);
      if (/shell|crack|nut|Nothing edible|starv|hunger|counter|Put away|pantry/i.test(s))
        beats.push(`d${(Game.state.scholar || {}).day}: ${s.slice(0, 240)}`);
      if (beats.length > 600) beats.splice(0, 150);
    } catch (e) {}
    return oSay(m);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  const crackDays = new Set();
  for (const b of beats) if (/crack and pick/i.test(b)) crackDays.add(b.split(':')[0]);
  const days = [...crackDays].slice(0, 3);
  console.log('shell days (first 3):', [...crackDays].join(', '));
  for (const b of beats) {
    const d = b.split(':')[0];
    if (days.includes(d)) console.log(b);
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
