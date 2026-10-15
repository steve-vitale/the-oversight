# Actual plant harvest provenance

Code commit: `ab36f77ae5eebd4d1eb06998110883c9881faa01`.

Main player garden/wild/nut harvest callers and NPC garden/forage-duty/foraging
returns now retain the canonical harvester in `harvestShares`. The map is a
fraction of each fungible portion's energy. It never adds food, identifies
unknown plants, grants XP or completes an ascension deed.

Existing stack selection and whole-unit rounding are preserved. When food
from two harvesters and untraced food mix, source shares are weighted by
the actual units merged. Untraced food dilutes attribution; its origin is
never invented. Unknown plants retain shares per species inside their lump,
including staging, mixing and later identification. Processing keeps source
identity. Mixed pemmican weights its real ingredients by input energy,
so a cook cannot claim the meat/fat energy merely by supplying berries.

Donation, single/bulk pantry withdrawal, finished-food shelving and Light
Fingers preserve the existing food's source. Ration/surplus merges include
untraced inputs in their denominator. A scout's forgotten cache stays
untraced even though its old display label is also "Foraged food". Save/load
and mantle succession retain historical harvest ownership.

## Runtime proof

`scripts/godpath/test-harvest-source.js` runs **26 assertions** through the
shared game harness. The frozen `d4380f98` source passes 7 and fails 19;
the candidate passes all 26. Real actions cover player/NPC garden and forage,
unknown lumps, mixed and partial stacks, actual pantry round trips, nut
processing, pemmican, Light Fingers, finished-food shelving, save/load and
succession. Prepared source-bearing ingredients test processing and transfer;
they do not establish natural acquisition or seven days of village feeding.

The earlier `probe-garden-provenance.js` also runs against the candidate.
The player still harvests 167 x 45 = 7,515 kcal; NPC garden duty still brings
4,200 kcal in physical pieces. The 1,000-kcal draw requests still yield
990 and 700 kcal respectively. The later real NPC meal still draws 1,000
kcal plus 340.0478565 kcal from personal production, with hunger 60 -> 33.
The added fields now identify the player and NPC harvesters separately.

## Campaign-state comparison

The 16-seed x four-policy screen has **64/64 identical standard result rows**,
and all observer fields except the raw state hash match the previous
`alien-party-after-64.json.gz` baseline. Warnings: zero. Raw state hashes
include the new source maps and are expected to differ where those maps
remain. The observer only adds food/ability-action/corruption source hashes;
its child observation and decisions are unchanged.

`probe-harvest-trajectory.js` independently runs seeds 7 and 12 across all
four policies on the frozen and candidate sources. It retains the existing
full-state hash, and separately hashes a clone with only `harvestShares`
removed. All **987 paired daily snapshots** and eight final states match
after that removal; **920 candidate snapshots contain source fields**.
All eight standard result rows also match. Only the existing hash's three
wall-clock pacing exclusions apply; food, health, gear, RNG-derived state,
telemetry, action counts, progression and other fields remain compared.
This is a measured prerequisite, not evidence of improved playstyle odds.

The full 64-seed x four-policy panel also has **256/256 identical standard
result rows and identical observations except raw state hashes**, with zero
warnings. It retains **124 wins and 229 player deaths**. Both panels pin
the same candidate code commit. Raw panel/state-probe files are losslessly
compressed with raw/gzip SHA-256 hashes in `harvest-source-validation.json`.

## Remaining implementation

The Living Garden gate still uses its previous proxy. Source metadata is
only the prerequisite. Actual eater receipts, whole-village daily coverage
and seven distinct feeding days remain to be wired and measured. Reconcile
away ration packing/spending (`packKcal`, `packMeal`) and personal food/gifts
before relying on a Haven-only receipt. The current ration abstraction keeps
calories and risks rather than the harvested portion's source; this remains
an explicit next boundary. Direct magical hunger relief and anonymous daily
production do not prove that somebody ate the holder's actual harvest.
Reconcile supplemental harvest creators (the rare-herb forage bonus and
magic-produced fruit) before counting all plant-source routes.

Retain one objective and gate for player/NPC, canonical-person save and
succession behavior, the class/payoff/build/day gates, and the independent
Table requirements. All nine remaining authored deeds stay open.

## Verification failure triage

The initial full suite passed 922/922. A later run reported distant-village
catch-up, ledger naming and NPC voice failures (919/922). All three tests
then passed directly on both frozen and candidate sources; their original
causes were not established. A subsequent isolated suite reported one
continuous-travel fixture failure (921/922).

That travel test assumed an exact edge cell was walkable on a randomly
generated map. The real entry search is allowed to choose a nearby cell
when the requested cell is blocked or is an isolated pocket. Preparing a
blocked east edge reproduces the original test failure on frozen source.
The repaired test supplies open cells with exits for exact-coordinate
checks, retains all 21 existing assertions and adds two assertions for the
explicit blocked-corner fallback. It passes all 23 assertions in ten
independent runs. Travel runtime and Muse's region/nomad files are unchanged.
Logs, direct checks and the forced-block proof are losslessly preserved in
`harvest-source-failure-triage.json.gz`. No assertions were weakened and no
tests were quarantined.

Final verification: quick **150/150** in 44 seconds, dedicated runtime proof
**26/26**, repaired travel proof **23/23** across ten runs, full suite
**922/922** in 156 seconds. No gameplay source changed after the pinned
campaign panels. No UI change, deployment or service-worker bump.
