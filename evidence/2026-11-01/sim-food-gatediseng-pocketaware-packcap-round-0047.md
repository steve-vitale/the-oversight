# Loop B round 0047Z — food-economy: gatediseng re-deploy NO-GO + pocket-aware PILOT NO-GO + pack-cap PILOT GO (held)

Run: fleshout-loop-b-20261102T0047Z (scheduled 2026-11-01 18:30 CST, started 18:47 CST).
Axis: food-economy (second axis). Sibling Loop A live on scale-onramp throughout
(0045Z claim: sim-quotatrigger-a + sim-trustbleed-a + sim-heraldkill-a) — NOT touched.
No scale-onramp work, no #1538 steve-call items built. DELIVER OVER MEASURE
(Steve 2026-11-01) applied as the planning lens: the arms below are delivery
candidates and their next steps, not another measurement census — and two of the
three still fail their delivery bars, so nothing lands.

Pre-flight: main tree clean at 33d1a2089, disk 24%. Master moved during the run
(journey landings; tip 247aa959f at closeout). No worker touched the main tree.

## Arm 1 — sim-gatediseng-redeploy-b: NO-GO, do NOT merge

Branch sim-gatediseng-redeploy-b, commits 81b474c89 (prereg, before any judged sim)
+ 310d02847 (evidence). Port hunks verified identical to the held deploy commit
1cdc73f9e game.js hunks (+67 lines). Proof test 11/11 green. Held deploy
worktree/branch never touched.

New prereg decided UP FRONT: bar on the sensor's OWN evening series (in-game
endDay evening reads, never the tracer series); one-day shift acceptable iff the
warning fires day <= 18 on collapsing seed 51608 (starvation day 21); sustained-
level recovery clause (exceed stand-down level by more than trivial noise AND
hold more than one evening — the old day-25 spike must NOT count as recovery);
quiet leg = 52201-52212 re-run (0 expected, honestly a re-run) PLUS a fresh
8-seed band; neutrality byte-perfect except exactly the 1 inserted voice line.

What passed (51608, sensor series): exactly 1 warning, day 16 (S=13, 11,233 ->
7,640), the first sensor-series (c) evening, <= 18 — the one-day shift PASSES
under the new bar, not a re-score. 6 raw condition evenings / 1 issued.
Sustained-recovery scores NOT-recovered (bar 8,404) — the spike hole stays closed.
Neutrality byte-perfect on row fields across all 21 seeds.

What failed (NO-GO legs): fresh band 73001-73008 warns on 2/8 survivors — 73005
day 8 (S=5, 21,680 -> 18,090; a healthy early drawdown from a 47,250 starting
store, gate re-engages day 9) and 73008 day 27 (S=23, 28,972 -> 24,920; a genuine
late slide the 30d window ends before resolving). The 52201-52212 re-run stayed
0/12, so the confirm band's quiet does not generalize. Inserted voice lines total
3 (one per firing seed), not the preregged exactly-1. Panel leg (g) not passed as
written — compare decision `review_required` from coverage statuses (3
insufficient, 2 not-observed luck streams) while every observed metric delta is
exactly 0; the decision-string bar was mis-specified for a screen panel (metric
review: bar on observed-metric deltas, not the decision string).

Sense: 51608 day 16 reads as the village noticing in time; 73005 day 8 reads as a
false alarm (fires beside a "Haven has food" trader arrival); 73008 day 27 reads
plausibly but unconfirmed. In-window: 20/21 survived, median/max 30d, 1 collapse
(51608 day 28), max wave 3. Branch HELD, worktree kept with a fresh heartbeat.

## Arm 2 — sim-entrywindow-pocketaware-b: PILOT NO-GO, do NOT merge

Branch sim-entrywindow-pocketaware-b, commits 5884f5e82 (prereg + policy + census
+ instruments, before judged sims) + 839c0b7f7 (evidence + panel). Proof tests:
pure 16/16, entrywindow test 14/14 re-run green. Policy-side only, zero src/js.

Signal proven first (DIAG-stop did not trigger): menu-time greedy-walk-home
simulation predicts actual competent returns 87/87 (control 60109: 21/21; blind
60901-60904: 66/66), including 6/6 predicted-blocked trips on 60903 that actually
failed to return, 0 false opens. The route-home signal is computable in policy
code with pure tile-level travelBlockage reads — no game-code change needed.

