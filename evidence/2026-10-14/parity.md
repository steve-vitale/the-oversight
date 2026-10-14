# Parity: villagers and the player, treated the same

*2026-10-14. Steve: "Villagers and players should get the same XP, when in
doubt we treat them the same way. You should get to swap on level up or keep
existing. No I don't think you should take your XP or the abilities. You
become that villager. That's why you have to treat villagers and players as
similarly as possible, and villagers need to act in smart ways, including
towards getting good gear and builds. They want to win as well." Also: "Yes
any death for strange path" and "Villagers can't just take the next ability,
they need to seek knowledge about the abilities and go for a build that suits
their technology."*

## What changed

1. **One XP scale.** The player's 6x `playerScale` is gone. Everyone uses the
   same thresholds, `[18, 48, 96, 192, 384]`. These are the old player
   numbers, so a player's XP in an old save is already on this scale.
   Occupation lean was rescaled to match (x6, still below the first
   threshold).
2. **Same deed, same XP.** `creditDeed(who, deedId)` uses one deed table with
   the same `n` and the same per-day cap for each doer. Every villager site now
   credits a deed id instead of a hand-picked number. Villager duties that
   earned nothing now earn the player's deed:
   - forage duty: foraging
   - cooking: cooking
   - mending: crafting
   - teaching: teaching
   - scouting: discovery
   - a chore lesson that lands: teaching
   - a held conversation: conversation (for the villager too)

   Field fights map to the player's deeds: a kill is `fight_won`, and fleeing
   or evading is `fight_survived`. Tending the garden is a new `gardening` deed
   for both.
3. **Strange track.** Any village death credits `death_in_family` to the
   player and to every living villager. Before this change, villagers got
   nothing.
4. **Villagers choose like players** (`src/js/villager-build.js`):
   - **Sheets.** A villager gets the same 1-of-3 sheet as the player and picks
     with `buildScore`. When their slots are full, they swap the weakest
     ability only if the offer beats it by more than 1. Otherwise they keep
     what they have. `buildDecide` applies this rule, and the capable bot now
     uses the same function.
   - **Knowledge.** Villagers have ability knowledge on the same 0–3 levels as
     the codex. They learn from:
     - seeking: asking a villager or the bearer who holds or knows an ability
     - the System's broadcast, when nobody can teach them
     - a held conversation with the bearer
     - watching abilities used in fights
     - knack gossip
   - **Deferring.** A villager who knows too little to choose holds the sheet
     for up to 3 days and spends their objective on SEEK.
   - **Build plans.** Each villager keeps a target build: up to 6 abilities
     they know or hold, re-planned daily. The track that their next target
     ability needs weights their errand choice.
   - **First ability.** A villager's first ability comes from the same 3
     lifeseed choices as the player's. It goes in slot 1, picked by
     `buildScore`.
5. **Gear** (`villagerGearDay`, a daily greedy pass). Each villager wears the
   best of their own things and stash. Spare gear goes to whoever gains most;
   nobody gives up what they are wearing. Armory weapons go to the biggest
   build-weighted gains first, one per villager per day, and the weapon each
   one replaces goes back on the pile. Field fights already read weapon and
   armor. The test shows that an armed villager leaves a 160-HP gallowdeer
   with less HP.
6. **The mantle** (`mantleBecome`). The successor keeps their own abilities,
   tracks, XP, skills, ability knowledge, godhood and worn gear. The dead
   bearer's abilities and XP die with them. The full field list is in the
   report and in the `mantleBecome` comment.

## Measurement

All runs use the `capable` policy and 150 days, one process per seed:
`SEED=<s> DAYS=150 POLICY=capable node scripts/sim-parity-20261014.js`.
"Before" is the same script run on a copy of master at `731b3955`. The
required 8 seeds are 7, 42, 99, 1234, 555, 777, 2026 and 31337. Seeds 1–6, 8
and 9 were added to make 16, because the 8-seed results swung a lot between
near-identical builds (see below).

How to read the columns:
- **Player level-ups** counts every bearer's threshold crossings in the run.
  After this change, a successor climbs their own tracks again.
- **Villager level-ups** counts the threshold crossings of all villagers in
  the run.
- **Gear** is the daily mean of weapon bonus plus armor per living villager.
- **Armed** is the daily share of living villagers who carry any gear.

| | before, 8 seeds | **after, 8 seeds** | before, 16 seeds | **after, 16 seeds** |
|---|---|---|---|---|
| Player level-ups, median (min–max) | 8 (5–9) | **9 (4–12)** | 7 (5–9) | **8 (4–12)** |
| Villager level-ups per run, mean | 56.5 | **15.9** | 53.9 | **14.9** |
| Villager gear score (daily mean) | 15.8 | **20.8** | 16.1 | **22.3** |
| Villagers armed (daily share) | 0.68 | **0.97** | 0.65 | **0.98** |
| Villager seeks per run, mean | 0 | **20** | 0 | **18.6** |
| Villager sheets swapped / kept (total) | n/a | **1 / 0** | n/a | **2 / 0** |
| Villager godhood recognitions (total) | 0 | **6** | 2 | **8** |
| Won | 3/8 | **2/8** | 6/16 | **4/16** |
| Sat at the Table | 3/8 | **2/8** | 6/16 | **4/16** |
| Invited | 4/8 | **6/8** | 7/16 | **11/16** |
| Median days | 96 | **100** | 97 | **96.5** |
| Village lost | 4/8 | **5/8** | 7/16 | **11/16** |

