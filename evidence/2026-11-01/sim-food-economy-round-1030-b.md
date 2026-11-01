# Loop B round 1030Z — coordinator evidence (axis food-economy — 2 DIAG-GO arms, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1030Z, axis
food-economy (second axis). Sibling Loop A live on scale-onramp at run
start (claim 20261101T1016Z: sim-seathes-a + sim-vet2mfg-a, NOT touched);
Loop A landed sim-seathes-a on master mid-closeout (4b88805f7), absorbed
via rebase, no conflicts (disjoint files). No B lock at run start; claim
written before any sims. Pre-flight: main tree clean, disk 21%, reaper
removed nothing (all live trees dirty, correctly refused). Worktree
registration slow (~4 min per tree, sibling load); closeout reap hung
past 8 min on sibling-tree scanning and was terminated after this run's
own trees were verified released/removed and branches deleted — no
state left behind by the kill.

Arm sim-supplyleg-b (worker tip 25ce4470f, rebased edde0bd76/ce9172e89,
merged --ff-only): GO, DIAG only. Proof test-supplyleg-b 35/35
post-rebase and on merged master; diff guard clean (only new driver +
analyzer + test + evidence + census + corpora; no src/, no existing
scripts/policies/). Finding: the live supply lever is the daily
sharing funnel, not expeditions. Per-leg shares of gross pantry inflow,
30d competent window, fresh seeds 51101-51108: meal-surplus 71.7% mean,
top leg on 8/8 seeds (lowest seed 42.8%); npc-forage 16.6%; expedition
6.4% and zero on 3/8 seeds — seed 17549's expedition lump does NOT
generalize; fish 1.6%, traps 0.6%, garden 0.6%; scholar-unload exactly
0.0% on every seed. Villager-production doors together (meal-surplus +
npc-forage) = 88.3% of inflow. Mechanism (from code): villagers feed
themselves first, then share surplus scaled by trust into the pantry
via stockSurplus. Instrument integrity: parity gate passed (new
driver's evening pantry series matches the absencehunt competent series
exactly on seeds 51101/51102); correction disclosed in metric review
(first analyzer run showed direct-other 13.9% — every kcal-bearing
direct push proved to be smoke-racks duty net-zero splits/converts,
not inflow; analyzer skips those stacks; prereg bars, seeds, and leg
definitions unchanged; verdict unchanged in direction). Sense finding:
seed 51101 dies the same death as 17549 (three hungry nights, then
"The scattering, again") with surplus eaten at the fire while shelves
read full; seed 51105 explains scholar-unload 0% (competent scholar
camps wild all month, no homecoming unload ever fires); the scholar's
"Hunger gnaws. The pack is thin…" line repeats verbatim near-daily on
away stretches (robotic note, not broken).

Arm sim-detourclear-b (worker tip ac89d47fb, rebased
a2db4658b/d454a9749/253e28914/165aa1fe4, merged --ff-only): GO, DIAG
only. Proof test-detourclear-b 28/28 post-rebase and on merged master;
diff guard clean (only new driver + analyzer + test + evidence +
censuses + corpora; no src/, no existing scripts/policies/). Finding:
clearing beats detour where the code allows it, and creek clearance is
wood-bound, not work-bound. Census leg (plain nighttravel, detour OFF,
8 pilot seeds, 30d, all survived): 47 travel-refused evenings, 47
completely classified, 0 surprises — creek 21, fallen_tree 22,
washed_out 4, rubble 0; every refusal in a seed is the same tile night
after night (mostly (4,3), directly north of haven). Probe leg (same
seeds; driver walks honestly to the approach tile, clears, verifies
block-gone, re-hops): 25 attempts — fallen_tree 3/3 cleared (exactly
60 kcal, 32 ticks, +2 wood, re-hop reached haven); washed_out 1/1
scrambled (exactly 80 kcal, 32 ticks, wood < 4 branch, re-hop reached
haven); creek 0/21 cleared (bridge needs 4 wood; wood carried = 0 on
47/47 refused evenings; swimmer = false on 47/47; no bridge probe ever
fired). Permanence is the story: after a successful clearance, zero
later travel-refused evenings on all 4 cleared seeds; creek seeds kept
refusing nightly. Verdict table: fallen_tree -> clear-beats-detour;
washed_out -> clear-beats-detour; creek -> detour-only (and the detour
is a cheap 2 steps, free — even a wood-carrying villager would pay 4
wood + 96 ticks to beat a 2-step walk). Caveats stated in evidence, not
hidden: bridge branch (96 ticks) and swim branch are code-read only,
zero live probes; one creek evening had only 94 ticks left, below
bridge cost; kcal-floor-at-0 behavior is code-read, not probe-proven
(all 4 clearances ran at kcal >= 2000); this is a classification census
on refusal-rich seeds, not a prevalence estimate — do not quote the
21/47 creek share as a field rate. Sense finding: clearing reads as a
person doing roadwork ("You cut through the fallen tree. +2 wood. The
path is clear." / "Travel 2 tiles to Haven." / "You walk back into
Haven. … The village is glad to see you."); one soft mismatch filed
for the backlog (washed-out scramble line "passable, barely"
understates permanence, since the code deletes the block for good).

Master chain: 7c8745741 (journey r79, sibling) -> 4fb9a9cc4 (journey
r79 closeout, sibling) -> edde0bd76/ce9172e89 (supplyleg) ->
a2db4658b/d454a9749/253e28914/165aa1fe4 (detourclear) ->
7c0af4324/4b88805f7 (Loop A seathes, sibling, landed after this
run's merges). Safe-commit index clobber hit worker commits on both
arms — repaired via --add --cacheinfo from HEAD blobs each time,
commits verified correct. Telemetry deviation check on both corpora
globs: 3 LOUD lines each (national 12 -> 0, table 16 -> 0, wins 16 ->
0), investigated as the known missing-field artifact (censuses carry
no national/table/wins/exiled fields); baseline NOT rolled. Wall
UNCHANGED (not measured by these pre-seat censuses): full seat 0 /
wave 5 reached 0 stand as last measured (Loop A lane).
food-economy stays converging (NOT converged): the supply lever is
now identified (daily sharing funnel, 71.7%) and the clearing-vs-
detour verdict table is now complete per block type — but no strand
lever has been judged and no game change landed. scale-onramp
untouched (sibling Loop A lane).

Next blanks, in order: (1) HUNGER WINTER relief passivity (steve-call
candidate — needs a ruling before any lever work); (2) P3 reset
follow-ups — night-22 +3,005 silent inflow bridge (still
undocumented), double endDays on vessel-death days; (3)
patrol-departure narration; (4) DEPOSITGATE fire-eating vs coming
collapse (own arm, corroborated on 51101); (5) scholar-away
structural zero — scholar presence before any scholar-supply lever;
(6) garden/fish/traps early path (marginal 2.8% combined — ripening /
assignment path, not yield numbers); (7) creek clearance wood-bound —
evening wood-carrying before any creek-clearing lever; (8) rubble
daytime-clearing habit unmeasured; (9) washed_out scramble narration;
(10) 96-tick bridge edge unobserved; (11) a 120d window only if a new
horizon-cut episode appears. Backlog appended (8 lines).
Claim deleted; lock deleted. Merged locally, pending ship.
