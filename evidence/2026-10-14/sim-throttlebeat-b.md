# THROTTLEBEAT — re-landing the hunger-depth exemption's safety evidence (fleshout-b ARM 3)
2026-10-14 (run-b-20261014T1230) | axis: food-economy | arm: sim-throttlebeat

## Context
The hunger-depth exemption (exempt the prod-throttle redirect when
progState().hungryStreak >= 3) shipped ALWAYS-ON via commit 1a44a2c8
(prodThrottleEngaged() returns false at streak >= 3; diagnosis evidence
158d3604). The r30b tracker note records that the pilot's safety evidence
was NOT carried over: (a) the v.throttleExemptDepth counter, (b) the
sense-tested "hungry eat first" narration beat. Production currently
stands the throttle down SILENTLY. This arm re-lands exactly those two
pieces ON TOP of the shipped always-on code: narration + counter ONLY,
no behavior change. This makes the shipped exemption measurable in sims
(throttleExemptDepth becomes a metric) and narrates it to the player.
Area fenced: src/js/game.js throttle-exemption code only (no overlap with
loop A live arms: hierarchy.js answerRenegotiation, table-diagnostic or
trust-delta instruments — untouched).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims
- Question: can the narration beat + ledger counter be re-landed onto the
  shipped always-on exemption with ZERO behavioral drift?
- Lever: THROTTLEBEAT — game-code in src/js/game.js: (1) a
  prodThrottleHungerExempt() helper, true exactly when the throttle would
  engage on pantry fullness (>4 fresh days) but the hunger-depth
  exemption stands it down (hungryStreak >= 3); (2) in
  resolveOneAssignment, before the redirect branch: on exemption, fire the
  pilot's sense-tested beat ("🍽️ ...but someone has gone hungry three
  days running. The hungry eat first: keeps working the <forage/harvest/
  fish nets> instead of turning to other work.") and increment
  v.throttleExemptDepth. No branch changes, no RNG, no state changes
  except the log line and the counter.
- GO (conjunctive):
  1. Counter: increments on every exemption night in sim (measured across
     the 16-run sweep; zero on non-exemption nights).
  2. Narration: the beat fires on exemption nights and reads as a village
     feeding moment (sense-tested, 2–3 transcripts read for meaning).
  3. Det-gate: 16/16 identical-seed gameplay trajectories byte-identical
     before/after (the change must be behavior-inert: narration + counter
     only).
- Horizon: 180d death-aware (dead villages stop, 10d tail); seeds
  11/22/33/44/55/66/77/88 × leadcourt/belongseek, IDENTICAL seeds
  before/after.
- A miss is NO-GO per §14 — behavior drift is never re-scored against a
  friendlier metric mid-run.
- Metric review: (mandatory section — filled after the run.)

## Proof (scripts/test-throttlebeat-20261014.js)
RED→GREEN verified via the patch-file cycle (no git stash on the hot tree;
patch saved at ~/workspace/throttlebeat-beat.patch during the cycle):
- RED (pristine tree, MODE=red): the shipped always-on stand-down is
  SILENT — helper absent (no prodThrottleHungerExempt), no beat, no
  counter (exempt=0 across streak 3/4 duties on all three food duties),
  production continues (a.task unchanged), streak 1/2 redirects fire with
  the landed beat. ALL GREEN (36 checks).
- GREEN (armed tree, MODE=green): ALL GREEN (36 checks) —
  §1 helper present, gates exactly: streak 0/1/2 → false (redirect path
  untouched), streak 3/4 → true, thin pantry at streak 4 → false (nothing
  to stand down), read-only (pantry bytes unchanged);
  §2 streak 3/4: production continues, redirect beat silent, exemption
  counted (exempt=1), "hungry eat first" beat fires naming the duty, the
  pantry state ("days of fresh") and the depth ("three days running");
  §3 all three food duties carry duty-named beats
  (forage/harvest/fish nets); non-food duty (wood) at streak 3: no beat,
  no counter;
  §4 streak 1/2: redirect fires normally, exemption beat silent, landed
  beat fires;
  §5 ledger accumulates (3 exempted duties → ledger 3, 3 beats);
  §6 behavior-inert: duty task preserved, no redirect counted.
- Green re-verified after the patch re-apply (36 PASS / 0 FAIL);
  `node --check src/js/game.js` clean.

## Det-gate + counter measurement
Three 16-combo legs (seeds 11/22/33/44/55/66/77/88 × leadcourt/belongseek,
180d death-aware, identical seeds): before (pristine), after (patched),
aa (patched rerun). SMOKE=1 instrument-honesty gate green before spend
(policies unwrap, daily invoked 3.8/day, ≥1 policy act — both policies).
Det-gate adjudicator scripts/detgate-throttlebeat-20261014.js:
- 32/32 leg-comparisons byte-identical (before-vs-after + after-vs-aa
  across all 16 combos). DET-GATE GREEN.

