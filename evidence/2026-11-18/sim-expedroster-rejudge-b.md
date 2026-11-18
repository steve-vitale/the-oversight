# sim-expedroster-rejudge-b — RE-JUDGE under the corrected gap bar (Loop B run fleshout-loop-b-20261118T0130Z)

**Arm:** sim-expedroster-b (re-judge) · **Branch:** `sim-expedroster-b` · **Corpus:** unchanged pilot corpora, band 104201–104208 (8 seeds, `evidence/2026-11-18/perseed-expedroster-b/`, committed cb814633d) · **No fresh sweep, no new sims.**
**Builds on:** `evidence/2026-11-18/sim-expedroster-b.md` + prereg (NO-GO METRIC-BROKEN under the frozen bar) and `evidence/2026-11-18/sim-winnability-round-0430.md` (adoption closeout: "a re-judge of this same instrument and corpus under the corrected bar would pass all three bars, with no code change needed" — this file is that re-judge).

## What was wrong with the frozen bar

The frozen gap bar counted missing days strictly inside a member's whole-window roster span `[firstRosterDay, lastRosterDay]`, which bridges the days between one expedition ending and the next beginning. All 111 pilot gaps were audited in the 0430Z closeout as home intervals (111/111, 0 true recorder misses — e.g. Aroha s104204: rows d94–99 `sinceDay=98`, no rows d100–112, rows resume d113 with `sinceDay=113`, a new expedition). The bar measured the wrong thing: it punished the recorder for days on which no expedition existed.

## The corrected bar (the only change)

`scripts/analyze-expedroster-b.js`, `gapDays`: gaps are counted only **within one expedition (one `sinceDay` run)**. Days between two `sinceDay` runs are home intervals, not gaps. Rows without `sinceDay` fall back to the old whole-span rule so synthetic fixtures stay valid. Capture bar (≥95%) and join bar (100%) are unchanged; the pool floor (≥5 launches) is unchanged.

## Re-judge result: GO (all three bars met on the same corpus)

| Bar | Frozen-bar pilot | Corrected-bar re-judge |
| --- | --- | --- |
| Primary 1: capture rate ≥95% | PASS — 16/16 = 1.000 | **PASS — 16/16 = 1.000** |
| Primary 2: snapshot gaps = 0 | FAIL — 111 gaps | **PASS — 0 gaps** |
| Primary 3: join rate = 100% | PASS — 6/6 = 1.000 | **PASS — 6/6 = 1.000** |
| Pool floor (≥5 deduped wave-4 launches) | MET — 16 | **MET — 16** |
| Instrument verdict | NO-GO (METRIC-BROKEN) | **GO** |

Analyzer output: `evidence/2026-11-18/expedroster-b-rejudge.json` (`run: fleshout-loop-b-20261118T0130Z-rejudge`). Verdict counts unchanged from the pilot: together-en-route 13, unknown-with-reason 3 (holder-only), destination-only 0.

## Proof

- `scripts/analyze-expedroster-b.js --selftest`: **16/16** (13 carried + 3 new: home-interval shape → [], hole inside one `sinceDay` run → [11], hole only in second run → [21]).
- `scripts/test-expedroster-b.js`: **15/15 green** (re-run on this tip).
- The original pilot verdict stands as recorded under its frozen bar (NO-GO METRIC-BROKEN); this re-judge is a separate verdict on the same corpus under the corrected bar, as the 0430Z closeout prescribed. No corpus file changed; no seed re-ran.

## The scientific answer stands (tracker blank #4 CLOSED)

Launch members **do share tiles en route**: 13/16 launches together-en-route (same node AND same target on some day), 0 destination-only, 3 holder-only (companions named on the launch row who never departed). The daily `st.exped` snapshot instrument is valid — capture 100%, zero true gaps, join 100% — and the question the trace left open ("do launch members share tiles en route, or only a shared destination?") is now answered with cited rows. Finding #2511's unanswered half is closed; the instrument needs no further work.

## Wall (this corpus — unchanged from the pilot)

National standing 2/8, national rank 0, table 0, wins 0, wave-4 6/8, wave-5 2/8, median survival 125d, survived 4/8. The wall is unchanged: no table, no wins.
