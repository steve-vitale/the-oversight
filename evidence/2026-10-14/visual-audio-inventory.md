# Visual / audio / feedback inventory

*2026-10-14, read-only research for the presentation pass.*


The game already has a lot of feedback. There are about 300 synthesized sound hooks, about 50 drama.js effects and 284 SVG sprites. The weak spots are three things:
- **Nothing visual or audible before day 7.** Every drama.js effect (and the sound tied to it) is switched off until the System arrives.
- **The biggest progression moments are log text only.** The ascension ceremony, keepsake flashbacks and god-path abilities have no visual effect and no sound.
- **The look doesn't match what was decided.** Tile art is "Minecraft-bright", while the decided pre-System look is an earthy terminal.

### 1. Art direction as decided
- **Steve's own words on visuals:**
  - "Start simple, but it would be cool if as you progress, the game graphics and interface keep getting better and better." (docs/DECISIONS.md:498-508)
  - The ladder in that entry, Stage 0 to 4: terminal with emoji map → annotated (Codex marginalia) → 16×16 pixel entities → pixel arrival vignettes → full tileset "only if earned". Stages advance on Codex depth plus days survived, never on timers.
  - "graduate beyond strictly text illustrations to pixels or better, *at some point*", with a solo-dev finishability constraint (docs/OPEN-QUESTIONS.md:17-25). The staged path there, "the terminal aesthetic IS the art direction", is an agent proposal, not law.
- **System interface (DECISIONS.md:110):** before the System arrives, a "grounded terminal (earthy greens/ambers, monospace grit)". After it arrives, "the System overlay slides OVER it — cold blues/whites, too-clean geometry, rounded corners that feel wrong". It never replaces the survival UI. The hunger meter stays the biggest element "(a visual joke about priorities)". "Occasional glitches reveal untranslated alien script underneath."
- **Codex marginalia (DECISIONS.md:380):** "warm human handwriting-style notes, visually distinct from the cold System overlay".
- **Directives:**
  - "One mobile screen. 'I kinda hate changing views.'" (DIRECTIVES.md:22)
  - "Visual scope stays finishable by a solo-dev team. Art investment follows validated interest." (DIRECTIVES.md:29)
  - "Two-minute readability… where am I, what do I need most, what are my options?" (DECISIONS.md:144)
- **Other constraints:**
  - Phone target is 390×844 (tools/mobile-sim.html). `#app` max-width is 520px (main.css:21).
  - The art is effectively "zero image assets": icons only. Audio, however, is **not** zero-asset (see section 3).
  - Cold open: "black screen, terminal lines" (DECISIONS.md:340).

### 2. Sprites and rendering
- **Technique:** SVG and DOM only. There is no game canvas. The one canvas is the monster flash at app.js:100-158.
- **sprites.js** (1126 lines) holds 284 inline SVG strings, all `viewBox 0 0 32 32`, flat vector with hand-picked hex colours. They are vector shapes, **not pixel art**.
  - Contents: about 37 plants (with a taxonomy fallback `CHAINS`/`ROOTS`, sprites.js:858-925), about 110 items, and monsters as `_calm`/`_aggro` pairs (`monsterSprite`, sprites.js:927).
  - Villagers are generated procedurally by `villagerSprite(v)` (sprites.js:963) from skin tone (6), clothing pools (4×4), age and gender, plus about 30% "monster echo" accessories.
  - Mythic god forms come from `MYTHIC_SPRITES` in godhood.js:868, 11 SVGs.
  - **Titans have no dedicated sprites**: finale, nielsen and herald reuse their monster SVG scaled to 72px (main.css:1594-1601).
- **Detail grid / fight grid:** `renderDetail` (app.js:17462).
  - A fluid 9×9 grid of `.cell`s, each `calc(100%/9)` wide, so about 40px on a 390px phone.
  - Cells mix emoji glyphs (`CELL_GLYPH`/`PLANT_GLYPH`) with SVG sprites (plantsprite, treesprite, csprite, vsprite).
  - Fight telegraphs are CSS classes on cells: beamLane, dozeLane, pepBurst and so on, with keyframes in main.css.
