# Survival-collapse confirm CONTROL leg — pre-registration (arm sim-mcconfirm-ctrl-b)

Run fleshout-b-2026-11-12T03:29Z, Loop B, axis scale-onramp / winnability
chain. Written and committed BEFORE any judged sim. Base:
`5157782a4` (the vetphantom base: "sim-corruptfirst-a: fill rebase
note (target 488506a47, corruption.js unmoved, proof 63/63
post-rebase)"; read fresh from the worktree at run start with `git
log --oneline -1`).

**Instrument-only arm — ZERO src/js changes committed.** This arm
runs one fresh 16-seed band on the vetphantom base to establish the
fresh-band healthy number, so the coordinator can judge whether
the merge-a COLLAPSE_INSIDE_MERGE verdict reproduces on fresh
seeds. It changes no game code and builds nothing.

## The question

Loop A landed sim-bisect-merge-a (52b7225d6): the reconcile-merge
base `e4dbe581b` survived 1/8 on seeds 190391–190398 vs the
vetphantom fix leg's 6/8 on the same seeds — verdict
COLLAPSE_INSIDE_MERGE. That verdict rests on 8 matched seeds.
This arm (the CONTROL leg) runs FRESH seeds 190419–190434 (16) on
the vetphantom base `5157782a4` — the base the fix leg ran on — to
establish the fresh-band healthy number. A sibling leg runs the
same fresh band on the merge base. The coordinator reads both
legs together under the joint rule below.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| merge-cut leg (seeds 190391–190398) | merge `e4dbe581b` | **1/8** | **126d** |
| this control leg (seeds 190419–190434, FRESH) | vetphantom base `5157782a4` | **?** | **?** |
| sibling merge leg (seeds 190419–190434, FRESH) | merge `e4dbe581b` | **?** | **?** |

## No fix-swap (read carefully — the fix IS in-tree at this base)

At `5157782a4`, `src/js/standing.js` IS the r131 roster-check fix
version (sha256
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
verified at run start). NO swap is needed and none is performed.
The driver (`scripts/mcconfirm-ctrl-driver-20261111.js`) still
refuses to run unless the on-disk `standing.js` carries the
"ROSTER CHECK" marker AND its sha256 is exactly the fix sha — the
leg guard is enforced at RUN entry on every seed, never at
require time (sim-findings-a hermeticity lesson). `standingSha`
is recorded per seed in the corpus.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar) and Steve's 2026-11-10 scholar-counts ruling. No canon
doc covers survival-collapse attribution; nothing here invents
canon.

## Primary metric + JOINT decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190419–190434 on base
`5157782a4`.** This analyzer judges THIS leg only (survived
count, median via the same upper-median convention as merge-a,
completeness). The joint CONFIRMED / REFUTED / INCONCLUSIVE
verdict is the coordinator's read of BOTH legs under the rule
below — this arm does not claim it.

| Outcome (joint rule, same text the sibling leg uses) | Verdict |
|---|---|
| merge survived ≤ control − 4 AND control ≥ 8/16 | **CONFIRMED** — the collapse reproduces on fresh seeds |
| merge ≥ control − 1 | **REFUTED** — the collapse does not reproduce on fresh seeds |
| otherwise | **INCONCLUSIVE** — neither confirmed nor refuted |

The analyzer (`scripts/mcconfirm-ctrl-analyze-20261111.js`)
reports this leg's survived count and median, records the joint
rule and both legs' inputs verbatim in the summary JSON, and
exits 0 only on a complete corpus with 0 instrument errors (leg
status LEG_COMPLETE); exit 1 only on instrument failure, corpus
incompleteness, or an unclassifiable read.

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave-5 unlocks;
national/table/wins; standing range; tribute-ready days; phantom
days (0 expected — the roster-check fix is in-tree); blooded
count from the summary JSON.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  the vetphantom and merge-a bands, so the survival counts are
  comparable.
- **Seeds: 190419–190434 (16 seeds) — FRESH.** Coordinator-verified:
  no tracked perseed filename and no .md mention of any of them;
  re-verified once in this worktree with `git ls-files
  'evidence/*/perseed-*/*' | grep -E 's1904(19|2[0-9]|3[0-4])-'`
  before running (empty). This is a fresh measurement, not a
  matched re-run: the point is the healthy number on new seeds.
- **Policy: competent verbatim, SINGLE leg on the vetphantom base,
  mode `fix` only.** The base's own `scripts/policies/competent.js`
  (sha256 `0801abd82e52…`, verified at run start). The driver
  refuses to run on a standing.js that is not the fix version.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` — reused
  unmodified, byte-identical to master (sha256 `311f105b…`); it is
  already tracked at this base, so no untracked copy is needed and
  nothing is deleted at the end. Plus the driver's live shadow
  old-rule count per snapshot, exactly as vetphantom-driver and
  merge-a driver. Driver:
  `scripts/mcconfirm-ctrl-driver-20261111.js` — a copy of the
  merge-a driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-mcconfirm-ctrl-b/`, RUN =
  `mcconfirm-ctrl-pilot`, arm = `mcconfirm-ctrl`, mode fixed to
  `fix` only, plus the leg guard (exported `legGuard`,
  exact-sha, enforced at RUN entry only). Analyzer:
  `scripts/mcconfirm-ctrl-analyze-20261111.js`. Proof:
  `scripts/test-mcconfirm-ctrl-b.js`.
- **Corpus:** `evidence/2026-11-11/perseed-mcconfirm-ctrl-b/` — 16
  per-seed JSONs; summary
  `evidence/2026-11-11/mcconfirm-ctrl-b-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this control leg on fresh seeds, judged by the
coordinator under the joint rule. Same standing as
survivalcontrol-b §7 and merge-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- No src/js file is modified at any point in this run. `git status`
  must show no `src/js` modification before the evidence commit.
  If it ever does, FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge the merge-a verdict
  (COLLAPSE_INSIDE_MERGE stands on its 8 matched seeds), the
  anchor verdict, or the mournblooded verdict — it supplies the
  fresh-band control number the coordinator reads them against.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop B body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a, and
  merge-a). Recorded, not waived.

## Flap window (infrastructure — added 04:31Z, before any judged sim)

Host write flap, same class as the 2026-10-24/25 flaps: any process
that reads a file under the repo tree then cannot write anywhere
(node `writeFileSync` → EPERM, `git update-ref` → cannot write the
`.git/refs/heads/*.lock`, worktree-heartbeat script → Python
`PermissionError`, even a spawned `/bin/sh` child fails). Plain
writes with no repo read still work. Onset ~03:59Z (a `git reset
--hard` at run start succeeded; the first proof failure struck at
~03:59Z). Probes failing: `git update-ref refs/heads/probe HEAD`
at 04:05Z, 04:11Z, 04:21Z, 04:31Z, 04:42Z; node read-then-write EPERM at
each same time (04:42Z probe: git update-ref failed, chain
short-circuited before the node check). Coordinator confirmed 04:24Z via two failed
worktree-heartbeat writes. Proof sections 1–2 green; section 3
(driver refusal leg) unproven — dies at the scratch-repo write
even after a 10×2s retry loop was added to the test. No judged sim
runs until the prereg commit lands; the commit is retried every
~10 min. Trees have hours of reaper margin from the 03:58Z
heartbeat, so no emergency. (Flap window to be closed out in the
evidence file once the band runs.)

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
