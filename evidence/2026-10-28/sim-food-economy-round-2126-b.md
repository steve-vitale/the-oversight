# Loop B round 2126Z — food-economy (2 arms LANDED as measurement, 1 arm KILLED at pilot and HELD unmerged)

Run: fleshout-loop-b-20261028T2126Z. Axis: food-economy (converging, second axis;
loop A live on scale-onramp throughout — its sim-fieldability-a / sim-chainkill-a
trees appeared mid-run, NOT touched). Base at arm start 7d3e34f99; final master
367ff8d30 (prestage3tap + morningpersist merged; nighttravel NOT merged).
Pre-flight: main tree dirty only with the known ONTOLOGY.md 0-byte transient
(18:55Z, pre-existing, left alone per precedent, still 0 bytes at closeout, never
committed or reset). Disk 16%. No live A/B lock or claim at run start; B lock +
claim created at 21:28Z. Registration slow (~80s/tree, as in prior rounds).

## Arm 1 — sim-nighttravel-b: KILLED at pilot, HELD unmerged (NOT landed)

Policy scripts/policies/nighttravel.js (default-OFF, one-hop home + insideevening
entry), zero src/js. Prereg 20a3684d5 committed before any judged run; scaffolding
796da3d33; evidence + pilot corpora 48820a91. Proof PROOF-GREEN on its branch
(re-verified by coordinator: T8 sense anchor, T9 honesty guards, T7 no src/ changes).

Pilot 8 seeds 10700–10707, 30 loop-days, control = insideevening-only on identical
seeds. Primary M1 pooled away-evening conversion: 2/20 = 0.10 vs bar ≥ 0.50 → FAIL.
Guards hold: median survival 30 vs 30, starvation 1 vs 1 (same day-12 bearer death
on 10700), 0 honesty violations (no mid-fight/tent entry, every hop exactly one
unforced hop landing on the haven node). No confirm run spent, per §14 — the arm
was NOT re-scored against the within-reach rate.

Root cause is metric scope, not a wrong lever (kill discipline, Steve 2026-10-21):
18 of the 20 eligible away evenings are seed 10700's two distant expedition
stretches (forest_floor (1,7) and thicket (6,0), both Manhattan d6 from haven) —
no single-hop evening lever can touch those by design. The within-reach population
is 2 evenings and BOTH converted (10701 day 26 grove d1; 10705 day 10 grove d1),
hop cost 0 kcal (node travel free by engine law), entry walks −10/−8 kcal, with
sensible narration. Converting 10701 day 26 re-homed the player — days 27–30
became at-haven evenings vs control's creek-away evenings.

COORDINATOR JUDGMENT: do NOT merge as a landed lever, do NOT run confirm on this
bar, and do NOT delete outright. Branch sim-nighttravel-b + worktree HELD with a
fresh heartbeat (reaper-safe, NOT released as merged/abandoned) pending a
metric-revised rerun: within-reach conversion as primary, with a minimum-n rule,
expedition-away as a separate population, streaks-broken as secondary. The
10714/10720 prediction (trail_edge d1, meadow d3, grove d1 sit inside the reach
that converted 2/2) is testable under the revised metric, NOT claimed now.

Wall (30-day pilot corpora): national/table/wins 0 observed; wave reach identical
both legs (wave 1: 3 seeds, wave 2: 5, waves 3–5: 0).

## Arm 2 — sim-prestage3tap-b: CONFIRM-GO, LANDED (measurement only)

Prereg c3ad1f13 before any judged run; pilot 81b5db7a8; confirm addendum 43ef11bf
(band 10910–10925, bars unchanged); confirm 0d0e730b. Merged --ff-only onto
7d3e34f99. No game code, no policy-default change; scripts/policies/insideevening.js
untouched. Proofs PROOF-GREEN on both bands, re-run on merged master (pilot
240+240 evenings, 80 tap rows; confirm 480+480 evenings, 160 tap rows).

Tap days preregistered from the start at loop-days 8–12, never moved. Substrate
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1; 30 loop-days.

| Metric (bar) | Pilot 10900–10907 | Confirm 10910–10925 |
|---|---|---|
| P1 pooled tap-day at-haven inside rate (≥0.80) | 39/40 = 0.975 | 71/71 = 1.00 |
| P2 tap rows stage < 3 (>0.50) | 40/40 = 1.00 | 76/80 = 0.95 |
| P3 seeds with ≥1 inside tap (6 / 12) | 8/8 | 15/16 |
| G1 median survival (≥0.8× control) | 30 vs 30 ✓ | 30 vs 30 ✓ |
| G2 starvation (≤ control+2) | 0 vs 1 ✓ | 2 vs 1 ✓ |

