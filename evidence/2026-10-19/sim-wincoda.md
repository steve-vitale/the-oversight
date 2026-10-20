# sim-wincoda — win coda per path (2026-10-19, oversight-flesh-out-loop)

run_id: fleshout-loop-20261019T0031Z (sim-wincoda worktree)
Blank: win coda at src/js/table.js:1263 identical verbatim across all five
walked paths (sim-tablepaths 2026-10-19, findings backlog: verbatim
repetition, theater class).

## PRE-REGISTRATION (binding — docs/MEASUREMENT.md §14, written before any sims)

- PRIMARY: proof test fires the coda through the REAL table state machine
  (Game.tableEpilogue → this.tableState().path, no stubs) for each walked
  path. RED pre-fix: identical strings across all paths → the "codas differ"
  assertion FAILS. GREEN post-fix: distinct codas per path, each with
  path-specific imagery, no sentence shared between any two. Miss = NO-GO.
- GUARDRAIL (det-gate): 16 seeds × 7 paths = 112 transcripts armed vs
  control on identical seeds — byte-identical EXCEPT exactly the coda line.
  A text-only change must not move the RNG stream.
- Horizon/seeds: 8-seed screening for the coda proof (name/pronoun roster
  RNG across seeds); 16 seeds for the det-gate. No policies, no balance —
  this run changes no mechanics, so no before/after panel is applicable.

## Method

1. Read docs/CANON.md, then docs/TABLE.md (path identities: feared =
   protective terror / terror broadcast; indispensable = contract drafting,
   treaty signing, "name your price"; beloved = variety finale, the audience;
   witness = the trial, the ledger; assimilated = placement haggling, going
   inside, Trojan horse; defiant = reverse auction, priced freedom, "saying
   no twice", the walk-away long shot; relay = enter the matrix, the System
   learns your name first).
2. Wrote scripts/test-wincoda-20261019.js, ran it PRE-FIX (RED).
3. Dumped 112 control transcripts (WINCODA_DUMP=1) pre-fix.
4. Edited ONLY the coda lines in src/js/table.js (one site, ~1263).
5. Ran the proof GREEN; dumped 112 armed transcripts; byte-compared.

## RED (pre-fix) — the bug, through the real state machine

72 passed, 1 failed. The single failure: "GREEN: codas differ per path" —
all seven paths produced byte-identical:
"◈ {name} walks out of the light alone, which is how {pro} walked in.
The village endures. That was always the story."
Verified via Game.tableEpilogue reading this.tableState().path on 8 fresh
newRun() games — name/pronoun interpolate, nothing else changes. Confirmed
theater class.

## Reachability honesty — witness and indispensable

Checked the coda site's callers: tableEpilogue(def, branch, fin) is called
from the shared final-resolution site (table.js ~929), THE HOSTS (~1011),
and the pod-demand price (~1041). The site is path-agnostic — it fires for
ALL SEVEN paths whenever the finale resolves with no villager ascensions
and no facilitation. Witness and indispensable CAN reach it (indispensable
requires a full seat; once it resolves, the shared epilogue runs). So all
seven get codas. Unknown/blank path → the original line verbatim (fallback).

## GREEN (post-fix)

81 passed, 0 failed: seven distinct codas; each carries its path's
identity; no sentence shared between any two; unknown path falls back
verbatim; one coda shape per path across 8 seeds (only name/pronoun vary).

### The seven codas — read aloud (SENSE-TESTING LAW)

1. FEARED: "◈ {name} walks out of the light alone, which is how {pro} walked
   in — and the galaxy, which came to watch a monster, leaves afraid of the
   right things. The fear is a shield now, held over a village that trusts
   the hand that holds it."
   — Path fit: protective terror, "the fear is a shield" is TABLE.md's own
   phrase. "Came to watch a monster" — the galaxy as audience, twisted,
   genuinely trying. ✓

2. INDISPENSABLE: "◈ {name} walks out of the light alone, which is how {pro}
   walked in — but the table keeps the contract {pro} priced, because the
   galaxy still needs what {pro} taught it. The village endures, and this
   time the table owes the village."
   — Path fit: contract drafting, "name your price", mutual need ("still
   needs what you taught"). The power reversal ("the table owes the
   village") is the path's whole payoff. ✓

3. BELOVED: "◈ {name} walks out of the light alone, which is how {pro} walked
   in — and the audience, which came to be entertained, leaves humming the
   village's name. The village endures, loved and unbeholden, and the lights
   stay warm behind {pro}."
   — Path fit: the variety finale, the audience. "Loved and unbeholden" =
   genuine love, not produced adoration. ✓

4. WITNESS: "◈ {name} walks out of the light alone, which is how {pro} walked
   in — with every charge read aloud and answered, the ledger closed and
   clean. The village endures, and the record stands: what was hidden is
   hidden no more."
   — Path fit: the trial, the ledger, charges. ✓

5. ASSIMILATED: "◈ {name} does not walk out of the light — {pro} went inside
   carrying the truth, and the light, unsteadily, has begun to carry it back.
   The village endures, with a Trojan horse in the walls of heaven."
   — Path fit: the Trojan horse (light branch), the intake scan reversed.
   "The light, unsteadily" — the System genuinely trying, slightly wrong. ✓

6. DEFIANT: "◈ {name} walks out of the light alone, which is how {pro} walked
   in — and keeps walking, because {pro} paid every price and said no twice.
   The village endures, poorer, unowned, free: the long shot of small
   figures leaving the light is the highest-rated thing the galaxy ever saw."
   — Path fit: "said no twice" is TABLE.md's own line for the final choice;
   the walk-away long shot / highest-rated footage is the canon show. ✓

7. RELAY: "◈ {name} walks out of the light accompanied — the System learned
   {pro} name first, and it keeps saying it inside the wire while {pro} goes
   home. The village endures, with a friend in the machine, and the
   conversation does not end."
   — Path fit: "it learns your name first" is the canon relay final; "a
   friend in the machine" = humanize-the-System. Limitation noted below. ✓

## DET-GATE (guardrail)

112/112 seed×path pairs byte-identical armed vs control EXCEPT exactly the
coda line (line-count, order, and every non-coda line identical; the only
differences match the coda site). Zero RNG draws added (text map literal);
the RNG stream cannot move. Control: det-control-wincoda.json;
armed: det-armed-wincoda.json (this dir).

## METRIC REVIEW (§14)

- The primary is a code-quality/voice metric, not a balance metric — it
  cannot be gamed by re-scoring, and no friendlier metric was substituted.
- Known limitation (not a miss): the relay coda is branch-agnostic. The dark
  relay final ("become its voice — you stay inside, forever") would read
  more honestly with a branch-specific line ("{name} does not walk out").
  The task briefed path-level branching only; a T.branch fork for relay is
  filed as follow-up content work, not done here.
- The coda fires only when no villager ascended and no facilitation
  happened. When ascensions exist, the ARCHITECT/OUTSHONE/PANTHEON beats
  carry the path-specific epilogue — untouched and still path-aware.

## Verdict

GO. Primary green (81/81), guardrail green (112/112), zero game-code
changes outside the coda lines, [needs-eyes] flagged for Steve's phone
(player-facing finale voice).

## Findings backlog check

The win-coda repetition was itself a backlog item — now fixed. No new
backlog items surfaced (the relay branch-coda follow-up is recorded above
as metric review, not a new backlog claim).
