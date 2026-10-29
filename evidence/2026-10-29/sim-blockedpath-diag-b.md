# sim-blockedpath-diag-b — the 115 refused hops, decomposed (MEASUREMENT ONLY)

Run: oversight-flesh-out-loop-b arm sim-blockedpath-diag-b, worktree
sim-blockedpath-b. Zero src/js changes, zero policy changes, zero
default flips. The deliverable is a classification + a designed next
lever, not a game change.

Source population: the nighttravel verdict adoption
(evidence/2026-10-29/sim-nighttravel-verdict-adopt-b.md, commit
db622ad66), pooled 36-seed policy leg: 176 away evenings = 22 within
reach (19 converted) + 115 haven-offered but hop-refused on a blockage
+ 20 too far to be offered + 19 combat/tent. This arm owns the 115.
Canon read first: docs/CANON.md, then docs/MAP.md §6 (the way home)
and the travel/blockage code itself. No canon doc covers evening-hop
refusals specifically; the engine comments in src/js/game.js are the
authority cited below, not invented canon.

## Pre-registered-style verdict section (written BEFORE judging)

DIAG-GO bar: 115/115 refused evenings classified by blockage type,
AND every type's clearability answered (clearable / route-around-able
/ stuck) with at least one trace per type. A type with no trace, or
any refused evening left unclassified, is DIAG-NO-GO. The bar judges
the decomposition only — it does not judge whether a future lever
will work, and no lever is built or scored here.

## Verdict: DIAG-GO

- Classification: 115/115 refused evenings classified by type, tile,
  geometry, seed, and day (replay file + appendix table below).
- Clearability: answered for all four types, each with a live-engine
  trace (proof test T9) and an evening-state probe trace (replay):
  rubble clearable, fallen_tree clearable, washed_out clearable /
  scrambable, creek NOT hand-clearable (bridge or swim only).
- Route-around: 115/115 route-around-able under Arm B's detour logic
  (orthogonal BFS over travelBlockage-clean steps) — so ZERO of the
  115 is stuck with no lawful in-fiction remedy. The stuck-ness is
  policy-side, not world-side: the evening hop tries exactly one
  direct hop and never detours, and the day's bot never clears the
  homeward blockage.
- 10752 disagreement mechanism: determined (different tile, not a
  stale flag, not a second blockage on the same tile) — see §4.
- Proof: `node scripts/test-blockedpath-diag-b.js` → PROOF-GREEN
  (T1–T9, first run, no failures).

## 1. Classification: the 115 by blockage type

| Blockage type | Evenings | Share | Seeds | Consecutive-day episodes | Distinct blocked sites |
|---|---|---|---|---|---|
| washed_out | 41 | 35.7% | 5 | 9 | 7 |
| fallen_tree | 33 | 28.7% | 7 | 7 | 7 |
| rubble | 24 | 20.9% | 3 | 5 | 4 |
| creek | 17 | 14.8% | 4 | 4 | 4 |
| Total | 115 | 100% | 18 distinct overall (per-type counts overlap on seed 11031, which has both washed_out and rubble evenings) | 25 | 22 |

Counts cross-check: corpus partition (verdict adoption) 41/33/24/17
reproduces exactly; replay reproduces all 115 (seed, loop-day, kind)
with zero mismatches (T1, T3). Refusal integrity holds on all 115:
arrival == departure, 0 kcal hop cost, ticks unchanged (T2) — these
are verified refusals, not failed moves.

The population is recurrent, not diffuse: 22 distinct blocked sites
produce all 115 evenings, and 25 consecutive-day episodes (mean 4.6
evenings) mean a villager typically spends most of a week refused by
the SAME tile. The blocked tiles cluster on the haven ring: (3,4),
(4,3), (5,4) dominate, with (4,5), (4,2), (3,3) behind — the hop home
is refused by the tile right next to home, night after night.

### Geometry: destination vs intermediate, and which intermediate

