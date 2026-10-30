# sim-food-economy-round-1030-b — coordinator evidence (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1030Z.
Axis: food-economy (second non-converged axis; sibling loop A live on
scale-onramp the whole run — claim fleshout-20261030T1015Z, arms
sim-sameday-a + sim-draftflag-a — NOT touched).
Base at run start: 56b4cbe74. Both arms DIAG ONLY: measurement, zero
src/js, zero policy-default changes, zero default flips.
Merged locally, pending ship. No push, no version bump, no live
verification (ship loop owns deploys).

## Arm 1 — sim-walktree-b: walk-to-tree middle DESIGN ANSWER (DIAG-GO)

Branch sim-walktree-b: prereg c97a7099d (before any judged leg),
final 90e68a6cb, rebased onto c20586613 at landing as 99b9da4e7,
proof re-run green post-rebase and on merged master.
Evidence: evidence/2026-10-30/sim-walktree-b.md (+ prereg).
Proof: scripts/test-walktree-b.js 36/36 GREEN (post-merge, main tree).
Answers backlog #1497 (walk-to-tree middle needs a design answer).

Question: on the woodwarm bank (10 seeds, 30 loop-days), can a
villager micro-walk from a stranded wake cell to a bigtree on the
same tile, what does the full sequence cost, and does it rescue ANY
stranded night? Fresh baselines reproduce woodday exactly (guard
15/4/11, ON 21/11/10) — NO DRIFT. Only 2 seeds strand on the bank
(15215 + 15009 day 13); the prereg's bank-composition clause covers
the >= 2-other-seeds shortfall plainly (100% of stranded wake cells
measured: 11 mornings, 19 bigtree clusters, zero unmeasured).

Findings (measured, engine findPath BFS, no-corner-cutting):
- Passability: 10/10 field mornings have a reachable stand.
  Near stand reachable in 2–3 steps from either wake cell.
  Far (south) stand reachable from the west corner only, via the
  bridge (7 steps); sealed from the east corner (river + north
  stand form a continuous cut; bridge lies outside the pocket).
  15/19 clusters reachable, 4/19 unreachable (all south-from-east).
- Perception: the game's own noticing channel (perceptionHints,
  adjacent-only) is silent on 0/11 mornings — the villager does NOT
  notice any bigtree. LOS shows 19/19 but is monster-vision code,
  never quoted as perception. Whole-tile reads are the list-feed
  pattern, reported as such.
- Cost ledger (from code): walk 1 tick + 2 kcal/step; fell 96 ticks
  + 80 kcal; bridge 96 ticks + 60 kcal + 4 wood; forage 16 ticks +
  60 kcal effort. Direct sequence needs 142–146 kcal; stranded
  mornings hold 0–44. Food-first break-even edible yield 162–206.
- Affordability (full definition: kcal AND axe AND passable AND
  wood): direct 0/10, food-first 0/10 at Y=200/425/650 alike.
  Rescued stranded nights: 0/10, either variant.
- THE AXE GATE: cutInfo('bigtree').canFell is FALSE on all 11
  stranded mornings. The bot carries a Stone knife (whittle tier),
  no axe-tier tool — the fell refuses outright (2 ticks, no wood).
  Three independent gates fail together: no axe, no morning kcal,
  no perceived tree. Fix one and the count stays zero.
- Secondary observation: the two most favorable evenings (15215
  days 10/14) fit an evening walk + fell + bridge on kcal and
  ticks and still fail on the axe alone. No policy has an evening
  cut step.

Design-answer brief (Steve calls, NOT decided here): (a) whether a
villager may notice/target a non-adjacent tree on its own tile,
and by what sense step; (b) whether the bot should walk-to-cut at
all, versus a warmth-rule change (the woodday fork — this arm does
not pick a side); (c) whether the bot is SUPPOSED to hold an axe
by day 7 on this trajectory, or axe-less-ness is intended (if
intended, the walk-to-tree middle is dead until the trajectory
itself changes); (d) whether an evening-cut insertion point belongs
in the design vocabulary. Next step is a ruling on (a)–(c), not
another measurement of these mornings.

Out-of-scope findings filed to the backlog (NOT chased): axe
acquisition on this trajectory; evening-cut insertion point;
wake-tile forage knowledge (known food on only 2/10 field
mornings; the rest yield unknowns uneatable until identified).

## Arm 2 — sim-starveplenty-b: starvation after plenty, traced (DIAG-GO)

Branch sim-starveplenty-b: prereg e2759794f (before any judged
leg), final c20586613, merged --ff-only, proof re-run green on
merged master. Evidence: evidence/2026-10-30/sim-starveplenty-b.md
(+ prereg). Proof: scripts/test-starveplenty-b.js 36/36 GREEN
(post-merge, main tree). Answers backlog #1492.

Question: why did seed 9983 starve on day 39, nine days after an
8,940 kcal pantry reading at day 30? Trace fidelity: reproduces
the wall corpus EXACTLY (39 days, village-lost, all 14 deaths
identical).

