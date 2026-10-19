# sim-tendhalf — 2-arm shift comparison

Runs: 16/arm x 2 arms = 32 (8 seeds 65201–65208 x {leadfeast, belongfeast}, paired on identical seeds), 180d death-aware, substrate w5path-vetrel1 + tendhalf layer (armed only), VETREL=1, SEATDRIVE=0.
Base: current master (re-swept control — never compared against the parked corpus).
Pre-registered bars: PRIMARY median survival +10d vs control; GUARDRAILS table >= control-2, no new death modes (>=2 events; named-monster lottery exempt), survival floor -10d, national/wave-4 not degraded.
Bad per-seed files: 0

## Per-variant verdicts

| variant | control med | armed med | delta | primary +10d | guardrails | verdict |
|---|---|---|---|---|---|---|
| tendhalf | 117d | 110d | -7d | NO-GO | noNewDeathModes:PASS nationalNotDegraded:PASS tableBand:PASS wave4NotDegraded:PASS survivalFloor:PASS | **NO-GO (primary miss, guardrails hold — killed)** |

## Wall numbers

| arm | national | table | wins | wave-4 | wave-5 | exiled | median survival |
|---|---|---|---|---|---|---|---|
| control | 11/16 | 13/16 | 0/16 | 14/16 | 0/16 | 0/16 | 117d |
| tendhalf | 12/16 | 13/16 | 0/16 | 14/16 | 0/16 | 0/16 | 110d |

## Survival distributions

**control**: 117d [52, 69, 75, 81, 97, 100, 108, 110, 117, 118, 118, 120, 126, 133, 140, 154]

**tendhalf**: 110d [52, 75, 81, 98, 99, 100, 108, 110, 110, 116, 117, 118, 120, 126, 140, 154]

## Per-policy split

| arm | policy | n | median survival | national | table | wave-4 | def5 reached |
|---|---|---|---|---|---|---|---|
| control | leadfeast | 8 | 110d | 5 | 7 | 6 | 6 |
| control | belongfeast | 8 | 120d | 6 | 6 | 8 | 4 |
| tendhalf | leadfeast | 8 | 110d | 6 | 7 | 6 | 6 |
| tendhalf | belongfeast | 8 | 117d | 6 | 6 | 8 | 4 |

## The window (per arm)

**control**: door-reaching 10/16, died in window 8, attempts 10 {"died":8,"regressed":2}; window deaths 63 (scholar 32 / villager 31); channels {"raid":42,"haven":5,"wild":9,"expedition":3,"alien":1,"other":2,"disease":1}; killer-wave {"w4":40,"w3":6,"w12":8,"null":9}; addressable 59/63.

**tendhalf**: door-reaching 10/16, died in window 9, attempts 10 {"died":9,"regressed":1}; window deaths 57 (scholar 36 / villager 21); channels {"raid":40,"wild":11,"disease":1,"alien":1,"other":2,"expedition":2}; killer-wave {"w4":33,"w3":16,"w12":4,"null":4}; addressable 54/57.

## Cause space (guardrail: no new death modes)

control: {"something wearing a crown of bone, bellowing at the dusk":2,"combat":150,"monster":60,"The Terms of Service":1,"starvation":8,"The Loud Beast":1,"Gavel":1,"alien":1,"a wound that wouldn't close":6,"ambush":2,"contest":4,"sickness":3,"thirst":1,"Performance Review":1,"the night":1,"The Influencer":1,"The Ugly Beast":1}

tendhalf: {"something wearing a crown of bone, bellowing at the dusk":2,"combat":153,"monster":54,"The Terms of Service":1,"The Loud Beast":1,"ambush":2,"contest":4,"a wound that wouldn't close":4,"starvation":4,"sickness":3,"alien":1,"dehydration":1,"thirst":1,"Performance Review":1,"the night":1,"The Influencer":1}

new causes vs control: none

