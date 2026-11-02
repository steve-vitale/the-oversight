# Journey social r106 — PREREGISTRATION (lane B, 2026-11-02)

Leg 5 (social life). This run takes r102's named-next items,
adopted verbatim from its metric review, not re-scored:

1. DRY SPLIT: r102's G1 NO-GO (pooled 0.23 in band, per-seed
   2/4) mixed two populations — verbal dry rate (0.17-0.44 on
   seeds with ZERO nonverbal convos) and nonverbal deflection
   counts (which the r81 fix deliberately removed from the
   census). This run splits dryPerConvo into verbal and
   nonverbal and binds the guardrail on the nonverbal rate
   only. The r81 probe-seed NO-GO (1.042/0.932) must not be
   re-read as a failure of the fixed build: the census
   definition changed under it.
2. F1 NONZERO-HAUL CLAUSE: r102's F1 GO rested on a ZERO-haul
   wild partner-death ending (David 0/0; now the fourth wild
   datum at 0/0 in a row). Nonzero-haul accounting (a dead
   partner's share stranded while the player's matched share
   banks) is still fixture-only (r81 case M, 210 kcal). This
   run requires a NONZERO-haul wild ending for the GO.
3. EXILE TAXONOMY — ANSWERED BEFORE SEEDS (code read, not a
   game change; the answer is the instrument basis for this
   run's batch columns):
   - `convicted` is set ONLY in `finishTrial`
     (src/js/betrayal.js:1944): guilty = NPC guilty votes +
     player guilty votes, need = floor(total/2)+1,
     convicted = guilty >= need. While a trial is in
     progress, trialDetail.convicted is null and
     finalGuilty is null — a snapshot can catch it
     mid-flight.
   - If convicted, `sentenceCase` (betrayal.js:2049) maps
     the conviction to exile / weregild / schism / cold_war
     by charge severity + avgBelief. Exile is a SENTENCE on
     a conviction, never a verdict class of its own.
   - CONSEQUENCE: r102's "exile with convicted=null"
     (7203 case_6) was an INSTRUMENT artifact, not a game
     taxonomy problem. The r102 analyzer read the FIRST
     trialDetail snap (d15, mid-flight, convicted null);
     the final snap (d16) shows convicted=true,
     finalGuilty=4, resolution=exile, and the driver cast
     the tipping guilty vote d16. 7203 case_6 is a
     PLAYER-TIPPED conviction (probe-convened).
   - CORRECTED BATCH BASELINE entering r106 (44 trials):
     36 acquitted, 7 convicted (4 NPC-room, 3
     player-tipped), 1 other (7202 case_4 cold_war, not
     convicted). The r102 note's "4 convicted / 2 other"
     is superseded by this correction; the game data is
     unchanged, only the reading is fixed.
   - This run's analyzer reads verdict fields from the
     LAST trialDetail snap and classifies by vote
     arithmetic: NPC-room iff npcGuilty >= need, else
     player-tipped iff finalGuilty >= need. A cold_war
     resolution with convicted=false, if it recurs, wants
     a code-path answer (watch item, not pre-judged).
4. CASE TIMING: r102's skew (7202 case_6 first-resolved snap
   d20 vs accused Andre's death-census day d23) is
   investigated with a new instrument field, not assumed:
   death records now carry corpse `dayDied` alongside the
   first-seen day, and the analyzer compares the
   first-resolved snap day against every accused's dayDied.
   Two clocks exist by construction — case clock (kill
   event, ghost-trial closure betrayal.js:1119 fires when
   ANY accused is removed dead) vs death-census clock
   (corpse first seen at end-of-day sweep). If dayDied
   <= snap day, the r102 skew was corpse-seen lag, not a
   case-clock lead. If dayDied > snap day, the lead is
   real and gets investigated, not explained away.
5. DORMANT RE-ENTRY: still a design question for Steve, not
   a worker decision. NOT decided here.
6. The r75 target-aware walk + dawn step-first retry fold
   into policies/competent.js stays owed, still not taken
   here (panel re-baseline required).

## What changes in r106 (driver/wedge/analyzer recording only, ZERO src/js in the measurement)

- Driver fork scripts/journey-social-r106-20261102.js: r102
  verbatim except fresh seeds 7301-7304 + smoke 7305,
  evidence dir evidence/2026-11-02/r106, REPO default
  repointed at this run's worktree, and RECORDING
  additions: drySplit in dryCensus (verbal vs nonverbal
  dryPerConvo on the same dryFamLines basis; nonverbal =
  threads includes 'nonverbal', the gate census's own
  predicate) and dayDied on death records. Arms unchanged:
  7301/7302 'handsoff', 7303/7304 'mootprobe' (r102
  verbatim).
- Wedge fork scripts/journey-social-r106-outing-wedge.js:
  r102 verbatim, rename only.
- Analyzer fork
  scripts/analyze-journey-social-r106-outing-20261102.js:
  r102 verbatim + (a) FINAL-trial verdicts (verdict fields
  from the last trialDetail snap, with a MID-FLIGHT flag
  when the first snap differs) + VERDICT line with the
  NPC-room / player-tipped vote-arithmetic split, and
  (b) the R106 CASE-TIMING CHECK section (accused_died
  resolutions vs accused dayDied/seen-day, ALIGNED / LAG /
  LEAD / UNMEASURED flags).
- Proof test scripts/test-journey-social-r106-outing-wedge.js:
  r102 verbatim, rename only. Run BEFORE seeds on SEED=42
  and SEED=7; must be 67/67 on both (r102's count).

## Run shape (r102 verbatim otherwise)

Fresh seeds 7301-7304, smoke 7305 (30d), DAYCAP=140
death-aware, competent policy, all linger, seeded-speaker
steering ON. Pilot gate: smoke PASS + first full seed
completes before the remaining seeds are trusted. Base:
master at worktree registration (777c8a99d at pull; sibling
landings during the run are rebased onto at closeout per the
body, with proof tests re-run post-rebase).

## Bindings (judged as written; a miss is NO-GO, never re-scored)

- F1-HAUL (binding): >= 1 partner-gone end-blocked outing on
  fresh seeds closes via outing-ended-stuck with
  deliveredPlayerKcal > 0 (NONZERO player haul),
  deliveredPartnerKcal 0, favor state broken with
  returnedDay set, and the return line naming the partner
  share lost (dead) or staying (away/missing). If
  partner-gone endings occur but ALL carry zero haul, F1
  is REPLICATED-ZERO (wild ending replicated, nonzero-haul
  accounting still open — not GO, not NO-DATA). If 0
  partner-gone end-blocks occur, F1 is NO-DATA (not a game
  verdict, not a fix verdict).
- G1-SPLIT (binding): pooled nonverbal dryPerConvo
  (drySplit.nonverbal, summed over seeds with >= 10
  nonverbal convos) inside [0.20, 0.40]. If no seed
  reaches >= 10 nonverbal convos, G1-SPLIT is NO-DATA
  (not NO-GO). Verbal dry is DESCRIPTIVE only (pooled +
  per-seed reported, no bar) — verbal dry was never the
  r81 fix's target. Pooled-overall dryPerConvo is
  reported as a comparator to r102 (0.23), descriptive.
- B-GATE (replication): ZERO case-menu offers in a
  nonverbal conversation without an interpreter
  (badOffers empty on all seeds where such convos occur;
  seeds with 0 such convos are UNMEASURED, not passed).
- B-ACQ (descriptive batch, no pass bar — RNG cannot be
  forced): trials accumulate on the CORRECTED baseline
  above (44 = 36 / 7 / 1), counted with final-trial
  verdicts and the NPC-room vs player-tipped split stated
  explicitly. Exiles are sentences on convictions, counted
  under the conviction split — never a separate verdict
  column.
- B-TIMING (descriptive + flag rules): for every
  accused_died resolution, first-resolved snap day vs each
  accused's dayDied and seen-day. ALIGNED if snap day is
  within 1 day after the earliest accused dayDied; LAG
  note if later; LEAD (snap before every accused dayDied)
  is an investigation item, not an explained artifact.
- B-TRIP (descriptive): away blocks split trips vs leavers
  (purpose=leave, duration=999, computed return >= 1000);
  100% of blocks carry awayComputedReturnDay (a number).
- B-PEOPLE: 5 sense reads, >= 2 outing-related, 0
  fabricated-history flags, 0 weak endings. PEOPLE PASS/FAIL
  on those counts.
- B-REG: check.js --quick adjudicated by name against the
  standing pre-existing set (r102: measurement-proof-update,
  measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof,
  establishment-r20-fixes). Any NEW failure attributable to
  this run blocks landing.
- B-CONVENE (replication, r79 convenable rule): on the
  hands-off arm, eligible cases convened / convenable;
  cases dying with their accused are not convening misses.

## Metric review (carried, not re-scored)

- village.moots stays RETIRED (unwritten by the game).
- The r80 B1-overwrite revision (casesTrial == sayTotal -
  overwrittenTrials) stays proposed for a moot-metric run,
  not this one; this run's moot census is r102 verbatim.
- Empty analyzer/driver outputs must be size-verified, never
  trusted (r79/r90 instrument hazard: 0-byte outputs with
  exit 0, succeeding on retry).
- The r102 per-seed JSONs carry NO dayDied field, so the
  r102 skew cannot be retro-checked from data — r106's
  dayDied field exists for exactly this reason.
