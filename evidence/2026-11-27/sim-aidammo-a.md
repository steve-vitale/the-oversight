# sim-aidammo-a — RE-ANALYSIS: the published numbers stand under the fixed analyzer

**Verdict: GO — the published aidammo verdict survives the fix, number for number.**
**Arm:** sim-aidammo-a (re-analysis) · **Loop A run:** fleshout-20261127T2215Z · **Axis:** scale-onramp
**Prereg:** `evidence/2026-11-27/sim-aidammo-a-prereg.md` (frozen 2026-11-27 ~23:38 UTC, before any judged re-run)
**Re-analysis:** `evidence/2026-11-27/aidammo-a-reanalysis.json` · **Corpus:** `evidence/2026-11-24/perseed-aidammo-a/` (8 seeds, committed, read-only)
**Proof:** `scripts/test-aidammo-a-rerun.js` → **23/23 PASS**
**Branch:** `sim-aidammo-a` · **Base:** `8ee234ccc`
**Instruments:** `scripts/analyze-aidammo-a.js` (fixed, commit b19d368d3), `scripts/test-aidammo-a-rerun.js` (new)
**Original verdict under test:** `evidence/2026-11-24/sim-aidammo-a.md` + `evidence/2026-11-24/aidammo-a-analysis.json` (commit e694593f7)

## §0 The question, in plain words

The craftgate run fixed a bug in the ammunition analyzer: it filed every fighter
under their name alone, and names repeat across villages, so two different people
with the same name got merged into one. On the craftgate band that hid a whole
fighter who never got ammunition. The worry was that the big published finding —
that villagers making arrows at home supply 85 of every 100 arrows a fighter
holds when meeting a wave-4 monster — had been measured with the buggy tool and
might be wrong. This arm re-ran the fixed tool over the exact same eight villages
and checked every published number again.

**Short answer: every published number is exactly right.** The headline 0.849, the
0.577 ammo-at-entry rate, the delivery figures, the 131-of-149 never-supplied
split — all reproduce bit-for-bit under the fixed analyzer. The bug was real but
it never touched this band's numbers: the entry figures come from the fight rows
themselves, and on these eight villages no delivery judgement ever depended on a
merged namesake. The village looks exactly the same as the original arm reported.

## §1 Verdict — judged only against the frozen prereg §2 bars

| Bar (prereg §2) | Result | Pass |
|---|---|---|
| B1 — dominant share within 0.005 of 0.849 | **0.8491027732463295 (exactly equal)** | ✅ |
| B2 — mechanism rate within 0.005 of 0.577 | **0.5767045454545454 (exactly equal)** | ✅ |
| B3 — attribution completeness ≥ 0.99 | **1.000 (exactly equal)** | ✅ |
| B4 — original verdict bars still pass (pool ≥ 10; attribution ≥ 0.90; dominant ≥ 0.50) | pool 21; attribution 1.000; dominant 0.849 | ✅ |
| B5 — instrument clean (8/8 files, 0 errors) | 8 valid, 0 errors | ✅ |
| B6 — determinism (second pass identical) | identical analysis JSON | ✅ |
| **Verdict** | **GO** | ✅ |

## §2 Corrected numbers vs published — delta zero everywhere it matters

| # | Figure | Published | Corrected | Delta |
|---|---|---|---|---|
| P1 | Dominant share, home-duty at wave-4+ entry | 0.849 (1041/1226) | 0.849 (1041/1226) | **0** |
| P2 | Ammo-at-entry, lead + allies | 0.577 (203/352) | 0.577 (203/352) | **0** |
| P2a | Ammo-at-entry, capable-only (spears excluded) | 0.657 (203/309) | 0.657 (203/309) | **0** |
| P2b | Ammo-at-entry by origin: aid / expedition / world-tick | 0.597 / 0.586 / 0.562 | 0.597 / 0.586 / 0.562 | **0** |
| P3 | Attribution completeness | 1.000 (1226/1226) | 1.000 (1226/1226) | **0** |
| P4 | Delivery, home-duty batches | 92/123 (75%), 460/615 units | 92/123 (75%), 460/615 units | **0** |
| P5 | Delivery, departure-craft batches | 18/25 (72%), 90/125 units | 18/25 (72%), 90/125 units | **0** |
| P6 | Delivery, departure pile stones batches | 15/21 (71%), 65/94 units | 15/21 (71%), 65/94 units | **0** |
| P7 | Empty fighters: never received a batch / spent one | 131 / 18 of 149 | 131 / 18 of 149 | **0** |
| P8 | Pool: pair-inclusive engaged wave-4+ meetings | 21 | 21 | **0** |
| — | Production ledger (batches/units by source) | 123/615 home-duty; 25/125 departure-craft; 21/94 pile; 5/5 starting kit; 1/1 other | identical | **0** |

