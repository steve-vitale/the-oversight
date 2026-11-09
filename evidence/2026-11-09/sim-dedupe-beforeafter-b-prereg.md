# sim-dedupe-beforeafter-b — prereg (DIAG, zero src/js)

**Arm:** sim-dedupe-beforeafter-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1030Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-dedupe-beforeafter-b, base master `8419eefa4` (verified: `git log --oneline -1` in the worktree reads `8419eefa4` after a clean rebase, no conflicts; main-tree `git rev-parse master` reads the same SHA). **Prereg committed BEFORE any judged computation.**

## The question

Is commit `f496b0072` (conversation.js foreign-phrase dedupe, +20/−2, journey crisis r156) the mover of seed 53007's MOVED→NEW endpoint step? The endpoint moved on current master: the village still sits a lesser seat and still reaches wave 4, but it now dies at 138d (was 150d survived), standing 100 (was 199), 0 wave-4 kills (was 2), 15 fallen (was 9). The dedupe is the ONLY src change in `55b5e5aae`→`ba21ca026`, and the suspected mechanism is that it un-blocks foreign-phrase lines that previously returned null, so conversations that dead-ended now take branches and the seeded stream diverges (first daily divergence was d10). The mechanism is suspected, NOT proven. Foundation: `evidence/2026-11-09/sim-fightblend-53007-b.md` (§ What moved it) + `evidence/2026-11-08/sim-53007-bisect-b.md`.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread), wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08). Readiness bars (armored/armed/tricks/veterans) gate the standing unlock. No canon doc covers seed attribution — the question is answered from measurement, not invented.

## Endpoints actually read (committed corpora, values read directly, not assumed)

- **MOVED headline** — bisect-b corpus `evidence/2026-11-08/perseed-53007-bisect-b/doorwalk-53007-a-s53007-doorwalk-baseline.json` (master `55b5e5aae`, new instrument): 150d, gameDays 151, survived, standing **199**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **90**, wave-4 kills **2**, fallen **9**, mechanism combat-led (7/9 violent).
- **NEW headline** — fightblend-b corpus `evidence/2026-11-09/perseed-fightblend-53007-b/doorwalk-53007-a-s53007-fightblend-53007-b-current.json` (master `ba21ca026`, new instrument): 138d, gameDays 138, village-lost, standing **100**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **92**, wave-4 kills **0**, fallen **15**, mechanism mixed/other per the 53007-a classifier rule (the `'the arena'` ×3 classifier gap is carried as reported, not re-scored).

## Ancestry + diff facts (verified from git before this prereg, not assumed)

