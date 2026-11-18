# sim-winnability-round-1030 — Loop B 1030Z adoption closeout

Run: fleshout-loop-b-20261118T1030Z, axis winnability-chain. The run
coordinator timed out at 7200s; both arm workers were cancelled
~12:31Z with no result of their own. This adoption verified the
coordinator state against git/files, completed both live arms, and
landed them. Arm 3 sim-partytrios-b was DROPPED, UNSTARTED
(registration killed by the ~12:07Z VM restart; partial tree removed,
branch deleted) — NOT re-registered here; it returns to the
next-blanks queue.

## Arm 1 — sim-fleerepair3-b — BUILD GO, LANDED `d4d1eae52`

Finding #2500: launched parties flee round 1 with 0 damage vs The
Suburb. Fix (`src/js/fieldFights.js`, env-gated `FLEEREPAIR3=1`,
default OFF): after the leave log line, `if (fleerepair3On()) break;`
— the fight ends so the monster phase never lands a parting hit.
Commits: prereg `6e401d5b6`, fix `0b8312f20`, evidence `d4d1eae52`
(rebased twice: first onto `b97a67015`, then onto `29b36f16b` after
the merge race below).

Proof `scripts/test-fleerepair3-b.js` 14/14 (re-run by the adoption on
both rebased tips): flag OFF leave-first vTaken 13 → ON vTaken 0
(same RNG seed); outcome still vFlee/fleeWise/rounds 1/dealt 0;
monster-first hit preserved; wounded leaver OFF vDie (vTaken 44) →
ON vFlee vTaken 0; trick-unknown and strike fights identical OFF vs ON.

Panel: 8 seeds 103601–103608, 150d, competent verbatim, substrate
VETREENGAGE=1 + PARTYSIZE4=1, FLEEREPAIR2 unset, FIGHTALLY2 unset.
Control 8/8; armed 8/8 (seed 103601 finished before the worker was
cancelled; seeds 103602–103608 resumed by the adoption). Analyzer
verdict GO (`fleerepair3-b-analysis.json`):

- B1 parting hits 13 → 0 (armed 0; control 13 ≥ 1, calibration gate
  met). Leave-first mean damage taken 12.92 → 0. Wise-leave deaths
  2 → 0.
- B2 wave-4 kills 4 → 6 (armed ≥ control).
- B3 deaths 698 → 694, expedition deaths 230 → 232 (within ×1.10).
- B4 proof green (above).
- Instrument CLEAN: 8/8 files both legs, 0 errors, missingHp 0,
  recMismatch 1/1 on both legs.
- B5 balanced panel: decision `review_required` (standard screen-only
  outcome for an 8-seed panel, confirmationSized false), no metric
  regression — village deaths 87.25 → 86.75, community loss
  0.375 → 0.375, survival unchanged, wins 0 both legs.

The smoke-analysis NO-GO (`fleerepair3-b-smoke-analysis.json`) is an
artifact: it was run with ctlDir == armDir == the smoke dir (only the
ctl 103602 file), so both legs analyzed the same file. The full-panel
analysis supersedes it. Finding #2500 FIXED.

## Arm 2 — sim-winplandepart-b — DIAG-GO, LANDED `c78cf83a6`

The win-plan depart path (`winPlanDepart`, `src/js/win-plan.js`):
does it ever launch wave-4+ parties, and does its launch-time
second-companion re-pick work? Live play never reaches it — the only
caller (`villager-agency.js:446`) runs only when `vbrainOwnsDawn()`
is false, and that returns true unconditionally
(`villager-brain.js:738`). Commits: prereg + instrument `0727913e4`,
analyzer fix + evidence `c78cf83a6`.

Staging: harness override `Game.vbrainOwnsDawn = () => false`,
asserted before the run; `brainOff: true` per file. Single leg
(brainoff); scale-wall numbers descriptive only. Substrate
VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1. Pilot: 8 seeds
104021–104028, 150d, competent (seeds 104021–104025 pre-cancellation;
104026–104028 run by the adoption).

Analyzer fix (caught on the first pilot seed): the committed analyzer
misclassified launch-time re-picks — the call site is the
`launchParty` closure inside `winPlanDepart`, so the raw frame reads
`at launchParty (src/js/win-plan.js:...)` while the driver labels the
caller `'other'`. Fix classifies from the raw `callerFrame`
(`launchParty|winPlanDepart` / `winPlanCands`) + selftest synth3.
Selftest 9/9 including the frozen-triodrought dry run reproduced
exactly (arm 25 / 0 / 0; ctl 18 / 0 / 0). Proof
`scripts/test-winplandepart-b.js` 18/18 (re-run on the rebased tip).

Results (`winplandepart-b-analysis.json`, 8 seeds): departCalls 869,
departLaunches 238, **w4Launches 16** (pool floor ≥3 met); repicks
**carried 10 / dropped 1 / null 5 / unjoined 0** — every wave-4
launch classified; **trioDeparts 10, triosDeltaSum 10, endTriosTotal
10, triosMatchAll true** — partyTrios delta = 1 on every launch where
the second companion departed; **brainCalls 0 on all 8 seeds**;
secondPicksDepart 16 / dawn 48 / other 0; instrumentErrors 0.

