# ROADMAP: what's built, what's next, how to do it

*For Muse (and any agent). Updated 2026-10-15. The early-October roadmap
is archived in `docs/_archive-ROADMAP-2026-10-03.md`.*

> "Get the important stuff built, leave the bulk of work once scaffolded to
> the muse agent to resume. But set it up for success in all future
> endeavors." — Steve

## 0. Every session

God support recipient repair (2026-10-16): wounded NPC One-Person Army holders
can rally the nearby living player; actual player strikes/abilities consume
the existing raw +4 convention, with finite own-turn expiry. Fallen NPC Voice
holders impose the same lost action on the player as other allies. Canonical
self aliases cannot receive their own ally effect. Runtime/phone and matched
campaign evidence: ../evidence/2026-10-16/god-support-audit.md. Active Voice
commands and class broadcast/aura still need a player-controlled action path;
this repair does not complete the support roadmap.
The same audit retains a legacy-test isolation debt: hunter-ecology's minnow
setup can exhaust its branches before the gate assertion. Four deterministic
seeds reproduce it identically before/after; preserve the assertion and fix
the setup in its own test-maintenance unit rather than hiding a red result.

NPC measurement eligibility (2026-10-16): the balanced observer now correlates
NPC class/god records with a known living resident other than the current
bearer, resolves saved/background people, and deduplicates roster IDs. New
npcExposure and feature-census holder-days separate actual sampled holders
from stale/self records. All256 retained standard rows, full hashes and23
scalar metrics are unchanged; NPC god distributions are corrected in55 runs.
Runtime30/30, scorecard30/30, maintenance8/8, primary full945/945. Identical
tooling and a branch-specific neutral proof are shared for Muse; its game
still has legacy failures, explicitly retained and controlled. Read
../evidence/2026-10-16/npc-measurement-audit.md before interpreting old NPC
availability claims. No gameplay, policy, win target or survival lever changed.

Formal companion body audit (2026-10-16): actual far/formal-only and loyal
betrayal helpers still enter at30HP without worn gear, and unharmed escape
can overwrite77 or9 saved HP with30. A repair passes28 focused assertions
and the native phone barrier exit, but is **not adopted**: full checks retain
one food-deed failure as early-reactor histories change. All four64-seed
policies gain wins while named-class access falls; no win-rate verdict or
compensating tuning. Exact candidate sources,520 standard jobs, neutral
diagnostics and reconstruction are in
../evidence/2026-10-16/formal-companion-audit.md. Published gameplay and tests
remain the prior green baseline. The existing reactor question, companion
entry/initiative contracts and other independent roadmap work remain open.

Canonical companion/Apex parity (2026-10-16): a real succession replay
exposed the current person entering fights again as an NPC from stale
positions/party membership. Normal monster, alien and formal-party/betrayal
constructors now use distinct canonical people and exclude the bearer.
Apex's real NPC ally opening reaches the player's actual strike state;
borrowed2x and personal3x are one opening, not6x. Raw legacy arrays remain
readable. Runtime14 identity /21 ambush assertions, native phone succession
and scheduled NPC Wait -> Strike proofs pass; quick172/172, full944/944.
Four retained source arms separate the rejected clone-assisted candidate,
identity-only repair and final recipient repair. The64-seed identity panel
keeps merchant/community and caregiver/access tradeoffs under review; no
compensating buff or win quota. See ../evidence/2026-10-16/apex-identity-audit.md.
Voice/brawler player-recipient gaps, Garden's interpretation, far formal
companion body/gear parity and natural titan/Network coverage remain open.

Field brawler weakness (2026-10-16): Turn the Pain now uses actual landed
field wounds minus light, matching the tactical beam exclusion. Final
post-mitigation harm determines the counter; ally hits are separate. A
fatal hit cannot trigger this god strike before end-of-round death handling.
The existing35percent trigger,150kcal-equivalent price, power and one-use
limit remain. Runtime22/22 and prepared real browser fights pass; quick170/170
and full942/942 pass after disclosed legacy drifter-test triage. Exact
sources, matched panels, opportunity limits and the needs-eyes mixed-hit
attribution are in ../evidence/2026-10-16/field-pain-audit.md. Other scale
and recipient gaps in godpath/SCALE-AUDIT.md remain open.

Hoarder payoff parity (2026-10-15): the existing dawn hook paid only the
player. It now pays actual living resident NPC holders with their own build,
the same existing rate/threshold/cap and a saved once-per-person/day guard.
Prepared runtime, native phone Sleep/save/reload, matched campaign panels
and their limits are in ../evidence/2026-10-15/interest-parity-audit.md.
Natural NPC acquisition and other payoff parity are still open.

Cornucopia caller repair (2026-10-16): real player plant sweeps, resident
forage duties, adjacent plant gathers and returning foragers now use their
own saved chain and actual yield. Walking between finite patches preserves
focus; failed gathering, other work, combat and dawn reset it. Existing
15percent steps/cap150percent remain. The native cell interaction's extra
tick is included, with no time discount. Runtime33/33, quick169/169 and
full941/941 pass; buildarounds has zero static unwired functions. These
checks do not establish universal parity. The64-seed/five-policy comparison
retains maker Table/access and survival tradeoffs for review; no win quota
or compensating buff. Exact rejected initial candidate, final sources,
735 verified campaign/control jobs, native phone proof and limits:
../evidence/2026-10-15/cornucopia-audit.md. Eight fitting deeds, broader
passives and the pending reactor/food-use decision remain open.

Introductory-choice audit (2026-10-15): the loader correctly leaves choices
to policies; capable omits the real knack sheet. A source-bound correction
and128-campaign policy screen are retained, not adopted: both existing
40-day test seeds acquire the feast-blocking reactor early, so the unchanged
food-deed assertion fails. Resolve the reactor/food-use progression question
in OPEN-QUESTIONS.md before adopting it. Preserve the candidate failure;
do not tune win rate or weaken the test to hide it. Exact reconstruction,
all metrics and natural replays: ../evidence/2026-10-15/knack-policy-audit.md.
Other godpath, NPC parity and regional work remains available.

