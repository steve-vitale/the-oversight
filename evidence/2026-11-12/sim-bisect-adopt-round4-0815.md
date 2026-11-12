# sim-bisect-adopt-round4-0815 — ADOPTION of dead 0715Z run, bisect ROUND 4 (Loop A)

- **Run:** fleshout-20261112T0815Z, Loop A, axis scale-onramp — survival-collapse bisect ROUND 4, ADOPTION (one arm recovered and landed; two arms never started, re-run fresh in this run).
- **Coordinator evidence:** `evidence/2026-11-12/sim-bisect-adopt-round4-0815.md` (this file).
- **Master at run start:** `d98aae0f0` (journey-endgame r185). **Master at run end:** `60224008b` + this file's commit (see below).
- **Prereg status:** each arm's prereg was committed by its worker BEFORE any judged sim (origin-a `81c5478b9`, mergebase-a `789ba4ac8`; repin-a is test-only, no prereg). This adoption changed no prereg, no threshold, no seed.

## STALE-LOCK RECOVERY at start

- Lock `fleshout-loop.lock` held run `fleshout-20261112T0715Z`, created 2026-11-12T07:16:01Z. At this run's start (08:15:53Z) the lock was ~60 min old (under the 90-min fallback) but all three of that run's tree heartbeats were >15 min stale (sim-bisect-origin-a 07:42:52Z, sim-bisect-mergebase-a 07:28:39Z, sim-repin-a 07:32:58Z). Previous run DEAD per the guard (heartbeat rule, not lock age). Lock deleted, stale-lock recovery noted here; dead claim `fleshout-20261112T0715Z.json` retired to `.DEAD` at run end (after the orphaned work was safely committed).
- Host write flap: PROBED CLEAR at 08:16Z (`git update-ref refs/heads/probe-flap-0815 HEAD` write+delete OK). No flap interference during this adoption.
- Subagent listing at start: the dead run's origin-a worker was `done`, mergebase-a and repin-a workers `interrupted`; no live Loop A agents, no files modified in the last 15 min in any of the three trees at adoption time. (Loop B's 0730Z run was live in its own trees; untouched.)
- Pre-flight: main tree clean at start (`git status --short` empty), disk 41%. `worktree-reap.sh` ran clean (nothing auto-removed; all flagged trees hold uncommitted changes owned by other runs).

## Arm 1 — sim-bisect-origin-a: LANDED `6330fd931`

