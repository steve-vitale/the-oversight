# ARM "recoverthrottle" — the post-combat-death recovery throttle (scale-onramp) — KILLED AT PILOT

Worktree: `~/workspace/worktrees/sim-recoverthrottle`. Run: oversight-flesh-out-loop, run fleshout-a-20261015T0510Z, axis scale-onramp. ARM 1 of 3 (coordinator claim: sim-succhaircut, sim-wave5posture, sim-recoverthrottle — this arm took the #215 recovery-lever blank).
Base SHA: d2307a55 (local master at registration).

## The blank

sim-findings.md #215 (OPEN → claimed by this arm): POST-COMBAT-DEATH RECOVERY LEVER CANDIDATE (from the succbrake kill, 2026-10-14): the killed feed brake improved median survival +27.5d (94→121.5d, 7/8 seeds longer) and national 5/8→8/8 with wave-5 1/8→2/8 — via a different mechanism than claimed (2-day ranging throttle after scholar combat deaths reduces wild exposure; the feed chain itself was untouched). Deserves its own arm with a SURVIVAL primary (median/national), not a feed primary. Layer rebuildable from evidence/2026-10-14/sim-succbrake.md spec.

Note on the lineage (read before judging this arm's bars): the throttle has now been tested 5 times (r34 succbrake guardrails +27.5d, r35 recoverylever pilot +53d / confirm +4.5d KILL, r36 recconf leadfeast +2.5d KILL, r37 recthrottle stratified hard +24d/friendly −5.5d KILL, r38 rechealth hard +24d/friendly −20d KILL, r39 recdaily hard +10d/friendly +9d KILL). This arm is the FAITHFUL REBUILD of the original succbrake mechanism (scholar combat death → 2-day Haven hold, N=2, no snapshot gates, no re-checks, no person-trigger extension) with the survival primary the r34 kill prescribed. The sense line adopts the r34 note: "nobody ranges till the watch stands down."

## Canon read

- docs/CANON.md (manifest + standing rules). No canon doc covers post-trauma recovery posture specifically; the layer uses only existing engine verbs (travelTo, say, displayName) and the existing policy path (fourthlink/leadcourt/competent). The guard-posture fiction ("nobody ranges till the watch stands down. The mantle needs a living bearer.") is the r34/r35 design call Steve can overrule.
- Engine facts used (read, not invented): ledger.js playerDeath moves the new bearer <redacted> the haven tile on succession; the death tele carries `player:true` ONLY on scholar deaths (scale-wall r17); competent's ranging legs handle failed travelTo gracefully (forageTripSeedFirst's `continue`); haven tile = `state.village.px ?? 4 / py ?? 4`; combatExit (flee-by-barrier) is the honest escape verb.

## The layer (scripts/policies/recoverthrottle.js, RECOVERTHROTTLE=1, default OFF)

Gate off → the wrapper delegates to fourthlink verb-for-verb (proof R1/G8; sim det-gate byte-identical rows). Gate on → wraps fourthlink:
(a) each daily/upkeep count-cursor scans the death telemetry for new scholar (player:true) deaths; a combat-category death (categorizeCause === 'combat', monster-named causes count) opens/extends the fortify window (deathDay + 2, chained deaths extend + re-announce); non-combat deaths recorded, never fortify;
(b) inside the window: walk home if away (bounded ≤12 honest haven-ward hops on real travelTo), say the guard-posture line once per window (names the dead and the living holder, improved phrasing), then run the base daily+upkeep under a travel guard — any travelTo not targeting the haven tile is declined (`{moved:false}`); combatExit always passes; haven chores run normally.
No new verbs; every call is an existing engine path. Named exports (recoverthrottle, withRecoverthrottle, FORTIFY_DAYS) per the 2026-10-14 unwrap lesson.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any measurement

- **Question**: does the faithful succbrake rebuild — 2-day Haven hold after a scholar combat death — improve survival on the courtship road, measured honestly on current tip with its own control?
- **Substrate**: leadcourt + FOURTHLINK=1 (the r34/r35 courtship road). **Seeds**: 11/22/33/44/55/66/77/88. **Horizon**: 180d death-aware. **Policies**: control = fourthlink (gate off); armed = fourthlink + recoverthrottle (RECOVERTHROTTLE=1). Identical seeds, own control in the same sweep — CONTROL BASELINE DRIFT #247: never inherit a baseline from prior evidence, even on identical seeds.
- **PRIMARY**: median survival armed ≥ control + 10d. (The +10d bar is calibrated between the r35 confirm miss (+4.5d vs a +5d bar) and the r34/r35-pilot guardrail effects (+27.5d/+53d) — honest for a faithful rebuild, not inherited from the never-releasing variants.)
- **CO-PRIMARY**: national armed ≥ control.
- **GUARDRAILS**: (1) feeds/mantleSuccessions armed ≤ control × 1.3 — the layer must not worsen the Haven-siege feed (the falsified r34 theory); (2) no new death mode at the n≥3 family floor per #216 (armed-only cause with n≥3 absent from control); (3) exiled 0 armed; (4) starvation deaths armed ≤ control + 2 (the r37/r38 stranding channel).
- **GO iff PRIMARY and CO-PRIMARY hold and all guardrails hold.** A miss is NO-GO → KILL. Metric binding (§14): a miss is NO-GO, never re-scored mid-run.
- **Det-gate**: gate-off wrapper vs raw fourthlink — byte-identical rows (seeds 11+44); SMOKE=1 instrument-honesty FIRST; one A/A spot check (control seed 11 ×2, identical rows).
- **Confirm**: ONLY on GO — 12–16 fresh seeds on the same road, added to the pilot set per the r35 metric review.
- **Unwrap**: named exports (`require('./policies/recoverthrottle').recoverthrottle`); `typeof policy.daily === 'function'` asserted before any run (the 2026-10-14 unwrap bug).

## Results — PRIMARY MISSED, CO-PRIMARY MISSED, FEED GUARDRAIL MISSED → NO-GO → KILL

### Det-gate + A/A — PASS (pre-measurement)

- SMOKE=1 proof (instrument-honesty gate FIRST): 4/4. Full proof: 11/11 GREEN (R1/R2 REAL RED).
- Sim det-gate: gate-off wrapper vs raw fourthlink — **byte-identical rows 8/8** (mode-normalized; the control suite reproduced the det-gate suite exactly on all 8 seeds).
- A/A: control seed 11 ×2 — byte-identical rows.
- Unwrap guard (`typeof policy.daily === 'function'`) fired on nothing.
- Post-kill verification: proof INFO-SKIPs (exit 0), sense INFO-SKIPs (exit 0), sweep armed/detgate refuse LOUD (exit 2, verified), sweep control still runs and reproduces s11 exactly (33d).

### Own control — CONTROL BASELINE DRIFT #247 vindicated again

r34's control (94d median) did NOT reproduce on current tip: **108.5d** (det-gate suite identical — the wrapper is inert, so this is the true baseline).

`evidence/2026-10-15/sim-recoverthrottle-control.json`: median **108.5d**, national **5/8**, table 0/8, wins 0/8, w4 5/8, w5 0/8, exiled 0, feeds **10/52 = 0.1923/succ**, starvation 9.
Per-seed days: 33, 159, 53, 123, 115, 93, 103, 114.

### Armed — the layer fired and the villages died younger

`evidence/2026-10-15/sim-recoverthrottle-armed.json`: median **69d** vs 108.5d (**−39.5d**), national **2/8** vs 5/8, table 0/8 both, wins 0/8 both, w4 4/8 vs 5/8, w5 0/8 both, exiled 0 both, feeds **9/30 = 0.30/succ** vs 0.1923, starvation **11** vs 9.
Per-seed (ctrl→armed): s11 33→30 (−3), s22 159→123 (−36), s33 53→66 (+13), s44 123→135 (+12), s55 115→112 (−3), s66 93→47 (−46), s77 103→72 (−31), s88 114→54 (−60). 2/8 longer.
Layer observability: **20 windows, 54 fortify-days, 180 declined sorties** — the mechanism engaged honestly; this is a measured harm, not a no-fire.
Death-share move: player:combat 47→29 (the hold protects the scholar), villager:starvation 7→11 (the stranding trade), pooled starvation 9→11.

### Verdict — NO-GO → KILL (§14 binds)

- **PRIMARY**: armed 69d ≥ 108.5+10=118.5d? **MISS by 49.5d.**
- **CO-PRIMARY**: armed national 2/8 ≥ 5/8? **MISS.**
- **GUARDRAIL feeds/succ**: 0.30 ≤ 0.1923×1.3=0.25? **MISS** (the siege feed worsened per-succession; the denominator shrank because runs died earlier — the r34 confound, binding anyway).
- **GUARDRAIL no new death mode (n≥3, #216)**: HOLD — armed-only causes all n=1 ('The Eater', 'Buffering', "Don't-Look", 'The Congregation', 'The Strike', 'Big Big', 'The Reunion' — watch items).
- **GUARDRAIL exiled 0**: HOLD. **GUARDRAIL starvation ≤ 11**: HOLD (11 ≤ 11, at the bound).
- GO requires PRIMARY + CO-PRIMARY + all guardrails → **NO-GO → KILL.** Kill protocol ran: `scripts/policies/recoverthrottle.js` DELETED; proof/sense INFO-SKIP (exit 0, verified); sweep armed/detgate refuse LOUD (exit 2, verified); control mode still runs.

### Why it missed — the stranding trade dominates on this tip

The mechanism engaged (20 windows) and did what it was built to do — scholars died less in combat (player:combat 47→29). But every hold removes the village's best forager for 2 days, and on this tip the cost dominated: pooled starvation rose to the guardrail bound, and the early-window seeds collapsed (s66 93→47, s88 114→54). The r39 refinement stands — the pantry isn't the only thing the scholar's absence costs (missed foraging windows, compounding absence). The feed chain was untouched (the r34 falsification holds): 9/30 per-succession, with the siege continuing inside fortified windows (s44 transcript: Minh dies 2 days after the mantle; Leandro and Ivy die the same day d130).

The lineage picture is now six measurements with an unstable sign: +27.5d (r34, ctrl 94d) → +53d (r35 pilot, ctrl 94d) → +4.5d (r35 confirm, ctrl 125.5d) → +24d/−5.5d (r37) → +24d/−20d (r38) → +10d/+9d (r39) → **−39.5d (this arm, ctrl 108.5d)**. The faithful r34 rebuild REVERSES r34's own result on the current tip. The throttle's survival effect does not reproduce across tips — the effect is state-dependent and unreliable, and the stranding channel now dominates. The throttle family should be considered exhausted as a survival lever on this road; the next scale-onramp work should target other mechanisms (the siege-response lever the r34 kill already named, or food-economy levers that don't remove the forager).

## Village assessment (plain words)

Eight villages, each lived twice, on a tip whose baseline drifted again. The armed villages died younger almost across the board — 5 of 8 shorter, only s33 (+13d) and s44 (+12d) gained. The sharp cases: s88's control village ran 114 days and reached national; the armed version, held through one 2-day window, died at d54. s66: 93→47. s77: 103→72. These are not villages that failed to thrive — they were thriving, and the hold's bill came due in the same week the guard stood.

Who died: bearers, at Haven, in sight of the fire — the siege continued inside the fortified windows. s44's transcript shows it plainly: Carlos dies d81, Minh takes the mantle, the posture line fires ("After Carlos's death, Minh holds Haven — nobody ranges till the watch stands down"), Minh dies d83 two days later; Leandro takes over, dies d130; Ivy takes over and dies the SAME day d130. The guard stood. The killer was already home.

Who lived: the commons, barely — s44's armed village ran longest (135d) and reached national, but on fewer links and thinner margins than its control. The death shares tell the trade in aggregate: the scholar stopped dying in combat (player:combat 47→29 — the layer's one real protection), but the village starved more (pooled starvation 9→11, at the guardrail bound) and died younger anyway. Protection that costs the forager is not protection.

The wall: national 2/8 armed (5/8 control), table 0/16, wins 0/16, wave-5 0/16. No run reached the table or a win on either side. The scale wall stands — and this arm pushed the mortality side the wrong way.

## SENSE-TESTING (scripts/sense-recoverthrottle-20261015.js, seed 44, armed)

The guard-posture line fired 3 times (d54, d81, d83 — the last a chained death, re-announced), once per window, no spam:

- d54: "🕯️ After Howard's death, Carlos holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer."
- d81: "🕯️ After Carlos's death, Minh holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer."
- d83: "🕯️ After Minh's death, Leandro holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer."

Each names the real dead and the real living holder, states a decision with a reason, and lands inside the engine's own grief beats ("Howard Bennett is dead — combat. The village stops. Somebody screams. Somebody else starts digging.", the Codex's mantle-transfer page). No "Someone" lines — scholar deaths always carry real names, so the r35 dead-paparazzo bug class doesn't apply to this scholar-only trigger. Minor critique: the line uses the first name ("Howard's death") while the engine's beat uses the full name ("Howard Bennett is dead") — a polish item for any revival.

The surrounding transcript reads as people (raid beats with named grudges — "Word comes back with a torn pack and no Kai. Buffering, out past the ridge. The fire is quieter tonight." — the Codex paging on its own for the dead). The SENSE-TESTING LAW is satisfied: the posture reads as a village regrouping, and the transcript shows the siege the lever cannot fix — Minh dies two days after the posture line names him the living bearer.

## Blanks filled / documented

- **Measured** (not chased): the #215 faithful succbrake rebuild on the courtship road with a survival primary — median 69d vs 108.5d control (−39.5d, primary MISSED by 49.5d), national 2/8 vs 5/8 (co-primary MISSED), feeds/succ 0.30 vs 0.1923 (guardrail MISSED at ×1.3). The layer engaged honestly (20 windows, 54 fortify-days, 180 declined sorties, det-gate 8/8 byte-identical, A/A identical) — a measured harm, not a no-fire.
- **Falsified** (this arm): the hope that the r34 guardrail effect (+27.5d) was the mechanism's true shape. The faithful rebuild REVERSES it on the current tip. The throttle's survival effect does not reproduce across tips — six measurements, unstable sign.
- **Documented** (sim-findings.md): (1) the lineage's exhaustion verdict — the throttle family is spent as a survival lever on this road; next scale-onramp work should target the siege-response lever (r34's named next) or food-economy levers that don't remove the forager; (2) CONTROL BASELINE DRIFT #247 re-vindicated — r34's 94d control did not reproduce (108.5d); (3) the det-gate suite (gate-off wrapper) reproduced the control suite exactly on all 8 seeds — a second independent determinism proof beyond A/A; (4) armed-only death causes all n=1 (no new mode at the n≥3 floor — the floor stayed quiet again).
- **Instrument notes**: (1) the BEARER-REDACTION corruption (AGENTS.md 2026-10-13) hit this run live — `bearerOf`/`noteBearerOf` written as `bearer <redacted>` in 3 files; caught by the SMOKE run (not by reading the file, which cannot distinguish), repaired via sed, all files `node --check` clean; (2) the proof/sense INFO-SKIP catches hardened to fire only on the layer's own MODULE_NOT_FOUND — any other load error now throws LOUD (the silent INFO-SKIP masked the corruption on first run); (3) a mid-run service restart killed the control sweep — all recovery-critical files were under ~/workspace (never /tmp), nothing was lost, the run re-executed cleanly; (4) telemetry-check needs flat top-level aggregates — patched the three suite JSONs (r36/r38 fix) before the deviation check.