**Measurement priority (Steve, 2026-10-15):** optimize against a balanced set
of telemetry, not win rate alone. Winning should be difficult; win-rate
changes prompt investigation in either direction, not an automatic regression
or improvement judgment. Keep `docs/SURVIVAL-LEVERS.md` current. Follow `docs/MEASUREMENT-PLAN.md` and the
balanced-scorecard commands in `docs/SIMULATING.md`. Keep per-playstyle survival,
community, food/water, earned gear, progression, feature use and ending outcomes
visible. The resumable runner, paired comparator and shard merger are tooling;
they do not complete Garden or other gameplay backlog items. Small-effect
confirmation, fixed time windows, opportunity funnels and human playtesting
remain required where applicable.

Measurement v1 is implemented: 23 contracts, a resumable standard-driver
collector, per-policy paired comparison and disjoint shard merger. The initial
16-seed × four-policy feast screen reproduces all 128 historical rows/hashes
and flags survival/community/death regressions beyond wins. Final zero-use
method denominators and feature/recipe funnels are retained; broad confirmation
and opportunity/time-window work remain open. See
`evidence/2026-10-15/balance-audit.md`.

1. Read `docs/godpath/STEVE-ANSWERS.md` (Steve's verbatim calls; it outranks
   everything). **Never ask Steve something it already answers.**
2. Read `docs/COHERENCE-SPINE.md`: how the progression features fit together.
3. Read `docs/AGENT-LANES.md` before claiming work. Muse owns region
   content/nomad/regional systems; Codex owns godpath/ascension/subclass/scale
   and Table codas. Pick the next unclaimed item in your lane and read its spec.
4. Work the loop in `AGENTS.md`: proof test, then `node scripts/check.js
   --quick`, then a small commit. Run the full `node scripts/check.js` before
   pushing.
5. Questions for Steve go in `docs/OPEN-QUESTIONS.md`. Record his answers
   verbatim in STEVE-ANSWERS.md.

**Standing rules from Steve (the short version):**
- **Players and villagers are treated the same.** "When in doubt we treat
  them the same way." Any new mechanic works for both.
- **Abilities are magic** (6 slots, earned through tracks and gifts).
  **Skills are human competence** (uncapped, learnable before the System,
  teachable).
- **No spoilers:** "If you don't know, it doesn't show." Late systems don't
  exist in the UI until they're reached.
- **The Table prices the run and never gates on godhood.** Every scenario can
  be lost.
- **Gods start out as jobs and playstyles**, so builds should grow from who a
  person was.
- **Data over code.** Content is JSON, and each content type has a validator.

## 1. What's built (2026-10-14)

| System | Where | Doc / proof |
|---|---|---|
| **Abilities vs skills.** 94 magic abilities; 78+ skills; old saves migrate | `abilities.json` `lane`, `knowledge.json` | `evidence/2026-10-14/` ability-lanes test |
| **One progression for everyone.** 5 tracks (combat, field, social, craft, strange), shared XP, pick 1 of 3 with swap-or-keep, about 8 level-ups per run, jobs set your lean | `tracks.json`, `tracks.js` | `unified-tracks.md`, `parity.md` |
| **Villagers as players.** Knowledge-seeking, target builds (`buildScore`), gear, first ability in slot 1, the mantle (you become that villager) | `villager-build.js` | `parity.md` |
| **Skill teaching** between any two people, before the System, plus track skills at track levels 2 and 4 | `skill-teaching.js` | `skill-teaching.md`, `skills-pre-system.md` |
| **God paths.** 10 paths × 2 subclasses, one god each, 27 new verbs, class recognition, offers lean to your path, ascension | `godpaths.json`, `godpath.js`, `godhood.js` | `docs/godpath/PLAN.md`, `godpath-unified.md`, `godpath-buff.md` |
| **Keepsakes.** Compete for accessory slots, grow only while worn, L0 to L3, thread-home clues | `keepsakes.js` | `COHERENCE-SPINE.md` |
| **The Table.** Haven option from day 90, locks on entry, the ending key, build-aware beats, composed endings (path final plus one coda) | `table*.js`, `endingKey.js`, `table-endings.json`, `table-beats.json` | `docs/TABLE.md` |
| **Overtime, THE NETWORK, THE HOSTS.** Waiting costs; the map-spanning key; the best human ending | `overtime.js`, `network-campaign.js` | `docs/TABLE.md` |
| **World regions engine.** 20 regions (2 playable), first run lands at your origin, real-date seasons, wet/dry calendars, kin placed across the world, the Taken off-world | `regions.json`, `climates.json`, `world.js` | `docs/WORLD-REGIONS.md` |
| **Where are we.** Season and region learned through conversation; the header line | `whereAreWe.js`, `climates.json` `talk` | `CONVERSATIONS.md` |
| **Sim bot.** `capable` flees, uses abilities, takes the seat, and sweeps | `scripts/policies/capable.js` | `docs/SIMULATING.md` |
| **Sprites audited** (294; 28 redrawn, 19 plants added) | `sprites.js` | `sprite-audit.md` |

**Also built (2026-10-14, late):**
- **Presentation A:** grounded pre-System feedback, payoff-moment effects + sound + haptics (`src/js/feel.js`), voiced day-7 arrival, live synth signatures, Settings → Feel (vibration, reduce motion). Proof: `evidence/2026-10-14/presentation/A-*`, `A-audio-map.md`.
- **Presentation B:** colour tokens, presentation stage ladder (`presentation.js`/`presentation.json`), cold System glass, alien-script glitch, handwritten marginalia, titan sprites + bar, bespoke Table and level-up screens, zoom/contrast/≥12px. Proof: `evidence/2026-10-14/presentation/B-*`.
- **World origins:** 69 picker origins covering all 20 regions, world lifeseeds, 6 new name cultures, 5-tier familiarity, eastern fauna trimmed. Proof: `evidence/2026-10-14/origins-world.md`.

