# sim-routeblock-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-routeblock-b.
Worktree sim-routeblock-b, branch sim-routeblock-b. This is the 1725Z
next-blank (1), first item in evidence order: the route-blockage
follow-up to sim-haulsize-b, left open by sim-patchrot-b. Policy-side
arm ONLY: a NEW policy file scripts/policies/competent-routeblock-b.js,
default OFF, ZERO src/js changes, ZERO edits to
scripts/policies/competent.js, ZERO policy-default flips, plus one
additive panel-registry line in scripts/sweep-compare.js (patchrot /
multisweep precedent; zero behavior change to existing entries).
Rotation (patchrot) is NOT bundled and multi-sweep is NOT bundled —
this arm is the gates alone, so any effect is attributable to the
gates. This worker does NOT push, bump, verify live, or merge into
master; the coordinator merges. Status to coordinator: committed on
branch, pending coordinator merge.

## Question (from sim-haulsize-b, via sim-patchrot-b)

Haulsize's pilot: 160/240 days (67%) end with zero successful
forage, classified FAILED_WORKED_OUT on 8/8 seeds, with onward
travel often blocked; patchrot cut the failed-trip share but not
the haul, and left this blank open: do the route-around /
standing-home gates (currently OFF in the foraging path) change
failed-trip rates and stranding on identical seeds?

## The gates exist — what turning them ON changes (read in competent.js 2026-11-01)

The gates are NOT invented by this arm. They already exist in
scripts/policies/competent.js as env switches, default OFF, and
this arm's new policy file only flips them during competent.daily
(and restores the previous env values in a finally). Exactly:

1. COMPETENT_ROUTE_AROUND=1 (competent.js routeAround, tuning
   2026-10-15): any walkTo refused step triggers a BFS
   route-around over travelBlockage-clean orthogonal steps,
   walking the first step of the found path. Without it walkTo
   stops dead at the refused step. This affects ALL walkTo
   callers (trips, stone runs, vine seeks, feast patrol), not
   just returns — a stated spillover, not a hidden one.
2. COMPETENT_TRIPHOME_ROUTE_AROUND=1 (creekpath Arm B,
   walkHome): forage-trip return legs run walkTo with the detour
   flag set for that leg only; detour steps actually taken are
   banked in ctx.tripHomeDetours. Without it returns use plain
   walkTo and stop dead at a refusal.
3. COMPETENT_STANDING_HOME=1 (creekpath Arm C retry,
   goHomeStanding, end of daily()): a villager who ends the day
   away from the haven — tile check ALONE, not the
   playerAtHaven narration gate — not inside a tent, with the
   haven on this board, walks home via walkHome (so with gate 2
   also on, the standing walk detours). Banks
   ctx.standingHomeDays / ctx.standingHomeDetours. Without it
   there is NO standing go-home rule: the villager simply stays
   away, even starving with a clear hop home (creekpath 10772
   day 11 precedent).

FALLBACK when a gate cannot help: route-around returns false
when no BFS path exists and walkTo stops exactly as with the
gate OFF; goHomeStanding's guards skip (game over, combat,
tent, haven not on board). ON permits detours; it never forces
movement. The three gates ride TOGETHER as one arm: they are one
mechanism family (detour HOW x2 + standing WHEN), and the task
names them jointly ("the gates alone"). Per-gate decomposition
is diagnostic only, via the counters: tripHomeDetours (return
legs) vs standingHomeDays/Detours (standing rule). General
walkTo route-around steps (stone runs, vine seeks, feast
patrol) are NOT banked by competent.js, so their engagement is
not counted separately — a stated caveat, not a number this arm
invents.

## Frozen arm (one sentence)

During competent.daily only, all three gates are ON; outside
that window the baseline policy object is byte-identical.

## Substrate (fixed, matches the haulsize / patchrot / multisweep pilots exactly)

