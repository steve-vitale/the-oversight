# Sim round — scale-onramp, run fleshout-20261025T2015Z (coordinator evidence)

Axis: scale-onramp (converging, NOT converged). Sibling loop B live on
food-economy at run start (claim fleshout-loop-b-20261025T1937Z, arms
rotdecide2-b + n2beast-b) — NOT touched; B landed mid-run (see below).
Standing directive stands: national is reached reliably only by
default-OFF policy instruments, wins still come only through the lesser
seat, the full seat is still unreached, wave 5 still has zero births.

## Pre-registration (coordinator)

- Question: what blocks the wave-4 veteran leg, and does the raid draft
  explain the defender-wounded echo gap? Two DIAG-only arms, zero src/js.
- Shared band: seeds 73671–73678, tableseat-nowait policy, 180d
  death-aware horizon (the band the 1915Z run diagnosed).
- Control reproduction required: deaths 234, national-ever 7/8, wins 4/8,
  wave-4 6/8, wave-5 0/8, raids 85, raiders 361, pool 1,494,
  pool wave-3+ 107, median 135d. Both arms reproduced it EXACTLY.
- GO rules were set per arm in their own evidence headers and judged
  there; this file judges the round, not re-judges the arms.

## Arm 1 — sim-w4funnel-a: wave-4 kill funnel census — DIAG-GO

Commit 2d1d35df2 (rebased twice onto master, proof green after rebase).
Evidence: evidence/2026-10-25/sim-w4funnel-a.md +
perseed-sim-w4funnel-a/ (8 rows + summary + analysis).
Analyzer unit proof 48/48; census totals reconcile.

- Arrivals: 11, all fresh — tile-entry 9, scripted-titan 2,
  raid-draft 0. The raid draft creates nothing: all 5 raid-time wave-4
  pool appearances trace to spawns, only 1 ever drafted.
- Median arrival day 139, median 7 days left in the run.
- Outcomes: still-present 11/11 (100%) — 0 killed, 0 departed,
  0 melted, 0 fled-record.
- Fought: 2/11, both on 73677, both survived. The Eater killed its
  villager in round 1 (8 dealt, 98 taken); the Suburb lost 6 TB fights
  as a lingering raider restored each time at that fight's standing HP,
  so wounds never accumulate across fights
  (HP path 1300→975 toll→792→1144→982→1300).
- Largest funnel loss: never-fought, 9/11 (81.8%).
  Fought-not-killed 2/11, killer-not-living 0.
- Living-vs-cumulative divergence: 0 on every day, all 8 seeds;
  end pair 1 vs 1. The one killer's end status explained
  (elif_demir, living scholar, in roster, not fallen).
- The band's only wave-4 kill matches NO arrival: 73678's strike
  (day 115, scholar elif_demir, via 'player') was a non-world TB kill —
  startCombat builds fighters from the def and proceeds with a null
  origin, leaving no birth, removal, or tbEnd trace.
- Verdict in plain words: the veteran shortage is a KILL shortage,
  not a survival shortage. Wave-4 monsters arrive late, are almost
  never fought, and when fought their wounds do not stick between
  fights. The one veteran the band produced came through a door the
  world simulation never sees.
- Next blank (arm proposal, in the arm evidence): sim-nonworldkill-a —
  instrument TB-fight initiation (feast draw / tent intruder / door-flee
  re-engage / trap / world bump) to measure the non-world door that
  produced the band's only veteran. Contest ruled out as its path
  (would log via 'contest').
- Disclosure: the sense replay reproduced the defer4 hold beats but
  NOT the strike thread (narration shifts trajectories) — the strike's
  initiation path is a code-candidate list, not a replay quote.

## Arm 2 — sim-echodraft-a: wall-wounded echo draft trace — DIAG-GO

Commit 120ea4d3a (rebased onto master, proof green after rebase).
Evidence: evidence/2026-10-25/sim-echodraft-a.md +
sim-echodraft-a-sense.txt + perseed-sim-echodraft-a/ (8 rows + summary).
Unit proof 4/4; defwound numbers reproduced exactly (322 defender
fights, 56 manufactured, 204 pre-wounded, 877 re-meets).

- Nearest-first drafting is real and strong: Spearman −0.654 between
  pool distance and drafted indicator; 320 of 361 drafted (88.6%) came
  from the nearest quartile vs 99.8 expected under a distance-blind
  draft; drafted median distance 2 vs pool median 4.
- But defender-wounded entities sit NO nearer than field-wounded ones
  at draft time: drafted medians both 2 (means 2.23 vs 2.12 —
  defender-wounded a hair FARTHER); pool medians both 4; at-Haven
  (dist 0) share 0.0% vs 3.4%; mean draft rank 1.72 vs 1.71.
  Previously-drafted vs never-drafted is also a wash (median 2 vs 2).
  Almost nobody is at Haven when drafted (4/361) — the teleport to
  Haven does not stick across the 7+ days between raids.
