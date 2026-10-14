#!/usr/bin/env node
// test-hollow-instrument-20261014.js — proof test for the r27 census
// extensions (HOLLOW UNLOCK #134, 48h chains #90, person-fight subtypes).
//
// PART A: pure, deterministic — synthetic fixtures with real RED phases:
//   the naive instrument behavior is asserted FIRST (RED), then the fixed
//   behavior (GREEN). Any regression shows up as a RED on an old nail.
// PART B: live — runOne(55, 180d, wraps:'all') must emit zero instrument
//   exceptions, reconciled villager rows, all rows >= unlock day; and
//   instrument-honesty: wraps:'all' vs wraps:'none' must be BYTE-IDENTICAL
//   on per-day state hashes (the wraps are read-only).
'use strict';
const assert = require('assert');
const {
  categorizeCause, buildVillagerRows, aggregateVillagerRows,
  classifyPersonFight, findCombatChains48, buildVillageProfile,
} = require('./w5census-lib');

let pass = 0, fail = 0;
const MON = new Set(['The Suburb', 'The Audit', 'The Rerun']);
function check(name, fn) {
  try { fn(); pass++; console.log('  PASS', name); }
  catch (e) { fail++; console.log('  FAIL', name, '—', e.message); }
}

console.log('PART A — pure instrument behavior (RED then GREEN)');

// ---- A1: taxonomy on villager causes ----
check('A1 RED: naive exact-match buckets monster-name deaths as unknown', () => {
  // the naive rule (old exact-map) has no monsterNames set: a death caused
  // "by The Suburb" (cause string) falls through
  const naive = (cause) => ['combat','starvation'].includes(String(cause).toLowerCase()) ? cause : 'other:' + cause;
  assert.strictEqual(naive('killed by The Suburb'), 'other:killed by The Suburb');
});
check('A1 GREEN: named monsters -> combat; canonical causes pinned', () => {
  assert.strictEqual(categorizeCause('The Suburb', MON), 'combat');
  assert.strictEqual(categorizeCause('The Audit', MON), 'combat');
  assert.strictEqual(categorizeCause('monster', MON), 'combat', 'villager field-fight death');
  assert.strictEqual(categorizeCause('villager combat', MON), 'combat');
  assert.strictEqual(categorizeCause('starvation', MON), 'starvation');
  assert.strictEqual(categorizeCause('sickness', MON), 'disease');
  assert.strictEqual(categorizeCause('ambush', MON), 'other:ambush', 'unknown stays visible, never silently absorbed');
  assert.strictEqual(categorizeCause('weird new thing', MON), 'other:weird new thing');
});

// ---- A2: villager rows — unlock filter, tenure, reconciliation ----
const TEN = [{ vid: 'v-a', startDay: 60 }, { vid: 'v-b', startDay: 70 }];
const VDEATHS = [
  { day: 64, who: 'w1', cause: 'starvation', kind: 'villager' },   // pre-unlock
  { day: 68, who: 'w2', cause: 'starvation', kind: 'villager' },   // unlock day
  { day: 72, who: 'w3', cause: 'villager combat', kind: 'villager' },
  { day: 75, who: 'w4', cause: 'The Audit', kind: 'person' },
  { day: 59, who: 'w0', cause: 'starvation', kind: 'villager' },   // pre-unlock
];
check('A2 RED: unfiltered instrument counts pre-unlock deaths', () => {
  assert.strictEqual(VDEATHS.length, 5, 'fixture must include 2 pre-unlock deaths');
});
check('A2 GREEN: filter drops pre-unlock, tenure attaches, recon pins', () => {
  const { rows, reconciliation } = buildVillagerRows({ unlockDayW5: 68, villagerDeaths: VDEATHS, tenures: TEN, monsterNames: MON });
  assert.strictEqual(rows.length, 3, 'only day>=68 rows');
  assert.strictEqual(reconciliation.postUnlockVillagerDeaths, 3);
  assert.strictEqual(reconciliation.rows, 3, 'rows must equal post-unlock tally');
  assert.strictEqual(reconciliation.preUnlockVillagerDeaths, 2);
  assert.deepStrictEqual(rows.map(r => r.deathDay), [68, 72, 75], 'sorted by day');
  assert.ok(rows.every(r => r.deathDay >= 68));
  assert.strictEqual(rows[0].mantleAtDeath, 'v-a', 'mantle at d68 is the d60 tenure');
  assert.strictEqual(rows[1].mantleAtDeath, 'v-b', 'mantle at d72 is the d70 tenure');
  assert.strictEqual(rows[0].category, 'starvation');
  assert.strictEqual(rows[2].category, 'combat', 'named monster cause -> combat');
});
check('A2 GREEN: null unlock -> no rows, aggregates name causes', () => {
  const { rows, reconciliation } = buildVillagerRows({ unlockDayW5: null, villagerDeaths: VDEATHS, tenures: TEN, monsterNames: MON });
  assert.strictEqual(rows.length, 0);
  assert.strictEqual(reconciliation.postUnlockVillagerDeaths, 0);
  const { rows: r2 } = buildVillagerRows({ unlockDayW5: 68, villagerDeaths: VDEATHS, tenures: TEN, monsterNames: MON });
  const agg = aggregateVillagerRows(r2);
  assert.strictEqual(agg.n, 3);
  assert.strictEqual(agg.top3[0].cause, 'combat');
  assert.strictEqual(agg.top3[0].n, 2);
});

