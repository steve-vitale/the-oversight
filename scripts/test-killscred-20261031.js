#!/usr/bin/env node
// test-killscred-20261031.js — sim-killscred-a proof test.
// Pure analyzer tests (synthetic corpora) + judged-corpus
// reconciliation + det-gate checker. Usage:
//   node scripts/test-killscred-20261031.js [corpusDir] [detDir]
// Defaults: evidence/2026-10-31/perseed-killscred-a and
// evidence/2026-10-31/perseed-killscred-a-det.
// Exit non-zero on any failure. No game code loaded, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeed } = require(path.join(__dirname, 'killscred-analyze-20261031'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`ok - ${name}`); }
  else { fail++; console.log(`FAIL - ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}

function beat(id, day, part, rows) {
  return { id, day, part, atHaven: true, roster: rows };
}
function row(vid, occ, kills, hp, specCook, specPres, had, preTask) {
  return { vid, occ, occLower: (occ || '').toLowerCase(), specCook, specPreserver: specPres,
    kills, agencyPresent: true, credOcc: /(hunter|soldier|police|marine|ranger|security|firefighter|boxer|mma)/.test((occ || '').toLowerCase()),
    credKills: kills > 0, cred: kills > 0, hp, trust: 50, hadAssignment: !!had, preTask: preTask || null, dead: false, personMissing: false };
}
function assigns(list) {
  return list.map(([beat, vid, task, caller, assignedAfter]) =>
    ({ beat, vid, task, caller, assignedAfter: assignedAfter !== false, retOk: true, retRefused: false }));
}

// 1. Fit-trapped mechanic: every post-kill delegate pick is mend,
//    danger 0, credVB == credFit.
{
  const beats = [];
  for (let i = 1; i <= 10; i++)
    beats.push(beat(i, i, 0, [row('mech1', 'mechanic', 3, 90, 0, 0, false)]));
  const j = { seed: 1, psBeats: beats,
    psAssigns: assigns(beats.map(b => [b.id, 'mech1', 'mend', 'delegateBeat'])),
    psErrors: [] };
  const s = analyzeSeed(j);
  const h = s.holders[0];
  check('synthetic mechanic is a kills holder', !!h && h.maxKills === 3);
  check('synthetic mechanic fit-mend 10, danger 0', h.branches['fit-mend'] === 10 && h.branches['danger-hit'] === 0 && h.patrolAttempts === 0, h.branches);
  check('synthetic mechanic credVB 10, credFit 10, credDanger 0', h.credVB === 10 && h.credFit === 10 && h.credDanger === 0, { credVB: h.credVB, credFit: h.credFit, credDanger: h.credDanger });
  check('synthetic mechanic fitShare 1', h.fitShareOfPicks === 1, h.fitShareOfPicks);
}

// 2. Danger-active holder: patrol/hunt hit, need fallthrough counted
//    as danger-reached, not as fit.
{
  const beats = [];
  for (let i = 1; i <= 10; i++)
    beats.push(beat(i, i, 0, [row('art1', 'street artist', 1, 80, 0, 0, false)]));
  const tasks = ['patrol', 'hunt', 'forage', 'patrol', 'wood', 'hunt', 'water', 'patrol', 'stone', 'scout'];
  const j = { seed: 2, psBeats: beats,
    psAssigns: assigns(tasks.map((t, i) => [i + 1, 'art1', t, 'delegateBeat'])),
    psErrors: [] };
  const h = analyzeSeed(j).holders[0];
  check('synthetic artist danger-hit 5 (3 patrol + 2 hunt)', h.branches['danger-hit'] === 5 && h.patrolAttempts === 3 && h.huntPicks === 2, h.branches);
  check('synthetic artist danger-fallthrough 5 (need tasks at hp>=60)', h.branches['danger-fallthrough'] === 5, h.branches);
  check('synthetic artist credDanger 10', h.credDanger === 10, h.credDanger);
}

// 3. Pre-kill beats excluded; pre-claimed + already-assigned buckets.
{
  const beats = [
    beat(1, 1, 0, [row('farm1', 'farmer', 0, 80, 0, 2, false)]),
    beat(2, 2, 0, [row('farm1', 'farmer', 2, 80, 0, 2, false)]),
    beat(3, 3, 0, [row('farm1', 'farmer', 2, 80, 0, 2, true, 'cook')]),
    beat(4, 4, 0, [row('farm1', 'farmer', 2, 80, 0, 2, false)]),
  ];
  const j = { seed: 3, psBeats: beats,
    psAssigns: assigns([
      [1, 'farm1', 'cook', 'delegateBeat'],
      [2, 'farm1', 'cook', 'delegateBeat'],
      [4, 'farm1', 'water', 'assignOne', true],
    ]), psErrors: [] };
  const h = analyzeSeed(j).holders[0];
  check('synthetic farmer preKillBeats 1, holderBeats 3', h.preKillBeats === 1 && h.holderBeats === 3, { preKillBeats: h.preKillBeats, holderBeats: h.holderBeats });
  check('synthetic farmer fit-cook 1, already 1, pre-claimed 1', h.branches['fit-cook'] === 1 && h.branches['already-assigned'] === 1 && h.branches['pre-claimed'] === 1, h.branches);
  check('synthetic farmer preClaimedCred 1 (hp>=60 water claim)', h.preClaimedCred === 1, h.preClaimedCred);
  check('synthetic farmer allBeatsDuty cook 2', h.allBeatsDuty.cook === 2, h.allBeatsDuty);
}

// 4. hp-low: need task at hp < 60 is NOT danger-reached.
{
  const beats = [beat(1, 1, 0, [row('low1', 'street artist', 1, 50, 0, 0, false)])];
  const j = { seed: 4, psBeats: beats,
    psAssigns: assigns([[1, 'low1', 'forage', 'delegateBeat']]), psErrors: [] };
  const h = analyzeSeed(j).holders[0];
  check('synthetic hp-low forage is hp-low, not fallthrough', h.branches['hp-low'] === 1 && h.branches['danger-fallthrough'] === 0, h.branches);
  check('synthetic hp-low credVB 0 (hp<60 excluded)', h.credVB === 0, h.credVB);
}

// 5. Judged-corpus reconciliation (this arm's pilot corpus, this base):
//    patrolsilent's published numbers must reproduce exactly.
{
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-killscred-a');
  const read = (seed) => analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, `s${seed}.json`), 'utf8')));
  const s11 = read(85111);
  const h11 = s11.holders.find(h => h.occ === 'mechanic');
  check('85111 mechanic credVB 197 / credFit 197 / credDanger 0', h11 && h11.credVB === 197 && h11.credFit === 197 && h11.credDanger === 0, h11 && { credVB: h11.credVB, credFit: h11.credFit, credDanger: h11.credDanger });
  check('85111 mechanic all-beats mend 271, patrol 0', h11 && h11.allBeatsDuty.mend === 271 && h11.patrolAttempts === 0, h11 && h11.allBeatsDuty);
  check('85111 seed patrol 0, errs 0', s11.patrolAttemptsAll === 0 && s11.psErrors === 0, { patrol: s11.patrolAttemptsAll, errs: s11.psErrors });
  const s14 = read(85114);
  const h14 = s14.holders.find(h => h.occ === 'farmer');
  check('85114 farmer credVB 109 / credFit 109 / credDanger 0', h14 && h14.credVB === 109 && h14.credFit === 109 && h14.credDanger === 0, h14 && { credVB: h14.credVB, credFit: h14.credFit, credDanger: h14.credDanger });
  check('85114 farmer all-beats cook 257, patrol 0, preClaimedCred 13', h14 && h14.allBeatsDuty.cook === 257 && h14.patrolAttempts === 0 && h14.preClaimedCred === 13, h14 && { cook: h14.allBeatsDuty.cook, preClaimedCred: h14.preClaimedCred });
  check('85114 seed patrol 0, errs 0', s14.patrolAttemptsAll === 0 && s14.psErrors === 0, { patrol: s14.patrolAttemptsAll, errs: s14.psErrors });
}

// 6. Det-gate: re-run corpora byte-identical to judged corpora.
{
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-killscred-a');
  const detDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-killscred-a-det');
  for (const seed of [85111, 85114]) {
    const a = fs.readFileSync(path.join(dir, `s${seed}.json`), 'utf8');
    let b = null;
    try { b = fs.readFileSync(path.join(detDir, `s${seed}.json`), 'utf8'); } catch (e) {}
    check(`det-gate s${seed} byte-identical`, b !== null && a === b, b === null ? 'det file missing' : `lengths ${a.length} vs ${b.length}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
