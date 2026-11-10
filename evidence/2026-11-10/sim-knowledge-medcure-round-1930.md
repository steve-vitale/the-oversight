# Loop B 1930Z round — coordinator evidence (stale-lock recovery + 2 arms LANDED, merged locally pending ship)

**Run:** fleshout-loop-b-20261110T1930Z · **Axis:** scale-onramp (winnability chain) — coverage program Tier 1 measurement (#3 knowledge-broad + #4 medcure adoption) · **Master at closeout:** a74e8a061

## Run start — stale-lock recovery

B lock fleshout-loop-b-20261110T1730Z was 55 min old at 19:31Z. Its roleform-b tree was released (arm LANDED e5c19e54e); its sim-medcure-b tree heartbeat was 71 min stale (18:20:32Z), last file write 18:42:34Z, no processes running, 4/8 corpus files, prereg + driver + analyzer + proof uncommitted, no evidence md, no commit. Coordinator dead by the 15-min guard and the closeout skill's file-write test. Lock deleted, 1730Z claim retired to .DEAD with a note. Loop A live on its 1815Z claim (raiserseat-a adoption + sim-diplo-a #2 + sim-spawncensus-a #5) — NOT touched. Pre-flight: main tree clean, disk 33%, worktree-reap ran (8/16 active, no removals).

## Arm 1 — sim-medcure-b (ADOPTION, Tier 1 #4) — LANDED e6049f281 — NO-GO on G2 (instrument failure, not a game failure)

Adopted the stranded 1730Z arm in its existing worktree. Verified the 4 inherited corpus cells parse (md5s recorded, untouched afterward); ran only the 4 missing cells (s160213–s160216) via the driver's exported `oneRun` (the CLI sweep would have overwritten the valid cells); ran analyzer + proof; judged strictly against the binding prereg. No lever built; `git diff HEAD -- src/` empty.

- **G1 PASS** — 8/8 seeds, 0 instrument errors, day rows span 1→last day.
- **G2 FAIL** — unlinked wound-fever deaths 0, unclassified 0, counter mismatch 0, but **79/82 duty-cure events have no episode to join**. Mechanism, named in code: `villageSicknessTick()` runs in `endDay()` ← `sleep()`, after the day's snapshot; onset then `villagerCareTick` → `medicDutyCureAttempt` happen in the same tick, so same-tick onset+cure never appears in any snapshot. **0/14 wound-fever cures joined**; only 3/82 joined, all generic fever.
- **G3 PASS** — bare 8/8 match; full-fingerprint recheck MATCH 8/8 incl. endReason + finalPop.
- **G4 PASS** — proof 14/14 green before and after rebase.
- **M1 — NOT a valid census re-measure.** 0/2 present vs 2/3 absent on 5 episodes only — cured cases never enter the denominator (selection artifact). Must not be compared to the 2026-11-08 census (2.4%/24.0%).
- **M2 (trustworthy, counter-reconciled 8/8): 82 duty cures — ability 82, medicine 0.** Wound fever 14, generic fever 68.
- **M3 (trustworthy, direct read): pharmacy 0 doses on all 805 village-days; 0/8 seeds ever stocked.** The medicine channel could never fire — no stock ever existed.
- **Wall:** national 0/8, table 0, wins 0; wave reach W1–W4 8/8, W5 1/8; median survival 91.5d, max 150d; 109 deaths, "the wild" 63%.
- **Sense-testing:** Ivy (s160215) dies d37 after "someone has to learn, or find one" repeats unanswered d21/d35 and a false "back on their feet" line d25; fever deaths have no say line at all. Cure lines (Grace, Lillian) read like people — named healer, method, witnesses — but the instrument calls Lillian "recovered" and her cure "unrecorded."
- **Village assessment (plain words):** 7/8 villages died, all regional, wave-4-stuck, bleeding out on the road; only s160209 survived 150d. Wound fever killed 2 people all run, both in the one healer-less village.
- Evidence: evidence/2026-11-10/sim-medcure-b.md + sim-medcure-b-prereg.md. Commit e6049f281 (rebased onto f5eeeec8d after Loop A landed raiserseat-a mid-run; proof 14/14 green after rebase).

## Arm 2 — sim-knowledge-b (MEASUREMENT, Tier 1 #3) — LANDED a74e8a061 — GO

Coverage Tier 1 #3, first numbers, broad (Steve 2026-11-10 11:14: knowledge means more than combat). Band **170217–170224** (8 seeds × 100d, competent, death-aware). Candidate band 170209–170216 collided with the diplo confirm band (named in sim-diplo-a-prereg.md:159) and was not taken; collision recorded in the prereg. Prereg written before any judged sims; combat slice recorded only as the audit §3 baseline pointer, not re-measured. Zero src/js.

- **GO bar, all six met:** 8/8 per-seed JSONs with all sections; 0 instrument errors; every domain counted or explicitly unmeasurable-with-reason; neutrality 3/3 identical digests; determinism 3/3 identical; proof **41/41 PASS** (incl. swapped-label and dropped-event fixtures).
- **FOOD — yes:** 1,372 villager pantry draws, 1,698/1,699 items known-edible (99.9%); unknown flesh carries 0 kcal so it can't be drawn; 799 experiment-beat fires (~1/day/seed). Metric-review caveat: the rate measures the *scholar's* knowledge (`pantryItemKnown` gates monster meat on naming); the villager-side rate (meat → `monsterFoodSafe`, plant → `plantKnownBy(vid)`) is the next run's revision. The mechanism finding (unknown flesh has 0 kcal, can't be drawn) stands.
- **LOOTING — yes for hauls, no for caches:** 78 haul offers, 61/61 non-famine offers for unrevealed flesh; 50 hauls formed, 36 arrivals. Trips to known caches **UNMEASURABLE** (no known-cache store exists); 302 cache finds (352k kcal) are expedition luck.
- **PEOPLE — yes, strictly:** 5,941 visit-target decisions, **0** with no known-person channel (mate 75%, trust>40 87%, away 69%). Bonds: staged 136, **expired 135**, accepted 19, refused 9. `compareMaps`: 0 events in 800 village-days.
- **FORAGING — no:** 554 trips, 10.3% visited-before, inside the 8–21% chance band. Known-rich-patch trips **UNMEASURABLE** — no patch store exists anywhere in `src/js/`.
- **EXPLORING — no:** 105 trips, 14.3% visited-before (chance). `visitedTiles` is written once at seed and never read by any movement decision.
- **Sense-testing:** haul departures name carcasses by descriptor ("the moth the size of a dinner plate"); unknown flesh comes home labeled "test it cautiously" and later rots out with a voiced lesson; bonds land humanly ("Bonded. Whatever comes, we face it together.") but mostly expire in silence.
- **Wall:** won 0/8, national 0, table 0; wave 5 unlocked on 2/8; all 8 villages alive at the 100d horizon (median survival = cap, 101d); deaths 86 (the wild 41, monster 22). Standing plateaus at exactly **199 on 5/8 seeds** — filed as a finding.
- Evidence: evidence/2026-11-10/sim-knowledge-b.md + sim-knowledge-b-prereg.md. Commits d7ad00107 + a74e8a061 (rebased onto 5dea46a45, conflict-free).

