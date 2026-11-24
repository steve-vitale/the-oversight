# Loop B round 0230Z — ADOPTION closeout (winnability-chain)

Run fleshout-loop-b-20261124T0230Z, Loop B, axis winnability-chain.
ADOPTION of the dead run fleshout-loop-b-20261123T2322Z (its coordinator
died; arm 1's prereg was committed, arm 2 unstarted). The 0230Z
coordinator itself died before closeout (machine restart ~05:29Z); this
record is written by the 0530Z closeout, which recovered the run.

## Stale-lock recovery (0530Z)

B lock held 0230Z (created 2026-11-24T02:32:00Z), 3h01m old at recovery.
Registry heartbeats 2h12m+ stale (cellgate-holdout 02:34:15Z,
rearm-witness 03:17:35Z). No coordinator process in ps, no live
subagents, no file writes in either adopted tree in the 15 min before
recovery; machine uptime 3 min (restart ~05:29Z). Lock deleted in the
same call it was re-read, replaced with the 0530Z lock 05:33:28Z.
0230Z claim retired to .DEAD at this closeout. Loop A 0215Z arms NOT
touched (sibling lane; its departname-a branch is unmerged and its
0515Z run has no claim as of 06:00Z).

## Arm 1 — sim-cellgate-holdout-b: NO FROZEN VERDICT (band incomplete)

64-seed CELLGATE-floor deaths holdout, band 107670–107733 (fresh,
verified). Corpora closed at 57/64 control, 56/64 armed, 50 complete
pairs. Partial-band read: bar 5 PRIMARY passes on partial (paired mean
+0.30 deaths/run, 95% CI [-3.898, +4.498], CI upper +4.50 vs the +5
bar); bar 6 FAILS already decided (8 control volleys vs ≤6 — the
frozen calibration-note case: all 8 at wave 4+, mechanism reproduced
exactly, bar set too tight); bars 3/4/7 pass on partial (44 armed
volleys, 39 wave-3; starvation delta −4; median-survival delta
+10.5d). Missing 15 runs: ctl 107691, 107700, 107708, 107715, 107716,
107724, 107733; arm 107687, 107688, 107697, 107698, 107709, 107717,
107724, 107725. Branch sim-cellgate-holdout-b @ 6107b1fe6 NOT merged
in this closeout — its completion is the 0530Z run's arm 1 (resume),
to be merged at the 0530Z closeout. Evidence
evidence/2026-11-24/sim-cellgate-holdout-b.md + prereg
evidence/2026-11-24/sim-cellgate-holdout-b-prereg.md.

## Arm 2 — sim-rearm-witness-b: NO-GO (merged 32168a66f)

Wild-corpse expedition witness channel (finding line 2717, thread #1).
Full pilot 16/16 seeds (107734–107741, 150d, competent verbatim):
supply 1, 2 expedition takes, 0 volleys. Frozen rule: NO-GO (bar 6
pass + bar 4 fail). The two takes: seed 107737 day 73, Ella Johnson
took gun + 2 cells from Sam Wilson's corpse (second-life); held a
loaded gun 77 days, never fired. Seed 107741 day 97, Wanjiru Kamau
took gun + 2 cells from Diana Osei's corpse; held 33 days, died of
sickness, never fired. The channel works — every wild gun-corpse was
witnessed and taken (2/2) — but the guns then sat unused. The binding
constraint moved downstream: takers don't fight. Game code
(corpses.js `villagerRearmExpeditionStep` + one hook each in
villager-agency.js / villager-objectives.js) merged under the
REARM_CELLS=1 env gate, default OFF — zero live effect; the mechanism
stays available for a future arm attacking the downstream problem.
Proofs green on the rebased tip: test-rearm-witness-b 26/26,
analyzer --selftest 43/43, test-rearm-b 18/18, test-killbundle-b
11/11, test-killrate-a 36/36, test-killrate-analysis-a 14/14,
--live 51/51. Evidence evidence/2026-11-24/sim-rearm-witness-b.md +
prereg evidence/2026-11-24/sim-rearm-witness-b-prereg.md.

## Wall numbers (this round's judged corpora)

Rearm full pilot: wins 0/0, national 0/0, wave 5 2/8 both legs, wave 4
8/8, median survival 145.5d ctl / 142d arm, villages lost 3 ctl / 4
arm. Holdout partial: wave 5 23/57 ctl / 24/56 arm, wave 4 55/57 /
55/56, median 139d / 149.5d, wins/national/table not instrumented by
the holdout driver (recorded as not instrumented, never faked).

## Telemetry deviation check

`node scripts/telemetry-check.js` refuses recorder-corpus input (both
corpora carry top-level anchorCommit — sweep recorder rows, not runs).
No LOUD lines; baseline NOT rolled. Wall numbers above come from the
analyzers, never faked. (Same refusal as floor-b / holdout.)

## Infrastructure

- Machine restart ~05:29Z killed the 0230Z coordinator; a second
  restart pattern hit the 2322Z run the same way.
- Write flap ~05:41–05:43Z + intermittent .git refusals to ~05:46Z:
  the arm-2 worktree registration failed mid-checkout (orphan branch
  left behind, no worktree dir, no registry entry); recovered via a
  probe-gated retry loop (branch deleted + registration completed
  05:57:15Z). No work lost; main tree stayed clean throughout.
- Rebase stop-at-pick quirk struck once on the rearm rebase (pick
  2298a7311 in both done and todo, tree clean, pick verified unapplied
  via grep count 0 + non-empty diff; `git rebase --continue` sailed
  through 2/4–4/4). Rebased tip 32168a66f, proofs re-run green.
- Safe-commit index clobber on the rearm tree (5 staged-deleted
  per-seed files + 8 MM files + 5 D/?? files): every worktree file
  verified byte-identical to its HEAD blob (hash-object), repaired
  via the ls-tree pipe (with -r for directories); tree clean,
  commit 7453ca7e8 verified correct before the rebase.
- Master moved twice during the closeout (88d63d9fc → d94ddaa22 →
  e5dd61e96: journey-crisis r278 + ship version bump) with zero file
  overlap with the rearm branch; rebase clean.
- `node scripts/check.js --quick` NOT re-run (arm proofs green on
  the rebased tip; the only src/js change is env-gated default-OFF).
  The full repo gate is OWED before this tip ships.

## State

winnability-chain stays converging (NOT converged): the gun chain's
re-arm path now has its witness channel judged (works, but produces
no fire); the CELLGATE floor flip still awaits the 64-seed holdout
completion (0530Z arm 1). Next blanks in order: (1) cellgate floor
flip decision (holdout completion, 0530Z arm 1); (2) why gun-holders
who take guns never fight (downstream of the witness NO-GO — new open
thread, appended to sim-findings.md); (3) gate projection
retune-vs-remove design call; (4) standing accumulation on gear-ready
seeds (99107 pattern — 0530Z arm 2).

Merged 32168a66f (rearm-witness NO-GO); holdout branch 6107b1fe6 NOT
merged (resume in flight as 0530Z arm 1). Claim retired to .DEAD;
lock replaced by the 0530Z lock. Evidence:
evidence/2026-11-24/sim-winnability-round-0230.md.
