# sim-s87135-traj-a — PREREGISTRATION (written BEFORE any verdict, 2026-11-01)

Run: fleshout-loop-a-20261101T0615Z, axis scale-onramp. Arm: DIAG ONLY —
zero src/js changes; instrument/policy scripts only. Seed 87135 only.

## Question
From the 0515Z contact-finish confirm (evidence/2026-10-31/sim-contactfinish-a.md,
confirm section): seed 87135, policy stack
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1,
recorder CONTACTFINISH=1, 200d death-aware cap.
BASELINE (rule OFF) produced 47 wave-3 field-fight rows and 11 finishable
CONTACT meetings, national 1, table 0, won 0, 144d village-lost.
LEVER (rule ON, current master incl. contact-finish rule) produced 6 wave-3
rows, 2 attempts, national 0, table 0, won 0, 163d village-lost.
The two conversions: d85 Sigrun, crowbar vs 17-HP Spool, struck 10 (7 left,
beast broke away); d87 Francisco, fire-hardened spear vs 7-HP Spool, killed
(16 dmg). What mechanism rerouted the village's whole later meeting stream?

## Method (fixed before running)
1. Reproduce BOTH legs fresh for seed 87135 only on the same stack, differing
   ONLY by the rule: baseline leg with src/js/fieldFights.js swapped to the
   pre-rule blob (commit 759dd7263^, byte-identical to the 1a6dce59d version
   used in the confirm — verified by cmp before running), then restore from a
   BACKUP COPY (never `git checkout` as the restore step) with
   `git diff HEAD` verified empty before the lever leg runs. Both legs run
   the contactfinish recorder PLUS a new traj recorder (daily snapshots, pure
   reads only — no unlockedWave()/villageStandingTotal() mid-run, no engine
   calls that could roll RNG or write state).
2. Daily snapshot fields (one row per policy-daily call, keyed by scholar day):
   scholar day, map px/py (village/scholar tile), living roster (vid, name,
   alive, HP), scholar HP/kcal, pantry kcal bucket, waveKillLog copy,
   world-monster roster (id, tx, ty, hp, maxHp, veteran — via Game.worldMonsters()
   read), fledMonsters keys, deed wavesFaced copy, fullseat-diag daily fields
   (rank, ledger points, w3 rung, standing war points) as recorded by the
   existing recorder.
3. Divergence day = first scholar day where the two legs' snapshot sequences
   differ in any of: map tile, living roster/scholar identity, world-monster
   roster (type/tile/HP), wave/gate state (ledger points, w3 rung, rank),
   deed/calendar state. The sweep dayHash sequence is a cross-check, not the
   verdict: hashes are recorded by the existing sweep wrapper on both legs.
4. Classification of every baseline wave-3 row (all 47 expected; count what is
   actually reproduced): converted-beast lineage vs other beast vs other cause.
   "Lineage" is TYPE-level by necessity — world entities carry no stable
   instance id (contactfinish-diag header says so; spawn-to-fight linkage is
   type-level). A row counts as converted-beast lineage iff mid == 'spool'
   (the converted beasts' type) AND day >= 85, OR it is a Spool row whose
   fighter/tile chain follows a d85/d87 conversion (fled-monster recovery /
   same-tile re-meeting, where the recorder shows it). All other wave-3 rows
   are "other beast". "Other cause" is reserved for rows absent on the lever
   leg for a reason other than beast availability (e.g. the fighter is dead /
   the village is on another tile / the day never arrives because the run
   ended earlier — with the day cited).
5. Counterfactual day table: for each baseline wave-3 day, what the lever
   village does that day (its own field fights, tile, roster state).
6. Sense-read at least 2 transcripts for MEANING (a conversion day + a
   divergence day): coherence of narration vs state, not just counts.

## Hypotheses, tested in this order
- (a) Killed-entity removal cascade: the converted beasts or their lineage
  generated most baseline repeat meetings. PREDICTION if true: a majority of
  baseline wave-3 rows are Spool rows at/after d85, and lever-leg Spool
  meetings collapse after d87 while other types persist.
- (b) Location divergence after the conversions: the lever village walks a
  different tile path after d85/d87, so it stops meeting the baseline beasts.
  PREDICTION if true: map px/py sequences first differ within a few days of
  d85/d87 and stay diverged, preceding the wave-3 row collapse.
- (c) Scholar/roster change: a conversion changes who lives / who the scholar
  is, changing which fights happen. PREDICTION if true: living-roster or
  scholar identity first differs at/near a conversion day and the missing
  rows' fighters are the changed villagers.
- (d) Gate-timing shift: ledger points / wave-3 rung / rank move, changing
  which waves spawn. PREDICTION if true: ledger/w3-rung/rank sequences first
  differ and the wave-3 spawn pool changes at that point.
- (e) Survival-length calendar shift: the lever village simply lives longer
  (163d vs 144d), so its calendar — not any meeting mechanism — differs.
  PREDICTION if true: trajectories are identical through the baseline end
  (d144) and only the tail differs. (Already weak: wave-3 rows collapse
  DURING the shared window, 6 vs 47, so a pure tail shift cannot explain it
  — but it is tested and must be falsified explicitly, not assumed away.)
- (f) RNG-stream shift (added candidate, mechanism-level): the finish strike
  consumes one seeded roll (lroll) that the baseline leg never spends, so
  every later seeded draw differs — spawns, wanderer moves, encounter
  outcomes. PREDICTION if true: snapshot/hash sequences are identical through
  the d85 strike and first differ at the next seeded draw after it, with
  divergence spreading to spawns/tiles before any roster/gate change; the
  d85 non-kill strike alone (no beast removed) already diverges the stream.
  (f) is compatible with (b) as its manifestation: (f) is the cause, (b)
  the visible path. The verdict must say which level the evidence supports.

## DIAG-GO bar (all three required)
1. Divergence day identified: a single first-divergent scholar day, with the
   field(s) that differ named.
2. Every reproduced baseline wave-3 row classified (converted-beast lineage /
   other beast / other cause) with counts that sum to the reproduced total.
3. A mechanism statement naming the cause, with at least one alternative
   hypothesis from (a)–(f) FALSIFIED on stated evidence (not merely ranked
   lower).
Otherwise DIAG-NO-GO (or HELD if a run leg fails to reproduce / an
instrument gap blocks classification — stated, not papered over).

## What this arm does NOT claim
- No trajectory-safety verdict for the contact-finish rule in general
  (one seed, one stack). A future claim needs this mechanism account, not
  this arm alone.
- No src/js change, no policy change to the judged stack, no merge, no push,
  no version bump, no live verification. Commit on branch
  sim-s87135-traj-a; coordinator merges.

## Determinism gate (proof script)
Same-leg re-run reproduces the trajectory rows: the lever leg re-run (or a
second baseline leg, budget permitting) must reproduce field-fight rows and
snapshot sequences for seed 87135 exactly (byte-identical per-seed JSON
modulo anchorCommit, which records the branch tip). A mismatch fails the
gate and the verdict.

## Out-of-scope gaps
Reported to the coordinator as findings-backlog lines in the final report
only; this worker does NOT edit the goal hidden_files backlog itself.
