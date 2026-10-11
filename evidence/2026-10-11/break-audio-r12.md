# Break-it: AUDIO SYSTEM r12 (2026-10-11)

Target index 9 (audio). No audio-specific canon doc exists in docs/
(CANON.md table confirms) — no canon invented; all judgments are code-vs-code.
This run attacked FRESH ground: 15 commits landed on top of this morning's
audio run (persistence r11, survivalist r7, socialite, camps, counters r16,
explorer, contests r15, social r13, forager, knowledge r4, food r5).

## Attack surface mapped
- Engine: `CombatAudio` IIFE in src/js/app.js (242 registered voices, all
  synthesized Web Audio, zero audio assets in the repo). Dispatch:
  `Game.audioEvent(name, data)` -> `Game.audio[name](data)` (try/catch,
  silent no-op on unknown — game.js:27122). Second dispatch:
  `G.encAudio(name)` in encounters.js (`this.audio[name]` + fallback map).
  Third: `_cxBeat(name)` in contests.js (lazy-registers composed beats on
  first fire; unknown names no-op by design).

## CATCH 1 — dead internal synth `boom()` + lying comment (DEAD-CODE, fixed)
`function boom()` (app.js, 36 lines) had ZERO callers anywhere in src/js.
2026-10-06's "Audio deepening pass 3" deliberately replaced it with
`impactWild()` as `impact()`'s fallthrough — but left `boom()` behind, its
comment still claiming "this is still the fallthrough for patterns nobody
claimed." Dead for 5 days. Removed per the dead-alias precedent (9 wrappers
removed this morning); `node --check` clean.
Proof: new census script section 9c sweeps all 259 internal synth functions
for zero-callers (comments stripped — a comment mention is not a call);
`boom` was the only hit.

## Attacks that HELD (solid notes)
- EXPLOIT — CombatAudio IIFE touches zero game state (only `document`
  for the deliberate beamFlash screen-flinch, `localStorage` for mute
  persist, `window.AudioContext`). `audioEvent('constructor')` resolves to
  Object — called harmlessly, no state access; names are code literals /
  config values, never user input. `humRise` clamps stacks to 4
  (`Math.max(1, Math.min(4, ...))`, verified in code); heartbeat/telegraph
  restart-before-start (idempotent, no interval pile-up). Mute toggle has
  zero side effects beyond gain + localStorage.
- SOFTLOCK — heartbeat/charge/sweep/hum all terminate in `combatEnd`;
  r11's load()/tbBarrierExit() fixes re-verified green
  (test-audio-stuck-loops.js 17/17). Sustained-handle audit of all 242
  voices: only combatStart/telegraph/heartbeat start intervals (all
  stopHeartbeat-guarded, all cleared by combatEnd); beamSweep's {set,stop}
  handle cleared by beamSweepStop + combatEnd. No awaits on audio anywhere.
- HONESTY — full re-census at HEAD: 200 literal fire names, 60
  monsters.json *Audio cues, 7 drama mates, 76 contest beat parts, 68 phase
  `beat:` declarations, all 44 contests' 176 `_cxB`-generated beat names,
  encAudio fallback map, wound+temperament dynamics — ALL resolve, zero
  silent. The 3 new `animalButcher` fires (food.js) sit in butchering code —
  right context. Runtime smoke: every voice no-throws with
  (undefined)/({})/rich-data against both a throwing AudioContext and a
  recording stub; the only zero-node voices are the 6 legitimate controls
  (beamSweepStop, combatEnd, humBreak, heartbeatStop, toggleMute, isMuted).
  Mute button label follows `isMuted()` live; master gain ramps on toggle.
- DEAD-CODE — zero dead registered voices (every voice named by some
  dispatch path); zero dead internal synths after the boom() removal;
  `Game.audio = CombatAudio` still wired at load; no orphaned audio assets
  (none exist — all synthesized).

## Sibling sweep
Same bug class ("dead audio code left behind by refactors") swept across the
whole IIFE: 259 internal functions, 242 registry voices — clean. Also
repaired `scripts/test-audio-complete.js`, which this morning's wrapper
removal had left broken (`A.ensureAudio()` no longer exists; CONTROL set
listed removed voices; stale boom() comment). Now 321 pass / 0 fail.

## Proof
- `scripts/test-audio-census-r12-20261011.js` — static registry census:
  ALL GREEN (would have FAILED on boom() before the fix via section 9c).
- `scripts/test-audio-voices-r12-20261011.js` — 242 voices × 3 arg shapes ×
  2 hostile contexts: ALL GREEN; zero-node + sustained-handle reports.
- Regressions: test-audio-stuck-loops.js 17/17, test-audio-wave3-census.js
  green, test-audio-wave3-voices.js green, repaired test-audio-complete.js
  321/321, ontology 63/63.
- No `[needs-eyes]` — dead-code removal + test work only; no player-facing
  feel change.

## Verdict
Audio held everywhere except one 5-day-old corpse. Removed, proof-tested,
registry clean. System keeps its "solid" note.
