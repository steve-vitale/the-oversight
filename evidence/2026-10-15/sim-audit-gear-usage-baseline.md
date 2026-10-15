# Sim audit — gear-usage-baseline (2026-10-15)

32 runs: policies capable, socialite × seeds 7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9 × 150 days. Crashes: 0.

## Swallowed errors (4 sites, 208 total)

| runs | count | site | first message |
|---|---|---|---|
| 32/32 | 114 | `src/js/game.js:17340` | Cannot read properties of null (reading 'px') |
| 32/32 | 56 | `src/js/engine/state.js:510` | localStorage is not defined |
| 32/32 | 32 | `src/js/game.js:31210` | Cannot read properties of null (reading 'px') |
| 6/32 | 6 | `src/js/game.js:17662` | Cannot read properties of null (reading 'px') |

## Function coverage: 3523/5121 named functions ran at least once (69%)

| file | ran | never ran (name:line) |
|---|---|---|
| `src/js/game.js` | 891/1221 | makeLogEntry:216, logText:226, isRegionPredator:390, randomLandingZone:639, pick:1611, langLabel:1996, langNote:2014, conflictNote:2017, npcHomeRegion:2827, dominantNeed:2879, nonverbalRead:2901, nonverbalGesture:2959, nonverbalDraw:3006, callOutTeaching:3164, learnRecipe:3449, setNet:3778, plantGenesis:3895, readBook:3944, edibleCount:3977, giveFood:3981, stealFrom:4084, intimidate:4170, offerDeal:4303, goalTaskAffinity:4376, appealToGoal:4385 … +305 |
| `src/js/debug-scenarios.js` | 0/151 | freshGame:41, giveWeapon:51, spawnAnimalNear:66, spawnAnimalAt:81, rosterIds:96, placeVillagers:104, npcName:120, toWildNode:132, tableSetRun:162, debugCoalition:182, overtime3:195, network:204, takenhome:223, deer:233, rabbit:251, squirrel:262, turkey:273, opossum:284, bullfrog:295, boxturtle:305, fox:314, crayfish:326, raccoon:336, snappingturtle:345, chub:357 … +126 |
| `src/js/contests.js` | 153/285 | G._cxStipulationLine:649, G._showGenericBeat:1951, A.<computed>:2871, G._contestGeneric:4291, setup:5494, turn:5495, end:5496, setup:5499, turn:5500, end:5501, setup:5505, turn:5506, end:5507, setup:5509, turn:5510, end:5511, setup:5512, turn:5516, end:5517, setup:5523, turn:5527, end:5528, setup:5531, turn:5532, end:5533 … +107 |
| `src/js/betrayal.js` | 101/171 | declineInvite:373, declineLine:395, Cap:606, ambushExchange:664, ambushAftermath:992, showWounds:1175, payBribe:1407, bribeVoter:1440, exposeBribery:1496, recentTrauma:1633, mergeFeud:1904, villageRoom:2022, petitionVillage:2028, joinVillageReal:2120, drift:2213, villageCard:2268, villageCardAction:2369, villageTerritory:2380, villageDeal:2413, villageTalk:2468, villageShareFood:2584, foundingReqs:2672, foundingState:2675, foundingMissing:2676, exileSelfActions:2703 … +45 |
| `src/js/abilityActions.js` | 48/98 | time_min:47, hp:66, activateAbility:100, trade_of_blows.settle_debt:743, unbreakable.shake_off:750, retribution.unleash:774, field_dressing.dress_game:799, molt.shed_skin:824, bird_strike.call:907, freeze_tag.tag:925, green_thumb.ask:928, grave_robber.rob_grave:934, mediator.mediate_dispute:938, leech.leech_stance:944, peacemaker.make_friends:960, water_breathing.dive_deep:966, _graveRobberCorpse:987, game_sense.read_sign:1000, patient_aim.clean_shot:1078, field_dressing.dress_game:1088, tracker.track:1138, stalk.stalk_prey:1180, blood_trail.follow_blood:1204, ambush.lay_wait:1213, animal_ken.read_beast:1219 … +25 |
| `src/js/journal.js` | 85/135 | part:89, confirm:91, thin:92, poison:94, triumph:96, part:104, confirm:106, thin:107, poison:109, triumph:111, part:119, confirm:121, thin:122, poison:124, triumph:126, part:134, confirm:136, thin:137, poison:139, triumph:141, part:149, confirm:151, thin:152, poison:154, triumph:156 … +25 |
| `src/js/godpath.js` | 95/137 | warn:45, isTitanish:394, clearWardenWall:401, hasC:420, wall:446, pull:475, push:497, pack:527, blink:571, foresee:619, command:645, empower:659, guard:668, bribe:677, feed_camp:706, readIntents:722, plan:790, plan:791, plan:792, plan:794, plan:795, kit_static:798, kit_cheese:803, kit_birds:811, kit_freeze:817 … +17 |
| `src/js/food.js` | 62/102 | shellNuts:450, dropRotten:625, preserveFood:688, renderFat:775, pemmicanSets:817, pemmicanPlan:837, pemmicanPreview:884, makePemmican:891, foodMarker:948, spoilClockShort:1005, specialistsHere:1057, specOccLabel:1079, askSpecialist:1086, villageHasSpecialty:1301, whoKnowsLump:1392, plantFieldClick:1414, knowsFn:1437, testMonsterMeat:1502, testCautiously:1553, experimentWith:1721, watchFauna:1809, askSystemAbout:1837, storageTier:1881, expandStorage:1884, preyWariness:1930 … +15 |
| `src/js/storage.js` | 9/47 | hasToolItem:110, woodcutTier:119, cutInfo:142, addMaterial:158, materialCount:168, spendMaterial:174, pruneBranches:191, gatherFallen:217, _stashLedgers:265, _stashItemLedgers:283, _stashToolLedgers:294, _stashItemGrant:303, _stashTotalNet:315, donateMaterial:341, takeMaterial:386, phoenixHonorDeposit:462, donateTool:481, takeTool:536, isStashableWeapon:599, isMedicine:611, _depositStashedItem:619, donateWeapon:677, donateMedicine:678, _takeStashedItem:681, takeWeapon:734 … +13 |
| `src/js/hierarchy.js` | 62/96 | _courtshipNextStep:416, _stageCounter:475, answerCounter:502, payTribute:826, primaryDemand:1157, answerDemand:1175, proveWorth:1263, breakLink:1272, renegotiateLink:1362, bidForPrimacy:1386, _linkNeglected:1472, answerRenegotiation:1647, kingdomEndingEligible:1756, _judgePeer:2682, _proposePeer:2710, proposeCovenant:2761, proposeTrade:2764, _stagePeerCounter:2768, _formPeerLink:2794, _leaguePoolRate:2877, covenantTick:2885, tradeTick:2985, drawLeaguePool:3031, _musterAway:3046, _sendAwayParty:3092 … +9 |
| `src/js/finale-campaign.js` | 13/43 | muster:48, survivors:52, heartFloor:57, finaleNodeReady:102, finaleReinforce:109, finaleMonsterDef:143, freeSpotNear:146, injectMonster:161, markFight:190, finaleCrewSetup:202, finaleOpeningSetup:216, finaleHeartSetup:228, finaleGrieve:295, campaignCamp:341, finaleInterlude:351, finaleSpawnNext:374, finaleResolveNode:383, fiSkyZones:478, fiInZone:487, fiResolveSky:488, fiArmSky:513, fiCreditsBurn:521, fiFinaleHeart:535, btn:611, spoilUsed:622 … +5 |
| `src/js/encounters.js` | 34/63 | G.encAnimalLevel:108, G.encQueueOf:162, G.encPickCue:171, G.encPhase:180, G.say:225, G.feedbackMark:238, G.feedbackLines:241, G.feedback:257, G.encSlowMissVerb:444, G.encKillLine:718, G.encButcherHonesty:752, G.encPreyPhase:824, G.encPreyPhaseBadge:826, G.encWeaponMethod:838, G.encMethodWords:848, G.encMethodToolReady:865, G.encMethodToolName:883, G.encBehaviorStrikeReact:908, G.encBehaviorAfterBolt:944, G.encStrikeReact:988, G.encStrikeDeadPossum:1022, G.encAnimalCrossNode:1184, G.stalkAnimal:2102, G.encMissReact:2180, G.encHuntXPBonus:2291 … +4 |
| `src/js/feel-audio.js` | 0/24 | tone:44, hiss:61, chord:75, port:78, voice:81, wall:90, pull:91, push:92, pack:93, heal:94, blink:95, swap:96, foresee:97, broadcast:98, command:99, stoke:100, coins:101, feed:102, thread:103, keepsake:104, echo:105, aura:106, stopBed:111, arrivalStop:250 |
| `src/js/ledger.js` | 52/75 | text:122, text:123, text:133, text:143, text:150, text:151, text:154, text:162, text:163, hearGossipAboutSelf:438, legendSurface:452, hoardFood:554, exposeFallout:567, warnChallenge:1146, challengeCountdownText:1184, expectedButLeft:1193, arenaDeath:1212, replayFootage:1234, arenaAct:1254, returnFromArena:1294, replayHighlights:1353, Game.intimidate:1396, Game.exposeBribery:1404 |
| `src/js/titans.js` | 18/40 | titanOmen:82, titanLinkOther:223, titanAlliedFaces:227, titanWarCouncil:248, soundTitanCall:285, titanVolunteers:337, titanBladeName:374, titanHavenBlades:379, titanCommitOwn:387, titanSelfActions:445, titanSelfDo:493, titanReleaseCommitted:505, titanGearValue:511, titanOutfit:526, titanTelegraphArming:586, titanTemptation:594, titanTurn:644, titanInjectAllies:826, titanResolveFight:884, titanVictory:944, titanGrantRelic:986, titanMusterState:986 |
| `src/js/justice.js` | 14/35 | justiceExiled:118, justicePickConfronter:206, justiceVoiceData:226, justiceVoiceMatch:228, justiceVoiceFill:241, justiceVoicePick:247, justiceConfront:260, justicePendingConfront:315, justiceRestitutionOwed:320, justiceRespond:329, justiceDemandMoot:410, syncJusticeAfterMoot:470, mootAccuserAftermath:495, justiceExileGuards:545, startVillageUprising:570, uprisingAftermath:704, tbTalkTactics:797, tbPlayerTalk:810, G.playerAttacks:1021, G.packFromPantry:1040, say:1099 |
| `src/js/conversation.js` | 123/143 | cleanDialogue:487, quoteWrap:495, npcVoiceFingerprint:604, flush:778, convoThreadResolve:1250, convoSaidFacts:1479, convoSaidFact:1487, convoFactRecalled:1496, convoFactConflict:1501, convoVoiceSig:1509, convoSkillOriginLine:1729, convoHonestPassReact:1995, convoHesitationMs:2069, exh:2491, say:2640, convoFollowups:3120, pushReact:3683, qok2:4492, convoUI:5655, langExposureReport:5930 |
| `src/js/sigW5.js` | 28/46 | abName:147, abId:151, abLevel:152, niWatch:626, fiFinale:697, nnApplyBad:883, nnRevertBad:894, tbCxOffScript:992, tbCxSpendFavor:1016, tbRrLeaveMessage:1119, tbRrReadMessages:1145, tbSpAsk:1154, tbSpCheapFulfill:1176, tbNiPlayToCamera:1233, tbFiSacrifice:1247, tbNnBadNote:1286, tbNnReadMemo:1303, sigW5WireCombat:1387 |
| `src/js/convo-wants.js` | 87/104 | build:152, build:178, gossipLine:386, deflectBeat:436, deflectBeat:841, opener:887, engageBeat:888, deflectBeat:891, menuOptions:903, closeLine:918, resolve:921, deflectBeat:945, deflectBeat:995, convoFavorRenounce:1297, observeNews:1636, convoWantWarning:1688, convoWant:1856 |
| `src/js/engine/modifiers.js` | 30/47 | fire_heat:258, trust_gain:279, storm_warning:284, ambush_avoid:285, scavenge_find:287, travel_lost:288, disease_resist:291, system_favor:292, fish_rare:301, hasKnowledgeUnlock:330, describeModifier:350, pct:372, trimNum:373, custom:393, custom:394, custom:405, custom:414 |
| `src/js/voice-piper.js` | 4/21 | hashStr:65, clamp:71, lsSet:73, voiceProfileFor:81, setVoiceEnabled:134, unlockVoice:150, loadTts:161, refreshVoiceCache:174, voicePackStatus:187, ensureVoicePack:194, ensureVoicePacks:208, voiceVerifyIds:217, pickDeviceVoice:244, speakFallback:257, speakPiper:272, voiceStop:295, paintVoiceToggle:335 |
| `src/js/godverbs.js` | 82/98 | warn:31, painPool:128, turn_the_pain:183, no_lies:253, rally_cry:263, buy_passage:283, vGodRec:308, be_heard:329, name_price:339, marketPick:350, godPlay:426, holderGod:427, fighterGod:428, actBy:486, tryCast:487, phaseRetreat:606 |
| `src/js/pods.js` | 20/35 | first:51, podAsk:96, podAnswer:195, podShrugged:242, podJackpotWon:259, day:269, podJackpotStage:277, podJackpotSpin:293, podJackpotWin:295, podJackpotLoss:313, podDemandCost:352, podConscriptOffer:432, podConscriptAnswer:442, podJackpotChoose:500, podJackpotApproach:508 |
| `src/js/whereAreWe.js` | 9/24 | warn:37, wawTalk:42, wawSeasonLabel:72, wawCalendarId:82, wawRegionName:89, wawRough:95, wawSeasonShown:102, wawSeasons:114, wawPick:118, wawSeasonLines:126, wawFill:133, wawJoin:142, placeLearnFrom:151, whereLine:199, t2fol_where:214 |
| `src/js/network-campaign.js` | 8/22 | tst:34, camp:41, survivors:46, current:56, nodeById:57, nodeTile:61, networkSummon:76, removePieces:100, networkFall:106, networkLose:121, networkResolve:133, refuse:162, w:231, networkStatus:272 |
| `src/js/party-formal.js` | 29/43 | partyRoster:90, nameParty:225, disbandParty:258, assignRole:270, clearRole:301, roleBonus:303, orderMember:309, execOrder:333, splitParty:493, resolveSplitTeam:521, applySplitDeath:572, partyCardHtml:752, Game.dismissFromParty:914, Game.partyButtonHtml:973 |
| `src/js/party.js` | 41/55 | isFollower:78, dismissFromParty:236, npcLeavesParty:256, playerAttacks:561, _duelResolveDare:727, partyButtonHtml:864, partyHud:884, togglePartyPanel:901, isPartyPanelOpen:905, partyMemberStatus:912, _pesc:926, partyPanelHTML:933, allyStripHTML:960, blocked:984 |
| `src/js/carexplore.js` | 0/13 | hashStr:68, edibleStacks:75, npcTemper:83, npcIntelPrimary:87, trustOf:91, setTrust:97, isPublic:101, Game.giveFood:114, Game.comfort:273, Game.tileFeature:398, Game.examineCell:417, Game.giveFoodOptions:815, Game.comfortOptions:825 |
| `src/js/corruption.js` | 22/35 | corruptionOf:55, addCorruption:63, corruptionThresholdBeat:79, addFear:157, fearWeakness:177, humanMeatItem:198, corpseButcher:212, eatCannibal:264, discoverNpcCannibalism:420, darkShowBeat:521, nearButcherableCorpse:560, G.eatOne:760, G.intimidate:783 |
| `src/js/engine/state.js` | 8/21 | hasMigrationPath:112, migrateSave:124, tombstoneKey:214, writeTombstone:218, quarantineKey:249, takeQuarantineNotice:303, listQuarantines:310, restoreQuarantine:330, scanSaveBlobs:366, adoptEntry:381, listSaves:392, load:499, wipeAll:532 |
| `src/js/safetynets.js` | 31/44 | _speaker:192, answerAidQuest:329, _questFetchMatch:350, handInAidQuest:366, abandonAidQuest:408, _completeAidQuest:457, _triageRun:622, answerRelief:695, _linkById:807, aidRequestable:816, requestAid:839, resolveAidOut:867, stockPantry:1351 |
| `src/js/membership.js` | 29/41 | memberBenefits:128, awayMembers:148, rejoinMembership:223, buildShelter:261, refuseApplication:499, formAlliance:735, recognizedAbroad:762, memberReputationAbroad:778, proposeAlliance:790, guestMeal:844, G.joinVillageReal:1137, G.foundHaven:1137 |
| `src/js/convoTopics.js` | 41/52 | topic2SubjectOpts:231, t2gen_oldworld:486, t2fol_oldworld:499, dn:633, fillNames:635, t2gen_systemtake:733, t2fol_systemtake:758, t2gen_advice:772, t2fol_advice:797, t2gen_loved:811, t2fol_loved:841 |
| `src/js/corpses.js` | 19/30 | corpseAt:104, corpseGlyph:118, corpseTakeItem:497, corpseUseItem:559, corpseEatItem:581, lootCorpse:633, corpseDesc:721, examineCorpse:778, payRespects:803, buryCorpse:822, knowsDeath:891 |
| `src/js/sigW4.js` | 48/59 | sigVerbCount:126, tbCongAccept:189, tbCongHeresy:217, tbStrikeScab:333, tbSuburbRest:506, tbSuburbLeave:532, tbSuburbAlive:549, tbEulogyRewrite:613, tbAlgoTank:656, tbEaterPoison:719, sigW4WireCombat:895 |
| `src/js/buildarounds.js` | 18/28 | onStrikeMiss:80, unleash:117, mark:145, onForage:317, forageMult:334, redHarvestHeal:361, crimsonGodParty:381, deadeyeMark:390, deadeyeAllyMult:401, lifebringerRevive:417 |
| `src/js/pantheon.js` | 22/31 | godAttitudes:193, godFaction:208, factions:215, godRivalry:221, DISFAVOR_LINES:231, DISFAVOR_LINES:232, DISFAVOR_LINES:233, COLD_LINES:236, architectCredit:323 |
| `src/js/relay-ext.js` | 13/22 | relayDeepen:190, relayBackfire:231, relayTranslate:301, relaySanctuary:325, relayAdvocate:336, relayRewrite:359, relaySkim:376, relaySight:394, relayCarry:411 |
| `src/js/table.js` | 48/57 | indispensable:200, winDayFloorDefer:352, tableHostsLines:941, tableResolveHosts:971, tableResolveDemandPrice:999, castTakingMourners:1021, kidsBackOutcome:1029, tableFacilitate:1127, tableTheme:1216 |
| `src/js/equipment.js` | 18/26 | slotLabel:65, fullSetSlots:99, blockedSlots:106, isSlotBlocked:120, meleeWeaponOf:272, threatLevel:410, threatLabel:421, gearDescription:425 |
| `src/js/godhood.js` | 33/41 | itemTier:147, villagerMythicId:298, playerMythicId:308, godhoodBargaining:318, auditCollect:371, namePrice:400, buyPassage:459, buyOff:499 |
| `src/js/records.js` | 8/16 | trackSecret:74, secretTracked:79, isRevealed:83, revealSecret:90, architectCredit:104, publicLines:115, secretLines:121, recordCount:125 |
| `src/js/truth.js` | 48/56 | trackClaim:534, stampHeardStory:590, observePerson:779, observationTell:858, occTellVerb:870, doubtsHTML:1655, Game.trackClaimSilent:1874, Game.peopleJournal:2006 |
| `src/js/comms.js` | 35/42 | aidSystemRelay:389, aidCry:461, repayAidDebt:618, answerSystemFavor:852, removeSwitchboard:993, confrontSwitchboard:1098, switchboardLog:1098 |
| `src/js/presentation.js` | 0/7 | warn:24, cfg:44, codexDepth:55, presentationInfo:74, presentationStage:98, alienScript:102, glitchDue:115 |
| `src/js/tracks.js` | 22/29 | warn:45, villagerTrackLevel:81, villagerGainXP:150, migrateNpcLanes:250, migrateTrackScale:273, trackSummary:442, Game.load:459 |
| `src/js/voice-system.js` | 2/9 | normVoiceText:55, buildTextIndex:67, entryFor:79, playSystemLine:90, Game.systemLineEntry:121, Game.systemLineIds:122, Game.systemVoiceIdFor:129 |
| `src/js/progression.js` | 53/59 | pick:68, integrationStageName:139, pacingStats:179, arcName:498, _synergyGiftPick:927, auditItemPool:1029 |
| `src/js/codex-people.js` | 20/25 | theirViewOfYou:226, posthumousReveal:258, personDepthHTML:310, Game.examineCorpse:473, Game.defendAlibi:484 |
| `src/js/endingKey.js` | 22/27 | warn:31, levelOf:48, tokensIn:141, universe:147, endingSelectors:271 |
| `src/js/examine.js` | 5/10 | observedPlant:58, examineDescription:82, resolveCellSpecies:164, examinePlantCell:192, plantVisualDepth:276 |
| `src/js/feel.js` | 21/26 | warn:33, lsSet:40, arrivalVoiceIds:141, setHaptics:169, setReducedMotion:176 |
| `src/js/keepsakes.js` | 33/38 | warn:102, keepsakeLevelText:133, keepsakeTakenKin:340, keepsakeClues:362, Game.load:596 |
| `src/js/party-bond.js` | 15/20 | firstName:65, vnameOf:284, isNewcomer:334, braveryOf:342, findVeteranBuddy:353 |
| `src/js/relay-dialogue.js` | 22/27 | weakVillageName:99, villageNameList:117, needs:366, relayAllScenes:548, relaySceneById:549 |
| `src/js/spawn-knack.js` | 12/17 | pick:44, liveKnackChoices:114, chooseKnack:130, Game.systemArrivalBeats:261, Game.load:300 |
| `src/js/table-defiant.js` | 8/13 | say:89, effects:120, effects:132, say:143, choices:149 |
| `src/js/table-indispensable.js` | 2/7 | meterLine:11, pantryKcal:32, say:76, say:97, choices:102 |
| `src/js/table-relay.js` | 15/20 | verb:49, verb:49, grant:101, grant:104, grant:108 |
| `src/js/villageAgency.js` | 33/38 | answerSuccession:386, petitionInterview:670, aidVillage:1134, answerBeg:1196, answerRaidDefense:1259 |
| `src/js/villager-agency.js` | 39/44 | codexDeeds:690, npcViewership:697, playerBoardScore:707, villagerBoard:717, isMedicinal:1157 |
| `src/js/alienPlayers.js` | 85/89 | _apContestDraw:170, apGroupBanter:909, apStartGroupEncounter:996, apPlaygroundRookieMistake:2510 |
| `src/js/feastBuff.js` | 17/21 | feastedLine:264, _feastHpTotal:315, _feastHealBonus:350, faceFeastDraw:507 |
| `src/js/galactic-cast.js` | 10/14 | G.castDisplayName:96, castById:137, G.castProducerDemand:177, G.castSignOff:201 |
| `src/js/metaProgression.js` | 28/32 | removeItem:149, metaReset:191, metaList:217, metaSummary:224 |
| `src/js/partyTactics.js` | 19/23 | tbDensestFighter:151, tbPartyCentroid:168, tbIdeaDrift:222, tbClearEvictionWall:349 |
| `src/js/sigW3b.js` | 21/25 | tbChorusDance:613, tbChorusThrowGravel:638, tbTosAccept:709, tbTosInvokeLoophole:726 |
| `src/js/sigW3c.js` | 31/35 | dmgRangeOf:70, cbAbilityName:125, sigW3cWireCombat:694, G.bufAfterimageCells:763 |
| `src/js/world.js` | 17/21 | warn:39, near:107, worldRegionName:182, worldRegions:285 |
| `src/js/broadcast.js` | 10/13 | esc:137, G.broadcastWatching:289, G.broadcastTickerHTML:293 |
| `src/js/memdepth.js` | 6/9 | grievanceSay:38, grievanceNoteFor:53, convoGrievanceLine:68 |
| `src/js/perceive.js` | 0/3 | playerIntel:36, isObservant:44, Game.perceptionHints:54 |
| `src/js/table-feared.js` | 7/10 | grant:69, tableTrialByCombat:137, tableTrialResume:179 |
| `src/js/contestEngine.js` | 22/24 | st:454, apply:794 |
| `src/js/convo-scene.js` | 4/6 | validateAskContract:182, convoRecallYouSaid:320 |
| `src/js/engine/forage.js` | 1/3 | weightedPick:19, forage:32 |
| `src/js/lifeseed.js` | 23/25 | npcKeepsakeLine:358, auditLifeseeds:471 |
| `src/js/table-witness.js` | 10/12 | effects:166, effects:174 |
| `src/js/villager-mapmem.js` | 9/11 | mapmemTell:248, mapmemHaulAt:347 |
| `src/js/audio-registry.js` | 0/1 | resolveHook:191 |
| `src/js/convo-beats.js` | 9/10 | Game.bridgeLine:177 |
| `src/js/engine/day.js` | 0/1 | newDay:29 |
| `src/js/fieldFights.js` | 11/12 | villagerSpendFood:190 |
| `src/js/foodPower.js` | 14/15 | Game.activateAbility:202 |
| `src/js/monsterBehaviors.js` | 7/8 | blocked:153 |
| `src/js/overtime.js` | 15/16 | networkKeyReady:112 |
| `src/js/scaleDiscovery.js` | 33/34 | scaleDiscovery:69 |
| `src/js/skill-teaching.js` | 21/22 | warn:43 |
| `src/js/standing.js` | 4/5 | standingLine:121 |
| `src/js/statusEffects.js` | 23/24 | seSteps:546 |
| `src/js/table-beloved.js` | 12/13 | effects:103 |
| `src/js/villager-build.js` | 34/35 | warn:42 |
| `src/js/waveLedger.js` | 6/7 | ledgerProgressLine:205 |
| `src/js/build.js` | 0/0 |  |
| `src/js/convo-dialogue.js` | 6/6 |  |
| `src/js/convo-mood.js` | 10/10 |  |
| `src/js/engine/calories.js` | 4/4 |  |
| `src/js/engine/combat.js` | 13/13 |  |
| `src/js/havenGrowth.js` | 17/17 |  |
| `src/js/party-wiring.js` | 4/4 |  |
| `src/js/practice-deeds.js` | 6/6 |  |
| `src/js/sigW3a.js` | 52/52 |  |
| `src/js/table-assimilated.js` | 6/6 |  |
| `src/js/telemetry-hooks.js` | 7/7 |  |
| `src/js/trial-deeds.js` | 5/5 |  |
| `src/js/villager-objectives.js` | 21/21 |  |

