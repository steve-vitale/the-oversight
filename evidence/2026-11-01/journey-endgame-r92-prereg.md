# Journey endgame r92 — PRE-REGISTRATION (lane B, 2026-11-01)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at run end — verified by re-read after
landing; rotation writes have repeatedly failed to stick in recent
Lane B runs, so the file is the authority, not this note's claim).
Run number basis: last numbered Lane B run is r91 (succession, landed
2026-11-01, commit b2f09444b on master). This run is r92.

Substrate: r77 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1,
VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1,
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on
a dead village, never ticked to fill the leg). Instrument + evidence
only; ZERO gate changes (gating freeze, Steve 2026-10-27 16:53, stands).
Any blank fix decided AFTER the sweep, on its own proof test, narration
only — if it touches seat logic or any gate, do NOT land it.

NEW IN r92 (read-only instrumentation, no policy change):
- VETCONV RECONCILIATION (r77 metric-review question, refined): r77's
  note read 89010's vetFights=14 as "14 vetcommit-counted wave-4+
  engagements" against 3 census fights and 0 kills. But vetcommit.js
  increments ctx.vetFights inside policy.fight on EVERY turn a live
  wave-4+ fight is open while commitLive holds — i.e. the counter may
  count fight-TURNS, not engagements (89010's d78 fight alone ran 14
  turns). The r92 probe samples ctx.vetFights at every census
  observation: each census fight record carries vetAtOpen, vetAtClose,
  vetDelta; fast fights carry vetSeen. The analyzer reconciles, per
  seed: vetFights total vs sum of committed-census vetDeltas vs sum of
  committed-census turns. Classification rule (pre-registered):
  per-turn iff |vetFights - sum(turns of committed census fights)| <= 2
  with the residual explained by unobserved/engine-only turns;
  per-fight iff vetFights == census committed n; otherwise
  mismatch-unexplained (NO-GO on the instrument, investigation item).
  The kill-conversion answer then reads off the reconciled unit:
  census outcome histogram + waveKillLog w4+ kills, never the raw
  vetFights number.
- LOSS-KIND (r77 metric-review item 2): every village-lost seed is
  classified by the condition that fired it — scattering (pantry-empty
  hungryDays hit the famine limit, v.scattered), extinction (zero
  living on a non-empty roster, v.extinct), no-successor (player death
  with no candidates), or other — with the loss SAY line, loss day
  (day-mapped via dayBounds), alive count and pantry at loss. The
  89014 shape (lost with survivors) is scattering iff the flags say
  so; the classification is reported, not fixed, before anyone calls
  it a bug. Binding: every village-lost seed classified, else NO-GO
  on the instrument.

Seeds (fresh, verified unused in prior endgame per-seed filenames):
89101-89103 waves (capable+deedhunt+vetcommit+greedy+armory+fullseat
diag), 89104 forcedrift control (capable + relaygrey FORCEDRIFT=1 +
fullseat diag, greedy OFF, armory OFF), 89105-89107 wavesnw (waves +
NOWALKIN_W4).

Pilot gate (per MEASUREMENT.md §9-12): pilot = 89101 + 89105 + 89104 at
full 180d. Expand to the full 7 iff the pilot shows >=1 sat seed OR
>=1 census fight OR >=1 classified village loss; otherwise document
and stop (no panel expansion on a dead question). Pilot seeds are
re-run inside the full sweep and must reproduce identically (same
announce/sat days and summaries) or the sweep is invalid.
Determinism leg before the sweep: DET=1 on 89101 (2x 120d byte-identical).
Smoke: DET covers the pipeline proof; no separate smoke run.

