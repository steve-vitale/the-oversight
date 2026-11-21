# sim-tier4access-a — TIER-4 ACCESS lever for holderless villages

- Arm: sim-tier4access-a (LEVER), Loop A run fleshout-20261121T2015Z.
- Base: worktree HEAD `5accf69db` (brief named base `320165c5a`; the worktree
  as cut already contained `5accf69db` on top; no rebase mid-work).
- Branch: `sim-tier4access-a`.
- Prereg: `evidence/2026-11-21/sim-tier4access-a-prereg.md` (committed
  `929afcf10`, frozen ~21:30 UTC 2026-11-21, before any judged sim;
  Amendment A committed `8b4693864`, also before any judged sim — see §7).
- Instrument commits: `62b8a8a63` (lever + instrument; proof test 23/23,
  analyzer selftest 25/25), `8b4693864` (Amendment A).
- **Lever commits `62b8a8a63` + `8b4693864` are REVERTED at the tip** (see
  §8): the game code is back to `5accf69db` byte-identical, and the
  lever-coupled driver + proof test are deleted from the tip (they live in
  history for a revival). The analyzer + panel builder stay — they work on
  the recorded corpora with no lever dependency.
- Horizon: 150d death-aware. Seeds: 107251–107258 (fresh band, verified
  unused). Policy: competent (verbatim). Substrate: `GUNRATE=1 CELLGATE=1`
  + `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1` (both legs identical except `TIER4ACCESS`).

## Verdict: NO-GO

**The lever works, but not enough.** The second chance fired 11 times and
lifted effective tier-4 rolls 21 → 29 per band (+38%, 12.4% → 16.8% of
prize rolls) — real movement at the gate, but short of the frozen bar
(≥1.5× and ≥25% absolute). And grants went the WRONG way: 5 contest
grants on ctl, 2 on arm (4.5% → 1.9% per contest) — the arm's tier-4
pool draws paid the gun only 2/29 times (6.9%) against ctl's 5/21
(23.8%, right at the 22.2% design). On 2–5 grant events the pool lottery
dominates the lever: opening the gate more does not buy guns when the
pool draws run cold. Per MEASUREMENT.md §14 the miss is NO-GO — no
re-scoring against a friendlier metric, no confirm round. The game code
is reverted; the measurement stands.

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Primary — tier-4 access (eff tier-4 / prize roll, arm vs ctl) | arm ≥ 1.5× ctl AND arm ≥ 25% | ctl 12.4% (21/169), arm 16.8% (29/173), ratio 1.35× | ❌ |
| 2. Secondary — grants (contest grants / contest entered) | arm ≥ 1.5× ctl | ctl 4.5% (5/112), arm 1.9% (2/107), ratio 0.42× | ❌ |
| 3. Instrument validity (proof test + selftest + 0 errors + every roll carries tier + effTier) | all must hold | proof test 23/23; selftest 25/25; instrumentErrors 0 both legs; rolls without tier/effTier 0; joins 100% | ✅ |
| 4. Coverage / attribution (100% joins; 100% grants attributed; 0 unclassified) | all must hold | unjoined 0, unattributed 0, ungranted sear rolls 0, both legs | ✅ |
| 5. Guardrails (median survival ±10d; starvation share +≤5pts; no win/national regression) | all must hold | survival 150 → 148 (Δ-2); starvation 1 death each leg; wins 0/0, national 0/0 | ✅ |
| 6. Answer quantified (per-seed table + funnel + zero-grant split + arrivals + sense) | all must hold | §1–§5 below | ✅ |

## Wall numbers (both legs, 8 seeds)

| Metric | Ctl | Arm |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National scale access | 0/8 | 0/8 |
| Table | not instrumented (null) | not instrumented (null) |
| Wave 5 reached | 2/8 | 2/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Median survival | 150 days | 148 days |
| Community lost | 3/8 | 4/8 |
| Standing at end | 199, 199, 140, 199, 199, 470, 199, 525 | 150, 375, 140, 199, 485, 199, 199, 199 |

