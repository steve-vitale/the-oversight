# sim-sitdrive-winseek-b — evidence (BUILD, policy-side only, zero src/js)

**Arm:** sim-sitdrive-winseek-b · **Run:** fleshout-loop-b-20261109T0630Z (Loop B, arm 1 of 3), adopted by run fleshout-loop-b-20261109T0930Z · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sitdrive-winseek-b, base master `514e4fa6e` · **Prereg:** `evidence/2026-11-09/sim-sitdrive-winseek-b-prereg.md` (committed before any judged computation, plus Corrections 1–2) · **Policy:** `scripts/policies/winseek-sitdrive-b.js`, gate `SITDRIVE_B=1` (default OFF) · **Horizon:** 150d death-aware · **Proof:** `scripts/test-sitdrive-winseek-b.js`, 72/72 green.

## Adoption note (what the dead run left, what I verified vs re-ran)

The 0630Z coordinator died mid-confirm; its tree heartbeat went 68 min stale with no processes running. Arms pricedseat-b and fightblend-53007-b had already landed on master — untouched here. The branch held 3 commits (prereg + Corrections 1–2: `fd7873178`, `01c424801`, `f18a60906`), verified intact. Left uncommitted: the `POLICY_REGISTRY` registration in `scripts/sweep-compare.js` (+7 lines, verified correct — the established try/catch pattern, points at `winseek-sitdrive-b`), the policy file, driver, analyzer, proof, pilot corpora (8 armed + 8 baseline + 2 unrecorded), and three panel dirs plus an invalid compare.

What I VERIFIED (not re-ran): the 3 branch commits; the uncommitted diff; all 8+8 pilot corpora (analyzer re-run on the existing files — no sweep re-run); all three panels (read, cross-checked, never re-swept).

What I RE-RAN: the proof (`scripts/test-sitdrive-winseek-b.js`, 72/72 green — includes the real-sim legs on seed 53003); the pilot analyzer on the existing corpora; the panel compare with the corrected before leg (gate-off) and `SITDRIVE_B` declared as the intervention flag. No panel sweep was re-run: the compare proved the corpora valid (see § Confirm), and the task forbids re-running sweeps unless a corpus is invalid.

## The question (from the prereg)

Does giving winseek a sit drive turn the offered-not-taken seeds into sits, without buying starvation or survival? The foundation DIAG (evidence/2026-11-08/sim-sitgap-winseek-b.md) classified band 53001–53008 under winseek: 3 seeds held a ready lesser seat for days with the scholar at Haven and zero sit-verb calls. The honest GO bar (prereg, corrected before any computation from the impossible 5/8): **all reachable seeds sit + offered-not-taken empty** — reachable = alive at the day-90 floor with a ready preview on the run's own before leg. On this master the reachable set re-derived (Correction 1) to **{53003, 53006}, 2 seeds**.

## PILOT VERDICT: GO — all six bars pass

Frozen band 53001–53008, 150d, before vs after on identical seeds, one master (`514e4fa6e` src; before leg anchor `fd7873178`, armed leg anchor `01c424801` — both prereg-only commits, zero src difference).

| Bar | Result |
|---|---|
| 1. Primary — sits 2/2 reachable + offered-not-taken empty | **PASS.** Armed sits **53003 lesser d90** and **53006 lesser d92** — exactly the before leg's offered-not-taken seeds, nothing else. Offered-not-taken **0/8** on the armed leg. Seat-verb calls across the band: 2 (= sits). |
| 2. Cost — starvation ≤ control+2, median ≥ 0.8× control | **PASS.** Starvation deaths armed 6 vs control 7 (band totals); on the sat seeds armed 5 vs control 6. True median survival armed 75d vs control 75d, ratio **1.00**. |
| 3. G1 det-gate (proof 72/72) | **PASS.** Unit legs (fires once, never twice, fight/announced/preview-null/not-ready skips, gate-OFF RED), gate-off neutrality, real-sim measurement leg (53003 armed sits d90 lesser, gate-off 0 sits), classifier legs. |
| 4. G2 recorder neutrality (armed leg, seeds 53004 + 53008) | **PASS.** Armed-recorded == armed-unrecorded, headline + daily + living/fallen/end. |
| 5. G3 corpus integrity, 8/8 both legs | **PASS.** Every corpus: daily rows span first→last day, end snapshot present, `sitgap` on every row, fallen consistent with daily living drops, 0 instrument errors. (Noted, not failed: d2→d4 snapshot gaps on several seeds; one living note on 53001 — a d60 contest death with no living drop, join may mask it.) |
| 6. Gate-off neutrality (real sim, seed 53003) | **PASS.** Gate-off leg byte-identical to plain winseek (headline + daily + fallen + `takeseatStats`, both zero). The composite with the gate off IS winseek. |

