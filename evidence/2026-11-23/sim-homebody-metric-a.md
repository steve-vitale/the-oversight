# sim-homebody-metric-a — EVIDENCE (Loop A 0815Z)

**Arm:** sim-homebody-metric-a · **Loop A run:** fleshout-20261123T0815Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2498/#2568
(the homebody-holder launch-attempt wall)
**Type:** LEVER RE-JUDGE WITH CORRECTED METRIC (one game-code change +
instrument, two-leg contrast: ctl vs armed) · **Base master:** `80e7da0bc`
(worktree `~/workspace/worktrees/sim-homebody-metric-a`, branch
`sim-homebody-metric-a`; verified equal to the main tree's master tip,
and master had not moved at landing time)
**Prereg:** `evidence/2026-11-23/sim-homebody-metric-a-prereg.md` (frozen
2026-11-23 ~09:05 UTC, before any judged run)
**Band:** 107455–107470 (16 seeds), horizon 150d death-aware,
competent verbatim policy.
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
`PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` unset.
**Convergence state:** converging (axis still converging, NOT converged).

## Verdict: GO (corrected metric — all frozen bars pass)

The handoff converts **every held wave-4+ plan it faced into a real
departure with companions**: pool 3, converted share **3/3 = 100%**,
party conversions **3** (two trios, one pair; 0 solo). Both guardrails
pass: total deaths 1370 → 1350 (cap 1507), median survival 149.5 →
146 (floor 119.6). Instrument valid, det-gate clean, 0 instrument
errors on all 32 seed files.

This certifies the lever for landing. The 0215Z re-judge's METRIC-BROKEN
kill is answered on a fresh band under the corrected bar: the old
corpus re-scores GO under the same bar (see "Consistency re-score"),
and the fresh band confirms it — the mechanism is real, the pool is
small (3), and every case in it converted with a party.

