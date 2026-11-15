# journey-establishment r139 — establishment leg (days 14–40), Lane A — RUN NOTE

- **Run:** `playtest-loop-a-20261114T1745CST`, scheduled Sat 2026-11-14 17:45 CST (23:45 UTC). **This note is the adoption closeout:** the r139 coordinator timed out at 7200s (~19:37Z) after the panel; the next Lane A occurrence (scheduled 19:45 CST, started 19:50 CST / 01:50Z) adopted the stranded run instead of re-playing the leg — gate adjudication, telemetry, people check, run-note commit, merge, release. Adoption run_id `2026-11-15T01:52:58Z`.
- **Leg:** 1 — establishment (42-day horizon, death-aware stop). Rotation read `1` at r139 start; r139 wrote `1→2` at run start (prereg: "done — file reads 2; deepening next"). **Rotation stays `2` at this adoption closeout** (verified by read-back) — the adoption list in the 19:50 CST closeout entry said "rotation 2→3", which is an error: the file already reads 2, the correct "next leg" after establishment, and advancing to 3 would skip the deepening leg. Deepening is next.
- **Base:** local master `910bff7f4` (batch ship: version bump fa8f9289d-20261114-234552; r134 landing fa8f9289d underneath). `git pull` already up to date at adoption. No push (ship loop owns pushes).
- **Branch:** `journey-establishment`, worktree `~/workspace/worktrees/journey-establishment` (registered by r139; heartbeat re-landed at adoption 01:53Z; adoption hbloop 10-min cadence, PID 3149, exact-PID kill at closeout).
- **Lock (stale-lock recovery):** the r139 lock (`2026-11-14T23:47:43Z`, created 23:53:59Z) was still present at adoption. Registry showed `journey-establishment` active but heartbeat 01:33:47Z (~19 min stale, past the 15-min bar), hbloop PID 3305 dead, no worktree file newer than 01:33Z, no live processes — the run was DEAD, not merely slow. Lock deleted per the >90-min fallback as well (~2h old); new lock `2026-11-15T01:52:58Z` created. **Delete at end, re-reading it first.**
- **Policy:** competent. Pilot **5001**, panel **5002–5005**, 42d horizon. Band 5001–5005 FRESH per the seed-band check in the prereg (rejected bands 3001–3005, 3101–3105, 3201–3205 documented there).
- **Commits (this adoption):** `journey-establishment r139` — (1) spotter wiring + proof tests + driver/analyzer/prereg; (2) run note + balance proof refresh. Safe-commit discipline; no bare git commit.
- **Corpus:** `hidden_files/evidence/2026-11-14/journey-establishment-r139-*` (goal store) — 5 seed JSONs + 5 convo transcripts.

## Q1 (PRIMARY) — THE SPOTTER BLANK: GO, FIX LANDS

**Verdict: GO on every pre-registered bar.** `foodXp['spotter']` was 0 on every panel for seven straight runs (r131–r138); this panel it fires everywhere.

- **SPOTTER BAR (primary): GO.** Panel total foodXp['spotter'] = **52** (bar ≥ 10); every panel seed contributes > 0 (6 / 17 / 18 / 11). Pilot 5001 also fires (14). The grant sites work in the wild.
- **LADDER BAR (secondary): GO.** 4/4 panel seeds have ≥1 villager at 5+ spotter XP / skill 1 (bar ≥ 3/4).
- **FASTER-ID BAR (secondary): GO.** The threshold benefit fired on 4/4 seeds — **130 benefit plays in 184 bumpPlantFamiliarity calls** (bar ≥ 2/4 seeds). The "(future: faster ID)" the food.js table promised is now live: a spotter's hands read the ground faster, recognition threshold down by 1 (floor 1), never field identification (KNOWLEDGE.md law holds — identification still happens back at camp).
- **END BAR (carried): GO.** 3/3 broken-live forage opportunities closed within 2 dawns (Leroy d17→d17, Darnell d5→d5, Ruby d9→d9); 2 seeds NO-OPPORTUNITY (no broken-live runs).
- **TRUST GUARD (hard, DROP-ONLY): HOLDS.** 0 trust drops on end presses across the panel.
- **VILLAGE BAR: GO.** 4/4 seeds alive at d40 (bar ≥ 3/4).
- **JAM BAR (report-only): 0** jam-days across the panel (r84: ~15 on seed 994 alone).
- **STRANDED / TRAVEL / THREAD branches: NO-OPPORTUNITY** (0 stranded dawns, 0 clearable-blockage sits, 0 paged end sits) — mechanisms carried by the proof test, as the prereg allows.
- **WATER INSTRUMENT (report-only): 0** broken-live water runs.