Per-seed armed leg (gameDays): 53001 67d village-lost, 53002 87d village-lost, **53003 90d sat lesser d90, won**, 53004 60d village-lost, 53005 59d village-lost, **53006 93d sat lesser d92, won**, 53007 41d village-lost, 53008 83d village-lost. Baseline (plain winseek) on the same seeds: 67/87/97/60/59/94/41/83 — identical trajectories on every non-sat seed (the drive changes nothing where it never fires); the two sat seeds end earlier because the table run ends the game (90 vs 97, 93 vs 94).

**The sit is not the end of the story — it is the start of a win.** Both sat seeds went on to WIN through the pre-existing `tableRoad`: 5 tableChoices answered each (first `path:feared`, then `beat:kill`, `beat:lean`, `beat:spend`, `final:mercy`), `won=True` in the corpus, `table_won` ending. The prereg's non-goal note said "winseek never walks a trial door and never wins by design" — the measurement says otherwise: once the drive sits the scholar, winseek's first-option door play walks the Feared path to a win on 2/2 sat seeds. The win is real but unearned-by-choice (first-option drain, not a played decision) — see Findings for the backlog (Steve-call on whether that stands). A sit is a sitting, not a win, as the prereg said — but on this band a sitting became a win both times, and the wall numbers below report it honestly rather than hiding it behind the sitting count.

Pilot wall numbers: national **0/8**, table sits **2/8** (before 0/8), wins **2/8** (before 0/8), wave-4 unlocks **6/8**, wave-5 unlocks **0/8**, true median survival **75d** (sorted 41, 59, 60, 67, 83, 87, 90, 93).

## CONFIRM VERDICT: GO — all three bars pass

Fresh band 54209–54224, 16 seeds, 150d, balanced panel (§15). Before panel `--policies winseek`; after panel `--policies winseek-sitdrive-b` with `SITDRIVE_B=1`; repaired compare uses the **gate-off before panel** (same policy id `winseek-sitdrive-b`, gate off) with `--intervention-flags SITDRIVE_B`, per Correction 2. The original compare (winseek vs winseek-sitdrive-b, flag undeclared) is superseded — decision `invalid`, replaced by the repaired compare attached below. No sweep was re-run.

| Bar | Result |
|---|---|
| 7. Confirm primary — panel `table` (sittings, ruling 665) after ≥ before + reachable-seed rule restated + offered-not-taken empty | **PASS.** Panel table **0/16 → 3/16** (seeds 54212, 54217, 54218). Reachable set on the fresh band: exactly the 3 seeds that lived to day 90 on the before leg (54212 d143, 54217 d146, 54218 d101) — **all 3 sat** on the after leg, all 3 won. The other 13 died before day 90 on both legs with identical last days, so no seed survived unseated past day 90 on the after leg. Offered-not-taken empty in every sense the panel can observe (no after-leg overtime with entered=0; no after-leg survivor past d90 unseated). |
| 8. Confirm cost bars — panel rows AND recorder corpora | **PASS.** Panel: villageDeaths per run 70.1 → 67.9 (total 1122 → 1086), playerDeaths 10.5 → 9.3 (total 168 → 149), survival30 5/16 both, survival60 1/16 both. Recorder corpora (pilot): starvation 6 vs 7, median ratio 1.00 (see Pilot bar 2). Caveat, stated not smoothed: this panel contract carries **no `gameDays` and no starvation series**, so the panel half of bar 8 is judged on the death/survival series it does carry — all flat-or-better after. |
| 9. Panel validity — sources stable, observer neutrality proofs match, no cohort warnings | **PASS.** All three panels: same `sourceDigest` (`c2f61097…`), same observer + contract digests, `sourcesStable: true`, neutrality proof match on seed 54209 with 0 warnings, 0 row warnings, 16/16 rows. Repaired compare: decision `review_required`, errors `[]`, no cohort warnings. The `review_required` is the intended effect (win rate 0 → 0.1875, `change_watch`) plus one `regression_watch` investigated below — per §15 a secondary-metric review note, not a re-score license. |

**Master check (bar 9, stated plainly):** the three panels' `sourceHead` values are NOT all identical — before and after record `01c424801…`, gate-off records `f18a60906…`. The game source is nevertheless one master: `sourceDigest` is byte-identical across all three panels, and the only commits between those heads are prereg `.md` text (Corrections 1–2, evidence-only, zero src/js, zero scripts). The head difference is a commit-timing artifact of the dead run's panel legs, not a source difference. The gate-off cross-check Correction 2 demanded also passes exactly: gate-off vs winseek-before panels are **stateHash-identical AND metrics-identical on all 16 seeds** — gate-off IS winseek on the fresh band too.

