# sim-belltoad-a — DIAG: why two healthy villagers dealt 0 damage to the same 40%-HP belltoad

Run: fleshout-20261025T1226Z, arm sim-belltoad-a. DIAG ONLY — zero src/js
changes. Worktree: ~/workspace/worktrees/sim-belltoad-a (coordinator merges).

## Pre-registration (the question, not a lever)

Primary question: why did seed 73677's d67 nora_wilson (3 rounds, entry
1.00, 0 dealt / 105 taken) and d68 gen_ed0l37r (2 rounds, entry 0.73,
0 dealt / 76 taken) both die dealing 0 damage to the same 40%-HP belltoad
on consecutive days, when the toad's HP stayed at 40% across both days?
Corpus of record: evidence/2026-10-25/perseed-deathcensus-a (armed rows;
the w123death arm's own perseed dir holds only its 73671-armed row, so the
deathcensus corpus is the record with fight rows — same substrate, same
seeds, same recorder).
Method: corpus confirmation first, then a deterministic replay with an
RNG-neutral rec.log tap (scripts/test-belltoad-trace.js --replay).

## Verdict: MECHANISM CONFIRMED

The villagers did not miss, were not unarmed, and were not immune-blocked.
They never struck at all: once the village knew the belltoad counter, the
field-fight AI spent every villager action SHOUTING (the known counter)
instead of striking, the shout's payoff against a 4-member pack is one
halved hit out of four, and the trick-aware morale rule then held the
shouter in the fight while the pack ground them down. Pre-learning, the
same villager struck and fled alive twice; post-learning, three fighters
dealt 0 combined and two died. Knowing the counter made the fight lethal.

## The mechanism, step by step (all code in src/js/fieldFights.js unless noted)

### 1. The village learned the counter between d65 and d66 — pinned exactly

The non-lethal learning channel (game.js: noteVillagerTrickObservation /
_trickObservation): a villager who survives an encounter with a
trick-bearing beast (vFlee/mFlee/evade) brings home one observation; two
observations and the village pieces together the counter
(discoverMonsterCounter). The field-fight end code calls it for every
vFlee/mFlee/evade outcome, any context.

Replay entry-state capture (pre/post observation count on the shared
villageCounterObs bar, trick knowledge at fight entry):

| Fight | Knew trick at entry | Obs before → after | What happened |
|---|---|---|---|
| d10 james (raid) | no | 0 → 1 | struck 10+9=19, fled alive |
| d65 james (field) | no, intent learn | 1 → 2 | struck 27 once, bound a wound, fled alive — COUNTER LEARNED at fight end |
| d66 james (field) | YES, intent engage | 2 → 2 | shouted once, fled at 15 HP |
| d67 nora (field) | YES, intent engage | 2 → 2 | shouted twice, died |
| d68 gen (field) | YES, intent engage | 2 → 2 | shouted twice, died |

The intent flip (learn at d65 → engage at d66) is itself the proof: intent
is computed at fight entry from villageKnowsTrick (fieldFights.js:
fieldFight entry), so the counter became known in the window between the
two fights, and the only learning event in that window is d65's own flee
(obs 1 → 2). No kill, no scholar fight, no conversation is needed to
explain it — the two survived james encounters (d10 raid flee, d65 field
flee) are exactly the two observations.

### 2. Knowing the trick replaces strikes with shouts (the 0)

villagerTrickAction (fieldFights.js), waves 1–2 counter field: for a
shout-kind counter, if fewer than 2 shouts used this fight AND the
villager is hurt below 75% of max HP, return the shout action. The fight
loop's trick branch then spends the action on the shout — "the trick
spends the action: no strike that round" (parity with the player). Cap 2
per fight.

Both death fights show trickLog = ["shout", "shout"], trickShouts = 2,
mDealt = 0, volley = null (no ranged opening — neither villager volleyed).
Nora's R1 required the monster to act first: she entered at 100 HP, so a
villager-first R1 would have struck (shout gate needs <75%). The replay
log shows the monster phase first in R1 (four hits, 100 → 65), then her
shout. Her villager speed is 2 (villagerSpeed), the toad's is 2, so
monster-first R1 is a coin flip she lost. Gen entered at 73% — already
below the gate — so he shouted on R1 regardless of initiative.

### 3. The shout's payoff vs a pack is ~one halved hit out of four (the trap)

