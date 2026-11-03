# Pre-registration — sim-sortiev2-a (Loop A 20261103, axis scale-onramp)

MECHANISM-SETTLING DIAGNOSTIC, NOT a sortie retry, NOT a game change.
Zero src/js changes, policy/instrument only. This prereg is committed
BEFORE any judged work (no fresh sim is judged by this arm unless the
conditional probe clause below triggers).

## Background (archive, not new claims)

sim-sortie-b (evidence/2026-11-03/sim-sortie-b.md, compare
sortie-compare-b.md, per-seed JSONs evidence/2026-11-03/perseed-sortie-a/)
was KILLED: answered-offers delta 0 (seeds with >=1 wave-4 fought 5/8
both arms), sortie-attempt-day deaths 27 vs bar <= 2. Its sense-test
named two mechanism questions the 0316Z tracker entry says must be
settled before any sortie retry:

- Q1: 51% of answered offers (24/47) hit an empty treeline ('none'):
  stale queued offers, never invalidated.
- Q2: the engine picks the sortie target, not the offered name (a
  wave-4 "Reunion" offer fought the wave-3 Callback on 98402).

Canon read first: docs/CANON.md. docs/MONSTER-WAVES.md was read and
contains NO lingerer-sortie section — the sortie mechanism's own
source is the code header in src/js/havenGrowth.js (design call #8,
2026-10-16: "Endure it" default vs costly played sortie) plus the
beats-panel row in src/js/app.js. No canon is invented here.

## Verdict classes (per question; a retry is ready ONLY if BOTH are YES)

- SETTLED-YES: the rule (Q1) or hook (Q2) exists policy-side, is
  perception-law-legal, and is proven (corpus replay test green, or
  pilot probe green if the probe clause triggers).
- SETTLED-NO: exactly what state or hook is missing, grounded in code
  (file + function + branch), so a later arm knows what to build.
- OPEN: what evidence would settle it, and why this arm could not get it.

Diagnostic verdicts are NOT GO/KILL bars: there is no game change to
pass or fail here. A SETTLED-NO is a successful diagnostic outcome,
not a failed arm.

## Q1 — stale-offer invalidation

Question: can a policy-side layer detect and skip/refresh a stale
offer using ONLY perception-law-legal inputs — announced offers
(spoken gorge lines), deed feed (own wavesFaced), revealed map, own
party state — with NO roster/position API, NO list-fed decision, and
NO reading monster positions from engine internals?

Pre-registered candidate rule (reactive global invalidation):
- The engine keeps NO offer objects: a "queued offer" is purely the
  policy's own record of a spoken gorge line. The only engine state
  behind it is the monster entity's lingering flag / lingerSince /
  hp, which policy may NOT read (worldMonsters() /
  lingeringRaiders() are roster/position channels).
- On a verb return of 'none' (lingererSortie found zero lingerers),
  invalidate every offer recorded BEFORE that return. A fresh gorge
  line recorded AFTER the return is a fresh offer and may be answered.
- 'no-fighters' does NOT invalidate: the treeline is occupied, only
  the bench is bare.
- Per-name refinement (moved-on line: "paces the treeline one last
  night, then melts back into the dark" names the same display-name
  string as the gorge line, both via monsterDisplayName): an offer
  for that spoken name recorded before the moved-on line is dead.
  This refinement is code-grounded; the corpus replay cannot prove
  it (say transcripts lived in /tmp and are gone), so it is reported
  as a rule shape, NOT as a corpus-proven count.
- Proactive age expiry (drop offers older than N nights) is NOT
  pre-registered as a rule: an old offer answered while NEW lingerers
  gorge still fights a live target, so age alone does not prove
  staleness. It is examined and rejected in the evidence file.

