# sim-w3drive2 — pantry-gated, no-commit wave-3 counter-learning expeditions

**Run:** sim-w3drive2 (ARM, fleshout loop) — scale-onramp axis, 2026-10-15
**Axis:** scale-onramp (blocking). **Lever:** new policy `scripts/policies/w3drive2.js` (W3DRIVE2=1, default OFF), zero src/js.

## Context

- sim-w3drive (2026-10-15, KILLED AT CONFIRM): the time-to-learn hypothesis is *mechanically* validated — starting counter-learning pursuit at wave-3 unlock produces more wave-3 trick discoveries (+5) and a higher counter-kill share (1.72x) than the natural encounter rate, through the engine's real non-lethal observation funnel. But the pursuit cost 20.5d median survival. The metric review named the two fixes; this arm IS those fixes:
  1. **PANTRY-GATED hunts:** the don't-hunt-hungry gate reads the VILLAGE PANTRY (`Game.villageFoodTier()`, the engine's own hunger vocabulary — 'starving' = <1 pantry-day), not the scholar's kcal. The old gate checked scholar kcal ≥ 200: belongfeast-armed-s706 ran 5 hunts while the village starved (village-lost d76 vs control d154).
  2. **NO COMMIT:** the hold-to-12% scholar-sacrifice (`ctx._huntCommit`) is removed entirely. It killed scholars (16 vs 10 mantle transfers on s151), and the mechanism analysis showed the cruelty: committed fights push toward KILLS, but kills don't teach wave-3 tricks — only SURVIVED encounters feed the observation bar. The scholar keeps the engine's honest 35% eject.
- Kept: counter-learning expeditions from wave-3 unlock (~d40), honest verbs only (real travelTo, real checkEncounter, bounded 12-step walk; contact fires the engine's own startCombat), the non-lethal survived-encounter funnel (proof-pinned: `counter_discovered` tele is the single writer into `state.villagerTricks` — only SURVIVED encounters feed the observation bar; kills don't teach wave-3 tricks).

## The lever

`scripts/policies/w3drive2.js` wraps the tribfloor→windefer chain (the same construction the killed w3drive used: `WD.withWinDefer(TF.leadfeast/belongfeast, id 'leadfeast-windefer'/'belongfeast-windefer')`), keeping the base ids. Both sides share the objects; W3DRIVE2 is the only switch. SEATDRIVE never set; WAVE5REACH never imported or wrapped (independent layer, zero file overlap with sibling arms). The old W3DRIVE gate does not arm this layer (proof-pinned).