Competent policy vs competent-routeblock-b, 30 days,
DEPOSITGATE=0 (keep 2,000). Env (FATAL if violated on the judged
CLI path): COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=0, POLICY=competent|competent-routeblock-b, DAYS=30.
The * =1 flags barred in packcomp (WOODCARRY, WOODWARM,
MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING) must
NOT be 1. The three routeblock gates must NOT be 1 in the OUTER
env on either leg (the armed policy sets them itself during
daily; outer =1 would contaminate the baseline leg) — the
driver enforces this. Fresh seed band only: pilot 52001-52008,
control 52009 (instrument proof + determinism, never counted in
any judged band), confirm reserve 52021-52032 (never run by
this arm unless the pilot GOES, and only after a freshness
re-scan). Never reuse 511xx/512xx/513xx/514xx/515xx/516xx/
518xx/519xx. Freshness method: seed-field scan of
evidence/2026-11-01/*.jsonl before the pilot (52001-52009 and
52021-52032 absent from every seed field on 2026-11-01; no
520xx filenames and no 520xx prereg mentions), plus the task's
consumed-band list (51311-51330, 51601-51608, 51801-51808,
51901-51908; reserves 51821-51832 and 51921-51932 belong to
other arms and are NOT taken).

## Instrument (scripts/routeblock-b-driver.js, count-only wrappers)

Adapted from the patchrot driver (same substrate, same
count-only doctrine): per loopDay, day-start snapshot, every
travelTo + doAction('forage') call (with say lines, tele cells,
inventory deltas), trip-end snapshot when a walk home lands on
the haven after a successful forage, every returnToVillage call
(packcomp rule: live = Game.over false at entry), and the
routeblock ctx counters at day end (per-day deltas of
standingHomeDays, standingHomeDetours, tripHomeDetours) plus
day-start / day-end away flags (scholar tile != haven tile).
The driver NEVER moves the scholar: wrappers count only. The
policy wrapper itself captures the driver's wrappers as its
origins and restores them in a finally (patchrot precedent).

## Primary metric + GO threshold (divergence-aware pair, patchrot precedent)

PRIMARY (judged as a PAIR):
  (a) failed-trip day share = pooled failed-trip days / pooled
      loopDays (failed = >= 1 forage attempt, 0 successes, the
      haulsize day-shape definition). GO needs armed share <=
      baseline share - 0.10 (10 percentage points).
  (b) mean daily haul = band mean of seed mean-daily-hauls
      (mean over loopDays of day-row edible + shelled kcal, the
      multisweep definition). GO needs armed >= baseline (not
      down — no tolerance: "not down" means not down).
PILOT GO (to confirm): BOTH (a) and (b) pass AND both cost bars
pass. Then CONFIRM on 12 fresh seeds (52021-52032, after a
freshness re-scan) under the same rules; CONFIRM GO requires the
same pair + cost bars.
COST BARS (both required): median survival (inst.daysAlive)
armed >= 0.8x baseline; starvation deaths armed <= baseline + 1.
PILOT NO-GO: any leg of the pair or any cost bar misses. Then
NO confirm spend, no re-score, evidence only.
SECONDARY (reported, never verdict): stranding = day-end away
days (endAway) and day-start away days (startAway), band totals
and per-seed. A stranding improvement does NOT rescue a primary
miss; a stranding worsening on a primary GO is a caveat in the
evidence, not a silent pass. Finished-pack value at returns and
unload are DIAGNOSTICS ONLY in this arm: reported, never
rescuing a primary miss.

## Balanced panel (section 15) — combined panel pre-declared UP FRONT

Single-policy panels can never match a new-policy arm
(multisweep lesson, proven: formal compare returns decision
"invalid", "Unmatched policies" / "Unmatched cases"; patchrot
applied the same lesson). The instrument for this arm is ONE
COMBINED panel: both policies, same seeds, same days, run as a
single balance-panel campaign (`node scripts/balance-panel.js
--policies competent,competent-routeblock-b --seeds
52001,...,52008 --days 30`, subject to the tool's own flag
spelling — the exact invocation is recorded in the evidence
file, and if the tool refuses the combined run, that refusal is
reported, not worked around by fabricating a compare). The
combined panel's compare .md is attached to the evidence file.
Panel survival/death definitions differ from the driver's
judged cost bar (patchrot precedent), so panel numbers are
context, never verdict.

## Sense test (SENSE-TESTING LAW)

At least one transcript slice read for meaning in the evidence
file: does a detour or a standing walk home read as a person
choosing to go around / head home ("step to another green
patch" with a reason, a walk home at day's end), or as a robot
marching a grid pattern? A gate that works but reads as an
invisible teleport is a sense finding to report, not a win to
hide. Route-around the player cannot see being chosen is
invisible the same way multisweep second outings and patchrot
rotation were — quote what the player sees.

## Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section. No metric,
threshold, seed, or rule may change mid-run; doubts go there for
the NEXT run.

## Commit order (this file + skeletons BEFORE any judged sim)

This prereg, scripts/policies/competent-routeblock-b.js,
scripts/routeblock-b-driver.js, scripts/analyze-routeblock-b.js,
scripts/test-routeblock-b.js (pure checks + live-control/det
paths), and the one additive sweep-compare registry line are
committed FIRST. The pilot (52001-52008) runs only after that
commit lands. The live control / determinism runs (52009) run
after the prereg commit too — they are instrument proof, not
judged seeds, and their numbers never enter a judged band.