- The draft re-pulls wounded animals constantly (98/361 drafted were
  already defender-wounded; 50.4% of all drafts are re-drafts), but at
  the same rate for field-wounded ones, and the raid share of all
  re-meets is identical for defender-first (34.5%) and field-first
  (35.8%) entities. Later drafts per wound event: 1.75 (manufactured)
  vs 1.23 (pre-wounded) — a modest excess, nowhere near the 2.5x
  entity-level gap.
- Hypothesis verdict: REFUTED. Nearest-first drafting is real, but it
  does not explain the echo gap.
- Residual gap: defender-first entities accumulate 2.57 wound events
  each vs 1.54 field-first, and 4.01 re-meets per event vs 2.64, in
  BOTH contexts — context-symmetric, so the draft cannot explain it.
- Next blank (arm proposal, in the arm evidence): a field-fight
  position trace (record tx/ty at resolve time, same band) to test
  lingering-at-Haven field fights vs the counting structure itself
  (wounds never heal, so every re-meeting re-counts as a below-line
  event). Do NOT re-run the draft hypothesis; defender-finish stays
  KILLED.
- Sense story: seed 73671's Drum-Belly Tanuki — drafted 7 times,
  distances 4, 1, 2, 1, 3, 3, never at 0; the day-60 draft's toll
  re-floors it from 11% to 2% (1 HP). Full story in
  sim-echodraft-a-sense.txt.

## Wall numbers (this run's judged corpora — unchanged by design)

Both arms are measurement-only, so the wall did not move; the control
band reproduces exactly. National-ever 7/8, final 6/8 (per 1815Z),
invited 4/8, entered 4/8, wins 4/8 (lesser seat only), wave-3 8/8,
wave-4 6/8, wave-5 0/8, full seat 0/8, median survival 135d.
Zero src/js diff across the whole round.

## Metric review

- Both arms carried pre-registered DIAG-GO rules and were judged
  against them; no metric was re-scored mid-run.
- Balanced panel (§15) NOT run as a compare: same known limitation as
  defwound — the panel cannot ingest per-seed recorder corpora;
  identical-seed sweep tables are the comparison of record. No
  before/after lever pair exists (both arms instrument-only), so there
  is nothing for the panel to compare.
- Telemetry deviation check (step 10): run on both corpora —
  3 LOUD lines each, IDENTICAL: national 12 -> 0, table 16 -> 4
  (−75%), wins 16 -> 0. Verdict: EXPLAINED artifact, same class as the
  1815Z/1915Z runs — the checker reads top-level panel paths
  (national/table/wins) that recorder per-seed rows do not carry
  (they carry nationalEver/entered/won), and the WINSEAT baseline is a
  pre-seat-substrate mismatch. The arms' own verified numbers
  (national-ever 7/8, entered 4/8, wins 4/8) prove the fields exist
  under other names. Baseline NOT rolled.

## Findings appended (sim-findings.md)

- Echodraft refutation + field-fight position trace proposal.
- W4funnel never-fought loss + non-world kill door proposal.
- (The residual wound-mill steve-call item from 1915Z was already
  recorded in the decision pack by the main agent during this run —
  commit a995a1907 — and is not duplicated here.)

## Infrastructure

- Master moved 3 times under the run, all sibling lanes, zero file
  overlap with either arm: B landing 2adf91784 (rotdecide2-b +
  n2beast-b), B coordinator evidence 1b912cd9c, decision-pack refresh
  a995a1907 (residual wound-mill item, main agent).
- Safe-commit index clobber hit BOTH worker commits — repaired via
  cacheinfo each time, commits verified correct, trees clean.
- W4funnel diag proof run rewrote its own analysis.json with a new
  `generated` timestamp only (1 line, no content change) — restored
  from the branch HEAD before merging.
- Echodraft's release step removed its own worktree + branch (the
  coordinator's remove/branch-delete then reported not-found) —
  verified end state directly: both arm trees and branches gone,
  master clean.
- Coordinator worktree registration was interrupted once by a service
  restart, leaving a partial dir (branch at master HEAD, zero unique
  commits, checkout files only) with no registry entry — removed the
  dir + branch and re-registered clean.
- The final reap sweep ran 8+ minutes without finishing (same
  worktree-operation slowness class as the registrations); end state
  was verified directly instead of waiting on it. No EPERM flap
  blocked this run's writes.
- Back-to-back second round: NOT run. Both arms answered their
  questions cleanly and their next blanks (non-world kill door,
  field-fight position trace) are new instruments needing their own
  pre-registration, not a fast follow-up in this run.

## Convergence state

scale-onramp stays converging (NOT converged): the veteran leg is now
decomposed (never-fought 9/11; the only kill non-world) and the draft
hypothesis for the echo gap is refuted, but no arm in this round moves
the wall itself — national still arrives only via default-OFF policy
instruments, wins only via the lesser seat, wave 5 still unborn.
food-economy stays converging (untouched; sibling loop B).
Next blanks, in order: (1) sim-nonworldkill-a — instrument the
non-world TB door; (2) field-fight position trace — lingering vs
counting-structure for the echo gap; (3) the still-gated old-core
mechanism (1815Z blank 1, needs Steve rulings); (4) defender-fight
narration boilerplate (narration, not mechanics).

Claim deleted; lock deleted. Merged locally, pending ship.
