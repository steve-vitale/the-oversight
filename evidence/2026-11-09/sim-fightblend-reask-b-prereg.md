# sim-fightblend-reask-b — prereg (DIAG, zero src/js)

**Arm:** sim-fightblend-reask-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1739Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-fightblend-reask-b, base master `0fcff01ea` (verified: worktree `git log --oneline -1` reads `0fcff01ea`; worktree tree clean, 0 untracked). **Prereg committed BEFORE any judged computation.**

## The question

Re-ask the fightblend attribution a fourth time — this time against the MIDDLE headline as the current-master endpoint. The 1030Z arm (`evidence/2026-11-09/sim-fightblend-attrib-b.md`) STOPPED at endpoint-moved-again: on master `8419eefa4` seed 53007 no longer died at 138d (NEW) — it survived 150d, standing 199, 1 wave-4 kill (MIDDLE). Since then the dedupe arm fingered `f496b0072` for MOVED→NEW and the e18f arm exonerated `e18f72dce` for NEW→MIDDLE (its L1 rung authored only the d17–d20 opening, then re-converged to NEW). Remaining untested in-range src commits for NEW→MIDDLE: `b98ac0730` (conversation.js secret-response) and `e3ef2b612` (villager-agency.js place-line, shown inert only indirectly by the e18f L0 read). Master has moved again since MIDDLE (`8419eefa4` → `0fcff01ea`, four new src commits), so L0 re-verifies MIDDLE on `0fcff01ea` first; only if MIDDLE reproduces does the attribution on `b98ac0730` / `e3ef2b612` run. If the endpoint moved a fourth time, this arm STOPS per the task brief, retires the single-seed attribution route, and specifies the frozen-band seed set that replaces it.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread); wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08). No canon doc covers seed attribution — the question is answered from measurement, not invented.

## Endpoints actually read (committed corpora, values read directly, not assumed)

- **MIDDLE headline** — fightblend-attrib-b corpus `evidence/2026-11-09/perseed-fightblend-attrib-b/doorwalk-53007-a-s53007-fightblend-attrib-b-current.json` (master `8419eefa4`, read directly from the file this run): 150d, gameDays 151, survived, standing **199**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **90**, wave-4 kills **1** (congregation d82, by gen_lcfmcgv, via companion), wave-4 faced 2 (finalSeat.detail.w4), fallen **10** (Luz d31 the arena, Rafael d40 monster/Spool, Se-ri d40 sickness, Stan d44 sickness, Riley d54 a wound that wouldn't close, Luke d60 contest, Elena d75 combat, Hannah d79 sickness, Riana d80 thirst, Benoit d83 a wound that wouldn't close), living 9 at end, pantry 9,302 kcal, readiness5 armored 6/4, armed 9/6, tricks 26/3, veterans 1/2, short [veterans]. 149 daily rows, 0 instrument errors.
- **NEW headline** — e18f-beforeafter-b L0 corpus `evidence/2026-11-09/perseed-e18f-beforeafter-b/doorwalk-53007-a-s53007-e18f-beforeafter-b-pre.json` (leg tree `e75aa5813`, read directly from the file this run): 138d, gameDays 138, village-lost, standing **100**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **92**, wave-4 kills **0**, wave-4 faced 8, fallen **15**, living 2, pantry 0 kcal, readiness5 armored 1/4, armed 2/6, tricks 24/3, veterans 0/2, short [armor, weapons, veterans]. 137 daily rows, 0 instrument errors. The L1 rung corpus reads NEW on every binding field (e18f evidence).

## The suspects, in plain words

- `b98ac0730` (conversation.js secret-response fix, +97/−3, journey-deepening r120): a villager's confession now gets an answer instead of the conversation dead-ending. Same class as the fingered dedupe (`f496b0072`): un-blocking a conversation branch re-routes the seeded stream from the first affected conversation onward. The only untested in-range src commit for NEW→MIDDLE — the prime suspect.
- `e3ef2b612` (villager-agency.js place-line fix, +14/−1, journey succession r161): a dry place-share line now speaks (`diegeticAct` on place share). Shown inert only indirectly: the e18f arm's L0 tree included it and still reproduced NEW byte-identically. This arm tests it directly, one commit at a time.

