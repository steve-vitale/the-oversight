# sim-trajband-a — PREREGISTRATION (written BEFORE any judged sims, 2026-11-01)

Run: fleshout-loop-a-20261101T0715Z, axis scale-onramp. Arm: DIAG ONLY —
zero src/js changes, zero policy-default flips, zero edits to any existing
script or policy file. New files only: this prereg, one analyzer
(`scripts/trajband-a-analyze.js`), one proof test
(`scripts/test-trajband-a.js`), one evidence file, and corpora under
`evidence/2026-11-01/trajband-a-*`.

## Question (0615Z closeout blank 1)

On seed 87135, a contact-finish kill hands the village the wave-4 key 48
days early (day 88 vs baseline day 135); a wave-4 Algorithm spawns 1 tile
from Haven, the game-side auto-muster shelters all 10 non-scholar villagers
from day 89 for 40+ days, and wild opportunities collapse (192 → 5 in the
0615Z text; see the calibration note below) while the per-opportunity fight
rate stays healthy — shelter, not Spool removal, kills the meeting stream.
The lever leg lives longer (163d vs 144d, both village-lost) but ends
regional where baseline ends national, though it peaks at GLOBAL mid-run
(day 125). Is the 87135 pattern general, or a one-seed story? Whether a
40+-day shelter from one early wave-4 sighting is intended tuning is a
Steve design question, not a bug claim — this arm does not present it as
a bug.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave ledger, wave-4/5 gates,
combat-readiness bars: wave 4 needs 1 living villager with a wave-3+ kill
among other bars; wave-4 monsters are 850–1500 HP) and src/js/shelter.js
(auto-muster: wave-4+ world monster within Chebyshev radius 2 of Haven
musters; stand-down only past radius 3; sheltered villagers are filtered
out of the wild-encounter router; shelter cost is lost production while
sheltered). No canon doc covers trajectory-safety band checks as such;
the method below is this arm's instrument, not invented canon.

## Method (fixed before running)

1. Stack, reused VERBATIM from the 0615Z s87135-traj confirm band: policy
   `withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`, env
   `FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
   FULLSEAT=1 CONTACTFINISH=1 S87135TRAJ=1`, sweep
   `scripts/s87135traj-sweep.js` UNMODIFIED, `DAYS=180`, `SEEDS=91401–91408`,
   corpora under `evidence/2026-11-01/trajband-a-baseline/` (rule OFF) and
   `evidence/2026-11-01/trajband-a-lever/` (rule ON).
2. Baseline leg: `src/js/fieldFights.js` swapped to the pre-rule blob
   (commit `759dd7263^`), verified byte-identical to the `1a6dce59d`
   version used in the confirm (`cmp`) and differing from HEAD by the rule
   block only. Restored from a BACKUP COPY, never `git checkout`;
   `git diff HEAD` verified empty before the lever leg and after restore.
3. Both legs on identical seeds. Horizon 180d death-aware (dead villages
   stop simulating, +10d tail max) — never a fixed 200d target. Why 180d:
   the 0615Z trajectories resolved by day 163, so 180d gives headroom
   past the longest observed trajectory without paying for a 200d tail.
4. Pilot gate: 8 seeds IS the pilot (seeds are ~3s each); no confirm spend
   beyond it — this is a DIAG band check, not a lever confirm.
5. Analyzer `scripts/trajband-a-analyze.js` (new, pure read of two
   per-seed JSONs) computes every per-seed field below; a band summary
   aggregates them. Proof test `scripts/test-trajband-a.js` (new) tests
   the analyzer on synthetic corpora plus a calibration pass on the
   0615Z 87135 pair (see calibration note).

## Per-seed fields (analyzer definitions — these ARE the classification)

- `firstW3KillDay`: min `d` in `killLog` with `w >= 3`; null if none.
- `firstW4SpawnDay`: min `day` in `spawns` with `wave == 4`; null if none.
- `firstW4FightDay`: min `day` in `fieldFights` with `wave == 4`; null.
- `firstAttemptDay` (lever only): min `day` in `fieldFights` with
  `contactFinishAttempted`; null if none.
- `divergenceDay`: day of the first differing entry in the sweep `hashes`
  sequences (dayHash per daily call); null if the sequences never differ
  over the shared prefix.
