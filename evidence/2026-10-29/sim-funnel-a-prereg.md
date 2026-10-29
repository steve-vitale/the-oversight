# sim-funnel-a — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: flesh-out loop, run fleshout-20261029T0145Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-funnel-a.
Assignment: SURVIVOR-FUNNEL PICK-TIME DIAG — measurement only, zero
game change. This arm decomposes the returns-a funnel (19 survivor
triples -> 1 HUNT attempt -> 0 meetings) by recording PICK time, not
just departure time. Zero src/js changes, zero default flips, zero
policy changes, zero villager-behavior changes. No roster/list is fed
into any decision (perception law, Steve 2026-10-28): the new
recorder only reads what happened.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 bands)
and docs/PARTY.md (party/follower mechanics, for context only — this
arm touches no party behavior). No CANON-registered doc covers
travel-to-known-monsters, field-fight returns, or pick-time funnel
decomposition — that gap is stated here instead of invented canon.
The mechanism below is derived from code, stated exactly so it can
be checked (same mechanism text as sim-returns-a prereg, plus the
pick-time facts this arm adds):

- RETURN-TO-FIGHT (villager-objectives.js, game.js
  resolveWildMonsterEncounter): a villager who actually fights a
  living world monster remembers the fight's tile; only that
  villager may be offered a HUNT errand back to it. Memory store:
  state.village.monsterSightings[vid] = [{mid, tx, ty, day, part}],
  cap 4 per villager, oldest dropped first. Recorded for the fight
  leader AND the answering ally; never from a mere sighting, never
  from gossip, never from the monster list; never for the scholar
  (player); never for raid fights. Written by
  objNoteMonsterSighting (the memory-formation event this arm
  records); spent by objDropMonsterSighting, whose only caller in
  src/js is the HUNT arrival path (objAwayStep).
- HUNT OFFER (objPick + objHuntCandidate): at a dawn/idle pick, a
  villager with a fight memory may be offered HUNT at lottery
  weight 2.0 (food, water, hall life still compete — an offer is
  never a guarantee). Gates, all enforced by objHuntCandidate:
  memory fresh (age 0-3 days), villager armed, within roaming range
  (1 <= Chebyshev distance <= npcMaxDist), not sheltering, not
  resting off a bad flee. HUNT is solo by design.
- PICK vs DEPARTURE (the gap this arm measures): objPick chooses
  the errand (state 'ready'); objMaybeDepart later departs it
  through danger/heal gates (objDepart). Returns-a proved the two
  differ (seed 75106 visjoin_115: huntDay 132, departure day 137).
  A pick recorded at dawn can be fresh while its departure is
  stale, and a HUNT pick can be superseded before it ever departs.
  Departure time therefore cannot decompose the funnel; only pick
  records (chosen kind + pre-pick memories + candidate at pick
  time) can.
- PICK SITES: objPick fires at dawn for villagers at haven and
  whenever a villager is idle at haven (npcNodeTravel decision gap).
  A villager out on a trip, dead, or gone (LEAVE) records no pick —
  absence of a pick is itself a funnel fact, classified below, not
  a missing-data excuse.

## Fresh band (this arm's own corpus, base code)

- Seeds 75101-75116 (16, the returns-a band verbatim, so the 19
  triples are the same triples). scripts/policies/
  tableseat-nowait.js VERBATIM, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1 (fieldparty-form-diag recorder,
  reused VERBATIM, never edited), RETURNS=1 (returns-diag recorder,
  reused VERBATIM, never edited) PLUS the new funnel recorder
  (scripts/policies/funnel-diag.js, FUNNEL=1; observational only,
  pure pre-reads, no game writes, no RNG draws, never throws into
  the engine). 180d death-aware (runDays stops on death/win, as in
  the predecessor sweeps), competent policy (tableseat-nowait).
- WHY 16 SEEDS: the 19 triples come from this band; reusing it
  exactly lets this arm decompose the known triples instead of
  drawing a new, incomparable set. Seeds are nearly free (Steve
  2026-10-13).
- SUBSTRATE (named, never switched mid-run): tableseat-nowait.
  No other policy, no policy edit, no game-code edit.
- CORPUS LAYOUT (returns-a layout, new arm dir — the predecessor
  corpus is never overwritten): evidence/2026-10-29/
  perseed-funnel-a/s<seed>-fresh.json. Each row carries the
  returns channels verbatim (fieldparty.meetings,
  returns.meetings/departures/drops) PLUS funnel.picks and
  funnel.notes PLUS a deaths list (day, who, cause, player) from
  the harness live-death capture, so died-before-pick is a record,
  not an inference from absence.

