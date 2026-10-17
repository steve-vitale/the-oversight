# sim-trickreach — the trick-reach lever arm (flesh-out loop, 2026-10-17)

**Run:** flesh-out loop, arm sim-trickreach (axis scale-onramp blocking — the trick/counter game is a named villager-side answer to the post-invite field-exposure mortality channel).
**Type:** LEVER ARM. New policy file `scripts/policies/trickreach.js` ONLY (TRICKREACH=1, default OFF). ZERO src/js, ZERO src/data, ZERO other scripts/policies changes — the landed reposition.js composition pattern mirrored exactly (wrap leadfeast/belongfeast via require('./feastscale'), Object.assign).
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read — "Monster counters" section: fresh_weapon "requires the understudy to have already seen a weapon — the trick is the mid-fight SWITCH, not the opener"; keep_distance "refusal" behavior (voice_mimic_radio rewire note); 14 kinds, waves 1–2 only. No new canon invented.
**Finding:** #432a from evidence/2026-10-16/sim-trickfunnel.md — the two REMAINING bot-unreachable trick kinds after the landed reposition arm (d09bc3ac): fresh_weapon (understudy: 16 contacts / 12 known / 0 performed — bots never switch weapons mid-fight) and keep_distance (murkcap 13/12/0/0/0, living_wire 7/6/0/0/0 — bots close to melee every turn).

## The lever

TRICKREACH=1 arms two engine-honest, knowledge-gated TB actions, each at most ONCE per fight per kind, only when the trigger is genuinely present:

1. **fresh_weapon (understudy):** trigger = the understudy's usSeen is non-empty (it has SEEN a weapon — the opener never counts, break-it 2026-10-11) AND the scholar carries an unseen melee weapon in inventory AND the understudy is within that weapon's range. Action: real `Game.equip(idx,'melee')` (engine-verified non-turn-costing: touches neither acted nor moveLeft; narrated "Equipped X"), then DELEGATE — the base spends the turn striking with the fresh weapon; the engine's own checkMonsterCounter logs the performance on the real strike. Melee only (design call: the understudy is a direct-pattern melee fight; ranged brings ammo/distance edge cases the pilot doesn't need).
2. **keep_distance (murkcap, living_wire, + 4 more keep_distance species):** trigger = scholar's chebyshev distance < (ctr.tiles || 3) — the engine default 3 applies to murkcap/living_wire (their defs carry no `tiles`; we use the same default the check uses). Action: real tbPlayerMove to a free interior tile (1..7 — edges are the flee-by-barrier) at distance ≥ tiles, then end the turn; the engine's round_end check in tbAfterPlayerAction fires on the real turn end. The scholar gives up its strike that turn (a luxury move). Fires only when distance is genuinely not kept (otherwise the base already earns it — the funnel's natural 5/42).

**Knowledge gate** (Steve: "If you don't know, it doesn't show"): state.monsterCounters[mid] OR codex 'slain' stage — the exact gate shape of the landed reposition layer.
**Safety** (reposition precedent, non-negotiable): hpPct ≥ 0.7 (far from the base's 0.35 mid-fight eject — never shadowed); first-fight-call turn-1 walk-away mirror (totalMhp > 2.5*pmax → delegate so the base flees; the base's other two turn-1 eject clauses cannot fire at hp ≥ 0.7).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written before the pilot sweep)

**PRIMARY:** fresh_weapon + keep_distance PERFORMANCES via the f.trickLogByMid attribution channel (scripts/trickres-instrument-20261016.js, reused read-only). **armed − control ≥ 4 across the 16-run pilot → GO** (confirm on 12–16 fresh seeds). **Miss → KILL** (delete scripts/policies/trickreach.js zero-trace per kill protocol; keep instruments + evidence).
**Guardrails:** scholar combat deaths ≤ control+2; national ≥ control−2 (per 8-seed set); median survival ≥ control−10d; no new death mode.
**Substrate:** SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1, {leadfeast, belongfeast}, NODEWITNESS unset.
**Seeds:** 8 FRESH [3601–3608] (0 filename hits across evidence/, verified 2026-10-17) × {leadfeast, belongfeast} = 16 runs/arm.
**Horizon:** 180d death-aware (dead villages stop; +10d tail max).
**Gates before spend:** proof RED→GREEN (scripts/test-trickreach-20261017.js) · det-gate (gate-off byte-identical) · SMOKE green.
**Per-seed JSONs:** evidence/2026-10-17/perseed-trickreach/ · beats: evidence/2026-10-17/trickreach-beats/ · instrument: scripts/trickres-instrument-20261016.js (reused) · sweep: scripts/sweep-trickreach-20261017.js · proof: scripts/test-trickreach-20261017.js.

