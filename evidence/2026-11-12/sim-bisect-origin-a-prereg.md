# Survival-collapse bisect ORIGIN-CUT — pre-registration (arm sim-bisect-origin-a)

Run fleshout-20261112T0715Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, ROUND 4). Written and committed
BEFORE any judged sim. Base: `a628aeaf3` ("Merge pull request #121
from steve-vitale/cursor/ove-161-capable-seed-65", the origin/master
tip merged by `e4dbe581b`; verified at run start with `git log
--oneline -1` after resetting this run's branch to it — the worktree
arrived checked out at master tip `ef836057c`; the tree was clean and
that tip is on master, so the reset lost nothing).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on the ORIGIN side of the reconcile merge to
cut the collapse window at the merge's second parent. It changes no
game code and builds nothing.

## The question

Round 2 (merge-a) verdict was COLLAPSE_INSIDE_MERGE (merge
`e4dbe581b`: 1/8 survived). Round 3: first parent `203a32775` 4/8
INCONCLUSIVE, reconciled master `743e07d87` 1/8 COLLAPSE_CONFIRMED.
The merge's second parent is the prime suspect: `e4dbe581b` has
parents `203a32775` (first, local side) and `a628aeaf3` (second,
origin side — verified: `git log -1 --format=%P e4dbe581b`).
This arm (ROUND 4, origin leg) runs the same 8 seeds on the second
parent itself, `a628aeaf3`.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-merge leg (seeds 190391–190398) | merge `e4dbe581b` | **1/8** | **126d** |
| bisect-firstparent leg (seeds 190391–190398) | first parent `203a32775` | **4/8** | **150d** |
| bisect-reconciled leg (seeds 190391–190398) | reconciled `743e07d87` | **1/8** | **126d** |
| survivalcontrol (seeds 190391–190398) | current master `d33ca69f9` | **1/8** | **126d** |
| this origin-cut (seeds 190391–190398) | second parent `a628aeaf3` | **?** | **?** |

## The fix-swap (read carefully — this base predates the roster-check fix)

At `a628aeaf3`, `src/js/standing.js` is the PRE-FIX origin version
(sha256 `98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
verified at run start; NO "ROSTER CHECK" marker). The r131
roster-check fix (`5d16916f4`) is NOT an ancestor of this base, so the
driver's leg-guard would refuse this base as-is. Following the
vetphantom-b swap pattern (evidence/2026-11-11/sim-vetphantom-b.md
§9–§10) and the merge-a prereg: the FIX `standing.js` is extracted
with `git show 5157782a4:src/js/standing.js`, its sha256 verified to
start with `f8fda4295a99` (full sha
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`),
swapped in UNCOMMITTED, run, then the origin's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `git status` showing no `src/js`
modification. The `standingSha` in use is recorded per seed in the
corpus. The swap keeps the comparison apples-to-apples: every leg in
this bisect runs WITH the roster check. **The swapped file itself is
never committed.** The driver (`scripts/bisect-origin-driver-20261111.js`)
refuses to run unless the on-disk `standing.js` carries the
"ROSTER CHECK" marker AND its sha256 is exactly the fix sha — an
unswapped run is refused loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the origin `standing.js` in exactly two hunks: the ROSTER CHECK
  (`if (roster.indexOf(vid) < 0) return false;`) and the
  sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the origin base predates. On this base the
  blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by grep on
  the base), and the fix `standing.js` itself never calls
  `this.villageBlooded()` — the wave-5 damage/survivability hookup
  lives in `fieldFights.js` / `game.js` on local master, which the
  origin base does not have. So the only live behavioral delta the
  swap introduces is the roster check. The driver's end-of-run
  `blooded` read is a report field only. (Contrast with the merge-a
  leg, whose base already carried blooded, so its swap added only the
  roster check — the end state is the same on both legs: roster check
  live, blooded inert-or-absent.)
- **Ladder scholar rule differs across the three sides.** The origin
  base's `ladder.js _ladderLivingVeterans` is the old inline rule
  (`vp && !vp.dead`, no roster check) with the scholar COUNTED as
  always living. The merge base `e4dbe581b` differs again: its ladder
  NEVER counts the scholar (LEG 3 tribute scholar-readiness fix).
  `5157782a4`/master use the shared `countLivingVeterans` (roster
  check + scholar counts, commit `3995d21d6`). The proof test detects
  which rule the LOADED game carries from
  `_ladderLivingVeterans` source and asserts the matching count; the
  survival read comes from the harness end state, not the ladder.
  The ladder read only feeds the driver's end tribute field.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
origin base `a628aeaf3` (with the fix swapped in)**, vs the
vetphantom fix leg's 6/8 (median 150d).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **ORIGIN_HEALTHY** — the collapse is NOT on the origin side alone; it sits in the merge's second-parent content only in combination, or in the merge itself / after it |
| **≤2/8 survive** | **ORIGIN_COLLAPSED** — the collapse IS on the origin side — the bisect steps into PRs #118–121 next |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a bigger band or a re-trace is owed before bisecting further |

The analyzer (`scripts/bisect-origin-analyze-20261111.js`) judges
this rule and exits 0 only when it can classify the outcome under
it (any of the three verdicts is a classified outcome; exit 1 only
on instrument failure, corpus incompleteness, or an unclassifiable
read).

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave-5 unlocks;
national/table/wins; standing range; tribute-ready days; phantom
days (0 expected — the roster-check fix is swapped in); blooded
count from the summary JSON.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  both prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, and the reconciled legs.** A control/bisect cut re-runs
  the same seeds on old code; that is the point of a bisect, not a
  freshness violation. The seed-band freshness rule exists to stop
  re-using a band as if it were a fresh measurement; this arm
  explicitly re-uses it as a matched control and says so here, in
  the prereg, before any sim. Same justification as the
  survivalcontrol, anchor, merge, firstparent, and reconciled
  preregs.
- **Policy: competent verbatim, SINGLE leg on the origin base, mode
  `fix` only** (with the swap — see above). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy note: `scripts/policies/competent.js` is
  byte-identical between `a628aeaf3` and `e4dbe581b` (verified: empty
  diff), so this leg and the merge leg share the policy exactly. It
  differs from `5157782a4`'s only by the counter-answer block
  (env-gated OFF by default — inert unless `COUNTER_ANSWER=1`, which
  this run does not set) and a garden plot-ordering change — a minor
  confound against the 6/8 reference, recorded here, not a blocker.
  `scripts/sim-harness.js` differs from `5157782a4`/master only by
  the opt-in `sourcePatch` hook (identity by default; this driver
  does not use it), so the master-copied driver runs unchanged on
  this base.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; byte-identical to master, sha256 `311f105b…`; deleted
  before finishing) + the driver's live shadow old-rule count per
  snapshot, exactly as vetphantom-driver and merge-driver. Driver:
  `scripts/bisect-origin-driver-20261111.js` — a copy of
  bisect-merge-driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-origin-a/`, RUN =
  `bisect-origin-pilot`, arm = `bisect-origin`, mode fixed to `fix`
  only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  Analyzer: `scripts/bisect-origin-analyze-20261111.js`. Proof:
  `scripts/test-bisect-origin-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-origin-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-origin-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this origin-cut on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, and merge-a.

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
  COLLAPSE_CONFIRMED) — it cuts at the origin side only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `203a32775` is an ANCESTOR of `5157782a4` (their
  merge-base is `203a32775` itself), not the reverse — do not assume
  a linear order between the healthy base and the local merge-tip.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