The scale wall still binds: no village reaches national, none wins. This
arm was a tier-4 supply lever, not a scale lever — the wall numbers are
recorded, not moved. The one extra community loss on the arm leg is seed
107254 (survived 151d on ctl, lost day 120 on arm) — the lever's extra RNG
draws shift trajectories; the lever only adds prizes, so this is stream
divergence, not a survival effect (guardrail bar 5 passes; panel
regression_watch on community loss, interval straddles 0, §6).

## 1. The funnel — both legs

| Stage | Ctl | Arm |
| --- | --- | --- |
| Contests fired | 112 | 107 |
| Contest resolutions (wins) | 105 (90 won) | 104 (93 won) |
| Prize rolls (`_cxItemPrize` calls) | 169 | 173 |
| Rolls that granted an item | 131 (77.5%) | 132 (76.3%) |
| Input tier-4 rolls | 21 (12.4%) | 18 (10.4%) |
| Lever bumps (second-chance tier 4) | 0 | 11 |
| **Effective tier-4 rolls** | **21 (12.4%)** | **29 (16.8%)** |
| Searcaster results (roll-level) | 5 | 2 |
| **Contest-prize searcaster grants** | **5 (4.5%/contest; 3.0%/roll)** | **2 (1.9%/contest; 1.2%/roll)** |
| Fusion-cell tier-4 prizes | 0 | 1 |
| Kill-loot searcaster drops | 0 | 1 (taken by scholar, §4) |
| **Gun ARRIVALS (contest + kill-loot)** | **5** | **3** |

The ctl leg reproduces grantrate's band shape on a fresh band (tier-4
12.4% vs 15.9% there; grants 5 vs 5; 4.5% vs 4.2% per contest) — the
instrument is consistent across bands. The arm's 11 bumps are the lever
working as designed; the grant shortfall is the pool draw, not the gate:
arm tier-4 rolls paid searcaster 2/29 (6.9%) vs the 22.2% design rate.

## 2. Per-seed tables

### Ctl

