# sim-leanlink-round — COORDINATOR RUN EVIDENCE (fleshout-20261024T1615Z, axis scale-onramp)

**Run:** fleshout-20261024T1615Z · **Axis:** scale-onramp (standing directive — directive still stands: no run has yet shown a win, and wave 5 stays 0 everywhere below) · **Type:** coordinator run — 1 orphan adoption + 3 new policy arms, all landed locally, pending ship (no push, no version bump).

## Stale-lock recovery (concurrency guard)

Lock at run start was fleshout-20261024T1347Z (created 13:48Z). Its worktree
sim-rerunclock-wallseg heartbeat was 15:43Z — 32 minutes stale (> 15 min) at
16:15Z, so per the guard the run was DEAD. Lock deleted, this run's lock +
claim written, proceeding noted here. Sibling loop B's live claim
(food-economy leg2drift/belongcost) was NOT touched; no file overlap with it.

## Adoption: sim-rerunclock-wallseg (dead 1347Z run's unlanded arm)

The 1347Z run had landed 2 of 3 arms on master (envoyaccord, linkdrive) but
died before landing rerunclock: commit 2746b24d7 existed only in its
worktree, not on master. Coordinator rebased it in-worktree onto master
(clean), re-ran its proof post-rebase (27/27 green), ff-merged as
34101b3cd, released the tree and removed worktree + branch. Verdict stands:
DIAG NO-GO — 0 doors in 32 fresh wallseg-stack configs (pilot + extension);
secondary 2/8 known doors reproduced, so the gap-loop pacing pilot is
TESTABLE. Wall (n=32): national 28, table 26, wins 0, wave 4 24, wave 5 0,
median 129.5d.

## Why this round: the linkdrive kill + the envoyaccord answer

- sim-linkdrive (1347Z): courtship moves national 0/8 → 7/8, but was
  KILLED-AT-PILOT on the starvation guardrail (armed 5 vs control 1 + 2
  allowance). Its mechanism notes say tends are NOT load-bearing on
  thin-pantry seeds (seed 73403 reached national with 0 tends).
- sim-envoyaccord (1347Z): the before-regional wall is no-proposal-made —
  50/50 envoy events, counterfactual judgeLink accept-certain (213/214).
  The missing step is the proposal itself.
- This round therefore tests CHEAPER courtship: propose + answer, with the
  tend ingredient removed or restricted. All three arms are policy-side
  only (zero src/js, no competent/linkform/leadcourt modifications),
  default-OFF candidates only, paired vs pure competent on the shared
  fresh pilot band 73501–73508, 180d death-aware, pre-registered bar:
  national armed ≥ 2/8 AND > control; guardrails starvation ≤ control+2,
  median ≥ 0.8 × control, no lever-caused death-mode spike.

## Arm results (all judged on their pre-registered bars, no re-scoring)

### Arm 1 — sim-leanlink: cap 3, NO tends → KILLED-AT-PILOT
Commit de5f21b51 (rebased from 68767b3d3; proof TEST-OK post-rebase).
Evidence evidence/2026-10-24/sim-leanlink.md, corpus perseed-leanlink/.
- Primary PASSED: national armed 3/8 vs control 0/8 (8/8 regional; 1 global).
- Starvation PASSED: armed 4 vs control 3 (allowance 5) — the linkdrive
  starvation breach is gone.
- Median guardrail BREACHED → KILLED: armed 139d vs control 180.5d
  (ratio 0.77; required 144.4d), despite FEWER total deaths armed (274 vs
  302) and identical scholar deaths (65 vs 65). Villages are lost earlier
  without more villagers dying — logged as an open measurement question
  (end-state rank vs death-count bars disagree).
- Tends 0 on every file (design invariant holds); links 26, accords 23,
  table 3/8 armed (all regional-final — table is not national-gated),
  wins 0/16, wave 5 0/16. Ever-reached national-or-better: 5/8 armed.
- Sense PASS: armed transcript reads as real diplomacy with a named cost
  for skipping gifts; control transcript is told the table wants a
  regional standing it never pursues.

