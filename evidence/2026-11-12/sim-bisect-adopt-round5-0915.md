# sim-bisect-adopt-round5-0915 — Loop A 0915Z coordinator evidence: bisect ROUND 5 — collapse still in at 2/3, stall lifts in the first third

Run: `fleshout-20261112T0915Z` (Loop A, 2026-11-12 03:15 CST / 09:15Z).
Axis: scale-onramp. Base at run start: master `ad2bd13fd` (Loop B synergydisc-b telemetry note).
Loop B live on its 0730Z claim (sim-proofrefresh-b7 + sim-synergydisc-b) — NOT touched; B landed its coordinator evidence as `4a61100dd` mid-run and closed out. No new food-economy arm (parked). Coverage program complete on measurement.

## Pre-flight

- No A lock at run start; lock created 09:15Z, claim written before any sims.
- Main tree at run start: 1 untracked file, Loop B 0730Z run's evidence (`evidence/2026-11-12/sim-winnability-round-0730.md`), left untouched by this run; Loop B committed it as `4a61100dd` during this run, so the main tree is clean at closeout. Disk 36%; `worktree-reap.sh` ran (10/16 active; LOUD lines only other owners' uncommitted trees, untouched).
- Window verified by the coordinator at run start: `d229b58f5` IS an ancestor of `203a32775` (the tracker wrote the window as `203a32775..d229b58f5`, which reads backwards — the live window is `d229b58f5..203a32775`, 393 commits). Tertile cuts computed from `git rev-list --reverse`: 131st `6dc7f8162`, 262nd `2215e22d4`.
- Policy confound closed in the strong direction for the whole window: `competent.js` sha `a7ff5c516440` identical on `d229b58f5`, both cuts, and `203a32775`. r131 roster-check fix (`5d16916f4`) is NOT an ancestor of either cut — both legs needed the standing.js fix swap, same as origin-a/mergebase-a.
- Registration was slow (~10 min per `worktree add` on this box); a runtime restart killed the first registration after cut 1 only — cut 2 was unregistered with no stale lock, recovered by re-running the second registration alone. Heartbeats sent 09:50:20Z / 09:52:04Z.

## Arm 1 — sim-bisect-r5-cut1-a: LANDED `a46fa9283`

- **Verdict: CUT1_COLLAPSED — 2/8 survived + REGIONAL_INTACT — 8/8 regional** (prereg survival rule ≥5/8 HEALTHY, ≤2/8 COLLAPSED; rank rule ≥5/8 REGIONAL_INTACT, ≤2/8 RANK_STALL). Base `6dc7f8162` (131st commit, 2026-11-08 20:04, sim-tenddrive-a corpus) + r131 fix swapped in, competent verbatim. Evidence `evidence/2026-11-12/sim-bisect-r5-cut1-a.md`. Median 110d, deaths 709 (highest of any leg), wave-5 **2/8**, wave-4 8/8, standing 199–275, blooded 1/8.
- **The split:** the collapse is in the first third of the window — and the rank stall is NOT. It lifts between the merge-base (0/8 regional) and this cut while the collapse persists (1/8 → 2/8). The two defects separate here: the stall's window is now the 131 commits `d229b58f5..6dc7f8162`; the collapse's window is not narrowed by this leg.
- **Wave-5 choke, refined:** peak 2 living wave-4+ veterans on FOUR seeds, so the merge-base's "never two veterans" choke does not hold here. 190392 + 190397 unlock wave 5; 190395 holds the pair 12 straight days (d138–149) blocked only by weapons (armed 4 vs demand 6); 190393 meets **every** wave-5 readiness bar for 2 days (d69–70) and still never unlocks — an open question for the next cut, not a defect claim.
- **Trajectory:** seventh distinct trajectory, except seed 190398 which runs the merge-base's trajectory for 52 days before diverging (d53) — the closest match in the bisect.
- **Fix + instrument:** 0 phantom days, 0 shadow-prevented days on all 8 seeds. This base's ladder is a third scholar rule in the bisect (LEG 3: scholar NEVER counted); the proof detects it and asserts the matching count. The `\belder\b` tightening worked: foraging-basket line 191→0, but it also drops the genuine Elderberry teaching line from the capture (2→0) — teaching is unobserved here, not absent. Pack-leader scream line 0 (was 65). ARC IV fires on all 8 seeds (merge-base: none). Tribute/table/seat still voiceless (0 mentions).
- **Adoption verification:** `standing.js` at tip AND on disk = `98c8bfad70d7…` (byte-identical to the base pre-fix file), `git status` clean, corpus 8/8, analyzer re-run exit 0 with verdict reproducing, proof 63/63 on the rebased tree and on the master tip. No `src/js` change.
- **Merge:** rebased onto `0436a04e0` clean (3/3, no quirk), proof 63/63 + analyzer exit 0 on the rebased tree, ff-only merged, ancestor verified, tip `a46fa9283`. Released as done-merged; tree removed, branch deleted.

