# sim-detourclear-b — PREREG (committed BEFORE any judged sims)

Run: oversight-flesh-out-loop-b, arm sim-detourclear-b. Worktree
sim-detourclear-b, branch sim-detourclear-b. DIAG ONLY: zero src/js
changes, zero policy-default flips, zero edits to any existing policy
file or existing script. New files only: this prereg, detourclear
trace driver + analyzer + proof test, evidence, censuses/corpora.

## Question (from sim-offergeo-b, run 2026-11-01T0630Z — verify, don't inherit)

Offergeo pooled (120 seeds x 2 stacks, 7,178 evenings): haven offered at
Manhattan d <= 3 (47/47) and never at d >= 4 (0/239); of 47 offered
evenings, 39 hop-REFUSED, every refusal an INTERMEDIATE block
(fallen_tree 27, washed_out 8, creek 4; rubble 0), with walkable
BFS routes around unused (detour gate OFF). An evening-detour lever
already exists as a default-OFF instrument that walks the BFS
route-around (evidence/2026-10-29/sim-eveningdetour-b.md, GO pilot +
confirm, 32/32 rescued). THIS arm asks the SEPARATE alternative:
could the villager CLEAR the blocking tile in the evening step
instead of walking around? On which refused evenings would clearing
beat detour, and where would clearing fail where detour succeeds?

## Canon (read first)

- docs/CANON.md manifest: no canon doc covers intermediate-block
  clearing as an evening lever. docs/MAP.md covers the ground rules
  used here: blockages (fallen tree / rubble / washed out) guard
  approach sides; ~35% of creek tiles need a bridge or a swimmer;
  travelTo's intermediate-blockage scan refuses a hop honestly with
  the block named; node travel is FREE (no kcal, no ticks) by the
  standing rule; NO TELEPORT. docs/TIME-ECONOMY.md: TICKS_PER_DAY
  512 (4 parts x 128); clearing is work that bills ticks.
