# Diagnosis: why the bearer dies so often (2026-10-15)

Steve: "Look into and diagnose root cause of all issues." This note covers
death rates. The law that applies: "It should be a fight. A hard one."
(`fieldFights.js`) and "contests are to be played, not as RNG."
(`contestEngine.js`).

**The short answer:** three quarters of bearer combat deaths happened at
Haven, in fights the bearer could not decline and the bot would not leave.
Most of that was the bot. Two smaller pieces were game bugs. The rest is
design that Steve should look at (raids, the alien beam, and a bearer whose
HP never grows).

## Method

- **Probe:** `scripts/probe-deaths-20261015.js`. Observe-only: no decisions
  changed, no `Math.random` draws. One seed per process, capable bot,
  150 days. It records:
  - every fight the bearer is in, whatever created it (it watches the
    `tbfight` slot), with the call stack that started it;
  - the monsters (id, wave, HP), the bearer's HP at the bell, and the
    bot's flee state;
  - a per-round trace (HP before and after the monsters' turn, the
    actions taken, monster distance and telegraphs);
  - the source of every pending encounter;
  - for each death, the cause and code path, plus the last contest choices.
- **Seeds:** 32 (the standard 16, and 10–25), run one at a time, on
  origin/master `eed0e6df`. That commit already has the route-around and
  thirst bot fix, so the dashboard's dehydration spike is gone here.
- **"Before"** means the bot fixes are switched off with their A/B gates.
  "After" means all fixes are on.
- **Swallowed errors (`SIM_CATCH=1`):** only `map` is null in early
  `drama()` calls and `localStorage` is missing. Neither is on a combat or
  death path.

## Breakdown (before fixes, 32 seeds)

132 bearer deaths, or 4.1 per run. The 64-seed dashboard has 4.8.

| Cause | Deaths | Share |
|---|---|---|
| combat | 99 | 75% |
| contest | 16 | 12% |
| sickness, lockjaw, thirst, hunger, other | 17 | 13% |

### Combat deaths by where the fight came from

| Origin | Deaths | Fights | Fights that killed |
|---|---|---|---|
| **Haven: a raider on the Haven tile walks up (monsterTurn)** | **40** | 150 | 27% |
| **Haven: feast-draw scavenger, faced automatically** | **27** | 134 | 20% |
| Alien "Stranger" (travel encounter) | 12 | 30 | **40%** |
| Haven: raid wake-up (no palisade, pending encounter) | 9 | 155 | 6% |
| Arena (pit, gauntlet, siege contests) | 6 | 57 | 11% |
| Bot hunt sorties (feast or wave deeds) | 3 | 125 | 2% |
| Wild travel or forage | 1 | 90 | 1% |
| Other | 1 | — | — |

- **76 of 99 combat deaths happened at Haven** (4,4).
- The fights the bot picks are safe: hunt sorties kill 2% of the time,
  wild encounters 1%.
- The killers are fights the bearer is put into.

### Flee status of the fatal fights

| Flee status | Deaths |
|---|---|
| **Wanted to flee (low HP, outmatched or losing race), at Haven, never left** | **68** |
| Never wanted to flee: away from Haven (aliens, Highbeam deer, packs) / at Haven | 14 / 6 |
| Wanted to flee, away from Haven | 5 |
| Sealed (arena) | 6 |

### When, against what, at what HP

| Bucket | Combat deaths |
|---|---|
| By day: 1–29 / 30–59 / 60–89 / 90+ | 14 / 21 / 41 / 23 |
| By wave: 1 / 2 / 3 / 4 / 5 / person | 19 / 4 / 16 / 27 / 21 / 12 |
| HP at the bell: ≥90% / 70–89% / <70% | 73 / 18 / 8 |

- **Monsters:** gallowdeer (Highbeam Deer) 14, reunion 13, alien Stranger
  12, ad_break 7, editor 5, timeslot 5, rerun 4, influencer 4, eater 4.
- **Bearer max HP was 100 in 98 of 99 fatal fights**, from day 8 to day 140.
  A wave-4/5 monster has 1,000–1,900 HP. In the traces, two or three
  wave-4 hits take a full bearer to 0 in one monster phase.
