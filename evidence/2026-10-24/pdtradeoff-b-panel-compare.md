# Balanced campaign comparison

**Decision: invalid**

- Unmatched flags

Invalid comparisons must be repaired before interpretation.

<!--
sim-pdtradeoff-b (2026-10-24, DIAG): the automated panel compare is invalid
BY CONSTRUCTION for env-gated levers (#797). The factor under test
(PLENTYDEPRI) is an env-gated policy layer on IDENTICAL game code: the
PD=1 and PD=0 campaigns differ ONLY in process.env flags. comparePanels
(scripts/lib/balance-scorecard.js:44) requires
before.options.flags === after.options.flags, so any env-gated
before/after compare returns decision:invalid with "Unmatched flags" —
mechanically verified on 2026-10-24 on synthetic panels differing only in
flags (PLENTYDEPRI 0 vs 1, identical contractDigest/observerDigest):
decision=invalid, errors=["Unmatched flags", ...]. (The second error,
"Incomplete panel", is a synthetic-panel artifact; on real panels the
flags error alone fires, as documented in
evidence/2026-10-23/depinteraction-b-panel-compare.md.)

Per MEASUREMENT.md §15 the panel is the instrument but an invalid panel
judges nothing: the DIAG verdict was computed by
scripts/analyze-pdtradeoff-b.js on 64 identical-seed paired PD=1/PD=0
configs (the instrument is proved in scripts/test-pdtradeoff-b.js:
P1 derivation-confined diff, P2 within-environment byte-identical
re-runs), with the manual paired row analysis attached in the analyzer
report (./pdtradeoff-b-analyzer-report.txt, section "MANUAL PAIRED ROWS
(§15 fallback)"). The metric is NOT re-scored.
-->
