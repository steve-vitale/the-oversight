# sim-wavegate-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1107Z.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero edits to existing policy files, no gate
threshold or demand number moved (the 2215Z/2315Z runs are
explicit: do NOT move readyDemand numbers on diag evidence).
Backlog item 2 from sim-heraldcontact-a (evidence/2026-10-31/
sim-heraldcontact-a.md): 3/8 pilot villages reached national at
wave 2–3 and never unlocked wave 4, so the Herald omen never
started — scale and wave progression are decoupled on this stack.

## Question

(a) What gates wave unlock on the win-pursuit stack — which deed
bar / readiness component blocks, seed by seed?
(b) Is national-without-wave-4 the NORMAL road or a STALL — do
national-before-wave-4 villages later unlock wave 4 / reach the
table / win, or do they sit at national until death or a lesser
win?
(c) On the same band, how do wave-unlock day, national day, table
day, and win day order per seed, and what fraction of national
villages are pre-wave-4 at each milestone?

## Gate model (code canon, read before sims — not invented)

- docs/MONSTER-WAVES.md + src/js/game.js unlockedWave() +
  src/js/standing.js villageStandingTotal()/waveCombatReadiness():
- Wave 2: day >= 8 AND wave-1 ledger points >= 5 (kills only,
  per-type cap 2; src/data/wave-ledger.json barsPerWave
  {1:5, 2:4, 3:4, 4:3, 5:2}).
- Wave 3: day >= 25 AND wave-2 ledger points >= 4.
- Wave 4: wave-3 rung met AND villageStandingTotal() >= 100
  (t4). Standing = blood (+25 per wave-3+ ledger kill point) +
  bonds (+34 per seasoned regional+ link) + bread (+20 per major
  feast, quality >= 1).
- Wave 5: wave-3 rung met AND villageStandingTotal() >= 200
  (t5) AND wave-4 faced (waveEngaged(4) > 0). Bread counts at
  most 100 toward t5 (plenty cap).
- Readiness deferral (standing.js, design call #4 2026-10-16,
  recalibrated 2026-10-18): while raw standing >= t4 but the
  village is not combat-ready for wave 4, the gated total holds
  at 99 (defer4); likewise 199 for wave 5 (defer5). Wave-4
  demand: armored 3 @ P>=10, armed 5, tricks 3, veterans 1
  (living roster member with a wave-3+ kill). Wave-5 demand:
  armored 4 @ P>=15, armed 6, tricks 3, veterans 2 (wave-4+
  kills). Peak ratchet: once a wave releases, the gated total
  never drops below its threshold again.
- Scale rank (hierarchy.js scaleRank()) is a SEPARATE ladder
  (village -> local -> regional -> national -> global) from
  standing. Nothing in unlockedWave() reads scaleRank. The
  decoupling in the handed-forward finding is therefore
  structurally possible by construction; this arm measures
  whether it is the normal road and which component binds.
- Herald omen (src/js/titans.js titanDawnTick): starts only on
  wave 4 unlocked + regional+ rank. So a national village that
  never unlocks wave 4 never starts the omen — the handed
  finding's mechanism, to be verified seed by seed here.

## Base pin

- Worktree HEAD at prereg time: 4c92bbb04 (journey-deepening
  r75 invite-accept arm, measurement only). This base is NEWER
  than the heraldcontact sweep anchor (7c3295767); trajectories
  on the same seeds may therefore differ from the heraldcontact
  census. This arm judges ONLY its own corpus on THIS base;
  heraldcontact numbers are quoted as prior-base context, never
  as current data. The screen-vs-sweep agreement check inside
  this arm is recorder-on vs recorder-off on this base (the
  det-gate), not agreement with the heraldcontact corpus.

## Seed plan (fixed now; no band-shopping)

- Band for direct comparability (task-suggested): the
  heraldcontact judged selection, re-measured for a NEW
  quantity (gate decomposition, never measured on these seeds)
  — NOT a reuse of census numbers.
- Pilot (8): 87104, 87115, 87119, 87127, 87137, 87140, 87109,
  87120 (the heraldcontact pilot).
- Confirm (11, = all remaining selected seeds per the
  heraldcontact metric-review lesson — no fixed-12 forcing):
  87121, 87124, 87126, 87134, 87107, 87135, 87132, 87123, 87103,
  87138, 87128 (the heraldcontact un-run confirm selection;
  never censused before this arm).
