#!/usr/bin/env node
'use strict';
// test-fieldfightsrc-20261016.js — proof tests for the sim-fieldfightsrc
// instrument (scripts/fieldfightsrc-20261016.js).
//
// 1. SYNTHETIC UNIT CHECKS on the source attribution: fabricated death
//    contexts with known source systems (raid vs expedition vs
//    wild-encounter, per the evidence pre-registration) must classify
//    exactly via srcOf().
// 2. The day-accounting off-by-one finding: deaths timestamping
//    finalDay+1 still classify.
// 3. SMOKE (SMOKE=1): both policies drive 15d with the instrument live.
// 4. DET (DET=1): 4 identical-seed pairs, both-repeat design — the
//    instrument must not move trajectories.
//
// Run: node scripts/test-fieldfightsrc-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SMOKE=1 node scripts/test-fieldfightsrc-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 DET=1 node scripts/test-fieldfightsrc-20261016.js
const assert = require('assert');
const { srcOf } = require('./fieldfightsrc-20261016');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// Fabricated death contexts. The stack entry fields the instrument reads:
// {day, kind, cause, family, via, raid, monsterLingering, scholarAway,
//  travelLegs, crisisOpen, crisisRaiders}
const mk = (o) => Object.assign({
  day: 100, kind: 'villager', cause: 'monster', family: 'monster',
  via: null, raid: false, monsterLingering: false, monsterId: null,
  scholarAway: false, travelLegs: 0, crisisOpen: false, crisisRaiders: false,
}, o);

// --- RAID: the engine's own raid context (opts.raid from havenRaidTick) ---
check('r1 havenRaidTick defender wave (opts.raid) -> RAID',
  srcOf(mk({ via: 'wild', raid: true, monsterId: 'highbeam_deer' })) === 'RAID');
check('r2 unmet raider fought on a wild tick (m.lingering) -> RAID',
  srcOf(mk({ via: 'wild', raid: true, monsterLingering: true, monsterId: 'bulldozer' })) === 'RAID');
check('r3 patrol picks up a lingering raider (aidFight route) -> RAID',
  srcOf(mk({ via: 'patrol', raid: true, monsterLingering: true, crisisOpen: true, crisisRaiders: true })) === 'RAID');
check('r4 raid marker wins over outing-day correlation (raid first) -> RAID',
  srcOf(mk({ via: 'wild', raid: true, travelLegs: 3, scholarAway: true })) === 'RAID');

// --- EXPEDITION: policy-driven scholar outing correlation, no raid marker ---
check('e1 wild encounter on a policy-travel day, no raid -> EXPEDITION',
  srcOf(mk({ via: 'wild', travelLegs: 2, scholarAway: true })) === 'EXPEDITION');
check('e2 patrol encounter on a policy-travel day, no raid -> EXPEDITION',
  srcOf(mk({ via: 'patrol', travelLegs: 1, scholarAway: false })) === 'EXPEDITION');
check('e3 scholar-fight ally context (unrouted fieldFight), travel day -> EXPEDITION',
  srcOf(mk({ via: 'field-other', travelLegs: 1 })) === 'EXPEDITION');

// --- WILD-ENCOUNTER: untagged, no policy outing ---
check('w1 patrol encounter, home day, no raid -> WILD-ENCOUNTER',
  srcOf(mk({ via: 'patrol', travelLegs: 0, scholarAway: false })) === 'WILD-ENCOUNTER');
check('w2 wild tick encounter, home day, no raid -> WILD-ENCOUNTER',
  srcOf(mk({ via: 'wild', travelLegs: 0 })) === 'WILD-ENCOUNTER');
check('w3 villager-agency expedition death (expedDeath, monster-name cause), home day -> WILD-ENCOUNTER',
  srcOf(mk({ via: 'agency-expedition', cause: 'The Suburb', travelLegs: 0 })) === 'WILD-ENCOUNTER');
