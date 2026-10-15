# Progression diagnosis: craft, social, strange, held abilities, teaching (2026-10-15)

Steve: "Look into and diagnose root cause of all issues."

**Inputs**
- The 64-seed dashboard (capable bot, 150 days, `dashboard-base.md`).
- Two observe-only probes on master `eed0e6df` (capable bot): seed 7 for 60 days and seed 42 for 100 days.
- The probes wrap `gainTrackXP`, `creditDeed`, `tele` and a few player verbs. They never change a decision.
- Probe code and output are in `diagnosis-probes/`.

**Classes used below:** GAME BUG, DESIGN GAP, DATA, BOT BEHAVIOUR, WORKING AS INTENDED.

## Summary

| # | Issue | Root cause | Class | Status |
|---|---|---|---|---|
| 1 | Player craft: 1 level-up in 64 runs | (a) Cooking credited the deed only on the legacy beans/rice path. (b) The bot never cooks, heals or crafts successfully. (c) The reliable craft deeds are villager-only haven jobs. | GAME BUG + BOT BEHAVIOUR + DESIGN GAP | (a) **fixed** `d94a0454`. (b) and (c) are recommendations. |
| 2 | Social leads everywhere (231 / 468) | Conversation is the one zero-risk daily deed. It credits **both** sides of every bearer talk. Villagers have 5 social feeders, and the same contest pays villagers in social but the player in strange. | DATA + DESIGN GAP | recommendation |
| 3 | Strange: player 82, villagers 9 | "Any death" works, but it gives 1 XP against an 18 XP first threshold. Every other strange deed can only be earned by the player. | DESIGN GAP + DATA | recommendation |
| 4 | Final bearers hold fusion / kit-head junk; the new verbs are almost never held | (a) The mantle freed the world's reactor, and gifts kept dropping pellets. (b) The contest-gift steering was a no-op. (c) Kits are ordered weakest first and the sheets read the head of the kit. Few level-ups per person, and every final bearer is a successor carrying a villager build. | GAME BUG ×2 + DATA/DESIGN | (a) **fixed** `dc717672`. (b) **fixed** `7333b438`. (c) is a recommendation. |
| 5 | Teaching: 33 lessons/run, 0 with the player | The lesson options appear in about 95% of the player's conversations. The bot never picks them. | BOT BEHAVIOUR | recommendation (policy) |

---

## 1. Craft track: the player got 1 craft level-up in 64 runs (villagers 234)

**What credits craft** (`src/data/tracks.json` deeds):

| Deed | XP | Per-day cap |
|---|---|---|
| `cooking` | 1 | 1 |
| `crafting` | 1 | 2 |
| `healing` | 1 | 2 |

- Thresholds are 18 / 48 / 96 / 192 / 384, the same for everyone.
- There is **no** `building` deed. `buildBridge`, `setUpCamp` and `membership.js buildShelter` credit nothing.
- "Mending" is the villager haven role `mend`. It credits `crafting`, for villagers only (`game.js resolveOneAssignment`).
- Preserving goes to **field**, not craft.

**Where the player can earn craft:**

| Path | Player calls in the probes |
|---|---|
| `cookFood` / `cookAll` | **0** |
| `craft` (succeeds only) | seed 7: 38 calls, 1 OK. All 37 failures: "You don't know how to make a Arrow yet." Seed 42: 0 calls. |
| `treatVillager` (healing; needs a medical skill at L2, a sick villager and 150 kcal) | **0** |

The player's craft XP over 58 days on seed 7 was 1 from crafting and 3 from a converted trial deed.

**Villager craft by comparison (seed 42, 100 days):**
- cooking 112 (the cook-duty villager; 35 credits refused by the daily cap)
- healing 74 (the camp healer)
- crafting 4

These are daily haven jobs the player cannot hold.

**Root causes:**

1. **GAME BUG (fixed, `d94a0454`).** `food.js` wraps `G.cookFood` and `G.cookAll`. Their two real branches, cleaned meat and must-cook plants, `return null` without `noteDeed('cooking')`. Only the legacy `rawKcal` path in `game.js cookFood` (dried beans/rice) credited the deed. A human player cooking meat or tubers earned no craft XP.
   - Proof: `scripts/test-cook-deed-20261015.js`, 3 RED, then 7/7 GREEN. The per-day cap still holds.
