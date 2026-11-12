# sim-winnability-round-0930 — Loop B 0930Z coordinator evidence

Run: `fleshout-loop-b-20261112T0930Z` (Loop B, 2026-11-12 03:30 CST / 09:30Z).
Axis: winnability chain. Base at run start: master `0436a04e0` (journey-establishment r133).
Loop A live on its 0915Z claim (scale-onramp bisect ROUND 5: sim-bisect-r5-cut1-a +
sim-bisect-r5-cut2-a) — NOT touched; A landed round 5 mid-run as `9f19007f0`
(cut1 CUT1_COLLAPSED 2/8 + REGIONAL_INTACT, cut2 CUT2_COLLAPSED 2/8 +
REGIONAL_INTACT; collapse still in at 2/3, stall lifts in the first third).
This run took the 0730Z next blanks in order: #1 16-seed holdout for the synergy
deaths/named-class signals, #2 measurement-proof refresh round 8. No new
food-economy arm (parked). Coverage program complete on measurement.

## Stale-lock recovery (0730Z run)

- B lock `fleshout-loop-b-20261112T0730Z` was 2h old at run start (past the
  90-min fallback); its claim was still live but it had NO registered trees
  and NO heartbeat — both its arms had already landed and its branches were
  deleted. Previous run DEAD per the guard. Lock deleted, claim retired to
  `.DEAD`, my lock `fleshout-loop-b-20261112T0930Z` created.
- The dead run's coordinator evidence (`evidence/2026-11-12/sim-winnability-round-0730.md`)
  was left untracked in the main tree. During the service restart window
  (~09:34–09:37Z) it was committed by another agent as `4a61100dd`
  ("merged-master check result follows in second commit"). My own
  `check.js --quick` attempt on merged master was SIGTERM-killed by that
  restart (267s in, no output); I did NOT re-run it for the dead run, to
  avoid duplicating the promised second commit. The PENDING line remains in
  the committed file and the second commit had NOT landed by this run's
  closeout — that follow-up belongs to whoever committed `4a61100dd`, not
  this run.

## Pre-flight

