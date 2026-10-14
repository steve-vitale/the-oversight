# God-Path System — Design Proposal

*2026-10-14 · design document, not code · for Steve*

> **Source note.** The brief (`opus-brief-ability-system.md`) is not in the
> repo on any branch, so this proposal works from the task summary plus the
> live repo. Counts in the repo differ from the brief:
> `src/data/abilities.json` = **99** abilities (+9 relay comm abilities in
> `relay-ext.js`, +26 evolutions), `src/data/synergies.json` = **53**
> synergies, `src/data/items.json` = **215** items. Where this doc says "every
> ability", it means all of them, however the brief counts them.
>
> **Framing from Steve (this session):** the ten paths in
> `docs/ENDGAME-BUILDS.md` are *general directions, not law*. The late game is
> barely playtested. This design therefore favours **derived rules over
> authored recipes**, few numbers to tune, and every phase measurable in sims
> before a human ever reaches day 80.

---

## 0. The idea in one paragraph

Stop treating godhood as ten recipes you have to match. Treat the ten paths
as **ten directions on a compass** (called *domains*). Every ability, synergy,
and late item already leans toward one or two of them; we make that lean
explicit with tags. Your kit's lean is read out as **Resonance**, a number you
cannot spend. It is a *reading* of what you have built, not a currency. When
one domain's Resonance crosses a line (day 80+, with a synergy and a
tier-4 item *or* a deeply bonded keepsake), you ascend in that domain. You
gain its **capstone verb** and **one dimension of the game stops having a
ceiling for you**. Your second-strongest domain becomes an **accent**: one
small rule that bends your capstone. Ten capstones × ten accents gives 100
distinct gods from **20 rules**, not 100 authored builds. Luck decides which
pieces the world offers you. Cleverness decides which you keep, which order
you use them in to discover synergies, and which accent you lean into.
Godhood is how you play the endgame. The Table is still where you win.

---

## 1. What already exists (and what's broken)

| Piece | State today | Where |
|---|---|---|
| 6 ability slots | Unlocked by integration (1 → 6 at 20/35/50/65/80). **Permanent** — swap removed 2026-10-10 | `game.js:22039`, `app.js:14321` |
| Ability levels | L1→L2 at 6 uses, L3 at 12. L3 offers a 1-of-2 **evolution** (13 families × 2) | `game.js:22054`, `evolutions.json` |
| Path tags | Only **33 of 99** abilities carry `paths[]`; forager has 1, miser 2, detective 0 | `abilities.json` |
| Synergies | 53, discovered by *using* legs together (sequential / simultaneous / sustained) | `game.js:25020-25336` |
| Godhood | 11 entries. Rule: 4 of a pool + 1 core + 1 synergy + any T4 item + day ≥ 80 | `godhood.js:121`, `godhood.json` |
| **Capstone verbs** | `raiseEcho`, `turnPain`, `phaseOut`, `takeWound`… **called by nothing in `src/`**. Ascension gives a ceremony but no power | `godhood.js:268-420` |
| Sentimental gear | Bond 10/25/50; feast surge; bonded armor ≥25 resists beams | `progression.js:324`, `alienPlayers.js:2606` |
| Luck | `luck.global` exists but has only 4 sources (lucky_rock ×1.05, 2 evolutions, 1 relic enhancement) | `modifiers.js`, `forage.js:67` |
| **Synergy bug** | Technique-leg synergies (e.g. `tidecaller`) can be *discovered* (reads `state.codex`) but never *activate* (reads `scholar.codex`, which nothing creates) | `game.js:25106` vs `25336` |

The proposal keeps every row above and changes the godhood rule, the
capstone wiring, and the tags.

---

## 2. Design rules this proposal obeys

From the docs and the brief summary. Each line is a test any later change must
pass.

1. **Power never removes the stomach.** "Does this let you skip dinner?" →
   always no (`DIRECTIVES.md:25`). Godhood *raises* kcal upkeep.
2. **No new currency.** kcal is the economy. Resonance is a read-only gauge
   with no spend verb, no shop, and nothing that decays or is earned on its own.
