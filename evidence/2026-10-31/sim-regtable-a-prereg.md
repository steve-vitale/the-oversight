# sim-regtable-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1535Z.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero edits to existing policy files, no gate
threshold or demand number moved. The deliverable is the trace +
verdict; no lever fix is built here.

Backlog item: "REGIONAL-TABLE EXCEPTION 87103" (Loop A
sim-wavegate-a, evidence/2026-10-31/sim-wavegate-a.md, metric-review
item 4 + non-national seeds section). Wavegate's prior-base finding,
quoted as prior-base context only (never re-judged here): seed 87103
reached the table at regional rank without national (wave 4 day 57,
village-lost at 88d, regional, never national, never won) — 6
national seeds + 87103 regional make the 7/19 table count. Flagged,
not judged, there: if the table is supposed to require national
standing (the deedGateReady scale clause), this seed is a
counterexample worth a targeted check — or the table's scale
requirement is looser than the national framing suggests.

## Primary question

On THIS base, with the wavegate win-pursuit stack, does seed 87103
reach the table at regional rank — and if so, through WHICH seat?
The verdict turns on what the code actually requires, not on the
framing. The table has two seats, and only one of them carries the
national bar.

## Code canon (read before sims — not invented)

- src/js/progression.js:613 deedGateReady() — the FULL seat gate.
  `ok` requires waves 5/5/4/3/2 distinct fought, contests >= 3,
  crises >= 3, stage >= 2, foodDeeds (sentimentTaught &&
  feastSurgeUsed), AND scale: `rank === 'national' || rank ===
  'global'` (Steve ruling 2026-10-27, enforced in `ok`, not merely
  reported; the 2026-10-13 "reported but not gating" reading is
  superseded — see also scripts/policies/fullseat-diag.js header).
- src/js/table.js tableSeat() — the seat actually priced at the
  table. Full first (deedGateReady().ok); failing that, LESSER iff
  w1>=4, w2>=4, w3>=3, contests >= 2, crises >= 2, scaleOk
  (rank regional OR national OR global), stage >= 2, foodDeeds.
  Below the lesser bar the table does not come (ledger.js
  tableScene withdrawal beat).
