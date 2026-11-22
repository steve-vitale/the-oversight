# sim-homebody-a — EVIDENCE (Loop A 2115Z, finisher closeout)

**Arm:** sim-homebody-a · **Loop A run:** fleshout-20261122T2115Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2498/#2568
(the homebody-holder launch-attempt wall)
**Type:** LEVER (one game-code change + instrument, two-leg contrast:
ctl vs armed) · **Base master:** `f2d03db92`
**Prereg:** `evidence/2026-11-22/sim-homebody-a-prereg.md` (frozen
2026-11-22 ~21:35 UTC, before any judged run)
**Band:** 107423–107430 (8 seeds), horizon 150d death-aware,
competent verbatim policy.
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
`PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` unset.

## Verdict: INCONCLUSIVE (zero-launch rule)

The control leg saw **4** wave-4+ launches — below the frozen
5-launch floor — so the frozen zero-launch rule fires: there is
nothing to attribute and the verdict is **INCONCLUSIVE** (not GO,
not NO-GO). The primary bar also missed (armed 5 vs control 4 =
+1, bar +4). Every other bar passed.

The lever's mechanism demonstrably works (2 handoff calls, 1
Dale-class conversion, homebody holds 5 → 0, selected-blocked
share 0.417 → 0), but the launch funnel on this band is nearly
dry — all 4 control launches happened on a single seed — so the
effect size is unmeasurable here. Next step: a wider band
(16 seeds), or a substrate check on why launches are absent.

## Bars (judge: the analyzer on the full band)

| # | Bar | Result |
|---|---|---|
| 1 | Instrument validity (proof test 100% new-code, fails old-code; analyzer selftest 100%; 0 instrument errors on all 16 seed files) | PASS |
| 2 | Det-gate (0 handoff rows on ctl; pre-bound streams byte-identical; first divergence on/after first-handoff day) | PASS |
| 3 | PRIMARY — wave-4+ launches, armed ≥ control + 4 | FAIL (5 vs 4 = +1) |
| 4 | PRIMARY — Dale-class conversion ≥ 1 | PASS (1) |
| 5 | GUARDRAIL — starvation, total armed ≤ control + 2 and no seed worse by > 2 | PASS (5 vs 5, max excess 0) |
| 6 | GUARDRAIL — survival, median armed ≥ 0.8 × control | PASS (141 vs 141) |
| 7 | NO-GO rule | n/a — verdict is INCONCLUSIVE by the zero-launch rule |
| — | Zero-launch rule: either leg < 5 launches → INCONCLUSIVE | FIRED (control 4) |

## Numbers (analyzer `evidence/2026-11-22/homebody-a-analysis.json`)

| | Control | Armed |
|---|---|---|
| Wave-4+ launches | 4 | 5 |
| Trio launches | 2 | 2 |
| Launches with a beat | 4/4 | 5/5 |
| Handoffs (calls) | 0 | 2 |
| Handoff launches | 0 | 1 |
| Dale-class conversions | 0 | 1 |
| Homebody holds | 5 | 0 |
| Depart rows (wave-4+, brain) | 12 | 8 |
| Selected-blocked share | 0.417 | 0 |
| Starvation deaths | 5 | 5 |
| Median survival (days) | 141 | 141 |
| Instrument errors | 0 | 0 |

Per-seed wave-4+ launches: every control launch (4) and every
armed non-handoff launch (4) happened on seed **107423**
(days 99, 103, 106, 107, all vs the herald, parties of 4/3/2/1).
The other seven seeds launched **zero** wave-4+ parties on either
leg. The single armed-only launch is the handoff conversion on
seed 107429, day 146.

Wall numbers (both legs identical): wins 0, national 0, wave-5
reached 2, wave-4 reached 8, median survival 141, max survival
151, villages lost 4.

## Handoffs (2 calls on the armed leg)

| Seed/day | Old holder | MaxD | New leader | Target | NeedWave | Result |
|---|---|---|---|---|---|---|
| 107425 d53 | theo_lindqvist (explorer) | 6 | — | ad_break | 3 | skip (not a case: holder walks, wave-3) |
| 107429 d146 | naran_tumen (homebody) | 0 | app_mgpspk7i305 (Vaishali) | reunion | 4 | **launch** (Dale-class) |

