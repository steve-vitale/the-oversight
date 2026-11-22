# sim-dawnchoke-a — EVIDENCE (Loop A 2115Z, finisher closeout)

**Arm:** sim-dawnchoke-a · **Loop A run:** fleshout-20261122T2115Z
**Axis:** scale-onramp (converging, NOT converged) · **Blank:**
sim-needwave-a §6, control leg, band 107375–107382 (seed 107375 —
holders are foragers; plans sit in `party` for weeks with no
departure ever attempted)
**Type:** LEVER (one game-code change, two-leg contrast: ctl vs
armed) · **Base master:** `f2d03db92`
**Prereg:** `evidence/2026-11-22/sim-dawnchoke-a-prereg.md` (frozen
2026-11-22 ~22:15 UTC, before any judged run)
**Band:** 107423–107430 (8 seeds), horizon 150d death-aware,
competent verbatim policy.
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
`PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `HYPOFLOOR` unset.

## Verdict: NO-GO (det-gate only)

The ONLY failed bar is bar 2, the det-gate. Every judged bar
passed — attempts 12 → 57 (+45, bar +4), stuck plans departed
2 of 3, launches 4 → 36, starvation and survival guardrails
held. But the frozen bar 8 is explicit: det-gate failure is
NO-GO on instrument grounds, and the game-code change is
reverted per kill protocol.

The det-gate failure itself is characterized below (§ Det-gate):
it is a bound-detector / fix-shape mismatch, not
non-determinism and not incomparable legs. The legs are
byte-identical until the lever's first extra depart call
(days 63–150; two seeds identical for the whole run), and the
anchors are hand-verified. The judged numbers ARE attributable
to the lever — but the frozen bar as written fails, so the
verdict is NO-GO and the lever does not land. A re-judge needs
a corrected bound, not a harness fix.

## DIAG (control leg — the choke, quantified)

`evidence/2026-11-22/dawnchoke-a-diag.json` (8 seeds):

- **Staged-plan days 241, choke days 208, choke rate 0.863.**
- By plan shape: targeted wave-4+ 157 staged / 154 choked
  (98%); targetless-hunt 84 / 54 (64%).
- By holder range profile (the operative cut): **forager 139
  staged / 139 choked (100%)**; wanderer 75 / 50; explorer
  10 / 5; homebody 17 / 14. Every forager-profile holder's
  staged day choked.
- By occupation (job, not the gate): taxi_driver 41/41,
  dockworker 47/47, soldier 30/30, pottery_instructor 12/12,
  paramedic 14/12, forager (job) 17/9.
- Sub-choke (dominant first): **party-wait-no-companion 91,
  all with 0 eligible companions at dawn**; never-scored 59
  (50 with 0 eligible); commit-written-no-depart 29 (28 with
  0 eligible); bid-lost assign_standing 14; bid-lost
  duty_top_score 8. The drought behind the choke is companion
  availability: on ~80% of staged days there was nobody
  eligible to answer — villages hold foragers, not wanderers,
  and `findCompanion` admitted only wanderer/explorer.
- **Stuck plans (control): 3.** 107426 miguel_santos
  (dockworker, forager profile, 47 staged days d63–113);
  107428 visjoin_87 (firefighter, forager profile, 7 staged
  days d97–103); 107430 visjoin_108 (12 staged days d111–123).

## The fix (designed from the DIAG)

Commit `4ac23b12f` retires the `PROFILEGATE4` env gate: for a
holder whose plan targets wave 4+ (`needWave >= 4`),
`findCompanion` now admits a **forager**-profile companion
(trust ≥ 15, at Haven, not away/engaged/out) in addition to
wanderer/explorer. Homebodies stay out (range 0). No plan, or
a wave-3 plan, keeps the old gate. The change is in
`findCompanion` in both `villager-brain.js` and `win-plan.js`
(the two copies of the filter); the env-var reader
`profilegate4On()` is deleted from both files. Note: this is
a THIRD fix shape, not either of the two the prereg §2 named
(agencyTick profile gate, vbrainExecuteDepart commit gate) —
the DIAG showed the choke sits in companion eligibility, so
the fix opens the companion gate. That shape choice is what
the det-gate bound detector (written for the profile-gate
shape) fails to see — see § Det-gate.

## Bars (judge: the analyzer on the full band)

| # | Bar | Result |
|---|---|---|
| 1 | Instrument validity (needwave proof re-run green; dawnchoke proof test 100%, fails old code, passes new; analyzer selftest 100%; 0 instrument errors on all 16 seed files) | PASS |
| 2 | Det-gate (0 first-release rows on ctl; pre-bound streams byte-identical; first divergence on/after first-release day) | **FAIL** (bound null on all 8 seeds; see § Det-gate) |
| 3 | PRIMARY — wave-4+ departure attempts, armed ≥ control + 4 | PASS (57 vs 12 = +45) |
| 4 | PRIMARY (second half) — a stuck plan departs | PASS (2 of 3: miguel_santos, visjoin_87) |
| 5 | SECONDARY — launches, armed ≥ control (reported, not judged) | 36 vs 4 |
| 6 | GUARDRAIL — starvation, total armed ≤ control + 2 and no seed worse by > 2 | PASS (6 vs 5; max per-seed excess 2, exactly at the limit) |
| 7 | GUARDRAIL — survival, median armed ≥ 0.8 × control | PASS (131 vs 141 = 0.93×) |
| 8 | NO-GO rule | NO-GO (bar 2) |

## Numbers (analyzer `evidence/2026-11-22/dawnchoke-a-judgment.json`)

| | Control | Armed |
|---|---|---|
| Wave-4+ departure attempts | 12 | 57 |
| Wave-4+ launches | 4 | 36 |
| Holds | 5 | 21 |
| Staged-plan days | 241 | 197 |
| Choke days | 208 | 156 |
| Choke rate | 0.863 | 0.792 |
| Starvation deaths | 5 | 6 |
| Median survival (days) | 141 | 131 |
| Instrument errors | 0 | 0 |

Per-seed attempts (ctl → arm): 107423: 7 → 3; 107424: 0 → 3;
107425: 0 → 0; 107426: 0 → 14; 107427: 0 → 0; 107428: 0 → 15;
107429: 5 → 6; 107430: 0 → 16. Launches (ctl → arm):
107423: 4 → 3; 107424: 0 → 3; 107425: 0 → 0; 107426: 0 → 14;
107427: 0 → 0; 107428: 0 → 14; 107429: 0 → 0; 107430: 0 → 2.
The lever's effect concentrates on the three seeds where
staged plans were stuck (107426, 107428, 107430) plus 107424.

Wall numbers: wins 0 / 0, national 0 / 0, wave-5 reached
2 → 1, wave-4 reached 8 / 8, median survival 141 → 131,
villages lost 4 → 6.

## Det-gate (FAIL — root-caused by the finisher)

The analyzer's bound is the first-release day: the earliest
armed-leg `departCalls` row for a forager/homebody-profile
holder with a staged wave-4+ plan and **no** `party_launch`
commit today. That row never occurs on any seed (bound null
everywhere), so the analyzer falls back to comparing ALL rows
and fails on 6 of 8 seeds (16 stream mismatches each; seeds
107425 and 107427 pass with 0 mismatches — byte-identical
legs).

Finisher verification, from the corpora themselves (not the
analyzer's verdict):

- **The legs are byte-identical until the lever's first
  effect.** Content-aware first divergence per seed (earliest
  day any event stream's row multiset differs): 107423 d99,
  107424 d98, 107426 d63, 107428 d97, 107429 d146, 107430
  d111; 107425 and 107427 never diverge. Day 63 on 107426 is
  the exact day miguel_santos's stuck plan first stages — the
  divergence IS the lever firing.
- **Anchors hand-verified.** Every control per-seed JSON
  carries `anchorCommit 4a4126154` (instrument, no game
  change) and every armed JSON `anchorCommit 4ac23b12f`
  (with the fix), with distinct winplanSha/brainSha per leg.
  The attribution ctl-vs-arm is correct.
- **Why the bound never fires:** the fix works through
  `findCompanion`, so its first observable effect is a
  `party_launch` commit being written where none was before —
  and a depart call WITH a `party_launch` commit. The bound
  predicate requires NO `party_launch` commit, i.e. it was
  written for a fix that opens the agencyTick profile gate.
  The worker's DIAG-driven fix opens a different gate, and
  the detector cannot see it. The analyzer's `anchorChecks`
  are also uninformative here (`checked: false` on both legs
  — the analyzer never verified the anchors; the finisher did
  by hand from the per-seed JSONs).
- **Conclusion:** the det failure is a bound-detector /
  fix-shape mismatch (test strictness), not non-determinism
  and not incomparable legs. The judged numbers are
  attributable. But the frozen bar as written fails, so the
  verdict stands as NO-GO. A re-judge must correct the bound
  (e.g. first extra depart call, or first day any stream
  differs) before re-running — the harness itself needs no
  fix.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-22/dawnchoke-a-panel.md` (8 paired cases):