**Class diversity (built):** job → path lean (`characterGen` `pathLean` on every occupation — any new occupation needs one) and a 6-wide level-up window (`godpaths.json rules.offers`). Subclasses seen 6 → 10 of 20; ascensions up. Evidence: `class-diversity.md`. 

## 2. Muse's backlog, in order

Each item: **spec**, **done when**, and the **tool** that measures it.

### Current priority from Steve — playstyle viability (2026-10-15)

"Make sure that combat isn’t the only viable way to obtain good gear. We want to see viability in game for all playstyles. Do contests and tv shows reward enough? Auditing for any dead spots in feature usage?"

The first audit and reward-to-equip fixes are in
`evidence/2026-10-15/noncombat-gear-audit.md`. Contests, audience gifts and
repeat trade now have earned access to actual weapons/armor. The Pack's
inventory snapshot preserves the IDs/metadata needed for Equip/Wear/Use.
**This is not a claim that every playstyle is balanced.** Continue the
simulation/playtest goal with these gaps before expanding content blindly:

1. **Crafting and knowledge access.** The follow-up audit repaired crafted
   ammunition that could not fire and false "Crafted" UI receipts. In the
   16-seed screen, neither policy successfully crafted arrows; knowledge
   and material access remain sparse. See `evidence/2026-10-15/crafting-route-audit.md`.
   The next pass added a found field notebook for bows/ammunition and a
   maker that actually seeks and reads books. At 64 matched seeds, two runs
   learned the recipes from it; neither crafted ammunition. All 64 maker
   runs earned tier-3+ gear from noncombat reward sources, but overall wins
   did not improve. See `evidence/2026-10-15/bowyer-route-audit.md` before
   treating knowledge access, material supply or ranged-policy use as solved.
   The next policy audit compares worn and packed weapons, funds a stronger
   dry bow despite a weaker fallback, and actually wields it via public
   equipment actions. Its real-shot proof passes; 64 matched capable/maker
   runs per arm still craft no ammunition. All makers retain earned noncombat
   tier-3+ gear, but neither overall balance nor natural ammo supply is solved.
   See `evidence/2026-10-15/ammo-upgrade-policy-audit.md`.
   Improve usable survival supplies and earned reward access for makers;
   an advanced recipe ladder is not an established requirement. Steve's
   direct 2026-10-03 wording in `DECISIONS.md` focuses crafting on supplies
   and knowledge, with less grind. Keep this distinct from the later basic
   gear recipes; don't invent magical crafting to fill a prize gap.
2. **Honest livelihood ending probes.** `merchant`, `maker`, `caregiver`
   share capable's survival/choice brain. Disable deliberate hunting and
   feast patrols while retaining feasts/devotion and ordinary defence.
   Measure seat prerequisites and actual endings; distinguish missing bot
   behavior from a gate that excludes a playstyle. Never use legacy
   `socialite`'s failure to take a seat as proof social play cannot win.