Proof: scripts/sortiev2-replay.js replays the rule over the ARCHIVE
per-seed JSONs (offers + attempts, seeds 98401-98408 variant arm).
Settling condition for SETTLED-YES: the replay suppresses ONLY
'none' attempts (zero ok / no-fighters attempts suppressed) and
reduces 'none' attempts to at most one per empty stretch (the first
'none' that proves the emptiness). If the replay suppresses ANY ok
or no-fighters attempt, Q1 is NOT settled-YES by this rule: report
SETTLED-NO (for this rule) or OPEN with the counterexample.

## Q2 — target agreement

Question: can policy make the sortie target follow the offered name?

Exhaustive search checklist (all must be examined and cited):
1. Every caller of Game.answerLingerer repo-wide; its signature and
   parameters (src/js/havenGrowth.js answerLingerer).
2. lingererSortie: loop order, parameters, and how each fight target
   is chosen (src/js/havenGrowth.js).
3. Harness policy hooks (scripts/sim-harness.js): setup, upkeep,
   daily, fight, contest, pending — which of these can observe or
   steer a lingerer sortie, and why each fails or succeeds.
4. fieldFight (src/js/fieldFights.js): synchronous or driven, any
   policy callback on target selection.
5. Beats panel (src/js/app.js, DOM-only, not loaded in node): what
   the phone button carries (id? name? nothing?).
6. Examined-and-excluded (NOT options, recorded so nobody re-tries
   them): mutating/reordering worldMonsters(), reading
   lingeringRaiders() to pick a moment, reverse-mapping a spoken
   display name to a monster id through data tables. Each fails
   either the perception law, or (decisively) the missing-parameter
   fact: there is no target parameter to pass an id TO.

Settling condition for SETTLED-YES: a named policy-side hook that
steers the fought monster to the offered name, proven by test or
probe. Otherwise SETTLED-NO, naming the exact function/branch and
the shape of the game-code fix WITHOUT landing it (a game-code fix
is a separate later arm with its own prereg, not this one).

## Method, in order

1. Archive-reads: sim-sortie-b.md, sortie-compare-b.md, per-seed
   JSONs. No judged sortie-b sim is re-run to re-prove the kill.
2. Code grounding in src/js for both questions (above).
3. Corpus replay + proof test (scripts/test-sortiev2-a.js, must be
   green before the evidence commit).
4. Fresh probe sims ONLY if the conditional clause below triggers.

CONDITIONAL PROBE CLAUSE: a pilot probe (max 8 seeds, 180d
death-aware cap at most, closecommit baseline stack, same env flags
as sortie-b — FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1 HERALD=1, mode herald, copied from
scripts/sortie-prereg-20261103.md, no invented stack) is REQUIRED
before settling if EITHER: (a) the replay suppresses an ok /
no-fighters attempt (Q1 rule unsafe), or (b) the hook search finds
an unexamined candidate hook for Q2. If neither triggers, archive +
code settles both questions and NO fresh sim runs. Any probe driver
built gets its own proof test green before commit.

## Deliverables

- This prereg (committed first).
- scripts/sortiev2-replay.js (archive replay instrument) +
  scripts/test-sortiev2-a.js (proof test, green before commit).
- evidence/2026-11-03/sim-sortiev2-a.md: per-question verdicts,
  grounded code paths, wall numbers ONLY if probes ran (archive
  numbers labeled archive, never new wall movement), next-blank
  recommendation (retry-ready / retry-blocked-on-X /
  needs-game-code-arm), and a metric-review section.

## Metric review (pre-declared)

Diagnostic verdicts are not GO/KILL bars — say so plainly in the
evidence file, and state what a future retry arm must pre-register:
(a) a stale-offer rule (the Q1 rule, if settled YES) with its own
flood metric (e.g. 'none' share of attempts, and a cost bar defined
on fighter-attributed deaths — cause 'sortie combat' — not the
day-join, per sim-sortie-b metric review §1); (b) a target-agreement
metric (sortie fights by FOUGHT monster from the deed/kill record,
never by offered name); (c) offer-availability pre-screening or
judging on offer-receiving seeds only, since zero-offer seeds cannot
move (sim-sortie-b metric review §2).
