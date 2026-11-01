# sim-entrywindow-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-entrywindow-b. Worktree sim-entrywindow-b, branch
sim-entrywindow-b. This is the entry-window follow-up to
sim-fertrot-b (PILOT NO-GO 2030Z): whole-tile harvestable-cell
counts do NOT predict sweep success (95% of failed attempts on
both fertrot arms happened on tiles showing 6+ available cells),
because one sweep tests only the 3x3 window around the
scholar's entry cell (travelTo sets mx/my to the entry cell)
while the count covers the whole 9x9 tile. Fertrot's metric
review orders the next signal to be ENTRY-WINDOW, not
tile-window, and orders its harm case (seed 60108: reshuffle
strands the scholar west of a washed-out creek, 15 day-start /
18 day-end away days vs 0/0, scholar starves twice) to be
judged on every future rotation arm. Policy-side arm ONLY: a
NEW policy file scripts/policies/competent-entrywindow-b.js,
default OFF, ZERO src/js changes, ZERO edits to
scripts/policies/competent.js, ZERO policy-default flips, plus
one additive panel-registry line in scripts/sweep-compare.js
(fertrot precedent; zero behavior change to existing entries).
Patchrot rotation NOT bundled, fertrot fertility NOT bundled,
route gates NOT bundled, multi-sweep NOT bundled — this arm is
the entry-window signal alone, so any effect is attributable
to it. This worker does NOT push, bump, verify live, or merge
into master; the coordinator merges. Status to coordinator:
committed on branch, pending coordinator merge.

## Question (from sim-fertrot-b's metric review)

Fertrot proved the whole-tile count cannot separate failing
from succeeding attempts. Does a rotation keyed to the
ENTRY-WINDOW count — the 3x3 around the entry cell, the ground
one sweep actually works — cut failed trips WITHOUT shrinking
the haul? And first: is the entry cell even knowable at menu
time, or does it depend on the path taken in a way the menu
cannot see?

## STAGE 1 — KNOWABILITY: YES, with two qualifications (measured, not asserted)

Read first (code paths, game.js unless noted): the sweep
(doAction 'forage': `const mx = scholar.mx ?? 4, my =
scholar.my ?? 4`, then the 3x3 loop around mx/my, skipping
scorched cells and cells in t.detailRegrow); travelTo (entry
computation: `odx = sign(x - map.px)`, `ody = sign(y -
map.py)`; `entryX = odx > 0 ? 0 : odx < 0 ? 8 :
clamp9(oldMx)`, same for Y with oldMy; then
`findWalkableEntry(x, y, entryX, entryY)` sets mx/my);
findWalkableEntry (deterministic BFS: nominal entry if
walkable with an exit, else nearest walkable cell with an
exit, pocket fallback, (4,4) last resort — NO RNG anywhere in
the path; genDetail is detailSeed/detailRand-seeded, and for a
tile whose detail already exists it returns the cache without
regenerating); forageTripSeedFirst (policies/competent.js:
sorts candidates by (blocked, effective distance), tries up
to 3, calls doAction('forage', {}) with NO cx/cy — so the
sweep does NOT move the scholar, and the sweep's micro cell
IS the travel entry cell).

FINDING: the entry cell for the trip's FIRST candidate is
exactly knowable at menu time — it is a pure function of
(current tile, current micro cell, destination, destination
detail), all readable at the travelTargets call. The census
instrument verified this empirically, not just by reading:
predicted entry == actual entry on 457/457 compared forage
travels (100%), and sweep micro cell == travel entry cell on
486/486 attempts. QUALIFICATION 1 (chain): candidates 2-3
enter from the PREVIOUS candidate's tile, not from the trip
origin (travel refused -> scholar stays at origin; sweep
failed -> scholar stands at the previous tile's entry cell,
since the sweep moves nothing). A static menu ranking can
therefore only carry the FROM-CURRENT-POSITION entry window:
exact for try 1, an approximation for tries 2-3. The pilot
below judges whether that approximation moves the pair — the
rule does not pretend otherwise. QUALIFICATION 2
(first-visit): a tile with no detail at menu time has no
honestly computable entry window — computing it would call
genDetail, whose first visit ALSO strips cells and mutates
stock (a side effect, not a read). First-visit tiles are left
exactly alone. Census bound: 29/486 attempts were first-visit
travels (predicted null), 14 of them failures — so the most
a visited-only rule could ever prevent is 330 of 344
failures, and only if the chain approximation holds.

