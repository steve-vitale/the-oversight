# Journey endgame r75 — PRE-REGISTRATION (lane B, 2026-10-31)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at run end). No queue jump: r74's own metric
review named this run's question.

Substrate: r74 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1,
VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves
only), TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on
a dead village, never ticked to fill the leg). Instrument + evidence
only; ZERO gate changes (gating freeze, Steve 2026-10-27 16:53, stands).
Any blank fix decided AFTER the sweep, on its own proof test, narration
only — if it touches seat logic or any gate, do NOT land it.

NEW IN r75 (read-only instrumentation, no policy change):
- LAST-MILE TRACE (r74 metric review item): the daily standing-trace hook
  also records a waveTrace entry per day — wavesOf counts (w1..w5 from
  deedState().wavesFaced) plus crisesN/contestsN from deedGateReady()
  (pure reads, try/catch; the diag policy already reads both). At run
  end the probe records wavesFacedKeys (the full wavesFaced mid->wave
  map) and crisisKeys (pg.crises keys, one per kind per run). The
  analyzer's LASTMILE section then reports, per sat waves seed:
  (a) faced wave-3 ids vs the monsters.json wave-3 roster (missing
  type named when the roster mapping is clean, else faced ids + short
  count); (b) the waveTrace timeline — first day each w3 count was
  reached, and stall windows where w3 stayed <4; (c) dusk away-share
  inside stall windows (attention proxy: scholar out at dusk vs home);
  (d) wave-4 blocked-arrival pressure in the same windows (contention
  proxy — the blocked instrument is wave-4 only, so this is a
  correlation, never claimed as the w3 cause); (e) crisis kinds
  weathered (keys) + first day each crisesN count was reached.
  Limitation, stated up front: no wave-3 arrival instrument exists, so
  "opportunity" (a type never arrived) is judged from faced ids +
  transcript mentions of wave-3 monster names, and a type with no
  transcript mention at all reads as never-arrived; a mentioned-but-
  never-faced type reads as attention/engagement gap. If the mention
  mapping proves unreliable, LASTMILE reports the timeline + faced
  ids only and says so.
- M18 is a REGRESSION check this run: the r74 return-ghost guard should
  drive confirmed ghosts to zero. A confirmed hit is a guard-failure
  investigation item (finding, not PRIMARY NO-GO — same rule as r74:
  M18 NO-GO only if the scan itself is missing for a seed).
- M9b watch band vs r74 (waves 79.4%, wavesnw 93.1%, control n/a):
  FLAG if any arm swings >10 points. Reported, not gating.
- M22 feast-hold regression vs r74 (waves AWAY 39% / CONTRIBUTION 33%;
  wavesnw AWAY 65% / CONTRIBUTION 26%; control CONTRIBUTION 43% /
  CADENCE 34%).

Seeds (fresh, verified unused in prior endgame per-seed filenames and
endgame notes r6/r7): 88981-88983 waves (capable+deedhunt+vetcommit+
greedy+armory+fullseat diag), 88984 forcedrift control (capable +
relaygrey FORCEDRIFT=1 + fullseat diag, greedy OFF, armory OFF),
88985-88987 wavesnw (waves + NOWALKIN_W4).

## Leg questions
1. LAST MILE (r74's named question) — on sat waves seeds short on w3
   and/or crises, what blocks the final wave-3 type and the third
   crisis: opportunity (never arrived), attention (scholar never
   goes), or contention (arrival pressure thinned)? LASTMILE reports
   the decomposition per seed; no single-cause verdict is pre-judged.
2. WALL CONTINUITY — sixth block on this substrate: does ANY fresh
   waves seed peak >=2 living veterans, unlock wave 5, or earn the
   FULL seat?
3. M18 REGRESSION — does any confirmed post-death companion return
   appear under the r74 guard?
4. CONTENTION WATCH — does any arm's blocked/(blocked+committed) share
   swing >10 points vs r74?
5. FEAST-HOLD REGRESSION — does the away+contribution shape hold, or
   does a third gate rise? ("Nobody is here to feast with" sub-shape
   tracked.)
6. FULL SEAT LAST MILE (carried) — any fourth shape beyond r71/r72/r73's
   two and r74's third (w3 + crises short with w5 done)?
7. NOWALKIN REPLICATION, ninth block: tally now Arm A 4, Arm B 3, one
   tie (r60 A, r61 B, r65 B, r68 A, r71 A, r72 B, r73 tie, r74 A).
   Tally only.
8. RELAY-BRANCH TALLY — series dark 7, grey 1, light 1. A second grey
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
Carried verbatim from r74 (M1, M2, M2c, M2d, M3 tally, M3b-peak, M4,
M4b tally, M5, M5b, M6, M7, M8 conditional on mFlee >= 1, M9, M9b watch
band, M10, M11, M12, M13, M14, M15, M16, M17, M18 scan-present,
M19, M20, M21, M22, REG r35/r37). PRIMARY: GO iff M1, M2, M2c, M3b-peak,
M4, M5, M5b, M6, M7, M9, M10, M11, M12, M13, M14, M15, M16, M17, M18, M19,
M20, M21, M22 all GO, plus M8 when it binds (mFlee >= 1). M3, M4b, M9b
are tally/question metrics, reported, not PRIMARY-gating. M18 confirmed
hits are findings, not NO-GOs.

## Pilot gate
Pilot = 88981 + 88985 + 88984 at 180d. Expand to the full 7 seeds only
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
  of the two gates.
- NOWALKIN tally 4-3 Arm A with one tied block (eight blocks). Still no
  lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot
  (maxTier/satPenalty) whose own note forbids comparing pre-seat
  corpora against it. This run reports the telemetry-check verdict
  with the same metrics and does not roll the baseline on a LOUD
  line without a same-run investigation.
- Balanced panel (sec.15): no panel comparison applies — zero src/js
  changes on the default path unless a narration-only blank fix lands,
  in which case the before/after proof test is the instrument.
