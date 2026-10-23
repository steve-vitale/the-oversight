# sim-storageshed-b3 — STORAGESHED unpark (2026-10-22)

UNPARK of the parked STORAGESHED lever — the STORAGE half of Steve's
2026-10-21 ruling ("villagers deprioritize PRODUCTION and STORAGE when food
is plentiful" — behavioral, bottom-up, at the decision). Parked twice on
misapplied metrics: b (rot/100d absolute 0.983 > 0.80) and b2 (total
rack-kcal-smoked-during-plenty 0.941 > 0.70, confounded by +74% plenty-day
exposure). Design spec: evidence/2026-10-22/sim-storageshed-b.md. Full
autopsy: evidence/2026-10-22/sim-storageshed-b2.md.

## Implementation (re-implemented, not the parked patch)

The parked patch (~/workspace/storageshed-parked.patch, the b-version)
does NOT apply cleanly to master b7160b82f (its hunk-2/3 contexts drifted —
a DEPOSITGATE day-voice block landed in the call-site region), and —
checked against its own spec — its shed block DESTROYS the shed half
(`it.units = u - shedU` with no fresh copy pushed back; the b.md spec says
"floor(u/2) units stay FRESH in the pantry (honest copy, pre-conversion
name, original spoilDay)"), which would violate PRESERVATION.md's
no-nonsensical-calorie-loss canon. The faithful implementation is the b2
re-implementation (branch sim-storageshed-b2, commit f678af5d8, proof-tested
36/36): its game.js layer was ported line-for-line into this tree
(verified byte-identical on added lines), with only the day-voice call
site relocated past the new DEPOSITGATE block. Behavior:

- Env-gated `_storageShedOn()` (STORAGESHED=0 control; default-ON; browser
  always ON). No RNG, ledger-only state.
- SHED once per cook-day (shedDayByVid gate): on the cook's first resolution
  with eligible about-to-rot surplus (post-dinner-reserve), floor(u/2) units
  of each batch are pushed back to the pantry as an honest fresh copy
  (pre-conversion name, original spoilDay — the fresh-first nightly meal
  gets a chance at them); the rest goes to the racks. Tiny stacks
  (floor(u/2)=0) engage nothing; gate unconsumed.
- DAY-GATED EASED BUDGET: a shed day's rack budget is 2000 kcal across ALL
  resolutions (shedder's later passes + other cooks), spend accumulating per
  resolution on the day record's shed flag (the b2 spent-accounting fix —
  keying on every resolution, not just the first pass). Non-shed days 4000.
- DAY VOICE `_storageShedDayVoice(v)`: once/day after the meal loop,
  rotating speaker, 12-line instead-of-work pool (real work — nets,
  firewood, fever cases, snares, water, bowls, gardens — never idle, never
  storage work), prefix 🍽️◦ distinct from the production half's 🍽️.

## PRE-REGISTRATION (§14 — binds this run; a miss is NO-GO, never re-scored)

- PRIMARY: preserved-rot/100d, armed/control ≤ 0.80, overall AND
  per-policy. Hypothesis: the shed keeps the about-to-rot excess fresh
  instead of converting it to preserved (smoking also destroys ~20% at the
  blind 0.80x rate); less smoked → less smoked-then-rotted.
- PRIMARY CHOICE + REASONING: the convergence tracker (2342Z review) names
  preserved-rot/100d as the judge for this unpark — plan continuity. It
  tests the storage half's DESIGN PURPOSE (reduce preserved waste), not
  just the mechanism: b2 already established the per-plenty-day rack rate
  at ~0.59× on 16 seeds — re-measuring the same behavioral number would
  re-confirm a settled answer. b2 measured preserved rot −28% aggregate
  (0.716, mechanistically consistent with less smoking), so 0.80 is a
  calibrated bar, not an arbitrary one. Per-plenty-day rack rate stays as
  a reported secondary (mechanism health check).
- GO threshold: ≤ 0.80 (overall AND per-policy).
- Horizon: 100d death-aware (dead villages stop simulating; +10d tail max).
  Why 100d: the tracker's named horizon for this unpark — the storage
  half's effect window. The lever only fires during plenty, which needs an
  established village; 100d covers establishment + the plenty regime
  without a fixed 200d run.
- Seeds: 8 FRESH per policy per side (63001–63008; fresh = not used as sim
  seeds by any prior run — verified: no sweep script in scripts/ uses
  6300x seeds; evidence-dir substring hits are kcal values, not seeds).
- Policies: leadfeast, belongfeast (competent-player policy + variant).
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted in the sweep script).
- Engagement (kill-fast): shedKcal > 0 on ≥ 6/16 armed runs. If the shed
  never fires in sims, the lever is decoration — kill at pilot.