## Metric review (§14 — for the NEXT run)

1. **The +10d bar was fair and the miss is unambiguous** (−39.5d). No bar-calibration excuse is available this time — unlike the lineage's close calls (+4.5d vs +5d, +10d vs +15d), this is a clean kill on the primary. The bar did its job.
2. **The feed-per-succession guardrail's run-length confound bit again** (r34 predicted it): shorter armed runs concentrate siege-phase deaths, so the per-succession rate worsened even as absolute feeds fell (9 vs 10). It bound anyway per §14 — correct, since the guardrail's job was "don't worsen the siege feed" and the siege continued inside fortified windows. A future feed guardrail should be rate-per-day or phase-stratified — but the lever it guards is dead now.
3. **The n≥3 new-death-mode floor stayed quiet again** (armed-only causes all n=1). Keep the floor.
4. **Stratification would not have saved this arm** — unlike r37/r38, there was no friendly/hard split to hide behind; the harm was broad (5/8 seeds shorter, only 2 longer). The pre-registered single-set design was the right call for a faithful rebuild.
5. **Honest counterpoint**: the mechanism's one real protection (player:combat 47→29) is measurable and the sense-test reads clean. The problem is not the fiction or the trigger — it's the economics: 2 days without the top forager costs more than the combat exposure it saves, on this tip, on this road. A future variant that holds WITHOUT removing the scholar (a villager-side or Haven-defense response — the siege lever) is the only shape of this idea left untested.
6. **Lineage verdict for the tracker**: six measurements of the 2-day post-death hold now span +53d to −39.5d. The effect is state-dependent, not a lever. Recommend the convergence tracker record the throttle family as exhausted on the scale-onramp axis.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed suite (`evidence/2026-10-15/sim-recoverthrottle-armed.json`, flat top-level aggregates patched per the r36/r38 fix) vs `hidden_files/telemetry-baselines/scale-wall.json`, metrics `national,table,wins,exiled`: **LOUD: national swung −75%: baseline 8 → current 2**.
- **Investigated, EXPLAINED, not a bug**: (1) the baseline is 2 days old (2026-10-13 20:14) and predates the current tip's drift — this run's OWN control measured national 5/8, so the baseline's 8 no longer describes any current-tip run; (2) the 2/8 is the arm's measured (harmful) effect under a proven-honest instrument (det-gate 8/8 byte-identical, A/A identical, control reproduces s11 post-kill) — the swing is real behavior, not an instrument artifact.
- **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks the wall across runs and must not absorb a killed arm's numbers (r34–r39 precedent). The baseline itself is stale and belongs to the coordinator/ship loop's attention, flagged in sim-findings.

