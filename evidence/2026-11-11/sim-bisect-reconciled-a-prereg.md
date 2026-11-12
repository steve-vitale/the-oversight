# Survival-collapse bisect RECONCILED-MASTER — pre-registration (arm sim-bisect-reconciled-a)

Run fleshout-20261112T0332Z, Loop A, axis scale-onramp / survival-collapse
bisect ROUND 3 (confirmatory leg). Written and committed BEFORE any judged
sim. Base: `743e07d87` (the SHIPPED reconciled master — "Merge-forward
master (3daa1a9b6) into reconcile-divergence (fresh pin-comparison base)";
the merge-forward of master into reconcile-divergence, the thing that would
actually ship — read fresh from the worktree at run start with `git log
--oneline -1`).

**Instrument-only arm — ZERO src/js changes committed.** This arm re-runs
one 8-seed band on the shipped reconciled master to answer whether the
collapse reproduces there, or whether the merge-cut collapse was an
artifact of the stale cut.

## The question

Round 2 (0215Z) cut the survival collapse to game code in
`5157782a4..3f136f07e`, but with an ancestry twist: `5157782a4` is NOT an
ancestor of the reconcile merge `e4dbe581b` — it descends from the merge's
first parent `203a32775` by 205 commits, and the merge was cut from stale
local master. The merge-cut leg survived 1/8; the vetphantom fix leg
survived 6/8. The collapse could be origin-side content (H1) or a
protective local commit the merge predates (H2). The merge-cut leg could
not distinguish them. This leg is the confirmatory leg on the SHIPPED
reconciled master `743e07d87`: does the collapse reproduce on the
reconciled master itself, or was the merge-cut collapse an artifact of
the stale cut?

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-merge leg (seeds 190391–190398) | merge-cut `e4dbe581b` | **1/8** | **126d** |
| bisect-policyswap leg (seeds 190391–190398) | `3f136f07e` code + old policy | **2/8** | **126d** |
| bisect-anchor leg (seeds 190391–190398) | `3f136f07e` | **1/8** | **126d** |
| survivalcontrol (seeds 190391–190398) | master `d33ca69f9` | **1/8** | **126d** |
| this reconciled leg (seeds 190391–190398) | reconciled master `743e07d87` | **?** | **?** |

## The fix status (established FIRST, before any sim)

The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of `743e07d87`
(verified at run start: `git merge-base --is-ancestor 5d16916f4
743e07d87` fails). `743e07d87` IS a descendant of the merge-cut
`e4dbe581b`, and its `src/js/standing.js` is the PRE-FIX version,
sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`
— byte-identical to the merge base's pre-fix file. So this leg runs
CLEAN with NO swap only if the fix is present — it is NOT present, so
the fix `standing.js` is swapped in UNCOMMITTED exactly as the merge-a
leg did (see the fix-swap note below), and the leg is run with the
swap, recorded per seed. **The fix must be present-and-controlled,
never committed as a game change.**

## The fix-swap (this base predates the roster-check fix)

At `743e07d87`, `src/js/standing.js` is the PRE-FIX version (sha256
`75762cb2259d…`, verified at run start). The r131 roster-check fix
(`5d16916f4`) is NOT an ancestor of this base, so the fix `standing.js`
(extracted with `git show 5157782a4:src/js/standing.js`, sha256
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`) is
swapped in UNCOMMITTED, run, then the reconciled base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `git status` showing no `src/js`
modification. The `standingSha` in use is recorded per seed in the
corpus. The swap keeps the comparison apples-to-apples: every leg in
this bisect runs WITH the roster check. **The swapped file itself is
never committed.** The driver (`scripts/bisect-reconciled-driver-20261111.js`)
refuses to run unless the on-disk `standing.js` carries the
"ROSTER CHECK" marker AND its sha256 is exactly the fix sha — an
unswapped run is refused loudly, never mislabeled.

## Policy — this leg does NOT swap policy