3. **Underused systems.** Targeted public-action probes for preservation,
   pemmican, storage expansion, armory/stash sharing, peer trade/covenants,
   party orders, and the titan/Network route. Zero calls in the ordinary
   sweep establish a coverage gap, not a value judgment.
   Storage expansion now requires the exact Haven world tile and no live
   fight, and its warning respects unknown professions. Shared-harness and
   actual phone Pantry-button proofs retain costs, builder discount, labor,
   and capacity gains. All 32 matched natural states remain identical, with
   zero storage/pemmican calls; this is contract proof, not livelihood value.
   See `evidence/2026-10-15/storage-worksite-audit.md`. The next audit proved
   the paid smoke/render/pemmican ladder and repaired empty ingredient stacks
   funding pemmican. Actual phone play found corpse-menu dispatch swallowing
   terrain/person actions on empty cells; the body branch now requires a body,
   restoring the existing fire menu and its pemmican action. A prepared novice
   completes Render → Smoke → Make with real costs and yields. Natural 16-seed
   capable/maker screens show no sampled fat, no rendering knowledge, and zero
   pemmican calls. Maker smokable meat often sits on the prep counter its own
   routine ignored. The maker now processes one safe counter batch per day
   inside Haven, retaining meal/time reserves: cook through first, then smoke
   and shelf. Public shelving now honors normal pantry access (including exile
   and Full Integration); its false success receipt is removed. Cooked counter
   meat now exposes Smoke and undercooked batches expose re-cooking in the UI.
   In 64 matched maker seeds, four runs use the route (five cooked/smoked,
   four shelved); wins 20→21, bearer deaths 51→53, so no balance improvement
   is established. All 64 retain earned noncombat tier-3+ gear; fat/pemmican
   access remains absent. Seed 5's unshelved batch is now traced: public
   shelving correctly refuses a full pantry and retains the smoked portion;
   the replay exactly matches its recorded hash. Counter byproducts had no
   pickup path even though crafting requires carried stock. The counter now
   offers a deliberate, capacity-limited material pickup (2 ticks), preserving
   exact quantities/metadata. Actual butchering → pickup → hide-armor craft →
   wear is proved in the shared harness and phone UI. Makers fetch just the
   missing counter stock for an otherwise funded known recipe. In 64 matched
   maker seeds initially all states remained identical: none knew hide armor
   at L2+. The next audit found an existing L1 hide-handling lesson wired only
   to corpse loot, not ordinary butcher byproducts/pickups. Actual handling now
   uses that same lesson across paths. Makers can try a bounded L1 experiment
   with visible supplies, without reading the hidden recipe's requirements.
   In 64 matched maker runs, L1 access grows 3→42, L2 0→13, successful armor
   crafts 0→18. All 64 retain earned noncombat tier-3+ gear, but wins 21→19
   and bearer deaths 53→56 establish no survival improvement. The capable
   control learns more outlines but retains 14/16 wins. Real phone L0→L1→
   successful blind trial→L2→Wear is proved; maker trial cadence/guess quality
   needs further playtesting. Do not promote these outcomes to crafting-only
   viability or a demand for an advanced recipe ladder.
   Read-only stock traces now separate unfunded guesses from actual risky
   rolls. The maker remembers an unchanged rejected visible guess; new stock
   and restocking a funded failed roll remain retryable. In 64 matched seeds,
   trial calls fall 85 to 49, crafts stay 18 and L2 learners stay 13. All 64
   retain earned noncombat tier-3+ gear; 63 final states match exactly. The
   one changed seed makes a newly available funded attempt, loses materials
   and misses its prior win (aggregate 19 to 18, deaths unchanged at 56).
   This is honest policy coverage, not a survival improvement; no gameplay
   costs or odds change. See `evidence/2026-10-15/maker-trial-audit.md`.
   See `evidence/2026-10-15/hide-discovery-audit.md` and the preceding
   `prep-material-access-audit.md` / `maker-counter-trace-audit.md`.
   Armory/pharmacy public deposit → take → equip/consume now reject empty
   units and depleted doses, including NPC use; ordinary medicines spend one
   unit and dosed bottles one dose. Real positive stacks and player/NPC use
   are proved in the shared harness and phone UI. All 32 matched natural states
   are unchanged, with zero player sharing calls: value/use remain open.
   New capable covenant/charter/control probes now exercise public equal
   links, real pool relief, priced crises and actual away-party help. A first
   16-seed screen per policy reaches three peers in every route run and live
   national benefits in 13/16, but no seats: removing LEAD tribute exposed the
   inherited bot's feast-contribution dependency. Explicit affordable armed
   hosting, applied to all three probes with actual costs/buffs and no granted
   combat-use deed, reaches 7/16 covenant and 8/16 charter wins versus 1/16
   control. All 48 still personally earn noncombat tier-3+ gear; this proves
   natural reachability, not all-build balance. Actual pool/help transfers and
   21 prepared runtime checks pass. Weekly net economics and fresh mobile
   peer controls remain open. See `evidence/2026-10-15/peer-league-audit.md`.
   See `evidence/2026-10-15/armory-quantity-audit.md` and the preceding
   `maker-counter-audit.md` / `preservation-access-audit.md`.
   The coalition-entry audit found a structural ceiling (3–4 villages ×
   two volunteers, plus three from Haven) and duplicate-call inflation.
   Strong allies can now provide up to six distinct real people; repeated
   calls, upkeep and the paid Finale reinforcement action are repaired.
   Prepared strong alliances reach the unchanged 20-blade gate in 15/16
   generated worlds. This is capacity evidence, not a campaign win rate.
   See `evidence/2026-10-15/coalition-recruitment-audit.md`.
   The separate `campaigner`/control policies now use real councils, food,
   donations, recruitment and approach: nine natural Herald fights, six
   kills in 16 runs, but no Finale entry or tier-three overtime/Network.
   Wide-grid AI movement is repaired with runtime proofs; matched natural
   state hashes do not change. The phone presentation follow-up now draws
   144 cells and living named allies at combat positions; labels are 12px,
   and real Wait turns visibly move the army. Ordinary combat retains 81
   cells. The direct Table trial actually uses 12x12. Its world-campaign
   setup/tools/resolution leak is now repaired, with real phone loss →
   mantle → Table continuation. See `evidence/2026-10-15/table-trial-isolation-audit.md`.
   The committed-volunteer mantle follow-up now removes the extra NPC role:
   readiness, upkeep, injection and Network survivor floors exclude the
   current bearer. An actual phone death transfers to a volunteer, reduces
   the allied muster by one, and continues the Table with one bearer token.
   See `evidence/2026-10-15/mantle-coalition-audit.md`.
   See `evidence/2026-10-15/coalition-presentation-audit.md`.
   Ally reach now uses a large target's whole body; disengagement checks the
   entire party. With a prepared guard/counter tactic, 7/16 crew clears
   replace zero (not a natural win-rate claim). Two runs clear the opening
   credits, then expose heart spawns beyond the nine-wide world map. Shared
   titan/Finale placement now chooses free non-village sites within the map
   and repairs invalid saved locations. All 81 origins are covered; a matched
   prepared run now reaches the real heart fight and retreats. Continue
   public heart counters, a late six-slot build and the cautious
   bot's food/overtime limits. A developed six-slot caregiver fixture now
   completes the real Finale in 21/64 matched prepared runs with paid Mend,
   versus 9/64 for the same kit/old guard and 1/64 for the starter fixture.
   All start at 100/100 HP; no balance numbers changed. Every completion has
   three actual wins, and no dead ally reappears at the next stage. Natural
   Finale reach and a full Network march remain unverified.
   See `evidence/2026-10-15/caregiver-campaign-audit.md`.
   The Network audit closes an in-march Haven recruitment loophole, keeps
   its 20/5/10 gates, and enables the ordinary paid route-around behavior
   for campaign travel. A prepared 16-world screen enters 11 Networks and
   reaches three cleared nodes at most; no full Network win. Extra public
   counter use remains experimental because it did not improve that screen.
   See `evidence/2026-10-15/network-march-audit.md`.
   Crew spoils now parse into bot actions (the phone already exposed them),
   with actual one-use effects proven. Item feeding now consumes a positive
   inventory stack rather than accepting exhausted duplicates for free.
   A matched prepared march uses one earned tool but still retreats.
   See `evidence/2026-10-15/finale-counter-audit.md`.
   See `evidence/2026-10-15/finale-placement-audit.md`.
   See `evidence/2026-10-15/ally-reach-audit.md`.
   See `evidence/2026-10-15/campaign-usage-audit.md` for the natural screen.
4. **Item promises.** Audit `baseEffect`-only path items and unused
   `tradeValue` fields (e.g. audience tokens). Functional armor/weapon
   fields are proven separately from bespoke advertised powers; a
   `findable: true` flag does not establish a real acquisition route.
5. **Telemetry purity and attrition.** Use the version-2 gear census's
   standard driver and observer-on/off state proof. Don't mix its rows
   with exploratory custom-cadence or legacy dashboard counts. Reward
   access improved; survival/win-rate improvement is not established.

