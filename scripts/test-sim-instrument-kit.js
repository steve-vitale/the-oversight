#!/usr/bin/env node
// test-sim-instrument-kit.js — proof for scripts/sim-instrument-kit.js.
// Fails (exit 1) on any failed assertion; prints PASS lines otherwise.
// Covers one assertion per gap line the kit closes, on synthetic rows that
// mirror the triage shapes (never on live corpora, which the kit must not
// rewrite).
'use strict';
const kit = require('./sim-instrument-kit');
const assert = require('assert');

function eq(a, b, msg) { assert.deepStrictEqual(a, b, msg); console.log('PASS ' + msg); }

// 544 + 515: thirst/dehydration and starved/starvation canonicalize.
eq(kit.canonicalDeathCause('thirst'), 'dehydration', '544/515 thirst->dehydration');
eq(kit.canonicalDeathCause('Dehydration'), 'dehydration', '544 dehydration stable');
eq(kit.canonicalDeathCause('starved'), 'starvation', '515 starved->starvation');

// 358: generic combat flagged, monster-named combat not.
eq(kit.isGenericCombat({ cause: 'combat' }), true, '358 generic combat flagged');
eq(kit.isGenericCombat({ cause: 'combat', oppMid: 'choir-toad' }), false, '358 named combat not generic');

// 456: scholar death kinded scholar even when tele says player.
eq(kit.scholarKind({ who: 'v9', kind: 'player' }, 'v9'), 'scholar', '456 scholar kind');
eq(kit.scholarKind({ who: 'v3', kind: 'villager' }, 'v9'), 'villager', '456 non-scholar untouched');

// 517: true re-emit dedupes, different-victim same-day does not.
{
  const rows = [
    { day: 10, who: 'v1', kind: 'person', cause: 'combat' },
    { day: 10, who: 'v1', kind: 'person', cause: 'combat' },
    { day: 10, who: 'v2', kind: 'person', cause: 'combat' },
  ];
  eq(kit.dedupeDeathRows(rows).length, 2, '517 dedupe collapses re-emit only');
}

// 525/530/543: kill rows and phantom person rows filtered; roster enforced.
{
  const rows = [
    { day: 1, who: 'v1', kind: 'person' },
    { day: 1, who: 'v1', kind: 'kill', victimKind: 'monster' },
    { day: 1, who: 'vx', kind: 'person' },
  ];
  eq(kit.filterPersonDeaths(rows, ['v1']).length, 1, '525/530/543 person filter + roster');
}

// 554/562: via corrected by `by`, not by tag.
{
  const fixed = kit.resolveVia({ by: 'v4', via: 'player', mid: 'm1' }, 'v9');
  eq(fixed.via, 'villager', '554/562 via corrected to villager');
  eq(fixed.viaCorrected, true, '554/562 correction flagged');
  eq(kit.resolveVia({ by: 'v9', via: 'player' }, 'v9').via, 'player', '554/562 scholar kill keeps player');
}

// 123: villageEats dedupe on (vid, day).
eq(kit.dedupeVillageEats([
  { vid: 'v1', day: 5 }, { vid: 'v1', day: 5 }, { vid: 'v1', day: 6 },
]).length, 2, '123 villageEats dedupe');

// 176: lineage sums across successor rows.
{
  const sums = kit.lineageLedgerSum([
    { lineageId: 'L1', takes: 3, gives: 1 }, { lineageId: 'L1', takes: 2, gives: 4 },
  ]);
  eq(sums.L1.takes, 5, '176 lineage takes summed');
  eq(sums.L1.gives, 5, '176 lineage gives summed');
}

