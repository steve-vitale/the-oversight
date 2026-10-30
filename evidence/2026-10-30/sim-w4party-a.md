# sim-w4party-a — party presence and joining at wave-4 meetings (MEASUREMENT ONLY)

Run: Loop A, axis scale-onramp, follow-up to sim-killconv-a
(evidence/2026-10-30/sim-killconv-a.md).
Worktree branch: sim-w4party-a. Base anchor: 359a384cc (see §Base move
below — this is NOT killconv's anchor; the one game-code change
between anchors explains the single divergent seed).
Pre-registration: evidence/2026-10-30/sim-w4party-a-prereg.md (written
BEFORE any sims; judged against it below).
Instrument: scripts/w4party-instrument-20261030.js (W4PARTY=1,
read-only, det-gate proven) + scripts/w4party-sweep-20261030.js +
scripts/w4party-analyze-20261030.js.
Proof: scripts/test-w4party-20261030.js — 20/20 green (det-gate on
60d leadfeast trajectory identical with/without instrument; static
read-only scan — no npcNode / partyMembers / ensureVillagerPositions
calls, no state writes, no RNG draws; nodeSnapshot fixtures incl.
no-write proof on fixture state; real-sweep gate byte-identical
re-run).
Corpus: evidence/2026-10-30/perseed-w4party/leadfeast/s85101–s85116.json
+ analysis.json (logTail stripped there; full logs in per-seed JSONs).
No game code changed. No [needs-eyes] (measurement only, nothing
player-facing). Panel (§15): NOT APPLICABLE — single-base
measurement, no before/after comparison exists in this arm; none
fabricated. No roster/list-fed join proposal is made anywhere in
this file: every presence claim below is a sense (same node,
earshot, sight range, out together), per Steve's 2026-10-28
perception law.

## Verdict: DIAG-GO

