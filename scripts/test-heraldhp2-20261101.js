#!/usr/bin/env node
// test-heraldhp2-20261101.js — proof for sim-heraldhp2-a.
//
// Copied from test-heraldhp-20261031.js (inherited checks,
// unchanged) plus census checks at the end. SYNTHETIC fixtures
// only (no band seeds): ledger deepest-row attribution, cause
// taxonomy, chunk math, replacement detection, field cross-check,
// attributed-share arithmetic, even-n median, plus census
// located/draft/wall/field/frequency measures.
// Usage: node scripts/test-heraldhp2-20261101.js
'use strict';
const assert = require('assert');
const A = require('./heraldhp-analyze-20261101');

let n = 0;
function ok(name, fn) { fn(); n++; console.log('ok ' + n + ' ' + name); }

// --- cause taxonomy ---
ok('classify fieldFight/aidFight -> FIELD', function () {
  assert.strictEqual(A.classifyRow({ fn: 'fieldFight' }), 'FIELD');
  assert.strictEqual(A.classifyRow({ fn: 'aidFight' }), 'FIELD');
});
ok('classify startCombat/tbEnd -> TB', function () {
  assert.strictEqual(A.classifyRow({ fn: 'startCombat' }), 'TB');
  assert.strictEqual(A.classifyRow({ fn: 'tbEnd' }), 'TB');
});
ok('classify titanDawnTick -> DAWN', function () {
  assert.strictEqual(A.classifyRow({ fn: 'titanDawnTick' }), 'DAWN');
});
ok('classify spawn/remove -> SPAWN', function () {
  assert.strictEqual(A.classifyRow({ fn: 'spawnWorldMonster' }), 'SPAWN');
  assert.strictEqual(A.classifyRow({ fn: 'removeWorldMonster' }), 'SPAWN');
});
ok('classify world drivers -> WORLD', function () {
  ['worldTick', 'villagerMonsterTick', 'wanderWorldMonsters', 'maintainWorldMonsters',
   'monsterTurn', 'animalTurn', 'resolveWildMonsterEncounter', 'resolvePatrol'].forEach(function (fn) {
    assert.strictEqual(A.classifyRow({ fn: fn }), 'WORLD');
  });
});
ok('classify sleep/unknown -> OTHER', function () {
  assert.strictEqual(A.classifyRow({ fn: 'sleep' }), 'OTHER');
  assert.strictEqual(A.classifyRow({ fn: 'titanSelfActions' }), 'OTHER');
});
ok('classify havenRaidTick/havenGrowthDaily -> RAID (attributed)', function () {
  assert.strictEqual(A.classifyRow({ fn: 'havenRaidTick' }), 'RAID');
  assert.strictEqual(A.classifyRow({ fn: 'havenGrowthDaily' }), 'RAID');
  assert.strictEqual(A.ATTRIBUTED.RAID, 1);
});

// --- deepest rows ---
ok('deepestRows drops parents, keeps childless', function () {
  const ledger = [
    { seq: 1, fn: 'worldTick', span: 10, parent: null },
    { seq: 2, fn: 'villagerMonsterTick', span: 11, parent: 10 },
    { seq: 3, fn: 'fieldFight', span: 12, parent: 11 },
    { seq: 4, fn: 'sleep', span: 13, parent: null },
  ];
  const deep = A.deepestRows(ledger);
  assert.deepStrictEqual(deep.map(function (r) { return r.fn; }), ['fieldFight', 'sleep']);
});
ok('deepestRows with no nesting keeps all', function () {
  const ledger = [
    { seq: 1, fn: 'sleep', span: 1, parent: null },
    { seq: 2, fn: 'sleep', span: 2, parent: null },
  ];
  assert.strictEqual(A.deepestRows(ledger).length, 2);
});

// --- row deltas ---
function ent(tag, hp) { return { tag: tag, idx: 0, tx: 4, ty: 4, mx: 0, my: 0, hp: hp, maxHp: 700, titan: true, lingering: false }; }
ok('rowDeltas damage/spawn/removal', function () {
  const dmg = A.rowDeltas({ before: [ent(1, 700)], after: [ent(1, 525)] });
  assert.deepStrictEqual(dmg, [{ tag: 1, before: 700, after: 525, delta: -175, kind: 'damage', bEnt: ent(1, 700), aEnt: ent(1, 525) }]);
  const sp = A.rowDeltas({ before: [], after: [ent(2, 700)] });
  assert.strictEqual(sp[0].kind, 'spawn');
  assert.strictEqual(sp[0].delta, 700);
  const rm = A.rowDeltas({ before: [ent(1, 105)], after: [] });
  assert.strictEqual(rm[0].kind, 'removal');
  assert.strictEqual(rm[0].delta, -105);
});
ok('rowDeltas replacement is spawn+removal, not damage', function () {
  const rows = A.rowDeltas({ before: [ent(1, 105)], after: [ent(2, 700)] });
  assert.deepStrictEqual(rows.map(function (r) { return r.kind; }).sort(), ['removal', 'spawn']);
});

