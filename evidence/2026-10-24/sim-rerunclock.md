# sim-rerunclock — RERUN-CLOCK census on CURRENT master

**Run:** fleshout loop, arm sim-rerunclock (parent run id held by the coordinator) · **Arm:** sim-rerunclock · **Axis:** scale-onramp (standing directive)
**Type:** DIAG (instrument-only, zero src/js) · **Verdict: NO-GO** (verdict leg unmet — see below; census leg and instrument leg met, and the reason for the miss is itself the finding)
**Anchor:** 7ee04fd0f (worktree HEAD at run start; branch sim-rerunclock) · **Prior census:** sim-postunlock2-b (708xx, wallseg stack): 4/32 doors, all lost 48–63d post-door at overtime tier 6
**Evidence:** `evidence/2026-10-24/sim-rerunclock.md` · **Corpus:** `evidence/2026-10-24/perseed-rerunclock/` (16 configs: 8 pilot + 8 extension) + `sim-rerunclock-attribution.json`
**Instruments:** `scripts/sim-rerunclock-{sweep,analyze,sense,instrument}.js` (new, this arm) + `scripts/postunlock-instrument.js` (read-only reuse) + `scripts/sim-postunlock2-b-writer.js` (read-only reuse for EPERM-proof writes)
**Proof:** `scripts/test-sim-rerunclock.js` (E1–E5, 18 checks green)

## Verdict, in one paragraph

**Under the pure-competent baseline, the rerun-clock question is unanswerable — because no village ever reaches the clock.** All 16 configs (fresh band 73101–73116, competent policy, 180d death-aware) end at overtime tier 0 with zero rerun fights and zero wave-5 fights: national 0/16, table 0/16, doors 0/16, and — the sharpest line in the corpus — rank `village` on all 2,707 daily trace rows (not even regional, once). The pre-registered DIAG bar therefore fails on its verdict leg: there is no door-open / national-reached config to name a trajectory for, and no post-door killer to choose between rerun-clock and single-apex. This is **NO-GO, not a vacuous GO**: the analyzer's `diagGo` flag is vacuously true (every one of zero qualifying configs is attributed), and this evidence overrules that flag against the brief's bar, which requires a verdict naming rerun-clock vs single-apex — 'no qualifying configs' names neither. The miss is not an instrument failure (the instrument proved itself: 2,707 trace rows, 0 instrument errors, byte-identical determinism on a pinned config) and it is not a re-score: the bar was written before sweeping, the extension rule fired exactly as written (0 qualifying < 2 → +8 configs), and the verdict follows the numbers. What the run establishes instead is a prior wall: **the overtime regime is gated behind scale drives that plain competent play never engages** — postunlock2-b's tier-6 grind exists only on the wallseg-driven substrate, and a competent player with no link/courtship drive never even meets the table. The next DIAG on this question must either use the wallseg-stack baseline (where doors exist) or treat "competent reaches national" as its own prior experiment; it must not re-run this baseline expecting a different answer.

## Pre-registration (binding, MEASUREMENT.md §14 — written BEFORE sweeping)

