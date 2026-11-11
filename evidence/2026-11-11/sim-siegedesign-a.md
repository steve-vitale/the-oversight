# sim-siegedesign-a — The Siege, designed (Tier 2 coverage: siege)

**Run:** sim-siegedesign-a · **Date:** 2026-11-11 · **Type:** design + substrate-audit arm (NOT a sim arm)
**Status:** design note delivered. No siege system exists to measure — the coverage program's
SUBSTRATE-MISSING verdict is confirmed by audit (§2). This note is the design the measurement
arm picks up: substrate audit, canon grounding, the design itself, the proposed instrument (§4),
and findings one-liners (§6).

**No src/js changes in this run.** Design note + proof test only, per the brief.

## 0. Verdict up front

A siege, as the game talks about it, does not exist. What exists is a **raid + lingerer +
shelter cluster** that *behaves* like a siege without ever being one: raids draft real
monsters that hold the treeline and eat the pantry nightly; villagers can be mustered
inside; sorties can be sent; a crisis beat called THE SIEGE fires afterwards. But there
is no siege state, no siege trigger, no siege phase, no siege end the player can aim at
except "endure ~6 nights" or "send a sortie and hope", and no played answer at all for
a wave-4/5 monster camping the treeline (decision-pack 163/256, both UNRULED).

The design in §3 does not invent a new system. It **names the episode the existing
mechanics already stage** — raid → treeline → resolution — and fills the three holes
the audit finds: (a) no episode framing (nothing tells the player a siege is *on*,
how long it has run, or what ends it); (b) no apex drive-off verb; (c) no durable
cost beyond the nightly gorge. Everything else is already built and wired.

## 1. Canon grounding

**There is NO dedicated SIEGE canon doc.** Confirmed by grep of `docs/`: `siege`/`besiege`
appears in exactly five docs — `docs/MONSTER-WAVES.md`, `docs/ONTOLOGY.md`,
`docs/ENDGAME-BUILDS.md`, `docs/MEASUREMENT.md`, `docs/steve-call-decision-pack-20261024.md`
— and in no other. What those five say, and what this design takes from each:

- **Havens are the ONLY unbreakable structures** (Steve 2026-10-05, `docs/DECISIONS.md:973`;
  enforced in `src/js/game.js` `destroyCell`, lines ~36601–36640: the unbreakable list is
  `['hall','bunk','door','haven','sanct','base','lodge']`; outdoor `wall` cells are wild
  ruins and ARE breakable). This is the design's hard constraint: a siege cannot break
  the haven itself. §3 says what it CAN threaten instead.
- **Wave 6+ is the siege** (`docs/MONSTER-WAVES.md` §"Wave 6+: The Long Night", scaffold,
  Steve 2026-10-17): "the village that keeps surviving gets the siege, and the siege
  leads to the egg"; "a multi-phase siege, not a duel"; "the siege is survivable-in-
  principle, never a scripted wipe"; wave-6+ bands sit ABOVE wave 5's; the network
  monsters (`network_tower`, `network_limb`, `network_heart`) are wave 6's heralds —
  "scouts and siegebreakers for what comes after". The long-survival road is the
  alternative to sitting at the table. So the siege is not a side event: it is the
  endgame's other road.
- **The scale ladder** (`docs/SCALE.md`): national is a live relationship (a polity of
  4 fires), not a title; six roads in (LEAD / BELONG / COVENANT / TRADE / CONQUEST /
  REFUSE). Two siege-adjacent mechanics already live here: COVENANT mutual defense
  (any member's call is answered with two villagers for three days, or refused aloud
  at −10 trust) and CONQUEST (raid-to-subjugate, real casualties). REFUSE's cost is
  explicit: "no league to call when the late waves come". The siege is therefore
  already priced into the scale choice — a village that refuses the scale faces the
  late waves alone.
- **Scale discovery** (`docs/SCALE-DISCOVERY.md`, beats 4–5): the wave-4 pointer says
  "The next act needs a bigger stage… Get me a network"; the national pointer says
  "Finales need a nation." The siege is the pressure that makes those pointers true:
  the next act arrives whether or not the stage is built.
- **The phoenix build** (`docs/ENDGAME-BUILDS.md` §4, "Refuses Death"): "You outlast.
  Sieges, winters, alien hunters — you're still standing." Outlasting is a named
  fantasy; the siege is one of the three things it outlasts.
- **Measurement law** (`docs/MEASUREMENT.md` §14/§14b): SUBSTRATE-MISSING is the
  taxonomy for exactly this — "the engine does not stage what the arm needs… Do not
  run more arms against a missing substrate." The siegeroster entry is the precedent:
  "muster beat fires but no shelter verb exists". The shelter verb has since been built
  (`src/js/shelter.js`, 2026-10-16/17); the siege episode itself has not.