## Instruments (new, scripts/ only)

- scripts/policies/funnel-diag.js: wraps objNoteMonsterSighting
  (post-call note event: vid, mid, tx, ty, day, dayPart,
  partCounter, list length after, whether the entry was refreshed
  vs new, whether the write evicted an entry) and objPick
  (pre-pick direct-state snapshot of monsterSightings[vid] only —
  NEVER objOf(), which CREATES entries — plus post-call chosen
  objective, post-pick sightings, candidate recomputed via
  objHuntCandidate with the pick's own (hx, hy) — a pure read
  function, no RNG, and the pick itself already computed the
  villager's range profile, so the recompute is a cache hit —
  plus gate flags armed/sheltered/postFleeResting/maxD, plus the
  villager's direct-read node position). A pick is recorded ONLY
  when the pre-pick sightings contain a wave-4 mid OR the chosen
  errand is HUNT for a wave-4 mid: wave-4 triples are the judged
  universe, and notes (all waves, small volume) already carry the
  full memory lifecycle including eviction by other-wave notes.
  The funnel recorder wraps NO fieldFight function, so the
  returns channels cannot be perturbed by wrap order.
- scripts/test-funnel-a-sweep.js: returns-a sweep verbatim plus
  funnel install, funnel corpus dir, deaths list in the row.
- scripts/test-funnel-a.js: analyzer. (a) Neutrality reproduction
  against the returns-a corpus (see gates below). (b) Triple
  derivation + taxonomy classification (see below). (c) --out JSON
  for the sense script and the evidence file.
- scripts/test-funnel-a-fixtures.js: taxonomy unit fixtures on
  synthetic traces (every class reachable, priority order,
  episode boundaries) + a live-harness pick-capture fixture
  (seeded memory via objNoteMonsterSighting, funnel recorder
  installed, objPick driven, pick record shape asserted).
- scripts/test-funnel-a-sense.js: S1 = one full survivor-triple
  trace quoted verbatim from the corpus (pick/note/departure/drop/
  meeting records in order) with a sense judgment; S2 = the
  returns-a HUNT lottery mechanism re-quoted via the funnel pick
  fixture (candidate offered, chosen kinds).

## Triple derivation (fixed before any judged run)

A survivor triple is (seed, leader vid, beast mid) from judgedA
meetings (wave-4, field channel, caller resolve/patrol/aid,
non-scholar leader, fieldparty definition verbatim from
returns-a) with outcome vFlee. Grouping the returns-a corpus this
way yields EXACTLY 19 triples (verified read-only against the
published corpus before this prereg: 25 vFlee meetings -> 19
distinct triples; vDie meetings excluded — death removes the
fighter before memory can matter). The funnel corpus must
re-derive 19 triples by the same rule; any other count is a
neutrality failure, not a redefinition.

## Taxonomy (fixed before any judged run)

Window per triple: from its FIRST surviving judgedA meeting
(anchor) to horizon end. Within the window, memory for the triple
mid moves in EPISODES: an episode opens at a note event creating
or refreshing an entry for the mid and closes when no entry for
the mid remains (eviction via cap-4 notes, or a drop spend) or
at horizon end. A later accidental meeting opens a new episode —
that is a real second chance, not a recount. Classification is by
the FURTHEST stage reached in the window, with the cause taken
from the LAST episode that reached that stage (an early eviction
followed by a fresh episode that stalls on the lottery is a
lottery loss, not an overwrite loss — the last block is the
binding one):

- Stage S0, no pick recorded in the window:
  DIED-BEFORE-PICK (a deaths-list record for the vid after the
  anchor, before any pick); LEFT-BEFORE-PICK (a LEAVE departure
  for the vid after the anchor, before any pick);
  NO-PICK-RECORDED (alive at horizon end, no pick — e.g. still
  out on a trip, or never idle at haven after the fight).
- Stage S1, picks recorded, never a fresh candidate:
  MEMORY-OVERWRITTEN (the last episode closed by eviction before
  any fresh-candidate pick); MEMORY-STALE-AT-PICK (picks in the
  last episode all saw the mid entries at age > 3 days);
  GATE-BLOCKED-AT-PICK (a pick in the last episode saw a fresh
  mid entry but the candidate was null — the recorded gate flags
  name which: unarmed, out-of-range, sheltered, post-flee rest).
- Stage S2, fresh candidate offered at >= 1 pick, never HUNT
  chosen: LOTTERY-LOST (candidate non-null, chosen kind != HUNT
  at every offered pick; the chosen-kinds distribution is
  reported).
- Stage S3, HUNT chosen at >= 1 pick, never departed:
  PICKED-NEVER-DEPARTED (no returns departure with the same
  vid+huntMid+huntDay at a partCounter >= the pick's, before the
  vid's next pick; sub-note: died while holding, superseded by a
  later pick, or held to horizon end).
- Stage S4, HUNT departed: DEPARTED-EMPTY-TILE (a drop with
  dropped=true for that departure's vid+mid+tile — the quarry
  had moved, the remembered tile was empty); DEPARTED-NO-MEETING
  (departed, no drop, no deliberate meeting — arrived and
  lingered without meeting the beast).
- Stage S5, deliberate meeting (returns-a class DELIBERATE for a
  meeting in the window): DELIBERATE-MEETING — a success, not a
  loss. Expected 0; any occurrence is reported as overturning
  the returns-a zero, not folded into a loss class.
- OTHER: none of the above applies. OTHER counts as UNASSIGNED
  for the GO threshold.

A triple is CLASSIFIED when it has a stage + cause (or S5).
A loss (any triple with no deliberate meeting) is ASSIGNED when
its class is not OTHER. The returns-a attempt triple
(75106, visjoin_115, eulogy) is expected to classify
DEPARTED-EMPTY-TILE under this taxonomy.

## Pre-registered GO threshold (binding — a miss is NO-GO)

PRIMARY METRIC: taxonomy coverage of the 19 survivor triples.
GO requires ALL of:
  (1) all 19 triples classified (stage + cause, or S5);
  (2) at least 18/19 losses assigned a mechanism class (OTHER <= 1);
  (3) determinism: seed 75106 re-run into a scratch EVID dir
      produces a row JSON byte-identical to the corpus row.
Horizon 180d death-aware (why: matches the returns corpus band;
dead villages stop simulating, +10d tail max per the loop body).
Seeds 75101-75116. Policy tableseat-nowait (substrate named
above — do NOT switch substrates mid-run).

## Guards (reported, NOT judged — a guard miss is investigated,
never re-scored into a GO)