**The fix (src/js/game.js, +39 lines, precedent-following):** (1) villager forage resolution grants 1 spotter XP, first-per-day via `foodXpDay.spotter` (the r131 cook cap pattern); (2) `bumpPlantFamiliarity` grants the scholar 1 spotter XP, first-per-day, on any field handling (the single funnel); (3) spotter skill ≥ 1 lowers the plant-recognition threshold by 1, floor 1, for plants first met after the skill is earned. Pace: a daily forager reaches skill 1 in ~5 days, skill 2 in ~25, skill 3 in ~55 — cannot race inside the 42-day leg. Deliberately NOT in scope: a spotter UI read (`askSpecialist` has no spotter task; sortBag is its natural home but that is a design question), and no change to the villager 25% learn event. The r131 "no fake progress" guard is retired BY DESIGN (the threshold benefit now gives spotter skill a live effect) — the cook-builder test flips its F check to assert the grant site EXISTS, and its D regex is updated to the current `_grant` variable name (r133 rename; assertion unchanged, not loosened).

**Proof tests (both green at adoption, re-run in the worktree):**
- `scripts/test-journey-establishment-r139-spotter.js` (new): **35/35** — villager forage grants once/day, non-forage grants nothing, scholar bump grants once/day, threshold 3→2 at skill 1, floor 1 at occupation threshold 2, grant uses the r128 dial, fix-isolation (pantry + trust identical with the grant stubbed), det-gate (driver twice, byte-identical outputs + spotter instruments present).
- `scripts/test-journey-establishment-r131-cook-builder.js` (modified): **43/43**.

## Q2 (report-only — canned-line variety watch, widened needle)

Analyzer counts across the panel's AFTER transcripts: pod-dream closing **0**, recap stitch verbatim **0**, recap paraphrase (/still (on|where we are)/) **1**, slope-reading **0**, "Walked in like they'd never left." **1**, "Take it for what it's worth." **0**, stew-bowl **0**. The two hits are singletons in different sittings (Mateo's "that's still where we are", 5005; one walked-in line) — the watch stays quiet, no fix. Note: Darnell's 5005 sitting OPENS on the pod dream ("rows of pods. Humming.") but the needle counts a specific closing formulation, so it scores 0 — the opening itself is live content, not a repeat.

## Q3 — census (plain words)

Five villages played (pilot + 4-seed panel), all alive at day 43. Every village started with 12 people; the panel ended with 9–11 alive. Pantries held (22k–104k kcal at end) — no village went hungry. All four panel seeds reached wave 3; 5005 reached wave 4. The Codex grew by 21–30 identified plants per village (104 total across the panel, from fieldwork, testing, sharing, fireside, gratitude, and teaching). The spotter skill is now real: 52 XP spread across the panel, four villagers at skill 1 or better, and the faster-recognition benefit firing 130 times. Broken outings closed the same day they broke (Leroy, Darnell, Ruby) — nobody was left stranded with a live promise.

- **5001 (pilot) — alive day 43, 12 alive, pantry 73468.** Spotter 14. Pilot gate met (instruments fired, wedge closed what it met).
- **5002 — alive day 43, 10 alive, pantry 30672.** Spotter 6, bump benefit 34/55 calls, 24 plants. No broken-live runs.
- **5003 — alive day 43, 11 alive, pantry 22812.** Spotter 17, benefit 49/64, 30 plants. No broken-live runs.
- **5004 — alive day 43, 9 alive, pantry 91235.** Spotter 18, benefit 31/43, 21 plants. Leroy's broken forage run closed the same dawn.
- **5005 — alive day 43, 11 alive, pantry 104067, wave 4.** Spotter 11, benefit 16/22, 29 plants. Darnell and Ruby both closed the same dawn.

## Q4 — people check (full transcripts read): PASS

Two panel seeds read in full (5004, 5005 — four sittings). People with wants, consequences, and specific memories; no fabricated shared history, no filler loops.

