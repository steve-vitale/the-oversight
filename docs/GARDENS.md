# Gardens: ordinary cultivation, invested magic and Haven growth

## Truthful surplus transfers (2026-10-21)

Both competent-controller donation decisions use donateSurplus: known usable
food only, a real safe-food reserve, current pantry room and whole-stack public
actions. Unsafe/unknown/bonded/empty/unshelled stacks cannot pad the reserve.
Use the engine's preservation-aware spoilage boundary. A successful call must
remove the actual pack row and earn the matching gift credit; null alone says
nothing. donated and donatedKcal now count these transfers; donationAttempts
and donationRefusals remain separate. _lastGiveDay changes only on success.
The secondary decision retains two days of pack food and one transfer per call;
the main haul keeps its existing one-day or opt-in trading reserve.

garden-longplay-audit now retains an independent passive direct-donation
receipt stream and controller counters, with real on/off controls including
the counters. Baseline/candidate use the same observer and Game; controller
changes require an explicit methodology comparison. Historical attempt counters
cannot be relabeled physical gifts. This does not change the all23 contract.

Partial donation remains a player-facing gap: one huge crop stack cannot be
partly stored through Donate. The controller skips it and tries smaller fitting
stacks; it never rewrites inventory to simulate a public action. Address the
real Pack flow next, with phone and Continue proof, before numerical calibration.
The living-bearer cutoff mentioned in older entries below is already repaired;
see TERMINAL-CAMPAIGNS.md and solo-campaign-audit-r1.

## Garden controller food loop (2026-10-21)

The shared controller now harvests before new investment and after paid growth,
prepares real crop food, consumes safe portions and stores eligible safe surplus.
It preserves unknown food, actual fire/risk gates, original Game costs and its
four-bed target. Garden work stops for encounters/body changes; permitted combat
meals retain their existing behavior. Unripe checks do not reschedule unrelated
eating or donation. Game and player-facing assets are unchanged.

The same-Game methodology comparison retains all23 warnings. Natural long usage
is48/74 harvesting and47/74 eating cultivated food, versus6/74 and5/74 before.
Actual consumed crop food1,719,837 kcal includes12,310 ordinary and1,707,527
assisted. These are crop origins in mixed runs, not ordinary-only/Gardener build
viability. Output10,530,075 and spoilage7,058,265 nominal kcal show that harvest
volume alone is insufficient. Direct debits, seeds, stocks and the unallocated
residual remain separate. See garden-controller-audit-r1 and long-review-r3.

Both82-job arms have eight passing observer controls. The64-case screen gets128
matching independent before/after Game-hash/outcome/all23 replays, with retained
same-source baseline reuse. Ten final extended cases reach engine endings through
day309;22 screen cases remain capped. Wins16→15/7→6/8→9/10→8 and other survival,
community/progression/gear watches require investigation, not win-rate tuning.
Game balance and intentional-build/upper-tier coverage remain open for Muse.

Next: remove the driver's living-player/village-dead cutoff with truthful ending
and community-loss semantics. Then audit harvest/storage decisions: whole-stack
donation can exceed pantry capacity, and old policy donation counters count attempts.
Use physical transfers/meals as proof. No new player release is needed for this
tooling; the published crop-safety Game remains unchanged.

## Harvest safety prerequisite (2026-10-21)

Released864af1192, live build14dd8521d-20261021-074815. Publication-r1 checks
171 production inputs and a clean fresh phone boot. Quick283/0, full1,055/0,
prepared24 checks, both phone crop/cook/meal/Continue journeys, real16-stage
frames and installed update/offline Continue pass. The64 matched natural
screen cases retain exact outcomes/all23/state hashes with four observer
controls each. The unchanged controller still never harvests for the player;
its repair and actual garden viability/calibration remain the next lane.

The retained previous74-case long audit also exposes a policy capacity limit:
58 campaigns sample Haven tier2,44 tier3, yet the bot never makes more than
four beds because workGarden uses a four-bed target. This is historical
opportunity coverage, not a safety-candidate rerun or useful-food proof. See
garden-food-safety-controller-gap-r1. The next policy audit must measure actual
upper-tier opportunity and affordability without treating maximum planting as
an objective. The Game's2/4/6/9 capacity is independently tested.

