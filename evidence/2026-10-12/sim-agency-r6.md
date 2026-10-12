# Long-run sim — LEVER 3 sub-run r6: player's teach-learn spoken surface (2026-10-12)

Worker: sim-agency-r6. Sub-lever: THE PLAYER'S TEACH-LEARN SPOKEN SURFACE — the line a villager speaks when teaching the PLAYER (agencyTeachPlant). Fills r5's documented blank #3.

## The village, in plain words

10 seeds × 200 days, competent policy + askRound (the player asks explorers about the wild through the real conversation path). These are brutal seeds: all 10 runs ended village-lost, median day 80, best day 167. Combat is the great killer — 78.1% of deaths are combat-related (villager combat 43.6%, player combat 34.5%, monster 8.7%); starvation takes 6.1%. The village reaches Arc 3 in 8/10 runs, wave 3 in 6/10 — the content is reachable, the village just can't hold it.

Who thrives: the explorers who return with news (Marcus, Emma, Cheyenne name the teach lines) — they're the ones with teachable entries to spend. The player asks 13 times on seed 1 alone; 11 plant lessons land across all 10 runs (plus 12 monster lessons). Who dies: everyone, eventually — the ask path doesn't save the village, but the teaching happens on the way down.

What was missing: the spoken surface of the villager→player lesson was ONE identical template every time — "📖 Marcus shows you Burdock — leaf, stem, smell. You won't forget it now." 11/11 lines in the before sweep. The teacher's voice was already fine (firstRef, no bare "A"), but the line never varied. That's the blank.

## The dial (exact numbers — one dial, in villager-agency.js only)

`agencyTeachPlant`'s narration line, two changes:

1. **Line varies off the player's READ NEED** (wound/hunger/novice/general), parallel to r5's teachChoreLine:
   - wound: `📖 {nm} shows you {plant} — which leaves to press on a wound.`
   - hunger: `📖 {nm} shows you {plant} — where it grows, what's safe to eat.`
   - novice: `📖 {nm} walks you through {plant} — leaf, stem, smell, the beginner's tour.`
   - general: `📖 {nm} shows you {plant} — leaf, stem, smell.` (classic kept)
   - All keep "You won't forget it now. (Codex: {plant} identified.)" — the honest outcome.
