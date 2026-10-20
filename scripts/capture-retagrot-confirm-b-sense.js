#!/usr/bin/env node
// capture-retagrot-confirm-b-sense.js — capture the say-stream transcript of one
// armed retagrot-b run for a SENSE read (SENSE-TESTING LAW).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 RETAGROT_B=1 \
//   POLICY=leadretagrot SEED=5411 DAYS=90 OUT=evidence/2026-10-20/sense-retagrot-confirm-b.txt \
//   node scripts/capture-retagrot-confirm-b-sense.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadretagrot, belongretagrot } = require('./policies/retagrot-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SURPLUSFEED === '1') { console.error('FATAL: SURPLUSFEED must be unset'); process.exit(2); }

const POLICIES = { leadretagrot, belongretagrot };
const POLICY = POLICIES[process.env.POLICY || 'leadretagrot'];
const SEED = parseInt(process.env.SEED || '5411', 10);
const DAYS = parseInt(process.env.DAYS || '90', 10);
const OUT = process.env.OUT || ('evidence/2026-10-20/sense-retagrot-confirm-b.txt');
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'retagrot-b-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const oSay = Game.say;
  Game.say = function (m) { try { lines.push(`[d${dayOf(Game)}] ${String(m)}`); } catch (e) {} return oSay.apply(this, arguments); };
  const P = Object.assign({}, POLICY);
  await runDays(Game, P, { days: DAYS, manifest: null, sampleEvery: 181 });
  fs.writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`wrote ${OUT}: ${lines.length} say-lines, ${DAYS}d (seed ${SEED})`);
})().catch(e => { console.error('SENSE CAPTURE CRASH', e); process.exit(2); });
