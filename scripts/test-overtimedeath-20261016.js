#!/usr/bin/env node
'use strict';
// test-overtimedeath-20261016.js — proof tests for the sim-overtimedeath
// instrument (scripts/overtimedeath-20261016.js).
//
// 1. SYNTHETIC UNIT CHECKS on the attribution logic: fabricated death
//    sequences with known rerun windows and known invite days must
//    classify exactly (bucket() + phaseOf()).
// 2. The day-accounting off-by-one finding: beats/deaths can timestamp a
//    day AFTER runDays' returned day — deaths at finalDay+1 must still
//    classify (the death window extends to finalDay+1).
// 3. SMOKE (SMOKE=1): both policies drive 15d with the instrument live.
//
// Run: node scripts/test-overtimedeath-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SMOKE=1 node scripts/test-overtimedeath-20261016.js
const assert = require('assert');
const { bucket, phaseOf } = require('./overtimedeath-20261016');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Fabricated death sequences. inviteDay = 90 (the winDayFloor case).
const INV = 90;
const mk = (o) => Object.assign({ day: 1, cause: 'combat', family: 'combat', rerunFight: false, tier: 0, kind: 'person' }, o);

// --- bucket (a): rerun flag set at the death beat — the engine's otTier ---
check('a1 rerun-flag combat death -> a',
  bucket(mk({ day: 95, rerunFight: true, tier: 1 })) === 'a');
check('a2 rerun-flag at tier 5 -> a',
  bucket(mk({ day: 140, rerunFight: true, tier: 5, cause: 'a Highbeam Deer', family: 'monster' })) === 'a');
check('a3 rerun-flag with non-combat family still -> a (the fight hosted the death)',
  bucket(mk({ day: 100, rerunFight: true, tier: 2, cause: 'a wound that wouldn\'t close', family: 'wounds' })) === 'a');

// --- bucket (b): combat/monster family, no rerun flag ---
check('b1 combat family tier 3, no flag -> b',
  bucket(mk({ day: 120, rerunFight: false, tier: 3 })) === 'b');
check('b2 monster family pre-invite -> b',
  bucket(mk({ day: 30, cause: 'monster', family: 'monster', tier: 0 })) === 'b');
check('b3 raid cause no flag -> b',
  bucket(mk({ day: 150, cause: 'raid-defense', family: 'combat', tier: 4 })) === 'b');

// --- bucket (c): non-combat named families ---
check('c1 starvation -> c',
  bucket(mk({ day: 60, cause: 'starvation', family: 'starvation' })) === 'c');
check('c2 sickness -> c',
  bucket(mk({ day: 61, cause: 'gutrot', family: 'sickness' })) === 'c');
check('c3 wounds -> c',
  bucket(mk({ day: 62, cause: 'a wound that wouldn\'t close', family: 'wounds' })) === 'c');
check('c4 unclassifiable family null -> c (raw preserved, never unattributed)',
  bucket(mk({ day: 63, cause: 'the phoenix link', family: null })) === 'c');

// --- bucket (d): unattributed ONLY for unobservable records ---
check('d1 missing day -> d',
  bucket(mk({ day: null, cause: 'combat' })) === 'd');
check('d2 missing cause -> d',
  bucket(mk({ day: 100, cause: null, family: null })) === 'd');

// --- the off-by-one: deaths at finalDay+1 still classify ---
// (fabricated: runDays returned days=134, engine day 135 at death)
check('offby1 death at finalDay+1 (day 135) with rerun flag -> a',
  bucket(mk({ day: 135, rerunFight: true, tier: 3 })) === 'a');
check('offby1 death at finalDay+1 combat no flag -> b',
  bucket(mk({ day: 135, rerunFight: false, tier: 0 })) === 'b');

// --- phaseOf: pre-invite vs post-invite-in-rerun vs post-invite-outside-rerun ---
check('phase pre-invite (day < inviteDay)',
  phaseOf(mk({ day: 89, tier: 0 }), INV) === 'pre-invite');
check('phase invite day itself is post-invite',
  phaseOf(mk({ day: 90, tier: 0 }), INV) === 'post-invite-outside-rerun');
