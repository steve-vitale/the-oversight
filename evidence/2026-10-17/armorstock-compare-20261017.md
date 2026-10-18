# sim-armorstock — balanced before/after (§15 compare)

Pairs: 16 (seed+policy matched, identical seeds per arm).
Sweep commit: 262523ef07f23fc1b641833360e15c8c62b019a4

## PRIMARY: wave-4 unlocks (binding, GO needs armed-control >= +3)

- control: 0/16
- armed:   0/16
- delta:   +0  (paired sign: +0/-0/16)
- verdict: NO-GO

## SECONDARY: deferral armor-margin >= 2 (report-only)

- control: 0 runs with margin>=2 at last deferral
- armed:   0 runs with margin>=2 at last deferral
- delta:   +0

## Per-pair

| pair | control w4 | armed w4 | control deferMargin | armed deferMargin | control starv | armed starv |
|---|---|---|---|---|---|---|
| belongfeast-s4101117 | - | - | 0 | 0 | 0 | 0 |
| belongfeast-s4211219 | - | - | -3 | -3 | 1 | 1 |
| belongfeast-s4321321 | - | - | -3 | -3 | 0 | 0 |
| belongfeast-s4431423 | - | - | -3 | -3 | 0 | 0 |
| belongfeast-s4541525 | - | - | -3 | -3 | 2 | 0 |
| belongfeast-s4651627 | - | - | -2 | -2 | 0 | 0 |
| belongfeast-s4761729 | - | - | -3 | -3 | 0 | 0 |
| belongfeast-s4871831 | - | - | -4 | -4 | 2 | 2 |
| leadfeast-s4101117 | - | - | -2 | -3 | 0 | 0 |
| leadfeast-s4211219 | - | - | -1 | -1 | 1 | 1 |
| leadfeast-s4321321 | - | - | -3 | -3 | 0 | 0 |
| leadfeast-s4431423 | - | - | -3 | -3 | 2 | 4 |
| leadfeast-s4541525 | - | - | -2 | -2 | 8 | 8 |
| leadfeast-s4651627 | - | - | -3 | -3 | 0 | 1 |
| leadfeast-s4761729 | - | - | -3 | -1 | 0 | 0 |
| leadfeast-s4871831 | - | - | -3 | -3 | 0 | 0 |

## Guardrails

- starvation deaths: control 16 / armed 17 (kill if armed > control+2 = 18) → hold
- median survival (gameDays): control 181 / armed 175 (kill if armed < control-10) → hold
- max survival: control 182 / armed 182
- national: control 0/16 / armed 0/16
- wins: control 0/16 / armed 0/16
- village-lost: control 8/16 / armed 9/16
- death causes control: {"expedition":40,"villager combat":129,"combat":494,"monster":54,"contest":11,"starvation":16,"ambush":4,"sickness":17,"a wound that wouldn't close":11,"Rut King":2,"a line of ducks, walking in perfect formation. In the dark. That is not normal duck behavior.":2,"Loud-Eyes":1,"alien":1,"Inspiration":1,"The Understudy":1,"Performance Review":1,"dehydration":1,"lockjaw":1,"the night":1}
- death causes armed:   {"expedition":40,"villager combat":126,"combat":479,"monster":57,"contest":11,"starvation":17,"ambush":4,"sickness":20,"a wound that wouldn't close":10,"Rut King":2,"a line of ducks, walking in perfect formation. In the dark. That is not normal duck behavior.":2,"Loud-Eyes":1,"alien":1,"thirst":1,"the night":1}
- new death modes on armed: none genuine (script flagged 'thirst' — investigated: both 'thirst' (game.js:28705) and 'dehydration' (engine/calories.js:158) are pre-existing engine water-death labels; 1 each is RNG noise) → hold

## Arm mechanism (end-state reads + leg engagement)

- mean reserve (trophy pieces in scholar pack, end): control 0.06 / armed 0.13
- mean scholar worn P (end): control 37.4 / armed 38.8
- leg engagement (armed, 16 runs): recovered=1 crafted=0 (tries 0) reservePeakTotal=11 successions=113 recoveryTries=42
- control counters null (no leg writes): true

§15 deviation noted: official balance-panel driver cannot express this policy-side arm; paired statistics above run on the pre-registered metrics directly.
