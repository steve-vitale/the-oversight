# God-Path Plan (current state, 2026-10-14)

Read `docs/godpath/STEVE-ANSWERS.md` first (it outranks this file), then
`docs/COHERENCE-SPINE.md`. The old phased plan (conditions, trials, god
abilities transforming in the slot) was retired by the unified design below.
Proof note: `evidence/2026-10-14/godpath-unified.md`.

## The design (built)

2026-10-16 Shepherd deed: actual critical recovery of another person, or
allied Lifeline fatal-fall rescue, followed by both people's later-dawn
survival. Real camp healer rounds provide a noncombat route. Six authored
deeds/four proxies now remain; class/payoff/four-magic/day80 gates stay.
See ../../evidence/2026-10-16/shepherd-deed-audit.md for32 checks, full968,
natural source-bound cases and mixed23-metric panels. Threshold25% is an
Agent-authored lever. Broad NPC care payoff/field/army parity remains open.

Earlier2026-10-16 care prerequisite: actual NPC Mending planning includes the bearer;
the verb uses distinct living present allies. Tactical Lifeline now reaches
the bearer after their own death-refusal/Phoenix priority. Only known living
distinct holders count; charges belong to canonical people and survive load,
including the existing level3 second rescue.26 caller/load proofs and native
prepared Wait/cast/hit/load/exhaustion are in
../../evidence/2026-10-16/caregiver-support-audit.md. This does not author the
Shepherd deed or complete NPC care payoff/field/army parity. Five proxies stay.

2026-10-16 Market God deed: turn food value into delivered nonfood goods in
a real paid cart, resident or river trade. The living buyer/resident seller
earns a personal first receipt. Unredeemed credit, XP counters, news, free
grants and food purchases cannot substitute. No kill, gear-tier quota or new
price is introduced. Five authored deeds now replace their proxies; five
remain. Full build/day80 and existing active gods stay. Read
../../evidence/2026-10-16/market-exchange-audit.md before interpreting changed
god dates or viability; declared Hoarder/Dealer policies remain separate
from the standard four and can make correlated decisions on the same seed.

2026-10-16 Ward deed: carry a real hostile wound intended for another known
living person, then both leave that fight alive. Actual Aegis, Leech and
named field Bodyguard/Aegis callers record the outcome; withdrawal qualifies.
Paid casts, zero wounds, anonymous support and class age cannot substitute.
Pending evidence survives load; old missing evidence is not invented.
Four authored deeds now replace their proxies; six remain. Existing gods and
day80/full-build gates stay. A separate Aegis prerequisite repairs NPC links
to the player and applies damage composition once to the actual protector.
See ../../evidence/2026-10-16/ward-audit.md for separate parity/deed arms,
all23 metrics, full-state replays and the disclosed prepared phone proof.

2026-10-16 Apex formal ownership: the prior audit's formal-caster limitation
is closed by a saved encounter-opening ownership/capacity snapshot, then
enrollment of actual injected NPC bodies. Later talent acquisition and old
missing evidence still earn nothing.18 real caller/load checks, native
scheduled NPC/kill/load proof, full957/957 and identical320 rows/all23 metrics:
../../evidence/2026-10-16/apex-party-audit.md. Formal30HP/gear and broader
reinforcement/scale work remain separate; no survival parameter changed.

2026-10-16 Apex deed: actual fresh monster kills replace its class-age/synergy
proxy. Opening prey HP must exceed the hunter's full-body maximum. Solo and
actually paid Pack Hunt routes preserve both subclass fantasies; supported
hunts require every allied fighter to remain alive/present. Receipts belong
to actual people across tactical/field fights and save/load. Old victories
are not invented and existing active gods remain. Three authored deeds are
now wired; seven proxies remain. Read ../../evidence/2026-10-16/apex-deed-audit.md
before interpreting the lower Apex access or adjusting a survival lever.

