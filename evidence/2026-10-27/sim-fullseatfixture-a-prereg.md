# sim-fullseatfixture-a — pre-registration (BINDING, committed before any judged work)

Run: fleshout loop, axis scale-onramp. Blank closed: scalegate run's
next blank (4) — "the fullseat-diag TEST mock fixture still computing
old-ok without scale (future-reader trap)" (evidence/2026-10-27/
sim-scalegate-a.md, findings).

Canon read first: docs/CANON.md, then docs/TABLE.md. Ruling applied:
Steve 2026-10-27 — the full seat requires national standing;
src/js/progression.js deedGateReady() ok now includes scale
(national/global). This arm touches NO src/js file and changes NO
game behavior; test/mock-fixture scope ONLY. [needs-eyes] does NOT
apply (test-only scope).

## The trap test (pre-registered precisely)

Construct ONE village meeting EVERY full-seat bar EXCEPT scale:
- wave bars 5/5/4/3/2 distinct fought, contestsSurvived 3, crises 3,
  integration stage 2, sentimentTaught + feastSurgeUsed,
- rank REGIONAL (networkLive only — meets the lesser seat's own
  scale bar, not the full seat's).

For that village, assert:
- (a) real deedGateReady() ok == false (and tableSeat() == 'lesser',
  the downgrade, not a loss);
- (b) each fixture/mock's ok for that SAME village.

Positive control (same bars, rank NATIONAL): real ok == true, and
every fixture/mock's ok == true.

## Verdict rule (pre-registered, no re-scoring)

- TRAP-CONFIRMED if ANY fixture/mock reports ok true for the
  regional-only village (it would pass a regional-only village as
  full-seat-ready).
- NO-TRAP if EVERY fixture/mock agrees with the real ok on both
  the regional village (false) and the national village (true).

Scope rule (pre-registered): if a fixture turns out to be a test-only
mock that DELIBERATELY isolates another term (not claiming to compute
ok), document that scope explicitly in the evidence instead of
"fixing" it — do not break a deliberate isolation, and do not re-label
a scoped mock as a trap. A mock that builds a deedGateReady-shaped
gate object and derives a seat from its ok IS claiming to compute ok,
and counts under the verdict rule above.

## Files checked (binding list)

1. scripts/test-fullseat-superset-20261014.js — ALL assertions, not
   just the one fixed by sim-scalegate-a (fixture now sets nationalLive).
2. scripts/test-fullseat-diag-20261021.js — the named suspect: its
   mockGame gate computes ok from wave/contest/crisis/stage/food bars
   with NO scale term.
3. scripts/test-fullseat-diag-sweep.js — sweep runner; uses the real
   game + snapFullSeat, no mock ok expected, but verified, not assumed.
4. scripts/policies/fullseat-diag.js — the instrument itself: it reads
   g.ok from the real gate (no own ok computation expected), but its
   header comment and component model are checked against the ruling.
5. Repo-wide grep sweep for any OTHER deedGateReady/tableSeat mock
   or old-ok formula in scripts/ (analyze/probe/transcript helpers
   included). Anything found is judged under the same verdict rule
   and listed in the evidence, cleared or fixed.

## If TRAP-CONFIRMED (pre-registered fix shape)

Fix ONLY the fixture/mock: add the scale term (national/global rank)
to the mock's ok computation, plus a comment citing the 2026-10-27
scale ruling. Never the real gate. Re-prove: fixed fixture agrees
with real ok on the regional village (false) AND the national village
(true), and the owning test still passes in full. If NO-TRAP: change
nothing, and say so plainly — a NO-TRAP verdict is a result, not a
wasted run.

## Proof artifact (pre-registered)

scripts/test-fullseatfixture-a.js — before/after legs on the FILE
itself (old formula evaluated from git HEAD text vs new formula from
the working file text, both fed the same regional + national fixture
inputs), plus the real-gate legs on a real loaded Game (shared
godpath/lib harness, seed 7, same bar-setting method as
test-scalegate-a.js). No fixture behavior is proven from a copy of
itself: the evaluated formula is extracted from the file under test.

## Metric review (placeholder — filled in the evidence file)

Pre-registered metric: fixture/real ok agreement on the two control
villages (regional false, national true), per file. No other metric
is judged. Any doubt about the metric itself goes under "metric
review" in the evidence and applies to the NEXT run, never this one.
