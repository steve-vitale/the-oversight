# DIALOGUE + VOICE AUDIT (audio-vfx-audit) — 2026-10-12

Read-only audit. Branch in this worktree: `audio-vfx-audit` (not master).
Nothing modified; nothing committed. Every claim below is marked
**VERIFIED** (grepped/traced in this worktree) or **INFERRED**.

Scope: every dialogue line/tree definition (src/js/convo-*.js,
src/js/conversation.js, dialogue-bearing src/data/*.json), System voice
(src/js/voice-system.js + src/audio/system/), villager voice
(src/js/voice-piper.js), SFX (CombatAudio in src/js/app.js). Docs read:
docs/CANON.md, docs/CONVERSATIONS.md. Foreign-language handling was left
alone per the deferral.

---

## 1. INVENTORY

### Dialogue code (all in src/js/)

| File | Lines | What it holds |
|---|---|---|
| conversation.js | 5963 | Engine: startConvo, convoTurn (base), buildMenu, sayLine (emission choke point), nvOpen/nvRespond, transcript ledger |
| convo-wants.js | 1787 | 16 WANTS: food_share, water_haul, snare_mend, watch_shift, stay_close, heal_help, sick_help, forage_help, share_news, ask_favor, repay, seek_comfort, warn_you, curious, just_company, seek_taken |
| convo-dialogue.js | 687 | dlg: turn handlers (wraps Game.convoTurn in a chain of wrappers) |
| convo-beats.js | 483 | beatOf, bridgeLine, beatMenuResponses, convoTurn wrapper |
| convo-scene.js | 394 | getScene, resolveConsequence, validateAskContract, convoWhatsAlive |
| convo-mood.js | 245 | mood init/band/receptivity/shift/flush/beat |
| convoTopics.js | 780 | Generated topics (topic2*): identity+run-state composed, incl. live-event 'lately' (naming debate, mourning, threat, hunger…) |

dlg: handler ids (convo-dialogue.js): askwhy, cant, comfort, commit, details,
doubt, empathize, heed, help, invite, more, react, renounce, stay, subject,
theorize — 16 total. Every dlg: id emitted by any menu in
convo-beats.js/conversation.js/convo-wants.js (askwhy, cant, comfort, details,
doubt, empathize, help, invite, more, react, renounce, subject, theorize,
heed, commit, stay) has a handler. **VERIFIED: no unhandled dlg: choice id.**

### Dialogue data (src/data/)

| File | Content | Consumer |
|---|---|---|
| characterGen.json → `convo` | 36 questions, 59 openers, 12 exits (warm/gentle/bold), 20 exhausted, 10 silence, 13 jokeReacts, 11 agreeReacts, 18 goalFollow, 48 pastFollow, 48 plansFollow, 10 reopeners, 11 winddowns | conversation.js (startConvo/convoTurn/buildMenu) |
| arrivalText.json | 9 tile types × texts (regionOverrides: 0) | game.js:10111 arrivalTextFor ← 9924 |
| justiceVoice.json | confrontation: murder/attack/theft/generic; summons: fallback/heat/refused/silence; 43 leaf templates | justice.js:292-298, 436 (justiceVoicePick) |
| foreignSpeech.json | 25 languages × 11 slots each | conversation.js:5425/5572/5712 (nvRespond/nvOpen) |
| alienPlayers.json | 8 personas (Vex Marlowe, Countess Sable, Rax "The Dentist", Pip Quindle, Sarge, Dr. Fenwick, Wren, Old Tam) — ~18-21 lines each except Wren (6, benevolent non-combatant by design) | alienPlayers.js + voice hook at :618 |

### Voice

| File | Lines | Status |
|---|---|---|
| voice-piper.js | 346 | Piper TTS (ONNX/Web Speech fallback), 4 voice packs (en_US ryan/lessac/amy/kristin), deterministic voiceProfileFor |
| voice-system.js | 93 | ElevenLabs MP3 player: Game.playSystemLine(id) → manifest.json → blob → Game.audio.playVoice |
| src/audio/system/ | 203 MP3s, 14MB, manifest.json with full texts | all 203 files present; 0 manifest-without-file; 0 file-without-manifest |

Manifest composition: **139 inventory** (text inventoried from real game code,
138 distinct inventory_refs) + **64 'new'** (written fresh for the batch,
never existed as game text: cultural 20, dark 10, aimockery 13, aifriend 7,
silly 12, special 1, claude 1). Evidence: evidence/2026-10-11/system-voice-batch.md.

### SFX

src/audio/ contains ONLY system/. Combat/game SFX are synthesized Web Audio
in the CombatAudio IIFE (src/js/app.js:2351+, assigned Game.audio at :11858):
heartbeat, combatStartHit, beamCharge/beamFire/beamSweep, deerCall/deerSnort,
glasswing/belltoad/eureka vocalizations, impactWild, humBuild, shout, etc.
**VERIFIED: sound effects are synthesized and in play** (not MP3 assets —
there are no sfx audio files, by design).

---

## 2. REACHABILITY

### REACHABLE (VERIFIED)

- **Whole conversation engine**: app.js:12235 and :12503 call Game.convoTurn;
  startConvo → convoOpening (conversation.js:3878 → convo-beats.js:97);
  sayLine is the single emission choke point (convo-dialogue.js header rule).
- **All 16 wants**: the picker iterates `Object.keys(WANTS)` (convo-wants.js:1351);
  every want is selectable; ask_favor.pick returns 0 with no real need (contentless
  favors structurally impossible); seek_taken (the Taken/KIN want) is in the loop.
- **All 16 dlg: handlers** wired to menus (see inventory above).
- **topic2 topics** consumed at 6 call sites in conversation.js (1079, 1118,
  2326, 2378, 2581, 2783, 3450).
- **justiceVoice**: both sections consumed; gating in code — "unwitnessed crimes
  never reach the voice layer" (justice.js:215-218).
- **foreignSpeech**: nvOpen/nvRespond consume; convoSpeakLine returns
  'foreign-skip' for foreign beats (voice-piper.js) — deferral honored.
- **arrivalText**: arrivalTextFor → tile flavor (game.js:10111).
- **alienPlayers lines**: intro/escalation/defeat/help lines consumed by
  alienPlayers.js; spoken via convoSpeakLine('ap:'+pid) at :618.
- **Villager voice**: sayLine → convoSpeakLine for every NPC beat
  (conversation.js:902-905), plus persona combat banter. **Wiring is real.**

### DEFINED BUT UNFIRED — the headline gap (VERIFIED)

**`Game.playSystemLine` has ZERO non-debug call sites.** Grep across
src/ + index.html finds only:
- src/js/debug-scenarios.js:1243 (audioSystem: plays sys-day7-01, sys-silly-11, sys-dark-10 on timers)
- src/js/debug-scenarios.js:1267-1268 (audioClaude: claude-lastwords, sys-the-sound)

No game code (game.js, contests.js, safetynets.js, table-*.js, etc.) calls
playSystemLine, systemLineEntry, systemLineIds, or systemAudioManifest. **The
entire 203-file / 14MB ElevenLabs System voice asset set never fires in real
play.** The System still speaks as TEXT (sysSay) exactly as before; the audio
layer is a dead pipe outside debug scenarios.

Corollaries:
- The 139 inventory MP3s duplicate text the game emits — but the game emits it
  silently. sysSay has ~230 call sites across 11 files; the 139 MP3s cover
  ~138 of those sites. Roughly half of System speech sites have no MP3 at all.
- The 64 'new' lines (culture/dark/ai-mockery/friend/silly/claude/the-sound)
  have NO in-game text twin and NO fire path — an orphan audio set. Only 5 of
  the 203 lines are reachable even in debug (the two debug scenarios above).
- Coverage holes: only sys-wave-01..03 (wave 1-3 announces); waves 4-5
  (built 2026-10-11, post-inventory) have no wave-announce MP3s. sys-relay-02
  exists but no trigger. Only sys-table-* 01-10 for the whole galactic table.
  **INFERRED**: post-inventory game text was never inventoried.

### ORPHANED (VERIFIED)

- `Game.voiceLine` — referenced defensively in convo-beats.js:185 and
  convo-wants.js (typeof check) but never defined anywhere. Benign (optional
  seam), not broken.
- The 64 'new' System lines: orphaned audio with no game text and no trigger.
- `SYSTEM_VOICE_SEAM` status in voice-piper.js still says 'pending' — the seam
  it reserves is actually filled by voice-system.js; the comment is stale.

---

## 3. SYSTEM VOICE: text / MP3 / fired / quality

| Question | Answer |
|---|---|
| System lines as text | ~230 sysSay call sites + pools; fully in play (TEXT) |
| Which have MP3s | 139 inventoried sites + 64 new = 203 |
| Which fire in-game | **None** (debug-only) |
| Text quality | Curated register (unhinged Claptrap-like), manifest texts readable |
| Audio quality | **NOT VERIFIED** — cannot listen in this environment |
| Steve approval | Batch report documents generation; **no record found** of Steve's pre-generation curation/approval for the 64 new lines, despite his standing rule ("curate and approve ALL System lines for quality/funniness BEFORE generating — never regenerate paid lines"). Flag as unverified. |
| Licensing | **BLOCKER (from the batch report itself)**: sys-the-sound.mp3 layers Aztec-death-whistle recordings from zmescience with no clear redistribution license. The report says: swap for the CC0 Freesound recording (Guy_Personface 832472) before ship; manual step, needs Freesound login. **No evidence the swap happened** (only mentions are the batch report + audio-check.md confirming the debug scenario plays it). |

Batch hygiene notes (from the report): sys-feed-05 deliberately uses a
knowledge-gated-safe variant ("coins that chime wrong") so the fixed line
never leaks pre-reveal; third-person framings adapted to first person;
narration-only sentences dropped; P3/mechanical/numeric lines skipped as
unvoiceable. The audio build respected knowledge-gating.

---

## 4. VILLAGER PROCEDURAL LINES: is Piper actually speaking?

**Wired and real, but off by default.** convoSpeakLine gates, in order:
off → muted → locked (pre-first-gesture) → empty → foreign-skip. The 🗣️
toggle (app.js:613, painter at voice-piper.js) defaults to opacity .25 = off;
voiceEnabled() returns true only if localStorage 'oversight_voice'==='1' OR
packs already cached in OPFS. So: a player who never taps 🗣️ never hears a
villager. In the node sim harness the network import is never attempted
(VERIFIED: loadTts rejects when no document), so sims are always silent —
transcript evidence is the only audit surface there.

Practical consequences:
- First heard line falls back to Web Speech API while the ~63MB pack
  downloads in the background (ensureVoicePack per speaker packId).
- Deterministic profiles (voiceProfileFor is pure, no Math.random) — same
  villager always sounds like themself. VERIFIED by reading the function.
- Emoji/markdown stripped before speech (voiceCleanText). No emoji doubling.

**Answer to "are dialogs in play":** dialogue CONTENT is fully in play as
text. Voiced dialogue exists, is genuinely wired to every NPC beat, but is
opt-in and off-by-default; most players will never hear it.

---

## 5. KNOWLEDGE-GATING (discovery coverage)

Audited against "if you don't know, it doesn't show":

- **Monster naming law**: convoTopics.js:245 — naming debate surfaces as the
  live-event 'lately' topic when monsterNamingActive(); lines use the
  descriptor until the village agrees (villageName), never the true name.
  Grep of all convo-*.js: zero hardcoded monster true names. **VERIFIED clean.**
- **Warning want** (convo-wants.js:1595): references codex.monsters presence
  only when entries exist; otherwise generic "something is moving out there."
  No true-name leak. **VERIFIED.**
- **justiceVoice**: gating in code (unwitnessed crimes never voice).
  Templates condition on close/wary/bold/seriousType only — no knowledge leak
  by construction (the section is reached only for witnessed crimes).
- **arrivalText**: flavor text, no gated knowledge.
- **No missing dialogue flagged as required**: naming debate, mourning names
  (firstRef, knowledge-gated per viewer), taken-kin (seek_taken), guilt,
  threat, hunger, cheer, gratitude — all have live topics. One soft spot:
  the naming debate appears only as a 'lately' topic while a debate is active;
  the ACT of proposing a name must happen elsewhere — check that path exists
  before assuming the debate is reachable. (Beyond this audit's grep range;
  flagged as INFERRED-unverified.)

---

## 6. SENSE-TESTING (Steve's law: want → engagement → resolution)

Moment 1 — **Moot, day 27** (real fired transcript, journey-social-life-r6-20261012.json):
> Sofia stands. "They EAT people. I don't care how hungry the road made them. No."
> The moot turns to you. Your vote matters here — and everyone will remember it.
> ... Carmine counts on their fingers, twice. Then, to the fire: "1 for taking them in. 7 against."
> The moot votes no. June nods like they expected it. "Thanks for the fire, anyway." They walk.
> Word will travel: Haven is clean hands. (Opinion +2 with every village that knows you.)

Want: petitioners want refuge; Sofia wants exile. Engagement: your vote, in the
open, remembered. Resolution: 1-7, consequence travels to other villages.
**Sensical. Passes the bar.** (cannibalism → CORRUPTION.md canon; handled.)

Moment 2 — **Villager opener, Emma Larsen, day 1** (real fired transcript):
> "Hey." Emma settles near you, not too close. "Day one. Everyone's pretending
> they're fine. ...Can we talk? Just talk — like people used to."
> ... "Everyone's choosing sides and pretending they aren't. I hate it."
> ... "What's your first memory? Like, ever. The earliest thing."

Want: just_company → curious (they ask YOU: the question IS the beat).
Engagement: "Go on." / answering is engagement. The run log: 68 full convos,
60 natural ends, 8 forced — wind-down works. **Sensical. Passes.**
(Transcript shows sim-driven terse "YOU" replies — a sim artifact, not content.)

Moment 3 — **System day-7** (text as fired in-game; MP3 exists but never plays):
> "HELLO! Oh good, you're all still here! What a WEEK! The audience is STILL
> talking about the foraging episode!"
> "So! You're on a show! It's called... we're taking suggestions! The rules
> are simple: SURVIVE! Be INTERESTING!"

Want: calibrate the cast / announce the show. Engagement: none (cinematic —
appropriate). Resolution: show named, rules stated. **Sensical as text; as
VOICE it does not exist in real play** — this is the gap, not the writing.

Caveat: the "claude" arc lines (sys-ai-11..13, sys-friend-01..07,
claude-lastwords, sys-the-sound) are the most ambitious writing in the batch
and the most expensive-sounding asset (layered death-whistle bed). They are
the lines LEAST reachable: only via the audioClaude debug scenario. No in-game
event fires them. **INFERRED** (could not find a Claude-event trigger in src/js).

---

## 7. PRIORITIZED GAP LIST

**P0**
1. **System voice never fires in real play.** 203 MP3s / 14MB + manifest +
   player, zero non-debug call sites. Either wire playSystemLine into sysSay
   emission points (the supersede-not-queue design + stagger is already
   documented in debug-scenarios.js:1240) or acknowledge the assets are dead
   weight. This is the direct answer to Steve's "are sound effects and
   dialogs in play": sound effects yes (synthesized), villager voice wired
   but opt-in, System voice no.
2. **sys-the-sound.mp3 licensing**: unlicensed zmescience bed per the batch
   report; swap not evidenced. Blocks any ship that includes the audio.

**P1**
3. **64 'new' lines are orphan audio** (no game text, no triggers) and have no
   evidenced Steve pre-generation approval, against his standing cost/quality
   rule. Either give them game text + triggers, or delete.
4. **Coverage**: ~half of sysSay sites have no MP3 (waves 4-5 announces,
   later table paths, post-inventory text). Inventory was a snapshot.
5. **Voiced dialogue defaults OFF** (🗣️ toggle, opacity .25). If voiced
   dialogue is a flagship feature, it currently reaches only players who
   discover and tap the toggle. (Design call for Steve — "facilitate", so
   note it, don't change it.)

**P2**
6. **No debug scenarios for conversation threads** — only 4 audio sound-check
   scenarios exist. No scenario drops you into a naming debate, a favor arc,
   a grief/mourning convo, or seek_taken. Steve asked for proper debug
   scenarios; the dialogue layer has none.
7. **Audio quality unverified**: 203 ElevenLabs files never listened to in
   this audit; Claptrap-likeness is a claim from the batch report.
   sys-table-03 was rendered at volume 0.5 (hushed) per direction — correct
   intent, but unverified by ear.

**P3**
8. Stale comment: voice-piper.js SYSTEM_VOICE_SEAM still 'pending' though
   voice-system.js fills the seam. (Comment-only; harmless.)
9. Wren (benevolent helper persona) has empty escalationLines — handled by
   design, but confirm no code path expects non-empty (not audited here).
10. inventory_ref line numbers in manifest.json are stale (code moved since
    2026-10-11) — manifest needs re-inventory before any "which lines" work
    is trusted.

### What is NOT a gap
- SFX: synthesized, wired, in play (heartbeat, beam, deer, monster vocals).
- Dialogue content: all trees/lines reachable, no orphaned dlg: ids, all
  data files consumed, knowledge-gating holds (monster names, justice,
  foreign lines, knowledge-gated-safe variants).
- Piper: genuinely wired to every NPC beat + persona banter, deterministic
  voices, foreign-skip honored.
