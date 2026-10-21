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
      "sum": 74665,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 2431,
      "reportedRuns": 63
    },
    "livelihoodKnowledgeTrips": {
      "sum": 804,
      "reportedRuns": 63
    },
    "livelihoodHarvestTrips": {
      "sum": 806,
      "reportedRuns": 62
    },
    "livelihoodBooksRead": {
      "sum": 32,
      "reportedRuns": 25
    },
    "livelihoodRuinSearches": {
      "sum": 50,
      "reportedRuns": 50
    },
    "livelihoodSales": {
      "sum": 168,
      "reportedRuns": 37
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 577,
      "reportedRuns": 58
    },
    "livelihoodHideHandledUnits": {
      "sum": 79,
      "reportedRuns": 25
    },
    "livelihoodBuys": {
      "sum": 30,
      "reportedRuns": 28
    },
    "livelihoodCrafts": {
      "sum": 7,
      "reportedRuns": 7
    },
    "convoPageHiddenSelections": {
      "sum": 20,
      "reportedRuns": 11
    },
    "livelihoodHideTrials": {
      "sum": 21,
      "reportedRuns": 18
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 10,
      "reportedRuns": 10
    },
    "livelihoodCounterCooks": {
      "sum": 4,
      "reportedRuns": 4
    },
    "livelihoodCounterPreserves": {
      "sum": 4,
      "reportedRuns": 4
    },
    "livelihoodCounterStored": {
      "sum": 4,
      "reportedRuns": 4
    },
    "livelihoodMaterialUnits": {
      "sum": 2,
      "reportedRuns": 1
    },
    "livelihoodMaterialTakes": {
      "sum": 2,
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
| _contestEnd | 64/64 | 64 | 854 | 854 | reached |
| _contestResolveOthers | 64/64 | 62 | 521 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 63 | 226 | 76 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 43 | 80 | 80 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 55 | 119 | 119 | reached |
| _cxPrizeSynergyHint | 64/64 | 62 | 266 | 250 | reached |
| _showEnd | 64/64 | 64 | 435 | 435 | reached |
| _showVillagerEnd | 64/64 | 56 | 149 | 149 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 2337 | 823 | reached |
| apClubBoon | 64/64 | 64 | 6321 | 234 | reached |
| apDeadDrop | 64/64 | 64 | 6321 | 1574 | reached |
| apPersonaPackage | 64/64 | 64 | 1245 | 116 | reached |
| cleanCarcass | 64/64 | 36 | 607 | 0 | reached |
| comfort | 64/64 | 21 | 74 | 17 | reached |
| corpseLootAll | 64/64 | 62 | 2702 | 2702 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 36 | 193 | 157 | reached |
| doAction | 64/64 | 64 | 53628 | 37411 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 57 | 534 | 534 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 42658 | 0 | reached |
| networkSummon | 64/64 | 0 | 0 | 0 | not_reached |
| orderMember | 64/64 | 0 | 0 | 0 | not_reached |
| preserveFood | 64/64 | 4 | 4 | 0 | reached |
| proposeCovenant | 64/64 | 0 | 0 | 0 | not_reached |
| proposeTrade | 64/64 | 0 | 0 | 0 | not_reached |
| readBook | 64/64 | 25 | 32 | 32 | reached |
| renderFat | 64/64 | 0 | 0 | 0 | not_reached |
| takeMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 64/64 | 26 | 124 | 124 | reached |
| takeWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| tbEnd | 64/64 | 64 | 1122 | 0 | reached |
| traderSell | 64/64 | 37 | 168 | 168 | reached |
| visitorBuyWare | 64/64 | 28 | 30 | 30 | reached |
| visitorWares | 64/64 | 64 | 4750 | 4750 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 1 | 0 | 0 | ready_unused |
| bark_armor | 64 | 6 | 7 | 5 | produced |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 22 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 6 | 0 | 0 | ready_unused |
| cook_spit | 1 | 1 | 0 | 0 | ready_unused |
| crossbow | 13 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 15 | 1 | 0 | 0 | ready_unused |
| deadfall | 3 | 1 | 0 | 0 | ready_unused |
| decoy_rattle | 4 | 1 | 0 | 0 | ready_unused |
| drying_rack | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 17 | 0 | 0 | 0 | known_no_material_sample |
| fish_weir | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 27 | 10 | 22 | 11 | produced |
| hunting_spear | 14 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 4 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 30 | 23 | 0 | 0 | ready_unused |
| sharpened_stick | 36 | 29 | 0 | 0 | ready_unused |
| sling | 15 | 2 | 0 | 0 | ready_unused |
| snare | 52 | 28 | 137 | 115 | produced |
| spring_snare | 18 | 7 | 0 | 0 | ready_unused |
| stone_knife | 64 | 12 | 27 | 26 | produced |
| trotline | 3 | 0 | 0 | 0 | known_no_material_sample |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 168 | 3 |
| npc/capstone | 57 | 1 |
| npc/contest | 446 | 215 |
| npc/show | 7 | 0 |
| player/capstone | 14 | 3 |
| player/combat | 4 | 4 |
| player/contest | 520 | 282 |
| player/corpse-monster | 17 | 2 |
| player/corpse-person | 64 | 6 |
| player/corpse-villager | 1453 | 107 |
| player/craft | 42 | 0 |
| player/fan-package | 823 | 324 |
| player/fan-vote | 229 | 0 |
| player/patron | 73 | 0 |
| player/show | 105 | 28 |
| player/trade | 30 | 0 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 855,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 66026,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 1180,
      "deadPerson": 19
    },
    "gods": {
      "notResident": 338,
      "currentBearer": 415,
      "deadPerson": 11
    }
  },
  "holderDays": {
    "classes": {
      "forager/feaster": {
        "runs": 36,
        "holderDays": 3043,
        "holderIdentitiesAcrossRuns": 47
      },
      "hunter/stalker": {
        "runs": 24,
        "holderDays": 1175,
        "holderIdentitiesAcrossRuns": 30
      },
      "survivalist/furnace": {
        "runs": 9,
        "holderDays": 534,
        "holderIdentitiesAcrossRuns": 9
      },
      "hunter/beastmaster": {
        "runs": 4,
        "holderDays": 150,
        "holderIdentitiesAcrossRuns": 4
      },
      "socialite/showrunner": {
        "runs": 15,
        "holderDays": 484,
        "holderIdentitiesAcrossRuns": 18
      },
      "forager/gardener": {
        "runs": 28,
        "holderDays": 1884,
        "holderIdentitiesAcrossRuns": 36
      },
      "socialite/demagogue": {
        "runs": 9,
        "holderDays": 315,
        "holderIdentitiesAcrossRuns": 9
      },
      "caregiver/healer": {
        "runs": 10,
        "holderDays": 408,
        "holderIdentitiesAcrossRuns": 10
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 1,
        "holderDays": 40,
        "holderIdentitiesAcrossRuns": 1
      },
      "living_garden": {
        "runs": 40,
        "holderDays": 2250,
        "holderIdentitiesAcrossRuns": 55
      },
      "voice_of_the_relay": {
        "runs": 1,
        "holderDays": 48,
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
    "hunter/stalker": 18,
    "explorer/cartographer": 3,
    "socialite/showrunner": 12,
    "socialite/demagogue": 4,
    "forager/feaster": 10,
    "forager/gardener": 9,
    "hunter/beastmaster": 4,
    "drifter/trickster": 8,
    "caregiver/healer": 1,
    "survivalist/furnace": 2,
    "caregiver/keeper": 1
  },
  "npcClasses": {
    "forager/feaster": 36,
    "hunter/stalker": 24,
    "hunter/beastmaster": 4,
    "socialite/showrunner": 15,
    "survivalist/furnace": 9,
    "forager/gardener": 28,
    "socialite/demagogue": 9,
    "caregiver/healer": 10
  },
  "playerGods": {
    "voice_of_the_relay": 8,
    "living_garden": 11,
    "unkillable": 2,
    "shepherd_of_the_dead": 1
  },
  "npcGods": {
    "apex_predator": 1,
    "living_garden": 40,
    "voice_of_the_relay": 1
  },
  "winningEndings": {
    "feared/none/none/light": 5,
    "beloved/none/none/light": 4,
    "feared/socialite/demagogue/light": 1,
    "beloved/forager/gardener/light": 3,
    "beloved/socialite/demagogue/light": 1,
    "relay/forager/feaster/light": 2,
    "beloved/forager/feaster/light": 4,
    "beloved/socialite/showrunner/light": 1,
    "beloved/hunter/stalker/light": 2,
    "feared/hunter/stalker/light": 2,
    "beloved/drifter/trickster/light": 1,
    "relay/socialite/demagogue/light": 1,
    "relay/socialite/showrunner/light": 1,
    "beloved/caregiver/keeper/light": 1,
    "feared/socialite/showrunner/light": 1,
    "feared/forager/feaster/light": 1,
    "witness/hunter/stalker/light": 1
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
      "sum": 79163,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 2515,
      "reportedRuns": 63
    },
    "livelihoodPatients": {
      "sum": 3344,
      "reportedRuns": 64
    },
    "livelihoodComforts": {
      "sum": 637,
      "reportedRuns": 64
    },
    "livelihoodTreatments": {
      "sum": 304,
      "reportedRuns": 47
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 675,
      "reportedRuns": 61
    },
    "convoPageHiddenSelections": {
      "sum": 19,
      "reportedRuns": 16
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 64/64 | 64 | 936 | 936 | reached |
| _contestResolveOthers | 64/64 | 64 | 564 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 64 | 280 | 88 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 50 | 84 | 84 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 54 | 114 | 114 | reached |
| _cxPrizeSynergyHint | 64/64 | 63 | 323 | 289 | reached |
| _showEnd | 64/64 | 64 | 433 | 433 | reached |
| _showVillagerEnd | 64/64 | 60 | 169 | 169 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 2630 | 926 | reached |
| apClubBoon | 64/64 | 64 | 7068 | 248 | reached |
| apDeadDrop | 64/64 | 64 | 7068 | 1803 | reached |
| apPersonaPackage | 64/64 | 64 | 1439 | 27 | reached |
| cleanCarcass | 64/64 | 32 | 794 | 0 | reached |
| comfort | 64/64 | 64 | 706 | 641 | reached |
| corpseLootAll | 64/64 | 64 | 1036 | 1036 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 32 | 226 | 170 | reached |
| doAction | 64/64 | 64 | 54366 | 39826 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 54 | 207 | 206 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 48137 | 0 | reached |
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
| tbEnd | 64/64 | 64 | 1173 | 0 | reached |
| traderSell | 64/64 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 64/64 | 0 | 0 | 0 | not_reached |
| visitorWares | 64/64 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 64 | 8 | 15 | 3 | produced |
| bolt | 2 | 1 | 0 | 0 | ready_unused |
| bow | 9 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 6 | 0 | 0 | ready_unused |
| crossbow | 13 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 10 | 1 | 0 | 0 | ready_unused |
| decoy_rattle | 3 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 11 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 5 | 2 | 0 | 0 | ready_unused |
| hunting_spear | 16 | 1 | 0 | 0 | ready_unused |
| pit_trap | 27 | 21 | 0 | 0 | ready_unused |
| sharpened_stick | 31 | 28 | 0 | 0 | ready_unused |
| sling | 11 | 2 | 0 | 0 | ready_unused |
| snare | 48 | 27 | 189 | 147 | produced |
| stone_knife | 64 | 8 | 22 | 20 | produced |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 149 | 2 |
| npc/capstone | 67 | 2 |
| npc/contest | 526 | 261 |
| npc/show | 2 | 0 |
| player/capstone | 19 | 3 |
| player/combat | 1 | 1 |
| player/contest | 581 | 343 |
| player/corpse-monster | 19 | 1 |
| player/corpse-person | 78 | 10 |
| player/corpse-villager | 1299 | 171 |
| player/craft | 23 | 0 |
| player/fan-package | 926 | 400 |
| player/fan-vote | 245 | 0 |
| player/patron | 8 | 0 |
| player/show | 108 | 36 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 819,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 72805,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 1264
    },
    "gods": {
      "currentBearer": 797,
      "notResident": 457
    }
  },
  "holderDays": {
    "classes": {
      "forager/feaster": {
        "runs": 35,
        "holderDays": 3159,
        "holderIdentitiesAcrossRuns": 49
      },
      "hunter/stalker": {
        "runs": 22,
        "holderDays": 1144,
        "holderIdentitiesAcrossRuns": 28
      },
      "forager/gardener": {
        "runs": 33,
        "holderDays": 2371,
        "holderIdentitiesAcrossRuns": 40
      },
      "socialite/demagogue": {
        "runs": 18,
        "holderDays": 534,
        "holderIdentitiesAcrossRuns": 19
      },
      "socialite/showrunner": {
        "runs": 18,
        "holderDays": 563,
        "holderIdentitiesAcrossRuns": 22
      },
      "hunter/beastmaster": {
        "runs": 7,
        "holderDays": 317,
        "holderIdentitiesAcrossRuns": 7
      },
      "caregiver/healer": {
        "runs": 6,
        "holderDays": 315,
        "holderIdentitiesAcrossRuns": 6
      },
      "survivalist/furnace": {
        "runs": 7,
        "holderDays": 279,
        "holderIdentitiesAcrossRuns": 7
      }
    },
    "gods": {
      "living_garden": {
        "runs": 42,
        "holderDays": 2644,
        "holderIdentitiesAcrossRuns": 65
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
    "socialite/showrunner": 20,
    "hunter/stalker": 20,
    "brawler/juggernaut": 2,
    "forager/feaster": 5,
    "forager/gardener": 19,
    "socialite/demagogue": 5,
    "drifter/trickster": 7,
    "explorer/seer": 2,
    "survivalist/furnace": 4,
    "explorer/cartographer": 2,
    "caregiver/healer": 2
  },
  "npcClasses": {
    "forager/feaster": 35,
    "hunter/stalker": 23,
    "forager/gardener": 33,
    "socialite/demagogue": 18,
    "socialite/showrunner": 18,
    "hunter/beastmaster": 7,
    "caregiver/healer": 6,
    "survivalist/furnace": 7
  },
  "playerGods": {
    "voice_of_the_relay": 15,
    "one_person_army": 2,
    "living_garden": 21,
    "the_between": 1,
    "shepherd_of_the_dead": 1
  },
  "npcGods": {
    "living_garden": 42,
    "apex_predator": 1
  },
  "winningEndings": {
    "feared/socialite/showrunner/light": 3,
    "beloved/forager/gardener/light": 5,
    "feared/forager/gardener/light": 1,
    "relay/forager/gardener/light": 2,
    "beloved/none/none/light": 3,
    "feared/hunter/stalker/light": 3,
    "relay/hunter/stalker/light": 1,
    "assimilated/forager/gardener/light": 1,
    "feared/none/none/light": 3,
    "defiant/forager/gardener/light": 1,
    "feared/drifter/trickster/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "feared/socialite/demagogue/light": 1,
    "relay/socialite/showrunner/light": 1,
    "relay/none/none/light": 1,
    "indispensable/survivalist/furnace/light": 1,
    "beloved/caregiver/healer/light": 1
  }
}
```
