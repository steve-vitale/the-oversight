# sim-e18f-beforeafter-b — prereg (DIAG, zero src/js)

**Arm:** sim-e18f-beforeafter-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1230Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-e18f-beforeafter-b, base master `5e79679e4` (verified: `git log --oneline -1` in the worktree reads `5e79679e4`, and main-tree `git rev-parse master` reads the same SHA). **Prereg committed BEFORE any judged computation.**

## The question

Is commit `e18f72dce` (food.js self-taught specialist rung steepening, +13/−9, journey-establishment r116) the mover of seed 53007's NEW→MIDDLE endpoint step? The endpoint moved on current master: the village that died at 138d on `ba21ca026` (NEW) now survives 150d (MIDDLE, measured on `8419eefa4`), standing 199 (was 100), 1 wave-4 kill (was 0), 10 fallen (was 15). The suspect is the most mechanistically plausible of the three src commits in `ba21ca026`→`8419eefa4` (fightblend-b evidence): the food.js rung change is the kind of change that makes villagers kill more wave-3 monsters (7 vs 4) and survive — but that is a hypothesis, NOT proven. Foundation: `evidence/2026-11-09/sim-fightblend-attrib-b.md` (§ What moved it, suspect SET) + `evidence/2026-11-09/sim-dedupe-beforeafter-b.md` (the before/after METHOD replicated here).

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread); wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08). No canon doc covers seed attribution — the question is answered from measurement, not invented.

## Endpoints actually read (committed corpora, values read directly, not assumed)

- **NEW headline** — fightblend-b corpus `evidence/2026-11-09/perseed-fightblend-53007-b/doorwalk-53007-a-s53007-fightblend-53007-b-current.json` (master `ba21ca026`): 138d, gameDays 138, village-lost, standing **100**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **92**, wave-4 kills **0**, wave-4 faced 8 (finalSeat.detail.w4), fallen **15**, living 2, pantry 0 kcal, readiness5 armored 1/4, armed 2/6, tricks 24/3, veterans 0/2, short [armor, weapons, veterans]. 137 daily rows, 0 instrument errors.
- **MIDDLE headline** — fightblend-attrib-b corpus `evidence/2026-11-09/perseed-fightblend-attrib-b/doorwalk-53007-a-s53007-fightblend-attrib-b-current.json` (master `8419eefa4`): 150d, gameDays 151, survived, standing **199**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **90**, wave-4 kills **1** (congregation d82, by gen_lcfmcgv, via companion), wave-4 faced 2, fallen **10**, living 9, pantry 9,302 kcal, readiness5 armored 6/4, armed 9/6, tricks 26/3, veterans 1/2, short [veterans]. 149 daily rows, 0 instrument errors.

## The suspect, in plain words

`e18f72dce` changes the self-taught specialist ladder in `src/js/food.js`: a villager with no occupation skill in a food task learns by doing it. Before: 5 XP buys skill 1, then +1 skill per further 5 XP (10 → 2, 15 → 3, cap 3). After: 5 XP still buys skill 1, but journeyman takes real work (15 → 2) and mastery takes a full season (30 → 3, cap 3). It SLOWS self-taught progression to skills 2 and 3 — it does not touch the first rung, and it does not touch occupation holders (they keep their +1 at 5 XP). The change is a pure function of XP (no RNG draws added or removed), so any divergence comes from changed skill state feeding later decisions, not from RNG consumption — same class as the dedupe finger. The direction of its effect on this seed is NOT predicted: slower mastery could plausibly help or hurt survival, and the before/after is the test.

## Ancestry + diff facts (verified from git before this prereg, not assumed)

- `e18f72dce` = "journey-establishment r116: steepen self-taught specialist rung 5/15/30 (pace dial 2; proof 57/57 on fixed tree)". Its parent `e18f72dce^` = `e75aa5813` ("journey-establishment r116: before-panel (16 seeds x 42d, unfixed engine)") — parentage verified with `git log --oneline -1 e18f72dce^`.
- `ba21ca026` IS an ancestor of `e18f72dce^` (verified with `git merge-base --is-ancestor`).
- `ba21ca026`→`e18f72dce^` src diff: **exactly one commit, `e3ef2b612`** (villager-agency.js place-line fix, +14/−1). L0's `src/` is NEW's `src/` PLUS `e3ef2b612` — L0 may NOT reproduce NEW exactly, and that is a known in-range confound, not endpoint movement. The L0 branch of the decision tree handles it.
- `e18f72dce^`→`e18f72dce` src diff: **only `src/js/food.js`, +13/−9**. L0→L1 differs in exactly one src file, so a L0=NEW + L1=MIDDLE split fingers the rung with no other src confound.
- `e18f72dce`→`8419eefa4` src diff: **exactly one commit, `b98ac0730`** (conversation.js secret-response fix). L1's `src/` is MIDDLE's `src/` MINUS `b98ac0730` — L1 reproducing MIDDLE exactly requires `b98ac0730` to be inert on this seed. That is a KNOWN confound on the FINGERED bar, named here before any leg runs: if L1 reads a shape between NEW and MIDDLE, it is reported exactly as partial movement, never forced into FINGERED.
- `ba21ca026`→`8419eefa4` src diff: **exactly the three commits** (`b98ac0730`, `e18f72dce`, `e3ef2b612`) — confirms the fightblend evidence's "only three src commits in range" claim from git, not from memory.
- Instrument drift `8419eefa4`→`5e79679e4`: `git diff --stat` over the frozen instrument set shows **zero changes** (the only `scripts/` changes in range are test files: test-dedupe-beforeafter-b.js, test-fightblend-attrib-b.js, test-feast-tooltip-once-r162.js, test-journey-scale-r122-walkto-20261109.js). The frozen current-tip instruments are identical to the instruments that produced NEW and MIDDLE.

