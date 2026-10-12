# Audio-VFX Audit — VFX findings
Date: 2026-10-12 · Auditor: VFX subagent (READ-ONLY; no source touched, no commits)
Worktree: ~/workspace/worktrees/audio-vfx-audit · branch audio-vfx-audit (branch master per brief refers to repo branch name in main tree; this worktree checked out its own audit branch)

Read: docs/CANON.md, docs/MONSTER-WAVES.md (full). No canon invented — gaps are named as gaps.

## Method
Grepped/traced the full visual pipeline. Claims below are VERIFIED (grepped code, traced dispatch, or counted programmatically) unless marked INFERRED.
Tooling note: one display-layer false positive — the tool renderer masked `secret: 'knowledgeReveal'` in src/js/drama.js:71 as `secret: <redacted>`; the file is fine (verified byte-level via python).

## 1. The visual pipeline — what exists and what's wired

### The hub: Drama (src/js/drama.js, 1975 lines, 76 methods)
The central VFX helper EXISTS. `Drama` (Scattering.Drama) is a DOM-overlay system (`.drama-overlay`, pointer-events:none, transform/opacity-only, self-removing elements). The single dispatcher is `Game.drama(kind, ...args)` in game.js (~line 21262). Two hard rules: ALL drama is OFF before System arrival (day 7), and every effect scales with integration level L0–3.

Method inventory by area (all hand-written, all VERIFIED present in drama.js):
- Combat: hit (impact starburst), critHit, dodgeMiss, playerHurt, enrage (half-HP temperament), phaseShift (edge-pulse + label), lootSparkle, soulWisp, beamHorror, floatText, shake, flash, heroCard
- Telegraph UI: dangerbar text (⚠ + cue) via app.js `showTelegraph`/`clearTelegraph`; grid cell-class overlays (see §2)
- Contests: contestFlash dispatcher with types announce/cheer/boo/judging/winner/loser/banner; contestAnnounce, contestCheer, contestBoo, contestJudging, contestWinner, contestLoser methods
- Broadcast: broadcastFlash with types entry/replay/lowerthird/exit (+ Drama.broadcastEntry etc.)
- Social: socialFlash (dispatcher for mootGather, mootVote, exileMoment, liarExposed, reconcileGlow, betraySlash)
- Life/death: playerDeath, newLife, villageBirth, villageDeath
- Knowledge: plantIdentified, techniqueLearned, codexLinked, skillGained, teaseFaint, ahaMoment, levelUp, synergyShimmer
- Wilderness: secretShimmer, ambushWarning, wildRipple, weatherShift, trailMark
- NPC: npcAlert, exclaim, systemCommentary, integrationPulse
- Abilities: abilitySignature (10 bespoke sig* methods + poolSignature fallbacks), abilityBurst
- Data-driven: renderEffect(id, args) — generic renderer over src/data/dramaEffects.json

### Fired-vs-wired matrix (VERIFIED by extracting all 39 dispatcher branches + all `.drama('X'` call sites)
**Fired but SILENTLY DROPPED (no dispatcher branch — the try/catch swallows them, nothing renders):**
1. `alienHeavyHit` — encounters.js:2730. Monster heavy strike lands; zero impact VFX. (Drama has no such method either.)
2. `contestAnnounce` — game.js:22074. System trial offer; no banner plays.
3. `contestCheer` — game.js:21778 (fan-package unboxing), game.js:21903 (cooking demo); no cheer plays.
4. `weatherShift` — game.js:22209 (storm-front resolve). The dispatcher HAS a `weather` branch → D.weatherShift, but the call site passes `weatherShift` as the kind → no match. The `shake` right after it DOES fire.

**Dispatcher branches that exist but are NEVER fired (dead infrastructure):** `ambush`, `commentary`, `exclaim`, `text`. (`ambushWarning` is a fully-built red-vignette + ⚠️ marker — built and unreachable.)

**dramaEffects.json (1132 lines, 32 effect definitions): effectively dead.**
- `renderEffect` is called from NOWHERE (only defined in drama.js:137; registry is loaded into `D.effectRegistry` at game.js:254 but never consumed). The hand-written methods are what actually run. The JSON registry is write-only.
- 5 definitions have NO corresponding Drama method and no dispatcher path: `celebration`, `dawnBreak`, `duskFall`, `harvestGlow`, `mourning`. Day-part transitions (dawn/dusk) have zero visual treatment anywhere.
- The other 27 JSON defs duplicate existing hand-written methods.

