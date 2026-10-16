# Survival levers and balance decisions

Steve, 2026-10-15: "Winning shouldn’t be easy. A reduction in win rate is cause for investigation and consideration not automatically assuming it’s a regression. Keep documentation on our levers that impact survival."

## How to use this register

Use this with MEASUREMENT-PLAN.md and SIMULATING.md before changing survival,
progression or reward costs. These are existing mechanisms and places to
investigate, not instructions to buff them. Exact values belong in runtime/data;
read those sources on the tested branch before tuning. Muse's regional branch
and Codex's recovered game branch have different mechanics and policy history.
Pin source contents, region, policy and contract in each experiment.

Win rate measures challenge. A change in either direction requests review;
no rate is a target and no decline alone establishes a defect. A lower win rate
can follow fair costs or meaningful danger. A higher rate can follow improved
counterplay or an exploit. Survival indicators help explain those possibilities;
none alone measures fairness or fun. The current comparator retains directional
resource/survival warnings as prompts for investigation. They do not mandate
reverting an intended difficulty change. Separate first-bearer survival, whole
campaign continuity, Table access and Table victory. Succession can preserve a
campaign while the first bearer dies. Winning early can censor survival samples.

## Register (reviewed 2026-10-15)

| Lever and source | Survival mechanism and tradeoff | Evidence to inspect before changing it |
| --- | --- | --- |
| Body capacity and wounds: `src/js/game.js` `maxHealth`, `health.max_add`; modifier data in `src/data/abilities.json` | More capacity gives damage headroom; blood-price wounds lower the effective ceiling. Healing must obey that ceiling. Acquisition and wound recovery matter as much as the number. | HP before fatal hits, heal waste, wounds, acquisition day, first-bearer survival and player/NPC parity. Do not raise all health to compensate for one bad encounter. |
| Enemy pressure, wave/spawn pacing and party size: `src/js/game.js`, `src/js/engine/combat.js` | Damage, armor, initiative and encounter density change both burst danger and recovery time. World wave and actual fighting party can produce different risk. | Cause-specific deaths, encounters per exposed day, wave, party, pre-fight HP and escapes. Historical duel anchors in BALANCING.md are dated controls, not fixed loss-rate targets. |
| Beam resistance and escape: `src/js/alienPlayers.js` `apBeamResistPieces` / beam resolution; item armor data | Worn resistant pieces and readable threats permit preparation. Gear access and escape opportunities affect whether the danger is avoidable. | Equipped pieces, acquisition route/time, telegraphs, positions and flee outcomes. Separate first-contact surprise from repeated informed decisions. |
| Death refusal and recovery: `src/js/game.js` `maybeCheatDeath`, `src/js/abilityActions.js`, `src/js/godpath.js` survival budget wrappers | Second Wind has a daily use budget; starvation/disease do not create its combat ration. Molt shares manual/automatic weekly uses and sheds equipment. Phoenix consumes a living community member. | Actual triggers, shared budgets, real food/equipment/population costs and subsequent deaths. Accepted ability calls do not prove a save or a landed effect. Check player and NPC paths. |
| Food production and storage: `src/js/game.js`, garden/food data and harvest receipts | Identification, labor, processing yields, spoilage, pantry access and village production determine sustainable nourishment. A full pantry can conceal an unsustainable source. | Physical food, useful nourishment, provenance, spoilage, stock trend, actions/days spent, NPC needs and roster. Distinguish nominal diet from actual communal shortfall. |
| Gifts and communal meals: `src/js/carexplore.js` `giveFood`, base fallback in `src/js/game.js`; feast data | Hunger relief must be paid by consumed calories. Feeding others competes with carried dinner and preparation. Feasts have social and power value alongside nourishment and attraction costs. | Need before/after, real consumed/nourishing calories, pack left, household membership, trust and actual costs. Use the retained gift and host-feast experiments; do not equate calorie efficiency with total value. |
| Banked food and powers: `src/data/feast-surge.json`, abilities data, runtime bank/ability costs | Larger food capacity and feast surge can finance strong actions, but must be filled and maintained; expiry, decay and attracted threats matter. | Acquired capacity vs filled capacity, real action costs, duration, danger drawn, surplus production and repeatability. Check for free-food cycles. |
| Rest, shelter, disease, trauma and care: `src/js/game.js`, `src/js/carexplore.js`, haven data | Recovery competes with food, water and time. Untreated injuries and sickness can create a spiral; safe shelter and care can interrupt it. | Before/after HP, trauma, illness, costs and idle/recovery days. Check whether both player and villagers can obtain/use care. Historical sleep-heal values need rechecking on the tested build. |
| Earned equipment and livelihood rewards: item/recipe/reward data, `scripts/gear-usage-audit.js` | Contest/show, craft/trade and combat rewards affect protection and power. Tier alone omits accessories and situational utility. | Availability -> known/eligible -> material-ready -> attempted -> completed -> paid -> equipped -> useful. Separate recipient and source. Unknown/unreached is not zero value; mixed policies do not prove pacifist viability. |
| Knowledge, skills, class/god progression and allies: `src/js/progression.js`, `src/js/godpath.js`, `src/js/godhood.js` | Preparation, fitting deeds and real abilities can turn danger into earned late-game power. Helpers also add mouths and exposure. | Time/access/cost by playstyle, actual landed actions, party/population costs, gate reachability and failure causes. Do not strengthen enemies just to cancel an earned power curve. |
| Table opportunity and resolution: Table runtime/data, `src/data/table-endings.json` | Invitation, entry and winning are separate. Readable stakes and meaningful losing outcomes support a difficult ending. | Per-policy access funnels, exposed entrants, outcomes and losses; a whole-run win rate alone cannot locate the problem. Keep a genuinely losable Table. |
| Policy choices, **experimental rather than runtime balance**: `scripts/policies/`, explicit captured flags | Risk selection, crafting, feeding and public-stakes reading change measured outcomes without changing the game. Example: capable's beam flee/resistance and read-stakes settings. | Identical policies/flags on both roots for a game-only comparison. Publish a separately named cohort for changed strategy. Bot ignorance is not evidence that the game needs easier rules. |

