# Feature and build census

Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.

## capable

Legacy panel: method registry was not retained. This list is partial; absent methods are unknown, not unused.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 155 | 155 | reached |
| _contestResolveOthers | 16/16 | 16 | 101 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 45 | 16 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 19 | 19 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 49 | 49 | reached |
| _showEnd | 16/16 | 15 | 80 | 80 | reached |
| _showVillagerEnd | 16/16 | 12 | 25 | 25 | reached |
| apCarePackage | 16/16 | 16 | 442 | 141 | reached |
| apClubBoon | 16/16 | 16 | 1204 | 38 | reached |
| apDeadDrop | 16/16 | 16 | 1204 | 304 | reached |
| apPersonaPackage | 16/16 | 16 | 267 | 21 | reached |
| cleanCarcass | 16/16 | 15 | 268 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 290 | 290 | reached |
| craft | 16/16 | 16 | 86 | 74 | reached |
| doAction | 16/16 | 16 | 10019 | 7271 | reached |
| tbEnd | 16/16 | 16 | 229 | 0 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 2 | 0 | 0 | ready_unused |
| bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 7 | 2 | 0 | 0 | ready_unused |
| fire_hardened_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 10 | 2 | 0 | 0 | ready_unused |
| hunting_spear | 2 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| sharpened_stick | 8 | 7 | 0 | 0 | ready_unused |
| sling | 5 | 1 | 0 | 0 | ready_unused |
| snare | 16 | 13 | 70 | 60 | produced |
| stone_knife | 16 | 4 | 16 | 14 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 89 | 1 |
| npc/combat | 2 | 0 |
| npc/contest | 61 | 19 |
| npc/show | 1 | 0 |
| player/combat | 1 | 1 |
| player/contest | 98 | 62 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 50 | 5 |
| player/corpse-villager | 270 | 14 |
| player/craft | 14 | 0 |
| player/fan-package | 141 | 79 |
| player/fan-vote | 38 | 0 |
| player/patron | 4 | 0 |
| player/show | 24 | 7 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "caregiver/healer": 2,
    "hunter/beastmaster": 2,
    "socialite/demagogue": 2,
    "socialite/showrunner": 3,
    "hunter/stalker": 3,
    "explorer/cartographer": 2,
    "survivalist/furnace": 1
  },
  "npcClasses": {
    "caregiver/healer": 1,
    "forager/feaster": 3,
    "forager/gardener": 8,
    "hunter/beastmaster": 1,
    "hunter/stalker": 4,
    "socialite/demagogue": 1,
    "socialite/showrunner": 2,
    "drifter/trickster": 1
  },
  "playerGods": {
    "shepherd_of_the_dead": 1,
    "voice_of_the_relay": 3,
    "apex_predator": 2,
    "all_seeing": 1
  },
  "npcGods": {
    "shepherd_of_the_dead": 1,
    "living_garden": 6
  },
  "winningEndings": {
    "feared/caregiver/healer/light": 1,
    "assimilated/none/none/light": 1,
    "beloved/none/none/light": 2,
    "witness/none/none/light": 2,
    "relay/socialite/demagogue/grey": 1,
    "witness/explorer/cartographer/light": 1,
    "feared/socialite/showrunner/light": 1,
    "witness/survivalist/furnace/light": 1,
    "beloved/hunter/beastmaster/light": 1
  }
}
```

## maker

Legacy panel: method registry was not retained. This list is partial; absent methods are unknown, not unused.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 226 | 226 | reached |
| _contestResolveOthers | 16/16 | 16 | 143 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 61 | 15 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 13 | 21 | 21 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 16 | 38 | 37 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 76 | 76 | reached |
| _showEnd | 16/16 | 16 | 102 | 102 | reached |
| _showVillagerEnd | 16/16 | 14 | 40 | 40 | reached |
| apCarePackage | 16/16 | 16 | 648 | 217 | reached |
| apClubBoon | 16/16 | 16 | 1663 | 61 | reached |
| apDeadDrop | 16/16 | 16 | 1663 | 405 | reached |
| apPersonaPackage | 16/16 | 16 | 349 | 30 | reached |
| cleanCarcass | 16/16 | 12 | 270 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 390 | 390 | reached |
| craft | 16/16 | 11 | 78 | 69 | reached |
| doAction | 16/16 | 16 | 13592 | 9562 | reached |
| preserveFood | 16/16 | 2 | 3 | 0 | reached |
| readBook | 16/16 | 12 | 14 | 14 | reached |
| takePrepMaterial | 16/16 | 12 | 59 | 35 | reached |
| tbEnd | 16/16 | 16 | 157 | 0 | reached |
| traderSell | 16/16 | 9 | 37 | 37 | reached |
| visitorBuyWare | 16/16 | 8 | 8 | 8 | reached |
| visitorWares | 16/16 | 16 | 1278 | 1278 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 1 | 0 | 0 | ready_unused |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| fish_weir | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 12 | 3 | 11 | 7 | produced |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| sharpened_stick | 11 | 8 | 0 | 0 | ready_unused |
| sling | 5 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 8 | 56 | 51 | produced |
| spring_snare | 8 | 3 | 0 | 0 | ready_unused |
| stone_knife | 16 | 6 | 11 | 11 | produced |
| trotline | 1 | 0 | 0 | 0 | known_no_material_sample |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 84 | 1 |
| npc/contest | 115 | 50 |
| npc/show | 1 | 1 |
| player/action | 2 | 1 |
| player/contest | 145 | 93 |
| player/corpse-person | 88 | 5 |
| player/corpse-villager | 427 | 49 |
| player/craft | 18 | 0 |
| player/fan-package | 217 | 113 |
| player/fan-vote | 59 | 0 |
| player/patron | 11 | 0 |
| player/show | 26 | 14 |
| player/trade | 8 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "forager/gardener": 4,
    "hunter/stalker": 3,
    "explorer/cartographer": 2,
    "survivalist/furnace": 2,
    "forager/feaster": 1,
    "socialite/showrunner": 1,
    "hunter/beastmaster": 1
  },
  "npcClasses": {
    "forager/gardener": 9,
    "forager/feaster": 9,
    "hunter/stalker": 4,
    "survivalist/furnace": 2,
    "caregiver/healer": 1,
    "socialite/demagogue": 1
  },
  "playerGods": {
    "living_garden": 4,
    "all_seeing": 2,
    "unkillable": 1,
    "apex_predator": 3
  },
  "npcGods": {
    "living_garden": 11,
    "apex_predator": 2
  },
  "winningEndings": {
    "witness/explorer/cartographer/light": 1,
    "assimilated/forager/gardener/light": 2,
    "assimilated/none/none/light": 1,
    "beloved/none/none/light": 1,
    "witness/hunter/beastmaster/light": 1
  }
}
```