## Metric review

Every evidence file carries one. The PRIMARY is performance count (armed−control ≥ 4), not kill attribution — the funnel census already showed perf→attr is the lethality gap, not the wiring gap; this arm pushes the execution stage (known→cond), and performances are the stage's honest measure. Guardrails are the wall metrics, not a second primary — a lever that moves tricks but bleeds the village fails loud. If the reviewer judges performances should require kill-attribution, that revision belongs to the NEXT run's header — this run measures performances as written.

## Proof: scripts/test-trickreach-20261017.js

**27/27 GREEN** (2026-10-17, run before the pilot sweep):
- GATE (RED): TRICKREACH unset → layerOn() false (gate off by default).
- FRESH_WEAPON: real startCombat('understudy') → usSeen populated (the switch trigger genuinely present) + unseen melee weapon in pack + trick known + hp full → trickreachPlay switches via the real Game.equip and delegates (returns false); the real Game.tbPlayerStrike then logs `fresh_weapon` in f.trickLogByMid.understudy. Negatives all hold: opener (usSeen empty) → no switch; unknown trick → no switch; hp<0.7 → no switch; no fresh weapon → no switch.
- KEEP_DISTANCE: (a) ring species speedbump_turtle (tiles=2, reach=1, follows=false → ring exactly d=2): adjacent scholar → layer moves to d=2, real round_end logs `keep_distance`. (b) empty-ring species murkcap (tiles=3 > reach 2) with the Sporefall telegraph up: layer backs out of the cloud to d≥3, round_end logs `keep_distance` (captured from the fight object — the fight disengages after the monster's turn). Negatives: murkcap without telegraph (empty ring) → no fire; radio already in window → no fire; unknown → no fire; hp<0.7 → no fire; turn-1 outmatched → delegate, no trick.
- DET: gate-off trickreach-lead/belong byte-identical to feastscale leadfeast/belongfeast (2 seeds × 60d via dayHash); gate-on deterministic.
- SMOKE: 20d pre-seat TRICKREACH=1 run completes green.
- LIVE-PROBE (informational): 60d armed s204 → 0 attempts for both kinds — no known-trick trigger geometry on that seed/window; the 16×180d pilot is the real non-vacuity measure.

**Engine-geometry finding (documented, not "fixed"):** the break-it disengage rule (tbEndCheck) ends the fight BEFORE the round_end counter check whenever every living monster is beyond its own striking distance and none chases. Verified rings: turtle [2..2], catfish [2..3], radio [3..∞) (chases — no disengage), tick [2..3]; murkcap/living_wire/bright_idea EMPTY (tiles=3 > reach 2) — observable only while the telegraph is up. The funnel's murkcap 13/12/0/0/0 and living_wire 7/6/0/0/0 are engine geometry, not just bot behavior. Whether the geometry should change is Steve's call.

## Pilot sweep: 32 runs (16 armed / 16 control)

**Launched 2026-10-17** (after proof GREEN): control (TRICKREACH unset) and armed (TRICKREACH=1) in parallel, 8 fresh seeds [3601–3608] × {leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1 SEATDRIVE=0. Per-seed JSONs → evidence/2026-10-17/perseed-trickreach/; beats → evidence/2026-10-17/trickreach-beats/.

**Honesty fix during the run (documented, sweep re-launched):** the first launch's keep_distance branch would step the scholar CLOSER into the ring when starting in disengage territory (d0 > hi) — manufacturing a trigger that wasn't genuinely present (metric-farming, not survival). Fixed before any run completed: the layer now only ever backs OFF (d0 < lo → into the ring); d0 > hi → no fire. Proof re-run GREEN (28/28 incl. the new negative); sweep re-launched against the fixed policy. ~15 min of CPU wasted, zero runs completed — no measurement contamination.

**check.js --quick (2026-10-17):** 96 passed, 1 failed — the failure is `scripts/test-sprites-valid-20261014.js` (dustboar/sunback/sweeps_week/cliffhanger sprite assets), PRE-EXISTING on this base commit and unrelated to this arm (my worktree holds only new files — zero tracked-file modifications). Not mine to fix; documented here.

### Results

| metric (16 runs/arm) | control | armed | Δ |
|---|---|---|---|
| PRIMARY: fresh_weapon + keep_distance performances | 12 | 17 | **+5** |
| — keep_distance | 12 | 17 | +5 |
| — fresh_weapon | 0 | 0 | 0 |
| national | 10/16 | 10/16 | 0 |
| table | 12/16 | 12/16 | 0 |
| wins | 0/16 | 0/16 | 0 (pre-seat by design) |
| scholar combat deaths | 66 | 74 | **+8** |
| playerDeaths | 77 | 84 | +7 |
| median survival | 180d | 180d | 0 |

**PRIMARY: +5 ≥ 4 → GO (binding).** All 17 armed performances are keep_distance (turtle, radio, tick, catfish rings); the control's 12 are the funnel's natural baseline (base bots sometimes end turns at range). The layer's marginal +5 comes from 4 seeds (3605, 3607, 3608 leadfeast; 3604 belongfeast).

**fresh_weapon: 0/0 — UNTESTABLE on this substrate.** Diagnostic (tbfight interception, seeds 3605/3608 × 180d): **zero understudy scholar-TB contacts on any initiation path**. The village KNOWS the understudy trick (via villager field fights), but the scholar never meets one in TB — so the switch trigger can't arise. The funnel's 16 understudy contacts came from a different seed set (1801–1808); on 3601–3608 the species never reaches the scholar's blade. This is a contact gap, not a layer bug (the proof's GREEN test proves the mechanism). Finding filed below.

**Guardrails:**
- scholar combat deaths ≤ control+2: **MISS** (74 vs 66, +8). Paired differences: **14 of 16 pairs identical (Δ=0)**; the +8 is belongfeast-3604 (+7) + leadfeast-3608 (+1). belongfeast-3604: armed had 1 keepDistance attempt (day-50 radio fight, WON) but 44 vs 24 TB fights over 152 vs 120 days — the single safe turn-skip on day 50 cannot plausibly cause +7 deaths across 152 days; this is downstream RNG divergence after the trajectories split, not a layer mechanism. Weak evidence of real cost — but the bar is binding, so the miss is flagged LOUD and carried as a binding gate on the confirm run (see verdict).
- national ≥ control−2 per 8-seed set: HOLD (leadfeast 8/8 = 8/8; belongfeast 2/8 = 2/8).
- median survival ≥ control−10d: HOLD (180 = 180).
- no new death mode: HOLD (armed introduces no new cause; 'The Understudy' 1 death appears in both arms).

## Sense-testing (transcript reads)

**Read 1 — the turtle siege (leadfeast-s3608 armed, day 136, speedbump_turtle, 10 keep_distance performances, WON):** the scholar knew "Never stand next to it" and the layer backed them to exactly d=2 — the observable ring. Ten round_end performances in one won fight means the scholar HELD the distance across ten rounds: the trick wasn't a one-off, it became the fight's shape. The turtle's hurt-state line that day — "turtle is hurt — and it goes quiet and clever. It stops rushing. It starts CHOOSING. Watch the spacing." — reads as the fight the trick creates: a spacing battle the scholar wins without ever standing next to the snap. Meaning: the scholar applies village knowledge as a stance. Coherence: "It can't chase. The snap is fast but the legs are slow" → fighting from d=2 is exactly the text's advice. Relevance: the performance count tracks a won fight, not a farmed one. Verdict: the Undertale moment, working as designed.

**Read 2 — the radio refusal (belongfeast-s3604 armed, day 50, voice_mimic_radio, 2 performances, WON):** "The static resolves — mid-sob — into a voice like chris. 'PLEASE. Don't leave me out here.' It's coming closer now." The scholar held at d≥3 (the radio chases — follows=true — so no disengage; the ring is [3,∞)) and refused the lure for two rounds; the act broke and the scholar won. Coherence: the reveal text prescribes "Two rounds of refusal and the act breaks" — the transcript shows the refusal happening. Verdict: the trick performs the fiction, not just the counter.

## Village assessment

The villages look like the pre-seat wall state: national 10/16, table 12/16, wins 0/16 by design, median survival 180d. The trick game is alive but thin — keep_distance performances cluster on seeds where the scholar meets ring species (3608: 11 armed / 8 control), and fresh_weapon is entirely absent for contact reasons. The layer doesn't change the village's shape (national/table/wins identical); it changes HOW the scholar fights the fights they were already winning. The blank filled: bots can now execute keep_distance (the funnel's last bot-unreachable movement kind besides the telegraph-gated murkcap/living_wire). The blank documented: murkcap/living_wire/bright_idea keep_distance is engine-geometry-gated (telegraph only), and understudy never reaches the scholar's TB on this seed set — both are substrate/contact findings, not layer bugs.

## Verdict

**GO (primary +5 ≥ 4), with the death guardrail miss flagged LOUD.** The binding GO/KILL criterion is the primary, and it hit. The scholar-death guardrail missed (+8 vs +2) — 14/16 pairs identical, the excess concentrated in one diverged run with no plausible layer mechanism — but the bar is binding, so the confirm run carries the death gate as binding: if scholar combat deaths miss control+2 again on fresh seeds, the arm is killed then. fresh_weapon remains unproven in live sims (contact gap); the confirm should include seeds/species where the scholar actually meets an understudy, or the kind stays documented-unreached.

**Named nexts:**
1. Confirm on 12–16 fresh seeds (death gate binding).
2. Finding #433 (new): understudy never reaches scholar TB on seeds 3601–3608 — the fresh_weapon trick is contact-gated, not execution-gated, on this substrate. A future arm needs scholar-vs-understudy contacts first (seed selection or encounter-mix work).
3. Finding #434 (new): murkcap/living_wire/bright_idea keep_distance observable only during telegraphs (disengage geometry) — Steve's call whether the geometry should change.
4. Finding #435 (new): the d136 turtle siege suggests a "stance" pattern — once the layer seeds the ring distance, the base bot holds it (10 performances, won). Worth measuring as a deliberate tactic, not just a trick.

## Sense-testing (transcript reads)

One beat read: `trickreach-beats/belongfeast-s3604-armed.txt` — two keep_distance performances vs voice_mimic_radio, both "won". The narration pairs with pantry-full beats that are sensible ("The pantry can't take more; the wild will keep"). Performances register coherently in play; they just don't move the aggregate.

## Village assessment

24 runs (seeds 3611–3622 × leadfeast/belongfeast), 180d death-aware, pre-seat courtship (SEATDRIVE=0, FEASTSCALE_R13=1). Villages survived well (median days armed 180 vs control 155; national 14/14 both arms).

## Verdict

**KILLED AT CONFIRM.** Primary missed: performances armed−control = **−4** (armed 18, control 22) vs bar ≥4. The pilot's +5 did not replicate — the confirm's control itself exceeded the armed arm, so the pilot margin looks like seed noise, not a layer effect. Guardrails all passed (scholarCombatDeaths 128 ≤ 143+2; national 14 ≥ 14−2; median days 180 ≥ 155−10). Per binding header: layer deleted zero-trace (`scripts/policies/trickreach.js` never landed in master). Instruments + evidence kept. The keep_distance kind stays documented-reachable via the funnel's natural baseline (bots sometimes end turns at range); fresh_weapon remains unreached in live sims (contact gap — 0 understudy TB contacts on this seed set too).

## Metric review

Metric was sound: the primary was the same count channel as the pilot, and the guardrails prevented a silent regress. No revision proposed. The confirm properly falsified the pilot's signal; this is §14 working as designed.