The player harvest caller constructed bare calorie stacks instead of canonical
food. Reproduced elderberry, nettle, groundnut, cassava, cushcush and bamboo
harvests all lacked their normal must-cook risk. Nuts also lacked shelling;
unknown guided crops revealed names and calories. Before the controller is
taught to harvest, use foodForageItem with the bearer's actual plant knowledge.
Keep species units, paid work, cycle reset, producer and cultivated-origin
shares. Harvest narration uses the believed/unknown name and labels known
calories before preparation. Pack owns the actual preparation instructions.
Existing already-harvested save items are not retroactively rewritten.

This changes player crop safety and shelf life to match the same wild species;
it is a gameplay prerequisite, not a controller-only or passive-metadata change.
NPC garden duty's safe-only gate remains. Prepared eight-species checks and
phone cooking prove mechanics, not natural garden-build viability. See the
garden-food-safety evidence and all23 screen before calibration.

## Cultivated-food accounting released (2026-10-21)

Release9a83bc686, live builddea9296f6-20261021-061958, verifies171 production
inputs and clean fresh phone boot. Quick282/0 and full1,054/0 preceded the push;
the publication-receipt follow-up gets its own fresh checks.

See INTAKE-TELEMETRY.md for four crop-origin classes, cumulative actual meals,
partial/refunded consumption and unknown history. Nominal output, useful
nourishment, direct debits, seed stock, labor and spoilage remain separate.
No crop/yield/ability price changed in this milestone. The Pack/prep handler
also fixes a real completed-meal save gap found with actual touch controls.

The current matched screen retains identical outcomes/all23 metrics. The
natural usage audit has74 observed campaigns per arm plus8 separate passive
controls. Current-state hashes match after removing only the two new metadata
fields; outcomes, all23 and RNG match too. Ten extended cases reach actual
engine endings;24 of64 screening cases remain capped, not terminal.

Six campaigns harvest; five eat identified cultivated food. Output is137,196
kcal, known consumed crop food49,955 kcal and primary nourishment45,981 kcal.
All identified consumed crop food is from assisted cycles. That does not prove
ordinary-only or ability-build viability. Known spoilage-sweep removal is54,016
nominal kcal;33,225 nominal kcal remains unallocated by these measurements.
Processing, seed use, barter/export, uncovered stock and run-end losses remain
possible parts of that residual. Do not call it waste or silently allocate it.

**Controller limitation:** the shared workGarden policy pays for growth but
never calls the player's harvest action. The actual census records0 player
harvest calls versus2,818 paid cultivations;8 NPC pantry deliveries supply all
observed output. This is an incomplete player loop, not evidence that the Game
refuses harvests. The phone journey actually grows, harvests and eats both crop
classes. Before calibrating prices, repair and prove the controller's public
harvest→store/process/eat loop. Compare old/new controllers on the same Game
as an explicit methodology change, then use one controller on both Game roots.
Do not turn zero observed ordinary food into a balance verdict.

The NPC duty still collects only safe crops; caution crops such as
lamb's-quarters remain standing. This is a source/prepared boundary, not a
measured population explanation. Do not remove the safety gate and turn
unprocessed crops into generic safe food. The dawn-crossing cost test also
retains requested versus elapsed ticks: the current clock discards overshoot
at dawn. Neither behavior was silently changed to improve the report.

Repeat from the shared current tool checkout, with frozen roots and fresh paths:

```powershell
node scripts/garden-longplay-audit.js --root <game-root> --par 4 --out evidence/<date>/<fresh-prefix>
node scripts/summarize-garden-accounting.js --before <before.json.gz> --after <after.json.gz> --out evidence/<date>/<fresh-summary>
```

Each child loads one seeded shared harness.74 campaigns use the declared
16-per-policy seed set plus10 fixed extended cases; eight on/off controls
check full state/outcome/all23/RNG. Iteration caps and actual terminal status
are distinct. Both arms use one current observer, controller and harness;
plans retain sources, tools, flags and node version. UTF-8 streams and child
payload SHA256 are checked before accepting output and cached cases. Resume
requires exact input fingerprints; completed reports are never overwritten.
Quick/full run source, route, cost, conservation and transport regressions.

