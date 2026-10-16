# sim-counterwire — EXTEND THE LEDGER CONVENTION TO WAVE-3+ (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop, run_id fleshout-20261016T0715Z (coordinator claim; axis scale-onramp blocking).
**Type:** GAME-CODE arm. Named lever from evidence/2026-10-16/sim-counterwired.md ("Named lever" section) — the diagnostic (instrument-only, zero src/js) found wave-3+ counterplay engine-real but unwired: 6/9 wave-3 species + all wave-4/5/6 species have no knowledge representation, and 3 wave-1 perform-kinds are dead.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (canon drift noted below — doc is stale vs data: 56→72 defs, 14→17 counter kinds, wave-4/5 roster drift, wave-6 unlisted; NOT rewritten here).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the diagnostic proved villages learn fast and fight dumb (348 discoveries, 3 counter-executed kills; wave-3+ tricks discovered 10×, executed 0×). If the 6 unwired wave-3 species + wave-4/5 counterplay concepts get knowledge representation + field-AI actuation, do counter-executed kills appear and does the field death rate move?

**PRIMARY (binding):** GO iff BOTH hold on the 16-run confirm sweep —
(a) ≥1 counter-executed kill of a wave-3+ species (trickSummary-attributed, trickLog non-empty, mid wave ≥3), AND
(b) mean field deaths/run WITHIN wave-3+-reached runs is lower on treatment than on identical-seed control (any downward movement; n is small, no significance bar — the pilot showed 0 executions, so any execution + any death-rate reduction is a real signal).
A miss is NO-GO, never re-scored mid-run.

**Substrate:** default-ON win-side stack (SEATDRIVE unset = ON; wins truncate — execution-rate comparisons restricted to wave-3+-reached runs). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1. Policies: TF.leadfeast / TF.belongfeast (tribfloor exports; same stack as the sibling patrolwave arm).
**Seeds:** pilot 8 FRESH [702,703,704,705,708,709,710,719] × leadfeast = 8 runs/arm; confirm 8 FRESH [711,712,713,714,715,716,717,720] × {leadfeast, belongfeast} = 16 runs/arm. FRESH = 0 per-seed filename hits across evidence/ (verified by perseed-dir listing before selection).
**Horizon:** 180d death-aware (wave-3 unlocks ~d40, wave-4 ~d76 — death-aware, never fixed-window).
**Control:** base-commit archive (pre-change HEAD) loaded via REPO= — identical seeds, identical policies, identical env; only the layer differs.
**Gates before spend:** proof RED→GREEN (each change + each measurement) · det-gate (sweep instrument-vs-bare byte-identical on identical seeds) · SMOKE green on 20d run with live trick-execution capture.
**Guardrails:** national ≥ control − 2 · wave reach not worse · no new death mode · median survival report-only (win-truncation).
**Per-seed JSONs:** evidence/2026-10-16/perseed-counterwire-arm/ (exact numeric keys national/table/won/exiled + wins alias) · beats: evidence/2026-10-16/counterwire-arm-beats/ · analyzer: scripts/analyze-counterwire-20261016.js.

## The build

### 1. Representation: villagerTrickDefs promoted to waves 3–5 (game.js)
- Added 26 entries (6 wave-3: redactor, gavel, focus_group, terms_of_service, callback, ad_break; 10 wave-4; 10 wave-5), each {trick, reveal} canon-faithful from the species' `weaknesses` data + signature engine mechanics (sigW3a/b/c, sigW4, sigW5). Wave-6 left out (canon-doc silent; documented blank).
- Effect: `_trickObservation`'s gate (`!mdef.counter && !defs[mid]`) now opens the non-lethal observed channel for all 26 — two survived encounters → `state.villagerTricks[mid]` → `villageKnowsTrick` sees them → field-AI LEARN-VS-FIGHT judgment + `villagerTrickAction` gates.
- Deliberately NOT `counter` fields on the defs: the `counter` field is the waves-1–2 ledger convention (monsterCounterKnown requires it; counter-known kills score 2 ledger points). See scoring decision below.

