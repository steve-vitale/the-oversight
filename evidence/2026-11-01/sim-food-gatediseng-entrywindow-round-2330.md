# sim-food-gatediseng-entrywindow-round-2330 — coordinator evidence

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T2330Z,
axis food-economy (converging), the second axis. Sibling Loop A live
on scale-onramp for the whole run (2315Z claim: musterroster-adopt-a
+ heraldsteer-adopt-a; Loop A landed heraldsteer-adopt-a mid-run,
master moved under both arms) — NOT touched. No B lock at run start;
claim written before any sims
(hidden_files/lever-claims/fleshout-loop-b-20261101T2330Z.json).
Pre-flight: main tree clean, disk 23%, reap no-op on live trees
(8/16 active; sibling trees left alone).

Arms take the 2230Z next blanks (1) and (2) in order, per DELIVER
OVER MEASURE (Steve 2026-11-01): delivery arms over re-measurement.
The deploy arm touches the game.js sensor path only; the confirm
arm is policy-side — non-overlapping, safe to share the run.

## Arm 1 — sim-gatediseng-deploy-b: NO-GO per prereg, branch HELD (not merged)

Worker commits 98e5d4e0d (deploy prereg, committed BEFORE any judged
sim) + 1cdc73f9e (implementation + evidence + tests + corpora) on
branch sim-gatediseng-deploy-b. Evidence (on the branch, not
master):
evidence/2026-11-01/sim-gatediseng-deploy-b-prereg.md and
evidence/2026-11-01/sim-gatediseng-deploy-b.md.

The deploy implements the 2230Z spec exactly: sensor-path branch
in src/js/game.js (`_depositGateDisengagedTrend()`, called first
in endDay), gate unchanged, one warning per disengaged stretch,
warning stands regardless of later re-engagement with NO
engaged-D+5 requirement, pantry-only 10-evening recovery scoring,
verbatim voice line. Proof test 20/20 green on synthetic series.

Judged exactly against the prereg — NO re-score:

- FIRING-MATCH, 51608: MISS. Deployed warning fires day 16
  (S=13, S-pantry 11,233, pantry 7,640), preregged day 15 (S=12,
  9,483 -> 7,535). Root cause, measured: the in-game endDay
  evening is a later moment than the tracer's post-daily evening;
  ~1,500-2,400 kcal of NPC/policy deposits land between the two
  reads, flipping the stand-down from day 12 to day 13 and the
  firing from day 15 to day 16. Same rule, same shape, one
  evening later. The warning is still IN TIME (day 16 vs first
  starvation day 21, inside the <= 18 margin), but in-time was
  not the preregged bar and was not substituted for it.
- FIRING-MATCH, 52201-52212: PASS. 0 deployed warnings on all
  12 seeds, exactly matching the would-fire set (empty).
- NEUTRALITY, all 13 seeds: PASS, byte-perfect. 0 row-field
  diffs, survival/endReason/daysAlive/waves/deaths identical,
  sayLines identical except exactly 1 inserted voice line
  (51608). The deploy changes no villager behavior — only a
  sensor record plus narration.
- Counting rules work live: 51608 shows 6 raw condition
  evenings (days 16-21) but exactly 1 warning issued
  (one-per-stretch); the warning stands through the collapse
  with no D+5 requirement.
- Sense: the line sits between small fishing hauls and the
  game's own "reserves critical" warning and echoes the
  thin-pack voice — reads as the village noticing in time.
- check.js --quick: 283 passed, 7 failed (twice, same 7); all
  7 re-run individually on pre-deploy code and fail identically
  there (proof-input staleness x2, phone-receipt staleness,
  combat cadence x2, missing ./lib/luck-instrument module,
  capable-bot food deed, establishment racks voice) —
  pre-existing on this base, none caused by this change.

