# sim-learnfight — LEARN-VS-FIGHT default on village-defense channels

**Run:** sim-learnfight (ARM, flesh-out loop) — scale-onramp axis, 2026-10-16
**Axis:** scale-onramp (blocking). **Lever:** new policy `scripts/policies/learnfight.js` (LEARNFIGHT=1, default OFF), zero src/js, plus a policy-side `ctx._learnFight` extension in `scripts/policies/competent.js` (the proven `_huntCommit`/`_w5Commit`/`_observeFarm` pattern — gate off = byte-identical, det-gate pinned).

## Context

- sim-observefarm was KILLED at pilot: scholar-expedition observation farming has no supply — trick-bearers never spawn as walk-up targets on expedition nodes (50 hunts, 0 engagements). The funnel's supply lives in the channels that come TO the village: raids via havenRaidTick, treeline stalkers, wild encounters at Haven (evidence/2026-10-16/sim-observefarm.md).
- Steve's LEARN-VS-FIGHT default (2026-10-13 design call): when facing a trick-bearing monster, the DEFAULT should be learning (observe, survive, farm the trick) rather than fighting to kill.
- The observation funnel: `noteScholarTrickObservation` fires on the scholar's own fight ending fled/routed/calmed (scholar in the fight, alive, beast alive at fight end) — 2 survived encounters per species → discovery into `state.villagerTricks`, narrated first-person, never silent.
- Party-aware rule (finding #353): any disengage/avoidance must NEVER abandon villagers mid-fight — witness, don't flee; hold when villagers are committed or take them with you. "Take them with you" has no honest verb in the engine (villager field fights are engine-autonomous and separate from the scholar's fight), so the layer HOLDS instead — documented here, not invented.

## The lever

When a wave-3+ trick-bearer (`Game.villagerTrickDefs()` keys, wave>=3) whose trick is undiscovered (`!Game.villageKnowsTrick(mid)`) comes to the village and the scholar faces it AT HAVEN (the village channel — raids, treeline stalkers, wild encounters at home; expedition fights are NOT touched, the observefarm channel stays dead), the scholar takes a WITNESS posture: disengages instead of engaging blade-first. The engine's own survived-encounter funnel teaches; the layer invents no knowledge (zero game-state writes — proof-pinned).

Witness-mark conditions (recomputed every player turn, `ctx._learnFight`):
- LEARNFIGHT=1, `unlockedWave() >= 3`, not during the table sequence
- scholar at Haven (`Game.playerAtHaven()`), scholar hp ≥ 50% (the base's honest 35% eject owns hurt fights)
- fight contains an undiscovered wave-3+ trick-bearer
- NO villager committed to the same fight (party-aware hold → `lfHeld`, once per fight; the mid-fight recompute also clears a stale mark if villagers join)

The competent.js extension fires on the new-fight branch only: honest narration ("You don't meet the X blade-first — not tonight. You give ground instead, watching it all the way... (witness posture)", descriptor via `monsterDisplayName`, article-doubling fixed), `lfWitnessed` counted once per fight, then the base's own `flee()`. The withdrawal PERSISTS across turns (`ctx._lfWitnessFight`): a single flee() only starts the walk to the edge — v1's one-turn flee was a lie (see below); the persistent withdrawal keeps giving ground until the fight ends or the mark clears.

V1 BUG (caught by the seed-161 sense-read, fixed before the pilot): the witness posture fired flee() only on the new-fight turn; from turn 2 the base fought normally — the beats showed "(witness posture)" followed by "You STRIKE the spool for 78" and "The Spool falls." on the ARMED side. `lfWitnessed` counted marks, not disengages. V1 results (4 runs, seed 161) are archived under `evidence/2026-10-16/perseed-learnfight-v1-broken/` + `learnfight-beats-v1-broken/` as the RED demonstration; the pilot below is V2 (persistent withdrawal, proof 61/61).

THE TRADE (pre-registered): the scholar forgoes the kill — the slain path's codex hint and the wave-4 gate's blood-standing point — for an observation. A fled wild (non-titan) monster melts away rather than lingering, so the village pays no gorge tax for the witness. Fleeing still counts as "faced" for the endgame deed bars.

## Pre-registered header (MEASUREMENT §§9–12, 14 — BINDING)

- **Design:** 8 fresh seeds [161, 272, 383, 494] (pilot) + [111, 222, 333, 444] (confirm) — verified 0 prior sweep-seed uses in evidence/2026-10-1* at proof time — x {leadfeast, belongfeast} x {control, armed}, 180d death-aware (dead villages stop, +10d tail max), identical seeds, own in-sweep control.
- **Substrate (both sides, exact):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 (the pre-seat stack, comparable to the whole w3drive/observefarm line). SEATDRIVE never set (explicit — pre-seat by design; the win-side stack truncates the trick game, steve-call #411 / sim-counterres 87338ba7).
- **PRIMARY:** wave-3+ trick discoveries (`counter_discovered` tele events for wave≥3 mids, per-seed count). Pilot bar: **armed ≥ control + 2**. Confirm bar: **armed ≥ control + 4**.
- **SECONDARY (report-only):** knowledge→execution conversion (counter-executed kills of observed species — waveKillLog trick flag × discovery-day), per-witness observation rate (`counter_observed` events / `lfWitnessed`).
- **Guardrails:** scholar combat deaths (mantle transfers) ≤ control + 1; village deaths (all recorded) ≤ control + 2; national ≥ control − 2; no new death mode (n≥3).
- **Report:** per-seed pair survival deltas, mantle-transfer counts, lfWitnessed/lfHeld (lever-live proof), witness-transcript sense-read.
- **Horizon:** 180d death-aware, per the question (trick learning needs the full wave-3 window; wave-3 unlocks ~d40).
- **PILOT GATE:** 8 pairs (seeds 161,272,383,494 x {leadfeast, belongfeast}) first. GO to confirm iff armed discoveries ≥ control + 2 AND scholar deaths ≤ control + 1 AND village deaths ≤ control + 2 on the pilot pairs. KILL at pilot otherwise: delete `scripts/policies/learnfight.js` per kill protocol, revert the competent.js `_learnFight` extension (zero trace — its only entry point is `ctx._learnFight`, which nothing else sets), keep instruments + evidence.
- **Metric binding (§14):** a miss is NO-GO, never re-scored mid-run. Metric doubts go under "metric review" below.

## Metric review

_(written before results: doubts about the metric itself)_

1. The primary counts the engine's real non-lethal observation funnel on the scholar's own village-channel fights. The villager field-fight channel (engine-autonomous) fires symmetrically on both arms — the primary measures the scholar-side delta only, which is exactly the lever.
2. The lever's ceiling is the trick-def set: 29 species (9 w3 + 10 w4 + 10 w5) × 1 discovery each — but the pre-seat substrate rarely reaches wave-5 (6/16 in sim-fieldfightsrc), so the practical ceiling is ~19. The +2/+4 bars are honest against control's natural rate.
3. The witness posture forgoes kills: if the counter-kill share secondary falls while discoveries rise, that's the designed trade, pre-registered. The wave-4 blood-standing point forgone per witness is the scale-onramp tension this arm measures.
4. `playerAtHaven()` is true within 1 node of haven — a wild encounter on the adjacent node counts as village-channel. The stalker "followed you" beat is exactly this shape; the boundary is engine-honest.

## Proof

`scripts/test-learnfight-20261016.js` — 61/61 GREEN (pre-sweep, layer present; 55/55 on v1, +6 persistence tests on v2):
- layerOn honesty (LEARNFIGHT=1/0/unset; dead/other gates do NOT arm this layer), composition integrity (ids match control ids, desc names the lever)
- learnLive gating (uw>=3 true incl. uw=5; uw=2 false; table-busy false; gate-off false)
- trickTargetOf (spool/redactor/reunion targeted when unknown; KNOWN skipped; wave-1/2 skipped; unknown mids skipped)
- villagersCommitted (alive villager → hold; fled/dead villager → no hold; monsters-only → no hold)
- wrapper contract (mark set on learn-fight; party-committed → hold + lfHeld=1; known trick → no mark; away-from-haven → no mark; hurt scholar → no mark; mid-fight villager join clears mark; gate-off → no mark)
- fight-side via the REAL competent.fight: witness fires (handled, lfWitnessed=1, honest "(witness posture)" narration naming the beast via descriptor); party-hold never fires it; gate-off inert; wrapper+extension end-to-end both directions
- WITHDRAWAL PERSISTENCE (v2): turn-2 of the same witness-fight keeps fleeing (no strike — strike-spy RED-pinned against the v1 bug, no re-narration, handle held); withdrawal stops when the wrapper clears the mark (base strikes); stale handle cleared on new fight
- det-gate: gate-off byte-identical to the naked tribfloor→windefer composition on seeds 161/272, 30d (pins the competent.js extension inert when the gate is off)
- instrument pins: `villagerTricks` written ONLY by `_trickObservation`; `counter_discovered` tele fires from the discovery funnel; layer file has zero game-state writes
- SMOKE: 20d both sides, markers honest, runs complete, policy ids correct
- KILL-PROTOCOL path: INFO-SKIPs cleanly (exit 0) with the layer file absent

## Results — PRIMARY GO but GUARDRAILS MISS → ARM KILLED AT PILOT

16 runs (4 seeds [161,272,383,494] x {leadfeast, belongfeast} x {control, armed}), 180d death-aware, pre-seat substrate (FEASTSCALE_R13+TRIBFLOOR+SUCCGRACE+RAIDDENSITY+WINPURSUIT+WINDEFER, SEATDRIVE never set). Per-seed JSONs: `evidence/2026-10-16/perseed-learnfight/` (16/16). Beat captures: `evidence/2026-10-16/learnfight-beats/` (16/16). V1 (broken) results archived under `perseed-learnfight-v1-broken/` + `learnfight-beats-v1-broken/`.

| metric | control (8) | armed (8) | bar | verdict |
|---|---|---|---|---|
| PRIMARY: wave-3+ trick discoveries | 21 | 26 | pilot GO ≥ control+2 (≥23) | **GO (+5)** |
| secondary: counter-kill share | 0.250 (4/16) | 0.400 (2/5) | report | 1.60x |
| secondary: per-witness observation rate | nc | 4.33 (65 obs / 15 witnessed) | report | lever live |
| median survival (all) | 134.0d | 146.0d | report | +12d |
| scholar deaths (mantle transfers) | 104 | 142 | ≤ control+1 (≤105) | **MISS (+38)** |
| village deaths (all recorded) | 322 | 369 | ≤ control+2 (≤324) | **MISS (+47)** |
| national | 8/8 | 7/8 | ≥ control−2 | **GO** |
| table invitations | 7/8 | 6/8 | — | report |
| wave-5 unlocks | 4/8 | 3/8 | — | report |
| wins | 0/8 | 0/8 | — | — |
| exiled | 0/8 | 0/8 | — | — |
| witness postures / party holds | 0 / 0 | 15 / 0 | — | lever live, holds never needed |
| new death mode (n≥3) | — | none | — | GO |

Pair survival deltas (armed−control): +5, +24, +0, +10, +43, +0, +29, +8. Wave-3 unlock days byte-identical both sides (the layer never moves the gate).

**Verdict per §14 binding + the pre-registered pilot gate: the primary passed (+5 ≥ +2) but BOTH death guardrails missed decisively (scholar +38, village +47). The lever does not go to confirm. `scripts/policies/learnfight.js` DELETED per kill protocol; the competent.js `_learnFight` extension reverted (zero trace — verified byte-identical to pre-arm); instruments (`scripts/test-learnfight-20261016.js` — INFO-SKIPs cleanly on the absent layer, verified — `scripts/sweep-learnfight-20261016.js`) + evidence retained.**

## Mechanism: the witness withdrawal is lethal against hostile trick-bearers

1. **The lever was live and the primary moved.** 15 witness postures across 8 armed runs (Ad Break, Buffering, Spool, Terms of Service, etc.), 65 wave-3+ observations (4.33 per witness), discoveries 26 vs 21 (+5). The funnel works — the scholar does learn from witnessing.
2. **But withdrawing from a hostile trick-bearer gets the scholar killed.** The smoking gun: belongfeast-armed-s272 d64 — the scholar witnessed the Ad Break, gave ground, and died IN the withdrawal ("Chloe Lynch is dead — combat" the same day). The Ad Break attacks during its ad pause; the scholar takes free hits while walking to the edge. Across 8 pairs: 'combat' (scholar) deaths 227 vs 181 (+46), mantle transfers 142 vs 104 (+38).
3. **The party-aware hold never fired** (lfHeld=0) — no villager was ever committed to the scholar's witness fights, so #353 was never tested in the wild. The holds are proven only in the proof's synthetic fixtures.
4. **The trade is real but the price is wrong.** The scholar forgoes kills for observations (w3Kills 5 vs 16 — the armed side kills far fewer wave-3+), and the observations do convert (share 0.40 vs 0.25). But the withdrawal's attrition cost (+38 scholar deaths) dwarfs the learning gain. Villages survive longer on the armed side (median +12d) but churn through scholars to do it.
5. **The v1 bug is a cautionary tale.** The one-turn flee (v1) narrated "witness" then killed anyway — the instrument lied. The persistent withdrawal (v2) is honest but lethal. Neither shape is viable: a witness that fights is a lie, a witness that flees is suicide against hostile trick-bearers.

## Village assessment (sense-tested)

The witness beats read as honest and in-fiction: "You don't meet the Spool blade-first — not tonight. You give ground instead, watching it all the way: how it moves, how it breathes, where its eyes go. Learning, not fighting. (witness posture)" — followed by the engine's own "You lived to tell it — the Spool's moves are burned into your memory. (1/2 — one more survived encounter and you'll have its trick.)" The spool's record/replay playing back the scholar's WAITs while they withdraw is a genuinely good moment — the trick-bearer studying the scholar studying it.

But the Ad Break witness reads as tragedy, not learning: the scholar gives ground, the ad runs, and Chloe dies mid-withdrawal. The fiction promises "observes from safety" — the mechanics deliver "backs away while it hits you." The gap between the beat's promise and the fight's reality is the arm's epitaph.

## Metric review (post-results)

1. The primary bar (+2 pilot) was honest and the GO is real (+5) — the funnel moves. But the guardrails are the binding constraint and both missed by an order of magnitude, not a margin. This isn't a tuning near-miss; the mechanism is structurally unsafe.
2. The scholar-death guardrail (mantle transfers) proved its worth as a safety check: a discoveries-only read would have shown "+5, GO to confirm" and sent a scholar-killing lever to 16 more seeds. The guardrail caught what the primary couldn't see.
3. The per-witness observation rate (4.33) is a useful instrument for any future funnel arm — it separates "the lever fired" from "the lever taught."
4. Note for future LEARN-VS-FIGHT work: the design call stands (Steve 2026-10-13), but "witness" cannot mean "flee from a hostile." The viable shapes are: witness only non-hostile trick-bearers (needs a hostility signal), or learn-while-fighting (defensive posture that survives without killing — a different arm), or the villager-side channel (the autonomous field-fight funnel, which this arm never touched).

## Blanks filled / documented

- **Filled:** nothing landed (killed at pilot). The kill itself is the finding: documented below.
- **Documented (not chased):** (a) the scholar's survived-encounter funnel DOES work on village channels (15 witnesses → 65 observations → +5 discoveries) — the supply is real, unlike the expedition channel; (b) withdrawing from hostile wave-3+ trick-bearers is lethal (+38 scholar deaths) — any future witness arm needs a hostility gate or a non-flee witness verb; (c) the party-aware hold (#353) never fired in the wild — the scholar's village-channel fights are always 1v1, so the guard is proven-but-unexercised; (d) the `counter_observed` tele + per-witness rate instrument pair is reusable for any future funnel arm (retained).

## Next-round notes (for the coordinator, not this run)

- The LEARN-VS-FIGHT design call (Steve 2026-10-13) is NOT exhausted — only the flee-shape is dead. The open directions: a hostility-gated witness (witness the spool, fight the Ad Break), a defensive-fight posture (survive without killing — needs engine verbs for non-lethal survival), or the villager-side observation discipline (the autonomous field-fight channel is where the bulk of observations already come from).
- The observation funnel's supply on village channels is PROVEN (this arm's +5). The problem was never supply — it was the witness verb's lethality. A safe witness verb would inherit this arm's supply.
- Do NOT run another scholar-flee variant. The two shapes (one-turn lie, persistent suicide) bracket the space.
