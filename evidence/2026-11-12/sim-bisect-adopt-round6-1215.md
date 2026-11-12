# sim-bisect-adopt-round6-1215 — adoption of the dead 1042Z run: bisect ROUND 6 + stall-cut LANDED

- **Run:** fleshout-2026-11-12T121809Z, Loop A, axis scale-onramp (stale-lock recovery + adoption; no new arms spawned this run)
- **Adopted run:** fleshout-20261112T1042Z (Loop A) — its coordinator died before landing; both workers had finished and committed
- **Arms landed:** sim-bisect-r6-cut-a (ROUND 6 collapse cut) + sim-stallcut-a (rank-stall window cut)
- **Master at adoption:** `f1e603219` → `24ada3661` (r6) → `56954c440` (stallcut); both ff-only, no merge commits
- **No game-code change by either arm — [needs-eyes] does not apply.**

## Stale-lock recovery (guard, verified not assumed)

- Lock `fleshout-20261112T1042Z` created 10:42:00Z; this run read it at 12:15:44Z — **94 min old** (>90-min fallback).
- Registry heartbeats at 12:16Z: sim-bisect-r6-cut-a 11:26:47Z (**50 min stale**), sim-stallcut-a 11:59:06Z (**17 min stale**) — both >15 min, so the 1042Z run is DEAD per the concurrency guard.
- Recovery: lock deleted, claim retired to `fleshout-20261112T1042Z.json.DEAD` + `.note`, my lock + claim created (`fleshout-2026-11-12T121809Z`, axis scale-onramp, arms the two adopted slugs).
- Loop B live on its 1130Z claim (winnability-chain: sim-cut2confirm-b + sim-mcconfirm-refresh-b) — NOT touched. B's trees heartbeated 12:13Z (3 min fresh) at my first check.
- Pre-flight: main tree clean at run start, disk 41%. `worktree-reap.sh` ran (76s, exit 0): removed nothing; 14/16 active; both adopted trees listed active. Reaper threshold is 4h staleness, so the 17/50-min-stale A trees were never at risk from it.
- `git fetch origin master`: origin/master `839250558` IS an ancestor of local HEAD — local master is 4 commits ahead (normal merged-locally-pending-ship state), not stale. Rebase target stayed local tip `f1e603219`.

## Adoption verification (coordinator re-verified, not taken on the workers' word)

- **Preregs read:** both committed before any judged sim (`e0a44c4b2` r6 / `83b1e61f8` stallcut). Verdicts match the prereg decision rules exactly: r6 2/8 → CUT6_COLLAPSED (≤2/8), 8/8 regional → REGIONAL_INTACT (≥5/8); stallcut 0/8 → STALLCUT_COLLAPSED, 8/8 regional → STALL_LIFTED.
- **Corpus spot-check (independent):** all 16 per-seed JSONs parse; days match the evidence §1 tables cell-for-cell (r6: 114/150/149/127/150/87/144/123; stallcut: 83/123/126/138/130/102/94/114); `standingSha f8fda4295a99` on every seed; 0 instrument errors on every seed. Survival counts derived from days agree: r6 2/8 (150d on 190392, 190395), stallcut 0/8.
- **Diff-stat:** both branches scripts/evidence only (14 files each, all insertions) — no `src/js`, no game-code change. The fix-swap files were restored byte-identical by the workers (sha `98c8bfad70d7…`, `cmp` clean); both worktrees were clean at adoption.
- **Landing:** r6 rebased onto `f1e603219` clean (2 commits → `29218a7f5`, `24ada3661`), proof re-run **63/63 green** on the rebased tree, ff-merged. Stallcut rebased onto `f1e603219` clean (3 commits), proof **63/63 green**, then re-rebased onto the new tip `24ada3661` after the r6 merge (ff-only discipline: the second merge could not fast-forward otherwise), proof re-run **63/63 green**, ff-merged. No rebase stop-at-pick quirk struck on either rebase. `git merge-base --is-ancestor` verified for both branches after merging.

## Verdicts landed

### Arm 1 — sim-bisect-r6-cut-a: CUT6_COLLAPSED 2/8 + REGIONAL_INTACT 8/8

Base `c7786d567` (328th commit of `d229b58f5..203a32775`), 8 seeds 190391–190398, 150d death-aware, competent verbatim, r131 fix swapped in. Evidence `evidence/2026-11-12/sim-bisect-r6-cut-a.md` (landed `24ada3661`). Proof `scripts/test-bisect-r6-cut-a.js` 63/63.

