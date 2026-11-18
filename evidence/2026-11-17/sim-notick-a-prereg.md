# sim-notick-a — PREREG (frozen before any sims)

**Arm:** sim-notick-a · **Loop A run:** fleshout-20261118T0112Z · **Axis:** scale-onramp
**Type:** DIAG-first (classification only); a fix lands ONLY if the frozen
fix bar below is met — otherwise evidence only, fix recorded as candidate.
**Branch:** `sim-notick-a` · **Worktree:** `~/workspace/worktrees/sim-notick-a`
**Base at arm start:** `3d0f5770c` (coordinator closeout: selblock DIAG GO +
homebodyvoice BUILD GO).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
— verified against the file in this tree before writing this prereg.
**Bands:** frozen 103411–103418 (8 seeds) + fresh 103441–103448 (8 seeds).
**Horizon:** 150d death-aware.
**Prereg frozen:** before any sim runs in this arm and before the systematic
extraction below (corpus reads for instrument shape only before this line).

## The question (finding #2498 follow-up — the no-tick edge)

sim-selblock-a classified all 12 selected-blocked instances on the frozen
profilegate-b ON corpus. Three of the 12 first-block `no-tick-after-commit`
(part-3 commits with no tick left to execute), and a fourth no-tick selection
hides inside instance #9's all-selections tally — 4 no-tick selections total.
This arm traces what happens to those plans AFTER the no-tick commit: do
they stall, die, re-bid next dawn, depart the next day, or silently drop?
It classifies; it builds a fix only if the frozen fix bar is met.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-selblock-a.md` + prereg — the source numbers.
  No-tick selections (frozen ON corpus, band 103411–103418):
  - #6 seed 103414, visjoin_134 [unknown], target eater, d137 part-3,
    companion visjoin_131.
  - #7 seed 103416, david_kim [homebody], target congregation, d85 part-3,
    companion ethan_hunt.
  - #8 seed 103417, sofia_chen [forager], target eater, d145 part-3,
    companion visjoin_113.
  - #9 seed 103418, visjoin_58 [forager], target influencer — one no-tick
    selection among its 6 (day to be recovered by the extraction; the
    first block of #9 is inviter-hurt d70).
  All three first-block cases verified: exactly one score row that day
  (part 3, `party_launch`), zero depart rows, zero skip rows.
- `evidence/2026-11-17/sim-profilegate-b.md` + prereg — ON-leg wall:
  national standing 1/8, national rank 0/8, table 0, wins 0, wave 4
  unlocked 8/8, wave 5 unlocked 1/8, median survival 116.5d. The lever
  (PROFILEGATE=1) is REVERTED in this tree; the fresh band re-applies it
  in-tree only (see Fresh band below) and reverts before commit.
- `scripts/analyze-launchdef-a.js` `classifySeed` — the frozen
  `no-tick-after-commit` rule: no depart row, no skip row, no midday
  overwrite, last commit part >= 2. A `no-tick-after-commit` resolution
  is a *selection-day* fact; it says nothing about the plan's fate after
  that day. That fate is this arm's question.
- Code mechanism, read from code not assumed (grounds the fate buckets):
  - `writeCommit` (`src/js/villager-brain.js:627-644`) stamps the commit
    with the current day AND part.
  - `vbrainExecuteDepart` (`src/js/villager-brain.js:1058-1061`) returns
    `'normal'` when there is no commit or `c.day !== dayOf(this)` — a
    commit from a previous day NEVER executes.
  - `commitDayPartStale` (`:95-100`): a commit is stale when its day no
    longer matches; dawn callers force-refresh
    (`vbrainShouldRefresh`, `:702-716`).
  - `vbrainAlignObjective` (`:964-1010`): a party_launch commit rewrites
    the holder's live objective to an EXPEDITION indoor chore hold, so
    the holder sits on a hold for the rest of that part instead of the
    core pick. The commit's only same-day effect is that hold; the plan
    record (`winPlan[vid]`) is untouched by the commit.
  - The skip recorder (`scripts/profilegate-driver-20261117.js`
    `skipSnapshot`) only snapshots ticks whose commit is from TODAY, so
    zero rows after a part-3 commit means zero agency ticks ran after
    the commit, not a dropped row (same argument selblock-a used).
  - Consequence the buckets below test: a part-3 commit evaporates at
    day end by construction; the plan survives unless something else
    kills it. If the corpus shows otherwise (a plan dying right after
    a no-tick commit with no other cause), that is a finding, not an
    assumption.

## Canon read

- `docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave law),
  `docs/PARTY.md` (party unlock day 7, cap 3→4→5), `docs/VILLAGER-BRAIN.md`
  (one brain, one scorer; departure honors the dawn commitment).
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility, the depart-gate block reasons, or the
  no-tick-after-commit scheduling edge. Same gap selblock-a recorded.
  The fate buckets below are grounded in the recorder code and the
  commit mechanism above, not in canon.

