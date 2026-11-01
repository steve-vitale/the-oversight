# Loop B round 0545Z — coordinator evidence (axis food-economy, 2 DIAG-GO arms, merged locally pending ship)

Run: fleshout-loop-b-20261101T0545Z. Sibling Loop A live on scale-onramp
the whole run (0515Z claim: contactfinish-confirm, NOT touched); Loop A
landed its confirm mid-run (contact-finish rule on master 3d0958360,
confirm GO, wall on its band national 7 -> 6, table 10, wins 9, wave-4
10/12, wave-5 0, full seat 0) and appended its own tracker review
mid-run (untouched). Journey loops landed twice mid-run (journey
crisis r90 closeout, journey-scale r65) — absorbed via rebase, proofs
re-run, no conflicts (disjoint files). No B lock at run start; claim
written before any sims. Pre-flight: main tree clean, disk 21%, reaper
removed nothing (all live trees dirty, correctly refused). Worktree
registration was slow (git reset --hard checkout phase, ~5 min per
tree, same slow-registration class as the 0435Z EPERM flicker) but
completed; both trees clean at base 2debb6756.

This run worked food-economy (converging), the second axis, taking the
0435Z closeout's next blanks (1) and (2) in order: evening-step leg
decomposition and 17549 death-cause. Both arms DIAG only: zero src/js,
zero policy-default flips, zero edits to existing policies/scripts.

## Arm sim-eveningstep-b (worker tip 7a18b1de2, rebased 1c21a87fd, merged --ff-only): GO, DIAG only

Proof test-eveningstep-b 36/36 post-rebase and on merged master; diff
guard clean (only new analyzer + test scripts + evidence). Censuses
re-read from landed files match worker evidence: pooled leg-path
census 2,856 evenings; P1 714 (entry-only 680, offer-no 30, hop-no 1,
hop-yes-entry-no 1, guard-combat 2, travelledHome 1); creekseek 714
(entry-only 676, offer-no 34, hop-no 1, hop-yes-entry-no 1,
guard-combat 2, travelledHome 1); hop-yes-entry-yes 0 on both stacks.
Drift check (not judged): 17563 re-derived 30d x 3 policies, 90/90
leg-days match the awayeve corpus. Zero drift.

Finding, in plain words: on seed 17563 day 5, the villager starts the
morning on the same tile on every policy, and the evening step's hop is
what gets her home — the hop moves her, and then the lodge entry FAILS,
yet she still counts as home because "home" is where she stands, not
whether the entry step succeeded. Entry is proven unnecessary, not just
unneeded. The other two pairs decompose differently: 17549 day 12 and
17549 day 6 are daytime-divergence pairs — the villager walks home in
daytime on one policy and wanders on the other, and the evening step
converts nothing. Of 5 same-morning-tile haven/away pairs corpus-wide,
only 17563 day 5 involves a hop at all. The evening step's systematic
work is attempting returns and being told home is unoffered (30
offer-no vs 1 hop-no vs 1 hop-yes on P1). A census ordering combat
first hides a hop refusal (17563 day 4: step record says
travel-refused, evening snap reads inCombat) — future refusal
censuses must use the step record. Method note: the arm's compare file
is matched seed-day tables, not a §15 panel comparison (no lever
change to panel); recorded here, not silently skipped.

## Arm sim-death17549-b (worker tip c17fe4d9d, rebased twice — 68b5f9cd1 then 8c47c209d — merged --ff-only): GO, DIAG only

Proof test-death17549-b 31/31 post-rebase (twice) and on merged
master; diff guard clean (only new analyzer + test scripts +
evidence). Censuses re-read from landed files match: all four carry
pantryTrajectory / hungryMarkers / gameOver fields. No new sim leg
was run — the analysis reuses the committed awayeve pilot corpora, per
its prereg; the new-base contingency never triggered.

Finding, in plain words: seed 17549's village does not die to monsters,
sickness, or exposure. It starves on a three-night fuse. On P1 and
creekseek (identical corpora, one chain) the pantry slides from 47,250
to 11,100 by day 11; the scholar walks home day 12 and the village
still dies 12 days later, because home days 12-21 eat 1,000-1,485 kcal
village meals nightly while the pantry slides to 2,193, the only big
supply all month is one expedition return on night 17, and after that
nothing comes in — the creek is fished out, the garden unripe, eight
villagers resting wounded. Nights 22/23/24 are "Day 1/2/3 of hunger,"
then "Haven couldn't hold. On the third hungry day, people started
walking." BARE dies the same way harder (day 18): the scholar starves
days 6-13, a successor inherits a 2,966 pantry and eats it to 253.
Ruled out with dates: sickness (4 wound-fever deaths, roster still
standing), combat (last monster kill day 18), the away episode itself
(she survives it and walks home), raid (a pressure, not the cause).
P3 survives the same collapse (pantry 0 on days 25-26) because the away
scholar draws no pantry meal while burning through successions, and
small overnight inflows break each hunger streak — but those reset
inflows (morning pantry 914 / 613) are observed, not itemized by any
deposit line, and are stated as a gap, not invented.

## Master chain

2debb6756 -> b47d2dc4c (journey-scale r65, sibling) -> 1c21a87fd
(eveningstep) -> 8c47c209d (death17549) -> this coordinator evidence.
The death17549 --ff-only merge first refused after the eveningstep
merge moved master (expected sequential-merge mechanics, not a
conflict); rebased onto the new tip and merged clean. Safe-commit
index clobber hit worker commits on both arms — repaired via --add
--cacheinfo from HEAD blobs each time, commits verified correct.
Telemetry deviation check on both corpora: 3 LOUD lines each,
investigated as the known missing-field artifact (leg/death censuses
carry no national/table/wins/exiled fields); baseline NOT rolled.

## Metric review

Both arms judged against their preregs; nothing re-scored. Eveningstep
panel note above (matched tables, not a panel comparison — no lever
change). Death17549 panel N/A for the same reason; its before/after
is policy-vs-policy census comparison on identical seeds, not a lever
panel. No metric proved wrong; no revision proposed for the next run.

## Wall

UNCHANGED (not measured by these pre-seat censuses): full seat 0 /
wave 5 reached 0 stand as last measured (Loop A lane, confirm band:
national 7 -> 6, table 10, wins 9, wave-4 10/12). food-economy stays
converging (NOT converged): the evening step is now decomposed leg by
leg and 17549's death is now explained — but no strand lever has been
judged and no game change landed. scale-onramp untouched except as
noted (sibling Loop A lane, contact-finish rule now landed there).

## Next blanks, in order

(1) Offer geometry — which departure tiles/distances offer haven (30
offer-no vs 1 hop-no vs 1 hop-yes is now the binding question) and what
lodge-entry failure on the haven node actually costs (pair 0: nothing
visible). (2) HUNGER WINTER relief passivity — relief options offered
on every policy, never visibly taken (steve-call candidate). (3) P3
reset mechanism — needs sleep pantry-flow instrumentation (item-list +
abstract pantry numbers). (4) Supply-leg lever on fresh seeds — the
expedition-lumpy shape is measured on one seed only. (5) H5/H6 refusal
cells, still UNRUN. (6) Patrol-departure narration (design surface).
(7) A 120d window only if a new horizon-cut episode appears.
Backlog appended (6 lines) + 2 items annotated answered (eveningstep
decomposition, 17549 death-cause). 17549 death-cause is NOT carried
forward as a blank (answered this run).

Claim deleted; lock deleted. Merged locally, pending ship.
