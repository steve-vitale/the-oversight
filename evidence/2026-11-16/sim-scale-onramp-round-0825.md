# sim-scale-onramp-round-0825 — coordinator evidence (Loop A)

Run: fleshout-20261116T0825Z, axis scale-onramp (converging, NOT
converged). Two arms, both landed locally, pending ship.

## Arm 1 — sim-gateconfirm-a: CONFIRM NO-GO (vacuous)

The profile-gate bypass, tested AS LANDED on a fresh 12-seed band
(102021–102032, 150d, tableseat-nowait): the armed leg launched 1
wave-4+ plan on 1 seed — and the control leg launched the SAME
plan on the SAME seed by the SAME wanderer on the SAME day. The
two legs are bit-identical trajectories on all 12 seeds. The
bypass changed nothing because no non-ranger holder ever held a
`party_launch` commit at a tick on this band (control recorded
zero profile-gate-veto rows). The chain stalls one step earlier,
at the seed: 109 seed calls in 12 seeds, 100 of them arriving
while the holder's plan was already out hunting. The pilot already
proved the gate in isolation WITH a seed source (6 launched on
4/8 seeds). The fix stays on master; whether the seed call lands
with the gate fix, as a chain repair, is the coordinator's
decision — this confirm is the evidence for it. Deaths term clean
(delta 0). Proof 90/90 on all three tips. Evidence:
`evidence/2026-11-16/sim-gateconfirm-a.md` (commits `700227500`,
`962b65164`, `b659acdd5` — merged before this round's closeout).

One new open finding appended by the arm: DOUBLE-BOOKED COMPANION
— seed 102028 day 71, Dylan launched his own party AND joined
Aki's party as companion in the same dawn. Design question: is
launching your own party supposed to exclude you as someone
else's companion that dawn?

## Arm 2 — sim-killfail-a: DIAG-GO

Why launched wave-4 parties get 0 kills, decomposed on a fresh
8-seed band (102041–102048, 150d, tableseat-nowait). 9 launched
fights, 9/9 classified, 0 kills. Ranked answer: evaded 6,
drove-off 1, died 1, out-damaged 1. Trick-unknown 9/9 and
launched-short 9/9 dominate; ammo/gear exonerated (0 dry, 0
under-geared). Wild comparison: 38 wild wave-4 fights, also 0
kills — the failure is wave-4-wide, not launch-specific. Contact
party is 3 in all nine despite launch-as-2, so a launch-as-3
lever must move the kill rate, not just contact size. Proof
115/115. Panel compare review_required, no material signal.
Evidence: `evidence/2026-11-16/sim-killfail-a.md` (commits
`4a44b5cef`, `e8e5b7c74`, `686b49009`, `a4c378242` + evidence
commit in this adoption).

## Round state

- Wall numbers: gateconfirm band — wins 10/12 both legs,
  national (standing ≥200) 1/12 (seed 102032, standing 277),
  wave-5 1/12. Killfail band — wins 8/8 (seat-taken under
  tableseat-nowait, standing 199), national (standing ≥200)
  0/8, wave-5 0/8. No wall number moved by either arm; both
  arms are measurement, not levers.
- Scale-onramp stays converging (NOT converged): the chain is
  now decomposed link by link with measured numbers at every
  step — the gate fix is inert without a seed source, and the
  launched parties that do form fail at the trick and at the
  meeting, not at ammo or gear. Next blanks, in order: (1) the
  seed-call + gate-fix chain repair decision (coordinator);
  (2) a trick-teaching lever (prereg candidate, GO bar: kill
  rate ≥2× killfail's 0/9 on a fresh band — note the bar needs
  care at a zero baseline); (3) companion-pool marginals
  (Loop B, live — do not touch); (4) family-7 program
  decision; (5) headcount-ceiling, wild-Reunion mirror pack,
  answercourt landing decision, competent seat-taking BUILD
  (all Steve-calls).
- No `check.js --quick` for this round (zero net src/js both
  arms; both proofs green on their tips; Loop A's 0645Z run
  recorded the standing profile 334/6 on the same master).

## Closeout (adoption)

The 0825Z coordinator timed out at the cron deadline before
closeout: arm 1 was already merged (`b659acdd5`); arm 2's
analysis was finished (DIAG-GO, 115/115) but its evidence file
was unwritten, corpora/panels uncommitted, and the lock + claim
still present. The adopting coordinator verified the run dead
(no hbloop process, no live processes in the tree, last
heartbeat 10:21:23Z), heartbeated the tree (10:29:45Z), wrote
this file and the killfail evidence file from the finished
analysis (no number re-scored), re-ran the proof (115/115),
committed via the worktree's safe-commit.sh, rebased onto
then-current master, re-ran the proof on the rebased tip,
ff-merged, released the worktree, and deleted the lock + claim.
Tracker updated (scale-onramp line, re-read before updating).
Findings appended to `sim-findings.md`.