**Cross-check (analyzer's own verdict, 2115Z bars): NO-GO.** Its
primary (+4 absolute: armed ≥ control + 4) fails on the same numbers
(16 vs 15 + 4 = 19). That bar is the one the corrected metric
replaces — it demands +4 launches from a lever whose addressable
pool on this band is 3. The divergence is the calibration, not the
lever; the frozen corrected bars are the judge and they say GO.
Launch-count delta (+1) is reported, never judged.

## Bars (judge: the pool judge's numbers, `homebody-metric-a-pool.json`)

| # | Bar | Result |
|---|---|---|
| 1 | Instrument validity (proof test 38/38 new-code, fails old-code via §C vs `80e7da0bc`; analyzer selftest 28/28; pool-judge selftest 23/23; 0 instrument errors on all 32 seed files) | PASS |
| 2 | Det-gate (0 handoff rows on ctl; pre-bound streams byte-identical; first divergence on/after first-handoff day) | PASS |
| 3 | PRIMARY — converted share ≥ 50% | PASS (3/3 = 100%) |
| 4 | PRIMARY — party conversions ≥ 2 | PASS (3) |
| 5 | GUARDRAIL — total deaths armed ≤ ceil(1.1 × control) = 1507 | PASS (1350 vs 1370) |
| 6 | GUARDRAIL — survival, median armed ≥ 0.8 × control | PASS (146 vs 149.5) |
| 7 | NO-GO rule | NOT FIRED — all bars pass → GO |
| — | Zero-launch rule: either leg < 5 launches → INCONCLUSIVE | did NOT fire (15 / 16) |
| — | Pool rule: pool 0 → INCONCLUSIVE | did NOT fire (pool 3) |

## Numbers (pool judge `evidence/2026-11-23/homebody-metric-a-pool.json`)

| | Control | Armed |
|---|---|---|
| Wave-4+ launches | 15 | 16 |
| Trio launches | 15 | 14 |
| Launches with a beat | 15 | 16 |
| Handoffs (calls) | 0 | 136 |
| Handoff launches | 0 | 3 |
| Dale-class conversions | 0 | 3 |
| Party conversions (≥1 companion) | 0 | 3 |
| Solo conversions (party []) | 0 | 0 |
| Hold-only pool triples | — | 0 |
| Homebody holds | 36 | 0 |
| Depart rows (wave-4+, brain) | 53 | 21 |
| Selected-blocked share (ctl) | 0.679 | 0 |
| Starvation deaths | 3 | 4 |
| Total deaths | 1370 | 1350 |
| Median survival (days) | 149.5 | 146 |
| Instrument errors | 0 | 0 |

Per-seed wave-4+ launches — only three seeds differ between legs:

| Seed | Ctl | Arm |
|---|---|---|
| 107455 | 0 | 0 |
| 107456 | 4 | 1 |
| 107457 | 0 | 0 |
| 107458 | 0 | 0 |
| 107459 | 3 | 6 |
| 107460 | 0 | 0 |
| 107461 | 0 | 0 |
| 107462 | 0 | 0 |
| 107463 | 0 | 0 |
| 107464 | 0 | 0 |
| 107465 | 0 | 0 |
| 107466 | 7 | 7 |
| 107467 | 0 | 0 |
| 107468 | 0 | 0 |
| 107469 | 1 | 1 |
| 107470 | 0 | 0 |

The confirm half (107463–107470) contributed no pool cases at all:
its control leg recorded zero homebody holds, so the armed leg stayed
byte-identical to control on all eight seeds (same launches, days,
and deaths per seed). The whole pool lives in the pilot half — the
band is quieter than the re-judge band (15 launches vs 51), and the
lever's effect is correspondingly small in absolute terms: +1 launch
overall, 3 converted departures.

Wall numbers: wins 0 / 0, national 0 / 0, wave-5 reached 3 / 3,
wave-4 reached 16 / 16, median survival 149.5 / 146, max survival
151 / 151, villages lost 8 / 10. The scale wall stands: no village
reached national or won on either leg.

## Pool triples (all three converted, all with parties)

| Seed/day | Old holder | MaxD | New leader | Target | NeedWave | Party | Result |
|---|---|---|---|---|---|---|---|
| 107456 d137 | Sonny (app_mgpsphgr582, homebody) | 0 | adaeze_nwosu | reunion | 4 | mara_vasquez, benoit_lambert | **launch (trio)** |
| 107459 d68 | david_kim (homebody) | 0 | mia_andersson | eulogy | 4 | tashi_sherpa | **launch (pair)** |
| 107461 d143 | Thembi (visjoin_124, homebody) | 0 | visjoin_132 | eater | 4 | chloe_dubois, petra_novak | **launch (trio)** |

Each triple was faced exactly once (1 case row each) — no repeated
dawn re-attempts, unlike the re-judge band where one plan was held
34 times. The 133 skip calls are all non-cases by the method's own
filters (walker holder, wave-3 target, or no plan). Zero `hold`
results: no faced case failed for lack of a walker. The control-leg
pool cross-check agrees exactly: the same 3 distinct (seed, holder,
target) triples among control wave-4+ maxD-0 holds.

## Consistency re-score (NOT judged — instrument check on the old corpus)

The pool judge applied to the EXISTING 107431–107446 corpus
(`evidence/2026-11-23/homebody-metric-a-rescore-107431.json`):
pool 2 (ctl cross-check 2), share 2/2 = 100%, party conversions 2,
solo-only 0, hold-only 0, launches 51 → 56, total deaths 1677 →
1665 (cap 1845), starvation 7 → 6, median survival 150.5 → 151,
instrument 0 errors, det true — **verdict GO**, exactly as the
prereg expected. The corrected bar certifies the old corpus and the
fresh band alike; the judge is consistent across bands.

## Pilot gate (stage 1, seeds 107455–107462)

Pilot GO, all three gate conditions met: instrument valid, det-gate
passed on the pilot seeds, pool_pilot = 3 ≥ 1. Pilot numbers: pool 3,
share 100%, party conversions 3, launches 7 → 8, total deaths
626 → 606 (cap 689), median survival 149.5 → 141.5, det true.
Confirm (107463–107470) ran after the pilot passed, as frozen.

## Det-gate (PASS)

Ctl leg records 0 handoff rows on all 16 seeds. Anchor check
passes: ctl files carry winplanSha `9de1187e731d` / brainSha
`89d73e040fbe` (pre-lever code), arm files carry
`8b5cfd05cb33` / `dc247673d540` (lever code); `anchorCommit` is
`80e7da0bc` on both legs (the lever is uncommitted — the file shas
are what differ). Pre-bound streams are byte-identical on every
seed, including skip-heavy seeds (e.g. 107455, 85 handoff calls,
first divergence on the handoff day itself).

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-23/homebody-metric-a-panel.md` (16 paired cases):
**review_required, no material signal.** National 0 → 0, wins
0 → 0, village deaths 85.625 → 84.375 (−1.25, no signal),
community loss 0.5 → 0.625 (+0.125, regression_watch — see the
village-loss note below). The panel agrees with the verdict's shape:
the lever moves three departures on three seeds and nothing else at
panel scale.

## Sense-test

All three converted launches read as real transfers, followed on the
same day by the departure beat naming the new leader, the companions,
and the target. Seed 107456, day 137:

> "Sonny never leaves Haven — Adaeze takes the plan and leads the party."

> "Adaeze sets out with Mara and Benoit after Loud-Eyes — the fire marks the trail."

Seed 107459, day 68:

> "David never leaves Haven — Mia takes the plan and leads the party."

> "Mia sets out with Tashi after The Eulogy — the fire marks the trail."

Seed 107461, day 143:

> "Thembi never leaves Haven — Luz takes the plan and leads the party."

> "Luz sets out with Chloe and Petra after The Eater — the fire marks the trail."

The homebody stays home in all three; the line names the transfer
once; the companions follow on the same target. The 2115Z caveat
(solo conversion) is closed again: zero solo conversions on this
band, as on the re-judge band.

## Village-loss note (honest observation, not a bar)

On all three conversion seeds the armed village was lost sooner than
its control twin — and on the two where control survived, the armed
village was lost at all (107456: survived → lost d139; 107461:
survived → lost d144; 107459: lost d151 → lost d113). The converted
parties were away and alive at the loss (107456: Adaeze's party met
a suburb on d138 and evaded; the village ended d139 with the party
on expedition). The frozen guardrails still pass because total
deaths FELL (1350 vs 1370): the earlier losses cut short the attrition
that would have followed. But the community-loss count rose 8 → 10
and the panel flags it regression_watch. One downstream detail cuts
the other way: on 107459, David — the homebody freed from the held
plan — went on to earn a wave-4 kill himself (veteran4, kills4: 1 by
d94), exactly the re-seed path the lever's comment describes; Mia,
his successor, is recorded dying ('vDie') to an eater on d87 at 5 HP.
The lever sends fighters out of fragile villages, and fragile
villages can collapse behind them. That is the honest cost of the
three conversions, inside the frozen tolerance — it is reported
here, not hidden, and it is not a bar the run re-scores.

## Village assessment

This band is quieter than the re-judge band and the wall sits
elsewhere. Eleven of sixteen villages launch nothing at all on
either leg; one seed (107466) carries nearly half the band's launches
(7 of 15). The homebody block is real but narrow and band-dependent:
36 holds on the control leg, yet only 3 distinct held plans, all in
the pilot half; the confirm half held nothing. Where the handoff
fires it converts every time, with a party every time — the mechanism
is now 5-for-5 on party conversions across the two bands (2 re-judge
+ 3 here), 0 solo. But a converted departure is not a kill: none of
the three converted parties is recorded killing its target, and two
of the three villages were lost within days of the departure. The
launch funnel is not the binding wall on this band — the villages
that never launch (11/16) and the villages that launch and still die
are. Starvation is nearly absent here (3 → 4); survival is set by
village loss, not hunger. No village on either leg reached national
or won: the scale wall is upstream of this arm.

## Metric review

- **The corrected metric worked as designed.** The share bar
  (≥ 50% of the pool) and the count bar (≥ 2 party conversions)
  are the lever's own quantities: the pool is measured, small (3),
  and every case in it converted. The launch-count delta (+1) is
  reported, never judged — under the old absolute bar (+4) this
  run would have failed again on a band where the lever's whole
  addressable pool is 3, which is the same mis-scoping the re-judge
  classified METRIC-BROKEN.
- **The pool is small and the confirm half is empty.** Three
  triples certify the mechanism but not its frequency: the bar
  passes 3/3, but a band with a pool of 3 cannot distinguish "the
  lever converts ~always" from "the lever converts the easy cases."
  The confirm half contributing zero pool cases means the full-band
  verdict rests on the pilot half alone for the primary. That is
  what the frozen design prescribes (the share is judged on the
  full 16), and it is stated here rather than smoothed over.
  A future arm that wants a frequency claim needs a band with a
  bigger pool, not a bigger launch count.
- **The total-deaths guardrail replaced starvation, and it
  matters.** Starvation barely moved (3 → 4) while total deaths
  fell (1370 → 1350) — the starvation guardrail would have passed
  either way, but total deaths is the honest cost measure here,
  and it caught the real movement (earlier village losses cutting
  attrition short). The guardrail passed, but the village-loss note
  above is the reason the total-deaths bar exists: deaths alone
  cannot see a village lost.
- **Implementation note (not a bar change):** the frozen bar says
  "armed ≤ ceil(1.1 × control)". The pool judge evaluates the cap
  as `control + ceil(control / 10)` in exact integer arithmetic
  (1507 here), because `Math.ceil(1.1 * 200)` is 221 in floating
  point — one over the true +10% cap of 220. The evaluated cap is
  the mathematically exact value of the frozen expression; the
  formula in the prereg is unchanged.
- **No bar re-scored.** The verdict is GO on the frozen bars as
  written.

## Decision

**Lever CERTIFIED FOR LANDING.** Landing commit (this worktree,
branch `sim-homebody-metric-a`): the 3 lever files from held commit
`e62603af0` + the proof test `scripts/test-homebody-handoff-a.js`
(§C base `80e7da0bc`, the parent tip) — see "Landing" below for
the hash. The coordinator merges; the ship loop owns the version
bump, push, and live verification.

**Instrument + evidence land with it:** prereg, this file,
`homebody-metric-a-analysis.json`, `homebody-metric-a-pool.json`,
`homebody-metric-a-panel.*`, the pilot + rescore JSONs, per-seed
corpora `perseed-homebody-metric-a-ctl/` +
`perseed-homebody-metric-a-arm/`, the leg logs, the pool judge
`scripts/analyze-homebody-pool-a.js`, and the one-line driver date
override (`EVIDENCE_DATE`, `scripts/homebody-driver-a.js`).
Pre-flight results recorded at run time: proof test 38/38 on new
code (fails old-code control via §C against `80e7da0bc`), analyzer
selftest 28/28, pool-judge selftest 23/23, ontology 138/138.

**Findings #2498/#2568:** CLOSED by this landing — the mechanism
is certified under the corrected metric on two bands (re-judge
corpus re-scores GO, fresh band GO). The untouched question is the
eleven never-launching seeds: the launch funnel's silence, not the
homebody block, is the next question for the axis.

## Landing

- Landing commit: `b8b242503527bbd13848f0222b356dc43c85c9ec`
  (branch `sim-homebody-metric-a` in this worktree; the 3 lever
  files + the proof test, 409 lines; `[needs-eyes]` — the handoff
  changes who leads a hunt and adds a spoken transfer line).
  The coordinator merges; the ship loop owns the version bump,
  push, and live verification.
- Proof re-run on the committed tree: proof test 38/38, analyzer
  selftest 28/28, pool-judge selftest 23/23, ontology 138/138.
  `node scripts/check.js --quick` was attempted twice and starved
  both times (killed after ~11 min at ~1s CPU under load 15+ with a
  concurrent sibling check.js on the box; the first attempt died
  with the machine restart at ~09:24Z). Targeted verification on
  the exact landed code is green (above); the full quick check is
  flagged here for the coordinator to re-run at merge time on a
  quieter box — it is NOT claimed green.

## Run notes (infrastructure)

- **Machine restart mid-run:** the host restarted at ~09:24Z
  during the post-band `check.js --quick` (uptime 0 min on
  recovery; the interrupted run left no output). Heartbeat
  re-established first on recovery; the worktree, corpora, and all
  analysis files verified intact (16 + 16 seed files, all JSONs
  parse, selftests green). No sim data lost — all four legs had
  completed before the restart.
- **No write-flap hits on the sim legs.** All four leg logs were
  probed into existence before redirecting (the re-judge lesson);
  no redirect failed. The driver refuses to overwrite per-seed
  files; no re-runs were needed on any leg.
- **Leg order:** ctl legs ran with the lever stashed (method count
  0, shas `9de1187e731d` / `89d73e040fbe`); the stash pop restored
  the lever byte-identical before each arm leg (shas
  `8b5cfd05cb33` / `dc247673d540`, method count 4). Pilot ctl/arm
  then confirm ctl/arm, each 8 seeds, single process per leg.
- **Load:** the box ran at load 12–15 through the confirm legs
  (sibling loops active); each 8-seed leg took ~6–11 minutes
  (~45–80s per seed), well above the ~3s/seed the methodology
  assumes — the sims are cheap, the contention is not.
