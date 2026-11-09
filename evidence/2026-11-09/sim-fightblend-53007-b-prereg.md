# sim-fightblend-53007-b — prereg (DIAG, zero src/js)

**Arm:** sim-fightblend-53007-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T0630Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-fightblend-53007-b, base master `ba21ca026` (current master at spawn; verified unchanged in the main tree before this commit). **Prereg committed BEFORE any judged computation.**

## The question

Did the fightblend landing move seed 53007's endpoint? The endpoint moved on current master: the village still survives 150d but sits d90 (was d95), standing 199 (was 584), 2 wave-4 kills (was 5), maxWave 4 (was 5). Prime suspect: fightblend's numerator-aware fight judgment (fix `src/js/fieldFights.js` +47/−4, commits `3f405ff78` / `ecf3ff60d`, branch base master `93e7bea26`; 53007-a base was `6680d7924`). Foundation: `evidence/2026-11-08/sim-53007-bisect-b.md` (ENDPOINT-MOVED, STOP, no bisect) + `evidence/2026-11-08/sim-53007-a.md` + `evidence/2026-11-08/sim-fightblend-b.md`.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread), wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08) — the fight judgment under test decides blow-by-blow fights, never an outcome table. Readiness bars (armored/armed/tricks/veterans) gate the standing unlock. No canon doc covers seed attribution — the question is answered from measurement, not invented.

## Endpoints actually read (committed corpora, values read directly, not assumed)

- **OLD headline** — 53007-a corpus `evidence/2026-11-08/perseed-53007-a/doorwalk-53007-a-s53007-doorwalk-baseline.json` (master `6680d7924`, old instrument): 150d, gameDays 150, survived, standing **584**, maxWave **5**, unlocked 5, finalSeat lesser, takeseatStats seatDay **95**, wave-4 kills **5**, fallen **4** (Rafael d16 sickness, Luz d39 the wild, Katarina d68 sickness, Luke d147 the wild), mechanism sickness-first per the 53007-a rule.
- **MOVED headline** — bisect-b corpus `evidence/2026-11-08/perseed-53007-bisect-b/doorwalk-53007-a-s53007-doorwalk-baseline.json` (master `55b5e5aae`, new instrument): 150d, gameDays 151, survived, standing **199**, maxWave **4**, unlocked 4, finalSeat lesser, takeseatStats seatDay **90**, wave-4 kills **2**, fallen **9** (Rafael d16 sickness, Luz d57, Luke d75, Klaus d77, Se-ri d80, Stan d81, Katarina d84 thirst, Riley d85, Elena d87 — all but two 'the wild'), mechanism combat-led (7/9 violent).

## Ancestry + diff facts (verified from git before this prereg, not assumed)

