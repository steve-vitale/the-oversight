# sim-vetsurvive-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T2036Z. Axis: scale-onramp
(the blocking axis). Worker: sim-vetsurvive-a.
Worktree: `~/workspace/worktrees/sim-vetsurvive-a` (branch sim-vetsurvive-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
per-kill SURVIVORSHIP census of every wave-4 kill on one band, not
another gate census. Nothing in game code is fixed by this run; a fix,
if one emerges cleanly, is a separate follow-up, not a silent scope
expansion.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; VETERANS =
  living roster members with a recorded kill of a wave-(w-1)+
  monster — the readiness veterans bar counts LIVING killers only,
  so a killer's death un-counts the kill), docs/TABLE.md (full seat
  keeps the national bar, Steve 2026-10-27 ruling), docs/
  MEASUREMENT.md sections 9-12 and 14-15 (pilot gate, death-aware
  horizons, pre-registration, convergence, metric binding, balanced
  panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported.

## Prior evidence read first (this arm's question comes from these)

- evidence/2026-10-27/sim-w5seq-a.md (+ prereg): the direct parent
  (seeds 74401-74408, tableseat-nowait substrate, 180d death-aware).
  Band result: exactly ONE wave-4 kill (seed 74405), killer dead by
  village end, rd5 veterans peak 1/2, end 0/2. The veterans key
  turned one notch, then emptied.
- evidence/2026-10-27/sim-w5twokey-a.md (+ prereg): the grandparent
  (seeds 74311-74318, same substrate). Same shape: exactly ONE
  wave-4 kill (seed 74313), killer dead by end. Two bands running,
  two wave-4 kills, zero living wave-4 killers at end.
- This arm does NOT re-ask whether the gate is veteran-bound (that
  is settled across 16 seeds: veterans peak < 2 on 16/16). It asks
  the mechanism behind the repeated zero: when a wave-4 killer
  dies, WHEN, of WHAT, and how long after the kill.

## Band freshness — disclosed, not assumed

- Judged band: 74801-74808, as assigned. Freshness check against
  committed evidence/2026-10-27/ BEFORE sweeping found:
  (a) these seeds were NEVER censused for wave-4 kills, killer
  fate, or gate structure — the quantities this arm measures do
  not exist for this band anywhere in committed evidence;
  (b) the same seeds WERE screened under the same tableseat-nowait
  BASELINE leg by sim-defnoffer-screen-a (Band B, run
  fleshout-20261027T1715Z, corpus perseed-defnoffer-screen-a/
  s7480*-baseline.json) for a different question (defiance
  offered at seating). That corpus records NO waveKillLog, NO
  kill counts, NO killer identity — it cannot answer this arm's
  question, and this arm does not re-score it.
- Framing, stated up front so it cannot be mistaken for a claim:
  this band is FRESH FOR THE KILL CENSUS (new quantities, never
  measured on these seeds), not virgin seeds. The judged verdict
  below is judged ONLY on this run's census. The defnoffer
  baseline rows are used for ONE reported cross-check only (see
  proof gate V6): days/gameDays/won agreement, which tests
  whether the two instruments reproduce the same trajectories.
  Agreement or divergence is reported, never gated, and never
  re-scored into the verdict.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the
  w5block/w5twokey/w5seq substrate, so wall numbers compare in
  shape.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, or any
  src/js file. New instruments only: scripts/test-vetsurvive-a-
  sweep.js (kill census sweep, adapted from test-w5seq-a-sweep.js
  with the per-kill fate tracking added),
  scripts/test-vetsurvive-a.js (proof validator),
  scripts/test-vetsurvive-a-sense.js (non-measured sense replay,
  adapted from test-w5seq-a-sense.js).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/runDays,
  full src/js list in index.html order minus DOM-only files (per
  the worker template). Math.random seeded BEFORE eval. Never
  stub Game.save.

## Full env set (inherited gates included)

- Env vars set by the sweep before each loadGame: LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT deleted. loadGame mode label
  'vetsurvive-a' (a manifest label only — sim-harness.js reads mode
  into the manifest, never into game state or RNG; game RNG is
  seeded from the seed alone).
- Policy RNG: sim-harness seeds global.__policyRandom from the seed
  (unchanged from w5seq).
- Writer: scripts/sim-postunlock2-b-writer.js chunked writer with
  sha check + retry (same as w5seq) — a write flap cannot silently
  lose a row.
- Read discipline (same as w5seq, unchanged): the daily series uses
  ONLY pure reads (villageStanding, standingPlentyCappedTotal,
  waveCombatReadiness(4/5), waveEngaged(4), waveLedgerPoints,
  deedGateReady, state reads). It NEVER calls villageStandingTotal()
  or unlockedWave() daily — the daily gated total and daily
  unlocked wave are computed from the pure reads by the w5seq
  replication. The engine's own numbers are called once at end
  and checked by the validator. deedGateReady() is a pure read for
  census purposes (computes from progState/deedState/scaleRank/
  integrationStage, writes nothing except idempotent deedState
  defaults); the wave-5 unlock gate does not consult it at all.

## Substrate-activation gate (rule3trial lesson — binding)

The rule3trial invalid run proved delegation gates cannot detect a
missing courtship: LEANLINKRESCUE unset silently runs competent-
only (no courtship, no national, no seats) while every delegation
gate still passes. This run therefore carries an explicit
substrate-activation gate, checked by the validator from the
recorded policy ctx counters (courtCounters, courtAccords,
courtNational, courtGlobal, tended, defenseCalls, proposedLead —
all captured in full in every row, not just ts/dp prefixes):

- GATE (band-level, binding): combined courtship activity
  (sum of all seven counters over the band) > 0 AND at least 6/8
  seeds show non-zero combined courtship activity.
- If the gate FAILS, the sweep is INVALID (not NO-GO): no verdict
  is judged, the failure is reported loudly, and the run stops
  for an env fix. Per-seed courtship counters are tabulated in
  the evidence regardless, so a single quiet seed is visible
  even when the band gate passes.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the wave-4 killer-fate census on this band.

Per wave-4 kill entry in state.waveKillLog (fields d, mid, w, by,
via, trick), the fate record is:
- killerVid = by; killerName = Game.disp(by) at end (dead
  villagers keep a person record; if disp fails, the vid itself
  is the identity and the gap is reported, never filled by guess).
- killDay = d; monster = mid (+ data name from Game.data.monsters
  for reading only); via = via channel tag.
- aliveAtEnd: the GATE's own living rule — scholar vid at end
  counts living by definition; otherwise vpOf(vid) exists and is
  not dead. (A killer who was scholar at kill time but died and
  was succeeded is NOT the end scholar vid, so they count dead
  unless their person record says otherwise — the daily tracking
  below catches the flip.)
- deathDay + deathCause (if dead): tracked DURING the run — the
  daily wrapper records, for every wave-4 killer vid seen so far,
  the first day vpOf reports dead (deathDayApprox, within one
  daily sample). The cause is matched AFTER the run from the
  harness live-death capture (result.samples.deaths: day, who,
  cause, player): the earliest death entry with who == killerName
  and day >= killDay. If no entry matches, deathDay stands with
  cause 'unmatched' and the validator flags it — never invented.
- postKillSurvival = deathDay - killDay if dead; else
  endDay - killDay (CENSORED: alive at village end, still
  counting). endDay = the seed's run days (death-aware end).
- Per seed also recorded: rd4 veterans at peak AND end, rd5
  veterans at peak AND end (from the daily rd4/rd5 tuples),
  wave-4 unlock, wave-5 unlock, national ever/final, table
  invited/entered, wins, median survival inputs (days/gameDays),
  and the wall numbers (national / table / wins, wave 4-5
  unlocks, median survival).

GO RULE (census-go, binding): the census COMPLETES on 8/8 seeds
AND every wave-4 kill on the band gets a COMPLETE killer-fate
record (identity + kill day + alive/dead at end + death day and
cause if dead, or censored survival if alive). The verdict
reports, in plain words first: the dominant killer-death cause
(most frequent cause among dead killers; ties listed) and the
median post-kill survival (dead killers only; censored alive
killers reported separately, never pooled into the median).

ZERO-KILL BRANCH (binding): if zero wave-4 kills occur on the
band, that is a REPORTED OUTCOME (kill scarcity — the census
completes with an empty kill table and the verdict says so),
NOT a failure to re-band around. There is NO second judged band
on new wording in this run. Prior bands are comparison-only,
never re-scored.

Secondary quantities (reported, NOT the verdict, never promoted
into it mid-run):
- Per-seed wall numbers + death-cause shares (all deaths, as in
  w5seq) + wave-4 kills / living wave-4 killers at end.
- rd4/rd5 veterans peak-vs-end table (does the bar empty by
  death, by succession, or never fill at all?).
- Killer-death cause shares vs band death-cause shares (is the
  killer death ordinary combat attrition or a distinct cause?).
- The w5seq/w5twokey comparison columns (1 kill / 0 living each).

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
  pilot for a census (this is a census, not a lever test); no
  confirm band is pre-registered beyond this one band. Confirm
  spend only if a lever emerges, and none is expected — this arm
  is diagnostic.
- Seeds: 74801-74808 (as assigned; freshness framed above).
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max) — NOT a fixed 180d. Why: matches the w5seq band in
  shape, so wall numbers compare.
