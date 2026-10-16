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
| Deliberate pantry gifts and return settlement: `game.js` `_creditPantryGift`, single/bulk take; `food.js` `putAwayFinished` | Actual finished counter transfers now earn the same calorie/history/trust/practice settlement as Pack gifts. An explicit pending receipt preserves the first5 trust cost, avoids repeated costs without a new gift, and survives load. Ordinary debt/theft, physical stock and army upkeep retain their rules. | Inspect new gift vs settled receipt, exact transferred kcal, promotion rollback, per-call trust and actual borrowing. Capped nominal trust can exceed actual clamped gain (open follow-up). All23 metrics and rejected cap-guard evidence: dated counter-gift audit. |
| Private counter food pickup: `food.js` `takePrepFood`, `app.js` per-entry Pack food | Finished food can be carried directly for2 ticks per batch, retaining real weight, risk and expiry. No donation/trust or eating credit; water and weight modifiers limit pickup. | Native Shell -> Pack -> true save/load, partial capacity and no phantom stock tests; unchanged320 campaign rows do not establish policy use or army funding. See dated prep-food audit. |
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

Market God access (2026-10-16): its authored paid food-to-goods outcome
replaces the legacy synergy/class10-day fallback. A real early trade can
permit an otherwise complete build at80; a class that never trades cannot
substitute elapsed time. Neither direction automatically improves/regresses
the game. Actual prices, food spent, Haggle/preservation value, XP and full
build/day80 stay. Buyer and living resident seller share person-owned credit;
it is not nourishment, income inventory or pantry standing. Read the separate
standard and declared Miser16/64 contrasts in
../evidence/2026-10-16/market-exchange-audit.md. Earlier god access in screen4
coexists with earlier community loss; screen1234 loses the old proxy-based
ascension. Investigate paths and opportunity rather than restoring a wait
proxy, forcing a death or compensating with free food.

Ward protection (2026-10-16): distinguish two levers. Aegis now admits the
player as an NPC's actual protected ally and composes the redirected hit
once for the protector, before the intended recipient's armor/history.
The protector's armor and source rally apply once; expiry/departure end the
link and finalized-beam options survive recursion. This can increase a
protector's wound where the old code stacked two people's armor, while
enabling reciprocal protection. It does not prove beam resistance has been
recomputed for a new target. The second lever replaces Ward's legacy
age/synergy proxy with an actual carried hostile wound and both-person
living exit. It changes access, not damage, costs, day80 or full-build gates.
Keep those arms separate when measuring; see the source-bound
../evidence/2026-10-16/ward-audit.md. Formal30HP/gear and field70HP/helper
models remain separate limitations. Do not compensate for restricted god
access by reducing enemy or Table difficulty without new evidence.

Retained army-ration strategy (2026-10-16): new opt-in campaigner-quartermaster
uses the native whole-batch counter pickup toward its current known plan,
with the existing village reserve and paid work.16 caller checks and full963/963
pass. Same-source16/64 comparison retains all23 metrics: screen wins10->11,
holdout49->46, Table entries50->47 and community losses13->16. One real natural
Herald victory occurs in holdout10062 with18 named allies on round22; Finale/
Network remains open. Use report fights/resolved, not the explicit-approach CLI
counter (which misses movement-triggered entry). Seed2 reveals17 recruits
exceeding its minimum-force food budget; native refusal exposes imperfect sorter
choice. Keep the strategy experimental. Source/rebuild/controls/diagnosis:
../evidence/2026-10-16/quartermaster-audit.md.

Finished counter food pickup (2026-10-16): the actual Pack sheet now offers
Pack food (2 ticks), moving a real finished private batch into carried rations
without a pantry donation/withdrawal. Weight (including water/modifiers),
spoilage, risks and harvester shares remain real.26 caller/UI/save assertions,
quick190/190 and full962/962 pass. Standard16/four-policy and disjoint64
retain identical320 rows/all23 metrics/full gameplay hashes; defaults never
call the new route. Native Shell -> Pack costs6 ticks for1500 carried kcal,
with pantry/trust/credit unchanged. See ../evidence/2026-10-16/prep-food-audit.md.
Next measure a separately named public-action retained-ration strategy; natural
army funding/completion and seven authored deeds remain open.