## Decision procedure and upkeep

1. Name one lever and the causal hypothesis. State which opportunity, cost or
   counterplay should change and the plausible harm to other playstyles.
2. Collect matched 16-seed screens across the four standard policies plus the
   affected named cohort. Confirm small effects with 64 seeds and independent
   holdouts. Keep runtime changes separate from policy changes.
3. Read every metric, sample coverage and paired tails. Trace changed outcomes;
   inspect public opportunities and costs, then play the affected human flow.
   Ask whether failures were understandable, avoidable with earned preparation,
   and consistent with the fiction. More wins do not answer those questions.
4. Record **retain / revise / revert / unresolved**, reasons, uncertainty and
   affected cohorts. An accepted cost increase can lower wins. Do not weaken
   mechanics or tests solely to recover an old rate.
5. Update this register and the log below with each survival-affecting change,
   together with code and evidence. Link the raw panel, source identity,
   contract/observer, tests and playtest. Update BALANCING.md when its guidance
   changes. AGENTS.md and the measurement checks carry this workflow forward;
   the automated hook checks proof freshness, not the quality of judgment.

## Decision log

| Date / lever | Observations | Decision and remaining question |
| --- | --- | --- |
| 2026-10-12, earned combat abilities | BALANCING.md links `../evidence/2026-10-12/sim-combat-r6.md`: stronger earned players changed the old wave-one loss rate. | Historical decision: retire the loss-rate target, retain earned progression and the fair-but-costly encounter anchor. Do not restore a percentage by buffing monsters. |
| 2026-10-15, full food gifts | [Gift audit](../evidence/2026-10-15/garden-gift-budget-audit.md): phone fixture previously cleared 80 hunger with 250 kcal. Corrected scarcity case spends 500 and leaves 60 hunger; ample case spends 2,000. In 64 feeder cases wins 31 -> 29, community losses 8 -> 11; corresponding exploratory intervals include zero. Default four-policy 16-seed rows were unchanged. | Retain truthful calorie costs. Investigate feeding opportunities, later trajectories and community warnings; do not call the win decline itself a regression or claim its cause is proved. Natural traces show real harvests and affordable first gifts. Garden's seven-day whole-village deed remains uncompleted. |
| 2026-10-15, NPC demand observation | [Demand audit](../evidence/2026-10-15/garden-demand-audit.md): real settlement separates adjusted need, own production, request and draw. Feeder NPCs self-supply about 95% of measured need; most meals make no communal request. | No food/survival rules changed. Retain separate diet/request views and unknowns; do not manufacture a feeding opportunity by injuring residents or suppressing their production. Garden threshold and complete household/player ledger remain open. |
| 2026-10-15, Relay deed | [Authored office audit](../evidence/2026-10-15/relay-deed-audit.md): current service replaces class-age bypass. At 64 seeds per policy, wins 114 -> 116 overall; maker deaths 62 -> 64, sampled Voice access falls. | Require actual responsibility rather than a class timer. Win movement is investigation, not a benefit claim. A predecessor retains the post after death in a reproduced case; repair that lifetime defect separately and remeasure. Office costs, other build/day gates and the Table are unchanged. |
| 2026-10-15, dead Relay post | [Lifetime audit](../evidence/2026-10-15/relay-office-audit.md): actual death/load/tick now reopen the role. Independent 64 x four: wins 45 -> 41 / 20 -> 21 / 26 -> 25 / 25 -> 28; maker community losses 19 -> 25, all six new cases replay exactly. Additional role choices have real costs; some assignments have ample food, others little. | Retain truthful vacancy and explicit reappointment. Balance remains open: investigate automatic role decisions, optional Relay work and exposure/terminal outcomes in a separate policy experiment. Do not restore a corpse's post or tune costs solely toward prior wins. |
| 2026-10-15, Relay upkeep clock | [Clock audit](../evidence/2026-10-15/relay-clock-audit.md): daily receipts replace per-part upkeep/service progression, preserving old unlocks. Independent 64 x four: wins 41 -> 55 / 21 -> 21 / 25 -> 23 / 28 -> 23; communities 12 -> 8 / 25 -> 19 / 18 -> 14 / 9 -> 18. Caregiver population/community warnings remain; 26 adverse/favorable replays match. | Retain the documented daily clock. This also slows unlock/story opportunities; it is not merely a cheaper post. Investigate higher capable wins as a challenge change and caregiver late losses separately. Conditional calendar windows and competing endings expose unequal observation, without dismissing harm or recovering a target rate. No price, enemy or policy tuning. |
| 2026-10-15, measurement interpretation | Old `won: higher` mislabeled fewer wins as adverse by definition. New neutral win contract reviews material movement in either direction. No gameplay parameter changed. | Retain difficult winning as the design direction, with no replacement quota. Preserve historical reports under their original contract; their old win-regression labels are not the current judgment. Refresh both roots before a new comparison. |

