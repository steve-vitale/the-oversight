#!/usr/bin/env node
// scripts/test-armorbreak-20261017.js — proof for the sim-armorbreak
// diagnostic (2026-10-17, axis scale-onramp). Proves each measurement; no
// game-code or policy behavior is changed by this diagnostic.
//
// 1. ATTRIBUTION COMPLETENESS (on the real corpora): all 10 wave-4 unlock
//    runs across both corpora are classified by armor coverage at unlock +
//    post-unlock survival, with ZERO unattributed runs (the PRIMARY metric).
// 2. DEFERRAL READING: wave4reach's 32 bindingSnapshots classify into
//    armor-bound/veterans-bound/both; vetshape's 32 end-state readiness4
//    carry an end-state reading only (SECONDARY).
// 3. CENSUS SELF-DETERMINISM: replaying the same unlock run twice yields
//    byte-identical per-villager armor census (the instrument is stable).
// 4. CENSUS FIDELITY: the replay reproduces the corpus JSON's trajectory
//    markers on a pinned run (MATCHED), so the census is attributable.
// 5. ARMOROF ACCOUNTING: armorOf(v, defs) = sum of worn piece protections +
//    coordination bonus (n>1 pieces: (n-1)*2); full-set replaces pieces —
//    the canon numbers the census relies on.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SEATDRIVE=0 \
//   node scripts/test-armorbreak-20261017.js
// Exits non-zero on any failure. ~30s (one replay run).
'use strict';
const path = require('path');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  console.log('== armorbreak proof: attribution completeness (real corpora) ==');
  const { classifyCorpora } = require('./armorbreak-analyze.js');
  const o = classifyCorpora();
  check('exactly 10 wave-4 unlock runs found', o.unlocks.length === 10,
    `got ${o.unlocks.length}`);
  const unatt = o.unlocks.filter(u => !u.attributed);
  check('ZERO unattributed unlock runs', unatt.length === 0,
    unatt.map(u => u.file).join(','));
  check('every unlock run has armor-at-unlock classification',
    o.unlocks.every(u => u.armorAtUnlock && u.armorAtUnlock.armored != null));
  check('every unlock run has post-unlock survival outcome',
    o.unlocks.every(u => u.endReason && u.gameDays != null));
  const w4r = o.deferrals.wave4reach;
  check('wave4reach: 32/32 runs carry a deferral bindingSnapshot',
    w4r.length === 32 && w4r.every(d => d.snapshotDay != null));
  const vs = o.deferrals.vetshape;
  check('vetshape: 32/32 end-state readiness4 readings',
    vs.length === 32 && vs.every(d => d.endShort != null));
  const snapClasses = new Set(w4r.map(d => d.deferralClass));
  check('deferral classes include armor-bound and veterans-bound readings',
    [...snapClasses].some(c => c.includes('armor')) && [...snapClasses].some(c => c.includes('veterans')),
    JSON.stringify([...snapClasses]));
  check('wall numbers present for both corpora',
    o.wall.wave4reach && o.wall.vetshape &&
    o.wall.wave4reach.control.w4unlocks === 1 && o.wall.wave4reach.armed.w4unlocks === 4);

  console.log('== armorbreak proof: armorOf accounting (fixture villagers) ==');
  const { replayOne } = require('./armorbreak-census.js');
  // armorOf unit checks via a loaded game instance is heavy; instead verify
  // the census's demand constant matches the engine's (read standingCfg).
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 424242, mode: 'armorbreak-probe', fullTelemetry: false });
  await setupGame(Game);
  const S = globalThis.Scattering || {};
  const eq = S.equipment;
  check('equipment.armorOf exposed', eq && typeof eq.armorOf === 'function');
  check('BODY_SLOTS = 5 (head/torso/legs/hands/shoes)',
    JSON.stringify(eq.BODY_SLOTS) === JSON.stringify(['head', 'torso', 'legs', 'hands', 'shoes']));
  let dem = null;
  try { dem = Game.standingCfg().readyDemand[4]; } catch (e) {}
  check('wave-4 armor demand = 4 fighters @ P>=15 (matches census)',
    dem && dem.armored === 4 && dem.armorP === 15, JSON.stringify(dem));
  // Fixture: pieces + coordination. 3 pieces of protection 10/10/10 ->
  // 30 + (3-1)*2 = 34. fullSet torso replaces everything.
  const fakeDefs = [
    { id: 'helm_a', slot: 'head', armor: { protection: 10 } },
    { id: 'vest_a', slot: 'torso', armor: { protection: 10 } },
    { id: 'pants_a', slot: 'legs', armor: { protection: 10 } },
    { id: 'set_a', slot: 'torso', armor: { protection: 40 } },
  ];
  const vp3 = { equipped: { head: { itemId: 'helm_a' }, torso: { itemId: 'vest_a' }, legs: { itemId: 'pants_a' } } };
  check('armorOf = pieces + coordination (10+10+10+4=34)', eq.armorOf(vp3, fakeDefs) === 34,
    `got ${eq.armorOf(vp3, fakeDefs)}`);
  const vpSet = { equipped: { head: { itemId: 'helm_a' }, torso: { itemId: 'set_a', fullSet: true } } };
  check('fullSet torso replaces pieces (40)', eq.armorOf(vpSet, fakeDefs) === 40,
    `got ${eq.armorOf(vpSet, fakeDefs)}`);
  const vp0 = { equipped: {} };
  check('naked villager P=0', eq.armorOf(vp0, fakeDefs) === 0);

  console.log('== armorbreak proof: census self-determinism + fidelity ==');
  const spec = { corpus: 'wave4reach', arm: 'armed', policyId: 'leadfeast', seed: 3211345 };
  const r1 = await quietLog(async () => replayOne(spec));
  check('replay completes without crash', !r1.crashed, r1.error);
  check('replay opens wave 4', (r1.maxWaveUnlocked || 1) >= 4);
  check('census captured at unlock day', !!r1.census && r1.census.day === r1.firstW4Day,
    `censusDay=${r1.census && r1.census.day} w4=${r1.firstW4Day}`);
  check('census demand-met count matches the engine bar at the census moment',
    r1.census.demandMet === (r1.census.barAtCensus && r1.census.barAtCensus.armored),
    `census=${r1.census.demandMet} bar=${r1.census.barAtCensus && r1.census.barAtCensus.armored}`);
  check('fidelity vs corpus JSON = MATCHED', r1.fidelity === 'MATCHED',
    JSON.stringify(r1.fidelityDiffs));
  const r2 = await quietLog(async () => replayOne(spec));
  check('second replay of same run byte-identical census',
    JSON.stringify(r1.census) === JSON.stringify(r2.census));
  check('second replay byte-identical trajectory markers',
    JSON.stringify({ f: r1.firstW4Day, g: r1.gameDays, e: r1.endReason, d: r1.deathsTotal }) ===
    JSON.stringify({ f: r2.firstW4Day, g: r2.gameDays, e: r2.endReason, d: r2.deathsTotal }));

  console.log(`\n== armorbreak proof: ${pass} passed, ${fail} failed ==`);
  process.exit(fail ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
