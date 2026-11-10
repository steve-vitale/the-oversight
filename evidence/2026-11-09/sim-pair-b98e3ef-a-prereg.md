# sim-pair-b98e3ef-a — prereg (DIAG, zero src/js)

**Arm:** sim-pair-b98e3ef-a (DIAG, zero src/js) · **Run:** fleshout-20261110T0216Z (Loop A) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-pair-b98e3ef-a, base master `1fc09bbe3` (verified: worktree `git log --oneline -1` reads `1fc09bbe3`; worktree tree clean, 0 untracked). **Prereg committed BEFORE any judged computation.**

## The question — a STABILITY RE-CONFIRM, not a first run

The b98ac0730 / e3ef2b612 single-commit before/after pairs were ALREADY run once, on the frozen band, by sim-bandfreeze-b (landed `52e8caec0`, `evidence/2026-11-09/sim-bandfreeze-b.md`):

- **b98ac0730 (secret-response fix): MOVER** — 5/8 seeds move with the pair (standing↑ + wave-4 kills↑), 0 against; band kills 12 → 33.
- **e3ef2b612 (place-line fix): INERT** — 0/8 seeds move on any field; daily rows byte-identical on all 8 seeds.

Master has since moved past the freeze base `fd306cac1` to `1fc09bbe3` (journey lanes and sim arms landed, including src/js changes). This run re-runs both pairs on the frozen band 53011–53018, on current master, to test whether the frozen verdicts still hold. It does NOT present the pairs as first-run; it is a re-confirm.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100; wave 5 gate standing ≥ 200 AND wave-4 faced; "Monster encounters are fought, not rolled" (Steve 2026-10-08). No canon doc covers seed attribution — the question is answered from measurement, not invented.
- `~/workspace/the-scattering/AGENTS.md` (repo house rules) read. `docs/MEASUREMENT.md` §§9–12, 14–15 read (pilot gate, death-aware horizons, prereg, convergence, metric binding, balanced panels). `docs/SIMULATING.md` read. `evidence/2026-11-09/sim-bandfreeze-b.md` and its prereg read first for the freeze method and the original pair verdicts.

## Ancestry + diff facts (verified from git before this prereg, not assumed)

- **b98ac0730** resolves (`git cat-file -t` → `commit`); `b98ac0730^` = `992888172`; pre→fix src diff is **only `src/js/conversation.js`, +97/−3** (secret-response fix). Commit message: "journey-deepening r120: secret-response fix — a villager's confession now gets an answer [needs-eyes]".
- **e3ef2b612** resolves (`git cat-file -t` → `commit`); `e3ef2b612^` = `5582c19b9`; pre→fix src diff is **only `src/js/villager-agency.js`, +14/−1** (place-line fix). Commit message: "journey succession r161: fix agency place-line dry (diegeticAct on place share; proof RED->GREEN, panel CAP-NC INSUFFICIENT-DATA) [needs-eyes]".
- Both commits are reachable on current master (`1fc09bbe3` contains them; bandfreeze landing `52e8caec0` is an ancestor of it). If either had not been reachable, this run would FAIL LOUDLY rather than substitute a different commit — both are reachable, so the run proceeds.

## What moved since the freeze (`fd306cac1` → `1fc09bbe3`, verified by diff before this prereg)

- **Frozen instruments: UNCHANGED.** `git diff --stat fd306cac1..1fc09bbe3` over the frozen instrument set (driver, recorder, analyzer, sim-harness, sitstep/stageally/bankkiller instruments, all 11 policy files) is **empty**. `src/data` unchanged.
- **src/js changed in 4 files:** `contests.js` (+23), `conversation.js` (+57/−?), `convo-dialogue.js` (+25), `convo-wants.js` (+24). These changes enter ONLY the F0r leg (worktree itself, current master) — the pair legs are git-archive extractions of the pinned pair SHAs, so no post-freeze src change enters them. That is the design: the pair legs test extraction reproducibility; the F0r leg tests whether the frozen baseline still reproduces on current master.
- **Env:** `PLENTYDEPRI=1 DEPOSITGATE=1` per the brief. Verified behaviorally identical to bandfreeze's unset env: the gates are armed unless the var is `'0'` (`src/js/game.js`: PLENTYDEPRI gate returns true when `process.env.PLENTYDEPRI !== '0'`; DEPOSITGATE likewise). Setting `=1` changes nothing vs unset — the re-confirm runs under the same game behavior bandfreeze did.

