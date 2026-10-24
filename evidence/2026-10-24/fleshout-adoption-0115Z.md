# Flesh-out adoption run fleshout-20261024T0115Z (axis scale-onramp)

## Stale-lock recovery
Run-start found lock `fleshout-20261023T2217Z` (169 min old, >90-min fallback — deleted).
The dead run's two arm worktrees (sim-trustbuffer, sim-defer5-rediag) had
58-min-stale heartbeats and ZERO live node/python processes — workers dead per
protocol. ADOPTED both arms (registry run_ids rewritten, heartbeats refreshed;
2217Z claim retired to .DEAD). Both arms completed, landed, trees released.

## Arm 1 — sim-trustbuffer (LEVER, claims backlog #857) → GO, landed 22778c486
- Design: LINKFORM=2 + TRUSTBUFFER=1 — tend every active subordinate link with
  trust < 58 (50+ band + one funeral of margin; 58−8=50 ≥ 40) whenever the
  pantry affords the 1,500-kcal tend above a 0.5-day survival floor. The
  buffer never skips a tend week above the floor; control's 20,000-gate does.
- Pilot (8 fresh seeds, 32 configs): mechanism engaged (212 armed buffer
  tends, d60 subordinate trust 53.5 vs 28); primary 6 vs 0 (armed<control) GO.
- Confirm (seeds 69001–69012, 48 configs, 180d death-aware, pinned substrate
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
  ARMORYDRIVE=1 ARMORVILLAGE=1):
  - PRIMARY: post-formation dissolution events control 10 vs armed 0 → GO
  - SECONDARY: mean end dip armed−control +34.0, bar ≥+34 → GO (met exactly,
    no re-score)
  - GUARDRAILS: survival paired diff −14d (bar −15d) PASS; starvation 20→14
    PASS; no new death kinds PASS
  - WALL: control national 16/24, table 14/24, wins 0/24, wave4 0/24, wave5
    0/24, median 141d → armed national 20/24, table 18/24, wins 0/24,
    wave4 0/24, wave5 0/24, median 131.5d. Depth lever moves the wall +4
    (national) / +4 (table); wins and wave-4 remain separate blanks.
- Proof scripts/test-trustbuffer.js 33/33 GREEN post-rebase.
- SENSE: s69009-leadfeast (dip 170) reads true — grief season priced in,
  realm intact at village death d122, national+table reached. Funerals fire,
  the buffer band absorbs them, consequences land.
- Metric review: leadfeast/belongfeast inert at LINKFORM=2 (both reduce to
  competent.daily + linkformCourtship) — effective n=12 for the arm
  comparison; still a clean GO, documented for future runs.
- sim-findings #857 TRUST-BUFFER → FIXED. Policy-side, env-gated default-off,
  zero src/js. No [needs-eyes] (scripts-only).

## Arm 2 — sim-defer5-rediag (DIAG, instrument-only) → DIAG-GO, landed 795156dcd
- Re-attributed the defer5 wave-5 coincidence trap on current master (24 fresh
  seeds, 180d death-aware, w5gates-lib UNMODIFIED).
- 22/22 bar outcomes attributed to named channels, 0 unexplained.
- Defer5 binder: armored 5/10, armed 7/10, tricks 0/10, veterans 9/10 —
  veterans is the sole universal binder (9 never-met). Defer4 binds 0/24.
- Coincidence overlap 0 days on 23/24 (16 days on the one door-opener,
  s70119-lead, window [103,118]).
- Wall: national 8/24, table 19/24, wins 0/24, wave4 18/24, wave5 1/24,
  median 151d.
- Convergence note: the defer5gate named-next ("veterans-retention DIAG")
  closes — armor side filled by armorvillage, veterans side is now the
  entire wall: villages blood wave-4 killers but never hold 2 LIVING
  veterans at once; the one village that coincided everything died within
  24 days of opening the door. Retention half (vetformation, sibling lane)
  is confirmed as the binding half. Stand-raw and plenty-cap are the other
  two live wall segments.
- Proof scripts/test-defer5rediag.js ALL GATES GREEN post-rebase. Sense PASS
  (s70119-lead trace coherent end-to-end). Documented blank: wave-4 killer
  autopsy needs death rows (already in backlog, not duplicated).

## Metric review (run-level)
- TRUSTBUFFER secondary met exactly (+34.0 vs +34 bar) — no re-score; the
  knife-edge is recorded, not moved. The next bar-tightening decision (a
  deeper band, or seat-drive-on) goes to the next run.

## Telemetry deviation check
- wins 16→0 LOUD on every leg of both corpora — REGIME artifact
  (WINSEAT baseline vs SEATDRIVE=0 pre-seat substrate; same class as the
  1930Z/2030Z/2330Z precedents). No other LOUD lines. Baseline NOT rolled.

## Infrastructure
- Dead-run adoption recovered two 0-byte corpus files (EPERM flap) via
  byte-deterministic re-run; safe-commit index clobber struck in both trees
  (repaired via --add --cacheinfo after blob verification).
- Both arms rebased in-worktree onto master (clean), proofs re-run post-rebase,
  ff-merged. Main tree clean at closeout.
- Adopted corpus instruments (defer5rediag-*, trustbuffer-*) carry the dead
  worker's authorship; adoption run's own additions are this note.
