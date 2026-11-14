# journey-deepening r189 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261113T1845CST`, scheduled Fri 2026-11-13 18:45 CST (00:45 UTC Nov 14; run started 01:08 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Rotation discrepancy (recorded, not re-scored):** r188's run note claims "Rotation 2→3 written at closeout", but the file read `2` at this run's start (mtime 2026-11-14 01:07:21Z — one minute before this run's first command). The write flap was active all evening Nov 13 (flap-watch log: FAIL windows 01:22:55Z and earlier; this run's own first heartbeat failed EPERM at ~01:23Z). Most likely explanation: the flap ate r188's closeout write. Ground truth is the file: this run plays deepening again and will verify the 2→3 write sticks at closeout.
- **Base:** local master `a1d201e8e` (sim-transplant-round-2215 tip; verified in worktree: `git log` HEAD = a1d201e8e, branch `journey-deepening`, status clean). `git pull` no-op (already up to date). No push; the ship loop owns pushes.
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 01:11:50Z; registration took ~9 min — the register's internal reaper + REGISTRY.lock contention with a sibling sim-transplant4-a registration).
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `playtest-loop-a-20261114T010819Z` (created 01:08:19Z; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r189.sh`, 10-min cadence, started 01:24:25Z (PID 10667, setsid-detached; verified alive). First explicit heartbeat failed on the write flap (EPERM at write, ~01:23Z); retry landed 01:24:17Z.
- **Policy:** competent. Seeds: fresh **100051–100058** (8-seed panel); smoke **100050**. Freshness verified: 0 hits for 100050–100069 in all `*-prereg.md` under evidence/ (grep ran 2026-11-14 ~01:30Z). DAYCAP=100. CONVO_DAYS [45, 60, 80].
- **Single-seed-per-process (r183 adoption finding):** every seed runs as its own `node` invocation, parallel across processes.

## Pre-flight notes (this run)

- Main tree clean at run start; disk 38%.
- Worktree reaper (pre-flight run): removed nothing; 12/16 active; LOUD dirty trees all other agents' — left alone, except one held tree inspected (see below).
- **Held-tree inspection (INSPECT HELD WORK, Steve 2026-10-27):** `journey-scale-attr` (owner oversight-playtest-loop, heartbeat 2026-11-10 06:08Z, 3 days stale) holds uncommitted changes: staged analyzer/test script edits + an unstaged `src/js/game.js` change that REMOVES the sim-wideduty-a medic-duty code (`isMedicDutyEligible` + the duty-holder-as-camp-healer branch) still live on master. HEAD (874c89f89) is already an ancestor of master, so its commits are landed; the uncommitted game.js change is an unlanded revert of live code — real work-in-progress (or a stale revert attempt), NOT scratch. **Not released, not touched** — flagged here and in the memory log for the main session. This run's leg is deepening; landing another arm's 3-day-old mixed tree is not this run's job.
- **Combat-play gate (Steve 2026-10-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches driver/analyzer instrument code only (+ possibly a conversation-flow fix if Q1 diagnoses a single clear defect — same exemption as r188). The gate does not bind it.

## Standing context (read before scoring)

- **r188 (deepening, landed 2026-11-13, commit 6293eca0d):** Q1 V-INIT scan REPAIRED (67 true sittings, 0 false positives; telemetry agrees). Q2 double-ask FIXED IN BASE (commit 1decd5bee, journey-scale r134; 0/135 this panel vs 22/99 on the r187 corpus). Census: 5/8 survived to day 100–101, every village reached wave 4, standing 100–492, starvation 0. **Carried fix, this run's Q1: the Stan true-no-thread re-ask orphan** — seed 100047 d60, Stan: "About the food I needed — the need hasn't gone anywhere. I'm still asking." No earlier sitting with Stan ever named that need; the r188 note says "a re-ask thread fix needs its own proof + panel". This run IS that panel.
- **r187 (deepening, landed 2026-11-12, commit 152e77ef3):** SECRET-SILENT watch CLOSED (FIRES). Place-knowledge thinness watch CLOSED on r188 (16/135 sittings with places known).
- **Carried (not this run's to build):** Baraka unvoiced raise; Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side — Loop B bisect is the top job); scholar-payment open item (Steve-call); scale.json baseline regime re-label; preserve_food has no villager-side job; taken-kin pod sentence / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) — this run's change is dialogue/instrument-only, so the pair is carried, not rebuilt; reaper-lock self-contention fix (Steve-approved 2026-11-12 — needs the build, not this run).

## Q1 (PRIMARY) — RE-ASK-ORPHAN TRACE (Stan r188, the carried fix)

**The question.** On a fresh panel, do true-no-thread re-ask orphans recur — and what code path produces them? The r188 orphan scan is transcript-only: it cannot tell whether the favor's original ask was spoken in a sitting the driver never recorded (the competent policy talks via `Game.talkTo` during daily play; the driver never transcribes those — r188 driver line 2282) or was never spoken at all.

**What static tracing established before the panel (recorded so the trace can confirm or refute it).**
- The re-ask variants live in `convoFavorFollowup` (`src/js/convo-wants.js:2485-2488`, state `'asked'` branch), called from exactly three sites: the ask_favor opener's fromSeed branch (convo-wants.js:692), its inherited-ask branch (:721), and the stage-0 guard in the alive:want turn handler (conversation.js:7017).
- A favor is born `state: 'asked'` the moment `convoBuildFavor` builds it (convo-wants.js:2173) — birth and speaking are NOT the same event; the opener returns `favor.line` and the sitting speaks it, unless the opener is preempted or the line is ledger-blocked.
- Seeds are planted only at conversation end (`convoResolveWant` → def resolve / `favorSettleReplant`), and the phantom-seed rule (Steve 2026-10-07) refuses seeds for stage-0 wants — a seed implies the ask surfaced. Seeds expire after 7 days (`convoCheckSeeds`).
- Stan, seed 100047: endReason survived, NO scholar death (no mantle, so the inherited branch cannot fire); the d60 want carried NO fromSeed marker and stage was 1 (the non-seed want branch sets stage 1; the seed branch sets stage 2); no earlier Stan sitting exists in the corpus at all; the food_share fresh line is one of 18 opener×detail×anchor variants, none shaped like a re-ask. No static path explains the d60 opener line — the trace must.
- **Hypotheses to adjudicate:** H1 — the stage-0 guard (conversation.js:7017) fired in the same sitting: the fresh line was ledger-blocked, so the fallback re-ask phrasing spoke for a favor built seconds earlier and never heard. H2 — a policy talkTo sitting asked Stan earlier and planted a seed, and the fromSeed marker was dropped somewhere between selection and the transcript. H3 — the seed branch ran but the driver's want read missed fromSeed (ruled out by the driver's read order — recorded for completeness).

**The instrument (driver-side wrappers, zero src/js change).**
- Wrap `convoBuildFavor`: log `{favorId, vid, short, kind, day}` per build.
- Wrap `convoPlantSeed`: log `{vid, wantId, favorId, day}` per plant.
- Wrap `convoFavorFollowup`: log `{vid, favorId, short, state, day, site}` where `site` is the call-site name parsed from a captured stack (opener-fromSeed / opener-inherited / stage0-guard / other).
- At each driver sitting start/end: snapshot `favorLedger[vid]` + `convoSeeds[vid]` into the per-seed JSON as `favorTrace`.
- Analyzer: for each REASK_OPENER firing, join to the trace — build day, prior driver sittings with that vid, call site, fromSeed flag. Classify: SPOKEN-BEFORE (an earlier driver sitting named the short), NEVER-SPOKEN-SAME-SITTING (favor built this sitting, no prior sitting), NEVER-SPOKEN-EARLIER-BUILD (favor built earlier, no prior sitting named it), FROMSEED (want carried fromSeed — scan artifact, not an orphan).

**Pre-registered decision.**
- If ≥1 true-no-thread orphan recurs AND the trace shows NEVER-SPOKEN (either shape): verdict **DIAGNOSED** — name the call-site path. If the path is a single clear defect, build the fix + proof test in this run and re-run the panel before/after (driver unchanged; fix in `src/js/conversation.js` / `src/js/convo-wants.js`). If the trigger is ambiguous or needs a design call, carry the diagnosis with the transcript + trace evidence — no fix, no re-scoring.
- If orphans recur but all trace to SPOKEN-BEFORE (ask happened in an unrecorded policy talkTo sitting): verdict **INSTRUMENT-ARTIFACT** — the scan's transcript-only window is the gap; the fix is to carry the favor trace as the scan's source of truth (analyzer change, no game change).
- If 0 orphans: verdict **NOT-REPRODUCED** — Stan stands as a single observed roughness; the scan stays as a carried watch.

## Q2 (SECONDARY) — DOUBLE-ASK CARRIED WATCH

**The question.** Does the same bond ask line speak twice in one sitting on a fresh panel (r134 fix regression check)? Instrument: the r188 double-ask scan, unchanged. **Pre-registered decision:** 0 → WATCH-CLEAR (stays a carried watch); ≥1 → read in full, name the trigger path from transcript + code; if a single clear path, fix + proof + before/after re-run, else carry the diagnosis.

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SECRET-PROBE funnel (sharedEnd is the game-level count), GUARDLINES on the r134 6-line pool, FAVOUR-BLOCK / PARTNER-BLOCK / AWAY re-verify under the r130 rotation, PLACEPROBE, REQUESTS, B-SIT / B-FOLLOW / P-KEEP / RE-ASK / FIZZLE / MENU-FLIP / LANGGATE / LANGARC / REPLAY / D-THING / RAJ-PHOTO, GOALJOIN, TRUST. PANEL VERDICTS read as before.

## Shape

prereg → driver fork (r188 → r189: seed band + run tag + EVIDIR date + favor-trace wrappers; no other driver change) → analyzer fork (r188 → r189: orphan-trace join + proof test; no other scan change) → smoke 100050 × DAYCAP=45 → pilot 100051, 100052 × DAYCAP=100 (single-seed processes; pilot gates: crash, census errors > 0, 0 census rows) → 8-seed panel 100051–100058 (single-seed processes, parallel) → analyzer verdicts (fresh panel + full-transcript reads of any V-INIT / double-ask / orphan firings) → run note → gate → merge. Heartbeat loop: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r189.sh`, 10-min cadence.

## Seed freshness

Band 100050–100058. Rejected bands, all used: 100001–100049 (r129/r130/r183/r184/r187/r188 + smokes), 2501–2516 (r133/r134), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms). Freshness check (grep all `*-prereg.md` under evidence/ for 100050–100069): 0 hits, recorded above.

## Metric review (to fill at closeout)

- Q1: orphan verdict (DIAGNOSED / INSTRUMENT-ARTIFACT / NOT-REPRODUCED) + per-orphan trace classification + call-site counts.
- Q2: double-ask recurrence count + named trigger path (or WATCH-CLEAR).
- Whether the 8-seed panel was enough for the Q1 read, or the trace needs a scripted sitting.
- Whether Q2 favour/partner lines stayed VARIED (r130 rotation holds) and whether place-knowledge thinness stayed closed.
