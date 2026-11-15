# sim-fighterhold-b — fighter survivorship through wave 4

**Verdict: DIAG-NO-GO.** The death decomposition names a dominant channel with
numbers, and every candidate lever against it is either refuted by the data,
forbidden by this arm's hard boundaries, or a design call that belongs to
Steve. No game code was changed. No pilot was run. No prereg was written
(prereg is written after the diag and before any pilot sim; with no pilot
there is nothing to pre-register). What follows is the decomposition, the
mechanism verification, the candidate-by-candidate ruling, and what the fix
actually needs.

Loop B run `fleshout-loop-b-20261115T0411Z`, axis winnability chain, tracker
blank 3 (second half). Follow-up to holdbuild: holdbuild's upkeep+reclimb
build fired (23 tends) but went NO-GO at pilot because ON villages died in
combat while national. The binding constraint had moved from tending to
fighter survival. This arm was asked: find WHY national villages' fighters
die, then build ONE lever against the dominant channel.

## Plain-words summary

National villages do not die because their fighters are wounded, or because
they fight in the arena, or because nobody comes to help. They die because
the scholar — the player character, the one who carries the Codex — walks out
alone, at full health, meets one wave-4 or wave-5 monster, and loses the
fight. That happens again and again: the Codex passes to the next villager,
who wakes up healthy, walks out the same day, meets another monster alone,
and dies the same way. Two to six scholars can die in a single day. A village
with ten people burns through its whole roster in a week. The pantry is
usually fine. The links are usually fine. The people just keep dying in
single fights they lose at full health.

The fix for "losing a fair fight at full health" lives in exactly two places
this arm is not allowed to touch: how well fights are played (the combat-play
gate still holds — no toughness, gear, or ability tuning until villagers play
combat properly) and fleeing (flee-repair is a Steve call, held branch
`sim-fleerepair-a`). Everything else the data was asked about turns out not
to be the cause.

## Stage 0 — reproduction: PASS 3/3

Re-ran seeds 100201, 100203, 100212 with the recovered fixed driver
(`scripts/holdbuild-driver-20261114.js`), flags OFF, against the committed
answercourt-confirm corpus. All judged fields reproduced exactly; zero field
diffs (only `anchorCommit` differs by construction: corpus
`b3de4e512cf003e4004d7254431146ead1195039` vs fresh
`2a0c9b0d6d9ff62e09f4d940d2235839a64bf06b`).

- 100201: 150d, survived, national, natDay 62, maxWave 4, standing 199, deaths 50, verbEvents 30.
- 100203: 150d, survived, regional, natDay 62, maxWave 5, standing 350, deaths 76, verbEvents 14.
- 100212: 150d, survived, regional, natDay 65, maxWave 5, standing 225, deaths 56, verbEvents 18.

Branch at master `2a0c9b0d6`. `src/js/win-plan.js` on this master has 0
HOLDBUILD references — the hold build is fully reverted; flags OFF = default
behavior.

## The decomposition (committed holdbuild pilot corpus, 16 files)

Instrument: `scripts/analyze-fighterhold-diag-b.js`. Output:
`evidence/2026-11-14/fighterhold-b-diag.json` (full per-death table).

Death-record semantics, grounded in code (`scripts/sim-harness.js:322-345`
live capture from `Game.tele('death', ...)`; `src/js/corpses.js:219`
`registerDeath` is the single tele source):

- kind `monster` + cause `villager combat` / `expedition` / `combat` = a
  MONSTER was killed (a kill, not a villager death). Holdbuild's
  `villagerCombatDeaths` counted these — that label was misleading; it is not
  reused here.
- kind `villager` / `person` = a person died. `who` = victim vid;
  `player:true` = the scholar died → succession.
