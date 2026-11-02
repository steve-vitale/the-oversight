# Journey social r81 — PREREGISTRATION (lane B, 2026-11-01)

Leg 5 (social life). This run takes r80's named-next items 1–3 + 4,
adopted verbatim from its metric review, not re-scored:

1. END-BLOCKED HAUL: record what happens to the haul after an
   end-blocked closure (packs? pantry? lost?) — Henry's 420 kcal
   (7004, favor-henry_zhang-123-50) is the standing example.
2. ACQUITTAL BATCH: keep accumulating; the wanted replication is
   specifically an NPC-ROOM conviction (r77's unanimous room is
   still the only one) — player-tipped convictions are a separate
   count. Cumulative entering r81: 29 trials, 27 acquitted,
   2 convicted (1 NPC-only, 1 player-tipped).
3. BEARER: record the scholar's identity across succession in the
   social driver so a previous-bearer refusal can name the death
   that changed the bearer (r80's Zhomart case: the death was NOT
   instrumented — rosterByDay carries living counts only).
4. TRIP TAIL: keep the split census (trips vs leavers); r80 trips
   span +1..+16.
5. DORMANT RE-ENTRY: still a design question for Steve, not a
   worker decision. NOT decided here.
6. END-BLOCKED repetition under other end causes (partner away?
   partner exiled?): descriptive census, not a bar.

## Correction to r80's note, established BEFORE this run's seeds

r80's note says Henry's favor closed "ONCE at d132 as
outing-end-blocked". The r80 7004 JSON shows the sharper shape,
verified against the record before this prereg was written:

- d132 is an `outing-end-blocked` record with stuckDays 7 and
  status reason "Your partner is no longer available for this
  outing." — NOT a closure. No `outing-ended-stuck` record exists
  for Henry's favor, and no deliveredKcal was ever recorded.
- At run end the favor still reads state 'promised',
  promiseKept 'released', playerKcal 210, partnerKcal 210,
  deliveredKcal 0, returnedDay null, stuckDaysEnd 14.
- Mechanism (code, src/js/favor-forage.js): `forageFavorAction`
  checks partner-dead/missing BEFORE the ending branch, so with a
  dead partner `forage_end` is never offered — the wedge's stuck
  escalation can never end the outing. The favor hangs, the
  wedge re-attempts it daily (single-outing-per-day slot), and
  the partner's virtual share (partnerHaul is not inventory; it
  becomes real only via depositPantryPieces at delivery) is
  stranded: never pantry, never pack. The player's 210 kcal IS
  real pack items and stays with the player — that half is
  honest, and this run checks it empirically (pack retention).
- So r81's haul question is not "where did the haul go after
  closure" but "does the partner-death hang replicate, and does
  the player's share verifiably stay in the pack while the
  partner's share strands?" The closure itself is the missing
  piece — see the fix rule below.

## What changes in r81 (driver/wedge/analyzer recording only, ZERO src/js in the measurement)

- Driver fork scripts/journey-social-r81-20261101.js: r80
  verbatim except (a) fresh seeds 7101–7104 + evidence dir
  2026-11-01/r81, (b) bearerByDay: the daily snapshot records
  {day, villagerId, name} beside rosterByDay (recording only),
  (c) endPack: run-end snapshot of the scholar's pack items
  (name/kcalEach/units) so player-share retention is checkable,
  (d) wedge records below. Arms unchanged: 7101/7102
  'handsoff', 7103/7104 'mootprobe' (r79/r80 verbatim).
- Wedge fork scripts/journey-social-r81-outing-wedge.js: r80
  verbatim except recording fields on deliver-blocked,
  outing-end-blocked and outing-ended-stuck records:
  playerHaulKcal + partnerHaulKcal (split, was total-only
  haulBefore), packKcal (edible pack total at record time),
  pantryKcal (v.pantryKcal at record time, null if unreadable);
  outing-ended-stuck gains deliveredPlayerKcal +
  deliveredPartnerKcal (was deliveredKcal only). Zero game
  behavior change in the wedge.
