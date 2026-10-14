# Sprite audit, 2026-10-14

Steve: "I want you to audit individual sprites for accuracy and relevance. Many are completely silly looking?"

Every sprite in `src/js/sprites.js`, plus godhood `MYTHIC_SPRITES` and the procedural `villagerSprite`, was rendered and looked at. Each one was drawn at 128px and at its real in-game size: 36px on the grid, 26px for item icons. Each was judged against its `plants.json`, `items.json` or `monsters.json` entry (name, description, codex text). `tile-scenes.js` was out of scope because another worker is recolouring it.

## Summary

- **294 existing sprites audited:** 37 plant, 122 item (including `deer_animal` and the UNKNOWN_ITEM parcel), 124 monster (62 calm/aggro pairs), 11 mythic.
- **Verdicts:** OK 266, unreadable 3, silly 6, inaccurate 15, irrelevant 4.
- **Fixed in place:** 28. That is every sprite not rated OK. Ids and keys are unchanged.
- **Missing plant art:** 19 `plants.json` species had no sprite at all. They silently fell back to `generic_plant`, so toxic pokeweed drew exactly like any harmless herb. All of them now have art (table below), plus one new category node, `sap_tree`.
- **Plant fallback fix:** `plantSprite` jumped from a missing species sprite straight to the root. It now falls back to the deepest chain node that has art (species, then category, then root).
- **Taxon data:** 7 regional plants (prickly pear, mesquite, salmonberry, huckleberry, yaupon holly, saw palmetto, sugar maple) had no `taxon` in `plants.json`, so Examine could not name their type. They now have one. As a side effect, the long-red `test-sprites-plants-20261006.js` went from 19 failures to 0.
- **Villager generator:** 5 silly features fixed (section below).
- **Not fixed, flagged:** 95 `items.json` ids have no art and draw the UNKNOWN_ITEM parcel even when known. These are mostly godhood/capstone relics (`commanders_coat`, `war_horn`, `apex_bow`, `seed_vault`, …) and alien gear. The parcel is the documented fallback, so this is a content gap, not a bug. About 13 broadcast-monster sprites rely on SVG `<text>` (see the table), which is illegible at 36px.

**Style rules applied:**
- Natural things (plants, animals, items) use a limited earthy palette.
- The flat, clean icon look is kept for System/broadcast things.
- Silhouettes are built to read at 36px.

**Lookalike pairs:** these must now look different on the grid.
- **Elderberry vs pokeweed:** elderberry is a flat-topped spray on a woody shrub; pokeweed is long hanging racemes on a magenta stalk.
- **Wood sorrel vs clover:** wood sorrel now has its yellow flowers.
- **Blackberry vs salmonberry vs huckleberry:** black aggregate berries, salmon aggregate berries, and single small dark berries on a low shrub.

## Worst offenders (before → after)

| id | was | now |
|---|---|---|
| `trail_mix` | a cup with a goblin face | a handful of nuts and raisins |
| `staghorn_sumac` | a red cone on a ladder | antler branches + three red cones |
| `pawpaw` | a palm tree | understory tree with drooping leaves and fruit cluster |
| `goldenrod` | a corn dog | arching yellow plumes |
| `knife_roll` | a treasure chest | an open canvas knife roll |
| `tinder_bundle` | a brain | a bird's-nest of fibre |
| `mirrormoth_calm` | red atlas moth (codex says luna moth) | luna moth |
| `glasswing_calm` | a moth (codex says dragonfly) | dragonfly |
| villager paparazzo echo | camera covering the whole face (a cyclops) | camera on a neck strap |
| `elderberry` | 30 KB spray, cropped by the viewBox | flat umbel of berries, 7 KB |

## Villager generator (`villagerSprite`)

