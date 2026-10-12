# Audio / Dialogue / VFX Audit — The Oversight (2026-10-12)

Steve's ask: "Are sound effects and dialogs in play? All lines being used/discovered? Any missing? … better audio on a lot of the monsters … in a similar boat still with the visual effects on monster, in contests and shows and for the system/crucial milestones. Please identify and address all gaps. Create proper debug scenarios."

Three auditors ran in parallel; their full reports are:
- `audio-vfx-audit-AUDIO.md` — SFX inventory vs wiring
- `audio-vfx-audit-DIALOGUE.md` — dialogue reachability + knowledge gating
- `audio-vfx-audit-VFX.md` — monster/contest/milestone visuals

This file is the consolidated finding + what was built.

## What's in play

- **SFX are in play.** `CombatAudio` (Web Audio synth, src/js/app.js) has 284 registered voices; drama mates fire in sync with visuals; wound-dynamic voices, encounter fallbacks, contest beat parts all resolve.
- **Dialogue content is fully reachable.** Knowledge-gating holds (monster naming, justice, foreign lines). Villager voice (Piper TTS) is wired but OFF by default — opt-in 🗣️ toggle. Design call for Steve, not changed.

## The gaps found (all addressed unless noted)

1. **System voice was a dead pipe.** 203 ElevenLabs MP3s / 14MB shipped; `Game.playSystemLine` had zero non-debug call sites. The day-7 cinematic played text-only. → **FIXED**: `sysSay()` now resolves exact line text → manifest id via `Game.systemVoiceIdFor()`, fires `playSystemLine()` fire-and-forget; `Game.preloadSystemVoice()` from `newGame`; voice gated on System arrival (caught a real bug: lines fired pre-arrival). Exact-match design quarantines the `sys-the-sound.mp3` licensing blocker — it can never voice. Proof: `scripts/test-system-voice-wiring-20261012.js` 17/17 (RED-verified: pre-fix, 0 sysSay paths reached the registry).
2. **45 fired-but-silent audio events** (sigW4.js ×10, sigW5.js ×30, finale-campaign.js ×5) — hooks fired into a registry nobody extended. → **FIXED**: 23 new synths in app.js + documented closest-voice aliases (hecklerLaugh precedent). Post-fix census: 0 silent.
3. **Worst horror gap**: all 29 wave 3–5 monsters had no `aggroAudio`; the pain-switch path made every late-game monster bellow like the Highbeam Deer when wounded. → **FIXED**: `aggroAudio` for all 29 in monsters.json (wave 3 → existing signature voices e.g. redactor→redactorPoint; wave 4/5 → new synths or fitting existing).
4. **Silent deaths**: villager death (registerDeath) and all player deaths (ledger.playerDeath) had no audio. → **FIXED**: `villagerDeath` (guarded, once per death, person/villager kinds), `playerDeathSting`.
5. **VFX drops**: `alienHeavyHit` called but undefined (dropped); `contestAnnounce`/`contestCheer`×2/`weatherShift` called with wrong kind (dropped/kind-mismatch); wave unlocks, scale transitions, and the table sequence had zero dedicated visuals; field fights had zero drama/audio calls; `walkout` silent. → **FIXED**: new `D.alienHeavyHit`; call sites corrected; `waveUnlockBeat` gets flash+shake+waveUnlock audio; `_fireRegionalDawn` gets flash+integrationPulse+audio; national transition gets heroCard+flash+trialFanfare; field-fight villager kills fire monster death audio; `ducksQuack` wired to regroup; `walkout`→`unionWalkout`.
6. **29 wave 3–5 SVG sprites missing** (emoji only). → NOT FIXED — big art job; recommend a dedicated sprite worker.

## Debug scenarios (all PLAYED, postconditions asserted)

34 new scenarios, all run in the node harness via `scripts/test-audiovfx-scenarios-20261012.js` — **242/242 green**:
- 4 wave-2 gap monsters (warranty_caller, moderator, giant_mosquito, alien_tick)
- 9 wave-3, 10 wave-4, 10 wave-5 monster encounters (wild nodes ≥2 from Haven, monster 3 tiles east — two taps to the fight)
- `audioWaves` — staggered wave-4/5 signature-voice sound board
- `vfxShowcase` — alienHeavyHit, flash, shake, heroCard, contestAnnounce on the grid
- `milestoneWave` — the wave-4 unlock beat played with sound

## Honest remaining gaps

- 29 wave 3–5 SVG sprites (art job; sprite worker recommended).
- Table sequence + 14 endings still text-only visually.
- `contestBoo` never fires.
- SW precache missing audio/voice files (offline PWA loses voice).
- 64 orphan 'new' System lines need Steve's curation approval before any fire path.
- `sys-the-sound.mp3` licensing blocker — quarantined by exact-match design; do not wire.
- NO ElevenLabs generation was done this session (Steve's rule: no speculative generation without his line-list approval).
- Pre-existing test drift NOT mine: `test-drama-audio-20261007.js` 51/26 (identical on pristine base); `test-drama-registry-20261007.js` hardcodes a main-tree backup path; census "dangling phase beat" (stillness/witnesses/system/change/price) is a regex over-match of godhood.js ceremony beat names on the base.

## Commits

- System voice wiring + 23 synths + aggroAudio + death audio + VFX fixes (this worktree, [needs-eyes]).
- Debug scenarios + proof tests (this worktree, [needs-eyes]).
