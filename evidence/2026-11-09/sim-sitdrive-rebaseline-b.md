# sim-sitdrive-rebaseline-b — evidence (frozen-band re-baseline, NOT a new experiment)

**Arm:** sim-sitdrive-winseek-b (re-baseline) · **Run:** fleshout-loop-b-20261109T0930Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sitdrive-winseek-b, base master **`8cee6a8d2`** (head at spawn `f37924c96` + prereg commit `b2cc33eda`) · **Addendum prereg:** `evidence/2026-11-09/sim-sitdrive-rebaseline-b-prereg.md` (committed BEFORE any judged computation on the new master) · **Original evidence:** `evidence/2026-11-09/sim-sitdrive-winseek-b.md` (judged on `514e4fa6e`; stays as-is — this file re-judges, never rewrites it) · **Policy:** `scripts/policies/winseek-sitdrive-b.js`, gate `SITDRIVE_B=1` (default OFF, zero src/js) · **Horizon:** 150d death-aware · **Proof:** `scripts/test-sitdrive-winseek-b.js`, **72/72 green on the new base** (re-pointed at seed 53005).

## Why this run exists

The arm was PILOT GO + CONFIRM GO on master `514e4fa6e` (pilot: sits 2/2 reachable 53003/53006; confirm: panel table 0/16→3/16). The LANDING GATE FAILED on the rebase: the proof re-run was 67 passed / 5 failed, all REAL-sim legs on seed 53003 — armed 53003 no longer sits and gate-off 53003 classifies never-offered instead of offered-not-taken, on BOTH legs. The drive was NOT broken; the demonstration seed moved (journey src changes between `514e4fa6e` and `60eb9a5bb`). This run re-judges the same experiment on the new master: same bars, same bands, same driver/analyzer, only the master and the re-derived reachable set change.

## The question (from the addendum prereg)

Does the sit-drive verdict survive the master move — do all reachable seeds on the new master still sit, with offered-not-taken empty, without buying starvation or survival?

## PILOT VERDICT: GO — all six bars pass

Frozen band 53001–53008, 150d, before vs after on identical seeds, one master (`8cee6a8d2`).

**Reachable set re-derived from THIS run's before leg (plain winseek, new master): {53005}, 1 seed.** The before leg: 53001 58d, 53002 77d, 53003 31d, 53004 81d, **53005 125d offered-not-taken** (announced d90, lesser seat from d48, preview ready 33 days d90–d124, scholar at Haven 33/33), 53006 76d, 53007 87d, 53008 69d (gameDays field; true median 76.5d). The old reachable set is gone twice over: 53003 dies d30 on the new master (never-offered — furthest arc 3, wave-3 faced 1/3, standing 45) and 53006 dies d76. The mechanism is the same shape as every master move on this band (villages die before the floor) with different seeds — the third distinct reachable set in three masters (DIAG `9d5fe8ab6`: {53001, 53002, 53007}; `514e4fa6e`: {53003, 53006}; `8cee6a8d2`: {53005}).

| Bar | Result |
|---|---|
| 1. Primary — sits all reachable + offered-not-taken empty | **PASS.** Armed sits **53005 lesser d90** — exactly the before leg's offered-not-taken seed, nothing else. Offered-not-taken **0/8** on the armed leg. Seat-verb calls across the band: 1 (= sits). |
| 2. Cost — starvation ≤ control+2, median ≥ 0.8× control | **PASS.** Starvation deaths armed 6 vs control 6 (band totals); on the sat seed armed 0 vs control 0. True median survival armed 76.5d vs control 76.5d, ratio **1.00**. |
| 3. G1 det-gate (proof 72/72) | **PASS.** Unit legs, gate-OFF RED, broken-drive sensitivity, classifier fixtures, real-sim legs on the re-pointed seed 53005 (armed sits d90 lesser; gate-off 0 sits, classifies offered-not-taken; gate-off == plain winseek byte-identical). |
| 4. G2 recorder neutrality (armed leg, seeds 53004 + 53008) | **PASS.** Armed-recorded == armed-unrecorded (new control corpora `perseed-sitdrive-winseek-b-rebase-unrec/`). |
| 5. G3 corpus integrity, 8/8 both legs | **PASS.** Every corpus: daily rows span first→last day, end snapshot present, `sitgap` on every row, fallen consistent with daily living drops, 0 instrument errors. (Noted, not failed: d2→d4 snapshot gaps on several seeds; living notes on 53002/53004 — a fallen villager with no living drop, join may mask it.) |
| 6. Gate-off neutrality (real sim, seed 53005) | **PASS.** Gate-off leg byte-identical to plain winseek (headline + daily + fallen + `takeseatStats`, both zero). The composite with the gate off IS winseek. |

