#!/usr/bin/env node
// Sense-test sampler: run one seed with SHAREPOL=1, dump sharing beats + villager
// reactions for the SENSE-TESTING LAW (judge meaning, coherence, relevance).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { withShare } = require('./policies/sharepol');
const { leadcourt } = require('./policies/leadcourt');

(async () => {
  const { Game } = await loadGame({ seed: 33, mode: 'sharepol-sense', fullTelemetry: false });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { said.push(`[d${(Game.state.scholar || {}).day}] ${t}`); return origSay(t); };
  const policy = withShare(Object.assign({}, leadcourt));
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest: undefined, sampleEvery: 10 }); });
  const shareBeats = said.filter(s => /You give|You press|Thank you|won't forget|portions of|no one sees|No one sees|That's\.\.\. it/i.test(s));
  console.log(`days=${result.days} end=${result.endReason}`);
  console.log(`total say lines: ${said.length}, sharing beats: ${shareBeats.length}`);
  console.log('--- sharing beats (first 25) ---');
  for (const b of shareBeats.slice(0, 25)) console.log(b);
  // villager reactions: memories written on recipients
  console.log('--- gift memories sample ---');
  const v = Game.state.village || {};
  let shown = 0;
  for (const [vid, mems] of Object.entries(v.memory || {})) {
    const gifts = (mems || []).filter(m => m.t === 'gift' || m.t === 'private_gift' || m.t === 'stingy_gift');
    if (gifts.length && shown < 6) {
      shown++;
      console.log(`  ${vid.slice(0, 12)}: ${gifts.map(g => g.t + (g.d ? ':' + g.d : '')).join(', ')}`);
    }
  }
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