Mechanism (named, event-level): a rundown with a cruel order of
eating — NOT a same-day distribution failure, NOT away, NOT
knowledge (all falsified with events):
1. Pantry 8,940 (day-30 exit) eaten down over six days to 500 by
   day 35; days 36–39 the pantry is empty at villager-meal time.
2. The scholar eats FIRST every night (~2,000–2,500 kcal), before
   villageEats. Days 36–39 the scholar swept 1,466/948/1,254/1,026
   to zero — the villagers' meal opened on an empty pantry daily.
3. The starving villager ate FIRST among villagers, so he never
   saw mid-meal surplus shares (later eaters drew 200–600 kcal
   from deposits he could not reach). Second-order only.
4. His production collapsed with his health: monster wound −40
   (day 32, hushwolf) on a lingering sickness, health 79 → 36,
   production ~2,300 → ~1,000 → 885 → 512 → 50 kcal/day.
   Shortfall hits (−8 meal, −4 famine, sickness −5) killed him
   day 39 — the day the village scattered (third hungry day,
   7 living members; scattering, not extinction).

Fresh census (seeds 9991–9998, competent, 180d death-aware):
5 villager starvation deaths of 285 total. Classification:
away-from-haven 0/5, knowledge 0/5, scholar-first-sweep present
5/5, production-cliff 5/5, low-health-compounded 5/5 (first −8 hit
at health ≤36 in every case). Plenty-test passes (entry ≥5,000
within 7 days): exactly 1 (adaeze_nwosu, 9994) — same mechanism as
9983. The 9995 trio (4,015 max) counted as mechanism recurrence,
NOT re-scored as passes (prereg binds). Census ends: 3 survived
to cap, 4 scattered, 1 scholar-death chain (pantry full at 38,853
— the control proving village-lost ≠ starvation).
Verdict: a PATTERN in mechanism, RARE in the headline form
(1/8 census seeds, 1/8 wall seeds pass the plenty test). Most
villages that run out of food scatter first.

Secondary sense note — backlog #1495 RESOLVED by this trace (the
wall evidence's guess was wrong): 9983's loss IS the scattering
(scattered = true, extinct = false, hungryDays = 3). The final
roster lists 7 because scattering ends the run WITHOUT killing
anyone. No fix needed; the wrinkle was a missing loss-mode label.
Coordinator: #1495 can be closed on this evidence.

