# Ability Gap Analysis — what's missing, what doesn't earn its place

*2026-10-14 · Steve: "What ability types or classes are missing? Don't feel
constrained by what we started with. If something needs to change, tell me
about it. Not all abilities are equal but each should earn its place."*

Scope: the ~67 **magic** abilities left after today's lane split (human
competences moved to skills).

**Caveat:** sim bots have never used abilities, so this is a design reading of
the code and data, not usage data. The capable bot will add the numbers.

---

## 1. Coverage map

| Job | Have | Verdict |
|---|---|---|
| **Melee damage multipliers** | rage, adrenaline_control, feast_engine, blood_frenzy, trade_of_blows, cornered_rat, trophy_room, retribution | **Overcrowded.** Eight ways to "hit harder", all melee |
| Ranged damage | static_toss, cheese_wheel, bird_strike (new, untested) | Thin |
| **Area damage** | none (scream stuns, retribution hits adjacent only) | **Missing** |
| Control (status) | pocket_sand, scream_cheese, freeze_tag, turncoat, fear_aura, war_cry | OK |
| **Board-changing** | none | **Missing.** Your rule: "control must change the board, not the numbers" |
| **Mobility in combat** | nowhere_man (passive dodge only) | **Missing:** no blink, swap or flight |
| Defense / cheat death | chitin_skin, unbreakable, adrenaline_surge, second_wind, phoenix_clause, survivor, leech | Good |
| **Healing / revival** | the_touch (small passive), molt (self, weekly), purify (poison only) | **Thin.** Battlefield Grace needs heals the magic lane doesn't give |
| **Summons / companions** | bird_strike (one-shot) | **Missing** |
| Detection | bird_whisperer, third_eye, beast_calm, eyes_in_back, night_eyes, bloodhound | **Overcrowded.** Three share one stat (`monster.detect_chance`) |
| **In-fight foresight** | none (telegraphs come only from codex knowledge) | **Missing** |
| Food production | photosynthesis, green_thumb, cornucopia, hoarders_interest, squirrel_friend, green_whisper, rain_dancer, dowsing | Good |
| Metabolism / storage | extra_stomach, deep_reserves, cold_blooded, symbiote, iron_stomach, fusion_reactor, blood_magic | Good |
| **Spend food for big effects** | blood_magic (the reverse: HP into kcal) | **Missing**, and it's the core thesis |
| **The show / audience** | crowd_favorite (unwired) | **Missing**, and it's the core fiction |
| **Party / village scale** | none | **Missing.** Every ability is personal |
| **Legacy / the mantle** | phoenix_clause (burns a villager) | **Missing** |
| **Breaking monster signature mechanics** | none | **Missing.** Waves 3–5 have no counters at all |
| Exploration | hive_mind, echo_location, water_breathing, hollow_bones, second_skin, time_skip | Good |
| System / alien | translator, purify, relay set | OK |

---

## 2. Missing classes, in order of importance

### 1. Feast magic: spend food for power

> "Abilities should be stronger, and they were always meant to be powered by
> food. So very food secure groups got a lot more uses of their abilities, or
> much more impact." — Steve

Today food only *pays* for abilities (kcal costs, overcharge ×1.25). Nothing
lets a food-rich village **convert surplus into big effects**.

- **What's missing:** abilities that burn banked kcal or pantry stores for
  outsized results. Examples:
  - a **Furnace Shield** that absorbs damage by burning 50 kcal per hit
  - a **Gorge**: eat a full meal mid-fight to fully heal and overcharge
  - a **Ritual Feast**: spend 5,000 pantry kcal to bless the whole village for a week
- **Why it earns its place:** it makes the economy and the build engine one
  system, and gives food-secure players something to *do* with surplus. It is
  the mechanical heart of THE HOSTS ending.

### 2. Broadcast magic: play the show