- Cause vocabulary grounded in call sites: `the wild` = scholar died in a
  turn-based field fight vs a monster (`tbFightDeathCause`, game.js:47029-47043:
  monster-only fight → `the wild`; arena contest → `the arena`; hostile alien
  → `a stranger`); `monster` (player=false) = non-player villager killed by
  monster damage via `hurtVillager` (game.js:8335-8372); `combat` = field-fight
  villager death; `raid` / `raid-defense` = raid; `expedition` = expedition;
  `contest` = contests; `ambush` = betrayal; starvation / hunger / thirst /
  disease / wound = non-combat.

### People deaths while national: 121 (ON 69 / OFF 52)

By channel:

| channel | deaths | share |
|---|---|---|
| `the wild` — scholar dies in a field fight | 88 | 72.7% |
| field-combat — non-player villager killed by a monster | 20 | 16.5% |
| non-combat (starvation 2, disease 1, thirst 1, wound 2) | 6 | 5.0% |
| other (`a stranger` 2, `the arena` 2, `The Loud Beast` 1, `the night` 1, `Loud-Eyes` 1) | 7 | 5.8% |
| raid / expedition / contest / ambush while national | 0 | 0% |

By who: **scholar (player) 95, non-player villagers 26.** Of the 121, 68 of
the 96 classifiable victims had ZERO monster kills — the dead are mostly
people who had never killed anything, because the mantle passes by trust, not
by fighting ability.

Victim buckets (nearest `samples.villagers` snapshot ≤ death day, snapshots
every 30d): fighter (kills > 0) 28, armed-non-killer (0 kills but a combat
ability) 55, non-fighter 13, unknown 25. The unknown 25 are mostly recent
joiners (`app_*` / `visjoin_*`) who joined after the last snapshot — a stated
limitation, not a hidden one.

Per-seed national deaths (natDeaths / deaths before national / deaths after
losing national / held-days / died while national):

| seed | OFF | ON |
|---|---|---|
| 100201 | 2 / 2 / 0, held 90, survived | 12 / 1 / 0, held 73, lost d134 |
| 100202 | 0 / 0 / 16, held 0, lost d120 (never national) | 1 / 8 / 0, held 42, survived |
| 100203 | 6 / 2 / 10, held 28, survived | 12 / 5 / 0, held 36, lost d97 |
| 100204 | 13 / 2 / 1, held 71, lost d140 | 14 / 2 / 0, held 71, lost d138 |
| 100205 | 7 / 8 / 0, held 7, died while national, lost d68 | 9 / 7 / 3, held 38, lost d123 |
| 100206 | 6 / 9 / 5, held 72, lost d137 | 9 / 4 / 0, held 90, survived |
| 100207 | 5 / 4 / 0, held 30, died while national, lost d103 | 0 / 14 / 0, held 5, died while national, lost d69 |
| 100208 | 13 / 3 / 1, held 57, died while national, lost d132 | 12 / 2 / 0, held 14, died while national, lost d76 |

Whole-corpus people deaths by cause (all days): `the wild` 139, `monster`
42, `combat` 2, `the arena` 8, `a stranger` 3, `Gavel` 6, `ambush` 8, `the
expedition` 2, starvation 5, sickness 3, `a wound that wouldn't close` 3,
disease 1, `lockjaw` 1, `The Loud Beast` 1, `the night` 1, `Loud-Eyes` 1,
`The Focus Group` 1, thirst 1.

### How the 12 lost villages actually ended

- **Extinction by scholar-death cascade — 8:** OFF 100202, 100205, 100206,
  100208; ON 100201, 100203, 100205, 100208. Population falls to 0 through
  repeated `the wild` scholar deaths.
- **Scholar death, no successor (1 person left) — 2:** OFF 100204, ON 100204
  (last death: scholar starved, `visjoin_128` / `visjoin_132`).
- **Scattering (hunger) — 2:** OFF 100207 (pop 7 at end, pantry 0 d102–103),
  ON 100207 (pop 5 at end, pantry 0 d65–69; pop ROSE 1→5 during starvation as
  joiners arrived). Scattering fires at game.js:32840 (`hungryDays >=
  famineLimit`); the series pantry is a dawn sample while endDay sees the
  post-eating pantry, so the 3rd hungry day plausibly falls a day after the
  last zero dawn sample.

