# sim-standecon — standing-economy diagnostic census + stale-doc/comment fixes (loop A, axis scale-onramp, 2026-10-15)

ZERO behavior change. Instrument-only census + comment/doc/prose fixes for the three
open sim-findings items from the wave4gate audit
(fleshout-a-2026-10-15T151641Z):
STALE WAVE-4/5 GATE DESCRIPTIONS, DEFER BEAT NAMES THE MIRROR DRAFT PRE-WAVE-3,
HARNESS SILENCES SYSSAY (documented, harness default untouched — loop-level call stands).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — written before any seed ran)

- **Primary metric:** 100% attribution of standing sources at unlock + days-to-w4
  per road. For every run that unlocks wave 4: war/diplomacy/plenty shares of
  raw standing at the unlock row (from persisted rows, sampled every 5 game-days
  + unlock transitions), and the days-to-w4 distribution per policy road
  (leadfeast / belongfeast).
- **GO threshold:** all 16 runs fully classified (censusGo: every run classified
  AND every w4-unlocking run's sources attributed) AND the calibration brief
  written with measured-vs-intent numbers.
- **MISS (diagnostic):** attribution < 100% on unlocking runs.
- **Horizon:** 180d, death-aware (+10d dead-village tail in sim-harness; dead
  villages stop simulating). Why: the question is what the standing economy
  looks like on runs that live long enough to knock on the wave-4 bar; short
  deaths census at their own standing numbers.
- **Seeds:** 8 (11,22,33,44,55,66,77,88) × 2 policies = 16 runs. No lever —
  diagnostic only. Same substrate as the wave4gate audit this run builds on.
- **Policies:** leadfeast (leadcourt + feastscale r13), belongfeast (belongseek +
  feastscale r13). FEASTSCALE_R13=1 asserted at the top of the sweep script.
- **Secondary:** the plenty-cap bind at w5 (gated-at-199 events per road);
  source-gain traces (per-run per-day war/dip/plenty deltas); feasts-at-unlock
  on the bread road (is t4=100 "nearly free"?); wall numbers
  (national/table/wave-4-5/median survival/exiled).

Instrument: scripts/standing-lib-20261015.js (sampler = wave4gate's proven
sampleGate + pure census functions: shares/dominantSource/unlockRow/gainTrace/
censusRun/censusRoad/censusGo), scripts/standing-census-20261015.js (the
16-run sweep), scripts/test-standing-20261015.js (proof test: 49/49 checks —
constructed states classify correctly; engine-read equivalence; the defer-beat
knowledge gate on both sides of wave 3).
Raw rows: evidence/2026-10-15/standing-rows.json.

## PART A — stale descriptions (comment/doc/prose fixes, no behavior change)

1. **game.js WAVE UNLOCK comment block (~29142-29168):** rewrote the dead r17
   two-rung lines. Wave 4 = w3 rung met AND villageStandingTotal() >= t4(100)
   via blood/bonds/bread (pure or hybrid), with the readiness-gate v3 hold at
   t4-1 named. Wave 5 = w3 rung + villageStandingTotal() >= t5(200) AND
   wave-4 faced, bread capped at 100 toward t5, peak ratchet. The comment now
   states the measured gate and cites the 2026-10-13 flexible-route call and
   the 2026-10-15 retirement of the old gates. Verified: comment only, no
   code lines touched.
2. **docs/MONSTER-WAVES.md Implementation section:** same fix, referencing the
   Wave 4/5 canon sections (which already described the standing gates
   correctly) — the doc no longer contradicts itself. Levers now list both
   src/data/wave-ledger.json (waves 2-3 bars) and standing.js standingCfg()
   (t4/t5 + readiness gate).
3. **Defer-beat knowledge gate (standing.js _standingHoldBeat, prose-only):**
   the defer4 beat no longer names "The Mirror Draft" before wave 4 is earned.
   Because the hold can bite before wave 3 unlocks (bread road hits t4 early),
   the beat is wave-3-aware: pre-wave-3 it says "The next act is not for
   strangers. Face what hunts you now — stand on the grid, more than once,
   more than one kind."; post-wave-3 it may name "the Final Draft" (earned)
   but still never the Mirror Draft. The w3 check reads day floor + wave-2
   ledger directly (unlockedWave() recurses through villageStandingTotal() —
   calling it from the beat would be a recursion bug; documented in the code
   comment). Mechanics untouched; the 29/29 readiness-gate tests still pass
   (they pin "not for strangers" / "more than one kind", both preserved).
   The defer5 beat needed no change: it can only be the binding hold when
   peak >= 4 (wave 4 already released — the name is earned there).
   [needs-eyes] on the commit — player-facing dialogue.
4. **HARNESS SILENCES SYSSAY:** harness default NOT changed (loop-level call
   stands). This run reuses the sanctioned instrument-side pattern (route
   Game.sysSay through the wrapped say with the engine's own 📺 routing,
   systemArrived honored) and documents it in the sweep script header.
   23 defer beats + 1 cap beat + 54 release beats captured across the 16 runs.

## PART B — standing-economy census (results)

**GO check: GO.** censusGo over all 16 runs: every run classified, every one
of the 15 w4-unlocking runs' sources attributed at 100%. (The 16th,
belongfeast s44, died d60 at raw 80 — never knocked; its end-state row still
carries an honest breakdown.)

