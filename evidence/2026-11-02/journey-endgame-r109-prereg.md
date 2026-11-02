# Journey endgame r109 — PRE-REGISTRATION (lane B, 2026-11-02, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at closeout — verified by re-read after
landing; closeout write chosen over run-start write so a failed run
does not skip the leg, per r103/r104/r105 precedent). Run number basis:
last numbered Lane B run is r108 (succession, landed 2026-11-02).
This run is r109. Slug: journey2-endgame (free at registration;
r105 used it and released it; no -r109 suffix needed unless
registration reports it taken, in which case the deviation is noted).

Substrate: r105 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Instrument + evidence only; ZERO gate changes (gating freeze,
Steve 2026-10-27 16:53, stands). Any blank fix decided AFTER the
sweep, on its own proof test, narration only — if it touches seat
logic or any gate, do NOT land it.

NEW IN r109 (read-only instrumentation, no policy change — the
three gaps r105's metric review named, applied to THIS run's probe
and analyzer, never retro-fitted to r105):
1. MENTION-KIND 'codex' + 'telegraph': kindOf109 adds, before the
   'other' fallback, 'codex' for lines starting with the Codex
   marker (📖 Codex:) and 'telegraph' for Rerun fight telegraphs
   ("winding up Rerun — lands next beat"). Cleaned-presence stays
   presence/crew-beat kinds ONLY (positive list), so these new
   kinds change the 'other' residual, not any presence verdict.
2. walkedBranch sourcing: the probe NO LONGER fills walkedBranch
   from telemetry table_won moral. walkedBranch comes from
   tableState().branch only; telemetry moral is recorded as
   walkedMoral (separate field, reported beside the band). A
   relay seed whose tableState branch is null reads walkedBranch
   null + walkedMoral <moral>, never a mixed claim.
3. FEASTED-AT-OPEN: each fight-open record carries feastedAtOpen
   (feastedActive() sampled at open, beside openSnap). Anatomy
   reports feastedAtStart = feastedAtOpen when present, else the
   old post-daily day-set value (flagged as fallback in the
   analyzer output). The evening-feast blind spot is thus
   measured, not assumed away.

R109 QUESTION (r105's metric review, "next run's question, named"):
the second veteran — on the waves road, what banks a SECOND
living veteran at the same time as the first?
- SECOND-VETERAN ANATOMY (descriptive + coverage bar): for every
  veteran-counted kill, the killer's identity, the kill day, the
  other living veterans on that day, the gap in days to the
  previous kill, and whether the previous killer was still alive
  (and if not, what killed them / when). No outcome bar this
  run — one block cannot set a banking recipe; the coverage bar
  (anatomy on >=90% of veteran-counted kills, with the
  previous-killer fate named) is the binding, so a thin
  decomposition cannot pass silently.
- KILL-ANATOMY (kept, with r105's two caveats as reported
  columns): by census-fight outcome, median party size, turns,
  damage dealt vs monster HP pool, damage share, feasted share
  (now feastedAtOpen first), monster count. The next question
  the table now supports: do kills require a damage THRESHOLD
  (share ~0.8 observed) or a CONTROL condition (stun-lock,
  feast buff)? Read the solo-kill transcript before theorizing
  (r105's 89505 solo Influencer kill had neither named).
- W5-FORK (cleaned, positive list, plus codex/telegraph kinds):
  with the new kinds, does 'other' empty? Does any fresh uw=5
  seed read FACED, BLOCKED-ONLY, MENTIONED-NOT-FACED (cleaned),
  or NEVER-ARRIVED? The feast-rate sub-question stays dormant
  until an unlock exists to rate.
- M17 (revised binding, carried): a surged seed passes with a
  named spend, an other-kind spend receipt, or as surge-unspent
  (still banked at end, no receipt); only a spent-but-unreceipted
  seed is a capture gap (NO-GO).

Seeds (fresh, verified unused: no prior endgame note or endgame
probe script contains 89601-89607 as a seed): 89601-89603 waves
(capable+deedhunt+vetcommit+greedy+armory+fullseat diag), 89604
forcedrift control (capable + relaygrey FORCEDRIFT=1 + fullseat
diag, greedy OFF, armory OFF), 89605-89607 wavesnw (waves +
NOWALKIN_W4).

Bindings (carried from r105, unchanged except the three
instruments above + SECOND-VETERAN anatomy): M1-guard,
M2-census, M2c-engine-coverage, M2d-gate-named, M3-conversion
(tally), M3b-peak (>=1 waves seed peaks >=2 living veterans),
M4-wave5-or-full (>=1/6 waves seeds unlocks wave 5 or earns
the full seat), M5-voicing-canonical, M5b-relay-branch-tabulation
(now with walkedBranch/walkedMoral reported separately),
M6-guard-named, M7-people (2 beats sense-read in full),
M8-exit-canon, M10-fullseat-gap, M11-standing-peak,
M12-bar-record, M13-release-snapshot, M14-invite-classification,
M15-feast-census, M16-dusk-census, M17-surge-mode (revised,
above), M18-ghost-scan, M19-grant-log, M20-standing-trace,
M21-audit-crosscheck, M22-feast-hold, REG-r35-audit,
REG-r37-satpenalty, VETCONV-recon, LOSSKIND-classified,
W5-question (GO iff >=1 uw=5 seed AND every uw=5 seed's records
complete), KILL-ANATOMY-coverage (>=90% of multi-turn census
fights carry anatomy), SECOND-VETERAN-coverage (>=90% of
veteran-counted kills carry killer + previous-killer fate).
M4b retired (INFO only). PRIMARY gates on all except M3/M4b
(tally/question metrics). A miss is NO-GO, never re-scored
mid-run; metric doubts go under "metric review" for the NEXT
run.

Pilot gate (per MEASUREMENT.md §9-12): pilot = 89601 + 89605 +
89604 at full 180d. Expand to the full 7 iff the pilot shows
>=1 sat (any seat/walk), >=1 census fight, and >=1 classified
village loss OR >=1 sat with no loss (the r101/r105 gate shape:
a pilot with no loss at all but 2+ sats still expands, since
loss classification is then exercised by the full sweep's
scatter seeds if any; if the pilot shows 0 sats the run stops
and documents). Pilot seeds must reproduce BYTE-IDENTICALLY
in the full sweep (JSON snapshotted to
evidence/2026-11-02/r109-pilot/ before the sweep overwrites
them). Determinism leg: DET GREEN byte-identical on 89601
(2x 120d).
