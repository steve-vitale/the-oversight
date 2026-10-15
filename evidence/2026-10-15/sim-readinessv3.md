# sim-readinessv3 — the readiness gate v3 (v2 exact rebuild, fixed metric) (2026-10-15)

Worktree: `~/workspace/worktrees/sim-readinessv3`. Run: oversight-flesh-out-loop, 2026-10-15.

## Context: v2 killed on a mis-specified primary, mechanism proven
- v1 (evidence/2026-10-15/sim-readinessgate.md): kill/counter/armor bar — KILLED AT PILOT (holder rate 0.833 < 0.9725 bar, §14). Reverted byte-clean.
- Diagnostic (evidence/2026-10-15/sim-readinessbind.md, landed 613eb8d7): NO unlock-day-covariate bar supportable; named the teeth (faced-experience, plenty cap, monotonic).
- v2 (evidence/2026-10-15/sim-readinessgate2.md): faced-experience bar (N4=3/N5=2) + plenty cap (100 toward T5) + monotonic ratchet — measured post-unlock deaths 4→1, holder rate 0.800→0.938, median +67d, national +2, table +5, all guardrails HOLD — but KILLED AT PILOT on a mis-specified primary (control × 1.25 = 1.000 on a 0.800 control rate: unachievable by construction, rates bounded by 1). Code reverted byte-clean; instruments kept.
- v3 = v2 rebuilt EXACTLY (same thresholds, same cap, same ratchet, same beats, src/js/standing.js ONLY) with the metric review's named fix: absolute counts or additive bars, never relative multipliers on rates with control ≥ 0.8.

## The lever (game code, src/js/standing.js only — v3 = v2 verbatim)
- `waveUnlockReady(w)`: FACED-EXPERIENCE — distinct wave-(w-1) types faced blow-by-blow (`waveEngaged`: fleeing counts, you stood on the grid). Thresholds (sim starting points, not canon — Steve can overrule): wave 4 needs 3 distinct wave-3 types faced; wave 5 needs 2 distinct wave-4 types faced.
- `standingPlentyCappedTotal()`: plenty counts at most 100 toward the T5 bar — bread alone cannot buy the fifth draft.
- Monotonic unlocks (`_standingPeakWave`): once the gated total releases wave w, the effective total never drops below that wave's threshold again.
- `villageStandingTotal()` (only engine reader: `unlockedWave()` in game.js, untouched): applies the plenty cap (raw ≥ t5 but capped < t5 → held at t5-1, one-time System beat), the faced-experience deferral (held at t4-1/t5-1, engagement beat + weekly reminders), then the peak ratchet. `standingLine()` names holds/caps — no silent gates.
- Dropped per the diagnostic: kill-type, counter, and armor criteria; any trust term.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)
- **Axis**: scale-onramp (the wall), lever-2 lens (wave unlock pacing). Same tree, identical seeds, in-script standing.js swap (pristine HEAD vs armed v3; no stash). RE-BASELINE on the CURRENT tree (CONTROL BASELINE DRIFT #247: never inherit v2's numbers; NARRATION→RNG COUPLING #263: committed sweep JSONs are perishable).
- **Seeds**: 11/22/33/44/55/66/77/88 × leadfeast/belongfeast (= leadcourt/belongseek via FEASTSCALE_R13). **Horizon**: 180d death-aware.
- **PRIMARY**: absolute 30d post-unlock deaths among non-war-driven w4/5 Standing unlockers (war < threshold **at the unlock day** — the v2 instrument fix, kept): **armed ≤ control − 2**.
- **CO-PRIMARY**: 30d post-unlock holder rate among the same population: **armed ≥ control + 0.10**.
- **GUARDRAILS**: wave-4 unlock rate within control ± 0.15 (the 0.20–0.60 band is miscalibrated for this substrate — v2 both sides were 0.688); median survival ≥ control−10d; national ≥ control−2/16; no new death mode at the cause-FAMILY level (strip player:/villager: prefix, named-monster kills → 'monster'; armed-only family with n≥3 = new mode).
- **Gates before spend**: proof scripts/test-readinessv3-20261015.js REAL RED→GREEN; det-gate byte-identical both sides; SMOKE=1 instrument-honesty.
- **GO**: primary AND co-primary met at pilot, all guardrails HOLD → confirm 12–16 seeds before calling GO. A miss is NO-GO, never re-scored mid-run (§14).

## Design calls documented for Steve's overrule (kept from v2)
1. N4=3 / N5=2 faced thresholds — sim starting points. N5=2 chosen because the diagnostic's w5 unlocks all sat at exactly 1 faced type; N4=3 is unmeasured (no wave-3 faced data) — the pilot's defer4Ever tells us if it bites.
2. Plenty cap 100 toward T5 — the "two full avenues" rule: bread can carry half the fifth draft, never all of it.
3. Monotonic unlocks — answers the diagnostic's spec question ("should unlocks stick?") with YES.
4. Armor P and trust are OUT of the bar (diagnostic: both invert).
5. **NEW (v3 rebuild finding)**: the faced bar as spec'd conflicts with the committed Standing proof (scripts/test-standing-20261013.js, Steve's 2026-10-13 flexible-route design): that test asserts T4 via war/diplomacy/plenty/hybrid with ZERO faced experience → wave 4, and T5 = 200 + ONE wave-4 type faced → wave 5. The gate holds all of those (N4=3, N5=2). v2's instruments never ran that test. If this gate lands, the standing test needs a redesign pass with Steve — the N4/N5 bars themselves are already his to overrule. Documented, not fixed (this arm is standing.js-only by brief).

