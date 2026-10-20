#!/usr/bin/env node
// scripts/det-gate-corpsewire-20261019.js — determinism gate for arm sim-corpsewire-b.
//
// The wirebootstrap b2 lesson: an instrument that consumes game RNG or
// writes game state perturbs every armed run, and a gate-off-only det-gate
// misses it. Here the "layer" IS the instrument set
// (scripts/corpsewire-instruments.js): registerDeath / _corpseTakeStack /
// buryCorpse wraps + end-of-day corpse scans. The gate runs 8 seeded 60-day
// runs instrumented vs plain on IDENTICAL seeds and requires bit-identical
// game-state digests — proving the instruments consume zero RNG and write
// zero game state before the measurement sweep trusts them.
//
// Seeds: 31701-31708 (the b2/wirebootstrap substrate seeds). Policy:
// leadfeast (FEASTSCALE_R13=1, SEATDRIVE=0). Digest: stable JSON of the
// observable game state (scholar, village, corpses, day) — excludes nothing
// game-relevant.
//
// TOOLING ONLY.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const { instrumentWire } = require('./corpsewire-instruments');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('GATE STOP: SEATDRIVE=0 required.'); process.exit(2); }

const SEEDS = [31701, 31702, 31703, 31704, 31705, 31706, 31707, 31708];
const DAYS = 60;

// Stable digest of the observable game state. Sorted-key stringify over the
// whole Game.state would choke on cycles; digest the pieces that matter.
function digest(Game) {
  const s = Game.state || {};
  const stable = (v) => JSON.stringify(v, (k, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const o = {};
      for (const kk of Object.keys(val).sort()) o[kk] = val[kk];
      return o;
    }
    return val;
  });
  try {
    return stable({
      day: (s.scholar || {}).day,
      scholar: s.scholar,
      village: s.village,
      corpses: (Game.corpses ? Game.corpses() : []).map(c => ({
        id: c.id, kind: c.kind, looted: !!c.looted, buried: !!c.buried,
        items: (c.items || []).map(i => ({ n: i.name, u: i.units, id: i.itemId || i.plantId })),
      })),
    });
  } catch (e) { return 'DIGEST-ERROR:' + (e && e.message); }
}

async function one(seed, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'cw-detgate-' + (instrumented ? 'inst' : 'plain') });
  await setupGame(Game);
  if (instrumented) instrumentWire(Game);
  const policy = POLICY_REGISTRY['leadfeast'];
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  return { seed, days: result.days, gameDays: result.gameDays, digest: digest(Game) };
}

async function main() {
  let pass = 0, fail = 0;
  for (const seed of SEEDS) {
    const a = await one(seed, false);
    const b = await one(seed, true);
    const ok = a.days === b.days && a.gameDays === b.gameDays && a.digest === b.digest;
    if (ok) { pass++; console.log(`  IDENTICAL s${seed} (days=${a.days}/${a.gameDays})`); }
    else {
      fail++;
      console.log(`  DIVERGED s${seed}: days ${a.days}/${a.gameDays} vs ${b.days}/${b.gameDays}, digest ${a.digest.length} vs ${b.digest.length}`);
    }
  }
  console.log(`\nDET-GATE: ${pass}/8 identical, ${fail}/8 diverged`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
