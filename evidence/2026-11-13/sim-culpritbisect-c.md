# sim-culpritbisect-c — inside-the-merge bisect, round 13 (fleshout-20261113T1415Z)

Run: fleshout-20261113T1415Z (Loop A), arm sim-culpritbisect-c
Axis: scale-onramp (survival collapse; masterregress localized the
drop inside merge e4dbe581b, round 12 narrowed it to
(203a32775, 7ddcdfff9], 10 revisions)
Branch: sim-culpritbisect-c — worktree ~/workspace/worktrees/sim-culpritbisect-c
Date: 2026-11-13
Prereg: evidence/2026-11-13/sim-culpritbisect-a-prereg.md (binding;
same 8 seeds 190391–190398, 150d death-aware, competent verbatim
own-policy per step, fix standing.js swapped in every step, same
bisect rule: ≥3/8 GOOD, ≤1/8 BAD, 2/8 AMBIGUOUS → re-run once with
a fresh STEP id; 2/8 again → recorded AMBIGUOUS, bisect treats as
BAD). Prior round: evidence/2026-11-13/sim-culpritbisect-b.md.
This file is the round-13 prereg addendum + step record. It does
NOT re-judge any prior verdict.

## Verdict: DIAG CONDITION MET — ORIGIN COLLAPSED AT DIVERGENCE (s05 + s06 done)

s06 (a76333124, 'Merge PR #3 brawler-ascension-deed-45d4') is
**BAD 1/8** on the first pass — no re-run required (≤1/8 is BAD per
the prereg rule, not AMBIGUOUS). a76333124 is the earliest origin
commit after the merge base: its first parent IS the merge base
d229b58f5, itself settled BAD 1/8 (mergebase-a). With s06 BAD, the
pick sequence in line order (good end → bad end) reads s06 1/8,
s05 1/8, s04 2/8, s03 2/8, s02 2/8, s01 1/8 — no pick anywhere has
read ≥3/8, so no good→bad transition exists inside the origin line.
That is exactly the prereg's DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE
condition: the earliest origin commit(s) already read ≤1/8, and the
first origin commit's parent, the merge base, is settled 1/8. The
condition is MET; this arm states it plainly in the evidence and
does NOT grind the last revision (447085506, the brawler-deed
commit itself — the only untested revision left; git reports 0
revisions left after it). The coordinator formally calls the DIAG
verdict in the tracker; this arm does not call it, it supplies the
evidence for it.

s05 (c0a85b17e, 'Merge origin/master into forager deed branch') was
**BAD 1/8** on the first pass (see the s05 section below). The
window narrowed from (203a32775, 7ddcdfff9] (10 revisions) to
(203a32775, c0a85b17e] (6 revisions), and s06 closes it to the
merge-base edge. The 2/8 plateau broke downward at s05 and stayed
broken at s06: the two lowest picks in the origin line both read
1/8, and s06 is the first step with the LOWEST median of any bisect
step (102d). The collapse is still NOT (only) in standing.js: s06
stayed at 1/8 with the roster-check fix swapped in, at the commit
closest to the divergence itself.

## s05 — c0a85b17e 'Merge origin/master into forager deed branch': BAD

- Candidate: c0a85b17e6a79960ae216f4ae5d1879f55f362f7, a branch
  merge (NOT a PR merge), 2026-11-08 21:03 UTC. Parents:
  c15b8c56c 'Living Garden: lived harvest deed gates Forager
  ascension' + fbb9c53ed 'Merge PR #4 person-trust-map-41aa'.