Same-day scholar-death cascades (multi scholar deaths in one day): OFF
100202 d104×3, d120×2; OFF 100204 d109×2; OFF 100205 d60×2, d67×5; OFF
100206 d122×2, d136×2; OFF 100207 d90×2; OFF 100208 d130×2, d131×3; ON
100201 d125×6; ON 100203 d86×2; ON 100204 d109×2; ON 100205 d30×2; ON
100207 d60×3, d61×3; ON 100208 d63×2, d67×2.

Case study — ON 100201 d125: population 8→3 in ONE day, SIX scholar deaths
`the wild` the same day, no link/event lines that day; pop 3→2→1→0 by d134.

## Mechanism probe (diagnostic only — NOT judged data)

Instrument: `scripts/probe-fighterhold-b.js`. Wraps `Game.tele` before
`runDays`, records `combat_start` rows (monster, wave, pack, scholar HP at
start, full fighter list incl. allies) and `death` rows with last-fight
context; counts `tbBarrierExit` calls. Runs with NO build flags (OFF
behavior) and no driver snapshot/verb wraps, so probe trajectories diverge
from the corpus ON leg (same mechanism, different days — e.g. probe 100208
loses d132 via a d129–132 Network_Note cascade; corpus ON 100208 loses d76
via a d63–69 cascade). Probe 100201: survived, 50 deaths (matches corpus OFF
50). Probe 100208: village-lost d132, 69 deaths (matches corpus OFF). Probe
100203: survived d150, 76 deaths (matches corpus OFF 76).

Outputs: `evidence/2026-11-14/fighterhold-b-probe-100201.json`,
`-100208.json`, `-100203.json`.

### Pooled fatal fights (24 with a same-day fight): the scholar loses at full health, alone or not

- Waves: wave 4: 14, wave 5: 7, wave 3: 1, wave 1: 1 (a sickness death — the
  scholar entered a Sunback fight at 9 HP and died of sickness).
- **21 of 24 entered at 98–107 HP (full health).** Only three entered below
  70 HP (66, 21, and 9 — the last the sickness case). Wounds are not the
  mechanism.
- **Allies were present in 7 of 24 fatal fights** (including 2-ally cases) and
  the scholar still died. Party absence is not a sufficient cause.
- 17 of 24 fatal fights were solo (0 allies). Fatal locations: forage-trip
  corners/edges (0,0), (8,0) — the scholar forages alone, far from any
  villager — and INSIDE the hall (`insideHaven=true`, 6 of 24): 100201 d81
  Reunion pack 3; 100208 d105 Influencer w4, d129 Terms_of_Service w3,
  d130/d131×2 Network_Note w5.
- Per-seed fatal fights: 100201 — 3 scholar deaths, all wave 4, all at full
  HP (99–100), 2/3 solo; 100208 — 14 scholar deaths, ALL 14 fatal fights
  SOLO, all pack 1, waves w1×1, w3×1, w4×7, w5×5, HP median 100; end
  cascade d129 Reunion w4 solo, d130 Algorithm w4 (HP 66) + Network_Note w5
  solo, d131 Network_Note w5 solo ×3, d132 Network_Note w5 solo — FIVE
  scholar deaths in 4 days, FOUR to the same species Network_Note;
  100203 — 8 scholar deaths, 7 with same-day fight, waves w4×4, w5×2,
  w1×1, all at 98–107 HP.
- `tbBarrierExit` calls: **0 on all three probe seeds.** The policy never
  invokes the barrier exit at all.
- Pooled flee counters across the 16 pilot corpus files: fled 517,
  fleeStuckTurns 373, fledBad 235, fleeBlocked 71, struck 1995; abilities
  pressed war_cry 127, rage 93, pocket_sand 9. Flee is attempted constantly
  and gets stuck 373 times — the flee-failure channel is very much alive in
  this corpus.

### Mechanism verification (code reads)

