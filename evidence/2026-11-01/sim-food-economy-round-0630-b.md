# Loop B round 0630Z — food-economy, 2 DIAG-GO arms (merged locally, pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T0630Z, axis
food-economy (second axis; sibling Loop A live on scale-onramp at run start
on its 0615Z claim, NOT touched — Loop A closed mid-run with its own
coordinator evidence fe5da45bd, absorbed here via rebase, no conflicts).
Pre-flight: main tree clean, disk 21%, reaper removed nothing (all live
trees dirty, correctly refused). No B lock at run start; claim written
before any sims. Both arms DIAG only: zero src/js changes, zero
policy-default flips, zero edits to any existing script or policy file.
Each arm lands as its own commit; killed arms leave no trace (nothing
killed this run).

## Arm sim-offergeo-b — OFFER GEOMETRY (worker tip 16501cc55, merged --ff-only)

GO, DIAG only. Prereg committed first (ee968662a, before any judged
census). Proof scripts/test-offergeo-b.js 29/29 post-rebase and on merged
master. Diff guard clean (only new analyzer + test + evidence + censuses
+ new-base corpora; 208 files, no src/, no scripts/policies/ changes).

Question (0545Z closeout blank (1)): which departure tiles/distances
offer haven at the evening step, and what does a lodge-entry failure on
the haven node actually cost?

Answer, in plain words: home is offered at 3 tiles away and never at 4.
That cliff is perfect on 120 seeds x 2 stacks (7,178 evenings, 286
offer-evaluated, 0 surprises, 0 haven-coordinate violations): band A
(d <= 3) 47/47 offered (100%); band B (d = 4-5) 0/182; band C (d >= 6)
0/57. The committed block alone could not fill bands A (4) and C (16),
so two prereg-authorized new-base blocks (96 fresh seeds x 2 stacks,
seeds 17567-17662, verbatim drivers, labeled new-base) closed both.
No tile appears on both sides of the line.

Of the 47 offered evenings, the hop was refused 39 times (83%) and taken
8 times — and every refusal is an intermediate block (fallen_tree 27,
washed_out 8, creek 4), with walkable routes around sitting unused in
the records (detour gate OFF). Refusals cluster: one villager refused 12
nights at two groves. P1 offers more than creekseek (32 vs 15
evaluated-offered) because the pre-step creek visit moves the departure
tile.

