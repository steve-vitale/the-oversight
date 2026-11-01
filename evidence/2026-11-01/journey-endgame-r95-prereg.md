# Journey endgame r95 — PRE-REGISTRATION (lane B, 2026-11-01)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at run end — verified by re-read after
landing).
Run number basis: last numbered Lane B run is r94 (succession, landed
2026-11-01). This run is r95. No r95 evidence file existed at run start.

Substrate: r92 EXACTLY — capable + deedhunt + vetcommit + greedy deferral
(defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean. FULLSEAT=1,
VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1,
TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware (+10d tail max on
a dead village, never ticked to fill the leg). Instrument + evidence
only; ZERO gate changes (gating freeze, Steve 2026-10-27 16:53, stands).
Any blank fix decided AFTER the sweep, on its own proof test, narration
only — if it touches seat logic or any gate, do NOT land it.

NEW IN r95 (read-only instrumentation, no policy change — the two fixes
r92's metric review named, applied to THIS run's probe, never retro-fitted
to r92):
- VETCONV BASELINE: the probe's policy.fight wrapper now treats a null
  vetFights baseline as 0, so the run's first increment logs (r92 lost
  exactly 1 per incrementing seed to this gap).
- VETCONV PRE-CALL CAPTURE: the wrapper captures the tbfight monster list
  BEFORE the inner fight call, so end-and-clear resolving turns attribute
  to their fight (increment record carries preCall=true) instead of
  reading censusState 'unseen' with empty monsters.
- ANALYZER RULE (pre-registered here, before the sweep): with both fixes
  landed, a seed classifies per-turn-attributed iff its increment-log
  deltas sum to vetFights AND every increment carries >=1 monster
  (post- or pre-call) — including seeds with zero committed census fights,
  whose increments rode engine-only fights. A seed is
  mismatch-unexplained (NO-GO on the instrument) only if its increment sum
  != vetFights, or an increment still carries no monsters. The old
  guarded rule's other branches (per-turn, per-turn-dropped, per-fight,
  no-activity) are unchanged. This rule is STRICTER about attribution
  than r92's post-hoc reading (which explained unseen turns by hand) and
  does not re-score r92.

Seeds (fresh, verified unused in prior endgame notes): 89201-89203 waves
(capable+deedhunt+vetcommit+greedy+armory+fullseat diag), 89204 forcedrift
control (capable + relaygrey FORCEDRIFT=1 + fullseat diag, greedy OFF,
armory OFF), 89205-89207 wavesnw (waves + NOWALKIN_W4).

Pilot gate (per MEASUREMENT.md §9-12): pilot = 89201 + 89205 + 89204 at
full 180d. Expand to the full 7 iff the pilot shows >=1 sat seed OR
>=1 census fight OR >=1 classified village loss; otherwise document
and stop (no panel expansion on a dead question). Pilot seeds are
re-run inside the full sweep and must reproduce identically (same
announce/sat days and summaries) or the sweep is invalid.
Determinism leg before the sweep: DET=1 on 89201 (2x 120d byte-identical).
Smoke: DET covers the pipeline proof; no separate smoke run.

## Leg questions (r92's named next question first)

1. CONJUNCTION — r92's named next question: with the bars proven
   reachable on one seed (89106: wave 5 unlocked, 2 living veterans,
   release snapshot d109 — but never announced, table withdrawn d90,
   veterans dead within 9 days, village lost d140), does ANY fresh seed
   meet bars AND announcement AND survive to sit? I.e., does the full
   seat's binding constraint move from the wave wall to the
   feast/announcement track (89106 withdrew with feasts held but none
   armed — the surge channel never fired) or to post-peak survival?
   Binding watch: M4b-conjunction (bars + announced) and, for any such
   seed, sat outcome + veteran survival to sat day.
2. VETCONV (fixed instrument) — with baseline + pre-call capture, does
   every waves seed reconcile (no mismatch-unexplained), and on the
   reconciled unit, what ends wave-4+ engagements and does any wave-4+
   kill land? Binding: VETCONV-recon (rule above).
3. LOSS-KIND — every village-lost seed classified (scattering /
   extinction / no-successor / other) from flags + loss SAY line + day.
   Binding: LOSSKIND-classified (every loss classified, else NO-GO).
4. WALL CONTINUITY — tenth block on this substrate: does ANY fresh
   waves seed peak >=2 living veterans, unlock wave 5, or earn the
   FULL seat? (M3b-peak, M4 — expected NO-GO on full seat; the wall
   is the finding, not a failure.)
5. WAVES AWAY, fifth block — arm shares + PER-SEED table (r92 metric
   review: arm shares alone mislead — 89202-style homebody seeds hide
   inside them). Contribution-gate shortfall tracked alongside.
6. M18 REGRESSION — sixth block: any confirmed post-death companion
   return under the r74 guard? (Keep the scan; do not retire it yet.)
7. CONTENTION WATCH — blocked AND committed counts beside the share
   (r92 metric review: r92's wavesnw share "drop" was a fighting
   increase, 0 -> 8, with blocked also up 24 -> 29). Flag only on a
   >10-point share swing vs BOTH r92 and r77 baselines, with counts.
8. FULL SEAT LAST MILE (carried) — any shape beyond the seen shapes
   (w5-only; w4+w5; w3+w5; and r92's new shape: bars met, never
   announced)?
9. NOWALKIN REPLICATION, thirteenth block: series tally Arm A 5, Arm B
   4, three ties (twelve blocks). Tally only.
10. RELAY-BRANCH TALLY — series dark 10, grey 1, light 1. A second grey
    or light observation is the watch item, not a law.
11. DECLINE vs SILENT NO-SHOW (carried) — any decline-and-return, or
    decline-and-never-return? Every non-announced surviving seed
    classified.
12. 199 MECHANISM (regression only) — gated peaks of exactly 199.

## Bindings (r92 verbatim, plus the r95 VETCONV rule above)

M1-guard, M2-census, M2c-engine-coverage, M2d-gate-named,
M2b-attribution, M8-exit-canon, M3-conversion (tally),
M3b-peak, M4-wave5-or-full, M4b-conjunction (tally),
M13-release-snapshot, M14-invite-classification,
M5-voicing-canonical, M5b-relay-branch-tabulation,
M6-guard-named-deferred, M10-fullseat-gap, M11-standing-peak,
M12-bar-record, M15-feast-census, M16-dusk-census, M17-surge-mode,
M18-ghost-scan, M19-grant-log, M20-standing-trace,
M21-audit-crosscheck, M22-feast-hold, REG-r35-audit,
REG-r37-satpenalty, VETCONV-recon (r95 rule above),
LOSSKIND-classified. A miss is NO-GO, never re-scored mid-run.

## Telemetry deviation check

Baseline: hidden_files/telemetry-baselines/endgame.json (r37-era
2-metric snapshot). r48–r92 precedent: its LOUD lines (won 0->4,
announceDay newly appeared) are the same stale-baseline artifact:
EXPLAINED, baseline NOT rolled. The re-seed proposal stands; this
run does NOT roll the baseline on a stale artifact. A LOUD line
outside that known pattern is a same-run investigation item.