- **Leroy, 5004 (veterinarian).** Opens on an unfinished confidence — "I can't read, and I'm scared it matters now" — then deflects when the player changes the subject: who eats first and who waits, an argument in his head he's losing, and he leaves guarded. The thread the opening promises is left hanging because the player chose to ask something else — player-driven, not a defect.
- **Mariana, 5004 (carpenter).** The player teaches her Maypop ("And I've been walking past it for weeks"), she accepts the invitation to come along — "I've been hoping you'd ask" — and tells her story: improvising the hard way. The invite leads somewhere. Ends gracefully.
- **Mateo, 5005 (police officer).** Opens on the player's own regret — "are you carrying it any lighter?" — sits with the yes, then his own story: "Sleep's the real currency now. I'm rich in dreams and broke in rest." Ends with a plan forming — planted, not broken.
- **Darnell, 5005 (glazier).** Taken-kin grief, specific and unflinching: rows of pods, humming, Amanda still missing. The player promises to ask; he thanks them — "Even asking is more than the silence." Then laughter, stolen joy, tubers dropped three days ago: "It wasn't even funny. It was the standing there." The warmest sitting of the panel.

Wrinkle (not a defect): the player's "Take your time. I've got nowhere to be." pick repeats 3× in Darnell's sitting — driver pick repetition, same shape as r192's Ivan gossip-chain note (content varies, shape repeats).

## Telemetry + baseline (adjudicated at adoption)

