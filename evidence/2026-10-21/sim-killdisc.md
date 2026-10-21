# sim-killdisc — zero-veteran survivors DIAG, stage 2 (flesh-out loop, 2026-10-21, arm sim-killdisc)

Run: fleshout-20261021T0323Z, arm sim-killdisc. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY — zero src/js changes. Answers backlog #736 (claimed by this run).

Canon: docs/CANON.md + docs/MONSTER-WAVES.md (wave unlock law: wave 4 = standing ≥ t4(100) + readiness; wave 5 = standing ≥ t5(200) + wave-4 faced; readiness bar VETERANS = living roster with wave-(w-1)+ kills; villager kills score the ledger like the player's). docs/TABLE.md read; the full seat is contextual only — the question is the readiness veteran bar.

Named next this DIAG answers (backlog #736, claimed 2026-10-21 by this run): the w5gates/fullseat arms measured seeds reaching capped standing ≥200 with veterans=0 — wave 4 unlocked 20+ days, ZERO wave-4+ villager kills. Instrument WHY: no wave-4 encounters at all? villagers break off / flee? scholar soloing every wave-4 kill? wave-4 draw never targeting villagers? Attribute every wave-4+ engagement's outcome to a mechanism class; the gate is attribution COMPLETENESS, not a change.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep, 2026-10-21T04:10Z)

**PRIMARY (DIAG-GO): attribution completeness** — ≥15/16 eligible runs with 0 unexplained wave-4+ engagement outcomes. Eligible = wave-4 unlocked (w4Day non-null on the run). A run is EXPLAINED iff every wave-4+ engagement outcome falls in the mechanism taxonomy with no residual: no unknown-via kills, no 'unresolved' field fights, no TB engagements without a matched tbEnd outcome, and zero instrumentErrors. A miss is NO-GO, never re-scored (§14).

**Non-binding (report, not judged):** the mechanism taxonomy counts (TB-SCHOLAR-KILL vs TB-COMPANION-KILL vs FF-* vs SPAWN-UNENGAGED); whether zero-veteran runs have wave-4 encounters at all; whether the scholar solos; villager read-as-people sense test from transcripts.

**Instrument:** scripts/killdisc-instrument-20261021.js (v2, KILLDISC=1; pure reads, zero RNG, zero game-state writes) — extends v1 (kill census, engagement census, per-source damage, readiness census) with: fieldFight wrap (villager-side blow-by-blow engagements + outcome taxonomy), castMonster wrap (casting-path spawns), spawnWorldMonster wrap (world-entity spawn census — maintainWorldMonsters/checkEncounter/wanderer; this was an instrument GAP found same-run: castMonster alone misses the roaming population top-up), tbEnd wrap (scholar TB fight outcome matched by fightId), tbBarrierExit wrap (fight-dissolve detection: succession/game-over dissolves without tbEnd), and startCombat refusal detection (titan muster gate refuses the solo — TB-REFUSED class; found same-run: 28 phantom "engagements" were refused herald entries, not fights). Sweep: scripts/killdisc-sweep-20261021.js. Analyzer: scripts/killdisc-analyze-20261021.js. Proof: scripts/test-killdisc-20261021.js (det-gate + read-only static scan + wrap fixtures + real-sweep gate). Transcripts: scripts/killdisc-transcripts-20261021.js (sense-testing).

**Substrate:** withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast/belongfeast))) — the SEATDRIVE=1 seatdrive substrate, FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 KILLDISC=1. Base note (fidelity): the committed fullseat corpus (evidence/2026-10-21/perseed-fullseat, sim-fullseat.md) was generated at commit 9bb0cf5ce; two game-code commits landed since (e89c294b9 theft-detection rate bar, 0713c9398). A same-seed fidelity check against the committed corpus FAILED at day 2 (pantry hash divergence) — the base drifted, so the committed corpus was NOT reused; this run generated its own corpus on 2d0be9561 (the pinned base, recorded per seed). The v2 instrument's read-only property is proven by the det-gate in the proof test (instrument-on vs instrument-off byte-identical, 60d × 2 policies).
**Seeds:** 64501–64508 × {leadfeast, belongfeast} = 16 runs. **Horizon:** 180d death-aware (dead villages stop +10d tail; runDays handles this).

## Results

Corpus: evidence/2026-10-21/perseed-killdisc/ (16 runs: seeds 64501–64508 × {leadfeast, belongfeast}, seatdrive substrate, 180d death-aware). Digest: evidence/2026-10-21/killdisc-digest-20261021.json. Instrument errors: 0 across all 16 runs. Wins 12/16, village deaths 2/16.

**PRIMARY (DIAG-GO): 12/12 eligible runs explained, 0 unexplained outcomes — but the written gate (≥15/16 eligible) is NO-GO.** 12/16 runs unlocked wave 4 (eligible); all 12 attribute every wave-4+ engagement to the mechanism taxonomy with zero residuals (no unknown-via kills, no unresolved field fights, no unmatched TB fights, zero instrumentErrors). The 4 non-eligible runs won early (lesser-seat wins at d90–107 truncate the run) before standing could reach the wave-4 bar — they contain zero wave-4 content, so there is nothing to attribute. The gate's eligibility assumption (≥15/16 wave-4 unlocks, carried over from the #736 seeds on the older base) did not hold on the current base. See Metric review.

**Mechanism taxonomy (wave-4+, 12 eligible runs):**

