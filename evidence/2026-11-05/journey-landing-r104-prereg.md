# journey-landing r104 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261105T082647Z (scheduled 01:45 CST 2026-11-05).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@5a1d280a0 at run start (`git pull` already up to date; main tree clean, disk 33%).
**Numbering note:** the Lane A counter is global across legs; r103 (deepening) was last, so this run is r104.
Driver: scripts/journey-landing-r104-20261105.js (r100 driver verbatim except seeds 867–876, OUTDIR landing-r104, header, and the R104 WINPLAN instrument below — zero policy change).
Analyzer: scripts/analyze-landing-r104-20261105.js (r94 analyzer verbatim + R104 WINPLAN block).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv).
Shape test: scripts/test-landing-r94-shape.js (unchanged) + pilot validation of the new instrument (see below).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate change in this run. **Perception law (2026-10-28) stands** — all instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is proven in game code (not driver policy) with a before/after proof test; otherwise document and move on. This run carries NO planned code change.

## Registration note (infrastructure, not game)
`worktree-register.sh journey-landing` attempt 1 hung inside `git worktree add` — the checkout's `git reset --hard` ran 4+ minutes at high CPU under a loaded box (siblings: two reaper flock-waits, main-session sim-bankadded-a release, Lane B journey2-social tests). Not the EPERM flap (writes work; the lock file and rotation write landed fine). Registration is awaited, not forced; the prereg is recorded HERE (goal hidden_files evidence, alongside the panel OUTDIR) BEFORE any seed ran, and will be committed verbatim into repo evidence/ once registration succeeds. No file in the main tree was edited, committed, or written by this run.

## Q1 (PRIMARY) — WIN-PLAN UPTAKE IN THE FIRST FORTNIGHT
**Why this run, why now:** the win-intel goals system (0e6cbeb8e, landed Nov 3) gives villagers lasting win-plans that nudge dawn choices; its proof was fixture-based (8/8 scenario fixtures) plus longer-horizon panels. The landing window (days 1–14) is UNMEASURED for plan uptake — and the winnability chain starts early, so if no plan seeds before day 14 the lever cannot move the early funnel. The r102 stale-goal-line reset (c498e05ff, Nov 5 01:10, fixture-proven in the deepening window) is also in base for the first time on a landing panel.
**Instrument (R104 WINPLAN, driver-only, zero src/js):** at each day's snapshot the driver copies `Game.state.village.winPlanStats` (read-only; the `winPlanOf` accessor is NEVER called — it seeds plans on read, which would corrupt the measurement; plan-holders are counted from the raw `state.village.winPlan` map only). A day-14 snapshot is taken when the 14th series snap lands; the day-28 totals fold at census time into a top-level `winPlan` field: `{d14:{stats, holders, stages}, d28:{stats, holders, stages}}`. Holders list stage + sinceDay per plan-holder (names, no roster scan — the map itself is the population).
**Pre-registered metrics (binding):**
- M-W1 planSeeds at d14: interesting if ≥1 per seed on average (≥10 across the panel); 0 across the panel = GOAL-SILENT (goals do not bite in the landing window — a real finding, reported as such, not re-scored).
- M-W2 stageAdvances / partyInvites / partyDepartures / gearHolds / bondTends at d14 and d28: reported as counts; any party departure or bond tend in-window is named with seed/day.
- M-W3 plan-holders at d14: count + stages; 0 holders at d14 across the panel = GOAL-SILENT (same verdict as M-W1).
- A miss on M-W1 is NO-GO, never re-scored against a friendlier metric mid-run (metric review below if the metric proves wrong).

## Q2 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION
r99 proved the branch at panel scale (2 needy+live-outing steps ate 0→2400). Carried as a regression check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E scholar starvation deaths; 0 triggered steps ending enterResult===false).

## Q3 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now fifteen runs deep). Record wild outing iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r99 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW). The people check also reads departure lines for stale goalLines (r102 class) — qualitative; the fix itself is fixture-proven.
- **M7 GUARD v3:** kcal PASS / water UNTESTED (as r99).

## Seeds, pilot, shape
- Panel: fresh seeds 867–876, DAYS=28, OUTDIR landing-r104 (goal hidden_files evidence/2026-11-05/landing-r104).
- PILOT FIRST: 3 seeds (867–869) before expanding. If Q1 shows nothing interesting in the pilot (0 planSeeds AND 0 holders at d14 on all three), document and still run the panel only if the carried bindings need the panel — the pilot decides; do not burn a full run on a dead question.
- Shape: the pilot validates the new instrument (winPlan field present, d14 snapshot taken, holders counted from the raw map, no plan seeded by the instrument itself — verified by comparing planSeeds before/after the instrument's reads on a replay seed).

## Metric review (filled at closeout, never mid-run)
- (to be filled)

## Addendum (written before any seed ran)
Registration SUCCEEDED on attempt 1 (the `git worktree add` checkout's `git reset --hard` took ~5 min under a loaded box; not a flap — plain writes worked throughout). Worktree `journey-landing` at master@5a1d280a0 verified by `pwd` + `git rev-parse HEAD`; registry heartbeat 08:28:33Z verified by read-back. The panel therefore runs in the proper worktree — NOT from any snapshot. This prereg, including this addendum, is committed verbatim into repo evidence/ before the pilot seed runs. Nothing about the questions, metrics, seeds, or horizon changed between the original record and this addendum.