- Analyzer fork scripts/analyze-journey-social-r81-outing-20261101.js:
  r80 verbatim + (a) HAUL-FATE section per end-blocked favor:
  blocked days, max stuckDays, haul split at last blocked,
  deliveredKcal/returnedDay/favor state at run end, player-share
  retention (playerHaul items matched by fields against
  endPack), (b) BEARER section: bearer-change days from
  bearerByDay joined to that day's deaths, and every
  previous-bearer refusal row joined to its change day,
  (c) acquittal batch with the NPC-room vs player-tipped split,
  (d) trip/leaver split census carried.
- Proof test scripts/test-journey-social-r81-outing-wedge.js:
  r80's 56/56 wedge proof carried + new cases pinning the
  CURRENT mechanism (partner-dead blocks forage_end; bearer
  mismatch blocks; living-partner ending deposits both shares
  in the shared unload) — run BEFORE seeds. If the fix rule
  fires, the partner-dead case is updated to the new behavior
  and re-run (before/after chain, not a silent edit).

## Fix rule (declared now, decided by the data, not by taste)

- IF H1 replicates (below), this run implements ONE minimal
  fix in src/js/favor-forage.js: with ending=true and the player
  at home, a dead/missing partner no longer blocks forage_end;
  the shared unload deposits ONLY the player's matched share,
  the partner's share is declared lost with them in the return
  line, the promise is renounced/broken, and the favor closes
  (returned=true). No new system, no recovery of the partner's
  share, no change to deliver/together paths (dead partner
  still blocks those — honestly: there is no partner to forage
  or deliver with). Proof test updated + re-run, relevant
  suites re-run, and the fix ships only with that evidence.
- IF H1 does not replicate (0 partner-death end-blocks), NO
  src/js change: the hang stays a single-datum watch item and
  the run is instrument-only like r80.

## Run shape (r80 verbatim otherwise)

Fresh seeds 7101–7104, smoke 7105 (30d), DAYCAP=140
death-aware, competent policy, all linger, seeded-speaker
steering ON. Pilot gate: smoke PASS + first full seed
completes before the remaining seeds are trusted. Base:
master at worktree registration (bf70579db at pull; sibling
landings during the run are rebased onto at closeout per the
body, with proof tests re-run post-rebase).

## Bindings (judged as written; a miss is NO-GO, never re-scored)

- H1 HAUL-FATE REPLICATION: >= 1 partner-death end-block on
  fresh seeds shows the r80 shape (partner-dead reason on the
  end-blocked record, deliveredKcal 0, returnedDay null at run
  end) AND the player's share is found in endPack (retention
  proven) while the partner's share is nowhere (delivered 0).
  If H1 holds, the fix rule fires. If 0 partner-death
  end-blocks occur, H1 is NO-GO as a replication (not a game
  verdict) and the fix rule does not fire.
- H2 BEARER NAMING: every previous-bearer refusal row joins to
  a bearer-change day, and that change day names >= 1 death
  from the deaths list (the scholar's death window). A refusal
  with no joinable change day is reported as an instrument
  gap, not guessed.
- B-ACQ (descriptive batch, no pass bar — RNG cannot be
  forced): trials accumulate with the NPC-room vs
  player-tipped conviction split stated explicitly.
- B-TRIP (descriptive): away blocks split trips vs leavers
  (purpose=leave, duration=999, computed return >= 1000);
  100% of blocks carry awayComputedReturnDay (a number).
- B-PEOPLE: 5 sense reads, >= 2 outing-related, 0
  fabricated-history flags, 0 weak endings. PEOPLE PASS/FAIL
  on those counts.
- B-GUARD: pooled dryPerConvo inside [0.20, 0.40].
- B-REG: check.js --quick adjudicated by name against the
  standing pre-existing set (r80: measurement-proof-update,
  measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes,
  plus concurrency/starvation artifacts proven solo). Any NEW
  failure attributable to this run blocks landing.

## Metric review (carried, not re-scored)

- r80's B1-overwrite revision (casesTrial == sayTotal -
  overwrittenTrials) stays proposed for a moot-metric run, not
  this one; this run's moot census is r80 verbatim.
- village.moots stays RETIRED (unwritten by the game).
- The r75 target-aware walk fold into policies/competent.js
  stays owed, still not taken here (panel re-baseline required).