- **Titan fights:** 12×12 (`gridSize`, game.js:29604; `_gridN`, app.js:17508).
  - Turned on by `body.titan-fight` (app.js:15778). The 12×12 cells are about 30px.
  - The player gets a gold `player-spotlight` outline (main.css:1603).
- **World map:** `renderMap` (app.js:18214) draws a 9×9 world in an overlay opened from the compass (app.js:15840), so it is a modal rather than a second view.
  - Each tile is a cached 64px SVG mini-scene from tile-scenes.js `svgFor`. It has 16 terrain palettes, `TILE_BASE` at tile-scenes.js:37, labelled "TRUE MINECRAFT PALETTE… Not dark terminal".
  - Fog of war is a blank square `#0d120d`. No monsters are shown on the map.
- **Movement:** move-anim.js (204 lines) runs a FLIP step machine.
  - Step timings are 220ms (stepMs), 140ms (pathMs) and 160ms (blockedMs). The queue is capped at 10.
  - It uses requestAnimationFrame and honours `prefers-reduced-motion` (move-anim.js:180-198).
- **Monster first-contact flash** (app.js:100-158): the monster emoji is drawn on a 32×32 canvas, scaled up pixelated, then glitched with RGB split, slice offsets and scanlines for 1.4s. It plays `horrorSting`.

### 3. Audio
There is a lot of it, and it is real.
- **Engine:** the `CombatAudio` IIFE runs from app.js:2400 to 12837 and is exposed as `Game.audio`.
  - Web Audio, synthesized with oscillators, noise buffers and ADSR envelopes.
  - Routing: buses hb, sfx, music and voice feed master, then a DynamicsCompressor ("the beam must never clip phone speakers").
  - It recovers a dead or closed AudioContext (app.js:2466). The context is created on the first tap.
- **Hooks:** about 309 public hooks in the return object (app.js:12404-12836). They cover:
  - per-monster voices (deer beam set, boar, wolf, heron, hummice, glasswing, sunbasker, moderator, the wave 3-5 signatures)
  - per-pattern windup and impact synths
  - animals, footsteps, `uiSelect`, `levelup` ("soft breathy rise, no fanfare"), `passiveUnlock`, `knowledgeReveal`
  - contest and justice cues
  - `playerDeathSting`, the villager-death bell, `victory`/`defeat` stings
  - `stingWave`, `stingScale`, `stingNightmare`, `stingSuccession`
  - The header comment lists them all (app.js:2254-2399).
  - game.js fires them via `audioEvent(name)`, about 254 call sites.
- **Music:** generative, "Zero assets: everything synthesized" (app.js:12123-12300).
  - Modes: `menu` (a music box), `ambient` (pad plus a rare pentatonic motif, themed haven/wild/wet/ruin with night and danger variants) and `scenario` (contest, table, ending-light, ending-dark).
  - Triggers: menu at app.js:633, the ambient key at game.js:31056, contests at contests.js:1083, the Table at table.js:398/792/845.
- **File-backed audio:** src/audio is 18MB.
  - 203 System narrator MP3s from ElevenLabs, with a manifest (voice-system.js). These play automatically only when `sysSay` text exactly matches a manifest line (game.js:31061-31071).
  - 32 monster signature MP3s marked PLACEHOLDER (audio-registry.js).
  - Animal and weapon placeholder pools.
  - Villager speech is in-browser Piper TTS with lazy voice packs cached in OPFS (voice-piper.js).
- **Settings:** a mute toggle (`oversight_mute`), a master volume (`oversight_vol`) and per-bus sfx/music/voice sliders (app.js:2440-2460, 8563, 8598; the UI is at app.js:14991-15035).
- **No haptics:** `navigator.vibrate` is used nowhere.

