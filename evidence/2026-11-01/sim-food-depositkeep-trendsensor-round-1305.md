# Loop B round 1305Z — food-economy: depositgate-keep + level-vs-trend sensor (coordinator evidence)

Run: fleshout-loop-b-20261101T1305Z. Axis: food-economy (second axis; sibling
Loop A live on scale-onramp throughout with claim fleshout-loop-a-20261101T1235Z,
arms sim-dawnblock-a + sim-titangate-a — NOT touched). Next blanks taken from
the 1130Z B closeout, in order: (2) a depositgate-keep arm and (3) the
DEPOSITGATE level-vs-trend sensor. Blank (1) HUNGER WINTER relief passivity
was skipped again as a steve-call candidate needing a ruling first. Both arms
DIAG only, zero src/js, zero default flips, no game change landed.

## Arm 1 — sim-depositkeep-b: NO-GO, killed at pilot (no confirm spend)

Question: with the gate OFF (DEPOSITGATE=0) and the keep at 2,000 kcal, does
scholar unload go nonzero where the 1130Z packs predicted it would?
Baseline (1130Z scholaraway, gate on, keep 6,000 while engaged): unload
exactly 0 kcal on 8/8 seeds; largest finished-food pack at any return
3,720 kcal.

Pre-registered bar (prereg committed before any judged sim, 39bde017e):
nonzero unload on >=6/8 pilot seeds, 30d competent window, seeds 51101–51108
(identical to the baseline seeds/policy/window).

Pilot result: **4/8 seeds nonzero → NO-GO.** Band total unloaded 12,190 kcal
(vs 0 baseline). Per seed: 51101 2,850; 51102 5,980; 51105 2,040; 51106 1,320;
51103/51104/51107/51108 zero. No 12-seed confirm was run, per the pilot gate.

What the pilot proved, sharply:
- The keep is a clean threshold, not a leaky one: all 13 returns carrying a
  finished pack over 2,000 kcal unloaded (100%, 90–3,780 kcal each); zero
  returns at or under 2,000 unloaded. Kept + unloaded always equals the
  finished pack exactly.
- The four zero seeds fail on pack composition, not threshold: 51103/51104
  carry zero finished food at every return (unknowns, in-shell nuts,
  materials); 51107 peaks at 1,040 kcal; 51108 at 0 finished kcal. No keep
  value moves them. The next lever on this axis is pack composition
  (identification / processing / forage targets), not the keep number.
- Unload pre-empts donation, it does not add to it: gate-on donations were
  1,360 / 605 / 1,300 kcal on 51102/51105/51106; gate-off, the policy never
  calls donateToPantry once on any seed (0 calls). Mechanism: gate-on, the
  6,000 keep swallows the whole pack, so the next morning's donate step
  (own keep 2,400) donates the excess; gate-off, the return itself unloads
  everything over 2,000, so the scholar starts the day under 2,400 and the
  donate step has nothing to move. Any future metric counting scholar
  generosity must sum unload + donation, or it will read this channel shift
  as generosity collapsing to zero.
- Proof: test-depositkeep-b 19 pure checks + live controls A/B/C green
  (coordinator re-ran green on the merged branch base). Diff-guard: new
  files only. Worker commits 39bde017e (prereg), 67590bcde (driver +
  analyzer + proof), 7141f6c68 (pilot evidence + census + corpus), merged
  --ff-only after a clean worker-side rebase onto ab47110bd (journey
  succession r94 + trendsensor, zero src/js / zero policy overlap, so pilot
  data stands).

Sense test: 51102 day 28 (biggest unload, 3,780 kcal) reads sensibly — a
wetland foraging trip, walk home, exact-number unload line, welcome, numbers
matching the ledger exactly. 51107 day 7 reads as a small haul, not a missed
unload. Balanced panel §15: inapplicable as preregistered (custom census vs
a published baseline); no compare fabricated.

## Arm 2 — sim-trendsensor-b: NO-GO, killed at pilot (no confirm spend)

Question: does a simple trend-aware "full" reading stand the gate down
earlier on the fatal 51101 slide without false stand-downs on survivors?
Baseline (1130Z depositgate): gate fires mean 28/30 days, diverts mean
47,448 kcal/seed to the fire, villages survive 19/20; on 51101 it ate
6,442 kcal days 12–17 while the pantry halved (18,589 → 9,518) with voice
still saying "the shelves are full", stood down day 18, collapse followed
(starved day 22, HUNGER WINTER day 22, scattering day 25). Collapse evidence
n=1 (confirm band produced zero new collapses).

Pre-registered rule (prereg committed before any judged analysis,
39c6d84f5): TREND-NOT-FULL on an evening iff total pantry fell >=20% over
5 evenings AND fell 3 evenings running ending that day AND the level rule
still says engaged. DIAG-GO required both: (a) trend stand-down >=3 days
earlier than the level rule on 51101, AND (b) false stand-downs on <=2/7
surviving pilot seeds. Pure replay of the committed depositgate armed
corpus, seeds 51101–51108, competent, 30d — no new sims.

Pilot result: **(a) PASS, (b) FAIL → NO-GO.** Trend day loopDay 7 vs level
stand-down loopDay 18 on 51101: earliness 11 days. But 3 of 7 surviving
seeds fired in their final engaged run (cap 2): 51103, 51104 (cleanest false
alarm — pantry recovers to 32–33k and survives), 51108. No confirm sims run.