- RECORDER-NEUTRALITY REPRODUCTION (must be exact before any
  decomposition is judged): returns channels of the funnel
  corpus equal the returns-a corpus exactly — judgedA 42,
  judgedB 31, classes ACCIDENTAL 39 / MEMORY-ONLY 3 /
  DELIBERATE 0 / DELIBERATE-ORPHANED 0 / HUNT-READY-NOT-OUT 0,
  chains 13 (all STILL-ALIVE), HUNT departures 326 (wave-4 1),
  HUNT true drops 297 (wave-4 1), per-seed judgedA counts
  identical, wall numbers identical (wins 4/16 all lesser, full
  0/16, nationalEver 13/16, nationalFinal 9/16, table 10/16,
  entered 4/16, wave-4 11/16, wave-5 0/16, median 180 capped),
  deaths 600, recorder errs 0 (all three recorders), overflow 0,
  join errors 0. Any mismatch: STOP, report, do not judge the
  taxonomy against a perturbed corpus.
- DEATH/STARVATION SHARES: reported from the funnel corpus
  (deaths by cause; starvation deaths) for comparison with
  returns-a (starvation 4). A starvation-share jump is a
  neutrality smell, investigated before any taxonomy claim.
- SENSE BAR: >= 1 full survivor-triple trace quoted verbatim
  (S1) AND the HUNT lottery mechanism quoted via the pick
  fixture (S2). A trace that does not read as a played sequence
  is reported as a sense failure even if the counts pass.

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts about the metric, the taxonomy, or the stage rule go
here in the evidence file, for the next run's prereg. In
particular: (a) "furthest stage + last episode" vs "first
block" — if a triple's early block (e.g. overwrite) recurs
after a refresh, the last-episode rule may understate early
blocks; the evidence reports per-episode causes alongside the
headline class so the next run can judge. (b) PICKED-NEVER-
DEPARTED lumps danger-gate holds, heal-gate holds, and
supersession — the departure gates are not separately recorded;
a follow-up that wraps objHealGate/objDanger would split it.
(c) Day-granularity deaths (the harness deaths list carries day,
not dayPart) limit DIED-BEFORE-PICK precision on same-day
death-vs-pick order; partCounter ordering is used where the
records carry it, and same-day ambiguity is flagged per triple.
