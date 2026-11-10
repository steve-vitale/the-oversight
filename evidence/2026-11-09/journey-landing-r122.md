# journey-landing r122 — RUN NOTE (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261109T1545Z (scheduled Mon 2026-11-09 15:45 CST, started ~22:08Z).
**Base:** local master `7cd52fbb0` (journey-scale r123, pending ship). Branch: `journey-landing`.
**Seeds:** fresh band 1152–1161, DAYS=28, BEFORE/AFTER matched (§15). BEFORE = r121 AFTER driver verbatim; AFTER = r121 + `COMPETENT_DIRECTIONAL_FLEE=1 COMPETENT_EXIT_VERIFIED_FLEE=1 COMPETENT_FLEE_REPAIR=1` (driver-env only, **zero src/js**).
**Adoption:** the 15:45 coordinator TIMED OUT after the panel ran (Flap 3 blocked registration 22:16–23:18Z; the panel completed but the run note, sense-check, gate, commit, merge, telemetry and cleanup never ran). The main session adopted the held work: heartbeat 00:06:35Z was a provably orphan heartbeat (execution timed out, zero processes in the tree), so adoption proceeded in the main session; all analyzer runs below were re-run by the adopter on the written corpora. No panel was re-run; the corpora are the coordinator's.
**Rotation:** read 0 → wrote 0→1 at run start; closeout writes 1→2 (establishment next).

## Verdicts

### Q1 (PRIMARY) — THE FLEE THAT NEVER LEAVES: GO on the metric, MECHANISM UNPROVEN
- Fleeloop analyzer (new, proof-tested): BEFORE flee-loop deaths **0**, AFTER **0**; scholar fight deaths BEFORE **4** → AFTER **2**; keptTotal AFTER **7** (outingchain: kept 7=7, togetherOk 10=10, haul 8=8, deliver 7=7 — chain intact).
- All three pre-registered clauses hold numerically (0 after; 2 ≤ 4; kept 7 ≥ 1) → **GO by the letter**.
- But the before side carried **0 flee-loop deaths**, so the defect this run was built to test never reproduced on this band, and the gates' mechanism is unproven here:
  - The 2 deaths that vanished (1153 d27 gallowdeer, 1161 d26 buffering, wave 3) are **divergence artifacts** — those fights never occurred on the AFTER side at all (the villages diverged), not demonstrated gate saves.
  - The 2 deaths that remained (1153 d11 gallowdeer, 1161 d12 belltoad) are the **same fights with the same outcomes** both sides (d11: 5 rounds, scholar fought ~5–6 strikes, lost; d12: 21–24 rounds, ~14–18 strikes, lost). The scholar FOUGHT in both — not flee-loop deaths — and the gates changed nothing measurable in them.
- The fleeloop proof test validates the instrument (its synthetic fixtures reproduce the r121 1148 no-op-same-tile and 1143 walk-toward-edge shapes and count 2/2 before, 0/0 after), so the panel's 0→0 is a real measurement, not a blind instrument. The r121 defect evidence stands; this band adds nothing to it.
- **Metric review (binding for the next run):** the Q1 metric needs a before-validity condition — if the BEFORE side shows 0 flee-loop deaths, the run is UNTESTED on mechanism, not GO. The next landing run should re-test on a band where the defect reproduces, or seed the panel from the r121 defect seeds.

### Q2 — M-PR1 SETTLED-FAVOR EXCLUSION: GO
- Revised instrument (analyze-landing-r107-commit-offer.js, proof-tested): AFTER sittings=27, offered=23, picked=23, promised=17, statedAfterPick=6, **neverOffered=1, settled=3**.
- Per-seed never-offered ≤1 on ≥8/10 seeds: **holds** (1 total across the panel).
- The exclusion fired on the r121 shape: settled=3 (1154 d7, 1155 d9, 1160 d10 — all offered=false, settled=true, not counted as never-offered). The 1160-d10 case is the 1150-d9-Henry pattern recurring and reading excluded.
- M-PR2: promised/(picked − away-guard) = 17/(23−6) = **100%** ≥ 80%. All 6 stated refusals are the away-guard line (by design).
- The one never-offered sitting (1155 d10, offered=false, resolution=unestablished, not settled) is the genuine remainder — transcript adjudication backstop stands; it is not a settled favor.