### 4. Overlays and effects
- **drama.js** (1895 lines) is an overlay with pointer-events:none that only animates transform and opacity.
  - About 50 effects: hit (L1-L3), floatText, flash, shake, heroCard, soulWisp, critHit, playerHurt, dodgeMiss, contest and broadcast banners, weatherShift, playerDeath ("THE STORY CONTINUES"), newLife, abilityLevelUp, 10 ability signatures plus pool fallbacks, and knowledge reveals.
  - 13 keyframes are injected through a `<style>` at drama.js:1719.
  - Everything goes through the `Game.drama(kind…)` dispatcher (game.js:22711-22840). It scales with System integration level and syncs sound through `D.audioFor`.
  - **The dispatcher returns early if `!state.systemArrived`** (game.js:22718), so days 1-6 have no drama visuals at all.
- **System arrival:** `systemArrivalAnimation` (app.js:13919) plays staged beats from `Game.systemArrivalBeats()`, advanced by tapping.
  - CSS: a black overlay, a cyan `skySplit`/`crackGrow` crack, `.system-window` boxes, flickering `textFlicker` text, and a gold kicker (main.css:553-620).
- **After the System arrives:** `body.system-live` adds cyan borders and glow to cards, sheets, buttons and the announce bar (main.css:955-975). The sun/moon dial switches from a hand-drawn dial to a precise cyan chronometer (app.js:180-206).
- **Broadcast mode** (broadcast.js): a TV frame with entry and exit cards, a lower third, a ticker and a replay.
- **Sheets:** `openSheet/updateSheet/closeSheet` keep a priority queue (app.js:2050-2090). Sheets can be modal or non-dismissible and use the `sheetup` animation.
- **Toast:** plain text, 2.4s (app.js:160).
- **Log:** `#log` with `.sys` (cyan), `.bad` and `.good` (main.css:57-61).
- **CSS:** main.css (1620 lines, 35 keyframes) plus an inline `<style>` in app.js:18024 (13 keyframes).
- **Colour tokens:** only 9 in `:root` (main.css:1-11): bg #0a0f0a, ink #c9d6c0, acc #9ae66e, warn, bad, sys #6ec8e6, and a few more. Hundreds of hex values are hardcoded elsewhere.
- **Font:** the system monospace stack only (main.css:16). There is no handwriting font for marginalia and no font for the alien script.
- **Theme:** dark only. There is no `prefers-color-scheme` rule.

### 5. Key moments: what the player gets now
| Moment | What they see | What they hear |
|---|---|---|
| Combat hit/crit/miss | `drama('critHit'/'hit'/'dodgeMiss')` (game.js:31859, 32977); `playerHurt` when damage ≥5 (33414), but **only after day 7** | `monsterHurt`, pattern impacts, heartbeat during telegraphs |
| Level-up, pick 1 of 3 | `levelUpSheet`: modal, non-dismissible, buttons only (app.js:14082); `drama('levelUp')` on ability levels (game.js:22547) | Quiet `levelup` (game.js:1907) |
| System arrival, day 7 | The cinematic above | **No sound or voice wired into the cinematic**, though matching sys-day7 MP3s exist (only debug plays them, debug-scenarios.js:1905) |
| Ascension ceremony | `ceremonyBeats` are 5 **log lines** plus `broadcastStart('ascension')` (godhood.js:708-765); godpath.js abilities only `say()` text | No ceremony-specific sound |
| The Table | `tableSheet`: a plain modal with option buttons (app.js:14035) | Table, ending-light or ending-dark music bed |
| Titan fights | 12×12 grid, spotlight, enlarged sprite | No titan-specific sound or effects (no drama or audioEvent calls in titans.js or table.js) |
| Wave arrival | Purple flash, shake 10, log lines (game.js:28928) | `waveUnlock` plus `stingWave` |
| Player death / mantle | `drama('playerDeath')` (ledger.js:764), `newLife` (914), lineage list on the ending screen (app.js:18690) | `stingSuccession`, `playerDeathSting` |
| Keepsake flashback | `say('◈ FLASHBACK — …')` log line only (progression.js:445) | None |
| Feast | Inline card `renderFeastInline` (app.js:16531) plus log lines | No drama or sound in feastBuff.js |
| Scale-ups (national) | Hero card, gold flash (hierarchy.js:2447) | `stingScale` |

