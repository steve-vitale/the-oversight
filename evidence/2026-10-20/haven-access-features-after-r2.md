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
      "sum": 13969,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 773,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 5,
      "reportedRuns": 5
    }
  }
}
```

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 147 | 147 | reached |
| _contestResolveOthers | 16/16 | 16 | 84 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 39 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 7 | 8 | 8 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 24 | 24 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 33 | 29 | reached |
| _showEnd | 16/16 | 16 | 79 | 79 | reached |
| _showVillagerEnd | 16/16 | 13 | 28 | 28 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 385 | 105 | reached |
| apClubBoon | 16/16 | 16 | 1119 | 15 | reached |
| apDeadDrop | 16/16 | 16 | 1119 | 290 | reached |
| apPersonaPackage | 16/16 | 16 | 213 | 13 | reached |
| cleanCarcass | 16/16 | 11 | 279 | 0 | reached |
| comfort | 16/16 | 5 | 22 | 6 | reached |
| corpseLootAll | 16/16 | 16 | 211 | 211 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 82 | 76 | reached |
| doAction | 16/16 | 16 | 9545 | 6840 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 43 | 43 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 6951 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 472 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 2 | 2 | 2 | produced |
| bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 3 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 5 | 2 | 0 | 0 | ready_unused |
| hunting_spear | 5 | 1 | 0 | 0 | ready_unused |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 5 | 4 | 0 | 0 | ready_unused |
| sling | 2 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 9 | 72 | 66 | produced |
| stone_knife | 16 | 4 | 8 | 8 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 33 | 0 |
| npc/capstone | 7 | 0 |
| npc/contest | 76 | 45 |
| player/capstone | 3 | 1 |
| player/combat | 2 | 2 |
| player/contest | 94 | 52 |
| player/corpse-monster | 7 | 0 |
| player/corpse-person | 25 | 2 |
| player/corpse-villager | 321 | 28 |
| player/craft | 10 | 0 |
| player/fan-package | 105 | 22 |
| player/fan-vote | 15 | 0 |
| player/patron | 5 | 0 |
| player/show | 22 | 3 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 222,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 11973,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 36
    },
    "gods": {
      "currentBearer": 30,
      "notResident": 4
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 6,
        "holderDays": 264,
        "holderIdentitiesAcrossRuns": 7
      },
      "forager/feaster": {
        "runs": 5,
        "holderDays": 223,
        "holderIdentitiesAcrossRuns": 5
      },
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 64,
        "holderIdentitiesAcrossRuns": 5
      },
      "socialite/demagogue": {
        "runs": 3,
        "holderDays": 55,
        "holderIdentitiesAcrossRuns": 3
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 25,
        "holderIdentitiesAcrossRuns": 3
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 54,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 7,
        "holderDays": 78,
        "holderIdentitiesAcrossRuns": 7
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "brawler/berserker": 1,
    "forager/gardener": 6,
    "socialite/showrunner": 3,
    "socialite/demagogue": 3,
    "survivalist/furnace": 1,
    "caregiver/healer": 1,
    "forager/feaster": 1
  },
  "npcClasses": {
    "forager/gardener": 6,
    "forager/feaster": 5,
    "hunter/stalker": 5,
    "socialite/demagogue": 3,
    "socialite/showrunner": 3,
    "caregiver/healer": 2
  },
  "playerGods": {
    "one_person_army": 1,
    "living_garden": 2,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 7
  },
  "winningEndings": {
    "beloved/brawler/berserker/light": 1,
    "feared/forager/gardener/light": 1,
    "beloved/forager/gardener/light": 2,
    "feared/socialite/showrunner/light": 1,
    "feared/none/none/light": 2,
    "beloved/none/none/light": 6,
    "relay/none/none/light": 1,
    "beloved/socialite/demagogue/light": 1
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
      "sum": 16902,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 581,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 3,
      "reportedRuns": 2
    },
    "livelihoodKnowledgeTrips": {
      "sum": 198,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 159,
      "reportedRuns": 16
    },
    "livelihoodSales": {
      "sum": 35,
      "reportedRuns": 8
    },
    "livelihoodHideHandledUnits": {
      "sum": 34,
      "reportedRuns": 10
    },
    "livelihoodHideTrials": {
      "sum": 14,
      "reportedRuns": 7
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 5,
      "reportedRuns": 5
    },
    "livelihoodCounterCooks": {
      "sum": 4,
      "reportedRuns": 2
    },
    "livelihoodBuys": {
      "sum": 10,
      "reportedRuns": 7
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 125,
      "reportedRuns": 14
    },
    "livelihoodRuinSearches": {
      "sum": 11,
      "reportedRuns": 11
    },
    "livelihoodCounterPreserves": {
      "sum": 2,
      "reportedRuns": 1
    },
    "livelihoodCounterStored": {
      "sum": 2,
      "reportedRuns": 1
    },
    "livelihoodMaterialUnits": {
      "sum": 4,
      "reportedRuns": 1
    },
    "livelihoodMaterialTakes": {
      "sum": 4,
      "reportedRuns": 1
    },
    "livelihoodCrafts": {
      "sum": 5,
      "reportedRuns": 4
    },
    "livelihoodBooksRead": {
      "sum": 6,
      "reportedRuns": 5
    }
  }
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 175 | 175 | reached |
| _contestResolveOthers | 16/16 | 16 | 104 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 14 | 36 | 15 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 22 | 22 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 10 | 21 | 21 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 66 | 64 | reached |
| _showEnd | 16/16 | 15 | 100 | 100 | reached |
| _showVillagerEnd | 16/16 | 15 | 36 | 36 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 546 | 191 | reached |
| apClubBoon | 16/16 | 15 | 1508 | 47 | reached |
| apDeadDrop | 16/16 | 15 | 1508 | 374 | reached |
| apPersonaPackage | 16/16 | 15 | 306 | 24 | reached |
| cleanCarcass | 16/16 | 11 | 315 | 0 | reached |
| comfort | 16/16 | 6 | 18 | 5 | reached |
| corpseLootAll | 16/16 | 16 | 146 | 146 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 12 | 110 | 94 | reached |
| doAction | 16/16 | 16 | 12346 | 8630 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 103 | 103 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 9248 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 1 | 2 | 0 | reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 5 | 6 | 6 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 10 | 42 | 42 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 249 | 0 | reached |
| traderSell | 16/16 | 8 | 35 | 35 | reached |
| visitorBuyWare | 16/16 | 7 | 10 | 10 | reached |
| visitorWares | 16/16 | 16 | 1064 | 1064 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 1 | 0 | 0 | ready_unused |
| bolt | 1 | 0 | 0 | 0 | known_no_material_sample |
| bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 3 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| deadfall | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 10 | 2 | 16 | 7 | produced |
| hunting_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 6 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 8 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 10 | 82 | 76 | produced |
| spring_snare | 3 | 0 | 0 | 0 | known_no_material_sample |
| stone_knife | 16 | 5 | 12 | 11 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 42 | 0 |
| npc/capstone | 13 | 0 |
| npc/contest | 97 | 36 |
| npc/show | 1 | 0 |
| player/capstone | 1 | 1 |
| player/contest | 114 | 63 |
| player/corpse-monster | 5 | 2 |
| player/corpse-person | 24 | 0 |
| player/corpse-villager | 309 | 9 |
| player/craft | 18 | 0 |
| player/fan-package | 191 | 66 |
| player/fan-vote | 47 | 0 |
| player/patron | 17 | 0 |
| player/show | 18 | 8 |
| player/trade | 10 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 202,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 15240,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 468
    },
    "gods": {
      "notResident": 96,
      "currentBearer": 54
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 6,
        "holderDays": 290,
        "holderIdentitiesAcrossRuns": 8
      },
      "forager/feaster": {
        "runs": 10,
        "holderDays": 532,
        "holderIdentitiesAcrossRuns": 12
      },
      "forager/gardener": {
        "runs": 6,
        "holderDays": 375,
        "holderIdentitiesAcrossRuns": 6
      },
      "caregiver/healer": {
        "runs": 4,
        "holderDays": 172,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/demagogue": {
        "runs": 5,
        "holderDays": 97,
        "holderIdentitiesAcrossRuns": 5
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 50,
        "holderIdentitiesAcrossRuns": 3
      }
    },
    "gods": {
      "living_garden": {
        "runs": 11,
        "holderDays": 366,
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
    "hunter/beastmaster": 1,
    "forager/feaster": 3,
    "hunter/stalker": 4,
    "caregiver/healer": 1,
    "forager/gardener": 1,
    "explorer/cartographer": 1
  },
  "npcClasses": {
    "hunter/stalker": 6,
    "forager/feaster": 10,
    "forager/gardener": 6,
    "caregiver/healer": 4,
    "socialite/demagogue": 5,
    "socialite/showrunner": 3
  },
  "playerGods": {
    "shepherd_of_the_dead": 1,
    "living_garden": 1
  },
  "npcGods": {
    "living_garden": 11
  },
  "winningEndings": {
    "beloved/none/none/light": 2,
    "witness/hunter/beastmaster/light": 1,
    "relay/none/none/light": 2,
    "feared/none/none/light": 1,
    "beloved/explorer/cartographer/light": 1,
    "witness/none/none/light": 1
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
      "sum": 17891,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 854,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 11,
      "reportedRuns": 8
    },
    "livelihoodHarvestTrips": {
      "sum": 248,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 141,
      "reportedRuns": 15
    },
    "livelihoodSales": {
      "sum": 41,
      "reportedRuns": 7
    },
    "livelihoodBuys": {
      "sum": 6,
      "reportedRuns": 6
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 188 | 188 | reached |
| _contestResolveOthers | 16/16 | 16 | 106 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 14 | 47 | 12 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 10 | 18 | 18 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 22 | 22 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 65 | 63 | reached |
| _showEnd | 16/16 | 16 | 94 | 94 | reached |
| _showVillagerEnd | 16/16 | 14 | 45 | 45 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 537 | 190 | reached |
| apClubBoon | 16/16 | 16 | 1535 | 58 | reached |
| apDeadDrop | 16/16 | 16 | 1535 | 380 | reached |
| apPersonaPackage | 16/16 | 16 | 288 | 1 | reached |
| cleanCarcass | 16/16 | 10 | 292 | 0 | reached |
| comfort | 16/16 | 6 | 27 | 11 | reached |
| corpseLootAll | 16/16 | 16 | 293 | 293 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 76 | 61 | reached |
| doAction | 16/16 | 16 | 12809 | 8722 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 87 | 87 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 9975 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 268 | 0 | reached |
| traderSell | 16/16 | 7 | 41 | 41 | reached |
| visitorBuyWare | 16/16 | 6 | 6 | 6 | reached |
| visitorWares | 16/16 | 16 | 1238 | 1238 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 2 | 2 | 0 | 0 | ready_unused |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 4 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 6 | 68 | 53 | produced |
| stone_knife | 16 | 5 | 8 | 8 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 16 | 0 |
| npc/capstone | 17 | 0 |
| npc/contest | 100 | 52 |
| npc/show | 1 | 0 |
| player/capstone | 1 | 0 |
| player/contest | 117 | 67 |
| player/corpse-person | 27 | 0 |
| player/corpse-villager | 260 | 31 |
| player/craft | 8 | 0 |
| player/fan-package | 190 | 68 |
| player/fan-vote | 56 | 0 |
| player/patron | 1 | 0 |
| player/show | 27 | 7 |
| player/trade | 6 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 199,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 15519,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 218
    },
    "gods": {
      "notResident": 43,
      "currentBearer": 45
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 8,
        "holderDays": 587,
        "holderIdentitiesAcrossRuns": 11
      },
      "hunter/stalker": {
        "runs": 6,
        "holderDays": 176,
        "holderIdentitiesAcrossRuns": 6
      },
      "forager/feaster": {
        "runs": 11,
        "holderDays": 606,
        "holderIdentitiesAcrossRuns": 11
      },
      "socialite/showrunner": {
        "runs": 6,
        "holderDays": 208,
        "holderIdentitiesAcrossRuns": 11
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 101,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 35,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 14,
        "holderDays": 532,
        "holderIdentitiesAcrossRuns": 17
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "socialite/showrunner": 4,
    "explorer/cartographer": 1,
    "hunter/stalker": 3,
    "forager/gardener": 1,
    "socialite/demagogue": 1,
    "forager/feaster": 1
  },
  "npcClasses": {
    "forager/gardener": 8,
    "hunter/stalker": 6,
    "forager/feaster": 11,
    "socialite/showrunner": 6,
    "caregiver/healer": 2,
    "socialite/demagogue": 2
  },
  "playerGods": {
    "voice_of_the_relay": 4,
    "living_garden": 1
  },
  "npcGods": {
    "living_garden": 14
  },
  "winningEndings": {
    "feared/socialite/showrunner/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "feared/none/none/light": 2,
    "feared/hunter/stalker/light": 2,
    "feared/forager/gardener/light": 1,
    "witness/hunter/stalker/light": 1,
    "beloved/none/none/light": 2,
    "feared/socialite/demagogue/light": 1,
    "assimilated/none/none/light": 1
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
      "sum": 20472,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 872,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 11,
      "reportedRuns": 8
    },
    "livelihoodPatients": {
      "sum": 783,
      "reportedRuns": 16
    },
    "livelihoodComforts": {
      "sum": 145,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 167,
      "reportedRuns": 16
    },
    "livelihoodTreatments": {
      "sum": 73,
      "reportedRuns": 11
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 242 | 242 | reached |
| _contestResolveOthers | 16/16 | 16 | 137 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 71 | 21 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 28 | 28 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 26 | 26 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 75 | 73 | reached |
| _showEnd | 16/16 | 16 | 107 | 107 | reached |
| _showVillagerEnd | 16/16 | 15 | 45 | 45 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 677 | 232 | reached |
| apClubBoon | 16/16 | 16 | 1819 | 73 | reached |
| apDeadDrop | 16/16 | 16 | 1819 | 455 | reached |
| apPersonaPackage | 16/16 | 16 | 344 | 12 | reached |
| cleanCarcass | 16/16 | 12 | 367 | 0 | reached |
| comfort | 16/16 | 16 | 173 | 153 | reached |
| corpseLootAll | 16/16 | 16 | 203 | 203 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 105 | 92 | reached |
| doAction | 16/16 | 16 | 13998 | 10206 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 53 | 53 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 12240 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 282 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 3 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 4 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 7 | 97 | 84 | produced |
| stone_knife | 16 | 2 | 8 | 8 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 30 | 1 |
| npc/capstone | 13 | 1 |
| npc/contest | 129 | 70 |
| npc/show | 1 | 0 |
| player/capstone | 3 | 0 |
| player/contest | 158 | 90 |
| player/corpse-monster | 4 | 0 |
| player/corpse-person | 29 | 2 |
| player/corpse-villager | 344 | 51 |
| player/craft | 8 | 0 |
| player/fan-package | 232 | 109 |
| player/fan-vote | 73 | 0 |
| player/patron | 9 | 0 |
| player/show | 27 | 10 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 202,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 17712,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 233
    },
    "gods": {
      "currentBearer": 167,
      "notResident": 118
    }
  },
  "holderDays": {
    "classes": {
      "forager/feaster": {
        "runs": 7,
        "holderDays": 555,
        "holderIdentitiesAcrossRuns": 10
      },
      "socialite/showrunner": {
        "runs": 10,
        "holderDays": 409,
        "holderIdentitiesAcrossRuns": 13
      },
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 354,
        "holderIdentitiesAcrossRuns": 6
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 49,
        "holderIdentitiesAcrossRuns": 1
      },
      "forager/gardener": {
        "runs": 7,
        "holderDays": 510,
        "holderIdentitiesAcrossRuns": 8
      },
      "caregiver/healer": {
        "runs": 3,
        "holderDays": 121,
        "holderIdentitiesAcrossRuns": 3
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 45,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 10,
        "holderDays": 489,
        "holderIdentitiesAcrossRuns": 12
      },
      "apex_predator": {
        "runs": 1,
        "holderDays": 3,
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
    "socialite/showrunner": 3,
    "hunter/stalker": 5,
    "socialite/demagogue": 1,
    "forager/gardener": 3,
    "explorer/cartographer": 1,
    "forager/feaster": 2,
    "survivalist/furnace": 1,
    "drifter/trickster": 3,
    "caregiver/healer": 1
  },
  "npcClasses": {
    "forager/feaster": 7,
    "socialite/showrunner": 10,
    "hunter/stalker": 5,
    "hunter/beastmaster": 1,
    "forager/gardener": 7,
    "caregiver/healer": 3,
    "socialite/demagogue": 2
  },
  "playerGods": {
    "living_garden": 3,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 10,
    "apex_predator": 1
  },
  "winningEndings": {
    "beloved/none/none/light": 1,
    "feared/hunter/stalker/light": 1,
    "beloved/hunter/stalker/light": 1,
    "beloved/explorer/cartographer/light": 1,
    "feared/none/none/light": 2,
    "beloved/caregiver/healer/light": 1
  }
}
```
