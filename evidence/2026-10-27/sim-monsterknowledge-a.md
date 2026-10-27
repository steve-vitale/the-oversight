# sim-monsterknowledge-a — the monster-knowledge inventory (axis scale-onramp)

Run: flesh-out loop, run fleshout-20261027T0321Z, arm sim-monsterknowledge-a.
DIAG / MEASUREMENT ONLY — zero src/js changes, no default flips, no
game lever proposed. What would need to exist for the knowledge link
is reported at the end as SPECIFICATION ONLY, never as a lever proposal.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5). No design is invented here.

Starting HEAD (this worktree): c8770e7f4412aa6430d6daa3ce86e28484f0de20.
NOTE ON THE BASE: this is NOT the meetrule base
(896f2ac39f24284118dac4bb29d0b38cca9666e1) — the base MOVED between
runs. The 1920Z band table was therefore re-baselined on identical
seeds first. The re-baseline came back EXACT on all nine judged
fields (see below), so no base-move delta needs explaining: current
master moves nothing on this band vs either the 1920 base or the
meetrule base.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

Full text: evidence/2026-10-27/sim-monsterknowledge-a-prereg.md
(written before any sweep ran). In brief:

- Question (from sim-meetrule-a): G1 KNOWLEDGE is MISSING — no
  engine path supplies a live monster's tile to villager routing.
  This arm inventories EVERY candidate channel and measures on the
  band whether villagers ever hold or act on monster-location
  knowledge.
- Substrate: tableseat-nowait (LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1, seat legs only), seeds 73671-73678, 180d
  death-aware horizon (runDays stops on Game.over).
- DIAG-GO bar (verbatim from the prereg): DIAG-GO iff (a) the
  channel inventory is complete: every candidate channel classified
  present-with-citation or absent-with-enumerated-search, zero
  channels left unexamined, zero invented; (b) the band scan is
  complete: every monster-location knowledge-event candidate on
  all 8 seeds classified, zero unclassified; (c) recorder
  neutrality: det-gate seed identical on days/gameDays/ts/
  starvation recorder on/off, and band wall numbers replicate the
  baseline table or any delta is explained as a base move. Cost
  bar: armed starvation <= baseline starvation + 2 AND armed
  median days >= 0.8 x baseline median. A miss is DIAG-NO-GO,
  never re-scored mid-run.
- Band-scan event classes E1..E7 (pre-registered): E1 objective
  targets a live monster's tile; E2 gossip names a live monster;
  E3 codex knows a live monster's type; E4 muster active with a
  live threat; E5 monster tile is map-seen; E6 eligible villager
  co-located with a live monster (MEETING, not knowledge);
  E7 player on a live monster's tile (player-only knowledge).
  Say-only lines are classified by code citation, with band
  occurrence measured through state proxies (E4/E5/lingering)
  plus one non-measured sense replay.

## RESULTS

### Verdict: DIAG-GO

- (a) Inventory complete: 16 candidate channels C1..C16, every one
  classified below with a file + function citation or with
  enumerated-search absence evidence. Zero channels left
  unexamined, zero invented. The proof script checks that every
  cited symbol exists in its cited file (29 citation checks).
- (b) Band scan complete: 18,883 monster-days over 8 seeds
  (780 wave-4), every one bucketed into E1..E7 or 'none',
  unclassified 0 on all 8 seeds, recorder errors 0.
- (c) Recorder neutrality: det-gate PASS (seed 73671, recorders
  unset == unwrapped: days 180, gameDays 181, ts {tsNationalDay:
  107} on both sides, no diag surface, no wraps installed);
  G2 identity PASS 8/8 (days/gameDays/ts/starvation, faced maps,
  and kill logs all identical armed vs baseline); band wall
  numbers replicate the 1920Z table EXACTLY (see re-baseline).
- Cost bar: PASS. Armed starvation 1 <= baseline 1 + 2; armed
  median 152 >= 0.8 x baseline median 152 (identical).
- Detail repro: PASS. Seed 73675 re-run: censusMatch=true AND
  knowMatch=true (partition, opportunity classes, and knowledge
  E-totals all identical).
- Proof: scripts/test-monsterknowledge-a.js — 1743 PASS, 0 FAIL
  (G2, bands, diff recomputation, per-seed knowledge re-derivation
  from raw rows, E1 detail spot checks, moving-toward checks,
  citation checks, absence checks).