## STAGE 2a — PREDICTOR CENSUS (measured BEFORE this rule was frozen)

Instrument scripts/entrywindow-b-driver.js /
scripts/analyze-entrywindow-b.js, baseline competent only,
fertrot's band re-run with the new instrument (60101-60108,
30d, DEPOSITGATE=0 — a re-run of an already-used band, so no
fresh seed is consumed; the instrument is count-only and the
re-run reproduces fertrot's baseline EXACTLY: failed-trip
share 0.342, mean daily haul 763.2, finished-pack 990.7,
unload 36,060, 486 attempts both runs). Per-attempt pre-sweep
entry-window harvest count (3x3 around the entry cell,
sweep's own test INCLUDING the sweep-time scorched read, which
is correct at sweep time because the scholar stands on the
tile):

| entry-window harvest | attempts | successes | rate |
|---|---|---|---|
| 0 | 344 | 0 | 0.000 |
| 1-2 | 97 | 97 | 1.000 |
| 3+ | 45 | 45 | 1.000 |
| unknown (no window) | 0 | — | — |

SEPARATION IS PERFECT, not merely good: ZERO failed attempts
had a non-empty window (failWindowGt0 = 0), and ZERO
succeeding attempts had an empty window. Failure reasons:
341 worked_out, 3 nothing_in_reach, 0 pack_full (pack-full
would break the identity; it did not occur). By attempt
ordinal: 1st tries 224 attempts (168 empty-window, all
failed); later tries 262 attempts (176 empty-window, all
failed). Whole-tile comparison on the same attempts:
fertile (6+) 466 attempts, 140 successes, rate 0.300 —
fertrot's non-predictor, reproduced. The predictor separates
on BOTH ordinals, so the rule is frozen: the task's
"if and only if the predictor separates" condition is met
with the strongest possible margin.

## Frozen rule (one sentence; the exact rule is this arm's design call, frozen here)

During competent.daily only, a tile the scholar has itself
worked whose entry window FROM THE SCHOLAR'S CURRENT POSITION
currently holds ZERO harvestable cells sorts as 99 steps
farther for forage-target choice; every other tile is left
exactly alone — no fertile bonus, no filtering.

