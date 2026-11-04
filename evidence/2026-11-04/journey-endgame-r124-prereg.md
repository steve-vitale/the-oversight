# Journey endgame r124 — PRE-REGISTRATION (lane B, 2026-11-04 02:00 CST run, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing —
a failed run does not advance the leg, per r103/r104/r105/r109/r110/
r118/r121 precedent). Run number basis: the Lane B counter is shared
across legs — latest completed is r123 (succession closeout, landed
2026-11-04 08:00Z during this run's start window; see run-start
incidents). This run is r124. Slug: journey2-endgame-r124 (NOT
journey2-endgame: that slug is held by r120's dead-but-DIRTY tree
and must not be clobbered; see r121 prereg, unchanged).

Run-start incidents (infrastructure, not measurement):
- OVERLAP, NOT A STALE LOCK: this run started 01:57 CST while r123
  (succession, lock 2026-11-04T06:55:42Z, tree journey2-succession-
  r123) was still closing out. Its registry heartbeat was 17 min
  stale at first check (07:41Z) but its run note was written 07:49Z
  and no r123 process was visible — a heartbeat loop that had
  stopped, not a dead coordinator. This run did NOT delete that
  lock, did NOT register over it, and did NOT rebase or merge its
  branch. At 08:00–08:01Z r123's owner merged it ff-only into
  master itself (reflog: merge journey2-succession-r123, then
  sim-vfrac-a), set rotation-b 7 -> 4, deleted the lock, and
  removed the tree. Lesson re-confirmed: a stale heartbeat plus a
  recent file write is a live closeout, not a dead run. This run
  then took the now-free leg 4 (rotation 4) with its own lock
  2026-11-04T08:02:18Z and fresh slug journey2-endgame-r124.
- REGISTRY-LOCK CONTENTION: registration queued behind sibling
  work (Lane A journey-establishment register stuck since 07:49Z
  on the same lock, plus the register's own reap). Registration
  succeeded after ~3 min; heartbeat verified landed
  2026-11-04T08:05:20Z (active). Beats every 600s, log readable
  (not /dev/null).
- R120 HELD WORK — DO NOT TOUCH: unchanged from r121. The
  journey2-endgame tree is dirty AND its src/js files are gutted
  in the worktree (fieldFights.js -2558, sigW4.js -1021,
  deletions only). Read-only status counts only, never copied,
  never merged. Needs main-session inspection.
- Main tree clean at pre-flight (0 files), disk 30%, git pull
  "Already up to date" at 33900dfaa (origin/master fa33fc89c is
  an ancestor of local master; local merges are unpushed,
  pending ship — ship loop owns pushes).

SUBSTRATE: r118 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Probe: scripts/probe-endgame-r124-20261104.js (r121 probe verbatim
EXCEPT renames r121->r124, evidence dir 2026-11-04/
perseed-endgame-r124, header, and ONE new read-only instrument:
FIRENARR scan over the full SAY capture — see below). Analyzer:
scripts/analyze-endgame-r124-20261104.js (r121 analyzer verbatim
EXCEPT input dir, r121->r124, the two r121 metric-review proposals
applied — see METRIC REVIEW APPLIED — and a FIRENARR section).
Instrument + evidence only for the pilot; any blank fix decided
AFTER the pilot, on its own proof test, narration only — if it
touches seat logic or any gate, do NOT land it (gating freeze,
Steve 2026-10-27 16:53, stands).

HEAD DELTA SINCE r121 (base c4c9865ce -> 33900dfaa, by commit
range, descriptive only): firenarr evening narration deploy
(de1271d6f, narration ONLY by its own spec — no gate, price,
deed, or readiness change), hierarchy crisis wording (def4f8f40,
"trust -10" now named aloud, wording only), tbobsfeed lever
(f418a9fa2) plus its KILL revert (7d9652174, net src diff zero),
version bump, and evidence/tooling landings (succession r123,
standacc, hurthome, vfrac, togglepin, landing r95, scale r94,
crisis r122, social r120, deepening r92). NO gameplay-effecting
game change is in the delta except firenarr's SAY lines
themselves. The pilot comparison to r121 is therefore a
narration-only confirmation, not a new road claim: any road flip
(full seat, uw5, face) would CONTRADICT the narration-only
reading and becomes a same-run investigation item.

PILOT SEEDS (deliberate reuse, matched to r121): 89701 (waves),
89702 (waves), 89704 (forcedrift control), 89705 (wavesnw). Pilot
first per staged methodology: if the leg's question shows nothing
interesting in the pilot, document and move on — no full 7-seed
sweep burned.

R121 BASELINE (per-seed, for the matched pilot table):
- 89701 waves: announced d140, sat d141, WON LESSER (feared/light,
  final:mercy), 16 fights (2 vKill, 10 talkDown, 1 vFlee, 1 mFlee,
  2 otherEnd), uw4, standing 199, peakVet 1@d51.
- 89702 waves: announced d107, sat d107, WON LESSER (beloved/light,
  final:audience), 11 fights (2 vKill, 3 mFlee, 4 vFlee, 2 otherEnd),
  uw4, standing 199, peakVet 1@d78.
- 89704 forcedrift: village-lost/scattered d61, 0 fights, uw3,
  standing 25, 18 deaths.
- 89705 wavesnw: announced d90, sat d104, WON LESSER (beloved/light,
  final:quiet), 16 fights (1 vKill, 12 mFlee, 2 vDie, 1 vFlee), uw4,
  standing 199, peakVet 1@d104, sit-day death Diana d104 (wild).

R124 QUESTION: on current HEAD, does the endgame pilot reproduce
r121's road exactly (lesser only, uw5 0, standing 199-capped,
veterans 1/2) while firenarr narration fires sensibly in these
long runs — and does the sit-day-death pattern recur a fourth
time, or does the dissolve-heavy fight shape of 89705 persist?
- ROAD-CHECK (descriptive, NOT gating): per-seed sat/won/end,
  census fights by outcome, killsW4, peakVet, uw, w5faces, standing
  peak, r121 vs r124. Direction noted; no causal claim, no
  significance claim on n=4.
