# sim-wave4gate — wave-4/5 unlock gate audit (fleshout-a-2026-10-15T151641Z, loop A, axis scale-onramp)

Diagnostic instrument, zero game-code changes. The r17 finding ("wave-4 unlock gate is a TWO-RUNG bind: 4 wave-3 ledger kill points + regional+ scale, 0/16 met both") is STALE — the gate moved (Steve 2026-10-13 standing-based flexible routes; readiness gate v3 2026-10-15). This run audits the CURRENT gate.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — written before any seed ran)

- **Primary metric:** wave-4 unlock share + binding-rung attribution on non-unlocking runs. For each run that never unlocks wave 4 by end: the binding rung named and numbered (w3-day-floor | w3-ledger2 | standing-raw | standing-defer4), with the actual numbers.
- **GO threshold:** 100% of runs classified (unlocked with day+rung, or non-unlocked with the binding rung named and numbered).
- **Horizon:** 180d, death-aware (+10d dead-village tail in sim-harness; dead villages stop simulating). Short deaths classify at their own rungs.
- **Seeds:** 8 (11,22,33,44,55,66,77,88) × 2 policies = 16 runs. This IS the pilot — n=16 screens whether a confirm round is worth it.
- **Policies:** leadfeast (leadcourt + feastscale r13), belongfeast (belongseek + feastscale r13) — the two courtship roads. FEASTSCALE_R13=1 asserted at the top of the sweep script.
- **Secondary:** wave-5 unlock share + binding rung (standing<t5, split standing-raw vs standing-defer5 vs standing-cap, vs w4faced=0); median day of wave-4 unlock; the standing breakdown (war/diplomacy/plenty) on runs at the bar.

Instrument: scripts/wave4gate-lib-20261015.js (sampler + pure classifier), scripts/wave4gate-20261015.js (sweep), scripts/wave4gate-sense-20261015.js (sense reader). Proof test scripts/test-wave4gate-20261015.js: 35/35 checks pass (constructed states for every rung: below/each-rung/above classify correctly; the plenty road unlocks w4; the plenty cap holds w5 at 199; sampler deterministic and engine-read-equivalent). Raw rows: evidence/2026-10-15/wave4gate-rows.json.