**The one `regression_watch`, investigated:** village deaths per 100 calendar days rose 101.2 → 103.7 (+2.46). This is denominator shrinkage, not more dying: the three sat seeds end their runs at day 90 (table win) instead of running on to d101–d146, so the same deaths are divided by fewer days. Per-run village deaths FELL (70.1 → 67.9) and player deaths fell (10.5 → 9.3). No village died more; three villages stopped being simulated because they won.

**The compare's own display line agrees:** "invitations observed 15/16 before → 15/16 after; sittings (ruling 665) 0/16 → 3/16." Fifteen of sixteen fresh-band villages were invited to the table and died before the day-90 floor anyway — the same shape as the pilot, one band over.

Confirm wall numbers: national **0/16** both legs, table sits **0 → 3/16**, wins **0 → 3/16**, wave-4 unlocks **16/16** both (3 `wave_unlock` events per seed), wave-5 unlocks **0/16** both, median survival (last-sample-day proxy) **69.5d** both legs.

## Village assessment (plain words)

What the villages looked like: short, hard lives. On the frozen band the median village lasted 75 days; on the fresh band about 70. People died in the wild, in monster fights, in ambushes, in contests — the usual grind. The table had already knocked on nearly every door by day 35–55 (the villages were "waiting" from then), but the invitation means nothing before day 90, and most villages were already gone by then. That is the whole story of this arm in one sentence: **the table was waiting on villages that were already dead.**

Who sat, and why: on the pilot band, two villages were still standing at day 90 with a ready lesser seat — 53003 (regional, stage 3, 8 contests and 5 crises weathered, standing 140 at the sit) and 53006 (regional, stage 3, 10 contests, 3 crises, standing 145). Both sat the first day the engine said the seat was takeable — 53003 on day 90 itself, 53006 on day 92 after two days of "finish the current encounter first." On the fresh band the same shape: three villages lived past 90, all three sat, all three won. The drive did exactly one thing — it answered an invitation that was already there, on the first day it could be answered — and the game did the rest.

Who died, and why: everyone else died before the floor. 53001's village lost five people in one day at day 65, in the wild, with an empty pantry — the kind of wipe that ends a run before the table ever matters. 53007 died at day 40. On the fresh band, 13 of 16 never saw day 90. The sit drive cannot touch any of those deaths, and this arm never claimed it could. The survival half of the band is the standing next blank (see Findings).

What the sit itself sounded like (sense-test, seed 53003, day 90): "◈ THE TABLE IS SET. A ring of pale light waits — take your seat from Haven when you are ready. Nothing is final until you sit." Then the audit, read aloud: a lesser seat — regional standing, waves 1–3 faced (19/11/8), 8 contests survived, 5 crises weathered. "The table does not rise. It prices." The lines are coherent, the audit names real deeds, the seat kind matches the earned bar. The feared-path beats after the sit play through winseek's pre-existing first-option drain — the words are the engine's, the choices are not choices.

## What blank was filled

The classified gap from the foundation DIAG is closed: winseek no longer reaches a ready lesser seat and never sits. The drive is a policy-side-only composition (`scripts/policies/winseek-sitdrive-b.js`, gate `SITDRIVE_B=1`, default OFF) — zero `src/js`, zero changes to `winseek.js` or `competent.js`, zero default flips. The backlog item "WINSEEK HAS NO SIT DRIVE" (2026-11-08) is fixed by this arm. The drive's own proof (72/72) and the two-legged measurement (pilot + panel confirm) are committed alongside it, so the next arm that touches winseek measures against a policy that sits.

What was documented, not filled: the day-90-floor survival half (only 2/8 pilot, 3/16 confirm reach the floor alive); the win that follows a sit is first-option drain, not played choice; the panel contract has no gameDays/starvation series for cost bars. All three are in Findings / Metric review below.

## Metric review

