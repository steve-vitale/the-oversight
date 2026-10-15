# ARM "recthrottle" — the recovery throttle, courtship-road re-confirm (scale-onramp)

Worktree: `~/workspace/worktrees/sim-recthrottle`. Run: oversight-flesh-out-loop, run fleshout-a-2026-10-15-0015, axis scale-onramp. ARM 2.

## The blank / the lineage

r35 (evidence/2026-10-14/sim-recoverylever.md) accidentally discovered then measured the recovery throttle — a 2-day Haven hold after any combat death OF A PERSON: pilot +53d median (94→147d) on the courtship road (leadcourt+FOURTHLINK=1), confirm +4.5d (130 vs 125.5) on fresh seeds, NO-GO by 0.5d. r36 (evidence/2026-10-14/sim-recconf.md) re-measured the same mechanism on the LEADFEAST road: +2.5d median (97 vs 94.5), KILLED at pilot — the effect is ROAD-DEPENDENT (+53d courtship vs +2.5d leadfeast, identical seeds). The r36 metric review's binding lesson (#230): the +15d bar was calibrated on the wrong road; same-ROAD is the binding constraint — the next re-confirm must hold the road fixed OR calibrate the bar on a same-road pilot. THIS run holds the road fixed: the COURTSHIP road (leadcourt + belongseek), the road the effect was discovered on.

## Canon read

