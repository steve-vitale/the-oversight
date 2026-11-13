# sim-scholarschurn-b — scholar churn in the wild (diagnostic census)

Run `fleshout-loop-b-20261112T2130Z` (Loop B, 2026-11-12 15:30 CST).
Arm: sim-scholarschurn-b. Prereg: `evidence/2026-11-12/sim-scholarschurn-b-prereg.md`
(committed with this landing). Tracker blank #6, from pairarming §8:
three scholars died in 19 days on seed 190398, all "the wild", and the
third death ended the wave-5 pair because the dead scholar was a veteran.
Instrument-only diagnostic: zero `src/js` changes.

## Verdict: GO (instrument bar passes) — census reported, no lever emerges

The prereg GO bar is instrument validity only, and it passes on the
corrected corpus: **complete 8/8 seeds, 0 unattributed scholar deaths,
succession coverage 100%, 0 chain violations, 0 instrument errors**
(analyzer exit 0, `scholarschurn-b-summary.json`). The census findings
below are reported; no lever emerged with a mechanism + numbers, so none
is named. The one design-relevant observation is filed separately (the
Reunion mirror pack, below).

## The census (band 190391–190398, competent, 150d death-aware)

| | |
| --- | --- |
| Survived | 1/8 (190395) |
| Wins / national / table | 0 / 0 / 0 |
| Wave-5 reach | 1/8 (190398); wave-4 8/8 |
| Median survival | 137d |
| Scholar deaths | **113 in 1027 scholar-days = 11.0 per 100 scholar-days** |
| Villager (non-scholar) deaths | 553 in 7499 villager-days = 7.37 per 100 villager-days |
| Deaths by location | wild 72, home 41 (64% out in the world) |
| Deaths by cause class | wild-fight 96, contest 4, arena 4, exposure 2, fight 2, other 3, expedition 2 |
| Veteran scholars who died | 26 of 113 (23%) |
| Pellet bearers who died | 2; reactor bearers who died 6 |

Per seed: 190391 11 deaths / 65d (16.9/100d); 190392 14 / 143d;
**190393 23 / 126d (18.3/100d, worst)**; 190394 13 / 128d; 190395 8 /
150d (5.3/100d, best — the survivor); 190396 16 / 140d; 190397 10 /
135d; 190398 18 / 139d.

The scholar dies half again as fast as a villager (11.0 vs 7.37 per 100
days). That is the job, not a defect: the scholar is the one who walks
out to fight, and 96 of 113 deaths are wild fights. Tenure is short
because the mantle moves fast: **median 3 days, mean 9.9, min 1, max
68** (Ruby Callaghan held 68 days on the surviving seed 190395 — a
veteran). Most scholars are brief: a 3-day median tenure means the
village re-learns its leader constantly.

## Successor readiness: the cost of each succession

- Days to re-armed: median 0, but **never re-armed 34/107**.
- Days to first ability: median 0, never 32/107.
- Days to first wave kill: median 1, never 70/107.
- Days lost to churn (summed days-to-armed): 15.
- Scholar-days lived at 0 abilities: 40.

The "never" counts are mostly a cascade artifact, not 34 successors
walking around unarmed: a successor who inherits mid-cascade often dies
the same day (observed 0–1 days), so there is no later snapshot to show
them armed. The median-0 re-arming is real, though: a successor usually
inherits the dead scholar's gear position the same day (the mantle
passes the office, and the successor's own gear is usually already
there). The binding cost is not re-arming — it is the kill: 70 of 107
successors never make a wave kill before they die or the run ends, so
the veteran bar keeps resetting.

## Hold stranding: 0

No scholar death fell on a pair-hold or deferral-hold day
(holdDayDeaths 0, deferralDayDeaths 0, pairEndedAfterDeath 0). The
pairarming worry — a scholar death ending a wave-5 pair — did not
reproduce as hold stranding on this band: the pairs that ended did so
by the veteran dying in the wild, not by a death landing on a hold day.
The veteran-death mechanism is the same (26 veteran scholars died), but
the hold-day coincidence is not the story.

