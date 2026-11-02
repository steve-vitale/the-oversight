# Journey social r102 — PREREGISTRATION (lane B, 2026-11-02)

Leg 5 (social life). This run takes r81's named-next items, adopted
verbatim from its metric review, not re-scored:

1. WILD PARTNER-DEATH ENDING: r81 fixed the partner-death hang in
   src/js/favor-forage.js (a gone partner blocks forage/deliver but
   never blocks ending at home; only the player's matched share
   banks, the partner's share is named lost, the favor closes
   broken) and proved it on fixtures (67/67). The wild question
   is still open: does a partner-gone outing actually close that
   way in a real run, with a nonzero haul, instead of hanging?
2. DRY RE-SCORE ON THE FIXED BUILD: r81's B-GUARD was NO-GO on
   probe seeds (dryPerConvo 1.042 / 0.932 vs band [0.20, 0.40])
   because blocked beats in nonverbal conversations fell back
   to the English deflection pool. r81 fixed that (gesture
   narration fallback, 12/12). This run re-scores dryPerConvo
   on the fixed build. A drop toward the band is the fix's
   predicted effect, not a foregone conclusion.
3. ACQUITTAL BATCH: keep accumulating; the wanted replication
   is specifically an NPC-ROOM conviction (r77's unanimous room
   is still the only one) — player-tipped convictions are a
   separate count. Cumulative entering r102: 34 trials (r81's
   count: 32 acquitted; the other 2 are the r77 NPC-room
   conviction and one player-tipped conviction per r81's
   prereg split).
4. TRIP TAIL: keep the split census (trips vs leavers).
5. END-BLOCKED UNDER OTHER CAUSES (partner away? exiled?):
   descriptive census, not a bar. r81's fix covers away/missing
   partners by the same path, proven by code reading + the
   dead-partner fixture, not by a wild away datum.
6. DORMANT RE-ENTRY: still a design question for Steve, not a
   worker decision. NOT decided here.
7. The r75 target-aware walk + dawn step-first retry fold into
   policies/competent.js stays owed, still not taken here
   (panel re-baseline required).

## What changes in r102 (driver/wedge/analyzer recording only, ZERO src/js in the measurement)

- Driver fork scripts/journey-social-r102-20261102.js: r81
  verbatim except fresh seeds 7201-7204 + smoke 7205, evidence
  dir evidence/2026-11-02/r102, and the r81 driver's REPO
  default repointed at this run's worktree. Arms unchanged:
  7201/7202 'handsoff', 7203/7204 'mootprobe' (r79/r80/r81
  verbatim).
- Wedge fork scripts/journey-social-r102-outing-wedge.js:
  r81 verbatim, rename only.
- Analyzer fork scripts/analyze-journey-social-r102-outing-20261102.js:
  r81 verbatim + section headers renamed R78 -> R102 (r79's
  revision 5, carried twice) + the away gap histogram split
  into trips vs leavers (r79's revision 1, already present
  in r80/r81 as the split census — verified, not re-added).
  The wild-ending census (outing-ended-stuck records with a
  partner-gone reason + delivered split) is read from the
  per-seed JSONs' outingLog/favorEndStates in the run note;
  no analyzer behavior change beyond the header renames.
- Proof test scripts/test-journey-social-r102-outing-wedge.js:
  r81 verbatim, rename only. Run BEFORE seeds on SEED=42 and
  SEED=7; must be 67/67 on both (r81's post-fix count).

## Run shape (r81 verbatim otherwise)

Fresh seeds 7201-7204, smoke 7205 (30d), DAYCAP=140
death-aware, competent policy, all linger, seeded-speaker
steering ON. Pilot gate: smoke PASS + first full seed
completes before the remaining seeds are trusted. Base:
master at worktree registration (351382038 at pull; sibling
landings during the run are rebased onto at closeout per the
body, with proof tests re-run post-rebase).

## Bindings (judged as written; a miss is NO-GO, never re-scored)

- F1 WILD ENDING: >= 1 partner-gone end-blocked outing on
  fresh seeds closes via outing-ended-stuck with
  deliveredPlayerKcal equal to the player's matched share,
  deliveredPartnerKcal 0, favor state broken with
  returnedDay set, and the return line naming the partner
  share lost (dead) or staying (away/missing). If 0
  partner-gone end-blocks occur, F1 is NO-DATA (not a game
  verdict, not a fix verdict) — partner death mid-outing
  is rare (r80: 1, r81: 1 per 4-seed panel).
- G1 DRY GUARDRAIL (binding): pooled dryPerConvo inside
  [0.20, 0.40] AND >= 3/4 seeds individually inside the
  band. r81's probe-seed NO-GO (1.042 / 0.932) is the
  pre-fix comparator; the band is unchanged.
- B-GATE (replication): ZERO case-menu offers in a
  nonverbal conversation without an interpreter
  (badOffers empty on all seeds where such convos occur;
  seeds with 0 such convos are UNMEASURED, not passed).
- B-ACQ (descriptive batch, no pass bar — RNG cannot be
  forced): trials accumulate with the NPC-room vs
  player-tipped conviction split stated explicitly.
- B-TRIP (descriptive): away blocks split trips vs leavers
  (purpose=leave, duration=999, computed return >= 1000);
  100% of blocks carry awayComputedReturnDay (a number).
- B-PEOPLE: 5 sense reads, >= 2 outing-related, 0
  fabricated-history flags, 0 weak endings. PEOPLE PASS/FAIL
  on those counts.
- B-REG: check.js --quick adjudicated by name against the
  standing pre-existing set (r79-r81: measurement-proof-update,
  measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof,
  establishment-r20-fixes). Any NEW failure attributable to
  this run blocks landing.

## Metric review (carried, not re-scored)

- village.moots stays RETIRED (unwritten by the game).
- The r80 B1-overwrite revision (casesTrial == sayTotal -
  overwrittenTrials) stays proposed for a moot-metric run,
  not this one; this run's moot census is r81 verbatim.
- Empty analyzer/driver outputs must be size-verified, never
  trusted (r79/r90 instrument hazard: 0-byte outputs with
  exit 0, succeeding on retry).
