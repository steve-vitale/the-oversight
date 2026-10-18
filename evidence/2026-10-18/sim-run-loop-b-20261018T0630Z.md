# loop B run fleshout-loop-b-20261018T0630Z — stale-lock recovery + adjudication

Axis food-economy (loop A holds the live claim on scale-onramp all run —
fleshout-20261018T0515Z: sim-butcharmor / sim-openersurv / sim-defercensus2;
zero file overlap).

## STALE-LOCK RECOVERY of run fleshout-loop-b-20261018T0430Z

- Lock found with run_id fleshout-loop-b-20261018T0430Z (created 04:32:13Z).
  Registry heartbeats for its trees (sim-gengap-b, sim-foodvoice2b) were
  06:10:52Z — 19 min stale at takeover 06:29Z, no matching live coordinator
  processes found at that moment. Guard rule fired: lock deleted, recovery
  noted, run proceeded.
- **The 0430Z run was NOT fully dead.** At ~06:30–06:33 its orphaned workers
  were observed running proof suites (node scripts/test-foodvoice2-b.js in
  sim-foodvoice2b, node scripts/check.js --quick) and its coordinator's
  end-of-run cleanup fired: it deleted its own claim file, deleted the
  shared fleshout-loop-b.lock (which I had re-created at 06:32:30Z — shared
  lock filename, no run_id check before delete), and removed the
  sim-gengap-b worktree + DELETED the sim-gengap-b branch while commit
  8f1b97cf was UNMERGED (not in master's history — verified via git log).
- **Recovery actions taken:** recreated branch sim-gengap-b at orphaned
  commit 8f1b97cf (commit object intact; proof script + evidence + data
  changes all present in the object), restored my lock file. Registry entry
  for sim-gengap-b left "active" but is stale (tree gone) — repaired after
  the 0430Z workers fully exit.
- Standing lesson for the loops: the shared per-loop lock filename means a
  finishing run deletes a successor's fresh lock. End-of-run cleanup must
  verify the lock's run_id line matches before deleting.

## Adjudication state (pending 0430Z workers' exit)

- sim-shellrevive-b2 (68713b07): LANDED to master by the 0430Z run — revival
  GO on the frozen base, layer default OFF (SHELLREVIVE_B=1).
- sim-gengap-b (8f1b97cf): worker's evidence verdict GO with metric-review
  rationalization of an E1 guardrail miss (4 armed village-lost-to-starvation
  vs 0 control; expected occupationFoodSkill 1.062→1.041 dilution — finding
  #524). The 0430Z end-of-run deleted the branch unmerged — kill or
  cleanup-accident is unresolved; the commit is preserved for coordinator
  adjudication in THIS run.
- sim-foodvoice2b (005b0e34): voice-only, evidence verdict GO on every gate
  ([needs-eyes]), not yet landed; worker re-running proofs at takeover.

## Outcomes (end of run)

- **sim-gengap-b: ADJUDICATED GO → LANDED 5c558287.** Rebased onto f207b090, re-ran the full proof (scripts/test-gengap-b.js): wall sweep 16 seeds × capable × 180d — armed == control on every metric (national 14/16 both, table 15/16 vs 14/16, wins 14/16 both, median 94d both; E0 PASS, E1 PASS, E2/E3 identical). The worker's 4-village starvation cluster did NOT reproduce on current master. RED/GREEN mechanism re-verified against the true pre-fix base f207b090 (23 nulls → 0). The 7 proof FAILs on the rebased run were rebase artifacts (proof hardcodes `git show HEAD:` expecting an unfixed HEAD) — verified by running the RED/GREEN assertions directly against f207b090.
- **sim-foodvoice2b: ADJUDICATED GO → LANDED 31f3abf8 + 40d8b226** (the 0430Z run's own end-of-run landed both at 08:00Z; independent adjudication converged). PRIMARY (a)/(b) GO, det-gate 16/16 byte-identical, wall-vs-old-corpus breach exonerated as base drift (metric review 40d8b226).
- **sim-huntstaff-b3: NO-GO-KILLED → LANDED b9e728c5** (evidence + instruments, layer zero-trace). Third kill on the hunt line; the mechanism engages (170 assignments) but the pooled-count starvation guardrail fired on collapse seed s8282. Metric review proposes per-pair or hunter-only gating for the next run.

## Metric review

- The gengap proof's HEAD-coupled RED assertions are rebase-fragile: after a rebase the proof must run its RED phase against the pre-fix base commit explicitly, not HEAD. Noted for future adjudications.
- The foodvoice2b wall-vs-corpus guardrail is base-fragile: the corpus ages out as master moves. For voice-only changes the det-gate (same-base, byte-identical trajectories) is the dispositive guardrail; the corpus comparison should be same-base control vs armed, not armed vs stale corpus.
- The hunt staffing line's starvation guardrail (pooled count) cannot distinguish layer-caused from collapse-seed starvation. Next run needs the revised gate (per-pair or hunter-only) via the §14 escape hatch.

## Wall numbers (this run, pre-seat substrates)

- gengap re-run: national 14/16 = 14/16, table 15/16 vs 14/16, wins 14/16 = 14/16, wave4 2/16 = 2/16, wave5 0/16, median 94d = 94d.
- huntstaff-b3: national 11/16 vs 13/16, table 13/16 vs 14/16, wins 0/16 both, wave4 0/16 both, wave5 0/16 both, median 149d vs 173d.
- The scale wall is unmoved by hunt staffing; wave-4 remains unmeasurable on the pre-seat substrate.
