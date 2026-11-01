Current bounded continuation (2026-10-29): qualified parent007720b66 is remotely available with467quick/1240full checks (issue2 comment6510933634). Shared prerequisite visits are now being verified on a separate review branch. Actual phone study of an already-linked codex produced no knowledge; the planner therefore targets an unmet relationship prerequisite, not a call quota. Prepared20checks pass. Ordinary8case R1 proves a real scheduling blocker: dawn-only work placed in daily runs after three waits and never starts. Keep that failed pilot, move the decision into actual upkeep after basic body care, and repeat. No new Game reward or difficulty coefficient. See evidence/2026-10-29/community-visit-r1/README.md.

# Make existing systems drive play

Steve's priority, 2026-10-29: "our biggest issues tend to be NPC and simulation utilization of all the game features that already exist. Nothing drives things towards all parts of the game."

The unit of work is a complete decision: a person has a need, recognizes an
available opportunity, obtains its prerequisites, performs the real action,
and receives its actual consequences. A feature being implemented, an NPC
narrating it, or a specialist bot exercising it does not complete that chain.
Different people should pursue different paths. Do not force every actor to
touch every feature, award progress for empty chores, or make wins easier to
raise a utilization number.

## Ordered work

1. **Useful autonomous Haven work.** Connect the existing cooking objective to
   real surplus preservation, with the duty's dinner reserve, shelf, losses,
   capacity and throughput. Craft seekers may consider it when work exists.
   Respect the worker's body, location, current bearer, engagements and orders;
   record the work part so a consumed assignment cannot become another shift.
   Done when prepared counterexamples, actual neutral-observed campaigns and
   the complete release checks pass. The current implementation is a review
   candidate, not a qualified release.
2. **Prerequisite-directed action.** Follow one real blocked crafting chain
   from a resident's build need through material procurement, communal storage,
   recipe knowledge, paid crafting and wearing/using its result. The previous
   ARMORVILLAGE trial found no NPC crafting because bark/vine/hide never flowed
   into the communal pile. Keep that failed experiment off; repair the missing
   behavior before changing rates or enabling the experiment. Done when real
   residents complete the chain without injected materials, with actual costs,
   scarcity and a rejecting missing-prerequisite control.
   Existing player gathering writes to the scholar's pack and calories;
   factor the relevant primitive around the actual actor rather than changing
   the bearer temporarily or inventing another free communal-material ticker.
3. **Shared simulation decision support.** Bring useful behavior from the
   specialist policies into the primary capable/livelihood decision path,
   coordinated with Muse. Start with an observed opportunity missed by those
   cohorts; inspect favors, peer trade/covenants and build-specific actions.
   Use existing public Game actions. Survival emergencies and existing pending
   commitments take precedence. Pursue missing prerequisites or record an
   honest blocker; do not add another isolated policy as the sole remedy.
   Done when main cohorts complete several distinct feature chains naturally,
   common-input controls distinguish controller changes from Game changes,
   and all balance domains remain visible.

Keep one of these goals active at a time. Fix its causal blocker before adding
new content or another reporting layer. Continue ordinary mobile play through
an actual ending alongside this work; a campaign iteration cap is not a win or
death. Day150 is already punishing; day180 is exceptionally long.

## Evidence and repeatable audit

### Actual production must advance its maker (2026-10-29)

Prepared real-action contrasts found a player earns one crafting deed for bark
armor, while paid successful NPC armor and ammunition production earned zero.
The existing `creditDeed(vid, 'crafting')` now follows actual product placement
in both producers. One arrow/bolt batch is one deed. Failed attempts, missing
materials, cooldowns, full quivers and pocketing existing ammunition earn none.
The existing per-person, per-day cap is shared with other crafting. This is a
progression repair, not a new reward rate or a demonstrated balance improvement.
The shared test rejects removal of each actual source hook. Current-source
campaign and browser qualification must follow; earlier green checks belong to
the earlier source.

### Main-policy route bias (next shared-controller task)

The actual inheritance is `livelihood -> capable -> leadfeast -> leadcourt ->
competent`. `leadcourt` explicitly pursues three subordinate links and contains
no trade/covenant proposal or codex pilgrimage. The corresponding planning lives
in `scalecourt`, `tradeseek` and `winseek`, which this chain does not inherit.
This explains a controller coverage gap, not a claim that every zero-call run
had a ready opportunity. Inspect knowledge, relations, food, location and pending
commitments before selecting a route. Port shared planning with Muse's review;
do not force all people through every route or change the controller inside a
Game-only paired comparison. Test distinct trade/covenant/lead intentions and
real prerequisite travel, refusals and paid consequences under common inputs.