- **Succession wakes the successor at FULL health.** `ledger.js`
  playerDeath: successor = highest-trust living roster member, gets their OWN
  kit / abilities / tracks / gear via `mantleBecome`, and `s.health =
  this.maxHealth()`, kcal 1500, trauma 10, statuses/diseases/poisons cleared,
  blood-price wound cleared. `mantleBecome` does not touch health; the reset
  is in playerDeath. The "wounded successor" hypothesis is dead. The dead
  bearer's gear stays on the corpse (sentimentals buried); the successor uses
  their own belongings.
- **Sleep heals the scholar ~20 HP/night at the hall** (sleep_heal_hall 20,
  bunk 35, tent 25, fireside 18, ground 12). A scholar who survives a fight
  heals overnight. Wounds do not accumulate for the scholar across days.
- **Fights are joined by proximity, not by party.** `game.js` startCombat
  (~35280): fighters = the scholar + villagers within 4 squares on the same
  node, nearest 4, via `tbHumanFighter` (reads persistent `village.health[vid]`;
  HP ≤ 0 cannot join). Pack spawn scales to party size. The scholar forages
  alone at a tile corner, so nobody is within 4 squares — nobody joins.
  Policy never forms a party (no party/companion formation in
  `competent.js`; `needTrip` gates forage trips on pantry < 25,000 or scholar
  kcal < 50% cap and NEVER checks scholar health; `recovering()` is gated on
  `dirFleeOn()` and fight-assess on `COMPETENT_FIGHT_ASSESS=1`, both unset in
  the corpus runs; `keepPromiseHeal` tends wounded NPC villagers, not the
  scholar).
- **The breach is a designed crisis.** A fight starting while the scholar is
  at Haven fires `fireCrisis('breach')` (game.js:35303): "THE BREACH — It got
  INSIDE. The haven was supposed to be the safe place — the one place. It
  isn't." (progression.js:87, Steve 2026-10-09). Monsters reach the hall
  because the stalk/chase code (`mv()`) steps a pursuing monster onto the
  scholar's tile without an `isSafeTile` check — `checkEncounter` returns
  early on safe tiles, and wander/spawn respect `isSafeTile`, but the chase
  does not. The treeline ambush (game.js:12573) is a related but distinct
  path: door-fled monsters wait at the treeline and re-engage when the new
  bearer leaves Haven. The same-monster cascade (Network_Note killing 4
  scholars d130–132, same species, same tile, same days) is consistent with
  one killer persisting at Haven between successions — but the probe recorded
  only the monster definition id, not a world-monster instance id, so
  same-instance persistence is INFERRED, not proven.
- **The dawn scorer "wounds/wear first" caveat has no located code gate.**
  Grep of `villager-agency.js` found no wounds-gate on dawn decisions (only
  `homeWounds` for learners, post-flee rest, open-wounds threshold < 40).
  Recorded as unverified, not assumed.

## Sense-testing: the corpus says it plainly

