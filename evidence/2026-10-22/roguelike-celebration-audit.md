# Roguelike Celebration 2026 — Deep Audit: 7 Talks → The Oversight

**Date:** 2026-10-22 · **Mode:** READ-ONLY audit (nothing implemented, nothing committed)
**Ordered by:** Steve — "Audit deeply and implement anything that meaningfully improves our game. Address all follow ups and gaps."
**Method:** 7 parallel audit workers, one per talk. Each read `docs/CANON.md`, repo `AGENTS.md`, and `docs/godpath/STEVE-ANSWERS.md` (outranks everything) first, then audited its domain against the actual codebase with file:line evidence. Worker reports: `~/workspace/audit-scratch/audit-talk{N}-*.md`.

**Talks:**
1. Kingsford, MCTS — https://www.youtube.com/watch?v=d2NR-od_zeM&t=27820s
2. Savant, Modular Motivations — https://www.youtube.com/watch?v=d2NR-od_zeM&t=29706s
3. Pagnutti, binomial luck in Fire Emblem — https://www.youtube.com/watch?v=d2NR-od_zeM&t=23449s
4. Gillian Smith, procgen as pedagogy — https://www.youtube.com/watch?v=R8DSq8qSJ44&t=3525s
5. Bucklew & Frang, localizing Caves of Qud — https://www.youtube.com/watch?v=R8DSq8qSJ44&t=5330s
6. Keenan, run variety intra/inter — https://www.youtube.com/watch?v=d2NR-od_zeM&t=30681s
7. Vermilion, Nuzlocke long-form runs — https://www.youtube.com/watch?v=d2NR-od_zeM&t=31540s

**Classification key used throughout:** ✅ ALREADY DONE · 🔶 GAP (proposed) · ⛔ CONFLICTS WITH CANON (do not build without Steve)

---

## Talk 1 — Kingsford, MCTS (winnability testing)

**Core technique:** MCTS optimizes whatever reward you give it, so the design work is shaping the reward: per-archetype reward functions with iteration budgets, winnability self-play from day one, ~10k terminal-state heatmaps showing where runs actually end, and reward-shaping *against* degenerate-optimal strategies. Key question: "are you making an optimized game or a fun game?"

### ✅ Already done
- Deterministic seeded sim harness with versioned terminal-state records (`scripts/sim-harness.js:293 runDays`, `:630-687` stop record, `endReason` won/villageLost/survived).
- Multi-policy bot personas instead of an optimizer: competent, winseek, capable, primeseek/cautseek, maker/merchant/caregiver, oracle-v3 (labeled measurement probe), idle.zero/mvc/leader basement bounds (`scripts/policies/`).
- Explicit micro-reward scorers (`contestReward` capable.js:619, `scoreTableOption` :669 with trial-by-combat hard-coded −100, relic scoring :601-612).
- 23-metric balance contract where `won` is direction-*neutral* — win movement prompts investigation, never an auto-verdict (`scripts/balance-metrics.json:8`, `scripts/lib/balance-scorecard.js:59-77`). This is already the anti-degenerate-judging rule.
- MEASUREMENT.md §13 playstyle BALANCE VERDICT (DEGENERATE if one path ≥60% of wins).

### 🔶 Gaps → proposals
- **G1. No optimizer exists, so reward-shaping has no adversary.** Policies are fixed heuristics; nothing *searches*. → **P1-2 "shark" adversary policy** (high value/medium effort): a `scripts/policies/shark.js` that maximizes the win metric with zero regard for fun; its wins are read *inverted* (shark ≥ competent = metric/lever is degenerate). Labeled like oracle-v3: "MEASUREMENT PROBE, not shipped AI."
- **G2. No terminal-state heatmaps.** Death analysis is tabular only; zero "heatmap" hits in scripts/. → **P1-1 heatmap aggregator** (HIGHEST value/LOWEST effort): reads existing sweep/balance rows + `samples.deaths`, emits terminal-state × day-bucket matrix faceted by policy as HTML + JSON. Zero engine changes.
- **G3. No declared per-archetype reward functions.** Scorers are scattered ad hoc. → **P1-3 reward spec doc + scorer extraction** (medium value/low effort): one `scripts/policies/rewards.js` with per-policy "optimizes X / degenerate optimum Y / bounded by Z" headers + sanity assertions.
- **G4. Degenerate play never systematically hunted** (freeloader-exile found by accident). → **P1-4 standing winnability self-play beat** (medium/medium): recurring fixed-seed campaign with heatmaps vs pinned baseline bars.