2. **BOT BEHAVIOUR.**
   - `competent.js cookPack` filters `foodState === 'raw' && kcalEach > 0`. Only rendered fat and human meat ever carry `foodState: 'raw'`. Real cookables carry `needsCooking` and `rawKcal`, or are meat in the `cleaned` state. So the filter never matches.
   - The capable bot also never holds cookables at day's end: 0 of 148 probe days. It doesn't hunt (no player `hunting` deed in either probe) and it donates forage.
   - It retries `craft('arrow')` without the recipe every day.
   - It never calls `treatVillager`.
3. **DESIGN GAP.**
   - The steady, daily craft deeds are villager haven roles: cook duty, mend, and the camp healer.
   - The player's craft deeds are all manual, one-off and gated.
   - Building gives no XP at all.
   - Parity ("treat villagers and players the same way") breaks here: a villager earns craft by holding a job, and the bearer cannot hold one.

**Minimal fixes (tuning lead):**
- Bot: cook what `cookAll`'s own `anyCookable` test accepts, near a fire, once a day.
- Bot: don't call `craft()` without the recipe. `G.knowsRecipe`, or read the "don't know" refusal.
- Bot: treat a sick villager when holding triage, herbal remedy or field medicine at L2.
- Game (design call): add a `building` deed (craft, 1/day) on `buildBridge`, `setUpCamp` and `buildShelter`.
- Game (design call): or let the bearer's haven work count. For example, a player `cookAll` at haven feeding the pantry.

## 2. Social dominance: player 231, villagers 468 level-ups

**Feeders:**

| Deed | Track | XP | Per-day cap | Call sites |
|---|---|---|---|---|
| `conversation` | social | 1 | 1 | `conversation.js endConvo`: one per held talk with ≥4 transcript lines (not per turn), credited to the bearer **and** to the villager |
| `teaching` | social | 1 | 1 per teacher | `skill-teaching.js teachSkill`, `game.js teachPlant`, the `teach` haven role (`resolveOneAssignment`), `firesideTeaching`, `villager-objectives.js objTick` teach chore |
| `contest` | social | 1 | none | villagers only (`contests.js` resolve-others path) |
| `contest_won` | the contest's track | 3 | none | |

**Measured:**

| | Seed 7, 58 days | Seed 42, 100 days |
|---|---|---|
| Player conversation credits | 52 credited, 52 refused by the cap: **the player hits the cap every day** | 83 credited, 83 refused |
| Player social XP | 57 (conversation is 91%) | 101 |
| Villager social XP | 163 | 254 |
| ↳ conversation | 104 | 166 |
| ↳ teaching | 55 | 77 (28 of them skill lessons) |
| Villager social / craft / field / combat XP | | 254 / 190 / 176 / 128 |

**Root cause (DATA + DESIGN GAP):**
- Conversation is the only deed with no risk, no materials and no gate, and the capable bot does it every day. So the player banks a guaranteed 1 social XP per day: levels at about days 18, 48 and 96, which is 3 per 100-day bearer.
- No other track has a daily, guaranteed player deed. Foraging needs a trip; fights need risk.
- Each bearer talk pays the partner villager too. The bot talks to about 1.7 different villagers a day, so per-villager caps rarely bind.
- Teaching has five independent feeders.
- The caps work. Social isn't uncapped; it's the only track whose deed is free.
- **Asymmetry:** a villager co-taken in a contest gets `contest` (social). The player in the same contest gets `contest_survived` (strange). One event, two tracks.

**Minimal fixes (tuning lead):** pick one.
- Conversation XP only on a talk that *did* something (a want resolved, a lesson, gossip learned, trust +N), not on any 4-line exchange.
- Or a per-pair cooldown, for example the same villager at most once in 3 days.
- Or n stays 1 but perDay applies to the pair, not the person.
- Separately: route villager contest survival to `contest_survived` (strange) like the player's (one event, one track). That also helps issue 3.

## 3. Strange track: player 82, villagers 9

**Steve:** "Yes any death for strange path."

That is implemented: `corpses.js` credits `death_in_family` to the player and to every living roster member on any person or villager death, capped 1 a day.

**Measured strange XP:**

| | Seed 7, 58 days | Seed 42, 100 days |
|---|---|---|
| Villagers, all of it from `death_in_family` | 28 | 42 |
| Per villager | about 3 | about 3–4 |
| Player | from 5 sources | 37: audience_trial 12, contest_survived 12, integration 6, mantle 4, death_in_family 3 |

