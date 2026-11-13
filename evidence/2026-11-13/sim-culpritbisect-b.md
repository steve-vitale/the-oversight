# sim-culpritbisect-b — inside-the-merge bisect, round 12 (fleshout-20261113T1930Z)

Run: fleshout-20261113T1930Z (Loop B), arm sim-culpritbisect-b
Axis: scale-onramp (survival collapse; masterregress localized the
drop inside merge e4dbe581b, round 11 narrowed it to
(203a32775, aa5d9ef92], 39 revisions)
Branch: sim-culpritbisect-b — worktree ~/workspace/worktrees/sim-culpritbisect-b
Date: 2026-11-13
Prereg: evidence/2026-11-13/sim-culpritbisect-a-prereg.md (binding;
same 8 seeds 190391–190398, 150d death-aware, competent verbatim
own-policy per step, fix standing.js swapped in every step, same
bisect rule: ≥3/8 GOOD, ≤1/8 BAD, 2/8 AMBIGUOUS → re-run once with
a fresh STEP id; 2/8 again → recorded AMBIGUOUS, bisect treats as
BAD). Prior round: evidence/2026-11-13/sim-culpritbisect-a.md.
This file is the round-12 prereg addendum + step record. It does
NOT re-judge any prior verdict.

## Verdict: BISECT NARROWED, NOT CLOSED (s03 done; s04 in progress below)

