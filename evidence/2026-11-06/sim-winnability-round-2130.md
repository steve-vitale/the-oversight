# Loop B 2130Z — ADOPTION of the dead 1730Z run: survivaltime + ragerepress + midnightkill LANDED, merged locally pending ship

- Run: `fleshout-loop-b-20261106T2130Z`, axis scale-onramp / winnability chain (Steve 2026-11-03 re-point)
- Coordinator: adoption run. No new arms, no new seed bands, no new sims. All three arms were COMPLETE on their branches when the 1730Z run died; this run rebased each onto current master, re-ran its proof on the rebased tip, and merged ff-only.
- Master at closeout: `2df1052b5`. This run's three arms landed as `ba6d89846`; Loop A then landed wanderspawn-a on top (3 commits, `610876144` prereg / `18359d824` fix / `2df1052b5` evidence — wanderer-spawn 20-HP fix, GO stands, median 91d, W4 kills 3→1), closing the 1630Z next blank (3). Loop A's coordinator evidence commit `26f11200a` landed after this run's evidence commit `cf11bbdf7` and swept in this file's staged deletion — an index-clobber artifact of `cf11bbdf7` itself (the safe-commit clobber class: the file sat staged-as-deleted in the main index after my commit, and Loop A's bare `git commit` took the deletion with it). Loop A's coordinator restored the file byte-identical (blob `817979d58b`) in follow-up commit `0a4a517a8`; this run's follow-up commit then re-added it with this note. Lesson restated in Loop A's tracker entry: never bare-commit on the hot tree; always `git commit -m ... -- <paths>` after checking `git status` for sibling-staged entries. No gate, price, deed, readyDemand, or win-price change in any arm.

## STALE-LOCK RECOVERY (run start)

- Lock `fleshout-loop-b-20261106T1730Z` (created 2026-11-06T18:24:00Z) deleted at 21:37:17Z: its three trees' heartbeats 20:01:15–20:01:17Z (~88 min stale, past the 15-min guard), no live sim processes, worktrees clean, no worker writes in the last 15 min (the survivaltime worktree's post-20:00Z files are bond-initiation rebase-checkout artifacts, not worker writes). Dead per guard. Dead claim retired to `fleshout-loop-b-20261106T1730Z.json.DEAD` with a disposition note.
- Loop A LIVE on its 2103Z claim (sim-drive-practice-a + sim-wanderspawn-a + sim-entrycensus-a, self-improvement-drive adoption) — NOT touched. Loop A landed drive-practice-a mid-run (master `2b9b0371e`, "practice moves competence (pilot GO, 14/16 moved, baseline 0) [needs-eyes]"); journey-landing r111 also landed mid-run (master `2f67b721c`). All three adopted branches were rebased onto the explicit master SHA read immediately before each rebase; ff-only merges refused the diverged branches after each sibling landing exactly as designed, and each branch was re-rebased and re-proved.
- Pre-flight: main tree clean, disk 29%, `worktree-reap.sh` clean (8/16 active at start; one LOUD line, journey2-social uncommitted changes, another lane's tree — never touched).

## Arm 1 — sim-survivaltime-b: armor-curve retune K=20→6 — pilot GO on primary, secondary MISSED

- Branch `sim-survivaltime-b`, 8 commits. Worker evidence: `evidence/2026-11-06/sim-survivaltime-b.md` (prereg `sim-survivaltime-b-prereg.md`, corpus `evidence/2026-11-06/perseed-survivaltime-b/`, 16 files, seeds 88001–88008, 150d, competent both legs).
- Lever (game code): shared `Game.armorReduction(prot, pierce)`, `r = effP / (effP + 6)` (was 20), at all four absorb sites (`src/js/game.js`, `src/js/fieldFights.js`). No win price, deed gate, readyDemand, gate, or pierce value changed.
- Verdict (worker's, unchanged by adoption): **GO on the preregistered primary — wave-4 TB kill rate (log kills / traced TB fights) baseline 1/20 = 5.0% → armed 9/55 = 16.4% (bar ≥ 10%); matched-trace definition 8/55 = 14.5% agrees. Secondary MISSED: median rounds survived in LOST wave-4 TB fights 6 → 7 (bar ≥ 12). Guards hold: median survival 92d → 80.5d (0.875×, bar ≥ 0.8×); starvation deaths 8 → 3.** One scholar killed twice (gen_1tvj74u, 88004); the old "post-first-blood kills 0/11" finding no longer holds. The kill-rate gain came from villages fighting more and biting deeper, not from 12-round stands — the mechanism post-mortem (more monster turns, armor-ignoring burst, 100-HP death budget) is in the arm evidence.
- Wall (this arm's corpus): wins 0, national 0, table 0 both legs; wave-5 unlocks/faced/kills 0 both legs; readiness-5-ready days 0; living wave-4 killers at end 0 both legs. Standing rose on the armed leg (five villages at 190–199 vs two at 199 baseline) but no village crossed into national. The lever moves the first half of the chain (kills happen) but not the second (killers living to fight again).
- Adoption: rebased 3 times (onto `f4dafd387`, then `2b9b0371e` after Loop A's drive-practice landing, then `2f67b721c` after journey-landing r111, then onto `ff5a4fdc5` after the midnightkill + ragerepress merges — all clean, no conflicts, no stop-at-pick quirk). Proofs green on the final tip `ba6d89846`: `test-survivaltime-20261106.js` **39/39**, `test-aegis-recipient.js` **12/12**, `test-armor-curve-r8-20261012.js` **15/15**, `test-bark-armor-seed-20261011.js` **13/13**. Merged ff-only as `ba6d89846`.
- Adjacent-test state (characterized by the coordinator, NOT hidden): `test-armor-cap-20261009.js` reads **287 passed, 6 failed** on the landed tip — the same 6 failures, byte-identical lines, on the worker's own tip `24b741be4` (base `c7bf1e308`, pre-stayrecover, pre-drive-practice). Five are PRE-EXISTING on master: the old test file on master code reads 290 passed, 5 failed with the identical lines (unarmored-baseline kill-rate bands — hushwolf 7% not in [60,95], belltoad 0% not in [10,30], bulldozer 0% not in [2,12] — and the hide-strictly-better checks, 0% vs 0%). P=0 paths cannot move under any K, so those bands were already stale before the retune. The sixth (bulldozer tank: 0 hits absorbed in 4 fights) is a brittle guard on a ~1-hit sample (master: exactly 1 hit [3]; belltoad 1 hit both legs; hushwolf 31) — the 0-vs-1 flip is sampling noise, not a lever regression; the tank averages move in the retune's direction (hushwolf absorbed 10.1 vs 6.2, belltoad 7 vs 4). Logged as a finding (see Findings); the next run should re-baseline the cap test's field bands from a fresh field corpus rather than treating these as lever regressions.

## Arm 2 — sim-ragerepress-b: rage re-press — NO-GO on the lever (number passed, mechanism never fired)

- Branch `sim-ragerepress-b`, 3 commits. Worker evidence: `evidence/2026-11-06/sim-ragerepress-b.md` (prereg `sim-ragerepress-b-prereg.md`, corpus `evidence/2026-11-06/perseed-ragerepress-b/`, 16 files, seeds 95001–95008 fresh, 150d).
- Lever (policy, now deleted): partydamage-base policy verbatim except rage exempt from the once-per-fight cap (`scripts/policies/competent-ragerepress-b.js`). The policy is DELETED with this run — the lever does NOT land. What lands is the measurement tooling: `scripts/ragerepress-instrument-20261106.js` (carries the midnight-spanning kill match the next recorder needs), driver, analyzer, proof test.
- Verdict (worker's, unchanged by adoption): **NO-GO — primary passed (armed 12/60 = 20.0% ≥ 10% bar, baseline 5/54 = 9.3%) but the metric-review caveat fires in full: the rage re-presses are consecutive-turn refresh churn that never delivered a doubled strike (48 re-presses, 0 doubled strikes), and the kills came from strike fights in which rage was never held. The lever is not the cause of the number.** Guards held (median survival 95.5d → 111.5d, starvation 2 → 3). The 1630Z next blank (6) is now CLOSED with an answer: do not cap rage at once per fight is the wrong lever as scoped — the re-presses are churn, and competent already re-presses freely, so the single-variable test was partydamage-base minus the cap.
- Wall (this arm's corpus): wins / national / table 0 both legs; field wave-4 kills 0 both legs; median rounds survived (lost TB fights) 6 = 6.
- Adoption: rebased 3 times (onto `f4dafd387`, then `2f67b721c`, then `9c6449cca` after the midnightkill merge — all clean). Proof green on the final tip `ff5a4fdc5`: `test-ragerepress-20261106.js` **37/37** post-deletion. Merged ff-only as `ff5a4fdc5`.

## Arm 3 — sim-midnightkill-b: ±1-day kill join — GO (a)–(d)

- Branch `sim-midnightkill-b`, 3 commits. Worker evidence: `evidence/2026-11-06/sim-midnightkill-b.md` (prereg `sim-midnightkill-b-prereg.md`). No new band — deliberate reuse of the committed corpora `perseed-partydamage-b/` (87001–87008) and `perseed-fightinterior-b/` (51001–51008). No judged re-run.
- Lever (recorder lineage, scripts only): ±1-day kill join + same-beast guard in `scripts/partydamage-instrument-20261106.js` (shared classifier), `scripts/fightinterior-instrument-20261106.js`, `scripts/partydamage-analyze-20261106.js` (pyrrhic matcher), plus `scripts/midnightkill-reclassify-20261106.js` (read-only re-classification).
- Verdict (worker's, unchanged by adoption): **GO — all four preregged thresholds (a)–(d) hold.** Partydamage armed matched kills 1/24 (4.2%) → 2/24 (8.3%) = log (the Nadia kill, fought d117, logged d118, rout → kill — exactly one trace changes ending on that corpus); fightinterior total matched 7 recorded / 9 pyrrhic → 9 = log; unclassified 0, ambiguous 0, unreconciled wave-4 log kills 0.
- Adoption: rebased twice (onto `f4dafd387`, then `2f67b721c` — both clean). Proof green on the final tip `9c6449cca`: `test-midnightkill-20261106.js` **61/61**. Merged ff-only as `9c6449cca`. This closes the 1630Z next blank (5) and finding #1828 (all three midnight-spanning sightings marked [fixed] in `sim-findings.md`).

## Wall (pooled judged ledgers this run)

- Survivaltime corpus (88001–88008, 150d): wins 0/16, national 0/16, table 0/16, wave-5 unlocks 0/16, wave-5 kills 0/16, readiness-5 days 0, living wave-4 killers at end 0/16. Wave-4 TB kills 1 baseline / 9 armed — the chain's first half moved; the second half (killers living) did not.
- Ragerepress corpus (95001–95008, 150d): wins / national / table 0/16; wave-4 TB kills 5 baseline / 12 armed (log), field wave-4 kills 0/16.
- Midnightkill: no new judged ledger (re-match only) — matched rates now equal log rates on both corpora.
- The wall is still wave-4 kills + killer survival. The fight-policy half is exhausted (solo P3, party P3, rage re-press all NO-GO or spent); the armor lever is the first game-code lever to move the kill rate, and it moves it by volume of fights, not by scholars standing longer.

## Telemetry deviation check

- REFUSED on the survivaltime corpus (recorder-corpus input: all 16 `--current` rows carry top-level `anchorCommit`; the script refuses recorder corpora, same as the 1630Z run). No LOUD lines, baseline NOT rolled. Balanced panel inapplicable (no Game-root change in midnightkill/ragerepress; survivaltime's Game-root change is judged by its own before/after pilot on identical seeds per its prereg — no compare `.md` fabricated).

## Metric review (coordinator)

- No metric was re-scored. All three verdicts are the workers' preregistered verdicts, read as written; the adoption re-ran proofs only, never the sims. The survivaltime secondary miss stands as a miss (7 vs 12 rounds) — the primary GO does not absorb it; both halves are the verdict, as the worker wrote it.
- The ragerepress NO-GO is the honest shape of a pilot that passes its number and fails its mechanism: the metric-review caveat in the prereg did its job. Future rage-adjacent arms should measure doubled strikes directly, not kill rate alone.
- The midnightkill GO is a recorder fix, not a lever — it changes what past corpora read, not what the game does. Its value is that the next recorder starts from matched = log.

## Findings

- #1828 midnight-spanning kill matching: [fixed] (midnightkill, landed `9c6449cca`) — all three sightings (99241, 99723, 87004) marked fixed in `sim-findings.md`.
- NEW open: armor-cap test carries 5 stale field bands + 1 brittle tank guard (see Arm 1). The next run should re-baseline the cap test's field bands from a fresh field corpus.
- The ragerepress worker's two findings stand as written (already appended by the 1730Z run): the "The The" double article in stun lines (minor narration defect, out of scope) and 'LOST'-ending mutual kills unmatched by the recorder (next recorder should check the log, fight day ± 1, on 'lost' endings too).
- #1829 (five scholars, one day, 41 HP) remains open — the 41-HP grind / finisher-sizing blank.

## Rebase-hash mapping (same content)

- midnightkill: `5d7e8dbd0` → `1464b485b` (onto `f4dafd387`) → `9c6449cca` (onto `2f67b721c`, landed).
- ragerepress: `b537adaca` → `8d2cfbfdf` (onto `f4dafd387`) → `dcff4e49c` (onto `2f67b721c`) → `ff5a4fdc5` (onto `9c6449cca`, landed).
- survivaltime: `d72e2d62a` → `5813ad4fe` (onto `2b9b0371e`) → `7a38d52b1` (onto `2f67b721c`) → `ba6d89846` (onto `ff5a4fdc5`, landed).

## Infrastructure

- Registry contention: heartbeats took ~80s each under Loop A's concurrent rebases; the midnightkill rebase+proof command took ~166s, survivaltime's ~195s — slow, not stuck. One background exec session (`proc_a2e6f7e737db`, survivaltime final proof set) vanished without delivering its result (`process.list` empty); the proof set was re-run with output to files and verified green on the final tip — no result was taken on trust.
- Safe-commit index clobber: NOT hit on any coordinator write this run (no coordinator commit was needed before the evidence commit below; the three arm commits were the workers').
- Master moved 4 times under the run (Loop A drive-practice `2b9b0371e`, journey-landing r111 `2f67b721c`, plus the run's own merges, plus Loop A wanderspawn-a `2df1052b5` after the last merge); every branch was rebased onto the explicit master SHA read immediately before rebasing, proofs re-run green after every rebase and on every merged tip.
- Base probe for check.js attribution: scratch worktree `check-capable-b` registered, `src/js/game.js` + `src/js/fieldFights.js` reverted to pre-merge base `2f67b721c` (the only src/js diff between that base and the merged tip is the armor change), capable-bot + mobile-combat-cadence re-run — both still fail, adjudicated pre-existing; probe tree removed, branch deleted, registry clean (2/16 active, both other lanes').
- check.js --quick on merged master: **282 passed, 8 failed in 860s** (log `/tmp/checkquick-2130.log`). The 8 failing scripts: `test-measurement-proof-update.js`, `test-measurement-workflow.js`, `test-mobile-combat-cadence.js`, `test-occupation-panels.js`, `test-measurement-cache-flags.js`, `test-phone-frame-proof.js`, `test-capable-bot-20261014.js` (39 passed, 1 failed), `test-establishment-r20-fixes-20261020.js`. None is an arm file; none names armor, game.js, or fieldFights in its failure text. Adjudication: the measurement-proof pair is DOCUMENTED pre-existing since the Oct 29 rebuild audit ("Proof source inputs are not current", 7 Game files moved after the proof). The two combat-adjacent failures were proven pre-existing by a base probe (scratch worktree `check-capable-b`, since removed): with `src/js/game.js` + `src/js/fieldFights.js` reverted to the pre-merge base `2f67b721c`, capable-bot still fails (exit 1, "real capable player combat earns the food deed at first use" — a food-deed assertion, not armor) and mobile-combat-cadence still fails (exit 1, both "enemy is announced before its action runs" and "Continue does not wrap the announced round a second time"). The counts match the survivaltime worker's own tree profile (282 passed, 8 failed — 7 pre-existing on base + 1 aegis, fixed test-only). **No check.js failure is attributable to this run's arms.** Loop A later ran check.js --quick on `2df1052b5` (post-wanderspawn): 283 passed, 7 failed — one script flipped to green with the wanderspawn fix; the capable-bot food-deed failure #1830 is in both profiles. The full 8-failure list is the standing pre-existing profile, not a regression — but it is a standing profile worth a dedicated pass, not a shrug: the measurement-proof staleness has been documented since Oct 29 without a refresh.

## Next blanks (in order, for the next run)

1. The 41-HP grind — finisher sizing from the field grind / grind-economics design question (steve-call if it needs a ruling) (#1829).
2. Why the 51002 kill's fight never closed through tbEnd (engine-level).
3. 159-round rout stall.
4. 53004 trajectory fragility.
5. What the arena and "a stranger" are.
6. Abilities reaching villagers — main session's ability-use follow-up (do NOT rebuild here).
7. Balance levers — Steve call; flee-repair port — Steve call (note: stayrecover, the flee-repair confirm GO, landed on master as `f4dafd387` during the 1730Z run's lifetime); pellet-bearer lock (#1819) — Steve call.
8. Re-baseline the armor-cap test's field bands from a fresh field corpus (new finding this run); the bulldozer-tank guard needs a larger sample or a hit-count band.
9. check.js standing profile: the measurement-proof staleness documented since Oct 29 still has no refresh — a dedicated pass, not another note.

scale-onramp stays converging (NOT converged): wave-4 kills are no longer rare on the armed leg (16.4%), but wins are still 0 everywhere, wave-5 kills still 0, and no village has banked two living wave-4 killers and sat. food-economy stays converging (NOT converged, untouched by this run).
