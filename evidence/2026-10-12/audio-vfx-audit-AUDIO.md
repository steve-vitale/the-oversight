# Audio/SFX Audit — The Oversight
**Date:** 2026-10-12 · **Auditor:** audio-vfx-audit (AUDIO) · **Scope:** read-only, worktree `~/workspace/worktrees/audio-vfx-audit` (branch audio-vfx-audit, master base 5eeae46f)
**Canon check:** docs/CANON.md lists no audio/voice canon doc — audio has no registered canon. (Closest: voiced-dialogue greenlight 2026-10-11 in MEMORY.)

**Method:** grepped all of `src/js/` for `audioEvent('…')` literals (245 distinct fired names), extracted the 245 exported `Game.audio` methods from `src/js/app.js` (CombatAudio IIFE), cross-referenced fired-vs-registered including all dynamic dispatch paths (`tbAggroAudio` via `cfg.aggroAudio`, `_cxBeat`/`CX_BEAT_DEFS` compositions, `D.audioFor` drama mates, `encAudio` fallback, dynamic `'wound'+wcap`), checked `src/data/monsters.json` (59 entries) for per-monster audio config, and diffed `src/audio/system/manifest.json` (203 entries) against the files on disk and against all callers of `Game.playSystemLine`. VERIFIED = grepped/ran; INFERRED = stated as such.

---

## 1. Central audio system — YES, it exists (VERIFIED)

- **Registry:** `Game.audio` = `CombatAudio` IIFE in `src/js/app.js` (~lines 2176–11860). **245 registered synth functions**, all Web Audio API, all synthesized, zero audio assets.
- **Dispatch contract:** `Game.audioEvent(name, data)` (`src/js/game.js:28875`) → calls `Game.audio[name](data)`; **silent no-op when the name isn't registered**. This is by design ("optional hook"), but it makes missing voices invisible — 46 such names fire today (see §2).
- **Master chain:** hbBus + sfxBus → master → DynamicsCompressor (phone-speaker seatbelt). Mute: title-screen 🔊 toggle, persisted as `oversight_mute` in localStorage.
- **Voice routing:** `Game.audio.playVoice(blob)` / `stopVoice()` / `isMuted()` / `toggleMute()` — Piper TTS and System MP3s share the same bus, mute, and gesture unlock (`Game._voiceUnlocked` flips on first pointerdown/keydown; both refuse before).
- **No assets anywhere in the SFX path** — everything is synthesized oscillators/noise. No `playSound`/`.play()` sample players in game code.

## 2. Fired events vs registered voices (VERIFIED)

| Metric | Count |
|---|---|
| Distinct literal `audioEvent('name')` fired across `src/js/` | 245 |
| Registered `Game.audio` synths | 245 |
| **Fired but UNREGISTERED (silently no-op)** | **46** |
| Registered but never fired, not a beat part, not dynamically fired ("dead") | 7 |
| `CX_BEAT_DEFS` contest beats (lazy-registered compositions over 78 registered parts) | 198 keys |

### The 46 silent names (all VERIFIED fired, none registered, none in CX_BEAT_DEFS)

**sigW4.js — 10 (wave-4 signature moments, all silent):**
`congregationInvite` (:169), `congregationGeas` (:149), `congregationAbsolve` (:176), `influencerRecruit` (:340), `auditTax` (:393), `eaterGorge` (:658), `eulogyVerse` (:566), `reunionMirror` (:442), `strikeDemands` (:267), `strikeShutdown` (:273)

**sigW5.js — 30 (wave-5 signature moments, all silent):**
`cxDescend` (:174), `cxFall` (:210), `cxOffScript` (:958), `cxRenewed` (:985), `edContradict` (:1049), `edCut` (:303), `edJam` (:291), `edRetrieve` (:1031), `edStrip` (:275), `fiDeclare` (:678), `fiSacrifice` (:1215), `fiTitleCard` (:692), `niCamera` (:1180), `niWatch` (:630), `nnApply` (:824), `nnBadApply` (:840), `nnBadFed` (:761), `nnBadNote` (:1235), `nnNote` (:765), `nnRead` (:1254), `rrClap` (:394), `rrMessage` (:1081), `spAnnounce` (:486), `spAsk` (:1113), `spCheap` (:1142), `spFulfilled` (:448), `spManifest` (:466), `tsHighlight` (:575), `tsOwn` (:1161), `tsReschedule` (:564)

