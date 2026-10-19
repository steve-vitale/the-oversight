# Journey ENDGAME R20 (2026-10-19) — THE STAND-DOWN VERB: r19's sharpest blank, fixed

**Run id:** playtest-loop2-20261019-0256 (oversight-playtest-loop-2, lane B). Worktree: `journey2-endgame`.
**Base:** master 24c8e136 (pulled at run start). Rotation index was 4 (endgame); r19 (2026-10-18) claimed "advanced to 5" but the file still reads 4 — played leg 4 per the file, which is the authority. Rotation advances to 5 at the end of this run.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** r19's blank #1 — once the call is sounded and Haven commits, there is NO player verb to release the muster (`titanSelfActions` offered council/call/commit only; `titanReleaseCommitted` fired only on victory/defeat). An unfillable muster = permanent 1000 kcal/blade/day bleed + unanswered-titan escalation every 5 days, with no player agency — a death spiral you can watch but not stop. **This run adds the stand-down verb** (`titan:standdown:<tid>`), voiced, trust-costed, and measures whether a competent player can use it to retreat honestly and re-muster later.

**Interesting-finding bar:** (a) the verb exists in the player-facing action surface and fires (proof RED→GREEN); (b) in a full run, a muster that would have spiraled is stood down and the bleed stops while the threat persists (escalation continues, omen stays located); (c) the beats sense-read (SENSE-TESTING LAW).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 proof GO: RED fails (no stand-down action listed; `titanSelfDo('titan:standdown:herald')` returns null), GREEN passes (action listed when a muster stands; after the verb: `st.musters[tid]` null, Haven's committed released, answering links −5 trust, ledger 'standdown' recorded).
- M2 run GO: ≥2/4 seeds reach table announcement (continuity with r18/r19).
- M3 standdown GO: on every seed where a muster stands and is unfillable (allies+havens < minAllies) for 5+ dawns, the driver stands it down and: no upkeep charged for that muster afterwards, Haven's committed are back in the workforce, escalation continues (honest), no crash.
- M4 people GO: ≥2 sense-reads of stand-down / war-council / call beats, 0 senseless flags.
- M5 census GO: post-run census real on all runs; no crash/softlock.

**Seeds:** fresh 8991–8994. **Pilot:** seed 8991 only first; expand after the pilot verifies the instrument. **Horizon:** 260 loop-days, death-aware. **Stack:** r18's seat-driver tip (TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 + BELONG_V3=1, set BEFORE any require — r18's lesson) + a stand-down hook in the driver (muster unfillable 5+ dawns → `Game.titanSelfDo('titan:standdown:'+tid)`; pilot-calibrated from 10 — a starving village collapses in ~7 days, so 10 never fires) + r19's non-creating omen read rule (never call `G._titanTest.titanOmen(tid)` as a probe — use `titanState().omens[tid]`).

## PILOT (seed 8991)

First pilot (STANDDOWN_AFTER=10): the run scattered d107 from hunger (starving since d88 — before the herald was even located d100). The herald got the full eager chain (council → call → commit of Sari, Helen, David; zero allies — "No one sits with you. The council is one chair."), but unfillDays only reached 8 before the collapse — the 10-dawn trigger never fired. The muster bleed (3,000 kcal/day) rode on top of an already-starving village. Instrument verdict: the driver and verb wiring work end-to-end; the trigger is too slow for the world it measures. Recalibrated to 5 dawns (a competent player gives the call ~5 dawns for late answers, then breaks it). Re-running the pilot.

## DECISION LIST (my calls — Steve corrects)