Counter gift settlement (2026-10-16): completed counter deposits now earn the
same deliberate-gift credit as Pack donations; automatic stock does not. Modern
Generous practice revokes correctly across promotion, and a saved pending-gift
receipt preserves the first five-trust return charge without repeating it on
later unrelated meals.25 focused checks and full961/961 pass. All23 metrics and
three source-bound contrasts remain review-required: named16 wins15->10,
community1->5; disjoint64 wins47->49, deaths101->105 and national55->53.
No win quota or difficulty softening; zero natural campaign starts persists.
See ../evidence/2026-10-16/counter-gift-audit.md for raw panels, rejected
intermediate evidence, phone/save/load proof, reconstruction and cap-ledger
limitation. Seven deeds and earned army funding remain open.

Harvest preparation (2026-10-16): **retain opt-in coverage; no default
adoption or campaign-success claim**. campaigner-preparer uses actual Pack
shelling and native counter stage/sort/shell/put-away, with the existing75%
yield and4/8-tick costs. Added work is bounded by person/day,1800kcal,50HP
and the early work window. Extra action time can change NPC activity, danger,
food, contributions, offers and progression. The direct-pack-sort API draft
is discarded as human-route evidence; retain its separate source/report.
Physical processed kcal, stored food and contribution credit must remain
distinct: the actual shelf action adds food but no `gives` credit. Never
invent that credit in a controller. At16 seeds wins12->15 coexist with first
bearer day60 survival9->8, classes11->9 and contest/show gear16->15. This
does not make preparation a default or establish campaign funding. Final14
actual-verb checks, full960/960, source-bound screens/disjoint holdouts and
prepared native cost proof: ../evidence/2026-10-16/campaign-preparer-audit.md.
Disjoint64 wins48->47 and entries48->48 include a real two-door Table loss
(insufficient terror, then hollow Relay grounding), not automatic regression.
Invitation57->53, deaths96->101, earned T3+ gear64->62 and NPC-class exposure
warnings still need review. More processed food does not erase them; both
strategies make zero campaign starts. Early community endings at26/35 explain
the two missing-good-gear endpoints without proving inadequate reward rates.

Campaign ration strategy (2026-10-16): **retain as an opt-in diagnostic;
reject as a successful campaign strategy**. `campaigner-rations` prices
public withdrawals against positive own contribution credit, remaining
same-day ordinary fed-line allowance, real access/weight and a two-day
nominal village-food reserve. It retains owned campaign food in both normal
donation paths only after a publicly announced target and while the village
has that reserve. These are conservative policy preferences, not new game
rules or guarantees of standing. Ordinary survival takes still use the base
policy. Spoilage and actual nourishment remain separate from nominal stock.

Army upkeep still spends1000 physical pack kcal per blade/day; promises,
banked nourishment and pantry totals cannot substitute. Food retention changes
donations, contribution, trust, recruitment, danger exposure, progression and
later random histories. At16 seeds campaigner->rations wins9->12, deaths24->24,
communities6->4, player class14->11; disjoint64 wins37->48, deaths108->96,
communities26->16, classes40->40. The candidate never calls/recruits or fights
a campaign in either cohort. Higher wins therefore do not establish campaign
viability. Seed4 reaches its first council with zero gifts and88155 prior
withdrawal kcal: the conservative credit budget prevents campaign taking,
and its own work never funds the plan. No exact contribution-to-exile causal
claim follows. Keep the original default/control. Next measure an explicitly
productive earned-supply strategy before changing costs, gates or enemies.
All23 metrics,254 cohort/control workers, exact compatibility and outcome
replays: ../evidence/2026-10-16/campaign-rations-audit.md.

Natural campaign baseline (2026-10-16): no runtime/policy lever is changed.
The audit now prices the existing campaign strategy with all23 metrics,
neutral controls and actual public withdrawal evidence. At16 paired seeds,
control->campaigner wins13->9, deaths21->24 and community losses3->6, despite
more named-class coverage; lower-food reserves also warn. Nominal pantry stock
is not access: seed4 has461 successful campaign withdrawals followed by503
failed campaign attempts after exile. These data do not authorize free food,
looser exile, easier titans or a higher withdrawal cap. Investigate access,
contribution/standing and ration sustainability as a separately measured
strategy. Read ../evidence/2026-10-16/campaign-balanced-audit.md; the screen
does not prove a causal explanation for every outcome or natural Network viability.

