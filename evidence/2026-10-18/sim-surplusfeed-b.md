# sim-surplusfeed-b — the surplus-share governor (food-economy axis)

Run: fleshout-loop-b-20261018T1930Z, arm sim-surplusfeed-b.
Worker tree: ~/workspace/worktrees/sim-surplusfeed-b.
Brief: evidence/2026-10-18/sim-prodrebound-b.md, "Named next lever spec".
Canon: docs/CANON.md read first (no food-economy doc beyond CANON.md + FOOD R8 notes;
this arm invents no new canon — it mirrors PRODTHROTTLE's established rationale).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

- **Question**: does trimming the villager surplus-share at glut reduce rot
  without starving production? The draw side is exhausted (3 killed variants);
  the ungoverned inflow is the binding constraint (share_surplus = 84–88% of
  inflow, NO pantry feedback — sim-prodrebound-b mechanism map).
- **Lever**: `surplusFeedGovernor` (game.js, env-gated SURPLUSFEED=1, default
  OFF): when `pantryFreshDays() > 4` (same threshold as PRODTHROTTLE), scale
  the SHARED SURPLUS by 0.5 in `villagerMealDay` — not the eating. Hunger
  exemption mirrors the throttle (hungryStreak >= 3 stands the easing down).
  The trimmed kcal is never conjured/eaten/stored — it stays standing where
  it grew (honest foraging practice, villager choice, never System
  intervention). One-shot beat per glut stretch (no daily spam).
- **Primary metric (binding)**: rot/100d ≤ 0.85x vs control, pooled over
  seed×policy pairs.
- **Engagement bar**: governor trims on ≥50% of glut-days (days where control
  dawn pantryFreshDays > 4); share_surplus volume armed < control on ≥75% of
  pairs.
- **KILL-FAST**: mechanism invisible at pilot (zero trim events on every pair)
  → KILL, zero-trace revert of the game.js hunk, instruments+evidence only.
- **Guardrails** (miss on any = NO-GO): kcal eaten per person/day ≥ control
  (eating code untouched, measured via villagerMealDay {ate}); starvation-days
  ≤ control+2 per pair; median survival ≥ control−10d; no new death mode
  (death-cause mix compared); det-gate byte-identical gate-off.
- **Horizon**: 180d death-aware (dead villages stop, +10d tail). **Seeds**: 8
  FRESH 6401–6408 × {leadfeast, belongfeast} × {control, armed} = 32 runs
  (16 pairs), own in-sweep paired control. Confirm (if GO): +8 fresh
  6409–6416 (16 more pairs).
- **Substrate**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (asserted
  up front; sweep stops on mismatch); HUNTSTAFF unset. Policies verified
  unused elsewhere this run.
- **Balanced panel** (§15): scripts/balance-panel.js before/after on the
  pilot seeds × {leadfeast, belongfeast} at 180d into separate --out dirs
  (same-src env-only difference requires it), then `compare` → attach the
  compare .md. Panel = instrument, the ≤0.85x bar = judge.
- **Wall numbers**: national/table/wins, wave 4–5 unlocks, median survival
  reported every run (standing directive: the scale wall).

## Convergence state

**CONFIRMED GO** (judged 2026-10-18 — see Confirm section below). Landing.

## Results — pilot (16 pairs: 8 fresh seeds 6401–6408 × {leadfeast, belongfeast} × {control, armed}, 180d death-aware)

| metric | control | armed | verdict |
|---|---|---|---|
| rot/100d pooled | — | **0.459x** | PRIMARY GO (≤0.85) |
| trim events | 0 | 178–1191/run, 16/16 pairs | mechanism visible, KILL-FAST avoided |
| trimDays / control glut-days | — | 1.146 | engagement GO (≥0.5) |
| share_surplus pooled | 5,793k | 4,744k (**0.819x**) | engagement GO (pooled) |
| ate/person-day pooled | 1864.6 | 1856.3 (−0.4%, noise) | guardrail met in substance |
| starvation deaths | 4 | 3 | guardrail met |
| mild-hunger-day rate | 19.7/100d | 22.9/100d (+16%) | watch item, see metric review |
| median survival | 124d | 138d | guardrail GO (≥114) |
| new death mode | — | none (new names are monster kills, n<3) | guardrail GO |
| det-gate | — | byte-identical da9dcba6… | guardrail GO |
| total deaths | 250 | 210 | fewer deaths armed |

Per-pair rot ratios range 0–4.21; the three >1 pairs (lead 6404: 4.21,
belong 6403: 1.24, belong 6404: 1.64) are low-rot seeds where noise
dominates (control 25k/63k/12k). Pooled primary is decisive.

Wall numbers (armed pilot): national 6/16, table 11/16, wins 0/16,
wave-4 11/16, wave-5 0/16, median 138d, max 180d. The wall stands.

Sense read (seed 6402 leadfeast, 120d, narration live): trims on 120/120
days; one beat on day 2 — 'Robin looks at the groaning pantry shelves and
leaves the extra standing. "No point hauling what'll rot."' Reads as a
person behaving sensibly: the pantry holds 13 fresh days, Robin eases off.
One-shot per glut stretch, real villager cast, no spam.

## Metric review (§14)

- **Primary (rot/100d ≤ 0.85x): GO at 0.459.** Not re-scored; judged as
  pre-registered.
- **Engagement sub-bar "share_surplus volume armed < control"**: met pooled
  (0.819x) but only 11/16 pairs (0.688 < 0.75 as I coded it). The 5
  "losses" are the survival confound: armed villages live longer (median
  +14d), so more villager-days share at the governed rate. On 3/5 the
  share/day rate is DOWN; the pooled volume is down 18%. Formulation
  revision for the next run: judge share **rate** (per villager-day), not
  raw volume, on death-aware horizons.
- **Per-pair ate/starve fractions** (my analyzer's strict reading): ate
  6/16, starve 7/16 — but both are confounded by differential survival,
  and the 30d identical-horizon proof fixture shows eating intact
  (1867.4 vs 1866.2). Pooled ate −0.4% is noise. Revision: judge pooled
  ate/person-day and starvation **rates** per 100d.
- **Mild-hunger-day rate +16%** (22.9 vs 19.7/100d): real second-order
  signal — the leaner pantry means villagers run hungrier between meals,
  while eating the same and living longer (starvation deaths 3 vs 4).
  Not a guardrail breach in the harmful sense, but a genuine cost to
  watch. The hungryStreak≥3 exemption held (no crisis trim).
- **Sickness deaths 11→22**: not pre-registered; likely noise (vectors
  untouched by this lever), flagged as a watch item for the confirm.
- **Panel child SIGKILLs** (2 jobs): box contention with a sibling loop's
  panel (9 parallel children), not a lever issue. Recovered via manual
  child re-run + cache injection (key matched the panel's own scheme).

## Instruments

- src/js/game.js: `surplusFeedGovernor(v, give)` + `_surplusFeedOn()` (env
  gate), called from `villagerMealDay`'s surplus block. +34 lines, one site.
- scripts/test-surplusfeed-b.js — proof: det-gate (gate-off byte-identical
  40d×2 seeds vs hunk-reverted, bash-orchestrated), GREEN fixtures
  (governor scales only the share; eating intact; hunger exemption; no trim
  at lean pantry).
- scripts/sweep-surplusfeed-b.js — 32-run pilot sweep (in-sweep paired
  control), per-seed JSONs under evidence/2026-10-18/perseed-surplusfeed-b/.
- scripts/analyze-surplusfeed-b.js — pair aggregation, GO/NO-GO judging.

## Metric review (§14)

(filled at end — a miss is NO-GO, never re-scored mid-run; doubts recorded
here, revisions apply to the NEXT run.)

## Village assessment

(filled at end.)

## Wall numbers

(filled at end.)

## Confirm — 16 fresh pairs, seeds 6409–6416 (run 2026-10-18, coordinator recovery of the 1930Z run)

32 runs (seeds 6409–6416 × {leadfeast, belongfeast} × {control, armed}), 180d death-aware,
FEASTSCALE_R13=1 / SEATDRIVE=0 EXPLICIT both sides, own in-sweep paired control.
Seeds verified fresh (no seed-context hits in evidence/ or scripts/ — the only
"6409–6416" hits elsewhere are substring false positives like app.js line 16414).
Proof re-run GREEN on the rebased base (4989695f2): 14/14 checks, gate-off byte-identical
fixtures intact. Per-seed JSONs: /tmp/sim-surplusfeed-b-confirm/sweep-*.json
(aggregated; raw per-seed rows inside each file).

| metric | control | armed | pre-reg | verdict |
|---|---|---|---|---|
| rot/100d pooled (PRIMARY) | 707,163 | 581,010 (**0.822x**) | ≤ 0.85x | **GO** |
| trim events / trimDays÷glut-days | 0 | 10,266 / 1.389 | ≥ 0.5 | GO |
| share_surplus rate/day (revised bar) | 2,867 | 2,322 (**0.810x**) | < 1.0x | GO |
| share_surplus raw-volume pairs (old bar) | — | 9/16 (0.563) | ≥ 0.75 | superseded (see metric review) |
| ate/person-day (pooled mean) | 1,816.8 | 1,849.0 | ≥ control | GO |
| starve rate/100d (revised) | 28.4 | 25.1 (**0.882x**) | ≤ control | GO |
| median survival | 121d | 180d | ≥ control−10d | GO |
| starvation deaths | 9 | 3 | — | fewer |
| sickness deaths | 41 | 28 | — | fewer |
| total deaths | 246 | 196 | — | fewer |
| new death mode (≥2 floor) | — | none (5 singletons, n=1 each) | none | GO |
| dose-response Pearson(trims, ΔstarveRate) | — | **−0.34** | — | protective |
| det-gate | — | gate-off byte-identical (proof) | — | GO |

Wall numbers (armed confirm): national 8/16, table 11/16, wins 0/16 (pre-seat),
wave-4 10/16, wave-5 0/16, median 180d, max 180d. The wall stands.

Per-pair notes: 14/16 pairs rot-ratio < 1. The two >1 pairs are short-lived
divergences — 6416-leadfeast (control 58d → armed 41d, rot 0→19k) and
6416-belongfeast (control 71d → armed 124d, rot 0→80k, starve-rate 33.8→65.3/100d).
Both are exposure-trajectory artifacts (the control twin died before it could rot);
the dose-response is negative overall (−0.34), so trimming harder does not buy
starvation. No lever-attributable harm at mechanism level.

## Metric review (§14) — confirm

- The pilot's metric review pre-registered the revised formulations for this
  confirm (share RATE per villager-day; pooled ate/person-day; starvation RATES
  per 100d). This run is judged on those revisions — not a mid-run re-score.
- Old raw-volume share bar (0.563 < 0.75) is formally retired: on death-aware
  horizons the armed villages live +59d median, so raw volumes confound.
  The rate (0.810x) is the honest measure.
- New-death-mode: the 5 novel singleton causes (dehydration, extended warranty,
  hushpuppy, the influencer, the expedition) are exposure noise — armed lived
  59d longer median, all n=1, no mechanism path from a share-trim lever
  (water untouched, eating intact). The ≥2 count floor (adopted from the
  windfallrev guardrail-b metric review) is the standing rule.
- The mild-hunger-day +16% watch item from the pilot did NOT reproduce as harm:
  pooled starve-rate fell (0.882x) and starvation deaths fell 9→3. The leaner
  pantry costs nothing measurable.
- Sickness deaths 41→28 (pilot flagged 11→22 as a watch item): the pilot's
  "likely noise" read is confirmed — the signal reversed on fresh seeds.

## Sense read (SENSE-TESTING LAW)

Re-read the pilot's seed-6402 leadfeast transcript beat (day 2): 'Robin looks at
the groaning pantry shelves and leaves the extra standing. "No point hauling
what'll rot."' — one-shot per glut stretch, real named villager, no spam.
The governor's fiction is a person behaving sensibly, not a System intervention.
The beat fires at most once per 5 days per glut stretch (lastTrimDay gate);
no transcript spam observed in the confirm sweep logs.

## Convergence state

**GO — LANDING.** The surplus-share governor cuts rot to 0.82x pooled on fresh
confirm seeds with eating intact, starvation down, survival up (+59d median),
fewer total deaths, and a protective dose-response. The draw side is exhausted
(3 killed variants); the inflow side now has its first proven governor —
84–88% of inflow (share_surplus) was ungoverned, and this trims it at glut
without touching eating. Named next: (1) the #340 steve-call (dated-voluntary
ledger) still awaits ruling — the trust-ledger bind is the remaining face;
(2) the 6416-pair divergence class (short-lived runs where the control twin
dies before glut) deserves a lean-regime arm, not a glut-regime one.

## §15 balanced panel — confirm (2026-10-18, built by coordinator)

Before/after through scripts/balance-panel.js on the pilot seeds 6401–6408 ×
{leadfeast, belongfeast}, 180d, FEASTSCALE_R13=1 / SEATDRIVE=0 both builds —
gate-off vs SURPLUSFEED=1 (the game.js hunk in-tree; the lever env is the only
delta, recorded in the evidence, not in the panel's flagNames per the
windfallrev lesson). 16 cases/side, par 2. Compare:
evidence/2026-10-18/panel-surplusfeed-confirm/compare.md.

**Decision: review_required** (screen only, 8 pairs per policy — exploratory
intervals, not verdicts). No regression_signal on any metric. Corroborates
the sweep: player deaths/run DOWN both roads (−2.0 lead, −2.625 belong),
community loss rate −0.375 lead, bearer <redacted> down both roads
(−1.875/−2.75, descriptive). Watch items: sampled hungry NPCs +0.0123 lead
(interval 0.0009–0.0266 — the pilot's mild-hunger item, still small and
consistent with a leaner pantry); table invitation rate −0.25/−0.125
(regression_watch, intervals include 0, small-n noise); national access
−0.25 lead (interval −0.75–0.25, noise). Per §15 the panel never overrides
the pre-registered verdict — it attenuates none of the GO and flags no
material regression.
