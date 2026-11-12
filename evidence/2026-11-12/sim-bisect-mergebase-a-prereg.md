# Survival-collapse bisect MERGE-BASE leg — pre-registration (arm sim-bisect-mergebase-a)

Run fleshout-20261112T0815Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, ROUND 4). ADOPTION of the dead
0715Z run — this arm never started there, so this leg runs the full
leg fresh. Written and committed BEFORE any judged sim. Base:
`d229b58f5` ("Version bump 2294ef815-20261108-112829 (batch ship)",
the Nov-8 merge-base of `5157782a4` and `a628aeaf3` — verified at run
start: `git merge-base 5157782a4 a628aeaf3` returns `d229b58f5`;
`git rev-parse HEAD` is `d229b58f5` and `git status --short` is empty).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on the MERGE-BASE of the PR stack to cut the
collapse window at the base BEFORE Cursor's PRs #118–121. It changes
no game code and builds nothing.

## The question

Round 2 (merge-a) verdict was COLLAPSE_INSIDE_MERGE (merge
`e4dbe581b`: 1/8 survived). Round 3: first parent `203a32775` 4/8
INCONCLUSIVE, reconciled master `743e07d87` 1/8 COLLAPSE_CONFIRMED.
Round 4, origin leg: second parent `a628aeaf3` 2/8 ORIGIN_COLLAPSED
— the collapse IS on the origin side alone — plus a rank stall
(regional 0/8) with no pre-registered metric. This arm (ROUND 4,
merge-base leg) runs the same 8 seeds on the merge-base itself,
`d229b58f5`, the base the PR stack was built on. It answers: is the
collapse already written in the base BEFORE the PRs, or does it
arrive with the PRs?

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-merge leg (seeds 190391–190398) | merge `e4dbe581b` | **1/8** | **126d** |
| bisect-firstparent leg (seeds 190391–190398) | first parent `203a32775` | **4/8** | **150d** |
| bisect-reconciled leg (seeds 190391–190398) | reconciled `743e07d87` | **1/8** | **126d** |
| survivalcontrol (seeds 190391–190398) | current master `d33ca69f9` | **1/8** | **126d** |
| bisect-origin leg (seeds 190391–190398) | second parent `a628aeaf3` | **2/8** | **90d** |
| this merge-base leg (seeds 190391–190398) | merge-base `d229b58f5` | **?** | **?** |

## The fix-swap (read carefully — this base predates the roster-check fix)

At `d229b58f5`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
verified at run start — byte-identical to the origin base's
pre-fix file; NO "ROSTER CHECK" marker). The r131 roster-check fix
(`5d16916f4`) is NOT an ancestor of this base, so the driver's
leg-guard would refuse this base as-is. Following the vetphantom-b
swap pattern (evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and
the merge-a / origin-a preregs: the FIX `standing.js` is extracted
with `git show 5157782a4:src/js/standing.js`, its sha256 verified to
be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the merge-base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/bisect-mergebase-driver-20261111.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the merge-base `standing.js` in exactly two hunks: the ROSTER CHECK
  (`if (roster.indexOf(vid) < 0) return false;`) and the
  sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the merge-base predates. On this base the
  blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by grep
  on the base — zero matches), and the fix `standing.js` itself
  never calls `this.villageBlooded()` — the wave-5 damage /
  survivability hookup lives in `fieldFights.js` / `game.js` on
  local master, which the merge-base does not have. So the only live
  behavioral delta the swap introduces is the roster check. The
  driver's end-of-run `blooded` read is a report field only (the
  fix file defines `villageBlooded()`, so the read returns a value;
  it records that the village *would* be blooded under the local
  rule, not that any fight was blooded). Same standing as origin-a.
- **Ladder scholar rule differs across the sides.** The merge-base's
  `ladder.js _ladderLivingVeterans` is the old inline rule (`vp &&
  !vp.dead`, no roster check) with the scholar COUNTED as always
  living — verified by reading the function at `d229b58f5`. The
  origin base `a628aeaf3` carries the same old inline rule; the
  merge base `e4dbe581b` differs again: its ladder NEVER counts the
  scholar (LEG 3 tribute scholar-readiness fix). `5157782a4`/master
  use the shared `countLivingVeterans` (roster check + scholar
  counts, commit `3995d21d6`). The proof test detects which rule the
  LOADED game carries from `_ladderLivingVeterans` source and
  asserts the matching count; the survival read comes from the
  harness end state, not the ladder.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
