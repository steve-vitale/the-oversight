# sim-strandfix2-b — paired compare (control vs variant, identical seeds)

Source: evidence/2026-10-31/sim-strandfix2-b-census.json (analyzer:
scripts/analyze-strandfix2-b.js). Extraction: still = woodcarry bucket
creek + rescued false; rescued = bucket creek + rescued true. Seeds:
15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337. DAYS=30.
Substrate: POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON),
STRANDFIX2=0 (control) / 1 (variant). PRESSB never stacked.

## Seed 15215 (the sole strand seed)

| leg | control creek/still/rescued | variant creek/still/rescued | still days control -> variant | fall |
|-----|-----------------------------|-----------------------------|-------------------------------|------|
| guard | 4 / 3 / 1 | 4 / 3 / 1 | [7,8,9] -> [7,8,9] | 0 |
| ON | 10 / 10 / 0 | 11 / 11 / 0 | [7..16] -> [7..17] | -1 |

Both-evenings (still on both control legs): 7, 8, 9. Variant fates:
all three still on both variant legs. Conversions 0, preventions 0.

## All other seeds (no strand on any leg)

Per-seed creek/still/rescued counts are IDENTICAL between control and
variant on both legs (15003 1/0/1, 15091 1/0/1, 15211 2/0/2, 15337
1/0/1; 15009, 15220, 15221 zero creek evenings). No spillover.

## Guardrails

- Ticks-short still evenings: 1 (day 7) on control and variant, both
  legs. No new time failure.
- Player (vessel) deaths: ON 17 = 17 (unchanged). Guard: control none
  in 30 days; variant one day-23 death ('the night') — flagged in the
  evidence file, cause not separable from RNG divergence on one seed.
- Det-gate: OFF legs reproduce control legs exactly, both legs.
- Determinism: ON variant re-run byte-identical, 8/8 files.

## Verdict (from the prereg, not from this compare)

NO-GO: fall >= 2 on no leg; ON strand lengthens 10 -> 11; guardrail
flag on guard deaths. See evidence/2026-10-31/sim-strandfix2-b.md.
This compare is a paired census, never a §15 panel run.
