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
      "sum": 15445,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 1473,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 20,
      "reportedRuns": 10
    }
  }
}
```

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 144 | 144 | reached |
| _contestResolveOthers | 16/16 | 16 | 94 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 36 | 16 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 16 | 15 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 20 | 20 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 43 | 43 | reached |
| _showEnd | 16/16 | 16 | 78 | 78 | reached |
| _showVillagerEnd | 16/16 | 15 | 25 | 25 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 461 | 134 | reached |
| apClubBoon | 16/16 | 16 | 1366 | 20 | reached |
| apDeadDrop | 16/16 | 16 | 1366 | 341 | reached |
| apPersonaPackage | 16/16 | 16 | 271 | 6 | reached |
| cleanCarcass | 16/16 | 14 | 148 | 0 | reached |
| comfort | 16/16 | 1 | 4 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 795 | 795 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 55 | 48 | reached |
| doAction | 16/16 | 16 | 9595 | 7215 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 788 | 788 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 8387 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 16/16 | 1 | 1 | 1 | reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 0 | 0 | 0 | not_reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 0 | 0 | 0 | not_reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 458 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 5 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 2 | 2 | 0 | attempted_no_success |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 3 | 0 | 0 | ready_unused |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 10 | 2 | 3 | 1 | produced |
| hunting_spear | 7 | 2 | 0 | 0 | ready_unused |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 7 | 6 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 13 | 7 | 44 | 41 | produced |
| stone_knife | 16 | 4 | 6 | 6 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 250 | 4 |
| npc/contest | 78 | 66 |
| player/contest | 96 | 79 |
| player/corpse-monster | 16 | 3 |
| player/corpse-person | 22 | 3 |
| player/corpse-villager | 342 | 29 |
| player/craft | 7 | 0 |
| player/fan-package | 134 | 36 |
| player/fan-vote | 20 | 0 |
| player/patron | 2 | 0 |
| player/show | 17 | 1 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 226,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 11953,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 318
    },
    "gods": {}
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 11,
        "holderDays": 409,
        "holderIdentitiesAcrossRuns": 14
      },
      "forager/gardener": {
        "runs": 10,
        "holderDays": 461,
        "holderIdentitiesAcrossRuns": 14
      },
      "explorer/cartographer": {
        "runs": 2,
        "holderDays": 66,
        "holderIdentitiesAcrossRuns": 2
      },
      "forager/feaster": {
        "runs": 4,
        "holderDays": 202,
        "holderIdentitiesAcrossRuns": 5
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 127,
        "holderIdentitiesAcrossRuns": 4
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 31,
        "holderIdentitiesAcrossRuns": 1
      },
      "brawler/berserker": {
        "runs": 1,
        "holderDays": 18,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 9,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 27,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {}
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "hunter/stalker": 6,
    "socialite/demagogue": 1,
    "forager/gardener": 6,
    "socialite/showrunner": 5,
    "drifter/trickster": 1,
    "brawler/berserker": 1,
    "forager/feaster": 3,
    "hunter/beastmaster": 2,
    "explorer/cartographer": 2
  },
  "npcClasses": {
    "forager/gardener": 10,
    "hunter/stalker": 11,
    "explorer/cartographer": 2,
    "forager/feaster": 4,
    "socialite/showrunner": 3,
    "caregiver/healer": 1,
    "brawler/berserker": 1,
    "hunter/beastmaster": 1,
    "survivalist/furnace": 1
  },
  "playerGods": {},
  "npcGods": {},
  "winningEndings": {
    "feared/none/none/light": 1,
    "beloved/socialite/demagogue/light": 1,
    "feared/hunter/stalker/light": 2,
    "beloved/forager/gardener/light": 1,
    "indispensable/none/none/light": 1,
    "feared/forager/gardener/light": 2,
    "indispensable/brawler/berserker/light": 1,
    "feared/forager/feaster/light": 1,
    "beloved/none/none/light": 1,
    "witness/none/none/light": 1,
    "beloved/explorer/cartographer/light": 1,
    "feared/socialite/showrunner/light": 1
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
      "sum": 17407,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 1230,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 7,
      "reportedRuns": 6
    },
    "livelihoodKnowledgeTrips": {
      "sum": 210,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 158,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 88,
      "reportedRuns": 15
    },
    "livelihoodRuinSearches": {
      "sum": 10,
      "reportedRuns": 10
    },
    "livelihoodBuys": {
      "sum": 29,
      "reportedRuns": 8
    },
    "livelihoodSales": {
      "sum": 58,
      "reportedRuns": 7
    },
    "livelihoodHideHandledUnits": {
      "sum": 33,
      "reportedRuns": 10
    },
    "livelihoodHideTrials": {
      "sum": 9,
      "reportedRuns": 7
    },
    "livelihoodBooksRead": {
      "sum": 8,
      "reportedRuns": 8
    },
    "livelihoodCounterCooks": {
      "sum": 2,
      "reportedRuns": 2
    },
    "livelihoodCounterPreserves": {
      "sum": 2,
      "reportedRuns": 2
    },
    "livelihoodCounterStored": {
      "sum": 2,
      "reportedRuns": 2
    },
    "livelihoodMaterialUnits": {
      "sum": 2,
      "reportedRuns": 1
    },
    "livelihoodMaterialTakes": {
      "sum": 2,
      "reportedRuns": 1
    },
    "livelihoodCrafts": {
      "sum": 3,
      "reportedRuns": 3
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 2,
      "reportedRuns": 2
    }
  }
}
```