ON 100208, the village reaches national on d62 ("Speakers from Stonebridge,
Thornfield, Emberhold ride in for the first court") — and the cascade starts
the next day. Quoted from the committed ON file's link lines:

> d63 🕯️ Carlos is dead — and the dead hold no treaties. Every link Haven has shakes.
> d63 The Codex doesn't pause for grief. Dong blinks — and it's already there, overlaying everything, syncing. No pen. No paper. The mantle just... transfers.
> d63 You STRIKE the eulogy for 34 (Bow).
> d63 No arrow left. Your Bow is a stick you hold wrong.
> d63 🕯️ Dong is dead — and the dead hold no treaties. Every link Haven has shakes.
> d63 The Codex doesn't pause for grief. Maeve blinks — and it's already there...

Two scholars dead in one day; the successor fights with a bow that has no
arrows ("Your Bow is a stick you hold wrong") and keeps striking with it —
fight play, not a wound. The roll call continues: Maeve d65, Emma d66,
Wanjiru d67, Adrian d67, Ines d68, Luis d69, Niamh d75, Naran d76 —

> d76 🕯️ Naran is dead — and the dead hold no treaties. Every link Haven has shakes.
> d76 No one is left to pick up the Codex. The village dies out — quietly, the way villages do. The season ends here.

The lines are coherent with the numbers: the village does not starve, its
links do not collapse first, its people do not scatter — the Codex just keeps
passing to the next healthy person, who walks out and dies. Note also the
d60–62 counterpoint in the same file: "Maeve killed Murkcap out past the
ridge — with Emma charging in when it turned — and walked home" and "Dong
killed Big Loud out past the ridge — alone — and walked home." The village
CAN win fights. It loses the solo wave-4/5 ones, and it loses them at full
health.

## Candidate-by-candidate ruling

1. **Wounded fighters held at Haven until healed — REFUTED.** Successors
   wake at max health; fatal fights start at 98–107 HP in 21/24 cases; sleep
   heals ~20/night. Only 3 of 24 fatal fights entered below 70 HP. There is
   no wounded-re-engagement problem to fix for the scholar. For NPC
   villagers, the channel is 20/121 deaths (16.5%), mostly unclassifiable
   recent joiners — even a perfect NPC-wound lever could not move the pilot
   judge, which is driven by scholar-death cascades.
2. **Arena-death channel fix — NOT A CHANNEL.** 2 scholar deaths by `the
   arena` while national out of 121. Nothing to fix.
3. **Party formation for wave-4 fights — NOT ACTIONABLE HERE.** The game
   already joins nearby villagers (≤4, within 4 squares); allies were present
   in 7/24 fatal fights and the scholar still died. The scholar is alone
   because the POLICY sends them to forage alone at a tile corner — a policy
   matter, and policies stay byte-identical. A game-side auto-party would be
   a new system, and the persistent-party program (villagers seeking
   complementary roles among people actually perceived) is a separate build.
4. **Flee — OFF-LIMITS.** `tbBarrierExit` never called in 3 probe seeds;
   flee attempted 517 times across the corpus with 373 stuck turns, 235 bad
   flees, 71 blocked. The flee-failure channel is real and large — and it
   belongs to the held flee-repair arm (Steve call, `sim-fleerepair-a`). This
   arm must not rebuild it.
5. **Toughness / gear / damage / ability tuning — FORBIDDEN.** The
   combat-play gate still holds: no toughness/gear/ability tuning until
   villagers play combat properly. The fight-play census (2026-11-11) found
   fighting "not yet smart" (steering inert 97%; abilities/tricks rarely used
   vs unknown monsters). Losing a full-HP solo fight to a single wave-4/5
   monster IS a toughness/play question, and the gate says not yet.
6. **The breach (monsters entering Haven) — DESIGNED CRISIS, Steve's call.**
   6 of 24 fatal fights started inside the hall. Removing the breach would
   delete a crisis Steve created (2026-10-09) and would cover only a quarter
   of fatal fights. Not a worker decision.
7. **"The killer disperses after killing the scholar" (cascade-breaker) —
   REJECTED.** It contradicts the established "no sheepish despawns" stance
   machine ("They don't drift away — they decide you're prey and escalate"),
   the same-instance persistence is inferred not proven (no instance ids in
   the probe), and it would only spread the same deaths over more days — the
   wild is full of wave-4/5 monsters, and the next successor dies to the next
   one. A rule invented against canon on an inference is not a lever.

**Conclusion:** the dominant channel (scholar loses solo wave-4/5 fights at
full health, 88/121 deaths while national, 95/121 scholar deaths) has no
actionable, permitted, non-design-call lever in this arm's scope. DIAG-NO-GO.

## Wall numbers

- Answercourt-confirm corpus (16 seeds, armed leg): national ever 13/16;
  national held-days per seed 90, 0, 28, 71, 7, 72, 30, 57, 0, 0, 68, 77, 43,
  19, 58, 34 — median 38.5; dissolutions 7 (series-counted); re-climbs 2;
  starvation armed 6 vs baseline 3; median survival armed 121.5d.
- Holdbuild pilot (8 seeds): OFF median held-days 43.5, ON 40; dissolutions
  OFF 4 / ON 3; national-ever OFF 7/8 / ON 8/8; median survival OFF 134.5d /
  ON 128.5d; starvation OFF 3 / ON 2; total deaths OFF 608 / ON 790.
- Table / wins in this corpus: 0 / 0. No full seat, no win.
- Wave 4–5 unlocks: wave 5 reached on 100203 and 100212 (repro runs,
  maxWave 5); wave-5 kills during national episodes on OFF 100208 (w5:1),
  ON 100202 (w5:3), ON 100206 (w5:3). Wave 4 is the working tier; wave 5 is
  reached but never held.

## Metric review

Held-days alone conflates hold quality with combat survival — the holdbuild
metric review was right to pair it with dissolutions. Here the pairing shows
the same thing both ways: held-days are lost because the village dies while
national (8 of 12 losses ended while national), and dissolutions follow the
same deaths (each scholar death costs −8 trust on every link). Any future
lever's judge must be scholar-death reduction first (fewer `the wild`
scholar deaths per national day), with held-days and dissolutions as
companions — a lever that does not reduce scholar fight deaths cannot move
either number.