// --- analyzeSeed on a synthetic window ---
function synthSeed() {
  // Window: refusals day 10 (525) .. day 20 (105) = drop 420.
  // Deepest rows in window: field -37, dawn -175, field -20, world -13,
  // sleep-other -175 (OTHER, unattributed). Attributed = 37+175+20+13
  // = 245; share = 245/420. Spawn 700 day 1 -> pre-window 175.
  const L = function (seq, fn, span, parent, day, before, after, detail) {
    return { seq: seq, fn: fn, day: day, dayBefore: day, depth: parent ? 1 : 0, span: span, parent: parent, before: before, after: after, detail: detail || null };
  };
  const ledger = [
    L(1, 'spawnWorldMonster', 1, null, 1, [], [ent(7, 700)]),
    L(2, 'fieldFight', 2, null, 5, [ent(7, 700)], [ent(7, 525)], { mDealt: 175 }),
    L(3, 'fieldFight', 3, null, 12, [ent(7, 525)], [ent(7, 488)], { mDealt: 37 }),
    L(4, 'titanDawnTick', 4, null, 15, [ent(7, 488)], [ent(7, 313)], null),
    L(5, 'fieldFight', 5, null, 16, [ent(7, 313)], [ent(7, 293)], { mDealt: 20 }),
    L(6, 'villagerMonsterTick', 6, null, 18, [ent(7, 293)], [ent(7, 280)], null),
    L(7, 'sleep', 7, null, 19, [ent(7, 280)], [ent(7, 105)], null),
    // A non-deepest wrapper row that must NOT double-count:
    L(8, 'worldTick', 8, null, 12, [ent(7, 525)], [ent(7, 488)], null),
  ];
  // Fix nesting: make the worldTick row the parent of the day-12 fight.
  ledger[2].parent = 8;
  ledger[7].depth = 1;
  return {
    seed: 99999, anchorCommit: 'synthetic',
    maxWave: 4, wave4: 1, wave5: 0, w4Day: 5, w5Day: null,
    national: 1, table: 0, won: 0, gameDays: 50, endReason: 'village-lost',
    attempts: [
      { mid: 'herald', cls: 'REFUSED', day: 10, entityHp: { hp: 525, maxHp: 700 } },
      { mid: 'herald', cls: 'REFUSED', day: 20, entityHp: { hp: 105, maxHp: 700 } },
    ],
    instrumentErrors: [], musterErrs: 0,
    heraldhp: {
      ledger: ledger,
      fieldRows: [
        { span: 2, day: 5, vid: 'v1', mid: 'herald', mDealt: 175, mHpLeft: 525, entryHp: 700, outcome: 'vFlee' },
        { span: 3, day: 12, vid: 'v1', mid: 'herald', mDealt: 37, mHpLeft: 488, entryHp: 525, outcome: 'vFlee' },
        { span: 5, day: 16, vid: 'v1', mid: 'herald', mDealt: 20, mHpLeft: 293, entryHp: 313, outcome: 'vFlee' },
      ],
      daily: [{ day: 20, ents: [ent(7, 105)] }],
      errors: [], wrapped: { fieldFight: true, sleep: true },
    },
  };
}
ok('analyzeSeed window drop + attributed share (OTHER excluded)', function () {
  const a = A.analyzeSeed(synthSeed());
  assert.strictEqual(a.firstHp, 525);
  assert.strictEqual(a.lastHp, 105);
  assert.strictEqual(a.windowDrop, 420);
  assert.strictEqual(a.attributed, 37 + 175 + 20 + 13);
  assert.strictEqual(a.otherDamage, 175);
  assert.strictEqual(a.attributedShare, 245 / 420);
  assert.strictEqual(a.byCause.FIELD, 57);
  assert.strictEqual(a.byCause.DAWN, 175);
  assert.strictEqual(a.byCause.WORLD, 13);
});
ok('analyzeSeed pre-window spawn chunk + tag continuity', function () {
  const a = A.analyzeSeed(synthSeed());
  assert.strictEqual(a.spawnHp, 700);
  assert.strictEqual(a.spawnDay, 1);
  assert.strictEqual(a.preWindowDrop, 175);
  assert.strictEqual(a.primaryTag, 7);
  assert.deepStrictEqual(a.distinctTags, [7]);
  assert.deepStrictEqual(a.otherTagChunks, []);
});
ok('analyzeSeed field cross-check totals', function () {
  const a = A.analyzeSeed(synthSeed());
  assert.strictEqual(a.heraldFieldRows, 3);
  assert.strictEqual(a.fieldDealtTotal, 175 + 37 + 20);
  assert.deepStrictEqual(a.fieldMismatches, []);
});
ok('analyzeSeed field mismatch flagged', function () {
  const d = synthSeed();
  d.heraldhp.fieldRows[0].mDealt = 170; // entry 700 - left 525 = 175, not 170
  const a = A.analyzeSeed(d);
  assert.strictEqual(a.fieldMismatches.length, 1);
  assert.strictEqual(a.fieldMismatches[0].entryMinusLeft, 175);
});
ok('analyzeSeed replacement detected via tags', function () {
  const d = synthSeed();
  // Replace the last sleep row's after-entity with a fresh tag at 700.
  d.heraldhp.ledger[6].after = [ent(9, 700)];
  const a = A.analyzeSeed(d);
  assert.ok(a.distinctTags.indexOf(9) >= 0);
  assert.ok(a.chunks.some(function (c) { return c.kind === 'spawn' && c.tag === 9; }));
});
ok('analyzeSeed zero-drop window gives null share (vacuous, not GO)', function () {
  const d = synthSeed();
  d.attempts[1].entityHp.hp = 525;
  const a = A.analyzeSeed(d);
  assert.strictEqual(a.windowDrop, 0);
  assert.strictEqual(a.attributedShare, null);
});
ok('analyzeSeed no-refusal seed gives null window', function () {
  const d = synthSeed();
  d.attempts = [];
  const a = A.analyzeSeed(d);
  assert.strictEqual(a.refusals, 0);
  assert.strictEqual(a.windowDrop, null);
  assert.strictEqual(a.attributedShare, null);
});