- docs/CANON.md (manifest + standing rules) and docs/MONSTER-WAVES.md (wave law). No canon doc covers post-trauma recovery posture specifically; the design uses only existing engine verbs (travelTo, say, displayName) and the existing policy path (fourthlink/belongseek). The guard-posture fiction ("nobody ranges till the watch stands down") is the r35 design call Steve can overrule, preferred over succbrake's policy-speak by the succbrake sense-test.
- Engine facts used (read, not invented): policies only drive the PLAYER (sim-harness: policy.daily/upkeep are the scholar's verbs); villager foraging runs engine-side (game.js forageZone during the day tick) with no policy hook — the "villager expeditions curtailed" prong stays narrated, not mechanized (documented blank from r35, re-documented). Death tele shape (corpses.js:183, game.js:40647): `{type:'death', day, kind, who, cause, wave, player}` — day stamped by `tele`; player:true rides ONLY on scholar deaths (ledger.js playerDeath, r17). Haven tile: `state.village.px ?? 4 / py ?? 4` (9x9 center); scholar position `Game.map.px/py`; `Game.say` is the engine narration path. Real cause strings (r35 control data): combat, villager combat, monster (person killed BY a monster), ambush, "a wound that wouldn't close", expedition, contest, sickness, starvation, thirst, monster names (Choir Toad, The Terms of Service, The Reunion).
- Combat-category design call (Steve can overrule, carried from r35/r36): exact combat causes always count; for PERSON deaths a cause not on the non-combat deny-list counts as combat (monster-named causes are real kills — an allow-list would miss them). People-only trigger (the r35 sense-fix): scholar (player:true) or villager/person — NEVER monster; kept in the spec from the start, real-RED verified (G10).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any measurement

- **Question**: does the trauma-triggered recovery throttle hold on the SAME road it was discovered on (courtship), measured with the r35 metric review's stratified bars — hard-set primary +15d, friendly-set no-regression ≥−3d?
- **Seed sets (fixed, same-road)**:
  - SET-L (lead set): leadcourt+FOURTHLINK=1 (r35's exact substrate), seeds 11/22/33/44/55/66/77/88.
  - SET-B (belong set): belongseek (courtship road, belong flavor), seeds 11/22/33/44/55/66/77/88.
  - 16 runs per side (control + armed), identical seeds, deterministic.
- **Stratum rule (fixed, control-side, recconf precedent)**: compute the CONTROL median survival per set on current tip. The set with control median <100d is the HARD stratum; ≥100d the FRIENDLY stratum. If both land on the same side of 100d, the lower-median set = HARD, the higher = FRIENDLY (documented fallback; labels reported against this run's control medians). Strata assigned from this run's control numbers — no re-drawing.
- **Primary (hard stratum)**: armed median ≥ control median + 15d. (+15d is a same-road, conservative bar — below r35's +53d same-road pilot, per the r36 review's same-road calibration rule.)
- **No-regression bound (friendly stratum)**: armed median ≥ control median − 3d.
- GO iff BOTH hold. A miss on either is NO-GO → KILL. Metric binding (§14): these bars bind this run — a miss is NO-GO, never re-scored mid-run; metric doubts under "metric review".
- **Guardrails (pooled 16 runs)**: national ≥ pooled-control − 2; wave-5 unlocks ≥ pooled-control − 1; no new death mode (cause-family level, n≥3 floor across armed runs — the r29/r34/r35/r36 floor); exiled ≤ pooled-control + 1. Table/wins/other waves report-only.
- **Horizon**: 180d death-aware (harnessstop tail). **Policies**: control = base road through the same instrument, gate OFF; armed = base + recovery layer (RECOVERYLEVER=1). Identical seeds.
- **Det-gate**: gate-off wrapper vs raw base — 16/16 byte-identical rows (8 seeds × 2 roads); SMOKE=1 instrument-honesty FIRST; one A/A spot check per road (control seed 11 ×2, identical rows).
- **Unwrap**: named exports (`require('./policies/recoverylever').recoverylever`, `.recoveryleverBelong`); `typeof policy.daily === 'function'` asserted before any run (the 2026-10-14 unwrap bug).
- **Confirm**: ONLY if GO — 12–16 fresh seeds per set (added to the pilot set, not replacing, per the r35 metric review).

## The layer (scripts/policies/recoverylever.js, RECOVERYLEVER=1, default OFF) — rebuilt from the r35 spec

- Gate off → the wrapper delegates verb-for-verb to the base (proof R1/G9; sim det-gate byte-identical).
- Gate on → wraps the base (`withRecovery(base, layerId)`):
  (a) each daily/upkeep scans telemetry for new death events (count-cursor, deterministic); a combat-category PERSON death (scholar, player:true, OR villager/person; NEVER monster) opens/extends the recovery window (deathDay + RECOVERY_DAYS=2, chained deaths extend);
  (b) on each new triggering death: say the guard-posture line once (scholar death → "…The mantle needs a living bearer."; villager death → "…Crews stay close to home."), naming the dead and the living holder;
  (c) inside the window (day ≤ deathDay+2): walk home if away (bounded ≤12 haven-ward hops, real travelTo, before the guard installs), then run base daily+upkeep under a travel guard — travelTo AWAY from the haven tile declined (`{moved:false}`), haven-ward/lateral passes, combatExit (flee-by-barrier) always passes; haven chores run normally; `_recFortifyDays` increments in daily only.
- No new verbs; every call is an existing engine path. Design calls (Steve can overrule): N=2 (inherited from r34); the guard-posture fiction; combat-only trigger (non-combat deaths recorded, don't open windows); chain-extends; narration fires on window OPEN (each triggering death), not on subsequent hold days; PEOPLE-ONLY trigger; the non-combat deny-list (starvation, dehydration, thirst, hunger, sickness, disease, plague, pestilence, old age, grief, exile, accident, fall, drowned, frostbite, exposure, childbirth, scurvy, heatstroke) — contest/expedition/"a wound that wouldn't close"/monster names count as combat for person deaths (trauma).

## Proof: scripts/test-recthrottle-20261015.js — REAL RED, then 12/12 GREEN; INFO-SKIPs post-kill

- R1 (RED): gate-off daily+upkeep delegate verb-for-verb identically, no tracking state.
- R2 (REAL RED): gate-off + villager combat death → daily still ranges wild (the blank, unblocked).
- G1–G8: recovery mechanics (say once naming dead+living, wild declined, haven passes, mantle line for scholar deaths, expiry, chain-extends, starvation no-trigger, combatExit passes, walk-home bounded, upkeep guarded).
- G9 (det-gate): gate-off 3-day scripted run — identical verb sequences + ctx keys.
- G10 (people-only): **REAL-RED verified** — the v1 build WITHOUT the people-only filter failed G10 (11/12: monster combat death opened a recovery window — the r35 dead-paparazzo bug reproduced); the people-only patch turned it GREEN **12/12**. SMOKE=1 subset 3/3. Buggy v1 backup: ~/workspace/recthrottle-v1-buggy-20261015.js.
- Post-kill: layer deleted per protocol; this proof INFO-SKIPs when the layer is absent (verified); the 12/12 pre-kill result stands as documented here.

## Results

### Det-gate — PASS (pre-measurement)

- Gate-off wrapper vs raw base: **16/16 byte-identical rows** (8 seeds × lead set + 8 seeds × belong set). `evidence/2026-10-15/sim-recthrottle-detgate-L.json`, `sim-recthrottle-detgate-B.json`.
- SMOKE=1 instrument-honesty: 3/3 FIRST.
- A/A determinism spots: control seed 11 ×2 on each road — IDENTICAL rows.
- Unwrap guard (`typeof policy.daily === 'function'` on both named exports) fired on nothing.

### SET-L (lead set, leadcourt+FOURTHLINK=1) — courtship lead road

Control `evidence/2026-10-15/sim-recthrottle-control-L.json`: median **93d**, national **6/8**, w5 3/8, w4 7/8, exiled 0.
Armed `evidence/2026-10-15/sim-recthrottle-armed-L.json`: median **117d** vs 93d (**+24d**), national **5/8** vs 6/8, w5 **1/8** vs 3/8, w4 5/8 vs 7/8, exiled 0. 95 recovery windows, 172 fortify-days, 627 declined sorties, 208 combat deaths seen (armed).
Per-seed (ctrl→armed): s11 180→52 (−128), s22 131→131 (+0), s33 107→110 (+3), s44 85→157 (+72), s55 85→101 (+16), s66 79→49 (−30), s77 101→134 (+33), s88 75→124 (+49). 5/8 longer.

### SET-B (belong set, belongseek) — courtship belong road

Control `evidence/2026-10-15/sim-recthrottle-control-B.json`: median **127.5d**, national **6/8**, w5 0/8, w4 0/8, exiled 0.
Armed `evidence/2026-10-15/sim-recthrottle-armed-B.json`: median **122d** vs 127.5d (**−5.5d**), national **5/8** vs 6/8, w5 0/8 both, w4 1/8 vs 0/8, exiled 0. 55 recovery windows, 121 fortify-days, 444 declined sorties.
Per-seed (ctrl→armed): s11 109→74 (−35), s22 93→180 (+87), s33 180→116 (−64), s44 180→180 (+0), s55 107→112 (+5), s66 146→118 (−28), s77 180→180 (+0), s88 80→126 (+46). 3/8 longer.

### Stratum assignment (pre-registered rule, this run's control)

SET-L control 93d <100d → **HARD**. SET-B control 127.5d ≥100d → **FRIENDLY**. No fallback needed — the strata split cleanly, reproducing r35's hard/friendly regime finding on the same road.

### Verdict — NO-GO → KILL (§14 binds)

- **Primary (hard stratum, SET-L)**: armed 117d ≥ 93+15=108d? **HOLD (+24d).**
- **No-regression bound (friendly stratum, SET-B)**: armed 122d ≥ 127.5−3=124.5d? **MISS by 2.5d.**
- GO requires BOTH → **NO-GO → KILL.** Kill protocol ran: `scripts/policies/recoverylever.js` DELETED; proof/sweep/sense/evidence kept; proof degrades to INFO-SKIP (verified); sweep's armed/detgate modes refuse LOUD post-kill, control mode still runs (verified).
- Guardrails (pooled 16): national 10 ≥ 12−2=10 ✓ (exactly at floor); wave-5 **1 ≥ 3−1=2? MISS**; exiled 0 ≤ 0+1 ✓; no new death mode at the n≥3 family floor ✓ (armed-only keys all n=1: 'Big Big', 'Inspiration', 'The Redactor' — monster-named causes, combat family). Table/wins report-only: none reached the table, no wins, on either road.

## Why the friendly bound missed — the stranding finding (the real result)

Four independent measurements of the same mechanism now exist, ALL with the same heterogeneity signature: the throttle helps struggling villages and strands thriving ones.

- **Hard set (this run)**: +24d — the mechanism works where there is room: s44 +72, s88 +49, s77 +33, s55 +16.
- **Friendly set (this run)**: −5.5d — the stranding dominates where villages would have thrived: s33 180→116 (−64), s11 109→74 (−35), s66 146→118 (−28); the wins (s22 +87, s88 +46) don't cover it.
- The disaster case is now a three-run pattern: r36 s11 170→75, r35 s777 134→29, this run s11 180→52 (−128) — a full-horizon village killed at d52. The mechanism is legible: the hold keeps the SCHOLAR home (the engine-side villager foraging is untouched), and the scholar is the most productive early forager — s11-armed's 6 starvation deaths (control: 0) are the smoking gun. The throttle trades wild exposure for pantry pressure; on a village whose survival engine IS its ranging scholar, the trade loses.
- The r35 regime finding is now confirmed on its home road with stratified bars: +24d on hard seeds, −5.5d on friendly seeds. The effect is regime-dependent, not uniform — and on the courtship road, the friendly side is where the throttle's risk lives, not just its null.

## Village assessment (plain words)

Sixteen village-lives on the courtship road, each twice-lived. The lead-set villages are the clearest story: s44's village died at d85 in the control and lived to d157 armed (national held, wave-5 reached at d72) — the throttle's best case, a village that held Haven through its worst weeks and lived long enough to become strong. s88 (75→124) and s77 (101→134) tell the same story smaller. The belong-set villages tell the mirror: s33's control village ran the full 180 days (national) and the armed version died at d116 — a thriving village throttled at the wrong moments, dying younger than it would have ranging; s11's armed village starved (6 starvation deaths, 0 in control) after 6 recovery windows kept its best forager home. Who thrived: bearers who survived their villages' worst weeks behind the hold — s22-belong's scholar held through 8 windows and was alive at the horizon. Who died: everyone, eventually — combat is the reaper on this road (villager:combat dominates both suites). The villages that live longest meet national; none reach the table or a win. The wall stands on the arrival side (national 10–12/16) and the win side alike.

## SENSE-TESTING (scripts/sense-recthrottle-20261015.js, seed 66, armed, lead set)

The hold beats read as people deciding, not dispenser text:

- d13: "🕯️ After June's death, Theo holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer." — lands right after the Codex's own page for June Aguilar ("🕯️ June Aguilar is dead — combat. The village stops. Somebody screams. Somebody else starts digging."), the "village stops" grief beat, and the System's mantle-transfer beat. Names the dead (June) and the living (Theo).
- d21: "🕯️ After Liam's death, Theo holds Haven — … Crews stay close to home." — follows the village's FIRST GRAVE crisis beat ("everyone understands at once: this place can kill you").
- d22: "🕯️ After Grace's death, Theo holds Haven — … Crews stay close to home." — a third death in two days; the village closes ranks again.

No "Someone" lines — every window names a real dead person and the real living holder. The beats fire in the grief context the engine already built. Verdict: mourning and regrouping. The SENSE-TESTING LAW is satisfied for this layer's fiction — the same verdict as r35 and r36, on the courtship road with the people-only trigger in the spec from the start.

## Blanks filled / documented

- **Measured** (not chased): the recovery throttle on its home road with stratified bars — hard-set +24d median (117 vs 93, GO bar met), friendly-set −5.5d (122 vs 127.5, no-regression bound missed by 2.5d). National/wave-5/exile guardrails: national held at floor, wave-5 guardrail missed (1 vs ≥2), exiled 0, no new death mode.
- **Verified** (this run): the people-only trigger in the spec from the start was honestly RED-verified — the v1 build without it reproduced the r35 pre-fix bug (G10 FAILED real-red 11/12), the patch turned it GREEN 12/12. Buggy v1 backup: ~/workspace/recthrottle-v1-buggy-20261015.js.
- **Documented** (sim-findings.md): (1) the stranding mechanism — the hold keeps the scholar home and the scholar is the top early forager; s11-armed's 6 starvation deaths vs 0 control is the legible mechanism; (2) the four-measurement heterogeneity signature — helps struggling villages, strands thriving ones, on both roads; (3) friendly-side risk as the throttle's real danger, not just its null.
- **Replicated**: the r35 regime finding on the courtship road — hard +24d (r35 pilot +53d), friendly −5.5d (r35 confirm +4.5d) — with the pre-registered stratified bars the metric review called for.

## Metric review (§14 — for the NEXT run)

1. **The stratified bars worked as designed.** The hard primary held (+24d ≥ +15d) and the friendly bound caught the real harm (−5.5d vs ≥−3d). The r35 review's demand — stratified/proportional bars on same-road seeds — produced a verdict that matches the mechanism's true shape: the throttle helps hard seeds and hurts friendly ones. Keep the bars.
2. **The no-regression bound is the right lens for a safety-relevant lever.** A survival-positive-primary + friendly-harm pattern is exactly what a "recovery" fiction should be gated on: first do no harm to the villages that were going to make it.
3. **The wave-5 guardrail miss (1 vs ≥2) is worth a metric-review note, not a design change.** With w5 unlocks concentrated on the lead road and n=8, two lost unlocks (s11 died at d52 pre-unlock; s22's 131d run no w5) reads as the stranding mechanism's shadow, not a separate mechanism. If a future throttle variant re-tests, pre-register wave-5 as report-only or with the n≥3 floor — at 8 seeds the pooled guardrail is too jumpy for a rare event.
4. **The no-new-death-mode n-floor stayed quiet again** (armed-only keys all n=1). Keep the floor.
5. Honest counterpoint: the primary HELD this time (+24d on the hard set, above the +15d bar). The kill is on the friendly bound, not the primary — a cleaner, more informative kill than r35's 0.5d primary miss. The mechanism has a real, regime-dependent effect; what it does to thriving villages is the thing to fix.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed suites (`sim-recthrottle-armed-L/B.json`) vs `hidden_files/telemetry-baselines/scale-wall.json`: fired LOUD ×1 ("national disappeared: baseline 8 → current 0"). INVESTIGATED — EXPLAINED, not a bug: this sweep's JSONs nest metrics in `rows[]`/`suite` (no flat top-level `national` key), so the check counts missing paths as 0 — the same schema-mismatch invocation issue as r35 (the recconf sweep's flat-key fix was not carried into this sweep's report format). Row/suite-level truth: national 10/16, table 0/16, wins 0, exiled 0 — all inside the known wall envelope.
- **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks the wall across runs and must not absorb a killed arm's numbers (r34/r35/r36 precedent).

## Wall numbers (this arm's suites)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| SET-L control (8) | 6/8 | 0/8 | 0/8 | 7/8 | 3/8 | 93d | 0/8 |
| SET-L armed (8) | 5/8 | 0/8 | 0/8 | 5/8 | 1/8 | 117d | 0/8 |
| SET-B control (8) | 6/8 | 0/8 | 0/8 | 0/8 | 0/8 | 127.5d | 0/8 |
| SET-B armed (8) | 5/8 | 0/8 | 0/8 | 1/8 | 0/8 | 122d | 0/8 |

No run reached the table or a win on either courtship road. Two full 180d survivals (s22/s44/s77 armed-B, s33/s44/s77 control-B — the belong road's friendly regime). The wall stands on the arrival side (national 10/16 armed) and the win side.

## Files (layer deleted per kill protocol; everything else kept)

- `scripts/policies/recoverylever.js` — DELETED per kill protocol (NO-GO on the friendly bound).
- `scripts/test-recthrottle-20261015.js` — proof: 12/12 GREEN pre-kill (REAL RED verified); INFO-SKIPs post-kill (verified).
- `scripts/sweep-recthrottle-20261015.js` — pilot driver (pre-registration in header); det-gate mode; kill-protocol graceful degradation (armed/detgate refuse LOUD post-kill, control mode still runs — verified).
- `scripts/sense-recthrottle-20261015.js` — sense transcript reader.
- `evidence/2026-10-15/sim-recthrottle-control-L.json` — SET-L control (8 seeds; median 93d).
- `evidence/2026-10-15/sim-recthrottle-armed-L.json` — SET-L armed (8 seeds; median 117d, +24d).
- `evidence/2026-10-15/sim-recthrottle-control-B.json` — SET-B control (8 seeds; median 127.5d).
- `evidence/2026-10-15/sim-recthrottle-armed-B.json` — SET-B armed (8 seeds; median 122d, −5.5d).
- `evidence/2026-10-15/sim-recthrottle-detgate-L.json` + `sim-recthrottle-detgate-B.json` — det-gate: 16/16 byte-identical rows.
- `evidence/2026-10-15/sim-recthrottle.md` — this file.
- `~/workspace/recthrottle-v1-buggy-20261015.js` — the v1 pre-fix build (monster-trigger bug, G10 real-red) — kept outside the repo as the RED artifact.