New entries: date; source/base/candidate; lever and hypothesis; policies, seeds,
region and flags; contract/observer; all outcome movements and coverage; causal
traces and human playtest; decision/reason; unresolved questions and next test.

Relay timing is a survival lever: `src/js/relay-ext.js` charges the actual bearer once per calendar day, advances service/unlocks and schedules System conversations on that cadence. `commsTick` still runs each part for other communications. Saved per-person/day receipts prevent reload/reclaim charges; a different bearer owes their own day. Legacy progress is preserved rather than retroactively divided or refunded.

## God-scale protection contracts

Gilded Guard (`godhood.js`, `godverbs.js`): four coins with 50 damage capacity each; one regenerates at dawn. It buys protection against physical hits, not beams. The field caller now passes the selected attack and the beam component rather than treating a beam-plus-antlers total as all shieldable. These are existing values, not new balance targets. See `godpath/SCALE-AUDIT.md` for promised scale effects and unverified parity/contest behavior.

2026-10-15 decision: retain the existing beam weakness across tactical and field fights. Prepared real field calls prove beam bypass and retained antler protection; no beam strength, armor, coin capacity or regeneration price changes. See `../evidence/2026-10-15/market-beam-audit.md` for matched panels and coverage limits. Reduced NPC protection here is a contract correction requiring affected-cohort review, not a win-rate target or evidence that every god is balanced.

Measured guard outcomes: all 256 standard campaign rows/states remain identical, but none samples a Market God. In the separate prepared 64-pair drone cohort, returned field deaths are 16 -> 18 (exploratory paired interval for rate delta [-0.140625, 0.203125]); mean ending HP 36.89 -> 21.125. The physical wolf control is identical. Early learn-first withdrawal still bypasses noFlee in the existing model; these are not settled campaign deaths. Keep that issue and affected-build balance open rather than tuning to the old death count.

## Sealed contest commitment

`fieldFights.js` noFlee is an arena commitment, not a damage multiplier. The learn-first withdrawal branch previously escaped after three losing rounds despite that commitment. It now respects noFlee; ordinary wild withdrawals remain, while a fifteen-round judges decision may still return vFlee with judges=true. Molt or Second Wind can save a fatal hit without guaranteeing survival of later arena rounds. Public contest settlement uses the final real outcome.

2026-10-15 decision: retain the closed gate and investigate its costs, without lowering beast strength or restoring an escape to recover previous survival. In the isolated ordinary-kit Market guard drone cohort, field deaths rise 18 -> 64/64 and learning escapes 46 -> 0; the physical wolf control remains identical. This is a deliberately unprepared, guard-only fixture, not a complete god build or naturally earned campaign. See `../evidence/2026-10-15/sealed-learning-audit.md` for standard panels, uncertainty, caller and phone proofs. Historical market-beam reports are not rewritten.

Sealed-gate confirmation: all 256 matched standard campaign rows/final states and all 23 per-policy metrics remain identical; wins remain 55/21/23/23, community losses 8/19/14/18. This does not clear earlier Relay tradeoffs. The affected drone fixture death-rate delta +0.71875 has exploratory interval [0.609375, 0.828125], with no holdout and no natural full-build claim. Actual public watched-contest settlement and save/load persistence are independently proved.
