# sim-homebody-rejudge-a — EVIDENCE (Loop A 0215Z)

**Arm:** sim-homebody-rejudge-a · **Loop A run:** fleshout-20261123T0215Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2498/#2568
(the homebody-holder launch-attempt wall)
**Type:** LEVER RE-JUDGE (one game-code change + instrument, two-leg
contrast: ctl vs armed) · **Base master:** `a4603add1`
**Prereg:** `evidence/2026-11-22/sim-homebody-rejudge-a-prereg.md` (frozen
2026-11-23 ~02:50 UTC, before any judged run)
**Band:** 107431–107446 (16 seeds), horizon 150d death-aware,
competent verbatim policy.
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
`PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` unset.
**Convergence state:** converging (axis still converging, NOT converged).

## Verdict: NO-GO (frozen primary bar missed) — §14a: METRIC-BROKEN

The armed leg launched **56** wave-4+ parties against the control
leg's **51** (+5, +9.8%). The frozen primary bar demanded
**≥ ceil(1.5 × 51) = 77** — a +26 gain. The bar missed by 21
launches. Every other frozen bar passed, including the corrected
Dale bar: **both** Dale-class conversions went out **with
companions** (a trio and a pair; zero solo conversions), answering
the 2115Z caveat directly.

The kill is classified **METRIC-BROKEN**, not CONCEPT-DEAD. The
lever's mechanism is demonstrated on this band: every convertible
range-0 hold converted (2/2), homebody holds fell 36 → 0, no
guardrail moved, the det-gate is clean. The bar was mis-scoped: it
was set as a multiple of TOTAL launches, but the lever can only move
the small subset of launches held by range-0 holders — the
addressable pool on this band is 2, while the bar demanded +26.
A bar whose denominator is a quantity the lever cannot touch is
unachievable regardless of the concept's merit. See "Metric review".

