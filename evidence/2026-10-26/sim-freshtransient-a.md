# sim-freshtransient-a — exercise a FRESH transient-national event (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-freshtransient-a.
DIAG ONLY — zero src/js changes, zero default flips, no edits to
any existing policy, sweep, summary, or check file. New files only:
a new sweep, a new proof test, this evidence file, and the new
per-seed corpus. scripts/test-natpair-sweep.js and every existing
policy/sweep file are read, never edited.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest; no single canon doc
  covers the transient-national instrument — the question lives
  in sweep code, not in a design doc, said so here instead of
  inventing a canon doc), docs/SCALE.md (national is a LIVE
  state, not a title: when the realm dissolves, nationalLive
  falls — a rank that rises and falls within a day is real game
  behavior, not by itself an instrument artifact), docs/TABLE.md
  (the table prices the run, never gates on godhood),
  docs/MONSTER-WAVES.md (wave law; wave 4 = the Mirror Draft).
  The instrument question is about how sweeps READ national
  reach, not about what national means in canon.
- Context read first and VERIFIED from the files, not trusted
  blindly: evidence/2026-10-26/sim-driveoff-clean-a.md (the one
  genuine transient on record) and its corpus row
  evidence/2026-10-26/perseed-sim-driveoff-clean-a/s73673-clean.json,
  read directly: days 129, won 0, finalRank regional, maxRank
  regional, nationalEver 0, table 1, entered 0, tsNationalDay 86,
  1 draw (cliffhanger, day 38) driven off via the intercept,
  patrol 3 sweeps. And evidence/2026-10-26/sim-natpair-a.md (the
  natpair mechanism: national rises inside base.daily courtship,
  the seat leg + post-daily snap catch it that day, the pre-daily
  snap only the next day — a one-night window; natpair's fresh
  band 73671–73678, plain tableseat-nowait, found 0 fresh
  transients; its named next blank is explicit: a future arm
  needing a transient should use the driveoff-clean shape plus
  the post-daily snap). This arm IS that future arm.
- Composition (new file only): scripts/test-freshtransient-sweep.js
  composes the driveoff-clean policy (FEASTDRAWCLEAN=1,
  tableseat-nowait substrate, COMPETENT_SEEK_FIGHTS left ON,
  feastdraw + nonworldkill recorders installed exactly as the
  driveoff-clean sweep does) with the natpair pre/post-daily
  snaps (pre-daily snap, delegate base.daily, post-daily snap +
  per-day rank trace, exactly as the natpair sweep does). The
  snaps and the say-line capture are PURE READS: they read
  scaleRank()/progState() and record lines; no game call is
  added, removed, or reordered. The det-gate proves it (plain
  driveoff-clean vs driveoff-clean + snaps, seed 73671, a
  non-transient seed: days/gameDays/won/deaths/tsNationalDay
  identical; the detgate artifact is recorded as detgate.json
  in the corpus dir and asserted by the proof test).
- POSITIVE CONTROL FIRST: driveoff-clean + snaps on seed 73673,
  180d death-aware. The post-daily snap MUST show national
  on/near day 86 while the pre-daily snap misses it, with the
  day and direction (rose-inside-daily) located in the rank
  trace. If the positive control fails, STOP and report an
  instrument failure — do not go hunting.
- FRESH HUNT: driveoff-clean + pre/post snaps on a FRESH 8-seed
  band. Freshness verified the way the 2215Z run did: the seeds
  must appear in NO dated evidence .md file and NO perseed
  corpus filename under evidence/2026-10-2*/. Never reuse
  73671–73678, 73661–73668, or any seed already in evidence
  filenames. Freshness check (run before any sweep, grep -rl
  word-boundary per seed over evidence/2026-10-2*/ *.md plus
  perseed corpus filenames): candidate band 73701–73708 FAILED
  (73701 in 6 .md files, 73708 in 1); candidate bands
  73711–73718 and 73801–73808 FAILED (stray .md hits);
  band 73901–73908 PASSED 8/8 (md=0 and corpus=0 on every
  seed). The fresh band is therefore 73901–73908, and the
  sweep default SEEDS is that band.