The converted launch went out **solo** (party `[]`) — the plan
moved and the new leader departed alone; no companion followed.
The handoff does not guarantee companions follow. The old
holder's plan entry was deleted; the new leader's plan kept
stage/target/node/needWave, stage `'hunt'`.

## Det-gate (PASS)

Bounds are the first handoff-call day per seed: 107425 d53,
107429 d146; the other six seeds never called the method and
their event streams are byte-identical between legs for the
whole run. Pre-bound streams match on every seed; anchors
verified (ctl/arm win-plan.js + villager-brain.js, all pass).
The legs are comparable; the thin band, not the instrument,
is the limit.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-22/homebody-a-panel.md` (8 paired cases):
**review_required, no material signal.** National 0 → 0, wins
0 → 0, community loss 0.5 → 0.5, village deaths 91.875 → 92
(+0.125, regression_watch on the raw count only; per-100-days
+0.08, no signal). The panel agrees with the verdict: nothing
moves, because one extra launch on one seed cannot move a
panel.

## Sense-test

The converted launch reads as a real transfer, not a silent
mechanism. Seed 107429, day 146:

> "Naran never leaves Haven — Vaishali takes the plan and leads
> the party."

followed by the ordinary departure beat with the new leader.
The homebody stays home (finding #1409 honored — the plan
moves, the person does not); the line names the transfer once,
and cannot repeat for the same plan.

## Village assessment

The villages on this band are launch-starved, not
launch-blocked: seven of eight never launch a wave-4+ party
at all, with or without the handoff. The one village that does
launch (107423) launches four times against the herald in nine
days and needs no help. The handoff removes exactly the block
it was built for — a range-0 holder sitting on a real plan —
and on this band that block fires once in eight villages.
Starvation (5 deaths each leg) and survival (141 days median
both legs) are untouched by the lever. The wall is upstream of
this arm: plans are not being staged, or holders are not
reaching the depart call at all — the dawnchoke arm on the same
band measures that side (see sim-dawnchoke-a.md: 241 staged
days, 208 choked).

## Metric review

- The +4 primary bar assumed a livelier funnel than this band
  has (~4 launches / 8 seeds, all on one seed). On a band this
  thin the bar is nearly unmeetable by any depart-time lever.
  A re-judge should use a wider band (16 seeds) or pick a band
  where the control leg launches ≥ 5 — and should pre-register
  the bar against the measured control base rate, not a fixed +4.
- The zero-launch rule fired on the control leg only (4 < 5);
  the armed leg cleared it (5). The rule as written fires if
  EITHER leg is below 5 — correct here, since the comparison
  needs a control base to attribute against.
- The Dale-class bar (≥ 1 conversion) passed on a single solo
  launch. A conversion that goes out alone is weaker evidence
  than a party conversion; a future bar should distinguish
  solo vs party conversions.
- No bar re-scored. No metric changed mid-run.

## Decision (finisher, 2026-11-22)

**Lever REVERTED — not landed.** Commit `e62603af0`
(`winPlanHomebodyHandoff` in win-plan.js + the two call sites
in villager-brain.js) stays on the HELD branch
`sim-homebody-a` and does not reach master: an INCONCLUSIVE
verdict cannot support landing unconditional game code.
Revert is by non-landing (zero trace in the game on master).

**Instrument + evidence LANDED.** The instrument commit's
non-test contents (prereg, driver `scripts/homebody-driver-a.js`,
analyzer `scripts/analyze-homebody-a.js`, panel builder
`scripts/build-homebody-panels-a.js`) and the evidence
(prereg, this file, `homebody-a-analysis.json`,
`homebody-a-panel.*`, per-seed corpora
`perseed-homebody-a-ctl/` + `perseed-homebody-a-arm/`) land
on master. The proof test `scripts/test-homebody-handoff-a.js`
stays on the held branch with the lever: it asserts the handoff
on new code and fails on old code, so it would fail on the
reverted master — it is lever-specific, not landable without
the lever. Pre-flight results recorded at run time: proof test
100% on new code (fails old-code control), analyzer selftest
100%.

**Next step:** re-judge the handoff on a wider band (16 seeds)
with the bar set against the measured control base rate; or
fold the handoff into a launch-funnel arm that also attacks
plan staging (the dawnchoke side). Findings #2498/#2568 stay
OPEN — the mechanism works, the effect is unproven.
