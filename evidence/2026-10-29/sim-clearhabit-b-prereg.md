# sim-clearhabit-b — PREREGISTRATION (written BEFORE any judged after-leg)

Run: oversight-flesh-out-loop-b, arm sim-clearhabit-b, axis
food-economy (homeward clearing habit lever). Worktree
sim-clearhabit-b. This file is committed BEFORE any judged
after-leg is run. Pilot seeds are declared in a follow-up
commit (sim-clearhabit-b-pilot.md) AFTER the fresh gate-OFF
scan and BEFORE any after-leg; the scan legs are selection
data only, never judged legs.

## Canon read before judging

- docs/CANON.md (manifest) — read first.
- docs/MAP.md §6 (the way home): node travel is free; the
  lodge detail walk bills walkStepKcal() per landed square
  plus 1 tick per step. No walk-home tax exists.
- No canon doc covers homeward clearing specifically; the
  authority is the engine itself (Game.travelTo /
  travelBlockage / clearBlockage / buildBridge, src/js/game.js)
  plus evidence/2026-10-29/sim-blockedpath-diag-b.md §5
  (which sketches this lever, unbuilt) and §4 (the 10752
  finding: clearRubbleForStone takes the nearest rubble with
  no homeward preference — any daytime clearing habit must
  aim HOMEWARD). Nothing new is invented here: the habit
  uses the engine's own clearBlockage action (the blockage
  card's action) on the hop's own blocked tile.
