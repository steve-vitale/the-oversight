# sim-drive-practice-a — practice moves competence (pilot GO)

- Run: `fleshout-20261106T1415Z`, Loop A, axis self-improvement drive
  (Steve 2026-11-06 10:22 CST)
- Arm: `sim-drive-practice-a`, worktree
  `~/workspace/worktrees/sim-drive-practice-a`, branch `sim-drive-practice-a`
- Prereg: `evidence/2026-11-06/sim-drive-practice-a-prereg.md`
- Band: **99451–99458** (8 seeds, pilot), horizon 80d death-aware,
  competent policy verbatim.
- Verdict: **GO** — armed 14/16 practicing villagers moved ≥1 competence
  cell (87.5% ≥ 50% bar), baseline 0 cells, 0 decreases anywhere.
- Commit: game.js + driver + analyzer + proof test + prereg + this file +
  per-seed corpora (see below). Merged locally, pending ship (coordinator
  merges; no push, no bump, no live check by this arm).

## What the village looked like

Eight competent-policy villages, 80 days at most. Five lived to the
horizon (seeds 99451/99452/99453/99457/99458 baseline; armed 99453/99457
reached it), three died mid-run (99454 day 76–77, 99455 day 46, 99456 day
23 — the village that dies at day 23 starves early on both legs). The
work that gets done is haven labor: wood, stone, deadfall, water, cooking,
fishing, a little garden and forage. Almost nobody hunts, patrols, scouts,
teaches, or tends in these runs — the competent policy barely assigns
those tasks, so the pilot measures the haven-labor half of the drive, not
the combat half (see metric review).

## The lever (what changed, in plain words)

Villagers now get better at work by doing it. Before, how good a villager
was at a job was fixed at birth by their old occupation — a librarian
would stay bad at woodcutting forever no matter how many winters they
spent at it. Now every finished day's work in a task counts as practice,
and after enough practice (8 days' worth for the first step, then 12,
then 16) they step up one rung — from 0.7 to 1.0 to 1.2 to 1.3 to 1.4,
never above the level a natural would have. It mirrors exactly how the
player character already improves ("practice makes human"). When someone
steps up, the game says so in plain words: "Mehdi is getting the hang of
stonework." No new system, no new verb, no ability grants, no gate or
price touched. Scope kept to the competence/practice regions of
src/js/game.js only (villagerCompetence + one recording call at the tail
of resolveOneAssignment); spawn sites, pyrrhic attribution, table.js all
untouched.

## Before / after (identical seeds 99451–99458)

Analyzer: `scripts/drive-practice-analyze-20261106.js` (temperament-
normalized rung diffs on the 0.7/1.0/1.2/1.3/1.4 ladder; practicing =
≥8 resolutions in one task, in the end snapshot).

| | baseline | armed |
|---|---|---|
| practicing villagers | 45 | 16 |
| moved ≥1 cell | 0 (0.0%) | 14 (87.5%) |
| cells moved | 0 | 14 |
| decreases | 0 | 0 |
| total practice reps | 0 | 312 |

By task (practicing / moved / cells / reps), armed leg: garden 4/3/3/47,
fish 5/4/4/80, wood 2/2/2/50, stone 2/2/2/49, deadfall 0/0/0/18, water
2/2/2/55, cook 1/1/1/13. Baseline: 0 moved in every task. Hunt, patrol,
scout, teach, tend, mend: 0 practicing villagers on EITHER leg — the
policy never assigned them, so they are unmeasured in sims (unit-tested
only, see proof).

Per seed, armed (seed endDay practicing moved cells): 99451 54 5 3 3;
99452 38 6 6 6; 99453 81 2 2 2; 99454 76 0 0 0; 99455 46 2 2 2; 99456 23
1 1 1; 99457 81 0 0 0; 99458 80 0 0 0.

## The fuller picture (why the denominator is small)

The prereg's "practicing villager" needs the villager in the END
snapshot, but the hardest workers drop off the roster: on armed 99457
the top worker did 437 resolutions (119 stone, 115 deadfall, 112 wood)
and is not in the end snapshot; on armed 99458 the end snapshot is empty
(the village ended) despite 460 resolutions. So the 14/16 share is
computed on survivors who stayed — the mechanism's true reach is bigger.
Counting the rung-gain lines themselves (captured from the transcript,
villagers included even if they later left): **188 rung gains across the
8 armed seeds** (99451: 30, 99452: 20, 99453: 35, 99454: 23, 99455: 21,
99456: 8, 99457: 26, 99458: 25), spanning woodcutting, stonework, the
water run, fishing, cooking, the garden, deadfall, foraging — every path
the policy actually works, not just killing. Baseline rung-gain lines: 0
on all 8 seeds (the other "practice" lines on baseline are the word
"practiced" in unrelated prose, e.g. "practiced hands").

## Wall numbers (both legs — the wall did not move)

| | baseline | armed |
|---|---|---|
| national reached | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave-4 kills | 0 | 0 |
| median survival | 81d | 76d |

Second-kill timing: unmeasurable at pilot scale — zero wave-4 kills on
either leg (expected; prereg said 0–2). The armed median survival dip
(76 vs 81) is two seeds dying early (99451 day 54 vs 81, 99452 day 38 vs
81) while the other six match baseline within a day. At n=8 that is
noise, not a verdict — but it is the thing to watch at confirm scale:
better competence changes yields, yields change trajectories, and a
chaotic sim diverges. No new death mode was introduced that this
instrument can see (death-cause shares were not instrumented; the daily
alive counts track baseline).

## Sense test (read the lines, not just the counts)

