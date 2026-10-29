# Journey endgame r65 — PRE-REGISTRATION (lane B, 2026-10-29)

Leg 4 (endgame). Rotation-b read 4 -> write 5 (social life next) at run end.
Substrate: r61 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on a dead
village, never ticked to fill the leg). Instrument + evidence only;
ZERO src/js changes (gating freeze, Steve 2026-10-27 16:53, stands).
NOWALKIN_W4 is env-gated, default off; Arm B differs from Arm A by that
one variable only.

Seeds (fresh, verified unused in prior endgame notes/probes before play):
88911-88913 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
88914 forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag,
greedy OFF, armory OFF), 88915-88917 wavesnw (waves + NOWALKIN_W4).

## Leg question (r61's carried items, in order)

1. UNLOCK + INVITATION CONJUNCTION — r61's headline: 88906 unlocked
   wave 5 (d153) and was never invited (never surged, never announced).
   Unlocking and earning a seat are different gates. Does ANY fresh
   waves village BOTH unlock wave 5 AND get announced? If none does,
   the conjunction gap stands as the endgame's central blank: the climb
   never names the surge deed that prices the invitation.
2. PEAK LIVING VETERANS (r61 metric review, APPLIED here, not re-scored
   there): r61's end-state M3b missed 88906's transient 2 (d153, the
   release day). This run counts PEAK living veterans per seed from a
   daily snapshot (waveKillLog killers alive on the roster that day),
   reported alongside the unchanged end-state count. Replication bar:
   >=1 seed peaks >=2.
3. RELEASE-DAY SNAPSHOT (r61 instrument gap, CLOSED here): for any seed
   reaching uw=5, the probe records rd5 counts + living veterans on the
   FIRST day uw hits 5, from the daily hook — not reconstructed after.
4. NOWALKIN REPLICATION, third block: r60 Arm B 0/5 fights, Arm A 1/4;
   r61 reversed it (Arm B 5/26, Arm A 0/17). A third block decides
   nothing alone (kill discipline) but the direction tally is now
   1-1; report it, do not kill or bless the lever on one block.
5. RELAY-BRANCH TALLY (dark 2, grey 1, light 0 across r59-r61 controls
   + waves finals): a light or grey relay final is still the missing
   cell. Tabulate every relay final in the block by branch.
6. DECLINE vs SILENT NO-SHOW (r61 open mechanism): every non-announced
   surviving seed classified withdrawal-voiced vs silent (no withdrawal
   line, no announce). If the split is again unpatterned, it stays
   carried, not closed.

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
  announced (announceDay != null). Expected NO-GO on r61's evidence —
  still binding; a NO-GO names the gap, it does not fail the run.
- M5 VOICING CANONICAL: control — bandCrossings >= 1 AND noticedCount >= 1.
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
- M14 INVITE CLASSIFICATION: every non-announced surviving seed
  classified withdrawal vs silent no-show; NO-GO if any is left
  unclassified.
- REG: r35 auditNamed GO on sat seeds with nonzero w4/w5; r37
  satPenalty present + voiced-line match on sat seeds.
- PRIMARY: GO iff M1, M2, M2c, M3b-peak, M4, M5, M5b, M6, M7, M8,
  M9, M10, M11, M12, M13, M14 all GO (M3, M4b are tally/question
  metrics, reported, not PRIMARY-gating — M3 decides no lever fate
  alone, M4b is an expected-NO-GO gap probe).

## Pilot gate

Pilot = 88911 + 88915 + 88914 at 180d. Expand to the full 7 seeds
only if the pilot shows census fights, a 199-class peak, or a relay
final — otherwise document and move on per the pilot-first rule.

## Metric review (carried)

- M3b-peak replaces the end-state replication bar per r61's review;
  the end-state count is still reported for continuity (r55-r61
  series) but does not gate.
- M4 counts the UNLOCK or the FULL seat, not the invitation; M4b
  is the new conjunction metric and is kept separate on purpose.
- Telemetry baseline describes long-deferral sits (r37), not
  guard-ended windows — r48-r61 all reported it EXPLAINED and did
  not roll it. Re-seed proposal stands; this run reports the
  telemetry-check verdict with the same metrics and does not roll
  the baseline on a LOUD line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path. Comparison
  is r61->r65 via identical substrate, Arm A->Arm B on one variable.