## Ancestry + diff facts (verified from git before this prereg, not assumed)

- `b98ac0730` = "journey-deepening r120: secret-response fix". Its parent `b98ac0730^` = `992888172` ("journey-deepening r120: Amendment 1 — panel expands to 8 seeds"). `ba21ca026` is an ancestor of `b98ac0730^`.
- `b98ac0730^`→`b98ac0730` src diff: **only `src/js/conversation.js`, +97/−3**. No `src/data/` change.
- `ba21ca026`→`b98ac0730^` src diff: **exactly `src/js/food.js` +22 and `src/js/villager-agency.js` +15** — i.e. the rung + the place-line, no secret-response. `b98ac0730^` src == `e18f72dce` src (verified: `git diff --stat e18f72dce b98ac0730^ -- src/` is empty), and the e18f L1 rung tree (that src) read NEW on every binding field — so L1 is expected to read NEW on a solid basis, not a guess.
- `b98ac0730`→`8419eefa4` src diff: **empty** — `b98ac0730` src == `8419eefa4` src, so L2 is expected to read MIDDLE exactly (the 8419eefa4 headline), not approximately.
- `e3ef2b612` = "journey succession r161: fix agency place-line dry". Its parent `e3ef2b612^` = `5582c19b9` ("sim-poolcapture-bar-a: pool-capture bar re-registration + episode-join cure fix"). `ba21ca026` is an ancestor of `e3ef2b612^`.
- `e3ef2b612^`→`e3ef2b612` src diff: **only `src/js/villager-agency.js`, +14/−1**. No `src/data/` change.
- `ba21ca026`→`e3ef2b612^` src diff: **empty** — `e3ef2b612^` src == `ba21ca026` src (the NEW tree), so L3 is expected to read NEW exactly.
- `ba21ca026`→`e3ef2b612` src diff: **only `src/js/villager-agency.js`, +14/−1** — L3→L4 differs in exactly one src file, so a L3=NEW + L4=MIDDLE split fingers the place-line with no other src confound, and a L3=NEW + L4=NEW split exonerates it directly.
- `ba21ca026`→`8419eefa4` src diff: **exactly the three commits** (`b98ac0730`, `e18f72dce`, `e3ef2b612`) — re-confirmed from git, not from memory.
- Instrument drift `8419eefa4`→`0fcff01ea`: `git diff --stat` over the frozen instrument set shows **zero changes** (driver, recorder, analyzer, sim-harness, sitstep/stageally/bankkiller instruments, all 11 policy files). The frozen current-tip instruments are identical to the instruments that produced MIDDLE.
- Range `8419eefa4`→`0fcff01ea` (the move since the MIDDLE headline): 41 commits, **4 src commits, 4 files, no `src/data/` change**:
  - `5e190b6ef` journey-social-life r163: `src/js/truth.js` +17/−1 (coach prior-deflect no-repeat fix).
  - `48c93b22b` sim-wideduty-a: `src/js/game.js` +66/−20 (widen the medic duty to trained villagers).
  - `ae7daf40c` journey-landing r121: `src/js/convo-wants.js` +16 (curious first-reveal guard).
  - `1cc46630c` journey-endgame r162: `src/js/progression.js` +21/−2 (feast tooltip once per keepsake).
  Any of the four can move the endpoint again; L0 re-verification is what finds out. If L0 reproduces MIDDLE, all four are shown inert on this seed by that reproduction itself.

## Classifier: 'the arena' registered (backlog gap, this arm — as e18f did)

