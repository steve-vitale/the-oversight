#!/usr/bin/env node
// probe-w5avoid2-sense-20261015.js — sense probe for the W5-AVOIDANCE
// DOCTRINE arm (clearing half deleted). Captures the doctrine's beats
// (avoidance alerts + travel refusals) from a live armed run and prints
// them for the SENSE-TESTING LAW read: meaning, coherence, consequences —
// not just counts.
//
// Usage: SEED=33 node scripts/probe-w5avoid2-sense-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.W5AVOID2 = '1';
let wa = null;
try { wa = require('./policies/w5avoid2'); } catch (e) { /* absent: killed arm */ }
if (require.main === module && !wa) {
  console.log('INFO-SKIP: w5avoid2 layer absent (killed arm, deleted per kill protocol).');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  const seed = Number(process.env.SEED || '33');
  const { Game } = await loadGame({ seed, mode: 'w5avoid2-sense' });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => {
    const s = String(t);
    // the doctrine's own beats (avoidBeat + travel-refusal), not engine flavor
    if (/no one answers that|gives it the night|shutters its doors|on that ground/.test(s)) {
      try { beats.push('d' + (((Game.state || {}).scholar || {}).day || 0) + ': ' + s); } catch (e) {}
    }
    return origSay(t);
  };
  const policy = Object.assign({}, wa.leadfeastW5avoid2);
  const origDaily = policy.daily.bind(policy);
  let ctx = null;
  policy.daily = (G, c) => { ctx = c; return origDaily(G, c); };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, sampleEvery: 10 }); });
  console.log(`seed ${seed}: ${result.days}d ${result.endReason}`);
  console.log(`telemetry: alertDays=${ctx.w5AlertDays || 0} avoided=${ctx.w5Avoided || 0} ` +
    `(raider ${ctx.w5Avoided_raider || 0} / lingerer ${ctx.w5Avoided_lingerer || 0} / follower ${ctx.w5Avoided_follower || 0}) ` +
    `marchRefused=${ctx.w5MarchRefused || 0}`);
  console.log(`--- ${beats.length} doctrine beats (first 40) ---`);
  for (const b of beats.slice(0, 40)) console.log(b);
  if (beats.length > 40) console.log(`... +${beats.length - 40} more`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