- Guardrails: median survival armed ≥ control−10d; starvation deaths
  (pair sums) ≤ control+2; national(end) ≥ control−2; no new death-cause
  modes (roster-aware canonicalization per b2 — monsters.json names →
  monster/combat; show/night flavors → their classes); no inflow-channel
  laundering >2x (named channels:
  share_surplus/away/tribute/traps/duty/system/ambient).
- Watchers (flags, NOT verdict triggers): rot/100d absolute flag >1.20x
  (b2 proved it noise-dominated for this lever: per-seed 0.02–18.27 with
  infinities); fresh-rot/100d flag >1.50x (b2's measured +53% is the known
  trade — left-fresh surplus the nightly meal can't finish rots fresh).
- Before/after comparisons run through the balanced panel
  (scripts/balance-panel.js) per §15 — the panel is the instrument, the
  pre-registered threshold is the judge. Known contract limitation: env-
  gated flag → "Unmatched flags"; attach manual paired row analysis.
- Verdicts: GO → land as its own commit. NO-GO → parked (refresh the parked
  patch from this re-implementation) or killed-with-teeth per the metric-
  review guidance — document the root cause.

## Proof + determinism

- scripts/test-storageshed-b3.js: gate-off RED → gate-on GREEN (adapted
  from the b2 36/36 proof, re-verified on current master).
- det-gate: STORAGESHED=0, 8 runs, ledger never created, all STABLE; AND
  old-code (HEAD game.js) vs new-code gate-off trajectory digests
  byte-identical — the re-implementation adds zero behavior when off.

## Pilot results

Sweep: scripts/sweep-storageshed-b3.js, 8 fresh seeds (63001–63008) × 2
policies (leadfeast, belongfeast) × 2 sides = 32 runs, 100d death-aware
horizons, FEASTSCALE_R13=1/SEATDRIVE=0. Proof: scripts/test-storageshed-b3.js
36/36 green on current master. Det-gate: STORAGESHED=0, 8 runs, ledger
never created, all STABLE; old-code (HEAD) vs new-code gate-off trajectory
digests byte-identical on 63001/63002 × leadfeast/belongfeast (4/4) — the
re-implementation adds zero behavior when the gate is off.

- PRIMARY preserved-rot/100d (armed/control): **[all] 0.538 → GO**;
  [leadfeast] 0.281 → GO; **[belongfeast] 2.316 → NO-GO** → **PRIMARY
  NO-GO** (the pre-registration requires overall AND per-policy).
- ENGAGEMENT: shedKcal > 0 on **14/16** armed runs (need ≥ 6) → GO.
  458 shed-days, 581 shed decisions, 1,206,488 kcal shed. The lever fires
  reliably; it is not decoration.
- WATCH rot/100d absolute: 61,584 → 73,299 = 1.190 (flag > 1.20x) → ok.
  Split: fresh 57,341 → 70,366 (+24%); preserved 4,243 → 2,283 (−46%).
- WATCH fresh-rot/100d: 1.238 (flag > 1.50x) → ok. The b2-measured trade
  (+53%) reproduces milder at +24% — the left-fresh surplus the nightly
  meal can't finish rots fresh, but less of it this corpus.
- GUARD median survival: control 100d, armed 100d (need ≥ 90d) → GO
  (uninformative — the 100d horizon censors survival; all 32 runs survived
  to horizon).
- GUARD starvation deaths: control 7, armed 7 (need ≤ 9) → GO.
- GUARD national(end): control 11, armed 11 (need ≥ 9) → GO.
- GUARD death modes: raw comparison flagged "the expedition" as armed-only
  (1 death, armed-leadfeast seed 63004, day 30). Investigation: it is a
  PRE-EXISTING playerDeath cause (game.js:8672 — death on expedition),
  and the diff adds zero registerDeath calls. Same measurement-artifact
  class as b's wave-4 names and b2's "night" — sampling noise over
  pre-existing content, not a lever effect → OK with documented rationale.
- GUARD channel laundering: no named inflow channel > 2× control → GO.
- SECONDARY per-plenty-day rack rate: [all] 0.556, [leadfeast] 0.568,
  [belongfeast] 0.567 — the mechanism halves rack pace on BOTH policies,
  matching b2's 0.59×. Rack-days-plenty 21 → 33 (+57% exposure — the
  equilibrium effect again, milder than b2's +74%).
- Wall (pilot): national(end) 11 → 11; table ~0 both; wins 0 both
  (SEATDRIVE=0, 100d — wins structurally 0); wave-4 8 → 8; wave-5 0 both;
  median survival 100d both (horizon-capped). The scale wall stands.

### Root cause of the belongfeast primary miss (measured, not guessed)

Per-seed belongfeast preserved-rot/100d: armed-63003 = **14,399** vs
control-63003 = 2,712 — one seed drives the leg. On that seed the armed
side has 91 plenty-rack-days vs 22 on control: the lever's equilibrium
effect (keeping food fresh keeps pantryFreshDays > 4 longer) extends the
plenty regime 4×. Preserved rot scales with plenty-regime length (more
smoking total → more smoked stock → more smoked-then-rotted): 108k rack
kcal armed vs 57k control, at 0.46× the per-day rate. The mechanism is
healthy (0.567×/day on belongfeast); the absolute is confounded by
exposure — the SAME confounding b2 documented for the total-rack primary,
now biting preserved-rot on an 8-seed per-policy leg. Without 63003: armed
777 vs control 836 → 0.93 (still above 0.80 — the leg is genuinely noisy
at n=8, not one bad seed away from GO).

The lever is NOT confirmed wrong: it halves rack pace during plenty on
both policies (0.57×/day), fires 14/16, the aggregate preserved-rot
primary passes decisively (0.538), survival/starvation/national are flat,
and nothing new can die from it. Per Steve's kill discipline (2026-10-21),
a missed bar is not a kill: the miss is a metric-design miss (an 8-seed
per-policy absolute on an event-driven downstream), not a lever miss.
**PARKED, not killed** — third parking, same standing.

## metric review

- preserved-rot/100d as an 8-seed PER-POLICY primary is unstable: single
  seeds dominate (63003 flips belongfeast 0.93 → 2.316). The aggregate
  ([all], 16 seeds) is consistently down across runs (b2: 0.716, b3:
  0.538) — the signal is real, the per-policy N is not. Proposed for the
  NEXT unpark: primary = per-plenty-day rack rate ≤ 0.70 (the behavioral
  measure — stable at 0.56–0.59× across THREE runs, both policies), with
  preserved-rot/100d as a secondary judged on ≥16 seeds; OR keep
  preserved-rot/100d as primary but require confirm-sized N (≥16 seeds per
  policy) before judging a per-policy leg. Do not re-judge this run's
  belongfeast leg on the friendlier metric — the NO-GO stands per §14.
- The death-mode guardrail's canonicalizer needs an expedition → class
  rule (third content-name false-flag in three runs: b's wave-4 names,
  b2's wave-1/2 + show/night, now expedition). Measurement fix for the
  next run, not a lever issue.
- The 100d horizon censors the survival guardrail (32/32 survived) — the
  guardrail is uninformative at this horizon. For the storage half (which
  doesn't touch mortality) consider dropping it or using 150d+ horizons
  when survival sensitivity matters.
- rot/100d absolute as a watcher behaved (1.190, under the 1.20× flag);
  fresh-rot/100d at 1.238 confirms the b2 trade is real but milder than
  measured (+24% vs +53%).

## Reachability

Waves 1–5: wave-4 reached 8/16 → 8/16; wave-5 0/16 both (the wave-5 wall
stands — unchanged by this lever). Arc: not separately tracked (rank
reached global/national). Regional → national: national(end) 11 → 11.
Table: 0 both. Wins: 0 both (SEATDRIVE=0 substrate). Vests: not tracked.
The lever does not gate or unlock any content — it is a behavioral
economic lever, reachability-neutral.

## Village assessment

The village during plenty: the pantry reads >4 fresh days, the cook still
cooks the haven meal, and the racks run at ~0.57× pace — one shed decision
per cook per day, named honestly. Sense test (60d armed, seed 63003,
leadfeast): 18 🍽️◦ shed voice lines, 13/18 unique, 0 consecutive-day
verbatim repeats, 3 distinct speakers (Roberto, Polina, Harlow). The lines
name real instead-of work (patching boots, tending the hearth/fire,
sharpening skinning knives, hauling water, teaching snares, splitting
firewood, carving bowls, weeding gardens, sitting with elders, mending the
palisade) — never idle, never storage work. On plenty days both voices
fire (18/18 shed days also voiced plenty) and the 🍽️◦ vs 🍽️ prefixes read
distinct — the blend blank stays filled. The day stream around shed days
reads like a living village (water runs, wood hauling, meals, gossip,
fire-tending, teaching, storms). No robotic repetition.

Who thrived: villages reaching sustained plenty (the shed's precondition)
kept food fresh longer (33 vs 21 rack-days-plenty) and reached national at
the same rate (11/16 both). Who died: wave-3/4 monsters and starvation
dominate both sides (7 starvation deaths each) — the lever doesn't touch
combat. What was missing: the instead-of work remains narration-only; the
cook's assignment doesn't mechanically change (they still cook, just less
rack work). Honest (the voice claims the absence of rack work, not a
fictional reassignment), but a future pass could make the instead-of work
real. The fresh-rot cost (+24%) is the real trade: the village keeps more
food fresh than the nightly meal can eat.

## Balanced panel (§15)

Before panel `evidence/2026-10-22/storageshed-b3-panel-before/`: 16 cases
(8 fresh seeds 63001–63008 × {leadfeast, belongfeast}, 100d,
FEASTSCALE_R13=1, SEATDRIVE=0, STORAGESHED=0), sourceHead b7160b82f,
sourcesStable, neutrality 2/2 match. After panel
`evidence/2026-10-22/storageshed-b3-panel-after/`: 16 cases (same
options/seeds, STORAGESHED=1), 16 rows, sourcesStable, neutrality 2/2
match. Case JSONs in /tmp (not committed — panel case caches never
commit); panel.json.gz for both sides committed.

Compare `storageshed-b3-panel-compare.{json,md}`: **Decision: invalid —
Unmatched flags** (STORAGESHED=0 vs STORAGESHED=1). This is the
pre-registered contract limitation for env-gated levers: the env flag IS
the lever, so comparator options can never match. The panel as instrument
is sound — matched seeds/policies, stable sources, green neutrality,
observer/contract/source digests identical across sides — but the
automated compare cannot score it. Manual paired row analysis (16 pairs):
national 8→10, table 8→6, won 0→0, vests 0→0, wave4 8→6, wave5 0→0;
death-class diffs are label-granularity shuffles within monster/combat
(net ~0), no new classes on the armed side. No broad-balance footprint;
the sweep's pre-registered threshold remains the judge: PRIMARY NO-GO
(belongfeast leg) stands, PARKED.

## Blanks filled / documented

- FILLED (spec-vs-patch bug, caught by code comparison): the parked
  patch's shed block DESTROYED the shed half (`it.units = u - shedU` with
  no fresh copy pushed back) — violating the b.md spec ("floor(u/2) units
  stay FRESH in the pantry (honest copy...)") and PRESERVATION.md's
  no-nonsensical-calorie-loss canon. Fixed by porting the b2
  re-implementation (honest fresh copy, pre-conversion name, original
  spoilDay). The ported layer is line-identical to the proof-tested b2
  layer (f678af5d8).
- FILLED: det-gate strengthened — old-code (HEAD) vs new-code gate-off
  trajectory digests byte-identical (4/4 configs), not just gate-off
  stability.
- DOCUMENTED (open): the instead-of work remains narration-only; the
  cook's assignment doesn't mechanically change.
- DOCUMENTED (open): the death-mode canonicalizer needs an expedition →
  class rule (measurement fix for the next run).

## Verdict

**NO-GO on the pre-registered primary (belongfeast leg 2.316 > 0.80;
overall 0.538 and leadfeast 0.281 pass) — PARKED, not killed.** Per §14
the miss binds: the lever does not land as a GO. Per Steve's kill
discipline (2026-10-21), a missed bar is not a kill: the lever is not
confirmed wrong — it halves rack pace during plenty on both policies
(0.57×/day, three runs consistent), fires 14/16, the aggregate primary
passes decisively, survival/starvation/national are flat, and the root
cause is a metric-design miss (an 8-seed per-policy absolute on an
event-driven downstream, confounded by the lever's own plenty-extending
equilibrium — the same class b2 documented). Killing it would override
Steve's design direction on the basis of my metric choice. The parked
patch is refreshed from this re-implementation; the evidence records the
NO-GO and the metric review for the next unpark (proposed primary:
per-plenty-day rack rate ≤ 0.70).
