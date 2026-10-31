# sim-selecttrim-a compare (NOT an official panel run)

## guard-control

- creek 5 / still 4 / rescued 1 / ticks-short 2 (days 7,10)
- presses 1: d10 E450
- trims 0: days 
- daysAlive 30 end survived maxWave 3 errs wc/ww/pb/st 0/0/0/0

## guard-trim

- creek 5 / still 5 / rescued 0 / ticks-short 2 (days 7,10)
- presses 1: d10 E540
- trims 3: days 9,10,11
- daysAlive 30 end survived maxWave 2 errs wc/ww/pb/st 0/0/0/0

## on-control

- creek 17 / still 17 / rescued 0 / ticks-short 4 (days 7,13,18,22)
- presses 4: d10 E540, d14 E900, d18 E810, d22 E990
- trims 0: days 
- daysAlive 30 end survived maxWave 2 errs wc/ww/pb/st 0/0/0/0

## on-trim

- creek 8 / still 8 / rescued 0 / ticks-short 3 (days 7,10,14)
- presses 2: d10 E720, d14 E900
- trims 5: days 9,10,12,13,14
- daysAlive 30 end survived maxWave 1 errs wc/ww/pb/st 0/0/0/0

## paired: guard (guard-control -> guard-trim)

walk preserved (every still-stranded next-morning wake matches control): true (1 strand rows)

| trim day | control wake next morning | trim wake next morning | match | control still stranded |
|---|---|---|---|---|
| 9 | 8,0 | 8,0 | true | true |
| 10 | 8,0 | 8,0 | true | false |
| 11 | 0,8 | 4,4 | false | false |

| trim day | control routine | trim routine | saved | control ticksLeft | trim ticksLeft | control evening | trim evening |
|---|---|---|---|---|---|---|---|
| 9 | 19 | 16 | 3 | 109 | 112 | still | still |
| 10 | 18 | 17 | 1 | 93 | 94 | still | still |
| 11 | 17 | 16 | 1 | 111 | 112 | rescued | still |

gate-shift (control rescued -> trim still, same day): 11
conversions (control still -> trim rescued, same day): none
day-7 trim fired (must be false): false

## paired: on (on-control -> on-trim)

walk preserved (every still-stranded next-morning wake matches control): false (5 strand rows)

| trim day | control wake next morning | trim wake next morning | match | control still stranded |
|---|---|---|---|---|
| 9 | 8,0 | 8,0 | true | true |
| 10 | 8,0 | 8,0 | true | true |
| 12 | 0,0 | 0,0 | true | true |
| 13 | 8,0 | 8,0 | true | true |
| 14 | 8,0 | 4,4 | false | true |

| trim day | control routine | trim routine | saved | control ticksLeft | trim ticksLeft | control evening | trim evening |
|---|---|---|---|---|---|---|---|
| 9 | 19 | 16 | 3 | 109 | 112 | still | still |
| 10 | 18 | 17 | 1 | 221 | 94 | still | still |
| 12 | 25 | 16 | 9 | 231 | 112 | still | still |
| 13 | 33 | 16 | 17 | 95 | 112 | still | still |
| 14 | 18 | 17 | 1 | 221 | 94 | still | still |

gate-shift (control rescued -> trim still, same day): none
conversions (control still -> trim rescued, same day): none
day-7 trim fired (must be false): false

