# Gardens: ordinary cultivation, invested magic and Haven growth

Steve's direct direction is in godpath/STEVE-ANSWERS.md (2026-10-20).
The gameplay redesign below is pending. The usage audit/tooling does not change
the live game's crop values, capacity or duties.

## Actual current system

- Every Haven tier allows six plots. Neither makePlot nor gardenGate reads
  havenTier. Six reserved grid cells and the panel share plot indices.
- Maturity is 7 days for shoots, 12 for berries and 14 for roots. Every crop
  can then be harvested every 3 days indefinitely; there is no crop-specific
  establishment, root removal/replant or seasonal harvest model.
- Base yield is 5,000 kcal per plot per harvest, +25% per plant knowledge level.
  NPC garden duty yields 80% times worker efficiency. Player and NPC delivery
  are different routes. Knowing a plant is human knowledge, not magic.
- Green Thumb, Green Whisper, Rain Dancer and Cornucopia mostly power wild
  foraging/water, not these crop maturity/yield functions. A Gardener subclass
  label therefore does not prove a working cultivated-garden build.
- Six weedy days kill crops. The surplus-production throttle redirects garden
  duty before tending, treating maintenance as unwanted fresh-food production.
  Empty pantry and surplus pantry are different opportunities.
- A dead plot remains dead. Both sow routes reject dead plots, tending ignores
  them, and no reclaim action exists. The six-plot ceiling includes dead plots.
  More capacity alone would postpone that dead end, not solve it.

The prepared garden-throttle-probe-r1 contrast engages the actual surplus
predicate from a stocked pantry. The real garden duty becomes wood work with
no tending/harvest. Disabling only that predicate in a separate seeded process
tends the crop and delivers 2,800 kcal. This isolates that branch in the prepared
scene; it does not prove the cause of every crop loss in natural campaigns.

## Design contract for implementation

1. Haven's real growth tier unlocks more cultivable beds and visible grid
   capacity. Use one capacity/placement source for make, gates, status and map.
   New beds require paid preparation; a bigger settlement does not conjure
   planted crops or instantly mature food. Preserve existing plots/structures,
   ownership, doors and old-save progress. Explain the next capacity upgrade.
2. Ordinary cultivation supplies a modest long-term supplement. Use authored
   crop profiles for establishment, harvest/replant and regrowth; do not treat
   edible berry seed as a mature bush after twelve days or root harvest as an
   unlimited three-day dispenser. Human skill improves competent husbandry;
   it does not silently become supernatural acceleration.
3. Invested gardening abilities explicitly change the garden: food-powered
   growth, resilience and/or harvest payoff with clear level progression.
   Use the ability owner's build and food cost for player and NPC work. A
   foraging bonus, god title or another person's ability cannot substitute.
   Show the actual progress/result and source of supernatural acceleration.
4. Keep maintenance separate from harvesting surplus. A full pantry can defer
   collection or change work allocation without silently abandoning watering
   and weeding. Dead beds need a paid, understandable reclaim/replant route.
   One gardener's work and stockpile capacity remain real constraints.
5. Before sowing, show honest time to first harvest, expected role/scale and
   tending needs. Keep the map, current message and controls together on one
   phone screen; no additional permanent garden dashboard or repeated cards.

These requirements do not yet select numerical values.
Choose numbers through crop profiles and measured run economics, including
seed/land/labor, time before first food, spoilage, household demand and the
ability's food bill. Never offset a warning simply to restore win percentage.

## Reality used to constrain the abstraction

The University of Maryland Extension describes vegetable life cycles ranging
roughly 25–110 days, with some crops harvested once and sustained harvest often
requiring successive plantings. Its salad-table guide describes cut greens
regrowing over 25–30 days. These are references for ordinary crops, not values
to paste onto every wild species or region. Magic should explain the game's
exceptional pace. Sources: [planting calendar](https://www.extension.umd.edu/resource/when-plant-vegetables),
[container and salad-table guide](https://www.extension.umd.edu/resource/growing-vegetables-containers-and-salad-tables).

## Repeatable usage evidence

Run from the repo using the Windows shell prerequisites in SIMULATING.md:

```powershell
node scripts/garden-longplay-audit.js --out evidence/<date>/<fresh-prefix>
```

One shared seeded harness runs per child, four child processes at a time.
The declared set is 16 seeds per capable/maker/merchant/caregiver at 150 days,
plus ten 600-day-cap cases, including the four fixed caregiver seeds. Eight
separate on/off sidecar controls compare canonical full-state hashes, complete
outcome rows, all 23 balanced metrics and the next RNG draws. Caps are recorded
as caps; terminal outcomes are separate. This is targeted usage evidence,
not independent confirmation of a small balance effect or pacifist viability.

The sidecar reads saved fields and observes real actions. Attempts, planted
beds, NPC duty redirects, actual tending, dead crops, player deliveries BEFORE
paid time passes, and actual pantry delivery are separate. It never calls
production or permission helpers to invent opportunities. Output is not proof
food was eaten usefully; consumption attribution to cultivated crops remains
unknown. Player ability snapshots do not establish eligible NPC ability use.

Interrupted runs resume from fingerprinted per-case compressed caches only
with identical source, controller, harness, balanced collector, sidecar and
job inputs. A completed prefix cannot be overwritten; changed inputs need a
fresh prefix. Retain the plan, compressed result and sidecar source identity;
case caches are local recovery aids, not substitutes for the retained report.
Quick/full run test-garden-usage.js, including refused work, partial delivery,
source exclusion and the meal-after-harvest boundary. See dated garden-longplay
audit for actual counts, prior pilot limitations and tradeoffs.

Before shipping the gameplay redesign: use the same observer against frozen
baseline/candidate roots; matched16-per-policy screens, distinct64-seed followup
where needed, named naturally offered gardener cohorts, full all 23 scorecards,
and explicit ordinary-skill versus paid-ability contrasts. Prove natural crop
maturity/harvest/recovery and tier growth through mobile controls and Continue.
No current usage report clears that future implementation or public release.

Sowing events are method-completion observations. Their player actor/day
fields must not be used as initiation-time personal deed credit when a paid
action advances time or changes bearer; planted-run coverage is the usage
measure here. NPC eligibility and useful consumption remain separate audits.
