# sim-tbstarts-a — PRE-REGISTRATION (binding, written BEFORE any sweep)

Run: fleshout loop A, run fleshout-20261027T1121Z, axis scale-onramp.
Arm: sim-tbstarts-a — CLASSIFY THE UNSETTLED TB STARTS on the wave-4
melt band. The w4melt verdict itself is NOT re-judged here: this arm
classifies only the leftover starts w4melt named. DIAG ONLY — zero
src/js changes, zero default flips, no game lever, no game-lever
proposal. The deliverable is measurement, not a fix. No [needs-eyes]
flag applies (measurement only, no feel/combat/UI change; said
explicitly).

## CANON READ FIRST

- docs/CANON.md, docs/MONSTER-WAVES.md. Wave law used here, read
  from canon + code (never invented): wave 4 = The Mirror Draft,
  standing >= 100 (blood / bonds / bread, pure or hybrid).
- Code read before sweeping (never invented): game.js startCombat
  refuses a new fight while a fight is live and not over ("Already
  in a fight — finish this one first", startCombat early return);
  a live fight's fighters are built by startCombat itself or by a
  direct-build path (betrayal party.js, uprising justice.js, alien
  encounters.js, load-restore game.js) that bypasses startCombat;
  tbEnd's finally clears tbfight (game.js ~l43963); the only
  non-tbEnd, non-load in-run tbfight=null site found by reading
  is the tbBarrierExit dissolve (game.js ~l34869, death
  mid-crossing: over=true, result='dissolved', tbfight=null);
  the party.js tbfight=null sites (~l1328, ~l1346, ~l1434) sit
  INSIDE the party tbEnd wrapper (betrayal_yielded / betrayal
  endings), so an outer tbEnd recorder still records them as a
  settlement; the load-clear site (game.js ~l9207) cannot fire
  mid-sweep (no load runs inside a sweep seed). These are the
  candidate sites the new recorder must discriminate between —
  the recorder does not assume which one fires.

## CONTEXT READ FIRST

- evidence/2026-10-27/sim-w4melt-a.md + its prereg
  (evidence/2026-10-27/sim-w4melt-a-prereg.md): on 73675, w4melt
  records 61 startCombat rows but 28 tbEnd rows, errs 0,
  pendingLifts empty at end; unsettled starts cluster d113-118,
  d126-127, d152; every melt still has exactly one fight row +
  one settlement + one oldcore tbEnd. The w4melt verdict (5/5
  melts fought-entity, tile-occupied) is NOT re-judged.
- evidence/2026-10-27/sim-w4funnel-repin-a.md + its prereg
  (the band being classified: 31 wave-4 arrivals, 5 melted).
- Sim-findings backlog line "UNSETTLED TB STARTS" (2026-10-27):
  seed 73675: 61 startCombat rows but only 28 tbEnd rows in
  w4melt-diag, errs 0, pendingLifts empty at end; clusters
  d113-118, d126-127, d152; candidate paths are tbfight=null
  sites in game.js/party.js; every melt still has exactly one
  fight row + one settlement + one oldcore tbEnd.

## CORPUS-SUFFICIENCY DECISION (made before any sweep, from schema)

The existing w4melt corpus DOES carry per-seed startCombat and
tbEnd rows sufficient to COUNT the gap, and those counts are
cited here only as the question, not as the classification:

- evidence/2026-10-27/perseed-w4melt-a/s73675-armed.json:
  w4melt.fights = 61 rows, w4melt.settlements = 28 rows,
  oldcore.tbEnds = 21 rows, oldcore.pendingLifts = [],
  w4melt diag errs 0, oldcore diag errs 0.
- Band-wide w4melt fight/settlement counts: 73671 33/34,
  73672 17/17, 73673 5/5, 73674 14/14, 73675 61/28,
  73676 13/13, 73677 18/18, 73678 27/27.
- Per-day fight-minus-settlement diffs on 73675 are confined
  to d113 (2), d114 (1), d115 (8), d116 (4), d118 (3),
  d126 (7), d127 (4), d152 (4) = 33; every other seed's
  per-day diffs net to a cross-day settlement shift or zero
  (73671: d167 +1 / d168 -1 plus a d94 extra settlement;
  73677: d112 +1 / d113 -1; 73678: d85 +1 / d86 -1,
  d106 +1 / d107 -1), never an unsettled surplus.

The corpus does NOT carry what a code-site classification
requires, and that is why a resweep is required instead of a
corpus-only classification: w4melt fight rows carry NO
tbfight.id, NO startCombat call argument (monsterId), NO
pre-call live-fight identity (id / over / fighter kinds), and
NO post-call refused-vs-new discriminator; w4melt settlement
rows carry NO fight id to join a start to its own end; and
no recorder in the w4melt corpus marks any tbfight=null
site. A row whose post-call fighter list is empty cannot,
from the corpus alone, be told apart between (i) a refused
call during a live person-fight (no monster fighters), (ii)
a new fight that started and settled inside the same
startCombat call (post-call tbfight already nulled by
tbEnd's finally), and (iii) a new fight dissolved without
tbEnd. Classifying from the corpus would be guessing the
site. RESWEEP, with the new recorder below. The corpus
counts above are the resweep's cross-check, not its verdict:
the resweep must reproduce the same unsettled shape on
73675 (61 starts / 28 tbEnd in w4melt terms, or the
equivalent tbstarts pairing) or explain the difference
field by field.

## SUBSTRATE (fixed before sweeping)

- Seeds 73671-73678 (identical seeds, always).
- Policy: scripts/policies/tableseat-nowait.js, composed upon,
  NEVER edited.
- Horizon: 180d death-aware (runDays stops on death/win; 180
  is the cap, not a fixed horizon — MEASUREMENT §10).
- Two arms, same seeds, same substrate:
  - PLAIN: tableseat-nowait with NO recorders.
  - ARMED: tableseat-nowait + tbstarts-diag (NEW, see below)
    + raftdraft-diag + spawnsrc-diag (both reused VERBATIM
    from current master, never edited; sha256 below,
    identical to the w4melt prereg for the two reused files).
- Plain runs FIRST. The armed band must reproduce plain
  EXACTLY on every shared field (days, gameDays, endReason,
  won, waveReach, maxArc, finalRank, maxRank, nationalEver,
  nationalFinal, table, entered, deathTotal, starvationDeaths,
  faced, waveKillLog entries) or STOP and report the deviation
  — never judge on a moved baseline.
- Detgate on 73675 (not 73671: the question seed): armed
  recorders OFF must reproduce plain EXACTLY on every shared
  field, with no diag surface and no wraps installed, or STOP.
- Plain-vs-w4melt/w4funnel control comparison is REPORT-ONLY
  (this worktree's base is the coordinator-provided branch
  sim-tbstarts-a, not the w4melt rebase tip): any deviation is
  base movement, never a gate failure. Only armed-vs-plain
  inexactness, corpus errors > 0, or a detgate FAIL stops
  the run.

## INSTRUMENTS

- Reused VERBATIM (never edited; sha256 re-checked at this
  base, identical to the w4melt prereg):
  raftdraft 5aef723cb3c902bee6d03eb9b40f8194bbd616a7798049f226c1417194e10b97,
  spawnsrc 31c496ac41e1213095b3b25854a6c7e584cc05c0bbb255e39c9376a0a3da4e17.
  Raftdraft supplies raid days per seed (the cluster test);
  spawnsrc supplies birth/arrival days per wave-4 seq (the
  cluster test). Neither is judged: they are the same pure
  reads w4melt already proved neutral.
- NEW this run, policy-side only, zero src/js changes:
  scripts/policies/tbstarts-diag.js (TBSTARTS=1), installed
  OUTERMOST (last). It wraps Game.startCombat (pre-call:
  call argument monsterId, day, pre-call tbfight id / over /
  fighter kinds + monster ids, player-tile monster via the
  pure monsterAt scan — never playerMonster() — plus a
  trimmed call-stack top for the call site; post-call:
  tbfight id / over / fighter kinds + monster ids, lifted
  flag for the pre-call tile monster via world-list
  membership, worldOrigin set flag; refused flag computed as
  pre-call live fight id == post-call fight id with the
  pre-call fight still live), Game.tbEnd (pre-call: fight id,
  result, fighter kinds + monster ids; post-call: tbfight
  null or not), and Game.tbBarrierExit (pre/post tbfight id
  — the dissolve site marker; a dissolve row names the
  fight id it killed). Pure reads only: writes nothing to
  game state, draws no RNG, never throws into the engine
  (recording errors counted), returns original values
  untouched. Unset, it delegates byte-identically (no wraps,
  no ctx surface) — the detgate proves it.
- New sweep-side only (no recorder edits):
  scripts/test-tbstarts-diag-sweep.js — plain arm, armed arm
  with the three recorders above, summary gate armed-vs-plain
  exact + tbstarts pairing print (starts joined to tbEnds by
  fight id, in order; refused calls, instant-settled calls,
  dissolved calls, and live-at-call-end calls separated),
  corpusOk extended to tbstarts errs 0 + no overflow.
- New proof validator: scripts/test-tbstarts-a.js (pure corpus
  analysis, no harness, no RNG): re-derives the plain band,
  the armed band, the armed-vs-plain exactness, the corpus
  error counts, the per-seed start/settlement pairing, and
  each DIAG-GO leg from the corpus files, and exits non-zero
  on any mismatch with the evidence numbers it is given.
- New sense script: scripts/test-tbstarts-sense.js (NON-MEASURED
  replay only; replay text never enters any count) for the
  one cluster sense-read.

## DEFINITIONS (fixed here)

- START: one tbstarts startCombat row (one startCombat call
  that returned without throwing; a call that throws records
  no post row and is not a start).
- SETTLEMENT: one tbstarts tbEnd row (one tbEnd call; the
  party betrayal wrapper is tbEnd itself, so betrayal
  endings ARE settlements — a betrayal result row is a
  settlement, not a null-site exit).
- UNSETTLED START: a start with no tbEnd row carrying the
  same fight id at any later point in the seed.
- CLASSIFICATION (exactly one per unsettled start, fixed
  here): REFUSED — pre-call live fight id == post-call fight
  id (the call created no fight; the live fight later settles
  or dissolves under its own id, cited by that id);
  INSTANT-SETTLED — post-call fight id is new AND a tbEnd row
  for that id exists (this is a settled start, not an
  unsettled start; it must not be counted unsettled even if
  the w4melt-style post-call fighter read was empty);
  DISSOLVED — post-call fight id is new AND a tbBarrierExit
  dissolve marker names that id with no tbEnd row for it
  (code site: game.js tbBarrierExit dissolve, ~l34869);
  ABANDONED-WITHOUT-TBEND — post-call fight id is new, no
  tbEnd row for it, no dissolve marker for it (code site
  cited from the next startCombat / daily observation that
  first shows the id gone, named in the evidence; if no site
  can be named, the start is UNCLASSIFIED and leg (a) fails);
  MERGED/CONTINUED — the start's fight id reappears as the
  pre-call live fight of a later start or as a tbEnd id
  under a different recorded id with a stated join rule
  (never assumed from day proximity alone); RECORDER-GAP —
  a start whose matching tbEnd exists in another recorder's
  rows but not in tbstarts rows, with the proof quoted
  (recorder errs > 0 alone is never proof of a gap); or
  another NAMED class, defined in the evidence before use.
- CLUSTER DAYS (fixed): d113-118, d126-127, d152 on 73675
  (the w4melt clusters). The band-wide test also reports
  every other seed's unsettled surplus, if any (w4melt
  corpus says none, but the resweep's pairing is the
  authority, not the corpus).
- RAID / SIEGE / ARRIVAL DAYS (fixed): raid days = raftdraft
  raid day list per seed; arrival days = spawnsrc birth days
  per wave-4 seq per seed; siege days = there is NO single
  named siege-event day in the corpus vocabulary (lingering
  gorges happen nightly, per w4melt) — a "siege cluster"
  claim requires a named siege event day, and none is
  invented. The test is membership of each cluster day in
  the seed's raid-day list and in the relevant seq's
  arrival history, named per seed.

## BINDING DIAG-GO RULE (write verbatim in the prereg, judge only against this; ALL required)

(a) every unsettled start on 73675 (61 starts vs 28 tbEnd in w4melt-diag, or the actual count on your resweep — state which) is assigned to exactly ONE class: abandoned-without-tbEnd with the code site cited, merged/continued under another fight id, recorder gap with proof, or another NAMED class. Any unclassified start = DIAG-NO-GO, never re-scored.
(b) The cluster days (d113–118, d126–127, d152) are TESTED against raid/siege/arrival days per seed — named, not assumed; a shared calendar day across seeds is not a shared cause, said plainly whatever the per-seed answers are.
(c) Impact statement: do unsettled starts affect any melt settlement, headline, or wave-4 kill count on the band? Answer from the classified rows, not by assertion.
(d) One cluster sense-read in plain words (non-measured replay allowed; replay text never enters any count).

Gates (STOP, not verdict inputs): armed-vs-plain exactness
on all shared fields; corpus recorder errors 0 on all THREE
recorders, no overflow; detgate PASS on 73675; analyzer-free
validator proof (scripts/test-tbstarts-a.js) green. Any leg
missing = DIAG-NO-GO. Any gate failing = STOP and report,
no verdict judged.

## SENSE PLAN (selection rule fixed before sweeping)

- Sense cluster = the d113-118 cluster on 73675 (the largest
  cluster, fixed here). Its census timeline is the authoritative
  thread. A NON-MEASURED narration replay
  (scripts/test-tbstarts-sense.js, SEED=73675 DAYS=169, window
  d111-120) is run for wording/meaning only; if the replay's
  trajectory shifts past the census thread, the divergence is
  disclosed, not hidden, and the replay proves wording only.
  Replay text never enters any count.

## METRIC REVIEW (mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. No metric is re-scored in this run.

## BALANCED-PANEL / TELEMETRY NOTE (standing exception, carried)

scripts/balance-panel.js cannot ingest per-seed recorder
corpora (carried from w4funnel-repin-a and w4melt-a) — the
sweep-compare table + validator output are attached instead,
and telemetry-check is NOT run on recorder rows (its counts
are wrong on recorder rows). No panel file is faked and no
telemetry baseline is rolled on recorder rows.

## WALL NUMBERS TO REPORT (every run)

national-ever / national-final, table invited / entered,
wins, wave 4-5 unlocks, median survival, deaths, starvation
deaths, wave-4 kills total + per seed, death-cause shares.
