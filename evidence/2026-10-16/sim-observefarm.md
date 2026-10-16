# sim-observefarm — non-lethal observation farming for wave-3 tricks

**Run:** sim-observefarm (ARM, flesh-out loop) — scale-onramp axis, 2026-10-16
**Axis:** scale-onramp (blocking). **Lever:** new policy `scripts/policies/observefarm.js` (OBSERVEFARM=1, default OFF), zero src/js, plus a policy-side `ctx._observeFarm` extension in `scripts/policies/competent.js` (the proven `_huntCommit`/`_w5Commit` pattern — gate off = byte-identical, det-gate pinned).

## Context

- The wave-3+ trick observation bar (`state.villageCounterObs` — 2 survived encounters per species) is fed ONLY by survived encounters; `counter_discovered` tele is the sole writer into `state.villagerTricks` (proof-pinned).
- The w3drive hunt line is EXHAUSTED: pantry-gated hunts bought discoveries (+3 vs +4 bar at confirm) at a survival cost the guardrail barely tolerated (−9.5d at confirm) — and kills don't teach, only survived encounters do.
- The 35% retreat discipline (w5reach3) held zero scholar deaths in committed fights.
- This is a NEW layer, not a re-land: the honest-engagement pattern (real travelTo, real checkEncounter via node entry, bounded 12-step walk-up, contact fires the engine's own startCombat) is re-derived from the w3drive2 proof/sweep scripts + evidence/2026-10-15/sim-w3drive.md and sim-w3drive2.md (both layer files deleted at kill). No deleted layer is re-landed.

## The lever

When the scholar meets a wave-3 monster whose trick is trick-bearing AND undiscovered, engage only to SURVIVE and OBSERVE — never commit to the kill — and retreat on observation (every alive trick-bearer in the fight is already known) or after OBS_ROUND_CAP=8 rounds, or at the engine's honest 35% retreat line, whichever first. Honest verbs only: real expedition/travel movement, real field-fight engagement with the flee/eject discipline already in canon; no phantom knowledge (the seek side reads only `Game.villagerTrickDefs()` + `Game.villageKnowsTrick()`, the engine's own knowledge gates), no RNG-gaming.

Differences from the exhausted w3drive line:
1. **TARGET SELECTION:** the seek side engages ONLY trick-bearing wave-3 species (`villagerTrickDefs()` keys: spool, chorus_line, buffering) whose trick is undiscovered. w3drive2 engaged whatever wave-3+ was visible — the 6 trick-less wave-3 species can never fire the funnel (pure waste), and re-farming known species teaches nothing.
2. **N-ROUND CAP:** farm fights retreat past 8 rounds while healthy — observations are per-ENCOUNTER (fled/routed/calmed at fight end), not per-round, so a long fight is pure attrition risk. Leave with the observation.
3. **RETREAT-ON-OBSERVATION:** mid-fight, when every alive trick-bearer is already known (target died mid-fight, or the bar completed via another path), the fight has no learning value — flee while healthy. The hunt self-terminates when all 3 tricks are known.
4. **NO COMMIT:** the layer never writes `_huntCommit`/`_w5Commit` (grep-pinned in the proof); the scholar keeps the engine's honest 35% eject.

Scope note: the villager field-fight channel (fieldFights.js — vFlee/mFlee/evade → villager observations) is engine-autonomous; it fires symmetrically on both arms and this layer does not (cannot honestly) steer it.

- **Live window:** `unlockedWave() >= 3 && unlockedWave() < 4`, not during the table sequence. Wave-4/5 have no trick defs by design — nothing to farm there.
- **Seek side:** every 3rd day, scholar hp ≥ 60%, village pantry NOT starving (`villageFoodTier() !== 'starving'`, fallback `pantryDaysEstimate() < 1` — the w3drive2-proven pantry gate; the cadence day is NOT consumed when the pantry blocks), travel to monster-country nodes (revealed thickets first), walk up ONLY to visible trick-bearing undiscovered wave-3 monsters.
- **Fight side:** NONE in the layer beyond the farm-fight mark — `ctx._observeFarm` (recomputed every player turn, false whenever the gate is off / hunt not live / no farm target in the fight). The competent.js extension honors it: retreat-on-known + round-cap, via the base's own `flee()`.
- **Instruments:** `ofHunts` / `ofHuntLegs` / `ofHuntSteps` / `ofHuntEngaged` (lever-live), `ofPantryGateBlocks`, `ofFarmDoneSkips` (hunt self-termination), `ofRetreats` (extension retreats), `ofFarmTurns`, `mantleTransfers` (scholar deaths from beats), `counter_discovered` + `counter_observed` tele capture.

Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, the deliberately counter-less wave-4/5 roster, villagerTrickDefs wiring).