Marginal value (the point of the arm): remote taps 0/120 policy and 0/120 control
across both bands. Confirm policy taps: 71 inside / 9 none / 0 remote — 67 attempted
successes from inside (37 caught + 30 clean) vs 0 control successes (80/80 'none',
65 hall-refused, 13 ownership refusals, 2 kcal refusals). Contrast with the 1930Z
late window, where 10714's 5 away taps succeeded remotely at stage 3. The confound
is gone: in week two the pantry is a physical room and inside is the only
successful tap route.

Named failures, not smoothed: pilot 10905 loop-day 8 — walk interrupted by combat,
tap honestly refused mid-fight. Confirm 10923 — sole P3 failure, all 5 tap days away
at grove (same away class as 1930Z's 10701/10714/10720; the only route that would
convert it is the nighttravel lever, held above). Confirm 10910 — 3 away days at
forest_floor while running on empty, still passes P3 on its 2 inside taps.
Ownership refusals mid-window (10903 days 11–12; 10910, 10916 days 11–12) after
bearer deaths. Stage-3 crossings on policy legs only: 10911, 10925 (2 taps each) —
all 4 still read 'inside', since the gate checks inside before remote.

Sense: confirm 10912 loop-day 8 reads end-to-end as a sensible played evening
(walk, "You step into the Haven hall.", clean lift, next morning still inside).
Confirm 10923's grove refusal is the honest physical fact: "The pantry is in the
hall. Your hands are not."

Wall (30-day instances, instrument emits no national/table/win flag): national 0,
table 0, wins 0 observed; wave 4–5 reach 0 both bands/legs. Confirm maxWave: policy
wave 3 on 1 seed (10925), wave 2 on 12, wave 1 on 3; control wave 2 on 11, wave 1
on 5. Median survival 30 vs 30 both bands. No balance-panel compare (30-day
position/reachability measurement, same precedent as 1930Z — cannot move or
observe panel metrics).

## Arm 3 — sim-morningpersist-b: GO, LANDED (measurement only)

Prereg 16f429c98 before any judged run; measurement aecfdaa8a/367ff8d30 after
rebase onto the prestage3tap tip (clean rebase, proof re-run, then --ff-only
merge). Zero src/js. Proof PROOF-GREEN on merged master (T4 trace completeness
100%, T5 exact 1930Z reproduction).

The mover is traced 3/3: every morning-after-inside-evening miss is a FLEE-BY-DOOR
in a morning fight drive — competent.fight's tbPlayerMove onto a door cell triggers
the engine's flee-by-door rule (nested exitBuilding(true) → havenDoorLanding
(4,5)), ending the fight as 'fled'. Sleep preserves inside on all 3 misses; NO
upkeep verb moves the player on any miss interval. The 1930Z hypothesis
(feastFightRoad patrolling while feasted) is KILLED: feasted=False at every
interval snapshot, zero travelTo in any miss interval.

Per miss (reused 1930Z confirm band, seeds 10710–10725, 30 loop-days, same
substrate): 10712 morning 21 — sleep inside (4,7); fight drive moves (7,7), then
door cell (5,6) → exit → (4,5); witness Kelsey: "Live to fight it. Smart."
10720 morning 18 — sleep inside; fight drive moves (5,6) → exit → (4,5); witness
Omar: "Coward's move. Smart, but coward's." (Morning reads (5,6) only because a
second fight later that morning moved the already-outside player; the mover is
still the (4,5) flee exit.) 10722 morning 30 — sleep inside but post-sleep
checkpoint already has pendingEncounter=true; the post-sleep contest drive
resolves it into a fight BEFORE upkeep-1: tbPlayerMove (4,6) → exit → (4,5);
witness Rafael.

Primary metric trace completeness = 3/3 = 100% (GO bar 100%, no untraced miss).
Miss rate 3/411 (0.73%), exactly reproducing the 1930Z confirm set seed-for-seed
and morning-for-morning — no expansion band needed. Guards hold: median days 30
(bar ≥24). Sense: the exit is fully legible in the game's own lines ("You dive
through the doors — outside! The fight is behind you." + villager witness +
"You escape."), not teleportation.

Wall: national/table/wins 0 observed (not observable in 30-day instances,
reported not omitted); wave 4–5 reach 0 (max wave unlocked: 1 on 5 seeds, 2 on 10,
3 on 1 — seed 10714); wave kills 90 (wave 1: 81, wave 2: 9); median survival 30
(all 16 survived to cap). Deaths 122, mostly others' fights (villager combat 45,
combat 37).

