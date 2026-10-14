# Sim audit — after-fixes (2026-10-14)

32 runs: policies competent, risk-aware, larceny-leaning, kind, deed-seeking, winseek, oraclev2, socialite × seeds 7, 42, 99, 1234 × 150 days. Crashes: 0.

## Swallowed errors (4 sites, 205 total)

| runs | count | site | first message |
|---|---|---|---|
| 32/32 | 120 | `src/js/game.js:16881` | Cannot read properties of null (reading 'px') |
| 32/32 | 51 | `src/js/engine/state.js:510` | localStorage is not defined |
| 32/32 | 32 | `src/js/game.js:30503` | Cannot read properties of null (reading 'px') |
| 2/32 | 2 | `src/js/progression.js:1033` | Cannot read properties of undefined (reading '0') |

## Function coverage: 2617/4467 named functions ran at least once (59%)

| file | ran | never ran (name:line) |
|---|---|---|
| `src/js/game.js` | 848/1180 | makeLogEntry:199, logText:209, randomLandingZone:338, langLabel:1628, langNote:1645, conflictNote:1648, npcHomeRegion:2424, dominantNeed:2477, nvTrust:2490, nonverbalRead:2498, nonverbalGesture:2557, nonverbalDraw:2605, nonverbalDrawCheck:2634, hasContestedWith:2753, callOutTeaching:2762, learnRecipe:3044, setNet:3371, plantGenesis:3487, readBook:3535, edibleCount:3568, giveFood:3574, intimidate:3762, offerDeal:3895, goalTaskAffinity:3967, appealToGoal:3976 … +307 |
| `src/js/debug-scenarios.js` | 0/146 | freshGame:41, giveWeapon:51, spawnAnimalNear:66, spawnAnimalAt:81, rosterIds:96, placeVillagers:104, npcName:120, toWildNode:132, deer:160, rabbit:178, squirrel:189, turkey:200, opossum:211, bullfrog:222, boxturtle:232, fox:241, crayfish:253, raccoon:263, snappingturtle:272, chub:284, day7:296, uprising:299, day1:341, language:344, liars:360 … +121 |
| `src/js/contests.js` | 166/284 | G._cxStipulationLine:649, G._showGenericBeat:1952, A.<computed>:2871, G._contestGeneric:4292, G._contestRefuse:5436, setup:5463, turn:5464, end:5465, setup:5474, turn:5475, end:5476, setup:5479, turn:5481, end:5482, setup:5485, turn:5486, end:5487, setup:5491, turn:5492, end:5493, setup:5496, turn:5497, end:5498, setup:5502, turn:5503 … +93 |
| `src/js/abilityActions.js` | 2/94 | time_min:47, kcal:53, hp:66, turn:81, activateAbility:100, abilityActionDef:128, actionContextValid:146, payActionCost:164, useAbility:206, activatableAbilities:344, _actionAvailable:391, _stanceHint:437, _legacyActivatables:597, game_sense.read_stance:712, trade_of_blows.settle_debt:718, unbreakable.shake_off:725, war_cry.bellow:730, haymaker.throw_haymaker:741, retribution.unleash:749, animal_ken.calm_beast:768, field_dressing.dress_game:774, molt.shed_skin:799, scream_cheese.scream:808, pocket_sand.throw_sand:819, shoulder_check.shove:826 … +67 |
| `src/js/betrayal.js` | 90/168 | acceptInvite:362, declineInvite:373, declineLine:395, resolveInvite:411, inviteReward:461, Cap:606, ambushExchange:664, ambushAftermath:992, showWounds:1175, examineAmbushSite:1185, nameWitnesses:1203, pressAccomplice:1223, approachWeakest:1278, letItLie:1301, payBribe:1407, bribeVoter:1440, bribeDigMissLine:1467, investigateBribery:1482, exposeBribery:1496, recentTrauma:1633, castPlayerVote:1682, villageRoom:2022, petitionVillage:2028, joinVillageReal:2120, drift:2213 … +53 |
| `src/js/journal.js` | 84/135 | part:89, confirm:91, thin:92, poison:94, triumph:96, part:104, confirm:106, thin:107, poison:109, triumph:111, part:119, confirm:121, thin:122, poison:124, triumph:126, part:134, confirm:136, thin:137, poison:139, triumph:141, part:149, confirm:151, thin:152, poison:154, triumph:156 … +26 |
| `src/js/encounters.js` | 16/58 | G.encAnimalLevel:108, G.encQueueOf:162, G.encPickCue:171, G.encPhase:180, G.encAudio:200, G.say:225, G.feedbackMark:238, G.feedbackLines:241, G.feedback:257, G.encAnimalLabel:338, G.encCap:344, G.encAnimalLabel:351, G.encNeverBolt:382, G.encFleeText:439, G.encSlowMissVerb:444, G.encChaseText:460, G.encKillLine:718, G.encButcherHonesty:752, G.encWaryText:799, G.encBoltDir:814, G.encPreyPhase:824, G.encPreyPhaseBadge:826, G.encWeaponMethod:838, G.encMethodWords:848, G.encMethodToolReady:865 … +17 |
| `src/js/convo-wants.js` | 57/97 | build:152, build:178, gossipLine:386, engageBeat:432, deflectBeat:436, engageBeat:544, deflectBeat:590, commitBeat:614, opener:742, engageBeat:774, deflectBeat:775, menuOptions:786, closeLine:802, resolve:803, engageBeat:835, deflectBeat:841, opener:887, engageBeat:888, deflectBeat:891, menuOptions:903, closeLine:918, resolve:921, engageBeat:944, deflectBeat:945, menuOptions:956 … +15 |
| `src/js/convoTopics.js` | 9/47 | t2pers:40, t2fear:41, t2cap:42, t2band:44, t2pro:49, t2fill:57, t2pick:85, t2clock:92, t2changeLine:98, topic2Deep:125, topic2MoreLabel:151, topic2AskLabel:158, topic2Ask:163, topic2HasMore:184, topic2Beat:190, topic2SubjectOpts:231, t2gen_you:386, t2fol_you:428, t2gen_fears:453, t2fol_fears:464, t2gen_oldworld:486, t2fol_oldworld:499, t2intelTrait:517, t2gen_skills:526, t2fol_skills:541 … +13 |
| `src/js/food.js` | 63/101 | shellNuts:450, dropRotten:625, preserveFood:688, renderFat:773, pemmicanSets:815, pemmicanPlan:835, pemmicanPreview:882, makePemmican:889, foodMarker:946, spoilClockShort:1003, specialistsHere:1055, specOccLabel:1077, askSpecialist:1084, villageHasSpecialty:1301, whoKnowsLump:1392, testMonsterMeat:1502, testCautiously:1553, experimentWith:1721, watchFauna:1809, askSystemAbout:1837, storageTier:1881, expandStorage:1884, preyWariness:1930, preyReaction:1938, feastBurn:2166 … +13 |
| `src/js/storage.js` | 9/47 | hasToolItem:110, woodcutTier:119, cutInfo:142, addMaterial:158, materialCount:168, spendMaterial:174, pruneBranches:191, gatherFallen:217, _stashLedgers:265, _stashItemLedgers:283, _stashToolLedgers:294, _stashItemGrant:303, _stashTotalNet:315, donateMaterial:341, takeMaterial:386, phoenixHonorDeposit:462, donateTool:481, takeTool:536, isStashableWeapon:599, isMedicine:611, _depositStashedItem:619, donateWeapon:677, donateMedicine:678, _takeStashedItem:681, takeWeapon:734 … +13 |
| `src/js/conversation.js` | 97/134 | cleanDialogue:487, quoteWrap:495, npcVoiceFingerprint:604, flush:778, convoSelfRepeatLine:977, convoThreadResolve:1250, convoRecapLine:1438, convoSaidFacts:1479, convoSaidFact:1487, convoFactRecalled:1496, convoFactConflict:1501, convoVoiceSig:1509, convoSkillOriginLine:1729, convoHonestPassReact:1995, convoHesitationMs:2069, convoDeepTick:2095, convoThreadBeat:2454, convoAskTopic:2487, convoBeatOf:3099, convoFollowups:3120, shiftDisposition:3182, dispositionCostMult:3284, markEscalated:3289, pushReact:3680, convoGoonLabel:4122 … +12 |
| `src/js/table.js` | 7/40 | pathDef:49, tableEarnedPaths:101, tablePromiseTally:134, tableSwitchTally:153, tableBranch:161, addGrounding:246, groundingReactionBeats:258, sysBond:292, addSysBond:294, winDayFloorOk:328, winDayFloorDefer:330, tableLiveWrap:360, tablePrompt:378, tableScene:391, tableInvite:439, tableOfferPaths:467, escHtml:484, chooseTableOption:488, tableStartPath:524, tableRunBeat:618, tableChoose:634, tableFail:689, tableDowngradePick:738, tableFinals:743, tableResolveFinal:764 … +8 |
| `src/js/finale-campaign.js` | 9/41 | muster:45, survivors:49, heartFloor:54, finaleCampaignPlace:63, finaleNodeReady:99, finaleReinforce:106, finaleMonsterDef:140, freeSpotNear:143, injectMonster:158, markFight:187, finaleCrewSetup:199, finaleOpeningSetup:213, finaleHeartSetup:225, finaleGrieve:292, finaleInterlude:334, finaleSpawnNext:364, finaleResolveNode:374, fiSkyZones:467, fiInZone:476, fiResolveSky:479, fiArmSky:504, fiCreditsBurn:511, fiFinaleHeart:525, fiHeartMonster:586, finaleCampaignButtons:590 … +7 |
| `src/js/ledger.js` | 43/75 | text:122, text:123, text:133, text:138, text:141, text:142, text:143, text:146, text:147, text:150, text:151, text:154, text:157, text:158, text:159, text:162, text:163, hearGossipAboutSelf:438, legendSurface:452, hoardFood:554, exposeFallout:567, warnChallenge:1150, challengeCountdownText:1188, expectedButLeft:1197, arenaDeath:1216 … +7 |
| `src/js/sigW4.js` | 28/58 | liveMonsters:83, escHtml:90, playerFighter:95, spendPlayerTurn:98, endPlayerTurn:105, sigVerbCount:126, congState:135, sigCongregationHook:140, tbCongAccept:189, tbCongRefuse:208, tbCongHeresy:217, strikeState:237, strikeDemands:241, sigStrikeHook:249, tbStrikeMeet:292, tbStrikeScab:333, tbInflOutentertain:381, tbAuditRead:436, tbSuburbRest:506, tbSuburbLeave:532, tbSuburbAlive:549, tbEulogyContradict:605, tbEulogyRewrite:613, tbAlgoTank:656, tbEaterPoison:719 … +5 |
| `src/js/sigW5.js` | 15/45 | roll:117, liveMonsters:122, w5monster:129, fiMonster:135, abName:145, abId:149, abLevel:150, cxStamp:159, rrTake:386, spAnnounce:445, niWatch:619, fiFinale:690, nnApplyBad:876, nnRevertBad:887, tbCxOffScript:985, tbCxSpendFavor:1009, tbEdRetrieve:1049, tbEdContradict:1087, tbRrLeaveMessage:1112, tbRrReadMessages:1138, tbSpAsk:1147, tbSpCheapFulfill:1169, tbTsOwnVenue:1205, tbNiPlayToCamera:1226, tbFiSacrifice:1240 … +5 |
| `src/js/hierarchy.js` | 67/96 | _courtshipNextStep:416, tendLink:884, breakLink:1272, renegotiateLink:1362, bidForPrimacy:1386, _linkNeglected:1472, theirLeaderDied:1597, _resolveRenegotiation:1715, kingdomEndingEligible:1756, stageNationalBeat:2117, answerNationalChoice:2197, stageGlobalBeat:2559, answerGlobalChoice:2586, _judgePeer:2682, proposeTrade:2764, _stagePeerCounter:2768, _formPeerLink:2794, _leaguePoolRate:2877, covenantTick:2886, tradeTick:2989, drawLeaguePool:3029, answerDefenseCall:3111, answerTradeCall:3153, covenantCrisis:3198, answerCovenantCrisis:3228 … +4 |
| `src/js/relay-dialogue.js` | 0/27 | rstate:45, bandOf:58, invItems:69, itemDef:72, keepsakeName:82, otherVillages:93, weakVillageName:99, omenVillageName:108, villageNameList:117, rewriteUses:125, substTokens:127, needs:252, needs:290, needs:311, needs:366, pickNext:486, relayLean:499, addRelayLean:507, relayBand:524, relayLeanLabel:528, relayLeanNoticed:533, relayAllScenes:548, relaySceneById:549, pendingRelayScene:551, relayCommuneScene:558 … +2 |
| `src/js/titans.js` | 14/40 | titanOmen:81, titanMaybeOmen:116, titanPlace:147, titanAlliedLinks:202, titanLinkOther:210, titanAlliedFaces:214, titanWarCouncil:235, soundTitanCall:272, titanVolunteers:324, titanBladeName:361, titanHavenBlades:366, titanCommitOwn:374, titanSelfActions:432, titanSelfDo:480, titanReleaseCommitted:492, titanGearValue:498, titanOutfit:513, titanTelegraphArming:573, titanTemptation:581, titanTurn:631, titanInjectAllies:813, titanResolveFight:861, titanVictory:921, titanGrantRelic:961, titanDef:961 … +1 |
| `src/js/pods.js` | 8/33 | first:51, podAsk:96, podAnswer:195, podChampioned:235, podShrugged:242, podJackpotLost:251, podJackpotWon:259, podConscripted:261, podBrokenPromises:262, podKidsReturned:263, day:269, first:272, podJackpotStage:277, podJackpotSpin:293, podJackpotWin:295, podJackpotLoss:313, podDemandAvailable:345, podDemandCost:352, podOversightEpilogue:391, podJackpotLossEpilogue:424, podConscriptOffer:432, podConscriptAnswer:442, podWitnessMaterial:486, podJackpotChoose:500, podJackpotApproach:508 |
| `src/js/truth.js` | 32/56 | getActiveLie:466, lieScrubLine:505, trackClaim:534, stampHeardStory:590, allDoubts:655, resolveDoubt:660, observePerson:779, observationTell:858, occTellVerb:870, socialLedger:1022, noteSocialLesson:1026, truthRefuse:1050, confrontEvidenceText:1064, confrontWindup:1074, accuserPays:1186, plotBehindDoubt:1221, confrontDoubt:1229, confrontTheft:1548, doubtsHTML:1655, Game.convoThreadBeat:1734, Game.convoAskTopic:1748, Game.trackClaimSilent:1874, Game.convoTurn:1938, Game.peopleJournal:2006 |
| `src/js/godhood.js` | 22/45 | villagerMythicId:248, playerMythicId:257, godhoodBargaining:265, raiseEcho:279, resetFightVerbs:295, chooseTerms:302, feedMultitude:320, resetDayVerbs:335, turnPain:345, noLiesCheck:364, marketMarkers:378, auditDue:380, auditCollect:389, namePrice:419, buyPassage:477, buyOff:516, guardCoins:529, guardRegen:572, walkHorizon:588, phaseOut:603, takeWound:614, recognitionCeremony:673, mythicSprite:815 |
| `src/js/party.js` | 29/52 | partyTrustFloor:148, inviteToParty:149, dismissFromParty:236, npcLeavesParty:256, freeNear:323, partyBetrayalState:402, betrayalIntent:409, betrayalOpportunity:454, playerSharp:509, npcBetrays:525, playerAttacks:561, startBetrayalCombat:593, _duelResolveDare:727, betrayalAftermath:739, partyButtonHtml:864, partyHud:884, togglePartyPanel:901, isPartyPanelOpen:905, partyMemberStatus:912, _pesc:926, partyPanelHTML:933, allyStripHTML:960, say:1498 |
| `src/js/comms.js` | 21/42 | _first:126, _vname:129, _speakerName:132, _otherId:143, aidRunnerAway:238, aidRoadHot:251, aidPickRunner:253, aidSendRunner:276, aidSystemRelay:389, aidCry:461, aidAskVillage:496, aidHelpArrived:604, repayAidDebt:618, aidAllyDown:695, answerSystemFavor:849, switchboardCandidates:871, appointSwitchboard:919, removeSwitchboard:990, switchboardRoute:1011, confrontSwitchboard:1095, switchboardLog:1095 |
| `src/js/party-formal.js` | 23/43 | partyRoster:90, partyNameOptions:205, nameParty:225, disbandParty:258, assignRole:270, clearRole:301, roleBonus:303, orderMember:309, execOrder:333, roleDefaultOrder:444, splitParty:493, resolveSplitTeam:521, applySplitDeath:572, partyDeathBeat:595, partyVictoryBeat:634, partyConvoTurn:688, partyCardHtml:752, Game.dismissFromParty:914, Game.convoTurn:949, Game.partyButtonHtml:973 |
| `src/js/relay-ext.js` | 3/22 | rstate:35, abils:42, relayTableLink:73, relayHas:81, relayGrant:84, claimRelay:100, relayProbe:137, relayReroute:165, relayDeepen:190, relayCommune:227, relayBackfire:231, relayUnlockCheck:276, relayTranslate:301, relaySanctuary:325, relayAdvocate:336, relayRewrite:359, relaySkim:376, relaySight:394, relayCarry:411 |
| `src/js/engine/modifiers.js` | 26/44 | fire_heat:237, hunt_success:247, trust_gain:258, storm_warning:263, ambush_avoid:264, scout_find:265, scavenge_find:266, travel_lost:267, disease_resist:270, system_favor:271, fish_rare:280, hasKnowledgeUnlock:309, describeModifier:329, pct:351, trimNum:352, custom:372, custom:373, custom:384 |
| `src/js/voice-piper.js` | 4/21 | hashStr:65, clamp:71, lsSet:73, voiceProfileFor:81, setVoiceEnabled:134, unlockVoice:150, loadTts:161, refreshVoiceCache:174, voicePackStatus:187, ensureVoicePack:194, ensureVoicePacks:208, voiceVerifyIds:217, pickDeviceVoice:244, speakFallback:257, speakPiper:272, voiceStop:295, paintVoiceToggle:335 |
| `src/js/alienPlayers.js` | 75/89 | _apContestDraw:170, apCombatLine:617, apSayCombat:628, apVoiceRecord:661, apSpeak:675, apGroupBanter:909, apStartGroupEncounter:996, apPlaygroundBurn:2270, apPlaygroundRookieMistake:2505, apFactionAligned:2616, apBeamResistLevel:2809, apBeamResistText:2815, apStasisFieldLive:3003, G.tbBarrierExit:3179 |
| `src/js/buildarounds.js` | 13/27 | baPathCount:28, fightState:41, dayState:49, onStrikeMiss:76, unleash:113, mark:141, socialMult:265, onForage:306, forageMult:327, redHarvestHeal:347, crimsonGodParty:367, deadeyeMark:376, deadeyeAllyMult:387, lifebringerRevive:403 |
| `src/js/pantheon.js` | 17/31 | godAttitudes:193, godFaction:208, factions:215, godRivalry:221, FAVOR_LINES:226, FAVOR_LINES:227, FAVOR_LINES:228, DISFAVOR_LINES:231, DISFAVOR_LINES:232, DISFAVOR_LINES:233, COLD_LINES:236, pick:240, emit:266, architectCredit:323 |
| `src/js/table-relay.js` | 0/14 | meterLine:11, mergeCheck:23, verbChoice:35, COCKPIT:42, prereq:67, grant:78, grant:82, grant:85, grant:90, grant:91, grant:92, grant:101, grant:104, grant:108 |
| `src/js/carexplore.js` | 0/13 | hashStr:68, edibleStacks:75, npcTemper:83, npcIntelPrimary:87, trustOf:91, setTrust:97, isPublic:101, Game.giveFood:114, Game.comfort:273, Game.tileFeature:398, Game.examineCell:417, Game.giveFoodOptions:815, Game.comfortOptions:825 |
| `src/js/corruption.js` | 22/35 | corruptionOf:55, addCorruption:63, corruptionThresholdBeat:79, addFear:157, fearWeakness:177, humanMeatItem:198, corpseButcher:212, eatCannibal:264, discoverNpcCannibalism:420, darkShowBeat:521, nearButcherableCorpse:560, G.eatOne:760, G.intimidate:783 |
| `src/js/engine/state.js` | 8/21 | hasMigrationPath:112, migrateSave:124, tombstoneKey:214, writeTombstone:218, quarantineKey:249, takeQuarantineNotice:303, listQuarantines:310, restoreQuarantine:330, scanSaveBlobs:366, adoptEntry:381, listSaves:392, load:499, wipeAll:532 |
| `src/js/safetynets.js` | 31/44 | _speaker:192, answerAidQuest:329, _questFetchMatch:350, handInAidQuest:366, abandonAidQuest:408, _completeAidQuest:457, _triageRun:607, answerRelief:680, _linkById:792, aidRequestable:801, requestAid:824, resolveAidOut:852, stockPantry:1335 |
| `src/js/sigW3b.js` | 13/26 | liveMonsters:86, tosFirePenalty:503, tosActiveMonster:534, tosPayObject:539, tbSpoolExamineReel:585, tbChorusDance:611, tbChorusThrowGravel:636, tbTosRead:656, tbTosObject:684, tbTosAccept:707, tbTosInvokeLoophole:724, sigW3bCombatButtons:739, lroll:790 |
| `src/js/codex-people.js` | 12/24 | sys:57, ensurePersonLifeseed:82, revealForLevel:138, confirmField:191, noteSharedHistory:207, theirViewOfYou:217, posthumousReveal:249, personDepthHTML:301, Game.resolveDoubt:412, Game.examineCorpse:464, Game.defendAlibi:475, Game.approachWeakest:486 |
| `src/js/justice.js` | 31/43 | justiceExiled:118, pick:286, justicePendingConfront:315, justiceRestitutionOwed:320, justiceRespond:329, pick:431, justiceExileGuards:545, tbTalkTactics:797, tbPlayerTalk:810, G.playerAttacks:1021, G.packFromPantry:1040, say:1099 |
| `src/js/membership.js` | 29/41 | memberBenefits:128, awayMembers:148, rejoinMembership:223, buildShelter:261, refuseApplication:499, formAlliance:735, recognizedAbroad:762, memberReputationAbroad:778, proposeAlliance:790, guestMeal:844, G.joinVillageReal:1137, G.foundHaven:1137 |
| `src/js/table-defiant.js` | 1/13 | meterLine:11, pantryKcal:15, relayPerson:22, prereq:57, say:80, say:89, say:96, choices:101, effects:120, effects:132, say:143, choices:149 |
| `src/js/corpses.js` | 19/30 | corpseAt:104, corpseGlyph:118, corpseTakeItem:482, corpseUseItem:544, corpseEatItem:566, lootCorpse:618, corpseDesc:706, examineCorpse:763, payRespects:788, buryCorpse:807, knowsDeath:876 |
| `src/js/sigW3a.js` | 41/52 | escHtml:84, isGavel:90, sigLiveGavelTrial:111, sigRedactorShove:256, tbPlayerDodge:684, tbPlayerGavelObject:710, tbPlayerGavelRecess:747, tbPlayerGavelConfess:765, sigCombatButtonsHTML:802, sigCombatAct:850, G.useAbility:1035 |
| `src/js/sigW3c.js` | 23/34 | dmgRangeOf:70, liveMonster:78, cbDissolve:204, tbPlayerFuneral:552, tbPlayerNameIt:579, tbPlayerCloseEyes:606, tbPlayerSkipAd:626, tbPlayerLookAway:648, sigW3cCombatButtons:667, sigW3cWireCombat:694, G.bufAfterimageCells:763 |
| `src/js/partyTactics.js` | 13/23 | cheb:76, tbPackmates:104, tbIsolatedFighter:132, tbDensestFighter:151, tbPartyCentroid:168, tbMostShamedFighter:204, tbIdeaDrift:222, tbEvictionWallCells:265, tbRaiseEvictionWall:303, tbClearEvictionWall:349 |
| `src/js/table-beloved.js` | 1/10 | meterLine:11, castNames:16, fanFavor:28, prereq:60, grant:78, say:90, choices:94, say:121, choices:126 |
| `src/js/equipment.js` | 18/26 | slotLabel:65, fullSetSlots:101, blockedSlots:108, isSlotBlocked:122, meleeWeaponOf:274, threatLevel:412, threatLabel:423, gearDescription:427 |
| `src/js/feastBuff.js` | 12/20 | feastedLine:264, feastedForm:287, _feastPreHp:299, _feastHpTotal:315, applyFeastedForm:332, _feastHealBonus:350, _feastStatusExtend:381, driveOffFeastDraw:530 |
| `src/js/foodPower.js` | 6/14 | abilityKcalCost:47, foodPowerGate:65, overchargeLine:102, Game.payActionCost:149, Game.useAbility:165, Game.activateAbility:197, Game._actionAvailable:224, Game.activatableAbilities:237 |
| `src/js/records.js` | 8/16 | trackSecret:74, secretTracked:79, isRevealed:83, revealSecret:90, architectCredit:104, publicLines:115, secretLines:121, recordCount:125 |
| `src/js/table-feared.js` | 2/10 | meterLine:16, prereq:49, grant:69, choices:88, say:98, choices:103, tableTrialByCombat:137, tableTrialResume:179 |
| `src/js/table-witness.js` | 1/9 | meterLine:11, witnesses:23, prereq:109, say:132, say:144, choices:158, say:180, choices:185 |
| `src/js/metaProgression.js` | 25/32 | removeItem:149, metaReset:191, metaList:217, metaSummary:224, metaNoteTable:369, metaNoteTableChoice:375, metaNoteCure:415 |
| `src/js/voice-system.js` | 2/9 | normVoiceText:55, buildTextIndex:67, entryFor:79, playSystemLine:90, Game.systemLineEntry:120, Game.systemLineIds:121, Game.systemVoiceIdFor:128 |
| `src/js/convo-dialogue.js` | 0/6 | convoIsLightChoice:101, Game.convoMarkSubstantive:115, Game.convoComposeDlg:131, Game.convoTurn:143, Game.convoTurn:650, Game.convoTurn:688 |
| `src/js/memdepth.js` | 3/9 | grievanceSay:38, grievanceNoteFor:53, convoGrievanceLine:68, deedMemLine:88, ovGrievances:193, ovOpinionExplain:204 |
| `src/js/party-bond.js` | 14/20 | firstName:65, vnameOf:262, villageBondGrowth:281, isNewcomer:311, braveryOf:320, findVeteranBuddy:331 |
| `src/js/table-assimilated.js` | 0/6 | meterLine:11, prereq:23, effects:51, say:51, say:64, choices:69 |
| `src/js/table-indispensable.js` | 1/7 | meterLine:11, pantryKcal:32, prereq:47, say:76, say:97, choices:102 |
| `src/js/villageAgency.js` | 32/38 | stageSuccessionBeat:374, answerSuccession:386, petitionInterview:670, aidVillage:1134, answerBeg:1196, answerRaidDefense:1259 |
| `src/js/examine.js` | 5/10 | observedPlant:58, examineDescription:82, resolveCellSpecies:164, examinePlantCell:192, plantVisualDepth:276 |
| `src/js/villager-agency.js` | 39/44 | codexDeeds:690, npcViewership:699, playerBoardScore:707, villagerBoard:717, isMedicinal:1157 |
| `src/js/galactic-cast.js` | 10/14 | G.castDisplayName:96, castById:137, G.castProducerDemand:177, G.castSignOff:201 |
| `src/js/progression.js` | 54/58 | integrationStageName:138, pacingStats:178, arcName:470, auditItemPool:998 |
| `src/js/broadcast.js` | 10/13 | esc:137, G.broadcastWatching:289, G.broadcastTickerHTML:293 |
| `src/js/convo-beats.js` | 7/10 | Game.convoThreadBeat:103, Game.bridgeLine:177, Game.convoTurn:448 |
| `src/js/convo-scene.js` | 3/6 | resolveConsequence:106, validateAskContract:182, convoRecallYouSaid:320 |
| `src/js/perceive.js` | 0/3 | playerIntel:36, isObservant:44, Game.perceptionHints:54 |
| `src/js/spawn-knack.js` | 10/13 | knackDef:48, chooseKnack:99, Game.systemArrivalBeats:202 |
| `src/js/statusEffects.js` | 21/24 | cureStatus:472, seSteps:546, cureEffectFor:714 |
| `src/js/convo-mood.js` | 8/10 | Game.convoMoodFlush:142, Game.convoMoodSilence:196 |
| `src/js/engine/forage.js` | 1/3 | weightedPick:19, forage:32 |
| `src/js/lifeseed.js` | 22/24 | npcKeepsakeLine:340, auditLifeseeds:453 |
| `src/js/villager-mapmem.js` | 9/11 | mapmemTell:248, mapmemHaulAt:347 |
| `src/js/audio-registry.js` | 0/1 | resolveHook:185 |
| `src/js/contestEngine.js` | 23/24 | st:454 |
| `src/js/engine/day.js` | 0/1 | newDay:29 |
| `src/js/fieldFights.js` | 10/11 | villagerSpendFood:190 |
| `src/js/monsterBehaviors.js` | 7/8 | blocked:153 |
| `src/js/scaleDiscovery.js` | 33/34 | scaleDiscovery:69 |
| `src/js/standing.js` | 4/5 | standingLine:121 |
| `src/js/waveLedger.js` | 6/7 | ledgerProgressLine:205 |
| `src/js/build.js` | 0/0 |  |
| `src/js/engine/calories.js` | 4/4 |  |
| `src/js/engine/combat.js` | 13/13 |  |
| `src/js/havenGrowth.js` | 17/17 |  |
| `src/js/party-wiring.js` | 4/4 |  |
| `src/js/practice-deeds.js` | 6/6 |  |
| `src/js/trial-deeds.js` | 5/5 |  |
| `src/js/villager-objectives.js` | 21/21 |  |

