# Journey endgame r54 — ADOPTION + LANDING (lane B, 2026-10-26)

This run did NOT replay the leg. It adopted the stranded r54 run, finished
its one missing gate, and landed it — the same pattern as the r53
adoption (2026-10-26 ~03:35 CDT). Replaying a complete 7-seed sweep to
re-prove identical numbers would have burned the run and risked a
second timeout.

## Adoption facts (read first — two corrections to r54's note)

- r54's own run timed out (~09:57 CDT) with the sweep, analyzer,
  withdrawal-rescan fix, telemetry check, and run note complete, but
  check.js --quick killed mid-run and nothing committed, merged, or
  released. Its worktree (journey2-endgame) still held the files.
- CORRECTION 1: r54's note header says "Merged locally, pending ship."
  That was not true when written — r54 never merged in its own run.
  This run is the merge. Do not cite r54 as landed before this note.
- CORRECTION 2: rotation-b was still 4 at this run's start, not 5.
  This run advances it 4 -> 5 at landing (social life next).
- Overlap guard at adoption: no playtest-loop-2.lock present; the
  journey2-endgame registry heartbeat was 15:27 UTC, ~3.5h stale at
  adoption (~18:57 UTC) — previous run DEAD by the heartbeat rule, not
  live. The slug was NOT re-registered; the existing tree was adopted
  and heartbeated immediately (fresh at every stage, finite loop
  verified landing, not silenced).

## Verification (this run, before landing)

- Analyzer re-run on the stranded per-seed files:
  `node scripts/analyze-endgame-r54-20261026.js` — exit 0, ALL GO,
  verdicts identical to r54's note on every binding: M1 7/7, M2
  census, M2c 6/6 engine coverage, M2d 12/12 gate-named, M2b
  attribution (d62 three NAMED fight-causal deaths; d87
  day-window-only), M8 exit canon 3/3, M3 4 vs 2, M3b 3/6 living
  veterans, M4 1/6 (88097 OPEN uw=5), M5 1/1, M6 3/3, REG r35/r37.
- Transcript spot-checks, verbatim in the stranded files:
  - 88095 withdrawal: "WE PRICED THE RUN. NO HUNGER ON THE RECORD —
    THE PELLET HUMS WHERE THE FIRE SHOULD BE." — the priced decline
    is real, and the daily-slice detector's miss is real too
    (withdrawal field null on all 7 sweep JSONs; the rescan is what
    found it).
  - 88097 wave-5 audit: "with 3 wave-4 and 2 wave-5 fought" AND "the
    wave-5 bar reads: blood your fighters (1 of 2 veterans)" — both
    numbers in the same audit, as r54 reported.
- People spot-check: 88097 relay/light final read in full — resolves
  ("Teach it to let go", humanity kept, System as Earth's champion
  from a respectful distance), Architect beat names Ingrid Vik
  ascended "through doors you built" (facilitation credit, both
  true), Oversight coda intact. 0 senseless flags in this read.
- Telemetry deviation check re-run (same command, same baseline):
  LOUD on both metrics, identical to r54 — maxTier 16 -> 2,
  satPenalty.penalty 91 -> 8 (n=7). VERDICT: EXPLAINED (guard-ended
  windows vs a long-deferral baseline; the baseline's own note says
  do not compare pre-seat corpora against it). Baseline NOT rolled.
  Re-seeding it from a same-regime corpus stays a metric-review
  proposal for a later run, not a mid-adoption re-score.
- Zero src/js changes in this landing (r54's files are evidence +
  probe/analyzer tooling only). No new regression is possible from
  the commit itself; check.js --quick below is the gate, not a
  formality.

## This run's blank: who owns each wave-5 number (r54's named question)

r54 left one question open: the unlock says 5, the readiness bar says
1/2, the full seat says never — which system owns each number? Read
from code (worktree, same base as the sweep) and canon docs:

1. THE UNLOCK (uw) — owner: `Game.unlockedWave()` (src/js/game.js),
   reading `villageStandingTotal()` (src/js/standing.js). Wave 5
   needs the wave-3 rung met, standing >= t5 (200, bread capped at
   100 toward it), and wave-4 faced. Canon agrees
   (docs/MONSTER-WAVES.md: "Wave 5: The Producers (Standing >= 200
   AND wave-4 faced)"). The total is GATED before release: if the
   capped total reaches t5 but the village is not ready, the release
   is HELD at wave 4 ("the fifth draft waits"). After release, the
   monotonic peak ratchet (`_standingPeakWave` in state) floors the
   total at the released threshold forever — "wave held open
   (standing floor)".
2. THE READINESS BAR (1 of 2 veterans) — owner:
   `Game.waveUnlockReady(5)` -> `waveCombatReadiness(5)`
   (src/js/standing.js), read from LIVE village state only: armor
   worn, weapons to hand, counters known, veterans = LIVING roster
   members with a wave-4+ kill in state.waveKillLog. It is voiced by
   the table audit (src/js/table.js) only when unready. 88097's two
   killers were Maya Singh (killed d56, died of dehydration d81)
   and gen_xi0zrte (living at the sit) — so the LIVE count is 1/2
   while the cumulative kill ledger still holds both kills.
3. THE FULL-SEAT wave-5 COMPONENT — owner: the fullseat-diag
   instrument over deedState wavesFaced (faced counts, fleeing
   counts). 88097: w5 faced = 2, but the full seat needs EVERY bar;
   its closest gap is w2 faced 4/5, not w5.

