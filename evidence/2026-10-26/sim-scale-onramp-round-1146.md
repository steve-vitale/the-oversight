# sim-scale-onramp-round-1146 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T1146Z (loop A). Lock + claim held throughout, both
deleted at closeout. Loop B live for the whole run (1130Z claim,
sim-reminder-b + sim-noelig-lean-b on food-economy) — NOT touched; its
reminder arm landed mid-run as 9465c8d4e and the ship loop bumped versions
as 2a0d3d686, both handled by clean rebases, never by touching B's work.
The playtest loop (journey-scale, live) was NOT touched.

Standing posture at run start: scale-onramp converging, NOT converged.
This run took the 1040Z run's named next blanks in order: (1) the
choice-price gap, (2) the wave-3 bar as second blocker on 73903/73904.
Both are DIAG-only arms (zero src/js, zero default flips).

## Pre-registration (coordinator level, binding)

- Axis: scale-onramp. Shared substrate per arm: the hunttable band
  (seeds 73901–73908, anchor vs driveoff-clean hunt columns); each arm
  recorded its own substrate digests in its header.
- Each arm carried its own pre-registered DIAG bar (quoted in the arm
  evidence); no bar was lowered or re-scored mid-run, and no prior corpus
  was re-judged.
- Guardrails diagnostic only: starvation, median, national-ever, wins.
- Balanced panel: scripts/balance-panel.js cannot ingest per-seed
  recorder corpora (known limitation, carried) — no panel inputs were
  fabricated; the sweep-compare tables are the comparison of record.
- Telemetry-check was run on both merged corpora (see below); the
  baseline was NOT rolled.

## Arm 1 — sim-choiceprice-a: DIAG-GO (commit 4de78ed1b, proof 179/0 post-rebase and on merged master)

Question (backlog: CHOICE-PRICE GAP): driving off a feast draw silently
forfeits feastSurgeUsed, the deed the lesser seat prices, and nothing in
the game names that deed as the price.

- One column on the band 73901–73908, 180d death-aware horizon,
  driveoff-clean shape exactly as hunttable's hunt column, plus a new
  choiceprice recorder (pure reads + wrappers that record AROUND, never
  instead of, the original calls). No existing policy, sweep, summary, or
  check file edited or imported.
- Verdict: DIAG-GO. All three legs met: (i) forfeiture event with day +
  quoted choice text on 4/5 collapsed seeds (73903, 73904, 73907, 73908;
  threshold >= 4) — met exactly, not with room to spare; (ii) surface
  inventory covers 8 surfaces (>= 6) with verbatim quotes or explicit
  absence; (iii) recorder-neutrality det-gate PASSES on pilot seed 73901
  (plain vs wrapped identical: 29/29 days, 11/11 deaths, won 0/0).
