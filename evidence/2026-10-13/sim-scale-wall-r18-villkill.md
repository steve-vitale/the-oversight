# Scale-wall r18 ARM 3 — villkill: do villagers kill wave-3 monsters? (DIAGNOSTIC)

Run: oversight-flesh-out-loop-b, run_id 2026-10-13T20:45:42+00:00, ARM 3 (villkill). Worktree: ~/workspace/worktrees/sim-villkill-b.
Axis: scale-onramp (blocking, standing directive). Lens: lever 2 (wave unlock pacing) — the r17 two-rung wave-4 bind.
Canon read: docs/CANON.md, docs/MONSTER-WAVES.md. No game-code changes; scripts/ + evidence/ only. No lever — pure diagnostic.

## Pre-registration (diagnostic arm)

- **Primary metric:** villager wave-3 kill occurrence + ledger attribution end-to-end: per-seed, per-wave-3-type kill counts attributed NPC vs scholar (scholar-tb / field-vessel / field-npc via the r16 arm-C mantleOf separation), waveLedgerPoints(3) deltas tied to each kill, and whether any courtship-road seed closed the kill rung (4 pts) via village action.
- **GO threshold (diagnostic, like r17 arm 2):** the instrument measures villager wave-3 kill occurrence + ledger attribution end-to-end on all 8 seeds and delivers a measured answer: how many villager wave-3 kills on courtship seeds, how many ledger points they contributed, and whether any courtship seed closed the kill rung via village action.
- **Horizon:** 150d death-aware. Why: wave-3 unlocks need day 25 + 4 wave-2 ledger points, and wave-3 kills can only happen after the unlock; the r16 courtship baseline survived median ~82.5d, so 150d gives the kill window headroom without simulating dead villages.
- **Seeds/policies:** 11/22/33/44/55/66/77/88 × leadcourt/belongseek (the courtship road — the only road that reaches national in sims).
- **Design-call boundary:** the kill-vs-scale coupling is Steve's design call if a gate change is proposed. This arm DIAGNOSES; no game-code gate changes.

## The instrument

`scripts/villkill-20261013.js` — `attachVillKill(Game, m)` wraps `Game.fieldFight` (stash a pending {vid, monsterId} marker on vKill) and `Game.recordWaveKill` (consume the marker id-matched, log waveLedgerPoints(3) before/after). Attribution buckets: `scholar-tb` (TB kill, no marker), `field-vessel` (mantleOf from-set or current scholar vid), `field-npc` (pure NPC). Pass-through wraps; zero game behavior change.

Attribution path verified by reading (not assumed): the ledger takes only a monsterId — it never records WHO killed. Every real kill flows through `recordWaveKill`, called from exactly two classes of site: (1) `tbEnd` (game.js:37585) — the scholar's TB kills; (2) synchronously after `fieldFight()` returns `{outcome:'vKill'}` — resolvePatrol, resolveWildMonsterEncounter, expeditionMonster, aidFight, _cxBlood/hide/beastmaster. In every case the call is synchronous with the fieldFight return and carries the same monster id, so the pending-marker handoff is airtight.

