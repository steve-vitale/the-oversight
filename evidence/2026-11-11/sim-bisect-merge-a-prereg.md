# Survival-collapse bisect MERGE-CUT — pre-registration (arm sim-bisect-merge-a)

Run fleshout-20261111T2317Z, Loop B, axis scale-onramp / winnability
chain (tracker 2030Z next blank 1 — the survival-collapse bisect,
ROUND 2). Written and committed BEFORE any judged sim. Base:
`e4dbe581b` (the reconcile-divergence merge: "Merge origin/master
into local master (divergence reconciliation, Steve-approved
2026-11-10)"; read fresh from the worktree at run start with `git
log --oneline -1`).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on the MERGE base to cut the collapse window
at the merge itself. It changes no game code and builds nothing.

## The question

Round 1 established: the vetphantom fix leg (base `5157782a4`)
survived 6/8; the anchor leg on `3f136f07e` survived 1/8 with a
corpus sha-identical to survivalcontrol's — exonerating
mournblooded and moving the collapse window to `5157782a4..3f136f07e`,
which contains the ENTIRE reconcile merge (22 src/js files, +4,677
insertions: villager-brain +1,061, objectives +613, godverbs +587,
titans +427, …). A sibling arm is re-running the control on
`5157782a4` (the true vetphantom measurement base, expect 6/8).
This arm (ARM E) cuts the window at the merge itself: run the same
8 seeds on the merge commit `e4dbe581b`.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-anchor leg (seeds 190391–190398) | `3f136f07e` (journey r126) | **1/8** | **126d** |
| survivalcontrol (seeds 190391–190398) | current master `d33ca69f9` | **1/8** | **126d** |
| this merge-cut (seeds 190391–190398) | merge `e4dbe581b` | **?** | **?** |

## The fix-swap (read carefully — this base predates the roster-check fix)

At `e4dbe581b`, `src/js/standing.js` is the PRE-FIX version (sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
verified at run start). The r131 roster-check fix (`5d16916f4`) is
NOT an ancestor of this base, so the survivalcontrol driver's
leg-guard would refuse this base as-is. Following the vetphantom-b
swap pattern (evidence/2026-11-11/sim-vetphantom-b.md §9–§10): the
FIX `standing.js` is extracted with `git show
5157782a4:src/js/standing.js`, its sha256 verified to start with
`f8fda4295a99` (full sha
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`),
swapped in UNCOMMITTED, run, then the merge's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `git status` showing no `src/js`
modification. The `standingSha` in use is recorded per seed in the
corpus. The swap keeps the comparison apples-to-apples: every leg in
this bisect runs WITH the roster check. **The swapped file itself is
never committed.** The driver (`scripts/bisect-merge-driver-20261111.js`)
refuses to run unless the on-disk `standing.js` carries the
"ROSTER CHECK" marker AND its sha256 is exactly the fix sha — an
unswapped run is refused loudly, never mislabeled.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar) and Steve's 2026-11-10 scholar-counts ruling. No canon
doc covers survival-collapse attribution; nothing here invents
canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
merge base `e4dbe581b` (with the fix swapped in)**, vs the
vetphantom fix leg's 6/8 (median 150d).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **COLLAPSE_POST_MERGE** — the merge is exonerated; the collapse sits after it (journey r126 + post-merge landings) |
| **≤2/8 survive** | **COLLAPSE_INSIDE_MERGE** — the collapse is inside the merge (its second-parent content); the bisect steps into the merge's 22 src/js files next |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a bigger band or a re-trace is owed before bisecting further |

The analyzer (`scripts/bisect-merge-analyze-20261111.js`) judges
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
  vetphantom, survivalcontrol, and the anchor.** A control/bisect
  cut re-runs the same seeds on old code; that is the point of a
  bisect, not a freshness violation. The seed-band freshness rule
  exists to stop re-using a band as if it were a fresh measurement;
  this arm explicitly re-uses it as a matched control and says so
  here, in the prereg, before any sim. Same justification as the
  survivalcontrol and anchor preregs.
- **Policy: competent verbatim, SINGLE leg on the merge base, mode
  `fix` only** (with the swap — see above). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; deleted before finishing) + the driver's live shadow
  old-rule count per snapshot, exactly as vetphantom-driver and
  survivalcontrol-driver. Driver:
  `scripts/bisect-merge-driver-20261111.js` — a copy of
  survivalcontrol-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-merge-a/`, RUN =
  `bisect-merge-pilot`, arm = `bisect-merge`, mode fixed to `fix`
  only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha). Analyzer:
  `scripts/bisect-merge-analyze-20261111.js`. Proof:
  `scripts/test-bisect-merge-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-merge-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-11/bisect-merge-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this merge-cut on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7
and anchor-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap is the ONE permitted uncommitted file during the run.
  After the run, the original `standing.js` is restored
  byte-identical (sha256 `75762cb2259d…`) and `git status` must show
  no `src/js` modification before the evidence commit. If the
  restore fails, FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge the survivalcontrol verdict
  (MASTER_CHANGE stands), the anchor verdict
  (ANCHOR_NOT_REPRODUCED stands), or the mournblooded verdict
  (exonerated stands) — it cuts at the merge only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop B body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, survivalcontrol-b, and anchor-a).
  Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
