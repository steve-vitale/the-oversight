# sim-food-economy-round-1041 — run fleshout-20261105T1041Z (axis food-economy)

Run: fleshout-20261105T1041Z. Axis food-economy (converging). Loop B live on
scale-onramp throughout (0930Z claim, sim-approachlive-b + sim-triggerbuild-b)
— NOT touched; B's approachlive arm landed as f72e4bd16 mid-run. Master
f72e4bd16 → 0a782af00. Pre-flight clean (main tree clean, disk 30%, reaper
removed nothing sibling-owned). Claim written before any sims; lock created at
run start, deleted at closeout.

## Arm 1 — sim-exphurt-land-a: DUPLICATE, verified already landed, no new work

The arm brief was written from backlog line 1699's 1836Z update ("SPEC-READY
for a LAND arm") without checking the 2115Z tracker entry, which had already
landed it. The worker verified rather than redoing: commits 1a715818b
(prereg), 16f2c0640 ([needs-eyes] hook), 570daa9c5 (evidence + corpus) are all
ancestors of master; hook present at src/js/villager-agency.js:710
("hurt on the way home", hp 1..7); evidence
evidence/2026-11-04/sim-exphurt-land-a.md verdict GO LAND, M1 0/17 → 17/17;
proof scripts/test-exphurt-land-a.js 115/115 green (re-run by the worker this
session). Coordinator independently re-verified all three commits in master,
the hook line, and the evidence verdict. Nothing to merge, push, bump, or
ship. The worker's tree was released done-merged and its branch deleted
(zero new commits). Coordinator lesson, owned: check the LATEST tracker entry
for an axis before briefing an arm from a backlog line — a SPEC-READY note
from hours earlier may already be landed.

## Arm 2 — sim-bankadded-substrate-a: NO-GO-NON-UNANIMOUS, lever reverted (none to revert; instrument only)

Probe-given-food leg (instrument-only, zero src/js) judges the narrow
bank-added-edible retention case on a staged substrate. Commits 1a69195c6
(prereg + instrument) / 47fa1c1f6 (addendum) / 091f9479d (analyzer fix) /
ec25d5b42 (evidence) / 0ad94e023 (corpus), rebased onto master twice
(45c134fab, then 3f14110d1), proof 58/58 green on the rebased tree and
re-run by the coordinator after the final rebase. Corpus
evidence/2026-11-05/sim-bankadded-substrate-a-corpus/ (8 files, 0 instrument
errors). Evidence evidence/2026-11-05/sim-bankadded-substrate-a.md.

Verdict: 14 distinct judged bank-band added events (13 staged + 1 genuine —
seed 17063 reproduced exactly, loopDay 13, +325, RETAINED), 6 retained / 8
VANISHED, 0 censored. The substrate WORKED (the prior arm's 1-in-64 rarity
beaten many times over) but unanimity fails. The 8 VANISHED have a traced
mechanism, not a retention failure: food eaten as a morning meal by a hungry
scholar BEFORE the instrument's first-upkeep snapshot fires, in the
sleep-refused path. Sleep refuses at clock ≥ 449 (fewer than 64 ticks
remain), so the day rolls during the next loop-day's wait — after upkeep #1
has run. Upkeep #1 runs competentEat (eats from the pack while kcal < 0.85 ×
kcalCap, trigger 2040); the snapshot fires at upkeep #2, after the meal.
Evening kcal splits exactly at the trigger (retained 2181–2270, all ≥ 2040,
no pre-snapshot eat; vanished 0–1510, all < 2040, eat fires). Dispositions:
morning-phase-eaten 2, upkeep-eaten 4 (the other 2 VANISHED are the same
upkeep-eat shape). The overnight retention mechanism never failed once; the
snapshot's timing did. No game bug is claimed.

