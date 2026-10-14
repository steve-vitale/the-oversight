# God-path follow-up: villagers cast the verbs, kit order, ascension, buff everyone (2026-10-14)

Law: "Let's buff everyone, or at least feel more comfortable with improving
abilities to compensate." / "Villagers and players should get the same XP,
when in doubt we treat them the same way." / "Paint a path towards functional
godhood. If they learn and experiment enough, people can get there and it's
scary good. Most game wins look like that, but not all."
(`docs/godpath/STEVE-ANSWERS.md`, `docs/ENDGAME-BUILDS.md:3`)

## Summary

| Task | Result |
|---|---|
| 0. Bot test (`loop 80 game 73`) | Fixed in the bot (pushed early as 670eded2) |
| 1. Villagers use the new verbs | Done and tested. Villagers seldom hold the new verbs, so sims barely show it |
| 2. Kit order for diversity | Measured, then reverted: it cost lives for +1 or 2 subclasses. Target of 14/20 not met |
| 3. Ascension tuning | Done: 0/0 becomes 21 player / 24 villager over 64 runs, payoff gate kept |
| 4. Buff everyone | Parity buffs shipped; they cut field deaths but leave village outcomes unchanged. The 11/16 deficit doesn't show on today's base |
| 5. Farstrider | Unchanged (retired) |

## 0. The bot-test failure (commit 670eded2)

`test-capable-bot` failed with `loop 80 game 73`. The cause:

- **Where:** seed 1234, day 9. A betrayer (Landon, a human hostile at 40 HP)
  is "flagging" and stalls. He never closes in.
- **What the bot did:** at 22% HP the capable bot decided to flee south.
  `realFlee` aimed at the edge tile straight below it, (4,8). That tile is a
  **tree**.
- **Why it stuck:** `findPath` failed on every turn, so the bot never reached
  the edge. The fight stayed live, and `Game.sleep` refused for 8 loop-days
  until the watchdog routed it.

This was a bot bug, not a game bug: a human player would walk around the
tree. The fix: when the straight-line tile can't be reached, the bot flees to
the nearest reachable tile on the same edge. The assertion is unchanged.

## 1. Villagers use the new verbs (8faa26ca, 5385a3a9)

**The verbs, cast by villagers**
- All 14 combat verbs now take an *actor*. A villager fighter casts them
  through the same `VERBS` code the player uses.
- They pay the same kcal as the data says, from their own belly: kcal/25
  hunger, the scale villager meals use.
- They are refused the same way:
  - hunger 80 or more is the villager version of "eat first";
  - a starving pantry casts nothing;
  - a tight pantry casts only when outmatched.
- Villagers choose verbs with a small smart-play table (`V_PLAN`), after the
  hand-written villager abilities.

**Passives, for whoever holds them**
- Lifeline, Last Rites, Rally Aura and Aegis Link: links and saves now run
  from any holder.
- Coin Guard and Prophecy: absorbs and dodges.
- Stoke, Back from the Brink and Misdirection: strike multipliers.
- Ember Heart.

**Fights without the player** (`fieldFights.js`): the same verbs and passives
run in that engine's terms, through `fieldBegin`, `fieldAct` and the rest.

**The older kit, now working for villagers**
- Off-screen and in turn-based fights: Static Toss, Cheese Wheel, Bird
  Strike, Turncoat, Freeze Tag, Retribution, Rage, Pocket Sand, Dread and
  Second Wind.
- Data modifiers: adrenaline_control, adrenaline_surge, chitin_skin, and the
  detection modifiers (bird_whisperer, third_eye, beast_calm).

**Still player-only:** Long Table, Haggle, Harvest Table, Keepers' Oath and
Mourners' Bond. Villagers don't trade, host feasts or wear keepsakes.

**Proof:** `scripts/test-godpath-villagers-20261014.js`, 57 checks, on the
green list. Every verb fires for a villager and changes the board or the
fight, kcal is paid, the starving gate holds, and every passive works on a
villager.

**What the sims show:** with the original kit order, villagers almost never
*hold* a new verb: 0 villager casts of the 14 new verbs in 64 runs. The
reason is that the new verbs sit at the ends of the kits, and a villager
levels about 15 times per run, spread over the whole village. With kits
interleaved (task 2), villagers did cast them: 54 casts on 16 seeds.

## 2. Kit order for diversity (0c688261, reverted in e2e32165)

**What we tried**
- **Interleave by path, payoffs last:** round-robin over the paths in each
  kit, the two subclasses alternating, enablers first.
