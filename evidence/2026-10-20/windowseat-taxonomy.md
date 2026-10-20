# sim-windowseat — window-death taxonomy on the SEATDRIVE default-on substrate

Runs: 16 (8 fresh seeds 66001–66008 x {leadfeast, belongfeast}), substrate seatdrive-natural-win-side (SEATDRIVE unset=default-on, WINDEFER=1, no drivers).
Bad per-seed files: 0

## Wall numbers (this substrate)

national 10/16 | table 7/16 | wins 10/16 | wave-4 11/16 | wave-5 0/16 | median survival 90d | max 163d | exiled 0/16

## The window (deferral-5, windowsurvive-identical definition)

door-reaching runs: 7/16; windows: 7 (outcomes: {"won":6,"died":1}); median window length: 20d.

## Legs at stall (terminal readiness, r5)

veterans short: 16/16 | armor short: 12/16

## Window-death taxonomy (22 deaths, all windows)

### The 9 classes

- haven-encounter: 16
- starvation: 2
- attrition: 2
- expedition: 1
- contest: 1

### By window outcome (died vs won-through)

died-windows: {"starvation":1,"haven-encounter":3,"contest":1,"attrition":2} | won-windows: {"haven-encounter":13,"expedition":1,"starvation":1} | other: {}

### By role

scholars: {"haven-encounter":12,"expedition":1,"starvation":1,"contest":1} | villagers: {"haven-encounter":4,"attrition":2,"starvation":1}

### Killer wave (combatish classes)

{"w4":12,"w3":3,"w2":2}

### Precedence overlaps

{"sealedOnKillDay":0,"raidInNoFlee":0,"contestNoArena":1} (sealed deaths that were also kill-day; raid deaths in noFlee fights; contest-class deaths without the arena flag)

### WHEN — mean window-day at death: 13.7; mean inter-death gap: 2.9d

### STATE at death (means): {"pantryKcal":30877,"hungryStreak":0,"veteransLiving":0,"armored":2,"standingCap":245}

### Window deaths, row by row

| policy | seed | day | who | role | class | cause | killerWave | windowDay/outcome | rule |
|---|---|---|---|---|---|---|---|---|---|
| leadfeast | 66001 | 138 | Leonard | SCHOLAR | haven-encounter | combat | w4/combat_start | winDay13/won | ctx:combat-at-haven |
| leadfeast | 66001 | 142 | Lorenzo | SCHOLAR | expedition | combat | w4/combat_start | winDay17/won | field-combat |
| leadfeast | 66001 | 149 | Mia | SCHOLAR | haven-encounter | combat | w3/combat_start | winDay24/won | ctx:combat-at-haven |
| leadfeast | 66004 | 101 | Katarina | SCHOLAR | starvation | starvation | — | winDay3/died | cause |
| leadfeast | 66004 | 101 | Caleb | villager | haven-encounter | monster | w2/router:wild | winDay3/died | ctx:combat-at-haven |
| leadfeast | 66004 | 102 | Elif | SCHOLAR | contest | contest | — | winDay4/died | cause |
| leadfeast | 66004 | 102 | Jorge | SCHOLAR | haven-encounter | combat | w2/combat_start | winDay4/died | ctx:combat-at-haven |
| leadfeast | 66004 | 106 | James | villager | attrition | thirst | — | winDay8/died | cause |
| leadfeast | 66004 | 112 | Iman | villager | attrition | a wound that wouldn't close | — | winDay14/died | cause |
| leadfeast | 66004 | 118 | Suman | SCHOLAR | haven-encounter | combat | w3/combat_start | winDay20/died | ctx:combat-at-haven |
| leadfeast | 66005 | 69 | Kayden | SCHOLAR | haven-encounter | combat | w4/combat_start | winDay13/won | ctx:combat-at-haven |
| leadfeast | 66005 | 70 | Peig | SCHOLAR | haven-encounter | combat | w4/combat_start | winDay14/won | ctx:combat-at-haven |
| leadfeast | 66005 | 75 | Emma | SCHOLAR | haven-encounter | combat | w4/combat_start | winDay19/won | ctx:combat-at-haven |
| leadfeast | 66005 | 77 | Carlos | villager | haven-encounter | monster | w4/router:wild | winDay21/won | ctx:combat-at-haven |
| leadfeast | 66005 | 82 | Catalina | villager | haven-encounter | monster | w4/router:wild | winDay26/won | ctx:combat-at-haven |
| leadfeast | 66005 | 83 | Marta | SCHOLAR | haven-encounter | combat | w4/combat_start | winDay27/won | ctx:combat-at-haven |
| leadfeast | 66005 | 83 | Ivy | SCHOLAR | haven-encounter | combat | w4/combat_start | winDay27/won | ctx:combat-at-haven |
| leadfeast | 66007 | 80 | Wanjiru | villager | haven-encounter | The Suburb | w4/name-lookup | winDay2/won | ctx:combat-at-haven |
| leadfeast | 66007 | 86 | Raquel | villager | starvation | starvation | — | winDay8/won | cause |
| leadfeast | 66007 | 88 | Henok | SCHOLAR | haven-encounter | combat | w4/combat_start | winDay10/won | ctx:combat-at-haven |
| leadfeast | 66007 | 90 | Elena | SCHOLAR | haven-encounter | combat | w4/router:wild | winDay12/won | ctx:combat-at-haven |
| leadfeast | 66007 | 91 | Lucas | SCHOLAR | haven-encounter | combat | w3/combat_start | winDay13/won | ctx:combat-at-haven |

