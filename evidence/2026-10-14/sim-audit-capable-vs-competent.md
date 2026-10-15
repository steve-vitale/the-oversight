# Sim audit — capable-vs-competent (2026-10-14)

8 runs: policies capable, competent × seeds 7, 42, 99, 1234 × 150 days. Crashes: 0.

## Swallowed errors (4 sites, 49 total)

| runs | count | site | first message |
|---|---|---|---|
| 8/8 | 30 | `src/js/game.js:16881` | Cannot read properties of null (reading 'px') |
| 8/8 | 9 | `src/js/engine/state.js:510` | localStorage is not defined |
| 8/8 | 8 | `src/js/game.js:30503` | Cannot read properties of null (reading 'px') |
| 1/8 | 2 | `src/js/progression.js:1033` | Cannot read properties of undefined (reading '0') |

## Function coverage: 2637/4491 named functions ran at least once (59%)

| file | ran | never ran (name:line) |
|---|---|---|
| `src/js/game.js` | 817/1176 | makeLogEntry:199, logText:209, randomLandingZone:338, langLabel:1628, langNote:1645, conflictNote:1648, npcHomeRegion:2424, dominantNeed:2477, nvTrust:2490, nonverbalRead:2498, nonverbalGesture:2557, nonverbalDraw:2605, nonverbalDrawCheck:2634, callOutTeaching:2762, learnRecipe:3044, setNet:3371, plantGenesis:3487, readBook:3535, edibleCount:3568, giveFood:3574, stealFrom:3675, intimidate:3762, offerDeal:3895, goalTaskAffinity:3967, appealToGoal:3976 … +334 |
| `src/js/contests.js` | 128/284 | G._cxStipulationLine:649, G._showGenericBeat:1952, A.<computed>:2871, G._contestSiege:3381, G._contestSecrets:3574, G._contestGeneric:4292, setup:5458, turn:5460, end:5463, setup:5463, turn:5464, end:5465, setup:5469, turn:5470, end:5471, setup:5474, turn:5475, end:5476, setup:5479, turn:5481, end:5482, setup:5485, turn:5486, end:5487, setup:5491 … +131 |
| `src/js/debug-scenarios.js` | 0/146 | freshGame:41, giveWeapon:51, spawnAnimalNear:66, spawnAnimalAt:81, rosterIds:96, placeVillagers:104, npcName:120, toWildNode:132, deer:160, rabbit:178, squirrel:189, turkey:200, opossum:211, bullfrog:222, boxturtle:232, fox:241, crayfish:253, raccoon:263, snappingturtle:272, chub:284, day7:296, uprising:299, day1:341, language:344, liars:360 … +121 |
| `src/js/betrayal.js` | 83/170 | recordGrievance:185, declineInvite:373, declineLine:395, socialPerception:574, Cap:606, ambushExchange:664, ambushAftermath:992, avgBelief:1102, showWounds:1175, examineAmbushSite:1185, nameWitnesses:1203, pressAccomplice:1223, approachWeakest:1278, letItLie:1301, caseBribePrice:1361, caseBribable:1370, canAffordBribe:1378, payBribe:1407, bribeVoter:1440, bribeDigMissLine:1467, investigateBribery:1482, exposeBribery:1496, recentTrauma:1633, castPlayerVote:1682, sentenceCase:1801 … +62 |
| `src/js/abilityActions.js` | 15/96 | time_min:47, hp:66, activateAbility:100, _stanceHint:437, game_sense.read_stance:712, trade_of_blows.settle_debt:718, unbreakable.shake_off:725, war_cry.bellow:730, haymaker.throw_haymaker:741, retribution.unleash:749, animal_ken.calm_beast:768, field_dressing.dress_game:774, molt.shed_skin:799, pocket_sand.throw_sand:819, shoulder_check.shove:826, hogtie.bind:839, come_get_some.goad:855, static_toss.toss:868, cheese_wheel.hurl:875, bird_strike.call:882, tripwire.string:886, turncoat.persuade:893, freeze_tag.tag:900, green_thumb.ask:903, grave_robber.rob_grave:909 … +56 |
| `src/js/journal.js` | 73/135 | part:89, confirm:91, thin:92, poison:94, triumph:96, part:104, confirm:106, thin:107, poison:109, triumph:111, tasting:117, deeper:118, part:119, handling:120, confirm:121, thin:122, poison:124, hunger:125, triumph:126, part:134, confirm:136, thin:137, poison:139, triumph:141, tasting:147 … +37 |
| `src/js/encounters.js` | 12/56 | G.encAnimalLevel:108, G.encQueueOf:162, G.encPickCue:171, G.encPhase:180, G.encAudio:200, G.say:225, G.feedbackMark:238, G.feedbackLines:241, G.feedback:257, G.encAnimalLabel:338, G.encCap:344, G.encAnimalLabel:351, G.encNeverBolt:382, G.encFleeText:439, G.encSlowMissVerb:444, G.encChaseText:460, G.encKillLine:718, G.encButcherHonesty:752, G.encWaryText:799, G.encBoltDir:814, G.encPreyPhase:824, G.encPreyPhaseBadge:826, G.encWeaponMethod:838, G.encMethodWords:848, G.encMethodToolReady:865 … +19 |
| `src/js/food.js` | 60/101 | shellNuts:450, dropRotten:625, preserveFood:688, renderFat:773, pemmicanSets:815, pemmicanPlan:835, pemmicanPreview:882, makePemmican:889, foodMarker:946, spoilClockShort:1003, specialistsHere:1055, specOccLabel:1077, askSpecialist:1084, villageHasSpecialty:1301, whoKnowsLump:1392, plantFieldClick:1414, knowsFn:1437, testMonsterMeat:1502, testCautiously:1553, experimentWith:1721, watchFauna:1809, askSystemAbout:1837, storageTier:1881, expandStorage:1884, preyWariness:1930 … +16 |
| `src/js/storage.js` | 9/47 | hasToolItem:110, woodcutTier:119, cutInfo:142, addMaterial:158, materialCount:168, spendMaterial:174, pruneBranches:191, gatherFallen:217, _stashLedgers:265, _stashItemLedgers:283, _stashToolLedgers:294, _stashItemGrant:303, _stashTotalNet:315, donateMaterial:341, takeMaterial:386, phoenixHonorDeposit:462, donateTool:481, takeTool:536, isStashableWeapon:599, isMedicine:611, _depositStashedItem:619, donateWeapon:677, donateMedicine:678, _takeStashedItem:681, takeWeapon:734 … +13 |
| `src/js/alienPlayers.js` | 52/89 | _castFlag:154, _apContestDraw:170, apAbilityKit:362, apAlienTech:388, apBuildFighter:424, apStartEncounter:469, apCombatIntro:562, apPilotTaunt:602, apCombatLine:617, apSayCombat:628, apVoiceRecord:661, apSpeak:675, apCombatChatter:685, apWealthStance:741, apApplyWealthStance:762, apProgressRate:814, apProgressLevel:819, apProgressiveKit:830, apProgressiveTech:840, apGroupBanter:909, apStartGroupEncounter:996, apOnCombatEnd:1034, apIsArsonist:2190, apPlaygroundKill:2202, apPlaygroundBurn:2270 … +12 |
| `src/js/sigW4.js` | 22/59 | sigVerbCount:126, tbCongAccept:189, tbCongHeresy:217, strikeState:237, strikeDemands:241, sigStrikeHook:249, tbStrikeMeet:292, tbStrikeScab:333, inflState:346, sigInfluencerHook:346, tbInflOutentertain:381, auditState:394, sigAuditHook:395, tbAuditRead:436, suburbState:480, sigSuburbHook:483, tbSuburbRest:506, tbSuburbLeave:532, tbSuburbAlive:549, eulogyState:561, sigEulogyHook:575, tbEulogyContradict:605, tbEulogyRewrite:613, algoState:637, sigAlgorithmHook:639 … +12 |
| `src/js/sigW5.js` | 10/45 | roll:117, clampN:120, fullMove:139, abName:145, abId:149, abLevel:150, cxStamp:159, edCut:240, rrTake:386, spAnnounce:445, tsReschedule:533, niWatch:619, fiFinale:690, nnNote:761, nnNextNote:856, nnApplyNote:860, nnApplyBad:876, nnRevertBad:887, tbCxOffScript:985, tbCxSpendFavor:1009, tbEdRetrieve:1049, tbEdContradict:1087, tbRrLeaveMessage:1112, tbRrReadMessages:1138, tbSpAsk:1147 … +10 |
| `src/js/hierarchy.js` | 63/96 | _courtshipNextStep:416, payTribute:826, primaryDemand:1157, answerDemand:1175, proveWorth:1263, breakLink:1272, renegotiateLink:1362, bidForPrimacy:1386, _linkNeglected:1472, theirLeaderDied:1597, answerRenegotiation:1647, kingdomEndingEligible:1756, _judgePeer:2682, _proposePeer:2710, proposeCovenant:2761, proposeTrade:2764, _stagePeerCounter:2768, _formPeerLink:2794, _leaguePoolRate:2877, covenantTick:2886, tradeTick:2989, drawLeaguePool:3029, _musterAway:3044, _sendAwayParty:3090, answerDefenseCall:3111 … +8 |
| `src/js/finale-campaign.js` | 12/42 | muster:45, survivors:49, heartFloor:54, titanEntryGate:79, finaleNodeReady:99, finaleReinforce:106, finaleMonsterDef:140, freeSpotNear:143, injectMonster:158, markFight:187, finaleCrewSetup:199, finaleOpeningSetup:213, finaleHeartSetup:225, finaleGrieve:292, finaleInterlude:334, finaleSpawnNext:364, finaleResolveNode:374, fiSkyZones:467, fiInZone:476, fiResolveSky:479, fiArmSky:504, fiCreditsBurn:511, fiFinaleHeart:525, btn:600, spoilUsed:612 … +5 |
| `src/js/table.js` | 12/42 | pathDef:49, tableEarnedPaths:101, tablePromiseTally:134, tableSwitchTally:153, tableBranch:161, winDayFloorOk:328, winDayFloorDefer:330, tableLiveWrap:360, tablePrompt:378, tableScene:391, tableAnnounce:443, tableTakeSeat:469, tableOfferPaths:479, escHtml:491, chooseTableOption:497, tableStartPath:525, tableRunBeat:619, tableChoose:635, tableFail:690, tableDowngradePick:739, tableFinals:744, tableResolveFinal:765, tableResolveDemandPrice:816, castTakingMourners:837, kidsBackOutcome:845 … +5 |
| `src/js/ledger.js` | 46/75 | text:122, text:123, text:132, text:133, text:138, text:141, text:142, text:143, text:150, text:151, text:154, text:162, text:163, hearGossipAboutSelf:438, legendSurface:452, shareFood:525, hoardFood:554, exposeFallout:567, warnChallenge:1150, challengeCountdownText:1188, expectedButLeft:1197, arenaDeath:1216, replayFootage:1238, arenaAct:1258, returnFromArena:1297 … +4 |
| `src/js/engine/modifiers.js` | 19/44 | fire_heat:237, heal_bonus:241, hunt_success:247, combat_crit:251, trust_gain:258, lie_detect:259, fear_resist:261, storm_warning:263, ambush_avoid:264, scout_find:265, scavenge_find:266, travel_lost:267, party_damage:268, party_coord:269, disease_resist:270, system_favor:271, fish_rare:280, forage_yield:281, hasKnowledgeUnlock:309, describeModifier:329, pct:351, trimNum:352, custom:372, custom:373, custom:384 |
| `src/js/pods.js` | 8/33 | first:51, podAsk:96, podAnswer:195, podChampioned:235, podShrugged:242, podJackpotLost:251, podJackpotWon:259, podConscripted:261, podBrokenPromises:262, podKidsReturned:263, day:269, first:272, podJackpotStage:277, podJackpotSpin:293, podJackpotWin:295, podJackpotLoss:313, podDemandAvailable:345, podDemandCost:352, podOversightEpilogue:391, podJackpotLossEpilogue:424, podConscriptOffer:432, podConscriptAnswer:442, podWitnessMaterial:486, podJackpotChoose:500, podJackpotApproach:508 |
| `src/js/comms.js` | 18/42 | _vname:129, _speakerName:132, _links:140, _otherId:143, callForHelp:210, aidRunnerAway:238, aidRoadHot:251, aidPickRunner:253, aidSendRunner:276, aidSignalFire:346, aidSystemRelay:389, aidCryAbilities:444, aidCry:461, aidAskVillage:496, aidHelpArrived:604, repayAidDebt:618, aidAllyDown:695, answerSystemFavor:849, switchboardCandidates:871, appointSwitchboard:919, removeSwitchboard:990, switchboardRoute:1011, confrontSwitchboard:1095, switchboardLog:1095 |
| `src/js/godhood.js` | 22/45 | villagerMythicId:248, playerMythicId:257, godhoodBargaining:265, raiseEcho:279, resetFightVerbs:295, chooseTerms:302, feedMultitude:320, resetDayVerbs:335, turnPain:345, noLiesCheck:364, marketMarkers:378, auditDue:380, auditCollect:389, namePrice:419, buyPassage:477, buyOff:516, guardCoins:529, guardRegen:572, walkHorizon:588, phaseOut:603, takeWound:614, recognitionCeremony:673, mythicSprite:815 |
| `src/js/justice.js` | 12/35 | justiceExiled:118, justicePickConfronter:206, justiceVoiceData:226, justiceVoiceMatch:228, justiceVoiceFill:241, justiceVoicePick:247, justiceConfront:260, justicePendingConfront:315, justiceRestitutionOwed:320, justiceRespond:329, justiceDemandMoot:410, syncJusticeAfterMoot:470, mootAccuserAftermath:495, justiceExileGuards:545, startVillageUprising:570, uprisingAftermath:704, tbTalkTactics:797, tbPlayerTalk:810, tbHostileTalk:935, G.playerAttacks:1021, G.packFromPantry:1040, G.tbHostileTurn:1048, say:1099 |
| `src/js/titans.js` | 18/40 | titanOmen:81, titanLinkOther:210, titanAlliedFaces:214, titanWarCouncil:235, soundTitanCall:272, titanVolunteers:324, titanBladeName:361, titanHavenBlades:366, titanCommitOwn:374, titanSelfActions:432, titanSelfDo:480, titanReleaseCommitted:492, titanGearValue:498, titanOutfit:513, titanTelegraphArming:573, titanTemptation:581, titanTurn:631, titanInjectAllies:813, titanResolveFight:861, titanVictory:921, titanGrantRelic:961, titanMusterState:961 |
| `src/js/conversation.js` | 123/143 | cleanDialogue:487, quoteWrap:495, npcVoiceFingerprint:604, flush:778, convoThreadResolve:1250, convoSaidFacts:1479, convoSaidFact:1487, convoFactRecalled:1496, convoFactConflict:1501, convoVoiceSig:1509, convoSkillOriginLine:1729, convoHonestPassReact:1995, convoHesitationMs:2069, exh:2491, say:2640, convoFollowups:3120, pushReact:3680, qok2:4485, convoUI:5631, langExposureReport:5906 |
| `src/js/convo-wants.js` | 86/104 | build:152, build:178, deflectBeat:436, deflectBeat:841, opener:887, engageBeat:888, deflectBeat:891, menuOptions:903, closeLine:918, resolve:921, deflectBeat:945, deflectBeat:995, deflectBeat:1042, commitBeat:1044, convoFavorRenounce:1297, convoFavorDeadlineNote:1406, convoWantWarning:1688, convoWant:1856 |
| `src/js/truth.js` | 38/56 | allDoubts:655, resolveDoubt:660, doubtIsLead:763, observePerson:779, observationTell:858, occTellVerb:870, socialLedger:1022, noteSocialLesson:1026, truthRefuse:1050, confrontEvidenceText:1064, confrontWindup:1074, accuserPays:1186, plotBehindDoubt:1221, confrontDoubt:1229, confrontTheft:1548, doubtsHTML:1655, Game.trackClaimSilent:1874, Game.peopleJournal:2006 |
| `src/js/sigW3b.js` | 9/26 | roll:81, compass:94, chorusBeat:272, tosClauses:409, tosDefById:484, tosNextClause:486, tosScheduleAccept:495, tosFirePenalty:503, tosPayObject:539, tbSpoolExamineReel:585, tbChorusDance:611, tbChorusThrowGravel:636, tbTosRead:656, tbTosObject:684, tbTosAccept:707, tbTosInvokeLoophole:724, lroll:790 |
| `src/js/voice-piper.js` | 4/21 | hashStr:65, clamp:71, lsSet:73, voiceProfileFor:81, setVoiceEnabled:134, unlockVoice:150, loadTts:161, refreshVoiceCache:174, voicePackStatus:187, ensureVoicePack:194, ensureVoicePacks:208, voiceVerifyIds:217, pickDeviceVoice:244, speakFallback:257, speakPiper:272, voiceStop:295, paintVoiceToggle:335 |
| `src/js/party.js` | 39/54 | isFollower:78, dismissFromParty:236, npcLeavesParty:256, playerAttacks:561, _duelResolveDare:727, partyButtonHtml:864, partyHud:884, togglePartyPanel:901, isPartyPanelOpen:905, partyMemberStatus:912, _pesc:926, partyPanelHTML:933, allyStripHTML:960, tbHostileTurn:980, say:1498 |
| `src/js/buildarounds.js` | 13/27 | baPathCount:28, fightState:41, dayState:49, onStrikeMiss:76, unleash:113, mark:141, socialMult:265, onForage:306, forageMult:327, redHarvestHeal:347, crimsonGodParty:367, deadeyeMark:376, deadeyeAllyMult:387, lifebringerRevive:403 |
| `src/js/membership.js` | 27/41 | memberBenefits:128, awayMembers:148, severMembership:201, rejoinMembership:223, buildShelter:261, refuseApplication:499, formAlliance:735, recognizedAbroad:762, memberReputationAbroad:778, proposeAlliance:790, guestMeal:844, G.exilePlayer:1137, G.joinVillageReal:1137, G.foundHaven:1137 |
| `src/js/party-formal.js` | 29/43 | partyRoster:90, nameParty:225, disbandParty:258, assignRole:270, clearRole:301, roleBonus:303, orderMember:309, execOrder:333, splitParty:493, resolveSplitTeam:521, applySplitDeath:572, partyCardHtml:752, Game.dismissFromParty:914, Game.partyButtonHtml:973 |
| `src/js/table-relay.js` | 0/14 | meterLine:11, mergeCheck:23, verbChoice:35, COCKPIT:42, prereq:67, grant:78, grant:82, grant:85, grant:90, grant:91, grant:92, grant:101, grant:104, grant:108 |
| `src/js/carexplore.js` | 0/13 | hashStr:68, edibleStacks:75, npcTemper:83, npcIntelPrimary:87, trustOf:91, setTrust:97, isPublic:101, Game.giveFood:114, Game.comfort:273, Game.tileFeature:398, Game.examineCell:417, Game.giveFoodOptions:815, Game.comfortOptions:825 |
| `src/js/corruption.js` | 22/35 | corruptionOf:55, addCorruption:63, corruptionThresholdBeat:79, addFear:157, fearWeakness:177, humanMeatItem:198, corpseButcher:212, eatCannibal:264, discoverNpcCannibalism:420, darkShowBeat:521, nearButcherableCorpse:560, G.eatOne:760, G.intimidate:783 |
| `src/js/engine/state.js` | 8/21 | hasMigrationPath:112, migrateSave:124, tombstoneKey:214, writeTombstone:218, quarantineKey:249, takeQuarantineNotice:303, listQuarantines:310, restoreQuarantine:330, scanSaveBlobs:366, adoptEntry:381, listSaves:392, load:499, wipeAll:532 |
| `src/js/safetynets.js` | 31/44 | _speaker:192, answerAidQuest:329, _questFetchMatch:350, handInAidQuest:366, abandonAidQuest:408, _completeAidQuest:457, _triageRun:607, answerRelief:680, _linkById:792, aidRequestable:801, requestAid:824, resolveAidOut:852, stockPantry:1335 |
| `src/js/sigW3a.js` | 39/52 | roll2:76, escHtml:84, sigRedactorShove:256, sigGavelPickCrime:382, sigGavelHook:397, sigStrikeAttacker:601, tbPlayerDodge:684, tbPlayerGavelObject:710, tbPlayerGavelRecess:747, tbPlayerGavelConfess:765, sigCombatAct:850, sigFieldGavel:903, sigGavel:957 |
| `src/js/sigW3c.js` | 22/35 | dmgRangeOf:70, cbAbilityName:125, cbDissolve:204, sigMirageOn:247, bufAnnounce:249, bufExecute:281, bufHook:310, consume:512, tbPlayerFuneral:552, tbPlayerNameIt:579, tbPlayerCloseEyes:606, sigW3cWireCombat:694, G.bufAfterimageCells:763 |
| `src/js/villageAgency.js` | 25/38 | answerSuccession:386, petitionInterview:670, _vaPantryPerMouth:745, _vaMootSpeech:755, _vaPetitionScore:766, conductPetitionMoot:786, answerPetition:852, _vaFinishPetition:873, _vaAdmitPetitioners:939, havenRoom:1122, aidVillage:1134, answerBeg:1196, answerRaidDefense:1259 |
| `src/js/codex-people.js` | 12/24 | sys:57, ensurePersonLifeseed:82, revealForLevel:138, confirmField:191, noteSharedHistory:207, theirViewOfYou:217, posthumousReveal:249, personDepthHTML:301, Game.resolveDoubt:412, Game.examineCorpse:464, Game.defendAlibi:475, Game.approachWeakest:486 |
| `src/js/table-defiant.js` | 1/13 | meterLine:11, pantryKcal:15, relayPerson:22, prereq:57, say:80, say:89, say:96, choices:101, effects:120, effects:132, say:143, choices:149 |
| `src/js/convoTopics.js` | 41/52 | topic2SubjectOpts:231, t2gen_oldworld:486, t2fol_oldworld:499, dn:633, fillNames:635, t2gen_systemtake:733, t2fol_systemtake:758, t2gen_advice:772, t2fol_advice:797, t2gen_loved:811, t2fol_loved:841 |
| `src/js/corpses.js` | 19/30 | corpseAt:104, corpseGlyph:118, corpseTakeItem:482, corpseUseItem:544, corpseEatItem:566, lootCorpse:618, corpseDesc:706, examineCorpse:763, payRespects:788, buryCorpse:807, knowsDeath:876 |
| `src/js/relay-ext.js` | 12/22 | relayProbe:137, relayDeepen:190, relayBackfire:231, relayTranslate:301, relaySanctuary:325, relayAdvocate:336, relayRewrite:359, relaySkim:376, relaySight:394, relayCarry:411 |
| `src/js/pantheon.js` | 22/31 | godAttitudes:193, godFaction:208, factions:215, godRivalry:221, DISFAVOR_LINES:231, DISFAVOR_LINES:232, DISFAVOR_LINES:233, COLD_LINES:236, architectCredit:323 |
| `src/js/table-beloved.js` | 1/10 | meterLine:11, castNames:16, fanFavor:28, prereq:60, grant:78, say:90, choices:94, say:121, choices:126 |
| `src/js/equipment.js` | 18/26 | slotLabel:65, fullSetSlots:101, blockedSlots:108, isSlotBlocked:122, meleeWeaponOf:274, threatLevel:412, threatLabel:423, gearDescription:427 |
| `src/js/partyTactics.js` | 15/23 | tbDensestFighter:151, tbPartyCentroid:168, tbIdeaDrift:222, tbEvictionWallCells:265, tbRaiseEvictionWall:303, tbClearEvictionWall:349, tbWallActive:364, HB.landlordEviction:492 |
| `src/js/records.js` | 8/16 | trackSecret:74, secretTracked:79, isRevealed:83, revealSecret:90, architectCredit:104, publicLines:115, secretLines:121, recordCount:125 |
| `src/js/table-feared.js` | 2/10 | meterLine:16, prereq:49, grant:69, choices:88, say:98, choices:103, tableTrialByCombat:137, tableTrialResume:179 |
| `src/js/table-witness.js` | 1/9 | meterLine:11, witnesses:23, prereq:109, say:132, say:144, choices:158, say:180, choices:185 |
| `src/js/metaProgression.js` | 25/32 | removeItem:149, metaReset:191, metaList:217, metaSummary:224, metaNoteTable:369, metaNoteTableChoice:375, metaNoteCure:415 |
| `src/js/voice-system.js` | 2/9 | normVoiceText:55, buildTextIndex:67, entryFor:79, playSystemLine:90, Game.systemLineEntry:120, Game.systemLineIds:121, Game.systemVoiceIdFor:128 |
| `src/js/party-bond.js` | 14/20 | firstName:65, vnameOf:262, villageBondGrowth:281, isNewcomer:311, braveryOf:320, findVeteranBuddy:331 |
| `src/js/progression.js` | 52/58 | pick:67, line:93, integrationStageName:138, pacingStats:178, arcName:470, auditItemPool:998 |
| `src/js/relay-dialogue.js` | 21/27 | weakVillageName:99, villageNameList:117, needs:366, relayLeanLabel:528, relayAllScenes:548, relaySceneById:549 |
| `src/js/table-assimilated.js` | 0/6 | meterLine:11, prereq:23, effects:51, say:51, say:64, choices:69 |
| `src/js/table-indispensable.js` | 1/7 | meterLine:11, pantryKcal:32, prereq:47, say:76, say:97, choices:102 |
| `src/js/examine.js` | 5/10 | observedPlant:58, examineDescription:82, resolveCellSpecies:164, examinePlantCell:192, plantVisualDepth:276 |
| `src/js/feastBuff.js` | 15/20 | feastedLine:264, _feastHpTotal:315, _feastHealBonus:350, faceFeastDraw:507, driveOffFeastDraw:530 |
| `src/js/galactic-cast.js` | 9/14 | G.castKnows:90, G.castDisplayName:96, castById:137, G.castProducerDemand:177, G.castSignOff:201 |
| `src/js/villager-agency.js` | 39/44 | codexDeeds:690, npcViewership:699, playerBoardScore:707, villagerBoard:717, isMedicinal:1157 |
| `src/js/broadcast.js` | 10/13 | esc:137, G.broadcastWatching:289, G.broadcastTickerHTML:293 |
| `src/js/memdepth.js` | 6/9 | grievanceSay:38, grievanceNoteFor:53, convoGrievanceLine:68 |
| `src/js/perceive.js` | 0/3 | playerIntel:36, isObservant:44, Game.perceptionHints:54 |
| `src/js/spawn-knack.js` | 10/13 | knackDef:48, chooseKnack:99, Game.systemArrivalBeats:202 |
| `src/js/statusEffects.js` | 21/24 | cureStatus:472, seSteps:546, cureEffectFor:714 |
| `src/js/contestEngine.js` | 22/24 | st:454, apply:794 |
| `src/js/convo-scene.js` | 4/6 | validateAskContract:182, convoRecallYouSaid:320 |
| `src/js/engine/forage.js` | 1/3 | weightedPick:19, forage:32 |
| `src/js/lifeseed.js` | 22/24 | npcKeepsakeLine:340, auditLifeseeds:453 |
| `src/js/monsterBehaviors.js` | 6/8 | blocked:153, droneCrowdOverload:182 |
| `src/js/villager-mapmem.js` | 9/11 | mapmemTell:248, mapmemHaulAt:347 |
| `src/js/audio-registry.js` | 0/1 | resolveHook:185 |
| `src/js/convo-beats.js` | 9/10 | Game.bridgeLine:177 |
| `src/js/engine/day.js` | 0/1 | newDay:29 |
| `src/js/fieldFights.js` | 10/11 | villagerSpendFood:190 |
| `src/js/foodPower.js` | 13/14 | Game.activateAbility:197 |
| `src/js/practice-deeds.js` | 5/6 | practiceDeedLine:124 |
| `src/js/scaleDiscovery.js` | 33/34 | scaleDiscovery:69 |
| `src/js/standing.js` | 4/5 | standingLine:121 |
| `src/js/telemetry-hooks.js` | 5/6 | tstate:32 |
| `src/js/waveLedger.js` | 6/7 | ledgerProgressLine:205 |
| `src/js/build.js` | 0/0 |  |
| `src/js/convo-dialogue.js` | 6/6 |  |
| `src/js/convo-mood.js` | 10/10 |  |
| `src/js/engine/calories.js` | 4/4 |  |
| `src/js/engine/combat.js` | 13/13 |  |
| `src/js/havenGrowth.js` | 17/17 |  |
| `src/js/party-wiring.js` | 4/4 |  |
| `src/js/trial-deeds.js` | 5/5 |  |
| `src/js/villager-objectives.js` | 21/21 |  |

## Run outcomes

- capable/s42: 150d survived, abilities 6, synergies 1, integ 100
- capable/s1234: 150d survived, abilities 6, synergies 1, integ 100
- capable/s99: 148d village-dead, abilities 6, synergies 0, integ 100
- competent/s42: 150d survived, abilities 6, synergies 0, integ 100
- competent/s99: 150d survived, abilities 6, synergies 2, integ 100
- capable/s7: 150d survived, abilities 6, synergies 1, integ 100
- competent/s1234: 30d village-lost, abilities 6, synergies 0, integ 100
- competent/s7: 150d survived, abilities 6, synergies 0, integ 100
