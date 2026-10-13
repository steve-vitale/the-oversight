# Journey leg 7 — SUCCESSION run note (2026-10-13)

## Pre-registered header (docs/MEASUREMENT.md staged methodology)
- **Leg:** succession (journey index 7) — death of the player character (the scholar), the mantle passing, the new bearer's life.
- **Question:** When the PC dies, does the run continue sensibly? Per canon (docs/DECISIONS.md 2026-10-03): (1) the mantle passes from your strongest-bond village — a new Bearer <redacted> chosen from the village you had the strongest bond with; (2) field notes on your person drop with you in the field — a surviving companion can carry them back, a recovery mission can retrieve your remains; (3) the Codex skill passes via mentorship — without it, notes are unreliable. Does this work in code, and is it a playable, coherent continuation?
- **Interesting-finding bar:** the mantle transfer firing on a real PC death in a long sim (or being absent/broken); the new Bearer <redacted> a coherent life (not a fresh blank slate ignoring the dead scholar); field-notes loss/recovery reachable; any dead end (death = silent game-over or blank nothing).
- **Seeds / policy:** pilot 4 seeds (501, 602, 703, 804), competent policy, daycap 140, death-aware horizons (stop at village-lost). Then 4 people-check seeds (901–904) with the clock stopped 8 days after the first bearer death so conversations run against a living village. Driver: `scripts/journey-succession-20261013.js` (new this run).

## Code survey (what exists)
- **Mantle transfer: IMPLEMENTED and deep** (`Game.playerDeath`, src/js/ledger.js ~580–920). On death: death pack (non-sentimental inventory + gear) goes on the corpse as lootable items, sentimentals buried with the body; the village recovers the Bearer <redacted> (`recoverBearer`, corpses.js — r9 2026-10-12 fix); successor = highest-trust living roster member; office trust transfers at 0.6×; body budgets reset (kcal 1500, full health, no diseases/statuses, fresh background abilities from the successor's own occupation); System abilities pass with the office; the Codex/slots/arc/integration/ledger persist; conversational continuity is stamped honestly (`v.mantleOf`, threads/seeds/favors/memories tagged with the predecessor's name — the new face never pretends they were in the room); open promises are released and revert to live asks; journal epitaph in the dying voice + new-hand line in the successor's voice (journal.js `writeEpitaph`/`welcomeBearer`).
- **Canon gaps (documented, NOT built — design-level, see below):**
  1. *Three-layer Codex / field-notes drop:* `identifyPlant` writes straight to `state.codex` — there is no vulnerable untranscribed-notes layer, so knowledge never drops on death; the Codex passes intact with the mantle. The "extract-to-save" risk loop exists only for gear (death pack), not knowledge.
  2. *Strongest-bond village:* `npcIds()` = current village roster only. Single-village game; no multi-village succession selection.
  3. *Codex skill via mentorship:* no codex-skill mechanic; realized instead as journal marginalia + codex persistence + the Codex-sync beat.