- **Same, payoffs in place:** as above, but payoffs keep their power-order
  position.
- **Rare paths first:** drifter, explorer, shieldbearer and the other rare
  paths lead every kit.

**What happened:** subclasses formed rose from 6 to only 7–9 of 20. Combat
deaths rose sharply. With the same build on 32 seeds, interleaved kits
against the original order:

| Deaths | Original order | Interleaved |
|---|---|---|
| Villagers in fights with the bearer | 125 | 142 |
| Villagers in off-screen field fights | 109 | 144 |
| The bearer | 106 | 143 |

The "rare paths first" order formed a class for 94% of players, but the
village was lost in 11 of 16 runs.

**Why:** the early kit entries are the ones that keep people alive. Paths are
also decided outside the kits:
- the lifeseed first abilities (beast_calm and green_whisper are everywhere);
- the field and craft tracks level most;
- the bot's offer scoring.

Every order we tried kept forager and hunter dominant.

**Decision:** keep the original power order. The `_kits` note in tracks.json
records why. The target of 14 or more subclasses is **not met**: 8 of 20
over 64 runs (before: 8). See NEEDS-STEVE.

## 3. Ascension tuning (430dfb7e, f6afcef8)

The data levers, in `godpaths.json rules`:

- **`capstone.deedClassDays: 10`, the lived-in deed.** If the System named
  the class on this path and it has held for 10 days, the deed is done. The
  idea: the build was played, not assembled on the day. The synergy deed
  still counts, and `requireDeed` stays on.
- **`offers.payoffAnyTrack: true`.** Once a class is named, its subclass
  payoff may appear on any level-up or gift sheet (`shapeOffers`, same
  function for villagers).
  - The payoff was the gate that blocked most builds: at day 80+, class and
    kit were met but the payoff was missing.
  - It often sits in another track's kit. Trophy Room, for example, is in the
    combat kit, while stalkers level field.
- **`capstone.abilitiesNeeded` stays at 4.** At 3, the player ascended just as
  often and villagers slightly more often (27 against 24).
- **Unchanged:** the subclass payoff is still required, the minimum is still
  day 80, and the Table reads none of this.

The proof is in `test-godpath-villagers` (lived-in deed; the payoff offered
from another track) and in `proof-godhood-rework` (T4 now reads
abilitiesNeeded from data).

## 4. Buff everyone (5101ff8a, 5385a3a9)

These are the knobs that shipped. Each one is a parity fix: an ability gets
stronger in the hands that hold it, using the player's card numbers.

| Knob | Before | After |
|---|---|---|
| Off-screen fights read the villager's held combat kit | Ignored (only about 15 abilities had a field effect) | Static Toss 20–30, Cheese Wheel 25–35, Bird Strike 8–12 for 3 rounds, Rage ×2 for 3 strikes, Pocket Sand (50% miss for 2 rounds), Dread, Turncoat, Retribution, Second Wind. Each once per fight, paid in kcal |
| Turn-based fights: a villager casts the older combat actions | Only Scream, Sand, Dread, Rage and Shove | Adds Static Toss, Cheese Wheel, Bird Strike, Turncoat, Freeze Tag and Retribution |
| Held data modifiers for villagers | Not read | Strikes ×1.3 (adrenaline_control), 15% dodge (adrenaline_surge), +30 armor (chitin_skin), detection (bird_whisperer +0.2, third_eye +0.3, beast_calm ×0.75 noticed) |
| Food is fuel, for villagers | The player hits ×1.25 when topped up (kcal at least 75% of the bank) | A villager just as full (hunger 25 or less, pantry not starving) hits ×1.25 too, through `overchargeMult()` |

**Knobs tried and not kept**

- **`OVERCHARGE_MULT` 1.5 for everyone.** On 64 seeds the village was lost in
  33 runs, against 24 at 1.25. Famine losses went from 13 to 19. Food-as-power
  pulls food away from the village.
- **Per-deed XP for everyone.** Not tried: it lives in `tracks.json` deeds and
  `tracks.js`, which other workers are editing. It would also push the player
  past "about 8 natural level ups".

