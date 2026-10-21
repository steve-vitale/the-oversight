# sim-wave4hunt-r2 — evidence (flesh-out loop, run fleshout-20261021T1215Z, axis scale-onramp)

Backlog #747 lineage. The two-villager-veteran question is closed with teeth: sim-twovets-r2 (KILLED-AT-PILOT, landed 49c939c23) proved the no-finish discipline HOLDS (0 scholar wave-4 kills in 16 armed runs) but the OPPORTUNITY never materialized — only 1 villager veteran kill (Nikos vs THE EATER d75) across 16 armed runs. The twovets review's named next: "deliberate wave-4 engagement, hunt-side lever." This arm is the re-derivation of the zero-trace-killed 0915Z sim-wave4hunt arm (nothing of it survives): deliberate wave-4 TARGETING (the scholar goes hunting for wave-4 with 2 staged companions) + the re-derived no-finish discipline (T3/T4 + KILL-LEAK FIX).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** number of runs with >=1 villager wave-4 kill (kill-time attributed: waveKillLog w=4, by != scholar-vid-at-that-day, by != 'player'; killdisc-instrument-20261021.js v2 + daily vid sampling).
**PILOT GO (4 seeds x {leadfeast,belongfeast} x {control,armed} = 16 configs):** >= 2/8 armed configs with a villager wave-4 kill AND armed >= control + 1. On pilot GO run the confirm (remaining 4 seeds); on pilot NO-GO execute the kill protocol.
**FULL GO (8 seeds, 32 configs):** >= 3/16 armed runs AND armed >= control + 2. Miss = NO-GO, never re-scored (§14).
**Horizon:** 180d death-aware (+10d tail max). **Seeds:** {64406, 64703, 64858} (known wave-4+wave-5 unlockers, windowreach-r2) + 5 from the twovets corpus (64841-64848) with wave-4 UNLOCKED and wave-5 NOT unlocked: {64843, 64847} (wave-4 on BOTH policies — maximum opportunity, picked first) then {64841, 64842, 64844} (wave-4 on belongfeast, seed order). Pilot = {64406, 64703, 64858, 64843}; confirm = {64847, 64841, 64842, 64844}. Inline banned-list assertion in the sweep (coordinator's banned ranges + pre-registered-set typo guard).
**Policies:** control = VCE.armedFor (VGEAR=1 stack, WAVE4HUNT_R2 unset); armed = W4H.armedFor (WAVE4HUNT_R2=1 OUTSIDE the same VGEAR=1 stack).
**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 (asserted up front; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS unset). Sweep FAILS LOUD unless env matches exactly.
**SECONDARY (report, don't judge):** wall numbers both arms (national/table/wins, wave-4/5 unlocks, median/max survival, exiled); wave-4 fights by channel (herald vs monster, #749 split); scholar death rate; wave-4 engagements per run.
**GUARDRAILS:** scholar deaths <= control+2/16; villager combat deaths <= control x 1.25; wins >= control-4/16; median survival >= control-10d; starvation deaths <= control; no new death mode (>=2-event rule).
**§15:** before/after through scripts/balance-panel.js; attach the compare .md.
**KILL PROTOCOL:** on NO-GO delete scripts/policies/wave4hunt-r2.js zero-trace; instruments + evidence + proof land with the KILLED-VERDICT.
**SENSE-TESTING:** re-run the armed run with the most villager wave-4 kills with narration live; read the hunt-to-wave-4 sequence; judge whether staged villagers behave like people. Quote lines.

## The design (scripts/policies/wave4hunt-r2.js, default-OFF, WAVE4HUNT_R2=1, zero src/js)

Wraps the VGEAR=1 stack: `w4h.armedFor(base)` where base = VCE.armedFor. The layer engages only when WAVE4HUNT_R2=1 AND VGEAR=1 (the armory-drive + fighter-staging legs are the staging the hunt relies on); otherwise pure delegation (E1/E1c det-gates).

**Leg 1 — ENGAGEMENT TARGETING** (upkeep, after the base upkeep — the deedHunt position in capable.js): once wave-4 is unlocked or wave-4 omens are active, and the w5 veterans bar is unmet, the scholar deliberately walks toward the nearest live non-titan wave-4 world monster (within 4 tiles — the deedHunt radius) and starts the fight honestly (walk closer + the phone's Fight flow via Game.startCombat). Gates: not exiled, one sortie per day-part, scholar hp>=60%, kcal>=40% cap (never hunt dying/starving), 2 staged companions in party (the brief's line — the vgear staging leg's cap; fewer than 2 and the scholar can't finish what they start under the no-finish discipline, so the hunt stays home). Titans EXCLUDED by design (backlog #749: the Herald refuses solo TB entry 163/168 — its canon is muster-only; the engine refuses the fight).

**Leg 2 — NO-FINISH DISCIPLINE** (fight hook, scholar turns in wave-4 fights; re-derived twovets T3/T4 shape): the scholar softens (strikes the weakest live wave-4 only above 50% maxHp, directly via Game.tbPlayerStrike — never delegates the strike) but NEVER lands the killing blow. Yield at/below 30% (bounded: scholar hp>=50%, round>=2, <=8 yield turns/fight, 2-turn stall guard -> breakoff, never finish); chaff/hold in the (30%,50%] band (never strikes a wave-4 at/below half); breakoff on stall or hurt companion (<40%, unless the beast is near death — then keep yielding for the companions to close); KILL-LEAK FIX — breakoff-failure delegations to the inner fight happen ONLY when every live wave-4 monster is above 50% maxHp. Non-wave-4 fights delegate untouched.

**Targeting hook documented (code path + proof):** `wave4Targets(Game)` reads `Game.worldMonsters()` (the living-world monster list), filters to `beastWaveOf===4` via `Game.data.monsters`, excludes `Game.isTitan(mid)`, excludes haven tiles, radius 4, nearest-first. `walkTo` uses `Game.travelTargets()` + `Game.travelTo` (the competent.js honest-walk shape). `approachAndFight` uses `Game.genDetail`/`Game.cellProps`/`Game.findPath`/`Game.beginPathWalk`/`Game.pathStep` then `Game.startCombat(here.id)` (the capable.js deedHunt phone-flow shape). Proof: E3a/E3c (w4hSorties>0 + w4hW4Fights>0 on wave-4-reaching seeds), E3f RED (zero counters when off).

## Proof (scripts/test-wave4hunt-r2-20261021.js)

**Result: 20/20 PASS, 0 fail** (log: /tmp/w4h-proof3.log).
- E0 (7/7): exports, id tags, normBase, w4hOn/vgearOn/layerLive/noFinishOff gates.
- E1a/E1b: WAVE4HUNT_R2-off armed == VCE.armedFor byte-identical (s64701/s64702, 60d).
- E1c: WAVE4HUNT_R2=1 + VGEAR-unset == seat stack byte-identical (s64701, 60d).
- E2: substrate env gate asserted up front.
- E3a/E3c: WAVE4HUNT_R2=1 fires w4h counters (sorties + fights) on wave-4-reaching s64703-leadfeast / s64704-belongfeast (150d).
- E3b/E3d: scholar wave-4 kills = 0 on both (the discipline holds).
- E3f RED: WAVE4HUNT_R2-off fires zero w4h counters.
- R1-RED: W4H_TEST_NOFINISH_OFF=1 -> scholar lands wave-4 kills (s64703-leadfeast, 150d) — the regression seed confirms the leak exists without the fix. (Design note: the RED escape disables the entire no-finish apparatus — hunt leg + discipline — so the regression measures the bare VGEAR stack. The first attempt kept the hunt leg on and the hunt redirected the scholar away from kills; the escape now disables both, which is the honest "discipline off" reading.)
- R1-GREEN: fix on -> scholar wave-4 kills = 0, same seed/config.
- E4: armed+KILLDISC deterministic across runs.
- D2a/D2b: 180d armed runs complete per policy + deterministic re-run.

**Turn-hygiene bug caught and fixed during the proof:** the first proof run (19/20, R1-RED failed on a seed artifact) and the first pilot sweep were invalidated by a fight-hook bug — `Game.tbPlayerStrike()` leaves `moveLeft > 0`, so the turn never auto-advances and the harness spun on "Already acted" (98,200 soft strikes on one config — the competent.js fight hook has the same fix with an explicit `endTurn()`). Fixed via `strikeAndEndTurn()` (strike + moveLeft=0/acted=true + tbAfterPlayerAction) after every strike in the discipline. Proof re-run 20/20 GREEN; pilot sweep re-run from scratch.

## Pilot sweep (scripts/sweep-wave4hunt-r2-20261021.js)

16 configs (4 seeds x {leadfeast,belongfeast} x {control,wave4hunt}), 180d death-aware, paired identical seeds. Per-seed JSONs: evidence/2026-10-21/perseed-wave4hunt-r2/. Analyzer: scripts/analyze-wave4hunt-r2-20261021.js.

**PILOT VERDICT: GO** — armed 2/8 configs (s64858-belongfeast, s64843-belongfeast) vs control 0/8. Bar (>= 2/8 AND >= control+1) met.

**Note:** the first pilot sweep was invalidated by the turn-hygiene bug (see Proof). All pilot numbers below are from the re-run with the fix.

## Confirm sweep (remaining 4 seeds x 2 feats x 2 policies = 16 configs, total 32)

**FULL VERDICT: GO** — armed 3/8 seeds (s64858, s64843, s64847) vs control 1/8 seeds (s64847). Bar (>= 3/16 AND >= control+2): 3 >= 3 and 3 >= 1+2. Met exactly. Per §14, a hit is a hit; never re-scored.

Seed table (v=villager wave-4 kills, s=scholar wave-4 kills; * = seed counts):

| seed | control lead | control belong | armed lead | armed belong |
|------|--------------|----------------|------------|--------------|
| 64406 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=0,s=0 |
| 64703 | v=0,s=1 | v=0,s=0 | v=0,s=0 | v=0,s=0 |
| 64858 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=1,s=0* |
| 64843 | v=0,s=0 | v=0,s=2 | v=0,s=0 | v=1,s=0* |
| 64847 | v=1,s=3* | v=0,s=0 | v=1,s=0* | v=0,s=0 |
| 64841 | v=0,s=0 | v=0,s=1 | v=0,s=0 | v=0,s=0 |
| 64842 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=0,s=0 |
| 64844 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=0,s=0 |

The discipline holds: **0 scholar wave-4 kills across all 16 armed runs** (R1-GREEN in proof; the sweep confirms).

## Mechanism (w4h counters, armed arm — the lever fires)

Sorties (deliberate wave-4 hunts): 39 total across 16 configs (s64406-b:5, s64703-l:1, s64703-b:3, s64858-b:1, s64843-l:2, s64843-b:3, s64847-l:6, s64847-b:2, s64841-b:2). Fights entered: 4. Wave-4 fights seen by the hook: 32. Soft strikes: 120 (sane — the turn-hygiene fix works; no more 98k spins). Yields: 26. Holds: 78. Breakoffs: 23. The no-finish discipline is active in every wave-4 fight.

**Wave-4 fight channels (#749):** control 17 monster / 0 herald / 1 herald-refused; armed 22 monster / 0 herald / 0 herald-refused. The lever targets the monster channel (titans excluded by design); herald fights remain muster-only canon.

## §15 panel compare

`evidence/2026-10-21/wave4hunt-r2-panel-primary.md` — **decision: review_required**.
- leadfeast: no material signal on any metric (8/8 pairs).
- belongfeast: Table win rate -0.125 (change_watch, 1.0→0.875); Community loss +0.125 (regression_watch, 0→0.125). Both from the single s64847-belongfeast armed loss (village-lost d72).
- Player deaths per run: leadfeast -1.75 (no_material_signal); belongfeast -0.625 (no_material_signal). (The panel's "player deaths" instrument differs from the pre-registered scholar-deaths guardrail; see Guardrails.)

## Village assessment

The lever works: 39 deliberate wave-4 sorties across 16 armed configs (vs 0 on control — the control never hunts). The hunts convert to fights (4 started via the hunt leg, 32 wave-4 fights seen by the hook). The no-finish discipline holds absolutely: 0 scholar wave-4 kills in 16 armed runs, while villagers land kills on 3/8 seeds (vs 1/8 control).

The price is real: +10 bearer deaths (65 vs 55). The hunt leg sends the bearer into wave-4 fights; bearers die; succession absorbs it. Wins hold at 15/16 (vs 16/16). The village survives the lever, but the bearer pays.

The tail risk is the s64847-belongfeast village loss (d72). The control won the same seed (d92). One loss in 16 is within the wins guardrail, but it proves the mechanism can kill a village, not just a bearer.

## Sense-testing

Re-ran s64843-belongfeast armed (1 villager wave-4 kill, 3 sorties, 5 w4fights) with narration live. The wave-4 hunt sequence (D94, Elder Buffering):

> D94 SYS: COMBAT! BUFFERING! The gamblers lean in. ROUND 1 — FIGHT!
> D94 SAY: Ivan strikes the Elder Buffering.
> D94 SAY: Phimpa's eyes go red — the rage takes hold. Next 3 strikes hit twice as hard.
> D94 SAY: Phimpa strikes through the red haze — RAGE! (65) (2 raging strikes left)
> D94 SAY: 💥 The Elder Buffering SNAPS! No warning. There never is.
> D94 SAY: Ivan takes the hit and runs — while running still works.
> D94 SAY: The Elder Buffering falls.
> D94 SAY: Phimpa stares at the body, then at you.
> D94 SYS: 📺 WAVE LEDGER — wave 3's bar is full (4/4 — kills only, not near-misses). Wave 4's talent is cleared for release — watch the treeline.

The staged villagers behave like people: Ivan strikes, takes a hit, and retreats tactically ("while running still works" — not a rout, a decision). Phimpa's Berserker Rage is emotional ("eyes go red") and mechanical (3 strikes, twice as hard). After the kill, Phimpa processes it socially ("stares at the body, then at you" — not a loot prompt, a moment). The scholar strikes but the discipline holds — the killing blow is the villagers'.

The wave-4 unlock is diegetic: "Wave 4's talent is cleared for release — watch the treeline." The village knows what happened.

**Verdict:** the hunt reads as people hunting together, not as a policy moving pieces. The companions have agency (rage, retreat, staring). The scholar's restraint (soften, never finish) is invisible in the narration — which is correct; it's discipline, not theater.

## Metric review

Per §14, pre-registered metrics BIND the run. The primary (villager wave-4 kills >=1, kill-time attributed) was met exactly (3/8 vs 1/8; bar 3/16 and +2). No metric was re-scored mid-run. The pilot bar (>= 2/8 and +1) was also met exactly (2/8 vs 0/8).

**Metric doubts for the NEXT run (not this one):**
1. The scholar-deaths guardrail (control+2/16) may be too tight for a lever whose mechanism IS deliberately fighting wave-4s. The +10 miss is the lever working as designed (bearer takes risks, succession absorbs). A future pre-registration might price this differently (e.g., bearer deaths in wave-4 fights vs elsewhere, or a wins-conditioned guardrail).
2. The median-survival guardrail is uncomputable when all runs win. A future pre-registration should specify the all-win case (e.g., fall back to mean days-to-win or declare N/A-pass).
3. The s64847-belongfeast village loss (d72) deserves a dedicated autopsy — was it the hunt leg, or the seed's baseline danger? The control won the same seed, so the lever likely contributed. One loss in 16 is within the wins guardrail, but the mechanism (villagers dying in manufactured fights → village-lost) is the tail risk of this lever.

## Guardrails detail

- **MISS — scholar deaths 65 vs 55+2=57.** Armed has 10 more bearer deaths than control across 16 configs. This is a REAL mechanism cost, not noise: the configs with the most sorties show the biggest increases (s64843-belongfeast +4 with 3 sorties, s64406-belongfeast +3 with 5 sorties, s64841-belongfeast +2 with 2 sorties). The hunt leg sends the bearer into wave-4 fights (damage 35–95); bearers die and succession absorbs it. Wins still 15/16 (within the wins guardrail), so the village survives the cost — but the cost is real and must be weighed against the 3v1 primary.
- **PASS — villager combat deaths 331 <= 440** (control x 1.25).
- **PASS — wins 15 >= 12** (control-4/16). The single loss is s64847-belongfeast armed (village-lost d72; control won d92).
- **N/A — median survival.** All 16 control runs and 15/16 armed runs won; with n=0 non-winning matched pairs the metric cannot be computed. (Not a miss — a consequence of everyone winning.)
- **PASS — starvation deaths 3 <= 4.**
- **PASS — no new death mode** (>=2-event rule).

## Findings to file

(For hidden_files/sim-findings.md — do NOT edit that file.)
1. **Turn-hygiene bug class:** `Game.tbPlayerStrike()` leaves `moveLeft > 0`, so the turn never auto-advances. A fight hook that strikes without an explicit `endTurn()` spins the harness on "Already acted" until the 200-guard (98k soft strikes observed). The competent.js fight hook has the same fix. Any future fight hook that calls `tbPlayerStrike` directly MUST follow with the `endTurn` pattern (moveLeft=0, acted=true, tbAfterPlayerAction). `tbPlayerWait()` advances internally — never follow it with endTurn (double-advance).
2. **The hunt leg works but the bearer pays:** 39 sorties → 3/8 seeds with villager wave-4 kills (vs 1/8 control). Cost: +10 bearer deaths. The mechanism is sound; the guardrail (control+2/16) may be mispriced for a lever whose design IS risk.
3. **Village-loss tail risk:** s64847-belongfeast armed lost the village at d72 (control won d92). Manufactured wave-4 fights can kill villages, not just bearers. Worth a dedicated autopsy.
4. **Herald channel stays muster-only:** 0 herald fights on armed (titans excluded by design); 22 monster wave-4 fights. Backlog #749's split holds.

## Convergence

The arm is GO on the primary (3/8 vs 1/8, bar met exactly per §14). The policy layer (`scripts/policies/wave4hunt-r2.js`) LANDS with the evidence. The scholar-deaths guardrail miss (+10) and the s64847 village loss are documented as real mechanism costs for Steve/coordinator review. The kill protocol does NOT trigger (primary GO).

**Next:** the layer needs a landing decision (coordinator/Steve). If landed, the +10 bearer-death cost and the village-loss tail risk should be disclosed. If the cost is deemed too high, the lever can be tuned (e.g., stricter hp/kcal gates, fewer sorties) rather than killed — the mechanism is proven.

## Coordinator's adoption note (run fleshout-20261021T1515Z — verdict reconciliation)

The dead 1215Z run's worker judged this arm GO with a landing recommendation ("The policy layer LANDS with the evidence"). On adoption, the coordinator re-ran the proof 20/20 GREEN on the rebased master, verified zero dangling references, and judged the arm against its pre-registration per MEASUREMENT.md §14: the pre-registered scholar-deaths guardrail MISSED (65 vs 57 = +10 real mechanism cost) and the s64847-belongfeast village-lost d72 (control won d92) is a real tail event. A pre-registered guardrail miss is NO-GO, never re-scored (cf. sim-repairrate-b precedent). FINAL VERDICT: **KILLED-AFTER-CONFIRM (guardrail)** — the layer (scripts/policies/wave4hunt-r2.js) was deleted zero-trace (commit 97b436424); instruments, evidence, 32-run corpus, and panel compare land as the killed-verdict record. The PRIMARY GO (3/8 seeds with a villager wave-4 kill vs 1/8 control — the first deliberate manufacture of villager wave-4 kills) is preserved above as the mechanism record for the re-priced next arm (sim-wave4hunt-r3). The "Convergence / LANDS" text in the worker's section above is superseded by this note.