2. **Need = (player state) × (plant properties)** — the honesty guard:
   - wound fires only if player health < 40 (the game's own open-wounds threshold) AND the picked plant is medicinal. A wound claim on a food plant would be a lie the player might act on.
   - hunger fires only if npcNeeds(player).hunger ≥ 60 AND the plant is food.
   - novice = taught-source codex lessons < 3 ("new to being taught the wild") — NOT codex breadth. The player outgrows breadth<8 before the first ask (fireside/shared teach fast), but the first few direct lessons are still the beginner's tour. Diagnostic proved breadth<8 never fires at ask time (breadth 8–38, health 100, hunger 30 across all 11 before-lessons).

Pure string building via extracted `Game.teachPlantLine(nm, plantName, need)` — zero RNG draws, no mechanic touched, narration-only by construction. The plant pick (`pick(cands)`), codex write, teachable spend, and return value are unchanged.

## Before/after on identical seeds

- **10 seeds × 200 days, competent+ask**: aggregate AND all 10 per-run metric records **bit-identical** (win/arc/wave/taught breadth/lessons/channels/death-cause shares — every field, verified by JSON string comparison excluding only narration strings).
- **Transcript variety, 11 teach lines both sides**: before = 11/11 classic ("— leaf, stem, smell."). After = 9/11 novice ("— leaf, stem, smell, the beginner's tour.") + 2/11 classic. The template now PROGRESSES: beginner's tour for your first 3 lessons, classic after.
- **Wound/hunger frames**: 0/11 in competent sims — the competent player is never wounded/hungry at ask time. Proven working in the proof test (driven trials), ready for when a real player struggles.
- **Proof**: scripts/test-teachplant-lines-r6.js green (4 variants distinct, 5 driven need-read trials incl. honesty: wounded + food plant does NOT claim wound use). Red-checked: fails pre-dial (helper doesn't exist).
- **Regressions**: test-teach-dial-r4 green, test-agency-teachv-20261011 20/20, ontology 84/84.

## Sense-test verdicts (new lines, judged)

- "📖 Marcus walks you through Burdock — leaf, stem, smell, the beginner's tour. You won't forget it now. (Codex: Burdock identified.)" — "walks you through" is warmer than "shows you"; "the beginner's tour" explains the extra guidance. This is your first lesson from Marcus; the tour frame is honest. Good.
- "📖 Emma walks you through Dandelion — leaf, stem, smell, the beginner's tour. You won't forget it now. (Codex: Dandelion identified.)" — second teacher, same tour frame. Three lessons max per run get this, then it stops — a pedagogical arc, not a repeat.
- "📖 Marcus shows you American Persimmon — leaf, stem, smell. You won't forget it now. (Codex: American Persimmon identified.)" — day 106, 4th+ lesson. The classic returns once you're not a beginner. The progression reads.
- Proof-test wound line: "📖 the person in their 60s, with a missing fingertip shows you Sassafras — which leaves to press on a wound." — specific, the wound read shows, the plant (Sassafras, medicinal) fits the claim. Good.
- Proof-test hunger line: "📖 the person in their 60s, with a missing fingertip shows you Cattail — where it grows, what's safe to eat." — the hunger read matches the plant (Cattail, food). Good.
- Proof-test honesty: wounded player + Cattail (food, not medicinal) → "walks you through Cattail — ... the beginner's tour." — does NOT claim wound use. The guard holds.
- No fabricated history, no bare-"A" voice (firstRef was already in place), no trust-theater.

## Reachability verdict

The villager→player teach path is reachable but thin: 11 plant + 12 monster lessons across 10×200-day runs (the askRound exercises it; pure competent never asks). The need-frames are reachable in code (proof test) but wound/hunger don't occur in competent sims — they're for struggling players, not the bot. The novice frame fires in practice (9/11). Nothing is decoration, but the path is a trickle: teachable entries accrue slowly (every 2nd plant discovery) and asks are bounded by explorer news.

## Blanks filled vs documented

FILLED: agencyTeachPlant's spoken line now varies off the player's read need (4 templates via `teachPlantLine`), with the honesty guard (need × plant-fit). The single-template robotic line is gone.

DOCUMENTED (not fixed — out of the one-dial discipline):
1. The ask-path transcript line (`"This one — {plant}. Leaf, stem, smell. You won't forget it now."` in agencyTurn) is still a single template — a different surface (dialogue transcript vs narration feed), flagged for a future pass.
2. The Codex death-page repeat ("📖 The Codex turns a page on its own...") from r4 doc 6 still repeats verbatim — not teaching, but still the most robotic line in the corpus.
3. Wound/hunger need-frames are proven but unexercised in competent sims; if Steve wants them firing more often, the trigger is the player's struggle, not the dial.
4. The villager→player teach path is thin by design (declining returns); if Steve wants more teaching, that's a lever change (teachable accrual rate), not a dial.

## Files

- `src/js/villager-agency.js` — the dial (teachPlantLine helper + need-read in agencyTeachPlant)
- `scripts/test-teachplant-lines-r6.js` — proof test, green (red-checked pre-dial)
- `scripts/sweep-teachplant-r6.js` — before/after measurement + transcript capture (competent+ask)
- `scripts/diag-teachplant-needs.js` — diagnostic: player state at ask time (breadth/health/hunger)
- Raw: `/tmp/teachplant-before-r6.json`, `/tmp/teachplant-after-r6.json` (10 seeds × 200d, bit-identical metrics)

No [needs-eyes]: ambient sim narration only — no UI, combat, or player-feel change.
