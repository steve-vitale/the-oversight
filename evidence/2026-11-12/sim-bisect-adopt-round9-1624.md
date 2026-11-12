# Bisect ROUND 9 + stall-cut-49 — coordinator evidence (run fleshout-20261112T1624Z, Loop A)

Run fleshout-20261112T1624Z, Loop A, axis scale-onramp / winnability
chain. No lock at run start (no stale-lock recovery needed). Loop B
live on its 1430Z claim (cut7confirm + gateclassify + proofrefresh-b9,
winnability chain) — NOT touched. Loop B landed mid-run
(sim-cut7confirm-b ea1ef5a75 + sim-proofrefresh-b9 fd0ee0b43); both
arms rebased clean onto the moved master, proofs re-run green after
every rebase and on merged master. This run took the 1515Z next
blanks (1) and (2) in order, on the shared band (seeds 190391–190398,
150d death-aware, competent verbatim, fix swapped in).

## Arm 1 sim-bisect-r9-cut-a — INCONCLUSIVE 4/8 + REGIONAL_INTACT 7/8

Base `ee30f22a2` (385th commit of `d229b58f5..203a32775`, midpoint of
the final 16). LANDED as 026bdbf22 (rebased from e7355996; prereg +
driver + analyzer + proof f6651826e, evidence 6dc03a94e, corpus
026bdbf22). Proof 63/63 before any judged sim, after the band, on
the rebased tree, and on merged master.

Verdict (prereg rules): survived 4/8 → INCONCLUSIVE; regional 7/8 →
REGIONAL_INTACT. Wall: wins 0, national 0, table 0, wave-5 2/8,
wave-4 8/8, median 150d, deaths 639, standing 150–425.

The finding: commits 378–385 are behaviorally LIVE — the first live
range in the bisect since the merge-base. The melee-first slot rule
moved the band off the round-8 collapse (2/8) and onto the
firstparent's 4/8 pattern: same four survivors (190393, 190395,
190397, 190398), same four death days (86/144/43/87), daily
trajectories deep-identical to the firstparent's on 6/8 seeds. Every
first divergence from round 8 is a fight outcome (days 16–109),
including a wave-4 kill the rule CREATED on 190397. But the far end
never was healthy: no commit in 378–393 can produce ≥5/8 if the far
end itself is 4/8. The 2/8→4/8 exit sits in 378–385; the healthy
pole is NOT in this window.