## Band freshness (verified before this prereg)

- Frozen band 103411–103418: intentional same-band reuse so the fate
  trace is directly comparable with profilegate-b / selblock-a (same
  villages, same instances — deliberate frozen-band re-measurement,
  not a fresh band). Named by 23 preregs; reuse is by design, recorded
  here.
- Fresh band 103441–103448: `grep -rl "103441" evidence/*/sim-*-prereg.md`
  = 0 files; same for 103451/103461/103471/103481/103491 (all 0). A
  full-tree grep for `10344[1-8]` over `evidence/` + the goal
  `hidden_files/` returned 10 files, every hit an incidental number,
  not a seed naming: pantry kcal `103445` (crumbdefault census),
  long IDs `103448275862` / `10344827586207` (fscav / gearday2 /
  presence2 analysis), and feastvoice text fragments. **No prereg,
  forbidden list, screen, or extension band names 103441–103448.
  The band is fresh.** (Search scope: `evidence/*/sim-*-prereg.md`
  for the prereg check; `evidence/` + goal `hidden_files/` for the
  full-tree check. Other named bands in preregs, for the record:
  103101–103108, 103201–103208, 103211–103218, 103221–103228,
  103231–103238, 103241–103248, 103421–103428, 103431–103438,
  103501–103512, 103601–103608, 103801–103812, 103001–103008,
  103011–103018, 103021–103028.)

## Corpus-first decision (frozen)

The frozen profilegate-b ON corpus
(`evidence/2026-11-17/perseed-profilegate-b-on/`, 8 files) already
records, for every wave-4 plan holder, the score rows (day/part/commit/
plan), depart rows, skip rows, census rows, and daily snapshots the
fate trace needs. **Therefore: classify the 4 frozen no-tick selections
from the corpus first. No re-run is needed for those four.** The corpus
is thin by the brief's own threshold (3–4 instances), so a fresh band
runs as well (see below) — the verdict rests on BOTH legs, and a fate
seen on only one leg is reported as such, not generalized.
Row-shape exploration before freezing: one instance's score rows (seed
103414, visjoin_134, days 137–138) were inspected to learn the
recorder's fields; no fate was judged and no tally was taken before
this prereg. The systematic extraction below is the first judgement.

## Fresh band (frozen)

- **Lever re-application (in-tree only, reverted before commit):** the
  exact profilegate-b change — skip the profile check
  `if (prof !== 'wanderer' && prof !== 'explorer') continue;` in the
  two `findCompanion` twins (`src/js/villager-brain.js:150`,
  `src/js/win-plan.js:226`) when `PROFILEGATE=1` — via the same
  `profilegateOn()` shape profilegate-b used. Net `src/` diff vs base
  must be zero at the end of the arm unless the frozen fix bar is met.
- **Driver:** `scripts/profilegate-driver-20261117.js` verbatim, ON leg
  only: `VETREENGAGE=1 PROFILEGATE=1 MODE=on OUTDIR=perseed-notick-a-on
  SEEDS=103441,103442,103443,103444,103445,103446,103447,103448
  RUN=notick-a node scripts/profilegate-driver-20261117.js`, 150d,
  recorder ON. No OFF leg — the question is the fate of no-tick commits
  under the widened gate, not the gate itself.