### Crafting chain under qualification, 2026-10-29

An unarmed eligible resident can pursue the universally known stone knife:
seek vine from actual visited bushes, obtain missing stone through the existing
Haven duty, then consume actual own/communal materials through the shared recipe.
Success equips the real item; failure consumes materials and a work part.
Existing arms, urgent body needs, orders, away work, injury and the per-part
ledger prevent inappropriate or duplicate work. This original standalone
prototype left ARMORVILLAGE off. Public6dccc subsequently enabled Muse's armor
crafting/sharing and starter wearers; the normal review merge preserves those.

Two unprepared capable pilots (seeds7/42,80 controller iterations) produced five
actual own equipped knives and one paid failure. Each has an independent
unobserved control with identical whole row and gameplay hash. These establish
narrow utilization, not full campaigns, balance clearance, broader recipe
knowledge, all-playstyle coverage or a live release. Shared prepared tests
remove the real objective executor and reject the missing result.

The gear observer records `npcWorkGear` acquisitions under `craft`, separately
from player recipe access, and retains paid attempts/successes in `npcCrafts`.
It now also wraps the actual `villagerArmorCraftDay` acquisition boundary.
Direct and nested newly made armor has one craft source and its own canonical
recipient. Starting gear, failures, repeat calls and dead residents do not
become grants. The armor function's numeric return does not establish its
failed-attempt count: `npcCrafts` is still the personal-objective attempt table,
explicitly labeled separately from armor grants in the feature census.

The armor observer proof runs the real method, actual communal material debit,
closing-day cooldown and dawn Wait, with full state/return/next-RNG neutrality
and an actual removed-boundary rejection. Both roots are reobserved under the
same current collector. The current16x4/all31 screen and eight neutral pairs
per root are retained in npc-combined-review-r1; actual maintenance9/0 passes.
It records224 NPC knives and237 NPC armor pieces on the candidate. Counts are
not net benefit: maker NPC progression and caregiver population signals, among
other watches, retain REVIEW_REQUIRED. Missing historical diagnostics remain
unknown. No metric IDs, challenge coefficients or policy parameters changed.

Player crafting shares the material/product primitive. Failed paid attempts
spend the authored32 ticks as well as materials; refusals spend neither. The
initialized checkpoint encloses the complete input. Current browser, offline,
measurement and broad source proofs must be refreshed before qualification.

Run a real NPC call-chain audit, with its own unobserved control for each seed:

```sh
node scripts/audit-npc-work.js --out evidence/YYYY-MM-DD/npc-work-audit-rN --seeds 7,42 --days 80
```

Use `--root <frozen-root>` for the baseline under the same audit. The command
refuses an existing output directory. It retains each actual result and source
manifest, checks exact whole-row and gameplay-hash neutrality, and excludes the
current bearer, dead residents and unknown identities from NPC counts. Counts
are calls, not unique opportunities or universal successes. Deed calls are
separate from duty calls. Unknown identities remain explicit. It neither opens
menus nor asks Game to manufacture an opportunity for the observer.

Use `scripts/balance-features.js` on the retained standard panel to inspect
simulation use and sampled recipe readiness. For each suspected dead spot,
record which link failed: unavailable; available but unrecognized; recognized
but not chosen; chosen but not executed; executed but not useful. Zero calls
alone cannot distinguish these. Check scarcity, knowledge, position, timing,
competing commitments and whether the relevant controller is actually shared.

For each behavior change retain matched baseline/candidate campaigns under
the same observer, 16 screening seeds per capable/maker/merchant/caregiver and
all31 current metrics. Survival, community, resources, progression and earned
gear remain separate. More calls or more wins cannot cancel warnings. Small
balance claims still require64 independent holdouts and named cohorts; these
initial audits do not establish pacifist viability or phone usability.

Refresh the actual observer proof through `balance-proof-update.js` and all
source-bound browser receipts before qualification. Preserve failed runs.
Never edit proof identities, waive checks or treat this audit as a replacement
for the mobile campaign, full checks, owner review or ship loop.
## Shared relationship planner — first port, not qualified

