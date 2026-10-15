# God-Path System — Design Proposal (v2)

*2026-10-14 · design document, not code · for Steve*
*Answers `opus-brief-ability-system.md`. Implementation plan for the coding
agent: `docs/godpath/PLAN.md`.*

> **v2 note.** v1 of this doc was written against a stale branch, before the
> brief existed. It proposed a hidden points total ("Resonance"), which is the
> rejected *points-based god meter*. It also let keepsakes and T4 gear modify
> god powers, which is the rejected *gear-rewrites-abilities* pattern. Both
> are gone. v2 is built on `master` as of `bcd41987`, including today's
> `godpaths.json`, `buildarounds.js`, food-powered abilities and roles.

---

## 0. The idea in one paragraph

Every path owns **one fight condition**, a plain thing that is true or not
true in a fight: *the target is Marked*, *you are Bloodied*, *you're
Guarding someone*. **Enablers make the condition happen. The path's payoff
cashes it in.** That is the whole build grammar, and in a 2–4 turn fight it
gives you one real decision per turn: **set up, or cash in?** Gear takes part
the honest way: a bow's aimed shot marks, a shield's block makes you
Guarding. It does that through its *own* action, never by rewriting magic.
Godhood is not earned by points or by counting uses. When you hold a path's
payoff at mastery after day 80, **the System stages a Trial**: one televised
fight built so that only that path's trick wins it. Win, and your payoff
**transforms in its own slot** into the god ability, which permanently
changes a rule about you. Luck decides which payoffs, producers and gear
the world hands you. Cleverness is noticing that an off-path ability *also*
makes your condition, and that is where broken builds come from. The Table
stays the win; a god just walks in with a louder record.

---

## 1. Where `master` is today (verified)

| Piece | State | Ref |
|---|---|---|
| Abilities | 118. Roles: support 55, enabler 48, payoff 14, wildcard 1. 72 have no path tag | `abilities.json` |
| Synergies | 57, mostly stat modifiers. 4 action-level weapon+ability combos (Shattering Blow, Impaling Scream, Blood Iron, Static Edge) | `synergies.json` |
| Food power | Every ability burns kcal. Eat-first gate below 500. Overcharge ×1.25 at ≥75% kcal | `foodPower.js`, `food-powered-abilities.md` |
| Offer steering | Offers weighted toward held paths | `buildarounds.js` |
| God paths | `godpaths.json`: 10 paths, each with a `core` and a god ability with scale text | `godpaths.json` |
| **God paths wiring** | **Not connected.** `godpaths.json` is not in the data load list (`game.js:251`). `onPathLived` has no callers. None of the 10 god ability ids exist in `abilities.json` | `buildarounds.js` |
| Fusion | Code exists, no data file, no callers. **Rejected by the brief** | `buildarounds.js` |
| Old godhood | `godhood.js` + `godhood.json`: 11 builds, day-80 floor, ceremony, pantheon, villager ascension. Market God capstone rework is wired | `godhood.js`, `pantheon.js` |

So the god-path layer is still on paper. That's good news: we can settle the
design before cleaning up the code.

---

## 2. Rules this design obeys

From the brief, plus older canon that still holds.

1. **No new currencies or meters.** Not visible, not hidden. Conditions are
   fight facts (yes/no), like `blinded`, not running totals.
2. **No points-based god meter, no use-counting ascension.** The current
   10/25/50-use counter in `onPathLived` is a hidden meter and is replaced.
3. **Gear grants actions; it never rewrites abilities.** Gear and abilities
   meet at the *action* level: two things you do, composing.
4. **No fusion.** Abilities don't merge.
5. **Rework, don't delete** the 118. Re-roling and tagging are rework.
6. **Victory is the Table.** No win condition reads a god flag. Soloing a
   titan is an achievement, not a victory.
7. **One economy:** kcal. God abilities cost kcal. **Power never removes the
   need to eat** (`DIRECTIVES.md:25`).
8. **2–8 turn fights, 390×844, no scroll.**
9. **"If you don't know, it doesn't show."**
10. **Death stays the leading failure.** No auto-wins; contests stay deadly.
11. **Rare stays rare** (`design-methodology.md`): no systems for exceptions.
12. **Mechanics first, fiction as a light coat.** The brief supersedes the
    fiction-first note from earlier today. The *Plain Sentence test* is kept
    as a legibility check, not a gate.

---

## 3. The ten conditions

Each path's `core` in `godpaths.json` becomes one concrete fight condition.
Plain sentence first, then what makes it and what spends it.

