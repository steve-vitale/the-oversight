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
      "sum": 32652,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 15816,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 738,
      "reportedRuns": 16
    }
  }
}
```

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 177 | 177 | reached |
| _contestResolveOthers | 16/16 | 16 | 114 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 42 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 21 | 21 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 10 | 16 | 16 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 49 | 47 | reached |
| _showEnd | 16/16 | 16 | 75 | 75 | reached |
| _showVillagerEnd | 16/16 | 16 | 30 | 30 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 544 | 147 | reached |
| apClubBoon | 16/16 | 16 | 1358 | 29 | reached |
| apDeadDrop | 16/16 | 16 | 1358 | 355 | reached |
| apPersonaPackage | 16/16 | 16 | 241 | 13 | reached |
| cleanCarcass | 16/16 | 13 | 362 | 0 | reached |
| comfort | 16/16 | 1 | 1 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 335 | 335 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 91 | 81 | reached |
| doAction | 16/16 | 16 | 11082 | 8127 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 5 | 7 | 7 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 7978 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 489 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 3 | 1 | 1 | produced |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 2 | 0 | 0 | ready_unused |
| fire_hardened_spear | 2 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 8 | 4 | 0 | 0 | ready_unused |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 7 | 6 | 0 | 0 | ready_unused |
| sharpened_stick | 7 | 6 | 0 | 0 | ready_unused |
| sling | 5 | 1 | 0 | 0 | ready_unused |
| snare | 14 | 8 | 86 | 76 | produced |
| stone_knife | 16 | 2 | 4 | 4 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 77 | 5 |
| npc/capstone | 10 | 0 |
| npc/contest | 103 | 49 |
| player/capstone | 2 | 1 |
| player/combat | 1 | 1 |
| player/contest | 116 | 65 |
| player/corpse-monster | 8 | 1 |
| player/corpse-person | 40 | 2 |
| player/corpse-villager | 391 | 36 |
| player/craft | 5 | 0 |
| player/fan-package | 147 | 58 |
| player/fan-vote | 29 | 0 |
| player/patron | 7 | 0 |
| player/show | 18 | 5 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 232,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 14193,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 17
    },
    "gods": {
      "currentBearer": 81,
      "notResident": 14
    }
  },
  "holderDays": {
    "classes": {
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 61,
        "holderIdentitiesAcrossRuns": 1
      },
      "forager/feaster": {
        "runs": 4,
        "holderDays": 281,
        "holderIdentitiesAcrossRuns": 5
      },
      "hunter/stalker": {
        "runs": 2,
        "holderDays": 124,
        "holderIdentitiesAcrossRuns": 2
      },
      "forager/gardener": {
        "runs": 8,
        "holderDays": 432,
        "holderIdentitiesAcrossRuns": 9
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 47,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 29,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 22,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 6,
        "holderDays": 327,
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
    "hunter/stalker": 6,
    "socialite/showrunner": 2,
    "hunter/beastmaster": 2,
    "socialite/demagogue": 1,
    "forager/feaster": 1,
    "forager/gardener": 1,
    "survivalist/furnace": 1,
    "brawler/berserker": 1,
    "explorer/cartographer": 1
  },
  "npcClasses": {
    "caregiver/healer": 1,
    "forager/feaster": 4,
    "forager/gardener": 8,
    "hunter/stalker": 2,
    "survivalist/furnace": 1,
    "socialite/demagogue": 1,
    "hunter/beastmaster": 1
  },
  "playerGods": {
    "apex_predator": 1,
    "living_garden": 1,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 6
  },
  "winningEndings": {
    "feared/none/none/light": 3,
    "feared/socialite/showrunner/light": 2,
    "beloved/none/none/light": 4,
    "relay/none/none/light": 1,
    "feared/socialite/demagogue/light": 1,
    "feared/hunter/stalker/light": 1,
    "feared/hunter/beastmaster/light": 1
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
      "sum": 36512,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 17519,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 735,
      "reportedRuns": 16
    },
    "livelihoodKnowledgeTrips": {
      "sum": 182,
      "reportedRuns": 16
    },
    "livelihoodBooksRead": {
      "sum": 11,
      "reportedRuns": 9
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 122,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 211,
      "reportedRuns": 16
    },
    "livelihoodRuinSearches": {
      "sum": 13,
      "reportedRuns": 13
    },
    "livelihoodHideHandledUnits": {
      "sum": 27,
      "reportedRuns": 8
    },
    "livelihoodSales": {
      "sum": 60,
      "reportedRuns": 8
    },
    "livelihoodHideTrials": {
      "sum": 9,
      "reportedRuns": 5
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 3,
      "reportedRuns": 3
    },
    "livelihoodCrafts": {
      "sum": 2,
      "reportedRuns": 2
    },
    "livelihoodBuys": {
      "sum": 6,
      "reportedRuns": 5
    },
    "livelihoodCounterCooks": {
      "sum": 1,
      "reportedRuns": 1
    }
  }
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 223 | 223 | reached |
| _contestResolveOthers | 16/16 | 16 | 141 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 55 | 15 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 40 | 40 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 71 | 58 | reached |
| _showEnd | 16/16 | 16 | 100 | 100 | reached |
| _showVillagerEnd | 16/16 | 15 | 41 | 41 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 618 | 230 | reached |
| apClubBoon | 16/16 | 16 | 1606 | 67 | reached |
| apDeadDrop | 16/16 | 16 | 1606 | 408 | reached |
| apPersonaPackage | 16/16 | 16 | 323 | 6 | reached |
| cleanCarcass | 16/16 | 11 | 221 | 0 | reached |
| comfort | 16/16 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 16/16 | 16 | 214 | 214 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 74 | 51 | reached |
| doAction | 16/16 | 16 | 13343 | 9310 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 2 | 4 | 4 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 10297 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 9 | 11 | 11 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 8 | 39 | 39 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 311 | 0 | reached |
| traderSell | 16/16 | 8 | 60 | 60 | reached |
| visitorBuyWare | 16/16 | 5 | 6 | 6 | reached |
| visitorWares | 16/16 | 16 | 1156 | 1156 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 2 | 0 | 0 | ready_unused |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| cook_spit | 1 | 1 | 0 | 0 | ready_unused |
| crossbow | 3 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 5 | 1 | 0 | 0 | ready_unused |
| decoy_rattle | 2 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 2 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 9 | 2 | 9 | 3 | produced |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 8 | 7 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 8 | 0 | 0 | ready_unused |
| sling | 2 | 0 | 0 | 0 | known_no_material_sample |
| snare | 13 | 9 | 57 | 41 | produced |
| spring_snare | 6 | 3 | 0 | 0 | ready_unused |
| stone_knife | 16 | 4 | 8 | 7 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 59 | 3 |
| npc/capstone | 12 | 0 |
| npc/contest | 109 | 65 |
| player/capstone | 3 | 2 |
| player/contest | 148 | 95 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 11 | 1 |
| player/corpse-villager | 389 | 44 |
| player/craft | 10 | 0 |
| player/fan-package | 230 | 102 |
| player/fan-vote | 67 | 0 |
| player/patron | 2 | 0 |
| player/show | 19 | 5 |
| player/trade | 6 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 218,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16245,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 109
    },
    "gods": {
      "currentBearer": 28,
      "notResident": 88
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 248,
        "holderIdentitiesAcrossRuns": 7
      },
      "socialite/demagogue": {
        "runs": 4,
        "holderDays": 33,
        "holderIdentitiesAcrossRuns": 4
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 585,
        "holderIdentitiesAcrossRuns": 10
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 89,
        "holderIdentitiesAcrossRuns": 4
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 97,
        "holderIdentitiesAcrossRuns": 2
      },
      "survivalist/furnace": {
        "runs": 2,
        "holderDays": 37,
        "holderIdentitiesAcrossRuns": 2
      },
      "forager/gardener": {
        "runs": 4,
        "holderDays": 302,
        "holderIdentitiesAcrossRuns": 5
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 58,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 6,
        "holderDays": 452,
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
    "hunter/stalker": 7,
    "forager/feaster": 2,
    "hunter/beastmaster": 2,
    "drifter/trickster": 2,
    "socialite/showrunner": 1,
    "explorer/cartographer": 1,
    "forager/gardener": 1,
    "survivalist/furnace": 1
  },
  "npcClasses": {
    "hunter/stalker": 5,
    "socialite/demagogue": 4,
    "forager/feaster": 7,
    "socialite/showrunner": 4,
    "hunter/beastmaster": 2,
    "survivalist/furnace": 2,
    "forager/gardener": 4,
    "caregiver/healer": 1
  },
  "playerGods": {
    "apex_predator": 2,
    "living_garden": 2,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 6
  },
  "winningEndings": {
    "feared/hunter/stalker/light": 2,
    "beloved/hunter/stalker/light": 2,
    "feared/forager/feaster/light": 1,
    "feared/drifter/trickster/light": 1,
    "feared/survivalist/furnace/light": 1
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
      "sum": 36687,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 16650,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 631,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 188,
      "reportedRuns": 16
    },
    "livelihoodSales": {
      "sum": 60,
      "reportedRuns": 10
    },
    "livelihoodBuys": {
      "sum": 9,
      "reportedRuns": 6
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 118,
      "reportedRuns": 11
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 225 | 225 | reached |
| _contestResolveOthers | 16/16 | 16 | 129 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 55 | 21 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 13 | 19 | 19 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 24 | 24 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 85 | 76 | reached |
| _showEnd | 16/16 | 15 | 103 | 103 | reached |
| _showVillagerEnd | 16/16 | 14 | 49 | 49 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 587 | 231 | reached |
| apClubBoon | 16/16 | 16 | 1620 | 81 | reached |
| apDeadDrop | 16/16 | 16 | 1620 | 412 | reached |
| apPersonaPackage | 16/16 | 16 | 343 | 2 | reached |
| cleanCarcass | 16/16 | 10 | 442 | 0 | reached |
| comfort | 16/16 | 1 | 1 | 1 | reached |
| corpseLootAll | 16/16 | 16 | 181 | 181 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 8 | 99 | 87 | reached |
| doAction | 16/16 | 16 | 13974 | 9501 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 4 | 5 | 5 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11488 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 191 | 0 | reached |
| traderSell | 16/16 | 10 | 60 | 60 | reached |
| visitorBuyWare | 16/16 | 6 | 9 | 9 | reached |
| visitorWares | 16/16 | 16 | 1220 | 1220 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 3 | 1 | 1 | produced |
| bow | 6 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 1 | 0 | 0 | ready_unused |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 2 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 3 | 1 | 0 | 0 | ready_unused |
| pit_trap | 9 | 8 | 0 | 0 | ready_unused |
| sharpened_stick | 7 | 5 | 0 | 0 | ready_unused |
| sling | 4 | 1 | 0 | 0 | ready_unused |
| snare | 13 | 9 | 92 | 81 | produced |
| stone_knife | 16 | 2 | 6 | 5 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 41 | 1 |
| npc/capstone | 11 | 0 |
| npc/contest | 123 | 49 |
| player/capstone | 2 | 0 |
| player/combat | 2 | 2 |
| player/contest | 147 | 81 |
| player/corpse-monster | 4 | 0 |
| player/corpse-person | 37 | 2 |
| player/corpse-villager | 269 | 25 |
| player/craft | 6 | 0 |
| player/fan-package | 231 | 98 |
| player/fan-vote | 81 | 0 |
| player/show | 25 | 11 |
| player/trade | 9 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 201,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16982,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 186
    },
    "gods": {
      "currentBearer": 65,
      "notResident": 48
    }
  },
  "holderDays": {
    "classes": {
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 126,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/showrunner": {
        "runs": 5,
        "holderDays": 283,
        "holderIdentitiesAcrossRuns": 7
      },
      "forager/gardener": {
        "runs": 9,
        "holderDays": 740,
        "holderIdentitiesAcrossRuns": 13
      },
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 288,
        "holderIdentitiesAcrossRuns": 5
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 109,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 63,
        "holderIdentitiesAcrossRuns": 2
      },
      "forager/feaster": {
        "runs": 5,
        "holderDays": 384,
        "holderIdentitiesAcrossRuns": 6
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 81,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 9,
        "holderDays": 570,
        "holderIdentitiesAcrossRuns": 11
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "hunter/stalker": 6,
    "caregiver/healer": 1,
    "forager/feaster": 2,
    "forager/gardener": 3,
    "drifter/trickster": 1,
    "socialite/showrunner": 1
  },
  "npcClasses": {
    "caregiver/healer": 2,
    "socialite/showrunner": 5,
    "forager/gardener": 9,
    "hunter/stalker": 6,
    "socialite/demagogue": 2,
    "survivalist/furnace": 1,
    "forager/feaster": 5,
    "hunter/beastmaster": 1
  },
  "playerGods": {
    "living_garden": 3
  },
  "npcGods": {
    "living_garden": 9
  },
  "winningEndings": {
    "feared/caregiver/healer/light": 1,
    "feared/none/none/light": 1,
    "witness/none/none/light": 2,
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
      "sum": 35096,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 15711,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 591,
      "reportedRuns": 16
    },
    "livelihoodPatients": {
      "sum": 692,
      "reportedRuns": 16
    },
    "livelihoodComforts": {
      "sum": 180,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 167,
      "reportedRuns": 15
    },
    "livelihoodTreatments": {
      "sum": 78,
      "reportedRuns": 14
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 218 | 218 | reached |
| _contestResolveOthers | 16/16 | 16 | 122 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 58 | 21 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 8 | 14 | 14 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 16 | 31 | 31 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 67 | 62 | reached |
| _showEnd | 16/16 | 16 | 103 | 103 | reached |
| _showVillagerEnd | 16/16 | 15 | 43 | 43 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 607 | 208 | reached |
| apClubBoon | 16/16 | 16 | 1633 | 75 | reached |
| apDeadDrop | 16/16 | 16 | 1633 | 423 | reached |
| apPersonaPackage | 16/16 | 16 | 323 | 9 | reached |
| cleanCarcass | 16/16 | 14 | 261 | 0 | reached |
| comfort | 16/16 | 16 | 180 | 180 | reached |
| corpseLootAll | 16/16 | 16 | 238 | 238 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 7 | 64 | 55 | reached |
| doAction | 16/16 | 16 | 12818 | 9345 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 4 | 4 | 4 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 10529 | 0 | reached |
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
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 3 | 0 | 0 | ready_unused |
| bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 5 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 5 | 1 | 0 | 0 | ready_unused |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 3 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 9 | 7 | 0 | 0 | ready_unused |
| sharpened_stick | 12 | 9 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 7 | 60 | 52 | produced |
| stone_knife | 16 | 1 | 4 | 3 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 60 | 3 |
| npc/capstone | 16 | 1 |
| npc/contest | 121 | 56 |
| npc/show | 2 | 0 |
| player/capstone | 5 | 2 |
| player/contest | 135 | 77 |
| player/corpse-monster | 4 | 0 |
| player/corpse-person | 29 | 2 |
| player/corpse-villager | 408 | 47 |
| player/craft | 3 | 0 |
| player/fan-package | 208 | 79 |
| player/fan-vote | 75 | 0 |
| player/patron | 7 | 0 |
| player/show | 34 | 9 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 209,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16220,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 112
    },
    "gods": {
      "currentBearer": 113,
      "notResident": 87
    }
  },
  "holderDays": {
    "classes": {
      "forager/feaster": {
        "runs": 9,
        "holderDays": 489,
        "holderIdentitiesAcrossRuns": 10
      },
      "hunter/stalker": {
        "runs": 8,
        "holderDays": 356,
        "holderIdentitiesAcrossRuns": 9
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 17,
        "holderIdentitiesAcrossRuns": 2
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 84,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 2,
        "holderDays": 40,
        "holderIdentitiesAcrossRuns": 2
      },
      "forager/gardener": {
        "runs": 8,
        "holderDays": 691,
        "holderIdentitiesAcrossRuns": 11
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 89,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 23,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 12,
        "holderDays": 576,
        "holderIdentitiesAcrossRuns": 15
      },
      "shepherd_of_the_dead": {
        "runs": 1,
        "holderDays": 25,
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
    "drifter/trickster": 4,
    "explorer/cartographer": 2,
    "socialite/demagogue": 3,
    "socialite/showrunner": 3,
    "hunter/stalker": 4,
    "forager/gardener": 4,
    "caregiver/healer": 1,
    "survivalist/furnace": 1,
    "hunter/beastmaster": 1
  },
  "npcClasses": {
    "forager/feaster": 9,
    "hunter/stalker": 8,
    "socialite/demagogue": 1,
    "caregiver/healer": 1,
    "socialite/showrunner": 2,
    "forager/gardener": 8,
    "survivalist/furnace": 1,
    "hunter/beastmaster": 1
  },
  "playerGods": {
    "voice_of_the_relay": 3,
    "living_garden": 2,
    "shepherd_of_the_dead": 1,
    "the_between": 1,
    "apex_predator": 1
  },
  "npcGods": {
    "living_garden": 12,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "beloved/hunter/stalker/light": 1,
    "beloved/none/none/light": 2,
    "feared/caregiver/healer/light": 1,
    "feared/socialite/demagogue/light": 1,
    "feared/none/none/light": 1,
    "feared/hunter/stalker/light": 1,
    "assimilated/none/none/light": 1,
    "relay/socialite/showrunner/light": 1,
    "beloved/hunter/beastmaster/light": 1
  }
}
```