This leg uses `743e07d87`'s OWN `scripts/policies/competent.js`
(sha256 `3c40151e8dd4df69dde916a9df5d950da442b38b221752b148cded771887fb6d`
— the NEW policy carrying the OVE-160 garden-caretaker hunk, identical
to current HEAD's competent.js). The policy confound belongs to the
sibling swap leg (policyswap-a exonerated it: 2/8, and a literal no-op
on the control seeds 190392/190394/190396). No policy file is swapped,
touched, or committed by this arm.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
reconciled master `743e07d87` (with the fix swapped in)**, vs the
vetphantom fix leg's 6/8 (median 150d) and the merge-cut leg's 1/8.

| Outcome | Verdict |
|---|---|
| **≤2/8 survive** | **COLLAPSE_CONFIRMED** — the collapse reproduces on the shipped reconciled master; the bisect continues into the merge's second-parent content |
| **≥5/8 survive** | **RECONCILED_NO_COLLAPSE** — the reconciled master does NOT collapse; the merge-cut collapse was an artifact of the stale cut, and the next step is re-cutting the merge, not bisecting game code |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; say so, do not re-judge |

The analyzer (`scripts/bisect-reconciled-analyze-20261111.js`) judges
this rule and exits 0 only when it can classify the outcome under
it (any of the three verdicts is a classified outcome; exit 1 only
on instrument failure, corpus incompleteness, or an unclassifiable
read).

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave-5 unlocks;
national/table/wins; standing range; tribute-ready days; phantom
days (0 expected — the roster-check fix is swapped in); blooded
count from the summary JSON. Policy-insensitive control seeds
190392/190394/190396 (policyswap-a: bit-identical no-op on the garden
hunk) are checked first when judging candidates.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to all
  prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, merge-a, and
  policyswap-a.** A control/bisect cut re-runs the same seeds on old
  code; that is the point of a bisect, not a freshness violation.
  The seed-band freshness rule exists to stop re-using a band as if
  it were a fresh measurement; this arm explicitly re-uses it as a
  matched control and says so here, in the prereg, before any sim.
  Same justification as the survivalcontrol, anchor, merge-a, and
  policyswap-a preregs.
- **Policy: competent verbatim from `743e07d87` itself, SINGLE leg,
  mode `fix` only** (with the standing.js swap — see above). The
  driver refuses to run on the unswapped file (swap-aware leg guard:
  marker + exact fix sha).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused,
  unmodified — byte-identical to master, sha256 `311f105b…`; it does
  NOT exist at `743e07d87`, so it is restored from the branch as
  untracked scratch for the run, exactly as merge-a did at
  `e4dbe581b`, and deleted before finishing) + the driver's live
  shadow old-rule count per snapshot, exactly as vetphantom-driver
  and survivalcontrol-driver. Driver:
  `scripts/bisect-reconciled-driver-20261111.js` — a copy of the
  merge driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-reconciled-a/`, RUN =
  `bisect-reconciled-pilot`, arm = `bisect-reconciled`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha). Analyzer:
  `scripts/bisect-reconciled-analyze-20261111.js`. Proof:
  `scripts/test-bisect-reconciled-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-reconciled-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-11/bisect-reconciled-a-summary.json`.
- **Checkout pattern (as merge-a):** the worktree checks out
  `743e07d87` detached for the run (driver/analyzer/proof/
  instrument restored as untracked scratch via `git show <branch>`,
  fix standing.js swapped in uncommitted), runs the band, restores
  standing.js byte-identical, checks the branch back out, then
  commits evidence + corpus on the branch and rebases onto current
  master with the proof re-run green.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this reconciled leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a §7, and policyswap-a §7.

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
- This arm does NOT re-judge the vetphantom verdict (GO stands), the
  merge verdict (COLLAPSE_INSIDE_MERGE stands on its count), the
  policyswap verdict (POLICY_EXONERATED stands), or the anchor
  verdict — it cuts at the reconciled master only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies. If a game defect is found, DOCUMENT it, do not fix it —
  this is a bisect leg.
- Telemetry deviation check (Loop A body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a,
  merge-a, and policyswap-a). Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