## The finding: cascades, and the Reunion mirror pack

**Same-day cascades are the shape of scholar churn, not an edge case.**
Multi-death days across the band: 190391 d63: 4 deaths, d65: 4;
190392 d57: 3; 190393 d61: 7, d62: 2, d88: 3; 190394 three 2-death
days; 190396 d130: 3; 190398 d138: 6, d139: 3. The surviving seed
190395 has NO multi-death day. When a village collapses, the mantle
passes hand to hand in hours; when it holds, it does not.

**Seed 190393 d61 — seven scholars in one day, all to one pack.**
Larry Price → Pilar Restrepo → Bessie Schuster → Tikhon Anisimov →
Dale Hoffman → Henry Zhang → Jovan Milic → Jesse Cortez, all cause
'the wild', 5 of 7 recorded at home (the deaths happen wherever the
scholar is when the fight finds them — location at death, not where
the pack lives). The fights log for d61 shows why: **the Reunion
pack — The Reunion 1/2/3, 1200–1400 HP each, 60–80 damage — fought
over and over, fresh each time** (its HP resets per fight; nothing
wounds it between scholars). Each new scholar walks out, fights the
same unkillable mirror pack alone, and dies; the next inherits and
does the same. Two more die d62 (Jesse → Lauren → Farid), so the
d61–62 cascade is 9 scholars in 2 days. The last of the seven,
Jovan Milic, was a veteran — the pair dies with him the same way
pairarming's third death ended the wave-5 pair.

What it means: the mirror pack is persistent in the wild (it does not
stay dead or wounded between fights), and villagers have no memory of
it as a thing to avoid — each successor meets it as if new. The
mirror-cap fix (cap the mirror in arena fights) lives on branch
`build-mirror-cap`, NOT on master, and it is arena-only; the wild
mirror pack is a separate surface. This arm names no lever: whether the
wild pack should persist, be avoidable, or be capped is a Steve design
call, and the follow-up mirror-cap panel (decided 2026-11-12) is the
place that question is already queued. Filed in `sim-findings.md`.

## The instrument fix (what the worker left, what I did)

The worker's corpus was complete (8/8 seeds, driver exit 0) but its
succession diff misfired on the two patterns the census itself
measures, so 32 of its 34 instrument errors were diff errors and the
analyzer's succession coverage read 27 uncovered. Root cause, verified
against the raw records:

1. **Same-day cascades:** the old `diffScholarDays` demanded ONE
   same-day wrap record whose successor equalled the snapshot scholar.
   On a cascade day the snapshot is taken mid-day and shows an
   intermediate bearer (d61 shows Tikhon, the 3rd of 7 deaths), so the
   single-record match failed with `succession-mismatch`, and the next
   day's diff failed with `succession-without-death-record` (the chain
   had already moved on).
2. **Sleep-boundary deaths:** a scholar who dies after the day's
   snapshot (during sleep) carries the death day in the wrap record
   while the snapshot transition appears a day later (190397 d28→d29:
   Ella Wallace dies d28, Priya Nair first appears d29). The old diff
   demanded day === snapshot day exactly.

Fix (`scripts/scholarschurn-instrument-20261112.js`, `diffScholarDays`):
follow the CHAIN of wrap records in the whole interval between the two
snapshots — each record's scholarId must equal the previous record's
successorId, starting at the outgoing scholar, until the holder equals
the snapshot scholar — and record the cascade size and intermediate
bearers. A scholar dies once, so a repeated scholarId in the window is
still a double-fire error, and a chain that dead-ends is still a
mismatch. The analyzer's succession coverage got the same treatment
(`scripts/scholarschurn-analyze-20261112.js`): a successor is covered
if they appear on some snapshot at day >= the death day OR they have
their own wrap record (they died as scholar — the wrap only fires for
the sitting scholar).

