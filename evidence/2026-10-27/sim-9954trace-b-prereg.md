# sim-9954trace-b — PRE-REGISTRATION (written BEFORE any trace run, 2026-10-27)

Run: oversight-flesh-out-loop-b, arm sim-9954trace-b. DIAG/measurement
ONLY: ZERO src/js changes, no default flips, no game-code lever. This
arm does NOT re-judge the raidcallers GO, the genericremainder
PARTIAL verdict, or the 9970 closure — their verdicts stand in their
own evidence. Its verdict is ONLY whether the single pilot row below
is traced, narrowed, or left standing, judged ONLY against this
prereg. No verdict is claimed before the replay + trace scripts run.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-genericremainder-b.md + prereg (on master):
  pilot seed 9954, generic (Foraged food) family-seed row, PARTIAL
  verdict — 9970 traced (death-day snapshot timing, 416 == 416),
  9954 UNEXPLAINED. Fresh sub-ledger +5,719 NEW / +3,700 boundary;
  dried exactly 0. EXCLUDED with numbers by that arm: feast-preview
  copy-draws (no 'other' want >= 1500; max 1,496 vs feast floor
  1500), alien raids (zero records fired), stockdoor carry
  (give-kcal gap 49), cooking bonus (taken-items gap exactly the
  7,500 bonus, wrong direction). Day-100 post-snapshot draws cap
  at 5,419 kcal, so >= 300 kcal is unaccounted under ANY
  snapshot-timing model; under the boundary model the unaccounted
  amount is exactly the boundary residual, 3,700. Sibling row 9970
  (+416) was CLOSED by that arm as death-day snapshot timing — do
  NOT re-litigate 9970; this arm is 9954 only.
- evidence/2026-10-27/sim-raidcallers-b.md + prereg: the corpus
  this row came from — pilot seeds 9951-9958, belongseek-nofeast,
  100d death-aware. Seed 9954: survived to day 100, national rank,
  wave 4.
- evidence/2026-10-27/sim-day100raid-code-b.md ("Recorder runs"
  and "Metric review"): RECORDER FIDELITY WARNING. The ledger
  sweeps' death wrapper SUPPRESSES the original Game.registerDeath
  (records deaths into its own array, never calls oDie), and the
  original does stateful work (deathSeen marking, deed credits,
  telemetry, corpse creation with Math.random() in the corpse id).
  Suppressing it shifts the RNG stream from the first death onward.
  Sweep corpora are therefore suppressed-registerDeath trajectories,
  NOT plain-game trajectories. Any recorder that wants to reproduce
  a sweep corpus must replicate the suppression (TRACE_FULL faithful
  sweep replication). A plain-mode run diverges and proves nothing
  about the corpus.
- evidence/2026-10-27/sim-raiddor-ledger-b.md + prereg: boundary
  definition (closing snapshot after the final day's flows settle;
  day-101 sweeps post-horizon and excluded) and the post-snapshot
  raid adjustment.

## Row to trace (verbatim from sim-genericremainder-b.md)

- Pilot seed 9954, generic (Foraged food) family-seed row,
  caller-complete boundary residual +3,700 kcal (1.16% of inflow),
  FAIL. Survived to day 100, national rank, wave 4. Fresh +5,719
  NEW / +3,700 boundary; dried 0.

A positive residual means the closing stock exceeds what the
recorded flows predict: either an unrecorded inflow of that size,
or recorded draws/sweeps/losses overstated by that size, or a
boundary/snapshot timing artifact of that size. This arm settles
which, with per-stack identity — not with bounds.

## Method: faithful replay + per-stack trace (fixed before judging)

### Step 0 — fidelity gate (BEFORE any residual is judged)