## maker

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 193 | 193 | reached |
| _contestResolveOthers | 16/16 | 16 | 126 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 54 | 22 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 10 | 18 | 18 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 11 | 18 | 18 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 55 | 49 | reached |
| _showEnd | 16/16 | 16 | 94 | 94 | reached |
| _showVillagerEnd | 16/16 | 13 | 29 | 29 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 593 | 158 | reached |
| apClubBoon | 16/16 | 16 | 1652 | 41 | reached |
| apDeadDrop | 16/16 | 16 | 1652 | 410 | reached |
| apPersonaPackage | 16/16 | 16 | 342 | 21 | reached |
| cleanCarcass | 16/16 | 15 | 199 | 0 | reached |
| comfort | 16/16 | 4 | 14 | 4 | reached |
| corpseLootAll | 16/16 | 16 | 586 | 586 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 9 | 54 | 45 | reached |
| doAction | 16/16 | 16 | 11779 | 8451 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 1057 | 1057 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 10032 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 2 | 2 | 0 | reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 8 | 8 | 8 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 10 | 38 | 38 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 338 | 0 | reached |
| traderSell | 16/16 | 7 | 58 | 58 | reached |
| visitorBuyWare | 16/16 | 8 | 29 | 29 | reached |
| visitorWares | 16/16 | 16 | 863 | 863 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 8 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 4 | 2 | 2 | produced |
| bolt | 2 | 0 | 0 | 0 | known_no_material_sample |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 4 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 8 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 12 | 2 | 11 | 4 | produced |
| hunting_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 4 | 4 | 0 | 0 | ready_unused |
| sharpened_stick | 8 | 4 | 0 | 0 | ready_unused |
| sling | 2 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 6 | 34 | 32 | produced |
| spring_snare | 4 | 1 | 0 | 0 | ready_unused |
| stone_knife | 16 | 3 | 7 | 7 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 368 | 5 |
| npc/capstone | 1 | 0 |
| npc/contest | 122 | 99 |
| npc/show | 1 | 0 |
| player/action | 5 | 0 |
| player/capstone | 1 | 1 |
| player/contest | 114 | 84 |
| player/corpse-monster | 17 | 2 |
| player/corpse-person | 27 | 3 |
| player/corpse-villager | 325 | 14 |
| player/craft | 13 | 0 |
| player/fan-package | 158 | 57 |
| player/fan-vote | 41 | 0 |
| player/patron | 3 | 0 |
| player/show | 18 | 4 |
| player/trade | 29 | 6 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 238,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 13871,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 492
    },
    "gods": {
      "notResident": 6
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 8,
        "holderDays": 492,
        "holderIdentitiesAcrossRuns": 12
      },
      "forager/gardener": {
        "runs": 5,
        "holderDays": 515,
        "holderIdentitiesAcrossRuns": 13
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 106,
        "holderIdentitiesAcrossRuns": 3
      },
      "explorer/cartographer": {
        "runs": 4,
        "holderDays": 84,
        "holderIdentitiesAcrossRuns": 4
      },
      "forager/feaster": {
        "runs": 6,
        "holderDays": 206,
        "holderIdentitiesAcrossRuns": 8
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 141,
        "holderIdentitiesAcrossRuns": 3
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 23,
        "holderIdentitiesAcrossRuns": 1
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 86,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 37,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "all_seeing": {
        "runs": 1,
        "holderDays": 5,
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
    "socialite/showrunner": 6,
    "hunter/beastmaster": 1,
    "hunter/stalker": 3,
    "survivalist/furnace": 1,
    "caregiver/healer": 1,
    "forager/feaster": 2,
    "forager/gardener": 5,
    "drifter/trickster": 2
  },
  "npcClasses": {
    "forager/gardener": 5,
    "hunter/stalker": 8,
    "explorer/cartographer": 4,
    "hunter/beastmaster": 2,
    "forager/feaster": 6,
    "socialite/showrunner": 3,
    "survivalist/furnace": 1,
    "caregiver/healer": 1,
    "socialite/demagogue": 1
  },
  "playerGods": {
    "voice_of_the_relay": 1,
    "shepherd_of_the_dead": 1
  },
  "npcGods": {
    "all_seeing": 1
  },
  "winningEndings": {
    "relay/hunter/beastmaster/light": 1,
    "beloved/none/none/light": 3,
    "witness/survivalist/furnace/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "feared/forager/gardener/light": 1,
    "witness/none/none/light": 1,
    "beloved/forager/gardener/light": 1,
    "beloved/forager/feaster/light": 1,
    "assimilated/none/none/light": 1
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
      "sum": 19539,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 1443,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 20,
      "reportedRuns": 10
    },
    "livelihoodHarvestTrips": {
      "sum": 193,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 97,
      "reportedRuns": 14
    },
    "livelihoodBuys": {
      "sum": 15,
      "reportedRuns": 8
    },
    "livelihoodSales": {
      "sum": 55,
      "reportedRuns": 7
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 196 | 196 | reached |
| _contestResolveOthers | 16/16 | 16 | 131 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 54 | 26 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 11 | 17 | 17 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 26 | 26 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 67 | 63 | reached |
| _showEnd | 16/16 | 15 | 112 | 112 | reached |
| _showVillagerEnd | 16/16 | 14 | 52 | 52 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 654 | 187 | reached |
| apClubBoon | 16/16 | 16 | 1827 | 62 | reached |
| apDeadDrop | 16/16 | 16 | 1827 | 446 | reached |
| apPersonaPackage | 16/16 | 16 | 382 | 4 | reached |
| cleanCarcass | 16/16 | 13 | 284 | 0 | reached |
| comfort | 16/16 | 5 | 22 | 4 | reached |
| corpseLootAll | 16/16 | 16 | 466 | 466 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 88 | 79 | reached |
| doAction | 16/16 | 16 | 13063 | 9396 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 1026 | 1026 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11818 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 0 | 0 | 0 | not_reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 0 | 0 | 0 | not_reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 15 | 348 | 0 | reached |
| traderSell | 16/16 | 7 | 55 | 55 | reached |
| visitorBuyWare | 16/16 | 8 | 15 | 15 | reached |
| visitorWares | 16/16 | 16 | 1006 | 1006 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 6 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 2 | 2 | 1 | produced |
| bolt | 2 | 0 | 0 | 0 | known_no_material_sample |
| bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 3 | 0 | 0 | ready_unused |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 9 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 9 | 1 | 1 | 1 | produced |
| hunting_spear | 7 | 1 | 0 | 0 | ready_unused |
| padded_cloth | 3 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 2 | 0 | 0 | ready_unused |
| sharpened_stick | 11 | 8 | 0 | 0 | ready_unused |
| sling | 2 | 1 | 0 | 0 | ready_unused |
| snare | 14 | 7 | 76 | 68 | produced |
| stone_knife | 16 | 3 | 9 | 9 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 387 | 7 |
| npc/capstone | 1 | 1 |
| npc/care | 5 | 0 |
| npc/contest | 114 | 91 |
| npc/show | 1 | 0 |
| player/contest | 138 | 113 |
| player/corpse-monster | 11 | 1 |
| player/corpse-person | 30 | 3 |
| player/corpse-villager | 317 | 21 |
| player/craft | 11 | 0 |
| player/fan-package | 187 | 77 |
| player/fan-vote | 62 | 0 |
| player/show | 37 | 12 |
| player/trade | 15 | 4 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 221,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 15472,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 442
    },
    "gods": {
      "currentBearer": 23
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 9,
        "holderDays": 587,
        "holderIdentitiesAcrossRuns": 14
      },
      "forager/gardener": {
        "runs": 6,
        "holderDays": 516,
        "holderIdentitiesAcrossRuns": 12
      },
      "forager/feaster": {
        "runs": 8,
        "holderDays": 531,
        "holderIdentitiesAcrossRuns": 8
      },
      "explorer/cartographer": {
        "runs": 1,
        "holderDays": 19,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 18,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 55,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 2,
        "holderDays": 111,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 64,
        "holderIdentitiesAcrossRuns": 2
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 16,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 1,
        "holderDays": 33,
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
    "caregiver/healer": 2,
    "forager/feaster": 3,
    "hunter/stalker": 4,
    "socialite/showrunner": 5,
    "forager/gardener": 7,
    "hunter/beastmaster": 2,
    "socialite/demagogue": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "hunter/stalker": 9,
    "explorer/cartographer": 1,
    "forager/feaster": 8,
    "forager/gardener": 6,
    "hunter/beastmaster": 1,
    "socialite/showrunner": 2,
    "survivalist/furnace": 1,
    "socialite/demagogue": 2,
    "caregiver/healer": 1
  },
  "playerGods": {
    "apex_predator": 1
  },
  "npcGods": {
    "apex_predator": 1
  },
  "winningEndings": {
    "feared/caregiver/healer/light": 1,
    "beloved/forager/feaster/light": 1,
    "beloved/none/none/light": 1,
    "indispensable/forager/gardener/light": 1,
    "feared/forager/gardener/light": 1
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
      "sum": 17276,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 1135,
      "reportedRuns": 16
    },
    "livelihoodPatients": {
      "sum": 836,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 89,
      "reportedRuns": 15
    },
    "livelihoodComforts": {
      "sum": 225,
      "reportedRuns": 16
    },
    "livelihoodTreatments": {
      "sum": 63,
      "reportedRuns": 10
    },
    "convoPageHiddenSelections": {
      "sum": 5,
      "reportedRuns": 4
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 182 | 182 | reached |
| _contestResolveOthers | 16/16 | 16 | 124 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 14 | 41 | 19 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 10 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 25 | 25 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 50 | 49 | reached |
| _showEnd | 16/16 | 16 | 77 | 77 | reached |
| _showVillagerEnd | 16/16 | 11 | 28 | 28 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 561 | 165 | reached |
| apClubBoon | 16/16 | 16 | 1606 | 32 | reached |
| apDeadDrop | 16/16 | 16 | 1606 | 393 | reached |
| apPersonaPackage | 16/16 | 16 | 328 | 9 | reached |
| cleanCarcass | 16/16 | 15 | 122 | 0 | reached |
| comfort | 16/16 | 16 | 245 | 230 | reached |
| corpseLootAll | 16/16 | 16 | 946 | 946 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 9 | 46 | 35 | reached |
| doAction | 16/16 | 16 | 11018 | 8232 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 648 | 648 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 10171 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 0 | 0 | 0 | not_reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 0 | 0 | 0 | not_reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 332 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 3 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 3 | 3 | 1 | produced |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 3 | 0 | 0 | ready_unused |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 10 | 2 | 2 | 1 | produced |
| hunting_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 4 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 4 | 0 | 0 | ready_unused |
| sling | 3 | 1 | 0 | 0 | ready_unused |
| snare | 14 | 5 | 32 | 25 | produced |
| stone_knife | 16 | 3 | 9 | 8 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 308 | 6 |
| npc/capstone | 2 | 2 |
| npc/contest | 104 | 85 |
| player/capstone | 1 | 1 |
| player/contest | 115 | 93 |
| player/corpse-monster | 14 | 1 |
| player/corpse-person | 21 | 2 |
| player/corpse-villager | 300 | 21 |
| player/craft | 10 | 0 |
| player/fan-package | 165 | 61 |
| player/fan-vote | 29 | 0 |
| player/patron | 9 | 0 |
| player/show | 13 | 3 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 227,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 13954,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 441
    },
    "gods": {
      "currentBearer": 30
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 8,
        "holderDays": 624,
        "holderIdentitiesAcrossRuns": 11
      },
      "socialite/demagogue": {
        "runs": 3,
        "holderDays": 155,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 62,
        "holderIdentitiesAcrossRuns": 4
      },
      "hunter/beastmaster": {
        "runs": 4,
        "holderDays": 145,
        "holderIdentitiesAcrossRuns": 5
      },
      "forager/gardener": {
        "runs": 11,
        "holderDays": 656,
        "holderIdentitiesAcrossRuns": 13
      },
      "explorer/cartographer": {
        "runs": 1,
        "holderDays": 34,
        "holderIdentitiesAcrossRuns": 1
      },
      "forager/feaster": {
        "runs": 6,
        "holderDays": 262,
        "holderIdentitiesAcrossRuns": 7
      }
    },
    "gods": {
      "voice_of_the_relay": {
        "runs": 1,
        "holderDays": 62,
        "holderIdentitiesAcrossRuns": 1
      },
      "apex_predator": {
        "runs": 2,
        "holderDays": 30,
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
    "hunter/stalker": 3,
    "socialite/showrunner": 5,
    "hunter/beastmaster": 2,
    "forager/gardener": 6,
    "socialite/demagogue": 3,
    "forager/feaster": 4,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "hunter/stalker": 8,
    "socialite/demagogue": 3,
    "socialite/showrunner": 5,
    "forager/gardener": 11,
    "hunter/beastmaster": 4,
    "explorer/cartographer": 1,
    "forager/feaster": 6
  },
  "playerGods": {
    "apex_predator": 1,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "voice_of_the_relay": 1,
    "apex_predator": 2
  },
  "winningEndings": {
    "beloved/hunter/beastmaster/light": 1,
    "feared/forager/gardener/light": 1,
    "beloved/none/none/light": 4,
    "witness/forager/gardener/light": 1,
    "indispensable/forager/feaster/light": 1,
    "indispensable/socialite/showrunner/light": 1,
    "feared/none/none/light": 1,
    "beloved/forager/gardener/light": 1,
    "relay/socialite/showrunner/light": 1
  }
}
```
