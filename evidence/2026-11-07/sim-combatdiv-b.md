# sim-combatdiv-b — combat-divergence verdict (DIAG)

**Arm:** sim-combatdiv-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0214Z (adoption run; prereg run fleshout-loop-b-20261108T0013Z died by cron timeout ~02:02Z before judging) · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 (bisect fix-shape sketch Q1 follow-up — the combat-divergence account) · **Branch:** sim-combatdiv-b, cut at master `ba9859e13` · **Prereg:** `evidence/2026-11-07/sim-combatdiv-b-prereg.md` (commit `ab0f8eacf`, before any judged sweep) · **Instrument:** `scripts/combatdiv-20261107.js` + `scripts/analyze-combatdiv-20261107.js`, proof `scripts/test-combatdiv-20261107.js` **22/22 green** (re-run on this tree after the adoption). Corpora: `evidence/2026-11-07/perseed-combatdiv-b-c1/` (commit `9ef4f0219`), `evidence/2026-11-07/perseed-combatdiv-b-p2/` (commit `401cd8c1`).

## Verdict: DIAG-GO — the account is settled, and it is combat math (D, 8/8)

The gear-protection retune moves the frozen band through **damage taken in the very first fights** — not through loadouts, not through a pure RNG re-roll. On all 8 seeds the first divergence is a same-fight damage delta on days 3–7, with the same fighter, same monster, same day, same weapon, same entry HP — only the worn protection number moved. The retune is live in combat from the first fight on every seed, and by day 16 at the latest it has already flipped a fight *outcome* (flee ↔ kill) on every seed. That is the whole account: a small early damage delta re-routes the flee/hopeless calculus, which re-routes fight duration and outcome, which re-routes HP, which re-routes every later draw — and the village that was healthy at C1 is dead by day 76 at P2.

## Reproduction gate — PASSED (read first, before the divergence table)

| Seed | C1 days | P2 days | C1 sat | P2 sat | C1 stand | P2 stand | C1 w4 | P2 w4 | C1 items | P2 items |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | 122 | — | — | 175 | 199 | 0 | 1 | 4f8b5b810385 | a56a60af5671 |
| 53002 | 79 | 68 | — | — | 125 | 165 | 0 | 0 | 4f8b5b810385 | a56a60af5671 |
| 53003 | 150 | 150 | lesser d90 | lesser d126 | 344 | 195 | 3 | 3 | 4f8b5b810385 | a56a60af5671 |
| 53004 | 150 | 75 | lesser d94 | — | 260 | 199 | 2 | 4 | 4f8b5b810385 | a56a60af5671 |
| 53005 | 97 | 77 | lesser d90 | — | 230 | 199 | 3 | 0 | 4f8b5b810385 | a56a60af5671 |
| 53006 | 150 | 75 | lesser d90 | — | 849 | 175 | 8 | 4 | 4f8b5b810385 | a56a60af5671 |
| 53007 | 86 | 63 | — | — | 99 | 125 | 0 | 0 | 4f8b5b810385 | a56a60af5671 |
| 53008 | 150 | 150 | lesser d90 | lesser d126 | 199 | 515 | 0 | 9 | 4f8b5b810385 | a56a60af5671 |

- **C1 must reproduce the bisect's C1 (median 150d, sits 5/8): PASSED exactly** — median 150d, sits 5/8, per-seed days/standing/sat-day/w4 kills identical to the bisect on all 8 seeds. 0 instrument errors.
- **P2 must reproduce the bisect's P2 shape (median 76d ±15d, sits 2/8 ±1): PASSED** — median **76d**, sits **2/8** (53003 and 53008, both late at d126). Per-seed days match the bisect's P2 on all 8 seeds (122/68/150/75/77/75/63/150). 0 instrument errors.
- Candidate identity: C1 items hash `4f8b5b810385` = the `16369893c` blob; P2 items hash `a56a60af5671` = the `50881fbf2` blob. (See method note: `anchorCommit` reads `unknown` because the scratch trees are not git repos; identity rests on these verified blob hashes, not the driver fields.)