Per-seed armed leg (gameDays): 53001 58d village-lost, 53002 77d village-lost, 53003 31d village-lost, 53004 81d village-lost, **53005 90d sat lesser d90, won**, 53006 76d village-lost, 53007 87d village-lost, 53008 69d village-lost. Baseline (plain winseek) on the same seeds: 58/77/31/81/125/76/87/69 — identical trajectories on every non-sat seed (the drive changes nothing where it never fires); the sat seed ends earlier because the table run ends the game (90 vs 125).

**The sit again became a win.** 53005 sat d90 lesser (standing 70; waves faced 17/9/7, 11 contests survived, 4 crises weathered, regional stage 3, ladder National Standing reached) and won through the pre-existing `tableRoad`: 5 tableChoices answered (first `path:feared`, then `beat:kill`, `beat:lean`, `beat:spend`, `final:mercy`, branch light), `won=True`, `over-other` ending. Same first-option drain as on `514e4fa6e` — the win is real but unearned-by-choice, already filed as a Steve-call in the original evidence. A sit is a sitting, not a win, as the prereg said — but on this band a sitting became a win again, 1/1.

Pilot wall numbers: national **0/8**, table sits **1/8** (before 0/8), wins **1/8** (before 0/8), wave-4 unlocks **6/8**, wave-5 unlocks **0/8**, true median survival **76.5d** (sorted 31, 58, 69, 76, 77, 81, 87, 90 on the armed leg; 31, 58, 69, 76, 77, 81, 87, 125 on the before leg).

## CONFIRM VERDICT: GO — all three bars pass

Same band 54209–54224, 16 seeds, 150d, balanced panel (§15) — same seeds, new master (re-use is the control; this is a re-baseline, not a new experiment). Before panel `--policies winseek-sitdrive-b` gate OFF (`sitdrive-winseek-panel-before-gateoff-rebase`); after panel the same policy with `SITDRIVE_B=1` (`sitdrive-winseek-panel-after-rebase`); compare declares `--intervention-flags SITDRIVE_B`, per Correction 2.

| Bar | Result |
|---|---|
| 7. Confirm primary — panel `table` (sittings, ruling 665) after ≥ before + reachable-seed rule restated + offered-not-taken empty | **PASS.** Panel table **0/16 → 2/16** (seeds 54209, 54223). Reachable set on the fresh band: exactly the 2 seeds that lived to day 90 on the before leg (54209 d144, 54223 d114) — **both sat** on the after leg (54209 d92, 54223 d91), both won. The other 14 died before day 90 on both legs with identical gameDays, so no seed survived unseated past day 90 on the after leg. Offered-not-taken empty in every sense the panel can observe. |
| 8. Confirm cost bars — panel rows AND recorder corpora | **PASS.** Panel: villageDeaths per run 70.1 → 68.5 (total 1121 → 1096), playerDeaths 10.5 → 9.9 (total 168 → 159), survival30 5/16 both, survival60 0/16 both. Recorder corpora (pilot): starvation 6 vs 6, median ratio 1.00 (see Pilot bar 2). Caveat, stated not smoothed: this panel contract carries no `gameDays` and no starvation series, so the panel half of bar 8 is judged on the death/survival series it does carry — all flat-or-better after. |
| 9. Panel validity — sources stable, observer neutrality proofs match, no cohort warnings | **PASS.** Both panels: same `sourceDigest` (`cd91237ca5e9…`), same observer + contract digests, `sourcesStable: true`, neutrality proof match on seed 54209 with 0 warnings, 0 row warnings, 16/16 rows. Compare: decision `review_required`, errors `[]`, no cohort warnings. The `review_required` is the intended effect (win rate 0 → 0.125, `change_watch`) plus two `regression_watch` rows investigated below — per §15 secondary-metric review notes, not a re-score license. |

