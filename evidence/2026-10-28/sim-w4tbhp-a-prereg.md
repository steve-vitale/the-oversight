# sim-w4tbhp-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0320Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4tbhp-a.
Worktree: `~/workspace/worktrees/sim-w4tbhp-a` (branch sim-w4tbhp-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game fix proposed. The deliverable is knowledge: the
TB-START-HP CAUSAL GAP for wound2, closed or documented.

## The gap (why this arm exists)

The 0221Z lethality re-measurement
(evidence/2026-10-27/sim-w4lethality-rebase.md and
evidence/2026-10-27/sim-scale-onramp-round-0221.md) proved an
ASYMMETRY on the post-wound2 base — monster TB fighter HP is rebuilt
per fight (world 825/1100 vs TB fighter 1214/1214; world 300/1200 vs
five fresh fighters 1203-1367 in one day, 290 total damage, zero
accumulation) while player fighter HP DOES enter TB fights wounded
(below max in 10/28 TB fights, as low as 9/100) — but wound2 CAUSATION
is NOT proven, because no pre-wound2 TB-start-HP table exists. This
arm builds both tables on identical seeds and identical substrate
and states the causal verdict plainly.

## Base — stated explicitly (verified before this prereg was written)

- Base commit at worktree creation: 3264dbb80 ("journey-landing r63:
  base-drift re-read — meat tail opens thinnest (1/4 arrivals),
  scholar-slide HUNGRY on 680, 2-4d latency observed (zero src/js)").
- Wound2 commit ac9f1987b ("tackle-wound2: field wounds carry into
  turn-based fights [needs-eyes]") IS an ancestor of 3264dbb80
  (verified with `git merge-base --is-ancestor`). This band's POST
  side is therefore POST-wound2.
- Wound2's parent commit: 20010c093 ("tackle-succession: taken-over
  villager keeps their own worn gear, stashed belongings, and
  tongues [needs-eyes]"). The PRE side runs the parent commit's
  code, extracted — see "Pre-side mechanics" below.
- Wound2 diff read before this prereg (mechanism note, not a
  verdict): its only src/js change is src/js/fieldFights.js — a
  Haven field-fight ally enters at their real village.health and a
  surviving ally's wounds settle through the sealed record; the
  diff's own comment says TB entry "already reads village.health"
  and "the player's wounds travel through scholar.health". The
  prereg therefore does NOT presume wound2 causes below-max player
  TB starts: the mechanism as written touches ally field bodies,
  not player TB entry. The pre/post table is the judge, and the
  verdict rule below is symmetric.
- If master moves under this run, rebase inside this worktree,
  re-run the proof, and report the move — never merge master in,
  never touch the main tree.

## Canon read first

- docs/CANON.md, then docs/TABLE.md (the table prices the run,
  never gates on godhood; full seat keeps the national bar) and
  docs/MONSTER-WAVES.md (wave law; wave 4 = the Mirror Draft).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the code
  reading governs the measurement and the difference is reported.

## Prior evidence read first (this arm's definitions come from these)

- evidence/2026-10-27/sim-w4lethality-rebase.md (the post-wound2
  snapshot: 28 TB fights, player below-max starts 10/28, lowest
  9/100 on 75108 d110; monster rebuilt every fight).
- evidence/2026-10-27/sim-scale-onramp-round-0221.md (coordinator
  round: same asymmetry, same stated causal caveat).
- evidence/2026-10-27/sim-w4lethality-rebase-prereg.md (substrate,
  channel vocabulary, parity rule, detgate, sense rule — reused
  where this prereg says so, not re-argued).

## Definitions (reused VERBATIM from the lethality-rebase prereg)

- Channel vocabulary and precedence (trap > contest-arena-door
  (non-world) > non-world-TB (null-origin) > player-tb-world
  (world-origin TB) > raid-defender > villager-field > other);
  arrival/engaged/killed definitions; wall numbers (national
  ever/final, table invited (tableWaiting ever) / entered
  (tableDone ever), wins lesser/full split via tableState.seat,
  wave-4/5 unlocks, median survival with BOTH upper and
  conventional medians, death-cause shares).
- TB FIGHT (for this arm): a wave-4 nonworldkill start that is not
  excluded by classifyStart and not refused (pre.liveFight false —
  a refused startCombat call starts no fight). Same-call
  start-and-end fights (fightIdSource 'end-row') count: they did
  start a fight, and their start fighters are the TB-start record.
- TB-START-HP ROW (the judged unit): one TB fight, carrying the
  startCombat post-call fighter snapshot from nonworldkill
  starts: player fighter hp/maxHp at start (kind 'player'),
  monster fighter hp/maxHp at start (kind 'monster'), and, for
  world-origin fights, the world tile monster hp/maxHp at start
  (tileMonster). Player fraction = player hp / player maxHp;
  monster fraction = monster hp / monster maxHp. A start is
  BELOW-MAX when hp < maxHp (strictly). Rows with a null player
  fighter or null monster fighter are INCOMPLETE, never estimated,
  and count against leg (a) completeness.
- FIELD fights are NOT in the TB-start-HP table (they have no TB
  start fighters); they appear only in parity/fight counts.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (never edited), env LEANLINKRESCUE=1, TABLESEATNOWAIT=1
  (TABLEDEFIANT unset), PLUS recorder on-switches RAFTDRAFT=1,
  SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1, DEFWOUND=1, NONWORLDKILL=1,
  plus the tbdmg recorder (TBDMG=1).
- NEVER edited: tableseat-nowait.js, any existing recorder file,
  or any src/js file. New instruments only (copies, see below).
- Recorders reused verbatim, policy-side only: raftdraft-diag,
  spawnsrc-diag, oldcore-diag, w5births-diag, defwound-diag,
  nonworldkill-diag, tbdmg recorder. No recorder draws RNG, throws
  into the engine, or returns anything but the original value.
- Seeds 75101-75108, as assigned. Horizon 180d DEATH-AWARE
  (runDays stops on death/win; +10d tail max).
- Substrate-activation gate (binding, same as both predecessors):
  band courtship combined > 0 AND >= 6/8 seeds with non-zero
  combined courtship, judged on the POST side (the pre side's
  gate is reported, not separately gated — the substrate is the
  same policy, and pre-side trajectories will differ by base
  drift; a pre-side gate miss is disclosed, not hidden, and does
  not by itself invalidate the TB-start comparison, which is
  per-fight, not per-trajectory).

## Instruments (COPIES ONLY, originals untouched)

- scripts/test-w4tbhp-sweep.js (copy of
  test-w4lethality-rebase-sweep.js), differing from the original
  ONLY in: default corpus dir
  (evidence/2026-10-28/perseed-w4tbhp-a), labels, the loadGame
  mode label (a manifest label only — sim-harness.js reads mode
  into the manifest, never into game state or RNG; game RNG is
  seeded from the seed alone), and require-path renames to the
  -w4tbhp instrument names. Verified by diff before the judged
  sweep: every changed line is one of those renames; no logic,
  channel rule, gate, or recorder wiring changed.
- scripts/policies/tbdmg-w4tbhp-diag.js (copy of
  tbdmg-rebase-diag.js, header + module name only).
- scripts/test-w4tbhp-analyze.js (NEW analyzer, not a copy): reads
  the post corpus (s<seed>-armed.json) and the pre corpus
  (s<seed>-pre.json) from evidence/2026-10-28/perseed-w4tbhp-a/,
  builds the TB-start-HP table per side (player fraction, monster
  fraction, world fraction where present), counts below-max starts
  per side, runs unit checks on its own fraction/count logic, and
  prints the comparison table + wall numbers. Exit 1 on any hard
  gate failure (corpus incomplete, recorder errors > 0, detgate
  files missing). The analyzer never re-scores a verdict: it
  prints the table; the evidence judges it against this prereg.
- scripts/test-w4tbhp-sense.js (copy of the rebase sense script,
  labels only): NON-MEASURED narration replay only, same sense
  rule as the rebase prereg (fixed seed 75104 first; if 75104 has
  no wave-4 thread on the POST band, supplement with the
  most-engaged seed from the rebaseline corpus, 75103, in the
  same evidence file — never an empty window as a reading).

## Post-side corpus

- evidence/2026-10-28/perseed-w4tbhp-a/s<seed>-armed.json (8 rows),
  plus summary.json from the sweep's --summary mode.
- The post sweep runs on the worktree base (3264dbb80) with the
  instruments above. Post-side wall numbers are reported for THIS
  band only, never pooled with any other band.

## Pre-side mechanics (coordinator-approved, no registry games)

- Extract the parent commit of ac9f1987b (20010c093) with
  `git archive` into a scratch directory
  ~/workspace/worktrees/scratch-w4tbhp-old. This is plain
  extracted files, NOT a git worktree — never run git commands
  inside it, never register it.
- The parent tree already carries every recorder policy EXCEPT
  the tbdmg recorder (tbdmg-diag.js was created by the lethality
  arm AFTER wound2, commit 4207ac845, which is a descendant of
  wound2). The pre-side run therefore copies exactly two
  instrument files into the scratch tree — my own
  scripts/test-w4tbhp-sweep.js and
  scripts/policies/tbdmg-w4tbhp-diag.js — both policy-side
  observation code, zero src/js. No src/js file in the scratch
  tree is created, edited, or deleted: the scratch tree's src/js
  is byte-for-byte the parent commit's, by construction of
  `git archive`. The two added files are listed in the evidence
  file, and the scratch directory is DELETED after the pre
  corpus is copied into the worktree and committed.
- Pre-side run: the same sweep script, same substrate env,
  same seeds, same horizon, run from the scratch tree, writing
  its rows to the scratch tree's evidence dir; the resulting
  JSONs are then copied into the worktree corpus dir as
  s<seed>-pre.json (pre-side files clearly named) and committed
  there. No other scratch-tree output is kept.
- If the old code cannot run the recorders (incompatibility —
  a wrapped Game method missing, a harness API the old code
  lacks, a crash inside a recorder install), do NOT hack the old
  code into a different game: stop the pre side, document the
  exact blocker (method, file, error), and the run becomes
  INCONCLUSIVE-blocked with the post-wound2 table still landing
  as measurement. Copying the two recorder policy files above is
  NOT such a hack (they are observation-only policies, not game
  code); a hack would be editing src/js in the scratch tree,
  which is forbidden.
- Detgate per base (see below) is run on the scratch tree too:
  the pre-side detgate proves recorder neutrality on the OLD
  base independently of the post-side detgate on the new base.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the TB-start-HP comparison, pre vs post, on identical
seeds and identical substrate.

GO RULE (DIAG, judged ONLY against this prereg):
  (a) BOTH-base corpora complete: every TB fight on the 8 seeds
      recorded on each side — every wave-4 nonworldkill start
      (non-excluded, non-refused) on each side carries a player
      fighter hp/maxHp AND a monster fighter hp/maxHp at start,
      recorder errors 0 on all seven recorders on both sides,
      no overflow on either side. A side with an incomplete TB
      fight fails leg (a) for that side.
  (b) DETGATE passes on BOTH bases: same-base neutrality proof
      each side (seed 75101, baseline plain tableseat-nowait vs
      wrapped recorders-OFF: days, gameDays, and ts* counters
      equal, no diag ctx surface, no wraps installed). If base
      drift moved old detgate numbers, disclose the amendment
      the way sim-waitlong-a did — report both bases' detgate
      day numbers side by side, do not force old numbers, and
      do not gate the pre detgate against the post detgate's
      days (each detgate is judged internally, same-base).
  (c) COMPARISON TABLE PUBLISHED + CAUSAL VERDICT STATED: the
      evidence file carries, per side, the full TB-start-HP
      table (player fraction + below-max count, monster
      fraction + below-max count as control, world fraction
      where present), and states one of the three verdicts
      below, with the numbers cited.
  Any leg missing = NO-GO, except the INCONCLUSIVE-blocked case
  below. No re-scoring mid-run; metric doubts go under a
  mandatory "metric review" section, and any revision applies to
  the NEXT run, never this one.

CAUSAL VERDICT RULE (binding — read before judging):
  - "wound2 causes the below-max player starts" IF AND ONLY IF:
    post shows below-max player starts AND pre shows zero (or
    at most one, attributable to a single identified fight) on
    the same seeds/substrate, AND the monster control stays at
    full fraction on both sides, AND both detgates pass. The
    wound2 diff's mechanism note (ally field bodies, TB entry
    already reading village.health) is then reported as a
    tension to explain, not as a reason to override the table.
  - "wound2 does not cause them" IF: pre shows below-max player
    starts at a comparable rate to post (same order of
    magnitude, same shape — e.g. pre below-max count within
    2x of post, or pre fraction distribution overlapping
    post's), OR pre shows them at all in a way the mechanism
    note predicts (TB entry already reading village.health).
    A pre-side below-max presence is sufficient for this
    verdict even if the counts differ somewhat, because the
    claim being tested is causation, not magnitude — but the
    counts must both be published so the reader can see the
    difference.
  - "inconclusive-with-reason" IF: either corpus is incomplete
    (leg (a) fails on a side), either detgate fails, or the
    pre-side comparison is blocked (see INCONCLUSIVE-blocked).
    A trajectory divergence between the sides (different days,
    different fight counts) is NOT by itself inconclusive: the
    comparison is per-fight (fractions at fight start), and
    fight counts are reported alongside so a count difference
    cannot masquerade as a fraction difference.

INCONCLUSIVE-blocked (not NO-GO): if the pre-wound2 code cannot
run the recorders, with the exact blocker documented and the
post-wound2 table still landing as measurement. The post table
alone then answers the asymmetry snapshot (as the rebase band
did) but no causal claim is made.

PARITY RULE (binding, do not soften): judge parity ONLY against
evidence/2026-10-27/perseed-w4channel-rebaseline/ — the declared
parity baseline. NEVER against the retired w4channel-a corpus.
NEVER re-score the lethality verdict or the rebaseline verdict.
Parity here means: the POST sweep's per-seed headlines (days,
gameDays, won, waveReach, nationalEver/Final, table, entered,
deathTotal, courtship combined) and wave-4 fight counts by
channel match the rebaseline corpus under the shared vocabulary
— OR a diagnosed cause with a detgate PASS proving recorder
neutrality. Base drift between the rebaseline base and the
current base (3264dbb80) may break exact parity; if it does,
the divergence is diagnosed (which seeds, which fields, and
whether the detgate still proves the recorders neutral), and
parity is reported as EXPLAINED-DIVERGED, not forced. The
TB-start-HP verdict (legs (a)-(c)) does not depend on parity
passing exactly, because the causal comparison is pre-vs-post
on the same substrate, not post-vs-rebaseline — but a parity
failure without a diagnosis fails the run's reporting leg and
must be stated loudly.

DETGATE (pre-sweep STOP gate, per base): seed 75101, baseline
(plain tableseat-nowait, no recorders) vs wrapped (all seven
recorders composed but every on-switch UNSET): days, gameDays,
and the ts* counters must be equal, with no diag ctx surface
and no wraps installed. A detgate FAIL on a base stops that
base's judged sweep. The post detgate runs first; the pre
detgate runs in the scratch tree before the pre judged sweep.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the pilot
for a census. If its completeness gates pass, it is the judged
band. If parity fails, that is a diagnosis to report, not a
reason to re-sweep fresh seeds silently — report it and stop
for coordinator direction, unless the gap is a pure instrument
bug that can be fixed and re-proved (in which case the fix, the
re-proof, and the re-sweep are all disclosed, and the original
failed pilot rows are kept, never overwritten silently).

SENSE RULE (binding, from the 0144Z run): fixed seed 75104 first,
windowed on that seed's wave-4 window (first wave-4 arrival day
minus 10 to last wave-4 fight day plus 10, from the POST band's
corpus). If fixed seed 75104 has no wave-4 thread on this band
(0 arrivals AND 0 faced types), supplement it with the
most-engaged seed from the rebaseline corpus (75103, 9 engaged
arrivals) in the same evidence file — never report an empty
window as a reading. Sense window mechanics (rebaseline
metric-review note 2): window on the seed's actual end day
(min(DAYS, run end)) rather than on DAYS alone. Non-measured
narration replay (say/sysSay taps); replay text never enters
any count, and the replay trajectory shift is stated, not
hidden. Sense bears on this arm's question only where it shows
a wounded scholar walking into a fight — otherwise it is a
short note, not a verdict leg (the verdict legs are (a)-(c)).

## Balanced panel (§15) and telemetry

BALANCED PANEL: scripts/balance-panel.js has NO corpus-ingest
mode for a single-arm census corpus (standing exception,
fourth-plus round — the tool builds panels from live roots,
not census rows). This arm will ATTEMPT the panel compare and
record the outcome; the known scorecard TypeError failure mode
is documented in prior arms — if it fails the same way, say so
and use the paired sweep-compare tables as the section-15
substitute. No panel artifact will be faked.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER writing
evidence (telemetry-check.js vs scale-wall baseline, metrics
national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-w4tbhp-a/*.json), report LOUD lines
with verdict, do NOT roll the baseline on an unexplained LOUD
line (the baseline's WINSEAT regime forbids comparing it to a
tableseat-nowait census substrate, and per-seed rows carry
nationalEver/entered/won, not top-level national/table/wins
paths — say which artifact class applies, or investigate if a
line fits neither).

## No confirm band unless needed

No confirm band is pre-registered. If the verdict needs one
(e.g. a borderline count that a second seed band would settle),
pre-register it in a prereg amendment BEFORE running it, with
its own GO threshold — never run it first and justify later.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
