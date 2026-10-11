# Contest reachability gaps — 2026-10-11 (Steve: "Address any gaps!")

Source: playtest loop establishment-leg report (journey-establishment-r2.md) documented two gaps; both fixed here.

## Gap 1 — pilot window miss (~13% of seeds)

**Cause:** the pilot episode is just the first contest fired, and firing runs on the
ratings-driven 0.25/day chance roll. (0.75)^7 ≈ 13.3% of seeds rolled dry through
day 21 and never saw the on-ramp — exactly matching the field report (424242's
pilot landed day 32).

**Fix (src/js/contests.js, contestTick):** PILOT GUARANTEE — if day >= 21 and no
pilot has aired, the System bumps the schedule: the chance roll and the 2/week
budget are skipped for this one fire. It is always a CONTEST (never a show or
ratings summons). Eligibility and one-interruption-at-a-time still hold — canon
"unavoidable" means announced, not forced on a dying village.

**Proof (scripts/test-contest-gaps-20261011.js):** pilot coverage days 14–21,
40 seeds, identical seeds before/after: **35/40 → 40/40**. Hostile-RNG unit
test (all rolls fail): day-21 tick now forces a contest event.

**Sense check:** the pilot announces itself out loud — "PILOT EPISODE — a test
broadcast. Pardon the jank. The countdown is new, the arena is still warm from
assembly, and we have never done this before." An event, not a pop-up.

## Gap 2 — prize lanes rarely visible in-leg (~0.5/leg)

**Cause:** the System lane was calibrated at 0.60/win, but wins are the throttle
(~1.2/run) — 0.6 × rare wins = rarely seen. Field: 0 lane prizes across 6
contests/40 days; unit measurement 25/40 wins showed a lane.

**Fix (src/js/contests.js, _cxPrizeLane):** FIRST-WIN GIFT — the player's first
win of a run now always brings a System gift (chance 1.0, flag `cxFirstWinGift`
set only on a real grant so an impossible roll doesn't burn the guarantee).
Later wins keep the 0.60 roll. Diegetic: the System hooks its winners.
Visible, not a fountain — contests stay FEARED, total lane volume barely moves
(wins are still rare).

**Proof:** first-win gift under hostile RNG (0.60 roll fails) → granted; second
win under hostile RNG → nothing (roll intact); 40 seeds × one win, identical
seeds before/after: **25/40 → 40/40** wins show a lane.

## Regressions
- test-contest-prize-lanes-20261011.js: 52/52
- test-contests-playable.js: 1302 pass
- test-contest-fear-20261011.js: 21/21
- validate-ontology.js: 76/76