Entry-failure cost, cohorts kept separate: on all haven-tile evenings,
entry-fail n = 8 rows (4 seed-day events x 2 stacks: 17563 d5
walk-no-path after a hop; 17569 d25, 17625 d20, 17626 d27
walk-interrupted-combat after daytime arrival), haven-evening rate 8/8 =
100% — definitional, since entry is only attempted on the haven tile.
The cost that separates fail from success (n = 6,864) is the inside
morning: 25% vs 99.5%. Still-at-haven next morning 100% both sides;
vessel-same 75% vs 98.9%; next-evening haven 75% vs 99.1%. Overnight
calories do NOT separate fail from success (+130 vs +140 mean); any
future kcal claim must stratify by evening hunger (the starving
arrival's +1190 overnight gain is the dawn-feeding trace). On hop
arrivals only: hop-entry-no 2 rows (17563 d5, 1 event) vs hop-entry-yes
6 rows (4 events) — the single hop-entry failure wakes outside and
walks out the next day; hop-entry successes wake inside 6/6 and stay
haven 6/6, even at 140 evening kcal. Eveningstep's committed-corpus
zero (hop-yes-entry-yes = 0) is SUPERSEDED on new-base legs: pooled
hop-entry failure is 2/8, a case rate on one event, not a population
rate.

Sense test PASS, with quotes in the arm evidence: 17563 d4 (offered,
hop refused — "The bridge stands, but the way home still refuses —
block:creek."), 17563 d5 P1 + creekseek variant (hop, entry fails,
homecoming line, then twelve identical "Need N kcal, have 0. Eat
first." refusals while outside on the haven tile), 17563 d6 and 17549
d9-11 (offer-no nights — silent; no line says home was unoffered).
Villagers read as people doing errands and getting caught out; the
robotic surface is narration templates and missing refusal lines.

Two instrument corrections, documented in the arm's metric review,
prereg not rewritten: (1) woodcarry-departure correction — on
travel-refused evenings the step's own classification.departure is
authoritative, not the evening snap (17606 d4's wrapper retry rescued
the villager to haven after the step recorded travel-refused; 2 rows
moved, band counts unchanged); (2) morning gate for cross-stack hop
pins — valid only when both stacks' morning snaps for that seed-day
agree (17576 d24 failed the gate and fell back to day-line distance 1,
tile unpinned; the 17563 d5 (5,3) pin passes, corroborating
eveningstep).

## Arm sim-p3reset-b — P3 RESET MECHANISM (worker tip adbb35054, merged --ff-only)

GO, DIAG only. Prereg committed first (8d1a92718, before any judged
table). Proof scripts/test-p3reset-b.js 172/172 post-rebase and on
merged master. Diff guard clean (only new analyzer + driver + test +
evidence + tables + instrumented leg; no src/, no scripts/policies/).

Question (0545Z closeout blank (3)): the 0545Z death arm left P3's
survival explained but not itemized — small overnight inflows break
each hunger streak, observed, not itemized. This arm itemizes them.

Answer, in plain words: both reset nights are now closed exactly, from
instrumented legs — not from the corpus, which honestly left both
nights UNITEMIZED (0/2 at corpus stage). Itemization 2/2 (100% >= 90%
bar).

Night 19 reset (pantry-at-check 1,391 kcal, hungryDays 1 -> 0): evening
pantry 914. During the night's part-transitions, three foragers walk
home and bank food silently (the scholar is away, so no return lines
fire): gen_5zrmrq3 +254, james_okonkwo +338, devon_okafor +379 =
+971. The village's own meal loop then nets -494, leaving 1,391 at the
check. Closed: 914 + 971 - 494 = 1,391. The check passes on the whole
walk, not one deposit — the evening 914 was already banked food from
night 18's post-check returns.

Night 26 reset (pantry-at-check 200 kcal, hungryDays 1 -> 0): evening
pantry 0, and no forager comes home with food that night. The streak
breaks inside the village's own meal loop, which banks more than it
draws: james +600, devon -200, one app vessel -400, another app vessel
+200, net +200 at the check. Post-check + morning waits: forager
returns zoe_adams +308 and rosa_mendez +305, minus the scholar's
remote pantry eat -200, morning 613. Closed: 200 + 613 - 200 = 613.

The setup: night 18's meal loop eats the whole pantry (2,950 + 100
villageLives haul -> 0, Day 1 marker), then post-check returns +474 /
+228 / +212 = the 914 that night 19 passes on. Night 25 is the control:
a +100 haul arrives and the fuse still ticks (meal loop -100), proving
the reset is the meal loop's net sign, not the arrival count. Joiners
deposit nothing (Rosa and the farmer walk in on night 26's sleep prefix
and bank nothing on arrival); scholar pack bundles (342/243 kcal
"Nothing traceable") are pack food, never pantry food. Pairing caveat,
stated in the arm evidence, not overstated: the returner sets and kcal
totals are logged facts; the 1:1 deposit-to-villager pairing follows
the code-grounded rule that npcNodeTravel iterates the roster in order
and deposits immediately per returner.

P1 contrast, nights 22-24, why no reset arrived: P1's scholar is at
home, so every deposit would narrate — and none does. Night 22:
opening 2,193 -> 0, Day 1 marker, scholar's own home meal -1,293 plus
NPC meals, zero deposits anywhere in the window. Night 23: opening 430
(the scholar's own daytime unload — the only inflow, from his pack,
not the village) -> scholar's home meal -430 takes the whole 430
(villageMeal runs before villageEats) -> Day 2. Night 24: opening 0 ->
Day 3 -> scattering. P1's last deposit of the month was +393 on night
21's waits; after that production stopped entirely (creek fished out,
garden unripe, 8 wounded resting, no expedition since night 17). In
one line: P1's fuse completes because the home scholar draws 1,000+
kcal nightly, no forager returns arrive on the fatal nights, and the
pantry has no silent top-up; P3's fuse breaks because the away scholar
draws nothing, sleep-tick returns top the pantry up silently, and the
meal loop itself banks small hauls.

