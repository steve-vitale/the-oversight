# Scale-wall r16 arm B — wave-1/2 damage-number audit + W2-DISENGAGE pilot

Run: fleshout-20261013T1930Z-r16, arm B (sim-dmgmath). Worktree: ~/workspace/worktrees/sim-dmgmath.
Axis: scale-onramp (blocking). Canon: docs/CANON.md, docs/MONSTER-WAVES.md read first. Highbeam Deer 160 HP untouched; no monster stats touched anywhere in this run. No game-code changes at all — policy-side lever + tooling only.

## Pre-registration (written BEFORE the mitigation pilot)

- Lever: W2-DISENGAGE (scripts/policies/competent.js, gate COMPETENT_W2DISENGAGE=1, default OFF) — map-level decline of visible wave-2 top-4 matchups (review_drone, bright_idea, mirror_stag, moderator) when scholar armor P<20 and the knowledge-gated damage race is lost (codex→lore→pessimistic prior, roundsToDie < roundsToKill×1.3 or dead-in-two, same margin as r3). Forced fights (wanderer contact) keep legacy behavior. Orthogonal to COMPETENT_FIGHT_ASSESS/DPS_RACE/DIRECTIONAL_FLEE (all unset in both arms).
- Primary metric: median survival days. Baseline (8 runs, seeds 11/22/33/44 × belongseek/leadcourt, 150d death-aware, tip 5016b35d): **84d**.
- GO: median ≥ **94d** (baseline + 10d) AND no national regression (baseline national **4/8**, table 0/8, wins 0/8).
- KILL: median ≤ 86d (no effect) OR national < 4/8 (regression).
- Horizon: 150d death-aware (dead villages stop). Seeds/policies identical within pairs. No confirm spend without a GO pilot (§9).
- Honest expectation recorded here: the baseline measured only 4 top-4 fights in 8 runs and zero of them were lethal, so this lever is likely a clean fast KILL — the audit below is the finding either way.

## Step 1 — the instrument

`scripts/dmg-audit-20261013.js` (attachDmgAudit): wraps the engine's fight choke points — startCombat → open, tbDamage → accumulate actual landed damage (return value passed through faithfully), tbEnd → close — plus tbAfterPlayerAction (player rounds) and tbMonsterTurn (monster actions). Records are keyed by tbfight OBJECT identity (closeIfAbandoned + ensureOpen): fights can open via startCombat OR direct tbfight assignment (encounters/justice/party arenas), and the barrier-push flee path DISSOLVES fights (over=true, result='dissolved', tbfight=null) without calling tbEnd — the instrument closes those honestly as 'dissolved' instead of mislabeling them 'superseded'. Per-fight record: mid, wave, veteran, day, armorP, forced (pendingMonsterId = wanderer walked into you), atHaven, php start/max/end, monster HP start/count, playerRounds, monsterActs, dmgDealt/dmgTaken/partyDealt/partyTaken, firstBlood (ambush signal), result, playerDied (fighter down OR scholar HP 0 at close — catches real deaths; cheat-death saves restore HP and read alive), derived monsterDPR/playerDPR/roundsToKill/roundsToDie, and a 60-line say() transcript for fights that went down or below 30% HP (sense-test). Two instrument bugs found and fixed during the run, both verified by re-run: (1) playerDied missed real deaths when tbFighter('p') was null at close (the paparazzo kill); (2) the dissolve path left dangling records mislabeled 'superseded' (80 of them — the barrier-push flee is the systematic source). `scripts/sweep-dmgaudit-r16-20261013.js` is the sweep driver (wall metrics via scale-repro + stdSnapshot, decline counters from policy ctx). `scripts/test-w2disengage-r16.js` proves the lever mechanism (11/11: gate-OFF inert, gate-ON skips all 4 top-4 unarmored, no skip when P≥20 or non-top-4, no leaked gate state).

## Step 2 — baseline measurement (grounding the r14 static audit)

8 runs, tip 5016b35d, final instrument. Wall: national **4/8** · table 0/8 · wins 0/8 · wave 3 reached · median **84d** / max 150d · exiled 0/8 · vests 0. (Current tip is much kinder than r13's 0/8; matches r15's 4/8 on ed6852d7.)
Death causes (sampler): monster:combat 48 (kills) · villager:combat 20 + villager:monster 5 + monster:villager combat 8 = villager-side monster deaths · villager starvation 5 · expedition 4+1 · wound 2 · contest 1 · The Understudy 1. Scholar successions (bearerDeaths): **37** — cause UNATTRIBUTED (telemetry gap, see blanks: the sampler carries zero player-kind keys). 1 scholar death directly observed at a fight close (paparazzo, leadcourt s11, day 75, armorP=30, took 102 over 15 rounds).

Per-fight (104 wave-1/2 fights): won 58 · lost 26 · routed 20. 'lost' = the scholar went DOWN and maybeCheatDeath held (finite: molt once/week + strips all gear, second_wind, phoenix link) — 25 of 26 survived; 1 died.

