# Journey endgame r101 — PRE-REGISTRATION (lane B, 2026-11-02)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at run start — verified by re-read after
landing). Run number basis: last numbered Lane B run is r100
(succession, landed 2026-11-01). This run is r101. No r101 evidence
file existed at run start.

Substrate: r98 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Instrument + evidence only; ZERO gate changes (gating freeze,
Steve 2026-10-27 16:53, stands). Any blank fix decided AFTER the
sweep, on its own proof test, narration only — if it touches seat
logic or any gate, do NOT land it.

NEW IN r101 (read-only instrumentation, no policy change — the
three gaps r98's metric review named, applied to THIS run's probe
and analyzer, never retro-fitted to r98):
1. BLOCKED-DAY: blockedArrivalsOf now day-maps each blocked arrival
   via dayBounds (same pattern as the mention scans), so a blocked
   wave-5 arrival can be dated instead of carrying capIdx only.
2. MENTION-KIND: w5Mentions carries firstLineKind, classified from
   r98's actual firstLines: 'broadcast' (SYSTEM "SEASON FINALE
   APPROACHES!"), 'buff-move' (Rerun's own move/buff lines:
   "tiger's Rerun", "RERUN xN ... Overtime:"), 'presence'
   (feast-scavenger "circling the edge of the light" /
   "Something moves out there"), 'crew-beat' ("broadcast tower" /
   "its crew"), else 'other'. The analyzer's W5 fork class now
   uses CLEANED mentions (broadcast/buff-move excluded) beside the
   raw count — a seed with only broadcast/buff mentions reads
   NEVER-ARRIVED, not MENTIONED-NOT-FACED.
3. M9-LABEL: the analyzer's "blocked wave-4 arrivals" count is
   relabelled total blocked arrivals + wave split (w4/w5/other),
   correcting r95's and r98's mislabel. Counts are unchanged, so
   series comparability holds; M9b contention share likewise
   notes blocked = total.

R101 QUESTION (r98's metric review, "next run's question, named"):
the last mile is now wave-3 breadth + the feast-scavenger rate.
- W3-LASTMILE: on every seed reaching uw=5, does it cover w3 4/4
  (fullseatMax w3) alongside w5 2/2 — i.e. is the deed gap closed
  except for facings, or does a breadth gap remain?
- FEAST-RATE: on uw=5 seeds, how many wave-5 facings per feast
  supply (feasts, fsFeasts, feastedDays vs facedW5 count)? First
  measurement of the rate; descriptive, NO bar — one block cannot
  set a rate, and r95 (feasting, 0 faced) vs r98 (feasting, 2
  faced) already shows it varies.
- W5-FORK (cleaned): with lookalikes removed, does any fresh
  uw=5 seed read FACED, BLOCKED-ONLY, MENTIONED-NOT-FACED
  (cleaned), or NEVER-ARRIVED?

Seeds (fresh, verified unused in prior endgame notes): 89401-89403
waves (capable+deedhunt+vetcommit+greedy+armory+fullseat diag),
89404 forcedrift control (capable + relaygrey FORCEDRIFT=1 +
fullseat diag, greedy OFF, armory OFF), 89405-89407 wavesnw
(waves + NOWALKIN_W4).

Bindings (carried from r98, unchanged): M1-guard, M2-census,
M2c-engine-coverage, M2d-gate-named, M3-conversion (tally),
M3b-peak (>=1 waves seed peaks >=2 living veterans),
M4-wave5-or-full (>=1/6 waves seeds unlocks wave 5 or earns the
full seat), M5-voicing-canonical, M5b-relay-branch-tabulation,
M6-guard-named, M7-people (2 beats sense-read in full),
M8-exit-canon, M10-fullseat-gap, M11-standing-peak, M12-bar-record,
M13-release-snapshot, M14-invite-classification, M15-feast-census,
M16-dusk-census, M17-surge-mode, M18-ghost-scan, M19-grant-log,
M20-standing-trace, M21-audit-crosscheck, M22-feast-hold,
REG-r35-audit, REG-r37-satpenalty, VETCONV-recon, LOSSKIND-classified,
W5-question (GO iff >=1 uw=5 seed AND every uw=5 seed's records
complete). M4b retired r98 (INFO only). PRIMARY gates on all
except M3/M4b (tally/question metrics). A miss is NO-GO, never
re-scored mid-run; metric doubts go under "metric review" for the
NEXT run.

Pilot gate (per MEASUREMENT.md §9-12): pilot = 89401 + 89405 +
89404 at full 180d. Expand to the full 7 iff the pilot shows >=1
sat seed OR >=1 census fight OR >=1 classified village loss;
otherwise document and stop (no panel expansion on a dead
question). Pilot seeds are re-run inside the full sweep and must
reproduce identically (same announce/sat days and summaries) or
the sweep is invalid. Determinism leg before the sweep: DET=1 on
89401 (2x 120d byte-identical). Smoke: DET covers the pipeline
proof; no separate smoke run.

People check: 2 finale/transcript beats sense-read in full (M7),
0 senseless flags to pass. Live-build conversation check: not
run — this run changes no UI or dialogue code (instrument-only,
zero src/js diff), so there is no player-facing flow to verify
at 390x844; the r98 precedent (same leg, same instrument-only
pattern) likewise verified dialogue via transcripts. If a future
run touches dialogue UI, the live check applies then.

Probe: `scripts/probe-endgame-r101-20261102.js`. Analyzer:
`scripts/analyze-endgame-r101-20261102.js`.