Verdict DIAG-GO: the depart path is live code that works when
reached. The zero launches on live-mode bands are entirely explained
by the `vbrainOwnsDawn` gate. No game-code change in this arm.
Whether the path *should* fire in live play is a design question for
the coordinator/Steve (open). Note: the depart path's trio counting
is internally consistent here; the triodrought `partyTrios`-counter
issue (reads 0 despite 22 trios) is in a different path and is
neither explained nor fixed by this diag.

## Gate

`check.js --quick` on the final tip `c78cf83a6`: **335 passed, 6
failed in 583s**, 0 attributable (log: goal
hidden_files/loop-b-1030Z-gate.log). The 6 are the standing set:
measurement-proof staleness pair
(test-measurement-proof-update.js + test-measurement-workflow.js —
proof inputs not current after src changes; the same pair was failing
before these merges, e.g. r144 Q4 adjudicated it standing);
phone-frame stale receipt (test-phone-frame-proof.js); ladder-bundle
control (test-ladder-bundle-20261108.js — 200 monster turns without
delivery fire 0 ambient raids); two 120s timeouts under load
(test-living-garden-deed-attainment.js,
test-one-person-army-deed-attainment.js). Notably the
measurement-cache-flags load artifact did NOT fire this run.

## Telemetry

Telemetry deviation check: REFUSED recorder-corpus input (all 8 arm
rows carry top-level anchorCommit) — baseline NOT rolled. Same
documented refusal as prior rounds.

## Wall

From the fleerepair3 panel: national-standing villages 1 → 2,
national rank 0, table 0, wins 0, wave-4 faced 7/8 both legs, wave-5
faced 1 → 2, median survival 150d. The standing-199 stall persists
(most seeds park at exactly 199). Wins still 0 everywhere — the
launch/flee links move, but the win chain beyond them is untouched.

## Infrastructure

- Merge race: the first fleerepair3 merge attempt raced the Lane A
  r144 landing (master moved `b97a67015` → `29b36f16b` mid-merge, exit
  128, ref-update failure) and dirtied the main tree (my files
  staged-added, r144 files staged-deleted, game.js MM). Repaired from
  HEAD (my files removed from index + worktree after verifying them
  safe on the branch, r144 index entries restored via the ls-tree
  pipe, fieldFights.js checked out), verified clean (status/diff
  empty, game.js blob == HEAD), rebased onto `29b36f16b`, re-ran
  proof, merged cleanly. Second merge race of the morning on this
  tree (r144's own first attempt raced r236 the same way). Nothing
  lost on either side; the r144 landing (`cc35d76b9`, `80128cad6`,
  `29b36f16b`) is intact.
- No write flap observed during this adoption (drivers + commits all
  clean). Safe-commit index clobber hit both arm evidence commits
  (repaired via the `ls-tree -r` pipe; commits verified correct).
- Both arm worktrees are merged; branches kept (reaper releases the
  trees on its normal cycle). Lock + claim deletion is the last
  closeout step.

## Winnability chain stays converging (NOT converged). Next blanks, in order

1. #2515 confirm — launchparty sense fix + triodrought carry together,
   on a band where trios launch (or a fill-rate bar that does not).
   WAITS: launchparty-sense-a (Loop A 1015Z) has NOT landed on master
   yet; its adoption is the parent's pending item.
2. `partyTrios` counter fix/retire (reads 0 despite 22 trios on the
   live-brain path). NOTE from this run: the DEPART path's trio
   counting is internally consistent (triosDelta == endTrios on all 8
   brainoff seeds) — the counter bug is in the live-brain pick path,
   not the depart path.
3. Outmatched-avoid on the wild routers (fightgate follow-up, priced
   2 deaths + 288 flee damage per 113 meetings). NOTE: this is Loop
   A's wildavoid arm (1015Z) — check whether it landed before
   re-planning; it had NOT landed on master at this adoption's last
   check.
4. Win-plan depart path exercise — ANSWERED by this run (DIAG-GO):
   the path works when reached. The remaining item is the DESIGN call
   (should it fire in live play?) — for the coordinator/Steve, not a
   build arm as scoped.
5. Veteran-guard half of the fight gate (unmeasured — needs a
   table-stage veteran to exist first).
6. Handoffrec re-run on a band staging ≥1 range-0-holder blocked
   selection (carried from 0647Z; claimed by Loop A handoffrec2-a in
   1015Z).
7. partytrios counter fix retry — the dropped arm 3 of this run
   (sim-partytrios-b, unstarted, registration killed by the VM
   restart) returns to the queue; scope it against blank 2 above
   (the counter bug's location is now narrower: live-brain pick path,
   not depart path).

Claim retired to .DEAD; lock deleted. Evidence: this file (branch
sim-winnability-round-1030, ff-merged onto the final tip).
Both arms merged locally pending ship; nothing held.