Re-run seed 9954 ONLY (no new seeds are spent) as a FAITHFUL
sweep replication: scripts/sweep-9954trace-b.js, vendored from
scripts/sweep-raidcallers-b.js with NO capture changes except the
ONE added read-only stack recorder below. Same policy
(belongseek-nofeast), same env gates (COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off),
same death suppression (the sweep's registerDeath wrapper copied
verbatim, still not delegating to oDie — changing it would change
every trajectory and is a coordinator/Steve call, not this arm's),
same wrapped-policy daily snapshot point.

The added stack recorder is READ-ONLY: it calls the spoilvol
snapshotAll() pantry snapshot (already in the sweep's dependency
chain; it reads state, consumes no RNG, writes only to the
caller's arrays) at four moments:
  (a) every wrappedPolicy.daily snapshot moment (same call as the
      spoilDays entry — the full per-stack breakdown behind each
      channel-total snapshot, all days, all channels);
  (b) start of day-100 policy daily (before POLICY_OBJ.daily
      runs on day 100 — the pre-snapshot side of the boundary);
  (c) the day-100 snapshot moment itself (identical to (a) on day
      100 — recorded explicitly so the boundary split does not
      depend on array indexing);
  (d) post-run final pantry state (after runDays returns — the
      post-snapshot side: day-100 sleep/endDay flows included,
      no day-101 flows exist in a 100d run).
No other recorder is added. No capture file is modified; the new
sweep is a NEW file, and the stack snapshots land in a NEW replay
output directory (evidence/2026-10-27/sim-9954trace-b-replay/),
never overwriting the committed raidcallers corpus.

FIDELITY BAR (hard gate): the replay payload must match the
committed corpus
evidence/2026-10-27/sim-raidcallers-b-corpus/raidcallers-b-belongseek-nofeast-s9954.json
on EVERY shared field except `ms` and except the new stack
fields: headline (daysAlive, endReason, rank, national, table,
win, waveReach, deaths, deathCauses, deathList), and every ledger
count/total the prior arms used (inflowSeen, mealDrawRecords,
stockdoorRecords, directRecords, raidRecords, driedEvents,
spoilEvents sweeps, spoilDays channel totals). The proof script
compares these field by field and reports any mismatch by name.
- If the fidelity gate FAILS: the replay is NOT the corpus
  trajectory. The residual is NOT judged from it; the verdict is
  NO-GO on fidelity grounds, the divergence is reported by field,
  and no stack conclusion is drawn. (A plain-mode divergence
  would be the expected death-suppression effect, not a finding —
  the replay must be the faithful mode, so a fidelity failure
  here means something else changed, e.g. base drift, and it is
  reported as such.)
- Base-drift note, recorded before the run: current worktree HEAD
  descends from the raidcallers base 6ae5049d8, and the ONLY
  src/js difference between the two bases is a one-line
  build-version stamp in src/js/build.js (verified by git diff
  before this prereg was written). That stamp is
  trajectory-neutral (same finding as day100raid-code-b's base
  check), so a faithful replay is EXPECTED to reproduce the
  corpus — but expectation is not evidence: the fidelity gate
  above is what proves it.

### Step 1 — reproduction (independent recomputation)

scripts/test-9954trace-b.js re-derives, from the REPLAY payload
(and cross-checks against the committed corpus), the genericremainder
figures for 9954 by independent recomputation (not by calling the
analyzer's leg function): NEW residual +5,719 (fresh +5,719, dried
0) and BOUNDARY residual +3,700 via stock100 +3,400 − meal100
−5,419 − cc100 0 = −2,019. If either figure differs, the trace
stops: the row under investigation is not the row reproduced, and
the verdict is NO-GO on reproduction grounds.

### Step 2 — per-stack boundary accounting (the settling step)

scripts/trace-9954trace-b.js performs, for seed 9954:

1. Stack-key ledger. Stack key = (channel name, spoilDay,
   kcalEach, foodState). Units accounted per key, all channels
   (not just generic), across three windows:
   - Window P (pre-snapshot day 100): snapshot (b) minus
     snapshot (a) — OBSERVED pre-snapshot day-100 net per key,
     no flow-record dependence.
   - Window Q (post-snapshot day 100): snapshot (d) minus
     snapshot (c) — OBSERVED post-snapshot day-100 net per key.
   - Window B (boundary): the corpus closing snapshot itself
     (snapshot (c) channel totals) vs the NEW-definition ledger
     prediction — the residual, now split per key: for each
     closing stack key, the trace reports whether it is
     (i) carried from the day-99 end snapshot, (ii) created by
     a recorded day-100 inflow/transform-post, (iii) created by
     a recorded day-100 stockdoor push, or (iv) UNMATCHED —
     present in the closing snapshot with no recorded origin.
     An unmatched closing stack total is a named unrecorded
     inflow to the kcal, with its key listed. A recorded draw
     exceeding the available units of its key is a named
     overcount, with its records listed.
2. Wider door census (ALL stacks, ALL doors, both directions
   across the boundary). Every door below is quantified for
   9954 on the replay, in both directions (into the closing
   snapshot and out of it), and the prior arm's exclusions are
   RE-VERIFIED on the wider trace, not assumed:
   - inflow doors (every distinct `door` value in inflows,
     all families — not just generic);
   - stockdoor pushes (stockSurplus; give vs kcal; zero-kcal
     records);
   - meal draws (pantryDraw + drawSpoiled, by context incl.
     'other', player, villager-home, villager-away);
   - direct draws (every distinct `path` in directRecords);
   - _removePantryKcal takes (every distinct caller frame in
     raidRecords: raid-unanswered + all removepantry-<caller>);
   - sweeps (every spoilEvents sweep, by day — incl. day-100
     sweeps; day-101 sweeps cannot exist in a 100d run and the
     trace states the sweep-day range observed rather than
     assuming it);
   - transforms (linked events: pre/post/loss per event;
     UNLINKED events listed individually — an unlinked post
     is a candidate unrecorded inflow, an unlinked pre a
     candidate unrecorded outflow);
   - stockSurplus remainder carry (v._surplusRemainder class);
   - feast previews (feastPlan copy-draws: 'other' wants vs
     the 1,500 feast cost floor — re-verified, not assumed);
   - alien raids (apPlaygroundRaid direct records);
   - death-day flows (9954 survived to day 100 — the trace
     states this and lists no death-day adjustment, rather
     than assuming it);
   - tribute/dues/aid flows (these ARE _removePantryKcal
     caller frames above, but they are also reported as a
     named group, since belongseek's story runs through them).
   Doors the prior arm did NOT cover, added here: the
   all-family (not just generic) census; the per-key
   unmatched-stack test; the observed pre/post-snapshot split
   (windows P and Q) replacing the bounded day-100 split; the
   day-100 sweep-day census; unlinked-transform listing by
   individual event; and the post-run (d) snapshot as the
   post-snapshot anchor (the prior arm had no post-snapshot
   anchor — its post-snapshot net was bounded, not observed).
3. Snapshot-moment test. The observed windows P and Q REPLACE
   the prior arm's bounded split: the boundary model's claim
   (stockdoor pushes + meal draws post-snapshot, inflow
   pre-snapshot) is TESTED against windows P and Q per key,
   not assumed. The point value of the pre-snapshot residual
   (closing snapshot minus pre-snapshot recorded flows) is
   reported: this collapses the prior arm's 300–5,719 range to
   a point if the windows are clean, or shows exactly where
   the range survives.

### Step 3 — mechanism naming rule

A mechanism is named ONLY if its kcal arithmetic closes the row:
mechanism kcal == boundary residual (+3,700) within ±1 kcal,
with the records (or stack keys) listed. A mechanism that
accounts for part of the residual with records listed is a
named COMPONENT (size C), not a closure — it narrows the
remainder to 3,700 − C and is reported as such. Re-attributing
an already-excluded door (feast previews, alien raids,
stockdoor carry, cooking bonus) without NEW evidence is NOT a
trace — it is reported as re-scoring, and the row stays
unexplained for that door.

## PRE-REGISTERED GO / PARTIAL / NO-GO (verbatim — judge ONLY against this)

- GO iff a named door/timing accounts for the FULL +3,700
  boundary residual with exact stack identity: mechanism kcal ==
  3,700 within ±1 kcal, the stack keys (or records) listed, and
  the fidelity gate (Step 0) and reproduction (Step 1) both
  PASS. Stated explicitly: the bar is the full 3,700, not the
  300 floor and not the 5,719 NEW value.
- PARTIAL iff the fidelity gate and reproduction both PASS, and
  at least one of:
  (a) a narrowed bound strictly below +3,700: the observed
      pre/post-snapshot split (windows P and Q) replaces a
      bounded quantity with an observed point value, and the
      resulting unexplained remainder is strictly less than
      3,700 with every door in Step 2 quantified/excluded; or
  (b) the >= 300 floor is closed upward with a named component:
      a named component of size C > 0 (records/stack keys
      listed) is identified as part of the residual — i.e. the
      minimum unexplained amount is now PROVED larger than
      300 in the sense that a concrete portion of the residual
      is attributed (remainder 3,700 − C < 3,700), OR a
      previously live candidate is excluded with a number
      that raises the floor above 300 (the exclusion's kcal
      stated). In either sub-case the narrowed bound and the
      remaining unexplained amount are both stated as numbers.
  PARTIAL is NOT GO: a narrowed bound, however tight, is not a
  closure, and it is reported as such — never rounded up.
- NO-GO iff the fidelity gate FAILS, or reproduction FAILS, or
  neither (a) nor (b) holds (the bound stays exactly 300–3,700
  with no new named component and no observed point value).
  A NO-GO on fidelity/reproduction grounds says nothing about
  the residual itself and is reported that way.

## Horizon, policy, seeds (fixed before judging)

- Horizon: 100 days, death-aware. The boundary in question is
  the day-100 snapshot, so the snapshots/days compared are
  exactly: day-99 end snapshot, day-100 start snapshot (b),
  day-100 snapshot-moment snapshot (c), post-run final pantry
  state (d); flows dated <= 100 vs flows dated > 100 (none
  expected in a 100d run — the trace states the observed range).
  9954 survived, so no death-day adjustment applies; the trace
  states this rather than assuming it.
- Policy: belongseek-nofeast, to match the corpus the remainder
  came from (COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, FEASTSCALE_R13 off; POLICY=belongseek). No
  change is justified: a different policy would be a different
  trajectory, not a trace of this row.
- Seeds: seed 9954 ONLY, re-run as a faithful replay of a spent
  seed. NO new seeds are spent. This arm does NOT re-judge the
  raidcallers GO or the genericremainder PARTIAL verdicts.
- Base: current worktree HEAD (descends from raidcallers base
  6ae5049d8; only src/js difference is the build.js stamp —
  see Step 0). No pin; the fidelity gate is the base check.

## Sense (reported, not judged)

At least one captured line from the 9954 replay around days
99–100 (smokeSayLines / raidSayLines, the sweep's say recorders)
read for meaning — whether the village's recorded speech around
the traced days is coherent with the ledger flows — or an
explicit statement that the replay's captured lines do not cover
those days. Sense is reported, not judged, and never substitutes
for arithmetic. If no transcript surfaces from the trace (the
say recorders cover smoke-rack and treeline lines only), that
gap is recorded explicitly, not papered over.

## Metric review (MEASUREMENT.md section 14)

Pre-registered metrics bind this run: the GO / PARTIAL / NO-GO
above is the only verdict. If the ±1 kcal closure bar proves
wrong (e.g. a mechanism closes to within a few kcal but a unit
conversion rounds), that is written under "metric review" and
the row is still reported PARTIAL (at best) under this prereg,
with the near-miss mechanism and its gap stated — never
re-scored mid-run. If the stack-key definition above proves
wrong (e.g. a transform re-keys a stack so identity matching
fails on a legitimate carry), that is likewise metric review
for the NEXT run, and the trace reports both the key-matched
result and the channel-total result for the row. If the fidelity
gate fails, the metric review records that the replay instrument
— not the residual — is what failed, and proposes the fix for
the NEXT run (e.g. pinning the exact raidcallers base).

## Proof (scripts/test-9954trace-b.js — new in this arm)

The proof (node, not jest) asserts, from the replay payload and
the committed corpus:
  (1) fidelity: every shared field matches except `ms` and the
      new stack fields (mismatches listed by field name);
  (2) reproduction: NEW +5,719 (fresh +5,719, dried 0) and
      BOUNDARY +3,700 re-derived independently, plus the
      bridge stock100 +3,400 − meal100 −5,419 − cc100 0;
  (3) exclusions: every Step-2 door quantified (counts and kcal
      asserted, not narrated);
  (4) verdict check: the accounted total (sum of named
      components) == 3,700 within ±1 kcal.
The proof FAILS (nonzero exit) on an unexplained +3,700 — that
failure IS the honest result for a PARTIAL/NO-GO verdict, and the
evidence reports which checks pass and which fail rather than
claiming a green run. The proof PASSES (exit 0) only when the
accounted total matches the prereg bar, i.e. on a GO verdict.
Proof command (from the worktree root):
  node scripts/test-9954trace-b.js
No jest (the proof is node, not jest). No [needs-eyes]: this
lands a measurement, not a player-visible change.