## Classifier: 'the arena' registered (backlog gap, this arm)

The 53007-a classifier's VIOLENT map keys `'arena'` but the game emits the cause string `'the arena'` — arena deaths sit in OTHER and the mechanism label undercounts violent deaths (fightblend-b, dedupe-b). This arm registers `'the arena'` as a VIOLENT key in ITS OWN analyzer (the proof script's classifier, `scripts/test-e18f-beforeafter-b.js`). The frozen analyzer `scripts/analyze-53007-20261108.js` is overlaid UNCHANGED for comparability — it is not edited. Consequence, stated before any leg runs: under the corrected rule NEW reads **combat-led** (10/15 violent: monster 1, contest 1, wild 3, stranger 2, arena 3) where the frozen rule reads mixed/other, while MIDDLE stays **mixed/other** under both rules (4/10 corrected, 3/10 frozen). The mechanism label is therefore NOT a binding headline-match field in this arm (the rule changed by instruction, so it cannot match labels computed under the old rule) — it is reported under the corrected rule with the frozen-rule label alongside. Binding headline fields: days, endReason/villageLost, standing (±5), seatDay, w4 kills, fallen (exact).

## Legs (seed 53007 ONLY, no band spend)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). One seed only. Corpus under `evidence/2026-11-09/perseed-e18f-beforeafter-b/`.

1. **L0 pre-rung** — `e18f72dce^` = `e75aa5813`, git-archive extraction. RUN=`e18f-beforeafter-b-pre`.
2. **L1 rung** — `e18f72dce`, git-archive extraction. RUN=`e18f-beforeafter-b-e18f`.
3. **L0 unrecorded control** — same as L0 with `DIAG_RECORDER=0`, RUN=`e18f-beforeafter-b-pre-unrec`, for the G2 neutrality bar (one leg only, per the task brief).

## Decision tree (binding) + STOP rule

Headline fields (binding): days, endReason/villageLost, standing (±5 — instrument-overlay drift only, any use reported as drift), seatDay, w4 kills, fallen (exact). NEW = 138d, village-lost, standing 100, seatDay 92, 0 w4 kills, fallen 15. MIDDLE = 150d, survived, standing 199, seatDay 90, 1 w4 kill, fallen 10.

