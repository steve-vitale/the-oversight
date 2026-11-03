# sim-sensorredesign-b — SENSOR REDESIGN PILOT PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T013651Z,
arm sim-sensorredesign-b, axis food-economy. Worktree
sim-sensorredesign-b, branch sim-sensorredesign-b. Base at
spawn: 90637bc7c (journey-deepening r87 recovery; includes
the 1830Z cband/atimescale landings). This arm changes NO
game code, flips NO policy default, edits NO existing
script or policy file. New files only, all named
*-sensorredesign-b.*: this prereg, the proof test
(scripts/test-sensorredesign-b.js), the thin analyzer
(scripts/analyze-sensorredesign-b.js, which imports the
reused gatediseng analyzer for the (c) cross-check and
adds only the new rule, lead arithmetic, and the pilot
verdict), the evidence file, and the pilot corpus
(evidence/2026-11-02/sim-sensorredesign-b-pilot.jsonl /
*-summary.json / *-sweep.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and
scripts/policies/competent.js are REUSED VERBATIM,
read-only, never edited.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the
gatediseng sensor itself — it is a policy-side sim
instrument, not a game system; no canon is invented for
it. docs/PRESERVATION.md (food ladder) is adjacent, not
the sensor. This arm invents no game system: it measures
would-fire overlays on existing evening trajectories.

## Background (read, never re-litigated, never re-judged)

- Sensor (c) STAND-DOWN + TREND (gatediseng-b, confirmed
  twice on cost: 0/12 on 522, 2/12 on 767) is cheap but
  TIMELINESS-FAIL on the first fresh collapsing band
  (collapseband-b, screen 79001-79064, band 79006 / 79019 /
  79031 / 79064): carried-margin leg 1/4, 51608-class leg
  0/4. 51608 remains the sole in-time observation, now
  outnumbered on fresh evidence.
- The two named structural flaws, both from
  collapseband-b, are this arm's charter (a NEW RULE
  SHAPE, not a threshold tweak; the (c)-vs-(a) tradeoff
  was measured both ways and no swap was claimed):
  (1) CLIFF-BLINDNESS (79006, 79031): a store emptying
  in 2 evenings can never satisfy a strict 3-fall rule
  (the 0 -> 0 evening is flat, not a fall).
  (2) BOUNCE-DELAY (79019, 79064): a 1-2 evening pantry
  rise right after stand-down restarts the 3-fall clock
  (79019 fires day 19 instead of ~16; 79064 day 20
  instead of ~18).
- Common thread (collapseband-b): on all four band
  seeds the big slide happens substantially WHILE
  ENGAGED, so (c) starts watching only after most of
  the fall has already happened. This arm does NOT
  chase the engaged slide itself ((a) already owns that
  tradeoff and failed its cost leg); it redesigns the
  post-stand-down rule so a bounce cannot restart its
  clock and a cliff can fire it.

## The new rule (e*): STAND-DOWN + ENVELOPE + HUNGER CORROBORATION

