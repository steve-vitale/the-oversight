# sim-w4channel-rebaseline — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0144Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4channel-rebase.
Worktree: `~/workspace/worktrees/sim-w4channel-rebase` (branch
sim-w4channel-rebase).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal, no demand/deed number moved. The
deliverable is knowledge: a FRESH faced → engaged → killed census by
channel, with killer identity first-class, that BECOMES the parity
baseline for the census family. This arm does NOT re-score the
w4lethality corpus or its DIAG-NO-GO verdict, does NOT re-measure
lethality, and does NOT propose a game fix.

## Why this run exists (coordinator decision, 1926Z review)

The 1926Z coordinator decision stands: the committed
perseed-w4channel-a corpus is STALE for parity purposes. Its
conversion-zero finding stands on its own base; only its use as a
parity baseline is retired. The w4lethality arm proved the drift
mechanically (evidence/2026-10-27/sim-w4lethality.md, "Parity
failure — the diagnosis"): the channel script itself, re-run on
current code, reproduces the lethality band, not the committed
channel corpus, and a full fresh channel rerun matched the
lethality band EXACTLY on all 8 seeds (days, won, waveReach,
nationalEver/Final, table, entered, deathTotal, courtship
combined, and wave-4 fight counts by channel). This run lands the
fresh corpus formally, under its own prereg, so future arms
compare parity against a corpus generated on current code —
not against the retired one.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave 4 =
  the Mirror Draft, standing >= 100; readiness gates hold waves
  4-5: wave-5 demands 4 armored @ P>=15 / 6 armed / 3 tricks / 2
  living wave-4 killers; VETERANS = living roster members with a
  recorded kill of a wave-(w-1)+ monster — the readiness
  veterans bar counts LIVING killers only; VILLAGER XP LAW: a
  villager's real blow-by-blow fight feeds the deed bars exactly
  like the player's, and villager KILLS score the ledger exactly
  like the player's; engagements feed the endgame deed bars
  only, never wave unlocks).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording differ, the
  code reading in the w4channel-a prereg governs the census and
  any difference is reported.

## Template and definitions (incorporated by reference, not re-invented)

This prereg is the w4channel-a prereg
(evidence/2026-10-27/sim-w4channel-a-prereg.md) with the corpus
dir, instrument names, and verdict legs below substituted. Every
definition there stands verbatim for this run: ARRIVAL (world
birth joined to spawnsrc spawn on seq; fled-recovery re-entries
are NEW arrivals, reported separately); FACED-TYPE (per-type
deedState wavesFaced, never merged into the per-instance
funnel) vs the UNMEASURABLE faced-instance stage, whose
labelled proxy is NEVER-ENGAGED arrivals; ENGAGED (>= 1
seq-linked fight row); KILLED (one waveKillLog entry, w == 4,
attributed only on a seq-linked join, else NON-ARRIVAL KILL);
the CHANNEL vocabulary and precedence (trap > contest-arena-door
(non-world) > non-world-TB (null-origin) > player-tb-world
(world-origin TB) > raid-defender > villager-field > other);
KILLER IDENTITY classes (scholar-player / villager /
player-literal / unknown, living flag under the gate's own
rule); OUTCOME classes in w4funnel precedence order; WALL
NUMBERS (national ever/final, table invited/entered, wins
lesser/full split via tableState.seat, wave-4/5 unlocks, median
survival, death-cause shares).

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (never edited), plus LEANLINKRESCUE=1, TABLESEATNOWAIT=1 env,
  plus recorder on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1,
  W5BIRTHS=1, DEFWOUND=1, NONWORLDKILL=1 — exactly the
  w4channel-a prereg's full env set (TABLEDEFIANT deleted).
- Recorders reused verbatim, policy-side only, never edited:
  raftdraft-diag, spawnsrc-diag, oldcore-diag, w5births-diag,
  defwound-diag, nonworldkill-diag. No recorder draws RNG,
  throws into the engine, or returns anything but the original
  value.
- Instruments: COPIES ONLY, originals untouched —
  scripts/test-w4channel-rebaseline-sweep.js,
  scripts/test-w4channel-rebaseline.js (proof validator /
  analyzer), scripts/test-w4channel-rebaseline-sense.js. The
  copies differ from the originals ONLY in: default corpus dir
  (perseed-w4channel-rebaseline), labels, and the loadGame mode
  label (a manifest label only — sim-harness.js reads mode into
  the manifest, never into game state or RNG; game RNG is seeded
  from the seed alone). The copy was necessary because the
  originals default to the retired corpus dir; no logic, channel
  rule, gate, or recorder wiring was changed in the copy.
- Substrate-activation gate (binding, same as w4channel-a):
  combined courtship activity (sum of courtCounters,
  courtAccords, courtNational, courtGlobal, tended,
  defenseCalls, proposedLead over the band) > 0 AND at least 6/8
  seeds show non-zero combined courtship activity. If the gate
  FAILS, the sweep is INVALID (not NO-GO): no verdict is judged,
  the failure is reported loudly, and the run stops for an env
  fix.
- Read discipline (unchanged): sweep-side snapshot uses ONLY
  pure reads; it NEVER calls villageStandingTotal() or
  unlockedWave() mid-run. The engine's own numbers are called
  once at end (waveReach from the harness) and checked by the
  validator where a check exists.
