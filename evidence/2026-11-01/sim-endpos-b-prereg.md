# sim-endpos-b — PRE-REGISTRATION (binding, committed BEFORE any judged census)

Run: oversight-flesh-out-loop-b, arm sim-endpos-b, run
fleshout-loop-b-20261101T0730Z, axis food-economy (daytime
end-position distribution). Worktree sim-endpos-b, branch
sim-endpos-b. Base: worktree HEAD at prereg writing time
(recorded in the evidence file's Files section; the prereg
commit hash is the base for this arm). DIAG ONLY
(measurement): zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing
script. New files only: this prereg, one new analyzer
(scripts/analyze-endpos-b.js), one proof test
(scripts/test-endpos-b.js), evidence, census, and day
dumps (if run). The offergeo analyzer, absencehunt driver,
creekseek driver, and all other existing scripts are
REUSED VERBATIM (the new analyzer requires
scripts/analyze-offergeo-b.js for manhattan / bandOf /
classifyOffer / departureOf — it does not edit it). This
worker does NOT push, bump, verify live, merge into
master, or touch the sibling Loop A tree/branch, any
journey-* tree/branch, the sim-h56-b tree, or the main
tree; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (one continuous
map; home board 0..8; haven at the village coordinate,
default (4,4); travelTargets offers home tiles revealed
within 3 or adjacent into fog; NO TELEPORT ever; a
villager's RETURN walk may step through beyond
coordinates only because it retraces ground already
stood on). No canon doc covers a daytime end-position
taxonomy — the taxonomy is read off the policy code
itself (scripts/policies/nighttravel.js nightStep,
scripts/policies/insideevening.js eveningStep), as the
prior eveningstep and offergeo arms did, not invented
as canon. Standing rules that bear on it: perception
law (Steve 2026-10-28: every census field is read from
the villager's own evening snap, its own day lines, and
its own following morning — never from a roster or list
feed) and "no silent actions" (the sense test reads
transcripts end to end).

## Prior evidence read before designing anything

- evidence/2026-11-01/sim-offergeo-b.md + prereg
  (DIAG-GO, run 0630Z): haven is offered at Manhattan
  distance <= 3 and never at 4 (47/47 offered at d<=3,
  0/239 at d>=4, over 286 offer-evaluated evenings),
  and 39/47 offered evenings were hop-refused. The
  0630Z closeout's next blank (1) is the question
  below: why do days so rarely end at d<=3?
- evidence/2026-11-01/sim-eveningstep-b.md (DIAG-GO,
  run 0545Z): the evening step's systematic work is
  attempting returns and being told home is unoffered;
  hop-yes-entry-yes = 0 on committed corpora (now
  superseded by offergeo's new-base legs: 6 hops
  entering successfully).

## The question

Where do days END — by distance from haven — on the
committed 30d legs, and for away evenings ending at
d>=4, what does the day's own record show? The offer
table conditions on step-evaluated evenings; this arm
removes that conditioning and counts ALL evenings.

## Definitions (fixed before counting; no re-banding mid-run)

- DISTANCE: Manhattan, exactly as nighttravel.js and
  travelTargets compute it: |mapPx - 4| + |mapPy - 4|.
  Haven is (4,4) (nighttravel default, MAP.md village
  coordinate, coordinate of every haven evening snap;
  the analyzer asserts it — a haven-tile evening snap
  NOT at (4,4) is a surprise, never a silent
  re-centering).
- DAYTIME END POSITION ("endpos"): the villager's map
  position when nightStep starts (after competent.daily,
  and after the creek visit on creekseek). Recovery,
  from the corpus alone, in this order:
  (i) Offer-evaluated evenings (classifyOffer evaluated
  = true): departureOf from the offergeo analyzer,
  verbatim — evening snap for offer-no, woodcarry
  classification.departure for travel-refused (retry
  rescues move the villager after the step), creekseek
  cross-stack pin (morning-gated) or day-line hop
  distance for hop evenings.
  (ii) blocked-combat / blocked-tent evenings: the
  evening snap IS the endpos (the guard fires before
  any travel; the step moves nothing).
  (iii) All other non-evaluated evenings are haven
  evenings by construction (the step delegates to the
  entry leg only when the villager stands on the haven
  tile or is already inside): endpos = haven.
