# Loop B round 0330Z — food-economy: gardenpool CONFIRM GO (landed) + gatefloor PILOT NO-GO + tasktag guard PILOT NO-GO

Run: fleshout-loop-b-20261102T0330Z (scheduled 2026-11-01 21:30 CST, started 21:31 CST).
Axis: food-economy (second axis). Sibling Loop A live on scale-onramp at run start
(0250Z claim: sim-sumtrigger-a + sim-titanghost-a) — NOT touched. Loop A closed out
mid-run (0250Z round evidence 89eb84e76: sumtrigger PILOT GO, titanghost B1/B2 GO,
merged locally pending ship) and its claim/lock are gone at closeout; its landed
titanghost game-code arms are the reason master moved under this run (see below).
No B lock at run start after the 0047Z closeout; claim written before any sims.
No scale-onramp work, no #1538 steve-call items built.

Pre-flight: main tree clean at d88731c4b, disk 25%, worktree-reap no-op on live
trees (9/16 active). Master moved during the run (journey-deepening r83, then Loop A
0250Z landings; tip 606567aaf at gardenpool landing). Nothing merged except the GO
arm, so only gardenpool needed a rebase (clean, see below).

## Arm 1 — sim-gardenpool-b: PILOT GO + CONFIRM GO, MERGED

Branch sim-gardenpool-b, commits e468cec17 (prereg, before any judged sim) +
afee55c34 (pilot GO change + proof + corpora + panel) + 545e5e9a7 (confirm GO
corpora + check + landing recommendation), rebased onto 606567aaf clean (no
conflicts; titanghost arms touch titan/muster systems, gardenpool touches
harvestGarden only) as 43bd15421 + 5f7fdb21c + 588c1dfb7, proof test 10/10 on the
rebased tip AND on merged master, merged --ff-only as 588c1dfb7; tree released
(done-merged), branch deleted.