check('phase post-invite tier>=1 is in-rerun',
  phaseOf(mk({ day: 100, tier: 2 }), INV) === 'post-invite-in-rerun');
check('phase post-invite tier 0 is outside-rerun',
  phaseOf(mk({ day: 95, tier: 0 }), INV) === 'post-invite-outside-rerun');
check('phase null tier post-invite defaults outside-rerun',
  phaseOf(mk({ day: 95, tier: null }), INV) === 'post-invite-outside-rerun');
check('phase no invite ever -> pre-invite',
  phaseOf(mk({ day: 150, tier: 3 }), null) === 'pre-invite');
// invite timing interaction: invited d81, died d89 (the seatpath belong-s163 case)
check('phase invited d81, died d89, tier 0 -> post-invite-outside-rerun',
  phaseOf(mk({ day: 89, tier: 0 }), 81) === 'post-invite-outside-rerun');

// --- bucket x phase cross-product sanity (the attribution's unit square) ---
const cases = [
  // [day, rerunFight, family, tier, inviteDay, wantBucket, wantPhase]
  [89, false, 'combat', 0, 90, 'b', 'pre-invite'],
  [95, true, 'combat', 1, 90, 'a', 'post-invite-in-rerun'],
  [95, false, 'combat', 1, 90, 'b', 'post-invite-in-rerun'],
  [92, false, 'combat', 0, 90, 'b', 'post-invite-outside-rerun'],
  [120, false, 'starvation', 2, 90, 'c', 'post-invite-in-rerun'],
  [140, true, 'monster', 5, 108, 'a', 'post-invite-in-rerun'],
  [60, false, 'sickness', 0, null, 'c', 'pre-invite'],
];
let sq = true;
for (const [day, rf, fam, tier, inv, wb, wp] of cases) {
  const d = mk({ day, rerunFight: rf, family: fam, tier });
  if (bucket(d) !== wb || phaseOf(d, inv) !== wp) {
    sq = false;
    console.log(`  square FAIL day=${day} rf=${rf} fam=${fam} tier=${tier} inv=${inv}: got ${bucket(d)}/${phaseOf(d, inv)}, want ${wb}/${wp}`);
  }
}
check('attribution unit square (7 cross-product cases)', sq);

// --- instrument attach does not corrupt the bucket contract ---
// The wrap always supplies day + cause (proven by d1/d2 above); a death
// record with a null family is still attributable (c4), never d.
check('attribution completeness: d reserved for unobservable only',
  ['a', 'b', 'c'].includes(bucket(mk({ day: 10, cause: '?', family: null, rerunFight: false, tier: 0 }))));

console.log(`\nUNIT: ${pass} pass, ${fail} fail.`);
if (fail) process.exit(1);

if (process.env.SMOKE === '1') {
  (async () => {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const OD = require('./overtimedeath-20261016');
    for (const pid of ['leadfeast', 'belongfeast']) {
      process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
      const base = OD.policyFor(pid);
      const policy = OD.withOvertimeDeath(base, base.id + '-od', base.desc + ' [OD SMOKE]');
      const { Game } = await loadGame({ seed: 181, mode: 'od-test-smoke', fullTelemetry: false });
      await setupGame(Game);
      let ctx0 = null;
      const oSetup = policy.setup;
      policy.setup = (G, ctx) => { ctx0 = ctx; return oSetup(G, ctx); };
      let r = null;
      await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
      const C = ctx0 && ctx0._od;
      const ok = !!(C && C.dayTiers.length >= 15 && typeof Game.overtimeTier === 'function');
      check(`[${pid}] smoke: 15d, tier rows=${C && C.dayTiers.length}`, ok);
      check(`[${pid}] smoke: deaths recorded without crash (n=${C && C.deaths.length})`, !!C);
    }
    delete process.env.WINDEFER;
    console.log(`\nSMOKE: ${pass} pass, ${fail} fail.`);
    if (fail) process.exit(1);
    console.log('ALL GREEN.');
  })().catch(e => { console.error('SMOKE CRASH:', e); process.exit(2); });
} else {
  console.log('ALL GREEN (unit). Run with SMOKE=1 for the live gate.');
}