**Tuning the shared thresholds.** These rows were run on earlier builds of
the same change. They are 8 seeds each.

| first threshold | player level-ups, median (min–max) | notes |
|---|---|---|
| 15 `[15, 40, 80, 160, 320]` | 9–10 | stage 1 alone, then all stages |
| 16 `[16, 44, 88, 176, 352]` | 10 (7–17) | all stages |
| **18 `[18, 48, 96, 192, 384]` (adopted)** | **7–9 (8 on 16 seeds)** | all stages; the same numbers as the old player scale |

**Stage 1 alone** (one scale and symmetric deeds, villagers still taking kit
order) gave 7 player level-ups, 8.6 villager level-ups per run, 2 of 8 wins
and 6 of 8 villages lost.

**The 8-seed result is chaotic.** Two builds that differed only in how many
shared random draws a villager's first-ability pick consumed gave 5 of 8 wins
and 3 of 8 lost on one, and 2 of 8 wins and 5 of 8 lost on the other. Two
ablations on the first of those builds both gave 4 of 8 wins: one without the
gear pass, one with the bot on its old scorer. Trust the 16-seed columns over
any 8-seed column.

**Per seed, after (final code):**

| seed | days | end | won | player level-ups | villager level-ups | gear | armed | seeks | mantles |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 150 | survived | 0 | 6 | 29 | 28.5 | 0.90 | 12 | 7 |
| 42 | 75 | village lost | 0 | 4 | 15 | 17.9 | 0.99 | 31 | 7 |
| 99 | 123 | village lost | 0 | 12 | 16 | 18.5 | 0.99 | 26 | 8 |
| 1234 | 82 | village lost | 0 | 8 | 6 | 15.0 | 0.95 | 15 | 5 |
| 555 | 88 | village lost | 0 | 10 | 11 | 17.7 | 0.99 | 20 | 2 |
| 777 | 127 | won | 1 | 10 | 19 | 27.2 | 1.00 | 22 | 3 |
| 2026 | 74 | village lost | 0 | 5 | 11 | 11.4 | 0.99 | 17 | 9 |
| 31337 | 112 | won | 1 | 10 | 20 | 30.0 | 0.96 | 17 | 4 |
| 1 | 96 | won | 1 | 8 | 9 | 26.4 | 0.99 | 17 | 2 |
| 2 | 97 | village lost | 0 | 8 | 13 | 27.7 | 0.99 | 20 | 6 |
| 3 | 127 | won | 1 | 11 | 25 | 19.7 | 1.00 | 13 | 7 |
| 4 | 86 | village lost | 0 | 6 | 10 | 33.2 | 0.99 | 19 | 5 |
| 5 | 84 | village lost | 0 | 6 | 10 | 13.1 | 0.99 | 15 | 8 |
| 6 | 106 | village lost | 0 | 6 | 11 | 22.0 | 0.92 | 17 | 7 |
| 8 | 119 | village lost | 0 | 12 | 17 | 26.2 | 0.98 | 24 | 8 |
| 9 | 96 | village lost | 0 | 7 | 16 | 23.1 | 0.99 | 13 | 8 |

## Reading it

- **Player: about 8 level-ups is met.** The median is 8 on 16 seeds, with a
  range of 4 to 12. The range is wider than before because a successor climbs
  their own tracks.
- **Villagers level about 3.5x slower, not faster.** One scale and capped,
  symmetric deeds took villager level-ups from about 54 to about 15 per run.
  A villager's day holds far fewer capped deeds than the bearer's, so no
  asymmetry fix in the other direction was needed. No fudge factor was added.
- **The village is weaker in magic.** Villagers at the end of a run hold
  about 9 to 30 abilities between them, against 34 to 74 before. More
  villages were lost: 11 of 16, against 7 of 16 before. Wins went from 6 of
  16 to 4 of 16. Invitations rose from 7 of 16 to 11 of 16, so the bearer
  still gets to the Table. The village dies more often before the seat. This
  is the main balance cost of parity, and a call for Steve (see the report).
- **Villagers act smart.** Nearly every living villager is armed (0.98
  against 0.65), and gear scores rose about 40%. Each run has about 19 seeks.
  Villager godhood recognitions rose from 2 to 8 over 16 runs: villagers now
  build toward synergies on purpose.
- **Swaps are rare.** Villagers seldom fill 6 slots at the slower level rate.
  The keep and swap rule is proven in `scripts/test-parity-20261014.js`.
- **No new warnings.** None of the touched modules logged any. The known
  `[keepsakes] flashback` warning predates this change.

## Not done or logged (non-critical)

- **Books as a source of ability knowledge** are not wired. Contests teach
  only through the deed and gossip paths.
- **Recruits** who join after day 1 get their first ability at the next daily
  tick, not on arrival.
- **Villager haven chores from objectives** (cook, repair) are flavor only.
  They credit no deed, because they produce nothing. Assigned duties do
  credit deeds.