### ⛔ Canon check
All four are sim-side only — **no conflicts**. Two constraints: the shark's wins must NEVER tune the game harder or declare regressions (Steve 2026-10-15: win-rate reduction is investigation, not regression); a standing beat must use the pinned 23-metric contract, never add metrics (contract changes are Steve's call).

---

## Talk 2 — Savant, Modular Motivations (villager AI)

**Core technique:** NPC reactivity = states + triggers, not full AI. Fixed start and end, flexible middle state graph. Motivations assigned at generation, personality derived from data, and *every* game system is a trigger source.

### ✅ Already done
- Objective state machine (`villager-objectives.js:262 objPick`): states idle/ready/out/returning/indoor/done, kinds FORAGE/WATER/TRAPS/VISIT/HAVEN_CHORE/EXPLORE/REST/EAT/LEAVE/GUARD/SEEK/HAUL; transitions centralized in `objMaybeDepart` (:815) with GO/ASK/TIGHTEN/DEFER from `objDanger` (:604). Parallel expedition machine (`villager-agency.js:185 agencyTick`) = fixed-start/flexible-middle/fixed-end.
- 18 motivations + 16 temperaments assigned at generation from `src/data/characterGen.json` weighted pools (`game.js:1136-1141`); hidden potential seeds (`villager-agency.js:1378`).
- Personality from data: intelligence from occupation + temperament/curiosity table (`game.js:1169-1171`); range profile from temperament+goal+age+occupation (`villager-agency.js:151`).
- `npcNeeds` substrate (`game.js:16025`): hunger/fear/social/energy charged honestly per part.
- Many systems already trigger: monster gossip→`objDanger`, rain→danger, deaths→gossip+grief, sickness/heal gates, pantry/cistern→objective weights, deeds→Codex+board+broadcast, knowledge→SEEK, table state stands down expeditions.

### 🔶 Gaps → proposals
- **G1. Triggers are hardcoded transition functions, not a declarative registry.** → **P2-1 trigger registry** (HIGHEST value/LOWEST effort): route trigger sites through `npcTrigger(vid, event)` dispatch keyed by event name. Day-one pure refactor, zero behavior change.
- **G2. Triggers are polled, not event-driven** — no mid-trip interrupts. → **P2-3 mid-trip re-targeting**: on high-severity gossip, re-run `objDanger` for in-flight objectives; `out`→`returning` (path exists).
- **G3. Only 7 of 18 generated motivations drive behavior** (feed/escape/lead/explore/prove/heal/protect); 11 are conversation flavor only. → **P2-2 wire dormant motivations into `objPick` weights** (family→VISIT kin, belong→social, record/understand→SEEK, survive→caution, alone→deprioritize companions, peace→avoid EXPLORE/HAUL).
- **G4. Weather trigger is one bit** (rain only); cold/season tables never feed decisions. **G5. Contest outcomes don't feed back** into objectives. **G6. No inter-village triggers. G7. No reactive mood layer** (village after 2 deaths behaves like after 0). → **P2-4 cold/heat weather + contest-outcome triggers** (lowest priority; balance-sensitive, needs §14 sims).

### ⛔ Canon check
**No conflicts** for P2-1…P2-4. P2-2 stays inside the unique-person law (reads generated `npcGoal`, no fixed-cast scripting). Caution: P2-4 winner-boldness must be a small visible weight, not an RNG mood roll (CONTESTS.md: "contests must be FEARED"); the trigger registry must keep `tableActive()` as a hard gate.

