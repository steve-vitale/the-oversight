# The capable bot — 2026-10-14

> **Correction (round 2, below): the first sweep's survival numbers are wrong.**
> The bot left fights running at bedtime. The game won't let you sleep
> mid-fight, so each such day burned a whole sim day without the game clock
> moving. "150 days" for capable was really 69–133 game days. Competent's
> runs were a true 152.
>
> - Capable's "7/8 survived" and "10 vs 27 player combat deaths" compared a
>   shorter game against a full one. **Disregard them.**
> - Measured honestly (round 2), capable loses its village more often than
>   competent: 6/8 lost vs 4/8. It does reach the deeper game: wave 5,
>   national rank 75%, and the **first sim win**.
> - The coverage and swallowed-error findings below are unaffected.

**Steve:** "Build a bot." This follows up on `simulator-audit.md` §5. The bot is
`scripts/policies/capable.js`, registered in sweep-compare as `capable`. It is proved
by `scripts/test-capable-bot-20261014.js` (22/22, green list `quick`).

## What it is

`capable` doesn't copy competent's code. It builds on **leadfeast**: competent,
plus the LEAD-road courtship, plus the r13 feast layer. It turns on two existing
opt-in switches (`COMPETENT_DIRECTIONAL_FLEE`, `FEASTSCALE_R13`) for each call and
restores them afterwards. Then it adds:

| # | Behaviour | How |
|---|---|---|
| 1 | **Real fleeing** | When outmatched at the start, below 35% HP, or losing the damage race, the bot walks toward the edge facing Haven (`chooseFleeDir`). Each step stays within the turn's movement budget. On the edge it pushes through with `tbBarrierExit`. Once it starts fleeing it keeps going until it is out. It stands its ground at the haven node and in sealed fights. Before running it tries one escape verb (walk in, calm, scream, bellow, sand, loom, stare down). |
| 2 | **Abilities in combat** | Every turn it scores each available combat action from `activatableAbilities()` and fires the best through `useAbility`. Order: control early (scream, bellow, sand, loom, stare, tag, wire, turncoat). Then payoffs (static toss, cheese wheel, retribution, settle debt, bind on a controlled target). It "loads" a big hit (dead aim, haymaker, ambush, aim, rage, trade) only when a target is in reach and nothing is already loaded. It skips abilities below the hunger gate (kcal < 500, plus the action's cost). Per-fight limits apply. If the engine refuses an action, the bot doesn't retry it that fight. |
| 2b | **Signature counter verbs** | It parses the same button HTML the phone shows (`sigCombatButtonsHTML`, `sigW3b/W3c/W4/W5CombatButtons`) and presses buttons from a priority table. Examples: Skip ad, Funeral, Refuse absolution, §0, Leave suburb, Rewrite eulogy, Off-script. Each verb has a per-fight cap. |
| 3 | **Scored choices** | Ability offers: completes a synergy (+20), then a synergy leg it partly holds, then path overlap, then combat value. Contests: reward minus harm, with harm weighted up when hurt or at wave ≥ 3; it refuses high or extreme billing when hurt. Relic enhancements are scored. Table: takes the seat with `tableTakeSeat()` when `tablePreview().ready` (day ≥ 90). Paths are scored by earned strength plus branch fit plus seeded jitter. Beats are scored by branch-fit words. The **trial by combat is never picked**. |
| 4 | **Held conversations** | Uses `competent.holdConversation`. It picks the person who most needs it: a pending want (+100), then grieving or scared (+50), then lowest trust. Two sittings a day. |
| 5 | **Climbs the scale, plus food deeds and relay** | Courtship, tending, feasts and the devotion channel come from leadfeast. When the network goes live, the bot takes the relay itself if the pantry has more than 30k kcal; otherwise it appoints steady hands. It communes and answers relay scenes, leaning tender. |

**Robustness:**
- Abilities are read only through `hasAbility`, `activatableAbilities` and `useAbility`. It never reads `scholar.abilities`, so it survives the planned move of human abilities into skills.
- All randomness comes from `global.__policyRandom`.
- Errors on the policy side go to `ctx.capErrors`; none are swallowed.

**Fix found while building:** `competent.beastStrikeTarget` moved straight to a
far tile, and `tbPlayerMove` refuses that ("Too far"). The beast-trick strike was a
no-op every turn whenever the target was more than one turn's movement away. It now
steps as far as movement allows. Commit 33ee3cf0, test §5. I confirmed the test
fails on the old code and passes on the new.

## Sweep: capable vs competent, 8 seeds × 150 days

`POLICIES=capable,competent SEEDS=7,42,99,1234,555,777,2026,31337 DAYS=150 node scripts/sweep-compare.js`

| policy | n | won | median days | survived 150 | max wave | national % | invited % | sat % | delib/d |
|---|---|---|---|---|---|---|---|---|---|
| capable | 8 | 0 | 150 | 7 (+1 village-dead d148) | 5 | 75 | 0 | 0 | 89.6 |
| competent | 8 | 0 | 150 | 4 (4 village-lost: d30/45/61/120) | 4 | 0 | 0 | 0 | 61.3 |

Per seed: max rank / wave reached (cell blank where I didn't record it)

| seed | capable | competent |
|---|---|---|
| 7 | global / w5 | village / w3 |
| 42 | regional / w5 | village / w3 |
| 99 | global / w5, village-dead d148 | village / w3 |
| 1234 | national / w5 | lost d30 |
| 555 | regional / w2 | village / w4 |
| 777 | national / w2 | lost d45 |
| 2026 | global / w5 | lost d120 |
| 31337 | regional / w2 | lost d61 |

**Deaths, summed over 8 runs:**

| cause | capable | competent |
|---|---|---|
| player: combat | **10** | **27** |
| player: other | lockjaw 1, sickness 1, starvation 1 | starvation 1, sickness 1, contest 2, lockjaw 1 |
| monster: combat (monsters killed) | 31 | 63 |
| villager combat losses (monster:villager combat) | 60 | 54 |
| villager: monster | 24 | 21 |
| villager: sickness | 5 | 14 |
| villager: starvation | 6 | 5 |

**Caveat on attribution:** `capable` stacks the leadfeast base and the new layers. I did
not run a leadfeast-alone control. So the scale reach (national 75% vs 0%) is mostly
the courtship base (known from leadcourt). Fewer player combat deaths is
consistent with real fleeing plus abilities, but this is not isolated. If it matters,
the next run is a three-way `leadfeast` vs `capable` sweep. leadfeast would need
adding to POLICY_REGISTRY with `FEASTSCALE_R13=1`.

## Behaviour counters (capable, same 8 seeds, 150 days, one process each)

| seed | player fights | flee exits (node) | held at haven | ability uses | signature verbs | offers not card 0 | contest choices (not first) | convos held / turns | relay |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 1 | 0 | 0 | 0 | 0 | 2/5 | 74 (36) | 236 / 1180 | claimed, 39 answers |
| 42 | 3 | 1 (1) | 0 | 0 | 0 | 1/3 | 23 (12) | 136 / 678 | claimed, 21 |
| 99 | 8 | 0 | 8 | 0 | 0 | 2/4 | 57 (27) | 236 / 1153 | claimed, 35 |
| 1234 | 11 | 0 | 15 | 3 scream | 5 (refuse, look away ×2, skip ad ×2) | 1/3 | 43 (19) | 154 / 770 | claimed, 12 |
| 555 | 5 | 0 | 0 | 2 ambush | 0 | 2/2 | 23 (15) | 106 / 530 | appointed, 4 |
| 777 | 0 | 0 | 0 | 0 | 0 | 1/4 | 36 (18) | 172 / 860 | claimed, 23 |
| 2026 | 8 | 1 (1) | 10 | 7 haymaker | 2 (algorithm tank) | 1/2 | 28 (13) | 166 / 830 | claimed, 9 |
| 31337 | 1 | 1 (1, chased once) | 0 | 2 (dead aim, read stance) | 0 | 3/3 | 34 (19) | 118 / 590 | claimed, 16 |

**Findings:**
- **The player barely fights: 0–11 player fights in 150 days.** Most monster
  contact is villager field combat. So bot combat behaviour moves the
  whole-run numbers less than expected. Ability uses: 14 in 8 runs. Real flee exits: 3 in 8 runs, all into the next node toward Haven.
- **"Held at haven" (33):** fights on the haven node, mostly raids. No push
  leads toward safety there, so the bot fights. That is directional flee's rule.
- **The Table is still unreachable: invited 0/8, Arc III maximum.** This holds even with
  global rank in 3/8 runs. `tableWaiting` needs Arc IV, and no run reached it. The seat
  and path logic is proved in the test with a stubbed `tablePreview`, but has not
  been exercised in a real run.
- **Relay dialogue now runs.** It went from 0/27 to 21/27 functions, because the bot claims
  the office when the pantry has more than 30k kcal.

## sim-audit: coverage and hidden errors

Command: `POLICIES=capable,competent SEEDS=7,42,99,1234 DAYS=150 LABEL=capable-vs-competent node scripts/sim-audit.js`.
Report: `sim-audit-capable-vs-competent.md`. The per-policy runs (`-competent-only`,
`-capable-only`) give the delta below.

**Named functions that ran:**

| | competent | capable |
|---|---|---|
| Named functions ran | 2244/4444 | **2482/4487 (+238)** |

| file | competent | capable | Δ |
|---|---|---|---|
| conversation.js | 91/134 | 123/143 | +32 |
| convoTopics.js | 9/47 | 41/52 | +32 |
| convo-wants.js | 57/97 | 85/104 | +28 |
| hierarchy.js | 38/96 | 63/96 | +25 |
| relay-dialogue.js | 0/27 | 21/27 | **+21** |
| sigW4.js | 5/58 | 22/59 | +17 |
| abilityActions.js | 2/94 | 15/96 | **+13** (`useAbility`, `payActionCost`, `activatableAbilities`, scream impl…) |
| feastBuff.js | 3/19 | 15/20 | +12 (`applyFeastedForm`, `noteFeastedCombatUse`) |
| relay-ext.js | 3/22 | 12/22 | +9 (`claimRelay`, `relayCommune`, `relayReroute`) |
| table.js | 4/42 | 12/42 | +8 (`tablePreview`, grounding, sysBond) |
| foodPower.js | 6/14 | 13/14 | +7 (the hunger gate path) |
| sigW5.js / sigW3c.js | 6 / 11 | 10 / 14 | +4 / +3 |
| table-*.js (7 path files) | 6/69 | 6/69 | 0 (no run reached the Table) |
| sigW3a.js / betrayal.js / pantheon.js | 35 / 73 / 22 | 22 / 58 / 9 | −13 / −15 / −13 (seed-dependent: different runs meet different monsters and events) |

**Swallowed errors newly surfaced: none.**
- capable hit the same three sites as competent:
  - `game.js:16881` and `game.js:30503`: `.px` on a null map in node, display only
  - `state.js:510`: localStorage
- It also hit the already-known `progression.js:1033` keepsake flashback (1/4 runs).
- The new paths (abilityActions, relay, sigW4/5, feastBuff, table preview,
  conversation topics) threw nothing in 8 × 150 days.

**Possible engine bug (not fixed; it needs a design read):**
- `tbBarrierExit` only treats tiles 0 and 8 as edges.
- `tbGridSize()` says titan fights are 12×12, so on that grid the 8 line is interior.
- Probable effect: a player can't flee a titan fight by barrier.
- Neither the bot nor these runs ever met a titan fight.

## Use

```
POLICIES=capable,competent SEEDS=... DAYS=150 node scripts/sweep-compare.js
POLICIES=capable LABEL=... node scripts/sim-audit.js
```

Behaviour counters: `require('./policies/capable').capableSummary(ctx)`.

---

## Round 2: the Table wall, honest clock (commits a2b041be, c94f02b4)

**Why no run passed Arc III (the lead's diagnosis, confirmed):**
- Seed 42 had sentimentTaught by day 20 and an armed surge by day 20. It hosted 8 armed feasts.
- But `feastSurgeUsed` was never set. It only marks on a real combat use while FEASTED: a strike that lands, or an ability.
- The player almost never fought, and `feastFightRoad`'s forage-and-hope patrol rarely met anything.
- Distinct wave-3 monsters faced were also short of the lesser seat's 3.

**What changed:**

**1. Finish the fight before bed** (the bot's clock bug above).
- `finishLiveFight` runs at the end of `daily` and plays any live fight out with the same logic.
- Proof: the test checks game days keep pace with sim days, and that a fight left live by `daily` is resolved. Both fail with the fix disabled.

**2. Deed hunt**, in upkeep, so the harness drives the fight right after.
- **Feast hunt:** while FEASTED and the buff is unused, the bot walks to the nearest weak world monster (wave ≤ 2, within 4 nodes). It walks closer, then fights — the phone's own Fight flow, offered within 1 square. It doesn't flee until a blow lands or HP drops under 50%.
- **Wave hunt:** when a wave's lesser-seat bar (4/4/3 distinct) is short and that wave is unlocked, it engages a monster of that wave it hasn't faced yet.
  - The engine counts the engagement (progression.js: "fleeing still counts — you stood on the grid with it"), so normal fleeing still protects the scholar.
  - **Balance-relevant:** engaging and fleeing fills a wave bar. That's the code's stated intent, but it's cheap.
- **Guards:** HP ≥ 70%, kcal ≥ 40% of cap, one sortie per part of the day.
- `CAPABLE_HUNT=0` turns the hunt off for A/B runs.

**3. Engine fix: `tbBarrierExit` used the 9×9 edge (tile 8) on 12×12 titan grids.**
- It now uses `tbGridMax()` for the edge check and the chase re-entry positions. Normal fights are unchanged.
- Test `test-barrier-grid-bound-20261014`: 3 checks fail before the fix and pass after.
- The bot's flee walks to the same edge.

**Sweep: capable only, same 8 seeds, 150 sim days, honest clock**

| | won | median days | national % | invited % | sat % | player deaths |
|---|---|---|---|---|---|---|
| capable (hunt on) | **1** | 96 | 75 | **25** | **13** | combat 36, lockjaw 3, sickness 3, starvation 2, contest 2 |
| capable, `CAPABLE_HUNT=0` | 0 | 109 | 63 | 13 | 0 | combat 36, lockjaw 3, contest 2, sickness 1, starvation 1 |
| competent (round 1, already honest: 152 game days) | 0 | 150 | 0 | 0 | 0 | combat 27, contest 2, starvation 1, sickness 1, lockjaw 1 |

**Per seed (capable, hunt on).** "Food deeds" is the day both sentimentTaught and feastSurgeUsed were true. Faced is distinct monsters per wave, w1/w2/w3/w4/w5.

| seed | game days | end | max arc | food deeds | invited | sat / path | won | faced w1/w2/w3/w4/w5 | rank |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 78 | village lost | **IV** | d27 | **d47** | no (lost before the day-90 floor) | – | 13/8/3/1/2 | national |
| 42 | 78 | village lost | III | d27 | – | – | – | 10/7/**1**/1/0 | global |
| 99 | 139 | survived | III | **never** | – | – | – | 8/8/**2**/2/2 | global |
| 1234 | 61 | village lost | III | never | – | – | – | 11/4/3/0/0 | village |
| 555 | 94 | village lost | III | never | – | – | – | 10/6/**2**/5/0 | global |
| 777 | 38 | village lost | III | d28 | – | – | – | 7/3/0/0/0 | village |
| 2026 | 95 | village lost | III | d27 | – | – | – | 8/7/**1**/3/1 | global |
| 31337 | 116 | **won** | **IV** | d27 | d116 | **yes, the Beloved** | **yes** | 13/12/3/3/0 | global |

**Reading:**
- **First sim win (seed 31337).** The bot took the seat the day it was offered (day 116, past the day-90 floor), picked the Beloved by strength and branch fit, and won.
- **What's still blocking the Table:**
  - **Wave-3 distinct faced is short** (1–2) in 4 seeds. The wave hunt needs an unfaced wave-3 monster within 4 nodes, and they're scarce.
  - **Food deeds never landed** in 3 seeds (99, 1234, 555). Their feast hunts found no fight while the buff was live.
  - **Villages are lost before day 90** in 4 seeds.
- **Honest survival is the real problem.** 6/8 villages are lost with or without the hunt, against competent's 4/8. That isn't caused by the hunt layer.
  - Capable climbs to wave 5 and global rank within ~80–100 days. It meets waves 4 and 5 that competent (wave ≤ 4, village rank) never sees.
  - Its scholars die in combat 36 times in 8 runs.
  - This is a balance or pacing read on the deep game, not a bot bug. The bot is the first player to get there. Worth Steve's eyes before anyone tunes it.
- No policy errors in any run. 3–14 fights per run were finished at dusk by the new path.

Data: `sweep-capable-r2.json`, `sweep-capable-r2-nohunt.json`.