### Screen-shake / flash / overlay
- `D.shake` exists (CSS class `drama-shake` on grid container, GPU-cheap transform). Only ONE external call site: game.js:22210 (storm resolve). All other shake usage is nested inside other drama methods (playerHurt, critHit, beamHorror, contestAnnounce, playerDeath, newLife, enrage). Shake is under-utilized as a standalone primitive — monster heavy strikes (the dropped `alienHeavyHit`) are the obvious missing caller.
- `D.flash` (full-screen color pulse): fired externally twice (weather light game.js:22242; synergy hero). Nested elsewhere.
- No camera-pan, no slow-mo outside contestJudging, no letterboxing, no fullscreen overlays beyond heroCard/contestAnnounce.

## 2. Monster VFX per wave

### Sprites (src/js/sprites.js, 213 SVG sprites; `monsterSprite(mid, aggro)`, aggro=aggro form)
VERIFIED counts via programmatic cross-check of monsters.json (59 ids) vs sprite registry:
- **Wave 1: 15/15 have sprites** (incl. Nevermore, Night Court flyers). Calm/aggro pairs; 30 aggro variants total.
- **Wave 2: 15/15 have sprites.** Wave-2 telegraph identity (per-monster grid voices: biHot, sbLock, dozeLane, swarmHum, resonantBurst, flashBurst, pzFlash, ideaHeat, heronStrike) + grid overlays (glasswing dive shadow, sunbasker heat halo, catfish tell, ducks line, memory-projector amber beam). Best-covered waves.
- **Wave 3: 9/9 MISSING.** **Wave 4: 10/10 MISSING** (incl. herald). **Wave 5: 10/10 MISSING** (incl. finale_crew, finale_opening). All 29 render as emoji on the grid — against the visual-identity law ("custom sprites over emoji shortcuts — always").
- Emoji-doubling violations (standing law): 📼 = Nostalgia (w2) AND finale_opening (w5); 📺 = ad_break (w3) AND finale_crew (w5). Earlier waves never leave the pool, so these can share a fight.

