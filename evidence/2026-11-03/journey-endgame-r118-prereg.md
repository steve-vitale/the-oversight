# Journey endgame r118 — PRE-REGISTRATION (lane B, 2026-11-03, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start (this run plays leg 4
and writes 5, social life, at closeout — verified by re-read after
landing; closeout write so a failed run does not skip the leg, per
r103/r104/r105/r109/r110 precedent). Run number basis: the Lane B
counter is shared across legs — latest is r117 (succession,
2026-11-03); this run is r118. Slug: journey2-endgame (branch
pre-existed and pointed EXACTLY at master ff1725835, zero commits
ahead/behind — attaching it is not a stale base; verified by
rev-parse before registration).

Run-start incidents (infrastructure, not measurement):
- STALE-LOCK RECOVERY: lock loop2-20261103T145757Z (08:57 CST) had
  NO registered tree and NO heartbeat in REGISTRY.json — dead per
  the overlap guard no matter how fresh the lock looked. Deleted;
  fresh lock loop2-20261103T155953Z written, held throughout,
  deleted at closeout only after verifying it still carries this
  run's run_id.
- REGISTRY-LOCK CONTENTION: a sibling reap held REGISTRY.lock from
  15:53Z; this run's foreground reap queued behind it and was
  stopped (the sibling reap covers the same cleanup — no work
  lost); worktree registration then queued ~18 min and succeeded.
  Heartbeat loop started after registration; registry heartbeat
  verified landed 2026-11-03T16:25:05Z (active). Beats every 600s.
- Main tree clean at pre-flight (0 files), disk 31%, pull up to
  date at ff1725835.

SUBSTRATE: r110 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control clean.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1, TELEMETRY_FULL=1, RELAYGREY=1. 180d, death-aware
(+10d tail max on a dead village, never ticked to fill the leg).
Probe: scripts/probe-endgame-r118-20261103.js (r110 probe verbatim
EXCEPT the two read-only r118 instruments below). Analyzer:
scripts/analyze-endgame-r118-20261103.js (r110 analyzer verbatim
EXCEPT MFLEE-ROUTED + SIT-DAY-DEATHS sections and the r118 input
dir). Comparison: scripts/compare-endgame-r118-vs-r110.js
(descriptive only). Instrument + evidence only for the sweep; any
blank fix decided AFTER the sweep, on its own proof test, narration
only — if it touches seat logic or any gate, do NOT land it (gating
freeze, Steve 2026-10-27 16:53, stands).

HEAD DELTA SINCE r110 (verified by git show --stat, not just
messages): the gameplay change is winnability push ARM 2
(d8f334da8: src/js/fieldFights.js + sigW4.js — sigW4 double damage,
ally gear parity, party morale, known-trick hold). Arm 4 natwindow
(29782dbd3, ff1725835) touched only evidence/scripts/policies —
no src/js, so it cannot move game outcomes. The matched comparison
therefore reads as the arm-2 delta, direction only.

DELIBERATE SEED REUSE (not fresh seeds): 89701-89707 are r110's
seeds, re-run on current HEAD. Same seeds + same probe policy =
matched before/after; only the game code changed. This is the
balanced-panel spirit applied to a HEAD change (same instrument,
same seeds), NOT a fresh-seed block — r110's per-seed table is the
baseline, reproduced in the run note. No significance claim on n=7.

R110 BASELINE (per-seed, for the matched table):
- 89701 waves: lost/scattered d118, 0 fights, uw3.
- 89702 waves: WON LESSER d92, 8 fights (3 vKill, 2 talkDown,
  2 vFlee, 1 otherEnd), killsW4 1, peakVet 1, uw4.
- 89703 waves: lost/no-successor d152, 9 fights (4 mFlee, 2 vDie,
  2 talkDown, 1 vFlee), killsW4 0, peakVet 0, uw4 — THE GRIND SHAPE.
- 89704 forcedrift control: WON LESSER d90, 3 fights (1 vDie,
  1 talkDown, 1 mFlee), killsW4 0, uw4.
- 89705 wavesnw: WON LESSER d120, 9 fights (3 vKill, 3 vDie,
  3 otherEnd), killsW4 3, peakVet 2, uw5, faced Timeslot d112 —
  full-seat gap exactly w5 1/2 + veterans-at-sit 1/2 (Diana died
  d120, cause 'alien', no fight).
- 89706 wavesnw: scattered d34, 0 fights, uw2.
- 89707 wavesnw: scattered d57, 0 fights, uw3.

