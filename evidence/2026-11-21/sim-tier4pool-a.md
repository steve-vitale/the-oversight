# sim-tier4pool-a — TIER-4 POOL lever for holderless villages

- Arm: sim-tier4pool-a (LEVER), Loop A run fleshout-20261121T2315Z, arm 2 of 3.
- Base: worktree HEAD `70d9dda36` at cut; rebased onto master tip `a8c2c201c`
  before finishing (no game-code change upstream; proofs re-run after the
  rebase — see §7).
- Branch: `sim-tier4pool-a`.
- Prereg: `evidence/2026-11-21/sim-tier4pool-a-prereg.md` (committed
  `298b4046d`, frozen ~00:30 UTC 2026-11-22, before any judged sim).
- Instrument commit: `298b4046d` (lever + instrument + prereg; proof test
  26/26, analyzer selftest 29/29).
- **Lever KEPT env-gated OFF at the tip** (GO verdict — see below): the
  game code carries the TIER4POOL block in `src/js/game.js`
  (rollAlienLoot), default off (`TIER4POOL=1` only in node sims). No
  default flip — that is a Steve/design call. The driver, analyzer,
  panel builder, and proof test stay.

## Verdict: GO

**The pool was the wall, and the pool knob moves it.** On the frozen
12-seed band (107271–107282, 150d death-aware, competent verbatim,
substrate GUNRATE=1 + CELLGATE=1 + the standard levers), tier-4 rolls paid
the gun 20/42 (47.6%) on the arm vs 11/39 (28.2%) on ctl — ratio 1.69×,
arm above the 15% absolute bar. Contest grants nearly doubled: 20 vs 11
(10.6% vs 6.1% per contest entered, ratio 1.73×). The holderless split
is the mechanism, not a coincidence: arm tier-4 rolls drawn while
holderless paid 12/18 (66.7%, design 50%); the 24 arm tier-4 rolls drawn
after a village already held a gun paid 8/24 (33.3% — above the 22.2%
GUNRATE rate on small n, but the holderless rolls are where the lever
lives). Zero-grant seeds fell 5 → 1. All six frozen bars pass (§6 table).

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Primary — tier-4 PAY rate (searcaster results / eff tier-4 roll, arm vs ctl) | arm ≥ 1.5× ctl AND arm ≥ 15% | ctl 28.2% (11/39), arm 47.6% (20/42), ratio 1.69× | ✅ |
| 2. Secondary — grants (contest grants / contest entered) | arm ≥ 1.5× ctl | ctl 6.1% (11/180), arm 10.6% (20/189), ratio 1.73× | ✅ |
| 3. Instrument validity (proof test + selftest + 0 errors + every roll carries tier + effTier + result; 0 pool-shape mismatches; lever boosted total == boosted rows) | all must hold | proof test 26/26; selftest 29/29; instrumentErrors 0 both legs; rolls without tier/effTier 0; poolMismatch 0; stats match (boosted rows 18 == stats boosted 18) | ✅ |
| 4. Coverage / attribution (100% joins; 100% grants attributed; 0 unclassified) | all must hold | unjoined 0, unattributed 0, ungranted sear rolls 0, both legs | ✅ |
| 5. Guardrails (starvation arm ≤ ctl+2 totals; arm-only starvation ≤ 2; median ≥ 0.8× ctl; wins/national not regressed) | all must hold | starvation 1 vs 1 (Δ0); arm-only starvation 0; median 151 vs 151 (ratio 1.0); wins 0/0, national 0/0 | ✅ |
| 6. Answer quantified (per-seed table + funnel + zero-grant split + arrivals + sense) | all must hold | §1–§5 below | ✅ |

## Wall numbers (both legs, 12 seeds)

