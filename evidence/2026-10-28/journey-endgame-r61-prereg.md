# Journey endgame r61 — PRE-REGISTRATION (lane B, 2026-10-28)

Leg 4 (endgame). Rotation-b read 4 -> write 5 (social life next) at run end.
Substrate: r60 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on a dead
village, never ticked to fill the leg). Instrument + evidence only;
ZERO src/js changes (gating freeze, Steve 2026-10-27 16:53, stands).
NOWALKIN_W4 is env-gated, default off; Arm B differs from Arm A by that
one variable only.

Seeds (fresh, verified unused in prior endgame notes/probes before play):
88901-88903 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
88904 forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag,
greedy OFF, armory OFF), 88905-88907 wavesnw (waves + NOWALKIN_W4).

## Leg question (r60's carried items, in order)

1. SECOND FIGHTING ARM B SEED: does a second Arm B seed that actually
   fights also convert zero? (r60: Arm B fought on 1/3 seeds, 5 fights,
   0 kills; Arm A 1/3 seeds, 4 fights, 1 kill. Seed count, not
   opportunity, is now the confound. A second fighting Arm B seed at
   zero would strengthen the case against NOWALKIN; it still would
   not kill the lever on one block alone — kill discipline.)
2. RELAY-BRANCH VOICING: compare noticeLines / bandCrossings across
   EVERY relay final in the block (waves seeds included, not just the
   control), by branch (light / grey / dark). r60 lead: relay/dark
   control fired markers (noticed 1, bandCrossings 1); r59 relay/grey
   control fired none (0/0). Do NOT re-score r59's NO-GO.
3. VETERANS-ONLY CHASE: does an 88601-class village appear again
   (armor/weapons/tricks met, veterans the only short bar), and does
   any village bank 2 living veterans? Weapons-bar watch: r58/r59
   sat waves seeds all met weapons; r60 sat waves seeds were short
   on weapons on 3/4. Report the M12 weapons column against that.
4. DECLINE-BOILERPLATE WART (carried, no data in r60 — zero
   withdrawals): if any withdrawal occurs, measure readable-beat
   vs boilerplate mismatch; if none, the wart stays carried, not
   closed.
5. PANTRY-AT-END NOTE (r60: 88602 won lesser with pantryKcal 0 at
   run end): record pantry at end for every sat seed; do not claim
   the finale spends the pantry unless a line says so.

## Pre-registered bindings (a miss is NO-GO, never re-scored mid-run)

- M1 GUARD: >=5/7 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path.
- M2 CENSUS COMPLETE: every committed wave-4 fight on waves seeds
  carries a primary outcome (coverage 100%), AND >=2/3 Arm A waves
  seeds record >=1 committed wave-4 fight.
- M2c ENGINE COVERAGE: census fights == distinct wave-4 opens
  (engine + policy-only), censusErrors 0, on every waves seed.
- M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
- M3b LIVING VETERAN: >=1/6 waves seeds ends with >=1 LIVING veteran
  (spread), and the replication bar is >=2 living veterans on >=1 seed.
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 OR earns the FULL
  seat (expected NO-GO on a one-veteran road — still binding).
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
  audit; agreement reported, disagreements named (audit counts
  DISTINCT wave-4 types, census counts fights — not a mismatch).

## Pilot gate

Pilot = 88901 + 88905 + 88904 at 180d. Expand to the full 7 seeds
only if the pilot shows census fights, a 199-class peak, or a relay
final — otherwise document and move on per the pilot-first rule.
(The r55-r60 blocks all expanded; the gate is still written here
and judged honestly, not waived in advance.)

## Metric review (carried)

- M4 counts the UNLOCK or the FULL seat, not the veterans bar.
- Telemetry baseline describes long-deferral sits (r37), not
  guard-ended windows — r48-r60 all reported it EXPLAINED and did
  not roll it. Re-seed proposal stands; this run reports the
  telemetry-check verdict with the same metrics and does not roll
  the baseline on a LOUD line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path. Comparison
  is r60->r61 via identical substrate, Arm A->Arm B on one variable.
