# ROADMAP: what's built, what's next, how to do it

*For Muse (and any agent). Updated 2026-10-14. The early-October roadmap
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

**In progress (Claude, landing soon):**
- **Presentation pass A (feedback, sound, haptics):**
  - grounded effects and sound before the System arrives
  - effects for the big moments: ascension, flashback, feast, god verbs, titans, the Table
  - day-7 voice lines
  - synthesized monster signatures
  - reduced motion
- **Presentation pass B (look and accessibility):**
  - colour tokens and the earthy palette
  - the presentation stage ladder
  - the System overlay, alien-script glitch and handwritten marginalia
  - titan sprites
  - bespoke Table and level-up screens
  - zoom, font size and contrast
- **World origins:** at least 2 picker origins for every region, world lifeseeds, name cultures, a 5-step familiarity scale, and eastern fauna trimmed to real eastern species.
- **Class diversity:** a job-to-path lean and a wider offer window, aiming for 14 or more of the 20 subclasses to appear.

## 2. Muse's backlog, in order

Each item: **spec**, **done when**, and the **tool** that measures it.

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
- **Now:** each god's party, titan, contest and army effects are design text
  in `godpaths.json`.
- **Spec:** wire them per god (PLAN.md "What's left" #4).

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
- `scripts/validate-data.js` crashes (`spec.endsWith is not a function`).
- Two quarantined tests catch real bugs: second-person "you" in generated bios
  (`test-backgrounds-20261006`); see `scripts/green-list-quarantine.txt`.
- The "where" topic takes the first fresh topic slot early in conversations
  (watch for crowding).
- Villagers don't track their own "where are we" knowledge yet; locals simply
  know.
- About 13 broadcast monster sprites contain words that are illegible at 36px.
- Load-flaky tests under the parallel full check (they pass alone):
  simopt-trajectory, deterministic-clock, scale-lead-fix, intraviol,
  enter-building-guard, examine-recognition, item-use, blocked-travel-feedback,
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
