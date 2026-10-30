# sim-flipshape-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0320Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-flipshape-a.
Tracker direction (from run fleshout-20261030T0215Z, sim-partycounter-a):
the party counterfactual closed party formation as NOT BRIDGEABLE
(median party survival 3.56x, kill 5.83x; 73% of joins have N=1).
The next arm must change what a fight is for — NOT re-count heads,
NOT re-narrate endings, NOT lower win-prices. This arm prices the
survival gap by MECHANISM CLASS instead of damage.

MEASUREMENT ONLY. Zero src/js changes, no game-code lever, no
default flip, no mechanism change proposed or built on proxy
evidence alone. The verdict is DIAG-GO / NO-GO on the instrument
plus a RANKED NEXT (which mechanism class, if any, is bridgeable —
a mechanism proposal is a ranked next, not a build in this arm).
No panel artifact (standing exception as in tilejoin / shoutrec /
partycounter: the comparison here is before-vs-priced-mechanism on
identical fights, the same discipline — every price is computed
from the same fight's own recorded state, never from a different
band).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law: earlier waves
never leave; mBreak 0.25 wave 1 / 0.15 waves 2+; wave-4 bands HP
850–1500, damage 35–95) and docs/PARTY.md (parties are a System
unlock, day 7). No CANON-registered doc covers field-fight joins,
ally DPR pricing, or mechanism-class pricing — the mechanism below
is derived from code, stated exactly so it can be checked
(src/js/fieldFights.js): at round >= 2 the engine computes
vDpr = rec.mDealt / round, mDpr = rec.vTaken / round,
rtk = mlead.hp / max(1, vDpr), rtd = vHp / max(1, mDpr),
hopeless = rtd < rtk * 0.85. On a hopeless round with help
uncalled, allies > 0, allyVids non-empty and intent not learn,
the fighter shouts and ONE ally charges in. On the NEXT hopeless
round (or on the flee floor, vHp/vHpMax < fleeAt) the fighter
flees anyway unless Rally / War Cry fires. The shout branch and
the floor check fire in the SAME morale pass, floor after shout —
so a zero-window fight ends before any post-shout round, whatever
the mechanism class. Governing canon rule: CANON.md "No silent
actions" and "Monster encounters are fought, not rolled."

## The question, precisely

For LOST shout-joined fights, holding damage output fixed at its
observed rate, what would have to change about the fight's SHAPE
— not its damage numbers — for the fight to end in a drive-off
instead of flight or death? Three mechanism classes, priced per
fight from recorded state only:

- (A) STAYING, shout-anchored shortfall: how many more rounds of
  window the fighter needed at shout time, at the observed
  post-shout team rate, before the monster would break.
- (B) MITIGATION, window-survival factor: by what factor incoming
  damage after the shout would have to be scaled for the fighter's
  HP at fight end to stay at/above the flee floor (vFlee) or above
  zero (vDie).
- (C) FLEE-WINDOW, end-anchored extension: how many more rounds
  past the observed ending the fighter must be allowed to stay
  (flee suppressed / floor delayed), at the observed post-shout
  team rate, before the monster breaks.

