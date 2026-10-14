# Unified tracks: one progression system for the player and villagers

*2026-10-14. Steve: "I think we need to sync the player and villager system.
But the villager system sounds like the better model." and "There should be
maybe 8 natural level ups plus a few other gifts or events etc that compete
for those 6 slots."*

## What changed

- **One engine, one data file.** `src/js/tracks.js` `gainTrackXP(who, track, n, why)`
  serves the player and villagers. `src/data/tracks.json` holds the five
  tracks (combat, field, social, craft, strange), the thresholds
  `[3, 8, 16, 32, 64]`, the kits and the deed table. `villagerGainXP` is a
  thin wrapper. The old `NPC_*` names in game.js are read-only views of the
  data.
- **Same deeds feed both.** A villager-shaped deed site that names the bearer
  credits the player. The player's own deed sites call `noteDeed(id)`:
  - **field:** forage, hunt, fish, trap, smoke, new place
  - **craft:** cook, craft, heal a villager
  - **social:** held conversation, teaching, contests
  - **combat:** fights won or survived
  - **strange:** contests survived, alien fights, audience trials, integration
    milestones, the mantle passing, a death in the village

  Chores are capped per day.
- **Kits are magic only.** Every magic ability sits in exactly one kit
  (fusion_reactor is excluded: one per world). Human competences are villager
  **skills** (`v.npcSkills`), learned at track levels 2 and 4. They take no
  slot and still answer `npcHasAbility`.
- **The player's level-up** is a sheet offering the next 3 unheld kit
  abilities of that track (`src: 'level_up:<track>'`). With full slots, each
  pick replaces a held ability, or you can keep what you have. Pending
  level-ups queue and are never dropped.
- **Trial and practice deeds** that granted magic (adrenaline_control,
  trade_of_blows, adrenaline_surge, iron_stomach, war_cry) now credit their
  track once (+3).
- **Audience trials** teach one unknown skill, plus integration, plus strange
  XP. They no longer give a magic gift.
- **Jobs seed the lean.** Each occupation has `trackLean`, applied below the
  first threshold. Players get it at ×playerScale.
- **UI:** the character sheet shows a Tracks section after arrival (pips
  plus a thin bar).

## Step 7 measurement

**Setup:** `capable` policy, 8 seeds (7, 42, 99, 1234, 555, 777, 2026, 31337),
150 days. Each seed ran in its own process:
`SEED=<s> DAYS=150 POLICY=capable node scripts/sim-unified-tracks-20261014.js`.
"Before" is the same script run on a `git archive master` copy.

**Tuning rounds:**

| playerScale | conversation cap/day | villager skill levels | level-ups med (min–max) | villager godhoods (runs with ≥1) |
|---|---|---|---|---|
| 4 | 2 | every level | 11 (6–14) | 7/8 runs (median 3 per run) |
| 5 | 1 | 2 and 4 | 10 (6–11) | 1/8 |
| **6 (adopted)** | 1 | 2 and 4 | **8 (5–9)** | 0/8 |
| 6 + field-fight fix (final code) | 1 | 2 and 4 | **8 (5–9)** | 0/8 |

The final row is the committed code. It adds a field-fight fix: a lead
killed mid-round now ends the pack fight before morale. The fix was
exposed when villagers started learning haymaker before arrival. The
tables below are from that final run.

**Adopted settings, after vs before:**

| | before (master) | after |
|---|---|---|
| Player level-ups per run | — | **median 8, min 5, max 9** |
| Level-up sheets: picked / replaced / kept (means) | — | 6.9 / 2.75 / 0.75 |
| Player track levels (mean): combat / field / social / craft / strange | — | 1.25 / 2.25 / 2.5 / 0.13 / 1.63 |
| Villager System grants per run (mean) | 35.8 (mixed skill + magic) | 53.4 (all magic) |
| Villager skills learned per run (mean) | 0 (no store) | 15.5 |
| Magic held by living villagers at end (mean) | 0 | 8.5 |
| Villager godhoods | 0/8 runs | 0/8 runs (1/8 at scale 5) |
| Player godhoods (mean) | 0 | 0.5 |
| Days survived (median) | 91 | 97 |
| Invited to Table | 5/8 | 4/8 |
| Sat at the Table | 2/8 | 3/8 |
| Won | 2/8 | 3/8 |
| Arc sum | 29 | 28 |

**Per seed, after (final code):**

| seed | days | end | won | level-ups | combat | field | social | craft | strange |
|---|---|---|---|---|---|---|---|---|---|
| 1234 | 150 | survived | 0 | 9 | 2 | 2 | 3 | 0 | 2 |
| 2026 | 106 | village lost | 0 | 8 | 1 | 2 | 3 | 0 | 2 |
| 31337 | 79 | village lost | 0 | 7 | 1 | 2 | 2 | 0 | 2 |
| 42 | 92 | won | 1 | 7 | 2 | 2 | 2 | 0 | 1 |
| 555 | 97 | won | 1 | 9 | 1 | 3 | 3 | 0 | 2 |
| 7 | 95 | won | 1 | 5 | 0 | 2 | 2 | 0 | 1 |
| 777 | 72 | village lost | 0 | 8 | 2 | 2 | 2 | 1 | 1 |
| 99 | 115 | village lost | 0 | 9 | 1 | 3 | 3 | 0 | 2 |

## Reading it

- **~8 natural level-ups per run is met.** On top of that come the arrival
  gift, contest prizes, aid and purify offers, and the knack. All of them
  compete for 6 slots: the median run replaced 3 abilities and declined 1
  sheet.
- **Social and field dominate** for this bot. It holds a talk a day and
  forages. Craft barely moves: the bot rarely cooks or crafts. This is a
  policy shape, not an engine fault.
- **Win and Table effect:** wins went from 2 to 3 of 8 on the final code,
  and seats from 2 to 3. Wins stayed above baseline in every round (4, 5, 4,
  3). The
  likely cause is that the player now gets about 8 extra build choices with
  replacement, against a mostly fixed gift trickle before. Villagers also
  hold real magic now (before, the first kit entries were human skills).
  Eight seeds is small; treat the size of the effect as a signal to recheck
  with 16 seeds.
- **Villager godhood:** the first version (a skill at every level) made
  godhood trivial: a median of 3 villager godhoods per run, against the
  5–15% of runs target. Merged skills carry several pool abilities
  (track_read = tracker + game_sense + blood_trail). Teaching skills only at
  levels 2 and 4 brought it back to 0–1 in 8 runs. The cores stay reachable:
  rage and echo_location are magic kit items at level 2, diplomat and triage
  are the first villager skills.

## Not done or logged (non-critical)

- **Tracks are the office's progression.** Like slots and integration, they
  pass with the mantle. The successor's own villager XP is not merged in.
- **Villagers have no deed for strange** apart from contests they survive.
- **Wording:** party-bond's shieldbearer line still says "the System offers"
  for what are now villager skills.
- **Sims:** `[keepsakes] flashback: Cannot read properties of undefined`
  shows up in sims on master too. It predates this change.