- **Metrics held.** The primary metric (sits on identical seeds, reachable-set rule) was judged exactly as pre-registered, with the two committed corrections applied before the numbers they touch were computed (Correction 1 re-derived the reachable set from this run's before leg, as the prereg's own metric-review note prescribed; Correction 2 repaired the panel compare's before leg before the repaired compare was run). The impossible 5/8 bar was corrected before any computation, never re-scored after seeing results. No friendly re-scoring anywhere in this verdict.
- **Day-field note (±1d, verdict-neutral).** The prereg's Correction 1 before-leg days (53003 96d, 53005 60d, 53007 40d, 53008 82d) are daily-row counts; the analyzer's baseline comparison uses `gameDays` (97/59/41/83). The two fields differ by one day on four seeds (rows end the day before the game clock stops). True median is 75d under either field, on either leg. Future arms should state which field they quote.
- **Panel cost-bar series gap.** The prereg's bar 8 names "panel `deaths`/`gameDays` series" — this contract version carries neither key. The panel half was judged on the series it does carry (villageDeaths, playerDeaths, survival30/60), all flat-or-better after, plus the recorder corpora for starvation/median. A future prereg should name the contract's actual series.
- **The win is not the judged metric.** Wins moved 0→2/8 (pilot) and 0→3/16 (confirm) as a consequence of sits, and the compare flags the win-rate move as `change_watch` — correctly, since a win moving in either direction prompts investigation. The investigation: every win traces to a sit followed by first-option feared-path play through the pre-existing `tableRoad`. The win is downstream of the judged metric (sits), not a second primary smuggled in. Whether first-option door play should be able to win is a design question, not a measurement one — see Findings.
- **No metric was re-scored, no guardrail breached.** Cost bars pass on both bands; the per-100-days `regression_watch` is a denominator artifact, investigated above.

## Findings for the backlog

- [open] 2026-11-09 — scale-onramp / survival — THE DAY-90 FLOOR IS STILL THE BINDING HALF: only 2/8 (pilot band 53001–53008) and 3/16 (fresh band 54209–54224) reach day 90 alive under winseek; 15/16 fresh-band villages were invited to the table but died before the floor. The sit drive fixes the sitting half and touches none of this. Next arm: survival to the floor, not sitting. (Adoption arm sim-sitdrive-winseek-b, run fleshout-loop-b-20261109T0930Z, this file § Village assessment.)
- [open] 2026-11-09 — scale-onramp / table — A SIT BECOMES A WIN THROUGH FIRST-OPTION DOOR PLAY: every sat seed (2/2 pilot, 3/3 confirm) won by walking the Feared path through winseek's pre-existing tableRoad, which drains first-option beats (path:feared → beat:kill → beat:lean → beat:spend → final:mercy) with no played choice. Steve-call whether a sat seat should wait for a real choice, or whether first-option drain winning is acceptable. (Adoption arm sim-sitdrive-winseek-b, run fleshout-loop-b-20261109T0930Z, this file § Pilot verdict.)

## Convergence state

**converging** — the sit-drive lever passes pilot and confirm on two bands; the axis (scale-onramp / winnability chain) is NOT converged: national stays 0/16, wave-5 stays 0/16, and the day-90-floor survival half is the binding constraint now. Next work on this axis is survival to the floor (see Findings), not more sitting measurement.

## Panel compare (repaired, attached)

`evidence/2026-11-09/sitdrive-winseek-panel-compare.md` — decision `review_required`, gate-off before vs gate-on after, `SITDRIVE_B` declared as intervention flag (before null, after "1"). 16 paired cases. Sittings 0/16 → 3/16; wins 0 → 0.1875 (`change_watch`, the intended effect); village deaths per run 70.125 → 67.875; player deaths 10.5 → 9.3125. The full compare `.md` and `.json` are committed with this file; the three panels' `panel.json.gz` summaries are committed with it (the `cases/` caches are reproducible from seeds + digests and are NOT committed, per §15 — they were removed from the tree before commit).

## Files committed with this evidence

- `scripts/policies/winseek-sitdrive-b.js` (new: winseek + sit drive, `SITDRIVE_B=1`)
- `scripts/sweep-compare.js` (registration only: `POLICY_REGISTRY['winseek-sitdrive-b']`)
- `scripts/sitdrive-winseek-driver-20261109.js`, `scripts/analyze-sitdrive-winseek-20261109.js`, `scripts/test-sitdrive-winseek-b.js` (new: driver, analyzer, proof)
- `evidence/2026-11-09/perseed-sitdrive-winseek-b/` (8 armed corpora), `perseed-sitdrive-winseek-b-baseline/` (8 before corpora), `perseed-sitdrive-winseek-b-unrec/` (2 recorder-neutrality corpora)
- `evidence/2026-11-09/sitdrive-winseek-panel-before/panel.json.gz`, `sitdrive-winseek-panel-before-gateoff/panel.json.gz`, `sitdrive-winseek-panel-after/panel.json.gz` (16 seeds each, band 54209–54224, 150d)
- `evidence/2026-11-09/sitdrive-winseek-panel-compare.md` + `.json` (repaired compare)
- `evidence/2026-11-09/sim-sitdrive-winseek-b-prereg.md` (already committed: `fd7873178`, `01c424801`, `f18a60906`)