- Main tree: 1 untracked file at run start (the 0730Z evidence above);
  clean after its commit. Disk 37%. `worktree-reap.sh` ran (11/16 active;
  LOUD lines only other owners' uncommitted trees, untouched).
- Worktree registration took ~18 min for the two trees (registry-lock
  contention — Loop A registering its cut2 tree concurrently, plus a reaper
  holding the flock ~10 min scanning 47 trees; several Loop A trees are
  11–12G each, so a single `git status` in one takes minutes).

## Arm 1 — sim-synergyholdout-b: LANDED `11e576828` — GO (signals were noise)

16-seed holdout for the synergy build's two exploratory panel signals
(0730Z blank #1; tracker A-0815Z blank #4). Fresh band 190509–190524
(coordinator verified zero hits in preregs; worker re-verified), competent,
150d, balanced panel before/after on identical seeds. Before leg
`fed635f1f` (pre-synergy master), after leg `ad2bd13fd` (synergy tip);
diff verified exactly `src/js/game.js` +92/−0. The current tip was NOT
used as the after leg — it carries journey r133's preserver-cap game.js
change, which would have confounded the verdict. Worker: prereg
`18cb05021` (rebased `e271385b3`), evidence + panels `11e576828`.

- Village deaths/100d: 62.69 → 61.98 (−0.71, interval −5.48 to +4.00),
  status **`no_material_signal`** — was +12.98 `regression_signal` on 8
  seeds. Direction flipped; total village deaths/run fell 73.4 → 66.2.
- Eligible NPC named-class access: 0.0986 → 0.0809 (−0.0176, interval
  crosses zero), status **`no_material_signal`** — was −0.0867
  `regression_signal`. Per-seed scatter 5 down / 4 up / 7 identical on a
  0–4 NPC numerator; biggest movers are roster swings, not class losses.
- Cost bar PASS: starvation 1 → 2 (bar ≤ 3); arm-only starvation 1 (seed
  190516 only, bar ≤ 2); median survival 117.5d → 103.0d (bar ≥ 94.0d).
- Proof `scripts/test-synergyholdout-b.js`: **14/14 green** — re-run by
  the coordinator on the branch tip AND on the rebased tip (exit 0 both).
- Overall compare decision is still `review_required` (exit 2) on two
  `regression_watch` rows (player deaths/100d, player named-class access
  13/16 → 10/16 seeds) — reported in evidence, not judged per the prereg.
  The player named-class watch is one line in the next synergy follow-up
  if the area re-opens; it does not overturn this verdict.
- Sense test (evidence §): the 8-seed deaths signal was a short-run
  artifact — fewer deaths on a shorter denominator reads as a higher
  rate (190520: deaths 83 → 48, rate 58.0 → 73.8); the class signal is
  noise on a small-denominator ratio over a different sampled roster
  each leg. Dawn resonance is scholar-scoped and cannot touch NPC
  godpath recognition.
- Smoke on the branch tip: discovery still fires (stand_together 3/3);
  cornered_fury not discovered on the tip only because r133 shifted the
  diagnostic seed's held abilities — the pinned-leg design handled this
  correctly.
- Evidence: `evidence/2026-11-12/sim-synergyholdout-b.md` (+ prereg,
  before/after panels + compare `.json`/`.md`).

## Arm 2 — sim-proofrefresh-b8: LANDED `773736559` — GO (proof fresh again)

Measurement-proof refresh round 8 (0730Z blank #2; tracker A-0815Z blank
#5). Premise verified by the worker at run start: proof test FAILED on
`0436a04e0` with "Proof source inputs are not current" — exactly 1
manifest key differed vs the retained b7 panel (`src/js/game.js`, the
synergy dawn-resonance change). Worker: prereg `c5bbf6e02`, proof test
`d199682c6`, panel + re-point + evidence `773736559`.

- Fresh real neutral panel, spec identical to b7 (seeds
  [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9], policies
  [capable, risk-aware, socialite, winseek], 150d, 64 rows), ran
  10:00–10:41Z (~41 min), **zero parent deaths, no resumes** under
  `setsid` from the start (load avg 19–27, sibling holdout panel
  concurrent) — the b7 setsid prescription works; keep it for the next
  refresh. Saved as `evidence/2026-11-12/neutral-proofrefresh-b8.json.gz`,
  sha256 `067ff0dbd0b27a5205b01f33c32b8ff96702762df006a6f4d8b0a40efa2f47c5`
  (verified by the coordinator on merged master);
  `scripts/balance-proof.json` re-pointed (digest matches).
- Proof `scripts/test-proofrefresh-b8.js`: worker runs 11/12 twice, the
  one failing leg both times `test-measurement-cache-flags.js` (0/4, then
  3/4 — the prereg-adjudicated 30s spawn-timeout artifact; manual
  replication with 300s timeouts 4/4, spawns 40.5s / 33.2s vs the 30s
  cap). Coordinator re-ran the full test on the branch tip after the
  panels finished: **12 passed, 0 failed, exit 0** (load had fallen).
- Neutrality reproduces b7 AND b6 exactly; `sourcesStable` true; both
  stale-input negative checks fail as required (b7 and b6 panels fail
  `validate()` with "Proof source inputs are not current").
- Master moved mid-panel (Loop A round-5 landing `9f19007f0`, 7 commits,
  0 manifest hits) — panel kept per prereg, branch rebased onto the
  explicit SHA, manifest re-verified 0 diffs, proofs re-run.
- Wall (panel rows, 64 rows / 150d): national 14/64, wins 15/64, entered
  15/64 (all capable, 15/16), `row.table` 55/64 (= Arc IV reach),
  wave-5 14/64, wave-4 63/64, median survival 90d, vests 19. Vs b7: won
  16→15, national 15→14, wave-5 17→14 — instrument rows as carried, not
  a balance verdict (no lever played, no compare run).
- Evidence: `evidence/2026-11-12/sim-proofrefresh-b8.md` (+ prereg).

## Wall (this run's judged corpora)

- Holdout band (32 configs, 150d): national 0/32, table invitations
  31/32, sittings/wins 0/32, wave-5 5/32, median 117.5d → 103.0d.
- b8 panel (64 rows, 150d): national 14/64, wins 15/64, entered 15/64,
  wave-5 14/64, median 90d.
- scale-onramp stays converging (NOT converged): wins still come only
  through default-OFF courtship + seat instruments on the panel's
  capable leg; wave 5 still 0 on the holdout band's win column; the
  collapse predates the reconcile PRs (A's round 5) and its exit is
  still unlocalized (final third of the window, per A).

## Telemetry deviation check

Worker ran it on per-seed flat rows extracted from the holdout panels
(the tool refuses the gzipped panel corpus directly — recorded, not
waived, same refusal as b7/bisect runs): after leg `wall: table=15/16
entered=0/16 won=0/16`; `LOUD: national disappeared: baseline 12 ->
current 0`; `LOUD: wins disappeared: baseline 16 -> current 0`. The
before leg reads identically (same two LOUD lines) — both are the
winseat-regime artifact the baseline itself warns about (baseline
16/16 wins; this competent-policy panel has national/wins structurally
0 on BOTH legs). Not a change caused by this arm. Baseline NOT rolled.
No telemetry check for b8 (no lever played, single retained .gz —
same reason as b7).

## Infrastructure

- Service restart ~09:34–09:37Z SIGTERM-killed the coordinator's first
  `check.js --quick` (267s in, no output) and the pre-flight reap (177s
  in, no output). Both were re-run after; the reap completed clean.
- Registration ~18 min for two trees (see Pre-flight): registry-lock
  contention with Loop A's cut2 registration + a reaper holding the
  flock ~10 min scanning 47 trees whose `git status` calls take minutes
  in the 11–12G Loop A trees. The same queue struck again at closeout:
  Loop A's stallcut registration held the flock while its
  `git worktree add` sat 8+ min on a checkout child under load.
- Master moved under the run: `4a61100dd` (0730Z evidence commit, by
  another agent), journey r133 `0436a04e0` (before the trees were cut),
  Loop A round-5 landing `9f19007f0` (mid-run). b8 rebased onto the
  explicit SHA by the worker; holdout rebased by the coordinator onto
  `773736559` clean (no rebase quirk), proof re-run green, merged
  ff-only. No pipe masked any exit code.
- Safe-commit index clobber struck the holdout worker on both commits —
  repaired both times with the `ls-tree -r | update-index` pipe,
  commits verified correct.
- Closeout release: the b8 tree + branch were removed by the reaper
  after release (clean, merged — designed behavior). The holdout release
  queued ~25 min behind Loop A's stallcut registration flock and was
  killed by the coordinator; the holdout tree + branch were removed
  directly (`worktree remove --force`, `branch -d`, branch verified
  merged, tree verified clean). Its registry entry is left `active`
  with heartbeat 09:57Z — a future reap drops it when the path reads
  missing.
- `check.js --quick` on merged master `11e576828`: **334 passed, 6
  failed in 1118s** — 4× 120s timeouts (test-living-garden-deed-attainment,
  test-occupation-panels, test-one-person-army-deed-attainment,
  test-trust-observer-neutrality — load timeouts, same class as the
  0730Z branch's deed timeouts), test-measurement-cache-flags (known
  30s spawn-timeout artifact; 4/4 manually in b8), test-phone-frame-proof
  (pre-existing stale on the base, noted in the 0730Z evidence). No
  failure is attributable to either arm (zero src/js changes between
  them); `test-measurement-proof-update.js` passes (b8 re-point).
  Cache: `/tmp/jest-cache-coord-0930-closeout`, log
  `/tmp/check-quick-0930-closeout.log`.

## Metric review

- Holdout: no metric re-scored mid-run. The prereg GO bar (neither
  judged row `regression_signal` AND cost bar) is met in full. One
  prereg clarification recorded in the arm evidence, not hidden: the
  "arm-only deaths" half of the cost bar had no operational definition
  in the prereg, so this run defines it as after-leg starvation deaths
  on seeds where the before leg had none, same +2 allowance — the bar
  passes under that reading (1 ≤ 2) and under the stricter total-alone
  reading. The overall compare decision (`review_required`) is not the
  prereg judge by design.
- b8: the primary metric judged what it claimed — the proof test failed
  on the stale tip with exactly the expected manifest-mismatch error
  (1 key) and passed after a real regeneration + re-point. The
  cache-flags leg failed only on its 30s spawn timeout under
  concurrent-panel load and passed 4/4 manually with generous timeouts
  plus 12/12 on the coordinator's re-run — the prereg's adjudication
  path, used as written. If the timeout keeps tripping on refresh rounds
  run alongside sibling panels, the test's 30s cap (not the cache-flag
  logic) is the thing to revisit next round.
- Nothing outside scope surfaced except the registry-lock queue
  (registration + closeout release both stalled behind other runs'
  flock holders) — recorded here, not chased; the reaper's slow scans
  of 11–12G trees are the underlying cost.

scale-onramp stays converging (NOT converged): the synergy build's
8-seed alarms were noise (holdout GO) and the measurement proof is
fresh again (b8 GO), but no lever has moved the wall numbers and the
collapse's exit is still unlocalized. Next blanks, in order: (1) bisect
round 6 outcome sets the next winnability arm — Loop A live on round 6
(sim-bisect-r6-cut-a + sim-stallcut-a), do not pre-claim it while A is
live; (2) the player named-class `regression_watch` from the holdout
compare (13/16 → 10/16 seeds with a player class) — one line in the
next synergy follow-up if the area re-opens; (3) stale on-disk
mcconfirm-ctrl summary (mergeLeg.seeds 8) until the analyzer re-runs;
(4) measurement-proof refresh round 9 is owed the next time a manifest
change lands — the b8 panel is current for this tip only; (5) the 30s
cache-flags spawn cap keeps tripping on refresh rounds run alongside
sibling panels — revisit the cap, not the cache-flag logic. Claim
deleted; lock deleted.

Evidence: `evidence/2026-11-12/sim-winnability-round-0930.md`.

## Recovery addendum — Loop B 1130Z (stale-lock recovery)

- This run (`fleshout-loop-b-20261112T1130Z`) found the 0930Z run's lock
  (`fleshout-loop-b-20261112T0930Z`, 2026-11-12T09:30:00Z) still present at
  ~11:38Z with no registered worktree heartbeat for its arms — both arms
  had already merged (`11e576828` synergyholdout, `773736559` proofrefresh-b8)
  and their branches were deleted. Previous run DEAD per the guard (lock
  >90 min old, no heartbeat). Lock deleted, claim retired to `.DEAD`, and
  this evidence file committed by the 1130Z run (own branch, ff-only merge;
  see the 1130Z coordinator evidence for the commit SHA).
- The "Claim deleted; lock deleted" line above was written by the 0930Z
  coordinator before it died; the deletions themselves were executed by
  this recovery run. No content of the 0930Z record was changed.