2026-10-16 support follow-up: NPC brawler wound rally and fallen Voice weakness
now reach distinct living player allies under the existing terms. Player rally
has a real damage consumer and finite own-turn lifetime. See
../../evidence/2026-10-16/god-support-audit.md. The subsequent
../../evidence/2026-10-16/player-command-audit.md closes tactical command,
broadcast and aura player recipients with a real controlled bonus turn.
The daily-voice audit now proves the paid player's finite own-turn daily
rally; the grounding audit proves actual speaker costs and person-owned meters.
See ../../evidence/2026-10-16/daily-voice-audit.md and grounding-audit.md.
Full NPC social/food-conversion parity and the broader scale-context proof
remain open. Never substitute NPC AI for a player choice.

2026-10-16 follow-up: formal companion body/gear parity remains open. The
retained repair passes28 focused assertions and native phone escape, but
fails the existing food-deed smoke test. Gameplay/tests stay at the green
baseline; do not waive the assertion or silently grant reactor food credit.
See ../../evidence/2026-10-16/formal-companion-audit.md for the exact candidate,
all23 metrics over64 seeds/policy, reconstruction and remaining contracts.

Job -> track -> **class** -> **god** -> Table.

| Piece | Where | State |
|---|---|---|
| 10 paths x 2 subclasses, one god per path (one verb, weakness, scale) | `src/data/godpaths.json` | built; godhood.json retired, Farstrider folded into cartographer |
| `path` + `subclass` (+ rare `alsoPath`) on every magic ability | `src/data/abilities.json` | built (94 magic) |
| Subclass verbs (walls, pulls, pushes, swaps, blink, heals, pins, bribes, broadcast, command, stoke, guard, feed camp) | `src/js/godpath.js` (`do` on a data action) | built, 27 new abilities |
| Class recognition, player + villager, one function | `godpath.js recognizeClass` | built; sheet line in `app.js` |
| Offers lean to the path | `godpath.js shapeOffers` (player, villager, gift sheets); `villager-build.js buildPathLean` | built |
| Ascension = class + payoff + 4 path + deed, day 80+ (authored deeds for Unkillable, the Relay, Apex, Ward, Market God and Shepherd; legacy proxies for four remaining gods) | `godhood.js` (derived) + dawn check | built; gates are data levers |
| Table never reads godhood | `scripts/godpath/ladder.js` | enforced |

## Checks

- `node scripts/godpath/validate.js` (data contract)
- `node scripts/godpath/ladder.js` (runtime contract)
- `node scripts/test-godpath-unified-20261014.js` (every verb, through the game)
- `scripts/godpath/phase.json` is vestigial (no phased checks remain).

## What's left (reconciled 2026-10-15)

