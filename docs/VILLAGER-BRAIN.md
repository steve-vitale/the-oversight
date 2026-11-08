# The Villager Brain — one brain, one scorer (design contract)

*2026-11-06. Status: design contract for review. Phase 1 coherence landed
2026-11-08 in `src/js/villager-brain.js` (one dawn scoring entry + pick log;
win-plan / EXPEDITION feed that pass; agency chance-roll demoted). The
product-of-curves formula in §4, the ×1.15 commitment multiplier, and the
top-3 weighted pick remain **for Steve review** and are not shipped — phase 1
keeps the existing additive weights and weighted lottery underneath the one
entry. Drive re-home, curve tuning, and later phases are still unbuilt.
Each phase lands as its own reviewed branch with proof and gate.*

Steve's order (2026-11-06): "Make sure all our intelligence systems are
coherent and in one spot. These aren't separate systems but building one
villager brain that prioritizes based on who that person is and the people
and things around them they interact with." Followed the same day by:
"Address all villager intelligence gaps."

Sources this contract is built from:

- The code audit:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/audit-villager-brain-20261106.md`
  (master `5ba7f167f`). Every file and function named below is the audit's.
- The open-source research:
  `~/workspace/research_notes/open-source-villager-brain-ai-20261106-1918/report.md`.
  Its honest headline: no open-source game ships a fully unified per-villager
  brain. The pattern that comes closest, and that production utility AI
  converges on, is the one this contract adopts.

## 1. What this is, in plain words

Today a villager's day is decided by several separate systems that never
compare notes: a goals layer that nudges, an objectives lottery that picks
the errand, an expedition dice roll, a win-plan layer that re-decides
strategy later in the day, a conversation layer with its own wants, and a
duty roster that mostly waits for the player. Each reads personality,
trust, danger and experience in its own way — or not at all.

This contract replaces that with one brain per villager:

- **One belief state** — everything the villager knows, and only what they
  have actually perceived.
- **One candidate list** — everything they could do at a decision point,
  in one list.
- **One scoring pass** — every candidate scored the same way, from the
  same inputs, in comparable numbers.
- **One arbiter** — one place that picks, remembers the pick, and only
  reconsiders when the villager perceives a reason to.

The existing systems are not deleted. They are demoted: goals, objectives,
agency, win-plan, conversation wants and duties stop *deciding* and start
*feeding* — they contribute candidates, considerations and perceived facts
to the one scorer. That is the whole move. The audit's closing seam says it
plainly: `villager-goals.js` is explicitly "NOT a new brain and NOT a
planner above objPick" (its header, `villager-goals.js:36-46`) because
there was no brain to plug into. This document introduces the missing
arbitration point.

Design shape, from the research: **IAUS-style utility scoring** (Dave
Mark's Infinite Axis Utility System, as shipped in Guild Wars 2) as the
scoring core, **Sims-style target advertising** so a person or place can
raise a candidate's score, and a **Naev-style commitment layer** (one
persistent per-agent memory, reconsideration only at the control point)
as the arbiter discipline. If curve-tuning proves too opaque in the
phase-1 panel, the fallback is the Wesnoth RCA shape — the same belief
state, candidate list and arbiter with a fixed priority ladder instead of
curves — provided the shared inputs stay mandatory (see §4). The belief
state, trust map and perception work are identical under either scorer,
so the fallback costs only the scoring function.

## 2. One belief state per villager

Each villager carries one belief state, assembled from the per-person
stores that already exist. It is not a new database; it is a contract
about what may be read when deciding, and who may write it.

**Who they are.** The person record, read through the single accessors:
`npcTemper(rid)` (`game.js:18544`), `npcGoal(vid)` (`game.js:17450`),
`npcIntel(rid)` (`game.js:18569`). There is exactly one temperament read
(§4 makes it mandatory). Conversation's drifted second temperament
(`convoDriftedTemper`, `conversation.js:50`) stops being a second truth:
lived-event drift is recorded as memory in the belief state, and the one
read applies it — two systems must never again legitimately disagree
about who a villager is today.

**Body and needs.** `npcNeeds(rid)` (`game.js:17124-17130`) — hunger,
fear, social, energy — is already the one genuinely shared substrate.
The contract adds one threshold vocabulary (named bands every reader
uses) in place of today's per-module cut-offs, where the same hunger is
">50" in one room, ">55" in another, ">60" and ">70" in two more
(audit §5).

**The perceived world — and only the perceived world.**

- *People:* who this villager has seen, heard, or been told about by a
  named source — with the unified per-villager trust map (§7, phase 2)
  and pair bond warmth (betrayal.js pair records) attached per person.
- *Places:* their own map memory (`villager-mapmem.js`;
  `mapmemNoticeNode` `:194-204` writes what they notice moving;
  `mapmemTell` `:249-280` already fuzzes secondhand memories — the model
  for all told knowledge).
- *Monsters:* species they have fought (`agencyState().know[vid]`,
  `villager-agency.js:120-124`), their own sightings
  (`objNoteMonsterSighting` store, `villager-objectives.js:666-690`),
  and heard sightings — a rumor recorded with its teller named, its age,
  and its distance, never merged into fight memory.
- *Village state, as believed:* pantry days and danger **as last seen or
  heard**, with staleness. This replaces the global reads
  (`pantryDaysEstimate()`, `villager-goals.js:249-257`; the cistern
  headcount math, `villager-objectives.js:377-387`) with a belief that
  can be old or wrong — a villager away for a week acts on week-old
  pantry knowledge until they return or hear news. Danger in the belief
  state is the heard-filtered kind the goals layer already pioneered
  (`dangerHeard`, `villager-goals.js:236-247`): gossip counts only if
  this villager is in its `heard` list.
- *Lore:* villages they know of through the traced channels
  (`villageLoreOf`; `knowsVillage`, `hierarchy.js:118`, `:443+`).

**Memory.** Lived events with a day and a source — taught by, saved by,
fought beside, insulted by, shared a meal with — plus grievances
(`grievanceBetween`, betrayal.js, already a memory form). Opinions and
trust are *derived from* these perceived events, never edited directly
by a "relationship system".

**Commitment.** `{candidate, target, sinceDay, scoreAtChoice}` — what
the arbiter last chose for this villager and why. This generalizes the
goals layer's stored top goal and commitment bonus (`stateFor`,
`villager-goals.js:327-333`; `applyCommitment`, `:338-351`) from one
goal to the whole decision.

**The writer rule.** Belief fields are written only by perception and
lived-event code: sightings, conversations, fights, lessons, being told
by a named source. No system writes a belief it didn't earn, and no
village-global value (true pantry kcal, the full gossip store, a roster)
is ever copied into a belief except through a perception event. This is
the perception law, made structural: the strongest existing examples are
the goals gates (`gateFor`, `villager-goals.js:277-293`), the bond
perceived gate (`bondProposalPerceived`, `bond-initiation.js:204-231` —
"Never a roster scan, never a list feed"), and HUNT's own-memory rule
(`objHuntCandidate`, `villager-objectives.js:733-765`). The brain makes
that discipline the architecture instead of a per-module virtue.

## 3. One candidate list per decision point

At each decision point — the dawn decision first — the villager's brain
builds one list of candidates. A candidate is data:
`{kind, target?, considerations[]}`.

The list starts from what exists: the objective kinds (LEAVE, REST, EAT,
HAUL, SEEK, FORAGE, WATER, TRAPS, VISIT, EXPLORE, HUNT, GUARD,
HAVEN_CHORE) plus EXPEDITION (today a rival departure brain, §6 seam 2),
the win-plan stages (gear-up hold, party launch, veteran guard, bond
tending — today re-decided at the agency tick by `win-plan.js`), and the
drive candidates (§7 phase 1). Later phases add conversation wants, bond
proposals, and duties to the same list.

Two structural rules:

- **A candidate that cannot name its target from the belief state does
  not exist.** Perception gating is not a check inside the candidate; it
  is what puts the candidate on the list. A HUNT candidate exists only
  for a beast this villager remembers or was told about by a named
  source; a VISIT candidate only for a person they know.
- **Targets advertise** (the Sims pattern): a specific person, place or
  duty can raise a candidate's score — a visit target's warmth toward
  the villager, a remembered haul site's yield, a duty the village
  visibly needs. A new kind of thing to want is added by publishing an
  advertisement, not by editing the brain.

## 4. One scoring pass (IAUS)

Every candidate on the list is scored in one pass, the IAUS way:

```
score(candidate) = baseWeight × Π curve_i(raw_i(belief))
```

- Each consideration reads the belief state and returns a raw input,
  normalized to **[0,1]** by bookends (distance, days-stale, need level),
  then shaped by a response curve. All scores are therefore in one
  comparable currency — the FreeCiv failure (two modules minting
  incommensurable "want" numbers) cannot recur, because no module emits
  a raw score across a boundary.
- **Any consideration returning 0 disqualifies the candidate**, with
  early-out. Cheap, binary gates are ordered first (present and able?
  target in the belief state? armed, for HUNT? the wave-ambition gates
  of §7 phase 1). Zero is how hard rules live inside a soft system —
  impossibility and identity are gates; everything graded (hunger,
  fear, liking, duty pressure, village need) is a soft consideration so
  degrees can trade off — the trade-off a strict priority tree cannot
  make.
- With ≤ ~8 considerations per candidate, the product is corrected by
  the standard compensation factor (or a weighted geometric mean) so
  adding a consideration doesn't silently shrink every score.
- The scorer's arithmetic consumes **no shared-stream `Math.random`**.
  Where selection randomness is used (§5), it comes from a deterministic
  per-villager hash roll — the `bondRoll` pattern
  (`bond-initiation.js:156-180`) — so panels stay reproducible.
- **Every dawn decision logs its full consideration breakdown** per
  villager. This is the debug view the research insists on (Cataclysm's
  maintainers eventually had to bolt one on to see why NPCs did things);
  it is also what makes the behavior-preservation panels in §8 checkable
  per person, not just in aggregate.

**Mandatory shared inputs.** The Wesnoth lesson is written into the
contract: shared "aspects" that a candidate action *may* ignore *will*
be ignored (Wesnoth issue #4598 is a list of exactly that). So every
candidate must consume all four of these, or it does not enter the list
— enforced by a proof test that walks the candidate table, the same
habit as `check-wired.js` applied to considerations:

1. **The single personality source** — the one temperament read plus
   goal label and intel, entering as curve parameters and multipliers
   inside considerations. This replaces the drifted parallel reads:
   goals' `GOAL_BASE`/`TEMP_MULT` tables (`villager-goals.js:89-122`),
   objectives' hard-coded dormant-motivation weights for the same
   labels (`villager-objectives.js:389-430`), and agency's range
   profile computed once and **cached forever**
   (`villager-agency.js:128-180`) — range becomes a consideration
   computed fresh from the one read, so a villager's reach can change
   as they learn.
2. **The unified per-villager trust map** (§7 phase 2) — what this
   villager believes about each person they know.
3. **Perception-filtered danger** — the belief state's heard-filtered,
   staleness-weighted danger, never the raw gossip store.
4. **Perception-filtered village need** — the believed pantry/cistern
   state, never the global totals.

Needs enter as considerations using the shared threshold vocabulary
(§2). The villager's persistent drives — the goals layer's eight
(`party_up`, `gear_up`, `bank_veterans`, `build_standing`,
`food_security`, `bonds`, `knowledge`, `safety`) — enter as drive
considerations and candidate sources. They bid; they no longer bias a
lottery from outside it.

## 5. One arbiter, with commitment

One arbiter runs the dawn pass and owns the pick:

- The pick is the day's lead candidate, chosen by **weighted pick among
  the top 3 scores** (the Sims' anti-robotic rule) rather than a strict
  argmax — near-ties break differently per person and per day, while
  the commitment term below keeps that from becoming dithering.
- The pick writes the **commitment record** (§2). While a commitment is
  still valid — target still in the belief state, purpose unmet — its
  candidate's score carries a **commitment multiplier** (start at
  ×1.15, tuned in panels). This generalizes the goals layer's +0.75
  stored-top bonus (`applyCommitment`, `villager-goals.js:338-351`) to
  the whole decision. A villager's choice does not flip-flop dawn to
  dawn because yesterday's near-tie re-rolled.
- **Re-scoring inside the day happens only on a perception-changing
  event** — a threat sensed, an injury, a grievance earned, a fight
  survived — evaluated at the next day-part boundary. This is the Naev
  control discipline: subsystems never re-decide on their own clocks;
  they post events into the belief state and the arbiter reconsiders.
  (Today the systems each keep their own clock — dawn, day-part,
  conversation-time, daily ticks, per-turn; audit seam 9.)
- **Emergencies are gates, not a parallel brain.** The heal gate
  (`objHealGate`, `villager-objectives.js:973-986`), sickness sit-outs
  and shelter rules stay hard: they zero the departure candidates for
  that part. What changes is that they act *inside* the one pass, as
  considerations returning 0, instead of pre-empting it from outside.
  The same applies to today's hard early returns (escape, rest, eat,
  fresh-kill haul, knowledge seek — `villager-objectives.js:306-367`):
  urgency becomes steep curves and, where truly non-negotiable, gates
  — scored in the open, where the score log can show them winning,
  instead of bypassing every other consideration the villager has.

## 6. Seam-closing map

The audit's fragmentation assessment names ten seams. The five that
decide the architecture close first; the rest close as consequences of
the same moves. (Function names and line anchors are the audit's, at
master `5ba7f167f`.)

**Seam 1 — the dawn decision has three stacked priority engines.**
Today: `objPick`'s hard early returns (`villager-objectives.js:306-367`)
bypass everything; `objPick`'s hard-coded goal-label weights
(`:389-430`) and the goals layer's second, different weight table for
the same labels (`GOAL_BASE`, `villager-goals.js:89-108`, applied via
`vgoalBiasCands` `:365-388`) stack additively under an RNG draw; then
win-plan re-decides strategy at the agency tick (`winPlanHavenTick`,
`winPlanDepart` in `win-plan.js`, called from `agencyTick`).
*Replaced by:* the dawn scorer (§§3–5). Both weight tables retire into
considerations; early returns become gates/steep curves inside the
pass; win-plan stages become candidates scored in the same pass.
Closed by phase 1.

**Seam 3 — "trust" is four different numbers.**
Today: trust-of-the-scholar (`state.village.trust`) decides obedience
(`checkObedience`, `game.js:6372-6402`), duty yield (`trustTaskMult`),
companion scoring (`objAskCompanion`, `villager-objectives.js:933-947`)
and fight help-answer order (`villagerFightAllies` sorts by it,
`party-wiring.js:39-105`); pair bond warmth decides affinity; link
trust decides diplomacy (`hierarchy.js`); and the per-villager trust
map the goals bonds gate reads (`trustedAnyone`,
`villager-goals.js:225-234`) is **never written** — the gate is dead in
the wild, which is why bond-initiation bypasses goals for warmth and
documents the census in its own header (`bond-initiation.js:76-82`).
*Replaced by:* one per-villager trust map (villager → each person they
know), written from lived interaction (phase 2); every
villager-about-villager read moves to it. `state.village.trust` keeps
exactly one meaning — the village's trust of the scholar — and keeps
serving player-facing obedience; it is never again spent as an
NPC-to-NPC currency. Diplomacy's village↔village trust stays in
`hierarchy.js` and is named as link trust wherever the two could be
confused. Closed by phase 2.

**Seam 4 — perception discipline is per-module, not architectural.**
Today: `objDanger`, `objVillageDanger` and `objRallyFreshRaid`
(`villager-objectives.js:824-889`) sum the whole village gossip store
with no `heard` filter — three copies in one file — while the goals
layer computes a fourth, heard-filtered version (`dangerHeard`,
`villager-goals.js:236-247`); pantry and cistern are read as global
totals by everyone, home or away. A villager's drive can be zeroed for
not hearing a raid while their feet are held home by that same raid.
*Replaced by:* the belief state's single danger and pantry beliefs
(heard-filtered, staleness-weighted); all four danger computations and
the global resource reads retire into it. Closed by phase 3.

**Seam 5 — personality is read at wildly different resolutions.**
Today: a rich multiplier table (goals), a ±1 nudge (objectives danger
and range, `villager-objectives.js:846-853`), a cached lifetime range
class (agency), a 3-bucket combat script (the `ai` tag from
`tbHumanFighter`, `game.js:34210`), ±0.1 on one morale number (field
fights), a full social calculus (invite decisions), nothing at all
(favor needs, `convoFindFavorNeed`, `convo-wants.js:1517-1581`;
obedience) — plus conversation's drifted second temperament nobody
else can see. *Replaced by:* the single personality source as a
mandatory consideration input (§4); range computed fresh from it;
both fight brains reading it through the shared fighter-state read
(phase 5); favor needs gaining a personality consideration (phase 4).
Closed across phases 1, 4 and 5.

**Seams 6+7 — two fight brains, and two "today" brains.**
Fights today: turn-based turns run the `ai`-tag script plus a
hand-ordered ability cascade (`tbVillagerTurn`, `game.js:39798+`;
`tbVillagerAbility` `:39427+`; `villagerDecide`,
`engine/combat.js:178-268`), while field fights run bravery-XP morale
with different flee math (`fieldFights.js:1120-1126`, `:2062-2280`) —
neither reads the villager's learned monster knowledge. Days today:
the objectives lottery for autonomous villagers, while the production
duties are player/conversation-assigned (`assignTask`,
`game.js:6404+`; `resolveAssignments` `:6569+`) and resolved by
`villagerCompetence` (`game.js:6279-6370`) — a pure function of the job
they had before the world ended, ignoring all three XP ledgers (track
XP in `tracks.js`, agency XP in `villager-agency.js`, `foodXp` in
`food.js`); `specialistSkill` (`food.js:1230-1242`) is zero for any
occupation that doesn't match. *Replaced by:* one shared
fighter-state read consumed by both fight brains, learned monster
knowledge included (phase 5); and duties as scorer candidates with
competence resolved from lived task experience (phase 6). Closed by
phases 5 and 6.

**Seam 2 — two departure brains negotiate by exclusion flags.**
`objMaybeDepart` (`villager-objectives.js:1089-1117`) and agency
expeditions (`agencyTick`, `villager-agency.js`) coordinate only
through `exped[]`/`away{}`/indoor checks; whoever fires first owns the
day. *Replaced by:* EXPEDITION as a candidate in the dawn pass;
departure is the arbiter executing the winning candidate. The flags
remain as state, not as negotiation. Closed by phase 1.

**Seam 8 — relationships form in one system and are spent in others
that can't see the formation.**
Bonds accumulate via `bondAdd` from meals, visits, feasts and objective
trust bumps scattered across modules, and are spent by pair affinity,
bond-initiation's warmth window and party combat edges — while the
systems that decide who spends time with whom (`objVisitTarget`,
`villager-objectives.js:784-817`; `objAskCompanion`) read fire-groups
and scholar-trust instead of the pair bond graph. *Replaced by:*
VISIT and companion candidates scoring from the bond graph and the
trust map — the relationship being built becomes the input to
time-together decisions. Closed by phases 2 and 4.

**Seam 9 — every subsystem keeps its own clock and its own RNG
ethics.** Dawn, day-part, conversation-time, daily and per-turn clocks;
bond-initiation alone refuses `Math.random` to protect panel
determinism while obedience's reluctant refusal and expedition
launches roll the shared stream freely. *Replaced by:* one decision
clock (dawn + event-triggered re-score, §5), deterministic
per-villager rolls inside the scorer, subsystem clocks demoted to
posting events. Closed incrementally across phases 1–4.

**Seam 10 — the goals layer's own contract admits the fragmentation.**
`villager-goals.js:36-46`: "NOT a new brain and NOT a planner above
objPick." *Replaced by:* this contract. `villager-goals.js` is demoted
to what it always claimed to be — a source of drive considerations and
candidates feeding the scorer. Closed by phase 1.

## 7. Phase plan

Six phases, in dependency order. Each is its own branch, worktree, proof
and gate under the repo's standing discipline; this document authorizes
no direct-to-master work.

**Phase 1 — the dawn scorer.**
One scoring pass (§§3–5) decides the dawn. Into it fold: the goals
weight table (`GOAL_BASE`/`TEMP_MULT`, `villager-goals.js:89-122`), the
objectives dormant-motivation weights (`villager-objectives.js:389-430`),
the hard early returns (`:306-367`, as gates/steep curves per §5), the
win-plan stage decisions (`win-plan.js`), and EXPEDITION as a candidate
(closing seam 2's flag negotiation).
The existing drive build (branch `build-drive-seek`, built and screened
2026-11-06: pairs of living wave-4 killers formed on 2 of 16 matched
seeds where the old code formed none; pooled wave-4 kills 5 → 9) is
**re-homed, not merged as a separate system**: its leanings become
scorer weights and candidates. Concretely — the bank-veterans drive no
longer switches off at the villager's own first wave-4 kill; as a
candidate it stays live, its weight shaped by the drive brief's caveats
turned into consideration curves: wounds and wear bend it steeply down,
believed pantry shortage bends it down without zeroing it (village need
defers, never erases), and personality routes its expression — bold
villagers re-hunt; cautious/gentle/stoic villagers bank veterans by
mentoring and accompanying (the drive build's VISIT/HAVEN_CHORE mentor
mode becomes candidate construction, not a mode flag). The seek/scout
half becomes candidates scored by the drive build's own terms —
trust-in-teller × staleness × distance — over heard sightings in the
belief state; a scout outing judges and turns home, it never initiates
a fight; a later outing commits. The ambition limits stay **gates**
(they are safety/identity, not preference): target wave ≤ highest
personally fought or killed + 1, and wave-4+ requires a sensed ally.
*Closes seams 1, 2, 10 (and 9 for the dawn). Done when:* the dawn has
exactly one scoring entry point, the score log explains every pick,
and §8's preservation panel passes.

**Phase 2 — the trust map is written.**
The per-villager trust map gets writers, from lived interaction only:
conversation outcomes (`resolveConsequence`, `convo-scene.js`), favors
kept and broken (the promise records in `convo-wants.js`), gifts and
shares, fighting alongside (answering a call via `villagerFightAllies`
and surviving the fight), shared meals and feasts (the occasions that
already call `bondAdd`), lessons given and received (`teachSkill`,
`skill-teaching.js`), and rumors proved true or false — a scout's
outcome (phase 1) moves trust in the teller. Entries decay slowly
toward neutral with days since contact. Readers move onto the real
map: the goals bonds gate (`trustedAnyone` — the dead gate lives),
the seek candidate's trust-in-teller term, VISIT targeting (replacing
the village-level `v.trust` read at `villager-objectives.js:806-808`),
and help-answer ordering (a friend runs toward *the caller's* screams:
`villagerFightAllies` orders by relationship to the fighter, not by
trust in the scholar). *Closes seam 3 and half of seam 8. Done when:*
the §8 trust census shows the map moving in ordinary panels.

**Phase 3 — perception hardening.**
One heard-filtered danger read in the belief state replaces
`objDanger`, `objVillageDanger`, `objRallyFreshRaid` and the goals
layer's `dangerHeard`; the door verdict, the rally and the safety
drive all consume it. Believed pantry/cistern (with staleness)
replaces the global reads in the food-security drive, in FORAGE/WATER
urgency (`villager-objectives.js:377-387`) and in the village-resource
favor scan (`convoFindFavorNeed`, `convo-wants.js:1559-1572`).
*Closes seam 4. Done when:* the §8 perception probes pass — a villager
who never heard of the raid does not act on it, and an away villager
acts on the pantry as they last knew it, not as it is.

**Phase 4 — conversation and social life join the list; one companion
scoring.**
`convoSelectWant` (`convo-wants.js:2020+`) reads the villager's
current commitment and top drive, so a conversation opens from the
same priorities the dawn chose; the favor-need scan gains a personality
consideration and the shared threshold vocabulary (which also ends its
selection-vs-liveness double standard — `convoFavorNeedLive`,
`:1902-1918`, judges the same need by different numbers than
selection). Bond proposals become candidates: bond-initiation's entry
points (VISIT arrivals, the daily pair tick, the scholar tick) raise a
PROPOSE_BOND candidate that the initiator's own scorer weighs — the
warmth-window gate (`bondDriveLive`, `bond-initiation.js:235-247`)
stays as the gate, and the target still decides through the shared
`npcInviteDecision` (betrayal.js), which is already one decider and
does not change. Villager link raises likewise become candidates.
Companion scoring is unified into **one** `companionScore` used by the
door, the party path and favor-company; `objAskCompanion`'s
cross-person objective overwrite (`villager-objectives.js:951-965`)
is removed — the offer arrives in the companion's own candidate list
as a GUARD candidate with its terms advertised, and the companion's
arbiter decides. Nobody writes another villager's objective again.
*Closes seams 5 (social half) and 8. Done when:* the overwrite count
in panels is 0 and social rates hold under §8.

**Phase 5 — both fight brains read learned knowledge.**
One shared `fighterState(vid)` read — HP fraction, fear, confidence
from recent outcomes, and what this villager has learned about *this*
species (fought it? knows its tricks? was mauled by one?) — consumed
by both fight brains. Turn-based: `villagerDecide`
(`engine/combat.js:178-268`), the ability cascade (`tbVillagerAbility`)
and the hopeless-flee check (`game.js:39858-39910`) read it; the `ai`
tag stops being a 3-bucket collapse fixed at spawn
(`tbHumanFighter`, `game.js:34210`) and becomes curve parameters from
the one personality read. Field fights: the morale block
(`fieldFights.js:2062-2280`, break line `:1120-1126`) reads the same
state, so the same villager gives the same answer to "do I run?" in
both arenas. The contest/arena no-flee rule stays — as a single gate
zeroing flee in both brains, not a flag each brain privately obeys.
*Closes seams 5 (combat half) and 6. Done when:* the §8 matched arena
probes show learned knowledge changing flee/engage, and the two
brains agreeing on identical scenarios.

**Phase 6 — duties resolve competence from lived experience.**
The role-formation build (branch `build-role-formation`, reviewed,
LAND decided) lands **inside this program, not beside it**: a
per-person per-task practice store (taskXp), `villagerCompetence`
gaining drift from reps done, and `specialistSkill` able to grow from
zero for a non-matching occupation through practice (`foodXp`). Then
duties join the candidate list: an unassigned villager's dawn list
includes duty candidates advertised by believed village needs
(believed pantry low → forage/cook duties score up), so the
production economy and the life brain are finally one brain.
Player- and conversation-made assignments keep flowing through
`assignTask` and the obedience gate (scholar-trust, §6 seam 3 —
unchanged meaning) as binding commitments the scorer honors, not as a
parallel decider. *Closes seam 7. Done when:* the §8 role census
shows formation across all five tracks.

## 8. Measurement — every phase, two questions

Standing instrument, per `docs/MEASUREMENT.md` §§14–15 (pre-registered
thresholds bind; the balanced panel is the instrument, the threshold
is the judge; 16 matched screening seeds, 64 holdout seeds for small
effects):

1. **Behavior preservation.** On identical seeds, before/after: do
   villagers still do the things they did — errand mix, departures,
   visits, conversations, hunts, teachings — within pre-registered
   tolerance? The dawn score log (§4) makes this checkable per villager
   per day. A phase that moves behavior it did not aim at is a NO-GO
   until the movement is explained.
2. **The phase's own metric.**
   - Phase 1 (drive): pairs of **living** wave-4 killers forming per
     panel, and second-kill timing (days between the first killer and
     a second living one). Read with the survival guardrail beside it:
     the drive screen's dip (mean village days 107 → 92 on 16 seeds)
     is adjudicated by the 64-seed holdout before anyone leans on it
     either way.
   - Phase 2 (trust): the trust census — the distribution of map
     values actually moves off default in ordinary panels. The
     pre-fix standard is the bond-initiation census: maxTrust 0 across
     90 days. Post-phase-2 that number must not be 0, and the goals
     bonds gate must fire in the wild.
   - Phase 3 (perception): probes — unheard raid → no door reaction;
     stale pantry → the action matches the belief, not the truth.
     Plus a review grep standard: no new unfiltered gossip/pantry
     reads land.
   - Phase 4 (social): proposal, link-raise and conversation rates
     hold or rise; companion offers are decided by the companion's
     own scores in the logs; objective overwrites = 0.
   - Phase 5 (fights): matched probes — same villager, same stats,
     knows-the-species vs naive → flee/engage differs; turn-based vs
     field answers agree on identical scenarios.
   - Phase 6 (roles): the role-formation census across all five
     tracks (combat, field, social, craft, strange) — competence and
     skill movement and hybrid formation, against the November 5
     census baseline where competence moved 0 cells.

## 9. What never changes

- **Win prices, deed gates, readiness bars.** Untouched by every
  phase. If a phase's panel says one of these is the blocker, the
  phase stops and the question goes to Steve.
- **The perception law.** No roster-fed facts, ever. A phase that
  needs one stops; it does not negotiate.
- **The six-slot ability rule**, and the boundary it rests on:
  abilities are System-granted magic; human skills are teachable
  earthly knowledge; never the twain. The brain decides what a
  villager *does*; it does not grant abilities.
- **The table offer is standing** — once offered, it never withdraws.
- **Difficulty stance:** a lot of people dying is correct; the lever
  is survivor strength, never fewer deaths. A phase whose panel shows
  a death-rate drop beyond ~15% is presumed a buff and re-examined.

## 10. Failure modes the research names — and the contract's answers

| Failure (source) | Contract answer |
|---|---|
| A subsystem that never runs — Cataclysm's needs tree "connected to absolutely nothing" while another system decided | One entry point: if it isn't a candidate or a consideration, it doesn't decide. The score log makes dead inputs visible the day they die. |
| Shared inputs some consumers ignore — Wesnoth aspects, issue #4598 | Mandatory considerations (§4), enforced by a test that walks the candidate table. |
| Incommensurable scores minted by different modules — FreeCiv's "want" | Every consideration normalized to [0,1] through a curve; one product; no raw scores cross module lines. |
| Strict priority can't express degree — Cataclysm's thirst-vs-starving problem | Hard priority exists only as 0-gates for impossibility and identity; everything graded is soft. |
| Duties and needs computed apart collide at execution — Cataclysm followers walking off post | Duty is a consideration in the same pass, re-checked when the action starts via event re-scoring (§5). |
| Oscillation between near-equal choices | Commitment record + inertia multiplier + event-only re-scoring (§5). |
| Robotic optimality | Top-3 weighted pick (§5); personality inside the curves, so ties break per person. |

## 11. Boundaries — what this contract does not claim

- **Foreign villages** (`villageAgency.js`) keep their own inner-life
  simulation. They are other villages' people at village grain; this
  contract governs Haven's villagers.
- **Diplomacy stays village-level and player-decided.**
  `proposeLink`'s courtship scoring (`hierarchy.js`) is untouched;
  phase 4 only changes how a villager's *idea* to raise a link reaches
  the conversation.
- **Plots, justice, betrayal keep their motive engines**
  (`betrayal.js`, `justice.js`). They write grievances and heat into
  memory and belief; whether a plot becomes a dawn candidate is a
  later question, explicitly not one of these six phases — silence
  here is not a plan.
- **Membership judging** (`membership.js`) is the village as a whole
  judging an applicant; it stays as it is.
- **Succession:** the promoted villager's commitment record now
  survives in their belief state, so the new scholar's brain starts
  from what that person was actually doing — the audit's party-less
  successor hole (§12 of the audit) becomes visible instead of
  silent. Repairing succession itself is out of scope for these
  phases.
- **No player-UI change** is specified here. The score log is a sim
  and debugging artifact; surfacing it in the app is a separate
  decision.
