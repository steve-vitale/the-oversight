# Journey ENDGAME R15 (2026-10-17) — the failure-downgrade axis, played end to end

**Run id:** 20261017T154336Z (oversight-playtest-loop). Worktree: `journey-endgame`.
**Base:** master@e32fc9ca. **Note:** rotation index was 4 (endgame); advanced to 5 after this run.
Queued by r14's metric review: *"Failure downgrades remain unplayed on real runs — next endgame leg should steer a weak door deliberately."*

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** When a seated run plays its path badly — overreaching on the
build beat (stakeFail), refusing every defiant price — does the failure
downgrade RESOLVE the story end to end (fail beat → smaller doors → weakened
path played → final → epilogue), never wiping the run, with sensical
transcripts? (SENSE-TESTING LAW: read the failure beats, not just counts.)

**Failure instruments** (deterministic, from TABLE.md + `src/data/table-beats.json` stakes; the build option `beat:build` always carries the path's stake):
- feared: b0 'fire' (terror 3: dreadfield 2+1) → b1 'build' needs terror≥4 → stakeFail
- beloved: b0 'funny' (audience 3: spotlight 2+1) → b1 'build' needs aud≥4/5 → stakeFail (light only; dark holds at exactly 5 via plant+2)
- defiant: REFUSE-EVERYTHING variant (r14 carried blank) — grain/noone/tear/notwice; in CASCADE mode the stakefail variant ('half'→'build', dignity 0)
- assimilated: b0 'kitchens' (self 1) → b1 'build' needs self≥2 (light) → stakeFail
- relay: b0 'commune' (merge 1) → b1 'build' needs merge≥2 → stakeFail
- Door 1 plays badly; downgrade doors play COMPETENTLY (drain's normal pick) — the realistic botch-then-recover arc. Seed 8921 ran CASCADE mode (weak driver stays on through downgrades).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 reach: ≥2/4 pilot seeds sit the seat (door offer answered).
- M2 doors: the 7-door offer opens with ≥1 weak-steerable door (feared/beloved/defiant/assimilated) on ≥1 seed.
- M3 play: ≥1 seed completes failure → downgrade → done with zero engine errors.
- M4 people: ≥2 failure transcripts sense-read (fail beat + downgrade beats + epilogue), 0 senseless flags.
- M5 resolved: post-failure the run continues (phase 'done', no wipe, village census real). Crash/softlock = NO-GO.

**Interesting-finding bar:** a full failure→downgrade→weakened-completion arc; the rock-bottom plain ending; the refuse-everything defiant walk; villagers acknowledging a failed table walk; an outshone epilogue.

**Horizon:** DAYCAP=190, death-aware (+10d tail max). **Seeds:** 8911–8918 + 8921 (fresh).
**Policy:** belongseat = withSeatDrive(withWinDefer(tribfloor belongfeast)); TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 + BELONG_V3=1; SEATDRIVE default-ON. The weak driver wraps `chooseTableOption`: door offers → weakest uncovered failure-instrument door (priority feared/beloved/defiant/assimilated/relay); downgrade offers → weakest *offered* door; challenge beats → the weak script above; finals/audit left to the landed drain.

## PILOT

Cascade seed 8921 first (1 seed): 4 distinct failures, no repeats after the fix (see below), beloved/dark completion at weakened 4. The leg's question is very live — expanded to 8 seeds.

## RESULTS (9 seeds)

| seed | mode | door | fails | downgrades | final | won |
|------|------|------|-------|-----------|-------|-----|
| 8911 | cascade* | feared | 1 | relay | relay/grey | ✅ |
| 8912 | recover | feared | 1 | relay | relay/grey | ✅ |
| 8913 | recover | — | 0 | — | village-lost d56 | — |
| 8914 | recover | beloved/dark | 0 (stake held) | — | beloved/dark | ✅ |
| 8915 | recover | feared | 1 | relay | relay/grey | ✅ |
| 8916 | recover | beloved/dark | 0 (stake held) | — | beloved/dark | ✅ |
| 8917 | recover | defiant/light | 0 (refused all) | — | defiant/light | ✅ |
| 8918 | recover | assimilated | 1 | relay | relay/grey | ✅ |
| 8921 | cascade | feared | 4 (feared,defiant,assimilated,relay) | defiant,assimilated,relay,beloved | beloved/dark | ✅ |

\* s8911 ran before the cycle-breaker fix (old wrapper); its 1-fail→1-downgrade→completion arc is unaffected by the fix.

- **M1 reach GO 8/9** (bar ≥2/4). s8913's village died honestly at day 56 (monster expeditions + sickness; death-aware horizon respected — the run stopped, never ticked a dead village).
- **M2 doors GO 8/8.** The 7-door offer opened on every seated run with weak-steerable doors each time (feared×4, beloved×2, defiant×1, assimilated×1).
- **M3 play GO.** Five seeds completed failure → downgrade → done (8911, 8912, 8915, 8918, 8921) with zero engine errors, zero fatal harness errors. Every failure resolved to phase 'done'.
- **M4 people GO** — s8911 (feared→relay/grey), s8921 (4-failure cascade→beloved/dark), s8917 (refuse-everything defiant) sense-read end to end; 0 senseless flags.
- **M5 resolved GO.** No crash, no softlock, no wipe; every failed run's village census is real post-table.

**The arcs, in plain words:**
- s8921 (cascade) is the showpiece: four distinct failures, each with its own honest reason — *"you played your hand before the fear was in the room, and the demonstration underwhelmed. Fear, it turns out, is a wasting asset — spend it wrong and it spends you"* (feared); *"Defiance without the means is just posture"* (defiant); *"the intake scan found what you were carrying before you'd decided what it was, and filed you under furniture"* (assimilated); *"the System quarantined it — kindly, the way you quarantine something you don't want to lose but can't trust. The merge stops one button short"* (relay). Each downgrade offer shrank ([4 doors]→[3]→[2]→[1]) — no repeats after the fix. Beloved/dark held at audience exactly 5 and completed at weakened 4: *"The audience speaks — on cue, on brand, on message... Nobody will ever know if the love was real, least of all you. The ratings are perfect forever."*
- s8917 (defiant, refuse-everything — r14's carried blank, now filled): *"Not one grain."* → *"No one."* → *"You'll have to tear it out."* → *"No." Twice.* → *"Humanity walks — poorer, whole, free... The prices are paid. The door stays ajar."* Then the build coda: *"You came to the Table as the Defiant the hard way: one fight at a time, most of them for someone else. Marwan still wakes before dawn and walks the fence. It's a good fence. It doesn't need walking."* The refusal run WINS on the light road — the priced-freedom fantasy played straight, coherent.
- s8911/s8912/s8915/s8918 (feared/assimilated → relay): the weakened relay completes grey — backfires ("a rival village heard everything for an hour"), a discovery ("the wires humming in tune"), *"Stay both-hands. No merge, no champion."* → *"Rafael Torres walks out of the light alone, which is how he walked in. The village endures. That was always the story."*
- s8914/s8916 (beloved/dark): the build stake HELD (spotlight 2 + plant 2 + funny 1 = audience 5 ≥ 5) — the instrument is honest: a strong-enough build doesn't fail. Completed normally.

**Village assessment (census in plain words):** The 8 table runs ended 6–9 alive with zero scattering; cumulative deaths 19–47 per run (the village recruits; the mantle never passed on a winning run). s8913 is the honest counterpoint: the village came apart at day 56 to monster expeditions and sickness, one survivor (Raul) — the death-aware horizon stopped the sim instead of ticking a corpse.

**People check:** day-80 conversations read as people. Marvin (s8912): fear, grief for Declan ("Declan is gone and the world just... continues. That's the part I can't stand."), the water-tasting ritual, "I've been hoping you'd ask" (a little too quickly) — wants engaged, threads planted. Ruby (s8912) looped on the ask_favor want — investigated: a HARNESS-DRIVER artifact (the driver's dumb first-non-leave fallback kept re-picking the ask instead of the real engage options `dlg:help`/"How can I help?" and `dlg:commit`/"I'll do it", which the engine does offer); the engine's anti-loop lines fired correctly ("I just said — did you miss it?"). Not a game bug. Filed as a driver note, not a fix.

## BLANK FILLED: the downgrade cycle (engine fix, committed)

**The finding:** `tableFail`'s downgrade offer excluded only the CURRENT path, so a run that failed every door could cycle the same doors forever — measured on cascade seed s8921 pre-fix: feared→defiant→assimilated→**defiant**→**feared** (defiant and feared each re-offered after failing). TABLE.md law 4 says failure RESOLVES the story; an unbounded failure loop is silent non-resolution. (A human can usually escape by playing a door well, but the engine must terminate regardless.)

**The fix (worktree, committed):** `src/js/table.js` —
1. `tableScene` resets `T.failedDoors = []` per sitting.
2. `tableFail` records each failed door in `T.failedDoors` and excludes all of them from the downgrade offer; the rock-bottom branch no longer auto-starts an already-failed Assimilated (goes straight to the plain ending).
3. Net effect: at most (earned doors) failures per sitting, then rock-bottom — termination guaranteed, story always resolves.

**Proof:** `scripts/test-table-downgrade-cycle-20261017.js` — RED verified (patch-file revert: second downgrade prompt re-offered the failed door `["downgrade:a","downgrade:c"]`), GREEN on fixed code (prompts shrink [b,c]→[c]→rock-bottom; all-failed run ends plainly with phase 'done', over && won, wiped). Unit suites: table-core ("weakened path still resolves to a real ending"), beloved, defiant, assimilated, ascension (17 passed), endings (61 passed) all green. test-table-feared-20261011's harness error is PRE-EXISTING (fails identically on pristine table.js — its resetAll doesn't clear pg.tableDone; unrelated to this change).

**Second blank (r14 carried, filled, no code):** the refuse-everything defiant run — played, won, transcript above. No change needed (landed-stack behavior is coherent).

**Harness bug found in-run (fixed, documented per AGENTS.md):** the weak driver's downgrade picker computed the weakest door from the full earned set (old `filter(id !== T.path)` logic), DEFEATING the engine's cycle-breaker — the fixed-code cascade still cycled until the picker was changed to choose from the actually-offered `downgrade:*` options. The player can only take an offered door; the harness must respect the offer.

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json`:
- LOUD: `failures` baseline 0 → current 8/9 seeds; `downgrades` baseline 0 → current 8/9.
- **Verdict: EXPLAINED, not a bug.** r15's policy deliberately plays door 1 badly (stakeFail instruments); the cycle-breaker routes every failure through a downgrade. Wins 8/9 (baseline 7/8), table completions and national standing show no LOUD deviation — the failure axis did not dent winnability. Baseline NOT rolled forward (the failure metrics are deliberate-bad-play artifacts, not the new normal).

## METRIC REVIEW (§14)

- M1–M5 all GO. No metric proved wrong; no revision proposed.
- Note for future runs: the build-beat stake instrument is now a calibrated tool — feared/beloved/assimilated/relay stakeFails are deterministic on the stated meters (beloved/dark holds at audience 5 via plant; feared/light never curdles via oathbound — both verified). The defiant stall remains unforceable on strong roads (long-road covers the first stall; pantry ≥ 20k pays honestly) — the refuse-everything variant is the playable defiant probe.
- The rock-bottom plain ending (all doors failed → comfort) is unit-proven but never hit on a real run — a future cascade with an all-light ledger could reach it.

## Reachable / Fun / Winnable

- **REACHABLE:** Yes — 8/9 competent runs reached the table (the one miss died honestly at day 56, pre-table). Failure downgrades are reachable by playing badly on purpose; the engine offers them without prompting.
- **FUN:** Yes — the five failure reasons read as five different small tragedies, each specific to the path's fiction; the downgrade offers shrink honestly; the weakened completions (relay/grey cockpit, beloved/dark finale) play as full arcs, not consolation prizes. The refuse-everything defiant walk is one of the best transcripts this loop has produced.
- **WINNABLE:** Yes — 8/8 seated runs resolved to real endings (7 wins + the priced-failure resolutions, which are wins-with-cost per TABLE.md law 4). Failure never deletes the run; the cycle-breaker guarantees termination.

## Evidence

- `evidence/2026-10-17/journey-endgame-r15.md` (this note)
- `evidence/2026-10-17/journey-endgame-r15-belongseat-tablefail-s{8911..8918,8921}.json`
- `evidence/2026-10-17/journey-endgame-r15-transcript-s{8911..8918,8921}.txt` (full table transcripts)
- `evidence/2026-10-17/journey-endgame-r15-convos-s{8911..8918,8921}.txt` (day-80 people check)
- `evidence/2026-10-17/tele-r15-s{8911..8918,8921}.json` (telemetry-check inputs)
- `scripts/journey-endgame-r15-20261017.js` (harness + weak driver)
- `scripts/test-table-downgrade-cycle-20261017.js` (proof, RED→GREEN)

**Fix committed (worktree):** `src/js/table.js` (downgrade cycle-breaker: `T.failedDoors` per sitting, spent doors never re-offered, rock-bottom skips already-failed Assimilated). Merged locally, pending ship — no version tag (ship loop owns bumps/pushes).