Instrument history: the 1-seed pilot exposed wait-to-band as mechanically
impossible (waits snap to part boundaries, never land on 449 — 11 waits,
275 → 128); fixed via committed addendum (advancer is rest +96 ticks +
forage presses +16, with a day-roll guard). Before/after proof on identical
seed 17063 reproduces the genuine event exactly and stages loopDay 14.
Analyzer fix: injected-stack identity counts by (key, spoilDay) — 17025/33
now reads 18/18 (a carried same-key stack swept at dawn had made it read
8/18); verdicts unchanged. Press-added kind never fired (0 events); 17029
staged 0 of 2 stranded evenings (press-null on a foraged-clean patch;
combat on the other). Sense-test: retained food confirmed as injected
grapes by stack identity (18/18) plus the "You eat Muscadine Grapes
(320 kcal)" morning line; staged evenings read honestly as rests.

Metric review: the prereg's unanimity bar assumed the snapshot saw the
morning. It does not in the sleep-refused path. Proposed revision for the
NEXT run (recorded in the evidence, not applied here): snapshot the pack at
every upkeep call and classify pre-snapshot upkeep eats as
retained-then-eaten, then re-judge these 14 events rather than re-staging —
no third census is needed. Backlog line 1750 marked fixed (substrate
delivered and worked); new open item appended for the snapshot fix +
re-judgment.

## Arm 3 — sim-sweepcount-a: GO — LAND (one-line narration lever, [needs-eyes])

Dawn spoil sweep line now states the unit count on every removal. Commits
f6ac3a91a (prereg + instrument, adopted + verified from the dead first
worker) / e578c47e1 ([needs-eyes] lever) / a896ea5e8 (evidence) /
ac5ae15a0 (corpus) / 0a782af00 (evidence hash updates), rebased onto master
twice (45c134fab, then 0ad94e023), proof instrument verified by the
coordinator on the rebased tree (seed 15376 Stage A + Stage B, TAG=after:
anchorOk, formNamed, countNamed all true). Corpus
evidence/2026-11-05/perseed-sweepcount-a/ (53 files, 0 instrument errors,
anchorOk 53/53, Stage-B integrity 32/32). Evidence
evidence/2026-11-05/sim-sweepcount-a.md.