- Code facts (src/js/game.js clearBlockage / buildBridge /
  travelBlockage / tickAction; src/js/app.js showBlockage labels) —
  hypotheses the probe leg verifies live, not assumed verdicts:
  * fallen_tree: clearable by hand, 60 kcal, 32 ticks, +2 wood.
    No tool check in code (no hasCuttingTool gate).
  * rubble: clearable by hand, 40 kcal, 32 ticks, +1-3 stone.
  * washed_out: if wood >= 4, clearBlockage DELEGATES to
    buildBridge (4 wood, 60 kcal, 96 ticks); else scramble, 80 kcal,
    32 ticks. Either way the block is deleted.
  * creek (type creek, needsBridge, unbridged): NOT clearable by
    hand — clearBlockage refuses ("can't clear it with your hands.
    Bridge it (4 wood) or swim it"). Bridge: 4 wood, 60 kcal,
    96 ticks. Swim: 20 kcal, swimmer skill only — and
    travelBlockage returns NO block for a swimmer, so a creek
    refusal implies non-swimmer (probe must verify, not assume).
  * kcal is NOT a hard gate in clearBlockage (Math.max(0, kcal -
    cost) floors at 0); wood >= 4 IS a hard gate for bridges.
  * Clearing bills ticks; if dayTicks + cost >= 512, tickAction
    runs endDay() — a clearing that rolls the day inside the
    evening step is a live failure mode to watch for, not a
    bookkeeping detail.
  * Honesty caveat (pre-registered): clearBlockage itself checks
    NO player position — a lever must first WALK to the approach
    tile (the tile the block guards entry from) before clearing.
    The probe leg walks there honestly (BFS-clean orthogonal
    steps) and records the walk; a probe that cleared remotely
    would be a surprise, not a result.

## Legs (identical seeds, 30d, death-aware — dead villages stop)

- CENSUS leg (no intervention): plain nighttravel, detour gate
  OFF (COMPETENT_EVENING_DETOUR unset/0, asserted FATAL), substrate
  gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1.
  Driver: scripts/detourclear-trace-b.js (new). Per loop-day it
  records the nighttravel record (ctx._ntLast) and, on every
  travel-refused evening, a LIVE classification: departure,
  hopReturnKind, blocked tile + approach tile (found by probing
  travelBlockage over shortest-path intermediates — read-only),
  detour BFS length/path (read-only mirror of nighttravel's BFS),
  kcal, woodCount, swimmer flag, dayTicks, ticksToDayEnd
  (512 - dayTicks), hop distance. No verb calls in the census leg.
- PROBE leg (same seeds, same gates, driver intervenes ONLY on
  travel-refused evenings): walk to the approach tile via
  BFS-clean steps, then call the honest clearing action for the
  block type (clearBlockage for fallen_tree/rubble/washed_out;
  buildBridge for creek when wood >= 4; no action recorded when
  creek + wood < 4 — that IS the fail case), verify block-gone
  via travelBlockage, re-hop travelTo(haven), record kcal/tick
  deltas, day-roll (gameDay change), combat-live, and final
  position. Probe-leg later evenings are POST-INTERVENTION and
  are NEVER pooled into census counts; the probe leg's judged
  outputs are attempt rows only.
- Seeds (pilot, 8): 17563, 17567, 17568, 17606, 17629, 17631,
  17637, 17638. Rationale (stated, not hidden): offergeo's
  refusals concentrated in the 17563-17637 block (refused seeds
  17563, 17567, 17606, 17629, 17631, 17637); two neighbours added
  so the pilot is not only refusal seeds. This is a
  CLASSIFICATION census, not a prevalence estimate — rates are
  reported with that label and never generalized to the field.
- Horizon: 30 loop-days (matches offergeo corpora; refusal
  clusters appear within days 4-23 there). Death-aware: runDays
  stops at death; daysAlive/endReason recorded per seed. Never a
  fixed 200d.
- Policies: nighttravel (competent.daily + evening hop). No
  woodcarry/woodwarm wrappers (their bridge retry would move
  refusals before classification).

## Primary metric + GO threshold (judge exactly against this header)

PRIMARY: refused evenings classified by block type x clearability
inputs (block type, blocked tile, approach walk steps, kcal,
wood, swimmer, ticks left, detour length) in the census leg,
PLUS a clearing-vs-detour verdict per block type from probe
attempts.

GO requires ALL of:
(a) >= 8 census refused evenings with COMPLETE classification
    (no missing field counts toward the 8).
(b) >= 8 probe attempts, at least one per block type observed
    in the census leg.
(c) A verdict table with one row per observed block type
    (fallen_tree, washed_out, creek; rubble only if observed,
    else a proven-zero statement from this census + offergeo's
    0/39), each row stating: clearable in code? probe success
    rate, median cost (kcal / ticks / wood), median detour
    length, and the verdict label under the rule below.
(d) Proof test scripts/test-detourclear-b.js green + every
    census/probe number re-readable from a committed corpus file.

Per-evening verdict rule (fixed now, never re-scored mid-run):
- clearable in code AND probe cleared + re-hop reached haven:
  * 'clear-beats-detour' if detour length >= 4 steps OR the same
    blocked tile recurs on >= 2 census nights (permanence: one
    clearing fixes every later night; a detour must be re-walked
    nightly);
  * else 'both-work-detour-cheaper-tonight' (detour is free in
    kcal/ticks; clearing pays work for a one-night gain).
- clearable in code AND probe did NOT clear/reach:
  'clear-fails-detour-wins' if a detour path exists, else
  'both-fail'.
- not clearable in code (creek, wood < 4, non-swimmer):
  'detour-only' if a detour path exists, else 'neither'
  (stranded — a new finding, reported as such).
A miss on (a)-(d) is NO-GO, never re-scored against a friendlier
metric. Metric doubts go under "metric review" in the evidence
file and propose revisions for the NEXT run only.

## Sense-testing (SENSE-TESTING LAW)

Read at least 2 refusal day-lines from census corpora and the
probe say-lines (clearing narration + re-hop narration) and
judge meaning: does the clearing read as a person doing roadwork
at night, or as a silent teleport-style fix? Quote lines in the
evidence file. A probe that clears without any narration is a
finding, not a pass.

## Metric review (to be filled in the evidence file)

- Whether plain-nighttravel refusals reproduce offergeo's
  block-type mix (wrappers differed, so drift is possible).
- Whether the approach-walk step count changes any verdict
  (it is free in kcal/ticks but can meet combat — probe records
  combat-live after the walk).
- Whether the day-roll failure mode fired on any probe attempt.
- Whether kcal-floor (cost charged at 0 kcal) changes the
  "affordable" reading for any block type.
