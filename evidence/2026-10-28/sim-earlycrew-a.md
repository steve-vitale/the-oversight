# sim-earlycrew-a — the walked-out-together crew: does presence at fight start make a party?

Run: fleshout loop, axis scale-onramp (blocking axis). Worker:
sim-earlycrew-a. POLICY ONLY — zero src/js behaviour change, no
monster-stat / wave-gate / table-gate / spawn-rate change.
Default-OFF policy (EARLYCREW=1 only); this arm's verdict is
NO-GO, so the policy variant was DELETED from the final tree
(see "What was deleted"), leaving instruments + evidence +
corpus. The policy file survives in branch history (instruments
commit) for any re-run; the sweep and sense scripts say so when
the module is absent.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-earlycrew-a-prereg.md (commit b52a8010a,
plus a pre-sweep amendment in the instruments commit f4f0cf63f —
see "Perception-law amendment" below). Instruments:
scripts/policies/earlycrew.js (DELETED at verdict),
scripts/test-earlycrew-a-sweep.js (lean sweep),
scripts/test-earlycrew-a.js (analyzer / verdict judge),
scripts/test-earlycrew-a-proof.js (mechanism proof, rewritten
after the verdict to prove the crew path with direct engine
assignments so it stays green on the final tree),
scripts/test-earlycrew-a-sense.js (non-measured replay only).
Recorder: scripts/policies/fieldparty-form-diag.js reused
VERBATIM. Corpus:
evidence/2026-10-28/perseed-earlycrew-a/ (8 rows + summary.json).
Sense log: evidence/2026-10-28/sim-earlycrew-a-sense.log.
Det-gate: PASS (seed 75101, full 180d death-aware: layer OFF =
plain tableseat-nowait, days 132/132, tsNationalDay 77/77 — exactly
the 1528 control seed's numbers).

## Plain words first

No. A crew-mate standing on the very tile does not make the
fight start as a party fight. The fight still starts solo, and
at wave 4 it still ends solo — in one or two rounds, before any
shout can exist.

This arm sent villagers out in pairs, on forage outings, every
part of every day — 1,881 pairs, 3,839 villagers sent out — and
the crew path filled exactly as it did for outdoorcrew-a: 629
of 907 meetings crewed, 17 of 19 judged wave-4 field meetings
with a crew-mate in the fight's own input. New here is the tile
lens: in 13 of the 19 judged meetings, another villager was
physically standing on the monster's tile when the fight
started — in 11 of them, that villager was also the crew-mate.
They were there. They were seen, in the engine's own sense:
the meeting itself was triggered because a villager stood on
that tile. And in all 13, the fight began with one fighter, no
ally in from round 1, and ended the same way — fled (9 of 19)
or dead (10 of 19), never joined, never a kill.

The proof test pins why, at code level, so this is not a
maybe: a wild meeting whose crew-mate is both in _outdoorCrew
AND standing on the monster tile still receives
allyFromStart=false from resolveWildMonsterEncounter — the
wild router never passes that flag. The only caller that sets
it is aidFight, for foreign help-at-door during an aid crisis.
The capability exists (a direct fieldFight call with
allyFromStart:true puts the ally in from round 1, log line
"already at the door"), but the wild path cannot reach it.
Presence at fight start changes nothing about how the fight
starts; only the hopeless shout can add a fighter, and wave-4
fights end before hopelessness ever registers (everHopeless
false on all 19 judged meetings, 17 of them 1-round fights).

## Verdict: NO-GO, sub-class CREWED-NO-FIGHT + GAME-CODE-NO-GO on from-start (binding prereg, no re-score)

- Primary: FOUGHT-AS-PARTY (crew-present, calledHelp AND
  joinedAllyVid) = 0, field kills = 0; GO required >= 2 fought
  OR >= 1 kill. FAIL (deciding leg).
- Meeting-floor leg: judged = 19 >= 4, MET — this is not an
  opportunity failure. The band had 19 chances, 13 of them
  tile-crewed, and none fought as a party.
- Party-at-start (the arm's distinct question): 0/19 judged,
  0/907 all-waves. The answer to "without waiting for a shout
  at all" is no, on every meeting this band produced.
- Guards: median 118d FAIL (bar >= 120d); starvation 1 PASS
  (bar <= 3). Guards failing does not change the verdict —
  the primary already failed — but the median leg is reported
  as failed, not hidden behind the primary.
- No confirm band was run (kill-fast rule in the prereg: a
  failed pilot spends nothing further). Policy variant deleted;
  instruments + evidence only.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101–75108, tableseat-nowait verbatim PLUS the
  earlycrew layer (EARLYCREW=1), LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, 180d death-aware.
- Corpus validity: 8/8 rows, days > 0, recorder errs 0, no
  overflow (sweep summary: CORPUS PASS). Courtship substrate:
  combined 108, 8/8 seeds active — the shared substrate
  reproduced exactly (outdoorcrew-a also 108).
- The pilot band reproduces outdoorcrew-a EXACTLY on every
  headline number (see "Reproduction note"): same trajectories,
  because the final policy differs from outdoorcrew-a only in
  ctx key names (ec* vs oc*), which draw no RNG. That is a
  reproducibility result, not a copy: an independent re-run
  of the same mechanism lands on the same 907 meetings, the
  same 19 judged meetings, the same wall.

## Wall numbers (THIS band vs 1528 control)

| field | this band (75101–75108) | control |
|---|---|---|
| national ever / final | 6/8 / 4/8 | 7/8 / 6/8 |
| table invited / entered | 3/8 / 2/8 | 4/8 / 3/8 |
| wins (lesser / full) | 2/8 (2 / 0) | 3/8 (3 / 0) |
| wave-4 reach / wave-5 | 7/8 / 0/8 | 6/8 / 0/8 |
| median survival | 118d | 146d |
| deaths total / starvation | 306 / 1 | 286 / 1 |
| courtship combined | 108 | 110 |

Per-seed: 75101: 92d, won (lesser); 75102: 107d; 75103: 109d;
75104: 90d, won (lesser); 75105: 165d; 75106: 180d; 75107: 129d;
75108: 118d. (Identical to outdoorcrew-a per-seed, see above.)

## The formation table (the judged measurement)

JUDGED SET: wave 4, channel field, caller resolve / patrol /
aid, leader a villager (the 1528 set). CREW-PRESENT = filtered
crew non-empty (crewRaw minus the leader — the engine's own
filter). TILE-CREWED = tile[] non-empty (another roster
villager on the monster tile at fight start, pure nodePos
read). PARTY-AT-START = allyFromStart true AND joinedAllyVid
non-null. FOUGHT-AS-PARTY = calledHelp true AND joinedAllyVid
non-null (strict, as outdoorcrew-a; the old OR definition is
not used — on this band calledHelp and joined coincide
wherever either fires, so the stricter definition changes no
count, and it is stated so the next arm cannot mistake it).

| class | n / 19 | meaning |
|---|---|---|
| CREW-PRESENT | 17 | crew-mate in the fight input |
| TILE-CREWED | 13 | another villager on the monster tile |
| TILE-CREWED + CREW-PRESENT | 11 | both lenses agree |
| PARTY-AT-START | 0 | no ally in from round 1, ever |
| FOUGHT-AS-PARTY | 0 | no second fighter at any point |
| CREWED-NO-FIGHT | 19 | every judged meeting: crew and/or tile present, no party fight |
| PARTY-SIZE>=2 (secondary) | 17 | engineAllies >= 1 — the engine counts the party even when nobody joins; reported, never substituted for FOUGHT-AS-PARTY |

Outcomes on the judged set: vDie 10, vFlee 9, vKill 0.
Rounds: 1 (15) or 2 (4) — never more. everHopeless: false on
all 19. Intent: engage 18, learn 1 (the d107 eulogy meeting,
tile-crewed but uncrewed, which withdrew as a learn fight).
Field kills by channel (wave-4 meetings): none.
Wave-4 meetings, all channels: judged 19 are the field set;
all-waves mechanism: crewRaw non-empty 633/907 meetings,
filtered crewed 629/907 (control raw 0/1,272).

Wave-3 contrast (same band, same policy, same crew path):
16 field meetings, 8 formed (all via the hopeless shout,
rounds 3–5, then all fled). The shout works where fights last;
wave-4 fights do not last.

## CREWED-NO-FIGHT breakdown (every meeting, reason counts)

Reason counts (all 19 share fromStart=false and
everHopeless=false — those two legs never vary, which IS the
finding):

- rounds=1, hopeless=false, intent=engage, vFlee, tile=true: 6
- rounds=1, hopeless=false, intent=engage, vDie, tile=true: 5
- rounds=2, hopeless=false, intent=engage, vDie, tile=false: 3
- rounds=1, hopeless=false, intent=engage, vFlee, tile=false: 2
- rounds=1, hopeless=false, intent=engage, vDie, tile=false: 1
- rounds=2, hopeless=false, intent=engage, vDie, tile=true: 1
- rounds=1, hopeless=false, intent=learn, vFlee, tile=true: 1

In plain words: the dominant reason is not "nobody was
there" (tile=true on 13, crew on 17) and not "the shout was
refused" (no shout was ever uttered — calledHelp false on
all 19). It is fight length plus a missing from-start rule:
1-round fights cannot shout, and nothing joins at fight
start. The two 2-round tile-crewed deaths (75108 d96 eater,
crew of 2; 75103 d68 algorithm, aid-routed) are the sharpest
instances: two crew-mates in the input, a villager on the
tile, and the leader still dies alone in 2 rounds.

Full per-meeting list (analyzer output, reproduced in the
evidence corpus): 75103 d64 Tom vs audit (crew Olivia,
vDie 2r); d66 visjoin vs audit (tile 4, crew Olivia, vFlee
1r); d67 algorithm x2 (tile 3, crew Olivia, vFlee+vDie 1r);
d68 algorithm x3 (tile 3/2, crew Olivia, vDie 1–2r); d69
Luis vs algorithm (tile 1, crew Olivia, vFlee 1r); d72 Luis
vs algorithm (tile 3, crew Olivia, vFlee 1r); d80/d81 Mia
vs suburb (tile 1, crew Olivia, vFlee 1r); d88 Mia vs suburb
(crew Olivia, vFlee 1r); d93 visjoin_82 vs suburb (tile 3,
NO crew, vDie 1r); d107 visjoin_103 vs eulogy (tile 1, NO
crew, learn-intent vFlee 1r); 75105 d146/d147 visjoin_143
vs suburb (crew Ruth, vFlee+vDie 1r); d148 visjoin_136 vs
suburb (tile 1, crew Ruth, vDie 1r); 75107 d118 vs eulogy
(crew Luis, vDie 2r); 75108 d96 vs eater (crew Ines+Ursula,
tile Olivia, vDie 2r).

## Perception-law amendment (before any judged sweep)

2026-10-28 12:48 CDT, after the prereg's first commit and
before any judged run, Steve ruled the PERCEPTION LAW:
villagers know who is around only through their own senses
(seeing someone in the same place, hearing a shout, following
someone they have seen); no global roster or "who is around"
list fed into a decision; the field-feed fix stays reverted;
list-feed arms stop. This arm's prereg as first committed
contained a tile-pair preference (scan nodePos to pick a pair
already sharing a tile). That scan is exactly a global
"who is around" list feeding a decision, so it was REMOVED
before any judged sweep (prereg amendment, instruments
commit). The final policy picks its pair trust-descending —
the scholar sends two people out together, an in-person
leadership verb — and the tile lens survives as MEASUREMENT
only (the recorder reads nodePos after the fight, to census
what happened, never to decide anything in the game).
ecNodePairs therefore counts 0 throughout, as the prereg
amendment says. Consequence for the next arm, stated plainly
for the coordinator: under the perception law, the from-start
join this arm proves missing must be designed as a
PERCEPTION rule (a mate the fighter can SEE on the tile
joins — or is offered the choice — from round 1), not as
another list feed. The _outdoorCrew list itself is engine
history, not this arm's invention, and whether it survives
the perception law is a coordinator/Steve call, not decided
here. This arm's measurement stands either way: tile presence
— the perception-correct case — was tested directly, and it
does not start a party fight under current code.

## Canon section — NO MAGIC LISTS / PERCEPTION LAW (Steve 2026-10-28 12:48 CDT, coordinator update)

Ruling, as received from the coordinator (standing, applies to
this arm): villagers are real people with eyes — they know who
is around only through their own senses: seeing someone in the
same place, hearing a shout, following someone they have seen.
No global roster or "who is around" list fed into a decision.
The field-feed fix was that pattern and stays reverted;
list-feed arms stop. Party formation must be solved through
perception, not lists. This fits Steve's standing "if you don't
know, it doesn't show."

What it means for THIS arm (coordinator's framing, adopted
here): a crew that walks out together and is in the same place
sees each other — that is legitimate perception, not a list
feed — so this arm's walked-out-together design stays in scope
as framed. But crew presence must come from actually being
together (same outing, same tile), and the measurement must
show presence that way. If the engine can only express "crew
present" via a roster list, that is documented here as
perception-blocked rather than used as presence.

Perception-legitimate re-read of the pilot corpus (supplementary
to the prereg verdict, never a re-score of it — the prereg's
crew-present definition and NO-GO verdict stand as judged; this
section shows the verdict is unchanged under the stricter
perception definition, because both numerators are 0):

| presence class (judged set, n=19) | n | fought | from-start |
|---|---|---|---|
| SAME OUTING + SAME TILE, SAME PERSON (tile entry is itself a crew-mate: the fighter could SEE their outing partner on the tile) | 5 | 0 | 0 |
| Crew-list-only (crew-mate in the _outdoorCrew list, NO crew-mate on the tile — the fighter could not see them) | 12 | 0 | 0 |
| Tile-only (someone on the tile, no crew at all — a seen bystander, not an outing partner) | 2 | 0 | 0 |

The 5 perception-legitimate meetings are all 75103, all
Olivia Bennett as the outing partner, all 1 round, all
everHopeless=false: d66 audit (vFlee), d67 algorithm x2
(vFlee, vDie), d68 algorithm x2 (vDie, vDie). All-waves, the
same-person tile+outing class is 83/907 meetings. The
perception-legitimate subset clears no floor of its own (the
prereg's floor leg applied to the judged set, 19, and is
unchanged), but 0/5 with 1-round fights is the same shape as
0/19 — presence the fighter could see still starts no party
fight.

Perception-blocked, documented (not used): the engine can only
express "crew present" to a fight via the _outdoorCrew roster
list — resolveWildMonsterEncounter / resolvePatrol build
allyVids SOLELY from that list, and fieldFight has no
tile-seen input at all. So (a) the 12 crew-list-only meetings
do NOT count as "present" under the perception law (same
outing list, different ground — the fighter sees nobody), and
(b) even the 2 tile-only seen bystanders have no engine path
into the fight, because the wild router never reads the tile.
The recorder's tile lens is measurement only: it reads nodePos
after the fight to census what happened; it never feeds a
game decision, and it must never be mistaken for a game input.
This arm's policy already complied with the law as amended
(no node scan, pair via the in-person assign verb); the only
list in play is the engine's own _outdoorCrew input, which
this arm measures but does not create beyond the outing
assignments themselves (the assignments ARE the outing).

Consequence, restated for the next arm: the from-start join
this arm proves missing must key on a SEEN tile-mate (same
place, same moment — the 5-meeting class above is its exact
test set), not on any list. A rule that joins "whoever is in
the crew list" would violate this canon even if it formed
parties; a rule that joins "the outing partner standing on
the tile with you" would satisfy it. The proof test's router
gap (allyFromStart never passed by the wild router) is
therefore also the perception gap: there is currently no
seen-mate input to fieldFight at all.

## Sense note (75103, NON-MEASURED replay, window d60–d107)

The replay's taps land on the corpus's meetings (the
narration-shifted replay still walks the same ground: d66
audit, d67–d68 algorithm run, d80–d88 suburb, d93 suburb
uncrewed, d107 eulogy — leader ids shift with narration, the
monster/day/crew shape matches), so the wording judgment is
grounded in the judged meetings, not invented.

A tile-crewed wave-4 fight reads exactly like a solo fight.
The d66 tap: leader vs audit, crew Olivia, allies=1,
outcome vFlee, 1 round, calledHelp=false. No line names
Olivia, no line says she was there, no "nobody came" beat —
the fight's narration is indistinguishable from a lone
villager's. Contrast the same replay's wave-3 shout, d84
visjoin_82 vs callback: crew Olivia, 3 rounds,
calledHelp=true, allyVid=Olivia — when the shout fires, the
mate's arrival IS a beat. At wave 4 it never fires, so the
present crew is invisible twice over: mechanically (no join)
and fictionally (no mention). Outings read as before —
singular lines ("Ella heads out to forage. 'Back before
dark. Probably.'", "Greta heads out to forage.") — never
"Ella and Greta head out together." The one joint phrase
remains the engine's throttle line. Sense verdict: a player
watching this band would never know a crew existed, let
alone that a crew-mate stood on the tile. That invisibility
is the sense version of the mechanism finding, and under
the perception law it matters more, not less: if the fiction
never shows the mate, the player cannot even judge whether
the mate SHOULD have joined.

## Metric review (filled at judging time)

- PRIMARY DEFINITION HELD, STRICTER THAN OUTDOORCREW-A.
  FOUGHT-AS-PARTY required calledHelp AND joinedAllyVid
  (outdoorcrew-a used OR). On this band the stricter
  definition changes no count (no meeting fires either leg),
  but it is the definition the next arm should keep: a party
  is a second fighter fighting, not a flag.
- MEETING-FLOOR LEG WORKED AS DESIGNED. Judged 19 clears
  the floor by a wide margin, so NO-GO here is a mechanism
  verdict, not an opportunity verdict — the floor leg's
  purpose was exactly to force that distinction, and it did.
- MEDIAN GUARD (118d vs 120d bar). The guard fails by 2 days
  while starvation passes easily. The direction matches
  outdoorcrew-a (118d, same trajectories): outings cost
  survival on this band, they do not buy it. A future outing
  arm should pre-register a no-worse-than-control median leg
  alongside the floor, as outdoorcrew-a's metric review
  already suggested.
- REPRODUCTION NOTE. The band reproduces outdoorcrew-a
  byte-for-byte on headline numbers (907 meetings, 19 judged,
  17 crewed, 0 formed, wall 6/4/3/2/2/7/0/118/306/1) because
  the final policy is mechanism-identical to outdoorcrew-a
  (pair outings, trust-descending, same guards); only ctx
  keys changed, and ctx keys draw no RNG. Any future arm
  claiming a different result from a "new" outing policy
  should be checked for a real mechanism delta first —
  same-mechanism re-runs reproduce exactly, which is a
  feature of the harness, not a bug in either arm.
- PANEL. scripts/balance-panel.js `compare` was attempted:
  it requires --before/--after panel.json.gz artifacts, which
  are produced by the panel driver (sweep-compare observer
  runs), not by this arm's census recorder — there is no
  census-ingest mode, and no artifact was fabricated to
  satisfy it. Standing exception as in 1415Z/1528Z/1628Z:
  paired before/after tables (this band vs the 1528 control,
  identical seeds/substrate) are the §15 substitute. The
  panel produced no verdict to report, quirky or otherwise;
  that absence is reported here, not hidden behind a table
  dressed as a panel result.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus path
  for the coordinator's check is
  evidence/2026-10-28/perseed-earlycrew-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in 1628Z: the
  baseline's regime does not match this substrate, and
  per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The corpus's real
  wall numbers are nationalEver 6/8, entered 2/8, wins 2/8.
  Baseline NOT rolled by this arm; the coordinator judges
  any LOUD lines.

## Blanks filled or documented

FILLED (by measurement, then reverted on NO-GO): the
from-start question, answered NO on both halves — a crew
present at fight start (crew list) does not start a party
fight, and a crew-mate physically on the tile does not
either. The router gap is proven at fixture level (proof
test), not just inferred from the band.
DOCUMENTED (not chased, for the next arm + backlog):
1. PERCEPTION-BASED FROM-START JOIN (the next blank, in
   order): under the perception law, the rule to design and
   measure is a seen-mate join — a crew-mate the fighter can
   see on the tile joins (or is offered) from round 1. That
   is a game-code change, out of scope for any policy-only
   arm; its prereg should judge PARTY-AT-START on
   tile-crewed meetings, with CREWED-NO-FIGHT as the named
   failure class, and should NOT re-litigate the shout gate
   (already measured twice: fights end before hopelessness).
2. NARRATION BLANK (unchanged from outdoorcrew-a): joint
   outings have no joint line, and tile-present crew-mates
   are never named in death/flee lines. Under the perception
   law, a seen-but-silent mate is worse than a listed-but-
   silent one — the fiction must show what the fighter sees.
3. WALL COST (unchanged): outings soften the wall on this
   band (median −28d, deaths +20, wins −1 vs control) while
   buying zero field parties. Any future outing arm carries
   that cost in its prereg.

## What was deleted (NO-GO discipline)

- scripts/policies/earlycrew.js — DELETED from the final
  tree in the closing commit. It remains in branch history
  (instruments commit f4f0cf63f, plus the proof run's
  PROOF-GREEN output quoted in the proof header) for
  re-runs; the sweep and sense scripts exit with that
  pointer when the module is absent.
- Left in tree: sweep, analyzer, proof (rewritten to prove
  the crew path with direct engine assignments, so it stays
  green without the policy file), sense script, prereg,
  this evidence, corpus, sense log.

## Infrastructure notes

- Proof test (pre-deletion run): PROOF-GREEN — policy ON
  assigned a pair via upkeep (ecPairs 1, ecAssigned 2),
  policy OFF clean (no assignments, no ec* keys), snapshot
  carried the pair, tile-present crewed wild meeting passed
  allies=1 with the mate named and allyFromStart=false,
  direct allyFromStart fieldFight put the ally in from
  round 1 ("already at the door"), solo control allies=0.
  Post-verdict, the committed proof test proves the same
  crew path + router gap with direct engine assignments
  (no policy file needed) and re-ran green on the final
  tree.
- Safe-commit index clobber hit both worker commits (prereg
  and instruments) — repaired each time via HEAD-blob
  `git update-index --add --cacheinfo` with hash
  verification, never `git reset`. No ref surgery; the
  container .git EPERM flap did not strike this run.
- check.js --quick NOT re-run: zero src/js, zero green-list
  files (standing profile as in 1628Z); new scripts pass
  `node --check` and the proof test green.
- No push, no bump, no live verification (ship-loop line).
  Ready for coordinator merge, pending ship — via the
  coordinator.

## Convergence

scale-onramp stays converging (NOT converged): the feed half
was closed in 1628Z, and this arm closes the presence half —
being there, on the tile, does not start a party fight — but
the wave-4 party itself still never fights (0 fought, 0
field kills, full seat 0/8, wave 5 0/8). The directive stands
until the tracker records this axis converged on measured
evidence. Next blank in order: a perception-based from-start
join rule (item 1 above), designed under Steve's 2026-10-28
perception law, not as another list feed.
