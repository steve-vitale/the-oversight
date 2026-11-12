# Survival-collapse confirm MERGE leg — pre-registration (arm sim-mcconfirm-merge-b)

Run fleshout-b-2026-11-12T03:29Z, Loop B, axis scale-onramp / winnability
chain. Written and committed BEFORE any judged sim. Base:
`e4dbe581b` (the reconcile-divergence merge: "Merge origin/master
into local master (divergence reconciliation, Steve-approved
2026-11-10)"; read fresh from the worktree at run start with `git
log --oneline -1`).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs the merge base on a FRESH 16-seed band to test whether the
merge-a collapse reproduces. It changes no game code and builds
nothing.

## The question

Loop A landed sim-bisect-merge-a (`52b7225d6`): the reconcile-merge
base `e4dbe581b` survived 1/8 on seeds 190391–190398 vs the
vetphantom fix leg's 6/8 on the same seeds — verdict
COLLAPSE_INSIDE_MERGE. That verdict rests on 8 matched seeds. This
arm (ARM: confirm) runs the SAME merge base on a FRESH band so the
coordinator can judge whether the collapse reproduces on fresh
seeds. The sibling control leg re-runs the same fresh band on the
vetphantom base (`5157782a4`, expect ~6/8 scaled to 16 seeds); the
joint verdict is the coordinator's read of both legs under the rule
below.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-merge-a (seeds 190391–190398) | merge `e4dbe581b` | **1/8** | **126d** |
| this confirm leg (seeds 190419–190434) | merge `e4dbe581b` | **?** | **?** |
| sibling control leg (seeds 190419–190434) | `5157782a4` | **?** | **?** |

## The fix-swap (read carefully — this base predates the roster-check fix)

At `e4dbe581b`, `src/js/standing.js` is the PRE-FIX version (sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
verified at run start). The r131 roster-check fix (`5d16916f4`) is
NOT an ancestor of this base, so the survivalcontrol driver's
leg-guard would refuse this base as-is. Following the vetphantom-b
swap pattern (evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and
the merge-a swap (evidence/2026-11-11/sim-bisect-merge-a.md): the
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
never committed.** The driver (`scripts/mcconfirm-merge-driver-20261111.js`)
refuses to run unless the on-disk `standing.js` carries the
"ROSTER CHECK" marker AND its sha256 is exactly the fix sha — an
unswapped run is refused loudly, never mislabeled.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + joint decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190419–190434 on the
merge base `e4dbe581b` (with the fix swapped in)**, vs the sibling
control leg's survived count on the same fresh band.

**JOINT decision rule** (same text as the sibling leg; the
coordinator reads both legs and calls it — this analyzer judges
THIS leg only: survived count, median via the same upper-median
convention as merge-a, completeness):

| Outcome | Verdict |
|---|---|
| merge survived ≤ control − 4 AND control ≥ 8/16 | **CONFIRMED** — the merge collapse reproduces on fresh seeds |
| merge survived ≥ control − 1 | **REFUTED** — the merge does not collapse on fresh seeds |
| otherwise | **INCONCLUSIVE** — neither confirmed nor refuted; a bigger band or a re-trace is owed |

where "merge" is this leg's survived count (0–16) and "control" is
the sibling control leg's survived count on the same fresh band
(0–16). The analyzer's `jointVerdict(merge, control)` export
implements exactly this rule and is proof-tested; its `main()`
leaves the joint verdict as `PENDING_CONTROL_LEG` until the control
leg is read. This leg's evidence file reports this leg's numbers
against the rule and does NOT claim the joint verdict.

**Secondary (reported, not judged):** median survival; death-cause
shares vs the merge-a combat-heavy profile (585/621 combat /
expedition / wild, starvation 0); wave-5 unlocks; national / table /
wins; standing range; tribute-ready days; phantom days (0 expected
— the roster-check fix is swapped in); blooded count from the
summary JSON.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to the
  merge-a band, so the survival counts are comparable in shape.
- **Seeds: 190419–190434 (16 seeds) — FRESH.** Coordinator-verified
  before the run: no tracked perseed filename and no `.md` mention
  of any of them; re-verified by this arm with `git ls-files
  'evidence/*/perseed-*/*' | grep -E 's1904(19|2[0-9]|3[0-4])-'`
  (empty, grep exit 1) before any sim. This is a fresh measurement,
  not a matched control — the merge-a band is the matched control
  and this band tests whether its verdict generalizes.
- **Policy: competent verbatim, SINGLE leg on the merge base, mode
  `fix` only** (with the swap — see above). The base's own
  `scripts/policies/competent.js` is used (sha
  `26a87e493578...` — verified at run start). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master; deleted before finishing) + the driver's live
  shadow old-rule count per snapshot, exactly as vetphantom-driver
  and merge-a driver. Driver:
  `scripts/mcconfirm-merge-driver-20261111.js` — a copy of the
  merge-a driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-mcconfirm-merge-b/`, RUN =
  `mcconfirm-merge-pilot`, arm = `mcconfirm-merge`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha). One deliberate difference from the merge-a driver: its
  `writeRobust` wait is a real sleep (`Atomics.wait`), not a
  `Date.now()` busy-wait — the harness's frozen clock makes
  `Date.now()` jump ~1ms per call after a day advances, so a
  `Date.now()` wait returns in <1ms of real time and all 60 retries
  finish instantly (verified this run while the host write flap was
  active). Same retry count and `@@FALLBACK` behavior, only the wait
  is real. The leg guard is enforced at RUN entry only, never at
  require time (sim-findings-a hermeticity lesson). Analyzer:
  `scripts/mcconfirm-merge-analyze-20261111.js`. Proof:
  `scripts/test-mcconfirm-merge-b.js`.
- **Corpus:** `evidence/2026-11-11/perseed-mcconfirm-merge-b/` — 16
  per-seed JSONs; summary
  `evidence/2026-11-11/mcconfirm-merge-b-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the sibling
control leg vs this merge leg on identical fresh seeds, judged by
the coordinator under the joint rule above. Same standing as
survivalcontrol-b §7 and merge-a §7.

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
- This arm does NOT re-judge the merge-a verdict
  (COLLAPSE_INSIDE_MERGE stands on its 8 matched seeds), the
  survivalcontrol verdict (MASTER_CHANGE stands), or the anchor
  verdict (ANCHOR_NOT_REPRODUCED stands) — it tests whether the
  merge collapse reproduces on fresh seeds only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop B body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, and
  merge-a). Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
