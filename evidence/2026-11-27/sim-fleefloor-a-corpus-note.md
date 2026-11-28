# sim-fleefloor-a — corpus reconstruction note

**Run:** Loop A adoption fleshout-20261128T0515Z · **Branch:** `sim-fleefloor-corpus-a`
**What this file is:** a reconstruction record. It changes NO verdict and NO
conclusion — `evidence/2026-11-27/sim-fleefloor-a.md` stands as written. It
restores the raw data that file's §7 claimed was committed.

## What was lost

The original arm (run fleshout-20261128T0315Z, branch `sim-fleefloor-a`)
judged NO-GO (metric-broken kill) on band 112301–112308, 150d, competent
verbatim. Its evidence §7 claimed the three per-seed corpora were committed.
They were NOT: the merged commit `fb4b4dcc8` holds only 10 files (evidence +
analysis JSON + panel files + driver + analyzer + panel builder + proof
test). The 24 per-seed JSONs were untracked in the worktree and were deleted
when the coordinator removed the tree:

- `perseed-fleefloor-a-ctl/` (8 files)
- `perseed-fleefloor-a-arm/` (8 files)
- `perseed-fleefloor-a-ctl-rerun/` (8 files)

## How it was regenerated

1. **Lever re-applied** to `src/js/fieldFights.js` exactly per prereg §1
   (`sim-fleefloor-a-prereg.md`): a `floorFinishOn` flag
   (`process.env.FLOORFINISH === '1'`, default OFF) plus the hold inside
   the bravery-floor branch (`if ((vHp / vHpMax) < fleeAt)`), non-sealed
   path only, before the flee decision: lead-monster HP <= `rec.mDealt /
   round` with dpr > 0 → the floor does not fire; logs "(Finish the kill)"
   once per fight; counts `rec.floorFinishHold`; no RNG drawn; the hold
   counts only when the floor would actually fire (`_runF` true).
   Committed-finish 40% floor, hopeless branch, learn-first withdrawal,
   death, signature exits, sealed arenas untouched; wave-agnostic.
2. **Proof test green with the lever re-applied:**
   `node scripts/test-fleefloor-a.js` → **51 passed, 0 failed**, including
   §2 off-mode byte-identical on all 30 frozen staged fights. The
   re-application reproduces the original lever's behavioral contract.
3. **CTL corpus** (flag unset, same substrate
   `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`)
   re-run over seeds 112301–112308 into `perseed-fleefloor-a-ctl/`, then
   re-run into `perseed-fleefloor-a-ctl-rerun/`: **`cmp` clean on all 8
   files** — the original determinism claim reproduces.
4. **ARM corpus** (`FLOORFINISH=1`) re-run over the same 8 seeds into
   `perseed-fleefloor-a-arm/`.
5. **Lever reverted** after the arm run per the kill protocol:
   `git diff HEAD -- src/js` is empty, no `FLOORFINISH`/`floorFinish`
   remains in `src/js/fieldFights.js`. No trace of the lever in game code.
   Consequence, by design: `scripts/test-fleefloor-a.js` now fails its §0
   static checks (it asserts a gate that is gone). That is expected, not a
   defect — do NOT "fix" the test.

## Verification against the committed analysis

`scripts/analyze-fleefloor-a.js` re-run over the regenerated corpora
(`--external selftest,determinism,proof`; analyzer selftest 20/20) and
compared field-by-field with the committed
`evidence/2026-11-27/fleefloor-a-analysis.json`: **identical in every field
except the `dir` paths**, which point at the original (deleted) worktree
`sim-fleefloor-a` by construction. Verdict reproduced: **NO-GO
(primary+vDie)**.

| Aggregate | Committed ctl | Regen ctl | Committed arm | Regen arm |
|---|---|---|---|---|
| Fought expedition w4+ meetings | 17 | 17 | 20 | 20 |
| vKills | 0 | 0 | 0 | 0 |
| vFlee / vDie | 11 / 2 | 11 / 2 | 13 / 4 | 13 / 4 |
| Variants hopeless / floor / learn / committed-floor | 8 / 3 / 0 / 0 | 8 / 3 / 0 / 0 | 9 / 4 / 0 / 0 | 9 / 4 / 0 / 0 |
| Floor-flees within one round | 0 | 0 | 0 | 0 |
| floorFinishHold (all 177 w4+ fights) | 0 | 0 | 0 | 0 |
| Starvation deaths (total / villager) | 0 / 0 | 0 / 0 | 2 / 1 | 2 / 1 |
| Median survival | 150d | 150d | 150d | 150d |
| Wave-5 unlocks | 3/8 | 3/8 | 3/8 | 3/8 |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |

Per-seed rows also match exactly, including the two arm divergences from
control: seed 112303 arm 84d / standing 125 (ctl 103d / 175) and seed
112308 arm 79d / standing 199 (ctl 147d / 199); the other six seeds are
identical between legs.

**Provenance caveats (honest, not hidden):** the regenerated files record
`anchorCommit fb4b4dcc8` (this reconstruction branch's HEAD) rather than the
original run's anchor, and `fieldSha fa6526b4a685` (identical across all
three regenerated corpora — the re-applied lever is one self-consistent
code state, but byte-identity of the lever source against the original
cannot be proven from the surviving artifacts; the fidelity evidence is
the 51/51 proof test including 30 frozen off-mode records, plus the exact
aggregate reproduction above).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-27/perseed-fleefloor-a-arm/*.json' --metrics
national,table,wins,exiled` refuses recorder-corpus input by design; with
`--allow-recorder-corpus` it reports three LOUD lines (identical on the
ctl leg):

- `LOUD: national disappeared: baseline 12 -> current 0 (n=8 files)`
- `LOUD: table disappeared: baseline 16 -> current 0 (n=8 files)`
- `LOUD: wins disappeared: baseline 16 -> current 0 (n=8 files)`

Verdict: **regime artifacts, not a regression.** The baseline is a
different regime (16-seed runs with a seat stack); this corpus is an
8-seed competent-verbatim pilot with no seat stack, where the committed
analysis itself records national 0 / wins 0 / all-regional on BOTH legs —
the control leg shows the same 0s, so the arm changed nothing here.
**Baseline NOT rolled.**

## Verdict

Unchanged: **NO-GO (primary+vDie), metric-broken kill** — the floor-within-
one-round pool is 0 on this band, the override never fires (0 holds in 177
w4+ fights), and the arm's extra combat deaths (4 vs 2) breach the cost
bar. The raw data behind that verdict is now committed alongside it.