Sense finding, not a bug: both resets are invisible in the transcript
(no deposit line before either "Haven eats again") because the scholar
is away — the presence gate working as coded under Steve's perception
law. The gap was a measurement gap, not a game defect; do NOT propose
narrating away deposits.

## Wall numbers

NOT measured by these arms (30d pre-seat censuses and death/flow
analysis, not a scale run): full seat 0 / wave 5 reached 0 stand as last
measured (Loop A lane, 0615Z closeout). Report-only, window-capped, from
the offergeo new-base legs: wave 1: 39, wave 2: 139, wave 3: 14, wave 4:
0, wave 5: 0; survived 188/192. National / table / wins: no such fields
exist in these corpora — not reported, never zero-filled.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/sim-offergeo-b-corpus-newbase-p1-30d/*.json'
--metrics national,table,wins,exiled`: 3 LOUD lines (national 12 -> 0,
table 16 -> 0, wins 16 -> 0, n = 48 files). INVESTIGATED as the known
missing-field artifact (same precedent as 0545Z): these censuses carry
no national/table/wins/exiled fields, so the check reads absence as
zero. Baseline NOT rolled, no override flags used.

## Metric review

Both arms judged exactly against preregistered headers, no mid-run
re-scoring. Offergeo's committed block alone failed bar (a) on bands A
and C — the prereg-authorized new-base blocks closed both, and the
failure is recorded, not hidden. The arm's two instrument corrections
(woodcarry-departure, morning gate) are metric-review findings: future
refusal censuses must use the step record, not the evening snap, and
cross-stack pins need the morning gate. P3reset's corpus stage honestly
returned 0/2 itemized before the instrumented legs closed 2/2 — the
corpus is not a pantry-flow ledger, and future flow arms should plan
instrumented legs from the start rather than assuming the corpus
carries sources. §15 panel note: no lever change is panelled in either
arm — the deliverables are matched tables and itemized flows, stated
explicitly, not silently skipped.

## Infrastructure

Worktree registration slow (~2-3 min per tree, sibling load; no
retries needed beyond waiting). Safe-commit index clobber hit worker
commits on both arms (files showing staged-as-deleted while
byte-identical to HEAD) — repaired via --add --cacheinfo from HEAD
blobs each time, commits verified correct. Sibling landings absorbed
via rebase, proofs re-run, no conflicts (disjoint files): Loop A
coordinator evidence fe5da45bd before the p3reset merge, journey
establishment r71 ab16fcd5b before the offergeo merge. No EPERM flap
observed this run. Check.js --quick NOT re-run (zero src/js both arms;
arm proofs 29/29 + 172/172 on merged master are the landing
verification; standing 284/6 pre-existing profile last recorded by
0515Z).

Master chain this run: 4d3868feb -> fe5da45bd (Loop A, sibling) ->
adbb35054 (p3reset) -> ab16fcd5b (journey, sibling) -> 16501cc55
(offergeo) -> this coordinator evidence. food-economy stays converging
(NOT converged): the evening offer geometry is now mapped and 17549's
P3 survival is now itemized — but no strand lever has been judged and
no game change landed. scale-onramp untouched (sibling Loop A lane).

Next blanks, in order: (1) daytime end-position distribution — why days
so rarely end at d <= 3 (offergeo open; the offer table conditions on
step-evaluated evenings and cannot answer it); (2) intermediate-block
clearing in the evening step — step offers, block refuses, way around
unused, detour gate OFF (design question for the backlog); (3) HUNGER
WINTER relief passivity (steve-call candidate, carried); (4) P3 reset
follow-ups — meal-loop `gave` vs pantry-walk discrepancy code read,
night-22 +3,005 silent-inflow bridge decomposition, double endDays on
vessel-death days; (5) supply-leg lever on fresh seeds (carried); (6)
H5/H6 refusal cells, still UNRUN (carried); (7) patrol-departure
narration (carried); (8) a 120d window only if a new horizon-cut
episode appears.

Claim deleted; lock deleted. Merged locally, pending ship.