1. **Fitting ascension deeds and current gate measurements.** Current authored
   gates: Unkillable, Voice, Apex, Ward, Market and Shepherd. Class age cannot
   bypass them. Four legacy replacements remain. Shepherd adds actual critical
   care or allied fatal-fall rescue followed by both people's later-dawn
   survival, including ordinary camp medical rounds. The25% threshold is an
   Agent-authored data lever, not a new Steve quotation. See the dated
   shepherd-deed-audit.md for32 checks, full968 and mixed16/64-panel signals.
   Earlier Relay evidence:
   Relay runtime/phone proofs and matched 16/64-seed panels are in
   `evidence/2026-10-15/relay-deed-audit.md`. The service replay exposed a
   dead predecessor retaining the post and blocking later holders. Office
   lifetime now repairs actual death and legacy load/tick boundaries, without
   passing the job with the mantle. Runtime 13/13 and the real phone handoff
   pass; see `evidence/2026-10-15/relay-office-audit.md` for independent evidence. The historical
   all-on 0/16 result predates the class-held-for-10-days bridge and wider
   offers. Current rules still use that placeholder; replace it with fitting
   deeds and measure the full gates with 64 matched seeds. See ROADMAP item 3.
   Current 64-seed/four-policy screen and the repaired shared Relay office
   deed are in `evidence/2026-10-15/deed-audit.md`. First authored outcome
   deed: Unkillable requires a real self-refusal of a fatal blow, then a
   later dawn alive. Canonical-person receipts survive save/load and
   succession without inheriting the predecessor's work. Eight replacements
   remain open after the Relay office becomes its required deed; see `survivalist-deed-audit.md`. No Miser subclass appeared
   even in merchant runs.
   Living Garden is next: the initial harvest-to-meal diagnostic found no
   harvester identity on player plant stacks or NPC garden-duty food.
   Meal totals also include personal production, so donations/gardening XP
   cannot prove seven days feeding the village from one's own harvest.
   Source preservation is now wired for main plant-harvest callers, unknown
   species lumps, fungible mixed stacks, processing and pantry transfers.
   Runtime 26/26 passes (frozen source: 7 pass / 19 fail); matched 64 x four
   result rows remain identical (124 wins / 229 player deaths, no warnings).
   All 987 paired daily states remain equal after removing only source maps.
   Actual intake now covers pack/counter, home/away, guest/probation, gifts
   and feasts, with source-preserving ration returns and supplemental crops.
   Runtime 37/37 and full 923/923 pass. All 256 standard results and prior
   observer fields still match; 987 daily paired states match after removing
   only source/intake metadata. The phone-proven host-food gap is repaired:
   pantry 20,000 -> 15,000 now gives the host 416.67 kcal, clipped to reserve
   capacity. Full 924/924. The 256-run balance panel worsens 124 -> 114 wins;
   four lost-win traces reproduce all matrix rows/hashes with eight neutral
   observer pairs. First gains are positive, later food actions and succession
   diverge; no immediate serving, price or armed-buff defect in those cases.
   Whole-village day snapshots are now measured: 64 unchanged campaigns,
   7,311 closed days, 6,518 stable known multi-person days. Only 27 have any
   one harvester nourishing everyone; none reach 300 kcal per resident or
   seven tested feeding days. This does not establish impossibility: the
   current policies do not deliberately feed every resident. A targeted
   public-action feeding strategy and exact need/membership settlement are
   next; the authored gate remains open. See garden-coverage-audit.md.
   A deliberate garden-feeder policy now harvests and gives real food. The
   gift calorie/hunger mismatch is fixed and phone-proven: scarce 500 kcal
   leaves 60/80 hunger; 2,000 kcal fills it. The 64-seed feeder panel flags
   wins 31 -> 29 and community losses 8 -> 11 for review; default controls
   are identical. See garden-gift-budget-audit.md. Exact meal demand and
   communal serving opportunities were the next measurement gap.
   Actual NPC meal demand is now observed at settlement, including health,
   hearth, rationing, personal production and chosen fasting. The targeted
   16-seed feeder cohort has 1,673 stable village-days and 14,916 NPC meals;
   only eight days have requests from every NPC. This is opportunity evidence,
   not an authored gate or a complete bearer/continuous-membership ledger.
   See `evidence/2026-10-15/garden-demand-audit.md`.
   The seven-day authored deed remains next. See
   `evidence/2026-10-15/feast-outcome-audit.md` and `feast-host-audit.md`.
   See `evidence/2026-10-15/harvest-source-audit.md` and the earlier
   `garden-provenance-audit.md`.