**Off-screen fights, measured directly** (`fieldFight` × 150 per cell, wave
1–2 monsters):
- A villager holding Static Toss wins 33% against a hushwolf, up from 0%.
- beast_calm raises "saw it first, gave it room" from 7% to 29%.
- bird_whisperer raises it from 4% to 15%.
- Most fights still end with the villager fleeing (Steve: "It should be a
  fight. A hard one.").

## 5. Before and after

**Setup:** the capable bot, 150 days, one process per seed. Run with
`SEEDS=… DAYS=150 node scripts/godpath/sweep-buff.js --all`.

**Before** is this base, master with the bot fix. A rerun on origin/master
ecf3ff69 matched it row for row on the 10 seeds compared.

**After** is f6afcef8.

| | Before (std 16) | **After (std 16)** | Before (64) | **After (64)** |
|---|---|---|---|---|
| Won | 7 | **7** | 31 | **30** |
| Sat at the Table | 7 | **7** | 31 | **30** |
| Invited | 10 | **8** | 37 | **38** |
| Village lost (famine / no successor) | 8 (3/5) | **7 (3/4)** | 23 (10/11) | **25 (12/12)** |
| Median days | 95 | **99** | 95.5 | **97** |
| Subclasses seen (player and villagers) | 6 | **7** | 8 | **8** |
| Player class recognised | 69% | **56%** | 52% | **53%** |
| Player ascensions (runs past day 100 that ascended) | 0 (0/6) | **6 (2/8)** | 0 (0/24) | **21 (12/28)** |
| Villager ascensions | 0 | **6** | 0 | **24** |
| New-verb uses, player / villager | 17 / 0 | **24 / 0** | 44 / 0 | **62 / 0** |

Deaths over 64 runs, before → after:

| | Before | After |
|---|---|---|
| Villagers in fights with the bearer | 239 | 268 |
| Villagers off-screen | 231 | 226 |
| The bearer | 205 | 203 |
| Starvation | 14 | 11 |

Deaths still happen.

Std 16 = seeds 7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8
and 9. The 64-seed column adds seeds 10–41 and 43–58.

**Reading it**

- **Survival targets** (16 seeds, lost 7 or fewer and 6 or more wins): met,
  with 7 lost and 7 wins. But the base meets them too. The base loses 8 of 16
  and 23 of 64 (36%), not the 11/16 measured right after parity. Merges since
  then have moved the baseline.
- **Overall effect of the buff:** neutral on village outcomes over 64 seeds.
  Field deaths fell; deaths in fights with the bearer rose by about as much.
- **The sims are chaotic.** A one-line change (held detection) moved one
  32-seed sweep from 14 to 10 wins and from 14 to 19 villages lost. Trust only
  64-seed comparisons for anything under about 4 runs.
- **Ascension:** 12 of 28 runs past day 100 ascended (43%). That is at the top
  of the 25–40% target; on the 16 standard seeds it is 2 of 8 (25%).
  Villagers ascend about 6 times per 16-seed sweep. Gods that appeared:
  - player: Living Garden, Apex Predator, Shepherd of the Dead, Voice of the
    Relay;
  - villagers: Living Garden, Apex Predator, Market God.
- **Subclasses seen after** (64 runs): forager/feaster 48, hunter/stalker 40,
  forager/gardener 25, hunter/beastmaster 7, explorer/cartographer 3,
  drifter/phantom 1, survivalist/furnace 1, brawler/juggernaut 1.

## Every configuration measured

| Configuration | Seeds | Won | Lost | Subclasses | Ascensions (player / villager) |
|---|---|---|---|---|---|
| **Before** | 64 | 31 | 23 | 8 | 0 / 0 |
| **After (final)** | 64 | 30 | 25 | 8 | 21 / 24 |
| Final, abilitiesNeeded 3 | 64 | 31 | 24 | 8 | 21 / 27 |
| Final, abilitiesNeeded 3, overcharge 1.5 | 64 | 25 | 33 | 9 | 17 / 22 |
| Original kits + buff + ascension (needs 3) | 32 | 14 | 16 | 7 | 9 / 14 |
| Kits by path (payoffs in place) + buff + ascension | 32 | 14 | 14 | 7 | 9 / 9 |
| Same + held detection | 32 | 10 | 19 | 8 | 12 / 12 |
| Same + overcharge 1.5 | 32 | 8 | 21 | 8 | 6 / 10 |
| Kits by path (payoffs last) + buff + ascension | 32 | 11 | 19 | 8 | 7 / 8 |
| Kits rare-paths-first + buff + lived-in deed | 16 | 5 | 11 | 9 | 2 / 1 |

Full rows are in `godpath-buff-sweep.json`.

## Logged, not fixed (non-critical)

- `godhood.js scholarItems` and `villagerItems` have no callers. This was
  true before these changes.
- `test-deterministic-clock` timed out in the full `check.js` run under load.
  It passes on its own (6/6) and is on the known-flaky list.