### Q3 — PRACTICE: GO
- movedCells d1→d28 = **103**, attributed=103, seedsWithMove=10/10, skill0→pos=21, practiceReps=3594.
- Movement by task: wood 30, stone 32, deadfall 10, water 20, cook 11; hunt/forage/fish/scout/patrol 0.
- Hunt reps 0 again (265 kills, 0 hunt practice) — the r117 hunt-assignment policy question carries, unchanged.

### Q4 — ENGAGEMENT REGRESSION LINES: GO
- M-PR1 (see Q2) and M-PR2 (100%) both hold.

### Q5 — R104-GOAROUND (M7): GOAROUND-HOLDS + RESCUE-GO
- R84 kcal: arrivals=2, arrived=2 (100% ≥ 80%). R85 kcal: skips=2, complete=2. RESCUE-GO.

### Q6 — DOORSTEP-OUTINGLIVE (M6): UNTESTED
- 0 real triggered steps: all 278 doorstepSteps carry `skipped: "already-inside"` and none carries eatRecs. Same as r121 — an empty sample is UNTESTED, not GO (r115's rule).

### Presshop (carried Q1/Q2 outing shape)
- Q1 DOUBLE-PRESS-STOP-WORKS: pressFailEvening 0→0, strippedSecondFails 0→0, togetherStopped 8→8 (all g3After=0). Middle-leg (together) presses verified: 8 stops, 0 failures, identical before/after.
- Q2 far-unreached: 3→3 — **NOT-MET**. The same 3 far cases stay unreached (H-OTHER:3, engine-named blocks; hopReached=9, detourReached=2). The hop works; the 3 far cases are outing/route cases the flee gates don't touch. Carried as an open question, not a landing verdict.

## Carried bindings (judged fresh on the AFTER corpus)
- **M1 ALIVE-D14: 10/10** ✓. **M2 SYSTEM CONTACT: 10/10** (d8–d9 all seeds) ✓.
- **M3 FIGHT-LOG:** 11 fights, all with monsterArg + endResult, 0 unknown/mixed trigger ✓.
- **M5 PEOPLE: PASS** (sense-read below).
- **M-R70:** holding — live-promise dawn opps with waiting=false all carry engine-named reasons (closed requests, partner inside hall, etc.); 0 genuine defects.
- **NAV-log classifier:** genuine=0, noLine=0, navLines=91 = menuMore=91 ✓.
- **Zero-DMG invariant: 0 violations** (fights=11, zeroDmg=0) ✓.
- **Miriam line: 0** "That's settled" across all transcripts ✓.
- **R66 HUNGRY:** 5/10 seeds with pantry <10k on some day, **0 starvation deaths** (r121: 8/10, 0 deaths — same pattern, fewer hungry seeds).
- **R73 narrow windows:** NARROW 12, kept inside narrow 7 (r121: 8 / 4).
- **Mantle latency:** max **2** (1161: Soo died d12 in the wild — the belltoad fight — mantle d14 Soo→Ella; 1153: lat 1). The flip mechanism was proven synchronous in r165/r166 (16 deaths, all immediate), so this reads as a sampling lag in the landing driver's daily series — note the d13 series entry is missing entirely on 1161 (series jumps d12→d14). Watch, not a defect.
- **1130-d6 amnesia shape: 0 recurrences** ✓ (the 3 grep matches are innocent: a dream-question answer, "Everyone gets forgotten eventually", "an experiment someone forgot to label").
- **Scholar-turns watch:** 11 fights; verbTotals player-move=15, wait=0, barrier-exit=0, ability=0. No living 0-strike ≥3-move fight (fleeloop analyzer: none).
- **Curious resume line:** not separately counted this run (the line text wasn't isolated from the curious-thread stages); carried as an open watch.
- **Deflect-fallback repetition:** worst sitting **3×** (1154-day7, 1157-day10) — the r118/r120 loop shape persists. The sitting read in full (1153-day7) showed 2×.
- **6394 flat fall-through:** 0 occurrences ✓.
- **Kill-mean trend:** 26.0 → 26.5 (r120 31.1 → r121 26.1 → r122 26.5 — flat, seed mixture).
- **Poison re-test:** 0 live re-tests.
- **Scholar-eats-first:** held design question, not changed. **M-A2:** not re-measured (DELIVER OVER MEASURE).

## M5 PEOPLE — sense-check (transcripts read)
Read in full: 1153-day7 (Daniela); spot-checked 1154-day7, 1157-day10, 1159-day6/7.
- **Daniela's sitting works as a conversation.** She wants two real things (link with Ashford; a foraging partner because the pantry's nearly bare), the player declines the betrayal invite honestly ("Fair enough. Rain check."), accepts the link proposal, asks what she needs, and commits to a specific favor (ridge above the creek, sunup, pack and knife). Wind-down surfaces ("Gotta run. Literally. Bye!"), the sitting resolves promised, and a beast-naming beat follows (Captain Bright-Eyes vs Sir Blinds-A-Lot) — alive, funny, grounded in the world. The NPC wants something, the options engage it, the ending resolves and plants.
- **Issue 1 — observe fallback misfires on unasked wants (finding, voice candidate).** "I just said — did you miss it?" fired once each in 3 sittings (1153-day7, 1154-day7, 1157-day10) while the want was still unasked (stage 0). In the read sitting it fires at turn 13, but Daniela's favor only surfaces at turn 15 — the line claims she said something she hadn't. The r118 3-in-one-sitting repeat did NOT recur (once per sitting now), but the misfire itself persists. The fallback should not fire when the want has never been spoken. Filed, not fixed (game-side voice candidate for a future run).
- **Issue 2 — dlg:subject acknowledgment repeats verbatim (carried).** "Yeah? What's up?" / "Sure — what's on your mind?" repeat up to 3× in one sitting. The known r118/r120 loop shape; still present, still a voice pass candidate.
- Betrayal held-offers: the decline at turn 0 was acknowledged and the invite not forced (heldBeats=1, invitePendingHeld=false). Party invites spoken/dry: no dry invites on the read sittings.

## What changed (this commit)
- **Analyzer + metric only; zero src/js.** The Q2 settled-favor exclusion in `scripts/analyze-landing-r107-commit-offer.js` (modified, proof-tested with the 1150-d9-Henry fixture + a live-favor control); new `scripts/analyze-landing-r122-fleeloop.js` + `scripts/test-landing-r122-fleeloop.js` (synthetic r121-shape fixtures); new `scripts/test-landing-r122-commit-offer.js`; new drivers `scripts/journey-landing-r122-20261109.js` + `scripts/journey-landing-r122-before-20261109.js`; prereg + analyzer outputs + this run note.
- **No game-code fix.** Per the prereg, a game-code fix was in scope only if the panel proved a defect in game code with a before/after proof test. It didn't: Q1's mechanism is unproven on this band and the observe-fallback misfire is a voice candidate, filed not fixed.
- **Measurement proof:** no src/js changed → proof stays current (r166 refresh, panel `neutral-succession-r166`, trio 9/9+9/9+4/4). No refresh owed.

## Findings filed (sim-findings.md)
1. Observe fallback "I just said — did you miss it?" fires on unasked wants (3 sittings, once each) — voice candidate: gate the fallback on the want having been spoken.
2. Q1 metric needs a before-validity condition (0 before-side flee-loop deaths = UNTESTED on mechanism, not GO).
3. Mantle latency 2 on 1161 + missing d13 series entry — sampling oddity, watch.
4. Presshop Q2 far-unreached stuck at 3 (same cases, H-OTHER blocks) — open question for a deepening/scale run.

## Telemetry
- Check run against the AFTER corpus vs `telemetry-baselines/landing.json` at closeout; LOUD lines (if any) recorded below.
- (to be filled at closeout)

## Metric review
- Q1's metric as written cannot distinguish "the gates fixed it" from "the defect didn't occur". Add the before-validity condition (≥1 flee-loop death on the BEFORE side) for the next landing run, and re-test on a band where the defect reproduces. The metric itself was not re-scored mid-run — Q1 is GO by the letter with the mechanism caveat recorded here.
- Q2's settled-favor exclusion is the right shape and now has two panels of evidence (r121 shape + 3 firings here). Keep the instrument.
- M6 (doorstep) has now been UNTESTED on two consecutive landing runs (r121, r122) — the trigger (hungry/thirsty Haven day) never fires in the landing window. Either the trigger needs a leg that exercises it, or the check should move to a leg where it fires.