## Run outcomes

- capable/s99: 95d over-other WON, abilities 6, synergies 1, integ 100
- capable/s42: 93d over-other WON, abilities 6, synergies 1, integ 100
- capable/s1234: 92d over-other WON, abilities 6, synergies 3, integ 100
- capable/s7: 95d over-other WON, abilities 6, synergies 0, integ 100
- capable/s555: 90d over-other, abilities 4, synergies 2, integ 100
- capable/s2026: 92d over-other WON, abilities 6, synergies 2, integ 100
- capable/s31337: 100d over-other, abilities 6, synergies 0, integ 100
- capable/s777: 95d over-other WON, abilities 6, synergies 1, integ 100
- capable/s1: 150d survived, abilities 6, synergies 4, integ 100
- capable/s2: 97d over-other WON, abilities 3, synergies 1, integ 100
- capable/s3: 97d over-other WON, abilities 4, synergies 2, integ 100
- capable/s4: 93d over-other WON, abilities 2, synergies 1, integ 100
- capable/s8: 93d over-other, abilities 6, synergies 2, integ 100
- capable/s5: 92d over-other WON, abilities 6, synergies 1, integ 100
- capable/s9: 114d over-other WON, abilities 6, synergies 1, integ 100
- capable/s6: 150d survived, abilities 3, synergies 2, integ 100
- socialite/s7: 103d village-lost, abilities 3, synergies 1, integ 100
- socialite/s42: 91d village-lost, abilities 1, synergies 0, integ 100
- socialite/s99: 104d village-lost, abilities 3, synergies 0, integ 100
- socialite/s777: 81d village-lost, abilities 2, synergies 0, integ 100
- socialite/s1234: 122d village-lost, abilities 4, synergies 2, integ 100
- socialite/s555: 121d village-dead, abilities 2, synergies 2, integ 100
- socialite/s31337: 106d village-lost, abilities 3, synergies 0, integ 100
- socialite/s2026: 141d village-dead, abilities 2, synergies 2, integ 100
- socialite/s1: 148d village-lost, abilities 2, synergies 0, integ 100
- socialite/s2: 113d village-lost, abilities 2, synergies 0, integ 100
- socialite/s3: 131d village-lost, abilities 1, synergies 0, integ 100
- socialite/s4: 123d village-lost, abilities 3, synergies 0, integ 100
- socialite/s6: 74d village-lost, abilities 2, synergies 0, integ 100
- socialite/s5: 150d survived, abilities 2, synergies 1, integ 100
- socialite/s9: 105d village-lost, abilities 1, synergies 1, integ 100
- socialite/s8: 117d village-lost, abilities 1, synergies 0, integ 100
