# sim-food-preserveact-round-2330 — loop B coordinator evidence (ADOPTION LANDING RUN)

Run: oversight-flesh-out-loop-b-20261025T2330Z, axis food-economy.
Coordinator worktree: `~/workspace/worktrees/sim-preserveact-round-b`,
branch sim-preserveact-round-b. No new sims were run in this round:
the round adopts and lands the dead 2230Z run's stranded arm and
verifies the 2230Z run's second arm, which was already on master.

## STALE-LOCK RECOVERY at start (per the body guard)

- The 2230Z B lock (created 22:30:27Z) was still present, and its live
  claim named arms sim-preserveact-b-adopt + sim-expedid-b-land.
- The 2230Z run's only registered tree, sim-preserveact-b, last
  heartbeated 22:35:39Z — 54 minutes stale at this run's 23:29Z start,
  past the 15-minute guard. Per the body, the previous run is DEAD
  no matter how fresh the lock looks: the lock was deleted and the
  2230Z claim retired to `.DEAD`. Nothing of the dead run's work was
  discarded — its branch was adopted below.
- Loop A: no lock file (fleshout-loop.lock absent) and no live claim
  at run start or at registration time. Loop A was NOT touched; this
  run worked food-economy (converging), the second axis, not
  scale-onramp.

## Arm 1 — sim-preserveact-b-land (ADOPTED, LANDED)

The dead 2230Z run's adoption arm, itself adopted from the dead
2030Z run. Branch sim-preserveact-b at b680316ab, worktree clean,
6 commits, all-new files only (48 files, +1718 lines, zero src/js):
evidence/2026-10-25/sim-preserveact-b.md (pre-registration + pilot
verdict + corpus-repair addendum), evidence/2026-10-25/
preserveact-b-corpus/ (32 per-seed files, seeds 9750–9757 x off/on
x pd0/pd1, plus sweep summaries and traces), scripts/
sweep-preserveact-b.js, analyze-preserveact-b.js,
test-preserveact-b.js, sweep-one-preserveact-arm.sh,
preserveact-off.patch.

Landing sequence (coordinator-performed, in the adopted worktree):
1. Heartbeat refreshed on the adopted tree, then rebase onto current
   master 2663bcfce — clean, 6/6 commits, tree clean after.
2. Full proof on the rebased branch: `node
   scripts/test-preserveact-b.js --corpus
   evidence/2026-10-25/preserveact-b-corpus --seeds 9750-9757
   --pilot --base 9f11741afc05741afac6581de23cf4eb13e1b245` →
   37 PASS, 0 FAIL (bare run is 25 legs; the T4 corpus+pilot mode
   supplies the other 12 — a bare 25/25 is NOT the full proof).
3. Analyzer reproduction on the rebased branch, same flags, exit 0:
   verdict NO-GO failed=P1, pooled total-action medians OFF=113.5
   → ON=102.0 (ratio 0.899, bar 1.25x); C1 holds (starvation 13 →
   5, bar ≤15); C2 holds (median daysAlive 100 → 100). Every
   per-seed row matches the published evidence table exactly,
   including 9754's ON zero on both sides and 9755's exact null.
4. Merged --ff-only into local master: master 2663bcfce →
   f3d0c034a, branch verified ancestor of HEAD, main tree clean.
5. Post-merge proof re-run in the same tree (now identical to
   merged master): 37 PASS, 0 FAIL again.
6. Tree released done-merged, branch deleted. Main tree clean at
   closeout of this step.

Verdict carried, NOT re-judged: preserver widening does NOT
increase preserve-action counts on this pilot corpus (KILLED at
pilot — no confirm band 9758–9773 was ever run, by design). The
widening itself is NOT killed: its quality/rate/shelf effects were
only a diagnostic column here (villager preserved-kcal pooled
OFF=63723 → ON=66625). The strongest follow-up lead remains the
one the arm's own metric review names: seed 9754's ON zero —
why cook resolutions vanish entirely on one seed under widening.
That is a diagnostic arm, not a re-run of this count question.

## Arm 2 — sim-expedid-b-verify (VERIFIED, already on master)

