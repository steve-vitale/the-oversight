#!/usr/bin/env node
// probe-w5avoid-sense-20261014.js — SENSE-TESTING LAW probe: run one armed
// seed with the event log CAPTURED (no quietLog) and print the doctrine's
// own beats (avoidance, holds, march refusals, engagements) plus a window
// of surrounding narration, so a human can judge whether the layer reads
// like village prudence or a robot.
//
// Usage: node scripts/probe-w5avoid-sense-20261014.js [seed] [days]
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.W5AVOID = '1';
let wa = null;
try { wa = require('./policies/w5avoid'); } catch (e) { /* absent: killed arm */ }
if (require.main === module && !wa) {
  console.log('INFO-SKIP: w5avoid layer absent (killed arm, deleted per kill protocol).');
  process.exit(0);
}
const { loadGame, setupGame, runDays } = require('./sim-harness');

(async () => {
  const seed = Number(process.argv[2] || 33);
  const days = Number(process.argv[3] || 120);
  const { Game } = await loadGame({ seed, mode: 'w5avoid-sense' });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say ? Game.say.bind(Game) : null;
  if (origSay) {
    Game.say = function (text) {
      try { said.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: String(text).slice(0, 220) }); } catch (e) {}
      return origSay(text);
    };
  }
  const policy = Object.assign({}, wa.leadfeastW5avoid);
  const result = await runDays(Game, policy, { days, sampleEvery: 10 });
  const keys = ['treeline', 'no one answers', 'walks around', 'the village holds',
    'on its own terms', 'no blood tonight', 'in no shape', 'alone — the village'];
  const hits = said.filter(s => keys.some(k => s.text.toLowerCase().indexOf(k) >= 0));
  console.log(`seed ${seed}: ${result.days}d ${result.endReason}; say lines ${said.length}; doctrine beats ${hits.length}`);
  const out = process.env.PROBE_OUT;
  if (out) {
    const fs = require('fs');
    fs.writeFileSync(out, hits.map(h => `d${h.day}: ${h.text}`).join('\n') + '\n');
    console.log(`wrote ${hits.length} doctrine beats to ${out}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