**finale-campaign.js — 5 (finale campaign beats, all silent):**
`fiBadNote` (:623), `fiEncore` (:524), `fiPartTwo` (:514), `fiRedPen` (:591), `fiScript` (:607)

**game.js — 1:** `walkout` (:33069) — union_rep WALKOUT tactic (untargetable 3 turns, allies buffed). Silent.

These were composed by wave-4/5/finale workers who fired `audioEvent` hooks into a registry nobody extended — the same class of debt as the wave 3–5 "copy-only signature mechanics" rupture (alignment synthesis): **the hooks exist in game logic, the voices were never composed.**

### Dead synths — registered but never fired (VERIFIED, 7)
`boarCharge`, `boarNotice`, `droneBeam`, `ducksQuack`, `heronStrike`, `modDown`, `stagCharge`.
Notable: the HOOK CONTRACT comment (`app.js:2178`) documents `boarNotice()` (combat start) and `boarCharge()` (China-Shop Charge resolves) as "Implemented 2026-10-06" — the synths were built but **never wired**; the boar's declare and charge-resolve moments are silent (only `boarTrample` on a missed charge fires, `game.js:28584`, and `boarSnort` as aggroAudio). `droneBeam` was composed as "the machine beam" (review_drone/memory_projector) but nothing fires it — the wave-2 machine monsters telegraph silently except generic pattern dispatch. `modDown` ("deplatformed", moderator suite) never fires.

**Corrected false positives (VERIFIED live via dynamic paths, NOT dead):** `patternWindup` fires through drama `phaseShift` (`drama.js` DRAMA_AUDIO_MATES → `game.js:21398`); `woundCunning/woundDesperate/woundEnraged` fire via dynamic `'wound'+wcap` (`game.js:30904`); `animalPanic` fires via `encAudio()` (`encounters.js:1787+`); 12 names (boarSnort, glasswingBuzz, heronUnfold, etc.) fire dynamically as `aggroAudio` through `tbAggroAudio`.

## 3. Monster audio per wave (VERIFIED via monsters.json encounter.aggroAudio + registry)

**Wave 1 (15 monsters): all 15 have bespoke, registered aggroAudio.** Deep sets: Highbeam Deer (10 voices: notice/aggro/snort/telegraph/impact/sweep/blocked/down + heartbeat), boar (snort live; notice/charge dead), hushwolf (silence/snarl/break), white_noise_heron (unfold live; static/strike — `heronStrike` dead), hummice (swarm instrument: notice/rise/break), speedbump_turtle (snap/bunker/flip), mirror-adjacent stag (snort live; charge dead), glasswing (circle/dive/land/climb/shadowClose + aggro buzz), sunbasker (charge/break/flatten/bite + shimmer), nightlight_catfish (lure/snap/still), belltoad (chorus/croak/stun), lockpick_raccoon (chitter/grab + fingers), gallowdeer (aim), mirrormoth (flash), nevermore (climb/croak/land/strafe), nightcourt (climb/land/silence + turn), ducks_in_a_row (lineUp/march/nip/regroup/screech/squeak + quackCut). Plus ~14 generic prey-animal beats (kill/hiss/snort/rustle/stalk/pant/rattle/spray/butcher/quill/honk/yowl/charge/tailSlap/whistle/flush).

**Wave 2 (15 monsters): all 15 have bespoke, registered aggroAudio.** voice_mimic_radio→staticCry, mirror_stag→stagSnort, review_drone→droneHum, bright_idea→eurekaTick, memory_projector→projectorHum (+fire/pull/static/break), warranty_caller→lineCut, understudy→understudyWatch (+copy/perform/rehearse), landlord→landlordClaim (+evict/spread), heckler→hecklerLaugh (+headliner/jibe/pileOn/taunt), paparazzo→paparazzoShutter (+exclusive), union_rep→unionBullhorn (+picket/repWhistle/walkout-picket — but `walkout` silent), moderator→modNotice (+noted/mute/violation/removal/shadow; modDown dead), statickite→kiteUnfold (+broadcast/climb/hum/mark/transmit), giant_mosquito→mosquitoDive (+whine/drink), alien_tick→tickLatch (+click/release).

