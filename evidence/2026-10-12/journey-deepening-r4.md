# Journey leg 2 (deepening) — R4 run note (2026-10-12)

**Leg**: deepening (days 40–80) · **Run**: R4
**Harness**: `scripts/journey-deepening-r4-20261011.js` (r3 harness + W3FULL/ALLFIGHTS/STALLTRACE instrumentation)
**Canon**: MONSTER-WAVES.md, KNOWLEDGE.md, CONVERSATIONS.md read.
**Seeds**: 10101, 20202, 30303, 40404, 50505, 60606 (honest, day 1→110)

## The blank filled: want "tell me more" looped forever with verbatim repeats (FIXED)

**From the transcripts (SENSE-TESTING LAW).** Seed 60606, day 55, Emma (`share_news` want). The player picks "Tell me more." 7 times:
1. "The treeline, this morning — something moved out there, big..." (real news)
2. "Okay, so — David. Turns out they weren't what they said — they're a plumber..." (real news)
3. "That's everything I've got. You know as much as I do now." (honest exhaustion)
4. "That's... pretty much all of it, honestly." (dry pool)
5. "I wish there was more to tell. That's it." (dry pool)
6. "That's the whole of it. Sorry." (dry pool)
7. "That's... pretty much all of it, honestly." ← VERBATIM REPEAT
8. "I wish there was more to tell. That's it." ← VERBATIM REPEAT

Steve's law: "No repeats, ever" and CONVERSATIONS.md: "'Tell me more.' goes deeper until the thread is honestly exhausted — then they say so... instead of looping." The engine violated both.

**Root cause.** Two gaps:
1. `convoWantMenu` (convo-wants.js) offered the want def's `dlg:more` unconditionally while `stage < 3`. It never checked whether the want had more to say. `convoWantNews` exhausted honestly but didn't mark it.
2. The topic pool (convo-beats.js) ALSO offers `dlg:more` (same choice id, different source). Its `threadDry` check didn't know about want exhaustion. So even after the want menu retired "more", the topic pool re-offered it.

When "more" was picked on a spent want, `convoWantNews` returned the same exhaustion line, `sayLine`'s no-repeat ledger blocked it, and the handler fell through to the 3-line dry pool — which `convoPickCycle` RESETS after 3 uses, hence verbatim repeats.

**Fix** (`src/js/convo-wants.js`, `src/js/convo-beats.js`, +41/−2):
- `convoWantNews`: sets `w.newsExhausted = true` on the dry path.
- `share_news` def: new `moreAvailable(vid)` → `!w.newsExhausted` (multi-beat: stays open while news types remain).
- `convoWantMenu`: filters `dlg:more` when the want's more-content is spent. Default for single-beat wants (`just_company`, `seek_taken`): `(w.stage || 0) < 2` — the fixed beat must not repeat.
- Topic pool (convo-beats.js): on the 'want' thread, `dlg:more` is skipped when the want's `moreAvailable` is false (or stage ≥ 2 by default).

**Proof**: `scripts/test-want-more-exhaustion-20261012.js` — 5/5 GREEN post-fix. On pre-fix code, 3 RED (share_news "more" never retires, 8 exhaustion-ish lines, verbatim repeats). Before/after demonstrated.

**Regressions**: `test-dialog-coherence-20261011.js` 37/37, `test-favor-system-20261011.js` 30/30, ontology 82/82. (`test-convo-coherence-choices.js` fails pre-existing — its eval list omits modules defining `resolveConsequence`; unrelated to this change.)

## What R4 measured (the leg)

