# journey-scale r38 — PRE-REGISTRATION (lane A, leg 3 SCALE, days 80–140 + post-national tail)

**Run id:** oversight-playtest-loop-20261026T0742Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. **Base:** master at run start (72cf7a672 — journey-deepening
r50). Rebase if a sibling lands mid-run; proof re-run after any rebase.
**Arm:** r37's named next question, NOT a re-measure of betrayal-accept (r37 measured
it to a deterministic blank three runs running; r37's metric review says betrayal
needs a Steve ruling on landing options before it is measured again).
**Driver:** `scripts/journey-scale-r38-20261026.js` — the r37 driver with ONLY run
label / EVIDIR / mode changed, PLUS one read-only daily instrument (`hungerWatch`:
day, policy-time pantry, opening village hungryDays, pilgrim/returning state, that
day's pilgrimage/study/proposal counters, league pool — all reads, no engine inputs
change, no policy change, no new convo days). **Analyzer:**
`scripts/analyze-scale-r38-20261026.js` (r37 analyzer + HUNGER section, labels/EVIDIR
only). **Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched. Zero src/js change is pre-planned: r38 is measurement.

## Leg question (from r37's own evidence, not invented)

r37's two scattered seeds both end on the same engine line — "Haven couldn't hold.
On the fifth hungry day, people started walking" — while the surviving seed (85004)
ran 100 courtPoorDays and never scattered. The code (game.js endDay) ticks the
scatter clock only when pantryKcal <= 0 at endDay, five straight days, unless the
league granary fed that day; any fed day resets it to zero. r37's weekly pantry
samples cannot show those five days (85002's last weekly sample is 361 kcal, not 0).
r38's question: **on each of the five hungry days, what was the policy doing —
was it still walking courtship (pilgrimage/returning) while the pantry stood empty,
and did the league granary ever hold anything that could have fed the village?**

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)

- **HUNGER-WINDOW (measurement-binding):** for EVERY scattered seed, all 5 window
  days are measured from hungerWatch: the day the scatter fires plus the 4 days
  before it, each with policy-time pantry, opening hungryDays, pilgrim/returning
  state, and league pool. Bar: 100% of window days measured; an unmeasured window
  day is a NO-GO on the run's method. The verdict on the GAME is judged, not
  passed/failed by existence: courting on hungry days is either shown or not —
  both are findings, neither is re-scored.
- **PILGRIM-ON-HUNGRY-DAYS (report-only):** count of window days with a pilgrimage
  in progress or a return walk in progress. No bar is set in advance — this run
  establishes the number for the first time.
- **POOL-ZERO (report-only):** league pool on every window day. r37's poolEverMax
  was 0 on all four seeds; r38 checks whether that holds on the window days
  themselves (a nonzero pool on a hungry day would mean a rescue was available
  and unused — a different blank than an empty granary).
- **SURVIVOR-CONTRAST (report-only):** 85004's maximum opening hungryDays, its
  days with policy-time pantry 0, and why its clock kept resetting (fed days) —
  the contrast that keeps "courtship-while-poor" from being misread as "courtship
  causes scattering" (85004 ran 100 courtPoorDays and survived).
- **NO-NUMBER-CHANGE (driver parity):** per-seed outcome lines vs r37 identical
  (day, over, popAlive/popTotal, pantryKcal, pilgrimages, pilgrimagesPoor,
  courtPoorDays, proposedPeer, links, seat). The instrument is read-only, so any
  diff is instrument contamination and a NO-GO on the run's method.
- **BOOK-TITAN (secondary, regression watch):** every titanEscalate −5 still 100%
  booked (r36's fix must hold on the new base).
- **PICK-G (picker-cap guard, inherited):** max consecutive dlg:more/goon ≤ 1 on
  every transcript; post-deflect goon = 0. Any violation is a regression.
- **BONDS/NATIONAL (report-only):** third bond by d110, national by d140, lesser
  seat, wave 5 — same report as r37, no bar.

## Pilot gate

Seed 85001 runs first. If it crashes or pilgrimages == 0, STOP (same gate as r37).
Seeds matched to r30–r37: 85001–85004. Horizon DAYCAP=180, death-aware stop.

## People check

Read r38's own transcripts in full (convo days 90/120, same driver): the NPC wants
something, options engage or deflect it, endings resolve/plant/owe. No counts-only
verdict.

## Metric review (standing notes carried into r38)

- r37: telemetry-check against scale.json baseline is LOUD on panel-observer fields
  the journey census does not carry — EXPLAINED, not a game deviation. r38 runs the
  same-shape check (day, popAlive, pantryKcal on the same 4 files) and does NOT roll
  the panel baseline. A journey-shaped baseline is still owed by a future run.
- r37: BOOK-POOL-WILD stayed NOT-ENCOUNTERED (no covenant ever poolLive). r38 does
  not chase it: no pool-era seed set is pre-registered here, and poolLive stays
  report-only via the window-day pool reads.