| feature | verdict | was | fixed |
|---|---|---|---|
| female long hair | silly | Flat trapezoid behind the head: read as a veil or wimple. With dark hair on dark skin it read as a beard ring. | yes: rounded shoulder-length fall, open below the chin |
| paparazzo echo | silly | Camera drawn over the whole face (a cyclops) | yes: camera on a neck strap at the chest |
| landlord echo | silly | Placard floating above the head on a pole | yes: hi-vis vest kept, survey stake held in the hand |
| union_rep echo | silly / broken | Detached raised arm and a clipboard floating above the head | yes: clipboard held against the chest |
| moderator echo | silly | Gavel floating at the shoulder | yes: gavel hangs from the hand, hood kept |
| heckler / warranty_caller / understudy echo | OK | Cap + grin / receiver at ear / grey blank face read as intended | - |
| skin tones, clothing pools, age, posture, equipment layers | OK | Diversity kept as is | - |

## New plant sprites (previously drew `generic_plant`)

| id | drawn as |
|---|---|
| `pokeweed` | TOXIC lookalike of elderberry. Thick magenta stalk, big smooth leaves, long HANGING racemes ripening green to black |
| `spicebush` | thin dark twigs, oval leaves, bright red oval berries |
| `hazelnut` | dense shrub, rounded leaves, nuts in fringed papery husks |
| `sunchoke` | tall stalks, small sunflowers, knobby tubers below the soil line |
| `stinging_nettle` | square stem, opposite serrated leaves, drooping flower strings, stinging hairs |
| `greenbrier` | green zigzag thorny vine, glossy heart leaves, coiled tender tip |
| `maypop` | passionflower (purple fringe), three-lobed leaves, egg-shaped green fruit |
| `wild_cherry` | dark bark with horizontal lenticels, hanging racemes of dark cherries |
| `serviceberry` | grey-barked small tree, white starry flowers, red-to-purple berries |
| `groundnut` | twining vine, maroon pea flowers, string of tubers underground |
| `ginseng` | whorl of three five-leaflet leaves, central cluster of red berries |
| `wild_ginger` | two low heart leaves, maroon jug flower hidden at the base |
| `prickly_pear` | stacked cactus pads, spines, red-purple fruit |
| `mesquite` | spreading thorny tree, feathery leaves, long tan pods |
| `salmonberry` | thorny canes, magenta flower, salmon-orange raspberries |
| `huckleberry` | low shrub, small leaves, dark purple berries |
| `yaupon_holly` | dense evergreen shrub, small dark leaves, many small red berries |
| `saw_palmetto` | low fan palms, serrated stems, blue-black berries |
| `sugar_maple` | grey trunk, fall-orange crown, five-lobed leaves |
| `sap_tree` | NEW category node for sugar maple (taxon[1], shown by Examine): tapped trunk with spile and pail |

## Contact sheets

These are in `evidence/2026-10-14/presentation/`. Each sprite is shown at 128px, then at real size: 36px for plants, monsters, mythic and villagers, 26px for items.

| sheets | contents |
|---|---|
| `sprites-before-01..02` / `sprites-after-01..03` | plants. "After" adds the 19 new species and `sap_tree` |
| `sprites-before-03..09` / `sprites-after-04..10` | items |
| `sprites-before-10..15` / `sprites-after-11..16` | monsters, calm and aggro side by side |
| `sprites-before-16` / `sprites-after-17` | mythic god forms |
| `sprites-before-17..18` / `sprites-after-18..19` | 24 varied villagers (6 tones × 3 genders × 4 ages × 4 clothing pools, 8 with gear) + one per echo |

## Proof

- `scripts/test-sprites-valid-20261014.js` is on the green list as `quick`. It checks that:
  - every sprite, mythic form and ~500 generated villagers is well-formed SVG with viewBox 0 0 32 32 and no NaN, undefined or null;
  - every `plants.json` species resolves to its own sprite and has a category sprite;
  - every monster has distinct calm and aggro sprites;
  - every item draws its own sprite or the documented parcel.
- `node scripts/check.js --quick` and `--only sprite` are green.

## Full table (existing sprites)