The primary merchant seed7 pilot now makes three actual trade proposals at Haven on days54/55/56; each returns the real formed-link object. The previous source made no peer proposals in this selected opportunity audit. Independent recorder-on/off runs reproduce the complete played row and gameplay hash. This is a narrow utilization result, not a prevalence, balance improvement or campaign-ending claim (alive at81game days/80 controller iterations). The pilot predates the subsequent trace-copy/home-coordinate/pre25 guard and explicit legacy-control refinements; preserve its exact source identity and rerun current campaigns.

`community-road.js` is called from the actual inherited leadcourt dispatch. Primary merchant/maker prefer trade; caregiver chooses covenant when a living present bench can support defense, otherwise trade; capable retains lead. These are controller choices for review, not Steve-authored laws. Existing active commitments outrank profession, and the selected intent persists. Dedicated historical road policies retain their road. Peer calls/crises are answered through real engine methods. Proposals respect knowledge/opinion, membership, actor needs, actual Haven world node, pending choices, pantry reserve and real-ask cooldowns. No Game method is replaced or resource/link granted.20 prepared assertions include a real removed-dispatch rejection and real original-leadership control.

**Remaining causal link:** below-bar partners are currently recorded as `courtship-needs-visit`; the shared prerequisite visit/return flow is not yet ported. Do not call the whole roadmap task complete. NPC general-purpose planning, favors and build-specific use remain separate unfinished chains.

`COMMUNITY_PLANNER=legacy` is the explicit before-controller comparison, with the shared planner enabled by default. Compare both modes on one fixed current Game/source/observer using all31 metrics and declared intervention flag; this is a controller treatment, not a Game-only effect. Retain16 matched screening seeds/four primary cohorts and observer-neutral pairs, then64 independent holdouts for small-effect claims. Initial quick456/466 is retained: two genuinely stale measurement proofs and eight missing-Git-usr-bin `grep` environment failures. Do not waive or relabel them; refresh a real neutral panel and rerun with the standard Git tools on PATH before qualification. Qualified5db remains distinct and remotely handed off in issue2 comment6508501912.

### First shared-planner screen: useful relationships, unfinished food chain

Current-source16x4 matched mode comparison and eight independent observer-neutral pairs per mode completed without validity errors or cached cases. It remains REVIEW_REQUIRED. Maker wins5->0/16, merchant7->0, caregiver6->4, capable14->14; record all31 warnings in comparison.json rather than treating win movement alone as a verdict. Merchant village-death count33.75->41.56 and craft/trade gear11->10/16 also need consideration. Counts include monsters. No holdout or net-benefit claim.

Selected merchant42 actual-return/raw-state diagnosis, with exact independent on/off row/hash equality, identifies a broken continuation: legacy reaches a lesser seat/wins atday90 with5feasts and foodDeeds=true; shared reaches global rank, enough waves/contests/crises/stage, but seat=none and foodDeeds=false atday153. Both donate0 food. Legacy's21 paid tribute/tend entries satisfy its feast contribution rule; trade has0. The shared policy has armed its feast surge but never holds a feast. Source confirms the three-day trade food reserve and inherited1500kcal recent-contribution gate. Forming a charter does not replace an actual contribution. Next fix is a genuine voluntary food contribution/production plan with dinner protected and real resource costs, followed by actual feast/conversion use. Do not waive the food deed, count route income as a gift, or buff rewards to restore wins.

The repeated quick458/466 passes the two freshly refreshed measurement gates but fails eight legacy POSIX-command tests under cmd.exe. Adding Git grep to PATH finds the binary but does not make cmd single-quote parsing POSIX. The existing verified check operator sets Git bash as ComSpec; use that operator for the next invocation and retain both failed invocations. This is an environment diagnosis, not permission to skip tests.5db remains the separately verified review source.

### Food contribution continuation (under qualification)

A shared peer-road plan now contributes genuine own unmixed harvest toward the existing1500kcal recent-gift bar when an armed feast remains unused and the real pantry can afford the feast plus its existing buffer. It protects one full day of safe personal food, respects pending council choices/body/encounters and stops after conversion. Unattributed stock and other residents' harvest do not qualify for this new intent. Normal donation rules remain; this is not a claim to distinguish every prior movement of the owner's own harvested stack. Donation transfers food at its authored zero-time cost; the subsequent feast really spends communal food and its real Strike/ability/healing use earns the conversion. No food-deed waiver, tribute-income gift, grant or coefficient change.

