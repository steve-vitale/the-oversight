# sim-dawnblock-a — PREREGISTRATION (written BEFORE any judged sims)

Run: fleshout-loop-a-20261101T1235Z. Worker: sim-dawnblock-a. Axis:
scale-onramp (converging, NOT converged). Sibling Loop B works
food-economy (trees sim-depositgate-b, sim-scholaraway-b, now closed
for 1130Z) — NOT touched. Sibling arm tree sim-titangate-a — NOT
touched. No B axis, claims, or trees; no titangate files.

## Assignment (DIAG ONLY, zero src/js changes)

Dawn lingering-encounter secondary seat block (1016Z next blank 2).
Prior evidence (read before designing):
evidence/2026-11-01/sim-seathes-a.md and sim-seathes-a-prereg.md.
Key facts: on seed 78201 a pending encounter at dawn ("Finish the
current encounter…") blocks sitting on the last 8 mornings
(days 173–180), and on 78208 on days 140/147/148/163 — it would
block sitting even at national rank. The PRIMARY block is the
policy-national vs lesser-regional gate mismatch (a steve-call
item — do NOT re-litigate it and do NOT build a seat-gate fix);
this arm isolates ONLY the secondary dawn-encounter block.

Canon: docs/CANON.md read first; docs/TABLE.md covers the seat
(lesser needs regional+, full needs national+). NO canon doc
covers lingering-encounter dawn behavior (no doc on what a
monster pending at dawn is, how long it may linger, or what
clears it) — stated, not invented. Code is authoritative here:
src/js/table.js tableEntryBlock() returns the encounter line iff
`inCombat()` (a live tbfight, not over) OR `state.scholar.monster`
(the monster on the scholar's tile — see playerMonster() /
syncMonsterAlias in game.js). It does NOT check
`pendingEncounter` (an unstarted wanderer/raid pending) or
`activeContest` (which has its own, earlier line). An
encounter-blocked dawn therefore means a live fight or a tile
monster at the decision moment — the instrument measures which,
not assumes it.

## Stack (REUSED UNMODIFIED)

scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1) + fullseat-diag + vet2-diag, exactly as in
sim-seathes-a, PLUS the new outermost dawnblock layer (below).
Numbers are NEVER compared across stacks/bases: this arm's
census is judged on its own corpora, with end-field neutrality
checked against the seathes corpus (same stack + one pure-read
layer) as a recorder-neutrality proof only.

## Instrument (new files only; non-overlapping with titangate)

- scripts/policies/dawnblock-diag.js: withDawnblockDiag(inner),
  a pure-observation wrapper OUTSIDE tableseat-nowait. Env
  DAWNBLOCK=1. At each daily call it snapshots BEFORE delegating
  inward (the decision moment — the exact point the substrate's
  seat leg evaluates, same as seathes) and AFTER delegating
  (pre-sleep end of day), with identical arguments and return
  values passed through, never mutating game state, never
  drawing RNG. DAWNBLOCK unset -> delegates byte-identically.
- scripts/dawnblock-a-sweep.js: sweep + analyzer + sense mode,
  seathes pattern. Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  FULLSEAT=1, VET2=1, DAWNBLOCK=1. Horizon 180d death-aware.
- scripts/test-dawnblock-a.js: proof test (unit checks +
  corpus legs re-deriving every headline number).

Decision-moment snapshot (pure reads only): day, rank (+order),
seat, deedGateReady ok, pg.tableWaiting/tableDone,
tablePreview() (seat, ready, why, overtime), tableEntryBlock(),
havenStoresAccess(), scholar insideHaven, playerTile type +
map px/py, scholar alive/exiled/joined, AND the encounter
signals, each recorded separately so the trigger is identified,
not assumed:
- inCombat (tbfight live, not over) + tbfight fighters
  (key, monster id/name if readable, hp) + tbfight.over
- scholar.monster / playerMonster() / monsterAt(px,py):
  id, display name, wave, hp, tile (tx,ty), detail (mx,my),
  whether the object is in worldMonsters
- pendingEncounter, pendingMonsterId, pendingInTent,
  raidPendingMonsterId
- state.activeContest (id/kind if readable)
- waveKillLog length + tail (for clearance attribution between
  snapshots) + worldMonsters count on the scholar's tile
Post-delegate snapshot: same encounter signals (was the
encounter still there at end of day, or cleared during play?).

