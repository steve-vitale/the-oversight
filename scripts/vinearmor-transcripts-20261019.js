#!/usr/bin/env node
// vinearmor-transcripts-20261019.js — SAY-line transcript probe for sim-vinebank.
//
// Replays 2 armed-arm seeds and writes full + armor-filtered transcripts so a
// human can READ what the layer does (SENSE-TESTING LAW: testing must prove
// things are SENSICAL, not just functional). Restores sysSay like the armorup
// transcript probe.
//
// Usage: SEEDS=63802,63805 node scripts/armorprod-transcripts-20261019.js
// Writes: evidence/2026-10-19/armorprod-transcripts/<policy>-s<seed>.txt (+ -armor.txt filtered)
'use strict';
const fs = require('fs');
const path = require('path');
const VA = require('./policies/vinearmor');
const WS = require('./probe-windowsurvive-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63802, 63805]).filter(Number.isFinite);
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !process.env.ONLY || p === process.env.ONLY.toLowerCase());
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10) : 180;
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-19', 'vinearmor-transcripts');
fs.mkdirSync(OUT, { recursive: true });

function policyFor(policyId) {
  process.env.VINEARMOR = '1';
  const inner = WS.policyFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  return VA.withVineArmor(inner, `${tag}-vinearmor`, `${policyId} + vinearmor transcript probe`);
}

const ARMOR_RE = /armor|hide|bark|vine|craft|equip|too heavy|left where it lies|can't take it|comes apart|don't know how to make/i;

async function one(seed, policyId) {
  const lines = [];
  const base = policyFor(policyId);
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    try {
      const orig = G.say.bind(G);
      G.say = function (msg) { try { if (typeof msg === 'string') lines.push(`[d${((G.state.scholar || {}).day) || 0}] ${msg}`); } catch (e) {} return orig.apply(this, arguments); };
    } catch (e) {}
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'vinearmor', fullTelemetry: false });
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const full = path.join(OUT, `${policyId}-s${seed}.txt`);
  fs.writeFileSync(full, lines.join('\n') + '\n');
  const filt = lines.filter(l => ARMOR_RE.test(l));
  fs.writeFileSync(path.join(OUT, `${policyId}-s${seed}-armor.txt`), filt.join('\n') + '\n');
  console.log(`ok ${policyId}/s${seed}: ${lines.length} say lines, ${filt.length} armor-relevant`);
  delete process.env.VINEARMOR;
}

async function main() {
  for (const p of POLICIES) for (const s of SEEDS) await one(s, p);
  console.log('TRANSCRIPTS DONE');
}
if (require.main === module) main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
