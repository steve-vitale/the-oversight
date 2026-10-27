# sim-day100raid-code-b — PRE-REGISTRATION (written BEFORE any judged run)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1130Z, arm
sim-day100raid-code-b. Axis food-economy.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. A scripts/ recorder or trace instrument is allowed ONLY to prove a
code path executes; it must not change game behavior (read-only wraps,
delegate identically, no state writes, no RNG use). This arm does NOT
re-judge the raiddor GO, the raidday100 DIAG-NO-GO, or any earlier
verdict — their verdicts stand in their own evidence. Its verdict is ONLY
the two subquestions below. Judged ONLY against this prereg.

## Backlog claim (recorded here; sim-findings.md edit left for coordinator)

Backlog item (sim-findings.md, 2026-10-27, food-economy/ledger):
"POST-SNAPSHOT RAID ADJUSTMENT UNEXERCISED + DAY-100 RAID SCREEN 0/60" —
the analyzer subtracts raid takes dated == closing-snapshot day from the
boundary closing, but no raid on either raiddor band or the raidday100
screen (10100-10139) landed on a closing-snapshot day. This arm claims
that item for the CODE-READ question only: is a day-100 unanswered-raid
take even reachable at the horizon edge? The sim-findings.md line edit
([open] -> [claimed ... by sim-day100raid-code-b]) is left for the
coordinator, per the arm brief; this prereg is the claim record.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-raidday100-b.md + prereg (DIAG-NO-GO, current
  base): 40-seed screen 10100-10139, 52 raid-unanswered records, ZERO
  raids dated == closing-snapshot day; latest raid day 99 (seed 10109);
  0/60 combined with raiddor's 20. A raid demand arrives a day before
  its take (10103: demand day 83 -> take day 84), so a day-100 take
  needs a day-99 demand. The screen's day-99 take (10109) shows demands
  occur that late, but no demand on day 99 was followed by a day-100
  take in that range.
- evidence/2026-10-27/sim-residualhunt-b.md (GO): the closing snapshot
  (last spoilDays entry) is taken during the day-100 policy run, before
  the day-100 meal draws are reflected; day-101 sweeps are recorded and
  counted in the ledger while no snapshot exists to reflect them.
  Unified boundary model: residual = flows recorded after the closing
  snapshot, with sign.
- evidence/2026-10-27/sim-raiddor-ledger-b.md (GO, pre-c04d4e0cb base):
  the post-snapshot raid adjustment: a raid-unanswered record dated ==
  lastSnapDay counts as a draw in the boundary flows AND is subtracted
  from the boundary closing (rBClosing = bClosing - raid100,
  rBClosingDried = bClosingDried - raid100D). Implemented but
  UNEXERCISED on both raiddor bands.
- This arm runs on the CURRENT base (see "Base rule" below) with NO pin.
  Raiddor trajectories are pre-c04d4e0cb and are NOT cited as
  current-base trajectories; the raidday100 screen trajectories ARE
  current-base trajectories and ARE cited.

## The two subquestions (answer BOTH, with file + line citations)

(a) Does villageAgencyDaily run its raid branch on day 100 (or is day
100 a closing/snapshot day where that branch never runs)?
The raid branch is the `if (pr && day > (pr.day || 0))` take in
villageAgencyDaily: a pending unanswered demand takes on the first
villageAgencyDaily call whose day exceeds the demand day. A day-99
demand therefore needs a villageAgencyDaily call with day >= 100.
Answer YES only if the call chain (endDay -> membershipDaily ->
hierarchyDaily -> villageAgencyDaily) is shown to execute with day ==
100 inside a 100-day run, AND the take branch is unconditional code
in that function (no day guard of its own). A day-100 demand STAGING
does not by itself answer (a): staging happens in _vaSimInner, which
runs BEFORE the take branch in the same call — a staged demand can
never fire in its own staging call, and staging alone does not prove
the take branch ran. The proof must show the take branch itself is
reached on a day-100 call (static: the branch is unconditional in
the function body; dynamic: a read-only recorder observing a day-100
villageAgencyDaily call, plus the screen's 52 demand+1 takes proving
the branch fires on days <= 99).