**Wave 3 (9: redactor, gavel, focus_group, spool, chorus_line, terms_of_service, callback, buffering, ad_break): ZERO aggroAudio.** Their encounter configs use the same framework keys as wave 1/2 (fifo, noticeRange, phases, telegraphGate…) minus `aggroAudio`. Their signature modules (sigW3a/b/c) fire 19 events, all registered — so signature moments have sound, but the **declare/notice voice moment has no monster identity**: `tbAggroAudio` returns silently with no `aa`, and the generic `telegraph` pattern synth plays instead.

**Wave 4 (10): ZERO aggroAudio** (8 with configs lack the key; `herald` has `encounter` as a plain string, no config at all). Plus the 10 silent signature events from §2.

**Wave 5 (10): ZERO aggroAudio** (`finale_crew`, `finale_opening` have no encounter config at all). Plus the 30 silent signature events from §2.

**Worst horror gap (VERIFIED):** `game.js:31757` — the pain-switch path fires `cfg.aggroAudio || 'deerAggro'`. Every wave 3–5 monster with no aggroAudio (i.e. all of them) **bellows like the Highbeam Deer** when you hurt it mid-fight and it retargets. The wave-1 signature horror sound is the default voice of all 29 late-game monsters — an identity collision and a knowledge-gating leak (it sounds like a deer it is not). Meanwhile their actual declare path (`tbAggroAudio`, `game.js:32614`) stays silent by design. So late-game monsters are silent on approach and deer-voiced when wounded — exactly backwards.

## 4. src/audio/ structure (VERIFIED)

- **Only directory:** `src/audio/system/` — 203 MP3s + `manifest.json`. 14MB total. **All 203 manifest entries resolve to files on disk (0 missing).**
- **Formats:** MP3 only. No other formats, no monster SFX assets (SFX is 100% synthesized Web Audio — by design per comments).
- **Loading:** lazy. `voice-system.js` fetches `src/audio/system/manifest.json` once, then fetches each MP3 as a blob on first play, cached in-memory per session (`_blobCache`).
- **Offline/PWA wiring gap (VERIFIED):** `sw.js` ASSETS pre-cache list contains NO audio files, NO voice-piper.js, NO voice-system.js; the fetch handler does runtime network fetch without caching into the cache. Offline, the debug sound-check breaks and (once wired) System lines would too. 14MB of MP3s are network-only.
- **Manifest kinds:** inventory 139 (dialogue lines inventoried from game.js code text, each with `inventory_ref` like `game.js:19572 #1`), cultural 20, aimockery 13, silly 12, dark 10, aifriend 7, special 1 (`sys-the-sound`), claude 1 (`claude-lastwords`).
- **Line↔code drift (INFERRED, spot-checked):** manifest text is the speakable form (emoji stripped vs game.js text, e.g. day-7 line). If game.js lines were edited after the MP3s were generated, voice and text diverge — no drift check exists. Not verified systematically.

## 5. Voice modules — what landed vs what's wired (VERIFIED)

**voice-piper.js (procedural villager TTS) — LANDED and WIRED:**
- `Game.convoSpeakLine(vid, text, opts)` called at `conversation.js:905` — every NPC dialogue beat is spoken in the speaker's deterministic voice (profile from person record: sex/age/temperament + id hash; same villager always sounds like themselves). Also `alienPlayers.js:618` — alien persona combat banter is voiced.
- Piper ONNX/WASM via `@mintplex-labs/piper-tts-web`, voice packs lazy-loaded per speaker into OPFS (never in base bundle); Web Speech API fallback; foreign-language lines never voiced ("if you don't know, it doesn't show"); emoji/markdown stripped (`voiceCleanText`); gesture-unlock + mute gates inside.
- Default: ON once packs are cached, off before (never surprise-downloads). Title-screen 🗣️ toggle (`app.js:613,715-728`).
- Debug scenarios exist: `audioVillager`, `audioPersona` (Steve 2026-10-11 "two taps, in-fiction").

**voice-system.js (ElevenLabs fixed System lines) — LANDED as a player, NOT WIRED to gameplay:**
- API landed: `Game.playSystemLine(id)`, `Game.systemLineEntry`, `Game.systemLineIds`, `Game.systemAudioManifest`. Statuses: muted/locked/no-audio/unknown/error/playing. Playback through `Game.audio.playVoice`.
- **Callers of `Game.playSystemLine` in real game code: ZERO.** The only callers are `debug-scenarios.js` (`audioSystem` plays sys-day7-01, sys-silly-11, sys-dark-10; `audioClaude` plays claude-lastwords + sys-the-sound).
- **No game.js text-line sites reference any `sys-*` id.** The day-7 System arrival cinematic (`game.js:20093`, "HELLO! 🎉 Oh good, you're all still here! What a WEEK!") plays **text-only with zero audio** — no horrorSting on the sky glitch, no `playSystemLine('sys-day7-01')`. The single biggest scripted milestone in the game is silent.
- So Steve's question "all lines being used/discovered?" → **No. 203 curated ElevenLabs lines are generated, shipped, and playable only from the debug sound-check. None are discoverable in gameplay.**

