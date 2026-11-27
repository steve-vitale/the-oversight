# sim-aidammo-a — RE-ANALYSIS prereg (frozen before any judged re-run)

**Arm:** sim-aidammo-a (re-analysis) · **Loop A run:** fleshout-20261127T2215Z · **Axis:** scale-onramp
**Frozen:** 2026-11-27 ~23:38 UTC, before the fixed analyzer is run over the corpus.
**Question:** the craftgate run (evidence/2026-11-27/sim-craftgate-a.md, commit
b19d368d3) fixed a name-collision bug in `scripts/analyze-aidammo-a.js` — per-fighter
maps were keyed by bare vid, a NAME-based id recurring across villages, and 11
collisions on the craftgate band hid one never-supplied fighter (7 → 8). The fix is
analyzer-only and landed with regression cases (selftest 30/30, proof 38/38 on merged
master — re-verified green in this worktree before freezing). BUT the landed aidammo
verdict — home-duty supplies 0.849 of ammo at entry — was produced with the BUGGY
analyzer on its own band. This arm re-runs the FIXED analyzer over the committed
aidammo corpus and confirms whether the 0.849 / delivery numbers stand.

**Published numbers under test** (evidence/2026-11-24/sim-aidammo-a.md,
evidence/2026-11-24/aidammo-a-analysis.json, commit e694593f7):

| # | Published figure | Value |
|---|---|---|
| P1 | Dominant share, home-duty at wave-4+ entry | 0.849 (1041/1226 units) |
| P2 | Ammo-at-entry, lead + allies, all origins | 0.577 (203/352) |
| P3 | Attribution completeness | 1.000 (1226/1226 units; unknown 0) |
| P4 | Delivery, home-duty batches reaching a meeting | 92/123 (75%), 460/615 units |
| P5 | Delivery, departure-craft batches | 18/25 (72%), 90/125 units |
| P6 | Delivery, departure pile stones batches | 15/21 (71%), 65/94 units |
| P7 | Empty fighters at wave-4+ entry | 149 total; 131 never received a batch, 18 spent one |
| P8 | Pool: pair-inclusive engaged wave-4+ meetings | 21 |

**Corpus (committed, read-only for this arm — no fresh sim band):**
`evidence/2026-11-24/perseed-aidammo-a/` — 8 files, seeds 110501–110508:

| File | Bytes |
|---|---|
| aidammo-a-s110501-aidammo-a-diag.json | 4,353,286 |
| aidammo-a-s110502-aidammo-a-diag.json | 3,674,709 |
| aidammo-a-s110503-aidammo-a-diag.json | 4,329,028 |
| aidammo-a-s110504-aidammo-a-diag.json | 3,236,387 |
| aidammo-a-s110505-aidammo-a-diag.json | 1,791,687 |
| aidammo-a-s110506-aidammo-a-diag.json | 5,950,547 |
| aidammo-a-s110507-aidammo-a-diag.json | 4,454,138 |
| aidammo-a-s110508-aidammo-a-diag.json | 2,321,301 |

Corpus md5-list hash (sorted per-file md5s): `f41ffd706a5df8d1bcf70ed4e2acaa99`
(recorded 2026-11-27 23:38 UTC; re-checked by the proof test before the re-run).

## §1 What the fix can and cannot move (frozen reasoning, before the re-run)

Reading the fixed analyzer before freezing: `dominantShare`, `unitsAtEntryBySource`
and the mechanism rate come from `ammoAtEntryAll()` — encounter rows read directly,
never through `meetingsByVid`. The fix scopes only `meetingsByVid` (per-fighter meeting
index) and the delivery matching that reads it. So the EXPECTATION, frozen here, is:

- P1, P2, P3 (entry provenance): **unchanged exactly** — the fix does not touch
  their computation path.
- P4–P6 (delivery): **may move** — delivery matching is exactly the code the fix
  changed; a namesake batch in one seed could previously count as delivered
  against a namesake's meeting in another seed.