### Arm 2 — sim-leanlink-rescue: cap 3, tend ONLY trust < 40 → GO CANDIDATE (pilot only)
Commit be0a68328 (rebased from 3a684860; proof TEST-OK post-rebase).
Evidence evidence/2026-10-24/sim-leanlink-rescue.md, corpus
perseed-leanlinkrescue/.
- Primary PASSED at the threshold edge: national armed 2/8 vs control 0/8.
- Starvation PASSED: 3 vs 3. Median PASSED: 173.5d vs 180.5d (ratio 0.96).
- Rescue sends: 68 attempts, ALL to links below trust 40 (highest 39) vs
  305 sends in the linkdrive drive — about a fifth of the cost. One
  village reached global with zero sends.
- Ever-reached national-or-better: 6/8 armed (4 reached global); final
  rank understates reach because realms decay — 4 of 6 climbers slipped
  back to regional. Table 6/8 armed, wins 0/16, wave 5 0/16.
- Caveats (worker's own, carried forward): confirm band 73509–73516 was
  NOT run — strongly recommended before any default discussion, given
  the threshold-edge primary. Send counts are attempts, not successful
  sends (the game refuses grain during an ally's mourning week), so true
  grain cost is lower than 68.
- Sense PASS: drift warning (day 68) → emergency grain (day 74) → first
  court (day 76) reads as the intended story.

### Arm 3 — sim-leanlink-cap5: cap 5, NO tends → GO CANDIDATE (pilot + confirm)
Commit 1184ba463 (rebased from c3dfd83e; proof TEST-OK post-rebase).
Evidence evidence/2026-10-24/sim-leanlink-cap5.md, corpus
perseed-leanlinkcap5/.
- Pilot: national 4/8 vs control 0/8. Confirm (73509–73516, run because
  the pilot passed): national 4/8 vs control 0/8 — an exact repeat.
- Combined (32 runs): national 8/16 vs 0/16; regional 16/16 vs 0/16;
  global 5/16; table 10/16; wins 0/16 both arms.
- Guardrails both bands: starvation pilot 3 vs 3, confirm 3 vs 1
  (exactly at control+2 — met, no headroom); median pilot 162.5d vs
  180.5d, confirm 178d vs 181d (both above the 0.8× floor); no death-mode
  spike. Tends 0 on every lean run (defining zero proven in data).
- 77 links formed across 32 runs; 10 ended broken-status (counted as
  dissolutions per the linkdrive correction); defense calls 0/32
  (unmeasured, not absent). Touched-ever national-or-better: 10/16 vs
  end-state 8/16.
- Mechanism: rich villages hold realms on turned-back tribute (+1/week),
  surprise ally food gifts (+4) and court feasts (+10); poor villages'
  friendships cool with no routine way back. The weekly gifts did about
  half the work in linkdrive; the 5-link headroom alone is worth about
  half the national gain, at no starvation cost.
- Sense PASS both arms: lean transcript is real diplomacy (named runners,
  real food amounts, a court with a real refuse option); control has zero
  courtship lines.

## Landing notes (coordinator)

- All three arms rebased in-worktree onto master tip at landing time
  (master had moved under the arm bases: sibling loop B's
  leg2drift-adopt-b + journey-social r49). All rebases clean except one
  expected collision: arms 1 and 3 both added scripts/sim-leanlink-sweep.js
  (278 vs 282 lines, different instruments). Resolved by keeping arm 1's
  file and renaming arm 3's to scripts/sim-leanlinkcap5-sweep.js (header
  comments + evidence line updated, content unchanged, node --check
  clean, proof TEST-OK post-rename). No worker numbers were altered.
- Proof re-runs post-rebase: leanlink TEST-OK, rescue TEST-OK, cap5
  TEST-OK. All three trees released and removed; branches deleted.
  Main tree clean after landing (git status empty).
- Shared-writer fixes landed inside arm 1's commit (byte-chunk fix to
  scripts/sim-postunlock2-b-writer.js, 12 lines): the writer split text
  by UTF-16 code units and could cut an astral-plane character (emoji) in
  half, failing its own hash check — this blocked sense transcripts in
  all three arms and is now fixed at the shared layer.