The transfer now targets only the missing whole food units instead of emptying all working capital. Recent-gift history is scoped to the actual run/bearer: a successor cannot inherit the former giver's baseline or negative apparent debt.25 prepared assertions include real transfer/accounting/reserve/refusal contrasts, actual feast and canonical-world real Strike, the full primary daily and removal of its actual dispatch. Existing curated feast checks8/0 pass. An additionally attempted old r7 archaeology script cannot quote a Windows Git path under Bash; its failure is retained and is not a gameplay or full-suite clearance claim.

Selected merchant42 precursor now completes own harvest -> real gifts ->7 real feasts -> actual food-use deed -> lesser Table/win on day90; the legacy control also wins day90 with5feasts. Recorder-on/off whole rows/state hashes match independently in each mode. This pilot predates target-capping and per-bearer ledger refinement: current-source16x4/all31 screening and fresh real neutral maintenance follow. The common current legacy reference includes the identity correction; it is not relabeled as byte-identical historical R1 behavior. Root3d0/5db Game bytes and numerical challenge remain unchanged.

Actual phone Oscar reaches day17alive/100HP. Anaconda ends through ordinary Strike/Wait/movement; a queued Wait after the killing blow fails because combat has already closed, and the original failed report remains failed. Worn Elena Drawing is missing from the advised Pack surface but works in You (−9trauma): wrong destination guidance remains open. Real sleep, earned knife enhancement, drinking/eating,200kcal Cultivate,60unit/1500raw-kcal sorrel harvest and spending2actual units to plant the last bed are retained. A separate clean fresh-process Continue verifies exact saved Scholar/Codex. No full campaign ending or physical-device clearance.

### Current R2 screening checkpoint (controller source66fd22e48)

Fresh matched16x4 BOTH modes use the same current Game/controller source, one current collector and declared COMMUNITY_PLANNER intervention. All64 cases/mode,0cache reuse, eight exact neutral pairs/mode and stable sources pass; all31 metrics and feature censuses are retained. The real neutral maintenance proof is refreshed through balance-proof-update.js. Proper Windows/Bash quick467/0 is source-stable; the full saved-candidate suite and review handoff remain pending at this checkpoint.

Wins: capable13->13, maker5->6, merchant7->4, caregiver7->3 /16. This current legacy reference includes the per-bearer accounting correction; it is not historical R1. Maker national/gear watches, merchant national/gear signals and entry/death watches, caregiver national signal and survival/death/class watches remain REVIEW_REQUIRED,0validity errors. No64holdout or net-benefit claim. Win movement is investigation, not an automatic verdict.

Read-only retained-row follow-through census records actual peer calls: maker45trade, merchant43trade, caregiver12trade/32covenant, versus none before. Real feasts and own food contributions now occur on these paths. StudyVillageCodex remains0: the physical prerequisite visit/return is the next port, not implemented here. Calls are not unique opportunities or all successful outcomes. Merchant trade rewards total71->64units and27->25tier3weapon/armor units, while runs obtaining craft/trade tier3gear drop11->7; concentration and unknown unbought-offer availability prevent an ignored-opportunity diagnosis. Do not compensate through rewards.

Recorded death-prefix decomposition also matters: merchant monster deaths435->486, villager-prefix53->40, person-prefix22->14 across the16runs. The aggregate death warning cannot by itself prove worse resident survival. Caregiver villager-prefix32->48 remains concerning; prefix labels are not canonical current-Haven-resident identity, and ending/exposure windows differ. Preserve the full raw panels and require actual opportunity/call-chain diagnosis before changing defense or survival levers.

Actual day17phone aid flow completes cleanly: the three-day plant quest consumes5harvested units, increments done1->2, clears its active quest and teaches track_readL1 (Reading Tracks); magic slots stay4. Its named reward is buried by a generic final line, and the hand-in button duplicates “Hand over”. Character/Skills shows the real learned skill. Offered care for Oliver spends32ticks and adds a bond; illness was already at its1dayfloor, so no immediate cure/HP benefit is claimed. Exact saved Scholar/Codex match and source stability pass. Latest resumable profile is natural-day17-aid-r1/profile.json outside the checkout, with compressed dated copy here. Original Anaconda queued-input failure remains failed; the separate cold/journey successes do not relabel it. The expedition remains alive day17/100HP.
