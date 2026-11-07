# sim-frozenband-bisect-b — bisect evidence (DIAG)

**Arm:** sim-frozenband-bisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261107T2030Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-frozenband-bisect-b (base master a2e005cbe) · **Prereg:** `evidence/2026-11-07/sim-frozenband-bisect-b-prereg.md` (commit `07cc1529a`, before any judged sweep) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, no new seeds. Corpora in `/tmp/bisect-frozenband/` (bisect working data, not committed); flip tables below are the durable record. Proof `scripts/test-frozenband-bisect-20261107.js` **14/14 green**.

## Verdict: GO — the collapse is the xp-gear landing, `50881fbf2`

The flip interval is **C1 → C2**: journey-deepening r114 (`16369893c`, bond/link gating) is HEALTHY, xp-gear (`50881fbf2`, synergy bonus + healing deed coverage + gear protection retune) is COLLAPSED, and the collapsed tip `cf22937b8` is identical to C2 on every headline number. The two commits between C1 and C2 are a run note (`8ee8dcfb6`) and a panel script (`d8798d50d`) — neither can move game trajectories. The linkraise policy (`20d446e09`) is ruled out by construction (the replay instrument never requires it) and by the bisect itself (the flip predates it).

- L0 `62ca38845`: median **150d**, sits **5/8**, HEALTHY.
- C1 `16369893c` (r114): median **150d**, sits **5/8**, HEALTHY. 7/8 seeds byte-identical on headline numbers; 53006 wobbles (sat d93→d90, standing 834→849, w4 kills 7→8) but stays healthy.
- C2 `50881fbf2` (xp-gear): median **70.5d**, sits **0/8**, COLLAPSED.
- L1 `cf22937b8`: median **70.5d**, sits **0/8**, COLLAPSED — **0 movement C2→L1** (all 8 seeds identical to C2 on days/standing/seat/w4 kills).

## Flip tables

### Endpoints: L0 → L1 (the 1430Z collapse, reproduced)

| Seed | L0 days | L1 days | Δdays | L0 seat/sat | L1 seat/sat | L0 stand | L1 stand | L0 w4 | L1 w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | 88 | -62 | — | — | 175 | 199 | 0 | 3 | survived → village-lost |
| 53002 | 79 | 84 | +5 | — | — | 125 | 100 | 0 | 0 | village-lost → village-lost |
| 53003 | 150 | 68 | -82 | lesser d90 | — | 344 | 120 | 3 | 0 | survived → village-lost |
| 53004 | 150 | 73 | -77 | lesser d94 | — | 260 | 199 | 2 | 2 | survived → village-lost |
| 53005 | 97 | 54 | -43 | lesser d90 | — | 230 | 199 | 3 | 1 | village-lost → village-lost |
| 53006 | 150 | 66 | -84 | lesser d93 | — | 834 | 190 | 7 | 1 | survived → village-lost |
| 53007 | 86 | 63 | -23 | — | — | 99 | 125 | 0 | 0 | village-lost → village-lost |
| 53008 | 150 | 92 | -58 | lesser d90 | — | 199 | 199 | 0 | 3 | survived → village-lost |