COORDINATOR DECISION — HOLD, do not merge, do not delete.
Merging 1cdc73f9e would land a game.js change that failed its
own prereg, and the commit bundles implementation with evidence,
so no ff-only partial merge is available. The branch and its
worktree stay registered with a FRESH heartbeat (verified by
readback at closeout) so the reaper will not touch them; a
future arm builds on it. The [needs-eyes] flag on 1cdc73f9e is
MOOT: nothing player-visible lands from this run, so no phone
check is owed for it. Next blank for this line, in order:
(1) a re-preregged deploy prereg that bars against the sensor's
OWN evening series and decides up front whether a one-day
shift is acceptable; (2) a sustained-level clause for
pantry-only recovery scoring (the day-16 warning counts as
"recovered" because the player unloaded 36,790 kcal on day 25,
even though the village collapses day 28 — a spike, not a
recovery); (3) evenings-per-firing-seed for the deployed rule
is now MEASURED (51608: 6 raw / 1 warning; confirm band:
0 / 0), closing that metric-review item for this rule.

## Arm 2 — sim-entrywindow-confirm-b: CONFIRM NO-GO, evidence MERGED

Worker commits bab5384f4 (prereg, band 60201-60212 verified fresh
first, pair + cost + away bars frozen) + ecbed6dfd (confirm
evidence + corpora + panel), rebased onto the
journey-deepening-moved master clean, proof 14/14 green on the
rebased tip and on merged master, merged --ff-only as e3cb8f88c.
Evidence: evidence/2026-11-01/sim-entrywindow-confirm-b.md
(prereg evidence/2026-11-01/sim-entrywindow-confirm-b-prereg.md).
Policy, driver, and analyzer reused verbatim from the pilot,
never edited. Tree released, branch deleted. The lever itself
leaves no trace (no default flip, no game change) — only its
measurement lands.

Fresh 12-seed band 60201-60212, 30d competent, DEPOSITGATE=0,
identical seeds both arms, judged exactly against the prereg:

- (a) failed-trip day share, pooled: 0.446 (160/359) -> 0.075
  (27/360), bar <= baseline - 0.10 — PASS, delta -0.371.
- (b) mean daily haul, mean-of-means: 553.0 -> 828.6 kcal,
  bar >= baseline — PASS, delta +275.6.
- Cost: median survival 30 = 30 (1.0x), starvation deaths
  2 -> 1 — clean.
- Secondary: away day-ends total 8 -> 19, bar <= baseline + 5
  (= 13) — FAIL (+6 over).