| metric | before (pristine) | after (patched) | delta |
|---|---|---|---|
| starve/100vd | 0.937 (15/1601vd) | 0.937 (15/1601vd) | 0 |
| starvation deaths | 15 | 15 | 0 |
| fresh-rot kcal | 2916600 | 2916600 | 0 |
| median survival | 151d | 151d | 0 |
| max survival | 180d | 180d | 0 |
| national | 10/16 | 10/16 | 0 |
| table / wins | 0 / 0 | 0 / 0 | — |
| exiled | 0 | 0 | 0 |
| wave-4 / wave-5 | 8 / 1 | 8 / 1 | 0 |
| hungryDays | 35 | 35 | 0 |
| throttle redirects | 4634 | 4634 | 0 |
| throttleExemptDepth (NEW) | 0 (counter absent) | 407 | +407 |
| exempt runs | 0/16 | 9/16 | +9 |

Counter semantics: per exempted duty decision (matches the pilot's ledger).
On the 7/16 runs where chronic hunger never arrived, exempt=0 — zero on
non-exemption nights, as pre-registered. The 9 exemption-positive runs
(belo s11 74, belo s22 3, belo s77 142, belo s88 11, lead s11 127,
lead s33 10, lead s66 1, lead s77 23, lead s88 16) all ran trajectories
byte-identical to pristine — the counter counts the shipped mechanism's
own stand-downs without perturbing them.

## Sense-test: the exemption beats
Three transcripts read for meaning (leadcourt s77, belongseek s11 live
runs + the proof's forage fixture):

1. (leadcourt s77, fish) — "🍽️ Nino checks the pantry before heading out
   — ~19 days of fresh on hand, but someone has gone hungry three days
   running. The hungry eat first: keeps working the fish nets instead of
   turning to other work." Immediately followed by "🎣 Nino worked the
   creek — 2 fish, +420 kcal to the pantry." The consequence is visible on
   the next line: the haul lands in the pantry — production genuinely
   continues. The beat names the pantry state honestly (~19 days — the
   throttle's own condition), names the depth ("three days running" — the
   gate's actual reason), names the decision. The voice matches the landed
   redirect beat ("checks the pantry before heading out") with the decision
   flipped — consistent register, honest contrast.
2. (leadcourt s77, harvest) — same shape with "keeps working the harvest"
   — duty-named variant, consistent voice.
3. (belongseek s11, fish, Carlos) — "~11 days of fresh on hand… keeps
   working the fish nets" — the pantry number varies honestly with the
   village's real state (>4-day engage threshold), not a canned constant.

Judgment: sensical. It reads as a village feeding moment — someone is
hungry, the pantry is full but the wild keeps its share of the work, and
the hungry eat first. No silent branch; the stand-down is now narrated
where it used to be invisible. The forage variant is proven in the
fixture (sim duties on these seeds assigned fish/garden for the exempted
villagers); per-duty frequency matches the landed redirect beat's own
frequency (~2 beats/day during a chronic-hunger spell), so it doesn't
introduce a new spam class.

## Village assessment
What the villages looked like across the 48 runs (3 legs, trajectories
identical — one village story): 4/16 survived to 180d
(belo s11/s33/s44/s55); 12/16 ended village-lost/village-dead, median
151d. The exemption fired on 9/16 runs — chronic-hunger spells are real
but uneven: lead s11 exempted 127 duties over 86 days (a village living
at the hunger edge), belo s77 142 over 68 days (collapse with the
exemption firing hard), while belo s44 ran a clean 180d with zero
exemptions. Who died and why: combat remains the dominant killer (death
shares identical before/after); the two fast collapses (lead s33 37d with
5 starvation deaths, belo s88 65d) died before the depth gate could matter
(the gate needs 3 consecutive hungry days — same as the pilot's finding).
Who thrived: belo s11's 180d national with 74 exemptions — the shipped
mechanism working through a crisis as designed, now narrated and counted.
The blank this run filled: the shipped exemption's invisibility — the
stand-down now narrates honestly and is measurable in sims
(throttleExemptDepth is a metric). The blank documented, not filled: none
new in this area; beat frequency during chronic-hunger spells (~2/day) is
the pilot's design, kept deliberately.

## Wall numbers
national 10/16 both sides; table 0/16; wins 0/16; wave-4 8/16; wave-5 1/16;
median survival 151d; max 180d; exiled 0. The scale wall stands — no table,
no wins — unchanged by this blank-fill (as expected: narration + counter
only).

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-14/throttlebeat-after-perseed/*.json'
--metrics national,table,wins,exiled`: quiet (16 files, 4 metrics, no
large deviations). No baseline roll.

## Metric review
(mandatory) The det-gate as pre-registered (16/16 byte-identical
trajectories) held at 32/32 comparisons including the patched-vs-patched
A/A leg — no bifurcation on this seed set, so the verdict needs no noise
qualification. The counter GO ("increments on exemption nights, zero on
non-exemption nights") held exactly (407 on 9 runs, 0 on 7). The
narration GO ("fires on exemption nights, reads as a village feeding
moment, 2–3 transcripts read") held. No metric doubts for the next run:
the change is narration + counter only, and the measurement confirmed it.

## Verdict
GO — re-land. Behavior-inert (det-gate 32/32), counter measurable
(407 exempted duties across 9/16 runs, 0 on the rest), narration
sense-tested. Commit carries [needs-eyes] (new narration needs Steve's
eyes on his phone). Scripts landed: scripts/test-throttlebeat-20261014.js
(proof, RED→GREEN), scripts/measure-throttlebeat-20261014.js (sweep),
scripts/detgate-throttlebeat-20261014.js (adjudicator),
scripts/sensetest-throttlebeat-20261014.js (transcript sampler).