The monster phase runs EVERY live pack member (fieldFights.js: "every live
pack member acts — pack hunters hunt as a pack"). Belltoad pack = 4
(monsters.json: "pack": 4; replay packCount = 4 in every fight). The
shout sets rec.trickDisrupt = 1, and the monster phase halves the FIRST
member's attack it meets, then clears the flag — the other three members
hit full. Replay, nora R2:

> "Nora's bellow broke the chorus — Choir Toad's note dies mid-croak. 14 → 7."

— then three more full hits land in the same phase (9, 8, 7 after armor).
Per-round taken, after per-hit armor absorption: nora 35 / 29 / 41 = 105;
gen 48 / 28 = 76; james d66 30 in one round. That magnitude is four toads
at 8–18 raw each, not one toad hitting for 35 — the single-attack data
(croak 12–18, lunge 8–12, monsters.json) never explains 30–38/round alone.
The counter text promises the chorus breaks ("SHOUT and the note dies
mid-croak", "scatter the choir"); the field port breaks one throat.

### 4. Trick-aware morale holds the shouter in (the kill)

fieldFights.js round-end morale (COUNTERWIRE 2026-10-16): if the trajectory
is hopeless AND the villager performed a known trick (rec.trickLog
non-empty) AND HP is above 25% of max, hopeless is suppressed:

> "Nora holds the line — working the trick, not the damage race."

With mDealt = 0, the damage race is unwinnable by construction (rounds to
drop the lead = 18 / max(1, 0) — infinite), so without the suppression
she would have fled as hopeless at the end of R2 (36 HP, 0 dealt, lead
untouched). Instead she held, and death arrived mid-monster-phase in R3
(36 → 25 → 15 → 4 → 0), jumping straight past the HP-floor flee line —
the round-end flee check never ran, because she never got a R3 action.
Gen died the same way in his R2 monster phase (the 4th pack member never
acted: the loop stops once HP hits 0). James d66 survived only because
his single round ended at 15 HP — below the floor, alive — so he fled at
round end instead of dying mid-phase.

### 5. Why the toad stayed at 40% across days (the persistence)

Wounds persist onto the world entity (fieldFights.js end: m.hp = mHpLeft
when the outcome is not vKill). Nobody who knew the trick ever struck it,
so 18/45 HP carried d65 → d66 → d67 → d68 unchanged. The field chain
45 → 18 → 18 → 18 → 18 is one persistent wounded toad; the later 7-HP
rows (d68 raid, d74, d77) are a separate entity, and the r=0 mFlee rows
are pre-wounded leads below the pack break line (7/45, 1/45 < 0.25)
scattering on sight, not fights.

## Discriminating evidence (what rules the alternatives out)

- NOT misses / NOT a damage floor / NOT immunity: the replay rec.log
  contains zero strike lines in either death fight — no "strikes for 0",
  no mirage-miss note. Strikes always deal ≥4+wb when taken (d65's single
  strike dealt 27 with no modifier note, i.e. wb in [19,23] by inverting
  roll([4+wb, 8+wb]) — james was heavily armed). The 0 comes from actions
  not taken, not from damage reduced to 0.
- NOT weaponless / unskilled: the same villagers' state is irrelevant to
  the gate — the shout fires on knowledge + hurt, not on gear. James
  dealt 27 the fight before learning the trick, with the same kit.
- NOT a belltoad-only defense: belltoad has no armor, evasion, immunity,
  or special defense in monsters.json (HP 45–60, fleeAt 0.3, pack 4,
  counter shout). The 0 is produced by the generic trick AI, not by the
  toad's stats.
- NOT "knowledge always zeroes damage": engage-intent belltoad fights
  that dealt damage exist (s73676 d15: dealt 39, entry 1.00; s73678 d99:
  dealt 23, entry 0.91). A villager acting first at high HP strikes before
  dropping below the 75% shout gate. Knowledge + hurt + initiative is
  the conjunction; knowledge alone is not sufficient.
- Corpus-wide 0-damage check (8 seeds, 863 field fights): 0-dealt
  multi-round (≥2 rounds) rows = 14 across 8 monsters — belltoad's 2 are
  the ONLY deaths. The other 12 all survived (vFlee/mFlee), because their
  tricks TERMINATE the fight (focus_group bore-out after 3 boring rounds,
  redactor starve-out after 3 quiet rounds, terms_of_service dismissal
  after 2 reads) or negate damage (buffering stand-still whiff). The
  belltoad shout does neither: it neither ends the fight nor stops the
  pack, and trick-aware morale then forbids the flee the other tricks
  don't need. Belltoad is special in outcome, not in mechanism — it is
  the one known-trick fight where the trick is a non-terminating
  defensive disruption against a pack.
- Belltoad intent vs dealt, corpus-wide: learn-intent 3 fights (0-dealt 1
  — the r=0 break-line scatter, no fight); engage-intent 11 (0-dealt 9).
  The two engage-intent fights with damage are the gate controls above.

## Deterministic replay (not faked)

scripts/test-belltoad-trace.js --replay re-runs seed 73677
(tableseat-nowait + deathcensus-diag, same substrate as the corpus) with
an outer wrapper on Game.fieldFight that only reads state and never draws
RNG. Census-match: days 98 = 98, gameDays 98 = 98, deaths identical,
resolveFights and directFights fight keys identical (day, vid, mid,
outcome, rounds, mHpStart, mHpLeft). All fight logs quoted here are that
replay's captured rec.log, on the census trajectory. (Footnote: the
replay's display name for vid gen_ed0l37r is "Imke" — generated villagers'
firstRef names differ from their ids.)

## SENSE-TESTING LAW: does the narration read sensibly?

No — it reads as a bug. Nora's fight, verbatim in order:

> "R1: Lunge hits Nora for 8 (92 left)" … "R1: Nora cups their hands and
> BELLOWS — raw noise, no words. (Break the chorus — 1/2)"
> "R2: Nora cups their hands and BELLOWS — raw noise, no words. (Break the
> chorus — 2/2)"
> "Nora's bellow broke the chorus — Choir Toad's note dies mid-croak. 14 → 7."
> "R2: Resonant Croak hits Nora for 9 (51 left)" … "R2: Lunge hits Nora for
> 7 (36 left)"
> "Nora holds the line — working the trick, not the damage race."
> "R3: Resonant Croak hits Nora for 11 (25 left)" … "R3: Lunge hits Nora
> for 9 (0 left)"

