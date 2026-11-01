# Loop B round 1346Z: coordinator evidence (packcomp NO-GO + dipslide pilot GO, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1346Z,
axis food-economy (second axis; sibling Loop A live on scale-onramp
throughout, 1235Z claim: dawnblock + titangate, NOT touched).
This run worked the 1305Z closeout's next blanks (2) pack-composition
lever for scholar supply and (3) dip-vs-slide sensor design, in order.
Blank (1) HUNGER WINTER relief passivity skipped again as a steve-call
candidate needing a ruling first. Both arms DIAG only: zero src/js,
zero policy-default flips, zero game-code changes.

Pre-flight: main tree clean at run start, disk 21%, reaper removed
nothing live. Claim written before any sims
(hidden_files/lever-claims/fleshout-loop-b-20261101T1346Z.json).
Master moved under the run (Loop A landed its 1235Z round mid-run:
dawnblock + titangate, tip c31d00b61, plus its coordinator evidence) —
absorbed via worker-side rebases onto the new master, proofs re-run,
no conflicts (disjoint files). No B lock at run start.

## Arm sim-packcomp-b — NO-GO, killed at pilot (worker commits
4c9db39df + 7da1914ef prereg [duplicate, identical trees] +
41ab2e18c driver/counterfactual/analyzer/proof +
df1b55ffc pilot evidence, merged --ff-only after clean rebase;
proof re-run green on coordinator check, 15/15 pure)

Pre-registered bar: combined (identification + shelling)
counterfactual predicts nonzero unload on >= 6/8 seeds AND flips
>= 2 of the 4 depositkeep zero seeds (51103, 51104, 51107, 51108),
30d competent, gate-off keep 2,000, seeds 51101–51108 (identical
depositkeep substrate — per-seed max finished packs and unload
totals tie the depositkeep census EXACTLY on all 8 seeds).
Result: 5/8 seeds, 1 flip (51107 only) → NO-GO on both prongs;
no 12-seed confirm spend. No re-score: the 51107 flip and the
shelling upside on unloading seeds do not convert 5/8 + 1 flip
into a GO.

Mechanism, sharp and split: processing is a REAL lever on exactly
one zero seed and a dead end on the other three. 51107 flips
decisively on shelling alone (10 returns over 2,000, best pack
3,616 kcal of shelled acorns; species already known and taught,
nuts sitting on the counter unshelled). 51103/51104/51108 never get
within 800 kcal of the keep even with BOTH channels combined
(best combined packs 1,200 / 1,200 / 565) — the blocker is haul
SIZE (8 nuts / 8 nuts / 5 acorns at best), not processing.
Identification alone flips NOTHING (best zero-seed pack 1,200;
51103's unknowns are all nut species, still in-shell after
identification; 51108's only unknown is must-cook nettle, still
unprocessed after identification). Sense: 51107 day 24 reads as
unshelledness, not smallness ("32x White Oak Acorns (in shell —
shell them to eat)"); 51108 day 3 carries the most human moment
in the band (scholar starving while carrying 5 unshelled acorns).
Full tables: evidence/2026-11-01/sim-packcomp-b.md + census JSON.

## Arm sim-dipslide-b — pilot GO (worker commits eab58df55 prereg
+ 03a6c0666 pilot, merged --ff-only after clean rebase; proof
re-run green on coordinator check, 20/20 pure and 25/25 with the
corpus-path live replay)

Pre-registered sensor rule (NOT re-tuned before any confirm):
trendsensor trend condition unchanged (pantry fell >= 20% over
5 evenings AND fell 3 evenings running AND level rule engaged),
PLUS (i) early-window exclusion — candidate loopDays < 8 ignored;
PLUS (ii) 5-evening recovery confirmation — candidate D confirms
only if P(D+5) < P(D) inside the same final engaged run.
Actionable day is confirmedDay = D+5, never the candidate day.
Counting rule: final engaged run only. Pure replay of the
committed depositgate armed corpus, seeds 51101–51108, no new
sims, no fresh-seed confirm run here by design.
Bars: (a) earliness on 51101 >= 3 days — PASS: candidate day 8,
confirmed day 13, level stand-down day 18, earliness 5 (the
5-evening confirmation delay is charged; trendsensor's 11-day
earliness was on the unconfirmed day-7 firing). (b) false fires
in final engaged runs <= 1 across surviving seeds — PASS: 1
(51103 only; trendsensor pilot had 3). GO requires both; both
pass → pilot GO. Per the prereg's pilot gate this GO earns a
fresh-seed confirm NEXT run; it does not run one here.

How the old false alarms were filtered: 51104 by the early-window
exclusion alone (its only candidate was day 7, the week-1
settling shape); 51108 by recovery confirmation (candidates days
10/11 both fail: pantry recovers by day 12, ends at 36,634);
51103 NOT filtered — candidate day 8 confirms day 13, pantry
bounces day 14, one evening too late, and no longer window fixes
it (day-14 pantry still below the day-8 level). 51103 is the
known residual risk the confirm must measure. Final-run counting
is still load-bearing: counted anywhere the false count is 3
(51103 + 51106 + 51107), not 1 — the confirm must pre-register
the counting rule identically and report both counts.
Confirm bars specified (unrun, not passed): (c) false-fire rate
<= 25% of surviving confirm seeds; (d) if any confirm seed
collapses, at least one collapsed confirm seed has earliness
>= 3, else (d) UNJUDGED. Exact rule for the next run is specified
in evidence/2026-11-01/sim-dipslide-b.md (do NOT re-tune before
the confirm — the confirm must test THIS sensor).
Sense: on 51101's confirmed day 13 the voice still says shelves
full (~13 days fresh) while the whole store has halved (39,660 →
18,202) — the sensor reads as the village finally noticing the
slide underneath the fresh-slice voice. The known "pot stays
full" prose bug reproduces on day 22 (already filed, recorded
only).

