# Temperate Europe playable content slice — 2026-10-15

The roadmap's first content wave now has two selectable regions. Europe
passes the data contract and actual landing/foraging/pantry/ruins tests.
This does not complete wave 1 or establish balance for every playstyle.
The noncombat reward, maker and peer audits remain the priority references
for Steve's gear and dead-feature questions; their conclusions are not
superseded by this content pass.

## Content and boundaries

- 29 forage species: 10 reused cosmopolitan plants and 19 new sourced
  European plants. Each new species has its own small SVG in the existing
  sprite system. Explicit preparation, avoid flags, lookalikes, confidence
  and source links accompany the knowledge records. Art is not a field ID
  guide, and generic knowledge prose still needs editorial refinement.
- 11 ordinary terrestrial/bird species, 3 freshwater fish, and a brown bear
  restricted to Continental Forest Hamlet. Existing Sus scrofa is reused.
  New species use existing game combat profiles; these stats, food portions
  and parasite odds are game tuning, not measured biological data.
- Six trees, six berry bushes, three landing variants (Hedgerow Fields,
  Continental Forest Hamlet, River Mill), three ruins, ten scavenge entries,
  regional village names and five pantry bags. German, Polish, Ukrainian
  and Irish familiarity lists recognize the new landings.
- Existing temperate calendar and actual regional conversation lines.
  Intro copy no longer asserts that none of a native's home plants grow here.
- Hungry Gap and the Hedge Listener/Mill Bell monster skins are explicitly
  **scaffolded**. No new monster IDs were added to global spawn pools. Their
  regional challenge/skin runtime is a separate ordered roadmap item.
- First-run origin routing can now choose Europe. Subsequent random-region
  selection uses the current playable set rather than one hardcoded region.

## Simulation: reject the poor starting pantry

All primary runs use the capable policy, the existing region-smoke driver,
60 days, Columbus origin, and the same 16 seeds:
7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9.
No prepared gear, knowledge or wins are granted. Frozen sources were used;
SHA256 manifests identify actual bytes, with parent 88ce36e7 recorded only
as the checkout parent. All 428 final src files matched the working tree.

| Screen | Villages reaching day 60 | Early village losses |
|---|---:|---|
| Woodland before content | 16/16 | none |
| Initial Europe, 9,200 nominal kcal pantry | 6/16 | 10 at days 2–4 |
| Europe, baseline-equivalent 47,250 pantry | 15/16 | seed 777, day 40 |
| Final Europe, also ten authored scavenges | 15/16 | seed 777, day 40 |
| Woodland after content | 16/16 | none |

The initial low reserve draft is rejected. Final regional bags preserve
woodland quantities/calories: beans, barley, soup, dried meat and hazelnut
kernels. The early failure screen's village-loss signal is real, but not
all those losses have starvation telemetry: do not relabel all of them
proven starvation deaths. The final failed seed has population 5 and three
recorded starvation deaths at its day-40 ending. It remains an open balance
case. Reaching day 60 is village continuity, not zero individual deaths or
a Table win; the final Europe screen records 12–44 deaths per run.

Final three-seed screens also use Berlin and Lagos origins, each 3/3 at
day 60. This checks native and stranger paths, not all origins or jobs.
Expanded global content changes RNG consumption and some later woodland
histories; this is not a controlled single-variable claim of a region's
win-rate effect. Sixty-day capable survival does not prove pacifist,
merchant, caregiver, maker or all-build viability in Europe.

Raw logs: [final Europe](europe-final-smoke.log),
[woodland before](europe-woodland-before-smoke.log),
[woodland after](europe-woodland-after-smoke.log),
[rejected low pantry](europe-low-pantry-smoke.log),
[corrected pantry intermediate](europe-pantry-corrected-smoke.log),
[Berlin](europe-berlin-smoke.log), [Lagos](europe-lagos-smoke.log).
[Source hashes](europe-source-hashes.json) retain all four frozen stages.

## Browser: actual new expedition and pantry transfer

On loopback, normal controls selected Berlin, Jan Weiss (butcher), five
visible possessions, and a named expedition. The actual new run landed at
River Mill; the mobile header revealed Autumn / Temperate Europe. Selected
Green Whisper through the actual gift picker. At 390 × 844, opened Take
from pantry, packed two hazelnut kernels, and saw the real Pack receipt
and Eat/Donate/Leave actions. Pantry changed 47,250 → 46,910 kcal and kernels
35 → 33; the pack gained two, 340 kcal / 0.2 kg. No debug state mutation or
fixture inventory was used. Do not claim this transfer consumed clock ticks;
that UI path did not. Captured warnings/errors were empty.