(b) Does the horizon include the day-100 endDay take (closing snapshot
timing vs day-100 draws and day-101 sweeps, per residualhunt)?
The closing snapshot is taken in the sweep's wrapped policy.daily
during loop iteration 100, BEFORE Game.sleep() runs that iteration's
endDay. The take must therefore fire at an endDay that (i) runs
inside the 100-day run (sleep is inside the runDays loop body, or a
wait tick crosses the day boundary inside the run), (ii) runs the
membershipDaily chain BEFORE the original endDay body increments
scholar.day (so the take is dated 100, not 101), and (iii) is dated
== lastSnapDay so the analyzer's raid100 leg counts it. Answer YES
only if all three are shown with citations, AND the screen corpus is
reconciled: demands 53 vs takes 52, the single hanging demand
identified, and the take rule (take == demand + 1) verified on every
matched pair. A day-101 take (a day-100 demand's take) is OUTSIDE the
horizon by construction and does NOT count as a day-100 exercise.

## PRE-REGISTERED GO/NO-GO (verbatim — judge ONLY against this)

GO (verdict REACHABLE) iff ALL of:
(a1) subquestion (a) is answered YES definitively: the endDay chain
citations show villageAgencyDaily executes with day == 100 inside a
100-day run, the take branch is shown unconditional in the function
body, and the read-only recorder observes a day-100 villageAgencyDaily
call in a real 100-day run; AND
(a2) the screen corpus's demand/take ledger reconciles exactly:
53 demands, 52 takes, take == demand + 1 on every matched pair, the
single hanging demand identified by seed and day; AND
(b1) subquestion (b) is answered YES definitively: snapshot-before-
sleep ordering in the runDays loop, membershipDaily-before-increment
ordering in the endDay wrap, and the analyzer's raid100 definition
(r.day === lastSnapDay) are all cited, showing a day-99 demand's
take would be dated 100, post-snapshot, and counted; AND
(b2) the proof script (scripts/test-day100raid-code-b.js) is GREEN:
it re-derives (a1), (a2), (b1) from the code and the screen corpus by
its own reads (no hand-copied verdicts), the recorder run reproduces
its seed's corpus demand/take pattern, and hygiene passes (zero src/js
modified, zero sibling files modified, no modified tracked file
outside this run's own files).
If ALL hold, the verdict is REACHABLE and the next arm should SPEND
SEEDS: screen for a seed with a day-99 demand (its day-100 take will
exercise the adjustment). If any clause fails, the verdict is
UNSETTLED (if a subquestion is left unanswered, stated plainly with
what would settle it) or UNREACHABLE (if the code affirmatively
blocks a day-100 take — e.g. the take branch cannot run on day 100,
or the day-100 endDay is outside the run). A miss on any clause is
NO-GO, never re-scored against a friendlier metric mid-run. If the
metric proves wrong, write it under "metric review" and propose the
revision for the NEXT run. A recorder or det-gate failure is
DIAG-NO-GO (instrument, not game).

## Code paths and corpora to be used (fixed before judging)

Code paths (worktree base 6995ba7e6f34fb8c4ad2e6fc05f6bc2c6b6440b2):
- src/js/villageAgency.js: villageAgencyDaily + raid-take branch +
  _vaSimInner/_vaFamineAct/_vaStageRaidDefense (staging guard:
  _vaFamineAct returns early when pendingBeg or pendingRaidDefense
  is set, so a pending demand is NOT clobbered by a later staging).
- src/js/membership.js: endDay wrap (membershipDaily before original
  endDay body).
- src/js/hierarchy.js: membershipDaily wrap (hierarchyDaily first).
- src/js/villageAgency.js (WRAPS section): hierarchyDaily wrap
  (villageAgencyDaily after original hierarchyDaily).
- src/js/game.js: endDay() + the `scholar.day += 1` increment (AFTER
  the membershipDaily chain runs), tickAction's day-budget endDay
  call, sleep()'s tick loop.
- scripts/sim-harness.js: runDays loop (policy.daily, then sleep,
  inside `for (day = 1; day <= days ...)`).
- scripts/stockdoors-capture-raidday100.js: raid record day stamping
  (scholar.day at _removePantryKcal time).
- scripts/analyze-raidday100-b.js: lastSnapDay + raid100 definitions.
Corpora (read-only, never re-spent, never overwritten):
- evidence/2026-10-27/sim-raidday100-b-screen-corpus/ (40 files,
  seeds 10100-10139) — demand lines ("Shouts from the treeline") and
  take lines ("didn't wait") in raidSayLines, plus raidRecords.
- evidence/2026-10-27/sim-raidday100-b-screen-census.json.
Recorder run (the ONLY new compute this arm runs): one seed from the
screen corpus (10133, the known day-100 demand seed), 100 days,
competent-nofeast policy, read-only villageAgencyDaily wrap logging
(day, pendingBefore day, pendingAfter day, take-branch evaluation)
plus treeline say lines for cross-check against that seed's corpus
file. No new seed band is screened, no judged sweep is run, and no
new seed spend is judged until this code-read verdict lands.

## Base rule (NO pin — current master HEAD at prereg time)

Base: current master HEAD at prereg time:
6995ba7e6f34fb8c4ad2e6fc05f6bc2c6b6440b2. NO base pin. If the worktree
HEAD moves between prereg and evidence, report the move; do not
silently judge on a new base.

## Policies + horizon (recorder run only)

Policies: competent-nofeast exactly as raidday100
(COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
FEASTSCALE_R13 off). Horizon: 100 days, death-aware (seed 10133
survived in the screen corpus; if the recorder run ends early, that
is itself a finding, not a re-run trigger — report it).

## Proof (must be GREEN before evidence commits)

scripts/test-day100raid-code-b.js proves, by its own reads:
1. Chain: each link of endDay -> membershipDaily -> hierarchyDaily ->
   villageAgencyDaily exists in the cited files (string + ordering
   checks, line numbers reported).
2. Branch: the raid-take branch in villageAgencyDaily has no day
   guard beyond `day > pr.day`, and staging runs before it in the
   same function (so a same-call take is impossible, and a day-99
   demand fires on the first day-100 call).
3. Increment ordering: `scholar.day += 1` in game.js endDay comes
   after the membershipDaily chain (wrap runs membershipDaily before
   the original endDay body), so the day-100 endDay's take is dated
   100.
4. Loop ordering: runDays calls policy.daily (snapshot) before
   sleep (endDay) inside the same loop iteration, so the day-100
   take is post-snapshot.
5. Corpus reconciliation: 53 demands / 52 takes over the screen
   corpus; every matched pair satisfies take == demand + 1; the
   single hanging demand is seed 10133, day 100; no demand dated 99
   exists in the screen.
6. Recorder run: a day-100 villageAgencyDaily call is observed on
   seed 10133, and the recorder's demand/take days reproduce that
   seed's corpus pattern (demands 64/68/72/100, takes 65/69/73).
7. Analyzer leg: raid100 counts records with r.day === lastSnapDay,
   so a day-100 take on a surviving seed counts.
8. Hygiene: zero src/js modified, zero sibling files modified, no
   modified tracked file outside this run's own files.

## Reachability + sense (reported, not judged)

Waves 1-5, regional/national/table/win on the recorder seed —
reported honestly even when 0. Village assessment in plain words.
Sense note: the 10133 day-100 demand line quoted (the "Shouts from
the treeline" staging line that never got its take within the run),
and the 10109 day-99 take line quoted, checked against the ledger
records (numbers must match, as raidday100's did), or an explicit
statement that the take is silent in the captured transcript.

## Balanced panel (MEASUREMENT.md §15)

This arm changes no lever and no game code, so there is no
before/after to panel — exactly as raidday100 stated. The recorder
run (instrument on) vs the screen corpus (instrument off, same seed
10133, same policy/base/horizon) is the instrument before/after:
demand/take days must reproduce exactly.

## Metric review (pre-declared)

If GO fails only because the recorder run cannot observe a day-100
call (e.g. the seed's day-100 endDay never fires due to a
sleep-refusal/wake-early path), that is UNSETTLED, not UNREACHABLE:
the code-read answer stands, but the dynamic proof is missing, and
the next arm should run the recorder on a seed whose day-100 endDay
does fire. Do not re-score the static chain as a substitute for the
missing observation, and do not claim REACHABLE on static evidence
alone if clause (a1)'s recorder leg fails.