## The band rule (BINDING — carried verbatim from the bandfreeze prereg)

Per-seed endpoint fields (binding): days, end (survived / village-lost), standing, seatDay, w4 kills, w4 faced, fallen (count; the list is recorded per seed), living at end, pantry, readiness5 veterans.

Per-seed movement (fix tree vs pre tree) is judged on three numeric fields, each with a tolerance so instrument-overlay drift cannot fake a move:
- **standing:** moves DOWN if fix − pre ≤ −6; moves UP if fix − pre ≥ +6; else stable (±5 tolerance).
- **w4 kills:** moves DOWN if fix < pre; UP if fix > pre; else stable.
- **fallen count:** moves UP if fix > pre; DOWN if fix < pre; else stable.

Pair (b) verdicts (direction is read off the data, not pre-defined):
- Per field, the pair direction is the majority sign across the 8 seeds (counting only seeds where that field moves beyond tolerance; a tied field has no direction). A seed **moves with the pair** iff ≥2 of its 3 fields move in their majority direction and none moves opposite.
- **MOVER:** ≥5/8 seeds move with the pair AND 0 seeds move opposite.
- **INERT / EXONERATED:** 0/8 seeds move on ANY field beyond tolerance (all three fields stable on all seeds).
- **MIXED (unjudged):** anything else — report per-seed and per-field.

## Deciding rule per commit (BINDING — what counts as confirmed vs overturned)

**b98ac0730 (bandfreeze: MOVER, 5/8 with, 0 against):**
- **MOVER CONFIRMED (exact):** re-run L3r/L4r judges MOVER under the band rule (≥5/8 with, 0 against) AND all 8 per-seed endpoints are identical to bandfreeze L3/L4.
- **MOVER CONFIRMED (verdict holds, endpoints differ):** re-run judges MOVER but one or more per-seed endpoints differ from bandfreeze — the verdict stands, reproducibility fails on the differing seeds; report the differing seeds in the per-seed table. This is still CONFIRMED, not overturned, and the difference is investigated as instrument drift, not hidden.
- **OVERTURNED:** re-run judges INERT or MIXED — the headline of the run, reported with the per-seed table that shows it, never softened.

**e3ef2b612 (bandfreeze: INERT, 0/8 move, byte-identical daily rows):**
- **INERT CONFIRMED (exact):** re-run L5r/L6r judges INERT (0/8 move on any field) AND daily rows are byte-identical to bandfreeze L5/L6 on all 8 seeds.
- **INERT CONFIRMED (verdict holds, rows differ):** re-run judges INERT but some daily row differs — the verdict stands, exact reproduction fails; report the differing seeds/days.
- **OVERTURNED:** re-run judges MIXED or MOVER — the headline of the run, reported with the per-seed table that shows it, never softened.

**F0r — the frozen baseline on current master (BINDING — the freeze-stability rule for this run):**
- **STABLE:** all 8 seeds reproduce their F0 endpoints exactly on every binding field (standing EXACT — same instrument, determinism premise; no ±5 on a same-instrument re-run; any tolerance use is reported as drift).
- **FREEZE BROKEN (headline finding, not a silent re-freeze):** if ANY seed differs on ANY binding field, the frozen baseline no longer reproduces on current master. Report it with the per-seed table exactly, do NOT re-freeze silently, and do NOT let it change the pair judgments — the pair legs are SHA-pinned extractions and are judged on their own L3r/L4r/L5r/L6r legs regardless. A broken F0r means the frozen reference is stale on current master; the next arm re-freezes explicitly.

## Cost bar (guardrails — scalemetric bar adapted to a DIAG re-confirm)

Bandfreeze leg reference values (computed from the committed corpora before this prereg): median survival L3 95d, L4 115d, L5 72.5d, L6 72.5d; starvation deaths L3 5, L4 4, L5 4, L6 4.