1. **Adding the stand-down verb** (r19 filed this as "Steve's call"; deciding YES per FIGURE IT OUT YOURSELF — a no-exit death spiral contradicts TABLE.md law 4 "failure RESOLVES the story, never deletes the run" and "Decisions, not chores").
2. **Cost model:** −5 trust to each answered link, said aloud; omen stays located (stage 2); unanswered escalation continues; the player may sound the call again later. Retreat ≠ resolution.
3. **Single-tap verb** (re-callable, lower stakes than commit's two-tap).
4. **No muster-gate tuning this run:** r19 blank #2 (minAllies 10/12/20 vs 1-link bot diplomacy) stays a design question — I won't tune numbers without measuring coalition depth first; the stand-down removes the lethal edge; propose tuning with data next run.
5. **Upkeep honesty fix (found by the pilot):** `titanMusterUpkeep`'s `!muster.allies.length` early-return silently exempted haven-only musters from the 1000 kcal/blade/day cost the commit verb promises aloud ("eat from your stores (1000 kcal/day each)"). Now any standing blades are charged. This also makes the stand-down verb meaningful on solo-Haven musters.

## RESULTS (4 seeds: 8991–8994)

| seed | end | table | stand-down | note |
|------|-----|-------|-----------|------|
| 8991 | scattered d105 | — | d104, 5 unfillable dawns, returned true | starving since d88 (pre-muster); verb fired, run was already dead |
| 8992 | WON d101 | announced+s sat d101, feared/light, lesser | N/A (no stage-2 titan) | clean competent run, forager/gardener + living_garden, 8/8 alive |
| 8993 | WON d90 | announced+s sat d90, feared/light, lesser | d80, 5 unfillable dawns, returned true | **the money seed: stand-down → recovery → table → win, no godpath (track: field)** |
| 8994 | WON d159 | announced+s sat d159, feared/light, lesser | N/A (no stage-2 titan) | long run, forager/gardener + living_garden, 8/8 alive |

- **M1 proof GO:** 19/19 GREEN (RED: 12 fails on the pre-fix tree, including the haven-only upkeep check).
- **M2 run GO:** 3/4 announced (8992 d101, 8993 d90, 8994 d159). 8991 scattered d105 — starving since d88, before the herald was named d95.
- **M3 standdown GO:** every unfillable muster was stood down (8991 d104, 8993 d80); post-stand-down: muster null, committed released, upkeep stops, escalation continues, no crash. On 8993 the run went on to WIN 10 days later.
- **M4 people GO:** 8991 + 8993 herald beats sense-read (naming, council, System odds, call, commit two-tap, hungry muster, escalation on Thornfield, stand-down with allied trust cost) + 8994's d130 Thabo convo — 0 senseless flags.
- **M5 census GO:** all four runs ended cleanly with real censuses; no crash/softlock.

## Village assessment (census in plain words)

- **8991 — the hungry village that scattered:** Jesmin the mushroom grower, Brian the zookeeper, Sari the postal worker, David the plumber, Helen the cook — five people, starving since d88. The herald was named d95 and located d100; with no coalition ("No one sits with you. The council is one chair.") they sounded the call anyway and committed three of their own. The muster stood unfillable for 5 dawns and was stood down d104 — the verb worked exactly as designed, but the village was already gone; hunger scattered them d105. The muster didn't kill this run; it just couldn't save it.
- **8992 — the clean win:** Clarice, Daniyar, Benoit, Aroha, Petra, Lena, Greta, Aria — eight alive, no titans, straight to the table d101. Feared/light, lesser seat, forager/gardener with living_garden.
- **8993 — the stand-down village that won:** Ruth the librarian, Tashi the arborist, Carlos the fisherman, Slamet the musician — four alive. Herald located d76; one allied fire answered; Ruth, Tashi, then Robin committed across d76–80 while the muster went unfed (0 of 3,000 → 0 of 4,000 kcal). Stood down d80: "3 of Haven's own come home. 1 allied fire walks home thinner (trust −5 — they bled for a fight that never came)." Table announced d90, won feared/light on the lesser seat — **no godpath, no god, just competent play (track: field)**. The stand-down didn't doom the run; it freed it.
- **8994 — the long win:** Jordan, Thabo, Victor, Leo, Jesse, Elena, Onni, Ronan — eight alive, no titans, won d159 feared/light. Thabo at d130, on the table: "Seven doors and it chose US. I save the best bite for last and try to feel chosen instead of chosen-at."

## People check (SENSE-TESTING LAW)

1. **Herald naming (d67/d95):** "📻 The old ones point at the horizon and don't speak. The System, for once, is quiet too. Then: the Herald. It heralds the apocalypse the way dawn heralds the day." The machine has no joke for this one — restraint as voice. Sensible.
2. **War council + System odds (8993 d76):** named faces, trust/loyalty readouts, then "ODDS ARE UP! THE HERALD vs the Haven coalition — 8 to 1! The gamblers are THRILLED! (Our models have never seen a titan. Neither have you. This is fine.)" — entertainment, labeled as not-truth. Sensible.
3. **Escalation on Thornfield (8993 d76):** "🌪️ THE HERALD struck Thornfield in the night. They bled while the coalition talked. (trust −5 — they notice who wasn't there.)" Named village, named cost, consequence. Sensible.
4. **Stand-down with an ally (8993 d80):** the trust cost lands on a real relationship — "they bled for a fight that never came." Retreat priced, not free. Sensible.
5. **Hungry muster (8993 d77–80):** "🍽️ The muster is hungry — 0 of 4,000 kcal fed. Bellies remember who feeds them. (loyalty strains when the food runs thin.)" — honest numbers; the loyalty parenthetical now only appears when allied fires are actually mustered (r20 fix). Sensible.
6. **Thabo on the table (8994 d130):** the NPC wants something (solitude, stated in the opener); the driver deflected it (legitimate player move); the table talk is characterful ("chosen instead of chosen-at"); the ending plants character ("I should go before I say something sincere"). No fabricated shared history. Sensible.
7. **0 senseless flags** across all beats read.

## BLANKS FILLED (2 game-code changes + 1 line-honesty fix)

1. **The stand-down verb** (`titan:standdown:<tid>`, src/js/titans.js): r19's sharpest blank. Offered in `titanSelfActions` whenever a muster stands; single-tap; breaks the muster (Haven's committed come home via `titanReleaseCommitted`, muster nulled, answering links −5 trust said aloud, ledger `titan:standdown:<tid>`). The omen stays located and escalation continues — retreat ≠ resolution; the call can be sounded again. Proof: `scripts/test-titan-standdown-20261019.js` RED→GREEN (19/19).
2. **Upkeep honesty** (same file): the `!muster.allies.length` early-return silently exempted haven-only musters from the 1000 kcal/blade/day the commit verb promises aloud. Now any standing blades are charged. Same proof test covers it.
3. **Loyalty-line honesty** (same file): the hungry-muster parenthetical "(loyalty strains when the food runs thin.)" now only appears when allied fires are mustered — a haven-only muster strains no one's loyalty.

