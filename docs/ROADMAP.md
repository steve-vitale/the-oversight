# ROADMAP: what's built, what's next, how to do it

*For Muse (and any agent). Updated 2026-10-15. The early-October roadmap
is archived in `docs/_archive-ROADMAP-2026-10-03.md`.*

> "Get the important stuff built, leave the bulk of work once scaffolded to
> the muse agent to resume. But set it up for success in all future
> endeavors." — Steve

## 0. Every session

1. Read `docs/godpath/STEVE-ANSWERS.md` (Steve's verbatim calls; it outranks
   everything). **Never ask Steve something it already answers.**
2. Read `docs/COHERENCE-SPINE.md`: how the progression features fit together.
3. Pick the top unclaimed item in §2 and read its spec doc.
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
| **World regions engine.** 20 regions (1 playable), first run lands at your origin, real-date seasons, wet/dry calendars, kin placed across the world, the Taken off-world | `regions.json`, `climates.json`, `world.js` | `docs/WORLD-REGIONS.md` |
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
   access remains absent. Inspect seed 5's unshelved batch and broader supply
   access next. See `evidence/2026-10-15/maker-counter-audit.md` and
   `evidence/2026-10-15/preservation-access-audit.md`.
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

### 2. Table ending codas (64 left)
- **Spec:** `docs/TABLE.md`, "Endings by build". Write in this order:
  1. god codas (20)
  2. class codas (40)
  3. track codas (10)
- **Voice:** spare and second person, matching the 6 samples. A coda must read
  right after any of the seven paths' finals. `{path}` is lowercase "the …".
- **Tool:** `node scripts/validate-table-endings.js --todo`

### 3. God deeds (replace the placeholder)
- **Now:** "held the class for 10 days" counts as the god's deed
  (`godpaths.json` `rules.capstone.deedClassDays`).
- **Spec:** one fitting deed per god in `godpaths.json`, e.g. Apex Predator: a
  solo kill above your weight; Living Garden: feed the whole village from your
  own harvest for 7 days. Keep ascension at roughly 25–40% of long runs
  (measure it).
- **Tool:** `scripts/godpath/validate.js` and `ladder.js`, plus a 64-seed sweep.

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

### 7b. The 10 subclasses that never form
- brawler, shieldbearer, miser, seer, undying, phantom (and others) never appear in sims: their abilities sit 7–20 deep in the track kits.
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