- src/js/progression.js checkArc() — Arc IV / tableWaiting: set
  when want >= 3 AND seatNow is 'full' OR 'lesser'. So
  tableWaiting/tableDone (wavegate's "table" metric) fires for
  EITHER seat. A regional table is therefore NOT, by itself, a
  counterexample to the full seat's national bar — it is exactly
  what the lesser seat is designed to do (docs/TABLE.md "The seat:
  full / lesser / none": Steve 2026-10-11 "the table prices the
  run, never gates on godhood"; the full seat keeps the national
  bar, the lesser seat needs regional+).
- src/js/hierarchy.js scaleRank() — village/regional/national/
  global from networkLive/nationalLive/globalLive flags; global
  implies national implies regional, never a skip.
- src/js/table.js tableScene() + winDayFloorOk() (day >= 90) —
  the scene fires the next dawn after tableWaiting; a sitting
  before day 90 is deferred (winDeferred), the table re-offers
  once the floor passes. A village lost before day 90 with
  tableWaiting set was invited but never sat.

## Base pin

- Worktree HEAD at prereg time:
  18da20b586aeb018d1357170aeb2e2c3176d3ffb ("journey-scale r62:
  closeout — landing section filled (merge d7c270005)").
- This base is NEWER than wavegate's anchor (4c92bbb04). Trajectories
  on the same seeds may therefore differ from wavegate's corpus.
  This arm judges ONLY its own corpus on THIS base; wavegate
  numbers (w4 57, table 71, lost 88, regional) are quoted as
  prior-base context, never as current data. Agreement with them
  is reported as a consistency check, not assumed. If 87103 does
  not reproduce a regional table on this base, that is base drift
  (verdict EXPLAINED, drift documented) — not a reason to re-run
  on wavegate's base or to re-judge wavegate's corpus.

## Seed plan (fixed now; no band-shopping)

Wavegate band = 19 seeds (pilot 8 + confirm 11):
87104, 87115, 87119, 87127, 87137, 87140, 87109, 87120, 87121,
87124, 87126, 87134, 87107, 87135, 87132, 87123, 87103, 87138,
87128.

- Pilot (4): 87103 (deep trace) + 3 contrasts:
  - 87121: national-table (wavegate prior-base: nat 77, w4 139,
    table 143, win 143).
  - 87104: national-no-table (wavegate prior-base: nat 78,
    survived 201, no table).
  - 87107: no-table contrast (wavegate prior-base: village rank,
    village-lost 111d, no table). ADAPTATION, stated now: the
    task brief asks for a "regional-no-table seed from the
    wavegate band" — NO SUCH SEED EXISTS in the band. The band's
    only regional-ending seed is 87103 itself; the other three
    non-national seeds all end at village rank (87107, 87128,
    87138). 87107 is therefore the no-table contrast, and the
    confirm scan additionally classifies every band seed by
    ever-regional-but-never-table (from daily rank rows), so the
    regional-no-table question is answered band-wide rather than
    by a nonexistent single seed.
- Confirm scan (remaining 15 band seeds): 87115, 87119, 87127,
  87137, 87140, 87109, 87120, 87124, 87126, 87134, 87135, 87132,
  87123, 87138, 87128 — scanned ONLY for: any other regional-
  table case (tableDay with rank regional at that day), plus
  ever-regional-no-table cases. No other quantity is judged on
  the scan; scan seeds get the same recorder rows, but their
  wavegate quantities are not re-judged.

## Policy stack (identical to wavegate, plus one new recorder)

- withRegtableDiag(withWavegateDiag(withFullseatDiag(
  withSeatDrive(withWinDefer(TF leadfeast))))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 WAVEGATE=1 REGTABLE=1, 200d death-aware cap (harness
  Game.over stop; dead villages stop simulating).
- NEW recorder: scripts/policies/regtable-diag.js (REGTABLE=1).
  It wraps OUTSIDE wavegate-diag and records AFTER the inner
  daily runs, one compact row per day. It calls tableSeat() and
  deedGateReady() daily — calls the base stack ALREADY makes
  daily via fullseat-diag's snap (inner layer runs first), so no
  new state write is introduced by this layer; trajectory
  neutrality is PROVEN by the det leg, not assumed.
- Daily row reads ONLY: day; scaleRank(); tableSeat() seat +
  detail (w1..w5, contestsN, crisesN, rank, stage, foodDeeds);
  deedGateReady() ok + components (waves, contests, crises,
  scale, stageOk, foodDeeds, rank); progState() arc,
  tableWaiting, tableDone, tableAnnounced; Game.won;
  Game.villageLost; winDayFloorOk(). Say capture: sysSay lines
  containing 'table' (case-insensitive) for the sense read,
  installed after wavegate's capture and removed before it
  (nesting order preserved on uninstall).
- The recorder takes no muster verb, no call, no button press,
  no policy action. It cannot move a trajectory except through
  a bug — which the det leg exists to catch.

## Det-gate (before judged sims are trusted)

- scripts/regtable-det-20261031.sh (shell + node compare): runs
  87103 and 87121 twice each — recorder ON vs recorder OFF
  (REGTABLE=1 vs unset; the rest of the stack identical, wavegate
  recorder ON in both legs) — to worktree scratch dirs
  (scratch-regtable-det/, deleted before commit; NEVER /tmp for
  judged-adjacent work, and never the judged corpus), and
  compares dayHash arrays + end fields (gameDays, won, national,
  table, maxWave, endScaleRank, endReason). Requirement:
  byte-identical hashes and identical end fields on both seeds.
  A mismatch stops the run (DIAG-NO-GO on instrument grounds)
  until explained.
- Corpus determinism leg: judged 87103 re-run to a scratch dir
  is byte-identical to its judged JSON.
- Runner discipline (prior-run lessons): the sweep prints ONE
  JSON line per seed to stdout (foreground exec, stdout→file +
  stderr→file, never a backgrounded pipe); a separate idle
  splitter process (no game loaded) turns the stdout file into
  per-seed JSONs under evidence/2026-10-31/perseed-regtable/.
  The game-loaded process writes no files. Judged corpora are
  never staged in /tmp.

## Classification rules (binding)

- MILESTONES (first day each is true in daily rows; null if
  never): tableDay (tableWaiting or tableDone true, same
  definition as wavegate for comparability); tableDoneDay
  (tableDone true); rankAtTableDay (recorder rank on tableDay);
  seatAtTableDay (recorder seat on tableDay: full / lesser /
  none); fullOkAtTableDay (deedGateReady().ok on tableDay);
  firstLesserDay (seat lesser); firstFullDay (seat full);
  winDay (Game.won true); endRank; endSeat.
- REGIONAL-TABLE CASE: tableDay != null AND rankAtTableDay ===
  'regional'. NATIONAL-TABLE CASE: rankAtTableDay national/global.
- EVER-REGIONAL-NO-TABLE: any daily row rank regional (or
  higher-but-never-national? No: strictly — any row rank ===
  'regional') AND tableDay == null.
- RANK-AT-MOMENT CHECK: endRank alone never decides the case;
  only rankAtTableDay does. A seed that was national on table
  day and regional at end is a timing subtlety, not a regional
  table.

## Verdict rules (stated now, judged later, never re-scored)

- COUNTEREXAMPLE CONFIRMED iff on this base 87103 (or any scan
  seed) shows tableWaiting/tableDone true while EITHER
  seatAtTableDay === 'full' at regional rank (full granted below
  national — a code bug against deedGateReady's scale clause) OR
  seatAtTableDay === 'none' (the table fires with no seat) OR
  the rank reading itself is contradicted (e.g. scaleRank says
  regional while the deedGateReady detail rank says national on
  the same day — an instrument/code contradiction, named as
  such). The code citation for the violated requirement must be
  quoted in the evidence.
- EXPLAINED iff 87103's regional table (if reproduced) is a
  lesser seat at regional rank with fullOk false (scale failing
  in the full gate, as designed) — OR the table day rank was
  national/global (timing/rank-at-moment subtlety) — OR 87103
  does not reproduce a regional table on this base (base drift,
  with the drift milestones named) — OR the wavegate "table"
  reading itself is corrected (e.g. tableWaiting set but the
  scene withdrew it, tableDone never true — with the day rows
  to prove it). Each EXPLAINED branch names its evidence.
- DIAG-NO-GO iff the trace is incomplete (gaps, recorder errors
  > 0 unexplained), the det-gate fails unexplained, or a required
  verdict section is missing. A miss is NO-GO, never re-scored
  mid-run; metric doubts go under "metric review" for the next
  run.

## Primary metric

Trace completeness + verdict determinacy on the judged corpus:
87103 has an unbroken daily row series from day 1 to run end (no
gaps, recorder errors 0), seat + rank + full-gate recorded on
tableDay (if any) and at end, the det-gate passes on both det
seeds, the determinism leg passes on 87103, and the confirm scan
classifies all 19 band seeds (table? seat at table day? rank at
table day? ever-regional-no-table?). Cross-checks: (i) my
tableDay agrees with the wavegate-row tableWaiting/tableDone
derivation on the same run (both recorders run together); (ii)
det-gate byte-identity; (iii) recorder errors == 0 on every
seed.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to wavegate: wavegate's 87103
ended at 88d; the cap exists only for survivors, and the
death-aware stop keeps cost at the survival distribution.

## Panel (§15)

NOT APPLICABLE — single-base DIAG check, no before/after lever
comparison exists in this arm; none fabricated (same declaration
as wavegate-a / heraldcontact-a). The det leg compares recorder-
on vs recorder-off trajectories of the SAME stack; it is a
neutrality proof, not a panel comparison, and its numbers never
enter the classification tables.

## Sense-testing (SENSE-TESTING LAW)

The recorder captures table sysSay lines. The evidence judges
87103's table approach in words: what did the village hear when
the table came (lesser-seat pricing? audit naming the real deeds?
a lesser seat priced honestly, or a national-sounding promise at
regional standing?), and did the village die before the day-90
floor with the invitation still waiting? Counts alone do not pass
this section.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the seat/rank/gate rows agree
  with the engine on every seed, did the det-gate hold, did any
  classification rule misfire, did the pilot gate behave, did
  the base drift from wavegate's milestones and by how much.)