ok('analyzeSeed raid row attributes the wall chunk', function () {
  const L = function (seq, fn, span, parent, day, before, after) {
    return { seq: seq, fn: fn, day: day, dayBefore: day, depth: 0, span: span, parent: parent, before: before, after: after, detail: null };
  };
  const d = {
    seed: 99998, anchorCommit: 'synthetic',
    maxWave: 4, wave4: 1, wave5: 0, w4Day: 5, w5Day: null,
    national: 1, table: 0, won: 0, gameDays: 50, endReason: 'village-lost',
    attempts: [
      { mid: 'herald', cls: 'REFUSED', day: 10, entityHp: { hp: 525, maxHp: 700 } },
      { mid: 'herald', cls: 'REFUSED', day: 20, entityHp: { hp: 350, maxHp: 700 } },
    ],
    instrumentErrors: [], musterErrs: 0,
    heraldhp: {
      ledger: [
        L(1, 'spawnWorldMonster', 1, null, 1, [], [ent(7, 700)]),
        L(2, 'havenRaidTick', 2, null, 12, [ent(7, 525)], [Object.assign(ent(7, 350), { raidBorn: true, tx: 4, ty: 4 })]),
      ],
      fieldRows: [],
      daily: [{ day: 20, ents: [ent(7, 350)] }],
      errors: [], wrapped: { havenRaidTick: true },
    },
  };
  const a = A.analyzeSeed(d);
  assert.strictEqual(a.windowDrop, 175);
  assert.strictEqual(a.attributed, 175);
  assert.strictEqual(a.byCause.RAID, 175);
  assert.strictEqual(a.attributedShare, 1);
  assert.strictEqual(a.chunks.filter(function (c) { return c.cause === 'RAID'; }).length, 1);
});
ok('median even-n is mean of middle two', function () {
  assert.strictEqual(A.median([100, 110]), 105);
  assert.strictEqual(A.median([90, 100, 110, 130]), 105);
});
ok('median odd-n is middle', function () {
  assert.strictEqual(A.median([50, 100, 150]), 100);
});

