# sim-winflee-b — PREREG (frozen before any judged sim)

**Arm:** sim-winflee-b · **Loop B run:** fleshout-loop-b-20261128T0530Z,
axis winnability-chain · **Branch:** `sim-winflee-b` (worktree
`~/workspace/worktrees/sim-winflee-b`) · **Type:** DIAG (instruments +
evidence only — no policy change, no src/js change, no game-code change)

**Base at freeze:** `d2c726f65` (master tip; Loop A is live on
scale-onramp in its own trees — untouched). **Instruments commit:**
`35997bd6f` (analyzer, FIELD + TB drivers ported from fleerepair-b,
TB analyzer, panel builder, proof test 24/24 green).

## §0. Question

Partydmg-a §8.2 asked whether the flee-at-low-HP rule ends fights
the party would win. The emptybow armed leg broke the fleerepair
premise with one named case — s112308 d146, aria_thompson vs the
Influencer: 11 rounds, 707 damage dealt, monster at 233 HP, lead at
45 HP — rounds-to-kill 3.63 vs rounds-to-drop-the-lead 9.9. The party
fled while WINNING the race. Finding #2602 (the fleecall band
109501–109508) says only 1/20 fled launched fights ended within one
round of a kill. This arm asks: **is s112308 d146 a rare shape or a
common one — is the flee call (vs damage) the binding wall at the
kill line?**

## §1. Measurement (frozen)

**Population:** expedition-origin wave-4+ fieldFight rows
(`v4encounters`, origin `expedition`, wave ≥ 4), fought
(rounds ≥ 1). Fled launched fights = outcome `vFlee`.

**Race (computed in the analyzer, `scripts/analyze-winflee-b.js`,
from the FIELD recorder's end-of-fight fields — for a vFlee row the
fight end IS the flee moment):**

- `rtk = mHpLeft / (mDealt / rounds)` — rounds to kill the monster
  at the party's observed damage rate.
- `rtd = vHpLeft / (vTaken / rounds)` — rounds until the monster
  drops the lead at its observed damage rate against the lead.