## Results (pilot, 8 seeds × leadfeast/belongfeast, 180d death-aware, identical seeds, own control in same sweep)

Gates before spend (all green): proof scripts/test-readinessv3-20261015.js REAL RED (pristine → INFO-SKIP) → GREEN 29/29 armed (faced deferral fires; each channel releases; plenty cap binds; monotonic ratchet holds; no-win-before-90 intact). Det-gate 16/16 byte-identical on BOTH sides (armed + pristine). SMOKE=1 instrument-honesty green (named-export unwrap + v2 mechanism reachable on scripted fixtures).

| metric | control (pristine) | armed (v3 gate) | pre-reg bar | verdict |
|---|---|---|---|---|
| PRIMARY: absolute 30d post-unlock deaths, non-war-driven w4/5 unlockers | 3 | 0 | armed ≤ control−2 (=1) | GO |
| CO-PRIMARY: 30d holder rate, non-war-driven | 0.800 (16/20) | 0.938 (15/16) | ≥ 0.900 | GO |
| wave-4 unlock rate | 0.688 | 0.688 | within ±0.15 | HOLD |
| median survival | 109d | 176d | ≥ 99d | HOLD (+67d) |
| national | 6/16 | 8/16 | ≥ 4 | HOLD |
| new death mode (family, n≥3) | — | none | none | HOLD |
| wall: table / wins | 7/16 / 0 | 12/16 / 0 | — | — |
| SECONDARY: deferral engagement | — | defer4 11/16, defer5 5/16, median held 13d, max 89d | — | bar has teeth |
| SECONDARY: wave-5 unlocks | 9/16 | 6/16 | — | cap + tooth bite |
| SECONDARY: faced counts at unlock (armed) | — | w4: all ≥3 (10× exactly 3, 1× 4); w5: all exactly 2 | — | bars bind, then release |
| SECONDARY: faced counts at unlock (control) | w4: 0–2 (eleven unlocks); w5: 1–5 | — | — | the bar would have bitten |

Control deaths (3): leadfeast s22 w4d55 + w5d82 (village-lost d83 — died inside both windows), belongfeast s44 w4d50 (village-lost d70). The one armed non-holder is CENSORED, not a death: leadfeast s88 w5d160, run survived to d180 (20d observed < 30d window).

**PILOT VERDICT: GO** — primary and co-primary met, all guardrails HOLD. Per the pre-registration, confirm on 12 seeds before calling GO.

## Results (confirm, 12 seeds × leadfeast/belongfeast, 180d death-aware, identical seeds, own control in same sweep)

| metric | control (pristine) | armed (v3 gate) | pre-reg bar | verdict |
|---|---|---|---|---|
| PRIMARY: absolute 30d post-unlock deaths, non-war-driven w4/5 unlockers | 7 | 1 | armed ≤ 5 | GO |
| CO-PRIMARY: 30d holder rate, non-war-driven | 0.714 (20/28) | 0.920 (23/25) | ≥ 0.814 | GO |
| wave-4 unlock rate | 0.667 | 0.667 | within ±0.15 | HOLD |
| median survival | 93d | 176d | ≥ 83d | HOLD (+83d) |
| national | 9/24 | 12/24 | ≥ 7 | HOLD |
| new death mode (family, n≥3) | — | none | none | HOLD |
| wall: table / wins | 8/24 / 0 | 17/24 / 0 | — | — |
| SECONDARY: deferral engagement (armed) | — | defer4 15/24, defer5 8/24, median held 13d, max 89d | — | bar has teeth |
| SECONDARY: faced at unlock (armed) | — | w4: min 3, max 4 (16 unlocks); w5: all exactly 2 (10 unlocks) | — | bars bind, then release |
| SECONDARY: faced at unlock (control) | w4: 0–3; w5: 1–5 | — | — | the bar would have bitten |