- **Verdict: ORIGIN_COLLAPSED — 2/8 survived** (prereg rule: ≥5/8 ORIGIN_HEALTHY, ≤2/8 ORIGIN_COLLAPSED, 3–4/8 INCONCLUSIVE). Base `a628aeaf3` + r131 fix swapped in, own policy. Evidence `evidence/2026-11-12/sim-bisect-origin-a.md`. Median 90d, deaths 519, wave-5 1/8 (seed 190394, standing 520 — highest standing on any leg), village rank 8/8 (rank stall reported, unjudged).
- **Recovery:** worker finished and committed both commits (`81c5478b9` prereg+tools, `9c112826a` evidence+corpus); nothing orphaned. Adoption verified by sha, not by the evidence text: `standing.js` at tip AND on disk = `98c8bfad70d7…` (the base's pre-fix sha, byte-identical), `git status` clean, corpus 8/8 present, analyzer re-run exit 0 with byte-identical summary.
- **Defect found in adoption (proof cannot run on the un-rebased branch):** the worker's "49/49 green after the band" claim is true only with the scratch instrument present. The proof requires `./vetfirst-instrument-20261111.js`, which the worker deleted before finishing per the prereg (it exists on master, not on base `a628aeaf3`). On the un-rebased branch the proof fails with MODULE_NOT_FOUND. This is the known pattern, not a worker error — the proof is designed to be re-run after rebase onto master — but the evidence §9 should have said so explicitly (mergebase-a's §9 does; see arm 2). No action: the proof ran 49/49 on the rebased tree and on the master tip.
- **Stale rebase state:** the first rebase attempt stopped on a stale empty `rebase-merge` dir (two 0-byte files, `head-name` + `interactive`, dated 08:07Z — the dead run's end; no `onto`, no todo, no git process running). Removed, rebase re-run.
- **Two rebase rounds:** rebased onto `d98aae0f0` clean (proof 49/49, analyzer exit 0), but Loop B landed sim-proofrefresh-b7 (`fefc29406`) in between, so the first ff-only merge correctly refused (diverging branches, exit 128, no harm). Rebased onto explicit `fefc29406`, proof 49/49 again, analyzer exit 0, then ff-only merged. Ancestor verified, main clean.
- **Merge:** ff-only onto `fefc29406`, tip `6330fd931`. Proof re-run on the master tip 49/49. Released as done-merged; tree removed, branch deleted. Zero `src/js` changes.

## Arm 2 — sim-bisect-mergebase-a: LANDED `60224008b`

- **Verdict: MERGEBASE_COLLAPSED — 1/8 survived + RANK_STALL — 0/8 regional** (prereg survival rule ≥5/8 HEALTHY, ≤2/8 COLLAPSED; rank rule ≥5/8 REGIONAL_INTACT, ≤2/8 RANK_STALL — the origin leg's unjudged rank observation is now a judged verdict). Base `d229b58f5` (verified Nov-8 merge-base of `5157782a4`/`a628aeaf3`) + r131 fix swapped in, competent verbatim from the base. Evidence `evidence/2026-11-12/sim-bisect-mergebase-a.md`. Median 102d, deaths 669, wave-5 **0/8** (only leg in the bisect with no wave-5 unlock), standing 145–199 (pins at exactly 199 on 7/8 — the t4-1 hold on emptied end rosters, not a mid-run stall), village rank 8/8. Wave-5 choke measured: peak living wave-4+ veterans never exceed 1 on any seed (bar needs 2).
- **Recovery:** this arm never started in the dead run (worker interrupted ~5 min in, no commits, clean tree at `d229b58f5`). Re-run fresh in this run under the same claim: worker verified base + clean tree at start, committed its own prereg + driver + analyzer + proof (`789ba4ac8`) before any judged sim, ran the band, committed evidence + corpus (`57537acae`). Proof 60/60 green before the band and after.
- **Adoption verification:** `standing.js` at tip AND on disk = `98c8bfad70d7…` (byte-identical to the merge-base's pre-fix file — same sha as the origin base's), `git status` clean, corpus 8/8, analyzer re-run exit 0 with byte-identical summary, proof 60/60 on the rebased tree and on the master tip. No `src/js` change.
- **Merge:** rebased onto `937f79040` clean (proof 60/60, analyzer exit 0), ff-only merged, ancestor verified, tip `60224008b`. Released as done-merged; tree removed, branch deleted.

## Arm 3 — sim-repin-a: LANDED `937f79040`

- **Verdict: test-only re-pins, proofs green.** No sims, no game-code changes, no `[needs-eyes]`.
- **Recovery:** this arm never started in the dead run (worker interrupted, no commits, clean tree at master tip). Re-run fresh in this run.
- **Re-pin 1:** `scripts/mcconfirm-ctrl-analyze-20261111.js` — `MERGE_SEEDS` 8 → 16 (the joint rule's merge input is the sibling merge leg on the fresh 16-seed band, 1/16, not the old 8-seed merge-a leg). Proof `test-mcconfirm-ctrl-b.js` 51/51 before and after.
- **Re-pin 2:** `scripts/bisect-policyswap-driver-20261111.js` — `CURRENT_POLICY_SHA` `3c40151e8dd4…` → `17f3e4555d01…` (verified on disk and as journey-r127 `124a99389`'s competent.js). The proof-green requirement forced a companion re-pin in `scripts/test-bisect-policyswap-a.js` (fixture `git show 3f136f07e:` → `124a99389:`, plus matching labels; assertion unchanged, same strength — the 0615Z firstparent-a precedent). Proof `test-bisect-policyswap-a.js` 50/50 before and after.
- **Coordinator addition (one line, test-only):** the worker left the `MERGE_SURVIVED` comment citing the old merge-a leg ("seeds 190391–190398") next to the now-16-seed constant — a wrong label. Fixed on the branch as coordinator commit `937f79040` (comment now names the fresh-band mcconfirm-merge-b leg, 1/16; merge-a noted as 1/8 for reference). No assertion change; both proofs re-run green after.
- **Adoption verification:** single worker commit `733ae02e1` (3 files, 7 insertions / 7 deletions) + coordinator comment commit; zero `src/js` changes; worktree clean. Index clobber struck on the coordinator commit (`MM` on the one file); repaired with the `ls-tree -r` pipe, blob verified matching HEAD, status + diff empty.
- **Merge:** rebased onto `6330fd931` clean (no file overlap with the origin-a landing), proofs 51/51 + 50/50 on the rebased tree, ff-only merged, ancestor verified, tip `937f79040`. Released as done-merged; tree removed, branch deleted.

## Verification at master tip (`60224008b`)

- All three analyzers re-run against the committed corpora: verdicts reproduce (origin 2/8 ORIGIN_COLLAPSED, merge-base 1/8 MERGEBASE_COLLAPSED + 0/8 RANK_STALL, repin n/a test-only); analyzer runs left `git status` clean (summaries byte-identical).
- All three proofs green on the tip: 49/49 + 60/60 + 51/51 + 50/50.
- Main tree clean at run end; no push, no version bump — merged locally, pending ship.

## Wall numbers (bisect round 4, seeds 190391–190398, 150d, competent)

| Leg | Survived | Median | Wins | National | Table | Wave 5 | Regional | Deaths |
|---|---|---|---|---|---|---|---|---|
| Vetphantom fix leg `5157782a4` (reference) | 6/8 | 150d | 0 | 0 | 0 | 3/8 | 8/8 | 707 |
| First parent `203a32775` + fix, own policy | 4/8 | 150d | 0 | 0 | 0 | 2/8 | — | 629 |
| First parent + vetphantom policy | 4/8 | 150d | 0 | 0 | 0 | 2/8 | — | 629 |
| Reconciled master `743e07d87` + fix | 1/8 | 126d | 0 | 0 | 0 | 2/8 | 7/8 | 615 |
| Merge-cut `e4dbe581b` (reference) | 1/8 | 126d | 0 | 0 | 0 | 2/8 | 7/8 | 621 |
| **Origin `a628aeaf3` + fix (round 4)** | **2/8** | **90d** | **0** | **0** | **0** | **1/8** | **0/8** | **519** |
| **Merge-base `d229b58f5` + fix (round 4)** | **1/8** | **102d** | **0** | **0** | **0** | **0/8** | **0/8** | **669** |

Reading: the collapse AND the rank stall are both already written in the Nov-8 merge-base — they predate Cursor's PR stack #118–121 as such. The PRs did not introduce the collapse; the base they were built on already collapsed. The first parent (4/8, INCONCLUSIVE) still bounds the window from the healthy side: the collapse enters somewhere between `203a32775` and `d229b58f5`. Every leg is its own trajectory from day 2–7 — six legs, six trajectories; the collapse is what this band does on every tree except the vetphantom base. The scale wall stands: national 0, table 0, wins 0 on every leg. Wave-4 unlocks 8/8 everywhere; wave 5 is the choke (0/8 on the merge-base — peak living wave-4+ veterans never exceed 1, bar needs 2). Villages die fighting, not hungry (93–95% combat/expedition/wild deaths on both new legs; starvation 0–1).

## Telemetry deviation check

- Ran as prescribed: `node scripts/telemetry-check.js --baseline <scale-wall.json> --current 'evidence/2026-11-12/perseed-bisect-mergebase-a/*.json' --metrics national,table,wins,exiled` → **REFUSED by the tool itself, exit 0** ("recorder-corpus input … compared with sweep-compare tables, never against a run baseline"). Same refusal class as vetphantom-b, anchor-a, anchor2-a, merge-a, origin-a, and the 0215Z/0615Z/0630Z adoptions. Recorded, not waived; baseline NOT rolled. No LOUD lines. (The scale-wall baseline's own `_regime` note says it is a winseat regime — national 12/16, table 16/16, wins 16/16 — and must not be compared against pre-seat substrates; a comparison would fire a spurious LOUD. Do not roll this baseline from a bisect corpus.)

## Findings carried forward (not chased this run)

1. **Bisect round 5 — cut before Nov 8 (tracker blank #1, next):** the window between firstparent `203a32775` (4/8 INCONCLUSIVE) and merge-base `d229b58f5` (1/8 COLLAPSED) is live. Same 8-seed band, same prereg discipline, keep both the survival rule and the rank rule (they have now split or coincided differently on every leg — merge: collapsed + regional-intact; origin/merge-base: collapsed + stall — and that split is itself the signal to watch). Check the wave-5 choke on the earlier base: does it hold 2 wave-4+ veterans at once? Policy confound is closed in the strong direction for this window: `competent.js` is byte-identical between `d229b58f5` and `203a32775`, so the next cut differs from the firstparent only in game code (plus the controlled standing.js swap).
2. **Vetfirst instrument `/elder/` filter (standing):** the filter mostly catches the foraging-basket line on these legs, not Elderberry — 191 of 193 elder-matching lines on the merge-base leg are the basket line ("The pantry can't take more — sitting with the elders instead.", 46% of the whole capture), and the Pack-leader Big-Eyes scream line repeats 65×. The next arm reusing the instrument should tighten the filter (or drop the basket line from the capture). The Elderberry lesson itself repeats verbatim 10× on one seed while saying "I already showed you this one."
3. **The tribute stays voiceless (standing):** 0 mentions on both new legs, 0/8 tribute-ready — the silence is consistent with the state (no village ever becomes tribute-ready), not a separate defect, but the gate still doesn't talk.
4. **Stale on-disk mcconfirm-ctrl summary:** `evidence/2026-11-11/mcconfirm-ctrl-b-summary.json` still records `mergeLeg.seeds: 8` / `jointRule.mergeSeeds: 8` until the analyzer re-runs with the re-pinned constant; the next analyzer run records 16. Not re-run here — out of the re-pin scope.
5. **Proof-requires-scratch note (process):** bisect proofs that require the vetfirst instrument cannot run on their un-rebased branch after the worker deletes the scratch file. Workers should state this in evidence §9 (mergebase-a does; origin-a did not) so the coordinator is never surprised by a MODULE_NOT_FOUND on adoption. No code change owed.
6. **Loop B stranded arms (NOT this loop's to land):** Loop B run `fleshout-loop-b-20261112T0730Z` was live during this run (sim-proofrefresh-b7 landed `fefc29406` mid-run; sim-synergydisc-b still running at close). Its lock/claim are B's to retire.

## Metric review

- Pre-registered metrics bound the run: each arm's prereg decision rule (≥5/8 / ≤2/8 / 3–4/8, plus the rank rule on the merge-base leg) was honored as written — 2/8 and 1/8 are reported COLLAPSED, 0/8 regional is reported RANK_STALL, not re-judged; no metric was re-scored mid-run.
- The coordinator comment fix (repin-a) changed a comment, not a metric, a threshold, or a verdict. The re-pins changed recorded values to match the runs they describe, not thresholds.
- Telemetry check remains structurally refused for bisect corpora (recorder-corpus class). If the scale-wall baseline is ever to be judged against bisect legs, the tool needs a recorder-vs-baseline path or a regime-segregated baseline — a tooling question for a later run, not a waiver here.

## Convergence state

- **scale-onramp: CONVERGING, NOT converged.** National/table/wins still 0 on every band; the bisect has now ruled OUT Cursor's PR stack #118–121 as the collapse's origin — the collapse and the rank stall are both already in the Nov-8 merge-base — but the collapse's cause is still unlocated (window: `203a32775`..`d229b58f5`) and no lever has moved the wall numbers.
- Claim deleted; lock deleted.
