# sim-wildhold — arm-shift comparison (control vs wildhold)

Runs: 24 control + 24 wildhold (8 seeds 63801–63808 x {leadfeast, belongfeast}, paired before/after on identical seeds), 180d death-aware, substrate w5path-vetrel1 + wildhold layer (armed only), VETREL=1, SEATDRIVE=0.
Base: master 27834f44d47b (re-swept control — never compared against the windowsurvive corpus).
Bad per-seed files: 0
## PRIMARY — wild-channel deaths in the window

control: 29 [per-run: 1, 3, 8, 4, 1, 3, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0]

wildhold: 18 [per-run: 2, 1, 1, 0, 0, 1, 3, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 1]

reduction: 37.9% — GO bar >=30% fewer: **GO**

## Guardrails

| guardrail | result | detail |
|---|---|---|
| starvationBound | PASS | 2 vs control 2 (+1 allowed) |
| wave4Band | PASS | 22 vs control 22 (delta +0, band +/-2) |
| survivalFloor | PASS | delta -1d (floor -10d) |
| noNewDeathModes | PASS | none |

## Wall numbers

| arm | national | table | wins | wave-4 | wave-5 | exiled | median survival |
|---|---|---|---|---|---|---|---|
| control | 18/24 | 18/24 | 0/24 | 22/24 | 0/24 | 0/24 | 104d |
| wildhold | 20/24 | 17/24 | 0/24 | 22/24 | 0/24 | 0/24 | 103d |

## Per-policy split

| arm | policy | n | median survival | national | table | wave-4 | def5 reached |
|---|---|---|---|---|---|---|---|
| control | leadfeast | 12 | 104d | 10 | 9 | 10 | 12 |
| control | belongfeast | 12 | 121d | 8 | 9 | 12 | 4 |
| wildhold | leadfeast | 12 | 100d | 11 | 8 | 10 | 12 |
| wildhold | belongfeast | 12 | 121d | 9 | 9 | 12 | 4 |

## The window (per arm)

**control**: door-reaching 16/24, died in window 15, attempts 17 {"died":15,"horizon":1,"regressed":1}; window deaths 104 (scholar 67 / villager 37); channels {"raid":61,"other":5,"wild":29,"alien":2,"expedition":5,"disease":1,"haven":1}; wild-channel 29; killer-wave {"w4":57,"w3":18,"w12":20,"null":9}.

**wildhold**: door-reaching 16/24, died in window 13, attempts 16 {"died":13,"horizon":1,"regressed":2}; window deaths 90 (scholar 62 / villager 28); channels {"raid":53,"other":13,"wild":18,"disease":1,"expedition":4,"haven":1}; wild-channel 18; killer-wave {"w4":43,"w3":13,"w12":18,"null":16}.

## Lever fidelity (armed arm)

runs with any wildhold counter > 0: 16/24; hold-days 645, scholar recalls 10, villager recalls 99, hunts stood down 273, window beats 16.

## Cause space (guardrail: no new death modes)

control: {"combat":244,"contest":11,"the night":1,"monster":60,"alien":4,"dehydration":4,"a boulder with opinions about where you're walking":2,"a wound that wouldn't close":3,"The Algorithm":1,"Hushpuppy":1,"sickness":6,"White Noise":2,"starvation":2,"lockjaw":2,"Performance Review":1}

wildhold: {"combat":238,"contest":20,"monster":55,"a boulder with opinions about where you're walking":2,"a wound that wouldn't close":3,"sickness":6,"dehydration":3,"alien":2,"the night":1,"White Noise":2,"starvation":2,"lockjaw":2,"Performance Review":1}

new causes on armed: none

## Verdict

**GO**