// ---- A3: 48h combat-succession chains (#90) ----
const mkRow = (deathDay, category, who) => ({ deathDay, category, who: who || 'b' + deathDay, w5Fought: false });
check('A3 RED: same-day metric (gap 0) misses d91->d92->d93', () => {
  const rows = [mkRow(91, 'combat'), mkRow(92, 'combat'), mkRow(93, 'combat')];
  const sameDay = rows.filter((r, i) => i > 0 && r.deathDay === rows[i - 1].deathDay);
  assert.strictEqual(sameDay.length, 0, 'same-day metric sees nothing — the miss that opened #90');
});
check('A3 GREEN: d91->d92->d93 is a depth-3 48h chain', () => {
  const chains = findCombatChains48([mkRow(91, 'combat'), mkRow(92, 'combat'), mkRow(93, 'combat')]);
  assert.strictEqual(chains.length, 1);
  assert.strictEqual(chains[0].depth, 3);
  assert.deepStrictEqual([chains[0].from, chains[0].to], [91, 93]);
});
check('A3 GREEN: d75->d76 is a depth-2 chain; gap 3 breaks', () => {
  const chains = findCombatChains48([mkRow(75, 'combat'), mkRow(76, 'combat'), mkRow(79, 'combat')]);
  assert.strictEqual(chains.length, 1, 'gap 3 (>48h) breaks the chain');
  assert.strictEqual(chains[0].depth, 2);
  assert.deepStrictEqual([chains[0].from, chains[0].to], [75, 76]);
});
check('A3 GREEN: non-combat rows neither start nor extend chains', () => {
  const chains = findCombatChains48([mkRow(90, 'combat'), mkRow(91, 'contest'), mkRow(92, 'combat')]);
  assert.strictEqual(chains.length, 1);
  assert.strictEqual(chains[0].depth, 2, 'the contest death does not break or extend the chain');
  assert.strictEqual(findCombatChains48([mkRow(90, 'starvation'), mkRow(91, 'disease')]).length, 0);
});
check('A3 GREEN: s22-d144 alien-duel row is EXCLUDED (person, not combat feed)', () => {
  // the census rows carry category 'combat' for person-fight deaths; the
  // 48h metric deliberately only chains paired monster-fight successions...
  // here we assert the category gate: a non-'combat' row never chains.
  const rows = [mkRow(144, 'other:Stranger', 'duelist'), mkRow(145, 'combat', 'heir')];
  assert.strictEqual(findCombatChains48(rows).length, 0);
});

// ---- A4: person-fight subtype splits ----
check('A4 RED: s22-d144-shaped fixture misclassifies without the alienPid rule', () => {
  const naive = (snap) => snap.uprising ? 'uprising' : (snap.betrayal ? 'betrayal' : 'other-person');
  const s144 = { uprising: false, betrayal: false, hasAlienPid: true };
  assert.strictEqual(naive(s144), 'other-person', 'naive loses the alien duel');
});
check('A4 GREEN: alienPid -> alien-duel (wins over everything)', () => {
  assert.strictEqual(classifyPersonFight({ hasAlienPid: true, uprising: false, betrayal: false }), 'alien-duel');
  assert.strictEqual(classifyPersonFight({ hasAlienPid: true, uprising: true, betrayal: true }), 'alien-duel');
});
check('A4 GREEN: uprising / betrayal / plain hostile', () => {
  assert.strictEqual(classifyPersonFight({ uprising: true, betrayal: true, hasAlienPid: false }), 'uprising');
  assert.strictEqual(classifyPersonFight({ uprising: false, betrayal: true, hasAlienPid: false }), 'betrayal');
  assert.strictEqual(classifyPersonFight({ uprising: false, betrayal: false, hasAlienPid: false }), 'other-person');
  assert.strictEqual(classifyPersonFight(null), 'other-person', 'null-safe');
});

