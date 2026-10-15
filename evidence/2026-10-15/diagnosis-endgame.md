# Endgame diagnosis: gods, Table paths, Overtime and the Network

2026-10-15. Root causes behind three findings from the 64-seed dashboard
(`dashboard-base`, the capable bot, 150 days). Steve asked: "Look into and
diagnose root cause of all issues."

**Method.**
- Most of the work was targeted probes, one node process at a time: pinned
  state, debug scenarios, and single-seed runs that log one variable. Every
  probe is in `diagnosis-endgame-probes/` and takes `REPO=<checkout>`.
- Three 16-seed dashboards were run, one process at a time:
  - `dashboard-diag-base16`: after my two bug fixes, plain bot
  - `dashboard-diag-greedy16`: `CAPABLE_GREEDY=1`
  - `dashboard-diag-greedy-reckless16`: the bot waits regardless of strength
- No game numbers were tuned.

**Fixes made (2 game bugs, 1 bot mode), each with a RED→GREEN test on the
green list:**

| Commit | What |
|---|---|
| `db34573f` | Coalition blades never took a turn in titan, Finale or Network fights |
| `6f1d1282` | Titan and Network pieces vanished from the map after a lost fight. Also: a Network node whose piece died while its escort fled did not clear |
| (bot) | `CAPABLE_GREEDY=1` (wait for the key while strong) and `CAPABLE_READ_STAKES=1` (read the build option's stake). Both off by default |

---

## 1. Gods don't win more (7/18 vs 23/46)

**Root cause: selection, not god weakness.** Ascension is a marker of a long
run, and long runs are mostly runs the Table never invited.

**Evidence (`dashboard-base.json`):**

| | Runs | Invited | Sat | Won | Survived to day 150 unseated | Median days |
|---|---|---|---|---|---|---|
| Player ascended | 18 | 7 | 7 | **7 (7/7 = 100% of invited)** | 7 | 137 |
| No ascension | 46 | 32 | 24 | 23 (23/32 = 72% of invited) | 2 | 93 |

- **Of the runs that were invited, every ascender won.** Ascenders didn't
  lose at the Table. 11 of the 18 were never offered it.
- **Ascension can't happen before day 80** (`godpaths.json
  rules.capstone.minDay`). The bot sits on day 90 or soon after, so a run
  that sits on time has had about 10 days to ascend. A run that never gets
  the seat plays on to day 150 and has 70 days. Long, uninvited runs are
  where ascensions pile up.
- **Why those runs were never invited:** the lesser seat's wave-3 bar.
  See §1a. It is the same root cause that limits wins overall.
- **A god at the Table (pinned probe, `godtable.js`, 160 Table runs).**
  Setup: a lesser seat with a typical ledger; 4 god states (none and 3
  gods) × 5 doors × 4 seeds; stake-reading off and on.
  - **Wins: 160/160.** No god state won or lost more often.
  - **Gods failed doors only because of the bot.** With Living Garden,
    the bot picked the god's build option on 12 of 20 first doors and
    failed 8 of them: "(needs terror 4+)" was short. The label word
    "Feed" matches the bot's `LIGHT_WORDS`. It still won each time on the
    downgraded door.
  - With `CAPABLE_READ_STAKES=1`: 0 first-door failures for any god.
  - The seed-42 and seed-8 runs did exactly this in a live game
    (`doors.jsonl`).
  - This is BOT BEHAVIOUR.
- **Ascension has no mechanical power. GAME BUG (unwired feature).**
  - `godhood.js` says the ceremony "grants ONE qualitative godly verb".
    Of the 10 verbs, 9 have no caller anywhere in `src/`: `raiseEcho`,
    `chooseTerms`, `feedMultitude`, `turnPain`, `phaseOut`, `takeWound`,
    `walkHorizon`, `noLiesCheck`, and `resetFightVerbs`/`resetDayVerbs`.
  - The Market God's wrappers (`marketNamePrice`, `marketBuyPassage`) have
    no UI or bot caller.
  - `guardRegen` only runs from the never-called `resetDayVerbs`, so
    Gilded Guard coins never come back.
  - So `recognitionCeremony` gives only: the narration, `godhood.active`,
    the mythic sprite and the `god` field of the ending key. A god plays
    exactly like the same build before ascension.
  - `check-wired.js` misses all of this because the functions are
    "called" by `godhood.js`'s own export object.
  - Against Steve's "paint a path towards functional godhood … scary good",
    this is the real gap. It doesn't affect wins today, because the Table
    never reads power.

**Classes:**
- SELECTION / WORKING AS INTENDED for the win split (the Table never gates on
  godhood, and it doesn't)
- GAME BUG (unwired) for the god verbs
- BOT BEHAVIOUR for the stake misses

**Minimal fixes:**
1. Wire each god's verb where its subclass verbs already run. That is
   `godpath.js` (`do` on a data action, `absorbPlayerHit`), plus a dawn hook
   for `resetDayVerbs` and fight start for `resetFightVerbs`. This is the
   largest missing piece of the god path.
2. Make `check-wired` count an export-object entry as wired only if
   something outside the module calls it.
3. Turn on stake reading in the bot by default. It's a bot fix; it changes
   the dashboard, so the tuning lead should take it in a baseline round.
4. Compare god wins only on invited runs (wins / invited). The current
   metric mostly measures run length.

### 1a. Why runs aren't invited: the wave-3 bar is starved

The lesser seat (`table.js tableSeat`) needs 4/4/3 distinct monsters
**faced** from waves 1/2/3. Every other bar was met in these runs: national
or global standing, 10+ contests, 3–4 crises, stage 3 and the food deeds.

**Evidence:**
- **Full deed gate at the end of 10 never-seated long runs**
  (`gateprobe.js`), as w1/w2/w3/w4/w5 faced:
  - seed 777: 11/10/**1**/4/5
  - seed 16: 14/10/**1**/5/3
  - seed 31: 13/11/**0**/1/4
  - seed 38: 12/12/**1**/2/0
  - seed 39: 11/9/**1**/2/1
  - seed 9: 11/9/**0**/0/0
  - seed 2: 12/10/**2**/3/2
  - Seeds 2026 and 99 meet the wave bars but lack the food deeds
    (`feastSurgeUsed`).
- In the earlier sample (seeds 9, 16, 24, 31, 32, 38, 39, 40, 52, 777;
  `seatprobe`), every one had w3 ≤ 2. **12 of 14 uninvited long runs miss
  on wave 3 alone. 3 miss the food deeds.**
- **Runs that faced 4–5 wave-4 and wave-5 monsters still had no seat,
  because they faced only 1 wave-3 monster.**

**Why wave 3 is starved** (`waveprobe.js`, 16 seeds, per-day logs in
`waveprobe-16.jsonl`):
1. **Wave 3 unlocks late or never.**
   - `unlockedWave` needs 5 wave-2 kill points, capped at 2 per monster
     type.
   - The wave-3 unlock day ranged from 25 to 105, and never came on seed 9.
2. **When wave 3 opens late, standing already exceeds t4/t5, so waves 3, 4
   and 5 open together.**
   - Seed 777: 3 and 4 on day 105, 5 on day 108.
   - Seed 2: 3 and 4 on day 77.
   - Seed 16: from 2 straight to 5.
   - At top wave 5, `spawnWaveTarget` gives wave 3 only 12% of spawns.
3. **The roaming population saturates with wave-1 monsters and never
   rotates.**
   - `maintainWorldMonsters` only tops up to `worldMonsterCap` (5–9), and
     nothing retires an old monster.
   - Seed 16 carried 9–11 wave-1 monsters from day 10 to day 150. There
     was no wave-2 monster on the map until day 110 and no wave-3 monster
     ever.
   - 6 of 16 runs never had a wave-3 monster on the map on any day.
   - New waves reach the map only through the player's tile-entry spawns
     and raids.
4. **The bot stays home.**
   - The bearer was at Haven at 73–95% of daily checks.
   - `deedHunt` only targets monsters already within 4 nodes. It logged
     `capHuntNoTarget` 287 times in seed 16 and never walked out to cause
     a spawn.

**Classes:**
- DESIGN GAP: the seat asks for depth in a wave that the unlock ladder can
  skip or squeeze, and harder deeds don't count toward easier bars
- BOT BEHAVIOUR: the bot never roams to cause spawns

**Minimal fixes (levers for the tuning lead or Steve, not applied):**
- (a) Cumulative wave bars: a wave-4 or wave-5 monster faced also counts
  toward the wave-3 bar (and wave 3 toward wave 2). This is one line in
  `tableSeat` and `deedGateReady`. It's a design call ("faced harder"
  satisfies "faced"), so it goes to Steve or the tuning lead.
- (b) Retire one roaming monster from a stale wave when the population is
  at cap and a newer wave is unlocked.
- (c) Bot: when a bar is short and there's no target, roam into thicket or
  ruin tiles within 3 nodes.

---

## 2. Table paths: feared 12, beloved 8, relay 8, indispensable 2, never witness, defiant or assimilated

**Root cause: door strengths saturate at the 100 cap, and the bot picks the
highest strength.** Feared, Beloved and Relay are all at 100 in almost every
seated run, so the choice among them is the bot's random jitter. Defiant and
Assimilated are earned but priced lower, so they're never first. Witness is
never earned.

**Evidence: doors priced at the moment of seating** (`doorprobe.js`, 10
seeds, `doors.jsonl`):

| Door | Seeds where earned | Strength | Why |
|---|---|---|---|
| feared | 10/10 | **100** | `25 + distinct×3 + might×2`. Might was 42–134, so raw strength was about 110–360 |
| beloved | 10/10 | **100** | `20 + viewership + showmanship×2 + fan favor` |
| relay | 10/10 | 50–100, usually 90–100 | Stage 3: `40 + sysBond×10` |
| assimilated | 10/10 (always open) | 45–65 | `30 + embrace×5`, embrace 3–5 |
| defiant | 10/10 | 36–62 | Defiance 4–8 |
| witness | 0/10 | — | Ledger `exposed` was 0–1; it needs 3 |
| indispensable | 1/10 | 100 | Needs the full seat; seed 6 had it |

- **How the bot picks** (`capable.js scoreTableOption`): strength, plus 8 for
  a light branch, plus random 0–4. Every run was light on every door: the
  ledger's `killed` was 0 and `betrayed` 0 in all 10 runs. That leaves three
  doors tied at 108 ± jitter, which gives the observed roughly equal
  feared/beloved/relay split.
- Feared wins ties more often because Relay sometimes sits at 90.
- Assimilated and Defiant appear only as downgrade doors. The dashboard's
  `tablePath` records only the first door, so it hides them. Seed 42
  finished on Assimilated after Feared failed.
- **The overtime price can't change the order.** It is −4 per tier, capped
  at −40, and it is taken off a strength already capped at 100 from raw
  values that are far above 100.
- **Witness never opens.** `exposed` comes from:
  - exposing bribery
  - exile verdicts in cases
  - confessions from lie or theft confrontations (`truth.js`)

  The capable bot never runs any of these.
- **Dark branches never occur.** That needs killed > protected or a
  betrayal, and the bot plays kind.
- **The Table almost never loses once seated.**
  - Dashboard: 30 won of 31 seated.
  - Pinned matrix: 160 of 160 won.
  - A failed door downgrades to a door that is then won. Only trial by
    combat (never volunteered) or Assimilated as rock bottom can lose.

**Classes:**
- DATA/DESIGN: strength formulas with no ceiling-aware scale. The 100 cap
  erases what "standing" is meant to say.
- BOT BEHAVIOUR: no detective work, so no Witness; no dark play
- WORKING AS INTENDED: Indispensable needs the full seat
- DESIGN GAP, flagged for Steve: in practice, sitting means winning

The doors are not unreachable. Every door except Witness and Indispensable
is open in every seated run.

**Minimal fixes (not applied):**
- Rescale door strengths so typical runs land around 40–80 and differ.
  Ideas: use `log` or `sqrt` on might and viewership, or price against
  run percentiles. This is a tuning lever.
- Bot: score doors by branch fit and meter odds, not raw strength.
- Bot: add a detective layer (confront a lie or theft when a doubt is open).
- Steve: is a downgrade-then-win a real loss? With stakes plus downgrades,
  97–100% of seated bots win.

---

## 3. Overtime, the Network and THE HOSTS: never reached

**Root causes, from the outside in:**
1. **BOT BEHAVIOUR: the bot sits the day the seat is ready.** No Overtime
   means no key. Fixed by an opt-in mode (below).
2. **BOT BEHAVIOUR: the bot never fights a titan.**
   - The key needs the herald, nielsen and finale all slain
     (`networkKeyReady`).
   - In long runs, titans are located (omen stage 2; herald by day 69–119,
     the finale's crew on the map) but the muster is always empty:
     `titanprobe.js`, seeds 777 and 2026.
   - The bot never calls `soundTitanCall` or `titanCommitOwn`. It started
     a finale fight once and was refused as solo.
   - So the Network can't be summoned however long the bot waits.
3. **GAME BUG (fixed, `db34573f`): coalition blades never acted.**
   - `titanInjectAllies` added the blades to `tbfight.fighters` after
     `startCombat` had built `tbfight.order`, and never added their keys.
     The turn loop walks `f.order`.
   - Network scenario, first mast: 20 blades in the fight, 0 in the turn
     order. The player was alone against a 2400 HP mast plus a 1885 HP
     Cancellation.
   - The same was true of every herald, nielsen and Finale fight.
   - Tests built `order` by hand, so nothing caught it.
4. **GAME BUG (fixed, `6f1d1282`): a lost piece vanished.**
   - `startCombat` takes the player-tile monster off the map, and nothing
     put a titan-class piece back.
   - After a lost Network node with 20 blades alive, the game said "Re-face
     it when ready", but the piece was gone. That is a softlock: the key is
     silently lost.
   - After a lost herald fight, "the herald remains" was false. It was gone
     for good (10 dawns later, still gone, never slain). The apocalypse and
     the key were then out of reach for the run.
   - Also: the node's piece died while its escort disengaged → `routed` →
     the node did not count.
5. **DESIGN, WORKING AS INTENDED: the Network is a near-impossible fight.**
   Real blow-by-blow probe after the fixes (`netprobe.js`, the network
   debug scenario, 20 blades, camp heals assumed):
   - **Capable driver, default build:** the first mast falls in 44 rounds,
     with 7 of 20 blades dead.
     - Then the bot flees every later node in 3–6 rounds, with no losses
       (29 tries). Its flee logic rates a 2500 HP piece as "outmatched".
       That is BOT BEHAVIOUR.
   - **Strong build, capable driver** (`worldbreaker_maul`, 200 HP, six
     level-3 combat abilities): the player died at mast 1 twice, and the
     coalition went 20 → 9 → 0. The key is lost.
   - At about 7 blades per node, 20 blades can't reach the heart, which
     needs 10 blades over 9 nodes. That fits "almost impossible". Getting
     there needs builds that protect blades: Shepherd's Raise Echo and
     Ward's Take the Wound. Those are the unwired god verbs from §1.
6. **Overtime itself works and has teeth** (16 seeds):

   | Mode | Won | Overtime reached | Villages lost |
   |---|---|---|---|
   | Plain bot | 10 | — | 2 |
   | Greedy (waits while strong) | 10 | tier 1–2 in 4 runs | 2 |
   | Reckless (always waits to tier 4) | **5** | tier 4 in 5 runs, tier 3 in 1 | **7** (5 more, all during Overtime) |

   - Under the reckless bot, villager deaths in waiting runs roughly doubled
     (seed 42: 12 vs 1; seed 5: 10 vs 3).
   - "Waiting should have a cost": confirmed. No run summoned the Network,
     because no titan was ever slain.
   - In greedy mode, waits end early because Haven drops below 5 people or
     loses 3 within 1–2 weeks. Seed 4's Haven has 2 people by day 90.

**Greedy mode** (`scripts/policies/capable.js greedyWaits`,
`CAPABLE_GREEDY=1`):
- It waits while:
  - the seat is ready and there is no key
  - the tier is under `CAPABLE_GREEDY_MAXTIER` (default 4)
  - the day is under `CAPABLE_GREEDY_LASTDAY` (default 145)
  - Haven has 5+ people and has lost under 3 since Overtime began
  - the bearer is above 40% HP
- `CAPABLE_GREEDY_RECKLESS=1` drops the strength checks.
- Proof: `scripts/test-capable-greedy-20261015.js`. In a real seed-1 run it
  reaches tier ≥ 1, then sits.
- Recommendation: keep it off for the dashboard. Measuring the key needs
  greedy mode **plus** a titan layer in the bot: sound the call when a
  titan is located, commit Haven blades, march. Without that, the Network
  stays at 0 by construction.

**Is the Network reachable at all?**
- Before today's fixes: no. The coalition never acted, and the first lost
  node softlocked the march.
- Now: yes in principle. A node can be won (mast 1 fell in a real fight), a
  lost node can be faced again, and THE HOSTS resolve. `takenhome` and
  `test-overtime-network` (green) cover the Table side.
- With today's kit it is "almost impossible" by blade attrition, which is
  the design.

---

## Summary

| # | Root cause | Class | Status |
|---|---|---|---|
| 1 | God runs win less because ascension marks long runs that never got a seat (invited ascenders won 7/7). God verbs give no power (9/10 unwired) | Selection + GAME BUG (unwired) + BOT (stakes) | Diagnosed; stake reading added (opt-in); god verbs need wiring |
| 1a | Seat's 3 distinct wave-3 bar starved: late or skipped wave-3 window, saturated non-rotating roaming population, bot stays home | DESIGN GAP + BOT | Levers proposed (cumulative bars, rotation, bot roam) |
| 2 | Feared, Beloved and Relay all hit strength 100, so the bot's jitter decides; Assimilated and Defiant are priced lower; Witness never earned (no detective play) | DATA/DESIGN + BOT | Diagnosed; rescale is a tuning lever |
| 3 | Bot sits at 90 and never fights titans. Game: coalition blades had no turns, lost pieces vanished (softlock) | BOT + 2 GAME BUGS | Both bugs fixed; greedy mode added and measured |

**Proof:** `scripts/test-coalition-turns-20261015.js` (RED 3/6 → 6/6),
`scripts/test-titan-piece-holds-20261015.js` (RED 4 failing → 12/12),
`scripts/test-capable-greedy-20261015.js` (13/13). `node scripts/check.js
--quick` green (91 + new). Titan, finale, combat and capable green-list areas
are green.

**Caveats:**
- `doors.jsonl` and `waveprobe-16.jsonl` were recorded before the two fixes.
  The fixes only touch titan-class fights, which those runs didn't contain.
- The 16-seed dashboards are after the fixes.
- The Network probe heals the player fully between nodes and skips march
  upkeep. It is an upper bound.
