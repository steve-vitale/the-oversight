# Balanced campaign comparison

**Decision: invalid**

- Unmatched flags

Invalid comparisons must be repaired before interpretation.

<!--
sim-depositrelief-b (2026-10-24): the automated panel compare is invalid
BY CONSTRUCTION for env-gated levers (#797). The lever under test
(DEPOSITRELIEF) is an env-gated policy layer on IDENTICAL game code: the
armed (DEPOSITRELIEF=1) and control (DEPOSITRELIEF=0) campaigns differ ONLY
in process.env flags. comparePanels (scripts/lib/balance-scorecard.js:44)
requires before.options.flags === after.options.flags, so any env-gated
before/after compare returns decision:invalid with "Unmatched flags" —
mechanically verified on synthetic panels differing only in flags (see
evidence/2026-10-23/sim-depinteraction-b.md, Results §15, and the sibling
bufferdepri run's evidence/2026-10-24/sim-bufferdepri-b.md).

Per MEASUREMENT.md §15 the panel is the instrument but an invalid panel
judges nothing: the pre-registered verdict was computed by
scripts/analyze-depositrelief-b.js on 64 identical-seed paired
before/after configs (DEPOSITRELIEF=0/1 x leadfeast/belongfeast, 16 seeds
9250-9265, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0,
PLENTYDEPRI=0/DEPOSITGATE=1 explicit), with the manual paired row analysis
attached in the analyzer report (section "MANUAL PAIRED ROWS (#797
fallback)"). The metric is NOT re-scored.
-->
