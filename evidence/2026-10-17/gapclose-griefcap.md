# Gap closure: uncapped grief-leverage stacking — 2026-10-17

## The blank
Scale r4, 8705: tribute 5k→35k/week across five primary-speaker deaths in
one season; pantry 71.6k→0; the national run lost. The steve-call
(sim-findings #343, sim-holdloss2): "should compounded grief-leverage have
a ceiling (or diminishing ratchet), or is the arrears-dissolve the
intended price of the BELONG road?"

## Root cause
Three ×1.5 grief-leverage sites compound without bound:
- `successionCrisis` (Haven-subordinate link): "Grief is leverage, and
  they know it."
- `theirSpeakerDied` (Haven-primary link): "Haven installs its own."
- `_resolveRenegotiation` (lapsed young link): "Grief became leverage."

The 2026-10-11 GRIEF COALESCES guard blocks *burst* deaths inside the
mourning window, but slow-burn stacking across a season compounds freely:
5000 × 1.5^5 ≈ 38k. The fiction ("grief is leverage") is coherent; the
uncapped exponent is the bug.

## Balance call (gap-closure 2026-10-17; Steve can overrule)
Grief is leverage — **twice per link**. The third grab is refused aloud
("the grief card is spent; the table has heard it before"), tribute
unchanged; the trust −8 still applies (the death still hurts the
relationship). Implemented as `_griefLeverage(link)` in
`src/js/hierarchy.js`, routed through all three sites with site-appropriate
voiced refusals. Counter `link.griefGrabs` persists on the link (plain
state, saved). The ×0.75 down-moves are untouched (not leverage grabs).

## Proof
`scripts/test-griefcap-20261017.js` — RED→GREEN, deterministic (seed 7):
- Grab 1: 5000→7500; grab 2: 7500→11250 (unchanged behavior).
- Grab 3: pre-fix 16875 (compounds); post-fix refused at 11250, "spent"
  beat voiced.
- Guardrail: trust −8 on every grab including the refused one (60→36).

## Sweep note
No full sweep run this pass: the cap is behavior-neutral except in
3+-grab seasons (rare by construction), and the mechanism proof is exact.
Recommended next: an 8-seed belong-road sweep comparing tribute
trajectories on grab-heavy seeds (8705-shape) — filed as the named next,
not blocking.

## Metric review
Mechanism fix with exact proof; no pre-registered sweep metric. The
defect class (uncapped compounding across seasons) is closed: the only
remaining compounding is the designed two grabs. If Steve wants the number
moved (1? 3? diminishing ratchet instead of a hard cap), it's a one-line
change in `_griefLeverage`.