Lever: one line in src/js/food.js sweepSpoiled() — a removed stack's name is
prefixed with its unit count when units > 1. The line now reads: "Overnight,
12 unknown berries went bad — beyond saving. You leave it for the flies."
Singular stacks keep existing wording (verified: "Overnight, 3 smoked fish;
cooked rabbit went bad…"). No rewording of the form-naming, no change to the
it/them tail, pantry line, or corpse-rot line; no gates, prices, or deed bars
touched. Canon checked: docs/PRESERVATION.md prescribes the ladder but no
sweep wording — the count is an addition to the established form-naming.

Count-naming rate (primary metric, GO ≥ 0.80, denominator = removal events):
pilot, matched before/after, band 15376–15383 — Stage A 0/6 → 6/6, Stage B
(real endDay() dawn) 0/6 → 6/6, delayed-day follow-ups (15380 @16, 15383 @12)
0/2 → 2/2; pilot total 8/8 events, 14/14 stage-runs. Fresh-seed confirm,
band 15400–15407 (freshness-checked against all dated preregs — 1509 distinct
seeds collected, none of 15400–15407 in any — plus the forbidden-band lists):
8/8 removal events, 15/15 stage-runs state the count. Combined after: 16/16
events, 29/29 stage-runs; before: 0/8. Form-naming intact 6/6 before and
after (no regression on the spoilname verdict). Sense test: the count reads
naturally in the real dawn transcript; the singular/multi-stack probe
behaves. check.js --quick: run 1 282/8, run 2 284/6; all 6 named failures
re-run against unmodified baseline food.js and fail there too — pre-existing,
none caused by this change (no test in the suite pins the old "Overnight,"
wording). Backlog line 1742 marked fixed. Open, deliberately untouched: the
pantry spoil line names its stack but carries no unit count — separate
channel/voice, new open backlog item appended for a future arm if Steve
wants parity there.

## Wall

Not re-measured this run (narration/measurement arms; neither corpus records
scale outcomes). Carried state: 0915Z run, 24 distinct seeds — wins 0/24,
national 0/24, table 0/24, wave-5 0/24, readiness-5-ready days 0/24.

## Telemetry deviation check

Run on the bankadded corpus
(evidence/2026-11-05/sim-bankadded-substrate-a-corpus/*.json): 3 LOUD lines
(national 12 → 0, table 16 → 0, wins 16 → 0). EXPLAINED, not a regression —
recorder/probe corpus shape (bank-retention diagnostics on 8 seeds, 60d;
per-seed files carry no national/table/wins fields, so they read as 0), the
same class as 0415Z/0815Z/0330Z/0830Z/0915Z. Baseline NOT rolled, no compare
fabricated, no investigation item. The sweepcount corpus is the same shape
(spoil-narration, 53 files, no scale fields); not re-run, same verdict.

## Infrastructure

- Platform outage ~11:19Z: a service restart killed BOTH first workers with
  a transport error ("sqlx error: pool timed out while waiting for an open
  connection") and interrupted a coordinator exec mid-flight. Recovery was by
  direct worktree/branch inspection, not assumption: bankadded left zero
  commits and zero files; sweepcount left one untracked 173-line instrument
  (adopted by the re-dispatch after a green verification run). Both arms
  re-dispatched into their existing worktrees and completed. No work was
  re-run, re-merged, or re-done blind.
- Registration took ~32 min (3 × ~10-min checkouts, ~9 GB written each)
  under load from sibling lanes (journey check.js runs + Loop B landing).
- Safe-commit index clobber hit ALL 5 bankadded commits AND all 5
  sweepcount commits; cacheinfo-from-HEAD repair worked every time, commits
  always correct. The clobber rate (10/10 commits this run) deserves a look
  by whoever owns safe-commit.sh. safe-commit.sh does NOT accept directory
  paths — the sweepcount corpus commit needed an expanded 53-file list.
- Master moved 3 times under the run (ship bump 45c134fab, journey r104
  3f14110d1, arm merges); both landed branches rebased clean with zero file
  overlap, proofs re-run green after every rebase and on merged master.
- No EPERM flap this run.

## Metric review

- bankadded: unanimity bar assumed the snapshot saw the morning; it does
  not in the sleep-refused path. Revision proposed for the next run (snapshot
  at every upkeep call; pre-snapshot upkeep eats count as
  retained-then-eaten; re-judge the 14 events, no re-staging).
- sweepcount: metric held as pre-registered; no revision proposed.
- exphurt-land: n/a — duplicate of landed work.

## Next blanks, in order

1. Bank-added snapshot fix + re-judgment of the 14 events (new backlog item;
   no third census).
2. Pantry spoil line unit-count parity (new backlog item; Steve's call on
   whether the channel wants it).
3. Gossip-targeted census on stranded scholars (backlog line 1739 — do
   haven-gossip lines fire inside stranded windows?).
4. Homebound scholar, starving village (backlog line 1719 — 14/16 seeds
   never leave haven in 30 days while the village starves).
5. Player-away hurt-return silence (backlog line 1723 — documented gap from
   exphurt; hook does not cover it).

food-economy stays converging (NOT converged): two narration blanks closed
(sweep count landed; exphurt-land verified landed), one measurement blank
decomposed (bank-added substrate works; the snapshot, not retention, binds),
no food-economy game-number change landed. scale-onramp untouched (sibling
Loop B). Rotation left at 3 (convergence work does not cycle it).

Merged locally, pending ship: bankadded 0ad94e023, sweepcount 0a782af00,
coordinator evidence this commit. No push, no bump, no live verification
(ship loop owns deploys). Main tree clean after every merge. All three worker
trees released done-merged (exphurt-land-a released with zero new commits),
worktrees removed, branches deleted. Claim retired to .DEAD; lock deleted.
