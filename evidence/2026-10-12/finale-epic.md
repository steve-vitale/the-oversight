# THE FINALE — three-node super-special campaign (Steve 2026-10-11)

## Directive
"Maybe the finale is super special. Fights across multiple nodes, etc, including the big one on the 12x12. Really go all out for it. Maybe require even more people."

## Design decision: sequential march, not simultaneous
Considered simultaneous (allies hold nodes off-screen while you face the finale) — rejected. Off-screen fights would resolve via the field-fight sim, which is RNG-resolution territory Steve explicitly banned ("monster encounters are REAL FIGHTS, not RNG"). A sequential three-node march means every fight is a real blow-by-blow fight the player plays. You fight your WAY INTO the apocalypse.

## The three nodes (world-map nodes, east of Haven)

**Node 1 — THE COMMERCIAL BREAK (9x9 skirmish).** The show's crew: the Commercial Break itself + the Spoiler + the Network Note (trio, injected). Kill the production staff and the finale airs without a safety net. Their tools become yours: the Red Pen, the Leaked Script, the Bad Note — one-shot combat buttons in the heart.

**Node 2 — THE OPENING CREDITS (12x12).** The finale, still ARRIVING (the Herald's lesson made flesh). Same fiFinale hook, weaker card: 5-round fuse to [100,140] (mdef overrides fiCountdownRounds/fiCardRange). Kill the credits and the sky opens.

**Node 3 — THE HEART (12x12).** The full finale in two parts. Part one: the existing kit (growth, declaration, 3-round countdown to unavoidable [150,200], the sacrifice). Part two at bloodied (<50%): the sky gets lower — sky-fall zones (marked 3x3, [40,60], MOVE), the credits roll in from the edges (edge tiles burn [10,20] — get IN), growth accelerates (+10%/round), and THE ENCORE: if the countdown already resolved, the finale demands a second ending (3 rounds to [120,170], items only — "It has tasted your memories. It wants the REAL thing."). No other monster does this.

## More people
- minAllies 15 → **20** (titans.json). The largest army in the game. Muster upkeep is 1000 kcal/day/blade = 20,000 kcal/day — the logistics are felt.
- The heart demands **10 surviving blades** (the Herald's number) or a re-muster via finaleReinforce (trust −3 per answering fire — reluctance is remembered).
- Dead allies stay dead across nodes. The coalition camps between nodes: player heals 50% of missing, allies 25%.

## Campaign rules
- Order enforced: the opening refuses until the crew is cleared; the heart until the opening is.
- Defeat/flee pauses the campaign — the muster HOLDS (doesn't disband), the node stays re-faceable, the dead stay dead.
- Cleared nodes' world monsters leave the map; the next spawns further east (+3 crew, +5 opening, +7 heart).
- Campaign nodes never wander (campaignOnly filtered from the wave pool).
- titans.js integration: finaleCampaignPlace (placement delegate), titanEntryGate (replaces the flat 20-gate once the march starts), titanInjectAllies exposed. Crew/opening fights set _fight.titan=null so titans.js's titan resolve stays out; the heart keeps titan='finale' so titanVictory owns it.

## Files
- src/js/finale-campaign.js (new, 700+ lines, @ontology header)
- src/js/sigW5.js: fiFinale supports fiCardRange/fiCountdownRounds; fiMonster() finder (sacrifice works in the opening); "THREE ROUNDS" phrasing preserved; fiNoteVuln damage hook
- src/js/titans.js: placement delegate, entry-gate override, titanInjectAllies exposed
- src/data/monsters.json: finale_crew + finale_opening defs
- src/data/monsterBehaviors.json: finale → fiFinaleHeart; finale_opening → fiFinale
- src/data/titans.json: minAllies 20, campaign def
- src/data/build-notes.json: player-facing note
- index.html: script tag
- scripts/test-finale-epic.js (new, 71 checks × 3 seeds)

## Proof
- test-finale-epic.js: 71/71 × 3 seeds (20261012, 7, 999)
- Regressions: titan-class 32/32, titan-12x12 7/7, titan-variety 12/12, titan-load ALL PASS, sigW5 144/144, multi-move 139/139, wave35-mechanics 40/40, multi-move-w35 216/216
- Ontology: 83 systems validated, release permitted
- Two stale tests fixed: test-titan-load (eater stripped, was already failing on master), test-titan-variety + test-sigW5 (15→20 muster)

## [needs-eyes]
Steve must experience the full march. The 12x12 ant-vs-titan visual, the part-two sky-fall, and the encore all need his phone at 390×844. No screenshots possible (subagent can't operate live browser; headless Chromium hangs).
