# Feature and build census

Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 8 | 8 | reached |
| _contestResolveOthers | 1/1 | 1 | 3 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 1 | 1 | 1 | reached |
| _cxPrizeEvolutionAssist | 1/1 | 0 | 0 | 0 | not_reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 4 | 4 | reached |
| _cxPrizeSynergyHint | 1/1 | 0 | 0 | 0 | not_reached |
| _showEnd | 1/1 | 1 | 5 | 5 | reached |
| _showVillagerEnd | 1/1 | 1 | 2 | 2 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 33 | 11 | reached |
| apClubBoon | 1/1 | 1 | 64 | 3 | reached |
| apDeadDrop | 1/1 | 1 | 64 | 15 | reached |
| apPersonaPackage | 1/1 | 1 | 13 | 0 | reached |
| cleanCarcass | 1/1 | 1 | 3 | 0 | reached |
| comfort | 1/1 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 1/1 | 1 | 7 | 7 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 1 | 41 | 1 | reached |
| doAction | 1/1 | 1 | 493 | 338 | reached |
| donateMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| donateWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 1/1 | 0 | 0 | 0 | not_reached |
| expandStorage | 1/1 | 0 | 0 | 0 | not_reached |
| giveFood | 1/1 | 0 | 0 | 0 | not_reached |
| makePemmican | 1/1 | 0 | 0 | 0 | not_reached |
| networkSummon | 1/1 | 0 | 0 | 0 | not_reached |
| orderMember | 1/1 | 0 | 0 | 0 | not_reached |
| preserveFood | 1/1 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 1/1 | 0 | 0 | 0 | not_reached |
| proposeTrade | 1/1 | 0 | 0 | 0 | not_reached |
| readBook | 1/1 | 0 | 0 | 0 | not_reached |
| renderFat | 1/1 | 0 | 0 | 0 | not_reached |
| takeMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 0/1 | 0 | 0 | 0 | unavailable |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 26 | 0 | reached |
| traderSell | 1/1 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 0 | 0 | 40 | 0 | attempted_no_success |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| sharpened_stick | 1 | 1 | 0 | 0 | ready_unused |
| snare | 1 | 1 | 0 | 0 | ready_unused |
| stone_knife | 1 | 1 | 1 | 1 | produced |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 1 | 0 |
| player/contest | 7 | 4 |
| player/corpse-monster | 2 | 0 |
| player/corpse-villager | 10 | 0 |
| player/craft | 1 | 0 |
| player/fan-package | 11 | 0 |
| player/fan-vote | 3 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {},
  "npcClasses": {
    "forager/gardener": 1
  },
  "playerGods": {},
  "npcGods": {},
  "winningEndings": {}
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 11 | 11 | reached |
| _contestResolveOthers | 1/1 | 1 | 5 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 1 | 1 | 1 | reached |
| _cxPrizeEvolutionAssist | 1/1 | 1 | 1 | 1 | reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 1 | 1 | reached |
| _cxPrizeSynergyHint | 1/1 | 0 | 0 | 0 | not_reached |
| _showEnd | 1/1 | 1 | 1 | 1 | reached |
| _showVillagerEnd | 1/1 | 1 | 2 | 2 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 24 | 8 | reached |
| apClubBoon | 1/1 | 1 | 68 | 3 | reached |
| apDeadDrop | 1/1 | 1 | 68 | 18 | reached |
| apPersonaPackage | 1/1 | 1 | 17 | 0 | reached |
| cleanCarcass | 1/1 | 1 | 22 | 0 | reached |
| comfort | 1/1 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 1/1 | 1 | 3 | 3 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 1 | 43 | 4 | reached |
| doAction | 1/1 | 1 | 661 | 437 | reached |
| donateMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| donateWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 1/1 | 0 | 0 | 0 | not_reached |
| expandStorage | 1/1 | 0 | 0 | 0 | not_reached |
| giveFood | 1/1 | 0 | 0 | 0 | not_reached |
| makePemmican | 1/1 | 0 | 0 | 0 | not_reached |
| networkSummon | 1/1 | 0 | 0 | 0 | not_reached |
| orderMember | 1/1 | 0 | 0 | 0 | not_reached |
| preserveFood | 1/1 | 1 | 2 | 0 | reached |
| proposeCovenant | 1/1 | 0 | 0 | 0 | not_reached |
| proposeTrade | 1/1 | 0 | 0 | 0 | not_reached |
| readBook | 1/1 | 1 | 1 | 1 | reached |
| renderFat | 1/1 | 0 | 0 | 0 | not_reached |
| takeMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 0/1 | 0 | 0 | 0 | unavailable |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 12 | 0 | reached |
| traderSell | 1/1 | 1 | 1 | 1 | reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 1 | 51 | 51 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 0 | 0 | 39 | 0 | attempted_no_success |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| sharpened_stick | 1 | 1 | 0 | 0 | ready_unused |
| snare | 1 | 1 | 3 | 3 | produced |
| spring_snare | 1 | 1 | 0 | 0 | ready_unused |
| stone_knife | 1 | 1 | 1 | 1 | produced |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 7 | 0 |
| player/contest | 7 | 2 |
| player/corpse-villager | 14 | 0 |
| player/craft | 1 | 0 |
| player/fan-package | 8 | 0 |
| player/fan-vote | 3 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {},
  "npcClasses": {},
  "playerGods": {},
  "npcGods": {},
  "winningEndings": {
    "beloved/none/none/light": 1
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 18 | 18 | reached |
| _contestResolveOthers | 1/1 | 1 | 12 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 1 | 6 | 4 | reached |
| _cxPrizeEvolutionAssist | 1/1 | 0 | 0 | 0 | not_reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 2 | 2 | reached |
| _cxPrizeSynergyHint | 1/1 | 1 | 5 | 5 | reached |
| _showEnd | 1/1 | 1 | 4 | 4 | reached |
| _showVillagerEnd | 1/1 | 1 | 2 | 2 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 39 | 18 | reached |
| apClubBoon | 1/1 | 1 | 76 | 7 | reached |
| apDeadDrop | 1/1 | 1 | 76 | 17 | reached |
| apPersonaPackage | 1/1 | 1 | 12 | 0 | reached |
| cleanCarcass | 1/1 | 1 | 17 | 0 | reached |
| comfort | 1/1 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 1/1 | 1 | 1 | 1 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 1 | 99 | 7 | reached |
| doAction | 1/1 | 1 | 855 | 589 | reached |
| donateMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| donateWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 1/1 | 0 | 0 | 0 | not_reached |
| expandStorage | 1/1 | 0 | 0 | 0 | not_reached |
| giveFood | 1/1 | 0 | 0 | 0 | not_reached |
| makePemmican | 1/1 | 0 | 0 | 0 | not_reached |
| networkSummon | 1/1 | 0 | 0 | 0 | not_reached |
| orderMember | 1/1 | 0 | 0 | 0 | not_reached |
| preserveFood | 1/1 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 1/1 | 0 | 0 | 0 | not_reached |
| proposeTrade | 1/1 | 0 | 0 | 0 | not_reached |
| readBook | 1/1 | 0 | 0 | 0 | not_reached |
| renderFat | 1/1 | 0 | 0 | 0 | not_reached |
| takeMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 0/1 | 0 | 0 | 0 | unavailable |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 10 | 0 | reached |
| traderSell | 1/1 | 1 | 1 | 1 | reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 1 | 80 | 80 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 0 | 0 | 92 | 0 | attempted_no_success |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| snare | 1 | 1 | 6 | 6 | produced |
| stone_knife | 1 | 0 | 1 | 1 | produced |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 2 | 0 |
| player/contest | 13 | 1 |
| player/craft | 1 | 0 |
| player/fan-package | 18 | 0 |
| player/fan-vote | 7 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "forager/feaster": 1,
    "survivalist/furnace": 1
  },
  "npcClasses": {
    "hunter/stalker": 1
  },
  "playerGods": {
    "unkillable": 1
  },
  "npcGods": {
    "unkillable": 1
  },
  "winningEndings": {
    "feared/survivalist/furnace/light": 1
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 12 | 12 | reached |
| _contestResolveOthers | 1/1 | 1 | 8 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 0 | 0 | 0 | not_reached |
| _cxPrizeEvolutionAssist | 1/1 | 1 | 2 | 2 | reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 4 | 4 | reached |
| _cxPrizeSynergyHint | 1/1 | 1 | 1 | 1 | reached |
| _showEnd | 1/1 | 1 | 7 | 7 | reached |
| _showVillagerEnd | 1/1 | 1 | 3 | 3 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 37 | 16 | reached |
| apClubBoon | 1/1 | 1 | 79 | 7 | reached |
| apDeadDrop | 1/1 | 1 | 79 | 19 | reached |
| apPersonaPackage | 1/1 | 1 | 15 | 0 | reached |
| cleanCarcass | 1/1 | 1 | 22 | 0 | reached |
| comfort | 1/1 | 1 | 5 | 5 | reached |
| corpseLootAll | 1/1 | 1 | 14 | 14 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 1 | 28 | 4 | reached |
| doAction | 1/1 | 1 | 763 | 552 | reached |
| donateMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| donateWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 1/1 | 0 | 0 | 0 | not_reached |
| expandStorage | 1/1 | 0 | 0 | 0 | not_reached |
| giveFood | 1/1 | 0 | 0 | 0 | not_reached |
| makePemmican | 1/1 | 0 | 0 | 0 | not_reached |
| networkSummon | 1/1 | 0 | 0 | 0 | not_reached |
| orderMember | 1/1 | 0 | 0 | 0 | not_reached |
| preserveFood | 1/1 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 1/1 | 0 | 0 | 0 | not_reached |
| proposeTrade | 1/1 | 0 | 0 | 0 | not_reached |
| readBook | 1/1 | 0 | 0 | 0 | not_reached |
| renderFat | 1/1 | 0 | 0 | 0 | not_reached |
| takeMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 0/1 | 0 | 0 | 0 | unavailable |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 10 | 0 | reached |
| traderSell | 1/1 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 0 | 0 | 23 | 0 | attempted_no_success |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| snare | 1 | 1 | 4 | 3 | produced |
| stone_knife | 1 | 1 | 1 | 1 | produced |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 2 | 0 |
| player/contest | 8 | 1 |
| player/corpse-monster | 1 | 0 |
| player/corpse-villager | 21 | 1 |
| player/craft | 1 | 0 |
| player/fan-package | 16 | 0 |
| player/fan-vote | 7 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "forager/gardener": 1,
    "socialite/showrunner": 1
  },
  "npcClasses": {
    "forager/gardener": 1
  },
  "playerGods": {
    "living_garden": 1
  },
  "npcGods": {
    "living_garden": 1
  },
  "winningEndings": {
    "feared/none/none/light": 1
  }
}
```
