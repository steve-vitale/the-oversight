# Feature and build census

Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.

## capable controller coverage

Captured errors are bounded diagnostics, not total failed-call counts. Missing legacy/profile diagnostics remain unknown. Blocked opportunity counters are coverage, not successful feature use; the material counter counts distinct bearer/day keys. Counter sums include only explicit reports; absent counters are not imputed as zero.

```json
{
  "version": 1,
  "measuredRuns": 16,
  "missingRuns": 0,
  "errorKnownRuns": 16,
  "errorRuns": 0,
  "capturedErrorReasons": {},
  "blockKnownRuns": 16,
  "blockedRuns": 0,
  "blocks": [],
  "counters": {
    "convoPageReads": {
      "sum": 14499,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 803,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 9,
      "reportedRuns": 6
    }
  }
}
```

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 127 | 127 | reached |
| _contestResolveOthers | 16/16 | 16 | 86 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 14 | 41 | 19 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 5 | 8 | 8 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 23 | 23 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 41 | 39 | reached |
| _showEnd | 16/16 | 16 | 81 | 81 | reached |
| _showVillagerEnd | 16/16 | 9 | 16 | 16 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 391 | 116 | reached |
| apClubBoon | 16/16 | 16 | 1164 | 12 | reached |
| apDeadDrop | 16/16 | 16 | 1164 | 297 | reached |
| apPersonaPackage | 16/16 | 16 | 219 | 16 | reached |
| cleanCarcass | 16/16 | 12 | 279 | 0 | reached |
| comfort | 16/16 | 3 | 9 | 5 | reached |
| corpseLootAll | 16/16 | 16 | 244 | 244 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 12 | 89 | 79 | reached |
| doAction | 16/16 | 16 | 9821 | 7126 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 10 | 46 | 46 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 7251 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 0 | 0 | 0 | not_reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 0 | 0 | 0 | not_reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 516 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 2 | 1 | 1 | produced |
| bolt | 1 | 0 | 0 | 0 | known_no_material_sample |
| bow | 6 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 6 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 5 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 5 | 0 | 0 | ready_unused |
| sharpened_stick | 5 | 3 | 0 | 0 | ready_unused |
| sling | 5 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 8 | 78 | 69 | produced |
| stone_knife | 16 | 2 | 10 | 9 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 59 | 1 |
| npc/capstone | 5 | 0 |
| npc/contest | 66 | 46 |
| player/capstone | 1 | 0 |
| player/combat | 3 | 3 |
| player/contest | 87 | 53 |
| player/corpse-monster | 10 | 1 |
| player/corpse-person | 47 | 2 |
| player/corpse-villager | 446 | 49 |
| player/craft | 10 | 0 |
| player/fan-package | 116 | 30 |
| player/fan-vote | 10 | 0 |
| player/patron | 6 | 0 |
| player/show | 17 | 1 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 230,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 12310,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 13
    },
    "gods": {
      "currentBearer": 16,
      "notResident": 2
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 6,
        "holderDays": 170,
        "holderIdentitiesAcrossRuns": 7
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 32,
        "holderIdentitiesAcrossRuns": 3
      },
      "hunter/stalker": {
        "runs": 4,
        "holderDays": 129,
        "holderIdentitiesAcrossRuns": 4
      },
      "forager/feaster": {
        "runs": 4,
        "holderDays": 231,
        "holderIdentitiesAcrossRuns": 6
      }
    },
    "gods": {
      "living_garden": {
        "runs": 4,
        "holderDays": 63,
        "holderIdentitiesAcrossRuns": 5
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "socialite/showrunner": 2,
    "hunter/stalker": 4,
    "socialite/demagogue": 3,
    "forager/gardener": 3,
    "forager/feaster": 3,
    "caregiver/healer": 1,
    "explorer/cartographer": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "forager/gardener": 6,
    "socialite/showrunner": 3,
    "hunter/stalker": 4,
    "forager/feaster": 4
  },
  "playerGods": {
    "voice_of_the_relay": 1,
    "living_garden": 1
  },
  "npcGods": {
    "living_garden": 4
  },
  "winningEndings": {
    "beloved/socialite/showrunner/light": 2,
    "beloved/none/none/light": 3,
    "feared/none/none/light": 5,
    "relay/none/none/light": 3,
    "indispensable/none/none/light": 1,
    "feared/hunter/stalker/light": 1,
    "feared/drifter/trickster/light": 1
  }
}
```

## maker controller coverage

Captured errors are bounded diagnostics, not total failed-call counts. Missing legacy/profile diagnostics remain unknown. Blocked opportunity counters are coverage, not successful feature use; the material counter counts distinct bearer/day keys. Counter sums include only explicit reports; absent counters are not imputed as zero.

```json
{
  "version": 1,
  "measuredRuns": 16,
  "missingRuns": 0,
  "errorKnownRuns": 16,
  "errorRuns": 0,
  "capturedErrorReasons": {},
  "blockKnownRuns": 16,
  "blockedRuns": 0,
  "blocks": [],
  "counters": {
    "convoPageReads": {
      "sum": 19071,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 722,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 1,
      "reportedRuns": 1
    },
    "livelihoodKnowledgeTrips": {
      "sum": 240,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 170,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 125,
      "reportedRuns": 14
    },
    "livelihoodRuinSearches": {
      "sum": 14,
      "reportedRuns": 14
    },
    "livelihoodSales": {
      "sum": 46,
      "reportedRuns": 10
    },
    "livelihoodHideHandledUnits": {
      "sum": 37,
      "reportedRuns": 11
    },
    "livelihoodHideTrials": {
      "sum": 12,
      "reportedRuns": 8
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 5,
      "reportedRuns": 5
    },
    "livelihoodCounterCooks": {
      "sum": 6,
      "reportedRuns": 2
    },
    "livelihoodCounterPreserves": {
      "sum": 5,
      "reportedRuns": 2
    },
    "livelihoodCounterStored": {
      "sum": 5,
      "reportedRuns": 2
    },
    "livelihoodBuys": {
      "sum": 8,
      "reportedRuns": 6
    },
    "livelihoodBooksRead": {
      "sum": 7,
      "reportedRuns": 6
    },
    "livelihoodCrafts": {
      "sum": 3,
      "reportedRuns": 3
    }
  }
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 232 | 232 | reached |
| _contestResolveOthers | 16/16 | 16 | 154 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 58 | 25 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 13 | 22 | 22 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 19 | 19 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 72 | 70 | reached |
| _showEnd | 16/16 | 16 | 97 | 97 | reached |
| _showVillagerEnd | 16/16 | 13 | 37 | 37 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 633 | 206 | reached |
| apClubBoon | 16/16 | 16 | 1659 | 51 | reached |
| apDeadDrop | 16/16 | 16 | 1659 | 411 | reached |
| apPersonaPackage | 16/16 | 16 | 320 | 26 | reached |
| cleanCarcass | 16/16 | 13 | 304 | 0 | reached |
| comfort | 16/16 | 5 | 21 | 4 | reached |
| corpseLootAll | 16/16 | 16 | 227 | 227 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 119 | 101 | reached |
| doAction | 16/16 | 16 | 13626 | 9648 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 153 | 153 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 10732 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 2 | 5 | 0 | reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 6 | 7 | 7 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 11 | 74 | 74 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 288 | 0 | reached |
| traderSell | 16/16 | 10 | 46 | 46 | reached |
| visitorBuyWare | 16/16 | 6 | 8 | 8 | reached |
| visitorWares | 16/16 | 16 | 1130 | 1130 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 6 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 5 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| deadfall | 2 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 12 | 4 | 12 | 5 | produced |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 4 | 0 | 0 | ready_unused |
| sharpened_stick | 8 | 6 | 0 | 0 | ready_unused |
| sling | 6 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 9 | 96 | 86 | produced |
| spring_snare | 4 | 0 | 0 | 0 | known_no_material_sample |
| stone_knife | 16 | 5 | 11 | 10 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 33 | 1 |
| npc/capstone | 10 | 0 |
| npc/contest | 127 | 74 |
| npc/show | 2 | 0 |
| player/contest | 139 | 80 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 14 | 1 |
| player/corpse-villager | 536 | 49 |
| player/craft | 15 | 0 |
| player/fan-package | 206 | 87 |
| player/fan-vote | 51 | 0 |
| player/patron | 19 | 0 |
| player/show | 25 | 8 |
| player/trade | 8 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 225,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16960,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 246
    },
    "gods": {
      "currentBearer": 54,
      "notResident": 88
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 6,
        "holderDays": 279,
        "holderIdentitiesAcrossRuns": 7
      },
      "forager/feaster": {
        "runs": 11,
        "holderDays": 705,
        "holderIdentitiesAcrossRuns": 13
      },
      "hunter/stalker": {
        "runs": 7,
        "holderDays": 478,
        "holderIdentitiesAcrossRuns": 9
      },
      "caregiver/healer": {
        "runs": 4,
        "holderDays": 278,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/showrunner": {
        "runs": 5,
        "holderDays": 147,
        "holderIdentitiesAcrossRuns": 5
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 40,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 9,
        "holderDays": 389,
        "holderIdentitiesAcrossRuns": 10
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "socialite/showrunner": 7,
    "forager/feaster": 4,
    "hunter/stalker": 7,
    "socialite/demagogue": 1,
    "forager/gardener": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "forager/feaster": 11,
    "forager/gardener": 6,
    "hunter/stalker": 7,
    "caregiver/healer": 4,
    "socialite/showrunner": 5,
    "socialite/demagogue": 2
  },
  "playerGods": {
    "voice_of_the_relay": 3,
    "living_garden": 1
  },
  "npcGods": {
    "living_garden": 9
  },
  "winningEndings": {
    "beloved/hunter/stalker/light": 1,
    "beloved/none/none/light": 2,
    "relay/socialite/showrunner/light": 1,
    "beloved/socialite/showrunner/light": 2,
    "feared/none/none/light": 1,
    "feared/socialite/showrunner/light": 1,
    "witness/hunter/stalker/light": 1
  }
}
```

## merchant controller coverage

Captured errors are bounded diagnostics, not total failed-call counts. Missing legacy/profile diagnostics remain unknown. Blocked opportunity counters are coverage, not successful feature use; the material counter counts distinct bearer/day keys. Counter sums include only explicit reports; absent counters are not imputed as zero.

```json
{
  "version": 1,
  "measuredRuns": 16,
  "missingRuns": 0,
  "errorKnownRuns": 16,
  "errorRuns": 0,
  "capturedErrorReasons": {},
  "blockKnownRuns": 16,
  "blockedRuns": 0,
  "blocks": [],
  "counters": {
    "convoPageReads": {
      "sum": 17497,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 877,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 12,
      "reportedRuns": 9
    },
    "livelihoodHarvestTrips": {
      "sum": 232,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 150,
      "reportedRuns": 16
    },
    "livelihoodBuys": {
      "sum": 11,
      "reportedRuns": 9
    },
    "livelihoodSales": {
      "sum": 37,
      "reportedRuns": 10
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 172 | 172 | reached |
| _contestResolveOthers | 16/16 | 16 | 114 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 51 | 17 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 19 | 19 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 28 | 28 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 57 | 52 | reached |
| _showEnd | 16/16 | 16 | 91 | 91 | reached |
| _showVillagerEnd | 16/16 | 14 | 44 | 44 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 547 | 198 | reached |
| apClubBoon | 16/16 | 16 | 1468 | 40 | reached |
| apDeadDrop | 16/16 | 16 | 1468 | 369 | reached |
| apPersonaPackage | 16/16 | 16 | 303 | 11 | reached |
| cleanCarcass | 16/16 | 10 | 256 | 0 | reached |
| comfort | 16/16 | 5 | 21 | 6 | reached |
| corpseLootAll | 16/16 | 16 | 143 | 143 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 74 | 68 | reached |
| doAction | 16/16 | 16 | 12453 | 8596 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 67 | 67 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 9395 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 0 | 0 | 0 | not_reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 0 | 0 | 0 | not_reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 267 | 0 | reached |
| traderSell | 16/16 | 10 | 37 | 37 | reached |
| visitorBuyWare | 16/16 | 9 | 11 | 11 | reached |
| visitorWares | 16/16 | 16 | 1174 | 1174 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 3 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 7 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 5 | 4 | 0 | 0 | ready_unused |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 5 | 4 | 0 | 0 | ready_unused |
| sling | 2 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 6 | 66 | 60 | produced |
| stone_knife | 16 | 3 | 8 | 8 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 23 | 0 |
| npc/capstone | 16 | 1 |
| npc/contest | 94 | 45 |
| player/capstone | 2 | 0 |
| player/contest | 121 | 60 |
| player/corpse-monster | 4 | 0 |
| player/corpse-person | 32 | 2 |
| player/corpse-villager | 329 | 43 |
| player/craft | 8 | 0 |
| player/fan-package | 198 | 70 |
| player/fan-vote | 38 | 0 |
| player/patron | 4 | 0 |
| player/show | 20 | 7 |
| player/trade | 11 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 207,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 15606,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 186
    },
    "gods": {
      "currentBearer": 44,
      "notResident": 97
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 11,
        "holderDays": 441,
        "holderIdentitiesAcrossRuns": 12
      },
      "forager/feaster": {
        "runs": 9,
        "holderDays": 470,
        "holderIdentitiesAcrossRuns": 9
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 60,
        "holderIdentitiesAcrossRuns": 3
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 70,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 21,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 63,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/stalker": {
        "runs": 4,
        "holderDays": 180,
        "holderIdentitiesAcrossRuns": 4
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 39,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 11,
        "holderDays": 385,
        "holderIdentitiesAcrossRuns": 15
      },
      "apex_predator": {
        "runs": 1,
        "holderDays": 12,
        "holderIdentitiesAcrossRuns": 1
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "socialite/showrunner": 5,
    "forager/gardener": 2,
    "hunter/stalker": 6,
    "forager/feaster": 1
  },
  "npcClasses": {
    "forager/gardener": 11,
    "forager/feaster": 9,
    "socialite/showrunner": 3,
    "hunter/beastmaster": 2,
    "socialite/demagogue": 1,
    "hunter/stalker": 4,
    "survivalist/furnace": 1,
    "caregiver/healer": 1
  },
  "playerGods": {
    "voice_of_the_relay": 4,
    "living_garden": 2
  },
  "npcGods": {
    "living_garden": 11,
    "apex_predator": 1
  },
  "winningEndings": {
    "feared/none/none/light": 4,
    "beloved/socialite/showrunner/light": 2,
    "feared/socialite/showrunner/light": 1,
    "feared/hunter/stalker/light": 3,
    "beloved/hunter/stalker/light": 1,
    "beloved/none/none/light": 1,
    "beloved/forager/feaster/light": 1
  }
}
```

## caregiver controller coverage

Captured errors are bounded diagnostics, not total failed-call counts. Missing legacy/profile diagnostics remain unknown. Blocked opportunity counters are coverage, not successful feature use; the material counter counts distinct bearer/day keys. Counter sums include only explicit reports; absent counters are not imputed as zero.

```json
{
  "version": 1,
  "measuredRuns": 16,
  "missingRuns": 0,
  "errorKnownRuns": 16,
  "errorRuns": 0,
  "capturedErrorReasons": {},
  "blockKnownRuns": 16,
  "blockedRuns": 0,
  "blocks": [],
  "counters": {
    "convoPageReads": {
      "sum": 19792,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 798,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 10,
      "reportedRuns": 7
    },
    "livelihoodPatients": {
      "sum": 727,
      "reportedRuns": 16
    },
    "livelihoodComforts": {
      "sum": 135,
      "reportedRuns": 16
    },
    "livelihoodTreatments": {
      "sum": 56,
      "reportedRuns": 13
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 133,
      "reportedRuns": 15
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 230 | 230 | reached |
| _contestResolveOthers | 16/16 | 16 | 151 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 64 | 15 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 13 | 27 | 27 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 32 | 32 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 81 | 79 | reached |
| _showEnd | 16/16 | 16 | 104 | 104 | reached |
| _showVillagerEnd | 16/16 | 14 | 42 | 42 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 625 | 223 | reached |
| apClubBoon | 16/16 | 16 | 1726 | 58 | reached |
| apDeadDrop | 16/16 | 16 | 1726 | 435 | reached |
| apPersonaPackage | 16/16 | 16 | 358 | 7 | reached |
| cleanCarcass | 16/16 | 14 | 278 | 0 | reached |
| comfort | 16/16 | 16 | 161 | 143 | reached |
| corpseLootAll | 16/16 | 16 | 235 | 235 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 105 | 80 | reached |
| doAction | 16/16 | 16 | 13610 | 9920 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 36 | 36 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11671 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 0 | 0 | 0 | not_reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 0 | 0 | 0 | not_reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 265 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 6 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 3 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 8 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 8 | 98 | 73 | produced |
| stone_knife | 16 | 4 | 7 | 7 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 37 | 0 |
| npc/capstone | 12 | 0 |
| npc/contest | 138 | 61 |
| player/capstone | 2 | 0 |
| player/combat | 1 | 1 |
| player/contest | 140 | 79 |
| player/corpse-monster | 4 | 0 |
| player/corpse-person | 31 | 4 |
| player/corpse-villager | 367 | 41 |
| player/craft | 7 | 0 |
| player/fan-package | 223 | 88 |
| player/fan-vote | 58 | 0 |
| player/patron | 3 | 0 |
| player/show | 23 | 9 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 196,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16941,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 85
    },
    "gods": {
      "currentBearer": 187,
      "notResident": 52
    }
  },
  "holderDays": {
    "classes": {
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 13,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 11,
        "holderDays": 349,
        "holderIdentitiesAcrossRuns": 13
      },
      "forager/feaster": {
        "runs": 8,
        "holderDays": 605,
        "holderIdentitiesAcrossRuns": 10
      },
      "hunter/stalker": {
        "runs": 6,
        "holderDays": 316,
        "holderIdentitiesAcrossRuns": 6
      },
      "forager/gardener": {
        "runs": 7,
        "holderDays": 440,
        "holderIdentitiesAcrossRuns": 7
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 44,
        "holderIdentitiesAcrossRuns": 3
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 48,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 10,
        "holderDays": 558,
        "holderIdentitiesAcrossRuns": 12
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "socialite/showrunner": 2,
    "forager/gardener": 6,
    "hunter/stalker": 5,
    "survivalist/furnace": 2,
    "caregiver/healer": 1,
    "drifter/trickster": 1,
    "socialite/demagogue": 2
  },
  "npcClasses": {
    "socialite/showrunner": 11,
    "survivalist/furnace": 1,
    "forager/feaster": 8,
    "hunter/stalker": 6,
    "forager/gardener": 7,
    "socialite/demagogue": 2,
    "caregiver/healer": 1
  },
  "playerGods": {
    "voice_of_the_relay": 3,
    "living_garden": 3
  },
  "npcGods": {
    "living_garden": 10
  },
  "winningEndings": {
    "feared/none/none/light": 3,
    "beloved/hunter/stalker/light": 1,
    "defiant/forager/gardener/light": 1,
    "beloved/none/none/light": 2,
    "relay/socialite/demagogue/light": 1
  }
}
```
