# sim-auditfix-b — prereg (Loop B, run fleshout-loop-b-20261113T0830Z)

Instrument arm, not a game lever. No src/js change; analyzer only.
Findings: sim-findings.md #2246 (M21) + #2247 (M23), filed on r182,
claimed by this run.

## The defects (as filed on r182)

(a) M21 AUDIT-UNPARSED ON FULL SEATS: the r182 analyzer's audit parser
requires the "waves 1-3 faced (N/N/N)" clause, which the full-seat audit
line does not carry ("A full seat. global standing, every wave faced, the
deeds complete."). Every full seat in r178 (89701/89704 pass B, 89702/89705
pass C) and r182 (89702 pass B/C, 89707 wide) fails M21 as AUDIT-UNPARSED,
though satWaves data itself is present.

(b) M23 COUNTS NONE-READY ATTEMPTS AS FAILURES: r182 pass B 89702 delivered
feast_embassy d65 and priced full, but M23 printed NO-GO because the
analyzer's literal attempts==deliveries counts the three honest none-ready
attempts (d62-64, no kind ready yet) as failures; 0 refusals despite
readiness.

## What this run does, in order

1. REPRODUCE both failures on the LATEST analyzer,
   scripts/analyze-endgame-r188-20261112.js (r188, Nov 12), over the
   r178/r182 corpora. The findings were filed on r182; r185/r188 may
   already differ.
2. If the failures reproduce on r188, fix the live analyzer (r188 only;
   per-round copies are history — do NOT silently edit old rounds) and
   prove the fix by re-running on the same corpora.
3. If r188 already judges both correctly, report that with the re-run
   output and do NOT re-fix. The r182 analyzer is run as a control to
   show the filed defects were genuine on the filed version.

## Corpora (read-only inputs, never modified)

- evidence/2026-11-11/perseed-endgame-r178/ + -b/ + -c/
- evidence/2026-11-11/perseed-endgame-r182/ + -b/ + -c/ + -cwide/
- NOTE: the parent (pass A) dirs hold no full seats — all 10 pass-A
  records are sat=lesser. The full seats named in the findings live in
  the -b/-c/-cwide pass dirs, so the reproduction runs every pass dir.
  The r188 analyzer hardcodes the `endgame-r188-*.json` filename pattern
  (and `endgame-r188-<seed>-transcript.txt` for the M1 voice check), so
  each pass dir is re-run through a /tmp dir of symlinks renamed to the
  r188 pattern, pointed at by ANALYZEDIR. No input file is copied or
  renamed in place.

Full seats under test (7): r178-b 89701 (18/12/5+4/4), r178-b 89704
(21/9/5+6/2), r178-c 89702 (21/13/5+4/3), r178-c 89705 (23/12/7+4/3),
r182-b 89702 (24/12/8+4/4), r182-c 89702 (26/12/7+5/3), r182-cwide 89707
(21/12/5+4/2). All seven meet the deed bars 5/5/4/3/2 on satWaves.

## Pre-registered bar (MEASUREMENT.md §11, §14 — binding)

Primary metric: the M21-audit-crosscheck and M23-capstone verdict lines
printed by the r188 analyzer on the corpora above. No sims, no policies,
no horizon (fixed corpora re-analyzed, not a sweep); seeds are the
existing per-seed records.

- GO (M21): on every pass dir containing a full seat, M21 reads GO and
  every full seat prints FULL-EXEMPT with deedBars(5/5/4/3/2)=true. No
  AUDIT-UNPARSED on any full seat. Lesser seats keep the parse rule.
- GO (M23): on r182-b, M23 reads GO with refused-despite-ready 0,
  none-ready 3, delivery feast_embassy@d65, pricedFull 1/1 eligible.
- CONTROL (r182 analyzer on r182-b): M21 reads NO-GO with 89702
  AUDIT-UNPARSED, and M23 reads NO-GO with refused=3 — confirming the
  filed defects were genuine on the filed version. If this control does
  NOT fail, the findings themselves are suspect and the run stops to
  re-examine them.
- PROOF TEST (scripts/test-auditfix-b.js): synthetic corpora through the
  r188 analyzer must show (1) a full-seat audit line parses via the
  satWaves deed-bar exemption, (2) none-ready attempts do not count as
  failures, (3) a genuine refusal-despite-ready still fails M23, (4) a
  full seat failing the deed bars still fails M21. All four legs green.

## Verdict rule

- BOTH RULES FIXED: r188 reproduces both failures first, the fix lands,
  re-run flips both verdicts, proof test 4/4.
- ALREADY-CORRECT: r188 judges both correctly on first run (expected if
  the r185 revision carried both fixes — the r188 header claims it does).
  Then NO analyzer edit; the deliverable is the re-run output, the proof
  test pinning the rules, and the findings marked fixed with this evidence.
- PARTIAL: one rule reproduces and the other does not — fix only the
  reproducing one, report the other as already-correct.

## Metric review (placeholder — filled after the run)

To be written in evidence/2026-11-13/sim-auditfix-b.md per §14.