## Arm 2 — sim-bisect-r5-cut2-a: LANDED `38ea91902`

- **Verdict: CUT2_COLLAPSED — 2/8 survived + REGIONAL_INTACT — 8/8 regional.** Base `2215e22d4` (262nd commit, 2026-11-09 17:48, journey-establishment r117) + r131 fix swapped in, competent verbatim. Evidence `evidence/2026-11-12/sim-bisect-r5-cut2-a.md`. Median 144d, deaths 689, wave-5 **4/8**, wave-4 8/8, standing 199–435, blooded 0/8.
- **The collapse lifts gradually, no single step:** cut 2 sits much closer to the firstparent — seeds 190395 and 190396 are byte-identical to the firstparent leg (deep-equal daily snapshots, 0 diffs; only `vetSays` differs, from the filter change); other seeds diverge from the firstparent on day 16–109 or never, vs day 2–7 from the collapsed legs. Survival 2/8 sits between the merge-base (1/8) and the firstparent (4/8). The transition out of collapse — if there is one — sits in the final third (commits 263–393).
- **Wave-5 choke:** peak living wave-4+ veterans 2, 1, 2, 1, 1, 1, 2, 2 — exactly the four seeds holding 2 at once unlock wave 5. The choke is now a two-veteran coincidence problem, not a pipeline problem (first wave-4+ veteran lands d51–d105 on all 8 seeds; tribute-ready 0/8 at end — the pair never survives to the end).
- **Fix + instrument:** 0 phantom days on all 8 seeds; shadow-prevented **4 days on 190392** — first nonzero shadow read in the bisect since anchor2-a; the fix visibly bites on exactly the seed that survives longest with the thinnest roster. Scream-freeze line repeats 65× ("The Scarred The Focus Group is still frozen from your scream"); "Sa strikes the Elder The Callback" 11× on one day (Sa Loan is a real villager, not a truncation bug). ARC IV fires on all 8 seeds. Tribute/table/seat still voiceless (0 mentions).
- **Adoption verification:** `standing.js` at tip AND on disk = `98c8bfad70d7…`, `git status` clean, corpus 8/8, analyzer re-run exit 0 with verdict reproducing, proof 63/63 on the rebased tree and on the master tip. No `src/js` change.
- **Merge:** rebased onto `a46fa9283` — the rebase STOP-AT-PICK quirk struck on the 2nd pick (0c1c43ef in BOTH done and todo lists, tree clean). Verified unapplied DEFINITIVELY (the `20261111` require-path suffixes still present in the HEAD tree), then `git rebase --continue` sailed through the remaining picks; final log shows each commit exactly once. Proof 63/63 + analyzer exit 0 on the rebased tree, ff-only merged, ancestor verified, tip `38ea91902`. Released as done-merged; tree removed, branch deleted.

## Verification at master tip (`38ea91902`)

- Both analyzers re-run against the committed corpora: verdicts reproduce (cut 1: 2/8 CUT1_COLLAPSED + 8/8 REGIONAL_INTACT, median 110d; cut 2: 2/8 CUT2_COLLAPSED + 8/8 REGIONAL_INTACT, median 144d); analyzer runs left `git status` clean (summaries byte-identical).
- Both proofs green on the tip: 63/63 + 63/63.
- Main tree clean at run end; no push, no version bump — merged locally, pending ship.

## Wall numbers (bisect round 5, seeds 190391–190398, 150d, competent)

| Leg | Survived | Median | Wins | National | Table | Wave 5 | Regional | Deaths |
|---|---|---|---|---|---|---|---|---|
| Vetphantom fix leg `5157782a4` (reference) | 6/8 | 150d | 0 | 0 | 0 | 3/8 | 8/8 | 707 |
| First parent `203a32775` + fix, own policy | 4/8 | 150d | 0 | 0 | 0 | 2/8 | 7/8 | 629 |
| Reconciled master `743e07d87` + fix | 1/8 | 126d | 0 | 0 | 0 | 2/8 | 7/8 | 615 |
| Merge-cut `e4dbe581b` (reference) | 1/8 | 126d | 0 | 0 | 0 | 2/8 | 7/8 | 621 |
| Origin `a628aeaf3` + fix (round 4) | 2/8 | 90d | 0 | 0 | 0 | 1/8 | 0/8 | 519 |
| Merge-base `d229b58f5` + fix (round 4) | 1/8 | 102d | 0 | 0 | 0 | 0/8 | 0/8 | 669 |
| **Cut 1 `6dc7f8162` + fix (round 5)** | **2/8** | **110d** | **0** | **0** | **0** | **2/8** | **8/8** | **709** |
| **Cut 2 `2215e22d4` + fix (round 5)** | **2/8** | **144d** | **0** | **0** | **0** | **4/8** | **8/8** | **689** |