The 2230Z claim's second arm needed no landing: its commit
e12e5ad07 ("sim-expedid-b: thread monsterId through expedDeath
into fallen entries (#1047)") is already an ancestor of master,
with evidence/2026-10-25/sim-expedid-b.md and
scripts/test-expedid-b.js on master. Verification on the merged
state: `node scripts/test-expedid-b.js` → ALL PASS, exit 0
(roster-removal preserved, old-signature no-throw, fallen
monsterId=null on the old signature, cause unchanged). This
closes the backlog item "expedition deaths carry no monsterId"
(#1047's fix side; the backlog line itself was already marked
fixed by the landing run — no new backlog edit made here).

## Wall numbers (this round's judged corpus — the preserveact pilot, 32 configs)

National 28/32, table 0, wins 0, wave reach {2: 3, 3: 8, 4: 21},
wave 5 0/32, median survival 100d capped, total deaths 243
(arena 143, monster 20, ambush 19, starvation 18). Table 0 is a
construction fact (SEATDRIVE=0 makes the table unreachable by
design), not a scale-wall finding — reported as such, as the
arm's evidence does. In plain words: these villages are hardy,
not hungry — nearly all lived the full 100 days and reached
national standing, none could reach the table because the table
was switched off for this measurement, and most deaths happened
in the show (the arena), not from hunger.

## Village assessment (plain words)

Widening who counts as a preserver did not make villagers
preserve more — they preserved slightly less overall, one
village stopped preserving entirely while still living the full
100 days on fresh haul and fast turnover, and another village
changed not at all. Starvation deaths still fell (13 → 5).
The plain reading, carried from the arm: if widening helps at
all, it helps through the quality of preserved food, not through
how often villagers do the work. Nothing in the traces reads
robotic or static — the divergence tracks the food story seed
by seed. No dialogue-quality claim is made beyond the
event-level behavior the arm's header allows (its cook say-lines
were never captured: the sim harness's say stub drops them, a
harness-design limit the arm's addendum root-caused).

## TELEMETRY DEVIATION CHECK (body step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-25/preserveact-b-corpus/*.json' --metrics
national,table,wins,exiled` → exit 1 with 3 LOUD lines:
national 12 → 28 (+133%), table 16 → 0, wins 16 → 0. All three
are the known regime/construction artifact class, NOT an
investigation item, and the baseline is NOT rolled:
- The WINSEAT baseline's regime (seat instruments on) does not
  match this SEATDRIVE=0 competent-only measurement corpus;
  national 28 is the analyzer-proven count on these files.
- Table/wins 0 is construction: SEATDRIVE=0 makes the table
  unreachable, and wins here are table wins by the corpus's
  own convention.
- Counting caveat, disclosed: the checker ingested n=42 files
  (per-seed files plus sweep summaries/traces), not the 32
  configs the analyzer judges — a further reason not to
  re-judge from its lines.
No LOUD line for exiled. No new investigation item.

## Balanced panel (§15)

No panel compare .md is attached: balance-panel.js compares
panel-driver cases, not env-gated arm-contrast recorder rows —
the expected-failure class the arm's header pre-stated (sixth+
sighting across rounds). The analyzer's per-seed table,
coordinator-reproduced above, is the §15 fallback instrument,
and the verdict is judged on it. No panel inputs were
fabricated to force a compare run.

## Infrastructure

- Safe-commit index clobber: NOT hit on this round's commits
  (the landing itself moved no worktree files — rebase +
  merge only; the coordinator evidence commit below is the
  only new commit, verified by `git show --stat` after
  safe-commit).
- No EPERM flap blocked this run's ref writes (rebase, merge,
  release, branch delete, registration all succeeded; one
  registration ran slow, ~2.5 min under sibling load, not
  failed).
- Coordinator accident avoided by precedent: the analyzer's
  `--help` is not a read-only mode (it prints FATAL for a
  missing --corpus) — flags were read from the script's argv
  handling before invoking it, per the 1226Z/1332Z rule.
- check.js --quick NOT re-run: zero src/js in the landed
  branch, zero green-list files touched, and both arm proofs
  are green on merged master. The standing 280/7 (later
  279/8) pre-existing quick profile recorded by loop A rounds
  is untouched by this round.
- Master moved once under this round before the landing
  (the 23:27Z scale-onramp coordinator evidence 2663bcfce,
  landed just before this run started); the preserveact
  rebase absorbed it with zero file overlap.

## Convergence state

food-economy stays converging (NOT converged): the
preserve-action question is closed at pilot with NO-GO, the
expedid threading fix is verified on master, but no
food-economy game-code fix has landed from this axis in this
round and the 9754-zero diagnostic is still open.
scale-onramp stays converging (untouched; sibling loop A).
Next blanks for food-economy, in order: (1) the 9754 ON-zero
diagnostic (why cook resolutions vanish entirely on one seed
under widening); (2) the sim-harness say stub as its own
instrument change before any run wants cook voice in sims;
(3) the rot step's raggedness as a behavior question
(carried); (4) the leg2decide string-sort display fix
(carried).

Claim deleted; lock deleted. Evidence: this file (coordinator)
+ evidence/2026-10-25/sim-preserveact-b.md (arm) +
evidence/2026-10-25/preserveact-b-corpus/ (arm corpus).
Merged locally, pending ship.