## Pre-registered header (MEASUREMENT §§9–12, 14 — BINDING)

- **Design:** 8 fresh seeds [141, 252, 363, 474] (pilot) + [191, 302, 413, 524] (confirm) — verified 0 prior uses in evidence/2026-10-1* at proof time — x {leadfeast, belongfeast} x {control, armed}, 180d death-aware (dead villages stop, +10d tail max), identical seeds, own in-sweep control.
- **Substrate (both sides, exact):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 (the pre-seat stack, comparable to the whole w3drive line). SEATDRIVE never set (explicit — pre-seat by design).
- **PRIMARY:** wave-3+ trick discoveries (`counter_discovered` tele events for wave≥3 mids, per-seed count). Bar: **armed ≥ control + 4** (the bar w3drive2 missed at +3 — this arm must honestly beat it).
- **SECONDARY (report-only):** knowledge→execution conversion (counter-executed kills of observed species — waveKillLog trick flag × discovery-day), per-engagement observation rate (`counter_observed` events / `ofHuntEngaged`).
- **Guardrails:** median survival ≥ control − 10d; scholar combat deaths (mantle transfers) ≤ control + 1; starvation deaths ≤ control (no worse); national ≥ control − 2; no new death mode (n≥3).
- **Report:** per-seed pair survival deltas, mantle-transfer counts, ofHunts/ofHuntEngaged/ofRetreats (lever-live proof).
- **Horizon:** 180d death-aware, per the question (counter learning needs the full wave-3 window; wave-3 unlocks ~d40).
- **PILOT GATE:** 8 pairs (seeds 141,252,363,474 x {leadfeast, belongfeast}) first. GO to confirm iff armed discoveries ≥ control + 2 AND median survival ≥ control − 10d AND scholar deaths ≤ control + 1 on the pilot pairs. KILL at pilot otherwise: delete `scripts/policies/observefarm.js` per kill protocol (the competent.js extension stays inert without the layer — its only entry point is `ctx._observeFarm`, which nothing else sets), keep instruments + evidence.
- **Metric binding (§14):** a miss is NO-GO, never re-scored mid-run. Metric doubts go under "metric review" below.

## Metric review

_(written before results: doubts about the metric itself)_