The first strange threshold is 18 XP. Dashboard average: 11 deaths per run (6.3 villagers + 4.8 bearers). So a villager alive the whole run gets about 11 XP, and only a long, bloody run crosses 18.

**Root cause (DESIGN GAP + DATA):**
- Death is the only strange deed a villager can earn. At n=1 it cannot carry a track alone.
- The other System-contact deeds can only be earned by the player:
  - `integration`: player only.
  - `audience_trial`: player only.
  - `mantle`: the successor, who is the player by then.
  - `alien_fight`: credited only in `game.js` player combat. Villager field fights in `fieldFights.js` credit only `fight_won` / `fight_survived`.
  - `contest_survived`: always for the player; for villagers only when one is the watched participant. Co-taken villagers get social `contest` instead (issue 2).

**Minimal fixes (tuning lead, in order):**
1. Villager field fights against alien monsters also credit `alien_fight`.
2. Co-taken villager contest survival credits `contest_survived`.
3. The System's arrival credits `integration` to everyone present.
4. If still short, raise `death_in_family` n to 2. This is data only, and keeps Steve's "any death".

## 4. Final-bearer holdings: fusion 35/64, scream_cheese 32, green_whisper 27, junk; 27 new verbs almost never

**What the final bearers held** (dashboard `pAbil`, 251 abilities):

| Kind | Count |
|---|---|
| Kit index 0–2 (the weakest head of each kit: lucky_rock, loud_chewer, scream_cheese, beard_moss, echo_location…) | 105 |
| Spawn knacks (green_whisper, beast_calm, night_eyes, bloodhound, iron_stomach, the_touch) | 67 |
| fusion_reactor | 35 |
| Kit index 3–5 | 19 |
| Kit index 6+ (old abilities) | 18 |
| The 27 new verbs | 7 |

Every one of the 64 runs had at least one bearer death (4.8 per run). So **every final bearer is a successor carrying a villager build** (`mantleBecome`: "you become that villager"). Their kit is a spawn knack plus about 1–2 villager level-up sheets (villager level-ups average 16.3 per run across about 10 people).

**(a) Fusion reactor: GAME BUG ×2, fixed in `dc717672`.**
- Seeds 7 and 42 show the same pattern. The first bearer installs a pellet (day 21 / day 23) and dies (day 37 / day 65). The **successor installs a second reactor the next day** (day 38 / day 66).
- Hole 1: `villager-build.js mantleBecome` cleared `state.fusionReactorHolder` when the bearer died ("a dead bearer's reactor is free again", added in `a0f1a2a3`). That contradicts the singularity rule built on Steve's words "only affect a single one of the villagers" (`evidence/2026-10-12/fusion-reactor.md`: "the flag stays, so no second reactor ever rises").
  - The old singularity test swapped the scholar by hand, so it never ran the real mantle.
- Hole 2: `alienPlayers.js apWackyGift` (care packages, show prizes) drew `fusion_pellet` as 1 of 4 candidates with no singularity filter. `rollAlienLoot` has that filter. The successor's second pellet came through this path (the `apGrantItem` id format).
- Pellet frequency is also high by data: 1 of 5 tier-1 monster-loot items, and 1 of 4 wacky gifts.
- Proof: `scripts/test-fusion-mantle-20261015.js`, 4 RED, then 9/9 GREEN. `test-fusion-singularity` and `test-fusion-reactor` still pass 32/32.
- **Expect fusion holdings to drop.** That moves the food baseline, which is the tuning lead's to re-measure.

**(b) Contest gift steering: GAME BUG, fixed in `7333b438`.**
- `contests.js _cxPrizeAbilityOffer` computes `_steerW` per bag entry (held-path weighting; uncommitted build-arounds 0.1) and sorts the bag. It then drew every offer with a **uniform** random splice, so the weights did nothing.
- The draw is now weighted by the same numbers, still one `Math.random` per offer.
- Proof: `scripts/test-gift-steering-20261015.js`. On-path offers per sheet: 0.40 (uniform expectation 0.34) before, 0.88 after.

**(c) Kit order × sheet window × level-up count: DATA / DESIGN GAP. This is the main cause of junk and absent verbs.**
- Kits are "power order, weakest first" (`tracks.json _kits`). `godpath.js kitSheet` draws 3 of the **next 6 unheld** entries with weight 0.7^i, so index 0 is the likeliest offer at every first level.
- The heads are the junk:

  | Track | Kit head (index 0, 1) |
  |---|---|
  | field | lucky_rock, echo_location |
  | social | loud_chewer, scream_cheese |
  | craft | beard_moss, iron_stomach |

