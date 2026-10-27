# sim-fallbackfeared-a — first live test of the defiant-door rule (3): PILOT-INCONCLUSIVE (adoption landing)

Run: flesh-out loop, axis scale-onramp. Original worker: sim-fallbackfeared-a
(dead run fleshout-20261027T1430Z). Adoption: run fleshout-20261027T1631Z,
which found the 1430Z run dead by the concurrency guard (lock 121 min old,
worktree heartbeats 95+ min stale), retired its claim, and landed this arm's
work as found. Nothing in the corpus was re-swept or re-scored by the adoption.
Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-fallbackfeared-a-prereg.md (commit f404dbf31).
Corpus: evidence/2026-10-27/perseed-fallbackfeared-a/ (16 per-seed rows +
summary.json), created by the dead worker's pilot sweep, untracked at adoption
and committed by the adoption with this evidence (backup copy held at
goal hidden_files/adopt-1430Z/ until merge). No new policy file, no default
flipped, no src/js touched by this arm — it tests the already-landed
scripts/policies/tablepaths-defiant.js VERBATIM.

Verdict: **PILOT-INCONCLUSIVE** — judged only against the binding prereg.
Zero fallback-feared seatings occurred, so the GO clause (a) cannot be met
and the arm is neither GO nor killed. Per the prereg this is NOT re-scored,
no second band was run as the pilot, and no seeds were cherry-picked to
manufacture a seating.

## Plain words

The defiant-door rule says: if defiance is offered at the table, take it;
otherwise take the first offered door that is not feared; only if feared
alone is offered, take feared — that last case is the "fallback-feared"
seating, and it had never been seen live, only in a unit test. This pilot
gave it its first live chance on 8 fresh villages. It never got the chance:
on every village that reached the table, defiance was offered, so the rule
took defiance every time (6 out of 6). The fallback case needs a village
that reaches the table WITHOUT earning defiance — none of these 8 did.
The rule itself is proven working in the unit test (only-feared offer picks
feared and flags it); the live test simply never met its trigger condition.

## The pilot band (binding design, as pre-registered)

- Seeds 74201–74208, 180d death-aware horizon, one shared baseline
  (tableseat-nowait: LEANLINKRESCUE=1, TABLESEATNOWAIT=1) vs armed
  (same + TABLEDEFIANT=1, tablepaths-defiant.js verbatim).
- Freshness was verified by the dead worker before sweeping (no collision
  with any band used 2026-10-27); the adoption re-checked: 74201–74208
  appear in no other committed evidence file of 2026-10-27.

## Results (per-seed rows, identical seeds both legs)

| seed | baseline entered/won | armed entered/won | armed doorRule | fallbackFeared |
|------|---------------------|-------------------|----------------|----------------|
| 74201 | feared / won | defiant / won | defiant | 0 |
| 74202 | feared / won | defiant / won | defiant | 0 |
| 74203 | — / — | — / — | — | 0 |
| 74204 | feared / won | defiant / won | defiant | 0 |
| 74205 | — / — | — / — | — | 0 |
| 74206 | feared / won | defiant / won | defiant | 0 |
| 74207 | feared / won | defiant / won | defiant | 0 |
| 74208 | feared / won | defiant / won | defiant | 0 |

- Fallback-feared seatings entered: 0/8. Fallback-feared wins: 0.
  GO clause (a) requires >= 1 entered AND won — NOT MET, by absence.
- Cost bar (reported, cannot rescue or sink an inconclusive primary):
  starvation 0 vs 0, arm-only starvation 0, median days 132 vs 132
  (ratio 1.00) — passes. Deaths identical 236 vs 236 on every seed.
- Wall (this band, both legs identical except the door): national ever
  8/8, national final 8/8, entered 6/8, wins 6/8, wave-4 reach 4/8,
  wave-5 0/16, maxArc 4 on 6/8 and 3 on the 2 non-entering seeds.
  All seats lesser; no full seat anywhere on this band.

## Mechanism — why rule (3) never fired

