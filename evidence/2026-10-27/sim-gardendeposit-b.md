# sim-gardendeposit-b — where garden-attributed deposits come from (DIAG ONLY)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1730Z, axis
food-economy. Arm sim-gardendeposit-b, carried blank from 2026-10-26
(sim-stock9762-b out-of-arm observation): all 129 Lamb's Quarters
deposits on seed 9762 carry gardenShares, yet garden harvest is zero
on every seed (ripe 0 throughout) and the player keeps sowing Lamb's
Quarters in beds while the pantry's Lamb's Quarters arrives as
deposits. Question: where do garden-attributed deposits come from if
plots never ripen?

Pre-registration (committed BEFORE any trace judgment):
evidence/2026-10-27/sim-gardendeposit-b-prereg.md, commit 1d7218107.
Judged ONLY against it. Measurement only: zero src/js changes, no
default flips, no throttle or garden redesign.

Canon read first: docs/CANON.md, then docs/GARDENS.md. Nothing invented.

## Verdict against the prereg: GO (with one disclosed caveat)

| leg | bar | result |
|-----|-----|--------|
| (a) Re-derivation, 100% classified | traced set reproduced from corpus, unclassified == 0 | 129 records, 396,750 kcal, unclassified 0 ✓ |
| (b) Door completeness | every door named with counts; absent doors named as zero with evidence | deposit 129 / stock 0 / pantryAdd 0, each evidenced ✓ |
| (c) Origin-step naming | for the >= 5% cell (the only cell: 100%), shares-creating function + pantry mover named with file/function, timing checked | harvestGarden + donateToPantry/donateHaul, timing consistent ✓ (see caveat) |
| (d) What gardenShares proves | (i)–(iv) distinguished in plain words | answered below ✓ |
| (e) Proof green | test re-derives from corpus + grep-anchors code paths | 28 PASS / 0 FAIL ✓ |
| (f) Hygiene | zero src/js modified; no sibling file modified; only committed work at end | verified before commit ✓ |

CAVEAT (disclosed, not hidden): the corpus records depositPantryPieces
calls without a call stack, so the per-record mover cannot be proven
to be donateToPantry rather than one of the two other
depositPantryPieces callers that forward gardenShares (homecoming
pool, exile amends — game.js ~8617/~8774). Both alternatives deposit
into ANOTHER village's pantry and both still require a
garden-harvested source item, so neither changes the origin
conclusion, the door, or any count — but if the coordinator reads
leg (c)'s "caller that moves it" as requiring per-record mover
proof, this verdict downgrades to PARTIAL with zero change to the
numbers: the unproven slice is mover identity only (129 records),
not door, name, kcal, or origin. The GO above rests on the
supported mover (policy workGarden → donateHaul, same-day sequence,
71-day cadence) plus the fact that the attribution-creating step
itself (harvestGarden) is proven, not inferred.

## The answer in plain words

The plots DO ripen — just never at snapshot time. The premise
"plots never ripen" was a measurement artifact of end-of-day
snapshots, and the deposits are ordinary player garden harvests
taking the pack road into the pantry, not a mystery door:

1. The player sows Lamb's Quarters (first sow day 11), coaxes the
   beds daily with Green Thumb/Whisper magic (87 coax lines, +6 to
   +14 days each), the crop ripens during the day, the competent
   policy's workGarden harvests it into the player's pack, and the
   same routine's donateHaul donates the surplus to the pantry.
   The pantry record of that donation is a depositPantryPieces call
   carrying the item's gardenShares. That is all 129 records.
2. "Ripe 0 throughout" is exactly what this path predicts at
   snapshot time: a harvested plot's growth clock resets to 28 days
   of regrowth (gardenHarvestTaken), so by day-end it reads as
   growing, not ripe; unharvested plots sit at 15 or 2 days to go —
   also not ripe. Ripeness is a transient intra-day state
   (plotRipe = growthLeft <= 0), and the policy harvests it the
   same day it appears. No snapshot can ever catch it.
