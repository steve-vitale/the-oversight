# sim-foodrung-band-b — prereg (DIAG, zero src/js)

**Arm:** sim-foodrung-band-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T2130Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-foodrung-band-b, base master `7cd52fbb0` (verified: worktree `git log --oneline -1` reads `7cd52fbb0`, "journey-scale r123"; worktree tree clean, 0 untracked at prereg time). **Prereg committed BEFORE any judged computation.**

## The question

Bandfreeze legs L3 (`992888172`) vs L5 (`5582c19b9`) differ in the e18f food rung — and the bandfreeze evidence observed, UNJUDGED (no preregistered bar for L3/L5): 53015 flips from death d111 (199 standing, 1 kill) to survival 150d (754, 11 kills), 53011 flips the other way (150d survived, 199, 4 kills → 62d lost, 199, 2 kills), 3 seeds headline-identical (53012, 53013, 53018). Judge the pair under a preregistered band rule — but do NOT judge the already-published numbers under a post-hoc bar. This arm's prereg is written BEFORE the re-run, and the legs are RE-RUN fresh; the re-run must reproduce the committed L3/L5 corpora, and the verdict is read off the FRESH re-run under the rule below.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread); wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08). Food-rung canon: the self-taught ladder lives in `src/js/food.js` (establishment r112/r116: skill builds from zero through practice; the rung is the XP→skill conversion). No canon doc covers seed attribution — the question is answered from measurement, not invented.
- `~/workspace/the-scattering/AGENTS.md` (repo house rules) read. `docs/MEASUREMENT.md` §§9–12, 14–15 read (pilot gate, death-aware horizons, prereg, convergence, metric binding, balanced panels).

## Verified diff — CORRECTION to the brief (verified from git before this prereg, not assumed)

The brief said L3/L5 "differ ONLY in the e18f food rung (food.js +22)". **That is not literally true.** The verified src diff `git diff 992888172 5582c19b9 -- src/` is **two files**:

- `src/js/food.js` (+22/−22 lines changed in the self-taught ladder hunk): L3 carries the STEEP rung (`e18f72dce`: `xp >= 30 ? 3 : xp >= 15 ? 2 : 1` — 5/15/30, establishment r116 pace dial 2); L5 carries the SHALLOW rung (`Math.min(3, 1 + Math.floor((xp - 5) / 5))` — 5/10/15, establishment r112). Blob check: L3 food.js `5cf9a0085…` == `e18f72dce` blob; L5 food.js `001ad602a…`. The food hunk is exactly the e18f rung change, reversed.
- `src/js/villager-agency.js` (+14/−1): L3 HAS the e3ef place-line fix (`placeAct` diegetic-act exemption, journey-succession r161); L5 does NOT. Blob check: L3 villager-agency.js `dc1231db4…` == `e3ef2b612` blob; L5 `14e3316b5…` == pre-place blob.

Supporting identity checks (verified, empty diffs): L3 src == `e18f72dce` src (`git diff --stat 992888172 e18f72dce -- src/` empty, as the bandfreeze prereg recorded); L5 src == `ba21ca026` src (`git diff --stat 5582c19b9 ba21ca026 -- src/` empty). The two trees sit on different branch lineages — that is why the place fix rides along with the rung.

**Bridge (binding):** the villager-agency.js difference is exactly the e3ef place-line fix, which bandfreeze judged **INERT on this very band** — committed L5/L6 corpora are byte-identical on daily rows, fallen lists, and wave-kill logs on all 8 seeds (0/8 move on any field). The pair therefore judges the food rung, with the committed INERT verdict as the explicit bridge: any band movement between the fresh L3/L5 re-runs is attributed to the rung, because the only other src difference has already been proven to move nothing on this band, on this instrument. If the reproduction check below fails on any seed, the bridge is re-examined before any verdict (see Reproduction rule). This correction is recorded here, before any judged computation, and the evidence file will carry it — the brief's one-file claim is not repeated as fact.

## The band rule (BINDING — this prereg binds the final rule)