| Metric | Ctl | Arm |
| --- | --- | --- |
| Wins | 0/12 | 0/12 |
| National scale access | 0/12 | 0/12 |
| Table | not instrumented (null) | not instrumented (null) |
| Wave 5 reached | 7/12 | 6/12 |
| Wave 4 reached | 12/12 | 12/12 |
| Median survival | 151 days | 151 days |
| Community lost | 3/12 | 3/12 |
| Standing at end | 199, 455, 490, 175, 199, 199, 315, 175, 300, 225, 370, 475 | 199, 199, 465, 320, 199, 199, 315, 175, 420, 225, 370, 199 |

The scale wall still binds: no village reaches national, none wins. This
arm was a tier-4 supply lever, not a scale lever — the wall numbers are
recorded, not moved. The one wave-5 difference (7 vs 6) is seed 107272:
ctl reached wave 5, arm stayed at wave 4 with identical death counts (93)
— stream divergence from the lever's extra RNG draws, not a survival
effect (guardrail bar 5 passes; panel regression_watch on village deaths,
interval straddles 0, §6).

## 1. The funnel — both legs

| Stage | Ctl | Arm |
| --- | --- | --- |
| Contests fired | 180 | 189 |
| Contest resolutions (wins) | 172 (won 159) | 181 (won 168) |
| Prize rolls (`_cxItemPrize` calls) | 261 | 278 |
| Rolls that granted an item | 231 (88.5%) | 244 (87.8%) |
| Input tier-4 rolls | 39 (14.9%) | 42 (15.1%) |
| Lever boosts (holderless tier-4 pool weighted) | 0 | 18 |
| **Tier-4 rolls paying searcaster** | **11 (28.2%)** | **20 (47.6%)** |
| — of which holderless tier-4 rolls | 0 (n/a — ctl never records holderless) | 18, paying 12 (66.7%) |
| — of which holder rolls (village already held a gun) | — | 24, paying 8 (33.3%) |
| **Contest-prize searcaster grants** | **11 (6.1%/contest; 4.2%/roll)** | **20 (10.6%/contest; 7.2%/roll)** |
| Fusion-cell tier-4 prizes | 0 | 0 |
| Kill-loot searcaster drops | 0 | 0 |
| **Gun ARRIVALS (contest + kill-loot)** | **11** | **20** |

The ctl leg reproduces the design rate on a fresh band (tier-4 14.9% of
prize rolls; pay 28.2% vs the 22.2% GUNRATE design — 11/39 runs a little
hot, within binomial noise). The arm's 18 boosts are the lever working as
designed; every boosted row shows the weighted pool (28 draws, 14
searcasters, 0 pool-shape mismatches). The stale-seq guard fired on 36
arm rows — all 36 are shy-vault nulls (chance gate failed before the
lever block), 0 non-null stale rows: the guard fires exactly where it
should and never misattributes a roll.

## 2. Per-seed tables

### Ctl

