# sim-tribcollapse — tribute-collapse promoted to a named hold-loss mode (R6, 2026-10-15)

Worktree: `~/workspace/worktrees/sim-tribcollapse`. Run: oversight-flesh-out-loop
(run fleshout-a-2026-10-15T151641Z), diagnostic arm on the scale-onramp axis
(standing scale directive). Assignment: promote 'tribute-collapse' to a
first-class named hold-loss mode in the instrument, re-run the hold-loss
census on current master, and hand Steve the arrears measurement his
grief-leverage design call (sim-findings #342, OPEN) needs. ZERO src/js
behavior change — instrument only.

Canon: docs/CANON.md (read first). No canon doc covers hold-loss
attribution — the taxonomy is this arm's instrument, not canon. The
grief-leverage mechanic itself is engine canon: hierarchy.js
successionCrisis — on a Haven-leader funeral, an old (≥21d) link whose
subordinate is Haven gets tribute ×1.5 with the line "Tribute rises to
… kcal/week. Grief is leverage, and they know it." The BELONG polity's
good-standing bar is arrears===0 (hierarchy.js polityOf:
`_succTrustOf(l) >= 50 && (l.arrears || 0) === 0 && age >= 14`) — any
positive arrears drops the polity and _checkNational says "◈ The realm
came apart" aloud. TRIBFLOOR (policy layer) caps payments at the 2-day
pantry floor; shortfalls post as arrears, never forgiven. Steve's
grief-leverage compounding question (×1.5/funeral, no ceiling — arrears
ceiling, forgiveness) stays HIS call: this run builds no lever over it.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep runs)

Pre-registration written 2026-10-15 ~12:00 CDT, before SMOKE/DETGATE/the
sweep. The instrument extension + proof test (24/24 green) + the r4/r5
regression suites (53 + 19 green against the extended lib) were all run
before this header was written; no sweep trajectory has been observed.

**Question:** with 'tribute-collapse' promoted from other-named to a named
mode, what share of national-hold losses does the instrument attribute,
what is the tribute-collapse share and its arrears profile, and has the
loss-mode distribution moved vs holdloss2's {succession-chain 43%, combat
29%, wave-unlock 14%, tribute-collapse 14% (other-named, full trail)}?

**DIAGNOSTIC GO (binding):** ≥90% of national-reaching runs' LOSSES
attributed to a named mode (the holdloss2 bar). "other-named" counts
AGAINST the 90% (it is the honest remainder, not an attribution). Held-to-
end runs have no loss and sit outside the denominator.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast},
180d death-aware, FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 +
RAIDDENSITY=1 asserted up front in proof AND sweep (#312 lesson: assert
all four). Policies imported from scripts/policies/tribfloor.js (same ids
as feastscale, layer delegates byte-identically when off —
tribfloor.layerOn() asserted in the sweep). Own run, no lever —
diagnostic. The base is the same master tip the r5 census ran on, so
trajectories are expected byte-identical (the sweep checks per-run
trajHash against sim-holdloss2-runs.json, report-only); the ONLY expected
movement is the s44-belongfeast loss reclassifying other-named →
tribute-collapse. Any other movement is a real finding, not taxonomy.

**Horizon + why:** 180d death-aware. National reaches ~day 60–90; the hold
window is the object — a shorter horizon truncates the holds being
measured.

**Instrument:** scripts/holdloss-lib-20261015.js (r6: the named mode, see
the definition below). Loss window = 20d ending on the loss day
(finalDay+1 for village-death losses). B-branch priority: link-break →
exile → tribute-collapse → arrears-spike remainder → deaths-in-3d
succession. No game-code changes — the lib is a pure classifier on
persisted records.

