# Win-drive framework (Track 3, winnability push) — 2026-11-03

Plain words: a world system only counts as lived-in when a villager
wants something from it, learns about it through their own senses or
a message that actually reached them, and then goes and does the
thing. A drive is that want, written down in the shape below, wired
into the decision code villagers already use. It is NOT a new brain
for villagers, and it is NOT a planner that sits above them.

## 1. The drive shape (every drive, including Track 2's, must fit this)

```
drive = {
  reason:      a villager reason from existing code — npcNeeds
               (hunger / fear / social / energy) or npcGoal
               (ambition, loyalty, curiosity, love: 'protect',
               'prove', 'lead', 'family', 'belong', 'remember',
               'joy', 'record', 'understand', 'answers', 'feed',
               'survive', 'peace', 'home', 'legacy', 'alone',
               'explore', 'heal', 'escape');
  perception:  what the villager must ALREADY have, from a traced
               record — never a list, never a snapshot:
               - village gossip they heard (seedGossip entries,
                 e.g. action 'raid' within the 3-day window
                 objDanger already uses),
               - map memory (villager-mapmem: a corpse site, a
                 fight tile they personally fought on),
               - village lore (state.village.villageLore[knowerId]:
                 'visit' / 'seen-nearby' / 'rumor' delivered-and-
                 read / 'told' / 'link'),
               - their own pack/kit (what they personally own),
               - a fight they survived (agency know.fought);
  action:      an EXISTING objective kind or verb — FORAGE, WATER,
               TRAPS, VISIT, HAVEN_CHORE, EXPLORE, REST, EAT, LEAVE,
               HUNT, HAUL, SEEK, GUARD (companion) — or an existing
               verb (teach, trade, muster). A drive that needs a
               brand-new verb or a brand-new system is not a drive,
               it is a feature request: bring it back as one;
  persists:    how the drive stays a pursuit, not a one-day dice
               roll: the objective's own state (target, clock,
               tightness) or a stage record owned by the villager
               (e.g. win-plan stage state) PLUS the memory it writes
               on completion, which is the next drive's perception
               precondition;
  proof:       participation counts on IDENTICAL seeds before/
               after — villagers DOING the thing (departures,
               returns, uses, teaches), not capability flags
               (held, equipped, unlocked).
}
```

Conformance rule for Track 2 (win-intel): winning strategies
(gear, party, veterans, standing, table prep) land AS drives in
this shape, on the existing machinery named in §2. No parallel
decision system. Two hard limits Track 2 must also respect:

- Seat-taker choice is the PLAYER's only (Steve 2026-10-26). No
  drive may send an NPC to the seat, or choose the path for the
  village.
- Gating freeze stands: no drive changes a win price, deed gate,
  standing threshold, or readiness number. A drive that only pays
  off if a gate moves comes back as a Steve decision with
  evidence, not a gate edit.

UNIFICATION NOTE (Track 2, win-plan.js — read 2026-11-03 while its
tests were running; NOT landed to master at the time of writing,
so nothing here demands a rewrite): Track 2's win-plan already
fits this shape, independently derived. Its stages (gear ->
party -> hunt -> standing -> table) are drives in this sense:
reason = the stage's own want ("I am not armed", "not going
alone"); perception = only the owner's own events (their gear
after gear-up, a trusted villager they can SEE at Haven, a beast
THEY fought or fled, a kill THEY banked, a System hold/release
beat broadcast while they are at Haven); action = existing paths
(expedition targets, villagerFightAllies / fieldFight opts — it
explicitly builds no second join trigger, respecting arm 1);
proof = identical-seed fixtures. Two distinctions recorded so
the tracks do not collide: (1) win-plan's 'guard' is VETERAN
guarding (protect a banked veteran for 7 days), while Track 3's
Drive 1 'rally-guard' is RAID-ANSWER company — same word,
different drives, different triggers; (2) win-plan's table stage
("veterans stay alive and ready") does not choose the seat or
the path, so it respects the player-only limit above. One
framework amendment from win-plan: a drive's pursuit record may
live as stage state on the villager/village (v.winPlan) as well
as an objective — what matters is that the record is the
villager's own, and that each stage's action is the next
stage's perception precondition. Composition by order, not by
planner, is the shared rule: win-plan states it the same way
(§3).

## 2. Where drives live (existing code, extended — nothing parallel)

- `objPick` (villager-objectives.js): the priority ladder (body
  first: rest, eat) plus the weighted lottery over objective
  kinds. A drive is a new lottery candidate with a perception
  gate, or a new priority rung above the lottery — exactly how
  HAUL (fresh-kill memory), HUNT (fight memory), and SEEK
  (build knowledge) already work.
- `objMaybeDepart` / `objDanger` / `objAskCompanion`: the departure
  verdicts (go / ask / tighten / defer). A drive can add company
  (GUARD purpose, targetVid = principal) or a destination; it
  must reuse the heal gate and the 'alone' / sick / HUNT
  exclusions already there.
