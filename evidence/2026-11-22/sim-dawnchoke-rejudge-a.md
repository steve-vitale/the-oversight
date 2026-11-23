# sim-dawnchoke-rejudge-a — EVIDENCE (Loop A 0215Z)

**Arm:** sim-dawnchoke-rejudge-a · **Loop A run:** fleshout-20261123T0215Z
**Axis:** scale-onramp (converging, NOT converged) · **Blank:** re-judge of
the forager-companion lift from run fleshout-20261122T2115Z
(evidence/2026-11-22/sim-dawnchoke-a.md)
**Type:** LEVER (one game-code change, two-leg contrast: ctl vs armed) —
RE-JUDGE, not a new lever
**Base master:** `a4603add1` (worktree
`~/workspace/worktrees/sim-dawnchoke-rejudge-a`, branch
`sim-dawnchoke-rejudge-a`)
**Prereg:** `evidence/2026-11-22/sim-dawnchoke-rejudge-a-prereg.md` (frozen
2026-11-23 ~02:30 UTC, before any judged run)
**Band:** 107423–107430 (8 seeds — the SAME band as 2115Z, reused
deliberately so the re-judge is comparable), horizon 150d death-aware,
competent verbatim policy.
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
`PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `HYPOFLOOR` unset.

## Verdict: NO-GO (two independent frozen bars fail)

The re-judge reproduces the 2115Z numbers EXACTLY on identical seeds
and substrate — attempts 12 → 57, launches 4 → 36, 2 of 3 stuck plans
departed, choke 0.863 → 0.792, starvation 5 → 6, median survival
141 → 131, total deaths 91.875 → 102.625 mean — despite the base
having moved since 2115Z. The lever's effect is real and attributable.
But the verdict is NO-GO on TWO independent frozen bars, either one
alone enough:

1. **Bar 8 (NEW total-deaths guardrail): FAIL.** Armed mean total
   village deaths 102.625 vs control 91.875 = **+10.75 per run**,
   over the frozen bar of +5. Deaths per extra launch: **2.69**
   (86 extra deaths / 32 extra launches). The 2115Z panel's
   regression signal is now a judged NO-GO, not just a warning.
2. **Bar 2 (corrected det-gate): FAIL** on 2 of 8 seeds (107423,
   107429) — but NOT the way 2115Z failed. The anchors are now
   genuinely verified (all 6 checks pass, `checked: true`), and the
   bound now fires on every seed. The failure is a recording-order
   artifact: see § Det-gate.

No bar was re-scored. The lever is REVERTED again — it stays on the
held branch `sim-dawnchoke-a` (commit `4ac23b12f`) and does not reach
master. The corrected instrument + this evidence land.

## The fix (unchanged from 2115Z, re-applied and verified)

Cherry-picked ONLY the src/js hunks from held commit `4ac23b12f`
(verified: the applied diff is identical to the held commit's src
diff apart from the commit header): retire `PROFILEGATE4` in
`findCompanion` in BOTH `villager-brain.js` and `win-plan.js`
(forager-profile companions may answer staged wave-4+ plans;
homebodies stay out). The re-applied lever's file-content shas match
the 2115Z armed leg exactly (brain `8753dc2d5e65`, winplan
`c32618daf0ef`); the control shas match the 2115Z control leg
(`89d73e040fbe` / `9de1187e731d`). The lever-specific proof test
(`scripts/test-dawnchoke-a.js`, brought from the held branch) is
22/22 on new code and fails on old code (§C, base `f2d03db92`).

## DIAG (control leg — reproduces 2115Z exactly)

`evidence/2026-11-22/dawnchoke-rejudge-a-diag.json` (8 seeds):

- **Staged-plan days 241, choke days 208, choke rate 0.863** —
  identical to the 2115Z DIAG in every aggregate.
- **Stuck plans (control): 3** — the same three: 107426
  miguel_santos (dockworker, forager profile, 47 staged days
  d63–113); 107428 visjoin_87 (firefighter, forager profile, 7
  staged days d97–103); 107430 visjoin_108 (12 staged days
  d111–123).
- Control attempts 12, launches 4 — identical to 2115Z.

## Bars (judge: the corrected analyzer on the full band)

| # | Bar | Result |
|---|---|---|
| 1 | Instrument validity (needwave proof 26/26 green; dawnchoke proof test 22/22, fails old code, passes new; analyzer selftest 36/36; 0 instrument errors on all 16 seed files) | PASS |
| 2 | Det-gate, corrected (0 first-release rows on ctl; pre-bound streams identical; first divergence lever-attributable; anchors actually verified) | **FAIL** (2/8 seeds — party-order artifact; see § Det-gate) |
| 3 | PRIMARY — wave-4+ departure attempts, armed ≥ control + 4 | PASS (57 vs 12 = +45) |
| 4 | PRIMARY (second half) — a stuck plan departs | PASS (2 of 3: miguel_santos, visjoin_87) |
| 5 | SECONDARY — launches, armed ≥ control (reported, not judged) | 36 vs 4 |
| 6 | GUARDRAIL — starvation, total armed ≤ control + 2 and no seed worse by > 2 | PASS (6 vs 5; max per-seed excess 2, exactly at the limit) |
| 7 | GUARDRAIL — survival, median armed ≥ 0.8 × control | PASS (131 vs 141 = 0.93×) |
| 8 | GUARDRAIL — total deaths (NEW), armed mean ≤ control mean + 5 | **FAIL** (102.625 vs 91.875 = +10.75) |
| 9 | NO-GO rule | NO-GO (bars 2 and 8) |

## Numbers (analyzer `evidence/2026-11-22/dawnchoke-rejudge-a-judgment.json`)

| | Control | Armed |
|---|---|---|
| Wave-4+ departure attempts | 12 | 57 |
| Wave-4+ launches | 4 | 36 |
| Holds | 5 | 21 |
| Staged-plan days | 241 | 197 |
| Choke days | 208 | 156 |
| Choke rate | 0.863 | 0.792 |
| Starvation deaths | 5 | 6 |
| Total village deaths (mean/run) | 91.875 | 102.625 |
| Deaths per extra launch | — | 2.69 |
| Median survival (days) | 141 | 131 |
| Instrument errors | 0 | 0 |

Per-seed attempts (ctl → arm): 107423: 7 → 3; 107424: 0 → 3;
107425: 0 → 0; 107426: 0 → 14; 107427: 0 → 0; 107428: 0 → 15;
107429: 5 → 6; 107430: 0 → 16. Launches (ctl → arm):
107423: 4 → 3; 107424: 0 → 3; 107425: 0 → 0; 107426: 0 → 14;
107427: 0 → 0; 107428: 0 → 14; 107429: 0 → 0; 107430: 0 → 2.
Per-seed total deaths (ctl → arm): 107423: 104 → 102;
107424: 69 → 86; 107425: 193 → 193; 107426: 59 → 80;
107427: 70 → 70; 107428: 69 → 106; 107429: 88 → 88;
107430: 83 → 96. The death cost concentrates on the seeds where
the lever fires hardest (107428 +37, 107426 +21, 107424 +17,
107430 +13) — the villages that finally march out are the ones
that bleed. Death causes across both legs are overwhelmingly
monster-caused (monster/expedition 642, monster/villager combat
518, monster/combat 204; starvation 11 of ~1,556 deaths).

Wall numbers: wins 0 / 0, national 0 / 0, wave-5 reached
2 → 1, wave-4 reached 8 / 8, median survival 141 → 131,
villages lost 4 → 6.

## Det-gate (FAIL — root-caused from the corpora)

The corrected bound fires on all 6 diverging seeds
(107425 and 107427 are byte-identical legs, bound null, pass).
Anchors are genuinely verified now — all 6 checks return
`checked: true, pass: true` (ctl anchor `58813996b912…`,
arm anchor `a7a60b20f1d3…`, both brain/winplan shas per leg).
The 2115Z vacuous-`checked:false` defect is FIXED.

The gate fails on 2 seeds, and the cause is precise:

- **107423:** first divergence day 99, first extra depart call
  day 101. **107429:** first divergence day 146, first extra
  depart call day 150.
- On both days the "divergence" is the SAME departure recorded
  with the party members in a different order. Seed 107423 d99:
  yara_haddad vs the herald departs on BOTH legs, same day, same
  three companions — but the armed leg lists them
  `[thabo_maseko, app_mgpspht5396, vasyl_shevchenko]` where the
  control lists `[app_mgpspht5396, thabo_maseko,
  vasyl_shevchenko]`. The beat line differs only in name order
  ("Yara sets out with Thabo, Ofelia and Vasyl" vs "Yara sets out
  with Ofelia, Thabo and Vasyl"). Seed 107429 d146 is the same
  shape (same departure, companion order swapped). The downstream
  rows (planSeeds, v4fights, planCensus) differ only through the
  recorded party order.
- Why the order changes: widening the companion pool changes
  `findCompanion`'s candidate ordering, so the companion-rank
  order recorded for a departure that happens on both legs shifts.
  The lever's first *observable* effect on these seeds is a
  re-ordering of a departure that was already happening — not a
  new depart call. The frozen attribution rule (first divergence
  day must EQUAL the first extra depart call day) cannot see
  this: the divergence is lever-caused, but it is not a depart
  call, so the gate fails on a recording-order artifact rather
  than on non-comparability.

The legs ARE comparable — pre-bound streams are identical on all
8 seeds, and the only pre-extra-depart differences are these two
order permutations of otherwise identical departures. But the
frozen bar as written fails, so the verdict stands as NO-GO. A
further re-judge would need an order-insensitive comparison of
party arrays (compare departures by day/vid/target/member-set,
not full-row JSON) before re-running — and it would still have
to clear bar 8, which fails on its own.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-22/dawnchoke-rejudge-a-panel.md` (8 paired cases,
compare exit 2 = `review_required` by design):
**review_required, REGRESSION signal** — identical to the 2115Z
panel in every number. Village deaths 91.875 → 102.625 (+10.75/run,
95% interval 2.1–19.9); per-100-days 71.7 → 81.2 (+9.5, interval
2.9–16.4); community loss 0.5 → 0.75 (regression_watch). National
0 → 0, wins 0 → 0. The panel and the frozen bar 8 now agree: the
lever buys departures with lives, and the price is over the bar.

