# Feature and build census

Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.

## maker controller coverage

Captured errors are bounded diagnostics, not total failed-call counts. Missing legacy/profile diagnostics remain unknown. Blocked opportunity counters are coverage, not successful feature use; the material counter counts distinct bearer/day keys. Counter sums include only explicit reports; absent counters are not imputed as zero.

```json
{
  "version": 1,
  "measuredRuns": 64,
  "missingRuns": 0,
  "errorKnownRuns": 64,
  "errorRuns": 0,
  "capturedErrorReasons": {},
  "blockKnownRuns": 64,
  "blockedRuns": 0,
  "blocks": [],
  "counters": {
    "convoPageReads": {
      "sum": 72251,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 2503,
      "reportedRuns": 64
    },
    "livelihoodKnowledgeTrips": {
      "sum": 798,
      "reportedRuns": 64
    },
    "livelihoodHarvestTrips": {
      "sum": 758,
      "reportedRuns": 64
    },
    "livelihoodRuinSearches": {
      "sum": 49,
      "reportedRuns": 49
    },
    "livelihoodBooksRead": {
      "sum": 27,
      "reportedRuns": 25
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 522,
      "reportedRuns": 57
    },
    "livelihoodBuys": {
      "sum": 29,
      "reportedRuns": 27
    },
    "livelihoodSales": {
      "sum": 231,
      "reportedRuns": 32
    },
    "livelihoodHideHandledUnits": {
      "sum": 81,
      "reportedRuns": 27
    },
    "livelihoodHideTrials": {
      "sum": 23,
      "reportedRuns": 17
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 4,
      "reportedRuns": 4
    },
    "livelihoodMaterialUnits": {
      "sum": 10,
      "reportedRuns": 3
    },
    "livelihoodMaterialTakes": {
      "sum": 10,
      "reportedRuns": 3
    },
    "livelihoodCrafts": {
      "sum": 8,
      "reportedRuns": 6
    },
    "convoPageHiddenSelections": {
      "sum": 27,
      "reportedRuns": 14
    },
    "livelihoodCounterCooks": {
      "sum": 3,
      "reportedRuns": 3
    },
    "livelihoodCounterPreserves": {
      "sum": 3,
      "reportedRuns": 3
    },
    "livelihoodCounterStored": {
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
| _contestEnd | 64/64 | 64 | 799 | 799 | reached |
| _contestResolveOthers | 64/64 | 64 | 483 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 60 | 219 | 87 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 40 | 68 | 68 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 48 | 104 | 104 | reached |
| _cxPrizeSynergyHint | 64/64 | 60 | 260 | 249 | reached |
| _showEnd | 64/64 | 61 | 414 | 414 | reached |
| _showVillagerEnd | 64/64 | 56 | 145 | 145 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 2289 | 803 | reached |
| apClubBoon | 64/64 | 64 | 6176 | 258 | reached |
| apDeadDrop | 64/64 | 64 | 6176 | 1564 | reached |
| apPersonaPackage | 64/64 | 64 | 1246 | 69 | reached |
| cleanCarcass | 64/64 | 38 | 576 | 0 | reached |
| comfort | 64/64 | 25 | 90 | 27 | reached |
| corpseLootAll | 64/64 | 63 | 2015 | 2015 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 40 | 218 | 163 | reached |
| doAction | 64/64 | 64 | 51639 | 36045 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 57 | 521 | 521 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 39191 | 0 | reached |
| networkSummon | 64/64 | 0 | 0 | 0 | not_reached |
| orderMember | 64/64 | 0 | 0 | 0 | not_reached |
| preserveFood | 64/64 | 3 | 3 | 0 | reached |
| proposeCovenant | 64/64 | 0 | 0 | 0 | not_reached |
| proposeTrade | 64/64 | 0 | 0 | 0 | not_reached |
| readBook | 64/64 | 25 | 27 | 27 | reached |
| renderFat | 64/64 | 0 | 0 | 0 | not_reached |
| takeMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 64/64 | 28 | 191 | 191 | reached |
| takeWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| tbEnd | 64/64 | 64 | 1059 | 0 | reached |
| traderSell | 64/64 | 32 | 231 | 231 | reached |
| visitorBuyWare | 64/64 | 27 | 29 | 29 | reached |
| visitorWares | 64/64 | 64 | 4500 | 4500 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 64 | 6 | 7 | 6 | produced |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 21 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 3 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 5 | 0 | 0 | ready_unused |
| crossbow | 14 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 19 | 2 | 0 | 0 | ready_unused |
| deadfall | 2 | 1 | 0 | 0 | ready_unused |
| decoy_rattle | 5 | 2 | 0 | 0 | ready_unused |
| fire_hardened_spear | 19 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 2 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 29 | 8 | 28 | 9 | produced |
| hunting_spear | 12 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 3 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 28 | 25 | 0 | 0 | ready_unused |
| sharpened_stick | 38 | 34 | 0 | 0 | ready_unused |
| sling | 21 | 2 | 0 | 0 | ready_unused |
| snare | 51 | 30 | 158 | 124 | produced |
| spring_snare | 18 | 6 | 0 | 0 | ready_unused |
| stone_knife | 64 | 6 | 25 | 24 | produced |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 171 | 1 |
| npc/capstone | 68 | 1 |
| npc/contest | 395 | 191 |
| npc/show | 3 | 0 |
| player/capstone | 16 | 0 |
| player/contest | 521 | 284 |
| player/corpse-monster | 14 | 4 |
| player/corpse-person | 145 | 17 |
| player/corpse-villager | 1645 | 147 |
| player/craft | 39 | 0 |
| player/fan-package | 803 | 311 |
| player/fan-vote | 258 | 0 |
| player/patron | 21 | 0 |
| player/show | 104 | 28 |
| player/trade | 29 | 0 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 902,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 62821,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 986
    },
    "gods": {
      "currentBearer": 615,
      "notResident": 502
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 30,
        "holderDays": 2173,
        "holderIdentitiesAcrossRuns": 37
      },
      "forager/feaster": {
        "runs": 37,
        "holderDays": 3072,
        "holderIdentitiesAcrossRuns": 50
      },
      "socialite/showrunner": {
        "runs": 19,
        "holderDays": 591,
        "holderIdentitiesAcrossRuns": 22
      },
      "hunter/stalker": {
        "runs": 22,
        "holderDays": 1097,
        "holderIdentitiesAcrossRuns": 27
      },
      "survivalist/furnace": {
        "runs": 6,
        "holderDays": 251,
        "holderIdentitiesAcrossRuns": 6
      },
      "socialite/demagogue": {
        "runs": 15,
        "holderDays": 330,
        "holderIdentitiesAcrossRuns": 15
      },
      "caregiver/healer": {
        "runs": 4,
        "holderDays": 171,
        "holderIdentitiesAcrossRuns": 4
      },
      "hunter/beastmaster": {
        "runs": 4,
        "holderDays": 97,
        "holderIdentitiesAcrossRuns": 4
      }
    },
    "gods": {
      "living_garden": {
        "runs": 44,
        "holderDays": 2744,
        "holderIdentitiesAcrossRuns": 67
      },
      "shepherd_of_the_dead": {
        "runs": 1,
        "holderDays": 11,
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
    "hunter/stalker": 15,
    "drifter/trickster": 9,
    "survivalist/furnace": 4,
    "forager/gardener": 20,
    "forager/feaster": 9,
    "socialite/showrunner": 11,
    "drifter/phantom": 2,
    "explorer/cartographer": 4,
    "socialite/demagogue": 4,
    "hunter/beastmaster": 2
  },
  "npcClasses": {
    "forager/feaster": 37,
    "forager/gardener": 30,
    "socialite/showrunner": 19,
    "hunter/stalker": 22,
    "socialite/demagogue": 15,
    "survivalist/furnace": 6,
    "drifter/trickster": 1,
    "caregiver/healer": 4,
    "hunter/beastmaster": 4
  },
  "playerGods": {
    "living_garden": 20,
    "voice_of_the_relay": 7,
    "all_seeing": 1
  },
  "npcGods": {
    "living_garden": 44,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "feared/forager/gardener/light": 1,
    "beloved/forager/feaster/light": 1,
    "feared/drifter/phantom/light": 1,
    "beloved/none/none/light": 5,
    "beloved/socialite/showrunner/light": 3,
    "beloved/forager/gardener/light": 2,
    "feared/forager/feaster/light": 1,
    "assimilated/forager/feaster/light": 2,
    "feared/drifter/trickster/light": 1,
    "witness/none/none/light": 1,
    "feared/socialite/demagogue/light": 1,
    "feared/none/none/light": 5,
    "beloved/hunter/beastmaster/light": 1,
    "beloved/hunter/stalker/light": 2,
    "beloved/explorer/cartographer/light": 2,
    "feared/hunter/stalker/light": 2,
    "assimilated/forager/gardener/light": 1,
    "feared/explorer/cartographer/light": 1
  }
}
```