**Proof:** scripts/test-tribcollapse-20261015.js — 24/24 GREEN: s44-shaped
constructed fixture → tribute-collapse (spike numbers, grief-leverage
trail, TRIBFLOOR floor-caps, lived-to-pay verdict all in the evidence);
succession-collapse vs raid-siege classify correctly (raid-siege stays
other-named by the pre-registered taxonomy); arrears-spike without a
grief-leverage trail → other-named; starvation-plural window →
other-named (starve-paying guard); REAL-RED (the r5 rule names the s44
fixture other-named; the r6 instrument names it tribute-collapse);
engine-read equivalence (JSON round-trip classifies identically);
attribution math (held-to-end outside the denominator, other-named counts
against); grief-trail window boundary (14d in, 15d out); the 2,000 bar
(2,500 fires, 1,500 doesn't); non-belong spike fallback (r5 behavior
preserved). Regression: test-holdloss-20261015.js (53) + test-holdloss2-
20261015.js (19) GREEN against the extended lib. SMOKE green, DETGATE
green (D1 gate determinism, D2 ON/OFF byte-identical 60d).

**Secondaries (pre-registered):** tribute-collapse share of hold losses
per road; arrears-at-dissolve distribution (median/p90/max); how many
tribute-collapses TRIBFLOOR converts from "starve paying" to "dissolve on
arrears" (floor-capped payments vs arrears posted — counted from the
TRIBFLOOR floor-cap lines and the window family tally); loss-mode
distribution vs holdloss2; wall numbers (national/table/wins, wave 4–5,
median survival, exiled).

## The tribute-collapse definition (falsifiable, auditable on the rows)

**tribute-collapse** fires iff ALL of:

1. **B-branch loss** — the polity lost national rank while the village
   lived (NOT a village-death loss; villageDiedHolding is false).
2. **The spike + the level** — Haven's BELONG-link arrears rose by
   >2,000 kcal in the 7 days before the loss day AND stood at ≥2,000 kcal
   at/after the loss (the r5 arrearsSpike detector restricted to
   belong-kind links — the tribute-paying direction — plus a level gate at
   the same X=2,000 bar).
3. **The grief-leverage trail** — at least one "Tribute rises to …
   kcal/week" succession-leverage line in the beats within ±14d of the
   loss (the old-link ×1.5 ratchet whose unpaid balances posted as the
   arrears).
4. **The not-starved guard** — the loss-window deaths are not
   starvation-plural (<40% starvation family): the village lived to pay.
   A starvation-plural window is the "starve paying" story — TRIBFLOOR did
   not hold — not this mode.
5. **B-branch priority** — link-breaks (±3d) and exile fire first; the
   deaths-in-3d succession check runs after this detector.

Audit trail: (a) scaleRows.links arrears deltas per link-kind — the sweep
now persists the FULL scale rows (the r5 mapping dropped them); (b) beat
text for the ratchet line; (c) the rank path + endReason for
village-alive; (d) the window family tally for the starvation guard.
When the spike fires but a guard fails, the mode stays other-named WITH
the named mechanism ("arrears-spike, not tribute-collapse (why)") —
never silently bucketed.

Why X=2,000: the BELONG good-standing bar is arrears===0, so the DISSOLVE
fires on any positive arrears — the mode's bar is the SPIKE, which
separates the ratchet-driven collapse (s44: 0 → 37,970) from thin-week
noise.

## Results — the 16-run instrumented suite

Substrate: 8 seeds × {leadfeast, belongfeast}, 180d death-aware,
FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 (all four
asserted in proof and sweep). Per-seed records:
`evidence/2026-10-15/perseed-tribcollapse/` (the `-full.json` files now
persist the FULL scaleRows with per-link arrears — the r5 audit gap is
closed); summary: `evidence/2026-10-15/sim-tribcollapse-runs.json`; sweep
log: `evidence/2026-10-15/sim-tribcollapse-sweep.log`.

**DIAGNOSTIC: MISS — 4/5 losses attributed to a named mode (80.0% <
90%).** Per §14 (a miss is NO-GO, never re-scored): instrument behaved
per its pre-registered spec, evidence only. The single other-named is
the leadfeast-s88 withering loss — fully trailed, mechanism named (see
narrative 1 and metric review).

