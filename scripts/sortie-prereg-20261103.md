# Pre-registration — sim-sortie-a (Loop A 20261103T0203Z)

Axis: scale-onramp. Arm question: does answering lingerer-sortie
offers in sims convert the known 97339 zero (a wave-4 Eulogy lingered
at the treeline and gorged 6 nights, d85–90, each night offering "or
send a sortie" — never taken, because the sortie is UI-only: the sole
sim-policy caller of the answer verb in the codebase is none; app.js
is the only caller) into wave-4 deeds? Context:
evidence/2026-11-02/sim-scale-onramp-round-1915.md (diag arm GO,
wave4seek arm KILLED). This arm is the sortie link ONLY — it is NOT
bundled with curious-escalation or feast-draw rates.

## Primary metric

Distinct wave-4 monsters fought per seed = count of deed-feed
(`Game.deedState().wavesFaced`) entries whose wave is 4 at run end.
Judged quantity: number of pilot seeds with >= 1 distinct wave-4
fought, variant minus baseline, on identical seeds. A fight counts
when the engine records it (recordDeedFight on real blow-by-blow
fights; fled fights count — the deed is "faced", not "killed").

## GO threshold (binds the run, MEASUREMENT.md §14)

GO iff BOTH:
  (a) seeds-with->=1-wave-4-fought: variant minus baseline >= +2, AND
  (b) the cost bar is clean, all three legs:
      1. total starvation deaths (deaths in the harness death stream
         whose cause mentions starvation or hunger, summed over the
         pilot): variant <= baseline + 2;
      2. arm-only deaths: deaths occurring on a sortie-attempt day in
         variant runs (sortie-day deaths, from the attempt records
         joined to the death stream by game day): <= 2 across the
         pilot;
      3. median survival (game days at run end): variant >= 0.8x
         baseline median.
Anything else = KILLED. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. If KILLED: DELETE the policy file and the
proof test, keep results + compare + per-seed JSONs, report KILLED
with the numbers.

## Horizon + why

180d death-aware cap, matching the prior closecommit bands. Dead
villages stop simulating (harness runDays ends at over/village-lost);
no fixed-200d tail. 180d covers the national/wave-4 window (97339 sat
at d92) with room for lingerer offers to arrive and be answered after
unlock.

## Seeds (pilot)

98401–98408. Freshness: verified by exact-token grep before any
judged sim (tracked evidence/ + scripts/: no prior judged sim-seed
use; the only substring hits are pantry-kcal values such as
pantryFreshBefore 98402, not seeds — inspected, not seeds). If any
seed had shown prior judged use, the band would have fallen to
98501–98508 and this file would have been amended BEFORE any judged
sim runs. It did not, so the band stands.

## Policies (POLICY-SIDE ONLY, zero src/js changes, zero default flips)

- BASELINE ("closecommit"): the verbatim stack from
  scripts/fightoutcome-driver-20261102.js — tribfloor leadfeast +
  windefer + seatdrive + fullseat-diag + titanroute + musterclose +
  mustergap. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald. One process per seed.
- VARIANT ("closecommit+sortie"): baseline + ONE new policy file,
  scripts/policies/sortie.js (`withSortie` wrapper). It answers a
  lingerer-sortie offer when the offer has been ANNOUNCED, under
  these rules:
  - Offer detection: a say-tap installed in the policy's setup (same
    pattern as titanroute's lair tap) records ONLY lines matching the
    nightly gorge announcement (a line containing both "gorges at the
    treeline" and "send a sortie"). No other line is used for any
    decision. The recorded offer carries the announcement day and the
    announced name as spoken (transcript text, never an id lookup).
  - Answer rule, evaluated in daily(): if an unanswered offer exists
    (announced on or before the current day), the full-seat deed bars
    are unmet (distinct wave-4 faced < 3 OR distinct wave-5 faced
    < 2, from the village's own deed record), the game is not over
    and no turn-based fight is open, and no sortie was attempted
    today, then call the engine's lingerer-answer verb with
    'sortie' exactly once for that offer and record the attempt
    (day, offered name, verb return: ok / why / cleared / broke /
    remaining / paid, plus any error).
  - One attempt per offer: an answered offer is never re-answered; a
    fresh gorge line on a later night is a fresh offer and may be
    answered again if the bars are still unmet.
  - Fight behavior is UNCHANGED from baseline: the sortie itself is
    the engine's own played field fights (mustered fighters, real
    rations, villagers can die). This arm tests offer availability,
    not fight tactics.
  - No RNG is consumed by this layer (no random calls anywhere in
    the policy): offer order is announcement order, the answer rule
    is deterministic. Arm/baseline trajectories differ ONLY through
    the sortie answers and their consequences.

## Perception-law compliance (hard constraint, Steve 2026-10-28)

The sortie layer decides ONLY from:
  1. The announced offer (the nightly gorge line, spoken by the
     engine to the player — transcript-visible, the same channel a
     phone player reads before pressing the button).
  2. The village's OWN deed record (`Game.deedState().wavesFaced`)
     — its own fight history, not a roster.
  3. Its own day count (scholar day) and game-over / fight-open
     guards.
It NEVER reads any monster roster, position, or link list, and never
calls any engine helper that returns one. Compliance is proven by a
proof test with two legs: (a) a source scan of the policy file for
the forbidden roster/position API tokens (the policy file itself
contains none of them, not even in comments); (b) a determinism leg
(stub-Game: an announced offer is answered exactly once, a second
daily the same day does not re-answer, a met deed bar does not
answer, and no random call is made).

Channel note (why the say-tap is the honest channel): the beats
panel in app.js shows the lingerer beat from the same lingering
state and offers the same two buttons; the nightly gorge line is
that offer in words. A policy that answered without any announced
offer would be pressing a button the player cannot see — that is
exactly what this design refuses to do. If offers never arrive on
this band, the arm reports zero offers (an availability finding),
not a silent no-op success.

## Secondary measures (descriptive, never judged)

Per seed, both arms: sortie offers seen, sorties taken, sortie
fight outcomes (from the verb returns + the fight say lines),
distinct wave-4 fought, wave-4 kill-feed split by path (from a
read-only wrap of the engine's kill-ledger verb: its `via` values —
sortie / aid-crisis / patrol / wild / agency / contest / titan
paths — kills only; fled fights have no `via`, so the faced split
is reported as kills-by-path plus sortie-attempt outcomes, never
inferred), plus the standard wall numbers (national/tableWaiting/
tableDone/wins, wave reach, median survival, death causes,
starvation counts). Table flags use the landed split helper
(scripts/fightoutcome-tableflags.js): tableDone = seat taken, never
the collapsed latch.

## Comparison instrument

Balanced panel (scripts/balance-panel.js) §15: NOT applicable to
this comparison as built — POLICY_REGISTRY in
scripts/sweep-compare.js is a fixed list that contains neither the
closecommit stack nor the sortie wrapper, and editing the observer
to admit them would change the instrument mid-comparison. The
judged comparison is therefore the identical-seed driver table
(scripts/sortie-driver-20261103.js + analyzer), with per-seed
wave-4 counts for both arms, attached as
evidence/2026-11-03/sortie-compare.md. This limitation is stated
here, before any sim, not discovered after.

## Sense-testing (SENSE-TESTING LAW)

Read at least one sortie-fight transcript (or, if no sortie fight
occurs, one lingerer-offer stretch) from the kept say transcript,
and judge meaning, coherence, consequences — not just counts.

## Metric review

(To be filled at closeout. A miss here is NO-GO; a wrong metric is
proposed for the NEXT run, never re-scored in this one.)