- Merged content (from the diffs against both parents):
  - Vs first parent (the forager-deed side): the person-trust
    line — `src/js/person-trust.js` NEW (233 lines, per-villager
    trust map written from lived events), `src/js/godpath.js`
    +24, `src/js/bond-initiation.js` +13, `src/data/godpaths.json`
    +6, plus the PR #4 evidence/tests (person-trust panel,
    162-line test) and ONTOLOGY note.
  - Vs second parent (the trust side): the forager-deed side —
    `src/js/godpath.js` +86 (lived harvest deed gating Forager
    ascension), `src/data/godpaths.json` +8, 194-line
    test-forager-deed.js, ROADMAP/INTAKE-TELEMETRY updates.
  - The two side branches underneath: PR #3 brawler ascension
    deed (447085506 'Add lived Brawler ascension deed
    (outmatched_kill)' + 458811411 'Write per-villager trust map
    from lived events') merged onto the merge base by a76333124.
- Split at pick time: 6 revisions in the window below/through
  the pick (mb..s05 by rev-list: c0a85b17e, fbb9c53ed, a76333124,
  c15b8c56c, 458811411, 447085506); git reported 3 revisions left
  (~2 steps) after marking it bad.
- Survived 1/8, median 125d, rank RANK_STALL (regional 0/8),
  errors 0. Per-seed days 136/145/125/111/100/121/115/150 —
  sole survivor 190398 (150d). Policy sha a7ff5c516440
  (far-end policy — the garden flip at 91cb6fa20 is above s05).
  Native standing 98c8bfad70d7; fix f8fda4295a99 swapped in and
  verified, native restored byte-identical afterwards
  (sha-verified by the step script; tracked tree clean on
  `git bisect reset`, standing.js on the branch f9359976…,
  byte-identical to HEAD).
- Wall: wins 0, national 0, table 0, regional 0/8, village 8/8,
  wave-5 0/8, wave-4 8/8, deaths 716 (villager combat 272,
  expedition 175, combat 138, the wild 76, monster 19, arena 7,
  contest 5, sickness 4, wound 8, starvation 1, thirst 2,
  dehydration 1, ambush 2, the night 2, Loud-Eyes 1, Spool 1,
  a stranger 1, The Redactor 1), standing range 150–199
  (per-seed 199/199/199/150/199/199/199/199), blooded 1/8
  (190397), tribute-ready 0/8 (all veterans-short).
- Wave-5 choke: ready5 peak 1 (190397 only, ladderVets4 1);
  ready4 peak 3 (190398, the sole survivor) but ready5 0 there.
  No seed reaches 2 living wave-4+ veterans — the choke holds,
  and s05 is the first step where NO seed even unlocks wave 5.
- Contrast with s02/s03/s04: s05 dies harder on the same band
  (median 125d vs 110–112d, but only 1 survivor; deaths 716 vs
  592–688 — the highest death total of any bisect step; wave-5
  0/8 vs 2/8). The person-trust / forager-deed merge content
  does not lift survival; if anything the trajectories sink
  further toward the merge-base's 1/8.

## No re-run

1/8 is BAD outright under the prereg rule. The re-run leg of
the rule applies only to 2/8 AMBIGUOUS reads; s05 needed none.
`git bisect bad` was run directly after the step.

**Narrowed window: (203a32775, c0a85b17e], 6 revisions.**
Next pick (from `git bisect bad`): a76333124 'Merge PR #3
brawler-ascension-deed-45d4', 3 revisions left (~2 steps). Its
first parent IS the merge base d229b58f5 — a GOOD read there
would pin the transition to the brawler-deed merge itself; a
BAD read there would converge the bisect to the merge-base
edge. The bisect was then `git bisect reset` and the branch
checked back out; standing.js on the branch is byte-identical
to HEAD (f9359976… — the fix is native on this branch).

## s06 — a76333124 'Merge PR #3 brawler-ascension-deed-45d4': BAD

- Candidate: a76333124945dbb851ba29120e2dad3e2d2405f6, a PR merge,
  2026-11-08 21:02 UTC. Parents: d229b58f5 'Version bump
  2294ef815-20261108-112829 (batch ship)' (the merge base itself)
  + 447085506 'Add lived Brawler ascension deed
  (outmatched_kill)'. The earliest origin commit after the
  merge base: the whole origin line hangs off this merge.
- Merged content (diff vs first parent, the merge base — the
  diff vs the second parent is EMPTY, a clean merge with no
  resolution changes): `src/js/godpath.js` +24 (lived Brawler
  ascension deed gating on an outmatched kill), `src/data/
  godpaths.json` +6, `scripts/godpath/ladder.js` +5,
  `scripts/godpath/validate.js` 1-line change,
  `scripts/proof-godhood-rework-20261013.js` +8/−?,
  `scripts/godpath/test-brawler-deed.js` +196 (new test),
  `evidence/2026-11-08/brawler-deed-audit.md` +42. Nothing else.
  The brawler-deed content is the ONLY thing this merge adds
  over the settled-BAD merge base — and the merged tree still
  reads 1/8, exactly the merge base's read.
- Split at pick time: 0 revisions left to test after this pick
  (~0 steps) once marked bad; the only untested revision in the
  window is the second parent 447085506 itself.
- Survived 1/8, median 102d (the LOWEST median of any bisect
  step: s01 109d, s02/s03 112d, s04 110d, s05 125d), rank
  RANK_STALL (regional 0/8), errors 0. Per-seed days
  95/150/112/139/86/102/83/62 — sole survivor 190392 (150d).
  Policy sha a7ff5c516440 (far-end policy — the garden flip at
  91cb6fa20 is above s06). Native standing 98c8bfad70d7; fix
  f8fda4295a99 swapped in and verified, native restored
  byte-identical afterwards (sha-verified by the step script;
  tracked tree clean on `git bisect reset`, standing.js on the
  branch f9359976…, byte-identical to HEAD).
- Wall: wins 0, national 0, table 0, regional 0/8, village 8/8,
  wave-5 0/8, wave-4 8/8, deaths 669 (villager combat 254,
  expedition 183, combat 104, the wild 83, monster 15, arena 9,
  sickness 8, wound 4, ambush 2, starvation 1, contest 1, a
  stranger 1, The Callback 1, Gavel 1, The Loud Beast 1, Spool
  1), standing range 145–199 (per-seed 199/199/199/199/199/
  199/199/145), blooded 1/8 (190394), tribute-ready 0/8 (all
  veterans-short).
- Wave-5 choke: ready5 peak 1 (190394 only, ladderVets4 1);
  ready4 peak 2 (190398) but ready5 0 there. No seed reaches 2
  living wave-4+ veterans — the choke holds, and s06 is the
  second consecutive step with NO seed even unlocking wave 5.
- Contrast with s05: s06 dies FASTER (median 102d vs 125d;
  worst seed 62d vs 100d) on fewer deaths (669 vs 716) — the
  villages at the divergence edge collapse early rather than
  grinding. The brawler-deed merge content does not lift
  survival above the merge base it sits on; the 1/8 read is
  identical to the merge base's own settled read.

## No re-run (s06)

1/8 is BAD outright under the prereg rule. The re-run leg of
the rule applies only to 2/8 AMBIGUOUS reads; s06 needed none.
`git bisect bad` was run directly after the step. No
boundary-pair confirmation applies: there is no GOOD parent to
confirm against — the parent IS the settled-BAD merge base, so
no good→bad transition exists to confirm. Per the task's
branching outcome for a BAD s06, the last revision
(447085506) is NOT ground: the prereg's DIAG outcome is the
answer, not a failure. The bisect was then `git bisect reset`
and the branch checked back out; standing.js on the branch is
byte-identical to HEAD (f9359976… — the fix is native on this
branch).

**Window after s06: (203a32775, a76333124] — converged to the
merge-base edge. One untested revision remains (447085506,
the brawler-deed commit itself, git's next pick) and it is
deliberately NOT run.**

## Wall numbers (this round's step, with carried-forward rows)

| step | survived | median | regional | wave-5 | wins | national | table |
|------|----------|--------|----------|--------|------|----------|-------|
| s05 | 1/8 | 125d | 0/8 | 0/8 | 0 | 0 | 0 |
| s06 | 1/8 | 102d | 0/8 | 0/8 | 0 | 0 | 0 |

(Carried forward: ep-far 4/8 median 150d regional 8/8 wave-5
n/a; ep-merge 1/8 median 126d regional 8/8; s01 1/8 median 109d
regional 0/8; s02/s02r 2/8 median 112d regional 0/8 wave-5 2/8;
s03/s03r 2/8 median 112d regional 0/8 wave-5 2/8; s04/s04r 2/8
median 110d regional 0/8 wave-5 2/8 — see sim-culpritbisect-a.md
and sim-culpritbisect-b.md. No wins, national, or table anywhere
in any step of this bisect.)

## Process notes

- The step script was run from a scratch copy at
  ~/workspace/scratch-culpritbisect-c/culpritbisect-step.sh
  (byte-identical to master, diff-verified), with
  REPO=<worktree>: the bisect checkout at c0a85b17e removes
  scripts/culpritbisect-step.sh from the worktree (it does not
  exist at that 2026-11-08 commit), so the script cannot run
  from inside the tree at pick time. This is the mechanism its
  own header prescribes ("run the script from a /tmp copy so the
  detached checkout cannot unlink the running script itself");
  the copy lives under ~/workspace/scratch-*, not /tmp, per the
  loop's scratch rule. No tooling change resulted — the script
  on the branch is untouched.
- The bisect replay matched round 12 exactly: `git bisect start
  aa5d9ef92 203a32775` demands the merge base d229b58f5 first;
  `git bisect skip d229b58f5` (settled BAD, not re-judged);
  mark s03 (7688cb7a4) bad, s04 (7ddcdfff9) bad; git checked out
  c0a85b17e as predicted — verified before running.
- s06 replayed the same sequence with s05 (c0a85b17e) marked
  bad as well; git checked out a76333124 as predicted —
  verified before running (first parent confirmed to be the
  merge base d229b58f5). The s06 step ran slow (~13.5 min wall
  vs ~4 min for prior steps): a sibling balance-panel run
  (sim-proofrefresh-b11) was competing for CPU at the same
  time. The verdict is unaffected — all 8 seeds completed,
  errors 0, deterministic harness.

## Recommendation (for the coordinator — NOT this arm's call)

The decisive pick has now been cut and it read BAD. The
DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE condition is MET (see
Verdict): six picks (1, 2, 2, 2, 1, 1 — none ≥3/8), the
earliest origin commit after the merge base reading 1/8 with
the lowest median of any step (102d), wave-5 at 0/8 for two
consecutive steps, and the merge base itself settled BAD.
This arm's recommendation: the coordinator should CALL the
DIAG outcome in the tracker now, and the follow-up is the
prereg's H1 transplant program (land origin-side families onto
the far end one at a time), not more bisecting. The one
remaining revision, 447085506, should NOT be ground: besides
the prereg's DIAG outcome, it is provably vacuous — the merge
tree of a76333124 is byte-identical to 447085506's tree (empty
diff vs the second parent), so the deterministic harness would
reproduce s06's 1/8 exactly. There is no fork left to test.

Note on the prereg's DIAG-NONMONOTONIC trigger: it fires only
when a commit on the GOOD side of an established boundary reads
≤1/8, or one on the BAD side reads ≥3/8. No boundary exists
(no GOOD read anywhere), so the 1,2,2,2,1,1 pick sequence is NOT
a non-monotonicity verdict — it is the DIAG shape itself (a
collapsed line with a 2/8 wobble in the middle).

## Files

- evidence/2026-11-13/sim-culpritbisect-c.md — this file
  (round-13 prereg addendum + step record, now covering s05
  and s06).
- evidence/2026-11-13/culpritbisect-a-steps.log — step ledger
  (s05 + s06 appended this round).
- evidence/2026-11-13/culpritbisect-a-s05-c0a85b17e-summary.json
  — analyzer summary.
- evidence/2026-11-13/culpritbisect-a-s05-c0a85b17e-driver.log
  — driver log.
- evidence/2026-11-13/perseed-culpritbisect-a-s05-c0a85b17e/
  — per-seed JSONs (8).
- evidence/2026-11-13/culpritbisect-a-s06-a76333124-summary.json
  — analyzer summary.
- evidence/2026-11-13/culpritbisect-a-s06-a76333124-driver.log
  — driver log.
- evidence/2026-11-13/perseed-culpritbisect-a-s06-a76333124/
  — per-seed JSONs (8).
- scripts/culpritbisect-step.sh, scripts/test-culpritbisect-a.js
  — unchanged this round (no tooling fix needed).

## Proof

`node scripts/test-culpritbisect-a.js` — **116 passed, 0 failed**
(run before any judged sim AND re-run after the steps — no
tooling changed, result recorded in the commit note). The proof covers
the driver guards, the analyzer's bisect/rank/boundary rules,
the step runner's swap/restore mechanics, the substrate facts,
and the step script's restore source (§4b).

## Telemetry deviation check

Attempted (s06): `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-s06-a76333124/*.json'
--metrics national,table,wins,exiled` → **REFUSED,
recorder-corpus class** ("all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs") —
same refusal as s05 and all prior bisect arms. Recorded, not
waived; baseline NOT rolled.

## Metric review

No metric proved wrong. The bisect rule did its job without a
re-run leg in either step this round: 1/8 classifies BAD
outright, and the wave-5 0/8 read is a new signal the rule does
not judge on — it is reported as a secondary, and it sharpens
the DIAG read (the earliest origin pick cannot even unlock wave
5, twice running). The AMBIGUOUS band's re-run leg was not
needed; the deterministic harness continues to reproduce
exactly. The boundary-pair confirmation never became live —
no GOOD read exists anywhere in the bisect, so there is no
parent/culprit pair to confirm, and the prereg's deep-identity
read + transcript sense-test for the boundary pair do not
apply. Open for the NEXT run (the H1 transplant program, per
the prereg): the transplant arms need their own prereg with
fresh GO thresholds — the bisect's survival-count metric does
not transfer to family-by-family landing.

## Next pick (for round 14) — NONE; the bisect is complete

There is no next pick to run. `git bisect bad` after s06
reports 0 revisions left (~0 steps); the only untested
revision is 447085506 'Add lived Brawler ascension deed
(outmatched_kill)', whose tree is byte-identical to s06's
merge tree (empty diff vs the second parent) — running it
would reproduce s06's 1/8 exactly on the deterministic
harness. The bisect has converged to the merge-base edge and
the DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE condition is MET.
The coordinator's next move is the DIAG call in the tracker
and the H1 transplant program, not another bisect round.