| Seed | Days | End | Wave | Standing | Contests | Prize rolls | In T4 | Eff T4 | Grants | Grant day(s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107251 | 150 | survived | 4 | 199 | 13 | 21 | 2 | 2 | 0 | — |
| 107252 | 139 | village-lost | 4 | 199 | 14 | 20 | 4 | 4 | 1 | 79 |
| 107253 | 62 | village-lost | 4 | 140 | 7 | 14 | 0 | 0 | 0 | — |
| 107254 | 151 | survived | 4 | 199 | 17 | 24 | 4 | 4 | 1 | 47 |
| 107255 | 143 | village-lost | 4 | 199 | 19 | 24 | 5 | 5 | 0 | — |
| 107256 | 151 | survived | 5 | 470 | 17 | 33 | 2 | 2 | 1 | 65 |
| 107257 | 151 | survived | 4 | 199 | 11 | 12 | 0 | 0 | 0 | — |
| 107258 | 150 | survived | 5 | 525 | 14 | 21 | 4 | 4 | 2 | 82, 107 |
| **Band** | | **3 lost / 5 survived** | | | **112** | **169** | **21** | **21** | **5** | |

### Arm (TIER4ACCESS=1)

| Seed | Days | End | Wave | Standing | Contests | Prize rolls | In T4 | Bumps | Eff T4 | Grants | Grant day(s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107251 | 151 | survived | 4 | 150 | 11 | 25 | 1 | 2 | 3 | 0 | — |
| 107252 | 151 | survived | 5 | 375 | 17 | 28 | 4 | 3 | 7 | 0 | — |
| 107253 | 62 | village-lost | 4 | 140 | 7 | 14 | 0 | 0 | 0 | 0 | — |
| 107254 | 120 | village-lost | 4 | 199 | 14 | 22 | 3 | 2 | 5 | 1 | 47 |
| 107255 | 119 | village-lost | 5 | 485 | 18 | 23 | 4 | 2 | 6 | 0 | — |
| 107256 | 145 | village-lost | 4 | 199 | 13 | 22 | 1 | 0 | 1 | 1 | 52 |
| 107257 | 151 | survived | 4 | 199 | 13 | 20 | 3 | 1 | 4 | 0 | — |
| 107258 | 151 | survived | 4 | 199 | 14 | 19 | 2 | 1 | 3 | 0 | — |
| **Band** | | **4 lost / 4 survived** | | | **107** | **173** | **18** | **11** | **29** | **2** | |

Every grant carried exactly 2 cells (both legs, all 7 grants) — the
GUNRATE bundle is unaffected by the lever. Ctl seed 107258 is the band's
only second grant (days 82 + 107); arm has no second grant.

## 3. The zero-grant split (grantrate §2 taxonomy, both legs)

| Seed | Leg | Kind | Why |
| --- | --- | --- | --- |
| 107251 | ctl | rolled-and-lost | 2 eff tier-4 rolls, 0 grants |
| 107253 | ctl | died-before-gate | village lost day 62 |
| 107255 | ctl | rolled-and-lost | 5 eff tier-4 rolls, 0 grants |
| 107257 | ctl | thin-gate | 0 eff tier-4 rolls in 151d, 12 prize rolls |
| 107251 | arm | rolled-and-lost | 3 eff tier-4 rolls, 0 grants |
| 107252 | arm | rolled-and-lost | 7 eff tier-4 rolls, 0 grants |
| 107253 | arm | died-before-gate | village lost day 62 |
| 107255 | arm | rolled-and-lost | 6 eff tier-4 rolls, 0 grants |
| 107257 | arm | rolled-and-lost | 4 eff tier-4 rolls, 0 grants |
| 107258 | arm | rolled-and-lost | 3 eff tier-4 rolls, 0 grants |

The lever moved one village across the split (ctl 107257 thin-gate → arm
rolled-and-lost, 0 → 4 eff tier-4 rolls) and deepened the rolled-and-lost
bucket everywhere else — but rolled-and-lost is exactly the bucket a
tier-4 lever cannot fix by itself: the gate opens and the pool still says
no. Arm 107252 is the sharpest case: 7 effective tier-4 rolls, 0 guns.

## 4. Gun arrivals + the other door

Arrivals (contest grants + kill-loot drops): ctl 5, arm 3. The arm leg's
third arrival is the kill-loot door working end to end on seed 107257:
day 107 a player kill drops a searcaster onto the monster's corpse
(`tbKillRewards` → `corpse_107_ndgq9u`) and the scholar takes it the
SAME day. The gun then travels: by day 150 it sits on villager
gen_suy9tl7's unburied corpse (`corpse_125_kgfb84`) — taken, carried,
lost with its holder. The contest grants on both legs are the same human
shape as grantrate: arm 107254's day-47 grant to gen_7kr9k5d (2 cells,
redirect matched) is IDENTICAL to ctl 107254's day-47 grant — same
fighter, same day — the lever changed the tier-4 count, not the moment.

## 5. Sense-test — the lever changes counts, not the story

The grant that both legs share (107254, day 47, gen_7kr9k5d) reads the
same in both corpora: won on camera, redirected to the expedition-active
fighter, 2 cells beside it. Nothing in the arm leg reads as a different
kind of event — the second-chance tier-4 rolls pay ordinary tier-4 items
(arm tier-4 outcomes: the same pool — armor, weapons, genesis_seed, one
lone fusion_cell on top of the 2 searcasters). No new narration was added
by the lever (it is silent inside the loot table by design); the prize
announcement is unchanged. Sense-test passes in the narrow sense: no
robotic or incoherent behavior introduced. What the sense read does show
is the NO-GO in human terms: arm 107252 entered 17 contests, won 7
effective tier-4 rolls, and came home with nothing to show for any of
them — the village that does everything right and still loses the
lottery seven times running.

## 6. Balanced panel (§15)

`scripts/build-tier4access-panels-a.js` + `scripts/balance-panel.js
compare` (before = ctl, after = arm, 8 paired cases):
**review_required** (exit 2 — the tool's exit for review_required).
Per-metric: national 0 → 0, survival30/60 1 → 1, village deaths per run
85.5 → 81.75 — all **no_material_signal**; village deaths per 100 days
63.05 → 63.78 and community loss 0.375 → 0.5 are **regression_watch**
with intervals straddling 0 (the community-loss move is the single seed
107254, §Wall). The review_required decision is driven by unobserved
metrics, as in grantrate — no observed metric shows a material signal.
Panel: `evidence/2026-11-21/tier4access-a-panel.md` (+ `.json`,
`-before.json.gz`, `-after.json.gz`).

## 7. Instrument notes and deviations

- **Amendment A (smoke catch, before any judged sim):** the smoke on seed
  107251 caught a stale-read bug — shy-vault nulls return before the
  lever block, so `_t4aLast` still held the previous roll's values and
  the driver counted 3 bumps where the lever recorded 2. Fix:
  monotonic `seq` on every `_t4aLast` write + driver stale-seq guard
  (prereg Amendment A). Gate re-verified on the pilot arm leg's 107251:
  bump rows (2) == stats bumped (2), joins 100%, 0 errors.
- **Write flap (host):** active in bursts through this run. It ate two
  ctl corpus writes (107251 twice, 107252 once — each fell back to the
  driver's stdout `@@FALLBACK` print) and blocked two redirected driver
  launches (silent exit 1 in ~1.5s with the error output itself eaten;
  terminal-output launches worked). Recovery: re-ran the lost seeds with
  terminal output once the probe showed the flap clear; ctl 107251's
  re-run reproduced the first run's trajectory EXACTLY (68 deaths, 21
  prize rolls, standing 199) — instrument fidelity confirmed. The
  safe-commit index clobber struck on all three commits and was repaired
  each time with the `git ls-tree -r HEAD` pipe, verified by empty status
  + empty diff HEAD + hash-object match.
- **check.js --quick NOT completed:** the run started it after the lever
  landed but it ran past 4 minutes and was killed for time; the proof
  test (23/23) + analyzer selftest (25/25) + `node --check` on both
  reverted files are green. The ship loop runs the full check before
  landing; this branch carries no game-code change at the tip.
- **What was NOT measured:** whether a granted gun is ever FIRED in a
  fight after receipt; table entry/sitting (not instrumented — left null,
  never faked); player deaths per run (not instrumented).

## Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged sim** (prereg, committed `929afcf10`;
  Amendment A committed `8b4693864` before the pilot): primary, secondary,
  instrument validity, coverage, guardrails, answer quantified. Bars 3–6
  pass; bars 1–2 miss. No bar was re-scored; the verdict is NO-GO on the
  frozen bars.
- **The static prior was too optimistic.** The prereg predicted the arm
  tier-4 rate at ~28% (first-roll 25% → 43.75% on apex-eligible extreme
  rolls). Measured 16.8%. The miss is in the eligible base, not the
  second-chance math: only a minority of prize rolls are apex-eligible
  extreme rolls at wave 4+ (non-extreme contests and pre-wave-4 rolls
  never reach the lever), so doubling the apex-eligible rate lifts the
  band rate by ~4 points, not ~12. A follow-up lever that wants the
  band rate to 25%+ must widen eligibility (more extreme contests, or
  an earlier apex), not just re-roll the same gate — that is a design
  question, not a knob on this lever.
- **The grant metric is pool-noise-dominated at this n.** Grants 5 → 2
  while tier-4 rolls rose 21 → 29: with 2–5 events per leg, the pool
  draw (22% per tier-4 roll) swamps the gate effect. A future supply
  measurement should judge primarily on tier-4 rolls (the gate) and
  treat grants as a secondary with a wider band or a confirm round —
  this run's frozen secondary bar did its job by refusing to bless a
  gate win that didn't buy guns, but the bar as written cannot
  distinguish "gate opened, pool ran cold" from "gate didn't open"
  without more seeds.
- **The zero-grant split is the durable finding.** Both legs agree:
  rolled-and-lost dominates (3/4 ctl, 5/6 arm zero-grant seeds). The
  funnel's binding constraint has moved one stage down: it is no longer
  only the tier-4 gate — at 16.8% tier-4 access the pool itself is the
  wall for the villages that reach the gate. Any next supply arm should
  carry that split as its primary lens.

## Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-21 — tier-4 pool is the wall after the gate — with the
  second-chance lever, effective tier-4 rolls rose 21 → 29 (+38%) yet
  contest grants fell 5 → 2: arm tier-4 rolls paid the gun 2/29 (6.9%)
  vs the 22.2% design rate. At 16.8% tier-4 access the pool draw, not
  the gate, decides whether a village that reaches the gate gets a gun
  (arm 107252: 7 eff tier-4 rolls, 0 grants).
- [open] 2026-11-21 — second-chance static prior overstated the base —
  the prereg's ~28% arm tier-4 rate assumed most prize rolls are
  apex-eligible extreme rolls; measured 16.8% because non-extreme and
  pre-wave-4 rolls never reach the lever. A 25%+ band rate needs wider
  eligibility (more extreme contests / earlier apex), a design question.

## Files

- Prereg: `evidence/2026-11-21/sim-tier4access-a-prereg.md` (`929afcf10`;
  Amendment A in `8b4693864`)
- Instrument (kept): `scripts/analyze-tier4access-a.js` (selftest 25/25),
  `scripts/build-tier4access-panels-a.js`
- Instrument (lever-coupled, deleted from the tip; in history under
  `62b8a8a63` / `8b4693864`): `scripts/tier4access-driver-a.js`,
  `scripts/test-tier4access-a.js` (proof test 23/23 against the lever)
- Lever (reverted at the tip; in history under `62b8a8a63` /
  `8b4693864`): `src/js/game.js` (rollAlienLoot TIER4ACCESS block),
  `src/js/contests.js` (`risk:` pass-through in `_cxItemPrize`)
- Pilot: `evidence/2026-11-21/perseed-tier4access-a-ctl/` (8 corpora),
  `evidence/2026-11-21/perseed-tier4access-a-arm/` (8 corpora),
  `evidence/2026-11-21/tier4access-a-ctl-analysis.json`,
  `evidence/2026-11-21/tier4access-a-arm-analysis.json`,
  `evidence/2026-11-21/tier4access-a-judgement.json`
- Panel: `evidence/2026-11-21/tier4access-a-panel.md` (+ `.json`,
  `-before.json.gz`, `-after.json.gz`)
- Logs: `evidence/2026-11-21/tier4access-a-arm.log/.err`,
  `tier4access-a-ctl.log/.err`

## Run identity

- **Base:** worktree HEAD `5accf69db`; branch `sim-tier4access-a`;
  prereg commit `929afcf10`; lever commit `62b8a8a63`; amendment commit
  `8b4693864`; tip: lever reverted, game code byte-identical to `5accf69db`.
- **Pilot command (arm):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
  FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1
  TIER4ACCESS=1 MODE=arm OUTDIR=perseed-tier4access-a-arm
  SEEDS=107251,107252,107253,107254,107255,107256,107257,107258
  RUN=tier4access-a node scripts/tier4access-driver-a.js` (~8.4 min).
  **Ctl:** identical minus `TIER4ACCESS` (`MODE=ctl`,
  `OUTDIR=perseed-tier4access-a-ctl`; 107251 re-run alone after a flap
  loss, reproduced exactly).
- **Analyze commands:** `node scripts/analyze-tier4access-a.js --dir
  evidence/2026-11-21/perseed-tier4access-a-ctl --out
  evidence/2026-11-21/tier4access-a-ctl-analysis.json` (LEG-OK),
  same for arm (LEG-OK), then `node
  scripts/analyze-tier4access-a.js --judge
  evidence/2026-11-21/tier4access-a-ctl-analysis.json
  evidence/2026-11-21/tier4access-a-arm-analysis.json --out
  evidence/2026-11-21/tier4access-a-judgement.json` → **NO-GO**.
- **Panel command:** `node scripts/build-tier4access-panels-a.js &&
  node scripts/balance-panel.js compare --before
  evidence/2026-11-21/tier4access-a-panel-before.json.gz --after
  evidence/2026-11-21/tier4access-a-panel-after.json.gz --out
  evidence/2026-11-21/tier4access-a-panel` → review_required
  (unobserved metrics), no material signal on observed metrics.
- **Proof test:** `node scripts/test-tier4access-a.js` → 23/23 green
  (against the lever commit; file deleted from the tip with the lever).
  **Selftest:** `node scripts/analyze-tier4access-a.js --selftest` →
  25/25 green.
