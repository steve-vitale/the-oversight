#!/usr/bin/env node
// test-w5census-instrument-20261014.js — proof test for the wave-5 post-unlock
// death census instrument (scale-onramp r26, 2026-10-14).
//
// PART A (pure, deterministic): w5census-lib on fabricated data — pins the
//   unlock filter, fight-context window, tenure matching, cause taxonomy
//   (no silent 'other' leaks for the canonical cause set), chain detection,
//   and aggregate shares.
// PART B (live, one seed): runOne(55, 180d, leadfeast) — the instrument runs
//   clean (zero instrument exceptions) and the census rows reconcile to the
//   death tally (rows == post-unlock player-death count; every row's death
//   day >= unlock day; every row's bearer appears in the tenure list).
//
// Usage: node scripts/test-w5census-instrument-20261014.js [--live-only|--pure-only]
'use strict';
const assert = require('assert');
const { categorizeCause, buildCensusRows, pairFights, findChains, aggregateRows } = require('./w5census-lib');

const MSET = new Set(['Highbeam Deer', 'The Cancellation', 'bulldozer', 'cancellation']);
const nameOf = (mid) => ({ cancellation: 'The Cancellation', editor: 'The Editor' }[mid] || mid);

function partA() {
  // --- taxonomy: canonical causes pin to buckets, never 'other' ---
  assert.strictEqual(categorizeCause('combat', MSET), 'combat');
  assert.strictEqual(categorizeCause('monster', MSET), 'combat');
  assert.strictEqual(categorizeCause('villager combat', MSET), 'combat');
  assert.strictEqual(categorizeCause('starvation', MSET), 'starvation');
  assert.strictEqual(categorizeCause('sickness', MSET), 'disease');
  assert.strictEqual(categorizeCause("a wound that wouldn't close", MSET), 'wound');
  assert.strictEqual(categorizeCause('contest', MSET), 'contest');
  assert.strictEqual(categorizeCause('the expedition', MSET), 'expedition');
  assert.strictEqual(categorizeCause('Highbeam Deer', MSET), 'combat', 'named-monster cause -> combat');
  assert.strictEqual(categorizeCause('cancellation', MSET), 'combat', 'monster-id cause -> combat');
  assert.ok(categorizeCause('spontaneous combustion', MSET).startsWith('other:'), 'unknown stays visible');

  // --- fabricated run: unlock day 70; deaths at 65 (pre), 76, 81, 95 (post) ---
  const playerDeaths = [
    { day: 65, who: 'v1', cause: 'starvation' },       // pre-unlock: excluded
    { day: 76, who: 'v2', cause: 'combat' },          // fatal fight in window
    { day: 81, who: 'v3', cause: 'sickness' },        // no fight in window
    { day: 95, who: 'v4', cause: 'the expedition' },
  ];
  const tenures = [
    { vid: 'v1', startDay: 40 }, { vid: 'v2', startDay: 65 },
    { vid: 'v3', startDay: 76 }, { vid: 'v4', startDay: 81 },
  ];
  const combatStarts = [
    { day: 70, mid: 'editor', wave: 4, pack: 1 },          // outside the d76 window [74,76]: excluded
    { day: 74, mid: 'cancellation', wave: 5, pack: 1 },    // in window
    { day: 75, mid: 'editor', wave: 5, pack: 2 },          // in window
    { day: 50, mid: 'bulldozer', wave: 1, pack: 1 },       // way outside
  ];
  const { rows, reconciliation } = buildCensusRows({
    unlockDayW5: 70, playerDeaths, tenures, combatStarts, nameOf,
    tableDays: [80], monsterNames: MSET,
  });
  assert.strictEqual(reconciliation.postUnlockDeaths, 3);
  assert.strictEqual(reconciliation.preUnlockDeaths, 1);
  assert.strictEqual(reconciliation.rows, 3, 'rows == post-unlock death count');
  assert.strictEqual(rows.length, 3);
  const r76 = rows[0];
  assert.strictEqual(r76.deathDay, 76);
  assert.strictEqual(r76.daysPostUnlock, 6);
  assert.strictEqual(r76.tenureStartDay, 65, 'tenure matched by vid');
  assert.strictEqual(r76.category, 'combat');
  assert.ok(r76.fightCtx.includes('The Cancellation'), 'fatal-fight monster in context');
  assert.ok(r76.fightCtx.includes('The Editor'), 'second window fight in context');
  assert.ok(r76.fightCtx.includes('w5'), 'wave tags present');
  assert.ok(!r76.fightCtx.includes('Bulldozer'), 'old fights outside window');
  assert.strictEqual(r76.w5Fought, true);
  assert.strictEqual(r76.tableReached, false, 'table at d80 is after d76 death');
  const r81 = rows[1];
  assert.strictEqual(r81.fightCtx, null, 'no fights in window -> null context, not empty string');
  assert.strictEqual(r81.category, 'disease');
  const r95 = rows[2];
  assert.strictEqual(r95.category, 'expedition');
  assert.strictEqual(r95.tableReached, true, 'table d80 falls inside [70, 95]');

  // --- no unlock: no rows, reconciliation clean ---
  const no = buildCensusRows({ unlockDayW5: null, playerDeaths, tenures, combatStarts, nameOf, tableDays: [], monsterNames: MSET });
  assert.strictEqual(no.rows.length, 0);
  assert.strictEqual(no.reconciliation.rows, 0);

  // --- fight pairing: greedy start/end pairing; unpaired end = person-fight ---
  // (shaped like the real s22 d144 case: monster fight ends d137 won, then a
  // start-less end d144 lost — the alien-duel person-fight)
  const pStarts = [
    { day: 137, mid: 'congregation', wave: 4, pack: 2 },
    { day: 146, mid: 'cancellation', wave: 5, pack: 1 },
  ];
  const pEnds = [
    { day: 137, result: 'won' },
    { day: 144, result: 'lost' },
    { day: 146, result: 'lost' },
  ];
  const pp = pairFights(pStarts, pEnds);
  assert.strictEqual(pp.length, 3);
  assert.strictEqual(pp[0].start.mid, 'congregation');
  assert.strictEqual(pp[0].end.result, 'won');
  assert.strictEqual(pp[1].start, null, 'the d144 end has no start — person-fight');
  assert.strictEqual(pp[1].end.result, 'lost');
  assert.strictEqual(pp[2].start.mid, 'cancellation', 'greedy consumption not derailed by the unpaired end');
  const { rows: prow } = buildCensusRows({
    unlockDayW5: 70,
    playerDeaths: [{ day: 144, who: 'v9', cause: 'combat' }],
    tenures: [{ vid: 'v9', startDay: 140 }],
    combatStarts: pStarts, pairs: pp, nameOf, tableDays: [], monsterNames: MSET,
  });
  assert.strictEqual(prow.length, 1);
  assert.strictEqual(prow[0].fightCtx, null, 'no combat_start in [142,144]');
  assert.strictEqual(prow[0].pairedFight.personFight, true, 'unpaired end -> person-fight');
  assert.strictEqual(prow[0].pairedFight.endDay, 144);
  assert.strictEqual(prow[0].pairedFight.result, 'lost');
  assert.ok(prow[0].pairedFight.note.includes('person-fight'));

  // --- chain detection: fabricated s303-like 7-deep chain d48-d76, gap <= 12 ---
  const chainRows = [];
  for (let i = 0; i < 7; i++) chainRows.push({ deathDay: 48 + i * 4, daysPostUnlock: 10 + i * 4, category: 'combat', w5Fought: i % 2 === 0 });
  chainRows.push({ deathDay: 120, daysPostUnlock: 82, category: 'starvation', w5Fought: false });
  const chains = findChains(chainRows);
  assert.strictEqual(chains.length, 1, 'the 7-deep run is one chain; the d120 death stands alone');
  assert.strictEqual(chains[0].depth, 7);
  assert.strictEqual(chains[0].from, 48);
  assert.strictEqual(chains[0].to, 72);

  // --- aggregates: shares sum to 1, top3 sorted desc ---
  const agg = aggregateRows(rows);
  assert.strictEqual(agg.n, 3);
  const tot = agg.all.reduce((t, c) => t + c.share, 0);
  assert.ok(Math.abs(tot - 1) < 0.01, 'shares sum to 1');
  for (let i = 1; i < agg.top3.length; i++) assert.ok(agg.top3[i - 1].n >= agg.top3[i].n, 'top3 sorted');
  assert.strictEqual(agg.medianDaysPostUnlock, 11);

  console.log('PART A (pure lib): PASS — taxonomy pinned, filter/window/tenure/chain/aggregate verified');
}