Apex formal ownership follow-up (2026-10-16): encounter-opening party/talent
and full-capacity evidence now lets an actual later formal NPC earn their
paid pack hunt. This changes personal credit, not companion30HP/gear,
initiative, costs, prey threshold or god power. Standard16 and disjoint64
per policy keep every row/all23 metrics unchanged. One natural first receipt
moves to an earlier qualifying fight on the same day;13 other full-state
differences are saved ledger metadata. Retain the preceding Apex access and
survival tradeoffs. See ../evidence/2026-10-16/apex-party-audit.md for30 exact
diagnostic replays and native scheduled NPC proof; this is no balance verdict.

Apex authored hunt (2026-10-16, needs-eyes): ascension access now requires a
personal actual fresh monster kill above opening full-body HP, either solo
or with opening-held Pack Hunt actually paid/called on that prey and every
allied fighter alive/present. Both tactical and field callers use the same
receipt. Class age, old synergies, a wounded foe and another person's pack
cannot substitute. A larger own health bar raises the qualifying prey line;
being wounded does not lower it. Fresh field draws use their actual opening
HP, not the template's random upper bound. Existing active gods remain.
This changes access to Apex's existing power, not its damage/cost, enemy stats,
day80, complete-kit gates or Table access. Holdout wins48->48/19->18/25->24/
34->33; deaths88->88/84->87/53->55/46->44 and community13->13/24->24/27->28/
15->16. Keep the adverse directions even below automated tolerances. Read
../evidence/2026-10-16/apex-deed-audit.md for the review decision and source-bound
replays; no lower-win result alone establishes a regression or a good change.

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

Garden feeding settlement (2026-10-16): **retain**, needs-eyes. A living NPC
Garden now includes the distinct living player among known resident recipients.
Fill min(fullLine,kcalCap), preserving any larger reserve; exclude reactor
bearers. This is an explicit fullness interpretation, not an expanded-bank
gift. Keep200kcal/8hunger, the strict post-payment80 gate and current daily
gates. Exclude dead/unknown NPC casters and duplicate/dead/unknown recipients;
no recipients means no payment/harvest marker. The NPC dawn meal, its payment
and day marker are now saved together after the earlier endDay snapshot.
No physical food, harvest provenance, feast-use or authored deed is invented.

In64 disjoint holdouts per policy, wins46->48 /21->19 /26->25 /31->34,
entries46->48 /21->19 /26->25 /31->35, deaths88->88 /86->84 /52->53 /43->46,
community losses14->13 /24->24 /26->27 /17->15 (capable/maker/merchant/caregiver).
Player named-class access38->39 /49->52 /44->45 /45->44; earned good gear
64->64 /64->64 /63->62 /64->64. Early survival and national scale do not change.
Maker invitation/entry warnings remain; merchant deaths/community/gear and
caregiver deaths/class directions remain even where automated tolerances do
not flag them. The16-seed screen separately has maker deaths14->18 and class
access13->12, and caregiver community3->4. No overall balance improvement.

All43 changed discrete-outcome cases replay exactly in both arms (86 replays,
all23 metrics). Maker loses10003/10004/10018/10047 and gains10010/10025; the
lost runs end without the food-use deed, not with a losing played finale.
10018 also loses its community on116. Merchant10014 changes from win90 to
community loss145. Caregiver gains five wins and loses10032/10062; more wins
coexist with more deaths. Merchant10009 still wins93 instead of101 but loses
its T3+ gear receipt: the day92 prize becomes gravity_well (not weapon/armor),
and later show/contest gear differs. Preserve this reward/exposure direction;
do not increase prizes or grant a food deed to recover an aggregate rate.

The unsaved preliminary candidate is not adopted. Its additional two load
assertions fail; final ordinary endDay auto-load retains day86/2400kcal/paid
marker. The snapshot repair leaves all screen/holdout rows and23 metrics equal
to that candidate, with different full hashes (save sequence is retained).
26 caller assertions, native Wait/Sleep/automatic-load proof, raw panels,
reconstruction and all tradeoffs: ../evidence/2026-10-16/garden-feed-audit.md.
Army logistics, NPC reactor diets, contests and eight authored deeds remain open.

