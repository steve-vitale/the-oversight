# sim-defnoffer-screen-a — defiance-not-offered screen: SCREEN-NEGATIVE

Run: flesh-out loop, axis scale-onramp. Worker: sim-defnoffer-screen-a
(run fleshout-20261027T1715Z).
Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-defnoffer-screen-a-prereg.md (commit 05f4b603b).
Corpus: evidence/2026-10-27/perseed-defnoffer-screen-a/ (48 per-seed
rows + summary-band-A/B/C.json; summary.json itself is band C's copy —
the per-band copies are authoritative). Proof:
scripts/test-defnoffer-screen-a.js — ALL APPLICABLE PROOFS PASS
(--require A,B,C). No new policy file, no default flipped, no src/js
touched — DIAG / MEASUREMENT ONLY. The reused sweep instrument
(scripts/test-tablepaths-defiant-sweep.js) and both policies
(tableseat-nowait baseline, tablepaths-defiant armed) were used
verbatim via env only.

Verdict: **SCREEN-NEGATIVE** — judged only against the binding prereg.
No candidate band qualified, so Phase 2 was never run, no live
fallback-feared test was forced, and no band beyond the three
pre-registered ones was screened. Rule (3) (fallback-feared) stays
unit-proven only, exactly as after the 1631Z pilot.

## Plain words

The last pilot could not test the "only feared is offered, take
feared" rule because every village that reached the table had already
earned defiance, so the rule took defiance instead. This run hunted
for villages that reach the table WITHOUT earning defiance, across
three fresh batches of eight villages. It found none: every village
that sat down had earned defiance (scores of 5 to 13, where 4 is
enough), so defiance was offered every single time. The screen did
not fail sloppily — it ran all three batches to completion and the
count of villages reaching the table without defiance was zero in
each. The rule itself is still untested live, and the hunt needs a
different kind of village, not just more fresh villages on the same
path (see Metric review).

## The screen (binding design, as pre-registered)

- Three candidate bands, screened IN ORDER, each a full paired sweep
  (baseline + armed, identical seeds, 180d death-aware horizon):
  Band A 74601-74608, Band B 74801-74808, Band C 75701-75708.
- Freshness verified before sweeping: grep of evidence/2026-10-27/
  found ZERO hits for any seed in bands A, B, or C. Seeds
  74201-74208 were NOT re-swept or re-scored.
- Qualifying-band definition: seated >= 3 AND >= 2 seated seeds with
  defiance NOT offered ('defiant' absent from the paths-phase offer
  list). Screening stops at the first qualifying band; a
  non-qualifying band's fallback-feared count is recorded but NEVER
  judged (anti-cherry-picking rule, followed: no band qualified, so
  no Phase 2 judgement exists at all).

## Results

| band | seated (armed) | no-defiance seated | qualifies? | fallback-feared |
|------|---------------|--------------------|------------|-----------------|
| A 74601-74608 | 5/8 | 0 | NO (needs >= 2) | 0 |
| B 74801-74808 | 1/8 | 0 | NO (needs seated >= 3 AND >= 2) | 0 |
| C 75701-75708 | 3/8 | 0 | NO (seated minimum met, needs >= 2) | 0 |
| TOTAL | 9/24 | 0/9 seated | — | 0 |

Every seated armed row took rule 'defiant' (defiance offered, picked
defiant, won). Defiance values on the record at seating: A: 7, 9, 7,
5, 13; B: 8; C: 11, 8, 8 — all comfortably above the >= 4 threshold.
No seated row shows rule 'fallback-non-feared' or 'fallback-feared';
no no-defiance seated seed exists anywhere in the screen to even
reach rule (2), let alone rule (3).

Per-seed detail (armed leg; baseline identical except the door —
baseline entered feared on every seed the armed leg entered defiant
on, and won on the same seeds):

- Band A: seated 74602, 74604, 74605, 74606, 74608 (all defiant/won);
  non-seated 74601 (reached global rank, no table offer), 74603
  (survived to horizon, no table offer), 74607 (lost village, never
  national).
- Band B: seated 74801 only (defiant/won); non-seated 74802, 74803,
  74804, 74806, 74807, 74808 — including 74805, dead day 22 with 3
  starvation deaths, the screen's only early collapse.
- Band C: seated 75702, 75705, 75706 (all defiant/won); non-seated
  75701, 75703, 75704, 75707, 75708.

## Wall numbers (armed legs; baseline identical except door)

| band | national ever | national final | table | wins | wave 4 | wave 5 | median days |
|------|--------------|---------------|-------|------|--------|--------|-------------|
| A | 7/8 | 7/8 | 5/8 | 5/8 | 7/8 | 0/8 | 145 |
| B | 7/8 | 5/8 | 3/8 | 1/8 | 3/8 | 0/8 | 180 |
| C | 7/8 | 5/8 | 4/8 | 3/8 | 4/8 | 0/8 | 180 |
| TOTAL | 21/24 | 17/24 | 12/24 | 9/24 | 14/24 | 0/24 | — |

All seats lesser; NO full seat anywhere on any band (all 9 armed
seatings lesser, all 9 baseline seatings feared/lesser). Wave 5
reach is 0/24, as in every scale-onramp band so far. Starvation
totals (both legs identical per seed): A 1, B 6, C 0 — the door
changes nothing about starvation, days, or deaths on any seed, which
is the leak-gate result, not a finding about the door.