The corpus stored only hopReturnKind, not the blocked tile, so this
arm replayed the pooled leg (truncated to each refused seed's last
refused day — 347 days vs 1080, prefix-identical by determinism)
with a travelTo wrapper recording the engine's own returned block
{x, y} plus the shared creekpath probe (destination-first, then
shortest-path intermediates, mirrored from travelTo). Wrapper and
probe agree on the blocked tile on 115/115 evenings (T7).

| Geometry | Evenings | Meaning |
|---|---|---|
| destination-leg (haven tile itself blocked) | 0 | The haven tile (4,4) never blocks. |
| intermediate-leg, destination-adjacent (blocked tile 1 step from haven) | 99 | Includes every distance-2 evening (its one intermediate layer touches haven) plus the far layer of distance-3 evenings. |
| intermediate-leg, departure-side (blocked tile 2 steps from haven, distance-3 evenings only) | 16 | The near layer of a 3-step hop. |
| Total intermediate-leg | 115 | No refused hop was ever stopped AT home — always on the way. |

By hop distance: distance 2 → 76 evenings, distance 3 → 39. By
type × geometry: washed_out 41/41 destination-adjacent; fallen_tree
25 adjacent / 8 departure-side; rubble 19 / 5; creek 14 / 3.
Per-episode table (departure → blocked tile → day range):

| Seed | Departure | Blockage | Blocked tile | Days (loop) | Evenings |
|---|---|---|---|---|---|
| 11031 | (3,3) forest_floor | washed_out | (3,4) | 4–10 | 7 |
| 11031 | (3,3) forest_floor | washed_out | (3,4) | 16–19 | 4 |
| 11031 | (4,2) trail_edge | washed_out | (4,3) | 24 | 1 |
| 11031 | (5,2) forest_floor | rubble | (4,2) | 25–29 | 5 |
| 11077 | (3,3) creek | creek | (4,3) | 4–10 | 7 |
| 11112 | (3,3) forest_floor | fallen_tree | (3,4) | 18–22 | 5 |
| 11133 | (5,5) forest_floor | fallen_tree | (4,5) | 16 | 1 |
| 11149 | (5,3) meadow | rubble | (5,4) | 4–10 | 7 |
| 11149 | (5,3) meadow | rubble | (5,4) | 13–21 | 9 |
| 11149 | (5,2) trail_edge | rubble | (5,4) | 29–30 | 2 |
| 11208 | (3,3) forest_floor | washed_out | (4,3) | 29–30 | 2 |
| 11246 | (3,2) wetland | creek | (3,3) | 8–10 | 3 |
| 11251 | (5,3) meadow | fallen_tree | (5,4) | 11–12 | 2 |
| 11273 | (3,2) creek | creek | (4,3) | 25–26 | 2 |
| 11299 | (3,6) wetland | fallen_tree | (4,5) | 11–16 | 6 |
| 11349 | (2,4) trail_edge | rubble | (3,4) | 23 | 1 |
| 11360 | (4,2) forest_floor | fallen_tree | (4,3) | 8–15 | 8 |
| 11365 | (3,3) creek | fallen_tree | (4,3) | 14–16 | 3 |
| 11384 | (3,2) creek | fallen_tree | (4,2) | 8–15 | 8 |
| 11390 | (4,2) grove | washed_out | (4,3) | 14–16 | 3 |
| 11390 | (4,2) grove | washed_out | (4,3) | 22–28 | 7 |
| 11408 | (7,4) forest_floor | washed_out | (5,4) | 19–25 | 7 |
| 11435 | (5,3) creek | creek | (5,4) | 5–9 | 5 |
| 11439 | (2,3) trail_edge | washed_out | (3,4) | 4–9 | 6 |
| 11439 | (2,4) wetland | washed_out | (3,4) | 12–15 | 4 |

The full per-evening list (seed, loop-day, departure, blocked tile,
route-around length) is the appendix table at the end of this file,
generated from the replay JSON — no evening is summarized away.

## 2. Clearability per type (code + traces, not guesses)

