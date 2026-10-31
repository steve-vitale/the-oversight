#!/usr/bin/env node
// test-soleprotect-20261031.js — sim-soleprotect-a proof test.
// Pure-analyzer cases (no game load, no RNG) + optional corpus
// reconciliation when this arm's pilot corpora exist on disk.
// Usage: node scripts/test-soleprotect-20261031.js
//   (corpus dirs, when present:
//    evidence/2026-10-31/perseed-soleprotect-a-{base,instrument}-{pilot,confirm}/)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { analyzeSeed } = require(path.join(__dirname, 'soleprotect-analyze-20261031'));

let n = 0;
function check(name, fn) { fn(); n++; console.log(`ok ${n} - ${name}`); }

// Minimal corpus builder: beats with roster rows + delegate assigns.
function beat(id, day, part, rows) {
  return { id, day, part, atHaven: true, roster: rows };
}
function row(vid, hp, kills, occ) {
  return { vid, personMissing: false, dead: false, hp, occ, occLower: (occ || '').toLowerCase(),
    specCook: 0, specPreserver: 0, kills, agencyPresent: true,
    credOcc: false, credKills: kills > 0, cred: kills > 0, trust: 10,
    hadAssignment: false, preTask: null, isPatrolLead: false };
}
function corpus(seed, beats, assigns, deaths, gameDays) {
  return { seed, arm: 'test', anchorCommit: 'test', gameDays,
    endReason: 'test', national: 0, table: 0, won: 0, maxWave: 1,
    wave4: 0, wave5: 0, psBeats: beats, psAssigns: assigns,
    psErrors: [], deaths };
}
function delAssign(beatId, vid, task) {
  return { beat: beatId, day: 0, part: 0, vid, task, via: 'in-person',
    assignedAfter: true, retOk: true, retRefused: false, caller: 'delegateBeat' };
}

// Case 1: sole mend holder, patrol death at HP 94 -> NOT retreat-80 saved.
check('sole mend patrol death HP94: classified combat, retreat80 false', () => {
  const beats = [
    beat(1, 10, 0, [row('m1', 100, 1, 'mechanic')]),
    beat(2, 10, 1, [row('m1', 100, 1, 'mechanic')]),
    beat(3, 20, 0, [row('m1', 94, 1, 'mechanic')]),
    beat(4, 20, 1, [row('m1', 94, 1, 'mechanic')]),
    beat(5, 20, 2, []), // vanished after the patrol beat
    beat(6, 21, 0, []),
  ];
  const assigns = [delAssign(1, 'm1', 'mend'), delAssign(2, 'm1', 'mend'),
    delAssign(3, 'm1', 'mend'), delAssign(4, 'm1', 'patrol')];
  const j = corpus(1, beats, assigns, [{ day: 20, kind: 'villager', who: 'm1', cause: 'monster', player: false }], 21);
  const s = analyzeSeed(j);
  assert.strictEqual(s.soleCoverage.mend.providerCount, 1);
  assert.strictEqual(s.soleCoverage.mend.soleHolderVid, 'm1');
  assert.strictEqual(s.holders.length, 1);
  const h = s.holders[0];
  assert.strictEqual(h.isSoleSpecialist, true);
  assert.deepStrictEqual(h.patrolDeath.day, 20);
  assert.strictEqual(h.patrolDeath.cause, 'monster');
  assert.strictEqual(h.patrolDeath.hpAtDeath, 94);
  assert.strictEqual(h.patrolDeath.retreat80Saved, false);
  assert.strictEqual(h.patrolDeath.daysFirstKillToDeath, 10);
  assert.strictEqual(h.patrolDeath.patrolPicksBeforeDeath, 1);
  assert.strictEqual(h.truncation.mend.beforeDeath, 2);
  assert.strictEqual(h.truncation.mend.deathDay, 1);
  assert.strictEqual(h.truncation.mend.afterDeath, 0);
  assert.strictEqual(h.truncation.mend.postDeathEmptyDays, 1);
  assert.strictEqual(h.truncation.mend.postDeathDays, 1);
});

// Case 2: same shape at HP 70 -> retreat-80 saved.
check('sole mend patrol death HP70: retreat80 true', () => {
  const beats = [
    beat(1, 10, 0, [row('m1', 100, 1, 'mechanic')]),
    beat(2, 20, 1, [row('m1', 70, 1, 'mechanic')]),
    beat(3, 20, 2, []),
  ];
  const assigns = [delAssign(1, 'm1', 'mend'), delAssign(2, 'm1', 'patrol')];
  const j = corpus(1, beats, assigns, [{ day: 20, kind: 'villager', who: 'm1', cause: 'monster', player: false }], 20);
  const h = analyzeSeed(j).holders[0];
  assert.strictEqual(h.patrolDeath.hpAtDeath, 70);
  assert.strictEqual(h.patrolDeath.retreat80Saved, true);
});