| Path | Condition (plain sentence) | Made by (examples) | Cashed in by (payoff) |
|---|---|---|---|
| **Brawler** | **Bloodied**: "you've been hit this fight and you're still swinging" | Taking a hit; `rage`; trading blows | `trade_of_blows`, `blood_frenzy` |
| **Shieldbearer** | **Guarding**: "you're standing between an ally and harm" | Adjacent to a hurt ally; shield **Block** (gear action) | `retribution` |
| **Hunter** | **Marked**: "you've studied this target" | `patient_aim`; bow aimed shot (gear); `tracker` before the fight | `dead_aim`, `trophy_room` |
| **Caregiver** | **Tended**: "an ally you've healed this fight" | Any heal; `triage`; bandage use (gear) | `battlefield_grace` |
| **Drifter** | **Moving**: "you moved 3+ tiles this turn" | Moving; `soft_step`; boots/cloak have no effect here (see §6) | `nowhere_man` |
| **Explorer** | **Read**: "you know what this monster is about to do" | Monster codex L2+; telegraph reveal; spyglass **Scout** (gear) | `cartographers_eye` |
| **Socialite** | **Watched**: "people you care about are watching" | Allies within 3 tiles; contest or broadcast | `crowd_favorite` |
| **Survivalist** | **Well-fed**: "you're ≥ 75% full" (the existing Overcharge line) | Eating; `iron_stomach`; cooking | `feast_engine` |
| **Miser** | **Stocked**: "you're carrying a spare of what you need" | Carrying 2+ consumables; `hoarder` | `hoarders_interest` |
| **Forager** | **On a streak**: "you've found food on every try today" | Successful forages; `green_thumb` | `cornucopia` |

Notes:

- **Three already half-exist:** Overcharge is Well-fed, the Openings hook
  is close to Read, and `deadeyeMarks` is Marked. Reuse them.
- **Out-of-fight conditions** (Survivalist, Miser, Forager) are checked at
  the start of a fight and simply stay true or false. No fight bookkeeping.
- **Enablers don't need a path tag to make a condition.** That is the
  cross-path seam (§7).
- A condition is **binary**. If a payoff wants "more", it reads a second
  condition, not a bigger number.

### 3.1 What this does to the 69 passive-only abilities

They stay; most of them are **support**, the competent floor (pattern 6:
balance the floor, free the ceiling). The rework is narrow:

- Every **enabler** gets a `makes: <condition>` tag. A passive enabler is
  fine ("when you're hit, you're Bloodied"); the decision lives with the
  payoff.
- Every **payoff** gets a `spends: <condition>` tag and an **active verb**:
  one tap, kcal cost, and a big result *only if the condition holds*.
- **Support** abilities need no change.

That makes the decision in a 2–4 turn fight concrete:

- **Turn 0 (opening):** party openings and pre-fight marks exist already.
  Set up for free if you prepared.
- **Turns 1–2:** set up or cash in? Cashing in early is weak; waiting is
  risky (death is the leading failure).
- **Turns 3–4:** the payoff lands, or you run.

---

## 4. Payoffs and god abilities

Each path has a **signpost payoff** (from the 14 existing payoffs; two paths
have two). The god ability is **what the payoff becomes** when you pass the
Trial. It's the same slot, with a transformed rule. Every god ability below
**changes a rule about you** rather than raising a number, keeps a kcal cost,
and has a stated weakness.

Changes from today's `godpaths.json` text are marked **⚠ rework**, with the
constraint they broke.

| Path | God ability | The rule that changes | Weakness |
|---|---|---|---|
| Brawler | **Crimson God** | You are always Bloodied. Every hit you land while Bloodied crits. You must attack each turn or take 20. | Can't disengage; anything that doesn't bleed |
| Shieldbearer | **Martyr's Aegis** | Every ally's damage is redirected to you and stored; one tap releases it as an area blast. Store over 500 and it kills you too. | You're the bottleneck; one bad turn ends you |
| Hunter | **Deadeye** | Attacks on Marked targets cannot miss and crit ×3. Marks persist for the whole day. | Must mark first; useless in a melee scrum |
| Caregiver | **Lifebringer** | A heal on a downed Tended ally revives them, once per ally per fight. | Can't revive yourself |
| Drifter | **Ghost** | After you move 3+ tiles you can't be hit until your next turn. | Must keep moving; can't hold ground |
| Explorer | **Omniscient** | Every monster in a fight is always Read; you see 2 telegraphs ahead. | Knowing isn't surviving; no damage |
| Socialite | **Icon** | While Watched, your social verbs always land, and in fights 1d3 fans join as allies. **⚠ rework:** today's "+50% all stats" is a number, not a rule | Nothing without an audience |
| Survivalist | **Apex** | You digest anything: raw, unidentified and spoiled food all count at full value, and you can eat mid-fight as a free action. **⚠ rework:** today's "never need food/water" breaks the one-economy and stomach rules | Still needs food, and more of it (upkeep +400 kcal/day) |
| Miser | **King Midas** | Adopt the already-wired Market God capstone (Name Your Price + buyPassage, `marketNamePrice`). **⚠ rework:** cut "can buy victory?" | Wealth doesn't stop a beam |
| Forager | **Cornucopia God** | Forage never fails, and yields ×5 while On a streak. | Still costs time and kcal; no fight power |