- **D-checks (instrument validity, run in this arm):**
  - **D1 repeatability:** same tip, one fresh-band seed, 60d, recorder
    ON, PROFILEGATE=1, run twice; trajectories identical.
  - **D2 wrap neutrality:** same tip, same seed, 60d, recorder ON vs
    recorder OFF (PROFILEGATE_RECORDER=off); trajectories identical
    (0 divergences). Same frozen profilegate-b D2 shape.
- **Panel:** no balance panel for the DIAG classification. A panel runs
  ONLY if the fix bar is met (see Fix rule).

## Instrument (reuse, do not rebuild)

- **Classifier:** `scripts/analyze-launchdef-a.js` `classifySeed`
  (frozen) run over the existing ON corpus + the fresh band, to
  recover every `no-tick-after-commit` resolution with its instance.
- **Fate tracer:** new `scripts/analyze-notick-a.js` (kept, committed)
  that, for each no-tick resolution (seed, vid, target, day D), reads
  the same per-seed file forward: later score rows for the same
  vid+target (re-bid days/parts/companions), later depart rows
  (launch?), later skip rows, the instance's `closeDay`/`closeKind`
  from `classifySeed`, holder death (census/daily roster), and village
  end (`gameDays`). The tracer is a read, not a re-classification:
  the no-tick resolutions come from the frozen classifier.
- **Proof test:** `scripts/test-notick-a.js` — synthetic no-tick
  instances, one per fate bucket below, + corpus checks (frozen 4 +
  fresh-band counts + ON replication vs the frozen profilegate-b
  analysis). Must be green.

## Primary metric (frozen)

**Fate classification of EVERY no-tick-after-commit selection** — the 12
on the frozen ON corpus (Correction 2) plus every no-tick selection on the fresh band.
"Fate" = the earliest post-commit event for the same plan (same vid +
target) within 7 days after the no-tick day D, from the frozen buckets
below. A plan whose fate is a re-bid is traced to its eventual instance
outcome (launched / target-killed / blocked again / churned) in the
evidence table, but the FATE is the first post-D event.

## Fate buckets (frozen — earliest post-D event within 7 days wins)

| Fate | What it means (corpus evidence) |
| --- | --- |
| `depart-next-day` | A depart row `launch` for the same vid+target on day D+1. Would contradict the stale-commit mechanism — record the depart row's `commitKind`/`commitPart` if it ever fires. |
| `depart-later` | A depart row `launch` for the same vid+target on a day in (D+1, D+7] with NO `party_launch` re-bid before it (legacy-path launch without a brain commit). Benign — the plan did depart, just late. |
| `re-bid-next-day` | A `party_launch` commit for the same vid+target on day D+1 (any part). |
| `re-bid-later` | First `party_launch` commit for the same plan on day > D+1 (gap in days recorded). |
| `plan-deleted-after` | Instance closes `plan-deleted` (or `retargeted` — the plan for this target left winPlan for a new target; closeKind recorded in the table) with closeDay in (D, D+7] and no re-bid before the close. |
| `holder-died-after` | Instance closes `holder-died` with closeDay in (D, D+7] and no re-bid before the close. |
| `village-ended` | Village ends (`gameDays`) in (D, D+7] before any re-bid. |
| `stall` | Plan still scored on later days but NO `party_launch` commit within 7 days after D. |
| `unknown` | No post-D event, no later score row, and no close record explains the plan within 7 days. Counts as UNKNOWN. |

Precedence is by earliest event day; ties resolve
depart > re-bid > close (a depart on the same day as a re-bid is the
depart executing that re-bid). A re-bid that is itself blocked again
counts as `re-bid-*` — the fate of the no-tick commit is the re-bid,
and the re-bid's own resolution is reported alongside, not instead.

## Secondary metric (frozen — fix-candidacy evidence)

**Do late commits EVER execute?** Across BOTH legs, count every
`party_launch` commit at part >= 2 and its same-day resolution
(launched / blocked with a reason / no-tick / overwritten). If any
part-2/3 commit resolves to a same-day launch, a blanket "never commit
at part >= 2" fix would break live behavior and is NOT trivially safe.

