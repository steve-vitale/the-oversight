# Journey social r77 — PREREGISTRATION (lane B, 2026-10-31)

Leg 5 (social life). r76's named-next, adopted verbatim from its metric
review + run note, not re-scored: (1) fix the moot metric — count
trials / case-status transitions and moot SAY announcements, never
v.moots again; (2) isolate autonomous convening — a case-bearing
control seed with the probe WITHHELD tests npcMootTick alone; (3)
acquittal lean — census vote margins + vote-score spread on the next
case batch; (4) away return timing — capture sinceDay + duration (the
record's real shape) and report the return-day distribution; (5)
broken-origin restart — still uncaught: a broken promise followed by
a later start from the same villager; (6) probe hygiene — the probe
convo ENDS after the convening pick, so no fallback pick can cast a
verdict vote; (7) end-blocked repetition — census, not a game change:
does an outing with a permanently unavailable partner re-block weekly,
and is the partner dead/gone or merely away?

## What changes in r77 (driver policy + recording only, ZERO src/js)

- Wedge fork scripts/journey-social-r77-outing-wedge.js: r76 verbatim
  EXCEPT dawnDiag gains the away record's REAL fields: awaySinceDay,
  awayDuration, awayComputedReturnDay (= sinceDay + duration when
  both are finite), alongside the r76 purpose/node fields. Pure reads;
  no movement, no RNG, no behavior change.
- Driver fork scripts/journey-social-r77-20261031.js: r76 verbatim
  except (a) fresh seeds + evidence dir; (b) ARMS: 6701/6702 'linger'
  = r76 policy verbatim + recording-only additions (probe WITHHELD:
  these are the autonomous-convening arm); 6703/6704 'mootprobe' =
  linger + the hygiene probe below; (c) RECORDING-ONLY additions on
  both arms: caseSnap rows gain trialDetail (trial votes with
  vidName/vote/score, guilty, finalGuilty, convicted, wildDay,
  playerVoter, present count) + resolution + belief map when present,
  and a mootSayLines census (SAY lines matching moot-convening
  phrasing, day-mapped); (d) MOOT-PROBE HYGIENE (probe arm only):
  when the probe picks a betrayal:moot, the driver ENDS that convo
  after the pick's turn (recorded as mootProbeEnded) — no further
  fallback pick in that convo, so the driver casts NO verdict vote.
  The game's own vote backstop may still resolve a pending vote
  later; that is game behavior, reported as playerVoter/finalGuilty
  vs NPC guilty, never hidden. (e) The legacy mootsConvened field
  (v.moots, nonexistent) is still printed for continuity but is
  NEVER used as a count in this run.
- Analyzer fork scripts/analyze-journey-social-r77-outing-20261031.js:
  r76 verbatim plus: trial census (first-trial-appearance per case =
  convened count; say-announcement count; convening origin:
  probe / autonomous / playerCaseTick / unknown, from probe picks +
  say lines + case day/mootIn), vote census (per trial: NPC guilty,
  total, need, margin, convicted/advisory/resolution, wildDay,
  playerVoter, driver-vote-cast flag), away return census
  (computed return day minus current day), broken-origin windows,
  end-blocked repetition census (blocks per outing + partner status
  at last block: alive / away / dead / gone).

## Run shape (r76 verbatim otherwise)

Fresh seeds 6701-6704, smoke 6705 (30d), DAYCAP=140 death-aware,
competent policy, all linger, seeded-speaker steering ON. Pilot gate:
smoke PASS + first full seed completes before the remaining seeds
are trusted; a pilot seed that shows cases or outings is interesting
enough to expand to the full 4 (the r76 gate, restated).

## Bindings (a miss is NO-GO, never re-scored)

- B1 (moot metric, fixed): every seed's per-seed JSON carries
  caseSnaps with trialDetail (or trial null) AND mootSayLines. The
  analyzer reports trials from first-trial-appearance + say count.
  A seed missing either census is a binding miss. v.moots is never
  a count.
- B2 (autonomous convening, control arm only): IF >=1 control case
  (NPC-accused, NPC-target, no probe pick) reaches day >= case.day +
  mootIn, the analyzer reports whether a trial appeared by then /
  ever, and the convening SAY line if one fired. If NO control case
  forms or none reaches mootIn, the verdict is UNISOLATED (reported,
  not failed): the surface never formed, as in r76's control.
- B3 (acquittal census): for every trial the analyzer reports NPC
  guilty, total, need, margin, convicted/advisory/resolution,
  wildDay, playerVoter, and whether the driver cast a vote (must be
  0 on probe-arm trials). No acquittal-lean verdict on fewer than
  10 trials — descriptive only below that.
- B4 (away return timing): 100% of away start-blocks carry
  awaySinceDay + awayDuration (or an explicit null-with-reason when
  the record lacks them). The analyzer reports the computed-return
  distribution. An away block without the record fields is a miss.
- B5 (broken-origin restart): the analyzer reports, per seed, every
  broken-ended favor followed by a later same-villager start, with
  day gaps. An unreported window (endings exist, no window
  examined) is a miss. No "gate freed" claim without a caught start.
- B6 (people): 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending. Probe-arm reads must show the convo ending
  after the convening pick (no post-convening fallback vote lines).
- Guardrails (report-only): pooled dryRate in [0.20, 0.40];
  NO-REGRESSION check.js --quick: the same 6 pre-existing failures
  as r73/r74/r75/r76, zero new, adjudicated by name. Lure acceptance:
  routine census line only.

## Decision note (delivered, not implemented)

Whether the r75 target-aware walk + dawn step-first retry fold into
policies/competent.js — r76 recommended YES as a shared driver/policy
helper with a panel re-baseline, lane decision owed, NO policy file
changed. r77 does not take it: the fold changes every bot's
trajectories and must land with a panel re-baseline, not mid-cycle
inside a measurement run. The end-blocked question (item 7) is
likewise census-only here: whether a permanently unavailable partner
should close an outing out is a wedge-design decision for the lane
owner, to be made on r77's census, not silently inside r77.

## AMENDMENT A (written after the first sweep, before the re-run)

First-sweep finding, withdrawn verdict: the control arm was NOT
probe-withheld in practice. The linger driver's generic fallback
(fresh non-leave pick) picked offered betrayal:moot choices, so
6701's two trials were player-called (playerConvened=true, SAY "You
call a moot"), not autonomous — the first sweep's B2 "AUTONOMOUS
CONVENING OBSERVED" is WITHDRAWN. The first-sweep files are preserved
in first-sweep/ for audit. Fix (driver-only, no game change): the
fallback never picks betrayal:moot on any arm; moot offers are picked
only by the declared probe. Vote picks stay pickable (juror play).
Second finding: the SAY filter's /moot/ substring matched 'smooth'
in plant-study lines and 'moot crowd' contest scores — the filter is
now phrase-anchored. The re-run reuses seeds 6701-6704; trajectories
reproduce except in convos where a moot offer was present (the only
place the fallback change bites), so the re-run is a new measurement
with a declared instrument fix, not a silent overwrite. B2 is judged
under the post-fix rules in the analyzer (eligible = control case,
no probe, no driver moot pick, playerConvened false, run past
mootIn-day with the npcMootTick default of 3 when mootIn is null).