## Run outcomes

- competent/s1234: 150d survived, abilities 6, synergies 0, integ 100
- competent/s99: 150d survived, abilities 6, synergies 0, integ 100
- competent/s42: 150d survived, abilities 6, synergies 1, integ 100
- competent/s7: 148d village-lost, abilities 6, synergies 1, integ 100
- risk-aware/s99: 145d village-lost, abilities 6, synergies 0, integ 100
- risk-aware/s42: 150d survived, abilities 6, synergies 1, integ 100
- risk-aware/s1234: 150d survived, abilities 6, synergies 1, integ 100
- risk-aware/s7: 150d survived, abilities 6, synergies 1, integ 100
- larceny-leaning/s1234: 22d village-lost, abilities 4, synergies 0, integ 74
- larceny-leaning/s42: 106d village-lost, abilities 6, synergies 1, integ 100
- larceny-leaning/s7: 150d survived, abilities 6, synergies 1, integ 100
- larceny-leaning/s99: 150d survived, abilities 6, synergies 1, integ 100
- kind/s7: 148d village-lost, abilities 6, synergies 1, integ 100
- kind/s42: 150d survived, abilities 6, synergies 1, integ 100
- kind/s1234: 150d survived, abilities 6, synergies 0, integ 100
- kind/s99: 150d survived, abilities 6, synergies 0, integ 100
- deed-seeking/s7: 33d village-lost, abilities 6, synergies 0, integ 100
- deed-seeking/s42: 82d village-lost, abilities 6, synergies 0, integ 100
- winseek/s7: 54d village-lost, abilities 6, synergies 1, integ 100
- deed-seeking/s99: 69d village-lost, abilities 6, synergies 1, integ 100
- deed-seeking/s1234: 78d village-lost, abilities 6, synergies 1, integ 100
- winseek/s42: 34d village-lost, abilities 5, synergies 0, integ 100
- winseek/s99: 31d village-lost, abilities 6, synergies 0, integ 100
- winseek/s1234: 34d village-lost, abilities 6, synergies 0, integ 100
- oraclev2/s7: 150d survived, abilities 3, synergies 0, integ 100
- oraclev2/s42: 96d village-lost, abilities 1, synergies 0, integ 100
- oraclev2/s1234: 53d village-lost, abilities 2, synergies 0, integ 95
- oraclev2/s99: 138d village-lost, abilities 5, synergies 0, integ 100
- socialite/s42: 58d village-lost, abilities 6, synergies 1, integ 100
- socialite/s7: 89d village-lost, abilities 6, synergies 0, integ 100
- socialite/s1234: 109d village-lost, abilities 6, synergies 0, integ 100
- socialite/s99: 150d survived, abilities 6, synergies 0, integ 100
