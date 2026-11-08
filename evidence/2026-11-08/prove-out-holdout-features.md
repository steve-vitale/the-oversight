# Feature and build census

Calls/returned values are reachability diagnostics, not universal successes. Recipe readiness is sampled once per observed day; an absent sample does not prove materials never existed. Unknown recipes absent from both access and attempts are not enumerated. Bot nonuse alone does not establish a game defect.

## capable controller coverage

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
      "sum": 57299,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 4056,
      "reportedRuns": 64
    },
    "convoPageHiddenSelections": {
      "sum": 49,
      "reportedRuns": 28
    }
  }
}
```

## capable

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 64/64 | 64 | 566 | 566 | reached |
| _contestResolveOthers | 64/64 | 64 | 331 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 60 | 147 | 65 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 40 | 57 | 57 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 45 | 86 | 86 | reached |
| _cxPrizeSynergyHint | 64/64 | 58 | 162 | 145 | reached |
| _showEnd | 64/64 | 63 | 286 | 286 | reached |
| _showVillagerEnd | 64/64 | 49 | 87 | 87 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 1793 | 420 | reached |
| apClubBoon | 64/64 | 64 | 5238 | 75 | reached |
| apDeadDrop | 64/64 | 64 | 5238 | 1312 | reached |
| apPersonaPackage | 64/64 | 64 | 1055 | 46 | reached |
| cleanCarcass | 64/64 | 46 | 570 | 0 | reached |
| comfort | 64/64 | 23 | 74 | 11 | reached |
| corpseLootAll | 64/64 | 64 | 2210 | 2210 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 29 | 140 | 106 | reached |
| doAction | 64/64 | 64 | 36970 | 27133 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 64 | 2441 | 2441 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 33166 | 0 | reached |
| networkSummon | 64/64 | 0 | 0 | 0 | not_reached |
| orderMember | 64/64 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 64/64 | 1 | 1 | 1 | reached |
| preserveFood | 64/64 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 64/64 | 0 | 0 | 0 | not_reached |
| proposeTrade | 64/64 | 0 | 0 | 0 | not_reached |
| readBook | 64/64 | 0 | 0 | 0 | not_reached |
| renderFat | 64/64 | 0 | 0 | 0 | not_reached |
| takeMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 64/64 | 0 | 0 | 0 | not_reached |
| takeWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| tbEnd | 64/64 | 64 | 1574 | 0 | reached |
| traderSell | 64/64 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 64/64 | 0 | 0 | 0 | not_reached |
| visitorWares | 64/64 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 14 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 64 | 8 | 3 | 0 | attempted_no_success |
| bolt | 12 | 1 | 0 | 0 | ready_unused |
| bow | 11 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 2 | 0 | 0 | ready_unused |
| crossbow | 18 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 7 | 1 | 0 | 0 | ready_unused |
| decoy_rattle | 3 | 0 | 0 | 0 | known_no_material_sample |
| fire_hardened_spear | 15 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 29 | 3 | 2 | 0 | attempted_no_success |
| hunting_spear | 20 | 0 | 0 | 0 | known_no_material_sample |
| padded_cloth | 1 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 30 | 28 | 0 | 0 | ready_unused |
| sharpened_stick | 32 | 31 | 0 | 0 | ready_unused |
| sling | 9 | 1 | 0 | 0 | ready_unused |
| snare | 52 | 28 | 109 | 84 | produced |
| stone_knife | 64 | 11 | 26 | 22 | produced |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 1314 | 20 |
| npc/capstone | 8 | 8 |
| npc/care | 5 | 0 |
| npc/contest | 300 | 223 |
| npc/craft | 10 | 0 |
| player/capstone | 4 | 3 |
| player/combat | 1 | 1 |
| player/contest | 370 | 279 |
| player/corpse-monster | 46 | 10 |
| player/corpse-person | 65 | 4 |
| player/corpse-villager | 936 | 69 |
| player/craft | 22 | 0 |
| player/fan-package | 420 | 115 |
| player/fan-vote | 71 | 0 |
| player/patron | 9 | 0 |
| player/show | 59 | 12 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 831,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 48763,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 699
    },
    "gods": {
      "currentBearer": 29
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 22,
        "holderDays": 1064,
        "holderIdentitiesAcrossRuns": 30
      },
      "hunter/stalker": {
        "runs": 39,
        "holderDays": 1770,
        "holderIdentitiesAcrossRuns": 62
      },
      "socialite/demagogue": {
        "runs": 2,
        "holderDays": 21,
        "holderIdentitiesAcrossRuns": 2
      },
      "explorer/cartographer": {
        "runs": 1,
        "holderDays": 1,
        "holderIdentitiesAcrossRuns": 1
      },
      "forager/feaster": {
        "runs": 18,
        "holderDays": 668,
        "holderIdentitiesAcrossRuns": 20
      },
      "socialite/showrunner": {
        "runs": 7,
        "holderDays": 124,
        "holderIdentitiesAcrossRuns": 7
      },
      "hunter/beastmaster": {
        "runs": 12,
        "holderDays": 361,
        "holderIdentitiesAcrossRuns": 12
      },
      "survivalist/furnace": {
        "runs": 2,
        "holderDays": 28,
        "holderIdentitiesAcrossRuns": 2
      },
      "caregiver/healer": {
        "runs": 4,
        "holderDays": 273,
        "holderIdentitiesAcrossRuns": 4
      },
      "survivalist/undying": {
        "runs": 1,
        "holderDays": 43,
        "holderIdentitiesAcrossRuns": 1
      },
      "brawler/berserker": {
        "runs": 1,
        "holderDays": 14,
        "holderIdentitiesAcrossRuns": 1
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 6,
        "holderDays": 62,
        "holderIdentitiesAcrossRuns": 6
      },
      "shepherd_of_the_dead": {
        "runs": 2,
        "holderDays": 50,
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
    "forager/gardener": 10,
    "socialite/showrunner": 12,
    "forager/feaster": 7,
    "caregiver/healer": 4,
    "hunter/stalker": 16,
    "drifter/trickster": 2,
    "socialite/demagogue": 7,
    "caregiver/keeper": 1,
    "explorer/cartographer": 8,
    "hunter/beastmaster": 5,
    "shieldbearer/bulwark": 1
  },
  "npcClasses": {
    "forager/gardener": 22,
    "hunter/stalker": 40,
    "socialite/demagogue": 2,
    "explorer/cartographer": 1,
    "forager/feaster": 18,
    "socialite/showrunner": 7,
    "hunter/beastmaster": 12,
    "survivalist/furnace": 2,
    "caregiver/healer": 4,
    "brawler/berserker": 1,
    "survivalist/undying": 1
  },
  "playerGods": {
    "voice_of_the_relay": 6,
    "shepherd_of_the_dead": 2,
    "the_between": 1,
    "apex_predator": 2
  },
  "npcGods": {
    "apex_predator": 6,
    "shepherd_of_the_dead": 2
  },
  "winningEndings": {
    "feared/forager/gardener/light": 6,
    "feared/socialite/showrunner/light": 3,
    "feared/none/none/light": 11,
    "beloved/none/none/light": 5,
    "beloved/socialite/showrunner/light": 3,
    "beloved/hunter/stalker/light": 3,
    "beloved/caregiver/healer/light": 1,
    "witness/hunter/stalker/light": 1,
    "feared/socialite/demagogue/light": 3,
    "beloved/caregiver/keeper/light": 1,
    "beloved/forager/feaster/light": 2,
    "beloved/explorer/cartographer/light": 1,
    "feared/hunter/stalker/light": 3,
    "feared/forager/feaster/light": 2,
    "indispensable/socialite/showrunner/light": 1,
    "feared/explorer/cartographer/light": 1,
    "beloved/socialite/demagogue/light": 2,
    "relay/hunter/stalker/grey": 1,
    "relay/hunter/beastmaster/light": 1,
    "witness/none/none/light": 1,
    "indispensable/none/none/light": 1,
    "beloved/hunter/beastmaster/light": 2,
    "witness/forager/gardener/light": 1,
    "indispensable/hunter/stalker/light": 1
  }
}
```

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
      "sum": 72338,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 4139,
      "reportedRuns": 64
    },
    "convoPageHiddenSelections": {
      "sum": 63,
      "reportedRuns": 33
    },
    "livelihoodKnowledgeTrips": {
      "sum": 895,
      "reportedRuns": 63
    },
    "livelihoodRuinSearches": {
      "sum": 53,
      "reportedRuns": 53
    },
    "livelihoodHarvestTrips": {
      "sum": 630,
      "reportedRuns": 64
    },
    "livelihoodBuys": {
      "sum": 72,
      "reportedRuns": 30
    },
    "livelihoodSales": {
      "sum": 123,
      "reportedRuns": 31
    },
    "livelihoodBooksRead": {
      "sum": 35,
      "reportedRuns": 33
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 330,
      "reportedRuns": 60
    },
    "livelihoodCounterCooks": {
      "sum": 13,
      "reportedRuns": 8
    },
    "livelihoodCounterPreserves": {
      "sum": 9,
      "reportedRuns": 6
    },
    "livelihoodCounterStored": {
      "sum": 9,
      "reportedRuns": 6
    },
    "livelihoodCrafts": {
      "sum": 5,
      "reportedRuns": 5
    },
    "livelihoodHideHandledUnits": {
      "sum": 86,
      "reportedRuns": 27
    },
    "livelihoodHideTrials": {
      "sum": 31,
      "reportedRuns": 15
    },
    "livelihoodHideTrialSuccesses": {
      "sum": 7,
      "reportedRuns": 7
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
| _contestEnd | 64/64 | 64 | 792 | 792 | reached |
| _contestResolveOthers | 64/64 | 64 | 514 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 61 | 208 | 78 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 44 | 73 | 72 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 48 | 100 | 100 | reached |
| _cxPrizeSynergyHint | 64/64 | 60 | 241 | 226 | reached |
| _showEnd | 64/64 | 63 | 371 | 371 | reached |
| _showVillagerEnd | 64/64 | 56 | 147 | 147 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 2376 | 749 | reached |
| apClubBoon | 64/64 | 64 | 6802 | 217 | reached |
| apDeadDrop | 64/64 | 64 | 6802 | 1700 | reached |
| apPersonaPackage | 64/64 | 64 | 1366 | 96 | reached |
| cleanCarcass | 64/64 | 50 | 678 | 0 | reached |
| comfort | 64/64 | 21 | 69 | 18 | reached |
| corpseLootAll | 64/64 | 64 | 1999 | 1999 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 39 | 234 | 162 | reached |
| doAction | 64/64 | 64 | 49059 | 34681 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 64 | 3969 | 3969 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 42518 | 0 | reached |
| networkSummon | 64/64 | 0 | 0 | 0 | not_reached |
| orderMember | 64/64 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 64/64 | 0 | 0 | 0 | not_reached |
| preserveFood | 64/64 | 6 | 9 | 0 | reached |
| proposeCovenant | 64/64 | 0 | 0 | 0 | not_reached |
| proposeTrade | 64/64 | 0 | 0 | 0 | not_reached |
| readBook | 64/64 | 33 | 35 | 35 | reached |
| renderFat | 64/64 | 0 | 0 | 0 | not_reached |
| takeMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 64/64 | 28 | 127 | 127 | reached |
| takeWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| tbEnd | 64/64 | 64 | 1430 | 0 | reached |
| traderSell | 64/64 | 31 | 123 | 123 | reached |
| visitorBuyWare | 64/64 | 30 | 72 | 72 | reached |
| visitorWares | 64/64 | 64 | 3364 | 3364 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 20 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 64 | 5 | 1 | 0 | attempted_no_success |
| bolt | 16 | 4 | 2 | 1 | produced |
| bow | 17 | 0 | 0 | 0 | known_no_material_sample |
| braided_cord | 1 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 2 | 0 | 0 | ready_unused |
| crossbow | 20 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 16 | 0 | 0 | 0 | known_no_material_sample |
| deadfall | 5 | 2 | 0 | 0 | ready_unused |
| decoy_rattle | 3 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 21 | 0 | 0 | 0 | known_no_material_sample |
| fish_basket | 1 | 0 | 0 | 0 | known_no_material_sample |
| fish_weir | 2 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 34 | 13 | 37 | 10 | produced |
| hunting_spear | 20 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 33 | 30 | 0 | 0 | ready_unused |
| sharpened_stick | 36 | 33 | 0 | 0 | ready_unused |
| sling | 13 | 2 | 0 | 0 | ready_unused |
| snare | 53 | 33 | 168 | 126 | produced |
| spring_snare | 19 | 3 | 0 | 0 | ready_unused |
| stone_knife | 64 | 7 | 26 | 25 | produced |
| trotline | 2 | 0 | 0 | 0 | known_no_material_sample |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 1571 | 18 |
| npc/capstone | 8 | 7 |
| npc/care | 6 | 0 |
| npc/contest | 471 | 365 |
| npc/craft | 1 | 0 |
| npc/show | 4 | 0 |
| player/action | 22 | 0 |
| player/capstone | 5 | 2 |
| player/contest | 526 | 407 |
| player/corpse-monster | 43 | 11 |
| player/corpse-person | 134 | 16 |
| player/corpse-villager | 1347 | 132 |
| player/craft | 40 | 0 |
| player/fan-package | 749 | 272 |
| player/fan-vote | 205 | 0 |
| player/patron | 24 | 0 |
| player/show | 91 | 27 |
| player/trade | 72 | 13 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 870,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 58126,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 1010
    },
    "gods": {
      "currentBearer": 142,
      "notResident": 2
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 30,
        "holderDays": 1681,
        "holderIdentitiesAcrossRuns": 38
      },
      "hunter/stalker": {
        "runs": 43,
        "holderDays": 2760,
        "holderIdentitiesAcrossRuns": 61
      },
      "forager/feaster": {
        "runs": 27,
        "holderDays": 1717,
        "holderIdentitiesAcrossRuns": 32
      },
      "socialite/showrunner": {
        "runs": 16,
        "holderDays": 788,
        "holderIdentitiesAcrossRuns": 19
      },
      "socialite/demagogue": {
        "runs": 9,
        "holderDays": 480,
        "holderIdentitiesAcrossRuns": 13
      },
      "explorer/cartographer": {
        "runs": 7,
        "holderDays": 143,
        "holderIdentitiesAcrossRuns": 7
      },
      "survivalist/furnace": {
        "runs": 2,
        "holderDays": 43,
        "holderIdentitiesAcrossRuns": 2
      },
      "hunter/beastmaster": {
        "runs": 7,
        "holderDays": 322,
        "holderIdentitiesAcrossRuns": 7
      },
      "caregiver/healer": {
        "runs": 5,
        "holderDays": 226,
        "holderIdentitiesAcrossRuns": 5
      }
    },
    "gods": {
      "all_seeing": {
        "runs": 1,
        "holderDays": 27,
        "holderIdentitiesAcrossRuns": 1
      },
      "apex_predator": {
        "runs": 5,
        "holderDays": 186,
        "holderIdentitiesAcrossRuns": 5
      },
      "shepherd_of_the_dead": {
        "runs": 2,
        "holderDays": 49,
        "holderIdentitiesAcrossRuns": 2
      },
      "voice_of_the_relay": {
        "runs": 1,
        "holderDays": 20,
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
    "explorer/cartographer": 9,
    "forager/feaster": 13,
    "forager/gardener": 23,
    "socialite/showrunner": 15,
    "hunter/beastmaster": 1,
    "hunter/stalker": 24,
    "caregiver/healer": 4,
    "explorer/seer": 1,
    "socialite/demagogue": 3,
    "survivalist/furnace": 1,
    "drifter/trickster": 2
  },
  "npcClasses": {
    "forager/gardener": 30,
    "hunter/stalker": 43,
    "explorer/cartographer": 7,
    "forager/feaster": 27,
    "socialite/demagogue": 9,
    "socialite/showrunner": 16,
    "survivalist/furnace": 2,
    "hunter/beastmaster": 7,
    "caregiver/healer": 5
  },
  "playerGods": {
    "all_seeing": 2,
    "apex_predator": 2,
    "shepherd_of_the_dead": 2,
    "voice_of_the_relay": 4,
    "the_between": 1
  },
  "npcGods": {
    "all_seeing": 1,
    "apex_predator": 5,
    "shepherd_of_the_dead": 2,
    "voice_of_the_relay": 1
  },
  "winningEndings": {
    "feared/none/none/light": 4,
    "beloved/none/none/light": 2,
    "feared/hunter/stalker/light": 6,
    "defiant/forager/gardener/light": 1,
    "beloved/forager/feaster/light": 3,
    "beloved/explorer/cartographer/light": 1,
    "feared/forager/gardener/light": 4,
    "beloved/socialite/showrunner/light": 2,
    "beloved/forager/gardener/light": 3,
    "feared/socialite/showrunner/light": 2,
    "feared/drifter/trickster/light": 1,
    "relay/none/none/light": 1,
    "beloved/caregiver/healer/light": 1,
    "beloved/hunter/stalker/light": 1
  }
}
```

## merchant controller coverage

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
      "sum": 69814,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 3912,
      "reportedRuns": 64
    },
    "livelihoodHarvestTrips": {
      "sum": 575,
      "reportedRuns": 64
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 288,
      "reportedRuns": 58
    },
    "livelihoodBuys": {
      "sum": 74,
      "reportedRuns": 28
    },
    "livelihoodSales": {
      "sum": 172,
      "reportedRuns": 25
    },
    "convoPageHiddenSelections": {
      "sum": 34,
      "reportedRuns": 23
    }
  }
}
```

