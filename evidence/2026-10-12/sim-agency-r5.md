# Long-run sim — LEVER 3 sub-run r5: villager daily routines (2026-10-12)

Worker: sim-agency-r5. Sub-lever: VILLAGER DAILY ROUTINES & GOAL-DRIVEN BEHAVIOR — do villagers act like people across a day (goals, routines, duty chores, objTick activity lines, spoken-line variety). Teach/learn proper is r1/r2/r4's lane (see evidence/2026-10-11/sim-agency-r4.md); not redone here.

## The village, in plain words

180 sim-days across 3 seeds, competent policy, transcripts read in full. The village has a visible daily rhythm: people shoulder packs and set out in the morning (278 departure lines), come back with water, snared meat, forage (418 return lines), eat by the fire when hungry (150), sleep by the fire when spent, tend the fire, mend things by the door, work the cookpot, sweep the hall (211 chore lines), sit with each other talking low (35 visits), and occasionally teach each other the wild (45 teach lessons + 17 honest "going over their finds" reviews). ~2.54 routine lines per day. This reads as people living a day, not tokens ticking: departures gossip-seed, returns stock the pantry with real numbers, rest recovers energy, eating answers visible hunger.

Who thrives: nomad-profile villagers are the ones out and back (departure/return lines name them); homebodies hold the hall (chore lines). Objectives re-pick at dawn and on idle; the danger check (go/ask/tighten/defer) visibly gates departures. Goals surface: escape-goal villagers leave (LEAVE, duration 999), hungry villagers go eat, spent villagers rest.

What was missing: the spoken surface of the single most meaningful routine — the teach lesson — was one identical template every time, and with stranger descriptors it read as stage directions: "📖 A man, maybe 50s is showing A woman, maybe 30s, with a slouched posture the broad oval ribbed leaves ... — leaf, stem, smell." 43 of 45 teach lines shared that exact ending. r4's need-read (`lesson.need`) was recorded but never surfaced in the spoken line.

## The whole daily-routine picture (baseline, 3 seeds × 60d)

| category | lines | voice verdict |
|---|---|---|
| RETURN (water/traps/forage/explore/expedition) | 418 | varied templates, real numbers, honest failures — good |
| DEPART | 278 | 3-template pool + danger verdicts — good |
| EAT | 150 | 1 template, "not talking, just eating" — fine at 0.5 frequency |
| CHORE (fire/repair/cook/sweep) | 211 | 1 template each — fine, quiet domestic texture |
| TEACH_CHORE | 45 | **1 template, clunky with descriptors — THE BLANK (filled)** |
| VISIT | 35 | 1 template — "Not business. Just people." fine |
| TEACH_REVIEW | 17 | 1 template, honest fallback — fine |
| REST | few | 1 template — fine |

Routine reachability: every category fires. Nothing is decoration.

## The dial (exact numbers — one dial, in villager-objectives.js only)

Teach-chore spoken line, two changes:
1. **Line varies off `lesson.need`** (wound/hunger/novice/general, recorded by r4):
   - wound: `📖 {tnm} is showing {lnm} {plant} — which leaves to press on a wound.`
   - hunger: `📖 {tnm} is showing {lnm} {plant} — where it grows, what's safe to eat.`
   - novice: `📖 {tnm} is walking {lnm} through {plant} — leaf, stem, smell, the beginner's tour.`
   - general: `📖 {tnm} is showing {lnm} {plant} — leaf, stem, smell.` (classic kept)
2. **firstRef for both refs** (was displayName): "A man, maybe 50s is showing A woman, maybe 30s ..." becomes "the man in his 50s is walking the woman in her 30s ... through ..." — same voice as the deed text.

Pure string building, zero RNG draws, no mechanic touched — narration-only by construction. Extracted as `Game.teachChoreLine(tnm, lesson)` so the proof test drives it directly.

## Before/after on identical seeds

- **10 seeds × 200 days, sweep-teach-r4**: aggregate AND all 10 per-run metric records **bit-identical** (win/arc/wave/taught breadth/lessons/channels/death-cause shares — every field). The dial moves no number; it only speaks differently.
- **Transcript variety, 3 seeds × 60d (45 teach lines both sides)**: before = 1 template (43× "— leaf, stem, smell." + 2× the same inside a descriptor dash). After = 4 endings (36× novice/beginner's tour, 4× hunger, 3× general, 2× novice with descriptor dash). 0 bare-"A ..." voice lines after.
- **Proof**: scripts/test-teachchore-lines-r5.js green (all 4 need variants, 4 distinct endings asserted, fallbacks for unknown need/missing plant/learner, no bare-A voice). Red-checked: fails pre-dial (helper doesn't exist).
- **Regressions**: test-agency-teachv-20261011 20/20, test-teach-dial-r4 green, ontology 83/83.

## Sense-test verdicts (new lines, judged)

- "📖 Lena is walking Consuelo through the grass-like leaves with a sharp familiar smell when crushed — leaf, stem, smell, the beginner's tour." — specific, warm, the novice read shows. Good.
- "📖 David is showing Meera the tall sunflower-like stalks with knobby tubers at the base, found in sunny patches — where it grows, what's safe to eat." — the hunger read matches the plant (food plant, ×3 weight picked it). Good.
- "📖 the man in his 50s is walking the woman in her 30s, with a slouched posture through the small understory tree, big drooping leaves, mango-sized green-yellow fruit — leaf, stem, smell, the beginner's tour." — descriptor voice fixed ("the man"/"the woman" instead of "A ... is showing A ..."); "is walking ... through" + long descriptor is a mouthful but grammatical and honest.
- No fabricated history, no repeats beyond the template pool, no trust-theater (trust bumps only on landed lessons — kept from r2).

## Reachability verdict

Daily routines are fully reachable: departures, returns, chores, visits, rests, meals, and teach lessons all fire in every seed. The teach chore's need-read now reaches the player on two surfaces (deed text from r4 + the spoken line from r5). The wound need still fires 0/45 in these seeds — the wound store is nearly dead by design of the wound system (r4 doc 5), not this dial; the line is ready when it fires (proven in the proof test).

## Blanks filled vs documented

FILLED: teach-chore spoken line variety off lesson.need (4 templates), firstRef voice fix for both refs, `teachChoreLine` helper, proof test + transcript tools committed.

DOCUMENTED (not fixed — out of the one-dial discipline):
1. REST/EAT/VISIT/other-chore lines are single templates each; fine at current frequency, but a future variety pass could pool them (all in villager-objectives.js objTick).
2. The wound-need branch is reachable in text but ~dead in sims: `homeWounds` written only by raid defense (r4 doc 5). If wounds should drive teaching, the wound system needs a per-villager store first.
3. agencyTeachPlant's single-template "shows you ... — leaf, stem, smell" line and the Codex death-page repeat (r4 docs 6) remain the most robotic lines in the corpus — flagged for whoever owns them.

## Files

- `src/js/villager-objectives.js` — the dial (teachChoreLine + firstRef refs in the teach chore)
- `scripts/test-teachchore-lines-r5.js` — proof test, green (red-checked pre-dial)
- `scripts/test-daily-routine-transcripts.js` — sense-test transcript capture (category counts + teach-line endings + samples)
- Raw: `/tmp/routine-before-r5.json`, `/tmp/routine-after-r5.json` (10 seeds × 200d, bit-identical), `/tmp/teach-transcripts-raw.json` (baseline), `/tmp/routine-transcripts-raw.json` (baseline), `/tmp/routine-transcripts-after.json` (after)

No [needs-eyes]: ambient sim narration only — no UI, combat, or player-feel change.
