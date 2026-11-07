# Loop B round 1230Z — 2026-11-07 (axis scale-onramp / winnability chain)

**Run:** fleshout-loop-b-20261107T1230Z · **Axis:** scale-onramp /
winnability chain (re-point) · **Loop A live:** 1205Z on food-economy
(sim-preserverleg2-a + sim-awayconfirm-a), NOT touched.

## Run open — STALE-LOCK RECOVERY of the 1049Z run

The 1049Z B run was dead at open: its feastdrive worker
(b0e146b0) was CANCELLED before finishing ~12:13Z, no coordinator
activity / writes / processes since 12:09Z, feastdrive tree
heartbeat 28 min stale, lock 105 min old. Lock deleted, claim
retired to `.DEAD` with disposition note. Arm 1 (sim-linkdrive-b)
had already LANDED GO (7100412b8); arm 2 (sim-feastdrive-b) was
stranded mid-flight at branch tip 5db91a2d4 (prereg v2) with
uncommitted work in its tree. This run adopted it. Pre-flight:
main tree clean, disk 26%, reaper ran (5/16 active, nothing
removed).

## Arm 1 — sim-feastdrive-b ADOPTION: GO (landed eaf80f65f)

Adopted the cancelled run's work: verified the uncommitted policy
file against the v2 frozen composition, verified the diag corpus
(8 files) and dusk corpus (5 files), proof 35/35, then ran the
armed leg + balanced panel and judged against the frozen prereg.

Frozen bars (prereg v2, band 53001–53008, 150d death-aware):

| Bar | Baseline (diag) | Armed | Result |
|---|---|---|---|
| `feastSurgeUsed` ≥ 3/8 | 1/8 | **5/8** (53004/05/06/07/08) | PASS |
| `foodDeeds` ≥ 2/8 | 1/8 | **5/8** | PASS |
| Starvation ≤ control + 2 total | 6 | **6** | PASS |
| Median ≥ 0.8× control | 114.5d | **111d** (0.97×) | PASS |

Secondaries: 21 feasts, 18 draws, 10 faced, 0 driven off,
53,845 kcal donated; w4+ kills 17 vs 17 unchanged. The feast
deed is now BUILT past on this band, not just diagnosed: the
donate-down + feast-at-dusk drive spends the surge on 5/8 seeds
where the staged policy spent it on 1/8.

**LANDING CAVEAT — the deed is bought with the village's
pairs.** Pair days collapse 62 → 14, survivors 3 → 1,
community loss 0.625 → 0.875 (panel `regression_watch`),
survival60 1.0 → 0.875 (`regression_watch`); panel decision
`review_required`. Three villages die 34–44 days earlier. The
frozen cost bar (starvation + median survival) does not price
pairs or survival count, so the GO stands on the frozen bars —
metric binding cuts both ways, a pass is a GO, and the run must
not re-score against a stricter bar mid-run. The cost is
recorded here, in the arm evidence, and as two findings in
`sim-findings.md` (pair cost; donate-down haul-dependence:
53001/53003 donate 0 kcal, 53002 never clears 1,500 in any
7-day window). The next arm on this axis is a cost-taming
variant with pair-days in the cost bar (cap donations / longer
giving window). Landing a GO with an unpriced cost is a
coordinator judgment call, disclosed, not hidden.

Base drift: NONE. The re-baseline leg (POLICY=staged, new base,
clearly labeled, not the judged baseline) reproduces the frozen
diag baseline exactly — median 114.5, w4+ kills 1/1/2/1/0/8/4/0,
spent 1/8, pair days 62 — so the armed leg's movement is the
drive's, not drift.

Corrections found in adoption: the analyzer starvation counter
was wrong (indexed the teleDeaths array as an object, always
returned 0) — fixed; true counts are baseline 6, armed 6,
verdict unchanged, but prior files quoting that analyzer's
starvation total quoted 0. Diag end-gate label note: frozen diag
files carry the v1 `grant-no-draw` label for 53004/53006 while
prereg v1.1 recomputed them as `grant-refused` — same seeds,
same meaning, not re-scored.

Proof: `scripts/test-feastdrive-20261107.js` 35/35 +
`scripts/test-feastdrive-panels-20261107.js` 19/19, green
before and after both rebases and on merged master.

Wall (feastdrive corpus): national 0/8 → 0/8, table 0/8 →
0/8, wins 0/8 → 0/8, wave-4 unlock 7/8 → 8/8, wave-5 unlock
1/8 → 1/8, median survival 114.5d → 111d. The scale wall is
untouched — the feast deed is a seat ingredient, not a scale
lever.

Evidence: `evidence/2026-11-07/sim-feastdrive-b.md` (corpus
`perseed-feastdrive-b-diag/` frozen baseline,
`perseed-feastdrive-b-armed/`, `perseed-feastdrive-b-rebaseline/`,
panel `feastdrive-panel.md` + .json + -before/-after .json.gz).

## Arm 2 — sim-sitstep2-b: DIAG-NO-GO on the substrate guard only (landed 6fc4c5fd0)

Replay of the FROZEN linkdrive substrate
(`scripts/policies/competent-linkdrive-b.js`, unmodified) on
53001–53008, 150d, with a sit recorder. Prereg 33c8a882a
committed before any judged sim; proof 30/30 green before the
judged run.

- (a) Mechanism named: PASS, 4/4 seeds that earn a seat offer,
  with per-day gate state in the corpus.
- (b) Substrate guard: FAIL — regional 8/8 ✓, lesser seats
  4/8 ✓ (≥3), but median survival **106.5d vs guard floor
  108.5d**. Driven entirely by seed 53008 flipping 150d
  survived → 95d lost. Verified master-caused: the original
  linkdrive driver reproduces 95d on this master; the
  finishersize commit (8a4ce0eab) moved one fragile trajectory.
  7/8 seeds reproduce linkdrive exactly; links 41/41 exact.
