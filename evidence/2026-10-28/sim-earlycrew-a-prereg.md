# sim-earlycrew-a — PRE-REGISTRATION (binding, committed BEFORE any judged sweep)

Run: fleshout loop, axis scale-onramp (blocking axis). Worker:
sim-earlycrew-a. POLICY ONLY — zero src/js behaviour change, no
monster-stat / wave-gate / table-gate / spawn-rate change. Default-OFF
policy (EARLYCREW=1 only); on NO-GO the policy variant is DELETED
from the final tree, leaving instruments + evidence + corpus.

## Question (different from the two 1628Z arms)

Prior runs established: wild/patrol meetings never saw the party on
the tile (1528Z); a presence feed formed parties that retreated,
and a joint-outings policy (outdoorcrew-a) fed 633/907 meetings but
0/19 judged wave-4 field meetings formed, because meetings ended
rounds 1-2 before the hopeless-shout branch fired. The open
question for THIS arm is different: if a crew walks out TOGETHER
(same outing, same tile) and is already present on the tile when a
wave-4 beast is met, does the fight start as a party fight WITHOUT
waiting for a shout at all?

Code facts read BEFORE designing (never invented, to be proven by
the proof test, not assumed in the verdict):
- game.js resolveWildMonsterEncounter / resolvePatrol build
  allies/allyVids SOLELY from Game._outdoorCrew and pass NO
  allyFromStart flag to fieldFight.
- fieldFights.js fieldFight joins an ally from round 1 ONLY when
  opts.allyFromStart is set; the only caller that sets it is
  aidFight (comms.js, foreign help-at-door during an aid crisis).
- game.js villagerMonsterTick picks at most ONE villager from
  npcsOnNode(monster tile) per tick (50% skip) — co-located
  villagers meet one at a time, never as a group call.
So the honest prior is NO-GO-by-construction for the from-start
half of the question; the pilot measures whether any engine path
contradicts that reading, and whether a tile-present crew ever
fights as a party at all (shout or otherwise).

Retrospective note (context, NOT the judged result): re-reading
the outdoorcrew-a corpus (perseed-outdoorcrew-a) through the tile
and from-start lenses this arm adds, 13/19 judged meetings were
tile-crewed (another roster villager on the monster tile at fight
start), 11/19 both tile-crewed and crew-listed, from-start 0/19,
fought-as-party 0/19. That corpus was judged under a different
prereg and is quoted here only as the reason this arm's tile lens
exists; this arm's verdict rests SOLELY on its own pilot band.

## Prior numbers (control, 1528Z/1628Z)

Shared band, tableseat-nowait verbatim, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, 180d death-aware: field meetings 24 all solo,
field kills 0, wall natEver 7/8, wins 3/8 all lesser, full 0/8,
wave-4 6/8, wave-5 0/8, median 146d. Outdoorcrew-a pilot (same
seeds, pair outings): judged 19, crewed 17, formed 0, median 118d,
starvation 1, wins 2/8.

## Substrate (verbatim, pilot band)

Seeds 75101-75108, tableseat-nowait verbatim PLUS the earlycrew
policy layer (scripts/policies/earlycrew.js, EARLYCREW=1),
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, 180d death-aware
(runDays stops on death/win; 180 is the cap, never a fixed
horizon). Recorder: scripts/policies/fieldparty-form-diag.js
reused VERBATIM (it already records crewRaw, crew, tile[],
allyFromStart, calledHelp, joinedAllyVid, rounds, everHopeless,
intent, outcome — the exact lenses this arm judges).

## Policy (summary; the file is the spec)