Pilot (fresh band 60301-60308, 30d competent, DEPOSITGATE=0, identical seeds):
failed-trip share 0.342 -> 0.071 (bar <= baseline - 0.10, PASS); mean daily haul
613.9 -> 917.3 (bar >= baseline, PASS); median survival 30 = 30; starvation 0 -> 1
(within bar); away day-ends band total 7 -> 21 (bar <= 9, FAIL, +12 over).
1,394 penalized menus, 6,699 pocket tiles, 1,656 sims, 0 errors. Empty-window
identity holds on a third band (405/405 failed). Pack-full failures 4 -> 18
(reported only; packcap arm's lane). Sense: choice/guard narratively invisible,
refusals voiced (fallen-tree 43, creek 54 band-wide), stranded state unmarked.

Why NO-GO despite a working signal — scope, not signal: all 21 armed away
day-ends come from one seed, 60307 (baseline 6). Stretch 1 (days 6-13, 8 away ends):
night errand walk (4,4)->(2,4)->(1,4)->(1,2)->(1,1)->(2,0), homeward tries refused
fallen_tree, then forages (2,2) from the pocket; ends with a starvation death day
13. Stretch 2 (days 17-29, 13 away ends): zero forages on the trigger day, night
walk (4,4)->(7,4)->(8,4)->(8,2)->(8,1), homeward tries refused creek, 13 days
foraging inside the pocket. Both strandings begin with NON-FORAGE errand walks
that a forage-candidate ranking never ranks. Leading hypothesis (unproven —
the driver records travels, not tasks): stoneRun's fog-push (daily order runs
stoneRun before the forage trip; day 6 carries the pantry-full/stone-pile line).
The shape veto passed only formally (60307 baseline 6, not 0, so the frozen
baseline-0 clause didn't fire despite the starvation death) — metric review
proposes a new-or-worsened clause (armed >= 10 AND >= baseline + 10, plus a
starvation/dehydration death) for the next prereg. Branch HELD (policy bundled
with evidence, so no evidence-only merge), worktree kept with a fresh heartbeat.
Next arm needs a task-tagging instrument before freezing another guard, plus a
way-home check on non-trip walks or a standing go-home step.

## Arm 3 — sim-packcap-b: PILOT GO, HELD (screen value, not a landing value)

Branch sim-packcap-b, commits 696fb7725 (prereg, before any judged sim) +
0061baf51 (CAP40 change + evidence + tests + corpora + panel). Proof test
--judge recomputes the four bars and prints PILOT GO; --cap proves the live
value (40 on CAP40 code, 20 after temporary revert, 40 again after re-apply).
check.js --quick 283/7 twice, all 7 proven pre-existing on base code. No
[needs-eyes] (a capacity constant is normally invisible).

DIAG first (count-only, spent confirm corpora 60201-60212): pack-full is not
trips filling the bag. All 27 armed pack-full attempts sit on days whose
day-start packKg equals the attempt's packKgBefore; 16/27 are the day's first
attempt. The marginal 18-30 kg is garden produce: competent daily runs
counterPlay -> workGarden -> harvestGarden AFTER the trip and its return
pooling, and harvestGarden() pushes 90-150 units per ripe plot (0.1 kg/unit =
9-15 kg/plot) straight into scholar.inventory with NO canCarry check. Example:
armed 60209 day 21 "Harvest: 100x Wild Strawberry x2" -> day 22 start 18.9 ->
38.6 kg; day 22's return pools exactly those 200 berries (9,000 kcal). Standing
load is road food (2,000 kcal at return pooling, DEPOSITGATE=0), gear/tools/
relics, and materials (Branch 0.5, Bark 0.3, Stick 0.2, Vine 0.1 kg/unit). Exact
tunable (single, isolated): carryCapacity() base `let cap = 20` in src/js/game.js
(+5 pack_rat, +10 hoarder, +item carryBonus, +2/kg per STR above 5);
packCapacity() aliases it. Overlap check passed: the redeploy sensor branch is
absent from this base, rotation policy never edited. No canon doc covers pack
capacity (CANON manifest has no pack/forage doc; BALANCING.md sets no carry
number) — 20 kg is reported as code, not canon.

Pilot (fresh band 60301-60308 — same band as the pocket-aware pilot; each arm's
within-arm comparison is clean, but the band is now spent for both arms; 30d,
DEPOSITGATE=0, identical seeds; baseline = competent-entrywindow-b policy on
base code, armed = same policy on CAP40 code, base 20 -> 40 only):
pack-full band total 18 -> 4 (bar <= 9, >= 50% drop, PASS, -78%); mean daily haul
856.7 -> 891.8 (bar >= baseline, PASS); away day-ends 11 -> 11 (bar <= baseline,
PASS); starvation 1 -> 1 (bar <= baseline, PASS). Regime guard: baseline
pack_full 18 >= 4. Per-seed: 60308 pack-full 11 -> 0 (haul 454.7 -> 612.7); 60303
5 -> 3; 60305 1 -> 0; no seed worsens. Five seeds byte-identical on haul (cap
only matters where the pack binds). Caveats: 60307 unchanged on every column
(away 11 + starvation 1 both legs — rotation-driven stranding, untouched by cap);
60301's pack-full persists at cap 40 (41.6 kg) and 60303's day-30 triple persists
(42.9 kg) — the largest garden loads exceed even a doubled cap, so the cap
mitigates but does not close the bypass. Secondary context (never judged):
rotation-OFF on the same seeds, base vs CAP40: pack-full 4 -> 1, haul 613.9 ->
629.0, away 7 -> 7, starvation 0 -> 0 — rotation-ON is the binding regime.

Sense: armed 60303 day 30 — day 29 harvests 300 blackberries (30 kg); day 30
starts at 42.9/40 kg; grove/meadow/meadow all refused ("Your pack is full..." /
"Still full..."), pack unmoved; 17,500 kcal pools at return. The refusal is
honest about state and options but never names the load — no kg figure, no
"yesterday's blackberries" (takeFromPantry's refusal does print kg). No
narration added; future narration arm only.

COORDINATOR DECISION (documented for Steve's overrule): the CAP40 branch is
HELD, NOT merged, despite PILOT GO. CAP40 is explicitly a screen value, not a
proposed landing value, and merging it would flip a live default (carry base
20 -> 40 for every player) on an 8-seed pilot while the garden-harvest bypass
still overflows it. The measurement is preserved here and in the branch evidence;
the landing-value capacity decision belongs to the confirm run AFTER the
garden-bypass arm decides the mechanism. Worktree kept with a fresh heartbeat.

## Telemetry deviation check

telemetry-check.js run against the packcap baseline jsonl REFUSED by the tool
itself (single-JSON-document parse; multi-line jsonl fails at line 2 — "LOUD:
could not parse ... Unexpected non-whitespace character after JSON at position
740549 (line 2 column 1)"). This is the known input-format limitation precedent
(2330Z/2230Z/2030Z), NOT a deviation. Baseline NOT rolled. No LOUD deviation
lines from any judged corpus.

## Wall numbers

In-window only (30d pre-seat windows, never pooled across arms): national /
table / wins 0 in every arm's window. Redeploy: 20/21 survived, 1 collapse
(51608 day 28), max wave 3. Pocket-aware: 8/8 survived both legs, median 30d.
Packcap panel: 8/8 survived both policies, wave 1x1 + 2x7, maxArc 3, vests 0.
Full seat 0 / wave 5 reached 0 stand as last measured (Loop A lane) — UNCHANGED
in kind by this run.

## Landing summary

Merged locally: NONE. Three branches held, worktrees kept with fresh heartbeats:
sim-gatediseng-redeploy-b (NO-GO), sim-entrywindow-pocketaware-b (PILOT NO-GO),
sim-packcap-b (PILOT GO, screen value held). No push, no version bump, no live
verification (ship loop owns deploys). Findings appended to sim-findings.md:
packcap 3 lines verbatim, redeploy 4 lines, pocket-aware 5 lines (by that worker).

## Infrastructure

- worktree-reap.sh hung on REGISTRY.lock contention with Loop A's concurrent
  registration at run start; killed before doing any work (no trees touched).
  Registrations then succeeded sequentially, slowly (registry lock held by Loop
  A's trustbleed/heraldkill registrations, then a second flock waiter).
- Safe-commit index clobber hit ALL worker commits + the pattern on this run's
  arms (staged deletions, untracked copies, one stale base-20 index entry);
  every commit verified correct and repaired via HEAD-blob cacheinfo before
  closeout; all three worktrees verified clean at closeout.
- No EPERM flap on the worker arms this run. Master moved under the run (journey
  landings); no worker branch required a rebase because nothing merged.
- check.js --quick NOT re-run by the coordinator (redeploy + packcap arms ran it:
  283/7, all 7 proven pre-existing; pocket-aware arm zero src/js).

## Next blanks, in order (food-economy)

1. Garden-pooling timing arm (packcap's named next): make garden harvest respect
   the pack gate (canCarry check and/or pantry pooling at harvest time) instead
   of a bigger cap number; then a landing-value capacity decision + 12-16 seed
   confirm. Confirm prereg must judge garden-pooling timing as its own arm,
   report day-start packKg alongside pack-full share, and pre-register a per-seed
   away table (60307-shaped asymmetric stranding could otherwise fail an away
   total on a rotation artifact, not a capacity effect).
2. (c) next-prereg revision: an absolute pantry floor or later eligibility floor
   for shape-only early drawdowns (73005); fresh-band quiet required — a re-run
   band must never be cited alone as quiet evidence.
3. Task-tagging instrument + way-home check on non-trip walks (pocket-aware
   scope hole; stoneRun fog-push hypothesis), before any further guard.
4. Rotation prereg shape-clause revision: new-or-worsened stranding (armed >= 10
   AND >= baseline + 10, plus a starvation/dehydration death).
5. Pack-full refusal narration (kg + top load, as takeFromPantry does).
6. Success-anchored rotation (patchrot 51901 counterexample, still open).
7. HUNGER WINTER relief passivity (steve-call candidate); shelling default-flip
   call; P3 reset follow-ups (night-22 +3,005 silent inflow bridge, double
   endDays on vessel-death days); patrol-departure narration; garden/fish/traps
   early path (marginal 2.8% combined); creek clearance wood-bound; rubble
   daytime-clearing habit unmeasured; washed_out scramble narration; 96-tick
   bridge edge unobserved; a 120d window only if a new horizon-cut episode
   appears.

food-economy stays converging (NOT converged): the sensor program now has a
re-deployed-but-NO-GO rule (timely on the collapsing seed, false-firing on
fresh survivors), the haul ceiling has a PILOT-GO capacity screen whose landing
value is undecided and whose root cause is a garden bypass, and the pocket-aware
rotation is a PILOT NO-GO on scope, not signal. No gate change landed, no default
flipped. scale-onramp untouched (sibling Loop A lane).
