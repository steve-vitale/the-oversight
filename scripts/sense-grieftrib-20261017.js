#!/usr/bin/env node
// scripts/sense-grieftrib-20261017.js — sense-test for sim-grieftrib.
// Re-runs one grief-heavy seed armed and dumps the grief-negotiation beats
// for a human read (SENSE-TESTING LAW — judge meaning, not counts): the
// staged beat, the gift/visit answer, the "grief met with grain" line, and
// the surrounding succession fiction.
// Usage: SEED=9922 GRIEFTRIB=1 FEASTSCALE_R13=1 node scripts/sense-grieftrib-20261017.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '9922', 10);
if (process.env.GRIEFTRIB !== '1') {
  console.log('INFO-SKIP: sense run needs GRIEFTRIB=1 (armed)');
  process.exit(0);
}
let GT = null;
try { GT = require('./policies/grieftrib'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') { console.log('INFO-SKIP: grieftrib absent'); process.exit(0); }
  throw e;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'grieftrib-sense', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/grief|renegotiat|installs their own|grief card|tribute rises|tribute stays|succession|dead — and the dead/i.test(s))
        beats.push({ day: (Game.state.scholar || {}).day, text: s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ') });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const policy = Object.assign({}, GT.belongfeast);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 10 }); });
  console.log(`sense run: seed ${SEED}, belongfeast armed, ${beats.length} grief beats`);
  for (const b of beats) console.log(`[d${b.day}] ${b.text.slice(0, 280)}`);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
