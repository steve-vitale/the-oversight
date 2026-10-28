# sim-perceptform-a — perception-based from-start formation: can a seen outing partner start the fight?

Run: fleshout loop, run fleshout-20261028T1942Z, axis scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-perceptform-a.
GAME CODE REVERTED (see "Revert status" — read it before merging
anything from this branch). Instruments + evidence + corpora only
on the merged tip, once the pending revert commit lands.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-perceptform-a-prereg.md (commit 1608dbc76).
Instruments: scripts/policies/earlycrew.js (substrate, DELETED at
closeout), scripts/policies/fieldparty-form-diag.js (stamp lens
added, additive only — kept), scripts/test-perceptform-a-sweep.js,
scripts/test-perceptform-a.js (analyzer / verdict judge),
scripts/test-perceptform-a-proof.js (DELETED with the revert —
proof lives in git history at the game-change commit 717ff8ed),
scripts/test-perceptform-a-sense.js (non-measured replay only).
Corpora: evidence/2026-10-28/perseed-perceptform-a/ (control +
armed, 8 rows each + summaries). Sense log:
evidence/2026-10-28/sim-perceptform-a-sense.log (excerpts from
the live replay run, not a re-typed transcript).

## Plain words first

The mechanism works. The wave-4 opportunity does not exist — not
in the form this arm defined it, and the reason is now measured
instead of guessed.

This arm gave wild fights the rule earlycrew-a proved missing: a
villager who walked out on an outing and is standing on the
monster's tile joins from round 1, no shout needed. In the wild
it fired twice — once for a clean 2-round kill (Oliver Moore +
Emma Larsen vs a wave-2 alien tick, day 69, seed 75101) — so the
stamp, the tile check, and the router wiring are all real, and
the proof test was green on the armed code.

