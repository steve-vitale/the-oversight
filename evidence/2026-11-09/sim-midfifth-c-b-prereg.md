# sim-midfifth-c-b — prereg (DIAG, zero src/js)

**Arm:** sim-midfifth-c-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T2130Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-midfifth-c-b, base master `7cd52fbb0` (verified: worktree `git log --oneline -1` reads `7cd52fbb0`; worktree tree clean, 0 untracked). **Prereg committed BEFORE any judged computation.**

## The question

Judge the (c) MIDDLE→FIFTH suspect set on the frozen band 53011–53018 (frozen at `fd306cac1`, F0 endpoints in `evidence/2026-11-09/sim-bandfreeze-b.md`). The bandfreeze arm judged (a) fightblend MIXED and (b/b98f) MOVER, (b/e3ef) INERT, and filed (c) as the next arm. This arm judges each of the four src commits in `8419eefa4`→`0fcff01ea` as a single-commit before/after pair on the band:

- **L7/L8 — coach:** `5e190b6ef` (truth.js coach prior-deflect no-repeat) vs its parent `4c44e35de`.
- **L9/L10 — medic:** `48c93b22b` (game.js medic-duty widen to trained villagers) vs its parent `0ba20ac1c`.
- **L11/L12 — reveal:** `ae7daf40c` (convo-wants.js curious first-reveal guard) vs its parent `c6dd255b9`.
- **L13/L14 — tooltip:** `1cc46630c` (progression.js feast tooltip once per keepsake) vs its parent `d781f354d`.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread); wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08). No canon doc covers seed attribution — the question is answered from measurement, not invented.
- `~/workspace/the-scattering/AGENTS.md` (repo house rules) read — worktree copy verified identical to the main-tree copy. `docs/MEASUREMENT.md` §§9–12, 14–15 read (pilot gate, death-aware horizons, prereg, convergence, metric binding, balanced panels).

## Ancestry + diff facts (verified from git before this prereg, not assumed)

All four suspects are descendants of `8419eefa4` and ancestors of `0fcff01ea` (verified with `git merge-base --is-ancestor` both ways). Each pair's src diff is single-file, single-purpose:

- **coach `5e190b6ef` (parent `4c44e35de`):** src diff is **only `src/js/truth.js`, +17/−1** — adds the `coachPriorDeflect` 3-line pool and draws it via `drawTruthLine('coachPriorDeflect', vid)` where the pre code served one hardcoded string. **RNG note (mechanism hypothesis, not a verdict):** the pre branch consumed NO RNG; the fix calls `drawTruthLine`, which calls `Math.random()` (once for the pool index, once for the fresh-list index) and writes `state.truthLineUsed`. The fix is text-only in content but RNG-visible in the seeded stream — it can shift the RNG stream and reshuffle trajectories the way fightblend did, even though no game number changes. Judged by the band rule either way.
- **medic `48c93b22b` (parent `0ba20ac1c`):** src diff is **only `src/js/game.js`, +66/−20** — all hunks medic-duty: `campHealerId` duty-holder visibility, new `isMedicDutyEligible` predicate (occupation OR wound_care/herbal_medicine skill OR triage/herbal_remedy/field_medicine ability), `medicDutyHolder` eligibility via that predicate, `assignMedicDuty` tier sort (healing ability → occupation → skill-only) + no-medic line condition. Single purpose. Most plausible mover alongside the coach fix — the fifth-shape divergence opened with a d4 sickness difference (bandfreeze evidence). Deterministic, no RNG, per the commit's own comments.
- **reveal `ae7daf40c` (parent `c6dd255b9`):** src diff is **only `src/js/convo-wants.js`, +16** — the `engageBeat` first-reveal guard (returns null unless the want's question was answered in THIS sitting). Single file, single purpose. **Confound noted:** the full commit also touches `scripts/analyze-landing-r118-outingchain.js` (+10/−3) and `scripts/test-landing-r118-outingchain.js` (an outingchain analyzer fix). The frozen overlay replaces the analyzer with the current-tip frozen version, so that part is neutralized in the legs — the pair judges the src change only.
- **tooltip `1cc46630c` (parent `d781f354d`):** src diff is **only `src/js/progression.js`, +21/−2** — the FEASTED tooltip fires once per keepsake; repeat armings of the same item keep the short form. Single file, single purpose. **State note:** it writes `pg.feastTooltipSaidByItem[itemKey] = true` into progression state — a flag read only for that tooltip text; the multiplier is identical either way. Expected INERT on trajectories; judged by the rule anyway.

## What changed since the freeze (freeze master → this base)

- Range `fd306cac1`→`7cd52fbb0`: **zero frozen-instrument changes** (`git diff --stat` over the full frozen instrument set — driver, recorder, analyzer, sim-harness, sitstep/stageally/bankkiller instruments, all 11 policy files — is empty). The overlay from this worktree's tip IS the frozen instrument set.
- src/ changes in range: **only 3 files, +85 lines** — `src/js/contests.js` +23 (`fd9851dc8` honest-stakes ledger: count arena deaths in contestDeathsById), `src/js/conversation.js` +47 and `src/js/convo-dialogue.js` +15 (`4859f77c7` journey-deepening r122: post-secret follow-up). Everything else in the range is evidence/scripts (bandfreeze corpora + evidence, medchannel, radsnap, radsource, r123 prereg/evidence, honeststakes prereg + proof refresh).
- Consequence: the frozen F0 reference stays tied to `fd306cac1`. The F0-reverify leg below measures the drift those two src commits cause on the band — it is a stability *report*, not a re-freeze.

## The band rule (BINDING — this prereg binds the final rule; carried from the bandfreeze prereg, pair-(b) form)

Per-seed endpoint fields (binding): days, end (survived / village-lost), standing, seatDay, w4 kills, w4 faced, fallen (count; the list is recorded per seed), mechanism (frozen analyzer rule reported, corrected `'the arena'` rule alongside — NOT a binding field, the rule changed by instruction), living at end, pantry, readiness5 veterans.

Per-seed movement (fix tree vs pre tree) is judged on three numeric fields, each with a tolerance so instrument-overlay drift cannot fake a move:
- **standing:** moves DOWN if fix − pre ≤ −6; moves UP if fix − pre ≥ +6; else stable (±5 tolerance, as in the single-seed preregs).
- **w4 kills:** moves DOWN if fix < pre; UP if fix > pre; else stable.
- **fallen count:** moves UP if fix > pre; DOWN if fix < pre; else stable.

Per field, the pair direction is the majority sign across the 8 seeds (counting only seeds where that field moves beyond tolerance; a tied field has no direction). A seed **moves with the pair** iff ≥2 of its 3 fields move in their majority direction and none moves opposite.
- **MOVER (the commit moves the band):** ≥5/8 seeds move with the pair AND 0 seeds move opposite.
- **INERT / EXONERATED:** 0/8 seeds move on ANY field beyond tolerance (all three fields stable on all seeds).
- **MIXED (unjudged):** anything else — report per-seed and per-field.

**Single-seed rule (carried, binding):** a single-seed move is a trajectory note, never a finger — even if seed 53007 (not in this band) moves. The band rule above is the only finger rule this arm uses.

**No summary verdict word beyond the rule's three** (MOVER / INERT / MIXED) for any of the four pairs. A MOVER verdict says the commit moves band endpoints consistently — it does NOT by itself prove the commit caused the single-seed MIDDLE→FIFTH step (the band has no MIDDLE/FIFTH reference); the evidence file states the scope of each verdict plainly.

## Legs (band seeds 53011–53018 ONLY; doorwalk baseline leg, 150d death-aware)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). Corpus under `evidence/2026-11-09/perseed-midfifth-c-b/`. Leg order is binding.

0. **F0r re-verify** — worktree itself (master `7cd52fbb0`). FIRST. RUN=`midfifth-c-f0reverify`. 8 seeds. Stability check of the freeze against the moved master: if it reproduces F0 exactly, the freeze still holds on current master; if not, report the per-seed drift honestly (which seeds, which fields, by how much) and DO NOT re-freeze silently — the pair verdicts still stand, because they compare extractions, not F0. F0r drift does NOT stop the legs (deliberate difference from the bandfreeze freeze-stability rule: the freeze reference stays `fd306cac1` and master has moved under it by design).
1. **L7 pre-coach** — `4c44e35de`, git-archive extraction. RUN=`midfifth-c-pre-coach`. 8 seeds.
2. **L8 coach** — `5e190b6ef`, git-archive extraction. RUN=`midfifth-c-coach`. 8 seeds.
3. **L9 pre-medic** — `0ba20ac1c`, git-archive extraction. RUN=`midfifth-c-pre-medic`. 8 seeds.
4. **L10 medic** — `48c93b22b`, git-archive extraction. RUN=`midfifth-c-medic`. 8 seeds.
5. **L11 pre-reveal** — `c6dd255b9`, git-archive extraction. RUN=`midfifth-c-pre-reveal`. 8 seeds.
6. **L12 reveal** — `ae7daf40c`, git-archive extraction. RUN=`midfifth-c-reveal`. 8 seeds.
7. **L13 pre-tooltip** — `d781f354d`, git-archive extraction. RUN=`midfifth-c-pre-tooltip`. 8 seeds.
8. **L14 tooltip** — `1cc46630c`, git-archive extraction. RUN=`midfifth-c-tooltip`. 8 seeds.

## Decision tree (binding) + STOP rules

- **Instrument STOP:** if any new corpus fails G3, STOP, investigate, do not attribute.
- **Pair verdicts:** MOVER / INERT / MIXED per the band rule above, judged on L7 vs L8, L9 vs L10, L11 vs L12, L13 vs L14 per-seed endpoints. The frozen F0 endpoints are the stability anchor and context, NOT the attribution target — each pair compares its two extractions directly.
- **F0r drift:** reported per seed with the three fields' deltas in plain words. No STOP, no re-freeze, no re-scoring of the pairs against F0r.
- **PARTIAL / per-seed movement:** reported per seed with the three fields' deltas in plain words. NO summary verdict word beyond the band rule's three.

## Primary metric + GO threshold (binding)

- **Primary metric:** the four pair verdicts under the band rule (L7 vs L8, L9 vs L10, L11 vs L12, L13 vs L14) + the F0r drift table.
- **Horizon:** 150d death-aware — reachability lever (waves 4–5, national, table, wins), §10 150–200d guide; matches every prior 53007 leg so the band is comparable to the lead-seed chain.
- **Seeds:** 53011–53018 (exact literals). **Policies:** doorwalk baseline only.
- **GO threshold:** F0r run + drift reported AND all four pairs judged under the band rule. A MIXED verdict is a judged outcome, not a miss — the GO is that the pairs are judged, not that any suspect moves.
- **A miss is NO-GO, never re-scored against a friendlier metric mid-run** (§14). If the metric proves wrong, write it under "metric review" and propose the revision for the NEXT run.

## Method

- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch dirs under the worktree (`scratch-midfifth-<leg>/`, deleted after use — reproducible from `git archive`). NOT new worktrees.
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, and the 11 policy files in the dedupe/e18f overlay list (`competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`). (Verified zero-diff vs the `fd306cac1` frozen set, so the overlay from this tip IS the frozen instrument.)
- Code identity: verify by the distinguishing file's hash match against the commit blob (`git rev-parse <sha>:src/js/<file>` vs the scratch file) AND `game.js` hash match against the commit blob, AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` reads the worktree tip (scratch sits under the worktree, so `git rev-parse HEAD` resolves upward) — the SHA under test is recorded in the evidence file, as 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b/reask-b/bandfreeze-b did with their anchor quirks.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53011`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires). The smoke is pre-verification, not a judged computation — it proves loading only. The worktree itself is smoke-checked the same way before F0r.
- Driver invocation per leg (from the worktree): `REPO=<scratch> DAYS=150 SEEDS=53011..53018 RUN=<run> OUTDIR=<worktree corpus dir> node <scratch>/scripts/doorwalk-53007-driver-20261108.js` (F0r runs with REPO unset, i.e. the worktree itself).
- First-divergence day: compare the daily rows between paired corpora per seed (living, pantry, sick, wounded, hungry) and report the first day they differ; also F0 vs F0r per seed (drift days). Use the first-row-per-day helper (`rowsEqualOnDays`) for first-divergence reads — the naive helper returns the closing-duplicate artifact on dead seeds (bandfreeze metric review).
- Classification rule: the 53007-a prereg rule, applied mechanically, with `'the arena'` registered as VIOLENT in this arm's classifier (the proof script's classifier, `scripts/test-midfifth-c-b.js`), reusing the bandfreeze `classifyCorrected` pattern. The frozen analyzer `scripts/analyze-53007-20261108.js` is overlaid UNCHANGED for comparability — it is not edited. The mechanism label is NOT a binding headline field (the rule changed by instruction); both labels are reported. The monster-name-cause gap (`'Hushpuppy'` unmapped in both maps) is carried, named not bucketed.
- Flap protocol: probe-gate EVERY git write; if a probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through a retry preload (worktree-local `scripts/flap-retry-preload-midfifth-c-b.js`, never committed, deleted after use — unique temp + rename + read-back verify, bounded EPERM retry), following the bisect-b/fightblend-b/dedupe-b/bandfreeze-b pattern — the corpus write is retried, nothing else changes. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Worktree-local safe-commit: `scripts/safe-commit.sh` is already present in the worktree (it cds to its own dirname's parent — invoking the main-tree path from a worktree commits in the MAIN tree; never do that), then `bash scripts/safe-commit.sh "msg" -- <files>`. Never bare git commit, never git add. Expand directory paths to file lists first (safe-commit.sh refuses directories).

## GO bars (binding — DIAG-GO requires ALL)

1. F0r complete: 8/8 band seeds run on `7cd52fbb0` with full daily corpora + end snapshots, drift vs F0 reported per seed.
2. Pairs judged: all four pairs (L7/L8, L9/L10, L11/L12, L13/L14) judged against the band rule (MOVER / INERT / MIXED) — or the STOP rule above fires first.
3. **G1 det-gate PASS** (proof `scripts/test-midfifth-c-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their endpoints; headline-predicate synthetics for old/moved/middle/new/endpoint + the ±5 standing boundary; band-rule synthetics (pair-(b) MOVER/INERT/MIXED, majority-move, no-opposite, single-field-moves-never-move); a broken recorder fails the integrity leg; a broken classifier fails the fixture leg; the `'the arena'` registration is itself a tested leg).
4. **G3 corpus integrity PASS** on every new corpus in `perseed-midfifth-c-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).
5. No G2 leg: the recorder is unchanged since the bandfreeze F0/F0b neutrality proof (armed == unrecorded on seed 53011, same instrument); no new recorder neutrality claim is made here.

## Proof

`scripts/test-midfifth-c-b.js` (det-gate + per-leg reproduction + corpus integrity + band-rule judge + `'the arena'` classifier registration, adapted from `scripts/test-bandfreeze-b.js`). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Real-corpus legs encode the decision as taken (STOP legs SKIP when a leg never ran, per the fightblend-attrib-b pattern). Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-midfifth-c-b`.

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

- The primary metric is the per-seed headline + the band-rule verdict, judged against the decision tree — not a friendlier re-scoring. A mixed band is reported as unjudged per the rule, never forced into a finger.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor; dedupe-b proved it twice over on two different trees; e18f-b a third time; reask-b a fourth; bandfreeze-b a fifth, on an 8-seed band). The ±5 standing tolerance exists only for instrument-overlay drift between DIFFERENT trees (pre vs fix extractions); on a same-master re-run (F0 vs F0c) the match is exact, no tolerance. F0r is NOT a same-master re-run (master moved: contests.js, conversation.js, convo-dialogue.js) — its drift is measured, not tolerated away.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read — a game difference, judged as written.
- Wave-4 kills AND faced are reported on every leg (kills from `waveKillLog`, faced from `finalSeat`/wavesFaced) — the winnability chain's binding link, not just survival.
- One metric note carried from 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b/reask-b/bandfreeze-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.
- First-divergence reads use the first-row-per-day helper, not the naive helper (bandfreeze metric review: closing-duplicate artifact on dead seeds).