- The gap, in one sentence: 34 feast draws offered, all 34 driven off, 31
  completed forfeitures (deed false before and after, never rescued inside
  the buff's window), and in 8/8 villages no captured line — on any
  surface — ever names the surge deed as the price of the draw choice.
  The only surface that names the deed category at all is the day-90
  table flicker, which says "the food-thesis deeds" and never the act
  that earns them.
- The fifth collapsed seed, 73906, carries NO forfeiture because on this
  base it is never offered the choice at all (zero grant calls). That is
  a finding, not a miss: the gap is moot where no choice is presented.
  Future arms must re-derive collapsed seeds on their own base, not copy
  the 73903–73908 set blindly.
- Wall (hunt column): wave-4 5/8, wave-5 0/8, Arc IV 1/8, deaths 240,
  starvation 5.
- No design call is made here: whether the fix is voicing the price at
  the choice, counting a driven-off draw, or making another in-window
  fight reliably spend the surge is Steve's call. This arm supplies the
  evidence for it (appended as a steve-call finding).
- Sense (73906 window + forfeiture quotes): a village that feasts, is
  offered a draw, turns it away in words that sound costless, and never
  hears what the refusal cost. The silence is total, not partial.
- Evidence: evidence/2026-10-26/sim-choiceprice-a.md +
  perseed-sim-choiceprice-a/ (8 rows + det-gates + summary),
  scripts/policies/choiceprice-diag.js, scripts/test-choiceprice-sweep.js,
  scripts/test-choiceprice-a.js. Zero src/js diff.

## Arm 2 — sim-wave3bar-a: DIAG-NO-GO (commits bfc9112f8 + 9540264b2, proof 20/4 post-rebase and on merged master — the 4 failures ARE the NO-GO legs)

Question (backlog: WAVE-3 BAR AS SECOND BLOCKER ON 73903/73904): on 2/5
collapsed seeds the wave-3 bar blocks the seat independently of the
feast-surge deed; fixing the surge alone does not seat those villages.

- Two columns on the band 73901–73908 (anchor + hunt, 16 rows), 180d
  death-aware horizon, plus a new wave-3 recorder. No existing file
  edited or imported.
- The bar, quoted from code (src/js/table.js `tableSeat()`): w3 >= 3,
  where w3 = the count of DISTINCT monster ids in `deeds.wavesFaced`
  whose stored wave is 3. Facing counts; killing does NOT matter. The
  feed is src/js/progression.js `recordDeedFight()` (startCombat,
  recordWaveKill, fieldFight vKill/mFlee/vFlee; 'evade' and 'vDie' record
  nothing). The wave-3 roster is 9 types (redactor, gavel, focus_group,
  spool, chorus_line, terms_of_service, callback, buffering, ad_break);
  any 3 faced blow-by-blow meet the bar. Canon agrees (docs/TABLE.md,
  docs/MONSTER-WAVES.md).
- Verdict: DIAG-NO-GO, with the failing legs named, not reinterpreted
  away. The measurement itself is complete and clean; the NO-GO is about
  the bar as written on the current base:
  - Leg (iii) FAILS on 73904: on the current base, hunt 73904 MEETS the
    wave-3 bar (final w3 = 4 of 3, bar day 82, the same four monsters on
    the same days as the anchor). There is no wave-3 block on 73904 to
    prove independent — the seat is blocked there by the surge alone.
    Independence is shown explicitly on 73903 only.
  - Leg (iv) SPLIT: the operative clause PASSES — both det-gates MATCH
    exactly (plain vs wrapped, 29/29 days, 11/11 deaths, on both
    columns). But the parenthetical's cross-base check does NOT
    reproduce the hunttable anchor row on 73901: this base gives 29 days
    / 11 deaths where hunttable's base gave 23 days / 8 deaths. The
    drift is proven instrument-independent: hunttable's OWN det-gate,
    run on this HEAD, also gives 29/11. Cause class identified: the only
    src/js changes between hunttable's base (be8541647) and this HEAD
    are conversation.js (the social-r55 main-menu 'others' exemption)
    and corpses.js (the journey-deepening r51 falsy-0 range fix) —
    small behavior changes that shift trajectories. The drift is a
    property of the base, not of this arm's instrument.
  - The 73905 control case FLIPPED on the current base: anchor 73905 now
    SEATS (day 171, w3 bar day 171, surge day 27) — it no longer
    demonstrates surge-met / w3-missing / seat-none. No row in the band
    has surge met + w3 missing + seat none on this base.
- Wall: anchor won 6/8, median 138d, natEver 7/8, national-final 6/8,
  table 6/8, entered 6/8, Arc IV 6/8, wave-4 4/8, wave-5 0/8, deaths 223,
  starvation 5; hunt won 1/8, median 180d, natEver 7/8, national-final
  5/8, table 1/8, entered 1/8, Arc IV 1/8, wave-4 5/8, wave-5 0/8, deaths
  240, starvation 5. The hunt column's ONLY winner is 73905 — the
  flipped control.
- The coordinator's next run must re-derive its collapsed seeds and its
  control case on its own base before fixing seed numbers into a bar
  (see Metric review). Do NOT re-judge this corpus, and do NOT cite
  "the wave-3 bar blocks 73903/73904" without the base qualifier — on
  the current base it blocks 73903 only.
- Sense: the stall reads as an earned wall on 73903 (three distinct
  wave-3 faces is a legible hunt), but the ground moved under the
  measurement on 73904/73905 — the same seeds, a newer base, a different
  wall.
- Evidence: evidence/2026-10-26/sim-wave3bar-a.md +
  perseed-sim-wave3bar-a/ (16 rows + det-gates),
  scripts/policies/wave3bar-diag.js, scripts/test-wave3bar-sweep.js,
  scripts/test-wave3bar-a.js. Zero src/js diff.

## Wall numbers (judge future arms against wave3bar's two columns)

- National-ever 7/8 (both columns), national-final 6/8 anchor / 5/8
  hunt, table 6/8 / 1/8, entered 6/8 / 1/8, wins 6/8 / 1/8 (lesser only),
  wave-4 4/8 / 5/8, wave-5 0/8, full seat 0/8, Arc IV 6/8 / 1/8, median
  138d / 180d, deaths 223 / 240, starvation 5 / 5.
- In plain words: villages still reach national reliably and win through
  the lesser seat when they face their draws — but the price of refusing
  a draw is nowhere in the game, and the second wall behind it (three
  distinct wave-3 faces) is real on one seed and gone on another, because
  the base itself moved. The full seat is still unreached everywhere,
  and wave 5 still has zero births.

## Village assessment (plain words)

This run's villages looked like people, not counters: they feasted, were
offered draws, turned them away in words that sounded free, and never
heard what the refusal cost. What they did NOT look like is informed —
a village can do everything right at the national scale and still lose
the table without ever being told it missed anything. And the measurement
itself learned something: seed-numbered claims rot fast. The "second
blocker on two seeds" from yesterday is a "second blocker on one seed"
today, not because anyone changed the game on purpose, but because two
small behavior fixes (a menu exemption, a range fix) shifted whole
trajectories. The next run must re-derive, not inherit.

## Blanks filled or documented

- FILLED (measured): the choice-price gap — 34 draws, 31 completed
  forfeitures, 0/8 price-naming encounters, 8 surfaces inventoried.
  The design call is now Steve's (appended finding).
- FILLED (defined) + CORRECTED: the wave-3 bar — exact definition from
  code, 9-type roster, facing-counts rule; 73903 independence proven;
  the 73904 blocker claim and the 73905 control both flipped by base
  drift and are corrected here, not carried forward.
- DOCUMENTED (bookkeeping, not re-run): the refresh-quality and
  devotion-gate backlog lines still read [open] although
  sim-qualityrefresh-a and sim-devotiongate-a landed DIAG-GO on master
  (verdict lines verified this run); the 0340Z pending-arms note is
  likewise stale. Recorded here and in the findings append, not
  re-measured.

## Metric review (binding for the NEXT run, not a re-score)

- Bars held as written; no re-scoring was done. Wave3bar's NO-GO is a
  bar failure, not a measurement failure — the proof test encodes the
  bar, so its 20/4 split IS the verdict output.
- Seed-numbered controls are base-fragile: the next run must pre-register
  controls derived on its OWN base (re-derive collapsed seeds and control
  cases from a fresh anchor sweep), never copied seed numbers from a
  prior run's evidence. A cross-base parenthetical (like wave3bar leg
  iv's) must be written as a drift detector with a stated fallback, not
  as a pass/fail leg that a base move can trip.
- Choiceprice leg (i) was met exactly (4/5); 73906 must not be assumed a
  collapsed seed on a new base without re-derivation (it had zero grant
  calls here).

## Telemetry deviation check (both merged corpora; baseline NOT rolled)

- Choiceprice corpus (11 files): 3 LOUD lines — national 12 -> 0, table
  16 -> 1, wins 16 -> 0.
- Wave3bar corpus (21 files): 2 LOUD lines — national 12 -> 0, wins
  16 -> 0.
- Verdict: all LOUD lines are the KNOWN ingestion-shape artifact class
  (recorder rows carry nationalEver/won, not top-level national/wins;
  choiceprice's table 1 is its hunt column's single seated seed, not a
  collapse). Actuals are the arm-evidence wall numbers above. Baseline
  NOT rolled; no new investigation. Do not roll a baseline on recorder
  corpora.

## Infrastructure

- Master moved twice under the run from sibling lanes (loop B reminder-b
  landing 9465c8d4e + ship-loop version bump 2a0d3d686). The first
  ff-only merge correctly refused; both branches rebased clean in their
  own worktrees, proofs green after every rebase and on merged master
  (choiceprice 179/0; wave3bar 20/4 = the NO-GO legs, unchanged by
  rebase/merge). Zero file overlap between the arms.
- No EPERM flap this run. No safe-commit index clobber observed on the
  worker commits or (verified after commit) the coordinator commit.
- check.js --quick NOT re-run: zero src/js landed; both proofs green on
  merged master; the standing 279/8 profile was last re-attributed by
  loop B's 1035Z run and no game code moved in this run except the
  sibling reminder-b default (already shipped by the ship loop).
- Loop B's claim + lock were still live at this run's closeout
  (noelig-lean-b pending) — left untouched.

## Next blanks, in order

1. Steve's ruling on the choice-price gap (voice the price at the
   choice, count a driven-off draw, or make another in-window fight
   reliably spend the surge).
2. Wound-closure pricing paper, then Steve's ruling on met-below-line
   finishing (defender-finish stays KILLED).
3. Melt ruling for Steve.
4. Defender-fight narration boilerplate + wait-line repetition (sense
   arms).
5. A future transient hunt needs more seeds or a first-night stressor.
6. Wave-3 bar re-derivation on the next run's base (collapsed seeds +
   control re-derived, never copied).

scale-onramp stays converging (NOT converged): the gap is measured but
unruled, the wave-3 blocker is now 1-seed on current base, the full seat
is still unreached, and wave 5 still has zero births. The directive stands
until the tracker records this axis converged on measured evidence.
food-economy stays converging (untouched; sibling loop B). Rotation left
at 3 (convergence work does not cycle it). Claim deleted; lock deleted.
Evidence: evidence/2026-10-26/sim-scale-onramp-round-1146.md (coordinator
this file) + sim-choiceprice-a.md + perseed-sim-choiceprice-a/
(4de78ed1b) + sim-wave3bar-a.md + perseed-sim-wave3bar-a/ (bfc9112f8 +
9540264b2). Merged locally, pending ship.