- **The headline is the identity:** the round-6 corpus is deep-identical to round-5 cut-2's corpus on all 8 seeds (0 daily diffs, identical deaths, kill calls, dialogue). Commits 263–328 are behaviorally inert on this band. The collapse's live window is now **65 commits (329–393)**, not 131.
- Wall on this leg: survived 2/8, median 144d, deaths 689, wins 0, national 0, table 0, wave-5 4/8, wave-4 8/8, regional 8/8, blooded 0/8. Same four seeds unlock wave 5 as cut-2 (peak living wave-4+ veterans reach 2 exactly there) — the wave-5 choke stays a two-veteran coincidence problem.
- Fix holds (0 phantom days by the engine's rule); shadow-prevented 4 days on seed 190392 — first nonzero shadow read since anchor2-a. Tribute 0/8 ready at end; tribute still voiceless (0 mentions). ARC IV fires on all 8 seeds.

### Arm 2 — sim-stallcut-a: STALLCUT_COLLAPSED 0/8 + STALL_LIFTED 8/8

Base `a18d7438c` (65th commit of `d229b58f5..6dc7f8162`), same band/horizon/policy/fix-swap. Evidence `evidence/2026-11-12/sim-stallcut-a.md` (landed `56954c440`). Proof `scripts/test-bisect-stallcut-a.js` 63/63.

- **The rank stall lifts in the first 65 commits.** Regional 8/8 vs merge-base 0/8 — the stall window is now commits 1–65, and the next stall cut goes to its midpoint (~32nd commit). The lift happens WITHOUT an early trajectory break: this cut tracks the merge-base for 25–62 days on every seed and still leaves village rank on all 8.
- **The collapse deepens here:** 0/8 survived, median 123d, deaths 724 — the worst survival count and the highest death count of any bisect leg. Wave-5 opens once (190396, the only seed holding 3 wave-4+ veterans at once with all bars met 9 straight days). Cut-1's fully-ready-but-unlocked case does NOT recur — the only seed meeting all wave-5 bars unlocks.
- Fix holds (0 phantom days); shadow-prevented 0 days — the fix does no visible work on this band. The scholar carries the veteran bar alone at end on two seeds (190392, 190398 — readiness 1, ladder 0 under LEG 3): live data for the tribute bar's scholar question.
- New small blank from §6 (already in `sim-findings.md` 2026-11-12): "A Elder veteran" grammar slip (3 hits) — one-word template fix, no sim impact.

## Wall numbers (same band, 150d)

| Leg | Survived | Median | Deaths | National | Table | Wins | Wave-5 | Regional |
|---|---|---|---|---|---|---|---|---|
| vetphantom fix leg | 6/8 | 150d | 707 | 0 | 0 | 0 | 3/8 | 8/8 |
| merge-base | 1/8 | 102d | 669 | 0 | 0 | 0 | 0/8 | 0/8 |
| cut-1 (131st) | 2/8 | 110d | 709 | 0 | 0 | 0 | 2/8 | 8/8 |
| cut-2 (262nd) | 2/8 | 144d | 689 | 0 | 0 | 0 | 4/8 | 8/8 |
| **round-6 cut (328th)** | **2/8** | **144d** | **689** | **0** | **0** | **0** | **4/8** | **8/8** |
| **stall-cut (65th of stall window)** | **0/8** | **123d** | **724** | **0** | **0** | **0** | **1/8** | **8/8** |
| firstparent | 4/8 | 150d | 629 | 0 | 0 | 0 | 2/8 | 7/8 |

The two defects are now fully separated: the rank stall lives in commits 1–65 of the window; the survival collapse is still written in at the 328th commit and lifts only gradually toward the firstparent (median 102d → 110d → 144d → 150d across merge-base → cut-1 → cut-2 → firstparent, with cut-6 identical to cut-2). The firstparent itself is only 4/8 INCONCLUSIVE — the window's far end was never healthy. Villages die fighting, not hungry, on both new legs (93–95% combat/expedition/wild deaths; starvation 1–2).

## Metric review (§14)

- Both prereg rule sets did their job and were never re-scored: survival ≤2/8 → COLLAPSED on both legs, regional ≥5/8 → INTACT/LIFTED on both. The split (collapsed + regional-intact) is now the standing shape on cut-1, cut-2, round-6, and the stall-cut — the split itself is the signal.
- The deep-identity finding (§2 of the r6 evidence) is a metric-adjacent lesson for the next cut: when two cuts read identical corpora, the analyzer's verdict is unchanged but the window narrows by the full inert span — the next cut's window is 65 commits, not 131.
- Panel (§15): N/A on both arms — instrument-only single legs, no code change. Same standing as all prior bisect arms.
- Telemetry deviation check: attempted by the coordinator on both merged corpora (r6 + stallcut globs, `--metrics national,table,wins,exiled`) and REFUSED by the tool on both — same recorder-corpus class as every prior bisect arm ("all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs"). Recorded, not waived; no LOUD lines; baseline NOT rolled (no `--update-baseline`). Same refusal the workers recorded in their §7s.
- Proof: 63/63 on both arms, re-run by the coordinator on the rebased trees (and again on the re-rebased stallcut tree) — not taken on the workers' word.
- `check.js --quick` on merged master: **321 passed, 19 failed in 2575s (~43 min)** — run under extreme box load (load avg peaked 23.6; Loop B's 16-seed confirm driver + the playtest loop's own check.js ran concurrently). The 3 slowest are all exactly the 120s per-test cap (`test-occupation-panels.js`, `test-synergy-stall.js`, `test-table-endings-20261014.js`), and the one FAIL visible in the tail shows the test's own assertions passing before `[check.js] TIMEOUT after 120s` — a CPU-starvation timeout, not an assertion failure. That matches the 0930Z run's signature (334/6, 4× 120s timeouts). Coordinator verification of the three slowest: each re-run standalone via `check.js --quick --only` AFTER the full run — test-table-endings-20261014.js 1 passed in 59s, godpath/test-occupation-panels.js 1 passed in 64s, test-synergy-stall.js 1 passed in 58s — all three 120s failures were CPU-starvation timeouts, not assertion failures. The full 19-name list was lost to `tail -25` buffering — no log file was kept; the next run should re-run check.js --quick to a file to classify the remaining 16 failures. None of the 19 is attributable to these arms on the evidence available: the arms' diff is scripts/evidence-only (no src change), the suite's 340-script count is unchanged from the 0930Z run (the two new arm proofs are not in the quick list), and no test enumerates scripts/ or enforces green-list completeness — the two "green-list" mentions are comments, and the readdir-using tests read src/data, evidence corpora, or src/js, none of which these arms touch.

## Follow-up owed — round 7 design (handed to the next run, not spawned here)

This run adopted and landed; it did not spawn a round-7 pair (adoption + closeout filled the hour; the next scheduled run takes the design below). Both cuts are fully specified in the landed evidence §8s:

1. **Collapse cut (~360th commit):** cut near the middle of the final 65 commits (329–393) of `d229b58f5..203a32775`, same 8-seed band, same survival + rank rules, same fix-swap. Read against BOTH ends: ≥5/8 localizes the collapse's exit; 3–4/8 says the far end never was healthy and the healthy pole needs re-finding outside this window; 2/8 again says the collapse lifts only in the last ~30 commits, if at all. Keep checking both wave-5 choke cases (weapons-blocked pair; fully-ready-but-unlocked) against the new corpus.
2. **Stall cut (~32nd commit):** midpoint of commits 1–65 (`d229b58f5..a18d7438c`), same band/rules/swap. The stall's transition sits in the first 65 commits; the next cut halves that window. Look at link/regional formation code in the first 65 commits, not survival levers — the stall lifts without moving early trajectories.
3. Standing items carried forward, unchanged: tribute voiceless (0 mentions, 0/8 tribute-ready on both legs); scream-freeze line repeats 65× on both legs (same freeze-callout family, different monster name each leg); "A Elder veteran" grammar (sim-findings.md, one-word fix); scale wall stands (national 0, table 0, wins 0 on every leg); ARC IV fires on all 8 seeds on both legs; measurement-proof refresh round 9 still owed on the next manifest change (b8 staled by the next manifest change after it — see 0930Z review); stale mcconfirm-ctrl summary still open (mergeLeg.seeds 8).
4. What this run does NOT re-judge: survivalcontrol MASTER_CHANGE, anchor, mournblooded, merge-a COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED, mergebase-a MERGEBASE_COLLAPSED + RANK_STALL, r5-cut1-a, r5-cut2-a — all stand. This run adds: r6 CUT6_COLLAPSED + REGIONAL_INTACT, stall-cut STALLCUT_COLLAPSED + STALL_LIFTED.

## Infrastructure notes

- Heartbeat scripts queued ~60–90s behind the reaper's REGISTRY.lock (known contention; the reaper held it for its 76s run). Both A heartbeats landed before the rebases.
- No write flap hit this run. No safe-commit index clobber on the adoption merges (no commits made by the coordinator except this evidence file — see below).
- `git status` clean in both worktrees at every step; main tree clean after both merges.
- Coordinator evidence: this file (`evidence/2026-11-12/sim-bisect-adopt-round6-1215.md`).
- Claim deleted; lock deleted at closeout (see tracker entry).