- Balanced panel (§15): attempted by all three arms, inapplicable in all
  three (panel registry has no leanlink-family policy; its compare mode
  cannot ingest these corpora) — stated explicitly in each evidence
  file, fallback identical-seed paired comparison judged by the
  pre-registered bars. Same inapplicability class as singletier/
  foreignhelp, third sighting.
- No [needs-eyes]: nothing here changes feel, combat, or UI for players
  (default-OFF policy instruments only). No defaults flipped by any arm.
- Merged locally, pending ship: the batch ship job owns pushes, version
  bumps, and live verification.

## Wall numbers (this round, pure-competent baseline + lean courtship)

| corpus | national | table | wins | wave 4 | wave 5 | median survival |
|---|---|---|---|---|---|---|
| leanlink pilot (16) | 3 (armed 3/8) | 3 | 0 | armed 7/8 | 0 | armed 139d / control 180.5d |
| rescue pilot (16) | 2 (armed 2/8) | 6 (armed) | 0 | — | 0 | armed 173.5d / control 180.5d |
| cap5 pilot+confirm (32) | 8 (armed 8/16) | 10 (armed) | 0 | — | 0 | armed 162.5–178d |

Scale-onramp stays converging, NOT converged: lean courtship reaches
national without the starvation breach (cap5 8/16, rescue 2/8 pilot), but
realms decay without tending, the win chain (table → win) is still
undemonstrated (wins 0 everywhere this round), and wave 5 stays 0/32+.

## Telemetry deviation check (coordinator-run, §10 step)

Baseline: hidden_files/telemetry-baselines/scale-wall.json (WINSEAT
full-stack corpus: national 12, table 16, wins 16).
- perseed-leanlink: LOUD national -75% (12→3), table -81% (16→3),
  wins disappeared (16→0).
- perseed-leanlinkrescue: LOUD national -83% (12→2), table -62% (16→6),
  wins disappeared (16→0).
- perseed-leanlinkcap5: LOUD wins disappeared (16→0) only.
Verdict: all LOUD lines are REGIME artifacts (pure-competent + lean
courtship corpora vs the WINSEAT full-stack baseline; cap5 n=32 vs
baseline n=16) — same class as prior runs' telemetry notes. Baseline NOT
rolled. No LOUD line indicates a real bug.

## Metric review (§14)

All three arms judged on pre-registered bars with no re-scoring. Two
metric lessons carried forward (not applied retroactively):
1. End-state rank understates reach: realms rise and decay, so
   touched-ever reach (cap5 10/16, rescue 6/8, leanlink 5/8) diverges from
   end-state national. Future scale arms should pre-register
   touched-ever alongside end-state, not instead of it.
2. Median survival and death counts can disagree (leanlink: median
   breached while total deaths fell) — the median guardrail as written
   still binds this run; the disagreement is a measurement question for
   the next run's metric review, not a re-score.

## Village assessment (plain words)

These villages finally knock back. Where pure competent villages heard
other villages climbing and never joined, the lean-courtship villages
send a runner, bow a fire, answer the court — and half of them hold a
realm, at least for a while, without starving for it. The price of
skipping the weekly grain gifts is visible in the transcripts: bonds
drift, a warning sounds, and if nobody feeds the fire it cools — realms
rise and fall instead of rising and holding. The villages that do best
are not the ones that give most; they are the ones that give exactly
when a bond dips. Nobody wins yet: the table waits, the door stays shut,
and the win itself is still the next blank.

## Named nexts (not chased this run)

1. Rescue confirm band 73509–73516 (pilot GO, threshold-edge 2/8) — run
   before any discussion of making rescue-tend the default.
2. The win chain: table → win is undemonstrated by every arm this round
   (table 10/16 cap5, wins 0) — the next blank after national reach.
3. Leanlink median-vs-deaths disagreement — measurement question for
   the next run's metric review.
4. Wave 5 door: 0 across all 48 runs this round (plus rerunclock's 0/32)
   — the door is not a courtship problem.
5. Defense calls 0/32+ and counters ~1/16 — those courtship ingredients
   remain unmeasured in these seed bands, not proven absent.

## Convergence state

scale-onramp: converging (NOT converged). food-economy: untouched by
this run (sibling loop B's axis). Claim + lock deleted at closeout.