A villager who knows the counter bellows twice, watches one note die
while three more throats keep croaking, is told she is "working the
trick, not the damage race" at 36 HP while dealing nothing, and dies
without ever striking. The fiction the counter text sells — break the
chorus, scatter the choir — is not what the log shows: one halved hit,
then the full chorus anyway. A sensible version of this fight is either
a chorus that actually breaks (the pack's next phase disrupted, not one
member's swing), or a fighter who, after two shouts move nothing,
strikes or runs. The current log is a fighter executing a trick that
cannot win, held in place by the rule that was supposed to protect
trick-fighters.

James d65, by contrast, reads as a real fight: one huge strike (27),
a bound wound (+20 HP, field medicine), a live flee. The engine can
narrate this fight honestly — the belltoad pair is where the narration
and the mechanics part ways.

## Side findings (documented, not chased — DIAG arm)

- Silent flee: the HP-floor flee branch logs nothing (james d66 fled at
  15 HP with no flee line after his shout). Minor narration gap.
- "Drove off with the bow" without a bow shot: pre-wounded leads below
  the break line scatter on sight, but the log line is the volley
  branch's ("Emma drove Choir Toad off with the bow"), even for
  arrowless villagers (naran d74, nino d77: "has Bow but no arrows" then
  the same drive-off line). The outcome is honest; the sentence is not.
- Canon gap (per CANON.md instruction, not invention): docs/MONSTER-WAVES.md
  contains no belltoad entry — the toad's data lives in src/data/monsters.json
  (HP, attacks, pack, counter) and src/data/monsterBehaviors.json (fleeAt
  0.3, no pre-turn hooks). Nothing in this trace needed invented canon.

## Proposed fix arm (REPORTED, not fixed — coordinator records the finding)

The fix belongs to a follow-up arm, not this DIAG. Candidates, in the
order the evidence ranks them:

1. Pack-wide chorus break (fieldFights.js trickDisrupt): the shout
   disrupts the chorus, not one member — halve (or skip) every pack
   member's next attack, matching the counter text ("the note dies
   mid-croak", "scatter the choir"). This is the parity gap: the
   player-facing trick is pack-wide in fiction, single-swing in the port.
2. Trick-aware morale must not hold a non-progressing trick: when the
   trick deals no damage AND does not end the fight, the hopeless
   evaluation should count trick rounds as non-progress (or the shout
   should stop being offered after 2 shouts with no damage progress,
   falling back to strike-or-flee). As written, the morale rule converts
   a useless trick into a death sentence.
3. Fallback after the shout cap: after 2 shouts, the villager's next
   action should be a strike (or a flee check that can actually fire),
   not an indefinite hold — currently the cap only stops further shouts;
   it does not rescue the fighter, because morale already holds them.

Any of the three changes the pair's outcome class; (1) alone makes the
shout worth its action against a pack, (2)/(3) alone let the fighter
escape the trap. A fix arm should re-run seeds 73671–73678 and show the
belltoad engage-intent death class going to zero without moving the
other 0-dealt multi-round rows' survival.

## Wall numbers

N/A — this trace touches no scale band (no lever, no sim band change,
no national/table/win measurement). The pair's seeds (73677) are the
tableseat-nowait band already reported by sim-w123death-a; nothing here
re-scores them.

## Metric review

Pre-registered question (above) judged on its own terms: the mechanism
is confirmed, not re-scored. The corpus check's first chain assertion
initially failed on the 7-HP rows and was corrected to per-entity runs —
the 18-HP chain (d65→d68) holds; the 7-HP rows are a second entity, not
a broken chain. No metric was swapped mid-run; the replay's census-match
is the guard that the narration belongs to the corpus rows.

## Files

- Evidence: this file (evidence/2026-10-25/sim-belltoad-a.md)
- Script: scripts/test-belltoad-trace.js (corpus mode default; --replay
  for the deterministic rec.log tap). No corpus file is written by either
  mode. Zero src/js files in the commit.