Wave-5 choke changed shape: the pair forms on 3/8 seeds, but 190398
holds it 19 days (d131–149) with armed 4–5 vs demand 6 and never
qualifies — cut-1's weapons-blocked case, longer; armed count falls
4 → 3 over the block. Seed 190393 ends tribute-ready — first in the
bisect since anchor2-a — and the capture still says nothing about
tribute/table/seat (0 mentions). Blooded 4/8 (was 0/8 on cuts 2–8).
Roster-check fix holds: 0 phantom days (engine + strict),
5 shadow-prevented days on dying 190394. Scream-freeze spam gone
(0 hits, was 65 on r8's 190391). ARC IV fires on 7/8 seeds
(reported-only). Evidence evidence/2026-11-12/sim-bisect-r9-cut-a.md.

Correction to round 8's published table (r9 evidence §2): r8 §2
lists 190396 vs r5-cut1 as day 4; recomputed directly from the
corpora it is day 9 under 4-field, 5-field, and deep-diff alike — a
transcription error, not a corpus difference. Recorded here and in
the findings backlog as fixed.

## Arm 2 sim-stallcut49-a — STALLCUT49_COLLAPSED 1/8 + STALL_STILL_IN 0/8

Base `1ae6dd76c` (49th commit of `d229b58f5..6dc7f8162`, midpoint of
commits 33–65). LANDED as f9e41d347 (rebased from ab22784ae; prereg
c2259a9e4, evidence + summary + corpus f9e41d347). Proof 63/63
before any judged sim, after the band, on the rebased tree, and on
merged master.

Verdict (prereg rules): survived 1/8 → STALLCUT49_COLLAPSED;
regional 0/8 → STALL_STILL_IN. Wall: wins 0, national 0, table 0,
wave-5 0/8, wave-4 8/8, median 102d, deaths 661, standing 145–199
(7/8 seeds end at exactly 199, one point short of regional).

The stall transition sits in commits 50–65 (`1ae6dd76c` →
`a18d7438c`) — the LEG 3 tribute scholar-exclusion (`b1c8e730c`,
61st commit) sits in that half. 7/8 seeds are day-identical to the
stall-cut-32 leg; only 190393 moved (112d → 129d, 8 fewer deaths) —
the double-night fix's whole visible footprint on this band.
Commits 33–49 contain no regional mechanism, now measured, not
assumed. Wave-5 choke: peak living wave-4+ veterans 1 max, never 2,
on any seed. Ladder scholar rule verified by reading the code on
this base: old inline rule, scholar always living; LEG 3
never-counts rule is not on this base. Phantom days 0. ARC IV not
captured by this instrument (recorded, not a blank to re-run —
rank is village on 8/8, so 0/8 firing is consistent by inference).
Evidence evidence/2026-11-12/sim-stallcut49-a.md.

## Wall (same band, 150d)

vetphantom 6/8; merge-base 1/8; cut-1 2/8; cut-2 2/8; r6 2/8; r7
2/8; r8 2/8; r9 4/8 INCONCLUSIVE; stall-cut 0/8; stall-cut-32 1/8;
stall-cut-49 1/8; firstparent 4/8 INCONCLUSIVE. Wins 0, national 0,
table 0 on every leg. Telemetry deviation check REFUSED on both
corpora (recorder-corpus class, same as all prior bisect arms) —
recorded, not waived, baseline NOT rolled.

## Infrastructure

- No EPERM flap this run. No runtime-restart registration failure
  this run (both trees registered clean, though the stallcut49
  registration took ~5 min under concurrent Loop B load).
- Safe-commit detached-HEAD ref-update failure hit all 5 worker
  commits (known r7/r8 pattern) — commits verified, HEAD advanced
  by hand, index clobber repaired via the ls-tree -r pipe, commits
  verified correct. No clobber on the coordinator evidence commit.
- Both worktrees arrived with COMPLETE checkouts (no stale lock, no
  restore needed) — unlike rounds 7/8.
- check.js --quick NOT re-run (both arms scripts/evidence-only,
  zero src/js; same standing as 1515Z).
- Main tree note (NOT this run's, untouched): Loop B's coordinator
  evidence evidence/2026-11-12/sim-winnability-round-1430.md sits
  untracked in the main tree — theirs, left alone.
- Proof re-run note: both proofs need the vetfirst instrument file
  as scratch on the rebased tree (it is tracked on master, so the
  scratch copy was restored with `git checkout --` after each
  proof run, leaving the trees clean).

## Axis state + next blanks

scale-onramp stays converging (NOT converged): national/table/wins
still 0 on every band; both defects are now narrowed to small
windows (collapse exit 378–385, stall 50–65) but no lever has moved
the wall numbers. Next blanks, in order:
(1) bisect ROUND 10 DECISION — the r9 prereg's decision table needs
revision before another cut: a cut in the last 8 commits (386–393,
~389th) can only localize the 190393/190397 remainder, it cannot
return CUT_HEALTHY, because the far end is 4/8. The next run must
choose explicitly: (a) a final localizing cut at ~389, or (b) stop
cutting and re-derive the healthy pole outside this window (the
vetphantom base 5157782a4 is not a simple ancestor of the far end).
(2) stall cut at the midpoint of commits 50–65 (~57th/58th commit)
— the LEG 3 scholar-exclusion (61st) sits in that half, so a cut
past it splits the ladder/scholar reads; the proof's scholar-rule
detection will matter there.
(3) proof refresh round 10 on the next manifest change (Loop B owns
round 9 — do not pre-claim; B's fd0ee0b43 already notes round 10
owed).
(4) player named-class regression_watch (13/16→10/16) — one line in
the next synergy follow-up (carried).
(5) wave-5 choke is now a pair-arming problem: the next readiness
arm should look at why armed counts fall while a pair holds
(190398 armed 4 → 3 over a 19-day block), not at pair formation.
(6) voiceless tribute now has a witness (190393 tribute-ready, zero
tribute/table/seat lines) — findings backlog item carried since
tributedeliv-b.
Claim deleted; lock deleted.
