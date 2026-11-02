# sim-falseclose-b PREREG — false-close proxy arrival condition (instrument only)

Run: fleshout-loop-b-20261102T084841Z, axis food-economy, arm sim-falseclose-b.
Blank: Loop B 0741Z next blank #4 (false-close proxy arrival condition before
it is quoted again). This arm is an INSTRUMENT arm: no game change, no policy
change, no default flip. Zero src/js edits, zero competent.js edits.

## What is broken (predecessor finding, not re-litigated here)

The sim-latescape-b false-close proxy counts an armed vetoed hop as a false
close when the same-seed baseline leg on the same loopDay (a) attempted that
exact hop in its shadow hop log and (b) ended the day home. On seed 61802 day
14 it fires 3 times on hop (4,4)->(4,6), but the trace shows the baseline
scholar never visited (4,6): it ATTEMPTED the hop 3 times in shadow, the
ENGINE refused it each time, and it foraged (4,3), (3,4), (5,4) instead,
ending home. The proxy conflates "attempted" with "taken". Until the proxy
has an arrival condition, it must not be quoted as false closes
(evidence/2026-11-02/sim-food-latescape-stepwalk-round-0741.md,
evidence/2026-11-02/sim-latescape-b.md metric review).

## What is built

1. A byte-identical port of the predecessor policy
   (sim-latescape-b:scripts/policies/competent-latescape-b.js) into this
   tree as scripts/policies/competent-latescape-b.js, with ONE added
   instrumentation field and no behavior change: every hop-log entry gains
   `arrived`, set AFTER the real travelTo call returns, true iff the
   scholar's position then equals the hop destination. Vetoed hops (orig
   never called) record arrived=false. The diff vs the predecessor file is
   confined to this field; trajectory identity on the diagnostic seed is
   the proof of no behavior change (see bar D1).
2. scripts/falseclose-b-driver.js: a port of the predecessor driver
   (same substrate, same env gates, same output shape), running the
   ported policy, so hop entries carry `arrived`.
3. scripts/analyze-falseclose-b.js: the arrival-conditioned proxy. It
   reports the OLD proxy count and the NEW proxy count side by side for
   every seed, and classifies every old-proxy entry as counted-new (with
   its evidence class) or dropped (with its reason). No silent drops:
   the analyzer prints the full dropped list.

## Arrival condition (exact definition — this binds the run)

A hop is an ordered pair (from -> to) on one baseline seed-day.
OLD proxy (comparison only, NEVER quoted as false closes): an armed vetoed
hop on loopDay d counts iff the same-seed baseline leg's hop log for
loopDay d contains that exact hop AND the baseline day-end position that
day equals haven.
NEW proxy (the quotable instrument): the OLD conditions PLUS baseline
ARRIVAL at the hop destination on that same seed-day, where arrival is
ANY of:
  (a) AUTHORITATIVE (new driver): a baseline hop entry for that exact hop
      on that day with arrived === true — the scholar's post-travel
      position equalled the destination. This is the quoting instrument.
  (b) LEGACY FALLBACK (predecessor corpora, which carry no `arrived`
      field): a baseline forage event that day whose position equals the
      destination (the scholar foraged from that tile);
  (c) LEGACY FALLBACK: a LATER baseline hop that day whose `from` equals
      the destination (the scholar departed from that tile, so it was
      there);
  (d) LEGACY FALLBACK: the baseline day-end position that day equals the
      destination.
Day-START position is explicitly NOT arrival evidence: starting the day
on a tile does not prove this hop carried the scholar there. Fallback
evidence classes are reported per counted hop; a hop with no evidence
in any class is NOT counted, and is listed as dropped. The legacy
fallback may UNDERCOUNT true closes whose arrival left no trace in the
old corpora — that is why the new driver (class (a)) is authoritative
and legacy re-analysis is diagnostic only.

## Substrate (identical to the predecessor legs)

competent vs competent-latescape-b (ported), 30 days, DEPOSITGATE=0,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, packcomp *=1 flags NOT 1.
Node harness: full src/js list in index.html order minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js; Math.random
seeded BEFORE eval; Game.save never stubbed.

## Bars (pre-registered; §14 binding — a miss is NO-GO, never re-scored)

- D1 DIAGNOSTIC (seed 61802, both legs, new driver): OLD proxy count = 3
  AND NEW proxy count = 0 AND forages byte-identical between legs
  (every day: forage positions, ok flags, and added items identical).
  The old count of 3 also proves substrate reproduction: the new driver
  replays the predecessor's trace.
- D2 FRESH BAND (seeds 62201-62208, 30d, both legs, new driver): the
  analyzer reports, per seed, OLD count and NEW count, plus the full
  counted/dropped classification for every old-proxy entry. Bar: the
  table is complete (8/8 seeds both legs, no analyzer error) and every
  old-proxy entry is classified — no unclassified entries. Band
  freshness: 62201-62208 was checked against the 0741Z banned list
  (61401-61408, 61501-61508, 61601-61608, 61701-61708, 61801-61808,
  61901-61916, 61308, 60307) and against Nov evidence + sim-findings
  for 62201-62208 usage — none found. This band is disclosed as fresh
  for this arm.
- D3 POSITIVE CONTROL (the instrument must not silently drop TRUE false
  closes): at least one positive control case counted by the NEW proxy:
  (i) fixture corpora — baseline hop with arrived=true, baseline day-end
  home, armed veto of the same hop — counted as NEW = 1; and
  (ii) fake-game guard test proving the `arrived` field's semantics
  (engine-accepted hop -> arrived true; engine-refused shadow hop ->
  arrived false; vetoed hop -> arrived false). Any NEW-proxy count > 0
  on the fresh band is reported as an additional live positive control
  but is NOT required.
- D4 NO BEHAVIOR CHANGE: the ported policy's diff vs the predecessor
  file is confined to the `arrived` field (shown in the evidence file),
  AND the diagnostic leg-vs-leg trajectories are identical to the
  predecessor's account (old proxy 3, forages identical, judged numbers
  identical where the predecessor reported them for 61802).
- D5 PROOF TEST: scripts/test-falseclose-b.js green (fixture old-vs-new
  cases, fallback-evidence classes, arrived-field semantics). It runs
  before any judged sim is quoted, and is re-run after the judged runs
  to confirm the committed instrument is the judged instrument.

## Verdict rule

GO (for quoting the proxy) iff D1, D2, D3, D4, D5 all pass. The verdict
covers the INSTRUMENT only: a GO means "the arrival-conditioned count
may be quoted as false closes"; it lands no guard, flips no default,
and changes no game behavior. Any bar miss is NO-GO for quoting, and the
evidence file says which bar missed and what the numbers actually were.

## Balanced panel (§15)

The panel comparator is attempted (competent vs competent-latescape-b,
fresh band, 30d). The predecessor recorded a matched-policy refusal for
this pair; if it refuses again, its refusal is recorded verbatim and
the run is judged from driver tables — the panel is the instrument, the
prereg bars are the judge, and the comparator is never overridden.

## Metric review (to be completed in the evidence file, never a re-score)

To be written after the judged runs: whether the arrival definition
proved sufficient, whether the legacy fallback under- or over-counted
against the authoritative field on any seed, and any proposed revision
for the NEXT run only.