But on the judged set — wave-4 field fights, the fights this
axis cares about — it fired zero times, and the reason is
structural, not a bug: a wave-4 field fight's leader is NEVER
the villager who walked out. In all 19 judged meetings, on both
bands, the leader was never in the outing crew (0/19
leader-in-crew, in earlycrew-a's corpus too, re-checked here).
Wave-4 beasts are met by villagers wandering the tile — visitors,
new joiners, passers-by — not by the pair the village sent out
to forage. So a rule that joins "your own outing partner"
has nobody to join at wave 4, however correct its wiring is.
The 5 meetings earlycrew-a called perception-legitimate were
never leader-partner meetings at all: in all 5, the SEEN
tile-mate was the crew member (Olivia Bennett, on the tile)
while the leader stood outside the crew. This arm's prereg
defined "same outing" strictly (the leader's own outing
partner); the measured class is looser (a tile-mate who is out
on an outing). That definitional gap — found by measuring,
not by re-scoring — is the finding the next arm inherits.

## Verdict: NO-GO, sub-class NO-PERCEPTION-OPPORTUNITY (binding prereg, no re-score)

- Primary: PARTY-AT-START-PERCEIVED (wave-4 judged) = 0,
  wave-4 field kills = 0; GO required >= 2 perceived-from-start
  OR >= 1 kill. FAIL (deciding leg).
- Meeting-floor leg: judged = 19 >= 4, MET — this is not an
  opportunity failure in the judged-count sense. The band had
  19 chances; the eligible class within them was empty.
- Guards (relative, as pre-registered): median 118d vs bar
  94.4d (0.8 × control 118d) PASS; starvation 1 vs bar 3
  (control 1 + 2) PASS. Guards passing does not rescue a
  failed primary.
- Audit leg: CLEAN — 0 audit-failing from-start meetings on
  the judged set. Every from-start join anywhere on the armed
  band (2, both off-judged-set) was audit-passing.
- No confirm band was run (kill-fast rule in the prereg: a
  failed pilot spends nothing further). Game code reverted;
  substrate policy deleted; instruments + evidence + corpus
  only (subject to the pending revert commit — see below).

## The change (what was built, in plain words — REVERTED)

1. A co-departure stamp, built in resolveAssignments at the
   same point the engine already snapshots the outdoor crew
   and rebuilt every part exactly like it: for each villager
   holding an outdoor assignment (patrol/scout/hunt/forage),
   the stamp records the day, the part, the task, and the
   OTHER assignees holding the SAME task that part. It records
   DEPARTURE only — never where anyone is now.
2. A helper, perceivedFromStartAlly: reads ONLY the fighter's
   own stamp, then checks each named partner one by one —
   still on the roster, not known dead, and a pure nodePos
   read (never npcNode(), which creates default entries)
   equal to the monster's tile. No crew-list read, no roster
   scan for who is around, no adjacent/earshot radius, no
   trust or gear gate.
3. Router wiring in resolveWildMonsterEncounter and
   resolvePatrol (non-aid path only): if a perceived ally
   exists, fieldFight is called with allyFromStart=true and
   that ally first in allyVids (crew list otherwise unchanged,
   surviving only for the untouched hopeless-shout fallback).
   Raid defense is exempt (opts.raid — raids have their own
   muster logic); the aid-crisis path is untouched (aidFight
   sets its own flag).

Files (REVERTED — see revert status): src/js/game.js only
(+89/−2: stamp block, helper, two router wirings). No monster
stat, wave gate, table gate, spawn rate, shout gate, or damage
number changed.

## Canon — perception law (Steve 2026-10-28 12:48 CDT)

NO MAGIC LISTS: villagers know who is around only through
their own senses. This arm complies by construction for the
rule it built: the ally is a remembered outing partner the
fighter can SEE on the tile, not a list feed. The field-feed
fix stays reverted; no list feed was revived. The crew list
survives only in the pre-existing shout fallback, exactly as
base code had it — from-start eligibility never read it
(proof leg 3 + leg 4 pin this: off-tile and different-task
villagers never pass, even standing on the tile).

## Control gate (substrate + base code, seeds 75101–75108, run BEFORE the game edit)

GATE-PASS, and it reproduces earlycrew-a EXACTLY on every
headline number: 907 meetings, 19 judged, crew-tile 5,
outcomes vDie 10 / vFlee 9, fought 0, from-start 0, field kills
0, wall natEver 6 / natFinal 4 / table 3 / entered 2 / wins 2
(all lesser) / wave-4 7 / wave-5 0, median 118d, deaths 306,
starvation 1, outing pairs 1,881. Det-gate also PASS (seed
75101, layer OFF = plain tableseat-nowait: days 132/132,
tsNationalDay 77/77 — the 1528 control seed's numbers).
The control is uncontaminated; the armed comparison is clean.
Corpus: evidence/2026-10-28/perseed-perceptform-a/
(s<seed>-control.json + summary-control.json).

## Pilot band (substrate + stamped code, seeds 75101–75108)

Corpus PASS, census valid (8/8 rows, 0 unclassified, recorder
errors 0). Trajectories nearly identical to control (the
change bites only where a stamp partner stands on a tile):
912 meetings (vs 907), judged 19 (same seeds, same counts),
wall identical except deaths 303 (vs 306).

- PRIMARY: FAIL — PARTY-AT-START-PERCEIVED 0, field kills 0.
- PERCEPTION: perceived-present (judged, leader-stamp
  definition) 0; from-start-any 0; audit-fails 0; crew-tile
  (earlycrew definition) 5; fought 0.
- The 19 judged meetings, all with leader-in-crew FALSE and
  leader stamp NULL: 75103 d64 Tom vs audit (vDie), d66
  audit (vFlee, tile incl. Olivia), d67 algorithm x2 (vFlee,
  vDie), d68 algorithm x3 (vDie), d69 Luis vs algorithm
  (vFlee), d72 Luis vs algorithm (vFlee), d80/d81 Mia vs
  suburb (vFlee), d88 Mia vs suburb (vFlee), d93 visjoin_82
  vs suburb (vDie), d107 visjoin_103 vs eulogy (vFlee);
  75105 d146/d147 visjoin_143 vs suburb (vFlee, vDie),
  d148 visjoin_136 vs suburb (vDie); 75107 d118 vs eulogy
  (vDie); 75108 d96 vs eater (vDie, tile Olivia, crew
  Ines+Ursula). Outcomes: vDie 10, vFlee 9 — byte-identical
  in shape to control.
- WAVE-3 CONTRAST (same band): 18 field meetings, 0
  from-start, 8 fought (all via the hopeless shout, as
  before). The from-start rule changes nothing at wave 3
  either, for the same reason: wave-3 leaders are not
  outing members either.
- GUARDS: median 118d PASS (bar 94.4d); starvation 1 PASS
  (bar 3); wave-5 0.
- WALL (armed vs control): national ever 6/8 (vs 6/8),
  final 4/8 (vs 4/8); table invited 3/8 (vs 3/8), entered
  2/8 (vs 2/8); wins 2/8, all lesser (vs 2/8), full seat 0/8
  both; wave-4 reach 7/8 (vs 7/8); wave-5 0/8 both; median
  118d (vs 118d); deaths 303 (vs 306); starvation 1 (vs 1).
- ALL-WAVES (mechanism proof in the wild, NOT judged):
  from-start + joined = 2. (a) 75101 d69 oliver_moore +
  emma_larsen vs alien_tick (wave 2, field, resolve):
  leader armed + armor 16, partner armed + armor 9, both on
  tile (5,4), stamp forage day 69 part 1, 2 rounds, vKill,
  ally dealt 3, ally taken 0. (b) 75106 d97 vs nevermore
  (wave 1): from-start join, outcome mFlee, rounds 0
  (pre-round drive-off branch — the ally was named, the
  fight ended before round 1). Leader-in-crew meetings
  number 146 on the band, and 146/146 carry a stamp — the
  stamp is never missing where it should exist, so the
  judged 0 is a real absence of eligible leaders, not a
  timing or recording bug.

## Why the judged class is empty (the mechanism, one level down)

Wild meetings pick their leader from whoever stands on the
monster's tile (villagerMonsterTick: npcsOnNode(tile)) —
villagers wandering on their own agendas, visitors, new
joiners. The assigned outing pair are foragers, not tile
wanderers: they are the potential ALLIES in the crew list,
not the leaders. Earlycrew-a's 5 "perception-legitimate"
meetings confirm this from the other side: in all 5, the
leader was NOT in the crew — the legitimate person was the
tile-mate (Olivia, out on an outing, standing on the tile),
seen by a leader who was not her outing partner. This arm's
strict leader-partner rule therefore filters out exactly
the meetings that exist. A rule keyed on the TILE-MATE's
outing status (tile-mate holds a current stamp + stands on
the tile) would cover those 5; whether that satisfies the
perception law's "same outing" wording is a coordinator /
Steve ruling for the next arm, NOT decided here, and NOT
re-scored into this verdict. This arm's prereg defined the
class strictly, the band returned 0 for that class, and
the verdict follows the prereg.

## Sense note (SENSE-TESTING LAW — read, not counted)

The sense replay (seed 75101, armed code, window d65–d75)
reproduced the corpus's d69 kill exactly: leader oliver_moore
vs alien_tick, stamp partner emma_larsen, allyFromStart=true,
vKill in 2 rounds. The outing reads as joint in the assignment
lines (Oliver and Emma both assigned forage d66–d68, both
returning with food) but still in singular lines — never
"Oliver and Emma head out together" (the standing narration
blank). The same replay shows the rule's negative working in
the wild: d74, gen_vx3kzuu holds a stamp partner (vasyl) but
allyFromStart=false — the partner was not on the monster tile,
so no join, and vasyl later joined via the shout instead
(calledHelp=true, vFlee). That is the rule behaving honestly:
stamp without tile is not presence.

Two wording notes. (1) The from-start log line is aid-flavored:
"Emma is already at the door — charges in with Oliver!" — a
wild tile meeting has no door; a field wording ("already
beside you", or similar) would read true, and is a narration
blank for any future landing, not a mechanism claim. (2) The
wave-4 judged fights read exactly like the control band's solo
fights — as they are, under this rule. A player watching this
band would see no difference at wave 4, which matches the
mechanism verdict.

Sense verdict on gear (Steve 2026-10-28 wave-4 demand: party +
fully outfitted gear): the one formed kill's party was armed
and armored (leader armor 16, partner armor 9) but that is a
wave-2 fight, not the wave-4 demand — no wave-4 formed party
exists to judge gear on, and none is claimed.

## Reachability verdict

- Wave-4 field parties from a leader's outing partner:
  NOT REACHABLE on this band — the class is empty (0/19),
  not merely unformed.
- Wave-4 field kills: still 0 on every band (control, armed).
- Wave 5: 0 everywhere, as expected — not the metric here.
- Table / wins: unchanged in kind — all wins lesser, full
  seat 0/8 on every band. The stamp changes nothing at the
  wall on this evidence.
- From-start formation in general: REACHABLE AND PROVEN —
  2 formed in the wild (waves 1–2), 1 kill. The wiring is
  not the blocker; the wave-4 leader population is.

## Village assessment in plain words

The village looks exactly like earlycrew-a's village, because
at wave 4 it IS that village: pairs go out to forage, food
comes home, and when a wave-4 beast is met, the villager who
meets it is someone else — a wanderer, a visitor, a new face
— who dies or flees alone in one or two rounds while the
foraging pair works some other ground. Who thrived: villagers
with company nearby at lower waves — Oliver and Emma killed
a tick together because they were actually out together and
actually on the tile. Who died: the same solo wave-4
wanderers as every band before (10 dead, 9 fled of 19).
Missing capability, still: any reason for the meeting
villager and an ally to be on the same dangerous tile
together — the outing system sends pairs to forage, not to
the beast's ground, and wild meetings do not select for
outing members. That selection gap, not the join flag, is
the next blank in order (see below).

## Metric review (filled at judging time)

- PRIMARY DEFINITION: the strict leader-partner definition
  did what a prereg should do — it made the verdict
  falsifiable — but it operationalized "same outing"
  differently from earlycrew-a's measured class (tile-mate
  ∈ crew). The NEXT arm's prereg must define its eligible
  class from the measured population (leaders are never
  crew) and must state, before sweeping, whether
  tile-mate-holds-a-stamp counts as perception-legitimate
  or whether leader-partnership is required. That is a
  definition decision for the prereg, not a mid-run repair
  — this verdict was NOT re-scored under the looser class.
- MEETING-FLOOR LEG WORKED: judged 19 clears the floor, so
  NO-GO here is a class verdict, not an opportunity verdict
  in the count sense — but the subclass name matters:
  NO-PERCEPTION-OPPORTUNITY means the DEFINED class was
  empty, not that meetings were scarce.
- RELATIVE GUARDS WORKED: median bar 94.4d (0.8 × control)
  and starvation bar control+2 both pass cleanly with the
  armed band identical to control — the relative-guard
  prescription from 1736 is validated on this band and
  should be kept for outing-style arms.
- ALL-WAVES FORMED IS REPORTED, NEVER SUBSTITUTED: the 2
  wild from-start formations (waves 1–2, 1 kill) prove the
  wiring but do not count toward the wave-4 primary. A
  future arm must not cite them as wave-4 evidence.
- PANEL: standing exception (no census-ingest mode);
  identical-seed before/after corpora are the §15
  substitute. No panel artifact faked.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus path
  for the coordinator's check is
  evidence/2026-10-28/perseed-perceptform-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in 1736Z: the
  baseline's regime does not match this substrate, and
  per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The corpus's real
  wall numbers are nationalEver 6/8, entered 2/8, wins 2/8
  on BOTH bands. Baseline NOT rolled by this arm; the
  coordinator judges any LOUD lines.

## Blanks filled or documented

- FILLED (mechanism, not landed): the perception-based
  from-start rule itself — stamp + tile + router wiring,
  proven by proof test (PROOF-GREEN on armed code, all
  legs including both negatives) and by 2 wild formations
  with 1 kill. Reverted per the NO-GO verdict; the change
  lives in git history at commit 717ff8ed for a future arm
  to re-apply as substrate.
- DOCUMENTED (for the findings backlog, not chased here):
  1. TILE-MATE-STAMP CLASS (the next blank, in order):
     judged leaders are never outing members (0/19 here,
     0/14 in earlycrew-a's 75103 set) — the eligible class
     that actually exists is a tile-mate who holds a current
     outing stamp and stands on the tile (5/19 judged by
     the crew-tile lens). Needs a perception-law ruling on
     whether tile-mate-outing-status (vs leader-partnership)
     counts, then its own prereg. 2. LEADER SELECTION GAP:
     wild meetings do not select for outing members — the
     outing system and the meeting system meet only by
     accident. 3. NARRATION BLANKS: no joint-outing line
     ("X and Y head out together"); the from-start log line
     is aid-flavored ("already at the door") for field
     fights. 4. FORMED-BUT-RETREATED (1628Z blank #2) is
     unchanged at wave 4 — no wave-4 party exists yet to
     study it on.

## What was deleted / kept (NO-GO discipline)

- DELETED: scripts/policies/earlycrew.js (substrate policy —
  measurement only, never landing; restorable verbatim from
  history commit 134bc0dbd, hash-verified at restore time)
  and scripts/test-perceptform-a-proof.js (proof for the
  reverted feature; proof lives in git history at 717ff8ed).
- KEPT in tree: sweep, analyzer, sense script, prereg, this
  evidence, corpora, sense log, and the stamp-lens addition
  to scripts/policies/fieldparty-form-diag.js (additive,
  harmless on base code: it reads Game._coDepart || {} and
  records null when the stamp does not exist).
- The sweep/sense scripts exit with a pointer when the
  substrate policy is absent, as earlycrew-a's do.

## Revert status — READ BEFORE MERGING (LOUD)

The game change is REVERTED IN THE WORKTREE (game.js
hash-matches its pre-change blob 044a891975b1c606fa1fe72137786f5f61357316;
zero src/js diff vs branch base 894d86451; zero
_coDepart/perceivedFromStartAlly references in src/js), BUT
the revert commit is NOT YET COMMITTED: scripts/safe-commit.sh
REFUSED it under its mass-deletion guard (the revert deletes
89 lines in src/, over the 50-line guard — the stale-tree
revert signature). Per the worker task, --force-delete was
NOT used without coordinator approval. The branch tip is
currently the armed-corpus commit 4e32373cb, which CONTAINS
the game change — DO NOT MERGE this branch until the revert
commit lands (coordinator: approve --force-delete, or commit
the prepared revert yourself — the worktree already holds
exactly the reverted state, verified above). Uncommitted
leftovers at closeout are ONLY the prepared revert
(game.js reverted + 2 deletions); nothing else is uncommitted.

## Infrastructure notes

- Proof test (on the armed code, before revert): PROOF-GREEN
  — stamp records same-task co-departure (leader forage +
  mate forage + other patrol: partners = [mate] only);
  helper returns the on-tile partner and null off-tile;
  wild router passes allyFromStart=true with the partner
  first (allyVid joined, door log line present); off-tile
  and different-task negatives pass; solo control allies 0.
  Re-run post-revert is NOT possible (the proof tests the
  reverted feature) — it was deleted with the revert, per
  shoutgate-a precedent.
- Analyzer re-run on the final corpora reproduces VERDICT:
  NO-GO (NO-PERCEPTION-OPPORTUNITY) with the numbers above.
- node --check clean on game.js (restored), all scripts,
  and the diag file. check.js --quick NOT re-run: zero src/js
  in the final tree (once the revert lands), zero green-list
  files (standing profile as in 1736Z).
- Safe-commit index clobber hit every commit in this run
  (prereg, instruments, control corpus, armed corpus, and
  the game-change commit) — repaired each time via HEAD-blob
  `git update-index --add --cacheinfo` with hash verification,
  never `git reset`. No ref surgery; the container .git EPERM
  flap did not strike this run.
- No push, no bump, no live verification (ship-loop line).
  Ready for coordinator handling, pending the revert commit
  above — NOT "merged locally, pending ship" until the
  revert lands, by the coordinator's hand.

## Commits (this branch)

- 1608dbc76 prereg (before any judged sweep).
- 7d64f3b6a instruments (substrate policy + stamp-lens
  recorder + sweep/analyzer/proof/sense).
- aac1d93d1 control corpus (GATE-PASS).
- 717ff8ed game change + proof — REVERTED in worktree,
  revert commit PENDING coordinator --force-delete approval.
- 4e32373cb armed corpus (pilot band).
- This evidence + sense log: final commit on this branch
  (hash in the run report to the coordinator).
- This branch merges evidence + instruments + corpora only
  once the revert lands; the coordinator must NOT merge the
  game change from this branch.

## Convergence

scale-onramp stays converging (NOT converged): a
perception-based from-start rule now exists and works in
the wild (2 formed, 1 kill at waves 1–2), but no wave-4
field party starts as a party under the strict
leader-partner definition (0/19), full seat still 0/8,
wave 5 still 0/8. The directive stands until the tracker
records this axis converged on measured evidence. Next
blank in order: the tile-mate-stamp class + a ruling on
what "same outing" means for a fighter who was never on
the outing.
