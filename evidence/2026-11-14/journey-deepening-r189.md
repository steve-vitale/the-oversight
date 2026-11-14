# Journey Deepening — run r189 (Lane A, leg 2)

**Prereg:** `evidence/2026-11-14/journey-deepening-r189-prereg.md`
**Leg:** 2 — deepening (days 40–80: wave 2–3, knowledge economy, regional links)
**Seeds:** panel 100051–100058 + smoke 100050 · **Policy:** competent · **DAYCAP:** 100
**Run tag:** `playtest-loop-a-20261113T1845CST` · **Run id:** `playtest-loop-a-20261114T010819Z`
**Base:** master `a1d201e8e` · **Worktree:** `journey-deepening` · **Driver:** `scripts/journey-deepening-r189-20261114.js`

## Q1 (PRIMARY) — RE-ASK-ORPHAN TRACE: NOT-REPRODUCED

- **RE-ASK-ORPHAN PANEL: orphans=4 fromSeed-origin=4 true-no-thread=0** (9 seeds, 79 transcripts).
- **ORPHAN-TRACE PANEL: orphans=4 SPOKEN-BEFORE=0 NEVER-SPOKEN-SAME-SITTING=0 NEVER-SPOKEN-EARLIER-BUILD=0 FROMSEED=4 UNTRACED=0.**
- Panel-wide trace: 145 favor builds, 395 seeds planted, 112 followups. Followup sites: opener-fromSeed `convo-wants.js:692` = 109, opener-inherited `:721` = 3, stage-0 guard `conversation.js:7017` = **0**. 65 re-ask-variant followups, none orphaned beyond the 4 fromSeed-origin.
- The 4 orphans are favors asked in policy `talkTo` sittings the driver never transcribes, then re-asked from a seed in a driver sitting. Read one in full: Lamar, seed 100052 day 45 — favor built day 44, seed planted day 44, day-45 sitting opens fromSeed with the re-ask line, the player commits, the favor is promised and a repay seed planted. The ask DID happen; the driver just never saw it. The seed is the proof — the phantom-seed rule refuses seeds for stage-0 wants, so a seed means the ask surfaced.
- Per the prereg's decision rule, 0 true-no-thread orphans = **NOT-REPRODUCED**. Stan (r188, seed 100047 d60) stands as a single observed roughness; the scan stays as a carried watch, and the favor trace is now the scan's source of truth going forward.
- **H1 (stage-0 guard) is untested in the wild, not refuted.** It fired 0/112 followups — the prime Stan suspect is too rare for a panel to hit. A targeted unit-level probe (ledger-blocked fresh favor + `alive:want` turn) is the way to settle it, not more panel seeds. Carried as the next step for the watch.

## Q2 (SECONDARY) — DOUBLE-ASK carried watch: WATCH-CLEAR

- **DOUBLE-ASK PANEL: doubleSittings=0 transcripts=79.** Second consecutive clean panel (r188 also 0/135). The fix in base (`1decd5bee`) holds.

## Q3 — Census (plain words)

Five of eight villages made it to day 100–102 alive; three were lost (day 28, day 49, day 100). Every village reached wave 4 except seed 100058 (wave 3, lost day 28); seed 100057 reached **wave 5** — the deepening leg's ceiling is being touched. Seven of eight reached regional standing; none reached national. Standing comes almost entirely from blood (war 25–375, diplomacy 0 everywhere, feasts 0–3, seasoned links 0) — the bonds-and-bread road to standing still contributes nothing this panel. Two starvation deaths across eight villages (one each on 100054 and 100058); the villages die fighting, not hungry — the survival-collapse shape persists, carried to Loop B. Monster meat is hauled, tested, and cooked everywhere (kills 13–58, tests 1–20, dinners 0–17); two villages tested meat and cooked none. Knowledge is alive: experiments 1–5 per village, one deep trader talk on 100055.

