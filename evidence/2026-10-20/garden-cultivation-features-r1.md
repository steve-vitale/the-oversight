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
      "sum": 15017,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 804,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 3,
      "reportedRuns": 3
    }
  }
}
```

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 151 | 151 | reached |
| _contestResolveOthers | 16/16 | 16 | 100 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 42 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 9 | 15 | 15 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 11 | 23 | 23 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 46 | 41 | reached |
| _showEnd | 16/16 | 16 | 87 | 87 | reached |
| _showVillagerEnd | 16/16 | 11 | 18 | 18 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 453 | 147 | reached |
| apClubBoon | 16/16 | 16 | 1210 | 26 | reached |
| apDeadDrop | 16/16 | 16 | 1210 | 304 | reached |
| apPersonaPackage | 16/16 | 16 | 237 | 17 | reached |
| cleanCarcass | 16/16 | 12 | 142 | 0 | reached |
| comfort | 16/16 | 6 | 14 | 3 | reached |
| corpseLootAll | 16/16 | 16 | 351 | 351 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 54 | 43 | reached |
| doAction | 16/16 | 16 | 9962 | 7275 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 13 | 39 | 39 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 7766 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 480 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 1 | 0 | 0 | ready_unused |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 6 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 8 | 6 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 7 | 0 | 0 | ready_unused |
| sling | 6 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 7 | 48 | 38 | produced |
| stone_knife | 16 | 2 | 6 | 5 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 79 | 0 |
| npc/capstone | 7 | 0 |
| npc/contest | 73 | 40 |
| player/capstone | 2 | 0 |
| player/combat | 1 | 1 |
| player/contest | 101 | 53 |
| player/corpse-monster | 9 | 0 |
| player/corpse-person | 39 | 3 |
| player/corpse-villager | 433 | 51 |
| player/craft | 5 | 0 |
| player/fan-package | 147 | 48 |
| player/fan-vote | 26 | 0 |
| player/patron | 7 | 0 |
| player/show | 16 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 222,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 12281,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 58
    },
    "gods": {
      "notResident": 23,
      "currentBearer": 33
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 6,
        "holderDays": 180,
        "holderIdentitiesAcrossRuns": 9
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 62,
        "holderIdentitiesAcrossRuns": 2
      },
      "hunter/stalker": {
        "runs": 6,
        "holderDays": 281,
        "holderIdentitiesAcrossRuns": 7
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 74,
        "holderIdentitiesAcrossRuns": 5
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 310,
        "holderIdentitiesAcrossRuns": 7
      },
      "caregiver/healer": {
        "runs": 3,
        "holderDays": 61,
        "holderIdentitiesAcrossRuns": 3
      }
    },
    "gods": {
      "living_garden": {
        "runs": 7,
        "holderDays": 72,
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
    "caregiver/healer": 1,
    "hunter/stalker": 6,
    "socialite/demagogue": 3,
    "socialite/showrunner": 6,
    "forager/gardener": 3,
    "explorer/cartographer": 1
  },
  "npcClasses": {
    "forager/gardener": 6,
    "socialite/demagogue": 2,
    "hunter/stalker": 6,
    "socialite/showrunner": 4,
    "forager/feaster": 7,
    "caregiver/healer": 3
  },
  "playerGods": {
    "voice_of_the_relay": 2,
    "living_garden": 2
  },
  "npcGods": {
    "living_garden": 7
  },
  "winningEndings": {
    "beloved/caregiver/healer/light": 1,
    "beloved/none/none/light": 5,
    "feared/socialite/showrunner/light": 1,
    "beloved/socialite/demagogue/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "feared/hunter/stalker/light": 2,
    "feared/forager/gardener/light": 1,
    "feared/none/none/light": 2,
    "beloved/forager/gardener/light": 1
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
      "sum": 19899,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 704,
      "reportedRuns": 16
    },
    "livelihoodKnowledgeTrips": {
      "sum": 165,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 249,
      "reportedRuns": 16
    },
    "livelihoodSales": {
      "sum": 75,
      "reportedRuns": 7
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 149,
      "reportedRuns": 14
    },
    "livelihoodBuys": {
      "sum": 8,
      "reportedRuns": 6
    },
    "livelihoodRuinSearches": {
      "sum": 11,
      "reportedRuns": 11
    },
    "livelihoodBooksRead": {
      "sum": 4,
      "reportedRuns": 4
    },
    "livelihoodCrafts": {
      "sum": 5,
      "reportedRuns": 5
    },
    "livelihoodHideHandledUnits": {
      "sum": 28,
      "reportedRuns": 8
    },
    "livelihoodHideTrials": {
      "sum": 8,
      "reportedRuns": 3
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 2,
      "reportedRuns": 2
    },
    "convoPageHiddenSelections": {
      "sum": 5,
      "reportedRuns": 4
    }
  }
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 211 | 211 | reached |
| _contestResolveOthers | 16/16 | 16 | 122 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 55 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 17 | 17 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 22 | 22 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 61 | 56 | reached |
| _showEnd | 16/16 | 16 | 111 | 111 | reached |
| _showVillagerEnd | 16/16 | 16 | 46 | 46 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 598 | 213 | reached |
| apClubBoon | 16/16 | 16 | 1659 | 61 | reached |
| apDeadDrop | 16/16 | 16 | 1659 | 430 | reached |
| apPersonaPackage | 16/16 | 16 | 338 | 26 | reached |
| cleanCarcass | 16/16 | 13 | 245 | 0 | reached |
| comfort | 16/16 | 4 | 17 | 2 | reached |
| corpseLootAll | 16/16 | 16 | 316 | 316 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 12 | 83 | 68 | reached |
| doAction | 16/16 | 16 | 14269 | 9813 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 13 | 101 | 101 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11999 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 4 | 4 | 4 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 8 | 29 | 29 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 291 | 0 | reached |
| traderSell | 16/16 | 7 | 75 | 75 | reached |
| visitorBuyWare | 16/16 | 6 | 8 | 8 | reached |
| visitorWares | 16/16 | 16 | 1353 | 1353 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 1 | 0 | 0 | ready_unused |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 9 | 2 | 8 | 2 | produced |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 9 | 6 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 5 | 0 | 0 | ready_unused |
| sling | 5 | 1 | 0 | 0 | ready_unused |
| snare | 13 | 9 | 58 | 53 | produced |
| spring_snare | 3 | 0 | 0 | 0 | known_no_material_sample |
| stone_knife | 16 | 8 | 17 | 13 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 88 | 1 |
| npc/capstone | 25 | 2 |
| npc/contest | 103 | 48 |
| player/capstone | 3 | 1 |
| player/contest | 118 | 50 |
| player/corpse-monster | 5 | 1 |
| player/corpse-person | 37 | 2 |
| player/corpse-villager | 318 | 34 |
| player/craft | 15 | 0 |
| player/fan-package | 213 | 70 |
| player/fan-vote | 61 | 0 |
| player/patron | 12 | 0 |
| player/show | 24 | 6 |
| player/trade | 8 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 215,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16849,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 323
    },
    "gods": {
      "notResident": 156,
      "currentBearer": 82
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 14,
        "holderDays": 1275,
        "holderIdentitiesAcrossRuns": 21
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 456,
        "holderIdentitiesAcrossRuns": 9
      },
      "hunter/stalker": {
        "runs": 8,
        "holderDays": 366,
        "holderIdentitiesAcrossRuns": 10
      },
      "socialite/showrunner": {
        "runs": 6,
        "holderDays": 142,
        "holderIdentitiesAcrossRuns": 6
      },
      "caregiver/healer": {
        "runs": 3,
        "holderDays": 192,
        "holderIdentitiesAcrossRuns": 3
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 19,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 14,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 21,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 14,
        "holderDays": 958,
        "holderIdentitiesAcrossRuns": 23
      },
      "shepherd_of_the_dead": {
        "runs": 2,
        "holderDays": 46,
        "holderIdentitiesAcrossRuns": 2
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "brawler/juggernaut": 1,
    "hunter/stalker": 7,
    "forager/gardener": 4,
    "socialite/showrunner": 2,
    "caregiver/healer": 1,
    "forager/feaster": 1,
    "survivalist/furnace": 1,
    "explorer/cartographer": 1
  },
  "npcClasses": {
    "forager/feaster": 7,
    "forager/gardener": 14,
    "hunter/stalker": 8,
    "socialite/showrunner": 6,
    "caregiver/healer": 3,
    "hunter/beastmaster": 1,
    "socialite/demagogue": 1,
    "survivalist/furnace": 1
  },
  "playerGods": {
    "living_garden": 2,
    "shepherd_of_the_dead": 1,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 14,
    "shepherd_of_the_dead": 2
  },
  "winningEndings": {
    "feared/hunter/stalker/light": 2,
    "feared/forager/gardener/light": 1,
    "beloved/hunter/stalker/light": 1,
    "feared/socialite/showrunner/light": 1,
    "relay/socialite/showrunner/light": 1,
    "feared/none/none/light": 1
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
      "sum": 20294,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 817,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 11,
      "reportedRuns": 5
    },
    "livelihoodHarvestTrips": {
      "sum": 229,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 171,
      "reportedRuns": 15
    },
    "livelihoodSales": {
      "sum": 34,
      "reportedRuns": 8
    },
    "livelihoodBuys": {
      "sum": 7,
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
| _contestEnd | 16/16 | 16 | 229 | 229 | reached |
| _contestResolveOthers | 16/16 | 16 | 137 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 70 | 18 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 24 | 24 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 85 | 81 | reached |
| _showEnd | 16/16 | 16 | 105 | 105 | reached |
| _showVillagerEnd | 16/16 | 16 | 43 | 43 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 642 | 202 | reached |
| apClubBoon | 16/16 | 16 | 1786 | 63 | reached |
| apDeadDrop | 16/16 | 16 | 1786 | 443 | reached |
| apPersonaPackage | 16/16 | 16 | 318 | 0 | reached |
| cleanCarcass | 16/16 | 11 | 379 | 0 | reached |
| comfort | 16/16 | 7 | 18 | 3 | reached |
| corpseLootAll | 16/16 | 16 | 659 | 659 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 101 | 94 | reached |
| doAction | 16/16 | 16 | 14520 | 9991 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 101 | 101 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 13165 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 219 | 0 | reached |
| traderSell | 16/16 | 8 | 34 | 34 | reached |
| visitorBuyWare | 16/16 | 6 | 7 | 7 | reached |
| visitorWares | 16/16 | 16 | 1363 | 1363 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 3 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 7 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 8 | 6 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 7 | 0 | 0 | ready_unused |
| sling | 4 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 7 | 92 | 85 | produced |
| stone_knife | 16 | 4 | 9 | 9 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 101 | 4 |
| npc/capstone | 17 | 0 |
| npc/contest | 114 | 71 |
| npc/show | 1 | 0 |
| player/capstone | 1 | 0 |
| player/contest | 146 | 94 |
| player/corpse-monster | 2 | 1 |
| player/corpse-person | 30 | 2 |
| player/corpse-villager | 167 | 5 |
| player/craft | 9 | 0 |
| player/fan-package | 202 | 86 |
| player/fan-vote | 63 | 0 |
| player/show | 24 | 4 |
| player/trade | 7 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 208,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 17906,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 533
    },
    "gods": {
      "notResident": 20,
      "currentBearer": 13
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 10,
        "holderDays": 691,
        "holderIdentitiesAcrossRuns": 13
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 481,
        "holderIdentitiesAcrossRuns": 9
      },
      "forager/gardener": {
        "runs": 12,
        "holderDays": 1095,
        "holderIdentitiesAcrossRuns": 16
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 7,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 6,
        "holderDays": 284,
        "holderIdentitiesAcrossRuns": 8
      },
      "socialite/demagogue": {
        "runs": 3,
        "holderDays": 119,
        "holderIdentitiesAcrossRuns": 4
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 64,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 2,
        "holderDays": 71,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 13,
        "holderDays": 835,
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
    "forager/gardener": 3,
    "explorer/cartographer": 2,
    "drifter/trickster": 2,
    "forager/feaster": 1,
    "survivalist/furnace": 1,
    "hunter/stalker": 1
  },
  "npcClasses": {
    "hunter/stalker": 10,
    "forager/feaster": 7,
    "forager/gardener": 12,
    "hunter/beastmaster": 1,
    "socialite/showrunner": 6,
    "caregiver/healer": 1,
    "socialite/demagogue": 3,
    "survivalist/furnace": 2
  },
  "playerGods": {
    "voice_of_the_relay": 4,
    "living_garden": 1
  },
  "npcGods": {
    "living_garden": 13
  },
  "winningEndings": {
    "feared/socialite/showrunner/light": 2,
    "beloved/none/none/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "feared/forager/gardener/light": 1,
    "witness/hunter/stalker/light": 1
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
      "sum": 18002,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 623,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 4,
      "reportedRuns": 3
    },
    "livelihoodPatients": {
      "sum": 752,
      "reportedRuns": 16
    },
    "livelihoodComforts": {
      "sum": 126,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 177,
      "reportedRuns": 16
    },
    "livelihoodTreatments": {
      "sum": 54,
      "reportedRuns": 12
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 197 | 197 | reached |
| _contestResolveOthers | 16/16 | 16 | 127 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 49 | 18 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 9 | 15 | 15 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 27 | 27 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 57 | 54 | reached |
| _showEnd | 16/16 | 16 | 110 | 110 | reached |
| _showVillagerEnd | 16/16 | 15 | 35 | 35 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 544 | 188 | reached |
| apClubBoon | 16/16 | 16 | 1504 | 49 | reached |
| apDeadDrop | 16/16 | 16 | 1504 | 380 | reached |
| apPersonaPackage | 16/16 | 16 | 273 | 6 | reached |
| cleanCarcass | 16/16 | 10 | 175 | 0 | reached |
| comfort | 16/16 | 16 | 138 | 128 | reached |
| corpseLootAll | 16/16 | 16 | 147 | 147 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 78 | 69 | reached |
| doAction | 16/16 | 16 | 12355 | 9109 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 33 | 33 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11435 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 221 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 1 | 0 | 0 | ready_unused |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 2 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 1 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 8 | 6 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 5 | 0 | 0 | ready_unused |
| sling | 5 | 0 | 0 | 0 | known_no_material_sample |
| snare | 13 | 7 | 70 | 61 | produced |
| stone_knife | 16 | 5 | 8 | 8 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 43 | 1 |
| npc/capstone | 7 | 1 |
| npc/contest | 117 | 50 |
| player/capstone | 2 | 0 |
| player/contest | 120 | 69 |
| player/corpse-monster | 2 | 0 |
| player/corpse-person | 9 | 0 |
| player/corpse-villager | 310 | 46 |
| player/craft | 8 | 0 |
| player/fan-package | 188 | 67 |
| player/fan-vote | 48 | 0 |
| player/patron | 1 | 0 |
| player/show | 23 | 4 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 195,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16306,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 204
    },
    "gods": {
      "currentBearer": 129,
      "notResident": 7
    }
  },
  "holderDays": {
    "classes": {
      "survivalist/furnace": {
        "runs": 2,
        "holderDays": 55,
        "holderIdentitiesAcrossRuns": 2
      },
      "hunter/stalker": {
        "runs": 8,
        "holderDays": 544,
        "holderIdentitiesAcrossRuns": 10
      },
      "forager/gardener": {
        "runs": 9,
        "holderDays": 376,
        "holderIdentitiesAcrossRuns": 12
      },
      "socialite/showrunner": {
        "runs": 6,
        "holderDays": 263,
        "holderIdentitiesAcrossRuns": 9
      },
      "forager/feaster": {
        "runs": 5,
        "holderDays": 136,
        "holderIdentitiesAcrossRuns": 5
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 112,
        "holderIdentitiesAcrossRuns": 2
      },
      "caregiver/healer": {
        "runs": 4,
        "holderDays": 244,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 8,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 5,
        "holderDays": 114,
        "holderIdentitiesAcrossRuns": 6
      },
      "shepherd_of_the_dead": {
        "runs": 1,
        "holderDays": 39,
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
    "survivalist/furnace": 1,
    "forager/gardener": 4,
    "socialite/showrunner": 5,
    "hunter/stalker": 2,
    "caregiver/healer": 1,
    "forager/feaster": 3,
    "hunter/beastmaster": 1,
    "explorer/cartographer": 1,
    "socialite/demagogue": 1
  },
  "npcClasses": {
    "forager/gardener": 9,
    "hunter/stalker": 8,
    "socialite/showrunner": 6,
    "survivalist/furnace": 2,
    "forager/feaster": 5,
    "hunter/beastmaster": 2,
    "caregiver/healer": 4,
    "socialite/demagogue": 1
  },
  "playerGods": {
    "voice_of_the_relay": 4,
    "living_garden": 2
  },
  "npcGods": {
    "living_garden": 5,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "feared/none/none/light": 2,
    "beloved/none/none/light": 1,
    "beloved/hunter/stalker/light": 1,
    "feared/socialite/showrunner/light": 2,
    "beloved/forager/gardener/light": 1,
    "feared/forager/feaster/light": 1,
    "witness/socialite/showrunner/light": 1,
    "relay/none/none/light": 1,
    "beloved/forager/feaster/light": 1
  }
}
```
