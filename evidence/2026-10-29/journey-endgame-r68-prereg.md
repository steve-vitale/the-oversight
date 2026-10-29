# Journey endgame r68 — PRE-REGISTRATION (lane B, 2026-10-29)

Leg 4 (endgame). Rotation-b read 4 -> write 5 (social life next) at run end.
Substrate: r65 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on a dead
village, never ticked to fill the leg). Instrument + evidence only;
ZERO src/js changes (gating freeze, Steve 2026-10-27 16:53, stands).
NOWALKIN_W4 is env-gated, default off; Arm B differs from Arm A by that
one variable only.

NEW IN r68 (read-only instrumentation, no policy change): the FEAST-CHAIN
CENSUS. r65's proposal was a feast-then-fight policy arm to test whether
the game rewards the surge deed; before building any arm, r68 measures
which stage of the existing chain starves, per seed: feasts hosted, armed
feasts, feasted-window days (post-daily sample, a lower bound — labeled
as such), draws faced, deedHunt feast sorties/fights, fights starting on
a feasted day, surge day + the fights starting that day. No new policy
variable, no arm built here — the census names the starved stage for the
NEXT run's arm, or shows the chain already connects and r65's
"incidental" reading was wrong.

Seeds (fresh, verified unused in prior endgame notes/probes before play):
88931-88933 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
88934 forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag,
greedy OFF, armory OFF), 88935-88937 wavesnw (waves + NOWALKIN_W4).

## Leg question (r65's carried items, in order)

1. UNLOCK + INVITATION CONJUNCTION — r65: 0/6 unlock, 0/6 conjunction;
   the surge deed is both unnamed during the climb and unpracticed by
   competent play. Does ANY fresh waves village BOTH unlock wave 5 AND
   get announced?
2. PEAK LIVING VETERANS — replication bar: >=1 seed peaks >=2 (daily
   snapshot; end-state count kept alongside, not re-scored).
3. RELEASE-DAY SNAPSHOT — for any seed reaching uw=5, first-day rd5 +
   living veterans from the daily hook; conditional binding (see M13).
4. NOWALKIN REPLICATION, fourth block: tally now r60 Arm A, r61 Arm B,
   r65 Arm B (2-1 Arm B) on tiny kill counts. Tally only — no lever
   fate decided on one block, and none on four either if counts stay
   tiny (kill discipline).
5. RELAY-BRANCH TALLY — series across r59-r65: dark 2, grey 1, light 1
   (r65 filled the light cell, 1/0 noticed/crossed). Tabulate every
   relay final in the block by branch; a second observation in any
   cell is the watch item, not a law.
6. FEAST-CHAIN CENSUS (new) — which stage starves? Read per seed:
   feasts hosted -> armed feasts -> feasted-window days -> draws faced
   / feast sorties / feasted-day fights -> surge marked. If windows
   exist but no fight lands, the next arm is a chase arm. If feasts
   never host, the contribution/arm gate starves. If armed feasts are
   0, devotion arming starves. If the chain connects and surges mark
   through the existing roads, r65's "never practices it" reading is
   corrected, not repeated.
7. DECLINE vs SILENT NO-SHOW — every non-announced surviving seed
   classified withdrawal-voiced vs silent (no withdrawal line, no
   announce). If the split is again unpatterned, it stays carried,
   not closed.

## Pre-registered bindings (a miss is NO-GO, never re-scored mid-run)

- M1 GUARD: >=5/7 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path.
- M2 CENSUS COMPLETE: every committed wave-4 fight on waves seeds
  carries a primary outcome (coverage 100%), AND >=2/3 Arm A waves
  seeds record >=1 committed wave-4 fight.
- M2c ENGINE COVERAGE: census fights == distinct wave-4 opens
  (engine + policy-only), censusErrors 0, on every waves seed.
- M2d COMMIT-GATE NAMED: every uncommitted fight classified.
- M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
- M3b-peak PEAK LIVING VETERAN: >=1/6 waves seeds PEAKS >=2 living
  veterans during the run (daily snapshot). End-state count reported
  alongside, unchanged definition, not re-scored.
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 OR earns the FULL
  seat.
