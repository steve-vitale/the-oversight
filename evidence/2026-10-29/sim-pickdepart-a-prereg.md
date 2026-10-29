# sim-pickdepart-a — PREREGISTRATION (binding, committed BEFORE any new judged analysis)

Run: flesh-out loop, run fleshout-20261029T0315Z (adoption run).
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-pickdepart-a.
Assignment: PICK-TO-DEPARTURE decomposition, ranked next blank from
sim-lottery-a. DIAGNOSIS ONLY — zero src/js, zero game-behavior
changes, zero default flips, zero policy changes. This arm
decomposes wave-4 HUNT picks that never departed; it builds no
lever and lands no lever.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 bands
850-1500 HP, damage 35-95) and, before any design claim, the
prior evidence in this worktree: evidence/2026-10-29/
sim-lottery-a.md (+ sim-lottery-a-prereg.md),
sim-returns-a.md, sim-funnel-a.md. No CANON-registered doc
covers departure gates, the daily pick lottery, travel-to-
known-monsters, or field-fight returns — the lottery prereg
already states this gap for pick lottery / returns, and it
stands for departure gates too: the mechanism below is derived
from code, verified by reading src/js/villager-objectives.js
(objPick, objHuntCandidate, objHuntFromSite, objMaybeDepart,
objDepart, objDanger, objHealGate) before this prereg was
written. Nothing here is invented canon. docs/MAP.md covers
the map/travel surface generally, not the pick-to-departure
gates; it is not cited as covering them.

## Mechanism as verified from code (pre-analysis, to be confirmed by grep in the evidence)

- A wave-4 HUNT pick is an objPick outcome: chosen.kind ==
  HUNT, chosen.huntMid == the beast's mid, state 'ready'.
  Picking is not departing: objMaybeDepart later departs the
  'ready' objective through objDanger (go / ask / tighten /
  defer verdicts) and objHealGate, and a later objPick can
  replace the objective before any departure fires (same-day
  supersession, lottery evidence: visjoin_113 d135).
- objHuntCandidate gates the OFFER (fresh age 0-3 days, armed,
  1 <= Chebyshev distance <= npcMaxDist, not sheltering, not
  post-flee resting; homebodies maxD 0 never offered). A
  candidate recorded as null on a later pick, while the
  memory is still listed in preSightings, means the offer
  gate closed after the pick — the memory list is not the
  offer. Which gate closed (age, range, resting, armed,
  sheltered) is read from the later pick's gates record
  plus the memory age at that pick, not assumed.
- The returns recorder joins departures to picks by part
  (dep.part >= pick.part); this prereg tightens that join
  for pick linkage: a departure is pick-linked to a HUNT
  pick only if same vid, same huntMid, dep.part >=
  pick.part, AND no intervening pick by the same villager
  with part strictly between pick.part and dep.part.
  (An intervening pick means the objective was replaced
  before the departure; the departure, if any, belongs
  to the intervening pick, not the earlier one.)

## Corpora (existing, read-only — NO new sims unless §"Re-run rule" triggers)

- Baseline: evidence/2026-10-29/perseed-lottery-base/
  (seeds 75101-75108, fresh base-code sweep).
- Arm: evidence/2026-10-29/perseed-lottery-arm/
  (seeds 75101-75108, lottery-lever code; used ONLY as a
  second decomposition population, never as a lever
  judgment — the lever is already killed).
- Substrate (identical to lottery, both corpora):
  scripts/policies/tableseat-nowait.js, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, RETURNS=1, FUNNEL=1,
  180d death-aware, competent policy tableseat-nowait.
- Wave lookup: huntMid -> wave from src/data/monsters.json
  (wave field). A HUNT pick counts as wave-4 iff its
  huntMid's wave == 4. Picks whose huntMid is absent from
  monsters.json are reported as unknown-wave, not silently
  dropped.