Rung-gain lines read as people getting better, with the name and the
work varying: "Vanessa is getting the hang of the water run", "Mehdi is
getting the hang of stonework", then the same Mehdi on the water run and
on woodcutting days later — one person visibly becoming a capable
generalist through work. The line template repeats (same sentence shape
every time); the person + task is what varies. Before the System knows
them, the name shows as a descriptor ("A person, maybe 60s, with
sun-creased eyes is getting the hang of foraging") — that is the
knowledge gate working correctly, not a bug. No line ever fired on the
baseline leg. Verdict: reads as people improving, not numbers ticking.

## Proof

`scripts/test-drive-practice-a.js` — ALL GREEN (re-run after the final
restore, identical results): UNIT1 thresholds 8/20/36 move exactly 1/2/3
rungs, cap at 1.4; UNIT2 all 14 tasks never decrease, cap holds, unknown
task/villager ignored; UNIT3 cautious 0.9 temperament still applies on
top of practice (0.9 → 1.08); INTEGRATION 8 real forage resolutions →
8 reps, one rung, and the "getting the hang of foraging" line fires.
`node scripts/check.js --quick` was started but hung with zero output
for 7+ minutes (contending with the pilot run) and was killed; a clean
re-run is OWED before the coordinator merges (see below).

## Method notes — two incidents, both corrected in the open

1. **Baseline contamination (own goal).** The first baseline leg was
   launched, then game.js was edited while it was still running — the
   harness loads game files fresh per seed, so seeds 99453–99458 of that
   leg silently ran the ARMED code (proven: their rung-gain lines were
   8–35, and the later armed runs reproduced those seeds bit-for-bit).
   Those 8 files were moved aside untouched to
   `evidence/2026-11-06/drive-practice-contaminated-baseline/` and the
   baseline was re-run cleanly with game.js restored to HEAD. The clean
   re-run reproduces seeds 99451/99452 exactly (endDay 81/81, resolved
   1285/496 — deterministic on HEAD code) and differs on 99453–99458,
   confirming the diagnosis. Lesson: never edit game code while a
   baseline leg is in flight; baseline first, edit second.
2. **/tmp backup lost.** The armed game.js was backed up to /tmp during
   the HEAD-restore dance; /tmp was wiped mid-run and the backup vanished.
   The change was re-applied from the exact edit text and reproduces the
   identical 55-insertion diff (0 deletions), and the proof test passes
   with identical numbers — but the re-application is a reconstruction,
   stated as such. Lesson: keep backups inside the worktree (removed
   before commit), never /tmp.

## Metric review

- The end-snapshot "practicing villager" definition understates the
  lever: heavy workers leave the roster and vanish from the denominator
  (see above). Next run should snapshot competence at last-seen
  (periodic snapshots at days 30/60/90 exist in the rolecensus shape but
  this driver dropped them) or count rung-gain lines as the primary
  instrument — the 188-line count is arguably the truer measure.
- Pacing: first rungs land ~day 9–13 for steady workers; nobody maxes
  absurdly fast, but one villager (Mehdi) gained rungs in three tasks
  within four days — the thresholds (8/12/16) may be quick for a
  generalist. The GO verdict stands (prereg binds the threshold, not
  pacing taste); pacing is a design question for the confirm/ship review,
  and the homogenization worry (everyone drifts to 1.4 at everything
  they touch) is still open — the cap is per-task, so a villager who
  works everything becomes good at everything. Worth watching, not a
  NO-GO.
- Combat-track half unmeasured: hunt/patrol/scout never assigned by the
  competent policy, so practice-on-hunt has zero sim evidence (unit test
  only). The drive's "fighter gets better at fighting" half needs a
  policy that assigns hunts, or field-fight practice — a follow-up arm.
- Second-kill timing stayed unmeasurable (0 wave-4 kills). Practice
  changes how good villagers get at work, not whether killers go back
  out — the killers-sitting-at-Haven drive is still a goals/objectives
  question, not answered here.
- The specialistSkill zero-gate (food.js) is untouched by design (out of
  this arm's regions): competence now moves, but a non-matching
  occupation still has specialistSkill 0. The 2026-11-05 census's second
  half (skill 0→positive for 0 villagers) is therefore still open — a
  food.js arm's blank, recorded here.
- Steve's 2026-11-06 11:48 CST ruling (reward all paths, not just
  killing; measure role formation across all five tracks): complied with
  by design — practice accrues on all 14 tasks, the metric is competence
  movement across all task domains, kills never judge it. The pilot's
  movement spans field/craft tasks; combat/social/strange tracks have no
  sim coverage yet (see above).

## Blanks filled / documented

- FILLED: practice moves competence (this arm) — the 2026-11-05 census's
  "competence moved 0 cells" is now 14 cells on survivors + 188 rung
  gains overall at pilot scale.
- DOCUMENTED (not chased): specialistSkill zero-gate (food.js arm
  needed); combat-track practice unmeasured (policy never assigns
  hunts); pacing/homogenization question; survival dip at n=8 is noise
  until confirm; killers-sitting drive still open (goals arm).
- No backlog change: no sim-findings.md item claimed or added by this
  arm (the specialistSkill gate was already named in the 2026-11-05
  census record).

## Convergence state

Axis self-improvement drive: NOT converged — first lever on it is GO at
pilot. Confirm 12–16 seeds is OWED (not run: time budget), plus the
`check.js --quick` re-run OWED before merge. Balanced panel (§15):
inapplicable — the panel runs its own full panel and takes no corpus
input, so it cannot compare this census corpus on identical seeds (same
limitation recorded by killersurvive-a and other census arms); the
identical-seed census comparison above is the before/after instrument,
with per-seed JSON corpora attached:
`drive-practice-a-baseline-seed9945{1..8}.json`,
`drive-practice-a-armed-seed9945{1..8}.json` (contaminated first baseline
preserved under `drive-practice-contaminated-baseline/`).