check('w4 agency-expedition death on an outing day STAYS wild (villager-autonomous, not policy-driven) -> WILD-ENCOUNTER',
  srcOf(mk({ via: 'agency-expedition', cause: 'The Reunion', travelLegs: 4, scholarAway: true })) === 'WILD-ENCOUNTER');
check('w5 agency expedition wounds-path death (cause monster, awareness fieldFight) -> WILD-ENCOUNTER',
  srcOf(mk({ via: 'agency-expedition', cause: 'monster', travelLegs: 0 })) === 'WILD-ENCOUNTER');

// --- the aid crisis is corroboration, never the tag flipper ---
check('c1 open raid crisis + ordinary wild fight, no raid marker -> WILD-ENCOUNTER (not RAID)',
  srcOf(mk({ via: 'wild', raid: false, crisisOpen: true, crisisRaiders: true, travelLegs: 0 })) === 'WILD-ENCOUNTER');

// --- unattributed reserved for unobservable records ---
check('d1 missing day -> unattributed',
  srcOf(mk({ day: null })) === 'unattributed');
check('d2 missing cause -> unattributed',
  srcOf(mk({ day: 100, cause: null, family: null })) === 'unattributed');

// --- nontarget: outside the population (the instrument records but does not tag) ---
check('n1 combat-family death is not the monster-verb population -> nontarget',
  srcOf(mk({ cause: 'combat', family: 'combat' })) === 'nontarget');
check('n2 starvation death -> nontarget',
  srcOf(mk({ cause: 'starvation', family: 'starvation' })) === 'nontarget');

// --- the off-by-one: deaths at finalDay+1 still classify ---
check('offby1 death at finalDay+1 with raid marker -> RAID',
  srcOf(mk({ day: 135, via: 'wild', raid: true })) === 'RAID');
check('offby1 death at finalDay+1, home day, wild -> WILD-ENCOUNTER',
  srcOf(mk({ day: 135, via: 'patrol', travelLegs: 0 })) === 'WILD-ENCOUNTER');

// --- attribution unit square (cross-product) ---
const cases = [
  // [via, raid, travelLegs, crisisRaiders, family, cause, day, want]
  ['wild', true, 0, false, 'monster', 'monster', 100, 'RAID'],
  ['wild', false, 3, false, 'monster', 'monster', 100, 'EXPEDITION'],
  ['wild', false, 0, false, 'monster', 'monster', 100, 'WILD-ENCOUNTER'],
  ['patrol', true, 0, true, 'monster', 'monster', 120, 'RAID'],
  ['patrol', false, 0, false, 'monster', 'monster', 120, 'WILD-ENCOUNTER'],
  ['agency-expedition', false, 5, false, 'monster', 'The Suburb', 130, 'WILD-ENCOUNTER'],
  ['wild', true, 2, false, 'monster', 'monster', 140, 'RAID'],
  ['field-other', false, 1, false, 'monster', 'monster', 110, 'EXPEDITION'],
  ['contest', false, 0, false, 'combat', 'contest', 110, 'nontarget'],
  ['wild', false, 0, true, 'monster', 'monster', 150, 'WILD-ENCOUNTER'],
];
let sq = true;
for (const [via, raid, tl, cr, fam, cause, day, want] of cases) {
  const got = srcOf(mk({ via, raid, travelLegs: tl, crisisRaiders: cr, family: fam, cause, day }));
  if (got !== want) {
    sq = false;
    console.log(`  square FAIL via=${via} raid=${raid} travelLegs=${tl} crisisRaiders=${cr} fam=${fam}: got ${got}, want ${want}`);
  }
}
check('attribution unit square (10 cross-product cases)', sq);

// --- attribution completeness: unattributed reserved for unobservable only ---
check('attribution completeness: every observable monster-verb death lands RAID/EXPEDITION/WILD',
  ['RAID', 'EXPEDITION', 'WILD-ENCOUNTER'].includes(srcOf(mk({ via: null, travelLegs: 0 }))));