Saved screens: [landing](europe-landing-phone.png),
[packed food](europe-pantry-phone.png). The separate
[19-species art gallery](europe-plant-art.png) is a desktop static inspection
of the actual SVG strings, not a production mobile screen. Intro copy was
changed in source, but Continue bypassed the fresh intro after reload;
its newly rendered wording is not separately browser-proven. A German
character still has an old generic crappie-fishing memory: broader lifeseed
voice regionalization remains open. Agent tabs were closed and the temporary
viewport reset after verification.

## Regression findings and repairs

The first full run had 22 failures; the next had 11. The final full run is
**904 passed, zero failed**, 132 seconds, with **132 quick** scripts passing.
Region validator: 20 total, two playable, zero errors. New regional proof:
30/30. Sprite validation: 1,075 pass, zero fail. No tests were quarantined.
The standalone older validate-data script still has its known spec.endsWith
failure; this note does not claim a wholly green legacy data validator.

The content expansion exposed tests relying on a sole random region or a
particular generated adult roster. Existing woodland scenes now explicitly
select woodland, coalition/campaigner fixtures explicitly supply distinct
adult recruits, region tests use the actual playable pool, and the region
knowledge fixture has a bounded loop rather than a potential hang.

Additional test corrections preserve real action contracts:
- Detective's innocent gossip target now has an explicitly empty lie record.
- Knowledge trade uses private prepared knowledge and a payment species
  absent from both the trader's pool and known plants. Naming a plant next
  to the trader can teach it immediately, making the old fixture invalid.
- Peer counters are answered via the real accept action. Unanswered
  renegotiation measures the exact expiry penalty separately from other
  daily trust changes.
- Gorging setup clears the complete Haven ring, places the bearer beside
  the injected contact, and actually defeats it. Retreat can leave that
  monster alive and still consuming food.
- DPS retreat proof uses a named prepared hushwolf attack profile with
  fleeAt=0 and explicit barehanded human stats. It preserves a losing DPS
  projection; the easy case still requires a kill. It checks the original
  bearer survives, rather than mistaking a successor for their escape.
  These are prepared contract cases, not natural monster survival evidence.
- Wound and walking-escape tests clear unrelated prior damage/peace magic
  so they exercise their stated case.

One small actual runtime defect was exposed: a successful peaceful action
could finish combat before the declared turn-cost handler found its actor.
The original actor now retains its spent-turn marker without advancing an
ended fight. The new real peacemaker-contact proof is **2 pass / 1 fail**
against frozen baseline and **3/3** after the fix; only its outcome branch
uses forced RNG. No peace chance, ability power or reward was increased.

Full result: [check log](europe-full-check.log). `git diff --check` clean.
No push, deployment or service-worker release. Broader roadmap goal active.

## Source references and remaining work

Plant edibility/preparation references are recorded per JSON species.
Primary cross-checks used Woodland Trust's seasonal foraging and species
pages, RHS's harmful-plants/yew and hedgerow guidance, RSPB/BTO bird pages,
the European Commission large-carnivore overview, and the official UK
freshwater fish species list. Representative links:

- [Woodland Trust: September foraging](https://www.woodlandtrust.org.uk/blog/2024/09/foraging-in-september/)
- [Woodland Trust: wood sorrel](https://www.woodlandtrust.org.uk/trees-woods-and-wildlife/plants/wild-flowers/wood-sorrel/)
- [RHS: potentially harmful plants](https://www.rhs.org.uk/prevention-protection/potentially-harmful-garden-plants)
- [European Commission: large carnivores](https://environment.ec.europa.eu/topics/nature-and-biodiversity/habitats-directive/large-carnivores_en)
- [Official fish species list](https://www.legislation.gov.uk/ukia/2014/21/pdfs/ukia_20140021_en.pdf)

Continue the other four wave-1 regions, then ordered codas/deeds/runtime
wiring. Keep the food/gear livelihood audit active: 64 maker runs earning
noncombat tier-3+ gear does not prove balanced endings, natural ammo supply
remains unobserved, and prepared Network/Finale proofs do not establish
natural completion. Existing 95 item-art gaps remain outside these 19 new
plant sprites. Investigate Europe's seed 777 loss before claiming parity.