1. The primary (discoveries) counts the engine's real non-lethal observation funnel — the hypothesis in its purest form. But discoveries are necessary, not sufficient, for scale-onramp: trick knowledge must convert into survival/scale. The guardrails (especially survival and national) carry that conversion check, and the secondary (counter-executed kills) watches the knowledge→execution link directly.
2. The lever's ceiling is the wave-3 signature set: 3 species (spool, chorus_line, buffering) × 1 discovery each = 3 discoveries max per run. The +4 bar therefore requires beating control's natural rate by more than one full species-worth of discoveries — the bar is deliberately hard (it is the bar w3drive2 missed).
3. The N-round cap trades kills for observations: fleeing at 8 rounds forfeits winnable kills (the slain path's codex hint). If the kill-attribution secondary falls while discoveries rise, that's the designed trade, pre-registered.
4. The pantry gate's 'starving' tier rarely bound on the pre-seat stack in w3drive2 (2 blocks / 16 runs). If it binds rarely here too, the gate is proven-but-low-leverage — noted, not re-tuned mid-run.

## Proof

`scripts/test-observefarm-20261016.js` — 65/65 GREEN (pre-sweep, layer present):
- layerOn honesty (OBSERVEFARM=1/0/unset; dead gates W3DRIVE/W3DRIVE2/WAVE5REACH do NOT arm this layer), composition integrity (ids, substrate markers, OBS_ROUND_CAP=8)
- unit checks: huntLive true at uw=3 only; trickTargetOf (spool/chorus_line/buffering targeted; trick-less wave-3, wave-1, unknown mids, and KNOWN species skipped); farmDone self-termination (3/3 known); villageHungry pantry tiers + fallback; huntLeg pantry-gate behavior (blocks on starving with block counted, travel never attempted; fires on tight; trick-less node = leg runs but no engagement; all-known = stand-down; 3-day cadence)
- NO-COMMIT pin: RED-tested against synthetic bad sources (catches `_huntCommit`/`_w5Commit` in code position, ignores comment mentions); GREEN on the real layer file; competent.js extension honors `_observeFarm` with no commit-flag writes
- fight-side via the REAL competent.fight: round-cap retreat fires (round 9 > cap 8, ofRetreats=1); retreat-on-known fires; negative (undiscovered, round 2, healthy) does NOT retreat; gate-off inert (no retreat at round 9); wrapper→extension contract (`_observeFarm` + `_observeRoundCap`) pinned
- det-gate: gate-off byte-identical to the naked tribfloor→windefer composition on seeds 141/252, 30d (pins the competent.js extension inert when the gate is off)
- instrument pins: `villagerTricks` written ONLY by `_trickObservation`; `counter_discovered` tele fires from the discovery funnel
- SMOKE: 20d both sides, markers honest, runs complete, policy ids correct
- KILL-PROTOCOL path: INFO-SKIPs cleanly (exit 0) with the layer file absent — verified before the layer was written

## Results — PRIMARY MISS (wrong direction) → ARM KILLED AT PILOT

16 runs (4 seeds [141,252,363,474] x {leadfeast, belongfeast} x {control, armed}), 180d death-aware, pre-seat substrate (FEASTSCALE_R13+TRIBFLOOR+SUCCGRACE+RAIDDENSITY+WINPURSUIT+WINDEFER, SEATDRIVE never set). Per-seed JSONs: `evidence/2026-10-16/perseed-observefarm/` (16/16). Beat captures: `evidence/2026-10-16/observefarm-beats/` (16/16).

| metric | control (8) | armed (8) | bar | verdict |
|---|---|---|---|---|
| PRIMARY: wave-3+ trick discoveries | 7 | 4 | pilot GO ≥ control+2 (≥9) | **MISS** (−3, wrong direction) |
| secondary: counter-kill share | 0.231 (3/13) | 0.100 (1/10) | report | 0.43x (designed trade, but no discovery gain to trade for) |
| secondary: per-engagement observation rate | nc | nc | report | no engagements either side |
| median survival (matched pairs) | 140.0d | 134.5d | ≥ control−10d | **GO** (−5.5d) |
| scholar deaths (mantle transfers) | 142 | 128 | ≤ control+1 | **GO** (−14) |
| starvation deaths | 2 | 0 | ≤ control | **GO** |
| national | 7/8 | 7/8 | ≥ control−2 | **GO** |
| table invitations | 8/8 | 8/8 | — | report |
| wave-5 unlocks | 5/8 | 4/8 | — | report |
| wins | 0/8 | 0/8 | — | — |
| exiled | 0/8 | 0/8 | — | — |
| hunts / engagements / retreats | 0 / 0 / 0 | 50 / **0** / 0 | — | lever live, zero contact |
| pantry-gate blocks / farm-done skips | — | 0 / 0 | — | gate never bound; farm never completed |
| new death mode (n≥3) | — | none | — | GO |

Pair survival deltas (armed−control): −16, −3, +44, +0, −18, +2, +3, −23. Wave-3 unlock days byte-identical both sides (the layer never moves the gate).

**Verdict per §14 binding + the pre-registered pilot gate: the primary missed decisively (4 vs 7 — the wrong direction, not a near-miss). The lever does not go to confirm. `scripts/policies/observefarm.js` DELETED per kill protocol; the competent.js `_observeFarm` extension reverted (zero trace — its only entry point was `ctx._observeFarm`, which nothing else sets); instruments (`scripts/test-observefarm-20261016.js` — INFO-SKIPs cleanly on the absent layer, verified — `scripts/sweep-observefarm-20261016.js`, `scripts/diag-oftarget-20261016.js`) + evidence retained.**

## Mechanism: the funnel has no supply where the scholar hunts

1. **The layer was live but unfireable.** 50 hunts across 8 armed runs produced **0 engagements** — the seek side never once found a trick-bearing undiscovered wave-3 monster to walk up to. Every discovery on both sides (4 armed, 7 control) came from natural autonomous encounters.
2. **The diagnostic (`scripts/diag-oftarget-20261016.js`) names it.** On seed 141 at wave-3, across 7 monster-country nodes: 3 visible monsters, all wave-3 trick-less species (redactor ×3) — zero trick-bearers. The target filter works exactly as designed (`isTrick=false` → skip); the trick-bearers (spool, chorus_line, buffering) simply don't spawn as visible walk-up monsters on expedition nodes.
3. **The beats show where the funnel's supply actually lives.** Trick-bearers arrive as RAIDERS ("🐗 RAID — 5 raiders (mosquito, Hummice, The Redactor, Big Ugly, Chorus Line) hit Haven in the night"), as treeline stalkers ("Something moves out there — Buffering. / It followed you."), and via wild encounters on travel — they come TO the village; they don't wait on expedition nodes. The scholar's expedition can't reach them because there's nothing to walk up to.
4. **The N-round cap and retreat-on-observation never fired** (0 retreats) — no farm fight ever started. The fight-side discipline is untested in the wild (it was proven against the real `competent.fight` in the proof: 65/65 GREEN — the mechanism is sound, the supply is absent).
5. **The guardrails all passed** — the hunts cost little (−5.5d median, fewer scholar deaths than control, zero starvation delta). A cheap, clean null: the layer does no harm, it just can't touch the funnel.

## Village assessment (sense-tested)

The natural funnel reads as people, not robots — the "lived to tell it" quality holds on both sides:

- **The Static, learned twice (belongfeast-armed-s474, d134):** "Ntokozo leans in, voice low. 'Here's what we figured out about Static. Don't walk toward the voice...'" followed by "💡 COUNTER LEARNED — Static: Don't walk toward the voice. ... (You lived to tell it, twice — and now you see the pattern.)" — the scholar's own survived encounters feeding the shared bar, narrated first-person, then the village theory. This is the funnel working as designed — without any layer.
- **The Buffering at the treeline (belongfeast-armed-s363, d46):** "Something moves out there — Buffering. / It followed you. The Buffering is here. / It followed you. The Buffering is here." — the stalker narration repeats (the w3drive2 repetition note stands), but the menace reads: the trick-bearer paces outside the walls, unwilling. The scholar never gets to walk up to it — it comes on its own terms.
- **The Chorus Line raid (belongfeast-armed-s252, d65):** the trick-bearer arrives with the raiders, drawn by the pantry. The funnel's supply is the village's danger, not the scholar's expedition.
- **The hunts read as honest empty walks:** 50 expeditions, 0 engagements — the scholar travels out, finds redactors or nothing, comes home. No narration marks them (the layer is silent on empty hunts — a narration gap: 50 silent expeditions is a quietness worth noting for any future hunt layer).

## Metric review (post-results)

1. The primary bar (+4, pilot +2) was honest and the miss is real and directional (−3): the armed side found FEWER discoveries than control. This isn't noise around a weak effect — the mechanism has zero contact with the funnel. The bar shouldn't move; the lever is dead.
2. The engagement instrument (`ofHuntEngaged`) proved its worth as a mechanism check: a discovery-only read would have shown "4 vs 7, weak" and invited re-tuning; the engagement read shows "0/50 — no supply," which kills the line cleanly instead of inviting a third variant.
3. The scholar-death guardrail (mantle transfers ≤ control+1) passed with margin (−14). Hunt levers' survival cost here came from travel attrition, not fight commitment — the no-commit design held.
4. Note for future funnel arms: the per-engagement observation rate secondary was unmeasurable (no engagements). Any future arm that actually engages should keep this secondary — it separates "we engaged the wrong things" from "engagements don't convert."

## Blanks filled / documented

- **Filled:** nothing landed (killed at pilot). The kill itself is the finding: documented below.
- **Documented (not chased):** (a) trick-bearers don't spawn as visible walk-up monsters on expedition nodes — the observation funnel's supply lives in raids, treeline stalkers, wild encounters, and villager field fights (the channels that come TO the village); (b) any future scholar-side observation arm must work those channels, not expedition walk-ups — or be a villager-side arm (villager expeditions / stand-and-observe discipline for the autonomous field-fight channel); (c) silent empty hunts: 50 unfired expeditions with no narration — a future hunt layer should narrate the empty walk ("nothing worth the risk out there") or it reads as dead UI; (d) the `counter_observed` tele capture + `ofHuntEngaged` instrument pair is reusable for any future funnel arm (retained).

## Next-round notes (for the coordinator, not this run)

- The scholar-hunt shape for counter-learning is now exhausted on BOTH of its faces: w3drive (commit = lethal, no-commit = weak) and observefarm (targeted = no supply). Don't run a third scholar-expedition variant.
- If the observation funnel is revisited, the open directions are: villager-side observation discipline (the autonomous field-fight channel is where 68/74 apex deaths had zero observations — sim-apexpredators), raid/stalker-channel observation (meet the trick-bearers where they actually appear), or a gear/DPS readiness gate so engagements that DO happen convert.
- The sim-counterwired diagnostic (landed 4d2702c7) already named the engine-side next: extend the ledger convention to wave-3+ (a game-code arm). This arm's kill doesn't block it — the funnel is real, the supply channel was wrong.
