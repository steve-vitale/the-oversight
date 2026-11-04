# Journey endgame r121 — PRE-REGISTRATION (lane B, 2026-11-03 21:00 CST run, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing —
a failed run does not advance the leg, per r103/r104/r105/r109/r110/
r118 precedent). Run number basis: the Lane B counter is shared
across legs — latest completed is r119 (succession closeout
recovery, 2026-11-03 18:00 CST); r120 died mid-run (see below), so
this run is r121. Slug: journey2-endgame-r121 (NOT journey2-endgame:
that slug is held by r120's dead-but-DIRTY tree and must not be
clobbered; see run-start incidents).

Run-start incidents (infrastructure, not measurement):
- STALE-LOCK RECOVERY: lock loop2-20261104T005553Z (2026-11-04
  00:55:53Z) had NO registered tree with that run_id and NO heartbeat
  under 15 min — the journey2-endgame tree's heartbeat was 61 min
  stale (2026-11-04T01:54:27Z), no live process touched that tree,
  and no file there changed after 01:50Z. Dead per the overlap guard
  no matter how fresh the lock looked; also past the 90-min
  fallback. Deleted; fresh lock loop2-20261104T025627Z written, held
  throughout, deleted at closeout only after verifying it still
  carries this run's run_id.
- REGISTRY-LOCK CONTENTION: registration queued ~12 min behind a
  sibling register (lane A registering journey-landing at the same
  time; its reap held REGISTRY.lock). The register's `git worktree
  add` child was slow, not stuck (63,998 files checked out).
  Registration succeeded; heartbeat loop started after
  registration; registry heartbeat verified landed
  2026-11-04T03:10:54Z (active). Beats every 600s.
- R120 HELD WORK — DO NOT TOUCH: the journey2-endgame tree is dirty
  (uncommitted r120 toggle work: scripts + evidence for all 5
  configs present, 6 files per perseed dir, base-sweep 8 files) AND
  its src/js files are gutted in the worktree (git diff: fieldFights.js
  -2558 lines, sigW4.js -1021 lines, deletions only). That shape
  matches either a toggle driver dying before its `git checkout --`
  restore or the EPERM-flap truncation class — the owning run is
  dead, so this tree needs main-session inspection before anything
  is restored, analyzed, or landed from it. This run reads it
  read-only for status counts only, never copies its src state, and
  never merges it. Flagged loudly in the run note and final message.
- Main tree clean at pre-flight (0 files), disk 31%, pull up to date
  at c4c9865ce.

SUBSTRATE: r118 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Probe: scripts/probe-endgame-r121-20261104.js (r118 probe verbatim
EXCEPT renames r118->r121, evidence dir 2026-11-04/
perseed-endgame-r121, and header). Analyzer:
scripts/analyze-endgame-r121-20261104.js (r118 analyzer verbatim
EXCEPT input dir + pilot-scaled bindings below). Instrument +
evidence only for the pilot; any blank fix decided AFTER the pilot,
on its own proof test, narration only — if it touches seat logic
or any gate, do NOT land it (gating freeze, Steve 2026-10-27 16:53,
stands).

HEAD DELTA SINCE r118 (by commit range, descriptive only): win-intel,
win-drives, gap-seatshort and other landings since r118. The pilot
comparison to r118 is therefore descriptive, not an attribution —
only the game code changed between runs, but several landings did,
so no single-lever claim is made.

PILOT SEEDS (deliberate reuse, matched to r118): 89701 (waves),
89702 (waves), 89704 (forcedrift control), 89705 (wavesnw). Pilot
first per staged methodology: if the leg's question shows nothing
interesting in the pilot, document and move on — no full 7-seed
sweep burned.

R118 BASELINE (per-seed, for the matched pilot table):
- 89701 waves: village-lost/scattered, 0 fights, uw3, standing peak 99.
- 89702 waves: announced d90, WON LESSER, 10 fights (1 vKill),
  uw4, standing peak 199, full-seat gap w5 0/2.
- 89704 forcedrift: village-lost, 0 fights, uw3, standing peak 75.
- 89705 wavesnw: announced d113, WON LESSER, 7 fights (4 vKill),
  peakVet 2 @d99, uw4, standing peak 199, full-seat gap w5 0/2.
  (r110's 89705 had uw5 + a Timeslot face d112; r118 lost it — the
  wave-5 road loss this pilot re-checks.)

R121 QUESTION: on current HEAD, does the endgame pilot still show
the wave-5 road closed — lesser seat only, no uw5, standing capped
at 199 — or does any pilot seed recover a wave-5 unlock, a wave-5
face, or a full-seat sit? And do the villagers in the sitting
seeds read like people in their transcripts (sense, not counts)?
- ROAD-CHECK (descriptive, NOT gating): per-seed sat/won/end,
  census fights by outcome, killsW4, peakVet, uw, w5faces, standing
  peak, r118 vs r121. Direction noted; no causal claim, no
  significance claim on n=4.
- MFLEE-ROUTED (coverage bar, GATING): every mFlee fight carries
  gotAwayLines (array) + closeSnapResult + closeWhy. A mFlee with
  monFled=true on a kind WITHOUT an explicit flee component is a
  monster-commitment VIOLATION (LOOK, same-run investigation).
- SIT-DAY-DEATHS (INFO only): deaths on satDay and in the pre-sit
  week, flagged veteran-killer or not.
- PEOPLE CHECK (sense judgment, REQUIRED): read the full transcript
  of at least one sitting seed end to end — do the villagers'
  words want something, resolve/plant/owe, and stay coherent? A
  count of lines is not a pass.
- CENSUS (REQUIRED): plain-words village assessment per seed — who
  lived, who died, what they knew, what was missing.

INTERESTING FINDING (what would count): any full-seat win; any
wave-5 unlock or face; any mFlee carrying monFled=true on a
non-flee kind; any sit-day veteran death; a 89705 return to uw5;
a 89702/89705 outcome-class flip vs r118; any transcript passage
that is senseless, robotic, or self-contradictory (a blank to fix
or document).

BINDINGS (pilot-scaled from r118; metric binding §14 — a miss is
NO-GO, never re-scored mid-run):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights (no policy-only opens unexplained).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing
  (table/announce/sit lines present) or a named fallback.
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (which bars short, with numbers).
- M11-standing-peak: standing peak reported for 4/4 seeds.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count across the 4 pilot seeds.

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.)
