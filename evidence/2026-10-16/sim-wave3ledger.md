# sim-wave3ledger — the named species' revived perform-channels (flesh-out loop ARM 2, 2026-10-16)

**Run:** flesh-out loop, run_id fleshout-20261016T2215Z (coordinator claim; axis scale-onramp blocking; sibling arm sim-arming = policy-side arming driver).
**Type:** GAME-CODE arm (bounded). scripts/policies/* OFF-LIMITS (sibling's lane).
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read. No new canon invented — the three named species' counter fields are canon data; the wave-3+ signature canon lives in MONSTER-WAVES.md's signature-mechanics sections.

## Claim-note verification (FIRST, before any build)

The coordinator's claim note said: "cliffhanger/sunback/sweeps_week have counter fields but no checkMonsterCounter switch case (dead perform-channel)" and directed verifying their waves "before committing to wave-4+ claims."

**Verified from src/data/monsters.json (proof WAVES section, data-driven): cliffhanger, sunback, and sweeps_week are all WAVE 1** — not wave-3+. The wave-4+ unmeasurability concern (readiness gates behind ebcdf397, 0/48 unlocks on the pre-seat substrate per sim-trickmatter 8f1f1c1d) does NOT apply to them. They are measurable on this arm's substrate.

**State of the tree on arrival:** the counterwire arm (44de021d, landed) already (a) added the three dead perform-kinds — `blindside` (sunback: move during the arch), `face_it` (sweeps_week: move away without fleeing), `eyes` (cliffhanger: strike during the lunge) — to checkMonsterCounter, (b) recorded performances per-monster on `f.trickLogByMid`, (c) passed `trickSummary(f)` into tbEnd kill attribution; the tricktag arm (de49bea3) made TB-path companion killing blows carry `by=<vid>` + trickSummary; the trickres arm (c77fbfb2) measured 131 trick resolutions on 16 runs. **The dead perform-channel is already fixed and measured.** This arm re-verifies on current master (which moved: journey deepening r14, readiness design call #4), fills the one remaining blank found by sense-testing, and runs a fresh-seed pilot.

**Correction to the trickres record (this arm's audit):** the trickres 16-run treatment sweep's trick-attributed kills were cliffhanger ~5–6 (eyes performances), sunback 0, sweeps_week 0 — NOT "sunback 11 / sweeps_week 3" (an early aggregation in this arm's notes counted non-trick kills by mistake; re-verified against the per-seed JSONs with the trick filter). Discoveries in that sweep: sunback 8 (6 taught + 2 observed), sweeps_week 6 (2 taught + 3 observed + 1 scholar-observed), cliffhanger 12 (8 observed + 3 taught + 1 scholar-observed) — and ZERO via='trick' for all three. The perform-channel resolves for eyes in live bot fights; blindside/face_it have never fired in a live bot sim (see Condition honesty below).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written before the pilot sweep)

**Question:** on current master, do the three revived perform-channels (blindside/face_it/eyes) resolve in live fights and attribute kills — and is any game-code change needed beyond the landed layer?

**PRIMARY (binding):** GO iff ≥2 counter-attributed kills of the wired species (cliffhanger, sunback, sweeps_week) in live fights on the 16-run treatment pilot. A miss is NO-GO (KILLED), never re-scored mid-run.

**Substrate:** pre-seat courtship, SEATDRIVE=0 EXPLICIT (per the 0215Z method note — uncomposed sweeps run pre-seat), FEASTSCALE_R13=1, policies leadfeast/belongfeast (tribfloor; TRIBFLOOR=1). NODEWITNESS unset (the three wave-1 species' observation channels are the core ones; nodewitness is a w4/5 add-on).
**Seeds:** 8 FRESH [991–998] × {leadfeast, belongfeast} = 16 runs/arm. FRESH = 0 per-seed filename hits across evidence/ (verified before selection). Control: paired identical seeds on the af818ee2 base archive (parent of the first counterwire game-code commit; 0/3 switch cases present — the dead perform-channel pre-state), via REPO=.
**Horizon:** 180d death-aware (death-aware, never fixed-window).
**Gates before spend:** proof RED→GREEN (each change + each measurement) · det-gate (instrument attached vs bare byte-identical) · SMOKE green.
**Guardrails:** det-gate trajectory-identical where counters don't fire (narration-only change is attribution-only); wall metrics (national/table/wins) hold within noise vs paired control.
**Per-seed JSONs:** evidence/2026-10-16/perseed-wave3ledger/ · beats: evidence/2026-10-16/wave3ledger-beats/ · sweep: scripts/sweep-wave3ledger-20261016.js · proof: scripts/test-wave3ledger-20261016.js.

## The build (the one remaining blank)

Sense-testing the existing discovery beats (SENSE-TESTING LAW) found a real narration bug in `discoverMonsterCounter` (game.js): the non-lethal villager observation channel (via='observed' — two survived encounters, the fire has a theory) fell through to the scholar's line **"You did the thing — and it worked."** Live example from prior beats (trickres belongfeast-s987-control, sunback via='observed'): the beat credited the scholar with performing a trick the village actually pieced together by watching. Misattribution of learning — the fiction is wrong.

Fix (game.js, discoverMonsterCounter viaLine): `via === 'observed'` now reads **"Two survived encounters — the fire has a theory."** Narration-only; zero trajectory effect. [needs-eyes]: this changes the counter-discovery narration beat for the observed channel (the beat now names the village's learning honestly).

Everything else this arm needed was already landed by 44de021d / de49bea3 — re-verified, not redone.

## Condition honesty (fight-shape, execensus finding)

The execensus finding (65% conditions-never-met) was about **wave-4/5 field-AI gates** (congregation/argue needs round%3===0; eater/poison needs stocked spoiled meat; editor/continuity needs 2 strikes) vs one-round hyper-lethal fights — unmeasurable on this substrate (wave 4 held behind readiness, 0/48 unlocks). **Out of this arm's scope by substrate, not by choice.**

For the three wave-1 species on the TB path, the revived conditions ARE round-1-meetable — proven empirically for eyes, which resolves in live bot-policy fights (strike-during-windup is something the bots do naturally; this pilot's treatment shows eyes-attributed cliffhanger kills). **blindside and face_it have never fired in a live bot sim** (0 performances across the trickres 16-run sweep and this pilot's treatment runs, while the same-shaped `move_windup` ev fires for other species — bots move, just not during a sunback arch or away from a sweeps_week on turn 1).

Why: sunback's "Sunflash Lunge" carries minRange 2 + a 2-round windup (the arch is rare when the scholar hugs melee); sweeps_week's "Sweeps Pounce" is firstTurn-only (the window is turn 1, when bots strike). A human player CAN meet both (move during the visible arch; back away on turn 1) — the telegraphs are honest and the actions are legal every round.

**Design call (mine, documented for Steve's overrule per the 2026-10-07 rule): DOCUMENT, don't widen.** Widening blindside/face_it to bot-doable triggers (e.g. "survive the arch", "end the round at distance") would divorce discovery from the taught trick — the reveal texts teach "move to its shadow side" and "back away slow"; discovering them by standing still teaches the wrong lesson and breaks the perform-channel's contract ("You did the thing — and it worked"). The knowledge game already carries these counters (taught/observed channels: sunback 8, sweeps_week 6 discoveries in the trickres sweep); only perform-discovery is bot-invisible. The bot-invisibility is a policy-lane question (bots don't reposition in TB), filed as a finding below — not a game-code gap. Steve-call #411 (win-truncation of the trick game) stays OPEN — orthogonal to this arm.

Field-path actuation for these three stays impossible-by-design (counterwire arm's documented call: the abstract field model has no shadow-side/facing/called-shots) — documented, not faked; not re-litigated here.

## Results

### Proof: scripts/test-wave3ledger-20261016.js — 17/17 GREEN
- WAVES: all three species wave 1, counter kinds eyes/blindside/face_it, hint+reveal present.
- KINDS: synthetic TB fights — all three discover on current master; face_it does NOT fire on approach; f.trickLogByMid records performances when known.
- RED (static): af818ee2's checkMonsterCounter has none of the three cases (dead perform-channel pre-state); current master has all three.
- SENSE: 'observed' discovery reads "the fire has a theory", never "You did the thing"; 'trick' keeps the scholar's line; 'scholar-observed' keeps the first-person pattern.
- DET-GATE: instrument attached vs bare game byte-identical on identical seeds (3/3).
- FIX-DET: the viaLine fix vs reverted, identical-seed 60d pair — byte-identical trajectories (41a8bf14 == 41a8bf14). Narration-only, zero state effect.
- SMOKE: 20d pre-seat run completes green.

### Pilot sweep: 16 treatment + 16 paired-control runs

| metric | treatment (16) | control (16) |
|---|---|---|
| counter-attributed kills, wired species (cliffhanger/sunback/sweeps_week) | **7** (all cliffhanger, via eyes performances) | **0** |
| counter-attributed kills, all species | 114 | 4 (all hummice via the contest path — a separate pre-existing channel, not the TB layer) |
| national / table / wins | 8 / 16 / 0 | 8 / 15 / 0 |
| median survival | 149d | 123d |

**PRIMARY: GO.** 7 ≥ 2 — the revived eyes channel resolves in live fights and attributes kills on current master; the paired control (dead perform-channel) scores 0 on the wired species. Guardrails hold: wall metrics within noise (national 8=8, table 16 vs 15, wins 0=0 pre-seat by design); median survival 149d vs 123d (report-only; the control base predates the readiness gates, so wave-4/5 exposure differs — not a layer effect).

## Sense-testing (transcript read)

Read: leadfeast-s993-treatment, beat 9 (the fixed observed-channel beat, live in this pilot):
"💡 COUNTER LEARNED — Highbeam Deer: MOVE, don't stare. When it goes still, the beam is coming — MOVE, don't stare at the light. Anything beats standing there: the freeze means it is already aiming. (Two survived encounters — the fire has a theory.)"
Verdict: reads as the village learning together — the fire has a theory — not a dice roll, and no longer misattributed to the scholar. The trick + reveal name a real behavior; the parenthetical names the real channel. Prior beats (trickres evidence, all three named species) read honest too: the scholar's "You lived to tell it — twice — and now you see the pattern" and the haven's "Someone at the haven knew the trick." The one beat that failed the read was the observed-channel misattribution — fixed by this arm.

## Metric review

Every evidence file carries one. The PRIMARY counts only trick-attributed KILLS of the three wired species — the strictest honest reading of "the signatures represented and resolvable." Non-lethal resolutions (flee/dismiss) are the wave-3+ layer's fiction and are excluded here by design (the three wave-1 counters resolve in the scholar's TB path, where the outcome is a kill). If the pilot shows kills but the reviewer judges kills the wrong metric for wave-1 tricks, that revision belongs to the NEXT run's header — this run is judged on its pre-registered line.

## Findings / named nexts

- **Filed to sim-findings (policy lane):** the competent TB policies never reposition — `blindside` (sunback) and `face_it` (sweeps_week) have never fired in a live bot sim (0 performances across 32 treatment runs: trickres 16 + this pilot 16), while the same-shaped `move_windup` ev fires for other species and `eyes` (cliffhanger) kill-attributes regularly. The conditions are honest and human-meetable; the bots just don't move in TB. Whether the policy lane should teach bots to reposition (and whether that changes fight outcomes) is a policy-arm question — scripts/policies/* is off-limits to this arm.
- Steve-call #411 (win-truncation) stays OPEN.
- The wave-4/5 execution-window question (execensus gate/fight-shape mismatch) remains the blocking item for the counter/trick game on the winning substrate — it needs the readiness-satisfying substrate (sibling sim-arming arm's question) before any w4/5 execution arm is measurable.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-16/perseed-wave3ledger/*.json' --metrics national,table,wins,exiled` fired 2 LOUD lines — BOTH EXPLAINED, no baseline roll:
- table 16→31: n-mismatch (32 files = 16 treatment + 16 control vs 16-run baseline).
- wins 16→0: substrate-mismatch (baseline = composed-driver full win-side stack; this arm runs pre-seat by design per steve-call #411 — own controls 0=0).
Baseline kept.