- Background read: evidence/2026-10-29/
  sim-food-economy-round-0730-b.md (the detour GO and the
  next-blank ordering: this habit is blank #1, SEPARATE
  from the detour, never pooled with it),
  sim-eveningdetour-b.md + sim-eveningdetour-b-prereg.md
  (substrate, driver shape, guard style),
  sim-blockedpath-diag-b.md §5 (this lever's sketch),
  evidence/2026-10-28/sim-creekpath-armb-b.md (Arm B trip
  route-around; this arm does NOT reuse it — all route
  gates are OFF in both legs).

## Perception law (Steve 2026-10-28, binding)

The habit's "home" is the villager's OWN haven:
state.village.px/py (engine default 4,4), lived-in
knowledge. Every step is an engine-offered travelTo step
(competent walkTo, which hops only via Game.travelTo) —
never a roster, crew list, snapshot, teleport, or forced
move. Clearing uses the engine's own clearBlockage. No
list-fed wiring exists in this arm.

## Policy (policy-side ONLY — no src/js, no default flips)

New file scripts/policies/clearhabit.js plus ONE gated
call in scripts/policies/nighttravel.js daily(), between
competent.daily and nightStep. Gate COMPETENT_HOMEWARD_CLEAR=1
(default OFF). No driver adopts it by default: the trace
driver sets the gate explicitly only for after legs.

### When it fires (all must hold, checked once per loop-day)

1. Gate ON.
2. Not Game.over, not in combat, not insideTent, not
   inside haven, player tile != 'haven'.
3. Haven tile verified type 'haven' at (hx, hy).
4. Haven in Game.travelTargets() (offered — the evening
   hop exists to be blocked; out-of-reach evenings are
   not opportunities and the habit does not fire).
5. The probe finds a homeward blockage (below).

### The probe (mirrors Game.travelTo's refusal order, moves nothing)

(a) Destination first: Game.travelBlockage(hx, hy) from
the current position; a block here is the homeward
blockage. (b) Else intermediates: the engine's own
bounding-box shortest-path scan (tiles on a shortest
path from here to haven, entries in [1,0],[-1,0],[0,1],
[0,-1] order, each checked with
Game.travelBlockage(tx, ty, ex, ey)); the FIRST block
found is the homeward blockage. If no block is found,
the record is 'unblocked' — not an opportunity, no
action. The probe never calls travelTo and never moves
the player.

### Which blockages count as homeward

The single first blockage on the hop path found by the
probe. Clearable: rubble, fallen_tree, washed_out.
NOT clearable by hand: creek (engine refuses explicitly
— bridge or swim only). A creek homeward blockage is
recorded 'unclearable-creek', never passed to
clearBlockage, counts in the denominator, never in the
numerator.

### The clearing action (at most once per day, clearable types only)

1. Walk to the guarded side (bx + bf.dx, by + bf.dy —
   the approach origin the blockage guards) via
   competent walkTo (travelTo hops only). If the walk
   does not arrive, record 'walk-failed', no clear.
2. KCAL RULE (exact): cost = rubble 40 / fallen_tree 60
   / washed_out with wood >= 4: 60 (the engine builds a
   bridge) / washed_out with wood < 4: 80 (scramble).
   Fire ONLY if kcal_now - cost >= 200, where kcal_now
   is scholar kcal at clearing time (after
   competent.daily, before any evening spend). The floor
   means: after clearing, the villager still holds at
   least 200 kcal — the habit never clears a villager
   below 200 kcal, so it cannot clear anyone into
   starvation. If the floor fails, record 'unaffordable'
   with kcal_now and cost, no action, counts in the
   denominator.
3. Call Game.clearBlockage(bx, by). Verify post-clear:
   blockFrom gone, or bridged == true for the bridge
   remedy; else record 'clear-failed'. Record remedy
   (rubble / tree / scramble / bridge), kcal before and
   after, wood before and after, ticks, walk from/to,
   position before the walk, after the walk, and after
   the clear.
4. What it does NOT do: no swimming; no clearing after
   a refused hop (it fires BEFORE nightStep, never
   after a refusal); no detour; no force; no second
   clearing the same day; no clearing when the hop is
   unblocked.

### Placement (stated, so the "mid-day" claim is checkable)

The habit fires at the day's-end work point inside the
daily() flow — after competent.daily, before nightStep
— the last point where the departure position is known
and roadwork ticks are still available. The blockedpath
diag's "no day-part at evening" objection applies to
clearing AFTER a refused hop at the night step; this
habit clears BEFORE any hop is attempted, as the day's
closing work, and "mid-day kcal at clearing time" means
kcal measured at that clearing moment, before any
evening spend. A true mid-daily insertion (inside
competent.daily's body) would fork the day's flow for
no measurement gain: the departure position at this
point IS the evening departure position, which is what
the rescue metric needs.

### Separation from the detour (never pooled)

COMPETENT_EVENING_DETOUR is unset/0 in BOTH legs, as
are COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
and COMPETENT_TRIPHOME_ROUTE_AROUND. The before leg is
the detour before-leg substrate (pure nighttravel);
the after leg differs ONLY by COMPETENT_HOMEWARD_CLEAR=1.
Any rescue on the after leg is clearing's, never the
detour's. The detour verdict is never re-scored here.

## Primary metric, GO threshold, minimum-n, guards (judge ONLY against these)

An OPPORTUNITY evening (after leg only) is a loop-day
with a habit record showing a homeward blockage found
(status cleared / unaffordable / unclearable-creek /
walk-failed / clear-failed), the player away at clearing
time, and the evening outcome not 'game-over'. A
still-refused evening on the before leg is the control
count, not the denominator.

PRIMARY (opportunity rescue rate, after leg only):
(opportunity evenings ending inside at haven:
inside === true AND tile === 'haven' at evening
position) / (all opportunity evenings on the after
leg). An opportunity evening that ends away, in
combat, or dead counts in the denominator, never in
the numerator.

- GO (pilot) requires opportunity n >= 8 AND rescue
  rate >= 0.50 AND guards G1, G2, G2c, G3 all hold on
  the pilot band.
- G1 (survival): median daysAlive on the after leg >=
  before-leg median - 2.
- G2 (starvation): starvation-caused deaths (analyzer
  telemetry-cause match, as in the detour analyzer:
  cause matching /starv|hunger|famine/i) on the after
  leg <= before leg + 2.
- G2c (causal window, NEW — not a re-score of any prior
  verdict): player starvation deaths (player flag true
  on the death record) with game-day within 7 loop-days
  after a clearing loop-day <= 2. The before leg has no
  clearings, so its causal-window count is 0 by
  definition; the bound is absolute (2), not relative.
  This guard exists because the kcal floor is the
  lever's starvation defense: if clearings still
  precede player starvations, the floor is wrong even
  if total starvation passes G2.
- G3 (honesty, zero-tolerance): 0 rescued evenings
  landing off-haven or in combat at evening position;
  0 clearing walks that teleport (every walk step via
  Game.travelTo; the walk must end at the guarded side
  or the clear is aborted); 0 position changes during
  the clearBlockage call itself (position after clear
  == position after walk); 0 clear verifications failed
  on evenings counted rescued (post-clear blockFrom
  gone or bridged, else not rescued); 0 creek
  clearings attempted (no clearBlockage call on a creek
  blockage, ever).
- Minimum-n: if after-leg opportunity n < 8, the verdict
  is INSUFFICIENT-DATA — not GO and not NO-GO, no
  confirm.
- NO-GO / KILL: pilot rescue rate < 0.50 with n >= 8,
  or any G3 violation, KILLS the lever at pilot — no
  confirm spend, no re-score against a friendlier
  metric (cleared-evenings only, refused-count delta,
  or any other denominator). On kill: revert the policy
  gate (remove the nighttravel call and clearhabit.js;
  leave no policy trace), commit only evidence +
  scripts + prereg, and report the kill with its
  numbers.

## Secondary (reported, never judged)

- Refused-evening counts before vs after, per seed and
  pooled (before leg: nighttravel evenings with outcome
  'travel-refused'; after leg: opportunity evenings
  ending away — the same evenings, seen from the other
  side).
- Clearings by type and remedy; kcal at clearing time
  (distribution + floor denials with kcal_now/cost);
  wood spent on bridges; walk-failed / clear-failed
  counts.
- Refused-evening streak length before vs after (maximal
  runs of consecutive loop-days ending unrescued:
  before leg travel-refused evenings; after leg
  opportunity evenings not ending inside at haven),
  mean and max.
- Tap-day reachability (driver taps recorded as in the
  detour driver; reported only, not judged).

## Staged gates

- SCAN (selection only, gate OFF): fresh seeds
  11600–11639, gate-OFF nighttravel legs, same driver
  and substrate. Qualifiers: seeds with >= 1 refused
  evening ('travel-refused' outcome) on the scan leg.
- PILOT SEED DECLARATION: the 8 highest-refusal
  qualifiers (ties: ascending seed order), declared in
  sim-clearhabit-b-pilot.md committed BEFORE any
  after-leg. Pilot seeds are never re-used as confirm
  seeds.
- PILOT GATE: both legs present for all 8 pilot seeds,
  partition sums hold on every seed, no unresolved
  unclassified investigation. If opportunity n >= 8 AND
  rescue rate < 0.50, pilot FAILS conclusively — KILL,
  no confirm. If pilot passes all guards, confirm MAY
  be spent (12–16 seeds) only if time remains in this
  run.
- CONFIRM (only if pilot passes): 12–16 seeds (the
  remaining scan qualifiers plus, if needed, fresh
  refused-prone seeds from a new scan — never pilot
  seeds), declared in a confirm declaration commit
  BEFORE any confirm after-leg. The confirm verdict
  uses the same primary metric, bar, and guards pooled
  over the confirm band; the pilot rate is a staging
  diagnostic, never pooled into a confirm verdict.

## Before / after legs and seed declaration

- Before leg: POLICY=nighttravel, gate OFF
  (COMPETENT_HOMEWARD_CLEAR unset / 0), fresh run into
  evidence/2026-10-29/sim-clearhabit-b-corpus-before/.
- After leg: POLICY=nighttravel, gate ON
  (COMPETENT_HOMEWARD_CLEAR=1), everything else
  identical, fresh run into
  evidence/2026-10-29/sim-clearhabit-b-corpus-after/.
- Pilot seeds: declared in sim-clearhabit-b-pilot.md
  (see staged gates above) — NOT in this file, because
  the fresh scan has not run yet. No seed from any
  prior arm is used: the blockedpath 18 refused seeds
  (11031, 11077, 11112, 11133, 11149, 11208, 11246,
  11251, 11273, 11299, 11349, 11360, 11365, 11384,
  11390, 11408, 11435, 11439), the detour scan range
  11500–11519, and the adjacenttile/creekpath seeds
  (10772, 10752) are all excluded. The scan range
  11600–11639 is fresh against every prior verdict; the
  scan itself verifies this (any seed with a prior
  corpus file is dropped before selection — none are
  expected).
- Control for guards: the before leg (gate OFF) on the
  same seeds, same driver, same substrate. NOT the
  detour legs: the question is clearing's effect on
  top of nighttravel, so the gate-OFF nighttravel leg
  is the control.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered here before judging: this leg is a
30-day position/reachability measurement of a
POLICY-SIDE arm — zero src/js changes, so there is no
game-root delta for a panel to compare, and the panel's
registry policies (capable, risk-aware, socialite,
winseek, …) do not include the nighttravel trace policy
or this gate — a panel run would measure different
policies over a 150-day horizon, not this lever. The
before/after instrument is the custom driver on
identical seeds, and the pre-registered thresholds
above are the judge. If this lever ever becomes a game
change, a panel compare is run at that point; a
policy-side trace cannot fake one now. (Same
pre-registered position as sim-eveningdetour-b and
sim-adjacenttile-b.)

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the verdict/detour legs: the
question is evening rescue, and the refused pattern is
visible inside 30 days (diag episodes run 1–9 evenings
within 30 days). Dead villages stop simulating (runDays
endReason); the +10d tail is a cap, not a target — no
village is simulated past its death + 10 days.

## Landing rule

- GO (pilot, and confirm if spent): lands the
  default-OFF policy instrument ONLY
  (scripts/policies/clearhabit.js + the gated
  nighttravel call + trace/analyzer/proof instruments,
  as policy files no driver adopts by default). NO
  default flip, NO src/js change, NO competent.js
  change. This worker does NOT merge to master —
  coordinator merges.
- KILLED at pilot: the policy gate is reverted (no
  policy trace left), and only evidence + scripts +
  prereg commit. The kill record is the evidence file.
- INSUFFICIENT-DATA: the branch stays HELD, unmerged as
  a landed lever, with corpora committed for the next
  run.

## Sense-testing (mandatory, in the evidence file)

Read transcripts end-to-end for at least: one
cleared-rescued evening (does the walk + clear + hop
read as a sensible played day — what did the player
pay, what did the arrival narration say?); one
unaffordable evening if any occur (does skipping the
clear read honestly, or does the villager starve
beside a clearable path?); one creek-unclearable
evening if any occur (does leaving the creek read
honestly?). Judge meaning, not counts: a rescued
evening that reads as a teleport is a failure of the
lever even if the rate passes.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who thrived
and who died and why, what knowledge/capabilities were
missing, which blank was filled (fix) or documented
(evidence). Plus wall numbers (national / table / wins,
wave 4–5 reach, median survival) even if NOT OBSERVABLE
in a 30-day leg — never claimed as movement unless
measured.

## Metric review (mandatory section in every evidence file)

Judged ONLY against this preregistration. No mid-run
re-scoring: the denominator stays opportunity evenings
on the after leg; a thin denominator does not rescue or
sink anything beyond the minimum-n rule stated above.
If the metric proves wrong (e.g. the probe's first-
blockage order diverges from the engine's hop refusal
on a judged seed, or the before leg diverges from the
detour before-leg conditions), write it under "metric
review" and propose the revision for the NEXT run.