2. **Finish the parity audit.** Ten god verbs now have player/villager callers
   and paid runtime proofs (`test-god-verbs-wired-20261015.js`). Reconcile all
   subclass active verbs and passive hooks too; the old blanket claim that
   villagers cannot use any new verb is no longer the current state.
   Canonical companion/Apex follow-up (2026-10-16): actual succession could
   leave the bearer as an NPC fighter too. Monster/alien and formal-party
   constructors now exclude the bearer and duplicate IDs; getters preserve
   legacy raw arrays but expose only real companions.14 runtime assertions
   and native phone succession prove it.21 Apex assertions plus native
   Wait -> NPC opening -> player Strike prove an actual player ally gets2x
   once, with no duplicate-self grant or personal3x stacking. Four source
   arms isolate identity from recipient changes; full944/944 passes. See
   ../../evidence/2026-10-16/apex-identity-audit.md. This does not finish Voice,
   brawler/Garden recipient parity at that point, far formal companion body/gear parity
   or natural titan/Network play.
   Garden's separate recipient follow-up now includes a distinct living
   non-reactor player at their fed line, preserves higher reserves and the
   NPC caster's200kcal/8hunger payment, and excludes dead/unknown casters or
   duplicate/invalid diners. Dawn's automatic snapshot now retains the paid
   meal/day marker.26 caller/load checks, native Wait/Sleep/automatic-load,
   full955/955 and source-bound16/64 comparisons are in
   ../../evidence/2026-10-16/garden-feed-audit.md. Maker invitation/entry,
   merchant gear/community/death and caregiver death/class directions stay
   open; no win-only verdict. This does not author the Garden deed or prove
   marching rations, NPC reactor diets, all god-action validity or contests.
   Other God daily callbacks also run after the original endDay snapshot;
   their automatic-load cost/recovery contracts need separate caller proof.
   Hoarder's Interest now has a shared dawn payout for living resident NPC
   holders, using their own build and the existing2.5/5percent rates,1000kcal
   threshold and pantry cap. Saved canonical person/day receipts cover
   repetition, load and succession; same opening stock avoids roster-order
   compounding. Runtime22/22 and native phone Sleep/reload are proved in
   interest-parity-audit.md. This does not complete NPC access or all passive
   parity. Cornucopia's two missing callers are now repaired (2026-10-16):
   player plant sweeps and actual NPC duty/adjacent/return routes use their
   own saved chain. Walking keeps focus; other work, failures, combat and
   dawn reset. The public cell wrapper is covered over finite patches;
   runtime33/33, quick169/169 and full941/941 pass. The five-policy64-seed
   panel remains review_required (maker access/death tradeoffs); no win-only
   verdict or compensating tuning. See cornucopia-audit.md for retained
   sources, rejected first implementation and native phone proof. This
   does not author Garden's deed or complete all NPC food/provenance models.
   NPC Second Wind/Molt automatic activation now covers tactical, field and
   actual world damage, with personal cooldowns and truthful field survivor
   HP settlement (`survivalist-passive-audit.md`). Full active/passive and
   headless player field-contest parity audits remain open.
   Earlier panel: zero Second Wind/Molt receipts, then at Strange-kit
   positions 10/11. The offer observer confirms zero appearances in 26,733
   player/NPC kit offer appearances. The public Table-stakes policy repair
   recovers caregiver wins 15 -> 20/64 (all policies 91 -> 113/256), without
   changing entries, deaths or median game days. The earlier seed 12 was blocked
   solely by combat-only feast-use credit despite global rank and a real
   feast. Landed noncombat feast healing now earns that deed through paid,
   learned wound care, proved in runtime and phone play. The caregiver policy
   now treats visible wounds; comparisons separate that policy from the game
   rule. See `feast-healing-audit.md` for corrected 16/64-seed evidence and the
   rejected clock-confounded panel. A focused ability-access lever and broader
   NPC feast/active/passive parity remain next.
   One-entry access lever now moves Second Wind to Strange position 6.
   Natural 64 x four: 46 player / 2 NPC offer appearances, three player
   held runs, one actual fatal refusal. Wins 114 -> 115/256, deaths 252 ->
   254; Molt and Undying class remain unsampled. Audit real NPC Strange-deed
   callers next (alien-fight/integration credit gaps), not passive strength.
   See `undying-access-audit.md` for source-isolated evidence and phone choice.
   Tactical party deed credit now covers real surviving NPC actors, with
   death/absence/flee/replay/succession guards and real level-up thresholds.
   Matched 64 x four: wins 115 -> 109, deaths 254 -> 232; caregiver 22 ->
   26/64, other policies decline. Class samples 15 -> 14 (Bulwark absent).
   See `party-deeds-audit.md`; this is not blanket balance completion.
   That actor gap is now repaired: actual alien companions enter with their
   world HP, 100-HP capacity and worn gear, and tactical wounds/healing settle
   back to the same person. Eighteen runtime assertions and actual phone
   Strike/roster proof pass; full suite 921/921. Matched 64 x four: wins
   109 -> 124/256, deaths 232 -> 229; all four policies gain wins, but
   merchant/caregiver deaths each rise four. Class coverage stays 14/20:
   Juggernaut/Undying replace Seer/Keeper. One merchant forms Undying; one
   maker earns Unkillable through real Ember Heart refusal yet never enters
   a Table. Molt still has no offers and NPCs retain no Second Wind in daily
   samples. See `alien-party-audit.md`. NPC integration's separate random
   daily counter still needs reconciliation, without XP for presumed deeds.
