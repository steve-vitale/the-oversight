# Draft — Abilities vs Skills, and the Table's Waiting Cost

*2026-10-14 · for Steve's review · nothing here is built yet.*
*Source quotes: `docs/godpath/STEVE-ANSWERS.md` (2026-10-14 evening).*

---

## Part 1 — "Everything in its logical categorization"

> "Things acquired from events and other meaningful experiences, knowledge
> learned etc should be typically ending up in skills, unless it fits the
> magic power theme. There should be maybe 8 natural level ups plus a few
> other gifts or events etc that compete for those 6 slots."

### How it works today (verified in code)

**Skills** live in `knowledge.json`:
- 48 skills across 10 domains, levels 1–3, no cap.
- They show in the 📖 Skills panel under Abilities. The panel draws 4 level pips; the data only has 3.
- They come from:
  - your background
  - practice (night hunting, reading people, examining)
  - theorizing with villagers
  - books
  - flashbacks
  - lucky "insight" rolls

**Abilities have no natural level-ups.** Every new ability is a gift or a deed reward:

| Source | Choice? | How often |
|---|---|---|
| Spawn knack | 1 of 3 | once |
| Day-7 arrival | 1 of 3 | once |
| **Audience trial** | 1 of 3 (since today) | **repeats every ~5–8 days from day 10: the main source** |
| Contest prize | 1 of 3 | ~1 per run |
| Aid quest | 1 of 2 | 0–2 |
| Purify / fusion reactor | reactive offer | rare |
| Pact with Static | random | rare |
| Trial deeds (9 one-off counters) | automatic | several |
| Practice deeds (6 counters) | automatic | 1–2 |

- **Offers outrun the 6 slots.** Measured: 5.3/6 slots held on average, with "slots full" refusals.
- **Your model already exists, but for villagers only.** They have four XP tracks (combat, field, social, craft) with level-ups at 3/8/16/32/64 XP, each granting an ability from a themed kit, capped at 6.

### Category check: the 118 abilities

| Category | Count | Meaning |
|---|---|---|
| **Magic** (System powers) | 51 | Clearly magic, e.g. photosynthesis, time_skip, pyrokinesis, purify, phoenix_clause, and the build-around payoffs |
| **Human** (belongs in skills) | 41 | A learnable human competence |
| **Ambiguous** | 26 | Could go either way. You decide |

**Human abilities that duplicate an existing skill** (merge candidates):

| Ability | Existing skill |
|---|---|
| herbal_remedy | herbal_medicine (your own example of a human skill) |
| tracker, game_sense, blood_trail | track_read |
| mediator, peacemaker | mediate |
| preservation_instinct | preserve_food |
| animal_ken | animal_behavior |
| triage, field_medicine | wound_care |
| lie_detector, evidence_board | read_people |

**Other human abilities:**
- **Body and fighting:** steady_hands, patient_aim, field_dressing, brawler_instinct, swimmer, stalk, ambush, haymaker, soft_step, intimidating_presence, dead_aim, draw_fire, bodyguard, shield_wall, rally, shoulder_check, hogtie, come_get_some, tripwire, scarecrow
- **Social and stealth:** silver_tongue, pathfinder (Tireless Stride), diplomat, generous, scrounger, gossip_network, thief, poisoner, grave_robber

**Ambiguous (needs your call):**
- **Body and senses:** eagle_eye, iron_stomach, adrenaline_surge, adrenaline_control, night_eyes, survivor
- **Combat:** trade_of_blows, unbreakable, cornered_rat, rage, war_cry, leech
- **Traits and gear:** open_book, camp_cook, hoarder, second_skin, wanderer, compost_king, loud_chewer, trophy_room, turncoat
- **Knack duplicates:** still_hands, Waywise, night_eyes, iron_gut, storm_ear

**Other canon breaks found:**
- **Occupations hand out System abilities as background** (green_thumb, diplomat, tracker, swimmer…). By your rule, occupations should give skills only.
- **Two ids appear twice** (`night_eyes`, `pathfinder`), once as a System ability and once as a knack, so the game picks whichever comes first.
- **Villager kits mix magic** (purify, fusion_reactor) **with human crafts.**

### Proposed model

1. **Abilities = magic only.** Move the 41 human abilities into skills: merge the duplicates above, and keep their mechanics as skill-level effects. Settle the 26 ambiguous ones with you. That leaves roughly 51–65 magic abilities.
2. **About 8 natural level-ups from related XP.** Give the player the villager system. Each track is fed by experience the game already counts:

   | Track | Fed by |
   |---|---|
   | Fight | kills, fights survived |
   | Field | foraging, hunting, travel |
   | Bond | talk, teaching, protecting |
   | Craft | cooking, building, preserving |
   | Strange | System contact, contests, integration |

   Thresholds would be tuned so a full run crosses about 8 of them. Each crossing offers **1 of 3 magic abilities from that track's kit**. What you do shapes what you're offered.
