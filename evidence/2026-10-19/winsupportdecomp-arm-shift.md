# sim-winsupport-decomp — 5-arm shift comparison

Runs: 32/arm x 5 arms = 160 (16 seeds 65001–65016 x {leadfeast, belongfeast}, paired on identical seeds), 180d death-aware, substrate w5path-vetrel1 + arm layer (armed only), VETREL=1, SEATDRIVE=0.
Base: current master (re-swept control — never compared against the parked corpus).
Pre-registered bars per armed variant: PRIMARY median survival +10d vs control; GUARDRAILS table >= control-2, no new death modes, survival floor -10d, national/wave-4 not degraded.
Bad per-seed files: 0

## Per-variant verdicts

| variant | control med | armed med | delta | primary +10d | guardrails | verdict |
|---|---|---|---|---|---|---|
| winsupport-full | 110d | 103d | -7d | NO-GO | noNewDeathModes:PASS nationalNotDegraded:FAIL tableBand:FAIL wave4NotDegraded:FAIL survivalFloor:PASS | **NO-GO (guardrail breach — killed)** |
| winsupport-triage | 110d | 111d | +1d | NO-GO | noNewDeathModes:FAIL nationalNotDegraded:PASS tableBand:PASS wave4NotDegraded:PASS survivalFloor:PASS | **NO-GO (guardrail breach — killed)** |
| winsupport-posture | 110d | 104d | -6d | NO-GO | noNewDeathModes:PASS nationalNotDegraded:PASS tableBand:PASS wave4NotDegraded:PASS survivalFloor:PASS | **NO-GO (primary miss, guardrails hold — killed)** |
| winsupport-gated | 110d | 103d | -7d | NO-GO | noNewDeathModes:PASS nationalNotDegraded:FAIL tableBand:FAIL wave4NotDegraded:FAIL survivalFloor:PASS | **NO-GO (guardrail breach — killed)** |

## Wall numbers

| arm | national | table | wins | wave-4 | wave-5 | exiled | median survival |
|---|---|---|---|---|---|---|---|
| control | 21/32 | 24/32 | 0/32 | 26/32 | 0/32 | 0/32 | 110d |
| winsupport-full | 20/32 | 20/32 | 0/32 | 25/32 | 0/32 | 0/32 | 103d |
| winsupport-triage | 21/32 | 22/32 | 0/32 | 26/32 | 1/32 | 0/32 | 111d |
| winsupport-posture | 22/32 | 22/32 | 0/32 | 26/32 | 0/32 | 0/32 | 104d |
| winsupport-gated | 20/32 | 20/32 | 0/32 | 25/32 | 0/32 | 0/32 | 103d |

## Survival distributions

**control**: 110d [41, 64, 67, 69, 70, 74, 79, 85, 86, 87, 89, 95, 100, 101, 104, 107, 110, 112, 116, 123, 126, 136, 143, 144, 145, 147, 150, 155, 160, 182, 182, 182]

**winsupport-full**: 103d [41, 64, 67, 69, 73, 74, 74, 81, 81, 87, 89, 91, 95, 97, 101, 101, 103, 104, 104, 112, 116, 119, 126, 126, 131, 141, 144, 155, 171, 182, 182, 182]

**winsupport-triage**: 111d [41, 64, 67, 69, 70, 74, 74, 87, 89, 95, 100, 101, 103, 104, 105, 107, 111, 112, 113, 120, 121, 126, 131, 133, 133, 136, 146, 150, 155, 182, 182, 182]

**winsupport-posture**: 104d [41, 64, 67, 69, 74, 80, 81, 81, 87, 88, 89, 92, 95, 97, 101, 101, 104, 107, 112, 116, 119, 125, 126, 129, 131, 140, 144, 155, 156, 182, 182, 182]

**winsupport-gated**: 103d [41, 64, 67, 69, 73, 74, 74, 81, 81, 87, 89, 91, 95, 97, 101, 101, 103, 104, 104, 112, 116, 119, 126, 126, 131, 146, 155, 160, 162, 182, 182, 182]

## Per-policy split