Let S be the first evening of the current disengaged
stretch (gateEngaged false at S, true at S-1, or the
run's first recorded evening). Let peak(D) be the
MAXIMUM pantry over evenings S..D in the same stretch
(the envelope: a rise raises the bar, it never restarts
a count). Let falls(D) be the COUNT of evenings t in
(S..D] with pantry(t) < pantry(t-1) (cumulative, not
consecutive: a rise between falls does not erase them).

Fire at the FIRST evening D in the stretch with D > S,
D >= 8, disengaged, and hungryStreak(D) >= 1, where
either clause holds:

- (E1) ENVELOPE-SLIDE: falls(D) >= 2 AND
  pantry(D) <= 0.90 * peak(D).
- (E2) CLIFF: pantry(D) <= 0.65 * peak(D)
  (no fall-count requirement: a single-evening or
  cumulative steep drop fires on its own).

Why this shape answers the two flaws, structurally:
- Bounce-immune: (c) needs 3 CONSECUTIVE falls, so one
  rise restarts it. (e*) counts falls cumulatively and
  anchors to the stretch peak, so a rise only raises
  the peak — it cannot restart the count. 79019's
  day-16 +60 rise and 79064's two-evening recovery to
  10,284 cost (e*) nothing but a higher peak.
- Cliff-aware: (c) needs three evenings of falling and
  the cliff villages have two. (e*)'s E2 fires on a
  steep drop regardless of fall count, so a
  2-evening emptying speaks on its second evening.
- Hunger corroboration (the non-pantry signal from
  collapseband-b metric review (5) / backlog item (10),
  folded in as a gate, not a replacement): a pantry dip
  on an evening with zero hungry evenings is a stock
  wobble, not distress — the village's own hunger
  count must agree before the rule speaks. This is
  what keeps the looser 2-fall trigger from firing on
  every dip: the streak gate, not a tighter pantry
  fraction, carries the cost discipline.

DESIGN-HONESTY NOTE (stated before judging): the (e*)
shape was iterated on ARCHIVED trajectories (the
collapseband band + the 767 confirm band + the full
790 screen, all already published) before this prereg
was written — including the streak gate, which was
added when the ungated envelope fired on two
streak-0 survivor stretches. The pilot below therefore
judges (e*) against (c) on a KNOWN band, not a fresh
one: a pilot GO here is a shape that survives its
own design band and earns a FRESH-band confirm
(12-16 seeds including a fresh collapsing screen,
coordinator's next step), never a deploy claim. The
prereg bars below are set from carried conventions
(the <= 25% cost bar, the lead-vs-(c) comparison),
not fitted to the pilot seeds' archived outcomes —
but the reader should know the design band is known,
and no deploy claim may cite this pilot alone.

## Pilot band (fixed here, BEFORE any judged sim)

8 seeds, competent, 30d, gatediseng-line substrate
(identical to collapseband-b): the 4 collapseband band
seeds (79006, 79019, 79031, 79064 — the full known
collapsing band, all starvation-class) PLUS the first
4 surviving seeds of the 790 screen in seed order
(79001, 79002, 79003, 79004 — deterministic, stated
here, not chosen by firing outcome). All 8 are re-run
FRESH on current base via the verbatim gatecover
tracer, one node process per seed, each line appended
to evidence/2026-11-02/sim-sensorredesign-b-pilot.jsonl.

BASE-EQUALITY CONTROL (before any judged leg): each
fresh pilot line is compared to its archived
collapseband screen line. Byte-identical lines confirm
the base reproduces the design band; any mismatch is
reported loudly and the judged legs run on the FRESH
lines (both rules on identical fresh trajectories —
still a valid comparison), with the drift named as a
substrate finding, not hidden. If a fresh line's rows
!= daysAlive, that seed is re-run once and the retry
reported loudly; a seed is never judged on a mismatched
row count.

## Judged legs + GO bars (fixed here, BEFORE any judged sim)

Reference day per collapsing seed (carried rule): the
first starvation death day if the seed has any
starvation death, else its collapse day (daysAlive).
Lead = reference day - first firing day. A collapsing
seed with NO firing has no lead and fails outright;
for lead-vs-(c) comparisons, no-fire counts as
negative infinity (worse than any firing).

- TIMELINESS LEG: (e*) fires on 4/4 collapsing pilot
  seeds AND lead_e >= lead_c on 4/4 AND lead_e >
  lead_c on >= 2/4. (Beats (c) strictly on the band
  it failed, and covers every collapsing seed.)
- COST LEG: (e*) fires on <= 1/4 pilot survivors
  (the carried <= 25% bar, applied to the 4-seed
  pilot; the full-band context rates — (e*) vs (c)
  on the archived 790 screen and 767 band — are
  reported alongside, not judged).
- CROSS-CHECK LEG: this arm's analyzer's (c)
  first-firing matches the reused analyzer's (c)
  first-firing on all 8 pilot seeds. Any mismatch =
  INSUFFICIENT-DATA (loud failure, not a re-score).
- GO = timeliness leg AND cost leg AND cross-check
  leg all hold. A miss on any leg is NO-GO, never
  re-scored mid-run (no margin relaxation, no seed
  substitution, no clause redefinition).
- SECONDARY (reported, NOT judged): count of
  collapsing seeds with lead_e >= 1; mean lead_e vs
  mean lead_c on collapsing seeds (no-fire excluded
  from the mean and named); per-seed clause (E1/E2)
  and firing days for both rules.

Verdict words (judged exactly against this header):
- PILOT-GO: all three legs hold. The shape earns a
  fresh-band confirm; it does NOT deploy, and no
  deploy claim may cite this pilot alone.
- PILOT-NO-GO: any leg fails, with the failing leg
  named. The shape does not advance on this evidence.
- INSUFFICIENT-DATA: cross-check mismatch, tracer
  verification failure unrepairable by re-run, or
  base-drift that changes collapse membership of the
  pilot band (a pilot seed no longer collapsing, or
  a pilot survivor newly collapsing) — with the
  failure stated. Drift that preserves membership is
  reported but does not void the legs (both rules
  run on the same fresh trajectories).

## Staged design

STEP 1 — THIS PREREG COMMIT (before any judged sim).
STEP 2 — TOOLS + PROOF (new proof test
  scripts/test-sensorredesign-b.js; pure, synthetic
  series only, NO judged seeds — synthetic rows carry
  no seed numbers from any judged band — run green
  after the prereg commit and before any judged
  application; the reused proof tests
  test-gatediseng-b.js (21/21) and
  test-gatediseng-confirm-b.js (11/11) are also re-run
  green on current master before the pilot).
STEP 3 — CONTROL + PILOT (re-run the 8 pilot seeds
  via the verbatim tracer; base-equality comparison
  vs archived lines; rows == daysAlive each).
STEP 4 — JUDGE ((c) via reused analyzer, (e*) via
  thin analyzer, cross-check, leads, verdict judged
  exactly against this header; wall numbers from the
  pilot band, 30d limit stated).
STEP 5 — SENSE TEST (read transcripts around (e*)
  firing evenings on collapsing seeds — at least the
  79019 day-18 envelope firing and the 79006 day-22
  cliff firing, on fresh lines — and judge in plain
  words whether the warning reads as the village
  noticing in time, in words matching the evenings
  around it; at least three lines quoted).
STEP 6 — EVIDENCE
  (evidence/2026-11-02/sim-sensorredesign-b.md).

## Balanced panel (§15) — inapplicability declared (same as gatediseng-b / collapseband-b)

No balanced-panel compare is fabricated. This arm
changes NO game code, runs NO lever, and its primary
metrics are within-trajectory instrument diagnostics
(would-fire overlays on identical evening series), not
panel metrics. The tables are reported directly in the
evidence file instead, on identical seeds and identical
trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table /
wins. NO wall movement is claimed. What is reported
from the pilot band: survival (seeds survived / pilot,
median and max days alive), wave reach, collapsing-seed
count, and national / table / wins as NOT REACHED IN
WINDOW (expected 0 — late-game states with no fields
in this window, reported as such, not as a rate claim).

## Sense test (SENSE-TESTING LAW)

Read the transcripts (sayLines) around (e*) firing
evenings on collapsing seeds (at least 79019's
envelope firing and 79006's cliff firing, on the
fresh pilot lines), and judge in plain words whether
an (e*) warning on that evening would read as the
village noticing in time, in words matching the
evenings around it. At least three lines are quoted
in the evidence file. A warning that would read as
two voices disagreeing on the same evening, or as an
alarm from nowhere, is reported as such even on a
GO — sense texture does not re-score the timeliness
or cost legs, but it travels with the shape.

## Attribution limits (stated before judging)

- Evening snapshots only: (e*) reads evening
  pantry/gate/streak values, the same reads the
  sensor's counting uses. Intraday flicker is not
  measured and cannot change a would-fire evening
  verdict.
- Would-fire overlay, not a counterfactual: firing
  days are computed on trajectories as run. A real
  (e*) rule could change villager behavior and
  therefore later evenings; whether it would have
  saved any village is unmeasured and is not claimed.
- Single policy (competent) by design; other policies
  may pantry differently. 30-day early window only;
  late-game legs unmeasured.
- Descriptive staged measurement, NOT a causal claim:
  a PILOT-GO here earns a fresh-band confirm on a
  fresh collapsing screen; it does not deploy (e*),
  and any deploy belongs to a future arm's claim.

## Metric review

(To be completed in the evidence file after judging.
Doubts about this header go here, and any revision
applies to the NEXT run, never to this one.)
