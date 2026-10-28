# sim-w4damage-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0320Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4damage-a.
Worktree: `~/workspace/worktrees/sim-w4damage-a` (branch
sim-w4damage-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no game fix proposed. The deliverable is knowledge:
the UNRECORDED INTER-FIGHT DAMAGE SOURCE for wave-4 monsters.
This arm is DIAG, so documentation IS the deliverable; no game
change lands from it.

## Base — stated explicitly (verified before this prereg was written)

- Base commit at worktree creation: 3264dbb80 ("journey-landing
  r63: base-drift re-read — meat tail opens thinnest (1/4 arrivals),
  scholar-slide HUNGRY on 680, 2-4d latency observed (zero src/js)").
- The lethality-rebase base e7e7e3472 IS an ancestor of 3264dbb80
  (verified with `git merge-base --is-ancestor`). This band is
  therefore POST-lethality-rebase code, and base drift between the
  lethality corpus and this band is POSSIBLE and EXPECTED to be
  handled by re-derivation, not assumed away. If master moves under
  this run, rebase inside this worktree, re-run the proof, and
  report the move — never merge master in, never touch the main
  tree, never touch a sibling lane.

## Canon read first

- docs/CANON.md, then docs/TABLE.md (the seat: full/lesser/none;
  the full seat keeps the national bar) and docs/MONSTER-WAVES.md
  (wave 4 = the Mirror Draft, gate village standing >= 100;
  bands anchored: damage 35-95, HP 850-1500, pierce 0.2-0.5;
  "a 4-6 round fight for a godhood build (~220 dmg/round)").
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the
  code reading governs the census and the difference is reported.

## Prior evidence read first (this arm's definitions come from these)

- evidence/2026-10-27/sim-w4lethality-rebase.md +
  sim-scale-onramp-round-0221.md (the 0221Z lethality
  re-measurement): five world-HP drops with no recorded fight row
  between them, plus a same-day 65-HP wobble; the herald 175-HP
  item was NOT found (zero herald fights, heralds at full 700 HP
  at end). The five drops, as reported there (defwound-chain
  reading, lethality-corpus rows):
  (1) 75106 seq 47 algorithm: d96 991 -> d97 741 (delta -250).
  (2) 75106 seq 55 eulogy: d127 900 -> d129 740 (delta -160).
  (3) 75106 seq 57 eulogy: d140 900 -> d144 675 (delta -225).
  (4) 75108 seq 28 reunion: d95 1154 -> d100 854 (delta -300).
  (5) 75108 seq 29 reunion: d89 1170 -> d98 870 (delta -300).
  Same-day wobble: 75106 seq 55 reads 740 in the field and 675
  in TB on d129 (delta -65, field -> TB).
- The gap CLASS recurs on those five instances; this arm does
  NOT re-judge the lethality verdict, and does NOT re-judge the
  rebaseline verdict/corpus. Parity is judged ONLY against
  evidence/2026-10-27/perseed-w4channel-rebaseline/ (the declared
  parity baseline) — never against the retired w4channel-a
  corpus, and never re-scored against a friendlier comparison.

## Working hypothesis (stated, not assumed — the sweep tests it)

From code read BEFORE this prereg (havenGrowth.js havenRaidTick:
palisade toll wall = round(maxHp * 0.25), hp = max(1, hp - wall);
raftdraft-diag records the toll only as a COMPUTED value and a
post-call index match, never as a per-object event): four of the
five drops equal a palisade toll on the instance's maxHp
exactly (1000 -> 250; 900 -> 225; 1200 -> 300; 1200 -> 300), and
the lethality analyzer's field chains used defwound rows only
(resolve-routed fights), never joining raftdraft raid rows into
the chain. The toll is therefore the PRIME SUSPECT for (1),
(3), (4), (5). Drop (2) (-160) does NOT equal a 900-max toll
(225), and the d129 wobble (-65, 740 -> 675) sums with (2) to
exactly -225 (900 -> 675) — so (2) + wobble together smell like
one toll seen through two different readings, OR like a
different source entirely. The new recorder below is designed
to settle (2) and the wobble at event level, not by arithmetic.

A second suspect class, also from code read before this prereg:
fieldFight is the choke point, but defwound wraps only
resolveWildMonsterEncounter. Direct fieldFight callers that
bypass resolve — resolvePatrol (game.js), aidFight (comms.js),
lingererSortie (havenGrowth.js), and the villager-agency
outdoor fight — are invisible to defwound chains. If any gap
is a direct-router fight, the new fieldFight-level recorder
catches it with its seq, caller stack, and damage. If a gap
is neither toll nor a direct-router fight, the daily world-HP
snapshot chain in the new recorder names the residual as
unexplained with its day bracket, and that IS the finding.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (never edited), env LEANLINKRESCUE=1, TABLESEATNOWAIT=1
  (TABLEDEFIANT unset), PLUS recorder on-switches RAFTDRAFT=1,
  SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1, DEFWOUND=1, NONWORLDKILL=1,
  TBDMG=1 (via the tbdmg-rebase-diag copy), PLUS the new
  W4DMG=1 on-switch for the w4dmg-diag recorder below.
- NEVER edited: tableseat-nowait.js, any existing recorder file,
  or any src/js file. New instruments only (copies + one new
  recorder, see below).
- Recorders reused verbatim, policy-side only: raftdraft-diag,
  spawnsrc-diag, oldcore-diag, w5births-diag, defwound-diag,
  nonworldkill-diag, tbdmg-rebase-diag. No recorder draws RNG,
  throws into the engine, or returns anything but the original
  value.

## New instrument (this arm only, policy-side, zero src/js)

- scripts/policies/w4dmg-diag.js (new file, W4DMG=1 only):
  (a) wraps Game.fieldFight — every router, not just resolve:
  records vid, seq (the spawnsrc tag, installed before this
  recorder), mid, wave, pre-HP/pre-max, rec outcome/rounds/
  mDealt/mHpLeft, and a caller-stack hint classified as
  resolve / patrol / aid / sortie / villager-agency / other
  (stack names only, never a guess about intent);
  (b) wraps Game.havenRaidTick — per-OBJECT pre/post HP: the
  pre-call world list is snapshotted by object identity
  (the live object reference, keyed to its seq), and after
  delegating each drafted raider's live object is re-read, so
  the toll row carries seq + preHp + wall + postHp for THAT
  object, not an index match and not a computed value;
  (c) daily world-HP snapshot (policy daily, after delegating):
  seq -> {type, wave, hp, maxHp} for every world monster, so
  any delta not covered by (a) or (b) is bracketed to a day
  and reported as residual, never smoothed over.
  Unset (W4DMG != '1') delegates byte-identically: no wraps
  installed, no ctx surface, no record. The wrap records AFTER
  delegating (raidTick: before + after), writes nothing to
  game state, draws no RNG, never throws into the engine
  (recording errors are counted), and returns the original
  value untouched.
- scripts/test-w4damage-sweep.js (copy of
  test-w4lethality-rebase-sweep.js, differing ONLY in corpus
  dir, labels, loadGame mode label, and the added w4dmg layer
  in the composition + detgate composition; original untouched).
  Corpus dir: evidence/2026-10-28/perseed-w4damage-a/
  (incremental per-seed writes, so a crash keeps partial data).
- scripts/test-w4damage.js (new analyzer, proof validator):
  validates rows, checks parity vs the rebaseline corpus,
  re-derives the five drops from defwound chains on THIS band,
  then traces each re-derived drop through w4dmg fieldFight
  rows + raidTick rows + daily snapshots, and prints the drop
  table + per-drop trace + verdict. Exit 0 only when the
  judged legs below pass; any leg failure exits 1 with the
  leg named.
- scripts/test-w4damage-sense.js (non-measured replay only,
  same rule as the rebaseline run: fixed seed 75104 first,
  windowed on that seed's wave-4 window; if 75104 has no
  wave-4 thread on this band, supplement with the most-engaged
  seed from THIS band's corpus in the same evidence file —
  never report an empty window as a reading).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the unrecorded inter-fight damage source for wave-4
monsters, on the current base.

GO RULE (DIAG, judged ONLY against this prereg):
  GO = source named with a trace for at least 4 of 5
  re-derived drops (or all, if fewer re-derive) + a named
  next step (fix arm or instrument gap).
  NON-REPRODUCED (not NO-GO) = the drops do not re-derive on
  the current base, with a drift note stating what changed
  (base moved, trajectories diverged, or the drop class is
  absent on this band — each stated, never conflated).
  NO-GO = drops re-derive but the source stays unnamed, with
  all traces published.
  A "named source" means: a mechanism name + the exact event
  rows that move HP by the drop amount (fieldFight row, or
  raidTick row, or a named other event) inside the drop's
  interval, on the same seq. A computed toll value alone is
  NOT a named source — the raidTick row must be per-object
  (seq-linked). A same-type, different-seq event is NOT a
  trace — seq linkage is required, and a failed linkage is
  reported as failed linkage, not bridged by type.
  No confirm band unless a named source needs one — then the
  confirm band is pre-registered BEFORE running it (seeds,
  horizon, GO threshold), never run first and justified after.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, no recorders) vs wrapped (ALL recorders
composed, every on-switch UNSET, including W4DMG): days,
gameDays, and tsNationalDay must be equal, with no diag ctx
surface and no wraps installed. A detgate FAIL stops the run
before any judged sweep. The old detgate numbers were
132/132 days, tsNationalDay 77. If base drift moved those
numbers on the CURRENT base, DO NOT force the old numbers:
prove same-base neutrality the way sim-waitlong-a did — run
the PRIOR instrument stack (the rebase stack, recorders-OFF)
on this base and show it diverges identically (same new
numbers) — and disclose the amendment loudly in the evidence
file (old numbers, new numbers, prior-stack check result).
Detgate PASS on this base's own numbers, with the amendment
disclosed, is a PASS; detgate FAIL (baseline != recorders-OFF
on this base) is a STOP.

PARITY RULE (binding, do not soften): judge parity ONLY against
evidence/2026-10-27/perseed-w4channel-rebaseline/. Per-seed
days, gameDays, won, waveReach, nationalEver/Final, table,
entered, deathTotal, courtship combined, AND wave-4 fight
counts by channel must match, or the divergence must be
diagnosed with a detgate PASS proving recorder neutrality
(base drift is then the diagnosis, stated with the per-seed
diffs — never hidden, never re-scored against the retired
corpus). NEVER re-score the lethality verdict or the
rebaseline verdict/corpus.

SUBSTRATE-ACTIVATION GATE (binding, same as both predecessors):
band courtship combined > 0 AND >= 6/8 seeds with non-zero
combined courtship. If the gate FAILS, the sweep is INVALID
(not NO-GO): no verdict is judged, the failure is reported
loudly, and the run stops for an env fix.

SENSE RULE (binding): fixed seed 75104 first, windowed on that
seed's wave-4 window (first wave-4 arrival day minus 10 to last
wave-4 fight day plus 10, from THIS band's corpus), windowed
on the seed's actual end day (min(DAYS, run end)). If fixed
seed 75104 has no wave-4 thread on this band (0 arrivals AND
0 faced types), supplement it with the most-engaged seed from
THIS band's corpus in the same evidence file — never report an
empty window as a reading. Non-measured narration replay
(say/sysSay taps); replay text never enters any count, and
the replay trajectory shift is stated, not hidden. The sense
note is short and bears on the question: does the village
have any language or behavior for the damage source once
named (e.g. does anyone remark on the palisade toll, or on a
patrol fight the village never saw recorded)?

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the pilot
for a census. If its completeness gates pass, it is the judged
band. If parity fails, that is a diagnosis to report (see
PARITY RULE), not a reason to re-sweep fresh seeds silently.
If the gap is a pure instrument bug that can be fixed and
re-proved, the fix, the re-proof, and the re-sweep are all
disclosed, and the original failed pilot rows are kept, never
overwritten silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: attempt scripts/balance-panel.js compare and
record the outcome. The known scorecard TypeError failure mode
is documented in prior arms — if it fails the same way, say
so and use the paired sweep-compare tables (this band vs the
rebaseline corpus, identical seeds/policy/substrate) as the
section-15 substitute. No panel artifact will be faked.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER writing
evidence (telemetry-check.js vs scale-wall baseline, metrics
national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-w4damage-a/*.json), report LOUD
lines with verdict, do NOT roll the baseline on an unexplained
LOUD line (the baseline's WINSEAT regime forbids comparing it
to a tableseat-nowait census substrate, and per-seed rows
carry nationalEver/entered/won, not top-level national/table/
wins paths — say which artifact class applies, or investigate
if a line fits neither).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