## caregiver controller coverage

Captured errors are bounded diagnostics, not total failed-call counts. Missing legacy/profile diagnostics remain unknown. Blocked opportunity counters are coverage, not successful feature use; the material counter counts distinct bearer/day keys. Counter sums include only explicit reports; absent counters are not imputed as zero.

```json
{
  "version": 1,
  "measuredRuns": 64,
  "missingRuns": 0,
  "errorKnownRuns": 64,
  "errorRuns": 0,
  "capturedErrorReasons": {},
  "blockKnownRuns": 64,
  "blockedRuns": 0,
  "blocks": [],
  "counters": {
    "convoPageReads": {
      "sum": 74868,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 2633,
      "reportedRuns": 63
    },
    "livelihoodPatients": {
      "sum": 3239,
      "reportedRuns": 64
    },
    "livelihoodComforts": {
      "sum": 581,
      "reportedRuns": 63
    },
    "livelihoodTreatments": {
      "sum": 174,
      "reportedRuns": 41
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 574,
      "reportedRuns": 60
    },
    "convoPageHiddenSelections": {
      "sum": 22,
      "reportedRuns": 17
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 64/64 | 64 | 880 | 880 | reached |
| _contestResolveOthers | 64/64 | 64 | 507 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 64 | 227 | 75 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 46 | 88 | 88 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 53 | 102 | 102 | reached |
| _cxPrizeSynergyHint | 64/64 | 64 | 273 | 255 | reached |
| _showEnd | 64/64 | 64 | 419 | 419 | reached |
| _showVillagerEnd | 64/64 | 57 | 156 | 156 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 2455 | 879 | reached |
| apClubBoon | 64/64 | 64 | 6587 | 250 | reached |
| apDeadDrop | 64/64 | 64 | 6587 | 1689 | reached |
| apPersonaPackage | 64/64 | 64 | 1285 | 19 | reached |
| cleanCarcass | 64/64 | 31 | 470 | 0 | reached |
| comfort | 64/64 | 64 | 645 | 586 | reached |
| corpseLootAll | 64/64 | 64 | 1116 | 1116 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 27 | 152 | 106 | reached |
| doAction | 64/64 | 64 | 51564 | 37924 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 55 | 204 | 204 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 42954 | 0 | reached |
| networkSummon | 64/64 | 0 | 0 | 0 | not_reached |
| orderMember | 64/64 | 0 | 0 | 0 | not_reached |
| preserveFood | 64/64 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 64/64 | 0 | 0 | 0 | not_reached |
| proposeTrade | 64/64 | 0 | 0 | 0 | not_reached |
| readBook | 64/64 | 0 | 0 | 0 | not_reached |
| renderFat | 64/64 | 0 | 0 | 0 | not_reached |
| takeMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 64/64 | 0 | 0 | 0 | not_reached |
| takeWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| tbEnd | 64/64 | 64 | 1044 | 0 | reached |
| traderSell | 64/64 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 64/64 | 0 | 0 | 0 | not_reached |
| visitorWares | 64/64 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 64 | 6 | 11 | 3 | produced |
| bolt | 1 | 0 | 0 | 0 | known_no_material_sample |
| bow | 12 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 7 | 0 | 0 | ready_unused |
| crossbow | 12 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 12 | 3 | 0 | 0 | ready_unused |
| decoy_rattle | 2 | 2 | 0 | 0 | ready_unused |
| fire_hardened_spear | 10 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 7 | 3 | 0 | 0 | ready_unused |
| hunting_spear | 7 | 1 | 0 | 0 | ready_unused |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 27 | 19 | 0 | 0 | ready_unused |
| sharpened_stick | 31 | 24 | 0 | 0 | ready_unused |
| sling | 12 | 1 | 0 | 0 | ready_unused |
| snare | 48 | 27 | 122 | 87 | produced |
| stone_knife | 64 | 11 | 19 | 16 | produced |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 144 | 2 |
| npc/capstone | 63 | 3 |
| npc/contest | 458 | 243 |
| npc/show | 5 | 0 |
| player/capstone | 16 | 1 |
| player/combat | 1 | 1 |
| player/contest | 529 | 315 |
| player/corpse-monster | 15 | 3 |
| player/corpse-person | 57 | 7 |
| player/corpse-villager | 1177 | 154 |
| player/craft | 19 | 0 |
| player/fan-package | 879 | 348 |
| player/fan-vote | 249 | 0 |
| player/patron | 11 | 0 |
| player/show | 121 | 35 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 789,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 67975,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 1192
    },
    "gods": {
      "currentBearer": 567,
      "notResident": 318
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 34,
        "holderDays": 2079,
        "holderIdentitiesAcrossRuns": 39
      },
      "forager/feaster": {
        "runs": 36,
        "holderDays": 2844,
        "holderIdentitiesAcrossRuns": 50
      },
      "hunter/stalker": {
        "runs": 30,
        "holderDays": 1530,
        "holderIdentitiesAcrossRuns": 37
      },
      "socialite/showrunner": {
        "runs": 17,
        "holderDays": 684,
        "holderIdentitiesAcrossRuns": 20
      },
      "socialite/demagogue": {
        "runs": 12,
        "holderDays": 456,
        "holderIdentitiesAcrossRuns": 13
      },
      "hunter/beastmaster": {
        "runs": 4,
        "holderDays": 150,
        "holderIdentitiesAcrossRuns": 4
      },
      "caregiver/healer": {
        "runs": 8,
        "holderDays": 528,
        "holderIdentitiesAcrossRuns": 8
      },
      "survivalist/furnace": {
        "runs": 6,
        "holderDays": 238,
        "holderIdentitiesAcrossRuns": 6
      }
    },
    "gods": {
      "living_garden": {
        "runs": 40,
        "holderDays": 2237,
        "holderIdentitiesAcrossRuns": 60
      },
      "apex_predator": {
        "runs": 1,
        "holderDays": 34,
        "holderIdentitiesAcrossRuns": 1
      },
      "shepherd_of_the_dead": {
        "runs": 2,
        "holderDays": 51,
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
    "socialite/showrunner": 12,
    "forager/gardener": 13,
    "drifter/trickster": 7,
    "forager/feaster": 10,
    "hunter/stalker": 16,
    "survivalist/furnace": 4,
    "explorer/cartographer": 2,
    "socialite/demagogue": 4,
    "hunter/beastmaster": 2,
    "drifter/phantom": 1,
    "brawler/berserker": 1,
    "caregiver/healer": 2,
    "explorer/seer": 2
  },
  "npcClasses": {
    "forager/feaster": 36,
    "forager/gardener": 34,
    "hunter/stalker": 31,
    "socialite/showrunner": 17,
    "socialite/demagogue": 12,
    "hunter/beastmaster": 4,
    "caregiver/healer": 8,
    "survivalist/furnace": 6
  },
  "playerGods": {
    "voice_of_the_relay": 11,
    "living_garden": 17,
    "apex_predator": 1,
    "the_between": 1
  },
  "npcGods": {
    "living_garden": 40,
    "apex_predator": 1,
    "shepherd_of_the_dead": 2
  },
  "winningEndings": {
    "beloved/hunter/stalker/light": 3,
    "relay/none/none/light": 3,
    "feared/hunter/stalker/light": 2,
    "feared/none/none/light": 8,
    "assimilated/forager/gardener/light": 2,
    "beloved/none/none/light": 4,
    "beloved/forager/gardener/light": 1,
    "feared/drifter/trickster/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "feared/hunter/beastmaster/light": 1,
    "feared/drifter/phantom/light": 1,
    "beloved/drifter/trickster/light": 1,
    "beloved/brawler/berserker/light": 1,
    "beloved/caregiver/healer/light": 1,
    "feared/explorer/seer/light": 1,
    "beloved/explorer/cartographer/light": 1,
    "witness/none/none/light": 1,
    "feared/socialite/demagogue/light": 1,
    "beloved/forager/feaster/light": 2,
    "relay/hunter/stalker/light": 1,
    "assimilated/caregiver/healer/light": 1,
    "relay/forager/gardener/light": 1,
    "witness/explorer/seer/light": 1
  }
}
```
