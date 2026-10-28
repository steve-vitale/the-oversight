# sim-w4lethality-rebase — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0221Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4lethality-rebase.
Worktree: `~/workspace/worktrees/sim-w4lethality-rebase` (branch
sim-w4lethality-rebase).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game fix proposed. The deliverable is knowledge: a
wave-4 lethality census re-measured on the post-tackle-wound2 base —
per wave-4 fight, damage dealt, rounds, monster HP left, fighter HP
left, by channel — plus whether near-kills now accumulate. This arm
is the next blank named by run fleshout-20261028T0144Z. It measures
a new band; it does NOT re-judge the w4lethality verdict
(DIAG-NO-GO on parity) or the rebaseline verdict/corpus.

## Base — stated explicitly (verified before this prereg was written)

- Base commit at worktree creation: e7e7e3472
  ("sim-scale-onramp round 0144: w4channel re-baseline GO, new parity
  baseline (coordinator evidence, DIAG only)").
- Tackle-wound2 commit ac9f1987b ("tackle-wound2: field wounds carry
  into turn-based fights [needs-eyes]") IS an ancestor of e7e7e3472
  (verified with `git merge-base --is-ancestor`). This band is
  therefore POST-wound2: field-wound carryover into TB fights is IN
  the measured code, and the base also carries the 0144Z rebaseline
  commits on top of wound2. If master moves under this run, rebase
  inside this worktree, re-run the proof, and report the move —
  never force anything.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave 4 = the
  Mirror Draft; bands anchored: damage 35-95, HP 850-1500, pierce
  0.2-0.5; "a 4-6 round fight for a godhood build (~220 dmg/round)").
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the code
  reading in the lethality prereg governs the census and the
  difference is reported.

## Prior evidence read first (this arm's definitions come from these)

- evidence/2026-10-27/sim-w4lethality.md + sim-w4lethality-prereg.md
  (lethality census: 61 fights, median losing fight 1.9% of max HP,
  closest loss 75104 d162 Eulogy 66 HP left / 7.0%, 2/56 losing fights
  over 50%, 2 kills both Congregations, TB fighter HP rebuilt per
  fight, world instance healed to full on lingering restore, field
  damage persists but caps ~31/fight, herald 175-HP unexplained
  drops on 75102 — the open backlog item this band re-checks).
- evidence/2026-10-27/sim-w4channel-rebaseline.md +
  sim-w4channel-rebaseline-prereg.md (the FRESH parity baseline:
  51 arrivals, 29 engaged, 0 killed, 69 fights; wall numbers
  national ever/final 7/8 / 5/8, table invited/entered 6/8 / 3/8,
  wins 3/8 lesser, wave-4 unlock 5/8, wave-5 0/8, median 162d upper /
  154d conventional, deaths 299; sense rule fallback noted there).

## Definitions (reused VERBATIM from the lethality prereg)

Channel vocabulary and precedence (trap > contest-arena-door
(non-world) > non-world-TB (null-origin) > player-tb-world
(world-origin TB) > raid-defender > villager-field > other);
arrival/engaged/killed definitions; wall numbers (national
ever/final, table invited (tableWaiting ever) / entered (tableDone
ever), wins lesser/full split via tableState.seat, wave-4/5 unlocks,
median survival with BOTH upper and conventional medians, death-cause
shares); MELTED annotation (lost-fight dissolution, NOT a kill);
CLOSEST LOSS (non-kill, non-evade, smallest monster HP left,
reported as absolute HP left AND % of max, ties by smallest
% left, then lowest seed, then earliest day); >50% QUESTION
(damage strictly > 50% of that fight's monster max HP, counts by
channel, plus the start-HP basis as a secondary column); the
FIELD-COMPLETENESS RULE (field fight complete if defwound carries
mDealt + mHpLeft + mHpMax + rounds; a missing tbdmg field supplement
(vHpLeft) is a supplement-gap count, not a leg-(b) failure; TB
fights have no fallback — no tbdmg end join = incomplete).

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
  nonworldkill-diag. No recorder draws RNG, throws into the
  engine, or returns anything but the original value.
- Seeds 75101-75108, as assigned. Horizon 180d DEATH-AWARE
  (runDays stops on death/win; +10d tail max).

## Instruments (COPIES ONLY, originals untouched)

- scripts/test-w4lethality-rebase-sweep.js (from
  test-w4lethality-sweep.js), scripts/test-w4lethality-rebase.js
  (from test-w4lethality.js), scripts/test-w4lethality-rebase-sense.js
  (from test-w4lethality-sense.js), scripts/policies/tbdmg-rebase-diag.js
  (from tbdmg-diag.js). The copies differ from the originals ONLY
  in: default corpus dir (perseed-w4lethality-rebase), labels, the
  loadGame mode label (a manifest label only — sim-harness.js reads
  mode into the manifest, never into game state or RNG; game RNG
  is seeded from the seed alone), and require-path renames to the
  -rebase instrument names (sweep and analyzer require
  tbdmg-rebase-diag instead of tbdmg-diag). Verified by diff
  before this prereg commit: every changed line is one of those
  renames; no logic, channel rule, gate, or recorder wiring
  changed. Corpus dir: evidence/2026-10-27/perseed-w4lethality-rebase/
  (CDT date still 2026-10-27). The analyzer's parity corpus
  default (CHAN) is evidence/2026-10-27/perseed-w4channel-rebaseline/
  — the fresh baseline, not the retired corpus.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the wave-4 lethality census on this band, on the
post-wound2 base.

GO RULE (DIAG, judged ONLY against this prereg):
  (a) 8/8 configs valid (row per seed, days > 0, every gate +
      deed + damage field present, recorder errors 0 on all
      seven recorders, no overflow);
  (b) 100% of wave-4 fights on the band have a complete damage
      record (TB: joined start + tbdmg end with monster
      fighter HP at both ends; field: defwound row + tbdmg
      field supplement OR the stated field-completeness rule
      above; supplement gaps reported as a count, 0 required
      for the "supplement gaps 0" reading of this leg);
  (c) fight-count/headline parity vs the rebaseline corpus
      EXPLAINED — exact match, or a diagnosed cause with a
      detgate PASS proving recorder neutrality (baseline vs
      recorders-OFF on seed 75101 must match on days and
      tsNationalDay, as in both predecessor arms);
  (d) damage distribution vs monster max HP computed, closest-loss
      gap NAMED (by HP left AND by % left, with any second
      candidate discussed);
  (e) the >50% question answered with counts, by channel, kills
      reported separately;
  (f) SENSE: a wave-4 fight thread read in plain words (see
      SENSE RULE below).
  Any leg missing = DIAG-NO-GO. No re-scoring mid-run; metric
  doubts go under a mandatory "metric review" section, and any
  revision applies to the NEXT run, never this one.

PARITY RULE (binding, do not soften): judge parity ONLY against
evidence/2026-10-27/perseed-w4channel-rebaseline/ — the fresh
baseline declared by the 0144Z run. NEVER against the retired
w4channel-a corpus. NEVER re-score the w4lethality verdict or the
rebaseline verdict/corpus. Under §14, a failed leg is NO-GO,
never re-scored against a friendlier comparison.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, no recorders) vs wrapped (all seven recorders
composed but every on-switch UNSET): days, gameDays, and the ts*
counters must be equal, with no diag ctx surface and no wraps
installed. A detgate FAIL stops the run before any judged sweep.
The detgate leg (c) additionally requires baseline vs
recorders-OFF to match on days and tsNationalDay.