- **Ontology** (`docs/ONTOLOGY.md`): `raid_raises_siege` — a RAID crisis resolved
  'fought' fires the 'the-siege' crisis kind; the shelter system entry (full rules:
  engine-honest movement, mechanical protection, shelter has cost, scholar never
  auto-sheltered); the `siege` *contest* (a blood/extreme arena contest, 3 waves —
  a different thing from a village siege, §2); `sealed-arena` (pit/gauntlet/siege
  fights run with no flee).
- **Open Steve-calls** (`docs/steve-call-decision-pack-20261024.md`, all UNRULED):
  - **163** — wave-4/5 lingerers cannot be driven off (0 drive-off kills in 17
    attempts; waves 1–3: 37 in 71). "The apex siege has no played answer."
  - **256** — shelter/evacuate verb vs. apex monsters not camping Haven (same
    question from the roster side; the verb has since been built — shelter.js —
    but the drive-off half is still open).
  - **88** — is Haven sanctuary for monster-initiated combat? (A monster
    re-engaged the successor inside Haven on succession day.) My take in the pack:
    sanctuary inside, siege answer still needs its verb.
  - **411** — wave-6 canon before trick wiring (canon silent on wave 6; roster drift).
  This design **assumes the pack's lean** (sanctuary inside, siege answer as the
  played verb) but does NOT rule it: §3 is written so it survives either ruling
  on 88, and the apex answer in §3.4 is marked as pending Steve's ruling on 163.

Other canon the design respects without restating: monster encounters are fought,
not rolled (Steve 2026-10-08); contests are played, not RNG; "if you don't know,
it doesn't show" (knowledge gating — the muster beat names the threat via
`monsterNoun`, never the true name); no silent actions; one mobile screen; table
sanctity (while the table sits, no new raids and no gorge — the world holds its
breath, `havenGrowth.js`).

## 2. Substrate audit — what exists, what is fiction-only, what is absent

Method: grep of `src/js` for `siege|besiege` (10 files, 61 hits), `wall|palisade|gate`,
`assault`, `linger`, `raid`, plus reads of the cited functions. The word "siege" in
code appears in exactly: `shelter.js`, `havenGrowth.js`, `app.js`, `progression.js`,
`contests.js`, `safetynets.js`, `comms.js`, `contestEngine.js`, `game.js`, `godverbs.js`.

### 2a. EXISTS (mechanism, wired, callable)

| Piece | Where | What it does |
|---|---|---|
| Raid trigger | `havenGrowth.js` `havenRaidTick()` (~521) | Reactive, never scheduled: 3+ living world monsters, pantry ≥3,000 kcal, ≥7-day cooldown, 18%/day. 3 raiders base, +1 above 12k kcal, +1 above 24k, cap 5. Wealth draws teeth — the siege tax scales with the pantry. |
| Palisade | `havenGrowth.js` HAVEN_TIERS tier 2 (~102–115) | Haven growth tier: food 14,000 + wood 350 + stone 60. Raiders take 25% max-HP wall damage coming over (`havenRaidTick`, ~573). "Safe sleep — nothing walks through the palisade to reach your bed." No HP, no damage path, no destruction — a tier flag, not a structure. |
| Defender draft | `havenRaidTick()` (~640–700) | Healthy villagers at home (health > 40, not away, not sheltered) meet raiders 1v1 via real `resolveWildMonsterEncounter` fieldFights. Deaths are real. Shielded villagers stand at the back. |
| Lingerers | `havenGrowth.js` `havenGrowthDaily()` (~206–275), `lingeringRaiders()`, `lingerKeyFor()` | Raiders nobody met are re-pinned to the Haven tile and gorge nightly until driven off. Per-raider drift clock: ~6 nights, then it moves on (stamped at lingering start, never re-stamped by a fled fight). A fled/lost scholar fight restores the lingerer to the treeline, wounded not full (`game.js` `tbEnd`, ~46777–46830; wall-wounds rule). |
| Gorge | `havenGrowth.js` `raidPillage()` (~979), daily loop (~244–266) | 500–1,500 kcal/night per lingerer, real pantry draw. Empty stores: 0 kcal, said honestly ("circles the treeline, sniffing at empty stores"). Table-active: no gorge. |
| Lingerer answers | `havenGrowth.js` `answerLingerer()` / `lingererSortie()` (~850–975); `app.js` beats panel (~350–367) | **Endure it** (explicit default, names the ~6-night price) or **sortie**: musters ≥2 fighters besides the scholar via `_musterAway(3,'defense')`, 2,000 kcal/fighter in rations, real blow-by-blow fieldFights, villagers can die. Sortie kills DO feed the wave ledger (`recordWaveKill(...,'sortie')`, ~913). Per-lingerer target buttons via `lingerKey`. |
| Aid / call for help | `comms.js` `raiseAidCrisis`, `resolveAidCrisis`, `callForHelp`, `commsTick` | Raids raise an aid crisis reactively (4 tiers: runner / signal fire / System relay / ability cry). Resolves 'fought' when no living lingerer holds the treeline (checked each tick, 3+ parts old), 'moved-on' on the 6-day valve. Aid-crisis kills feed the ledger (`recordWaveKill(...,'aid-crisis')`, ~686). A fled lingerer still counts as a threat; only the sortie clears lingering on a drive-off. |
| THE SIEGE crisis | `progression.js` CRISIS_BEATS `'the-siege'` (~104–117); fired from `comms.js` `resolveAidCrisis` (~204–209) | Fires only when a RAID crisis resolves 'fought'. Once per run (fireCrisis dedupes). Counts as 1 of the 3+ crises the endgame deed gate needs. |
| Shelter / muster | `src/js/shelter.js` (whole file); wired in `index.html`; `check-wired` 0 unwired | `shelterThreatNearHaven` (wave-4+ within radius 2, hysteresis: stand down past radius 3), `shelterVillagers` / `shelterEveryoneBut` (real `npcSetNode` + `npcSetInside`, barricaded hall door), `shelterMusterCheck` (auto-muster daily from `progDaily`, before the raid tick), `shelterStandDown` (player's call, stamps the threat so dawn doesn't re-muster). Sheltered villagers: wild router can't jump them, raid draft can't spend them, duties skip them. Cost: lost production while sheltered, and unmet raiders linger and gorge. The scholar is never auto-sheltered. Muster is remembered (`'mustered'` memory + `convoTopics.js` 'muster' kind) so villagers talk about it. |
| Breach crisis | `game.js` `startCombat` (~35100–35105); `progression.js` CRISIS_BEATS `'breach'` (~87–92) | Any hostile fight started while the player is at Haven fires THE BREACH: "It got INSIDE. The haven was supposed to be the safe place — the one place. It isn't." (Table-trial fights exempt.) |
| Siege contest | `src/data/contests.json` id `siege`; `contests.js` `_contestSiege()` (~3438–3477) | A blood/extreme ARENA contest: "Hold the chokepoint for three waves while the village watches from the walls." Real tactical fights, health carries between waves. Wave-3-gated. This is a televised contest, NOT a village siege — same word, different thing. |
| Overtime knobs | `havenGrowth.js` via `overtimeRaidKnobs` (titans.json `_overtime`) | Waiting-table tiers shorten the raid cooldown and raise the roll/gorge. The siege gets hungrier while the table waits. |