- **Live window:** `unlockedWave() >= 3 && unlockedWave() < 4`, not during the table sequence. Stands down at wave-4 (wave5reach's territory — no overlap in live windows).
- **Seek side:** every 3rd day, scholar hp ≥ 60%, and the village pantry NOT starving (`villageFoodTier() !== 'starving'`; fallback `pantryDaysEstimate() < 1`), the scholar travels to monster-country nodes (revealed thickets first) and walks up to visible wave-3+ monsters — the wave5reach engage pattern, engine-honest (real travelTo, real checkEncounter, bounded 12-step walk; contact fires the engine's own startCombat). The scholar-kcal check is GONE (replaced, not supplemented) — a hungry scholar with a fed village is not blocked. The cadence day is NOT consumed when the pantry gate blocks: the expedition waits for the pantry.
- **Fight side:** NONE. No fight override — `ctx._huntCommit`/`ctx._w5Commit` are never written (grep-pinned in the proof: zero code references in the layer file). The scholar keeps the engine's honest mid-fight 35% eject; observations need survivors.
- **Learning channel:** none invented. The engine's non-lethal observation path plus the base's askAbout 'beasttricks' topic carry all village learning.
- **Instruments:** `w3Hunts` / `w3HuntLegs` / `w3HuntSteps` / `w3HuntEngaged` (lever-live), `w3PantryGateBlocks` (days a hunt would have fired but the pantry forbade it), `w3HuntsEmptyPantry` (bug detector — the gate must make this unreachable; sweep asserts 0), `mantleTransfers` (scholar deaths, counted from beats).

Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, the deliberately counter-less wave-4/5 roster, villagerTrickDefs wiring).

## Pre-registered header (MEASUREMENT §§9–12, 14 — BINDING)

- **Design:** 8 fresh seeds [163, 274, 385, 496, 607, 718, 829, 940] (verified 0 prior uses in evidence/2026-10-1*/) x {leadfeast, belongfeast} x {control, armed}, 180d death-aware (dead villages stop, +10d tail max), identical seeds, own in-sweep control.
- **Substrate (both sides, exact):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 (the pre-seat stack). SEATDRIVE never set.
- **PRIMARY:** wave-3+ counter discoveries (`counter_discovered` tele events for wave≥3 mids — the w3drive metric review promoted discoveries to the primary; the share rested on 6 vs 4 counter-kills, small-n volatile). Bar: **armed ≥ control + 4**.
- **SECONDARY (report):** wave-3+ counter-kill share (same attribution instrument as w3drive).
- **Guardrails:** median survival ≥ control − 10d; starvation deaths ≤ control + 2; national ≥ control − 2; no new death mode (n≥3).
- **Report:** per-seed pair survival deltas (w3drive was bimodal −78d..+73d), mantle-transfer counts, hunts-on-empty-pantry count (must be 0).
- **Horizon:** 180d death-aware, per the question (counter learning needs the full wave-3 window).
- **PILOT GATE:** 8 pairs (seeds 163, 274, 385, 496 x {leadfeast, belongfeast}) first. GO to confirm iff armed discoveries ≥ control + 2 AND median survival ≥ control − 10d on the pilot pairs. KILL at pilot otherwise: delete `scripts/policies/w3drive2.js` per kill protocol, keep instruments + evidence.
- **Metric binding (§14):** a miss is NO-GO, never re-scored mid-run. Metric doubts go under "metric review" below.

## Metric review

_(written before results: doubts about the metric itself)_

1. The primary (discoveries) counts the engine's real non-lethal observation funnel — it measures what the village actually learns, which is the hypothesis. But discoveries are necessary, not sufficient, for the scale-onramp axis: trick knowledge must convert into survival/scale. The guardrails (especially survival and national) carry that conversion check.
2. Wave-4/5 monsters have no trick defs by design — they can never be counter-attributed. The discovery instrument only counts wave≥3 mids; wave-4/5 discoveries stay 0 by construction. Honest, but the lever's ceiling is the wave-3 signature set (3 of 9 wave-3 monsters have learnable tricks).
3. The pantry gate binds on the engine's 'starving' tier (<1 pantry-day). On famine seeds the hunt may stand down for most of the wave-3 window — which is the intended behavior (don't hunt while the village starves), but it means the lever's exercise rate is pantry-dependent. `w3PantryGateBlocks` measures how often the gate binds.
4. Removing the commit changes the fight outcome distribution (more ejects at 35% — more survived encounters, fewer kills). The discovery funnel needs survivors, so this should help the primary; the kill-attribution secondary may fall. That's the designed trade, pre-registered.

## Proof

`scripts/test-w3drive2-20261015.js` — 44/44 GREEN (pre-sweep, layer present):
- layerOn honesty (W3DRIVE2=1/0/unset; old W3DRIVE=1 does NOT arm this layer), composition integrity (ids, substrate markers)
- unit checks: huntLive true at uw=3 only (false at uw=2/4/5, false during table, false gate-off)
- villageHungry: 'starving'→true; 'tight'/'secure'/'abundant'→false; pantryDaysEstimate() fallback (<1→true, ≥1→false); inert when no pantry methods; scholar kcal IRRELEVANT to the gate
- huntLeg behavior: starving pantry → no hunt, block counted, travel never attempted; tight pantry + hungry scholar (kcal 50) → hunt FIRES (the old scholar-kcal gate would have blocked — the replacement pin); 3-day cadence holds
- NO-COMMIT pin: zero `_huntCommit`/`_w5Commit` code references in the layer file; composed policy adds no fight override; stub live wave-3 fight at full HP writes neither flag
- det-gate: gate-off (W3DRIVE2 unset) byte-identical to the naked tribfloor→windefer composition on seeds 163/274, 30d
- RED check: injected both old-design mutations (restored commit + scholar-kcal gate) — the 5 new mechanism checks caught them (3 commit-pin failures, 2 gate failures); reverted, green again
- instrument pins: `villagerTricks` written ONLY by `_trickObservation`; `counter_discovered` tele fires from the discovery funnel
- SMOKE: 20d both sides, markers honest, runs complete, policy ids correct

