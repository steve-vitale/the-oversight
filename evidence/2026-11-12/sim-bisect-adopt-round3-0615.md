# sim-bisect-adopt-round3-0615 — ADOPTION of dead 0332Z run, bisect ROUND 3 (Loop A)

- **Run:** fleshout-20261112T0615Z, Loop A, axis scale-onramp — survival-collapse bisect ROUND 3, ADOPTION (not a fresh round: no new sims; the dead run's three arms were recovered, verified, and landed).
- **Coordinator evidence:** `evidence/2026-11-12/sim-bisect-adopt-round3-0615.md` (this file).
- **Master at run start:** `25d9a7c85` (batch-ship version bump). **Master at run end:** `219f9de8e` + this file's commit (see below).
- **Prereg status:** each arm's prereg was committed by its worker BEFORE any judged sim (firstparent-a `b69991084`, swap-a `402e98d9f`, reconciled-a `ca3f1130f` — all verified present on the landed branches). This adoption changed no prereg, no threshold, no seed.

## STALE-LOCK RECOVERY at start

- Lock `fleshout-loop.lock` held run `fleshout-20261112T0332Z`, created 2026-11-12T03:32:36Z. At this run's start (06:15:39Z) the lock was 2h43m old (>90 min fallback) and all three of that run's tree heartbeats were >15 min stale (sim-bisect-firstparent-a 03:33:15Z, sim-bisect-firstparent-swap-a 03:39:38Z, sim-bisect-reconciled-a 03:51:49Z). Previous run DEAD per the guard. Lock deleted, stale-lock recovery noted here; dead claim `fleshout-20261112T0332Z.json` retired to `.DEAD` at run end (after the orphaned work was safely committed).
- Host write flap: PROBED CLEAR at 06:16Z (`git update-ref refs/heads/probe-flap-test HEAD` write+delete OK). The flap that stopped the dead run (~04:21–04:42Z, EPERM waves) had passed. No flap interference during this adoption.
- All five dead-run workers were `done` in the subagent listing (three Loop A arms + two Loop B arms); no live worker, no files modified in the last 15 min in any of the five trees at adoption time.
- Pre-flight: main tree clean at start (`git status --short` empty), disk 42%.

## Arm 1 — sim-bisect-firstparent-a: LANDED `547884cca`

- **Verdict: INCONCLUSIVE — 4/8 survived** (prereg rule: ≥5/8 FIRSTPARENT_SURVIVES, ≤2/8 FIRSTPARENT_COLLAPSES, 3–4/8 INCONCLUSIVE). Base `203a32775` + r131 fix swapped in, own policy. Evidence `evidence/2026-11-11/sim-bisect-firstparent-a.md`.
- **Recovery:** worker's evidence commit never landed (timeout during safe-commit retry). Orphaned evidence committed by coordinator: `814f697b2` (.md + summary) + `bc679ee80` (8 per-seed JSONs). Safe-commit refused the directory pathspec (known: safe-commit.sh takes files, not dirs) — corpus committed by explicit file list. Index clobber struck on BOTH commits (staged-deleted + untracked, then `MM` on the re-pin commit); repaired each time with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe, verified `git status --short` empty + `git diff HEAD` empty + hash-object matches HEAD blobs. Commits always correct.
- **Rebase fix (the one real defect found in adoption):** after rebasing onto `25d9a7c85`, the proof went 59/60 — `legGuardPolicy refuses the current branch policy` failed because journey-landing r127 had moved `scripts/policies/competent.js` (beastStrikeTarget movement-fallback fix) and the test pinned the old branch-policy sha `3c40151e8dd4`. The guard still refused the policy (ok=false); only the recorded sha differed (new sha `17f3e4555d01`, verified on disk and in the r127 diff). Re-pinned the test + driver comments to `17f3e4555d01` (test-only, same assertion strength — no assertion loosened): commit `547884cca`. Proof re-run 60/60 green. Evidence .md/.prereg historical references to `3c40151e8dd4` were left untouched — they correctly record the run-time state.
- **Merge:** ff-only onto `25d9a7c85`, ancestor verified, main clean. Released as done-merged; tree removed, branch deleted.

## Arm 2 — sim-bisect-firstparent-swap-a: LANDED `d6afbd272`

- **Verdict: INCONCLUSIVE — 4/8 survived** (same rule). Base `203a32775` + r131 fix + vetphantom-base `competent.js` (`0801abd82e52`) swapped in. Evidence `evidence/2026-11-11/sim-bisect-firstparent-swap-a.md`.
- **Recovery:** worker was cancelled before finishing; its evidence file existed and was complete (verdict, tables, §9). Discrepancy found and corrected at adoption: the evidence §9 claims "both swaps restored byte-identical afterwards" and "git status shows no src/js or scripts/policies modification" — but the worktree at adoption still had BOTH swaps applied uncommitted (`M src/js/standing.js`, `M scripts/policies/competent.js`) plus the scratch instrument copy present. The worktree state is authoritative: the diffs were verified to be exactly the documented swaps (standing.js +7 ROSTER CHECK lines; competent.js +51/−1 COUNTER ANSWER addition), then restored with `git checkout HEAD --` (shas verified: standing.js `75762cb2259d…`, competent.js `a7ff5c516440…`), and the scratch instrument (byte-identical to master's `311f105b…`) was deleted per the prereg. No src/js change by this arm; no game-code change.
- **Evidence commit:** `079c24a20` (.md + summary + 8 per-seed JSONs, one commit — explicit file list). Index clobber struck (all 10 files staged-deleted + untracked); repaired, verified clean.
- **Rebase + proof:** rebased onto `547884cca` clean; proof 51/51 green on the rebased tree with NO re-pin needed (its pins are the old base's values, not master's moving policy sha).
- **Merge:** ff-only onto `547884cca`, ancestor verified, main clean. Released as done-merged; tree removed, branch deleted.

## Arm 3 — sim-bisect-reconciled-a: LANDED `219f9de8e`

- **Verdict: COLLAPSE_CONFIRMED — 1/8 survived** (prereg rule ≤2/8). Base `743e07d87` (the SHIPPED reconciled master) + r131 fix swapped in, competent verbatim from the base. Evidence `evidence/2026-11-11/sim-bisect-reconciled-a.md`.
- **Recovery:** worker's evidence commit never landed (timeout). Orphaned evidence committed by coordinator: `630744fde` (.md + summary + 8 per-seed JSONs, explicit file list). Index clobber struck (all 10 files); repaired, verified clean. The vetfirst instrument is tracked on the branch — no scratch handling needed.
- **Rebase + proof:** rebased onto `d6afbd272` clean; proof 50/50 green on the rebased tree, no re-pin needed.
- **Merge:** ff-only onto `d6afbd272`, ancestor verified, main clean. Released as done-merged; tree removed, branch deleted.

## Verification at master tip (`219f9de8e`)

- All three analyzers re-run against the committed corpora: verdicts reproduce (firstparent 4/8 INCONCLUSIVE, swap 4/8 INCONCLUSIVE, reconciled 1/8 COLLAPSE_CONFIRMED); analyzer runs left `git status` clean (summaries byte-identical).
- All three proofs green on the tip: 60/60 + 51/51 + 50/50.
- Main tree clean at run end; no push, no version bump — merged locally, pending ship.

## Wall numbers (bisect round 3, seeds 190391–190398, 150d, competent)

| Leg | Survived | Median | Wins | National | Table | Wave 5 | Deaths |
|---|---|---|---|---|---|---|---|
| Vetphantom fix leg `5157782a4` (reference) | 6/8 | 150d | 0 | 0 | 0 | 3/8 | 707 |
| First parent `203a32775` + fix, own policy | 4/8 | 150d | 0 | 0 | 0 | 2/8 | 629 |
| First parent + vetphantom policy | 4/8 | 150d | 0 | 0 | 0 | 2/8 | 629 |
| Reconciled master `743e07d87` + fix | 1/8 | 126d | 0 | 0 | 0 | 2/8 | 615 |
| Merge-cut `e4dbe581b` (reference) | 1/8 | 126d | 0 | 0 | 0 | 2/8 | 621 |

Reading: the collapse reproduces on the SHIPPED reconciled master — it was not a stale-cut artifact. The reconciled leg's band is trajectory-identical to the anchor band on all 8 seeds. The first parent sits mid-band (4/8, INCONCLUSIVE on both policies): the collapse is neither already written in the first parent nor absent from it. The merge-cut's H1/H2 question (origin-side content vs a protective local commit the merge predates) is still open — the first-parent legs cannot distinguish them, and neither can the reconciled leg. The scale wall stands: national 0, table 0, wins 0 on every leg.

## Telemetry deviation check

- Ran as prescribed: `node scripts/telemetry-check.js --baseline <scale-wall.json> --current 'evidence/2026-11-11/perseed-bisect-reconciled-a/*.json' --metrics national,table,wins,exiled` → **REFUSED by the tool itself, exit 2** ("recorder-corpus input … compared with sweep-compare tables, never against a run baseline"). Same refusal class as vetphantom-b, anchor-a, anchor2-a, and the 0215Z adoption. Recorded, not waived; baseline NOT rolled. No LOUD lines. (Separately, the scale-wall baseline's own `_regime` note says it is a winseat regime — national 12/16, table 16/16, wins 16/16 — and must not be compared against pre-seat substrates; a comparison would fire a spurious LOUD. Do not roll this baseline from a bisect corpus.)

## Findings carried forward (not chased this run)

1. **Stale pin class (landed fix above, one instance left):** `scripts/bisect-policyswap-driver-20261111.js:56` pins `CURRENT_POLICY_SHA = '3c40151e8dd4…'` — the same journey-r127 policy move that broke firstparent-a's proof. The policyswap arm is already landed; its proof will fail the same way if re-run on current master. Next run that touches it should re-pin to `17f3e4555d01` the same way (test-only, same assertion strength). Not fixed here — different arm's file, out of this adoption's scope.
2. **Loop B stranded arms (NOT this loop's to land):** Loop B run `fleshout-b-2026-11-12T03:29Z` (lock `fleshout-loop-b.lock`, 03:29:05Z; claim `fleshout-b-2026-11-12T03:29Z.json` still live) also died on the same timeout/flap. Its arms are INCOMPLETE, not just uncommitted: sim-mcconfirm-ctrl-b (commit `7697570a`, prereg+instrument+proof; per-seed dir present, no evidence .md) and sim-mcconfirm-merge-b (commit `6c8c88bc5`; 15/16 per-seed files, `src/js/standing.js` still modified with the fix swap). Left untouched for Loop B's own next run to adopt; its lock/claim are B's to retire.
3. **Adoption lesson:** a worker's §9 "restore verified" claim is not evidence the restore happened — the swap-a tree proved it. Adoption must verify restore by sha + status, never by the evidence text alone.
4. **safe-commit.sh still takes no directory pathspecs** (failed on `perseed-*/` again) and the index clobber struck on 4 of 5 adoption commits (both variants: staged-deleted + untracked, and `MM`). The `ls-tree -r` repair held every time; commits were always correct. No action — known classes, documented.

## Metric review

- Pre-registered metrics bound the run: each arm's prereg decision rule (≥5/8 / ≤2/8 / 3–4/8) was honored as written — both 4/8 legs are reported INCONCLUSIVE, not re-judged; the 1/8 reconciled leg is COLLAPSE_CONFIRMED. No metric was re-scored mid-run.
- The re-pin (firstparent-a) changed a test's pinned sha, not a metric, a threshold, or a verdict. The verdict stands on the corpus the analyzer reproduces from the committed files.
- Telemetry check remains structurally refused for bisect corpora (recorder-corpus class). If the scale-wall baseline is ever to be judged against bisect legs, the tool needs a recorder-vs-baseline path or a regime-segregated baseline — a tooling question for a later run, not a waiver here.

## Next blanks, in order

1. **Bisect round 4 — cut the collapse inside `5157782a4..3f136f07e` game code:** the first parent is inconclusive (4/8 both policies) and the shipped master collapses (1/8). The next cut is a midpoint leg (or a suspect-commit leg) in that window, same 8-seed band, same prereg discipline. Do not pre-claim it while this adoption's claim is live; the next run plans it.
2. **Synergy fix shape** (design question, carried from 0215Z): needs a Steve call or a dedicated build arm.
3. **The three 0130Z findings** (claimed by Loop A's sim-findings-a, in flight at 0215Z): status unknown to this adoption — next run to check whether they landed.
4. **Policyswap-driver stale pin** (finding 1 above): one-line re-pin, next run that touches the file.
5. **Loop B mcconfirm arms** (finding 2 above): B's adoption, not A's.

## Convergence state

- **scale-onramp: CONVERGING, NOT converged.** National/table/wins still 0 on every win-seeking band; the bisect has now confirmed the collapse on the shipped tree and cut it to game code in `5157782a4..3f136f07e` with the policy confound exonerated — but the collapse's cause is still unlocated and no lever has moved the wall numbers.
- Claim deleted; lock deleted.
