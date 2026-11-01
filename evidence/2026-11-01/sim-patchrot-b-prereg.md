# sim-patchrot-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, axis food-economy, arm sim-patchrot-b.
Worktree sim-patchrot-b, branch sim-patchrot-b. This is the 1725Z
next-blank (4), first item in evidence order: the regrow /
patch-rotation follow-up to sim-haulsize-b. Policy-side arm ONLY: a
NEW policy file scripts/policies/competent-patchrot-b.js, default
OFF, ZERO src/js changes, ZERO edits to scripts/policies/
competent.js, ZERO policy-default flips, plus one additive
panel-registry line in scripts/sweep-compare.js (multisweep
precedent; zero behavior change to existing entries). Route
blockage is NOT bundled: gates stay OFF exactly as in haulsize /
multisweep, and no detour/clearing lever rides this arm. This
worker's prereg is NOT a re-run of multisweep's prereg. This
worker does NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator: committed on
branch, pending coordinator merge.

## Question (from sim-haulsize-b)

Haulsize's pilot: 160/240 days (67%) end with zero successful
forage, classified FAILED_WORKED_OUT on 8/8 seeds (share 1.0) —
reached patches are cell-picked-clean (tile stock does not
deplete on a sweep, so the same tiles keep appearing as
candidates while their cells stay unharvestable, detail regrow
~2 days) and onward travel is often blocked. The competent trip
chooses nearest-first, so it re-tries yesterday's picked-clean
patch first, every day. Does a policy that ROTATES away from
recently-worked ground cut the failed-trip rate?

## Frozen rotation rule (one sentence; the exact rule is this arm's design call, frozen here)

A tile the scholar foraged on scholar-day D counts as RESTING
on days D and D+1 (age < 2 scholar-days, the ~2-day regrow
window) and is deprioritized for forage-target choice on those
days, returning to full standing at age >= 2 days; the candidate
menu is never filtered, only reweighted.

Mechanism (policy-side only): during competent.daily only, the
wrapper returns travelTargets entries with `d` inflated by +99
for resting tiles. forageTripSeedFirst sorts candidates by
(blocked, effective distance), so among unblocked candidates a
fresh tile sorts ahead of a resting one; the trip tries up to 3
candidates, so resting ground is still tried when fewer than 3
fresh candidates exist. Blocked-first ordering is untouched.
Visited tracking lives in the run's policy ctx: every forage
doAction during daily (success OR failure — a worked-out patch
is picked clean either way) records its tile and scholar day.
A forage call on a resting tile counts as a stale attempt (the
trip fell back to resting ground). Known spillovers, accepted:
walkTo ignores `d` (own Manhattan distance), so it is unaffected;
nearestRubble picks by min `d`, so a resting rubble tile may lose
a stoneRun to a farther fresh one; the feast patrol sorts by
descending `d`, so a resting tile may look farther and enter its
top-4 — the patrol runs only while feasted, and
COMPETENT_FEAST=0 in this substrate. Changing game regrow
numbers would be a game-code arm needing separation: NOT done
here, and NOT smuggled in through the policy (the policy reads
the ~2-day window as a preference, it does not change regrow).

## Substrate (fixed, matches the haulsize pilot exactly)