---

## Talk 3 — Pagnutti, binomial luck (luck systems)

**Core technique:** Quantify each run's luck as a binomial process (n attempts at p) to distinguish "unlucky run" from "broken design." Design pity around the *cumulative* curve across a run, not single-roll odds. Make luck legible: conditional-formatted luck distributions in balance sheets; show the player the odds so bad streaks read as luck, not lying.

### ✅ Already done
- Hunt formula is honest single-roll, hard-capped (`src/js/encounters.js:2290 G.huntAnimal`, `:2364`): base by difficulty + additive bonuses × penalties, `min(0.95, …)`. **No failure counter, no escalation, no bad-luck protection** (zero hits for missStreak/failCount across src/js).
- Near-miss band (`encounters.js:2598`, +15pp above chance) is narration-only feel-softening; misses still grant practice XP.
- Trap shyness is Steve-approved ANTI-pity: `0.65^level` declining returns (`game.js:3706-3721`, "prefer declining returns and opportunity costs over hard caps").
- Forage is deliberately NOT a luck system: "The world is not a slot machine" (`game.js:25374-25376`) — deterministic sweep.
- Cooking is knowledge-gated odds (`food.js:3246-3257`): learn → better curve, never pity.
- Streak mechanics reward win-streaks only (CORNUCOPIA, BLOOD FRENZY guaranteed 3rd-hit crit); keepsake Lucky Break is gear-scoped pity.
- Odds shown to the player in exactly **one** place: crafting buttons (`app.js:15199-15204`).
- Sims measure aggregates only; the sole binomial use in the repo is an A/B drift sign test, not per-run luck.

### 🔶 Gaps → proposals
- **G1/G4. No per-run luck quantification, no luck view in panels.** → **P3-1 sim luck instrumentation** (HIGHEST value/LOWEST effort, zero gameplay risk): collector records (attempts, successes) per run for hunts/traps/nets/cooking; analyzer computes binomial tail probabilities and renders a conditional-formatted luck-distribution column; pre-register as §14 guardrail metric family.
- **G2. No pity in any base system.** → **P3-2 hunt miss-streak pity, System-voiced** (small gameplay): after k consecutive clean misses (tuned from sims, deep in the tail), the near-miss band becomes a *graze* (wounded animal, board change not number bump — "control must change the board, not the numbers"); knowledge-gated System voice line.
- **G5. Odds never shown for the most-repeated rolls.** → **P3-3 knowledge-gated cumulative-odds line** in Codex/Journal (medium effort): after ≥10 recorded strikes, a System-voiced line frames cumulative odds diegetically ("Ten throws at your usual odds — … This run stinks, statistically"), never raw math ("feel over math").
- → **P3-4 trap "rested ground" honesty** (low-medium value, high review cost): information (scouting), NOT odds escalation — never fight Steve-blessed shyness.

### ⛔ Canon check / boundaries
- **Do NOT build:** forage pity (canon: not a slot machine), combat/monster-outcome pity ("fought, not rolled"), run-to-run variance compression (heavy RNG between playthroughs intended), trap catch-pity counteracting shyness (Steve-approved).
- P3-2 must truncate *within-run* bad streaks only (trigger deep in the tail, P(k misses) < ~5%); must not make early hunts reliable ("slow and risky to start"). Any odds display must be knowledge-gated ("if you don't know, it doesn't show").

---

## Talk 4 — Smith, procgen as pedagogy (knowledge system)

**Core technique:** Procedural generation IS pedagogy — the generator teaches through what it makes. Fractal loops: daily mirrors seasonal mirrors run-arc, same lesson rehearsed at every scale. Failure as data: end-of-run "what we learned" screen. Avoid "10,000 bowls of oatmeal" — generated content must be strategically meaningful. The knowledge system is the pedagogy vehicle.