- M4b CONJUNCTION: >=1/6 waves seeds BOTH unlocks wave 5 AND is
  announced (announceDay != null). Expected NO-GO on r61/r65 evidence
  — still binding; a NO-GO names the gap, it does not fail the run.
- M5 VOICING CANONICAL: control — bandCrossings >= 1 AND noticedCount
  >= 1. FALLBACK (r65 metric review, APPLIED here, not re-scored
  there): if the control dies before the window (village-lost with
  announceDay null), M5 judges the block's relay finals' notice lines
  instead, labeled as a fallback, with the control mortality reported,
  not hidden. The fallback GO bar: >=1 relay final in the block with
  its notice line tabulated (same bar as M5b's minimum).
- M5b RELAY-BRANCH TABULATION: every relay final in the block
  tabulated (seed, branch, verbs, communes, doorRelay, noticeLines,
  bandCrossings, final voice) — GO if >=1 relay final tabulated
  beyond the control OR the control alone is tabulated with its
  branch named; NO-GO only if a relay final exists but is untabulated.
- M6 GUARD NAMED: every sat waves seed with deferDays >= 1 records
  a named window-end guard (not 'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON: every mFlee fight matched to codex counter text,
  or the unmatched fight named.
- M9 SUPPLY: blocked wave-4 arrivals counted per seed with the
  contention line verified.
- M10 FULL-SEAT GAP: waveUnlockReady(5) short bars reported for
  every sat waves seed.
- M11 STANDING PEAK: peaks reported for all 7 seeds.
- M12 READINESS-BAR TABLE: armor/weapons/tricks/veterans counts
  from the probe, checked against each sat seed's finale war-path
  audit; agreement reported, disagreements named.
- M13 RELEASE SNAPSHOT: for every seed reaching uw=5, a release-day
  snapshot (day, rd5 counts, living veterans) exists in the per-seed
  JSON; NO-GO if uw=5 is reached but the snapshot is missing.
  Vacuous GO when no seed reaches uw=5, labeled as such — the
  release path itself stays unproven until a uw=5 seed exists.
- M14 INVITE CLASSIFICATION: every non-announced surviving seed
  classified withdrawal vs silent no-show; NO-GO if any is left
  unclassified.
- M15 FEAST-CHAIN CENSUS (new): every seed's chain stages tabulated
  (feasts, armed feasts, feasted-window days, draws faced, feast
  sorties, feast fights, feasted-day fights, surge day or honest
  absence); NO-GO if any stage count is missing for any seed.
- REG: r35 auditNamed GO on sat seeds with nonzero w4/w5; r37
  satPenalty present + voiced-line match on sat seeds.
- PRIMARY: GO iff M1, M2, M2c, M3b-peak, M4, M5, M5b, M6, M7, M8,
  M9, M10, M11, M12, M13, M14, M15 all GO (M3, M4b are tally/question
  metrics, reported, not PRIMARY-gating — M3 decides no lever fate
  alone, M4b is an expected-NO-GO gap probe).

## Pilot gate

Pilot = 88931 + 88935 + 88934 at 180d. Expand to the full 7 seeds
only if the pilot shows census fights, a 199-class peak, a relay
final, or a surge marking — otherwise document and move on per the
pilot-first rule.

## Metric review (carried)

- M3b-peak replaces the end-state replication bar per r61's review;
  the end-state count is still reported for continuity (r55-r65
  series) but does not gate.
- M4 counts the UNLOCK or the FULL seat, not the invitation; M4b
  is the new conjunction metric and is kept separate on purpose.
- M5's fallback is applied here per r65's review: one early control
  death must not sink the voicing metric when relay finals voice
  fine. The fallback is labeled wherever it is used.
- M13's vacuous GO must not be read as instrument proof: the
  release path needs a uw=5 seed before it can be called tested.
- Telemetry baseline describes long-deferral sits (r37), not
  guard-ended windows — r48-r65 all reported it EXPLAINED and did
  not roll it. Re-seed proposal stands; this run reports the
  telemetry-check verdict with the same metrics and does not roll
  the baseline on a LOUD line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path. Comparison
  is r61->r65->r68 via identical substrate, Arm A->Arm B on one
  variable, plus the new read-only feast census.
