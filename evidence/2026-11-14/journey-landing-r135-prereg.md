# journey-landing r135 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-20261115T051930Z (scheduled Sat 2026-11-14 22:45 CST).
**Base:** local master at run start (version-bump 542c6ecc2 after pull).
**Rotation:** read 0 → wrote 0→1 at run start (read back: 1). Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing-r135` (branch `journey-landing-r135`).
Slug follows the r134 precedent: the canonical `journey-landing` slug is blocked
by the held r129 branch (registry entry tree-removed-branch-kept, 2 commits ahead
of master); the stale entry was released as `abandoned` (branch kept) and this
run registers under a fresh slug.

## Q1 (PRIMARY) — r129 FORAGE probe: name the lost errand, then land or hold

The r129 terrain-pocket fix (59ad7c479: `findWalkableEntry` main-region +
stacked-spawn; D1 label in convo-scene.js) is proven GO on its own metrics
(r129 note) but its merge is blocked by one gate failure:
`test-person-trust-20261108.js` — non-aimed errands FORAGE 1 vs baseline 2
(±25% bar on a count of 2; pristine control passes 2, fixed code
deterministically 1). The r129 adoption note says the merge needs a decision:
re-baseline, investigate the one lost forage errand, or a Steve call.
r132/r134 carry the owed item: "which errand Chantal picks on day 28 on fixed
code" (`~/workspace/scratch-fixed/` stale — rebuild the probe fresh).

**Probe:** a driver wrapping `Game.objPick` (same hook as
`person-trust-panel-20261108.js`) logging every objective pick with
day + villager + kind, run on (a) current master and (b) master + r129 fix
(cherry-picked into the worktree for the probe; the landing itself, if any,
goes through the original `journey-landing` branch rebased onto master).
Seed 84101, 30 days, competent policy — the panel the bar is pinned to.

**Bar (binds):** the probe names the lost errand — villager, day, what they
pick instead on fixed code, and the mechanism (where they are / what the
movement change did to their path). Then:
- If the mechanism is benign divergence (the fix moved the villager out of a
  pocket-adjacent path and the errand flipped to another kind with no forage
  site unreachable, no villager worse off): re-baseline FORAGE 2→1 in the
  test with a comment citing the mechanism + this prereg, re-run the
  person-trust test + r129 proof tests, run the gate, and land the r129
  branch (rebase onto current master, ff-only merge). Repo rule (AGENTS.md):
  a test that breaks because the design changed on purpose is updated in
  the same commit, with the reason stated — that is a re-baseline, not a
  waiver. The gate must be otherwise GO.
- If the mechanism is a real side effect (a forage site now unreachable, a
  villager stranded or looping, food/errand harm): fix the side effect in
  the branch, or hold the branch with the evidence written here. No merge
  over a real regression.

**Metric review note:** the ±25% bar on a baseline count of 2 means a single
errand flip fails the test. That brittleness is recorded here, not re-scored:
the bar binds as written for this run; any bar-shape change is proposed for
the NEXT run, not applied mid-run.

## Q2 — Fresh landing panel (regression watch)

Driver: the r132/r134 driver verbatim (seeds 1142–1151, DAYS=28), run AFTER
any r129 landing (so the panel reads the fixed code) — or on master if r129
holds. Corpus `landing-r135-after/` in goal hidden_files.

**Bars (bind, judged against r132/r134):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
- D1 watch (document only): count garbled-label renders; expect 0 if r129
  landed, >0 carried if it holds. NOT a gate — the fix status decides it.
- HEED watch: WARNED-BUT-UNRESOLVED count vs r134 (0); the Dauletkhan
  1150-d6 filler-loop shape is a known carried item — report, don't re-score.

## Q3 — People check (M5, sense-read)

Read 5 full transcripts from the Q2 panel. Bar: each sitting shows the NPC
wanting something, options engaging or deflecting it, endings resolving /
planting / owing. No fabricated shared history, no filler loops, no static
menus. The 1144-d5 curious/dreams resume WATCH (acknowledges without
re-asking) needs a second sample: report whether it recurs.

## Q4 — Telemetry

`telemetry-check.js` on the Q2 panel vs `telemetry-baselines/landing-split.json`
(re-seeded r131). LOUD lines are same-run investigation items. Baseline is
NOT rolled unless the panel carries new information (r134 precedent: byte-
identical panel → no roll).

## Policies / seeds

- Trust panel: seed 84101, 30d, `scripts/policies/competent`.
- Landing panel: seeds 1142–1151, 28d, r132/r134 driver.
- No threshold, bar, price, or gate changes in this run except the Q1
  re-baseline if the probe proves benign divergence (same-commit test update
  with stated reason, per repo rule).