Mechanism (policy-side only): during competent.daily only,
the wrapper returns travelTargets entries with `d` inflated
by +99 for empty-entry-window worked tiles. The window is
computed by replicating travelTo's entry formula +
findWalkableEntry BFS on the tile's EXISTING detail only
(never genDetail), then counting the 3x3 around that entry
with the sweep's test (forageable cell, not in detailRegrow,
species cell or tree/bigtree deadfall via
Game.cellPlantSpecies). forageTripSeedFirst sorts candidates
by (blocked, effective distance), so among unblocked
candidates an empty-window tile sorts last; the trip tries
up to 3 candidates, so empty-window ground is still tried
when fewer than 3 better candidates exist. Blocked-first
ordering is untouched. DELIBERATE DEVIATION FROM FERTROT: no
-1 fertile bonus. The census shows a non-empty window always
pays, so a bonus could only reshuffle paying tiles — the
fertrot harm pattern (its -1 fired on nearly every menu and
merely reshuffled nearest-first order). This rule only
demotes certain failures. Known spillovers, accepted: walkTo
ignores `d` (own Manhattan distance), so it is unaffected;
nearestRubble picks by min `d`, so an empty-window rubble
tile may lose a stoneRun to a farther tile; the feast patrol
sorts by descending `d`, so an empty-window tile may look
farther and enter its top-4 — the patrol runs only while
feasted, and COMPETENT_FEAST=0 in this substrate. Caveats
built into the signal, not hidden: (1) SCORCH: the sweep
excludes scorched cells, but cellScorched is
current-tile-relative — at menu time the scholar stands on
the origin tile, so a candidate's scorch cannot be read
honestly through that API, and this rule does NOT read
state.scorch directly (that would be a second, unverified
knowledge channel). The rule therefore counts a scorched cell
as harvestable; scorch is rare, and any overcount biases
toward trying, not skipping. The census predictor DID
exclude scorch (sweep-time read) and still separated
perfectly, so this caveat can only cost occasional tries,
never the rule's direction. (2) CHAIN: the ranked value is
the from-current-position window (stage-1 qualification 1).
(3) VISITED = WORKED: visited means foraged during this run
(fertrot's tracking); tiles merely walked through are left
alone even though their detail exists — conservative, and a
future variant may test the wider set. (4) FIRST-VISIT:
unvisited tiles are untouched (stage-1 qualification 2).

## Substrate (fixed, matches the fertrot pilot exactly)

Competent policy vs competent-entrywindow-b, 30 days,
DEPOSITGATE=0 (keep 2,000). Env (FATAL if violated on the
judged CLI path): COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=0,
POLICY=competent|competent-entrywindow-b, DAYS=30. The * =1
flags barred in packcomp (COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND,
WOODCARRY, WOODWARM, MORNINGCARRY, WINDOWCARRY, STRANDFIX,
PRESSB, FEDEVENING) must NOT be 1. Fresh seed band only:
pilot 60121-60128, control 60109 (instrument proof +
determinism, never counted in any judged band). Never reuse
511xx/512xx/513xx/514xx/515xx/516xx/518xx/519xx/520xx/601xx
pilot band 60101-60108 (census re-run band, not a pilot band).

SEED-BAND NOTE (verify-first, as tasked): pilot 60121-60128
was verified fresh BEFORE the pilot (not merely suggested):
single-pass rg scans of ALL of evidence/ for the seed field
in both spellings ("seed":N and "seed": N) over 60121-60128
returned ZERO hits, and the same scan over 60129-60132
returned ZERO hits; bare-number matches in old October files
are substrings of longer numbers (e.g. s94912), not seed
fields. The .md mentions of 60121-60132 are reserve mentions
only: fertrot's prereg/evidence name 60121-60132 as its
confirm reserve ("stays fresh, never run"), and the
coordinator round note repeats the reserve — no .md reports
a run on these seeds, and no jsonl carries them as a seed
field. That is the band this arm runs. CONFIRM BAND (if the
pilot GOES): NOT pre-claimed here — 60129-60132 is only 4
seeds, so a 12-seed confirm needs a fresh band scan at
confirm time; the confirm run must re-verify before running
and record the band in its own evidence, never reuse this
pilot band.

## Instrument (scripts/entrywindow-b-driver.js, count-only wrappers)

Adapted from the fertrot driver (same substrate, same
count-only doctrine): per loopDay, day-start snapshot (now
including micro position), every travelTo (with
menu-time predicted entry vs actual entry, detail-present
flag, destination type) + doAction('forage') call (with say
lines, tele cells, inventory deltas, pre-sweep whole-tile
signal AND pre-sweep entry-window signal, failure reason read
off the sweep's own lines, attempt ordinal, and the travel's
predicted/actual entry), trip-end snapshot when a walk home
lands on the haven after a successful forage, every
returnToVillage call (packcomp rule: live = Game.over false
at entry), and the entrywindow ctx counters at day end
(per-day deltas of penalized menus and empty-window tiles).
The driver NEVER moves the scholar: wrappers count only.
The policy wrapper itself captures the driver's wrappers as
its origins and restores them in a finally (patchrot
precedent). The prediction replication in the driver reads
EXISTING detail only and never calls genDetail.

## Primary metric + GO threshold (divergence-aware pair, fertrot precedent)

PRIMARY (judged as a PAIR — same bars as fertrot, for
comparability):
  (a) failed-trip day share = pooled failed-trip days / pooled
      loopDays (failed = >= 1 forage attempt, 0 successes, the
      haulsize day-shape definition). GO needs armed share <=
      baseline share - 0.10 (10 percentage points).
  (b) mean daily haul = band mean of seed mean-daily-hauls
      (mean over loopDays of day-row edible + shelled kcal, the
      multisweep definition). GO needs armed >= baseline (not
      down — no tolerance: "not down" means not down).
  Pooled mean daily haul is reported alongside the mean-of-
  means (patchrot metric review). JUDGE: the mean-of-means,
  as in fertrot — the pooled figure is diagnostic only and
  never rescues a mean-of-means miss.
PILOT GO (to confirm): BOTH (a) and (b) pass AND both cost
bars pass. Then CONFIRM on 12 fresh seeds (band TBD by fresh
scan, see seed-band note) under the same rules; CONFIRM GO
requires the same pair + cost bars.
COST BARS (both required): median survival (inst.daysAlive)
armed >= 0.8x baseline; starvation deaths armed <= baseline + 1.
SECONDARY (judged as a cost signal, fertrot 60108 lesson):
away day-ends (days ending away from the haven) armed must
not exceed baseline by a stranding-shaped margin — reported
per seed, and ANY seed showing the 60108 shape (armed away
day-ends >= 10 while baseline is 0, with starvation deaths)
fails the arm even if the pair passes, because a rule that
improves trips while stranding the scholar is worse than
neutral. The formal bar: armed band total away day-ends <=
baseline total + 5 AND no seed with armed starvation deaths
above baseline + 1 (already a cost bar) — the per-seed
away-day table is the evidence, and a 60108-shaped seed is
called out by name in the evidence file whether or not it
trips the formal bar.
PILOT NO-GO: any leg of the pair or any cost bar misses.
Then NO confirm spend, no re-score, evidence only.
Finished-pack value at returns and unload are DIAGNOSTICS
ONLY in this arm: they are reported, and they never rescue a
primary miss. SECONDARY (reported, never verdict): the
pre-sweep entry-window predictor census on each arm (does
the armed leg's window distribution shift toward paying
windows, and does prediction stay 100%?). An engagement
floor is pre-registered for interpretability: the pilot is
uninterpretable as a signal test (not a NO-GO on the pair —
the pair still judges) if band-wide penalized menus total <
10 on the armed leg, i.e. the rule barely engaged; that case
is reported as "uninterpretable — rule did not engage"
alongside the pair verdict.

## Balanced panel (section 15) — combined panel pre-declared

Single-policy panels can never match a new-policy arm
(multisweep lesson, proven: formal compare returns decision
"invalid", "Unmatched policies" / "Unmatched cases"; fertrot
applied the same lesson). The instrument for this arm is ONE
COMBINED panel: both policies, same seeds, same days, run as
a single balance-panel campaign (`node scripts/balance-panel.js
--policies competent,competent-entrywindow-b --seeds
60121,...,60128 --days 30`, subject to the tool's own flag
spelling — the exact invocation is recorded in the evidence
file, and if the tool refuses the combined run, that refusal
is reported, not worked around by fabricating a compare).
The combined panel's compare .md is attached to the evidence
file. Panel survival/death definitions differ from the
driver's judged cost bar (fertrot precedent), so panel
numbers are context, never verdict.

## Sense test (SENSE-TESTING LAW)

At least one transcript slice read for meaning in the
evidence file: does an entry-window-ranked trip read as a
person choosing ground that looks good, or as a robot
marching a grid pattern? In particular: is the rotation
choice narratively visible or invisible (fertrot's was
invisible; this arm checks whether the signal changes that),
and is any stranding narratively marked (fertrot's 60108
stranding was unmarked — no "can't get home" line)? This arm
ADDS NO NARRATION — it reports visibility only.

## Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section. No
metric, threshold, seed, or rule may change mid-run; doubts
go there for the NEXT run.

## Commit order (this file + policy + instrument BEFORE any judged sim)

This prereg, scripts/policies/competent-entrywindow-b.js,
scripts/entrywindow-b-driver.js,
scripts/analyze-entrywindow-b.js, scripts/test-entrywindow-b.js,
the one additive sweep-compare registry line, and the stage
2a census outputs
(evidence/2026-11-01/sim-entrywindow-b-census-baseline.jsonl,
sim-entrywindow-b-census-analysis.json) are committed FIRST.
SEQUENCING, STATED HONESTLY: the stage 2a census is
measurement, not a judged sim — it ran (baseline only,
fertrot's already-used band, no fresh seed consumed) BEFORE
this prereg was written, because the task orders the rule to
be frozen ONLY IF the predictor separates, and the separation
had to be measured first. What this commit guarantees is
stronger than the usual order in the one respect that
matters: NO JUDGED SIM (no pilot seed, no armed leg) has run
before this commit, and none runs until after it. The proof
test (pure + live-control + live-det on non-judged seed
60109) is re-run AFTER this commit and BEFORE the pilot.
The pilot (60121-60128) runs only after that commit lands.