| arm | policy | n | median survival | national | table | wave-4 | def5 reached |
|---|---|---|---|---|---|---|---|
| control | leadfeast | 16 | 136d | 13 | 14 | 13 | 15 |
| control | belongfeast | 16 | 101d | 8 | 10 | 13 | 5 |
| winsupport-full | leadfeast | 16 | 116d | 13 | 9 | 12 | 15 |
| winsupport-full | belongfeast | 16 | 97d | 7 | 11 | 13 | 5 |
| winsupport-triage | leadfeast | 16 | 121d | 13 | 11 | 13 | 15 |
| winsupport-triage | belongfeast | 16 | 104d | 8 | 11 | 13 | 5 |
| winsupport-posture | leadfeast | 16 | 119d | 14 | 11 | 13 | 15 |
| winsupport-posture | belongfeast | 16 | 97d | 8 | 11 | 13 | 5 |
| winsupport-gated | leadfeast | 16 | 116d | 13 | 9 | 12 | 15 |
| winsupport-gated | belongfeast | 16 | 97d | 7 | 11 | 13 | 5 |

## The window (per arm)

**control**: door-reaching 20/32, died in window 15, attempts 21 {"died":16,"regressed":4,"horizon":1}; window deaths 113 (scholar 61 / villager 52); channels {"wild":41,"raid":59,"expedition":5,"alien":5,"haven":1,"disease":1,"other":1}; killer-wave {"w4":68,"w3":18,"w12":19,"null":8}; addressable 106/113.

**winsupport-full**: door-reaching 20/32, died in window 18, attempts 20 {"died":18,"horizon":1,"regressed":1}; window deaths 129 (scholar 79 / villager 50); channels {"wild":28,"raid":84,"other":6,"alien":8,"haven":2,"expedition":1}; killer-wave {"w4":83,"w3":15,"w12":15,"null":16}; addressable 117/129.

**winsupport-triage**: door-reaching 20/32, died in window 15, attempts 20 {"died":17,"released":1,"horizon":1,"regressed":1}; window deaths 139 (scholar 74 / villager 65); channels {"wild":49,"raid":76,"alien":6,"other":4,"expedition":3,"haven":1}; killer-wave {"w4":83,"w3":21,"w12":24,"null":11}; addressable 131/139.

**winsupport-posture**: door-reaching 20/32, died in window 18, attempts 20 {"died":18,"horizon":1,"regressed":1}; window deaths 126 (scholar 66 / villager 60); channels {"wild":41,"raid":64,"alien":5,"other":7,"expedition":5,"haven":3,"disease":1}; killer-wave {"w4":67,"w3":21,"w12":22,"null":16}; addressable 115/126.

**winsupport-gated**: door-reaching 20/32, died in window 18, attempts 20 {"died":18,"horizon":1,"regressed":1}; window deaths 128 (scholar 77 / villager 51); channels {"wild":30,"raid":81,"other":6,"alien":9,"haven":1,"expedition":1}; killer-wave {"w4":82,"w3":14,"w12":15,"null":17}; addressable 116/128.

## Cause space (guardrail: no new death modes)

control: {"combat":297,"dehydration":7,"contest":11,"monster":111,"alien":12,"a wound that wouldn't close":11,"The Eater":1,"ambush":2,"The Algorithm":1,"sickness":15,"the night":3,"The Union Rep":1,"Speedbump":2,"thirst":3,"wound_fever":1,"The Static Kite":1,"Loud-Eyes":1,"starvation":3,"Choir Toad":1}

winsupport-full: {"combat":306,"dehydration":9,"contest":14,"monster":99,"alien":15,"a wound that wouldn't close":13,"ambush":2,"sickness":15,"the night":3,"The Union Rep":1,"Speedbump":2,"The Static Kite":1,"Loud-Eyes":1,"thirst":2,"starvation":3,"Choir Toad":1}

new causes vs control: none

winsupport-triage: {"combat":293,"dehydration":9,"contest":12,"monster":115,"alien":13,"a wound that wouldn't close":11,"starvation":6,"ambush":2,"sickness":15,"the night":3,"The Union Rep":1,"Speedbump":2,"The Reunion":1,"The Static Kite":1,"Loud-Eyes":1,"thirst":2,"Choir Toad":1}

new causes vs control: The Reunion

winsupport-posture: {"combat":292,"dehydration":9,"contest":15,"monster":111,"alien":12,"a wound that wouldn't close":12,"ambush":2,"sickness":15,"the night":3,"The Union Rep":1,"Speedbump":2,"starvation":5,"wound_fever":1,"The Static Kite":1,"Loud-Eyes":1,"thirst":2,"Choir Toad":1}

new causes vs control: none

winsupport-gated: {"combat":302,"dehydration":10,"contest":13,"monster":101,"alien":16,"a wound that wouldn't close":12,"ambush":2,"sickness":15,"the night":3,"The Union Rep":1,"Speedbump":2,"The Static Kite":1,"Loud-Eyes":1,"thirst":2,"starvation":3,"Choir Toad":1}

new causes vs control: none