Other observations (LISTED, NOT chased): elif_demir day-32
sickness death-tele gap (died-flagged hit + living-count drop +
meal absence, no death tele); scholar-meal size as a design
question (first draw ~2,000–2,500 kcal before villageEats — cap,
share, or reorder on thin days is Steve's call, not this diag);
sickness tick step-up (−3 to −5/day) in the starving phase,
unexplained by the meal trace.

Next food-economy question this evidence supports is a design
call, not another measurement: what, if anything, should change
about the scholar-first meal order or the health→production link
on thin days. Further starvation censuses would re-measure the
same chain.

## Village assessment (plain words)

The banked woodwarm villages are working villages in a short
window (all 10 survived 30 days on every leg — ceiling effect,
not a survival claim). Their stranded villager wakes beside a
creek tile holding eight big trees, walks to within three steps
of one without ever noticing it, carries a stone knife that
cannot fell it, and holds 0–44 kcal on a morning that needs
142–146. The middle is not missing because the trees are far —
it is missing because noticing, tooling, and food each fail
independently, and all three must pass for one rescue.

The starving village is a slower tragedy: a taxi driver turned
forager who worked every day, fought a hushwolf on day 32 and
took the wound that halved his working strength, nursed a
lingering sickness, kept drawing from the pantry while it
lasted, and then spent three days eating only what his failing
body could still gather — while the scholar ate the last of
each morning's food and his neighbours shared meals his turn
came too early to reach. He died the day the village walked
away. Nothing in his days reads robotic; the blank is
structural (meal order + health-linked production), not a
behavior bug.

## Wall numbers this run

NOT OBSERVABLE as wall numbers on the walktree 30-day evening
legs (pre-seat, no field) — reported, never zeros. The
starveplenty census carries no national/table/wins fields (it
is a starvation census, not a wall snapshot): ends 3 survived /
4 scattered / 1 scholar-death chain across 8 seeds; starvation
deaths 5/285; wave data not collected. Latest actual wall
snapshot remains the 0930Z run's (competent, 9981–9988, 180d):
national 0/8, table 0/8, wins 0/8, wave 4 4/8, wave 5 0/8, median
survival 180d at cap — quoted here as the prior run's number,
not this run's.

## Telemetry deviation check (body step 10)

- Starveplenty census glob (8 files): 3 LOUD lines
  (national 12→0, table 16→0, wins 16→0), exiled clean.
- Walktree ON corpus glob (10 files): same 3 LOUD lines,
  exiled clean.
Both are the KNOWN artifact class: census/evening-leg files
carry no national/table/wins fields, and the scale-wall baseline
is a WINSEAT-regime baseline — the same regime + field-shape
artifact class recorded by the 0830Z/0930Z runs. Baseline NOT
rolled, no investigation item.

## Infrastructure

- Loop A live on scale-onramp the entire run (1015Z claim +
  trees sim-sameday-a / sim-draftflag-a); never touched. Its
  sameday tree advanced on its own branch mid-run; master did
  not move under this run except by this run's own merges.
- Starveplenty worker completed normally (report preview
  confirms c20586613, clean tree); merged --ff-only first,
  proof green on merged master, tree released as done-merged.
- Walktree worker committed its final work (90e68a6cb) and
  repaired its own safe-commit index clobber (files briefly
  showed as staged-deleted + untracked while byte-identical to
  HEAD — the known clobber class), then went quiet ~5 min with
  a clean tree. Coordinator sent a status nudge (queued,
  unacted — worker inside a long step or stalled on an
  ungated call). After verifying branch tip + clean tree +
  evidence content directly, the coordinator closed the idle
  worker and landed the verified branch: rebased onto
  c20586613 clean (zero file overlap), proof 36/36 green
  post-rebase and on merged master, merged --ff-only as
  99b9da4e7, tree released as done-merged. No work was lost;
  the worker's final report is superseded by this verified
  landing record.
- check.js --quick NOT run: zero src/js, zero policy-default
  changes on both arms, both proof suites green post-merge,
  and loop A workers live (concurrent-jest rule). Same
  standing as the 2330Z run's skip.
- No EPERM flap hit this run. Probe ref check passed before
  closeout writes. Main tree clean at closeout.

## Convergence state

food-economy stays converging (NOT converged): narration honesty
on creek evenings is proven twice over, the walk-to-tree middle
is now a ruled design question rather than an open measurement,
and starvation-after-plenty is answered with a named mechanism +
census — but no food-economy default flipped, no balance change
landed, and the warmth-default Steve-call stays OPEN.
scale-onramp stays converging (untouched; sibling loop A lane).

## Next blanks, in order

1. Steve calls from walktree: (a) sense step for non-adjacent
   own-tile trees; (b) walk-to-cut vs warmth-rule fork;
   (c) axe-by-day-7 expectation; (d) evening-cut insertion point.
   Plus the axe-acquisition question (new backlog item).
2. Starveplenty design call: scholar-first meal order and/or
   the health→production link on thin days.
3. New backlog items: elif death-tele gap; sickness tick
   step-up in the starving phase; wake-tile forage knowledge.
4. Warmth-default Steve-call (standing, from 0830Z/0930Z).
5. Raidname residual (3) browser ordering — needs Steve's phone
   eyes, not sims; bedroll fix [needs-eyes] follow-up on live.

## Metric review

- Both arms pre-registered before any judged leg and judged
  against their headers; no mid-run re-scoring (starveplenty's
  9995 trio at 4,015 explicitly NOT re-scored as plenty passes).
- Walktree metric notes (full text in arm file): morning-ledger
  scope must not be re-labeled as whole-day verdict; findPath
  BFS must mirror movement rules exactly (pilot corner-cutting
  leak disclosed, pilot corpus discarded, judged legs on fixed
  driver); LOS ≠ noticing (different claims, kept apart);
  coverage bars must be written as "every seed that strands";
  food-first Y cases are canon ceilings, not observed wake-tile
  yields.
- Starveplenty metric notes (full text in arm file): plenty line
  is blunt (propose graded scale next run); villageEats-entry
  understates morning food (scholar meal precedes it — propose
  pre-scholar + entry pair next run); timing taxonomy should
  split scholar-first-sweep vs peer-drain vs first-eater trap;
  death-tele cross-check (living-count deltas vs tele deaths)
  for the next census; health-None ≠ 100.
- No metric revision is applied to this run's numbers. All
  revisions above are proposals for the NEXT run.

## Files

- Arm evidence: evidence/2026-10-30/sim-walktree-b-prereg.md +
  sim-walktree-b.md (99b9da4e7) + sim-starveplenty-b-prereg.md +
  sim-starveplenty-b.md (c20586613).
- Arm scripts: scripts/walktree-trace-b.js,
  scripts/analyze-walktree-b.js, scripts/test-walktree-b.js,
  scripts/trace-starveplenty-b.js,
  scripts/trace-starveplenty-b-wounds.js,
  scripts/analyze-starveplenty-b.js,
  scripts/test-starveplenty-b.js.
- Arm corpora: evidence/2026-10-30/sim-walktree-b-corpus-*,
  sim-walktree-b-census-*.json, sim-starveplenty-b-trace-9983.json,
  sim-starveplenty-b-wounds-9983.json,
  sim-starveplenty-b-census-999{1..8}.json.
- This file: evidence/2026-10-30/sim-food-economy-round-1030-b.md.