### ✅ Already done (more than expected)
- Knowledge depth ladders are real pedagogy: plant L1→L4 (identify/prep/use/mastery), `prepKnown` separate track, experiment-before-identification law (`testCautiously`/`testMonsterMeat`, `villagerExperimentBeat` once/day, verdicts in `sharedKnowledge`); wrong-knowledge (`wrongAs`, lies, disputed claims); Codex never lists K0.
- ONE teaching mechanic for all three directions (`src/js/skill-teaching.js`: villager↔villager, villager↔player, player↔villager; trust 15+, shared language, one lesson/learner/day); villager daily lesson-seeking vs target builds; player learns by fireside presence (`game.js:17750` — "knowledge moves human-to-human, BEFORE the System"); word-of-mouth slow by canon.
- Codex is honest and partly pedagogical: knowledge-gated display, per-entry "🔍 still to learn" (`knowledgeGaps`, `app.js:19436`), UNIDENTIFIED section, living-person depth ladder. Journal era → Codex era is itself fractal pedagogy ("The System doesn't create the Codex later; it FORMALIZES what the group already knows").
- Three time scales exist mechanically (4 day parts/512 ticks; regional season calendars; run arc pre-System → contests → waves → Table, 180d max).
- Generated villagers ARE strategically different (occupation→skills, goals incl. guaranteed leadership contenders, languages, lifeseeds, curiosity-driven knowledge flow) — not oatmeal.
- Failure resolves the story narratively (mantle passing, ending screen with bearers lineage, extinction vs scattering text) — but as *story*, not curriculum.

