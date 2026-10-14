# ARM "recconf" — the recovery throttle, stratified re-confirm (scale-onramp) — KILLED AT PILOT GATE

Worktree: `~/workspace/worktrees/sim-recconfirm`. Run: oversight-flesh-out-loop, scale-onramp axis.

## The blank

The r35 "recoverylever" arm (evidence/2026-10-14/sim-recoverylever.md) was KILLED at confirm per §14 by 0.5d (130d vs 125.5d, needed ≥+5d) — but its metric review documented the honest next step: the effect is regime-dependent (+53d pilot on hard seeds, +27.5d r34, +4.5d confirm on friendly seeds), and the NEXT run should use stratified/proportional bars with same-regime confirm seeds. S14 revisions apply to the NEXT run — this is that run.

The mechanism: a 2-day Haven hold after any combat death OF A PERSON (the scholar, player:true, or a villager — kind villager/person; NEVER a monster — the sense-fix r35 applied mid-pilot when the first build fired on a dead paparazzo and narrated "After Someone's death…" for it). Rebuilt here as `scripts/policies/recconf.js` (gate RECCONF=1, default OFF) on the **leadfeast** road (+FEASTSCALE_R13=1) — the current standard policy; r35 measured on the courtship road.

## Canon read

- docs/CANON.md (manifest + standing rules) and docs/MONSTER-WAVES.md (wave law, escalation, wave-4/5 Standing gates, the wave-2 ledger note). No canon doc covers post-trauma recovery posture specifically; the design below uses only existing engine verbs (travelTo, say, displayName) and the existing policy path (leadfeast). The guard-posture fiction ("nobody ranges till the watch stands down") is the r35 design call Steve can overrule, explicitly preferred over the succbrake pilot's policy-speak by the succbrake sense-test.
- Engine facts used (read, not invented): policies only drive the PLAYER (sim-harness: policy.daily/upkeep are the scholar's verbs); villager foraging runs engine-side with no policy hook — the "villager expeditions curtailed" prong stays narrated, not mechanized (documented blank from r35). Death tele shape (corpses.js): `{type:'death', day, kind, who, cause, wave, player}` — kind covers person/villager/monster/animal; player:true rides ONLY on scholar deaths (ledger.js playerDeath, r17). Combat-category design call (Steve can overrule): exact combat causes always count; for PERSON deaths a cause not on the non-combat deny-list counts as combat — engine combat deaths of people carry monster-named causes (game.js registers kind 'person', cause 'combat'; villager field-fight deaths carry the killer's name), so an allow-list would miss real kills. The proof pins the edges ('The Reunion' → combat, 'starvation' → not).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE the first measurement run

- **Question**: does the trauma-triggered recovery throttle hold when measured with stratified bars — hard-seed primary + friendly-seed no-regression bound — on the leadfeast road, identical seeds?
- **Seed sets (fixed, same-regime per the r35 metric review)**:
  - SET-A (pilot regime): 11, 22, 33, 44, 55, 66, 77, 88 — r35 courtship-road control median 94d.
  - SET-B (confirm regime): 111, 222, 333, 444, 555, 666, 777, 888, 999, 1010, 1111, 1212 — r35 courtship-road control median 125.5d.