// 217: n-floor — a novel cause at n=1 is NOT a mode; at n=3 it is.
{
  const ctrl = [{ cause: 'starvation' }];
  eq(kit.deathCauseSetDiff(ctrl, [{ cause: 'alien' }]).novel.length, 0, '217 n-floor blocks n=1 novel');
  eq(kit.deathCauseSetDiff(ctrl, [{ cause: 'alien' }, { cause: 'alien' }, { cause: 'alien' }]).novel.length, 1, '217 n-floor passes n=3 novel');
  // ...and thirst in armed vs dehydration in control is NOT novel (canonical).
  eq(kit.deathCauseSetDiff([{ cause: 'dehydration' }], [{ cause: 'thirst' }, { cause: 'thirst' }, { cause: 'thirst' }]).novel.length, 0, '515 canonical set-diff no false novel');
}

// 468: fight-seq join beats same-mid other-day; no forward (+1d) match.
{
  const fights = [
    { seq: 's1', day: 10, mid: 'choir-toad', party: ['v1'] },
    { seq: 's2', day: 12, mid: 'choir-toad', party: ['v1'] },
  ];
  const j = kit.linkDeathToFight({ day: 10, who: 'v1', fightSeq: 's1', cause: 'combat' }, fights);
  eq(j.basis, 'fightSeq', '468 fightSeq join');
  eq(j.fight.seq, 's1', '468 same-mid other-day NOT linked');
  const fwd = kit.linkDeathToFight({ day: 9, who: 'v1', cause: 'combat' }, fights);
  eq(fwd.basis !== 'same-day:victim-or-monster', true, '468 no forward match');
}

// 883: window pass — prior-linked passes, unlinked same-day links, no-fight stays unlinked.
{
  const deaths = [
    { day: 50, who: 'v1', cause: 'combat', fightBasis: 'same-day:combat_start' },
    { day: 51, who: 'v2', cause: 'monster', fightBasis: 'none' },
    { day: 99, who: 'v3', cause: 'monster', fightBasis: 'none' },
  ];
  const fights = [{ day: 51, mid: 'eulogy', party: ['v2'] }];
  const res = kit.attributeWindowDeaths(deaths, fights);
  eq(res.total, 3, '883 window total');
  eq(res.linked, 2, '883 window linked (prior + postpass)');
  eq(res.unlinked, 1, '883 window unlinked honestly kept');
  eq(res.unlinkedRows[0].unlinkedReason, 'no-fight-in-window', '883 unlinked reason');
}

// 357: over-other split needs win flags, never inference from the label alone.
eq(kit.splitEndReason({ endReason: 'over-other', won: true }).inferred, 'table-win', '357 over-other + won = table-win');
eq(kit.splitEndReason({ endReason: 'over-other' }).inferred, 'unknown-over-other', '357 over-other alone = unknown');

// 760: win-path extractor — invitation is reach, sitting is seat.
{
  const w = kit.winPath({ tableInvited: true, seatTaken: false, everNational: true, tablePath: 'beloved' });
  eq(w.tableReach, true, '760 invitation counts as reach');
  eq(w.seat, false, '760 invitation is not a seat');
  eq(w.everNational, true, '760 ever-national recorded');
}

// 467: reposition rows without outcome/result are invalid, not pooled silently.
eq(kit.repositionRow({ day: 3, who: 'v1' }).valid, false, '467 reposition missing outcome invalid');
eq(kit.repositionRow({ day: 3, who: 'v1', outcome: 'joined', result: 'kill' }).valid, true, '467 reposition complete valid');

// 870: ms keys stripped at every depth; everything else exact.
eq(kit.normalizeRepro({ diag: { ms: 123, inflowTotal: 5 }, ms: 9, n: 2 }),
  { diag: { inflowTotal: 5 }, n: 2 }, '870 ms stripped recursively');

// 482: summary-only keys are not per-seed keys.
eq(kit.telemetryKeyKind('winRate'), 'summary-only', '482 winRate summary-only');
eq(kit.telemetryKeyKind('deathCauses'), 'per-seed', '482 deathCauses per-seed');

console.log('ALL KIT PROOFS PASS');