Episode construction (analyzer, pure): an episode is a run of
consecutive decision rows carrying the SAME encounter identity
key — `fight:<fighter ids>` if inCombat, else
`tile:<monster id>@<tx>,<ty>` if a tile monster, else
`pending:<pendingMonsterId>`, else `contest:<id>` — with no
gap row. Pending age = dawns since the episode's first
decision row (first-seen day + span). A gap row with a
different key, or a no-encounter row, ends the episode; a
later same-key row is a NEW episode (recurrence, not linger).
Clearance outcome per episode (from the first row AFTER the
episode, plus the kill-log diff across the gap and the
post-snapshots inside the episode):
- STILL-PENDING: episode runs to the run's last decision row
- CLEARED-KILL-LOGGED: a waveKillLog entry for that monster
  id/type appears between the episode's last row and the next
  decision row (or during its last day's play)
- CLEARED-MOVED-AWAY: the same monster id is still in
  worldMonsters at the next decision row but on another tile
- CLEARED-GONE-UNATTRIBUTED: absent at the next decision row,
  neither kill-logged nor found moved-away (honest label:
  slain-without-log vs despawned cannot be distinguished from
  dawn snapshots alone)
- CLEARED-DURING-DAY: present at a day's pre snapshot, absent
  at that same day's post snapshot (cleared during play, not
  overnight); the episode's end is then dated to that day