3. **A few gifts compete too:** spawn knack, day-7 arrival, contest prize, purify/fusion (reactive), the pact (the gamble).
   - **Audience trials stop gifting abilities**, keeping the integration and a skill or knowledge reward.
   - **Trial and practice deeds become XP** for their track instead of fixed grants.
4. **Occupations grant skills only.**

The result: about 8 earned level-ups plus 3–5 gifts compete for 6 slots, and every human competence lives in skills.

---

## Part 2 — The Table: waiting has a cost, and a key for the truly powerful

> "waiting should have a cost- but also an opportunity for the truly
> powerful. Waves get truly ridiculous … an Easter egg monster … on the
> scale of titan class but even bigger … fought across the entire map …
> a key to unlock the best ending for humans at the table. Should be almost
> impossible to get."

This also answers "low drama / farmable": once the seat is open, every day
you wait gets harder.

### The cost: Overtime

Once the Table is set, the System puts the season into **Overtime**:
- **Each week unseated raises a tier.**
- **Waves escalate past 5:** reruns of earlier monsters with stacking modifiers. Bigger packs, the worst signature mechanics combined.
- **Raids sharpen** and pantry pressure rises.

The live seat price can also *drop* (deaths, lost links). So stalling for a better ending trades directly against survival.

### The key: a map-spanning Easter egg

**Trigger.** At a milestone, the most powerful run unlocks the encounter. For example: survive Overtime tier N, *and* have slain all three titans.

**The entity.** Working name: **The Network** — the broadcast itself, given a body:
- **Bigger than titan class.**
- **It occupies the whole map.** Each region node holds a piece of it (towers, limbs, a heart).
- **It has to be fought across the entire map.** This extends the finale campaign from 3 nodes to every node, using the existing march, muster, upkeep and "the dead stay dead" rules.
- **Built for broken builds:** coalition rules apply, but only a game-breaking build can carry the final node.

**The reward.** Defeating it is the **key to the best human ending**: a new top tier at the Table, still played as a scenario and still losable.

**Rarity target:** almost impossible. Expect well under 1% of strong runs. The sim's new milestone telemetry can measure that once the bots can actually play.

---

## Questions for Steve

1. **Ambiguous abilities:** magic or skill? (list above)
2. **Tracks:** are Fight / Field / Bond / Craft / Strange the right five? Should all five feed the ~8 level-ups?
3. **Audience trials:** stop gifting abilities, or keep one ability gift per run?
4. **Overtime:** weekly tiers, or tied to something you do?
5. **The key's trigger:** Overtime tier + all three titans slain? Something else?
6. **The best ending:** what does humanity win that the other endings don't?

---

## Defaults adopted (2026-10-14, Steve: "Okay address all gaps.")

Steve didn't pick answers, so these are Claude's defaults. **Any of them can
be overturned**; each is isolated in data or one function.

1. **Ambiguous → magic** (reality-bending, or a build-around payoff):
   adrenaline_surge, adrenaline_control, iron_stomach (+ knack iron_gut as its
   variant), unbreakable, trade_of_blows, cornered_rat, rage, war_cry, leech,
   turncoat, trophy_room, survivor, second_skin, hoarder, loud_chewer,
   night_eyes (System + knack, merged).
   **Ambiguous → skill** (sharpened human competence): eagle_eye, open_book,
   camp_cook, compost_king, wanderer, still_hands (→ steady_hands),
   Waywise (→ pathfinder), storm_ear (→ weather_read).
2. **Tracks:** Fight / Field / Bond / Craft / Strange, tuned to ~8 level-ups
   per full run; each crossing is pick 1 of 3 magic abilities from the track's kit.
3. **Audience trials** teach a skill (plus integration), never an ability.
   **Trial/practice deeds** feed their track's XP; the human ones now teach the skill.
4. **Overtime:** weekly tiers once the Table is set and unseated.
5. **The key:** Overtime tier ≥ 3 AND all three titans slain → **The Network**
   (map-spanning, every region node a piece of it).
6. **Best ending: The Taken come home.** Half the adults were taken on day zero
   and the children sit in stasis pods (`docs/KIN.md`). The key adds that
   outcome to whichever Table path you play; it's still losable.