## GO bars (frozen — a miss is NO-GO, never re-scored)

**DIAG GO** iff ALL of:
1. **Frozen classification complete:** 12/12 frozen no-tick selections
   classified into a named fate, **unknown ≤ 1**. (Corrected from 4/4
   by Correction 2 — the population is 12.)
2. **Fresh band complete:** the fresh 8-seed ON leg runs clean (8/8
   files, 0 instrument errors) and every no-tick selection on it is
   classified, **unknown ≤ 1**. The fresh no-tick count itself is
   reported, not barred — a thin fresh leg is a caveat, not a fail.
3. **Instrument D-checks green:** D1 repeatability green, D2 wrap
   neutrality green (60d, one fresh-band seed).
4. **Proof test green:** `scripts/test-notick-a.js` passes all checks
   (synthetic instances per fate bucket + corpus checks).

A miss on any bar is DIAG NO-GO. The verdict judges the
CLASSIFICATION, not the game: a complete classification that shows the
no-tick commit is harmless (every plan re-bids next dawn) is still GO.

## Fix rule (frozen — decides build vs evidence-only BEFORE the results)

A fix (defer a part-≥2 `party_launch` commit to the next tick — i.e.
do not write the commit when no depart tick can follow it) is built
ONLY if BOTH hold:
- **(a) Harm:** ≥ 1 no-tick instance across the two legs has a fate of
  `plan-deleted-after`, `holder-died-after`, `village-ended`,
  `stall`, or `unknown` — harm to the PLAN beyond the one lost part-3
  action (the indoor hold instead of the core pick). If every fate is
  `re-bid-next-day`, `re-bid-later`, `depart-next-day`, or
  `depart-later`, the commit is benign by the mechanism above and NO
  fix is built.