### RE-BASELINE — EXACT, zero base delta

Band aggregates (baseline = armed, identical): wins 2/8,
national-ever 6/8, national-final 5/8, table 4/8, entered 2/8,
wave-4 6/8, wave-5 0/8, median 152d, max 180d, deaths 307,
starvation 1 — every judged field identical to the 1920Z table.
Per-seed numeric trajectories match the 1920 baseline column
(days/wave/deaths): 73671 180d w4 48; 73672 180d w4 51; 73673 124d
w4 32; 73674 142d w3 28 (won); 73675 180d w4 26; 73676 144d w4 43
(won); 73677 152d w4 41; 73678 104d w3 38 (starvation 1).
End-reason label strings differ cosmetically from meetrule's
prose ('village-lost' / 'over-other' vs 'lost' / 'won-lesser');
no judged numeric field differs, so this is not a delta.

### THE CHANNEL INVENTORY (C1..C16) — the answer to "where could the link live?"

Read this table as: PRESENT means the code exists; the "feeds
routing?" column is the judgment that matters. A channel can be
real and still not be a knowledge link.

| # | Channel | Citation (file + function) | What it carries | Feeds villager routing? |
|---|---|---|---|---|
| C1 | Villager objectives | villager-objectives.js objPick | Direction+distance node (FORAGE/WATER/TRAPS/EXPLORE), a person's node (VISIT via objVisitTarget), a remembered corpse site (HAUL via mapmemHaulCandidate), Haven itself (indoor kinds) | NO — no branch reads worldMonsters(); the target set is closed (see absence check) |
| C2 | Map memory | villager-mapmem.js mapmemHaulSites / mapmemHaulCandidate / mapmemTell | Remembered CORPSE sites only; HAUL tells at most 2 hall-mates secondhand (objHaulFromSite) | NO — a live monster leaves no map memory |
| C3 | Expeditions | villager-agency.js startExpedition / expeditionMonster | Random direction+distance node (1 + floor(R x maxD)); expeditionMonster picks an ABSTRACT monster from monsterWavePool, not a world entity | NO — cannot be aimed at a known world monster even by accident |
| C4 | Gossip state | game.js seedGossip; villager-objectives.js objDanger / objVillageDanger | Person-event actions (attack/murder/raid/death/departure/deed/...) with person-id/trait dims; exactly ONE action carries a monster field (see C4 note) | PARTIAL, NOT A LINK — objDanger reads ONLY attack/murder/raid/death within 3 days as a scalar danger score (+2/+1, capped 4) gating departure (go/ask/tighten/defer). No monster identity, no tile, never a destination |
| C5 | awayNews | game.js (scholar.awayNews queue, capped 8, delivered by returnToVillage); havenGrowth.js raid line | Player-return news: villager deaths, thirst/sickness while away, raid at Haven, and villager-fight reports (see C16) | NO — player queue only; nothing reads it into routing |
| C6 | Scout assignments + reports | game.js resolveOneAssignment scout branch; markSeen / villageMapKnown | Scout maps Haven-near tiles (5x5 around Haven, 50% x eff each): sets tile.revealed + markSeen 'shared' (player map). Say line: "🔭 X scouts the land: mapped N new areas." No monster is ever named or located | NO — mapping, not monster knowledge; a monster standing on a scout-mapped tile is map-coincidence (measured as E5) |
| C7 | Scholar/codex monster knowledge | game.js monsterKnown (-> canShow); state.codex.monsters stages (encountered/observed/slain); waveLedger.js monsterCounterKnown; progression.js codexBreadth; villager-agency.js agency know[vid].fought | TYPE knowledge: name/descriptor gating, counter tricks, breadth (observed/slain only — mere 'encountered' sightings do NOT count). No location field exists anywhere in the codex monster entry | NO — knows WHAT, never WHERE |
| C8 | Monster-sighting state | ABSENT — enumerated search: no state field named sightings/seenMonsters/monsterSightings/spottedMonsters exists in src/js (only prose mentions: journal sighting counts, progression "mere sightings" comment, agency "Evades are just sightings — they stay flavor, never knowledge") | Nothing stored | NO — there is no sighting store to read |
| C9 | Crow / Eurika / East Nile warnings | game.js moveWanderer branches: eurika mosquito-sense (skin prickles, ambush announces first); east_nile crow-direction line ("The crows are screaming east..."); eyes_in_back parallel | Player-only warnings: eurika = ambush pre-warning for the SCHOLAR; east_nile = a compass DIRECTION (east/west/north/south), not a tile, for the scholar | NO — scholar status effects; villagers have no equivalent |
| C10 | Shelter muster threat gate | shelter.js shelterThreatNearHaven / shelterMusterCheck / shelterMuster | THE ENGINE'S OWN LIVE-MONSTER TILE READ: wave-4+ world monster within Chebyshev radius 2 of Haven (3 once mustered), worst wave wins, returns {monster, wave, dist, name}. shelterMusterCheck turns it into SHELTER (villagers inside, hall door barred), never pursuit | PRESENT AS A SIGNAL, ABSENT AS A LINK — the gate KNOWS the tile (the recorder calls it directly for E4) but its only consumer shelters villagers; no reader turns it into an objective |
| C11 | Lingering-raider / treeline state | havenGrowth.js lingeringRaiders / lingererSortie; comms.js crisis resolution | World monsters with .lingering set, re-pinned to the Haven tile, gorging nightly; the player may sortie fighters against them (lingerers are AT Haven, so no travel-to-tile is involved) | NO — besieging state at Haven, not a world-monster tile supply |
| C12 | Titan / finale scout tile lines | titans.js ("Scouts correct their map — X is at tile x,y"; "Scouts found its lair — tile x,y"); finale-campaign.js ("Scouts found the broadcast tower — tile x,y") | Tile lines for TITANS and the finale tower ONLY — scripted campaign entities, not world monsters | NO — the scout-tile language exists, but only for campaign entities; no equivalent line exists for a world monster |
| C13 | Player perception | game.js playerMonster / checkEncounter tile-entry spawn narration ("Something moves out there — <displayName>"); wanderWorldMonsters announcement ("Something pads into the clearing — X. It's here."); perceive.js perceptionHints | Player-tile monster, player-only: spawn narration on tile entry, wander announcement on the player's tile, perception hints within Chebyshev 1-2 of the player | NO — all three are player-facing; none writes villager state |
| C14 | Conversation topics | convoTopics.js t2LatelyEvent ('muster' kind: sheltered villagers remember 'mustered inside — X hunts the treeline'); convo-wants.js sightingNews ("The treeline, this morning — something moved out there, big... it was gone. But I saw it."); conversation.js compare_maps (merges VISITED TILES into the player's shared map) | Player-conversation lines: muster memory names a threat NOUN, never a tile; sightingNews names nothing and places nothing ("the treeline", generic); compare_maps shares ground tiles, never monster positions | NO — dialogue only, and the bot policy never converses; no reader feeds routing |
| C15 | worldMonsters() readers outside game.js | comms.js (lingering clear); finale-campaign.js (node cleanup); havenGrowth.js (linger re-pin, raid draft, raid live-check); network-campaign.js (network-node hold/cap/cleanup); shelter.js (C10 + stand-down stamp clear); titans.js (titan bookkeeping) | Crisis resolution, raid drafting, network cleanup, titan bookkeeping | NO — none of them feeds objPick, objMaybeDepart, or objAwayStep (checked each call site) |
| C16 | Villager fight reports | game.js resolveWildMonsterEncounter tell() (awayNews lines: fight summary, "The village cheers", "It's still out there, somewhere", wound/death lines) | Names the monster (monsterNoun) + outcome, to the PLAYER's awayNews queue. No tile. The monster's tile at fight time is the villager's own node, already known to that villager by being there | NO — a report AFTER a fight, to the player, with no destination |

C4 note (the one exception that proves the rule): the band's
gossip census observed 66 distinct gossip actions. Exactly one
action in the whole codebase carries a monster field:
feastBuff.js:469 seedGossip('feast-draw', {monster: mid}, []) —
the feast-draw scavenger (a player-facing pendingEncounter, not a
world-monster sighting). Every other seedGossip call carries
person ids, traits, or village ids. So gossip CAN name a monster
in exactly one narrow case — and on this band it did so exactly
once (see E2).

Absence checks (proof-verified): villager-objectives.js,
villager-mapmem.js, and villager-agency.js never call
worldMonsters() at all. There is no code path — present or
vestigial — from the live monster pool into villager routing.

### THE BAND SCAN (E1..E7) — what villagers actually did with monster-location knowledge

18,883 monster-days (all waves), 780 of them wave-4. A monster-day
counts once per class if >=1 event of that class hit it that day;
events count every villager/objective/gossip hit. 'none' =
monster-day with no E1..E7 event at all.

| Class | Band monster-days (of 18,883) | Band events | Wave-4 monster-days (of 780) | What it means |
|---|---|---|---|---|
| E1 objective targets monster tile | 1,726 (9.1%) | 2,388 | 173 (22.2%) | Coincidence, not knowledge (see E1 deep dive) |
| E2 gossip names live monster | 3 (0.02%) | 3 | 0 | One feast-draw entry, wave-1 crow, no tile (see E2) |
| E3 codex knows live type | 17,506 (92.7%) | 17,506 | 144 (18.5%) | Type knowledge is near-universal for old waves, rare for wave-4 |
| E4 muster + live threat | 3,822 (20.2%) | 3,822 | 691 (88.6%) | The village's dominant response to wave-4 presence is HIDING |
| E5 monster tile map-seen | 3,764 (19.9%) | 3,764 | 257 (33.0%) | Player-map coincidence (walked/shared ground) |
| E6 villager co-located (MEETING) | 303 (1.6%) | 303 | 2 (0.3%) | Meeting, not knowledge — and wave-4 almost never meets |
| E7 player on monster tile | 118 (0.6%) | 118 | 25 (3.2%) | Player-only knowledge |
| none | 553 (2.9%) | — | 57 (7.3%) | No event of any class that day |

Per-seed knowledge (monster-days / wave-4 / E1 / E2 / E3 / E4 / E5 /
E6 / E7 / none; E1-moving days in parentheses):

| seed | days | monster-days | w4 | E1 (moving) | E2 | E3 | E4 | E5 | E6 | E7 | none |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | 2,214 | 28 | 217 (13) | 0 | 2,193 | 197 | 410 | 41 | 15 | 1 |
| 73672 | 180 | 3,542 | 253 | 456 (9) | 0 | 3,263 | 1,467 | 1,494 | 30 | 12 | 25 |
| 73673 | 124 | 2,781 | 54 | 164 (7) | 0 | 2,642 | 449 | 252 | 39 | 0 | 86 |
| 73674 | 142 | 1,742 | 0 | 153 (6) | 0 | 1,742 | 0 | 447 | 41 | 9 | 0 |
| 73675 | 180 | 2,642 | 316 | 283 (17) | 0 | 2,333 | 1,213 | 241 | 57 | 38 | 4 |
| 73676 | 144 | 2,640 | 16 | 197 (14) | 0 | 2,614 | 176 | 439 | 23 | 9 | 11 |
| 73677 | 152 | 2,278 | 113 | 148 (10) | 3 | 1,709 | 320 | 344 | 57 | 2 | 404 |
| 73678 | 104 | 1,044 | 0 | 108 (5) | 0 | 1,010 | 0 | 137 | 15 | 33 | 22 |

Wave-4 E1-moving days per seed: 73671: 1, 73672: 0, 73673: 0,
73674: 0, 73675: 2, 73676: 1, 73677: 1, 73678: 0 — 5 total.

#### E1 deep dive — the 1,726 "targeting" monster-days are not knowledge

An E1 match means a villager's objective record (tx,ty) equals a
live monster's tile on the same census day. Three facts, in order,
dissolve the knowledge reading:

1. THE TARGETS ARE SET WITHOUT READING MONSTERS. objPick sets
   targets from direction+distance (FORAGE/WATER/TRAPS/EXPLORE),
   a person's node (VISIT), a corpse site (HAUL), or Haven
   (indoor kinds) — proven by the C1 absence check
   (villager-objectives.js never calls worldMonsters()). An
   objective CANNOT be monster-targeted by construction; every
   E1 match is a target that happened to coincide with a monster.
2. A QUARTER OF WAVE-4 E1 EVENTS NEVER TRAVEL AT ALL. Wave-4 E1
   events total 277, by kind: WATER 71, GUARD 48, idle 47,
   FORAGE 28, EXPLORE 24, VISIT 16, HAVEN_CHORE 16, LEAVE 9, SEEK
   7, EAT 8, TRAPS 3. The idle 47 carry a STALE last-trip target
   (objTick marks done objectives 'idle' without clearing
   tx,ty); EAT/HAVEN_CHORE 24 are Haven-targeted indoor
   objectives (tx,ty = Haven), so a match means the monster is
   standing ON Haven, not that anyone walks toward it. Together
   71/277 (26%) are non-trips.
3. OF THE REST, ALMOST NOBODY WALKS TOWARD THE MONSTER. Band
   E1-moving days: 81 of 1,726 E1 monster-days (4.7%). Wave-4:
   5 of 173 (2.9%). The five wave-4 moving events, in full —
   the complete list of "a villager moved toward a tile holding a
   known wave-4 monster" on this band: 73671 d168 VISIT (ready)
   toward an influencer at (5,4); 73675 d156 WATER (out) toward
   a herald at (3,3); 73675 d164 WATER (ready) toward a herald
   at (3,4); 73676 d140 WATER (ready) toward a suburb at (3,4);
   73677 d125 EXPLORE (out) toward a eulogy at (4,3). All five
   are ordinary errands whose independently-picked target
   coincided with a monster tile, and the villager stepped closer
   the next day because objAwayStep pursues its OWN target — not
   because anything told it a monster was there. (For scale: the
   same coincidence mechanism also produces the E6 meetings —
   303 monster-days of co-location, only 2 of them wave-4.
   Coincidence meets monsters; it does not hunt them.)

The honest headline for E1: villagers walk toward their own
errands, and monsters sometimes stand on errand tiles. That is
the ONLY "moves toward a known monster" behavior the engine
currently contains, and the monster is not known to the walker
in any of it.

#### E2 deep dive — gossip names a monster exactly once, without a place

The band's 3 E2 monster-days are one gossip entry, not three
events: seed 73677, days 106-108, action 'feast-draw', dims
{"monster":"nevermore"} — the feast-draw scavenger gossip
(feastBuff.js:469), persisting across 3 census days while a
Nevermore (wave-1 crow) was live. It names a monster id and no
tile, and it is about a feast draw, not a sighting. Wave-4 E2 =
0 on all 8 seeds: no gossip entry on this band ever named a
live wave-4 monster. Gossip's danger role is the scalar C4
score (attack/murder/raid/death), and the observed gossip
actions confirm the vocabulary: departure 5,839, order 6,752,
return 2,542, deed 1,168, raid 764, talk 518, contest_won 594,
death 56, fight 74, rescue 12 — person and village business,
never a monster tile.

#### E4 — the village's actual response to a known wave-4 monster is to hide

691 of 780 wave-4 monster-days (88.6%) fall on muster days
(mustered flag set + shelterThreatNearHaven() returning a
threat). Per-seed muster days: 73672: 64, 73675: 77, 73677: 31,
73671: 18, 73673: 19, 73676: 8, 73674/73678: 0. The muster gate
is the one engine component that reads live monster tiles — and
it spends that knowledge on barricading the hall. Any future
knowledge link has to contend with this first: the village does
not lack monster TILE information at the engine level
(shelterThreatNearHaven computes it daily); it lacks a REASON
and a ROUTE to turn that tile into a villager destination, and
its standing response to the same information is the opposite
direction (inside).

#### E3 / E5 / E6 / E7 in one paragraph

Type knowledge (E3) is nearly complete for the waves villagers
actually meet (92.7% of monster-days) and thin for wave-4
(18.5%) — the codex knows what it has fought, and wave-4 is
mostly unfought (see w4opp reproduction below). Map-seen tiles
(E5, 33.0% of wave-4 days) show the PLAYER's map often covers a
wave-4 tile through walking or scout-sharing, but no villager
objective reads the player's map. Co-location (E6) is 2
wave-4 monster-days out of 780 — the meeting failure meetrule
priced. Player-on-tile (E7, 25 wave-4 days) is the only
knowledge channel that ever puts a knower on a wave-4 tile,
and the knower is the player, who the bot policy never moves
toward monsters deliberately.

### W4OPP REPRODUCTION (reused partition, intact)

33 wave-4 spawns, 24 never-fought, 9 fought (spawn-linked).
Fight-event classes: field-lose 4, field-flee-villager 8,
player-tb-lose-or-rout 13. Opportunity classes over the 24:
contact-without-fight 2, in-range-never-met 0,
never-in-range 22 — identical to meetrule-a's partition on
every seed (fullyClassified 8/8, recorder errors 0). This arm
does not re-litigate the partition; it adds the knowledge
dimension to it: of the 22 never-in-range spawns, the village
had no tile knowledge to route on in the first place.

### REACHABILITY OF THE CONTENT IN THIS AREA

Band (judged corpora — baseline = armed, G2 identical): wins
2/8, national-ever 6/8, national-final 5/8, table waiting 4/8,
entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 152d, max
180d, deaths 307, starvation 1. Wave-4 kills 0/8 seeds. Arc
reach: maxArc 3-4 across seeds. The table IS reached and wins
happen — but never through wave 4, and the wall has not moved:
wave-5 stays 0/8, wave-4 kills stay 0/8. This arm measured the
knowledge half of that wall: even the meeting mechanism that
does exist (coincidence + travel) meets wave-4 monsters on only
2 of 780 monster-days, and no knowledge mechanism exists to do
better.

Death-cause shares (armed band, 307 deaths — recomputed from
this run's rows, identical to meetrule as G2 identity requires):
villager:combat 126 (41.0%), villager:villager combat 85
(27.7%), player:the arena 43 (14.0%), villager:expedition 13
(4.2%), villager:monster 8 (2.6%), player:dehydration 7 (2.3%),
villager:sickness 6 (2.0%), villager:a wound that wouldn't close
6 (2.0%), and the small tail (ambush 3, contest 2, thirst 2,
single named-monster and starvation deaths). Combat dominates
deaths; starvation is 1 — the scale wall is not a starvation
wall on this band.

### SENSE-TEST (NON-MEASURED replay, seed 73677 — tie-break seed)

Seed choice, stated plainly: 73672, 73675, and 73677 tie at 7
wave-4 spawns (the band maximum). 73677 is the tie-break
because it also holds the band's only E2 gossip matches.
Replay (narration on, ring d165-d168 only — the endgame; the
census numbers above do not come from this replay): 168d
village-lost, maxWave 4, tableWaiting true.

- "Rotimi came back from the treeline white-faced. Saw it too.
  Whatever it is, it's still out there." — the most
  knowledge-like villager line in the ring, and it is the
  counterexample that proves the inventory: a villager reports
  a sighting and the report carries NO name and NO place. "The
  treeline" is a direction, not a tile; "whatever it is" is not
  a monster. A village that talked like this could never route
  anyone to a monster from its own words.
- "Something pads into the clearing — The Reunion. It's here."
  — the wander announcement, player-only, on the player's tile.
- "Nobody met The Reunion — it's still out there at the
  treeline. It'll gorge every night until it's driven off." —
  the lingerer line: the village's language for an unmet monster
  is endurance ("until it's driven off" — by whom is never
  said), not pursuit.
- "🌪️ THE HERALD fed in the night — 0 kcal gone from your
  stores. It is eating the realm while you deliberate." — a
  realm-level presence line, no tile, no plan.
- No MUSTER line appears in the ring (the ring covers only the
  last 4 days; musters are day-level state, measured as E4, not
  as ring lines).

Plain-words judgment: villagers talk about monsters the way
people talk about weather at the treeline — present, named
sometimes (The Reunion, The Herald), never located. The one
line that sounds like a report ("Rotimi came back white-faced")
is precisely the line that shows why reporting is not routing:
it gives the village nothing to walk toward.

### VILLAGERS ACTING LIKE PEOPLE (sampled from the same corpus)

- Villagers do their jobs with voice and consequence (forage
  returns, water runs, fishing reports, garden work in the
  sense ring). Companion departures and guard pairings happen.
  The gossip census shows a living village vocabulary
  (departures, orders, returns, deeds, raids, contests) — 66
  distinct actions band-wide.
- The least people-like datum is the inventory's central
  negative, now quantified: across 18,883 monster-days, the
  village never once held a routable monster-location fact.
  Villagers are not failing to act like people — people who only
  know "something is out at the treeline" also cannot march to
  its tile. The blank is in the world's information plumbing,
  not in villager character.
- The scholar's behavior is bot-policy behavior (tableseat-
  nowait seat legs), not villager behavior, and is not judged
  as such.

### SPECIFICATION ONLY — what a knowledge link would need (NOT a lever proposal)

This section specifies what would have to exist for meetrule's
conditional fraction to become unconditional. It proposes
nothing: no lever, no default, no code change is recommended
here, and the next run must treat this as an open design
question, not an approved change.

A knowledge link, to be a link at all, would need ALL of:

1. A STORE readable by villager routing that holds, per live
   world monster, at least (monster identity, live tile tx,ty,
   as-of time). Nothing in C1..C16 is such a store: the closest
   existing reads are shelterThreatNearHaven (tile, but
   consumed only by sheltering) and the codex monster entry
   (identity, no tile).
2. A WRITER that updates that store when monsters move.
   wanderWorldMonsters moves the target 35% per worldTick;
   a spawn-tile record goes stale within days. A link that
   records only the spawn tile would route villagers to empty
   ground — the tier rule's own wander residual, now as a
   freshness requirement.
3. A READER in the objective system: a branch of objPick (or
   its equivalent) that can OFFER a monster tile as a target
   under stated conditions (eligibility, range via npcMaxDist,
   departure gates via objMaybeDepart, danger verdict via
   objDanger) — conditions meetrule already priced (G2..G6).
   Without the reader, a store is a museum.
4. A REASON for the villager to treat that tile as a
   destination that survives the muster gate: shelterMuster
   currently answers the same tile information with "everyone
   inside." A pursuit reason has to be distinguishable from
   the muster response, or the two systems will fight over the
   same villagers on the same days (E4 shows muster winning
   88.6% of wave-4 days today).
5. A VOICE for it: the village's own language for a located
   monster does not exist (C12's scout-tile lines are for
   titans/finale only; C14's sighting line names nothing).
   Whatever the link is, villagers telling each other "X is at
   tile (tx,ty)" in some diegetic form is part of the
   specification, not decoration — otherwise the link is
   invisible to the player and fails the no-silent-actions rule.

Until items 1-3 exist, meetrule's reachable fraction (7/24
spawn-day, 11/24 presence-window) stays conditional, and the
unconditional reachable count via knowledge stays 0 by
construction. This arm does not recommend building them; it
records what "building them" would have to mean.

### METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The DIAG-GO bar is judged exactly as pre-registered:
  inventory complete (16/16 channels), band scan complete
  (18,883 monster-days, 0 unclassified, recorder errors 0),
  det-gate PASS, G2 8/8, wall replication EXACT, cost bar PASS.
  No metric was re-scored. The base move (meetrule base ->
  c8770e7f) produced zero delta on the judged fields, so no
  base-move explanation was needed — the replication IS the
  result.
- Instrument notes for the NEXT run (carried, with evidence):
  (1) Census day is SCHOLAR day, not run-day ordinal — scholar
  day stalls at run start (days 2 and 4 each appear twice on
  73672/73673). Totals iterate rows in order and are
  unaffected, but any future analysis that keys rows by day
  must match by (day + villager + kind + target), not by day
  alone — the proof caught this (see proof section) and the
  corrected check passes 1743/1743.
  (2) E1 detail is capped at 200 rows per seed in the summary;
  the per-seed e1Detail lists are samples, not censuses — the
  proof's totals re-derive from raw rows and do not depend on
  the cap, but a future arm that wants every E1 event listed
  must raise or remove the cap.
  (3) E4 counts monster-days under muster+threat, not muster
  events: a sticky muster flag makes E4 large on hard seeds
  (73675: 1,213 monster-days). It measures exposure to the
  muster response, not muster firings — a future "muster
  firings" metric should count flag transitions, not days.
  (4) The day-end census cannot see per-part states (same
  limitation as meetrule): danger verdicts, engaged/hurtGate,
  and intraday movement are invisible at daily granularity.
  The 5 moving-toward wave-4 events are next-day step
  observations, not per-part pursuit proofs.
  (5) The sense ring covers only the last 240 lines (d165-168
  on 73677); muster/scout lines from earlier in the run are
  measured as state (E4/E5), not quoted from the ring.
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms
  (balance-panel.js has no corpus-ingest mode). The paired
  identical-seed tables above are the comparison of record,
  and for this no-lever DIAG arm, leg-exact determinism
  (G2 8/8 identical) is the comparison — stated explicitly.
  No panel file is produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts
  are wrong on recorder rows — standing instruction).
