# Prereg — sim-inffight-a: Focus Group close-in regression-net re-probe

Run: fleshout-20261113T1115Z (Loop A), arm sim-inffight-a
Axis: scale-onramp (tracker blank #3; sim-findings.md #2298)
Branch: sim-inffight-a — worktree ~/workspace/worktrees/sim-inffight-a
Base: master a1288c5c4 (2026-11-13 batch ship 6a16152d5)
Date: 2026-11-13

## The finding (from adopting coordinator, run fleshout-20261113T1015Z,
## evidence/2026-11-13/sim-gap-round-1015.md)
`scripts/test-inffight-20261014.js` runs 9 passed / 3 failed on master
377e12141, identically with and without the freezeline fix. The 3 failures:
G1 "the heads close in" (leadPos=6,4), G1 "Deliberation lands"
(landed=0), G2 "Deliberation threatens" (landed=0) — test lines
225/226/253. The 2026-10-14 fix (encWantRange in src/js/game.js:41715
calibrates the focus_group burst to radius 1; eye-heads blocks:false)
was 12/12 GREEN at the time. The Focus Group close-in has regressed or
the test has bit-rotted: the heads hold at range and Deliberation never
lands again. The freezeline fix is NOT implicated (identical failures on
both legs; narration-only change).

## Primary metric
`scripts/test-inffight-20261014.js` pass count on current master, PLUS a
live-fight verification that the close-in genuinely happens in real sim
fights, not just fixture green.

## GO threshold
12/12 green on current master a1288c5c4 with the close-in verified in
live fights (a Focus Group fight in a real sim where the lead moves
within burst range and Deliberation lands on the scholar at least once).
Metric binding (§14): a miss is NO-GO, never re-scored mid-run.

## Live-fight leg
- Pilot first per §9: 8 seeds, matched band 190391–190398, competent
  policy, 150d death-aware horizon (dead villages stop simulating).
- If the pilot shows zero Focus Group fights in 8 seeds, escalate to a
  targeted live-fight probe (spawn focus_group in a live sim world via
  the harness, drive with the competent policy) rather than burning a
  16-seed confirm on an empty sample.

## Method
1. Re-probe: run the test on a1288c5c4, reproduce the 3 failures.
2. Determine REGRESSED vs BIT-ROTTED: read the test + encWantRange +
   focus_group/eye-heads code; git-log the touched files since
   2026-10-14 to find suspect change(s); prove with a minimal
   before/after (test at the suspect commit's parent vs the suspect
   commit, or the fixture adjusted).
3. Fix whichever side is wrong: game regressed → narrow game fix
   ([needs-eyes] if it changes fight feel); test bit-rotted → refresh
   the test to current behavior ONLY if the current behavior is itself
   correct per canon / sense-testing (a refresh that blesses a real
   regression is a fail).
4. Prove: test 12/12 green + live-fight verification + re-run of any
   adjacent fight tests the change touches.
5. ALSO CORRECT THE RECORD: verify how the test is actually invoked in
   check.js (green-list line 453 carries no 'quick' tag; --quick filters
   to quick-tagged jobs only) and state plainly whether the freezeline-a
   claim "PASSED in both check.js --quick runs" can hold.

## Canon
docs/CANON.md + docs/MONSTER-WAVES.md read. Focus Group: 5–7 floating
heads; lead carries 3 mouth-parts (each ~a third of its health); pop
all three and the group comes apart; eye-heads only watch, mark your
most-used verb, can't be struck down; be deliberately boring for three
rounds and they lose interest and leave. Steve's rule (from the
2026-10-14 fix record): monsters were sent to fight — the group closes;
it never leaves, never disengages.
