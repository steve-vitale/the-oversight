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

## Register (updated 2026-10-16)

| Lever and source | Survival mechanism and tradeoff | Evidence to inspect before changing it |
| --- | --- | --- |
| Body capacity and wounds: `src/js/game.js` `maxHealth`, `health.max_add`; modifier data in `src/data/abilities.json` | More capacity gives damage headroom; blood-price wounds lower the effective ceiling. Healing must obey that ceiling. Acquisition and wound recovery matter as much as the number. | HP before fatal hits, heal waste, wounds, acquisition day, first-bearer survival and player/NPC parity. Do not raise all health to compensate for one bad encounter. |
| Formal companion body snapshots: `src/js/party.js` loyal betrayal and late monster injection | Published helpers still replace actual HP with30 and omit worn weapon/armor; escape persists that surrogate body. Matching nearby capacity also changes death-refusal recovery and subsequent succession, gear, food and build histories. | [Measured, unadopted repair](../evidence/2026-10-16/formal-companion-audit.md). Keep the28-assertion proof, real77→30 and77→77 phone escapes, all23 metrics and the food-use failure. Placement/initiative and hostile betrayal are separate contracts; do not tune health to recover a win quota. |
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
| 2026-10-16, formal companion body and gear | [Audit](../evidence/2026-10-16/formal-companion-audit.md): matching actual HP/capacity/worn gear passes28 runtime assertions.64 paired seeds/policy: wins56→60 /18→22 /24→25 /23→35; named-class access48→45 /55→48 /46→43 /48→42. Maker deaths57→58 and first-bearer60-day survival53→50 need review. A food-deed smoke test passes on base but fails on the candidate: seed42 keeps its original bearer and installs a reactor before spending its feast surge. | **Unadopted candidate; published gameplay restored.** Preserve the existing progression assertion and pending reactor/food-use decision. Higher wins do not cancel build/access warnings or prove appropriate challenge. No HP, enemy, cost, offer or policy tuning; do not treat restoring the measured baseline as endorsement of the30HP bug. |
| 2026-10-16, NPC eligibility measurement | [Audit](../evidence/2026-10-16/npc-measurement-audit.md): current-bearer, dead, departed and unknown records no longer imply NPC build access.256 standard campaign rows/full hashes and all23 scalar metrics remain equal; NPC god distributions change in55 runs. | Retain the observer/contract correction, with a new lineage and explicit sampled eligibility/unknowns. This is **not a survival lever change** or evidence that NPCs became weaker. Do not buff NPCs or recover old god counts to compensate for removing false availability. Old reports remain historical; rerun both gameplay roots with one current observer before a new balance decision. |
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


## Paid goods and progression

`tracks.json` trade deed: one social XP per actual person/calendar day. Only
settled paid cart purchases/sales, resident hawker sales and river-goods barter
call betrayal.js creditGoodsTrade. Failed payment, empty/sold stock, free gifts,
unknown/dead people and passive trade routes do not practice a skill. A resident
seller uses the same event/value/cap as the buyer. The buyer's identity is
captured before time costs; death/succession cannot transfer the accomplishment.
Existing NPC daily caps carry into the mantle. There is no inferred NPC trade,
kit reorder, price/reward change or new ascension deed. Knowledge barter and
institutional route settlement are separate models, not claimed complete here.

2026-10-15 decision: retain honest paid practice; investigate class access
separately. At 64 matched seeds per policy: wins 55->55 / 21->21 / 23->25 /
23->23; player deaths 90->90 / 59->52 / 46->42 / 45->45; community losses 8->8 /
19->18 / 14->14 / 18->18. Merchant win movement is a neutral review watch
(delta +0.03125, exploratory interval [-0.03125, 0.09375]). More merchant wins
are not an automatic benefit; paired losses and new community failures remain
visible in the evidence. All 256 earn tier-3+ gear; neither Miser subclass
appears. See ../evidence/2026-10-15/trade-progression-audit.md. Earlier caregiver
community and capable challenge questions remain open.

## Effective goods prices and store credit

Haggle's existing trade.price_mult=0.75 reduces what a buyer owes for goods.
The cart and resident hawker now share betrayal.js goodsTradePrice for display,
spoken offer, payment and scam receipt; river goods already use the modifier.
A positive quote rounds once to whole kcal (minimum one); free wares remain
free. An existing confrontation discount multiplies the same quote. Cached
stock keeps its original price, so reopening cannot compound the reduction.