3. **Subclass access and job balance.** Initial 6/20 coverage rose to 10/20
   after the documented job lean and offer window. Measure the remaining
   classes and jobs before another lever; survival targets are flexible.
4. **Finish god.scale reconciliation.** Party/titan effects are partly wired;
   compare every promised contest/army/party/titan effect with actual callers
   and prove remaining gaps. Do not treat all design text as already working.
5. **Done: Table build codas.** All 70 light/dark codas are authored and
   reachable; the Table sheet handoff and final-screen rendering are wired.
   Prepared 595-case/70-choice proofs, actual mobile play and matched natural
   screens are in `evidence/2026-10-15/coda-audit.md`. Optional bespoke path
   beats/overrides remain optional; narrative feel needs Steve's eyes.

Scale caller inventory (2026-10-15): `SCALE-AUDIT.md` maps all forty promised contexts and distinguishes inherited tactical hooks from strategic/contest gaps. The off-screen Market God beam weakness is corrected with real mixed/physical controls; see `../../evidence/2026-10-15/market-beam-audit.md`. Brawler field pain now excludes actual landed beam wounds and requires a living delivery (2026-10-16,22 runtime assertions; prepared real browser fights, quick170/170 and full942/942). See `../../evidence/2026-10-16/field-pain-audit.md` for mixed-hit attribution, all metrics and exposure limits. This does not complete the scale or eight remaining deed requirements.

Miser access audit (2026-10-15): paid goods transactions previously raised trade-savvy but never track XP. Cart/hawker/river completion now credits one shared social practice per person/day, including a real resident seller. This does not reorder kits or author a god deed. The independent 64 x four panel still samples neither Miser class; 16 merchant replays show only 31 actual credits and sparse Miser offers. See `../../evidence/2026-10-15/trade-progression-audit.md`; deep kit placement remains a separate experiment.

Miser placement experiment (2026-10-15): moving only Hoarder/Haggle to Social5/6 did not form either Miser class in256 campaigns. Merchant16 actual-choice observation shows106 distinct starter-containing decisions and zero starter picks, despite118 player/NPC starter offer appearances. The candidate is not retained; original8/10 order restored. Mixed survival, community and Table effects are preserved rather than judged by wins alone. New passive choice observer is shared via deed-screen --choices1; next test explicit knowledge-bound Miser intent/economic value separately from generic build preferences. See ../../evidence/2026-10-15/miser-access-audit.md.

Declared Miser strategies (2026-10-15): original kit yields3 Miser-class campaigns/64 per focused preference, zero Miser ending frames; generic policies still yield none. Two-starter and Haggle-only experimental kits each yield3 locked Miser ending frames/64 per strategy. Those are correlated policy/seed samples, not six independent worlds. Global kit changes are not retained: the Haggle-only arm loses capable named-class access45->38 and maker first-bearer day60 survival53->47 while maker wins rise21->25. All960 campaign rows,23metrics, controls and representative replays are retained in ../../evidence/2026-10-15/miser-intent-audit.md. The native phone replay shows an earned day75 Hoarder build; the reactor and suppressed early UI prompts are explicit. Fix the shared setup's unanswered introductory knack before further broad tuning, then investigate job/playstyle-specific access and real food-thesis opportunities; Daily interest payoff parity is now repaired; natural NPC access, other passives and eight fitting deeds remain open.
