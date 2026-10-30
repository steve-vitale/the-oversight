# Journey endgame r73 — PRE-REGISTRATION (lane B, 2026-10-30)

Leg 4 (endgame). Rotation-b read 4 at run start — the r72 adoption run
completed analysis but did NOT write the rotation forward, so this run
replays leg 4 and writes 5 (social life next) at run end. No queue jump:
r72's own metric review named this run's question.

Substrate: r72 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on a dead
village, never ticked to fill the leg). Instrument + evidence only;
ZERO src/js changes (gating freeze, Steve 2026-10-27 16:53, stands).
NOWALKIN_W4 is env-gated, default off; Arm B differs from Arm A by that
one variable only.

NEW IN r73 (read-only instrumentation, no policy change): the FEAST-HOLD
DIAGNOSTIC, answering r72's named next question — waves seeds almost never
hold a scale feast (feasts 0 on all six waves seeds in r72's census read;
grant refusals ruled OUT as the choke: exactly one refused grant in the
block, reactor-ceiling). The probe samples every dusk, BEFORE upkeep, the
full scaleFeast gate state, and wraps hostFeast (pass-through):
- dusk sample: day, atHaven, feastDay, armed devotion, reactor online,
  last scale-feast day (ctx._fsLastFeastDay), cadence (7 armed / 14
  unarmed) and whether cadence blocks, contribution (7-day gives +
  tribute, replicated read-only from ctx histories without mutating
  them), feastPlan snapshot (ok, why, have, cost, buffer = have >=
  1.5*cost, invitable guests, away count), cumulative fsFeasts/feasts.
- hostFeast log: every call's day, ok, why.
The analyzer classifies every sampled dusk: HELD (hostFeast ok that day)
/ AWAY / ALREADY_FED_TODAY (feastDay == day) / PLAN_REFUSED (named why)
/ BUFFER_SHORT (have/cost ratio) / CADENCE / CONTRIBUTION (shortfall
kcal) / UNEXPLAINED (plan ok, buffer ok, cadence ok, contribution ok,
at haven, not feastDay, no feast held — the policy did not host for a
reason outside the named gates). UNEXPLAINED is a finding, not an
instrument error: it names the next gate to inspect.

Seeds (fresh, verified unused in prior endgame per-seed filenames):
88961-88963 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
88964 forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag,
greedy OFF, armory OFF), 88965-88967 wavesnw (waves + NOWALKIN_W4).

## Leg question
1. FEAST-HOLD — on waves arms, which gate actually blocks scale feasts?
   Is the block PLAN_REFUSED (at-haven/guest), BUFFER_SHORT (pantry under
   1.5x cost), CADENCE (7/14-day spacing), CONTRIBUTION (<1500 kcal
   given in 7 days), or UNEXPLAINED? The answer decides whether the
   waves feast choke is a pantry problem, a spacing problem, a
   contribution problem, or an un-named policy gate.
2. FULL SEAT LAST MILE (carried) — does ANY fresh waves seed face a
   second distinct wave-5 type, or earn the FULL seat, or show a third
   shape beyond r71/r72's two?
3. PEAK LIVING VETERANS, fourth block — r68+r71 peaked >=2 somewhere,
   r72 peaked 0/6. Does r73 recover >=2 anywhere, or is the direction
   still down?
4. RELEASE-DAY SNAPSHOT (carried) — does any fresh seed reach uw=5 with
   its snapshot?
5. NOWALKIN REPLICATION, seventh block: tally now 3-3 Arm A (r60 A, r61 B,
   r65 B, r68 A, r71 A, r72 B). Tally only — no lever fate on small counts.
6. RELAY-BRANCH TALLY — series dark 5, grey 1, light 1. A second grey or
   light observation is the watch item, not a law.
7. DECLINE vs SILENT NO-SHOW (carried) — does any fresh seed decline and
   return, or decline and never return? Every non-announced surviving
   seed classified withdrawal-voiced vs silent.
8. GHOST LINES (regression) — 220 lines 0 hits in r72, 250 in r71. Recur?
9. 199 MECHANISM (regression only, solved in r72) — gated peaks of
   exactly 199 reported with mechanism class; no longer a watch item.
10. AUDIT CROSS-CHECK (carried) — audit==satWaves on every sat seed.

## Pre-registered bindings (a miss is NO-GO, never re-scored mid-run)
- M1 GUARD: >=5/7 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path.
- M2 CENSUS COMPLETE: every committed wave-4 fight on waves seeds
  carries a primary outcome (coverage 100%), AND >=2/3 Arm A waves
  seeds record >=1 committed wave-4 fight.
- M2c ENGINE COVERAGE: census fights == distinct wave-4 opens
  (engine + policy-only), censusErrors 0, on every waves seed.
- M2d COMMIT-GATE NAMED: every uncommitted fight classified.
- M3 CONVERSION (tally): Arm B total wave-4+ kills vs Arm A.
- M3b-peak PEAK LIVING VETERAN: >=1/6 waves seeds PEAKS >=2 living
  veterans during the run (daily snapshot).
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 OR earns the FULL
  seat.
- M4b CONJUNCTION (tally): >=1/6 waves seeds BOTH unlocks wave 5 AND
  is announced.
- M5 VOICING CANONICAL: control — bandCrossings >= 1 AND noticedCount
  >= 1. FALLBACK (r65, carried): if the control dies before the window,
  M5 judges the block's relay finals' notice lines instead, labeled as
  a fallback, with the control mortality reported, not hidden. Fallback
  GO bar: >=1 relay final in the block with its notice line tabulated.