**review_required, REGRESSION signal.** Village deaths
91.875 → 102.625 (+10.75/run, 95% interval 2.1–19.9);
per-100-days 71.7 → 81.2 (+9.5, interval 2.9–16.4);
community loss 0.5 → 0.75 (regression_watch). National 0 → 0,
wins 0 → 0. The lever buys departures with lives: 32 extra
launches, ~11 extra deaths per village-run, 2 more villages
lost. The frozen guardrails (starvation + median survival)
still pass, but the panel's total-death signal is the
tradeoff a re-judge must weigh: the next lever should pair
departures with safety (better gear/party composition on the
way out), or the cost should be accepted explicitly.

Panel-builder note: the builder (`scripts/build-dawnchoke-panels-a.js`)
crashed for the worker because its default seed list is the
cloned needwave-a band (107375–107382), not this arm's band.
The finisher ran it with explicit `--seeds 107423,...,107430`
and the compare produced the panel above; the default is
fixed in the landed instrument (107423–107430).

## Sense-test

The stuck plans depart and the morning says so. Seed 107426,
day 63 — miguel_santos's plan has sat staged 47 days:

> 📺 SYSTEM: "Miguel sets out with Miriam after The Strike —
> the fire marks the trail."

Seed 107428, day 97 — visjoin_87 (firefighter, forager
profile, the proof-test fixture's own case) departs vs the
herald. The departure beat speaks on converted launches; no
silent departures were observed in the converted set.

## Village assessment

The DIAG names the drought precisely: villages hold foragers,
not wanderers, and for 91 staged days the holder waited for a
party while zero companions were eligible. Opening the
companion gate to foragers un-dries the funnel at once —
attempts nearly quintuple and two of three stuck plans walk
out within days of the change. But the villages pay for it:
more parties out means more exposure, and the panel's death
signal (+11/run) is the price. The one stuck plan that never
departed (107430 visjoin_108, 12 staged days) sits on a seed
where the armed leg attempted 16 times and launched twice —
the ask is open there, but the launch still mostly fails
(14 holds on 107430). The ask is necessary and not
sufficient; the hold reasons on the armed leg (startExpedition
refusals, companion-guard, medic-duty) are the next wall.

## Metric review

- Bar 2's bound definition was written for the profile-gate
  fix shape; the DIAG-driven fix chose the companion gate
  instead. A re-judge must define the bound shape-agnostically
  (first extra depart call, or first day any recorded stream
  differs) and verify the analyzer actually checks the anchors
  (its `anchorChecks` came back `checked: false` — the check
  is vacuous as written).
- The frozen guardrails gate starvation + median survival
  only; the panel's total-death regression (+10.75/run) passes
  them silently. If departures cost lives at this rate, a
  future prereg should gate total deaths or deaths-per-launch
  explicitly.
- The proof-test header's DIAG snapshot ("targeted wave-4+
  staged-plan days choked 93/93") is from a 5-seed authoring
  run; the final 8-seed DIAG is 154/157 (98%). The header is
  stale; the final numbers govern.
- No bar re-scored. No metric changed mid-run.

## Decision (finisher, 2026-11-22)

**Lever REVERTED — not landed.** Commit `4ac23b12f`
(retire `PROFILEGATE4`: forager companions may answer staged
wave-4+ plans) stays on the HELD branch `sim-dawnchoke-a`
and does not reach master: the frozen det-gate bar failed,
so per the kill protocol the game-code change is reverted
(zero trace in the game on master). The `PROFILEGATE4` env
gate therefore stays as it was — off unless the env var is
set.

**Instrument + evidence LANDED.** The instrument commit's
non-test contents (prereg, driver
`scripts/dawnchoke-driver-a.js`, analyzer
`scripts/analyze-dawnchoke-a.js`, panel builder
`scripts/build-dawnchoke-panels-a.js` — with the default-seeds
fix 107375–107382 → 107423–107430) and the evidence (prereg,
this file, `dawnchoke-a-judgment.json`,
`dawnchoke-a-diag.json`, `dawnchoke-a-panel.*`, per-seed
corpora `perseed-dawnchoke-a-ctl/` + `perseed-dawnchoke-a-arm/`,
driver logs) land on master. The proof test
`scripts/test-dawnchoke-a.js` stays on the held branch with
the lever: it asserts a depart call on new code and none on
old code, so it would fail on the reverted master — it is
lever-specific, not landable without the lever. Pre-flight
results recorded at run time: needwave proof green on base,
analyzer selftest 100%, proof test 100% on new code (fails
old-code control).

**Next step:** re-judge the forager-companion lift with a
corrected det-gate bound (first extra depart call) and a
total-deaths guardrail; the lever's numbers (attempts +45,
launches +32, 2/3 stuck departed) are attributable and worth
a clean re-judge. The death cost (+11/run) should be priced
into the re-judge's bars. The forager dawn choke as measured
(DIAG: 0.863) is answered at the mechanism level; the
det-gate is what failed, not the lever.