Reading: the collapse is still written in at the 2/3 mark on both cuts, but it lifts GRADUALLY — median survival climbs 102d → 110d → 144d → 150d across merge-base → cut 1 → cut 2 → firstparent, and wave-5 unlocks climb 0/8 → 2/8 → 4/8 → 2/8. There is no single-step transition in this band; the firstparent itself is only 4/8 INCONCLUSIVE, so the "healthy" pole of this window was never healthy. The rank stall is a separate, smaller defect: 0/8 on the merge-base and origin, 8/8 on both round-5 cuts — its window is the first 131 commits. The scale wall stands: national 0, table 0, wins 0 on every leg. Villages die fighting, not hungry (93–95.5% combat/expedition/wild deaths on both new legs; starvation 1–3).

## Telemetry deviation check

- Ran as prescribed: `node scripts/telemetry-check.js --baseline <scale-wall.json> --current 'evidence/2026-11-12/perseed-bisect-r5-cut1-a/*.json' --metrics national,table,wins,exiled` → **REFUSED by the tool itself, exit 2** ("recorder-corpus input … compared with sweep-compare tables, never against a run baseline"). Same refusal class as vetphantom-b, anchor-a, anchor2-a, merge-a, origin-a, mergebase-a, and the 0215Z/0615Z/0630Z/0815Z adoptions. Recorded, not waived; baseline NOT rolled. No LOUD lines.

## Findings carried forward (not chased this run)

1. **Bisect round 6 — cut in the final third (tracker blank #1, next):** commits 263–393 of `d229b58f5..203a32775` (e.g. the ~328th commit). Read it against BOTH ends: a ≥5/8 localizes the collapse's exit; a 3–4/8 says the window's far end never was healthy and the healthy pole needs re-finding outside this window. Keep both survival and rank rules, plus the wave-5 choke checks (weapons-blocked pair; fully-ready-but-unlocked).
2. **Rank-stall window now 131 commits (`d229b58f5..6dc7f8162`):** a stall-localizing cut could run inside it, or the stall can sit as a narrowed window while the collapse hunt continues in the final third.
3. **Wave-5 fully-ready-but-unlocked (cut 1, seed 190393, d69–70):** open question, not a defect claim — check recurrence on the next cut.
4. **Synergy fix shape (design question — Steve call or dedicated build arm):** still open; Loop B's synergydisc-b landed the dawn-resonance discovery fix this morning, which is a different piece (discovery triggers, not the fix shape question).
5. **`\belder\b` filter cost:** the Elderberry teaching line has left the capture (0 hits on both legs) — teaching spread is unobserved in the capture, not absent. The next arm reusing the driver should know this, and the filter's monster-title "Elder" hits (48 on cut 2) are the new noise.
6. **Tribute stays voiceless (standing):** 0 mentions on both new legs, 0/8 tribute-ready at end — the silence is consistent with the state (no village ever becomes tribute-ready), not a separate defect.
7. **Proof-requires-scratch note (process):** both proofs require the vetfirst instrument scratch file deleted per prereg; the coordinator re-ran both after rebase onto master, where the instrument exists. Expected pattern, unchanged.

## Metric review

- Pre-registered metrics bound the run: each arm's prereg decision rules (≥5/8 / ≤2/8 / 3–4/8, plus the rank rule) were honored as written — 2/8 is reported COLLAPSED and 8/8 regional is reported REGIONAL_INTACT on both legs, not re-judged; no metric was re-scored mid-run.
- The rebase stop-at-pick quirk on cut 2 changed no metric, threshold, or verdict — the continue applied the exact same picks; the final log shows each commit once.
- Telemetry check remains structurally refused for bisect corpora (recorder-corpus class). If the scale-wall baseline is ever to be judged against bisect legs, the tool needs a recorder-vs-baseline path or a regime-segregated baseline — a tooling question for a later run, not a waiver here.
- Infrastructure: safe-commit index clobber struck on all worker commits (both variants) — repaired every time with the ls-tree -r pipe, commits always correct. Registration is slow (~10 min per worktree add); a runtime restart mid-registration is recoverable by re-running the missing registration alone. The tracker window direction (`203a32775..d229b58f5`) reads backwards — the live window is `d229b58f5..203a32775`; the next run's blank should state it that way.

## Convergence state

- **scale-onramp: CONVERGING, NOT converged.** National/table/wins still 0 on every band; the bisect has now split the collapse from the rank stall (collapse spans the window so far, stall confined to the first 131 commits) and shown the collapse lifting gradually toward the firstparent — but no lever has moved the wall numbers, and the firstparent itself is only 4/8 INCONCLUSIVE, so the collapse's exit is still unlocalized (final third, commits 263–393).
- Claim deleted; lock deleted.
