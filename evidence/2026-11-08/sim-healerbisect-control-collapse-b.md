# sim-healerbisect-b — COLLAPSED full-8 control (adoption)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0730Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerctl-col-b (base master `1cac498d5`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008. Corpora committed under `evidence/2026-11-08/perseed-healerctl-collapse-b/` (8 JSONs, 2.4 MB). Proof `scripts/test-healerbisect-b.js` **17/17 green** (re-run this run).

## Verdict: CONTROL PASSES — collapsed full-8 reproduces exactly

The collapsed control at `cf22937b8` on all 8 frozen-band seeds reproduces the C2 reference **exactly on every seed's death day**: median **70.5d**, sits **0/8**, 0 instrument errors. Both prereg bars pass (median ≤90d, sits ≤2/8). This is a control verdict, not a bisect result: **the midpoint screen (#9 `4e6fa44ab`) may proceed only after the healed full-8 control also passes** — that control is NOT this run (see "What was NOT done"). Do NOT start the midpoint on this evidence alone.

## Collapsed control `cf22937b8` — full 8 seeds

Sweep 08:07–08:10Z (smoke 53004 ~29s; remaining 7 seeds ~2.5 min — collapsed seeds die fast). Extraction method, not checkout: the flap blocked `git checkout` for the whole first half of the run (see "Flap notes"), so the old game code was extracted read-only with `git archive cf22937b8 src scripts index.html manifest.json version.json` into `scratch-cf22937b8/` (untracked, left in the worktree), and ONLY the frozen instrument was overlaid from master tip `1cac498d5` — `scripts/doorwalk-b-driver-20261107.js`, `scripts/policies/competent-doorwalk-b.js`, `scripts/analyze-frozenband-bisect-20261107.js` (all three verified byte-identical to the worktree tip with `diff`). Extraction verified: 9839 files, 0 failed, `src/js/game.js` hash `59a76b120723b4070909842cdf98ad15e26754d7` equals `cf22937b8:src/js/game.js`; the only 3 files on disk not in the `cf22937b8` tree are the 3 overlaid instrument files, as designed. The `sitstep` instrument, `stageally`/`rally` policies, and `sim-harness` used are the in-tree `cf22937b8` versions (untouched across the range, per the prereg). All 8 seeds ran by this extraction method — no mixed corpus, no checkout switch mid-run. `anchorCommit` reads `unknown` in the corpora (the scratch dir is not a git repo) — the SHA is recorded here instead.

| Seed | Days | End | Standing | maxWave | Seat/sat | Seat earned | w4 kills | w5 kills | Scholar deaths | Errors | vs C2 reference |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 88 | village-lost | 199 | 4 | — | — | 3 | 0 | 6 | 0 | exact (88d) |
| 53002 | 84 | village-lost | 100 | 4 | — | — | 0 | 0 | 1 | 0 | exact (84d) |
| 53003 | 68 | village-lost | 120 | 4 | — | — | 0 | 0 | 1 | 0 | exact (68d) |
| 53004 | 73 | village-lost | 199 | 4 | — | 39 | 2 | 0 | 10 | 0 | exact (73/199/2) |
| 53005 | 54 | village-lost | 199 | 4 | — | 36 | 1 | 0 | 1 | 0 | exact (54/199/1) |
| 53006 | 66 | village-lost | 190 | 4 | — | 41 | 1 | 0 | 7 | 0 | exact (66/190/1) |
| 53007 | 63 | village-lost | 125 | 4 | — | — | 0 | 0 | 0 | 0 | exact (63d) |
| 53008 | 92 | village-lost | 199 | 4 | — | 55 | 3 | 0 | 13 | 0 | exact (92/199/3) |

Days sorted: 54, 63, 66, 68, 73, 84, 88, 92 → **median 70.5d** (identical to C2's 70.5d), **sits 0/8** (identical to C2's 0/8). Every seed village-lost, all `regional`, none `national`. "Seat earned" is the daily `tableSeat()` row (the seat is EARNED but never TAKEN: `takeseatStats.seatTaken` 0/8 on every seed — the sit drive never fires because the villages die first, and the 0530Z note holds: the earned day is not the sit day).

Screen classification (`scripts/healerbisect-screen-20261108.js`, subset {53004, 53005, 53006, 53008}): **COLLAPSED** (4/4 die <100d, 0 healed). Analyzer (`scripts/analyze-frozenband-bisect-20261107.js`, collapsed dir vs itself — no healed full-8 side exists yet): both sides COLLAPSED, median 70.5d, sits 0/8, 0 moved seeds, 0 instrument errors. Note: the analyzer's COLLAPSED bar reads sits ≤1/8 while the prereg reads ≤2/8 — both pass at 0/8, no conflict.