Worst sprite gaps (horror core):
- **The Callback** (w3): canon says it "wears the face of an ACTUAL dead villager" — renders as 👤 emoji. The signature visual (a real villager's face) doesn't exist.
- **The Redactor** (w3): "edge-handles POINT" as the telegraph — renders as ⬛ emoji; the handles are invisible. Telegraph is text-only.
- **Buffering** (w3): afterimages DO render on grid (VERIFIED: `Game.bufAfterimageCells()` in sigW3c.js:737 + app.js:16056 renderer reads it; real present dimmed to opacity .45). Text token is ⏳.
- **Spool** (w3): "the reels visibly show what's loaded" — VERIFIED the "reel" is a say line + 🎞️ examine button (sigW3b.js:719), text only. No visual reel.
- **Ad Break** (w3): "a visible progress bar (the bar is the telegraph)" — VERIFIED it's an ASCII bar in a say line (sigW3c.js:330 `adBar()`, :443). No DOM progress bar.
- **The Finale** (w5): 3-round doom countdown to a [150,200] strike — text/countdown only.
- **The Cancellation** (w5): "the stamp descends" — no stamp visual.

### Aggro-form usage — VERIFIED coherent
- Combat grid: aggro=true sprites (app.js:16244: `const _aggro = true; // combat = aggro form`). Exploration grid: calm. Combat strip + fighter lists: aggro=true. The calm-until-aggro law holds.

### Telegraphs (grid)
Real system, knowledge-gated (pattern must be learned before cells show — Steve 2026-10-05/06): beamLane/beamLive/beamGhost/beamSource/beamLight (deer beam w/ sweep arc + halo), burstRadius, chargeLane, targetTile (single), lockOn (direct), lineCells, plus per-monster style voices. Dangerbar text via `showTelegraph`. Wave-2 style routing complete.
- Wave 3–5 signature mechanics have NO bespoke grid telegraphs (except Buffering afterimages). They ride generic pattern buckets + the text dangerbar + `phaseShift` edge-pulse (encSetPhase maps phases → windup/strike/recovery buckets; VERIFIED fires at game.js:31713).
- Combat telegraphs are text in the dangerbar; there is no iconography per signature mechanic.

### Hit reactions / death (VERIFIED call sites in game.js)
- `hit` starburst: fires on the PLAYER's strike only (game.js:29610-11), and only vs non-humans. **Villager strikes fire NO hit VFX.** (fieldFights.js has ZERO `drama(` calls — villager-vs-monster blow-by-blow fights, which Steve mandates be real fights, have no impact, death, or enrage visuals at all.)
- critHit (29610), dodgeMiss (30508), playerHurt red-vignette+shake on 5+ dmg (30815).
- Monster half-HP: generic enrage/cunning/desperate temperament (30873-30906) — fires for ALL monsters (data-declared temperament > pattern-derived > enraged fallback) with audio voice + drama. This is the only per-monster hit-reaction visual, and it's generic.
- Monster death: soulWisp + lootSparkle (30972-73) for all monsters killed in player combat. VERIFIED.
- No sprite flinch/flash on being struck; no per-monster death animation; monster movement on the combat grid is a TELEPORT — only the player glides (all MoveAnim.enqueue calls are player-relative; `data-ent` stable fighter keys exist for future gliding but nothing enqueues monster steps).

### Telegraph honesty — current state (PRIOR ART check)
The 2026-10-08 "copy-only signature mechanics" debt was the repair plan pending Steve's pick. Current state per headers + spot-verification:
- MONSTER-WAVES.md claims batch A/B/C mechanics are engine-real with "telegraph honesty is law."
- VERIFIED (spot check): **Redactor** — POINT phase runs a full round before `sigRedactorRedact` executes (sigW3a.js:319-345); **Gavel** — ACCUSE names a real logged crime, verdict falls next round (sigW3a.js:366+). Both match the documented mechanics.
- Caveat: I sampled 2 of 26 wave 3–5 monsters. Batch B/C headers assert honesty per-mechanic, and sigW4/sigW5 hooks are installed (Object.assign + combat-turn wrappers, VERIFIED present). Full honesty across all 26 is INFERRED from headers, not re-proven here — a break-it pass per monster is still the right verification before claiming it closed.

### Worst gaps by wave (horror priority)
- **Wave 1**: best covered (sprites, telegraph identity, bespoke audio voices, dive shadows). No P0 gaps.
- **Wave 2**: best covered. Missing: debug scenarios for extended_warranty, moderator, mosquito, tick (see §6). The mosquito/tick are disease vectors — fine visually (have sprites).
- **Wave 3**: 9/9 sprite-less; signature visuals text-only (reel, ad bar, handles, face). P0.
- **Wave 4/5**: 20/20 sprite-less; stamp/countdown/stamp visuals missing. P0 (Steve's horror core is waves 1–3; waves 4–5 are the endgame payoff — both matter).

## 3. Contest / show visuals
Real presentation layer, VERIFIED:
- contests.js fires `drama('contest', {type})` with announce (2056), cheer (4454), loser (4648, 5248), winner (4979), judging (5709). The methods are real (full-screen announce banner + shake, sparkle rain, desaturation + JUDGING spotlight, confetti hero card, sympathetic dim).
- broadcast.js fires broadcast entry/replay/lowerthird/exit (172, 236, 244, 272) — broadcastFlash dispatcher exists.
- Player contests are choice-based beat sequences (interactive fiction w/ buttons) — presentation = say text + drama banners + audio stings. Villager contests resolve off-screen by design (contestEngine.js — sealed arena, deterministic).
- Gaps: `contestBoo` is NEVER fired (audience boos have zero triggers). The `contestAnnounce`/`contestCheer` kinds fired from game.js (trial offer, fan unboxing, cooking demo) are the silent-drop bugs in §1 — those moments currently play no visual.

## 4. System / milestone moments
- **Wave unlocks** (`waveUnlockBeat`, game.js:27036): text-only System narration + villager reaction lines (added 2026-10-12). NO flash/shake/heroCard — the escalation moments don't feel televised.
- **Scale transitions** (hierarchy.js): played beats with real-cost choices (Regional Dawn, national court beats, "The Watchers") — text/say only. ZERO drama calls in hierarchy.js. Design says transitions must be FELT ("a moment, not a threshold"); currently they read, not land.
- **Table sequence** (table.js + table-<path>.js): say-text scenes only; ZERO drama calls across all 8 table files. The galactic table — the ending's centerpiece — has no dedicated visual.
- **Endings** (14): text epilogues only (INFERRED from table*.js having no drama calls; epilogue rendering is text).
- **Succession**: playerDeath/newLife drama fire from ledger.js (701, 839) — fade to black + soul wisp + "THE STORY CONTINUES" / bright emergence. Covered.
- **Feast climax** (feastBuff.js): say-text buff only; no celebration visual (and `celebration` is one of the 5 orphaned JSON defs).
- **System arrival** (day 7): checkSystemArrival — has audioEvent + beats (not fully traced for drama; integration pulse fires on level-up, game.js:7844).

## 5. Audio note (context only — sibling auditor owns audio)
Drama↔audio sync exists: DRAMA_AUDIO_MATES in drama.js maps kinds → Game.audio voices (E1, wired 2026-10-07). app.js documents ~91 audio voices incl. per-monster batch-1 voices and wave-2 voices (understudy, landlord, heckler, paparazzo). VFX gaps above are visual-only findings.

## 6. Debug scenarios (src/js/debug-scenarios.js)
- Wave 1: 15 scenarios (full coverage).
- Wave 2: 11 scenarios (missing: extended_warranty, moderator, mosquito, tick). Scenario ids use working titles (e.g. 'motivationalspeaker' spawns heckler) — cosmetic confusion only.
- **Waves 3, 4, 5: ZERO debug scenarios.** None of the 29 sprite-less signature monsters can be spawned from the debug menu.
- No VFX/drama showcase scenarios (no scenario fires drama effects for visual QA).
- Loadouts exist for wave 1–3 builds (lines 1709-1742).

## Prioritized gap list

### P0 — horror-critical monster VFX
1. **29 wave 3/4/5 monsters have no SVG sprites** (9+10+10, VERIFIED). They render as emoji — the horror core reads as pictograms. Worst: The Callback (needs a dead villager's actual face), The Redactor (needs edge-handles for its telegraph), Ad Break (needs the glyph + progress bar), The Finale (needs the title-card/countdown visual), The Cancellation (needs the descending stamp).
2. **fieldFights.js has zero drama calls** — villager-vs-monster fights (Steve's "real fights" law) have no hit/death/enrage visuals. The wisp+lootSparkle death moment doesn't play when a villager lands the kill.
3. **`alienHeavyHit` silently dropped** (encounters.js:2730) — monster heavy strikes have no impact VFX; the obvious fix is routing it (or firing `shake`/`hit`).
4. **Signature mechanics are text-only**: Spool's reel, Ad Break's progress bar, Buffering excepted (afterimages render). The "telegraph honesty" repair made cues truthful — the visuals still don't exist.

### P1 — milestone moments
5. **Wave-unlock beats are narration-only** — no flash/shake/heroCard for The Final Draft / Mirror Draft / Producers arrivals.
6. **Scale transitions have no dedicated visuals** (hierarchy.js: 0 drama calls) — Regional Dawn, national courts, The Watchers are played but not *felt*.
7. **Table sequence + 14 endings are text-only** (table*.js: 0 drama calls) — the endgame centerpiece has no visual identity.
8. **Silent-drop fixes**: route `contestAnnounce`/`contestCheer` (game.js:22074, 21778, 21903) and `weatherShift` (game.js:22209) — four call sites whose visuals never play (likely intended as `drama('contest',{type:...})` / `drama('weather',...)`).
9. **Debug scenarios**: add wave 3/4/5 monster scenarios (Steve: "Create proper debug scenarios"); fill wave-2 gaps (extended_warranty, moderator, mosquito, tick).

### P2 — nice-to-have
10. **Monster movement teleports** on the combat grid; only the player glides. `data-ent` stable keys exist — wire fighter gliding.
11. **dramaEffects.json is dead**: `renderEffect` never called; decide — delete the registry or wire it. The 5 orphaned defs (celebration, dawnBreak, duskFall, harvestGlow, mourning) are unreachable by any path.
12. **Dead dispatcher branches** `ambush`, `commentary`, `exclaim`, `text`: `ambushWarning` is a built, unreachable red-vignette — either fire it from ambush declares or remove.
13. **Contest `boo` never fires** — audience boos have no trigger.
14. **Emoji doubling**: 📼 (Nostalgia/finale_opening), 📺 (ad_break/finale_crew) — violates the no-doubling law once sprites land.
15. **Player-only `hit` starburst**: villager strikes and player-vs-human strikes fire no impact VFX.
16. Dawn/dusk day-part transitions have zero visual treatment (orphaned `dawnBreak`/`duskFall` defs hint this was planned).

## Open questions for the coordinator / Steve
- The wave 3–5 "copy-only mechanics" repair: telegraph honesty spot-verified on 2/26 monsters; a full break-it honesty pass per monster is still owed before the debt is declared closed.
- Whether the 4 silent-drop drama kinds and 4 dead branches should be fixed by routing (likely one-line each) or removed — audit-only, no changes made.
- monsters.json holds 59 ids; docs/MONSTER-WAVES.md says "monster count now 56" — doc is stale (minor).
