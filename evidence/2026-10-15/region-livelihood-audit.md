# Regional livelihood and trap-use audit — 2026-10-15

## Outcome and coordination

The 150-day playstyle screen found an actual dead feature: trap recipes
listed North American species, so traps in the independently authored Europe
usually had no eligible local catch. Eleven recipe catch lists now include
appropriate European animals/fish. Costs, catch chance, durability, ecology
depletion, preparation, knowledge and old catch weights are unchanged.

Steve then directed Codex to honor Muse's lane and push. Remote
`agent-lanes` at 5af7c331 reserves godpaths/ascension/subclass/scale/codas
for Codex and regions/nomad/regional systems for Muse. Muse's
`region-content-wave1` at 9cc36028 already has six playable regions.
**Codex's Europe dataset overlaps that branch; do not blindly merge it.**
See [lane reconciliation](../../docs/AGENT-LANES.md). Codex stops further
region authoring and resumes the godpath lane after publishing this audit.

A read-only intersection of Muse's actual recipe catch lists and regional
animal/fish pools shows the same gap on that branch: Amazon and Sahel have
11/11 trap recipes without a compatible species; Europe, South Asia and
East Asia have 10/11 (only wild boar in the pit overlaps). This is source
reachability evidence, not a natural simulation of Muse's six-region build.
Muse uses different animal IDs: Europe has european_hare, eurasian_badger,
common_pheasant and northern_pike rather than this branch's rabbit/hare/
badger/roach mix. Reconcile IDs and coverage before applying this data fix.

## Standard 150-day screen, 16 seeds per policy

Explicit region/origin options now run through the existing sweep-compare
driver with its ten-day sampling and policy brain. Default behavior stays
unchanged. Each run is a separate child process. Columbus origin throughout;
this is local knowledge in woodlands and stranger knowledge in Europe, so
cross-region outcomes are not an isolated geography balance experiment.
Seeds: 7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9.

Player tier-3+ below counts only real acquired weapon/armor from contest,
show, fan/package/patron, trade or craft sources. Starting gear, succession
packs and all corpse loot are excluded. These policies avoid deliberate
hunts/feast patrols (capable retains them); ordinary defense still happens.

| Region | Policy | Before wins / seats | After wins / seats | Before / after player tier-3+ runs |
|---|---|---:|---:|---:|
| europe | capable | 12 / 15 | 13 / 14 | 16 / 16 |
| europe | maker | 7 / 9 | 5 / 7 | 16 / 16 |
| europe | merchant | 2 / 3 | 2 / 3 | 16 / 16 |
| europe | caregiver | 4 / 6 | 6 / 7 | 16 / 16 |
| woodland | capable | 9 / 13 | 9 / 13 | 16 / 16 |
| woodland | maker | 6 / 8 | 6 / 8 | 15 / 15 |
| woodland | merchant | 2 / 5 | 2 / 5 | 15 / 15 |
| woodland | caregiver | 4 / 9 | 4 / 9 | 16 / 16 |

All **64/64 woodland final state hashes match** before/after. Europe has
20/64 unchanged hashes. All observer error lists are empty. Every Europe
run acquires good noncombat gear both before and after; that does not prove
all jobs, pacifism or equal ending odds. Contests and shows run in all 64
Europe cases; loot from dead people is separately retained in the raw files.

## Matched 64-seed Europe maker comparison

A larger maker sample tests whether repair of the unused route also improves
outcomes. Frozen pre-fix source is retained locally under
.git/region-livelihood-before-source; its driver includes the regional
selection extension. Production/policy source was unchanged during each
matrix, and source hashes in each report identify the actual bytes.
Parent sourceHead is a checkout parent, not a claim of clean HEAD.

| Measure | Before | After |
|---|---:|---:|
| Table wins | 21 | 15 |
| Table seats | 27 | 22 |
| Median days | 127.5 | 125.0 |
| Village lost | 14 | 20 |
| Village dead | 2 | 1 |
| Bearer deaths | 71 | 63 |
| Runs learning hide armor | 1 | 38 |
| Runs reaching hide armor L2+ | 0 | 21 |
| Successful hide armor crafts | 0 | 30 |
| Carcass cleaning calls | 18 | 960 |
| Preservation calls | 0 | 5 |

All 64 makers in each arm acquire player tier-3+ noncombat gear. Twenty-six
final state hashes match. The repair opens the hide/carcass route, but
**does not improve aggregate Table wins**: 21 becomes 15, and village losses
14 becomes 20, despite fewer bearer deaths (71 becomes 63). This is not a
survival buff or proof crafting is now balanced. More real catches change
food processing, spending and later RNG histories; this screen does not
identify one cause of the ending difference. Retain the coherent catch
contract and flag the outcome tradeoff for follow-up, rather than silently
retuning chance/food to force a win target.