**Old `godhood.js` systems:** keep its plumbing and retire its rules:

- **Keep:** the day-80 floor, the recognition ceremony, pantheon
  registration and villager ascension. Its capstone code becomes the
  implementation library where it fits (Phoenix, Take the Wound).
- **Retire:** the 4-of-pool requirement. It's superseded by the Trial.

---

## 5. Becoming a god: the Trial

The System watches behavior, which is today's instinct and the right one. It
just watches *one decisive moment*, not 50 repetitions.

**When it's offered.** The System casts you into your path's Trial when all
of these hold:

1. Day ≥ 80.
2. Your path payoff is at **L3 mastery**. This is the existing XP system; you
   get there by *using* it, which is play, not grind.
3. You've **cashed in the condition** at least once at L3 (proof you
   actually run the build).

**What it is.** It's a contest-engine fight (existing `contestEngine.js`,
televised, unavoidable like every contest), designed so that **only that
path's condition loop wins cleanly**:

| Path | Trial (one line) |
|---|---|
| Brawler | Three waves, no healing; the arena forbids retreat |
| Shieldbearer | Keep two fragile villagers alive against a focused pack |
| Hunter | A fast beast crosses 9 tiles; drop it before it reaches you |
| Caregiver | Your party is poisoned at the bell; nobody may die |
| Drifter | Arena floor collapses tile by tile; survive 6 turns |
| Explorer | A mimic pack where every monster lies about its telegraph |
| Socialite | Turn the crowd: win with fan allies only |
| Survivalist | A siege fight that starts at 30% kcal; food is on the field |
| Miser | A rigged auction fight: you must buy your way to the exit |
| Forager | Starving arena; out-forage a rival before the gate closes |

**Win:** the payoff **transforms in place** into the god ability. That uses
the existing ceremony, and the pantheon registers you.

**Lose:** you live (if you live: contests can kill) and keep your payoff.
The System re-offers in 10 days at the earliest. **No mid-game godhood:**
the day-80 floor stays.

**Why a Trial rather than a counter:**