## The one blank — FIXED this run
**Bug: the journal mantle wrap never installed in node sims.** journal.js installs its `playerDeath` wrap (epitaph + new-hand lines) via `setTimeout(0)` because ledger.js loads after journal.js. In the browser each `<script>` is its own task so the timer fires after all scripts attach; in node the whole eval is one synchronous block and every later await is a microtask, so the timer starved until the sim ended — **every sim silently ran without epitaphs/new-hand lines** (verified: `mantleRecord().lives` stayed 0 across all pilot deaths).
- **Fix:** `scripts/sim-harness.js` `loadGame` now yields one macrotask after eval, before `init()` — deferred installers attach, matching the browser. Comment cites this run.
- **Proof:** `scripts/test-simharness-mantle-wrap-20261013.js` — 10/10 with the fix (wrap installed by loadGame with no extra wait; forced death writes epitaph life + epitaph/newhand marginalia in the right voices; new hand is the successor). **RED-verified:** 6 failures on pristine (stashed fix, `git stash pop` restored).
- **Regression:** `scripts/test-ledger.js` 93 passed, 2 failed — both failures pre-existing and unrelated (this test has its own loader, doesn't use sim-harness; the failures are test-setup artifacts: the "you're not her" beat needs a third high-trust villager the setup doesn't create, and the keepsake check doesn't account for the successor's own bonded kit items). Same 2 fail on pristine per the prior run's note.

## Pilot results (competent policy, full runs)
| seed | bearer deaths | chain | end |
|------|---------------|-------|-----|
| 501 | 4 | Donna→Aisling→Harold (d11) →Marcus (d18) →Lena (d26), all combat | village-lost d32 |
| 602 | 5 | Stanley→Ethan→Sofia (d10) →Chloe (d46) →Zainabu (d80) →Sara (d91), all combat | village-lost d121 |
| 703 | 4 | Nia→Peyton (d32 starvation) →Caitlin (d33) →Teniola→Sofia (d38), combat | village-lost d48 |
| 804 | 9 | Ruby→Pasquale→Jerome (d8) →Felix (d19) →Renato (d21) →Lena (d30) →Marcus (d37) →Sofia (d49) →Emma (d65) →David (d72), all combat | village-lost d74 **via THE SCATTERING** (famine, David alive) |

22 bearer deaths across 8 seeds total (incl. people-check seeds). **The mantle fired 22/22 times.** Same-day chained deaths occur (two bearers dying in one day). Causes: 21 combat, 1 starvation. Zero silent game-overs: every death either passed the mantle or ended the run through a designed path (no-candidates village-lost, or the scattering).

Trust transfer verified live: 23→14, 13→8→5, 15→9→5→3→2→1 — the 0.6× office discount works; after ~4 deaths the Bearer <redacted> ~0–5 trust (a stranger holding the Codex).

Death-beat sequence (captured, seed 904): "🕯️ Marta Strong is dead — combat. The village stops. Somebody screams. Somebody else starts digging." → "Marta's gone." Wyatt: "You're not Marta." → Codex sync beat → "MANTLE TRANSFER DETECTED…" → "The Codex turns a page: Marta Strong, 19 days. The mantle passes to Layla Kaiser." → next day: "That night, they bring Marta home… the grave is dug by the fire… The filling of it is yours."

Journal (with fix): Donna's epitaph in her laconic register — "Combat. Journal's yours now. The notes hold." — and Aisling's new-hand line — "Picked up Donna's journal. Their handwriting, my hands now. I'll keep it honest." Lives chain correctly (Enzo d0–41 → Amelia d41–49; Bao d0–44 → Gina d44–45; Marta d0–19).

Corpses: recovered to the fire in all cases (recoverBearer works); death packs looted through the normal corpse-looting path by successors (loot-as-action intact); **none buried** — the grave is dug but "the filling of it is yours," and the competent policy never buries. Player-facing beat, unfireable by the policy — noted, not a game bug.

## Village assessment (plain words)
Seed 904, day 27 (8 days after Marta's death): 10 alive. Layla the journalist holds the Codex at trust 7 — the least-trusted person in her own village. The trusted core is Arlo (interpreter, 90), Sofia (gardener, 90), Wyatt (mechanic, 86), Ananya (army medic, 87). They grieve Marta and eye Layla warily. The pantry is full (49k kcal); the Codex holds 16 plants, 3 monsters, 3 skills — knowledge outliving its gatherers, exactly as designed.

The arc across seeds: villages bleed out through combat (wave-1 monsters kill bearers AND villagers — 11 fallen in seed 804), knowledge accumulates across the bearer chain (23 plants / 14 monsters / 5 skills by seed 804's end), then food collapses and the remnant scatters. Seed 804's village lived through **nine bearers in 74 days** — the village-as-protagonist working as designed, until there was no village left. What was missing: no seed produced a calm, stable successor life — every run ended in village death or scattering, so the "successor thrives for a season" arc is unproven in sims. Late-chain bearers inherit ~0 trust, so they lead nothing — honest, but it means long chains are processions of strangers.

## People check (SENSE-TESTING LAW — full transcripts read)
Conversations driven as the successor 8 days after the death (seeds 902/903/904; 6 full transcripts).

**The village reacts like people.** Arlo on Marta (seed 904): "Marta is gone and the world just... continues. That's the part I can't stand." → "I wake before anyone else. It doesn't bring anyone back. It just keeps my hands from shaking." → "We bury, we grieve, we keep going. There's no step four." → "My part? I remember them. Someone has to do it properly." Ananya: "Since Marta died... I keep expecting to see Marta at the fire. Stupid." Brunhilde to the new Bearer <redacted> "Amelia and I never finished talking about that question — we got cut off, 4 days back. **You're wearing Amelia's shoes now** — want to pick it up?"

**No fabricated shared history.** NPCs speak of the dead in third person; inherited threads are labeled with the predecessor's name ("About their secret — that was Amelia's thread. We never finished."); the successor never claims memories they didn't live. The `mantleOf` stamping works.

**Conversations have meaning:** the NPC wants something (Arlo's stolen-medicine confession, Peyton's open wound, Brunhilde's stockpile share, grief that needs airing); options engage or deflect; endings resolve ("This was good." They mean it.) or plant threads. 2/6 reached natural end within the turn cap; the rest hit the 10-turn cap with the NPC signaling exit ("I should get back to it") — driver behavior, not a game issue.

**Minor wrinkles (documented, not fixed):** grief lines share a template skeleton — "It doesn't bring anyone back. It just keeps my hands from shaking." appears verbatim in two villagers (personalized first sentences carry it, but the shared spine shows); "...Sorry, lost my train of thought." is a generic closer; "I just said — did you miss it?" repeats when re-asking about finished favors.

## Reachable / Fun / Winnable
- **REACHABLE: yes, emphatically.** Death is common in competent play; 22/22 deaths passed the mantle. A real player will absolutely see this content — likely in their first fortnight (first deaths at days 8–11 in 3 of 8 seeds).
- **FUN: yes.** The death beat is the best-written sequence in the leg's path — the scream, the digging, "You're not Marta," the Codex syncing, the village bringing the Bearer <redacted>, the epitaph in the dying voice. Successors inherit a world that remembers.
- **WINNABLE: the mantle never blocks it.** Codex, slots, arc, integration, ledger persist; the body is fresh. Caveat: no sim produced a thriving successor, and the trust discount means long chains erode leadership — the village-as-protagonist survives, but late bearers inherit strangers' trust, not a mandate.

## Files
- Driver: `scripts/journey-succession-20261013.js` (competent-policy play, death capture, death-anchored narration, people-check conversations, census)
- Proof: `scripts/test-simharness-mantle-wrap-20261013.js` (10/10, RED-verified)
- Fix: `scripts/sim-harness.js` (one macrotask yield in loadGame)
- Evidence: `evidence/2026-10-13/journey-succession-seed{501,602,703,804,901,902,903,904}.json`, `journey-succession-summary.json`

## Verdict
The mantle is the most complete system this loop has audited: it fires every time, the village mourns like people, the journal keeps every life, and failure resolves into story (scattering, village-lost) rather than a blank screen. The one real bug found was in the test tooling, not the game — and fixing it is what let the sims see the epitaphs at all.