### Flip table vs the 0530Z healed subset (subset only — full-8 healed control still owed)

| Seed | Collapsed days (this run) | Healed days (0530Z subset) | Δdays | Collapsed seat/sat | Healed seat/sat | Collapsed stand | Healed stand | Collapsed w4 | Healed w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 3 |
| 53005 | 54 | 150 | +96 | — | lesser d99 | 199 | 199 | 1 | 2 |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 199 | 1 | 3 |
| 53008 | 92 | 150 | +58 | — | lesser d97 | 199 | 199 | 3 | 3 |

The 4 discriminating seeds still flip death→150d survival + sit between the endpoints. The full-8 flip table waits on the healed full-8 control.

## Wall numbers (collapsed control, full-8)

- national 0/8, table sits 0/8, wins 0/8 (baseline leg never walks a door), wave-4 unlocks 8/8, wave-5 unlocks 0/8, median survival 70.5d, max 92d.
- The scale wall is fully visible here: every village reaches wave 4 (standing 100–199) and none reaches wave 5 or national — they die at 54–92 days with standing parked at 199 or below (the wave-5 door needs 200 + a wave-4 facing + readiness-5 release; `readiness5` on 53005 reads short on armor/weapons/veterans).
- Telemetry deviation check: `scripts/telemetry-check.js` **refused the corpora** — "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs" — no LOUD line, no compare performed (a recorder-vs-recorder compare needs a second recorder corpus; the healed full-8 does not exist yet). This is a DIAG bisect; the endpoint reproduction above is the validity check, same as the 0530Z run. Owed: re-run the check at the flip point when both sides exist as recorder corpora, or not at all if the tool still refuses the shape — record the outcome honestly then.

## Death-cause census (full-8, 89 fallen)

the wild 33, monster 11, sickness 11, **starvation 11**, a wound that wouldn't close 4, thirst 4, combat 4, ambush 3, the arena 3, contest 2, betrayal 1, a stranger 1, The Callback 1. Scholar deaths (succession churn — the scholar keeps dying and being replaced): 39 across the 8 villages (53008 alone: 13).

Mechanism read, seed 53005 (fallen list identical to the 0530Z evidence, all 13 deaths, same days and causes — deterministic reproduction): Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, Caleb dead in combat d36 — then Desmond dies of a wound that won't close d39, Patrick of sickness d43, Aki to a monster d48, then **five villagers starve on d50–51** (Adriano, Nikolai, Somchai, Jorge, Anayo), Brian dies in combat d52, village gone d54. The 0530Z mechanism story stands on the full band: the collapse is not a single bad fight, it is the second-month thinning — the village absorbs the same early deaths as the healed version and then starves together when too few hands are left to keep anyone fed. Starvation is 11/89 deaths here (12%); in the healed subset it was 0.

## Village assessment — what the villages looked like

Collapsed, in plain words: Haven starts with twelve people and, on every seed, loses the first ones to the wild, to monsters, to an ambush — the same first deaths the healed villages take. What kills these villages is what comes after: a wound that won't close, a sickness, one more monster, and then there are too few hands left to keep anyone fed. On 53005 five people starve in two days. On 53008 the scholar dies thirteen times over — thirteen successions in ninety-two days — and the village still never sits, because the seat is earned (d55) but the village is gone before anyone can take it. Four of the eight villages earn the lesser seat on paper and none take it. The villages do not die in a battle. They die at the table with empty bowls, three weeks after the last fight that mattered — the same story on all eight seeds, only the dates change.

Sense-check: no dialogue in these corpora reads robotic on its face; the death lists cohere (same first deaths as the healed side, divergent endings). The sit instrument is honest throughout: `seatTaken` 0/8, `sitAttempts` 0/8 — the sit drive never even attempts, because the announcement never comes while the village lives.

## What was NOT done, and why

- **The healed full-8 control (`c9fea16ee`) was NOT run.** This run's brief is the collapsed control only; the midpoint is dispatched after BOTH controls pass. The healed control is the remaining gate — the coordinator (or the next run) runs it with the same extraction method (or a plain checkout if the flap has cleared) and the same bars (median ≥120d AND sits ≥4/8). A miss there is a NO-GO with cause, same as here.
- **The midpoint screen (#9 `4e6fa44ab`) was NOT started.** Per the brief: do not start it on your own. It proceeds only after both controls pass.
- **No panel compare (§15).** The panel needs a flip-point before/after pair; there is no flip point yet. Owed at the flip point by the bisecting run.
- **No game-code change.** DIAG only; `git diff HEAD -- src/` is empty.

## Metric review

- The control bars held without re-scoring: median 70.5d ≤ 90d and sits 0/8 ≤ 2/8, and every seed's death day matches the C2 reference exactly — not just the headline medians. No friendlier metric was consulted. The full-8 control is strictly stronger than the 0530Z subset control it replaces (Amendment A1's deferral is now discharged for the collapsed side).
- One correction to the prereg's expectation, not the metric: the prereg assumed the 0530Z checkout method (`git checkout <sha>` in the worktree); the flap made that impossible, so this run used the extraction method instead (read-only `git archive` + frozen-instrument overlay). The extraction method runs identical code — the smoke seed (53004) reproduced the subset table exactly (73/199/2) before the other 7 seeds ran, which is the validation the method needs. A future run that checks out `cf22937b8` plainly should get identical numbers; if it does not, the extraction is the suspect, not the verdict.
- Screen-subset note: the subset (4/4 COLLAPSED) and the full-8 bars agree; no AMBIGUOUS reading anywhere.