## Reachable / Fun / Winnable

- **REACHABLE:** The stand-down is reachable through the normal player surface (it appears in the self-bar actions whenever a muster stands — verified via `titanSelfActions` in the proof test and fired twice in full runs). The table remains reachable: 3/4 this run, feared/light on the lesser seat every time.
- **FUN:** The 8993 arc is the design working as intended — over-commit, watch the muster go hungry, break it at a real social cost, then win anyway. The beats are voiced, the costs are legible, retreat is a decision with a price. The escalation beats (Thornfield bleeding while the coalition talks) are among the best systems writing in the game.
- **WINNABLE:** 3/4 won this run (8992 d101, 8993 d90, 8994 d159) — including a no-godpath competent win 10 days after a stand-down. The key path (r19's domain) remains muster-gated, but the table itself is winnable and the stand-down removes the lethal edge r19 found.

## Regression

- New proof test: 19/19 GREEN.
- Titan surface: test-titan-class 32/32, test-herald-titan 22/22, test-titan-12x12 7/7, test-titan-load ALL PASS, test-titan-variety 12/12, test-blitz-titan 56/56, test-blitz-titan-async 5/5.
- test-table-downgrade-cycle: ALL GREEN. check-wired on titans.js: 0 unwired.
- `check.js --quick`: 96 passed, 1 failed — the 1 failure is pre-existing (verified identical on the pristine HEAD tree; table-core's 3 wipe-assertion failures, not in the quick list and untouched by this change).
- test-table-core-20261011.js: 3 failures, identical on HEAD (pre-existing; filed as a known issue, not this run's scope).

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json` (r14's seat-driver baseline: 7/8 wins): **quiet** — wins 3, table 3, tableSceneFired 3, tableSceneCompleted 3, seatApproach 3 (1 file, 5 metrics, no large deviations; 3/4 vs 7/8 is proportional on the same arm). The baseline was NOT rolled forward — a 4-seed run adds noise over the 8-seed baseline, and nothing deviated. Evidence: `evidence/2026-10-19/tele-r20-standdown.json`.

## METRIC REVIEW (§14)

- M1–M5 all GO. No re-scoring was needed.
- Pre-matrix calibration (pilot, not mid-run): STANDDOWN_AFTER 10→5 (a starving village collapses in ~7 days; 10 never fires), and the driver got a 15-day no-recommit cooldown after a stand-down (it was re-committing the next dawn, fighting its own verb).
- The `endingKey: null` in table_won telemetry is correct, not a bug: it's the *network-key* field (`'network'` when THE HOSTS fell), and none of these runs took the key. The locked build half (track/godpath/subclass/god) is fully populated.
- Note for future runs: haven-only musters now charge upkeep (the fix) — food-economy telemetry on titan seeds will shift slightly vs the old baseline; that's the honesty fix working, not drift.
- r19 blank #2 (muster gates minAllies 10/12/20 vs 1-link bot diplomacy) remains open: this run's coalition depth matched r19's (≤1 answering fire). The stand-down removes the lethal edge; gate tuning still needs a coalition-depth measurement first.

## Evidence

- `evidence/2026-10-19/journey-endgame-r20.md` (this note)
- `evidence/2026-10-19/journey-endgame-r20-standdown-s{8991..8994}.json`
- `evidence/2026-10-19/journey-endgame-r20-transcript-s{8991..8994}.txt`
- `evidence/2026-10-19/journey-endgame-r20-frames-s{8992,8993,8994}.json`
- `evidence/2026-10-19/journey-endgame-r20-convos-s8994.txt`
- `evidence/2026-10-19/journey-endgame-r20-summary.json`
- `scripts/journey-endgame-r20-20261019.js` (driver harness)
- `scripts/test-titan-standdown-20261019.js` (proof, RED→GREEN)

**Game-code changes:** `src/js/titans.js` — stand-down verb, upkeep honesty, loyalty-line honesty (proof-tested RED→GREEN). Merged locally, pending ship.