## Per-seed first-divergence table (the proof artifact)

| Seed | Class | First-div day | Root fight (day, fighter vs monster) | What moved |
|---|---|---|---|---|
| 53001 | D | d3 | d3 Mara Vasquez vs hushwolf (same-fight-damage) | d3 Mara Vasquez vs hushwolf: vTaken 36→28, vHpLeft 64→72, outcome vKill→vKill, rounds 3→3; outcome first moves later at gseq 10. |
| 53002 | D | d4 | d4 Kieran Lorenz vs cliffhanger (same-fight-damage) | d4 Kieran Lorenz vs cliffhanger: vTaken 62→87, vHpLeft 38→13, outcome vFlee→vKill, rounds 6→10 |
| 53003 | D | d4 | d4 Jorge Silva vs lockpick_raccoon (same-fight-damage) | d4 Jorge Silva vs lockpick_raccoon: vTaken 12→9, vHpLeft 88→91, outcome vKill→vKill, rounds 3→3; outcome first moves later at gseq 5. |
| 53004 | D | d7 | d7 Nora Wilson vs anaconda_empress (same-fight-damage) | d7 Nora Wilson vs anaconda_empress: vTaken 30→26, vHpLeft 70→74, outcome vKill→vKill, rounds 4→4; outcome first moves later at gseq 11. |
| 53005 | D | d5 | d5 Robin Gordon vs nightcourt (same-fight-damage) | d5 Robin Gordon vs nightcourt: vTaken 28→23, vHpLeft 72→77, outcome vKill→vKill, rounds 6→6; outcome first moves later at gseq 6. |
| 53006 | D | d7 | d7 David ONeill vs drumbelly_tanuki (same-fight-damage) | d7 David ONeill vs drumbelly_tanuki: vTaken 14→13, vHpLeft 86→87, outcome vKill→vKill, rounds 3→3; outcome first moves later at gseq 7. |
| 53007 | D | d7 | d7 Diego Miranda vs nightcourt (same-fight-damage) | d7 Diego Miranda vs nightcourt: vTaken 74→64, vHpLeft 46→56, outcome vKill→vKill, rounds 7→7; outcome first moves later at gseq 15. |
| 53008 | D | d5 | d5 Hassan Ali vs cliffhanger (same-fight-damage) | d5 Hassan Ali vs cliffhanger: vTaken 45→40, vHpLeft 53→58, outcome vKill→vKill, rounds 8→8; outcome first moves later at gseq 7. |

Classes: **{"D":8}** — zero R, zero U. DIAG-GO bar met: all 8 seeds classify D or R, reproduction gate passed, proof green, named first-diverging fights above.

## Why this is combat math, not a loadout shift or a re-roll

Three facts, all read off the first diverging fight on each seed:

