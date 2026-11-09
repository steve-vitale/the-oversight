# sim-fightblend-attrib-b — prereg (DIAG, zero src/js)

**Arm:** sim-fightblend-attrib-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1030Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-fightblend-attrib-b, base master `8419eefa4` (current master at spawn; rebased onto the explicit SHA before this commit — branch tip was an ancestor of `8419eefa4`, fast-forward, no conflicts). **Prereg committed BEFORE any judged computation.**

## The question

Re-ask the fightblend attribution against the NEW 53007 headline. The 0630Z arm (`evidence/2026-11-09/sim-fightblend-53007-b.md`, prereg `evidence/2026-11-09/sim-fightblend-53007-b-prereg.md`) STOPPED at endpoint-moved-again and never ran the attribution: on master `ba21ca026` seed 53007 died at 138d, village-lost, standing 100, 0 wave-4 kills — a third headline (NEW) after OLD (150d, 584, 5 w4 kills) and MOVED (150d, 199, 2 w4 kills). Master has moved again since (`ba21ca026` → `8419eefa4`, journey-scale r113 src changes landed), so L0 re-verifies NEW on `8419eefa4` first; only if NEW reproduces does the attribution (L1 pre, L2 fix) run. This prereg's decision tree is the same shape as the 0630Z prereg, with NEW as the L0 target.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread), wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08) — the fight judgment under test decides blow-by-blow fights, never an outcome table. Readiness bars (armored/armed/tricks/veterans) gate the standing unlock. No canon doc covers seed attribution — the question is answered from measurement, not invented.

## Endpoints actually read (committed corpora, values read directly, not assumed)

- **OLD headline** — 53007-a corpus `evidence/2026-11-08/perseed-53007-a/doorwalk-53007-a-s53007-doorwalk-baseline.json` (master `6680d7924`, old instrument): 150d, gameDays 150, survived, standing **584**, maxWave **5**, unlocked 5, finalSeat lesser, takeseatStats seatDay **95**, wave-4 kills **5**, fallen **4** (Rafael d16 sickness, Luz d39 the wild, Katarina d68 sickness, Luke d147 the wild), mechanism sickness-first per the 53007-a rule.
- **MOVED headline** — bisect-b corpus `evidence/2026-11-08/perseed-53007-bisect-b/doorwalk-53007-a-s53007-doorwalk-baseline.json` (master `55b5e5aae`, new instrument): 150d, gameDays 151, survived, standing **199**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **90**, wave-4 kills **2**, fallen **9** (Rafael d16 sickness, Luz d57, Luke d75, Klaus d77, Se-ri d80, Stan d81, Katarina d84 thirst, Riley d85, Elena d87 — all but two 'the wild'), mechanism combat-led (7/9 violent).
- **NEW headline** — 0630Z corpus `evidence/2026-11-09/perseed-fightblend-53007-b/doorwalk-53007-a-s53007-fightblend-53007-b-current.json` (master `ba21ca026`, anchor `91f749b16`, read directly from the file this run): 138d, gameDays 138, **village-lost**, standing **100**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **92**, wave-4 kills **0** (no w≥4 entry in waveKillLog), wave-4 faced **8** types (eulogy, congregation, influencer, reunion, strike, eater, herald, suburb), fallen **15** (Luz d31 the arena, Rafael d40 monster/Spool, Se-ri d40 sickness, Stan d44 sickness, Riley d52 sickness, Diego d56 sickness, Luke d61 contest, Klaus d62 the wild, Elena d62 a stranger, Katarina d63 sickness, Boris d67 the wild, Omar d76 the wild, Hannah d98 the arena, Eleazar d125 a stranger, Wanjiru d130 the arena), mechanism mixed/other by the frozen classifier (`'the arena'` ×3 unmapped — see Classifier note), living 2 at end, pantry 0 kcal (0 food-days).

## Ancestry + diff facts (verified from git before this prereg, not assumed)