The change (harvestGarden only, carry base still 20): garden harvest now respects
the pack gate instead of a bigger cap number. Per ripe plot at Haven: fits -> pack
as before; finished food that overflows -> straight to the pantry via return
pooling's depositPantryPieces path, narrated with pack state, load (units x name,
kg, kcal), and destination; anything else (unprocessed food the pantry can't
store, or a plot bigger than the pantry's remaining room) -> deferred on its plot,
still ripe, narrated with the exact reason. Food never vanishes: packed, pooled,
or still growing. No gate, price, or deed-bar change; 20 kg is reported as code,
not canon (no canon doc covers pack capacity).

Pilot (fresh 74001-74008, 30d competent-entrywindow-b, DEPOSITGATE=0, identical
seeds): pack-full 17 -> 3 (-82%, bar <= 8.5); day-start overload days 10 -> 0;
mean daily haul 963.5 -> 1040.2 (no food loss); away day-ends 12 -> 7; starvation
0 -> 0; mechanism: 21 pooled lines, 127,705 kcal garden-pooled, 4 deferred lines.
All 8 bars PASS.

Confirm (fresh 74101-74112, same bars): pack-full 24 -> 1 (-96%, bar <= 12);
overload days 10 -> 0; haul 973.4 -> 1012.6; away 12 -> 12 (equal, per-seed
identical — pre-existing rotation stranding, shape veto correctly not fired);
starvation 0 -> 0; mechanism: 16 pooled lines, 114,060 kcal pooled. All 8 bars
PASS.

LANDING-VALUE CAPACITY DECISION (explicit, as the 0047Z next-blank required):
LAND base 20 — no cap change. The garden fix beats the CAP40 screen without
touching the live default (CAP40: 18 -> 4 on its band; garden-pooling: 17 -> 3
pilot, 24 -> 1 confirm). The residual is standing-load-shaped, not garden-shaped:
pilot 74003's 3 attempts start the day at 19.35-19.75/20 kg after the garden
pooled; the confirm's single residual (74101 day 28) is byte-identical on both
legs. CAP40 stays held — SUPERSEDED, not landed. Any future capacity value is a
separate standing-load arm's job. check.js --quick 284/6, all 6 proven
pre-existing on base code. Grammar-only narration fix after the pilot legs
(multi-plot go/stay agreement) plus widened analyzer regexes — zero behavior
delta, proof re-ran 10/10, pilot re-judged GO with identical counts; confirm legs
ran on the final code.

Sense: the morning after a harvest stopped being a lost day. Before, a big garden
night left the scholar starting at 30-40 kg in a 20 kg pack and spending the day
being refused tile after tile with no line ever naming the load. Now the harvest
either fits, goes straight to the pantry with its weight and calories named, or
stays visibly on its plant with the reason named. One rich seed (74007, pantry
~150k kcal at its cap) shows deferral working across days: plots wait, then pool
as the pantry drains — nothing lost, foraging never blocked (0 pack-full failures
on that seed). Food reaching the village actually rose (pilot 159,995 -> 191,110
kcal; confirm 161,020 -> 187,140 kcal) because freed forage days outweigh the
accounting shift. One honest wrinkle: 74109's haul dips 988.6 -> 894.1 while its
forage successes rise 25 -> 27 — its 28,500 pooled kcal is excluded from
meanDailyHaul by definition (baseline counted those berries when they pooled at
return). Not a loss; documented in the arm evidence.

## Arm 2 — sim-gatefloor-b: PILOT NO-GO, do NOT merge

Branch sim-gatefloor-b, commits ecc37bf0 (prereg, before any judged sim) +
71ca1796 (port of (c) sensor + floor 12000 in src/js/game.js only, +72 lines)
[needs-eyes] + 396469a (evidence + corpora + panel). Proof test 16/16 green,
including floor boundary (12,000 exactly = no fire, 11,999 = fire). Port
diff-of-diffs vs held deploy 1cdc73f9e = comment wording + the single floor line,
nothing else. Branch HELD, worktree kept with a fresh heartbeat; the [needs-eyes]
flag on the port commit is MOOT (nothing player-visible lands). Held branch base
is now behind master (d88731c4b); any future work must rebase or re-port.

The one revision, decided up front: firing-evening TOTAL pantry must be strictly
below 12,000 kcal (added to (c): S = first evening of the disengaged stretch,
day >= 8, 3 consecutive falls, pantry <= 0.90 x S-pantry, plus pantry < 12,000).
Gate unchanged; sustained-recovery clause kept; a warning once born still stands
regardless of re-engagement (the floor gates eligibility at firing time only).
Justification from the two shapes: 51608 fires at 7,640 (36% below the floor),
73005 at 18,090 (51% above, blocked), 73008 at 24,920 (108% above, blocked);
12,000 is the near-geometric midpoint of 7,640/18,090.

Verdict: PILOT NO-GO, judged against the prereg (analyzer exits 1). No confirm
run. Legs: timeliness PASS (51608: exactly 1 warning, day 16, S=13, 11,233 ->
7,640, <= 18, first starvation day 21); series-match PASS (deployed = recomputed
would-fire on all 9 seeds); sustained recovery PASS on 51608 (NOT-recovered, bar
8,404, day-25 spike hole closed); neutrality PASS (0 row-field diffs on all 9
seeds, exactly 1 inserted voice line per warning); panel leg PASS (all 31 capable
observed metric deltas = 0; decision string review_required on thin luck coverage
only, as corrected in the prereg); fresh-quiet FAIL and evenings-leg FAIL —
fresh survivor 76007 warns day 23 (S=20, 12,554 -> 10,122) and scores RECOVERED
under the sustained-recovery clause (days 27-28: 13,473 / 15,205, both >= 1.10 x
10,122), so it is a false fire by the prereg's own definition, and the village
survives all 30 days. 73005/73008 were NOT re-scored as judged evidence
(motivation only). Fresh coverage: 7/8 survived; 76008 lost day 24, no warning.
check.js --quick 284/6, all 6 proven pre-existing on base code.

Caveat, disclosed not hidden: pilot band 76001-76008 was previously used
2026-10-29 by Loop A sim-fullseat-a (180d, different lane/policies) — discovered
after the prereg commit but before any after-corpus judged sim. The prereg's
declared scan (gatediseng-line evidence + tracker) was clean and the band was
chosen blind to gatediseng outcomes, so gatediseng-line freshness holds, but the
band is not virgin across all evidence. Confirm band 76701-76712 was verified
clean across ALL evidence .md files and remains unspent (not run — pilot
failed). Spent for the gatediseng line: 76001-76008.

Sense: 51608 day 16 reads as the village noticing in time; 76007 day 23 reads
pressured in the moment (Arc III milestone + a "reserves critical" line the same
evening) — what condemns it is what follows: the store recovers for three
straight evenings and the village survives. The line is honest about the trend it
saw; the rule's claim that the trend means trouble is what failed. Documented
next blank: floor-alone insufficiency — a shallow below-floor slide with
recovery defeats an absolute floor; the next revision must address fall depth
(51608 fell 32%, 76007 only 19%) and/or bounce-back at firing time, not a new
floor value.

## Arm 3 — sim-tasktag-b: Stage A PROVEN + Stage B PILOT NO-GO, do NOT merge

Branch sim-tasktag-b, commits 7234d3e33 (Stage A prereg + task-tagging instrument
+ verbatim pocketaware replay port) + b011536a1 (Stage A evidence + 60307 replay
corpora) + bbda7a0c9 (Stage B prereg + way-home guard policy + driver edits +
judge + panel registration) + 810fdc3a4 (Stage B evidence + pilot corpora +
panel). Branch HELD, worktree kept with a fresh heartbeat. Held branch base is
now behind master; any future work must rebase or re-port. Policy-side only,
zero src/js.

STAGE A — stoneRun fog-push: PROVEN (with one stated detector caveat). Fidelity
check PASSES exactly: baseline replay away 6, stretch days 5-10, player
dehydration day 10; armed replay away 21, stretches 6-13 + 17-29, player starvation
day 13 — all matching the pocket evidence. Instrument bar PASSES: tag coverage
baseline 120/120, armed 142/142; trigger days 9/9, 10/10, 6/6; forages correctly
tagged forageTripSeedFirst. Tagged entry walks, both stretches, both legs:
stoneRun. Baseline day 5 / armed day 6: (4,4)->(2,4)->(1,4)->(1,2)->(1,1)->(2,0),
homeward tries refused fallen_tree, forage AFTER the stranding. Armed day 17:
(4,4)->(7,4)->(8,4)->(8,2)->(8,1), homeward tries refused creek, zero forages
that day. Fog-push branch proven by scan probe, not by the hop flag: at all three
trigger-day starts nearestRubble is null and nearestUnknown is (1,4) day 6 /
(8,4) day 17, so stoneRun's code can only take its fog-push loop. The prereg's
hop-level fog flag did NOT fire and is retired as a detector — walkTo hops
reveal their destination by adjacency on the previous arrival, so a fog target
reads revealed by hop time. Stated in the evidence, not re-scored: task proven by
tags, branch proven by probe + code path. Compounding detail: stoneRun re-fires
3 travels/day inside the pockets on every stretch day after the trigger.

STAGE B — way-home guard on stoneRun walks: PILOT NO-GO (no confirm run). Fresh
band 60501-60508 (verified zero seed-field + zero .md hits in worktree evidence;
stated limit: compressed panel archives and siblings' uncommitted corpora not
scannable), 30d competent vs competent-wayhome-b, DEPOSITGATE=0, identical seeds.
Guard: a stoneRun-tagged hop whose simulated greedy walk home fails is refused at
the wrapper (self-contained pocketaware-signal copy, zero src/js). Away day-ends
band total 0 -> 0 (PASS, vacuously — quiet band); new-or-worsened seed none
(PASS); failed-trip share 0.396 (95/240) -> 0.404 (97/240) (FAIL); mean daily
haul 945.2 -> 888.9 (-6.0%) (FAIL); median survival 30 -> 30 (PASS); player
starvation deaths 0 -> 0 (PASS); engagement 75 refusals (PASS, bar >= 10).

The entire band miss is one seed, 60501 (other 7 seeds byte-identical on
share/haul; 60508 takes 42 refusals with zero downstream effect). On 60501 the
guard vetoes the rubble-clearing walk 3x/day for days 10-20 (33 refusals): its
hop-time return sim fails on the (4,2) rubble entered from its guarded side
(5,2) — but (5,2) is exactly where the scholar stands to clear it ("You clear
the rubble, stone by stone" on baseline day 10; no clear line on the armed leg).
A hop-time check cannot approve a roadwork walk whose roadwork opens the way
home. The guard is narratively invisible (no veto line; the scholar just never
walks). Diagnostic smoke (non-pilot seed 60307, pre-prereg): guard gives away
21 -> 0, starvation death gone, 6 refusals — it prevents structural-pocket
entries; the pilot bounds it with the roadwork cost. Smoke is reported as smoke,
never as pilot evidence. Panel (§15, context only): combined panel, 16 cases,
sourcesStable true, neutrality 2/2, 0 warnings; won/national/table 0 both legs,
waveReach 2 both; panel survival30 0.857 -> 0.714 runs opposite to the driver's
judged bars (8/8 survived, 0 starvation deaths both legs) — different substrate
definitions, as warned; verdict rests on driver bars.

Sense: the village's stone errand is the trap — when the pantry is full, the
scholar walks out to fetch stone for the knife, pushes into ground nobody has
mapped, and the way home is blocked by a fallen tree or a creek. Once stuck,
they keep trying the same stone errand every morning from inside the pocket
until they starve. The new guard stops that walk — but it also stops the scholar
from clearing the rubble pile that would have let them come home with the stone.
The scholar ends up safe at home, but knifeless and poorer for it.

## Telemetry deviation check

telemetry-check.js run against the gardenpool confirm baseline jsonl REFUSED by
the tool itself (single-JSON-document parse; multi-line jsonl fails at line 2 —
"LOUD: could not parse ... Unexpected non-whitespace character after JSON at
position 722160 (line 2 column 1)"). This is the known input-format limitation
precedent (0047Z/2330Z/2230Z/2030Z), NOT a deviation. Baseline NOT rolled. No LOUD
deviation lines from any judged corpus.

## Wall numbers

In-window only (30d pre-seat windows, never pooled across arms): national /
table / wins 0 in every arm's window. Gardenpool: median survival 30/30 both
legs, max wave 2 both legs, collapses 0, vests 0. Gatefloor: 7/9 survived, median
30d, max 30d, wave 1 on 9/9, wave 2 on 7/9, wave 3 on 1/9. Tasktag pilot: 8/8
survived both legs, median 30d. Full seat 0 / wave 5 reached 0 stand as last
measured (Loop A lane) — UNCHANGED in kind by this run.

## Landing summary

Merged locally: gardenpool only (588c1dfb7, game-code harvestGarden change +
proof + evidence + corpora; proof 10/10 on merged master). Two branches held,
worktrees kept with fresh heartbeats: sim-gatefloor-b (PILOT NO-GO),
sim-tasktag-b (Stage A proven, Stage B PILOT NO-GO). CAP40 stays held —
superseded by the garden fix, not landed. No push, no version bump, no live
verification (ship loop owns deploys). Findings appended to sim-findings.md:
gatefloor 3 lines, tasktag 3 lines, gardenpool 2 lines (by the coordinator).

## Infrastructure

- Worktree registrations ran slowly behind registry-lock contention with Loop A's
  concurrent registration at run start (sequential registrations, minutes each);
  no trees touched wrongly. Heartbeat flaps on registry-lock contention during
  the arms (killed + retried successfully; final heartbeats verified).
- Safe-commit index clobber hit ALL worker commits on all three arms (staged
  deletions, untracked copies, stale base index entries); every commit verified
  correct via git show --stat and repaired via HEAD-blob cacheinfo before
  continuing; all three worktrees verified clean at closeout.
- No EPERM flap on the worker arms this run. Master moved under the run (journey
  r83, Loop A 0250Z landings); gardenpool rebased clean with proof re-run before
  its --ff-only merge; held branches were NOT rebased (their bases are now
  behind master — future work re-ports or rebases).
- check.js --quick NOT re-run by the coordinator (gardenpool + gatefloor arms
  ran it: 284/6, all 6 proven pre-existing; tasktag arm zero src/js).

## Next blanks, in order (food-economy)

1. Roadwork-aware way-home guard (clear-then-simulate, guarded-side exemption,
   or walk-end check), judged on a band WITH a baseline stranding (or 60307 as
   positive control) plus the same no-harm bars — not a quiet band.
2. Gatediseng depth revision: fall depth (51608 fell 32% and stayed down, 76007
   fell 19% then recovered) and/or bounce-back at firing time — not a new floor
   value. Confirm band 76701-76712 remains unspent and verified clean.
3. Pantry-cap-as-garden-bottleneck on rich seeds (74007: pantry ~150k kcal at
   cap, plots defer repeatedly while full; deferral works, but pantry
   expansion/consumption is the next lever).
4. Standing-load remainder (kept road food + gear + materials at 18.6-19.75 kg
   vs a 20 kg cap; pilot 74003: 3 attempts, confirm 74101: 1 attempt identical
   both legs) — a capacity value or materials/road-food pooling arm, not a
   garden rework.
5. Rotation prereg shape-clause revision: new-or-worsened stranding (armed >= 10
   AND >= baseline + 10, plus a starvation/dehydration death) — already proposed,
   applies to the next guard prereg.
6. Pack-full refusal narration (kg + top load, as takeFromPantry does).
7. Success-anchored rotation (patchrot 51901 counterexample, still open).
8. HUNGER WINTER relief passivity (steve-call candidate); shelling default-flip
   call; P3 reset follow-ups (night-22 +3,005 silent inflow bridge, double
   endDays on vessel-death days); patrol-departure narration; garden/fish/traps
   early path (marginal 2.8% combined); creek clearance wood-bound; rubble
   daytime-clearing habit unmeasured; washed_out scramble narration; 96-tick
   bridge edge unobserved; a 120d window only if a new horizon-cut episode
   appears.

food-economy stays converging (NOT converged): the garden bypass is closed and
landed with its capacity decision (base 20 stands, CAP40 superseded), the sensor
program now has a floor-alone NO-GO (timely on the collapsing seed, false-firing
on a recovering survivor), and the pocket-aware scope hole is now instrumented
and proven (stoneRun) with a guard that fails on roadwork timing. No gate change
landed, no default flipped. scale-onramp untouched (sibling Loop A lane).

Merged locally, pending ship (gardenpool only; gatefloor + tasktag branches held).
