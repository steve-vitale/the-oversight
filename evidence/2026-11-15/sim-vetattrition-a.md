# sim-vetattrition-a — Veteran Attrition DIAG

**Run:** fleshout-20261115T2015Z, Loop A, axis scale-onramp. **Arm:** sim-vetattrition-a.
**Prereg:** `evidence/2026-11-15/sim-vetattrition-a-prereg.md` (commit `5c5abe086`), Correction 1 (`95b19a85f`), Correction 2 (`6cabd7916`).
**Branch:** `sim-vetattrition-a` (worktree `~/workspace/worktrees/sim-vetattrition-a`, base `605d72bd4`). **No game-code change — measurement only.**
**Analyzer:** `scripts/vetattrition-analyze-20261115.js` (v3). **Proof:** `scripts/test-vetattrition-a.js` — **73/73 green**.
**Judged output:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/vetattrition-a-output.json`.

## Verdict: NO-GO (DIAG bar missed on criterion 2 only)

The frozen DIAG GO criterion required ≥90% of all 139 veteran exits/drops classified. **Result: 116/139 = 83.5% — NO-GO.** The miss is entirely a recorder gap, not a mechanism gap: the T-class legs classify **70/70 (100%)**; the G-class legs classify **46/69 (67%)**, with the residue 23 AMBIGUOUS drops that the G recorder cannot resolve because its death rows carry no victim identity (no vid, no veteran flag) and several villagers die on the same day. A sensitivity pass (exact-set + uniform-cause attribution) resolves **0/23** — the residue is genuinely unresolvable from these corpora, not an analyzer shortcut.

**The mechanism is nevertheless named, with per-seed counts, and it survives the residue:** even if all 23 AMBIGUOUS drops were non-WILD, WILD would still be 76/139 = 55% of all exits. The mechanism below is the answer to the question as posed; the NO-GO is a verdict on the bar, and the next arm's job is a recorder fix (per-victim identity in the G-class recorder), not a re-argument of the mechanism.

## §1 Question and corpora

**Question (from the 1615Z scale-onramp review):** why do living veterans bleed to zero after wave 5 unlocks? Every unlocked seed opens at vet5 = 2, then vet5 ends at 0 in 5/10 armed unlocked villages (wave5kill-b); 6/8 seeds short on living veterans (7redef-match); 0 living wave-4 veterans at end on all 16 fresh-band seeds (2b-fresh); tribute veterans-short on every seed. The gate measures a moment, not a durable state.

**Frozen corpora (7 dirs, 72 files, read-only):**

| Leg | Class | Dir | Seeds | Survived | Unlocked |
|---|---|---|---|---|---|
| 7redef-match baseline | T (vetfirst) | `evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-7redef-match/` | 190391–190398 | 8/8 | 4/8 |
| guardablate baseline | T | `evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-guardablate/` | 190391–190398 | 4/8 | 4/8 |
| guardablate subject (guard removed) | T | `evidence/2026-11-13/perseed-culpritbisect-a-tguardablate/` | 190391–190398 | 1/8 | 1/8 |
| 2b-fresh baseline | T | `evidence/2026-11-15/perseed-transplant2b-fresh-t2b-fresh-203a32775/` | 190621–190628 | 0/8 | 3/8 |
| 2b-fresh subject | T | `evidence/2026-11-15/perseed-transplant2b-fresh-t2b-fresh-385a9f7b6/` | 190621–190628 | 0/8 | 3/8 |
| gorgeprice2 confirm control | G (cascade) | `evidence/2026-11-15/perseed-gorgeprice2-b-confirm-control/` | 100521–100536 | —* | 4/16 |
| gorgeprice2 confirm armed | G | `evidence/2026-11-15/perseed-gorgeprice2-b-confirm-on/` | 100521–100536 | —* | 10/16 |
| **Total** | | | **72** | | **29/72** |

\* G legs are 150-day capped panels; survival is not their judged wall metric here. Wall numbers across the 72 files: national 30/72 (0/40 T, 30/32 G), table 0/72, wins 0/72, wave-5 unlocked 29/72.

**Corpus classes.** Class T (vetfirst instrument) carries daily snapshots with `vetsW4.killers` (vid, name, first/last day, maxWave, kills, scholarAtKill, pyrrhicKills), `waveKillLog`, `veteranRows` (party, armor, weapon, assignment, hp), `partyMembers`, `ready4/ready5`, `regDeaths` (day, kind, villagerId, name, cause, killerId), and spawn/fight/killCall records with day+wave. Class G (balance-panel/cascade recorder) carries daily `series` rows with `vet5/vet4`, `wk`, `rd5ready/rd5short`, `w5` distinct faced; `events` with exact `unlockedWave` days; `deaths` {day, kind, who, cause, player}. No waveKillLog, no victim names, no party records.

## §2 Method

**Classifier** (`scripts/vetattrition-analyze-20261115.js`, v3): walks each per-seed file and emits per-seed veteran-exit/drop tables (vet5 at unlock, vet5 at end, every exit classified).

- **T exits:** every vetsW4 exit (vid present snapshot *i*, absent *i+1*, never returns) + BORN-DEAD (pyrrhic w4+ log entry whose `by` never appears in any vetsW4 snapshot). Death row = regDeaths with villagerId == vid in window [prevSnap.day, exitSnap.day] — **left-inclusive** (Correction 1a; snapshots are start-of-day, proven by Carlos Diaz 7redef 190391: last seen snapshot 140, regDeaths day 140 cause "the wild" player:true; Ashanti Du 190394: 48→49, death day 48). Non-death exit = no row (investigate individually — none remained after corrections).
- **G drops:** every vet5 DROP between consecutive series rows; window [prev.d, cur.d] (closed — deaths stamped cur.d are overnight deaths already reflected in row cur.d; proven: 28 drops have their ONLY candidate death on cur.d). UNIQUE iff magnitude 1 AND exactly 1 villager-death candidate; MULTI (≥2) or magnitude > candidates → AMBIGUOUS (counts UNCLASSIFIED); 0 candidates → NON-DEATH-EXIT.
- **Cause classes:** W5-FIGHT / W4-FIGHT / W3-LOWER-FIGHT (T only, fight record on death day or day before) / MONSTER-UNKNOWN-WAVE / W5-ERA / PRE-W5-ERA (G only, by first-faced day) / ARENA / CONTEST / AMBUSH / WILD (cause "the wild" = death in the wild; mostly scholar) / ROAD-EXPEDITION / OTHER:\<cause\> / NON-DEATH-EXIT / AMBIGUOUS.
- **T unlock day** (Corrections 1b+2): first snapshot day with ready5.ready AND samples.standing ≥ 200 AND wave-4 spawn/kill seen; unlock = min(derived day, first GATED w5 spawn day); gated spawn alone if derived null; null if neither. **7 phantom unlocks found and excluded** — seeds whose only w5 spawns are the non-gated `titanPlace` / `Object.finaleCampaignPlace` callers (maxWave 4): 7redef 190392/190395/190397, guardablate 190392/190393, tguardablate 190395, 2b-subject 190627. Gated spawn callers are `Object.checkEncounter` and `Object.maintainWorldMonsters` only. **G unlock day:** exact from the `unlockedWave` event day 5.
- **Window validation:** G [prev,cur] gives 46 UNIQUE / 23 AMBIG / 0 NON-DEATH; [prev,cur) gives 29 UNIQUE / 5 AMBIG / 35 NON-DEATH — the 28 drops whose only candidate is on cur.d prove the closed window is correct.
- **T unlock lag diagnostic:** the derived unlock day precedes the first gated w5 spawn by days (e.g. 190391 lag −23, 190394/190396/190398 lag −11) — unlock precedes first spawn, as expected.

**DIAG GO criterion (frozen, unchanged):** GO iff (1) per-seed tables complete for all 72 files, 0 instrument errors; (2) ≥90% of ALL 139 exits/drops CLASSIFIED (AMBIGUOUS + unexplained NON-DEATH-EXIT = UNCLASSIFIED, residue named with counts); (3) mechanism named in plain words with pooled shares, wave split, fight/road/wound split, timing vs unlock, party/solo/off-screen split, plus explicit "corpora cannot answer X"; (4) next-lever spec written prereg-ready. A miss on the 90% bar is NO-GO even if a mechanism looks plausible.

## §3 Per-seed veteran tables

Columns: seed | unlock day | vet5@unlock | vet5@end | w4 kills (T only) | exits (drops) | classified | scholar deaths | causes | days-after-unlock (unlocked seeds only).

### 7redef-match baseline (T, 12 exits, 12 classified)

| seed | unlock | vet5@u | vet5@end | w4k | exits | class | sch | causes | d-after-u |
|---|---|---|---|---|---|---|---|---|---|
| 190391 | 105 | 2 | 1 | 4 | 2 | 2 | 1 | MONSTER-UNKNOWN 1, WILD 1 | 3, 36 |
| 190392 | — | — | 0 | 1 | 1 | 1 | 1 | ARENA 1 | — |
| 190393 | — | — | 0 | 3 | 2 | 2 | 1 | WILD 1, MONSTER-UNKNOWN 1 | — |
| 190394 | 121 | 2 | 0 | 6 | 3 | 3 | 1 | WILD 1, W3-LOWER 1, starvation 1 | −72, 8, 28 |
| 190395 | — | — | 1 | 7 | 2 | 2 | 1 | WILD 1, MONSTER-UNKNOWN 1 | — |
| 190396 | 136 | 2 | 2 | 3 | 0 | 0 | 0 | — | — |
| 190397 | — | — | 1 | 2 | 1 | 1 | 1 | WILD 1 | — |
| 190398 | 106 | 2 | 1 | 3 | 1 | 1 | 1 | ARENA 1 | 32 |

Pooled: unlocked 4/8, vet5@unlock=2 on 4/4, vet5@end=0 on 3/8, born-dead 1, partyDays 329, inPartyDeaths 0, veteran-days in party 87/3177 (2.7%).

### guardablate baseline (T, 12 exits, 12 classified)

| seed | unlock | vet5@u | vet5@end | w4k | exits | class | sch | causes | d-after-u |
|---|---|---|---|---|---|---|---|---|---|
| 190391 | 136 | 2 | 1 | 5 | 3 | 3 | 2 | WILD 2, wound 1 | −47, −18, 15 |
| 190392 | — | — | 1 | 2 | 0 | 0 | 0 | — | — |
| 190393 | — | — | 1 | 1 | 0 | 0 | 0 | — | — |
| 190394 | 105 | 2 | 0 | 5 | 3 | 3 | 2 | WILD 3 | 26, 29, 35 |
| 190395 | — | — | 0 | 0 | 0 | 0 | 0 | — | — |
| 190396 | 137 | 2 | 0 | 4 | 3 | 3 | 1 | night 1, W5-FIGHT 1, wound_fever 1 | −29, 13, 13 |
| 190397 | — | — | 0 | 0 | 0 | 0 | 0 | — | — |
| 190398 | 129 | 2 | 1 | 4 | 3 | 3 | 2 | WILD 3 | −10, 1, 1 |

Pooled: unlocked 4/8, vet5@unlock=2 on 4/4, vet5@end=0 on 4/8, born-dead 0, partyDays 137, inPartyDeaths 0, veteran-days in party 14/2075 (0.7%). **The single W5-FIGHT death in the whole corpus is here** (190396).

### guardablate subject, guard removed (T, 17 exits, 17 classified)

| seed | unlock | vet5@u | vet5@end | w4k | exits | class | sch | causes | d-after-u |
|---|---|---|---|---|---|---|---|---|---|
| 190391 | 115 | 2 | 0 | 6 | 4 | 4 | 3 | dehydration 1, WILD 3 | −53, 10, 17, 20 |
| 190392 | — | — | 0 | 6 | 3 | 3 | 3 | WILD 2, ARENA 1 | — |
| 190393 | — | — | 0 | 2 | 2 | 2 | 2 | WILD 1, CONTEST 1 | — |
| 190394 | — | — | 0 | 0 | 0 | 0 | 0 | — | — |
| 190395 | — | — | 0 | 4 | 4 | 4 | 3 | stranger 1, WILD 2, W4-FIGHT 1 | — |
| 190396 | — | — | 0 | 3 | 2 | 2 | 2 | WILD 2 | — |
| 190397 | — | — | 0 | 0 | 0 | 0 | 0 | — | — |
| 190398 | — | — | 1 | 4 | 2 | 2 | 2 | stranger 1, WILD 1 | — |

Pooled: unlocked 1/8, vet5@unlock=2 on 1/1, vet5@end=0 on 7/8, born-dead 1, partyDays 92, inPartyDeaths 0, veteran-days in party 0/1255 (0%). **Scholar deaths 15/17 (88%) — the worst leg, guard OFF.** The CASCADE lingerer guard protects veterans indirectly by protecting scholars, but WILD deaths persist with the guard ON (5–13 per 8-seed leg), so the lingerer is only one wild-death path.

### 2b-fresh baseline (T, 12 exits, 12 classified)

| seed | unlock | vet5@u | vet5@end | w4k | exits | class | sch | causes | d-after-u |
|---|---|---|---|---|---|---|---|---|---|
| 190621 | — | — | 1 | 1 | 0 | 0 | 0 | — | — |
| 190622 | — | — | 0 | 1 | 1 | 1 | 0 | phoenix link 1 | — |
| 190623 | 72 | 2 | 0 | 2 | 2 | 2 | 1 | WILD 2 | 1, 8 |
| 190624 | — | — | 0 | 1 | 1 | 1 | 1 | WILD 1 | — |
| 190625 | — | — | 0 | 0 | 0 | 0 | 0 | — | — |
| 190626 | 75 | 2 | 0 | 6 | 2 | 2 | 2 | dehydration 1, WILD 1 | 7, 22 |
| 190627 | — | — | 0 | 1 | 1 | 1 | 1 | WILD 1 | — |
| 190628 | 101 | 0* | 0 | 6 | 5 | 5 | 4 | WILD 5 | −26, 20, 25, 34, 35 |

\* 190628 reads vet5@unlock 0 on the unlock-day snapshot — a start-of-day artifact: the second veteran was made during day 101 itself, after the snapshot, and the gated spawn marking unlock happened the same day. Every other unlocked seed in the whole corpus reads exactly 2.

Pooled: unlocked 3/8, vet5@unlock=2 on 2/3 (plus the 190628 artifact), vet5@end=0 on 7/8, born-dead 0, partyDays 232, inPartyDeaths 0, veteran-days in party 27/1394 (1.9%).

### 2b-fresh subject (T, 17 exits, 17 classified)

| seed | unlock | vet5@u | vet5@end | w4k | exits | class | sch | causes | d-after-u |
|---|---|---|---|---|---|---|---|---|---|
| 190621 | — | — | 0 | 0 | 0 | 0 | 0 | — | — |
| 190622 | 97 | 2 | 0 | 3 | 3 | 3 | 2 | WILD 2, CONTEST 1 | 22, 22, 35 |
| 190623 | 111 | 2 | 0 | 5 | 3 | 3 | 2 | stranger 1, WILD 2 | 10, 12, 20 |
| 190624 | — | — | 1 | 3 | 2 | 2 | 2 | WILD 2 | — |
| 190625 | 52 | 2 | 1 | 10 | 4 | 4 | 4 | WILD 4 | 11, 13, 46, 61 |
| 190626 | — | — | 0 | 2 | 2 | 2 | 1 | stranger 1, W4-FIGHT 1 | — |
| 190627 | — | — | 0 | 2 | 1 | 1 | 1 | WILD 1 | — |
| 190628 | — | — | 0 | 2 | 2 | 2 | 2 | WILD 2 | — |

Pooled: unlocked 3/8, vet5@unlock=2 on 3/3, vet5@end=0 on 6/8, born-dead 0, partyDays 285, inPartyDeaths 0, veteran-days in party 88/1885 (4.7%). 190625 made the most wave-4 kills in the corpus (10) and still ended at vet5 1 — the inflow exists, the outflow eats it.

### gorgeprice2 confirm control (G, 30 drops, 17 classified, 13 AMBIGUOUS)

| seed | unlock | vet5@u | vet5@end | drops | class | sch | causes | d-after-u |
|---|---|---|---|---|---|---|---|---|
| 100521 | — | — | 0 | 2 | 2 | 2 | WILD 2 | — |
| 100522 | — | — | 0 | 1 | 1 | 1 | WILD 1 | — |
| 100523 | — | — | 1 | 0 | 0 | 0 | — | — |
| 100524 | 101 | 2 | 0 | 4 | 2 | 2 | WILD 2, AMBIGUOUS 2 | 37, 39, 47, 48 |
| 100525 | — | — | 0 | 4 | 2 | 2 | WILD 2, AMBIGUOUS 2 | — |
| 100526 | — | — | 0 | 1 | 0 | 0 | AMBIGUOUS 1 | — |
| 100527 | 72 | 2 | 0 | 3 | 1 | 1 | AMBIGUOUS 2, ARENA 1 | 42, 58, 73 |
| 100528 | — | — | 0 | 0 | 0 | 0 | — | — |
| 100529 | — | — | 0 | 3 | 1 | 1 | WILD 1, AMBIGUOUS 2 | — |
| 100530 | — | — | 0 | 2 | 1 | 1 | AMBIGUOUS 1, WILD 1 | — |
| 100531 | — | — | 0 | 1 | 1 | 1 | WILD 1 | — |
| 100532 | — | — | 0 | 1 | 0 | 0 | AMBIGUOUS 1 | — |
| 100533 | — | — | 0 | 0 | 0 | 0 | — | — |
| 100534 | 103 | 2 | 3 | 2 | 2 | 2 | WILD 2 | 41, 47 |
| 100535 | — | — | 0 | 1 | 1 | 1 | WILD 1 | — |
| 100536 | 117 | 2 | 1 | 5 | 3 | 3 | AMBIGUOUS 2, WILD 3 | −72, −28, 2, 13, 16 |

Pooled: unlocked 4/16, vet5@unlock=2 on 4/4, vet5@end=0 on 13/16, classified 17/30 (57%).

### gorgeprice2 confirm armed (G, 39 drops, 29 classified, 10 AMBIGUOUS)

| seed | unlock | vet5@u | vet5@end | drops | class | sch | causes | d-after-u |
|---|---|---|---|---|---|---|---|---|
| 100521 | 77 | 2 | 1 | 2 | 2 | 2 | WILD 2 | 13, 30 |
| 100522 | 89 | 2 | 1 | 3 | 0 | 0 | AMBIGUOUS 3 | 2, 17, 54 |
| 100523 | — | — | 1 | 0 | 0 | 0 | — | — |
| 100524 | — | — | 0 | 4 | 2 | 1 | PRE-W5-ERA 1, AMBIGUOUS 2, WILD 1 | — |
| 100525 | 107 | 2 | 0 | 3 | 1 | 1 | stranger 1, AMBIGUOUS 2 | −47, 20, 24 |
| 100526 | — | — | 1 | 4 | 3 | 3 | stranger 1, dehydration 1, AMBIGUOUS 1, WILD 1 | — |
| 100527 | 106 | 2 | 0 | 3 | 2 | 1 | W5-ERA 1, AMBIGUOUS 1, stranger 1 | 9, 13, 27 |
| 100528 | 77 | 2 | 0 | 5 | 5 | 3 | WILD 2, night 1, W5-ERA 2 | 8, 17, 45, 53, 59 |
| 100529 | 130 | 2 | 1 | 1 | 1 | 1 | sickness 1 | 8 |
| 100530 | 125 | 2 | 2 | 2 | 2 | 2 | WILD 2 | −36, 9 |
| 100531 | — | — | 1 | 0 | 0 | 0 | — | — |
| 100532 | 108 | 2 | 1 | 2 | 2 | 2 | WILD 2 | 7, 26 |
| 100533 | 85 | 2 | 0 | 2 | 2 | 1 | thirst 1, CONTEST 1 | 32, 36 |
| 100534 | 137 | 2 | 0 | 4 | 4 | 3 | CONTEST 1, WILD 1, stranger 1, PRE-W5-ERA 1 | −51, −24, 2, 13 |
| 100535 | — | — | 1 | 1 | 1 | 1 | WILD 1 | — |
| 100536 | — | — | 0 | 3 | 2 | 2 | WILD 1, CONTEST 1, AMBIGUOUS 1 | — |

Pooled: unlocked 10/16, vet5@unlock=2 on 10/10, vet5@end=0 on 7/16, classified 29/39 (74%).

## §4 Cause shares

**Pooled (139 exits/drops):** WILD 76 (54.7% of all; 65.5% of classified), AMBIGUOUS 23 (16.5%), OTHER:a stranger 8, CONTEST 5, ARENA 4, MONSTER-UNKNOWN-WAVE 3, W5-ERA 3, dehydration 3, W4-FIGHT 2, PRE-W5-ERA 2, the night 2, W5-FIGHT 1, W3-LOWER-FIGHT 1, starvation 1, wound_fever 1, a wound that wouldn't close 1, sickness 1, thirst 1, the phoenix link 1. NON-DEATH-EXIT 0 (after corrections).

**Per leg:** 7redef WILD 5, MONSTER-UNKNOWN 3, ARENA 2, W3-LOWER 1, starvation 1. guardablate WILD 8, wound 1, night 1, W5-FIGHT 1, wound_fever 1. tguardablate WILD 11, dehydration 1, ARENA 1, CONTEST 1, stranger 2, W4-FIGHT 1. 2b-base WILD 10, phoenix 1, dehydration 1. 2b-subj WILD 13, CONTEST 1, stranger 2, W4-FIGHT 1. G-control WILD 16, ARENA 1, AMBIGUOUS 13. G-armed WILD 13, AMBIGUOUS 10, PRE-W5-ERA 2, stranger 4, dehydration 1, W5-ERA 3, night 1, sickness 1, thirst 1, CONTEST 3.

**Fight/road/wound split (classified 116):** wave-4/5 fight deaths **3** (W5-FIGHT 1, W4-FIGHT 2 — all non-scholar villagers); wave-3-or-lower fight 1; monster kill with no fight record 3; wave-5-era monster deaths (G, cause "monster" after first faced) 3; pre-wave-5-era monster deaths 2; arena 4; contest 5; the wild 76; all other causes (stranger, dehydration, night, thirst, starvation, wound, wound_fever, sickness, phoenix) 19. Road/expedition deaths as a named cause: **0** — no exit carries a road/expedition cause (the recorder's "the wild" covers deaths away from home; see §12 gaps).

**Scholar vs villager:** T exits are scholar deaths **52/70 (74%)**; WILD|scholar 40, WILD|villager 7; ARENA|scholar 3, CONTEST|scholar 2, stranger|scholar 4, dehydration|scholar 2, night|scholar 1. G classified scholar deaths **40/69 drops** (17 control, 23 armed) as a floor — AMBIGUOUS drops may hold more. Combined: **≥92/116 classified exits are scholar deaths (79%)**. 45/70 T exits earned their veteran kills as the scholar (scholarAtKill); the scholar makes **57% of all wave-4 kills** (via player 70 of 123 w4+ log entries, +3 pyrrhic; wild 23, companion 15, aid-crisis 12).

**Residue sensitivity:** the 23 AMBIGUOUS drops carry 57 candidate deaths — "the wild" 38, "monster" 6, arena 3, thirst 2, wound 2, starvation 2, alien 1, contest 1, night 1, dehydration 1. Rule-1 attribution (exact-set + uniform cause) resolves 0/23. Even if all 23 were non-WILD, WILD would still be 76/139 = 55% — the WILD dominance does not depend on the residue.

## §5 Timing vs unlock

**vet5 at unlock is exactly 2 on 28/29 unlocked seeds** (the 29th is the 190628 snapshot artifact, §3). **vet5 at end among unlocked seeds: 0 on 16/29 (55%), 1 on 10/29, 2 on 2/29, 3 on 1/29 — mean 17/29 ≈ 0.59.** Only 2/29 end at 2 (7redef 190396, armed 100530). Across all 72 seeds, vet5 ends at 0 on 47/72 (65%).

**Days after unlock (82 exits on unlocked seeds):** 69 post-unlock (84%), 13 pre-unlock (16%). Per-leg medians: 7redef 18, guardablate 7, tguardablate 13.5, 2b-base 20, 2b-subj 21, G-control 40, G-armed 13. The bleed starts before the door opens (pre-unlock exits on unlocked seeds: 7redef 1, guardablate 4, tguardablate 1, 2b-base 1, 2b-subj 0, G-control 2, G-armed 4) and continues for weeks after — post-unlock exits stretch to +73 days (G-control 100527) and +61 (2b-subj 190625). This is a slow bleed, not a post-unlock spike.

## §6 The mechanism (plain words)

**The veteran bar is really a scholar-survival count.** The scholar makes most wave-4 kills (57% as the player; 45 of 70 T exits earned their kills as the scholar), so the two living veterans at unlock are usually the scholar plus one villager. The scholar then dies in the wild — 40 of 70 T exits are scholar deaths in the wild, 52 of 70 are scholar deaths of any cause — succession promotes a new scholar, and the veteran count drops by one. No fight, no party, no wave-5 monster is involved: **only 3 of 139 exits are wave-4/5 fight deaths**, and only 1 of those is a wave-5 fight death. The replacement scholar has to earn wave-4 kills from scratch while the village keeps losing people in the wild; the pipeline makes wave-3 killers steadily (269 wave-3 entries across the T legs) but they die before converting (224 exits, only ~84 wave-4 veteran entries), and wave-4 veterans, once made, die the same way. The gate opens at exactly vet5 = 2 on every unlocked seed with zero slack, so one scholar death re-shorts it — and the bleed had already started before the door opened. The guard-off leg is the worst (15/17 exits are scholar deaths), so the CASCADE lingerer guard protects veterans indirectly by protecting scholars — but WILD deaths persist with the guard ON (5–13 per 8-seed leg), so the lingerer is only one wild-death path.

**Party/solo/off-screen:** veterans almost never die in the scholar's party — **inPartyDeaths 0/70** — because they are almost never in it: veteran-days in party 216/9786 (2.2%); non-scholar veteran-days in party 216/7760 (2.8%). The scholar has a party on 1075 snapshot-days across the 40 T seeds (~18% of days), but veterans are almost never in it. Veterans die solo and off-screen: alone in the wild, or in fights the recorder never ties to them (MONSTER-UNKNOWN-WAVE 3, and the G AMBIGUOUS residue where the village is losing several people at once — see 100526, §12).

**Born-dead:** 2 veterans died in the fight that made them (pyrrhic wave-4 kills: 7redef 190398, tguardablate 190395) — they never appear in any vetsW4 snapshot.

## §7 Correction record: wave5kill-b "1:1 kill:death" is a misread

wave5kill-b counted `deaths` rows with `who` in the frozen wave-5 id set, with no kind filter. Kind-filtered recompute (frozen in the prereg, verified per seed):

- **Armed leg:** wave-5 kills 11, w5rows 12 — **ALL 12 kind `monster` (dead Producers)**, 0 villager deaths, 0 player flag.
- **Control leg:** kills 14, w5rows 16 — **ALL 16 kind `monster`**, 0 villager, 0 player.
- Per-seed w5rows tracks kills almost exactly (control 100534: kills 6, w5rows 7; armed 100530: kills 1, w5rows 2).

The "kill:death ratio 0.92" is kills ÷ dead-Producers ≈ 1 **by construction**; "0 scholar deaths to wave-5" is vacuous (player is false on all monster-death rows). **The vet5 2→0 attrition fact from wave5kill-b STANDS** (series vet5 field, independent of the deaths rows) — and this DIAG explains it. True villager deaths BY wave-5 monsters are not directly countable in G (the killer monster is never named); in T they are attributable only by day-proximity to wave-5 fight records. The two findings items that carried the misread ("WAVE-5 KILLS ARE THE NEXT BINDING LINK" and "SCHOLAR ABSENT FROM WAVE-5 FIGHTS") are corrected in the findings backlog (see §13).

**Why the misread happened:** `deaths` rows mix kinds — kind `monster` = a monster died (who = monster id, cause = how it died); kind `villager`/`person` = a villager died (who = villager vid, cause = generic "monster"/"the wild"/etc., killer monster NEVER named; killerId null except ambush). `player:true` = the dead one was the scholar. The harness `_liveDeaths` = tele 'death' events. `samples.deaths` = the same events as `regDeaths` (verified: 71 rows match in 190396).

## §8 The vet4 pipeline (secondary)

Across the T legs, wave-3 killer entries 269 vs exits 224 (7redef 53 in/32 out; guardablate 56/38; tguardablate 57/54; 2b-base 46/45; 2b-subj 57/55). Most wave-3 killers never make a wave-4 kill before dying. Wave-4 kills per seed range 0–10 (190625 made 10 and still ended at vet5 1). The inflow exists — the outflow (scholar wild deaths) eats it. This is why an inflow lever alone is not obviously sufficient; the next-lever spec (§10) judges inflow AND durability together.

## §9 Next-lever spec (prereg-ready — specified, NOT built)

**Primary lever: Wave-4 re-engagement party** (the same mechanism wave5kill-b named for Producers, one wave earlier). A villager who has FACED a wave-4 monster seeks out a party from other living wave-3 killers and armed villagers they have actually perceived and goes back after that wave-4 type together (party ≥ 2, persists until the type is killed or members die). Home is the persistent-party build (one-brain scorer pursuit) if it lands first — this lever is a scorer pursuit inside it, never a seventh system. Does NOT touch the readiness-bar definition (no Steve-call needed).

- **Exact change:** in the one-brain scorer, add a candidate: "re-engage the wave-4 type I faced" for any villager with a lived wave-4 facing; score rises with the number of living wave-3 killers and armed villagers that villager has perceived; the party forms from those perceived people and travels to the type's last-known place together. Party persists until the type is killed or a member dies.
- **GO threshold (pilot):** two-leg pilot on a fresh band, 8 seeds each, 150d, competent verbatim, vetfirst (T-class) instrument + this classifier: (a) mean living wave-4 veterans at end among wave-5-unlocked seeds, lever ON ≥ 1.0 AND ≥ 1.5× lever OFF; (b) survived/8 lever ON ≥ survived/8 lever OFF − 1. Baseline measured here: mean vet5@end among unlocked 0.59 (17/29); vet5@end=0 on 16/29.
- **Band:** fresh, verified unused per the seed-band freshness skill (never 100521–100536, 190391–190398, 190621–190628).
- **Horizon:** 150 days, death-aware.
- **Why this lever:** it attacks the inflow (wave-3 killers dying before converting) AND the durability (veterans made in parties, travelling together, are less exposed to the solo wild deaths that take 76/139 exits) with one mechanism, and it reuses the named Producer-party mechanism one wave earlier. The alternative below attacks the outflow directly but touches the difficulty stance.

**Alternative (named, second choice): veteran-scholar wild protection.** Attack the 57% WILD share directly: a scholar who is a living veteran gets extra caution on wild travel (or a voiced "don't go alone" beat that holds them in camp when the village has no second veteran). Needs a design call before a build — it touches the death rate, and the standing rule is that fixes dropping the death rate >~15% are probably just buffs; a GO threshold would have to separate veteran-scholar wild deaths from the general death rate. Not specified further here.

## §10 Proof results

`scripts/test-vetattrition-a.js` — **73/73 green** (exit 0), run 2026-11-15 in the worktree:
- §0 frozen wave-5 id set vs `src/data/monsters.json` (10 ids as expected); wave-4 count is **10** (algorithm, audit, congregation, eater, eulogy, herald, influencer, reunion, strike, suburb) — `docs/MONSTER-WAVES.md` says 9 and lists no herald: doc drift, logged in §12.
- §1 hand-check T seed 190391 (7redef-match): exits, classes, vet5@unlock 2, vet5@end 1, w4kills 4, partyDays 0 — exact match to the hand walk (Chakib d108 MONSTER-UNKNOWN-WAVE with zero spawns/fights/killCalls on days 107–108, hand-read; Carlos d140 WILD, scholarAtDeath, daysAfterUnlock 36).
- §2 hand-check G seed 100528 (armed): 5 drops with exact days/classes (85 WILD, 94 OTHER:the night with deathDay 93, 122 W5-ERA, 130 W5-ERA, 136 WILD), vet5@unlock 2, vet5@end 0, kills5 5, w5rows 5 all kind monster.
- §3 kind-filter correction totals, both G legs (control kills5 14 / w5rows 16 / kindMonster 16 / kindVillager 0 / playerFlag 0; armed 11 / 12 / 12 / 0 / 0).
- §4 unlock derivation: T unlocked counts 4/4/1/3/3 match the evidence files; phantom seeds 190392/190395/190397 (7redef) not unlocked; all 14 G unlocked seeds open at vet5=2.
- §5 GO-bar arithmetic: 139 exits, 116 classified, 23 unclassified, share 0.835 < 0.90 → NO-GO mapping; T 70/70, G 46/69; residue all AMBIGUOUS (23); WILD 76; W5-FIGHT 1, W4-FIGHT 2; NON-DEATH-EXIT 0.
- §6 analyzer deterministic (same input, same output).

## §11 Sense-testing

**T corpora (vetSays):** 1223 lines total, **0 death lines** — the SAY_RE filter in `culpritbisect-driver-20261111.js` has no death pattern (instrument bias, logged). 229 veteran-kill lines. 36/70 exits have ≥1 vetSays line within ±2d of the death, but those lines are about other events, never the death itself. Around Carlos's death (7redef 190391, d140): **ZERO vetSays lines d136–142** — the scholar who made two veteran kills dies in the wild and the village says nothing. In 2b-base 190628 the veteran-MAKING is narrated (Rodrigo/The Herald d100, Ingrid/Loud-Eyes d101, both "on CAMERA… REMEMBER the name" template; Producers unlock beat d101; Blooded + Editor kill d113) but nothing about the 5 WILD exits after. The veteran-kill beat is coherent but a templated broadcast formula ("Oh — OH. Everybody saw that, right? X just put down Y… on CAMERA. That's a veteran kill, folks. REMEMBER the name.") — same template, names/beasts change. It is ironic against the mechanism: the village is told to remember the name, then the name dies in the wild unremarked.

**G corpora (linkLines):** 18818 total, 458 death lines (2.4%). 21/69 drops have ≥1 linkLine within ±2d; 20/69 have a death line — mostly the templated "🕯️ X is dead — and the dead hold no treaties. Every link Haven has shakes." plus funeral-feast lines with real consequences (links shake, tribute pressed, pantry spent). Deaths ARE narrated with consequences — good, people-like — but **the death lines never say the dead person was a veteran, never name the killer, never say what they died fighting**. The funeral-feast template repeats with different names/villages — a ritual formula, not a robot repeat (names, kcal, link sets change). The 100526 case makes the G ambiguity visible: FIVE death lines in days 69–73 (Angela, Oliver, Vusi, Ingrid, Zoe, Nadia, Amara — seven names) around one AMBIGUOUS drop — the village is hemorrhaging people and the classifier cannot tell which one was the veteran. In 100528 (armed): ZERO linkLines on any day within ±2 of the five vet drops — five veterans leave, and the transcript says nothing on those days at all.

**Robotic/static flags:** the garden-weed death lines ("your untended Wild Strawberry drowned in weeds and died") recur verbatim — a static template, but for plants, not people; minor. The age-description fallback ("Colin, the man in his 40s" / "the woman in her 20s") recurs on the matched band (already logged in the findings backlog by sim-transplant7redef-match-a). The gorge line is a single template (already logged by the gorgeprice2 adoption). No new robotic-person finding beyond the silence: the deadliest fact in this corpus — a veteran dying — is the one thing nobody ever says aloud.

## §12 Metric review (§14)

- **The 90% bar failed on the G recorder's missing victim identity, not on the mechanism.** T legs hit 100%; the pooled bar mixes a corpus class that can answer (T) with one that cannot (G). Revision proposed for the NEXT run (not this one): judge the bar per corpus class (T ≥90% AND G reported separately with its residue), or require the G-class recorder to carry victim ids before pooling. This DIAG's NO-GO stands as frozen — the revision is for the next prereg.
- **Exact-set + uniform-cause sensitivity resolved 0/23** — the residue is not an analyzer shortcut.
- **Mid-day unlock artifact:** 190628 (2b-base) reads vet5@unlock 0 on the unlock-day snapshot because the second veteran was made during day 101 after the snapshot. A future T-class analyzer should read vet5 at the first snapshot AFTER the gated spawn, not on the unlock-day snapshot, when the two differ.
- **Doc drift:** `docs/MONSTER-WAVES.md` says wave 4 has 9 monsters; `src/data/monsters.json` has 10 (herald is the 10th). The frozen id sets in this run use the data, not the doc.
- **Telemetry check:** `scripts/telemetry-check.js` **REFUSED** recorder-corpus input (all 16 `--current` rows carry top-level anchorCommit — sweep recorder rows, not runs; recorder corpora are compared with sweep-compare tables, never against a run baseline). Same refusal class as prior arms; no telemetry deviation lines apply to this DIAG.
- **Findings backlog updates** (goal hidden_files/sim-findings.md): (a) new item — WAVE-5 KILL:DEATH MISREAD: wave5kill-b's 0.92 kill:death ratio counts dead Producers, not villager deaths (kind-filtered: 12/12 armed, 16/16 control kind monster, 0 villager, 0 player); the 1:1 framing is withdrawn, the vet5 2→0 attrition fact stands; (b) new item — NON-GATED SPAWN CALLERS: titanPlace and finaleCampaignPlace spawn wave-5 monsters without the wave gate; any analyzer using spawns as unlock evidence must use gated callers only (7 phantom unlocks excluded here); (c) new item — G-CLASS RECORDER LACKS VICTIM IDENTITY: 23/69 drops unresolvable; future G-class recorders need per-death vid/veteran flag; (d) new item — MONSTER-WAVES wave-4 count drift (9 vs 10, herald); (e) UPDATE to "SCHOLAR ABSENT FROM WAVE-5 FIGHTS": the 0/28 figure counts dead Producers, not villager deaths — the item is corrected, not confirmed; the true count of villager deaths BY wave-5 monsters is not measurable in the G corpora; (f) UPDATE to "READINESS RE-SHORTS AFTER UNLOCK": corroborated — vet5 ends at 0 on 16/29 unlocked seeds, mean 0.59.

## §13 Incidents

- **Safe-commit index clobber struck on all 3 prior commits** (prereg 5c5abe086, Correction 1 95b19a85f, Correction 2 6cabd7916): files showed staged-deleted while byte-identical on disk. Repaired each time with the documented pipe (`git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`), verified status empty + diff HEAD empty + hash-object matches. The commits themselves were always correct.
- **/tmp output loss:** the v1 analyzer output file vanished when /tmp was cleared mid-run; the judged v3 output now lives in the goal hidden_files (`vetattrition-a-output.json`), not /tmp.
- **Prereg Corrections 1–2:** left-inclusive death windows and gated-caller-only unlock derivation, both committed before the judged run; the judged numbers are v3.
- **No fresh sims were run.** The corpora answered every sub-question the prereg posed; the one unanswerable piece (G AMBIGUOUS residue) is a recorder gap, not a question a fresh sim with the same instrument could close — a fresh sim would need a new recorder, which is a build, not a measurement. The targeted-fresh-sim rule did not fire.
- **No game-code change, no push, no bump, no live verification, no merge** — coordinator merges.

## §14 Convergence state (scale-onramp)

**NOT converged.** This DIAG names the mechanism (scholar wild-death bleed; §6) with per-seed counts and a prereg-ready next lever (§9), but the frozen GO bar was missed (83.5% < 90%) on the G recorder gap. The axis stays **converging**: the binding constraint is now named and quantified — the veteran bar is a scholar-survival count, and wave-4/5 fights are not the killer — but the verdict is NO-GO until the G-class residue is closed by a recorder carrying per-victim identity, or the next prereg judges the bar per corpus class. The next lever (wave-4 re-engagement party) is specified and unbuilt; no game code changed in this arm.

## Appendix — what the corpora cannot answer

1. **Who exactly died in the 23 AMBIGUOUS G drops** — no victim identity in the G recorder (see §12).
2. **Whether a veteran was IN a wave-5 fight when they died** — G death rows never name the killer monster; T fight records are day-level, not participant-level (Carlos died on a day with two wave-4 fights recorded, cause "the wild" — the record cannot say whether he was in them).
3. **Road vs wild deaths** — no exit carries a road/expedition cause; "the wild" covers deaths away from home without saying whether the villager was travelling, foraging, or fleeing.
4. **Flee behavior at veteran deaths** — death rows carry no flee/party fields (known gap from wave5kill-b).
5. **Whether the successor scholar inherits anything from the dead veteran** — succession is visible only as scholarId changes (8 scholars in 150d on 190391); the record carries no inheritance fields.