Keep the ordered content backlog below and its dependencies. This audit is
Steve's latest steering, not a supersession of his broader roadmap.

### 1. Region content, wave 1 (biggest value)
- **Spec:** `docs/WORLD-REGIONS.md` §9 (waves) and §11 (the checklist).
- **Target:** about 6 fully playable regions first: the existing woodland plus
  `africa_sahel_savanna`, `south_asia`, `eu_temperate`, `east_asia`,
  `sa_amazon`. The rest stay origins and nomad destinations until later.
- **Per region:**
  - about 30 plants (reuse cosmopolitan species where true), about 10 animals,
    3 fish, about 6 trees and bushes
  - 3 ruins, about 10 scavenge items, a pantry
  - 3 landing variants, a lifeseed region, a challenge, 2 monster variants
  - a climate calendar (exists) and "where are we" voice lines
    (`climates.json` `talk`)
- **Accuracy matters:** edibility and lookalikes are gameplay. Use the
  `confidence` and `sources` fields.
- **Done when:** `node scripts/validate-regions.js` shows it playable, and
  `REGION=<id> node scripts/region-smoke.js` passes.

**Europe progress (2026-10-15):** `eu_temperate` is now selectable and
passes the playable-region data contract: 29 plants (19 new with their own
sprites), regional fauna including 3 fish, 6 trees, 3 landings, regional
pantry/ruins/scavenge and climate voice. The 16-seed, 60-day capable screen
has 15 villages surviving; the matched woodland control has 16. Berlin and
Lagos origin screens each survive 3/3. This is a playable content slice,
not full regional parity: the Hungry Gap challenge and two monster skins
remain explicitly scaffolded until their roadmap runtime wiring. Seed 777's
day-40 loss, global-pool RNG shifts, remaining species/art accuracy and
all-playstyle survival are open. See
`evidence/2026-10-15/europe-region-audit.md`. Muse has published six regions
on `region-content-wave1`; its Europe data overlaps this independent slice
and needs deliberate reconciliation, not a blind merge. Codex resumes the
godpath lane. The follow-up 150-day audit found regional trap catch lists
restricted to North American species. Correcting those restores actual
carcasses/hide learning, but the 64-maker screen has mixed outcomes (21 to
15 Table wins, 71 to 63 bearer deaths). See
`evidence/2026-10-15/region-livelihood-audit.md`; maintain the playstyle audit.

### 2. Table ending codas (complete, 2026-10-15)
- **Spec:** `docs/TABLE.md`, "Endings by build". Write in this order:
  1. god codas (20)
  2. class codas (40)
  3. track codas (10)
- **Voice:** spare and second person, matching the 6 samples. A coda must read
  right after any of the seven paths' finals. `{path}` is lowercase "the …".
- **Tool:** `node scripts/validate-table-endings.js --todo`
- **Complete:** all 70 light/dark codas (10 gods, 20 subclasses, 5 tracks),
  including noncombat builds. Bespoke path overrides retain priority. The
  actual Table sheet now advances between choices, and the final screen
  renders the resolved path outcome plus one coda. THE HOSTS and pod-demand
  retain their base stories. Prepared coverage: 595 selector/path/moral
  cases and 70 actual final choices; real phone Gardener/Assimilated ending.
  Matched 16-seed capable/maker screens preserve all standard outcome fields
  (9 and 6 wins respectively), while 15 formerly generic wins gain codas.
  Narrative voice remains needs-eyes. See `evidence/2026-10-15/coda-audit.md`.
  Optional bespoke beats/overrides are not a missing-coda backlog.

### 3. God deeds (replace the placeholder)

Actual NPC food-demand diagnostic (2026-10-15): meal settlement now returns
its computed need, personal production and actual communal request without
changing meal rules. Garden coverage distinguishes actual NPC diets from
post-production requests; legacy missing data remains unknown. Targeted
16-seed feeder evidence: 1,673 stable village-days, 14,916 NPC meals, about 95%
of need self-supplied and only eight days where every NPC requests food.
This does not settle Garden's seven-day threshold, continuous membership or
the bearer diet. See `evidence/2026-10-15/garden-demand-audit.md`.
- **Current authored deeds:** Unkillable requires a real fatal refusal and
  later dawn; the Voice of the Relay now requires the person's actual current
  office. The class-age/synergy fallback cannot bypass those two. Eight other
  gods retain legacy proxies. Actual player claim, villager appointment,
  removal, dead-holder rejection and save/load have runtime proof; the known
  class's actual phone sheet changes on the public claim. Matched 64 x four
  wins: capable 45 -> 45, maker 20 -> 20, merchant 26 -> 26, caregiver 23 -> 25.
  Maker deaths 62 -> 64; other outcomes and reduced Voice access are retained.
  The caregiver win increase triggers nondirectional review, not an automatic
  improvement claim. See `evidence/2026-10-15/relay-deed-audit.md`.
  The exposed dead-predecessor blockage is now repaired separately: actual
  death, successful load and the communications tick vacate a dead person's
  post and restore the ordinary appointment beat. Living holders and real
  death refusals keep the post; the successor must claim/accept it explicitly.
  Runtime 13/13 and actual phone death -> mantle -> vacant role -> public
  claim pass. See `evidence/2026-10-15/relay-office-audit.md` for the separate
  matched screen/confirmation and retained outcome warnings. At 64 seeds
  per policy, the office fix changes wins 45 -> 41 / 20 -> 21 / 26 -> 25 /
  25 -> 28 (capable/maker/merchant/caregiver). Maker community losses rise
  19 -> 25; all six new cases replay exactly and actual new role choices
  are recorded. This remains an open balance investigation, not a reason to
  restore dead holders. Next: a separate public-goal/food/grounding-aware
  policy experiment, with held-out seeds and equal-time exposure checks.
  First settle the reproduced existing Relay clock mismatch: code promises
  daily upkeep but the part hook charges 100 -> 96 grounding across four
  calls on one day. See relay-office-clock-probe.cjs / relay-office-clock.json;
  measure that correction independently before tuning prices or policy.