3. **The Table never gates on godhood** (`TABLE.md` law 1). No win condition
   reads a god flag.
4. **No classes, no skill trees** (`DESIGN.md:28`, `DECISIONS.md:13`).
   Domains are lean, not identity: no menu, no nodes, no "pick your path".
5. **No mid-game godhood.** Day-80 floor stays (`sim-godhood-rework.md:22`).
6. **No exact-recipe lottery.** The "exactly these 6" rule was killed for a
   reason (`sim-godhood-rework.md:17`); recipes stay dead.
7. **Rework, don't delete.** All abilities stay; they get tags, not
   tombstones.
8. **No per-ability content theater** (`ability-evolution.md:9`). New content
   is rules, not 100 hand-made gods.
9. **Discovered, not given.** The Resonance readout is dark until the codex
   earns it. No free wiki.
10. **One screen, phone-first.** Everything fits 390×844, one tap per verb,
    fights stay 2–8 turns.
11. **Human skills and alien abilities stay distinct** (`ability-audit.md:11`).

---

## 3. The ten domains (paths as directions)

Each domain is defined by **the one dimension it unbinds** when you ascend.
That one sentence is the whole identity. The flavour names stay as Steve wrote
them.

| # | Domain | Path name (fiction) | Unbound dimension | Capstone verb (exists) | Built-in weakness |
|---|---|---|---|---|---|
| 1 | **Kin** | Shepherd of the Dead | Party headcount: the dead and the converted can fight for you | Raise Echo | Alone you are a talker |
| 2 | **Hunt** | Apex Predator | Initiative and range: you choose where and when a fight starts | Choose the Terms | If it reaches you, you're a person with a bow |
| 3 | **Growth** | Living Garden | Yield: forage and cook output have no cap | Feed the Multitude | No fighting kit; your garden needs guards |
| 4 | **Endurance** | The Unkillable | Lethality: death becomes a price, not an end | Phoenix (burns a villager) | Politics, betrayal, your own village |
| 5 | **Fury** | One-Person Army | Damage taken converts to damage dealt | Turn the Pain | Things that don't bleed |
| 6 | **Sight** | The All-Seeing | Hidden information: lies, telegraphs, hidden stats | No Lies | Knowing the punch ≠ taking it |
| 7 | **Trade** | Market God | Exchange rate: you set prices | Summon the Market (buff, §11) | Wealth doesn't stop a beam |
| 8 | **Road** | Farstrider | Distance: travel cost and map reach | Walk the Horizon | Finding the lair ≠ surviving it |
| 9 | **Between** | The Between | Being hit: you can be elsewhere | Phase Out | Can't hold ground |
| 10 | **Mending** | Undying Ward | Ally HP: their wounds become yours | Take the Wound | You're the priority target |

`voice_of_the_relay` stays an **office**, not a domain (Steve 2026-10-10:
"the switchboard is an OFFICE, not a god path"). It keeps its own route.

**Paths are directions, not law.** The fiction names above are *examples*
of what a domain looks like. A player who ascends in Fury with a Sight accent
and a dead mother's ring is not "playing the One-Person Army build". They're
playing *their* god, and the epilogue should name them from what they actually
did (§10).

---

## 4. Resonance: reading the build

### 4.1 Tags (the rework of every ability)

Every ability gets a `domains` field: **one primary** and **at most one
secondary**. Abilities that genuinely belong nowhere (pure utility, e.g.
`boil_water`-type helpers) get `domains: []` and become **bridges** (§4.3).

```
"rage":         { "domains": ["fury"] }
"second_wind":  { "domains": ["endurance", "fury"] }
"triage":       { "domains": ["mending"] }
"lucky_rock":   { "domains": [] }            // bridge
```

The 33 existing `paths[]` tags seed the pass. The other ~66 are a one-sitting
data job, not code. The same field is added to:

- **Synergies:** inherit the domain their legs share. If the legs differ, the
  synergy counts toward both: it is literally a bridge between domains.