- **The bot does not fight while weak:** 73% of deaths began at 90%+ HP.

### Sample traces (the last rounds, HP before → after the monsters' turn)

- **555 d72, 3× reunion (w4, about 1,230 HP each), at Haven:** 100→100,
  100→100, 100→77, 77→**dead**. The bot wanted to flee from round 1
  ("outmatched"), held at Haven and kept striking.
- **2 d90, audit pack (w4, 1,746 + 1,222 HP), feast draw at Haven:**
  61→29, 29→**dead**. It wanted to flee ("low-hp") and held.
- **7 d93, timeslot (w5, 1,619 HP):** 100→53, 53→**dead**. It wanted to
  flee and held.
- **Aliens:** every alien death ends with one drop equal to all remaining
  HP: 84→X, 100→X, 94→X, 82→X, 43→X. That is the beam: 90–110% of max HP,
  armor ignored, no wind-up (`alienPlayers.js` `apBeamHit`). The bot never
  wanted to flee. A Stranger has 80–110 HP, so it does not look like a
  dangerous fight.

## Root causes, ranked by share of bearer deaths

| # | Root cause | Share of all 132 bearer deaths | Class | Status |
|---|---|---|---|---|
| 1 | **The bot holds its ground at Haven.** `competent.chooseFleeDir` returns "hold" on the Haven node, because Haven used to be where a flee ends. But raiders, feast draws and breaches happen *at* Haven. Inside the hall the grid edge is all wall, and the only exits are the doors (`tbPlayerMove`: "Walls don't work, doors do"). The bot never used them. | 68 deaths wanted to flee and stayed (52% of all bearer deaths) | **BOT** | **Fixed** (`89c09084`) |
| 2 | **The feast draw was never a choice in sims.** The app offers "Face it / Let the watch drive it off". `sim-harness` `driveContestsImpl` called `startCombat` on every pending encounter, so no policy could decline. The draw is cast by `castMonster`, which picks by wave and does not rate the threat (the comment in `drawFeastScavenger` says "threat-rated, never a horror over a pointy stick"; the code is not). Wave-3/4/5 scavengers ended up against a 100 HP bearer. | 27 (20%; overlaps #1) | **BOT/harness** (+ a comment that is wrong) | **Fixed** (harness `policy.pending` hook, capable decides) |
| 3 | **Raids pin wave-4/5 monsters to the Haven tile.** `havenRaidTick` moves the 3–5 *nearest* world monsters of any wave onto Haven, which breaks the one-monster-per-tile rule. Lingering ones are re-pinned each dawn. `monsterTurn` then walks them up to the bearer, awake or asleep, palisade or not. Steve's "breach" crisis says Haven can be breached, so meeting a raider is design. But the palisade promises "the watch holds at night (sleep is never interrupted)", and 5 bearers died in their sleep behind a palisade. | 49 (37%) all told; 5 asleep behind a palisade | **DESIGN** (the threat); **GAME BUG** (palisade sleep) | Palisade sleep **fixed** (`c6cff1a4`); the rest is a question for Steve |
| 4 | **Bearer HP does not scale.** Max HP stays 100 all run, while monster HP grows about 30× (wave 1 about 54 mean, wave 5 about 1,700). From wave 4 on, any fight that can't be escaped is lost. | Behind most w4/w5 deaths (48 of 99 combat) | **DESIGN** (tuning lever) | For the tuning lead |
| 5 | **The alien beam is an execution.** 90–110% of max HP, armor useless, 25–40% chance per alien turn from the alien's second turn. Turn order often lets it fire after the player's first action. There is no wind-up, unlike every other heavy attack (the alien's own heavy strike has one). No Steve quote covers the beam: "THIS IS NOT A FAIR FIGHT. Run" is game text. The bot can't know a Stranger carries a beam ("if you don't know, it doesn't show"). | 12 (9%); after the fixes it is the largest single bucket (25% of combat deaths) | **DESIGN** (question for Steve) | Not fixed |
| 6 | **Lethal contest choices.** The bot priced damage in the abstract and ignored HP. It bled "One more measure" into the Blood Tithe at 2–37 HP, even though the extreme billing applies ×1.5 and says so aloud (9 deaths). It turned to face the Maw (4), plus one each in price and auction. | 15 (11%) | **BOT** | **Fixed** (`89c09084`) |
| 7 | **An arena death killed the successor too.** `tbEnd('lost')` passed the mantle first, sometimes to a villager taken into the same contest. `_contestArenaAfter` then resolved that villager's off-screen fight and killed the new bearer in the same beat. | 2 (1.5%); on the dashboard, seeds 28, 34, 51 have the same-day combat + contest pair | **GAME BUG** | **Fixed** (`31f72a2a`) |
| 8 | **Highbeam Deer (wave 1, 150–170 HP) at Haven.** Raids and feast draws bring it to a bearer at full HP. It isn't rated as outmatched (170 < 2.5 × 100), and its beam does the killing ("The beam itself is the argument for leaving."). | 14 (11%; overlaps #1–3) | **BOT** (flee rule) / DESIGN | Mostly covered by #1 and #2. A deer-specific flee rule is not done. |

## Should contests kill the bearer?

Yes. The canon says so, and contest deaths are as intended *by the rules*:
- Steve 2026-10-08: "No, contests are to be played, not as RNG." Death comes
  only from real damage reaching 0.
- The FEAR HONESTY rule bills high and extreme contests at ×1.5 and says
  so aloud ("People die in this one. Regularly." used to be decoration).
- Shows and summons are capped at 1 HP. "TV doesn't kill."

All 15 phase-choice deaths were the bot picking a choice that, at its
current HP, was certain or likely to kill, when a non-lethal winning choice
existed: in the tithe that is "Offer your name instead" (trauma 12, WIN).
So this was a bot bug, not a rule bug. After the fix, 2 contest deaths
remain in 32 seeds: one co-taken successor (now fixed in game) and one
"longodds" at 15 HP.

## Villager deaths

**"villager combat" (428 on the dashboard) is not villagers dying.** It is
**monsters killed by villagers** in their own field fights:
`registerDeath({kind:'monster', cause:'villager combat', killerId: vid})`
in `game.js` `resolveWildMonsterEncounter`. The dashboard files it under
"other", which is correct. As intended.

**"villager: monster" (325)** is villagers killed by monsters. On 16 seeds
(82 of these deaths):

| Where the villager died | Deaths | Share |
|---|---|---|
| Their own wild encounters (`villagerMonsterTick`) | 63 | 77% |
| Defending Haven in a raid (`havenRaidTick`) | 19 | 23% |

**Measurement bug in `sweep-dashboard.js`:** `deathGroups` sends every kind
other than player and villager to "other". Kind `person` is a villager (or
an allied face) who falls in a turn-based fight, an alien "playground"
kill, or a hostile human the bearer kills. On 16 seeds there were 57
`person:combat` deaths (40 of them in the bearer's fights at Haven) and 10
`person:alien`. So the dashboard's "villager" total undercounts villager
deaths by roughly half, and its "other: combat 1347" mixes monster kills
with villagers who fell. Not fixed here, because the tuning lead's live
sweeps compare against this format.
- **Recommendation:** add a fourth group (`person`) in `deathGroups` and
  regenerate the baseline.

**After the fixes, villager deaths rose** (194 → 263 on 32 seeds, while game
days rose 7%):
- Fewer bearers died, so fewer villagers were promoted out of the roster,
  and more villagers stayed exposed.
- The rise is all in wild and raid encounters. Villagers falling in the
  bearer's Haven fights went down (40 → 17).

## Fixes made (3 commits, not pushed)

1. **`31f72a2a` GAME BUG, arena succession.** Co-taken fates now resolve
   before the mantle passes (`tbEnd`, lost branch). Proof:
   `scripts/test-arena-cotaken-succession-20261015.js` (RED: two bearer
   deaths in one beat; GREEN: one).
2. **`c6cff1a4` GAME BUG, palisade sleep.** While the bearer sleeps at
   Haven behind a palisade, the monster on the tile takes no turn
   (`monsterTurn`). Proof: `scripts/test-palisade-sleep-20261015.js` (RED:
   a raider starts the fight on a sleeper behind the wall; GREEN: it
   doesn't; without a wall, or awake, it still does).
3. **`89c09084` BOT, capable plus harness.**
   - **Haven escape:** take the hall door, or the grounds barrier, when
     outmatched at Haven.
   - **Feast draw:** `sim-harness` asks `policy.pending` before facing a
     pending encounter. Policies without the hook are unchanged. Capable
     drives off a draw it would be outmatched by and faces a fair one.
   - **Lethal contest choices:** a choice is priced by its chance to kill.
     That reads damage the way `contestChoose` applies it (hardened ×1.25,
     high/extreme ×1.5, shows never kill) and reads the Maw's distance.
   - **Gates:** `CAPABLE_HAVEN_FLEE=0`, `CAPABLE_DRAW_DECIDE=0`,
     `CAPABLE_CONTEST_LETHAL=0`.
   - **Proof:** `scripts/test-capable-death-fixes-20261015.js`. With each
     gate off the old behaviour shows (RED); with the gate on it is fixed
     (GREEN).

All three tests are on the green list. `node scripts/check.js --quick`: 92/92.

## Before and after

32 seeds × 150 days, capable bot. The after columns are bot fixes only;
the last two columns are the 16 standard seeds with all fixes.

| | Before (32) | After, bot fixes (32) | 16 std, before | 16 std, all fixes |
|---|---|---|---|---|
| Bearer deaths | 132 (4.1/run) | 100 (3.1/run) | 68 | **41** |
| combat | 99 | 64 | 48 | 25 |
| contest | 16 | 2 | 9 | 0 |
| lockjaw | 3 | 15 | 2 | 4 |
| Combat deaths at Haven | 76 | 25 | 33 | 11 |
| Wins | 16 | 15 | 10 | 6 |
| Game days | 3,477 | 3,727 | 1,777 | 1,905 |

**Reading:**
- **Deaths fell by a quarter to 40%.**
- **Wins are flat within noise:** the second batch went 6 → 9 while the
  standard 16 went 10 → 6. The tuning lead should confirm wins on the
  64-seed dashboard before relying on this.
- **Lockjaw rose:** bearers who now survive wounded fights die of lockjaw
  later. The bot never treats it. That is a bot gap; see the next section.
- **Remaining deaths:** the largest bucket is alien Strangers (16 of 64).
  The rest are raiders still engaging awake bearers at Haven (19), arena
  fights (9), wild (8), raid wake-ups (5) and betrayals (3).

## Recommended next steps (not done)

**For Steve (design):**
1. **Raids.** Should raiders be the nearest monsters of *any* wave, stacked
   3–5 deep on the Haven tile? Today a wave-5 raider at Haven is a death
   sentence for anyone who meets it. The 2026-10-14 predation study found
   0 of 17 drive-offs against wave-4/5 lingerers. Options:
   - raids draw threat-rated monsters;
   - raiders hold the treeline (outside the hall) and are met by choice.
2. **The alien beam.** Should it telegraph (a wind-up turn, like every
   other heavy attack and the alien's own heavy strike)? Today it is a
   one-shot with no counterplay, and the "no beam on the opening turn"
   guard only protects the alien's first turn.
3. **Bearer HP is flat at 100 from day 1 to day 150.** Is that intended
   against waves 4–5? This is a tuning lever, owned by the tuning lead.

**For the tuning lead:**
1. Add the `person` death group to `sweep-dashboard.js` (see the
   measurement bug above).
2. Re-baseline: the bot change moves death counts a lot. Compare only
   against post-`89c09084` dashboards.
3. **Smaller game issue:** fix the `castMonster` "threat-rated" comment in
   `drawFeastScavenger`, or make the feast draw actually threat-rated.

**For the bot:**
1. Flee a known beam-carrying alien when the bearer lacks resistant gear.
   Gate this on `apKnowsAlien`, because the player only learns of the beam
   after meeting it.
2. Treat Highbeam as a reason to leave.
3. Treat lockjaw.
4. Answer the aid crisis: `callForHelp` was called 0 times by the capable
   bot.