- Check vs the live baseline (r132 BEFORE panel, competent + withDelegate + HUNTSTAFF=2, seeds 2401–2416): **3 LOUD lines, all "disappeared"** — guardrails.deaths 604→0, guardrails.popAlive 178→0, guardrails.pantryKcal 1210411→0 (n=5 files). c3.starvationDeaths: no line (field absent on both sides).
- **Adjudication: EXPLAINED — known schema mismatch, not a real move.** Direct inspection of the seed JSONs: the r139 driver never emits `guardrails.*` or `c3.*` fields at all, so the checker reads the missing paths as 0 — exactly the mismatch the prereg predicted ("expected again, not a finding"). The real values read directly are healthy: villages alive at d40 on 4/4, pantry 22k–104k, spotter firing on every seed; the fix-isolation proof (spotter test AF) shows pantry + trust byte-identical with the grant stubbed, so the src/js change cannot be moving the guardrails. **Baseline NOT rolled forward** (same call as r138; the baseline stays the r132 regime until a driver that emits the fields is in play).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` (340 scripts, 4 parallel, 967s) at adoption: **334 passed, 6 failed — GO after adjudication (0 attributable failures remaining: 2 fixed by the maintenance proof refresh, 2 timeouts + 1 cache-flags cleared standalone, 1 pre-existing stale receipt).** Log `hidden_files/journey-establishment-r139-gate-adopt.log`.
- **2× 120s load timeouts** (living-garden, one-person-army deed-attainment) — same shape as r192 (living-garden passed standalone in 308s there). Standalone re-runs at adoption, both GREEN: one-person-army **7 passed, 0 failed** (PID 13459), living-garden **8 passed, 0 failed** (PID 13917). Load artifacts, 0 attributable.
- **test-measurement-proof-update + test-measurement-workflow** — "Proof source inputs are not current" / "retained neutrality proof covers the current Game/controller/harness inputs". ATTRIBUTABLE to this run in the mechanical sense only: any src/js change invalidates the input-fingerprint proof, and r139 changes game.js. NOT a code defect — the remedy is the documented maintenance refresh, run at adoption: real neutral panel (`scripts/balance-panel.js --seeds 7 --policies capable,risk-aware,socialite,winseek --days 150`, PID 18200, 2.5 min, 4 cases, 0 cached, 0 errors) → `evidence/2026-11-14/neutral-new.json.gz` → `scripts/balance-proof-update.js` exit 0 (panel digest cb23e285…). Re-run at adoption: **proof-update 9 passed, 0 failed; workflow 9 passed, 0 failed.** Both green; the refreshed proof is committed with this run.
- **test-measurement-cache-flags 0/4 in the gate — EXPLAINED, not load: ENOSPC.** The gate's inner balance-panel run failed with `ENOSPC: no space left on device, write` — /tmp is a 512M tmpfs, 100% full, 511M of it `/tmp/subj8b` (a live Loop B transplant8b job; `tar` PID 15613 actively working in it at 02:29Z — NOT touched). Standalone re-run at adoption with `TMPDIR` on /home: **4 passed, 0 failed** (exit 0). The gate failure was disk, not the change under test. /tmp eased to 83% (91M free) by 02:40Z as the sibling job progressed.
- **test-phone-frame-proof** — stale receipt (index.html + data files), the same pre-existing failure as r189/r191/r192/r197. NOT attributable to this run (this run touches none of the listed inputs); the receipt refresh is a separate owed job, not this run's.
- **test-phone-frame-proof** — stale receipt (index.html + data files), the same pre-existing failure as r189/r191/r192/r197. NOT attributable to this run (this run touches none of the listed inputs); the receipt refresh is a separate owed job, not this run's.
- Notably absent vs r192: occupation-panels passed inside the gate this time (98s); no conversation test failed; the r139 analyzer proof is 8/8 and both proof tests are 35/35 + 43/43 green.

## Metric review (§14)

- The SPOTTER BAR worked as written: total 52 with every seed > 0 is an unambiguous GO, and the bar's NO-GO shape (any seed at 0) would have caught a grant that only fired for the scholar or only on one seed. The LADDER and FASTER-ID bars both cleared with headroom (4/4 vs bars of 3/4 and 2/4).
- The Q2 widened needle worked: it caught Mateo's paraphrase ("that's still where we are") that the verbatim needle missed in r138 — the widening was worth it. The pod-dream needle counts a closing formulation only, so Darnell's pod-dream opening scores 0; a future run that wants to watch the opening should widen that needle too.
- The telemetry checker keeps crying "disappeared" on fields this driver never emits. The metric is honest about absence but the baseline comparison is meaningless while the driver regime differs — the next establishment run should either emit the guardrail fields or drop them from the checked set, not keep adjudicating the same artifact.
- The 4-seed panel was enough for Q1 (52 firings, clean variety) and the carried bars; the pilot + panel together make the biggest establishment corpus on this question.

## Verdicts

- **Reachable:** yes — the spotter skill is earned by ordinary foraging within the leg (skill 1 in ~5 days of daily foraging), the faster-recognition benefit fires 130 times in the wild, and every village reached wave 3 with a living, fed population.
- **Fun:** yes — the transcripts read like people (Darnell's pods and stolen joy, Mateo's sleep currency, Leroy's guarded illiteracy), and the villages that survived did so with food in the pantry and plants in the Codex.
- **Winnable:** partial — 4/4 panel villages alive at day 43 with standing to build on, but this leg ends before regional/national; the link-less-standing question stays with the scale leg, and the full seat is still ahead.

## Notes for the next run

- **Rotation:** stays `2` (deepening next) — verified by read-back at closeout. The adoption list's "2→3" was an error; see header.
- **Next blank (r193, deepening):** carried from r192 — PARTNERBLOCK watch (REPETITIVE thin, n=4); AWAY watch (REPETITIVE thin, n=3); knowledge-goal thin engagement + Nora top-null (one-brain); bank_veterans GOALS-FAULT thin (one-brain); moot metric correction (rename `knowMoot` to `mootMentions` or count moot EVENTS — the pile reading is wrong); Wolfgang injury-secret "can't stop" template bleed; Ivan gossip-chain pick repetition.
- **Carried (unchanged):** medicine holder-less levers brief (goal hidden_files/medicine-holderless-levers-brief-2026-11-13.md — build arm build-medicduty-h owns it); Steve's open calls (r129 terrain-pocket bar, gating recalibration, answercourt cost); richer medicine design owed; reaper restructure nod owed.
- **Held tree (INSPECT HELD WORK, Steve 2026-10-27):** `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 5+ days stale) still holds the unlanded revert of the live sim-wideduty-a medic-duty code in `src/js/game.js`. Real work-in-progress, not scratch — not released, not touched. Flagged again.
- **Adoption lesson:** the r139 coordinator's hbloop died with it (PID 3305, no live processes at adoption) and its lock outlived it by ~2h. The heartbeat is the liveness signal; the lock alone is not. The adoption itself heartbeated immediately and restarted the loop before any other work.