So the three numbers were never in conflict. The bar that reads 1/2
blocks NOTHING after release — release is grandfathered, and the
audit line is a live-capability readout, not a gate. Before release
it would have HELD the release. And the full seat is blocked
elsewhere (w2), not by wave 5. The "second veteran" story is now
precise: banking the second killer's LIFE to the sit is what the
readiness bar measures; the unlock already happened without it.
One caution, from standing.js itself: the readiness demands
(2 veterans etc.) live in standingCfg().readyDemand and are "sim
starting points, not canon; Steve can overrule" — do not quote the
1/2 bar as Steve's law.

## Village assessment (r54's, verified by this run)

Plain words: seven villages, 180 days each. Five sat at lesser
seats and won — beloved/light twice (88091, 88093), feared/light
(88096), relay/light (88097, the wave-5 village), relay/dark
(88094, the forced-drift control). One died honestly (88092,
village-lost after four talked-down fights and no kills). One
survived but was priced out (88095: shared food 673 times, never
surged a feast, never faced wave-2/3 — generous, contested, stage-3,
and still declined at the table because the food-thesis deeds were
missing). The wave-4 arena's lethal monster this run was the
influencer (three named deaths d62, 88093); the congregation death
d87 was day-window, not fight-causal. Veterans alive at the sit:
Katarina Novak (88093), Hannah Kim (88096), gen_xi0zrte (88097) —
the best living-veteran count in this series (3/6), and still no
village banks two living veterans.

## Reachable / fun / winnable (leg 4, after r54)

- REACHABLE: lesser seats, yes (5/5 announced villages won);
  wave 5, now once (88097, first opening in the r48–r54 series);
  the full seat, still no (closest gap w2, not w5).
- FUN: finals resolve instead of trailing off (88097's relay final
  teaches the System to let go; the Architect beat credits the
  builder); the priced decline on 88095 is a real story beat, not a
  silent fail; the withdrawal voice lands verbatim.
- WINNABLE: yes via lesser seats; the full seat remains the
  aspirational bar (TABLE.md), not a broken one.

## Metric review (§14)

- M4's GO stays narrow and must stay labeled: it counts the UNLOCK
  (uw=5), not the veterans bar (1/2). Every future endgame note
  reports the bar beside the unlock, per r54's rule.
- Gate-passed-uncommitted: second empty run. Retirement decision is
  owed by the NEXT run's metric review (retire it, or keep it for a
  wrapper-lookup-disagreement seed) — not retired here, not
  re-scored here.
- Daily detector vs rescan: the per-day slice still never fired;
  the rescan IS the detector until a daily hit occurs. Next runs
  watch for a daily hit; if withdrawals keep arriving via rescan
  only, the daily slice should be retired, not carried.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes, no lever moved on the default path. Comparison is
  r53 -> r54 via identical substrate plus the rescan (field
  addition, not a class change), and Arm A -> Arm B on one variable.

## Regressions / checks

- CHECK-QUICK (pre-rebase base e8f2ccad7, this run): 278 passed,
  9 failed in 673s. The 9 failing scripts are all pre-existing
  scripts, none of them r54's: hide-discovery, measurement
  comparison/proof-update/workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014 (gear:
  spear and jacket), establishment-r20-fixes (racks-full next-day
  voice: expected 2, got 1). Standing profile at r52/r53 was
  279/8 — the delta is BASE DRIFT between the old worktree base
  and the r53-era base (including the sibling racksvoice-gate
  landing), not a regression from this commit: r54's files are
  evidence + probe/analyzer tooling with zero src/js changes, and
  check.js does not execute them. The racksvoice next-day failure
  is flagged for the owning loop, not fixed in this adoption
  (fixing a sibling's gate behavior is out of adoption scope).
  Post-rebase check on the merge content follows at landing.
- CHECK-QUICK (post-rebase, on the merge content): 278 passed,
  9 failed in 334s — IDENTICAL script list to the pre-rebase run.
  The rebase (onto 1377d03c3, lane A deepening r53; src diff
  old base -> new master is 6 files, 41 insertions, 8 deletions)
  introduced no new failure, and r54's zero-src commit introduces
  none. Post-rebase analyzer re-run: exit 0, 13 GO lines,
  identical verdicts. node --check on both r54 scripts: OK.
  Landing gate verdict: the 278/9 profile is the CURRENT master
  standing profile, not an r54 regression; the 279/8 -> 278/9
  drift belongs to the owning loops (racksvoice next-day voice
  first among them), flagged here, not fixed here.
- Analyzer re-run: exit 0, ALL GO (above).
- Telemetry: LOUD x2, EXPLAINED, baseline NOT rolled (above).

## Landing record

- r54 commit (this run, worktree): f3e8a3f0, 18 files, 41144
  insertions, zero src/js. Safe-commit index clobber struck
  (all 18 files staged-as-deleted after commit); repaired via
  HEAD-blob cacheinfo, verified: git status clean of phantom
  entries, git diff HEAD empty, hash-object matches HEAD blob.
- Rebase: clean onto master 1377d03c3 (lane A deepening r53
  landed mid-run); rebased tip 01a587632.
- Post-rebase proofs: analyzer exit 0 (13 GO), node --check OK,
  check.js --quick 278/9 identical to pre-rebase (above).
- Adoption-note commit: this file, safe-committed in the worktree
  before merge (merge hash therefore not in this file — it is in
  the run's memory note and final report).
- Merge: ff-only into master in the main tree; HEAD verified
  ancestor + main tree clean after merge (see memory note).
- Worktree released (merged), branch deleted, reap swept,
  rotation-b read back 4 -> 5, lock deleted. Merged locally,
  pending ship — no version tag, no push, no live verification
  (the ship loop owns those).