- **STOP (endpoint-moved-again):** if L0 reads NEITHER NEW nor MIDDLE (a third shape), STOP and report L0's actual headline exactly; do NOT run L1 as a judged leg. Both reference endpoints are gone, so L1 movement has no defined target. (Reconciliation note: the task brief's "if L0 does NOT reproduce NEW, report L0 and judge L1 movement" applies to the L0=MIDDLE branch below, where the step's endpoints still bound the judgment; a third shape has no bound, so the stop rule fires there. The stop rule and the movement-judgment instruction do not overlap.)
- **L0 = MIDDLE branch:** the NEW→MIDDLE step is already complete BEFORE `e18f72dce` — `e18f72dce` cannot be its mover. Run L1 anyway as a judged leg: L1=MIDDLE → `e18f72dce` is inert on this seed and the L0 result implicates `e3ef2b612` (the only diff between NEW and L0) as the step's mover by the same before/after logic — filed as a finding for the coordinator, NOT claimed as this arm's verdict (this arm's verdict on `e18f72dce` is EXONERATED-as-mover). L1≠MIDDLE → report L1 exactly (`e18f72dce` moves the endpoint away from MIDDLE).
- **GO (e18f72dce FINGERED):** iff L0 reproduces NEW exactly AND L1 reproduces MIDDLE exactly. All binding fields must match within the stated tolerances.
- **EXONERATED:** if L0 reproduces NEW and L1 also reproduces NEW (no movement). Next suspect for the step is then `b98ac0730` (the only remaining in-range src commit — `e3ef2b612` would already be shown inert by L0=NEW).
- **PARTIAL MOVEMENT (unjudged):** if L0 reproduces NEW and L1 reads neither NEW nor MIDDLE, report L1's full headline exactly with a field-by-field table against NEW and MIDDLE and describe the direction per field in plain words. NO summary verdict word (never "partially fingered", never forced into either headline).
- **MIDDLE SHAPE:** any leg matching neither headline is reported as an unjudged middle shape with its full headline, never forced into either verdict.
- **Instrument STOP:** if the L0 unrecorded control fails to match L0 (G2 fail) or any new corpus fails G3, STOP, investigate, do not attribute.

## Method

- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch dirs under the worktree (`scratch-e18f-<leg>/`, deleted after use — reproducible from `git archive`). NOT new worktrees.
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, and the 11 policy files in the dedupe overlay list (`competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`). (The task brief's "12 policy files" counts one extra — the require closure is verified by the 2-day smoke, not by the count; the 11 above are the full transitive closure of the driver.)
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` will read the worktree tip (scratch sits under the worktree, so `git rev-parse HEAD` resolves upward) — the SHA under test is recorded in the evidence file, as 53007-a/bisect-b/fightblend-b/dedupe-b did with their anchor quirks.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53007`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires). The smoke is pre-verification, not a judged computation — it proves loading only.
- Driver invocation per leg (from the worktree): `REPO=<scratch> DAYS=150 SEEDS=53007 RUN=<run> OUTDIR=<worktree corpus dir> node <scratch>/scripts/doorwalk-53007-driver-20261108.js` (DIAG_RECORDER=0 for the unrecorded control only).
- First-divergence day: compare the daily rows between the L0 and L1 corpora (living, pantry, sick, wounded, hungry) and report the first day they differ; fightblend-b saw d17 (pantry only) between NEW and MIDDLE — confirm or correct it against the L0/L1 pair.
- Classification rule: the 53007-a prereg rule, applied mechanically, with `'the arena'` registered as VIOLENT in this arm's classifier (see § Classifier above). The frozen analyzer's label is reported alongside, never silently substituted. `deathSays` catches "deadfall" (known instrument quirk; does not affect any judgment).
- Flap protocol: probe-gate EVERY git write; if a probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through a retry preload if needed (wrap `fs.writeFileSync` with bounded EPERM retry + read-back verify, unique temp name + rename), following the bisect-b/fightblend-b/dedupe-b pattern — the corpus write is retried, nothing else changes. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Worktree-local safe-commit: `scripts/safe-commit.sh` is already present in the worktree (it cds to its own dirname's parent — invoking the main-tree path from a worktree commits in the MAIN tree; never do that), then `bash scripts/safe-commit.sh "msg" -- <files>`. Never bare git commit, never git add.

## GO bars (binding — DIAG-GO requires ALL)

1. L0 pre-rung reproduces the NEW headline — or a decision-tree branch / stop rule above fires and the run ends there, reported honestly.
2. Each judged leg produces a full daily corpus with an end snapshot (rows span d2..`gameDays`, diag on every row, 0 instrument errors) — the G3 shape as revised by 53007-a Amendments 1–2.
3. The leg headlines are judged against the decision tree above (NEW or MIDDLE, no middle shape forced).
4. **G1 det-gate PASS** (proof `scripts/test-e18f-beforeafter-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their headlines; headline-predicate synthetics for NEW/MIDDLE + the ±5 standing boundary; a broken recorder fails the integrity leg; a broken classifier fails the fixture leg; the `'the arena'` registration is itself a tested leg).
5. **G2 recorder neutrality PASS** on the L0 pair (armed == unrecorded, same leg tree `e75aa5813` — identical headline + trajectory).
6. **G3 corpus integrity PASS** on every new corpus in `perseed-e18f-beforeafter-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).

## Proof

`scripts/test-e18f-beforeafter-b.js` (det-gate + per-leg reproduction + neutrality + corpus integrity + `'the arena'` classifier registration). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-e18f-beforeafter-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution on a recorder corpus, same standing as 53007-a/bisect-b/fightblend-b/dedupe-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced). Record that honestly.
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Do NOT edit `sim-findings.md` — findings are listed in the evidence file; the coordinator files them.

## Metric review (pre-registered note)

- The primary metric is the per-leg headline (survival + sit day + standing + w4 kills + fallen), judged against the decision tree — not a friendlier re-scoring. A middle shape is reported as unjudged, never forced.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor; dedupe-b proved it twice over on two different trees). The ±5 standing tolerance exists only for instrument-overlay drift; if invoked, the drift is named in the evidence file.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read, unaffected by the sitmetric instrument change — d90 vs d92 is a game difference, judged as written.
- Wave-4 kills AND faced are reported on every leg (kills from `waveKillLog`, faced from `finalSeat`/wavesFaced) — the winnability chain's binding link, not just the survival.
- The mechanism label is deliberately NOT a binding match field this arm: the classifier rule changed by instruction (`'the arena'` registered), so a label match against NEW/MIDDLE's frozen-rule labels would compare two different rules. Both labels are reported.