- **Tier-3/4 items:** the ENDGAME-BUILDS gear lists already imply them
  (`apex_bow` → hunt, `bloodplate` → fury).
- **Evolutions:** each family's two forms lean different ways
  (`combat__red_mist` → fury, its sibling → hunt). That makes the L3
  evolution choice a domain choice.

### 4.2 The formula (deliberately simple)

Per domain, add:

| Source | Points |
|---|---|
| Slotted ability, primary tag | 2 |
| Slotted ability, secondary tag | 1 |
| …that ability is L3 | +1 |
| …and its chosen evolution leans this domain | +1 |
| Active synergy in this domain | +2 |
| Equipped tier-3 / tier-4 item tagged this domain | +1 / +2 |
| Equipped sentimental item, bond ≥ 25, that **inherited** this domain (§6.3) | +1 |

**Ascension threshold: 12.** This is reachable with roughly **4 on-domain
abilities, two at L3, plus one synergy, plus one tagged T4 or keepsake**,
which matches the current "4-of-pool + synergy + T4" rule in shape while
dropping the fixed pool list.

**Accent threshold: 6** in the second-highest domain.

Two numbers, threshold and accent, are the only godhood tuning knobs.
Because Resonance is derived, re-tagging an ability rebalances everything
downstream with no code change.

### 4.3 Bridges: why off-path abilities stay valuable

Bridge abilities (no domain) add 0 Resonance, but **every synergy that uses a
bridge counts +1 extra** toward its domain. `lucky_rock`, `pocket_sand` and
`squirrel_friend` stop being dead weight; they become glue a clever player
slots on purpose. This is the main answer to "will the 99 all matter":
nothing has to be in a domain to be useful to one.

### 4.4 Ascension rule (replaces `godhoodCloseness`)

You ascend in domain **D** when all of these hold:

1. Resonance(D) ≥ 12
2. ≥ 1 discovered **and active** synergy touching D
3. **One of:** any tier-4 item equipped, **or** a sentimental item at bond ≥ 50
   ("love is a valid build path", `ENDGAME-BUILDS.md:149`)
4. Day ≥ 80

The System's existing safety net (`maybeGrantCapstoneItem`) stays for
condition 3. Ties go to the domain with more L3 abilities, then to the most
recently used.

### 4.5 What the player sees (one screen, earned)

A ten-point **compass ring** sits on the existing ability screen, about 120 px
across at 390 wide. Each domain's spoke fills as Resonance grows.

- **Dark by default.** A spoke shows only once the codex has the domain's
  core idea at L1 "heard of" (existing three-level codex,
  `proof-godhood-discoverability-20261013.js`).
- **Numbers hidden until L3 "understood."** Before that the spoke is a vague
  glow: you feel the lean, you don't see the math.
- **The existing `hintBeat`** fires when a spoke first passes half (6).

---

## 5. How the layers stay themselves

Each layer owns exactly **one axis**. When two layers fight over the same
axis, the integrity of both is lost, so this split is the rule that keeps
them apart.