### 2b. FICTION-ONLY (narrated, no mechanism behind it)

| Line | Where | What is missing behind it |
|---|---|---|
| "the wall was not built for its kind" | `havenGrowth.js` ~610 | NARRATION ONLY (says so in the comment): a wave-3+ raider at the wall reads differently. No spawn, draft, damage, crisis, or economy value is touched. The palisade does the same 25% to a wave-5 monster as to a wave-1 one. |
| "The village holds its breath" / "the siege goes on" | `game.js` ~46808 | True as narration (the lingerer is restored), but there is no siege object for it to "go on" — no counter, no phase, no record. A later run cannot ask "was there a siege on day 40?" except by reconstructing lingerer flags from memory. |
| "the-siege" as a crisis | `progression.js` | Fires only through the aid chain ('fought'). A siege resolved by a sortie that never raised an aid crisis, or by defenders on raid night with no lingerers left, never fires it — the village's hardest night can pass without the crisis ledger ever knowing. (Sortie kills feed the wave ledger, but the siege-as-event is unrecorded.) |
| "MUSTER — … We outlast it" | `shelter.js` `shelterMusterCheck` | The beat is real and the sheltering is real (this half of the siegeroster finding is FIXED). What is still fiction is the *outlasting*: mustering does not end, shorten, or weaken the siege — it only removes villagers from the draft while the gorge continues. Outlasting is waiting, not winning. |
| Wave-6 siege | `docs/MONSTER-WAVES.md` | Scaffold only: "a multi-phase siege, not a duel. Details TBD." No trigger, no roster, no phases in code. The network monsters exist as defs; nothing sieges with them. |
| "the siege" in `safetynets.js` | ~118 | A comment only: crisis-recovery arcs named "famine/disease/siege" — the siege arc is listed as a recovery case with 0/3 villages recovered, but no siege recovery path is defined there. |

### 2c. ABSENT (nothing in code, docs, or data)