## Proof gates (as pre-registered)

- G-screen: PASS on all three bands (16/16 rows each, no zero-day
  rows, counters present; the reused sweep's G3).
- G-offer: PASS on all 9 seated armed rows (proof script): every
  'defiant'-rule row shows 'defiant' in its offer list and picks
  defiant, every earned snapshot's defiant.earned matches offer
  inclusion, every fallbackFeared flag matches its doorRule (all 0).
  No seated row exists for the fallback branches to check against —
  that absence IS the screen result, not a gap in the check.
- G-leak: PASS on all three bands (non-seated seeds identical
  days/gameDays between legs: A 3/3, B 7/7, C 5/5 comparable seeds).
- Det-gate: NOT re-run, per prereg (delegation proof for this exact
  verbatim policy already passed in 1631Z; nothing here changes the
  policy).
- Proof script: scripts/test-defnoffer-screen-a.js, run with
  --require A,B,C: ALL APPLICABLE PROOFS PASS, first qualifying
  band NONE.

## Sense test

No fallback-feared seating occurred, so no seating transcript is
claimed — the prereg's sense condition is explicitly unmet, not
faked. (No --sense replay was run as a seating, because there is no
seating to replay.) The defiant seatings on these bands read exactly
as in 1315Z/1631Z (lesser, light, first-option answers); no new
dialogue judgement is offered here.

## Metric review

- The pre-registered metric held with no mid-run re-score. The
  SCREEN-NEGATIVE branch was written before the sweep precisely for
  this outcome, and it was followed: all three bands screened, none
  qualified, no fourth band, no forced door, no re-scoring of
  74201-74208.
- What the screen actually learned (for the NEXT run's prereg, not
  this one): under the leanlinkrescue courtship substrate, ledger
  defiance at seating time is not marginal — it is 5-13 against a
  threshold of 4, on 9/9 seated seeds here and 6/6 in 1631Z. The
  single known no-defiance seated seed in this whole line (74106,
  defiance 3) is the outlier, not the pattern. Fresh seeds on this
  substrate are therefore a poor screen: the expected no-defiance
  rate is ~1 in 19 seated seeds across the defiantdoor-era bands
  (74101, 74111, 74201, plus these three), so a future screen needs
  a DIFFERENT substrate — e.g. a courtship/policy that earns less
  defiance (fewer refusals/declines on the record), or a band
  deliberately built around low-defiance play — not a fourth batch
  of the same seeds. Whether such a substrate exists among the
  already-landed policies, and whether a low-defiance seating would
  still be a fair rule-(3) test, is the next arm's design question.
- A second weakness, also for the next run: the seated minimum (3)
  and the no-defiance minimum (2) interact harshly on low-seating
  bands — band B (1 seated) could never qualify no matter what its
  one seating showed. A future prereg might screen on seated seeds
  pooled differently, but that revision must be written BEFORE its
  sweep, not applied retroactively to these bands.
- Balanced panel (§15): no panel artifact — scripts/balance-panel.js
  has NO corpus-ingest mode for this corpus (its modes are its own
  observer/compare; no per-seed-corpus ingest flag exists), so none
  was produced and none faked. The before/after per-seed comparison
  above IS the comparison, as in 1631Z. The reused sweep's own
  VERDICT field on each band (GO, on defiant entered) is the DEFIANT
  verdict and was NOT used as this run's verdict.

## Findings note (for the coordinator; NOT acted on)

- Scale wall, unchanged: national ever 21/24 but table 12/24, wins
  9/24, full seat 0/24, wave 5 0/24. Villages reach national
  routinely and even reach global rank without ever seeing a table
  offer (74601, 74603, 75704 armed) — rank and seating remain
  decoupled, as in prior bands.
- Band B's 74805 (dead day 22, 3 starvation deaths, never left
  village rank) is the screen's only early collapse; it is a
  food-economy data point for the axis, not this arm's target, and
  was not investigated further.

## Loud failures / deviations (none hidden)

- The safe-commit index clobber class (AGENTS.md, 2026-10-22/23)
  struck the prereg commit: HEAD held the correct 173-line prereg
  while the main index showed a bogus staged deletion. Repaired the
  same way as documented (`git update-index --add --cacheinfo` with
  the HEAD blob), then verified `git status --short` empty,
  `git diff HEAD` empty, and hash-object == HEAD blob before any
  sweep started. The judged sweeps ran AFTER the repair, on a clean
  tree, with the prereg already committed.
- No EPERM flap blocked any commit or sweep write. No push, no
  version bump, no live verification — merging to local master is
  the coordinator's job, and this arm reports ready-to-merge,
  pending coordinator.
- Sibling trees untouched; no other worktree or registry entry
  touched.

## Files

- Prereg: evidence/2026-10-27/sim-defnoffer-screen-a-prereg.md
  (committed 05f4b603b, before any judged sweep)
- Evidence (this file): evidence/2026-10-27/sim-defnoffer-screen-a.md
- Corpus: evidence/2026-10-27/perseed-defnoffer-screen-a/ (48
  per-seed rows + summary-band-A/B/C.json; summary.json = band C)
- Proof: scripts/test-defnoffer-screen-a.js
- Untouched: scripts/policies/tablepaths-defiant.js,
  scripts/policies/tableseat-nowait.js,
  scripts/test-tablepaths-defiant-sweep.js, every src/js file.