## Leg questions (bindings carried verbatim from r77 unless noted)
1. VETCONV (r77's named question, NEW instrument above) — what unit
   does vetFights count, and on the reconciled unit, what ends
   wave-4+ engagements (talk-down, flee, villager death, other end)
   and does any wave-4+ kill ever land on this substrate?
2. LOSS-KIND (r77's named item, NEW instrument above) — for every
   village-lost seed, what condition fired the loss?
3. WALL CONTINUITY — ninth block on this substrate: does ANY fresh
   waves seed peak >=2 living veterans, unlock wave 5, or earn the
   FULL seat? (M3b-peak, M4 — expected NO-GO, the wall is the
   finding, not a failure.)
4. WAVES AWAY, fourth block — does the AWAY share dip a third time
   (r75/r76 65% → r77 waves 59.5%, wavesnw 52.8%)? If BOTH arms dip
   again next block, the away gate gets its own question. (M22
   reporting; contribution-gate shortfall tracked alongside.)
5. M18 REGRESSION — fifth block: does any confirmed post-death
   companion return appear under the r74 guard? (Keep the scan; do
   not retire it yet.)
6. CONTENTION WATCH — does any arm's blocked/(blocked+committed)
   share swing >10 points vs r77 (waves 94.0%, wavesnw 100%,
   control 71.4%) AND vs r74? Both baselines reported; a
   single-baseline flag overstates on this volatile series.
7. FULL SEAT LAST MILE (carried) — any shape beyond the three seen
   shapes (w5-only; w4+w5; w3+w5)?
8. NOWALKIN REPLICATION, twelfth block: series tally Arm A 5, Arm B 3,
   three ties (eleven blocks). Tally only.
9. RELAY-BRANCH TALLY — series dark 9, grey 1, light 1. A second grey
   or light observation is the watch item, not a law.
10. DECLINE vs SILENT NO-SHOW (carried) — any decline-and-return, or
    decline-and-never-return? Every non-announced surviving seed
    classified.
11. 199 MECHANISM (regression only) — gated peaks of exactly 199.

## Bindings (r77 verbatim)
M1-guard, M2-census, M2c-engine-coverage, M2d-gate-named,
M2b-attribution, M8-exit-canon, M3-conversion (tally),
M3b-peak, M4-wave5-or-full, M4b-conjunction (tally),
M13-release-snapshot, M14-invite-classification,
M5-voicing-canonical, M5b-relay-branch-tabulation,
M6-guard-named-deferred, M10-fullseat-gap, M11-standing-peak,
M12-bar-record, M15-feast-census, M16-dusk-census, M17-surge-mode,
M18-ghost-scan, M19-grant-log, M20-standing-trace,
M21-audit-crosscheck, M22-feast-hold, REG-r35-audit,
REG-r37-satpenalty. NEW: VETCONV-recon (classification per the rule
above; mismatch-unexplained is NO-GO on the instrument) and
LOSSKIND-classified (every village-lost seed classified, else NO-GO
on the instrument). A miss is NO-GO, never re-scored mid-run.

## Telemetry deviation check
Baseline: hidden_files/telemetry-baselines/endgame.json (r37-era
2-metric snapshot). r48–r77 precedent: its LOUD lines (won 0->4,
announceDay newly appeared) are the same stale-baseline artifact:
EXPLAINED, baseline NOT rolled. The re-seed proposal stands; this
run does NOT roll the baseline on a stale artifact. A LOUD line
outside that known pattern is a same-run investigation item.

## PILOT AMENDMENT (pre-sweep, 2026-11-01 — pilot data, not a mid-sweep re-score)
Pilot (89101 waves, 89105 wavesnw, 89104 control, full 180d) met the
expansion gate: 2 sat seeds (89105 lesser beloved/light d92; 89104
lesser relay/dark d91), census fights on 2/3 seeds, 1 classified
village loss (89101 no-successor d149). EXPAND to the full 7.
Pilot also found an instrument gap that is fixed BEFORE the sweep:
- 89101 logged vetFights=2 with ZERO committed census fights (its 2
  census fights are engine-only, turnsObserved=false, closed at
  day-boundary; gateAtOpen commitLive=true on both). The increments
  happened on policy.fight turns the census never attributed — the
  census cannot say which fight they rode on. NEW instrument: the
  probe's policy.fight wrapper now logs every vetFights increase with
  day, delta, the live tbfight's monster mids + data/mdef waves,
  committed flag, over flag, and census state (open/pending/engine/
  unseen). The sweep's VETCONV section reports the increment log and
  its unseen count per seed.
- Rule guard (STRICTER, not friendlier): per-turn and per-turn-dropped
  now require >=1 committed census fight. Under the unguarded rule,
  89101 (comN=0, total=2) read per-turn vacuously (|2-0|<=2); under
  the guarded rule it reads mismatch-unexplained unless the increment
  log attributes the 2 counts to census-visible fights. The
  classification of a zero-committed seed with total>0 is therefore
  an investigation item, not a GO.
Pilot files snapshotted to evidence/2026-11-01/r92-pilot/ before the
sweep overwrites them; the sweep must reproduce pilot announce/sat
days and summaries exactly or the sweep is invalid.