| Class | Count | Meaning |
|---|---|---|
| SPAWN-W4-WORLD | 69 | wave-4+ world-entity spawns (roaming top-up, tile entry, wanderer) |
| SPAWN-W4-CAST | 31 | wave-4+ wanderer/contest casts |
| TB-REFUSED | 38 | startCombat produced no fight — the Herald's muster gate refused the solo |
| TB-LOST | 35 | scholar fought a wave-4 in TB and lost |
| TB-SCHOLAR-KILL | 8 | scholar landed the killing blow in TB |
| TB-COMPANION-KILL | 1 | a companion landed the killing blow inside the scholar's TB fight |
| FF-VFLEE | 30 | villager broke off the field fight |
| FF-VDIE | 16 | villager died in the field fight |
| FF-EVADE | 2 | villager saw it and gave it room |
| FF-VKILL-* | 0 | **zero villager wave-4+ kills, all channels** |

Damage on wave-4+ TB monsters: scholar 94.8% (22,781), companions 5.2% (1,243), other 0% — 281 hits.

**The WHY (backlog #736):** Encounters DO happen — 100 wave-4+ spawns, 48 villager field fights, 44 real scholar TB fights. But:
1. **Villagers can't kill wave-4s.** 48 field fights → 30 break-offs, 16 deaths, 2 evasions, 0 kills. Wave-4 bands (damage 35–95, HP 850–1500, pierce 0.2–0.5) sit far above the villager tactical formula; the believable outcomes are flight or death. No villager ever lands the killing blow, so no veteran is ever manufactured.
2. **The scholar solos what little gets killed.** All 9 wave-4+ kills are scholar-TB kills (8 scholar blows, 1 companion blow inside the scholar's fight, 94.8% of landed damage) — and the scholar loses 35 of 44 real TB fights. No wave-4+ kill is ever recorded under a villager's vid in any field channel (agency/patrol/wild/sortie/contest/aid-crisis), so the living-veteran bar the readiness gate reads never moves on the capped-200 runs.
3. **The Herald can't even be engaged solo.** 38 of 82 TB "engagements" were refused entries — the titan muster gate ("muster 10 allied blades (you have 0)... This is not courage. This is arithmetic.") fires before any fight starts. Wave-4's signature titan is unreachable without a muster the sims never assemble.
4. **Zero-veteran runs are the norm, not the exception:** 8/12 wave-4-unlocked runs hit capped standing ≥200 with veterans at 0 the whole way (s64503/04/05/06/07/08 leadfeast, s64503/05 belongfeast).

**Instrument gaps fixed same-run (the task allows):** (1) spawnWorldMonster wrap — castMonster alone missed the roaming population top-up, the main wave-4 spawn route; (2) tbBarrierExit dissolve wrap — succession/game-over dissolves fights without tbEnd; (3) startCombat refusal detection — 28 phantom "engagements" were refused Herald entries (titan muster gate), not fights; (4) sweep data-assembly bug — engagement→kill matching used `e.d` where the record carries `day` (fixed, corpus re-run).

## Metric review

**Verdict on the written gate: NO-GO (letter of the metric), DIAG-GO in substance.** The pre-registered gate demanded ≥15/16 eligible runs with 0 unexplained outcomes. Eligibility (wave-4 unlocked) reached only 12/16: four runs (leadfeast s64501/s64502, belongfeast s64504/s64507) won lesser-seat victories at d90–107 and truncated before standing could reach the wave-4 bar — the win-truncation phenomenon the fullseat arm also measured. Those runs contain zero wave-4 content; there is nothing to attribute. Where the question applies, attribution is complete: 12/12 eligible runs, 0 unexplained outcomes, 0 instrument errors across 16 runs.

The miss is in the gate's eligibility assumption, not the instrument: I pre-registered "≥15/16 eligible" assuming the #736 seeds (which hit capped ≥200 on the older base) would nearly all unlock wave 4. On the current base (post-theft-detection drift), 4/16 win out early. **Proposed revision for the next run:** GO = 100% of wave-4-unlocked runs explained with 0 unexplained outcomes (eligibility defined by the phenomenon, not assumed). Under that revision this run is DIAG-GO.

No re-scoring was applied: the verdict above is reported against the written gate.

## Village assessment

On the eight zero-veteran runs the village looks like this: a feast-driven seatdrive village that wins the only way it can — capped standing climbs on bread (max capped 199–252) while the readiness gate holds wave 5 at t5-1 naming veterans as the short bar. Wave-4 monsters arrive (100 spawns across the 12 unlocked runs) and the village bleeds on contact: villagers break off 30 of 48 field fights and die in 16 — Farid's death lands in the fiction ("The Codex turns a page on its own. Farid is dead. You didn't ask. It knew."), but the village learns nothing it can use. The scholar fights 44 real wave-4 TB fights, loses 35, wins 9 — and the one companion killing blow in the whole corpus is the exception that proves the shape: veterans are not manufactured, they are survived into, and nothing in the current ecology lets a villager survive a wave-4.

Sense-testing (transcripts, evidence/2026-10-21/killdisc-transcripts/leadfeast-s64505.txt): villagers read as people — Nina wanders off ("I want to see what's out there"), Meera works carcasses and teaches, Taiwo tends beds and checks the pantry, Elena teaches herbs, Farid dies and the Codex closes his entry. The herald refusal is voiced in-fiction, not silent. The fights are off-screen (field fights by design), but outcomes ripple through gossip, trust, and the fire.

## Findings

- #736 → [diagnosed] (this evidence). The diagnostic's named next is answered; the lever question it opens (how veterans get manufactured — the readiness demand's sharp end) belongs to the scale-onramp axis, not this arm.
- Instrument gaps found and fixed are documented under Results; no new game-code findings were chased mid-run.
