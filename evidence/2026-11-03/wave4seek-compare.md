# Wave-4 seek pilot — before/after compare (balanced-panel substitute)

§15 note (pre-registered): scripts/balance-panel.js cannot compare
these arms — POLICY_REGISTRY (scripts/sweep-compare.js) is a fixed
list containing neither the closecommit stack nor the wave4seek
wrapper, and editing the observer mid-comparison would change the
instrument. The judged comparison is this identical-seed driver
table (analyzer: scripts/wave4seek-analyze-20261103.js). Per-seed
JSONs: evidence/2026-11-03/perseed-wave4seek/.

Primary metric: distinct wave-4 monsters fought per seed (deed feed).
GO (prereg): variant >= 2/8 AND baseline 0/8. Actual: baseline 4/8,
variant 3/8. VERDICT: KILLED.

| seed | baseline w4 | variant w4 | delta kinds | baseline days/end | variant days/end |
|------|------------|------------|-------------|-------------------|------------------|
| 98301 | 1 [herald] | 0 [] | -1 | 93/over-other | 90/over-other |
| 98302 | 0 [] | 0 [] | 0 | 33/village-lost | 33/village-lost |
| 98303 | 1 [reunion] | 3 [congregation, suburb, reunion] | +2 | 81/village-lost | 86/village-lost |
| 98304 | 0 [] | 0 [] | 0 | 90/over-other | 90/over-other |
| 98305 | 0 [] | 0 [] | 0 | 97/village-lost | 97/village-lost |
| 98306 | 2 [eulogy, algorithm] | 2 [eulogy, algorithm] | 0 | 84/village-lost | 75/village-lost |
| 98307 | 4 [strike, reunion, suburb, influencer] | 2 [reunion, suburb] | -2 | 105/village-lost | 91/village-lost |
| 98308 | 0 [] | 0 [] | 0 | 25/village-lost | 25/village-lost |
| TOTAL kinds | 8 | 7 | -1 | | |

Descriptive (not judged): national 2/8 -> 0/8; table 4/8 -> 4/8;
won 2/8 -> 2/8; wave-4 unlocked 4/8 -> 4/8; wave-5 fought 0/8 -> 0/8;
median survival 87d -> 88d. Variant patrol days on unlocked seeds:
98301: 10, 98303: 21, 98306: 17, 98307: 11; zero on locked seeds.