The 53007-a classifier's VIOLENT map keys `'arena'` but the game emits the cause string `'the arena'` — arena deaths sit in OTHER and the mechanism label undercounts violent deaths (fightblend-b, dedupe-b). This arm registers `'the arena'` as a VIOLENT key in ITS OWN classifier (the proof script's classifier, `scripts/test-fightblend-reask-b.js`), reusing the prefloor `classifyCause` pattern where it fits and registering the exact emitted string. The frozen analyzer `scripts/analyze-53007-20261108.js` is overlaid UNCHANGED for comparability — it is not edited. Consequence, stated before any leg runs: under the corrected rule NEW reads **combat-led** (10/15 violent: monster 1, contest 1, wild 3, stranger 2, arena 3) where the frozen rule reads mixed/other, while MIDDLE stays **mixed/other** under both rules (4/10 corrected, 3/10 frozen). The mechanism label is therefore NOT a binding headline-match field in this arm (the rule changed by instruction, so it cannot match labels computed under the old rule) — it is reported under the corrected rule with the frozen-rule label alongside. Binding headline fields: days, endReason/villageLost, standing (±5), seatDay, w4 kills, fallen (exact).

## Legs (seed 53007 ONLY, no band spend)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). One seed only. Corpus under `evidence/2026-11-09/perseed-fightblend-reask-b/`.

0. **L0 current** — worktree itself (master `0fcff01ea`). FIRST. RUN=`fightblend-reask-b-current`.
0b. **L0 unrecorded control** — same as L0 with `DIAG_RECORDER=0`, RUN=`fightblend-reask-b-current-unrec`, for the G2 neutrality bar (one leg only).
1. **L1 pre-secret** — `b98ac0730^` = `992888172`, git-archive extraction. RUN=`fightblend-reask-b-pre-b98f`. Only if L0 reproduces MIDDLE.
2. **L2 secret** — `b98ac0730`, git-archive extraction. RUN=`fightblend-reask-b-b98f`. Only if L0 reproduces MIDDLE.
3. **L3 pre-place** — `e3ef2b612^` = `5582c19b9`, git-archive extraction. RUN=`fightblend-reask-b-pre-e3ef`. Only if L0 reproduces MIDDLE.
4. **L4 place** — `e3ef2b612`, git-archive extraction. RUN=`fightblend-reask-b-e3ef`. Only if L0 reproduces MIDDLE.

## Decision tree (binding) + STOP rule

Headline fields (binding): days, endReason/villageLost, standing (±5 — instrument-overlay drift only, any use reported as drift), seatDay, w4 kills, fallen (exact). MIDDLE = 150d, survived, standing 199, seatDay 90, 1 w4 kill, fallen 10. NEW = 138d, village-lost, standing 100, seatDay 92, 0 w4 kills, fallen 15.