## What the fix actually needs (hand-off, not a build)

The diagnosis points at three doors, none of which this arm may open:

1. **Flee-repair** (held branch `sim-fleerepair-a`, Steve call): the scholar
   tries to flee 517 times in the corpus and gets stuck 373 times. If flee
   worked, losing fights would end in retreat instead of death.
2. **Combat play** (the combat-play gate): the scholar fights with an empty
   bow, never calls the barrier exit, and loses full-HP solo fights to single
   wave-4/5 monsters. Until play improves, toughness tuning is gated — and
   play is the policy's, not a game lever this arm can pull.
3. **Policy: stop sending the successor out alone the same day.** A human
   player who just inherited the Codex after watching the previous bearer die
   would stay home, heal, and bring friends. The competent bot sends the new
   scholar foraging alone at a tile corner the same day. That is a policy
   decision, and policies stay byte-identical in this arm.

Recommendation to the coordinator: hand this decomposition to the
flee-repair arm and to Steve. The winnability chain's next lever is flee or
combat play — not tending, not upkeep, not reclimb, not wounds, not the
arena, not party formation.

## Limitations (documented, not hidden)

- HP / gear / party at death are NOT in the committed corpus — no per-death
  HP, gear, or party fields exist in the driver. Victim classification uses
  snapshot kills / expedition count / abilities / occupation / profile only.
  The probe (3 seeds, OFF behavior) supplies the HP/party-at-death evidence
  instead, and it is diagnostic, not judged data.
- 25 of 121 while-national victims are "unknown" (recent joiners, no snapshot
  yet).
- The probe diverges from the corpus ON trajectories (no driver wraps, flags
  OFF): same mechanism, different days and species. Probe numbers are never
  mixed with corpus numbers in the tables above.
- The same-monster cascade (Network_Note killing 4 scholars d130–132) is
  inferred from species + tile + day, not proven by instance id.
- The dawn scorer "wounds/wear first" caveat has no located code gate; it is
  recorded as unverified.

## Files

- `scripts/analyze-fighterhold-diag-b.js` — corpus decomposition analyzer
  (reads the 16 committed holdbuild pilot files).
- `evidence/2026-11-14/fighterhold-b-diag.json` — full decomposition (pooled
  tallies, per-seed tables, all 121 while-national deaths with victim
  buckets).
- `scripts/probe-fighterhold-b.js` — mechanism probe (diagnostic only).
- `evidence/2026-11-14/fighterhold-b-probe-100201.json`,
  `fighterhold-b-probe-100208.json`, `fighterhold-b-probe-100203.json` —
  probe outputs.
- This file: `evidence/2026-11-14/sim-fighterhold-b.md`.

No `src/js` file was changed. No prereg, no proof test, no pilot, no confirm —
none of those exist for a DIAG-NO-GO, and inventing them would be fabricating
a build that was never made. Branch contains measurement + instruments +
evidence only.