- It **rewards thinking, not grinding** (Steve's stated value).
- It's **one deep beat** to playtest per path, not ten shallow ones.
- It's **legible**: you know exactly what happened and why you're a god.
- It **reuses** the contest engine, broadcast, codex and ceremony.
- It's **testable** without a human reaching day 80: a debug scenario can
  drop a tester straight into each Trial.

---

## 6. How each lever keeps its integrity

| Lever | Exists for its own sake as… | Its god-path role | Never |
|---|---|---|---|
| **Abilities** | Verbs and passives you live with daily | Enablers make conditions; payoffs cash them; one payoff transforms | Merge (fusion) |
| **Synergies** | Discovered combos | Two kinds (§7): quiet stat synergies stay as the floor; ~10 **signature combos** (one per path) and ~5 **duos** (cross-path) become action-level | Become god points |
| **Gear** | Tools with physical functions | Some gear **actions** make a condition: shield Block → Guarding, bow aimed shot → Marked, spyglass Scout → Read, bandage → Tended | Rewrite an ability |
| **Sentimental gear** | Story objects: memory, bond, flashback, beam armor at bond 25 | Unchanged. The existing **feast surge** multiplies whatever you do, god ability included. Nothing new is added | Give god progress |

The gear table is **short on purpose**. "Rare stays rare": only gear whose
*physical function* obviously does the thing gets a condition. That's
why boots don't make you Moving; your legs do.

Sentimental gear gets nothing new. That's the brief's own test: "a
sentimental knife is a story object, not +15 god points". It already
matters through feast surge, beam armor and the `sentimentTaught` Table deed.

---

## 7. Luck + cleverness: where broken builds come from

### 7.1 The cross-path seam

Conditions are shared words. **Any** ability that makes Marked feeds Deadeye,
whatever path it's tagged with. So:

- **Luck** (illustrative; these depend on how the tagging pass lands):
  - the System offers you a non-Hunter ability that's tagged `makes: marked`
  - an apex drop gives you a spear whose crit pins, if "pinned" is tagged as Marked
  - a villager dies and you inherit their bow, whose aimed shot Marks
- **Cleverness:** noticing that, and slotting the off-path enabler over an
  on-path one. Your Hunter now marks from range *and* in melee, and Deadeye
  never misses either way.

No one authored that build. It falls out of two tags.

### 7.2 Signature combos and duos (synergies, reworked)

- **Signature combos (~10, one per path):** rework the path's best existing
  stat synergy into an *action-level* combo in the Shattering Blow model:
  "Mark, then strike a Marked target with a spear → it's Pinned." Discovered
  through the existing sequential/simultaneous discovery.
- **Duos (~5, cross-path, rare):** where two conditions compose into
  something neither path does alone, e.g. **Bloodied + Guarding** →
  "hits you take for an ally make you hit harder." These are the
  "I broke the game" discoveries. Keep them few; they're the exceptions.
- **The other ~40 stat synergies stay as they are.** They're the floor.

### 7.3 The six slots as commitment

| Slot use | Count | Why |
|---|---|---|
| Payoff (future god slot) | 1 | The thing you're building toward |
| Enablers making its condition | 2–3 | The payoff is weak without them (build-around test) |
| Flex | 2–3 | Survival, a second condition, or a duo |

- **One god per life.** The god ability lives in the payoff's slot. Holding
  two payoffs is allowed, but you're only offered the Trial for one, and a
  second payoff is a slot not spent surviving.
- Slots stay permanent (no swap). The commitment you made at integration 50
  is the one you take into the Trial at day 80+.

### 7.4 Balance posture

"Balance the floor, free the ceiling" (research pattern 6). Nerf a combo only
if it's **free**: no setup, no commitment, no knowledge required. A
three-piece cross-path loop that wins every fight is working as intended.
The brakes that already exist:

- **kcal:** every cast burns food, and the hunger gate is at 500.
- **One god per life.**
- **Each god's stated weakness.**
- **Contests stay deadly.**

---

## 8. Every scale

`godpaths.json` already has scale text per path. Here's what changes, and
the rules that apply to all of them.

| Scale | Rule for god abilities | Changes from today's text |
|---|---|---|
| **Solo fight** | God ability = one tap, kcal cost, telegraphed. It must flip a fight in ≤ 2 turns, never stretch it | — |
| **Party** (≤4 join) | Each god has one party effect that **shares the condition**: Deadeye marks for allies, Martyr's Aegis guards allies, Lifebringer revives allies | Socialite "+50% all stats" → fans join (rule, not number) |
| **Contests** | A god gets **one decisive beat** in a matching category (the perfect shot, the mercy moment), never an auto-win. Gods are cast into harder brackets (existing ×1.3) | ⚠ Cut "instant win" (Hunter), "auto-win" (Socialite), "win races automatically" (Drifter), "bribe judges" (Miser): they violate *death stays the leading failure* |
| **Titans** | Coalition gate stays. **A god counts as 5 blades toward the ally minimum.** A god *may* attempt a titan with fewer allies: it's an achievement, recorded as a deed, never a victory | ⚠ "Can solo titans" (Brawler) becomes "counts as 5; solo attempt possible, legible, lethal" |
| **Army / finale** | A god is one blade plus their party effect applied to the line. Off-screen field fights read one modifier | Survivalist "allies don't need food" → ⚠ cut; Apex instead halves muster upkeep (1000 → 500 kcal/blade) because they eat anything |
| **Villagers** | Same Trial rules. Villagers now use abilities in combat (`tbVillagerAbility`). Target: villager ascension in 5–15% of sim runs (existing goal) | — |

---

## 9. Victory stays the Table

- **No Table code reads a god flag**, including seat pricing, path
  eligibility and branches. It's enforced by a test (see PLAN).
- Gods matter at the Table only through **deeds the Table already counts**:
  - A Brawler god's fights raise *might/killed*.
  - A Caregiver god raises *protected*.
  - A Trial is a televised deed (*viewership*).
  - A villager god is an NPC ascension (+10 path strength, existing law 8).
- A non-god player can still take the full seat. A god who feeds no one
  still gets the dark branch.

---

## 10. Open questions for Steve

1. **Trial vs. recognition.** Today's code had the System *recognize* you
   after 50 uses. I'm proposing a *Trial* (one staged fight) instead.
   Does that match your "System watches behavior" intent?
2. **Titans.** "A god counts as 5 blades; solo attempt allowed as an
   achievement." Is the number right, and is the solo attempt OK given the
   current hard no-solo gate?
3. **Survivalist god.** Is "digest anything + eat mid-fight" transformative
   enough to replace "never need food"?
4. **Old `godhood.json` builds** (Shepherd of the Dead, The Between, etc.):
   retire their requirements and keep their mechanics as a library. Agreed?
5. **Fiction.** The brief says mechanics first and fiction as a light coat;
   this morning's methodology note said fiction first. I followed the brief.
   Confirm?