- **Earlier Unkillable implementation:** Unkillable has the first authored outcome deed: really refuse a
  fatal blow through your own survival magic, then reach a later dawn alive.
  Per-person receipts and a known-class objective are wired and tested.
  At that earlier point, nine gods retained legacy synergy/class-held-for-10-days proxies
  (`godpaths.json` `rules.capstone.deedClassDays`).
  See `evidence/2026-10-15/survivalist-deed-audit.md`.
- **Passive follow-up:** NPC Second Wind/Molt now activate through tactical,
  field and actual world health damage. Per-person caps survive succession;
  field wound callers preserve actual survivor HP instead of cumulative
  damage. Runtime/caller proofs and 64-seed x four-policy comparison are in
  `survivalist-passive-audit.md`: wins 90 -> 91/256 overall, but caregiver
  wins 21 -> 15/64. No natural Second Wind/Molt receipt in that panel; their
  Strange-kit positions 10/11 and the caregiver outcome regression need
  targeted access/ending investigation. Full broader parity remains open.
- **Public-stakes diagnosis:** the default campaign policy now reads the
  Table's already-visible current meters. Matched 64 x four runs improve
  wins 91 -> 113/256, caregiver 15 -> 20/64, with Table entries, deaths and
  median game days unchanged. No reward, gate or UI change. The earlier
  21 -> 15 caregiver regression remains recorded above, not erased.
  `evidence/2026-10-15/table-access-audit.md` records the public-information
  proof and zero Second Wind/Molt appearances in 26,733 kit offer appearances.
  Caregiver seed 12 exposed a global-rank run blocked solely by combat-only
  food-use credit. Landed, paid Field Medicine feast bonus now earns that
  deed outside combat; hosting, failed treatment and zero bonus do not.
  The caregiver policy uses learned wound care, and the treatment label now
  states its full existing 140 kcal price. Prepared phone play and corrected
  16/64-seed comparisons are in `feast-healing-audit.md`. An initial telemetry
  comparison was rejected because it advanced the harness clock; use the
  corrected artifacts. Clean matched caregiver wins rise 17 -> 21/64 with
  four new Table entries; all 192 control-policy rows stay identical.
  Measure ability access next; broader parity, NPC
  feast power and nine authored deeds remain open.
- **Living Garden intake prerequisite:** canonical harvest sources and real
  eating receipts now cover pack/counter, home/away, gifts, feasts and guest/
  probation meals. Real ration returns are excluded until later eaten.
  Runtime 37/37, full 923/923; 256 matched standard results remain identical
  (124 wins / 229 player deaths). The seven-day authored gate remains open.
  The exposed host-food gap is now repaired: actual phone reserve rises
  1,000 -> 1,416.67 from the paid 5,000/12-kcal serving. Runtime proof 15/15,
  full 924/924. Matched 256 campaigns worsen 124 -> 114 wins and
  229 -> 256 deaths; retain that needs-eyes result, not a viability claim.
  Four lost-win traces now reproduce matrix rows/hashes with eight neutral
  observer pairs. First gains are positive 19-55 kcal; later food actions,
  fights and succession diverge. No immediate serving/buff/price defect in
  those cases; broad negative result stays. Settle whole-village coverage
  next. See `evidence/2026-10-15/feast-outcome-audit.md`.
  See `evidence/2026-10-15/feast-host-audit.md` and the prior intake audit.
- **Whole-village diagnostic:** 16 seeds x four policies now retain actual
  end-of-day rosters and per-eater source receipts. All 64 standard rows and
  final state hashes match the prior balanced baseline. Of 7,311 closed days,
  6,518 have stable known multi-person rosters: 27 receive some nourishment
  from one harvester across every resident, zero reach even 300 kcal each.
  No harvester reaches seven days at the tested meal/diet references. These
  mixed policies are not a dedicated village-feeding strategy; no Garden
  gate or threshold changed. Next: targeted public harvest/donation/gift
  play, exact need denominators and runtime membership/day settlement.
  See `evidence/2026-10-15/garden-coverage-audit.md`.
- **Deliberate feeding / gift repair:** garden-feeder now exercises real
  tending, harvests and nearby gifts without resource/kit grants. Phone play
  exposed 250 kcal clearing 80 hunger. Gift relief now follows the actual
  food and the existing 25-kcal/hunger receipt convention; a full gift draws
  enough food or leaves hunger. Default four-policy 16-seed rows, hashes and
  all 23 metric vectors stay identical. The feeder's 64-seed comparison is
  review_required: wins 31 -> 29, community losses 8 -> 11, player deaths
  48 -> 51, with exploratory intervals including no change. Contest/show
  tier-3+ weapon/armor access stays 62/64. Three lost-win replays match their
  saved rows/hashes; first gifts charge real food and preserve dinner stock.
  This is a correctness repair, not a balance improvement claim. The
  seven-day Garden gate remains open. See garden-gift-budget-audit.md.
- **Spec:** one fitting deed per god in `godpaths.json`, e.g. Apex Predator: a
  solo kill above your weight; Living Garden: feed the whole village from your
  own harvest for 7 days. Keep ascension at roughly 25–40% of long runs
  (measure it).
- **Tool:** `scripts/godpath/validate.js` and `ladder.js`, plus a 64-seed sweep.
- **Measurement / parity repair (2026-10-15):** a 64-seed x four-policy
  standard-driver panel now measures current ascensions and credited work.
  The actual Relay office holder now completes the same existing Socialite
  deed as player or villager (prepared real-action gate/ceremony proofs).
  Nine fitting outcome replacements remain open: gardening XP, for example,
  credits sowing/tending and cannot prove village feeding. See
  `evidence/2026-10-15/deed-audit.md` and `scripts/godpath/deed-screen.js`.

### 4. God scale effects
- **Recovery progress (2026-10-15):** all ten god verbs now have real
  player/villager callers, food costs and weaknesses. Party/titan interactions
  include returned ally damage, rooting titans, raising fallen allies and
  phase protection. `scripts/test-god-verbs-wired-20261015.js` exercises
  these through game actions; see `evidence/2026-10-15/resume-claude.md`.
