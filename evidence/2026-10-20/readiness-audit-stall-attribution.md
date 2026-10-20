# readiness-audit stall attribution — 16 runs

PRIMARY: 13 runs with wave-4 unlocked but wave-5 never unlocked; 0 unattributed → GO

| seed | policy | stall | peak | def5d | end | attributions |
|---|---|---|---|---|---|---|
| 65111 | leadfeast | engaged-but-failed | 4 | 63 | village-lost | died-in-window+readiness-armor+readiness-weapons+readiness-veterans |
| 65113 | leadfeast | progressed-but-stalled | 4 | 0 | village-lost | standing-short+readiness-armor+readiness-weapons+readiness-veterans |
| 65114 | leadfeast | progressed-but-stalled | 4 | 0 | village-lost | standing-short+readiness-armor+readiness-weapons+readiness-veterans |
| 65115 | leadfeast | engaged-but-failed | 4 | 63 | village-lost | died-in-window+readiness-armor+readiness-weapons+readiness-veterans |
| 65116 | leadfeast | engaged-but-failed | 4 | 99 | survived | horizon+readiness-veterans |
| 65117 | leadfeast | engaged-but-failed | 4 | 49 | village-lost | died-in-window+readiness-armor+readiness-weapons+readiness-veterans |
| 65118 | leadfeast | engaged-but-failed | 4 | 83 | village-lost | died-in-window+readiness-armor+readiness-weapons+readiness-veterans |
| 65113 | belongfeast | progressed-but-stalled | 4 | 0 | village-lost | standing-short+readiness-armor+readiness-weapons+readiness-veterans |
| 65114 | belongfeast | engaged-but-failed | 4 | 90 | survived | horizon+readiness-armor+readiness-weapons+readiness-veterans |
| 65115 | belongfeast | progressed-but-stalled | 4 | 0 | survived | standing-short+readiness-armor+readiness-veterans |
| 65116 | belongfeast | progressed-but-stalled | 4 | 0 | village-lost | standing-short+readiness-armor+readiness-weapons+readiness-veterans |
| 65117 | belongfeast | progressed-but-stalled | 4 | 0 | village-lost | standing-short+readiness-armor+readiness-weapons+readiness-veterans |
| 65118 | belongfeast | progressed-but-stalled | 4 | 0 | village-lost | standing-short+readiness-armor+readiness-veterans |

## Mechanism detail (eligible runs)