### The roads, in standing numbers

**leadfeast (LEAD road): w4 8/8, w5 6/8. Days-to-w4: [55,76,77,77,81,84,106,149], median 81.**
Mean source shares at unlock: **war 4% · diplomacy 31% · bread 65%**.
Dominant source: bread 6, diplomacy 1 (s66: 63% dip — the only dip-majority
unlock), hybrid 1 (s22: 10/41/49). Feasts@unlock median 6 (range 3–13);
links@unlock = 3 (the 102-dip realm) in 6/8 runs, 0 in 2 — s11 (d76) and
s33 (d55) unlocked on **pure bread**: 5 feasts, 0 kill points, 0 links.
Blood's max share at any unlock: 12% (s44: 2 kill points). No unlock was
blood-majority or bonds-majority; bread was the plurality-or-majority
source on 7/8.

**belongfeast (BELONG road): w4 7/8, w5 0/8. Days-to-w4: [57,58,72,75,100,104,112], median 75.**
Mean source shares at unlock: **war 12% · diplomacy 2% · bread 86%**.
Dominant source: bread 7/7. Feasts@unlock median 7 (5–9). Diplomacy is 0 on
6/7 unlocks — lone seasoned bonds score 0 under the 2026-10-14 regional+
filter, so the BELONG road runs on bread with a blood trickle (war 12% mean;
max 24% at s11: 2 kill points).

**Gain rates (per game-day, pre-w4):** bread ~2.0/day on both roads (~1 major
feast per 10 days); diplomacy 0.81/day on lead (links season ~day 30+, then
+34 each), 0.06/day on belong; war 0.3–0.5/day (one wave-3+ kill point = 25
standing ≈ every 50–80 days). War is the slowest source by an order of
magnitude — the flexible-route design's "blood" is earned through the
faced-deferral (3 wave-3 kinds faced, fleeing counts), not through kill
points.

### The plenty-cap bind at wave 5

**5 runs cap-bound** (earned the bar on raw, held at 199): leadfeast s11
(1 gated-at-199 row) and belongfeast s11/s55/s77/s88 (7/4/12/2 rows). Their
final numbers: bread 180–220, blood 25–50 (1–2 kill points), bonds 0 — raw
205–270, capped 125–150. **Bread alone never bought the fifth draft**, exactly
as designed. All 6 w5 unlocks came through the lead road with 3 regional+
links (102 diplomacy) plus bread/blood over the cap; at unlock their shares
were war 0–25% / dip 21–49% / bread 39–64% — even at wave 5, bread is the
largest single source on 5/6.

### The readiness gate v3, end to end (leadfeast s88)

d91–96: raw 262 (war 0 · bonds 102 · bread 160), HELD at wave 4 by the
faced-deferral — standingLine: "HELD at wave 4: the fifth draft waits".
d97: faced bar met → wave 5 opens, peak=5. d117: the realm collapses
(links 3→0, dip 102→0, raw falls to 180) — the gated total stays at 200:
"wave 5 held open (standing floor)". The peak ratchet works exactly as
designed, and the readout names it honestly. Defer → release → ratchet,
all three layers exercised in one run.

## Sense verdict (SENSE-TESTING LAW)

Read the full beat stream for belongfeast s55 (w4@d57, cap-bound at w5, died d98).
**EARNED, and the new prose holds the knowledge gate:**

- d27/d45: wave 2 / wave 3 release beats ("New casting directives incoming").
- d50: the rewritten defer beat fires (bread road hit t4 at d50, faced 1/3):
  "📡 The next act is not for strangers. Face what hunts you now — stand on
  the grid with the Final Draft, more than once, more than one kind."
  Wave 3 was earned at d45, so "the Final Draft" is named; "Mirror Draft"
  is not.
- d57: reminder ("The next act is still waiting... 2 of 3 kinds faced"),
  then the release: "📡 RATINGS ARE UP... Wave 4 talent has been released.
  The Mirror Draft opens." The title is spoken ONLY at the release moment —
  when it is earned.
- d78: the cap beat: "📡 The fifth draft is not bought with bread alone.
  Bread counts a hundred toward it and not a crumb more — bring blood or
  bonds for the rest."

The leadfeast s22 stream shows the w3-aware variant switching mid-hold:
d57 (pre-wave-3) "The next act is not for strangers. Face what hunts you
now — stand on the grid, more than once, more than one kind." → d71/d78
(post-wave-3) "...Stand on the grid with the Final Draft — 0/3 (1/3) kinds
faced." Fiction and mechanics agree at every step.

## Calibration brief for Steve (a DESIGN BRIEF, not a redesign)