## Results — PRIMARY MISS → ARM NO-GO (KILLED AT CONFIRM)

32 runs (8 seeds [163,274,385,496,607,718,829,940] x {leadfeast, belongfeast} x {control, armed}), 180d death-aware, pre-seat substrate (FEASTSCALE_R13+TRIBFLOOR+SUCCGRACE+RAIDDENSITY+WINPURSUIT+WINDEFER, SEATDRIVE never set). Per-seed JSONs: `evidence/2026-10-15/perseed-w3drive2/` (32/32). Beat captures: `evidence/2026-10-15/w3drive2-beats/` (32/32).

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| PRIMARY: wave-3+ discoveries | 9 | 12 | ≥ control+4 (≥13) | **MISS** (+3) |
| secondary: wave-3+ counter-kill share | 0.074 (2/27) | 0.136 (3/22) | report | 1.84x |
| median survival (matched pairs) | 118.0d | 108.5d | ≥ control−10d | **GO** (−9.5d) |
| starvation deaths | 4 | 4 | ≤ control+2 | GO |
| national | 12/16 | 10/16 | ≥ control−2 | GO |
| table invitations | 16/16 | 15/16 | — | report |
| wave-5 unlocks | 8/16 | 9/16 | — | report |
| wins | 0/16 | 0/16 | — | — |
| exiled | 0/16 | 0/16 | — | — |
| hunts / engagements / pantry-gate blocks | 0 / 0 / 0 | 76 / 15 / 2 | — | lever live |
| hunts-on-empty-pantry | — | 0 | must be 0 | **GO** |
| mantle transfers (scholar deaths) | 276 | 288 | — | report |
| new death mode (n≥3) | — | none | — | GO |

Pilot (8 pairs): discoveries +2 (bar ≥ +2) GO, survival median equal GO → GO to confirm. Confirm (8 pairs): discoveries +1 (6 vs 5), survival −17.5d. Full: discoveries +3 (12 vs 9), survival −9.5d.

**Verdict per §14 binding: the primary missed (+3 < +4). The lever does not land. `scripts/policies/w3drive2.js` DELETED per kill protocol; instruments (`scripts/test-w3drive2-20261015.js`, `scripts/sweep-w3drive2-20261015.js`) + evidence retained.**