- Rank order: village 0, local 1, regional 2, national 3, global 4
  (MONSTER-WAVES ladder village → local → regional → national → global;
  daily ranks observed on 87135 were village/regional/national/global).
  `peakRank` = max daily rank, `peakDay` = first day reaching it;
  `endRank` = `endScaleRank`, falling back to the last daily rank.
- Early-gate acceleration: `ACCEL` iff lever `firstW3KillDay` is strictly
  earlier than baseline `firstW3KillDay` AND lever `firstW4SpawnDay` is
  not null AND (baseline `firstW4SpawnDay` is null OR lever spawn day is
  strictly earlier). `KILL-ONLY` iff the kill condition holds but the
  spawn condition does not. Otherwise `ABSENT`. Acceleration days are
  reported as baseline-minus-lever for the kill day and the spawn day
  (null where a side never reaches it).
- Muster episodes: maximal runs of `trajSnaps` entries with a non-empty
  `shelteredList`, in snap order (snaps are ~daily; a missing snap day
  inside a run does not split it — the span is calendar start→end and
  the snap-day count is reported separately). Per episode: start, end,
  span days, snap days, max sheltered, days at max, and the wave-4+
  monsters within Chebyshev distance 2 of Haven (4,4 — the shelter.js
  fallback when `village.px/py` are unset, as in the 87135 snaps) in the
  start-day snap. Muster class: `MUSTER-MAJOR` if any episode has
  max >= 5 sheltered, `MUSTER-MINOR` if episodes exist with max 1–4 only,
  `NO-MUSTER` if none.
- Wild-opportunity collapse (only for seeds with a muster episode):
  window A = the 30 days before the first MAJOR episode start (or from
  `divergenceDay` if that is later), window B = the episode itself.
  Tick-opps = sum of `trajTicks[].opps`; wild fights = `fieldFights`
  with `caller == 'wild'`. Collapse `PRESENT` iff window-B tick-opps per
  day < 25% of window-A tick-opps per day AND window-B wild fights per
  day < window-A wild fights per day (both must fall; a rate computed
  over a window shorter than 5 days is flagged short-window, not hidden).
  For seeds without an episode, collapse is `N/A` and whole-run leg
  totals (tick-opps, wild fights) are reported instead.
- End-vs-peak: `UNDERSTATE` iff peak rank order > end rank order on the
  lever leg; also reported for the baseline leg. (On 87135: lever peaks
  global day 125, ends regional.)
- Trajectory-SAFE (per seed): acceleration present (`ACCEL`) AND no
  `MUSTER-MAJOR` episode on the lever leg AND lever end-rank order >=
  baseline end-rank order. All three must hold; otherwise NOT-SAFE
  (with the failing condition named).
- Trajectory outcome string per seed: `ACCEL/KILL-ONLY/ABSENT` +
  `MUSTER-MAJOR/MINOR/NO-MUSTER` + `COLLAPSE-PRESENT/ABSENT/N/A` +
  `UNDERSTATE/NO-UNDERSTATE` + `SAFE/NOT-SAFE`. A seed is `UNCLASSIFIED`
  iff any required corpus field is missing or empty (zero daily rows,
  zero traj snaps, zero traj ticks, missing killLog/spawns/fieldFights
  arrays) or a leg fails to run. No other outcome value exists.

## Recorder neutrality (per seed, judged, not assumed)

Neutrality HOLDS for a seed iff the hash sequences are identical through
the day before the lever leg's `firstAttemptDay` (or throughout, if the
lever leg has no attempt). Neutrality FAILS iff `divergenceDay` is
earlier than `firstAttemptDay`, or the legs diverge with zero lever
attempts. A neutrality failure is reported per seed and counts toward
the NO-GO bar below via the recorder-fails-neutrality clause; it does
not silently reclassify the seed.

## Falsified alternatives (pre-registered, band level)

For any band-level pattern claimed, at least one of these must be
falsified on stated evidence (not merely ranked lower):
- (a) Spool-removal cascade: if collapse were Spool removal, non-Spool
  wild fights would persist during shelter. FALSIFIED if wild fights
  of every type collapse during episodes (type breakdown reported).
- (b) RNG reshuffle alone: if RNG alone drove it, tick-opps would not
  collapse specifically aligned to episode starts. FALSIFIED if the
  pre/during opp collapse aligns to episode start AND `shelterSkipped`
  counts are large during episodes (sheltered villagers counted as
  skipped by the tick pre-pass).