## merchant

Legacy panel: method registry was not retained. This list is partial; absent methods are unknown, not unused.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 210 | 210 | reached |
| _contestResolveOthers | 16/16 | 16 | 151 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 53 | 18 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 27 | 27 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 71 | 71 | reached |
| _showEnd | 16/16 | 16 | 94 | 94 | reached |
| _showVillagerEnd | 16/16 | 14 | 43 | 43 | reached |
| apCarePackage | 16/16 | 16 | 569 | 212 | reached |
| apClubBoon | 16/16 | 16 | 1606 | 63 | reached |
| apDeadDrop | 16/16 | 16 | 1606 | 401 | reached |
| apPersonaPackage | 16/16 | 16 | 315 | 2 | reached |
| cleanCarcass | 16/16 | 9 | 219 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 209 | 209 | reached |
| craft | 16/16 | 12 | 110 | 102 | reached |
| doAction | 16/16 | 16 | 13416 | 9508 | reached |
| tbEnd | 16/16 | 16 | 145 | 0 | reached |
| traderSell | 16/16 | 11 | 33 | 33 | reached |
| visitorBuyWare | 16/16 | 8 | 9 | 9 | reached |
| visitorWares | 16/16 | 16 | 1205 | 1205 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 8 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 6 | 1 | 0 | 0 | ready_unused |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 5 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 7 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 2 | 0 | 0 | 0 | known_no_material_sample |
| sharpened_stick | 7 | 4 | 0 | 0 | ready_unused |
| sling | 8 | 0 | 0 | 0 | known_no_material_sample |
| snare | 16 | 8 | 96 | 91 | produced |
| stone_knife | 16 | 5 | 14 | 11 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 97 | 0 |
| npc/combat | 1 | 0 |
| npc/contest | 105 | 55 |
| player/contest | 132 | 84 |
| player/corpse-monster | 1 | 0 |
| player/corpse-person | 62 | 6 |
| player/corpse-villager | 628 | 83 |
| player/craft | 11 | 0 |
| player/fan-package | 212 | 106 |
| player/fan-vote | 62 | 0 |
| player/show | 24 | 12 |
| player/trade | 9 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "forager/feaster": 4,
    "hunter/stalker": 5,
    "socialite/showrunner": 5,
    "forager/gardener": 4,
    "caregiver/healer": 1,
    "explorer/cartographer": 1,
    "hunter/beastmaster": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "hunter/stalker": 6,
    "forager/feaster": 8,
    "survivalist/furnace": 1,
    "caregiver/healer": 1,
    "forager/gardener": 6,
    "socialite/showrunner": 1,
    "explorer/cartographer": 1
  },
  "playerGods": {
    "apex_predator": 3,
    "living_garden": 7,
    "voice_of_the_relay": 5,
    "shepherd_of_the_dead": 1
  },
  "npcGods": {
    "apex_predator": 2,
    "living_garden": 13,
    "voice_of_the_relay": 3,
    "shepherd_of_the_dead": 1,
    "all_seeing": 1
  },
  "winningEndings": {
    "feared/none/none/light": 1,
    "defiant/none/none/light": 1,
    "witness/none/none/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "witness/hunter/stalker/light": 1,
    "beloved/hunter/stalker/light": 1
  }
}
```

## caregiver

Legacy panel: method registry was not retained. This list is partial; absent methods are unknown, not unused.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 198 | 198 | reached |
| _contestResolveOthers | 16/16 | 16 | 117 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 50 | 12 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 17 | 17 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 25 | 25 | reached |
| _cxPrizeSynergyHint | 16/16 | 14 | 66 | 66 | reached |
| _showEnd | 16/16 | 16 | 83 | 83 | reached |
| _showVillagerEnd | 16/16 | 13 | 33 | 33 | reached |
| apCarePackage | 16/16 | 16 | 553 | 167 | reached |
| apClubBoon | 16/16 | 16 | 1457 | 46 | reached |
| apDeadDrop | 16/16 | 16 | 1457 | 371 | reached |
| apPersonaPackage | 16/16 | 16 | 262 | 6 | reached |
| cleanCarcass | 16/16 | 5 | 139 | 0 | reached |
| comfort | 16/16 | 16 | 286 | 286 | reached |
| corpseLootAll | 16/16 | 16 | 407 | 407 | reached |
| craft | 16/16 | 9 | 45 | 40 | reached |
| doAction | 16/16 | 16 | 11846 | 8637 | reached |
| tbEnd | 16/16 | 16 | 108 | 0 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 7 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 2 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 4 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 2 | 0 | 0 | 0 | known_no_material_sample |
| sharpened_stick | 8 | 6 | 0 | 0 | ready_unused |
| sling | 7 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 6 | 33 | 30 | produced |
| stone_knife | 16 | 5 | 12 | 10 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 49 | 2 |
| npc/contest | 107 | 54 |
| npc/show | 1 | 0 |
| player/action | 1 | 0 |
| player/contest | 128 | 90 |
| player/corpse-person | 25 | 1 |
| player/corpse-villager | 275 | 22 |
| player/craft | 10 | 0 |
| player/fan-package | 167 | 80 |
| player/fan-vote | 46 | 0 |
| player/patron | 2 | 0 |
| player/show | 15 | 6 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "forager/gardener": 6,
    "hunter/stalker": 4,
    "explorer/cartographer": 1,
    "forager/feaster": 1,
    "socialite/showrunner": 1
  },
  "npcClasses": {
    "caregiver/healer": 2,
    "hunter/stalker": 5,
    "survivalist/furnace": 1,
    "forager/feaster": 11,
    "forager/gardener": 9,
    "hunter/beastmaster": 1,
    "socialite/demagogue": 2
  },
  "playerGods": {
    "living_garden": 6,
    "apex_predator": 2,
    "all_seeing": 1,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 11,
    "apex_predator": 1,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "witness/hunter/stalker/light": 1,
    "beloved/explorer/cartographer/light": 1,
    "witness/none/none/light": 2,
    "assimilated/forager/gardener/light": 1,
    "witness/forager/gardener/light": 1,
    "assimilated/none/none/light": 1,
    "witness/forager/feaster/light": 1
  }
}
```
