#!/usr/bin/env node
// probe-havendrink-beats-20261015.js — sense-test transcript probe for the
// HAVENDRINK layer. Runs one armed seed, captures Game.say beats, prints the
// water/commons beats with surrounding context so a human can read whether
// they sound like people managing the commons or a robot.
// Usage: HAVENDRINK=1 node scripts/probe-havendrink-beats-20261015.js [seed] [days]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

async function main() {
  const seed = +(process.argv[2] || 22);
  const days = +(process.argv[3] || 40);
  const policyArg = process.argv[4] || 'belongseek';
  for (const k of Object.keys(require.cache)) {
    if (k.indexOf('policies/') >= 0) delete require.cache[k];
  }
  const hd = require('./policies/havendrink');
  const policy = policyArg === 'leadcourt' ? hd.havendrinkLeadcourt : hd.havendrinkBelongseek;
  const { Game } = await loadGame({ seed, mode: 'havendrink-beats', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { beats.push({ day: (Game.state.scholar || {}).day || 0, text: String(msg).slice(0, 220) }); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const pwrap = Object.assign({}, policy);
  const od = policy.daily;
  let savedCtx = null;
  pwrap.daily = (G, ctx) => { savedCtx = ctx; return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, pwrap, { days, sampleEvery: 10 }); });
  const waterBeats = beats.filter(b =>
    /well|cistern|bottle|Filled 1L|thirst|hydrat|dehydrat|drink/i.test(b.text));
  console.log(`seed=${seed} days=${days} totalBeats=${beats.length} waterBeats=${waterBeats.length}`);
  console.log(`layer: filledDawn=${(savedCtx || {}).hd_filled_dawn || 0} skippedFloor=${(savedCtx || {}).hd_skipped_floor || 0}`);
  // print water beats with 2 beats of context each
  const idx = new Set();
  beats.forEach((b, i) => { if (/well|cistern|bottle|Filled 1L|thirst|hydrat|dehydrat|drink/i.test(b.text)) { idx.add(i - 2); idx.add(i - 1); idx.add(i); idx.add(i + 1); } });
  const order = [...idx].filter(i => i >= 0 && i < beats.length).sort((a, b) => a - b);
  let lastDay = -1;
  for (const i of order) {
    const b = beats[i];
    if (b.day !== lastDay) { console.log(`\n--- day ${b.day} ---`); lastDay = b.day; }
    console.log((/well|cistern|bottle|Filled 1L|thirst|hydrat|dehydrat|drink/i.test(b.text) ? '>> ' : '   ') + b.text);
  }
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
