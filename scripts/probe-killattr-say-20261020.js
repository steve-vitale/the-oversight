#!/usr/bin/env node
// probe-killattr-say-20261020.js — one-shot narrative probe: re-run a seed
// with Game.say captured, dump the say window around a death day to identify
// HOW a wave-3/4 monster reaches the scholar at Haven on a non-raid night.
// Usage: ... env ... DAYS=90 SEED=64002 ONLY=leadfeast DEATHDAY=85 node scripts/probe-killattr-say-20261020.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const SW = require(path.join(REPO, 'scripts', 'probe-w5path-20261019'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

const SEED = parseInt(process.env.SEED || '64002', 10);
const POLICY = process.env.ONLY || 'leadfeast';
const DEATHDAY = parseInt(process.env.DEATHDAY || '85', 10);
const DAYS = parseInt(process.env.DAYS || String(DEATHDAY + 3), 10);

async function main() {
  const policy = SW.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'killattr-say', fullTelemetry: false });
  const says = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (line) {
    try {
      const d = ((Game.state || {}).scholar || {}).day | 0;
      says.push({ d, line: String(line).slice(0, 300) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  await setupGame(Game);
  const pol = Object.assign({}, policy);
  await quietLog(async () => { await runDays(Game, pol, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const lo = DEATHDAY - 4, hi = DEATHDAY + 1;
  for (const s of says) {
    if (s.d < lo || s.d > hi) continue;
    // Filter to combat/raid/encounter-relevant lines to keep it readable.
    if (/RAID|⚔|THE BIG|COMBAT|treeline|bedroll|lingering|Nobody met|met them|pending|wakes|🌪️|BEAST|SUBURB|suburb/i.test(s.line)) {
      console.log(`[d${s.d}] ${s.line}`);
    }
  }
}
main().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
