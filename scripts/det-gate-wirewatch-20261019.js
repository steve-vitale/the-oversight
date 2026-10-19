#!/usr/bin/env node
// det-gate-wirewatch-20261019.js — determinism gate for the WIREWATCH pilot.
//
// Two gates, both on NO-KNOWER seeds (41712, 41717 — the layer is idle
// there by construction: knowers() is empty, so comeHome returns null
// before any verb):
//   (1) sanity: WIREWATCH unset, same seed+policy twice -> identical
//       (if this fails it is the known timestamp-ID contest issue
//       documented in scripts/det-gate.js, not the layer).
//   (2) cross-env: WIREWATCH=1 vs unset, same seed+policy -> identical
//       (proves the ON-but-idle layer adds zero footprint: no verbs, no
//       ctx writes, no RNG draws).
// The ON-and-firing side's divergence is mechanism + schedule perturbation
// mixed (reported, not hidden) — same disclosure as the wirebootstrap gate.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { checkDeterminism, dayHash } = require('./det-gate');
const { POLICY_REGISTRY } = require('./sweep-compare');

const SEEDS = [41712, 41717]; // screened: 0 knowers
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 60;

async function runOnce(seed, policy, wirewatchOn) {
  if (wirewatchOn) process.env.WIREWATCH = '1'; else delete process.env.WIREWATCH;
  const { Game } = await loadGame({ seed, mode: 'wirewatch-detgate' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  const r = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 1 });
  return { hashes, days: r.days, endReason: r.endReason };
}

function compare(a, b) {
  const n = Math.min(a.hashes.length, b.hashes.length);
  for (let i = 0; i < n; i++) if (a.hashes[i] !== b.hashes[i]) return { identical: false, at: i };
  if (a.hashes.length !== b.hashes.length) return { identical: false, at: n };
  return { identical: true, at: -1 };
}

async function main() {
  let fails = 0, total = 0;
  for (const pid of POLICIES) {
    const policy = POLICY_REGISTRY[pid];
    if (!policy) { console.error('DET-GATE STOP: unknown policy ' + pid); process.exit(2); }
    for (const seed of SEEDS) {
      total++;
      // gate 1: sanity (unset x2)
      delete process.env.WIREWATCH;
      const sanity = await checkDeterminism(seed, policy, { days: DAYS });
      // gate 2: cross-env (unset vs WIREWATCH=1)
      const off = await runOnce(seed, policy, false);
      const on = await runOnce(seed, policy, true);
      const cross = compare(off, on);
      const tag = `${pid}/s${seed}`;
      if (!sanity.identical) {
        console.log(`SANITY-DIVERGED ${tag}: ${sanity.summary} (known timestamp-ID issue class; cross-env still judged)`);
      }
      if (cross.identical) {
        console.log(`IDENTICAL ${tag} (off vs WIREWATCH=1, ${off.hashes.length}d)`);
      } else {
        const divDay = cross.at >= 0 && off.hashes[cross.at] ? off.hashes[cross.at].split(':')[0] : '?';
        console.log(`DIVERGED  ${tag}: off vs on differ at day ${divDay} (hash idx ${cross.at})`);
        fails++;
      }
    }
  }
  delete process.env.WIREWATCH;
  if (fails) { console.error(`DET-GATE FAILED: ${fails}/${total} cross-env divergences`); process.exit(1); }
  console.log(`DET-GATE: ${total}/${total} cross-env identical (2 no-knower seeds x 2 policies, 60d)`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