- check.js --quick NOT run: zero src/js diff in this tree
  (DIAG arm, one new recorder + two sweep/proof scripts only);
  node --check clean on all new scripts, and the proof's
  citation/absence checks cover the code-read claims.

### PROOF SCRIPTS (all in this tree, all run)

- scripts/policies/monsterknowledge-diag.js — NEW in this arm.
  Daily census recorder (MONSTERKNOWLEDGE=1): live world
  monsters with map-seen state, villager objectives (raw
  objState, never objOf), villager nodes + meeting-set
  eligibility, gossip entries verbatim (action + JSON dims),
  codex monster stages + wavesFaced, shelterThreatNearHaven()
  result + shelterMustered flag, lingering list. Strictly
  read-only, draws no RNG, never throws into the engine.
- scripts/test-monsterknowledge-diag-sweep.js — NEW in this
  arm (copied from test-meetrule-diag-sweep.js, w4opp partition
  reused intact, monsterknowledge layer added outermost).
  Sweep (--one per seed via child processes, --summary rebuild,
  --detgate, --detail with knowledge match, --sense).
  Det-gate PASS (73671), detail census+knowledge match PASS
  (73675), sense via --sense file write (clean this run — no
  EPERM flap hit any sweep, det-gate, detail, sense, or proof
  step).