- M5b RELAY-BRANCH TABULATION: every relay final tabulated — GO if
  >=1 relay final tabulated beyond the control OR the control alone
  tabulated with its branch named; NO-GO only if a relay final exists
  but is untabulated.
- M6 GUARD NAMED: every sat waves seed with deferDays >= 1 records
  a named window-end guard (not 'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON, CONDITIONAL: binding ONLY when >=1 mFlee fight exists
  in the block — every mFlee fight matched to codex counter text, or
  the unmatched fight named. When 0 mFlee fights exist, M8 is VACUOUS.
- M9 SUPPLY: blocked wave-4 arrivals counted per seed with the
  contention line verified.
- M9b CONTENTION SHARE (new, reported not gating — first block with
  the share, no bar yet): blocked / (blocked + committed wave-4
  fights) per arm, reported; a bar is proposed for r74 from this
  block's values, not invented before seeing them.
- M10 FULL-SEAT GAP: waveUnlockReady(5) short bars reported for
  every sat waves seed.
- M11 STANDING PEAK: peaks reported for all 7 seeds.
- M12 READINESS-BAR TABLE: armor/weapons/tricks/veterans counts
  from the probe, checked against each sat seed's finale war-path
  audit; agreement reported, disagreements named.
- M13 RELEASE SNAPSHOT: for every seed reaching uw=5, a release-day
  snapshot exists; NO-GO if uw=5 is reached but the snapshot is
  missing. Vacuous GO when no seed reaches uw=5, labeled as such.
- M14 INVITE CLASSIFICATION: every non-announced surviving seed
  classified withdrawal vs silent no-show; NO-GO if any is left
  unclassified.
- M15 FEAST-CHAIN CENSUS: every seed's chain stages tabulated;
  NO-GO if any stage count is missing for any seed.
- M16 DUSK CENSUS (regression only): every seed that lives past day 1
  records dusk samples with atHaven+away+unknown == dusks.
- M17 SURGE-MODE NAMED: every seed with surgeDay != null carries
  >=1 surge-spend record with a named kind; NO-GO if a surged seed
  has zero named spends.
- M18 GHOST SCAN: back-with scan ran on every seed, every captured
  line classified hit vs unmatched; NO-GO only if the scan itself is
  missing for a seed. Ghost hits are findings, not NO-GOs.
- M19 GRANT LOG: grantLog present on every seed; every refused grant
  classified. NO-GO if any seed lacks the log or any refusal is
  unclassified.
- M20 STANDING TRACE: every seed living past day 1 carries a daily
  standing trace with a recorded standingCfg, and the analyzer
  derives a gated peak for each. NO-GO if any lived seed lacks the
  trace or the cfg. The 199 classification is regression reporting.
- M21 AUDIT CROSS-CHECK: every sat seed's audit line parses AND
  matches satWaves exactly on all five counts. NO-GO if any sat
  seed's audit is unparsed or mismatched.
- M22 FEAST-HOLD DIAGNOSTIC (new): feastHoldLog + hostLog present on
  every seed living past day 1; every sampled dusk classified into
  exactly one of HELD / AWAY / ALREADY_FED_TODAY / PLAN_REFUSED /
  BUFFER_SHORT / CADENCE / CONTRIBUTION / UNEXPLAINED. NO-GO if any
  seed lacks the logs or any dusk is unclassified. The DISTRIBUTION
  across classes is the finding — no class distribution is
  pre-judged GO or NO-GO, and an UNEXPLAINED plurality is reported
  as the next gate to inspect, not as an instrument failure.
- REG: r35 auditNamed GO on sat seeds with nonzero w4/w5; r37
  satPenalty present + voiced-line match on sat seeds.
- PRIMARY: GO iff M1, M2, M2c, M3b-peak, M4, M5, M5b, M6, M7, M9,
  M10, M11, M12, M13, M14, M15, M16, M17, M18, M19, M20, M21, M22
  all GO, plus M8 when it binds (mFlee >= 1). M3, M4b, M9b are
  tally/question metrics, reported, not PRIMARY-gating.

## Pilot gate
Pilot = 88961 + 88965 + 88964 at 180d. Expand to the full 7 seeds
only if the pilot shows a feast-hold signal (any dusk class beyond
HELD/AWAY, i.e. a named block or an UNEXPLAINED), census fights, a
relay final, or a surge marking — otherwise document and move on per
the pilot-first rule.

## Metric review (carried)
- M2's Arm A clause measures fight coverage, not winnability (r72:
  88951 won lesser with 0 fights; r68's 88933 same). Keep the bar;
  never read an M2 NO-GO alone as a leg failure.
- M8's conditional binding worked in r71 (2 real mFlee fights, both
  matched). Keep the conditional form.
- M19/M20/M21 all worked first time in r72. Keep all three; M20's
  mech199 is now regression-only.
- M16's dusk census keeps its regression-only role.
- M9's raw blocked-arrival count (80 in r72) gets its comparison bar
  here as M9b's share; the bar itself waits for r74.
- NOWALKIN tally 3-3 after six blocks, direction flipped three times.
  Any lever-fate claim on this tally would be drift; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot
  (maxTier/satPenalty) whose own note forbids comparing pre-seat
  corpora against it. This run reports the telemetry-check verdict
  with the same metrics and does not roll the baseline on a LOUD
  line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path. Comparison is
  r72->r73 via identical substrate, Arm A->Arm B on one variable,
  plus the new read-only instrument.
