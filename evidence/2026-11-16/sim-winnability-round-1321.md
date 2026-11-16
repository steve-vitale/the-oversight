# sim-winnability-round-1321 — adoption closeout (Loop B, run fleshout-loop-b-20261116T1321Z)

**Run:** fleshout-loop-b-20261116T1321Z (Loop B), axis winnability chain.
**Verdict: PARTIAL — 1 arm landed (haventarget DIAG GO), 1 arm incomplete (seasoning, G1 ruling owed), 1 arm not started (trickteach, flap-held). No game-code change anywhere in this round.**
**Cause of the timeout:** the run recovered the dead 1130Z run's stale lock, adopted its three orphan arms, and was itself killed by the recurring host write flap (window 14:33–~14:56Z) during the haventarget rebase. Adoption closed in the main session after the flap cleared (watcher ALL-OK from 15:00Z).

## Pre-flight / deconfliction
- Main tree clean at adoption start (master ef8bd7177); disk 43%.
- Loop A 1315Z live on blanks #1 seedland, #2-DIAG tricklearn, #4 haventick (band 102141–102148) — not touched.
- 1321Z claim (blanks #6 seasoning, #9 haventarget, #2-build trickteach; band 102201–102208) retired at closeout; lock fleshout-loop-b-20261116T1321Z deleted after run_id verification.

## Arm 1 — sim-haventarget-b: DIAG GO, LANDED
- Branch commits (rebased onto ef8bd7177, clean, all-new files): prereg c9c375c6e, instrument f8a325b3a, evidence 94abc9793. Proof re-run green on rebased tip: 48/48. ff-merged; tree released; branch deleted.
- **Zero Haven-target expeditions: 0 of 103 landed (0 of 198 launch attempts)** on band 102201–102208, 150d, competent verbatim. All 198 attempts `vbrain-party_launch`; random-agency and winplan-party_launch never fired (H1 untested, not confirmed); `plan.node` flowed into the target in 4 cases but never (4,4) (H2 mechanism live, instance absent). Unknown origins 0; D3 re-derivation mismatches 0.
- Wall (both legs, bit-identical): national-by-standing 2/8, by-rank 0/8, table 0, wins 0, wave 4 8/8, wave 5 2/8, median survival 150d, wave-4 kills 21, deaths 554. Recorder neutral (D2 full-band 0 divergences).
- Findings appended to sim-findings.md: medic-duty candidate starves expeditions on whole seeds (3 seeds launched 0 in 150d); standing stalls at exactly 199 on 5/8 seeds; random expedition launch never fired in 198 attempts.
- Full evidence: evidence/2026-11-16/sim-haventarget-b.md (prereg sim-haventarget-b-prereg.md, 16 per-seed JSONs, haventarget-b-analysis.json).

## Arm 2 — sim-seasoning-b: DIAG INCOMPLETE, G1 ruling owed
- Prereg a63fb009e + instrument ed84aa941 committed; 16/16 per-seed JSONs validated; analyzer output written (uncommitted); two instrument bugs fixed (uncommitted). Sweep completed via TCP runner after EPERM gaps.
- **G1 verdict BLOCKED by 4 unclassified staged-days needing a ruling.** Evidence file NOT written. Held in worktree sim-seasoning-b for the next Loop B run to rule on the 4 days, write the evidence, and land or kill.
- Band 102201–102208 stays reserved to this arm until its verdict lands.

## Arm 3 — sim-trickteach-b: BUILD pilot NOT STARTED, flap-held
- Branch deleted; registration failed on flap EPERM (could not create ref). No worktree, no prereg, no sims. Next Loop B run retries registration on band 102201–102208 (blank #2 lever form: one observation teaches a wave-4 trick, threshold 2→1).

## Sibling state (not touched)
- Seedland (1115Z arm, Loop A 1315Z blank #1): worker resumed post-flap — heartbeat 14:57:35Z, instrument commit bc9806fcd, seed-call commit e5e398153 (branch only), control panel 8/8 done, subject leg running. Its evidence commit belongs to its coordinator once the panel verdicts; the 1115Z closeout is stale and was NOT committed.

## Wall numbers (this round, haventarget legs)
National-by-standing 2/8, national-by-rank 0/8, table 0/8, wins 0/8, wave 4 8/8, wave 5 2/8, median survival 150d. Telemetry check: not run on this round (DIAG, no game change; baseline untouched).

## Metric review
- Haventarget prereg bars all held as instrumented (5/5 GO). The 0-count verdict is the count table itself, per prereg; the awayhaven band-102133 mechanism stands as the existence proof, not re-measured.
- Seasoning G1: the 4 unclassified staged-days are a prereg gap (no rule covered their shape). Next run rules them and records the rule; do not re-score the arm against a friendlier bar.

## Tracker
Convergence tracker: blank #9 CLOSED (haventarget GO); #6 seasoning OPEN pending G1 ruling; #2-build trickteach OPEN (not started); #1 seed-call + gate-fix chain repair OPEN (Loop A); #2 trick question OPEN (Steve/design call). Winnability chain stays converging.
