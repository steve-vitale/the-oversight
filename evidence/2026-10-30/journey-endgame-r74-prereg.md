# Journey endgame r74 — PRE-REGISTRATION (lane B, 2026-10-30)

Leg 4 (endgame). Rotation-b read 4 at run start (succession r79 closeout
advanced 7 -> 4). This run plays leg 4 and writes 5 (social life next) at
run end. No queue jump: r73's own metric review named this run's items.

Substrate: r73 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on a dead
village, never ticked to fill the leg). Instrument + evidence only, except
the pellet-quote blank below, which is narration-only and decided AFTER the
sweep on its own proof test (see Blank). ZERO gate changes (gating freeze,
Steve 2026-10-27 16:53, stands).

NEW IN r74 (read-only instrumentation, no policy change):
- M18 IDENTITY-AWARE GHOST CLASSIFIER (r73 metric review item): a
  back-with line is a CONFIRMED ghost only when (a) some death record with
  the same first name died before the line's day, AND (b) no death record
  with the same first name died on/after the line's day, AND (c) no
  final-alive roster person shares the first name. The old first-name
  rule is kept as `firstNameHit` and reported alongside, so nothing is
  hidden. Limitation, stated up front: a joiner who arrives AFTER the
  line's day and survives to the end with the same first name makes a
  true ghost read unconfirmed (conservative direction: fewer confirmed
  ghosts, false negatives not false positives). Cross-check (not a
  re-score): the classifier applied to r73's 88966 d49 Grace line must
  read firstNameHit=true, confirmed=false, because grace_obi died d81.
- M9b WATCH BAND (r73 metric review item): contention share reported per
  arm against r73's first values (waves 86.4%, wavesnw 80.3%, control
  88.9%); a swing of >10 points on any arm is FLAGGED in the note as a
  watch item, not a GO/NO-GO bar — the share describes supply pressure
  and no target exists yet.
- M3 TIE PRINT: an Arm A == Arm B kill tie prints TIE, not NO-GO, in the
  analyzer output (prereg already excluded M3 from PRIMARY; the output
  wording now matches).
- M22 FEAST-HOLD is regression reporting this run: distribution per arm
  vs r73 (waves AWAY 41% / CONTRIBUTION 36%; wavesnw AWAY 55% /
  CONTRIBUTION 33%; control CONTRIBUTION 65% / CADENCE 25%).

Seeds (fresh, verified unused in prior endgame per-seed filenames/notes):
88971-88973 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
88974 forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag,
greedy OFF, armory OFF), 88975-88977 wavesnw (waves + NOWALKIN_W4).

## Leg question
1. WALL CONTINUITY — fifth block on this substrate: does ANY fresh waves
   seed peak >=2 living veterans, unlock wave 5, or earn the FULL seat?
2. CONFIRMED GHOSTS — under the identity-aware classifier, does any
   confirmed post-death companion return appear in the block?
3. CONTENTION WATCH — does any arm's blocked/(blocked+committed) share
   swing >10 points vs r73?
4. FEAST-HOLD REGRESSION — does the away+contribution shape hold, or does
   a third gate rise?
5. FULL SEAT LAST MILE (carried) — any third shape beyond r71/r72/r73's two?
6. NOWALKIN REPLICATION, eighth block: tally now 3-3 Arm A with one tied
   block (r60 A, r61 B, r65 B, r68 A, r71 A, r72 B, r73 tie). Tally only.
7. RELAY-BRANCH TALLY — series dark 6, grey 1, light 1. A second grey or
   light observation is the watch item, not a law.
8. DECLINE vs SILENT NO-SHOW (carried) — any decline-and-return, or
   decline-and-never-return? Every non-announced surviving seed classified.
9. 199 MECHANISM (regression only) — gated peaks of exactly 199 reported
   with mechanism class; no longer a watch item.
10. AUDIT CROSS-CHECK (carried) — audit==satWaves on every sat seed.
11. BLANK (r73's documented blank) — the 88964 withdrawal-beat quote
    ("NO FEAST, NO SURGE, NOTHING HERE WE CAN PRICE") overclaims for a
    post-feast pellet bearer: the pellet does not erase banked food
    deeds. Investigate the quote's firing condition and wording AFTER
    the sweep; land a narration-only fix ONLY with a before/after proof
    test showing (a) a post-feast pellet bearer no longer gets the
    never-feasted quote, and (b) a never-feasted pellet bearer still
    does. If the fix touches seat logic or any gate, do NOT land it —
    document it as a builder item instead (gating freeze).

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
- M9b CONTENTION SHARE (watch band, reported not gating): per-arm
  share vs r73 (86.4 / 80.3 / 88.9); FLAG if any arm swings >10 points.
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
- M18 GHOST SCAN (identity-aware): back-with scan ran on every seed,
  every captured line classified confirmed vs first-name-only vs none;
  NO-GO only if the scan itself is missing for a seed. Confirmed hits
  are findings, not NO-GOs. The r73 88966 d49 cross-check (firstNameHit
  true, confirmed false) is reported, not re-scored.
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
- M22 FEAST-HOLD DIAGNOSTIC (regression): feastHoldLog + hostLog present
  on every seed living past day 1; every sampled dusk classified into
  exactly one of HELD / AWAY / ALREADY_FED_TODAY / PLAN_REFUSED /
  BUFFER_SHORT / CADENCE / CONTRIBUTION / UNEXPLAINED. NO-GO if any
  seed lacks the logs or any dusk is unclassified. The DISTRIBUTION
  is the finding — no distribution is pre-judged GO or NO-GO.
- REG: r35 auditNamed GO on sat seeds with nonzero w4/w5; r37
  satPenalty present + voiced-line match on sat seeds.
- PRIMARY: GO iff M1, M2, M2c, M3b-peak, M4, M5, M5b, M6, M7, M9,
  M10, M11, M12, M13, M14, M15, M16, M17, M18, M19, M20, M21, M22
  all GO, plus M8 when it binds (mFlee >= 1). M3, M4b, M9b are
  tally/question metrics, reported, not PRIMARY-gating.

## Pilot gate
Pilot = 88971 + 88975 + 88974 at 180d. Expand to the full 7 seeds
only if the pilot shows a feast-hold signal (any dusk class beyond
HELD/AWAY), census fights, a relay final, or a surge marking —
otherwise document and move on per the pilot-first rule.

## Metric review (carried)
- M2's Arm A clause measures fight coverage, not winnability (r72:
  88951 won lesser with 0 fights; r68's 88933 same). Keep the bar;
  never read an M2 NO-GO alone as a leg failure.
- M8's conditional binding worked in r71 (2 real mFlee fights, both
  matched). Keep the conditional form.
- M19/M20/M21 all worked first time in r72. Keep all three; M20's
  mech199 is now regression-only.
- M16's dusk census keeps its regression-only role.
- M22's distribution (away + contribution) is now the feast question's
  answer; future runs report it as regression unless a lever moves one
  of the two gates.
- NOWALKIN tally 3-3 with one tied block (seven blocks). Still no
  lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot
  (maxTier/satPenalty) whose own note forbids comparing pre-seat
  corpora against it. This run reports the telemetry-check verdict
  with the same metrics and does not roll the baseline on a LOUD
  line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero
  src/js changes on the default path unless the pellet-quote blank
  lands, in which case the panel comparison is narration-only and
  the before/after proof test is the instrument.