Class (A) and class (C) are both in rounds but anchored differently
on purpose: (A) measures the trajectory gap at the shout (the
engine's own rtd vs the time the team actually needed); (C)
measures the timing gap at the ending (how close the team already
was when flight/death cut the fight short). If (C) is small while
(A) is large, the team closed most of the gap before fleeing early
— flee TIMING is the lever, not staying power. If both are large,
staying alone does not bridge. If (C) is zero, the monster was
already below its break line at the ending and the floor
pre-empted the break — a timing/ordering shape, not a staying gap.

## Population (fixed before judging)

Universe U, verbatim from tilejoin / breakline / partycounter:
fieldparty channel == 'field', caller in {resolve, patrol, aid},
wave 1..4, leader NOT the scholar (fieldparty leader.isScholar
!== true), fought (rounds >= 1). Rows are index-joined per seed
across fieldparty / tilejoin / shoutrec stores with day / vid /
mid agreement asserted (exactly as test-partycounter-a.js); any
mismatch is a join error.

Joined: tilejoin joinedAllyVid non-null. Split BEFORE pricing:
- SHOUT-JOINED: shoutrec shoutRound non-null (the shout branch
  fired). This is the priced population's parent set.
- NO-SHOUT JOINED: shoutRound null. Sub-split by shoutrec
  allyFromStart (ally-from-start join, no shout — not a pricing
  case) vs unexplained null (instrument failure; any unexplained
  null blocks GO until explained).

PRICED POPULATION = shout-joined fights with outcome vFlee or
vDie (LOST fights) AND allyActiveRounds = max(0, rounds -
shoutRound) > 0 AND allyDealt > 0 — called ADDRESSABLE-LOST.
Solo lost fights and no-shout joined lost fights carry no shout
snapshot and no post-shout window, so they cannot be decomposed
by these formulas; they are counted in the census (U lost by join
status) but never priced and never folded into medians. This is
the same discipline as partycounter: only fights with a recorded
window are priced, and the denominator is stated, not hidden.

Reported separately, never folded into any median or share
denominator:
- ZERO-WINDOW (floor) lost fights: shout-joined, lost,
  allyActiveRounds = 0 (shout and floor in the same morale pass).
  Priced infinite for all three classes, reason "zero-window
  (floor-branch)". No mechanism class fixes timing by
  construction — the ally never strikes and no post-shout window
  exists to extend or mitigate.
- ACTIVE-ZERO-DEALT lost fights: shout-joined, lost,
  allyActiveRounds > 0 but allyDealt = 0. Priced infinite for all
  three classes in the primary table, reason
  "active-zero-dealt". They are kept separate even though a
  leader-only post-shout rate exists, because their shape is a
  death/rout before the ally's damage registers, not a team-rate
  shape — following partycounter discipline exactly.

vKill and mFlee shout-joined fights are NOT priced (they are not
lost); they are counted in the census only. A mechanism class
that "flips" an already-won or already-driven-off fight is not a
gap-closer.

## Formulas (exact, fixed before judging)

Notation per fight (S = shoutRound, R = rounds, HPs = shoutMhp,
Mmax = shoutMmax, vHps = shoutVhp, vHpMax = shoutVhpMax,
mBreak = shoutMbreak, fleeAtS = shoutFleeAt):
- active = max(0, R - S). Post-shout window, in rounds.
- postDPR = (final mDealt - shoutMdealt) / active, where final
  mDealt is the tilejoin row's total (leader + ally damage; the
  engine adds ally strikes to rec.mDealt). Post-shout TEAM rate.
  Finite pricing requires postDPR > 0.
- incomingPost = final vTaken - shoutVtaken (leader damage taken
  after the shout; ally damage taken is separate and never
  counted here). Finite mitigation pricing requires
  incomingPost > 0.
- rtdS = vHps / max(1, shoutVtaken / S) — the engine's own
  rounds-to-drop at the shout (leader incoming rate to the shout).
- needS = HPs - mBreak * Mmax — damage still needed at the shout
  to drive the monster off (break line). If needS <= 0 the fight
  was already below the break line at the shout — flagged,
  class (A) = 0-ish shortfall handled as: roundsNeededFromShout
  <= 0, so shortfall = roundsNeededFromShout - rtdS (negative,
  reported signed, not overwritten to 0).
- needEnd = final mHpLeft - mBreak * Mmax — damage still needed
  at the observed ending to drive the monster off, where final
  mHpLeft is the tilejoin row's lead HP at fight end. If
  needEnd <= 0 the monster was already below its break line when
  the fight ended (floor pre-empted the break, or a hopeless
  flee fired first) — class (C) = needEnd / postDPR <= 0,
  reported signed, and flagged "already-below-break-at-end".
- (A) shout shortfall, rounds (signed): A = needS / postDPR -
  rtdS. Positive = the window at the shout fell short of the
  time the team needed by that many rounds. Zero or negative =
  the shout-time window already sufficed; the loss came from
  flee/death timing after the shout, not from the shout-time
  trajectory.
- (B) mitigation factor, unitless (capped at 1.0): for vFlee,
  floorHP = fleeAtS * vHpMax; f_raw = (vHps - floorHP) /
  incomingPost; for vDie, floorHP = 0; f_raw = vHps /
  incomingPost. f = min(1.0, f_raw). Reading: f is the factor
  incoming post-shout damage would have to be scaled by so the
  leader's HP at fight end sits exactly at the floor (vFlee) or
  at zero (vDie) — i.e. survives the observed window. f = 1.0
  means no mitigation was needed to stay above the floor: the
  leader's HP at end was already at/above the floor, so the loss
  was a morale/trajectory flight (hopeless branch), NOT an
  HP-window loss — mitigation alone cannot flip such a fight,
  because the engine flees on hopeless trajectory regardless of
  HP above the floor. f < 1.0 means the fight IS HP-window-bound:
  that much incoming reduction would have kept the leader above
  the floor through the observed window. f <= 0 (numerator <= 0)
  means the leader was already at/below the floor at the shout —
  expected only in zero-window fights (excluded); any occurrence
  in addressable-lost is flagged and counted, priced at 0.
  Limitation stated up front: fleeAt can move after the shout
  (War Cry lowers it by 0.15; Rally holds a round without moving
  it), so fleeAtS is the shout-time floor, not a guaranteed
  end-time floor. The price is a shout-floor price, labeled so.