// --- sim-heraldhp2-a census measures ---
function censusSeedRaw(seed, ledger, fieldRows, daily, attempts) {
  return {
    seed: seed, anchorCommit: 'synthetic',
    maxWave: 4, wave4: 1, wave5: 0, w4Day: null, w5Day: null,
    national: 0, table: 0, won: 0, gameDays: 50, endReason: 'village-lost',
    attempts: attempts || [], instrumentErrors: [], musterErrs: 0,
    heraldhp: { ledger: ledger, fieldRows: fieldRows || [], daily: daily || [], errors: [], wrapped: {} },
  };
}
function craw(seq, fn, span, parent, day, before, after) {
  return { seq: seq, fn: fn, day: day, dayBefore: day, depth: parent ? 1 : 0, span: span, parent: parent, before: before, after: after, detail: null };
}
function rent(tag, hp, raidBorn, tx, ty) {
  const e = ent(tag, hp); e.raidBorn = !!raidBorn; e.tx = (tx === undefined ? 4 : tx); e.ty = (ty === undefined ? 4 : ty); return e;
}
ok('censusSeed: unlocated seed (no daily, no ledger)', function () {
  const c = A.censusSeed(censusSeedRaw(1, [], [], [], []));
  assert.strictEqual(c.located, false);
  assert.strictEqual(c.drafts, 0);
  assert.strictEqual(c.wallLost, 0);
  assert.strictEqual(c.fieldFights, 0);
  assert.strictEqual(c.totalLost, null);
});
ok('censusSeed: located-undrafted seed (daily only, no damage)', function () {
  const c = A.censusSeed(censusSeedRaw(2, [], [], [{ day: 10, ents: [ent(3, 700)] }], []));
  assert.strictEqual(c.located, true);
  assert.strictEqual(c.drafts, 0);
  assert.strictEqual(c.wallLost, 0);
  assert.strictEqual(c.firstSeenHp, 700);
  assert.strictEqual(c.lastSeenHp, 700);
  assert.strictEqual(c.totalLost, 0);
});
ok('censusSeed: triple draft like 85106 (raidBorn + repeat deltas)', function () {
  const ledger = [
    craw(1, 'spawnWorldMonster', 1, null, 85, [], [rent(1, 700, false)]),
    craw(2, 'havenRaidTick', 2, null, 91, [rent(1, 700, false, 7, 4)], [rent(1, 525, true, 4, 4)]),
    craw(3, 'havenRaidTick', 3, null, 106, [rent(1, 525, true, 5, 3)], [rent(1, 350, true, 4, 4)]),
    craw(4, 'fieldFight', 4, null, 111, [rent(1, 350, true)], [rent(1, 313, true)]),
    craw(5, 'havenRaidTick', 5, null, 123, [rent(1, 293, true, 4, 5)], [rent(1, 118, true, 4, 4)]),
  ];
  const c = A.censusSeed(censusSeedRaw(85106, ledger,
    [{ span: 4, day: 111, vid: 'v1', mid: 'herald', mDealt: 37, mHpLeft: 313, entryHp: 350, outcome: 'vFlee' }],
    [{ day: 130, ents: [rent(1, 118, true)] }], []));
  assert.strictEqual(c.located, true);
  assert.strictEqual(c.drafts, 3);
  assert.strictEqual(c.wallLost, 525);
  assert.strictEqual(c.raidRowsTouching, 3);
  assert.deepStrictEqual(c.raidDays, [91, 106, 123]);
  assert.strictEqual(c.fieldFights, 1);
  assert.strictEqual(c.fieldDealt, 37);
  assert.strictEqual(c.firstSeenHp, 700);
  assert.strictEqual(c.lastSeenHp, 118);
  assert.strictEqual(c.totalLost, 582);
});
ok('censusSeed: nested raid row counts once (parent worldTick ignored)', function () {
  const ledger = [
    craw(1, 'worldTick', 10, null, 50, [rent(1, 700, false)], [rent(1, 525, true)]),
    craw(2, 'havenRaidTick', 11, 10, 50, [rent(1, 700, false)], [rent(1, 525, true)]),
  ];
  const c = A.censusSeed(censusSeedRaw(3, ledger, [], [{ day: 50, ents: [rent(1, 525, true)] }], []));
  assert.strictEqual(c.drafts, 1);
  assert.strictEqual(c.wallLost, 175);
  assert.strictEqual(c.raidRowsTouching, 1);
});
ok('censusSeed: no-damage re-draft row touches but is not a draft', function () {
  // Palisade down (or 1-HP floor): position changes, raidBorn
  // already true, HP unchanged -> touching row, zero drafts.
  const ledger = [
    craw(1, 'havenRaidTick', 1, null, 60, [rent(1, 400, true, 6, 6)], [rent(1, 400, true, 4, 4)]),
  ];
  const c = A.censusSeed(censusSeedRaw(4, ledger, [], [{ day: 60, ents: [rent(1, 400, true)] }], []));
  assert.strictEqual(c.located, true);
  assert.strictEqual(c.raidRowsTouching, 1);
  assert.strictEqual(c.drafts, 0);
  assert.strictEqual(c.wallLost, 0);
});
ok('censusSeed: field-only seed (no raid rows)', function () {
  const ledger = [
    craw(1, 'spawnWorldMonster', 1, null, 80, [], [rent(1, 700, false)]),
    craw(2, 'fieldFight', 2, null, 90, [rent(1, 700, false)], [rent(1, 663, false)]),
  ];
  const c = A.censusSeed(censusSeedRaw(5, ledger,
    [{ span: 2, day: 90, vid: 'v1', mid: 'herald', mDealt: 37, mHpLeft: 663, entryHp: 700, outcome: 'vFlee' }],
    [{ day: 90, ents: [rent(1, 663, false)] }], []));
  assert.strictEqual(c.drafts, 0);
  assert.strictEqual(c.wallLost, 0);
  assert.strictEqual(c.fieldFights, 1);
  assert.strictEqual(c.fieldDealt, 37);
  assert.strictEqual(c.totalLost, 37);
});
ok('censusSeed: refusal counts split fought vs refused', function () {
  const c = A.censusSeed(censusSeedRaw(6, [], [], [{ day: 10, ents: [ent(1, 700)] }],
    [{ mid: 'herald', cls: 'REFUSED', day: 10 }, { mid: 'herald', cls: 'REFUSED', day: 12 },
     { mid: 'herald', cls: 'FOUGHT', day: 14 }, { mid: 'other', cls: 'REFUSED', day: 15 }]));
  assert.strictEqual(c.heraldRefusals, 2);
  assert.strictEqual(c.heraldFought, 1);
});