### 2. Actuation: 15 per-species gates in villagerTrickAction (fieldFights.js) + resolution
Wave-3 (engine-real field ports exist in sigW3a/b/c):
- redactor → wait 'redactor-quiet': consecutive quiet rounds tracked on rec; ≥2 → its attacks come thin (halved); ≥3 → it starves out of the fight (mFlee).
- gavel → 'confess' when the trial is active: the verdict falls lighter (halved); witnesses remember (state.gavelConfessions++ — the record cost).
- focus_group → 'bore': three consecutive deliberately-boring rounds → the murmur loses interest and LEAVES (mFlee).
- terms_of_service → 'examine': two examining turns → the loophole clause found → DISMISSED (mFlee).
- callback → 'farewell' (once): speak the goodbye properly → the face can't borrow a swing from someone mourned (face-shift damage bonus disabled for the fight).
- ad_break → 'look_away' on break rounds: unwatched, the break is dead air (the 6% heal never lands).
Wave-4 (subset with real abstract-model hooks):
- strike → 'meet_demand' (costs 1 real food + the action, reactive at vHp<60%): the picket stands down a round (no attack).
- suburb → 'leave' (round 1): navigation is victory (vFlee — the correct move, narrated).
- eulogy → 'contradict': each contradiction restores a verse; 3 true contradictions → the story dismisses the villager kindly (mFlee, no loot — a better ending).
- algorithm → wait 'algorithm-tank': two rounds of deliberately soft predictions (its damage halved); then strike while the model is mushy.
- congregation → 'argue' (round before the beam): bound by liturgy, it MUST engage the argument — the beam never falls.
Wave-5 (subset):
- nielsen → wait 'nielsen-boring': the ratings mechanism already rewards dealing nothing (−6/round); the gate makes the villager fight boring until the eye closes, then strike.
- spoiler → 'prone' (the round before fulfillment): fall prone deliberately — the prophecy is satisfied cheaply, the voiceover gains no weight.
- network_note → 'bad_note' (once): plant "the wolf should be SMALLER" — the next buff note misfires into uselessness.
Knowledge-only (recordable, not actuated — documented, never faked): eater, influencer, audit, reunion, cancellation, editor, rerun, timeslot, finale, finale_crew, finale_opening. Reasons: no abstract-model hook (needs grid/adds/audience/journal/abilities), or the field port inverts the TB mechanic (audit, editor — filed in sim-findings as port-inversion findings, out of this arm's scope).

### 3. Scoring decision (Steve 2026-10-07: figure it out yourself — decided, documented for overrule)
**The reward is fight-lethality reduction, NOT ledger points.** Why:
- Waves 2–3 bars are the only ledger consumers today; wave-4/5 unlocks now gate on villageStandingTotal (t4/t5) + faced, not ledger points (MONSTER-WAVES.md) — ledger points for w3+ kills would be dead currency, decoration.
- The patrol arm's lesson: the value of the counter game is not dying.
- The diagnostic showed the ledger bonus already flows on knowledge alone (335 post-discovery w1/w2 kills) — more ledger would inflate unlocks without changing a single fight.
- Undertale: the reward is the lived trick — the redactor starving out, the eulogy dismissing you kindly, the suburb walked away from. It flows into survival, and via survival into scale. Measured by the GO metric (field-death-rate movement within wave-3+-reached runs), not by points.

### 4. The 3 dead perform-kinds (game.js checkMonsterCounter)
- `blindside` (sunback): move during the arch (windup). The shadow-side nuance isn't engine-observable (no sun vector in TB) — the reveal text teaches it; the discovery fires on the arch-move.
- `face_it` (sweeps_week): move away without fleeing (backing away slow, gaze held). Observable via the per-monster move ev (`!ev.closer`).
- `eyes` (cliffhanger): strike during the lunge (windup). Called-shot nuance lives in the reveal text.
All three are kind-driven (no per-monster branches), consistent with the existing switch. Villager field-AI execution for these three stays impossible (abstract model has no shadow-side/facing/called-shots) — documented, not faked.

### 5. TB-path attribution (game.js tbEnd)
- The kill loop now passes `this.trickSummary(f)` as the `detail` arg (was: no detail) — counter-executed TB kills are attributed in waveKillLog.
- checkMonsterCounter now records performed trick kinds on `f.trickLog` on every hit (even when already known — discovery is one-time, performance is per-fight). Fight-local only; det-gate verified byte-identical trajectories.
- Channel stays 'player' (honest: the kill happened in the scholar's TB combat path). Per-fighter last-hit attribution in TB (companion-killer quirk from sim-findings) remains open — documented, not fixed here.

## Results

PENDING — implementation in progress.

## Metric review (§14)

PENDING.

## Convergence state

scale-onramp: converging (game-code arm — implements the named lever from the diagnostic).

## Blank-fill record

PENDING.
