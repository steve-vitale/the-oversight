# sim-bandfreeze-b — prereg (DIAG, zero src/js)

**Arm:** sim-bandfreeze-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1930Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-bandfreeze-b, base master `fd306cac1` (verified: worktree `git log --oneline -1` reads `fd306cac1`; worktree tree clean, 0 untracked). **Prereg committed BEFORE any judged computation.**

## The question

Freeze the frozen band and re-ask the fightblend attribution against it. The 1739Z arm (`evidence/2026-11-09/sim-fightblend-reask-b.md`) STOPPED at endpoint-moved-again a fourth time (fifth shape: 150d, survived, standing 184, 1 w4 kill, 6 faced, 0 veterans on `0fcff01ea`) and RETIRED the single-seed attribution route: seed 53007's endpoint has now moved on four consecutive current-master re-verifications, each time a different headline. The replacement instrument is the frozen 8-seed band **53011–53018**, specified in that arm's prereg. This arm (1) freezes each band seed's current-master endpoint on the doorwalk baseline leg, (2) re-verifies the freeze for stability, and only then (3) re-asks the attribution on the band, in priority order: (a) the OLD→MOVED step — fightblend itself (`93e7bea26` pre vs `3f405ff78` fix); (b) the NEW→MIDDLE step — `b98ac0730` and `e3ef2b612` single-commit before/afters; (c) ONLY if (a) and (b) are judged and time remains: the MIDDLE→FIFTH suspect set (`5e190b6ef`, `48c93b22b`, `ae7daf40c`, `1cc46630c`).

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/MONSTER-WAVES.md` — wave 4 gate is village standing ≥ 100 (blood/bonds/bread); wave 5 gate standing ≥ 200 AND wave-4 faced; wave-4 monsters are the Mirror Draft (HP 850–1500, damage 35–95); "Monster encounters are fought, not rolled" (Steve 2026-10-08). No canon doc covers seed attribution — the question is answered from measurement, not invented.
- `~/workspace/the-scattering/AGENTS.md` (repo house rules) read. `docs/MEASUREMENT.md` §§9–12, 14–15 read (pilot gate, death-aware horizons, prereg, convergence, metric binding, balanced panels).

## Freshness re-check (done before this prereg, per `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`)

The 1739Z prereg already checked 677 preregs with zero hits; this arm re-checked against everything landed since (including today's 1739Z/1530Z work):

- **679 files matching `evidence/*/sim-*-prereg.md`** searched for `53011`–`53018`: exactly ONE hit — `evidence/2026-11-09/sim-fightblend-reask-b-prereg.md`, which names the band as the frozen-band reservation itself.
- **All `evidence/**/*.md`** searched: three hits, all the reservation itself — the reask prereg, `evidence/2026-11-09/sim-fightblend-reask-b.md`, and `evidence/2026-11-09/sim-winnability-round-1739.md` (the 1739Z round note naming the band as the next run's instrument).
- **`scripts/*.js`**: zero hits. **Per-seed corpus filenames** (`find evidence -name '*5301[1-8]*'`): zero hits.
- **Forbidden / contaminated band lists:** no forbidden-band list file exists in `evidence/` (filename search for `*band*` / `*forbidden*` / `*contaminat*` returns only the unrelated `evidence/2026-10-22/perseed-dmg-bands/` damage-band corpora, seeds 65561–65568). The goal tracker, `sim-findings.md`, and this run's claim file mention 53011 only as the reservation itself.
- **Collisions found and avoided (carried from the 1739Z check):** `53101–53108` (used by a leadfeast arm — s53104/s53106/s53107 in evidence), `53201–53212` (doorwalk confirm band, named in `evidence/2026-11-07/sim-doorwalk-b-prereg.md` and `evidence/2026-11-07/sim-combatdiv-b.md`), `53701–53712` (named alongside 53201–53212 in the reservation context).
- **Verdict: band 53011–53018 is FRESH.** No prior judged corpus, prereg, screen, or extension band names it except as this frozen-band reservation.

## Freeze master (what changed since the fifth shape)

- Range `0fcff01ea`→`fd306cac1`: **zero src/ changes, zero frozen-instrument changes** (driver, recorder, analyzer, sim-harness, sitstep/stageally/bankkiller instruments, all 11 policy files — `git diff --stat` over `src/` is empty; the scripts/ changes in range are other arms' files only: arenadecomp analyzer, crisis-r164 analyzer, establishment r117/r118 analyzers). The range is evidence/scripts only (journey crisis r164 evidence, arenadecomp instrument + evidence, fightblend-reask commits, establishment r117/r118 evidence). **The freeze runs on the same game code as the fifth shape** — the band's frozen reference is directly comparable to the 53007 fifth shape.
- The MIDDLE→FIFTH suspect set (for leg (c) only, hypothesis not proven): the four src commits in `8419eefa4`→`0fcff01ea` — `5e190b6ef` truth.js coach prior-deflect no-repeat, `48c93b22b` game.js medic-duty widen to trained villagers, `ae7daf40c` convo-wants.js curious first-reveal guard, `1cc46630c` progression.js feast-tooltip-once-per-keepsake.

## Ancestry + diff facts (verified from git before this prereg, not assumed)

- **(a) fightblend pair:** `93e7bea26` (pre, fightblend branch base) and `3f405ff78` (fix) resolve; pre→fix src diff is **only `src/js/fieldFights.js`, +47/−4** — one file, so a band-direction split fingers fightblend with no other src confound. `3f405ff78` is NOT an ancestor of `fd306cac1` (branch tip; the landed form `ecf3ff60d` is). OLD headline (53007-a, `6680d7924`): 150d, survived, standing 584, maxWave 5, seatDay 95, 5 w4 kills, fallen 4. MOVED headline (bisect-b, `55b5e5aae`): 150d, survived, standing 199, maxWave 4, seatDay 90, 2 w4 kills, fallen 9.
- **(b) b98f pair:** `b98ac0730^` = `992888172`; pre→fix src diff is **only `src/js/conversation.js`, +97/−3** (secret-response fix). `b98ac0730` src == `8419eefa4` src (empty diff, verified by the 1739Z arm); `b98ac0730^` src == `e18f72dce` src (empty diff, verified by the 1739Z arm).
- **(b) e3ef pair:** `e3ef2b612^` = `5582c19b9`; pre→fix src diff is **only `src/js/villager-agency.js`, +14/−1** (place-line fix). `e3ef2b612^` src == `ba21ca026` src (empty diff, verified by the 1739Z arm); `e3ef2b612` src == `ba21ca026` + villager-agency.js only.
- **Instrument drift `0fcff01ea`→`fd306cac1`:** zero on the frozen instrument set (see § Freeze master). The frozen current-tip instruments are identical to the instruments that produced the fifth shape.

## The band rule (BINDING — this prereg binds the final rule)

Per-seed endpoint fields (binding): days, end (survived / village-lost), standing, seatDay, w4 kills, w4 faced, fallen (count; the list is recorded per seed), mechanism (frozen analyzer rule reported, corrected `'the arena'` rule alongside — NOT a binding field, the rule changed by instruction), living at end, pantry, readiness5 veterans.

Per-seed movement (fix tree vs pre tree) is judged on three numeric fields, each with a tolerance so instrument-overlay drift cannot fake a move:
- **standing:** moves DOWN if fix − pre ≤ −6; moves UP if fix − pre ≥ +6; else stable (±5 tolerance, as in the single-seed preregs).
- **w4 kills:** moves DOWN if fix < pre; UP if fix > pre; else stable.
- **fallen count:** moves UP if fix > pre; DOWN if fix < pre; else stable.

For the OLD→MOVED direction D (fightblend): standing↓, w4 kills↓, fallen↑.
- A seed **moves in D** iff ≥2 of the 3 fields move in D and none moves opposite D.
- A seed **moves opposite D** iff ≥2 move opposite D and none moves in D.
- Otherwise the seed is **no move** (stable, or a single field moving alone — a trajectory note, never a finger).

Pair (a) verdicts, judged on the 8-seed band:
- **FINGERED (fightblend caused OLD→MOVED):** ≥5/8 seeds move in D AND 0 seeds move opposite D.
- **EXONERATED (as single mover):** 0/8 seeds move in D AND 0/8 move opposite D (the band is inert to the fix).
- **MIXED (unjudged):** anything else — report per-seed, no finger, no exoneration, no summary verdict word.

Pair (b) verdicts (NEW→MIDDLE step; direction is read off the data, not pre-defined):
- Per field, the pair direction is the majority sign across the 8 seeds (counting only seeds where that field moves beyond tolerance; a tied field has no direction). A seed **moves with the pair** iff ≥2 of its 3 fields move in their majority direction and none moves opposite.
- **MOVER (the commit moves the band):** ≥5/8 seeds move with the pair AND 0 seeds move opposite.
- **INERT / EXONERATED:** 0/8 seeds move on ANY field beyond tolerance (all three fields stable on all seeds).
- **MIXED (unjudged):** anything else — report per-seed and per-field.

**Single-seed rule (carried, binding):** a single-seed move is a trajectory note, never a finger — even if seed 53007 (not in this band) moves. The band rule above is the only finger rule this arm uses.

**Freeze-stability rule (binding — the stop discipline):** after the freeze, every band seed is re-run at the SAME master (F0c). The freeze is STABLE iff all 8 seeds reproduce their F0 endpoint exactly on every binding field (standing EXACT — same master, same instrument, determinism premise; no ±5 on a same-master re-run; any tolerance use is reported as drift). If ANY seed differs on ANY binding field, the band is NOT stable → **DIAG-STOP**, no attribution leg runs as a judged leg. Same discipline as fightblend-reask: the freeze is the instrument, and an unstable instrument attributes nothing.

**Re-freeze rule:** the band is re-frozen (endpoints re-measured) whenever master moves under it, never assumed stable. The frozen reference in this arm is tied to `fd306cac1` and to nothing else.

## Legs (band seeds 53011–53018 ONLY; doorwalk baseline leg, 150d death-aware)

All legs: DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged; TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen current-tip instruments (see Method). Corpus under `evidence/2026-11-09/perseed-bandfreeze-b/`. Leg order is binding — each later leg runs only if the earlier judgment allows it.

0. **F0 freeze** — worktree itself (master `fd306cac1`). FIRST. RUN=`bandfreeze-b-freeze`. 8 seeds.
0b. **F0b unrecorded control** — seed 53011 only, same as F0 with `DIAG_RECORDER=0`, RUN=`bandfreeze-b-freeze-unrec`, for the G2 neutrality bar (one control seed; neutrality was already proven on 53007 four times over).
0c. **F0c re-verify** — same 8 seeds at the same master, RUN=`bandfreeze-b-freeze-reverify`. Judges freeze stability (see rule above).
1. **L1 pre-fightblend** — `93e7bea26`, git-archive extraction. RUN=`bandfreeze-b-pre-fb`. 8 seeds. Only if the freeze is STABLE.
2. **L2 fix-fightblend** — `3f405ff78`, git-archive extraction. RUN=`bandfreeze-b-fb`. 8 seeds. Only if the freeze is STABLE.
3. **L3 pre-secret** — `992888172` (`b98ac0730^`), git-archive extraction. RUN=`bandfreeze-b-pre-b98f`. 8 seeds. Only if (a) is judged.
4. **L4 secret** — `b98ac0730`, git-archive extraction. RUN=`bandfreeze-b-b98f`. 8 seeds. Only if (a) is judged.
5. **L5 pre-place** — `5582c19b9` (`e3ef2b612^`), git-archive extraction. RUN=`bandfreeze-b-pre-e3ef`. 8 seeds. Only if (a) is judged.
6. **L6 place** — `e3ef2b612`, git-archive extraction. RUN=`bandfreeze-b-e3ef`. 8 seeds. Only if (a) is judged.
7. **(c) MIDDLE→FIFTH suspect set** — legs NOT pre-specified; only if (a) and (b) are judged AND time clearly remains. Otherwise filed as the next arm, not run here.

## Decision tree (binding) + STOP rules

- **DIAG-STOP (freeze unstable):** if F0c differs from F0 on ANY binding field on ANY seed, STOP and report DIAG-STOP (freeze-unstable) with the per-seed table exactly; do NOT run L1–L6 as judged legs. The band is not an instrument on this master.
- **Instrument STOP:** if the F0b unrecorded control fails to match F0 seed 53011 (G2 fail) or any new corpus fails G3, STOP, investigate, do not attribute.
- **Pair (a):** FINGERED / EXONERATED / MIXED per the band rule above, judged on L1 vs L2 per-seed endpoints. The frozen F0 endpoints are the stability anchor and context, NOT the attribution target — (a) compares L1 vs L2 directly, so no reliance on the old instrument's OLD headline.
- **Pair (b):** MOVER / INERT / MIXED per the band rule above, judged on L3 vs L4 and L5 vs L6 per-seed endpoints. A MOVER verdict on `b98ac0730` does not by itself say it caused NEW→MIDDLE (the band has no NEW/MIDDLE reference — it says the commit moves band endpoints consistently); the evidence file states the scope of the verdict plainly.
- **PARTIAL / per-seed movement:** reported per seed with the three fields' deltas in plain words. NO summary verdict word beyond the band rule's three (FINGERED / EXONERATED / MIXED, MOVER / INERT / MIXED).

## Primary metric + GO threshold (binding)

- **Primary metric:** the frozen band endpoint table (per-seed headline on the 8 seeds) + the band-rule verdict per pair (L1 vs L2, L3 vs L4, L5 vs L6).
- **Horizon:** 150d death-aware — reachability lever (waves 4–5, national, table, wins), §10 150–200d guide; matches every prior 53007 leg so the band is comparable to the lead-seed chain.
- **Seeds:** 53011–53018 (exact literals). **Policies:** doorwalk baseline only.
- **GO threshold:** freeze stable (8/8 re-verified identical) AND pairs (a) and (b) judged under the band rule. A MIXED verdict is a judged outcome, not a miss — the GO is that the instrument holds and the pairs are judged, not that fightblend fingers.
- **A miss is NO-GO, never re-scored against a friendlier metric mid-run** (§14). If the metric proves wrong, write it under "metric review" and propose the revision for the NEXT run.

## Method

- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C <scratch>/` with scratch dirs under the worktree (`scratch-bandfreeze-<leg>/`, deleted after use — reproducible from `git archive`). NOT new worktrees.
- Overlay the FROZEN instrument files from the current tip onto each extraction (the driver chain, so all legs run identical instruments and any difference is src/data only): `scripts/doorwalk-53007-driver-20261108.js`, `scripts/recorder-53007-20261108.js`, `scripts/analyze-53007-20261108.js`, `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/stageally-instrument-20261106.js`, `scripts/bankkiller-instrument-20261105.js`, and the 11 policy files in the dedupe/e18f overlay list (`competent-doorwalk-b.js`, `competent-stageally-a.js`, `competent-rally-bankkiller-b.js`, `competent.js`, `competent-linkfeast-b.js`, `competent-feastdrive-b.js`, `competent-linkdrive-b.js`, `conversation-pages.js`, `idle.js`, `vinebank.js`, `snareteach.js`). (The 11 are the full transitive require closure, verified by the 2-day smoke, not by the count.)
- Code identity: verify by `game.js` hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) AND verify the overlaid instrument files hash-match the current tip. The corpus `anchorCommit` reads the worktree tip (scratch sits under the worktree, so `git rev-parse HEAD` resolves upward) — the SHA under test is recorded in the evidence file, as 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b did with their anchor quirks.
- Require-closure verification BEFORE any judged seed: a 2-day smoke run (`DAYS=2 SEEDS=53011`, OUTDIR `/tmp`, discarded) on each extracted tree, exercising the full driver require closure (sim-harness + all policies + transitive requires). The smoke is pre-verification, not a judged computation — it proves loading only. The worktree itself is smoke-checked the same way before F0.
- Driver invocation per leg (from the worktree): `REPO=<scratch> DAYS=150 SEEDS=53011..53018 RUN=<run> OUTDIR=<worktree corpus dir> node <scratch>/scripts/doorwalk-53007-driver-20261108.js` (DIAG_RECORDER=0 for the unrecorded control only; F0 runs with REPO unset, i.e. the worktree itself). One unrecorded control seed: `SEEDS=53011`.
- First-divergence day: compare the daily rows between paired corpora per seed (living, pantry, sick, wounded, hungry) and report the first day they differ; also F0 vs F0c per seed (must be none — stability is exact).
- Classification rule: the 53007-a prereg rule, applied mechanically, with `'the arena'` registered as VIOLENT in this arm's classifier (the proof script's classifier, `scripts/test-bandfreeze-b.js`), reusing the reask `classifyCorrected` pattern. The frozen analyzer `scripts/analyze-53007-20261108.js` is overlaid UNCHANGED for comparability — it is not edited. The mechanism label is NOT a binding headline field (the rule changed by instruction); both labels are reported. The monster-name-cause gap (`'Hushpuppy'` unmapped in both maps) is carried, named not bucketed.
- Flap protocol: probe-gate EVERY git write; if a probe fails, do read work and retry later — never force a write, never hand-edit a ref. Corpus writes go through a retry preload (worktree-local `scripts/flap-retry-preload-bandfreeze-b.js`, never committed, deleted after use — unique temp + rename + read-back verify, bounded EPERM retry), following the bisect-b/fightblend-b/dedupe-b pattern — the corpus write is retried, nothing else changes. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob. Never `git reset`.
- Worktree-local safe-commit: `scripts/safe-commit.sh` is already present in the worktree (it cds to its own dirname's parent — invoking the main-tree path from a worktree commits in the MAIN tree; never do that), then `bash scripts/safe-commit.sh "msg" -- <files>`. Never bare git commit, never git add.

## GO bars (binding — DIAG-GO requires ALL)

1. Freeze complete: 8/8 band seeds run on `fd306cac1` with full daily corpora + end snapshots (F0), plus the 53011 unrecorded control (F0b) and the 8-seed re-verification (F0c).
2. Freeze STABLE: F0c reproduces F0 exactly on every binding field, every seed — or DIAG-STOP fires and the run ends there, reported honestly.
3. Pairs (a) and (b) judged against the band rule (FINGERED / EXONERATED / MIXED; MOVER / INERT / MIXED) — or the STOP rule above fires first.
4. **G1 det-gate PASS** (proof `scripts/test-bandfreeze-b.js`: determinism/reproduction legs for each leg — committed corpora read back as their endpoints; headline-predicate synthetics for old/moved/middle/new/endpoint + the ±5 standing boundary; band-rule synthetics (majority-move, no-opposite, mixed, exonerated, mover, inert); a broken recorder fails the integrity leg; a broken classifier fails the fixture leg; the `'the arena'` registration is itself a tested leg).
5. **G2 recorder neutrality PASS** on the F0/F0b pair (seed 53011, armed == unrecorded, same master `fd306cac1` — identical headline + trajectory).
6. **G3 corpus integrity PASS** on every new corpus in `perseed-bandfreeze-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).

## Proof

`scripts/test-bandfreeze-b.js` (det-gate + per-leg reproduction + neutrality + corpus integrity + band-rule judge + `'the arena'` classifier registration, adapted from `scripts/test-fightblend-reask-b.js`). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Real-corpus legs encode the decision as taken (STOP legs SKIP when the attribution never ran, per the fightblend-attrib-b pattern). Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-bandfreeze-b`.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival — reported in the evidence file even though the doorwalk leg never walks a door (baseline leg: national 0/8, wins 0/8 by design; table sits count, wave-4 unlocks, wave-5 unlocks, median survival across the 8 seeds).

## Sense-test

Read transcripts/dialogue on at least one band seed; judge meaning and coherence, never just counts (mourning beats, table-set → Audit sequence, name rotation, grief-card beats).

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG attribution on recorder corpora, same standing as 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b/reask-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Do NOT edit `sim-findings.md` — findings are listed in the evidence file; the coordinator files them.

## Metric review (pre-registered note)

- The primary metric is the per-seed headline + the band-rule verdict, judged against the decision tree — not a friendlier re-scoring. A mixed band is reported as unjudged per the rule, never forced into a finger.
- The deterministic-sim premise: identical code + identical instrument + identical seed reproduces exactly (53007-a proved byte-identical reproduction sans anchor; dedupe-b proved it twice over on two different trees; e18f-b a third time; reask-b a fourth). The ±5 standing tolerance exists only for instrument-overlay drift between DIFFERENT trees (pre vs fix extractions); on a same-master re-run (F0 vs F0c) the match is exact, no tolerance.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The seat-day field: `takeseatStats.seatDay` is a policy read — a game difference, judged as written.
- Wave-4 kills AND faced are reported on every leg (kills from `waveKillLog`, faced from `finalSeat`/wavesFaced) — the winnability chain's binding link, not just survival.
- One metric note carried from 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b/reask-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.