- If the pilot gate fails (below), the run stops at pilot as
  INSUFFICIENT-DATA and no confirm is run. If the pilot is
  thin (e.g. few national seeds), the thinness is reported,
  not band-shopped away.

## Policy stack (identical to heraldcontact, minus its recorders)

- withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1, 200d death-aware cap (harness
  Game.over stop; dead villages stop simulating).
- Fullseat-diag stays IN the base stack (it is the instrument
  lineage this arm reuses: its daily snap already reads the
  engine's own gate state). The herald/muster recorders are
  NOT installed — Herald contact is not this arm's question.
- NEW recorder: scripts/policies/wavegate-diag.js
  (WAVEGATE=1). It wraps OUTSIDE fullseat-diag and records
  AFTER the inner daily runs, one compact row per day.

## Recorder purity (env-gated, pure reads, zero game-state writes, zero RNG draws)

- WAVEGATE=1 is the only on-switch. Unset, the layer delegates
  to the wrapped policy byte-identically (proof-test guard).
- Daily row reads ONLY: day; scaleRank(); villageStanding()
  breakdown (war/diplomacy/plenty, warPts, links, feasts);
  standingCfg() (t4/t5/plentyCapT5/readyDemand);
  waveLedgerCfg() (bars, day floors); waveLedgerPoints(1..5);
  waveCombatReadiness(4) and (5) (bars + demand + short);
  _standingPeakWave(); waveEngaged(4); progState()
  tableWaiting/tableDone; Game.won.
- The recorder deliberately does NOT call villageStandingTotal()
  or unlockedWave() mid-run: both can write state / fire beats
  (peak release, hold beats). The base stack's fullseat-diag
  snap already calls both daily, so the engine's own gated
  number is already computed each day by the base stack; this
  recorder DERIVES the gated total and unlocked wave from the
  pure components with the exact code logic (holds: cap /
  defer4 / defer5; floor: peak ratchet; w3 rung; w4-faced) and
  cross-checks the derived final unlocked wave against ONE
  post-run unlockedWave() call in the sweep (after the
  trajectory is complete — trajectory-free). A derivation
  mismatch on any seed is reported as a finding, not smoothed.
- Say capture: the recorder wraps Game.sysSay ONLY to record
  hold/release beat lines (lines containing 'next act',
  'fifth draft', 'RATINGS ARE UP', 'not bought with bread'),
  calling through to the original with identical arguments
  inside try/catch. It writes nothing to game state and draws
  no RNG. The wrapper is installed after loadGame and removed
  after the run. Trajectory-neutrality is PROVEN by the det
  leg, not assumed.
- No muster verb, no call, no button press, no policy action
  is ever taken by the recorder. It cannot move a trajectory
  except through a bug — which the det leg exists to catch.

## Det-gate (before judged sims are trusted)

- scripts/wavegate-det-20261031.js (shell + node compare):
  runs 2 pilot seeds (87104, 87127) twice each — recorder ON
  vs recorder OFF (same stack, same seeds) — to scratch dirs
  under /tmp (never the judged corpus), and compares dayHash
  arrays + end fields (gameDays, won, national, table,
  maxWave, endScaleRank). Requirement: byte-identical hashes
  and identical end fields on both seeds. A mismatch stops
  the run (DIAG-NO-GO on instrument grounds) until explained.
- Corpus determinism leg: one judged pilot seed re-run to a
  scratch dir is byte-identical to its judged JSON.

## Classification rules (binding)

- MILESTONES (first day each is true in daily rows; null if
  never): nationalDay (scaleRank national or global),
  regionalDay (regional+), wave4Day (derived unlockedWave >= 4),
  wave5Day (derived unlockedWave >= 5), tableDay
  (tableWaiting or tableDone true), winDay (Game.won true),
  fullSeatDay (NOT required here; fullseat-diag's own record
  is not re-judged).
- NATIONAL SEED: nationalDay != null. PRE-WAVE-4 AT
  MILESTONE M: derived unlockedWave on day M < 4 (for the win
  milestone, the row on winDay; for run end, the last row).
- ROAD vs STALL (per national seed, judged at run end):
  - ROAD: wave4Day != null (the village later unlocked wave
    4, whenever that falls relative to nationalDay).
  - STALL-AT-NATIONAL: wave4Day == null AND the village
    reached national (it sat at national without wave 4 to
    run end — death, win, or cap, each named).
  - STALL is NOT a pejorative: a lesser win at national
    without wave 4 is a completed road of a different kind
    and is labeled WIN-LESSER, not failure. Death vs win vs
    cap-survival are separate end states, always named.
- WAVE-4 BLOCKER (per national seed, at nationalDay AND at
  run end; the binding component, exactly one of):
  - W3-RUNG-DAY: day < 25.
  - W3-RUNG-BAR: day >= 25 but wave-2 ledger points < 4
    (shortfall named).
  - STANDING-BELOW: w3 rung met, raw standing < 100
    (shortfall split: war / diplomacy / plenty vs their
    earned counts — warPts, links, feasts).
  - DEFER4: raw >= 100, gated held at 99, readiness short
    bars named (armor/weapons/tricks/veterans with counts
    vs demand).
  - UNLOCKED: wave 4 already open (blocker none).
  The same taxonomy with t5 = 200, defer5, plenty-cap, and
  W4-FACED applies to the wave-5 blocker on wave-4 seeds.
- ORDERING: per seed, the sequence of (nationalDay, wave4Day,
  wave5Day, tableDay, winDay) with nulls shown; the band
  summary counts each pairwise order among seeds where both
  milestones exist (e.g. national-before-wave4 vs
  wave4-before-national).
- FRACTIONS: among national seeds, share pre-wave-4 at
  nationalDay, at tableDay (seeds with a tableDay), at winDay
  (seeds with a winDay), and at run end. Denominators are
  always stated; 0/0 is n/a, never 100%.

## Primary metric

Gate-decomposition completeness over the judged band: every
national seed has (a) an unbroken daily row series from day 1
to run end (no gaps, no recorder errors), (b) a blocker
classification at nationalDay and at run end, (c) a road/stall
classification, and (d) a milestone ordering row.
Completeness = national seeds fully decomposed / all national
seeds. Cross-checks: (i) derived final unlockedWave ==
post-run unlockedWave() on every seed; (ii) det-gate
byte-identity on 2 seeds; (iii) recorder errors == 0 on every
seed.

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness 100% on the judged band (pilot +
  confirm), cross-checks (i)–(iii) all pass, instrumentErrors
  = 0 on all seeds, >= 8 usable judged seeds, AND the
  evidence states (a) the seed-by-seed gate decomposition
  (blocker at nationalDay and at end, with counts vs demand
  for every readiness bar), (b) the road-vs-stall answer with
  seed-level numbers and end states, (c) the milestone
  ordering table + pre-wave-4 fractions at each milestone
  with denominators, and (d) wall numbers on the judged band.
- DIAG-NO-GO: completeness < 100% with no read-only
  explanation, or any cross-check failing unexplained, or
  instrumentErrors > 0 with no read-only explanation, or a
  required verdict section (a)–(d) missing, or the pilot
  fails on instrument grounds.
- INSUFFICIENT-DATA: fewer than 8 usable judged seeds, or
  the pilot gate fails (below). The gate question is then
  unanswerable on this band; sections (a)–(d) are still
  reported as far as measurable.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: recorder fires on all 8 pilot seeds with
zero recorder errors; per-seed JSONs valid (days > 0, daily
rows sorted, no gaps); AND gate decomposition complete on
every national seed in the pilot (blocker at nationalDay +
road/stall classification computable). If the pilot fails on
instrument grounds, the verdict is DIAG-NO-GO. If it fails
only because the pilot has zero national seeds (decomposition
vacuous), the verdict is INSUFFICIENT-DATA and no confirm is
run — but the pilot's national count is reported, not hidden.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to heraldcontact: wave-4
doors opened as late as day ~165 on prior bands, so a shorter
cap would censor the unlock tail; the death-aware stop keeps
cost at the survival distribution.

## Panel (§15)

NOT APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same
declaration as herald-b / mustercall-b/2 / heraldcontact-a).
The det leg compares recorder-on vs recorder-off trajectories
of the SAME stack; it is a neutrality proof, not a panel
comparison, and its numbers never enter the census tables.

## Sense-testing (SENSE-TESTING LAW)

The recorder captures hold/release beat lines (sysSay wrap,
above). The evidence judges: does a held village hear an
honest, actionable bar list (counts vs demand, named in the
village's own terms), and does the omen-stage-2 line's promise
("Sound the call") match what actually happens on seeds where
wave 4 unlocked but no meeting follows? Counts alone do not
pass this section.

## Metric review (carried, filled at evidence time)

- (To be filled from the run: did the derived gated total
  match the engine on every seed, did the det-gate hold, did
  any classification rule misfire, did the pilot gate behave.)