Why it fails, in plain words: the killer slide (days 12–17) looks, to a slope
rule, exactly like the settling that opens every healthy run (days 3–7) —
same shape, same speed, different ending. Week 1 teaches the rule the wrong
lesson. Survivors dip hard and come back (51103 down to 13k, then back up),
so standing down on a dip isn't obviously right either. Metric review (in
the arm evidence, not applied here): the next design must tell a dip from a
slide — e.g. an early-window exclusion or a recovery check, pre-registered
and judged on fresh seeds. Counting-rule note for that run: false count is 3
under the final-run rule but 6 counted anywhere (51105/51106/51107 fire early,
then their gates disengage and reset the run) — the next run must pre-register
its counting rule explicitly.

Sense test: the voice does overstate fullness while the pantry falls —
"shelves full" lines run unbroken days 2–17 (27 lines), including day 17 at
9,518 kcal ("The pantry can't take more"). The known "pot stays full" prose
bug reproduces on the day-22 starvation night, verbatim — recorded only, not
re-litigated (already filed by the depositgate arm). Proof: coordinator
re-ran test-trendsensor-b green, 20/20 checks (the worker's report said
23/23, counting 3 live replay checks that live outside the test script;
the test itself is 20/20 — noted, not a blocker, since the verdict rests on
the analyzer output and prereg). Worker commits 39c6d84f5 (prereg),
ab67518fc1 (replay + pilot evidence + corpus), merged --ff-only.
Balanced panel §15: inapplicable as preregistered (within-trajectory
instrument comparison on identical evening series); no compare fabricated.

## Reachability verdict (in-window only)

Both arms are 30d pre-seat DIAG windows: wave reach max 2, median survival
30d, collapses 0/8 (depositkeep) and 1/8 (trendsensor replay, the known
51101 collapse). Waves 3–5, Arc II/III/IV, regional → national, table, win
flag are not reachable in these windows and are not claimed. Wall numbers
are UNCHANGED from the last measured state (full seat 0 / wave 5 reached 0
stand as last measured in the Loop A lane); nothing in this run moves them.

## Village assessment (plain words)

With the gate off, the scholar's homecomings finally feed the village — but
only on the seeds where the scholar actually brings finished food home. On
the other seeds the scholar comes home carrying unknowns and raw nuts the
pantry can't take as food, and no keep setting changes that. And the
village's bookkeeping shifts: food that used to arrive as a deliberate
donation now arrives automatically at the door, so the donation count goes
quiet even though the food still arrives. Meanwhile the gate's "full" voice
keeps telling a falling pantry it is full, and a simple falling-pantry alarm
can't tell a healthy early dip from the slide that kills a village — it
would have cried wolf on three villages that survived. The keep works; the
pack is the next problem, and the sensor needs a way to tell a dip from a
slide before it earns a say in the game.

## Blanks filled or documented

- FILLED (measured, DIAG): the keep-threshold mechanism is now a clean,
  verified threshold (100% over-2,000 unload, 0% at-or-under); the
  unload/donation substitution mechanism is named; the trend sensor's
  failure mode is named (week-1 settling mimics the fatal slide).
- DOCUMENTED (not fixed, no game change): pack composition as the next
  scholar-supply lever; dip-vs-slide discrimination as the next sensor
  design; the unload+donation summed metric for future generosity counts.
- No backlog lines appended by either arm: both findings are the arms' own
  results (substitution, pack composition, first-week settling, final-run
  sensitivity are in the arm evidence / metric reviews), and the pot line
  was already filed by the depositgate arm.

## Telemetry deviation check (coordinator, both corpora)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current <corpus>
--metrics national,table,wins,exiled` on both corpora: 3 LOUD lines each
(national 12 -> 0, table 16 -> 0, wins 16 -> 0) — the known missing-field
artifact class: 30d pre-seat DIAG censuses do not carry those fields, and
the window cannot reach them anyway. Baseline NOT rolled, no investigation
item. Same class as the 1130Z run.

## Infrastructure

- Worktree registration fought sustained slowness all morning (each register
  runs its own reap under heavy sibling load; ~15 min for both trees, no
  failure, no ref surgery). Both trees registered clean and heartbeated.
- Safe-commit index clobber hit both workers' commits and both coordinator
  merges were verified; commits always correct (repaired via --add
  --cacheinfo from HEAD blobs where it struck).
- Master moved twice under the run (journey succession r94 ab47110bd, plus
  this run's own trendsensor merge): depositkeep rebased clean in its own
  worktree, proofs re-run green; trendsensor merged before that move.
  Zero file overlap with sibling lanes either way.
- Sibling Loop A trees (sim-dawnblock-a, sim-titangate-a) untouched; Loop A
  claim still live at closeout.
- check.js --quick NOT re-run: zero src/js, zero green-list files, and the
  standing 280/7 pre-existing profile was recorded by sibling runs today.

food-economy stays converging (NOT converged): the keep mechanism and the
sensor failure mode are now measured, but no strand lever has been judged
GO and no game change landed. scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) HUNGER WINTER relief passivity (steve-call
candidate — still needs a ruling before any work); (2) pack-composition lever
for scholar supply (identification / processing / forage targets — the
depositkeep zero seeds' actual blocker); (3) dip-vs-slide sensor design
(early-window exclusion or recovery check, pre-registered, fresh seeds,
explicit counting rule); (4) P3 reset follow-ups — night-22 +3,005 silent
inflow bridge (still undocumented), double endDays on vessel-death days;
(5) patrol-departure narration; (6) garden/fish/traps early path (marginal
2.8% combined — ripening / assignment path, not yield numbers);
(7) creek clearance wood-bound — evening wood-carrying before any
creek-clearing lever; (8) rubble daytime-clearing habit unmeasured;
(9) washed_out scramble narration; (10) 96-tick bridge edge unobserved;
(11) a 120d window only if a new horizon-cut episode appears.
Claim deleted; lock deleted. Merged locally, pending ship.