The gate as measured (current master): w3 = day ≥ 25 && waveLedgerPoints(2) ≥ **4** (src/data/wave-ledger.json barsPerWave[2]; the brief's "≥5" is the pre-r2 calibration — stale). w4 = w3 && villageStandingTotal() ≥ t4(100). w5 = w3 && villageStandingTotal() ≥ t5(200) && waveEngaged(4) > 0. villageStandingTotal() is the GATED number: raw = war(25/w3+ kill point) + diplomacy(34/seasoned regional+ link) + plenty(20/major feast); the readiness gate v3 can hold it at t4-1 (defer4: waveEngaged(3) < 3) or t5-1 (defer5: waveEngaged(4) < 2; plenty cap: plenty counts ≤100 toward t5); the peak ratchet floors the total at the released wave's threshold forever.

## Results

**GO check: 100% of 16 runs classified → GO.**

- **Wave-4 unlock: 14/16 (87.5%). Median unlock day 92** (unlock days: 43, 53, 55, 61, 67, 91, 91, 92, 92, 92, 95, 99, 100, 114, 122). Of the 12 runs surviving to day 80+: **12/12 unlocked wave 4**. Earliest unlock: day 43.
- **Wave-5 unlock: 8/16 (50%).**
- **w4 rungs, end-state:** unlocked 14 · standing-raw 1 (leadfeast s77: raw=20, died d41) · w3-ledger2 1 (leadfeast s88: pts2<4, died d40).
- **w4 rungs, ever binding mid-run (runs):** w3-day-floor 16 · w3-ledger2 16 · standing-raw 11 · **standing-defer4 10** · unlocked 14. The faced-experience deferral binds on 10/16 runs mid-run (it delays, then releases — 0/16 at end state).
- **w5 rungs, end-state:** unlocked 8 · standing-cap 2 (belongfeast s11: raw 245; s44: raw 290 — bread-road villages that earned the bar but the plenty cap holds gated at 199) · standing-raw 4 (raw 145–185, never earned 200) · w4-not-unlocked 2.
- **w5 rungs, ever binding mid-run (runs):** w4-not-unlocked 16 · w4faced 14 (transient right after w4 unlock until the first w4 monster is faced — expected) · standing-defer5 6 · standing-raw 5 · standing-cap 3 · unlocked 8.

Wall numbers (for the loop): 16/16 village-lost; median survival 125d, max 164d; national+ 5 (all global); regional 9; village 2; table 14/16. (Wins were not in this arm's pre-registered metrics; the census tracks them.)

### The roads, in standing numbers

- **leadfeast (LEAD road): w4 6/8, w5 6/8.** All 6 unlock runs show diplomacy=102 (3 seasoned regional+ links — the LEAD realm). The bonds road opens both waves: e.g. s66 unlocked w5 with war=0, dip=102, plenty=100 (capped) → 202.
- **belongfeast (BELONG road): w4 8/8, w5 2/8.** diplomacy=0 everywhere — lone seasoned bonds score 0 under the 2026-10-14 regional+ filter, so the BELONG road runs on bread: 5+ major feasts = 100 standing opens wave 4 (earliest unlock in the whole sweep: s33 at day 43, pure bread). But **bread alone cannot buy the fifth draft**: the plenty cap holds gated at 199 no matter how high the feast pile (s44: 12 feasts, raw 290, gated 199). The 2 w5 unlocks came via blood (s88: war=100) and blood+bonds (s55: war=75 + a transient 34-dip link pushing capped to 209 — the peak ratchet then locked it in).

### Calibration check

standingCfg's intent comment ("wave-4 organic unlocks on ~30-50% of day-80+ runs; earliest T4 >= ~day 60") is far from measured on this substrate: 100% of day-80+ runs unlocked, earliest day 43. The t4=100 bar is much easier than the calibration intent on feast-enabled courtship roads (5 feasts = 100). The intent was a sim starting point, not canon — but the gap is large enough to name: on the bread road, wave 4 is nearly free for any village that survives to day ~60.

## The r17 two-rung bind is officially DEAD

The old gate (4 wave-3 ledger kill points + regional+ scale) exists nowhere in the code path — `unlockedWave()` reads standing only, and no scale rank is consulted. 14/16 runs unlocked wave 4 under the new gate vs 0/16 meeting both rungs of the old one. The r17 finding is closed.

Stale remnants found (blanks — zero game-code changes allowed this run, so documented not fixed):
1. `src/js/game.js` lines ~29148-29151, the WAVE UNLOCK comment block: still says "Wave 4 ("The Mirror Draft"): 4 wave-3 ledger points AND scaleRank >= 'regional'" and "Wave 5 ("The Producers"): 3 wave-4 ledger points AND scaleRank >= 'national'". Contradicts the code directly below it.
2. `docs/MONSTER-WAVES.md` Implementation section: "4 wave-3 ledger points + scaleRank >= 'regional' for wave 4; 3 wave-4 ledger points + scaleRank >= 'national' for wave 5." The Wave 4/5 canon sections above it describe the standing gates correctly — the doc contradicts itself.

## Sense verdict (SENSE-TESTING LAW)

Read the wave-3→4 window for two runs (full 📺/📡 beat streams; the instrument routes sysSay through the wrapped say so the hold/release beats are audible — see instrument note below).

**Unlock run — belongfeast s44 (w4@92, w5 cap-bound, died d129): EARNED.** The village feasted its way past 100 standing on the bread road; at d66 the System spoke directly: "The Mirror Draft is not for strangers. Face what hunts you now — stand on the grid with the Final Draft, more than once, more than one kind." (the deferral, named, with the count). They faced 3 wave-3 kinds by d92 and the Mirror Draft opened: "RATINGS ARE UP... Wave 4 talent has been released." The SAME day the cap beat fired, naming the w5 block precisely: "The fifth draft is not bought with bread alone. Bread counts a hundred toward it and not a crumb more — bring blood or bonds for the rest." The village kept feasting (12 feasts, raw 290) and wave 5 never opened. Fiction and mechanics agree at every step — the clearest end-to-end demonstration of the flexible-route design in the sweep.

**Non-unlock run — leadfeast s77 (died d41, uw=3): a village that never got there, not a silent gate.** Wave 3 opened d36 with the pointer beat ("Get me STANDING — blood, bonds, or bread"); standing was 20 (1 feast); the village died d41 in the Siege contest (3 player deaths, 13 villager deaths in the transcript). They were fighting for survival five days after wave 3 landed. Nothing silent about it.

**Wrinkle (blank):** the defer beat names "the Mirror Draft" before wave 3 unlocks (fired d66 on s44; wave 3 landed d77). The scale-pointer beats deliberately avoid naming wave 4 pre-unlock ("the next act" — knowledge gate: the name isn't earned until wave 4 lands), but the defer beat names it. Minor fiction inconsistency; flagged, not fixed (game code).

## Instrument note (harness gap found and worked around)

sim-harness `loadGame` silences `sysSay` for sims (installs a no-op) while `say` gets wrapped by instruments — so the standing hold/release beats ("not for strangers", "bread alone", "RATINGS ARE UP") are COMPUTED in every sim (gated numbers, `_standingDeferBeat` state) but narrated to nobody. The no-silent-gates rule can't be sense-tested in sims as-is. Workaround (instrument-side only, no harness change): the sweep routes `Game.sysSay` through the wrapped `say` using the engine's own routing (`📺 SYSTEM: "<text>"`), honoring the `systemArrived` gate exactly as the engine does. This run captured 9 defer beats, 2 cap beats, 65 release beats. Whether the harness default should change is a loop-level call — the silence exists for sim throughput.

## Metric review (§14)

- The pre-registered w5 rung taxonomy (standing<t5 vs w4faced=0) was refined BEFORE the final sweep to split standing<t5 into raw / defer5 / cap, after the probe run showed raw=245 gated=199 — a village that earned the bar but was capped. Instrument refinement, not a re-score: no binding verdict changed, only label granularity. The end-state "ever-binding" rung history was added for the same reason: end-state classification alone hid the deferral (10/16 runs saw standing-defer4 bind mid-run; 0/16 at end state). Both recorded here.
- GO threshold met (100% classified). The primary metric is satisfied by end-state attribution; the rung history is supplementary evidence, not a re-score.
- No confirm round: the pilot (n=16) gives a clean, low-noise picture — every rung exercised, the deferral's delay-vs-block behavior measured, the bread-road w5 block demonstrated twice. A confirm would narrow the unlock-share CI without changing any verdict. The open question is now survival/table/national (16/16 died), which belongs to the scale-wall axis, not this gate.
- Pre-registered in the sweep script header before any seed of the final sweep ran; the JSON rows carry the same preReg block.
