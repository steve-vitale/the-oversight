# Long-run sim — LEVER 3 sub-run r4: villager teach/learn behavior (2026-10-11)

Worker: sim-agency-r4. Sub-lever: VILLAGER TEACH/LEARN BEHAVIOR — knowledge sharing, mentorship, teaching moments.

## The village, in plain words

Fifteen 200-day runs on identical seeds, competent-player policy, before and after. These seeds are brutal: every run ended village-lost, median day 42–57, best run day 140. This is a dying village being studied, not a thriving one — which makes the teaching data more interesting, not less: knowledge kept moving even as the village collapsed. Across the before runs, villagers landed ~4.5 knowledge lessons per day; the player's codex reached ~40 plant identifications on average; villagers ended knowing ~13 plants each on average (range 0–42 — the range is the story: some villagers became the village's botanists, others died knowing nothing).

Who thrived: villagers with tracking/survival xp from expeditions and the teach chore became repeat teachers (54 distinct teachers across 15 before-runs). Who died: everyone, eventually — starvation and combat dominate these seeds; teaching didn't save the village, but the taught[] store fed `villageEats`' knowledge factor the whole way down.

What knowledge was missing: monster counters spread only through the player's codex (`agencyTeachMonster` fired 0 times in 15 competent-policy runs — nobody asks, so nobody teaches); villager→villager lessons were 100% plants. Villagers hold NO human skills in any store — `learnSkill`/`grantKnowledge` write the player's codex only. "Skill spread across villagers" is a null set: the only teachable villager knowledge is plant identity (binary).

## Q1: do villagers actually teach each other? (before numbers, 15 seeds)

villagerLearnsPlant new-lesson share by source (3077 lessons, before):
- fireside 41.8% / word of mouth 33.4% — the ambient machines dominate
- shared 5.6% / **taught (teach chore → agencyTeachVillager) 5.4%** / working 3.5% / observed 3.3% / fieldwork 2.6% / tested 1.9% / sample 1.4% / foraging 0.8% / mentored 0.3%
- 782 duplicate writes (already-known, no-ops) — the primitive is called speculatively and often

Player-side identifyPlant by source: shared 61.5%, sample 15%, tested 11%, fireside 7.5%, taught 3%, prize 2%.