**The two `regression_watch` rows, investigated per seed:**
- Village deaths per 100 calendar days 102.2 → 104.1 (+1.90). Denominator shrinkage, not more dying — same artifact as the original arm: the two sat seeds end their runs at day 91–92 (table win) instead of running on to d114–d144, so the same deaths are divided by fewer days. Per-seed: 54209 villageDeaths 96 → 77, 54223 90 → 84. Per-run village deaths FELL (70.1 → 68.5) and player deaths fell (10.5 → 9.9). No village died more; two villages stopped being simulated because they won.
- Player named-class access 0.6875 → 0.625 (−0.0625, 11/16 → 10/16). Exactly one seed moves: **54209, classAccess 1 → 0**. On the before leg 54209's player earned a named class by d144; on the after leg the run ends at d92 (table win), 52 days earlier, so the class is never earned. 54223 keeps its class access. This is the same early-ending artifact in a second guise: winning truncates the run before a late grant. It is not the drive making classes harder to earn — the player simply stops playing sooner because they won. The other 14 seeds have byte-identical metrics before/after — the drive changes nothing where it never fires.

**Master check (bar 9, stated plainly):** both panels record the same `sourceDigest` (`cd91237ca5e9…`) and the same `sourceHeadStart`/`sourceHeadEnd` — one master, `8cee6a8d2`, for the whole confirm. No commit-timing artifact this time (contrast the original arm, where the three panels' heads differed on prereg-only commits).

**The compare's own display line agrees:** "invitations observed 15/16 before → 15/16 after; sittings (ruling 665) 0/16 → 2/16." Fifteen of sixteen fresh-band villages were invited to the table and died before the day-90 floor anyway — the same shape as the pilot, one band over, on a new master.

Confirm wall numbers: national **0/16** both legs, table sits **0 → 2/16**, wins **0 → 2/16**, wave-4 unlocks **15/16** both (waveReach ≥ 4; 54219 stops at wave 3), wave-5 unlocks **0/16** both, median survival (gameDays proxy) **67d** both legs.

## Village assessment (plain words)

What the villages looked like: short, hard lives, again. On the frozen band the median village lasted 76.5 days; on the fresh band 67. People died in the wild above all (61 of 104 fallen on the armed leg), then monsters, sickness, the arena, ambushes. The table had already knocked on nearly every door by day 33–49 (the villages were "waiting" from then), but the invitation means nothing before day 90, and most villages were already gone by then. The whole story of this arm in one sentence, unchanged by the master move: **the table was waiting on villages that were already dead.**

Who sat, and why: on the pilot band, one village was still standing at day 90 with a ready lesser seat — 53005 (regional, stage 3, 11 contests, 4 crises, standing 70 at the sit — the lowest standing of any sat seed so far, and still a lesser seat with 6 doors offered). It sat on day 90 itself, the first day the engine said the seat was takeable. On the fresh band the same shape: two villages lived past 90, both sat within two days (d91, d92), both won. The drive did exactly one thing — it answered an invitation that was already there, on the first day it could be answered — and the game did the rest.

Who died, and why: everyone else died before the floor. 53003 died at day 30 — the shortest-lived seed on any band this arm has measured, never even offered a seat (wave-3 faced 1/3). 53001 died at 58, 53008 at 69. On the fresh band, 14 of 16 never saw day 90. The sit drive cannot touch any of those deaths, and this arm never claimed it could. The survival half of the band is the standing next blank (see Findings).

What the sit itself sounded like (sense-test, seed 53005, day 90): the drive took the seat with no fanfare in the recorder — one `tableTakeSeat` call, then the Feared path opened (light branch) and the five first-option beats walked to a win. The village's own lines in the run read coherently (Thornfield's tribute negotiation, the System's slot-growth notes, villagers naming plants on the damp slope), with one repeated line worth noting: the System's "seed decide to be a tree" deepening line fires twice on day 11 — the same line, back to back, which reads like a stutter rather than a conversation. Filed below, not chased.

## What blank was filled

The landing-gate failure is closed: the proof is green again (72/72) on the new master, re-pointed at the seed that actually sits there (53005), and the pilot + confirm verdicts both re-judge GO on `8cee6a8d2`. The drive itself needed no change — zero src/js, zero policy edits; only the proof's demonstration seed moved. The arm is ready-to-merge as judged on the current master, pending the coordinator's landing (which re-runs the proof after the rebase onto whatever master is current then — the reachable seed may move again, and that is a re-baseline, not a failure).

What was documented, not filled: the day-90-floor survival half (only 1/8 pilot, 2/16 confirm reach the floor alive — thinner than on `514e4fa6e`); the win that follows a sit is still first-option drain, not played choice; the panel contract still has no gameDays/starvation series for cost bars. All three are in Findings / Metric review below.

## Metric review

- **Metrics held.** The primary metric (sits on identical seeds, reachable-set rule) was judged exactly as the addendum preregistered, with the reachable set re-derived from this run's before leg before the armed leg was judged — as the original prereg's own metric-review note prescribes. No friendly re-scoring anywhere in this verdict.
- **The reachable set moved again — and that is the metric working, not drifting.** Three masters, three reachable sets ({53001, 53002, 53007} → {53003, 53006} → {53005}). The bar names exactly the reachable universe defined by the run's own before leg, and the universe is now 1 seed. A 1-seed pilot primary is thin — it proves the drive fires when it can, not that it fires often — but the confirm on 16 fresh seeds (2/2 reachable sat) is the second leg, and the two legs agree. A future arm that wants a fatter pilot primary needs a band where more villages survive to the floor — which is the survival follow-up, not a re-scoring of this one.
- **Day-field note (±1d, verdict-neutral).** The driver's stdout `days` and the corpora's `gameDays` differ by one day on four pilot seeds (e.g. 53002: stdout 78, corpus 77) — the same daily-row-count vs game-clock note as the original arm. The analyzer judges both legs on the same field; true median is 76.5d on either leg under either field. Future arms should state which field they quote.
- **Panel cost-bar series gap.** As in the original arm, the prereg's bar 8 names "panel `deaths`/`gameDays` series" — this contract version carries neither key. The panel half was judged on the series it does carry (villageDeaths, playerDeaths, survival30/60), all flat-or-better after, plus the recorder corpora for starvation/median. A future prereg should name the contract's actual series.
- **The win is not the judged metric.** Wins moved 0→1/8 (pilot) and 0→2/16 (confirm) as a consequence of sits, and the compare flags the win-rate move as `change_watch` — correctly, since a win moving in either direction prompts investigation. The investigation: every win traces to a sit followed by first-option feared-path play through the pre-existing `tableRoad`. The win is downstream of the judged metric (sits), not a second primary smuggled in. Whether first-option door play should be able to win is a design question, not a measurement one — see Findings.
- **Telemetry deviation check:** `node scripts/telemetry-check.js` refuses recorder-corpus input by design ("recorder corpora are compared with sweep-compare tables, never against a run baseline here"), and the scale-wall baseline's own `_regime` note forbids comparing pre-seat substrates against it (wins are structurally ~0 there; the check would fire a spurious LOUD "wins disappeared"). There is no LOUD line to investigate: the panel compare is the instrument that covers national/table/wins for this arm, and its `change_watch` + two `regression_watch` rows are investigated above.
- **No metric was re-scored, no guardrail breached.** Cost bars pass on both bands; both `regression_watch` rows are early-ending artifacts of winning, investigated per seed above.

## Findings for the backlog

- [open] 2026-11-09 — scale-onramp / survival — THE DAY-90 FLOOR IS STILL THE BINDING HALF, AND THINNER ON THIS MASTER: only 1/8 (pilot band 53001–53008) and 2/16 (fresh band 54209–54224) reach day 90 alive under winseek on `8cee6a8d2`, down from 2/8 and 3/16 on `514e4fa6e`; 15/16 fresh-band villages were invited to the table but died before the floor. The sit drive fixes the sitting half and touches none of this. Next arm: survival to the floor, not sitting. (Re-baseline arm sim-sitdrive-winseek-b, run fleshout-loop-b-20261109T0930Z, this file § Village assessment.)
- [open] 2026-11-09 — scale-onramp / table — A SIT BECOMES A WIN THROUGH FIRST-OPTION DOOR PLAY (recurs on the new master): the sat seed (1/1 pilot, 2/2 confirm) won by walking the Feared path through winseek's pre-existing tableRoad, which drains first-option beats (path:feared → beat:kill → beat:lean → beat:spend → final:mercy) with no played choice. Steve-call whether a sat seat should wait for a real choice, or whether first-option drain winning is acceptable. (Re-baseline arm sim-sitdrive-winseek-b, run fleshout-loop-b-20261109T0930Z, this file § Pilot verdict.)
- [open] 2026-11-09 — dialogue — SYSTEM DEEPENING LINE REPEATS BACK-TO-BACK: on seed 53005 day 11 the System's "Your understanding is... deepening! We can see it! Like watching a seed decide to be a tree! Beautiful! Profitable!" line fires twice in a row with no other line between. Reads like a stutter, not a conversation. (Re-baseline arm sim-sitdrive-winseek-b, run fleshout-loop-b-20261109T0930Z, this file § Village assessment.)

## Convergence state

**converging** — the sit-drive lever passes pilot and confirm on two bands on the new master, with the proof green again; the axis (scale-onramp / winnability chain) is NOT converged: national stays 0/16, wave-5 stays 0/16, and the day-90-floor survival half is the binding constraint now (thinner on this master than the last). Next work on this axis is survival to the floor (see Findings), not more sitting measurement.

## Panel compare (re-baseline, attached)

`evidence/2026-11-09/sitdrive-winseek-panel-compare-rebase.md` — decision `review_required`, gate-off before vs gate-on after, `SITDRIVE_B` declared as intervention flag (before null, after "1"). 16 paired cases. Sittings 0/16 → 2/16; wins 0 → 0.125 (`change_watch`, the intended effect); village deaths per run 70.0625 → 68.5; player deaths 10.5 → 9.9375. The full compare `.md` and `.json` are committed with this file; the two panels' `panel.json.gz` summaries are committed with it (the `cases/` caches are reproducible from seeds + digests and are NOT committed, per §15 — they were removed from the tree before commit).

## Files committed with this evidence

- `scripts/test-sitdrive-winseek-b.js` (re-pointed: REAL legs 53003 → 53005, G2/G3 dirs → `-rebase` corpora, reachable-set check → [53005]; no assertion weakened)
- `evidence/2026-11-09/sim-sitdrive-rebaseline-b-prereg.md` (already committed: `b2cc33eda`)
- `evidence/2026-11-09/perseed-sitdrive-winseek-b-rebase/` (8 armed corpora), `perseed-sitdrive-winseek-b-rebase-baseline/` (8 before corpora), `perseed-sitdrive-winseek-b-rebase-unrec/` (2 recorder-neutrality corpora)
- `evidence/2026-11-09/sitdrive-winseek-panel-before-gateoff-rebase/panel.json.gz`, `sitdrive-winseek-panel-after-rebase/panel.json.gz` (16 seeds each, band 54209–54224, 150d)
- `evidence/2026-11-09/sitdrive-winseek-panel-compare-rebase.md` + `.json` (re-baseline compare)