See garden-intake-audit-r1 and long-summary-r2 in dated evidence for receipts,
prepared/natural limits and final publication gates. The raw before arm has
unknown cultivated-origin history, not zero garden intake.

Late-game follow-through is retained in caregiver-terminal-audit-r1: naturally
earned day182 Green Thumb3+Whisper3, existing cultivated crop history, real
phone paid growth/refused repeat/Continue. This adds an earned opportunity
check; it does not establish ordinary-only viability or useful food intake.
The four fixed caregiver campaigns now reach actual engine endings through
day270. Broader garden balance/calibration warnings below remain open.

Steve's direct direction is in godpath/STEVE-ANSWERS.md (2026-10-20).
Cultivation shipped in39d5623d7, live build e984314d9-20261021-014853.
All165 deployed boot inputs match; source-bound phone/Continue/offline proofs
and quick271/0, full1,043/0 are retained. Balance remains review_required.
The earlier audit remains historical.

## Released cultivation

`src/data/gardening.json` owns capacity and crop profiles. Haven tiers unlock
2/4/6/9 beds. The original six positions keep their saved indices; the last
three occupy the northern row. Every new bed costs120 kcal and paid work,
changes the actual ground to soil and refuses occupied structures/traps.
Unlocked capacity does not create crops. Existing beds survive lower capacity.

New ordinary shoots establish in30 days and regrow in28; roots generally
take90 days and must be replanted. Berries and woody plants take much longer,
with named overrides for strawberries, grapes and tropical roots. These are
authored game abstractions, not a full seasonal/habitat agriculture model.
Harvests produce species units and real food values rather than a universal
5,000-kcal sack. Plant knowledge still improves husbandry yield by25%/level;
it does not accelerate time. Planted legacy crops retain their old cycles
and yields until replanted. No old crop loses already earned growth.

Green Thumb or Green Whisper grants a Garden-only Cultivate action costing
200 kcal through the actual ability engine. Levels advance growing beds by
4/8/12 days. Holding both adds Whisper synergy2/4/8 days. Thumb levels multiply
the next harvest1.5/2/2.5; Cornucopia adds1.25/1.5/1.75. One cast per bed/day
survives harvesting, replanting and caretaker changes. Calendar time does not
skip. Player food-power eligibility and owned ability slots still apply.
NPCs need their own held ability and pay their own hunger equivalent; practice
uses the same6/12-XP advancement as player actions. Foraging/water effects
remain separate. This does not claim every Gardener power has been redesigned.

A standing caretaker consumes one real daily garden assignment while a living,
healthy resident is available at Haven. Other explicit orders take priority;
active water-run companions cannot also promise garden work. A full pantry
defers collection and magic but keeps living crops maintained before redirecting
the worker. Dead beds can be reclaimed for40 kcal and replanted. A garden
assignment may also reclaim a bed when it is actually doing garden work.
Sowing still needs two real units and knowledge or a real teaching guide.
NPC seed gathering remains part of the existing farming duty abstraction.

All hands-on work requires Haven grounds, outside the hall. One Garden entry
and one bounded phone panel own the controls; crop details and caretaker
choices fold away. New sowing tells the actual first-harvest/regrowth times.
Completed player costs, crop changes and practice are saved before unload.

The matched current-controller audit has64 screen campaigns and10 extended
campaigns per arm, plus8 separate neutral controls. Screen harvesting is0/64
old versus4/64 candidate; extended harvesting is2/10 in each arm. Candidate
screen delivery80,366 kcal is output, not proof of useful consumption or
garden-build viability. The old arm was rerun with the new controller; do not
compare these values to the earlier controller as a Game-only change.
See garden-cultivation-natural-r1 and baseline-r1 retained raw reports.
All23-metric panels, named offered-farmer coverage and mobile natural-save
verification must be reviewed before publication.

## Historical system audited at e984314d9

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

## Design contract

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
The earlier usage audit alone clears neither this candidate nor public release.
See garden-cultivation-audit-r1 for the candidate's matched panels, actual
natural-save boundary and remaining calibration limits.

Sowing events are method-completion observations. Their player actor/day
fields must not be used as initiation-time personal deed credit when a paid
action advances time or changes bearer; planted-run coverage is the usage
measure here. NPC eligibility and useful consumption remain separate audits.