merge-base `d229b58f5` (with the fix swapped in)**, vs the
vetphantom fix leg's 6/8 (median 150d).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **MERGEBASE_HEALTHY** — the collapse is NOT written in the base before Cursor's PR stack #118–121; it arrives with the PRs (the bisect steps into the PRs next) |
| **≤2/8 survive** | **MERGEBASE_COLLAPSED** — the collapse IS already written in the base BEFORE the PRs — the bisect steps further back, before Nov 8 |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a bigger band or a re-trace is owed before bisecting further |

**Rank read (pre-registered alongside survival — the origin leg's
§7 metric note): regional reach on the same band**, vs the
vetphantom fix leg's 8/8 regional and the origin leg's 0/8 regional
(rank stall, unjudged there). This leg JUDGES rank, not merely
reports it:

| Outcome | Rank verdict |
|---|---|
| **≥5/8 regional** | **REGIONAL_INTACT** — link/regional formation works on the base |
| **≤2/8 regional** | **RANK_STALL** — the rank stall is already in the base before the PRs |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

The analyzer (`scripts/bisect-mergebase-analyze-20261111.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave-5 unlocks;
national/table/wins; standing range; tribute-ready days; phantom
days (0 expected — the roster-check fix is swapped in); blooded
count from the summary JSON.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, the reconciled, and the origin legs.** A control/bisect cut
  re-runs the same seeds on old code; that is the point of a bisect,
  not a freshness violation. The seed-band freshness rule exists to
  stop re-using a band as if it were a fresh measurement; this arm
  explicitly re-uses it as a matched control and says so here, in
  the prereg, before any sim. Same justification as the
  survivalcontrol, anchor, merge, firstparent, reconciled, and
  origin preregs.
- **Policy: competent verbatim, SINGLE leg on the merge-base, mode
  `fix` only** (with the swap — see above). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `d229b58f5` vs `5157782a4`
    differs ONLY by the counter-answer block (env-gated OFF by
    default — inert unless `COUNTER_ANSWER=1`, which this run does
    not set). No garden change on this side.
  - vs `a628aeaf3` (origin leg) it differs ONLY by the garden
    plot-ordering change (29 lines: the origin base appoints the
    garden keeper BEFORE making plots; the merge-base makes plots
    first). A minor confound against the origin leg's 2/8, recorded
    here, not a blocker.
  - vs `203a32775` (firstparent) it is BYTE-IDENTICAL — the
    merge-base vs firstparent comparison differs only in game code.
  - vs `e4dbe581b` (merge) it differs only by the same garden
    ordering change.
  - `scripts/sim-harness.js` differs from `5157782a4`/master only by
    the opt-in `sourcePatch` hook (identity by default; this driver
    does not use it), so the master-copied driver runs unchanged on
    this base.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; byte-identical to master, sha256 `311f105b…`; deleted
  before finishing) + the driver's live shadow old-rule count per
  snapshot, exactly as vetphantom-driver and merge-driver. Driver:
  `scripts/bisect-mergebase-driver-20261111.js` — a copy of
  bisect-origin-driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-mergebase-a/`, RUN =
  `bisect-mergebase-pilot`, arm = `bisect-mergebase`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  Analyzer: `scripts/bisect-mergebase-analyze-20261111.js`. Proof:
  `scripts/test-bisect-mergebase-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-mergebase-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-mergebase-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this merge-base leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a, and origin-a.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap is the ONE permitted uncommitted file during the run.
  After the run, the original `standing.js` is restored
  byte-identical (sha256 `98c8bfad70d7…`) and `git status` must show
  no `src/js` modification before the evidence commit. If the
  restore fails, FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (survivalcontrol
  MASTER_CHANGE, anchor, mournblooded, merge-a
  COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled
  COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED) — it cuts at the
  merge-base only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `d229b58f5` IS the merge-base of `5157782a4` and
  `a628aeaf3` (verified by `git merge-base`); `203a32775` is an
  ANCESTOR of `5157782a4` (their merge-base is `203a32775` itself),
  not the reverse — do not assume a linear order between the healthy
  base and the local merge-tip.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
