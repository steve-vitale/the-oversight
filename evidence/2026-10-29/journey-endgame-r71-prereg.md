# Journey endgame r71 — PRE-REGISTRATION (lane B, 2026-10-29)

Leg 4 (endgame). Rotation-b read 4 -> write 5 (social life next) at run end.
Substrate: r68 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on a dead
village, never ticked to fill the leg). Instrument + evidence only;
ZERO src/js changes (gating freeze, Steve 2026-10-27 16:53, stands).
NOWALKIN_W4 is env-gated, default off; Arm B differs from Arm A by that
one variable only.

NEW IN r71 (read-only instrumentation, no policy change): the two named
next instruments from r68's metric review, plus a ghost-line scan.
1. DUSK CENSUS. r68's hypothesis (NOT proven): waves-road feasts are rare
   (1-3 vs control 18) because the deed-hunt road keeps the scholar out
   at dusk, and feasts gate on dusk-at-haven. The probe now samples
   scholar haven-presence at every dusk upkeep call (dayPart===2, once
   per day, before the original upkeep runs): dusks total, at-haven,
   away, unknown. If waves seeds show a high away-share while the
   control does not, the hypothesis gains its first number; if waves
   seeds are home at dusk most nights, the hypothesis is dead and the
   feast gate must be sought elsewhere (contribution, pantry buffer,
   cadence).
2. SURGE-SPEND LOG. r68 could not name how 88931/88933 surged (zero
   feasted-day wave-4 fights). The spend writes its own receipt into
   state (scholar.feastBuff.use = {kind, day, bonusHp}, kind 'combat'
   or 'healing', plus prog.feastSurgeBy). The probe now records every
   spend (sampled at dusk upkeep AND post-daily, deduped by day+kind),
   so each surge marking carries its mode: combat vs bonus healing,
   and whose blow banked it (scholar 'p' vs villager 'v:<id>').
3. GHOST-LINE SCAN. r68 documented one post-death companion return line
   ("Dominic is back with Erlan" after Erlan's death entry). The probe
   now captures every "is back with X" SAY line with its day, and the
   summary classifies each against the death roster (hit = X died
   earlier). A scan that runs on all seeds replaces one anecdote.

Seeds (fresh, verified unused in prior endgame per-seed filenames):
88941-88943 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
88944 forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag,
greedy OFF, armory OFF), 88945-88947 wavesnw (waves + NOWALKIN_W4).

## Leg question (r68's carried items, in order)
1. FULL SEAT LAST MILE — r68's 88931 met every bar except one distinct
   wave-5 type faced (w5:1/2). Does ANY fresh waves seed face a second
   distinct wave-5 type, or earn the FULL seat?
2. PEAK LIVING VETERANS, replication — r68 met the bar once (88931: 3).
   Does a second block peak >=2 anywhere?
3. RELEASE-DAY SNAPSHOT — r68 proved it non-vacuously (88931 d70).
   Does any fresh seed reach uw=5 with its snapshot?
4. NOWALKIN REPLICATION, fifth block: tally now r60 Arm A, r61 Arm B,
   r65 Arm B, r68 Arm A (2-2). Tally only — no lever fate on small
   counts, per kill discipline.
5. RELAY-BRANCH TALLY — series across r59-r65 + r68: dark 3, grey 1,
   light 1. Tabulate every relay final in the block; a second grey or
   light observation is the watch item, not a law.
6. FEAST-CHAIN CENSUS + DUSK TEST + SURGE MODES — the census stages
   again (feasts, armed feasts, feasted-window days, draws, feast
   sorties/fights, surge day), PLUS the dusk away-share per plan, PLUS
   every surge spend's kind and banker. The dusk hypothesis lives or
   dies on the away-share comparison (waves vs control); the surge
   disjunction (lower-wave combat vs bonus healing) is resolved per
   seed by the spend log, not by another disjunction.
7. DECLINE vs SILENT NO-SHOW — r68 showed decline-then-announce
   (88935). Does any fresh seed decline and return, or decline and
   never return? Every non-announced surviving seed classified
   withdrawal-voiced vs silent.
8. GHOST LINES — does the post-death companion return recur, on which
   seeds, and is the companion always a recorded death?

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
  announced (announceDay != null). Tally/question metric, reported,
  not PRIMARY-gating.