- (C) flee-window extension, rounds (signed): C = needEnd /
  postDPR. Positive = rounds past the observed ending the team
  must be allowed to stay to break the monster at its observed
  rate. Zero or negative = already below the break line at the
  ending (floor-pre-empted break).

A fight is PRIMARILY PRICED (finite) for a class when its inputs
are all known and the class denominator is positive (postDPR > 0
for A and C; incomingPost > 0 for B). A fight priced for A and C
but not B (incomingPost = 0 — the ally absorbed every post-shout
hit while the leader still fled on trajectory) counts as priced
for A/C and UNPRICED for B, with its reason stated; the coverage
bar below requires finite pricing for ALL THREE classes jointly,
so such a fight fails the joint bar honestly rather than being
quietly dropped from one column.

Secondary (report-only, never judged, never ranked): kill
variants of the two round classes, A_kill = HPs / postDPR - rtdS
and C_kill = final mHpLeft / postDPR (damage to kill the lead,
not just break it). They exist only so the drive-off prices can
be compared against partycounter's kill prices in shape, not as
verdict legs.

vFlee subtype split (report-only, approximate, labeled as such):
learn = tilejoin fleeLearn true; round-cap = rounds == 15;
floor-plausible = final HP frac (shoutrec vHpLeft / shoutVhpMax)
< fleeAtS; hopeless otherwise (fleeHopeless true or default).
War Cry's post-shout fleeAt lowering can misclassify a true floor
flee as hopeless here; the split is descriptive, never a GO leg,
and sense transcripts are the check on it.

Median convention (fixed, per the partycounter correction):
prices and round/factor medians use the STANDARD median (mean of
the two middles for even n). Survival days use the upper-middle
row (breakline / tilejoin convention, labeled as such). Shares
are reported at fixed cuts per class (see bars).

## Bars (judge against this header; a miss is NO-GO, never re-scored)

- DIAG-GO (primary, pricing coverage): among ADDRESSABLE-LOST
  fights, at least 80% are PRIMARILY PRICED with a finite value
  for ALL THREE classes (A, B, C jointly), AND the median and
  the shares at the fixed cuts are reported for ALL THREE
  classes over the same priced population, overall and
  wave-split 1 / 2 / 3 / 4. (With exact recorders the only
  joint-finite failures are postDPR = 0 or incomingPost = 0
  over a positive window, so the bar tests the instrument, not
  the game.)
- JOIN INTEGRITY (blocks GO): index-join errors 0 across
  fieldparty / tilejoin / shoutrec rows on shared calls, AND
  joined ally vid in tileAll for every joined fight (violations
  counted as join errors), AND no unexplained no-shout joined
  fights, AND shoutAllyDealt = 0 for every shout-joined fight.
- SENSE BAR: at least 3 lost / addressable-lost fight transcripts
  read end to end and judged for meaning / coherence (does the
  ending read as a person fleeing/dying for a legible reason?
  does the floor shape read as past-holding rather than a
  numbers artifact? does a hopeless flight above the floor read
  as trajectory, not HP?), never just counts. Sources: this
  band's sense slots (tilejoin sense.joined + shoutrec
  sense.joined per seed), preferring lost fights; the first
  joined fight per seed is not guaranteed lost, so sense slots
  are read as available and any shortfall is reported honestly
  rather than filled from another band.
- DETERMINISM GATE: re-run one seed of this band into a scratch
  EVID dir; its row JSON must be byte-identical to the corpus row.