- DIAG-GO (binding): DIAG-GO requires the positive control
  captured — post-snap national present, pre-snap absent, day +
  direction located. The fresh hunt outcome is REPORTED, not
  re-scored: finding 0/8 fresh transients is a reported result
  (transients are rare), NOT an arm failure — the deliverable
  is the exercised instrument plus the rate. If the positive
  control fails, the verdict is INSTRUMENT-FAILED, not NO-GO
  on the game.
- Definitions (verbatim from natpair): SNAPNAT = row
  nationalEver (0/1, pre-daily hist + final snap). TSPRESENT =
  tsNationalDay != null. MAXNAT = maxRank in {national,
  global}. POSTNAT = postMaxRank in {national, global}
  (diagnostic). OLDPAIRED = (SNAPNAT === TSPRESENT) literal.
  NEWPAIRED = (SNAPNAT === (TSPRESENT ? 1 : 0)). Classes:
  agree | transient-ts-only | snap-only | final-only |
  post-explained-transient | unclassified, via classifyPairing
  from the natpair sweep (imported read-only).
- SENSE plan: (1) a plain-words story of one transient day
  (what the village did that day, from the rank trace +
  say-lines); (2) a villager-behavior spot check from the
  fresh rows' say-lines (SENSE-TESTING LAW: read transcripts/
  dialogue, judge meaning, not counts). Nothing new is
  introduced by this arm (zero src/js, zero policy behavior
  change — the sweep only reads and the base policy is an
  existing instrument), so report the texture honestly rather
  than inventing a behavior finding.
- PILOT GATE: the positive control IS the pilot — it must
  capture before any fresh-band spend.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — do
  NOT fabricate panel inputs for recorder corpora. The
  sweep-compare table is the comparison of record. Do NOT run
  telemetry-check on recorder rows and do NOT roll any
  baseline.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind the
  run — a miss is NO-GO, never re-scored against a friendlier
  metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: POSITIVE CONTROL NOT CAPTURED — STOP RULE TRIGGERED, FRESH HUNT NOT RUN

The pre-registered stop rule fired: the positive control (seed
73673, driveoff-clean + snaps) did NOT capture a transient —
post-snap national present, but the pre-daily snap did NOT miss
it (nationalEver 1, maxRank global, class agree). Per the
pre-registration, the fresh hunt (band 73901–73908, verified
fresh above) was NOT run. This verdict is labeled the way the
pre-registration requires — the positive-control leg failed —
but the cause is established in the same breath, and it is NOT
a broken instrument: two detgates prove the composition moves
no play (below), and every snap-ordering leg passes. What
failed is the ANCHOR: seed 73673 no longer plays the transient
on this base. It plays a durable national instead. The
instrument works; the old transient is gone. A future arm that
needs a transient must re-anchor first (find a transient on the
current base, or pin the base) — hunting the fresh band with
an unanchored positive would have produced a 0/8 nobody could
interpret, which is exactly what the stop rule exists to
prevent. The proof test honestly reports 12 passed / 3 failed,
and the 3 failures ARE this verdict (pre-snap absent, class
post-explained-transient, table invited) — the test failure is
the verdict, not a test bug, and it is not weakened to green.

## THE ANCHOR DRIFT, PROVEN (not assumed)

Worktree HEAD at this run: 9e3110ff4. The same seed 73673
plays three different trajectories on three bases, and 73671
does the same — drift, not instrument noise:

| seed | driveoff-clean corpus (old base) | natpair corpus (base 72cf7a672) | this run (base 9e3110ff4) |
|---|---|---|---|
| 73673 clean | lost d129, maxRank regional, natEver 0, ts 86, table invited, entered 0 | (plain arm) won d90, natEver 1, ts 84 | lost d168, maxRank global, natEver 1, ts 84, table 0, entered 0 |
| 73671 | survived d180, 31 deaths | lost d160, 50 deaths, ts 77 | lost d145, 38 deaths, ts 77 |

The ts day itself moved (86 -> 84) and the outcome flipped
from a one-night transient to a realm held from day 84 to
day 161. The old transient was a property of that base's
trajectory, not a stable fixture of the seed. The
driveoff-clean evidence's transient note remains true about
its own base; it is not reproducible on this one.

## THE POSITIVE-CONTROL ROW (seed 73673, driveoff-clean + snaps, current base)

