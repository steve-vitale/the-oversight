# Journey endgame r72 — PRE-REGISTRATION (lane B, 2026-10-29)

Leg 4 (endgame). Rotation-b read 4 -> write 5 (social life next) at run end.
Substrate: r71 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on a dead
village, never ticked to fill the leg). Instrument + evidence only;
ZERO src/js changes (gating freeze, Steve 2026-10-27 16:53, stands).
NOWALKIN_W4 is env-gated, default off; Arm B differs from Arm A by that
one variable only.

NEW IN r72 (read-only instrumentation, no policy change): the three named
next instruments from r71's metric review.
1. GRANT LOG. r71's open question: 88941's 8 scale feasts went 0 armed
   while devotion read armed on 136 post-daily samples. The probe wraps
   Game.grantFeastBuff (pass-through) and records per call: day,
   reactorOnline, progFeastSurge, feast.surge, quality, granted/refreshed,
   and refusal class (reactor ceiling vs devotion gate vs other). A
   reactor refusal is distinguishable from an unarmed grant for the
   first time; "devotion armed" and "feast armed" stop being conflated.
2. STANDING TRACE. r71's watch item: standing peaks of exactly 199 on 4
   seeds across r68+r71. The probe samples daily PURE reads only —
   villageStanding() breakdown + waveUnlockReady(4/5) + standingCfg once.
   villageStandingTotal() is deliberately NOT called daily: it fires
   release/hold beats (side effects). The analyzer derives the gated
   total from the standing.js formula (plenty cap, defer4/defer5 holds,
   peak floor). A derived 199 peak with raw>=200 and a named defer5/cap
   hold on some day is the mechanism; a raw peak of exactly 199 is a
   coincidence. The mechanism classification is a finding, printed by
   the analyzer, not a forced verdict.
3. AUDIT CROSS-CHECK. r71's open reconciliation: 88947's audit sums 5
   wave-4+ fought vs 6 census fights. Validated on r71's own records
   BEFORE pre-registering: audit w1-3/w4/w5 numbers equal satWaves
   exactly on all 7 r71 seeds — the audit counts distinct types faced,
   the census counts fights, so a census excess is repeat fights, not
   a mismatch. M21 binds the audit==satWaves equality on this block's
   sat seeds; census-vs-audit deltas are reported with otherEnd counts
   and judged in the note.

Seeds (fresh, verified unused in prior endgame per-seed filenames):
88951-88953 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
88954 forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat diag,
greedy OFF, armory OFF), 88955-88957 wavesnw (waves + NOWALKIN_W4).

## Leg question (r71's carried items, in order)
1. FULL SEAT LAST MILE — r71 showed TWO shapes: breadth-short (88942:
   ready everywhere, w3:3/4, w4:2/3) vs veteran-survival + w5-breadth
   short (88947: veteran died between release and sit, w5:1/2). Does
   ANY fresh waves seed face a second distinct wave-5 type, or earn
   the FULL seat, or show a third shape?
2. PEAK LIVING VETERANS, third block — r68+r71 each peaked >=2. Does
   a third block peak >=2 anywhere?
3. RELEASE-DAY SNAPSHOT — r68+r71 proved it on three seeds. Does any
   fresh seed reach uw=5 with its snapshot?
4. NOWALKIN REPLICATION, sixth block: tally now r60 Arm A, r61 Arm B,
   r65 Arm B, r68 Arm A, r71 Arm A (3-2 Arm A). Tally only — no lever
   fate on small counts, per kill discipline.
5. RELAY-BRANCH TALLY — series across r59–r65 + r68 + r71: dark 4,
   grey 1, light 1. Tabulate every relay final in the block; a second
   grey or light observation is the watch item, not a law.
6. FEAST-CHAIN CENSUS + GRANT LOG — the census stages again (feasts,
   armed feasts, feasted-window days, draws, feast sorties/fights,
   surge day), PLUS every grant call's arming/ceiling state. The
   arming-at-grant question lives or dies on the grant log: if
   unarmed scale feasts trace to reactor refusals, the ceiling is
   the gate; if to devotion-gate refusals with progSurge null at
   grant time, timing is the gate. The dusk census (M16) is kept as
   a regression instrument only — r71 demoted dusk presence from
   feast gate to contributing factor at most.
7. DECLINE vs SILENT NO-SHOW — r68 showed decline-then-announce
   (88935); r71 had no decline at all. Does any fresh seed decline
   and return, or decline and never return? Every non-announced
   surviving seed classified withdrawal-voiced vs silent.
8. GHOST LINES — r68's one post-death return line did not recur in
   r71 (250 lines, 0 hits). Does it recur here?