- Writer: direct writeFileSync with retry loop; every corpus row
  is written into the worktree evidence dir as its seed
  finishes (incremental rows survive a killed sweep); /tmp only
  for transient logs copied into the worktree immediately.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the fresh wave-4 channel census on this band, as the
parity baseline for the census family.

GO RULE (census, judged ONLY against this prereg):
  (a) 8/8 configs valid (row per seed, days > 0, every gate +
      deed + channel field present, no recorder errors);
  (b) >= 95% of wave-4 arrivals classified into a known outcome
      (unknown counted, never hidden);
  (c) channel attributed for >= 90% of wave-4 fights (fight
      rows with wave 4, all recorders) and 100% of wave-4 kills
      (every waveKillLog entry with w == 4 gets exactly one
      channel + one killer-identity class);
  (d) the narrowest funnel stage named with counts and shares
      (arrivals → engaged → killed, with the faced-type count
      reported alongside, labelled per-type, never merged
      into the per-instance funnel);
  (e) SENSE: one seed's wave-4 thread read in plain words —
      seed 75104, to match the prior sense thread (the
      w4channel-a and w4lethality sense seed), read from the
      rebaseline sense replay file.
  Any leg missing = DIAG-NO-GO. No re-scoring mid-run; metric
  doubts go under a mandatory "metric review" section.

DETGATE LEG (binding, BEFORE the judged sweep): seed 75101
baseline (plain tableseat-nowait, no recorders) vs
recorders-OFF (all six recorders composed, every on-switch
unset) must match on days and tsNationalDay, with no diag
surface and no wraps installed. If it fails, STOP and report —
do not sweep judged seeds on a non-neutral recorder stack.

BASELINE-DECLARATION LEG (binding, on GO): on GO, this corpus
(evidence/2026-10-27/perseed-w4channel-rebaseline/) BECOMES the
parity baseline for the census family, replacing the retired
w4channel-a corpus for parity purposes. Future arms judge
parity against THIS corpus, not the retired one. (The retired
corpus's conversion-zero finding still stands on its own base;
only its use as a parity baseline is retired — this run does not
re-judge it.)

ZERO-KILL BRANCH (binding): if zero wave-4 kills occur on the
band, that is a REPORTED OUTCOME (kill scarcity — the census
completes with an empty kill table and the verdict says so),
NOT a failure to re-band around. There is NO second judged
band on new wording in this run. The faced/engaged stages are
still judged (legs b–d) even with zero kills.

Secondary quantities (reported, NOT the verdict, never
promoted into it mid-run):
- Per-seed wall numbers + death-cause shares + wave-4 arrivals /
  engaged / kills / living wave-4 killers at end.
- Channel conversion rates: engaged/arrivals, killed/engaged,
  killed/arrivals, per channel.
- Killer-identity table: kills by scholar-player vs villager
  vs player-literal vs unknown, with living-at-end per killer.
- Non-arrival kills by door.
- Unlinked-fight count (raftdraft fieldFights wave 4 with no
  seq join) — a recorder-gap measure, not a channel.

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
  pilot for a census (this is a census, not a lever test); no
  confirm band is pre-registered beyond this one band.
- Seeds: 75101-75108 (as assigned; the same band as
  w4channel-a and w4lethality, so the fresh corpus compares in
  shape).
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max) — NOT a fixed 180d.
- Proof gates (STOP, not verdict inputs, except the substrate
  gate above which invalidates the run): G1 corpus integrity,
  G2 arrival reconciliation (oldcore wave-4 births ==
  spawnsrc wave-4 spawns joined on seq; every wave-4 raider
  traces to a spawn seq), G3 kill reconciliation, G4 channel
  recompute (the analyzer derives channel from raw rows, never
  trusting a sweep-side label), G5 demand vs live code (rd5
  demand 4/15/6/3/2, rd4 demand 3/10/5/3/1), G6 substrate gate,
  G7 daily series, G8 killer-identity recompute — all as in the
  w4channel-a prereg.
- SENSE TEST (SENSE-TESTING LAW): seed 75104 (fixed by this
  prereg to match the prior sense thread — NOT the
  most-kills rule, so the thread compares across the family).
  Non-measured narration replay (say/sysSay taps, last 30
  days) read for whether the wave-4 thread reads as people
  meeting monsters with consequences. Replay text never enters
  any count, and the replay trajectory shift is stated, not
  hidden: the replay proves wording and presence only.
- Balanced panel note: scripts/balance-panel.js has NO
  corpus-ingest mode for a single-arm census corpus (same
  standing exception as the census-family corpora). A panel
  compare will be ATTEMPTED and reported honestly; no panel
  artifact will be faked.
- Telemetry deviation check: per the loop body, run AFTER
  writing evidence (telemetry-check.js vs scale-wall baseline,
  metrics national,table,wins,exiled) and report LOUD lines
  with verdict; do NOT roll the baseline on an unexplained
  LOUD line. NOTE (carried from the census family): the check
  is known-wrong on recorder rows (field-shape artifact), so
  its LOUD lines are reported with the artifact verdict, not
  as wall numbers.
- Headline comparison (finding only, never a re-judgment): the
  evidence file compares this band's headlines against the
  w4lethality rerun band (which the 1926Z review says matched
  a fresh channel rerun exactly on all 8 seeds) and reports any
  divergence as a finding only — it never re-judges the
  lethality arm from it, and never re-scores this run's verdict
  from the comparison.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
