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
      "sum": 14230,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 819,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 13,
      "reportedRuns": 7
    }
  }
}
```

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 134 | 134 | reached |
| _contestResolveOthers | 16/16 | 16 | 84 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 14 | 39 | 19 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 6 | 7 | 7 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 26 | 26 | reached |
| _cxPrizeSynergyHint | 16/16 | 14 | 42 | 40 | reached |
| _showEnd | 16/16 | 16 | 72 | 72 | reached |
| _showVillagerEnd | 16/16 | 10 | 18 | 18 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 388 | 116 | reached |
| apClubBoon | 16/16 | 16 | 1123 | 15 | reached |
| apDeadDrop | 16/16 | 16 | 1123 | 284 | reached |
| apPersonaPackage | 16/16 | 16 | 211 | 19 | reached |
| cleanCarcass | 16/16 | 12 | 265 | 0 | reached |
| comfort | 16/16 | 3 | 9 | 5 | reached |
| corpseLootAll | 16/16 | 16 | 203 | 203 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 84 | 73 | reached |
| doAction | 16/16 | 16 | 9573 | 6951 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 47 | 47 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 7163 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 491 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 2 | 1 | 1 | produced |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 6 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 4 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 5 | 0 | 0 | ready_unused |
| sharpened_stick | 3 | 3 | 0 | 0 | ready_unused |
| sling | 4 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 9 | 73 | 63 | produced |
| stone_knife | 16 | 2 | 10 | 9 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 37 | 1 |
| npc/capstone | 6 | 0 |
| npc/contest | 62 | 41 |
| player/capstone | 2 | 0 |
| player/combat | 3 | 3 |
| player/contest | 93 | 57 |
| player/corpse-monster | 9 | 1 |
| player/corpse-person | 44 | 2 |
| player/corpse-villager | 374 | 28 |
| player/craft | 10 | 0 |
| player/fan-package | 116 | 29 |
| player/fan-vote | 13 | 0 |
| player/patron | 8 | 0 |
| player/show | 16 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 217,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 12059,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 24
    },
    "gods": {
      "currentBearer": 40
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 6,
        "holderDays": 201,
        "holderIdentitiesAcrossRuns": 8
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 18,
        "holderIdentitiesAcrossRuns": 3
      },
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 98,
        "holderIdentitiesAcrossRuns": 5
      },
      "forager/feaster": {
        "runs": 4,
        "holderDays": 231,
        "holderIdentitiesAcrossRuns": 6
      }
    },
    "gods": {
      "living_garden": {
        "runs": 5,
        "holderDays": 77,
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
    "socialite/showrunner": 4,
    "socialite/demagogue": 2,
    "forager/gardener": 2,
    "hunter/stalker": 3,
    "forager/feaster": 3,
    "caregiver/healer": 1,
    "explorer/cartographer": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "forager/gardener": 6,
    "socialite/showrunner": 3,
    "hunter/stalker": 5,
    "forager/feaster": 4
  },
  "playerGods": {
    "voice_of_the_relay": 2,
    "living_garden": 2
  },
  "npcGods": {
    "living_garden": 5
  },
  "winningEndings": {
    "beloved/socialite/showrunner/light": 3,
    "beloved/none/none/light": 4,
    "feared/none/none/light": 4,
    "beloved/forager/gardener/light": 1,
    "relay/hunter/stalker/light": 1,
    "relay/none/none/light": 1,
    "assimilated/forager/feaster/light": 1,
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
      "sum": 19864,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 693,
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
      "sum": 186,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 143,
      "reportedRuns": 14
    },
    "livelihoodRuinSearches": {
      "sum": 14,
      "reportedRuns": 14
    },
    "livelihoodSales": {
      "sum": 47,
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
    "livelihoodBuys": {
      "sum": 9,
      "reportedRuns": 7
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
      "sum": 4,
      "reportedRuns": 3
    },
    "livelihoodCounterCooks": {
      "sum": 5,
      "reportedRuns": 2
    },
    "livelihoodCounterPreserves": {
      "sum": 4,
      "reportedRuns": 2
    },
    "livelihoodCounterStored": {
      "sum": 4,
      "reportedRuns": 2
    },
    "livelihoodBooksRead": {
      "sum": 7,
      "reportedRuns": 6
    }
  }
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 244 | 244 | reached |
| _contestResolveOthers | 16/16 | 16 | 160 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 64 | 24 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 21 | 21 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 22 | 22 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 80 | 78 | reached |
| _showEnd | 16/16 | 16 | 110 | 110 | reached |
| _showVillagerEnd | 16/16 | 13 | 40 | 40 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 673 | 226 | reached |
| apClubBoon | 16/16 | 16 | 1748 | 61 | reached |
| apDeadDrop | 16/16 | 16 | 1748 | 439 | reached |
| apPersonaPackage | 16/16 | 16 | 335 | 26 | reached |
| cleanCarcass | 16/16 | 13 | 322 | 0 | reached |
| comfort | 16/16 | 4 | 17 | 3 | reached |
| corpseLootAll | 16/16 | 16 | 247 | 247 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 126 | 107 | reached |
| doAction | 16/16 | 16 | 14248 | 10071 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 155 | 155 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11393 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 2 | 4 | 0 | reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 6 | 7 | 7 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 11 | 77 | 77 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 294 | 0 | reached |
| traderSell | 16/16 | 10 | 47 | 47 | reached |
| visitorBuyWare | 16/16 | 7 | 9 | 9 | reached |
| visitorWares | 16/16 | 16 | 1202 | 1202 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 6 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 5 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| deadfall | 2 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 12 | 4 | 14 | 7 | produced |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 5 | 0 | 0 | ready_unused |
| sharpened_stick | 8 | 6 | 0 | 0 | ready_unused |
| sling | 6 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 9 | 102 | 91 | produced |
| spring_snare | 4 | 1 | 0 | 0 | ready_unused |
| stone_knife | 16 | 5 | 10 | 9 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 33 | 1 |
| npc/capstone | 10 | 0 |
| npc/contest | 132 | 77 |
| npc/show | 2 | 0 |
| player/contest | 149 | 87 |
| player/corpse-monster | 5 | 1 |
| player/corpse-person | 14 | 1 |
| player/corpse-villager | 568 | 59 |
| player/craft | 16 | 0 |
| player/fan-package | 226 | 92 |
| player/fan-vote | 61 | 0 |
| player/patron | 18 | 0 |
| player/show | 26 | 8 |
| player/trade | 9 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 225,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 17646,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 246
    },
    "gods": {
      "currentBearer": 52,
      "notResident": 67
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
        "holderDays": 526,
        "holderIdentitiesAcrossRuns": 9
      },
      "socialite/showrunner": {
        "runs": 6,
        "holderDays": 234,
        "holderIdentitiesAcrossRuns": 7
      },
      "caregiver/healer": {
        "runs": 4,
        "holderDays": 278,
        "holderIdentitiesAcrossRuns": 4
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
    "socialite/showrunner": 6,
    "forager/feaster": 3,
    "hunter/stalker": 8,
    "forager/gardener": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "forager/feaster": 11,
    "forager/gardener": 6,
    "hunter/stalker": 7,
    "socialite/showrunner": 6,
    "caregiver/healer": 4,
    "socialite/demagogue": 2
  },
  "playerGods": {
    "voice_of_the_relay": 2,
    "living_garden": 1
  },
  "npcGods": {
    "living_garden": 9
  },
  "winningEndings": {
    "beloved/hunter/stalker/light": 1,
    "beloved/none/none/light": 2,
    "relay/socialite/showrunner/light": 1,
    "beloved/socialite/showrunner/light": 1,
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
      "sum": 17503,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 881,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 12,
      "reportedRuns": 9
    },
    "livelihoodHarvestTrips": {
      "sum": 230,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 149,
      "reportedRuns": 16
    },
    "livelihoodBuys": {
      "sum": 11,
      "reportedRuns": 9
    },
    "livelihoodSales": {
      "sum": 38,
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
| _contestEnd | 16/16 | 16 | 175 | 175 | reached |
| _contestResolveOthers | 16/16 | 16 | 112 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 51 | 17 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 18 | 18 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 28 | 28 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 58 | 53 | reached |
| _showEnd | 16/16 | 16 | 91 | 91 | reached |
| _showVillagerEnd | 16/16 | 14 | 42 | 42 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 541 | 197 | reached |
| apClubBoon | 16/16 | 16 | 1468 | 41 | reached |
| apDeadDrop | 16/16 | 16 | 1468 | 369 | reached |
| apPersonaPackage | 16/16 | 16 | 301 | 11 | reached |
| cleanCarcass | 16/16 | 10 | 276 | 0 | reached |
| comfort | 16/16 | 5 | 21 | 6 | reached |
| corpseLootAll | 16/16 | 16 | 144 | 144 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 74 | 68 | reached |
| doAction | 16/16 | 16 | 12444 | 8603 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 68 | 68 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 9424 | 0 | reached |
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
| traderSell | 16/16 | 10 | 38 | 38 | reached |
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
| npc/contest | 94 | 44 |
| player/capstone | 2 | 0 |
| player/contest | 120 | 59 |
| player/corpse-monster | 4 | 0 |
| player/corpse-person | 32 | 2 |
| player/corpse-villager | 326 | 42 |
| player/craft | 8 | 0 |
| player/fan-package | 197 | 72 |
| player/fan-vote | 39 | 0 |
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
  "eligiblePersonDays": 15609,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 186
    },
    "gods": {
      "currentBearer": 47,
      "notResident": 94
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 11,
        "holderDays": 436,
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
    "feared/none/none/light": 3,
    "beloved/socialite/showrunner/light": 2,
    "feared/forager/gardener/light": 1,
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
      "sum": 19963,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 810,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 10,
      "reportedRuns": 7
    },
    "livelihoodPatients": {
      "sum": 725,
      "reportedRuns": 16
    },
    "livelihoodComforts": {
      "sum": 139,
      "reportedRuns": 16
    },
    "livelihoodTreatments": {
      "sum": 56,
      "reportedRuns": 13
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 138,
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
| _contestEnd | 16/16 | 16 | 228 | 228 | reached |
| _contestResolveOthers | 16/16 | 16 | 149 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 62 | 16 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 13 | 26 | 26 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 31 | 31 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 79 | 77 | reached |
| _showEnd | 16/16 | 16 | 107 | 107 | reached |
| _showVillagerEnd | 16/16 | 14 | 43 | 43 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 622 | 222 | reached |
| apClubBoon | 16/16 | 16 | 1740 | 59 | reached |
| apDeadDrop | 16/16 | 16 | 1740 | 436 | reached |
| apPersonaPackage | 16/16 | 16 | 363 | 10 | reached |
| cleanCarcass | 16/16 | 14 | 293 | 0 | reached |
| comfort | 16/16 | 16 | 163 | 145 | reached |
| corpseLootAll | 16/16 | 16 | 257 | 257 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 103 | 78 | reached |
| doAction | 16/16 | 16 | 13706 | 9978 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 36 | 36 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11781 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 264 | 0 | reached |
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
| hide_armor | 4 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 9 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 9 | 96 | 71 | produced |
| stone_knife | 16 | 4 | 7 | 7 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 36 | 0 |
| npc/capstone | 12 | 0 |
| npc/contest | 133 | 57 |
| player/capstone | 2 | 0 |
| player/combat | 1 | 1 |
| player/contest | 139 | 78 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 31 | 4 |
| player/corpse-villager | 357 | 33 |
| player/craft | 7 | 0 |
| player/fan-package | 222 | 92 |
| player/fan-vote | 59 | 0 |
| player/patron | 3 | 0 |
| player/show | 26 | 11 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 199,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 17039,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 85
    },
    "gods": {
      "currentBearer": 203,
      "notResident": 43
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
        "holderDays": 344,
        "holderIdentitiesAcrossRuns": 13
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 598,
        "holderIdentitiesAcrossRuns": 9
      },
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 347,
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
    "socialite/showrunner": 3,
    "forager/gardener": 6,
    "hunter/stalker": 4,
    "survivalist/furnace": 2,
    "caregiver/healer": 1,
    "drifter/trickster": 1,
    "socialite/demagogue": 2
  },
  "npcClasses": {
    "socialite/showrunner": 11,
    "survivalist/furnace": 1,
    "forager/feaster": 7,
    "hunter/stalker": 5,
    "forager/gardener": 7,
    "socialite/demagogue": 2,
    "caregiver/healer": 1
  },
  "playerGods": {
    "voice_of_the_relay": 4,
    "living_garden": 3
  },
  "npcGods": {
    "living_garden": 10
  },
  "winningEndings": {
    "feared/none/none/light": 2,
    "beloved/hunter/stalker/light": 1,
    "defiant/forager/gardener/light": 1,
    "beloved/none/none/light": 2,
    "relay/socialite/demagogue/light": 1,
    "beloved/socialite/showrunner/light": 1
  }
}
```
