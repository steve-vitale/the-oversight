# Journey endgame r77 — PRE-REGISTRATION (lane B, 2026-10-31)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at run end). No queue jump: r76's own metric
review named this run's question.

Substrate: r76 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1,
VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves
only), TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on
a dead village, never ticked to fill the leg). Instrument + evidence
only; ZERO gate changes (gating freeze, Steve 2026-10-27 16:53, stands).
Any blank fix decided AFTER the sweep, on its own proof test, narration
only — if it touches seat logic or any gate, do NOT land it.

NEW IN r77 (read-only instrumentation, no policy change):
- FIRST-MENTIONING-LINE (r76 metric-review fix): probe records, per
  wave-3 roster type, the verbatim first matching full-run capture line
  (truncated 400 chars) in rec.w3Mentions[].firstLine. The analyzer
  prints it for every mentioned-but-never-faced type on sat seeds, so
  the spool question can be answered per line-kind (arrival/boundary
  line vs codex line vs fight narration vs gossip) instead of per
  name-presence.

Seeds (fresh, verified unused in prior endgame per-seed filenames and
endgame notes/probes): 89008-89010 waves (capable+deedhunt+vetcommit+
greedy+armory+fullseat diag), 89011 forcedrift control (capable +
relaygrey FORCEDRIFT=1 + fullseat diag, greedy OFF, armory OFF),
89012-89014 wavesnw (waves + NOWALKIN_W4).

## Leg questions
1. SPOOL, WITH THE FIRST LINE (r76's named question) — on sat waves
   seeds short on w3, for each mentioned-but-never-faced type, what
   kind of mention is the first line? An arrival the scholar never
   engaged (engagement gap) or a narration-only mention (no gap)?
   Spool is the named suspect: mentioned-but-never-faced on r76
   seeds 89003 (d72) and 89005 (d105).
2. WAVES AWAY, THIRD BLOCK — does the 65% waves AWAY share (r75, r76)
   hold a third block, or revert? Reported as regression.
3. WALL CONTINUITY — eighth block on this substrate: does ANY fresh
   waves seed peak >=2 living veterans, unlock wave 5, or earn the
   FULL seat?
4. M18 REGRESSION — fourth block: does any confirmed post-death
   companion return appear under the r74 guard?
5. CONTENTION WATCH — does any arm's blocked/(blocked+committed) share
   swing >10 points vs r76 (waves 88.3%, wavesnw 94.0%, control 50.0%)
   AND vs r74 (wavesnw 93.1%)? Both baselines reported; a single-
   baseline flag overstates on this volatile series.
6. FULL SEAT LAST MILE (carried) — any shape beyond the three seen
   shapes (w5-only; w4+w5; w3+w5)?
7. NOWALKIN REPLICATION, eleventh block: series tally Arm A 5, Arm B 3,
   two ties (r60 A, r61 B, r65 B, r68 A, r71 A, r72 B, r73 tie, r74 A,
   r75 A, r76 tie). Tally only.
8. RELAY-BRANCH TALLY — series dark 8, grey 1, light 1. A second grey
   or light observation is the watch item, not a law.
9. DECLINE vs SILENT NO-SHOW (carried) — any decline-and-return, or
   decline-and-never-return? Every non-announced surviving seed
   classified.
10. 199 MECHANISM (regression only) — gated peaks of exactly 199
    reported with mechanism class; no longer a watch item.
11. AUDIT CROSS-CHECK (carried) — audit==satWaves on every sat seed.
12. BLANK — none pre-named; any blank found in the sweep is fixed
    AFTER it, narration-only, with a before/after proof test, or
    documented as a builder item.

## Pre-registered bindings (a miss is NO-GO, never re-scored mid-run)
Carried verbatim from r76 (M1, M2, M2c, M2d, M3 tally, M3b-peak, M4,
M4b tally, M5, M5b vacuous-GO definition, M6, M7, M8 conditional on
mFlee >= 1, M9, M9b watch band, M10, M11, M12, M13, M14, M15, M16, M17,
M18 scan-present, M19, M20, M21, M22, REG r35/r37). PRIMARY: GO iff M1,
M2, M2c, M3b-peak, M4, M5, M5b, M6, M7, M9, M10, M11, M12, M13, M14,
M15, M16, M17, M18, M19, M20, M21, M22 all GO, plus M8 when it binds
(mFlee >= 1). M3, M4b, M9b are tally/question metrics, reported, not
PRIMARY-gating. M18 confirmed hits are findings, not NO-GOs.

## Pilot gate
Pilot = 89008 + 89012 + 89011 at 180d. Expand to the full 7 seeds only
if the pilot shows a feast-hold signal (any dusk class beyond
HELD/AWAY), census fights, a relay final, a surge marking, OR any sat
seed with w3/crises short bars (last-mile material) — otherwise
document and move on per the pilot-first rule.

## Metric review (carried)
- M2's Arm A clause measures fight coverage, not winnability. Keep the
  bar; never read an M2 NO-GO alone as a leg failure.
- M8's conditional binding worked in r71. Keep the conditional form.
- M22's distribution (away + contribution) is the feast question's
  answer; future runs report it as regression unless a lever moves one
  of the two gates. Waves AWAY held at 65% for two blocks (r75, r76).
- NOWALKIN tally Arm A 5, Arm B 3, two ties (ten blocks). Still no
  lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot
  (maxTier/satPenalty) whose own note forbids comparing pre-seat
  corpora against it. This run reports the telemetry-check verdict
  with the same metrics and does not roll the baseline on a LOUD
  line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero src/js
  changes on the default path unless a narration-only blank fix lands,
  in which case the before/after proof test is the instrument.
- Residual wording question (not fixed): does "NO HUNGER ON THE RECORD"
  mislead when sentiment was taught but the surge never used? Logged,
  not fixed — r74's landed proof covers the both-banked case only.