Re-applied offline (`scripts/scholarschurn-rediff-20261112.js`, no
re-sim — the raw wrap records, snapshots and regDeath rows are
untouched; only the derived `scholarDiffs` and `instrumentErrors` were
recomputed, and the script refuses unless nothing else changes):
**34 errors → 0 across 1002 recomputed diffs** (32 diff errors
resolved, 0 remaining). The analyzer then reads coverage 100% and
exits 0. Census numbers are identical before and after the fix — the
fix changed validity accounting, not the data.

The other 2 errors were PA gear `veterans-mismatch` (replicated 0 vs
engine 1) on the village-loss final days (190392 d143, 190398 d139).
Verified mechanism: on the loss day the roster is empty, so the
replication correctly counts 0 living veterans — but the engine's
`livingVeteranIds()` short-circuits `isLiving(scholarId)` to true
without checking death, so it counts the just-died scholar (James
Okonkwo, wave-4 kill d132; Theodor Eberhard, wave-4 kill d139) as a
living veteran. The engine value is not a valid reference once the
village is lost, so the cross-check does not apply there; the two
errors were dropped in the re-diff under that rule (logged, not
hidden). The divergence is filed in `sim-findings.md` as an engine
observation (terminal-day-only; readiness on a lost village is never
read for gating). No `src/js` change in this arm.

## Proof

- `scripts/test-scholarschurn-b.js`: **124 passed, 0 failed** (was
  115 on the old logic; +9 legs: 7-cascade mid-chain + tail, sleep
  boundary, chain dead-end, cascadeSize/intermediates, analyzer
  sleep-boundary + mid-cascade-bearer coverage). Re-run on the rebased
  tip before landing.
- `scripts/scholarschurn-rediff-20261112.js`: dry-run then `--write`;
  34 → 0 errors, 1002 diffs recomputed, refusal guard held (no other
  key changed).
- `scripts/scholarschurn-analyze-20261112.js`: exit 0, GO (complete,
  unattributed 0, coverage 1.0, chain 0, errors 0).
- Samples cross-check, per the prereg sizing probe: harness
  `samples.deaths` player:true rows count 112 vs 113 wrap scholar
  deaths — the samples neither over- nor under-count consistently
  (the probe's 91-vs-66 overcount was that corpus's shape); the wrap
  is the ground truth and the analyzer never equates them.

## Method (per prereg)

- Base current master `bd29d8bd7` (the r131 roster-check fix is IN —
  verified `ROSTER CHECK` in `src/js/standing.js`); no fix-swap, no
  leg guard. Band 190391–190398 intentionally reused (same band as
  r9/r10/pairarming, for comparability — prescribed, not a freshness
  violation). Competent policy, 150d death-aware.
- The wrap count (113) vs the prev-day regDeath rule (66 on the same
  band in the sizing probe) shows why the wrap was needed: the
  prev-day rule collapses each cascade into a single death.
- Telemetry deviation check: attempted on the census corpus —
  `telemetry-check.js` refused recorder-corpus input ("all 8
  --current rows carry top-level anchorCommit, so they are sweep
  recorder rows, not runs"), the known refusal class; recorded, not
  waived. No baseline update.
- No `src/` change (verified: `git diff` touches `scripts/` +
  `evidence/` only).

## Metric review

- The old diff's single-record assumption was the instrument's
  mistake, not the game's: cascades and sleep-boundary deaths are
  normal play, and the diff has to follow chains. The fix is in the
  instrument, the proof, and the analyzer — the corpus needed no
  re-sim.
- The analyzer's old one-link chain fallback (which covered the
  190391 d47 double succession) is replaced by the general rule
  (snapshot appearance OR own wrap record). The d47 case still passes.
- The gear cross-check's loss-day skip is a scope rule (the engine
  value is undefined after loss), not a waived error — the two
  dropped errors are logged in the re-diff output and here.
- Snapshot gaps: 1 per seed (190397: 2) — the loss-day duplicate
  flush the analyzer dedups. No effect on the verdict.

## Convergence

Axis: scholar churn in the wild (tracker blank #6). State:
**diagnostic census — GO on the instrument bar, findings reported**.
No lever named; the Reunion mirror-pack observation goes to
`sim-findings.md` for the mirror-cap follow-up. The census closes
blank #6.