A whole-analysis field-by-field diff (proof test §8) finds **zero** differing
fields between the published and corrected analysis JSON outside the
`meetingsByVid` key format itself — which changed by design (see §3).

## §3 What the fix actually changed on this band

The only difference in the corrected output is the shape of the per-fighter
meeting index:

- Published: `meetingsByVid` keyed by bare vid — **91 keys**.
- Corrected: keyed by `(seed,vid)` — **101 keys**.

**10 name collisions on the aidammo band** (craftgate's band had 11): ingrid_vik
(110501, 110503), amina_diallo (110501, 110504), giulia_bianchi (110502, 110507),
tariq_mahmood (110502, 110508), ivy_wang (110502, 110508), jorge_silva
(110503, 110506), grace_obi (110503, 110504), rosa_mendez (110503, 110508),
nadia_khoury (110504, 110505), omar_farouk (110505, 110507).

The fix mattered in principle and not at all in outcome here. Why the numbers
did not move, in the analyzer's own terms (verified by reading the code before
freezing, and confirmed by the zero-diff):

- P1–P3 and the production ledger never pass through the per-fighter index:
  entry provenance is read straight off the fight rows, and production is
  counted straight off the ledger events. The fix could not move them.
- Delivery (P4–P6) does read the index — but a delivery judgement only flips
  when a batch's recipient has a namesake in another seed who met a wave-4
  monster holding source-matching units on or after the batch day. On these
  eight villages that never happened: every delivered/not-delivered call came
  out the same under both keyings.

## §4 The empty-fighter split (P7) — recomputed, and why it reproduces exactly

The 131/149 split is not in the analyzer JSON, so it was recomputed from the
corpus under the fixed scoping (proof test §7). Method, frozen in the prereg:
for each wave-4+ meeting row (lead + allies) with a ranged weapon and
ammoAtEntry == 0, the fighter counts as never-supplied when no production event
exists for that `(seed,vid)` on or before the meeting day.

- Fixed scoping: **131 never / 18 spent of 149** — exactly the published figures.
- Sensitivity check (same rows, BUGGY bare-vid scoping): **119 never / 30 spent**.
  The test can see the bug — the buggy keying would have under-counted the
  never-supplied by 12 rows. The published 131 matches no bare-vid variant
  (ever: 104/45; on-or-before meeting day: 119/30), so the original §3b
  derivation was evidently already scoped per village; the bug never
  contaminated it.

Two honest caveats on the split, both inherited from the original derivation
and unchanged by the re-run:

- The 149-row denominator counts meeting rows, not distinct people (40 distinct
  (seed,vid) fighters account for the 149 empty rows; six villagers were empty
  at more than one meeting, per the original evidence). The row framing is the
  published one and is kept for comparability.
- The 149 rows include 25 spear rows — spear carriers need no ammunition, so
  they are empty-quivered only in the bookkeeping sense. Capable-only
  sensitivity: 124 empty rows, **96 never / 28 spent** under fixed scoping
  (81/43 under buggy scoping). The coverage story is the same either way: most
  empty fighters never had a batch.

## §5 Sense-testing — the village looks the same

The sharpest collision on the band is Ingrid Vik. Seed 110501's Ingrid is one of
the two bow carriers in the village that made nothing in 150 days: 11 empty
meetings, never a single arrow — the original evidence names her. Seed 110503's
Ingrid is a different person who met a wave-4 monster holding 5 home-duty
arrows. The buggy index merged them into one "ingrid_vik" who looked supplied
at one meeting and empty at eleven. The fixed index keeps them apart — and the
band totals do not move, because 110503's Ingrid was already counted as supplied
in the fight-row figures, and 110501's Ingrid was already counted as empty there.
The merge corrupted only the index, never the ledger's verdicts. No fighter's
story changes: the same people walk out empty, the same home-duty batches reach
the same fights.

