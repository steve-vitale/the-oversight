#!/usr/bin/env node
// Guard-take probe (sim-crumbguard-b): counts how many times the CRUMB-GUARD
// fired (crumbGuardTakes / crumbGuardRefusals) across a full run, by wrapping
// Game.pantryDraw. Answers: does the guard ever act on these seeds, and does
// it act differently where trajectories diverged (e.g. armed leadcourt s303)?
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const POLICIES = { leadcourt, belongseek };

async function probe(seed, pid) {
  process.env.CRUMBFLOOR = '1';
  const { Game } = await loadGame({ seed, mode: 'guardprobe-' + pid, fullTelemetry: false });
  await setupGame(Game);
  let takes = 0, refusals = 0, calls = 0;
  const orig = Game.pantryDraw.bind(Game);
  Game.pantryDraw = function (v, want, opts) {
    calls++;
    const out = orig(v, want, opts);
    if (out && out.crumbGuardTakes) takes += out.crumbGuardTakes;
    if (out && out.crumbGuardRefusals) refusals += out.crumbGuardRefusals;
    return out;
  };
  const policy = Object.assign({}, POLICIES[pid]);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 }); });
  console.log(`${pid} s${seed}: pantryDrawCalls=${calls} guardTakes=${takes} guardRefusals=${refusals} days=${result.days} end=${result.endReason}`);
}

async function main() {
  const seed = parseInt(process.argv[2] || '303', 10);
  const pid = process.argv[3] || 'leadcourt';
  await probe(seed, pid);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
