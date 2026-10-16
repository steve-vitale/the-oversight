#!/usr/bin/env node
// Freeloader-manufacture probe (sim-crumbguard-b): does the CRUMB-GUARD's
// whole-piece over-feeding push honest villagers' 7-day net take rate above
// their fair share (drainBeyondCapacity), staging them for freeloader
// gossip/warning/vote? Compares control vs armed on one seed.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

async function probe(seed, armed) {
  if (armed) process.env.CRUMBFLOOR = '1'; else delete process.env.CRUMBFLOOR;
  const { Game } = await loadGame({ seed, mode: 'freeloadprobe-' + (armed ? 'armed' : 'ctrl'), fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, leadcourt);
  const maxStage = {};
  const origDaily = leadcourt.daily;
  policy.daily = (G, ctx) => {
    try {
      const vv = (G.state || {}).village || {};
      for (const vid of (vv.roster || [])) {
        const fl = (vv.freeload || {})[vid];
        if (fl) maxStage[vid] = Math.max(maxStage[vid] || 0, fl.stage || 0);
      }
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 }); });
  const v = Game.state.village || {};
  const staged = [];
  for (const vid of Object.keys(maxStage)) {
    if (maxStage[vid] > 0) {
      let net = 0;
      try { net = Game.takeRate7(vid) - Game.giveRate7(vid); } catch (e) {}
      const person = Game.getPerson(vid) || {};
      staged.push({ name: (person.name || vid).split(' ')[0], maxStage: maxStage[vid], net: Math.round(net), dead: !!person.dead });
    }
  }
  console.log(`${armed ? 'ARMED' : 'CTRL'} s${seed}: days=${result.days} end=${result.endReason} everStaged=${staged.length}`);
  for (const s of staged) console.log(`   ${s.name}: maxStage=${s.maxStage} netRate7(end)=${s.net}${s.dead ? ' DEAD' : ''}`);
}

async function main() {
  const seed = parseInt(process.argv[2] || '101', 10);
  const armed = process.env.CRUMBFLOOR === '1';
  await probe(seed, armed);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