| Layer | Owns | Answers | Never does |
|---|---|---|---|
| **Abilities** | **Verbs**: what you *can do* | "What's my move?" | Big passive multipliers stacking from gear |
| **Synergies** | **Rules**: how two verbs combine into a new behaviour | "What happens when I do A then B?" | Raw stat bumps (a synergy that's only "+20%" gets a behaviour or gets folded into an ability) |
| **Gear** | **Magnitude and reach**: how much, how far | "How hard? How far?" | Granting verbs |
| **Sentimental gear** | **Conditions and guarantees**: when it can't fail | "When does this hold no matter what?" | Raw damage or yield numbers |
| **Godhood** | **One unbound dimension + one verb** | "What's the one thing nobody else can do?" | Anything at the Table |

How a god works in practice: the **ability** lets you do it, the **synergy**
changes the rules of doing it, the **gear** says how big it is, the
**keepsake** says it won't fail when it matters, and **godhood** removes the
ceiling on one of those numbers.

Example, a Hunt god:

- **Ability** `patient_aim` gives the verb: Take Aim.
- **Synergy** Apex Sense (tracker + echo_location) changes the rule: you always know where the target is, so aim can start before the fight.
- **Gear** `apex_bow` sets the magnitude: damage and range.
- **Keepsake** grandfather's whistle supplies the guarantee: the first shot of a fight cannot be dodged.
- **Godhood** unbinds initiative: Choose the Terms picks the start square and range.

No layer does another's job, so each can be tuned or reworked alone.

---

## 6. Gear and sentimental gear in the god path

### 6.1 Ordinary gear

- T3/T4 items gain domain tags (§4.1). A tagged T4 item in your domain adds
  +2 Resonance **and raises your unbound dimension's soft ceiling**. Example:
  the `worldbreaker_maul` sets how much stored pain Turn the Pain can return.
- Any T4 item still satisfies ascension condition 3, even off-domain, so a
  lucky apex drop is never wasted.

### 6.2 Sentimental gear: the guarantee layer

At bond 50 a keepsake can be **anchored** to one capstone (one tap, once,
permanent). While it's equipped, that capstone gains **one guarantee**,
chosen by keepsake type:

| Keepsake kin | Guarantee on the anchored capstone |
|---|---|
| Child (drawing, toy) | Can't be interrupted or stunned out |
| Parent / grandparent | First use each fight costs no kcal |
| Spouse (ring) | Survives a STAMP: contest deletion can't take the domain's core abilities |
| Friend | Can be used on an ally's turn |
| None (generic) | Feast surge applies to the capstone (existing multiplier) |

This is more interesting than "+armor": it gives grief and love a mechanical
voice without adding numbers to the damage pile.

### 6.3 Inherited domains (luck: who dies near you)

When a villager dies and their keepsake becomes sentimental through the
existing `lootCorpse` wrap (`progression.js:1071`), it **inherits the dead
villager's primary domain**. At bond ≥ 25 it adds +1 Resonance there.

- **Luck:** who dies, and what they were good at.
- **Cleverness:** whose keepsake you keep close and bond, and whether you lean into a domain you never planned.

The dead literally pull your build. The code conflict flagged by research
(`corpses.js:25` says sentimentals die with the owner; `progression.js` adopts
generic keepsakes) needs one decision first. This feature only uses the
generic-keepsake route, which already works.

---

## 7. Six slots: meaningful commitment

The six slots are already permanent. The design makes that permanence
*bite* without making it a trap.

### 7.1 The math of commitment

Threshold 12 needs about **4 of your 6 slots** in one domain. That leaves
**2 flex slots**, and those two slots are the whole drama:

- Spend them **on-domain** → you ascend faster and harder, but are blind
  off-domain (bad in contests, §9.3).
- Spend them **on a second domain** → you reach the accent (6), which bends
  your capstone (§8).
- Spend them on **bridges** → your synergies count more, and you cover weird
  contests.

Slots unlock slowly (6th at integration 80), so the last two choices land
right around day 60–90, exactly when the Table starts to price the run. The
commitment arrives when it matters.

### 7.2 Release on offer (not swap)

Swap stays removed. Instead, at the moment of a System offer with all slots
full, you may **release** one ability to take the new one.

- The released ability, its levels and its evolution are **gone**.
- Its **codex knowledge stays**, so you still recognise its synergies in
  villagers. Knowledge persists; power doesn't.
- No kcal cost and no timer: the loss *is* the cost.

This matches `DECISIONS.md:29` ("releasable including System-granted") while
honouring the 2026-10-10 removal of free swapping.

### 7.3 The crown binds

On ascension, the domain's **two highest-Resonance abilities lock**. They
can't be released, and only a spouse keepsake (§6.2) protects them from a
STAMP contest. A god is committed. That makes STAMP contests terrifying for
gods, which is good drama and costs no code beyond a flag check.

---

## 8. Luck + cleverness → game-breaking builds

### 8.1 Where luck lives (all existing systems)

| Luck source | Already in code |
|---|---|
| What the System offers (1-of-3, random wild card) | `firstAbilityChoices`, contest prizes |
| Which evolution forms exist for your family | `evolutions.json` |
| Which apex drops a T4 (~12%) | `rollAlienLoot`, `villagerKillLoot` |
| Which kin keepsakes you started with | `lifeseed.js:392` |
| Who dies near you, and what they were good at | §6.3 |
| Which contest category you're cast into | `contestEngine.js` |

**New, small: luck feeds luck.** `luck.global` biases the System's wild-card
offer toward your two highest domains (weight +luck×10%). Luck becomes a
dial a clever player can turn, not a dice roll they suffer. That gives the
4 existing luck sources a real job.

### 8.2 Where cleverness lives

1. **Which offers you take**, and what you release (§7.2).
2. **Order of use.** Synergies are discovered by sequential or simultaneous
   use, so an attentive player discovers more and sooner.
3. **Evolution choice at L3** picks between two domains.
4. **Which keepsake you anchor** and to which capstone.
5. **Accent choice.** Your second domain is a deliberate bend, not an
   accident.
6. **Bridge placement**: using "useless" abilities as synergy glue.

### 8.3 Accents: 10 rules → 100 gods

Your accent domain applies **one rule** to your capstone. Each rule is
written once and works on any capstone:

| Accent | Rule applied to your capstone |
|---|---|
| Kin | Also affects every party member within 3 squares |
| Hunt | Can be **pre-armed** before a fight; fires on turn 0 |
| Growth | kcal cost paid from the **pantry** instead of your body |
| Endurance | Usable at 1 HP and while stunned; pays HP when kcal runs short |
| Fury | Strength scales with your missing HP |
| Sight | Shows the outcome preview before you commit |
| Trade | Can be **lent** to one villager for a day |
| Road | Reaches off-screen field fights within one region |
| Between | Fires **reactively**, on an enemy telegraph, instead of on your turn |
| Mending | Also heals the target by 25% of its effect |

### 8.4 Worked examples (illustrative numbers)

**Fury god, Between accent: "the Pain Mirror."** Turn the Pain normally
returns stored damage on your turn. With the Between accent it fires
**reactively**, when an enemy telegraphs. You take the hit, and on its very
next telegraph the stored pain lands *first*. A titan's big wind-up becomes
your best friend. Cleverness: learning to *want* the telegraph.

**Growth god, Fury accent: "the Glutton of War."** Feed the Multitude is
normally logistics. With Fury, its strength scales with your missing HP, so
the more hurt you are, the bigger the feast. That means the more your titan
muster eats for free (§9.4). A wounded gardener who feeds an army. Nobody
designed that build; it falls out of two rules.

**Endurance god, Growth accent + wedding ring anchor.** Phoenix normally
burns a villager. The Growth accent pays its kcal from the pantry. The
ring (§6.2) means STAMP can't take your core. The village carries your
immortality in food *and* in people. That's very strong, and it shows up
honestly in the Table's moral ledger.

### 8.5 Breaking the game, safely

Steve wants "nearly/completely unfair synergies *in specific dimensions*"
(`DECISIONS.md:103`). The domain model makes that literal:

- **One dimension per god is uncapped.** Every *other* dimension keeps
  today's caps. The measured alpha-strike ceiling of ×7.14 stays the ceiling
  for non-Fury gods.
- **Upkeep scales with breakage.** Ascension adds `metabolic.daily +400`.
  Each capstone use costs kcal from the bank (which decays 20%/night, so it
  can't be hoarded forever). A god eats like a god: "4x calories to be a fire
  god" (`DECISIONS.md:762`).
- **Every domain keeps its stated weakness** (§3 table). A god is scary good
  in one direction and ordinary in the other nine.

Because the late game is under-tested, these three guardrails are the
**safety net**: even if a combo is far stronger than intended, it is strong
in only one direction, it's hungry, and it's still a person in the other
nine.

---

## 9. Every scale of play

### 9.1 Solo fights (9×9 grid, 2–8 turns)

- Capstone = **one tap, once per fight**, telegraphed like every other big
  move (existing telegraph system).
- **Design target:** a capstone should *flip or end* a fight within 2 turns,
  never stretch it. Phase Out removes one hit, not a whole fight. Turn the
  Pain is a single release, not a stance.
- Passive unbound dimensions apply without taps, so no new buttons beyond
  the capstone. The mobile action bar stays the same size.

### 9.2 Party (up to 4 villagers join)

- **Godly presence:** party members fighting beside a god get the god's
  unbound dimension at **half strength**, capped. Mending gods' allies take
  less; Hunt gods' allies act first.
- **Villager gods** use the same rules (`npcSynergyTick` already exists).
  Two gods in one party is possible and wanted: Table law 8, "NPC heroes are
  real".
- **Pantheon jealousy** (`pantheon.js`, already tracking awe and rivalry)
  starts mattering. Rivalry above 60 between two party gods means one may
  refuse to follow, using the existing betrayal-opportunity hooks.

### 9.3 Contests (44, seeded, 8 categories)

Contests are where the **2 flex slots** earn their keep.

- **On-domain contest** (Fury god in Blood): capstone fires as normal, and the
  System **raises the bracket** (beasts ×1.3, the existing scaling). Gods are
  handicapped on their home turf: that's the show.
- **Off-domain contest** (Fury god in Moot or Puzzle): the capstone is
  **not available**. Only your 6 abilities and wits count. A pure
  specialist suffers here, and a god with clever flex slots shines.
- **STAMP contests** now threaten a god's identity (§7.3), so they get a
  matching broadcast beat.

### 9.4 Titans (coalition, 10–20 allies, no solo)

The no-solo gate stays absolute. **Gods change the logistics of the war, not
the rule.** Each domain gets one titan-scale effect, reusing existing titan
numbers:

| Domain | Titan-scale effect |
|---|---|
| Kin | Fallen blades rise as echoes for one node (counts toward the ally total) |
| Hunt | Choose the titan's opening pattern |
| Growth | Muster upkeep −50% (1000 → 500 kcal/day per blade) |
| Endurance | One blade per fight survives a killing blow (Phoenix rules still burn someone) |
| Fury | Your blade's pain store is shared across the line |
| Sight | Reveals which outfitted allies will Turn (titans.js:575) |
| Trade | Outfitted allies' temptation −30 (fewer defections) |
| Road | Muster arrives a day early |
| Between | Line can withdraw once without losses |
| Mending | Wounds spread across the line instead of killing |

### 9.5 Army and finale campaign (20 blades, 3 nodes, dead stay dead)

- A god is **one blade** plus their titan-scale effect (above) at every node.
- Off-screen field fights (`fieldFights.js`, max 15 rounds) apply the god's
  unbound dimension as a single modifier. No new simulation code, just one
  modifier read.
- The Heart's "10 survivors" bar is untouched. Gods make it reachable, never
  automatic.

### 9.6 Scale ladder (village → regional → national → global)

A god in the village is a **diplomatic weight**. Primacy bids and First
Court beats read god count as one more input next to tribute and trust.
They never gate on it.

---

## 10. Victory stays the Table

Godhood is *how* a run tends to look at the end, not *what* it's trying to
reach. Concretely:

1. **No Table path checks a god flag.** Not at seat pricing, not at path
   eligibility, not at branches.
2. **Gods feed the Table only through real deeds the Table already reads.**
   A Fury god naturally raises *might/killed*. A Mending god raises
   *protected*. A Growth god raises *foodShared*. This is the existing
   leadership vector, fed by play, not by the god flag.

   | Domain | Table vector it tends to feed | Table path it tends toward (never gated) |
   |---|---|---|
   | Fury, Hunt | might, killed | Feared |
   | Growth, Trade | foodShared, brokerage | Indispensable |
   | Kin, Mending | protected | Beloved |
   | Sight | exposed | Witness |
   | Between, Road, Endurance | — (independence) | Defiant |

3. **Villager ascensions** add +10 path strength each (existing law 8).
   Facilitation is a real alternative to personal godhood.
4. **Godhood costs grounding.** Each capstone use in a "dark" way (Phoenix
   burns, Kin conversions, Sight exposures) nudges grounding down by 1,
   capped at 2/day. The more godly you lean, the more the Table's
   humanity theme bites.
5. **The only place a capstone fires at the Table** is opt-in trial by
   combat. It's legible, risky, and doesn't decide the path, only the duel.

A non-god player can still take a full seat and win. A god who never feeds
anyone still gets a dark branch. **The Table judges the person, not the
power.**

---

## 11. Rework notes per existing piece

- **Wire the capstones.** They exist and are tested, but nothing calls them
  (`godhood.js:268-420`). This is step 0 regardless of the rest of this doc.
- **Fix the codex store bug** (`game.js:25336` should read `state.codex`).
  Otherwise technique synergies can never be a god's required synergy.
- **Market God buff.** Today it's the weakest capstone (indirect economy).
  Give Summon the Market a **combat-time** use: buy one consumable or weapon
  mid-fight from the System at bank-kcal price. It stays trade-themed and
  becomes useful at every scale.
- **Abilities using hardcoded `hasAbility` checks** (~40, `ability-audit.md:60`)
  should move to the modifier pipeline over time, so domain tags and unbound
  ceilings apply to them uniformly. This isn't blocking: tags work regardless.
- **`cornered_fury` / `borrowed_surge`** promise conditions the code doesn't
  check (`break-godhood-kickoff.md:80`). Fix before they become Fury
  synergies that matter.
- **Villager kits** (`NPC_ABILITY_KITS`): with Resonance replacing fixed
  pools, the "only 4 of 10 godhoods reachable by villagers" limit relaxes on
  its own. Re-measure; don't hand-tune kits first.

---

## 12. Build order (each phase shippable and measurable)

Because nobody plays to day 80 yet, each phase ships with a **sim metric**
and a **debug scenario** (`debug-scenarios.js`) that drops a tester straight
into a day-85 god state on a phone.

| Phase | What | Behaviour change? | Proof |
|---|---|---|---|
| **0** | Wire capstone verbs into combat; fix codex bug | Yes (small) | Each capstone fires in a seeded fight; fight length stays 2–8 turns |
| **1** | Add `domains` tags to all abilities, synergies, T3/T4 items, evolutions. Compute Resonance. **Readout only, no rule change** | No | Sim logs Resonance per run; see natural distribution before tuning anything |
| **2** | Replace `godhoodCloseness` with the Resonance rule (§4.4), keeping day 80 | Yes | Ascension rate stays in the 5–15% band; no domain > 30% of ascensions |
| **3** | Accents + keepsake anchoring + inherited domains | Yes | 100-run sweep: ≥ 15 distinct capstone × accent pairs appear |
| **4** | Scale hooks: party presence, contest rules, titan effects | Yes | Titan win rate with a god ≤ 1.5× without; Table seat rate unchanged by god count (proves no gating) |
| **5** | Compass ring UI, earned through codex | UI only | Fresh codex shows a dark ring (the existing RED "no free wiki" proof extends to it) |

Phase 1 is the key trick for an under-tested game. It **changes nothing**
but tells you, from sims, what real kits look like at day 80 before any
threshold is chosen.

---

## 13. Open questions for Steve

1. **Thresholds.** 12 to ascend and 6 for the accent are educated guesses.
   Set them after Phase 1 data, or pick now?
2. **Multiple ascensions.** Can one person ascend in a *second* domain later
   (a "twin god")? This proposal says no: one crown per life, and the
   accent is the hybrid. A yes is more broken and more fun, but harder to
   bound.
3. **Release on offer** (§7.2): does it fit your intent for the
   2026-10-10 swap removal, or was the removal meant to be absolute?
4. **Sentimental from the dead.** `corpses.js` says keepsakes die with the
   owner; `progression.js` adopts generic ones. Which is canon? §6.3 needs
   the answer.
5. **Grounding cost** for dark capstone use (§10.4): right lever, or too
   punitive for the gods you *want* to be scary?