The pair (b) rule from the bandfreeze prereg, applied to L3 vs L5 (L5 is the "fix" side in the mechanical sense — the shallow rung; direction is read off the data, not pre-defined, so the rung's direction is whatever the band says it is).

Per-seed endpoint fields (binding): days, end (survived / village-lost), standing, seatDay, w4 kills, w4 faced, fallen (count; the list is recorded per seed), mechanism (frozen analyzer rule reported, corrected `'the arena'` rule alongside — NOT a binding field), living at end, pantry, readiness5 veterans.

Per-seed movement (L5 vs L3) is judged on three numeric fields, each with a tolerance so instrument-overlay drift cannot fake a move:
- **standing:** moves DOWN if L5 − L3 ≤ −6; moves UP if L5 − L3 ≥ +6; else stable (±5 tolerance, as in the single-seed preregs and bandfreeze).
- **w4 kills:** moves DOWN if L5 < L3; UP if L5 > L3; else stable.
- **fallen count:** moves UP if L5 > L3; DOWN if L5 < L3; else stable.

Per field, the pair direction is the majority sign across the 8 seeds (counting only seeds where that field moves beyond tolerance; a tied field has no direction). A seed **moves with the pair** iff ≥2 of its 3 fields move in their majority direction and none moves opposite. A seed **moves opposite** iff ≥2 move opposite and none moves with the pair. Otherwise the seed is **no move**.

Pair verdicts, judged on the 8-seed band:
- **MOVER (the rung moves the band):** ≥5/8 seeds move with the pair AND 0 seeds move opposite.
- **INERT:** 0/8 seeds move on ANY field beyond tolerance (all three fields stable on all seeds).
- **MIXED (unjudged):** anything else — report per-seed and per-field, no summary verdict word beyond MIXED.

**Single-seed rule (carried, binding):** a single-seed move is a trajectory note, never a finger — even if 53015 flips again. The band rule above is the only finger rule this arm uses.

## Reproduction rule (BINDING — the validity check)

The fresh re-run endpoints must equal the committed L3/L5 corpora endpoints per seed on every binding field (standing EXACT — same instrument, same seeds; the ±5 tolerance is for the L3-vs-L5 movement judgment, NOT for reproduction; any tolerance use in reproduction is reported as drift). The committed reference endpoints (read from `evidence/2026-11-09/perseed-bandfreeze-b/` before this prereg — published numbers, recorded here only as the reproduction target, NOT judged):

| seed | L3 committed (`bandfreeze-b-pre-b98f`) | L5 committed (`bandfreeze-b-pre-e3ef`) |
|---|---|---|
| 53011 | 150d surv, 199, seat d90, 4 w4 / 7 faced, 16 fallen, living 7, pantry 15,801, vet 0/2 | 62d lost, 199, no seat, 2 w4 / 4 faced, 14 fallen, living 2, pantry 0, vet 0/2 |
| 53012 | 44d lost, 125, no seat, 0 w4 / 1 faced, 8 fallen, living 5, pantry 0, vet 0/2 | 44d lost, 125, no seat, 0 w4 / 1 faced, 8 fallen, living 5, pantry 0, vet 0/2 |
| 53013 | 65d lost, 199, no seat, 0 w4 / 3 faced, 7 fallen, living 7, pantry 0, vet 0/2 | 65d lost, 199, no seat, 0 w4 / 3 faced, 7 fallen, living 7, pantry 0, vet 0/2 |
| 53014 | 79d lost, 199, no seat, 3 w4 / 8 faced, 19 fallen, living 0, pantry 0, vet 1/2 | 80d lost, 345, no seat, 3 w4 / 7 faced, 19 fallen, living 5, pantry 0, vet 0/2 |
| 53015 | 111d lost, 199, seat d90, 1 w4 / 5 faced, 18 fallen, living 3, pantry 0, vet 0/2 | 150d surv, 754, seat d90, 11 w4 / 8 faced, 8 fallen, living 8, pantry 14,882, vet 3/2 |
| 53016 | 150d surv, 669, seat d90, 4 w4 / 5 faced, 13 fallen, living 8, pantry 18,089, vet 1/2 | 150d surv, 539, seat d90, 7 w4 / 8 faced, 12 fallen, living 8, pantry 11,456, vet 2/2 |
| 53017 | 62d lost, 135, no seat, 0 w4 / 1 faced, 6 fallen, living 10, pantry 0, vet 0/2 | 52d lost, 135, no seat, 0 w4 / 4 faced, 6 fallen, living 11, pantry 0, vet 0/2 |
| 53018 | 150d surv, 159, seat d90, 0 w4 / 6 faced, 12 fallen, living 8, pantry 5,200, vet 0/2 | 150d surv, 159, seat d90, 0 w4 / 6 faced, 12 fallen, living 8, pantry 5,200, vet 0/2 |

- **Reproduction PASS:** all 8 seeds reproduce on both legs exactly (binding fields + fallen lists + daily rows identical to the committed corpora, modulo the `run` key). The verdict is then read off the FRESH re-run under the band rule.
- **Reproduction FAIL (any seed, any binding field, either leg):** the drift is reported per seed and the **verdict is HELD** — no MOVER/INERT/MIXED word is issued for the drifted pair. The arm reports the drift table and stops; the instrument (extraction, overlay, or determinism premise) is the finding, not the rung. This is the same discipline as the bandfreeze DIAG-STOP, applied per-leg.

## Legs (band seeds 53011–53018 ONLY; doorwalk baseline leg, 150d death-aware)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). Corpus under `evidence/2026-11-09/perseed-foodrung-band-b/`. Leg order is binding.

1. **L3 rung-steep** — `992888172`, git-archive extraction. RUN=`foodrung-band-b-l3`. 8 seeds.
2. **L5 rung-shallow** — `5582c19b9`, git-archive extraction. RUN=`foodrung-band-b-l5`. 8 seeds. Runs after L3 regardless of L3's reproduction result (each leg's reproduction is judged against its own committed corpus); the PAIR verdict is issued only if BOTH legs reproduce.

