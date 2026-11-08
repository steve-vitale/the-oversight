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
      "sum": 13689,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 961,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 11,
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
| _contestEnd | 16/16 | 16 | 122 | 122 | reached |
| _contestResolveOthers | 16/16 | 16 | 85 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 13 | 21 | 13 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 9 | 13 | 13 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 8 | 10 | 10 | reached |
| _cxPrizeSynergyHint | 16/16 | 13 | 35 | 34 | reached |
| _showEnd | 16/16 | 15 | 58 | 58 | reached |
| _showVillagerEnd | 16/16 | 11 | 24 | 24 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 400 | 84 | reached |
| apClubBoon | 16/16 | 16 | 1240 | 8 | reached |
| apDeadDrop | 16/16 | 16 | 1240 | 314 | reached |
| apPersonaPackage | 16/16 | 16 | 240 | 10 | reached |
| cleanCarcass | 16/16 | 15 | 214 | 0 | reached |
| comfort | 16/16 | 5 | 19 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 986 | 986 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 9 | 51 | 46 | reached |
| doAction | 16/16 | 16 | 8613 | 6566 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 644 | 644 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 7983 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 406 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 2 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 2 | 2 | 2 | produced |
| bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 10 | 1 | 1 | 0 | attempted_no_success |
| hunting_spear | 7 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 2 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 6 | 0 | 0 | ready_unused |
| sling | 2 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 7 | 40 | 38 | produced |
| stone_knife | 16 | 1 | 8 | 6 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 328 | 7 |
| npc/capstone | 2 | 2 |
| npc/contest | 82 | 64 |
| npc/craft | 1 | 0 |
| npc/show | 1 | 0 |
| player/contest | 84 | 67 |
| player/corpse-monster | 16 | 2 |
| player/corpse-person | 53 | 5 |
| player/corpse-villager | 225 | 18 |
| player/craft | 8 | 0 |
| player/fan-package | 84 | 24 |
| player/fan-vote | 8 | 0 |
| player/patron | 2 | 0 |
| player/show | 10 | 1 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 213,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 11750,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 65
    },
    "gods": {
      "notResident": 14
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 9,
        "holderDays": 300,
        "holderIdentitiesAcrossRuns": 11
      },
      "forager/gardener": {
        "runs": 8,
        "holderDays": 386,
        "holderIdentitiesAcrossRuns": 9
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 23,
        "holderIdentitiesAcrossRuns": 1
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 413,
        "holderIdentitiesAcrossRuns": 9
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 30,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 2,
        "holderDays": 19,
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
    "forager/gardener": 4,
    "hunter/stalker": 7,
    "explorer/cartographer": 2,
    "socialite/showrunner": 4,
    "forager/feaster": 1
  },
  "npcClasses": {
    "forager/gardener": 8,
    "hunter/stalker": 9,
    "forager/feaster": 7,
    "hunter/beastmaster": 1,
    "socialite/demagogue": 1
  },
  "playerGods": {},
  "npcGods": {
    "apex_predator": 2
  },
  "winningEndings": {
    "feared/forager/gardener/light": 1,
    "relay/hunter/stalker/light": 1,
    "beloved/none/none/light": 2,
    "defiant/hunter/stalker/light": 1,
    "beloved/forager/feaster/light": 1,
    "beloved/forager/gardener/light": 2,
    "feared/hunter/stalker/light": 1,
    "feared/socialite/showrunner/light": 1,
    "feared/none/none/light": 3,
    "beloved/hunter/stalker/light": 1,
    "defiant/socialite/showrunner/light": 1
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
      "sum": 19719,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 1190,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 15,
      "reportedRuns": 9
    },
    "livelihoodKnowledgeTrips": {
      "sum": 219,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 185,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 101,
      "reportedRuns": 15
    },
    "livelihoodHideHandledUnits": {
      "sum": 38,
      "reportedRuns": 10
    },
    "livelihoodHideTrials": {
      "sum": 14,
      "reportedRuns": 10
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 5,
      "reportedRuns": 5
    },
    "livelihoodBooksRead": {
      "sum": 6,
      "reportedRuns": 5
    },
    "livelihoodRuinSearches": {
      "sum": 12,
      "reportedRuns": 12
    },
    "livelihoodBuys": {
      "sum": 30,
      "reportedRuns": 9
    },
    "livelihoodSales": {
      "sum": 76,
      "reportedRuns": 8
    },
    "livelihoodCounterCooks": {
      "sum": 7,
      "reportedRuns": 2
    },
    "livelihoodCounterPreserves": {
      "sum": 6,
      "reportedRuns": 2
    },
    "livelihoodCounterStored": {
      "sum": 4,
      "reportedRuns": 2
    },
    "livelihoodCrafts": {
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
| _contestEnd | 16/16 | 16 | 220 | 220 | reached |
| _contestResolveOthers | 16/16 | 16 | 145 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 58 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 21 | 21 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 28 | 28 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 72 | 70 | reached |
| _showEnd | 16/16 | 16 | 118 | 118 | reached |
| _showVillagerEnd | 16/16 | 16 | 42 | 42 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 649 | 208 | reached |
| apClubBoon | 16/16 | 16 | 1902 | 77 | reached |
| apDeadDrop | 16/16 | 16 | 1902 | 474 | reached |
| apPersonaPackage | 16/16 | 16 | 410 | 13 | reached |
| cleanCarcass | 16/16 | 12 | 261 | 0 | reached |
| comfort | 16/16 | 5 | 16 | 4 | reached |
| corpseLootAll | 16/16 | 16 | 1510 | 1510 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 67 | 44 | reached |
| doAction | 16/16 | 16 | 13372 | 9626 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 1239 | 1239 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 12460 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 16/16 | 1 | 1 | 1 | reached |
| preserveFood | 16/16 | 2 | 6 | 0 | reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 5 | 6 | 6 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 11 | 48 | 48 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 424 | 0 | reached |
| traderSell | 16/16 | 8 | 76 | 76 | reached |
| visitorBuyWare | 16/16 | 9 | 30 | 30 | reached |
| visitorWares | 16/16 | 16 | 1045 | 1045 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 5 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 4 | 4 | 1 | produced |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 7 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 1 | 0 | 0 | 0 | known_no_material_sample |
| fish_weir | 1 | 1 | 0 | 0 | ready_unused |
| hide_armor | 12 | 4 | 16 | 5 | produced |
| hunting_spear | 9 | 2 | 0 | 0 | ready_unused |
| padded_cloth | 3 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 5 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 6 | 0 | 0 | ready_unused |
| sling | 4 | 1 | 0 | 0 | ready_unused |
| snare | 15 | 8 | 40 | 32 | produced |
| spring_snare | 3 | 0 | 0 | 0 | known_no_material_sample |
| stone_knife | 16 | 5 | 7 | 6 | produced |
| trotline | 1 | 0 | 0 | 0 | known_no_material_sample |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 358 | 4 |
| npc/capstone | 2 | 1 |
| npc/contest | 119 | 99 |
| npc/corpse-monster | 1 | 0 |
| npc/show | 3 | 0 |
| player/action | 5 | 0 |
| player/capstone | 2 | 1 |
| player/contest | 148 | 116 |
| player/corpse-monster | 11 | 1 |
| player/corpse-person | 53 | 6 |
| player/corpse-villager | 336 | 41 |
| player/craft | 12 | 0 |
| player/fan-package | 208 | 91 |
| player/fan-vote | 77 | 0 |
| player/patron | 5 | 0 |
| player/show | 34 | 11 |
| player/trade | 30 | 8 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 234,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16201,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 351
    },
    "gods": {
      "currentBearer": 33,
      "notResident": 4
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 9,
        "holderDays": 448,
        "holderIdentitiesAcrossRuns": 11
      },
      "explorer/cartographer": {
        "runs": 2,
        "holderDays": 50,
        "holderIdentitiesAcrossRuns": 3
      },
      "forager/feaster": {
        "runs": 9,
        "holderDays": 416,
        "holderIdentitiesAcrossRuns": 9
      },
      "forager/gardener": {
        "runs": 9,
        "holderDays": 680,
        "holderIdentitiesAcrossRuns": 15
      },
      "socialite/demagogue": {
        "runs": 3,
        "holderDays": 190,
        "holderIdentitiesAcrossRuns": 5
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 11,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 2,
        "holderDays": 69,
        "holderIdentitiesAcrossRuns": 2
      },
      "caregiver/healer": {
        "runs": 3,
        "holderDays": 152,
        "holderIdentitiesAcrossRuns": 3
      }
    },
    "gods": {
      "shepherd_of_the_dead": {
        "runs": 1,
        "holderDays": 13,
        "holderIdentitiesAcrossRuns": 1
      },
      "all_seeing": {
        "runs": 1,
        "holderDays": 16,
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
    "hunter/stalker": 7,
    "explorer/cartographer": 2,
    "socialite/demagogue": 1,
    "forager/gardener": 8,
    "hunter/beastmaster": 1,
    "forager/feaster": 1,
    "socialite/showrunner": 3,
    "drifter/trickster": 1,
    "caregiver/healer": 2
  },
  "npcClasses": {
    "hunter/stalker": 9,
    "explorer/cartographer": 2,
    "forager/feaster": 9,
    "forager/gardener": 9,
    "hunter/beastmaster": 1,
    "socialite/demagogue": 3,
    "socialite/showrunner": 2,
    "caregiver/healer": 3
  },
  "playerGods": {
    "voice_of_the_relay": 1,
    "all_seeing": 1,
    "shepherd_of_the_dead": 1
  },
  "npcGods": {
    "shepherd_of_the_dead": 1,
    "all_seeing": 1
  },
  "winningEndings": {
    "feared/none/none/light": 1,
    "beloved/forager/gardener/light": 1,
    "feared/forager/gardener/light": 2,
    "indispensable/none/none/light": 1,
    "feared/hunter/stalker/light": 1,
    "beloved/caregiver/healer/light": 1
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
      "sum": 15556,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 1107,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 16,
      "reportedRuns": 7
    },
    "livelihoodHarvestTrips": {
      "sum": 135,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 85,
      "reportedRuns": 15
    },
    "livelihoodSales": {
      "sum": 41,
      "reportedRuns": 8
    },
    "livelihoodBuys": {
      "sum": 25,
      "reportedRuns": 9
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 181 | 181 | reached |
| _contestResolveOthers | 16/16 | 16 | 105 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 56 | 24 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 10 | 12 | 12 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 21 | 21 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 60 | 56 | reached |
| _showEnd | 16/16 | 16 | 66 | 66 | reached |
| _showVillagerEnd | 16/16 | 13 | 30 | 30 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 529 | 163 | reached |
| apClubBoon | 16/16 | 16 | 1425 | 35 | reached |
| apDeadDrop | 16/16 | 16 | 1425 | 359 | reached |
| apPersonaPackage | 16/16 | 16 | 288 | 13 | reached |
| cleanCarcass | 16/16 | 9 | 140 | 0 | reached |
| comfort | 16/16 | 6 | 16 | 1 | reached |
| corpseLootAll | 16/16 | 16 | 678 | 678 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 8 | 41 | 33 | reached |
| doAction | 16/16 | 16 | 10543 | 7544 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 934 | 934 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 9038 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 287 | 0 | reached |
| traderSell | 16/16 | 8 | 41 | 41 | reached |
| visitorBuyWare | 16/16 | 9 | 25 | 25 | reached |
| visitorWares | 16/16 | 16 | 816 | 816 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 5 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 3 | 2 | 1 | produced |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 6 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 9 | 0 | 0 | 0 | known_no_material_sample |
| hunting_spear | 7 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 2 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 5 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 5 | 0 | 0 | ready_unused |
| sling | 4 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 5 | 34 | 28 | produced |
| stone_knife | 16 | 3 | 5 | 4 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 346 | 12 |
| npc/capstone | 2 | 2 |
| npc/contest | 97 | 83 |
| npc/corpse-monster | 5 | 0 |
| npc/craft | 1 | 0 |
| player/contest | 124 | 99 |
| player/corpse-monster | 10 | 1 |
| player/corpse-person | 19 | 1 |
| player/corpse-villager | 339 | 31 |
| player/craft | 5 | 0 |
| player/fan-package | 163 | 65 |
| player/fan-vote | 34 | 0 |
| player/patron | 7 | 0 |
| player/show | 19 | 2 |
| player/trade | 25 | 6 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 210,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 13426,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 164
    },
    "gods": {
      "currentBearer": 10,
      "notResident": 6
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 13,
        "holderDays": 507,
        "holderIdentitiesAcrossRuns": 13
      },
      "forager/gardener": {
        "runs": 11,
        "holderDays": 387,
        "holderIdentitiesAcrossRuns": 12
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 72,
        "holderIdentitiesAcrossRuns": 2
      },
      "forager/feaster": {
        "runs": 5,
        "holderDays": 499,
        "holderIdentitiesAcrossRuns": 9
      },
      "explorer/cartographer": {
        "runs": 1,
        "holderDays": 12,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 2,
        "holderDays": 78,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 17,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 3,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 2,
        "holderDays": 12,
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
    "hunter/stalker": 5,
    "socialite/showrunner": 3,
    "explorer/cartographer": 1,
    "forager/feaster": 2,
    "forager/gardener": 7,
    "brawler/juggernaut": 1,
    "caregiver/healer": 2,
    "drifter/trickster": 1,
    "survivalist/furnace": 1
  },
  "npcClasses": {
    "forager/gardener": 11,
    "hunter/stalker": 13,
    "explorer/cartographer": 1,
    "forager/feaster": 5,
    "hunter/beastmaster": 2,
    "socialite/showrunner": 2,
    "socialite/demagogue": 1,
    "survivalist/furnace": 1
  },
  "playerGods": {
    "voice_of_the_relay": 1,
    "apex_predator": 1
  },
  "npcGods": {
    "apex_predator": 2
  },
  "winningEndings": {
    "feared/forager/feaster/light": 2,
    "feared/none/none/light": 3,
    "beloved/forager/gardener/light": 2,
    "feared/hunter/stalker/light": 1,
    "witness/forager/gardener/light": 1,
    "beloved/none/none/light": 1,
    "beloved/hunter/stalker/light": 1,
    "feared/forager/gardener/light": 1,
    "relay/survivalist/furnace/light": 1
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
      "sum": 18688,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 1150,
      "reportedRuns": 16
    },
    "livelihoodPatients": {
      "sum": 784,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 132,
      "reportedRuns": 16
    },
    "livelihoodComforts": {
      "sum": 128,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 17,
      "reportedRuns": 8
    },
    "livelihoodTreatments": {
      "sum": 89,
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
| _contestEnd | 16/16 | 16 | 194 | 194 | reached |
| _contestResolveOthers | 16/16 | 16 | 128 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 61 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 13 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 18 | 18 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 67 | 64 | reached |
| _showEnd | 16/16 | 16 | 90 | 90 | reached |
| _showVillagerEnd | 16/16 | 12 | 30 | 30 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 632 | 187 | reached |
| apClubBoon | 16/16 | 16 | 1786 | 55 | reached |
| apDeadDrop | 16/16 | 16 | 1786 | 444 | reached |
| apPersonaPackage | 16/16 | 16 | 353 | 11 | reached |
| cleanCarcass | 16/16 | 12 | 264 | 0 | reached |
| comfort | 16/16 | 16 | 134 | 128 | reached |
| corpseLootAll | 16/16 | 16 | 1082 | 1082 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 8 | 43 | 39 | reached |
| doAction | 16/16 | 16 | 12235 | 9008 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 16 | 559 | 559 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 12632 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 342 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 3 | 3 | 1 | produced |
| bolt | 1 | 0 | 0 | 0 | known_no_material_sample |
| bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 7 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 4 | 0 | 0 | ready_unused |
| sharpened_stick | 4 | 3 | 0 | 0 | ready_unused |
| sling | 1 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 6 | 35 | 33 | produced |
| stone_knife | 16 | 2 | 5 | 5 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 319 | 4 |
| npc/capstone | 3 | 3 |
| npc/contest | 108 | 82 |
| player/capstone | 1 | 1 |
| player/combat | 1 | 1 |
| player/contest | 124 | 95 |
| player/corpse-monster | 10 | 0 |
| player/corpse-person | 30 | 2 |
| player/corpse-villager | 102 | 11 |
| player/craft | 6 | 0 |
| player/fan-package | 187 | 67 |
| player/fan-vote | 54 | 0 |
| player/show | 18 | 4 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 197,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16295,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 179
    },
    "gods": {}
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 11,
        "holderDays": 801,
        "holderIdentitiesAcrossRuns": 16
      },
      "forager/gardener": {
        "runs": 8,
        "holderDays": 686,
        "holderIdentitiesAcrossRuns": 14
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 42,
        "holderIdentitiesAcrossRuns": 1
      },
      "explorer/cartographer": {
        "runs": 1,
        "holderDays": 3,
        "holderIdentitiesAcrossRuns": 1
      },
      "forager/feaster": {
        "runs": 5,
        "holderDays": 296,
        "holderIdentitiesAcrossRuns": 6
      },
      "socialite/demagogue": {
        "runs": 4,
        "holderDays": 209,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 206,
        "holderIdentitiesAcrossRuns": 6
      },
      "drifter/trickster": {
        "runs": 1,
        "holderDays": 18,
        "holderIdentitiesAcrossRuns": 1
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 193,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 3,
        "holderDays": 83,
        "holderIdentitiesAcrossRuns": 3
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
    "socialite/demagogue": 3,
    "forager/gardener": 10,
    "forager/feaster": 1,
    "hunter/stalker": 4,
    "caregiver/healer": 2,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "forager/gardener": 8,
    "hunter/stalker": 11,
    "explorer/cartographer": 1,
    "hunter/beastmaster": 1,
    "forager/feaster": 5,
    "socialite/demagogue": 4,
    "drifter/trickster": 1,
    "socialite/showrunner": 4,
    "caregiver/healer": 2
  },
  "playerGods": {
    "voice_of_the_relay": 1,
    "shepherd_of_the_dead": 1
  },
  "npcGods": {
    "apex_predator": 3
  },
  "winningEndings": {
    "beloved/socialite/showrunner/light": 1,
    "indispensable/socialite/demagogue/light": 1,
    "beloved/forager/gardener/light": 3,
    "feared/forager/gardener/light": 1,
    "feared/none/none/light": 2,
    "relay/none/none/grey": 1,
    "feared/drifter/trickster/light": 1
  }
}
```
