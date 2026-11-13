# journey-deepening r188 — deepening leg (days 40–80), Lane A

- **Run:** `playtest-loop-a-20261113T1145CST`, scheduled Fri 2026-11-13 11:45 CST (17:45 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing.
- **Base:** local master `05aa4ce5a` (sim-silentvanish-b tip; verified in worktree: `git log` HEAD = 05aa4ce5a, branch `journey-deepening`, status clean). Origin divergence note: local master is 8 ahead of origin/master, 0 behind — `git pull` no-op, no reconciliation, no push; the ship loop owns pushes.
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered ~18:13Z; slow checkout ~8.4 min on loaded host).
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-13T17:54:25Z` (created 17:54:25Z; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r188.sh`, 10-min cadence, started 18:21Z (PID 125668, setsid-detached; verified alive at every phase — registry heartbeat 18:21:53Z at registration, loop cycles after). The r187 lesson (nohup'd loop died silently) did not recur.
- **Policy:** competent. Seeds: fresh **100041–100048** (8-seed panel); smoke **100049**. Freshness verified: 0 hits in all `*-prereg.md` under evidence/ for 100041–100049. DAYCAP=100. CONVO_DAYS [45, 60, 80].
- **Single-seed-per-process (r183 adoption finding):** every seed ran as its own `node` invocation, parallel across processes.

## Pre-flight notes (this run)

- Main tree clean at run start (full `git status` took ~26.5 min on the saturated host; its `D` hits on `evidence/2026-11-13/journey-establishment-r85-*` were a transient index-clobber artifact from a sibling landing mid-scan: file is in HEAD at blob 9ad7e933, worktree copy hashes identically, second full status empty in 13s with warm index). Disk 40%.
- Worktree reaper (pre-flight run): removed nothing; LOUD dirty trees all other agents' — none mine, left alone. Active 14/16, cap has room.
- **Combat-play gate (Steve 2026-10-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue/instrument code only, so the gate does not bind it (same as r129/r130/r183/r184/r187).

## Q1 (PRIMARY) — V-INIT SCAN REPAIR — VERDICT: REPAIRED

**Panel (8 seeds 100041–100048 + smoke 100049 in the analyzer read, 135 sittings; analyzer `scripts/analyze-journey-deepening-r188-20261113.js`):**
- **V-INIT PANEL: bondSittings=67 transcripts=135 playerInviteOfferedSittings=89 betrayalOfferedSittings=41 candidates=1.**
- **BOND-TELEMETRY PANEL: tele=215 proposals=98 decisions=30 accepts=16 acceptRate=0.53 linkRaises=29 scholarTargeted=41 initiatedBonds=26 instrumentErrors=0 → PRESENT.**

**The scan now agrees with telemetry.** The 67 flagged sittings are all true ask lines (bond pool lines + link-raise templates, read in the V-INIT DETAIL dump): 41 scholar-targeted bond stagings + 29 link raises ≈ 67 sittings (the gap is stagings expiring before a driver sitting). The single candidate is Fatima d40 (seed 100048), the water-haul outing ask ("Another day like today and we're choosing who eats. I know the old burn east of camp — come with me and we'll fill packs before dark.") — correctly NOT counted. **0 false positives.**

**Cross-check on the r187 corpus (known data, 99 transcripts):** the repaired scan flags 47 sittings (all true ask lines), candidates=1 (Greta's water-haul line — the r187 false positive, now correctly excluded), and catches Chantal d34 (the r187 false negative). The repair is proven against the corpus that exposed the break, not just the fresh panel.

**Proof test:** `scripts/test-journey-deepening-r188-analyzer-20261113.js` — 29 passed, 0 failed (cases 23–26 are the r187 corpus shapes: Chantal counts 1, Greta's outing ask is a candidate not a bond, the outing resume counts neither, a link raise counts 1). RED mode verified: against the r187 analyzer, (22) fails and (23) crashes `scanVInit is not a function` — the new cases genuinely exercise the new code.

## Q2 (SECONDARY) — DOUBLE-ASK CENSUS — VERDICT: FIXED IN BASE (journey-scale r134)

**Panel: DOUBLE-ASK PANEL: doubleSittings=0 transcripts=135.**

**The prereg's 0-branch said NOT-REPRODUCED — the evidence says more than that.** The cross-check on the r187 corpus finds **22 double-ask sittings in 99 transcripts** — Chantal was not a one-off, it was one of 22 (bond and link kinds alike; between-picks almost always open with the generic `gq:yn:yes` or a betrayal pick, and the second speaking carries the `bond:accept` / `link:accept` menu). The 0/135 on this panel is therefore not luck: the behavior changed between bases.

**The commit is `1decd5bee` (journey-scale r134, "spoken raise keeps its answer window", landed 2026-11-12, in this base but not r187's).** Its diff names the mechanism verbatim: the old order held an opener-carried ask as `c.bondPending`/`c.linkPending` instead of recording it spoken, which "let the continuer re-speak it verbatim later (the double-serve the r153 OPENER-CARRIED SKIP guards against)". The fix puts the opener-carried check first (`recordStagedBeat` before any hold) and keys the answer menu on per-sitting spoken flags (ASK UNION), so a spoken ask is answerable in the sitting where it was heard. The r134 panel evidence (21 raise talks, 0 spoken-but-unanswerable, 5 properly answered) matches this panel's wild read.

**Wild proof the fix holds AND the ask stays answerable:** BOND-CHOICE PANEL: sittingsOfferingBondOrLink=68 answered=68 unanswered=0 → ANSWERED. The Soo sitting (seed 100041 d17, read in full) is the shape done right: the proposal opens with the exclusive `(bond:accept,bond:decline)` menu at once, the player accepts, "Stick together, then." — spoken once, resolved at once, and the conversation continues into honest company ("This is nice. Just — being around people. I forget how much I need it."). No fix owed in this run — the fix already landed and is proven in the wild. The double-ask scan stays as a carried watch.

## People check (transcripts read in full)

- **Soo d17 (seed 100041)** — bond proposal, answered at once (above). A cautious ER nurse who wants company; the bond forms and the sitting stays hers.
- **Chantal d34 (seed 100033, r187 corpus, re-read for the cross-check)** — the double-ask shape: proposal, generic "Yes.", teaching wander, same line again with the bond menu, accept. Reads slightly odd, resolves honestly. This is the last wild occurrence on record; the r134 fix removes the mechanism.
- **Stan d60 (seed 100047)** — the one true-no-thread re-ask orphan (see Q4): "About the food I needed — the need hasn't gone anywhere. I'm still asking." No earlier sitting with Stan ever named that need, so the re-ask presumes a shared history the player never saw. The sitting itself resolves fine (commit → promised). Minor coherence gap, carried as a watch — a re-ask thread fix needs its own proof + panel.
- **Guard lines (18 firings, all 6 kinds):** guard-shut 2, guard-hear 4, guard-nothing 5, guard-sit 4, guard-nod 2, guard-passes 1. The r134 6-line pool reads honestly.
- **Confessions (5 fired in driver sittings, sharedEnd 35):** the secret path fires; funnel in Q4.

## Q3 (census) — the villages in plain words

5/8 survived to day 100–101 (4–11 people alive); 3 lost (100042 scholar-death-no-successor d101; 100043 scholar-death-no-successor d75; 100044 scholar-death-no-successor d94). Every village reached wave 4; standing 100–492, regional (6) / global (2: 100042, 100047); ladder stage 2–3; first standing day 14 everywhere. Deaths 47–100 per village, dominated by 'villager combat' (27–38) + expeditions + the wild — the survival-collapse shape (dying fighting, not hungry), carried, Loop B's hunt. Starvation 0 on this panel.

The villages know things and use them. Plants known up to 49 per villager; the Codex grew 74–92 entries per village. Monster meat is hauled, tested, and cooked on every seed: 16–50 kills, 3–17 tests, 3–16 reveals, 0–14 dinners (100046: 23 kills, 3 tests, 0 dinners — tested but never eaten; variance, not a verdict). **Places are no longer thin** — 16/135 sittings with a place known (vs 3/99 on r187), 20 place frames, 4 distinct, 5 each — the r187 thinness watch closes as seed variance. Bonds are alive: 98 proposals panel-wide, 30 decided, 16 accepted (53%), 29 link raises, 41 scholar-targeted. Requests staged 93, decided 68.

Per seed: 100041 survived d100 (9 alive, wave 4, standing 225, regional, ladder 3); 100042 lost d101 (scholar-death-no-successor; wave 4; standing 492, global); 100043 lost d75 (scholar-death-no-successor; wave 4; standing 100, regional); 100044 lost d94 (scholar-death-no-successor; wave 4; standing 200, regional); 100045 survived d101 (4 alive, wave 4, standing 145, regional); 100046 survived d101 (11 alive, wave 4, standing 245, regional); 100047 survived d101 (10 alive, wave 4, standing 311, global); 100048 survived d101 (4 alive, wave 4, standing 235, regional).

## Q4 (carried, read-only)

- LADDER: opens 9/9, mints 5/5 tracks (9/9 each), holds 7/9, firstDays all 14 → LADDER-OPENS + LADDER-MINTS + LADDER-HOLDS.
- REQUESTS: staged 93, decided 68, expired 24 → REACHED. BOND-CHOICE answered 68/68. B-SIT: 41 betrayal sittings, accept 22 / decline 19 / unanswered 0. B-FOLLOW: 36 followups, 12 with new betrayal. P-KEEP: 28 threads (NAMED 5, DEAD 7, SILENT 9, NO-LATER-SITTING 7). RE-ASK 0. RE-ASK-ORPHAN 7, 6 fromSeed-origin, **1 true-no-thread (Stan d60, seed 100047 — see People check)**. FIZZLE 0 — fix holds. MENU-FLIP 0 (101 listen turns). LANGGATE NOT-REPRODUCED (offers 86, 0 'none'). LANGARC ARC-FIRES (18 sittings, 6 grants). REPLAY 0. D-THING 18 pocketed / 10 testable / 3 named. RAJ-PHOTO 0.
- SECRET-PROBE funnel: sittings 135, trust≥40 128, eligible 62, branchReached 7, fired 5, sharedEnd 35 → FIRES. Displaced 55 (request 74 + want 30 threads own the opening), sharedAlready 20, acuteTrue 26, secretUnknown 31.
- GOALJOIN: HEALTHY on party_up, build_standing, food_security, bonds, safety; NO-DATA on gear_up, bank_veterans, knowledge (per-seed; panel read as before).
- TRUST: TRUST-EARNED-ONLY (0 stranger gains panel-wide).
- FAVOUR-BLOCK: VARIED (15 total, 4 distinct, maxRepeat 6). PARTNER-BLOCK: VARIED (16 total, 4 distinct, maxRepeat 7). AWAY: VARIED (13 total, 4 distinct, maxRepeat 5). PLACEFRAME VARIED (21 frames, 4 distinct, maxSameFrame 1).
- CISTERN clean (0 bad, 0 good). DEBRIEF 3/3 attributed (all scholar-death-no-successor).
- Q1-VARIETY REPETITIVE (5 answered, 3 distinct, maxRepeat 3 — thin sample, same shape as r187). Q1-TEACHFRAME REPETITIVE (40 frames, 4 distinct, maxSameFrame 3).

## Metric review

- Q1: verdict REPAIRED — 67 true sittings flagged, 1 candidate correctly excluded, 0 false positives; telemetry cross-check (41 scholar-targeted + 29 linkRaises ≈ 67) and the r187-corpus cross-check (47 flagged, Chantal caught, Greta excluded) both agree. The 8-seed panel was enough; the scan is now the authoritative count on the sitting set, telemetry on the run set.
- Q2: verdict FIXED IN BASE, not the prereg's NOT-REPRODUCED — the cross-check proved the shape was systematic on r187 (22/99) and the commit that removed it is identified (1decd5bee). The prereg's 0-branch under-described the case; the correction is recorded here, not re-scored. The scan stays as a carried watch.
- Place-knowledge thinness (r187 watch): closed — 16/135 sittings with places known, frames 20/4-distinct. Seed variance, as suspected.
- The one new signal is the Stan true-no-thread re-ask orphan (1/7) — a watch item, not a fix in this run.

## Telemetry

`telemetry-check.js` vs the deepening baseline (guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths; 8 panel seed JSONs frozen in `hidden_files/evidence/2026-11-13/r188-panel/`): **quiet, no large deviations**. Baseline NOT rolled forward: the panel is a probe panel, and the baseline stays until a future run decides otherwise.

## Landing

- **Gate (full check.js --quick, 2 runs):** run 1: 335 passed, 5 failed in 811s; run 2 (logged): 334 passed, 6 failed in 1075s. All 6 adjudicated: 3 exact-120s load timeouts (living-garden, one-person-army, capable-bot — all re-run standalone, ALL exit 0: capable-bot 42/0; logs `evidence/2026-11-13/rerun-*.log`) + 3 pre-existing staleness (measurement-proof-update, measurement-workflow, phone-frame-proof stale receipt — identical to r187's gate adjudication; this run touches no src/ files, so it cannot cause them). **Gate: GO.** Analyzer proof 29 passed, 0 failed (re-run in gate context and again post-rebase); `validate-ontology.js` not re-run (no src/js module added or renamed — the change is scripts/ + evidence only).
- **Commit:** `6293eca0d` (5 files, rebased onto 88df218eb after Lane B's journey-endgame-r194 landed first; proof re-run 29/0 on the rebased tip).
- **Merge:** ff-only `88df218eb..6293eca0d`, master advanced to `6293eca0d`, ancestor verified.
- Rotation 2→3 written at closeout. Lock deleted.

## Carried (not this run's to build)

Stan true-no-thread re-ask orphan (1/7 — re-ask naming a need no earlier sitting established); Baraka unvoiced raise; Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side — Loop B bisect is the top job); scholar-payment open item (Steve-call); scale.json baseline regime re-label; preserve_food has no villager-side job; taken-kin pod sentence / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) — this run's change is dialogue/instrument-only, so the pair is carried, not rebuilt; reaper-lock self-contention fix (Steve-approved 2026-11-12 — needs the build, not this run); double-ask scan stays as a carried watch (0/135 this panel, 22/99 on the r187 corpus — if it ever recurs, the trigger is the r134 mechanism regressing).