- Per-seed daily tracking: gated standing, raw, capped, rd5 bars,
  rd4 bars, w4faced, unlockedWave (computed), rank, waveKillLog-
  derived wave-4 kill/killer counts, deedGateReady() per day,
  AND the killer-alive daily flip tracker described above.
  Peaks and first-crossing days are derived from the daily series
  in the proof validator, never hand-edited.
- Proof gates (STOP, not verdict inputs, except the substrate
  gate above which invalidates the run):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate + deed +
    fate field present, no recorder errors.
  - G2 veterans recompute: living wave-4 killers recomputed from
    waveKillLog + rosterLiving (+ scholar rule) equal the row's.
  - G3 fate recompute: every wave-4 log entry has a fate record;
    every dead killer has deathDay >= killDay and a matching
    live-death entry by name (or is flagged 'unmatched'); every
    alive killer matches rosterLiving living=true or the scholar
    rule; post-kill survival arithmetic recomputed.
  - G4 rd4/rd5 peak/end recompute from the daily series.
  - G5 demand vs live code: rd5 demand 4/15/6/3/2, rd4 demand
    3/10/5/3/1, as recorded in the gate objects.
  - G6 defnoffer cross-check (REPORTED, not gated): per-seed
    days/gameDays/won vs perseed-defnoffer-screen-a/
    s7480*-baseline.json.
  - G7 substrate-activation gate (binding, above).
  - G8 daily series: daily rows present, days increasing, no
    gap covering a kill day (a kill day missing from daily
    samples is flagged; the fate record still stands on the
    end log, but the deathDayApprox precision note attaches).
- SENSE TEST (SENSE-TESTING LAW): seed rule — the LOWEST seed
  with a wave-4 kill whose killer died; if no dead killer exists,
  fall back to the w5seq sense rule (highest gated standing at
  end; ties by most wave-4 kills, then lowest seed). Non-measured
  narration replay (say/sysSay taps, last 30 days) read for
  whether the killer's death reads as a person's death with
  consequences — judged in plain words in the evidence. Replay
  text never enters any count, and the replay trajectory shift
  (narration replays shift trajectories) is stated, not hidden:
  the replay proves wording and presence only; the counted
  death cause comes from the judged corpus live-death capture.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (w5seq/w5twokey
  grep: 0 hits for ingest/corpus; it builds before/after panels
  from two roots). A panel compare will be ATTEMPTED and reported
  honestly; no panel artifact will be faked. Same standing
  exception as the w5seq corpus if the attempt fails.
- Telemetry deviation check: per the loop body, run AFTER
  writing evidence (telemetry-check.js vs scale-wall baseline,
  metrics national,table,wins,exiled) and report LOUD lines
  with verdict; do NOT roll the baseline on an unexplained
  LOUD line.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