- `f496b0072` = "journey crisis r156 (adopted): fix no-words foreign-phrase dedupe". Its parent `f496b0072^` = `c0763d194` ("sim-winnability-round-0330: Loop B 0330Z round evidence …") — parentage verified with `git log --oneline -1 f496b0072^`.
- `55b5e5aae` is an ancestor of `c0763d194` (verified with `git merge-base --is-ancestor`).
- `55b5e5aae`→`c0763d194` src diff: **NONE** (zero `src/` changes). L0's `src/` is byte-identical to the bisect-b master that produced MOVED — the strongest possible pre-leg expectation.
- `c0763d194`→`f496b0072` src diff: **only `src/js/conversation.js`, +20/−2**. L0→L1 differs in exactly one src file, so a L0=MOVED + L1=NEW split fingers the dedupe with no other src confound.
- `f496b0072`→`ba21ca026` src diff: **NONE** (the two intervening commits are journey-crisis closeout + journey landing r120, evidence/scripts only). L1's `src/` is byte-identical to the fightblend master that produced NEW.
- `55b5e5aae`→`ba21ca026` src diff: **only `src/js/conversation.js`, +20/−2** — confirms the fightblend evidence's "only src change in range" claim from git, not from memory.
- `f496b0072` also touches `scripts/test-capable-bot-20261014.js` (1 line) — a test file, not game code; it is NOT overlaid onto the legs (the frozen instrument overlay replaces the driver chain, and the leg's own `scripts/` is used otherwise — see Method). The dedupe itself is pure string normalization (`normPick`/`norm` are pure functions; no RNG draws added or removed, per the fightblend evidence).
- `index.html` script list: verified identical at `c0763d194` and `f496b0072` as part of the extraction check (game.js hash match against the commit blob, see Method).

## Legs (seed 53007 ONLY, no band spend)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). One seed only. Corpus under `evidence/2026-11-09/perseed-dedupe-beforeafter-b/`.

1. **L0 pre-dedupe** — `f496b0072^` = `c0763d194`, git-archive extraction. RUN=`dedupe-beforeafter-b-pre`.
2. **L1 dedupe** — `f496b0072`, git-archive extraction. RUN=`dedupe-beforeafter-b-dedupe`.
3. **L0 unrecorded control** — same as L0 with `DIAG_RECORDER=0`, RUN=`dedupe-beforeafter-b-pre-unrec`, for the G2 neutrality bar (one leg only, per the task brief).

## Decision tree (binding) + STOP rule

- **STOP (endpoint-moved):** if L0 does NOT reproduce the MOVED headline (150d, survived, standing 199 ± 5, maxWave 4, seatDay 90, 2 w4 kills, fallen 9, combat-led), STOP and report L0's actual headline; do NOT attribute. The MOVED headline is the pre-leg anchor — without it there is no step to attribute.
- **GO (f496b0072 FINGERED):** iff L0 reproduces MOVED AND L1 reproduces NEW (138d, village-lost, standing 100 ± 5, maxWave 4, seatDay 92, 0 w4 kills, fallen 15). All headline fields must match within the stated tolerances; standing tolerance ±5 covers instrument-overlay drift only — any use of it is reported as drift, not silently accepted.
- **EXONERATED:** if L0 reproduces MOVED but L1 does NOT reproduce NEW, `f496b0072` is EXONERATED — report L1's actual headline and name the next range to bisect. Note for the exoneration branch: `f496b0072`→`ba21ca026` contains NO src change, so a NEW headline that fails to reproduce at `f496b0072` cannot be blamed on a later src mover in that range — the next step would be re-verifying extraction fidelity / determinism (re-run L1, re-check the game.js hash match), not a further bisect. Do NOT bisect further this run unless time clearly permits — one midpoint max, and only if the prereg's bars stay binding. There is no midpoint inside a single-commit range in any case.
- **MIDDLE SHAPE:** any leg matching neither headline is reported as an unjudged middle shape with its full headline, never forced into either verdict.

## Method

- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch dirs under the worktree (`scratch-dedupe-<leg>/`, deleted after use — reproducible from `git archive`). NOT new worktrees.
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, `scripts/policies/competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`.
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` will read the worktree tip (scratch sits under the worktree, so `git rev-parse HEAD` resolves upward) — the SHA under test is recorded in the evidence file, as 53007-a/bisect-b/fightblend-b did with their anchor quirks.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53007`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires). The smoke is pre-verification, not a judged computation — it proves loading only.
- Driver invocation per leg (from the worktree): `REPO=<scratch> DAYS=150 SEEDS=53007 RUN=<run> OUTDIR=<worktree corpus dir> node <scratch>/scripts/doorwalk-53007-driver-20261108.js` (DIAG_RECORDER=0 for the unrecorded control only).
- First-divergence day: compare the daily rows between the L0 and L1 corpora (living, pantry, sick, wounded, hungry) and report the first day they differ; fightblend-53007-b saw d10 against the 53007-a corpus — confirm or correct it against the L0/L1 pair.
- Classification rule: the 53007-a prereg rule, applied mechanically via `scripts/analyze-53007-20261108.js` (unchanged). Cause groups VIOLENT / ATTRITION / OTHER as registered there; `'the arena'` stays unmapped (carried as OTHER, per the fightblend evidence — the classifier gap is a backlog finding, not re-scored here). `deathSays` catches "deadfall" (known instrument quirk; does not affect any judgment).
- Flap protocol: probe-gate EVERY git write; if a probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through a retry preload if needed (wrap `fs.writeFileSync` with bounded EPERM retry + read-back verify, unique temp name + rename), following the bisect-b/fightblend-b pattern — the corpus write is retried, nothing else changes. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Worktree-local safe-commit: copy `scripts/safe-commit.sh` into the worktree FIRST (it cds to its own dirname's parent — invoking the main-tree path from a worktree commits in the MAIN tree; never do that), then `bash scripts/safe-commit.sh "msg" -- <files>`. Never bare git commit, never git add.

## GO bars (binding — DIAG-GO requires ALL)

1. L0 pre-dedupe reproduces the MOVED headline — or the endpoint-moved STOP fires and the run ends there, reported honestly.
2. Each judged leg produces a full daily corpus with an end snapshot (rows span d2..`gameDays`, diag on every row, 0 instrument errors) — the G3 shape as revised by 53007-a Amendments 1–2.
3. The leg headlines are judged against the decision tree above (MOVED or NEW, no middle shape forced).
4. **G1 det-gate PASS** (proof `scripts/test-dedupe-beforeafter-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their headlines; headline-predicate synthetics for MOVED/NEW + the ±5 standing boundary; a broken recorder fails the integrity leg; a broken classifier fails the fixture leg).
5. **G2 recorder neutrality PASS** on the L0 pair (armed == unrecorded, same leg tree `c0763d194` — identical headline + trajectory).
6. **G3 corpus integrity PASS** on every new corpus in `perseed-dedupe-beforeafter-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).

## Proof

`scripts/test-dedupe-beforeafter-b.js` (det-gate + per-leg reproduction + neutrality + corpus integrity). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-dedupe-beforeafter-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution on a recorder corpus, same standing as 53007-a/bisect-b/fightblend-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced). Record that honestly.
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Do NOT edit `sim-findings.md` — findings are listed in the evidence file; the coordinator files them.

## Metric review (pre-registered note)

- The primary metric is the per-leg headline (survival + sit day + standing + w4 kills + maxWave + fallen + mechanism class), judged against the decision tree — not a friendlier re-scoring. A middle shape is reported as unjudged, never forced.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor). The ±5 standing tolerance exists only for instrument-overlay drift; if invoked, the drift is named in the evidence file.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read, unaffected by the sitmetric instrument change — d90 vs d92 is a game difference, judged as written.
- Wave-4 kills AND faced are reported on every leg (kills from `waveKillLog`, faced from `finalSeat`/wavesFaced) — the winnability chain's binding link, not just the survival.