9. 199 MECHANISM — does any seed derive a gated peak of exactly 199,
   and if so is it a defer5/cap hold with raw>=200 (mechanism) or a
   raw 199 (coincidence)? Compared against the fullseat max standing.
10. AUDIT CROSS-CHECK — does audit==satWaves hold on every sat seed
    of this block, and do census-vs-audit deltas read as repeat
    fights (census excess with a repeated type) rather than gaps?

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
- M16 DUSK CENSUS: every seed that lives past day 1 records dusk
  samples with atHaven+away+unknown == dusks; the away-share
  (away/dusks) is reported per plan. NO-GO if any lived-past-day-1
  seed has zero dusk samples or the counts do not sum.
- M17 SURGE-MODE NAMED: every seed with surgeDay != null carries
  >=1 surge-spend record with a named kind ('combat' or 'healing');
  NO-GO if a surged seed has zero named spends.
- M18 GHOST SCAN: the back-with scan ran on every seed and every
  captured line is classified hit (companion died earlier) vs
  unmatched; NO-GO only if the scan itself is missing for a seed.
  Ghost hits are findings, not NO-GOs.
- M19 GRANT LOG (new): grantLog present on every seed; every
  refused grant classified (reactor / devotion-gate / other).
  NO-GO if any seed lacks the log or any refusal is unclassified.
  Granted-vs-armed-feast counts are compared in the note, not bound
  here (different instruments count different things: grant calls vs
  post-daily armed samples).
- M20 STANDING TRACE (new): every seed living past day 1 carries a
  daily standing trace with a recorded standingCfg, and the
  analyzer derives a gated peak for each. NO-GO if any lived seed
  lacks the trace or the cfg. The 199 mechanism classification is
  a finding, not a verdict: mech199 true/false is printed per seed.
- M21 AUDIT CROSS-CHECK (new): every sat seed's audit line parses
  (w1-3 triple + w4/w5 fought, missing fought clause = 0/0) AND
  matches satWaves exactly on all five counts. NO-GO if any sat
  seed's audit is unparsed or mismatched. Census-vs-audit deltas
  are reported with otherEnd counts and judged in the note.
- REG: r35 auditNamed GO on sat seeds with nonzero w4/w5; r37
  satPenalty present + voiced-line match on sat seeds.
- PRIMARY: GO iff M1, M2, M2c, M3b-peak, M4, M5, M5b, M6, M7, M9,
  M10, M11, M12, M13, M14, M15, M16, M17, M18, M19, M20, M21 all GO,
  plus M8 when it binds (mFlee >= 1). M3, M4b are tally/question
  metrics, reported, not PRIMARY-gating.

## Pilot gate
Pilot = 88951 + 88955 + 88954 at 180d. Expand to the full 7 seeds
only if the pilot shows census fights, a 199-class peak, a relay
final, or a surge marking — otherwise document and move on per the
pilot-first rule.

## Metric review (carried)
- M2's Arm A clause measures fight coverage, not winnability (r68:
  88933 won lesser with ZERO wave-4 fights). Keep the bar, never
  read an M2 NO-GO as a leg failure on its own.
- M8's conditional binding worked in r71 (2 real mFlee fights, both
  matched). Keep the conditional form.
- M5's fallback was not invoked in r71 (control lived and voiced).
  It stays in the prereg.
- M15's census is the binding that behaves; r72 adds the grant log
  r71 named, so the next run's feast question cites the grant, not
  the dusk.
- M16's dusk census killed a hypothesis in r71 and is kept as a
  cheap regression scan; it is no longer the feast question.
- M17's surge-mode log closed r68's disjunction AND surfaced the
  villager-banking share. Keep it.
- M18's ghost scan ran clean in r71 (250 lines, 0 hits). Keep it as
  a cheap regression scan.
- NOWALKIN tally 3-2 Arm A across five blocks: direction held twice
  running for the first time in r71. Still no lever fate — the
  counts are small and the direction has flipped twice in the series.
- The 199 standing-peak attractor (4 seeds across r68+r71) needs a
  mechanism check before it becomes a claim — r72's standing trace
  is that check. Candidate mechanism, from standing.js itself: the
  readiness deferral / plenty cap holds the gated total at t5-1.
- Telemetry baseline: still describes r37 long-deferral sits, not
  guard-ended windows — r48–r71 all reported it EXPLAINED and did
  not roll it. Re-seed proposal stands; this run reports the
  telemetry-check verdict with the same metrics and does not roll
  the baseline on a LOUD line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path. Comparison
  is r71->r72 via identical substrate, Arm A->Arm B on one
  variable, plus the new read-only instruments.
