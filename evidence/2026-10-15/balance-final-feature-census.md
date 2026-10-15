# Feature and build census

Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 9 | 9 | reached |
| _contestResolveOthers | 1/1 | 1 | 6 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 1 | 2 | 2 | reached |
| _cxPrizeEvolutionAssist | 1/1 | 0 | 0 | 0 | not_reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 2 | 2 | reached |
| _cxPrizeSynergyHint | 1/1 | 1 | 1 | 1 | reached |
| _showEnd | 1/1 | 1 | 2 | 2 | reached |
| _showVillagerEnd | 1/1 | 1 | 3 | 3 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 17 | 0 | reached |
| apClubBoon | 1/1 | 1 | 73 | 0 | reached |
| apDeadDrop | 1/1 | 1 | 73 | 17 | reached |
| apPersonaPackage | 1/1 | 1 | 21 | 0 | reached |
| cleanCarcass | 1/1 | 1 | 4 | 0 | reached |
| comfort | 1/1 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 1/1 | 1 | 8 | 8 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 1 | 2 | 1 | reached |
| doAction | 1/1 | 1 | 657 | 418 | reached |
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
| takePrepMaterial | 1/1 | 0 | 0 | 0 | not_reached |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 11 | 0 | reached |
| traderSell | 1/1 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| snare | 1 | 1 | 1 | 0 | attempted_no_success |
| stone_knife | 1 | 0 | 1 | 1 | produced |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 4 | 0 |
| npc/contest | 3 | 2 |
| player/contest | 5 | 2 |
| player/corpse-villager | 41 | 1 |
| player/craft | 1 | 0 |
| player/show | 1 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "caregiver/healer": 1,
    "socialite/demagogue": 1
  },
  "npcClasses": {},
  "playerGods": {},
  "npcGods": {},
  "winningEndings": {
    "relay/socialite/demagogue/grey": 1
  }
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 16 | 16 | reached |
| _contestResolveOthers | 1/1 | 1 | 8 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 1 | 5 | 2 | reached |
| _cxPrizeEvolutionAssist | 1/1 | 0 | 0 | 0 | not_reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 4 | 4 | reached |
| _cxPrizeSynergyHint | 1/1 | 1 | 5 | 5 | reached |
| _showEnd | 1/1 | 1 | 8 | 8 | reached |
| _showVillagerEnd | 1/1 | 1 | 3 | 3 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 41 | 20 | reached |
| apClubBoon | 1/1 | 1 | 101 | 7 | reached |
| apDeadDrop | 1/1 | 1 | 101 | 27 | reached |
| apPersonaPackage | 1/1 | 1 | 25 | 3 | reached |
| cleanCarcass | 1/1 | 0 | 0 | 0 | not_reached |
| comfort | 1/1 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 1/1 | 1 | 53 | 53 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 0 | 0 | 0 | not_reached |
| doAction | 1/1 | 1 | 882 | 578 | reached |
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
| readBook | 1/1 | 1 | 1 | 1 | reached |
| renderFat | 1/1 | 0 | 0 | 0 | not_reached |
| takeMedicine | 1/1 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 1/1 | 0 | 0 | 0 | not_reached |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 19 | 0 | reached |
| traderSell | 1/1 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 1 | 84 | 84 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| sling | 1 | 0 | 0 | 0 | known_no_material_sample |
| snare | 1 | 0 | 0 | 0 | known_no_material_sample |
| spring_snare | 1 | 0 | 0 | 0 | known_no_material_sample |
| stone_knife | 1 | 0 | 0 | 0 | known_no_material_sample |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 3 | 0 |
| npc/contest | 9 | 2 |
| player/contest | 8 | 6 |
| player/corpse-villager | 35 | 6 |
| player/fan-package | 20 | 12 |
| player/fan-vote | 7 | 0 |
| player/show | 4 | 0 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {},
  "npcClasses": {
    "forager/gardener": 1
  },
  "playerGods": {},
  "npcGods": {
    "living_garden": 1
  },
  "winningEndings": {}
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 17 | 17 | reached |
| _contestResolveOthers | 1/1 | 1 | 9 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 1 | 5 | 3 | reached |
| _cxPrizeEvolutionAssist | 1/1 | 1 | 1 | 1 | reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 1 | 1 | reached |
| _cxPrizeSynergyHint | 1/1 | 1 | 4 | 4 | reached |
| _showEnd | 1/1 | 1 | 6 | 6 | reached |
| _showVillagerEnd | 1/1 | 1 | 3 | 3 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 47 | 18 | reached |
| apClubBoon | 1/1 | 1 | 123 | 6 | reached |
| apDeadDrop | 1/1 | 1 | 123 | 31 | reached |
| apPersonaPackage | 1/1 | 1 | 26 | 0 | reached |
| cleanCarcass | 1/1 | 1 | 4 | 0 | reached |
| comfort | 1/1 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 1/1 | 1 | 25 | 25 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 0 | 0 | 0 | not_reached |
| doAction | 1/1 | 1 | 1043 | 610 | reached |
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
| takePrepMaterial | 1/1 | 0 | 0 | 0 | not_reached |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 9 | 0 | reached |
| traderSell | 1/1 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 1 | 95 | 95 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| sling | 1 | 0 | 0 | 0 | known_no_material_sample |
| snare | 1 | 1 | 0 | 0 | ready_unused |
| stone_knife | 1 | 1 | 0 | 0 | ready_unused |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 3 | 0 |
| npc/contest | 10 | 5 |
| player/contest | 8 | 6 |
| player/corpse-person | 22 | 3 |
| player/corpse-villager | 48 | 4 |
| player/fan-package | 18 | 11 |
| player/fan-vote | 6 | 0 |
| player/show | 3 | 2 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "caregiver/healer": 1,
    "socialite/showrunner": 1
  },
  "npcClasses": {
    "forager/gardener": 1
  },
  "playerGods": {
    "shepherd_of_the_dead": 1,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 1,
    "voice_of_the_relay": 1
  },
  "winningEndings": {}
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 1/1 | 1 | 20 | 20 | reached |
| _contestResolveOthers | 1/1 | 1 | 9 | 0 | reached |
| _cxPrizeAbilityOffer | 1/1 | 1 | 7 | 1 | reached |
| _cxPrizeEvolutionAssist | 1/1 | 1 | 2 | 2 | reached |
| _cxPrizeKnowledgeDump | 1/1 | 1 | 1 | 1 | reached |
| _cxPrizeSynergyHint | 1/1 | 1 | 9 | 9 | reached |
| _showEnd | 1/1 | 1 | 6 | 6 | reached |
| _showVillagerEnd | 1/1 | 1 | 5 | 5 | reached |
| answerCovenantCrisis | 1/1 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 1/1 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 1/1 | 0 | 0 | 0 | not_reached |
| apCarePackage | 1/1 | 1 | 49 | 17 | reached |
| apClubBoon | 1/1 | 1 | 132 | 6 | reached |
| apDeadDrop | 1/1 | 1 | 132 | 33 | reached |
| apPersonaPackage | 1/1 | 1 | 22 | 0 | reached |
| cleanCarcass | 1/1 | 0 | 0 | 0 | not_reached |
| comfort | 1/1 | 1 | 32 | 32 | reached |
| corpseLootAll | 1/1 | 1 | 29 | 29 | reached |
| corpseTakeItem | 1/1 | 0 | 0 | 0 | not_reached |
| craft | 1/1 | 0 | 0 | 0 | not_reached |
| doAction | 1/1 | 1 | 1021 | 665 | reached |
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
| takePrepMaterial | 1/1 | 0 | 0 | 0 | not_reached |
| takeWeapon | 1/1 | 0 | 0 | 0 | not_reached |
| tbEnd | 1/1 | 1 | 7 | 0 | reached |
| traderSell | 1/1 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 1/1 | 0 | 0 | 0 | not_reached |
| visitorWares | 1/1 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| sharpened_stick | 1 | 1 | 0 | 0 | ready_unused |
| sling | 1 | 0 | 0 | 0 | known_no_material_sample |
| snare | 1 | 1 | 0 | 0 | ready_unused |
| stone_knife | 1 | 1 | 0 | 0 | ready_unused |
| water_filter | 1 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 3 | 0 |
| npc/contest | 10 | 6 |
| player/contest | 14 | 10 |
| player/corpse-villager | 39 | 4 |
| player/fan-package | 17 | 7 |
| player/fan-vote | 6 | 0 |
| player/show | 1 | 1 |

Class/god distributions count runs observing each build; a run may observe several. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {},
  "npcClasses": {
    "forager/gardener": 1,
    "socialite/demagogue": 1
  },
  "playerGods": {},
  "npcGods": {},
  "winningEndings": {}
}
```