Residual thread, named next arm (evidence carries a prereg sketch): why a fight
is live inside the hall at dawn — the mover is traced, but the fight's origin
(which monster, how it reached the hall; for 10722 a pending encounter out of
sleep, for 10712/10720 a fight live between post-upkeep-1 and the fight drive)
was not recorded (tracer logs verbs/positions, not tbfight fighters or encounter
provenance). Next arm: record fighters + pendingEncounter provenance at every
fight-drive entry; GO bar 100% fight-origin completeness on the fights behind
the 3 misses. The 1930Z pilot-band miss (10701/14) is consistent by landing
position but was NOT traced by this arm — not claimed as traced. Walk-quote kcal
variance not chased (separate open item; not observed in any miss interval).

## Village assessment (plain words)

In week two the village is still finding its feet, the System has barely arrived
(stage 1–2 on every control tap), and the pantry is a physical room: a player
bedding down on the grounds cannot lift from it, and every control tap says so in
the hall's own words. Villages whose players walk the few squares to the lodge and
sleep inside wake up in the hall and their taps lift (67 confirm lifts, about half
caught). Villages away for the tap week, or running on empty, get honest refusals.
Nobody starved out of a run; every instance survived 30 loop-days. And the rare
morning that starts outside after an inside evening is not a teleport or an
upkeep verb sneaking the player out — it is a morning fight the player fled
through the hall doors, witnessed and narrated, landing back on the grounds.
That is a village that behaves like a place with doors, fights, and witnesses —
not a spreadsheet.

## Wall summary (this run's judged corpora, NOT a win-seeking run)

No wall movement claimed: two measurement arms and one killed-at-pilot policy
arm, all on 30-day position/reachability substrates. National/table/wins 0
throughout; wave 4–5 reach 0 throughout; median survival 30d on every band.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-28/sim-morningpersist-b-corpus/*.json' --metrics
national,table,wins,exiled`: 3 LOUD lines (national 12→0, table 16→0, wins 16→0;
n=16 files), all the KNOWN field-shape + regime artifact class (30-day pre-seat
substrate vs a WINSEAT baseline; this run's own wall numbers are 0/8 by design).
No exiled LOUD line. Baseline NOT rolled.

## Metric review

- Nighttravel's pooled bar tested the map, not the lever: 18/20 eligible away
  evenings were one seed's distant expeditions. Proposed revision for the NEXT
  run's prereg (not applied here): within-reach conversion as primary with a
  minimum-n rule, expedition-away as a separate population.
- Prestage3tap's stage leg: control legs stayed below stage 3 while policy legs
  crossed it on 2 seeds, so stage was read at tap time per leg, never assumed —
  the leg design held up; keep per-leg tap-time staging in future window arms.
- Morningpersist's expansion rule was not needed (exact 1930Z reproduction);
  the rule stays in the prereg for bands that do not reproduce.

## Backlog maintenance (this run)

Appended [open] to hidden_files/sim-findings.md: (1) nighttravel smoke finding —
seed 99994 sat 18 evenings at trail_edge (4,2) because a fallen tree blocks the
hop home, and competent's own trips couldn't get home either (daytime roadwork
fix class: clear the tree / route around, not an evening-lever fix); (2)
morningpersist residual — fight-origin provenance at dawn-hall fights (named
next arm above). NOT touched (Steve-call gated, unchanged): thief pre-payment
precheck; DOM-tap lodge entry; 'a stranger' wording tune.

## Merges

prestage3tap onto 7d3e34f99 (proofs green on merged master, both bands) →
0d0e730b; morningpersist rebased onto 0d0e730b (clean, proof re-run green) then
--ff-only → 367ff8d30. Trees released done-merged, worktrees removed, branches
deleted. Nighttravel branch + worktree HELD unmerged (fresh heartbeat), NOT
released. Coordinator evidence commit is this file's commit (see log).

## Coordinator check.js --quick on merged tip 367ff8d30

`node scripts/check.js --quick`: 284 passed, 6 failed in 761s — the same counts
as the 1930Z coordinator check. Retained output shows occupation panels,
phone-frame proof, and establishment-r20-fixes failures (all standing
pre-existing items; the 1930Z set also included measurement-proof update,
measurement-workflow, and mobile-combat-cadence, and the counts match exactly).
Zero src/js files in the merged range (79 files, all scripts + evidence), and
zero references to any arm file in the visible failures. Check is NOT green on
this tip, but the failures are not regressions from these arms: both landed arms
are measurement-only with their own proofs green on merged master. Retained-proof
/ phone-proof staleness stays maintenance debt for the measurement owner, as in
prior rounds.

food-economy stays converging (NOT converged): the pre-stage-3 window is now
measured clean (inside is the only successful tap route before stage 3; the
remote confound is gone), the morning-persistence misses are fully explained
(flee-by-door, not upkeep travel), and the nightly travel-home lever works
within reach but its pooled bar was the wrong instrument — it is held for a
metric-revised rerun, not landed and not deleted. No food-economy change in this
run touches the scale wall. scale-onramp stays converging (untouched; sibling
loop A lane). Claim deleted; lock deleted. Merged locally, pending ship.