### 🔶 Gaps → proposals
- **G1. No end-of-run "what we learned" screen.** The ending is a record (Days·Bearers·Plants) + lineage, no pedagogical debrief (what killed the village, which missing knowledge mattered). → **P4-1 "What the village learned" card** (HIGHEST VALUE, LOW EFFORT, ~50 lines): extend `ending()` (`app.js:19524`) on village-lost with 3–5 computed lines from already-recorded data (death causes, missing knowledge that mattered, who taught what). In-run only.
- **G2. Day/season/run-arc don't mirror (no fractal).** `endDay` has no reflection beat; season is weather layer, not a loop; run arc teaches nothing about itself. → **P4-2 season-turn beat** (medium value/low effort): on `regionCalendar` flip, one fireside beat mirroring the daily loop at seasonal scale + 2 most-relevant knowledge gaps. → **P4-4 nightfall debrief micro-beat** (medium value/low effort): one narrated line at sleep summarizing what the village learned today (already journaled — "no silent actions" compliant).
- **G3. Codex is a reference dump with pedagogy veneer** — no "what should I learn next." → **P4-3 Codex "Seek knowledge" agenda** (high value/medium effort): player-side counterpart to villager seek behavior; 2–3 concrete gaps derived from run state (repeated water sickness → `purify_boil`; hunger + raw meat → cooking track) each with HOW to close it. Suggests, never grants (parity-safe).
- **G4. Bearer <redacted> narrated, not taught** — the most pedagogically potent moment (death that isn't game over) teaches nothing explicitly.

### ⛔ Canon check
P4-1…P4-4 are compatible **iff the debrief is in-run only** — `ledger.js:587-595`: "NO cross-run inheritance. The Codex spans one contest." A debrief persisting lessons into the next village would violate canon. P4-3 must point only at *human skills*, never System ability slots (human≠alien). P4-1 must fit the ending screen without breaking the one-screen mobile constraint.

---

## Talk 5 — Bucklew & Frang, text generation (Qud localization)

**Core technique:** Never concatenate generated text with `+`. Use templates with slots run through replacer functions and post-processor pipes (`{sword|pluralize}`) so grammar is computed from context at render time. Build one modular text system from day one. Authoring-time context comments on every string.

### ✅ Already done (fragments)
- `Game.pluralize(n, singular, plural)` (`game.js:44263`) with irregulars and consonant+y→ies; 53 call sites.
- `Game.fillTalkLine` slot substitution (`game.js:17071`): `{an_occ}`/`{Occ}`/`{occ}`/`{first}`/`{origin}`/`{skill}` (+ lie-cover wrapper `truth.js:1770`).
- `fillPronouns` with verb conjugation via `conj` map (`game.js:1044`); they/them fallback for unfamiliar names ("Strangers' pronouns aren't assumed").
- `t2fill` pronoun slots + `toFirst` de-conjugation pipe (`convoTopics.js:58`); `convoFillPeople` count-words (`conversation.js:1784`); `_cxPluralBeats` verb-agreement pipe for contests (`contests.js:5824`, 23 pairs); `voiceLine` post-processor (`conversation.js:662`); `confrontSecondPerson` 3rd→2nd rewrite (`truth.js:1089`); `sayLine` emission choke point (`conversation.js:864`).
- Name handling: no duplicate first names, `displayName`/`firstRef`/`personFirst` forms, reflexive self-reference.

### 🔶 Gaps → proposals (3 LIVE grammar bugs found by probe)
- **G1/G2. Concatenation everywhere** (~3442 `say()` call sites); 85 hand-rolled ternary plurals in game.js alone despite the "never hand-roll" comment. **G3. Four fill systems, one overlapping slot vocabulary, no shared module** (`fillTalkLine` leaves `{hope}`/`{They}` unresolved — braces render verbatim, probe-confirmed). **G4. `conj` map is a fixed allowlist** — 3 LIVE breaks: "She bed down", "she sleep better", "if she listen long enough" (characterGen.json:26, :2796). **G5. Article helper copy-pasted ~10×** (naive vowel test). **G6. Lowercasing bug — LIVE: "an eSL teacher"** (`game.js:17072`, wakeUpSpeeches path). **G7. Pronoun ternary chains at every call site** (one already caught wrong before). **G8. Plural-subject verb agreement hand-rolled** (breaks at 0 sources). **G9. No authoring context comments** — probe-confirmed live break: "He children going quiet" (fear slot assumed verb phrase). **G10. Slot leaks render raw, no guard. G11. No i18n scaffolding.**
- → **P5-1 shared `text` module** (HIGHEST VALUE/LOWEST EFFORT): `article()` (exception table + full lowercase — fixes G6 live bug), `proBundle()` (fixes G7 class), slot registry + leak guard (fixes G3/G10); point existing fills at it, keep signatures. One file + mechanical swaps.
- → **P5-2 real verb-conjugation pipe** (medium value/low effort): morphology rules + irregular table replacing the `conj` allowlist; wire into `fillPronouns` AND `t2fill`. Fixes the 3 live breaks + all future present-tense verbs. ~30 lines.
- → **P5-3 authoring contract** (medium/medium): per-pool `_comment` with speaker/frame/slot-shape notes — the talk's context-comments recommendation, applied now.
- → P5-4 key-based string store: **defer** (huge refactor, no localization on roadmap; P1–P3 are its prerequisites).

### ⛔ Canon check
**None.** The module must stay mechanical (grammar only) and not homogenize villager voice — voice variation lives in `voiceLine`/DNA pools (unique-person law).

---

## Talk 6 — Keenan, run variety (founding commitments, meta, seeds)

**Core technique:** Variety is a slider you tune deliberately. Founding commitment: an early run-defining choice (hunters vs farmers vs traders) that walls off content per run. Meta-progression is "kind of a cheat, in a good way" but grindy — esoteric achievements are the lighter alternative. Challenge seeds for veterans.

### ✅ Already done
- Cross-run achievement Records: 46 achievements, 9 categories, power-free by law (`src/js/metaProgression.js:28` — "A fresh game is provably unaffected"; Steve 2026-10-10). Esoteric `???`-with-hint design already matches the talk's lighter alternative. In-run Records ledger (`src/js/records.js`) — empty on newGame, nothing carries over.
- Character generation differentiates runs: origin picker → 4 candidates from your origin + 2 random; per-run dedup registries; occupation→skills; guaranteed leadership contenders; 6 mains + 6 from 36 background survivors.
- Random-environment starts (Steve 2026-10-14: "thrown into a random environment… all continents"); season-of-start = actual season.
- 10 god paths × 2 subclasses (emergent build variety, lean not lock); 7 table paths × light/dark = 14 endings.
- Opening Gamble (pick 5 of 8 items); first ability 1-of-3.
- Seeded RNG exists internally (mulberry32) but is **not player-facing** — no seed UI, no shareable strings.

### 🔶 Gaps → proposals
- **G1. NO founding commitment.** Nothing at run start walls off content. Origin affects flavor, not locks; region random, not chosen. Variety is emergent RNG + drift, not a tuned slider. → **V6-1 Founding Oath** (HIGHEST value, moderate effort): one onboarding screen after villager pick — Hunter's Oath (no gardens; hunt loot boosted), Sower's Oath (no non-monster kills; garden/gather boosted), Trader's Oath (no crafted gear; barter/audience boosted), Nameless Oath (today's RNG run). Content gating + bonus weights via data flags; every Oath needs a winnability proof via the sim panel before shipping (Table contract: table prices, never gates).
- **G2. NO challenge seeds for veterans.** → **V6-2 shareable run seeds** (LOWEST effort, good value): surface the world-seed as a run string + optional entry; worldgen only (region/biome/roster), combat/conversation RNG stays fresh so seeds never become solved walkthroughs. Enables weekly "cursed seed" community challenges.
- **G3. Meta is achievements-only by canon** — nothing missing relative to Steve's words. → **V6-3 esoteric achievement expansion** (low effort/medium value): story-shaped feats ("win a table scenario without a single kill", "resolve three feuds without a bout", "30 days eating only what you personally forage") — *how* you played, not just *what you saw*.
- → V6-4 First-Run / Run-2+ differentiation (medium effort, uncertain value — **needs Steve's eyes**): run 1 = pure RNG; run 2+ unlocks Oath picker + seed entry. Interface unlocks only, not power — but changes onboarding visibility.

### ⛔ Canon check
V6-1…V6-4 are canon-safe as specified (no cross-run power/knowledge/items; every game still a new village). **FLAGGED — do NOT build without Steve's word:** power-granting NG+ ("+5% carry per past win", inherited gear/pantry, cross-run Codex pages) — violates metaProgression.js:28's read-only-power rule (Steve 2026-10-10) and the no-cross-run-inheritance canon. Watch-list: an Oath must never hard-lock the win (Table contract).

---

## Talk 7 — Vermilion, Nuzlocke (attachment systems)

**Core technique:** Permadeath + naming = attachment. Memorials and absence markers (the empty hut) keep the dead present. Sacrifice systems generate the retold stories. Long-form = multi-run village-lineage arc. Analyze house rules mechanically AND dynamically.

### ✅ Already done (further along than expected)
- Named mourning in conversation: `v.grief` topics name *every* fresh corpse, knowledge-gated `firstRef` (`convoTopics.js:454-531`); dead bearers get 10-day mantle-memory tail; NPC `mourning` memory events name the dead (`convo-wants.js:2007-2010`).
- `v.fallen` — the explicitly-commented "memorial roll" (`ledger.js:713-718`; six write sites) — **but stores no name** (`{villagerId, day, cause}`) and **no UI surface reads it** (zero non-`fallen_tree` reads in app.js).
- Mantle lineage at the ending: "The bearers" card, `🕯️ Name — N days (cause)` (`app.js:19522-19543`); `ledger.js:592-615`.
- Corpses persist/decay/are buriable with named grave goods (`corpses.js`); `payRespects` solo rite (−3 trauma); `buryCorpse` names what the earth keeps; bearer liturgy (wisp + 🔔 bell, `drama.js:1460-1468`; village recovers body overnight); sentimentals buried, never lootable.
- Journal epitaphs in the dying voice; dead lives as Codex marginalia ("the dead teach the living").
- Real sacrifice mechanics (narrow): phoenix volunteer (`game.js:43672-43685`), player self-gift into the link with recorded life-debt (`game.js:44156-44176`), contest "take it with dignity" (`contests.js:3980`), sigW5 Finale feeding.
- Player CAN name: the expedition/run (`app.js:1009-1024`) and monsters (village argues, `namebeast` topic) — **but not villagers**.
- The Taken: absence-as-horror by canon (KIN.md — never confirm dead or alive).

### 🔶 Gaps → proposals
- **G1. The player never names a villager** — the talk's core engine is entirely absent (monster-naming proves the verb exists). → **N7-2 naming rite** (high value/low-medium effort): name newborns; bestow a use-name at high trust (`calledName`, preferred by `displayName`). Bestowed name *adds* identity, never replaces the generated true name (unique-person law).
- **G2. The memorial roll has no memorial** — data without a place. → **N7-1 "The Fallen" surface** (HIGHEST value/LOWEST effort ⭐): render `v.fallen` as a Haven/Codex card (name/day/cause, knowledge-gated); store `name`/firstRef in future pushes (currently unnameable); optional player-written remembrance line.
- **G3. Buried means gone** — "the village will know where" but no marker exists. → **N7-3 persistent grave markers** (medium-high value/medium effort): grave entity at the Haven fire on burial (name/cause/day, examinable, `payRespects` available) — the talk's "empty hut" analogue, a *place* where someone was.
- **G5. No funeral gathering** — rite is solitary ("Not a ceremony"); never scales with relationship. **G6. No general combat sacrifice** — no "throw yourself in front of them" verb in real blow-by-blow fights. → **N7-4 interpose** (high value/HIGH effort — do last): spend your turn to take an ally's hit, real combat resolution, symmetric for high-devotion villagers. Must not become dominant (kill discipline).
- G4 (no empty-hut marker), G7 (no multi-run saga — canon-blocked), G8 (Taken unmournable by canon — a "we don't know" rite could exist but must never confirm death).

### ⛔ Canon check
- **Do NOT build:** cross-run saga/inheritance (`ledger.js:587-590` + metaProgression law forbid it); any memorial listing the Taken among the fallen (KIN.md hard constraint).
- N7-4 must resolve through the real combat engine ("fought, not rolled"), never an outcome table. Memorials/graves must knowledge-gate names ("if you don't know, it doesn't show"). No silent actions — grave-examine text must narrate.

---

# MASTER PRIORITIZED IMPLEMENTATION LIST

## P0 — this week (top 8, each one-line rationale)

1. **Terminal-state heatmap aggregator** (T1) — Turns 16–64-seed campaigns from tables into "runs end HERE" at a glance; the wave-5 wall is exactly what a heatmap surfaces. Zero engine changes; reads rows we already record.
2. **Shared `text` module** (T5) — Fixes a LIVE grammar bug ("an eSL teacher") plus the whole pronoun/article/slot-leak class in one file; mechanical call-site swaps, no voice homogenization.
3. **"The Fallen" memorial surface** (T7) — Our best-kept data secret (`v.fallen`, six write sites, zero UI reads) becomes the talk's memorial. One UI card + name-field fix; every ordinary death becomes permanent fiction.
4. **End-of-run "What the village learned" debrief** (T4) — The talk's signature technique in ~50 lines on the existing death screen; failure becomes curriculum. In-run only (canon-safe).
5. **Declarative trigger registry** (T2) — Pure refactor, zero behavior change; converts every future villager-AI trigger from a transition-function edit into a registry row. Unlocks P1 items.
6. **Sim luck instrumentation** (T3) — Binomial luck columns on the balanced panel; distinguishes "unlucky run" from "broken design" before any gameplay pity is tuned. Zero player-facing risk.
7. **Verb-conjugation pipe** (T5) — Fixes 3 live grammar breaks ("She bed down…") and every future present-tense verb in data; ~30 lines + data audit.
8. **Player naming rite** (T7) — The genre's cheapest attachment multiplier: name babies, bestow use-names at high trust. The monster-naming verb already exists; extend it to people.

## P1 — next (12 items)

- Degenerate-adversary "shark" policy probe (T1) — standing metric-health adversary; needs the oracle-v3 labeling discipline.
- Wire 11 dormant motivations into `objPick` (T2) — 11 generated goals currently conversation-flavor only become behavior.
- Codex "Seek knowledge" agenda (T4) — player-side counterpart to villager seek; suggests, never grants (parity-safe).
- **Founding Oath** (T6) — the talk's centerpiece; needs Steve's decision on oath set + "Nameless" option, then winnability proofs per oath.
- Shareable run seeds (T6) — lowest-effort veteran feature; worldgen only.
- Hunt miss-streak pity, System-voiced (T3) — needs P0-6 sim data to calibrate the trigger deep in the tail first.
- Season-turn beat (T4) — fractal entry point; mirrors daily loop at seasonal scale.
- Nightfall debrief micro-beat (T4) — one narrated line at sleep; daily fractal reflection.
- Persistent grave markers at the Haven fire (T7) — absence becomes visitable.
- Per-archetype reward spec doc (T1) — makes scorer edits reviewable against declared intent.
- Mid-trip re-targeting on gossip (T2) — flexible middle for the state graph.
- Esoteric achievement expansion (T6) — story-shaped feats; pure content authoring.

## P2 — backlog

- Standing winnability self-play beat (T1) — time-series dimension on top of the panel.
- Cold/heat weather + contest-outcome triggers (T2) — balance-sensitive; needs §14 sims.
- Knowledge-gated cumulative-odds line (T3) — diegetic odds display; tone risk ("feel over math").
- Trap "rested ground" honesty (T3) — information only; high design-review cost vs value.
- Authoring contract: per-pool `_comment` + slot-shape notes (T5) — do alongside any data-authoring pass.
- First-Run / Run-2+ differentiation (T6) — needs Steve's eyes on onboarding friction.
- Interpose in combat (T7) — the retold-story engine generalized; high effort, balance risk, do last.
- Key-based string store (T5) — defer until localization is on the roadmap.

## ⛔ DO-NOT-BUILD registry (canon conflicts — need Steve's explicit word)

- Power-granting NG+ / cross-run inheritance of any kind (power, knowledge, items, Codex pages) — violates metaProgression.js:28 read-only-power rule (Steve 2026-10-10) and no-cross-run-inheritance canon.
- Cross-run saga/"villages past" memorial — same boundary; even names-only risks leaking content across fresh starts.
- Forage pity — forage is canonically not a slot machine.
- Combat/monster-outcome pity — "fought, not rolled."
- Run-to-run variance compression — heavy RNG between playthroughs is intended.
- Trap catch-pity counteracting shyness — Steve-approved declining returns.
- Memorializing the Taken as dead — KIN.md hard constraint (never confirm dead or alive).
- Debrief/agenda granting knowledge the player hasn't earned — parity rule; human-skills≠alien-abilities boundary.

## ✅ ALREADY-DONE registry (condensed — do not re-propose)

Sims: seeded deterministic harness, multi-policy personas, 23-metric direction-neutral contract, MEASUREMENT.md §13–15. Villager AI: objective + expedition state machines, 18 motivations/16 temperaments at generation, npcNeeds, many trigger sources. Luck: honest hunt formula, near-miss narration, trap shyness, knowledge-gated cooking odds, crafting % display. Knowledge: depth ladders, one-mechanic teaching, fireside teaching, Codex gating + gaps, journal→Codex era. Text: pluralize, fillTalkLine, fillPronouns, voiceLine pipe, sayLine choke point, name forms. Variety: 46 power-free achievements + Records, origin/region RNG starts, 10 god paths, 14 endings, Opening Gamble. Attachment: named mourning, v.fallen roll, bearer lineage card, corpses/burial/payRespects, journal epitaphs, phoenix sacrifice mechanics, monster/run naming.