Garden recipient diagnosis (2026-10-16): **unresolved repair**, no survival
lever changed. Current200-kcal NPC casting pays8 hunger but excludes the
player in addition to the actual holder. Prepared player reserve300 remains
300 while another NPC hunger60 becomes0. Dead/stale holder validity, duplicate
counting and zero-recipient daily commitment also need correction/audit.
Do not turn this observation into an unpriced player reserve refill: fullness,
bank capacity, metabolism/reactor behavior, caster dinner and daily armed
combat power are different contracts. Any chosen repair must preserve its
cost, avoid invented harvest/deed provenance, prove real dawn/load callers,
and retain all policy survival/community/resource effects. No claim that a
prepared dead-roster case occurred naturally. Source-bound cohort exposure
and eight prepared observations: ../evidence/2026-10-16/garden-recipient-audit.md.

Table entry ownership (2026-10-16): **retain**, needs-eyes. Entry timing/access
is a survival lever: it decides when ambient pressure stops and which story
owns an existing activity. Apply actual Haven-panel access to the public action,
including existing remote access and exclusion of exile. Refuse pending/live
encounters, active contests and ended runs without cost or ending commitment.
No combat stats, food prices, deed bars, invitation cadence, policy or collector
changes. Table's own trials remain real fights.

All64 screen rows/hashes/23 metrics match. In64 disjoint cases per policy,
capable wins48->46, entries49->46, deaths86->88, community12->14; maker
21->21/21->21/86->86/24->24; merchant26->26/26->26/52->52/26->26;
caregiver31->31/32->31/43->43/16->17 (wins/entries/deaths/community).
Capable low-food exposure .026200->.027772 and mean living NPCs8.41866->8.39167
remain beside good gear63->64; caregiver low food .008396->.008675 also stays.
Early survival, player class and contest/show gear access do not change.
Read all23 metrics and eligibility in the raw reports, not just these counts.

All18 changed holdout hashes replay exactly in both arms. Capable10016/10026
previously seated while exiled despite no native panel access; they now end
village-lost/day99 and village-dead/day103. Capable10045 gains a death while
waiting for a pending rerun encounter but still wins. Caregiver10024 previously
resolved a losing Table story while rerun was pending; it now ends village-lost
on110 with that encounter unresolved. Capable10061 still loses its siege
without overlapping Table ownership. Other changed cases settle then enter.
These are explained access/timing costs, not proof of improved balance or a
reason to make winning easier. Exile recovery and unresolved bot encounters
remain separate audits. Prepared native phone tests prove busy refusals,
real contest resolution, successful seating and save/load, not natural viability.
Evidence: ../evidence/2026-10-16/table-entry-audit.md.

Invitation-window correction (2026-10-16): no survival/game lever changes.
The provisional fraying follow-up's ready seat at the150-step endpoint did
not prove a missing checkArc caller. The last check saw2 late-wave encounters;
a third followed it. Two fixed additional iterations let the ordinary day151
check issue the invitation; no win appears in that window. Preserve the original
bounded23-metric comparisons and their adverse directions. Do not increase
ending access to cancel a cutoff. Same-source replay, explicit continuation,
observer controls and native daily transition proof:
../evidence/2026-10-16/invitation-audit.md. Table entry overlapping an existing
player contest/combat is a separate boundary audit, not an ambient-pressure
or general survivability buff.

Fraying social price (2026-10-16): retain the repair of the existing -2 tier
crossing reaction to distinct living other current residents, plus null-ID
guard and reserved-key load cleanup. This is a needs-eyes interpretation of
the old null recipient, not an added ongoing conversation tax. Never charge
old saves retroactively. In64 disjoint cases per policy, wins51→48 /20→21 /
26→26 /31→31; deaths86→86 /83→86 /59→52 /41→43; community losses12→12 /
26→24 /27→26 /19→16. Capable invitation/entry warnings remain for review.
Maker loses one contest/show gear case; merchant loses one named-class case.
Overall good-gear access and early bearer survival are unchanged, but caregiver
low-food/HP exposure rises slightly. Do not cancel those directions with fewer
community losses or tune to regain wins. Full23-metric reports, changed-ending
replays, legacy-save boundaries and UI-readout limits:
../evidence/2026-10-16/fraying-audit.md. NPC social parity and conversation
effects remain separate work.