## 6. Combat/UI/milestone coverage — what's silent that shouldn't be (VERIFIED)

**Wired and working:** telegraph/impact per-pattern dispatch, heartbeat, round tick, meleeHit, miss, monsterHurt, monsterDown, wound tempers, victory, combatStart/combatEnd, levelup, passiveUnlock, knowledgeReveal, synergyDiscovered, waveUnlock, foundHaven, statusApplied/statusCured, contest beats (44 contests via CX_BEAT_DEFS; participate/refuse choice beat; end/die/refuse Resolve beats), drama audio mates (8 kinds), System cooking/trader/trial/liar-confront beats.

**Silent gaps:**
1. **Villager death** — `registerDeath` (`corpses.js:147`): zero audio. Steve: deaths hit hard; the village-as-protagonist game has no death sound for its people.
2. **Non-combat player death** — `ledger.playerDeath` (`ledger.js:580`): zero audio (starvation, disease, expedition, pit trap). Combat-loss 'lost' fires `defeat`; everything else is silent. Death is the central roguelite beat.
3. **Day-7 System arrival** — no audio at all (§5).
4. **Wave 4/5 + finale signature moments** — 45 silent events (§2).
5. **union_rep `walkout`** — silent (§2).
6. **Wave 3–5 monsters** — no declare voice; deerAggro fallback on pain-switch (§3).

**By design (not gaps):** 'ambush' pattern windup silent (turtleSnap is the resolve); glasswing dive silent (`app.js:2303`, Steve 2026-10-08); boar… no, boarNotice/boarCharge were *meant* to be wired (contract comment) — dead, not by design.

## 7. Prioritized gap list

**P0 — silent horror-critical events:**
1. 45 wave-4/5/finale fired-but-unregistered events (sigW4.js ×10, sigW5.js ×30, finale-campaign.js ×5) — the entire late-game signature audio vocabulary is silent. Needs an audio sibling pass composing registry voices (like the contest-synths worker did for bespoke beats) or CX_BEAT_DEFS-style compositions.
2. Pain-switch `|| 'deerAggro'` fallback (`game.js:31757`) — 29 wave 3–5 monsters bellow like the Highbeam Deer. Needs per-wave fallback identities or silence until real voices exist.
3. Villager death silent (`corpses.js:147`) and non-combat player death silent (`ledger.js:580`).
4. Wave 3–5 monsters have no `aggroAudio` at all — the declare/notice moment (the horror beat) has no monster identity.

**P1 — missing assets/wiring:**
5. 203 ElevenLabs System lines generated but unwired — `Game.playSystemLine` never called from gameplay; day-7 cinematic is text-only. Needs event→line mapping (the manifest already has `inventory_ref`s pointing at the code sites).
6. Dead synths that were meant to be wired: `boarNotice`, `boarCharge`, `heronStrike`, `stagCharge`, `droneBeam`, `modDown`, `ducksQuack` — either wire or delete.
7. `walkout` (union_rep WALKOUT) silent.

**P2 — nice-to-have:**
8. SW offline: `src/audio/system/*.mp3` (14MB), `voice-piper.js`, `voice-system.js` not in ASSETS and not runtime-cached — offline PWA loses all voice.
9. Manifest↔game.js text drift check (MP3s mirror code text; edits since generation diverge voice from text).
10. No audio canon doc in docs/CANON.md — the hook contract (`app.js:2178`), the `audioEvent` silent-no-op semantics, and the "fired-but-unregistered = silent" footgun are exactly the kind of standing rules that keep getting violated; worth registering.

**VFX note (for the sibling auditor):** audio and VFX co-fire centrally — `game.js:21397-21398` calls `D.audioFor(kind)` once per drama visual so "call sites never fire both"; drama.js has 8 audio-mated kinds and a comment listing quiet-by-design kinds. Monster telegraphs pair `warnCells` grid visuals with `telegraph()` audio. The 46 silent audio events above also imply their paired drama moments play visually without sound.