- scripts/test-monsterknowledge-a.js — NEW in this arm. Proof:
  re-derives every summary number from the raw rows; 1743
  PASS, 0 FAIL (G2, bands, 1920Z diff recomputation, per-seed
  knowledge totals, E1 detail spot checks with the
  duplicate-day fix, moving-toward checks, 29 citation checks,
  3 absence checks).
- Reused verbatim: scripts/policies/spawnsrc-diag.js,
  scripts/policies/wave4enc-diag.js,
  scripts/policies/fieldfinish-diag.js,
  scripts/policies/nonworldkill-diag.js,
  scripts/policies/w4opp-diag.js, scripts/policies/meetrule-diag.js
  (no edits).

### INFRASTRUCTURE (loud, as required)

- No EPERM write flap hit this run: all 16 corpus rows, the
  summary, the det-gate/detail/sense outputs, and the proof
  wrote cleanly on first attempt. (Contrast meetrule-a, where
  the flap killed the sense file write 4 times.)
- No safe-commit refusal yet (commit step follows this file);
  the coordinator owns the --ff-only merge. No [needs-eyes]:
  this DIAG arm changes no feel, combat, or UI.
- One proof bug found and fixed mid-run (not a game bug): the
  proof's E1 detail check keyed census rows by scholar day
  alone and failed 9 checks on duplicate days 2/4; fixed by
  matching (day + villager + kind + target), re-run green
  1743/1743. The sweep totals never had this bug (they iterate
  rows in order).

### BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the complete monster-knowledge channel
  inventory C1..C16 — the answer to "where could the link live"
  is "nowhere that feeds routing," with the one partial
  exception (C4 danger score) and the one unused tile read
  (C10 muster gate) named precisely.
- FILLED (measurement): the band scan — 18,883 monster-days
  classified, wave-4 subset 780, with the coincidence
  decomposition of E1 (277 wave-4 events, 71 non-trips, 5
  moving-toward, 0 knowledge-driven).
- FILLED (measurement): gossip's monster vocabulary — exactly
  one action (feast-draw) carries a monster field, fired once
  on this band, never for wave-4, never with a tile.
- FILLED (measurement): the re-baseline delta — ZERO on all
  nine judged fields despite the base move.
- DOCUMENTED, NOT FIXED (engine blank, sharpened): G1 knowledge
  — no store, no writer, no reader, no reason, no voice. The
  specification section above states what would have to exist;
  it does not propose building it.
- DOCUMENTED, NOT FIXED (sense blank): the village's
  monster-talk is treeline weather — "Rotimi came back
  white-faced" names nothing and places nothing.
- DOCUMENTED, NOT FIXED (instrument gaps): scholar-day
  duplicates at run start; E1 detail cap 200/seed; E4 counts
  exposure days, not firings; daily census cannot see per-part
  states.
- NOT A FINDING: no game bug was found in the spawn, wander,
  field-fight, gossip, muster, or map-seen paths on this band —
  the two independent recorder stacks agree on wave-4 counts on
  all 8 seeds, the kill log agrees with the tb ends, and the
  knowledge totals re-derive exactly from raw rows. The
  encounters and the information systems work as designed; the
  village simply has no road from "a monster is out there" to
  "a monster is at (tx,ty), go there."

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, and now
the knowledge half has its price tag — even the engine's own
tile read (muster gate) is spent on hiding 88.6% of wave-4
days, gossip names a live monster on 3 of 18,883 monster-days
(and never a wave-4 one), and the only villagers who ever
stepped toward a wave-4 tile (5 events) were walking to water,
a visit, and an explore node that happened to hold a monster.
The wall did not move; this arm proved there is no door in it
yet — only a window (the muster gate) that looks the other way.