## Pooled wall (this run's judged corpora, 16 seeds)

National 0/16, table 0/16, wins 0/16, wave-5 unlock 3/16, median survival 91.5d (medcure) / capped 101d (knowledge). Scale-onramp stays converging (NOT converged): Tier 1 now fully measured — all five items have first numbers on master — but no village in either corpus reached national, and the full seat remains unmeasured in play.

## Telemetry deviation check (coordinator, merged master)

- Medcure corpus: 3 LOUD lines (national 12→0, table 16→0, wins 16→0, n=8) — REGIME artifacts (competent-only corpus vs WINSEAT baseline; competent never wins by design, per prereg). Baseline NOT rolled, no investigation item.
- Knowledge corpus: telemetry-check REFUSED the input ("recorder-corpus input: all 8 rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). Not a LOUD line and not a failure — the script compares run rows only; recorder corpora are compared with sweep-compare tables. No baseline roll; wall numbers are reported in the arm evidence instead.

## Infrastructure

- Master moved 3× under the run: Loop A landed raiserseat-a (f5eeeec8d, NO-GO closeout + revert) between the medcure proof and merge (ff-only correctly refused the diverged branch; rebased, proof green, merged); another lane landed killchoke-a (5dea46a45) before the knowledge merge (branch already based on it — clean ff). No conflicts anywhere; all proofs green after every rebase and on merged master.
- **Origin divergence: pre-existing, NOT touched.** Local master a74e8a061 vs origin/master a628aeaf3 (PR #121) — merge-base d229b58f5 (Nov 8 batch ship), 457+ local-only commits vs 156 origin-only. The 1248Z run already recorded this as handled by the main-session reconcile-divergence job. Nothing pushed; ship loop owns pushes.
- **Service restart mid-closeout (~20:31Z)** during the coordinator's knowledge proof re-run: the 9 proof-leg files had been deleted (regeneration step) when the service restarted; the md5 record and log were lost with /tmp. Recovered from the committed state: re-ran the proof from the file-absent state — **41/41 PASS** — and the regenerated files differ from the committed ones ONLY in `anchorCommit` (d7ad00107 → a74e8a061, HEAD at generation time); event tables byte-identical. Restored the committed files before merging, so the merged branch is exactly as the worker committed it.
- Safe-commit index clobber hit the medcure worker commit (×1) and both knowledge worker commits (×2, once as `MM`) — repaired via the `ls-tree -r HEAD | update-index --add --index-info` pipe each time; commits verified correct.
- `check.js --quick` was killed after ~11 min with no output under the sibling's parallel jest load (knowledge arm); the arm's own proofs (14/14, 41/41) and `node --check` on all new scripts are green. Full green list belongs to the ship loop.
- Worktree registration slow (~2 min/tree under load), not failed. No EPERM flap this run.

## Findings appended (6, all open)

- #2094 fever deaths silent / "someone has to learn" line has no path (medcure).
- #2095 same-tick onset+cure invisible to snapshot episodes (medcure).
- #2096 bond proposals expire far more than refused (knowledge).
- #2097 compareMaps never fires under the competent driver (knowledge).
- #2098 standing plateaus at exactly 199 on 5/8 seeds (knowledge).
- #2099 patch knowledge exists for the scholar's hands but not villager routing (knowledge).

## Metric review (coordinator)

- Medcure G2's failure is an instrument-scope finding, not a game verdict: the prereg's episode builder assumed daily snapshots could see onset+cure; the engine resolves both inside one `endDay` tick. The G2 bar was judged as written (NO-GO stands; no re-score). M1 must not be cited as a census re-measure.
- Knowledge FOOD's 99.9% is a scholar-side rate by construction (see arm metric review); the villager-side revision is owed before anyone claims "villagers eat only what they know."
- Knowledge's two UNMEASURABLE domains (known caches, known-rich patches) are findings about missing stores, not instrument gaps — the instrument correctly reports that the game keeps no such knowledge to read.

## Next blanks, in order

1. Measurement-proof refresh (1248Z top blank, still owed): regenerate a fresh neutral panel on the new tip; do NOT re-point to an old panel.
2. Coverage Tier 2 first item — cooking — first numbers (Tier 1 is now fully measured: #1 roleform e5c19e54e, #2 diplo 70e3af870, #3 knowledge a74e8a061, #4 medcure e6049f281, #5 spawn census 00cc52780).
3. Medcure re-measure with event capture (sick-record create/delete events or sub-daily sampling) before M1 can be re-measured; do NOT re-run band 160209–160216 with the same instrument.
4. Knowledge FOOD villager-side rate revision (monsterFoodSafe / plantKnownBy(vid)).
5. Standing-199 plateau read (finding #2098) + bond-expiry / compareMaps design calls (findings #2096/#2097, steve-call).
6. Flee-repair build (Loop B queue item 2, Steve-call-held, branch sim-fleerepair-a exists).
7. Arm-2 toggle run (Loop B queue item 1, tracker blank #4, still without a verdict).

Claim deleted; lock deleted. Both arms merged locally, pending ship.