This reduces physical food spent on gear only when whole-unit payment permits;
traderPay still rounds to whole food units and preserved-food valuation is
unchanged. Store credit pays first, with full rollback if the remainder fails.
A fully tab-funded purchase is still a paid exchange and now receives the
existing capped social deed. This practice correction is a second lever in
the same commerce repair; do not attribute every campaign difference to Haggle.
Haggle's 30-kcal daily metabolism, route income multiplier, sale appraisals,
base ware prices, offer kits and all XP/class thresholds are unchanged.

See ../evidence/2026-10-15/haggle-audit.md for frozen runtime failures, matched
23-metric panels, retained quote/payment phone proof and coverage limits.
Miser access and peaceful campaign viability remain separate open questions;
zero sampled use cannot establish that the discounted ability is balanced.

2026-10-15 decision: retain the existing discount contract and full paid-tab
practice. At 64 matched seeds per policy all 23 metrics, 256 campaign rows
and full gameplay hashes are identical; wins remain 55/21/25/23 and community
losses 8/18/14/18. The 16 merchant replays per arm have one Haggle offer but
no holder. Prepared 100-kcal portions save food; cooked 500-kcal portions
still spend two units at both 800 and 600 quotes. No class access change or
affected-build balance claim. Investigate offer/choice coverage next, keeping
the bot's raw-price affordability gate separate from runtime economics.

## Miser starter placement

The rejected Social-kit experiment moved existing Hoarder/Haggle from8/10 to5/6, preserving the first four entries and every other relative order. Crowd Favorite/Turncoat moved to7/8. The published order is restored: Hoarder8, Haggle10. The candidate changed initial availability for both players and NPCs; it did not grant abilities, raise XP, shrink the three-ability class threshold or enlarge the offer window. Existing role look-ahead and emerging/named-path behavior still apply; the first six are not an absolute bound on every shaped sheet.

Costs under test: Hoarder adds75 daily kcal and multiplies trust gain by0.8 while adding10kg carry; Haggle adds30 daily kcal, reduces buyer quotes by25% and increases existing route income by25%. These are existing values, not new buffs. Stronger economic payoffs stay deep initially, but a genuinely earned named class can still offer its payoff across tracks under the existing rule. Earlier access can displace other social tools and alter food demand, survival, class/god diversity and challenge. Read the retained miser-access audit before tuning another lever.

2026-10-15 decision: do not retain this placement-only candidate. Across64 seeds per policy it forms no Miser class. Merchant16 replays have33 player/85 NPC starter appearances but zero picks in106 distinct actual decisions. Wins move55->47 /21->30 /25->27 /23->27; deaths90->76 /52->68 /42->51 /45->40; community losses8->10 /18->13 /14->14 /18->17. Maker first-bearer day60 survival falls53->45 while wins rise. These are distinct costs/outcomes, not a win-rate verdict. No human or focused-Miser-policy viability claim; inspect actual economic value/knowledge/choice before repeating an offer-only intervention. Retained raw panels, windows and representative adverse/favorable tails: ../evidence/2026-10-15/miser-access-audit.md.

## Declared Miser strategy and global-offer tradeoffs

2026-10-15: new merchant-hoarder/dealer controllers declare on-sheet preference and protect the earned core during swaps. This is a policy lever, not new runtime strength/knowledge/XP. It may fill all six slots and trade away defence; subclass names are preferences, not guarantees. The ordinary shared/NPC brain stays fixed. Both kit arms in each comparison use identical current policies.

Neither measured global placement is retained. The two-starter arm moves Hoarder/Haggle to5/6; Haggle-only moves10->6 while preserving Crowd Favorite5 (Hoarder becomes9). Original kit stays in the game. Original focused preferences form3 Miser-class campaigns/64 each and no Miser locked ending; each candidate produces3 locked Miser ending frames per64 strategy. These are three shared seeds per arm, not six independent examples. Some frames outlive their bearer. A day75 original-kit Hoarder phone checkpoint includes the reactor; it does not prove reactor-free self-supply.

Haggle-only standard outcomes, before->candidate: capable wins55->54/deaths90->84/community8->7; maker21->25/52->68/18->20; merchant25->24/42->44/14->20; caregiver23->29/45->44/18->19. Capable named-class cases45->38; maker first-bearer day60 survival53->47 and death exposure increases. Focused-strategy first60 stays60/64 while their deaths increase. These are separate review signals; more wins or more Miser endings do not cancel them. Player class coverage across six cohorts remains14 observed subclasses, with Phantom no longer sampled and Dealer newly sampled; this is not proof either is impossible.