- RECOMPUTE (diagnostic, NOT a verdict leg): this band's own
  single-ally prices (kKill / kSurv medians, shoutrec formulas
  verbatim) are recomputed and reported as the BEFORE leg.
  Published shoutrec / joinendlines / partycounter band numbers
  are NOT quoted as current (substrate drift is real — backlog
  #1457); any difference between this band's before-leg and
  partycounter's published table is reported as drift diagnostic
  only. The verdict judges this band's mechanism prices only —
  paired, same fights.
- BAND WALL NUMBERS (report-only, diverging prototype per the
  tilejoin metric review, never a verdict leg): wins / national /
  table / wave reach / median survival / deaths on this band.
- BRIDGEABILITY READING (the substance, pre-registered to avoid
  post-hoc spin; it does not move the DIAG-GO bar, which is
  about pricing coverage):
  - Class (A) STAYING-SHOUT: BRIDGEABLE if median A <= 2 rounds,
    PARTIAL if <= 4 rounds, NOT BRIDGEABLE if > 4 rounds.
    Rationale: the code's existing single-use holds (Rally, War
    Cry) each buy about one round; a mechanism buying 1–2 rounds
    is in the range of existing holds, 3–4 is a stretch, beyond
    4 is a new fight shape, not a hold.
  - Class (B) MITIGATION: BRIDGEABLE if median f >= 0.75 AND
    fewer than 50% of priced fights sit at f = 1.0 (already above
    the floor — mitigation-irrelevant); PARTIAL if median
    f >= 0.50 under the same guard; NOT BRIDGEABLE if median
    f < 0.50; NOT THE LEVER (not a bridgeability failure of the
    number, but of the class) if >= 50% of priced fights are at
    f = 1.0 — mitigation cannot be the answer when most losses
    were never HP-window losses. The guard is pre-registered so
    a median of 1.0 is never misread as "no mitigation needed,
    therefore bridgeable."
  - Class (C) FLEE-WINDOW: BRIDGEABLE if median C <= 2 rounds,
    PARTIAL if <= 4 rounds, NOT BRIDGEABLE if > 4 rounds, same
    rationale as (A). Class (C) is the primary staying class for
    the RANKED NEXT (it measures what actually remained at the
    ending); class (A) is reported alongside it and a
    disagreement between (A) and (C) readings is reported as
    MIXED for the staying family, with the divergence explained
    (post-shout team closed the gap vs shout trajectory, or the
    reverse).
  - Wave-split readings use the same lines per wave (with n
    stated; wave splits with n < 3 are flags, not readings).
  - RANKED NEXT rule (fixed): rank classes by their reading
    (BRIDGEABLE first, then PARTIAL, then NOT BRIDGEABLE, then
    NOT THE LEVER), breaking ties by the smaller median gap
    (rounds for A/C, 1 - f for B) and then by the larger share
    of fights within the bridgeable cut (A/C <= 2 rounds,
    B >= 0.75). The ranked next names the top class ONLY as a
    proposal for a future arm — no mechanism is built here, and
    a NOT-BRIDGEABLE / NOT-THE-LEVER top rank is reported as
    "no bridgeable mechanism class on this evidence," not
    softened into a partial.
- If the primary bar is missed, the verdict is DIAG-NO-GO /
  INSUFFICIENT-DATA on the instrument (stated plainly, with the
  failing leg named). If the addressable-lost set is too small
  to read (fewer than 8 addressable-lost fights), the verdict is
  INSUFFICIENT-DATA honestly — never lower the bar. If the bar
  passes but every reading is NOT BRIDGEABLE / NOT THE LEVER,
  the verdict is DIAG-GO on the instrument with a
  NOT-BRIDGEABLE finding: the gap is measured by mechanism class
  and no class closes it.

## Band (my own before leg — re-derived, never quoted)

Substrate reused VERBATIM, never edited: scripts/policies/
tableseat-nowait.js + fieldparty-form-diag + w4dpr-diag +
breakline-diag + tilejoin-diag (TILEJOIN=1, prototype ON) +
shoutrec-diag (SHOUTREC=1), with env LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1, BREAKLINE=1,
TILEJOIN=1, SHOUTREC=1. Verified against
evidence/2026-10-29/sim-joinendlines-a.md and its prereg, which
list the same seven env flags and the same recorder stack (the
joinendlines recorder itself is not reused: it copies rec.log
for calledHelp fights, which the shoutrec/tilejoin sense slots
already cover, and this arm adds no narration). Seeds
75101–75108 (the shoutrec / joinendlines / partycounter band),
180d death-aware horizon (dead villages stop simulating, +10d
tail max per the harness — death-aware, never a fixed 200d).
Corpus: evidence/2026-10-29/perseed-flipshape-a/on/
(s75101–s75108-fresh.json + summary.json), via a new sweep
scripts/test-flipshape-a-sweep.js modeled on
test-partycounter-a-sweep.js with only the output dir changed.
No new recorder is added (shout snapshot, roundTotals, tileAll,
final totals already exist in the reused recorders), so no
recorder OFF/ON neutrality leg is owed; the reused recorders'
neutrality was proven by their own arms. The determinism gate
above covers reproducibility. No src/js change of any kind is
made in this arm, so the current-master code (which already
carries the joinendlines/soloendlines narration lines, proven
neutral by their arms) is the measured code, unchanged.

## What this arm does NOT do

No src/js change, no game-code lever, no default flip, no
mechanism change proposed or built, no re-counting of heads
(party size N is reported in the census only, never priced),
no re-narration of endings, no lowering of win-prices, no
list-fed prototype (no new join mechanism is simulated — every
price is analytic from recorded state, never a simulated fight,
because the engine takes exactly one ally per shout and any
multi-ally or hold mechanism would need a game-code change this
arm forbids). No re-judgment of the tilejoin, shoutrec,
joinendlines, soloendlines, or partycounter verdicts (all stand).
No push, no bump, no live verification. Never touch
docs/ONTOLOGY.md. Never touch any other worktree, registry entry,
loop-B tree, or build lane. Never touch the main tree. Never run
concurrent jest; cache dir /tmp/jest-cache-sim-flipshape-a
(no jest expected — node scripts only; the rule is recorded, not
waived).

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