- **Remaining:** reconcile each promised party, titan, contest and army
  effect in `godpaths.json` against those implemented verbs. Wire and prove
  any remaining effects (PLAN.md "What's left" #4); the recovery proof does
  not establish that every promised scale effect is complete.

### 5. The Long Way Home (nomad ending)
- **Spec:** `docs/WORLD-REGIONS.md` §6.
- **When:** after wave 1, since it needs at least 2 more playable regions. The
  engine can be built against fixture regions before then.
- **Pieces:**
  - the leave option in Haven
  - the party (villagers with kin of their own volunteer)
  - legs, where each region is a generated map
  - backstory trails sharpened by keepsake bond
  - reunion fates
  - the ending, light and dark

### 6. Region systems that are scaffolded but not read yet
- **Spec:** `docs/WORLD-REGIONS.md` §4 rows 6, 7, 18–20.
- **Pieces:**
  - temperature and heat/cold stress
  - weather effects beyond clear, rain and cold
  - water abundance
  - the region challenge ("boss")
  - monster variants
  - tile skins
  - the predator maul text ("bear" is hardcoded)

### 7. Item art gap
- **Now:** 95 item ids show the "unknown item" parcel (mostly god relics and
  alien gear).
- **Spec:** draw them in the audited style (`evidence/2026-10-14/sprite-audit.md`);
  the sprite test checks validity.

### 7b. Remaining subclass coverage gaps
- **Current screen (2026-10-15):** 64 seeds per policy, capable/maker/merchant/
  caregiver, daily class samples: 14/20 across the companion-body panel.
  Bulwark, Warden, Seer, Keeper, Hoarder and Dealer were not sampled; neither
  Miser subclass appeared even under merchant play. Juggernaut and Undying
  now appear, replacing Seer and Keeper in this panel. These are observed
  bot gaps, not proof that a human cannot form them. See
  `evidence/2026-10-15/alien-party-audit.md` for current evidence; older
  `deed-audit.md` measurements remain historical baselines. Deep kit
  placement and trade-to-class progression still need investigation.
- **Focused access result:** Second Wind moves from Strange position 10 to
  6; Molt stays 11 and the shared offer window stays 6. Matched 64 x four
  yields 46 player / 2 NPC appearances, three player-held runs and one actual
  fatal refusal. Wins 114 -> 115/256, player deaths 252 -> 254, 252 standard
  rows identical; zero warnings. Molt/Undying class remain absent. NPCs did
  not retain Second Wind; audit actual NPC alien-fight/integration deed
  callers next. Proof, phone choice and raw panels: `undying-access-audit.md`.
- **NPC party progression:** surviving tactical companions now earn actual
  shared fight/alien deeds; dead, absent and summoned actors do not. Source-
  isolated 64 x four: wins 115 -> 109/256, player deaths 254 -> 232, caregiver
  22 -> 26/64; other policies lose wins. Class coverage 15 -> 14 (Bulwark no
  longer sampled). Keep balance investigation open. That panel's alien actor
  probe exposed fixed 30 HP and missing gear fields, repaired below.
  Integration remains a separate unmodified NPC model. See `party-deeds-audit.md`.
- **Companion body repair:** real alien actors now use world HP/100 capacity
  and worn gear. Tactical companion wounds, retreat, death and actual rescue
  healing now persist to the same person. Eighteen runtime assertions, phone
  Strike/normal roster proof, quick 149/149 and full 921/921 pass. Matched
  64 x four: wins 109 -> 124/256, deaths 232 -> 229; wins increase in all four
  policies, but merchant/caregiver deaths each rise four. One Undying class
  and one player Unkillable recognition appear; the latter never enters a
  Table. Molt still has no offers; no NPC retains Second Wind in daily
  samples. Six missing classes, nine fitting god deeds and broader parity/
  scale work remain open. See `evidence/2026-10-15/alien-party-audit.md`.
- Claude's recommendation: add a job-path term to `buildPathLean` (villager-build.js) so villagers build toward their job's god, and move ONE entry per never-seen subclass into the first 6 of a track whose deeds fit it. Measure 64 seeds; target ≥14/20 without deaths rising >10%. (A full kit interleave was tried and reverted — it raised deaths.)
- Job balance watch: exterminator looked weak, locksmith and mortician strong at 16 seeds — confirm with 32 seeds `FORCE_OCC=<job>` (scripts/sweep-buff.js) before retuning.

### 8. Keep the sims honest
- After every content wave or balance change, run the standard sweep
  (`docs/SIMULATING.md`, 16 seeds; 64 for small effects).
- **Current baseline** (capable bot, 64 seeds × 150 days):
  - about 30 wins of 64
  - about 25 villages lost
  - median survival about 97 days
  - ascension in about 43% of runs past day 100
- **Never trust 8 seeds.**

## 3. Known issues (small, logged)
- World map overlay: the close button sits in an oversized empty bordered box (presentation pass B tokens). Showcase of the pass: https://claude.ai/artifact/9Vr2HxjbHyCTShDdDxkzYf (private to Steve).
- Name cultures without a `fem` list fall back to they/them for some names (german, vietnamese, moroccan, and others): add fem lists (data only). A broader code fallback was tried and dropped — it shifts seeded RNG.
- Lifeseed grammar: "X's grandchildren Yarina" (one name for a plural relation), first-person lines inside third-person bios ("He taught me to swim"), "still understand more than he can say" (agreement).
- Monster-naming vote: if the scholar dies, a vote they cast earlier as a villager counts double as the player's backing.
- Origins follow-ups (Muse content): São Paulo sits in pampas/patagonia (it's Atlantic forest — maybe a coastal-Brazil region later); Kathmandu/Ulaanbaatar need Nepali/Mongolian languages (the 25-language test pins the count); Florida panther and Burmese python need a Florida/Everglades landing variant; some cities borrow a neighbour's name culture (Dakar, Dar es Salaam, Quito, La Paz, Montevideo, Sydney, Melbourne).
- Sounds need a human listen (synth cues can't be judged headless). The pods and knack beats of the day-7 cinematic have no recorded lines yet.
- The handwriting font falls back to serif on Linux/headless Chromium (script faces on iOS/Windows/Android).
- Load-order hazard: some old tests load only the first 80 scripts of index.html — add new script tags after position 80.
- `scripts/validate-data.js` crashes (`spec.endsWith is not a function`).
- Balance-check the new job → background skills (soldier, police officer,
  firefighter, rancher, mortician, locksmith, bartender, hunting guide,
  exterminator get 1–2 extra skills): compare those jobs' runs in a 64-seed
  sweep; Steve: "sounds right if it's balanced well."
- The "where" topic takes the first fresh topic slot early in conversations
  (watch for crowding).
- Villagers don't track their own "where are we" knowledge yet; locals simply
  know.
- About 13 broadcast monster sprites contain words that are illegible at 36px.
- Load-flaky tests under the parallel full check (they pass alone):
  simopt-trajectory, deterministic-clock, scale-lead-fix, intraviol,
  enter-building-guard, examine-recognition, item-use, blocked-travel-feedback,
  drifter-joinstay (failed twice in full runs; seed-sensitive — worth pinning),
  drifter-grab, past-deflect-gate, social-shared-barks, corpses.

## 4. Where things are

| Need | Look in |
|---|---|
| Steve's decisions | `docs/godpath/STEVE-ANSWERS.md`, `docs/DECISIONS.md`, `docs/DIRECTIVES.md` |
| How features fit | `docs/COHERENCE-SPINE.md` |
| A system's contract | the `@ontology` header in its file; `docs/ONTOLOGY.md` (generated) |
| Proof notes and sweeps | `evidence/<date>/` |
| Sims | `docs/SIMULATING.md` |
| World | `docs/WORLD-REGIONS.md` |
| Table | `docs/TABLE.md` |
| Kin canon | `docs/KIN.md` (the Taken are off-world; scattered kin are on Earth; both exist) |

2026-10-15 Relay clock follow-up: actual daily upkeep/service is guarded per person/day, with legacy progress retained. See `../evidence/2026-10-15/relay-clock-audit.md`. Independent 64-seed panels remain mixed: investigate caregiver late community losses and increased capable wins; no automatic maximize-wins tuning. Fixed-window/competing-ending tooling is available in `scripts/balance-windows.js`. Eight other authored deeds and the broader roadmap remain open.

God-scale audit (2026-10-15): `docs/godpath/SCALE-AUDIT.md` records all forty promised contexts, current callers and unproved strategic/contest behavior. The field Market God guard now shares the existing beam weakness while retaining physical antler protection; evidence in `../evidence/2026-10-15/market-beam-audit.md`. Natural coverage and broader parity/scale completion remain open.

Confirmed follow-up from the Market guard cohort: fieldFights.js learn-first withdrawal ignores `opts.noFlee` even after narrating a closed gate. Seed 2 at 3 HP returns vFlee in the prepared drone cohort. Preserve these old raw outcomes, then repair and measure this sealed-contest contract separately; do not interpret arena escape as a death or a win. The real source caller and full records are in market-beam-audit.md / stress reports.

Sealed-contest follow-up implemented independently (2026-10-15): fieldFights.js learning withdrawals now respect noFlee, retaining wild withdrawal and fifteen-round judges. Public pit/gauntlet/siege health settlement and real phone NPC death -> saved eleven-person Haven are proved. The former Molt test depended on the illegal escape: it now retains both an actual finishing-kill survivor and a later true death. See `../evidence/2026-10-15/sealed-learning-audit.md`; no damage/prize tuning or broader scale completion claim.

Paid-goods progression (2026-10-15): real paid cart/hawker/river exchanges now credit a shared capped social deed, including resident sellers, with identity preserved through the time cost. 22 runtime assertions and public phone purchase -> social level-up are proved. At 64 x four, maker wins stay21, merchant23->25; neither Miser class appears. Do not call Miser/peaceful viability solved or move kit entries in the same lever experiment. Read `../evidence/2026-10-15/trade-progression-audit.md` before the next class-access change.

Haggle contract follow-up (2026-10-15): before moving Miser offers earlier, repair the existing buyer discount in cart and resident-hawker purchases. Public/spoken quotes, payment and receipts share the effective price; existing confrontation discounts now display honestly. Fully store-credit-funded paid purchases retain trade practice. Twenty actual-caller assertions cover payment, rollback, free wares, dialogue and river preservation. No kit reorder or cost-strength change; see ../evidence/2026-10-15/haggle-audit.md. Class access and broad playstyle viability remain open.

Miser access follow-up (2026-10-15): the measured Hoarder/Haggle Social5/6 candidate is not retained; original8/10 order restored. No Miser class forms in256 candidate campaigns. In merchant16,118 starter offer appearances become106 distinct actual decisions, zero picks. New optional deed-screen --choices1 records original shared-brain scores/decisions without adding game evaluations. Read ../evidence/2026-10-15/miser-access-audit.md before another access change: a deliberate knowledge-bound Miser strategy and economic-value audit remain open; generic mixed bots do not establish human viability.

Miser intent measurement (2026-10-15): merchant-hoarder / merchant-dealer are now real on-sheet strategy cohorts, preserving the merchant survival/actions and shared NPC brain. Three source-bound arms total960 campaign cases: original kit, two early starters, and Haggle-only. Both candidates can yield locked Miser ending frames under committed strategies, but neither is retained given unresolved class/survival/community tradeoffs and the newly demonstrated shared setup gap (introductory knack left unanswered). Maker wins can rise while first-bearer survival worsens. Keep ending frame, living bearer, reactor and ever-class separate. Full evidence/phone replay: ../evidence/2026-10-15/miser-intent-audit.md. Next audit the actual setup/knack choice before another human-viability claim; then targeted job/playstyle starter access and food-thesis/NPC payoff coverage. Original kit and all player-facing runtime remain unchanged by this unit.