- (c) Survival-length artifact: if the collapse were a tail artifact,
  it would not appear inside the shared survival window. FALSIFIED if
  collapse windows fall before `min(baseline, lever gameDays)` on the
  affected seeds.
If no band-level pattern is claimed (e.g. all seeds ABSENT), this clause
is vacuous and the verdict rests on the classification bar alone.

## DIAG-GO bar (judged exactly; no re-scoring mid-run)

DIAG-GO iff ALL of: (1) 8/8 fresh seeds produce a classifiable
trajectory outcome (zero UNCLASSIFIED), (2) at least one falsified
alternative explanation for any band-level pattern claimed, and
(3) recorder neutrality holds on all 8 seeds. NO-GO if >2 trajectories
are unclassifiable OR the recorder fails neutrality (any seed). If the
metric proves wrong, it is written under a "metric review" section and
a revision is proposed for the NEXT run — the verdict is not re-scored.

## Questions to answer (per-seed numbers, not just aggregates)

(a) On how many seeds does early-gate acceleration occur, and by how
    many days (kill day and spawn day separately)?
(b) On how many does a muster/shelter episode follow, how long does
    shelter last, and does the wild-opportunity collapse follow shelter
    (with counts)?
(c) Does the lever leg's end rank understate its peak rank, as on
    87135, and on how many seeds?
(d) Is there any seed where early acceleration is trajectory-SAFE (no
    shelter collapse, end rank >= baseline)?

## Sense check (pre-registered)

Read at least one muster/shelter episode's nearest narrative record
from this band's corpora and judge whether sheltered villagers' behavior
reads as people hiding from a real threat vs a robotic freeze, quoting
briefly. KNOWN LIMIT: the contactfinish recorder's say-line filter
keeps only wave-3-named lines, so the MUSTER beat itself (which names a
wave-4 threat noun) is expected to be ABSENT from `sayLines` — the
nearest record is therefore the episode's surrounding say lines, the
field-fight logs around the episode start, and the shelter state
itself; the gap is stated, not papered over. If the band has zero
muster episodes, the fallback sense-read is the band's first lever
contact-finish transcript, judged for honesty (weapon/damage/remainder)
as in the 0615Z sense reads.

## Calibration note (analyzer definitions vs 0615Z text)

The 0615Z evidence text states lever post-87 wild opportunities 5 and
wild fights 4. Under THIS arm's definitions (sum of all `trajTick`
pre-pass `opps`; wild fights = `caller == 'wild'`), the 87135 lever
corpus gives post-87 opps 8 and wild fights 5, while the baseline gives
exactly the stated 192 opps / 95 wild fights. The delta is definitional
(the 0615Z text's lever window/count is not reproducible from the corpus
under any single window tried: day>88 gives 4 opps / 2 wild fights).
The proof test asserts THIS arm's definitions (baseline 192/95, lever
8/5, shelter episode start 89 max 10, lever peak global day 125 vs end
regional) and the evidence file reports the definitional delta openly.
The conclusion is unchanged under either count: a ~96% collapse.

## Seed freshness (verified BEFORE any judged sim, fullseat method)

Fresh 8 seeds: 91401, 91402, 91403, 91404, 91405, 91406, 91407, 91408.
- Seed-token grep `s9140[1-8]` over evidence/, scripts/, docs/: zero hits.
- Seed-field grep `"seed": 9140[1-8]` over evidence/: zero hits.
- Corpus-filename search for `*9140[1-8]*` under evidence/: zero hits.
- Dated evidence `.md` grep for `9140[1-8]`: zero hits.
- Intersects none of the forbidden bands (73641–73648, 73671–73678,
  the 871xx confirm band, 78201–78208, 76201–76208).
- Bare-number hits for 91401–91408 exist in a handful of old corpora
  ONLY as unrelated numeric values (pantryKcal/freshKcal/totalKcal,
  e.g. `pantryFreshAfter: 91404`, `freshKcal: 91405`), never as seed
  uses — the same caveat the fullseat-recheck prereg records for
  78201–78208. The seed-token grep above is the freshness verdict.

## What this arm does NOT claim

- No trajectory-safety verdict for the contact-finish rule in general
  beyond this 8-seed band; no src/js change, no policy change to the
  judged stack, no merge, no push, no version bump, no live
  verification. Committed on branch sim-trajband-a; coordinator merges.
- No claim that a long shelter is a bug: shelter is working-as-designed
  (auto-muster + shelter cost are documented design); whether its
  duration tuning is intended is a Steve design question.
