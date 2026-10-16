# The Coherence Spine — how every progression feature fits

*2026-10-14. Built from Steve's direct words (`docs/godpath/STEVE-ANSWERS.md`).*

> "We need all these features coherent. Gods are rough representatives of
> what starts out as jobs and classes, or playstyles."
>
> "Sentimental items need to compete with accessory gear for the extra slots
> available. The gear must both contribute to some bigger structure in the
> game ... but each must grow into evolving levels of what act like skills or
> abilities. They start off doing nothing, they start doing a little, but they
> displace gear or accessories that would typically give other actions or
> boosts."

---

## The ladder: Job → Playstyle → Class → God → Table

| Stage | What it is | Where it lives | How you move up |
|---|---|---|---|
| **1. Job** | Who you were before: your occupation | `characterGen` occupations | Gives **human skills** and a **starting lean** in the tracks (a nurse starts with craft and social XP) |
| **2. Playstyle** | What you actually do | 5 **tracks**, shared by player and villagers: combat, field, social, craft, strange | Deeds give track XP. About 8 natural level-ups per run, each a pick 1 of 3 **magic** abilities from that track's kit, plus a few gifts, all competing for **6 slots** |
| **3. Class** | The build your abilities add up to | The **god path** each ability belongs to (10 paths), plus a **subclass** (2 per path) | Recognised when your kit clearly leans one way. The System names it, diegetically |
| **4. God** | The apex of that class | The path's capstone | Complete the class, payoff, path kit and fitting deed, day 80+; five authored deeds, five legacy proxies remain |
| **5. Table** | How the run ends | Table path × god/class × light/dark; THE HOSTS with the key | Enter from Haven at day 90+; still losable |

**Rules that hold the ladder together:**
- **Abilities = magic only.** Human competence = skills.
- **One source of truth for builds:** every magic ability carries `track`
  (where it comes from), `path` (which god it serves) and `subclass` (which
  flavor). No separate godhood pools or parallel path lists.
- **Gods are the icing.** Subclasses exist to give each god path two ways to
  get there. New ability classes are designed per god path, never
  free-floating.
- **Villagers climb the same ladder** with the same tracks, kits, XP scale and
  1-of-3 sheets; they choose with the build brain (`buildScore`, from what they
  know and the gear they hold), swap or keep like the player, and when the
  bearer dies the successor keeps their own build (parity 2026-10-14,
  `evidence/2026-10-14/parity.md`).

---

Implementation note (2026-10-15): the Relay post belongs to its actual person.
Death vacates it and the next bearer must explicitly claim or accept it. The
network itself stays live. Current Relay service is the Voice's authored deed;
class age and a predecessor's work cannot substitute for it. See the dated
relay-deed and relay-office audits for the two separate measured changes.

## Gear: three lanes, one competition

| Lane | Slots | Job | Arc |
|---|---|---|---|
| **Weapons & armor** | melee, ranged, 5 body slots | Magnitude: damage and mitigation | Strong early. Fades by waves 4–5 by design: power moves to abilities |
| **Accessories** | **acc1–acc4** | **Actions and boosts, right now** (horns, belts, amulets, translators) | Mostly found or earned mid-to-late (tier 3–4): powerful the day you get them |
| **Keepsakes** (sentimental) | **acc1–acc4: the same four slots** | **Grow** from nothing into evolving levels that act like skills and abilities | Weak today, yours forever. A keepsake slot is an accessory you're not wearing |

**The competition is the point.** Four slots. Wear the horn that calls wild
allies *now*, or keep wearing your daughter's drawing because of what it is
becoming.

---

## Keepsakes: the growth model

1. **Must be worn to grow.** Bond accrues only while equipped in an
   accessory slot: +1 per day, +3 at story moments. In the pack a keepsake is
   dormant. It keeps its memory but doesn't grow.
2. **Levels:**

   | Bond | Level | What it does |
   |---|---|---|
   | <10 | 0 | Nothing mechanical. Just a memory |
   | 10 | 1 | A small passive, its revealed effect made real (e.g. *resolve* = a floor under trauma) |
   | 25 | 2 | An **action**, usable like a skill or ability, built from its pool:<br>• **Resolve → Steady:** clear fear or stun on yourself once per fight<br>• **Anchor → Hold:** can't be forced to move, and your flee can't be cut off<br>• **Quiet luck → Lucky Break:** turn one miss into a hit, or re-roll one contest roll |
   | 50 | 3 | **Evolution:** pick 1 of 3 enhancements, or its secret evolution (5 keepsakes have one) |

3. **The bigger structure: the thread home.**
   - Keepsakes belong to your real relatives.
   - When that relative was **Taken** on day zero, the keepsake's place and
     name reveals become **clues**: map markers, and a "seek your kin" thread.
   - In **THE HOSTS**, the people your bonded keepsakes belong to **come home
     by name**, in your epilogue.
4. **One god path amplifies them:** the Caregiver's **Keeper** subclass turns
   keepsakes and the dead into power. Everyone else gets the story and the
   growth, but not the amplification.
5. **Channeling stays.** Spending a keepsake's day relieves trauma, trains an
   ability, or arms the feast surge.

---

## Build order

| Batch | Status | What |
|---|---|---|
| Ability lanes | in progress | Human abilities → skills; magic abilities tagged |
| Unified tracks | done (2026-10-14, `evidence/2026-10-14/unified-tracks.md`) | Player and villagers share one track system; **occupations seed the starting lean** |
| Keepsake growth | starting now | Accessory-slot keepsakes, worn-only bond, levels 0–3, pool actions, kin clues |
| God-path redesign | after tracks | Every magic ability gets `path` and `subclass`; capstones; ascension; subclasses filled per path |
| Table endings | after the redesign | Table path × class/god × light/dark |
| World regions | engine now; content by Muse in waves | 20 world regions, random landing, origin vs landing knowledge, kin across the world, expeditions at the global stage (`docs/WORLD-REGIONS.md`) |
