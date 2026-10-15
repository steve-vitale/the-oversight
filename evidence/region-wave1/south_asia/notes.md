# south_asia — research notes + validation log

## Research (web-verified 2026-10-14)
- **Strychnos nux-vomica**: fruit "about the size of a large apple, smooth hard shell, orange when ripe", seeds flat discs ~1.5% strychnine (Wikipedia; indiabiodiversity.org; eagri.org HORT282). Bael lookalike pair is gameplay-plausible: both hard-shelled round tree fruit; bael is green-grey/larger with woolly seeds, nux-vomica orange with flat grey coin-seeds.
- **Abrus precatorius**: scarlet seeds with black spot, abrin; one chewed seed can kill an adult; intact seeds may pass through; seeds used as ratti gold-weight (Wikipedia; lazynaturalist.com). Lookalike pair vs masoor/chickpea documented in content.
- **Lantana camara**: unripe (green) berries toxic — lantadenes, liver failure; ripe dark purple; square stems, rough stinking leaves; Indian names Putush (West Bengal), Ghaneri (Maharashtra), Gu Phool (Assam) (Wikipedia; jungledragon.com; NPSOT). Lookalike pair vs jamun documented (tree-vs-shrub test).
- **Sundarbans face masks**: real practice since the 1980s — fishermen/honey collectors wore face-masks on the back of the head because tigers attack from behind; tigers reportedly caught on to the ruse (Wikipedia "Tiger attacks in the Sundarbans"; NPR 2016). The monster counter "face it" is the honest lateral trick; codex notes it's hesitation, not immunity.

## Written from established references (confidence marked per plant)
- Bamboo shoots: cyanogenic glycosides → double-boil, discard water (FAO bamboo processing).
- Colocasia: calcium-oxalate raphides → boil whole, peel after, cook with sour (FAO root crops).
- Makhana = Euryale ferox (fox nut), Bihar pond crop (ICAR).
- Purslane ("luni"), lambs quarters ("bathua", Chenopodium album), dandelion, plantain — cosmopolitan weeds present in India; patched via plants-patch.json with india/bangladesh region tags so local villagers start familiar. Dandelion/plantain confidence medium (more Himalayan than plains).
- Tulsi/peepal/banyan treated as sacred: content says "sacred to many — harvest gently / take fallen fruit first".
- Wild boar (Sus scrofa) REUSED from base animals.json — same species in India, no duplicate entry.

## Emoji decisions
- Same-kind doubling follows existing file practice (snakes share 🐍, deer share 🦌): chital 🦌 (white-tailed deer is the other 🦌, different region), porcupine 🦔, hare 🐇, palm squirrel 🐿️, jackal 🐺 (coyote is the other 🐺), fish share 🐟.
- New distinct: nilgai 🐂 ("blue bull" — bovine, apt), peafowl 🦚, mongoose 🦡 (no mongoose glyph; badger is the closest musteliform), macaque 🐒, tiger 🐅.

## Open / accepted deviations
- ORS packets: medType dropped — useMedicine only handles antibiotics/antiparasitic; ORS is a rare flavor item (rehydration is not an engine effect).
- Monster `encounter.knownTactics/knownCue` + phaseBadges modeled on hushwolf; noticeAudio/aggroAudio omitted (audio v2 placeholders pending Steve's ear).
- Plant `seasons` use monsoon ids (hot/wet/cool); engine doesn't gate forage on plant.seasons today, but the content is coherent for when it does.
- Trees list has 5 entries (≥3 required); bushes 4 (≥2 required).

## Validation log

### 1. `node scripts/validate-regions.js --quiet`
`validate-regions: 20 regions, 2 playable, 0 errors` ✓

### 2. `REGION=south_asia node scripts/region-smoke.js`
```
region-smoke: south_asia, seeds 7,42,99, 60 days, capable bot, origin "Columbus, Ohio"
  seed 7: survived day 60 pop 7 deaths 32 (starved 1) landing rice_paddy
  seed 42: survived day 60 pop 2 deaths 34 (starved 0) landing river_ghat
  seed 99: survived day 60 pop 7 deaths 33 (starved 1) landing rice_paddy
region-smoke: OK
```
✓ No crash, starvation not certain.

### 3. `node scripts/check.js --quick`
First run: 89 passed, 6 failed. All 6 root-caused to the intended design
change (2nd playable region), NOT to content bugs:

1. **test-sprites-valid** — LEFT OPEN (see below).
2. **test-grace-count** — RNG-order fragility: with 2 playable regions the
   seed's fight order shifted and the hushwolf's opening turn killed the
   15-hp test player (verified: "You go down." → village dies out). Fixed
   by full-healing (fighter + scholar) between fights; assertions untouched.
3. **test-region-engine** — hardcoded `playable === 1`. Updated to `>= 1`
   with the count in the message (wave 1 added south_asia).
4. **test-region-start** — hardcoded `Object.keys(seen).length === 2`.
   Now asserts coverage of all `Game.playableRegions().length`.
5. **test-origins-world** — W5/W6 fixtures are woodlands-specific; a random
   south_asia landing broke tier expectations. Pinned
   `Game.debugRegion = 'na_eastern_woodlands'`.
6. **test-where-are-we** — the Ohio/Kyiv/Hanoi tier fixture hardcodes
   woodlands-relative tiers; a south_asia landing sent the fixture loop
   into an infinite spin (re-homing to Columbus tags never yields a
   south_asia local). Pinned `Game.debugRegion = 'na_eastern_woodlands'`.

All 5 test fixes are test-only, minimal, and preserve every assertion's
intent. None touch src/js game code.

### LEFT OPEN: sprites (test-sprites-valid, 104 failures)
Every plants.json species needs its own sprite in src/js/sprites.js and
every monster needs calm+aggro sprites. My 34 plants + 2 monsters
(sweeps_week, cliffhanger) have none. Drawing 38 SVGs is src/js art work —
explicitly out of scope for this fragment task ("Data over code"). The
fragments are ready for it: all plant `taxon[1]` values use the existing
category vocabulary (fruit_tree/herb/shrub/flower/vine), so only species
sprites are needed, no new categories. Needed: 34 plant sprites +
sweeps_week_calm/aggro + cliffhanger_calm/aggro, in the style of
evidence/2026-10-14/sprite-audit.md. The toxic lookalikes (lantana vs
jamun, nux_vomica vs bael, datura, rosary_pea) must be visually distinct
from their edible twins per the audit's lookalike-pair rule.
