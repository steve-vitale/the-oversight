# Long-run sim — food economy lever (2026-10-11)

Lever 0: **food economy** — yields, spoilage, feastburn conversions, specialist processing.
(Note: `longsims-rotation.txt` read `1` at run start; brief assigned FOOD ECONOMY explicitly, so lever 0 was worked. File left at `1`.)

## Baseline (A): 20 seeds × competent policy × 200 days, stock game

- Median survival **56.5 days**, max 200 (3/20 survived). **Win rate 0/20.**
- Deaths overwhelmingly **combat** (78 villager:combat, 74 monster:villager combat, 46 monster:combat) + "the night" (39). **Starvation: 3 deaths in 20 runs.** Food is NOT the binding survival constraint — combat is.
- **Spoilage waste: ~2,845 kcal/day** (4.5M kcal over 1,583 run-days). 99.9% rots in the **village pantry**, not the pack:
  - Foraged food 43%, Garden harvest 41%, Fish catch 16% (seed-77 sample).
  - All of it generic fresh surplus (`spoilDay = day+3`, no foodState) from villager duties.
- **Preservation ladder entirely unreached**: `preserveFood`/`renderFat`/`makePemmican`/`hostFeast`/`grantFeastBuff`/`askSpecialist` = **0 events in 20 runs**. The competent policy never smokes/renders; the village has no preservation path for its own surplus (preserveFood is meat-only; fish/garden lumps aren't eligible).
- The village **'cook' duty was fiction**: contribution credit + "meals stretched, nothing wasted" while ~2.8k kcal/day rotted.
- `knowsTechnique('preserve'/'render'/'clean')` learned in **0/20** runs.
- Reachability verdicts (baseline): preservation tiers — decoration for the village economy; feasts/feastburn — reachable in code, unused by policy; specialist processing — reachable in code (askSpecialist), unused by policy.

## The lever: specialist processing throughput — the village smoke technique (wired)

**Blank filled**: food.js's own header says "let ... the preserver smoke", the synergy fiction says "the village smoke technique — the racks filled and stayed filled. Nothing spoiled. Nothing was wasted.", knowledge.json says "You can preserve anything: ... smoke fish" — but no mechanic existed. The cook duty now actually works the smoke racks.

**Exact change** (`src/js/game.js`, `resolveOneAssignment` 'cook' branch):
- Each part a cook is on duty, they preserve pantry items with `spoilDay - day <= 2` (about-to-rot surplus only; staples/already-preserved/keepsakes untouched, no stack-splitting).
- Rate mirrors the player's preserve path: unskilled cook = blind rate (**0.80x kcal, 15d shelf**, "rough job"); preserver (chef/fisherman/farmer/smoker) = specialist rate (**0.95+0.02·skill capped 1.0, 30+5·skill days** — same as askSpecialist-preserver; energy never created).
- Fish → " (smoked)", plants → " (dried)" (design call, Steve 2026-10-07: make the call, document it, he can overrule).
- Throughput cap **~4000 kcal per cook per part**.
- Honest narration: the "nothing wasted" claim now only appears via the preservation note.

**Policy tooling** (`scripts/policies/competent.js`): a competent leader staffs a cook (preferring a real preserver) when >1500 kcal of fresh pantry food is within 3 days of rot. Commit 1 (policy-only) measured **inert** vs baseline (B≈A: median 57d, 0 wins, 2748 kcal/d waste, 0 cooks staffed under the old preserver-only gate — only 1/10 villages even HAS a preserver, which forced the blind-rate design).

## After (C): 20 identical seeds, new policy + smoke technique

Three iterations (the lever needed calibration):

**C1 — aggressive (no dinner reserve)**: waste 2845 → **1688 kcal/d (-41%)**; preserved stores up to 56.9k kcal ever held (was 0); median survival 59 → **67d**; full 200d survivals 3 → **6/20**. BUT 3 efficient villages flipped survived→lost (seeds 22/88/7777): the cook resolves 3×/day while the village eats once at night — it was smoking tonight's dinner at 0.80x in villages with nothing rotting.

**C2 — reserve 2× total need (~48k)**: overcorrected. Reserve covered the whole fresh pile → cook no-op'd; waste 3130/d (worse than A), median 57d, 1/20 survived. The village's ACTUAL nightly pantry draw is only ~1.5k (measured; villagers eat own production first) — total need is not the draw.

**C3 — reserve 250×roster (~3k for 12, ≈2 nights' actual draw)**: waste 2845 → **2108 kcal/d (-26%)**; preserved stores 4.8k–75.8k kcal ever held per run (was 0); median survival 59d (unchanged); full survivals 3/20 (unchanged set flips: 22/88/7777 → lost, 99/222/444 → survived — symmetric, all combat deaths, RNG chaos not systematic harm). Efficient villages protected (no dinner-stealing); wasteful villages save the true surplus. **This is the shipped calibration.**

Net lever effect (A→C3, identical seeds): -26% spoilage waste, preservation ladder reached (was 0 events), no survival regression, no starvation change (3→3; combat still binds).

## Proof tests

- `scripts/test-village-smoke-20261011.js`: **22/22 green** — skilled preservation (1.0x/45d for fisherman), rough job (0.80x/15d for unskilled), throughput cap (~4000), no calorie creation, staples/already-preserved untouched, haven credit intact with no surplus.
- `scripts/sweep-food-econ-20261011.js`: before/after harness (A/B/C on identical seeds).
- `scripts/test-food-people-20261011.js`: sense-testing transcripts.

## Sense-testing: villagers act like people

- With a human-ish choice policy, conversations are genuinely voiced: occupation humor ("My carpenter training covered a lot. 'Post-apocalyptic foraging' was not on the syllabus."), live gossip ("Did you hear? Jepchirchir just walked away from Haven."), knowledge offers ("I know 3 things worth knowing out here."). Food/hunger/teaching surface naturally ("I keep thinking about what I left behind. Then I get hungry and stop thinking."; "You show them Pawpaw — where it grows, how to tell it apart. Their eyes widen.").
- Pathology found (policy-driven, not filed as a game bug): an always-pick-first choice policy drives filler loops ("Tell me more." / "That's the whole of it. Sorry." ×N). With varied choices the loops resolve into substance. Noted for the convo-rebuild effort; not my lever.
- Teaching in conversation works: "You show them White Oak Acorns — where it grows, how to tell it apart. Their eyes widen. 'I never knew that.'"

## Blanks filled / documented

- FILLED: village smoke technique (cook duty preserves fresh surplus) — the preservation ladder is now reachable for the village economy.
- FILLED (doc): `docs/PRESERVATION.md` "known gap" (render/pemmican unwired for prepStash) was stale — both are wired (`data-stash-render`, `data-stash-pemmican`); verified in node. Doc corrected.
- DOCUMENTED: feasts/feastburn and askSpecialist are reachable in code but unused by the competent policy (player-ritual decisions). Not changed — different lever (contests & shows / villager agency).
- DOCUMENTED: only ~1/10 villages has a preserver-occupation villager — the specialist economy's "let the preserver smoke" intent can't rely on occupation gating alone; the blind-rate parity is what makes the duty work everywhere.

## Design calls for Steve's overrule

1. Village cooks preserve at the player's blind rate when unskilled (0.80x/15d); preservers at the specialist rate. (Mirrors preserveFood exactly.)
2. Fish smokes, plants dry — one `preserved` rung, verb follows the food.
3. Throughput 4000 kcal/cook/part.
