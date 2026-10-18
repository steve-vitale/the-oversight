#!/usr/bin/env node
// probe-hideflow2-20261018.js — hook carcassToMeat to count animal kills
// butchered + hides yielded, and sample scholar inventory hides daily.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required'); process.exit(2); }

const SEEDS = [6113417, 6223527];
const POLICIES = ['leadfeast', 'belongfeast'];

async function runOne(seed, policyId) {
  const policy = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'probe-hideflow2', fullTelemetry: false });
  await setupGame(Game);
  let butchers = 0, hideYielded = 0, animalsYielded = {};
  const orig = Game.carcassToMeat;
  Game.carcassToMeat = function (it, inv) {
    const aid = (it && it.plantId || '').replace(/^meat_/, '');
    butchers++;
    const r = orig.call(this, it, inv);
    const got = Array.isArray(r) ? r.join(' ') : '';
    const m = got.match(/(\d+) hides?/);
    if (m) hideYielded += parseInt(m[1], 10);
    animalsYielded[aid] = (animalsYielded[aid] || 0) + 1;
    return r;
  };
  const base = Object.assign({}, policy);
  let result;
  await quietLog(async () => { result = await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`[${policyId} s${seed}] days=${result.days} end=${result.endReason} butchers=${butchers} hideYielded=${hideYielded}`);
  const top = Object.entries(animalsYielded).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`   animals: ${JSON.stringify(top)}`);
}

(async () => {
  for (const seed of SEEDS) for (const pid of POLICIES) await runOne(seed, pid);
  console.log('PROBE2 DONE');
})().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