## Failed-seed trace and observation checks

Before repair, capable seed 777 has about 14,000 kcal around day 35, raids
and thinning shared grounds, then empty pantry at meals on days 38–40.
Three consecutive hungry days cause actual scattering, population 5, with
three starvation deaths recorded. This proves the ending path, not that
a single regional food number caused it. After the repair, the same seed
reaches a real Table win on day 124. The trace in each arm exactly matches
the corresponding census state hash, so narration/food snapshots did not
alter that run. One seed's rescue does not override the 64-seed tradeoff.

The complete 150-day maker seed-7 observer-on/off hashes also match.
Focused shared-kit proof: real craft + set spends vine/time; the finite
regional rabbit stock falls by one; a carcass retains gross calories and
uses durability; actual cleaning yields hide and its L1 outline; a snare
cannot take a bear or invent rabbits; a paid basket catches actual roach.
The first five assertions were **2 pass / 3 fail** on old data and **5/5**
after; the added water case makes **6/6**. Forced RNG chooses a catch branch
only in that prepared proof, not in any natural matrix. The separate
regional-driver/observer proof passes **5/5**, including invalid-region
refusal and preserved ordinary default landing.

## Remaining dead-use coverage

After repair, these natural Europe policies still make zero calls to
renderFat, makePemmican, expandStorage, armory/pharmacy transfer verbs,
proposeTrade/proposeCovenant, orderMember and networkSummon. Five maker
preservation calls in 64 replace zero; underuse is not solved. Prior focused
peer/campaign policies prove some of those routes separately. These zero
counts are coverage limits, not evidence the game features have no value.
Natural ammunition crafting remains absent. Better prizes alone do not
solve food logistics or ending readiness.

## Reproduction and files

```powershell
node scripts/gear-usage-audit.js --label region-livelihood-europe-after-16 --region eu_temperate --policies capable,maker,merchant,caregiver --n 16 --days 150 --par 4
node scripts/gear-usage-audit.js --label region-traps-after-64 --region eu_temperate --policies maker --n 64 --days 150 --par 4
node scripts/region-route-trace.js --region eu_temperate --policy capable --seed 777 --days 150 --reference evidence/2026-10-15/gear-usage-region-livelihood-europe-after-16.json --out <trace.json>
node scripts/test-regional-trap-20261015.js
node scripts/test-region-comparison-20261015.js
```

Raw matrices are `gear-usage-region-livelihood-{europe,woodland}[-after]-16`
and `gear-usage-region-traps-{before,after}-64` in this directory. Before
64 uses the frozen root above; the pre-fix 16 reports use the parent recipe
bytes. Each report retains gameplay/policy/driver/observer source hashes.
Traces: `region-livelihood-777-trace.json`,
`region-livelihood-777-after-trace.json`; long observer parity:
`region-livelihood-observer-parity.json`. No src/js gameplay change in this
pass. Existing actual phone proofs are in europe-region-audit.md; this
pass changes data/tooling and does not claim another browser playthrough.

## Validation trail

Quick suite after the regional driver: 133 passed. After the trap repair:
134 passed. Initial full tooling run: 903/905 passed; continuous-travel and
spawn-knack failed, and both unchanged isolated reruns passed (21/21 and
37/37). Ontology separately validated all 111 systems. The next full run
was 905/906: the legacy snare-copy check allowed only its three old US small
game IDs. Its whitelist now includes the actual three European small-game
species while still excluding larger prey; the real regional negative
case rejects bears. That focused trap proof passes 31/31. No quarantine.

The catch-array formatting was normalized after the simulations with an
assertion that complete parsed recipe data is identical. Report byte hashes
identify the observed pre-formatting source; formatting digests are retained
in region-livelihood-recipe-format.json. No natural sim result is attributed
to that whitespace change. Final full result is recorded below once complete.

The repeated first 16 maker rows in each 64-seed arm exactly match the
corresponding 16-policy-matrix hashes (32/32). They are repeated checks,
not additional independent samples. All trap catch IDs resolve to actual
animal definitions.

Final trap-data full run: 905/906 passed; the remaining failure was the old
drifter-presence test. Investigation found an actual pre-existing engine
leak: the false-teaching branch called wrongTeaching for the player even
when absent. This is fixed and independently proved in a separate follow-up
commit. All matrices and their conclusions above describe the pre-presence-
fix source, exactly as their hashes record; do not attribute them to that fix.