**Cross-check (analyzer's own verdict, old bars): GO.** The reused
analyzer judges the 2115Z bars (primary +4 absolute, Dale ≥ 1 any
conversion): +5 passes +4, 2 conversions pass ≥ 1, all guardrails
pass. The divergence is entirely the primary bar: the old absolute
bar passes, the new relative bar fails — because the control leg on
this band launched 51 times, 6.4× the 2115Z base rate (4/8 seeds)
the relative bar was calibrated against. The relative formula was
frozen to equal +4 at an expected base of ~8; at the actual base of
51 it demands +26. Neither verdict is re-scored: the frozen
re-judge bars are the judge, and they say NO-GO.

## Bars (judge: this evidence file, from the analyzer's raw numbers)

| # | Bar | Result |
|---|---|---|
| 1 | Instrument validity (proof test 38/38 new-code, fails old-code via §C vs `a4603add1`; analyzer selftest 28/28; 0 instrument errors on all 32 seed files) | PASS |
| 2 | Det-gate (0 handoff rows on ctl; pre-bound streams byte-identical; first divergence on/after first-handoff day) | PASS |
| 3 | PRIMARY — wave-4+ launches, armed ≥ ceil(1.5 × control) = 77 | FAIL (56 vs 51 = +5, +9.8%) |
| 4 | PRIMARY — Dale-class PARTY conversion ≥ 1 (launch, maxD 0, party ≥ 1) | PASS (2: trio + pair; 0 solo) |
| 5 | GUARDRAIL — starvation, total armed ≤ control + 2 and no seed worse by > 2 | PASS (6 vs 7, max excess 0) |
| 6 | GUARDRAIL — survival, median armed ≥ 0.8 × control | PASS (151 vs 150.5) |
| 7 | NO-GO rule | FIRED — bar 3 missed → NO-GO |
| — | Zero-launch rule: either leg < 5 launches → INCONCLUSIVE | did NOT fire (51 / 56) |

## Numbers (analyzer `evidence/2026-11-22/homebody-rejudge-a-analysis.json`)

| | Control | Armed |
|---|---|---|
| Wave-4+ launches | 51 | 56 |
| Trio launches | 39 | 43 |
| Launches with a beat | 51/51 | 56/56 |
| Handoffs (calls) | 0 | 79 |
| Handoff launches | 0 | 2 |
| Dale-class conversions | 0 | 2 |
| Party conversions (≥1 companion) | 0 | 2 |
| Solo conversions (party []) | 0 | 0 |
| Homebody holds | 36 | 0 |
| Depart rows (wave-4+, brain) | 129 | — |
| Selected-blocked share (ctl) | 0.279 | 0 |
| Starvation deaths | 7 | 6 |
| Median survival (days) | 150.5 | 151 |
| Instrument errors | 0 | 0 |

Per-seed wave-4+ launches — only two seeds differ between legs:

| Seed | Ctl | Arm |
|---|---|---|
| 107431 | 0 | 3 |
| 107432 | 2 | 2 |
| 107433 | 1 | 1 |
| 107434 | 3 | 3 |
| 107435 | 7 | 7 |
| 107436 | 3 | 3 |
| 107437 | 1 | 3 |
| 107438 | 0 | 0 |
| 107439 | 9 | 9 |
| 107440 | 19 | 19 |
| 107441 | 0 | 0 |
| 107442 | 6 | 6 |
| 107443 | 0 | 0 |
| 107444 | 0 | 0 |
| 107445 | 0 | 0 |
| 107446 | 0 | 0 |

Per-seed survival (gameDays) is identical between legs except
107431 (144 → 151: the control village was lost on day 144; the
armed village survived the full horizon). Per-seed starvation is
identical except 107431 (1 → 0).

Wall numbers: wins 0 / 0, national 0 / 0, wave-5 reached 6 / 6,
wave-4 reached 16 / 16, median survival 150.5 / 151, max survival
152 / 152, villages lost 6 / 5. The scale wall stands: no village
reached national or won on either leg.

## Handoffs (79 calls on the armed leg: 2 launches, 77 skips, 0 holds)

| Seed/day | Old holder | MaxD | New leader | Target | NeedWave | Party | Result |
|---|---|---|---|---|---|---|---|
| 107431 d81 | raj_patel (homebody) | 0 | emma_larsen | reunion | 4 | priya_nair, mia_andersson | **launch (trio)** |
| 107437 d142 | visjoin_136 (homebody) | 0 | visjoin_128 | eulogy | 4 | olivia_bennett | **launch (pair)** |

The 77 skips are all non-cases, by design: the call sites invoke
the handoff on every failed depart and the method filters — walker
holder (maxD ≥ 1), wave-3 target (e.g. elijah_scott's chorus_line,
visjoin_121's buffering), or no plan (later calls for the same
holder after the plan already moved). Zero `hold` results: every
wave-4+ range-0 case with a walkable companion converted. The
addressable pool on this band is exactly 2 — and both converted,
both with companions.

The two converted launches also unblocked their villages. Seed
107431 (control: 0 launches, 34 homebody holds, village lost d144)
launched twice more after the handoff: d87 Mia leads Emma, Luigi
and Adewale after The Reunion (a quad), d92 Luigi leads Emma,
Adewale and Lucas (a quad). Seed 107437 (control: 1 launch)
launched again d148: Simar leads Bin and Olivia (a trio). The +5
launch delta is 2 direct handoff launches + 3 downstream launches
on the two unblocked seeds; the other 14 seeds are byte-identical
between legs on launches.

## Det-gate (PASS)

Ctl leg records 0 handoff rows on all 16 seeds. Anchor check
passes: ctl files carry winplanSha `9de1187e731d` / brainSha
`89d73e040fbe` (pre-lever code), arm files carry `8b5cfd05cb33` /
`dc247673d540` (lever code); `anchorCommit` is `a4603add1` on both
legs (the lever is uncommitted — the file shas are what differ).
Pre-bound streams are byte-identical on every seed, including
skip-heavy seeds (e.g. 107436, first handoff call d10; 107444,
d6) — the handoff calls are side-effect-free before the divergence
bound, as designed.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-22/homebody-rejudge-a-panel.md` (16 paired cases):
**review_required, no material signal.** National 0 → 0, wins
0 → 0, community loss 0.375 → 0.3125 (−0.0625, no signal),
village deaths 104.8125 → 104.0625 (−0.75, no signal). The panel
agrees with the verdict's shape: the lever moves a few launches on
two seeds and nothing else at panel scale.

## Sense-test

Both converted launches read as real transfers, not silent
mechanisms. Seed 107431, day 81:

> "Raj never leaves Haven — Emma takes the plan and leads the party."

followed by:

> "Emma sets out with Priya and Mia after The Reunion — the fire
> marks the trail."

Seed 107437, day 142:

> "Raed never leaves Haven — Simar takes the plan and leads the party."

followed by:

> "Simar sets out with Olivia after Big Ugly — the fire marks the
> trail."

The homebody stays home in both; the line names the transfer once
and cannot repeat for the same plan; the companions follow on the
same target. The 2115Z caveat is closed on this evidence: no
converted launch went out solo.

Observation (not a finding): the same target renders under two
names across beats on 107431 — d87 "after The Reunion" vs d92
"after Big Big", both on departBeat rows with target `reunion`.
Likely instance nicknaming, not a defect of this arm; noted, not
filed.

## Village assessment

This band is livelier than the 2115Z band and the wall sits
elsewhere. Eleven of sixteen villages launch wave-4+ parties
without any help, and two (107439, 107440) launch 9 and 19 times —
the launch funnel is not dry here. The homebody block is real but
narrow: 36 holds on the control leg, yet only 2 of them were
convertible wave-4+ holds at depart time, both on villages that
were otherwise stuck (107431 launched nothing at all without the
handoff and lost its village on day 144; 107437 launched once).
Where the handoff fires it does more than convert one launch — it
unblocks the village, which then launches on its own twice more
with quads and trios. Starvation (7 → 6) and survival (150.5 →
151) are untouched by the lever, and no village on either leg
reached national or won: the scale wall is upstream of this arm.
Six seeds never launch at all on either leg (107438, 107441,
107443–107446) — that silence, not the homebody block, is the next
question for the funnel.

## Metric review

- **The relative primary bar's denominator is wrong for this
  lever (METRIC-BROKEN).** Bar 3 was set as a multiple of TOTAL
  launches (armed ≥ 1.5 × control). The lever can only move
  launches held by range-0 holders at depart time; on this band
  that pool is 2, while the bar demanded +26 (50% of 51). A bar
  set as a multiple of a quantity the lever cannot touch is
  mis-scoped per §14b pool sizing: the bar should have been set
  as a multiple of the addressable pool (convertible holds), not
  of total launches. The bar as frozen also has a perverse shape:
  on a dead band (control 5) it would demand only +3, while on a
  lively band (control 51) it demands +26 — the livelier the
  village, the harder the bar, for a lever whose effect is capped
  by the hold pool either way.
- **The old absolute bar (+4) passes and the new relative bar
  fails on the same numbers (+5).** That divergence is the
  calibration, not the lever: the relative bar was built to equal
  +4 at an expected base of ~8 launches (the 2115Z rate of
  0.5/seed); the actual base was 51 (3.2/seed). The 2115Z
  evidence's metric review asked for a bar "set against the
  measured control base rate" — this run did that, and the
  measured base rate on a fresh band turned out 6.4× the 2115Z
  rate. The lesson is that the base rate itself is band-dependent
  and the bar needs the pool, not the base.
- **Proposed revised metric for the next run:** primary = the
  Dale-class PARTY conversion bar (already bar 4 — keep it, it is
  the lever's own quantity) plus converted launches as a share of
  the measured convertible-hold pool (this band: 2/2 = 100%);
  launch-count delta reported, never judged. If a launch-count
  bar is wanted at all, set it from the pool: armed launches ≥
  control + (convertible holds observed on the control leg), with
  the pool measured before freezing.
- **No bar re-scored.** The verdict is NO-GO on the frozen bars
  as written. The classification (METRIC-BROKEN) and the revised
  metric above are for the next run, per §14.

## Decision

**Lever REVERTED — not landed.** The frozen verdict is NO-GO, so
the game-code change (`winPlanHomebodyHandoff` in win-plan.js +
the two call sites in villager-brain.js + the ONTOLOGY
provides-line) is reverted zero-trace in the worktree: the three
files are restored to HEAD `a4603add1` and the lever-specific
proof test `scripts/test-homebody-handoff-a.js` is removed from
the tree (it asserts the handoff and would fail on reverted
master; it stays on the held branch `sim-homebody-a` with the
lever, as in the 2115Z decision).

**Instrument + evidence LANDED.** Prereg, this file,
`homebody-rejudge-a-analysis.json`, `homebody-rejudge-a-panel.*`,
per-seed corpora `perseed-homebody-rejudge-a-ctl/` +
`perseed-homebody-rejudge-a-arm/`, and the leg logs land on
master. The driver / analyzer / panel builder on master are
unchanged (reused verbatim). Pre-flight results recorded at run
time: proof test 38/38 on new code (fails old-code control via
§C against `a4603add1`), analyzer selftest 28/28.

**Next step:** the handoff returns to the queue with a corrected
pre-registration (conversion-share primary, pool-sized launch
bar) — a NEW run, not a re-score. Findings #2498/#2568 stay OPEN:
the mechanism works and now converts with parties, but no frozen
bar has certified it for landing. The untouched question is the
six never-launching seeds.

## Run notes (infrastructure)

- **Machine restart mid-run:** the host restarted during the
  armed leg (`uptime` 1 min after the failure); the detached arm
  process for seeds 107431–107438 died with seed 107438 still
  simulating. The 15 completed arm files were verified intact
  (all parse, correct armed shas); only seed 107438 was re-run
  (MODE=arm, same substrate), and its file verifies with the
  armed shas. No ctl file was affected.
- **Write-flap blips:** the `>` redirect for the second leg log
  failed twice ("No such file or directory" on a fresh file) —
  once per leg — and the second driver process had to be
  re-launched after probing the log file into existence. No data
  lost; both legs completed 16/16.
- **Leg order:** ctl ran with the lever stashed (method count 0,
  shas `9de1187e731d` / `89d73e040fbe`); the stash pop restored
  the lever byte-identical (shas `8b5cfd05cb33` /
  `dc247673d540`, method counts 4 / 2) before the arm leg.