Median 150 → 70.5d, sits 5/8 → 0/8, 8/8 death days moved, 0 instrument errors. 53008 matches the 1430Z record exactly (lives to d92, seat earned d55, 2 preview-ready days, never sits — 8× "not-ready: Finish the current encounter" skips, verified in this run's L1 corpus).

### Bisect step: L0 → C1 (healthy, no flip)

Median 150d, sits 5/8, 0/8 death days moved. Only 53006 moves at all (sat d93→d90, standing 834→849, w4 7→8).

### Bisect step: C1 → C2 (the flip)

| Seed | C1 days | C2 days | Δdays | C1 seat/sat | C2 seat/sat | C1 stand | C2 stand | C1 w4 | C2 w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | 88 | -62 | — | — | 175 | 199 | 0 | 3 |
| 53002 | 79 | 84 | +5 | — | — | 125 | 100 | 0 | 0 |
| 53003 | 150 | 68 | -82 | lesser d90 | — | 344 | 120 | 3 | 0 |
| 53004 | 150 | 73 | -77 | lesser d94 | — | 260 | 199 | 2 | 2 |
| 53005 | 97 | 54 | -43 | lesser d90 | — | 230 | 199 | 3 | 1 |
| 53006 | 150 | 66 | -84 | lesser d90 | — | 849 | 190 | 8 | 1 |
| 53007 | 86 | 63 | -23 | — | — | 99 | 125 | 0 | 0 |
| 53008 | 150 | 92 | -58 | lesser d90 | — | 199 | 199 | 0 | 3 |

Median 150 → 70.5d, sits 5/8 → 0/8, 8/8 death days moved, 0 instrument errors.

## Mechanism — what now kills the villages (L0 vs C2 corpora)

**1. The trajectories diverge in the first week.** The first 2–5 fights on every seed are identical, then the streams split (53003: identical through d6, split at d8; 53006: identical through d8, split at d9; 53001: same fighter, same day d7, different monster spawned — sanjun vs belltoad). First living-count divergence: d10–d23 on all 8 seeds. At L0, NO village loses anyone before d28; at C2, villages lose 1–3 people by d25.

**2. The early deaths are violent, not starvation.** 53003 loses Victor (ambushed d14) and Sergio (killed by the Living Wire d15 — he fights the same monster four times in three days, flees three times, dies on the fourth), then Maeve (sick d22). 53006 loses Ella (ambushed d9). 53001's first C2 deaths are a contest death d37, a monster kill d38, a betrayal d41. Death-cause census (all 8 seeds): total fallen 95 → 89, but the mix shifts — starvation 1 → **11**, thirst 1 → 4, sickness 18 → 11, wounds 12 → 4, monster 14 → 11, 'the wild' 30 → 33. Fights 734 → 692, turn-based fights 129 → 96, wave-4 kills 15 → 10, wave-5 kills 2 → 0. The scholar dies in turn-based fights exactly as often (36 → 36) — the scholar is not dying more; the ROSTER is.

**3. The end-stage is mass starvation.** The starvation deaths cluster in each village's final days (53003: Jorge/Mateo/David starve d53–54, village dies d68; 53005: FIVE starve d50–51, village dies d54; 53004: d63; 53006: d65; 53007: d51). The pattern: early violent deaths thin the roster to a handful, raids strip the pantry (53003: ~940–1500 kcal/night, d49–55), the garden goes untended ("drowned in weeds", d62), and the last few starve together. Standing caps at ~199 on 4/8 collapsed seeds — the villages die before standing reaches the t5=200 wave-5 rung, so wave 5 never unlocks (maxWave 4 on 8/8 at C2 vs 5 on 4/8 at L0) and the seat is earned (d36–55) but never sat.

**4. The fighters keep winning while the village starves.** 53003's Mateo kills Gavel (d42), Chorus Line (d49) and The Callback (d50) on camera — veteran kills, announced by the System — while the pantry is raided and three villagers starve the same week. The collapse is not "fighters lose fights". It is "the village loses people early, then cannot feed itself".

## Within-landing partition (post-prereg mechanism probes — disclosed, did not change the verdict)

After the bisect landed, I partitioned xp-gear's two halves on the same band (each an 8-seed baseline sweep; the prereg did not pre-register these, and they refine the mechanism, not the verdict):

- **P1 — C2 minus the gear retune (XP/synergy/deed half only):** median **150d**, sits **4/8** — HEALTHY by the prereg bars. But per-seed it is wild: 53002 heals 79→150d, 53001 gains a seat (d92), 53006 restores (150d, sat d91) — while 53003 crashes to **45d**, 53005 to 62d, 53007 to 55d. The XP half alone does NOT reproduce the median collapse, but it leaves 3/8 seeds dying early.
- **P2 — C1 plus the gear retune only (no code change at all):** median **76d**, sits **2/8** — AMBIGUOUS by the letter (median in the collapsed range, sits above the collapsed bar). 6/8 seeds die earlier than L0 (53004/53006: 150→75d; 53001: 150→122d; 53002: 79→68d; 53005: 97→77d; 53007: 86→63d); 53003 and 53008 survive to 150d but sit late (d126) with changed standing (344→195, 199→515) and w4 kills (3→3, 0→9).

Read together: **the gear-protection retune carries most of the median collapse; the XP half alone does not collapse the median but keeps 3/8 seeds dying early; both halves together complete it (70.5d, 0/8).** That is NOT the clean "XP did it" story the landing's name suggests — the retune is the bigger single contributor, and neither half alone reproduces the full collapse. The retune's harm pathway is unproven: protection feeds only defensive math (`armorReduction`, monotonic — higher is better in a fight), loadout keep-scores (`choosePersonalFive`: armor scores protection×5, so retuned armor increasingly beats weapons/tools for the opening keep-5), and equip preference (`equipScore`: protection×10). `armorTier` is render-only. The leading hypothesis is the loadout shift (armor kept over weapons/tools → under-armed early game), with combat-outcome RNG divergence as the amplifier. It needs its own probe (see fix-shape sketch).

## Sense-check: one collapsed village, in plain words (53003 at C2)

Haven starts with twelve people. In the first three weeks it loses three: Victor is ambushed on day 14, Sergio meets the same Living Wire four times in three days and dies on the fourth, Maeve falls sick on day 22. In the old version of the game, nobody in this village died before day 28. Then it never recovers — Cheyenne sick on day 37, Pavel killed by a monster called Gavel on day 41. By then there are only seven or eight people left to do everything. Raiders come in the night and carry off the pantry, a thousand calories at a time. The garden goes untended and drowns in weeds. Jorge, Mateo and David — the same Mateo who killed three monsters on camera that week, announced by the System as veteran kills — starve on days 53 and 54. Raquel falls sick, the scholar Franz is killed in the wild on day 63, Onni dies of thirst on day 64. The village is gone by day 68. What kills it is not losing fights. Its fighters win. What kills it is losing people in the first two weeks, and then having too few hands left to keep anyone fed.

## Wall numbers (this run's corpora, doorwalk baseline leg)

- L0/C1: national 0/8, table-sat 5/8, wins 0/8 (baseline leg never walks a door), wave-4 unlocks 7/8, wave-5 unlocks 4/8, median survival 150d.
- C2/L1: national 0/8, table-sat 0/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 0/8, median survival 70.5d.
- Telemetry deviation check: not run — this is a DIAG bisect, not a lever before/after; the endpoint reproductions are the validity check (see metric review).

## Fix-shape prereg sketch (NOT built in this arm — DIAG only)

Next arm: **probe the retune's harm pathway, then fix it.** Two questions, in order, each its own pre-registration:
1. **Loadout census (DIAG, no game-code change):** dump each villager's opening keep-5 + equipped gear at C1 vs P2 on the frozen band. GO bar: a systematic shift (e.g. mean weapons kept per villager down ≥1, or armor-kept share up) confirms the loadout pathway; no shift sends the arm to the combat-divergence account (first-divergence day + fight-outcome comparison, already partly done here).
2. **Fix variant (only after Q1 answers):** if loadouts shifted — freeze the keep-score/equip-score at pre-retune protection values while keeping retuned combat protection (a scoring-only change), and judge it on the frozen band against the prereg bars (median ≥120d, sits ≥4/8). If the harm is RNG-shift from level-up draws instead — draw level-up offers from a SEPARATE RNG stream, not the shared world stream; the clean test is that L0 trajectories reproduce exactly (days/standing/sits per seed) while the XP stays. Either fix needs its own prereg and its own 12–16-seed confirm on a fresh band; the frozen band stays a diagnostic instrument, not a tuning target.
3. The XP half's 3/8 early deaths (P1) get their own probe after the retune question settles — do not bundle them into the retune fix.

## Metric review

- The prereg bars held: endpoints reproduced exactly (L0 median 150 + sits 5/8; L1 median 70.5 + sits 0/8, deaths 54–92d, 53008 d92/earned d55/2 preview-ready days), and the flip bars classified every step without an AMBIGUOUS call in the bisect itself (C1 HEALTHY, C2 COLLAPSED). No re-scoring happened.
- One non-barred discrepancy, recorded: the 1430Z doorwalk table lists 53006 base maxWave 4, while this run reads 5 — but the same table's own w5-kill count for that seed is 1, the daily snapshots show wave 5 from d102, and `unlockedWave()` is a pure function of standing 834 (→ 5). The "4" is a quirk in that table, not in the corpus; it touches no bar.
- Instrument correction made mid-run (disclosed): the analyzer first read the SIT day from daily `tableSeat()` rows, which turn 'lesser' the day the seat is EARNED (53003: d60), not the day it is TAKEN (d90). Fixed before any judged sweep was analyzed: the analyzer now reads `takeseatStats.seatDay/seatKind`. Proof updated (14/14, incl. an earned-vs-sat distinction case). The smoke seed and the L0 sweep were re-verified through the fixed analyzer; the numbers above are the fixed reads.
- The P1/P2 probes were added after the bisect's GO bar was met. They are mechanism refinement, not a re-score: the verdict (xp-gear, `50881fbf2`) was fixed by the pre-registered bisect before either probe ran.
- No balanced-panel compare (§15): the question was which historical landing moved survival, judged by the same frozen replay instrument that produced both endpoints. The panel compares lever before/after; here the driver IS the frozen instrument and the endpoint reproductions are the validity check.
- `git status` in this worktree times out (>60s) on this filesystem; cleanliness was verified with `git diff --stat HEAD` (empty) + `git ls-files --others` (only the two new tooling files) instead. The safe-commit index clobber hit the prereg commit; repaired via HEAD-blob cacheinfo, hashes verified.

## Convergence state

scale-onramp stays converging (NOT converged): the collapse is bisected to xp-gear, but the fix is unbuilt — the frozen band is still collapsed on current master, and the next winnability confirm (fresh band 53201–53212) must not lean on it until the fix arm lands. The doorwalk branch stays HELD (its smoke leg cannot re-pin on a collapsed band). Next blanks, in order: (1) the retune-pathway probe + fix arm sketched above; (2) the XP-half early-death probe (P1's 3/8); (3) metric revision (per-seed non-inferiority) + 12-seed confirm on 53201–53212, landing the held doorwalk branch.

**Merged locally, pending ship:** NOTHING merged — report ready-to-merge; the coordinator lands it. Branch `sim-frozenband-bisect-b` at the tooling+evidence commit (see report).