Per seed: 100051 survived d101 wave 4, 8 alive, standing max 265. 100052 lost d100 wave 4, 0 alive. 100053 lost d49 wave 4, 0 alive. 100054 survived d101 wave 4, 12 alive, standing max 180. 100055 survived d101 wave 4, 10 alive, standing max 227. 100056 survived d102 wave 4, 8 alive, standing max 145. 100057 survived d101 wave 5, 4 alive, standing max 375. 100058 lost d28 wave 3, 10 alive at loss, standing max 25.

## Q4 — Carried panels (read-only)

- **V-INIT:** bondSittings=34, candidates=1 — the single candidate is the known outing ask (100055 day 28, muscadine-grapes haul), correctly excluded, not a bond.
- **LADDER:** opens=9 late=0 silent=0 broken=0, minted 5/5 tracks, holds 7/9. The ladder opens and mints everywhere.
- **SECRET-PROBE:** fires (3/3 addressing picked, 3 wants established). **REQUESTS:** staged 53, decided 35, expired 17 — reached.
- **BOND-TELEMETRY:** 130 tele events, 60 proposals, 25 decisions, 14 accepts (0.56), 18 link raises — the merged code reaches the wild. **BOND-CHOICE:** 34 offered, 34 answered.
- **FIZZLE:** 0 dry sittings — the fix holds. **MENU-FLIP:** 0 flips. **LANGGATE:** not reproduced. **REPLAY:** 0. **AWAY-LINE:** old line gone.
- **FAVORBLOCK:** varied (4 patterns, max 4). **PARTNERBLOCK:** repetitive (3 patterns, max 4) — carried, unchanged from r188.
- **PLACEPROBE:** fires. **TEACHFRAME:** varied. **GOALJOIN:** healthy on all tracks except knowledge (NO-DATA).
- **P-KEEP:** 17 threads — NAMED 3, NO-LATER-SITTING 8, DEAD 5, SILENT 1.

## People check (full transcripts read)

- **Lamar, 100052 d45** (the re-ask orphan): honest — the ask happened the day before in an unrecorded sitting, the re-ask is a real follow-up, the player commits, the favor is promised. Reads like a person returning to an open thread.
- **Mateo, 100054 d79:** bond proposal offered at the top and accepted cleanly ("Stick together, then. They look steadier already."), then a normal sit — teaching, places, a quiet walk — and the seeded favor closes as "we got it handled". Coherent and consequential.
- **Miguel, 100057 d97** (the wave-5 village): a link proposal to Stonebridge offered and accepted, then the favor thread — "I can't reach this properly. Could you take a look?" — requirements, commitment, promise. Coherent.
- The three inherited-ask followups all name the dead predecessor honestly: "I asked Helga about the food I needed — Helga's gone. Still need hands. Are you in?" (100054 d20, d50; 100055 d91). No fabricated shared history.
- No senseless dialogue found this run. No blank filled — this run's work was the instrument, not a game change.

## Changes this run (worktree only)

- **Instrument only, no src/js change.** Driver `scripts/journey-deepening-r189-20261114.js` (favor-build/seed/followup trace wrappers + per-sitting ledger snapshots) and analyzer `scripts/analyze-journey-deepening-r189-20261114.js` (`classifyOrphanTrace` + ORPHAN-TRACE panel), plus proof test `scripts/test-journey-deepening-r189-analyzer-20261114.js` — **8 passed, 0 failed**; RED mode verified (r188 analyzer crashes `classifyOrphanTrace is not a function`).
- No game fix built: Q1 did not reproduce, Q2 is clear. Nothing to land on the game side.

## Gate

`node scripts/check.js --quick` (19 min, loaded box): **333 passed, 7 failed** — all 7 adjudicated, none caused by this run (no src/js change; instrument-only):

- **3 check.js 120s timeouts, all pass when run directly:** test-one-person-army-deed-attainment (161s direct, exit 0), test-occupation-panels (112s direct, 25 passed), test-living-garden-deed-attainment (429s direct, exit 0). The 120s wrapper is too short under sibling load, not a test failure.
- **3 pre-existing staleness, r188-adjudicated, carried items:** test-measurement-proof-update ("Proof source inputs are not current"), test-measurement-workflow (retained neutrality proof coverage), test-phone-frame-proof (3 sub-checks). The measurement-proof refresh is owed by another loop; not this run's to fix.
- **1 load artifact:** test-measurement-cache-flags, 3/4 passed, failing only "both actual CLI configurations complete valid neutral panels" — the known box-load shape (AGENTS.md, r187). This run changed no measurement code, so the failure cannot be its doing.
- This run's own proof test: **8 passed, 0 failed** (RED mode verified against the r188 analyzer).