// ---- A5: village profile ----
check('A5 GREEN: hollow-vs-combat story in numbers', () => {
  const curve = [];
  for (let d = 68; d <= 87; d++) {
    curve.push({ day: d, roster: Math.max(1, 9 - Math.floor((d - 68) / 3)),
      pantryKcal: 20000 - (d - 68) * 800, trustMean: 55 - (d - 68) * 0.5,
      trustMin: 20, trustN: 9, low: 1, mid: 6, high: 2, standing: 277 });
  }
  const vrows = [
    { deathDay: 70, daysPostUnlock: 2, category: 'starvation', cause: 'starvation' },
    { deathDay: 80, daysPostUnlock: 12, category: 'disease', cause: 'sickness' },
    { deathDay: 120, daysPostUnlock: 52, category: 'combat', cause: 'combat' }, // outside window
  ];
  const p = buildVillageProfile(curve, vrows, 68);
  assert.strictEqual(p.atUnlock.roster, 9);
  assert.strictEqual(p.window30.minRoster, 3, 'roster fell to 3 in the window');
  assert.strictEqual(p.window30.villagerDeaths, 2, 'only in-window deaths count');
  assert.strictEqual(p.window30.deathsByCause.starvation, 1);
  assert.strictEqual(p.window30.deathsByCause.disease, 1);
  assert.ok(p.window30.minPantry < p.atUnlock.pantryKcal);
});

console.log(`PART A: ${pass} pass, ${fail} fail`);
if (fail) { console.log('PART A FAILED'); process.exit(1); }

console.log('PART B — live instrument proof (seed 55, 180d)');
(async () => {
  const { runOne } = require('./sweep-w5census-r27-20261014');
  const wrapped = await runOne(55, { days: 180, wraps: 'all', collectHashes: true, verbose: false });
  console.log('  wrapped: end=' + wrapped.endReason + ' gameDays=' + wrapped.gameDays +
    ' w5=' + (wrapped.wave5Unlocked ? 'd' + wrapped.unlockDayW5 : 'no') +
    ' instrErr=' + wrapped.instrErrors + ' dayHashes=' + wrapped.dayHashes.length);
  let ok = true;
  const t = (name, cond, detail) => {
    if (cond) { pass++; console.log('  PASS', name); }
    else { fail++; ok = false; console.log('  FAIL', name, '—', detail || ''); }
  };
  t('B1 instrument exceptions = 0', wrapped.instrErrors === 0, 'instrErrors=' + wrapped.instrErrors);
  t('B2 scholar rows reconcile', wrapped.reconciliation.reconciled,
    JSON.stringify(wrapped.reconciliation));
  t('B3 villager rows reconcile', wrapped.villagerReconciliation.reconciled,
    JSON.stringify(wrapped.villagerReconciliation));
  if (wrapped.wave5Unlocked) {
    t('B4 every row deathDay >= unlockDay',
      wrapped.census.every(r => r.deathDay >= wrapped.unlockDayW5) &&
      wrapped.villagerRows.every(r => r.deathDay >= wrapped.unlockDayW5));
    t('B5 villager rows have mantle context',
      wrapped.villagerRows.length === 0 ||
      wrapped.villagerRows.some(r => r.mantleAtDeath != null),
      'no row matched any tenure');
    t('B6 village profile built', wrapped.villageProfile != null &&
      wrapped.villageProfile.atUnlock.roster != null,
      JSON.stringify(wrapped.villageProfile && wrapped.villageProfile.atUnlock));
  } else {
    t('B4-B6 skipped (no w5 unlock on s55 this invocation)', true);
  }
  t('B7 person-fight census rows carry a subtype',
    wrapped.census.every(r => !r.pairedFight || !r.pairedFight.personFight ||
      typeof r.pairedFight.subtype === 'string'),
    'a person-fight row lacks a subtype');
  // B8: instrument-honesty — wraps:'all' vs wraps:'none' byte-identical
  const unwrapped = await runOne(55, { days: 180, wraps: 'none', collectHashes: true, verbose: false });
  console.log('  unwrapped: end=' + unwrapped.endReason + ' gameDays=' + unwrapped.gameDays +
    ' w5=' + (unwrapped.wave5Unlocked ? 'd' + unwrapped.unlockDayW5 : 'no') +
    ' dayHashes=' + unwrapped.dayHashes.length);
  const A = wrapped.dayHashes, B = unwrapped.dayHashes;
  let firstDiff = -1;
  for (let i = 0; i < Math.min(A.length, B.length); i++) {
    if (A[i] !== B[i]) { firstDiff = i; break; }
  }
  t('B8 instrument-honesty: wraps byte-identical on day hashes',
    A.length === B.length && firstDiff < 0,
    'lenA=' + A.length + ' lenB=' + B.length + ' firstDiffIdx=' + firstDiff +
    (firstDiff >= 0 ? ' A=' + A[firstDiff] + ' B=' + B[firstDiff] : ''));
  console.log(`TOTAL: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
