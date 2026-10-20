#!/usr/bin/env node
// scripts/det-gate-belonghunger-b.js — det-gate for the belong-road hunger
// diagnostic instrument (fleshout loop B, 2026-10-19, arm sim-belonghunger-b).
//
// 8 configs (leadfeast/belongfeast x seeds 11/22/33/44), each run TWICE at the
// full 180d death-aware horizon with the pantry-attribution instrument armed.
// Per-day ledger hashes + outcome vectors compared. 8/8 pairs bit-identical
// (16 runs) required before trusting the pilot's attribution.
//
// PLUS cross-validation: each config's outcome vector must reproduce the
// fragilityfeast CONTROL corpus (perseed-fragilityfeast-base) exactly — the
// deleted fragilityfeast layer was R1-pinned byte-identical to
// leadfeast/belongfeast with FRAGFEAST unset, so identical seeds must give
// identical days/endReason/hungryDays/starveDeaths/death multisets/feasts.
// This proves the instrument is neutral AND the substrate is the corpus's.
//
// Usage: FEASTSCALE_R13=1 node scripts/det-gate-belonghunger-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { instrument, markDayStart, pantryKcal, gday } = require('./belonghunger-instrument');
const FS = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.log('STOP: FEASTSCALE_R13=1 required (the standard feast substrate).');
  process.exit(1);
}
const REGISTRY = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };
const SEEDS = [11, 22, 33, 44];
const PIDS = ['leadfeast', 'belongfeast'];
const CORPUS_DIR = 'evidence/2026-10-19/perseed-fragilityfeast-base';

async function oneRun(pid, seed, rep) {
  const base = REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: `belonghunger-det-${pid}-r${rep}` });
  await setupGame(Game);
  const W = instrument(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup, oDaily = base.daily;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  policy.daily = (G, ctx) => { markDayStart(W, G); if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} } };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 181 }); });
  try { W.scanInflows(); } catch (e) {}
  const deaths = {};
  let starve = 0;
  for (const d of (result.samples.deaths || [])) {
    const k = String(d.cause || d.kind || 'unknown');
    deaths[k] = (deaths[k] || 0) + 1;
    if (/starv/i.test(k)) starve++;
  }
  let hungry = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  const ledgerHash = Object.keys(W.days).map(Number).sort((a, b) => a - b)
    .map(d => `${d}:${W.days[d].start}:${JSON.stringify(W.days[d].ch)}:${W.days[d].hungry}`).join('\n');
  const out = {
    days: result.days, endReason: result.endReason, hungryDays: hungry,
    starveDeaths: starve, deaths, fsFeasts: (runCtx && runCtx.fsFeasts) || 0,
    wave: result.maxWaveUnlocked || 1,
  };
  W.restore();
  return { ledgerHash, out };
}

function outKey(o) {
  const dk = Object.keys(o.deaths).sort().map(k => `${k}:${o.deaths[k]}`).join(',');
  return [o.days, o.endReason, o.hungryDays, o.starveDeaths, dk, o.fsFeasts, o.wave].join('|');
}

async function main() {
  // load corpus expectations
  const corpus = {};
  for (const pid of PIDS) for (const seed of SEEDS) {
    const fpid = pid === 'leadfeast' ? 'fragleadfeast' : 'fragbelongfeast';
    const p = `${CORPUS_DIR}/fragilityfeast-baseline-${fpid}-s${seed}.json`;
    corpus[`${pid}/s${seed}`] = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  let pairs = 0, pairFails = [];
  let corpusFails = [];
  for (const pid of PIDS) for (const seed of SEEDS) {
    const a = await oneRun(pid, seed, 1);
    const b = await oneRun(pid, seed, 2);
    pairs++;
    const same = a.ledgerHash === b.ledgerHash && outKey(a.out) === outKey(b.out);
    console.log(`  ${same ? 'IDENTICAL' : 'DIVERGED'} ${pid} s${seed} — days=${a.out.days} end=${a.out.endReason} hungry=${a.out.hungryDays} starve=${a.out.starveDeaths} feasts=${a.out.fsFeasts}`);
    if (!same) pairFails.push(`${pid}/s${seed}`);
    // corpus cross-validation (against rep 1)
    const c = corpus[`${pid}/s${seed}`];
    const cDeaths = Object.keys(c.deaths).sort().map(k => `${k}:${c.deaths[k]}`).join(',');
    const aDeaths = Object.keys(a.out.deaths).sort().map(k => `${k}:${a.out.deaths[k]}`).join(',');
    const match = a.out.days === c.days && a.out.endReason === c.endReason &&
      a.out.hungryDays === c.hungryDays && a.out.starveDeaths === c.starveDeaths &&
      aDeaths === cDeaths && a.out.fsFeasts === c.fsFeasts && a.out.wave === c.waveReach;
    if (!match) corpusFails.push(`${pid}/s${seed}: got days=${a.out.days}/${c.days} hungry=${a.out.hungryDays}/${c.hungryDays} feasts=${a.out.fsFeasts}/${c.fsFeasts} deaths={${aDeaths}} vs {${cDeaths}}`);
  }
  console.log(`\nDET-GATE: ${pairs - pairFails.length}/${pairs} pairs bit-identical (16 runs).`);
  console.log(`CORPUS X-VAL: ${8 - corpusFails.length}/8 configs reproduce the control corpus exactly.`);
  if (pairFails.length) console.log('PAIR FAILURES: ' + pairFails.join('; '));
  if (corpusFails.length) console.log('CORPUS FAILURES:\n  ' + corpusFails.join('\n  '));
  if (pairFails.length || corpusFails.length) process.exit(1);
  console.log('DET-GATE GREEN: instrument is deterministic and neutral; substrate == corpus.');
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
