# XP coverage + synergy + gear + healer road — panel analysis

Seeds: 7, 42, 99, 1234, 555, 777, 2026, 31337 (capable policy, 120 days). Before: 8 seeds. After: 8 seeds.

## A. XP acquisition (bar: after >= 2x before XP/villager/day; thresholds after > before)
- deed XP per living villager per day: before 1.56 / after 1.64 MISS (bar: >= 2x)
- total deed XP granted (panel): before 9303.00 / after 11077.00 PASS (bar: >)
- thresholds crossed (level>=1, panel): before 74.00 / after 129.00 PASS (bar: >)
  deed XP by track (panel): before {"field":2620,"social":3447,"craft":643,"combat":1713,"strange":880} / after {"field":3157,"social":3756,"craft":1286,"combat":2029,"strange":849}
  deed mix (panel): before {"foraging":762,"teaching":565,"conversation":2836,"discovery":837,"crafting":151,"fight_survived":241,"fight_won":712,"integration":25,"gardening":381,"cooking":392,"preserving":156,"audience_trial":22,"contest":19,"fishing":350,"contest_survived":64,"contest_won":44,"trapping":77,"death_in_family":642,"mantle":23,"alien_fight":6,"healing":100}
  deed mix (panel): after  {"foraging":847,"teaching":630,"conversation":3090,"discovery":1238,"crafting":120,"fight_survived":300,"fight_won":827,"healing":537,"integration":25,"gardening":418,"preserving":203,"cooking":629,"contest_survived":72,"fishing":339,"alien_fight":6,"death_in_family":578,"audience_trial":29,"mantle":25,"contest":18,"trapping":64,"contest_won":47}
  thresholds per track (panel): before {"combat":20,"field":16,"social":29,"craft":6,"strange":3} / after {"combat":32,"field":25,"social":46,"craft":20,"strange":6}
## B. Ability holdings (bar: abilities per living villager after > before; distinct after > before)
- abilities held per living villager: before 3.61 / after 3.52 MISS (bar: >)
- distinct abilities held (panel mean): before 9.75 / after 13.25 PASS (bar: >)
## C. Recognized Healers (bar: after >= 1 where before had ~none)
- recognized Healers (panel mean): before 0.13 / after 0.00 MISS (bar: after >= 1, before ~0)
  healer ids (after): [[],[],[],[],[],[],[],[]]
## D. Wave-4 survival (bar: rounds after >= 1.25x before; deaths after < before; kills not worse)
- mean rounds per wave-4 fight: before 1.46 / after 1.48 MISS (bar: >= 1.25x)
- fighter deaths in wave-4 fights (panel mean): before 0.75 / after 1.88 MISS (bar: <)
- wave-4 kills (panel mean): before 0.13 / after 0.13 PASS (bar: >=)
- wave-4+ kills in kill log (panel mean): before 1.00 / after 1.13 PASS (bar: >=)
- mean damage taken per wave-4 fight: before 31.91 / after 46.65 MISS (bar: <)
  wave-4 fights (panel mean): before 1.38 / after 5.25
  wave-4 outcomes (panel): before {"vDie":6,"vFlee":4,"vKill":1} / after {"vDie":15,"vFlee":23,"evade":3,"vKill":1}
## Healing (supporting)
- heal checks (panel mean): before 364.00 / after 420.00 PASS (bar: >)
- care rescues — saves (panel mean): before 47.63 / after 50.38 PASS (bar: >)
- triage runs (panel mean): before 0.00 / after 0.00 MISS (bar: >)
- 'healing' deed credits (panel mean): before 12.50 / after 67.13 PASS (bar: >)
  care rescues by via (panel): before {"heal_check":180,"healer_rounds":201} / after {"heal_check":195,"healer_rounds":208}
## Guardrails (investigate if worse; not auto-fail)
- survival days (panel mean): before 92.13 / after 99.63 PASS (bar: >= before)
- wins (panel mean): before 0.50 / after 0.63 PASS (bar: >= before)
- total deaths (panel mean): before 55.88 / after 58.63 MISS (bar: <= before)
- living at end (panel mean): before 4.75 / after 7.13 PASS (bar: >= before)

## Per-seed (before)
- seed 7: gameDays 90 won 1 xp/vday 1.54 thresholds 10 abilities/living 3.20 healers 1 w4fights 2 w4rounds 2.50 w4kills 0 w4deaths 1
- seed 42: gameDays 55 won 0 xp/vday 1.65 thresholds 4 abilities/living 6.00 healers 0 w4fights 0 w4rounds 0.00 w4kills 0 w4deaths 0
- seed 99: gameDays 122 won 0 xp/vday 1.53 thresholds 14 abilities/living 4.40 healers 0 w4fights 5 w4rounds 2.20 w4kills 0 w4deaths 4
- seed 1234: gameDays 117 won 0 xp/vday 1.84 thresholds 6 abilities/living 2.60 healers 0 w4fights 1 w4rounds 3.00 w4kills 0 w4deaths 0
- seed 555: gameDays 90 won 1 xp/vday 1.30 thresholds 14 abilities/living 3.50 healers 0 w4fights 0 w4rounds 0.00 w4kills 0 w4deaths 0
- seed 777: gameDays 83 won 0 xp/vday 1.60 thresholds 4 abilities/living 3.50 healers 0 w4fights 2 w4rounds 2.00 w4kills 0 w4deaths 1
- seed 2026: gameDays 90 won 1 xp/vday 1.47 thresholds 12 abilities/living 2.44 healers 0 w4fights 0 w4rounds 0.00 w4kills 0 w4deaths 0
- seed 31337: gameDays 90 won 1 xp/vday 1.52 thresholds 10 abilities/living 3.20 healers 0 w4fights 1 w4rounds 2.00 w4kills 1 w4deaths 0
## Per-seed (after)
- seed 7: gameDays 110 won 1 xp/vday 1.22 thresholds 20 abilities/living 4.00 healers 0 w4fights 8 w4rounds 2.13 w4kills 0 w4deaths 4
- seed 42: gameDays 121 won 0 xp/vday 1.75 thresholds 18 abilities/living 4.00 healers 0 w4fights 13 w4rounds 2.54 w4kills 0 w4deaths 5
- seed 99: gameDays 90 won 1 xp/vday 1.71 thresholds 16 abilities/living 2.90 healers 0 w4fights 2 w4rounds 0.00 w4kills 0 w4deaths 0
- seed 1234: gameDays 83 won 0 xp/vday 1.81 thresholds 7 abilities/living 2.60 healers 0 w4fights 4 w4rounds 2.25 w4kills 0 w4deaths 2
- seed 555: gameDays 90 won 1 xp/vday 2.31 thresholds 13 abilities/living 3.29 healers 0 w4fights 5 w4rounds 2.00 w4kills 1 w4deaths 2
- seed 777: gameDays 92 won 1 xp/vday 1.20 thresholds 22 abilities/living 3.67 healers 0 w4fights 0 w4rounds 0.00 w4kills 0 w4deaths 0
- seed 2026: gameDays 90 won 1 xp/vday 1.43 thresholds 18 abilities/living 3.71 healers 0 w4fights 1 w4rounds 0.00 w4kills 0 w4deaths 0
- seed 31337: gameDays 121 won 0 xp/vday 1.68 thresholds 15 abilities/living 4.00 healers 0 w4fights 9 w4rounds 2.89 w4kills 0 w4deaths 2