- ENDPOS CLASSES (columns of table (a); haven classes
  are NEVER pooled into a distance band):
  H-IN = endpos haven tile AND inside at the evening
  snap (already-inside, entry-completed evenings);
  H-OUT = endpos haven tile AND NOT inside at the
  evening snap (walk-interrupted-combat,
  blocked-combat on the haven tile, entry-fail-only
  evenings that are not hops);
  A = away endpos, d <= 3; B = away endpos, d = 4-5;
  C = away endpos, d >= 6; UNPINNED = a hop endpos with
  NEITHER a day-line distance NOR a cross-stack record
  (distance unknown — counted separately, never banded).
  A line-derived hop (distance from the day line, tile
  unpinned) IS banded by its line distance, band exact,
  with tile shown as '?' in the histogram — the same
  rule offergeo used. A hop with a cross-stack pin is
  banded by the pin.
  A hop evening's class is its DEPARTURE band, not
  its haven evening snap. A travel-refused evening
  whose retry rescued it to haven is STILL its
  departure band (the day ended away; the rescue is
  the step's work, not the day's end).
- AWAY evenings = classes A + B + C (+ UNPINNED,
  stated separately). "Away evenings ending at d>=4"
  = classes B + C (UNPINNED rows, if any, are listed
  individually and excluded from the mechanism
  denominator, with the exclusion counted).
- DAY BUCKETS: loopDay 1-10 / 11-20 / 21-30.
- MECHANISM TAXONOMY for away d>=4 evenings (one
  class per evening, priority order — first match
  wins; classes are exhaustive, OTHER is counted,
  never hidden):
  1. ROAD: evening roadActive or roadOnRoad true, or
     the day's ctxDelta nomadRoadDays / nomadMoves > 0.
  2. COMBAT: eveningOutcome blocked-combat (live
     combat at step time; the step never offers).
  3. CREEK-BLOCKED: any dayLine of the day matches
     "no crossing without a bridge or a swim" (the
     daytime creek-crossing refusal; the villager
     reached a creek she could not cross).
  4. CAMPED: the previous evening's endpos coords
     equal this evening's endpos coords (she slept
     there last night and ends there again), OR the
     day's morning snap coords equal the endpos
     coords with the morning away from haven (she
     woke there and never net-moved).
  5. OUT-AND-NOT-BACK: the day's morning snap is on
     the haven tile (she started the day at home,
     walked out, and did not return).
  6. AWAY-MOVED: morning away, endpos away, different
     coords from both the morning snap and the
     previous evening's endpos (she moved during an
     away day and still ended far).
  7. OTHER: none of the above (listed individually
     in the census; if OTHER exceeds 20% of d>=4
     away evenings, cause-separation has FAILED —
     see fallback).
  Secondary descriptors (non-exclusive, reported
  alongside, never substituted for the mechanism):
  morning-haven share, morning-same-tile share,
  previous-endpos-same share, forageTrips > 0 share,
  last "Travel N tiles to X" destination distribution,
  wound/rest line share (word-boundary scan for
  wound / injured / rest as a standalone word —
  "restless" does NOT count), road share, inCombat
  share, multi-night away-streak share (evening in
  a run of >= 2 consecutive away evenings).

## Primary metric and GO threshold (judge exactly; never re-score mid-run)

PRIMARY METRIC: the mechanism-class distribution over
away d>=4 evenings (classes B + C), with the
outcome x endpos-class table (a), the departure-tile
histogram (b), and the day-bucket trend (c) as the
supporting tables. GO requires ALL of:

(a) INSTRUMENT GATE CLEAN: every corpus leg errs 0
    (errCount 0 on all legs), evenings counted and
    complete (every leg contributes its evenings; no
    leg dropped silently), 0 surprises, 0
    haven-coordinate violations, and row totals
    reconcile exactly (outcome x class table sums
    to evenings per policy and pooled; class sums =
    evenings; mechanism classes sum to the B + C
    count plus the separately-stated UNPINNED /
    OTHER counts).
(b) TABLES ON >= 2000 evenings across >= 2 stacks
    (expected: 7,178 evenings, 2 stacks — see
    Seeds/stacks).
(c) DOMINANT MECHANISM: one mechanism class with
    share >= 30% of away d>=4 evenings, named with
    its share — OR, if no class reaches 30%, the
    fallback below is invoked and the pooled
    corpora + fresh legs STILL show no class at
    >= 30%, in which case GO is awarded on the
    proven fragmentation statement (top class,
    its share, and why the days fragment across
    classes). If no class reaches 30% and the
    fallback is NOT invoked, the verdict is HELD,
    not GO.
(d) PROOF TEST GREEN: scripts/test-endpos-b.js green
    (band boundaries, departure-recovery cases,
    endpos-class cases, mechanism-classifier cases
    incl. priority order, table-total reconciliation
    on a synthetic corpus) BEFORE any verdict is
    claimed; every census number re-readable from a
    committed corpus file.

## Horizon + why

30d, death-aware, matching the corpora: dead villages
stop simulating (a leg contributes only the evenings
it lived; no fixed 200d, no padding to 30). The
corpora are pre-seat 30d legs; wave/Arc/table
reachability is NOT re-measured here (offerygeo and
awayeve numbers stand).

## Seeds / stacks

Committed corpora, reused verbatim (no fresh legs
unless the fallback fires):
- committed (awayeve, base 6409c1312): 24 seeds
  17543-17566, nighttravel-stack + creekseek-stack,
  1,428 evenings, dirs sim-awayeve-b-corpus-pilot-*
  + -confirm-* (P1 + creekseek).
- newbase-1 (offergeo, this base): 48 seeds
  17567-17614, both stacks, 2,878 evenings.
- newbase-2 (offergeo, this base): 48 seeds
  17615-17662, both stacks, 2,872 evenings.
- POOLED: 120 seeds x 2 stacks, 7,178 evenings
  expected (counted by the analyzer; any shortfall
  is reported, not patched).

## Fallback (prereg-authorized, offergeo new-base pattern)

If the corpora cannot separate daytime cause — i.e.
OTHER exceeds 20% of d>=4 away evenings, or dayLines
are missing for > 5% of d>=4 away evenings — run
fresh 30d legs on seeds verified UNUSED by grepping
evidence/ for the seed numbers first (suggest the
17801+ range, but verify — never reuse a spent
seed). Reuse an existing driver verbatim; do not
invent a new harness. Fresh legs are also the
invoked fallback in the no-dominant-mechanism
branch of bar (c).

## §15 panel (non-applicability declaration)

No lever change is panel-compared here, so no
balanced-panel comparison applies — stated
explicitly, as sim-eveningstep-b did. The comparison
here is matched seed-day tables across the two
stacks on identical seeds through the new endpos
analyzer (per-stack tables in the evidence), never
labeled a panel comparison. No panel result is
fabricated; the panel tool is not invoked on this
corpus.

## Sense test (law)

Read dayLines for a sample of far-ending days
(classes B/C) and near-ending days (class A /
hop evenings) via the offergeo --days dump mode
(reused verbatim); report whether the scholar's day
reads as a person making choices or as drift, and
quote the lines that decide it.

## Metric review (filled in the evidence file, never by rewriting this prereg)

Pre-registered metrics bind this run (MEASUREMENT.md
§14). A miss is NO-GO (or HELD per bar (c)), never
re-scored against a friendlier metric mid-run.
Metric doubts go in the evidence file's metric
review section for the NEXT run.