The current capable policy leaves the early knack unanswered, and passive/resource-rich builds can still lack food-thesis deeds for the actual lesser seat. Fix and measure those policy gaps before further human-viability claims or broad balancing. The subsequent interest-parity audit repairs the player-only daily caller; natural NPC access and other payoff parity remain open. Source/flags,23metrics, screen/confirmation, representative tails and locked-frame/current-bearer distinction: ../evidence/2026-10-15/miser-intent-audit.md. No win quota, no new price/metabolism/threshold parameter, no NPC grants or automatic gate relaxation.

## Hoarder's Interest holder parity

Related payoff correction (2026-10-15): Hoarder's Interest previously paid
only the player despite actual NPC ownership. Living resident NPC holders
now earn from the shared pantry using their own path assembly:2.5percent
alone or5percent with two Miser-path abilities. Opening stock must reach
1000kcal; actual food stays within the existing pantry capacity. Each person
earns once per game day, with a saved canonical-ID receipt that survives
load and becoming the player. Multiple holders calculate from the same
opening stock rather than paying interest on another holder's same-dawn
interest; limited room is allocated in canonical-ID order. No rate, cap,
threshold, XP, offer, ability-slot or Table parameter changed. Interest is
magic food, not an attributed personal harvest. Existing player exile or
remote-pantry semantics remain outside this correction.

Prepared runtime22/22 and the phone's actual Sleep/save/reload prove the
payment. Natural access is distinct from payoff correctness. The prepared
merchant seed7 earns204,018kcal through55 positive payouts from one NPC;
another21 eligible receipts are capacity-blocked. It still loses its village
on138 versus baseline135. Declared ability records can outlive membership or
eligibility, so their presence is not a successful payout denominator.
That is a stress case, not a human-viability or win-improvement
claim. Read ../evidence/2026-10-15/interest-parity-audit.md for source-bound
panels, all metrics and remaining Cornucopia wiring gaps. Static Interest
description/deepening copy also needs reconciliation with the existing
assembly-based runtime; no level-scaling promise is newly implemented here.

## Cornucopia: gathered food and interrupted focus

2026-10-16 decision: retain the actual forage caller repair, with needs-eyes
review of walking between patches. Previously onForage/forageMult had no
game callers. A successful plant sweep now advances before yield:
1.15x,1.30x,...,2.50x at ten successes; rounding follows each existing
route (player plant units round upward, NPC duty/trip kcal round normally).
The first gather benefits. Real NPC duty/adjacent/away-return routes use
the holder's own chain; it is not copied from the player. Duty/trip food
still uses the existing abstract ecology model, including duty scraps on
stripped ground. Adjacent NPC hunger relief and random surplus scale
together; the pre-existing personal-work/provenance abstraction remains.

Walking preserves focus because an actual sweep depletes a finite patch.
Failed gathering, full-pack refusal, wood/ruin-only work, other paid work,
combat or dawn break the chain. The native cell interaction still costs
its extra tick; movement still costs its normal ticks and can trigger
world activity. Saved canonical-person state prevents inherited legacy
streaks on succession. Unknown plants remain unnamed. Rates, ability
prices/metabolism, XP, class/slot/offer/Table gates and pack prechecks are
unchanged; this is not a general carry-capacity correction.

This changes survival through actual food, hunger-driven NPC decisions,
ecology and subsequent random histories. The new adjacent-holder species
lookup can resolve lazy species using real RNG. Do not attribute all later
combat/ending differences to calories alone. The first implementation passed
the full suite yet failed the public Forage button and spatial chain; it
was rejected and its exact source/proof retained.

At64 matched seeds each: capable wins55->55/deaths90->92/community8->8;
maker21->18/52->57/18->19; merchant25->25/42->44/14->14;
caregiver23->24/45->49/18->16; garden-feeder36->37/47->48/8->8.
First-bearer day60 survival is unchanged except caregiver53->54; maker
remains53. Earned T3+ gear remains319/320, contest/show gear316->315,
craft/trade T3+ remains unsampled. All23 metrics are retained, not netted
against wins. Maker invitations/entries22->19 remain review signals;
no independent holdout or causal small-effect claim is made. Retain the
functional correction without relaxing difficulty or adding food to hit a
win target. Revisit focused forager/NPC opportunities and the changed tails
when the pending introductory-choice policy question is resolved.
See ../evidence/2026-10-15/cornucopia-audit.md for exact roots, raw panels,
census, matched replay controls and finite-patch native phone proof.

## One-Person Army: off-screen returnable wounds