## Non-window deaths (contrast: died before the door or after regress/horizon)

| leadfeast-s66001 | d12 Mario haven-encounter/combat; d17 Rafael haven-encounter/monster |
| leadfeast-s66002 | d8 Clarence expedition/combat; d32 Dieter haven-encounter/combat; d37 Rafał haven-encounter/combat; d52 Grace expedition/combat; d18 Mateo attrition/sickness; d27 Shannon attrition/a wound that wouldn't close; d36 Benjamin attrition/sickness; d50 Jesse attrition/alien |
| leadfeast-s66003 | d12 Imani attrition/dehydration; d54 Ruby contest/combat; d55 Terrence haven-encounter/combat; d69 Mia attrition/dehydration; d76 Nikos expedition/combat; d26 Ingrid haven-encounter/monster; d33 Sachiko haven-encounter/monster; d34 Ruben haven-encounter/monster; d56 Elijah haven-encounter/monster; d61 Greta haven-encounter/monster; d67 Carl expedition/monster |
| leadfeast-s66004 | d10 Kayden haven-encounter/combat; d10 Otto haven-encounter/combat; d25 Catalina haven-encounter/combat; d28 Nadia haven-encounter/combat; d69 Rebecca haven-encounter/combat; d69 Ethan haven-encounter/combat; d71 Priya expedition/combat; d86 Sari haven-encounter/combat; d25 Alicia haven-encounter/monster; d36 Kulpash haven-encounter/monster; d81 Aria haven-encounter/monster |
| leadfeast-s66005 | d13 Esteban haven-encounter/combat; d28 Hattie attrition/lockjaw; d56 Andi haven-encounter/monster |
| leadfeast-s66006 | d64 Franz contest/combat; d64 Mario haven-encounter/combat; d72 Liam haven-encounter/combat; d47 Ashley haven-encounter/The Paparazzo; d48 Xia haven-encounter/Night Court |
| leadfeast-s66007 | d34 Joshua haven-encounter/combat; d41 Rahul contest/combat; d51 Rosa haven-encounter/combat; d51 LaToya haven-encounter/combat; d53 Ethan contest/combat; d78 Greta haven-encounter/combat; d29 Hermann starvation/starvation; d76 Liam starvation/starvation |
| leadfeast-s66008 | d9 Juan haven-encounter/combat; d42 Eamon attrition/sickness; d43 Chen haven-encounter/combat; d50 Raul haven-encounter/combat; d37 Theo attrition/alien; d45 Ishaan haven-encounter/monster; d59 Marcus attrition/a wound that wouldn't close; d61 Nathan starvation/starvation; d63 Caleb attrition/wound_fever; d66 Nikolai starvation/starvation |
| belongfeast-s66001 | d12 Mario haven-encounter/combat; d162 Leonard haven-encounter/combat; d162 Lorenzo haven-encounter/combat; d17 Rafael haven-encounter/monster; d32 Liam haven-encounter/The Mountain Lord |
| belongfeast-s66002 | d8 Clarence expedition/combat; d36 Dieter haven-encounter/combat; d18 Mateo attrition/sickness; d32 Grace attrition/sickness; d33 Chloe attrition/a wound that wouldn't close; d35 Benjamin attrition/sickness; d36 Shannon starvation/starvation; d37 Nino starvation/starvation |
| belongfeast-s66003 | d12 Imani attrition/dehydration; d30 Ruby haven-encounter/combat; d37 Sachiko haven-encounter/combat; d64 Greta expedition/combat; d67 Mia contest/combat; d23 Terrence haven-encounter/monster; d38 Carl haven-encounter/monster; d57 Ruben attrition/alien; d62 Nikos attrition/alien; d68 Kerubo haven-encounter/monster |
| belongfeast-s66004 | d10 Kayden haven-encounter/combat; d10 Otto haven-encounter/combat; d76 Catalina haven-encounter/combat; d78 Ethan haven-encounter/combat; d88 Nadia haven-encounter/combat; d52 Alicia haven-encounter/monster; d61 James haven-encounter/monster; d76 Kulpash attrition/alien; d84 Petra attrition/sickness; d86 Rebecca starvation/starvation; d87 Priya attrition/sickness |
| belongfeast-s66005 | d13 Esteban haven-encounter/combat; d87 Hattie haven-encounter/combat; d87 Peig haven-encounter/combat; d88 Emma contest/combat; d52 Tariq haven-encounter/monster; d83 Andi other:The Big Bastard/The Big Bastard |
| belongfeast-s66006 | d36 Franz haven-encounter/combat; d55 Liam attrition/dehydration; d57 Mario haven-encounter/combat; d61 Owen expedition/combat; d62 Xia expedition/combat; d78 Arlo haven-encounter/combat; d82 Sigrun expedition/combat; d132 Devon haven-encounter/combat; d32 Sam starvation/starvation; d45 Ashley haven-encounter/monster; d55 Guadalupe haven-encounter/Highbeam Deer; d77 Josefina attrition/alien; d114 Zoe haven-encounter/monster; d124 Vasyl haven-encounter/monster |
| belongfeast-s66007 | d50 Joshua haven-encounter/combat; d57 Hermann haven-encounter/combat; d58 Rahul haven-encounter/combat; d58 Rosa haven-encounter/combat; d67 Chloe contest/contest; d75 Elena haven-encounter/combat; d75 Henok haven-encounter/combat; d84 Ingrid haven-encounter/combat; d84 Wanjiru haven-encounter/combat; d84 Greta haven-encounter/combat; d29 Ethan attrition/a wound that wouldn't close; d46 Lucas attrition/sickness; d83 Nadia haven-encounter/monster; d85 Tariq haven-encounter/monster |
| belongfeast-s66008 | d9 Juan haven-encounter/combat; d47 Eamon haven-encounter/combat; d59 Chen contest/combat; d63 Ishaan haven-encounter/combat; d67 Willem contest/combat; d23 Raul starvation/starvation; d31 Marcus attrition/sickness; d65 Theo expedition/monster |