days 168, gameDays 167, end village-lost, wave 4, arc 3,
finalRank regional, maxRank global, postMaxRank global,
natEver 1, natFinal 0, table 0, entered 0, won 0, starvation
0, deaths 45, tsNationalDay 84, preNationalDay 85,
postNationalDay 84, class agree, oldPaired false,
newPaired true, maxAgree true, draws 1, driven off 1,
patrol 4 sweeps. Rank trace: day 84 pre 1 -> post 2 (the rise
inside daily, exactly the natpair pattern: postNatDay ==
tsDay, preNatDay == tsDay + 1); day 88 post 3 (global);
day 161 post 3, day 162 pre 1 (the overnight fall, observed
in the open — the fall half of the transient window, on a
seed that was already snap-counted, so no transient).
The village held national 78 days (84 -> 161) and global
from day 88. No table invitation ever arrived on this
trajectory (table 0), unlike the old base's invited-but-
never-entered transient.

## DETGATES — THE INSTRUMENT MOVES NO PLAY (both seeds, exact)

- Seed 73671 (non-transient): plain driveoff-clean vs
  driveoff-clean + snaps: days 145/145, gameDays 145/145,
  won 0/0, deaths 38/38, ts 77/77 — MATCH.
- Seed 73673 (the positive-control seed itself): plain vs
  wrapped: days 168/168, gameDays 167/167, won 0/0, deaths
  45/45, ts 84/84 — MATCH.
Artifacts: perseed-sim-freshtransient-a/detgate-73671.json
and detgate-73673.json (per-seed files; detgate.json is a
copy of the latest run). The snap-ordering legs all pass in
the proof test: post-snap caught national the same day as
the seat leg (postNatDay == tsDay), pre-snap only the next
day, and the rank trace locates the rose-inside-daily day
(day 84, pre 1 -> post 2). The instrument is verified; the
anchor is what moved.

## SENSE-TESTING READ (plain words: the day the realm arrived, and the night it fell)

Day 83 the System announces the realm ("Four fires. One
head. GOVERNANCE LAYER: online"), and the codex stages the
national beat (lead, 4 villages). Day 84 the shared granary
opens — 5,000 kcal for every fire, Emberhold, Stonebridge
and Thornfield counting it and remembering who fed them
first — and the System leans in: "That's the whole PLANET
leaning in... There's a table, little fires. A big one.
Far away. And it is LOOKING at you." Day 87 the audience
picks Haven (viewership 34, planetary broadcast tier); day
88 Haven feasts for the cameras (5,156 kcal of theater) and
the System says "the table has your name now." Day 90 the
table flickers and does not come — "yours are not done."
The village holds the realm, feasts, and watches for
another ten weeks. Day 161 the realm comes apart, said
aloud: "no polity answers to Haven now, and Haven is a
free fire again... The climb starts over." Day 162's dawn
snap reads regional. The rise and the fall are both
narrated as polity moments with named villages and real
food, not as silent number changes — and the fall is the
transient window's second half, visible here only because
the rise had already been snap-counted for 77 days. A
transient is this same story with the fall on the FIRST
night instead of the 78th day.

## VILLAGER-BEHAVIOR SPOT CHECK (sense, not counts)

Nothing new is introduced by this arm (zero src/js, zero
policy behavior change — the sweep only reads, and the base
policy is an existing instrument), so there is no new
behavior to judge, and none is invented here. What the
73673 row's 91 say-lines show is the same coherent texture
as prior arms: the day-66 feast draw (Big Big) is driven
off by named villagers — "Pamela takes up a brand and
Hinehou follows — they meet it at the edge of the light
with noise and fire. Big Big was never brave. It melts
back into the dark." — a refusal with people in it, not a
status line. National arrival and loss are polity moments
(granary, court, named fires, a raid by The Red Table II
the night before the realm stages). No robotic, static, or
repeated dialogue was found in the sampled lines (days
80–95, 145–165).

## WALL NUMBERS (positive-control seed only — NO fresh band was run)

Seed 73673 (driveoff-clean + snaps, current base):
national-ever 1 (snap-counted), national-final 0, table
invited 0, entered 0, wins 0, wave-4 reached, wave-5 not
reached, Arc III, median/max survival n/a (single seed),
deaths 45, starvation 0, fresh transients: NOT MEASURED
(fresh hunt not run per the stop rule). The wall on this
seed moved since the old base: the village now climbs to
global and holds it for weeks, but still never sits at the
table — the table step, not national reach, is where this
seed stalls on the current base.

## BLANKS FILLED OR DOCUMENTED

- FILLED (instrument, proven on two detgates): the
  driveoff-clean + pre/post-snap composition is
  trajectory-neutral on both a non-transient seed (73671)
  and the positive-control seed itself (73673) — the
  composition a future transient arm needs now exists as a
  tested file, not a sketch.
- FILLED (mechanism, both halves observed on one seed):
  the transient window's rise half (day 84: pre 1 ->
  post 2, postNatDay == tsDay, preNatDay == tsDay + 1)
  and its fall half (day 161 post 3 -> day 162 pre 1,
  overnight) are both located in the 73673 rank trace —
  the window is real and exactly one night wide, even
  though no transient combined the halves on this run.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the
  positive-control anchor is stale on the current base —
  the next transient-needing arm must re-anchor (scan
  current-base driveoff-clean rows for a ts-present /
  snap-absent seed, or pin the base) before spending fresh
  seeds; (2) the fresh band 73901–73908 is verified fresh
  (md=0, corpus=0 on all 8) and still unrun — it is the
  standing fresh band for that re-anchored arm, not a
  band to re-verify from scratch; (3) the old
  driveoff-clean transient note (ts 86, table invited)
  remains true about its own base only and must not be
  cited as a current-base fact.