3. The NPC garden stock door ('Garden harvest' via stockPantry)
   is doubly closed for Lamb's Quarters on this band: all 99 of
   9762's garden resolutions entered with the production throttle
   engaged (duty redirected to wood/water/stone before any
   harvest branch), AND the NPC harvest branch only takes crops
   whose edibility is 'safe' — Lamb's Quarters is 'caution'
   (src/data/plants.json). Even unthrottled, NPC duty could never
   have stocked this crop. The zero 'Garden harvest' count is
   over-determined, not a recorder gap.

## Door split (re-derived from the corpus, not from prior reports)

Seed 9762, gardenInflows (the traced set):

| door | name | count | kcal |
|------|------|-------|------|
| deposit (depositPantryPieces) | Lamb's Quarters | 129 | 396,750 |
| stock (stockPantry) | — | 0 | 0 |
| pantryAdd | — | 0 | 0 |
| unclassified (missing door/name) | — | 0 | — |

Cross-check against the independent inflows instrument: the inflows
array holds exactly 130 deposit records on 9762 — the same 129
Lamb's Quarters records (396,750 kcal, exact match) plus one
non-garden Burdock deposit. Stock names on 9762 are only Foraged
food, Snared meat, System-replicated stew, Expedition haul — no
'Garden harvest' anywhere. pantryAdd fired 6 times on 9762, but none
of those 6 carried gardenShares, so the pantryAdd door contributes
zero garden-attributed records. The two instruments agree exactly.

Band context (9760–9767, same instrument): 276 garden-attributed
records, ALL deposit-door, 0 stock, 0 pantryAdd, 0 unclassified —
9760 Burdock 19 + Blackberry 22; 9761 Cattail 60; 9763 Mayapple 3 +
Muscadine Grapes 10; 9764 Burdock 33; 9765/9766/9767 zero. The 9762
pattern is the band pattern, not a 9762 quirk: wherever garden food
reaches the pantry on this band, it arrives as a player-harvest
deposit, never as NPC stock.

## The full call path for the 9762 deposits (code order)

1. Policy `workGarden` (scripts/policies/competent.js:1043) runs at
   Haven: `harvest()` → `Game.harvestGarden()` if the harvest gate
   passes; then makePlot / keeper / reclaim / sow; then
   `Game.cultivateGarden()` (the coax, if the magic gate passes);
   then `harvest()` again; finally, if any crop work happened and
   the scholar is inside Haven, `donateHaul()` → `donateSurplus()`
   → `Game.donateToPantry(i, amount)`.
2. `Game.harvestGarden()` (src/js/game.js:21581): for each plot
   where `plotRipe(p, day)` — i.e. `gardenGrowthLeft(p, day) <= 0`
   (src/js/game.js:21556) — builds the item with
   `foodForageItem(...)`, then mints the attribution:
   `item.gardenShares = this.gardenHarvestOrigin(p)` (game.js:21594),
   pushes it to the scholar's pack, and calls
   `gardenHarvestTaken(p, day)` (gardenCultivation.js:85), which
   stamps `lastHarvest` and resets magic — the clock restarts at
   the 28-day regrowth for shoots.
3. `gardenHarvestOrigin` (gardenCultivation.js:80) returns
   `{assisted: 1}` when the plot carries magic growth/yield, else
   `{ordinary: 1}`. The corpus records only the boolean presence of
   gardenShares, not this class, so per-record assisted vs ordinary
   cannot be split from this corpus — but with daily coaxing, the
   assisted class is the expected one (see timing below).
4. `Game.donateToPantry(idx, units)` (game.js:15337) copies the pack
   item and calls `depositPantryPieces(v, donated, 500)`
   (game.js:15371), which splits it into pantry pieces. The
   garden-capture wrapper sees the call's `gardenShares` and logs
   one gardenInflows record per donated stack: day, door 'deposit',
   name, kcal. One donated pack stack = one record; the 129 records
   are 129 donated stacks, not 129 harvests (a harvest day's yield
   can donate across several days — see timing).
