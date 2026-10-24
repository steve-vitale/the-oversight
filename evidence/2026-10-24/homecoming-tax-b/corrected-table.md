# homecoming-tax-b — corrected channel table

Corpus: evidence/2026-10-23/{depinteraction,easingchannels}-b-corpus (READ-ONLY). Analyzer: scripts/homecoming-tax-b.js.

## PD-delta decomposition per leg (PD=1 - PD=0, per-cell sums over 16 seeds, kcal)

| leg | claimed funnelShare | claimed scholarHomecoming | corrected funnelShare | corrected scholarHomecoming | corrected tribute | corrected away | corrected ambient | corrected other | hc/fs (honest) |
|---|---|---|---|---|---|---|---|---|---|
| belongfeast/dg0 | -2361340 | 0 | -2467400 | -606145 | 0 | -64706 | -30237 | -18032 | 0.25 |
| belongfeast/dg1 | -1296844 | 0 | -508200 | -259910 | 0 | 2078 | 34223 | -506172 | 0.51 |
| leadfeast/dg0 | -2267018 | 0 | -3591400 | -1369135 | -512434 | 8458 | -71680 | 108709 | 0.38 |
| leadfeast/dg1 | -965010 | 0 | -740000 | -301570 | -32831 | -24237 | -11659 | -236168 | 0.41 |

## Homecoming tax under DEPOSITGATE (keep-raise + holdback)
| policy | homecoming volume dg0->dg1 (pd0) | holdback retE+bigE | funnelShare eased |
|---|---|---|---|
| leadfeast | 1319520 | 334422 | 2085713 |
| belongfeast | 895300 | 284151 | 1927518 |

## Verdict

**DIAG-GO** — 4/4 legs: homecoming is a real second channel (25-51% of funnelShare PDd), UNSEEN not absent.
Blindness verified: scholarHomecoming=0 on 128/128 depinteraction configs. Substrate: diverged on 128/128 (cell-level attribution used).
Canon: docs/CANON.md + docs/PRESERVATION.md read; no canon doc covers the depositgate channel taxonomy.