## Attribution quality (PRIMARY gate)

unexplained: 0 (DIAG-GO iff 0); phantom person-teles excluded: 0; cause space: {"combat":81,"monster":28,"sickness":10,"a wound that wouldn't close":5,"alien":6,"dehydration":4,"starvation":11,"contest":2,"thirst":1,"lockjaw":1,"The Paparazzo":1,"Night Court":1,"The Suburb":1,"wound_fever":1,"The Mountain Lord":1,"The Big Bastard":1,"Highbeam Deer":1}

## Per-run

| run | def5 | firstDef5d | windows (outcome) | endDay/endReason/won | deaths (window) | unexplained | r5 short @stall |
|---|---|---|---|---|---|---|---|
| leadfeast-s66001 | true | d126 | d126-152:won | 152/over-other/WON | 5 (3) | 0 | armor+veterans |
| leadfeast-s66002 | true | d65 | d65-105:won | 105/over-other/WON | 8 (0) | 0 | armor+veterans |
| leadfeast-s66003 | true | d85 | d85-90:won | 90/over-other/WON | 11 (0) | 0 | veterans |
| leadfeast-s66004 | true | d99 | d99-118:died | 118/village-lost | 18 (7) | 0 | armor+weapons+veterans |
| leadfeast-s66005 | true | d57 | d57-90:won | 90/over-other/WON | 10 (7) | 0 | armor+weapons+veterans |
| leadfeast-s66006 | true | d73 | d73-90:won | 90/over-other/WON | 5 (0) | 0 | veterans |
| leadfeast-s66007 | true | d79 | d79-92:won | 92/over-other/WON | 13 (5) | 0 | armor+veterans |
| leadfeast-s66008 | false | — | — | 67/village-lost | 10 (0) | 0 | armor+veterans |
| belongfeast-s66001 | false | — | — | 163/over-other/WON | 5 (0) | 0 | armor+veterans |
| belongfeast-s66002 | false | — | — | 38/village-lost | 8 (0) | 0 | armor+weapons+veterans |
| belongfeast-s66003 | false | — | — | 68/village-lost | 10 (0) | 0 | armor+veterans |
| belongfeast-s66004 | false | — | — | 89/village-lost | 11 (0) | 0 | armor+weapons+veterans |
| belongfeast-s66005 | false | — | — | 95/over-other/WON | 6 (0) | 0 | veterans |
| belongfeast-s66006 | false | — | — | 142/over-other/WON | 14 (0) | 0 | veterans |
| belongfeast-s66007 | false | — | — | 90/over-other/WON | 14 (0) | 0 | armor+weapons+veterans |
| belongfeast-s66008 | false | — | — | 68/village-lost | 8 (0) | 0 | armor+veterans |