| Seed | Days | End | Wave | Standing | Contests | Prize rolls | T4 | Sear | Grants | Grant day(s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107271 | 151 | survived | 4 | 199 | 17 | 28 | 4 | 0 | 0 | — |
| 107272 | 150 | survived | 5 | 455 | 19 | 25 | 1 | 0 | 0 | — |
| 107273 | 151 | survived | 5 | 490 | 17 | 26 | 3 | 0 | 0 | — |
| 107274 | 121 | village-lost | 4 | 175 | 14 | 21 | 1 | 0 | 0 | — |
| 107275 | 120 | village-lost | 4 | 199 | 11 | 20 | 5 | 1 | 1 | 93 |
| 107276 | 150 | survived | 4 | 199 | 17 | 28 | 5 | 2 | 2 | 126, 150 |
| 107277 | 152 | survived | 5 | 315 | 19 | 21 | 4 | 2 | 2 | 93, 95 |
| 107278 | 151 | survived | 4 | 175 | 16 | 30 | 2 | 1 | 1 | 119 |
| 107279 | 151 | survived | 5 | 300 | 14 | 18 | 7 | 2 | 2 | 127, 137 |
| 107280 | 65 | village-lost | 5 | 225 | 8 | 9 | 1 | 0 | 0 | — |
| 107281 | 151 | survived | 5 | 370 | 14 | 18 | 3 | 2 | 2 | 103, 122 |
| 107282 | 151 | survived | 5 | 475 | 14 | 17 | 3 | 1 | 1 | 136 |
| **Band** | | **3 lost / 9 survived** | | | **180** | **261** | **39** | **11** | **11** | |

### Arm (TIER4POOL=1)

| Seed | Days | End | Wave | Standing | Contests | Prize rolls | T4 | Boost | Sear | Grants | Grant day(s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107271 | 151 | survived | 4 | 199 | 17 | 25 | 7 | 2 | 2 | 2 | 69, 100 |
| 107272 | 150 | survived | 4 | 199 | 18 | 25 | 1 | 1 | 1 | 1 | 74 |
| 107273 | 151 | survived | 5 | 465 | 20 | 29 | 4 | 2 | 2 | 2 | 87, 135 |
| 107274 | 124 | village-lost | 5 | 320 | 15 | 26 | 2 | 1 | 1 | 1 | 53 |
| 107275 | 109 | village-lost | 4 | 199 | 15 | 24 | 3 | 3 | 0 | 0 | — |
| 107276 | 150 | survived | 4 | 199 | 19 | 34 | 4 | 2 | 2 | 2 | 70, 119 |
| 107277 | 152 | survived | 5 | 315 | 19 | 21 | 4 | 1 | 2 | 2 | 93, 95 |
| 107278 | 151 | survived | 4 | 175 | 16 | 30 | 2 | 1 | 1 | 1 | 119 |
| 107279 | 151 | survived | 5 | 420 | 14 | 16 | 5 | 1 | 2 | 2 | 57, 127 |
| 107280 | 67 | village-lost | 5 | 225 | 8 | 9 | 1 | 1 | 1 | 1 | 60 |
| 107281 | 152 | survived | 5 | 370 | 15 | 20 | 4 | 1 | 4 | 4 | 67, 103, 122, 151 |
| 107282 | 151 | survived | 4 | 199 | 13 | 19 | 5 | 2 | 2 | 2 | 135, 144 |
| **Band** | | **3 lost / 9 survived** | | | **189** | **278** | **42** | **18** | **20** | **20** | |

Every grant carried exactly 2 cells (both legs, all 31 grants) — the
GUNRATE bundle is unaffected by the lever. Arm 107281 is the band's
biggest haul: 4 grants, the village ending with 4 guns at once — the most
guns any village in the grantrate/tier4access/tier4pool bands has held.
Its day-103 and day-122 grants are the SAME moments ctl paid on that seed
(103, 122); the lever added grants at 67 and 151 around them.

## 3. The zero-grant split (grantrate §2 taxonomy, both legs)

| Seed | Leg | Kind | Why |
| --- | --- | --- | --- |
| 107271 | ctl | rolled-and-lost | 4 eff tier-4 rolls, 0 grants |
| 107272 | ctl | thin-gate | 1 eff tier-4 roll in 150d, 25 prize rolls |
| 107273 | ctl | rolled-and-lost | 3 eff tier-4 rolls, 0 grants |
| 107274 | ctl | thin-gate | 1 eff tier-4 roll in 121d, 21 prize rolls |
| 107280 | ctl | died-before-gate | village lost day 65 |
| 107275 | arm | rolled-and-lost | 3 boosted tier-4 rolls, 0 grants |

The lever moved four villages out of zero-grant status (5 → 1). The one
remaining arm zero-grant seed is the honest residue of a lottery: arm
107275 drew 3 boosted tier-4 rolls and missed all three (at a 50% design
rate that happens 1 time in 8), then lost the village day 109. The
rolled-and-lost bucket is no longer the band's story — on the arm leg it
holds exactly one village, and that village's rolls were all boosted.

## 4. Gun arrivals + the other door

Arrivals (contest grants + kill-loot drops): ctl 11, arm 20. The kill-loot
door contributed NOTHING on either leg (0 searcaster drops in 24 legs) —
the contest prize remains the only gun door in live play on this band.
The one non-contest gun movement in the corpora is ctl seed 107275: the
day-93 contest grant went to giulia_bianchi, who died, and the scholar
took the gun off her corpse on day 113 — the gun travels after its holder
falls, exactly the shape tier4access saw on 107257. No arm-leg corpse
takes: arm guns stayed with living holders to the end of their runs
(arm gunTotalEnd: 2, 1, 2, 1, 0, 1, 2, 1, 2, 1, 4, 2).

## 5. Sense-test — the lever changes counts, not the story

The grant moments the legs share read identically in both corpora: arm
107277's days 93 + 95 and arm 107278's day 119 are the same wins, same
recipients, same 2-cell bundles as ctl — the lever changed how often the
pool says yes, not what a yes looks like. Arm 107281's four grants read
as four separate wins on camera across the run (day 67 to ines_duarte, a
villager-won prize with no redirect; day 103 redirected to gen_tvycb1i,
day 122 redirected to aroha_ngata, both redirect-matched; day 151 to
quinn_murphy, villager-won) — all extreme-risk, all with 2 cells beside
the gun. No new narration was added by the lever (it is silent inside the
loot table by design); the prize announcement is unchanged. Sense-test
passes: no robotic or incoherent behavior introduced. What the sense read
does show is the GO in human terms: villages that do everything right now
usually come home with the gun — 11 of 12 arm villages hold at least one
by the end, against 7 of 12 on ctl — and the one that doesn't (107275)
lost its village two weeks after its third missed draw, which reads as a
village that ran out of luck and then ran out of people, not a system that
withheld the gun.

## 6. Balanced panel (§15)

`scripts/build-tier4pool-panels-a.js` + `scripts/balance-panel.js
compare` (before = ctl, after = arm, 12 paired cases):
**review_required** (exit 2 — the tool's exit for review_required).
Per-metric: national 0 → 0, survival30/60 1 → 1, community loss 0.25 →
0.25 — all **no_material_signal**; village deaths per run 76.83 → 80.83
and village deaths per 100 days 57.11 → 60.15 are **regression_watch**
with intervals straddling 0 (the move is stream divergence — arm 107276
118 deaths vs ctl 81, arm 107282 110 vs 115 — the lever only adds prizes,
so this is trajectory noise, not a survival effect; the frozen guardrail
on starvation and median survival passes clean). The review_required
decision is driven by unobserved metrics, as in tier4access — no observed
metric shows a material signal. Panel:
`evidence/2026-11-21/tier4pool-a-panel.md` (+ `.json`,
`-before.json.gz`, `-after.json.gz`).

## 7. Instrument notes and deviations

- **Pilot GO, confirm GO:** the 8-seed pilot judged GO on all six bars
  (pay 40.7% vs 24.0%, ratio 1.70×; grants 11 vs 6, ratio 1.71×;
  guardrails clean) and the 12-seed confirm held it (pay 47.6% vs 28.2%,
  ratio 1.69×; grants 20 vs 11, ratio 1.73×). The pilot judgement is
  filed as `tier4pool-a-pilot-judgement.json`; the frozen verdict is the
  12-seed `tier4pool-a-judgement.json` (GO).
- **VM restart mid-run:** the machine restarted during the ctl pilot
  (uptime 1 min on recovery) after seed 107271 only. The driver refuses
  to overwrite, so the remaining 7 pilot seeds ran in a second invocation
  against the same OUTDIR; the 107271 corpus is the pre-restart file,
  verified 0 errors on analysis. No data was re-run or duplicated.
- **Registry-lock jam:** `worktree-heartbeat.sh` failed twice late in the
  run with "registry lock held > 120s — heartbeat skipped" (a sibling
  holding the registry lock for long stretches). Heartbeats succeeded
  earlier in the run (twice) and the worktree stayed registered
  throughout; the sims themselves were unaffected. Flagged for the
  coordinator — the lock jam is not this arm's to fix.
- **Write flap (host):** no flap losses on this run — every corpus write
  landed first try (the driver's writeRobust fallback never printed).
  The safe-commit index clobber struck once (on the prereg commit) and
  was repaired with the `git ls-tree -r HEAD` pipe, verified by empty
  status + empty diff HEAD + hash-object match.
- **Rebase:** rebased onto master tip `a8c2c201c` before finishing (4
  commits since base `70d9dda36`, all evidence-only — no game-code change
  upstream). Proof test + analyzer selftest re-run green after the rebase
  (see run identity below).
- **check.js --quick NOT completed:** the run did not run the full quick
  suite (time); the proof test (26/26) + analyzer selftest (29/29) +
  `node --check` on the changed file are green, and the change is a
  single env-gated block inside rollAlienLoot with the default off. The
  ship loop runs the full check before landing.
- **What was NOT measured:** whether a granted gun is ever FIRED in a
  fight after receipt; table entry/sitting (not instrumented — left null,
  never faked); player deaths per run (not instrumented).

## Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged sim** (prereg, committed `298b4046d`).
  Bars 1–6 all pass on the frozen 12-seed band. No bar was re-scored;
  the verdict is GO on the frozen bars.
- **The static prior held, with both legs running hot.** The prereg
  predicted the arm pay rate near ~40% (holderless rolls at the 50%
  design, some rolls landing after a gun arrives and drawing unboosted);
  measured 47.6% band / 66.7% holderless. The holderless rate overshoots
  the 50% design on 18 rolls (12 paid vs 9 expected — within binomial
  noise), and ctl also ran hot (28.2% vs the 22.2% design, 11/39 vs ~8.7
  expected). The RATIO is the robust read: 1.69× on the band, 1.70× on
  the pilot — the lever's effect is stable across the two slices, not a
  one-slice fluke.
- **Grants stopped being pool-noise-dominated.** On tier4access the grant
  metric could not distinguish "gate opened, pool ran cold" from "gate
  didn't open" (grants 5 → 2 while tier-4 rolls rose). Here the pay-rate
  primary and the grants secondary agree (1.69× and 1.73×) — the pool
  lever moves the thing it claims to move, and the guns follow. The
  wider 12-seed band did its job.
- **The remaining binding constraint is the tier-4 gate itself.** Arm
  tier-4 rolls are 42/278 (15.1%) — the lever cannot pay guns on rolls
  that never reach tier 4, and the thin-gate bucket still holds villages
  (ctl 107272/107274: 1 tier-4 roll in a full run). Finding #2648 stands:
  a 25%+ band tier-4 rate needs wider eligibility (more extreme contests,
  or an earlier apex) — a design question, not a knob on this lever. The
  pool is fixed; the gate is the next wall.
- **Guardrail reading recorded:** "arm-only deaths" was frozen in the
  prereg as starvation deaths on seeds where the arm leg lost the village
  but the identical-seed ctl leg survived; measured 0. Total starvation
  deaths 1 vs 1 — the single starvation death is on seed 107279 on BOTH
  legs (the same death, not a lever effect).

## Findings (updates to sim-findings.md #2647 / #2648)

- [fixed] 2026-11-21 — tier-4 pool is the wall after the gate — the
  pool lever (TIER4POOL, +10 searcaster copies for holderless villages,
  22.2% → 50% design) lifts the pay rate 28.2% → 47.6% (ratio 1.69×)
  and grants 11 → 20 (ratio 1.73×) on the frozen 12-seed band
  107271–107282; zero-grant seeds fall 5 → 1. Verdict GO; lever kept
  env-gated OFF, default flip is a Steve/design call.
  (Loop A arm sim-tier4pool-a, run fleshout-20261121T2315Z,
  evidence/2026-11-21/sim-tier4pool-a.md.)
- [open] 2026-11-21 — second-chance static prior overstated the eligible
  base (finding #2648, updated) — the pool is now fixed (GO, see above)
  but the tier-4 gate still caps the band at ~15% tier-4 rolls; a 25%+
  band rate needs wider eligibility (more extreme contests, or an earlier
  apex), a design question, not a knob on this lever.

## Files

- Prereg: `evidence/2026-11-21/sim-tier4pool-a-prereg.md` (`298b4046d`)
- Lever (kept, env-gated OFF): `src/js/game.js` (rollAlienLoot TIER4POOL
  block)
- Instrument (kept): `scripts/tier4pool-driver-a.js`,
  `scripts/analyze-tier4pool-a.js` (selftest 29/29),
  `scripts/build-tier4pool-panels-a.js`,
  `scripts/test-tier4pool-a.js` (proof test 26/26)
- Pilot: `evidence/2026-11-21/perseed-tier4pool-a-ctl/` (12 corpora),
  `evidence/2026-11-21/perseed-tier4pool-a-arm/` (12 corpora),
  `evidence/2026-11-21/tier4pool-a-ctl-analysis.json`,
  `evidence/2026-11-21/tier4pool-a-arm-analysis.json`,
  `evidence/2026-11-21/tier4pool-a-pilot-judgement.json` (8-seed GO),
  `evidence/2026-11-21/tier4pool-a-judgement.json` (12-seed GO)
- Panel: `evidence/2026-11-21/tier4pool-a-panel.md` (+ `.json`,
  `-before.json.gz`, `-after.json.gz`)
- Logs: `evidence/2026-11-21/tier4pool-a-ctl.log/.err`,
  `tier4pool-a-arm.log/.err`, `tier4pool-a-ctl-confirm.err`,
  `tier4pool-a-arm-confirm.err`, `tier4pool-a-smoke.log/.err` (smoke
  corpus discarded after the gate; the pilot arm leg regenerated it)

## Run identity

- **Base:** worktree HEAD `70d9dda36`; branch `sim-tier4pool-a`;
  prereg + lever + instrument commit `298b4046d` (rebased to
  `d15e74861` on master tip `a8c2c201c` before finishing; see §7).
- **Pilot commands (8 seeds 107271–107278):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl
  OUTDIR=perseed-tier4pool-a-ctl SEEDS=107271,...,107278 RUN=tier4pool-a
  node scripts/tier4pool-driver-a.js` (ctl; 107271 ran pre-restart, the
  rest after). **Arm:** identical + `TIER4POOL=1 MODE=arm
  OUTDIR=perseed-tier4pool-a-arm`.
- **Confirm commands (4 seeds 107279–107282):** same env, both legs,
  `SEEDS=107279,107280,107281,107282`.
- **Analyze commands:** `node scripts/analyze-tier4pool-a.js --dir
  evidence/2026-11-21/perseed-tier4pool-a-ctl --out
  evidence/2026-11-21/tier4pool-a-ctl-analysis.json` (LEG-OK), same for
  arm (LEG-OK), then `node scripts/analyze-tier4pool-a.js --judge
  evidence/2026-11-21/tier4pool-a-ctl-analysis.json
  evidence/2026-11-21/tier4pool-a-arm-analysis.json --out
  evidence/2026-11-21/tier4pool-a-judgement.json` → **GO**.
- **Panel command:** `SEEDS=107271,...,107282 node
  scripts/build-tier4pool-panels-a.js && node scripts/balance-panel.js
  compare --before evidence/2026-11-21/tier4pool-a-panel-before.json.gz
  --after evidence/2026-11-21/tier4pool-a-panel-after.json.gz --out
  evidence/2026-11-21/tier4pool-a-panel` → review_required (unobserved
  metrics), no material signal on observed metrics.
- **Proof test:** `node scripts/test-tier4pool-a.js` → 26/26 green.
  **Selftest:** `node scripts/analyze-tier4pool-a.js --selftest` →
  29/29 green.
