# sim-killbeat — companion wave-3+ killing-blow beat (2026-10-19)

Run: 20261019T0215Z · loop oversight-flesh-out-loop · axis scale-onramp
Arm: small game-code blank-fill (documented fiction blank, not a lever experiment).

## The blank
The watchline run's sense-testing filed it: companion wave-3+ killing blows
pass silently — e.g. Patrick's d140 wave-4 Congregation kill landed via
'companion' attribution (the tricktag system) with the kill in waveKillLog
and telemetry, but the fiction never noticed. If veterans are the product —
the readiness VETERANS bar counts exactly these kills — the village should
notice the kill.

## Canon read first
- docs/CANON.md, docs/MONSTER-WAVES.md (wave law, villager XP law, readiness
  VETERANS bar), docs/SYSTEM-VOICE.md (voice bible).
- Conventions lifted from existing code, not invented:
  - `disp()` (betrayal.js): 'you' for the scholar, else displayName — the
    descriptor stays intact, never a first-name split.
  - `monsterNoun()` + `articlePhrase()` (game.js, playtest deepening r18):
    sentence-safe gated monster names — "put down the missing piece of the
    world" / "put down The Redactor".
  - "put down" is the established kill diction (convoTopics, killer tale).
  - "veteran" is established fiction (work-crew beats, game.js:6052).
  - The 📺 SYSTEM tag is arrival-gated (identifyPlant's voice gate) — the
    overlay never speaks first pre-arrival.
  - Witness reactions follow the waveDropVillagerReactions pattern:
    uniform pick (Steve's rule), temperament buckets, present-tense, no
    fabricated shared history.
  - Cosmetics on a DEDICATED mulberry32 stream (sim-taletell convention) so
    the beat can never perturb game RNG / off-on seed comparisons.

## Design decisions (made, Steve can overrule)
1. Hook point is `recordWaveKill` — the per-kill choke point (player TB,
   villager field fights, contests all flow through it). The beat fires only
   when `via === 'companion' && wave >= 3`, with a defensive scholar
   exclusion. via='companion' is stamped only by the TB tricktag path
   (game.js `_tbKilledBy`), so scholar kills and monster-on-monster kills
   never take the branch.
2. No duplicate fire by construction: recordWaveKill is called once per kill
   (the TB loop dedupes by snake lineage; every other caller is
   single-call). No suppression state added — a day-keyed guard would hide
   real repeat kills (same companion, two of the same type, one day).
3. The System announces it — the show is televised, so the broadcast IS how
   the village notices. The line names the mechanic the readiness bar
   counts: "That's a veteran kill, folks. REMEMBER the name."
4. The witness is preferred from the live fight (sanity-checked: the killer
   must be in this.tbfight, so a stale fight object from a non-TB record
   path can't name the wrong witness); fallback is any living non-scholar
   roster villager.
5. Exception-guarded throughout: a beat bug never breaks the kill path
   (ledger, codex, unlock check).
6. The pyrrhic path (lost fights → recordPyrrhicKill) deliberately does NOT
   get the beat: the village learns together via the codex/villageSlain
   channel there, and the fiction beat is for the scholar's witnessed fight.
7. `[needs-eyes]` on the commit: feel change Steve should see on his phone.

## The beat, as the player sees it (sense-tested, real transcript)
```
📺 SYSTEM: "Oh — OH. Everybody saw that, right? Gabriel just put down The Redactor... on CAMERA. That's a veteran kill, folks. REMEMBER the name."
Erich: "That's the story we tell at the fire."
```
Pre-arrival (L0 knowledge), the same words land without the tag and
nothing leaks:
```
Oh — OH. Everybody saw that, right? A person, maybe 60s, with calloused knuckles just put down the missing piece of the world... on CAMERA. That's a veteran kill, folks. REMEMBER the name.
```
Sense verdict: the System's voice is on-brief (wrong-timing punctuation —
"Oh — OH.", "... on CAMERA."; caps on the wrong word — "on CAMERA",
"REMEMBER the name"), the companion is named by the full disp convention
(Gabriel post-arrival; intact descriptor pre-arrival, never truncated to
"A"), the monster is knowledge-gated (true name post-arrival, unknown
descriptor pre-arrival), and the witness reacts in present tense with no
fabricated history. The beat sits naturally in the fight feed next to
existing villager flavor ("Sam watches, jaw tight.").

## Proof: scripts/test-killbeat-20261019.js — 19 passed, 0 failed
RED/GREEN on the beat's trigger, driven through the FULL TB path
(`_tbKilledBy` stamp → tricktag via='companion' → recordWaveKill →
companionKillBeat), seeded, one harness:
1. Beat fires on instrumented companion wave-3 kill (tele
   'companion_kill_beat' ×1; System line names companion + monster;
   waveKillLog entry via='companion', by=<companion vid> — tricktag
   attribution intact).
2. Never fires on scholar kills (via='player').
3. Never fires on wave-1/2 companion kills (hushwolf).
4. Fires exactly once per kill (second kill → exactly one more tele event
   + one more System line); witness reaction line present.
5. No knowledge leak pre-arrival: true name absent, unknown descriptor
   composed ("the missing piece of the world"); companion named by full
   disp descriptor, never truncated; words land without the 📺 SYSTEM tag.

## Guardrail suites
- `node scripts/check.js --quick`: 96 passed, 1 failed — the failure is
  scripts/test-sprites-valid-20261014.js (216 sprite checks: sunback /
  sweeps_week / cliffhanger calm/aggro). Verified PRE-EXISTING: the test
  fails identically (1556 passed, 216 failed) on pristine HEAD with my
  change reverted via patch round-trip (never stash on the hot tree).
  Unrelated to this narration change; left for its owning loop.
- `node scripts/check-wired.js` convention: companionKillBeat is called
  from recordWaveKill in game.js — wired, not orphaned.
- Grep-verified: exactly one `disp` definition (betrayal.js, no late-module
  collision); 'companion' via originates only at the tricktag site.

## Convergence note
Scale-onramp axis: this arm fills a fiction blank on the veteran
pipeline (the thing the readiness bar is trying to produce), not a
balance lever. No lever thresholds, no before/after sims — nothing to
converge; status: landed.

## Metric review
No pre-registered metric: this run is a blank-fill, not a lever
experiment. The natural follow-up metric (do companion wave-3+ kills get
noticed in long sims — tele 'companion_kill_beat' counts vs waveKillLog
companion.w3+ entries) is proposed for the next sim-bearing run, not
scored here.