**Measured vs the intent comment.** standingCfg()'s comment says t4 was tuned
so "wave-4 organic unlocks on ~30-50% of day-80+ runs; earliest T4 >= ~day 60".
Measured on the feastscale courtship substrate: **13/13 day-80+ runs unlocked
(100%); earliest unlock day 55** (leadfeast s33, pure bread). The bar is far
easier than intent — on this substrate. The comment itself says the numbers
are "sim starting points, not canon — tune on measured evidence", so this is
evidence, not a violation.

**Is t4=100 "nearly free" on the bread road? Yes, conditional on survival.**
Five major feasts (quality>=1) open wave 4; villages bank ~1 per 10 days, so
any village that survives to ~day 60 with a working feast economy unlocks on
bread alone — 2 pure-bread unlocks observed (5 feasts, 0 kills, 0 links).
The "nearly" matters: 7/16 runs died before day 100, and the one run that
never knocked (belongfeast s44, died d60 at raw 80) shows the filter is
survival + feast economy, not the bar. The t4=100 number is nearly a
formality; **the faced-deferral (3 wave-3 kinds) does the actual pacing work**
— days-to-w4 spans d55–149 mostly on deferral + survival, not on the 100.

**What raising the bar would cost the courtship/survival road.** The BELONG
road has no diplomacy by design (regional+ filter) and little blood (12%
mean share). Its only levers are bread and blood. Raising t4 to 150 means
~8 feasts (~+20–30 days at measured rates) or 4 kill points + 5 feasts — and
the s44 run is the warning: villages that can't feast fast die before
knocking, so a higher t4 taxes *survival*, not pacing. The LEAD road is
insulated: 3 seasoned links = 102 already, its bread is surplus — raising t4
barely touches it. The honest levers if the ~30–50% intent is the target:
(a) the faced-deferral bar (it's the active brake and it's road-neutral —
fleeing counts, reachable on bread), (b) the feast economy itself
(quality>=1 threshold / feast cost — the food-economy axis's question),
(c) t4 — with the asymmetry above priced in. No change made; this is Steve's
call.

**One structural observation for the scale wall:** the same feast economy
that makes t4 "nearly free" is what carries villages to scale — 5/8
leadfeast runs reached national+ (1 national, 4 global) and table hit 16/16
on this substrate. Food surplus → standing → scale is one pipeline, not
three. The scale wall (competent-policy baseline: national 0, table 0) is a
different substrate's problem; on courtship roads the wall is already down.
The lever that matters for both is the feast economy's cost — which is the
food-economy axis's home turf, not this diagnostic's.

## Metric review (§14)

- GO met as pre-registered: 16/16 classified, 15/15 unlocking runs attributed
  at 100%. The pre-registration was written into the sweep script header
  before any seed ran; the JSON rows carry the same preReg block.
- Instrument limitation, recorded not re-scored: the 400-line say capture
  filled before the cap beat on 3/5 cap-bound runs (s11/s77/s88 belongfeast).
  The gated-at-199 rows prove the bind independently — the beat count (1
  captured, s55 d78) is a capture artifact, not a silent gate. The no-silent-
  gates machinery itself is proven by the 23 captured defer beats and the
  s88 ratchet readout.
- No confirm round: n=16 diagnostic, low noise, every verdict clean. The open
  question is the scale wall on the competent-policy substrate, not this gate.

## Wall numbers (for the loop — feastscale courtship substrate, NOT the competent-policy scale-wall baseline)

- national+: **5/16** (national 1, global 4 — all leadfeast)
- table: **16/16** (tableWaiting || tableEntered)
- wins: not tracked in this arm
- wave 4: 15/16 · wave 5: 6/16
- median survival **119d**, max 182d (1 run survived to horizon; 15/16 village-lost)
- exiled: 0/16

Note for the coordinator: these courtship roads scale far better than the
competent-policy baseline in the standing directive (national 0, table 0) —
substrate difference, not a contradiction. If the loop wants a scale-wall
number from these roads, the wall is already down here.

## PART A verification

- `node scripts/test-readinessgate-20261015.js` 29/29, `test-readinessv3-20261015.js` 29/29,
  `test-standing-regional-filter-20261014.js` 18/18 — all green with the new beat text.
- `test-standing-20261013.js` has 10 failures, PRE-EXISTING and unrelated: the
  test predates the readiness-gate v3 rebuild (7a72b456, 2026-10-15; the test's
  last touch was e7c18b85, 2026-10-13) and asserts the pre-v3 gate shape
  (waves 4-5 without the wave-3-rung stacking). It is not in scripts/green-list.txt.
  None of the failures touch beat text. Flagged here, not fixed (out of scope).
- Proof test scripts/test-standing-20261015.js: **49/49** (pure census on
  constructed states; engine-read equivalence incl. sampler determinism;
  defer-beat knowledge gate both sides of wave 3, first + reminder).
- Diff of src/js changes: game.js comment block only; standing.js one beat's
  prose (+ w3-awareness branch, try/caught, no mechanic touched). No ontology
  changes (no new modules/methods — standing-lib is scripts/).
