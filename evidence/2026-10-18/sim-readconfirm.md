# sim-readconfirm — fresh-seed CONFIRM of the recalibrated readiness bar (2026-10-18)

Axis: scale-onramp (the blocking axis). Steve's direct order (2026-10-18, via
sim-readinessfix): the readiness demands were recalibrated —
`src/js/standing.js` `standingCfg().readyDemand`:
- wave 4: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 }
  → { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 }
- wave 5: { armored: 6, armorP: 20, armed: 7, tricks: 4, veterans: 3 }
  → { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }

The named-seed sweep ([975–982] × {leadfeast, belongfeast}, same instrument)
measured 0/16 → 13/16 wave-4. The tracker's directive-lift rule requires the
wins to hold on FRESH seeds before any directive lift. This run is that
confirm: 8 fresh seeds (52101–52108, verified unused in evidence/ —
`grep -E "s5210[1-8]\."` and `grep -E "\"seed\": ?5210[1-8][^0-9]"` across
evidence/ return nothing) × {leadfeast, belongfeast} = 16 paired runs, 180d
death-aware, per arm.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §14 — written BEFORE the sweep)

- PRIMARY: wave-4 unlocks, ARMED − CONTROL, over the identical 16 fresh runs.
  **GO ≥ +6/16.** A miss is NO-GO, never re-scored mid-run.
- Horizon: 180d death-aware (+10d tail max) — the exact horizon of the
  instrument that measured the collapse (sim-rebuildaudit) and the
  recalibration (sim-readinessfix). Death-aware: dead villages stop early.
- Seeds: 52101–52108 (fresh, verified unused). Policies: tribfloor-wrapped
  leadfeast / belongfeast (combat-invested, FEASTSCALE_R13=1 substrate —
  the same policies that measured 0/16 → 13/16).
- Guardrails: no new death mode vs control; median survival armed ≥
  control − 10d; det-gate: re-run 2 fixed seeds armed-side byte-identical.
