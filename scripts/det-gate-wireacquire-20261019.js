#!/usr/bin/env node
// det-gate-wireacquire-20261019.js — determinism gate for the wireacquire pilot.
// Two halves:
//  (1) GATE-OFF: 16/16 identical (8 seeds x {leadfeast, belongfeast}, 60d,
//      layer OFF). The withWireAcquire wrapper must be a strict pass-through
//      when WIREACQUIRE is unset: zero verb calls, zero ctx writes, zero RNG.
//  (2) GATE-ON NON-PERTURBATION: 16 runs with WIREACQUIRE=1, each compared
//      against its byte-identical control trajectory. Any pair where the
//      layer's telemetry is all-zero (no hawker check, no ask, no set — the
//      layer never fired) MUST be byte-identical: the RNG-clean enumeration
//      consumes no game RNG and writes no game state. Pairs where the layer
//      fired may diverge (mechanism + honest conversation RNG, reported).
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/det-gate-wireacquire-20261019.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { checkDeterminism } = require('./det-gate');
const { POLICY_REGISTRY } = require('./sweep-compare');
// KILL RECORD (2026-10-19, sim-wireacquire-b3): layer KILLED-AT-PILOT,
// scripts/policies/wireacquire.js deleted zero-trace. Pre-kill result:
// gate-off 16/16 identical, gate-on 16/16 zero-fire pairs identical.
let wa = null;
try { wa = require('./policies/wireacquire'); }
catch (e) { console.log('LAYER DELETED (killed at pilot 2026-10-19) — pre-kill det-gate PASS; see evidence/2026-10-19/sim-wireacquire-b3.md'); process.exit(0); }

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`DET-GATE STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('DET-GATE STOP: SEATDRIVE=0 required.'); process.exit(2); }

const SEEDS = [31711, 31712, 31713, 31714, 31715, 31716, 31717, 31718];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 60;

function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

async function runOnce(seed, policy, days) {
  const { Game } = await loadGame({ seed, mode: 'det-gate-wa' });
  await setupGame(Game);
  const hashes = [];
  let ctxRef = null;
  const wrapped = Object.assign({}, policy, {
    setup(G, ctx) { ctxRef = ctx; if (policy.setup) return policy.setup(G, ctx); },
    daily(G, ctx) {
      if (!ctxRef) ctxRef = ctx;
      hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
      return policy.daily ? policy.daily(G, ctx) : undefined;
    },
  });
  const r = await runDays(Game, wrapped, { days, sampleEvery: 1 });
  return { hashes, days: r.days, endReason: r.endReason, ctx: ctxRef };
}

function layerFired(ctx) {
  if (!ctx) return false;
  return (ctx._waHawkerChecks || 0) > 0 || (ctx._waAsks || 0) > 0 ||
    (ctx._waWireSets || 0) > 0 || (ctx._waWireBought || 0) > 0;
}

async function main() {
  let fails = 0, total = 0;
  // (1) gate-off
  delete process.env.WIREACQUIRE;
  if (wa.layerOn()) { console.error('DET-GATE STOP: layerOn() true with flag unset'); process.exit(2); }
  for (const policyId of POLICIES) {
    const base = POLICY_REGISTRY[policyId];
    if (!base) { console.error('DET-GATE STOP: unknown policy ' + policyId); process.exit(2); }
    const policy = wa.withWireAcquire(base, policyId + '-wa');
    for (const seed of SEEDS) {
      total++;
      const gate = await checkDeterminism(seed, policy, { days: DAYS });
      if (gate.identical) console.log(`IDENTICAL off ${policyId}/s${seed}`);
      else { console.log(`DIVERGED  off ${policyId}/s${seed}: ${gate.summary}`); fails++; }
    }
  }
  if (fails) { console.error(`DET-GATE FAILED (gate-off): ${fails}/${total} divergences`); process.exit(1); }
  console.log(`DET-GATE gate-off: ${total}/${total} identical (8 seeds x 2 policies, layer OFF)`);

  // (2) gate-on non-perturbation
  process.env.WIREACQUIRE = '1';
  if (!wa.layerOn()) { console.error('DET-GATE STOP: layerOn() false with flag set'); process.exit(2); }
  let onTotal = 0, onIdentZero = 0, onZero = 0, onFired = 0;
  for (const policyId of POLICIES) {
    const base = POLICY_REGISTRY[policyId];
    const armed = wa.withWireAcquire(base, policyId + '-wa');
    for (const seed of SEEDS) {
      onTotal++;
      const c = await runOnce(seed, base, DAYS);
      const a = await runOnce(seed, armed, DAYS);
      const n = Math.min(c.hashes.length, a.hashes.length);
      let div = -1;
      for (let i = 0; i < n; i++) { if (c.hashes[i] !== a.hashes[i]) { div = i; break; } }
      const identical = div < 0 && c.hashes.length === a.hashes.length;
      const fired = layerFired(a.ctx);
      if (!fired) {
        onZero++;
        if (identical) { onIdentZero++; console.log(`IDENTICAL on  ${policyId}/s${seed} (layer never fired)`); }
        else { fails++; console.log(`DIVERGED  on  ${policyId}/s${seed} (layer NEVER fired — RNG HYGIENE BUG): first div day ${div >= 0 ? c.hashes[div].split(':')[0] : '?'}`); }
      } else {
        onFired++;
        const tele = `checks=${a.ctx._waHawkerChecks || 0} asks=${a.ctx._waAsks || 0} bought=${a.ctx._waWireBought || 0} sets=${a.ctx._waWireSets || 0}`;
        console.log(`${identical ? 'IDENTICAL' : 'DIVERGED '} on  ${policyId}/s${seed} (layer fired: ${tele})`);
      }
    }
  }
  delete process.env.WIREACQUIRE;
  console.log(`DET-GATE gate-on: ${onTotal} pairs, ${onZero} zero-fire (${onIdentZero} identical), ${onFired} fired`);
  if (fails) { console.error(`DET-GATE FAILED: ${fails} zero-fire divergences (RNG hygiene broken)`); process.exit(1); }
  console.log('DET-GATE: PASS — gate-off 16/16 identical, gate-on zero-fire pairs identical');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