earlycrew.js wraps tableseat-nowait: in upkeep (after base
upkeep), when EARLYCREW=1, the scholar is at Haven, the village
has >= 6 living roster, and no outdoor task is currently
assigned, it assigns a PAIR of free villagers (not scholar, not
gardenKeeper, alive, village.health >= 40 where known,
trust-descending) to `forage` via Game.assignTask(...,
{via: 'in-person'}), and counts attempts / assigned / refused in
ctx (ec*). When EARLYCREW is unset it delegates byte-identically
(det-gate below). One deliberate delta vs outdoorcrew-a: pair
selection PREFERS a pair already sharing a non-Haven node
(pure read of state.village.nodePos — never npcNode(), which
would create entries — and never a write or a teleport): if two
trust-eligible candidates already stand on the same non-Haven
tile, they are the pair, because they are already out together
on the ground, not just on the same assignment list. If no such
pair exists, selection falls back to trust-descending exactly as
outdoorcrew-a. NO RADAR: the policy never reads monster
positions and never routes anyone to a monster tile; the pair
preference reads only villager nodes, never beast tiles.
Willingness follows the existing engine gate (assignTask
checkObedience + <40 HP outdoor refusal); refusals are counted,
never forced. No src/js, no game numbers touched.

## Judged set (analyzer: scripts/test-earlycrew-a.js, sweep:
scripts/test-earlycrew-a-sweep.js)

Wave-4, channel field, caller resolve / patrol / aid, leader a
villager (the 1528/1628 judged set). Per meeting:
- CREW-PRESENT: filtered crew non-empty (crewRaw minus leader).
- TILE-CREWED: tile[] non-empty (another roster villager on the
  monster tile at fight start, pure nodePos read).
- PARTY-AT-START: allyFromStart true AND joinedAllyVid non-null
  (a second fighter in from round 1, no shout waited for).
- FOUGHT-AS-PARTY (strict, as outdoorcrew-a): calledHelp true
  AND joinedAllyVid non-null (a second fighter actually fights,
  whenever they joined). PARTY-SIZE>=2 (engineAllies >= 1) is a
  secondary ONLY, never substituted for FOUGHT-AS-PARTY.
- CREWED-NO-FIGHT: CREW-PRESENT or TILE-CREWED but NOT
  FOUGHT-AS-PARTY, broken down by reason: rounds (1 / 2 / 3+),
  everHopeless (true/false), intent, outcome, from-start flag,
  tile-crewed flag. Every such meeting is listed, never pooled
  away.

## PRIMARY METRIC (binding) — GO threshold

At least 2 judged wave-4 field meetings where a crew is present
at fight start AND the fight is fought as a party (not solo),
OR 1 wave-4 field kill. (Crew-present = CREW-PRESENT as defined
above; fought-as-party = FOUGHT-AS-PARTY as defined above.)

MEETING-FLOOR LEG (binding, checked before GO): if judged
wave-4 field meetings < 4, the verdict is
INSUFFICIENT-OPPORTUNITY, not GO — a thin band cannot pass a
working mechanism on opportunity alone, and cannot fail one
either. The primary count and the CREWED-NO-FIGHT breakdown are
still reported in full under that verdict.

PARTY-AT-START is reported as its own answer, never folded
into the primary: the count of judged meetings fought as a
party from round 1 is the direct answer to "without waiting
for a shout at all", whether the primary passes via shout
joins or not.

## GUARDS (all must pass for a LAND verdict)

- Median survival >= 120d.
- Starvation deaths total <= 3.

## SECONDARY (report only, never re-score against)

CREW-PRESENT count, TILE-CREWED count, PARTY-AT-START count,
PARTY-SIZE>=2 count, field kills by channel, joint-outing
frequency (ecPairs / ecAssigned / ecRefused / ecNodePairs per
seed, from ctx), wall numbers (national ever/final, table
invited/entered, wins lesser/full, wave-4/5 reach, median,
deaths, starvation), deaths by channel, wave-3 formed contrast.

## Verdict mapping (fixed in advance, no mid-run re-score)

- GO (LAND candidate): primary met AND meeting-floor met AND
  both guards pass on the pilot band. Then a confirm band
  (seeds 75109-75116, own control-policy run on the same
  seeds) is run; LAND requires the primary met on the confirm
  band too. If the confirm fails, verdict is pilot-GO-only,
  policy reverted, evidence-only.