- `objReturnEffect`: what coming home DOES (pantry stocking, the
  visit/guard bond, the teachable lesson, the HAUL deposit). A
  drive's completion writes the next perception record here:
  a return seeds gossip witnesses, a fight writes fight memory,
  a lesson writes teachable knowledge.
- `npcTrigger` (npc-triggers.js): the event registry (death,
  deed, departure, return, table_sits, expedition_launch, gossip).
  Drives react to events through it; they do not add control flow
  of their own.
- `villagerSeekKnowledge` / `npcLearnAbility` (villager-build.js):
  the learn drive, already reason-shaped (a level-up waiting on
  knowledge, or a thin build).
- `villageLore` (hierarchy.js knower ledger): the ONLY store a
  drive may read for "does this villager know that village".
  Strength ranks visit/link (3) > seen-nearby (2) > rumor/told
  (1). A rumor queued but never read opens NOTHING.

## 3. Composition without a central planner (Oct 28 diagnosis, answered)

The Oct 28 record says the intelligence has breadth but shallow
depth — scored per-situation choices, no central planner — and
gaps keep getting fixed one missing rule at a time. The framework
answer is CHAINING, not planning: drives compose because each
one's completion writes the perception record the next one reads.

```
fight survived  -> fight memory   -> HUNT (go back, armed)
return home     -> gossip witness -> danger verdicts, guard answers
lesson taught   -> teachable know -> SEEK (learn the next leg)
lore gained     -> village known  -> rivalry answer, visit, trade
loot used       -> effect known   -> teach it, seek its pair
```

A sustained pursuit is therefore a chain of drives, each step
re-decided by the existing ladder/lottery, not a plan held
anywhere central. No central planner is built. The evidence bar
for ever building one: a panel showing a chain that stalls
between two drives DESPITE both drives firing — i.e. the handoff
record exists but no drive picks it up. Until such a panel
exists, "needs a planner" is a held claim, not a build.

## 4. Polity drives (other villages as protagonists, not pressure laws)

A foreign village's drive has the same shape, with the village
itself as the knower (`village:<id>` in the lore ledger):

- reason: the village's own state — its commons strain on shared
  ground, its trust toward Haven, its mood from a meeting.
  NEVER Haven's surplus alone: surplus-draws-pressure is a law
  about Haven, not a choice by the other village.
- perception: its lore about Haven (visit / seen-nearby / rumor
  delivered-and-read / link). A village that never learned Haven
  exists cannot choose Haven as a target.
- action: one of the staged options that already exist — talk
  (speaker summons), beg, raid, trade, parley — chosen by the
  village, recorded as a traced lore/gossip entry.
- proof: the village's choices counted across panels (summons
  answered, begs, raids, parleys) by lore rank — showing choices
  track what the village itself knows, not just Haven's pantry.

Today's raid gate (game.js commonsTick: tension 70+, trust <15,
8%/day) reads only numbers plus dice. That is the pressure law
this framework replaces with choices, one staged option at a
time. The first polity drive is HELD (see §6): its design is
fixed here, its build waits on a panel of raid choices by lore
rank, because changing raid frequency blind is a balance change
disguised as a drive.

## 5. Audit ranking, deadest-first (existing evidence only, no new batches)

Sources: Nov 1 loot+abilities audit
(evidence/2026-11-01/loot-abilities-efficacy-audit-20261101.md);
w5faced competent diagnostic
(evidence/2026-11-03/sim-w5faced-competent-a.md); gap-audit11
branch (legs 1, 2, 7); win-allyjoin branch; Nov 2 ship notes.

1. INTER-VILLAGE RIVALRY / THREAT — deadest. Other villages
   almost never become threats: they act through pressure laws
   (commons strain -> tension -> raid dice; surplus-draws-
   pressure), never through a choice of their own. Road-leg
   village encounters are staged for the PLAYER's party only
   (nomad-wild villageEncounter: hostile -> fight/leave only).
   No villager-side rivalry drive exists. -> Drive 1 (answer
   side, built) + Drive 2 (polity choice side, held by design).
2. VILLAGER SYNERGY PARTICIPATION — structurally absent, not
   just thin. checkSynergyDiscovery / recomputeActiveSynergies
   read state.scholar ONLY; villagers have no synergy discovery
   path. Only 3/57 synergies co-fired in panels, all scholar-
   side. No villager drive can assemble what only the scholar
   can discover. -> HELD: extending discovery to villagers is
   a machinery change, not a drive; it needs its own decision.
   blood_tracker is mechanically dead in any case (activates,
   no modifiers, no code reads) — retire-or-effect, not a drive.