- **STOP (endpoint-moved-again):** if L0 reads NEITHER MIDDLE nor NEW — or reads NEW — STOP and report DIAG-STOP (endpoint-moved-again) with L0's full headline exactly; do NOT run L1–L4 as judged legs. Rationale, stated before any leg runs: NEW as L0 would mean the current master has reverted to the pre-MIDDLE endpoint, so MIDDLE is not the current endpoint and the NEW→MIDDLE attribution has no current-master anchor; any other shape is a fourth/fifth headline with no bound. Either way the single-seed route is retired (see § Frozen band, below) and the evidence lands as record.
- **REPRODUCED:** iff L0 reads MIDDLE exactly on all binding fields. The attribution proceeds (L1–L4).
- **b98f pair — GO (b98ac0730 FINGERED):** iff L1 reproduces NEW exactly AND L2 reproduces MIDDLE exactly. All binding fields must match within the stated tolerances.
- **b98f pair — EXONERATED (as single mover):** if L1 reproduces NEW and L2 also reproduces NEW (no movement). Next suspect for the step is then the rung+secret-response interaction (the rung authors the d17–d20 MIDDLE opening; the secret-response is the only remaining single commit) — named as the next arm, NOT tested here (this arm tests one commit at a time, per the brief).
- **b98f pair — L1=MIDDLE branch:** the NEW→MIDDLE step is already complete BEFORE `b98ac0730` — it cannot be its mover. Run L2 anyway as a judged leg: L2=MIDDLE → `b98ac0730` is inert on this seed and the L1 result implicates the rung+e3ef combination (the only diff between NEW and L1) — filed as a finding, NOT claimed as this arm's verdict. L2≠MIDDLE → report L2 exactly (b98f moves the endpoint away from MIDDLE).
- **b98f pair — L1 third shape:** STOP that pair's judgment, report L1 exactly, do NOT run L2 as a judged leg (L2 would have no bound). The e3ef pair still runs (its own L3 anchors it).
- **e3ef pair — GO (e3ef2b612 FINGERED):** iff L3 reproduces NEW exactly AND L4 reproduces MIDDLE exactly. (This outcome would CONTRADICT the e18f arm's indirect read — its L0 included `e3ef2b612` and reproduced NEW byte-identically on the same src. A FINGERED verdict here is reported with the contradiction named explicitly and the e18f L0 exactness re-examined in the evidence file; the verdict is not forced either way by the contradiction alone.)
- **e3ef pair — EXONERATED (direct):** if L3 reproduces NEW and L4 also reproduces NEW (no movement). This confirms the e18f indirect read directly.
- **e3ef pair — L3≠NEW:** STOP that pair's judgment, report L3 exactly, do NOT run L4 as a judged leg.
- **PARTIAL MOVEMENT (unjudged):** if a leg reads neither NEW nor MIDDLE, report its full headline exactly with a field-by-field table against NEW and MIDDLE and describe the direction per field in plain words. NO summary verdict word (never "partially fingered", never forced into either headline).
- **Instrument STOP:** if the L0 unrecorded control fails to match L0 (G2 fail) or any new corpus fails G3, STOP, investigate, do not attribute.

## Method

- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch dirs under the worktree (`scratch-fightblend-reask-<leg>/`, deleted after use — reproducible from `git archive`). NOT new worktrees.
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, and the 11 policy files in the dedupe/e18f overlay list (`competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`). (The 11 are the full transitive require closure, verified by the 2-day smoke, not by the count.)
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` will read the worktree tip (scratch sits under the worktree, so `git rev-parse HEAD` resolves upward) — the SHA under test is recorded in the evidence file, as 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b did with their anchor quirks.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53007`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires). The smoke is pre-verification, not a judged computation — it proves loading only.
- Driver invocation per leg (from the worktree): `REPO=<scratch> DAYS=150 SEEDS=53007 RUN=<run> OUTDIR=<worktree corpus dir> node <scratch>/scripts/doorwalk-53007-driver-20261108.js` (DIAG_RECORDER=0 for the unrecorded control only; L0 runs with REPO unset, i.e. the worktree itself).
- First-divergence day: compare the daily rows between the paired corpora (living, pantry, sick, wounded, hungry) and report the first day they differ; also L0 vs the committed MIDDLE corpus (fightblend-b saw d17 pantry-only between NEW and MIDDLE — confirm or correct it against L0/MIDDLE).
- Classification rule: the 53007-a prereg rule, applied mechanically, with `'the arena'` registered as VIOLENT in this arm's classifier (see § Classifier above). The frozen analyzer's label is reported alongside, never silently substituted. `deathSays` catches "deadfall" (known instrument quirk; does not affect any judgment).
- Flap protocol: probe-gate EVERY git write; if a probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through a retry preload if needed (wrap `fs.writeFileSync` with bounded EPERM retry + read-back verify, unique temp name + rename), following the bisect-b/fightblend-b/dedupe-b pattern — the corpus write is retried, nothing else changes. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Worktree-local safe-commit: `scripts/safe-commit.sh` is already present in the worktree (it cds to its own dirname's parent — invoking the main-tree path from a worktree commits in the MAIN tree; never do that), then `bash scripts/safe-commit.sh "msg" -- <files>`. Never bare git commit, never git add.

## Frozen band (STOP branch only — pre-registered, not invented after the outcome)

If the STOP rule fires, the single-seed attribution route is RETIRED: seed 53007's endpoint has now moved on four consecutive current-master re-verifications (OLD→MOVED→NEW→MIDDLE→?), and a fifth re-ask on the same seed is not an instrument. The replacement instrument is a frozen 8-seed band:

- **Band: 53011–53018** (8 seeds). Why these: 8 seeds is the pilot-gate size (§9); they sit adjacent to the 53001–53008 doorwalk family, so the same driver/policy/substrate applies unchanged; and they are verified unused (see freshness check below).
- **Freshness check (done before this prereg, per `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):** searched all 677 files matching `evidence/*/sim-*-prereg.md`, all `evidence/**/*.md`, `scripts/*.js`, and per-seed corpus filenames for `53011`–`53018` — zero hits. Collisions found and avoided: `53101–53108` (used by a leadfeast arm — s53104/s53106/s53107 in evidence), `53201–53212` (doorwalk confirm band, named in `evidence/2026-11-07/sim-doorwalk-b-prereg.md` and `evidence/2026-11-07/sim-combatdiv-b.md`), `53701–53712` (named alongside 53201–53212 in the reservation context). No forbidden-band list file was found in `evidence/` (the grep for "forbidden band / contaminated band" returned no list file); the prereg + evidence-md search is the recorded scope.
- **What the next run measures:** each seed's current-master endpoint on the doorwalk baseline leg (150d death-aware, same driver/recorder), recorded per seed as the frozen reference (days, end, standing, seatDay, w4 kills, fallen). The freeze master is whatever master that run re-verifies on, stated in its prereg.
- **Proposed band rule (the next run's prereg binds the final rule):** a commit fingers only if it moves the endpoint the same direction on a majority of the band with no seed moving the opposite direction; a single-seed move is a trajectory note, never a finger. The band is re-frozen (endpoints re-measured) whenever master moves under it, never assumed stable.

## GO bars (binding — DIAG-GO requires ALL)

1. L0 current-master re-verification reproduces the MIDDLE headline — or the STOP rule above fires and the run ends there, reported honestly.
2. Each judged leg produces a full daily corpus with an end snapshot (rows span d2..`gameDays`, diag on every row, 0 instrument errors) — the G3 shape as revised by 53007-a Amendments 1–2.
3. The leg headlines are judged against the decision tree above (NEW or MIDDLE, no middle shape forced).
4. **G1 det-gate PASS** (proof `scripts/test-fightblend-reask-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their headlines; headline-predicate synthetics for NEW/MIDDLE + the ±5 standing boundary; a broken recorder fails the integrity leg; a broken classifier fails the fixture leg; the `'the arena'` registration is itself a tested leg).
5. **G2 recorder neutrality PASS** on the L0 pair (armed == unrecorded, same master `0fcff01ea` — identical headline + trajectory).
6. **G3 corpus integrity PASS** on every new corpus in `perseed-fightblend-reask-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).

## Proof

`scripts/test-fightblend-reask-b.js` (det-gate + per-leg reproduction + neutrality + corpus integrity + `'the arena'` classifier registration, adapted from `scripts/test-e18f-beforeafter-b.js`). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Real-corpus legs encode the decision as taken (STOP legs SKIP when the attribution never ran, per the fightblend-attrib-b pattern). Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-fightblend-reask-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No fresh band spend this run: seed 53007 is the lead seed BY DESIGN (paired before/after). The frozen band above is SPECIFIED on the STOP branch only — it is not measured this run.
- No landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution on a recorder corpus, same standing as 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced). Record that honestly.
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Do NOT edit `sim-findings.md` — findings are listed in the evidence file; the coordinator files them.

## Metric review (pre-registered note)

- The primary metric is the per-leg headline (survival + sit day + standing + w4 kills + fallen), judged against the decision tree — not a friendlier re-scoring. A middle shape is reported as unjudged, never forced.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor; dedupe-b proved it twice over on two different trees; e18f-b a third time). The ±5 standing tolerance exists only for instrument-overlay drift; if invoked, the drift is named in the evidence file.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read — d90 vs d92 is a game difference, judged as written.
- Wave-4 kills AND faced are reported on every leg (kills from `waveKillLog`, faced from `finalSeat`/wavesFaced) — the winnability chain's binding link, not just the survival.
- The mechanism label is deliberately NOT a binding match field this arm: the classifier rule changed by instruction (`'the arena'` registered), so a label match against NEW/MIDDLE's frozen-rule labels would compare two different rules. Both labels are reported.
- One metric note carried from 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.
