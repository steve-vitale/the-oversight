# sim-xphalf-rejudge-b — prereg

**Arm:** sim-xphalf-rejudge-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0245Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3), bisect follow-up · **Findings:** #1901 · **Branch:** sim-xphalfrej-b · **Prereg committed before any judged gate run.**

## The question

The 0214Z run's sim-xphalf-b came back **NO-GO METRIC-BROKEN**: its C1 reproduction bar's first-death leg (no death before d28) fails on 5/8 seeds — but that leg mis-quotes bisect §1 (an L0 sentence with no C1 per-seed table behind it; findings #1901). This run re-judges the XP-half early deaths under the **corrected C1 bar** and judges nothing else.

## Corpus status (checked before this prereg)

The P1/C1 corpora live only in `/tmp` (uncommitted): `/tmp/xphalf-c1/` and `/tmp/xphalf-p1/`, each 8 doorwalk-baseline files + `CONSTRUCTION.txt`, plus `/tmp/xphalf-analysis.txt` and the sweep logs. Integrity verified before this prereg: all 16 files parse as JSON, all non-zero size (the 0-byte P1 53008 file from the 0013Z EPERM flap was re-run by the 0214Z run and is now 545,380 bytes). `/tmp/xphalf-damaged.txt` holds the C1↔C2 diff file list (36 paths — the xp-gear landing's changed files), not corpus damage; no corpus file is listed as damaged. **If any file fails to parse, is missing, or fails the anchor check in the gate, the run re-runs the C1/P1 sweeps on the frozen band 53001–53008 with the same driver/policy — it does NOT judge a partial corpus.** If /tmp was wiped, that is reported plainly and the sweeps are re-run.

Constructions (from the CONSTRUCTION.txt files, verified against the bisect):
- **C1 = checkout `16369893c`, no modification.** Anchor `16369893cd64` in every corpus file.
- **P1 = checkout `50881fbf2` (C2), then restore `src/data/items.json` from `16369893c` (C1).** Anchor `50881fbf2f64`.

## The corrected C1 bar (in full — this is the judge)

**C1 reproduction (vs the bisect's C1 table, `evidence/2026-11-07/sim-frozenband-bisect-b.md` §C1→C2):**

| Seed | Days | Seat/sat | Standing | w4 kills |
|---|---|---|---|---|
| 53001 | 150 | — | 175 | 0 |
| 53002 | 79 | — | 125 | 0 |
| 53003 | 150 | lesser d90 | 344 | 3 |
| 53004 | 150 | lesser d94 | 260 | 2 |
| 53005 | 97 | lesser d90 | 230 | 3 |
| 53006 | 150 | lesser d90 | 849 | 8 |
| 53007 | 86 | — | 99 | 0 |
| 53008 | 150 | lesser d90 | 199 | 0 |

Plus: **median 150d, sits 5/8.** (Note: the xphalf-b prereg's C1 reference said "53006 sat d93" — that was L0's sat day mis-quoted; the bisect's C1 table says lesser d90, which is what the bar above uses.)

**P1 reproduction (unchanged from the 0214Z bar):** three early-death days exactly **45/62/55** (53003/53005/53007), **median 150d, sits 4/8**.

**The first-death leg is DROPPED ENTIRELY and never re-registered** (findings #1901): the exactly-reproduced C1 corpus has first deaths at d10/d13/d18/d19/d22 on 5/8 seeds, three shared with P1 on the same seed, day, and person (53001 d22 Sanjay, 53004 d19 Fritz, 53008 d10 Dieter) — early deaths are shared pre-divergence trajectory, not a property the healthy contrast lacks. The gate test asserts this fact as a regression check (C1 first deaths before d28 on exactly 53001/53004/53005/53007/53008) and contains **no** first-death ≥ d28 assertion. Do NOT substitute a living-at-d60 leg without checking it against the C1 corpus first: C1 53007 also thins to living 4 by d60, the same as P1 53007.

## Seeds, horizon, policy

- **Seeds:** 53001–53008, FROZEN, deliberately reused — the bisect's band. NO new seeds.
- **Horizon:** 150d, death-aware. Same as the bisect.
- **Policy:** doorwalk baseline leg (`TAKESEAT_B=1`, `DOORWALK_B` off). No new sweeps unless integrity fails (see above).

## Binding stop rule

**Judge ONLY the corrected bar; classifications observed-only.** The mechanism classifications are the analyzer's (`scripts/analyze-xphalf-20261107.js`) output under the 0214Z pre-registered rule, re-run on the committed corpora for verification — they are **not re-scored, not re-ordered, not re-classified** by this run. The 53005 rule-order nuance (attrition-after-thinning fires before sickness-first even when the opener is a sickness cluster) stays a carried note for a future prereg, not a re-judgment here. A miss on the corrected bar is a stop: report it, do not classify, do not judge.

## GO bars (binding, §14)

- **GO:** the corrected C1 bar is met **exactly on all 8 seeds** (days + seat/sat + standing + w4 kills vs the bisect table, median 150d, sits 5/8) AND the P1 bar is met exactly (45/62/55, median 150d, sits 4/8) AND all 16 corpus files parse with the correct anchors AND 0 instrument errors. Then the 0214Z stop lifts and the observed classifications stand as the judged diagnosis.
- **NO-GO:** any headline mismatch, any parse/anchor failure (→ re-run sweeps first; judge only a complete corpus), or any instrument error.
- **Proof bars:** `scripts/test-xphalf-rejudge-20261107.js` green (reproduction gate on the committed corpora) AND `scripts/test-xphalf-20261107.js` 31/31 green (analyzer proof, re-run) AND the analyzer re-run on the committed corpora reproduces the 0214Z classifications verbatim (53003 attrition-after-thinning, 53005 attrition-after-thinning, 53007 sickness-first).

## Durability

This run commits the judged corpora into `evidence/2026-11-07/xphalf-c1/` and `evidence/2026-11-07/xphalf-p1/` (per-seed JSONs + CONSTRUCTION.txt files) so the judgment no longer rests on /tmp. The gate test runs against the **committed** copies (after first running against /tmp for integrity).

## Non-goals

- DIAG only: zero src/js changes. No fix build; if the judged diagnosis fingers a fixable game change, document the fix shape with its own prereg sketch — do NOT build it here.
- No balanced-panel compare (§15): the question is a frozen replay judged by the same frozen instrument that produced the bisect's numbers; `scripts/balance-panel.js` takes panel-contract inputs (`compare --before <panel.json.gz> --after <panel.json.gz>`), not doorwalk recorder JSONs. The endpoint reproductions are the validity check (same justification as the bisect and sim-xphalf-b).
- No fresh band, no confirm sweep, no landing, no merge — report ready-to-merge; the coordinator lands it.

## Metric review (pre-registered note)

- The metric is the corrected reproduction bar; there is no friendlier re-scoring available. If the bar fails, the construction/instrument is wrong (or /tmp was damaged), not the diagnosis — that is a NO-GO with cause, recorded in the evidence file.
- Known gap, disclosed up front: the corrected bar deliberately drops the only early-death leg the old bar had. The discriminating property between healthy C1 and dead P1 seeds is the village-death day and the late attrition cluster, not any early-death threshold — that is the #1901 finding this run acts on, not a gap it re-opens.