The one armed death in the confirm window: belongfeast s132 — wave 4 held 23d, released d97, wave 5 d118 (2/2 faced), village-lost d129 (11d after the w5 unlock; the w4 window was held). The gate delays the war; it doesn't win it. Control deaths (7): leadfeast s22 (w4d55+w5d82, 2), s99 (w5d62, 1), s121 (w4d48+w5d57, 2), belongfeast s44 (w4d50, 1), s132 (w4d74, 1) — combat/monster-led, the #209/#210 pattern.

**CONFIRM VERDICT: GO** — primary and co-primary met on 24 runs/side, all guardrails HOLD. The arm lands.

## Metric review (§14 — for the NEXT run, not this one)
1. **The fixed metric works.** Absolute deaths (pilot 3→0, confirm 7→1) and the additive holder bar (+0.10; pilot +0.138, confirm +0.206) both GOed cleanly. The v2 metric review's prescription — absolute counts or additive bars, never relative multipliers on rates with control ≥ 0.8 — is validated by this run. No re-scoring was needed or done.
2. **Floor/ceiling honesty for future bars.** The absolute-deaths bar (armed ≤ control−2) is unachievable if control deaths re-baseline to 0–1; the additive holder bar (control+0.10) is unachievable if control ≥ 0.91. Both are honest consequences of the bar shape, not bugs: if the control stops dying, there is nothing to fix; if the control is near-perfect, there is no headroom. Future primaries on this axis should check achievability against the re-baselined control BEFORE the scored run (a 2-seed sniff is enough).
3. **The ±0.15 wave-4 band works.** Both sides 0.688 (pilot) and 0.667 (confirm) — the band judges stability, not a tune target. Keep it.
4. **The instrument fix holds.** Driven evaluated at the unlock day (not the Standing crossing) — the armed leadfeast s22 w4 unlock (war-driven at d83) was correctly excluded from the primary population while its w5 unlock (nbw) was included. Deferred unlocks are no longer systematically excluded.
5. **Monotonicity still untested in the wild.** No run in pilot or confirm hit the re-lock scenario (standing collapse after unlock with a live link-break); the peak ratchet fired only in proof fixtures. The diagnostic's 2/5 re-locks were on fourthlink/belongseek. A future run should deliberately include a link-break scenario.
6. **The plenty cap's standalone effect is still untested** (median plentyCapDays 0 armed in both pilot and confirm — it is a backstop for the pure-plenty path, not a frequent gate). Its effect is visible in wave-5 unlocks (pilot 9→6, confirm 12→10).
7. **Committed-test tension (design call #5).** The faced bar as spec'd conflicts with scripts/test-standing-20261013.js (Steve's 2026-10-13 flexible-route design): that test asserts T4 via war/diplomacy/plenty/hybrid with zero faced experience and T5 = 200 + one wave-4 type faced. On the armed tree, 5 of those assertions fail (plus 2 fixture-hygiene failures from the peak leaking across that test's resetStanding, which doesn't clear the new state keys; 1 failure — T4-via-hybrid — is pre-existing on pristine from the 2026-10-14 regional+ filter). If the gate lands, the standing test needs a redesign pass with Steve. This is a Steve call, not a worker call: the N4/N5 bars change what T4/T5 *mean*.

## SENSE-TESTING (armed leadfeast s33 — 32d held, wave-4 d89, wave-5 d135, survived 180)
- d57: the faced-experience hold beat fires in the System's voice — "the Mirror Draft is not for strangers. Face what hunts you now — stand on the grid with the Final Draft, more than once, more than one kind." It lands amid ordinary village life (pod bargaining, spoiled stores, breakfast) — the System's voice cutting through the mundane.
- d64/71/78/85: weekly reminders with LIVE counts — "1 of 3 kinds faced" → "2 of 3 kinds faced". The reminder isn't static; the player watches the bar fill.
- d88: release composes — "RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft opens." Immediately the wave-5 hold beat follows ("the fifth draft stays in the wings..."), then the engine's own wave-4 announcement. Three System beats on one day — a lot of voice, but it is the payoff for 31 held days; dramatically appropriate.
- d95–d130: w5 reminders with live counts (0 of 2 → 1 of 2). d135: "the Producers have greenlit the fifth draft."
- The 30d post-unlock window reads as a living village: Nikolai stands down a monster bloodied but breathing, Bloodied raids hit the pantry, Callback telegraphs surface. No village deaths — the holder story.
- PASS on meaning and coherence. The beats name the bar honestly in both directions; the player is never told they're "ready" — the world responds when they are.

## Village assessment (plain words)
The armed villages are the control villages with a bouncer at the door — and the bouncer asks for scars, not trophies. Control villages feast and befriend their way to wave 4 by day ~50 and wave 5 days later; on the confirm substrate, seven diplomacy/plenty unlockers were dead within a month (median 93 days). Armed villages hit the same Standing numbers and hear *not yet* — and in the held weeks (11–89 days) they keep living: they face the Final Draft's monsters (the reminders count the kinds: 1 of 3, 2 of 3), they season their links, they fight. When the drafts open, they open onto villages that have stood on the grid. Median 176 days, table 17/24. The one armed corpse in the confirm window is the honest remainder: belongfeast s132 held wave 4 for 23 days, faced the champions, unlocked wave 5 on d118 — and was gone by d129. The gate delays the war; it doesn't win it.

## Blanks filled / documented
- FILLED (landing): the readiness gate v3 — faced-experience bar (N4=3/N5=2) + plenty cap (100 toward T5) + monotonic unlocks, built in `src/js/standing.js` only, proved REAL RED→GREEN 29/29, det-gated 16/16 both sides, SMOKE green, measured against its own paired control on the current tree (pilot 16 runs/side + confirm 24 runs/side), GO on the fixed metric.
- DOCUMENTED (design call #5, Steve's overrule): the faced bar changes what T4/T5 mean vs the committed Standing proof (test-standing-20261013.js). 5 assertions fail on the armed tree by design; 2 more fail on fixture hygiene (that test's resetStanding doesn't clear _standingPeakWave/_standingDeferBeat/_standingPlentyCapBeat); 1 (T4-via-hybrid) fails on pristine too (pre-existing, 2026-10-14 regional+ filter). If the gate lands, the standing test needs a redesign pass with Steve.
- DOCUMENTED (carried from v2): monotonicity needs a wild test with a link-break scenario; the plenty cap's standalone effect is untested.
- CANDIDATE (from the diagnostic, now measured): "≥N distinct wave-4 types faced" as a T5 tooth — N=2 held 8/24 confirm runs' wave-5 unlocks; all released or run-ended; every armed w5 unlock faced exactly 2.

## Convergence
scale-onramp: CONVERGING → **one step closer**. The readiness gate v3 is the first readiness-gate arm to GO on a pre-registered achievable primary (absolute deaths 7→1 confirm, holder rate +0.206, median +83d, national +3, table +9, every guardrail HOLD on 24 runs/side). The mechanism is proven twice (v2's killed run + v3's landed run, same numbers). What stands between this and the wall: (a) Steve's overrule on design calls #1–#5 (the faced bar redefines T4/T5 — his 2026-10-13 flexible-route design says 100/200 alone suffice); (b) the rest of the win path (wins still 0 — this arm is the unlock gate, not the win). The axis does not move to `converged` until villages reach national/table in sims on the strength of the whole chain — but the unlock-day lethality that #209/#210 measured is now gated.

## Files
- `src/js/standing.js` — the v3 gate (LANDING).
- `scripts/test-readinessv3-20261015.js` — proof, REAL RED (INFO-SKIP on pristine) → GREEN 29/29 armed.
- `scripts/sweep-readinessv3-20261015.js` — pilot + confirm sweep, SMOKE=1 gate, in-script pristine/armed swap with byte-verified restore, fixed primary/co-primary/guardrails, at-unlock driven measurement.
- `scripts/det-gate-readinessgate-20261015.js` — det-gate 16/16 identical both sides (reused v2 instrument).
- `scripts/sense-readinessgate-20261015.js` — beat-capture sense replay (reused v2 instrument).
- `evidence/2026-10-15/sim-readinessv3.json` — pilot per-seed rows both sides (16 runs/side).
- `evidence/2026-10-15/sim-readinessv3-confirm.json` — confirm per-seed rows both sides (24 runs/side).
- `evidence/2026-10-15/sim-readinessv3.md` — this file.
