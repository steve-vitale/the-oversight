# Journey leg ESTABLISHMENT — r109 pre-registration AMENDMENT 2 (2026-11-07, Lane A)

Written AFTER the before-panel re-run with the final (annotated) driver
and AFTER verifying the mechanism in src/js/conversation.js, BEFORE the
after-panel. The Q1 fix is NOT implemented. This amendment records why.

## What the re-run showed
The re-run (TAG=r109-before, 4 seeds, final driver) is byte-identical to
the first run except the two annotation lines; the four funnel JSONs are
byte-identical (0 diff lines). Both no-picks are annotated
`(no pick — winding down)`:
- 1603 Simran, 1604 Juan — both nonverbal, menu `leave|nv:nod`.
Under Amendment 1's definition (a no-pick while winding down is a CLEAN
ENDING, not a stall), the before-panel stalls = **0**, not 2. The two
"stalls" I reported from the first run were misread: without the
annotation I assumed the goon turn had consumed a mood beat; it had in
fact consumed the winddown beat (the goodbye).

## Mechanism verified in code (conversation.js)
- The goon continuer reveals the queued winddown beat: `hb.winddown`
  sets `c.windingDown = true` and returns the menu `[leave, nv:nod]`
  for the nonverbal thread, with `windingDown: true` in the return
  (convoTurn goon early-return). The goodbye HAS landed — "Their
  gestures slow — the conversation thinning like light at dusk." /
  "Alright — carefully, now. Both of us." are the winddown beat's lines.
- That menu is "one last turn of choices, then it's over" (code
  comment): `leave` ends via endConvo 'left'; `nv:nod` while winding
  down ends via endConvo 'natural' (the nonverbal convoTurn wrapper).
  Both choices end the conversation cleanly with a gesture closing
  line. There is no softlock, no filler loop, no dead menu — the driver
  records a no-pick only because it never picks `leave` (by design) and
  will not repeat `nv:nod` (no-repeat rule).
- The hypothesized mechanism does NOT apply here: the budget DID fire.
  Nonverbal gestures increment `c.exchanges` (the nv: wrapper), so the
  budget lands on schedule and the winddown queues; the goon turn then
  speaks it. "Content exhaustion precedes budget exhaustion" was a
  verbal-thread hypothesis (goon turns don't count as exchanges) — the
  observed stalls are nonverbal, and the verbal Ursula case did not
  recur in the 16 held convos.

## Independent corroboration
The thinbeat fixture (scripts/test-journey-establishment-r109-thinbeat.js
P1) PASSES on the current code: 2 seeds (1603 Simran, 1604 Juan),
0 stalls — the winddown fires correctly and the invariant holds. Per
the run's own rule (a fixture that passes pre-fix is not a valid
reproduction), the fixture confirms the engine, it does not reproduce a
defect. P2 (driver det-gate) is IDENTICAL on all four keys. The test is
kept as a regression guard for the winddown machinery, not as a fix
proof.

## Q1 verdict: SUBSTRATE-MISSING
Per the prereg ("If before-panel showed 0 stalls: SUBSTRATE-MISSING, no
fix"): Q1 is SUBSTRATE-MISSING. No fix is implemented in
conversation.js; the Q1 fix design from the pre-compaction analysis is
withdrawn. The bar "after-panel stalls = 0 AND before-panel stalls ≥ 1"
cannot be met because the second conjunct fails — there was no defect
to fix on this panel.

## What still runs
Q2 (prepLog 'no-teacher' split) proceeds — Q1 did not run long, so the
scope guard does not trigger. The after-panel (TAG=r109, same 4 seeds)
still runs to verify Q2 classification (every no-teacher row split;
≥1 row in at least two classes) and the guardrails M3/M4. The analyzer
reports wound-down clean endings separately from stalls.