3. WILD ALLY-JOIN — dead in the wild census (allies never join
   fights in the wild; field fights field at most leader + 1
   ally, and the ally deals 0-16 damage). -> COVERED BY ARM 1
   (win-allyjoin branch, live sensing helper). Recorded here,
   NOT rebuilt. Track 3 drives may USE joins/parties but must
   not rebuild the trigger or the party-formation decision
   (Track 2 owns the decision).
4. VILLAGER LOOT-TOOL USE — no path, unmeasured. Tools are not
   worn, so equip telemetry never sees them (gravity_hook:
   granted 6 runs, worn 0 — "never worn" is not proven unused,
   but no villager tool-use path exists either). Scholar-side
   loot use is thin too (pack reveal in only 3/8 runs; 67/108
   items never granted; tier 4 = 5% of grants). -> HELD
   pending a tool-path read; weapon equip is already being
   fixed by gap-audit11 leg 7 (trailblazer machete earns its
   weapon profile — adopt, do not duplicate).
5. ABILITY PRESSING — scholar-side gap, not a villager-drive
   gap. 55/57 activatables never called by the competent policy;
   but villager field abilities DO fire when staged (57/59 in
   fixtures). -> COVERED BY gap-audit11 leg 1 (competent policy
   presses combat buttons) and leg 2 (synergy trigger-side
   resonance). Not Track 3 work.
6. WAVE-5 FACING FUNNEL — not a participation drive target.
   w5faced: 1/20 competent villages unlock wave 5; 4/20 pin at
   standing 199 with zero readiness-5-ready days; the one
   unlocked seed faced 2 kinds and killed 0. The binding stage
   is the readiness-5 release, which is Track 2 / win-national
   territory under the gating freeze. -> Recorded as context;
   no drive here touches readiness numbers.
ALIVE, do not rebuild: monster-meat-to-dinner (r89 panel 4/4,
   HAUL drive compliant); joint outings (social panels: outings
   start and deliver); teaching both ways (lesson flag fixed);
   armor lessons (taught on camera); HUNT return-to-fight;
   HAUL fresh-kill. These are the pattern Drive 1 follows.

## 6. Drives in this track

### Drive 1 — RALLY-GUARD: answer a raid with company (BUILT, §7)

- reason: npcGoal 'protect' / 'prove' / 'lead' (loyalty, ambition).
- perception: village gossip with action 'raid' within 3 days
  (both raid channels seed it: commonsRaid in game.js, and the
  Haven raid defense in havenGrowth.js). The villager's village
  heard about a raid — that is the whole precondition.
- action: on a 'go'-verdict departure (where the danger check
  alone would send someone out solo), a protect/prove/lead
  villager at haven volunteers as GUARD via the existing
  objAskCompanion path, with the existing heal gates. The
  'ask'-verdict path is untouched — this drive only adds
  company where none was asked for.
- persists: the GUARD objective is a real trip (same target,
  same clock, targetVid = principal); its return runs the
  visit/guard bond. The next raid's gossip re-arms it.
- proof: fixture (raid gossip -> guarded departure; no gossip
  -> solo; wrong goal -> no volunteer) + identical-seed panel
  counts of guard departures in the 3 days after raid gossip,
  before/after. See the drive's evidence note on landing.

### Drive 2 — POLITY RAID CHOICE: a village raids because it knows (HELD)

- reason: the acting village's commons strain + trust toward
  Haven (its own state, not Haven's surplus).
- perception: its lore about Haven at rank >= 2 (seen-nearby or
  better — raiders must know where the pantry is). A village
  with no lore about Haven cannot choose it as a target.
- action: the staged choice among talk / beg / raid at the
  tension gate, recorded as a traced entry (lore + gossip with
  the village id), replacing the tension/trust/dice-only gate.
- proof required before building: a panel of raid/beg/parley
  choices by the acting village's lore rank, showing choices
  today do NOT track what the village knows. Until that panel
  exists, Drive 2 stays a design: building it blind would be a
  raid-frequency change wearing a drive's clothes.

## 7. Standing rule (from now on)

NO new world system ships without its drive, in the shape of §1,
proven by participation counts. Applied to this track's own work
(Drive 1 ships with fixture + panel proof or not at all).
Recent ships checked against the rule: monster-meat channel
COMPLIANT (HAUL drive: fresh-kill memory -> trip -> deposit);
HUNT return-to-fight COMPLIANT (fight memory -> trip); armor
craft COMPLIANT (wearing -> teach pattern). The standing
violation to fix, not to repeat: blood_tracker shipped as a
synergy with no effect for any drive to use — no drive can make
an inert synergy participate.

## 8. What this note does not claim

- It does not claim villagers use abilities, loot, or synergies
  more after Drive 1: Drive 1 moves ONE thing (guard company
  after raids). The other dead systems stay dead until their
  drives land, and §5 says so in the open.
- It does not claim composition is proven: chaining is the
  mechanism (§3), and its proof is drives landing one by one
  with handoff records between them. The planner question stays
  open under the evidence bar in §3.
