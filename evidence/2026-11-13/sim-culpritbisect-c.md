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

## Verdict: BISECT NARROWED, PLATEAU BROKEN DOWNWARD (s05 done)

s05 (c0a85b17e, 'Merge origin/master into forager deed branch') is
**BAD 1/8** on the first pass — no re-run required (≤1/8 is BAD per
the prereg rule, not AMBIGUOUS). The window narrows from
(203a32775, 7ddcdfff9] (10 revisions) to (203a32775, c0a85b17e]
(6 revisions); git reports 3 revisions left (~2 steps).

The 2/8 plateau does NOT persist as a fourth consecutive
AMBIGUOUS: the pick below s04 reads WORSE (1/8), and it is the
first bisect step with ZERO wave-5 unlocks (0/8; s02/s03/s04 all
had 2/8). The pick sequence in line order (good end → bad end)
now reads s05 1/8, s04 2/8, s03 2/8, s02 2/8, s01 1/8 — no pick
anywhere has read ≥3/8, so no good→bad transition exists inside
the tested origin line, and the reads get worse, not better, as
the bisect approaches the merge-base edge. That is the
pre-registered DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE shape
strengthening, not weakening: the origin line was already
collapsed when it diverged, and the drop is a property of the
origin content as a whole. This arm does NOT call the DIAG
outcome — that is the coordinator's call (see §Recommendation).

The collapse is still NOT (only) in standing.js: s05 stayed at
1/8 with the roster-check fix swapped in.

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

## Wall numbers (this round's step, with carried-forward rows)

| step | survived | median | regional | wave-5 | wins | national | table |
|------|----------|--------|----------|--------|------|----------|-------|
| s05 | 1/8 | 125d | 0/8 | 0/8 | 0 | 0 | 0 |

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

## Recommendation (for the coordinator — NOT this arm's call)

The DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE shape has now
strengthened through five picks (1, 2, 2, 2, 1 — none ≥3/8) with
the earliest tested pick reading 1/8 and wave-5 at 0/8. The
coordinator should weigh calling the DIAG outcome now against
running the final ~2 steps. This arm's recommendation: RUN the
final ~2 steps. They are cheap (~4 min of sim each, one pick
already named: a76333124), only 3 revisions remain, and the
next pick is decisive either way — a GOOD read pins a real
transition to the brawler-deed merge; a BAD read completes the
DIAG picture with the bisect converged exactly to the
merge-base edge, leaving no untested revision between the
merge base and the first BAD pick. Calling DIAG now would save
~10 minutes and leave that last fork untested; the evidence for
either outcome is stronger with a76333124 cut. If a76333124
reads BAD, the coordinator should then call DIAG rather than
grinding the last 1–2 revisions (447085506 / 458811411 /
c15b8c56c side-branch commits under an already-BAD merge).

Note on the prereg's DIAG-NONMONOTONIC trigger: it fires only
when a commit on the GOOD side of an established boundary reads
≤1/8, or one on the BAD side reads ≥3/8. No boundary exists yet
(no GOOD read anywhere), so the 1,2,2,2,1 pick sequence is NOT
a non-monotonicity verdict — it is the DIAG shape itself (a
collapsed line with a 2/8 wobble in the middle). If a76333124
reads ≥3/8 while c0a85b17e above it reads 1/8, THAT would be a
genuine boundary and the boundary-pair confirmation would apply.

## Files

- evidence/2026-11-13/sim-culpritbisect-c.md — this file
  (round-13 prereg addendum + step record).
- evidence/2026-11-13/culpritbisect-a-steps.log — step ledger
  (s05 appended this round).
- evidence/2026-11-13/culpritbisect-a-s05-c0a85b17e-summary.json
  — analyzer summary.
- evidence/2026-11-13/culpritbisect-a-s05-c0a85b17e-driver.log
  — driver log.
- evidence/2026-11-13/perseed-culpritbisect-a-s05-c0a85b17e/
  — per-seed JSONs (8).
- scripts/culpritbisect-step.sh, scripts/test-culpritbisect-a.js
  — unchanged this round (no tooling fix needed).

## Proof

`node scripts/test-culpritbisect-a.js` — **116 passed, 0 failed**
(run before any judged sim; re-run after the step — no tooling
changed, result recorded in the commit note). The proof covers
the driver guards, the analyzer's bisect/rank/boundary rules,
the step runner's swap/restore mechanics, the substrate facts,
and the step script's restore source (§4b).

## Telemetry deviation check

Attempted: `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-s05-c0a85b17e/*.json'
--metrics national,table,wins,exiled` → **REFUSED, exit 2,
recorder-corpus class** ("all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs") —
same refusal as all prior bisect arms. Recorded, not waived;
baseline NOT rolled.

## Metric review

No metric proved wrong. The bisect rule did its job without a
re-run leg this round: 1/8 classifies BAD outright, and the
wave-5 0/8 read is a new signal the rule does not judge on —
it is reported as a secondary, and it sharpens the DIAG read
(the earliest origin pick cannot even unlock wave 5). The
AMBIGUOUS band's re-run leg was not needed; the deterministic
harness continues to reproduce exactly. Open for the NEXT run:
if a76333124 reads GOOD, the boundary-pair confirmation
(parent vs culprit re-run) becomes live for the first time in
this bisect, and the deep-identity read + transcript
sense-test from the prereg apply to that pair.

## Next pick (for round 14)

`git bisect start aa5d9ef92 203a32775`, skip the merge base
d229b58f5, mark s03 (7688cb7a4) bad, s04 (7ddcdfff9) bad, mark
s05 (c0a85b17e) bad, and git checks out a76333124 'Merge PR #3
brawler-ascension-deed-45d4' — run it as s06-a76333124.
3 revisions left (~2 steps) after that pick; the window after
s06 depends on its verdict. Note: a76333124's first parent is
the merge base d229b58f5 itself.