The game *is* a televised contest, but no ability touches ratings,
sponsors, fans or the edit (crowd_favorite exists but isn't wired).

- **What's missing:** a System-flavored class that manipulates the
  broadcast. Examples:
  - **Cut to Commercial:** skip a monster's turn
  - **Sponsor Drop:** a care package mid-fight
  - **Fan Favorite:** the audience saves you once
  - **Rewrite the Episode:** re-roll a contest phase
- **Why it earns its place:** it connects abilities to contests, viewership,
  the Beloved path, the galactic cast, and the Network finale. It's also the
  natural counter to wave 3–5 monsters (#6), who are TV tropes.

### 3. Board-shaping: terrain and forced movement

> "control must change the board, not the numbers" — Steve

The 9×9 grid, terrain and telegraphs already exist, but no ability *changes
the board*.

- **What's missing:** raise a wall, open a pit, set a burning tile, pull or
  push a monster into a telegraph, swap places with an ally.
- **Why it earns its place:** it makes positioning a real decision in 2–8
  round fights and gives control builds teeth.

### 4. Party and village-scale magic

Every magic ability is personal, but you specified party, titan and army
scales.

- **What's missing:** auras (allies within 3 tiles share an effect), lending a
  power to a villager for a day, bound pairs (shared HP or shared turns), and
  village-wide blessings.
- **Why it earns its place:** party fights, titan coalitions and the Network
  campaign currently have no build expression. It also makes the synced
  villager progression matter to the player.

### 5. Legacy magic: the mantle

Runs are about 40 hours, and the bearer dies and the mantle passes. Nothing in
the ability system cares.

- **What's missing:** abilities that survive succession, or grow from it.
  Examples:
  - an **Echo** of the last bearer (one of their abilities, weakened)
  - a **Keepsake-bound** power that only works while you carry the dead's
    keepsake
  - **Ancestor's Warning** (the dead bearer's codex knowledge resurfaces)
- **Why it earns its place:** it gives keepsakes and the dead ledger
  mechanical weight, the "grief as fuel" idea that's currently only text.

### 6. Format-breaking: counters to signature monsters

The wave 3–5 monsters (Gavel, Congregation, Strike, Influencer, Audit,
Reunion…) are TV-trope bosses, and their 22 counter verbs are contextual
buttons. No ability lets a build *specialise* in beating them.

- **What's missing:** abilities that nullify or exploit a signature mechanic
  class (mute, deny an audience, break the script).
- **Why it earns its place:** waves 3–5 are where builds should shine. It also
  overlaps with #2.

### 7. Companions and summons

- **What's missing:** a lasting companion: a bound animal, a called echo, or a
  swarm. Shepherd of the Dead's Raise Echo exists only as a godhood verb.

### 8. Real magic healing and in-fight foresight

- **Healing:** a heal or regeneration that isn't the medicine skills.
- **Foresight:** see a monster's next telegraph before you have the codex
  knowledge for it.

---

## 3. What doesn't earn its place yet (change, merge or cut)

| Ability | Problem | Proposed change |
|---|---|---|
| bird_whisperer, third_eye, beast_calm | Three abilities, one stat (`monster.detect_chance`) | **Differentiate:**<br>• bird_whisperer → birds *scout* (reveal threats on adjacent map tiles)<br>• third_eye → *in-fight foresight* (fills gap #8)<br>• beast_calm → animals don't flee (hunting) |
| iron_stomach, symbiote | Overlap on poison | symbiote → **food engine** (eats rot, returns kcal); iron_stomach keeps poison |
| 8 melee multipliers | Same job, different trigger | Keep, but **move two to non-melee** (e.g. trophy_room → applies to ranged; retribution → area) so damage builds diverge |
| lucky_rock | +5% hunt: underpowered by design ("underpowered" tier) | Make it the **luck engine**: luck stacks with each day you keep it |
| beard_moss, rain_dancer, loud_chewer, squirrel_friend | Flavor with tiny effects | Fine as **"wacky" gifts** (the System's sense of humor) **only if** each has one real use: e.g. beard_moss = never fail a fire in rain; rain_dancer = also stops a raid in a storm |
| taste_vision | Same stat as eagle_eye (now the ruins skill) | Make it taste **poison/hidden lies** instead |
| crowd_favorite, cornucopia | Unwired payoffs (audit) | Wire them (crowd_favorite becomes the anchor of Broadcast magic) |
| battlefield_grace | Its free action doesn't exist | Needs magic healing (#8) plus a free-action mechanic, or rewrite |
| pact | Random, no choice, rare | Keep. It's the deliberate gamble |

---

## 4. Structural changes this implies

1. **A fifth track.** The villager model has four tracks: combat, field,
   social, craft. Broadcast, legacy and System magic don't fit any of them.
   - **Proposal:** add **Strange**, fed by System contact (contests, alien
     encounters, integration, deaths in the family), for both player and
     villagers.
2. **Tag abilities by job, not just track** (`role`: damage, area, control,
   board, mobility, defense, heal, summon, sense, economy, broadcast, legacy,
   party). Then the game can make sure a level-up's 1-of-3 offers *different
   jobs*, so picks are real decisions rather than three variants of "hit
   harder".
3. **Rough target for a healthy pool:** about 80–90 magic abilities, 15–18 per
   track, each track covering at least 5 jobs.

---

## Recommended order

Each class added in a small batch (4–6 abilities), playtested, then the next:

1. **Feast magic** (thesis)
2. **Board-shaping** (your control quote)
3. **Party-scale** (needed for titans and the Network)
4. **Broadcast**
5. **Legacy**
6. **Format-breaking**

Run §3's cleanup alongside each batch.

---

## 5. Reoriented: classes are god-path subclasses (Steve 2026-10-14)

> "The classes are supposed to be oriented around the god paths as icing on
> the cake. Each god path can have some intended subclasses though that fit
> the build."

The missing classes above aren't free-floating categories. Each becomes a
**subclass of the god path it fits**. A god path is the build's identity and
destination; a subclass is one flavor of reaching it.

**Draft roster.** It uses the 10 paths already tagged in the data
(`godpaths.json` / ability `paths`); confirm with Steve.

| God path | Track(s) | Subclass A | Subclass B |
|---|---|---|---|
| Brawler | combat | Berserker (rage, blood) | Juggernaut (trade blows, unbreakable) |
| Shieldbearer | combat, social | Bulwark (guard, redirect) | **Warden (board-shaping: walls, pits)** |
| Hunter | field, combat | Stalker (marks, precision) | **Beastmaster (companions)** |
| Caregiver | craft, social | **Healer (magic healing)** | **Keeper (legacy: keepsakes, the dead, the mantle)** |
| Drifter | field, strange | **Phantom (blink, evasion)** | Trickster (swap, turncoat) |
| Explorer | field, strange | **Seer (foresight)** | Cartographer (map, terrain) |
| Socialite | social, strange | **Showrunner (broadcast, format-breaking)** | **Demagogue (party auras)** |
| Survivalist | craft, combat | **Furnace (feast magic: spend kcal)** | Undying (cheat death) |
| Miser | craft, social | Hoarder (stockpile engine) | Dealer (Market God trades) |
| Forager | field, craft | Gardener (yield) | **Feaster (village ritual feasts)** |

**Bold** = the missing classes from §2, now placed where they serve a build.

**Consequences:**
- New abilities are designed **per god path**, to complete that path's subclasses.
- Every subclass needs:
  - one payoff
  - two or three enablers
  - one tie-in to the path's god capstone
- The queued Feast/Board batch is **re-scoped**: Furnace (Survivalist),
  Feaster (Forager) and Warden (Shieldbearer) are built *as those subclasses*,
  alongside the god-path redesign. They are not built standalone.
