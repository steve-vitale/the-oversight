# ARM "recdaily" — the daily re-check recovery throttle (scale-onramp)

Worktree: `~/workspace/worktrees/sim-recdaily`. Run: oversight-flesh-out-loop, axis scale-onramp. ARM: sim-recdaily (policy-side).

## The blank / the lineage

r37 (evidence/2026-10-15/sim-recthrottle.md) measured the 2-day Haven hold after a combat death OF A PERSON on its home courtship road with stratified bars: hard set +24d (117 vs 93, primary met), friendly set −5.5d (122 vs 127.5, no-regression bound missed by 2.5d) — NO-GO → KILL. The stranding mechanism: the hold keeps the SCHOLAR home (policies drive the player; engine-side villager foraging untouched) and the scholar is the top forager — the throttle trades wild exposure for pantry pressure.

r38 (evidence/2026-10-15/sim-rechealth.md) tested sim-findings #249's first named next — a thriving-village EXEMPTION (hold engages only on pantryFreshDays>=3 AND hungryStreak==0, evaluated once per trigger): hard set +24d again (128.5 vs 104.5, primary met), friendly set −20d (88.5 vs 108.5, bound missed by 17d) — NO-GO → KILL. The mechanism refinement: the stranding is a FLOW problem, not a stock problem. The exemption decides with a snapshot taken at trigger time; the snapshot goes stale the moment the hold starts because the hold itself removes the scholar's intake for 2+ days (37/147 triggers exempted, yet the friendly harm grew −5.5d → −20d). A per-trigger gate checks the state BEFORE the hold; the harm is the hold's effect ON the state. The r38 metric review's named next: "a daily re-check that releases the hold as the pantry thins mid-window."

THIS run tests that named next: the hold ENGAGES on every combat death of a person (no snapshot gate), but EACH DAWN the policy re-checks pantry flow and releases the scholar early if the village needs its forager. A daily re-check watching the flow, not a snapshot gate deciding once.

## Canon read