## Sense-test

The stuck plans depart and the morning says so. Seed 107426,
day 63 — miguel_santos's plan has sat staged 47 days:

> 📺 SYSTEM: "Miguel sets out with Miriam after The Strike —
> the fire marks the trail."

Seed 107428, day 97 — visjoin_87 (firefighter, forager profile,
the proof-test fixture's own case) departs vs the herald, with a
party of three:

> 📺 SYSTEM: "Arthur sets out with Ihaka and Fiona after The
> Herald — the fire marks the trail."

The departure beats speak on converted launches; no silent
departures were observed in the converted set. One beat-text
quirk, present identically on BOTH legs (pre-existing, not
lever-caused): a companion is sometimes named by a generated
physical description instead of a name — seed 107423 d7,
"Sean sets out with A person, maybe 40s, with deep-set eyes"
(appended to `sim-findings.md`).

## Village assessment

The re-judge confirms the 2115Z picture with no new ambiguity:
opening the companion gate to foragers un-dries the funnel at
once — attempts nearly quintuple, two of three stuck plans walk
out within days, and the morning says so in plain words. But the
villages pay for it in blood: the seeds where the lever fires
hardest are exactly the seeds that bleed most (107428 +37 deaths,
107426 +21), and two more villages are lost outright (4 → 6).
The ask is necessary and not sufficient — 107430's visjoin_108
still never departs (16 attempts, 2 launches, 14 holds on the
armed leg), and the death ledger says the departures that DO
happen are bought at 2.69 lives each. The next lever on this
axis should pair departures with safety (better gear or party
composition on the way out), not open the gate wider. The wall
does not move: national 0, wins 0, wave-5 unlocks 2 → 1.

## Metric review

- **Bar 2's attribution rule is still too narrow, in a new way.**
  The 2115Z failure was a bound written for the wrong fix shape
  (profile gate vs companion gate). The re-judge fixed the shape
  (first extra depart call / first stream divergence) — but the
  comparator still treats a party-order permutation as a
  divergence, and the attribution rule demands the first
  divergence BE a depart call. On 2 seeds the lever's first
  observable effect is re-ordering a departure that happens on
  both legs. A further re-judge should compare departures by
  (day, vid, target, member-set) with order-insensitive party
  arrays, and define the bound as the first divergence that is
  not a pure re-ordering. Do NOT re-score this run: the frozen
  bar fails as written, and bar 8 fails independently, so the
  verdict is NO-GO either way.
- **Bar 8 worked as designed.** It was priced as a real test
  (+5 mean) against the 2115Z +10.75, and it failed at exactly
  the 2115Z value. The death cost is now a judged NO-GO, not a
  panel warning. Any future lever on this axis must either cut
  the deaths-per-launch or carry an explicit accepted-cost call
  from Steve.
- **Reproducibility note.** Every judged aggregate reproduces
  the 2115Z arm exactly (attempts, launches, choke, starvation,
  medians, deaths, panel) on identical seeds and substrate after
  the base moved — the instrument is stable and the lever's
  effect is not base noise.
- **Instrument note.** The control leg's second half initially
  failed to launch: the shell redirect for its log file failed
  with "No such file or directory" (a transient write refusal —
  the write flap's signature on fresh files). The half was re-run
  cleanly; no data was lost. The proof-test header's DIAG
  snapshot ("93/93") is still the stale 5-seed authoring figure;
  the final 8-seed DIAG is 154/157 (98%). The header is stale;
  the final numbers govern.
- No bar re-scored. No metric changed mid-run.

## Decision (2026-11-23)

**Lever REVERTED — not landed.** The forager-companion lift
(retire `PROFILEGATE4`) stays on the HELD branch
`sim-dawnchoke-a` (commit `4ac23b12f`) and does not reach master:
two frozen bars fail (det-gate bar 2, total-deaths bar 8), so
per the kill protocol the game-code change is reverted
zero-trace (this branch is reset to the instrument commit
`58813996b`; the lever commit `a7a60b20` is dropped from the
branch). The `PROFILEGATE4` env gate therefore stays as it was.

**Instrument + evidence LANDED.** The corrected analyzer
(shape-agnostic bound, real anchor checks, total-deaths bar;
selftest 36/36) + prereg land in commit `58813996b`; the
evidence (prereg, this file, `dawnchoke-rejudge-a-judgment.json`,
`dawnchoke-rejudge-a-diag.json`, `dawnchoke-rejudge-a-panel.*`,
per-seed corpora `perseed-dawnchoke-rejudge-a-ctl/` +
`perseed-dawnchoke-rejudge-a-arm/`, driver logs) lands in the
evidence commit on this branch. The proof test
`scripts/test-dawnchoke-a.js` stays on the held branch with the
lever: it asserts a depart call on new code and none on old code,
so it would fail on the reverted master — it is lever-specific,
not landable without the lever. Pre-flight results recorded at
run time: needwave proof green on base (26/26), analyzer
selftest 36/36, proof test 22/22 on new code (fails old-code
control).

**Next step:** the forager dawn choke as measured (DIAG 0.863)
is answered at the mechanism level, but the lift as priced
costs 2.69 lives per extra launch and is NO-GO. The next arm on
this axis should pair departures with safety (gear/party
composition on the way out) rather than re-opening the gate, and
any further re-judge needs the order-insensitive det-gate bound
first. Convergence state: **killed-at-pilot** (second NO-GO on
this lever; the lever is parked, not re-run as-is).
