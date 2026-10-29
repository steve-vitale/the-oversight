# sim-w5ready-a — PRE-REGISTRATION (binding, written BEFORE any judged audit leg)

Run: fleshout-20261029T1715Z follow-up (coordinator run; this worker arm
sim-w5ready-a). Axis: scale-onramp (standing directive still stands:
no run has yet taken a full seat).
Worktree: `~/workspace/worktrees/sim-w5ready-a` (branch sim-w5ready-a).
Base commit: ef9219748 (master at worktree cut; note any move in the
evidence file).
Corpus (fixed, NOT re-run): evidence/2026-10-29/perseed-fullseat-a/
(16 rows: seeds 76001–76008 × OFF substrate / ON fullseat-pursuit),
from run fleshout-20261029T1715Z, evidence/2026-10-29/sim-fullseat-a.md.

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (§ Wave 5: standing ≥ 200 AND
  wave-4 faced; readiness-gate section), docs/TABLE.md,
  docs/PROGRESSION.md.
- Two veteran concepts, kept SEPARATE throughout (conflating them is
  an error):
  - MONSTER veterans: hardened older-wave monsters (src/js/game.js
    castMonster/spawn path: veteran flag, +50% HP, +3 damage, +1
    speed, scarred/elder/pack-leader variants). Killing one counts
    as its BASE wave in the ledger and in deedState().wavesFaced —
    never toward the villagers bar.
  - LIVING-VILLAGER veterans bar: distinct LIVING roster members
    with a recorded kill of a wave-(w-1)+ monster in
    state.waveKillLog (src/js/standing.js waveCombatReadiness:
    `e.w >= w-1`, `isLiving(e.by)`; dead killers do NOT count
    under default behavior — VETSHAPE=1 is an instrument that
    counts living-or-dead and is OFF by default, not the game).
- #1223 (MEASURE ONLY — Steve call required before any move; NOTHING
  changed here): the deed gate's stage bar is ≥ 2 in code
  (progression.js deedGateReady) vs ≥ 3 in some docs. This arm
  judges against the code. Stage blocked 0/16 fullseat rows, so it
  is not a wave-5 readiness component in any case.
- THIS ARM IS MEASUREMENT ONLY: zero src/js changes, zero default
  flips, zero deed-bar moves. No pursuit variant in this arm.

## Step-1 code identification (recorded BEFORE the judged audit leg)

The brief's name `waveUnlockReady(5)` EXISTS in code:
src/js/standing.js `waveUnlockReady(w)` delegates to
`waveCombatReadiness(w)` for w = 4, 5. Its four components for w = 5
(demands from standingCfg().readyDemand[5], sim starting points,
not canon — Steve can overrule):

| # | component (short name) | threshold (demand) | how it is read (code) |
|---|---|---|---|
| R1 | armor (`armor`) | armored ≥ 4 at armorP ≥ 15 | living roster fighters with armor WORN at P ≥ 15 (S.equipment.armorOf; scholar via armorBonus()) |
| R2 | weapons (`weapons`) | armed ≥ 6 | living roster fighters with a weapon TO HAND (equipped melee/ranged, or a weapon item carried) |
| R3 | tricks (`tricks`) | counters known ≥ 3 | distinct monster ids in state.monsterCounters passing monsterCounterKnown() |
| R4 | veterans (`veterans`) | living wave-4+ killers ≥ 2 | distinct living roster vids with waveKillLog entries with e.w ≥ 4 |

The FULL wave-5 unlock chain (src/js/game.js `unlockedWave()`)
adds components OUTSIDE waveUnlockReady(5); the audit enumerates
the whole chain, not just the four bars:

| # | component | threshold | code |
|---|---|---|---|
| U1 | w3 rung | day ≥ 25 AND wave-2 ledger points ≥ bar[2] (default 5; instrument records w2points ≥ 5) | game.js unlockedWave() |
| U2 | gated standing | villageStandingTotal() ≥ t5 = 200 | standing.js villageStandingTotal() + standingCfg() |
| U3 | wave-4 faced | waveEngaged(4) > 0 (distinct wave-4 monsters faced blow-by-blow, deedState().wavesFaced) | game.js waveEngaged() via progression.js deedState |
| U4 | readiness | waveUnlockReady(5).ready (R1–R4 all met) | standing.js (defer5 hold when capped ≥ 200 but unready) |

