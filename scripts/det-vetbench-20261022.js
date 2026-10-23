#!/usr/bin/env node
// det-vetbench-20261022.js — one-shot determinism driver for the vetbench
// proof gates. Runs ONE trajectory in its own process (the harness rule:
// never two harnesses in one node process — shared state) and prints the
// trajectory digest. The proof test execs this twice per gate and compares.
// VETBENCH is inherited from the environment (the test toggles it per gate).
//
// Usage: <pinned env> node scripts/det-vetbench-20261022.js <seed> <armed|control> <lead|belong> <days>
// Prints: <sha256 of day-hashes> <days run>
'use strict';
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const VB = require('./policies/vetbench');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261021');

const [seedArg, polArg, baseArg, daysArg] = process.argv.slice(2);
const seed = parseInt(seedArg, 10), days = parseInt(daysArg, 10) || 60;
const base = (baseArg === 'belong' || baseArg === 'belongfeast') ? 'belongfeast' : 'leadfeast';
if (polArg !== 'armed' && polArg !== 'control') { console.error('policy must be armed|control'); process.exit(2); }

(async () => {
  const policyObj = polArg === 'armed' ? VB.armedFor(base) : VB.substrateFor(base);
  const { Game } = await loadGame({ seed, mode: 'vetbench-det', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  if (t.instrumentErrors.length) { console.error('INSTRUMENT ERRORS: ' + t.instrumentErrors.join('; ')); process.exit(3); }
  const digest = crypto.createHash('sha256').update(hs.join('|')).digest('hex');
  console.log(digest + ' ' + hs.length);
})().catch(e => { console.error('DET CRASH:', e && e.stack || e); process.exit(1); });