Engine authority: `Game.clearBlockage(x, y)` and `Game.buildBridge`
(src/js/game.js, "clear a blockage by work" block, ~line 11879), and
`Game.travelBlockage` (side-guard: a blockage guards its approach
side only). Proof test T9 exercises each branch live on synthetic
tiles in a throwaway harness game. "Day's own play" below means the
competent bot as it actually played these seeds — its only
clearBlockage caller is `clearRubbleForStone` (scripts/policies/
competent.js), which clears RUBBLE only, for stone, with no homeward
preference (nearest rubble in travel reach, ties by travelTargets
order). No bot code path clears fallen trees, scrambles washed-out
gaps, or builds bridges.

| Type | Engine-clearable? | Cost / remedy | Day's own play offers it? | Route-around-able (Arm B detour logic)? | Stuck? |
|---|---|---|---|---|---|
| rubble (24) | YES — clearBlockage deletes blockFrom, 40 kcal, 1 chunk (32 ticks), +1–3 stone (T9: 1000→960 kcal, blockFrom gone) | 40 kcal + a day-part | Sometimes, for stone — never aimed homeward. In these 115, the bot never cleared the hop's rubble before evening (else no refusal). | YES — 24/24, BFS path length 2–4 | NO |
| fallen_tree (33) | YES — clearBlockage deletes blockFrom, 60 kcal, +2 wood, 1 chunk (T9: 1000→940 kcal, blockFrom gone) | 60 kcal + a day-part | NO — no bot caller clears trees; a human could via the blockage card | YES — 33/33, path length 2–4 | NO |
| washed_out (41) | YES — with ≥4 wood, buildBridge (4 wood, 96 ticks, 60 kcal, permanent, stores bridgeFrom); WITHOUT wood, scramble: 80 kcal, "passable, barely", blockFrom deleted (T9: 1000→920 kcal, blockFrom gone) | 80 kcal scramble, or 4-wood bridge | NO — no bot caller | YES — 41/41, path length 2–5 | NO |
| creek (17) | NO by hand — clearBlockage refuses explicitly: "you can't clear it with your hands. Bridge it (4 wood) or swim it." (T9: returns false, needsBridge intact) | Bridge (4 wood, 96 ticks, 60 kcal) or swimmer ability | NO — no bot caller builds bridges; swimmer absent on all 17 evenings | YES — 17/17, path length 2–3 | NO |

Evening-state feasibility (the probe's crossingFix at each refused
evening, T6): non-creek crossing-fixes feasible 98/98; creek fixes
feasible 0/17 — wood carried was 0 on ALL 115 evenings and swimmer
was false on all 17 creek evenings, so no evening could have bridged
anything that night even if the policy had tried. Affordability
cuts the other way for clearing: evening kcal was 0 on several
stranded evenings per type (washed_out 6/41 below 80 kcal, fallen
_tree 17/33 below 60, rubble 4/24 below 40, creek 7/17 below 80) —
a clearing lever that charges kcal at evening fails exactly the
villagers it is meant to rescue. Route-around steps, by contrast,
are node travel: free in kcal by engine law (docs/MAP.md §6 walk-home
cost rule; nighttravel policy header), which is why the detour is
the affordable remedy and clearing is not.