| group | id | verdict | what was wrong / note | fixed? |
|---|---|---|---|---|
| plant | `generic_plant` | OK |  | - |
| plant | `generic_bush` | OK |  | - |
| plant | `generic_tree` | OK |  | - |
| plant | `berry_bush` | OK |  | - |
| plant | `berry_plant` | OK |  | - |
| plant | `blackberry` | unreadable | Two bare canes crossing in an X with outsized berries wearing red caps; no leaves, so at 36px it did not read as a bramble. | yes: arching thorny canes, compound serrated leaves, black aggregate berries (drupelets) + one red unripe |
| plant | `elderberry` | unreadable | 30 KB; drew past the 32x32 viewBox (top cropped in game); flowers and berries mashed into one fuzzy spray. | yes: flat-topped umbels of tiny purple-black berries on red rays over pinnate leaves (7 KB). Distinct from pokeweed |
| plant | `wild_strawberry` | OK | 12 KB; reads. | - |
| plant | `black_walnut` | silly | Trunk drawn as a striped box: read as a crate/cage holding up a tree. | yes: dark furrowed trunk, pinnate canopy, round green husks |
| plant | `burdock` | OK |  | - |
| plant | `cattail` | OK |  | - |
| plant | `chickweed` | OK |  | - |
| plant | `dandelion` | OK |  | - |
| plant | `flower` | OK |  | - |
| plant | `fruit_tree` | OK |  | - |
| plant | `ghost_pipe` | OK |  | - |
| plant | `goldenrod` | silly | One curved stalk with orange beads: read as a corn dog or caterpillar. | yes: three stems, narrow leaves, arching one-sided plumes of tiny yellow florets |
| plant | `herb` | OK |  | - |
| plant | `hickory_nut` | OK |  | - |
| plant | `jewelweed` | OK | Spotted trumpets a little mask-like at 128px; fine at 36px. | - |
| plant | `lambs_quarters` | OK | Geometric diamond leaves; readable. | - |
| plant | `mayapple` | inaccurate | Two flat star-shaped (hemp-like) leaves seen from above, stuck on a side-view stem. | yes: side-view umbrella leaves with lobed drooping rims, lemon fruit hanging in the fork |
| plant | `muscadine` | OK | Busy, but grapes + tendrils read. | - |
| plant | `nut_tree` | OK |  | - |
| plant | `pawpaw` | inaccurate | Grey pole trunk with a frond crown: read as a palm/banana tree. | yes: slim branching understory tree, big drooping obovate leaves, cluster of green-yellow fruit |
| plant | `persimmon` | OK | Fruit slightly heart-shaped; reads as orange fruit tree. | - |
| plant | `plantain_leaf` | inaccurate | Rosette only; missing the tall seed spikes that are the ID feature in its description. | yes: flat ribbed rosette + three seed spikes |
| plant | `purslane` | OK |  | - |
| plant | `ramps` | OK |  | - |
| plant | `sassafras` | inaccurate | Leaves did not show the "three shapes" (oval / mitten / three-lobed) the description and ID rely on. | yes: all three leaf shapes on one plant |
| plant | `shrub` | OK |  | - |
| plant | `staghorn_sumac` | silly | Trunk drawn as a ladder of rungs under one red cone: a Christmas tree on a ladder. | yes: antler-forked velvety branches, pinnate leaves, three red fuzzy cones |
| plant | `vine` | OK |  | - |
| plant | `white_oak` | OK | Acorns oversized (16 KB) but readable. | - |
| plant | `wild_onion` | OK |  | - |
| plant | `wood_sorrel` | inaccurate | Minor: no yellow flowers, so it read as clover (its lookalike). | yes: two small yellow five-petal flowers added |
| plant | `yarrow` | OK |  | - |
| item | `arrow` | OK |  | - |
| item | `audience_token` | OK |  | - |
| item | `bandana` | OK |  | - |
| item | `bark_armor` | OK |  | - |
| item | `binoculars` | OK |  | - |
| item | `bolt` | OK |  | - |
| item | `boot_stone` | OK |  | - |
| item | `bow` | OK |  | - |
| item | `branch` | OK |  | - |
| item | `bus_map` | OK |  | - |
| item | `bus_schedule` | OK |  | - |
| item | `buskers_harmonica` | OK |  | - |
| item | `camo_jacket` | OK |  | - |
| item | `camp_pot` | OK |  | - |
| item | `canned_beans` | OK |  | - |
| item | `canvas_pants` | OK |  | - |
| item | `carpenters_square` | OK |  | - |
| item | `chefs_knife` | OK |  | - |
| item | `contract_quill` | OK |  | - |
| item | `crossbow` | inaccurate | Bow glued diagonally across a stick; no stock/prod geometry. | yes: stock with perpendicular prod, string, bolt, stirrup, trigger |
| item | `crowbar` | inaccurate | Straight bar with a fork and no gooseneck hook: read as a screwdriver. | yes: red-painted bar with hooked claw end and flat pry end |
| item | `crude_bow` | OK |  | - |
| item | `daughters_drawing` | OK |  | - |
| item | `dead_phone` | OK |  | - |
| item | `denim_jacket` | OK |  | - |
| item | `dice_set` | OK |  | - |
| item | `dispatchers_headset` | OK |  | - |
| item | `dog_tags` | OK |  | - |
| item | `dried_apples` | inaccurate | Orange rings: read as onion rings / pretzels. | yes: cream apple rings with red skin rim and cored centre |
| item | `duffel_bag` | irrelevant | Drawn as a handbag/purse with a top handle. | yes: horizontal canvas cylinder, two handles, strap, end panels |
| item | `energy_bar_wrapper` | OK |  | - |
| item | `energy_drink` | OK |  | - |
| item | `fiber` | OK |  | - |
| item | `field_dressing_kit` | unreadable | Green box with abstract glyphs; nothing said gut hook / bone saw / game bags. | yes: open canvas roll with gut-hook knife, bone saw, folded game bag |
| item | `field_suture_kit` | OK |  | - |
| item | `field_sutures` | silly | A bread bun next to a hook. | yes: suture packet + curved needle + thread |
| item | `fire_hardened_spear` | OK |  | - |
| item | `fishing_line` | irrelevant | Abstract pipe/tap shapes. | yes: line wound on a stick (per description) with a hook |
| item | `flannel_shirt` | OK |  | - |
| item | `fusion_cell` | OK |  | - |
| item | `fusion_pellet` | OK |  | - |
| item | `genesis_seed` | OK |  | - |
| item | `gill_net` | OK |  | - |
| item | `good_boots` | OK | Sole a bit tank-tread. | - |
| item | `grandfathers_knife` | OK |  | - |
| item | `gravity_hook` | OK |  | - |
| item | `gravity_well` | OK |  | - |
| item | `hand_drill` | irrelevant | Looked like a pump drill / anchor on a stand. | yes: spindle in the notch of a hearth board, ember, smoke |
| item | `hand_saw` | OK |  | - |
| item | `hard_candy` | OK |  | - |
| item | `hardlight_knife` | OK |  | - |
| item | `hardtack` | OK |  | - |
| item | `hatchet` | inaccurate | Head drawn as a rectangular hammer block. | yes: proper axe bit with curved edge and poll |
| item | `hide_armor` | OK |  | - |
| item | `hiking_backpack` | OK |  | - |
| item | `home_key` | OK |  | - |
| item | `hoodie` | OK |  | - |
| item | `hunting_spear` | OK |  | - |
| item | `kitchen_knife` | OK | Thin, but reads as a knife. | - |
| item | `knife_roll` | irrelevant | A wooden treasure chest with handles poking out. | yes: canvas roll laid open, knives in stitched pockets, rolled end + ties |
| item | `knit_cap` | OK |  | - |
| item | `leather_jacket` | OK |  | - |
| item | `lighter` | OK |  | - |
| item | `locket` | OK |  | - |
| item | `lucky_coin` | OK |  | - |
| item | `machete` | inaccurate | Thin sword/katana blade. | yes: broad blade, black grip, and the price sticker from its description |
| item | `medfoam_canister` | OK |  | - |
| item | `military_vest` | OK |  | - |
| item | `mislabeled_beans` | OK |  | - |
| item | `mixtape` | OK |  | - |
| item | `mothers_ring` | OK | Teardrop ring; reads. | - |
| item | `multitool` | OK |  | - |
| item | `nanite_swarm` | OK |  | - |
| item | `notebook` | OK |  | - |
| item | `padded_cloth` | OK |  | - |
| item | `paperback` | OK |  | - |
| item | `peanut_butter` | OK |  | - |
| item | `pemmican` | OK |  | - |
| item | `phase_blade` | OK |  | - |
| item | `phase_sling` | OK |  | - |
| item | `photo_album` | OK |  | - |
| item | `protein_bar` | OK |  | - |
| item | `rain_poncho` | OK | Reads a little like a bell; colour carries it. | - |
| item | `rain_shell` | inaccurate | A tiny human figure, not a jacket (every other garment is drawn flat). | yes: hooded zip shell |
| item | `reading_glasses` | OK |  | - |
| item | `riot_gear` | OK |  | - |
| item | `rope_50ft` | OK |  | - |
| item | `running_shoes` | OK |  | - |
| item | `searcaster` | OK |  | - |
| item | `search_locket` | OK |  | - |
| item | `seed_packet` | OK |  | - |
| item | `sharpened_stick` | OK |  | - |
| item | `sling` | OK |  | - |
| item | `snare_wire` | OK |  | - |
| item | `spare_battery` | OK |  | - |
| item | `spare_socks` | OK |  | - |
| item | `starfall_bow` | OK |  | - |
| item | `starfall_lance` | OK |  | - |
| item | `stethoscope` | OK |  | - |
| item | `stone` | OK |  | - |
| item | `stone_knife` | OK | Flint looks feathery at 128px; fine at 26px. | - |
| item | `swat_vest` | OK |  | - |
| item | `tasting_spoon` | OK |  | - |
| item | `thermos` | OK |  | - |
| item | `tin_cup` | OK |  | - |
| item | `tinder_bundle` | silly | Read as a brain / bike helmet. | yes: bird-nest bundle of fibre with char cloth and fatwood in the cup |
| item | `torch` | OK |  | - |
| item | `tote_bag` | OK |  | - |
| item | `trail_compass` | OK |  | - |
| item | `trail_mix` | silly | A cup with a goblin face (two nuts as eyes, a mouth). | yes: a handful of peanuts, almonds and raisins (description: "the chocolate is gone") |
| item | `trail_mix_bag` | OK |  | - |
| item | `unnamed_photo` | OK |  | - |
| item | `venison_jerky` | OK |  | - |
| item | `wedding_ring` | OK |  | - |
| item | `whetstone` | inaccurate | A riveted steel box / ingot. | yes: grey two-tone stone with a worn dish |
| item | `winter_coat_button` | OK |  | - |
| item | `wood` | OK |  | - |
| item | `wool_socks` | OK |  | - |
| item | `work_gloves` | OK |  | - |
| item | `wrong_bandage` | OK |  | - |
| item | `deer_animal` | OK | Neck a touch long. No game call site draws it (calm deer uses gallowdeer_calm). | - |
| item | `UNKNOWN_ITEM` | OK | Documented fallback parcel. | - |
| monster | `bulldozer_calm` | OK |  | - |
| monster | `bulldozer_aggro` | OK |  | - |
| monster | `hushwolf_calm` | OK |  | - |
| monster | `hushwolf_aggro` | OK |  | - |
| monster | `gallowdeer_calm` | OK |  | - |
| monster | `gallowdeer_aggro` | OK |  | - |
| monster | `giant_mosquito_calm` | OK |  | - |
| monster | `giant_mosquito_aggro` | OK |  | - |
| monster | `alien_tick_calm` | OK |  | - |
| monster | `alien_tick_aggro` | OK | Engorged blob; reads at 36px only as "a bug". | - |
| monster | `mirrormoth_calm` | inaccurate | Codex: "Luna moth". Sprite was a red atlas moth (snake-head wingtips). | yes: pale-green luna moth, purple-brown leading edge, eyespots, long hindwing tails |
| monster | `mirrormoth_aggro` | OK |  | - |
| monster | `belltoad_calm` | OK |  | - |
| monster | `belltoad_aggro` | OK | Drum belly reads a bit like a pie; the "war drum" is the concept, kept. | - |
| monster | `lockpick_raccoon_calm` | OK |  | - |
| monster | `lockpick_raccoon_aggro` | OK |  | - |
| monster | `white_noise_heron_calm` | OK |  | - |
| monster | `white_noise_heron_aggro` | OK |  | - |
| monster | `hummice_calm` | OK |  | - |
| monster | `hummice_aggro` | OK |  | - |
| monster | `speedbump_turtle_calm` | inaccurate | Codex: snapping turtle. Sprite was a domed, orange-patterned box turtle/tortoise. | yes: low keeled olive shell, hooked beak, saw-toothed tail |
| monster | `speedbump_turtle_aggro` | OK |  | - |
| monster | `nightlight_catfish_calm` | OK |  | - |
| monster | `nightlight_catfish_aggro` | OK |  | - |
| monster | `nevermore_calm` | OK |  | - |
| monster | `nevermore_aggro` | OK |  | - |
| monster | `nightcourt_calm` | OK |  | - |
| monster | `nightcourt_aggro` | OK | Goggle eyes slightly goofy; still unsettling at 36px. | - |
| monster | `statickite_calm` | OK |  | - |
| monster | `statickite_aggro` | OK |  | - |
| monster | `ducks_in_a_row_calm` | OK |  | - |
| monster | `ducks_in_a_row_aggro` | OK |  | - |
| monster | `glasswing_calm` | inaccurate | Codex: dragonfly ("glasswing darter"). Sprite was an X-winged moth. | yes: top-down dragonfly, four clear veined wings, segmented abdomen, big eyes |
| monster | `glasswing_aggro` | OK |  | - |
| monster | `sunbasker_calm` | OK |  | - |
| monster | `sunbasker_aggro` | OK |  | - |
| monster | `voice_mimic_radio_calm` | OK |  | - |
| monster | `voice_mimic_radio_aggro` | OK |  | - |
| monster | `mirror_stag_calm` | OK |  | - |
| monster | `mirror_stag_aggro` | OK |  | - |
| monster | `review_drone_calm` | OK |  | - |
| monster | `review_drone_aggro` | OK |  | - |
| monster | `bright_idea_calm` | OK |  | - |
| monster | `bright_idea_aggro` | OK |  | - |
| monster | `memory_projector_calm` | OK |  | - |
| monster | `memory_projector_aggro` | OK |  | - |
| monster | `warranty_caller_calm` | OK |  | - |
| monster | `warranty_caller_aggro` | OK |  | - |
| monster | `understudy_calm` | OK |  | - |
| monster | `understudy_aggro` | OK |  | - |
| monster | `landlord_calm` | OK |  | - |
| monster | `landlord_aggro` | OK |  | - |
| monster | `heckler_calm` | OK |  | - |
| monster | `heckler_aggro` | OK | All-teeth grin is comedic, matches the concept. | - |
| monster | `paparazzo_calm` | OK |  | - |
| monster | `paparazzo_aggro` | OK |  | - |
| monster | `union_rep_calm` | OK |  | - |
| monster | `union_rep_aggro` | OK |  | - |
| monster | `moderator_calm` | OK |  | - |
| monster | `moderator_aggro` | OK |  | - |
| monster | `ad_break_calm` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `ad_break_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `algorithm_calm` | OK |  | - |
| monster | `algorithm_aggro` | OK |  | - |
| monster | `audit_calm` | OK |  | - |
| monster | `audit_aggro` | OK |  | - |
| monster | `buffering_calm` | OK |  | - |
| monster | `buffering_aggro` | OK |  | - |
| monster | `callback_calm` | OK |  | - |
| monster | `callback_aggro` | OK |  | - |
| monster | `cancellation_calm` | OK |  | - |
| monster | `cancellation_aggro` | OK |  | - |
| monster | `chorus_line_calm` | OK |  | - |
| monster | `chorus_line_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `congregation_calm` | OK |  | - |
| monster | `congregation_aggro` | OK |  | - |
| monster | `eater_calm` | OK |  | - |
| monster | `eater_aggro` | OK |  | - |
| monster | `editor_calm` | OK |  | - |
| monster | `editor_aggro` | OK |  | - |
| monster | `eulogy_calm` | OK |  | - |
| monster | `eulogy_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `finale_calm` | OK |  | - |
| monster | `finale_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `finale_crew_calm` | OK |  | - |
| monster | `finale_crew_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `finale_opening_calm` | OK |  | - |
| monster | `finale_opening_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `focus_group_calm` | OK |  | - |
| monster | `focus_group_aggro` | OK | Cartoon heads; the concept is the audience id. | - |
| monster | `gavel_calm` | OK |  | - |
| monster | `gavel_aggro` | OK |  | - |
| monster | `herald_calm` | OK |  | - |
| monster | `herald_aggro` | OK |  | - |
| monster | `influencer_calm` | OK |  | - |
| monster | `influencer_aggro` | OK |  | - |
| monster | `network_note_calm` | OK |  | - |
| monster | `network_note_aggro` | OK |  | - |
| monster | `network_tower_calm` | OK |  | - |
| monster | `network_tower_aggro` | OK |  | - |
| monster | `network_limb_calm` | OK |  | - |
| monster | `network_limb_aggro` | OK |  | - |
| monster | `network_heart_calm` | OK |  | - |
| monster | `network_heart_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `nielsen_calm` | OK |  | - |
| monster | `nielsen_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `redactor_calm` | OK |  | - |
| monster | `redactor_aggro` | OK |  | - |
| monster | `rerun_calm` | OK |  | - |
| monster | `rerun_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `reunion_calm` | OK |  | - |
| monster | `reunion_aggro` | OK |  | - |
| monster | `spoiler_calm` | OK |  | - |
| monster | `spoiler_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `spool_calm` | OK |  | - |
| monster | `spool_aggro` | OK |  | - |
| monster | `strike_calm` | OK |  | - |
| monster | `strike_aggro` | OK |  | - |
| monster | `suburb_calm` | OK |  | - |
| monster | `suburb_aggro` | OK |  | - |
| monster | `terms_of_service_calm` | OK |  | - |
| monster | `terms_of_service_aggro` | OK |  | - |
| monster | `timeslot_calm` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| monster | `timeslot_aggro` | OK | Uses SVG <text>: font-dependent, words illegible at 36px. System/broadcast thing, so the flat-icon look is on-brief. Not changed. | - |
| mythic | `shepherd_of_the_dead` | OK |  | - |
| mythic | `apex_predator` | OK |  | - |
| mythic | `living_garden` | OK |  | - |
| mythic | `unkillable` | OK |  | - |
| mythic | `one_person_army` | OK |  | - |
| mythic | `all_seeing` | OK |  | - |
| mythic | `market_god` | OK |  | - |
| mythic | `farstrider` | OK |  | - |
| mythic | `the_between` | OK |  | - |
| mythic | `undying_ward` | OK |  | - |
| mythic | `voice_of_the_relay` | OK |  | - |
