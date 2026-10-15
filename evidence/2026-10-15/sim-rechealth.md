# ARM "rechealth" — the thriving-village exemption (scale-onramp)

Worktree: `~/workspace/worktrees/sim-rechealth`. Run: oversight-flesh-out-loop, run fleshout-a-20261015T021049Z, axis scale-onramp. ARM: sim-rechealth (policy-side).

## The blank / the lineage

r37 (evidence/2026-10-15/sim-recthrottle.md) measured the 2-day Haven hold after a combat death OF A PERSON on its home courtship road with stratified bars: hard set +24d (117 vs 93, primary met), friendly set −5.5d (122 vs 127.5, no-regression bound missed by 2.5d) — NO-GO → KILL. The stranding mechanism: the hold keeps the SCHOLAR home (policies drive the player; engine-side villager foraging untouched) and the scholar is the top forager — the throttle trades wild exposure for pantry pressure, and on a village whose survival engine IS its ranging scholar, the trade loses. The heterogeneity signature now spans four measurements: helps struggling villages, strands thriving ones, on both roads. THIS run tests sim-findings #249's named next: a thriving-village exemption — the hold engages ONLY when the pantry is deep (fresh-days >= 3) AND no villager has hungryStreak > 0; otherwise the scholar keeps ranging.

## Canon read

