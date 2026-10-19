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
      "sum": 28880,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 14260,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 623,
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
| _contestEnd | 16/16 | 16 | 154 | 154 | reached |
| _contestResolveOthers | 16/16 | 16 | 91 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 53 | 26 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 18 | 18 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 9 | 13 | 13 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 47 | 46 | reached |
| _showEnd | 16/16 | 16 | 62 | 62 | reached |
| _showVillagerEnd | 16/16 | 12 | 22 | 22 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 443 | 116 | reached |
| apClubBoon | 16/16 | 16 | 1163 | 15 | reached |
| apDeadDrop | 16/16 | 16 | 1163 | 296 | reached |
| apPersonaPackage | 16/16 | 16 | 225 | 13 | reached |
| cleanCarcass | 16/16 | 13 | 292 | 0 | reached |
| comfort | 16/16 | 1 | 1 | 1 | reached |
| corpseLootAll | 16/16 | 16 | 258 | 258 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 9 | 61 | 55 | reached |
| doAction | 16/16 | 16 | 9786 | 7086 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 3 | 3 | 3 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 6338 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 501 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 3 | 1 | 0 | attempted_no_success |
| bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 1 | 0 | 0 | ready_unused |
| crossbow | 3 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 5 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 7 | 3 | 0 | 0 | ready_unused |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 7 | 6 | 0 | 0 | ready_unused |
| sharpened_stick | 13 | 13 | 0 | 0 | ready_unused |
| sling | 3 | 1 | 0 | 0 | ready_unused |
| snare | 14 | 10 | 55 | 50 | produced |
| stone_knife | 16 | 1 | 5 | 5 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 46 | 2 |
| npc/capstone | 5 | 1 |
| npc/contest | 57 | 35 |
| player/capstone | 3 | 0 |
| player/combat | 1 | 1 |
| player/contest | 109 | 55 |
| player/corpse-monster | 8 | 1 |
| player/corpse-person | 25 | 1 |
| player/corpse-villager | 423 | 35 |
| player/craft | 5 | 0 |
| player/fan-package | 116 | 39 |
| player/fan-vote | 15 | 0 |
| player/patron | 5 | 0 |
| player/show | 12 | 3 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 219,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 11905,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 47
    },
    "gods": {
      "currentBearer": 36,
      "notResident": 3
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 3,
        "holderDays": 112,
        "holderIdentitiesAcrossRuns": 4
      },
      "forager/feaster": {
        "runs": 8,
        "holderDays": 259,
        "holderIdentitiesAcrossRuns": 9
      },
      "forager/gardener": {
        "runs": 7,
        "holderDays": 247,
        "holderIdentitiesAcrossRuns": 8
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 31,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 62,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 1,
        "holderDays": 7,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 4,
        "holderDays": 47,
        "holderIdentitiesAcrossRuns": 4
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
    "hunter/stalker": 7,
    "forager/gardener": 7,
    "socialite/showrunner": 4,
    "hunter/beastmaster": 1,
    "forager/feaster": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "hunter/stalker": 3,
    "forager/feaster": 8,
    "forager/gardener": 7,
    "caregiver/healer": 1,
    "socialite/showrunner": 1,
    "survivalist/furnace": 1
  },
  "playerGods": {
    "living_garden": 3,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 4,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "feared/hunter/stalker/light": 1,
    "feared/none/none/light": 2,
    "beloved/none/none/light": 2,
    "beloved/socialite/showrunner/light": 1,
    "relay/none/none/light": 4,
    "witness/none/none/light": 2,
    "beloved/forager/gardener/light": 2,
    "beloved/forager/feaster/light": 1,
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
      "sum": 37784,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 17084,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 654,
      "reportedRuns": 16
    },
    "livelihoodKnowledgeTrips": {
      "sum": 230,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 226,
      "reportedRuns": 16
    },
    "livelihoodBooksRead": {
      "sum": 6,
      "reportedRuns": 6
    },
    "livelihoodRuinSearches": {
      "sum": 13,
      "reportedRuns": 13
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 152,
      "reportedRuns": 15
    },
    "livelihoodSales": {
      "sum": 52,
      "reportedRuns": 8
    },
    "livelihoodBuys": {
      "sum": 6,
      "reportedRuns": 5
    },
    "livelihoodHideHandledUnits": {
      "sum": 29,
      "reportedRuns": 10
    },
    "livelihoodHideTrials": {
      "sum": 10,
      "reportedRuns": 6
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 6,
      "reportedRuns": 6
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
    "livelihoodMaterialUnits": {
      "sum": 4,
      "reportedRuns": 2
    },
    "livelihoodMaterialTakes": {
      "sum": 4,
      "reportedRuns": 2
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
| _contestEnd | 16/16 | 16 | 222 | 222 | reached |
| _contestResolveOthers | 16/16 | 16 | 136 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 72 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 30 | 30 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 89 | 85 | reached |
| _showEnd | 16/16 | 16 | 120 | 120 | reached |
| _showVillagerEnd | 16/16 | 14 | 35 | 35 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 655 | 222 | reached |
| apClubBoon | 16/16 | 16 | 1727 | 68 | reached |
| apDeadDrop | 16/16 | 16 | 1727 | 440 | reached |
| apPersonaPackage | 16/16 | 16 | 362 | 19 | reached |
| cleanCarcass | 16/16 | 13 | 292 | 0 | reached |
| comfort | 16/16 | 1 | 2 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 289 | 289 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 9 | 88 | 76 | reached |
| doAction | 16/16 | 16 | 14479 | 10013 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 3 | 6 | 6 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11406 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 1 | 1 | 0 | reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 6 | 6 | 6 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 10 | 39 | 39 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 252 | 0 | reached |
| traderSell | 16/16 | 8 | 52 | 52 | reached |
| visitorBuyWare | 16/16 | 5 | 6 | 6 | reached |
| visitorWares | 16/16 | 16 | 1252 | 1252 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 4 | 2 | 1 | produced |
| bow | 4 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 5 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 1 | 0 | 0 | 0 | known_no_material_sample |
| fish_weir | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 10 | 2 | 12 | 8 | produced |
| hunting_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 8 | 7 | 0 | 0 | ready_unused |
| sharpened_stick | 13 | 12 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 12 | 7 | 69 | 63 | produced |
| spring_snare | 2 | 2 | 0 | 0 | ready_unused |
| stone_knife | 16 | 2 | 5 | 4 | produced |
| trotline | 1 | 0 | 0 | 0 | known_no_material_sample |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 59 | 4 |
| npc/capstone | 20 | 1 |
| npc/contest | 122 | 44 |
| npc/show | 1 | 1 |
| player/capstone | 4 | 2 |
| player/combat | 1 | 1 |
| player/contest | 148 | 79 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 26 | 2 |
| player/corpse-villager | 351 | 26 |
| player/craft | 13 | 0 |
| player/fan-package | 222 | 90 |
| player/fan-vote | 68 | 0 |
| player/patron | 6 | 0 |
| player/show | 24 | 10 |
| player/trade | 6 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 223,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 17581,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 400
    },
    "gods": {
      "notResident": 195,
      "currentBearer": 117
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 11,
        "holderDays": 628,
        "holderIdentitiesAcrossRuns": 13
      },
      "hunter/stalker": {
        "runs": 6,
        "holderDays": 203,
        "holderIdentitiesAcrossRuns": 8
      },
      "socialite/demagogue": {
        "runs": 5,
        "holderDays": 180,
        "holderIdentitiesAcrossRuns": 6
      },
      "forager/feaster": {
        "runs": 10,
        "holderDays": 777,
        "holderIdentitiesAcrossRuns": 14
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 65,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 169,
        "holderIdentitiesAcrossRuns": 4
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 104,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 12,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 13,
        "holderDays": 670,
        "holderIdentitiesAcrossRuns": 19
      },
      "shepherd_of_the_dead": {
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
    "hunter/stalker": 8,
    "hunter/beastmaster": 3,
    "forager/feaster": 2,
    "socialite/showrunner": 1,
    "socialite/demagogue": 1,
    "drifter/trickster": 2,
    "forager/gardener": 1,
    "survivalist/furnace": 1
  },
  "npcClasses": {
    "forager/gardener": 11,
    "hunter/stalker": 6,
    "socialite/demagogue": 5,
    "caregiver/healer": 1,
    "forager/feaster": 10,
    "socialite/showrunner": 4,
    "survivalist/furnace": 1,
    "hunter/beastmaster": 1
  },
  "playerGods": {
    "apex_predator": 1,
    "living_garden": 3,
    "unkillable": 1
  },
  "npcGods": {
    "living_garden": 13,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "feared/hunter/stalker/light": 2,
    "beloved/hunter/stalker/light": 1,
    "beloved/hunter/beastmaster/light": 1,
    "feared/none/none/light": 1,
    "feared/drifter/trickster/light": 1,
    "assimilated/forager/gardener/light": 1
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
      "sum": 33770,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 15970,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 628,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 216,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 123,
      "reportedRuns": 16
    },
    "livelihoodSales": {
      "sum": 63,
      "reportedRuns": 10
    },
    "livelihoodBuys": {
      "sum": 9,
      "reportedRuns": 8
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 180 | 180 | reached |
| _contestResolveOthers | 16/16 | 16 | 101 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 49 | 21 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 9 | 13 | 13 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 24 | 24 | reached |
| _cxPrizeSynergyHint | 16/16 | 14 | 51 | 49 | reached |
| _showEnd | 16/16 | 15 | 91 | 91 | reached |
| _showVillagerEnd | 16/16 | 14 | 36 | 36 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 554 | 197 | reached |
| apClubBoon | 16/16 | 16 | 1488 | 54 | reached |
| apDeadDrop | 16/16 | 16 | 1488 | 388 | reached |
| apPersonaPackage | 16/16 | 16 | 297 | 9 | reached |
| cleanCarcass | 16/16 | 12 | 359 | 0 | reached |
| comfort | 16/16 | 0 | 0 | 0 | not_reached |
| corpseLootAll | 16/16 | 16 | 654 | 654 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 8 | 57 | 48 | reached |
| doAction | 16/16 | 16 | 12538 | 8545 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 4 | 4 | 4 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 9171 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 230 | 0 | reached |
| traderSell | 16/16 | 10 | 63 | 63 | reached |
| visitorBuyWare | 16/16 | 8 | 9 | 9 | reached |
| visitorWares | 16/16 | 16 | 1203 | 1203 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 2 | 1 | 0 | attempted_no_success |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 2 | 0 | 0 | ready_unused |
| crossbow | 3 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 1 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 10 | 9 | 0 | 0 | ready_unused |
| sharpened_stick | 9 | 9 | 0 | 0 | ready_unused |
| sling | 6 | 0 | 0 | 0 | known_no_material_sample |
| snare | 13 | 8 | 54 | 46 | produced |
| stone_knife | 16 | 0 | 2 | 2 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 82 | 5 |
| npc/capstone | 20 | 1 |
| npc/contest | 91 | 41 |
| npc/show | 2 | 0 |
| player/capstone | 1 | 0 |
| player/contest | 119 | 64 |
| player/corpse-monster | 7 | 1 |
| player/corpse-person | 6 | 0 |
| player/corpse-villager | 312 | 19 |
| player/craft | 2 | 0 |
| player/fan-package | 197 | 57 |
| player/fan-vote | 54 | 0 |
| player/patron | 5 | 0 |
| player/show | 29 | 7 |
| player/trade | 9 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 217,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 15074,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 237
    },
    "gods": {
      "notResident": 105,
      "currentBearer": 68
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 9,
        "holderDays": 481,
        "holderIdentitiesAcrossRuns": 11
      },
      "hunter/stalker": {
        "runs": 3,
        "holderDays": 59,
        "holderIdentitiesAcrossRuns": 3
      },
      "forager/feaster": {
        "runs": 10,
        "holderDays": 654,
        "holderIdentitiesAcrossRuns": 13
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 114,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/demagogue": {
        "runs": 3,
        "holderDays": 85,
        "holderIdentitiesAcrossRuns": 3
      },
      "socialite/showrunner": {
        "runs": 3,
        "holderDays": 73,
        "holderIdentitiesAcrossRuns": 3
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 78,
        "holderIdentitiesAcrossRuns": 2
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 42,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 11,
        "holderDays": 476,
        "holderIdentitiesAcrossRuns": 19
      },
      "shepherd_of_the_dead": {
        "runs": 1,
        "holderDays": 49,
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
    "hunter/stalker": 3,
    "forager/feaster": 2,
    "survivalist/furnace": 1,
    "forager/gardener": 4,
    "drifter/trickster": 2,
    "socialite/showrunner": 2
  },
  "npcClasses": {
    "forager/gardener": 9,
    "hunter/stalker": 3,
    "caregiver/healer": 2,
    "forager/feaster": 10,
    "socialite/demagogue": 3,
    "socialite/showrunner": 3,
    "hunter/beastmaster": 2,
    "survivalist/furnace": 1
  },
  "playerGods": {
    "living_garden": 4,
    "voice_of_the_relay": 2
  },
  "npcGods": {
    "living_garden": 11,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "witness/hunter/stalker/light": 1,
    "relay/forager/feaster/light": 1,
    "beloved/none/none/light": 3,
    "feared/none/none/light": 2,
    "feared/drifter/trickster/light": 1,
    "feared/socialite/showrunner/light": 1,
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
      "sum": 36391,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 17266,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 685,
      "reportedRuns": 16
    },
    "livelihoodPatients": {
      "sum": 742,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 156,
      "reportedRuns": 15
    },
    "livelihoodComforts": {
      "sum": 160,
      "reportedRuns": 16
    },
    "livelihoodTreatments": {
      "sum": 63,
      "reportedRuns": 10
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 16/16 | 16 | 192 | 192 | reached |
| _contestResolveOthers | 16/16 | 16 | 119 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 49 | 15 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 14 | 26 | 26 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 15 | 31 | 31 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 59 | 54 | reached |
| _showEnd | 16/16 | 16 | 118 | 118 | reached |
| _showVillagerEnd | 16/16 | 15 | 39 | 39 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 565 | 212 | reached |
| apClubBoon | 16/16 | 16 | 1556 | 50 | reached |
| apDeadDrop | 16/16 | 16 | 1556 | 398 | reached |
| apPersonaPackage | 16/16 | 16 | 287 | 1 | reached |
| cleanCarcass | 16/16 | 10 | 238 | 0 | reached |
| comfort | 16/16 | 16 | 162 | 160 | reached |
| corpseLootAll | 16/16 | 16 | 318 | 318 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 6 | 45 | 38 | reached |
| doAction | 16/16 | 16 | 12845 | 9155 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 2 | 2 | 2 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 9743 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 239 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 1 | 1 | 1 | produced |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 4 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 2 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 7 | 7 | 0 | 0 | ready_unused |
| sharpened_stick | 11 | 11 | 0 | 0 | ready_unused |
| sling | 3 | 0 | 0 | 0 | known_no_material_sample |
| snare | 12 | 7 | 41 | 34 | produced |
| stone_knife | 16 | 3 | 3 | 3 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 47 | 3 |
| npc/capstone | 15 | 0 |
| npc/contest | 102 | 59 |
| npc/show | 3 | 0 |
| player/capstone | 3 | 0 |
| player/contest | 122 | 63 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 13 | 0 |
| player/corpse-villager | 305 | 16 |
| player/craft | 4 | 0 |
| player/fan-package | 212 | 72 |
| player/fan-vote | 50 | 0 |
| player/show | 34 | 10 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 205,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16585,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 103
    },
    "gods": {
      "currentBearer": 103,
      "notResident": 30
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 3,
        "holderDays": 142,
        "holderIdentitiesAcrossRuns": 5
      },
      "forager/gardener": {
        "runs": 9,
        "holderDays": 554,
        "holderIdentitiesAcrossRuns": 11
      },
      "socialite/demagogue": {
        "runs": 3,
        "holderDays": 130,
        "holderIdentitiesAcrossRuns": 4
      },
      "hunter/beastmaster": {
        "runs": 2,
        "holderDays": 51,
        "holderIdentitiesAcrossRuns": 2
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 135,
        "holderIdentitiesAcrossRuns": 5
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 422,
        "holderIdentitiesAcrossRuns": 9
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 59,
        "holderIdentitiesAcrossRuns": 1
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 62,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "living_garden": {
        "runs": 10,
        "holderDays": 468,
        "holderIdentitiesAcrossRuns": 15
      }
    }
  }
}
```

Class/god distributions count runs observing each build; a run may observe several. Current NPC observations require a known living resident other than the current bearer at the time. Legacy rows without eligibility may include stale/self records. Ending bins count unique winning builds per run.

```json
{
  "playerClasses": {
    "socialite/showrunner": 1,
    "hunter/stalker": 3,
    "explorer/seer": 1,
    "forager/gardener": 3,
    "forager/feaster": 2,
    "drifter/trickster": 2,
    "survivalist/furnace": 1
  },
  "npcClasses": {
    "hunter/stalker": 3,
    "forager/gardener": 9,
    "socialite/demagogue": 3,
    "hunter/beastmaster": 2,
    "socialite/showrunner": 4,
    "caregiver/healer": 1,
    "forager/feaster": 7,
    "survivalist/furnace": 1
  },
  "playerGods": {
    "voice_of_the_relay": 1,
    "living_garden": 2,
    "the_between": 1
  },
  "npcGods": {
    "living_garden": 10
  },
  "winningEndings": {
    "beloved/socialite/showrunner/light": 1,
    "feared/hunter/stalker/light": 1,
    "beloved/none/none/light": 3,
    "beloved/explorer/seer/light": 1,
    "feared/none/none/light": 1,
    "witness/none/none/light": 1,
    "beloved/forager/gardener/light": 2,
    "beloved/drifter/trickster/light": 1,
    "witness/forager/feaster/light": 1
  }
}
```