1. **No siege state.** No `state.siege`, no siege id, no start/end day, no participant list, no phase. Grep: the only `.siege` references in `src/js` are the contest id and comments.
2. **No siege trigger distinct from the raid trigger.** A siege today IS a raid whose raiders went unmet — emergent, unnamed, unannounced as an episode. The player is never told "a siege has begun".
3. **No apex drive-off verb.** Wave-4/5 lingerers: 0 drive-off kills in 17 attempts (decision 163). The only exits are the 6-day drift, village death, or killing a 850–2,200 HP monster in a fair fight. The beat's "Drive it off, or call for help" is unreachable by combat for exactly the monsters the fiction is about — and call-for-help measured 0 arrivals on those policies.
4. **No wall/palisade condition.** The palisade cannot be damaged, degraded, or repaired. A siege costs the palisade nothing, so the village's one built defense is free forever.
5. **No siege end the player can aim at except endure/sortie.** No "break the siege" condition, no surrender/terms, no escalation if ignored beyond the gorge (the gorge is flat: same 500–1,500/night on night 1 and night 6).
6. **No travel consequence.** Nothing stops the scholar walking away mid-siege, and nothing the siege does follows them. (By design or by omission — undecided; §3.6.)
7. **No siege memory in the village.** Muster is remembered; the siege itself is not (no `'besieged'` memory kind, no gossip seed beyond the generic 'raid' seed, no lately-topic). Villagers talk about the muster, never about "the week the teeth camped the treeline".
8. **No water pressure.** The gorge takes pantry kcal only. A siege cannot touch water — worth stating, because the cistern is the other half of the survival economy and the siege currently cannot threaten it.

## 3. The design — what a siege IS

