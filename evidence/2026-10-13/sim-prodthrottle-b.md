# PRODTHROTTLE pilot — production throttling against the village-scale fresh-rot bind
fleshout-b, 2026-10-13 (run 2026-10-14T00:31:37Z) | axis: food-economy | arm: prodthrottle

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
- Question: does stopping fresh-surplus inflows (when the pantry holds >4 fresh days)
  cut village-scale fresh rot without starving the village or breaking tribute?
- Lever: PRODTHROTTLE — in `resolveOneAssignment`, when `prodThrottleEngaged()`
  (pantry fresh days-on-hand > 4 at the measured burn rate), duty
  forage/garden/fish redirects to non-perishable work (wood/water/stone
  round-robin) with a legible "leaves the X standing" beat. Game-code only
  (src/js/game.js); no policy churn. Design call: threshold 4 fresh-days at
  current draw (Steve 2026-10-13 make-the-call, documented for overrule).
  Canon: production routing = honest foraging practice, not a System
  intervention (canon check passed: villagers choose to leave surplus standing).
- Primary metric: fresh-rot share = rot:fresh/(rot:fresh+rot:preserved) in pp,
  summed over the 16-run suite. (Rot classified by foodState at sweep time —
  preserved/rendered/pemmican vs everything else; matches diag-kcal-r8.)
- GO = rot share −10pp vs identical-seed baseline AND hungryDays delta ≤ +1
  AND median survival within ±10d AND tribute-paid not regressed
  (tribute kcal + weeks-current vs baseline).
- KILL = rot share moves <5pp, or hungryDays worsen, or tribute misses
  increase, or median regresses >10d. Metric binds — a miss is NO-GO.
- Horizon: 180d death-aware (pacing-law max). Seeds: 11/22/33/44/55/66/77/88 ×
  leadcourt/belongseek, IDENTICAL seeds before/after (16 runs per side).
  The 16-run pilot IS the gate — no confirm spend unless GO is met.
- Backlog item claimed: sim-findings.md "Village-scale fresh-rot overproduction"
  (2026-10-13, expiry-r16). Preservation drive KILLED at pilot (capacity binds);
  production throttling was UNTESTED — this arm.

## Wall numbers (scale wall — report every run)

| metric | baseline (pristine) | armed (prodthrottle) | delta |
|---|---|---|---|
| fresh-rot share (primary) | 100.0pp (521.5k/521.5k) | 100.0pp (426.5k/426.5k) | **0.0pp → KILL** |
| rot:fresh absolute | 521.5k | 426.5k | −95k (−18%) |
| rot:preserved | 0.0k | 0.0k | 0 |
| median survival | 33d | 33d | 0d (within ±10d ✓) |
| max survival | 158d | 158d | 0d |
| hungryDays (starve proxy) | 48 (24/policy) | 48 (24/policy) | 0 (≤+1 ✓) |
| wins | 0 | 0 | 0 |
| national / table | 0 / 0 | 0 / 0 | — |
| max wave reach | 2 | 2 | 0 |
| tribute paid | 0.0k/0w both | 0.0k/0w both | not regressed ✓ (but unexercised — see metric review) |
| arrears end | 0.0k/0 | 0.0k/0 | — |
| throttle redirects | 0 (pristine) | 10 (5/policy) | mechanism fires, barely |

Identical seeds 11/22/33/44/55/66/77/88 × leadcourt/belongseek, 180d
death-aware, all 16 runs end village-lost (the mortality wall; median 33d).

**Verdict: KILLED AT PILOT.** The primary metric moved 0.0pp (rotPreserved=0 in
both sides — no preserved rot exists in this suite to share against), far below
the −10pp GO and below the 5pp kill floor. The gate engaged only 10 times
across 16 runs: in villages dying by day 33 median, the pantry almost never
reaches 4 fresh days-on-hand, so the mechanism cannot do the work. No starve
regression (hungryDays 48/48), no survival regression (33/33), no tribute
regression (0/0 both sides) — but the KILL condition (rot share <5pp move)
binds. NO-GO, reverted.

## Village assessment (plain words)
The villages looked the same on both sides: 12 strangers hauling food into a
pantry that kept ~1.5k/night feeding the nightly meal, and dying anyway —
mostly to wave-1 ambushes (the mortality wall), not hunger. The throttle's
redirect beat reads as a village decision when it fires ("she checks the
pantry before heading out — the shelves are full, ~10 days of fresh on hand…
leaves the forage standing and turns to the water run instead. The pantry
can't take more; the wild will keep"). But it fired 10 times in ~700
simulated days: the lever's premise (surplus production) describes a thriving
village, and this suite's villages never get to thrive. The rot the suite
measures is mostly death-tail rot — the pantry keeps arriving food nobody is
left to eat. Production throttling is a lever for a village that survives;
on the courtship road as it stands, production isn't the bind — survival is.
One villager behaved oddly-human in both sides: seed 44's belongseek runner
redirected 5 times before the village died — she kept working the woodpile
and the water run while the pantry sat full around her.

## Blanks filled / documented
- Proof test scripts/test-prodthrottle-20261013.js (RED-verified on pristine
  tree, 21/21 GREEN with lever) + measurement scripts/measure-prodthrottle-20261013.js
  survive as instruments for any future arm.
- Documented, not filled: the rot in this suite is death-tail rot — pantry
  inflows outlive the village. Any future village-scale rot lever must first
  beat the mortality wall, or the metric will always be measuring corpses'
  leftovers. Backlog item updated (production throttling → killed at pilot).

## Metric review (§14)
1. The primary metric (fresh-rot SHARE) cannot move in a suite with zero
   preserved rot: any fresh-only reduction keeps the share at 100pp. Absolute
   fresh-rot fell 18% (−95k kcal) and the run was still correctly KILLED — the
   metric as written rewards nothing real here. Next run on this axis should
   pre-register absolute fresh-rot kcal (or the share on a suite where the
   smoke racks actually produce preserved rot).
2. The tribute constraint was unexercised: neither side formed a subordinate
   link (0.0k/0w both). "Not regressed" is trivially true but meaningless.
   The proof test verified payTribute still pays in full from a throttled
   pantry (R4: paid 3000/3000). Next run should either seed links or drop the
   constraint from the GO block and keep it as a guardrail only.
3. The 4-day threshold engages too rarely in a dying suite. If the axis is
   revisited after the mortality wall moves, re-test the threshold at 3 days
   (make-the-call documented for Steve's overrule).

## Convergence state
food-economy: killed-at-pilot (prodthrottle). Axis remains non-converged;
village-scale rot overproduction bind stands — preservation drive (capacity
binds) and production throttling (rarely engages in dying villages) both
killed; pantry triage remains untested at village scale.
