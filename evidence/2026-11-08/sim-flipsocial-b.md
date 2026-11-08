# sim-flipsocial-b — the socialite / winseek panel columns on the flip (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261108T1930Z, axis
scale-onramp / winnability chain (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-flipsocial-b, branch sim-flipsocial-b.
**Verdict: NO-GO on both policy columns — the flip does not reproduce under
the balanced panel on either owed column.** Sits 0/8 on both legs of both
columns, median survival falls on the healed leg on both columns (80.0d →
73.5d socialite, 81.0d → 70.5d winseek), and the village-deaths rate
carries a regression_watch on both columns. No confirm band spent (this is
a measurement arm; 53801–53812 stays fresh). No game-code change — this arm
is DIAG only, zero src/js.

**Adoption note (coordinator, run fleshout-loop-b-20261108T2230Z): the 1930Z
run died by cron timeout before closeout. Its worker wrote the prereg
(committed 7572b6364), built both panels, and wrote the compare
(21:43:46Z) — then died before writing this evidence file or the proof
test. This file and scripts/test-flipsocial-b.js were written by the
adopting coordinator from the prereg + the worker's committed panel
artifacts, and every number below was verified independently by the
coordinator against those corpora (panel rows re-read, medians recomputed,
compare re-run through lib/balance-scorecard.js, extraction hashes
re-checked). Nothing below is taken on a worker report — no worker report
exists.**

Substrate: branch cut at master `6680d7924` (worktree tip `1ee592573`, the
sim-flippanel-b commit). Endpoints extracted read-only with `git archive`
into scratch (deleted before commit); the worktree tip's `scripts/` tree
overlaid onto both extractions (frozen-controller overlay, MEASUREMENT.md
§15). Policies: socialite + winseek. Seeds: 53001–53008, FROZEN. Horizon:
150d, death-aware.

Full pre-registration (binding): evidence/2026-11-08/sim-flipsocial-b-prereg.md.

## The question

Do the two remaining §15 balanced-panel policy columns (`socialite`,
`winseek`) confirm the flip between the collapsed tip `cf22937b8` and the
healed tip `c9fea16ee` on the frozen band 53001–53008? The flippanel run
(evidence/2026-11-08/sim-flippanel-b.md) ran only `capable` +
`risk-aware` and returned NO-GO (capable flip absent, risk-aware death
guardrails). This arm adds the two owed columns with the identical method,
endpoints, seeds, and horizon — no new extraction route, no re-scored bar.

## Endpoints (verified by the adopting coordinator, not taken on trust)

- **BEFORE (collapsed):** `cf22937b8` — healerbisect collapsed control:
  median **70.5d**, sits **0/8** (full-8, doorwalk baseline leg).
- **AFTER (healed):** `c9fea16ee` — healerbisect healed control: median
  **145d**, sits **4/8** (full-8, doorwalk baseline leg).
- Extraction check: `src/js/game.js` hash of the extracted before tree
  `59a76b12…` == `cf22937b8` blob; extracted after `380661ca…` ==
  `c9fea16ee` blob. Policies (`socialite`, `winseek`) and
  `scripts/sim-harness.js` / `scripts/balance-panel.js` are byte-identical
  across both endpoints (0-line diffs), so the overlay cannot change any
  row-producing code. Both panels' `observerDigest`,
  `contractDigest`, and `registrationDigest` agree exactly (see Proof).

## Results

### Socialite — 8 paired cases, decision review_required

| | Collapsed (before) | Healed (after) |
|---|---|---|
| Table sitting rate (`table` metric, ruling 665) | 0/8 | 0/8 |
| Table entry rate | 0/8 | 0/8 |
| Table win rate | 0/8 | 0/8 |
| National scale access | 0/8 | 0/8 |
| Median survival (gameDays) | 80.0d | 73.5d |
| gameDays | 48, 59, 76, 76, 84, 86, 109, 126 | 38, 48, 61, 68, 79, 87, 91, 100 |
| Wave reach | 4, 4, 4, 4, 4, 4, 4, 5 | 4, 4, 4, 4, 4, 4, 4, 5 |
| Player deaths / run | 9.125 | 6.375 |
| Player deaths / 100d | 10.83 | 7.62 |
| Village deaths / run | 56.375 | 50.25 |
| Village deaths / 100d | 71.27 | 73.96 (regression_watch) |
| Community loss | 1 | 1 |

GO bar (b) sits ≥ holds only as equality (0 = 0). GO bar (c) median ≥
**misses** (73.5 < 80.0). GO bar (d) **misses**: `villageDeaths100Days`
carries a regression_watch. Flip-signature check **misses** on both
halves: sits delta 0 (needs ≥ +2/8), median delta −6.5d (needs ≥ +30d);
healed median 73.5d is outside the 115–150d sanity band, healed sits 0/8
outside 2–6/8. Other watches (not death guardrails): player named-class
access 0.375 → 0.25, earned player tier-3+ weapon/armor 1 → 0.875,
contest/show gear 1 → 0.75 — all regression_watch. No regression_signal
anywhere on this column.

### Winseek — 8 paired cases, decision review_required

| | Collapsed (before) | Healed (after) |
|---|---|---|
| Table sitting rate (`table` metric, ruling 665) | 0/8 | 0/8 |
| Table entry rate | 0/8 | 0/8 |
| Table win rate | 0/8 | 0/8 |
| National scale access | 0/8 | 0/8 |
| Median survival (gameDays) | 81.0d | 70.5d |
| gameDays | 34, 48, 61, 79, 83, 84, 109, 111 | 47, 47, 58, 65, 76, 77, 78, 80 |
| Wave reach | 3, 4, 4, 4, 4, 4, 4, 4 | 3, 3, 4, 4, 4, 4, 4, 4 |
| Player deaths / run | 7.375 | 6.375 |
| Player deaths / 100d | 9.56 | 9.39 |
| Village deaths / run | 63.625 | 62.75 |
| Village deaths / 100d | 93.65 | 94.99 (regression_watch) |
| Community loss | 1 | 1 |

GO bar (b) sits ≥ holds only as equality (0 = 0). GO bar (c) median ≥
**misses** (70.5 < 81.0). GO bar (d) **misses**: `villageDeaths100Days`
carries a regression_watch. Flip-signature check **misses** on both
halves: sits delta 0 (needs ≥ +2/8), median delta −10.5d (needs ≥ +30d);
healed median 70.5d is outside the 115–150d sanity band, healed sits 0/8
outside 2–6/8. Other watches: player named-class access 0.625 → 0.5,
earned player tier-3+ weapon/armor 1 → 0.875, contest/show gear 0.875 →
0.75, first bearer <redacted> through day 60: 0.125 → 0 — all
regression_watch. No regression_signal anywhere on this column.

### The reached-but-never-sat gap (winseek)

The raw harness flag `row.table` reads **7/8 collapsed → 5/8 healed** on
winseek while the panel `table` metric reads 0/8 on both legs. This is not
an instrument error: ruling 665 defines the panel `table` metric as
sittings (`row.entered`), and `row.entered` is 0 on every winseek row.
The villages **reach the table and never sit** under winseek play on
either endpoint. It is the same shape as the `finalSeat` vs
`takeseatStats` gap the fight-judgment arms keep tripping over (a lesser
seat priced for a village that never took it) — here at panel scale, on
both endpoints, so it is a property of the policies, not of the flip.
Filed as a finding (see below).

## Verdict

**NO-GO** — GO bars (c) and (d) miss on both policy columns, and the
flip-signature check misses on both halves on both columns. Each policy
column gets its own NO-GO; the arm verdict is NO-GO. Per §14, never
re-scored against a friendlier metric mid-run.

Kill classification (§14a): **the flip does not reproduce under the
balanced panel on any of its four columns.** Capable + risk-aware were
NO-GO in flippanel; socialite + winseek are NO-GO here. The flip stands
as a doorwalk result only (competent-doorwalk policy, TAKESEAT leg: median
70.5d → 145d, sits 0/8 → 4/8 on the same frozen band). This is a
measurement verdict, not a game-code kill: nothing is landed, nothing is
reverted, and the doorwalk flip is not overturned — it is bounded. The
fourth column is now closed; the panel-contract lane owes nothing further
on the flip-point before/after.

## Metric review

- The primary metric (per-policy sits + median survival) discriminated
  cleanly: both columns miss on median and on the death rate, so the
  verdict does not hinge on any single bar. Even under the strictest
  literal reading of bar (d) — count metrics only, ignoring the 100d
  rates — bar (c) alone decides both columns NO-GO. The test records
  both readings separately so a future reader can see the verdict does
  not depend on the family reading.
- Bar (b) as written (healed sits ≥ collapsed) holds only as 0 = 0 on
  both columns. That equality is not a confirmation of anything: the
  flip-signature check (sits delta ≥ +2/8) is what asks whether the flip
  is present, and it answers no on both columns. A future prereg for a
  zero-baseline column should bar on the delta, not on ≥.
- The death picture splits by count vs rate on both columns: death
  counts improve on the healed leg (village 56.4 → 50.3 socialite, 63.6
  → 62.8 winseek; player 9.1 → 6.4, 7.4 → 6.4) while the per-100-day
  rate worsens (71.3 → 74.0, 93.6 → 95.0). The villages die at about
  the same pace but live fewer days, so the rate rises. That is what
  the regression_watch is measuring, and it is the honest guardrail
  read: the healed code does not buy survival under these policies.
- The instruments disagree, as the prereg's metric-review note
  anticipated: the doorwalk instrument sees villages that sit (4/8
  healed), the panel instrument sees villages that reach the table and
  never sit (winseek row.table 7/8 → 5/8, entered 0/8). The panel
  policies (socialite, winseek) do not take seats; the doorwalk policy
  does. The flip is a property of a seat-taking playstyle, not of the
  healed code alone.

## Panel (§15)

`evidence/2026-11-08/panel-flipsocial-b/before/` (16 cases),
`evidence/2026-11-08/panel-flipsocial-b/after/` (16 cases),
compare `evidence/2026-11-08/panel-flipsocial-b/compare.md` — decision
**review_required** (screen only, both columns review_required). Smoke
panel `evidence/2026-11-08/panel-flipsocial-b-smoke/` (1 seed × socialite
per leg) committed alongside, per the flippanel precedent. The compare is
the instrument; the pre-registered GO bars above are the judge.

## Proof

`scripts/test-flipsocial-b.js` — **38/50 PASS** on this branch. The 38
passes cover every structural check (panels exist and are valid,
identical options, 16 rows each, 8 per policy, frozen seeds;
registration/observer/contract digests agree; compare re-run equals the
recorded decision `review_required` on both columns; every recorded
number reproduces from the panel rows). The 12 failures are the verdict
bars, 6 per column: sits-delta, median-delta, sits-after-band,
median-after-band, GO-bar (c) median, and the village-deaths-rate
guardrail. The test is NOT on the green list and `check.js --quick`
does not run it, so merging this branch does not break the suite.
No-regression (`check.js --quick`): NOT re-run — zero src/js, zero
green-list files; the standing profile is recorded by the sibling arms
this cycle.

## Sense (SENSE-TESTING LAW)

Winseek seed 53001, both legs, read in full (samples, events, endings).
Collapsed (84d, village-lost): the village starts with 11 living, the
bearer at 1920 kcal and 97.8 health on day 2, all 11 hungry on day 3 —
and then it thins, bearer passing from hand to hand (gen_fiq1rlh →
nino_kapanadze → mara_vasquez), down to 1 living at 280 kcal and 22%
hydration on day 84. Deaths are dominated by villagers dying in field
fights (monster:villager combat 46), with 9 expedition deaths and 8
player deaths in the wild. Healed (78d, village-lost): the same village,
the same opening — days 2–4 samples byte-identical (same bearer, same
kcal, same health) — and the same ending six days sooner, the same 46
villager-combat deaths, the same arena death. The healed code changes
nothing this village can feel under winseek play: same fights, same
thinning, same loss. Both legs reach the table (row.table 1) and neither
sits; both reach wave 4 and arc 4 and no further.

Doorwalk healed 53001, for dialogue/coherence
(`perseed-healerctl-healed-b/doorwalk-b-s53001-doorwalk-baseline.json`,
105d, village-lost, regional, maxWave 5, standing 275): the seat was
never even announced here — `takeseatStats` shows 0 attempts, 312
"not-announced" skips, `finalSeat` none — while the world narrates the
regional links the village did earn ("Marcus speaks at Stonebridge's
table now — earned, not appointed. And the other fire is watching what
Haven does FIRST."). The village's own lines are ordinary work
("Gather deadfall. They'll report back by next part."), and the table it
reaches in the panel instrument is a different table from the one its
own playstyle never gets offered. Coherent, and consistent with the
panel read: reaching is not sitting.

## Village assessment in plain words

Sixteen villages, eight seeds under two ways of playing, each played once
on the broken code and once on the fixed code. On the broken code the
villages live about 80 days; on the fixed code they live about 70–74.
Nobody sits at the table on either side, nobody reaches national, nobody
wins — under these two ways of playing, the table is a place villages
walk up to and never sit down at, and fixing the healer bug does not
change that. The villages still thin the same way: a dozen people at the
start, one or two left at the end, most of the dead lost to monsters in
the field. What the fix bought on the doorwalk playstyle — longer life,
more seats — it does not buy here, because these playstyles never take
the seats the fix would let them keep. The scale wall stands untouched
by this arm, as expected; a panel column is a measurement, not a lever.

## Wall numbers (this run's judged panels)

National 0/8 on both legs of both columns. Table sits 0/8 on both legs
of both columns. Wins 0/8 everywhere. Wave-5 reach: socialite 1/8 both
legs, winseek 0/8 both legs. Median survival: socialite 80.0d → 73.5d,
winseek 81.0d → 70.5d. Full seat: 0 everywhere (no seat is taken at all,
so no door is walked). Telemetry deviation check: NOT run as a
`--sweep-rows` check — the panel compare is the sanctioned §15
comparison for this arm (the telemetry-check tool refuses recorder/panel
inputs by design, same as the flippanel arm). No LOUD lines, no compare;
baseline NOT rolled.

## Blanks filled or documented

- FILLED (measured): the two owed §15 columns on the flip — socialite
  NO-GO, winseek NO-GO. The flip is now measured under all four panel
  columns and reproduces under none of them.
- FILLED (measured): the healed leg does not lift median survival under
  socialite/winseek play (73.5/70.5d vs 80/81d collapsed) — the flip's
  survival gain is doorwalk-instrument-specific.
- FILLED (measured): winseek villages reach the table (row.table 7/8 →
  5/8) but never sit (entered 0/8) on either endpoint — reaching is not
  sitting, at panel scale.
- DOCUMENTED (not built): the row.table vs metrics.table divergence —
  whether the compare should surface the raw reach flag alongside the
  ruling-665 sitting metric, or whether the divergence is documented
  enough as is. See Findings for the backlog.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be appended by the coordinator at closeout)

## Convergence

scale-onramp stays converging (NOT converged): the flip is now measured
under the balanced panel on all four columns and does not reproduce on
any of them, the full seat is still unreached (0 everywhere this run),
wins still come only through the lesser seat (and none at all under these
two policies), and the healed code costs survival under socialite/winseek
play. The doorwalk flip stands as a doorwalk result. Next blanks, in
order: (1) the blend-variant fight judgment (this run's second arm,
sim-fightblend-b — in flight); (2) the trial-by-combat staging question
(steve-call, unchanged). food-economy stays converging (untouched; Loop
A 2216Z live at closeout — midshape + tenddrive adoption landed
22823087f, NOT touched by this run).
Claim deleted; lock deleted. Evidence: this file.

## Footer (coordinator adoption)

- Worker artifacts recovered: prereg commit 7572b6364 (branch
  sim-flipsocial-b); panels `panel-flipsocial-b/before|after/panel.json.gz`
  (16 rows each) + `compare.md` + `compare.json` (written 21:43:46Z);
  smoke panels `panel-flipsocial-b-smoke/before|after/panel.json.gz`.
  The `cases/` caches are NOT committed (§15: panel summary only).
  Scratch `scratch-flipsocial/` (extract-before/extract-after) deleted
  before commit, per the prereg.
- Coordinator verification (independent of any worker report): extraction
  hashes match the endpoints (game.js 59a76b12… == cf22937b8,
  380661ca… == c9fea16ee); policies + harness byte-identical across
  endpoints; all digests agree across legs; compare re-run equals the
  recorded decision; every number in this file recomputed from the panel
  rows; proof test 38/50 with the 12 failures being the verdict bars.
- Index-clobber repair: the worktree index showed the safe-commit clobber
  class (staged deletions, `git diff HEAD` empty) — repaired via
  `git ls-tree -r HEAD | git update-index --add --index-info`, verified
  `git status` clean except the intended new files.
- Rebase onto explicit master SHA (see coordinator round evidence),
  proof re-run on the rebased tip, merged --ff-only (see round evidence
  for the merge commit).