5. The NPC path that does NOT fire: `resolveOneAssignment` garden
   duty (game.js:7004) harvests only ripe plots with edibility
   'safe' and stocks via `stockPantry(kcal, 'Garden harvest',
   {gardenShares: blend...})` (game.js:7010). On 9762 it never
   reaches that branch: 99/99 resolutions throttle-engaged, 0 NPC
   sows, and Lamb's Quarters fails the safe gate anyway.

## What a deposit's gardenShares actually proves (leg d)

(i) Proof of a garden plot ripening? YES — with a timing
    qualifier. gardenShares on a player pack item is minted ONLY by
    harvestGarden, which only runs on plots passing plotRipe that
    day. So each deposit proves some plot of that species ripened
    and was player-harvested at some earlier point (the pack lag
    below) — it does NOT prove a plot was ripe on the deposit day
    itself, and it does NOT prove a plot was ripe at snapshot time.
    The snapshot's ripe == 0 and the deposits' gardenShares are
    compatible, not contradictory.
(ii) Proof of a player sow? NO. gardenShares records the harvest,
    not the sowing. Sowing is proven separately by the sow events
    (28 player Lamb's Quarters sows on 9762, first day 11; 0 NPC
    sows). A deposit with gardenShares and no sow record would
    still be a garden harvest (e.g. a plot sown before the corpus
    window) — the flag alone cannot tell you who sowed.
(iii) Proof of forage attribution? NO — the opposite. Wild-foraged
    items never receive gardenShares: foraging builds items via
    foodForageItem with a harvestOrigin, and gardenShares is set
    only in harvestGarden. So a gardenShares-carrying deposit
    cannot be a wild forage haul mislabeled as garden food.
(iv) Proof of shared-stock bookkeeping? YES, as the carrying
    mechanism. Once minted, gardenShares survives the pantry piece
    splitter (depositPantryPieces merges pieces with
    mergeHarvestShares / blendGardenShares, food.js:274/286) and
    survives cooking blends (food.js:1120). A pantry stack's
    gardenShares is therefore bookkeeping carried forward from the
    harvest, not a fresh harvest event — but for the 9762 raw
    Lamb's Quarters deposits, the carried value traces back to a
    real harvestGarden call, not to bookkeeping alone. The two
    propagation-only paths that could carry gardenShares without a
    fresh harvest (merge/blend of an existing garden item) cannot
    CREATE gardenShares from a wild item: blendGardenShares reads
    only existing `item.gardenShares` entries, so a wild item stays
    share-less no matter how often it is merged or cooked.

Excluded origins, with reasons (not assumed):
- NPC stock door: 0 stock records band-wide + 99/99 throttled
  resolutions + caution gate. Excluded three ways.
- Wild forage: gardenShares is never set on forage items (only
  harvestGarden mints it for pack items). Excluded by code.
- Starting pantry: setup pushes are direct pantry writes with no
  gardenShares field (no gardenShares in pantry setup defs), and
  the first deposit is day 20, nine days after the first sow —
  not a day-2 stock item. Excluded by code and timing.
- Tribute / favor / raid direct pushes: they bypass all three
  wrapped doors, so they cannot appear in gardenInflows at all;
  the homecoming-pool and exile-amends depositPantryPieces callers
  (game.js ~8617/~8774) DO forward gardenShares, but they deposit
  into another village's pantry and still require a
  garden-harvested source item — they are mover alternatives (see
  caveat), not origin alternatives.

## Timing proof (corpus numbers)