- **Stratum rule (fixed, control-side)**: compute the CONTROL median survival per set on current tip. The set with control median <100d is the HARD stratum; the set with control median ≥100d is the FRIENDLY stratum. Expected (r35 regime finding): SET-A hard, SET-B friendly. If both sets land on the same side of 100d, the lower-median set is treated as HARD and the higher as FRIENDLY (documented fallback; labels still reported against this run's control medians).
- **Primary (hard stratum)**: armed median ≥ control median + 15d.
- **No-regression bound (friendly stratum)**: armed median ≥ control median − 3d.
- GO iff BOTH hold. A miss on either is NO-GO → KILL. Metric binding (§14): the stratified bars bind this run — a miss is NO-GO, never re-scored mid-run; metric doubts under "metric review".
- **Guardrails** (pooled 20 seeds): national ≥ pooled-control − 2; wave-5 unlocks ≥ pooled-control − 1; no new death mode (cause-family level, n≥3 floor across armed runs — the r29/r34 metric-review floor); exiled reported; table/wins and other waves report-only.
- **Horizon**: 180d death-aware. **Policies**: control = leadfeast; armed = leadfeast+RECCONF=1. Identical seeds, deterministic. The instrument wraps both sides identically (r35 pattern).
- **Det-gate**: 16/16 byte-identical rows (SET-A + first 8 of SET-B), gate-off wrapper vs raw leadfeast; SMOKE=1 instrument-honesty FIRST; one A/A spot check (control seed 11 ×2, identical rows).
- **Unwrap**: POLICY_REGISTRY-style named exports (`require('./policies/recconf').recconf`); `typeof policy.daily === 'function'` asserted before any run (the 2026-10-14 unwrap bug ran a whole suite policy-less).

## The layer (scripts/policies/recconf.js, RECCONF=1, default OFF) — DELETED per kill protocol

Rebuilt from the r35 spec, people-only trigger included from the start. Differences from r35: base = leadfeast (was fourthlink); travel guard uses the strict reading ("decline travel AWAY from the haven tile"; haven-ward/lateral passes, combatExit always passes); fortify-day counter increments in daily only (r35's measured 196 fortify-days / 104 windows ≈ 1.9 implies per-day counting).

- Gate off → the wrapper delegates verb-for-verb to leadfeast (proof R1/G9; sim det-gate 16/16 byte-identical rows + A/A spot IDENTICAL).
- Gate on → wraps leadfeast:
  (a) each daily/upkeep scans telemetry for new death events (count-cursor, deterministic); a combat-category PERSON death (scholar, player:true, OR villager — kind villager/person; NEVER monster) opens/extends the recovery window (deathDay + RECOVERY_DAYS=2, chained deaths extend);
  (b) inside the window: walk home if away (bounded honest hops ≤12, haven-ward, real travelTo — runs before the guard installs), say the guard-posture line once per window-opening (scholar death → "…The mantle needs a living bearer."; villager death → "…Crews stay close to home."), then run the base daily+upkeep under a travel guard — travelTo away from the haven tile declined (`{moved:false}`), haven-ward/lateral passes, combatExit (flee-by-barrier) always passes; haven chores run normally.
- No new verbs; every call is an existing engine path.

## Proof: scripts/test-recconf-20261014.js — 12/12 GREEN pre-kill (REAL RED verified); INFO-SKIPs post-kill

- R1/R2: gate-off delegation verb-identical + the blank (post-death daily ranges wild). No tracking state gate-off.
- G1: villager combat death → recovery (say once, names Cy Dune + Aldo Bren, crews line, wild declined, haven passes, base daily ran, 1 fortify-day).
- G2: scholar combat death → mantle line (names Aldo Bren + Bea Ciel).
- G3: expiry after RECOVERY_DAYS=2. G4: chained death extends (2 windows). G5: starvation doesn't trigger (still recorded). G6: combatExit passes. G7: walk-home bounded haven-ward. G8: upkeep guarded.
- G9 (det-gate): gate-off 3-day scripted run — identical verb sequences + ctx keys.
- G10 (REAL RED): the v1 build WITHOUT the people-only filter reproduced the r35 pre-fix bug (monster combat death opened a window — wild sortie declined) and G10 FAILED genuinely; the people-only patch turned it GREEN 12/12. SMOKE=1 subset 3/3.
- Post-kill: layer deleted per protocol; this proof INFO-SKIPs when the layer is absent (verified); the 12/12 pre-kill result stands as documented here.

## Results

### Det-gate — PASS (pre-measurement)

`evidence/2026-10-14/sim-recconf-detgate.json`: gate-off wrapper vs raw leadfeast, 16/16 byte-identical rows (SET-A + first 8 of SET-B, 180d each); A/A spot check (control seed 11 ×2): IDENTICAL. SMOKE=1 instrument-honesty 3/3 FIRST. The named-export unwrap guard (`typeof policy.daily === 'function'`) fired on nothing — both policies unwrap cleanly.

### SET-A (pilot regime, 8 seeds, 180d death-aware) — leadfeast road

Control `evidence/2026-10-14/sim-recconf-control-A.json`: median **94.5d**, national **2/8**, w5 4/8, w4 6/8, table **1/8** (s44), wins 0, exiled 0. (Reproduces r35's courtship-road 94d almost exactly on a different road — the seed regime is real.)

Armed `evidence/2026-10-14/sim-recconf-armed-A.json`: median **97d** vs 94.5d (**+2.5d**), national **4/8** vs 2/8, w5 **4/8** vs 4/8, table **1/8** (s77, 180d survival) vs 1/8, wins 0, exiled 0. 90 recovery windows, 183 fortify-days, 650 declined sorties, 208 combat deaths seen. Per-seed (ctrl→armed): s11 170→75 (−95), s22 86→89 (+3), s33 128→161 (+33), s44 103→119 (+16), s55 168→99 (−69), s66 54→95 (+41), s77 75→180✚ (+105, table), s88 58→94 (+36). 6/8 seeds longer or much longer — but the two disasters (s11, s55) erase the median gain.

### SET-B control (12 seeds, 180d) — stratum-label measurement only

`evidence/2026-10-14/sim-recconf-control-B.json`: median **96d**, national **6/12**, w5 7/12, w4 8/12, table **3/12** (s111, s222 ✚180d, s444 ✚180d), wins 0, exiled 0. The r35 "friendly" regime (125.5d) does NOT exist on the leadfeast road — both sets measure ~95d. Armed SET-B not run: the primary missed on SET-A and the pilot gate (§9) forbids confirm spend on a missed primary.

### Stratum assignment (pre-registered rule, this run's control)

SET-A control 94.5d <100d, SET-B control 96d <100d → both on the same side → documented fallback: lower-median set (SET-A, 94.5) = HARD, higher (SET-B, 96) = FRIENDLY. Labels assigned without re-drawing.

### Verdict — NO-GO → KILL (§14 binds)

- **Primary (hard stratum, SET-A)**: armed 97d ≥ 94.5+15=109.5d? **NO — miss by 12.5d.**
- **No-regression bound (friendly stratum, SET-B)**: armed not measured (killed at pilot gate) — unevaluated.
- GO requires BOTH → **NO-GO → KILL.** The kill protocol ran: `scripts/policies/recconf.js` DELETED; proof/sweep/sense/evidence kept; proof degrades to INFO-SKIP; sweep's armed/detgate modes refuse LOUD post-kill, control mode still runs (verified).
- Guardrails on the measured arm (SET-A): national 4/8 ≥ 2−2=0 ✓; wave-5 4/8 ≥ 4−1=3 ✓; exiled 0 ✓; no new death mode at the n≥3 family floor ✓ (armed-only keys all n≤2: player:other:lockjaw×2, three singletons). Table/waves report-only.

## Why the primary missed — the road-dependence finding (the real result)

The throttle's effect is road-dependent, not just regime-dependent:

- Same seeds (11–88), same mechanism, same 2-day hold: courtship road (r35 pilot) +53d median; leadfeast road (this run) +2.5d median. The bar (+15d) was calibrated on the courtship number — the road changed the effect size.
- The leadfeast road is uniformly ~95d across BOTH seed regimes (94.5d SET-A, 96d SET-B) vs the courtship road's 94d/125.5d split. The "friendly" regime — villages living to 125d+ where the throttle had nothing to buy — doesn't exist on leadfeast. Hypothesis (unmeasured): the r13 feast layer's real pantry costs compress survival and crowd out the throttle's room — feasts spend the commons, the commons is what keeps villages alive. Documented in sim-findings, not chased.
- Within SET-A the heterogeneity signature persists: s77 +105d (180d survival, table), s66 +41, s88 +36, s33 +33, s44 +16 — but s11 −95 and s55 −69 erase the median. The throttle helps struggling villages and can strand thriving ones (the hold keeps a strong village home while its window of opportunity passes — the mirror of r35's regime finding).
- Honest counterpoint recorded: national 2→4 (not binding, but real), two 180d-ish survivals armed, guardrails all green, sense-clean beats — and the miss is 12.5d, not 0.5d. §14 doesn't do "basically GO," and this time there's no close-call agony: the bar was missed by a margin, on a road where the effect is small.

## Village assessment (plain words)

Twenty-eight village-lives on the leadfeast road (8 twice-lived). The road itself is the story this run: villages live ~95d whether their seeds were "hard" or "friendly" on the courtship road — the feast road's pantry costs are the great leveler. s44's control village reached the TABLE at d103 (a table reach on the measured road); s77's armed village ran the full 180 days and reached the table too — the throttle's best case, a village that held Haven through its worst weeks and lived. s11 is the cautionary tale: 170d control → 75d armed — a strong village throttled at the wrong moments, dying younger than it would have ranging. Who thrived: bearers who survived their villages' worst weeks behind the hold. Who died: everyone, eventually — combat is the reaper here (villager:combat 152–168 deaths per 8 seeds; player:combat 45–55). The villages that live longest meet the table; none win. The wall stands on the win side; the arrival side (national/table) moves on this road.

## SENSE-TESTING (scripts/sense-recconf-20261014.js, seed 66, armed)

The hold beats read as people deciding, not dispenser text:

- d13: "🕯️ After June's death, Theo holds Haven — nobody ranges till the watch stands down. The mantle needs a living bearer." — lands right after the Codex's own page for June Aguilar, the "Somebody screams. Somebody else starts digging." grief beat, and the mantle-transfer System beat. Names the dead (June) and the living (Theo).
- d21: "🕯️ After Liam's death, Theo holds Haven — … Crews stay close to home." — follows the village's FIRST GRAVE crisis beat ("everyone understands at once: this place can kill you").
- d30: "🕯️ After Christopher's death, Theo holds Haven — … Crews stay close to home." — follows "Word comes back with a torn pack and no Christopher. Big Loud, out past the ridge. The fire is quieter tonight." — genuinely mournful context; the hold reads as the village closing ranks.

No "Someone" lines — every window names a real dead person and the real living holder. The beats fire in the grief context the engine already built (Codex pages, crisis beats, link-shake diplomacy beats on d30). Verdict: mourning and regrouping. The SENSE-TESTING LAW is satisfied for this layer's fiction.

## Blanks filled / documented

- **Measured** (not chased): the recovery throttle on the leadfeast road — hard-seed median +2.5d (97 vs 94.5), national 2→4, wave-5 flat, guardrails clean, no new death mode. The r35 regime finding extended: the effect is road-dependent (+53d courtship vs +2.5d leadfeast on identical seeds).
- **Verified** (this run): the people-only trigger carried in the spec from the start was honestly RED-verified — the v1 build without it reproduced the r35 pre-fix bug (G10 FAILED real-red), the patch turned it GREEN 12/12. Backup of the buggy build kept at ~/workspace/recconf-v1-buggy-20261014.js.
- **Documented** (sim-findings.md): (1) throttle road-dependence — same seeds, +53d courtship vs +2.5d leadfeast; the r13 feast layer's pantry costs as survival compressor is an unmeasured hypothesis; (2) leadfeast regime uniformity — both r35 regimes measure ~95d here, the "friendly" regime doesn't exist on this road; (3) table reachable on the leadfeast road — 4 reaches measured (s44 ctrl-A, s77 armed-A ✚180d, s111/s222 ✚180d/s444 ✚180d ctrl-B), wins 0/20 — arrival-side movement for the scale wall.
- **Replicated**: the stratified design itself — the fallback rule assigned strata without re-drawing when both sets landed <100d; the n≥3 death-mode floor stayed quiet; the det-gate + SMOKE-first + unwrap-guard pattern held on the new road.

## Metric review (§14 — for the NEXT run)

1. **The +15d bar was calibrated on the wrong road.** It assumed r35's +53d courtship-road pilot would transfer to leadfeast. It didn't (+2.5d). Next stratified re-confirm must EITHER hold the road fixed across the original and the re-confirm, OR calibrate the bar on a same-road pilot. A bar is a claim about an effect on a road, not about a mechanism in the abstract.
2. **The stratum fallback worked.** Both sets <100d; the lower-median set took the hard bar without any mid-run re-drawing. Keep the fallback.
3. **The no-new-death-mode n-floor worked again.** Armed-only keys all n≤2; the raw key-presence form would have flagged four singletons. Keep the floor.
4. **Confirm-seed calibration (r35's point) stands, sharpened**: same-regime seeds aren't enough — same-ROAD is the binding constraint. The r35 review said "same difficulty regime"; this run shows the road can erase the regime entirely.
5. Honest counterpoint: the primary missed by 12.5d, not 0.5d. This is a cleaner kill than r35's — the effect on this road is small, and the evidence says so plainly.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed SET-A suite vs `hidden_files/telemetry-baselines/scale-wall.json`: **quiet** (1 file, 4 metrics, no large deviations). The flat top-level keys added to this sweep's reports fix the r35 schema-mismatch invocation issue forward — `--metrics national,table,wins,exiled` now reads the report directly.
- **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks the wall across runs and must not absorb a killed arm's numbers (r34/r35 precedent).

## Wall numbers (this arm's suites)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| SET-A control (8) | 2/8 | 1/8 | 0/8 | 6/8 | 4/8 | 94.5d | 0/8 |
| SET-A armed (8) | 4/8 | 1/8 | 0/8 | 6/8 | 4/8 | 97d | 0/8 |
| SET-B control (12) | 6/12 | 3/12 | 0/12 | 8/12 | 7/12 | 96d | 0/12 |

No run won. Four table reaches (s44 ctrl-A; s77 armed-A ✚180d; s111, s222 ✚180d, s444 ✚180d ctrl-B) — the table is reachable on the leadfeast road, and two villages ran the full 180-day horizon. The wall stands on the win side; the arrival side (national 6/12, table 3/12 on SET-B control) shows real movement.

## Files (layer deleted per kill protocol; everything else kept)

- `scripts/policies/recconf.js` — DELETED per kill protocol (NO-GO at pilot gate).
- `scripts/test-recconf-20261014.js` — proof: 12/12 GREEN pre-kill (REAL RED verified); INFO-SKIPs post-kill (verified).
- `scripts/sweep-recconf-20261014.js` — pilot + confirm driver (pre-registration in header); det-gate mode; kill-protocol graceful degradation (armed/detgate refuse LOUD post-kill, control mode still runs — verified).
- `scripts/sense-recconf-20261014.js` — sense transcript reader.
- `evidence/2026-10-14/sim-recconf-detgate.json` — det-gate: 16/16 byte-identical + A/A spot IDENTICAL.
- `evidence/2026-10-14/sim-recconf-control-A.json` — SET-A control (8 seeds; median 94.5d).
- `evidence/2026-10-14/sim-recconf-armed-A.json` — SET-A armed (8 seeds; median 97d, +2.5d).
- `evidence/2026-10-14/sim-recconf-control-B.json` — SET-B control (12 seeds; median 96d; stratum-label measurement).
- `evidence/2026-10-14/sim-recconf.md` — this file.
- `~/workspace/recconf-v1-buggy-20261014.js` — the v1 pre-fix build (monster-trigger bug, G10 real-red) — kept outside the repo as the RED artifact.