- M5 VOICING CANONICAL: control — bandCrossings >= 1 AND noticedCount
  >= 1. FALLBACK (r65 metric review, carried): if the control dies
  before the window (village-lost with announceDay null), M5 judges
  the block's relay finals' notice lines instead, labeled as a
  fallback, with the control mortality reported, not hidden. The
  fallback GO bar: >=1 relay final in the block with its notice line
  tabulated (same bar as M5b's minimum).
- M5b RELAY-BRANCH TABULATION: every relay final in the block
  tabulated (seed, branch, verbs, communes, doorRelay, noticeLines,
  bandCrossings, final voice) — GO if >=1 relay final tabulated
  beyond the control OR the control alone is tabulated with its
  branch named; NO-GO only if a relay final exists but is untabulated.
- M6 GUARD NAMED: every sat waves seed with deferDays >= 1 records
  a named window-end guard (not 'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON, CONDITIONAL (r68 metric-review fix, APPLIED here):
  binding ONLY when >=1 mFlee fight exists in the block — every mFlee
  fight matched to codex counter text, or the unmatched fight named.
  When 0 mFlee fights exist, M8 is VACUOUS (labeled as such, not
  counted as instrument proof) and does NOT gate PRIMARY.
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
  Vacuous GO when no seed reaches uw=5, labeled as such.
- M14 INVITE CLASSIFICATION: every non-announced surviving seed
  classified withdrawal vs silent no-show; NO-GO if any is left
  unclassified.
- M15 FEAST-CHAIN CENSUS: every seed's chain stages tabulated
  (feasts, armed feasts, feasted-window days, draws faced, feast
  sorties, feast fights, feasted-day fights, surge day or honest
  absence); NO-GO if any stage count is missing for any seed.
- M16 DUSK CENSUS (new): every seed that lives past day 1 records
  dusk samples with atHaven+away+unknown == dusks; the away-share
  (away/dusks) is reported per plan. NO-GO if any lived-past-day-1
  seed has zero dusk samples or the counts do not sum.
- M17 SURGE-MODE NAMED (new): every seed with surgeDay != null
  carries >=1 surge-spend record with a named kind ('combat' or
  'healing'); NO-GO if a surged seed has zero named spends.
- M18 GHOST SCAN (new): the back-with scan ran on every seed and
  every captured line is classified hit (companion died earlier)
  vs unmatched; NO-GO only if the scan itself is missing for a
  seed. Ghost hits are findings, not NO-GOs.
- REG: r35 auditNamed GO on sat seeds with nonzero w4/w5; r37
  satPenalty present + voiced-line match on sat seeds.
- PRIMARY: GO iff M1, M2, M2c, M3b-peak, M4, M5, M5b, M6, M7, M9,
  M10, M11, M12, M13, M14, M15, M16, M17, M18 all GO, plus M8 when
  it binds (mFlee >= 1). M3, M4b are tally/question metrics,
  reported, not PRIMARY-gating.

## Pilot gate
Pilot = 88941 + 88945 + 88944 at 180d. Expand to the full 7 seeds
only if the pilot shows census fights, a 199-class peak, a relay
final, or a surge marking — otherwise document and move on per the
pilot-first rule.

## Metric review (carried)
- M2's Arm A clause measures fight coverage, not winnability (r68:
  88933 won lesser with ZERO wave-4 fights). Keep the bar, never
  read an M2 NO-GO as a leg failure on its own.
- M8's vacuous GO must not be read as instrument proof (r68: 0 mFlee
  fights). This run makes it conditional, per r68's review.
- M5's fallback was not invoked in r68 (control lived and voiced).
  It stays in the prereg: the next early control death will test
  whether the fallback verdict reads honestly in practice.
- M15's census is the binding that behaves; r71 adds the dusk and
  surge-mode instruments r68 named, so the next run's arm decision
  cites a census stage, not a hunch.
- NOWALKIN tally 2-2 across four blocks: the lever's direction has
  flipped twice. No lever fate is decided on a tally that cannot
  hold a direction for two blocks running.
- Telemetry baseline: still describes r37 long-deferral sits, not
  guard-ended windows — r48-r68 all reported it EXPLAINED and did
  not roll it. Re-seed proposal stands; this run reports the
  telemetry-check verdict with the same metrics and does not roll
  the baseline on a LOUD line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path. Comparison
  is r68->r71 via identical substrate, Arm A->Arm B on one
  variable, plus the new read-only dusk/surge/ghost instruments.