### leadfeast-s65111 (engaged-but-failed, end village-lost)
- died-in-window: a deferral(5) window ended with the village lost (end=village-lost, 63d at the door)
- readiness-armor: binding: gate 3/4 armored at P>=15 (window max 4/4); no near-miss: 1 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: binding: gate 4/6 armed (window max 8/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: binding: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### leadfeast-s65113 (progressed-but-stalled, end village-lost)
- standing-short: capped=150 < 200, raw=230 (war=50 pts=2, dip=0 links=0, plenty=180 feasts=9, PLENTY-CAPPED at 100 toward t5); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose
- readiness-armor: would-bind: gate 0/4 armored at P>=15 (window max 0/4); no near-miss: 0 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: would-bind: gate 0/6 armed (window max 0/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: would-bind: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### leadfeast-s65114 (progressed-but-stalled, end village-lost)
- standing-short: capped=175 < 200, raw=195 (war=75 pts=3, dip=0 links=0, plenty=120 feasts=6, PLENTY-CAPPED at 100 toward t5); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose
- readiness-armor: would-bind: gate 0/4 armored at P>=15 (window max 0/4); no near-miss: 0 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: would-bind: gate 0/6 armed (window max 0/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: would-bind: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 1; killers: Mara Vasquez (DEAD) first w4+ kill d73 (strike, via=player) died d96 (+23d); unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### leadfeast-s65115 (engaged-but-failed, end village-lost)
- died-in-window: a deferral(5) window ended with the village lost (end=village-lost, 63d at the door)
- readiness-armor: binding: gate 0/4 armored at P>=15 (window max 4/4); no near-miss: 1 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: binding: gate 1/6 armed (window max 11/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: binding: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### leadfeast-s65116 (engaged-but-failed, end survived)
- horizon: deferral(5) true at run end (village alive, unwon, 99d at the door)
- readiness-veterans: binding: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### leadfeast-s65117 (engaged-but-failed, end village-lost)
- died-in-window: a deferral(5) window ended with the village lost (end=village-lost, 49d at the door)
- readiness-armor: binding: gate 1/4 armored at P>=15 (window max 4/4); no near-miss: 0 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: binding: gate 1/6 armed (window max 9/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: binding: gate 0/2 LIVING distinct wave-4+ killers (window max 1/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 1; killers: Benoit Lambert (DEAD) first w4+ kill d62 (eulogy, via=player) died d76 (+14d); unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### leadfeast-s65118 (engaged-but-failed, end village-lost)
- died-in-window: a deferral(5) window ended with the village lost (end=village-lost, 83d at the door)
- readiness-armor: binding: gate 1/4 armored at P>=15 (window max 5/4); no near-miss: 2 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: binding: gate 3/6 armed (window max 10/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: binding: gate 0/2 LIVING distinct wave-4+ killers (window max 1/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 1; killers: Aonghus Masterson (DEAD) first w4+ kill d78 (strike, via=player) died d91 (+13d); unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### belongfeast-s65113 (progressed-but-stalled, end village-lost)
- standing-short: capped=175 < 200, raw=255 (war=75 pts=3, dip=0 links=0, plenty=180 feasts=9, PLENTY-CAPPED at 100 toward t5); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose
- readiness-armor: would-bind: gate 1/4 armored at P>=15 (window max 0/4); no near-miss: 0 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: would-bind: gate 1/6 armed (window max 0/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: would-bind: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### belongfeast-s65114 (engaged-but-failed, end survived)
- horizon: deferral(5) true at run end (village alive, unwon, 90d at the door)
- readiness-armor: binding: gate 2/4 armored at P>=15 (window max 6/4); no near-miss: 2 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: binding: gate 4/6 armed (window max 10/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: binding: gate 0/2 LIVING distinct wave-4+ killers (window max 1/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 1; killers: Erlan Dauletbayev (DEAD) first w4+ kill d92 (congregation, via=player) died d116 (+24d); unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### belongfeast-s65115 (progressed-but-stalled, end survived)
- standing-short: capped=159 < 200, raw=159 (war=25 pts=1, dip=34 links=1, plenty=100 feasts=5); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose
- readiness-armor: would-bind: gate 3/4 armored at P>=15 (window max 0/4); no near-miss: 3 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-veterans: would-bind: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### belongfeast-s65116 (progressed-but-stalled, end village-lost)
- standing-short: capped=150 < 200, raw=230 (war=50 pts=2, dip=0 links=0, plenty=180 feasts=9, PLENTY-CAPPED at 100 toward t5); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose
- readiness-armor: would-bind: gate 0/4 armored at P>=15 (window max 0/4); NEAR-MISS held-but-uncounted: scholar P0 worn, P25 wardens_cloak in PACK not worn. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: would-bind: gate 0/6 armed (window max 0/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 1 living fighters with neither equipped nor carried weapon
- readiness-veterans: would-bind: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 1; killers: Olivia Bennett (DEAD) first w4+ kill d92 (eater, via=player) died d106 (+14d); unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### belongfeast-s65117 (progressed-but-stalled, end village-lost)
- standing-short: capped=175 < 200, raw=215 (war=75 pts=3, dip=0 links=0, plenty=140 feasts=7, PLENTY-CAPPED at 100 toward t5); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose
- readiness-armor: would-bind: gate 2/4 armored at P>=15 (window max 0/4); no near-miss: 3 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-weapons: would-bind: gate 5/6 armed (window max 0/6); village ARMORY holds 0 weapon units unborrowed [empty] — on NO villager, invisible to the armed leg until borrowed; 0 counted via carried-not-equipped (carriesWeapon path — the leg does count pack weapons); 0 living fighters with neither equipped nor carried weapon
- readiness-veterans: would-bind: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

### belongfeast-s65118 (progressed-but-stalled, end village-lost)
- standing-short: capped=125 < 200, raw=285 (war=25 pts=1, dip=0 links=0, plenty=260 feasts=13, PLENTY-CAPPED at 100 toward t5); deferral(5) never true — the village stood at the w5 STANDING bar before any readiness question arose
- readiness-armor: would-bind: gate 2/4 armored at P>=15 (window max 0/4); no near-miss: 4 living fighters wore no armor and held none at P>=15. Note: no communal armor pile exists — depositable stash sections are weapons/medicine only; armor acquisition is own-stash-only via villagerGearUp(acquire=true)/villagerGearDay.
- readiness-veterans: would-bind: gate 0/2 LIVING distinct wave-4+ killers (window max 0/2); VETSHAPE=1 shadow (living-or-dead, Steve's #427 — computed, never enabled) = 0; killers: none; unattributed wave-4+ kills (by=null): 0. VETSHAPE unset in this substrate — dead killers do not count.

## Wall numbers

- wave reach: w4 13/16, w5 0/16
- wins: 0/16
- median survival: 151d; max: 182d
- death causes: monster 62, villager combat 148, sickness 20, combat 414, a wound that wouldn't close 11, expedition 25, the night 2, alien 2, ambush 2, contest 9, starvation 8, a crow that watches too long and blinks too little 2, The Reunion 1, experiment 4, dehydration 1, Buffering 1, wound_fever 1