Both-gates measurement (Q4): for every encounter-blocked held
dawn, record rankGateAlsoBinding (rank order < 2, so the
policy leg would not have run even with the encounter
cleared) and soleBlocker (rank >= 2 AND access != 'none' AND
no contest line — the leg WOULD have attempted had the
encounter been cleared; "attempted", not "sat", since
tableTakeSeat's own outcome is then a further step).

## Hypotheses (prereg order; at least one must be falsified)

- H1 TILE-MONSTER (leading): encounter-blocked held dawns are
  a tile monster (scholar.monster non-null), NOT a live
  tbfight — the scholar wakes with a monster standing on
  their tile, no fight running. Falsified if any
  encounter-blocked held dawn shows inCombat true with no
  tile monster, or if the blocked set mixes kinds without a
  dominant kind.
- H2 ACTIVE-FIGHT: encounter-blocked held dawns are live
  tbfights left running overnight. Falsified if no
  encounter-blocked held dawn shows inCombat true.
- H3 PENDING-ONLY: a pendingEncounter with neither tbfight
  nor tile monster produces the encounter line. Falsified
  by the code reading (tableEntryBlock never checks
  pendingEncounter) AND empirically if every encounter-line
  row carries a tbfight or a tile monster.
- H4 MULTI-DAWN LINGER: at least one encounter identity
  spans >= 2 consecutive held dawns (one lingering encounter
  blocks many dawns). Falsified if every encounter-blocked
  held dawn belongs to a 1-dawn episode.
- H5 SOLE-BLOCKER: at least one encounter-blocked held dawn
  is a sole blocker (rank >= 2, access != 'none'), i.e. the
  encounter is the ONLY thing standing between that village
  and a seat attempt that morning. Falsified if every
  encounter-blocked held dawn is also rank-gated (the
  seathes expectation: all 12 known blocked held dawns are
  regional, so H5 is expected to FAIL — a falsification
  here is a finding, not a run failure).
- H6 INTERMITTENT, NOT ONE LINGER (78208 shape): 78208's
  blocked dawns belong to >= 2 distinct episodes (clearance
  happens between them), not one unbroken linger. Falsified
  if 78208's 4 blocked dawns form a single episode.
- H7 RAID ORIGIN (78201 shape): the 78201 8-dawn episode's
  monster kind matches the day-172 night raid (raiders at
  Haven: Big Loud, The Herald, Ugly-Eyes per the seathes
  sense transcript) and its tile is Haven (4,4). Falsified
  if the episode's monster id is none of the raid party or
  its tile is not Haven.

## Questions to answer (from the brief)

1. Which encounter kinds linger to dawn — field fights,
   contests, conversations, something else? (Answered by the
   separate encounter signals + block line per dawn; note
   conversations never produce a tableEntryBlock line, and
   contests produce the contest line, not the encounter
   line — both are checkable negatives.)
2. How long do they linger, and what clears them? (Episode
   spans in dawns + clearance outcome per episode.)
3. Same-day-only effect, or does one lingering encounter
   block many dawns? (Episode spans: H4.)
4. Would clearing the encounter actually let the seat leg
   fire on those dawns, or is the rank gate still binding
   underneath? (Both-gates measurement at the same decision
   moment; never assumed.)
5. SENSE-TESTING: read at least one blocked-dawn transcript
   beat — does "finish the current encounter first" read
   as sensible, or does the encounter itself look
   stuck/bugged? (Sense mode: NON-MEASURED narration replay
   capturing encounter/monster/raid/table/seat lines; plus
   the existing seathes sense transcript for 78201's
   day-172 raid night. Sense files never enter the census.)

## Seeds (INTENTIONAL REUSE — claims NO new wall numbers)

Seeds 78201-78208, REUSED from sim-seathes-a exactly
(same band, same horizon). Reuse is intentional: the
question is about THESE blocked dawns (78201 days 173-180,
78208 days 140/147/148/163), and 78206 is the in-band sit
control (any encounter-blocked pre-sit dawn there is
measured too). NO fresh seeds; no band-shopping. Wall
numbers cited are the seathes/recheck's, reproduced as a
neutrality check only.

## Pilot gate

Pilot = the 8-seed band series complete (78201-78208). NO
confirm spend (no second band, no lever) unless the pilot
itself fails its GO bar — this is a DIAG census, not a
lever comparison, so there is no confirm leg to spend on.
If the pilot shows every encounter-blocked held dawn traced,
the census is complete at pilot scale.

## Pre-registered GO bar (DIAG-GO, judge exactly, no re-scoring)

DIAG-GO iff ALL of:
1. At least 90% of held-seat dawns are classified by block
   reason (encounter-block vs rank-gate vs game-gate vs
   other), using the seathes classification scheme extended
   with the encounter detail — held-seat dawn = decision
   row with seat lesser/full, table not done, run alive.
   (Seathes achieved 65/65 = 100%; <90% is DIAG-NO-GO.)
2. EVERY encounter-blocked held dawn is traced to an
   encounter kind (tbfight / tile monster / pending /
   contest / other, with the exact signal that fired) +
   a pending age in dawns (episode span position) + a
   clearance outcome (STILL-PENDING / KILL-LOGGED /
   MOVED-AWAY / GONE-UNATTRIBUTED / DURING-DAY). Any
   encounter-blocked held dawn missing any of the three
   is DIAG-NO-GO.
3. The known block shape reproduces: 78201 shows an
   encounter block on days 173-180 (8 dawns) and 78208 on
   days 140/147/148/163 (4 dawns), on the same stack —
   else the instrument is not measuring the same phenomenon
   and the verdict is DIAG-NO-GO.
4. At least one falsified alternative hypothesis from
   H1-H7 above (state which, with the falsifying
   observation).
5. A sense read of at least one blocked-dawn beat (Q5),
   with a plain-words verdict (sensible vs stuck/bugged).
6. Recorder-neutrality leg PASS: end fields of the
   dawnblock run match the seathes corpus on 8/8 seeds
   (days, gameDays, ts counters, starvationDeaths, endSnap
   dist/binding/seat, diag maxDist, vet end/max counts,
   waveReach, finalRank, maxRank, nationalEver, table,
   entered, won). DAWNBLOCK ON vs OFF end fields identical
   on 2 seeds (78201, 78208). Determinism leg PASS: 78201
   re-run byte-identical (row + daily-series JSON, cmp
   clean; scratch deleted).
7. Proof test scripts/test-dawnblock-a.js GREEN (analyzer
   unit checks on synthetic series + corpus legs
   re-deriving every headline number from the judged
   corpora, independent of the sweep's printed verdict).

Series completeness definition (as seathes): one row per
daily call + row-count agreement with fullseat-diag days
and vet2 rows + zero recorder errs. Scholar-day labels may
skip per the seathes diagnosis; label skips are recorded,
not treated as missing days. Classification uses row order
+ decision-moment contents, never the label alone.

## Panel (MEASUREMENT.md §15)

NOT APPLICABLE for a single-base DIAG census — declared, not
fabricated. No before/after lever comparison exists in this
arm. The ON-vs-OFF and vs-seathes comparisons are
recorder-neutrality proofs, not panel comparisons, and their
numbers never enter a census table as a lever effect.

## Evidence to write

evidence/2026-11-01/sim-dawnblock-a.md with: lever played
(none — DIAG), before/after numbers if any (none expected;
say so), reachability verdict for the seat-taking content
via the encounter lens, village assessment in plain words,
blanks filled or documented, answers to Q1-Q5, and a
mandatory "metric review" section. Corpus:
evidence/2026-11-01/dawnblock-a-perseed/s<seed>.json +
s<seed>-daily.json + summary.json. Sense (NON-MEASURED):
evidence/2026-11-01/sim-dawnblock-a-sense-<seed>.txt.