Arm B's detour logic, precisely: `routeAround` in
scripts/policies/competent.js (BFS over orthogonal steps, each step
travelBlockage-clean from its origin, then walkTo re-attempts
homeward) gated by COMPETENT_TRIPHOME_ROUTE_AROUND for trip return
legs (landed 927de35c2, creekpath Arm B). The probe's bfsRouteAround
(scripts/creekpath-probe-b.js) mirrors it. All 115 evening states
have such a path — but note the scope limit: Arm B's gate fires on
trip return legs during the day, NOT on the evening hop. The
nighttravel evening hop does one travelTo, no detour, by design
(scripts/policies/nighttravel.js: "ONE honest hop, no force, no
route-around, no blockage clearing"). That design choice, not the
world, is what strands these 115 evenings. A detour at evening is
a NEW lever, not Arm B re-applied — Arm B already fires where it
fires, and these evenings are the ones it never reaches because
the day simply ends away.

## 3. Sense-testing: does the refusal read honestly? (one full evening per type)

Judged from the pooled-36 eveningSayTail transcripts (last 30 say
lines of each day, day play + evening hop). Verdict per line: the
refusal names the block honestly. Verdict per evening: the SEQUENCE
misleads by omission — no line ever names the tile, no line ever
names the way around, and no line marks the night itself.

- washed_out (seed 11031 day 4, forest_floor (3,3) → blocked (3,4)):
  the tail ends "The path is washed out." twice — once for a daytime
  travel attempt, once for the evening hop — then sleep, unmarked.
  Honest about the block; silent about the detour (a 2-step path
  via (4,3) existed that evening) and silent about bedding down
  away. A player reading this knows WHY they stayed out, not that
  they had a way home.
- rubble (seed 11031 day 25, (5,2) → blocked (4,2)): ends "Rubble
  chokes the path." twice, same shape. Honest, same omissions.
- creek (seed 11077 day 4, creek (3,3) → blocked (4,3)): "The creek
  runs fast here — no crossing without a bridge or a swim." three
  times (day attempts + evening hop). The remedies it names are
  ones the villager cannot take that night (0 wood carried, no
  swimmer) — while the remedy they COULD take, going around via
  (3,4) (2-step path, existed), is never mentioned. This is the
  sharpest honesty gap in the set: the game lists unusable options
  and omits the usable one.
- fallen_tree (seed 11112 day 18, (3,3) → blocked (3,4)): the day
  itself contains "You clear the rubble, stone by stone. The path
  is clear." / "You pocket 2 good throwing stones." mid-day, then
  ends "A fallen tree blocks the path." at evening. Read in
  sequence, a player reasonably concludes "I cleared the path" and
  is then refused with no word that the tree is a DIFFERENT
  obstacle on a different tile. Per-line honest; in-sequence
  misleading — the same unnamed-tile omission as §4, live in the
  verdict corpus itself, not just in 10752.

No transcript read robotic: days forage, learn counters, gossip,
meet strangers ("You see smoke on the horizon. Thornfield — 7
people…"). The robotic-feeling beat is the absence: refused
evenings end on a refusal line with no night line, and detours
(Arm C's transcript) arrive as a plain "Travel 3 tiles to Haven."
with no "going around" narration. Both are narration blanks, not
verdict changers for this measurement.

## 4. Sub-diag: the 10752 trip-clearance vs hop-refusal disagreement — DETERMINED

Question (creekpath Arm C evidence, seed 10752 day 12): the day's
trip says "You clear the rubble, stone by stone. The path is
clear." and the hop home is still refused afterwards. Stale flag?
Different tile? Second blockage?

Answer: DIFFERENT TILE. Trace (scripts/blockedpath-10752-replay-b.js,
before-leg substrate, days 1–14; the after-leg substrate replay
reproduces the identical day-12 daytime because the standing-home
code was reverted with Arm C's kill — current competent.js contains
zero STANDING_HOME references, so the "after" replay is a control
showing the daytime clear precedes any evening rescue):

- Day 12's ONLY clearBlockage call: tile (1,3), blockFrom
  {dx: 0, dy: 1, type: rubble}, player standing at (1,4) — the
  approach origin for (1,3). Returned true; the (1,3) rubble is
  genuinely gone.
- The hop's blockage that evening: rubble at (2,4), leg
  intermediate (corridor snapshot + evening probes days 12–14 all
  agree; Arm C before-pilot corpus row day 12: block rubble (2,4),
  route length 5 via (1,5)–(4,5)). The (2,4) blockFrom
  {dx: -1, dy: 0, type: rubble} is present on EVERY day 1–14 — never
  cleared, never stale, never regenerated: it simply was never the
  tile the trip cleared.
- Why (1,3) and not (2,4)? clearRubbleForStone takes the nearest
  rubble in travel reach; from (1,4) both (1,3) and (2,4) are
  distance 1, and travelTargets order puts (1,3) first. The stone
  run has no homeward preference — it clears the first rubble it
  finds, not the rubble on the way home.
- Not a stale flag: a stale flag would show (2,4) blockFrom deleted
  with the hop still refusing; the replay shows blockFrom present
  at every evening. Not a second blockage on the same tile: (2,4)
  carries exactly one blockFrom, and the probe returns it as the
  first (only) blockage. The game never names tiles in either line
  ("You clear the rubble…" / "Rubble chokes the path."), so the
  disagreement is a narration omission, not an engine contradiction.

Implication for lever design: a daytime clearing habit must aim
HOMEWARD (clear the hop's blocked tile, or the first blockage on
the homeward path), not nearest-rubble — otherwise it reproduces
10752 exactly: a cleared tile, a clear line, and a still-refused
evening.

## 5. Designed next lever (NOT BUILT): the evening detour

Lever: nighttravel-evening-detour (policy-side only, no src/js, no
default flip). On a travel-refused evening (haven offered, hop
refused, not in combat, not in a tent), walk the BFS route-around
path home — orthogonal travelTo steps, each travelBlockage-clean,
exactly Arm B's routeAround mechanics — then run the insideevening
entry leg unchanged. No clearing, no force, no bridge-building, no
new UI: the steps are the same steps a human tapping "Go around"
would take. If any detour step refuses or a combat starts
mid-detour, stop honestly where you stand, sleep away, and count
the evening NOT rescued (the guard below counts it, the narration
says why). If the detour reaches haven, the lodge walk bills as
today's converted evenings already bill.

Why this lever and not clearing: (a) 115/115 route-around-able vs
clearing that charges 40–80 kcal to villagers who often hold 0 at
evening; (b) clearing at evening would need a new evening work
action (clearing costs a day-part — the evening has no day-part
left to spend), while detour steps are free node travel; (c) the
detour is the policy the game already offers humans via "Go
around" — the bot is the only actor not using it at evening.

Draft prereg (for the NEXT run's prereg file, not scored here):
- Primary metric: refused-evening rescue rate = evenings ending
  inside at haven (morning position inside + haven tile) among
  refused evenings (haven offered, hop refused) on refused-prone
  seeds. GO bar: rescue rate ≥ 0.50 with minimum-n 8 refused
  evenings (same bar shape as the nighttravel verdict's M1r).
- Horizon: 30 days, same as the verdict leg (death-aware tail:
  dead villages stop, +10d tail max). Seeds: pilot 8 of the 18
  refused seeds from this decomposition (declared screen: seeds
  with ≥1 refused evening in the verdict corpus — an enrichment,
  quoted with its scope exactly as the verdict bank's away-prone
  enrichment was); confirm 12–16 seeds (the remaining refused
  seeds + fresh refused-prone seeds from a new scan) only if the
  pilot passes all guards.
- Guards (all must hold): G1 median survival ≥ control − 2 days;
  G2 starvation-cause deaths ≤ control + 2; G3 honesty,
  zero-tolerance: 0 detour evenings landing off-haven, 0 detour
  steps that teleport (every step a travelTo, position change
  only via engine), 0 detour evenings that enter combat and then
  claim inside, 0 still-refused evenings with arrival ≠ departure.
- Secondary: refused-evening streak length (mean/max) before vs
  after; detour path lengths actually walked; encounter rate on
  detour steps (a detour that walks into a fight every night is a
  different lever's problem — report it, don't hide it).
- Kill rule: pilot rescue rate < 0.50 with n ≥ 8, or any G3
  violation, kills the lever at pilot — no confirm spend, no
  re-score against cleared-evenings or any friendlier metric.
- Alternative lever, sketched not preregistered: homeward clearing
  habit — during the day, when the day's position is away and the
  homeward hop is blocked, clear THAT tile (not nearest rubble)
  if kcal affords the cost with a floor (never below 200 kcal
  after clearing, so the villager doesn't clear themselves into
  starvation). It scores on the same refused-evening rescue rate
  but pays kcal and a day-part, so it should be judged separately
  and never pooled with the detour.

## 6. Village assessment (plain words)

Thirty days in, these 18 villages look like the verdict run's
villages: alive, thin, and repeatedly sleeping one tile from home.
The refused villager is not lost in the wild — they are camped on
the haven ring, foraging the same groves, meeting the same
neighbors, clearing the wrong rubble for stone, and ending each
day on a refusal line. Nothing about these evenings reads like
chosen camping: the player never chooses to stay out, the game
never offers the way around at night, and the morning simply
starts again from the same tile. The blank this arm fills is the
map of that trap: 22 tiles, 25 episodes, every one walkable
around. The blank it documents but does not fill is the evening
itself — the detour in §5, or the homeward clearing habit, either
of which must be pre-registered separately and measured before it
lands.

## Wall numbers (every run)

National / table / wins: NOT OBSERVABLE in 30-day position traces
(no field) — reported, not claimed. Wave 4–5 unlocks: 0 in the
verdict leg (max wave 3 on 1/36 seeds); this decomposition adds no
new horizon and claims no movement. Median survival: 30 days both
verdict legs; this arm replays a subset and claims no survival
number of its own.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The hop scan (travelTo) walks DIAGONAL shortest paths while the
  detour BFS walks ORTHOGONAL steps: a future seed could in
  principle have a diagonal-only passage (blocked orthogonals,
  open diagonal) where the hop succeeds but no orthogonal detour
  exists, or vice versa. The 115 all had orthogonal paths, so the
  detour lever's pilot is fairly judged by the BFS — but the next
  run's prereg should state the BFS as the judge explicitly, not
  assume hop-path == detour-path.
- The refused-seed screen proposed in §5 is outcome-enriched
  (seeds chosen because the verdict corpus refused on them). Its
  rescue rate must be quoted as "among refused evenings on
  refused-prone seeds," never as a blind-band rate — the same
  quoting discipline the verdict run's metric review demands for
  M1r. A blind-band confirm (fresh scan, no outcome screen) is
  the honest follow-up if the pilot passes.
- Truncated replay is prefix-identical only because the harness
  is deterministic and no system looks ahead; the test (T3)
  verifies the prefix claim empirically (115/115 match), so the
  truncation is a verified shortcut, not an assumption. Any future
  replay that changes the policy or the harness must re-verify
  T3 from scratch, not inherit it.
- Evening kcal in the corpus is the pre-step snapshot; clearing
  affordability at evening is therefore judged on that snapshot,
  but clearing is a daytime action — the honest affordability
  question for a clearing habit is mid-day kcal, which this arm
  did not measure. The §5 alternative lever must measure mid-day
  kcal at clearing time; this arm's evening-kcal figures argue
  against EVENING clearing only.
- The "115" itself must stay quoted with its scope: refused hops
  among away evenings on away-prone seeds in a 30-day leg. It is
  not a population rate for the game at large.

## Evidence files

- This file: evidence/2026-10-29/sim-blockedpath-diag-b.md
- Replay (115 refused evenings + travelTo call log):
  evidence/2026-10-29/sim-blockedpath-diag-b-replay.json
- 10752 traces (before + after substrates):
  evidence/2026-10-29/sim-blockedpath-diag-b-10752-before.json,
  evidence/2026-10-29/sim-blockedpath-diag-b-10752-after.json
  (after-substrate note: standing-home code was reverted with Arm
  C's kill, so the after replay duplicates the before daytime —
  see §4; it is kept as the control, not as a rescue proof)
- Instruments: scripts/blockedpath-replay-trunc-b.js,
  scripts/blockedpath-10752-replay-b.js
- Proof: scripts/test-blockedpath-diag-b.js (T1–T9 PROOF-GREEN)
- Sources classified: pooled-36 verdict corpus
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-pooled36-nighttravel/
  (36 files), verdict evidence
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b.md, creekpath
  Arm C evidence + before-pilot corpus
  (evidence/2026-10-29/sim-creekpath-armc-adopt-b.md,
  sim-creekpath-armc-b-corpus-before-pilot/)

## Appendix — all 115 refused evenings (from the replay JSON)

Columns: seed, loop-day, departure tile (map), blockage type,
blocked tile, route-around path length (BFS steps home; all exist).
| Seed | Day | Departure | Blockage | Blocked tile | Route len |
|---|---|---|---|---|---|
| 11031 | 4 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 5 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 6 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 7 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 8 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 9 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 10 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 16 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 17 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 18 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 19 | 3,3 (forest_floor) | washed_out | (3,4) intermediate | 2 |
| 11031 | 24 | 4,2 (trail_edge) | washed_out | (4,3) intermediate | 4 |
| 11031 | 25 | 5,2 (forest_floor) | rubble | (4,2) intermediate | 3 |
| 11031 | 26 | 5,2 (forest_floor) | rubble | (4,2) intermediate | 3 |
| 11031 | 27 | 5,2 (forest_floor) | rubble | (4,2) intermediate | 3 |
| 11031 | 28 | 5,2 (forest_floor) | rubble | (4,2) intermediate | 3 |
| 11031 | 29 | 5,2 (forest_floor) | rubble | (4,2) intermediate | 3 |
| 11077 | 4 | 3,3 (creek) | creek | (4,3) intermediate | 2 |
| 11077 | 5 | 3,3 (creek) | creek | (4,3) intermediate | 2 |
| 11077 | 6 | 3,3 (creek) | creek | (4,3) intermediate | 2 |
| 11077 | 7 | 3,3 (creek) | creek | (4,3) intermediate | 2 |
| 11077 | 8 | 3,3 (creek) | creek | (4,3) intermediate | 2 |
| 11077 | 9 | 3,3 (creek) | creek | (4,3) intermediate | 2 |
| 11077 | 10 | 3,3 (creek) | creek | (4,3) intermediate | 2 |
| 11112 | 18 | 3,3 (forest_floor) | fallen_tree | (3,4) intermediate | 2 |
| 11112 | 19 | 3,3 (forest_floor) | fallen_tree | (3,4) intermediate | 2 |
| 11112 | 20 | 3,3 (forest_floor) | fallen_tree | (3,4) intermediate | 2 |
| 11112 | 21 | 3,3 (forest_floor) | fallen_tree | (3,4) intermediate | 2 |
| 11112 | 22 | 3,3 (forest_floor) | fallen_tree | (3,4) intermediate | 2 |
| 11133 | 16 | 5,5 (forest_floor) | fallen_tree | (4,5) intermediate | 2 |
| 11149 | 4 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 5 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 6 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 7 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 8 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 9 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 10 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 13 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 14 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 15 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 16 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 17 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 18 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 19 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 20 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 21 | 5,3 (meadow) | rubble | (5,4) intermediate | 2 |
| 11149 | 29 | 5,2 (trail_edge) | rubble | (5,4) intermediate | 3 |
| 11149 | 30 | 5,2 (trail_edge) | rubble | (5,4) intermediate | 3 |
| 11208 | 29 | 3,3 (forest_floor) | washed_out | (4,3) intermediate | 2 |
| 11208 | 30 | 3,3 (forest_floor) | washed_out | (4,3) intermediate | 2 |
| 11246 | 8 | 3,2 (wetland) | creek | (3,3) intermediate | 3 |
| 11246 | 9 | 3,2 (wetland) | creek | (3,3) intermediate | 3 |
| 11246 | 10 | 3,2 (wetland) | creek | (3,3) intermediate | 3 |
| 11251 | 11 | 5,3 (meadow) | fallen_tree | (5,4) intermediate | 2 |
| 11251 | 12 | 5,3 (meadow) | fallen_tree | (5,4) intermediate | 2 |
| 11273 | 25 | 3,2 (creek) | creek | (4,3) intermediate | 3 |
| 11273 | 26 | 3,2 (creek) | creek | (4,3) intermediate | 3 |
| 11299 | 11 | 3,6 (wetland) | fallen_tree | (4,5) intermediate | 3 |
| 11299 | 12 | 3,6 (wetland) | fallen_tree | (4,5) intermediate | 3 |
| 11299 | 13 | 3,6 (wetland) | fallen_tree | (4,5) intermediate | 3 |
| 11299 | 14 | 3,6 (wetland) | fallen_tree | (4,5) intermediate | 3 |
| 11299 | 15 | 3,6 (wetland) | fallen_tree | (4,5) intermediate | 3 |
| 11299 | 16 | 3,6 (wetland) | fallen_tree | (4,5) intermediate | 3 |
| 11349 | 23 | 2,4 (trail_edge) | rubble | (3,4) intermediate | 4 |
| 11360 | 8 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11360 | 9 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11360 | 10 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11360 | 11 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11360 | 12 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11360 | 13 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11360 | 14 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11360 | 15 | 4,2 (forest_floor) | fallen_tree | (4,3) intermediate | 4 |
| 11365 | 14 | 3,3 (creek) | fallen_tree | (4,3) intermediate | 2 |
| 11365 | 15 | 3,3 (creek) | fallen_tree | (4,3) intermediate | 2 |
| 11365 | 16 | 3,3 (creek) | fallen_tree | (4,3) intermediate | 2 |
| 11384 | 8 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11384 | 9 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11384 | 10 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11384 | 11 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11384 | 12 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11384 | 13 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11384 | 14 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11384 | 15 | 3,2 (creek) | fallen_tree | (4,2) intermediate | 3 |
| 11390 | 14 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 15 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 16 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 22 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 23 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 24 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 25 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 26 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 27 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11390 | 28 | 4,2 (grove) | washed_out | (4,3) intermediate | 4 |
| 11408 | 19 | 7,4 (forest_floor) | washed_out | (5,4) intermediate | 5 |
| 11408 | 20 | 7,4 (forest_floor) | washed_out | (5,4) intermediate | 5 |
| 11408 | 21 | 7,4 (forest_floor) | washed_out | (5,4) intermediate | 5 |
| 11408 | 22 | 7,4 (forest_floor) | washed_out | (5,4) intermediate | 5 |
| 11408 | 23 | 7,4 (forest_floor) | washed_out | (5,4) intermediate | 5 |
| 11408 | 24 | 7,4 (forest_floor) | washed_out | (5,4) intermediate | 5 |
| 11408 | 25 | 7,4 (forest_floor) | washed_out | (5,4) intermediate | 5 |
| 11435 | 5 | 5,3 (creek) | creek | (5,4) intermediate | 2 |
| 11435 | 6 | 5,3 (creek) | creek | (5,4) intermediate | 2 |
| 11435 | 7 | 5,3 (creek) | creek | (5,4) intermediate | 2 |
| 11435 | 8 | 5,3 (creek) | creek | (5,4) intermediate | 2 |
| 11435 | 9 | 5,3 (creek) | creek | (5,4) intermediate | 2 |
| 11439 | 4 | 2,3 (trail_edge) | washed_out | (3,4) intermediate | 3 |
| 11439 | 5 | 2,3 (trail_edge) | washed_out | (3,4) intermediate | 3 |
| 11439 | 6 | 2,3 (trail_edge) | washed_out | (3,4) intermediate | 3 |
| 11439 | 7 | 2,3 (trail_edge) | washed_out | (3,4) intermediate | 3 |
| 11439 | 8 | 2,3 (trail_edge) | washed_out | (3,4) intermediate | 3 |
| 11439 | 9 | 2,3 (trail_edge) | washed_out | (3,4) intermediate | 3 |
| 11439 | 12 | 2,4 (wetland) | washed_out | (3,4) intermediate | 4 |
| 11439 | 13 | 2,4 (wetland) | washed_out | (3,4) intermediate | 4 |
| 11439 | 14 | 2,4 (wetland) | washed_out | (3,4) intermediate | 4 |
| 11439 | 15 | 2,4 (wetland) | washed_out | (3,4) intermediate | 4 |
