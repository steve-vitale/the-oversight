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
      "sum": 14709,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 986,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 16,
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
| _contestEnd | 16/16 | 16 | 171 | 171 | reached |
| _contestResolveOthers | 16/16 | 16 | 99 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 48 | 26 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 16 | 16 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 11 | 17 | 17 | reached |
| _cxPrizeSynergyHint | 16/16 | 14 | 49 | 46 | reached |
| _showEnd | 16/16 | 16 | 68 | 68 | reached |
| _showVillagerEnd | 16/16 | 11 | 18 | 18 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 408 | 136 | reached |
| apClubBoon | 16/16 | 16 | 1126 | 30 | reached |
| apDeadDrop | 16/16 | 16 | 1126 | 294 | reached |
| apPersonaPackage | 16/16 | 16 | 236 | 29 | reached |
| cleanCarcass | 16/16 | 12 | 366 | 0 | reached |
| comfort | 16/16 | 2 | 3 | 2 | reached |
| corpseLootAll | 16/16 | 16 | 268 | 268 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 84 | 75 | reached |
| doAction | 16/16 | 16 | 9780 | 7176 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 5 | 5 | 5 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 6831 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 548 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 6 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 8 | 3 | 0 | 0 | ready_unused |
| hunting_spear | 5 | 1 | 0 | 0 | ready_unused |
| pit_trap | 5 | 4 | 0 | 0 | ready_unused |
| sharpened_stick | 10 | 7 | 0 | 0 | ready_unused |
| sling | 4 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 9 | 75 | 66 | produced |
| stone_knife | 16 | 3 | 9 | 9 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 34 | 0 |
| npc/capstone | 6 | 0 |
| npc/contest | 78 | 50 |
| player/capstone | 3 | 0 |
| player/combat | 1 | 1 |
| player/contest | 103 | 66 |
| player/corpse-monster | 9 | 4 |
| player/corpse-person | 34 | 2 |
| player/corpse-villager | 624 | 57 |
| player/craft | 9 | 0 |
| player/fan-package | 136 | 42 |
| player/fan-vote | 30 | 0 |
| player/patron | 16 | 0 |
| player/show | 25 | 4 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 236,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 12189,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 14
    },
    "gods": {
      "currentBearer": 33,
      "notResident": 29
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 5,
        "holderDays": 159,
        "holderIdentitiesAcrossRuns": 5
      },
      "forager/feaster": {
        "runs": 8,
        "holderDays": 398,
        "holderIdentitiesAcrossRuns": 9
      },
      "hunter/stalker": {
        "runs": 4,
        "holderDays": 72,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 26,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 1,
        "holderDays": 9,
        "holderIdentitiesAcrossRuns": 1
      },
      "drifter/trickster": {
        "runs": 1,
        "holderDays": 21,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 6,
        "holderDays": 90,
        "holderIdentitiesAcrossRuns": 6
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "forager/gardener": 5,
    "socialite/showrunner": 5,
    "explorer/cartographer": 1,
    "hunter/stalker": 2,
    "socialite/demagogue": 3,
    "forager/feaster": 2,
    "survivalist/furnace": 1
  },
  "npcClasses": {
    "forager/gardener": 5,
    "forager/feaster": 8,
    "hunter/stalker": 4,
    "socialite/demagogue": 1,
    "socialite/showrunner": 1,
    "drifter/trickster": 1
  },
  "playerGods": {
    "living_garden": 4,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 6
  },
  "winningEndings": {
    "relay/forager/gardener/grey": 1,
    "beloved/none/none/light": 4,
    "feared/none/none/light": 3,
    "feared/socialite/showrunner/light": 1,
    "beloved/forager/gardener/light": 1,
    "witness/none/none/light": 2,
    "beloved/forager/feaster/light": 1,
    "relay/survivalist/furnace/light": 1,
    "relay/none/none/light": 1
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
      "sum": 17835,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 709,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 5,
      "reportedRuns": 2
    },
    "livelihoodKnowledgeTrips": {
      "sum": 232,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 173,
      "reportedRuns": 16
    },
    "livelihoodHideHandledUnits": {
      "sum": 31,
      "reportedRuns": 10
    },
    "livelihoodHideTrials": {
      "sum": 13,
      "reportedRuns": 9
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 6,
      "reportedRuns": 6
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 123,
      "reportedRuns": 12
    },
    "livelihoodBuys": {
      "sum": 9,
      "reportedRuns": 6
    },
    "livelihoodRuinSearches": {
      "sum": 12,
      "reportedRuns": 12
    },
    "livelihoodSales": {
      "sum": 38,
      "reportedRuns": 7
    },
    "livelihoodBooksRead": {
      "sum": 5,
      "reportedRuns": 5
    },
    "livelihoodCounterCooks": {
      "sum": 2,
      "reportedRuns": 2
    },
    "livelihoodCounterPreserves": {
      "sum": 1,
      "reportedRuns": 1
    },
    "livelihoodCounterStored": {
      "sum": 1,
      "reportedRuns": 1
    },
    "livelihoodCrafts": {
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
| _contestEnd | 16/16 | 16 | 215 | 215 | reached |
| _contestResolveOthers | 16/16 | 16 | 125 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 62 | 24 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 26 | 26 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 23 | 23 | reached |
| _cxPrizeSynergyHint | 16/16 | 14 | 61 | 58 | reached |
| _showEnd | 16/16 | 16 | 96 | 96 | reached |
| _showVillagerEnd | 16/16 | 13 | 44 | 44 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 584 | 196 | reached |
| apClubBoon | 16/16 | 16 | 1630 | 75 | reached |
| apDeadDrop | 16/16 | 16 | 1630 | 402 | reached |
| apPersonaPackage | 16/16 | 16 | 339 | 33 | reached |
| cleanCarcass | 16/16 | 12 | 348 | 0 | reached |
| comfort | 16/16 | 5 | 11 | 1 | reached |
| corpseLootAll | 16/16 | 16 | 240 | 240 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 14 | 114 | 76 | reached |
| doAction | 16/16 | 16 | 13398 | 9424 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 37 | 37 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 10674 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 1 | 1 | 0 | reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 5 | 5 | 5 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 11 | 56 | 56 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 337 | 0 | reached |
| traderSell | 16/16 | 7 | 38 | 38 | reached |
| visitorBuyWare | 16/16 | 6 | 9 | 9 | reached |
| visitorWares | 16/16 | 16 | 1121 | 1121 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 11 | 1 | 13 | 6 | produced |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 4 | 0 | 0 | ready_unused |
| sharpened_stick | 7 | 7 | 0 | 0 | ready_unused |
| sling | 4 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 9 | 91 | 63 | produced |
| spring_snare | 2 | 0 | 0 | 0 | known_no_material_sample |
| stone_knife | 16 | 2 | 10 | 7 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 41 | 0 |
| npc/capstone | 13 | 0 |
| npc/contest | 106 | 62 |
| player/capstone | 5 | 1 |
| player/contest | 137 | 68 |
| player/corpse-monster | 4 | 0 |
| player/corpse-person | 18 | 0 |
| player/corpse-villager | 258 | 12 |
| player/craft | 13 | 0 |
| player/fan-package | 196 | 77 |
| player/fan-vote | 71 | 0 |
| player/patron | 21 | 0 |
| player/show | 17 | 3 |
| player/trade | 9 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 201,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16036,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 168
    },
    "gods": {
      "notResident": 73,
      "currentBearer": 93
    }
  },
  "holderDays": {
    "classes": {
      "forager/feaster": {
        "runs": 9,
        "holderDays": 502,
        "holderIdentitiesAcrossRuns": 9
      },
      "forager/gardener": {
        "runs": 9,
        "holderDays": 576,
        "holderIdentitiesAcrossRuns": 10
      },
      "hunter/stalker": {
        "runs": 2,
        "holderDays": 197,
        "holderIdentitiesAcrossRuns": 4
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 81,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/demagogue": {
        "runs": 4,
        "holderDays": 92,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 191,
        "holderIdentitiesAcrossRuns": 7
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 138,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 11,
        "holderDays": 568,
        "holderIdentitiesAcrossRuns": 13
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
    "hunter/stalker": 2,
    "shieldbearer/bulwark": 1,
    "forager/gardener": 2,
    "caregiver/healer": 1,
    "hunter/beastmaster": 1,
    "drifter/trickster": 5,
    "survivalist/furnace": 1,
    "forager/feaster": 1
  },
  "npcClasses": {
    "forager/feaster": 9,
    "forager/gardener": 9,
    "hunter/stalker": 2,
    "hunter/beastmaster": 2,
    "socialite/demagogue": 4,
    "socialite/showrunner": 4,
    "caregiver/healer": 2
  },
  "playerGods": {
    "living_garden": 3,
    "shepherd_of_the_dead": 1,
    "voice_of_the_relay": 1,
    "the_between": 1
  },
  "npcGods": {
    "living_garden": 11
  },
  "winningEndings": {
    "beloved/hunter/stalker/light": 1,
    "beloved/none/none/light": 2,
    "beloved/socialite/showrunner/light": 1,
    "beloved/forager/feaster/light": 1,
    "relay/drifter/trickster/light": 1,
    "beloved/drifter/trickster/light": 1
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
      "sum": 17267,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 710,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 192,
      "reportedRuns": 16
    },
    "livelihoodSales": {
      "sum": 24,
      "reportedRuns": 6
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 151,
      "reportedRuns": 15
    },
    "livelihoodBuys": {
      "sum": 9,
      "reportedRuns": 6
    },
    "convoPageHiddenSelections": {
      "sum": 2,
      "reportedRuns": 2
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 213 | 213 | reached |
| _contestResolveOthers | 16/16 | 16 | 132 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 61 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 24 | 24 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 68 | 65 | reached |
| _showEnd | 16/16 | 16 | 90 | 90 | reached |
| _showVillagerEnd | 16/16 | 14 | 42 | 42 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 548 | 198 | reached |
| apClubBoon | 16/16 | 15 | 1466 | 42 | reached |
| apDeadDrop | 16/16 | 15 | 1466 | 373 | reached |
| apPersonaPackage | 16/16 | 15 | 279 | 8 | reached |
| cleanCarcass | 16/16 | 12 | 289 | 0 | reached |
| comfort | 16/16 | 2 | 4 | 2 | reached |
| corpseLootAll | 16/16 | 16 | 585 | 585 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 80 | 72 | reached |
| doAction | 16/16 | 16 | 12452 | 8586 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 8 | 19 | 19 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 8889 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 240 | 0 | reached |
| traderSell | 16/16 | 6 | 24 | 24 | reached |
| visitorBuyWare | 16/16 | 6 | 9 | 9 | reached |
| visitorWares | 16/16 | 16 | 1162 | 1162 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 3 | 2 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 4 | 0 | 0 | ready_unused |
| sling | 2 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 7 | 73 | 65 | produced |
| stone_knife | 16 | 3 | 7 | 7 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 42 | 3 |
| npc/capstone | 12 | 0 |
| npc/contest | 105 | 56 |
| npc/show | 1 | 0 |
| player/capstone | 5 | 0 |
| player/contest | 131 | 72 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 11 | 0 |
| player/corpse-villager | 310 | 38 |
| player/craft | 7 | 0 |
| player/fan-package | 198 | 101 |
| player/fan-vote | 42 | 0 |
| player/patron | 4 | 0 |
| player/show | 21 | 10 |
| player/trade | 9 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 209,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 15247,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 420
    },
    "gods": {
      "currentBearer": 144,
      "notResident": 58
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 8,
        "holderDays": 267,
        "holderIdentitiesAcrossRuns": 10
      },
      "forager/feaster": {
        "runs": 9,
        "holderDays": 646,
        "holderIdentitiesAcrossRuns": 14
      },
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 140,
        "holderIdentitiesAcrossRuns": 5
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 37,
        "holderIdentitiesAcrossRuns": 3
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 36,
        "holderIdentitiesAcrossRuns": 2
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 4,
        "holderIdentitiesAcrossRuns": 1
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 53,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 9,
        "holderDays": 354,
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
    "forager/gardener": 7,
    "socialite/showrunner": 2,
    "hunter/beastmaster": 1,
    "hunter/stalker": 3,
    "socialite/demagogue": 1,
    "drifter/trickster": 1,
    "forager/feaster": 1
  },
  "npcClasses": {
    "forager/feaster": 9,
    "forager/gardener": 8,
    "hunter/stalker": 5,
    "socialite/showrunner": 3,
    "socialite/demagogue": 2,
    "survivalist/furnace": 1,
    "caregiver/healer": 2
  },
  "playerGods": {
    "living_garden": 6,
    "voice_of_the_relay": 2
  },
  "npcGods": {
    "living_garden": 9
  },
  "winningEndings": {
    "feared/hunter/stalker/light": 1,
    "beloved/none/none/light": 2,
    "feared/socialite/demagogue/light": 1,
    "feared/none/none/light": 1,
    "beloved/forager/feaster/light": 1,
    "beloved/forager/gardener/light": 2,
    "beloved/hunter/stalker/light": 1,
    "assimilated/forager/gardener/light": 1
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
      "sum": 19694,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 683,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 8,
      "reportedRuns": 5
    },
    "livelihoodPatients": {
      "sum": 873,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 163,
      "reportedRuns": 15
    },
    "livelihoodComforts": {
      "sum": 134,
      "reportedRuns": 15
    },
    "livelihoodTreatments": {
      "sum": 53,
      "reportedRuns": 9
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 239 | 239 | reached |
| _contestResolveOthers | 16/16 | 16 | 138 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 54 | 15 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 13 | 21 | 21 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 34 | 34 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 70 | 66 | reached |
| _showEnd | 16/16 | 16 | 118 | 118 | reached |
| _showVillagerEnd | 16/16 | 15 | 35 | 35 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 638 | 234 | reached |
| apClubBoon | 16/16 | 16 | 1734 | 78 | reached |
| apDeadDrop | 16/16 | 16 | 1734 | 438 | reached |
| apPersonaPackage | 16/16 | 16 | 349 | 5 | reached |
| cleanCarcass | 16/16 | 13 | 298 | 0 | reached |
| comfort | 16/16 | 15 | 145 | 136 | reached |
| corpseLootAll | 16/16 | 14 | 211 | 211 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 121 | 109 | reached |
| doAction | 16/16 | 16 | 13824 | 10126 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 6 | 12 | 12 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 12090 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 246 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 1 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 4 | 1 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 6 | 110 | 99 | produced |
| stone_knife | 16 | 3 | 11 | 10 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 15 | 0 |
| npc/capstone | 14 | 0 |
| npc/contest | 119 | 55 |
| npc/show | 2 | 0 |
| player/capstone | 4 | 1 |
| player/contest | 139 | 78 |
| player/corpse-monster | 1 | 0 |
| player/corpse-person | 19 | 0 |
| player/corpse-villager | 298 | 38 |
| player/craft | 10 | 0 |
| player/fan-package | 234 | 100 |
| player/fan-vote | 78 | 0 |
| player/patron | 5 | 0 |
| player/show | 25 | 12 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 201,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 18775,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 205
    },
    "gods": {
      "currentBearer": 66,
      "notResident": 86
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 7,
        "holderDays": 301,
        "holderIdentitiesAcrossRuns": 7
      },
      "socialite/showrunner": {
        "runs": 7,
        "holderDays": 309,
        "holderIdentitiesAcrossRuns": 10
      },
      "forager/feaster": {
        "runs": 10,
        "holderDays": 709,
        "holderIdentitiesAcrossRuns": 13
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 85,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/demagogue": {
        "runs": 4,
        "holderDays": 193,
        "holderIdentitiesAcrossRuns": 4
      },
      "forager/gardener": {
        "runs": 9,
        "holderDays": 636,
        "holderIdentitiesAcrossRuns": 10
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 52,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 57,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 10,
        "holderDays": 629,
        "holderIdentitiesAcrossRuns": 14
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "forager/gardener": 4,
    "socialite/showrunner": 6,
    "hunter/stalker": 6,
    "hunter/beastmaster": 1
  },
  "npcClasses": {
    "hunter/stalker": 7,
    "socialite/showrunner": 7,
    "forager/feaster": 10,
    "caregiver/healer": 2,
    "socialite/demagogue": 4,
    "forager/gardener": 9,
    "survivalist/furnace": 1,
    "hunter/beastmaster": 1
  },
  "playerGods": {
    "voice_of_the_relay": 3,
    "living_garden": 3,
    "apex_predator": 1
  },
  "npcGods": {
    "living_garden": 10
  },
  "winningEndings": {
    "feared/socialite/showrunner/light": 2,
    "feared/none/none/light": 1,
    "relay/hunter/stalker/light": 1,
    "feared/hunter/stalker/light": 1,
    "assimilated/forager/gardener/light": 1
  }
}
```
