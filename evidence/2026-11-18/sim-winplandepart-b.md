# sim-winplandepart-b — win-plan depart path exercise — DIAG-GO

Run: fleshout-loop-b-20261118T1030Z, axis winnability-chain. Adoption
closeout — the run coordinator timed out; the pilot was completed by
the adoption (seeds 104021–104025 ran before the arm worker was
cancelled; seeds 104026–104028 run by the adoption).

## The question

Does the win-plan depart path (`winPlanDepart`, `src/js/win-plan.js`)
ever launch wave-4+ parties, and does its launch-time
second-companion re-pick work? Live play never reaches it: the only
caller (`villager-agency.js:446`) runs only when `vbrainOwnsDawn()`
is false, and `vbrainOwnsDawn()` returns true unconditionally
(`villager-brain.js:738`, since the phase-1 brain landed 2026-11-08).
The 0/17 (launchparty band) and 0/43 (triodrought band) depart-path
launches are expected under that gate, not sampling noise.

## Staging

Harness override `Game.vbrainOwnsDawn = function () { return false; }`
in the driver, asserted before the run; `brainOff: true` recorded per
file. Single leg (brainoff); there is no live-mode comparison —
scale-wall numbers on this leg are descriptive only (BRAINOFF reverts
all dawn decisions to legacy mode). Substrate VETREENGAGE=1 +
PARTYSIZE4=1 + FLEEREPAIR2=1, FIGHTALLY2/LAUNCHPARTY unset. Pilot:
8 seeds 104021–104028, 150d, competent.

## Analyzer fix (caught on the first pilot seed, committed here)

The committed analyzer misclassified launch-time re-picks: the call
site is the `launchParty` closure inside `winPlanDepart`, so the raw
stack frame reads `at launchParty (src/js/win-plan.js:...)` while the
driver labels those picks `caller: 'other'`. The pilot summaries
therefore showed `secondPicksDepart: 0` on every seed — the counts
were wrong, not the mechanism. The fix classifies from the raw
`callerFrame` (regex `launchParty|winPlanDepart` for depart,
`winPlanCands` for dawn) and adds selftest synth3 (launchParty-frame
picks still join as depart re-picks). Selftest 9/9, including the
frozen-triodrought dry run reproducing the triodrought numbers
exactly (arm 25 launches / 0 depart-path / partyTrios 0; ctl 18 / 0 / 0).
Proof test `scripts/test-winplandepart-b.js` 18/18 (re-run by the
adoption on the branch tip).

## Results (fixed analyzer, 8 seeds)

`winplandepart-b-analysis.json`: departCalls 869, departLaunches
238, **w4Launches 16** (pool floor ≥3 met); repicks **carried 10 /
dropped 1 / null 5 / unjoined 0** — every wave-4 launch classified;
**trioDeparts 10, triosDeltaSum 10, endTriosTotal 10,
triosMatchAll true** — partyTrios delta = 1 on every launch where
the second companion departed; **brainCalls 0 on all 8 seeds**
(override verified); secondPicksDepart 16 / dawn 48 / other 0;
instrumentErrors 0; `brainOff: true` on all 8 files.

Per-seed w4 launches: 104021: 6, 104022: 5, 104023: 0, 104024: 2,
104025: 1, 104026: 1, 104027: 1, 104028: 0. The one dropped re-pick
is 104021 d115 (picked brian_otieno, final party emma_larsen only);
the five nulls are size-2 launches with no second pick.

## Verdict

**DIAG-GO** — all three bars pass. The depart path is live code
that works when reached: it launches parties (238 total, 16 wave-4+),
the launch-time re-pick carries a second companion in 10/16, and
trios depart correctly. The zero launches on live-mode bands are
entirely explained by the `vbrainOwnsDawn` gate.

## What this does NOT decide (design question, no code change)

Whether the path *should* fire in live play — i.e. whether
`vbrainOwnsDawn` should ever return false again, or `winPlanDepart`
should be called from the brain path. That call belongs to the
coordinator/Steve. This arm makes no game-code change.

Note: the depart path's trio counting is internally consistent here
(triosDelta == endTrios on all 8 seeds). The triodrought
`partyTrios`-counter issue (reads 0 despite 22 trios) is in a
different path and is neither explained nor fixed by this diag.

Descriptive only (brainoff leg): wins 0/8, maxWave 4 on 4 seeds / 5
on 4, median days 150, median standing 257, deaths 889, starvation 2.
