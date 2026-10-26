# sim-food-economy-round-1630-b — coordinator evidence

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1630Z,
axis food-economy (second non-converged axis). Loop A live on
scale-onramp for the whole run (1615Z flip73676 claim, NOT touched).
This run takes the 1529Z next blanks in order: (1) garden bar revision,
(2) the preserve-scheduling question. Both arms measurement only:
zero src/js, no default flips. Merged locally, pending ship (ship loop
owns bumps, pushes, live verification).

## Arm 1 — sim-gardenbar-b (538a85b80, rebased from 50a0c993a): GO

Pre-registered bar (brief in goal hidden_files/arm-briefs-20261026/
gardenbar-b-brief.md, written before sweeping): fresh band,
competent-nofeast, SEATDRIVE=0, seeds 9760–9767, 100d death-aware.
Primary metric combined (a)+(b) share of seed-days with pre/post-first-
sow phase split. GO threshold: combined >= 95% AND (a) concentrated
pre-first-sow, (b) dominant post-first-sow. Do NOT re-judge the
gardenstate corpus — this arm swept fresh seeds.

Result: GO. Raw (a)+(b) = 800/800 = 100.0% of seed-days; phase split
exact (140/140 pre days = (a), 660/660 post days = (b)); ripe-at-
end-of-day 0/800; 'Garden harvest' stock inflow 0. The gardenstate
bar revision is confirmed on fresh seeds: the garden's 100-day story
has exactly two states ("nothing sown yet" then "sown but never ripe
at end of day") and no third.

Wall (band facts): national 0/8, table 0, wins 0, wave 4 0/8,
wave 5 0/8, median survival 100d capped (all 8 seeds survived to
day 100). Deaths 18, none starvation.

Sense (from arm evidence): garden days read sensibly — named rotating
keepers, honest lines ("90 days to first harvest"). What reads odd is
the system behind the lines: full-pantry throttle engaged on 98.6% of
garden resolutions (up from 89.3% in gardenstate); NPC sows 11 across
8 seeds, all on one seed; one seed in eight (9766) never sowed at all
despite daily keeper turns and a granted Green Thumb. Documented,
not fixed — throttle intent is Steve's call.

Metric review (arm's own): cascade reading kept alongside raw for
comparability — under gardenstate cascade precedence (a)+(b) = 81.3%,
because 150 post-sow days carry a deposit-door garden inflow
(same-day ripen-and-player-harvest, invisible to end-of-day
snapshots). The two bars answer different questions; this arm was
pre-registered on the raw one and passes it. No metric revision
proposed beyond keeping both readings side by side.

Proof: scripts/test-gardenbar-b.js re-run by the coordinator on the
rebased branch and post-merge base — PROOF PASS (8/8 valid, counts
sum, seed 9760 re-run byte-identical).

## Arm 2 — sim-preservesched-b (4183ba361, rebased from c0e3f3025): GO

Pre-registered bar (brief in goal hidden_files/arm-briefs-20261026/
preservesched-b-brief.md): analysis of the COMMITTED inflow-b /
inflowtrail corpora (no fresh sweep — the corpora already carry
preserve-action day + per-cook-line trigger state, so the brief's
fresh-sweep condition did not trigger). Primary metric: lag to most
recent inflow day + the scheduling rule behind each racks-bound day.
GO threshold: one named rule explains >= 80% of racks-bound days'
timing. Provenance NOT re-judged (closed by inflowtrail: 38/38
unattributed days had inflow within trailing 4 days).

Result: GO — 36/38 = 94.7% explained by the named rule
SPOIL-CLOCK + RACKS-FULL: a racks-bound day fires when preserved
stock is at/over the cook's rack cap AND an about-to-rot surplus
(spoilDay within 2 days, not spoiled) sits in the pantry. Stock-door
arrivals carry spoilDay = arrival + 3, so they are never eligible on
arrival day — the cook smokes yesterday's pantry, never today's haul,
so a bound day with no inflow of its own is the normal case, not an
anomaly. Every trigger leg measured 38/38; attributed days also lag
<= 2 days to prior inflow on 284/289 (98.3%). Base rate: 13.7% of
band days have no inflow vs 11.6% of bound days — bound days are NOT
disproportionately no-inflow days.

Residuals (2/38, named): seed 9750 days 83–84 (lags 3–4) after a 4-day
inflow gap — either a granary-shifted clock (haven tier >= 3 gives
+3) or older non-stock pantry items ripening into the window; the
corpus records no stack spoilDays or haven tier, so the two
candidates cannot be separated. Neither reopens provenance.

Wall (corpus band): national 0/8, table 0, wins 0, wave 4/5 0/8,
median survival 100d censored (9751 lost day 48, 9754 day 97),
deaths 43 (arena 15, starvation 7). Arc/regional stages are not in
this corpus and were not estimated.

Sense (from arm evidence): reads sensibly as village behavior —
seed 9755 day 43, Otto smokes 3 batches, says the racks are full
(20,320 kcal), leaves the pile for dinner, while Alfredo is
redirected at the treeline because the shelves hold ~26 days of
fresh. Caveat recorded: a "racks-bound day" is not a "nothing
smoked" day — 11/38 days have a worked line (cook smokes first,
then hits the cap).

Metric review (arm's own): verdict judged against the pre-registered
80% bar, not re-scored; coverage sits far inside the bar. Out-of-arm
observation appended to sim-findings.md (not chased): first-bound-
line fresh-days snapshots run up to 249.8 days — worth its own look
before citing fresh-days figures.

Proof: scripts/test-preservesched-b.js re-run by the coordinator on
the rebased branch — PROOF GREEN (all measurements reproduce exactly).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
scale-wall.json --current 'evidence/2026-10-26/sim-gardenbar-b-corpus/
*.json' --metrics national,table,wins,exiled`: 3 LOUD lines
(national 12->0, table 16->0, wins 16->0). All the known SEATDRIVE=0
regime/ingestion artifact class — the gardenbar band runs no seat
instruments, so national/table/wins are 0 by construction against a
WINSEAT baseline. Baseline NOT rolled, no new investigation item.
Balanced panel not attached (cannot ingest recorder corpora; paired
identical-seed tables are the comparison of record, as in prior runs).

## Infrastructure (loud)

- Container EPERM flap hit preservesched registration for ~30 min
  (failed worktree adds, packed-refs write denied; stray branch at
  master with zero unique commits left standing). Nothing forced:
  registration succeeded once writes cleared, and the worker was
  spawned only then. The flap also killed a background retry loop
  (SIGTERM ~21 min) and denied appends to its log file.
- A first retry loop was buggy (piped the register script through
  `tail`, so tail's exit code masked the script's failure and it
  reported success while unregistered). Corrected: success is judged
  on the script's actual path output, and the false success was not
  carried forward.
- Gardenbar's first merge attempt correctly refused ff-only after
  master moved (loop A 1615Z round f97b3d09a + journey-landing r57
  cdf962f4f). A premature release marked the tree done-merged
  before the merge existed; the coordinator restored the registry
  entry to active, re-attached the worktree, rebased, re-proved, and
  only then merged and released properly. No false record remains.
- Safe-commit index clobber hit the preservesched worker commit
  (repaired via HEAD-blob cacheinfo; commit verified correct).
  No clobber on either coordinator merge or this evidence commit
  (verified via clean `git status` after each step).
- check.js --quick NOT re-run by the coordinator: zero src/js
  landed; sibling loop-A eggroad tree live; attributable evidence
  is the arm proofs on the merged base.

## Convergence

food-economy stays converging (NOT converged): the garden bar
revision is confirmed and the preserve-scheduling question is
closed with a named rule — but no food-economy game-code fix has
landed from either arm, and the scale wall is untouched by this
axis. scale-onramp stays converging (untouched; sibling loop A).
Next blanks, in order: (1) throttle garden-branch intent — Steve's
call (weeding-only branch + never-sown village); (2) fresh-days
snapshot scope (up to ~250 days — check what pantryFreshDays counts
before citing fresh-days figures); (3) preserve-scheduling residual
pair (granary-shifted clock vs older stock — needs stack spoilDays
+ haven tier in the instrument); (4) presence-aware share bar +
next diversity arm; (5) plain-silenced indistinguishability;
(6) rule-R voice taxonomy rebuild; (7) scholar-donation visibility.
Claim deleted; lock deleted.