## §6 Metric review

- **Primary metric** (dominant share home-duty at entry): 0.849, exactly equal
  to published, within the frozen ±0.005 tolerance. GO.
- **Secondary metrics:** mechanism rate, attribution, delivery, pool, and the
  empty split all reproduce exactly. No re-scoring happened: the bars were
  frozen before the re-run and judged as frozen.
- **What this re-analysis does not do:** it does not re-run sims (no fresh band
  — the corpus was sufficient, all 8 files present and valid), it does not
  change any game code or any verdict bar, and it does not close finding #2544
  (the 0.70 ammo-at-entry bar is still missed at 0.577 — the re-run confirms
  the miss is real, not an instrument artifact).
- **§15 panel:** not applicable (single-leg re-analysis, no before/after game
  change) — stated in the prereg.
- **Findings entry:** the 2026-11-27 aidammo entry in
  `hidden_files/sim-findings.md` (claimed by this arm) can now be marked
  `fixed` — the re-run is done and the numbers stand. (Coordinator: mark it;
  this worktree does not own the findings file.)

## §7 Proof (how to reproduce)

- Analyzer selftest (fixed): `node scripts/analyze-aidammo-a.js --selftest` → **30/30 PASS**.
- Instrument proof (unchanged): `node scripts/test-aidammo-a.js` → **38/38 PASS**.
- Re-run proof: `node scripts/test-aidammo-a-rerun.js` → **23/23 PASS** (corpus
  hash vs frozen prereg; two analyzer passes identical; committed re-analysis
  matches a fresh pass; B1–B6; delivery unchanged; 101 (seed,vid) keys;
  P7 131/18 fixed vs 119/30 buggy; whole-analysis zero-diff outside the
  index keys).
- Re-run command: `node scripts/analyze-aidammo-a.js --dir evidence/2026-11-24/perseed-aidammo-a --out evidence/2026-11-27/aidammo-a-reanalysis.json` → DIAG-GO DOMINANT-SOURCE, run twice, outputs identical.
- Corpus md5-list hash (frozen in prereg): `f41ffd706a5df8d1bcf70ed4e2acaa99`.

## §8 Canon

No canon doc covers ammunition supply specifically (CANON.md, MONSTER-WAVES.md,
BALANCING.md read; recorded in the prereg, not invented). Nothing in this
re-analysis changes canon. No game code touched — instruments + evidence only.

## §9 Infrastructure notes

- Write-flap: probes (`git update-ref refs/heads/probe HEAD`) passed before the
  prereg write, before the proof/re-analysis commit, and before this evidence
  commit. No flap window hit this run.
- Safe-commit clobber struck on BOTH commits this run (prereg; proof +
  re-analysis): committed files showed as staged-deleted + untracked in the
  main index. Repaired each time with
  `git ls-tree HEAD -r -- <paths> | git update-index --add --index-info` and
  verified `git status --short` empty + `git diff HEAD` empty. Expect it on
  the evidence commit too.
- `node scripts/check.js --quick`: **337 passed, 7 failed in 1066s** (finished
  ~00:06 UTC 2026-11-28, after the evidence was first committed — this line
  amended to record the result). The visible failures are 120s timeouts in
  godpath deed-attainment / observer-neutrality tests
  (test-one-person-army-deed-attainment.js, test-trust-observer-neutrality.js,
  test-living-garden-deed-attainment.js — the three slowest, each exactly
  120s), i.e. slowness under the heavy load at run time, not assertion
  failures; the full failure list was not captured (output was tailed). This
  arm touches no game code (new proof script + evidence + re-analysis JSON
  only; the new proof script is not on the green list), so these timeouts
  are unrelated to this arm's change — but the quick check did NOT come back
  fully green, and the coordinator should confirm the 7 failures are the
  known load-timeout shape at merge time.
- No jest run on this arm (no game code touched; analyzer + proof are plain node scripts).