- `93e7bea26` is an ancestor of `8419eefa4` and of `3f405ff78`. `3f405ff78` is NOT an ancestor of `8419eefa4` (branch tip; the landed form is `ecf3ff60d`, which IS an ancestor of `8419eefa4`).
- pre→fix src diff (`93e7bea26` → `3f405ff78`): **only `src/js/fieldFights.js`, +47/−4** — the fix leg differs from the pre leg in exactly one file, so a pre=OLD + fix=MOVED split fingers fightblend with no other src confound. (Unchanged from the 0630Z prereg.)
- pre→current src diff (`93e7bea26` → `8419eefa4`): **4 files** — `src/js/conversation.js` +122, `src/js/fieldFights.js` +51, `src/js/food.js` +22, `src/js/villager-agency.js` +15 (191 insertions, 19 deletions). No `src/data/` change.
- fix→current src diff (`3f405ff78` → `8419eefa4`): **3 files** — `src/js/conversation.js`, `src/js/food.js`, `src/js/villager-agency.js` (144 insertions, 15 deletions). `fieldFights.js` at `3f405ff78` is byte-identical to `8419eefa4` and to `ecf3ff60d`.
- `ba21ca026`→`8419eefa4` src diff (the move since the NEW headline): **3 files, 3 commits** — `src/js/conversation.js` +100 (`b98ac0730`, journey-deepening r120: secret-response fix — a villager's confession now gets an answer), `src/js/food.js` +22 (`e18f72dce`, journey-establishment r116: steepen self-taught specialist rung 5/15/30), `src/js/villager-agency.js` +15 (`e3ef2b612`, journey succession r161: fix agency place-line dry). Any of the three can move the endpoint again; L0 re-verification is what finds out.
- Instrument drift `ba21ca026`..`8419eefa4`: NONE on the driver chain (driver, recorder, analyzer, sim-harness, policies, stageally/bankkiller instruments — zero commits touching them in range; the scripts/ changes in range are other arms' files only). The single instrument change in `6680d7924`..`ba21ca026` remains sitmetric-b (`6a89df359`, no src/ files) as recorded in the 0630Z prereg.
- The task brief's "other fieldFights.js movers in range" (`37fc7489b` finishing instrument, `50881fbf2` xp-gear, `8a4ce0eab` finishersize) are all ancestors of `6680d7924` — already baked into the OLD headline, in neither bisect range. The only `fieldFights.js` mover between pre and current master is the fightblend landing itself (`ecf3ff60d`).
- `index.html` script list is identical at `93e7bea26`, `3f405ff78`, and `8419eefa4` (same md5 of the extracted `src/js/*.js` list) — the harness load list is stable across legs.

## Legs (seed 53007 ONLY, no band spend)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). One seed only.

1. **L0 current** — worktree itself (master `8419eefa4`). FIRST. RUN=`fightblend-attrib-b-current`, corpus under `evidence/2026-11-09/perseed-fightblend-attrib-b/`.
2. **L1 pre** — master `93e7bea26` (fightblend branch base), git-archive extraction. RUN=`fightblend-attrib-b-pre`.
3. **L2 fix** — `3f405ff78` (fightblend fix tree), git-archive extraction. RUN=`fightblend-attrib-b-fix`.
4. **L0 unrecorded control** — same as L0 with `DIAG_RECORDER=0`, RUN=`fightblend-attrib-b-current-unrec`, for the G2 neutrality bar.

## Decision tree (binding) + STOP rule

- **STOP (endpoint-moved-again):** if L0 does NOT reproduce the NEW headline (138d, village-lost, standing 100 ± 5, maxWave 4, seatDay 92, 0 w4 kills, fallen 15, mechanism mixed/other by the frozen classifier), STOP and report endpoint-moved-again; do NOT run L1/L2, do not attribute.
- **GO (fightblend FINGERED):** iff L0 reproduces NEW AND L1 reproduces OLD (150d, survived, standing 584 ± 5, maxWave 5, seatDay 95, 5 w4 kills, fallen 4, sickness-first) AND L2 reproduces MOVED. All headline fields must match within the stated tolerances; standing tolerance ±5 covers instrument-overlay drift only — any use of it is reported as drift, not silently accepted.
- **EXONERATED:** if L1 already shows the MOVED headline, fightblend is EXONERATED — report the delta and name the next bisect step (the range `6680d7924`→`93e7bea26` is next; do NOT bisect further this run unless time clearly permits — one midpoint max).
- **POST-FIX MOVER:** if L1 reproduces OLD and L2 reproduces OLD while L0 reproduces NEW, the mover is post-fix: the src delta L2→L0 is now **three files across four commits** — `f496b0072` (conversation.js foreign-phrase dedupe, the sole `55b5e5aae`→`ba21ca026` candidate), `b98ac0730` (conversation.js secret-response), `e18f72dce` (food.js specialist rung), `e3ef2b612` (villager-agency.js place-line) — report the SET as the suspect, fightblend exonerated; do NOT finger one commit without a further bisect.
- **MIDDLE SHAPE:** any leg matching neither headline is reported as an unjudged middle shape, never forced into either verdict. A middle shape on L1 or L2 is reported with its full headline, not re-scored. A middle shape on L0 is the STOP (endpoint-moved-again) — reported with its full headline.

## Method

- Git-archive extraction, NOT old-SHA checkout (0730Z lesson): `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch under `/tmp` (extracted files only, not a worktree — no git ops inside). Scratch dirs deleted after use (reproducible from `git archive`).
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, `scripts/policies/competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`.
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` will read `unknown` (scratch under `/tmp` has no `.git` upward) — the SHA under test is recorded in the evidence file, as 53007-a did with its anchor quirk.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53007`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires `competent`, `idle`, `vinebank`, `snareteach`, `competent-linkfeast-b` → `competent-feastdrive-b`/`competent-linkdrive-b`, `conversation-pages`, `stageally-instrument` → `bankkiller-instrument`; all verified present at both SHAs). The smoke is pre-verification, not a judged computation — it proves loading only.
- Classification rule: the 53007-a prereg rule, applied mechanically via `scripts/analyze-53007-20261108.js` (unchanged). Cause groups VIOLENT / ATTRITION / OTHER as registered there; "dehydration" / "Ad Break" / "The Eulogy" carried as OTHER, never silently bucketed.
- **Classifier note (carried, NOT fixed):** the VIOLENT map keys `'arena'` but the game emits `'the arena'` — 3 arena deaths sit in OTHER and the NEW mechanism reads mixed/other where the cause mix (10/15 violent) reads combat-led. The analyzer stays FROZEN for this arm so the NEW headline stays comparable to the 0630Z reading; the label is reported as the rule computes it, not as it "should" read. Fixing the map is a later instrument arm, not this one.
- Flap protocol: probe-gate EVERY git write (`git update-ref refs/heads/probe-<run> HEAD`, delete when done); if the probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through a retry preload (`scripts/flap-retry-preload-20261109.js`, written via the flap-proof write path, never committed, deleted after use) wrapping `fs.writeFileSync` with bounded EPERM retry + read-back verify (unique temp name + rename), following the bisect-b arm's preload pattern — the corpus write is retried, nothing else changes. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Probe state at prereg time: PASS 2026-11-09T10:53Z (probe before the rebase passed; rebase itself completed cleanly).

## GO bars (binding — DIAG-GO requires ALL)

1. L0 current-master re-verification reproduces the NEW headline — or the endpoint-moved-again STOP fires and the run ends there, reported honestly.
2. Each judged leg produces a full daily corpus with an end snapshot (rows span d2..`gameDays`, diag on every row, 0 instrument errors) — the G3 shape as revised by 53007-a Amendments 1–2.
3. The leg headlines are judged against the decision tree above (OLD, MOVED, or NEW, no middle shape forced).
4. **G1 det-gate PASS** (proof `scripts/test-fightblend-attrib-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their headlines; a broken recorder fails the integrity leg; a broken classifier fails the fixture leg).
5. **G2 recorder neutrality PASS** on the L0 pair (armed == unrecorded, same master `8419eefa4` — identical headline + trajectory).
6. **G3 corpus integrity PASS** on every new corpus in `perseed-fightblend-attrib-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).

## Proof

`scripts/test-fightblend-attrib-b.js` (det-gate + per-leg reproduction + neutrality + corpus integrity). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-fightblend-attrib-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution on a recorder corpus, same standing as 53007-a/bisect-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced). Record that honestly.
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.

## Metric review (pre-registered note)

- The primary metric is the per-leg headline (survival + sit day + standing + w4 kills + maxWave + fallen + mechanism class), judged against the decision tree — not a friendlier re-scoring. A middle shape is reported as unjudged, never forced.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor). The ±5 standing tolerance exists only for instrument-overlay drift; if invoked, the drift is named in the evidence file.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read, unaffected by the sitmetric instrument change (verified: that commit touches no src and no policy file) — d95 vs d90 vs d92 is a game difference, judged as written.
- Wave-4 kills AND faced are both judged on every leg: the kill link is 0/8 on the lead seed (NEW) — the facing count (8 types) is the denominator the kill count must be read against, not just survival.