ok('censusSeed: nested raid row recovers own-delta wall chunk', function () {
  // Mirrors seed 85123 day 125: raid row nets -183 (-175 wall +
  // -8 nested fight); deepest-only would drop the raid row and
  // hide the wall chunk. Own-delta must recover -175.
  const ledger = [
    craw(1, 'havenRaidTick', 100, null, 118, [rent(1, 700, false, 4, 6)], [rent(1, 525, true, 4, 4)]),
    craw(2, 'havenRaidTick', 200, 199, 125, [rent(1, 452, true, 4, 4)], [rent(1, 269, true, 4, 4)]),
    craw(3, 'resolveWildMonsterEncounter', 201, 200, 125, [rent(1, 277, true, 4, 4)], [rent(1, 269, true, 4, 4)]),
    craw(4, 'fieldFight', 202, 201, 125, [rent(1, 277, true, 4, 4)], [rent(1, 269, true, 4, 4)]),
  ];
  const c = A.censusSeed(censusSeedRaw(85123, ledger,
    [{ span: 202, day: 125, vid: 'v1', mid: 'herald', mDealt: 8, mHpLeft: 269, entryHp: 277, outcome: 'vFlee' }],
    [{ day: 126, ents: [rent(1, 269, true)] }], []));
  assert.strictEqual(c.drafts, 2);
  assert.strictEqual(c.wallLost, 350);
  assert.deepStrictEqual(c.raidDays, [118, 125]);
  assert.strictEqual(c.draftsDeepest, 1);
  assert.strictEqual(c.wallLostDeepest, 175);
  assert.strictEqual(c.fieldDealt, 8);
});
ok('censusSeed: triple draft still counts under own-delta', function () {
  const ledger = [
    craw(1, 'spawnWorldMonster', 1, null, 85, [], [rent(1, 700, false)]),
    craw(2, 'havenRaidTick', 2, null, 91, [rent(1, 700, false, 7, 4)], [rent(1, 525, true, 4, 4)]),
    craw(3, 'havenRaidTick', 3, null, 106, [rent(1, 525, true, 5, 3)], [rent(1, 350, true, 4, 4)]),
    craw(4, 'fieldFight', 4, null, 111, [rent(1, 350, true)], [rent(1, 313, true)]),
    craw(5, 'havenRaidTick', 5, null, 123, [rent(1, 293, true, 4, 5)], [rent(1, 118, true, 4, 4)]),
  ];
  const c = A.censusSeed(censusSeedRaw(85106, ledger,
    [{ span: 4, day: 111, vid: 'v1', mid: 'herald', mDealt: 37, mHpLeft: 313, entryHp: 350, outcome: 'vFlee' }],
    [{ day: 130, ents: [rent(1, 118, true)] }], []));
  assert.strictEqual(c.drafts, 3);
  assert.strictEqual(c.wallLost, 525);
  assert.strictEqual(c.draftsDeepest, 3);
  assert.strictEqual(c.wallLostDeepest, 525);
});

console.log('PASS ' + n + ' checks');
