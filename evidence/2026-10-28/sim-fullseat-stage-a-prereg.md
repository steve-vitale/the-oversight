# sim-fullseat-stage-a — PRE-REGISTRATION (written BEFORE any judged fixture)

Run: fleshout loop, run fleshout-20261028T0836Z. Axis: scale-onramp.
Worker: sim-fullseat-stage-a. Arm: audit ONE held claim, measurement/doc only.
Source claim: run fleshout-20261028T0634Z, arm sim-sysbond-a,
evidence/2026-10-28/sim-sysbond-a.md, "What was NOT done (scope guard)":
docs/TABLE.md's full-seat line says stage ≥ 3, while the table.js seat
comment describes deedGateReady with stage ≥ 2. Do NOT re-judge sysbond,
do NOT touch gating numbers, do NOT touch any other doc claim.
Zero src/js changes in this arm, period.

## Audit questions (judged against these, not re-scored mid-run)

- Q1. FULL seat: what integration-stage value does deedGateReady()
  actually require in code (stage ≥ 2, stage ≥ 3, or something else)?
- Q2. LESSER seat: what stage value does tableSeat()'s lesser branch
  actually require, and does it differ from the full seat's?
- Q3. Where is deedGateReady() called, and which of those call sites
  is the full-seat path (vs. Arc IV / re-check / commentary)?
- Q4. Branches that change the answer: does any other branch alter
  the full-seat stage requirement — Relay path prereq (stage ≥ 3 /
  stage 2 + office), per-path minimum seat (indispensable FULL only),
  Arc III/IV stage checks, or a seat-floor / withdrawal path?
  Each must be named as seat vs. path prereq vs. arc gate, never
  conflated.
- Q5. Which is wrong — docs/TABLE.md (stage ≥ 3 for the full seat),
  or the table.js seat comment (stage ≥ 2 for deedGateReady)?
  Also record every other in-code comment that repeats a stage
  claim for the deed gate, and whether each agrees with the code.
- Q6. History / authority: was the full-seat stage bar ever ≥ 3 in
  code, and is there a Steve ruling ordering a stage bar for the
  full seat? (Same code-wrong bar as the sysbond arm, below.)

## Fixture bar (GO = all of these)

- F1. Fixtures drive the REAL deedGateReady() and tableSeat() (no
  stubbed gate function, no prereq-only read where a seat answer is
  claimed), varying ONLY the stage value across the boundary
  (stage 1 / 2 / 3) with every other full-seat leg satisfied, plus
  the one-leg-missing controls that prove the stage cell is the
  deciding leg.
- F2. Fixtures cover: full seat at stage 2, full seat at stage 3,
  no full seat at stage 1 with all other legs met; lesser seat at
  stage 2 with its own legs met; Relay prereq branches (stage 3
  without office, stage 2 with office, stage 2 without office)
  reported as path-prereq results, NOT seat results.
- F3. Every branch cited to file + line/function. All fixtures pass.
  A fixture failure on the claimed threshold = the audit is not GO
  until the claim is re-stated to match the fixture.
- F4. Integration-stage construction is proved, not assumed:
  fixtures set scholar.integration to the values that
  integrationStage() maps to stages 1/2/3 (and systemArrived),
  and assert the mapped stage before judging the seat.

## Verdict rule (pre-registered, mirrors the sysbond arm)

- DOC WRONG: correct docs/TABLE.md in the same commit (doc correction
  only, with fixture proof). The corrected sentence must state the
  code-true stage bar for the full seat and keep the lesser-seat
  and Relay-prereq bars distinct.
- CODE WRONG: requires at least one of (i) a Steve ruling AFTER the
  code landed ordering a full-seat stage bar different from the code,
  (ii) a second code path that assumes the doc's bar and breaks
  under the code's bar, or (iii) a corpus case where the code's bar
  produces a broken/incoherent state attributable to it. If none
  is met, the DOC is corrected and no code fix is landed.
  If code-wrong IS met, do NOT change code — write the precise fix
  specification and HOLD it with reason (needs a Steve ruling first,
  exactly as the sysbond code-fix spec was held).
- If doc and comment disagree but the CODE matches one of them,
  the verdict names the wrong text, corrects only the doc if the
  doc is the wrong text, and reports (not silently fixes) any
  wrong in-code comment outside the task's doc area — src/js is
  out of bounds for this arm, so a wrong code comment is reported
  as a held follow-up, not edited.

## Scope / measurement

- Audit arm with no sim band: no wall numbers (national / table /
  wins, wave 4–5 unlocks, median survival) are claimed from this
  arm. If a confirming band is run, its wall numbers are reported
  separately and never pooled with other arms' bands.
- No balanced panel (audit, no before/after behavior comparison —
  same standing exception as the sysbond arm).
- No [needs-eyes]: doc-only audit unless a code fix is held, in
  which case the held spec is reported, not landed.
- Metric review section is mandatory in the evidence file.