- Per-leg median survival within 20d of its bandfreeze leg median.
- Starvation deaths per leg ≤ bandfreeze leg count + 2.
- A breach is a same-run investigation item (explained vs real drift) BEFORE any verdict is claimed — and since these legs are SHA-pinned reproductions, a breach would itself be evidence of non-determinism or instrument drift, investigated, never silently passed. A GO met with a guardrail breached is NO-GO (§14).

## Legs (band seeds 53011–53018 ONLY; doorwalk baseline leg, 150d death-aware)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments, env `PLENTYDEPRI=1 DEPOSITGATE=1`. Corpus under `evidence/2026-11-09/perseed-pair-b98e3ef-a/`. Leg order is binding.

0. **F0r freeze re-check** — worktree itself (current master `1fc09bbe3`). FIRST. RUN=`pair-b98e3ef-a-freeze`. 8 seeds. Judges whether the frozen baseline reproduces on current master (see deciding rule above).
1. **L3r pre-secret** — `992888172` (`b98ac0730^`), git-archive extraction. RUN=`pair-b98e3ef-a-pre-b98f`. 8 seeds.
2. **L4r secret** — `b98ac0730`, git-archive extraction. RUN=`pair-b98e3ef-a-b98f`. 8 seeds.
3. **L5r pre-place** — `5582c19b9` (`e3ef2b612^`), git-archive extraction. RUN=`pair-b98e3ef-a-pre-e3ef`. 8 seeds.
4. **L6r place** — `e3ef2b612`, git-archive extraction. RUN=`pair-b98e3ef-a-e3ef`. 8 seeds.

## Primary metric + GO threshold (binding)

- **Primary metric:** the per-seed before/after comparison on seeds 53011–53018 (competent-doorwalk baseline policy, 150d death-aware) + the band-rule verdict per pair (L3r vs L4r, L5r vs L6r), plus the F0r freeze-reproduction table.
- **Horizon:** 150d death-aware — reachability lever (waves 4–5, national, table, wins), §10 150–200d guide; matches every prior 53007 leg so the band is comparable to the lead-seed chain.
- **Seeds:** 53011–53018 (exact literals). **Policies:** doorwalk baseline only.
- **GO threshold:** F0r judged (STABLE, or FREEZE BROKEN reported as a headline) AND both pairs judged under the band rule with their confirmed/overturned status stated per the deciding rule above. A MIXED verdict is a judged outcome, not a miss — the GO is that the instrument holds and the pairs are judged, not that any particular verdict repeats.
- **A miss is NO-GO, never re-scored against a friendlier metric mid-run** (§14). If the metric proves wrong, write it under "metric review" and propose the revision for the NEXT run.

## Method

- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch dirs under the worktree (`scratch-pair-<leg>/`, deleted after use — reproducible from `git archive`). NOT new worktrees.
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, and the 11 policy files in the bandfreeze overlay list (`competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`).
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` reads the worktree tip (scratch sits under the worktree, so `git rev-parse HEAD` resolves upward) — the SHA under test is recorded in the evidence file, as bandfreeze did with its anchor quirk.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53011`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires). The smoke is pre-verification, not a judged computation — it proves loading only. The worktree itself is smoke-checked the same way before F0r.
- Driver invocation per leg (from the worktree): `REPO=<scratch> DAYS=150 SEEDS=53011..53018 RUN=<run> OUTDIR=<worktree corpus dir> PLENTYDEPRI=1 DEPOSITGATE=1 node <scratch>/scripts/doorwalk-53007-driver-20261108.js` (F0r runs with REPO unset, i.e. the worktree itself).
- First-divergence day: compare the daily rows between paired corpora per seed (living, pantry, sick, wounded, hungry) and report the first day they differ; also F0r vs F0 per seed (must be none if STABLE). Use the first-row-per-day helper (`rowsEqualOnDays`) for first-divergence reads — the naive helper returns the final day on dead seeds because the closing snapshot duplicates it (bandfreeze artifact, named not hidden).
- Classification rule: the bandfreeze rule, applied mechanically, with `'the arena'` registered as VIOLENT in this arm's classifier (the proof script's classifier), reusing the bandfreeze `classifyCorrected` pattern. The frozen analyzer `scripts/analyze-53007-20261108.js` is overlaid UNCHANGED for comparability — it is not edited. The mechanism label is NOT a binding headline field; both labels are reported.
- Flap protocol: probe-gate EVERY git write; if a probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through the retry approach from bandfreeze (unique temp + rename + read-back verify, bounded EPERM retry) if the flap is active. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Worktree-local safe-commit: copy `scripts/safe-commit.sh` into the worktree first and run THAT copy (it cds to its own dirname's parent — invoking the main-tree path from a worktree commits in the MAIN tree; never do that), then `bash scripts/safe-commit.sh "msg" -- <files>`. Expand directory paths to file lists — safe-commit.sh does NOT accept directory paths. Never bare git commit, never git add.

## GO bars (binding — DIAG-GO requires ALL)

1. F0r judged: 8/8 band seeds run on current master `1fc09bbe3` with full daily corpora + end snapshots — STABLE (exact reproduction) or FREEZE BROKEN reported as a headline with the per-seed table.
2. Both pairs judged against the band rule with confirmed/overturned status per the deciding rule above (L3r vs L4r, L5r vs L6r).
3. Cost bar held on all four pair legs (median within 20d, starvation ≤ bandfreeze + 2) — or the breach is investigated and reported before any verdict is claimed.
4. **G1 det-gate PASS** (proof `scripts/test-pair-b98e3ef-a.js`: determinism/reproduction legs — new corpora read back as their endpoints; band-rule synthetics incl. the ±5 standing boundary; a broken recorder fails the integrity leg).
5. **G3 corpus integrity PASS** on every new corpus in `perseed-pair-b98e3ef-a/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).
6. **G2 recorder neutrality** — not re-run: the recorder is unchanged since bandfreeze proved neutrality on the F0/F0b pair (seed 53011, same master family); this arm reuses that proof and says so. If any new corpus fails G3, STOP and investigate, do not attribute.

## Proof

`scripts/test-pair-b98e3ef-a.js` (det-gate + per-leg reproduction + corpus integrity + band-rule judge, adapted from `scripts/test-bandfreeze-b.js`). The proof must FAIL on a broken recorder (mutated recorder fixture) and PASS on the real one. Real-corpus legs encode the decision as taken. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-pair-b98e3ef-a`.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival — reported in the evidence file even though the doorwalk leg never walks a door (baseline leg: national 0/8, wins 0/8 by design; table sits count, wave-4 unlocks, wave-5 unlocks, median survival across the 8 seeds).

## Sense-test

Read transcripts/dialogue on at least one band seed; judge meaning and coherence, never just counts (mourning beats, table-set → Audit sequence, name rotation, grief-card beats). Quote one telling moment, good or bad.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution re-confirm on recorder corpora, same standing as bandfreeze-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Do NOT edit `sim-findings.md` — findings are listed in the evidence file; the coordinator files them.

## Metric review (pre-registered note)

- The primary metric is the per-seed headline + the band-rule verdict, judged against the decision tree — not a friendlier re-scoring. A MIXED band is reported as unjudged per the rule, never forced into a finger.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (bandfreeze proved byte-identical reproduction on the 8-seed band, F0 vs F0c). The ±5 standing tolerance exists only for instrument-overlay drift between DIFFERENT trees (pre vs fix extractions); on a same-instrument re-run the match is exact, no tolerance. This run tests exactly that premise across a master move.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Bandfreeze text-total discrepancy (found while computing the cost-bar reference values from the committed corpora, before this prereg): the evidence text reports band standing totals L3 1,955 → L4 3,036, but the committed corpora sum to L3 1,884 and L4 2,881; per-seed standing/w4/fallen values in the evidence tables match the corpora exactly, so the text totals appear mis-added. This run's verdicts bind on per-seed with/against counts, not band totals, so the discrepancy cannot change any verdict here; it is flagged for the coordinator to correct in the bandfreeze record, and this run's proof test asserts per-seed values against the bandfreeze tables (not the text totals).
- One metric note carried from bandfreeze: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. It did not affect any judgment there; same here unless the sense-test says otherwise.