- Funnel/lottery survivor triples are reused ONLY as
  context (baseline 10 triples, arm 3 triples, per the
  lottery evidence). The primary universe below is pick-
  level, not triple-level, so triple-window artifacts
  (one pick counted in two triples for a two-triple
  villager) cannot inflate it.

## Primary universe and taxonomy (binding)

PRIMARY UNIVERSE: every pick record in EITHER pilot corpus
whose chosen.kind == 'HUNT' and whose chosen.huntMid maps
to a wave-4 monster. Each such pick gets EXACTLY ONE class,
by the first rule that fires in this priority order
(all comparisons within the same seed row, same vid,
ordered by part):

1. departed-pick-linked — a returns departure exists with
   same vid, same huntMid, dep.part >= pick.part, and no
   intervening pick by that vid with part strictly between
   pick.part and dep.part.
2. died-before-departure — the row's deathsList records
   that villager's death, and no later pick by that vid
   and no linked departure exists before it. DAY-
   GRANULARITY CAVEAT: deaths carry day, not part, so a
   death on the pick's own day is flagged SAME-DAY and
   the class rests on "no later pick record exists"
   (the funnel recorder captures every pick a
   memory-holder makes), exactly as funnel's
   DIED-BEFORE-PICK did.
3. superseded-by-needs-pick — the first later pick by that
   vid (any part > pick.part, before any linked
   departure) has chosen.kind in {EAT, WATER}.
4. candidate-null-after-pick — the first later pick by
   that vid (before any linked departure, not a needs
   pick) shows candidate null for this memory
   (candidate == null, or candidate.mid != this mid),
   while the memory is still listed in that pick's
   preSightings (or was listed on the HUNT pick itself).
   This is the nikos d174+ pattern: the offer gate closed
   after the pick; the later pick did not out-choose a
   live offer, it picked in a world where the hunt was
   no longer offered.
5. superseded-by-re-pick — the first later pick by that
   vid (before any linked departure, not a needs pick)
   still shows candidate.mid == this mid and chose
   anything else (including a same-mid HUNT re-pick,
   per the lottery evidence's treatment of d172 -> d173,
   or a different-mid HUNT).
6. gate-blocked — no later pick, no linked departure, the
   villager is alive at corpus end, AND the HUNT pick's
   own gates record shows a blocking flag
   (postFleeResting true, sheltered true, armed false,
   or maxD < distance to the hunt tile). I.e. the pick
   was recorded while a departure-side gate was already
   closed; the analyzer names the flag.
7. horizon — no later pick, no linked departure, villager
   alive at corpus end, gates green at pick time: the
   run ended (180d cap or death-aware stop) while the
   pick was still unresolved, or the villager made no
   further pick in the corpus for any reason the records
   do not name. Horizon is a censoring class, not a
   mechanism claim.
8. unknown — anything not covered above. At most 1 pick
   across BOTH corpora may land here (see DIAG-GO).

The nikos trace (arm seed 75104) is classified pick by
pick under these rules, and the evidence explains the
d174+ candidate=null rows from the code: which gate
closed, read from the later picks' gates records and the
memory age at each pick (age = pick day - memory day;
offer window age 0-3). The evidence also explains why
WATER departures fired (d174-d177) while the HUNT
departure never did: a WATER pick is a new objective
that objMaybeDepart departs on its own terms; the HUNT
objective had already been replaced before its departure
gate ever fired for it — or, if the records show
otherwise, the evidence says so and the class above is
corrected in the metric-review section, not silently.

