# sim-nightcarry-a — INCOMPLETE (coordinator adoption, no verdict)

**Verdict: NONE — the arm never reached judgment.** The Loop A
`fleshout-20261117T0215Z` coordinator timed out (2h cap) with the worker
dead and no final handoff. This note lands the partial work as evidence
so a future round can resume it instead of re-running the control leg.

- Run: Loop A `fleshout-20261117T0215Z`, axis scale-onramp, arm
  `sim-nightcarry-a`, branch `sim-nightcarry-a`.
- Base: master `5d5293972` (verified at arm start). Instrument tip:
  `00fb5745a` (lever + instrument + proof 65/65 at the tip, per the
  commit message). Policy: competent verbatim, sha256
  `df9b7dff4de4`.
- Band: seeds 103101–103108 (fresh, per the prereg). Horizon: 150d
  death-aware. 8-seed pilot.
- Prereg: `evidence/2026-11-17/sim-nightcarry-a-prereg.md` (frozen
  before any judged sim). Frozen GO bar: primary = launched wave-4+
  instances (any-commit), armed leg ≥ control leg + 2; secondary =
  carried commits converting to launches ≥ 25%; cost bars = deaths/run
  within +2 of control, median survival ratio ≥ 0.9, starvation within
  +2 (arm-only, B3 method).

## What was built

A part-2 `party_launch` commit written by the dawn/mid-day
`objTick` refresh has ZERO execution windows: part 3's `agencyTick`
is night-vetoed (`if (night) continue`), and next dawn's `objTick`
force-refresh overwrites the commit with a fresh lottery pick before
any `agencyTick` can execute it. The lever carries the commit across
ONE night (`NIGHTCARRY=1`, default OFF; `src/js/villager-brain.js`,
+118 lines at the instrument tip), so a commit written late in the
day gets its morning execution window the next day.

## What ran, what did not

- **Control leg: 6/8 seeds** (103101–103106). Corpora + driver log
  in `evidence/2026-11-17/` (this commit). Seeds 103107–103108 never
  ran — the worker died mid-control-leg.
- **ON leg: never started.** No on-corpora, no analyzer run, no panel,
  no proof re-run on a rebased tip.
- **No judged numbers.** The frozen bars were never evaluated. No
  verdict, no GO/NO-GO, no cost-bar read.

## The lever is reverted on the branch (adoption)

Per kill discipline for unjudged levers, the `src/` change is reverted
in this adoption (`git checkout 5d5293972 -- src/js/villager-brain.js`;
verified `git diff 5d5293972 -- src/` empty, `node --check` passing).
Net `src/` diff vs master: 0 lines. The lever code survives in the
branch history at `00fb5745a` for a resume round to re-apply.

## Control-leg observation (not a verdict)

The phenomenon the arm was built to fix DOES occur on the control leg:
seed 103101 shows **47 `nightcarrySkips`** — 47 part-2 commits that
died at the night tick — with 0 carries (the lever is OFF on control)
and 0 `carriedSays`. The other five control seeds show 0 skips, so
the phenomenon is seed-concentrated, not band-wide. The control leg's
own numbers (for a resume round's baseline): 103101 survived 150d,
standing 465, wave 5; 103102 lost d120, standing 199; 103103 survived
150d, standing 199; 103104 lost d147, standing 199; 103105 lost d142,
standing 540, wave 5; 103106 lost d116, standing 175. No wins on any
control seed. All six control runs: 0 instrument errors.

## Resume instructions for the next round

1. Re-apply the lever from `00fb5745a` (cherry-pick or checkout
   `src/js/villager-brain.js` from that commit onto the current master;
   verify `git diff` is the lever and only the lever).
2. Finish the control leg (seeds 103107–103108) on the same band, then
   run the ON leg (8/8) and judge against the frozen bars in the prereg.
3. Band 103101–103108 is PARTIALLY SPENT (control leg 6/8 used it).
   A fresh band is cleaner if the resume round prefers it — but the six
   control corpora here are a valid baseline for the ON leg on this band.