- Social is everyone's first and most frequent track (issue 2), so scream_cheese and loud_chewer dominate.
- The 27 new verbs sit at kit index 8–20 (13+ for 22 of them: "sit after the originals").
- A person gets 1–3 level-ups per track before dying. The window from the kit head reaches index about 5–8, so a new verb appears only when `shapeOffers` pulls a recognised-path payoff. The player saw a new verb on 1 of 12 probe sheets.
- Arrival gifts add more junk: `firstAbilityChoices` always fills the third slot from the wacky/underpowered tiers, which are exactly lucky_rock, loud_chewer, scream_cheese and beard_moss.
- Knacks: green_whisper and beast_calm are 2 of 6 latent knacks and every villager starts with one. They persist because a successor's build is mostly their knack.
- Bot scoring is **not** the cause. `capable.js chooseOffers` uses the game's `buildScore`, and it picks among what is offered. On full-slot level-ups it swaps only when the offer beats the weakest held ability.

**Minimal fixes (tuning lead / Steve):**
- Data: interleave or front-load the path verbs. The 2026-10-14 measurement showed full interleaving cost village survival, so prefer moving each subclass's *payoff* verb to around kit index 4–6.
- Or widen `rules.offers.window` / raise `windowDecay` toward 0.85 so index 6–10 shows up.
- Or let the sheet window start at the person's *level* within the kit rather than at the first unheld entry.
- Trim the wild arrival slot to "wacky" only when the week gave no utility condition.

## 5. Teaching: 33 skill lessons per run between villagers, 0 to or by the player

**The option exists.** `conversation.js` appends `skill-teaching.js convoSkillChoices(vid)` to the subject and choice menus:

| | Seed 42, 100 days | Seed 7, 58 days |
|---|---|---|
| Menus built | 632 | 461 |
| ↳ with a lesson option | 616 | 434 |
| "Teach me X?" offers | 599 | 411 |
| "I could show you X." offers | 616 | 434 |
| Lessons taken (`convoSkillLesson`) | **0** | **0** |
| Menus with no lesson option (mostly the trust-15 gate) | 16 (about 3%) | 27 (about 6%) |

**Root cause: BOT BEHAVIOUR.**
- `competent.js pickTalkChoice` (used by capable's held talks) takes `ans:` first, then `teach` (plants), then `gq*`, then `ask`, then `live[0]`.
- The `skill_learn:` / `skill_teach:` choices are appended last, so they are never reached.
- The game wiring is fine. `teachSkill` credits the teacher's `teaching` deed, and villager-to-villager lessons run on their own daily tick.

**Minimal fix (policy, tuning lead):** in `pickTalkChoice` (or a capable override), take one `skill_learn:` per sitting when the skill fits the build or a need (water, medicine, tracking), and one `skill_teach:` when the bearer knows something the villager lacks. Place it after `ans:` and plant `teach`.

Expect player social XP from teaching (capped 1/day, so small) and real lessons to the player.

---

## Commits (not pushed)

| Commit | What | Proof |
|---|---|---|
| `dc717672` | Fusion singularity: the mantle no longer frees the reactor; `apWackyGift` honours the singularity `[needs-eyes]` | `test-fusion-mantle-20261015.js` 9/9 (4 RED before) |
| `7333b438` | Contest gift steering actually weights the draw | `test-gift-steering-20261015.js` 2/2 (RED before) |
| `d94a0454` | Cooking meat and must-cook plants credits the craft deed | `test-cook-deed-20261015.js` 7/7 (3 RED before) |

- The three tests are on the green list (quick).
- `check.js --quick` passes 92/92. `--only` passes for contest, food, alien, parity, mantle and track.

**Baselines will move:** fewer reactors after the first bearer, gift sheets more on-path, and craft XP for anyone who cooks. The bot still doesn't cook, so the last one moves nothing until the bot changes. Re-measure before comparing against `dashboard-base`.

## Not changed (levers or design, owned by the tuning lead or Steve)

- Conversation and teaching XP shape.
- `death_in_family` n, villager strange deeds, and the contest track asymmetry.
- Kit order and offer window.
- Pellet frequency.
- A `building` deed, and player haven roles.
- Bot cooking, crafting, treating and lessons.