1. **Same loadout.** At the first diverging fight the weapon bonus is identical C1→P2 on all 8 seeds (18→18, 3→3, 6→6, 18→18, 6→6, 15→15, 4→4, 3→3) and entry HP is identical (100→100 on 7 seeds, 98→98 on 53008). Same fighter, same monster, same day, same weapon, same HP — only the worn protection number moved (+5, +1, +4, +2, +5, +2, +1, +2, matching the retune's per-piece bumps). The loadout census already ruled out keep-5 shifts (0/96 changed); this rules out any per-fighter equipped-gear confound *at the divergence itself*.
2. **Retuned armor is worn from fight one.** The first protection divergence is at gseq 1 on 7/8 seeds (53004: gseq 1 as well, first damage delta at gseq 2). The retune is not a late-game effect — it is in the first fight the village ever fights.
3. **Daily HP diverges within a day of the fight.** First daily-HP divergence runs d4–d8, always within one day after the first fight delta — the damage delta lands in the village's HP the next morning at the latest.

## The mechanism, in plain words

Higher protection does what it says on the tin in the first fight: per-hit damage drops (7 of 8 seeds take less total damage in the first diverging fight). But a fight is not one hit — it is rounds, and the fighter decides each round whether the fight is still winnable. A little less damage per hit moves that decision, and the decision moves everything else:

- **The worked example — 53002, Kieran vs the cliffhanger, day 4.** At C1 Kieran wears protection 4, takes 62 damage over 6 rounds, decides the fight is hopeless at 38 HP, and runs — alive, monster still standing at 38 HP. At P2 he wears protection 5, takes *less per round* (8.7/round vs 10.3) but the fight never looks hopeless to him, so he stays for 10 rounds, kills it, and walks away at **13 HP** having taken 87 total. The retune turned a survivable retreat into a near-death kill. He dies in the wild on day 54; at C1 he lived to day 44 and died of sickness with the village still standing. The "better" armor got him a kill and nearly got him killed.
- **The amplifier — 53006, David vs Drum-Belly, day 7.** The delta is *one hit point* (14→13 taken). Same rounds, same damage dealt, same kill. One HP is still enough: the streams are already on different fight outcomes by gseq 7 (day 11, David vs a murkcap — at C1 he kills it, at P2 it flees). A 1-HP delta re-routes the stream because later decisions read HP.
- **Outcomes flip within two weeks on every seed.** First outcome-moving fight: d4 (53002, flee→kill), d8 (53003, kill→evade), d9 (53008, flee→kill — Jaxon vs the gallowdeer: at C1 he flees with 3 HP left, at P2 he stays and kills it at 16 HP), d11 (53005, 53006, 53007), d14 (53004), d16 (53001). The damage delta is day 3–7; the first changed *result* is day 4–16. After that the streams desynchronize completely (different encounters, different days, different fighters) and the analyzer's first-divergence lens stops — everything past it is cascade, not classification evidence.

So the collapse is not "fighters lose fights" (the bisect already saw fighters keep winning) and not "the retune made armor worse" (it made it better per hit). It is: **better per-hit protection changes when a fighter decides a fight is hopeless, fights run longer, HP lands differently, and a deterministic game amplifies a day-3 difference into a dead village by day 76.** The protection number is a fight-decision lever, not just a damage number — and nothing in the xp-gear landing treated it as one.

## What this rules out, and what the next arm is

- **Loadout pathway: dead twice over.** The census killed it statistically (0/96 keep-5s); this arm kills it at the divergence itself (identical weapon bonus, identical entry HP, protection delta only).
- **Pure RNG re-roll (R): ruled out.** No seed classifies R — every stream's first split has a damage delta underneath it. There is no protection-reading channel that consumes draws with no combat cause; the next probe the prereg asked for in the R case is not needed.
- **The bisect's fix-shape Q2 (freeze keep/equip scores at pre-retune protection): stays dead.** It was killed for lack of mechanism, and the mechanism is now found — in the fight loop, not in the loadout scores. Freezing scores would change nothing about the day-4 flee decision.
- **Next arm: the fix, in the fight loop.** The candidate to pre-register is a change that decouples the hopeless/flee evaluation from the mitigated per-hit damage — or, more bluntly, a reversion of the protection numbers on the frozen band as the control — judged on the frozen band against the bisect sketch's bars (median ≥120d, sits ≥4/8), then a 12–16-seed confirm on a fresh band. Which shape is a design call for the fix arm's prereg, not this DIAG: the honest candidates are (a) revert the retune's protection values (loses the intended buff, but proves the coupling), (b) judge hopelessness on unmitigated incoming damage so protection changes HP but not the stay-or-flee call, (c) keep the retune and accept the coupling, tuning elsewhere. This arm's evidence says (b) is the mechanism-faithful fix to test first: the harm is not the damage number, it is the decision the damage number feeds.
- **The XP half's 3/8 early deaths (P1) stay a separate open probe** — this arm compared C1 vs P2 only; P1's early deaths are not explained here.

## Scale-wall numbers (this run's corpora, doorwalk baseline leg)

- C1: national 0/8, table-sat 5/8, wins 0/8, wave-4 unlocks 7/8, wave-5 unlocks 4/8, median survival 150d.
- P2: national 0/8, table-sat 2/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 1/8, median survival 76d.
- The wall moves with the retune alone: wave-5 unlocks 4/8 → 1/8, table sittings 5/8 → 2/8, median survival halved. No village reaches national on either side; no win on either side (baseline leg never walks a door).

## Village assessment — what the villages looked like

Death-cause census (all 8 seeds): total fallen 95 (C1) → 89 (P2) — nearly the same number of deaths, different timing and mix. Starvation 1 → 4, wounds 12 → 4, sickness 18 → 14, monster 14 → 12, 'the wild' 32 → 33, ambush 2 → 2. The P2 villages do not die of one thing; they die *earlier* of the same things. First deaths: C1's earliest is day 10 (Dieter, the wild, 53008); P2's earliest is day 9 on two seeds (Joseph, a wound that wouldn't close, 53002; Ella, ambushed, 53006 — the bisect's Ella). The difference is not the first death, it is that P2 villages never recover from the thinning: Joseph dies day 9 at P2 vs day 43 at C1; the roster that should have twelve hands has nine, then seven, and the end-stage is the bisect's starvation — the same end, reached sooner.

In plain words: at C1, Haven is a village that takes its knocks in the first month and still has enough people standing at day 90 to sit at the table. At P2, Haven is the same village with slightly better armor — and its fighters stay in fights a little longer, come home a little more hurt, and the small hurts compound until there are too few hands to keep the garden weeded and the pantry full. The fighters still win their fights. The village still starves.

## Sense-test: the first-diverging fights, read as fights

- **53002, day 4 — Kieran vs the cliffhanger.** The log at C1 ends: "R6: Cliffhanger Drag hits the man in his 30s for 12 (38 left)" / "the man in his 30s sees how this ends — and runs while running still works." That reads like a person making a judgment call: he can see the shape of the fight and leaves. At P2 the log ends: "R10: the man in his 30s strikes for 11 (0 left)" / "The lead falls — the pack's coordination shatters." Same man, one more point of protection, four more rounds, a kill instead of a retreat — and 13 HP left. Both versions read as a real fight; the difference between them reads as a real decision, not a numbers artifact. That is the point: the retune changed a *decision*, and decisions are where people live in this game.
- **53001, day 3 — Mara vs the hushwolf.** "R3: the woman in her 50s strikes for 22 (0 left)" / "The lead falls — the pack's coordination shatters. The rest scatter or die." Identical words at C1 and P2; only the numbers moved (36→28 taken). A clean per-hit protection read — the armor doing exactly what it promises, on the third day of the game.
- **53006, day 7 — David vs Drum-Belly.** "R3: the man in his 30s, with a burn-scarred forearm strikes for 20 (0 left)" — the burn-scarred forearm, the named monster, the pack breaking. The fight reads; the 1-HP delta underneath it does not announce itself at all, which is exactly why the collapse looked so mysterious from the headlines: nothing *looks* different on day 7, and by day 75 the village is gone.

## Method note — flap, checkout damage, and the archive-tree deviation

- **Flap.** A filesystem write-denial flap (EPERM class) ran ~01:39–02:02Z during the previous coordinator's run and killed a detached checkout mid-flight: 1,598 files deleted from the worktree; restored clean 01:51:42Z, verified by hash. Flap probes passed ~02:10Z. This adoption run probed (unique-file O_EXCL create+write+unlink in /tmp and the worktree, plus a `git update-ref` probe) before the tree build, before each sweep, and before each commit — all passed. No write failure occurred during this run's sweeps or commits.
- **Frozen-file damage.** The flap had zeroed the frozen driver/policy copies in `/tmp/combatdiv-kit/frozen/` (both 0 bytes, dated 01:39Z, inside the flap window) and gutted the C1 scratch tree (items.json hashed as the empty blob). Both were rebuilt from committed sources before any judged sweep: the frozen files were re-copied from worktree HEAD and verified sha256-identical to the committed instrument (`ce647496b0…` driver, `c8da54056b…` policy); the trees were rebuilt from `git archive` via `/tmp/combatdiv-kit/build-trees.sh` and verified by blob hash (C1 items `4f8b5b810385` = `16369893c` blob; P2 items `a56a60af5671` = `50881fbf2` blob). The committed instrument was never edited.
- **Archive-tree method (deviation from the prereg's detached-checkout plan).** No detached checkout was run during the flap window, per the adoption brief. Sweeps ran the committed worktree driver with `REPO=<archive tree>`. Consequence, disclosed: corpora carry `anchorCommit: unknown` (the driver's `git rev-parse HEAD` needs a repo and the trees have none) — candidate identity rests on the verified blob hashes above, not the driver fields. `itemsSha` IS recorded in the corpora (`4f8b5b810385` / `a56a60af5671` — `git hash-object` works outside a repo), contrary to the adoption brief's expectation of null. The scratch trees are deleted at closeout; the committed corpora are the durable record.
- **safe-commit quirks hit twice, repaired both times.** (1) `safe-commit.sh` does not accept directory paths — the first C1 commit attempt created an *empty* commit (`183d0f2ae`) and left the files untracked; undone with `git reset --soft HEAD~1` on this private branch and recommitted with an explicit 8-file list (`9ef4f0219`). (2) The safe-commit index clobber struck after both corpus commits (committed files showing staged-as-deleted, worktree bytes identical to HEAD); repaired via `git ls-tree HEAD -r -- <dir> | git update-index --add --index-info`, verified `git status` empty + `git diff HEAD` empty after each repair. Both commits verified by `git show --stat` (8 files each).

## Metric review

- The pre-registered bars held without re-scoring: reproduction gate passed on both sides (C1 exact, P2 inside tolerance), all 8 seeds classified D, proof green, named fights in the table above. No friendlier metric was consulted.
- One correction to the prereg's expectation, not the metric: the bisect's "streams split d6–d9" was a headline-level estimate; the fight-level instrument puts the first divergence at d3–d7. The prereg's own horizon justification anticipated this ("the split is d6–d9" was the bisect's read; the first-divergence analysis uses only fights up to the first difference). No bar changes.
- One known limit, stated in the prereg and still true: the analyzer aligns streams by sequence order, so after the first divergence the streams desynchronize; only the FIRST divergence per seed is judged. The first-outcome-flip days (d4–d16) are supporting color from the same alignment, not separate classifications.
- No balanced-panel compare (§15): the prereg excludes it — the question is a stream diff between two frozen checkouts, judged by the pre-registered bars; the reproduction sweeps are the validity check.
- Kill taxonomy (§14a): not applicable — DIAG-GO, nothing killed. The fix-shape Q2 stays dead on its earlier verdict (loadoutcensus), now with the mechanism confirmed in the fight loop.

## Convergence state

scale-onramp stays **converging** (NOT converged): the collapse's account is now settled to the fight loop — the retune's protection number feeds the flee/hopeless decision — but the fix is unbuilt and the frozen band is still collapsed on current master. Next blanks, in order: (1) the fight-loop fix arm sketched above (pre-register the hopeless-decoupling candidate, frozen band, median ≥120d / sits ≥4/8); (2) the XP-half early-death probe (P1's 3/8); (3) metric revision (per-seed non-inferiority) + 12-seed confirm on 53201–53212, landing the held doorwalk branch.

**Ready to merge, pending ship:** branch `sim-combatdiv-b` at the evidence commit (see report). NOTHING merged — report ready-to-merge; the coordinator lands it.