## merchant

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 64/64 | 64 | 761 | 761 | reached |
| _contestResolveOthers | 64/64 | 64 | 498 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 63 | 185 | 72 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 42 | 71 | 71 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 47 | 121 | 121 | reached |
| _cxPrizeSynergyHint | 64/64 | 63 | 234 | 212 | reached |
| _showEnd | 64/64 | 64 | 358 | 358 | reached |
| _showVillagerEnd | 64/64 | 52 | 120 | 120 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 2347 | 719 | reached |
| apClubBoon | 64/64 | 64 | 6649 | 176 | reached |
| apDeadDrop | 64/64 | 64 | 6649 | 1669 | reached |
| apPersonaPackage | 64/64 | 64 | 1351 | 24 | reached |
| cleanCarcass | 64/64 | 50 | 765 | 0 | reached |
| comfort | 64/64 | 21 | 62 | 9 | reached |
| corpseLootAll | 64/64 | 64 | 2106 | 2106 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 30 | 207 | 156 | reached |
| doAction | 64/64 | 64 | 47977 | 33812 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 64 | 3412 | 3410 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 41058 | 0 | reached |
| networkSummon | 64/64 | 0 | 0 | 0 | not_reached |
| orderMember | 64/64 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 64/64 | 1 | 1 | 1 | reached |
| preserveFood | 64/64 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 64/64 | 0 | 0 | 0 | not_reached |
| proposeTrade | 64/64 | 0 | 0 | 0 | not_reached |
| readBook | 64/64 | 0 | 0 | 0 | not_reached |
| renderFat | 64/64 | 0 | 0 | 0 | not_reached |
| takeMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 64/64 | 0 | 0 | 0 | not_reached |
| takeWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| tbEnd | 64/64 | 64 | 1384 | 0 | reached |
| traderSell | 64/64 | 25 | 172 | 172 | reached |
| visitorBuyWare | 64/64 | 28 | 74 | 74 | reached |
| visitorWares | 64/64 | 64 | 3369 | 3369 | reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 27 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 64 | 3 | 5 | 0 | attempted_no_success |
| bolt | 13 | 3 | 0 | 0 | ready_unused |
| bow | 21 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 5 | 0 | 0 | ready_unused |
| crossbow | 18 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 16 | 0 | 0 | 0 | known_no_material_sample |
| decoy_rattle | 5 | 2 | 0 | 0 | ready_unused |
| fire_hardened_spear | 22 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 36 | 4 | 3 | 0 | attempted_no_success |
| hunting_spear | 25 | 1 | 0 | 0 | ready_unused |
| padded_cloth | 2 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 30 | 25 | 0 | 0 | ready_unused |
| sharpened_stick | 34 | 29 | 0 | 0 | ready_unused |
| sling | 15 | 2 | 0 | 0 | ready_unused |
| snare | 50 | 26 | 180 | 139 | produced |
| stone_knife | 64 | 14 | 19 | 17 | produced |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 1392 | 23 |
| npc/capstone | 11 | 11 |
| npc/contest | 446 | 365 |
| npc/corpse-monster | 7 | 0 |
| npc/craft | 6 | 0 |
| npc/show | 1 | 0 |
| player/capstone | 7 | 4 |
| player/combat | 1 | 1 |
| player/contest | 498 | 391 |
| player/corpse-monster | 52 | 9 |
| player/corpse-person | 111 | 7 |
| player/corpse-villager | 1467 | 166 |
| player/craft | 17 | 0 |
| player/fan-package | 719 | 258 |
| player/fan-vote | 174 | 0 |
| player/patron | 11 | 0 |
| player/show | 75 | 14 |
| player/trade | 74 | 13 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 883,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 57270,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 1653
    },
    "gods": {
      "notResident": 201,
      "currentBearer": 148
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 30,
        "holderDays": 1806,
        "holderIdentitiesAcrossRuns": 39
      },
      "hunter/stalker": {
        "runs": 44,
        "holderDays": 2221,
        "holderIdentitiesAcrossRuns": 70
      },
      "socialite/showrunner": {
        "runs": 14,
        "holderDays": 492,
        "holderIdentitiesAcrossRuns": 20
      },
      "explorer/cartographer": {
        "runs": 3,
        "holderDays": 69,
        "holderIdentitiesAcrossRuns": 3
      },
      "forager/feaster": {
        "runs": 27,
        "holderDays": 2009,
        "holderIdentitiesAcrossRuns": 32
      },
      "socialite/demagogue": {
        "runs": 7,
        "holderDays": 283,
        "holderIdentitiesAcrossRuns": 10
      },
      "hunter/beastmaster": {
        "runs": 11,
        "holderDays": 462,
        "holderIdentitiesAcrossRuns": 12
      },
      "survivalist/furnace": {
        "runs": 2,
        "holderDays": 45,
        "holderIdentitiesAcrossRuns": 2
      },
      "caregiver/healer": {
        "runs": 7,
        "holderDays": 313,
        "holderIdentitiesAcrossRuns": 7
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 9,
        "holderDays": 126,
        "holderIdentitiesAcrossRuns": 9
      },
      "shepherd_of_the_dead": {
        "runs": 2,
        "holderDays": 28,
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
    "forager/feaster": 12,
    "socialite/showrunner": 14,
    "hunter/stalker": 22,
    "forager/gardener": 17,
    "caregiver/keeper": 1,
    "socialite/demagogue": 4,
    "drifter/trickster": 8,
    "drifter/phantom": 1,
    "hunter/beastmaster": 3,
    "survivalist/furnace": 2,
    "explorer/cartographer": 4,
    "caregiver/healer": 4
  },
  "npcClasses": {
    "forager/gardener": 30,
    "hunter/stalker": 44,
    "socialite/showrunner": 14,
    "explorer/cartographer": 3,
    "forager/feaster": 27,
    "socialite/demagogue": 7,
    "hunter/beastmaster": 11,
    "survivalist/furnace": 2,
    "caregiver/healer": 7
  },
  "playerGods": {
    "shepherd_of_the_dead": 3,
    "the_between": 3,
    "apex_predator": 4,
    "voice_of_the_relay": 1
  },
  "npcGods": {
    "apex_predator": 9,
    "shepherd_of_the_dead": 2
  },
  "winningEndings": {
    "feared/none/none/light": 8,
    "feared/hunter/stalker/light": 2,
    "beloved/forager/gardener/light": 4,
    "assimilated/hunter/stalker/light": 1,
    "beloved/hunter/stalker/light": 1,
    "beloved/drifter/trickster/light": 1,
    "beloved/forager/feaster/light": 1,
    "beloved/drifter/phantom/light": 1,
    "witness/none/none/light": 2,
    "feared/forager/feaster/light": 1,
    "feared/socialite/showrunner/light": 2,
    "relay/forager/gardener/light": 1,
    "assimilated/forager/gardener/light": 1,
    "relay/none/none/light": 1,
    "beloved/socialite/showrunner/light": 1,
    "witness/forager/gardener/light": 1,
    "relay/hunter/stalker/light": 2,
    "relay/forager/feaster/light": 1,
    "feared/forager/gardener/light": 2,
    "feared/explorer/cartographer/light": 1,
    "beloved/none/none/light": 2
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
      "sum": 70750,
      "reportedRuns": 64
    },
    "convoPageNavigation": {
      "sum": 4192,
      "reportedRuns": 64
    },
    "livelihoodPatients": {
      "sum": 3045,
      "reportedRuns": 64
    },
    "livelihoodComforts": {
      "sum": 603,
      "reportedRuns": 64
    },
    "livelihoodDrawsDrivenOff": {
      "sum": 386,
      "reportedRuns": 63
    },
    "livelihoodTreatments": {
      "sum": 252,
      "reportedRuns": 36
    },
    "convoPageHiddenSelections": {
      "sum": 55,
      "reportedRuns": 31
    }
  }
}
```

## caregiver

The complete observed method registry is retained, including zero-call routes.

### Feature use

| Method | Available runs | Reached runs | Calls | Truthy returns | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| _contestEnd | 64/64 | 64 | 740 | 740 | reached |
| _contestResolveOthers | 64/64 | 64 | 459 | 0 | reached |
| _cxPrizeAbilityOffer | 64/64 | 60 | 211 | 75 | reached |
| _cxPrizeEvolutionAssist | 64/64 | 43 | 67 | 66 | reached |
| _cxPrizeKnowledgeDump | 64/64 | 50 | 109 | 109 | reached |
| _cxPrizeSynergyHint | 64/64 | 61 | 217 | 198 | reached |
| _showEnd | 64/64 | 63 | 348 | 348 | reached |
| _showVillagerEnd | 64/64 | 56 | 141 | 141 | reached |
| answerCovenantCrisis | 64/64 | 0 | 0 | 0 | not_reached |
| answerDefenseCall | 64/64 | 0 | 0 | 0 | not_reached |
| answerTradeCall | 64/64 | 0 | 0 | 0 | not_reached |
| apCarePackage | 64/64 | 64 | 2251 | 635 | reached |
| apClubBoon | 64/64 | 64 | 6653 | 160 | reached |
| apDeadDrop | 64/64 | 64 | 6653 | 1684 | reached |
| apPersonaPackage | 64/64 | 64 | 1334 | 49 | reached |
| cleanCarcass | 64/64 | 45 | 594 | 0 | reached |
| comfort | 64/64 | 64 | 648 | 607 | reached |
| corpseLootAll | 64/64 | 64 | 2055 | 2055 | reached |
| corpseTakeItem | 64/64 | 0 | 0 | 0 | not_reached |
| craft | 64/64 | 30 | 216 | 177 | reached |
| doAction | 64/64 | 64 | 46146 | 33500 | reached |
| donateMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| donateWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| drawLeaguePool | 64/64 | 0 | 0 | 0 | not_reached |
| expandStorage | 64/64 | 0 | 0 | 0 | not_reached |
| giveFood | 64/64 | 64 | 2524 | 2522 | reached |
| makePemmican | 64/64 | 0 | 0 | 0 | not_reached |
| marketNamePrice | 64/64 | 0 | 0 | 0 | not_reached |
| maybeGrantCapstoneItem | 64/64 | 64 | 41917 | 0 | reached |
| networkSummon | 64/64 | 0 | 0 | 0 | not_reached |
| orderMember | 64/64 | 0 | 0 | 0 | not_reached |
| performCompanyFavor | 64/64 | 1 | 1 | 1 | reached |
| preserveFood | 64/64 | 0 | 0 | 0 | not_reached |
| proposeCovenant | 64/64 | 0 | 0 | 0 | not_reached |
| proposeTrade | 64/64 | 0 | 0 | 0 | not_reached |
| readBook | 64/64 | 0 | 0 | 0 | not_reached |
| renderFat | 64/64 | 0 | 0 | 0 | not_reached |
| takeMedicine | 64/64 | 0 | 0 | 0 | not_reached |
| takePrepMaterial | 64/64 | 0 | 0 | 0 | not_reached |
| takeWeapon | 64/64 | 0 | 0 | 0 | not_reached |
| tbEnd | 64/64 | 64 | 1377 | 0 | reached |
| traderSell | 64/64 | 0 | 0 | 0 | not_reached |
| visitorBuyWare | 64/64 | 0 | 0 | 0 | not_reached |
| visitorWares | 64/64 | 0 | 0 | 0 | not_reached |

### Observed recipe funnel

| Recipe | Known runs | Ready runs | Attempts | Actual successes | Status |
| --- | ---: | ---: | ---: | ---: | --- |
| arrow | 16 | 0 | 0 | 0 | known_no_material_sample |
| bark_armor | 64 | 5 | 3 | 2 | produced |
| bolt | 7 | 2 | 0 | 0 | ready_unused |
| bow | 14 | 0 | 0 | 0 | known_no_material_sample |
| cloth | 64 | 3 | 0 | 0 | ready_unused |
| crossbow | 12 | 0 | 0 | 0 | known_no_material_sample |
| crude_bow | 11 | 3 | 0 | 0 | ready_unused |
| decoy_rattle | 2 | 1 | 0 | 0 | ready_unused |
| fire_hardened_spear | 25 | 0 | 0 | 0 | known_no_material_sample |
| hide_armor | 36 | 11 | 7 | 6 | produced |
| hunting_spear | 19 | 1 | 0 | 0 | ready_unused |
| padded_cloth | 2 | 0 | 0 | 0 | known_no_material_sample |
| pit_trap | 30 | 26 | 0 | 0 | ready_unused |
| sharpened_stick | 32 | 29 | 0 | 0 | ready_unused |
| sling | 6 | 1 | 0 | 0 | ready_unused |
| snare | 52 | 30 | 181 | 146 | produced |
| stone_knife | 64 | 14 | 25 | 23 | produced |
| water_filter | 64 | 0 | 0 | 0 | known_no_material_sample |

### Earned rewards by recipient/source

| Source | Units | Tier-3+ weapon/armor units |
| --- | ---: | ---: |
| npc/action | 1316 | 14 |
| npc/capstone | 9 | 8 |
| npc/care | 1 | 0 |
| npc/contest | 418 | 330 |
| npc/corpse-monster | 1 | 0 |
| npc/craft | 12 | 0 |
| npc/show | 3 | 0 |
| player/capstone | 2 | 2 |
| player/contest | 470 | 376 |
| player/corpse-monster | 44 | 14 |
| player/corpse-person | 115 | 6 |
| player/corpse-villager | 948 | 96 |
| player/craft | 31 | 0 |
| player/fan-package | 635 | 241 |
| player/fan-vote | 159 | 0 |
| player/patron | 26 | 0 |
| player/show | 71 | 21 |

### NPC eligibility and sampled build exposure

64/64 runs retain eligibility. Missing legacy exposure is unknown, never zero. Holder-days count distinct eligible people at the last daily/terminal snapshot per calendar day; these are samples, not continuous exposure or proof of useful effects. Exclusions count map records per sample, not distinct people.

```json
{
  "measuredRuns": 64,
  "missingRuns": 0,
  "sampledIdentitiesAcrossRuns": 833,
  "unknownIdentitiesAcrossRuns": 0,
  "eligiblePersonDays": 60162,
  "unknownPersonDays": 0,
  "duplicateRosterEntries": 0,
  "excludedBuildRecordSamples": {
    "classes": {
      "notResident": 1563
    },
    "gods": {
      "notResident": 50,
      "currentBearer": 31
    }
  },
  "holderDays": {
    "classes": {
      "forager/gardener": {
        "runs": 20,
        "holderDays": 1454,
        "holderIdentitiesAcrossRuns": 28
      },
      "hunter/stalker": {
        "runs": 41,
        "holderDays": 2996,
        "holderIdentitiesAcrossRuns": 68
      },
      "forager/feaster": {
        "runs": 25,
        "holderDays": 1330,
        "holderIdentitiesAcrossRuns": 27
      },
      "survivalist/furnace": {
        "runs": 1,
        "holderDays": 46,
        "holderIdentitiesAcrossRuns": 1
      },
      "explorer/cartographer": {
        "runs": 5,
        "holderDays": 180,
        "holderIdentitiesAcrossRuns": 5
      },
      "socialite/demagogue": {
        "runs": 7,
        "holderDays": 112,
        "holderIdentitiesAcrossRuns": 7
      },
      "caregiver/healer": {
        "runs": 3,
        "holderDays": 131,
        "holderIdentitiesAcrossRuns": 3
      },
      "socialite/showrunner": {
        "runs": 16,
        "holderDays": 579,
        "holderIdentitiesAcrossRuns": 24
      },
      "hunter/beastmaster": {
        "runs": 10,
        "holderDays": 490,
        "holderIdentitiesAcrossRuns": 11
      }
    },
    "gods": {
      "apex_predator": {
        "runs": 6,
        "holderDays": 241,
        "holderIdentitiesAcrossRuns": 7
      },
      "voice_of_the_relay": {
        "runs": 2,
        "holderDays": 28,
        "holderIdentitiesAcrossRuns": 2
      },
      "shepherd_of_the_dead": {
        "runs": 1,
        "holderDays": 27,
        "holderIdentitiesAcrossRuns": 1
      },
      "all_seeing": {
        "runs": 1,
        "holderDays": 42,
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
    "hunter/stalker": 25,
    "explorer/cartographer": 7,
    "forager/gardener": 13,
    "forager/feaster": 11,
    "socialite/showrunner": 15,
    "socialite/demagogue": 5,
    "drifter/trickster": 4,
    "caregiver/healer": 2,
    "survivalist/furnace": 2,
    "hunter/beastmaster": 1
  },
  "npcClasses": {
    "forager/gardener": 20,
    "hunter/stalker": 41,
    "forager/feaster": 25,
    "explorer/cartographer": 5,
    "survivalist/furnace": 1,
    "socialite/demagogue": 7,
    "caregiver/healer": 3,
    "socialite/showrunner": 16,
    "hunter/beastmaster": 10
  },
  "playerGods": {
    "voice_of_the_relay": 2,
    "apex_predator": 2
  },
  "npcGods": {
    "apex_predator": 6,
    "voice_of_the_relay": 2,
    "shepherd_of_the_dead": 1,
    "all_seeing": 1
  },
  "winningEndings": {
    "beloved/hunter/stalker/light": 7,
    "feared/none/none/light": 9,
    "feared/hunter/stalker/light": 2,
    "feared/forager/feaster/light": 5,
    "witness/hunter/stalker/light": 1,
    "beloved/none/none/light": 4,
    "beloved/socialite/showrunner/light": 4,
    "beloved/forager/gardener/light": 2,
    "indispensable/forager/gardener/light": 1,
    "relay/hunter/stalker/light": 1,
    "feared/socialite/demagogue/light": 2,
    "beloved/forager/feaster/light": 1,
    "feared/socialite/showrunner/light": 2,
    "relay/forager/gardener/light": 1,
    "feared/explorer/cartographer/light": 2,
    "witness/explorer/cartographer/light": 1,
    "feared/drifter/trickster/light": 1
  }
}
```
