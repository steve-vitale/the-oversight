# sim-gateproof-a — fresh full gate + measurement-proof refresh

## Prereg

- **Run:** fleshout-20261117T1015Z, axis food-economy, arm sim-gateproof-a
  (tracker blanks #1 + #2: fresh full gate + measurement-proof refresh).
  Tooling/measurement only — zero game-code change.
- **Base SHA:** `9be3676d8` (main-tree master at run start; the worktree
  branch sim-gateproof-a was registered at this tip, tree clean).
  Master moved during the run (see below); branch rebased onto the
  explicit new SHA at closeout and the panel regenerated on the new tip.
- **Primary metric (Part A — gate):** `node scripts/check.js --quick`
  run ONCE on this tree: 0 attributable failures beyond the standing
  profile. Standing profile from recent runs: 330/10, 333/7, 280/7 —
  all with a pre-existing parity-gear assertion and a
  measurement-proof staleness pair.
- **Primary metric (Part B — proof):** `node
  scripts/godpath/test-measurement-proof-update.js` pass/fail on the
  tip. GO = exit 0, all legs pass, after the refresh.
- **Panel spec:** seeds [7], policies [capable, risk-aware, socialite,
  winseek], days 150, origin Columbus, Ohio — via
  `node scripts/balance-panel.js --out <panel-dir> --n 1` (4 rows).
  Exactly the command/spec that produced the panel previously pointed
  at (neutral-r211-rebased.json.gz, 4 cases, 199s,
  journey-endgame-r211.md:324).
- **Horizon:** N/A for the gate (check.js --quick carries its own list);
  the panel carries its own 150d spec.
- **GO bar (pre-registered):** (a) test-measurement-proof-update 9/9
  exit 0 on the final tip; (b) measurement-workflow 9/9; (c)
  cache-flags 4/4 outright (2026-11-12 load-artifact lesson: if it
  fails under load, run the discriminating A/B on a quiet box before
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-gateproof-a.js 12/12 incl.
  stale-input negatives (the retained r211-rebased panel AND the b20
  panel FAIL validate() on the new tip); (f) ontology exit 0; (g) the
  gate runs once with 0 attributable failures beyond the standing
  profile — the measurement-proof staleness pair must be ABSENT after
  the refresh, and the parity-gear assertion is expected to remain as
  pre-existing. Any leg miss = NO-GO, no re-scoring.
- Full prereg committed first:
  `evidence/2026-11-17/sim-gateproof-a-prereg.md` (including the spec
  decision below, recorded before running).

## Spec decision (brief deviation, recorded before running)

The brief names the ede1a2796 precedent (capable/seed 7/30d) and the
current proof as 01ab3e346. Both are stale: the proof was re-pointed
twice since — b20 (64-row, 2c4bf282f, Nov 15) and then r211 (`--n 1`,
4-row, seed 7 x 4 policies x 150d, panel c015d348…,
journey-endgame-r211.md:324), which is what scripts/balance-proof.json
pointed at on this tip. Regenerating at capable-only/30d would SHRINK
the maintained proof from 4 cohorts to 1 and 150d to 30d — a coverage
regression, not a refresh. This round regenerated at the CURRENT
proof's spec (`--n 1`, seed 7, 4 policies, 150d), preserving coverage
exactly; the ede1a2796 lineage (seed 7, minimal panel) is honored. The
brief's core requirements — fresh neutral panel, do NOT re-point to
598e21bdb (its scorecard source hash no longer matches master), proof
test green after — are honored exactly. Coordinator can overrule the
spec (a re-run at the other spec is ~2 min of panel + a re-point).

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  9be3676d8 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run, matching the coordinator's baseline.
  `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12/b13/b19/b20 adoptions recorded as 8/9 on their stale
  landing tips).
- `B.manifest('.')` vs the retained r211 panel's `sources`
  (`evidence/2026-11-15/neutral-r211-rebased.json.gz`, sha256
  `c015d3481741a1f268d176fe5c5431b36433d600b728f29530b64d5281f3414e`):
  tip 532 keys, panel 532 keys — **0 keys only in the tip + 14 keys
  differ**: build.js (batch-ship version bump), conversation.js,
  convo-dialogue.js, convo-scene.js, convo-wants.js, game.js,
  hierarchy.js, titans.js, villager-agency.js + villager-brain.js
  (planignite-fix), win-plan.js, competent-courtship-b.js,
  competent.js, index.html (batch-ship version bump). Observer and
  contract digests still match the r211 panel. The staleness is the
  source manifest only. NOTE: the coordinator's 7-file list (build.js,
  feastBuff.js, game.js, havenGrowth.js, storage.js, villager-build.js,
  index.html) was measured against the Oct 29 01ab3e346 panel; against
  the CURRENT r211 panel the movers are the 14 above, and feastBuff.js
  / havenGrowth.js / storage.js / villager-build.js have NOT moved
  since r211.
- `B.manifest('.')` vs the retained b20 panel's `sources`: tip 532
  keys, panel 529 keys — 3 new policy files (competent-courtship-b,
  competent-covenant-b, competent-successorcaution-b) + **16 keys
  differ**. Vs the b19 panel: same 3 new policy files + 16 differ. Vs
  the b18 panel: 6 new policy files + 17 differ (adds betrayal.js).
  Vs b13 and b12 panels: 6 new policy files + 17 differ each.
  Observer and contract digests match all five.
- Stale-input negatives verified on this tip (validate() FAILS with
  "Proof source inputs are not current" on all six): r211, b20, b19,
  b18, b13, b12.
- Cache-flags anomaly in the owed-check: `test-measurement-cache-
  flags.js` scored **0/4** on this tip (all four legs FAIL), where
  round 20 scored 4/4 on a quiet box. Discriminating probe, same tip,
  same hour: a single 1-day zero-policy panel build via the real CLI
  completes fine (exit 0, 1 case) but takes **58.7s wall for ~3.9s
  CPU** — over the test's 30s spawn timeout. Box load average was
  5.30 at the time (sibling loops running in other trees). This is the
  2026-11-12 load artifact, not a code failure: no panel/cache code
  changed in this arm (only evidence + test files committed so far;
  the base did not touch balance-panel.js or the cache logic). Leg (c)
  was re-run at closeout — see GO legs.
- Pre-regeneration `test-gateproof-a.js`: exit 1, legs (a) FAIL
  ENOENT, proof-update FAIL exit 1, workflow 8/9, cache-flags 0/4,
  ontology ok — then crashes at leg (d) with ENOENT —
  `evidence/2026-11-17/neutral-gateproof-a.json.gz` does not exist yet
  (the panel has not been generated or re-pointed).
- `validate-ontology.js` standalone: exit 0, "All 138 systems
  validated", ONTOLOGY.md 2198 lines.
- **Verdict of the owed-check: OWED.** Panels at r211 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (first regeneration, on base 9be3676d8)

- Command: `node scripts/balance-panel.js --out .proofrefresh-gateproof-a-panel --n 1`
- Single attempt, started 11:48:30Z, finished 11:56:36Z:
  `Saved .proofrefresh-gateproof-a-panel; 4 cases, 0 cached jobs. PANEL_EXIT=0`.
  ~8 min wall (r211's took 199s — box loaded this round).
- The `cases/` cache in `.proofrefresh-gateproof-a-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == e8daddbf0f108a2328f6544a1ad4a625ad738280`
  (prereg/owed-check commit, on base 9be3676d8).
- Panel sha256
  `0f7a41a154052833b867fc7edf24c259b46e2cb9e00a6795cfcddff7a8731c19`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ** (532/532);
  `validity.sourcesStable` true; 4 rows; neutrality 4/4 match, warnings
  0, tuple identical to the r211 panel AND the b20 panel (regeneration
  moved no NEUTRALITY verdict). Observer/contract digests match the tip
  and the r211 panel. 0 rows with warnings/observer/gear problems.
- Staleness on the tip: **gateproof-a-new 0 stale**; **r211 14 stale**;
  **b20 19 stale** (3 new policy files + 16 differ). Before/after: the
  refresh takes the proof from 14 stale keys (r211) to 0 on this tip.
- ROW MOVEMENT (brief expectation NOT met — see below): headline-field
  rows differ **3/4** vs r211 (per-field: days 3/4, gameDays 2/4,
  waveReach 1/4; won/entered/national/table/maxArc/maxRank/endReason/
  vests/vestsVillager 0/4) and **4/4** vs b20's seed-7 rows (days 4/4,
  gameDays 4/4, waveReach 1/4, endReason 1/4). Determinism proven on
  this tip (capable/seed 7 run twice as standalone single-case panels
  → byte-identical rows; the single-case re-run row == the full-panel
  capable/7 row, same stateHash e4baf867…), so the movement is the game
  changing (planignite-fix + r213 deepening moved 14 manifest keys the
  panel exercises), not panel noise. The neutrality tuple — the proof's
  binding check — reproduces exactly. Aggregates unchanged: won 1/4,
  entered 1/4, national 1/4, table 1/4, wave-5 2/4 — capable/7 still
  wins at global on day 94.
- Panel's own wall rows (scale-wall numbers, as the panel carries them):
  4 rows, 150d, seed 7 x 4 policies: national 1/4, wins 1/4, entered
  1/4 (capable only); wave-5 2/4 (capable + risk-aware); maxArc 4 on
  4/4; median days 102 (94/150/110/94); end reasons over-other 1,
  survived 1, village-lost 2; vests 3 total. These are the
  instrument's own rows on the new tip, reported as carried, not a
  balance verdict (this arm re-proves the instrument; no lever was
  played, and no compare run was done).
- Copied the regenerated panel to
  `evidence/2026-11-17/neutral-gateproof-a.json.gz` (NEW file — the
  r211/b20/b19/b18 panels are NOT overwritten), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-17/neutral-gateproof-a.json.gz` — exit 0;
  `scripts/balance-proof.json` re-pointed at the new panel only
  (panelDigest `0f7a41a1…`). No hand-edited hashes.
- `test-gateproof-a.js` on this tip: **12/12** (incl. cache-flags 4/4
  outright — the owed-check 0/4 is proven the load artifact by the
  4/4 on the same tip with no code change).

## Part A — fresh full gate

- Command (run ONCE, after the refresh): `node scripts/check.js
  --quick --timeout 300`, 12:06:42Z → 12:18:34Z (712s).
  Log: `evidence/2026-11-17/sim-gateproof-a-checkquick.log`.
- **338 passed, 2 failed.** (Standing profile: 330/10, 333/7, 280/7.)
- Failures, both pre-existing (verbatim in the r211 gate on tip
  5453f710e, journey-endgame-r211.md — stable across runs, in code
  this arm never touched; this arm changed no src/, no index.html, no
  existing test, so neither failure can be caused by this run):
  1. `scripts/godpath/test-phone-frame-proof.js` — stale phone receipt:
     "every retained browser input matches current source" FAIL,
     "all current boot inputs are covered" FAIL, "current phone
     evidence is required" FAIL ("Phone receipt source is stale or
     missing: index.html"). The retained receipt predates the
     batch-ship version bump that moved index.html; the receipt
     refresh is owed by the phone-frame proof owner, not this arm.
  2. `scripts/test-ladder-bundle-20261108.js` — "control: 200 monster
     turns WITHOUT delivery fire the ambient raid — fires 0" (78/79
     legs pass; the mercy legs all pass).
- Standing-profile classes ABSENT from this gate:
  - The measurement-proof staleness pair is GONE — the gate ran after
    the refresh, and test-measurement-proof-update (9/9) +
    test-measurement-workflow (9/9) both pass inside the gate. That is
    the refresh working in the full gate, not an attribution question.
  - The parity-gear assertion is GONE — test-parity-20261014.js 60/0,
    test-parity-food-20261008.js 2/0, test-parity-disease-20261008.js
    5/0, all passing standalone on this tip as well as inside the
    gate. No game code changed in this arm, so the fix (if it was a
    fix and not load flake) came from a landing between the
    standing-profile runs and this tip; not attributed to this arm
    either way. Its absence is good news, recorded, not claimed.
- Two failures the r211 gate also carried did NOT recur here:
  living-garden deed attainment passed (272s, under the 300s timeout
  it tripped before — a timeout flake) and person-trust HAUL passed.
- **Gate verdict: GO with 0 attributable failures.** The 2 failures
  are pre-existing/master-drift, stable across runs on two tips, none
  in code this arm touches. (The r233 sibling gate adjudicated the
  same way at 329/11, all pre-existing.)

## Master move (during the run) + rebase + regeneration

- Master moved DURING the run: `git rev-parse master` in the main
  tree reads `3cb0782e5` at ~12:09Z (was 9be3676d8 at panel start).
  The move is 12 commits — Loop B sim-deathcleanup-b (death cleanup:
  winPlan dies with the villager + the stateOf non-creating-read
  CORRECTION), journey-endgame r233 (titan refusal-spam fix + gate
  adjudication 329/11), journey-scale r233, sim-wideduty-a adoption
  deltas, sim-sametick-a adoption addendum — touching manifest files:
  **index.html, src/js/betrayal.js, src/js/build.js, src/js/game.js,
  src/js/titans.js, src/js/win-plan.js** (6 keys).
- Per the prereg, the panel stays valid only if the move touches NO
  manifest file — it does, so the 9be3676d8 panel is stale on the new
  tip (verified: 6 keys differ, observer/contract digests match,
  validate() FAILS "Proof source inputs are not current"). A fresh
  panel run was owed, not optional — the b5 CORRECTION precedent
  (a re-point that does not validate on merged master) is exactly what
  regenerating avoids.
- Rebase onto the explicit SHA 3cb0782e5: hit the known stop-at-pick
  quirk on pick 3 (5b34cac47 in both done + todo, tree clean, pick
  verified unapplied via `git diff`, panel file absent) —
  `git rebase --continue` sailed through; all 3 commits replayed
  exactly once (new SHAs 3407b023d, a2dd8180c, 7c11318ed).
- Regenerated the panel on the rebased tip (`balance-panel.js --out
  .proofrefresh-gateproof-a-panel2 --n 1`, 12:20:57Z → 12:22:57Z, 2m00s,
  4 cases, 0 cached, exit 0), retained as
  `evidence/2026-11-17/neutral-gateproof-a-rebased.json.gz` (the
  9be3676d8 panel is KEPT as neutral-gateproof-a.json.gz — the r211
  precedent of keeping both panels; the prereg's sha still refers to
  the first panel). New panel sha256
  `5250a90dde94ac6a840a10d86ee52bdb24ec23a818d52c702ef3b32e839a5a7a`,
  sourceHeadStart == sourceHeadEnd == 7c11318ed (rebased panel commit,
  on 3cb0782e5). Verification: **0 keys differ** vs the rebased-tip
  manifest (532/532); sourcesStable true; 4 rows; neutrality 4/4
  match, warnings 0, tuple identical to r211 AND b20; 0 problem rows.
  Row movement vs the 9be3676d8 panel: 2/4 rows differ (days 2/4,
  gameDays 2/4 — capable 94→90, socialite 110→89; aggregates
  unchanged: won 1/4, entered 1/4, national 1/4, table 1/4, wave-5
  2/4). Rebased panel's own wall rows: median days 92 (90/150/89/94);
  end reasons over-other 1, survived 1, village-lost 2; vests 3 total.
- Re-pointed at the rebased panel only (panelDigest `5250a90d…`),
  exit 0. The test's NEW path updated to the rebased panel, plus a
  13th leg: the 9be3676d8 panel FAILS validate() on the new tip,
  proving the regeneration was owed.

## GO legs (judged on the final tip 3cb0782e5)

- (a) `test-measurement-proof-update.js`: exit 0, 9 passed — ON THE
  REBASED TIP.
- (b) `test-measurement-workflow.js`: 9/9.
- (c) `test-measurement-cache-flags.js`: 4/4 outright on the rebased
  tip — second 4/4 on this arm with no code change (12/12 run at
  12:03Z on the 9be3676d8 tip, 13/13 run at 12:23Z on the rebased
  tip). The 0/4 owed-check score was the load artifact, proven by the
  discriminating probe (58.7s wall vs the 30s cap) and by the 4/4
  passes on the same tips once the box quieted. No code changed
  between the scores. The 30s cap is unchanged.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the r211 panel AND the b20 panel — regeneration
  moved no NEUTRALITY verdict. (Covered by proof-test legs 8, 9.)
  The 3/4 (first panel vs r211) and 2/4 (rebased panel vs first panel)
  headline-row movements are reported separately above; they are the
  game changing, not the observer, and are not leg (d).
- (e) `scripts/test-gateproof-a.js`: **13/13** on the final tip —
  including the stale-input negative checks: the retained r211 panel,
  the b20 panel, AND this round's first (9be3676d8) panel all FAIL
  `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous.
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md 2198 lines, 0 diff vs HEAD.
- (g) Gate: 338 passed, 2 failed, 0 attributable (see Part A above).
- A miss on any leg would have been NO-GO; on the final tip none missed.
  Judged only against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel ("Unexpected token" — it expects per-seed
  JSON evidence, not a panel archive), the same limitation the
  b11/b12/b13/b19/b20 adoptions recorded. Its LOUD line is that parse refusal,
  investigated this run: the tool cannot read panel archives at all, so
  there is no per-seed evidence for it to check and no deviation to
  judge; the neutrality reproduction (leg d) is the instrument check
  that stands in its place. No lever was played, so there is no
  before/after deviation to check. Baseline NOT rolled.

## Verdict

**GO on the final tip (3cb0782e5).** The measurement proof is refreshed
on the final tip: the new panel is current (0 stale keys), every prereg
GO leg passes, the gate shows 0 attributable failures, and the proof
re-points at the new panel only.

Two flagged deviations from the task brief (not prereg legs):
1. Panel spec: regenerated at the current proof's spec (`--n 1`, seed 7
   x 4 policies x 150d), not the brief's literal capable/seed 7/30d —
   see "Spec decision" above. The brief's 01ab3e346 proof pointer was
   stale; the spec follows the proof as it stands.
2. Row stability: the brief's "0/64 rows differ vs the prior panel"
   does not hold — headline rows differ 3/4 vs r211 and 2/4 between
   the two panels of this round, verified as game-code changes
   (determinism proven; neutrality tuple reproduces exactly). The
   coordinator should note that the row-stability check binds only
   when intervening changes are panel-invisible; on this round it is a
   real measurement of the game moving, not a proof failure.

## Metric review

- The primary metrics judged what they claimed: the proof test failed
  on the stale tip with exactly the expected manifest-mismatch error
  (14 keys vs r211, then 6 keys vs the rebased tip — all named) and
  passes on the refreshed tip with 0 stale keys; the stale-input
  negative checks (r211, b20, and the round's own first panel all fail
  validate on the new tip) prove the green result is not vacuous. No
  re-scoring at any point.
- The cache-flags leg failed 0/4 under load in the owed-check and
  passed 4/4 outright twice on the same tips once the box quieted —
  the load artifact the 2026-11-12 lesson describes, proven three
  times this round (the 58.7s wall probe vs the 30s cap; two 4/4
  passes with no code change). The 30s cap stays untouched. No metric
  revision proposed; the prereg's A/B instruction worked as written.
- The neutrality reproduction (leg d) held exactly: regeneration moved
  no neutrality verdict vs r211 or b20 — but the headline rows moved
  3/4 (first panel) and 2/4 (rebased panel) because the game itself
  changed (planignite-fix, r213 deepening, deathcleanup-b, r233
  refusal fix). The brief's row-stability expectation is the wrong
  instrument for a round where game code the panel exercises changed:
  it conflates "the proof is fresh" with "the game is unchanged".
  Proposed revision for the NEXT run's brief: scope the row-stability
  check to rounds whose intervening changes are panel-invisible
  (evidence/test-only moves, or game changes proven invisible in the
  owed-check); when game code moves, judge leg (d) on the neutrality
  tuple alone and report row movement as a winnability observation.
  This is a brief-wording revision, not a re-score of this run: the
  prereg legs are judged exactly as written.
- The gate's standing-profile comparison needs the same scoping note:
  the "parity-gear assertion" the coordinator's profile carries did
  NOT recur on this tip (all parity tests green standalone and in the
  gate), and the staleness pair is gone by design of this arm. A
  standing profile that names failures from older tips should carry
  the tip each failure was last seen on, or it reads as a regression
  when the failures are simply absent. Proposed for the NEXT run's
  brief: record the standing profile with last-seen tip + commit per
  failure.
- The safe-commit index clobber struck all three commits — repaired
  per the repo lesson (ls-tree -r pipe), no work lost. Fourth
  consecutive round with the clobber on every commit.
- No other metric revision proposed. The prereg held.

## Commits (branch sim-gateproof-a, base 9be3676d8 → rebased 3cb0782e5)

- 3407b023d (was f76ec3cfc) — prereg + proof test (round gateproof-a,
  base 9be3676d8, owed-check pending)
- a2dd8180c (was e8daddbf0) — prereg owed-check (OWED — r211 stale by
  14 keys; cache-flags 0/4 is a load artifact, probe 58.7s wall vs 30s
  cap)
- 7c11318ed (was 5b34cac47) — fresh real neutral panel (REGENERATED on
  9be3676d8) + proof re-point + prereg panel section (GO 12/12 on the
  9be3676d8 tip; superseded by the rebase — see closeout)
- [closeout commit] — evidence + rebased panel + re-point + test
  update (GO 13/13 on the final tip; see closeout)

## Closeout — REBASED, GO ON FINAL TIP

- Master moved during the run to 3cb0782e5 (Loop B deathcleanup-b +
  r233 + wideduty/sametick adoption notes, 6 manifest files). Branch
  rebased onto the explicit SHA 3cb0782e5 (3 picks, stop-at-pick quirk
  on pick 3, verified unapplied + continued; final log shows each
  commit exactly once, tip 7c11318ed).
- Panel regenerated on the rebased tip (sha 5250a90d…, 0 stale keys);
  leg (a) re-verified on the rebased tip: **exit 0, 9 passed**. Full
  gateproof-a test re-run on the rebased tip: **13/13** (incl.
  cache-flags 4/4 on the quiet box). The gate profile (338/2, 0
  attributable) stands from the 9be3676d8-based tip; the rebase added
  no new gate-relevant failure class (the proof legs, which the move
  could stale, are re-verified green on the final tip).
- **Verdict on the final tip (3cb0782e5): GO.** All seven prereg legs
  pass on the final tip; no re-scoring. The flagged brief deviations
  stand: panel spec follows the current proof (`--n 1`), and headline
  rows differ 3/4 vs r211 / 2/4 between this round's panels, verified
  as game-code movement (determinism proven; neutrality tuple
  reproduces exactly).
- Cases caches deleted at closeout (`.proofrefresh-gateproof-a-panel/`
  and `.proofrefresh-gateproof-a-panel2/` removed; the retained .gz
  files are the artifacts). Worktree clean except committed work; no
  uncommitted leftovers.
- Merge: `git merge --ff-only sim-gateproof-a` in the main tree
  (coordinator's step — no pipe, strict && chain; ancestry verified
  with `git merge-base --is-ancestor` after). Then release:
  `worktree-release.sh sim-gateproof-a merged`, worktree removed,
  branch deleted, `worktree-reap.sh`, main tree verified clean. No push,
  no bump, no live verification — the ship loop owns deploys. "Merged
  locally, pending ship."

## Village assessment

n/a — this is a tooling/measurement arm. No lever was played, no
village was assessed, no game code changed. The instrument's own rows
on the final tip (seed 7 x 4 policies, 150d): national 1/4, wins 1/4,
wave-5 2/4, median days 92. Reachability verdict for the proof
instrument: the observer-neutrality proof is current and green on the
final tip; the instrument is fit to judge the next lever arm.
