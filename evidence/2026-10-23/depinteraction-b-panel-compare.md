# Balanced campaign comparison

**Decision: invalid**

- Unmatched flags

Invalid comparisons must be repaired before interpretation.

<!--
sim-depinteraction-b (2026-10-23): the automated panel compare is invalid
BY CONSTRUCTION for env-gated levers (#797). Both levers under test
(PLENTYDEPRI, DEPOSITGATE) are env-gated policy layers on IDENTICAL game
code: the armed and control campaigns differ ONLY in process.env flags.
comparePanels (scripts/lib/balance-scorecard.js:44) requires
before.options.flags === after.options.flags, so any env-gated
before/after compare returns decision:invalid with "Unmatched flags" —
mechanically verified on synthetic panels differing only in flags (see
evidence/2026-10-23/sim-depinteraction-b.md, Results §15).

Per MEASUREMENT.md §15 the panel is the instrument but an invalid panel
judges nothing: the pre-registered DIAG verdict was computed by
scripts/analyze-depinteraction-b.js on 128 identical-seed paired
before/after configs (DETERMINISTIC: 44/44 pilot re-runs byte-identical),
with the manual paired row analysis attached in the analyzer report
(./depinteraction-b-analyzer-report.txt, section "MANUAL PAIRED ROWS
(#797 fallback)"). The metric is NOT re-scored.
-->
