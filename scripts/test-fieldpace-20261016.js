#!/usr/bin/env node
'use strict';
// test-fieldpace-20261016.js — proof test for the wave-4/5 field-fight pacing
// instrument (flesh-out loop run fleshout-20261016T1715Z, arm sim-fieldpace).
//
// Proves:
//   1. linkDeath attributes known deaths correctly (fixtures): wave,
//      species by canonical m.id (NOT the prose alias), round-of-death,
//      one-round-kill flag, killer species, channel.
//   2. linkDeath rejects non-vDie fight outcomes (null, no attribution).
//   3. isVillager excludes the player and non-person kinds.
//   4. waveById resolves canonical ids from data (read-only, no prose).
//   5. summarize aggregates the pacing numbers the evidence header demands.
//   6. node-level read-only-ness: a 1-pair both-repeat trajectory check
//      (plain-repeat + instr-repeat + plain==instr), 40d.
//
// Run: node scripts/test-fieldpace-20261016.js
// (The full 4-pair det-gate runs via DET=1 on fieldpace-20261016.js.)
const assert = require('assert');
const FP = require('./fieldpace-20261016');
const FFS = require('./fieldfightsrc-20261016');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0;
function check(name, cond, detail) {
  pass += cond ? 1 : 0;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ' — ' + detail : ''}`);
  if (!cond) process.exitCode = 1;
}

// --- 1-2. linkDeath fixtures ---
(function () {
  // Finding #405 case: beat prose calls it "The Big Loud" (knowledge-gated
  // alias); the canonical m.id is the species. The instrument never reads
  // prose — the fixture's death has the prose alias in `cause`, and the
  // fight record carries mdef.id. Attribution must use mdef.id.
  const d = { day: 61, name: 'Mara', vid: 'v7', src: 'EXPEDITION',
    cause: 'The Big Loud crushed her' };
  const f = { outcome: 'vDie', rounds: 1, mId: 'eater', wave: 4,
    vid: 'v7', day: 61 };
  const a = FP.linkDeath(d, f);
  check('linkDeath returns attribution for vDie', !!a);
  check('attribution: wave from fight record', a.wave === 4, 'got ' + a.wave);
  check('attribution: mId is canonical (NOT prose alias)',
    a.mId === 'eater' && a.mId !== 'The Big Loud' && !/Big Loud/.test(a.mId), 'got ' + a.mId);
  check('attribution: killer species = mId', a.killer === 'eater');
  check('attribution: round-of-death = fight rounds', a.roundOfDeath === 1);
  check('attribution: one-round-kill flag true on round-1 death', a.oneRoundKill === true);
  check('attribution: channel carried from fieldfightsrc srcOf', a.channel === 'EXPEDITION');

  // Round-4 death: ORK flag false, round-of-death 4.
  const a2 = FP.linkDeath(
    { day: 70, name: 'Jon', vid: 'v3', src: 'RAID', cause: 'finale crew got him' },
    { outcome: 'vDie', rounds: 4, mId: 'finale_crew', wave: 5, vid: 'v3', day: 70 });
  check('linkDeath: round-4 death not one-round-kill', a2.oneRoundKill === false && a2.roundOfDeath === 4);
  check('linkDeath: wave-5 killer by m.id', a2.mId === 'finale_crew' && a2.wave === 5);
  check('linkDeath: RAID channel', a2.channel === 'RAID');

  // Non-vDie outcomes never attribute (no false pacing).
  for (const oc of ['vKill', 'mFlee', 'vFlee', 'evade', 'alreadyDead']) {
    check(`linkDeath rejects outcome ${oc}`,
      FP.linkDeath({ day: 1, name: 'X', vid: 'v1', src: 'RAID' },
        { outcome: oc, rounds: 3, mId: 'eater', wave: 4 }) === null);
  }
  check('linkDeath rejects null inputs', FP.linkDeath(null, null) === null);
})();

// --- 3. isVillager ---
(function () {
  check('isVillager: person kind', FP.isVillager({ kind: 'person', player: false }));
  check('isVillager: villager kind', FP.isVillager({ kind: 'villager', player: false }));
  check('isVillager: excludes player', !FP.isVillager({ kind: 'person', player: true }));
  check('isVillager: excludes monster kind', !FP.isVillager({ kind: 'monster', player: false }));
})();

// --- 4. waveById (canonical, data-read, no prose) ---
(function () {
  check('waveById: eater -> 4', FP.waveById('eater') === 4, 'got ' + FP.waveById('eater'));
  check('waveById: finale -> 5', FP.waveById('finale') === 5, 'got ' + FP.waveById('finale'));
  check('waveById: unknown id -> null', FP.waveById('no_such_beast') === null);
  check('waveById: prose alias not an id -> null', FP.waveById('The Big Loud') === null);
})();

// --- 5. summarize pacing aggregation ---
(function () {
  const C = FP.newFpRec();
  C.monsterVerbVillagerDeaths = 10;
  C.deaths = [
    { wave: 4, mId: 'eater', roundOfDeath: 1, oneRoundKill: true, fightRounds: 1, channel: 'EXPEDITION' },
    { wave: 4, mId: 'audit', roundOfDeath: 2, oneRoundKill: false, fightRounds: 2, channel: 'RAID' },
    { wave: 4, mId: 'eater', roundOfDeath: 1, oneRoundKill: true, fightRounds: 1, channel: 'EXPEDITION' },
    { wave: 5, mId: 'finale', roundOfDeath: 5, oneRoundKill: false, fightRounds: 5, channel: 'RAID' },
    { wave: 5, mId: 'cancellation', roundOfDeath: 1, oneRoundKill: true, fightRounds: 1, channel: 'WILD-ENCOUNTER' },
  ];
  C.fights = [
    { rounds: 1, player: false }, { rounds: 2, player: false }, { rounds: 1, player: false },
    { rounds: 5, player: false }, { rounds: 3, player: true }, { rounds: 1, player: false },
  ];
  const s = FP.summarize(C);
  check('summarize: attribution rate 5/10', Math.abs(s.attributionRate - 0.5) < 1e-9, 'got ' + s.attributionRate);
  check('summarize: ORK share w4 = 2/3', Math.abs(s.orkShareW4 - 2 / 3) < 1e-9, 'got ' + s.orkShareW4);
  check('summarize: ORK share w5 = 1/2', Math.abs(s.orkShareW5 - 0.5) < 1e-9, 'got ' + s.orkShareW5);
  check('summarize: round histogram w4 {1:2,2:1}', s.roundHistW4[1] === 2 && s.roundHistW4[2] === 1, JSON.stringify(s.roundHistW4));
  check('summarize: round histogram w5 {5:1,1:1}', s.roundHistW5[5] === 1 && s.roundHistW5[1] === 1, JSON.stringify(s.roundHistW5));
  check('summarize: top killer is eater (2)', s.topKillers[0][0] === 'eater' && s.topKillers[0][1] === 2, JSON.stringify(s.topKillers));
  check('summarize: median fight rounds = 1 (non-player, sorted [1,1,1,2,5])', s.medianFightRoundsW45 === 1, 'got ' + s.medianFightRoundsW45);
  check('summarize: channel split EXPEDITION 2', s.channelSplit.EXPEDITION === 2, JSON.stringify(s.channelSplit));
})();

// --- 6. trajectory read-only-ness (1 pair, both-repeat, 40d) ---
async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'fp-proof', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  let r = null;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return { h: hashes.join('\n'), endReason: r && r.endReason };
}

(async () => {
  const seed = 41, pid = 'leadfeast', days = 40;
  const plain = FFS.policyFor(pid);
  const instr = FP.withFieldPace(FFS.policyFor(pid), pid + '-fp', pid + ' [FP proof]');
  const p1 = await runHashes(plain, seed, days);
  const p2 = await runHashes(plain, seed, days);
  const c1 = await runHashes(instr, seed, days);
  const c2 = await runHashes(instr, seed, days);
  check('det: plain repeat stable', p1.h === p2.h);
  check('det: instr repeat stable', c1.h === c2.h);
  check('det: instrument leaves trajectory byte-identical', p1.h === c1.h);
  check('det: end reasons agree', p1.endReason === c1.endReason, p1.endReason + ' vs ' + c1.endReason);
  console.log(`\nPROOF: ${pass} checks, ${process.exitCode ? 'FAILURES PRESENT' : 'ALL GREEN'}.`);
})().catch((e) => { console.error('PROOF CRASH:', e); process.exit(2); });