No other legs. No F0 re-freeze (the freeze is bandfreeze's, at `fd306cac1`; this arm re-runs two of its legs, it does not re-freeze). No unrecorded control (G2 neutrality was proven on 53011 four times over + the F0/F0b pair in bandfreeze; the recorder is unchanged).

## Decision tree (binding) + STOP rules

- **Reproduction FAIL → verdict HELD.** Report the drift table exactly; do NOT issue a pair verdict; do NOT re-score the published numbers under the band rule (the published numbers are the reproduction target, never the judged data).
- **Instrument STOP:** any new corpus fails G3 → STOP, investigate, do not attribute.
- **Pair verdict:** MOVER / INERT / MIXED per the band rule above, judged on the FRESH L3 vs L5 re-run per-seed endpoints. A MOVER verdict says the rung (steep vs shallow self-taught ladder) moves band endpoints consistently — it does NOT by itself say the rung caused any single-seed step elsewhere. The evidence file states the scope plainly.
- **PARTIAL / per-seed movement:** reported per seed with the three fields' deltas in plain words. NO summary verdict word beyond the band rule's three (MOVER / INERT / MIXED).

## Primary metric + GO threshold (binding)

- **Primary metric:** the fresh L3-vs-L5 band endpoint table (per-seed headline on the 8 seeds) + the band-rule verdict, plus the reproduction check against the committed corpora.
- **Horizon:** 150d death-aware — reachability lever (waves 4–5, national, table, wins), §10 150–200d guide; matches bandfreeze so the pair is comparable to the frozen band.
- **Seeds:** 53011–53018 (exact literals). **Policies:** doorwalk baseline only.
- **GO threshold:** reproduction PASS on both legs (16/16 seeds exact) AND the pair judged under the band rule. A MIXED verdict is a judged outcome, not a miss — the GO is that the re-run reproduces and the pair is judged, not that the rung moves.
- **A miss is NO-GO, never re-scored against a friendlier metric mid-run** (§14). If the metric proves wrong, write it under "metric review" and propose the revision for the NEXT run.

## Method

- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch dirs under the worktree (`scratch-foodrung-<leg>/`, deleted after use — reproducible from `git archive`). NOT new worktrees.
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, and the 11 policy files in the dedupe/e18f overlay list (`competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`). (The 11 are the full transitive require closure, verified by the 2-day smoke, not by the count.)
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND the distinguishing files per leg (food.js L3 blob `5cf9a0085…` vs L5 blob `001ad602a…`; villager-agency.js L3 blob `dc1231db4…` vs L5 blob `14e3316b5…`), each matching its blob; overlaid instruments hash-match the current tip. The corpus `anchorCommit` reads the worktree tip (scratch sits under the worktree, so `git rev-parse HEAD` resolves upward) — the SHA under test is recorded in the evidence file, as 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b did with their anchor quirks.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53011`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires). The smoke is pre-verification, not a judged computation — it proves loading only.
- Driver invocation per leg (from the worktree): `REPO=<scratch> DAYS=150 SEEDS=53011..53018 RUN=<run> OUTDIR=<worktree corpus dir> node <scratch>/scripts/doorwalk-53007-driver-20261108.js`. Corpus writes go through a retry preload (worktree-local `scripts/flap-retry-preload-foodrung-band-b.js`, never committed, deleted after use — unique temp + rename + read-back verify, bounded EPERM retry), following the bisect-b/fightblend-b/dedupe-b/bandfreeze-b pattern.
- First-divergence day: compare the daily rows between paired corpora per seed (living, pantry, sick, wounded, hungry) and report the first day they differ, using the first-row-per-day helper (`rowsEqualOnDays` — the closing-duplicate artifact named in bandfreeze must not fake a divergence); also fresh-vs-committed per seed (must be none — reproduction is exact).
- Classification rule: the 53007-a prereg rule, applied mechanically, with `'the arena'` registered as VIOLENT in this arm's classifier (the proof script's classifier, `scripts/test-foodrung-band-b.js`), reusing the bandfreeze `classifyCorrected` pattern. The frozen analyzer `scripts/analyze-53007-20261108.js` is overlaid UNCHANGED for comparability — it is not edited. The mechanism label is NOT a binding headline field (the rule changed by instruction); both labels are reported. The monster-name-cause gap (`'Hushpuppy'` unmapped in both maps) is carried, named not bucketed.
- Flap protocol: probe-gate EVERY git write; if a probe fails, do read work and retry later — never force a write, never hand-edit a ref. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Worktree-local safe-commit: `scripts/safe-commit.sh` is already present in the worktree (it cds to its own dirname's parent — invoking the main-tree path from a worktree commits in the MAIN tree; never do that), then `bash scripts/safe-commit.sh "msg" -- <files>`. Never bare git commit, never git add. Expand directory paths to file lists first (safe-commit.sh refuses directories).

## GO bars (binding — DIAG-GO requires ALL)

1. Legs complete: 8/8 band seeds on each of L3 and L5 with full daily corpora + end snapshots (16 corpora, 0 instrument errors).
2. Reproduction PASS: fresh L3/L5 endpoints equal the committed L3/L5 corpora on every binding field, every seed — or the verdict is HELD and the run ends there, reported honestly.
3. Pair judged against the band rule (MOVER / INERT / MIXED) — or the HOLD rule above fires first.
4. **G1 det-gate PASS** (proof `scripts/test-foodrung-band-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their endpoints; headline-predicate synthetics; band-rule synthetics (majority-move, no-opposite, mixed, mover, inert); a broken recorder fails the integrity leg; a broken classifier fails the fixture leg; the `'the arena'` registration is itself a tested leg).
5. **G3 corpus integrity PASS** on every new corpus in `perseed-foodrung-band-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).
6. No G2 leg (neutrality already proven on this recorder + leg; see Legs). Stated, not skipped silently.

## Proof

`scripts/test-foodrung-band-b.js` (det-gate + per-leg reproduction + corpus integrity + band-rule judge + `'the arena'` classifier registration, adapted from `scripts/test-bandfreeze-b.js`). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Real-corpus legs encode the decision as taken (reproduction legs SKIP when a leg never ran, per the fightblend-attrib-b pattern). Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-foodrung-band-b`.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival — reported in the evidence file even though the doorwalk leg never walks a door (baseline leg: national 0/8, wins 0/8 by design; table sits count, wave-4 unlocks, wave-5 unlocks, median survival across the 8 seeds).

