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
      "sum": 14470,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 639,
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
| _contestEnd | 16/16 | 16 | 146 | 146 | reached |
| _contestResolveOthers | 16/16 | 16 | 103 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 39 | 14 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 9 | 14 | 14 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 8 | 14 | 14 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 43 | 41 | reached |
| _showEnd | 16/16 | 16 | 72 | 72 | reached |
| _showVillagerEnd | 16/16 | 11 | 27 | 27 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 419 | 119 | reached |
| apClubBoon | 16/16 | 16 | 1192 | 20 | reached |
| apDeadDrop | 16/16 | 16 | 1192 | 307 | reached |
| apPersonaPackage | 16/16 | 16 | 260 | 17 | reached |
| cleanCarcass | 16/16 | 12 | 150 | 0 | reached |
| comfort | 16/16 | 3 | 12 | 5 | reached |
| corpseLootAll | 16/16 | 16 | 222 | 222 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 82 | 68 | reached |
| doAction | 16/16 | 16 | 9660 | 7078 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 39 | 37 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 7538 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 470 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 4 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 7 | 2 | 0 | 0 | ready_unused |
| hunting_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 5 | 0 | 0 | ready_unused |
| sling | 7 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 9 | 74 | 61 | produced |
| stone_knife | 16 | 4 | 8 | 7 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 95 | 0 |
| npc/capstone | 8 | 0 |
| npc/contest | 89 | 52 |
| player/capstone | 3 | 0 |
| player/combat | 1 | 1 |
| player/contest | 87 | 53 |
| player/corpse-monster | 6 | 0 |
| player/corpse-person | 36 | 1 |
| player/corpse-villager | 525 | 70 |
| player/craft | 7 | 0 |
| player/fan-package | 119 | 34 |
| player/fan-vote | 20 | 0 |
| player/patron | 10 | 0 |
| player/show | 17 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 221,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 11735,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 117
    },
    "gods": {
      "notResident": 37,
      "currentBearer": 57
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 9,
        "holderDays": 364,
        "holderIdentitiesAcrossRuns": 14
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 37,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/stalker": {
        "runs": 5,
        "holderDays": 141,
        "holderIdentitiesAcrossRuns": 5
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 65,
        "holderIdentitiesAcrossRuns": 5
      },
      "forager/feaster": {
        "runs": 7,
        "holderDays": 225,
        "holderIdentitiesAcrossRuns": 8
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 97,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 7,
        "holderDays": 52,
        "holderIdentitiesAcrossRuns": 8
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
    "hunter/stalker": 4,
    "socialite/demagogue": 3,
    "socialite/showrunner": 6,
    "forager/gardener": 5,
    "hunter/beastmaster": 1
  },
  "npcClasses": {
    "forager/gardener": 9,
    "socialite/demagogue": 1,
    "hunter/stalker": 5,
    "socialite/showrunner": 4,
    "forager/feaster": 7,
    "caregiver/healer": 1
  },
  "playerGods": {
    "voice_of_the_relay": 2,
    "living_garden": 4
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
    "feared/hunter/stalker/light": 1,
    "feared/forager/gardener/light": 2,
    "beloved/forager/gardener/light": 2,
    "feared/none/none/light": 2
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
      "sum": 20501,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 763,
      "reportedRuns": 16
    },
    "livelihoodKnowledgeTrips": {
      "sum": 214,
      "reportedRuns": 16
    },
    "livelihoodHarvestTrips": {
      "sum": 247,
      "reportedRuns": 16
    },
    "livelihoodSales": {
      "sum": 120,
      "reportedRuns": 9
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 125,
      "reportedRuns": 14
    },
    "livelihoodBuys": {
      "sum": 13,
      "reportedRuns": 10
    },
    "livelihoodRuinSearches": {
      "sum": 13,
      "reportedRuns": 13
    },
    "livelihoodBooksRead": {
      "sum": 6,
      "reportedRuns": 6
    },
    "livelihoodCrafts": {
      "sum": 6,
      "reportedRuns": 5
    },
    "livelihoodHideHandledUnits": {
      "sum": 30,
      "reportedRuns": 10
    },
    "livelihoodHideTrials": {
      "sum": 11,
      "reportedRuns": 5
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 5,
      "reportedRuns": 5
    },
    "convoPageHiddenSelections": {
      "sum": 3,
      "reportedRuns": 3
    },
    "livelihoodMaterialUnits": {
      "sum": 6,
      "reportedRuns": 3
    },
    "livelihoodMaterialTakes": {
      "sum": 6,
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
| _contestEnd | 16/16 | 16 | 215 | 215 | reached |
| _contestResolveOthers | 16/16 | 16 | 120 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 48 | 13 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 14 | 25 | 25 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 12 | 21 | 21 | reached |
| _cxPrizeSynergyHint | 16/16 | 16 | 67 | 66 | reached |
| _showEnd | 16/16 | 16 | 109 | 109 | reached |
| _showVillagerEnd | 16/16 | 16 | 45 | 45 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 622 | 227 | reached |
| apClubBoon | 16/16 | 16 | 1746 | 66 | reached |
| apDeadDrop | 16/16 | 16 | 1746 | 446 | reached |
| apPersonaPackage | 16/16 | 16 | 352 | 34 | reached |
| cleanCarcass | 16/16 | 13 | 335 | 0 | reached |
| comfort | 16/16 | 4 | 11 | 0 | reached |
| corpseLootAll | 16/16 | 16 | 206 | 206 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 12 | 125 | 107 | reached |
| doAction | 16/16 | 16 | 14750 | 10384 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 12 | 101 | 101 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 12821 | 0 | reached |
| networkSummon | 16/16 | 0 | 0 | 0 | not_reached |
| orderMember | 16/16 | 0 | 0 | 0 | not_reached |
| preserveFood | 16/16 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 16/16 | 0 | 0 | 0 | not_reached |
| proposeTrade | 16/16 | 0 | 0 | 0 | not_reached |
| readBook | 16/16 | 6 | 6 | 6 | reached |
| renderFat | 16/16 | 0 | 0 | 0 | not_reached |
| takeMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 16/16 | 10 | 37 | 37 | reached |
| takeWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| tbEnd | 16/16 | 16 | 282 | 0 | reached |
| traderSell | 16/16 | 9 | 120 | 120 | reached |
| visitorBuyWare | 16/16 | 10 | 13 | 13 | reached |
| visitorWares | 16/16 | 16 | 1363 | 1363 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 1 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bolt | 1 | 1 | 0 | 0 | ready_unused |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 3 | 0 | 0 | 0 | known_no_material_sample |
| deadfall | 1 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 4 | 0 | 0 | 0 | known_no_material_sample |
| fish_weir | 1 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 11 | 2 | 15 | 9 | produced |
| hunting_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 6 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 2 | 0 | 0 | 0 | known_no_material_sample |
| sling | 4 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 9 | 96 | 87 | produced |
| spring_snare | 2 | 0 | 0 | 0 | known_no_material_sample |
| stone_knife | 16 | 6 | 14 | 11 | produced |
| trotline | 1 | 1 | 0 | 0 | ready_unused |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 63 | 2 |
| npc/capstone | 25 | 0 |
| npc/contest | 111 | 54 |
| player/capstone | 3 | 1 |
| player/contest | 131 | 68 |
| player/corpse-monster | 4 | 1 |
| player/corpse-person | 31 | 2 |
| player/corpse-villager | 236 | 14 |
| player/craft | 20 | 0 |
| player/fan-package | 227 | 84 |
| player/fan-vote | 66 | 0 |
| player/patron | 19 | 0 |
| player/show | 33 | 11 |
| player/trade | 13 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 209,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 17535,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 338
    },
    "gods": {
      "notResident": 171,
      "currentBearer": 71
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 14,
        "holderDays": 1232,
        "holderIdentitiesAcrossRuns": 21
      },
      "forager/feaster": {
        "runs": 8,
        "holderDays": 668,
        "holderIdentitiesAcrossRuns": 9
      },
      "hunter/stalker": {
        "runs": 9,
        "holderDays": 620,
        "holderIdentitiesAcrossRuns": 11
      },
      "socialite/showrunner": {
        "runs": 7,
        "holderDays": 196,
        "holderIdentitiesAcrossRuns": 8
      },
      "caregiver/healer": {
        "runs": 1,
        "holderDays": 70,
        "holderIdentitiesAcrossRuns": 1
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 19,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 14,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 14,
        "holderDays": 1066,
        "holderIdentitiesAcrossRuns": 25
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
    "hunter/stalker": 5,
    "forager/gardener": 4,
    "socialite/showrunner": 2,
    "caregiver/healer": 1,
    "forager/feaster": 2,
    "survivalist/furnace": 1,
    "drifter/trickster": 1
  },
  "npcClasses": {
    "forager/feaster": 8,
    "forager/gardener": 14,
    "hunter/stalker": 9,
    "socialite/showrunner": 7,
    "caregiver/healer": 1,
    "hunter/beastmaster": 1,
    "socialite/demagogue": 2
  },
  "playerGods": {
    "living_garden": 2,
    "shepherd_of_the_dead": 1,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "living_garden": 14
  },
  "winningEndings": {
    "feared/hunter/stalker/light": 1,
    "feared/forager/gardener/light": 1,
    "beloved/hunter/stalker/light": 2,
    "feared/socialite/showrunner/light": 1,
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
      "sum": 19328,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 676,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 8,
      "reportedRuns": 4
    },
    "livelihoodHarvestTrips": {
      "sum": 238,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 143,
      "reportedRuns": 15
    },
    "livelihoodSales": {
      "sum": 62,
      "reportedRuns": 9
    },
    "livelihoodBuys": {
      "sum": 12,
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
| _contestEnd | 16/16 | 16 | 238 | 238 | reached |
| _contestResolveOthers | 16/16 | 16 | 141 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 16 | 69 | 20 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 9 | 26 | 26 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 13 | 25 | 25 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 77 | 74 | reached |
| _showEnd | 16/16 | 16 | 91 | 91 | reached |
| _showVillagerEnd | 16/16 | 15 | 42 | 42 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 631 | 198 | reached |
| apClubBoon | 16/16 | 16 | 1711 | 55 | reached |
| apDeadDrop | 16/16 | 16 | 1711 | 429 | reached |
| apPersonaPackage | 16/16 | 16 | 308 | 0 | reached |
| cleanCarcass | 16/16 | 12 | 335 | 0 | reached |
| comfort | 16/16 | 6 | 21 | 3 | reached |
| corpseLootAll | 16/16 | 16 | 236 | 236 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 10 | 117 | 104 | reached |
| doAction | 16/16 | 16 | 14052 | 9761 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 97 | 97 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 12055 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 258 | 0 | reached |
| traderSell | 16/16 | 9 | 62 | 62 | reached |
| visitorBuyWare | 16/16 | 9 | 12 | 12 | reached |
| visitorWares | 16/16 | 16 | 1362 | 1362 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 0 | 0 | 0 | known_no_material_sample |
| bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 2 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 5 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 2 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 6 | 1 | 0 | 0 | ready_unused |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 7 | 6 | 0 | 0 | ready_unused |
| sling | 5 | 0 | 0 | 0 | known_no_material_sample |
| snare | 15 | 9 | 108 | 95 | produced |
| stone_knife | 16 | 5 | 9 | 9 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 91 | 0 |
| npc/capstone | 16 | 0 |
| npc/contest | 124 | 66 |
| player/capstone | 6 | 2 |
| player/contest | 150 | 96 |
| player/corpse-person | 31 | 0 |
| player/corpse-villager | 362 | 51 |
| player/craft | 9 | 0 |
| player/fan-package | 198 | 88 |
| player/fan-vote | 55 | 0 |
| player/show | 22 | 6 |
| player/trade | 12 | 0 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 212,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 17192,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 246
    },
    "gods": {
      "notResident": 115,
      "currentBearer": 86
    }
  },
  "holderDays": {
    "classes": {
      "hunter/stalker": {
        "runs": 7,
        "holderDays": 421,
        "holderIdentitiesAcrossRuns": 10
      },
      "forager/feaster": {
        "runs": 6,
        "holderDays": 475,
        "holderIdentitiesAcrossRuns": 8
      },
      "forager/gardener": {
        "runs": 11,
        "holderDays": 814,
        "holderIdentitiesAcrossRuns": 14
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 7,
        "holderIdentitiesAcrossRuns": 1
      },
      "socialite/showrunner": {
        "runs": 6,
        "holderDays": 361,
        "holderIdentitiesAcrossRuns": 9
      },
      "socialite/demagogue": {
        "runs": 1,
        "holderDays": 75,
        "holderIdentitiesAcrossRuns": 1
      },
      "caregiver/healer": {
        "runs": 3,
        "holderDays": 221,
        "holderIdentitiesAcrossRuns": 3
      },
      "survivalist/furnace": {
        "runs": 2,
        "holderDays": 59,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 12,
        "holderDays": 642,
        "holderIdentitiesAcrossRuns": 16
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
    "forager/gardener": 5,
    "explorer/cartographer": 1,
    "drifter/trickster": 2,
    "forager/feaster": 3,
    "survivalist/furnace": 1,
    "hunter/stalker": 2,
    "caregiver/healer": 1
  },
  "npcClasses": {
    "hunter/stalker": 7,
    "forager/feaster": 6,
    "forager/gardener": 11,
    "hunter/beastmaster": 1,
    "socialite/showrunner": 6,
    "caregiver/healer": 3,
    "socialite/demagogue": 1,
    "survivalist/furnace": 2
  },
  "playerGods": {
    "voice_of_the_relay": 3,
    "living_garden": 4,
    "shepherd_of_the_dead": 1
  },
  "npcGods": {
    "living_garden": 12
  },
  "winningEndings": {
    "feared/socialite/showrunner/light": 1,
    "beloved/none/none/light": 2,
    "beloved/socialite/showrunner/light": 1,
    "feared/forager/gardener/light": 1,
    "feared/drifter/trickster/light": 1,
    "feared/none/none/light": 1,
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
      "sum": 18473,
      "reportedRuns": 16
    },
    "convoPageNavigation": {
      "sum": 608,
      "reportedRuns": 16
    },
    "convoPageHiddenSelections": {
      "sum": 5,
      "reportedRuns": 4
    },
    "livelihoodPatients": {
      "sum": 731,
      "reportedRuns": 16
    },
    "livelihoodComforts": {
      "sum": 111,
      "reportedRuns": 16
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 173,
      "reportedRuns": 16
    },
    "livelihoodTreatments": {
      "sum": 31,
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
| _contestEnd | 16/16 | 16 | 199 | 199 | reached |
| _contestResolveOthers | 16/16 | 16 | 115 | 0 | reached |
| _cxPrizeAbilityOffer | 16/16 | 15 | 44 | 14 | reached |
| _cxPrizeEvolutionAssist | 16/16 | 12 | 20 | 20 | reached |
| _cxPrizeKnowledgeDump | 16/16 | 14 | 31 | 31 | reached |
| _cxPrizeSynergyHint | 16/16 | 15 | 61 | 59 | reached |
| _showEnd | 16/16 | 16 | 105 | 105 | reached |
| _showVillagerEnd | 16/16 | 15 | 37 | 37 | reached |
| answerCovenantCrisis | 16/16 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 16/16 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 16/16 | 0 | 0 | 0 | not_reached |
| apCarePackage | 16/16 | 16 | 582 | 203 | reached |
| apClubBoon | 16/16 | 16 | 1529 | 61 | reached |
| apDeadDrop | 16/16 | 16 | 1529 | 385 | reached |
| apPersonaPackage | 16/16 | 16 | 281 | 11 | reached |
| cleanCarcass | 16/16 | 11 | 247 | 0 | reached |
| comfort | 16/16 | 16 | 132 | 113 | reached |
| corpseLootAll | 16/16 | 16 | 157 | 157 | reached |
| corpseTakeItem | 16/16 | 0 | 0 | 0 | not_reached |
| craft | 16/16 | 11 | 113 | 100 | reached |
| doAction | 16/16 | 16 | 12784 | 9331 | reached |
| donateMedicine | 16/16 | 0 | 0 | 0 | not_reached |
| donateWeapon | 16/16 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 16/16 | 0 | 0 | 0 | not_reached |
| expandStorage | 16/16 | 0 | 0 | 0 | not_reached |
| giveFood | 16/16 | 11 | 34 | 34 | reached |
| makePemmican | 16/16 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 16/16 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 16/16 | 16 | 11652 | 0 | reached |
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
| tbEnd | 16/16 | 16 | 213 | 0 | reached |
| traderSell | 16/16 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 16/16 | 0 | 0 | 0 | not_reached |
| visitorWares | 16/16 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| bark_armor | 16 | 1 | 0 | 0 | ready_unused |
| bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 16 | 0 | 0 | 0 | known_no_material_sample |
| crossbow | 1 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 2 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 1 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 3 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 3 | 1 | 0 | 0 | ready_unused |
| hunting_spear | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 5 | 3 | 0 | 0 | ready_unused |
| sharpened_stick | 6 | 4 | 0 | 0 | ready_unused |
| sling | 5 | 0 | 0 | 0 | known_no_material_sample |
| snare | 14 | 6 | 105 | 94 | produced |
| stone_knife | 16 | 4 | 8 | 6 | produced |
| water_filter | 16 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 47 | 0 |
| npc/capstone | 13 | 1 |
| npc/contest | 104 | 45 |
| player/capstone | 2 | 0 |
| player/contest | 126 | 67 |
| player/corpse-monster | 3 | 0 |
| player/corpse-person | 9 | 0 |
| player/corpse-villager | 224 | 17 |
| player/craft | 6 | 0 |
| player/fan-package | 203 | 66 |
| player/fan-vote | 61 | 0 |
| player/show | 19 | 1 |

### NPC eligibility and sampled build exposure

16/16 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 16,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 189,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 16442,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 226
    },
    "gods": {
      "currentBearer": 47,
      "notResident": 45
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
        "runs": 11,
        "holderDays": 599,
        "holderIdentitiesAcrossRuns": 16
      },
      "forager/gardener": {
        "runs": 9,
        "holderDays": 673,
        "holderIdentitiesAcrossRuns": 11
      },
      "socialite/showrunner": {
        "runs": 4,
        "holderDays": 131,
        "holderIdentitiesAcrossRuns": 6
      },
      "forager/feaster": {
        "runs": 6,
        "holderDays": 274,
        "holderIdentitiesAcrossRuns": 7
      },
      "hunter/beastmaster": {
        "runs": 1,
        "holderDays": 71,
        "holderIdentitiesAcrossRuns": 1
      },
      "caregiver/healer": {
        "runs": 2,
        "holderDays": 139,
        "holderIdentitiesAcrossRuns": 2
      }
    },
    "gods": {
      "living_garden": {
        "runs": 10,
        "holderDays": 477,
        "holderIdentitiesAcrossRuns": 12
      },
      "shepherd_of_the_dead": {
        "runs": 1,
        "holderDays": 65,
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
    "hunter/stalker": 3,
    "caregiver/healer": 1,
    "forager/feaster": 1,
    "explorer/cartographer": 1
  },
  "npcClasses": {
    "forager/gardener": 9,
    "hunter/stalker": 11,
    "socialite/showrunner": 4,
    "survivalist/furnace": 2,
    "forager/feaster": 6,
    "hunter/beastmaster": 1,
    "caregiver/healer": 2
  },
  "playerGods": {
    "voice_of_the_relay": 3,
    "living_garden": 2
  },
  "npcGods": {
    "living_garden": 10,
    "shepherd_of_the_dead": 1
  },
  "winningEndings": {
    "feared/none/none/light": 2,
    "beloved/none/none/light": 2,
    "beloved/hunter/stalker/light": 1,
    "feared/socialite/showrunner/light": 1,
    "beloved/forager/gardener/light": 1,
    "feared/forager/feaster/light": 1,
    "witness/socialite/showrunner/light": 1,
    "relay/none/none/light": 1
  }
}
```