- P7 (empty / never-supplied split): **may move** — the 131/149 split was derived
  from the per-fighter meeting/production index; a namesake's production event
  could previously mark a never-supplied fighter as supplied (the craftgate
  band's 7 → 8 is the precedent).
- P8 (pool): unchanged — meeting counting does not use the per-fighter index.

The expectation is a prediction, not a verdict: the re-run is judged only
against the bars in §2.

## §2 Frozen GO bars (judge only against these)

| Bar | Condition | Verdict if missed |
|---|---|---|
| B1 — dominant share stands | \|corrected P1 − 0.849\| ≤ 0.005 | NO-GO, verdict does not survive |
| B2 — mechanism rate stands | \|corrected P2 − 0.577\| ≤ 0.005 | NO-GO, verdict does not survive |
| B3 — attribution stands | corrected P3 ≥ 0.99 | NO-GO, verdict does not survive |
| B4 — original verdict bars still pass | corrected numbers still pass the four bars of the original prereg (pool ≥ 10; attribution ≥ 0.90; dominant ≥ 0.50) | NO-GO, verdict does not survive |
| B5 — instrument clean | all 8 corpus files parsed, 0 instrument errors | NO-GO (instrument), re-run invalid |
| B6 — determinism | second analyzer pass over the same corpus reproduces the same numbers (identical analysis JSON) | NO-GO (instrument), re-run invalid |

**Delivery (P4–P6) and the empty split (P7) are report-only, never verdict bars:**
whatever they correct to is reported with its delta from the published figures,
and if they move, the evidence says plainly what changed about the village
(who was supplied, who walked out empty). A delivery move does not overturn the
DIAG-GO by itself — the verdict bars are B1–B4 — but a delivery move that drops
home-duty delivery below 0.50 of batches would be named in the evidence as a
finding against the published "three quarters reach a fight" reading.

**Verdict:** GO iff B1–B6 all pass. Otherwise NO-GO with kind
(verdict-does-not-survive / instrument).

## §3 Method (frozen)

1. Verify the analyzer run IS the fixed one: `scripts/analyze-aidammo-a.js`
   carries the `(seed,vid)`-scoped `meetingsByVid` (commit b19d368d3, ancestor
   of this worktree's HEAD) and its selftest passes 30/30 and
   `scripts/test-aidammo-a.js` passes 38/38 in this worktree — both verified
   BEFORE freezing (23:38 UTC).
2. Run the fixed analyzer over the committed corpus:
   `node scripts/analyze-aidammo-a.js --dir evidence/2026-11-24/perseed-aidammo-a
   --out evidence/2026-11-27/aidammo-a-reanalysis.json` — twice, into two
   outputs, and diff them (B6).
3. Recompute the empty-fighter split (P7) from the FIXED index: distinct
   (seed,vid) fighters with ammoAtEntry == 0 at a wave-4+ meeting, split by
   whether any production event exists for that (seed,vid) in that seed's
   ledger. Implemented in the proof test, not by hand.
4. Proof test `scripts/test-aidammo-a-rerun.js`: runs the fixed analyzer over
   the committed corpus, asserts 8/8 files parsed with 0 errors, asserts the
   corrected numbers, asserts determinism across two passes, and asserts the
   frozen bars. (The existing `scripts/test-aidammo-a.js` is the instrument
   proof, 38/38 — it is NOT modified; the re-run proof is a new file.)
5. No fresh sim band. If the re-run shows the corpus is insufficient to
   answer (files missing, coverage too thin), the report says so and no fresh
   band is spun up without a frozen prereg for it.
6. §15 panel: not applicable (single-leg re-analysis, no before/after game
   change) — same as the original arm.

## §4 Canon

No canon doc covers ammunition supply specifically (CANON.md, MONSTER-WAVES.md,
BALANCING.md read; recorded in the original prereg, not invented). Arrow-crafting
is a human skill, never an alien ability. Nothing in this re-analysis changes
canon. No game code is touched by this arm — instruments + evidence only.

## §5 Metric review (to be filled at evidence time)

- (filled in evidence/2026-11-27/sim-aidammo-a.md after the re-run)
