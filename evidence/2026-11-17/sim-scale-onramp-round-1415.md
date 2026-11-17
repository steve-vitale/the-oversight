# sim-scale-onramp-round-1415 — STALE-LOCK RECOVERY + 2 DIAG ADOPTIONS, both LANDED, merged locally pending ship

**Run:** fleshout-20261117T1415Z · **Axis:** scale-onramp (converging) · **Loop B live on
winnability chain the whole run (1409Z claim: nondeathplan adoption + live-observation)
— NOT touched.**

## Stale-lock recovery

Lock `fleshout-20261117T1215Z` (created 12:44:20Z) was 116 min old at run start
(14:40Z); its trees' heartbeats were 42 min (sim-launchfunnel-a) and 95 min
(sim-part2night-a) stale — dead by the 15-min guard, and past the 90-min
fallback. Lock deleted, 1215Z claim retired to `.DEAD`. Last file writes in
the adopted trees (14:35Z launchfunnel, 14:27Z part2night) were quiet for
>15 min before adoption touched them. No lock at start after recovery; claim
written before any adoption work. Pre-flight: main tree clean, disk 47%,
reap ran (11/16 active, no trees removed — all active or uncommitted).

Master moved twice under the run (journey-social-life r234 39eaa043e landed
mid-run by the playtest loop; both arm merges after it). No overlap, no
interference either way.

## Arm 1 — sim-launchfunnel-a (adoption, DIAG GO, merged 7595ff0b9)

Stranded 1215Z arm: instrument committed (d922f8f02, proof 44/44), corpus
3 legs × 8 seeds complete, analysis.json GO — worker died before the panel
and the evidence file. Adoption verified, not re-ran, the judged numbers:
proof re-run 44/44 green; analyzer re-run reproduces the analysis
byte-identical; D3 drift check re-run CLEAN on all 8 seeds; the OFF→VRE
panel was built by the adoption (the worker's only missing bar-5 artifact).
Evidence committed b70faa18e (rebased tip 7595ff0b9), proof re-verified
44/44 after rebase, panel re-built post-rebase byte-identical.

**Answer (trickteach-b's named next step): the funnel's binding stage is the
dawn bid via an empty companion pool.** 12 instances on the census leg:
candidate-not-bid 8 (66.7%, no-companion-party 7), launched-no-meeting 2,
plan-churned 1, launched-fought-no-kill 1, bid-not-selected 0,
selected-blocked 0, launched-killed 0. Pool: 81/87 scored dawns with zero
eligible companions. On master default the funnel does not exist (0
instances in 8 villages). The one launched fight (sofia_chen d60 vs eulogy)
dealt 77 of ~909 HP (8.5%) and fled at 2 HP. Panel OFF→VRE:
review_required; village deaths +7.1/run (regression_watch) — the seed
call's expedition-death price. Evidence:
`evidence/2026-11-17/sim-launchfunnel-a.md`.

## Arm 2 — sim-part2night-a (adoption, DIAG GO, merged 48d767924)

Stranded 1215Z arm: instrument committed (7ff3dabfd, proof 89/89), corpus
8/8 complete, analysis.json GO — worker died after fixing an analyzer
`_raw` crash and adding a regression test, both left uncommitted, before
the evidence file. Adoption verified: proof re-run **93/93 green** (89 +
4 new regression legs); analyzer re-run with the fixed code reproduces the
analysis byte-identical; panel files are the worker's own (self-compare,
all deltas 0). Evidence + fix committed f2649c6f6 (rebased tip 48d767924).
Second rebase (after the launchfunnel merge moved master) stopped at the
known stop-at-pick quirk — pick 80b97d06d listed in both done and todo,
worktree clean, pick's changes verified unapplied (`sim-part2night-a.md`
absent, regression-test block absent) — recovered with
`git rebase --continue`, proof re-verified 93/93 after.

**Answer (finding #2425, quantified): the night veto costs ~0 launches.**
6 part-2 commits in 8×150d, all died at the night tick, 0 would-have-launched,
2/6 recovered by the next dawn's fresh pick anyway (sam_wilson d50,
gen_k8xfk0x d54 — the same pair re-launching each other). All 6 commits are
targetless (`target: null`), so the named-beast hold case is still
unmeasured. Evidence: `evidence/2026-11-17/sim-part2night-a.md`.

## Wall (this run's judged corpora, 32 configs, band 103411–103418)