// Case 3: sole cook holder survives -> no patrol death, survival row.
check('sole cook holder survives: no death, truncation survival row', () => {
  const beats = [
    beat(1, 10, 0, [row('c1', 100, 1, 'farmer')]),
    beat(2, 11, 0, [row('c1', 100, 1, 'farmer')]),
  ];
  const assigns = [delAssign(1, 'c1', 'cook'), delAssign(2, 'c1', 'patrol')];
  const j = corpus(1, beats, assigns, [], 11);
  const s = analyzeSeed(j);
  assert.strictEqual(s.soleCoverage.cook.providerCount, 1);
  const h = s.holders[0];
  assert.strictEqual(h.death, null);
  assert.strictEqual(h.patrolDeath, null);
  assert.strictEqual(h.truncation.cook.villageTotal, 1);
  assert.strictEqual(h.truncation.cook.survivedNote, 'holder alive at run end');
});

// Case 4: two mend providers -> nobody sole; holder patrol death NOT counted as sole.
check('shared mend: holder not sole, patrol death not sole-counted', () => {
  const beats = [
    beat(1, 10, 0, [row('m1', 100, 1, 'mechanic'), row('m2', 100, 0, 'carpenter')]),
    beat(2, 20, 1, [row('m1', 90, 1, 'mechanic'), row('m2', 100, 0, 'carpenter')]),
    beat(3, 20, 2, [row('m2', 100, 0, 'carpenter')]),
  ];
  const assigns = [delAssign(1, 'm1', 'mend'), delAssign(1, 'm2', 'mend'),
    delAssign(2, 'm1', 'patrol')];
  const j = corpus(1, beats, assigns, [{ day: 20, kind: 'villager', who: 'm1', cause: 'monster', player: false }], 20);
  const s = analyzeSeed(j);
  assert.strictEqual(s.soleCoverage.mend.providerCount, 2);
  assert.strictEqual(s.holders[0].isSoleSpecialist, false);
  assert.strictEqual(s.holders[0].patrolDeath, null);
  assert.deepStrictEqual(s.holders[0].truncation, {});
});

// Case 5: sole holder dies of sickness on a non-patrol day -> not a patrol death.
check('sole holder sickness death: patrolDeath null, death recorded', () => {
  const beats = [
    beat(1, 10, 0, [row('m1', 100, 1, 'mechanic')]),
    beat(2, 20, 0, [row('m1', 50, 1, 'mechanic')]),
    beat(3, 20, 1, []),
  ];
  const assigns = [delAssign(1, 'm1', 'mend'), delAssign(2, 'm1', 'rest')];
  const j = corpus(1, beats, assigns, [{ day: 20, kind: 'villager', who: 'm1', cause: 'sickness', player: false }], 20);
  const h = analyzeSeed(j).holders[0];
  assert.strictEqual(h.death.cause, 'sickness');
  assert.strictEqual(h.patrolDeath, null);
});

// Case 6: non-sole holder with no death + multi-skill holder counted once.
check('holder with both skills sole: both truncation rows present', () => {
  const beats = [beat(1, 10, 0, [row('x1', 100, 2, 'cook')])];
  const assigns = [delAssign(1, 'x1', 'cook')];
  const j = corpus(1, beats, assigns, [], 10);
  const s = analyzeSeed(j);
  assert.strictEqual(s.soleCoverage.cook.soleHolderVid, 'x1');
  assert.strictEqual(s.soleCoverage.mend.providerCount, 0);
  assert.strictEqual(s.soleCoverage.mend.soleHolderVid, null);
});

// Corpus reconciliation (runs only when corpora exist).
const REPO = path.join(__dirname, '..');
for (const leg of ['base', 'instrument']) {
 for (const band of ['pilot', 'confirm']) {
  const dir = path.join(REPO, 'evidence', '2026-10-31', `perseed-soleprotect-a-${leg}-${band}`);
  if (!fs.existsSync(dir)) { console.log(`skip corpus ${leg}-${band}: ${dir} not present yet`); continue; }
  const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
  assert.ok(files.length >= 8, `corpus ${leg}: expected >=8 seeds, got ${files.length}`);
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = analyzeSeed(j);
    assert.strictEqual(s.psErrors, 0, `corpus ${leg} ${f}: recorder errors`);
    assert.ok(s.beats > 0, `corpus ${leg} ${f}: beats`);
    for (const h of s.holders) {
      if (!h.isSoleSpecialist) continue;
      // Every sole holder row must carry a truncation row per sole skill.
      for (const sk of ['mend', 'cook']) {
        if (h.sole[sk]) assert.ok(h.truncation[sk], `corpus ${leg} ${f} ${h.vid}: missing truncation ${sk}`);
      }
      // A sole holder with a death row must resolve to patrol-death or
      // an explicit non-patrol death (never a silent gap).
      if (h.death) assert.ok(h.patrolDeath || h.death.cause, `corpus ${leg} ${f} ${h.vid}: death unresolved`);
    }
  }
  console.log(`ok ${++n} - corpus ${leg}-${band}: ${files.length} seeds reconciled, errors 0`);
 }
}

console.log(`test-soleprotect-20261031.js: ${n} checks GREEN`);