Channel comparison: villager→villager plant lessons 142 landed (teach chore, 85% land rate) vs player→villager via conversation teach beat 0 in competent sims (the policy never talks its way to a teach; the beat works — proven in the transcript test — but no policy exercises it) vs player←villager agencyTeachPlant/Monster 0 (needs the ask path; the r2 sweep's askRound exercised it, pure competent does not).

Codex breadth in a run is driven by: village sharedKnowledge (61.5% of player identifications) + fireside + samples — real teaching events, not silent grants. The 'shared' channel is the village experiment beat + word-of-mouth pipeline doing its job.

## The dial (exact numbers)

One dial, in `src/js/villager-agency.js` `agencyTeachVillager` only (game.js / villager-objectives.js / scripts/policies/competent.js untouched — sibling run):

1. **Need-driven topic weighting**: the teacher reads the learner's state first.
   - learner WOUNDED (`homeWounds[vid] > today`): medicinal plants ×4 weight
   - else learner HUNGRY (`npcNeeds.hunger >= 60`) or NOVICE forager (tracking xp < 8): food plants ×3 weight
   - else: uniform random (as before)
   - the need is recorded on the lesson record (`need: 'wound'|'hunger'|'novice'|null`)
2. **Teacher quality → lesson success** (the failure mode):
   - teacher breadth <5 plants known: 60% success; 5–11: 85%; ≥12: 95%
   - breadth ≥12 also grants the learner +2 tracking xp instead of +1
   - a failed lesson returns `{taught:false}` — the chore's honest "going over their finds" line covers it; no knowledge is written
3. **Deed text varies by the need read** (the village's book records WHY):
   - wound: "…taught… — for the wound, which leaves to press on it."
   - hunger: "…taught… — where it grows, what's safe to eat."
   - novice: "…showed… — leaf, stem, smell, the beginner's tour."
   - general: unchanged "…taught…."

Weighted pick helper `pickW` added next to `pick` (falls back to uniform on all-zero weights).

## Before/after on identical seeds (15 seeds × 200 days, competent)

| metric | before | after | note |
|---|---|---|---|
| agencyTeachVillager landed/calls | 142/167 (85%) | 153/203 (76%) | land rate drops by design (quality gate); more calls = RNG trajectory divergence |
| knowledge events/day | 4.504 | 4.799 | flat (ambient channels dominate, untouched) |
| codex breadth (player) | 39.9 | 39.2 | flat |
| mean skills learned (player) | 6.4 | 6.8 | flat |
| won / tableWaiting | 0 / 0 | 0 / 0 | these seeds kill every village; dial doesn't move the needle |
| maxArc dist | mostly 3 | 14×arc3, 1×arc2 | flat |
| maxWave dist | mostly 2 | 3×w1, 9×w2, 3×w3 | flat |
| taught breadth/villager | 13.3 | 19.7 | noisy across runs (0–42); not attributable to the dial — driven by a few long runs |

Live-sim need distribution (3×100-day runs, after): 40 landed lessons = 34 novice + 4 hunger + 2 general + 0 wound; 5 failed on the quality roll. The novice branch dominates because most villagers genuinely are novice foragers (tracking xp < 8) — first lessons are food lessons, which is sensible pedagogy. The wound branch never fired in sims: `homeWounds` is written only by the raid-defense path (villageAgency.js), so it's nearly dead in practice — correct when it fires, rare by design of the wound system, not the dial.

**Honest verdict**: the dial is behaviorally real (proof test green, live-sim needs fire) but its sim-level effect is small — 'taught' is 5.4% of all lessons; fireside + word of mouth (75% combined, in game.js, untouched) dominate. The blank I actually filled: lessons are no longer random-topic/random-quality — a wounded villager gets shown wound herbs, a hungry novice gets shown food, and a villager who barely knows the wild sometimes fails to teach. The dial did NOT move win/arc/wave — reported as measured, not as hoped.

## Reachability verdict

Villager teaching feeds the village metabolism, not the player's unlock chain: `v.taught[]` is what `villageEats` reads for the knowledge factor, so villager→villager lessons convert directly into better-fed villagers — but they do NOT unlock knowledge-gated player actions (those read the player's codex), monster counters (player-only store), or abilities (System-only). The player still carries all knowledge alone for unlock purposes. Villager teaching is a survival-economy channel, not a progression channel — that's canon-consistent (knowledge → food → power), and the dial strengthens exactly that link: hungry villagers now get taught food plants first.

## Q2: sense-testing — the actual teaching dialogue, judged

Captured 33,835 narration lines over 3×60-day runs plus a driven conversation-beat session. Verdicts:

**Characterful and situated (keep):**
- Fireside: "Fireside lesson: Lena passes around tall sunflower-like stalks with knobby tubers at the base, found in sunny patches. Someone asks a dumb question. Nobody minds. That's how you learn." — names the teacher, situates the plant, human.
- Need-driven technique teaching: "Meera watches you scratch at your ankle and shakes their head. 'Here — tweezers at the head, steady pull, don't twist. Like this.' (You learned tick removal.)" — a villager SAW a need and taught. This is the gold standard; my dial extends this pattern to plant lessons.
- Teaching gossip: "You catch James telling the fire about David. 'David taught James the Common Plantain.' The story's already growing." — the village talks about its teachers.
- Player→villager teach beat reactions (4-cycle pool): "You show them Wild Onion — where it grows, how to tell it apart. A short laugh. 'And I've been walking past it for weeks.'" / "'Huh.' They turn it over in their mind. 'I'll remember that one.'" — no repeats within a conversation, no fabricated history, topically coherent (teaches the plant that came up, or bridges honestly).

**Robotic / blanks (documented, not all fixable in my scope):**
- The teach-chore line (villager-objectives.js:671, sibling's file): "📖 David is showing Sofia the American Hazelnut — leaf, stem, smell." — fine with names, but with stranger descriptors it reads "A person, maybe 60s is showing A person, maybe 20s the small understory tree, big drooping leaves, mango-sized green-yellow fruit — leaf, stem, smell." Clunky stage-directions voice; identical template every time. I now return `need` on the lesson result — the chore can vary this line off `lesson.need` without touching my code (suggested follow-up for the owning run).
- spreadPlantKnowledge's 30% narration (game.js): "{teacher} showed {learner} the {plant} — 'remember it.' Word gets around." — single template; acceptable at 30% frequency but it IS the most common v→v teaching line a player reads.
- agencyTeachPlant (my file, out of dial scope): "📖 {name} shows you {plant} — leaf, stem, smell. You won't forget it now." — single template, every explorer lesson identical. Documented blank for a future pass.
- "📖 The Codex turns a page on its own. X is dead. You didn't ask. It knew." — repeated verbatim 6+ times per run. Not teaching, but the most robotic line in the corpus; flagged for whoever owns codex narration.

**After-dial deed lines (new, judged):** "the person in their 50s, with ink-stained fingers taught the person in their 50s, with freckles the tall plumes of small yellow flowers in fall, narrow leaves — for the wound, which leaves to press on it." — specific, honest about the need read, no fabricated history. Good.

## Blanks filled vs documented

FILLED: need-driven villager→villager plant lessons (wound/hunger/novice weighting), teacher-quality failure mode with exact rates, varied deed text by need, `pickW` helper. Proof test `scripts/test-teach-dial-r4.js` green (wounded 75.1% medicinal / hungry 79.1% food incl. dual-use / 60-85-95% quality bands / +2xp for masters / failed lessons write nothing). Measurement harness `scripts/sweep-teach-r4.js` + transcript tools `scripts/test-teaching-transcripts.js`, `scripts/test-teachbeat-transcripts.js` committed.

DOCUMENTED (not fixed — wrong file or out of dial):
1. The teach-chore spoken line template lives in villager-objectives.js (sibling's run); `lesson.need` is now available for them to vary it.
2. Competent policy's `teachRound` (scripts/policies/competent.js, sibling's file) calls `Game.teachPlant(vid, pid)` for plants the PLAYER knows — backwards. Measured: 8,141 calls, 151 successes (1.85%) across 15 before-runs. The real player→villager path is the conversation 'teach' beat (works; writes 'player-taught' + taughtByPlayer). The policy's daily teach loop is 98% wasted — flag for the policy owner.
3. Villagers hold no human skills in any store (`learnSkill`/`grantKnowledge` are player-codex-only); "skill spread across villagers" cannot be measured — the occupation system is the villager skill lane, and it's not teachable. If Steve wants villagers teaching each other herbal_remedy etc., that's a new store, not a dial.
4. `agencyTeachMonster` never fires under the competent policy (needs the ask conversation path); monster-counter teaching is player-only in practice.
5. The wound-need branch is nearly dead: `homeWounds` is written only by raid defense. If wounds should drive teaching more often, the wound system needs a per-villager wound store first.
6. agencyTeachPlant's single-template line and the Codex death-page line are the most repeated robotic lines in the corpus.

## Boundary audit: human skills vs alien abilities (Steve 2026-10-11)

Clean. The dial touches only plant identity (earthly knowledge, `villagerLearnsPlant` binary store). No `learnSkill`/`grantKnowledge` calls, no ability grants, no System-slot involvement. Villager-held abilities (`npcAbilities`) come exclusively from the System XP grant path (Steve 2026-10-09) — no teaching path grants or mimics them. The conversation teach beat correctly teaches the name the player BELIEVES (`wrongAs` travels), never true names the player never learned.

## Files

- `src/js/villager-agency.js` — the dial (agencyTeachVillager + pickW)
- `scripts/sweep-teach-r4.js` — before/after measurement harness (source-counted teaching channels + mission metrics)
- `scripts/test-teach-dial-r4.js` — proof test, green
- `scripts/test-teaching-transcripts.js`, `scripts/test-teachbeat-transcripts.js` — sense-testing transcript capture
- `evidence/2026-10-11/sim-agency-r4.md` — this file
- Raw: `/tmp/teach-before-r4.json` (seeds 1–10), `/tmp/teach-before-r4b.json` (seeds 11–15), `/tmp/teach-after-r4.json` (seeds 1–15), `/tmp/teach-transcripts-raw.json` (33,835 narration lines)

Ontology validator: 80/80 systems valid. No `[needs-eyes]`: no UI/combat/player-feel change — ambient sim behavior + codex book text only.
