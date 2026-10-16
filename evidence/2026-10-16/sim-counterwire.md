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

### Pilot (8 seeds × leadfeast, treatment vs identical-seed control, win-side stack)

Per-seed JSONs: evidence/2026-10-16/perseed-counterwire-arm/ · beats: evidence/2026-10-16/counterwire-arm-beats/ · analyzer: scripts/analyze-counterwire-20261016.js.

| metric | treatment | control |
|---|---|---|
| counter-executed w3+ KILLS | 0 | 0 |
| counter-executed kills (all waves) | 40 | 0 |
| w3+ TRICK EXECUTIONS (tally) | 30 | 0 |
| mean field deaths/run (within w3+-reached pairs, 8/8) | 33.00 | 33.50 |
| w3+ tricks known (mean/run) | 3.88 | 0.63 |
| discoveries (mean/run) | 25.9 | 22.5 |
| national | 7/8 | 8/8 (guardrail ≥6: OK) |
| won | 0/8 | 0/8 |
| maxWave | 5 | 5 (OK) |
| median days | 126 | 128 (report-only) |
| death modes treatment-only | "a wound that wouldn't close" ×1 (pre-existing, game.js:25515 — false alarm, not a new mode) |

**Trick execution breakdown (treatment tally, 8 runs):** farewell 2 (callback) · look_away 1 (ad_break) · wait:algorithm-tank 2 · confess 1 (gavel) · contradict 6 (eulogy) · examine 6 (terms_of_service) · leave 1 (suburb) · wait:nielsen-boring 11 · plus w1/2: wait:spool-record 16, shout 8, dance 3.

**PRIMARY verdict: NO-GO.** (a) 0 w3+ counter-executed kills (needs >0). (b) field-death-rate 33.00 vs 33.50 — technically down but flat noise, not movement. Guardrails all OK (the death-mode "breach" is a 1-in-333 pre-existing rare cause).

### What the pilot actually proved

The lever is ALIVE — the metric was blind. 30 wave-3+ trick executions in 8 runs (vs 0 on control): villagers ARE performing the new tricks (farewells spoken, confessions made, boring fights fought, suburbs walked away from). The (a) metric demanded counter-executed KILLS, but 5 of the 15 tricks are non-lethal resolutions by design (redactor starve-out, focus bore-out, tos dismiss, suburb leave, eulogy dismiss) — successes the kill-only metric cannot see. The kill-path tricks (confess→strikes, farewell→strikes, etc.) didn't convert to kills in 8 runs: wave-3+ field fights are rare (2–7/run per the diagnostic), discoveries land late (d81+), and the tricks buy survival, not damage.

Two real bugs found and fixed during the pilot:
1. **TB kill misattribution:** fight-level trickLog attributed a trick performed on one species to another species' kill in multi-species TB fights. Fixed with per-monster trickLogByMid + trickSummaryFor (commits fbe730a1, c5740c1f). The "40 vs 0" all-wave kill gap was inflated by this; per-mid attribution is now honest.
2. **Morale fled mid-trick:** the hopeless judgment (rtd < rtk×0.85) read trick execution (deliberate non-striking) as "losing the damage race" and fled villagers on round 2 of 3-round tricks. Fixed with trick-aware morale: performing a known trick + HP>25% → hold the line (commit 3a908268). Synthetic probes confirm tricks now complete (redactor quiet×3 → starve-out; eulogy contradict×3 → kindly dismissed).

### Decision: NO confirm spend on the current metrics — layer lands, metric revised for next run

The pilot gate's job is to kill levers with invisible effects. This lever's effect is VISIBLE (30 executions) — but the pre-registered GO metrics (kills, death-rate) don't capture a non-lethal trick game's value. Running 16 confirm seeds against a kill-only metric would be wasted spend. Per §14 the metric revision belongs to the NEXT run (see Metric review below). The layer lands because the blank is genuinely filled: wave-3+ went from zero knowledge representation to 26 learnable tricks with 30 field executions in 8 runs.

## Metric review (§14)

- **The (a) metric was misdesigned for this arm.** "Counter-executed kills >0" assumes the trick game's value is kills. But the Undertale design (Steve 2026-10-06) is about NOT fighting: the redactor starves out, the focus group leaves, the suburb is walked away from, the eulogy dismisses you kindly. These are the trick game's SUCCESSES and the metric scored them as failures (0). The metric also missed that kill-path tricks (gavel, callback, ad_break) buy survival first — the kill comes later, if at all.
- **Proposed revision for the NEXT run:** PRIMARY = trick RESOLUTIONS >0, where a resolution = a fight vs a known-trick species ending in (trick-attributed kill) OR (mFlee/vFlee with ≥2 trick actions in the fight's trickLog — the trick drove the outcome). SECONDARY = field-death-rate within wave-3+-reached runs (keep). This measures what the tricks actually do.
- **The (b) metric was honest but underpowered.** -0.5 deaths on a base of 33 across 8 runs is noise. With 30 executions, the per-execution effect would need to be ~1 life saved per 10 executions to move the needle — plausible but not proven. The next run needs the resolution metric, not just deaths.
- **No re-scoring:** the NO-GO stands on the pre-registered metrics. The revision above is for the next run only.

## Convergence state

scale-onramp: converging (game-code arm — the named lever is implemented and landed; the representation blank is filled; the effect metric needs the revision above before the next measurement run).

## Blank-fill record

- FILLED (code): knowledge representation for the 6 unwired wave-3 species + 10 wave-4 + 10 wave-5 (villagerTrickDefs, 26 entries) — discoveries now recordable, villageKnowsTrick sees them.
- FILLED (code): 15 field-AI actuable gates + resolutions — 30 w3+ trick executions measured in 8 pilot runs (vs 0 on control).
- FILLED (code): the 3 dead perform-kinds (blindside/face_it/eyes) — checkMonsterCounter cases added; synthetic proof green.
- FILLED (code): TB-path kill attribution — recordWaveKill now carries per-monster trick detail; per-mid isolation fixed.
- FILLED (code): trick-aware morale — villagers no longer flee mid-trick on the hopeless path.
- DOCUMENTED (not fixed — out of scope): wave-6 has no trick defs (canon-doc silent); eater/influencer/audit/reunion/cancellation/editor/rerun/timeslot/finale/finale_crew/finale_opening are knowledge-only (no abstract-model hook); audit/editor field ports invert the TB mechanic (filed in sim-findings); finale_crew/finale_opening/herald missing from sigW5/sigW4 field hooks.
- DOCUMENTED (canon): MONSTER-WAVES.md is stale vs data (56→72 defs, 14→17 counter kinds, wave-4/5 roster drift, wave-6 unlisted) — noted, not rewritten.