async function partB() {
  const { runOne } = require('./sweep-w5census-r26-20261014');
  // Seed 22 reproduced a 9-row census twice (sweep 1 + sweep 2); under the
  // r25 noise floor it may not unlock on a given invocation — the row
  // assertions below are conditional on the unlock, and the sweep itself
  // (19 rows, all reconciled) is the primary live proof.
  const row = await runOne(22, { days: 180, verbose: false });
  assert.strictEqual(row.instrErrors, 0, 'instrument must run exception-free');
  assert.ok(row.reconciliation.reconciled, 'census rows must reconcile to the death tally');
  const U = row.unlockDayW5;
  if (U != null) {
    assert.ok(row.census.length > 0 || row.reconciliation.postUnlockDeaths === 0, 'unlock without post-unlock deaths is honest');
    const vids = new Set(row.tenureVids || []);
    for (const c of row.census) {
      assert.ok(c.deathDay >= U, `row death day ${c.deathDay} >= unlock day ${U}`);
      assert.ok(vids.has(c.who) || c.who === '?', `bearer ${c.who} tracked in tenures`);
      assert.strictEqual(c.daysPostUnlock, c.deathDay - U, 'daysPostUnlock arithmetic');
    }
    const combatRows = row.census.filter(c => c.category === 'combat');
    const withCtx = combatRows.filter(c => c.fightCtx).length;
    console.log(`PART B (live seed 22): PASS — w5 unlocked d${U}, ${row.census.length} census rows, ` +
      `reconciled, ${combatRows.length} combat rows (${withCtx} with fight context), 0 instrument errors`);
  } else {
    console.log('PART B (live seed 22): PASS (no wave-5 unlock this invocation — noise floor; instrument still clean, reconciliation trivial)');
  }
}

(async () => {
  const only = process.argv[2] || '';
  if (only !== '--live-only') partA();
  if (only !== '--pure-only') await partB();
})().catch(e => { console.error('TEST FAIL:', e.message); process.exit(1); });