- First player Lamb's Quarters sow: day 11. First coax: day 12
  (+8 days). GrowthLeft on the day-11 plots: 30 (day 11) → 21
  (day 12) → 20 → 11 → 10 → 1 (day 16) → harvested (lastHarvest
  17 on the day-17 snapshot). The 30-day shoot ripened in 6 days
  because daily coaxing advances 12–14 days per cast plus natural
  growth. First snapshot harvest day 17; first deposit day 20 —
  a 3-day pack-to-pantry lag (donateSurplus keeps a personal
  buffer before donating), exactly what a pack-mediated path
  predicts and a direct stock path cannot produce.
- The steady cycle after day 19 is visible in the snapshots:
  harvest day (lastHarvest stamped, growthLeft 28) → 15 → 2 →
  harvest again — a 3-day ripen cycle under daily coaxing
  (28 − 1 natural − 12/14 magic ≈ 15, then ≈ 2, then ripe).
  Coax amounts rise with ability level over the run (8s early,
  12s mid, 14s late: 3/4/6/31/43 across amounts 6/8/10/12/14).
- 68 snapshot harvest days vs 71 deposit days: 57 days both, 11
  harvest-only days (17, 19, 22, 25, 28, 31, 35, 37, 42, 46, 56 —
  harvest went to the pack and stayed there past day-end), 14
  deposit-only days (21, 24, 26, 30, 41, 44, 45, 50, 54, 57, 74,
  78, 80, 82 — backlog donated on a day with no fresh harvest).
  A direct-to-pantry stock path would show same-day, same-count
  alignment; the observed lag/split pattern is the signature of
  the pack road.
- End-of-day ripe counts: max 0 across all 100 gardenDays; zero
  snapshot plots with growthLeft <= 0. Under the player-harvest
  path this is expected (ripe plots are harvested before the
  snapshot, and the snapshot's own ripe test uses the same
  growthLeft <= 0 rule on post-harvest clocks). The prior
  "ripe 0 throughout" finding is therefore CONFIRMED as a number
  and REVERSED as an interpretation: it never meant "nothing
  ripened."

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

Corpus sayLines are garden-filtered (only lines containing 🌱,
'garden', or 'beds'), 264 lines on 9762: keeper weed lines 89,
coax lines 87, sow lines 30, 'Harvest:' lines 0. The zero
'Harvest:' count is a CAPTURE-FILTER artifact, not evidence of no
harvests: the harvest narration ("Harvest: 12× Lamb's Quarters…")
contains none of the three filter markers, so it can never enter
this corpus. Do not quote it as "no harvest narration exists."

What the captured lines do say, read together with the numbers:
- Daily, the keeper line: "🌱 Eduardo / Farid / Wilhelm / Liam
  waters and weeds the beds before taking up other work. The
  harvest can wait." — true for the NPC (throttled, tending only),
  and now known to be beside the point for the pantry: the
  pantry's garden food comes from the player's hands, not the
  keeper's. The line is faithful about NPC duty and silent about
  the real supply channel.
- Daily, the player line: "You coax 4 growing beds forward by 12
  days. The next harvest carries the growth magic." — and the
  harvest does come, every ~3 days, into the pack and then the
  pantry. The magic narration and the deposit stream agree.
- The pairing stock9762 found odd — "the player sows Lamb's
  Quarters in the beds every few days while the pantry's Lamb's
  Quarters arrives as deposits" — is resolved, not odd: sowing,
  coaxing, harvesting, and donating are one loop run by the same
  player. The garden's spoken work and the pantry's stock meet in
  the pack, which this corpus's garden-filtered lines simply do
  not narrate. No villager dialogue in this corpus contradicts
  the trace; the sense gap is a narration gap (the pack road is
  silent), not a behavior gap.

## Village assessment

What the village looked like: on 9762, a village that survived all
100 days on a pantry that genuinely holds ~90,000 fresh kcal at
median, fed in large part by its scholar's own garden loop — the
player sowing, coaxing, harvesting, and donating Lamb's Quarters
on a 3-day cycle — while the appointed garden keeper spent every
one of 99 duty days watering, weeding, and being redirected to
wood, water, and stone. The village eats garden food every day
without any villager ever harvesting a garden crop.

