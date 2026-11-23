# sim-winnability round 1230 — DRAFT (adoption of timed-out run fleshout-loop-b-20261123T1230Z)

Run: `fleshout-loop-b-20261123T1230Z`, Loop B, axis winnability-chain.
Scheduled 06:30 CST Mon 2026-11-23 / 12:30Z. Timed out at the 7200s
boundary with Arm 2 (killarrive-b) landed and Arm 1 (doorstage-b)
proved but unmerged; this adoption finished the closeout.

## Arms

### Arm 1 — sim-doorstage-b: GO (D1 judged for the first time)

The staged-door re-judge of the leader-projection gate (the 0230Z
round's named next blank (1): a pool-rich supply for the projection
gate — staged pool doors deliberately, per the doorrich metric review
strategy b). Zero `src/js` changes; the LEADERPROJ lever is already
on master env-gated.

- Base at freeze: master `7ade8d3bf`; prereg anchor commit
  `97e00d5ba443b56f88b1afaaf4334fa132c6f5c9` (content-identical after
  two rebases; rebased prereg commit `15108ce16` on master
  `43ebee38c`).
- Staged pool: 16 doors (12 pool + 4 safe negative controls), door
  seeds 424200–424215, geared villager quad, leader HP 30–95.
- D1 (PRIMARY): pool 11 scored (door 10 unscored — win-plan avoid,
  both legs), control bad 11/11 (100%: 6 flees, 5 deaths), armed bad
  0/11 (0%: 11 `proj` fires, 0 divergence). **Drop 100pp vs the
  20pp bar.** D2 kill rate armed 0.25 vs control 0.0667 PASS. D3
  damage/door armed 743 vs control 351.7 PASS. D4 fires 11 (bar ≥1)
  PASS. D5 substrate 32/32 files clean PASS. D6 durability PASS
  (armed log 11 entries == 11 fires, all `proj`). M5 balanced panel
  `review_required`, no `regression_signal` (village deaths/run
  0.4375 → 0.125, `no_material_signal`).
- Proof battery on the rebased tip (see §Proofs): M1 18/18, M2
  35/35, M2w 16/16, M3 29/29, M3d 49/49, M3e 25/25, M3f 48/48,
  M3g 43/43, M3h 50/50, M3i 55/55, M3j 36/36, M3k 11/11, M3l
  38/38, analyzer selftest 39/39. Analyzer re-run over the
  corpora with the frozen anchor reproduces the committed analysis
  byte-identically (pass true, matchedPool equal, bars equal).
- Evidence: `evidence/2026-11-23/sim-doorstage-b.md` (+ prereg,
  spec, analysis JSON, panel, 32 corpus files).
- In plain words: when a hurt leader walks up to a wave-4 (or
  wave-5) door, the gate says no — and without the gate, that walk
  ends in flight or death every single time in this staging. The
  gate's forecast is accurate across the whole band, including the
  boundary door (leader 75 HP, projected exactly 25 — fled in 2
  rounds when fought). The "safe-but-≤75HP" class came out empty:
  0 of 11 pool doors won on control.
- Caveats (not re-scored): the scored pool is 11, not 12 (door 10
  never reached the gate — the win-plan outmatched gate turned its
  party back because one member wore no armor at all); both legs
  exited 1, not 0, solely on door 10's instrument error; D2/D3
  are composition artifacts (the armed leg fights only the 4 safe
  doors); safe doors 13/14 still kill their leaders (the gate
  reads HP, not the fight). Next supply question: the win-plan
  outmatched gate now bounds staged supply from below — future
  staged pools should pre-check at-door armor or budget one
  unscored door per 12.

### Arm 2 — sim-killarrive-b: GO (the arrival happened, the rate holds)

The 49-seed kill-loot searcaster arrival band (the 0230Z round's
named next blank (3); killrate-a sizing, still unrun). Merged by
the timed-out run before the timeout: commit `a6cb127cc`.

- Band 107533–107581 (49 seeds, worker-verified fresh; the
  intended 107517–107565 band collided with Loop A's 107517–107532
  move and was abandoned), 150d death-aware, competent verbatim,
  single ctl leg (KILLBUNDLE unset — measures the roll rate, not
  the bundle).