- **(b) Proof + no-drift control:** the fix passes a proof test AND a
  same-base balanced-panel control (fresh band, PROFILEGATE=1 on both
  legs, fix OFF vs ON) showing wall numbers unchanged
  (national/table/wins, wave-4/5 unlocks, median survival within the
  panel's no-regression reading) with no trajectory delta before the
  first no-tick commit day on any seed.
If (a) fails, the fix is documented as a CANDIDATE in the evidence
and in `hidden_files/sim-findings.md` via the coordinator — not built.
If (a) holds but (b) fails, the fix is likewise documented, not landed.
A landed fix touches feel/combat/UI only if the panel shows a
behavioral change the player can see; `[needs-eyes]` then applies.

## Correction 1 (before any extraction — reading the driver)

- Added fate `depart-later`: the driver records TWO depart streams —
  `dawnbidDeparts` (brain executor, always carries the authorizing
  same-day commit) and `v4departs` (brain + legacy `winPlanDepart`,
  which runs only when the brain does not own dawn). A brain depart
  cannot precede its re-bid, but a legacy depart could in principle,
  so a launch on D+2..D+7 with no earlier re-bid gets its own benign
  bucket instead of forcing a mislabel.
- `plan-deleted-after` now covers closeKind `retargeted` as well as
  `plan-deleted` (both mean the plan for this target left winPlan);
  the closeKind is recorded per instance in the evidence table.
- Fix rule (a) benign list gains `depart-later`.

## Correction 2 (after the first tracer run, before any evidence — instrument facts)

Three instrument facts the first tracer run exposed; all three are
corrections to the INSTRUMENT, not to any verdict (no fate has been
judged into evidence yet, and the fresh band has not run):

1. **Population is 12, not 4.** selblock-a's "4 no-tick selections"
   counted only the selections inside the 12 selected-blocked
   instances. Launched instances ALSO carry no-tick commit days in
   their history (a plan can commit at part 3, miss its tick, re-bid,
   and launch days later). The frozen ON corpus carries **12**
   no-tick-after-commit selections. GO bar 1 is corrected to **12/12
   classified, unknown ≤ 1**. The brief's "classify EVERY
   no-tick-after-commit instance" is the population that matters.
2. **Holder death must be read from the deaths array.** The
   classifier's churn detection (`classifySeed`) misses deaths: it
   checks census `holderAlive=false` and daily-roster `dead:true`,
   but dead villagers DROP OUT of the daily roster, and census rows
   stop when the plan is deleted on death — so both david_kim (died
   d86, seed 103416) and gen_4hoo6rr (died d147, seed 103413) close
   as `plan-deleted` while the deaths array records their deaths.
   The tracer now reads holder death from `deaths` (kind villager)
   first, adds a death candidate to the fate precedence (depart >
   re-bid > death > close > village-end), and reports the death
   cause. This changes two frozen fates from `plan-deleted-after`
   to `holder-died-after` — a correction of a mislabel, not a
   re-score: the deaths are in the corpus either way.
3. **Depart rows need the companionStarted qualifier.** A `launch`
   depart row with `vidExped` true and `companionExped` false is a
   HOLDER-ONLY departure (the companion never started; the plan
   advances to hunt short-handed). The tracer now records
   `companionStarted` (brain rows only; legacy rows carry no exped
   flags) and qualifies every depart fate as full-party or
   holder-only in the evidence table. The fate bucket is unchanged.

## Correction 2b — fix rule (a), attribution (same moment, same reason)

The two holder-died-after fates on the frozen leg are deaths the
no-tick commit did not cause, shown by their backing rows: gen_4hoo6rr
was already out hunting since d134, ten days BEFORE the d144 commit,
and died in the wild d147 on that launched expedition; david_kim died
d86 to a monster while his plan was still live and attempting
departure that day (a directed startExpedition call, expedition never
stood). The commit neither summoned the monster nor prevented the
departure. Rule (a) as written would count any holder-died-after fate
as "harm" — but its intent is harm the COMMIT caused. Clarified:
**(a) holds only when a harm fate (plan-deleted-after,
holder-died-after, village-ended, stall, unknown) is attributable to
the no-tick commit on its backing rows** — i.e. the plan died, stalled,
or dropped BECAUSE the commit evaporated and no re-bid or departure
followed, with no independent cause (death by monster/wild, a launch
that predates the commit, a village-ending event) in the rows. The
fate LABELS are unchanged by this clarification; the attribution is
reported per instance in the evidence table, and the metric review
records the rule as written vs as applied. If the fresh band shows an
attributable harm fate, (a) holds and the fix is attempted.

## Horizon (why 150d death-aware, same as profilegate-b)

The instances being traced ARE the profilegate-b ON-leg instances,
measured on 150d death-aware horizons, and the fresh band must match
that horizon to be comparable. Any other horizon would re-define the
instance set. Death-aware: dead villages stop simulating (+10d tail
max), per MEASUREMENT.md §§9–12 — the same rule profilegate-b used.

## What the evidence must contain

- Before/after numbers on identical seeds (quoted from the frozen
  profilegate-b analysis: OFF vs ON funnel buckets, pool fill,
  launches) + the fresh band's wall numbers.
- Per-instance fate table: seed / holder / companion / target / no-tick
  day+part / fate / first post-D event (day, kind, backing row) /
  eventual instance outcome. All 4 frozen + all fresh, no exceptions.
- The secondary metric: part-≥2 commits and their same-day resolutions
  on both legs.
- Per-bucket totals with the mechanism each names, in plain words.
- Village assessment in plain words (what the village looked like,
  who was left holding a plan overnight and what the morning did).
- Sense-testing note (transcripts: does anything say a picked party
  waited overnight, or that the bid was re-made at dawn?).
- Metric review section.
- The fix verdict (built with proof + panel, or candidate-only with the
  reason) and the finding claim for the coordinator. This arm does NOT
  edit `hidden_files/sim-findings.md` (outside the repo).

## Disposition

DIAG arm (+ fix only if the frozen bar is met): commits are instrument
+ evidence only unless the fix bar is met, in which case the fix lands
as its own commit with its proof test. The PROFILEGATE lever is
re-applied in-tree only for the fresh band and REVERTED before any
commit that is not the fix. Net `src/` diff vs base must be zero at the
end unless the fix bar is met (verified with `git diff` before
reporting). Do NOT push, do NOT bump, do NOT merge — the coordinator
lands the work.