- `93e7bea26` is an ancestor of `ba21ca026` and of `3f405ff78`. `3f405ff78` is NOT an ancestor of `ba21ca026` (branch tip; the landed form is `ecf3ff60d`).
- pre→fix src diff (`93e7bea26` → `3f405ff78`): **only `src/js/fieldFights.js`, +47/−4** — the fix leg differs from the pre leg in exactly one file, so a pre=old + fix=moved split fingers fightblend with no other src confound.
- pre→current src diff (`93e7bea26` → `ba21ca026`): **only `src/js/conversation.js` + `src/js/fieldFights.js`** (2 files). No `src/data/` change. So the ONLY game-code change between the pre state and current master besides fightblend is the conversation.js foreign-phrase dedupe (`f496b0072`, +20/−2, conversation delivery).
- fix→current src diff (`3f405ff78` → `ba21ca026`): **only `src/js/conversation.js`** (+20/−2). `fieldFights.js` at `3f405ff78` is byte-identical to `ba21ca026` and to `ecf3ff60d`.
- Instrument drift `6680d7924`..`ba21ca026`: NONE on the driver chain (driver, recorder, analyzer, sim-harness, policies, stageally/bankkiller instruments — the only commits touching them are the 53007-a arm's own). The single instrument change in range is sitmetric-b (`6a89df359`, `scripts/sitstep-instrument-20261107.js` +29/−2 — finalSeat now reports the seat TAKEN, not the priced seat; **no src/ files in that commit**, verified). It does NOT touch `takeseatStats.seatDay` (recorded by the doorwalk policy), so the d95→d90 sit-day move is a game/policy read, not an instrument artifact.
- The task brief's "other fieldFights.js movers in range" (`37fc7489b` finishing instrument, `50881fbf2` xp-gear, `8a4ce0eab` finishersize) are all ancestors of `6680d7924` — already baked into the OLD headline, in neither bisect range. The only `fieldFights.js` mover between pre and current master is the fightblend landing itself (`ecf3ff60d`).
- `index.html` script list is identical at `93e7bea26`, `3f405ff78`, and `ba21ca026` — the harness load list is stable across legs.

## Legs (seed 53007 ONLY, no band spend)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). One seed only.

1. **L0 current** — worktree itself (master `ba21ca026`). FIRST. RUN=`fightblend-53007-b-current`, corpus under `evidence/2026-11-09/perseed-fightblend-53007-b/`.
2. **L1 pre** — master `93e7bea26` (fightblend branch base), git-archive extraction. RUN=`fightblend-53007-b-pre`.
3. **L2 fix** — `3f405ff78` (fightblend fix tree), git-archive extraction. RUN=`fightblend-53007-b-fix`.
4. **L0 unrecorded control** — same as L0 with `DIAG_RECORDER=0`, RUN=`fightblend-53007-b-current-unrec`, for the G2 neutrality bar.

## Decision tree (binding) + STOP rule

- **STOP (endpoint-moved-again):** if L0 does NOT reproduce the MOVED headline (150d, survived, standing 199 ± 5, maxWave 4, seatDay 90, 2 w4 kills, fallen 9, combat-led), STOP and report endpoint-moved-again; do NOT run L1/L2, do not attribute.
- **GO (fightblend FINGERED):** iff L0 reproduces MOVED AND L1 reproduces OLD (150d, survived, standing 584 ± 5, maxWave 5, seatDay 95, 5 w4 kills, fallen 4, sickness-first) AND L2 reproduces MOVED. All three headline fields must match within the stated tolerances; standing tolerance ±5 covers instrument-overlay drift only — any use of it is reported as drift, not silently accepted.
- **EXONERATED:** if L1 already shows the MOVED headline, fightblend is EXONERATED — report the delta and name the next bisect step (the range `6680d7924`→`93e7bea26` is next; do NOT bisect further this run unless time clearly permits — one midpoint max).
- **POST-FIX MOVER:** if L1 reproduces OLD and L2 reproduces OLD while L0 reproduces MOVED, the mover is post-fix: the only src delta L2→L0 is `conversation.js` (`f496b0072`) — report it as the suspect, fightblend exonerated.
- **MIDDLE SHAPE:** any leg matching neither headline is reported as an unjudged middle shape, never forced into either verdict. A middle shape on L1 or L2 is reported with its full headline, not re-scored.

## Method

- Git-archive extraction, NOT old-SHA checkout (0730Z lesson): `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch under `/tmp` (extracted files only, not a worktree — no git ops inside). Scratch dirs deleted after use (reproducible from `git archive`).
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, `scripts/policies/competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`.
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` will read `unknown` (scratch under `/tmp` has no `.git` upward) — the SHA under test is recorded in the evidence file, as 53007-a did with its anchor quirk.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53007`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires `competent`, `idle`, `vinebank`, `snareteach`, `competent-linkfeast-b` → `competent-feastdrive-b`/`competent-linkdrive-b`, `conversation-pages`, `stageally-instrument` → `bankkiller-instrument`; all verified present at both SHAs). The smoke is pre-verification, not a judged computation — it proves loading only.
- Classification rule: the 53007-a prereg rule, applied mechanically via `scripts/analyze-53007-20261108.js` (unchanged). Cause groups VIOLENT / ATTRITION / OTHER as registered there; "dehydration" / "Ad Break" / "The Eulogy" carried as OTHER, never silently bucketed.
- Flap protocol: probe-gate EVERY git write (`git update-ref refs/heads/probe-<run> HEAD`, delete when done); if the probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through a retry preload (`scripts/flap-retry-preload-20261109.js`, written via the flap-proof write path, never committed, deleted after use) wrapping `fs.writeFileSync` with bounded EPERM retry + read-back verify (unique temp name + rename), following the bisect-b arm's preload pattern — the corpus write is retried, nothing else changes. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Probe state at prereg time: PASS 2026-11-09T07:00:31Z (flap reported active in this window; writes currently passing).

## GO bars (binding — DIAG-GO requires ALL)

1. L0 current-master re-verification reproduces the MOVED headline — or the endpoint-moved-again STOP fires and the run ends there, reported honestly.
2. Each judged leg produces a full daily corpus with an end snapshot (rows span d2..`gameDays`, diag on every row, 0 instrument errors) — the G3 shape as revised by 53007-a Amendments 1–2.
3. The leg headlines are judged against the decision tree above (OLD or MOVED, no middle shape forced).
4. **G1 det-gate PASS** (proof `scripts/test-fightblend-53007-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their headlines; a broken recorder fails the integrity leg; a broken classifier fails the fixture leg).
5. **G2 recorder neutrality PASS** on the L0 pair (armed == unrecorded, same master `ba21ca026` — identical headline + trajectory).
6. **G3 corpus integrity PASS** on every new corpus in `perseed-fightblend-53007-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).

## Proof

`scripts/test-fightblend-53007-b.js` (det-gate + per-leg reproduction + neutrality + corpus integrity). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-fightblend-53007-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution on a recorder corpus, same standing as 53007-a/bisect-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced). Record that honestly.
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.

## Metric review (pre-registered note)

- The primary metric is the per-leg headline (survival + sit day + standing + w4 kills + maxWave + fallen + mechanism class), judged against the decision tree — not a friendlier re-scoring. A middle shape is reported as unjudged, never forced.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor). The ±5 standing tolerance exists only for instrument-overlay drift; if invoked, the drift is named in the evidence file.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read, unaffected by the sitmetric instrument change (verified: that commit touches no src and no policy file) — d95 vs d90 is a game difference, judged as written.