- **One kill-loot searcaster arrival in 49 seeds** (seed 107533,
  day 19 — the first kill-loot searcaster in the whole program;
  prior bands: 0 in 193 pooled drops). Tier-4 kill-roll rate
  31/399 = **7.77%** (Wilson 95% CI 5.5–10.8%) vs pooled 8.81%,
  inside the frozen 2× band (4.4–17.6%). Arrival count 1 vs 2.25
  expected — Poisson-consistent two-sided (P(X ≤ 1) = 0.34,
  P(X ≥ 1) = 0.89). All 5 frozen bars pass.
- The arrival's sting: the gun arrived **dry** (0 cells), its
  holder carried it into 15 fights over 73 days and never fired a
  single shot, died in the wild on day 92, and the gun sat on his
  unburied corpse until the village was lost on day 129. The
  contest path on the same band shows the same shape: 30 grants,
  4 volleys of exactly 2 shots each, then dry. **Arrival is
  closed as a question; cells/re-arming is now the binding
  constraint on both gun paths.** Finding appended to
  sim-findings.md (see §Findings). The KILLBUNDLE arm (2 cells at
  arrival) is the standing candidate — a Loop B 1430Z arm
  (sim-killbundle-b) is already running on it.
- Wall (49 seeds): wins 0/49, national 0/49, wave-5 18/49, wave-4
  49/49, median survival 150d, villages lost 25/49.
- Evidence: `evidence/2026-11-23/sim-killarrive-b.md` (+ prereg,
  analysis/tally/validation/rows JSONs, corpus under
  `evidence/2026-11-21/perseed-killarrive-b-ctl/`).