| run | hold | lossDay | loss mode | arrears@loss | end |
|---|---|---|---|---|---|
| leadfeast s22 | 54d (d76–129) | 129 | **succession-chain** | — | village-lost d129 |
| leadfeast s44 | 105d (d76–180) | — | **held-to-end** | — | survived d180 |
| leadfeast s55 | 36d (d77–112) | 111 | **succession-chain** | — | village-lost d112 |
| leadfeast s66 | 51d (d76–126) | 126 | **succession-chain** | — | village-lost d126 |
| leadfeast s77 | 55d (d76–130) | 130 | **combat** | — | village-lost d130 |
| leadfeast s88 | 89d (d77–165) | 166 | **other-named** (withering, full trail) | — | village-lost d175 |

**Loss-mode distribution (n=5 losses):** succession-chain 3/5 (60%),
combat 1/5 (20%), other-named 1/5 (20%), tribute-collapse 0/5. vs
holdloss2's {succession-chain 43%, combat 29%, wave-unlock 14%,
tribute-collapse 14% (other-named)}: succession-chain is still the modal
named mode; wave-unlock is absent (no wave-4/5 unlock fell within 10d of
a loss this run); tribute-collapse had no opportunity — the belong road
reached national 0/8 (see below). DIRECTIONAL ONLY (see trajectory
note).

**Trajectory note (pre-registered expectation FALSIFIED):** the
pre-registration expected byte-identical trajectories to the r5 census
(same substrate, same seeds). All 16 trajHashes diverge. Forensics: the
r5 worktree's base was 577fb769; this run's base is 974f7b36; between
them src/js gained a new 446-line weather system (temperature.js), a
nomad-drive/scenes rework, and a game.js fire-ticks hook (app.js is
DOM-only). The keepsake-trail wiring (cf4b46e2) was A/B-tested as the
divergence source and RULED OUT (old-keepsakes re-run: still diverged).
The sweep's sim-driving code is diff-identical to r5's (only the mode
label and a post-sim read differ — both trajectory-neutral, DETGATE
D2-proven). Conclusion: the tree moved under the census — the r5
comparison is DIRECTIONAL ONLY per sim-findings #247 (cross-run
baselines drift), exactly as the r5 evidence anticipated for r4. The
census itself is valid: it measures current master, which is what the
task asked.

**Tribute-collapse secondaries:** the named mode fired 0 times — no
belongfeast run reached national (0/8; villages died d59–162 of combat
50 + monster 35, starvation 1 — the belong road's bind on this base is
survival-to-national, not the tribute ratchet). Arrears-at-dissolve
distribution: n=0, unmeasurable this run. TRIBFLOOR "starve paying" →
"dissolve on arrears" conversion: 0/0 — unmeasurable; the single
measured instance remains the r5 s44 narrative-7 case (2 floor-cap
lines, 0 starvation in the window → dissolve on arrears). The instrument
is proven on constructed states (24/24, incl. the verbatim s44-shaped
fixture → tribute-collapse with the spike numbers, grief-leverage
trail, floor-caps, and lived-to-pay verdict in the evidence); it fired
on zero real losses because the substrate produced zero belong-road
nationals.

**Hold-duration distribution** (6 national reaches): 89d: 1, 51–60d: 3,
31–40d: 1, 105d held-to-end: 1. Median hold of the 5 losses: 54d (r5:
~57d).

**Grace beats:** 0 grace-mediated beats across all 16 runs (r5: 1, which
saved its realm). SUCCGRACE's staging did not fire once — the
succession-chain losses all ran on old-style "dead hold no treaties"
beats.