## Flap notes (infrastructure, disclosed)

- The write-denial flap was active for the entire first half of this run (~07:35–08:11Z). Signature: `git update-ref` probe failed continuously (O_EXCL `.lock` creation refused); plain file writes flapped on/off in bursts of seconds-to-minutes — within a single exec call, node/tar writes could succeed and then shell/python writes fail a second later, and a whole exec call could be bad for 3+ minutes while the next call was good. `git archive | tar` failed 100% across ~30 attempts (every file created 0-byte); `git archive` to a pipe reads fine (181,606,400 bytes), `git show | wc -c` reads fine — reads never failed, only writes.
- What worked: a node extractor (`/tmp/extract-cf22937b8.js`, not committed) that buffers the archive in memory, parses tar in-process, and writes each file with retries — its first process spun 3:02 CPU retrying the first file for 5 minutes in a bad tree; killed, relaunched with a 20s per-file deadline, it landed in a good tree and wrote all 9839 files in ~22 seconds. Lesson for the next run: **a fresh process can land good or bad — if file writes fail, relaunch the process rather than retrying in place; the flap is per-process-tree as much as per-minute.** The `muse.write` tool bypasses the flap entirely (evidence file written that way).
- `scripts/worktree-heartbeat.sh sim-healerctl-col-b` worked this run (19s, exit 0 — the 0530Z hang did not recur).
- Flap cleared ~08:11Z (probe OK, checkout + heartbeat clean). The commit below was made after the clear; if the flap returns mid-commit, safe-commit.sh's refusal is the signal — do not force.

## Convergence state

scale-onramp stays **converging** (NOT converged): the collapsed full-8 control now reproduces exactly (median 70.5d, 0/8 — the C2 shape, byte-for-byte on death days), and the healed subset still stands from the 0530Z run, but the healer is still unidentified and the healed full-8 control is still owed. The next blank, in order: the healed full-8 control, then midpoint #9 `4e6fa44ab` on the screen subset.

## Adoption handoff — exact next steps

1. Worktree `~/workspace/worktrees/sim-healerctl-col-b`, branch `sim-healerctl-col-b` (tip: this evidence commit, on top of `1cac498d5`). The frozen instrument lives in the worktree at 1cac498d5; the scratch extraction dir is left untracked in the worktree (`scratch-cf22937b8/`, old code + overlaid instrument) — a later run can reuse it for the healed control only if it re-extracts `c9fea16ee` the same way (do NOT run the healed control from the `cf22937b8` scratch).
2. **Healed full-8 control `c9fea16ee`, all 8 seeds**, same driver invocation (`DAYS=150 SEEDS=53001..53008 RUN=doorwalk-baseline POLICY=baseline OUTDIR=/tmp/healerbisect-0730/c9fea16ee/`), same extraction method if the flap is back (node extractor at `/tmp/extract-cf22937b8.js` — change the SHA constant and DEST, or re-run `git archive` + `tar` if the flap has cleared), or plain `git checkout c9fea16ee` if the probe passes. Bars: median ≥120d AND sits ≥4/8. Smoke first: seed 53004 alone must read the healed shape (150d, sat d90, standing 199, w4 kills 3) before the other 7 run. A miss is NO-GO with cause — stop, do not bisect.
3. **Then bisect:** first midpoint **#9 `4e6fa44ab`** on the screen subset {53004, 53005, 53006, 53008}. Screen rule: HEALED if ≥3/4 reach 150d; COLLAPSED if ≥3/4 die before d100; else AMBIGUOUS → full 8. Confirm the flip point on all 8 seeds + balanced panel before any verdict.
4. Commit the healed corpora the same way (per-seed dir + evidence file, explicit file list to safe-commit.sh, never a directory path). Do NOT push, do NOT bump versions, do NOT verify live.

**Ready to merge, pending ship:** branch `sim-healerctl-col-b` at the evidence commit (see report). NOTHING merged — report ready-to-merge; the coordinator lands it. No game-code trace on the branch: this evidence + 8 per-seed corpora only.