## Telemetry

`telemetry-check.js` vs the deepening baseline (4-seed sums, r120 Nov 9) on seeds 100051–100054: **LOUD on two metrics** — w3fights -76% (33 → 8) and fightsByWave.3 -74% (34 → 9). engaged.w3 (28 → 21) and fightsTotal (104 → 64) quiet. **Verdict: explained — baseline staleness + pacing variance, not a bug. Baseline NOT rolled forward.**

- The baseline is from Nov 9. r188 already halved w3fights to 16 (first four seeds) without the check catching it — r188 checked guardrail metrics, not w3fights. The baseline is stale relative to both panels.
- The r189 drop compounds two effects: a shorter wave-3 window (mean 17.3 days vs 23.0 on r188 — wave 4 arrives sooner) and a lower fight rate inside the window (0.096 vs 0.188 fights per window-day), with huge per-seed variance (r188's seed 100046 had 12 wave-3 fights; r189's max is 3).
- Fight outcomes are proportional (60% won on r189 vs 62% on r188) — the player isn't avoiding or losing more. The world still produces wave-3 fights (64 wild fights vs 85 across the first four seeds), the wave schedule is intact, and one village reached wave 5. Wave-3 content is reachable; the player just meets fewer of them before wave 4 arrives.
- Proposal for a future run: re-seed the deepening baseline from an 8-seed panel using per-seed means instead of 4-seed sums, or retire w3fights — at n=4 it is too variance-prone to judge by.

## Metric review (§14)

- Q1's metric worked as designed: the trace classified all 4 orphans and the verdict follows the prereg rule without re-scoring. One gap: the prereg named three trace outcomes (NEVER-SPOKEN / SPOKEN-BEFORE / 0 orphans) and the panel produced a fourth — FROMSEED, where the seed itself is the proof the ask surfaced. The prereg's SPOKEN-BEFORE rule covers it in spirit (the ask happened, just not in a transcript), and the run note records the mapping explicitly rather than inventing a new verdict class mid-run.
- Proposed revision for the next run: fold FROMSEED into the prereg as its own outcome class ("seed proves a prior ask in an unrecorded sitting"), and settle the stage-0-guard hypothesis with a targeted probe instead of panel volume — 0/112 followups means a panel will likely never hit it.

## Verdicts

- **Reachable:** yes — 7/8 regional, 1/8 wave 5; the ladder, bonds, links, and favors all fire in the wild.
- **Fun:** yes — bond acceptances, link proposals, and favor follow-ups read like people with open threads, and the wave-5 village survived with 4 people standing.
- **Winnable:** partial — 5/8 survive to day 101, but no village reaches national or the table; this leg ends before the seat, and the blood-only standing road is the open question for the scale leg.

## Notes for the next run

- **Rotation discrepancy:** this run's rotation file read `2` at start despite r188's note claiming "2→3 written at closeout" — the write flap was active all evening 2026-11-13 and almost certainly ate r188's closeout write. Ground truth is the file. This run advances 2→3 at closeout and verifies the write sticks.
- **Held tree (INSPECT HELD WORK, Steve 2026-10-27):** `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 3 days stale) still holds an unlanded revert of the live sim-wideduty-a medic-duty code in `src/js/game.js`. Real work-in-progress, not scratch — not released, not touched. Flagged again for the main session.
- **Write flap:** ongoing. This run hit it on the first heartbeat retry (~01:23Z). No data lost; the driver has writeFileRetry and all 8 seed JSONs + 79 transcripts landed whole (0-byte check passed).
- Panel determinism: 100051 and 100052 re-ran byte-identical to their pilots (same end, day, wave, pop).