Every armed offer list (dpOffers) contains 'defiant' alongside feared and
others, because defiance was earned on every seated seed (defiance 6–11
on the record: 74201: 11, 74202: 10, 74204: 8, 74206: 8, 74207: 6,
74208: 9). Rule (1) therefore pre-empts rule (3) on all 6 seated seeds.
The two non-entering seeds (74203, 74205) reached national at Arc 3 and
never saw a table offer at all, so no door rule of any kind fired there.
Baseline feared wins (6/6) vs armed defiant wins (6/6) replicate the
1315Z defiantdoor pattern on a fresh band: the door changes, nothing
else does — days, deaths, starvation, and national counts are identical
per seed between legs.

## Proof gates (as pre-registered)

- G1 det-gate: PASSES in both forms post-rebase. Unit form: TABLEDEFIANT
  unset sets no dp counters. Full-sim form (--detgate, seed 74201, run
  by the adoption on the rebased branch): baseline(tableseat-nowait)
  days=137 gameDays=137, armed(TABLEDEFIANT unset) days=137
  gameDays=137, dp={} -> PASS. (The det-gate sim took ~9 min wall time
  under sibling I/O contention; the verdict itself is exact.)
- G2 leak gate: PASSES. On both non-entering seeds, days and gameDays
  are identical between legs (180 / 181 both legs, both seeds) — the
  door assignment changes nothing except the door answered.
- G3 corpus integrity: PASSES. 16/16 rows, every row days > 0 and
  counters present, every armed seated row's fallbackFeared flag
  consistent with its doorRule (defiant -> 0).
- Proof script: scripts/test-fallbackfeared-a.js — ALL APPLICABLE PROOFS
  PASS pre-rebase (unit + corpus; det-gate full-sim skipped without the
  env flag) and re-run post-rebase by the adoption (see below).

## Sense test

No fallback-feared seating occurred, so no seating transcript is claimed
as one — the prereg's sense condition is explicitly unmet, not faked.
The armed defiant seatings on this band read exactly as in 1315Z
(lesser, light, first-option answers); no new dialogue judgement is
offered here.

## Metric review

- The pre-registered metric held with no mid-run re-score. The
  PILOT-INCONCLUSIVE branch was written before the sweep precisely for
  this outcome, and it was followed: no second band, no forced door.
- The metric's weakness, for the NEXT run's prereg (not this one): on
  bands where defiance is routinely earned, rule (3) is structurally
  unreachable — a pilot on such a band can only ever return
  INCONCLUSIVE. A future arm wanting a live rule-(3) firing should
  pre-register a band selected for defiance NOT being offered (e.g.
  seeds screened for low defiance at national, or a substrate where
  the defiant door is unearned), or accept that rule (3) may stay a
  unit-proven rarity. That screening is a new arm's design, not a
  re-score of this corpus.
- Balanced panel (§15): no panel artifact — this arm changes no game
  behavior (policy file already landed, tested verbatim); the
  before/after per-seed comparison above IS the comparison, and the
  instrument's own verdict field (the DEFIANT verdict) was not used
  as this run's verdict, per the prereg.

## Loud failures / deviations (none hidden)

- ADOPTION, not a fresh worker run: the 1430Z coordinator died after
  its worker's sweep (prereg committed, corpus + proof script left
  untracked, no evidence written). The adoption judged the corpus
  as found — it did not re-sweep, because a re-sweep on the moved
  base would be a different corpus, not a verification of this one.
  Corpus integrity (G3) plus exact baseline/armed replication are
  the adoption's verification that the corpus is coherent.
- Post-rebase proof: scripts/test-fallbackfeared-a.js ALL APPLICABLE
  PROOFS PASS on the rebased branch (94dc0505b), including the
  full-sim det-gate above and corpus integrity 16/16. Pre-rebase
  proof was identical except the det-gate full-sim form, which the
  adoption ran only post-rebase.
- No EPERM flap blocked the adoption's commit or rebase. No push, no
  version bump, no live verification — merging to local master is the
  coordinator's job, and this arm reports ready-to-merge, pending
  coordinator.
- Sibling trees untouched (gap-closure trees live during this
  adoption; B-loop trees left alone).

## Files

- Prereg: evidence/2026-10-27/sim-fallbackfeared-a-prereg.md
- Evidence (this file): evidence/2026-10-27/sim-fallbackfeared-a.md
- Corpus: evidence/2026-10-27/perseed-fallbackfeared-a/ (16 rows + summary.json)
- Proof: scripts/test-fallbackfeared-a.js
- Untouched: scripts/policies/tablepaths-defiant.js,
  scripts/policies/tableseat-nowait.js, every src/js file.