s03 (7688cb7a4, PR #10 snippet-stage-direction-guard) is AMBIGUOUS
2/8 on the first pass AND on the prereg-required re-run (summary
identical modulo the step id — the harness is deterministic), so
it is recorded AMBIGUOUS and the bisect proceeds treating it as
BAD. The window narrows from (203a32775, aa5d9ef92] (39 revisions)
to (203a32775, 7688cb7a4] (20 revisions). s03's per-seed days,
standing, death causes, and wall numbers are IDENTICAL to s02's
on every compared field — the 19 commits between s03 and s02
(PRs #11–#24) change nothing measurable on this band. The
collapse is still NOT (only) in standing.js: s03 stayed at 2/8
with the roster-check fix swapped in.

SHAPE WARNING (from the prereg, pre-registered): the origin
endpoints are BOTH collapsed (merge-base d229b58f5 1/8, origin tip
a628aeaf3 2/8), so this bisect may converge to the merge-base edge
with no good→bad transition inside the origin line —
DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE. s01 BAD + s02 AMBIGUOUS +
s03 AMBIGUOUS are consistent with that shape so far; the next
rounds will tell whether a single culprit commit exists or the
origin line was already collapsed at divergence.

## Round-12 fix (committed BEFORE any judged sim)

The step script's known defect: `scripts/culpritbisect-step.sh`
restored tooling scratch with `git show sim-culpritbisect-a:<path>`,
but branch sim-culpritbisect-a no longer exists (deleted after
the round-11 merge). The tooling IS on master. Fix: BRANCH
re-pointed to `master` (plus the header comment), and the proof
test gained section 4b, which reads BRANCH out of the script and
asserts it resolves to a ref carrying all four scratch files
(driver, analyzer, masterregress analyzer, vetfirst instrument)
and is NOT the deleted branch. Commit d13b55174:
"culpritbisect round 12: step script restores tooling scratch
from master, not deleted branch sim-culpritbisect-a; proof test
pins the restore source (116/116)". Proof re-run:
`node scripts/test-culpritbisect-a.js` — **116 passed, 0 failed**
(109 prior + 7 new).

Process note: after that safe-commit, the worktree index showed
both files `MM` (the known safe-commit index-clobber class) while
`git diff HEAD` was empty — the commit itself was correct.
Repaired with the documented pipe (`git ls-tree HEAD -- <paths> |
git update-index --add --index-info`), verified `git status`
clean, and only then started the bisect. The first
`git bisect start` attempt aborted on the clobbered index
("local changes would be overwritten") before the repair; the
retry after repair proceeded.

## Bisect mechanics — the merge-base skip (round-12 finding)

`git bisect start aa5d9ef92 203a32775` does NOT hand over a
midpoint directly: good (203a32775, main line) and bad
(aa5d9ef92, origin side branch) are not in an ancestor
relationship, so git first demands the merge base d229b58f5 be
tested ("Bisecting: a merge base must be tested"). The merge
base is SETTLED BAD (mergebase-a, 1/8, same band) and the prereg
forbids re-judging it — but marking it `git bisect bad` is the
wrong move in the machinery: verified in a scratch repo, git
2.43 then prints "This means the bug has been fixed between
d229b58f5 and [203a32775]" and STALLS — HEAD stays on the merge
base, no next candidate, and marking a main-line commit good
afterwards errors ("Some good revs are not ancestors of the bad
rev"). The search would pivot to the main line, which is not
the range under test.

Resolution used: `git bisect reset`, restart, `git bisect skip`
on the merge base. Git notes "we cannot be sure the first bad
commit is between d229b58f5 and aa5d9ef92. We continue anyway."
and picks the midpoint of the 39 origin commits. The skip does
NOT re-judge the merge base (settled BAD stands in the
evidence); it only keeps git's search on the origin side. This
is recorded here so the next round replays the same sequence
(start → skip merge base → mark verdicts).

## s03 — 7688cb7a4 'Merge PR #10 snippet-stage-direction-guard': AMBIGUOUS

- Candidate: 7688cb7a46367c88c7bb85e976502ddc0d5456f0, first-parent
  chain of the origin line (parents 16cdd6900 + e4836747e),
  2026-11-08, Cursor PR #10. Changes: `src/js/conversation.js`
  +12 (snippet stage-direction guard) + test
  `scripts/test-snippet-stage-direction.js` +21. Nothing else.
- Split at pick time: 20 revisions below (mb..s03), 19 above
  (s03..bad); git reported 18 revisions left (~4 steps).
- Survived 2/8, median 112d, rank RANK_STALL (regional 0/8),
  errors 0. Per-seed days 71/150/112/54/97/150/112/97 —
  survivors 190392 (150d) and 190396 (150d). Policy sha
  a7ff5c516440 (far-end policy — the garden flip at 91cb6fa20 is
  above s03). Native standing 98c8bfad70d7; fix f8fda4295a99
  swapped in and verified, native restored byte-identical
  afterwards (sha-verified by the step script).
- Wall: wins 0, national 0, table 0, regional 0/8, village 8/8,
  wave-5 2/8 (190392, 190398), wave-4 8/8, deaths 688
  (villager combat 233, expedition 162, combat 168, the wild 91,
  monster 19; the rest single digits), standing range 180–385,
  blooded 2/8 (190397, 190398), tribute-ready 0/8 (all
  veterans-short; ready4 peak 2 on 190396, ready5 peak 1 on
  190397/190398 — the wave-5 choke holds: no seed reaches 2
  living wave-4+ veterans).
- Identity with s02: per-seed days, per-seed standing, death
  causes, deaths total, wave reach, and blooded count are all
  IDENTICAL to s02 (aa5d9ef92). The 19 commits between s03 and
  s02 are survival-neutral on this band.

## s03 re-run — AMBIGUOUS again (2/8), recorded AMBIGUOUS, bisect treats as BAD

Re-run (STEP=s03r-7688cb7a4, same 8 seeds, same commit, fix
swapped in): survived 2/8, median 112d, rank RANK_STALL,
errors 0 — summary identical to the first pass modulo the step
id. The harness is deterministic, so the re-run confirms the
2/8 is structural, not noise. Per the prereg rule the re-run
was supposed to decide; it reproduced AMBIGUOUS exactly, so
s03 is recorded AMBIGUOUS and the bisect proceeds treating it
as BAD (`git bisect bad` run; git advanced to the next pick).

**Narrowed window: (203a32775, 7688cb7a4], 20 revisions.**
Next pick (from `git bisect bad`): 7ddcdfff9 'Merge PR #6
raid-danger-heard-c0a3', 9 revisions left (~3 steps). The
bisect was then `git bisect reset` and the branch checked back
out; standing.js on the branch is byte-identical to HEAD
(f9359976… — the fix is native on this branch).

## Wall numbers (this round's steps)

| step | survived | median | regional | wave-5 | wins | national | table |
|------|----------|--------|----------|--------|------|----------|-------|
| s03 | 2/8 | 112d | 0/8 | 2/8 | 0 | 0 | 0 |
| s03r | 2/8 | 112d | 0/8 | 2/8 | 0 | 0 | 0 |

(Carried forward: ep-far 4/8 median 150d regional 8/8; ep-merge
1/8 median 126d regional 8/8; s01 1/8 median 109d regional 0/8;
s02/s02r 2/8 median 112d regional 0/8 — see
sim-culpritbisect-a.md. No wins, national, or table anywhere
in any step of this bisect.)

## Files

- evidence/2026-11-13/sim-culpritbisect-b.md — this file
  (round-12 prereg addendum + step record).
- scripts/culpritbisect-step.sh — BRANCH master (fix d13b55174).
- scripts/test-culpritbisect-a.js — proof test, section 4b added
  (116/116).
- evidence/2026-11-13/culpritbisect-a-steps.log — step ledger
  (endpoints + picks + verdicts, s03/s03r appended this round).
- evidence/2026-11-13/culpritbisect-a-{s03,s03r}-7688cb7a4-summary.json
  — analyzer summaries.
- evidence/2026-11-13/culpritbisect-a-{s03,s03r}-7688cb7a4-driver.log
  — driver logs.
- evidence/2026-11-13/perseed-culpritbisect-a-{s03,s03r}-7688cb7a4/
  — per-seed JSONs (8 each).

## Proof

`node scripts/test-culpritbisect-a.js` — **116 passed, 0 failed**
(run after the BRANCH fix, before any judged sim). The proof
covers the driver guards, the analyzer's bisect/rank/boundary
rules, the step runner's swap/restore mechanics, the substrate
facts, and (new, §4b) the step script's restore source.

## Metric review

No metric proved wrong. The AMBIGUOUS band (==2/8) did its job
a second time: s03 sits exactly on it, and the re-run rule —
not a re-score — decides it. New process notes for the next
round: (1) when good and bad are not in an ancestor
relationship, `git bisect start` demands the merge base first —
skip it in the machinery (settled verdict stands) rather than
marking it bad, which stalls/inverts the search; (2) s02 and
s03 are fully identical on this band, so the bisect's remaining
steps are cheap to run and the AMBIGUOUS plateau may persist
across several picks — the DIAG shape warning grows stronger
with each identical read, and if s04–s06 also read 2/8 the
round should say so plainly rather than grinding the whole
remaining window one pick at a time.

## Next pick (for round 13)

`git bisect start aa5d9ef92 203a32775`, skip the merge base
d229b58f5, mark s03 (7688cb7a4) bad (recorded AMBIGUOUS,
treated as BAD), and git checks out 7ddcdfff9 'Merge PR #6
raid-danger-heard-c0a3' — run it as s04-7ddcdfff9. 9 revisions
left (~3 steps) after that pick; the window after s04 depends
on its verdict.