- Secondary veto: seed 60207 is 60108-shaped (armed 19 away
  day-ends vs baseline 0, with starvation + dehydration
  deaths) — VETO. Baseline 60207 grinds one near-home circuit
  for 30 days and never leaves the haven overnight; armed
  60207 ranges to tile (5,3) on day 5, then finds the way
  home blocked by a fallen tree with every alternative a
  creek that refuses ("no crossing without a bridge or a
  swim"). Stretch 1 (days 5-13): Amelia Knight starves day
  13. Stretch 2 (days 18-27): Zoey Cao dies of dehydration
  day 27, followed by "You're someone else now." Both
  stretches end the day after a player-character death, with
  the next day starting at the haven — succession restarting
  at home, not a rescue. Attribution is rule x geography:
  the rule did not fell the tree or dig the creek, but
  baseline never set foot on (5,3) in 30 days — the rule put
  the scholar in the pocket twice.

CONFIRM NO-GO. The pair passes with margin and the costs pass,
but the prereg's secondary vetoes: a rule that improves trips
while stranding the scholar into deaths is worse than neutral.
The pilot's 60128 improvement (away 15 -> 5) does not
generalize — same rule, different map draw, opposite stranding
outcome. The rule must not land as-is.

Supporting results: signal still holds — empty-window identity
perfect on a second fresh band (baseline 664/664 failed, armed
51/51 failed); entry prediction 100% both legs (795/795,
302/302); mechanism fingerprint repeats (first-attempt
successes 32 -> 276, later-try attempts 512 -> 52, attempts
846 -> 378, successful-trip days 174 -> 299). Watch items:
zero 60126-class divergences (no seed worsens on both legs;
every seed improves on share); four seeds lose haul while
improving share (60202, 60204, 60207, 60212). Pack-full ceiling
grows again: 6 -> 27 (27 of 28 armed non-empty-window
failures; the one exception is 60207 day 16, nothing_in_reach
with window 2). Sense (60207 slice, visibility only, no
narration added): rotation choice still invisible; stranding
refined vs pilot — refusals ARE voiced per attempt ("A fallen
tree blocks the path.", creek refusals) and consequences are
voiced, but no line ever names the stranded state:
refusals-visible, state-unmarked. Balanced panel (§15,
context only): combined panel, 24 cases, 0 reused,
sourcesStable true, neutrality matched both policies, zero
warnings; 12/12 survived baseline, 11/12 armed, won/national/
table 0, vests 0. It disagrees with the driver on 60202
(panel: armed village-lost day 20; driver: armed survives 30d,
baseline collapses) — exactly why panel numbers never judge.
Band 60201-60212 is now spent and must not be reused.

## Wall numbers

UNCHANGED in kind (30d pre-seat windows cannot measure late-game
states): full seat 0 / wave 5 reached 0 stand as last measured
(Loop A lane). In-window: gatediseng-deploy 12/12 survived 30d
on the confirm band, 51608 collapsed day 28 (expected, the
collapsing seed); entrywindow-confirm 12/12 survived baseline,
11/12 armed (driver), wave max 2 both arms; national / table /
wins 0 in-window only. No wall movement is claimed by either
arm.

## Telemetry deviation check (coordinator, post-merge)

telemetry-check REFUSED both judged jsonl corpora itself
(single-JSON-document parse; multi-line jsonl fails at line 2)
— the known input-format limitation precedent (2230Z / 2030Z /
1830Z / 1725Z), not a deviation; baseline NOT rolled. No LOUD
lines, no investigation item.

## Findings appended (six lines)

See hidden_files/sim-findings.md: gatediseng deploy NO-GO +
sensor-evening bar for the next prereg; pantry-recovery spike
hole; evenings-per-firing-seed now measured for the deployed
rule; entrywindow confirm NO-GO + pocket-aware variant next +
band spent; pack-full ceiling grows (6 -> 27); stranding
refined (refusals visible, state unmarked).

## Infrastructure

- Safe-commit index clobber (known class) hit both workers'
  commits (repaired via cacheinfo from HEAD blobs; commits
  verified correct) and the coordinator commit path is checked
  the same way below.
- No EPERM flap on either worker arm this run.
- Master moved under both arms during landing (Loop A
  heraldsteer-adopt-a, journey-deepening r82); confirm branch
  rebased clean with proof re-run before its --ff-only merge.
- check.js --quick NOT re-run by the coordinator: deploy arm
  ran it twice (283/7, all 7 proven pre-existing on
  pre-deploy code); confirm arm is zero src/js, zero default
  flips, zero green-list files.
- Coordinator worktree registration slow (~1 min) as in prior
  runs; deploy-tree heartbeat verified by readback at closeout.

## Axis state

food-economy stays converging (NOT converged): the sensor
program now has a DEPLOYED-BUT-NO-GO rule — the warning works
live, stays quiet on survivors, changes nothing, and fires in
time, but misses its exact-day bar by one evening on the only
collapsing seed, so no gate-adjacent change lands and no
default flips; and the haul ceiling now has a CONFIRMED
NO-GO rotation — the entry-window signal still separates
perfectly, but the rule strands on pocket geography, so it
must not land as-is. scale-onramp untouched (sibling Loop A
lane).

Next blanks, in order: (1) gatediseng (c) RE-DEPLOY prereg
barred on the sensor's own evening series (one-day-shift call
decided up front) + sustained-level recovery clause; (2)
entrywindow POCKET-AWARE variant (never end a trip on a tile
whose route home is blocked), after a pack-capacity look
(pack-full 6 -> 27); (3) success-anchored rotation (patchrot
51901 counterexample, still open); (4) HUNGER WINTER relief
passivity (steve-call candidate); (5) shelling default-flip
call; (6) P3 reset follow-ups — night-22 +3,005 silent inflow
bridge (still undocumented), double endDays on vessel-death
days; (7) patrol-departure narration; (8) garden / fish /
traps early path (marginal 2.8% combined); (9) creek clearance
wood-bound; (10) rubble daytime-clearing habit unmeasured;
(11) washed_out scramble narration; (12) 96-tick bridge edge
unobserved; (13) a 120d window only if a new horizon-cut
episode appears.

Claim deleted; lock deleted.
Merged locally, pending ship (confirm evidence only; deploy
branch held, not merged).