Binding pattern, by the prereg's 2:1 rule: **NEARBY-NEVER-JOIN, 26
of 30 meetings** (runner-up PERIPHERY 3; ratio 8.7:1). Coverage
100% (30/30 classified, 0 unclassified). The answer to killconv's
question — "was anyone else even there?" — is: **yes, almost
always, and nobody ever came.** In 26 of 30 wave-4 field meetings
at least one villager stood on the same node or an adjacent node,
or the engine offered a pool — and in 0 of 30 did anyone join.
The shout mechanism (fieldFight's calledHelp) fired 0 times in the
whole band. JOIN-TOO-LATE 0, JOINED 0: there is no "too late" to
measure, because help never starts.

## The numbers

Wave-4 field meetings (fieldFight, base wave >= 4, all callers):

- Total: 30 (pilot 6 + confirm 24). Outcomes: vFlee 20, vDie 7,
  evade 3, vKill 0 — the 0-kill result reproduces killconv's field
  result on this base (killconv had 35 meetings on its base; the
  5-meeting gap is the single divergent seed, §Base move).
- Callers: wild 14, aid (Haven-door) 13, other (contest/ephemeral
  contact, no world tile) 3.
- Patterns: NEARBY-NEVER-JOIN 26, PERIPHERY 3, SOLO 1,
  JOIN-TOO-LATE 0, JOINED 0.
- Party size at meeting: **1 on all 30** (rec.partySize = 1).
  Offered pool: **0 allies on all 30** (opts.allies = 0,
  allyVids empty). Outdoor crew at meeting time: **empty on all
  30** (live assignments and _outdoorCrew snapshot both empty;
  fighter assignment null on 29/30, 'fish' on the one evade).
- Co-presence actually measured (node distance, living roster
  only): same-node villager-presences 38, adjacent 70, across the
  band. 21/30 meetings had >= 1 villager on the SAME node as the
  fighter; 26/30 had >= 1 on the same or an adjacent node.
  Neighbour trust values run 35–93 — nearly all above the
  party-wiring answer floor of 15, so trust does not explain the
  non-joining. **Zero meetings had any defaulted node entry** —
  the Haven-default caveat in the prereg never bites: every
  same-node count is a real recorded node position, not a default.
- Fight shape: rounds 0 (evades) 3, round 1: 16, round 2: 10,
  round 3: 1. 26 of 27 fought meetings end by round 2. 6 of the 7
  deaths happen in round 1. Intent: learn-first 18, engage 12.
  Even a working shout would usually have no round left to arrive
  in — and the shout's own gate (hopeless + intent != learn)
  excludes the 18 learn-first fights from calling at all.
- Offered-vs-colocated gap: 0 named allyVids in the band, so the
  gap is undefined, not zero — there is no offered pool to compare
  against co-location. The finding is one level up: the offer
  channel itself is dry.

## Why nobody joins (mechanism, read from code + measured)

The field-fight join machinery exists but its ONLY input pool is
the outdoor crew: wild/patrol callers pass every villager on an
outdoor assignment this part (trust-ordered, 2 named). Node-mates
— the villagers actually standing where the fight happens, the
perception-grounded pool — are never fed into opts.allies /
allyVids. And the crew pool is empty at every measured fight:
assignments resolve (and delete) before the encounter tick runs,
or this policy stack simply never holds outdoor assignments at
fight time; either way the measured fact is crew = 0 on 30/30.
So the shout has nobody to call, the one-ally join never fires,
and a villager fights alone on a node full of neighbours. This is
NOT a claim that the crew rule is list-fed and must be replaced
with a roster: the crew rule is "out together," a legitimate
co-presence channel — it is just never populated when fights
happen, while the other co-presence channel (same node, the
wild-encounter router's own npcIds) is never offered to the fight.
A future lever on this channel would need to feed a
perception-grounded pool (same-node / earshot villagers, or a
crew snapshot taken at fight time rather than at assignment
resolution) into the existing shout machinery — that design is
for a lever arm, not decided here, and any such pool must stay
sense-grounded, never a roster list.

## Scholar TB contrast (same band, same seeds)

- Wave-4 TB fights started: 28 (matches killconv's 28 started;
  killconv's larger engagement counts include refused Herald
  attempts). End won 2, other 26.
- Companions present at fight start: 0 on 20 fights, 1 on 6, 3 on
  1, 4 on 1; mean 0.46. The scholar's fights are also usually
  solo — but through a different rule: TB joiners come from grid
  positions within 4 squares, and the scholar is usually alone on
  the grid.
- Formal party size at every TB start: **0 on all 28**. Overlap
  between companions and formal party: 0. This policy stack never
  holds a formal party at all (no invites are issued by the
  driver), so the TB contrast is "grid joiners, not party
  members" — and the two TB wins in this band both started with
  exactly 1 companion (n = 2, descriptive only, not a claim).
- The scholar's side therefore does NOT demonstrate the demanded
  party either: Steve's wave-4 demand (a party, fully geared) is
  unmet on both sides of the wall — villagers fight alone in the
  wild, and the scholar usually fights alone on the grid.

## Wall numbers (fresh band, this base)

- Seeds: 16 (pilot 85101–85108 + confirm 85109–85116, single policy
  stack: withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  200d death-aware cap; no seed hit the cap).
- National: 8/16. Table reached: 12/16. Wins: 11/16 — ALL lesser
  seats (full seat 0/16 by killconv's deedGate finding on its
  base; deedGate not re-read here — this arm measures party, not
  the gate).
- Wave 4 unlocked: 9/16. Wave 5 unlocked: 0/16.
- Wave-4 field kills: 0/30 meetings. Wave-4 TB wins: 2/28 started.
- Median survival: 111 game days. Max: 139.

## Base move (read before quoting killconv comparisons)

Killconv's anchor was 1bd7865a4; this worktree's HEAD is 359a384cc.
Exactly ONE src/js change sits between them: 72512906f
(sim-titanexcl-a: titans excluded from the castMonster pool).
15 of 16 seeds reproduce killconv exactly (same game days, same
meeting counts). Seed 85112 diverges: killconv days 139 / ff4 8 /
TB eater-won day 49; this band days 90 / ff4 3 / TB algorithm-lost
day 49, with daily hashes identical through day 48 and diverging
at day 49. Control run (killconv's own sweep + instrument, on THIS
base, seed 85112, /tmp output): days 90 / ff4 3 / identical day-49
hash — killconv's instrument on this base reproduces MY
trajectory exactly. The divergence is therefore the landed titan
exclusion shifting a cast draw, NOT this arm's instrument. The
band is valid on the current base; killconv comparability holds
for 15/16 seeds, with 85112 explained, not hidden. Wall-number
deltas vs killconv (national 8 vs 7, median 111d vs 113d) are
entirely the 85112 trajectory change.

## What the village looked like, in plain words

A villager meets a wave-4 beast in the wild and fights it alone —
even when the fight happens at Haven's own door, even when four
neighbours stand on the very same ground and more stand next to
it, even when those neighbours trust the fighter deeply. Nobody
runs over, nobody shouts back, because the fight was never offered
anyone to call: the only list the fight engine accepts was empty,
and the people actually there were never put on it. Most fights
are over in one or two rounds — a single crushing blow, or a
quick flight — so even if someone had been offered, there would
barely have been time for them to arrive. The scholar, meanwhile,
walks into wave-4 fights alone too: no formal party ever forms
under this way of playing, and the few companions who do join
from nearby squares are the exception, not the party Steve's
wave-4 demand imagines. The wall is not "villagers are cowards" or
"nobody is nearby." People are nearby. The village just never
fights together.

## Sense-testing (meeting records read in full, not just counted)

- SOLO (s85103 day 112, gen_3tyslb0 vs suburb, evade): one line —
  "Molly saw The Suburb in time and gave it room." Nobody within
  two nodes. A lone sighting that ends in room given, not a fight.
  Sensical as solo: there was nobody to join, and nothing to join.
- NEARBY-NEVER-JOIN, wild (s85106 day 113, visjoin_105 vs herald,
  vFlee, 1 round): one round — the beast hits for 48 (9 HP left),
  the fighter strikes 20 against 293 HP, and runs "while running
  still works." Four villagers on the same node (trust 65–90) and
  one adjacent (90) stand through it. The log also notes a
  crossbow with no arrows — the fighter was under-equipped as
  well as alone. Reads as a real, lonely, unwinnable meeting.
- PERIPHERY (s85107 day 78, leo_martin vs algorithm, evade): eight
  villagers at distance 2 — the Haven crowd two nodes away from a
  fighter at (2,6) — and the fighter gives the beast room. Nobody
  at distance 2 can hear a shout or see a fight; the evade is
  honest, and the distance-2 cluster is home, not a party.
- NEARBY-NEVER-JOIN, aid (s85109 day 91, xavier_dubois vs eulogy,
  vDie, 1 round): at Haven (4,4), two villagers on the same node
  (trust 90, 90) and two adjacent (80, 35) — and Xavier dies to a
  single 38-damage blow, striking nothing (a sling with no arrows
  again). Death in round 1 leaves no round in which help could
  have arrived even if offered. The aid caller — the fight that
  should most look like a village defending itself — reads as a
  solitary death in a crowd.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The prereg's INSUFFICIENT-DATA rule keys pilot reproduction to
   killconv's counts. It held for the pilot (exact), but the base
   moved under the confirm seed 85112 via a landed game change.
   Next run's prereg should pin the anchor commit explicitly and
   state the base-move rule up front (re-run the control on any
   divergent seed before doubting the instrument).
2. "Offered-vs-colocated" as defined needs a non-empty offered
   pool to be informative; when the pool is empty on every
   meeting, the metric collapses to "the channel is dry." Next
   run should pre-register the dry-channel case (pool empty on
   >= 90% of meetings) as its own finding rather than an
   undefined ratio.
3. Node distance is the right unit for wild/aid meetings, but
   'other'-caller meetings (contest/ephemeral, no world tile)
   have no tile to anchor co-presence to — their node buckets
   still read (fighter node exists), but "same node as the
   monster" is unmeasurable there. Only 3/30 meetings are in this
   class; none of them changes the verdict.
4. Round counts cap the join question from below: with 26/27
   fought meetings ending by round 2, a future join lever must be
   judged on whether help is present FROM THE START (round 1),
   not on mid-fight shout latency — shoutRound has no variance
   to measure until fights last longer.

## Convergence state

converging (measurement, not a lever): the scale-onramp axis now
has a measured answer for the party-presence channel — nearby but
never joining, 26/30, with the offer channel dry on 30/30. The
next work on this channel is a lever that feeds a
perception-grounded pool into the existing join machinery (or
proves the crew snapshot timing is the whole story), not a
damage or bravery tune: no amount of courage helps a fighter the
fight never offered anyone to.

## Coordinator follow-ups (not done here — coordinator owns landing)

- Merge: evidence + prereg + instrument + sweep + analyzer + proof
  test + corpus (all to be committed on sim-w4party-a). No
  game-code change, so "measurement only" in substance — but the
  corpus + instrument should land as the baseline for the next
  lever arm on this channel.
- Telemetry deviation check (loop step 10) against
  hidden_files/telemetry-baselines/scale-wall.json — left to the
  coordinator after landing, since the baseline roll-forward
  decision belongs to the run, not the arm. Note the wall deltas
  vs killconv (national 8 vs 7, median 111d vs 113d) are the
  explained 85112 base-move effect, not a new deviation.
- Suggested findings-backlog item (coordinator to append, not
  appended here — this arm's own finding, not an off-axis gap):
  field-fight offer pool is crew-only and empty at fight time
  while node-mates stand by — the party-presence channel result.