Standing's own sub-components (standing.js villageStanding()):
war = wave-3+ ledger points × 25; diplomacy = seasoned
regional+ links × 34 (seasoned = 30+ days, trust 40+,
hierarchy.js _linkSeasoned; regional+ via _linkRegionalPlus);
plenty = major feasts (quality ≥ 1) × 20, capped at 100 toward
t5 (plentyCapT5). Gated-total layers: plenty cap (raw ≥ 200 but
capped < 200 → held at 199), defer4 (raw ≥ 100, rd4 unready,
peak < 4 → held at 99), defer5 (capped ≥ 200, rd5 unready,
peak < 5 → held at 199), peak ratchet floor (peak ≥ 4 → gated
never below 100; peak ≥ 5 → never below 200).

Downstream, NOT an unlock component (reported separately, never
counted as an unlock blocker): the deed w5 bar
(progression.js deedGateReady(): distinct wave-5 monsters fought
≥ 2; distance = 2 − w5 count). It is unfillable while wave 5 is
locked, so its distance (2 on every locked row) is a consequence
of the lock, not a second lock.

## Per-row classification rule (pre-registered)

Each of the 16 corpus rows is classified from its OWN recorded
fields only (endSnapFull.unlock + diag.max + diag.maxDist +
endSnap.dist). No field is invented; no worker summary is copied —
the analyzer recomputes from the rows.

- PRIMARY (end-state unlock chain): blocking components = every
  unmet item among {standing-gap, readiness-short bars, w4faced
  missing, w3rung missing}, where:
  - standing-gap = distT5 = max(0, 200 − gated standing), with
    holdKind recorded (defer5 / below-bar / cap / released) and
    the raw/capped split (war/diplomacy/plenty) reported.
  - readiness-short bars = the row's recorded rd5short list
    (names only — see corpus gap below).
  - w4faced missing = unlock.w4faced false; w3rung missing =
    unlock.w3rung false.
- SECONDARY (max-reach): peak standing gap = max(0, 200 −
  diag.max.standing), with a 199-pin flag when peak gated == 199
  (defer5 hold) vs a plain shortfall otherwise; deed distances
  from diag.maxDist (w5 always 2 on a locked band — reported, not
  double-counted as an unlock blocker).
- A row with NO unlock block recorded (missing endSnapFull.unlock
  or missing rd5short) is UNCLASSIFIED, not assumed ready.
- READINESS DISTANCE — exact vs bounded (declared here, before
  the audit): the corpus records rd5short NAMES but NOT the
  armored/armed/tricks/veterans COUNTS. Exact numeric deficits
  per readiness bar are therefore UNMEASURED from this corpus.
  What IS measured per bar: short/not-short, plus the bounded
  deficit interval derived from code demand + shortness
  (veterans deficit ∈ [1,2] when short; armor ∈ [1,4];
  weapons ∈ [1,6]; tricks ∈ [1,3]; 0 when not short).
  The analyzer reports short-names + bounded intervals and
  flags exact counts UNMEASURED. It must NOT invent counts.
  The next instrument (ranked next step) must record the four
  counts per snapshot; until then, bar-level ranking (how many
  rows each bar blocks) is the judged ranking, and exact-count
  claims are out of scope.

## Movable-vs-fixed classification rule (pre-registered)

Each component gets exactly one label, with mechanism reasoning:

- POLICY-MOVABLE: a competent-player policy (bot verbs available
  without src/js changes — patrol/hunt, channel, feast, integration,
  courtship, gearing, teaching, fight-spreading, keeping fighters
  alive) can change the component's value within a run.
- GAME-CODE-ONLY: the component's value or threshold is set by
  code structure a policy cannot reach (demand numbers, caps,
  thresholds themselves — changing them is a game-code change,
  forbidden in this DIAG arm but named as the lever).
- STEVE-CALL: changing it requires Steve's design ruling (deed
  bars, the #1223 stage bar, demand recalibration, living-vs-dead
  veteran counting / VETSHAPE default).