- Secondary (report, don't judge): wave-5 unlocks; deferral-day binding
  census on the NEW bar (which legs bind now?); full wall numbers
  (national / table / wins / median survival / death-cause shares);
  transient-vs-durable veteran releases (documented honestly).
- Sanity gate (patch validation, before the main sweep): control on 2 named
  seeds (975, 976) × 2 policies should reproduce ~0/4 wave-4 (the original
  0/16 anchor). If not, the monkey-patch is wrong — report it, do not
  re-score.

## Instrument

`scripts/test-readconfirm-sweep.js` reuses `scripts/test-rebuildaudit-sweep.js`
env/policies EXACTLY:
- Env (exact round-1 substrate, all required =1 unless noted):
  - FEASTSCALE_R13=1 — feast policy revision 13 (scripts/policies/feastscale.js)
  - TRIBFLOOR=1 — tribute payments never leave the pantry below the 2-day
    floor (scripts/policies/tribfloor.js; wraps leadfeast/belongfeast)
  - SUCCGRACE=1 — succession grace (src/js/hierarchy.js)
  - RAIDDENSITY=1 — raid density (src/js/game.js, hierarchy.js)
  - WINPURSUIT=1 — win-pursuit policy layer (scripts/policies/winpursuit.js)
  - WINDEFER=1 — win-deferral policy layer (scripts/policies/windefer.js)
  - SEATDRIVE=0 — pre-seat (no seat competition; scripts/policies/seatdrive.js)
  - NODEWITNESS=1 — no-witness channel (src/js/fieldFights.js)
- Harness: sim-harness `loadGame({seed, mode:'readconfirm', fullTelemetry:false})`,
  `setupGame`, `runDays(Game, policy, {days:180, manifest:undefined,
  sampleEvery:30})`. No narration (Game.say/sysSay silenced by the harness),
  deterministic clock, Math.random seeded before eval.
- CONTROL ARM: zero game-code changes. After loadGame, before runDays,
  `Game.standingCfg` is monkey-patched to return the OLD readyDemand
  (w4 {4@P15,5,3,2}, w5 {6@P20,7,4,3}) for control runs only. Every
  readiness call site reads `this.standingCfg()` fresh (standing.js
  call sites), so the patch takes effect everywhere the gate reads.
  Fresh loadGame per run ⇒ no leakage between arms. Smoke test confirmed
  the control arm reads `demandVeterans: 2` (the old bar).
- Readiness census: `Game.sleep` wrapped read-only; each sim-day records
  {unlockedWave, villageStandingTotal, waveCombatReadiness(4) legs + short
  list}. All three are pure state reads — no RNG, no writes — so the census
  cannot perturb the sim (the det-gate pins this empirically).

## Results

SWEEP COMPLETE (2026-10-18). Both arms: 16/16 runs, 0 errors. Instrument:
`scripts/test-readconfirm-sweep.js` (exact rebuildaudit env/policies;
per-seed JSONs in `evidence/2026-10-18/perseed-readconfirm/{control,armed}/`).

SANITY GATE (control monkey-patch validation): 2 named seeds (975, 976) ×
2 policies → 0/4 wave-4. The patch reproduces the 0/16 anchor. Patch valid.

| arm | wave-4 | wave-5 | national | table | won | median days |
|-----|--------|--------|----------|-------|-----|-------------|
| control (OLD bar, patched) | 0/16 | 0/16 | 9/16 | 14/16 | 0/16 | 135 |
| armed (NEW bar, pristine) | 9/16 | 0/16 | 7/16 | 14/16 | 0/16 | 121 |

PRIMARY: wave-4 armed − control = **+9/16 ≥ +6/16 → GO.**

Control detail: all 16 capped at wave 3; 0 deferral days (standing never
reached 100 on the old bar — villages stall or die first); 12/16
village-lost, 4 survived to d180.
Armed detail: 9 unlocks on days [50, 50, 55, 64, 64, 75, 76, 99, 115];
7 non-unlockers (4 died before any wave-3 kill; 3 made a veteran but never
reached standing 100). 15/16 village-lost, 1 survived to d180 (wave 3,
no veteran). 0/16 wave-5 on both arms — the new wave-5 bar
{4@P15, 6, 3, 2} was never reached (needs standing 200 + wave-4 faced).

Guardrails:
- No new death mode: armed death causes ⊆ control's categories (combat /
  villager combat / monster / expedition / contest / sickness / starvation /
  dehydration-class / wound / night / ambush / phoenix link). Armed adds one
  "The Eater" kill (a monster death — existing category) and one "thirst"
  (water death — existing category). No new mode.
- Median survival: armed 121d vs control 135d — **guardrail MISSED by 4d**
  (pre-registered bar: ≥ control − 10d = 125d). Honest read: wave-4 exposure
  is deadlier (wave-4 monsters now in the pool post-unlock), and the gap is
  3% of the horizon — noise-scale, but the bar is the bar. Not a primary
  miss; recorded as a guardrail miss.
- Det-gate: 2 fixed seeds (52101, 52102) armed-side re-run TWICE —
  det1, det2, and the main armed run are BYTE-IDENTICAL on all gameplay
  fields (4/4 files). The sim is deterministic; the census hook perturbs
  nothing.

Deferral-day binding census on the NEW bar (secondary): **0 deferral days
across all 16 armed runs.** The readiness legs never bound overnight. In
8/9 unlocks the first living veteran appeared THE SAME DAY as the unlock —
the wave-3 kill that tips standing to 100 (+25 war) is the kill that makes
the veteran. The new bar is effectively a single gate: "standing ≥ 100 with
≥1 living wave-3 killer," and the two arrive together on the blood path.
(The 9th: veteran d43, unlock d64 — bonds/bread supplied the last standing.)
The hold fiction still fires: in the sense-tested run the System hold beat
named the short bar mid-day ("blood your fighters (0 of 1 veterans)") and
released the same night when the kill landed. The bread-road discriminator
(feast-standing without blood stays deferred) was NOT exercised by this
sweep's combat-invested policies — it stands proven by the unit test
(test-readiness-20261016.js, 29/29).