- `vTaken` / `vHpLeft` are the LEAD's damage taken / HP left
  (verified in `src/js/fieldFights.js`: `rec.vTaken` accumulates
  damage to the lead `vHp`; `rec.vHpLeft` is the lead's HP at fight
  end; `rec.mHpLeft` the monster's HP). `mDealt` is party damage.
- **Winnable iff `rtk <= rtd`; within-one-round iff `rtk <= 1`.**
- A fled fight is **unclassified** when a race field is missing
  (`mHpLeft` / `vHpLeft` null) — never counted winnable or beaten.

**Primary metric:** winnable share = winnable vFlee / all vFlee on
the fresh band.

## §2. Frozen bars (the judge — metric binding §14)

| Bar | Rule | Pass? |
|---|---|---|
| W0 instrument validity | Race computable for every fled fight on the fresh band (0 unclassified) AND the calibration case reproduced exactly from the committed corpus (see §3) | — |
| W1 PRIMARY — flee call is the binding wall | Winnable share ≥ 25% of fled fights AND ≥ 3 winnable cases on the fresh band | DIAG-GO on the wall claim iff W0 + W1 pass |
| W2 pool floor | Launched wave-4+ meetings ≥ 10 AND fled fights ≥ 3 | If fled < 3, the primary is under-powered: report insufficient-pool, wall question unjudged |
| W3 determinism | One-seed re-run byte-identical modulo anchor/file fields; the re-run per-seed file is retained in the commit | — |
| W4 instrument errors | 0 across all 16 per-seed files | — |
| W5 wall numbers | National / table / wins, wave 4–5 unlocks, median survival reported | — |

**Reading W1:** a miss is DIAG-NO-GO on the wall claim — never
re-scored against a friendlier metric mid-run. A DIAG that finds
the flee call is NOT the wall is a valid DIAG result, reported
plainly: damage, not the flee call, is the binding constraint at
the kill line.

**Why 25% with ≥ 3 cases:** the calibration leg (build + armed,
12 fled fights) shows 1/12 = 8.3% winnable; all three legs
1/17 = 5.9%; the fleecall band (#2602) 1/20 within one round.
A 25% share with ≥ 3 cases would mean the s112308 shape is
common, not a one-fight fluke. The count floor matters: a single
winnable flee on a small fled pool cannot pass (1/5 = 20% fails
the share; 2/7 = 29% fails the count). The bar is deliberately
set above the calibration rate by 3× so that passing it is
evidence, not noise.

## §3. Calibration leg (context, NOT the judged result)

Computed with `scripts/analyze-winflee-b.js` from the committed
corpora on the held branches (`sim-fleerepair-b` /
`sim-emptybow-b`, band 112301–112308), saved as
`winflee-b-calibration-{diag,build,armed}.json`:

| Leg | Pool | Fought | Evades | vFlee | Winnable | Share | Within-1 | Unclassified |
|---|---|---|---|---|---|---|---|---|
| Diag (fleerepair pilot) | 37 | 10 | 27 | 5 | 0 | 0.000 | 0 | 0 |
| Build (fleerepair build) | 36 | 13 | 23 | 7 | 0 | 0.000 | 0 | 0 |
| Armed (emptybow armed) | 28 | 9 | 19 | 5 | 1 | 0.200 | 0 | 0 |
| **Build + armed** | **64** | **22** | **42** | **12** | **1** | **0.083** | **0** | **0** |
| All three | 101 | 32 | 69 | 17 | 1 | 0.059 | 0 | 0 |

**Calibration case reproduced exactly:** s112308 d146,
aria_thompson vs the Influencer — rtk 3.63, rtd 9.9, winnable,
class F2 (hopeless + winnable). The analyzer's selftest pins
these numbers (27 checks); the corpus row reproduces them
through the same code path the fresh band will use. Every other
fled fight on the calibration legs is beaten by a wide margin
(rtk 18–86 vs rtd 0.3–4.4) — the calibration case is an outlier
shape on its band, which is exactly what the fresh band tests.

**TB-leg check:** TB exposures carry no fled fights on either
calibration leg (0/51 build, 0/38 armed — `end.humans[].fled`
false throughout), so there is no TB flee race to instrument.
**No TB recorder extension is needed:** the FIELD recorder
already persists every flee-moment field (see §1); the TB
instrument does not persist policy ctx counters (the emptybow
finding) — a related but different gap, not chased here.

## §4. Fresh band (frozen)

- **Band:** 112401–112408 (8 seeds × 150d, death-aware horizon).
  Freshness verified 2026-11-28: no `11240[1-8]` in any
  2026-11-2x sim .md / prereg file, no per-seed filenames
  `*11240[1-8]*`, nothing in the goal `hidden_files/`; the only
  `11240` hit anywhere is `nighttravel-b-insideevening-s11240.json`
  (seed 11240, a different seed, Oct 28). Recently used blocks
  avoided: 112301–112308, 112201–112208, 113301–113308,
  111501–111508, 112101–112108, 111801–111808.
- **Policy:** competent verbatim (`scripts/policies/competent.js`,
  sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  — byte-identical to the policy the calibration legs ran under).
- **Substrate (same as the calibration legs):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1`; `FLEEGUARD`,
  `FLEEREPAIR3`, `DOORFLEE2`, `FIELDCAPDMG`, `RAGEFREE`,
  `FREESTRIKE` unset. **Plain master:** neither the fleerepair
  TB wasted-turn fix (policy change, commit `0ed0bf12d` on the
  held `sim-fleerepair-b` branch — not on master) nor the
  emptybow fix (`ensureStrikeWeapon`, held `sim-emptybow-b`
  branch — not on master) is present. Verified by the policy
  sha above + `git diff` of `src/js/` empty at run time.
- **Drivers:** `scripts/winflee-field-driver-b.js` (MODE=diag)
  + `scripts/winflee-tb-driver-b.js` (POLICY=competent), ported
  verbatim from the fleerepair-b drivers (instrument-only:
  recorders + analyzers; the game code they read is master's).
- **Staging:** 1-seed smoke first (112401, both drivers, folded
  into the corpus per the emptybow precedent), then the full
  8-seed band. If the smoke shows instrument errors or an
  unclassifiable fled fight, stop and fix the instrument before
  judging anything.

## §5. Judging + reporting

- Judge the fresh band against §2 with
  `scripts/analyze-winflee-b.js` (FIELD) and
  `scripts/analyze-winflee-tb-b.js` (TB turn economy + wall).
- Balanced panel (§15): `scripts/build-winflee-b-panels.js`
  (before = calibration armed TB corpus, after = fresh TB
  corpus) + `scripts/balance-panel.js compare` — the panel is
  the calibration-leg-vs-fresh-band instrument check (different
  bands, unpaired), not a verdict.
- Telemetry deviation check against
  `hidden_files/telemetry-baselines/scale-wall.json`
  (`--metrics national,table,wins,exiled`); report any LOUD line.
- Evidence `evidence/2026-11-28/sim-winflee-b.md`: the
  measurement, a per-fight table of fled fights with rtk vs rtd,
  the calibration case reproduced, the verdict on whether the
  flee call (vs damage) is the binding wall at the kill line, a
  village assessment in plain words, a "metric review" section,
  and the wall numbers.
- **Out of scope (counted, not chased):** cousin evades (#2504 —
  launched meetings ending in pre-fight awareness evades, 0
  rounds, no contact; a different shape from fled fights);
  arena pre-turn flee (#2292 — note occurrences if seen).
  **No flee-rule fix is built in this arm** — measure first;
  the build follows from the verdict in a later run.

## §6. Metric review (placeholder — filled at judging)

- (To be filled in the evidence file after judging; the frozen
  bars judge as written.)