- One VM restart killed the first band attempt mid-run (4 leg
  processes SIGTERM'd ~21.4 min in); 43/49 files had landed, the
  6 missing seeds re-ran as remnant processes post-restart, same
  anchor, no file re-run or replaced.

## Wall numbers (this round)

- Wins 0/49 (killarrive band; doorstage is staged doors, no
  horizon). National 0/49. Table not instrumented by the
  killarrive driver (recorded, never faked). Wave-5 18/49.
- winnability-chain stays converging (NOT converged): the
  projection gate's D1 is now JUDGED (GO) after three supply
  failures, and the kill-loot arrival question is closed — but
  wins are still 0 and national 0 everywhere in this round. The
  binding constraint moves downstream: cells/re-arming on the gun
  path, and the launch mechanism (pool eligible 0 on every
  snapshot) on the chain.

## Telemetry

- killarrive-b (worker, pre-timeout): exactly the 3 LOUD regime
  lines (national 12→0, table 16→0, wins 16→0); baseline NOT
  rolled.
- doorstage-b (adoption): NOT APPLICABLE as a run-vs-baseline
  check — `scripts/telemetry-check.js` refuses recorder-corpus
  input by design (staged-door corpora carry top-level
  anchorCommit; "recorder corpora are compared with sweep-compare
  tables, never against a run baseline here"). The staged
  instrument produces no run-shaped metrics (prereg S6: wins /
  national / table / median survival not measurable — no day loop,
  no standing, no table). The deviation check that applies is M5
  (balanced panel, `review_required`, no `regression_signal` on
  per-door party deaths), which passed and is committed in the
  evidence. Baseline NOT rolled.

## Proofs (doorstage-b, re-run on the rebased tip by the adoption)

Full battery re-run on rebased tip `fdd90bb48` (base master
`43ebee38c`; the rebase changed only 5 establishment
evidence/script files, zero overlap with the arm): M1 18/18, M2
35/35, M2w 16/16, M3 29/29, M3d 49/49, M3e 25/25, M3f 48/48, M3g
43/43, M3h 50/50, M3i 55/55, M3j 36/36, M3k 11/11, M3l 38/38,
analyzer selftest 39/39 — all exit 0. Analyzer re-run over both
corpora with the frozen anchor `97e00d5b…` reproduces the
committed analysis byte-identically (pass true, matchedPool
pool 11 / controlBad 11 / armedBad 0 / projAvoids 11 /
divergence 0, bars equal). Log:
`hidden_files/doorstage-b-proof-battery-adopt.log` (+
`doorstage-b-m3l-rerun.log` for the final M3l run).

Two load artifacts on the way, zero failed assertions in any
attempt: the first rebased-tip battery run timed M3l out at the
runner's 600s cap (it had completed in 483s on the old base);
a standalone 1500s re-run reached 37/38 (only the final §7
gateavoid re-run check unprinted — that suite passed 36/36
standalone as M3j on the same tip); a 3600s re-run was killed
by a runtime restart at 36 PASS (through §6); the fourth run
completed clean, 38/38, rc=0, in 1628s under load 15–20. A VM
replacement at ~15:24Z also killed an earlier re-run attempt
and cleared the registry lock (re-heartbeat + write probe done
before continuing).

## Gate

`node scripts/check.js --quick` on the merged tip `fdd90bb48`
(run in the sim-doorstage-b worktree, checked out at the merged
tip; log `hidden_files/check-quick-1230.log`): **334 passed, 10
failed in 1488s.** All 10 attributed, **0 attributable** to this
round (the merge carries zero `src/` changes — instrument +
evidence only):

- 6 × 120s TIMEOUTS, all re-ran GREEN standalone, serialized,
  on the same tip (log
  `hidden_files/check-quick-1230-reruns.log`): living-garden
  deed-attainment (rc=0, 219s — needs more than the gate's 120s
  cap even unloaded: pure load-flake), occupation-panels (rc=0),
  one-person-army deed-attainment (rc=0), trust-observer-
  neutrality (rc=0), synergy-stall (rc=0), capable-bot-20261014
  (rc=0).
- 4 × standing exit-1 failures, deterministic on re-run (rc=1
  in 1s / 0s): measurement-proof staleness pair
  (test-measurement-proof-update.js "Proof source inputs are not
  current" + test-measurement-workflow.js, 8 passed / 1 failed),
  measurement-cache-flags (0 passed / 4 failed), phone-frame
  proof (3 passed / 3 failed). Same standing set as the r274
  (337/7) and r156 (339/5) gates; the proof re-sign rounds
  (11, 12, 22) are still owed and are not this round's work.

## Findings

- The killarrive finding (KILL-LOOT GUNS ARRIVE DRY AND NEVER
  FIRE) was NOT appended by this adoption — the Loop B 1430Z run
  already recovered it from the 1230Z evidence file §9 and appended
  it to `hidden_files/sim-findings.md`, where it now stands
  `[claimed]` by arm sim-killbundle-b (the KILLBUNDLE arm, 2 cells
  at arrival). No duplicate appended. The 1430Z note says the
  1230Z coordinator died (machine restart ~13:25Z) before
  appending; the finding text is the worker's §9 draft verbatim.

## Tracker

- `hidden_files/convergence-tracker.md` appended atomically
  (this round's review; the 17 missing reviews from the Nov 21
  restore remain outstanding — not attempted here).

## Closeout

- Merged `fdd90bb48` (doorstage-b); this record committed from
  the adoption worktree and merged ff-only onto master (see the
  tracker entry for the record commit hash); killarrive-b merged
  by the timed-out run (`a6cb127cc`). The doorstage merge has since SHIPPED in batch
  `16de94e71-20261123-172503` (version bump `6d8478d00`), which
  also carried Loop A's 1415Z planform (DIAG-GO) and muster
  (pilot DIAG-NO-GO) arms — the ship ran while this adoption was
  gating; live verification of the batch is the ship job's, not
  this adoption's. Claim retired to .DEAD; the B lock now holds
  the 1430Z run (taken by stale-lock recovery at 14:34:34Z, with
  this adoption named as the 1230Z closeout owner) and was left
  alone. Worktrees released; main tree clean.
- Next blanks in order: (1) KILLBUNDLE=1 judged on the kill-loot
  path (Loop B 1430Z arm sim-killbundle-b running; its finding
  already claimed in sim-findings.md); (2) the launch funnel —
  UPDATE since this round: Loop A 1415Z landed planform DIAG-GO
  (`16de94e71`, hunt-lock is the formation wall, 71 bounces) and
  muster pilot DIAG-NO-GO (`5fc503d9e`, eligible-0 events 116/136
  named, 20 unclassified — pilot gate fails, no confirm spend);
  the next formation/muster steps are A's, not this round's;
  (3) what re-arms a gun holder (crafting? corpse takes? trade?)
  — the finding above; (4) staged-pool armor pre-check (budget
  one unscored door per 12, or pre-check at-door armor).