THE r14 QUESTION, ANSWERED WITH MEASURED NUMBERS:
- Top-4 fought **4 times in 104 fights**. Zero 3-hit kills. The 3 moderator fights ran 9–14 rounds (dmgTaken 85–111, armorP 0–17, dmgDealt 0 — the scholar healed/fled through, went down, cheat-death held, survived); bright_idea routed before any action.
- Fights with measured roundsToDie ≤ 3 (the 3-hit-kill signature): **5/104** — gallowdeer ×3 (rD 0.9–2.7, armorP 2–10, took 77–97 in 2–3 rounds), paparazzo (1.7), voice_mimic (2.5). ALL ended 'lost'; 4 of 5 scholars survived, 1 died (the paparazzo above — the only observed scholar fight-death in 8 runs).
- Measured monster DPR/round vs the r14 static mean: hushwolf 3.4 vs 14.5, belltoad 4.1 vs 15, gallowdeer 15.2 vs 25, moderator 8.8 vs 29, understudy 3.3 vs 26, paparazzo 11.5 vs 22. The static table assumed every attack lands every turn at max cadence; the engine's telegraphs + dodge + windups + mid-fight healing + cheat-death make the real game attrition, not burst.
- Worst single-fight damage: gallowdeer 184 over 11 rounds (armorP 0, ~17/round — the beam landing; r15 measured 83% land rate). Long attrition wars (up to 37 rounds), not burst kills.
- Vector: the 3 moderator fights were forced=False (walked-in, not wanderer-forced) — map-level decline is the engine-honest mechanism for exactly those.

VERDICT: the wave-1/2 damage numbers are NOT the wall's math face for the competent policy. The r14 3-hit kills don't materialize — scholars go down in ~25% of fights but finite cheat-death holds, and they survive 103/104. The wall is villager field deaths + unattributed scholar successions + village collapse (arm C's lane), not player damage math. "Slow and risky" holds in measured form: risky = you go down (burning molt/gear), slow = 10+ round attritions.

## Step 3 — W2-DISENGAGE pilot → KILLED AT PILOT

After-side (COMPETENT_W2DISENGAGE=1, identical seeds): national **3/8** · table 0/8 · wins 0/8 · median **84d** (byte-identical to baseline) · 105 w12 fights · w2dSkipped=**6** (mechanism fired: seeds 33/44, both policies).
Pre-registered GO needed median ≥ 94d AND national ≥ 4/8. Result: median 84d (≤ 86d KILL line), national 3/8 (regression vs 4/8). **KILLED AT PILOT**, no confirm spend.
Honest diagnosis: the mechanism is proven (6 real skips, proof 11/11) but the effect is invisible — top-4 fights are 4/104 and never lethal, so declining them can't move survival. Per-seed noise: belongseek s33 died 52d vs 87d baseline (the skip rerouted the scholar into a worse path — declining fights is a FOOD decision, r3's lesson repeated); leadcourt s33 reached national at 117d vs 150d baseline (also national). The lever is kept behind the default-OFF gate as a proof-tested instrument (r1/r2/r3 precedent) — no game-code changes, no [needs-eyes] (policy sim instrument only).

## Step 4 — sense-test (read as a player)

The paparazzo kill transcript (leadcourt s11, day 75, armorP=30 — the run's only observed scholar fight-death): the scholar strikes for 14 ("📺 +5 style — solid hit"), the paparazzo answers with Flash Photography (6–9 through P=30 armor absorbing 10–12), then the stun-lock: "FLASH. The world goes white — you're frozen mid-step. (Prediction 4/4 — it learns your dodge.)" / "The shutter doesn't even bother aiming. It knows. (UNAVOIDABLE flash — break line of sight or eat it.)" / "You're frozen — you can't move. (stunned)". Fifteen rounds of this, then "📖 The Codex turns a page on its own. Onni Korhonen is dead. You didn't ask. It knew." / "🕯️ Onni is dead — and the dead hold no treaties. Every link Haven has shakes."
Verdict: the death reads as UNAVOIDABLE, not "slow and risky" — a stun-lock with explicitly-labeled unavoidable damage and no telegraphed escape offered in the narration. But it is 1/104 fights and the scholar wore P=30; the other 103 fights read as the intended attrition (telegraphed heavies, dodgeable, healable, fleeable). The 3-hit-kill question is answered: the math doesn't deliver burst kills in practice; the one burst death came from a stun-lock, not raw damage numbers.

## Wall numbers (this run)
national 4/8 (baseline) → 3/8 (pilot, killed) · table 0/8 · wins 0/8 · wave 4–5 unlocks 0 · median 84d / max 150d · exiled 0/8 · vests 0 · death causes above · 37 scholar successions (unattributed) · 25 villager monster-deaths.

## Blanks
FILLED: r14's "wave-1/2 damage numbers vs slow-and-risky" (measured: not the wall; 5/104 3-hit signatures, 4/5 survived); per-fight damage instrument (dmg-audit-20261013.js, dissolve-aware, identity-keyed); W2-DISENGAGE lever (killed at pilot, kept as gated instrument); instrument bugs (playerDied null-fighter miss; dissolve→superseded mislabel).
OPEN (appended to sim-findings.md): scholar-death cause telemetry gap (37 successions, 0 attributed); legacy walk-to-edge flee burns thousands of turns without exiting (5410 flee ticks, 0 'fled' results); paparazzo stun-lock as the only observed unavoidable scholar death.

Convergence: scale-onramp stays the blocking axis. The math half of the wall is now measured and closed — fight selection + villager field survival (arm C) remain.
