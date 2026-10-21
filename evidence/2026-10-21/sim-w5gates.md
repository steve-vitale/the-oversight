# sim-w5gates — "decompose the wave-5 unlock gate" (flesh-out loop, 2026-10-21, ARM sim-w5gates)

Run: fleshout-20261021T0146Z. Axis: scale-onramp (the blocking axis).
DIAG-GO — instrument-only, ZERO src/js changes, ZERO scripts/policies changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, the readiness gate, design call #4). The code is authoritative for the gate decomposition.

## The bind

The wave-5 door is the scale-onramp's binding wall: 0 wins with national/table in the latest long sims, and every recent arm dies before or inside the window. The vgear pilot (sim-villagergear, 2026-10-20, SEATDRIVE=0 pre-seat substrate) met the veteran leg 3/16 with 0/16 unlocks — nobody could say WHY the other gates didn't move, because no instrument ever decomposed the wave-5 unlock gate into its exact components. This arm builds that instrument and runs it on the vgear substrate.

## Gate decomposition (from code — src/js/game.js unlockedWave, src/js/standing.js)

`unlockedWave()` returns 5 iff ALL of these hold simultaneously:

1. **W3 RUNG** (`game.js:30687`): day ≥ `dayFloor` (25) AND `waveLedgerPoints(2)` ≥ `barsPerWave[2]` (4). Without it, high standing unlocks wave 4 before wave 3 ever had — the rung sits ON TOP of the standing gate.
2. **STANDING GATE** (`villageStandingTotal()`, standing.js:171): the gated total ≥ `t5` (200), where the gated total is the minimum over applicable holds:
   - **plenty cap** (`cap`): raw ≥ 200 but `standingPlentyCappedTotal()` < 200 → held at t5−1 (199). "Not bought with bread alone" — bread counts at most `plentyCapT5` (100) toward the T5 bar.
   - **defer4** (readiness deferral, design call #4): raw ≥ t4 (100) but `waveUnlockReady(4).ready` false and peak < 4 → held at t4−1 (99). NOTE: this bound is TIGHTER than defer5's — wave-4 readiness blocks wave-5 indirectly even when the T5 bar is full.
   - **defer5** (readiness deferral, design call #4): capped ≥ t5 but `waveUnlockReady(5).ready` false and peak < 5 → held at t5−1 (199).
   - **peak ratchet** (monotonic): `_standingPeakWave` floors the total at the released wave's threshold forever (release also fires `_standingReleaseBeat`).
3. **W4 FACED** (`game.js:30687`): `waveEngaged(4)` > 0 — distinct wave-4 monsters fought blow-by-blow, read off `deedState().wavesFaced` (fed by real startCombat/fieldFight/recordWaveKill; fleeing counts). Deed-gate bars are NOT part of this gate (Steve's 2026-10-10 reversal) but are recorded as non-binding data.

Standing sources (`villageStanding()`): war = waveLedgerPoints(3,4,5) × 25 (per-type cap 2); diplomacy = seasoned regional+ links × 34 (30+ days, trust 40+, polityOf filter); plenty = major feasts (quality ≥ 1) × 20.

Readiness bars (`waveCombatReadiness(w)`, standing.js:209) — demands from `standingCfg().readyDemand` (recalibrated 2026-10-18, sim starting points, Steve can overrule):

| wave | armored | armor P | armed | tricks | veterans |
|---|---|---|---|---|---|
| 4 | 3 | ≥10 | 5 | 3 | 1 (wave-3+ killers, living) |
| 5 | 4 | ≥15 | 6 | 3 | 2 (wave-4+ killers, living) |

ARMOR: fighters WORN armor at P ≥ demand (equipment.armorOf; scholar via armorBonus). ARMED: weapon to hand (equipped or carried). TRICKS: monsterCounterKnown convention. VETERANS: living roster members with a wave-(w−1)+ kill in `state.waveKillLog` — fleeing records nothing. Waves 1–3 never gated; fail-closed on read errors.

Holds are never silent: `_standingHoldBeat` (initial + 7-day reminders for deferrals, one-time for the cap) names the short bars via `_readinessBarLine`; `standingLine()` names every hold; the wave's TITLE is never named in a hold (knowledge-gate discipline).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** attribution completeness — every run's wave-5 unlock outcome fully attributed to gate states (met/unmet gates with distance-to-met), 0 unexplained runs. A run is "attributed" when: (a) uw < 5 and ≥1 unmet gate explains it with consistent distance-to-met, or (b) uw ≥ 5 and every gate component reads met (or grandfathered by the peak ratchet). A miss is NO-GO, never re-scored (§14).
**GO threshold:** 16/16 attributed.

**Unit note:** the unit is the run (16 runs: 8 seeds × 2 policies). There is no baseline-vs-variant contrast — this is a diagnostic arm, not a lever confirm.

**SECONDARY (report, don't judge):** per-gate reach distributions; which gate binds most often; whether veteran-leg-met ever coincides with unlock (the vgear pilot's 3/16 veterans met vs 0/16 unlocks); guardrail-adjacent wall numbers (national/table/wins, wave reach 1–5, median/max survival, death-cause shares); SENSE-TESTING judgment on the System's hold/readout lines vs the instrument's gate states.

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max via the harness). Set from the baseline survival distribution (prior vgear runs: door-window activity ~day 60–130).

**Seeds:** 8 FRESH seeds 64401–64408 (verified unused as RNG seeds before pre-registration — the 64401/64408 substrings found in evidence are incidental float digits, not seeds) × {leadfeast, belongfeast} = 16 runs.

**Policies:** scripts/policies/villagergear.js `vgearLead`/`vgearBelong` = `withVillagerGear` over the feastscale leadfeast/belongfeast bases.

**Substrate env:** VGEAR=1 FEASTSCALE_R13=1, SEATDRIVE unset. The sweep FAILS LOUD unless the env matches exactly.

**Instrument:** scripts/w5gates-lib.js (pure gate-vector read) + scripts/w5gates-sweep-20261021.js. Per run: full end-of-run gate vector (each gate's state + distance-to-met) + a compact daily trace (uw, raw, capped, rd4/rd5 bars, w4faced) + captured System hold/release lines. DET gate (W5GATES_BARE=1): instrument-on vs instrument-off byte-identical trajectories on paired seeds.

**Proof:** scripts/test-w5gates-20261021.js — RED→GREEN on gate-state detection (synthetic states: locked-on-defer5, locked-on-cap, locked-on-w4faced, grandfathered-unlocked) + DET gate on paired seeds.

## metric review

(§14: doubts about the metric belong here, proposed revisions apply to the NEXT run.)

- The primary (attribution completeness, 16/16) bound the run and was met — but it is an instrument-consistency property, not a lever effect. It proves the instrument reads the engine honestly; it does not by itself move the axis. NEXT RUN: pre-register a MECHANISM metric as the judged primary (e.g. veteran-bar fill rate, or armor-at-veteran-fill) with attribution completeness demoted to a guardrail.
- The sweep's own beat-capture was blind by harness design: sim-harness.js stubs `G.say`/`G.sysSay` to no-ops for sims ("telemetry + state carry the signal"), so the 19 "missing beats" in the first analysis were a harness artifact, not game silence. The sanctioned sense path is `loadGame({narration:true})` (scripts/w5gates-sense-20261021.js). NEXT RUN: any fiction-vs-state sense check must use the narration-live path, never the silenced sweep capture.
- "Distance-to-met" for the readiness bars is a snapshot at run end; the binding leg over a run's life is better read from the daily trace (e.g. s64402's armor collapsed from 5→0 while veterans filled). The analyzer's end-snapshot understates bar churn. NEXT RUN: report binding-leg-days from the trace, not just the terminal snapshot.

## Results (JUDGED — corpus complete, 16/16 runs)

**PRIMARY: 16/16 attributed — GO.** Every run's wave-5 unlock outcome fully attributed to gate states with distance-to-met; 0 unexplained runs. The instrument reads the engine honestly (proof 29/29 GREEN incl. DET byte-identical).

### Binding-gate verdict

| Binding gate | Runs |
|---|---|
| stand-raw (standing never reached 200) | 8 |
| defer5 (readiness deferral on wave 5) | 5 |
| plenty-cap ("not bought with bread alone") | 1 |
| w3rung (early death, day<25/l2<4) | 1 |
| — (unlocked) | 1 |

Per-gate reach (end / ever in trace): w3 rung 15/16 · raw≥200 7/7 · capped≥200 6/6 · rd4 ready 4/9 · **rd5 ready 0/1** · rd5 veterans≥2 2/2 · rd5 armor≥4 5/15 · rd5 armed≥6 7/16 · rd5 tricks≥3 16/16 · w4 faced 7/7 · unlocked 1/1.

**The unlock (belongfeast s64406, day 97 — the only one):** w3rung@36, capped≥200@93, rd4ready@57, **rd5ready@97 — veterans hit 2 the same day the door opened**, w4faced@63. Blood+bread hybrid: war 125 (5 ledger pts) + bread capped at 100 = 225 ≥ 200. Both wave-4 killers survived 73 days post-kill (the vgear yield+survival protocols working). The village died d170 in the wave-5 window — the unlock did not save it. The peak ratchet held uw=5 while the readiness bars collapsed post-unlock (a1/w2 at end) — the ratchet working exactly as designed ("a broken link can't re-lock an opened draft").

**The vgear pilot's question — WHY did veteran-leg-met (3/16) coincide with 0/16 unlocks — is now answered.** The defer5 binders split three ways:
1. **Veterans never fill (4/5):** s64401/05/06/07-leadfeast end with veterans=0 — s64405 survived the FULL 182d horizon at wave 4 without a single wave-4+ villager kill. The veteran bar is the single binding leg; armor/weapons/tricks were all met.
2. **Mortality selection (1/5):** s64402-leadfeast filled veterans (v2 at d108) but armor collapsed 5→0 as the kills landed (a5 d60 → a1 d98 → a0 d108) — the village bled out its armored fighters earning the veteran bar, and defer5 re-bound on armor (1/4) + weapons (1/6). Earning the veteran bar costs the armor bar: a catch-22 in the current demands.
3. **The window kills (general):** s64402 died d117, nine days after veterans filled — the gap between "veterans met" and "all four bars met" is where villages die.

On this substrate, veteran-leg-met coincided with unlock 1/2 times (vs the pilot's 0/3) — the coincidence is now measurable, not assumed. The pilot's shape (veterans met, door shut) reproduces exactly when the OTHER three bars don't move.

**The plenty-cap binder (belongfeast s64402):** raw 210, capped 150, bread-capped loss 60 — the "not bought with bread alone" rule biting exactly as designed on a bread-heavy village. Held at 199.

**The stand-raw binders (8/16):** villages that never reached 200 standing — the scale wall in its plainest form. Range: s64403/belongfeast died d47 (w3 rung unmet) to s64407/belongfeast which survived all 182d at raw 155 — a ceiling below the bar.

### SENSE-TESTING (narration-live re-runs — the silenced sweep capture was a harness artifact)

With `narration:true`, the System's voiced gate states match the instrument's gate states EXACTLY:
- d57 defer4 hold: "The next act is not for strangers. The village must be ready to FIGHT the Final Draft — blood your fighters (0 of 1 veterans)." — bar counts match the instrument.
- d64–d92 weekly reminders, same content — the 7-day cadence from code, voiced.
- d95: "RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft opens." then immediately the defer5 hold: "The fifth draft stays in the wings. The Producers want a village that can fight them — armor the village (3 of 4 fighters armored); blood your fighters (0 of 2 veterans)."
- d102–d130 reminders track the decay the instrument measured: armor 3→2→1, weapons 5→4→3, veterans 0→1 — **the fiction narrates the mortality-selection decay in real time.**
- The unlock run's narration (belongfeast s64406, narration-live re-run): d50/d57 defer4 hold → d57 Wave-4 release → **d60 plenty-cap beat** ("The fifth draft is not bought with bread alone. Bread counts a hundred toward it and not a crumb more — bring blood or bonds for the rest.") → d93 defer5 hold → **d97 release5** ("RATINGS ARE UP... the Producers have greenlit the fifth draft. Wave 5 talent has been released.") — every voiced line matches the instrument's gate states day-for-day, including the cap path.
- GAP (logged to sim-findings.md, not fixed — DIAG arm): the defer5 first-fire beat names "The Producers" while the code comment on `_readinessBarLine` claims the wave's title is never named in holds. Documented-vs-actual gap in the knowledge-gate discipline.

### Wall numbers

national 11/16 · table 11/16 · wins **0/16**. Wave reach 1:16 2:16 3:15 4:9 5:1. Survival median 146d, max 182d, min 47d. Death causes: combat=373 · villager combat=151 · sickness=32 · monster=31 · expedition=22 · starvation=21 · "a wound that wouldn't close"=20 · contest=9 · ambush=3 · thirst=2.

Note: 11/16 reach national AND table with 0 wins — the table is reached but never converted on this substrate. The wall is past the door now, not just at it.

## Named nexts

1. **Break the veteran/armor coupling** (the precise mechanism this arm isolated): filling the veteran bar costs armored fighters (s64402: a5→a0 as v0→v2). Candidate levers: counter-kills or companion-finisher kills counting toward veterans without the armor bleed (vgear's yield leg already stages this); or the VETSHAPE=1 shape already instrumented in standing.js (living-or-dead killers) — the bar-changes-shape question from sim-wave4census, still Steve's call.
2. **The 4 zero-veteran survivors**: s64405/01/06/07-leadfeast reach capped≥200 with veterans=0 — the village never attempts (or never lands) wave-4+ kills even with wave 4 unlocked for 20+ days. Next: instrument WHY no wave-4 kills land (no encounters? break-offs? scholar soloing?) — the killdisc instrument (KILLDISC=1) already exists for this.
3. **w5gates-lib is reusable and policy-agnostic**: any future arm can call `gateVector(Game)`/`attribute(v)` for per-run attribution. The sibling lever loop can attribute its own runs through it.
4. **Fiction gap** (sim-findings.md): defer5 first-fire names "The Producers" vs the code comment's never-name-the-title discipline — flag for the fiction lane, minor.
5. **Metric revision** (see metric review): next diagnostic run judges a mechanism metric, keeps attribution completeness as guardrail, and does sense checks narration-live.