2026-10-16: actual landed beam damage is now excluded from the field
Turn the Pain pool, matching the tactical weakness. Gross vTaken still
records all harm for wounds, morale, settlement and logs; a fight-local
beam counter changes no actual hit. Pure light contributes zero, physical
hits remain fully returnable, and mixed aggregate hits apportion final
integer harm by premitigation beam/physical shares. Physical receives the
rounding remainder. This attribution is an Agent interpretation of the
existing aggregate model, marked needs-eyes, not a new damage reduction.

The automatic field cast uses the same35percent-maxHP trigger, one use,
150kcal-equivalent payment and power multiplier, with no cap. It now also
requires current HP above zero: a fatal hit cannot buy a posthumous god
strike before end-of-round death processing. A refusal after that boundary
and a later living action are separate. Ordinary field-strike death ordering,
direct signature models and other gods are not declared fully reconciled.

These are two related corrections (beam weakness and living delivery), so
do not attribute every outcome difference to one. Prepared physical controls
still cast/pay, while beam, dodged, ally-targeted and fatal controls do not
create returnable light or posthumous casts. Hunger still blocks payment.
Read ../evidence/2026-10-16/field-pain-audit.md for all per-policy metrics,
actual exposure, full-suite triage, source roots and phone proof.

## Canonical companions and the allied ambush opening

2026-10-16: retain the actual one-body correction. After succession the new
bearer can remain in old raw party/follower arrays and NPC positions. Both
normal monster and alien constructors previously admitted that same person
as a second NPC body; the formal-party boundary also lacked the canonical
player ID. Membership/travel getters now return distinct roster companions
excluding the bearer, and constructors deduplicate before nearest-four
selection/injection. Genuine companions keep their existing entry rules,
stats and gear. Raw saved arrays are preserved. This changes real party
capacity, invitations, travel, initiative, available helpers and later
food/knowledge/choice histories after succession; it is not only a damage
or health lever. It can help or hurt a particular run. Never compensate for
the loss of an artificial second body by raising survival numbers.

Apex's separate recipient correction gives a distinct living player the
same existing2x next strike as an NPC ally, stored in scholar._nextStrikes
so the actual player damage pipeline consumes it once. NPC caster3x,
ally2x,120kcal data price (normal NPC rounding:5 hunger), round-one/first-blow
gates, one-use limits and food payment stay. Existing armed strikes are
preserved. The player still chooses their action. A personal3x opening
replaces a tagged borrowed2x opening, matching the NPC's single opening;
it does not multiply to6x. Unused tagged ally charges clear at fight end
without deleting later unrelated commitments.

The initial candidate is rejected despite an apparent caregiver44 benefit:
its NPC caster was the current player's own canonical person, and an input50
strike became300 after2x/3x stacking. That is not ally viability evidence.
The final identity-only versus final-Apex comparison has all256 rows,
23-metric sets and full gameplay hashes equal. Proper natural ally exposure
is therefore not established by this sample; native prepared scheduled-turn
proof and21 actual-caller assertions establish the recipient contract.

Original -> identity-only/final,64 per policy: capable wins55->56,
deaths92->93, community8->7; maker18->18/57->57/19->20;
merchant25->24/44->45/14->17; caregiver24->23/49->48/16->16.
First-bearer day60 survival stays34/53/57/54. Caregiver Table invitation/entry
26->24 and named-class50->48 remain review signals. Capable earned T3+
gear64->63, with the missing case a corpse Death Mask on48 (both win90).
Contest/show access stays252/256, craft/trade T3+ remains unsampled.
All23 metrics and selected adverse/favorable/class/gear tails are retained;
no holdout or small causal balance claim. See the dated apex-identity audit.
Eight fitting deeds and broader scale/parity work remain open.

## Introductory choice and reactor timing

The shared loader leaves choices to policies; capable currently omits the
introductory knack. A public-choice correction fills the real first slot and
changes later drafts, class recognition, luck history and reactor timing.
The16-seed/four-policy screen has mixed survival/community/ending outcomes,
not a game-only verdict. It is retained as an unadopted candidate because
the existing two-seed40-day food-deed proof fails: both bearers install the
reactor before earning the feast-use deed and later receive real feast-buff
refusals. Candidate quick167/168 and full939/940 are recorded, not hidden.

The reactor currently trades metabolism and steady1.25x power for an
irreversible feast ceiling. The Table still requires actual food-powered use;
earlier earned credit, a prior buff and succession must be distinguished
from an early reactor bearer earning new credit. No price, survival, slot,
reactor or Table parameter changed in the published game. The open design
question and exact evidence are in OPEN-QUESTIONS.md and
../evidence/2026-10-15/knack-policy-audit.md. Win changes alone do not decide
whether to adopt this correction or change that tradeoff.
