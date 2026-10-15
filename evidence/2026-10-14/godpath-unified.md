# God paths unified: one ladder, 10 gods, 20 subclasses (2026-10-14)

Law: "Gods are rough representatives of what starts out as jobs and classes, or
playstyles." / "Each god path can have some intended subclasses though that fit
the build." / roster approved: "Good calls! Continue all."
(`docs/godpath/STEVE-ANSWERS.md`)

## What changed

- **One source of truth.** `src/data/godpaths.json` is the god layer: 10 paths,
  2 subclasses each (payoff, enablers, god tie-in), one god per path with ONE
  verb, its weakness, cost, ceremony text and scale lines.
  `src/data/godhood.json` is deleted; `src/js/godhood.js` derives its capstones
  from godpaths.json plus the `path`/`subclass` tag on abilities.json.
- **Every magic ability** (94) has exactly one `path` + `subclass`; 7 carry a
  secondary `alsoPath`. The old `paths` array is gone (readers: buildarounds,
  contests gift steering, synergy-witness line, app ability bar/card, capable
  bot, villager-build features). Skills keep a `path` (build-around assembly)
  and never a subclass.
- **27 new magic abilities** (data first; 15 small engine verbs in
  `src/js/godpath.js`, registered on the existing ability-action table).
- **Class recognition** (`recognizeClass`, same function for player and
  villagers): 3+ magic abilities of one path, strictly leading, names
  "<Subclass> of <God>" once (and again if the build shifts). Stored on
  `scholar.godpath` / `village.npcGodpath[vid]`; follows the person through
  the mantle. One line on the character sheet, only once named.
- **Offers lean to your path**: level-up sheets (player and villager) and
  contest gift sheets carry >=1 offer of the recognised path (its subclass
  payoff first, when missing), an emerging lean (2+ leading) before that, and
  distinct roles where the next few kit entries allow. The villager/bot brain
  reads the lean through `villager-build.js buildPathLean` (the one hook in
  `Game.buildScore`).