Pair survival deltas (armed−control): −8, −14, +9, −14, −16, −21, −3, −50, −30, +25, −16, −1, −3, +10, −57, +1. The bimodal signature persists (range −57..+25, vs w3drive's −78..+73) — narrower, still variance-positive and mean-negative.

## Mechanism: what the two fixes bought, and what they cost

1. **The commit removal worked as intended.** Mantle transfers: 288 vs 276 aggregate (vs w3drive's 16 vs 10 on a single pair) — no scholar-killing signature. The 35% eject kept scholars alive; the layer never wrote a commit flag (proof-pinned, and the sweep's per-run marker asserts would have caught it).
2. **The pantry gate is proven but low-leverage.** It bound on only 2 hunt-days across 16 armed runs (leadfeast-s274, a famine seed); hunts-on-empty-pantry = 0 across the sweep; unit tests + the live blocks prove the mechanism. But on the pre-seat stack, villages in the wave-3 window (~d40–91) rarely drop below the 'starving' tier (<1 pantry-day) — the s706 failure mode (5 hunts while starving) didn't replicate on these seeds. The gate did its job; there was little job to do.
3. **The knowledge effect shrank with the commit.** Engagements held at 15 (identical to w3drive's 15 — the seek side is unchanged), but discoveries went 13→12 armed while control went 8→9 (different seeds). The hypothesis "more survivors → more observations" is not borne out: the engagement count dominates the funnel, and without the commit the fights end earlier (35% eject) with fewer observation rounds per engagement. The trade: −20.5d → −9.5d survival cost, +5 → +3 discoveries. Better ratio, still below the bar.
4. **Wave-3 unlock days byte-identical both sides** — the layer never moves the gate. The hunt window is real (unlocks d40–91).

## Village assessment (sense-tested)

The counter-learning still reads as people, not robots — the "lived to tell it" quality from w3drive holds:

- **Hassan's trick (belongfeast-armed-s163, d68):** "💡 COUNTER LEARNED — Chorus Line: Dance on the downbeat. The kick only lands on beat 4 of the 4/4 count. Dance and it catches air — but dancing is your whole turn. (Hassan lived to tell it, twice — the village pieced it together.)" — followed by "⚔️ Hassan stared down the Chorus Line and it backed off — 0 rounds, not a scratch on them." The knowledge is *used*, the knower lived (the no-commit design: he survived the encounter that taught the village).
- **Serik's trick (belongfeast-armed-s385, d51):** "(Serik lived to tell it, twice — the village pieced it together.)" — Serik was mauled (−39) but lived. Then the scholar fights a Spool and wins with a sharpened stick ("The Spool falls.") — an under-geared scholar engaging wave-3 and winning reads as brave, but the hunt has no gear/DPS readiness check (filed to sim-findings).
- **The pantry gate, live (leadfeast-armed-s274):** a famine seed — the scholar's personal "⚠ STARVING: health and energy falling" beat fires from d1, but the pantry gate (village tier, not scholar kcal) blocked only 2 hunts while 8 fired. The designed distinction held: the scholar's hunger no longer vetoes the hunt; the village's does. The village survived to d93 (control d114).
- **Repetition note:** the treeline-stalker narration ("Something moves out there — X. / It followed you. X is here. / X stops at the treeline — pacing, unwilling.") repeats 8+ times per run verbatim — filed to sim-findings as a narration observation.

The hunts read less like obsession this round (no scholar-death spirals, no starving-village expeditions), but also less like purpose: 8 hunts on leadfeast-s274 produced 0 engagements — the scholar walks out, finds nothing, walks home. Honest, but the expedition's hit rate is the next thing to understand.

## Metric review (post-results)

1. The primary bar (+4) was honest and the miss is real: +3 on 12 vs 9 sits inside the noise of the natural discovery rate (control found 9 on its own). The bar shouldn't move; the lever is weak without the commit and lethal with it. The design space "pantry-gated + commit" is exhausted — a future arm needs a different mechanism (villager expeditions instead of the scholar's, or more engagements per hunt rather than safer fights).
2. The survival guardrail passed (−9.5d) but the bimodal signature persists (−57..+25). The mean hides the variance — a future metric could use a variance-aware guardrail (e.g., worst-pair bound) for hunt levers.
3. The pantry gate's 'starving' tier rarely bound (2 blocks / 16 runs). A stricter tier (e.g., 'tight', <3d) would bind more often but would also strand the hunt on seeds where the village is merely lean — that's a design call (filed as a question, not a change).
4. `w3HuntsEmptyPantry` stayed 0 by construction (the gate precedes the fire). As an instrument it's a bug detector, not a metric — keep it in that role.

## Blanks filled / documented

- **Filled:** the two w3drive failure modes are fixed and proven — (a) the hunt gate reads the village pantry (`villageFoodTier()`, the engine's own hunger vocabulary; proof-pinned with unit + behavioral tests, 0 empty-pantry hunts in 32 runs), (b) the scholar-sacrifice commit is gone entirely (grep-pinned zero references; mantle transfers 288 vs 276, no killing signature). The survival cost fell from −20.5d to −9.5d (guardrail now passes).
- **Documented (not chased):** (a) without the commit the knowledge effect shrinks (+5 → +3) — the engagement count, not the fight outcome, dominates the discovery funnel; (b) the hunt has no gear/DPS readiness check (scholar engaged a Spool with a sharpened stick — filed); (c) treeline-stalker narration repeats verbatim 8+/run (filed); (d) the bimodal pair-delta signature persists — hunt levers need a variance-aware guardrail (metric review).

## Next-round notes (for the coordinator, not this run)

- The w3drive line is done: commit = lethal, no-commit = weak. Don't run a third variant of the scholar-hunt shape.
- If counter-learning is revisited, the open directions are: villager (not scholar) expeditions, more engagements per hunt (the funnel is engagement-count-dominated), or a gear/DPS readiness gate on the hunt.
- The `counter_discovered` tele + `waveKillLog` kill-day attribution instrument is reusable for any future counter-knowledge arm (proof-pinned, retained).