SUBSTRATE-ACTIVATION GATE (binding, same as both predecessors):
band courtship combined > 0 AND >= 6/8 seeds with non-zero
combined courtship. If the gate FAILS, the sweep is INVALID
(not NO-GO): no verdict is judged, the failure is reported
loudly, and the run stops for an env fix.

SENSE RULE (binding, from the 0144Z run): fixed seed 75104 first,
windowed on that seed's wave-4 window (first wave-4 arrival day
minus 10 to last wave-4 fight day plus 10, from THIS band's
corpus). If fixed seed 75104 has no wave-4 thread on this band
(0 arrivals AND 0 faced types), supplement it with the
most-engaged seed from the rebaseline corpus (75103, 9 engaged
arrivals) in the same evidence file — never report an empty
window as a reading. Sense window mechanics (rebaseline
metric-review note 2): window on the seed's actual end day
(min(DAYS, run end)) rather than on DAYS alone, so a seed whose
run ends before the window opens does not yield an empty replay.
Non-measured narration replay (say/sysSay taps); replay text
never enters any count, and the replay trajectory shift is
stated, not hidden.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the pilot
for a census. If its completeness gates pass, it is the judged
band. If parity fails, that is a NO-GO diagnosis, not a reason
to re-sweep fresh seeds silently — report it and stop for
coordinator direction, unless the gap is a pure instrument bug
that can be fixed and re-proved (in which case the fix, the
re-proof, and the re-sweep are all disclosed, and the original
failed pilot rows are kept, never overwritten silently).

## Wound2 questions (measured, not assumed — answered from this band)

- Does field-wound carryover into TB fights change the
  accumulation picture? Specifically: is TB fighter HP rebuilt
  per fight, does the world instance heal, does field damage
  persist — each answered from this band's rows (TB start-HP
  sequences for repeat instances, world-HP traces across field
  fights, lingering-restore behavior after TB losses).
- Report: the median losing-fight % of max HP, the closest loss,
  kills with kill-time killer identity — record kill-time
  identity if the instrument allows; if it only gives end-state
  identity, state that caveat plainly, as the lethality arm did.
- Herald check: whether the open backlog item recurs — the
  Herald 175-HP unexplained drops between recorded field fights
  on 75102 (recorder gap or unrecorded damage source). Report
  found or not-found, never silently dropped.

## Balanced panel (§15) and telemetry

BALANCED PANEL: scripts/balance-panel.js has NO corpus-ingest
mode for a single-arm census corpus (standing exception,
fourth-plus round — the tool builds panels from live roots,
not census rows). No panel artifact will be faked; the sweep
tables + analyzer outputs are the comparison of record, and
this exception is stated in the evidence file's metric-review
section.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER writing
evidence (telemetry-check.js vs scale-wall baseline, metrics
national,table,wins,exiled, current glob
evidence/2026-10-27/perseed-w4lethality-rebase/*.json), report
LOUD lines with verdict, do NOT roll the baseline on an
unexplained LOUD line (the baseline's WINSEAT regime forbids
comparing it to a tableseat-nowait census substrate, and
per-seed rows carry nationalEver/entered/won, not top-level
national/table/wins paths — say which artifact class applies,
or investigate if a line fits neither).

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
