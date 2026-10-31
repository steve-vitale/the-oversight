# sim-strandfix-ticks-b — paired compare (PILOT)

Paired compare .md (NOT an official balance-panel run: the official panel driver cannot express the strand stack — see prereg §15). Control = control-variant legs (PRESSB=1, no strandfix); instrument = instrument legs (PRESSB=1, STRANDFIX=1). Same seeds, same env, same WOODWARM legs.

GO bar: ticks-short fall = 4 (control 6 -> instrument 2); bridge-built conversions = 0; GO = NO (fall >= 2 AND conversions >= 1).

| leg | control creek/still/rescued | instrument creek/still/rescued | control ticks-short | instrument ticks-short |
|-----|------------------------------|---------------------------------|----------------------|-------------------------|
| guard | 10/4/6 | 12/7/5 | 2 ({"alone":2,"plus-wood":0,"plus-kcal":0,"plus-both":0}) | 1 ({"alone":1,"plus-wood":0,"plus-kcal":0,"plus-both":0}) |
| on | 22/17/5 | 15/10/5 | 4 ({"alone":1,"plus-wood":2,"plus-kcal":0,"plus-both":1}) | 1 ({"alone":1,"plus-wood":0,"plus-kcal":0,"plus-both":0}) |

## Conversions (control ticks-short -> instrument same-day)
- guard seed 15215 day 7: control alone ticks 47 (shortfall 49) -> still-ticks-short (instrument wood 4 kcal 2254 ticks 47 held false)
- guard seed 15215 day 10: control alone ticks 93 (shortfall 3) -> ticks-cleared-not-rescued (instrument wood 4 kcal 0 ticks 128 held true)
- on seed 15215 day 7: control alone ticks 47 (shortfall 49) -> still-ticks-short (instrument wood 4 kcal 2254 ticks 47 held false)
- on seed 15215 day 13: control plus-both ticks 95 (shortfall 1) -> ticks-cleared-not-rescued (instrument wood 1 kcal 0 ticks 128 held true)
- on seed 15215 day 18: control plus-wood ticks 93 (shortfall 3) -> no-creek-evening (completed) (instrument wood undefined kcal undefined ticks undefined held false)
- on seed 15215 day 22: control plus-wood ticks 93 (shortfall 3) -> no-creek-evening (completed) (instrument wood undefined kcal undefined ticks undefined held false)

## Attribution (control ticks-short evenings)
- guard seed 15215 day 7: alone -> ROUTINE-ONLY (shortfall 49, pressTicks 0)
- guard seed 15215 day 10: alone -> PRESS-CONTRIBUTING (shortfall 3, pressTicks 17, counterpart-missing)
- on seed 15215 day 7: alone -> ROUTINE-ONLY (shortfall 49, pressTicks 0)
- on seed 15215 day 13: plus-both -> ROUTINE-ONLY (shortfall 1, pressTicks 0)
- on seed 15215 day 18: plus-wood -> PRESS-CONTRIBUTING (shortfall 3, pressTicks 17)
- on seed 15215 day 22: plus-wood -> PRESS-CONTRIBUTING (shortfall 3, pressTicks 17)

## Hold census (instrument legs)
- guard: holds 5, skips 235, morningDayTicks dist {"384":5}
- on: holds 8, skips 232, morningDayTicks dist {"384":8}

## Death delay (bearer-death day, control -> instrument)
- guard seed 15003: null -> null (delay CENSORED)
- guard seed 15009: 18 -> 18 (delay 0)
- guard seed 15091: 8 -> 8 (delay 0)
- guard seed 15211: null -> null (delay CENSORED)
- guard seed 15215: null -> 13 (delay uncensored-one-side)
- guard seed 15220: null -> null (delay CENSORED)
- guard seed 15221: 31 -> 31 (delay 0)
- guard seed 15337: null -> null (delay CENSORED)
- on seed 15003: null -> null (delay CENSORED)
- on seed 15009: 18 -> 18 (delay 0)
- on seed 15091: 8 -> 8 (delay 0)
- on seed 15211: null -> null (delay CENSORED)
- on seed 15215: 23 -> 17 (delay -6)
- on seed 15220: null -> null (delay CENSORED)
- on seed 15221: 31 -> 31 (delay 0)
- on seed 15337: null -> null (delay CENSORED)

## Wave reach / median survival
- control-variant-guard: waves {"w1":8,"w2":7,"w3":1,"w4":0,"w5":0,"n":8}, median survival 30
- control-variant-on: waves {"w1":8,"w2":7,"w3":0,"w4":0,"w5":0,"n":8}, median survival 30
- instrument-guard: waves {"w1":8,"w2":7,"w3":0,"w4":0,"w5":0,"n":8}, median survival 30
- instrument-on: waves {"w1":8,"w2":7,"w3":0,"w4":0,"w5":0,"n":8}, median survival 30

## Day 7 (reported separately, not part of the GO bar)
- guard: control ticks-short true; instrument outcome still-ticks-short
- on: control ticks-short true; instrument outcome still-ticks-short