Who thrived and died and why: 2 deaths on 9762 (monster 1, the
arena 1) — contest-shaped, not pantry-shaped, matching the band
(18 deaths across 8 seeds, none starvation). The deposit question
is about provenance, not survival, on this band.

What knowledge/capabilities were missing: nothing in this arm's
scope — the blank was the deposit origin, and it is now traced to
a named call path with counts. What remains missing is narration,
not food: the pack road (harvest → donate) is invisible in the
garden-filtered transcript, and the per-record mover (donate vs
homecoming/amends) is invisible in the inflow record. Both are
instrument gaps for a future arm, not game gaps.

Blanks filled: (1) door split for all 129 deposits (deposit 129,
stock 0, pantryAdd 0, unclassified 0, cross-checked across two
independent instruments); (2) the full call path
workGarden → harvestGarden → gardenHarvestOrigin →
donateToPantry → depositPantryPieces, with file/function anchors;
(3) the corrected interpretation of ripe == 0 (transient
intra-day state, not "never ripens"); (4) the four-way answer to
what gardenShares proves (harvest yes, sow no, forage no,
bookkeeping as carrier). Documented, not fixed: no game-code
change was made (DIAG only), and no prior evidence needs numeric
revision — stock9762's counts reproduce exactly, and only its
interpretation ("plots never ripen") is corrected.

## Reachability verdict

On this band (competent-nofeast, seeds 9760–9767, 100d): waves 1–3
reached; waves 4–5 reached on 0/8 seeds. Regional, national, table,
and wins: 0/8. Rank stayed village on all 8 seeds. Arc II/III/IV,
four-realm formation, trap acquisition, counter discovery/kill,
and young-link succession survival are not recorded in this
corpus and are not estimated here. The scale wall stands on this
band; this arm closes a provenance blank, it does not move the
wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9760–9767)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach per
seed: 9760: 3, 9761: 2, 9762: 2, 9763: 2, 9764: 2, 9765: 3, 9766: 3,
9767: 3. Median survival: 100d (censored at the 100d horizon; all 8
seeds survived to day 100). Deaths: 18 total (9760: 0, 9761: 2,
9762: 2, 9763: 3, 9764: 1, 9765: 1, 9766: 5, 9767: 4).

## Metric review (MEASUREMENT.md section 14)

- The pre-registered bar worked as written: legs (a) and (b) are
  exact re-derivations (129 / 396,750 / 0 unclassified, matched
  across two instruments), and leg (c)'s origin step is named
  with anchors rather than inferred. The verdict follows from the
  bar, not from a re-scoring.
- The one soft spot in the bar as written: leg (c) asks for "the
  caller that moves it to the pantry door" in the singular, but
  the code has three depositPantryPieces callers that forward
  gardenShares, and the corpus carries no call stack. The trace
  names the supported mover (donateToPantry via workGarden /
  donateHaul) and the two alternatives, and argues the GO stands
  because all three preserve the same origin — but a future
  prereg in this family should EITHER require a call-stack or
  caller tag in the capture instrument, OR define the origin step
  as the shares-creating function alone (with movers reported as
  a set). Proposed for the NEXT run, not applied here.
- The boolean gardenShares capture is a second instrument limit:
  it cannot split assisted vs ordinary harvests (gardenHarvestOrigin
  classes). A future arm that needs that split must capture the
  shares object, not the flag. This limit does not touch the
  verdict: both classes are garden harvests through the same door.
- No revision is proposed for legs (a), (b), (d), (e), (f): exact
  door reproduction plus grep-anchored paths is the right
  strictness for a provenance arm.
- Residual: 0 unclassified records at door level. The only residual
  is the mover-identity caveat above (129 records, bounded, named).

