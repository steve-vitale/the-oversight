# Ability & Skill Audit — name/flavor vs mechanic (Steve 2026-10-12)

Steve's redirect: the raw-engine print ("travel.cost_mult multiply 0.85") was a bug,
but the deeper bug is design — "Pathfinder" with flavor "you've never been lost,
your feet know the way" sounds like a mapping ability while mechanically cutting
travel cost 15%. It should be named for what it does. **Both issues are systemic**,
so every ability and every skill was audited.

Method: all 95 abilities in `src/data/abilities.json` (System-granted alien abilities)
and all 48 skills in `src/data/knowledge.json` (teachable earthly knowledge — kept as
a separate pool per Steve's law: human skills vs alien abilities must never be
confused). For each: does the name + flavor description honestly match what the
mechanic does? Mechanics verified in code (modifier pipeline + hardcoded
`hasAbility` checks), not just in the data.

## Verdicts

**MATCH: 87 abilities, 48 skills.** The full match list is boring on purpose —
name, flavor, and mechanic agree. Notable close calls that were checked and kept:
- `beast_calm` ("Animals go quiet around you") ×0.75 early warning — the flavor
  *explains* the drawback. Honest.
- `chitin_skin` / `fear_aura` ("-5 trust" / "-10 trust") — both verified real
  one-time `trustAll` hits in game.js, on top of the ongoing reduced trust gain.
- `night_eyes` spotting — the "spot trouble" half is a real hardcoded bonus
  (game.js nightRead); the card's passive line now also says the quiet half.

**MISMATCH: 8 abilities, 0 skills.** All fixed below. IDs were kept stable
(synergies.json and existing saves reference them); display names, descriptions,
and contradicting deepening lines were rewritten.

## The mismatches (all fixed)

| id | was | mechanic | fix |
|---|---|---|---|
| `pathfinder` (exploration pool) | "Pathfinder" — "You don't get lost. The land tells you where you are." | travel ×0.85 (15% cheaper miles) | **Tireless Stride** — "You walk like water downhill — no wasted steps, no wasted breath. Every mile costs 15% less." Deepening L3 "You never get lost. Ever." → "Distance is a rumor." |
| `pathfinder` (latent_knack pool) | "Pathfinder" — "You've never been lost. Not once... your feet know the way." | travel ×0.85 | **Waywise** — "You've never wasted a step. Not once. Even in places you've never been, your feet find the cheap miles on their own." Memory reflavored to match. Deepening L3 → "The land is short under your feet." |
| `second_skin` | "Second Skin" — "Your armor never slows you. Move full speed in any armor." | travel ×0.85 (flat travel discount, nothing armor-specific) | **Travel Light** — "You wear the world like weather — armor, pack, all of it. Nothing you carry slows you down: every mile costs 15% less." Deepening L2/L3 rewritten to the stride fiction. |
| `poisoner` | "Poisoner" — "You can poison food/water. (Useful against monsters. Or... others.)" | hunt.trap_catch ×1.5 (better bait). **No poison-food/water verb exists anywhere in the code.** | **Tainted Bait** — "Your bait is tainted — traps catch 50% more. (The poison's in the bait, not your hands. Mostly.)" Deepening rewritten to the bait fiction. Deliberately renamed to the real mechanic rather than building an unasked poisoning system. |
| `purify` | "Purify" — "Charcoal, clean water, time. Neutralize poison." | System-offered alien ability (canon: purify is magic, NOT an earthly skill) | Kept the name; reflavored to canon: "The System's clean touch, borrowed: poison unravels at your gesture. Not charcoal and time — intention, from something that never needed to eat." |
| `lucky_rock` | "Your lucky rock. +5% to everything." | luck.global is read in exactly 2 places — both hunting rolls | "...The System finds your faith adorable and helps a little: **+5% on the hunt.** (It's not the rock. It's you believing in the rock.)" |
| `adrenaline_control` | "Your hands don't shake. Your heart hammers, but your hands don't shake." (steadiness flavor) | combat.strike_damage ×1.3 (damage, not steadiness — steadiness is `steady_hands`' job) | "Your heart hammers — and every hammering beat lands 30% harder. Fear is fuel." |
| `storm_ear` | "You feel weather coming in your bones, a day out." (weather prediction) | water.rain_catch ×1.5 (catching rain, not forecasting it) | "You feel weather coming in your bones, a day out — and you're always ready, every vessel out. Catch 50% more rainwater." |
| `night_eyes` | "You see shapes in it that others miss" (only the spotting half) | stealth.move_silent ×1.3 **plus** the hardcoded night spotting | "...You see shapes in it that others miss — and it never hears you coming." |

## Skills audit (knowledge.json, 48 skills)

**All 48 match.** Earthly skills are honestly named ("Boiling Water", "Wire Snares",
"Reading Tracks") with instructional flavor and aligned mechanical unlocks/bonuses.
Fifteen have empty L1 mechanical blocks (hive_craft, lock_mechanisms, sewing, …) —
verdict: match, because for knowledge the description IS the mechanic (knowledge
gating: "if you don't know, it doesn't show"). No skill was found masquerading as
an alien ability; none grant System-slot powers.

## Open threads (not fixed here — flagged for the loops)

- **Synergy fiction**: several synergies reference the `pathfinder` ID with
  navigation-flavored text ("Find the way", "your feet just knew the turns").
  IDs were kept stable so nothing breaks, but the synergy copy still leans on the
  old wayfinding fiction. A copy pass should re-ground those in the stride fiction.
- **Hardcoded-number spot checks**: ~40 abilities implement their numbers via
  hardcoded `hasAbility` checks rather than the modifier pipeline (green_thumb
  +50%, tracker +30%, diplomat 2×, camp_cook half-water/+10%, etc.). The headline
  numbers in the audited descriptions were spot-checked against the code and agree;
  a full numeric audit of every hardcoded claim is a separate pass.
- **Formatter fallback**: all 36 (target, op) modifier combos observed in
  abilities.json now have plain-English templates. Any future unmapped target falls
  back to a cleaned generic ("travel.cost_mult ×0.85") — still better than
  "multiply 0.85". No unmapped combos exist today.