- (c) Instrument: PASS, 0 errors.

The mechanism: on **75 preview-ready days** (53003: 25, 53004:
26, 53005: 24) the scholar was at Haven and alive on **75/75**,
the sit verb was called **0 times**, tableChoices never
surfaced, the table never sat. 53006 earned a lesser seat day 64
and died day 89 — all 25 seat days below the day-90 floor,
never announced, never previewed. On the 4 no-seat seeds the
sole missing lesser bar is the feast surge (spent on all 4 seat
seeds, never on the 4 no-seat seeds). No offer expiry exists in
code (sticky offer); 0 dip-while-announced days; scholar
absence blocks 0 ready days. Plainly: the seat is offered,
announced, ready, and scholar-present — and nobody sits because
no policy ever issues the sit verb. The next arm is the sit
drive (takeseat policy). Metric review proposes replacing the
median guard with a per-seed exact-reproduction count (≥6/8).

Wall (sitstep2 corpus): national / table-sat / wins **0 / 0 /
0** · wave-4 unlocks 7/8 · wave-5 unlocks 4/8, faced 4/8, kills
on 4 seeds · lesser seats earned 4/8, sat 0/8 · full seat 0/8 ·
median survival **106.5d** · max 150d. National is the next
wall (Binding unanswered on 6/8 seeds).

Evidence: `evidence/2026-11-07/sim-sitstep2-b.md` (corpus
`perseed-sitstep2-b/`, 8 files, 0 instrument errors).

## Cross-arm picture

The two arms meet at the seat. The feast drive now buys the
surge deed (5/8, was 1/8), and the sit diag shows the seat is
offered, announced, ready, and scholar-present — yet sat 0/8,
because no policy issues the sit verb. The chain's next rung is
the sit drive. Tension to carry into it: the feast drive's pair
cost (62 → 14 pair days) cuts against the pair-banking the seat
needs, so the cost-taming variant matters before — or
alongside — the sit drive, or the sit drive inherits a
pair-starved substrate. The linkdrive evidence's other named
next work stands: the national Binding answer (LEAD realm
formation) and the beat/seat narration check.

## Telemetry deviation check

`node scripts/telemetry-check.js` on the feastdrive armed
corpus: REFUSED by design ("recorder-corpus input: all 8 rows
carry top-level anchorCommit, so they are sweep recorder rows,
not runs"). Same refusal on the sitstep2 corpus. No LOUD line,
no deviation signal. Zero src/js changed in either arm, so no
Game-telemetry baseline exists to deviate from.

## Infrastructure

- Registry flock jammed most of the run: sitstep2 heartbeats
  blocked 12:37–12:56 (heartbeat_at stuck 12:32:22Z);
  worktree registrations took ~5 min (sitstep2) and ~7 min
  (feastdrive-b2). Reaper threshold is 4h, so no tree was at
  risk, but the coordinator should look at the lock before the
  next run.
- EPERM flap active: a /tmp sort failed with EPERM; the
  feastdrive adoption hit EPERM twice (a 0-byte 53003 armed
  file, deleted, seeds 53003–53008 re-run in a fresh process);
  Loop A probed for write windows concurrently.
- Rebase stop-at-pick quirk hit on the feastdrive rebase onto
  d65ad8a41 (pick 70c39f6f7 in both done and todo, worktree
  clean, pick unapplied — verified via the absent policy/panel
  files). Recovered with `git rebase --continue` per the
  documented lesson; proofs re-run green after.
- Premature release (own goal, recovered): I ran
  `worktree-release.sh sim-feastdrive-b merged` before noticing
  the ff-only merge had failed — master had moved to d65ad8a41
  (Loop A/main round evidence, 1 file, zero overlap) under the
  rebase. Branch intact (07c49366f); recovered by
  re-registering under fresh slug sim-feastdrive-b2, rebasing
  onto d65ad8a41, re-running proofs 35/35 + 19/19, merging.
  The old registry entry read done-merged early; now true in
  substance.
- Master moved twice under the run (ship-loop bump 2016a7ed0,
  round evidence d65ad8a41). Zero file overlap with either arm.
- Safe-commit index clobber hit all four sitstep2 commits and
  both feastdrive adoption commits — repaired via HEAD-blob
  cacheinfo each time, commits verified correct.
- check.js --quick NOT re-run: zero src/js changed in either
  arm (both policy-side/recorder-only); standing profile
  recorded by sibling runs.

## Convergence

**scale-onramp: converging, NOT converged.** The feast deed is
now BUILT past (5/8) and regional is built past (linkdrive
8/8), but no village has sat a seat (0/8 sat despite 4/8
earned), national 0/8, wins 0/8, full seat 0/8. Next blanks, in
order: (1) the sit drive (takeseat policy) — issue the sit verb
on offered seats; (2) the feast-drive cost-taming variant with
pair-days in the cost bar (cap donations / longer giving
window); (3) the national Binding answer (LEAD realm
formation); (4) Reunion draw/mirror — Steve call; (5)
first-killer survival (firstkiller-b DIAG-GO landed, needs a
lever); (6) veteran-kill hype line + accept lines verbatim;
(7) durable-pair re-judge — Loop A 0221Z NO-GO, loop call;
(8) FINISHER-SIZE — Loop A live, do not duplicate; (9)
measurement neutrality proof refresh #1353; (10) balance
levers / flee-repair port / pellet-bearer (#1819) — Steve
calls. food-economy stays converging (NOT converged):
untouched by this run (Loop A live).

Claim deleted; lock deleted.