Competent policy vs competent-patchrot-b, 30 days,
DEPOSITGATE=0 (keep 2,000). Env (FATAL if violated on the judged
CLI path): COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=0, POLICY=competent|competent-patchrot-b, DAYS=30.
The * =1 flags barred in packcomp (COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND,
WOODCARRY, WOODWARM, MORNINGCARRY, WINDOWCARRY, STRANDFIX,
PRESSB, FEDEVENING) must NOT be 1. Fresh seed band only: pilot
51901-51908, control 51909 (instrument proof + determinism,
never counted in any judged band), confirm reserve 51921-51932
(never run by this arm unless the pilot GOES, and only after a
freshness re-scan). Never reuse 511xx/512xx/513xx/514xx/515xx/
518xx. Freshness method: seed-field scan of
evidence/2026-11-01/*.jsonl before the pilot (51901-51908 and
51921-51932 absent from every seed field on 2026-11-01; the
51821-51832 multisweep confirm band is reserved, never run, and
is NOT taken by this arm).

## Instrument (scripts/patchrot-b-driver.js, count-only wrappers)

Adapted from the multisweep driver (same substrate, same
count-only doctrine): per loopDay, day-start snapshot, every
travelTo + doAction('forage') call (with say lines, tele cells,
inventory deltas), trip-end snapshot when a walk home lands on
the haven after a successful forage, every returnToVillage call
(packcomp rule: live = Game.over false at entry), and the
patchrot ctx counters at day end (per-day deltas of stale
attempts, forage attempts, penalized menus; visited-tile count).
The driver NEVER moves the scholar: wrappers count only. The
policy wrapper itself captures the driver's wrappers as its
origins and restores them in a finally (multisweep precedent).

## Primary metric + GO threshold (divergence-aware; judge exactly against this)

PRIMARY (judged as a PAIR — the multisweep lesson, decided
BEFORE the run, not after):
  (a) failed-trip day share = pooled failed-trip days / pooled
      loopDays (failed = >= 1 forage attempt, 0 successes, the
      haulsize day-shape definition). GO needs armed share <=
      baseline share - 0.10 (10 percentage points).
  (b) mean daily haul = band mean of seed mean-daily-hauls
      (mean over loopDays of day-row edible + shelled kcal, the
      multisweep definition). GO needs armed >= baseline (not
      down — no tolerance: "not down" means not down).
PILOT GO (to confirm): BOTH (a) and (b) pass AND both cost bars
pass. Then CONFIRM on 12 fresh seeds (51921-51932, after a
freshness re-scan) under the same rules; CONFIRM GO requires the
same pair + cost bars.
COST BARS (both required): median survival (inst.daysAlive)
armed >= 0.8x baseline; starvation deaths armed <= baseline + 1.
PILOT NO-GO: any leg of the pair or any cost bar misses. Then
NO confirm spend, no re-score, evidence only. Finished-pack
value at returns and unload are DIAGNOSTICS ONLY in this arm:
they are reported, and they never rescue a primary miss (the
multisweep primary/diagnostic disagreement is exactly why this
arm's primary is the failed-trip share plus haul, not finished
packs).

## Balanced panel (section 15) — combined panel pre-declared

Single-policy panels can never match a new-policy arm
(multisweep lesson, proven: formal compare returns decision
"invalid", "Unmatched policies" / "Unmatched cases"). The
instrument for this arm is ONE COMBINED panel: both policies,
same seeds, same days, run as a single balance-panel campaign
(`node scripts/balance-panel.js --policies
competent,competent-patchrot-b --seeds 51901,...,51908 --days
30`, subject to the tool's own flag spelling — the exact
invocation is recorded in the evidence file, and if the tool
refuses the combined run, that refusal is reported, not worked
around by fabricating a compare). The combined panel's compare
.md is attached to the evidence file. Panel survival/death
definitions differ from the driver's judged cost bar (multisweep
precedent), so panel numbers are context, never verdict.

## Sense test (SENSE-TESTING LAW)

At least one transcript slice read for meaning in the evidence
file: does a rotated trip read as a person choosing fresh
ground ("step to another green patch" with a reason), or as a
robot marching a grid pattern? A rotation that works but reads
as a grid march is a sense finding to report, not a win to hide.
Note anything robotic, including any day where the rotation
skips a visibly good patch for a worse one with no narration.

## Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section. No metric,
threshold, seed, or rule may change mid-run; doubts go there for
the NEXT run.

## Commit order (this file + skeletons BEFORE any judged sim)

This prereg, scripts/policies/competent-patchrot-b.js,
scripts/patchrot-b-driver.js, scripts/analyze-patchrot-b.js,
scripts/test-patchrot-b.js (pure checks + live-control/det
paths), and the one additive sweep-compare registry line are
committed FIRST. The pilot (51901-51908) runs only after that
commit lands. The live control / determinism runs (51909) run
after the prereg commit too — they are instrument proof, not
judged seeds, and their numbers never enter a judged band.
