#!/usr/bin/env node
// det-vetrestage.js — determinism probe for the sim-vetrestage proof.
// Runs one seed/policy/arm for N days and prints a digest of the dayHash
// chain + days + retention-trace length. The proof test compares:
//   control (VETRESTAGE unset, VS.substrateFor) vs
//   gate-off (VETRESTAGE unset, VS.armedFor)  -> must be byte-identical
// and armed (VETRESTAGE=1) vs itself -> deterministic re-run.
// Usage: node scripts/det-vetrestage.js <seed> <lead|belong> <control|armed> <days>
'use strict';
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VS = require(path.join(REPO, 'scripts', 'policies', 'vetrestage'));

const [seedArg, polArg, armArg, daysArg] = process.argv.slice(2);
const seed = parseInt(seedArg, 10), days = parseInt(daysArg, 10) || 60;
if (!Number.isFinite(seed) || (polArg !== 'lead' && polArg !== 'belong') || (armArg !== 'control' && armArg !== 'armed')) {
  console.error('usage: det-vetrestage.js <seed> <lead|belong> <control|armed> <days>');
  process.exit(2);
}
(async () => {
  const base = polArg === 'belong' ? 'belongfeast' : 'leadfeast';
  const policy = armArg === 'armed' ? VS.armedFor(base) : VS.substrateFor(base);
  const { Game } = await loadGame({ seed, mode: 'vetrestage-det', fullTelemetry: false });
  await setupGame(Game);
  const chain = [];
  let capturedCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      capturedCtx = ctx;
      chain.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => runDays(Game, wrapped, { days, manifest: undefined, sampleEvery: 30 }));
  const digest = crypto.createHash('sha256').update(chain.join('\n')).digest('hex').slice(0, 16);
  const vsLen = (capturedCtx && capturedCtx.vsTrace ? capturedCtx.vsTrace.length : 0);
  console.log(`${digest} ${result.days} ${vsLen}`);
})().catch(e => { console.error('DET FAILED:', (e && e.stack) || e); process.exit(1); });