### 6. Performance and accessibility
- **Animation loops:** requestAnimationFrame only runs in move-anim, the monster flash and drama spawn. There is no persistent render loop, and the music scheduler is a `setInterval` lookahead.
- **Caching:** tile scenes are cached per tile (`_sceneCache`).
- **Reduced motion:** honoured only in move-anim.js:198, main.css:265 and 400, and app.js:18099 and 18157. **drama.js has no reduced-motion guard**, so shake, flash and starbursts always play.
- **Zoom is blocked:** the viewport meta sets `user-scalable=no, maximum-scale=1.0` (index.html:5).
- **Tiny type:** 11px or smaller appears about 31 times (main.css and app.js inline), including 9px.
- **Contrast:** `--dim` #6b7f62 on #0a0f0a is about 4.3:1, borderline for small text.

### 7. Running locally and reaching each moment
1. From the repo root, start a static server. `python3 -m http.server 8000` should work; the JSON is fetched, so `file://` won't.
2. Open `http://localhost:8000/?debug=1`. `?region=<id>` picks the landing region for a new game (app.js:18745-18748).
3. The service worker caches builds (sw.js), so use an incognito window or DevTools "Bypass for network".
4. Run a scenario from the 🐞 panel (categorised), or from the console with `Scattering.Game.debugScenario('<id>')`. Audio needs one tap first.
5. Headless screenshots: Playwright is installed, with Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. `scripts/fast-screenshot.js` points at the missing `/opt/meta-chromium/chrome` and a remote URL, so it needs its path changed.

Scenario IDs (debug-scenarios.js:2150-2330):
- `day7`: System arrival
- `headlight`: deer beam, the best combat showcase
- `bulldozer`, `hummice`, `glasswing`: other combat showcases
- `w5finale`, `w5nielsen`, `w4herald`: titan monsters; the 12×12 grid should apply via `isTitan`, but I didn't confirm this in a browser
- `milestoneWave`: wave beat
- `mantle`: death and succession
- `keepsake`: flashback
- `takenhome`, `overtime3`, `network`: the Table and endings
- `vfxShowcase`: effects board
- `contestPit`, `broadcastShow`: contest and broadcast
- `scaleNational`: scale-up
- Sound checks: `musicMenu`, `musicAmbience`, `musicStingers`, `audioSystem`, `audioWaves`

**No scenario exists** for the level-up sheet, the godhood ceremony or a feast. For those, use the panel's grant buttons (`dbg-grant`, `dbg-ab`) or call `Scattering.Godhood.recognitionCeremony(Game, id)` directly.

### 8. Gaps and ugliest spots
1. **Days 1-6 are silent and still.** The drama gate (game.js:22718) removes all hit and hurt feedback in early combat, which is the first impression. Only the CSS telegraphs and the log remain.
2. **Ascension, keepsake flashback, feasts and god-path powers have no effects or sound.** These are the god-path project's own payoff moments, and they are log lines only (godhood.js:743, progression.js:445, godpath.js:282-440).
3. **The look contradicts what was decided.**
   - tile-scenes uses a saturated "Minecraft" palette (tile-scenes.js:37-40) against the "earthy greens/ambers" terminal.
   - Sprites are smooth vector rather than the "pixel entities" in the ladder.
   - System chrome uses square cyan boxes, not "rounded corners that feel wrong".
   - The "untranslated alien script" glitch and the marginalia handwriting don't exist.
4. **The titan CSS contradicts itself.** Its comment says "Same 9x9 grid… never bigger" and is then overridden by a 12×12 block (main.css:1575-1620). Titans also have no bespoke sprite, sound or effects.
5. **The Table and level-up are generic modal sheets.** The run's climax looks like an inventory popup (app.js:14035, 14082).
6. **The day-7 cinematic doesn't use the 203 ElevenLabs System lines** that already exist for it.
7. **Styling is spread across three places** (main.css, app.js:18024, drama.js:1719) with only 9 tokens and hundreds of raw hex values, which makes theming or a palette pass costly.
8. **Accessibility:** no reduced-motion guard in drama.js, zoom disabled, 9-11px text, no haptics.
9. **Placeholder audio:** 32 monster signature MP3s are flagged PLACEHOLDER (audio-registry.js), and the raccoon and turtle animal pools are documented gaps.