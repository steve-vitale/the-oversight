# Prove-out holdout — post gap PRs #3–#7 (2026-11-08)

Measure-only. No policy retunes. No Loop B claim. Companion to the 16-seed
screen in `evidence/2026-11-08/prove-out-baseline.md` (merged via PR #8).

## Identity

| Field | Value |
|---|---|
| Measured tip | **`816404356`** (`origin/master` after merges of PRs #3–#7) |
| Tip at write-up | `bb6a301cf` (PR #8 + dialog PRs #9–#11 landed after this panel). **Not re-measured.** |
| Observer | `scripts/balance-panel.js` + all23 contract `panel-contract-rulings-2026-10-24` |
| Policies | `capable,maker,merchant,caregiver` (unchanged registered controllers) |
| Seeds | holdout 64 = `seedList(80).slice(16)`: `10–41,43–74` — **independent of STD16**; overlap **[]** |
| Horizon | 150 days |
| Cases | 256 observed + 4 observer-off neutrality proofs (seed 10 × 4 policies) |
| Neutrality | 4/4 match, 0 warnings; `sourcesStable: true` |
| Wall time | ~614s, `--par 4` |

Raw panel: `evidence/2026-11-08/prove-out-holdout-panel/panel.json.gz`  
Feature census: `evidence/2026-11-08/prove-out-holdout-features.{json,md}`  
Machine summary: `evidence/2026-11-08/prove-out-holdout-analysis.json`  
Case cache (local replay only, not the published claim): `…/prove-out-holdout-panel/cases/`

Digests (panel): `sourceDigest d69fd97a…`, `observerDigest c5f9dc9f…`,
`contractDigest 37bbb0fa…`, Node `v22.23.4`.

## Headline vs 16-screen (blunt)

**Holdout still shows campaigns that win and reach national — but it does not
confirm the screen’s rates within scorecard tolerances.**

| Signal | 16-screen (64) | Holdout (256) | Within ±tol? |
|---|---:|---:|---|
| National | 55/64 (86%) | 219/256 (86%) | **yes** (−0.4pp) |
| Table / won | 45/64 (70%) | 172/256 (67%) | **no** (−3.1pp) |
| Full seat | 9/64 | 24/256 (9%) | rate similar |
| Lesser seat | 36/64 | 148/256 | — |
| communityLost | 4/64 (6%) | 22/256 (9%) | **no** (+2.3pp) |
| surv30 | 94% | 85% | **no** (−8.6pp) |
| surv60 pooled | 52% | 55% | **no** (+3.0pp) |
| Starvation-labeled runs | 10/64 | 40/256 | still not the dominant fail mode |

Per policy (64 holdout each vs 16 screen):

| Policy | national H / S | won H / S | full H | surv60 H / S |
|---|---:|---:|---:|---:|
| capable | 83% / 69% | 89% / 94% | 9 | **49% / 25%** |
| maker | 86% / 100% | 50% / 44% | 3 | 44% / 63% |
| merchant | 84% / 88% | **58% / 81%** | 4 | 66% / 63% |
| caregiver | 89% / 88% | 72% / 63% | 8 | 59% / 56% |

Capable surv60 **25% → 49%**: the screen bank was harsh on first-bearer
survival; holdout is still a coin-flip, not clearance. Merchant won **81% →
58%**: the screen overstated merchant sitting. Maker’s perfect national on
screen (16/16) does not hold (55/64).

Starvation death events (labels): capable 19, maker 19, merchant 32,
caregiver 13. Forty runs carry at least one starvation label. `lowFood` day
fraction stays tiny; early *bearer* death remains the sharper survival signal.

## Prove-out-plan §1.1

Pre-registered bars from `docs/prove-out-plan.md` / store plan:

1. **Screen** — **PASS** (filed separately on STD16; capable table/won 15/16).
2. **Holdout** — **FAIL / `review_required`**. Same directions do **not** hold
   within scorecard tolerances (±0.02) for won, table, survival30/60, and
   communityLost (pooled and/or per-policy). National is the one pooled metric
   that holds. 26 out-of-tolerance cells in `prove-out-holdout-analysis.json`.
   Written tradeoff required; **not** a silent pass / confirmation of the
   screen.
3. **Scale / Loop B** — **NOT CLAIMED**. Muse bands/instruments untouched.

**Decision label:** `review_required` (measure-only; no Game/policy change).

### Written tradeoff (required by bar 2) — accepted `review_required`

**Out of ±0.02 tol (pooled):** won/table **−3.1pp** (70%→67%), communityLost
**+2.3pp** (6%→9%), surv30 **−8.6pp** (94%→85%); surv60 +3.0pp also out.
National alone holds (−0.4pp). **Policy slides:** merchant won **81%→58%**;
maker national 100%→86%; capable surv60 **25%→49%** (plus 21 other
metric/scope cells → 26 total).

**Decision:**

1. **National confirms** — tip is not a 0-national / 0-win wall on this bank
   (219/256 national, 172/256 won, 24 full seats).
2. **Screen was optimistic on merchant/maker sits** and **pessimistic on
   capable surv60** — do not treat 16-screen rates as the holdout mean.
3. **Clearance language stays blocked** (small-effect / “screen confirmed” /
   gap-PR clearance). No silent pass of bar 2.
4. **No panel re-run, no policy retune, no lever move.** Survival-lever
   register unchanged. **Not Loop B** (different seeds/instruments).

Full write-up (Project store): `docs/prove-out-holdout-tradeoff.md`.

## Utilization (short)

Feature census + event totals are in the sidecar files. Jobs/classes/abilities/
godpath deeds/table paths fire under all four policies on the holdout bank.
Livelihood controller counters light up on maker/merchant/caregiver. Gods stay
rare. Full census detail: `prove-out-holdout-features.md`.

## What this does **not** prove

1. Screen-rate confirmation (failed bar 2).
2. Muse Loop B frozen bands / doorwalk / feast instruments.
3. Human/phone play.
4. Clearance of gap PRs #3–#7 beyond “tip still wins on a second seed bank.”
5. Wave-5 kill counts (not an all23 metric here).

## Muse-overlap note

Stock controllers only. Same tip family as the screen (`816404356`); later tip
`bb6a301cf` includes dialog work and the baseline evidence merge — re-measure
if claiming that tip. Do not merge conclusions across Loop B instruments
without a same-seed same-observer re-sweep.

## Command

```bash
HOLDOUT=$(node -e "console.log(require('./scripts/sweep-dashboard').seedList(80).slice(16).join(','))")
node scripts/balance-panel.js --root . --seeds "$HOLDOUT" \
  --policies capable,maker,merchant,caregiver --days 150 \
  --out evidence/2026-11-08/prove-out-holdout-panel --par 4
node scripts/balance-features.js \
  evidence/2026-11-08/prove-out-holdout-panel/panel.json.gz \
  --out evidence/2026-11-08/prove-out-holdout-features
```