- **PRIMARY (this run's DIAG bar):** the census completes (every planned config present) AND overtime-tier trajectory + rerun-fight counts are named for EVERY door-open / national-reached config, with a verdict naming whether the rerun clock or a single apex fight is the post-door killer.
- **GO iff** all three hold. A miss is NO-GO, never re-scored mid-run.
- **POLICY (shared baseline):** pure competent (`scripts/policies/competent.js`, no env-gated levers, no wallseg/trustbuffer/vetformation stack). DELIBERATE substrate difference from sim-postunlock2-b: comparisons to postunlock2-b are RATE-LEVEL and failure-mode-level only, never matched-config.
- **HORIZON:** 180d death-aware (dead villages stop; never a fixed 200d).
- **SEEDS:** FRESH band 73101–73108 × competent = 8 configs (pilot). Verified unused at run start: no exact `s7310[1-8]` / `-7310[1-8].json` filename anywhere in this worktree's evidence/ tree, and no 7310x hit in evidence/2026-10-24/ content. (719/709/710-style hits are small-seed filenames, not this 5-digit band.)
- **EXTENSION RULE (decided now, not mid-run):** if qualifying configs (national==1 OR door w5Day!=null) number < 2 after the pilot, extend to 73109–73116 (8 more configs, same policy). If >= 2, the pilot stands as the census. FIRED: pilot returned 0 qualifying → extension ran (73109–73116), still 0 qualifying.
- **TRAJECTORY (what "named" means):** per qualifying config — nationalDay, tableDay, tierFirst 1..6, tierAtNational, tierAtDoor, tierAtEnd, daysAtTier, windowOpen, daysPostDoor / daysPostNational, rerun counts (all / w4 / w5 / post-national / post-door / post-window), killerClass + reason. Daily trace rows are state at the START of each game-day, so first-hit days are accurate to within one day. With zero qualifying configs, this section is empty by measurement, not by omission — the corpus-wide trajectory (tier 0, rank village, every day) is reported in full below.
- **KILLER-CLASS RULE (pre-registered, in the instrument):** not lost → survived; lost AND end tier >= 4 AND >= 4 rerun fights in the post-window → rerun-clock; lost AND last villager death within 3d of a wave-5 fight AND < 4 rerun fights in the window → single-apex; otherwise mixed/other. The post-window opens at min(nationalDay, w5Day) when either exists.
- **CENSUS VERDICT RULE (pre-registered, in the analyzer):** 'rerun-clock' iff a majority of LOST qualifying configs classify rerun-clock; 'single-apex' iff a majority classify single-apex; otherwise 'mixed/other'; 'no lost qualifying configs' / 'no qualifying configs' when those populations are empty. The analyzer returned 'no qualifying configs'; that is a census output, not the brief's requested verdict — hence NO-GO on the verdict leg.
- **BALANCED PANEL (§15):** N/A by construction for this DIAG census — no intervention, no before/after comparison (same reason as postunlock2-b). The pre-registered bar judges.

## Census (16 configs; pilot + extension identical in shape)

| seed | w4 day | w5 day | end | national | table | maxWave |
|---|---|---|---|---|---|---|
| 73101 | — | — | survived d180 | 0 | 0 | 3 |
| 73102 | 122 | — | lost d157 | 0 | 0 | 4 |
| 73103 | — | — | survived d180 | 0 | 0 | 3 |
| 73104 | 173 | — | survived d180 | 0 | 0 | 4 |
| 73105 | 156 | — | survived d180 | 0 | 0 | 4 |
| 73106 | — | — | survived d180 | 0 | 0 | 3 |
| 73107 | — | — | lost d102 | 0 | 0 | 3 |
| 73108 | 147 | — | lost d170 | 0 | 0 | 4 |
| 73109 | 167 | — | survived d180 | 0 | 0 | 4 |
| 73110 | — | — | survived d180 | 0 | 0 | 3 |
| 73111 | 176 | — | survived d180 | 0 | 0 | 4 |
| 73112 | 140 | — | survived d180 | 0 | 0 | 4 |
| 73113 | 127 | — | survived d180 | 0 | 0 | 4 |
| 73114 | — | — | survived d180 | 0 | 0 | 2 |
| 73115 | 143 | — | survived d180 | 0 | 0 | 4 |
| 73116 | — | — | lost d119 | 0 | 0 | 3 |

Wave 4 arrives late when it arrives at all (d122–176, 9/16 configs) and never converts into a door, a table, or a rank change. Standing is not the blocker in the naive sense: final standing reaches 205 (73105), 185 (73102), 150 (73108) — yet rank stays `village` every day. Scale rank reads the hierarchy flags (nationalLive/globalLive), not standing; nothing in pure competent play sets them in 180 days.

## Wall numbers

| metric | overall (n=16) |
|---|---|
| national | 0 |
| table | 0 |
| wins | 0 |
| exiled | 0 |
| wave 4 unlocks | 9 |
| wave 5 unlocks (doors) | 0 |
| village-lost | 4 |
| survived to cap | 12 |
| median survival | 180d |
| max survival | 180d |

Corpus totals: 351 fights (wave 1: 203, wave 2: 59, wave 3: 67, wave 4: 22, wave 5: 0), **0 rerun fights**, 170 villager deaths (combat 78, monster 25, sickness 11, ambush 10, wound-that-wouldn't-close 10, alien 8, starvation 7, dehydration 7, contest 7, other named 7), 2,707 daily trace rows — **all tier 0, all rank village**. Instrument errors: 0 across all 16 configs.

## Qualifying windows (trajectory + rerun counts)

None. Qualifying = national==1 OR w5Day!=null; the corpus has zero such configs in either the pilot or the extension. The corpus-wide trajectory, which IS the finding, is: tierFirst 1..6 all null, tierAtEnd 0 in all 16 configs, daysAtTier {0: 2707}, nationalDay null, tableDay null, rerun counts all 0 (all / w4 / w5 / post-national / post-door / post-window). The four lost configs classify `mixed/other` under the pre-registered killer rule (lost, tier 0, no rerun window) — they died to ordinary mid-game attrition (combat/monster/sickness), not to any post-door mechanism, because no post-door window ever opened.

## Honest comparison (rate-level only — different substrate, different band)

| census | substrate | doors | national | post-door deaths |
|---|---|---|---|---|
| postunlock2-b (708xx, n=32) | wallseg stack (trustbuffer + vetformation + feastscale chain) | 4/32 (12.5%) | 18/32 | 4/4, lost 48–63d later at tier 6 |
| **this census (731xx, n=16)** | **pure competent, no env levers** | **0/16** | **0/16** | **n/a — no doors, no table, no overtime** |

This is a substrate contrast, not a drift claim: the wallseg stack is what carries villages to national/table/doors on current master. Strip it away and the competent bot is a village that survives (12/16 to the cap) but never scales — it does not starve mid-ambition (the 2026-10-12 shape), it never starts the ambition. That reframes the scale wall for the pure-competent baseline: the wall is not at national, it is before regional — the first accord / first link never happens.

## Reachability verdict

- **Wave 5 unlock / the door:** NOT REACHED under this baseline — 0/16. (Reachable on the wallseg substrate per postunlock2-b; this baseline cannot speak to it.)
- **Overtime / rerun fights:** NOT REACHED — tier 0 everywhere, 0 rerun fights, 0 wave-5 fights. The rerun clock is unreachable in this regime, which is why the rerun-vs-apex verdict cannot be named.
- **National / table / win:** NOT REACHED — 0/16 each. Regional is not reached either (rank village on every traced day).
- **Wave 4:** reached, late — 9/16, d122–176.
- **Arc II/III/IV, vests:** NOT measured by this DIAG (no arc/vest instrumentation in the corpus) — not claimed either way.

## Village assessment (plain words)

These are durable villages, not starving ones. Twelve of sixteen reach day 180 with pantries that feed them, codexes in the 80s (sense replay: 81–82 entries by day 178), villagers teaching each other plants, discovering synergies, arguing about the watch rotation, and leaving surplus by the fire when the shelves are full. They fight mostly wave-1 animals (203 of 351 fights), die mostly to combat and monsters and sickness in ones and twos, and never once look beyond the village: no envoy is followed up, no accord is struck, no regional dawn arrives. The strongest villages by standing (73105 at 205, 73102 at 185) are exactly as village-bound as the weakest. What is missing is not food, not courage, not knowledge — it is the scale drive itself: the link-forming, accord-seeking behavior that the wallseg stack supplies from outside the competent base. A good run here is a village that has filled in every blank except the one that matters for the scale wall, and it does not know the blank exists.

## Sense-testing (SENSE-TESTING LAW) — PASS (with the divergence stated)

Sense target: **s73102, narration:true replay (MARKED NON-MEASURED)**. The replay diverges from the measured run as narration replays always do — measured: lost d157, w4 d122; replay: survived d180, w4 d166 — same village shape (no national, no table, no overtime), different ending. Transcript: `perseed-rerunclock/sim-rerunclock-sense.txt` (240 lines, d177–181, sayLive=true). The window is late-run daily life, not a post-door window — there is none to sense, which is the point.

- **Villagers act like people — PASS.** Yara teaches Camu-camu by the fire ("See the leaves? Like that. Don't mix it up." / "The Codex grows — the human way"); David discovers two synergies in one day (Field Pharmacy, Fever's End); Abril discovers two more (Everybody's Friend, Word of Mouth); gossip mutates as it travels ("The story's getting bigger than what happened" / "Half of it's true anymore. You're not sure which half"); Ethan and Yara argue about the watch rotation ("Again. It's almost comforting"); pantry-full behavior is behavioral, not a trim ("Shelves are full to bursting. Patching the boots today." / "We're feeding the shelves more than ourselves. Not today.").
- **The wider world knocks and is not answered.** "WORD TRAVELS — riders from The Bloodied bring talk of Haven. Out there they call you the Indispensable. Other villages send envoys now." The envoys arrive in the transcript and nothing follows — no accord, no rank change, no table. That single beat is the whole census in miniature.
- **Honest caveats:** (1) "David traded something with someone for something else. The barter economy stirs." repeats verbatim — a generic line, not a failure. (2) "You wait. The light changes. Nothing asks anything of you." and the pack-full warnings repeat across days — idle-day filler, legible but loopy. (3) The sense window covers only the last days because the ring is 240 lines; daily village life mid-run is sampled, not surveyed.

## New findings (for the coordinator to append to sim-findings.md — NOT edited here)

1. **[open] 2026-10-24 — scale-onramp / competent baseline — pure competent play NEVER leaves village rank in 180d (0/16 national, 0/16 regional, 2,707/2,707 trace rows rank village; standing to 205 changes nothing). The overtime/rerun regime is unreachable under this baseline, so the rerun-vs-apex question cannot be answered on it. The next DIAG on #861 must use the wallseg-stack baseline or first solve competent-scale. (this run)**
2. **[open] 2026-10-24 — analyzer honesty — sim-rerunclock-analyze.js's `diagGo` flag is vacuously true on an empty qualifying population. The evidence overruled it against the brief's bar; the flag should be tightened (require >= 1 qualifying config) before another arm leans on it. (this run)**
3. **[open] 2026-10-24 — envoys without follow-through — sense replay shows other villages' envoys arriving ("Other villages send envoys now") with no accord, rank, or table following in 180d of competent play. The envoy→accord step is the visible gap, not envoy arrival. (this run)**

## Metric review (§14)

The pre-registered bar is judged as written, and it fails on exactly one leg: census complete (16/16, 0 missing) ✓; trajectory+rerun counts named for every qualifying config — vacuously satisfied, and the corpus-wide trajectory is fully reported ✓; verdict naming rerun-clock vs single-apex ✗ — the analyzer's rule output ('no qualifying configs') is not that verdict, and claiming otherwise would be re-scoring against a friendlier metric. No re-scoring happened: the extension rule fired exactly as pre-registered, the killer-class and verdict rules were applied as written, and the NO-GO follows the header, not a revised one.
**Proposed revision for the NEXT run (not applied here):** add a qualifying-floor to the bar — "GO additionally requires >= 2 qualifying configs; fewer is NO-GO (empty-population), not GO" — and tighten the analyzer's `diagGo` to match (require qualifyingTotal >= 1 at minimum). Also: the next rerun-clock DIAG should pre-register its substrate explicitly as wallseg-stack if it wants post-door windows, since this run proves pure competent yields none.
**Balanced panel (§15):** N/A by construction for this DIAG census — no intervention, no before/after comparison. The pre-registered bar judges, as the brief allows.

## Proof tests (scripts/test-sim-rerunclock.js) — 18 passed, 0 failed

- E1 trajectory derivation: PASS — nationalDay, tierFirst, tierAtNational/Door/End, rerun window counts on synthetic data.
- E2 killer-class rules: PASS — rerun-clock / single-apex / survived / mixed-other branches.
- E3 live instrument: PASS — 30d pinned run fills the daily trace, days monotonic, tiers >= 0, 0 instrument errors.
- E4 determinism: PASS — identical daily-trace and trajectory hashes on a re-run of the pinned config.
- E5 census bar on a synthetic corpus: PASS — analyzer diagGo + rerun-clock verdict on qualifying fixtures (this gate proves the analyzer machinery; the real corpus's empty population is what the evidence judges, and the evidence overrules the vacuous flag — see Metric review).

## Convergence

**NO-GO** | the #861 rerun-vs-apex question is NOT answered on this baseline, and the reason is measured, not missing: pure competent play never reaches the overtime regime. The instrument is proven and reusable (daily tier trace + postunlock fight/death recorder + pre-registered killer rules); the next run to answer #861 needs a baseline that actually opens doors. The scale-onramp axis is untouched by this run's miss — if anything the wall moved earlier: before regional, not at national.

## Blanks filled (builder)

1. **Daily overtime-tier trajectory instrument** (new, proven): per-day rank/tier/table/seat/wave/roster/standing trace + pure trajectory derivation + pre-registered killer classification, with a determinism proof on a pinned config.
2. **Fresh-band competent census on current master** (16 configs, 0 → 0 qualifying via the pre-registered extension): the first measurement of what pure competent play does without the wallseg stack — survives, never scales.
3. **Analyzer-honesty catch:** the vacuous-`diagGo` flag, documented and overruled in the open rather than shipped as a GO.