Proof: `scripts/test-villkill-20261013.js`, **25/25 green**, with a real RED phase: the id-mismatch guard removed → the misattribution test FAILs (field-npc on a scholar kill); guard restored → PASS. Also proven: ledger deltas tie to kills (per-type cap 2 surfaces as deltas 1,1,0), a REAL engine fieldFight vKill (weakened wave-3 mdef, real objects) fed through the real recordWaveKill logs `field-npc` with delta 1 (negative control without a preceding fight → `scholar-tb`, proving attribution isn't hardcoded), and 30d same-seed trajectory hashes identical with/without the instrument (non-interference).

Sweep driver: `scripts/sweep-villkill-r18-20261013.js` (reuses r17's table-recon instrument for wall numbers). Raw: `evidence/2026-10-13/sim-scale-wall-r18-villkill.json`.

## The measured answer

**Villager wave-3 kills on the courtship road: ZERO. 0/16 seeds. 0 vessel, 0 NPC.**

| | scholar-tb | field-vessel | field-npc |
|---|---|---|---|
| wave-3 kills (16 runs) | 1 | 0 | 0 |
| ledger points contributed | +1 | 0 | 0 |

- The single wave-3 kill in 16 runs: belongseek s66, day 121, **chorus_line**, scholar TB kill, +1 ledger point. The village died d137 village-lost.
- Kill rung (4 wave-3 ledger points): closed **0/16**; closed via village action **0/16**.
- The instrument was live, not deaf: **243 non-wave-3 kills** flowed through the recordWaveKill choke point across the 16 runs (the kill engine fires fine on waves 1–2) — and the attribution machinery watched every one. Zero were villager wave-3 kills.
- Wave 3 unlocked on 5/16 seeds (leadcourt s22/s66, belongseek s22/s66/s88 — waveReach 3), so wave-3 monsters were in the pool and villagers were meeting them. They fought; they did not kill. (r16 arm C measured why: NPCs die entering fights at median 22 HP, 27/31 one-shot in 1 round — on wave 1. Wave 3 runs 240–420 HP with 20–70 damage bands.)
- The collective engine works one rung down and stops dead at wave 3: the wave-2 ledger bar (4 pts → wave-3 unlock) was cleared on those 5 seeds — villagers + scholar do kill wave-2s together (r9's deepening). At wave 3 the village contributes nothing.

**Structural answer:** the courtship road has NO second kill engine for wave 3. The ledger WOULD count villager wave-3 kills (proven: field-npc kills score delta 1 end-to-end) — but they never happen in sims. The wave-4 kill rung is scholar-only in practice, and the scholar managed 1 wave-3 kill in 16 courtship runs. The r17 two-rung bind stands, and the kill rung's realistic ceiling on the courtship road is ~1 point, not 4.

## Wall numbers (this suite)

**national 8/16 · tableWaiting 0/16 · tableDone 0/16 · arc4 0/16 · wins 0/16 · wave4unlock 0/16 · wave5unlock 0/16 · median 86d / max 150d.**

leadcourt: national 5/8 (first days ~80), 1 survived 150d (s22). belongseek: national 3/8 (first days 75–90). 15/16 ended village-lost — combat attrition, the standing face. No seed held national to 150 except leadcourt s22 (survived, rank national at end).

## Village assessment (plain words)

The courtship villages are real political animals and terrible monster hunters. They bow to Ashford and Emberhold, pay tribute weekly, season links, hear the Binding beat — 8 of 16 reach national, which no survival-road policy does. Then the monsters take them: median 86 days, village-lost, the same combat deaths as every suite. The wave-3 drop lands mid-collapse (d60 on s66: the System's "we've stopped pretending these are animals now," and Yara at the fire: "Don't go near the treeline alone anymore. Promise me." — that reads as a person, not a counter). The scholar kills one Chorus Line on day 121 — a lone data point, not an engine. Nobody else in any village, on any seed, kills anything from the Final Draft. Ever.

What the village looked like: sixteen villages that learned to court and never learned to kill uphill. Who thrived: the diplomats — link-tenders, tribute-payers, the persona that answers every beat. Who died: everyone, in the treeline, at the same rate as the survival road. What was missing: not knowledge (they fight wave-3s — the encounters happen) but lethality — a 240–420 HP monster with 20–70 damage bands against villagers who enter wave-1 fights at 22 HP is not a fight, it's a census entry.

Sense-test: the wave-3 drop beat and its fireside reaction read as village life (probe on belongseek s66: raid beats, moot-adjacent talk, the d60 drop + Yara's line — coherent, present-tense, no fabricated history). Villagers act like people throughout; the blank here is capability, not personhood.

## Blanks

FILLED: the villager wave-3 kill question — measured structural answer (0/16 seeds, 0 kills; ledger would count them, proven end-to-end; kill rung scholar-only in practice, ceiling ~1 pt on the courtship road). Instrument (villkill-20261013.js, proof 25/25 with observed RED) is reusable for the sibling arms' kill-road measurements.
OPEN (appended to sim-findings.md): wave-3 kill economy is scholar-only — the wave-4 kill rung needs either a reachable-by-village kill path or a design ruling (Steve's call; the coupling question from r17 arm 2 stands, now with the villager-zero measured).