| | launchfunnel OFF | launchfunnel VRE | part2night (master) |
| --- | --- | --- | --- |
| Wins | 0/8 | 0/8 | 0/8 |
| National (standing ≥ 200) | 1/8 | 1/8 | 1/8 |
| National (scaleRank ≥ 2) | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave 4 unlocked | 7/8 | 8/8 | 7/8 |
| Wave 5 unlocked | 1/8 | 1/8 | 1/8 |
| Median survival | 151d | 147.5d | 151d |
| Deaths | 460 | 517 | 460 |
| Starvation | 3 | 5 | 3 |

OFF ≡ part2night in every number (same villages, different recorders —
neutrality holds). The wall is unchanged in kind: wins still 0 everywhere,
only the lesser-seat instruments from October ever convert; wave 5 opens
on 1/8 and is never faced by a launched party.

## Telemetry deviation check

Run per body step 10 against the scale-wall baseline (WINSEAT regime) on both
adopted corpora, `--metrics national,table,wins,exiled`:
- launchfunnel-a-vre corpus: 3 LOUD lines (national 12→0, table 16→0, wins 16→0).
- part2night-a corpus: 3 LOUD lines (same three).
All six are REGIME artifacts — both corpora are pre-seat competent DIAG
substrates (wins structurally ~0), and the baseline's own `_regime` note
forbids this comparison. Baseline NOT rolled, no investigation item. (The
script reads `national` as scaleRank ≥ 2, hence 0 even though 1/8 villages
reach standing ≥ 200 on both corpora.)

## Infrastructure

- Safe-commit index clobber hit BOTH adoption commits (all committed
  files staged-as-deleted + untracked) — repaired via
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  each time, commits verified correct (launchfunnel 30 files, part2night
  16 files), trees clean after repair.
- check.js --quick on merged master: STARTED, killed by SIGTERM at ~148s
  with no output (same signal killed the tree-release command at ~487s;
  both re-run in pieces afterwards and completed). NOT completed — recorded
  as interrupted, not as a result. The binding verification for these
  instrument-only arms is their own proof tests, re-run on merged master:
  part2night 93/93 green on tip 95d3d9ca1; launchfunnel 42/44 on the same
  tip with the 2 failures being base-relative static checks (see next
  bullet), all dynamic/determinism legs green.
- PROOF STALENESS NOTE (launchfunnel): `test-launchfunnel-a.js` pins its
  static checks to the frozen base (parent of the prereg commit,
  f9b33757a). On the merged commit 7595ff0b9 it was 44/44 (verified
  post-rebase). On current master tip 95d3d9ca1 it reads 42/44: the two
  static checks fail because sibling lanes landed src/ + scripts/ changes
  since the base — Loop B's nondeathplan-b BUILD (betrayal.js, party.js,
  win-plan.js) and journey-social-life r234 (convo-dialogue.js, truth.js)
  plus the sibling instrument files. Zero of it is this arm's change
  (this arm's src/ diff is 0 lines; worktree clean). The proof is NOT
  loosened and the arm is NOT re-judged; the corpus, analysis, and panel
  are unaffected. A future run that re-runs this proof on a moved master
  should expect the same 2 static failures.
- Both trees released done-merged, branches deleted, main tree clean at
  closeout (tip 48d767924).
- No EPERM flap this run. No game-code change in either arm (`src/` diff 0
  lines both).

## Findings appended (3)

- Launch-funnel binding stage: dawn bid via empty companion pool
  (candidate-not-bid 8/12; 81/87 dawns pool-empty).
- Launched-party damage: one fought meeting dealt 8.5% of a wave-4
  monster's HP — the damage wall behind the funnel.
- Finding #2425 updated: night veto quantified (6/6 die, 0 would-have-
  launched, 2/6 recovered next dawn); all six commits targetless.

scale-onramp stays converging (NOT converged): the funnel is now
decomposed to a named binding stage and the night veto is quantified at
~0, but wins still come only through default-OFF courtship + seat
instruments, only through the lesser seat, wave 5 still 0 faced by a
launched party, and no launched party has ever killed a wave-4 beast on
any band. The directive stands until the tracker records this axis
converged on measured evidence. Next blanks, in order: (1) the companion
pool — why 93% of scored dawns have zero eligible companions; (2) the
damage wall behind the funnel (a launched party deals 8.5% and flees);
(3) a target-carrying part-2 population before any hold-to-dawn lever is
judged. food-economy stays converging (untouched; sibling B loop).
Claim deleted; lock deleted.
