# Journey endgame r98 — PRE-REGISTRATION (lane B, 2026-11-01)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at run start — verified by re-read after
landing). Run number basis: last numbered Lane B run is r97
(succession, landed 2026-11-01; r96 crisis also 2026-11-01). This run
is r98. No r98 evidence file existed at run start.

Substrate: r95 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Instrument + evidence only; ZERO gate changes (gating freeze,
Steve 2026-10-27 16:53, stands). Any blank fix decided AFTER the
sweep, on its own proof test, narration only — if it touches seat
logic or any gate, do NOT land it.

NEW IN r98 (read-only instrumentation, no policy change — the
wave-5-facing question r95's metric review named):
- W5FACE: the daily upkeep wrapper snapshots deedState().wavesFaced
  keys beside the existing waveTrace push; each newly appearing
  wave-5 key records {day, id} in rec.w5FaceEvents. This gives the
  first-faced day per wave-5 type, which the end-state keys map
  cannot give.
- W5MENTIONS: at summary, the full-run capture is scanned for each
  wave-5 roster display name (monsters.json wave===5: Cancellation,
  Editor, Rerun, Spoiler, Timeslot, Nielsen, Finale, Commercial
  Break, Opening Credits, Network Note) with the r77 word-boundary
  rule and dayBounds day mapping — firstDay, count, firstLine, and
  firstContext (2 lines either side of the first hit), per id.
  A wave-5 monster that is mentioned but never faced, or faced but
  never mentioned before its facing, is visible here.
- W5BLOCKED: blockedArrivalsOf gains the wave-5 name map; every
  blocked arrival now carries wave 4 / 5 / null, so the analyzer
  can count blocked wave-5 arrivals separately from blocked wave-4
  arrivals (r95's 85 blocked wave-4 arrivals were counted without
  a wave-5 split).
- W5WINDOW (analyzer-derived, no new probe field): for each seed
  reaching uw=5, windowDays = (satDay || endDay || 180) -
  releaseSnap.day; the opportunity window in which a wave-5 facing
  could have happened.

Seeds (fresh, verified unused in prior endgame notes): 89301-89303
waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
89304 forcedrift control (capable + relaygrey FORCEDRIFT=1 +
fullseat diag, greedy OFF, armory OFF), 89305-89307 wavesnw
(waves + NOWALKIN_W4).

Pilot gate (per MEASUREMENT.md §9-12): pilot = 89301 + 89305 +
89304 at full 180d. Expand to the full 7 iff the pilot shows >=1
sat seed OR >=1 census fight OR >=1 classified village loss;
otherwise document and stop (no panel expansion on a dead
question). Pilot seeds are re-run inside the full sweep and must
reproduce identically (same announce/sat days and summaries) or
the sweep is invalid. Determinism leg before the sweep: DET=1 on
89301 (2x 120d byte-identical). Smoke: DET covers the pipeline
proof; no separate smoke run.

## Leg questions (r95's named next question first)

1. W5FACING — r95's named next question: with bars + announcement +
   survival now proven together (89206), does ANY fresh seed face a
   wave-5 type, through which arrival path, and what distinguishes
   it from 0-facing seeds? Forks, classified per uw=5 seed:
   FACED (>=1 wave-5 type faced, with first-faced days + mention
   context naming the path); BLOCKED-ONLY (0 faced, >=1 blocked
   wave-5 arrival — the valve ate the supply); MENTIONED-NOT-FACED
   (0 faced, >=1 wave-5 mention, 0 blocked — met/seen but never
   fought); NEVER-ARRIVED (0 faced, 0 blocked, 0 mentions in the
   whole window — the pool never delivered one). Binding:
   W5-question (see below). The arrival path itself is read from
   firstContext lines (followed-you / tile meeting / hunt / other)
   and the fight census where a facing rides a census fight; a
   facing with no context line is reported as unattributed-path,
   not assigned one.
2. WALL CONTINUITY — eleventh block on this substrate: does ANY
   fresh waves seed peak >=2 living veterans, unlock wave 5, or
   earn the FULL seat? (M3b-peak, M4 — expected NO-GO on full seat;
   the wall is the finding, not a failure.)
3. VETCONV (r95 rule stands) — does every waves seed reconcile
   (increment sums + full attribution), and what ends wave-4+
   engagements? Binding: VETCONV-recon (r95 rule).
4. LOSS-KIND — every village-lost seed classified (scattering /
   extinction / no-successor / other). Binding: LOSSKIND-classified.
5. WAVES AWAY, sixth block — arm shares + PER-SEED table, and the
   contribution-gate shortfall alongside.
6. M18 REGRESSION — seventh block: any confirmed post-death
   companion return under the r74 guard? (Keep the scan; do not
   retire it yet.)
7. CONTENTION WATCH — blocked AND committed counts beside the
   share. Flag only on a >10-point share swing vs BOTH r95 and
   r77 baselines, with counts.
8. FULL SEAT LAST MILE (carried) — any shape beyond the seen
   shapes (w5-only; w4+w5; w3+w5; bars-met-never-announced;
   bars-met-announced-sat-lesser-w5-never-faced)?
9. NOWALKIN REPLICATION, fourteenth block: series tally Arm A 5,
   Arm B 5, three ties (thirteen blocks). Tally only.
10. RELAY-BRANCH TALLY — series dark 11, grey 1, light 1. A second
    grey or light observation is the watch item, not a law.
11. DECLINE vs SILENT NO-SHOW (carried) — any decline-and-return,
    or decline-and-never-return? Every non-announced surviving
    seed classified.
12. 199 MECHANISM (regression only) — gated peaks of exactly 199.

## Bindings (r95 verbatim, plus the r98 W5 rule; M4b retired)

M1-guard, M2-census, M2c-engine-coverage, M2d-gate-named,
M2b-attribution, M8-exit-canon, M3-conversion (tally),
M3b-peak, M4-wave5-or-full, M13-release-snapshot,
M14-invite-classification, M5-voicing-canonical,
M5b-relay-branch-tabulation, M6-guard-named-deferred,
M10-fullseat-gap, M11-standing-peak, M12-bar-record,
M15-feast-census, M16-dusk-census, M17-surge-mode,
M18-ghost-scan, M19-grant-log, M20-standing-trace,
M21-audit-crosscheck, M22-feast-hold, REG-r35-audit,
REG-r37-satpenalty, VETCONV-recon (r95 rule),
LOSSKIND-classified, W5-question (below). A miss is NO-GO,
never re-scored mid-run.

W5-question (pre-registered here, before the sweep): GO iff >=1
seed reaches uw=5 AND every uw=5 seed carries complete W5
records (w5FaceEvents array, w5Mentions array, blockedArrivals
with wave fields) so its fork classification is determined. If
no seed reaches uw=5, W5-question is NO-GO (question unanswered
on this block — a data outcome, not a game defect claim). M4b
(conjunction) is RETIRED as a verdict per r95's metric review:
it is reported as an INFO line only, since the conjunction is
already proven (89206 + control 89204).

## Telemetry deviation check

Baseline: hidden_files/telemetry-baselines/endgame.json (r37-era
2-metric snapshot). r48–r95 precedent: its LOUD lines are the
same stale-baseline artifact: EXPLAINED, baseline NOT rolled.
The re-seed proposal stands; this run does NOT roll the baseline
on a stale artifact. A LOUD line outside that known pattern is a
same-run investigation item.