SECONDARY CENSUS (reported, not judged): the same taxonomy
applied to ALL HUNT picks (all waves) in both corpora, to
show whether wave-4 pick-to-departure differs from HUNT
pick-to-departure in general; and the triple-level context
(lottery's 10 baseline / 3 arm triples) restated without
re-judgment.

## Pre-registered DIAG-GO threshold (binding — a miss is DIAG-NO-GO)

PRIMARY METRIC: decomposition completeness over the primary
universe (both corpora pooled for the completeness bar, and
reported per corpus). DIAG-GO iff ALL of:
  (1) 100% of wave-4 HUNT picks in the primary universe are
      classified into a named mechanism (classes 1-7),
      with no more than 1 pick left 'unknown' across both
      corpora;
  (2) at least one dominant mechanism is quantified as a
      share (its count / primary-universe total, per
      corpus and pooled) — i.e. the decomposition names
      what MOSTLY happens, not just a list;
  (3) the nikos d174+ candidate-null rows are explained
      from a named gate (age / range / resting / armed /
      sheltered), read from the records, not asserted;
  (4) the departure-gate inventory names function + file
      for every gate between pick and departure that the
      code actually applies (objMaybeDepart, objDanger,
      objHealGate, objDepart, plus any re-pick path in
      objPick and the memory-expiry rule), verified by
      grep, not from memory.
Departures and meetings are judged as OUTCOMES (counts
reported alongside), NEVER as take-rate over trajectory-
dependent triples as primary (lottery metric review).
If the primary universe is empty in either corpus, the
verdict is INSUFFICIENT-DATA for that corpus, not GO —
an empty universe proves nothing about the mechanism.

## Guards (reported, NOT re-scored into DIAG-GO)

- STARVATION: starvation deaths per corpus (baseline vs
  arm, from the existing rows; no new numbers claimed).
- MEDIAN SURVIVAL: median days per corpus, as recorded.
- WAVE-4 REACH: wave-4 reach per corpus, as recorded.
  (These guards exist so a re-run band, if one is ever
  triggered, is judged on the same footing as lottery;
  on pure-read analysis they are restated from the rows.)
- SENSE BAR: >= 1 full pick->departure OR
  pick->supersession trace quoted VERBATIM from a corpus,
  with a judgment of whether the villager reads like a
  person making a choice or an errand queue overwriting
  a decision (SENSE-TESTING LAW).

## Re-run rule (binding)

Re-run sims ONLY if the existing corpora lack a field this
prereg needs (e.g. pick-linked departure linkage cannot be
derived because the returns recorder lacks a needed field,
or a gate reason is not recorded anywhere). If a re-run
is triggered: base sweeps run in a lever-free state, NEVER
commit any code change mid-sweep (lottery contamination
lesson), and the re-run band, substrate, horizon, and
seeds are recorded in the evidence before any number from
it is judged. PREFER pure-read analyzer work: the
instrument is scripts/test-pickdepart-a.js (pure reads
over the corpora) proving each classification, run
against BOTH corpora.

## Instruments (new, scripts/ only)

- scripts/test-pickdepart-a.js: pure-read analyzer. Reads
  both corpora + src/data/monsters.json (wave lookup).
  Outputs: primary-universe pick list with class +
  reason per pick; per-corpus and pooled class counts
  and shares; nikos pick-by-pick classification; baseline
  departed-case contrast (visjoin_115 d135 pick -> d137
  departure) vs never-departed cases (what differed:
  intervening picks, candidate-null onset, gates);
  secondary all-wave HUNT census; guards restated from
  rows; --sense prints one full trace verbatim.
  Machine legs: every pick classified (unknown count
  asserted <= 1 for GO), determinism (two runs, same
  output), wave-lookup coverage (every huntMid resolved
  or listed unknown-wave).

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts go here in the evidence file, for the next run's
prereg. In particular: (a) whether candidate-null-after-
pick and superseded-by-re-pick should stay split by the
first-later-pick's candidate state, or merge into one
supersession class with a candidate-state flag; (b)
whether gate-blocked as defined (pick-time gates) misses
departure-time holds (danger/heal verdicts are not
recorded by the returns recorder — a departure-hold
recorder would be needed to split horizon from held);
(c) whether the first-later-pick rule understates
departure lag (a pick superseded on day N+5 was still a
live objective for days — the evidence reports lag
days for departed picks and supersession lag for
superseded picks alongside the classes).
