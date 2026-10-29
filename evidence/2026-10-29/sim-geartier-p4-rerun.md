# sim-geartier P4 fresh-seed re-run — RESULTS

Arm: build-abilities (Steve 2026-10-29: "Address all gaps. Build it.",
abilities follow-ups, measurement refresh only, no game retunes).
Declaration (committed BEFORE any fresh-seed run):
evidence/2026-10-29/sim-geartier-p4-rerun-prereg.md.
Parent verdict under re-examination: geartier-a abilities pass GO
(0d0e23d05), with bird passing by 0.53 points and broadcast by
0.17 points on the original seeds.

## Reproduction first (defaults = original seeds)

`node scripts/test-geartier-a.js` with no env overrides on the
current tree reproduces geartier-a-postfixture.json EXACTLY on all
six cells (control 157.5/3/18.3; control-aid 133.4/2/9.1/52;
control-aid-hurt 124.3/2/8.8/52; bird 114.9/taken-R 17;
broadcast 146.2/ally 17.9/59; mending 98.2/allyHp 58).
No drift between the pass commit and this tree's HEAD: the
current code IS the post-pass code, and the instrument defaults
are faithful. File: geartier-p4-rerun-repro.json.

## Fresh seeds (declared in advance, not picked after seeing results)

- Fight-RNG base 37100 (original 9100); world seed 85217
  (original 75106). Same shapes: 5 paired fight seeds x 2 beasts
  (850/1100) = 10 cells per arm.
- Post-change code: current tree. Pre-change code: godpath.js +
  fieldFights.js at 0d0e23d05^ (verified: nothing else touched
  those two files between the pass and this tree's HEAD, so the
  parent versions are exactly pre-pass code). The pre-code swap
  was measurement-only, restored immediately after, worktree
  hashes verified equal to HEAD before any commit.
- No-change check, fresh seeds: control / control-aid /
  control-aid-hurt are BYTE-IDENTICAL in summary between pre and
  post (162.5/3/14.7, 160.4/3/18.5, 141.8/2/18.5). The pass
  moves nothing for the bare kit, on fresh seeds as on original.

## Fresh-seed margins (post vs pre on the SAME fresh seeds)

Frozen P4 rule: >= 2 of 3 improve on their named metric AND
none regresses mDealt by > 10%.

| ability | named metric, fresh pre -> post | bar | mDealt | fresh verdict |
|---|---|---|---|---|
| bird (shout-join) | taken/R median 16.67 -> 15.33 = -8.0% | -10% | 120 -> 138.9 (+15.8%, no regression) | MISS by 2.0 points |
| broadcast (aid) | allyDealt mean 13.8 -> 19.9 = +44.2% | +25% | 138.2 -> 147.5 (+6.7%, no regression) | PASS, +19.2 over bar |
| mending (aid-hurt) | allyHpLeft median 100 -> 100; rounds med 2 -> 2 | up | 111 -> 111 (0.0%) | NO IMPROVEMENT (shape-capped, see below) |

Fresh-seed P4 score: 1 of 3 improve. The frozen rule's >= 2
is NOT met on fresh seeds. No mDealt regression anywhere.

## What this means, plainly

- The original-seed GO is NOT re-scored: it stands on its frozen
  seeds, exactly as the prereg binds. This re-run does not
  overturn it and no game change follows from it.
- But the pass must NOT be cited as strong. On fresh seeds:
  - BROADCAST IS ROBUST. +44.2% dwarfs its original +25.17%.
    The two-round embolden is visible in the fresh transcript
    ("strikes again, louder" twice, once per round).
  - BIRD IS SEED-FRAGILE. -8.0% misses the -10% bar it cleared
    by 0.53 points originally (-10.53%). The blind still fires
    10/10, and the MEAN taken/R falls 20.4% — but the frozen
    bar is the median, and one bad post cell (26.0/round) plus
    the distribution shape keeps the median at -8.0%. Median
    vs mean is diagnosis, not a re-score: the bar stays.
  - MENDING IS SHAPE-FRAGILE ON THIS WORLD SEED. The aid-hurt
    shape's wounding premise does not hold on world seed 85217:
    the median ally already ends at 100 HP in BOTH arms (5/10
    pre cells at 100), so the median cannot move however good
    the verb is. The verb fires 7/10 in both arms; where an
    ally is wounded, one paired cell moves 6 -> 18. This is a
    measurement-shape ceiling, not proof the verb fails — but
    it is also not a pass, and a future mending check needs a
    world seed whose allies actually get hurt (original seed's
    median was 52) or a shape that wounds the ally directly.
- Bottom line for the coordinator: cite the pass as "broadcast
  strong, bird thin and seed-fragile, mending shape-dependent"
  — never as "3 of 3, strong."

## No game change, no re-score

No ability number, cost, gate, or line of game code changed in
this arm. A bird re-tune or a mending re-shape would be
next-run work under a fresh prereg, not a quiet fix on the
back of this re-run. Gating freeze untouched. Perception law
untouched. Six slots, food-powered: untouched.

## Files

- Declaration: evidence/2026-10-29/sim-geartier-p4-rerun-prereg.md
- Reproduction: evidence/2026-10-29/geartier-p4-rerun-repro.json
- Fresh post: evidence/2026-10-29/geartier-p4-rerun-fresh-post.json
- Fresh pre: evidence/2026-10-29/geartier-p4-rerun-fresh-pre.json
- Instrument: scripts/test-geartier-a.js (env overrides only,
  defaults reproduce the original run exactly)
- Companion leg (separate): neutral-panel proof refresh via
  scripts/balance-proof-update.js — reported in the arm's final
  note once the panel build completes; it does not touch P4.