## Wall numbers (in-window only; wall NOT measured by these arms)

Both arms are 30d pre-seat windows: national 0, table 0, wins 0
IN THIS WINDOW ONLY — not a wall movement claim. Packcomp:
8/8 survived 30d, median survival 30, collapses 0, wave reach
max 2. Dipslide replay: median survival 30, collapses 1/8
(51101 only), wave reach max 2. Full seat 0 / wave 5 reached 0
stand as last measured (Loop A lane).

## Telemetry deviation check (coordinator, post-merge)

- Dipslide summary: 3 LOUD lines (national 12 -> 0, table 16 -> 0,
  wins 16 -> 0), the known missing-field artifact class (30d
  pre-seat replay carries none of those fields) — baseline NOT
  rolled, no investigation item.
- Packcomp jsonl: the tool refuses the file itself (it parses
  each matched file as a single JSON document; a multi-line jsonl
  fails at line 2) — input-format limitation, not a deviation.
  Same artifact reasoning applies (30d pre-seat census carries no
  scale fields); no baseline change, no investigation item.

## Balanced panel (§15)

No panel compare fabricated for either arm, per each prereg's
inapplicability declaration: both arms change no game code and
their primary metrics are custom censuses / within-trajectory
instrument comparisons, not panel metrics; baselines are
published censuses / a committed corpus, not freshly run panels.
Tables above are reported directly on identical seeds and
identical trajectories.

## Infrastructure (loud)

- EPERM flap hit both workers' git writes mid-run (safe-commit
  private-index lock writes, worktree-heartbeat registry writes;
  plain file writes worked throughout). Dipslide recovery that
  worked: a byte-identical copy of safe-commit.sh with ONLY the
  IDX path changed (/tmp → worktree-local), used for its two
  commits, then DELETED, never committed. Coordinator note: the
  stray copy was spotted mid-run and the worker was told not to
  commit it; the worktree was clean at landing and the file is
  absent from the merged commits (verified via git show --stat).
- Safe-commit index clobber hit both workers' commits (known
  class); each worker repaired via --add --cacheinfo from HEAD
  blobs and verified clean status. Commits verified correct.
- Packcomp duplicate prereg commit (harmless, worker-reported):
  a background commit-retry loop started during the flap and a
  foreground retry both landed (identical message, IDENTICAL
  TREES, 3 seconds apart, both before any sim) — merged cleanly,
  not reset away.
- Dipslide worker closing report never arrived: the worker went
  idle with its branch complete (both commits in, worktree clean)
  and did not answer a coordinator check-in. Per the 1305Z
  precedent, the coordinator verified the branch directly
  (commits present, worktree clean, proofs green incl. 25/25
  live replay) and landed it normally — no re-spawn, only the
  report was missing. The worker was closed before landing so no
  late commit could strand after the branch deletion.
- Coordinator's own invocation error, owned plainly: the first
  dipslide --live re-run was called WITHOUT the corpus-path
  argument the test requires and errored; re-run with the path
  gives 25/25. Not a worker defect.
- Loop A landed mid-run (1235Z round: dawnblock + titangate,
  both DIAG-GO, tip c31d00b61); both B branches rebased onto it
  cleanly, proofs re-run, then merged --ff-only. A's claim file
  and lock were still present at B closeout (A bookkeeping
  pending) — NOT touched; B's tracker update re-read the tracker
  immediately before writing (see tracker entry).

## Metric review (for the NEXT run; this run judged against headers)

- Packcomp: the (c) bar conflated two blockers. Next run should
  pre-register SEPARATE bars — a shelling-lever bar judged on
  shelling-shaped seeds/returns, and a haul-size question judged
  on forage volume — not one seed count over both shapes. The
  shelling lever deserves a REAL run (policy or game change:
  shell at camp / on return, tick costs charged, fresh seeds,
  51107 shape as test case), not another arithmetic census.
- Dipslide: pilot GO is provisional BY CONSTRUCTION (design
  motivated by this corpus's own failure mode). Do NOT revise
  the rule before the confirm. The confirm must report earliness
  distribution on collapsed seeds, not just >= 3 pass/fail, and
  must keep the final-run counting rule exactly.

food-economy stays converging (NOT converged): the keep mechanism,
the sensor failure mode, and now the pack-composition split and a
provisional dip/slide sensor are measured, but no food-economy
fix has landed as game code and no default has flipped.
scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) HUNGER WINTER relief passivity
(steve-call candidate — still needs a ruling before any work);
(2) dipslide fresh-seed confirm (exact rule in
sim-dipslide-b.md; bars (c) <= 25% false-fire rate, (d)
earliness >= 3 on a collapsed confirm seed if any collapse);
(3) shelling-habit real run (policy or game change, tick costs
charged, fresh seeds, 51107 shape as test case); (4) haul-size
question for 51103/51104/51108 (forage targets/volume — why 8
nuts is the ceiling); (5) P3 reset follow-ups — night-22 +3,005
silent inflow bridge (still undocumented), double endDays on
vessel-death days; (6) patrol-departure narration; (7)
garden/fish/traps early path (marginal 2.8% combined — ripening /
assignment path, not yield numbers); (8) creek clearance
wood-bound — evening wood-carrying before any creek-clearing
lever; (9) rubble daytime-clearing habit unmeasured; (10)
washed_out scramble narration; (11) 96-tick bridge edge
unobserved; (12) a 120d window only if a new horizon-cut episode
appears.
Worktrees released as merged, branches deleted: sim-packcomp-b,
sim-dipslide-b. Claim deleted; lock deleted.
Merged locally, pending ship.