## Wall numbers (this arm's suites)

| | national | table | wins | wave-4 | wave-5 | medianSurv | maxSurv | exiled |
|---|---|---|---|---|---|---|---|---|
| control (8) | 5/8 | 0/8 | 0/8 | 5/8 | 0/8 | 108.5d | 159d | 0/8 |
| armed (8) | 2/8 | 0/8 | 0/8 | 4/8 | 0/8 | 69d | 135d | 0/8 |

No run reached the table or a win on either side. Wave-5 zero unlocks both sides. The scale wall stands — and this arm moved the mortality side backward.

## Files (layer deleted per kill protocol; everything else kept)

- `scripts/policies/recoverthrottle.js` — DELETED per kill protocol (NO-GO at pilot: primary −39.5d, co-primary and feed guardrail missed).
- `scripts/test-recoverthrottle-20261015.js` — proof: 11/11 GREEN pre-kill (R1/R2 REAL RED; G0–G8); SMOKE=1 4/4; INFO-SKIPs post-kill (exit 0, verified). INFO-SKIP catch hardened to the layer's own MODULE_NOT_FOUND only.
- `scripts/sweep-recoverthrottle-20261015.js` — pilot driver (pre-registration in header); --mode control|armed|detgate; flat top-level aggregates (r36/r38 telemetry fix); per-day pg.tableWaiting instrumentation; kill-protocol refusal (armed/detgate exit 2 post-kill — verified; control still runs — verified, reproduces s11 exactly).
- `scripts/sense-recoverthrottle-20261015.js` — sense transcript reader; INFO-SKIPs post-kill (exit 0, verified).
- `evidence/2026-10-15/sim-recoverthrottle.md` — this file.
- `evidence/2026-10-15/sim-recoverthrottle-control.json` — own control (8 seeds; median 108.5d; det-gate suite identical 8/8).
- `evidence/2026-10-15/sim-recoverthrottle-armed.json` — armed (8 seeds; median 69d; 20 windows, 54 fortify-days, 180 declined).
- `evidence/2026-10-15/sim-recoverthrottle-detgate.json` — det-gate suite (gate-off wrapper; byte-identical to control 8/8).
- `evidence/2026-10-15/sim-recoverthrottle-aa1.json` / `-aa2.json` — A/A determinism (s11 ×2, byte-identical).