- **Ascension** = recognised class on the path + subclass payoff + 4 magic
  abilities of the path + the deed (day 80+ and a discovered synergy that uses
  a path ability; the Relay office is the Socialite's alternative deed). The
  capstone item is the System's gift at the ceremony, not a gate. A dawn check
  re-tests every day (the day-80 gate opens on a day). Same model for
  villagers. The Table never reads any of it.
- Bugs found and fixed on the way: player ascensions never reached telemetry
  (pantheon called its closure); a finished build re-ascended every dawn
  (`recognized[id] = 0` read as false); `crowd_favorite` read fans nothing
  wrote (Live Broadcast now writes them; Cheese Wheel scales with them).

## Path -> god mapping (and why)

| Path | God | Verb | Why |
|---|---|---|---|
| brawler | The One-Person Army | Turn the Pain | Every wound comes back at once; its pool was already the brawler kit |
| shieldbearer | The Undying Ward | Take the Wound | Redirecting an ally's hit is the bulwark verb (its old pool was medic skills) |
| hunter | The Apex Predator | Choose the Terms | Ambush, range, ground: the hunter's whole game |
| caregiver | The Shepherd of the Dead | Raise Echo | The Keeper (keepsakes, the dead) is its seed; healers keep allies up long enough |
| drifter | The Between | Phase Out | Untouchable |
| explorer | The All-Seeing | No Lies | Foresight turned on people: the Seer's apex |
| socialite | The Voice of the Relay | Speak and Be Heard | The voice every ally hears; showrunners broadcast, demagogues command |
| survivalist | The Unkillable | Phoenix | Furnaces cheat death with food, the undying outright |
| miser | The Market God | Name Your Price | Hoarders bank wealth, dealers spend it |
| forager | The Living Garden | Feed the Multitude | Garden and feast both end at an army that eats |

**The leftover: Farstrider (Walk the Horizon) is retired**, folded into
explorer/cartographer. Map-folding is the Cartographer's fantasy, not a second
explorer god, and "one verb per god" rules out stacking it on the All-Seeing.
Kept under `godpaths.json retired.farstrider` so old saves that ascended as a
Farstrider keep ceremony text, mythic sprite and verb; never newly reachable.
Old saves: every other god keeps its id, so recognized/active lists and verbs
work unchanged.

## Path -> subclass -> abilities (* = new)

| Path | Subclass | Payoff | Enablers | God tie-in | Other |
|---|---|---|---|---|---|
| brawler | Berserker | blood_frenzy | rage, blood_magic, cannibal_frenzy | adrenaline_control | - |
| brawler | Juggernaut | trade_of_blows | unbreakable, adrenaline_surge | cornered_rat | - |
| shieldbearer | Bulwark | retribution | chitin_skin, leech | aegis_link* | - |
| shieldbearer | Warden | landslide* | freeze_tag, gravity_well* | raise_earth* | - |
| hunter | Stalker | trophy_room | static_toss, bloodhound, lucky_rock | night_eyes | - |
| hunter | Beastmaster | pack_hunt* | bird_strike, bird_whisperer | beast_calm | - |
| caregiver | Healer | battlefield_grace | the_touch, purify, mending_hands* | lifeline* | - |
| caregiver | Keeper | keepers_oath* | mourners_bond*, translator | last_rites* | - |
| drifter | Phantom | nowhere_man | blink*, hollow_bones, second_skin | time_skip | - |
| drifter | Trickster | misdirection* | turncoat, pocket_sand | switcheroo* | - |
| explorer | Seer | prophecy* | foresight*, eyes_in_back | third_eye | - |
| explorer | Cartographer | cartographers_eye | echo_location, dowsing, water_breathing | hive_mind | - |
| socialite | Showrunner | crowd_favorite | scream_cheese, cheese_wheel | live_broadcast* | - |
| socialite | Demagogue | the_crowd_moves* | fear_aura, rally_aura* | war_cry | - |
| survivalist | Furnace | feast_engine | deep_reserves, extra_stomach, stoke* | ember_heart* | iron_stomach, cold_blooded, fusion_reactor |
| survivalist | Undying | back_from_the_brink* | second_wind, survivor, molt | phoenix_clause | symbiote |
| miser | Hoarder | hoarders_interest | hoarder, squirrel_friend, taste_vision | coin_guard* | - |
| miser | Dealer | sweetener* | haggle*, pact | bribe* | - |
| forager | Gardener | cornucopia | green_thumb, green_whisper, rain_dancer | photosynthesis | - |
| forager | Feaster | harvest_table* | loud_chewer, pyrokinesis, beard_moss | long_table* | - |

alsoPath: blood_magic, cannibal_frenzy (+survivalist), pocket_sand, war_cry
(+brawler), echo_location (+hunter), leech (+caregiver), purify (+forager).
Kit moves: none. The 27 new abilities sit after each kit's original entries.

## New abilities (one line each)

- aegis_link (shieldbearer/bulwark, tie): 40 kcal, 3 rounds: an ally's hits land on you instead.
- raise_earth (shieldbearer/warden, tie): 60 kcal, a 3-tile wall rises toward the nearest monster; blocks everyone 3 rounds.
- gravity_well (shieldbearer/warden): 50 kcal, drags monsters within 4 two tiles toward you; arrivals hesitate.
- landslide (shieldbearer/warden, payoff): 80 kcal, hurls monsters within 2 two tiles away; slams = 14-22 + stun.
- pack_hunt (hunter/beastmaster, payoff): 70 kcal, pins a monster 2 rounds and harries it 3 (6 if birds are on it).
- mending_hands (caregiver/healer): 60 kcal, heal you or an adjacent ally 12-18 (counts for Battlefield Grace).
- lifeline (caregiver/healer, tie): once per fight a falling ally holds at 1 HP.
- keepers_oath (caregiver/keeper, payoff): worn keepsakes act one level higher.
- mourners_bond (caregiver/keeper): worn keepsakes grow twice as fast.
- last_rites (caregiver/keeper, tie): an ally falls -> their echo absorbs your next 2 hits, worn keepsakes +2 bond.
- blink (drifter/phantom): 40 kcal, no turn, teleport up to 3 tiles, twice per fight.
- switcheroo (drifter/trickster, tie): 50 kcal, swap places with a monster; its wind-up fizzles.
- misdirection (drifter/trickster, payoff): +50% strikes into blinded/turned/hesitating/rooted monsters.
- foresight (explorer/seer): 40 kcal, no turn, every monster's intent read aloud for 3 rounds.
- prophecy (explorer/seer, payoff): +35% dodge while Foresight runs.
- live_broadcast (socialite/showrunner, tie): 50 kcal, +2 fans, allies emboldened 2 rounds (x Crowd Favorite).
- rally_aura (socialite/demagogue): allies within 3 start fights emboldened.
- the_crowd_moves (socialite/demagogue, payoff): 80 kcal, every ally takes an extra turn now.
- stoke (survivalist/furnace): 150 kcal, no turn, next 2 strikes +60%.
- ember_heart (survivalist/furnace, tie): once per fight, death -> burn 600 kcal, stand at 20% HP.
- back_from_the_brink (survivalist/undying, payoff): after any cheat-death, next 3 strikes +50%.
- coin_guard (miser/hoarder, tie): 80 kcal, no turn, 3 coins each absorb a hit (up to 15).
- haggle (miser/dealer): traders 25% cheaper, trade routes pay 25% more.
- bribe (miser/dealer, tie): 150 kcal, a monster backs off 2 tiles, hesitates 2 (not titans).
- sweetener (miser/dealer, payoff): bribed monsters turn on the nearest other monster for 2 rounds.
- harvest_table (forager/feaster, payoff): your feasts arm the surge without devotion (x1.3), guests +1 trust.
- long_table (forager/feaster, tie): camp, 300 kcal of your food, once a day: every villager's hunger -40.

"Does this let you skip dinner?" No: every active costs kcal, every passive
has a metabolic cost; Long Table spends your food on others.

## Measurement (capable bot, 16 seeds x 150 days)

Before = origin/master dc8e1cfe (parity merged, old god layer). After = this
branch merged with it. Full rows: `godpath-unified-sweep.json`.

| | won | sat% | inv% | medD | player class% (med day) | villagers classed | asc player | asc villager | new-verb uses |
|---|---|---|---|---|---|---|---|---|---|
| before | 6 | 38 | 69 | 91 | - | - | 6 | 12 | 0 |
| after | 6 | 38 | 56 | 94 | 75 (52) | 20 of ~148 granted (14%) | 0 | 0 | 13 |

Paths named (after): hunter/stalker 11, forager/feaster 13, forager/gardener
12, hunter/beastmaster 2, socialite/showrunner 1, brawler/juggernaut 1. The
early kit entries decide which paths appear; 6 of 20 subclasses showed up.

**Ascension levers** (same 16 seeds, after): all gates on 0/0; no deed 1/1;
no payoff 0/0; neither 3 player / 8 villager. Both gates bind; post-parity
builds are small (2-6 abilities, the mantle starts the successor from their
own) and payoffs/new abilities sit late in the kits. The gates are data
(`godpaths.json rules.capstone.requirePayoff / requireDeed / abilitiesNeeded`).

Earlier, pre-parity (8-16 seeds): placing the new abilities mid-kit cost wins
(3/16 vs 5/16 at the kit ends) because villagers took verbs they cannot use.
Hence the kit-end placement.

## Not done / known

- Villagers can't USE the new active verbs (villager ability use is id-based in
  game.js tbVillagerAbility); their passive hooks read the player only. Same
  as most existing abilities.
- god.scale lines (party/titan/contest/army) are design intent; only the verb
  is wired (as before).
- Walk the Horizon is not reachable through the Cartographer yet (retired data
  kept for old saves).