**Wall numbers this run:** national 6/16 (leadfeast 6/8, belongfeast
0/8 — vs r5's 7/16 with belong 2/8); table 15/16; wins 0/16; wave-4
14/16, wave-5 5/16; median survival 124d (max 180d); exiled 0/16.
Notable: leadfeast s44 HELD TO END (105d national hold, survived d180)
— the first held-to-end in the hold-loss census series.

## Loss narratives (SENSE-TESTING LAW — read, not counted)

All five losses plus the held-to-end were read against their transcript
slices. Every one reads as a real village story — political, specific,
consequence-bearing. Nothing robotic; the beats name people, name the
leverage, say the costs aloud.

**1. leadfeast s88 — other-named (withering), village-lost d175 (89d
hold).** The run's most important loss and the diagnostic miss. National
d77–165 — the longest hold of the run after s44. Then the pantry went
3d→0 ("⚠ STARVING: health and energy falling. The spiral has started."
d146–151), monsters picked off the starving (5 monster deaths d146–175),
a Thornfield raid carried off ~2,610 kcal d149, and the village died
d175 — 9 days after the rank fell at d166. Why did the rank fall at
d166? The roster went 4→0; the links withered untended (no recorded
break, no exile, no arrears — the B-branch's discrete-event checks all
miss, and the d162 death falls 4d outside the ±3d window). The polity
dissolved on neglect while the village starved — then the village died
too. The instrument is honest to keep this other-named: no named mode
covers "the hold withered." Next instrument refinement (named in metric
review): a B-branch attrition/withering mode.

**2. leadfeast s44 — held-to-end, survived d180 (105d hold).** The first
held-to-end in the census series. National d76–180, 7 villagers alive at
the horizon, pantry 288d→45d (burning stores but holding), ate-share
min 89%. The pressure is raids, not monsters or politics: Stonebridge,
Emberhold, Thornfield, The Red Table hit night after night
(~600–1,661 kcal each), and the village absorbs them. "◈ WORD TRAVELS —
riders from The Bloodied bring talk of Haven. Out there they call you
the Beloved." The realm holds because the pantry holds. The wall's hold
face is not unbreakable — this village kept its rank for 105 days and
walked out alive.

**3. leadfeast s55 — succession-chain, village-lost d112 (36d hold).**
Wave 5 released d93; the fifth draft tore through the village (6 monster
deaths d93–111: Wren, Pavel, Rosa, Quinn, Xavier, Marcus). Four "the
dead hold no treaties" beats d97–110 — each funeral shaking the realm —
while the village fought on. Roster 5→0, pantry 18d→0. The instrument's
priority (succession-chain over the monster plurality) is honest: the
monsters did the killing, but the RANK was lost on the funerals. The
same shape as r5's s33/s55 — the modal named loss of the series.

(The s22 and s66 succession-chains and the s77 combat loss follow the
same shapes: funeral chains dissolving the polity mid-war, and a
straight war of attrition. All read as real stories; none robotic.)

## Village assessment (plain words)

Six villages reached national, all on the lead road; one held it to the
horizon. The leads died the way leads die — wave-4/5 monsters bled them
(combat+monster dominate every window) while funerals dissolved the
polity underneath the fighting. The succession-chain is still the modal
named loss (3/5): the realm comes apart on the dead, not on the war.
The belong road never got started — eight villages died at d59–162,
killed by combat and monsters before any tribute was ever owed. The
grief-leverage ratchet (the steve-call's mechanism) had no victims this
run because its victims have to survive to national first. The wall's
hold face moved less than its on-ramp face: s44's 105-day held-to-end
proves a national CAN be kept; the on-ramp (survival-to-~90d, now with
weather in the mix) is still the binding constraint. TRIBFLOOR's floor
held everywhere it was tested (starvation: 1 death across the belong
road's 8 runs); SUCCGRACE never fired.

## Blanks filled / documented

- **FILLED:** the r6 instrument — 'tribute-collapse' promoted to a named
  mode in scripts/holdloss-lib-20261015.js (existing arrearsSpike
  detector restricted to belong-kind links + level gate + grief-leverage
  trail requirement + starve-paying guard; the r5 all-links spike stays
  as the honest-remainder trail). scripts/sweep-tribcollapse-20261015.js
  (r6 census sweep; per-seed `-full.json` files now persist the FULL
  scaleRows with per-link arrears — the r5 audit gap closed).
  scripts/test-tribcollapse-20261015.js (24/24 GREEN, incl. REAL-RED
  against the r5 taxonomy, engine-read equivalence, attribution math,
  the 2,000-bar and 14d-boundary pins, and the non-belong fallback).
- **VERIFIED:** zero src/js changes — `git status --short` in the
  worktree shows only scripts/ + evidence/ (checked pre-commit).
  Regression: test-holdloss-20261015.js (53) + test-holdloss2-20261015.js
  (19) GREEN against the extended lib. SMOKE green, DETGATE green.
- **DOCUMENTED (for the next instrument run):** the s88 withering loss —
  the B-branch has no attrition mode. When the rank falls while the
  village dies of attrition within ~10d (starvation/monster plural in
  the window, no discrete mechanism within 3d), the honest name is a
  withering mode, not other-named. Proposed detector: B-branch +
  village dead within 10d after the loss + window starvation-or-monster
  plurality. Next run's refinement.
- **DOCUMENTED:** the trajectory divergence vs r5 (all 16 hashes) —
  forensics in the trajectory note above. The r5 comparison is
  directional per #247. The keepsake-trail wiring was A/B-tested and
  ruled out as the cause; the weather system (temperature.js, new
  between the bases) is the prime suspect for the perturbation.
- **The GRIEF-LEVERAGE steve-call (#342) stays OPEN.** No lever built
  over his call — no arrears ceiling, no forgiveness. This census is its
  measurement input; the input this run is thin (zero belong-road
  nationals → zero tribute-collapses). The call needs a run where the
  belong road reaches national.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **The MISS is a taxonomy gap, not a bucketing bug.** 4/5 losses named
   (80.0% < 90%); the fifth is the s88 withering loss, which no named
   mode covers — the B-branch only checks discrete events (breaks,
   exile, arrears spike, deaths ±3d), and a slow withering fires none
   of them. The honest fix is a B-branch attrition/withering mode for
   the NEXT run (detector sketched above). Applying it now would be
   re-scoring against a friendlier rule mid-run — refused per §14.
2. **The pre-registered "byte-identical trajectories" expectation was
   falsified.** All 16 runs diverge from r5's hashes; the base moved
   (weather system + nomad rework between 577fb769 and 974f7b36). The
   r5 distribution comparison is directional, not identical-trajectory.
   The census itself is unaffected — it measures current master. No
   revision to the GO needed; future pre-registrations on this hot tree
   should expect drift by default (#247) rather than predicting
   identity.
3. **n=5 losses is thin for mode SHARES.** The diagnostic names the
   mechanism on every loss it saw; the distribution {3/5, 1/5, 1/5} is
   directional. A follow-up wanting stable shares needs a larger
   national-reaching substrate.
4. **tribute-collapse fired zero times — the mode is proven but
   unmeasured in the wild this run.** The 24/24 proof (incl. the
   verbatim s44-shaped fixture) is the evidence the detector works;
   the wild measurement needs belong-road nationals. The arrears-at-
   dissolve distribution (median/p90/max) and the TRIBFLOOR conversion
   count are 0/0 — reported as unmeasurable, not as zero-effect.
5. **The GO threshold itself is sound.** 90% attribution is achievable —
   the instrument named 4/5 with a complete trail on the fifth, and the
   fifth's gap is a named next refinement. No revision proposed.

## Convergence

**DIAGNOSTIC MISS per the letter (80.0% < 90%); instrument extended and
proof-green, evidence only.** The instrument names the loss on 4/5
national-hold losses (3 succession-chain, 1 combat) plus 1 honest
other-named with a complete trail (the s88 withering — next run's
B-branch attrition mode). tribute-collapse is now a first-class named
mode (definition falsifiable on the rows; 24/24 proof green; r4/r5
regressions green) but fired zero times — the belong road reached
national 0/8 on this base, so the grief-leverage ratchet had no
victims. scale-onramp stays the blocking axis: wins 0/16, median
survival 124d, one hold survived to the horizon (s44, 105d — the first
held-to-end in the series). The GRIEF-LEVERAGE steve-call (#342) stays
open; its measurement needs a belong-road-national substrate.