## Reproduction check (this run)

- NO fresh seeds were spent. All numbers re-derive from
  evidence/2026-10-26/sim-stock9762-b-corpus/ (read, never
  modified) via scripts/analyze-gardendeposit-b.js.
- Proof scripts/test-gardendeposit-b.js green in this worktree,
  exit 0: 28 PASS / 0 FAIL — corpus re-derivation (129 / 396,750 /
  0 unclassified / door split / cross-instrument match / band
  276 / timing / throttle 99/99 / NPC sows 0 / player LQ sows 28)
  plus 10 code anchors (harvestGarden minting, plotRipe rule,
  harvestTaken reset, NPC safe gate, donateToPantry mover, policy
  workGarden sequence, blend propagation-only, LQ caution).
- No game-code change: zero src/js files touched; no sibling
  capture or corpus file modified. No jest was run (nothing to
  test in jest — the proof is node, not jest). No [needs-eyes]:
  this lands a measurement, not a player-visible change.
- Files in this arm: evidence/2026-10-27/sim-gardendeposit-b-prereg.md,
  evidence/2026-10-27/sim-gardendeposit-b.md,
  scripts/analyze-gardendeposit-b.js, scripts/test-gardendeposit-b.js.
  Prereg committed separately as 1d7218107 (see below).

## Findings for the coordinator backlog (do NOT edit goal hidden_files here)

- [open] 2026-10-27 — food-economy/garden — GARDEN DEPOSIT ORIGIN
  TRACED (loop B arm sim-gardendeposit-b, GO with disclosed mover
  caveat): all 129 Lamb's Quarters deposits on 9762 are
  player-harvest → pack → donateToPantry → depositPantryPieces;
  stock 'Garden harvest' 0, pantryAdd garden 0, unclassified 0.
  The "plots never ripen" premise is corrected: ripeness is a
  transient intra-day state (growthLeft <= 0), harvested the same
  day it appears under daily coaxing (3-day cycle 28→15→2→harvest),
  so end-of-day snapshots always read ripe 0. NPC stock is doubly
  closed for Lamb's Quarters (99/99 throttled resolutions +
  edibility 'caution' vs the NPC safe-only gate).
- [open] 2026-10-27 — food-economy/measurement — INFLOW RECORDS
  LACK A CALLER TAG (loop B arm sim-gardendeposit-b): three
  depositPantryPieces callers forward gardenShares (donateToPantry,
  homecoming pool, exile amends); the corpus cannot distinguish
  them per record. Next provenance arm should capture a caller tag
  (or call stack) alongside the door. Does not change this arm's
  origin conclusion (all three require a garden-harvested source).
- [open] 2026-10-27 — food-economy/narration — THE PACK ROAD IS
  SILENT IN GARDEN TRANSCRIPTS (loop B arm sim-gardendeposit-b):
  garden-filtered sayLines (🌱/garden/beds) can never contain the
  'Harvest: …' narration, so the player harvest→donate loop that
  feeds the pantry is invisible in garden transcripts while the
  throttled keeper line ('The harvest can wait') dominates. A
  player reading only garden lines would conclude the garden
  contributes nothing. Candidate: a donation/harvest line in the
  garden transcript set, or a haven-board pantry-source summary
  (design question, not built here).

## Verdict (judged against the pre-registered bar, not re-scored): GO

Door-level attribution is complete (129/129 deposit-door, 0
unclassified, cross-instrument exact), the origin step is named
and anchored (player harvestGarden minting gardenShares on ripe
plots, moved by donateToPantry via the policy's workGarden →
donateHaul sequence), and the "what gardenShares proves" question
is answered four ways. The single disclosed caveat — per-record
mover identity (donate vs homecoming/amends) is indistinguishable
in this corpus — is bounded, origin-preserving, and named above;
if the coordinator reads leg (c) strictly, the verdict reads
PARTIAL on that slice alone, with no number changed.