Voice preparation strategy (2026-10-16): no game lever changes. Named opt-in
cohorts keep40%/500kcal and75 humanity after the word, decline zero ordinary
trust benefit at90+, and can pay before a chosen visible encounter. These
are strategy preferences, not new hunger/grounding gates for humans. Costs,
progressive trust, full-conversion threshold and current food rules are reused.
Other actions can spend the retained resources later. In64 disjoint holdouts,
wins51→50 /20→23 /26→27 /31→33 and deaths86→84 /83→82 /59→59 /41→36
(capable/maker/merchant/caregiver). Community losses12→13 /26→25 /27→25 /
19→18; class and good-gear access are unchanged. Preserve capable's one
extra community loss, caregiver's small low-health increase and the changed
win rates beside resource gains. Keep original defaults and named strategies
available; do not call the larger total a game-balance improvement. See
../evidence/2026-10-16/voice-policy-audit.md for all23 metrics and loss replays.

Daily Voice recipients (2026-10-16): Be Heard's unchanged150kcal and five
grounding now buy the existing daily rally for the player as well as NPCs.
Four counters are set before the ordinary own-turn decrement, preserving
three active turns of the existing raw+4 damage/hold-line convention.
Stronger existing rally is preserved before ticking. No extra strike charge,
command, food or repeated grounding bill is created. Recipient gates persist
across save/load; bonus/stunned turns spend duration, and tomorrow's new
fight needs tomorrow's paid word. Prepared native access and matched metrics
are recorded in ../evidence/2026-10-16/daily-voice-audit.md. Four named natural
holders pay102 daily casts with zero same-day fights; preserve that timing
diagnosis before changing policy or claiming useful campaign exposure.

Personal grounding (2026-10-16): humanity follows the person across succession,
not the inherited office. Current bearer remains scholar.grounding; other
people use state.groundingByPerson, default100, including explicit zero.
NPC Rally Cry now pays the same existing five grounding as a player Voice,
alongside its unchanged120kcal-equivalent food and once-per-fight turn cost.
Completed Voice autosaves retain food, humanity, effects and use gates.
Paid shared feasts restore3 to each distinct actual human diner when at least
two eat together; an online reactor host does not eat. A finite plant/monster
lesson restores2 to its actual NPC teacher; actual new Table plant teaching
restores2 to the player. Repeat/empty/absent lessons cannot farm it. These are
the existing documented recovery rates, now wired to receipts.

Thresholds75/50/25 and multipliers1/.9/.75/.6 stay unchanged. The existing
feasted multiplier consumes grounding; the ordinary topped-up1.25x overcharge
does not. NPCs still lack the corresponding feast-state consumer and full
social reaction parity. Do not impose a new blanket NPC damage penalty to
pretend those paths exist. Kept-favor/grief recovery wiring remains open.
The paid human-diner interpretation and succession balance need feel review.
See ../evidence/2026-10-16/grounding-audit.md for matched outcomes, named
loss investigation, source identity and phone proof; no win quota applies.

Player command turns (2026-10-16): retain existing NPC Voice120kcal-equivalent
and Crowd Moves80kcal-equivalent prices and use limits. Their distinct living
player ally can now choose an extra move/action turn before normal order
continues. This is a survival advantage financed by the caster; the chosen
player ability still pays its normal food cost. A bonus turn ticks statuses
and rally like other own turns, and a full stun can consume it. Voice grants
the existing next-two-strikes1.5x commitment in the player's real strike state;
it replaces the previous commitment like the existing NPC effect. Class
broadcast/aura player recipients use existing rates, range and duration.
Save/load preserves spent casts rather than refunding the advantage. Actual
NPC grounding erosion was missing in that historical unit; the personal
grounding follow-up above closes it without claiming complete parity.
See ../evidence/2026-10-16/player-command-audit.md
for all metrics, state differences, prepared phone choices and exposure limits.

NPC support recipient audit (2026-10-16): retain the existing brawler wound
threshold, range, once-per-fight guard, three-turn duration and raw +4 rally
damage. Apply those terms to a distinct nearby living player as well as NPC
allies. Expire player rally on own-turn entry, including skipped turns. Player
rally applies to sourced foe damage, before existing food multiplication; it
does not amplify environmental damage or friendly backlash. In exchange, a
fallen NPC Voice now costs the player one full turn and clears rally, matching
the existing NPC weakness. Neither improvement nor penalty sets a win target.
Prepared runtime and phone proofs establish the affected paths; standard
cohort exposure and remaining command gaps are recorded in
../evidence/2026-10-16/god-support-audit.md. Read that evidence before using
campaign outcomes to infer natural availability or changing survival costs.

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
