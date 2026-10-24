# Balanced campaign comparison

**Decision: invalid**

- Unmatched flags

Invalid comparisons must be repaired before interpretation.

<!--
sim-pdvalue-b (2026-10-24, LEVER verdict, backlog #871): the automated panel compare is invalid
BY CONSTRUCTION for env-gated levers (#797). The factor under test (PLENTYDEPRI) is an env-gated
policy layer on IDENTICAL game code: the PD=1 and PD=0 campaigns differ ONLY in process.env flags.
comparePanels (scripts/lib/balance-scorecard.js) requires before.options.flags === after.options.flags,
so any env-gated before/after compare returns decision:invalid with "Unmatched flags" — mechanically
verified here on synthetic panels differing only in flags (PLENTYDEPRI 0 vs 1, identical
contractDigest/observerDigest, complete coverage, passing neutrality proofs): decision=invalid
errors=["Unmatched flags"]. (Any "Incomplete panel"-style extra errors are synthetic-panel
artifacts of the 1-seed demonstration panel, not of the real corpus; the flags error alone fires on
real panels, as documented in evidence/2026-10-23/depinteraction-b-panel-compare.md.)
Per MEASUREMENT.md §15 the panel is the instrument but an invalid panel judges nothing: the LEVER
verdict was computed by scripts/analyze-pdvalue-b.js on identical-seed paired PD=1/PD=0 configs
(the instrument is proved in scripts/test-pdvalue-b.js: P1 derivation-confined diff, P2
within-environment byte-identical re-runs, P6 C1 freshness, P7 verdict-logic), with the manual
paired row analysis attached in the analyzer report (./pdvalue-b-analyzer-report.txt, section
"MANUAL PAIRED ROWS (§15 fallback)"). The metric is NOT re-scored.
-->