- Each label carries TWO sub-judgments, kept apart: (a) movable
  IN PRINCIPLE by mechanism; (b) moved ON THIS BAND (OFF→ON
  comparison in the corpus — did the pursuit move the bar?).
  A component movable in principle but unmoved on 16/16 rows is
  reported as such, not as "movable, problem solved."

## Standing dynamics (subordinate measurement only)

- Seed 76003: CHECK whether it is in the corpus (it is cited in
  the fullseat note as 197→100). If it is not, standing dynamics
  are reported as UNMEASURED on this corpus, not as a finding.
  If it is, report end-vs-peak standing for all 16 rows
  (diag.max.standing vs end gated standing) + end component
  split (war/diplomacy/plenty). Peak component splits are NOT in
  the corpus → peak-to-end component attribution is UNMEASURED
  from corpus; mechanism is code-read only: diplomacy is
  live-computed (links dissolve / trust < 40 / polity loss each
  cost 34); plenty churns through the 60-entry feastLog cap
  (game.js hostFeast splices oldest entries; new feasts can push
  old major feasts out); war is ledger-cumulative (no decay path
  in the code read — stated as a code read, not a corpus
  measurement); the peak ratchet floors gated standing at 100
  once wave 4 has released.
- The 199-pin vs plain-shortfall distinction: a gated total of
  exactly 199 with capped ≥ 200 and rd5 unready IS the defer5
  hold (bound t5−1 by construction in villageStandingTotal);
  a peak of 197 with capped < 200 is NOT a pin — it is 3 points
  short with no hold active. The analyzer must not call every
  near-200 value a pin.

## Sense-testing (pre-registered)

Read at least one fullseat ON row's tail/transcript
(evidence/2026-10-29/sim-fullseat-a-sense.txt, seed 76005 ON,
days 166–167 ring) and judge: does the readiness wall read as a
REAL wall (named missing pieces a player could act on) or as an
INVISIBLE gate? Method limit declared up front: the ring covers
only the final days, so the table announcement and the hold
beats earlier in the run are NOT in the readable window — the
judgment must say what the window can and cannot show. Code
context for the judgment (not a substitute for the read):
standing.js _standingHoldBeat names the short bars aloud
(weekly reminders) via _readinessBarLine; _standingReleaseBeat
announces openings.

## DIAG-GO threshold (judged as written, never re-scored)

DIAG-GO iff ALL of:
1. Every wave-5 unlock-chain component enumerated above with a
   file/function citation (U1–U4, R1–R4, standing sub-sources,
   deed w5 as downstream) — verified against code at base
   ef9219748, not from the worker's summary.
2. 16/16 corpus rows classified by blocking component(s) with
   distance as defined above (exact standing points + boolean
   faced/rung + short-names with bounded intervals + deed w5
   distance reported separately). Any row with a missing unlock
   block, or any component without a code citation, counts as
   UNCLASSIFIED and fails this leg.
3. Every component given a movable / game-code-only / Steve-call
   label with mechanism reasoning + the on-this-band sub-judgment.
4. Standing-dynamics note delivered: 76003 corpus membership
   stated, end-vs-peak deltas for 16/16 rows, pin-vs-shortfall
   distinction applied, unmeasured peak splits flagged.
5. Sense read delivered with its method limit stated.
Otherwise DIAG-NO-GO (or INSUFFICIENT-DATA if the corpus itself
is missing/unreadable — it is not expected to be: 16 rows were
inspected in step 1).

Known gap declared in advance (does NOT by itself fail DIAG-GO,
because the classification rule above defines distance at the
measured level): exact readiness COUNTS are unmeasured from this
corpus. If the audit finds any readiness bar's short-name data
missing or contradictory across a row's fields, that row is
UNCLASSIFIED and leg 2 fails.

## Ranked next step (fixed order, per brief)

1. This audit (readiness decomposition). 2. Standing dynamics
   (subordinate here; full arm only if this audit leaves the
   standing question open). 3. ONLY then a pursuit variant.
   No deed-bar move, no stage-bar chase (#1223) without a Steve
   call.