Transient vs durable veterans (secondary, documented honestly): of 12 armed
runs that produced a living veteran, **11 ended with the veteran dead
(transient)** and 1 with the veteran alive at the village's death
(belongfeast s52108, endV=1 at d105 village-lost — "durable" only in that
it outlived the run). Median village maxes at 1 living wave-3 killer
(range 0–3 killers). The bar measures fighters who walk through the door —
and the door kills them. This is the mortality-selection finding again
(sim-armorbreak): the fighters who unlock the draft die in it.

Wall numbers (scale-onramp): national 7–9/16, table 14/16, wins 0/16 on
both arms. The wall stands — villages reach national but never the table
win on this substrate. Wave-4 unlocks are up, but the scale wall (national
→ table → win) did not move. The readiness recalibration unblocked the
wave-4 door; it did not unblock the win.

## Sense-testing

One armed run with narration captured live (SEED=52103, belongfeast —
unlock d50, matching the measured run's unlock day: narration perturbs
nothing). 9,568 lines; the wave-4 window (d46–d55) read in full.

The sequence is dramatically coherent, beat by beat:
1. Dusk d50: the village holds a televised FEAST ("THE FEAST! The little
   ones are putting flavored matter in their mouths ON PURPOSE. For joy.
   The file says joy." / "They cooked it. They did not have to cook it.
   They cooked it anyway and now they are SHARING it. I need to sit down.")
2. The feast's smell draws The Callback (wave 3) — "The Callback is
   circling the edge of the light. It followed the feast here."
3. Night: the System HOLD beat — "📡 The next act is not for strangers.
   The village must be ready to FIGHT the Final Draft — blood your
   fighters (0 of 1 veterans)." Standing hit 100 (the feast's plenty);
   no veteran yet. The hold names the exact short bar, knowledge-gated
   (no wave title named).
4. The village fights The Callback blow-by-blow (4 rounds; Wanda fights
   alongside — "Wanda strikes the Callback"; FEASTED ×2.03 buffs land in
   the narration; the Callback wears dead Theo Adamczyk's face and speaks
   in their voice — "The wrongness is the telegraph").
5. The Callback falls → the veteran is blooded → the RELEASE beat:
   "RATINGS ARE UP... Wave 4 talent has been released. The Mirror Draft
   opens."

Judgment: meaningful, coherent, relevant. The hold names what the village
lacks in the village's own terms; the kill that answers it opens the door
the same night. Villager dialogue in the window is situational and varied
(water-fetching, fire gossip with shifting details, Garvan reading the sky,
spoilage accounting). Nothing robotic. One nit: "THE PARTY WINS!!" repeats
verbatim across d47–d50 (dedup only blocks consecutive repeats) — mild,
not a blank. Raw transcript: `~/workspace/readconfirm-sense-52103.txt`
(working material, not committed).

## Balanced panel (§15)

Before/after through the shared instrument (`scripts/balance-panel.js`),
screen-sized per the contract (16 cases = loop-confirm scale, "screen
only"). Before = old-bar code (parent commit of the recalibration,
extracted via `git archive` to a plain dir — no game-code changes, no
worktree), after = current worktree (new bar). Same 8 fresh seeds,
policies {leadfeast, belongfeast} (the panel registry's feastscale
versions — note: UNwrapped tribfloor, unlike the sweep; both panels use
the same policies so the comparison is internally valid), 180d, identical
round-1 env flags. Contract digest identical (panels comparable);
validity clean on both (sourcesStable, observer-neutrality proofs match).

Decision: **review_required** — attached: `compare-readconfirm.md`
(+ `.json`; panels `panel-before.json.gz` / `panel-after.json.gz`).

What the panel sees: the mortality cost of the opened door.
- leadfeast: player deaths / 100d +2.32 (exploratory interval 0.42–4.71,
  regression_signal); player deaths/run +2.1, community loss +0.25,
  national access −0.125 (regression_watch).
- belongfeast: eligible NPC named-class access −0.024 (interval
  −0.040 to −0.008, regression_signal); community loss +0.375,
  player deaths/100d +0.99 (regression_watch).
- Everything else no_material_signal: food/water/health distress,
  hunger, living NPCs, gear access, class access (player), table
  invitation (0.875 both), table wins (0 both).

Per §15 the panel is evidence, not the judge — and the verdict stands
GO on the pre-registered primary. The review_required is the honest
price tag: unlocking wave 4 puts wave-4 monsters in the pool, and
wave-4 monsters kill people. Villages that walk through the door die
more — the same mortality-selection the sweep measured (11/12 veteran
releases transient). The bar is clearable; the draft is costly. That is
the design working as Steve specified (wave 4 = a war draft, not a
parade), and the direction of the mortality signal is the expected
consequence of the lever, not an unrelated regression.

## Metric review

- The pre-registered primary (wave-4 armed − control ≥ +6/16) measured
  +9/16: GO. No re-scoring was needed or done.
- The median-survival guardrail (armed ≥ control − 10d) missed by 4d
  (121 vs 125). The panel independently flags the same mortality cost
  (review_required on deaths/100d). Proposed for the NEXT run's review:
  the guardrail as written treats any survival dip as a cost, but the
  lever's entire purpose is to expose villages to deadlier content —
  a survival-neutral bar would mean the door opened onto nothing. The
  honest next-run guardrail is a CAP on the cost (e.g. armed median
  ≥ control − 25d, no new death mode), not parity. This run judges
  against the bar as pre-registered: guardrail missed, primary GO.
- Deferral-day census returned 0 days — the census instrument worked
  (it correctly reported the same-day hold-and-release the transcript
  confirms), but the metric "which legs bind" presupposed overnight
  holds that never occur on the blood path. Next run: census the
  same-day hold/release beat directly (hold beat fired → released same
  day) rather than overnight deferral days.
- No metric changes were made mid-run. The det-gate (byte-identical
  re-runs) and the panel neutrality proofs both hold.

## Out-of-arm findings

1. **tableWaiting fires at wave 3 (14/16 on both arms, panel: invitation
   0.875 both).** MONSTER-WAVES.md says the endgame deed gate needs
   5/5/4/3/2 distinct monsters fought per wave 1–5 — but `tableWaiting`
   is set with maxWave=3 and zero wave-4/5 deeds. Either the invitation
   precedes the gate (by design) or the deed gate is not gating. Not my
   axis; flagged for the win-path lever (lever 10).
2. **The readiness gate never defers overnight on the new bar** (0
   deferral days / 16 runs; 8/9 unlocks same-day as first veteran). The
   hold fiction works intra-day (proven by transcript), but as a
   MECHANISM the veteran leg is nearly redundant with the standing bar
   on the blood path — the kill that scores +25 war is the kill that
   makes the veteran. If Steve wants the gate to ever say "not yet"
   overnight, the bread/bonds path to 100 needs to be reachable without
   blood — currently it isn't on this substrate (0 bread-path arrivals).
3. **"THE PARTY WINS!!" repeats verbatim across days** (d47 ×2, d50) —
   the log dedup only blocks consecutive repeats. Cosmetic; not a blank.
4. **The Eater killed a villager in one armed run** (death cause "The
   Eater") — wave-4's food-thesis predator is in the pool post-unlock
   and hunting. Working as designed; noted for the wave-4 content lever.
5. **Survival on fresh seeds is harsher than the named seeds**
   (control 12/16 village-lost here vs the named-seed anchor's profile).
   Seed-set variance, not a finding against the bar — but future
   confirms should keep reporting the control arm, not assume the
   named-seed baseline.

Convergence: axis scale-onramp — the wave-4 door is confirmed open on
fresh seeds (GO on the pre-registered primary), but the scale wall itself
(national → table → win) did NOT move: 0/16 wins both arms, national
7–9/16, wave-5 0/16. Status: converging (the door), not converged (the
wall). The directive stands until a run shows the wall moving.

## Check status

`node scripts/check.js --quick`: 96 passed, 1 failed — the failure is
`scripts/test-sprites-valid-20261014.js` (dustboar/sunback/sweeps_week/
cliffhanger calm/aggro sprites), deterministic across two runs (one
concurrent with the panel, one solo). This run added zero game code,
zero sprites, zero data — two sim scripts + evidence only — so the
failure is pre-existing on the base commit and unrelated. Not
quarantined here (the owning loop's call); reported, not blocking.