Design calls below are mine (the builder's), Steve can overrule; the ones that need
his ruling before building are marked **[steve-call]** with the decision-pack item.

### 3.1 Definition

**A siege is the named episode that begins when a raid's unmet raiders linger at the
treeline, and ends when the treeline is clear, the raiders drift off, or the village
dies.** It is not a new spawn system and not a new monster: it is the episode frame
around mechanics that already exist (raid → linger → gorge → endure/sortie/call/muster).
Framing is the missing piece — today the player experiences a siege as a string of
unconnected nights; the design makes it one named thing with a beginning, a middle
the village can act in, and an end the village can aim at.

Two kinds, one frame:

- **Raid-siege** (waves 1–3, usually): a raid went unmet. The village's own defenders
  already handle most of these on raid night; the siege is the tail — the one or two
  raiders nobody met, eating 500–1,500 kcal a night for up to ~6 nights.
- **Apex siege** (wave 4–5 lingerers): the same frame, but the monster cannot be
  driven off by a fair fight today (decision 163) and the muster auto-fires. This is
  the siege the fiction is about — "the treeline holds its shape" — and the one with
  no played answer. §3.4 is the answer.

The wave-6+ siege (`MONSTER-WAVES.md` scaffold) is the same frame at endgame scale:
the System stops calibrating and starts sieging the village that refuses the table.
It reuses this design with harder numbers; it is not designed separately here.

### 3.2 What a siege CAN threaten (the haven law, obeyed)

Havens do not break — the hall, the bunks, the door, the lodge are unbreakable
(`destroyCell`). So a siege threatens everything AROUND the unbreakable core:

- **People outside the hall.** Villagers on duties, the scholar away from Haven, anyone
  the muster didn't bring in. The wild router and the raid draft are the siege's teeth
  here, and they are already real. Inside the hall, people are safe — that is what
  the muster buys, and what decision 88 (sanctuary) would confirm.
- **Food.** The gorge: 500–1,500 kcal/night per lingerer, real pantry draw. This is the
  siege's clock and its honest price. A siege that finds a fat pantry eats fat; a siege
  that finds empty stores circles and takes nothing (already said honestly in code).
- **The palisade — proposed, not built.** The palisade is a wall, not a haven: Steve's
  law says everything except havens (and alien structures) can be destroyed. Today it
  has no condition. **[Design call]** Give it one: each siege night, each lingerer
  gnaws the palisade's condition; at zero the palisade is breached — raiders stop
  taking the 25% wall damage and the "safe sleep" line goes silent until it is
  repaired with wood + stone between sieges. The haven still does not break; the wall
  around it can. Repair is the between-siege verb that makes the palisade a living
  defense instead of a free tier flag.
- **Water — deliberately NOT threatened.** The gorge takes pantry kcal only, and the
  design keeps it that way: the cistern sits inside the hall's orbit, and a siege
  that could thirst the village out from the treeline would make the muster a death
  sentence instead of a refuge. If Steve wants water pressure in sieges, that is a
  separate ruling; the default is food + people only.
- **Morale and memory.** Fear, gossip, the muster memory, the siege's own memory
  (§2c.7 — to be added). A siege the village survives should be *remembered* by the
  village: who stood the watch, who was lost, how long it lasted. The siege is a
  story the village tells afterwards, and the telling is part of the reward.
- **The road.** See §3.6 — the siege does not close the road; it taxes leaving.

### 3.3 Trigger — reuse the raid trigger, name the moment

No new spawn logic. A siege begins the moment a raid leaves a living lingerer
(`m.lingering = true` in `havenRaidTick`). The new work is a **beat, once per
episode**: "They're not leaving. [Name] holds the treeline — the siege is on."
Named via `monsterNoun` (knowledge-gated, never the true name), said aloud at the
fire like the raid line, recorded with start day + lingerer keys. The siege ends
when `lingeringRaiders()` is empty (driven off), when the drift clock clears the
last one (moved on), or when the village dies. Each ending gets its own line —
the driven-off ending fires THE SIEGE crisis beat (see §3.5); the drifted ending
gets a quieter "the treeline is quiet" line, not the crisis beat (outlasting is not
the same deed as driving them off).

Trigger discipline, from canon: reactive (fires on the raid's outcome, never a
timer), once-only per episode, knowledge-gated. The siege is never scheduled.

### 3.4 The apex answer — a played verb for wave-4/5 lingerers [steve-call: 163]

The gap: waves 1–3 lingerers can be driven off (37 in 71); waves 4–5 cannot (0 in
17). The fiction promises "Drive it off, or call for help" and the engine provides
neither by combat. **[Design call, pending Steve's ruling on 163]** — the answer is
**wounding as a break condition**, built on mechanics that already exist:

- The wall-wounds rule already preserves damage: a lingerer the scholar fled from
  comes back to the treeline wounded, not full (`game.js` `tbEnd`). Damage persists
  across fights. What does not exist is a threshold where accumulated wounds make the
  monster *break* — today it holds the treeline at 1 HP as firmly as at full.
- **Proposed verb: break it.** A lingerer whose HP has been driven below a threshold
  (half its pre-siege HP, measured on the world entity, not the fight copy) by any
  combination of sorties, scholar fights, and defender fights *breaks*: it flees the
  treeline, the siege resolves 'fought', and the break is said aloud ("It breaks and
  runs — the treeline is clear of it"). The existing sortie line already has this
  sentence for a driven-off lingerer; the threshold makes it reachable for apex
  monsters, where a single fair fight cannot do it.
- This keeps every canon law: encounters are fought, not rolled (the wounds are earned
  blow-by-blow); the monster is never trivialized (half its HP is still a siege's
  worth of fighting); the village can do it together across nights (sortie + scholar
  + defenders accumulate); and it reuses the sortie's existing machinery rather than
  adding a button.
- Call-for-help stays as the backup, not the answer (the pack's lean on 163): aid
  that arrives helps fight the siege; it does not resolve it by itself. The 0-arrivals
  measurement on apex policies is the reason — the answer cannot be a chain that has
  never delivered.

If Steve rules the other way on 163 (apex monsters simply do not camp Haven), the
apex siege disappears and this section is deleted — the raid-siege frame (§3.1)
stands unchanged.

### 3.5 During a siege — what the player and villagers do

Everything in this list exists today except where marked **[new]**:

- **Endure it** (exists): the explicit default. The price is named every night
  (the gorge line + "~6 nights"). Enduring is a real choice with a real price,
  not a failure to act.
- **Sortie** (exists): ≥2 fighters, 2,000 kcal/fighter, real fights, real deaths.
  Sortie kills already feed the wave ledger — a siege fought is standing earned.
- **Call for help** (exists): the four tiers. Aid that arrives fights at the door.
- **Muster / stand down** (exists): auto-muster for wave-4+; the player's call to
  stand down is their risk, stamped so dawn doesn't re-muster behind their back.
- **Fight it yourself** (exists): walk out to the treeline and meet the lingerer —
  the scholar's blows land and persist (wall-wounds). The scholar is the siege-breaker
  of last resort, at the scholar's own risk.
- **Repair the palisade** (between sieges) **[new, with §3.2]**: wood + stone, a real
  cost, said aloud. A village that never repairs fights the next siege without a wall.
- **Remember it [new]**: a `'besieged'` memory + gossip seed + lately-topic, so the
  siege lives in villager mouths afterwards ("the week the teeth camped the treeline")
  instead of only in the raid log.

Villager agency during a siege is the muster plus the existing duty/routine system:
sheltered villagers do no duties and still eat — over-sheltering starves the village
through lost production, which is the episode-length pressure, not a verb bug
(`shelter.js` rules). The design adds no villager-side siege AI: villagers do what
people do — go inside when told, come out when the all-clear sounds, talk about it
after. The one-brain program owns any deeper siege behavior; this note does not
pre-empt it.

### 3.6 Leaving during a siege

**[Design call]** The road stays open. Nothing stops the scholar walking away
mid-siege, and the siege does not follow them — but the village endures without
them at the gorge price, and the siege-ending line waits at the fire for their
return (the existing `sayHavenNews` relay pattern). Leaving is a real choice with
a real cost (the pantry keeps bleeding, the defenders fight short-handed), not an
escape hatch and not a trap. Closing the road would make the siege a cage; the
game's travel is the village's lifeline, and a siege that cut it would punish the
scale climb (roads, tribute runs, aid) more than it punished the siege.

### 3.7 How it ends, and what it costs (summary)

| Ending | Trigger | Cost paid | Recorded as |
|---|---|---|---|
| Driven off | last lingerer killed or broken (§3.4) | gorge nights + sortie rations + any deaths | THE SIEGE crisis beat + wave-ledger kills |
| Drifted off | ~6-night clock clears the last lingerer | gorge nights only | quiet "treeline is quiet" line; NO crisis beat |
| Village dead | roster wiped / scholar line ended | everything | the siege dies with the village; no beat |
| Breach | a hostile fights the player inside Haven | the safe place isn't | THE BREACH crisis (exists) |

Costs, all legible: gorge kcal (500–1,500/night/lingerer), sortie rations
(2,000 kcal/fighter) + death risk, sheltered production lost, palisade condition
(proposed), fear/morale, time. No silent costs: every night's gorge is said aloud
at the fire (or relayed on return), every sortie price is named before it is paid.

### 3.8 The scale-wall connection — is the siege a pressure or an on-ramp?

**Both, and that is the point.** Answer from the design, not from vibes:

- **As pressure:** the siege is the tax on scale. The raid trigger is wealth-gated
  (pantry ≥3,000 kcal; more raiders above 12k/24k), so a village climbing toward
  national — stockpiling the tribute, feast, and granary the scale ladder demands —
  draws bigger sieges exactly as it gets richer. The covenant's mutual-defense calls
  cost two villagers for three days; conquest realms pay in hatred and revolt risk.
  Villages that push toward national starve mid-ambition (~day 39, dead by day 63 in
  the 2026-10-12 sims) partly because the pantry they need for the climb is the
  pantry the siege eats. A siege that only taxed would be another wall.
- **As on-ramp:** the siege already feeds the climb, and the design widens the channel.
  Sortie and aid-crisis kills feed the wave ledger (`recordWaveKill` channels
  'sortie' and 'aid-crisis'), and ledger points feed standing (+25 per wave-3+ point)
  — the blood road to wave 4. The-siege crisis counts toward the deed gate's 3+ crises.
  A village that *fights* its sieges, rather than enduring them, earns the standing
  that opens the next wave and the crises the table counts. What the design adds is
  the apex break (§3.4): today the apex siege can only tax (gorge + deaths) because
  it cannot be driven off — the on-ramp is closed at exactly the tier where the
  scale wall bites hardest. Opening the break turns the apex siege from a bleed-out
  into a deed.
- **As endgame road:** the wave-6 siege is the long-survival alternative to sitting
  at the table — the village that keeps surviving gets sieged, and the siege leads to
  the egg. The siege is therefore not a detour from the win: for the village that
  refuses the table, it IS the road to the ending.

The measurement arm's job (§4) is to check whether that on-ramp claim is true in
sims: do villages that fight sieges climb faster than villages that endure them, or
does the gorge eat the surplus either way?

## 4. Measurement instrument for the next run

For the measurement arm that picks this up (Tier 2 siege, first numbers). The
instrument is an episode recorder, not a policy: it watches the existing raid /
linger / gorge / sortie / shelter machinery and classifies every siege episode.

### 4.1 Events to capture (per episode, per seed)

- `siege_start`: day, seed, trigger (raid id / draft size), raider waves
  (`crisisWaveOf` per raider), palisade tier at start, pantry kcal at start.
- `siege_night`: per night — gorge kcal taken (`raidPillage` return), lingerers
  holding, sheltered count, muster state.
- `siege_sortie`: launched? fighters, rations paid, outcome per fight
  (vKill/mFlee/vFlee/vDie), lingerer HP before/after (world entity), break?
- `siege_aid`: crisis raised? tier called? help arrived? resolved how?
- `siege_scholar_fight`: scholar met a lingerer directly — outcome, wounds dealt.
- `siege_end`: day, ending (driven-off / drifted / village-dead), total gorge kcal,
  total nights, villager deaths by channel (raid draft / wild / sortie), scholar
  deaths, THE SIEGE fired? THE BREACH fired?
- `siege_aftermath`: standing delta across the episode (ledger points earned),
  palisade state, days to next raid.

### 4.2 Per-seed metrics

Sieges/seed; siege-nights/seed; kcal gorged per siege (median); villager combat
deaths per siege by channel (roster rule, MEASUREMENT.md §14c — the wall lives in
the roster, not the scholar); scholar deaths per siege; sorties per siege;
share resolved fought vs drifted; share of villages that ever see a siege; apex
sieges (any wave-4+ lingerer) per seed; siege-to-national days (for villages that
reach national); sieges survived before first national.

### 4.3 GO bar shape (instrument-validity first, like the other Tier-2 first runs)

Primary (instrument validity): **every siege episode classified** — 0 unclassified
endings across the pilot band; every gorge night attributed to a live episode; every
sortie outcome recorded. The bar is the instrument's, not the game's: GO means the
recorder sees sieges completely, whatever the numbers say.

Secondary (mechanism check, pilot 8 seeds, competent policy, death-aware horizon
per MEASUREMENT.md §§9–12): **sorties move the fought-resolution share** — a
sortie-capable policy resolves more sieges 'fought' than an endure-only control on
identical seeds. Pre-register the threshold against the pilot's own control numbers
(pool-size the bar after the probe, §14b — do not pull a threshold from nowhere).

Guardrails: median survival, national reach, table/wins not regressed vs the same
panel; no new death mode at family level. Judge through the balanced panel
(`scripts/balance-panel.js`, §15); the panel is the instrument, the pre-registered
threshold is the judge. Metric review section mandatory.

### 4.4 Substrate checklist (§14b) for the measurement run

1. **Contact**: raids fire on the measurement substrate (probe: siege_start > 0
   on the pilot band — if zero, the pantry never reaches 3,000 kcal and the pilot
   measures nothing).
2. **Pool sizing**: pool = siege episodes per seed; bar the fought-share against
   the observed pool, not an absolute.
3. **Verb existence**: endure/sortie/call/muster/shelter all exist and are wired
   (§2a). The apex break (§3.4) does NOT exist — the measurement arm measures
   the gap (0 drive-offs) and does not assume the verb.
4. **Horizon fit**: sieges are a mid/late phenomenon (raids need a 3,000-kcal
   pantry; apex needs wave-4 unlock). Horizon must contain wave-4 unlock + 60d
   (the siegeroster window); a 100d cap truncates the apex siege.

## 5. Sense-test — do the siege-adjacent lines read as people under siege?

Read, not counted (SENSE-TESTING LAW). Verdict: **the raid/siege lines are the
best-written pressure narration in the game; the muster beat is the single best
line; the weak spots are the ones with no mechanism behind them.**

- **Muster beat** (`shelter.js`): "📯 MUSTER — scouts report [noun] hunting near
  Haven, and it is beyond us. Everyone inside. No one walks the treeline alone —
  the garden crews double up, the hunters stand down. We outlast it." Reads as
  people, not decoration: it names the threat (knowledge-gated), names what changes
  (crews double up, hunters stand down), and names the plan (outlast). The
  siegeroster sense-test (2026-10-15) already judged it so. The flaw is not the
  line — it is that "we outlast it" is the whole plan, and outlasting has no end
  the village can aim at. The design's episode frame (§3.3) is what this line is
  waiting for.
- **Gorge line** (`havenGrowth.js`): "🌙 Night. The lingering [name] gorges at the
  treeline — 1,234 kcal gone from the stores. Endure it (they drift off within ~6
  nights — the gorge is the price), or send a sortie: fighters, rations, real risk."
  Reads as people under siege: the price is exact, the options are named, the
  duration is promised. The promise ("within ~6 nights") is kept by the drift clock
  — the narration and the mechanism agree, which is rarer than it should be.
- **Raid line**: "🐗 RAID — 3 raiders ([names]) hit Haven in the night, drawn by the
  smell of the pantry! The palisade's stakes take their toll as they come over the
  wall." Reads as people: wealth has a scent, the wall has a cost. The palisade
  clause is honest about what the wall does (25% damage) and silent about what it
  cannot do (it cannot break, cannot be degraded) — the line is true, the system
  behind it is thinner than the line implies.
- **"The wall was not built for its kind"** (wave-3+ escalation beat): reads as
  dread, but it is decoration — the comment says NARRATION ONLY, and the wall treats
  the wave-5 monster exactly like the wave-1 one. A line that promises a difference
  the engine does not have is the one sense-failure in the set. Either the palisade
  should care about wave (§3.2's condition proposal gives it a reason to) or the
  line should go.
- **Contest Siege** (`contests.js`): "A chokepoint of rubble and light-fencing. Beyond
  it: the beacon. Behind you: the village, watching from the walls… Someone on the
  wall is screaming your name." Reads as a show, which is what it is — a televised
  contest, not a village siege. The confusion is lexical (same word, two things),
  and the design note's job is partly to keep them apart: the contest is a show
  about holding a line; the siege is a week of nights at the treeline.
- **THE SIEGE crisis beat** (`progression.js`): "They came in the night for the pantry
  — and the village met them at the door with blades and fire and drove them back
  into the dark. Wealth has a scent. So does defiance." Reads as a village that
  *did* something. The gap is that it only fires through the aid chain — a village
  that drives raiders off with its own defenders and never calls for help never hears
  this line. The deed exists; the beat misses it.
- **Stand-down line** (`shelter.js`): "You give the word — the hall door unbars and
  the village files back out, eyes on the treeline. [Threat] still hunts out there;
  the muster waits on your word now." Reads as a real decision with a real risk
  attached — the player's call, their risk, said aloud. This is the standard the
  siege's other verbs should meet.

## 6. Findings (one-liners for the coordinator to append to sim-findings.md)

- [open] 2026-11-11 — siege — no siege system exists (SUBSTRATE-MISSING confirmed): raids + lingerers + shelter stage a siege without ever naming it; no siege state, trigger, phase, or end (evidence/2026-11-11/sim-siegedesign-a.md).
- [open] 2026-11-11 — siege — apex lingerers have no played drive-off (decision-pack 163 UNRULED): 0 drive-off kills in 17 attempts; design proposes a wound-threshold break built on the wall-wounds rule, pending Steve's ruling (evidence/2026-11-11/sim-siegedesign-a.md §3.4).
- [open] 2026-11-11 — siege — THE SIEGE crisis beat fires only via the aid chain: a village that drives raiders off with its own defenders never hears it (progression.js / comms.js).
- [open] 2026-11-11 — siege — "the wall was not built for its kind" is narration-only: the palisade deals the same 25% to wave-5 as wave-1 and has no condition, damage path, or repair (havenGrowth.js).
- [open] 2026-11-11 — siege — no siege memory: muster is remembered, the siege itself is not — no 'besieged' memory, gossip seed, or lately-topic (shelter.js / convoTopics.js).
- [open] 2026-11-11 — siege — siege has no canon doc: five docs mention it, none defines it; wave-6 siege is scaffold-only ("Details TBD", MONSTER-WAVES.md).
- [open] 2026-11-11 — siege — call-for-help measured 0 arrivals on apex policies (decision-pack 163): it cannot be the apex siege's only answer (evidence/2026-11-11/sim-siegedesign-a.md §3.4).

## 7. What this design assumes, and what it does not do

- Assumes the decision pack's lean on 88 (Haven is sanctuary inside) and on 163
  (siege answer first, call-for-help as backup). If Steve rules otherwise, §3.4
  and the sanctuary line in §3.2 are the parts that change; the episode frame
  (§3.1–3.3) stands either way.
- Does NOT implement anything: no `state.siege`, no break threshold, no palisade
  condition, no `'besieged'` memory. Those are build items for the build arm, after
  Steve rules on 163 (and 88, if the sanctuary line is contested).
- Does NOT re-measure the scale wall: no sims were run in this arm. The wall numbers
  cited (national 0, table 0, wins 0 in the 2026-10-12 sims; siegeroster wall numbers
  national 3/8, table 1/8, wins 0/8, median 86d) are quoted from the cited evidence,
  not re-derived here.
- Proof test `scripts/test-siegedesign-a.js` pins the substrate claims mechanically
  (function presence/absence, crisis-beat firing + dedupe, contest data, the
  ten-file siege footprint) so a later run can re-run it and catch drift — if a
  siege system lands, the absence assertions fail loudly and the test must be updated
  to the new substrate, which is the point.

## Sources (all read this run)

- `docs/CANON.md` (manifest; no SIEGE doc listed) · `docs/MONSTER-WAVES.md` (waves 1–6,
  wave-6 siege scaffold) · `docs/SCALE.md` (ladder, six roads, covenant/conquest) ·
  `docs/SCALE-DISCOVERY.md` (pointer beats 4–5) · `docs/ENDGAME-BUILDS.md` (phoenix) ·
  `docs/MEASUREMENT.md` §§14–15 (SUBSTRATE-MISSING, siegeroster, roster rule, panels) ·
  `docs/ONTOLOGY.md` (raid_raises_siege, shelter, siege contest) ·
  `docs/DECISIONS.md:973` (unbreakable law) ·
  `docs/steve-call-decision-pack-20261024.md` items 163, 256, 88, 411 (all UNRULED) ·
  `hidden_files/convergence-tracker.md` (siege SUBSTRATE-MISSING line).
- Code: `src/js/shelter.js` (whole file) · `src/js/havenGrowth.js` (raid tick, gorge,
  lingerer answers, raidPillage) · `src/js/comms.js` (aid chain, commsTick) ·
  `src/js/progression.js` (CRISIS_BEATS the-siege/breach, fireCrisis) ·
  `src/js/game.js` (destroyCell unbreakable list, villagerMonsterTick shelter skip,
  tbEnd lingerer restore + wall-wounds, startCombat breach) · `src/js/contests.js`
  (`_contestSiege`, siege gating) · `src/js/contestEngine.js` + `src/js/godverbs.js`
  (siege as blood-contest scale) · `src/js/safetynets.js` (siege-arc comment) ·
  `src/js/app.js` (muster + lingerer beats panels) · `src/data/contests.json`
  (siege contest def).
- Evidence: `evidence/2026-10-15/sim-siegeroster.md` (narration without a mechanism;
  2.40 → 2.40, byte-identical; muster beat reads well).