- **6/6 villages lost** (days 14–84). Causes: combat + starvation (the known mid-game wall). Seed 20202 scattered on day 14 via the famine mechanic (3 hungry days → "The scattering, again") — working as designed, harsh.
- **Wave-3 gate**: unlocked once (seed 10101, day 76). **Zero wave-3 fights in honest play across all 6 seeds** — same as R2's blank. The pipeline works (R3 probe proved it); villages die before they can go hunting. The deepening leg's signature content remains unreachable in honest play. Root cause is the food+combat survival wall (longsim loop's lever), not a pipeline bug — documented, not fixed here.
- **Regional links**: 1/6 seeds reached 'regional' (30303, via Emberhold). 14 proposals declined across other seeds — the climb verbs exist (`studyVillageCodex` +3, broadcast wins +2) but the competent policy proposes cold and spirals (-5 opinion per decline). Working as designed; policy limitation.
- **Scale pressure**: only 30303 moved past 'village'. The leg's "regional links, scale pressure" is mostly not experienced — same survival bottleneck.

## Village assessment (plain words)

Seed 10101 (longest, day 84): Emma (Veterinarian) alone at the end, trust 1, 25 plants known. Everyone else died — Lena starved day 79, Marcus killed by Nevermore day 43, James and David killed by monsters days 50/53. The village ate itself trying to survive: 5 starvation deaths, 14 combat deaths. Emma survived by being the last one — not by thriving.

Seed 40404 (day 68): 3 survivors — Lena (ER nurse, trust 80, 16 plants), David (plumber, trust 90, 15 plants), Willie (bush pilot, trust 8, 19 plants). High trust, real knowledge, but the village still collapsed (8 villager-combat deaths — they fought monsters and lost).

The pattern: villagers fight bravely (dozens of villager-combat deaths) but lose. The ones who survive are the ones who know plants and are trusted. Knowledge is survival, but not enough.

## People check (SENSE-TESTING LAW)

Read 6 full transcripts (days 55/75). **They mostly act like people**:
- James (30303): "Lena and I never finished talking about that favor — we got cut off, 4 days back. You're wearing Lena's shoes now — want to pick it up?" — references a real prior event, acknowledges the mantle passing to a new bearer. Excellent.
- Favors are concrete ("East treeline, first light. Bring a pack.") with real resolutions (promised).
- Lena (40404): honest, reflective, "That's not naive. That's load-bearing. Hold onto it."

**Still broken (documented, not fixed)**:
- **Self-gossip**: James (50505) says "Did you hear? James just walked away from Haven. Didn't look back." — gossiping about himself in third person. Sense failure in `npcGossipAbout` (should exclude self).
- **Identical favor directions**: "East treeline, first light. Bring a pack." verbatim across James (30303) and Emma (10101). The favor template needs per-NPC variation.
- The teach template ("You show them X — where it grows, how to tell it apart.") repeats structurally, though NPC reactions vary. Better than R3's 4x verbatim, but still template-y.

## Investigation: the 20k-round frozen fight (harness bug, documented)

Seed 60606 hit a 20,535-round "fight" vs 4 hummice (day 38). Nobody moved, nobody attacked. Root cause: the player was at (4,1), the flee path tried `tbPlayerMove(4,0)`, but `findPath` returned null ("No path there" — tile blocked). The harness's naive flee retried the same blocked tile 20k times. The hummice also couldn't path to the player. **This is a harness limitation, not a game softlock** — a real player would try a different direction. The game correctly says "No path there"; it just doesn't suggest alternatives. Documented as UX friction, not fixed (the harness needs a smarter flee, not the game).

## Reachable / Fun / Winnable

- **Reachable**: PARTIAL — Wave-3 unlocks (day 76) but no honest-play fights. Regional links form (1/6). The leg's content exists but is gated behind survival.
- **Fun**: YES when it works — the conversations are genuinely good (mantle-awareness, concrete favors, real gossip). The wave-3 signature mechanics (from R3) are distinct. But 6/6 villages dying makes it hard to experience.
- **Winnable**: YES but hard — R3 proved it (1/6). R4 got 0/6. The food+combat wall is the binding constraint (longsim's territory).

## Files

- Fix: `src/js/convo-wants.js` (newsExhausted, moreAvailable, menu filter), `src/js/convo-beats.js` (topic pool dry check)
- Proof: `scripts/test-want-more-exhaustion-20261012.js` (5/5)
- Harness: `scripts/journey-deepening-r4-20261011.js`
- Evidence JSONs: `evidence/2026-10-12/journey-deepening-r4-*.json`
- Transcripts: `/tmp/journey-deep-r4-transcript-*` (6 read)
- Debug scripts: `scripts/debug-hummice-stall-20261012.js`, `scripts/debug-stall-state-20261012.js` — scratch, kept for the record
