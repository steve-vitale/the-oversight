# sa_amazon — region content build notes

## Setup
- Worktree cap was full (16/16); sanctioned reaper found nothing cleanable.
  Parent had registered `region-wave1` (run_id = the orchestrator's own session,
  clean, idle, at the required base) — adopted as this run's tree with branch
  `region-wave1-amazon` at 7d011395d99bdfca71892d0f3a23a8a332f3ab15.
- `bash scripts/worktree-heartbeat.sh region-wave1` prints a usage error
  (`line 9: 1: usage`) but DOES update heartbeat_at (verified in REGISTRY.json).

## Research (edibility/toxicity claims that are gameplay)
- Bitter vs sweet manioc: linamarin/lotaustralin; bitter up to 400 mg HCN/kg,
  sweet <50. Boiling removes only 10–75% — NOT safe alone. Full detox: peel,
  grate, ferment 2–3 days, press, roast. Sources: FAO CXC 73-2013, FSANZ.
- Rubber seeds (Hevea brasiliensis): cyanogenic (linamarin ~186 mg/kg),
  poisonous raw; locals eat only after thorough cooking. Sources: USM IFRJ,
  PeerJ.
- Assacu/sandbox tree (Hura crepitans): pods explode at ~240 km/h firing
  seeds; latex with phorbol esters — blistering, blinding; seeds toxic.
  Sources: laboratorynotes.com, Google Arts & Culture, putahcreekcouncil.org.
- Kapok seeds (Ceiba pentandra): cyclopropenoid fatty acids
  (malvalic/sterculic); oil classed non-edible (biodiesel/soap). Sources:
  MDPI Ceiba review (2022), ResearchGate kapok-seed composition paper.
- Manihot glaziovii checked as a cassava lookalike but is caatinga/eastern
  Brazil, not Amazon — dropped; the sweet/bitter pair carries the lookalike
  gameplay honestly instead.
- Cashew shell: cardol/urushiol caustic oil; roast in shell before cracking.
  Sources: Healthline, The Old Foodie.
- Cupuaçu pulp eaten raw (PFAF, Wikipedia); soursop pulp safe, seeds toxic
  (annonacin) — gardenia.net, CIRAD fruitrop.
- Victoria amazonica: Kew confirms seeds/stalks edible; the popcorn claim is
  medium-confidence (popped-seed tradition is documented for Euryale ferox;
  kept the entry to dried/roasted/flour).
- Piqui: used Caryocar villosum (the Amazon species) instead of the cerrado
  C. brasiliense; endocarp spines per Kew's pequi page.

## Content decisions
- 31 new plants + 3 reused cosmopolitans (dandelion, purslane, plantain_leaf
  via plants-patch.json). 28 edible, 20 safe, 3 avoid (sandbox, castor bean,
  kapok) — exceeds validator minimums (12/3/2).
- Portuguese already existed in characterGen.languages — no fragment needed.
  originKeywords for manaus/belém/iquitos already emit sa_amazon — verified,
  not touched. originTags gained "manaus","belem" per brief.
- Lifeseeds: existing amazon_brazil (origins Manaus/Belém) and amazon_peru
  (origins Iquitos) patched with the 3 landing ids via lifeseeds-patch.json.
- Name culture constraint satisfied: Manaus/Belém → brazilian, Iquitos →
  peruvian (pre-existing mappings).
- Animals: 11 (8 land + 3 fish); predators [jaguar]. Emojis chosen distinct
  from all existing animal/monster emojis: jaguar 🐅 (🐆 is florida_panther),
  capybara 🐹, agouti 🐀, peccary 🐷, macaw 🦜, toucan 🐦‍🟧 (blackbird-style
  ZWJ with orange square — toucan has no Unicode emoji), howler 🐒, tapir 🦏,
  pirarucu 🐠, tambaqui 🐡, piranha 🦈.
- Monsters: The Living Wire (electric eel — burst discharge, water-only,
  counter = get out of the water) and The Anaconda Empress (ambush coil
  grapple, counter = strike the head during windup). Both wave 1, anatomy-
  coherent attacks.
- Climate: kept stub's calendar tropical_wet_2 (dry 120d / wet 245d);
  southern hemisphere reads it six months on automatically — no custom month
  map written. talk.regions.sa_amazon added (4 local voice lines).
  tropical_wet visitor lines NOT extended — apply-fragments only merges new
  family keys, and tropical_wet already exists (kept existing).

## Validation
- `node scripts/validate-regions.js --quiet`:
  ```
  validate-regions: 20 regions, 2 playable, 0 errors
  ```
  (two iterations: first run caught missing climateFamily and rubber_tree
  missing roll — fixed in the fragment, re-applied, then 0 errors)
- `REGION=sa_amazon node scripts/region-smoke.js`:
  ```
  region-smoke: sa_amazon, seeds 7,42,99, 60 days, capable bot, origin "Columbus, Ohio"
    seed 7: survived day 60 pop 5 deaths 32 (starved 0) landing varzea_levee
    seed 42: survived day 60 pop 7 deaths 30 (starved 0) landing ribeirinho_dock
    seed 99: survived day 60 pop 10 deaths 15 (starved 0) landing varzea_levee
  region-smoke: OK
  ```
  Note: deaths are high but starvation is 0 — the Amazon kills through
  predators/monsters/disease, which is the intended food-abundant/danger-rich
  profile, not a tuning failure.
- `node scripts/check.js --quick`: (see below)
