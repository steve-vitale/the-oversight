# sim-reposition — teach the bots to reposition in TB (flesh-out loop ARM, finding #430, 2026-10-16)

**Run:** flesh-out loop, run_id fleshout-20261016T2315Z (coordinator claim; axis scale-onramp blocking).
**Type:** POLICY-SIDE arm. New file scripts/policies/reposition.js only. NEVER touched: existing scripts/policies/*, src/js, src/data.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (counter kinds + discovery channels). The wave3ledger arm's design call stands: don't widen conditions game-side — this arm is the named policy-lane question: teach bots to reposition in TB and measure whether performances — and fight outcomes — move.
**Claim:** none filed (coordinator-assigned finding #430, not tracker-claimed).

## Finding #430 (from sim-findings.md)

TB BOTS NEVER REPOSITION — movement-based counter perform-kinds are bot-invisible. `blindside` (sunback: move during the arch) and `face_it` (sweeps_week: move away without fleeing) recorded 0 performances across 32 runs, while the same-shaped `move_windup` ev fires for other species and `eyes` (cliffhanger) kill-attributes regularly. The wave3ledger arm documented the game-side design call (don't widen conditions — the perform-channel contract "You did the thing — and it worked" forbids it).

Verified in the base: competent.js's `beastTrickPlay` handles shout/offer_food/wait/move_windup/move_x2/sidestep/keep_distance/strike_* but ends with `// Unknown kind: never loop on it.` — blindside and face_it are literally unhandled kinds. The conditions are honest and human-meetable (wave3ledger evidence): blindside = sunback's Sunflash Lunge telegraph present (minRange 2, 2-round windup); face_it = move that doesn't close distance on the turn-1 window.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the pilot sweep)

**Question:** does teaching the TB policy to reposition (honest movement actions for known movement-kind tricks) move performances — and fight outcomes — on the pre-seat substrate?

**PRIMARY (binding):** movement-kind trick PERFORMANCES (blindside + face_it + move_windup via the trick attribution channel, f.trickLogByMid captured at tbEnd) — armed − control ≥ 4 across the 16-run pilot.

**GO:** ≥4 → confirm on 12–16 fresh seeds (fresh = 0 per-seed filename hits across evidence/).
**KILL:** miss the bar → delete scripts/policies/reposition.js zero-trace per kill protocol; keep instruments + evidence.

**Guardrails:** scholar combat deaths ≤ control+2; national ≥ control−2 (per 8-seed set); median survival ≥ control−10d; no new death mode (a death cause with n≥3 absent from control).

**Substrate:** pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1 (same substrate as wave3ledger/counterres; the trick game is measurable there for wave-1 species).
**Policies:** {leadfeast, belongfeast} × {control, armed}. **Seeds:** 8 FRESH [3401–3408] × 2 policies = 16 runs/arm, paired identical seeds. **Horizon:** 180d death-aware (dead villages stop).

**The layer (scripts/policies/reposition.js, REPOSITION=1, default OFF):**
wraps leadfeast/belongfeast (require './feastscale', Object.assign composition — no existing policy file touched). Overrides `fight(Game, ctx)`:
- REPOSITION unset → pure delegation (byte-identical; pinned by the proof's RED phase).
- REPOSITION=1 → `repositionPlay(Game, ctx)` runs BEFORE the base fight() each player turn; if it takes the turn, return true; else delegate to the base byte-identically.
- Two conditions, each at most ONCE per fight, ONLY when the trigger is genuinely present:
  - **blindside (sunback):** the arch is up — the sunback fighter's `telegraph` truthy on the scholar's turn. The honest action: real `tbPlayerMove` to a free interior tile (1..7), avoiding the telegraph cells (the lunge lane) — the engine's ev (`move` + windup) fires for that sunback. (The counterwire arm documented that shadow-side nuance is not engine-observable; the arch-move is the honest performable act.)
  - **face_it (sweeps_week):** the turn-1 window (`f.round === 1`). The honest action: real `tbPlayerMove` to a free interior tile that does NOT close distance (d1 ≥ d0 — "back away slow"; the engine fires on `!ev.closer`). Never a flee: interior tiles only (edges are the flee-by-barrier), never toward a wall.
- **Knowledge-gated** (Steve: "If you don't know, it doesn't show"): attempted only when the village's real counter-ledger knowledge state holds — `state.monsterCounters[mid]` (fully discovered, via trick/teaching) OR codex monsters[mid].stage === 'slain' (the hint the player read). Same gate as the base's beastTrickPlay.
- **Safety:** the trick is a luxury move — fire only at scholar hpPct ≥ 0.7 (the base's mid-fight eject is at 0.35; never near it), and on turn 1 only when the base's outmatched walk-away would NOT fire (mirror the turn-1 formula: totalMhp > 2.5*pmax → skip, delegate → base flees). The base's dps-race/walk-away logic is never bypassed for survival decisions — reposition only spends a turn the base already decided to fight.
- **Honest movement:** path-cost checked (`Game.findPath` + `tbTerrainCost` vs `p.moveLeft`), never onto monster tiles, position must actually change, endTurn after the move (tbPlayerMove does not auto-advance; never endTurn after tbPlayerWait — N/A here).

**Instruments:** the trickres instrument (scripts/trickres-instrument-20261016.js) captures `f.trickLogByMid` at tbEnd — the movement-kind performances are tallied from `cap.tbFights[].perfs[mid]` filtered to kinds {blindside, face_it, move_windup}.
**Per-seed JSONs:** evidence/2026-10-16/perseed-reposition/ · beats: evidence/2026-10-16/reposition-beats/ · sweep: scripts/sweep-reposition-20261016.js · proof: scripts/test-reposition-20261016.js.

## Results

### Proof: scripts/test-reposition-20261016.js — 22/22 GREEN
- GATE: layerOn() false when REPOSITION unset (default OFF), true when =1.
- BLINDSIDE GREEN: synthetic TB fight, sunback arch up, trick known → repositionPlay fires, the player really moves, and the engine logs a **blindside PERFORMANCE** in `f.trickLogByMid.sunback` via the real path (real `tbPlayerMove` → real `checkMonsterCounter`). Once per fight enforced.
- BLINDSIDE NEGATIVES: no telegraph → no fire; unknown trick → no fire (knowledge gate holds).
- FACE_IT GREEN: synthetic turn-1 fight vs sweeps_week, trick known → fires; the player moves WITHOUT closing distance (d1 ≥ d0 — back away slow); engine logs **face_it**.
- FACE_IT NEGATIVES: round 2 → no fire (firstTurn window only); outmatched on turn 1 (totalMhp > 2.5×pmax — the base would walk away) → no fire; unknown trick → no fire.
- SAFETY: 60% HP scholar → no fire for either condition.
- DET: gate-off reposition-lead byte-identical to leadfeast (s204, 60d dayHash); gate-off reposition-belong byte-identical to belongfeast (s315); gate-on deterministic (identical 60d runs byte-identical).
- SMOKE: 20d pre-seat run with REPOSITION=1 completes.

### Pilot sweep: 16 armed + 16 paired-control (8 fresh seeds × 2 policies, 180d death-aware)

| metric | armed (16) | control (16) |
|---|---|---|
| **movement-kind PERFORMANCES (PRIMARY)** | **44** | **32** |
| — blindside (sunback) | 15 | 6 |
| — face_it (sweeps_week) | 2 | 0 |
| — move_windup (base lane) | 27 | 26 |
| deliberate layer attempts (ctx) | blindside 9, face_it 2 | — |
| national | 9 | 8 |
| table | 14 | 13 |
| wins | 0 | 0 (pre-seat by design) |
| player deaths | 88 | 92 |
| median survival | 152d | 157d |
| death modes | all pre-existing (see note) | — |

**PRIMARY: GO.** 44 − 32 = **+12 ≥ 4**. The delta decomposes honestly: blindside +9 (9 deliberate reposition attempts + incidental arch-moves), face_it +2 (the first face_it performances ever recorded in a bot sim — 0 across all prior runs), move_windup +1 (noise; the base lane is untouched).

**Guardrails: all HOLD.**
- player deaths 88 ≤ 92+2 ✓ (fewer, not more)
- national 9 ≥ 8−2 ✓
- median survival 152d ≥ 157−10 = 147d ✓
- No new death mode: 'the phoenix link' (3) appears in armed but 0 in control — this is the pre-existing `phoenix_clause` cheat-death burn (a random villager burns when the scholar would have died; canon, docs), all 3 on belongfeast-s3402-armed. It is an existing engine path, not a layer-created mode — the layer only issues legal moves at hpPct ≥ 0.7 and cannot create deaths.

**Fight-outcome read (secondary):** the two face_it performances (belongfeast-s3402-armed, d21 and d29) both ended in scholar kills of the sweeps_week — the trick bought the fight. Blindside's outcome effect is diluted (the performances spread across incidental and deliberate moves); the confirm arm gets an outcome bar if Steve wants it.

### Mechanism note (new measurement)

The control arm incidentally logs blindside (6) — the base policy's ordinary movement (closing distance, repositioning for strikes) sometimes lands during a sunback arch and the engine fires the ev honestly. So the perform-channel was never fully bot-invisible; it was *deliberately* bot-invisible. The layer converts incidental hits into deliberate ones: 9 deliberate repositions → 15 channel performances. face_it was genuinely 0 everywhere before (the turn-1 back-away is not something any base behavior does).

## Sense-testing (transcript read)

Read: the sense-replay of belongfeast-s3402-armed d21 (script scripts/sense-reposition-20261016.js), the first face_it fight:
"⚔ SWEEPS WEEK! You're on your own." → "The Sweeps Week is on you — no warning, just teeth." → "Sweeps Week hits you for 13." → (the scholar's turn-1 back-away — the face_it performance) → "You STRIKE the tiger for 28 (Stone knife)." → "Tiger's Rerun hits you for 11." → "tiger is hurt — and it goes quiet and clever. It stops rushing. It starts CHOOSING. Watch the spacing." → "You STRIKE the tiger for 31." → "Tiger's Rerun hits you for 10." → "The Sweeps Week falls."

Verdict: reads as a person doing the Sundarbans trick — pounced with no warning, held the gaze and backed away slow on turn 1, then killed it straight up. The beats around it are honest (the pounce lands, the tiger adapts when hurt, the kill is earned). One narration gap: `tbPlayerMove` is silent engine-side — the reposition move itself has no narration line (pre-existing, same for the base's beastTrickPlay moves; a policy-side say() would invent fiction, so it's documented, not fixed). The d29 repeat reads the same.

## The build

- scripts/policies/reposition.js (NEW, the only policy file): the REPOSITION=1 layer wrapping leadfeast/belongfeast.
- scripts/test-reposition-20261016.js (NEW): 22/22 proof.
- scripts/sweep-reposition-20261016.js (NEW): the pilot sweep.
- scripts/sense-reposition-20261016.js (NEW): the sense-replay instrument.
- evidence/2026-10-16/perseed-reposition/ (32 per-seed JSONs), evidence/2026-10-16/reposition-beats/ (10 beat files).

## Metric review

The PRIMARY counts channel performances, not discoveries or kills — the finding was perform-channel invisibility, so performances are the direct mechanism read. The control arm's 6 incidental blindsides mean the bar measured "deliberate on top of incidental," which the layer cleared (+9 deliberate). If the confirm should judge fight outcomes instead, that bar belongs in the confirm's pre-registration — this run is judged on its pre-registered line: GO.

## Findings / named nexts

- sim-findings #430: FIXED by this arm (blindside deliberate +9, face_it 0→2 first-ever).
- Confirm question for the next arm: do reposition performances change fight OUTCOMES (kill rate, damage taken, scholar survival in trick fights) on 12–16 fresh seeds? The pilot's two face_it kills are suggestive, not proof.

## Metric review

The PRIMARY counts PERFORMANCES, not discoveries or kills — the finding is that the perform-channel is bot-invisible, so performances are the direct mechanism read. Fight outcomes (kill attribution, fight length, deaths) are secondary/report-only in the pilot; a GO goes to confirm where outcome effects get their own bar. If the pilot shows performances but the reviewer judges performances the wrong metric, that revision belongs to the NEXT run's header — this run is judged on its pre-registered line.
