# Loop B fleshout-20261102T1155Z round — scale-onramp: two-creek walls + wood gathering

Run: fleshout-20261102T1155Z, arm sim-creekwood-a, axis scale-onramp.
Worktree branch: sim-creekwood-a. POLICY / INSTRUMENT ONLY — zero
`src/js` changes. Sibling Loop A/B trees/branches NOT touched.
Tracker/claim/lock/rotation files NOT touched (coordinator's).

Prereg: evidence/2026-11-02/sim-creekwood-a-prereg.md (committed
BEFORE any judged sim; two pre-pool amendments, both before pooled
candidate runs: wood leg fires at bridge points only, not every
march day; bridge/advance ordering — bridge-if-closer, then
advance, then bridge-any-adjacent — after a discarded smoke run
bridged a useless sideways creek, see §Smoke run, discarded).
Policy: scripts/policies/creekwood.js. Unit proof:
scripts/test-creekwood-a.js (47/47 green). Driver:
scripts/creekwood-driver-20261102.js. Geometry screen:
scripts/creekwood-geometry-20261102.js. Per-seed records:
evidence/2026-11-02/perseed-creekwood-a/cw-{base,creekwood}-s<seed>.json
+ confirm-geometry-ledger.json (+ confirm-geometry-97690-97989.jsonl
raw lines).

## Verdict: PILOT GO (all three bars met; guardrail passes; wall-neutral)

- GO (primary): PASS. (1) Seed 97396 arrives under creekwood on
  day 91 via a bridge leg that actually fires in sim; (2) >= 1
  bridge is built in sim on the pilot band (97396, day 91);
  (3) the bridge leg fires on one seed (97396).
- Split (reported, not hidden): of the 8 reached, 6 are pure
  detours, 1 is bridge-assisted (97396), 1 is swimmer-assisted
  (97449). The GO does not depend on the swimmer seed.
- GUARDRAIL: PASS. Median end-gameDay 122.0 baseline ->
  119.0 candidate on identical pilot seeds, difference 3.0 days
  (bar: within 20). Village-lost count 4 baseline -> 4
  candidate (bar: <= baseline).
- WALL (reported, NOT re-scored into GO): national 2/8 baseline
  -> 2/8 candidate; table 5/8 -> 5/8; won 4/8 -> 4/8; wave-5
  1/8 -> 1/8 (97474, pre-existing under baseline). The seven
  non-97396 seeds are identical to baseline on every wall
  metric (days, deaths, national/table/won, endReason, call and
  attempt counts all match) — creekwood is a strict extension
  of creekdetour: it changes nothing where no bridge is needed.
- CONTACT: baseline 7 calls / 2 fights on the band (97474
  fought, 97599 fought; 97396's 25 attempts were raid/wander
  tile-shares with 0 calls) -> candidate 8 calls / 3 fights
  (97474, 97599 as before, plus 97396 FOUGHT day 93, HERALD
  SLAIN). The new contact is the whole point of this arm.
- CONFIRM: NOT RUN TO BAR — 0 cases banked (see §Confirm).
  The confirm bar (bridge-assisted arrival on >= 50% of
  12–16 two-creek-wall cases) is UNJUDGED, not failed: no
  candidate confirm runs were pooled because no seed met the
  case rule. The pilot GO stands regardless.

## The answer, in plain words

The village had the wood all along — it just never picked it up.
On every pilot seed the scholar marched with zero logs in his
pack while the village pile held between 834 and 2,162 logs.
On 97396 the pile held 1,527 logs on the first march day, and
the old policy still failed for lack of wood, because nobody
ever told the scholar to walk to the pile and take four logs.
The new policy does exactly that — two trips to the pile, eight
logs, two bridges — and on day 91 the scholar walks across the
first bridge, then the second, and stands on the monster's lair,
which is itself a creek. The call goes out, ten blades answer
by name, and two days later the herald falls with an ally at
the scholar's side. The village that could never even reach
the fight now wins the game. The other seven villages walk
exactly as they did before — the new policy touches nothing
where no bridge is needed.

## Before/after on identical seeds (DAYS=180, frozen stack, creekdetour vs creekwood)

Baseline = creekdetour arm (tribfloor leadfeast + windefer +
seatdrive + fullseat-diag + creekdetour march). Candidate =
same stack with creekwood march (walk-toward-then-bridge +
takeWood leg) and the same sound-the-call-once rule. Columns:
gameDays / national / table / won / maxWave / deaths / shares /
calls / attempts / first-arrival way + day. Wood/pile at first
march day are the new instrumentation (creekdetour's
metric-review requirement): wood 0 on all 8 seeds in BOTH arms
(the candidate's pre-leg value), piles as listed.

| seed | lair | baseline | candidate | wood/pile at first march |
|------|------|----------|-----------|--------------------------|
| 97396 | 6,4 | 113 / 1 / 1 / 1 / 4 / 33 / 8 / 0 / 25 | 101 / 1 / 1 / 1 / 4 / 37 / 2 / 1 / 1F — BRIDGE day 91, path (5,4)(6,4), 2 bridges, 8 logs from pile | 0 / 1527 |
| 97307 | 7,4 | 146 / 0 / 0 / 0 / 4 / 38 / 0 / 1 / 0 | 146 / 0 / 0 / 0 / 4 / 38 / 0 / 1 / 0 — detour day 130, identical | 0 / 1767 |
| 97422 | 7,4 | 131 / 0 / 0 / 0 / 4 / 43 / 3 / 1 / 12R | 131 / 0 / 0 / 0 / 4 / 43 / 3 / 1 / 12R — detour day 110, identical | 0 / 1625 |
| 97449 | 7,3 | 107 / 0 / 1 / 1 / 4 / 25 / 0 / 1 / 0 | 107 / 0 / 1 / 1 / 4 / 25 / 0 / 1 / 0 — SWIMMER day 96, identical | 0 / 2124 |
| 97474 | 7,4 | 146 / 0 / 1 / 1 / 5 / 43 / 2 / 1 / 1F | 146 / 0 / 1 / 1 / 5 / 43 / 2 / 1 / 1F — detour day 63, identical; HERALD SLAIN (as baseline) | 0 / 834 |
| 97489 | 8,4 | 92 / 0 / 1 / 1 / 4 / 33 / 0 / 1 / 0 | 92 / 0 / 1 / 1 / 4 / 33 / 0 / 1 / 0 — detour day 86, identical | 0 / 2162 |
| 97514 | 7,3 | 150 / 1 / 0 / 0 / 4 / 44 / 7 / 1 / 55R | 150 / 1 / 0 / 0 / 4 / 44 / 7 / 1 / 55R — detour day 133, identical | 0 / 1466 |
| 97599 | 7,4 | 89 / 0 / 1 / 0 / 4 / 34 / 3 / 1 / 2 | 89 / 0 / 1 / 0 / 4 / 34 / 3 / 1 / 2 — detour day 60, identical; FOUGHT day 61, LOST (as baseline) | 0 / 841 |

R = MUSTER-GATE refusals, F = FOUGHT. Wall totals, pilot 8:
national 2 -> 2; table 5 -> 5; won 4 -> 4; wave-5 1 -> 1.
Median end-day 122.0 -> 119.0 (guardrail pass, diff 3.0).
Village-lost 4 -> 4 (97307, 97422, 97514, 97599 both arms).
Calls 7 -> 8; fights 2 -> 3; slain 1 -> 2 (97474 as baseline,
97396 new).

## The 97396 arrival, step by step (what the record shows)

- Day 89 (first march day): the scholar starts away from home
  (2,3) and walks 6 hops to (6,3) — the advance leg carrying
  him as close as the open ground allows — then the march
  stops short of the lair (the record shows no refusal, no
  stuck flag, and no advances entry for this walk: the walk
  broke on the fight/turn-end check, an instrumentation wart
  noted here, not a routing defect — the scholar DID advance,
  and the next march re-plans from wherever he stands).
- Day 91 (from home (4,4)): no walkable path; adjacent creek
  (5,4) is strictly closer to the lair than the scholar, so
  the wood leg fires — takeWood, pile 1527 -> 1523, wood 0 ->
  4 — bridge (5,4); still no path (the lair itself is gated);
  no adjacent creek closer than the scholar remains, so the
  advance leg walks onto the just-built bridge (5,4); now
  adjacent creek (6,4) is strictly closer, so the wood leg
  fires again — pile 1523 -> 1519, wood 0 -> 4 — bridge (6,4);
  BFS path opens; the scholar steps onto the lair. Total:
  2 bridges, 8 logs, 2 hops of walked path, way recorded as
  'bridge'. The sideways creek at (4,3) is NOT bridged (the
  ordering fix; see §Smoke run, discarded).
- Day 91, the call: Emberhold 2 + Stonebridge 6 + Thornfield 2
  = 10 blades exactly, all named, all "trust holds".
- Day 93: "THE HERALD! Ella joins you!" then "THE HERALD
  FALLS. The realm exhales." — the first deliberate-titan kill
  on a seed that previously never even arrived. The run ends
  won/table/national at day 101 with 37 deaths (baseline 33).

## Smoke run, discarded (pre-pool diagnostic, NOT pooled)

A single-seed candidate run on 97396 with the as-written
bridge rule (bridge the closest-to-lair adjacent creek
whenever no path exists) ALSO arrived day 91, but bridged a
third, useless creek at (4,3) — a sideways creek adjacent to
home on no route to the lair — spending 12 logs, and its
aftermath diverged: fight day 91, LOST ("THE HERALD remains.
The coalition breaks and runs."), 12 MUSTER-GATE refusals,
village-lost at day 103 with 42 deaths. The post-fix pooled
run (2 bridges, 8 logs) fights day 93 and wins. The mechanism
of that divergence is NOT isolated — the likeliest lever is
the extra bridge's 96 ticks + 60 kcal shifting encounter
sampling, but that is a guess, not a finding, and the fix is
NOT claimed to have caused the win. What IS claimed: the
ordering fix removes a proven waste (4 logs + a bridge on a
tile the route never uses), proven by the unit test's sideways
case. The smoke result is disclosed here and counted nowhere.

## Legs answered from creekdetour's owed list

- Bridge-success in sim: ANSWERED YES. 97396 is a bridge
  success in sim (2 bridges, arrival, call, kill) — the leg
  creekdetour could only prove in unit tests now fires in a
  full run, with the wood leg as its enabler.
- Refusal-memory firing in sim: STILL UNFIRED. 0 refusals on
  all 8 candidate runs (same as creekdetour's pilot) — every
  BFS path was clean on first try. Refusal memory remains
  unit-proven only (surprise refusal -> re-plan, arrival
  preserved, test-creekwood-a case 6). A surprise-refusal
  seed is still owed before anyone claims that leg in play.
- Wood instrumentation in both arms: DONE (see table above).
  The headline finding is structural, not seed-specific:
  scholar wood is 0 at first march day on 8/8 seeds while
  piles run 834–2162. No seed in this band is wood-starved at
  the pile level; the binding constraint was the missing
  takeWood step, not wood scarcity. Whether ANY seed has an
  empty pile at march time is now a screening question for
  the confirm (pile is instrumented there too).

## Transcript read (march + call, judged for sense)

97396, days 89–93: "Scouts found its lair — tile 6,4. THE
HERALD — the sky, getting bigger. It is WAITING. You cannot
face it alone. Sound the call." -> "THE HERALD struck
Stonebridge in the night. They bled while the coalition
talked. (trust -5 — they notice who wasn't there.)" -> day
91, the bridge walk (silent, as in creekdetour — the walk
itself narrates nothing, not even "You lash logs together"
beyond the engine's buildBridge line, which the anchored
filter does not capture; the detour-walk narration blank
stands) -> "THE CALL GOES OUT" -> three villages answer by
name with named blades (10 total, trust holds) -> day 93,
"Ella joins you!" (an ally joining the fight is voiced, and
it matters — the fight is not solo) -> "THE HERALD FALLS.
The realm exhales." Judgement: coherent end to end — a
heard location, a priced delay (the night strike lands
BEFORE the call), a call with named answers at exactly the
10-blade gate, a fight with an ally present, a clean kill
line. Two voice notes, both the game's, not the policy's:
(a) the bridge walk itself says nothing about crossing two
creeks to reach a lair that IS a creek — the player who
just spent 8 logs deserves one line naming what was built
("You bridge the creek, cross it, and bridge the lair's own
creek"); (b) the day-89 advance stopping short at (6,3)
narrates nothing — nobody says why the scholar stopped one
tile short. Neither blocks the verdict; both are voice-queue
blanks.

## Villagers act like people? (sense-testing)

Sampled call answers are named and consequential (as in
creekdetour): villages answer with named marchers, trust
holds, and the one fight with an ally joining reads as
people showing up, not numbers arriving. Robotic residue,
unchanged from creekdetour and not this policy's doing:
(a) 55 identical MUSTER-GATE refusals on 97514 (the engine
repeats one arithmetic line instead of escalating,
deflecting, or going quiet); (b) the scholar camps the
lair tile for days after arrival with no spoken reason when
the muster is short. The new residue this arm adds is the
silent bridge walk (above) — honest movement, quiet
narration.

## Village assessment (plain words)

The village on 97396 looked like every other village in the
band at the start: fed, watered, connected to three friends,
sitting on a mountain of logs it never touched. What set it
apart was only the ground between it and the monster — two
creeks in a row, with the monster living on the second one.
Nobody died for lack of wood; nobody starved while the
bridges went up (37 deaths across the run against 33 when
the village never marched at all — four more deaths for a
kill, a call, and a win, which is a price the game already
charges for fighting). The scholar thrived because he
finally did the obvious thing: he took logs from his own
village's pile and built the two bridges the road needed.
Everyone else on the band lived or died exactly as before —
the new policy did not disturb a single detour village,
which is the right kind of boring for a fix. What is still
missing is not wood or road: it is a voice for the walk
itself, and a reason spoken aloud when a march stops one
tile short.

## Reachability verdict

- Two-creek wall (lair tile itself a creek): reachable —
  97396 arrives, calls, fights, kills (1/1 pilot seeds).
- Bridge-assisted arrival via takeWood: reachable — 1/1
  bridge-wall pilot seeds, 8 logs, pile-funded.
- A SLAIN herald via bridge routing: reachable — 1/1 (97396).
- Full seat / win via bridge routing: NOT demonstrated as a
  bridge effect beyond one seed — 97396 won/table/national
  under the candidate (baseline also won/table/national
  without arriving, so the win itself is not a bridge
  effect; the arrival, call, and kill are).
- Wave-5 unlock via bridge routing: NOT demonstrated (97474
  wave-5 pre-exists under baseline).

## Blanks filled / documented

FILLED (this arm, policy, committed):
- Walk-toward-then-bridge routing: bridge, advance onto the
  bridge, bridge again — a lair tile that is itself a creek
  becomes enterable. Commits: prereg 702a189d8 (+ amendments
  277fe1e25, 3292fd6a3), policy + proof 277fe1e25 (43/43) and
  3292fd6a3 (47/47), driver 3bdcad94.
- Wood leg via takeWood: the scholar takes logs from his own
  village's pile at a bridge point (up to 4 per call, until
  4 in hand or no gain). No new verb, no state edit outside
  engine verbs; cutTree deliberately not used (grove tile +
  micro-position + day-part costs make it un-drivable as a
  march-day leg — stated, not silently dropped).
- Wood instrumentation in both arms (creekdetour's owed
  metric): scholar wood 0 at first march day on 8/8 seeds,
  piles 834–2162 — the constraint was the missing takeWood
  step, not scarcity.
- Bridge-success in sim (creekdetour owed leg #3, half):
  97396 fires it in a full run.
DOCUMENTED (evidence, not built — next arms):
- (1) Refusal-memory sim (creekdetour owed leg #3, other
  half): 0 firings across both pilots; a surprise-refusal
  seed is still owed.
- (2) Confirm (12–16 two-creek-wall seeds): see §Confirm.
- (3) Bridge-walk narration: one line naming the built
  crossing(s) is owed to the voice queue.
- (4) Advance-stop narration: why a march stops one tile
  short (day-89 (6,3) case) is never spoken.
- (5) Smoke-vs-pooled fight divergence (day-91 loss vs
  day-93 win on the same arrival day): mechanism unisolated;
  do not cite either fight as the fix's effect.
- (6) Pile-empty seeds: none seen in this band; whether any
  seed has an empty pile at march time (the honest-failure
  case for the wood leg) is a screening question.

## Confirm (case rule stated BEFORE confirm sims are pooled)

Case rule (confirm): a seed is a two-creek-wall confirm case
iff its BASELINE (creekdetour-arm) record shows lair heard
AND >= 1 march AND 0 arrivals AND >= 1 bridgeBlocked march
day, AND a map-gen probe of the baseline record's lair tile
shows that tile is a needsBridge creek. Split reported
separately: two-creek series (the tile before the lair on
the home row is also a needsBridge creek) vs single-creek
lair (lair itself a creek, approach open). Confirm bar
(prereg): bridge-assisted arrival on >= 50% of confirm
cases, same guardrail (median end-day within 20d AND
village-lost <= baseline). Screening (as run, disclosed deviations from the plan):
fresh range 97690–97989 was TARGETED (300 seeds, past
creekdetour's screened range) but only PARTIALLY screened
— 59 seeds across the three sub-ranges — because map-gen
screening ran ~30s/seed under sibling load (single-seed
probe: 3.4s quiet) and the full 300 would have taken
~2.5h. The three parallel screen loops were stopped
deliberately for run bounds (no orphan processes left);
the remaining ~241 seeds in the range are UNSCREENED and
are the first work of the follow-up screening arm, with
the tool (scripts/creekwood-geometry-20261102.js) and the
partial ledger committed. Nomination was map-gen-only
(Tier 2C: NB creek at BOTH (5,4) and (6,4); Tier L:
(6,4) NB only; Tier M: (5,4) NB only); full baseline
(creekdetour-arm) runs on nominations in tier-priority
order (2C, then L, then M — disclosed deviation from
numeric order, justified: the confirm targets two-creek
walls and 2C is the only geometry that can yield them
with lair (6,4)). Pilot seeds are NEVER pooled into the
confirm. Mining note: among creekdetour's 70 existing
detour records, exactly ONE seed satisfies the baseline
half of the case rule (97396 itself) — fresh screening is
not optional, it is the only source of confirm cases.

CONFIRM RESULTS (final for this run):
- Screened: 59 fresh seeds (97690–97704, 97790–97808,
  97890–97898 approx., from the three partial sub-ranges;
  exact per-seed rows in confirm-geometry-ledger.json).
- Nominations: 10 — 2C: [97898]; L: [97690, 97701, 97793,
  97800, 97806, 97808]; M: [97795, 97807, 97894].
- Baseline full runs on all 10 (records cw-base-s<seed>.json
  in perseed-creekwood-a/): 7 NEVER LOCATED the herald
  (lair None, 0 marches: 97898, 97690, 97701, 97793, 97800,
  97795, 97894) and 3 ARRIVED (97806 swimmer 11/11,
  97808 detour 13/14, 97807 detour 1/1). BridgeBlocked
  days: 0 on all 10.
- Cases banked: 0. The case rule requires lair heard + 0
  arrivals + >= 1 bridgeBlocked day + lair tile a
  needsBridge creek; no nomination satisfies it.
- Confirm verdict: NOT RUN TO BAR (bar needs 12–16 cases;
  0 banked). No candidate confirm runs were pooled, and
  no confirm rate is claimed. This is a screening-yield
  finding, not a bridge failure: the pilot's bridge leg
  fired 1/1 on its wall seed, and the confirm simply has
  no seeds to judge it on yet.
- Yield lessons for the follow-up arm: (a) corridor-creek
  geometry does NOT predict a lair — 7/10 nominations
  never heard one, including the sole 2C seed (97898),
  whose double-creek corridor holds no lair at all; (b)
  observed lair-creek case yield is ~1 per 300+ screened
  seeds (97396 in creekdetour's 300; 0 in this run's 59),
  so banking 12 cases likely needs ~3,000+ seeds screened
  — a dedicated screening run, not a pilot-run side job;
  (c) a better nomination would need lair prediction,
  which map-gen alone cannot give (lair hearing depends on
  run dynamics, not just the board); the follow-up arm
  should screen wide and cheap before spending full runs,
  and should consider whether the confirm bar itself
  (12 two-creek walls) is the right shape for a
  one-in-hundreds wall type — that question goes under
  "metric review" for the NEXT run, it does not change
  this run's verdict.

## Balanced panel (§15 — limitation reported)

As in creekdetour, no panel compare .md is attached: the
panel runs named registry policies only and cannot express
the creekdetour/creekwood composition, so running it would
measure something else and present it as this arm. The
panel is the instrument and this prereg's thresholds are
the judge; the instrumented driver records (attached
per-seed JSON) are the measurement, and the wall metrics
above (national/table/wins/wave reach, median survival)
are reported from them.

## Metric review (for the NEXT run, not this verdict)

- The pilot GO bar (named seed + a fired bridge leg) fits a
  single-seed blank better than a breadth bar, and the
  wall-neutral result shows the extension costs nothing on
  detour seeds — but a single-seed GO must never be read as
  a general bridge claim; that is what the confirm is for,
  and the confirm's case scarcity (1/70 in existing records)
  suggests the general claim may stay thin for a long time.
- The guardrail's village-lost clause passed at equality
  (4 = 4) while 97396 itself flipped from the smoke run's
  village-lost to the pooled run's win — a reminder that
  single-seed fight outcomes after arrival are chaotic
  downstream of tick/kcal shifts, and the guardrail should
  be read as a band property, never as a per-seed promise.
- Wood-at-first-march-day (daily-pre) measures the scholar's
  pack before ANY same-day action, which is the right
  pre-leg value for the candidate — but it does not measure
  wood at the bridge point itself (base-policy actions
  earlier in the daily could in principle change it); the
  march record's own woodLeg entries are the bridge-point
  truth and agree here (0 before each take).
- The day-89 advance record (walked path with no advances
  entry, no stuck flag) shows the march record needs a
  "cut short by" field: when a walk breaks on the
  fight/turn-end check, the record should say so instead of
  looking like a clean stop. Instrument work for the next
  arm, not a verdict change here.

## Commits (worktree branch sim-creekwood-a; coordinator merges --ff-only)

- 702a189d8 — prereg (before any judged sim).
- 277fe1e25 — prereg wood-leg trigger amendment + creekwood
  policy + proof 43/43.
- 3bdcad94 — instrumented before/after driver.
- 3292fd6a3 — bridge-order fix + sideways proof case (47/47)
  + prereg amendment 2.
- d23a6942 — evidence draft (pilot GO) + geometry screen
  script + pilot per-seed records (16 files).
- (Evidence final + geometry ledger + confirm baseline
  records: this file's commit.)

Report: ready to merge locally, pending ship. Do NOT push,
do NOT bump versions, do NOT verify live (ship loop owns
deploys).
No [needs-eyes] (no feel/combat/UI change; policy and
instrument only — the bridge-walk narration blank is a
voice-queue note, not a change in this arm).