R118 QUESTION (r110's metric review, "next run's question, named",
plus the arm-2 delta): on the SAME seeds, does arm 2 move the
endgame — the wave-4 grind (89703's 9-fight 0-kill shape), the
pair-to-sit (89705's sit-day veteran death), and the full-seat gap
(w5 1/2, veterans-at-sit 1/2)? And what IS an mFlee, now that the
instrument records the routed path?
- ARM2-DELTA (descriptive, NOT gating): per-seed sat/won/end,
  census fights by outcome, killsW4, peakVet, uw, w5faces, r110 vs
  r118. Direction noted; no causal claim beyond the HEAD delta,
  no significance claim.
- MFLEE-ROUTED (coverage bar, GATING): every mFlee fight carries
  gotAwayLines (array, possibly empty for fled-flag fights) +
  closeSnapResult + closeWhy. Classes: fled-flag (monFled true),
  result-named (closeSnapResult non-null), gotAway-only. A mFlee
  with monFled=true on a kind WITHOUT an explicit flee component
  is a monster-commitment VIOLATION (LOOK, same-run investigation).
- SIT-DAY-DEATHS (INFO only): deaths on satDay and in the pre-sit
  week, flagged veteran-killer or not. Question: do sit-day deaths
  (Diana's shape) recur, and do they take veterans?
- SECOND-VETERAN (kept, with channel + pair-lifetime): can the
  pair now survive THROUGH a sit with 2 living veterans?
- W5-FORK (kept, with producer-name kind): does any seed face a
  SECOND distinct wave-5 type, or earn the FULL seat?
- PRODUCER-NAME EXERCISE (kept): does any fresh mention name a
  Producer in a non-ability line? (Unexercised in r110.)

INTERESTING FINDING (what would count): any full-seat win; any
second distinct wave-5 type faced; any mFlee carrying monFled=true
on a non-flee kind; any sit-day veteran death; a wave-4 kill-rate
direction change on matched seeds (especially 89703: 0 kills in
9 fights -> kills, or a second 0-kill grind, which would say arm 2
did not move the grind on this seed).

BINDINGS (carried from r110, unchanged except the two items above):
M1-guard, M2-census, M2c-engine-coverage, M2d-gate-named,
M3-conversion (tally), M3b-peak (>=1 waves seed peaks >=2 living
veterans), M4-wave5-or-full (>=1/6 waves seeds unlocks wave 5 or
earns the full seat), M5-voicing-canonical,
M5b-relay-branch-tabulation (walkedBranch from tableState only,
walkedMoral separate), M6-guard-named-deferred, M8-exit-canon,
M10-fullseat-gap, M11-standing-peak, M12-bar-record,
M13-release-snapshot, M14-invite-classification, M15-feast-census,
M16-dusk-census, M17-surge-mode (revised: surged seed passes with
a named spend, other-kind receipt, or surge-unspent; only a
spent-but-unreceipted seed is a capture gap, NO-GO),
M18-ghost-scan, M19-grant-log, M20-standing-trace,
M21-audit-crosscheck, M22-feast-hold, REG-r35-audit,
REG-r37-satpenalty, VETCONV-recon, LOSSKIND-classified,
W5-question (GO iff >=1 uw=5 seed AND every uw=5 seed's records
complete), KILL-ANATOMY-coverage (>=90% of multi-turn census
fights carry anatomy), SECOND-VETERAN-coverage (>=90% of
veteran-counted kills carry killer + previous-killer fate +
channel), MFLEE-routed-coverage (100% of mFlee fights carry
gotAwayLines array + closeSnapResult field). M4b retired (INFO
only). SIT-DAY-DEATHS is INFO only. ARM2-DELTA is descriptive
only. PRIMARY gates on all except M3/M4b (tally/question
metrics) and the INFO/descriptive items. A miss is NO-GO, never
re-scored mid-run; metric doubts go under "metric review" for the
NEXT run.

PILOT GATE (per MEASUREMENT.md §9-12): pilot = 89701 + 89705 +
89704 at full 180d. Expand to the full 7 iff the pilot shows
>=1 sat (any seat/walk) AND >=1 census fight AND (>=1 classified
village loss OR >=2 sats). Pilot seeds' JSONs are snapshotted to
evidence/2026-11-03/r118-pilot/ before the sweep overwrites them,
and must reproduce BYTE-IDENTICALLY in the full sweep (same HEAD,
same probe — r110's precedent; the HEAD change vs r110 does not
break within-run determinism). A mismatch VOIDS the sweep and the
run stops. Determinism leg: DET GREEN byte-identical on 89701
(2x 120d) on current HEAD.

TELEMETRY: baseline is still the r37-era 2-metric snapshot
(maxTier 16, satPenalty.penalty 91; regime unrecorded). Expect the
same stale-baseline LOUD artifact as r48-r110 (EXPLAINED, baseline
NOT rolled). Any NEW LOUD shape is a same-run investigation item.
The re-seed proposal stands.