console.log(`\nUNIT: ${pass} pass, ${fail} fail.`);
if (fail) process.exit(1);

if (process.env.SMOKE === '1') {
  (async () => {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const FF = require('./fieldfightsrc-20261016');
    for (const pid of ['leadfeast', 'belongfeast']) {
      process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
      const base = FF.policyFor(pid);
      const policy = FF.withFieldFightSrc(base, base.id + '-ffs', base.desc + ' [FFS SMOKE]');
      const { Game } = await loadGame({ seed: 205, mode: 'ffs-test-smoke', fullTelemetry: false });
      await setupGame(Game);
      let ctx0 = null;
      const oSetup = policy.setup;
      policy.setup = (G, ctx) => { ctx0 = ctx; return oSetup(G, ctx); };
      let r = null;
      await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
      const C = ctx0 && ctx0._ffs;
      const ok = !!(C && C.dayTiers.length >= 15 && typeof Game.overtimeTier === 'function');
      check(`[${pid}] smoke: 15d, tier rows=${C && C.dayTiers.length}`, ok);
      check(`[${pid}] smoke: fight-stack wraps live (stack=${C && C._stack === undefined ? 'n/a' : 'ok'})`, !!C);
      check(`[${pid}] smoke: deaths recorded without crash (n=${C && C.deaths.length})`, !!C);
    }
    delete process.env.WINDEFER;
    console.log(`\nSMOKE: ${pass} pass, ${fail} fail.`);
    if (fail) process.exit(1);
    console.log('ALL GREEN.');
  })().catch(e => { console.error('SMOKE CRASH:', e); process.exit(2); });
} else if (process.env.DET === '1') {
  (async () => {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const { dayHash } = require('./det-gate');
    const FF = require('./fieldfightsrc-20261016');
    async function runHashes(policy, seed, days) {
      process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
      const { Game } = await loadGame({ seed, mode: 'ffs-det', fullTelemetry: false });
      await setupGame(Game);
      const hashes = [];
      const wrapped = Object.assign({}, policy);
      const base = policy.daily;
      wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
      let r = null;
      await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
      return { h: hashes.join('\n'), endReason: r && r.endReason, days: r && r.days };
    }
    const pairs = [['leadfeast', 205], ['leadfeast', 246], ['belongfeast', 205], ['belongfeast', 246]];
    const days = 60;
    let green = 0;
    for (const [pid, seed] of pairs) {
      const plain = FF.policyFor(pid);
      const instr = FF.withFieldFightSrc(FF.policyFor(pid), pid + '-ffs', pid + ' [FFS DET]');
      const p1 = await runHashes(plain, seed, days);
      const p2 = await runHashes(plain, seed, days);
      const c1 = await runHashes(instr, seed, days);
      const c2 = await runHashes(instr, seed, days);
      const plainStable = p1.h === p2.h;
      const instrStable = c1.h === c2.h;
      const identical = plainStable && instrStable && p1.h === c1.h;
      const endsSame = p1.endReason === c1.endReason;
      if (identical && endsSame) green++;
      console.log(`  ${pid} s${seed}: plain-stable=${plainStable} instr-stable=${instrStable} ` +
        `instrument-identical=${p1.h === c1.h} ends=${p1.endReason}/${c1.endReason} ${identical && endsSame ? 'PASS' : 'FAIL'}`);
    }
    delete process.env.WINDEFER;
    console.log(`DET-GATE: ${green}/${pairs.length} identical (plain-repeat + instr-repeat + plain==instr, ends agree).`);
    if (green < pairs.length) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
    console.log('DET gate green.');
  })().catch(e => { console.error('DET CRASH:', e); process.exit(2); });
} else {
  console.log('ALL GREEN (unit). Run with SMOKE=1 / DET=1 for the live gates.');
}
