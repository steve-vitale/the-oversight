# Audio sound-check board — 2026-10-11

Steve: "We probably need some debug scenarios that allow me to make sure that these different areas where audio is supposed to kick in actually does."

## What was built

**`src/js/voice-system.js`** (new, @ontology system `voice-system`): the first
and only code that reads `src/audio/system/`. `Game.playSystemLine(id)`:
- Loads `manifest.json` once, resolves the entry's `file` to an app-root URL.
- Fetches the MP3 as a blob (cached per id) and plays it through the EXISTING
  `Game.audio.playVoice` — same bus, same master-gain mute, same gesture
  unlock as Piper voice. No new audio graph, no new unlock flow.
- Gates (mirroring voice-piper.js): muted → `'muted'`; pre-gesture →
  `'locked'` (never autoplay before unlock); unknown id → console warn +
  `'unknown'`, never throws; no `Game.audio` → `'no-audio'`.
- Statuses resolve as a promise: `muted | locked | no-audio | unknown | error | playing`.

**Deliberate decisions:**
- The 🗣️ settings toggle is NOT a gate. That toggle is about Piper TTS
  downloads ("never surprises the player with a download they didn't ask
  for"); System MP3s are bundled assets. Mute + gesture gates apply.
- Multi-line sequences stagger via `setTimeout` because `playVoice`
  supersedes (never queues speech behind speech).
- Foreign-language voicing untouched — `voice-piper.js` foreign-skip intact,
  `voice-system.js` contains no foreign logic (asserted in proof C1).

**Four debug scenarios** (`debug-scenarios.js`, category `🔊 Audio — sound check`):
- `audioSystem` — "🔊 Sound check: System voice": day-7 state, plays
  sys-day7-01 → sys-silly-11 → sys-dark-10, ~9s apart. "The System is
  calibrating its voice. Stand by."
- `audioVillager` — "🔊 Sound check: villager voice": 2 villagers adjacent;
  prompt to tap one and Talk (convoSpeakLine fires automatically).
- `audioPersona` — "🔊 Sound check: alien persona voice": reuses the real
  `alienEncounter` path, plus the voice prompt.
- `audioClaude` — "🔊 Sound check: the Claude scenes": `claude-lastwords`,
  then `sys-the-sound` 32s later. "Two separate events."

## Proof

`scripts/test-audio-check.js` — **22/22**:
- A1–A8: manifest loads (203 ids); real MP3 bytes reach `playVoice`
  (blob size == disk size); blob cache (no re-fetch); unknown id warns;
  muted/locked = zero fetch; no-audio robustness; fetch failure = 'error'.
- B1–B5: all four scenarios run via `Game.debugScenario(name)`; audioSystem
  calls the 3 ids in order; audioClaude calls claude-lastwords then
  sys-the-sound; villagers placed; all four listed + categorized.
- C1–C2: foreign-skip untouched; ontology validator passes (75 systems).

Regressions: debug-scenarios 80 passed (4 failures pre-existing on clean
master — language-scenario tests, unrelated); voice-piper 29/29;
voice-personas 86/86.

## What Steve still needs to do (phone)

Audio cannot be HEARD headless — the proof covers plumbing only. On the
phone, open the debug panel → `🔊 Audio — sound check` → run each scenario:
1. System voice: three lines, ~9s apart.
2. Villager voice: tap a villager → Talk (🗣️ toggle on; first tap unlocks).
3. Persona voice: threaten/fight in the encounter.
4. Claude scenes: last words, then — much later — the whistle.
