# Journey social r79 — PREREGISTRATION (lane B, 2026-11-01)

Leg 5 (social life). r78's named-next, adopted verbatim from its metric
review + run note, not re-scored: (1) MEASURE THE GATE: re-run the
social leg's case census with the r78 nonverbal gate IN master (it
changes which convos can press/investigate — a real trajectory
change, so this run is a fresh baseline, not a silent fold into
r78's numbers); (2) ACQUITTAL BATCH: keep accumulating trials
(r77: 2, r78: 8, cumulative 10 with a 9-acquit lean stated
descriptively); a convicted-room replication is still wanted before
anyone calls the lean a balance question; (3) DORMANT RE-ENTRY:
still a design question for Steve (open -> letlie -> dormant ->
npcMootTick skips dormant outright; only mootAdvisoryTick touches
it, advisory only), NOT decided in this run; (4) END-BLOCKED: still
no data — the question stays open until a run actually produces an
end-blocked outing; (5) BROKEN-ORIGIN: CLOSED by r78 (10 positive
later-start windows) — the wedge's broken-promise scan is retained
as a descriptive census only, no binding.

## What changes in r79 (driver policy + recording only, ZERO src/js in the measurement)

- Driver fork scripts/journey-social-r79-20261101.js: r78 verbatim
  except (a) fresh seeds + evidence dir (2026-11-01/r79); (b) ARMS
  unchanged: 6901/6902 'handsoff' = r78 handsoff verbatim (no
  case-menu pick in the fallback, ambush survival + invitation
  picks stay pickable by design); 6903/6904 'mootprobe' = r78 probe
  arm verbatim (one betrayal:moot pick per case, convo ENDS after
  the pick; vote picks stay pickable in later convos, as r78);
  (c) GATE CENSUS (below); (d) the wedge is r78 verbatim (rename
  only); the analyzer gains the gate section + the playerVoter
  label fix (below).
- GATE CENSUS (recording only, zero game change): driveOne records,
  per convo, threads seen (already recorded) + whether an
  interpreter was ever present (convoGet.interpreter, read every
  turn), and per betrayal offer the turn's thread + interpreter
  snapshot. The per-seed JSON gains gateCensus: total convos,
  nonverbal convos, nonverbal-without-interpreter convos,
  nonverbal-with-interpreter convos, case offers inside
  nonverbal-without-interpreter convos (badOffers, listed), and
  case offers inside nonverbal-with-interpreter convos. The
  betrayalOfferConvos mapping also carries threads +
  nvInterpreter per convo. Nothing in this census picks, forbids,
  or alters a menu entry.
- ANALYZER LABEL FIX (analyzer only, no driver or game change):
  the r78 analyzer's "playerVoter true but no driver vote pick
  recorded — vote path unattributed" line misreads playerVoter
  (r78 metric review watch item). The r79 analyzer prints
  "playerVoter means MAY vote (trial creation, 90% unless
  player-convened); no driver vote cast, so the player's seat
  went unused" instead. Trial counts and verdicts are unchanged.

## Run shape (r78 verbatim otherwise)

Fresh seeds 6901-6904, smoke 6905 (30d), DAYCAP=140 death-aware,
competent policy, all linger, seeded-speaker steering ON. Pilot gate:
smoke PASS + first full seed completes before the remaining seeds
are trusted; a pilot seed that shows cases or outings is interesting
enough to expand to the full 4. Base: master 5f2d17bf7 at
registration (git pull already up to date). The r78 gate fix is in
this base (src/js/betrayal.js betrayalChoices nonverbal gate).

## Bindings (a miss is NO-GO, never re-scored)

- B1 (moot metric): every seed's per-seed JSON carries caseSnaps
  with trialDetail (or trial null) AND mootSayLines. The analyzer
  reports trials from first-trial-appearance + say count. v.moots
  is never a count.
- B2 (autonomous convening, hands-off arm only): an ELIGIBLE case
  is a hands-off seed case with NPC accused (no player accused),
  a target, no probe pick, no driver case-menu pick of any kind,
  playerConvened false, observed in status 'open' at some snap,
  and a run that reaches its mootIn day (case day + mootIn, tick
  default 3 when mootIn is null). IF >=1 eligible case exists, the
  analyzer reports whether a trial appeared by then / ever, and
  the convening SAY line if one fired. If NO eligible case exists,
  the verdict is UNISOLATED (reported, not failed).
- B3 (acquittal census): for every trial the analyzer reports NPC
  guilty, total, need, margin, convicted/advisory/resolution,
  wildDay, playerVoter, and whether the driver cast a vote (must be
  0 on hands-off trials and 0 inside probe convos). No new
  acquittal-lean verdict below 10 NEW trials — the r78 lean (9/10
  cumulative) is carried descriptively; r79 adds to the count.
- B4 (away return timing, replication guardrail): 100% of away
  start-blocks carry awayComputedReturnDay (a number). A block
  without it is a miss.
- B6 (people): 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending. Probe-arm reads must show the convo ending
  after the convening pick (no post-convening fallback vote lines).
- B7 (GATE, new): ZERO case-menu offers with thread=nonverbal AND
  interpreter=false across all seeds (gateCensus.badOffers empty).
  A non-empty badOffers list is a GATE MISS (a real bug in the
  landed gate, not a metric miss) — investigate before any gate
  claim. Nonverbal convo counts (with/without interpreter) are
  reported regardless; a run with zero nonverbal convos reports
  the gate as UNMEASURED on that seed, not as passed.
- Guardrails (report-only): pooled dryRate in [0.20, 0.40];
  NO-REGRESSION check.js --quick: the same 6 pre-existing failures
  as r73-r78, zero new, adjudicated by name.

## Decision notes (delivered, not implemented)

Whether the r75 target-aware walk + dawn step-first retry fold into
policies/competent.js — still owed, still not taken here for the
same reason as r78 (panel re-baseline required). The dormant
re-entry question (item 3 above) is likewise delivered as a design
question with the r78 mechanism attached, not decided inside this
run.