## Sense-test

Read transcripts/dialogue on at least one band seed; judge meaning and coherence, never just counts (mourning beats, table-set → Audit sequence, name rotation, grief-card beats).

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution on recorder corpora, same standing as 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b/reask-b/bandfreeze-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Do NOT edit `sim-findings.md` — findings are listed in the evidence file; the coordinator files them.

## Metric review (pre-registered note)

- The primary metric is the per-seed headline + the band-rule verdict on the FRESH re-run, judged against the decision tree — not a friendlier re-scoring. A mixed band is reported as unjudged per the rule, never forced into a finger. A reproduction failure HELDS the verdict, never re-scores the published numbers.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor; dedupe-b proved it twice over on two different trees; e18f-b a third time; reask-b a fourth; bandfreeze a fifth, on an 8-seed band). The ±5 standing tolerance exists only for instrument-overlay drift between DIFFERENT trees (L3 vs L5 extractions); on a same-leg re-run (fresh vs committed) the match is exact, no tolerance.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read — a game difference, judged as written.
- Wave-4 kills AND faced are reported on every leg (kills from `waveKillLog`, faced from `finalSeat`/wavesFaced) — the winnability chain's binding link, not just survival.
- One metric note carried from 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b/reask-b/bandfreeze-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.
- The 53007 e18f finding (the rung authored only the d17–d20 opening on 53007 before re-converging to NEW) stands for 53007 whatever this arm finds — this arm judges the rung ON THE BAND, a different instrument, and the two findings are not in conflict.