- FIRENARR (new instrument, descriptive + sense): every SAY line
  matching the firenarr texts ("store has fallen from its recent
  high", "fallen far from its recent high", "keeps slipping from
  its recent high", "fallen further still") is logged with its
  day and kind (E1/E2/F/ESC). Sense bar: firenarr lines must
  appear only on falling-store evenings per the deploy spec —
  checked by reading the surrounding transcript context for a
  sample of firings, not by count alone. A firenarr line inside
  a table/audit final, or a firing on a rising-store evening,
  is a same-run investigation item.
- MFLEE-ROUTED (coverage bar, GATING): every mFlee fight carries
  gotAwayLines (array) + closeSnapResult + closeWhy. A mFlee with
  monFled=true on a kind WITHOUT an explicit flee component is a
  monster-commitment VIOLATION (LOOK, same-run investigation).
- SIT-DAY-DEATHS (INFO only, pattern watch): deaths on satDay and
  in the pre-sit week, flagged veteran-killer or not. r110 d120
  alien, r121 d104 wild, r121 d107 alien (Nadia) — a fourth
  sit-day death is a named pattern, not yet a defect claim.
- PEOPLE CHECK (sense judgment, REQUIRED): read the full transcript
  of at least one sitting seed end to end — do the villagers'
  words want something, resolve/plant/owe, and stay coherent? A
  count of lines is not a pass. Firenarr lines in that transcript
  must read as village speech, not ledger noise.
- CENSUS (REQUIRED): plain-words village assessment per seed — who
  lived, who died, what they knew, what was missing.

INTERESTING FINDING (what would count): any full-seat win; any
wave-5 unlock or face; any mFlee carrying monFled=true on a
non-flee kind; any sit-day death (fourth instance); a 89705
fight-shape flip away from dissolve-heavy (or toward it further);
any firenarr misfire (wrong evening, table-final pollution,
excessive repetition); any transcript passage that is senseless,
robotic, or self-contradictory (a blank to fix or document).

BINDINGS (pilot-scaled from r121; metric binding §14 — a miss is
NO-GO, never re-scored mid-run):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
  (Analyzer now takes the pilot bar directly; the r121 analyzer's
  stale >=5/7 denominator is retired, per r121 metric review.)
- M2-census: every census fight carries a named outcome; engine
  opens == census fights (no policy-only opens unexplained).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing
  (table/announce/sit lines present) or a named fallback. A control
  dead before the window with NO relay final in the block is
  INFO/vacuous, not NO-GO (per r121 metric review).
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (which bars short, with numbers).
- M11-standing-peak: standing peak reported for 4/4 seeds.
- FIRENARR-captured: every pilot JSON carries a firenarr array
  (instrument health; counts are descriptive, not a bar).
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count across the 4 pilot seeds. M3b-peak and
  M4-wave5-or-full / W5-question are likewise tallies this run:
  their analyzer NO-GO on a closed road is the expected road
  reading, not a pilot failure (same reading as r121).

METRIC REVIEW APPLIED (r121 proposals, applied BEFORE this run's
scoring, never mid-run):
- M1 denominator: pilot bar >=3/4 in the analyzer, replacing the
  stale >=5/7 print.
- M5 vacuous: control-dead-before-window + zero relay finals in
  block = INFO/vacuous GO, not NO-GO.
- M3b-peak: kept informational until a run banks a pair; does not
  gate this pilot.

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.)