- INSUFFICIENT-OPPORTUNITY: judged < 4 (floor leg), whatever
  the primary count. Policy reverted, evidence-only, no
  confirm spend.
- NO-GO: primary unmet with floor met. Policy variant deleted,
  instruments + evidence only, no confirm spend. Sub-class
  reported, not re-scored: CREWED-NO-FIGHT (crew/tile present,
  no party fight — with the reason breakdown) vs UNFED
  (CREW-PRESENT 0 and TILE-CREWED 0 despite ecAssigned > 0).
- DIAG-NO-GO: only if the band proves the crew path cannot be
  fed from the policy side at all (ecAssigned = 0 across the
  band despite attempts, blocking cause named).
- GAME-CODE-NO-GO (this arm's expected class, named in advance
  so it is not invented at judging time): if PARTY-AT-START is
  0 while CREW-PRESENT/TILE-CREWED meetings exist, the
  from-start half of the question requires a game-code change
  (wild/patrol routers passing allyFromStart for a tile-present
  crew-mate, or an equivalent from-start rule) — that change
  is OUT OF SCOPE for this policy-only arm. It is documented,
  the policy file is deleted, and NO game code is touched.
  A GAME-CODE-NO-GO on the from-start half does not by itself
  decide the primary: if shout-joined parties meet the primary,
  the primary verdict above still governs.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT
  run.

## Det-gate (before judging)

EARLYCREW unset on seed 75101, full 180d death-aware: layer-off
run must match plain tableseat-nowait on days/gameDays and
carry no ec* ctx surface. Recorder neutrality is already
proven by the 1528 arm's det-gate for the reused recorder;
this arm's det-gate covers the new policy layer only.

## Sense (SENSE-TESTING LAW)

Read at least one tile-crewed meeting transcript/replay and
judge meaning, coherence, relevance, consequences — never just
counts. Question: when a crew-mate stands on the tile and the
fight still starts solo, does the fiction acknowledge them at
all, or is the present crew invisible?

## Panel (§15)

scripts/balance-panel.js `compare` has no census-ingest mode
(standing exception as in 1415Z/1528Z/1628Z); paired
before/after tables (this band vs the 1528 control, identical
seeds/substrate) are the §15 substitute. The panel will still
be RUN where its inputs fit, and any verdict — including an
invalid/quirky one — will be reported honestly, not hidden
and not faked into a census artifact.

## Amendment (BEFORE any judged sweep — Steve ruling, not results)

2026-10-28 12:48 CDT, after this prereg's first commit and before
any judged run: Steve ruled the PERCEPTION LAW — villagers know
who is around only through their own senses (seeing someone in
the same place, hearing a shout, following someone they have
seen); no global roster or "who is around" list fed into a
decision; the field-feed fix stays reverted; list-feed arms stop.

Consequence for this arm, applied before judging: the prereg's
tile-pair preference (scanning state.village.nodePos to choose
the pair) is REMOVED. That scan is exactly a global "who is
around" list feeding a decision, and it does not survive the
ruling. The policy reverts to trust-descending pair selection
(the scholar sends two people out together — an in-person
leadership verb, not a map scan). The TILE lens survives as
MEASUREMENT only: the recorder reads nodePos for the census
after the fight, never to decide anything in the game. The
question itself is now perception-framed: a crew-mate standing
on the tile IS seen, so a from-start join for that mate would be
perception-consistent — which makes the measured from-start 0
(if it holds) a cleaner finding, not a weaker one: the gap is a
missing perception-based join rule, not a missing list. No
threshold, guard, floor, or judged-set definition changes with
this amendment; ecNodePairs counts 0 throughout (the key is
collected but never incremented) and is reported as such.

## Commit discipline

Policy file is default-OFF (EARLYCREW=1 only). A GO verdict
means GO CANDIDATE as an instrument, default-OFF only —
landing it as competent play is a coordinator/Steve call, NOT
made by this arm. If the policy change alters field combat
outcomes (it does if it forms parties): the landing commit
carries [needs-eyes].
