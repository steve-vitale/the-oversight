# Day 7 cinematic soft-lock + 2 sibling debug-panel bugs — 2026-10-12

## Bug 1: Day 7 System-arrival cinematic soft-lock (URGENT, browser-verified)

**Symptom (live build 1116214d-20261012-013218):** launching the `day7` debug
scenario plays the cinematic ("Day 7. Dawn. The sky glitches... Then — a
voice. Behind your eyes.") but the "…hello?" advance button renders as 3–5
overlapping duplicates and NO click advances. The System never arrives,
integration stays 5%, the run is stuck.

**Root cause (src/js/app.js `systemArrivalAnimation`):** the cinematic is
launched from `expeditionScreen()` (which runs on EVERY `refresh()`), guarded
only by `Game.state.systemArrived && !Game.state.systemAnimationShown` — and
`systemAnimationShown` flips solely in the finish callback. So every refresh
while the cinematic played appended ANOTHER full-screen overlay. Each overlay
rendered `<button id="b-arrival-next">`; `document.getElementById` returns
only the FIRST, so exactly one (buried, invisible) button got a click handler
and the 3–5 visible ones were dead.

**Fix:**
- Re-entry guard: `if (document.querySelector('.system-arrival-overlay')) return;`
  before appending — one cinematic at a time, no matter how many refreshes fire.
- Scoped button lookup: `overlay.querySelector('.arrival-next')` — no
  document-wide id at all (the `id="b-arrival-next"` is gone).
- `finish()` now removes ALL `.system-arrival-overlay` elements, so a stray
  from an older build can never trap the player.

**Proof:** `scripts/test-day7-softlock-20261012.js` — 4 static-analysis
assertions on the function (guard present, no document-wide id call, scoped
lookup, finish removes all). All 4 correctly FAIL on pre-fix code (red check
via `git show HEAD:src/js/app.js`), all pass post-fix. (drama.js note: the
cinematic lives in app.js, not drama.js — app.js is DOM-only so a live-DOM
repro isn't possible headless; the static proof plus the browser re-test
below is the verification.)

## Bug 2: debug "Kill foes" — no corpse

**Symptom:** the cheat zeroed `m.hp`/`m.alive` and called `tbEndCheck()`, but
never entered the death pipeline — no corpse, no carcass, no loot-as-action.

**Fix (src/js/app.js `q('#dbg-kill').onclick`):** each cheat-killed monster now
goes through `Game.registerDeath({...})` exactly like a strike kill does
(game.js ~30080), stamping `m._deathCorpse` so `tbKillRewards` →
`corpseForKill` lands meat/loot on the body.

**Proof:** same proof script — cheat-killed hushwolf spawns a monster corpse
with grid position and marks codex `slain` (node harness, seed 20261012).

## Bug 3: "🌊 W1 Fighter" loadout mid-combat teleport

**Symptom (browser):** applying the loadout mid-combat teleported to Haven and
dropped the fight. Code reading found no teleport in the apply path itself
(`LOADOUTS.w1_fighter.apply` touches only inventory/equipped/stats/abilities;
node repro confirms no map/fight disturbance).

**Fix (src/js/debug-scenarios.js `Game.debugApplyLoadout`):** defensive
snapshot/restore of combat-critical state (`tbfight` identity, `map.px/py`,
`scholar.mx/my`) around `l.apply()` — the invariant "loadout application
never teleports mid-combat" now holds structurally, whatever a loadout does.

**Proof:** same proof script — `debugApplyLoadout('w1_fighter')` mid-combat
preserves the exact `tbfight` object and map position, still equips the spear;
then ALL loadouts applied mid-combat, each preserving fight + position.

## Regressions
- `scripts/test-day7-softlock-20261012.js`: 29/29
- `scripts/test-corpses.js`: 37/37
- `scripts/test-corpses-loot-20261006.js`: 6 pass / 9 fail — IDENTICAL on
  pristine HEAD (pre-existing, ontology drift, untouched by this fix)
- `scripts/test-debug-scenarios.js`: 80 pass / 4 fail — IDENTICAL on pristine
  HEAD (pre-existing)
- `scripts/test-combat-break-softlock-20261008.js`: 9/9 HELD

## Still needs Steve's eyes
The Day 7 arrival cinematic is a feel-critical moment — please play the `day7`
scenario on the phone build and tap through all beats ("…hello?" → "…what?").
Commit carries `[needs-eyes]`.