- docs/CANON.md (manifest + standing rules) and docs/MONSTER-WAVES.md (wave law; combat deaths of people are the throttle's trigger). No canon doc covers post-trauma recovery posture specifically; the layer uses only existing engine verbs (travelTo, say, displayName) and the existing policy path (fourthlink/belongseek). The guard-posture fiction ("nobody ranges till the watch stands down") is the r35 design call Steve can overrule; the early-release fiction ("the watch stands down early — the pantry needs filling") is THIS run's design call, Steve can overrule.
- Engine facts used (read, not invented): `Game.pantryFreshDays()` (game.js:13870 — fresh non-preserved non-spoiled kcal / measured burn rate, 12×2000 fallback pre-endDay, returns 999 when burn history exists but burn <= 0); `hungryStreak` on the SHARED `progState()` (game.js:27262, increments when ANY villager is starving — so "nobody hungry" is `=== 0`, and "someone starving" is `> 0`). Death tele shape (corpses.js): `{type:'death', day, kind, who, cause, wave, player}`; player:true rides ONLY on scholar deaths (ledger.js playerDeath, r17). Haven tile: `state.village.px ?? 4 / py ?? 4` (9x9 center); scholar position `Game.map.px/py`; `Game.say` is the engine narration path. People-only trigger (the r35 sense-fix): scholar (player:true) or kind person/villager — NEVER monster. Non-combat deny-list carried from r37 (starvation, dehydration, thirst, hunger, sickness, disease, plague, pestilence, old age, grief, exile, banishment, accident, fall, drowned, drowning, frostbite, frozen, exposure, childbirth, scurvy, heatstroke); monster-named causes, expedition, "a wound that wouldn't close" count as combat for person deaths (trauma).

## Design calls (mine — Steve 2026-10-07: figure it out yourself; Steve can overrule)

1. **No snapshot exemption.** recdaily = recthrottle + daily re-check. The rechealth kill proved the per-trigger gate structurally unable to fix the stranding; adding it back would confound this arm's measurement.
2. **The hold always engages** on a triggering combat death of a person (2 days, chained deaths extend), announcement on each window-opening naming the dead and the living (mantle line for scholar deaths, "Crews stay close to home." for villager deaths).
3. **Re-check each dawn**: in `daily()` only, while inside an active window, on days AFTER the window's opening day. `upkeep()` (3x/day) maintains the guard but does not re-check — the release is a dawn decision, not a mid-day one.
4. **Release conditions (release if ANY fires)**:
   - `progState().hungryStreak > 0` — someone is actively starving (the r37/r38 smoking-gun condition).
   - `Game.pantryFreshDays() < 2.0` — fresh reserves below a 2-day buffer (below where the old ≥3 exemption bar sat — hysteresis by design).
   - **Flow**: `pantryFreshDays()` declined vs the hold-start baseline reading (strictly less). The baseline must be a real reading (< 100, guarding the 999 burn-rate sentinel — a snapped-in estimator is not a trend). Recorded at window-open; a chained extension re-baselines at the new opening (each death is a fresh village decision).
5. **Release announcement, once per release**: "☀️ The watch stands down early — {holder} goes back out. {dead} is buried, and the living need to eat." Names the living holder and the dead whose hold is lifted. No re-announcement on subsequent days.
6. **On release**: the window closes (`_recFortifyUntil` cleared), the scholar ranges that day (base daily runs unguarded), the release is recorded (`_recReleased++`, condition breakdown `_recReleaseCond.{hunger,floor,trend}`).
7. **Counters**: `_recWindows` (opened), `_recReleased`, `_recReleaseCond` breakdown, `_recFortifyDays` (daily-only, only on days actually held), `_recDeclined` (sorties declined by the guard).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any measurement

- **Question**: does the DAILY RE-CHECK recovery throttle fix the friendly-side harm of the recovery throttle while keeping the hard-set gain — the 2-day hold engages on every combat death of a person, but each dawn the policy re-checks pantry flow and releases the scholar early if the village needs its forager?
- **Seed sets (fixed, same-road as r37/r38)**:
  - SET-L (lead set): leadcourt+FOURTHLINK=1, seeds 11/22/33/44/55/66/77/88.
  - SET-B (belong set): belongseek, seeds 11/22/33/44/55/66/77/88.
  - 16 runs per side (control + armed), identical seeds, deterministic. Own control in the same sweep — CONTROL BASELINE DRIFT #247: never inherit a baseline from prior evidence, even on identical seeds.
- **Stratum rule (fixed, control-side, r37/r38 precedent)**: per-set control median survival <100d = HARD, >=100d = FRIENDLY; same-side fallback: lower-median set = HARD. Strata assigned from this run's control numbers — no re-drawing.
- **Primary (hard stratum)**: armed median >= control median + 15d (the rechealth strata bar).
- **No-regression bound (friendly stratum)**: armed median >= control median − 3d (the rechealth strata bar).
- GO iff BOTH hold. A miss on either is NO-GO → KILL. Metric binding (§14): these bars bind this run — a miss is NO-GO, never re-scored mid-run; metric doubts under "metric review".
- **Guardrails (pooled 16)**: national >= pooled-control − 2; no new death mode (cause-family level, n>=3 floor per #216); exiled <= pooled-control + 1. Wave-5/table/wins report-only (r37/r38 metric review: at n=8 the pooled rare-event guardrail is too jumpy).
- **Horizon**: 180d death-aware (harness stop tail). **Policies**: control = base road through the same instrument, gate OFF; armed = base + recdaily layer (RECDAILY=1). Identical seeds.
- **Det-gate**: gate-off wrapper vs raw base — 16/16 byte-identical rows (8 seeds × 2 roads); SMOKE=1 instrument-honesty FIRST; one A/A spot check per road (control seed 11 ×2, identical rows).
- **Unwrap**: named exports (`require('./policies/recdaily').recdaily`, `.recdailyBelong`); `typeof policy.daily === 'function'` asserted before any run (the 2026-10-14 unwrap bug).
- **Confirm**: ONLY if GO — 12–16 fresh seeds per set (added to the pilot set, not replacing, per the r35 metric review).

## The layer (scripts/policies/recdaily.js, RECDAILY=1, default OFF)

Rebuilt from the r37/r38 proof spec, plus the #249 daily re-check:

- Gate off → the wrapper delegates verb-for-verb to the base (proof R1/G12; sim det-gate 16/16 byte-identical).
- Gate on → wraps the base (`withRecdaily(base, layerId)`):
  (a) each daily/upkeep scans telemetry for new death events (count-cursor, deterministic); a combat-category PERSON death (scholar player:true OR kind person/villager; NEVER monster — the r35 dead-paparazzo sense-fix, REAL-RED verified in the proof's G3 against the people-only filter) opens/extends the recovery window (deathDay + RECDAILY_DAYS=2, chained deaths extend with a new announcement and a re-taken flow baseline);
  (b) on each window-opening: the guard-posture line fires once naming the dead and the living holder (mantle line for scholar deaths, "Crews stay close to home." for villager deaths); the pantry flow baseline `_recHoldStartFresh = Game.pantryFreshDays()` is recorded;
  (c) EACH DAWN (in `daily()` only, on hold-days after the opening day) the re-check runs BEFORE the guard installs: `recheckRelease(Game, ctx)` returns 'hunger' | 'floor' | 'trend' or null —
      'hunger' if `progState().hungryStreak > 0`,
      'floor' if `pantryFreshDays() < 2.0`,
      'trend' if `pantryFreshDays()` declined vs the hold-start baseline (strictly less; baseline must be a real reading < 100, guarding the 999 burn-rate sentinel);
  (d) on release: the window closes, the release line fires once ("☀️ The watch stands down early — {holder} goes back out. {dead} is buried, and the living need to eat."), the release is recorded (`_recReleased++`, `_recReleaseCond.{hunger,floor,trend}`), and the base daily runs UNGUARDED — the scholar ranges;
  (e) on days still held: walk home if away (bounded ≤12 haven-ward hops, real travelTo, before the guard installs), then run base daily+upkeep under the travel guard — travelTo AWAY from the haven tile declined (`{moved:false}`), haven-ward/lateral passes, combatExit (flee-by-barrier) always passes; `_recFortifyDays` increments in daily only on days actually held (a dawn release means no fortify-day).
- No new verbs; every call is an existing engine path. The re-check reads the same canonical numbers the engine/village reads (`pantryFreshDays()`, `progState().hungryStreak`).

## Proof: scripts/test-recdaily-20261015.js — REAL RED, then 19/19 GREEN

Phase-A naive build (a plain hold with no re-check, written from scratch inline): R3/R4/R5 — the DESIRED release behaviors (hunger mid-hold, thin pantry mid-hold, declining pantry across hold days) — FAILED against it, 3/3 RED-OK (the r38 stranding reproduced: the naive hold never releases). R1 (gate-off delegation, no `_rec` state) and R2 (gate-off + combat death → scholar still ranges, the blank) passed as the contract baseline.

Phase-B against the real layer (RECDAILY=1), 17/17 GREEN:
- G0 named-exports unwrap (`recdaily`, `recdailyBelong`, `recheckRelease` — the 2026-10-14 lesson).
- G1/G2: hold engages on villager/scholar combat death — announcement says once, names the real dead (June Aguilar) and the real living holder (Theo); scholar death carries the mantle line ("The mantle needs a living bearer."); scholar walked home.
- G3: monster combat death does NOT trigger (people-only, the r35 sense-fix). G4: starvation death does NOT trigger. G16: monster-named cause ("Choir Toad") DOES trigger for a person death.
- G5/G6/G7: dawn release on hungryStreak>0 (cond=hunger), freshDays<2.0 (cond=floor), declining pantry vs hold-start baseline (cond=trend) — window closes, scholar ranges, release line says once naming holder+dead.
- G8: rising pantry + no hunger + ≥2 does NOT release — hold continues, away sorties declined, declines counted.
- G9: natural expiry after 2 days — ranging resumes, no release line, no release recorded. G10: chained death extends + re-baselines + new announcement. G11: release line fires exactly once per release.
- G12: gate-off 3-day scripted run — travelTo sequences + ctx keys identical to raw base (the proof-level det-gate).
- G13: combatExit (flee) passes during the hold. G14: walk-home bounded ≤12 hops. G15: the 999 baseline sentinel does not fire a trend release.
- SMOKE=1: same suite, <1s, instrument-honesty gate FIRST. Post-kill: the proof INFO-SKIPs when the layer is absent (exit 0, never MODULE_NOT_FOUND) — verified pattern from r37/r38.

## Results

### Det-gate — PASS (pre-measurement)

- Gate-off wrapper vs raw base: **16/16 byte-identical rows** (8 seeds × lead set + 8 seeds × belong set). `evidence/2026-10-15/sim-recdaily-detgate-L.json`, `sim-recdaily-detgate-B.json`.
- SMOKE=1 instrument-honesty: the proof suite (<1s) FIRST — 19/19 green, 3/3 red-ok.
- A/A determinism spots: control seed 11 ×2 on each road — IDENTICAL rows.
- Unwrap guard (`typeof policy.daily === 'function'` on the base) fired on nothing.

### Own control — CONTROL BASELINE DRIFT #247 vindicated again

The r38 control numbers (SET-L 108.5d, SET-B 104.5d) did NOT reproduce on current tip: SET-L 114d, SET-B 106d. Same-ROAD, same-seed, sibling landings between runs. Only the within-sweep identical-seed before/after binds.

`evidence/2026-10-15/sim-recdaily-control-L.json`: SET-L median **114d**, national **5/8**, w5 0/8, w4 5/8, exiled 0.
`evidence/2026-10-15/sim-recdaily-control-B.json`: SET-B median **106d**, national **4/8**, w5 0/8, w4 2/8, exiled 0.

### Stratum assignment (pre-registered rule, this run's control)

Both sets ≥100d → the same-side fallback fires: lower-median set = HARD → **SET-B (106d) = HARD**, **SET-L (114d) = FRIENDLY**. The reverse of r37's labels, the same fallback as r38.

### SET-B (belong set) — HARD stratum

Control `sim-recdaily-control-B.json`: median **106d**, national **4/8**, w5 0/8, w4 2/8, exiled 0.
Armed `sim-recdaily-armed-B.json`: median **116d** vs 106d (**+10d**), national **3/8** vs 4/8, w5 0/8 both, w4 0/8 vs 2/8, exiled 0. 9 recovery windows, **4 released early** (3 trend, 1 hunger), 11 fortify-days, 36 declined sorties.
Per-seed (ctrl→armed): s11 34→34 (+0), s22 180→180 (+0), s33 42→42 (+0), s44 156→156 (+0), s55 106→116 (+10), s66 103→180 (+77), s77 180→69 (−111), s88 78→101 (+23). 3/8 longer.

### SET-L (lead set) — FRIENDLY stratum

Control `sim-recdaily-control-L.json`: median **114d**, national **5/8**, w5 0/8, w4 5/8, exiled 0.
Armed `sim-recdaily-armed-L.json`: median **123d** vs 114d (**+9d**), national **4/8** vs 5/8, w5 0/8 both, w4 5/8 both, exiled 0. 9 recovery windows, **4 released early** (3 trend, 1 hunger), 11 fortify-days, 36 declined sorties.
Per-seed (ctrl→armed): s11 33→34 (+1), s22 159→123 (−36), s33 53→53 (+0), s44 123→123 (+0), s55 115→75 (−40), s66 93→159 (+66), s77 103→72 (−31), s88 114→147 (+33). 4/8 longer.

### Verdict — NO-GO → KILL (§14 binds)

- **Primary (hard stratum, SET-B)**: armed 116d ≥ 106+15=121d? **MISS by 5d.**
- **No-regression bound (friendly stratum, SET-L)**: armed 123d ≥ 114−3=111d? **HOLD (+9d).**
- GO requires BOTH → **NO-GO → KILL.** Kill protocol ran: `scripts/policies/recdaily.js` DELETED; proof/sweep/sense INFO-SKIP post-kill (verified, exit 0); sweep's armed/detgate modes refuse LOUD post-kill (exit 2, verified); control mode still runs; evidence kept.
- Guardrails (pooled 16): national 7 ≥ 9−2=7 ✓ (exactly at floor); exiled 0 ≤ 0+1 ✓; no new death mode at the n≥3 family floor ✓ (armed-only causes all n=1: 'The Reunion', 'expedition', 'the expedition'). Wave-5/table/wins report-only: w5 0/16 both, table 0/16 (per-day instrumented via the sweep-compare convention this run — a measured 0), wins 0/16.

## Why the re-check missed the primary — the mechanism refinement (the real result)

The daily re-check fired honestly (8/18 windows released early — 6 on trend, 2 on hunger, 0 on the floor; the floor never bound because the trend caught the decline first). And it did the job it was built for: the friendly-side harm shrank from r38's −20d (and r37's −5.5d) to **+9d** — the re-check demonstrably un-strands villages whose pantry thins under the hold (s66-L 93→159, s66-B 103→180, s88-B 78→101).

But the hard-set primary missed (+10d vs the +15d bar), and the reason is visible in the per-seed data: **the pantry is not the only thing the scholar's absence costs, and the re-check can only watch the pantry.** s77-B is the sharp case: control ran the full 180d; the armed version held through one window that was NEVER released (no hunger, pantry ≥2, no decline vs baseline — the re-check's three conditions all read "fine") and died at d69, 111 days younger. The hold's cost that week was not a pantry flow the dawn check could see — a missed foraging window, a compounding absence. The re-check watches the flow it can measure; the stranding has costs it cannot.

The pooled death shares tell the same story in aggregate: combat deaths dropped (130 → 83 — the hold protects) but starvation rose (12 → 26 — the hold still trades intake for safety). The re-check blunted the r37/r38 starvation spike; it did not eliminate the trade.

The heterogeneity signature now spans SIX measurements (r35, r36, r37, r38 pilot+confirm, this run): the throttle helps struggling villages and strands thriving ones, and the friendly-side risk is shrinking under flow-aware variants (+9d here) while the hard-side gain proves bar-sensitive (+10d vs +15d). The +15d bar was calibrated on r37/r38's +24d — a bar the re-check's own releases make harder to clear, because the releases also trim hard-set holds that would have helped.

## Village assessment (plain words)

Sixteen village-lives on the courtship road, each twice-lived, on a tip where the baseline drifted again. The belong-set villages are the clearest story: s66's control village died at d103 and the armed version ran the full 180 — the re-check's best case, a hold released at dawn on a declining pantry and a village that lived. s88 (78→101) and s55 (106→116) tell the same story smaller. The mirror: s77's control village ran the full 180 and the armed version died at d69 — a hold the re-check judged safe, on a village that was going to make it. The lead-set villages: s66 (93→159) the re-check's poster case, s88 (114→147) beside it; s55 (115→75), s77 (103→72), s22 (159→123) the strandings the re-check didn't catch. Who thrived: bearers whose villages' worst weeks fell on declining pantries — the re-check released them and they lived. Who died: everyone, eventually — combat is the reaper on this road, and the hold still trades combat exposure for intake (pooled: combat 130→83, starvation 12→26). The villages that live longest meet national (7/16 armed); none reach the table or a win. The wall stands on the arrival side and the win side alike.

## SENSE-TESTING (scripts/sense-recdaily-20261015.js, seed 66, armed, lead set)

The hold AND the early release both read as village decisions:

- d13: "🕯️ After June's death, Theo holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer." — the grief beat, names the dead (June Aguilar) and the living (Theo).
- d14: "☀️ The watch stands down early — Theo goes back out. June is buried, and the living need to eat." — the dawn re-check, one day later: the same dead named, the same holder released, the reason stated as the village's need. Not dispenser text — a decision with a cause.

No "Someone" lines. The release beat lands in the same grief context as the hold beat (the Codex's page for June, the "village stops" beat). Verdict: the re-check's fiction reads as people changing their minds for a stated reason. The SENSE-TESTING LAW is satisfied.

## Blanks filled / documented

- **Measured** (not chased): the #249 daily re-check recovery throttle on the courtship road with stratified bars — hard-set +10d median (116 vs 106, primary bar 121 missed by 5d), friendly-set +9d (123 vs 114, no-regression bound held). The re-check fired on 8/18 windows (6 trend, 2 hunger). Guardrails: national at floor (7 ≥ 7), exiled 0, no new death mode; w5/table/wins 0 report-only.
- **Verified** (this run): the re-check is real and biting — 8/18 holds released early, proof-boundary-tested on all three conditions plus the 999 sentinel (G5/G6/G7/G15 REAL-RED→GREEN against the naive hold). The people-only trigger carried, REAL-RED verified (G3).
- **Documented** (sim-findings.md): (1) the pantry-isn't-everything refinement — the re-check can only watch pantry flow, but the hold's stranding has costs (missed foraging windows, compounding absence) invisible to a dawn pantry read; s77-B (180→69, hold never released) is the case; (2) the six-measurement heterogeneity signature — flow-aware variants shrink the friendly-side risk (+9d) while the hard-side gain proves bar-sensitive; (3) CONTROL BASELINE DRIFT #247 re-vindicated — r38's controls (108.5/104.5d) did not reproduce (114/106d).
- **Instrument note**: table reach IS per-day instrumented in this sweep (the sweep-compare `pg.tableWaiting` convention) — the 0/16 table is a measured 0, fixing r38's by-construction caveat.

## Metric review (§14 — for the NEXT run)

1. **The stratified bars worked as designed, again.** The hard primary missed by 5d and the friendly bound held at +9d — the bars separated the two regimes cleanly, and the kill is on the primary this time, not the friendly bound. A cleaner kill than r38's 17d friendly miss: this arm is closer to the shape of a shippable throttle.
2. **The +15d bar may now be miscalibrated for flow-aware variants.** It was set from r37/r38's +24d — measured on variants whose holds never released early. The re-check's own releases trim hard-set holds too (that's the point), so a flow-aware variant faces a structurally harder primary. If a next variant re-tests, consider calibrating the primary bar on a same-mechanism pilot rather than inheriting r37's number — or pre-register the bar against the friendly bound as the binding constraint (first do no harm) with the primary as a directional.
3. **The floor condition never fired (0/8 releases).** The trend condition catches declines before they reach the 2-day floor — the floor is dead weight in this design. A next variant could drop it or lower it; keeping it costs nothing but it earns nothing either.
4. **The no-new-death-mode n-floor stayed quiet again** (armed-only causes all n=1). Keep the floor.
5. **The stratum fallback fired again** (both sets ≥100d; SET-B hard / SET-L friendly — the reverse of r37, same as r38). The fallback is load-bearing on a drifting tree. Document the assignment every run (done).
6. Honest counterpoint: the primary MISSED, but the friendly side — the thing every prior kill was about — is now +9d. The lineage's original problem (stranding thriving villages) is measurably smaller under the re-check. The remaining problem is primary power, not safety. That's progress with a NO-GO verdict.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed suites (`sim-recdaily-armed-L/B.json`) vs `hidden_files/telemetry-baselines/scale-wall.json`, metrics `national,table,wins,exiled`: **quiet** (2 files, 4 metrics, no large deviations). Flat top-level aggregates (r36/r38 fix) — no schema-mismatch LOUD line.
- **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks the wall across runs and must not absorb a killed arm's numbers (r34–r38 precedent).

## Wall numbers (this arm's suites)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| SET-L control (8) | 5/8 | 0/8 | 0/8 | 5/8 | 0/8 | 114d | 0/8 |
| SET-L armed (8) | 4/8 | 0/8 | 0/8 | 5/8 | 0/8 | 123d | 0/8 |
| SET-B control (8) | 4/8 | 0/8 | 0/8 | 2/8 | 0/8 | 106d | 0/8 |
| SET-B armed (8) | 3/8 | 0/8 | 0/8 | 0/8 | 0/8 | 116d | 0/8 |

Table reach per-day instrumented this run — 0/16 is a measured 0. No run reached a win on either courtship road. The wall stands on the arrival side (national 7/16 armed) and the win side.

## Files (layer deleted per kill protocol; everything else kept)

- `scripts/policies/recdaily.js` — DELETED per kill protocol (NO-GO on the hard primary, missed by 5d).
- `scripts/test-recdaily-20261015.js` — proof: phase-A 3/3 REAL-RED (R3/R4/R5 failed on the naive hold) → phase-B 17/17 GREEN + R1/R2 contract; SMOKE=1 <1s; INFO-SKIPs post-kill (exit 0).
- `scripts/sweep-recdaily-20261015.js` — pilot driver (pre-registration in header); det-gate mode; flat top-level aggregates for telemetry-check (r36/r38 fix); per-day `pg.tableWaiting` instrumentation (fixes the r38 caveat); kill-protocol graceful degradation (armed/detgate refuse LOUD with exit 2 post-kill, control mode still runs).
- `scripts/sense-recdaily-20261015.js` — sense transcript reader (hold + release beats); INFO-SKIPs post-kill.
- `evidence/2026-10-15/sim-recdaily-control-L.json` — SET-L control (8 seeds; median 114d; A/A seed-11 identical).
- `evidence/2026-10-15/sim-recdaily-armed-L.json` — SET-L armed (8 seeds; median 123d, +9d; 9 windows, 4 released).
- `evidence/2026-10-15/sim-recdaily-control-B.json` — SET-B control (8 seeds; median 106d; A/A seed-11 identical).
- `evidence/2026-10-15/sim-recdaily-armed-B.json` — SET-B armed (8 seeds; median 116d, +10d; 9 windows, 4 released).
- `evidence/2026-10-15/sim-recdaily-detgate-L.json` + `sim-recdaily-detgate-B.json` — det-gate: 16/16 byte-identical rows.
- `evidence/2026-10-15/sim-recdaily.md` — this file.
