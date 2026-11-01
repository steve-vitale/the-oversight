# Journey social r80 — PREREGISTRATION (lane B, 2026-11-01)

Leg 5 (social life). r79's named-next, adopted verbatim from its metric
review + run note, not re-scored: (1) AWAY SPLIT: split the away census
into trips vs leavers (purpose=leave, duration=999, computed return
1000 — the game's no-return sentinel) before reporting return timing;
the leaver-block shape (dawn attempts burned on someone gone since
day 1) is a watch item, not a defect claim; (2) ACQUITTAL BATCH: keep
accumulating trials (r77: 2, r78: 8, r79: 8, cumulative 18 with a
17-acquit lean stated descriptively); a convicted-room replication is
still wanted before anyone calls the lean a balance question;
(3) DORMANT RE-ENTRY: still a design question for Steve (open ->
letlie -> dormant -> npcMootTick skips dormant outright; only
mootAdvisoryTick touches it, advisory only), NOT decided in this run;
(4) END-BLOCKED: still no data — the question stays open until a run
actually produces an end-blocked outing; (5) ANALYZER LABELS: the R78
section headers are renamed to R80 in this fork (r79 renamed only the
trial + convening headers); (6) BROKEN-ORIGIN: CLOSED by r78 — the
wedge's broken-promise scan is retained as a descriptive census only,
no binding.

## What changes in r80 (driver policy + recording only, ZERO src/js in the measurement)

- Driver fork scripts/journey-social-r80-20261101.js: r79 verbatim
  except (a) fresh seeds + evidence dir (2026-11-01/r80); (b) ARMS
  unchanged: 7001/7002 'handsoff' = r79 handsoff verbatim (no
  case-menu pick in the fallback, ambush survival + invitation
  picks stay pickable by design); 7003/7004 'mootprobe' = r79 probe
  arm verbatim (one betrayal:moot pick per case, convo ENDS after
  the pick; vote picks stay pickable in later convos, as r79);
  (c) NO driver behavior change at all — the away split lives in
  the analyzer; (d) the wedge is r79 verbatim (rename only);
  the analyzer gains the away split + the R80 label renames.
- AWAY SPLIT (analyzer only, no driver or game change): the
  away-return census classifies each away start-block as TRIP
  (returning: computed return is a real day) or LEAVER (the
  no-return sentinel: awayDuration === 999, or purpose 'leave'
  with computed return >= 1000) and reports separate gap
  histograms + the leaver rows (seed, day, name, sinceDay,
  duration, computed return). The unsplit histogram is still
  printed for continuity with r79. Binding B4 still requires 100%
  of blocks to carry awayComputedReturnDay (a number).
- ANALYZER LABEL RENAMES (analyzer only): every remaining R78
  section header becomes R80 (away-return, broken-origin,
  end-blocked, hands-off pick audit, broken-by-log-trace, SAY TV
  exclusion). Trial + convening headers were already R79 in the
  r79 fork and become R80 here. No census logic changes besides
  the away split.

## Run shape (r79 verbatim otherwise)

Fresh seeds 7001-7004, smoke 7005 (30d), DAYCAP=140 death-aware,
competent policy, all linger, seeded-speaker steering ON. Pilot gate:
smoke PASS + first full seed completes before the remaining seeds
are trusted; a pilot seed that shows cases or outings is interesting
enough to expand to the full 4. Base: master 3d2fafa1f at
registration (git pull already up to date; sibling sim-dipslide
landing absorbed by fast-forward before forking). The r78 nonverbal
gate is in this base (src/js/betrayal.js betrayalChoices nonverbal
gate); this run is a fresh baseline for the gate era, not a fold
into r79's numbers — arms differ by construction, so arm
comparisons are descriptive, NOT a balanced-panel before/after
claim.

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
  acquittal-lean verdict below 10 NEW trials — the cumulative lean
  (17/18) is carried descriptively; r80 adds to the count.
- B4 (away return timing + split, replication guardrail): 100% of
  away start-blocks carry awayComputedReturnDay (a number). A block
  without it is a miss. Trips and leavers are reported separately;
  the leaver shape is descriptive, not a defect claim.
- B6 (people): 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending. Probe-arm reads must show the convo ending
  after the convening pick (no post-convening fallback vote lines).
- B7 (GATE, replication): ZERO case-menu offers with
  thread=nonverbal AND interpreter=false across all seeds
  (gateCensus.badOffers empty). A non-empty badOffers list is a
  GATE MISS (a real bug in the landed gate, not a metric miss) —
  investigate before any gate claim. Nonverbal convo counts
  (with/without interpreter) are reported regardless; a run with
  zero nonverbal convos reports the gate as UNMEASURED on that
  seed, not as passed.
- Guardrails (report-only): pooled dryRate in [0.20, 0.40];
  NO-REGRESSION check.js --quick: the same 6 pre-existing failures
  as r73-r79, zero new, adjudicated by name.

## Decision notes (delivered, not implemented)

Whether the r75 target-aware walk + dawn step-first retry fold into
policies/competent.js — still owed, still not taken here for the
same reason as r79 (panel re-baseline required). The dormant
re-entry question is likewise delivered as a design question with
the r79 mechanism attached, not decided inside this run.