- docs/CANON.md (manifest + standing rules) and docs/MONSTER-WAVES.md (wave law; combat deaths of people are the throttle's trigger, and wave-ledger kills are part of what the hold costs). No canon doc covers post-trauma recovery posture specifically; the layer uses only existing engine verbs (travelTo, say, displayName) and the existing policy path (fourthlink/belongseek). The guard-posture fiction is the r35 design call Steve can overrule.
- Engine facts used (read, not invented): `Game.pantryFreshDays()` (game.js: fresh non-preserved non-spoiled kcal / measured burn rate, 12×2000 fallback pre-endDay); `hungryStreak` lives on the SHARED `progState()` (game.js villageEats: increments when ANY villager is starving) — so "no villager has hungryStreak > 0" is literally `=== 0`. Death tele shape (corpses.js): `{type:'death', day, kind, who, cause, wave, player}` with kind covering person/monster/animal; player:true rides ONLY on scholar deaths (ledger.js playerDeath, r17). People-only trigger (the r35 sense-fix): scholar (player:true) OR kind person/villager — NEVER monster. Non-combat deny-list carried from r37 (starvation, dehydration, thirst, hunger, sickness, disease, plague, pestilence, old age, grief, exile, banishment, accident, fall, drowned, drowning, frostbite, frozen, exposure, childbirth, scurvy, heatstroke); monster-named causes, expedition, "a wound that wouldn't close" count as combat for person deaths.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any measurement

- **Question**: does the #249 thriving-village exemption fix the friendly-side harm of the recovery throttle while keeping the hard-set gain — hold engages only on pantry fresh-days >= 3 AND hungryStreak == 0?
- **Seed sets (fixed, same-road as r37)**:
  - SET-L (lead set): leadcourt+FOURTHLINK=1, seeds 11/22/33/44/55/66/77/88.
  - SET-B (belong set): belongseek, seeds 11/22/33/44/55/66/77/88.
  - 16 runs per side (control + armed), identical seeds, deterministic. Own control in the same sweep — CONTROL BASELINE DRIFT #247: never inherit a baseline from prior evidence, even on identical seeds.
- **Stratum rule (fixed, control-side, r37 precedent)**: per-set control median survival <100d = HARD, >=100d = FRIENDLY; same-side fallback: lower-median set = HARD. Strata assigned from this run's control numbers — no re-drawing.
- **Primary (hard stratum)**: armed median >= control median + 15d.
- **No-regression bound (friendly stratum)**: armed median >= control median − 3d.
- GO iff BOTH hold. A miss on either is NO-GO → KILL. Metric binding (§14): these bars bind this run — a miss is NO-GO, never re-scored mid-run; metric doubts under "metric review".
- **Guardrails (pooled 16)**: national >= pooled-control − 2; no new death mode (cause-family level, n>=3 floor across armed runs — the r29 floor); exiled <= pooled-control + 1. Table/wins/wave-5 report-only (r37 metric review: at n=8 the pooled wave-5 guardrail is too jumpy for a rare event).
- **Horizon**: 180d death-aware (harness stop tail). **Policies**: control = base road through the same instrument, gate OFF; armed = base + rechealth layer (RECHEALTH=1). Identical seeds.
- **Det-gate**: gate-off wrapper vs raw base — 16/16 byte-identical rows (8 seeds × 2 roads); SMOKE=1 instrument-honesty FIRST; one A/A spot check per road (control seed 11 ×2, identical rows).
- **Unwrap**: named exports (`require('./policies/rechealth').rechealth`, `.rechealthBelong`); `typeof policy.daily === 'function'` asserted before any run (the 2026-10-14 unwrap bug).
- **Confirm**: ONLY if GO — 12–16 fresh seeds per set (added to the pilot set, not replacing, per the r35 metric review).

## The layer (scripts/policies/rechealth.js, RECHEALTH=1, default OFF) — DELETED per kill protocol

Rebuilt from the preserved recthrottle proof spec (v1 buggy backup at ~/workspace/recthrottle-v1-buggy-20261015.js + the r37 evidence spec), plus the #249 exemption:

- Gate off → the wrapper delegates verb-for-verb to the base (proof R1/G9; sim det-gate 16/16 byte-identical).
- Gate on → wraps the base (`withRechealth(base, layerId)`):
  (a) each daily/upkeep scans telemetry for new death events (count-cursor, deterministic); a combat-category PERSON death (scholar player:true OR kind person/villager; NEVER monster — the r35 dead-paparazzo sense-fix, REAL-RED verified) is evaluated against the exemption gate ONCE at trigger time;
  (b) the hold ENGAGES only if `Game.pantryFreshDays() >= 3` AND `progState().hungryStreak === 0`: opens/extends the recovery window (deathDay + RECHEALTH_DAYS=2, chained deaths extend), and the guard-posture line fires once per window-opening naming the dead and the living (mantle line for scholar deaths, "Crews stay close to home." for villager deaths);
  (c) if the exemption BLOCKS: the death is recorded as exempted (`_recExempted++`, `entry.exempted=true`) — no hold, no announcement, the scholar keeps ranging;
  (d) inside an engaged window: walk home if away (bounded ≤12 haven-ward hops, real travelTo, before the guard installs), then run base daily+upkeep under the travel guard — travelTo AWAY from the haven tile declined (`{moved:false}`), haven-ward/lateral passes, combatExit (flee-by-barrier) always passes; `_recFortifyDays` increments in daily only.
- No new verbs; every call is an existing engine path. Design calls (Steve can overrule): N=2 (inherited from r34); the strict `=== 0` hunger bound (one hungry day blocks the hold — narrower than the production throttle's >= 3 hunger-winter crisis threshold); per-trigger (snapshot) exemption evaluation rather than a daily re-check; monster-named causes count as combat for person deaths; silence on exemption (the engine's own grief beats carry the mourning).

## Proof: scripts/test-rechealth-20261015.js — REAL RED, then 16/16 GREEN; INFO-SKIPs post-kill

Phase-A naive build (no exemption, no people-only filter) ran first: **11/16, REAL-RED confirmed** — R3 (shallow-pantry combat death held = the r37 stranding reproduced), R4 (hungry-village combat death held), G10 (monster combat death opened a window = the r35 dead-paparazzo bug reproduced), G11/G12 (exemption boundaries) all FAILED against it. Backup: ~/workspace/rechealth-v1-naive-20261015.js. The phase-B patch (people-only + exemption) turned them GREEN.

- R1 (RED): gate-off daily+upkeep delegate verb-for-verb identically, no tracking state.
- R2 (REAL RED): gate-off + villager combat death → daily still ranges wild (the blank, unblocked).
- R3/R4 (REAL RED): shallow-pantry and hungry-village combat deaths do NOT hold; the exempted death is recorded (`_recExempted`, `entry.exempted=true`, still `person:true`).
- G1–G8: recovery mechanics with a deep pantry (say once naming dead+living, wild declined, haven passes, mantle line for scholar deaths, expiry, chain-extends, starvation no-trigger, combatExit passes, walk-home bounded, upkeep guarded).
- G10 (people-only): monster combat death does NOT trigger — REAL-RED verified against the phase-A build.
- G11/G12 (exemption boundaries): fresh-days 3.0 engages / 2.99 exempts; hungryStreak 1 exempts (deep pantry) / 0 engages — REAL-RED verified against the phase-A build.
- G9 (det-gate): gate-off 3-day scripted run — identical verb sequences + ctx keys. SMOKE=1 subset 5/5.
- Post-kill: layer deleted per protocol; this proof INFO-SKIPs when the layer is absent (verified); the 16/16 pre-kill result stands as documented here.

## Results

### Det-gate — PASS (pre-measurement)

- Gate-off wrapper vs raw base: **16/16 byte-identical rows** (8 seeds × lead set + 8 seeds × belong set). `evidence/2026-10-15/sim-rechealth-detgate-L.json`, `sim-rechealth-detgate-B.json`.
- SMOKE=1 instrument-honesty: 5/5 FIRST.
- A/A determinism spots: control seed 11 ×2 — IDENTICAL rows.
- Unwrap guard (`typeof policy.daily === 'function'` on both named exports) fired on nothing.

### Own control — CONTROL BASELINE DRIFT #247 vindicated

The r37 control numbers (SET-L 93d, SET-B 127.5d) did NOT reproduce on current tip: SET-L 108.5d, SET-B 104.5d. The strata FLIPPED vs r37 (SET-L was hard, SET-B friendly). Same-ROAD, same-seed, sibling landings between runs. Only the within-sweep identical-seed before/after binds.

`evidence/2026-10-15/sim-rechealth-control-L.json`: SET-L median **108.5d**, national **5/8**, w5 0/8, w4 5/8, exiled 0.
`evidence/2026-10-15/sim-rechealth-control-B.json`: SET-B median **104.5d**, national **4/8**, w5 0/8, w4 3/8, exiled 0.

### SET-B (belong set) — HARD stratum this run (control 104.5d < 108.5d, fallback rule)

Control `sim-rechealth-control-B.json`: median **104.5d**, national **4/8**, w5 0/8, w4 3/8, exiled 0.
Armed `sim-rechealth-armed-B.json`: median **128.5d** vs 104.5d (**+24d**), national **3/8** vs 4/8, w5 0/8 both, w4 0/8 vs 3/8, exiled 0. 44 recovery windows, 18 exempted, 82 fortify-days, 267 declined sorties.
Per-seed (ctrl→armed): s11 34→37 (+3), s22 180→180 (+0), s33 42→180 (+138), s44 156→180 (+24), s55 106→173 (+67), s66 103→71 (−32), s77 180→84 (−96), s88 78→65 (−13). 4/8 longer.

### SET-L (lead set) — FRIENDLY stratum this run (control 108.5d)

Control `sim-rechealth-control-L.json`: median **108.5d**, national **5/8**, w5 0/8, w4 5/8, exiled 0.
Armed `sim-rechealth-armed-L.json`: median **88.5d** vs 108.5d (**−20d**), national **5/8** vs 5/8, w5 **1/8** (d67) vs 0/8, w4 5/8 both, exiled 0. 66 recovery windows, 19 exempted, 111 fortify-days, 363 declined sorties.
Per-seed (ctrl→armed): s11 33→30 (−3), s22 159→82 (−77), s33 53→159 (+106), s44 123→107 (−16), s55 115→75 (−40), s66 93→45 (−48), s77 103→107 (+4), s88 114→95 (−19). 2/8 longer.

### Verdict — NO-GO → KILL (§14 binds)

- **Primary (hard stratum, SET-B)**: armed 128.5d ≥ 104.5+15=119.5d? **HOLD (+24d — exactly r37's hard-set gain, to the day).**
- **No-regression bound (friendly stratum, SET-L)**: armed 88.5d ≥ 108.5−3=105.5d? **MISS by 17d.**
- GO requires BOTH → **NO-GO → KILL.** Kill protocol ran: `scripts/policies/rechealth.js` DELETED; proof/sweep/sense/evidence kept; proof and sense INFO-SKIP post-kill (verified, exit 0); sweep's armed/detgate modes refuse LOUD post-kill (exit 2, verified).
- Guardrails (pooled 16): national 8 ≥ 9−2=7 ✓; exiled 0 ≤ 0+1 ✓; no new death mode at the n≥3 family floor ✓ (armed-only keys all n=1: 'Big Big', 'Highbeam Deer', 'Choir Toad', 'wound_fever' — monster-named causes, combat family). Wave-5/table/wins report-only: wave-5 1/16 armed (s33-L, d67) vs 0/16 control; table 0/16 recorded — caveat: this sweep's per-day tracker did not instrument `pg.tableWaiting` (sweep-compare convention), so table reach is 0-by-construction, not a measured 0; no run reached the table on the courtship road in r37 either. Wins 0/16.

## Why the exemption failed — the mechanism refinement (the real result)

The #249 exemption fired honestly (19/85 L triggers, 18/62 B triggers exempted — the proof's boundary tests prove the gate works), and the hard-set gain repeated exactly (+24d, r37's number to the day). But the friendly-side harm did NOT shrink — it grew (−5.5d → −20d). The per-trigger exemption cannot fix the stranding, because **the stranding is a flow problem, not a stock problem**:

- The exemption decides with a snapshot taken at trigger time: pantry ≥3 fresh-days, nobody hungry. That snapshot goes stale the moment the hold starts — the hold itself removes the scholar's intake for 2 days (chained: 4+). A village with 3.1 fresh-days and hungryStreak 0 at trigger time can be pushed into hunger by the hold: s66-L armed saw 2 windows + 1 exemption and still died at 45d with 3 thirst/hunger deaths; s55-L armed (9 windows, 1 exempted) carries 2 player thirst/hunger deaths.
- s77-B is the sharpest case: 6 exempted vs 4 engaged holds — the exemption blocked MOST holds on a struggling village, yet it died 96d younger than control (of disease/wounds, non-combat causes the hold can't touch). Blocking the hold is not the same as fixing the village.
- The r37 smoking gun (s11-armed's 6 starvation deaths) was "hold on an already-starving village." This run's losses are "hold on a fed village that the hold then un-feds." The #249 gate checks the village's state BEFORE the hold; the harm is the hold's effect ON the state. A gate with a margin (fresh-days ≥ 3 + window-days) or a daily re-check that releases the hold as the pantry thins mid-window is the honest next variant — the snapshot gate, as specified, is structurally unable to see the harm it permits.

The heterogeneity signature now spans FIVE measurements (r35, r36, r37, r38, plus the r35 pilot): the throttle helps struggling villages (+24d twice on the hard stratum) and strands thriving ones (−20d here, −5.5d r37) with the exemption engaged. The friendly-side harm is not the null — it is the risk.

## Village assessment (plain words)

Sixteen village-lives on the courtship road, each twice-lived, on a tip where the baseline itself drifted friendlier. The belong-set villages are the clearest story: s33's control village died at d42 and the armed version ran the full 180 (national, 6 windows) — the throttle's best case again, a village that held Haven through its worst weeks and lived. s55 (106→173) and s44 (156→180) tell the same story smaller. The mirror: s77's control village ran the full 180 and the armed version died at d84 — 6 of its 10 combat-death triggers were EXEMPTED (the village kept ranging through a shallow pantry) and it died of disease and wounds anyway; the exemption's silence there reads as grim necessity, not neglect. The lead-set villages tell the harder story: s22 (159→82, −77) and s66 (93→45, −48) — villages that were going to make it, throttled at the wrong moments, dying younger than they would have ranging; s33's armed village (53→159, +106, wave-5 at d67) is the same set's counter-story. Who thrived: bearers who survived their villages' worst weeks behind engaged holds — s22/s33/s44-B's scholars all reached the horizon. Who died: everyone, eventually — combat is the reaper on this road (villager:combat dominates both suites; armed-L actually has FEWER combat deaths, 135 vs 158, yet dies younger — the hold trades combat exposure for intake loss and the trade loses on friendly seeds). The villages that live longest meet national; none reach the table or a win. The wall stands on the arrival side (national 8/16 armed) and the win side alike.

## SENSE-TESTING (scripts/sense-rechealth-20261015.js, seed 66, armed, lead set)

The hold beats read as people deciding, not dispenser text — the r35/r37 verdict carries:

- d13: "🕯️ After June's death, Theo holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer." — lands right after the Codex's own page for June Aguilar ("📖 The Codex turns a page on its own. June Aguilar is dead. You didn't ask. It knew."), the "village stops" grief beat ("🕯️ June Aguilar is dead — combat. The village stops. Somebody screams. Somebody else starts digging."), and the System's mantle-transfer beat. Names the dead (June) and the living (Theo).
- d24: "🕯️ After Grace's death, Theo holds Haven — … Crews stay close to home." — follows the village's FIRST GRAVE crisis beat ("everyone understands at once: this place can kill you").

The EXEMPTED deaths read as grim necessity: d37-38 Liam Davis dies of "a wound that wouldn't close" → `[EXEMPTED, no hold] … The scholar keeps ranging.` No posture line — the Codex page ("Liam Davis is dead. You didn't ask. It knew.") carries the mourning; the village can't afford to stop and doesn't pretend otherwise. No "Someone" lines anywhere — every window names a real dead person and the real living holder. The SENSE-TESTING LAW is satisfied for this layer's fiction, including the exemption's silence.

## Blanks filled / documented

- **Measured** (not chased): the #249 thriving-village exemption on the courtship road with stratified bars — hard-set +24d median (128.5 vs 104.5, GO bar met, r37's gain to the day), friendly-set −20d (88.5 vs 108.5, no-regression bound missed by 17d). Guardrails all pass (national 8 ≥ 7, exiled 0, no new death mode); wave-5 1/16 armed vs 0/16 control (report-only).
- **Verified** (this run): the exemption gate is real and biting — 37/147 triggers exempted across the armed suites, boundary-tested at 3.0/2.99 fresh-days and hungryStreak 0/1 (G11/G12 REAL-RED→GREEN). The people-only trigger carried from the spec, REAL-RED verified against the phase-A build (G10 failed on the naive trigger, 11/16).
- **Documented** (sim-findings.md): (1) the snapshot-vs-flow refinement — a per-trigger exemption cannot fix the stranding because the harm is the hold's effect on the state, not the state before the hold; (2) the five-measurement heterogeneity signature — the throttle helps hard seeds and harms friendly seeds with the exemption engaged; (3) CONTROL BASELINE DRIFT #247 re-vindicated — r37's control medians (93/127.5d) did not reproduce (108.5/104.5d), strata flipped.
- **Instrument caveat**: table reach not per-day instrumented in this sweep (`pg.tableWaiting` from the sweep-compare convention not tracked) — reported 0/16 by construction; future sweeps should track it per the sweep-compare convention.

## Metric review (§14 — for the NEXT run)

1. **The stratified bars worked as designed, again.** The hard primary held (+24d, exactly r37's number) and the friendly bound caught the real harm (−20d vs ≥−3d). The r35 review's demand — stratified/proportional bars on same-road seeds — keeps producing verdicts that match the mechanism's true shape. Keep the bars.
2. **The no-regression bound is doing the heavy lifting on this lineage.** Five measurements in, the friendly-side harm is the stable signal and the hard-side gain is the stable signal; the bars separate them cleanly. A future throttle variant must pre-register against BOTH — the primary alone would have shipped a village-killer twice.
3. **The wave-5 report-only call (r37 review) stands.** Armed 1/16 vs control 0/16 (s33-L d67) — a rare-event read, not a guardrail miss. Keep it report-only at n=8.
4. **The no-new-death-mode n-floor stayed quiet again** (armed-only keys all n=1). Keep the floor.
5. **The stratum fallback fired and matters.** Both sets landed ≥100d; the lower-median rule assigned SET-B hard / SET-L friendly — the reverse of r37's labels. The fallback is load-bearing on a drifting tree; without it this run would have tested the wrong bars on the wrong sets. Document the fallback assignment in every evidence file (done here).
6. Honest counterpoint: the primary held at exactly +24d twice — the mechanism has a real, regime-dependent effect, and the exemption does not destroy it. What the exemption was supposed to fix (friendly harm) it did not fix; the next variant needs a margin or a daily re-check, not a snapshot gate.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed suites (`sim-rechealth-armed-L/B.json`) vs `hidden_files/telemetry-baselines/scale-wall.json`, metrics `national,table,wins,exiled`: **quiet** (2 files, 4 metrics, no large deviations). The flat-key report format (r36 recconf fix) eliminated the r37 schema-mismatch LOUD line.
- **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks the wall across runs and must not absorb a killed arm's numbers (r34/r35/r36/r37 precedent).

## Wall numbers (this arm's suites)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| SET-L control (8) | 5/8 | 0/8* | 0/8 | 5/8 | 0/8 | 108.5d | 0/8 |
| SET-L armed (8) | 5/8 | 0/8* | 0/8 | 5/8 | 1/8 | 88.5d | 0/8 |
| SET-B control (8) | 4/8 | 0/8* | 0/8 | 3/8 | 0/8 | 104.5d | 0/8 |
| SET-B armed (8) | 3/8 | 0/8* | 0/8 | 0/8 | 0/8 | 128.5d | 0/8 |

\* table reach not per-day instrumented in this sweep (see instrument caveat); 0 by construction, consistent with r37's measured 0 on the same road. No run reached a win on either courtship road. The wall stands on the arrival side (national 8/16 armed) and the win side.

## Files (layer deleted per kill protocol; everything else kept)

- `scripts/policies/rechealth.js` — DELETED per kill protocol (NO-GO on the friendly bound).
- `scripts/test-rechealth-20261015.js` — proof: phase-A 11/16 REAL-RED → phase-B 16/16 GREEN; SMOKE=1 5/5; INFO-SKIPs post-kill (verified, exit 0).
- `scripts/sweep-rechealth-20261015.js` — pilot driver (pre-registration in header); det-gate mode; flat top-level aggregates for telemetry-check (r36 fix); kill-protocol graceful degradation (armed/detgate refuse LOUD with exit 2 post-kill — verified; control mode unaffected).
- `scripts/sense-rechealth-20261015.js` — sense transcript reader (engaged holds + EXEMPTED markers); INFO-SKIPs post-kill (verified, exit 0).
- `evidence/2026-10-15/sim-rechealth-control-L.json` — SET-L control (8 seeds; median 108.5d).
- `evidence/2026-10-15/sim-rechealth-armed-L.json` — SET-L armed (8 seeds; median 88.5d, −20d).
- `evidence/2026-10-15/sim-rechealth-control-B.json` — SET-B control (8 seeds; median 104.5d).
- `evidence/2026-10-15/sim-rechealth-armed-B.json` — SET-B armed (8 seeds; median 128.5d, +24d).
- `evidence/2026-10-15/sim-rechealth-detgate-L.json` + `sim-rechealth-detgate-B.json` — det-gate: 16/16 byte-identical rows.
- `evidence/2026-10-15/sim-rechealth.md` — this file.
- `~/workspace/rechealth-v1-naive-20261015.js` — the phase-A naive build (no exemption, no people-only filter; R3/R4/G10/G11/G12 real-red) — kept outside the repo as the RED artifact.
