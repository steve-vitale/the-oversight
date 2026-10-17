#!/usr/bin/env node
// dump-fights-20261017.js — read-only full TB fight table dump for
// divergence forensics (sim-pyrrhic). No game changes; reuses the attrcensus
// capture instrument. Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 node scripts/dump-fights-20261017.js <policy> <seed> <out.json>
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));
const TFUN = require('./trickfunnel-instrument-20261016.js');
const { attachAttrcensusCapture } = require('./attrcensus-instrument-20261017.js');

const [policyId, seedStr, outPath] = process.argv.slice(2);
const seed = parseInt(seedStr, 10);

(async () => {
  const policy = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'pyrrhic-forensic', fullTelemetry: false });
  await setupGame(Game);

  // Also log every recordPyrrhicKill call (the fix's only new state writer).
  const pyrCalls = [];
  if (typeof Game.recordPyrrhicKill === 'function') {
    const _rpk = Game.recordPyrrhicKill.bind(Game);
    Game.recordPyrrhicKill = function (mid, vid, via, detail) {
      try { pyrCalls.push({ d: (Game.state.scholar || {}).day || 0, mid: mid, by: vid, via: via, trick: detail || null }); } catch (e) {}
      return _rpk(mid, vid, via, detail);
    };
  }

  const cap = attachAttrcensusCapture(Game, TFUN);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();

  const fights = cap.tbFights.map(t => ({
    seq: t.seq, day: t.day, result: t.result,
    pAlive: t.pAlive, mids: t.mids,
    perfs: Object.fromEntries(Object.entries(t.perfs || {}).map(([k, v]) => [k, v.length])),
    mortality: t.mortality,
  }));
  require('fs').writeFileSync(outPath, JSON.stringify({
    seed, policyId, days: result.days, endReason: result.endReason,
    pyrrhicCalls: pyrCalls, fights: fights,
  }, null, 1));
  console.log(`wrote ${outPath}: ${fights.length} fights, ${pyrCalls.length} recordPyrrhicKill calls, days=${result.days}`);
})().catch(e => { console.error('DUMP CRASH:', e); process.exit(2); });
