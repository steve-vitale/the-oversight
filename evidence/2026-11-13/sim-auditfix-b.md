# sim-auditfix-b — endgame analyzer fixes M21 + M23 (findings #2246/#2247)

Loop B, run fleshout-loop-b-20261113T0830Z. Instrument arm, analyzer only.
No src/js change. Prereg: evidence/2026-11-13/sim-auditfix-b-prereg.md
(committed first, 1f81c1cf3).

## Verdict: ALREADY-CORRECT — no analyzer fix needed

Both defects filed on r182 were genuine on the r182 analyzer, but both
were already fixed in the r185 revision and carried verbatim into the
latest analyzer, scripts/analyze-endgame-r188-20261112.js. The r188
analyzer judges both rules correctly on first run over the r178/r182
corpora. Per the brief, no re-fix was made. The deliverable is the
re-run output, the proof test pinning both rules, and the findings
marked fixed with this evidence.

## The defects, and where the fix already lives

(a) M21 (finding #2246): the r182 analyzer required the "waves 1–3 faced
(N/N/N)" clause and marked every full seat AUDIT-UNPARSED, because the
full-seat audit line carries no numbers ("A full seat. global standing,
every wave faced, the deeds complete."). The r185 revision (carried into
r188, lines ~716–727) exempts satSeatKind 'full' from the parse and
passes it iff satWaves meets the deed bars directly (5/5/4/3/2 distinct
fought per wave — progression.js deedGateReady, table.js:79). Lesser
seats keep the parse rule.

(b) M23 (finding #2247): the r182 analyzer's `capNoRefusal` counted
every non-ok attempt (`refused === 0`), so three honest none-ready
attempts failed the rule even with a delivery and 0 refusals-despite-
ready. The r185 revision (carried into r188, lines ~1160–1165) counts
only `refusedReady` — non-ok attempts whose reason is not 'none-ready'.
The r182 note already printed the split (none-ready 3,
refused-despite-ready 0) while still NO-GOing; the verdict logic was
the bug, and the r185 revision fixed exactly that line.

Copy note: per-round analyzer copies are history. The fix lives in the
r185 copy and the r188 copy (r188 header: "r185 analyzer verbatim EXCEPT
input dir, r185->r188, + M3-conversion retired"). No old-round copy was
edited. A future round that copies r188 inherits both fixes; a round
that copies anything older than r185 re-opens both defects — the copy
lineage is the hazard, and the proof test below is the guard for it.

## Control — the filed defects were genuine on r182

r182 analyzer on r182-b (ANALYZEDIR, exit 1; full log
auditfix-b-r182-analyzer-on-r182b.txt):

- NO-GO M21-audit-crosscheck: 4/5: ... | 89702:AUDIT-UNPARSED | ...
- NO-GO M23-capstone: 1 eligible: delivered 1/1, none-ready 3,
  refused-despite-ready 0, pricedFull 1/1 — 89702:feast_embassy@d65/FULL

Both exactly as filed. The control bar in the prereg is met: the
findings were real, not misfiled.

## Reproduction — r188 analyzer on the r178/r182 corpora

Method: the r188 analyzer hardcodes the `endgame-r188-*.json` filename
pattern, so each pass dir was re-run through a /tmp dir of symlinks
renamed to the r188 pattern (ANALYZEDIR), pointing at the read-only
corpora. No input file was copied or renamed in place. Full logs:
auditfix-b-r188-on-<pass>.txt (7 files).

M21 — GO on all 7 pass dirs. All 7 full seats print FULL-EXEMPT with
deedBars=true; zero AUDIT-UNPARSED anywhere:

| pass | full seats | M21 |
|---|---|---|
| r178 (A) | none (all lesser) | GO 5/5 |
| r178-b | 89701 (18/12/5+4/4), 89704 (21/9/5+6/2) | GO 5/5 |
| r178-c | 89702 (21/13/5+4/3), 89705 (23/12/7+4/3) | GO 5/5 |
| r182 (A) | none (all lesser) | GO 5/5 |
| r182-b | 89702 (24/12/8+4/4) | GO 5/5 |
| r182-c | 89702 (26/12/7+5/3) | GO 5/5 |
| r182-cwide | 89707 (21/12/5+4/2) | GO 8/8 |

M23 — GO wherever the capstone leg is enabled:

| pass | M23 |
|---|---|
| r178 (A) | pass A: capstone leg disabled (see pass B) |
| r178-b | GO — 2 eligible: delivered 2/2, none-ready 0, refused-despite-ready 0, pricedFull 2/2 (89701 military_tribute@d76/FULL, 89704 military_tribute@d89/FULL) |
| r178-c | GO — 2 eligible: delivered 2/2, none-ready 0, refused-despite-ready 0, pricedFull 2/2 (89702 feast_embassy@d65/FULL, 89705 feast_embassy@d62/FULL) |
| r182 (A) | pass A: capstone leg disabled |
| r182-b | GO — 1 eligible: delivered 1/1, none-ready 3, refused-despite-ready 0, pricedFull 1/1 — 89702:feast_embassy@d65/FULL |
| r182-c | GO — 1 eligible: delivered 1/1, none-ready 0, refused-despite-ready 0, pricedFull 1/1 — 89702:feast_embassy@d78/FULL |
| r182-cwide | GO — 1 eligible: delivered 1/1, none-ready 0, refused-despite-ready 0, pricedFull 1/1 — 89707:feast_embassy@d68/FULL |

The r182-b line is the prereg bar verbatim: M23 GO, refused-despite-
ready 0, none-ready 3, feast_embassy@d65, pricedFull 1/1.

Exit codes: 0 (ALL GO) on r178, r178-b, r178-c, r182, r182-b, r182-c.
r182-cwide exits 1 with M21/M23 both GO — the single NO-GO is
M5-voicing-canonical ("no forcedrift control seed"), a wide-pass
artifact (the wide band has no forcedrift seed by design; in --wide mode
that verdict is not judged). Out of this arm's scope; M21/M23 are the
pre-registered metrics and both read GO there.

## Proof test — scripts/test-auditfix-b.js (4/4 legs PASS)

Synthetic corpora built in os.tmpdir() from the real r182 records
(deep-copied and mutated; inputs never modified), r188 analyzer run
over each with ANALYZEDIR, verdict lines asserted. No game eval, no
randomness — deterministic. Run: `node scripts/test-auditfix-b.js`.

- Fixture: full-seat audit line carries no numbers — PASS.
- Leg 1 — constructed full seat (lesser 89704 re-typed to full, w5
  raised 1→2 to meet the bar) parses via the satWaves exemption:
  M21 GO, 89704 FULL-EXEMPT deedBars=true, no AUDIT-UNPARSED — PASS.
  (First draft of this leg failed honestly: the unmutated 89704 has
  w5=1, below the bar, and the analyzer correctly printed
  deedBars=false — the fixture was wrong, not the analyzer. Fixed the
  fixture, not the rule.)
- Leg 2 — two honest none-ready attempts prepended before a delivery:
  M23 GO, none-ready 2, refused-despite-ready 0 — PASS.
- Leg 3 — delivery replaced by a genuine refusal (reason
  'veterans-short'): M23 NO-GO, refused-despite-ready 1 — PASS. The
  none-ready exemption does not launder a real refusal.
- Leg 4 — full seat with satWaves w5 4→1 (bar 2): M21 NO-GO,
  FULL-EXEMPT deedBars=false — PASS. The exemption is not a free pass.

## Village assessment

No sims were run — this is an instrument arm, so there is no village to
assess. The blank filled is instrumental: the two metrics that gate the
endgame read-outs now judge the r178/r182 corpora correctly, so the
seven full seats in those rounds (four in r178, three in r182) count as
the wins they are instead of instrument failures. Nothing about the game
changed; the measurement now matches what the game already did.

## Metric review (MEASUREMENT.md §14)

Metrics held. The pre-registered bar was met on first run (already-
correct branch), so no re-scoring occurred. One observation for the
next run: the r182 analyzer's M23 note already printed the correct
split (none-ready vs refused-despite-ready) while the verdict used the
wrong count — a note/verdict split like that is a cheap tripwire for
future analyzer reviews: when a verdict note names two different
failure kinds, check the verdict counts the right one. Second: the
per-round analyzer copies mean a fix in r185 only reaches later rounds
if the next round copies from r185+; the proof test in this arm is the
guard, but it only guards if future rounds run it. Proposed: the
round-prereg template should name the analyzer revision it copies
from, so a copy from a pre-fix round is visible before the run, not
after the verdicts print.

## Convergence state

converged (instrument) — both rules already fixed in the live analyzer;
proof test pins them. No further arm owed on #2246/#2247.

## Files

- evidence/2026-11-13/sim-auditfix-b-prereg.md (committed 1f81c1cf3)
- evidence/2026-11-13/sim-auditfix-b.md (this file)
- evidence/2026-11-13/auditfix-b-r182-analyzer-on-r182b.txt (control log)
- evidence/2026-11-13/auditfix-b-r188-on-{r178,r178-b,r178-c,r182,r182-b,r182-c,r182-cwide}.txt (reproduction logs)
- scripts/test-auditfix-b.js (proof test, 4/4 legs PASS)