- CARRIED (not chased here): the table-entry step of the
  wall (this seed reaches global and still never sits);
  wave-5 remains unreached on this seed.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg, class, or definition was re-scored
mid-run. The run was judged exactly against its header:
DIAG-GO required the positive control captured (post-snap
national present, pre-snap absent, day + direction
located). Post-snap present: MET (postMaxRank global,
postNatDay 84 == tsDay 84). Day + direction located: MET
(rank trace day 84, pre 1 -> post 2, rose-inside-daily).
Pre-snap absent: MISSED (nationalEver 1, maxRank global,
class agree) — reported as POSITIVE CONTROL NOT CAPTURED
with the stop rule triggered, not softened to a partial
GO and not re-anchored to the natpair band mid-run, even
though the snap-ordering legs all pass (those passes are
reported as instrument evidence, not used as a substitute
gate). The fresh hunt was NOT run, so no fresh-band
numbers are claimed and no 0/8 is reported as a result.
Revision proposed for the NEXT run (not applied here):
pre-register the positive control against a CURRENT-base
anchor (a seed verified transient on the run's own base
before the gate), or pre-register the gate as "instrument
neutrality + snap ordering verified" with the anchor
reported separately — the composition itself needs no
further revision. The telemetry-check and balanced panel
were NOT run, per the standing exception (panel cannot
ingest per-seed recorder corpora; no panel inputs were
fabricated). The sweep row + detgate artifacts + this
evidence file are the comparison of record. No game code
changed; no [needs-eyes] flag applies (instrument only,
no narration, feel, combat, or UI change).

## Infrastructure notes

- Sweep: scripts/test-freshtransient-sweep.js (new file
  only: driveoff-clean policy + feastdraw/nonworldkill
  recorders + natpair pre/post-daily snaps + rank trace;
  modes --one freshtransient / --summary / --detgate).
  Corpus: evidence/2026-10-26/perseed-sim-freshtransient-a/
  (s73673-freshtransient.json + detgate-73671.json +
  detgate-73673.json + detgate.json copy; NO fresh-band
  rows — the fresh hunt was not run). Proof:
  scripts/test-freshtransient-a.js (12 passed / 3 failed —
  the 3 failures are the positive-control capture legs
  themselves, see metric review). Det-gates: PASS on both
  seeds (73671: 145/145 MATCH; 73673: 168/168 MATCH).
- Commit: sim-freshtransient-a, POSITIVE CONTROL NOT
  CAPTURED (anchor stale on current base, instrument
  verified neutral; fresh hunt not run per stop rule),
  zero src/js diff. Ready for coordinator merge; NOT
  pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
