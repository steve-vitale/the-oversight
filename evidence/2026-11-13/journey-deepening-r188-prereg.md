# journey-deepening r188 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261113T1145CST`, scheduled Fri 2026-11-13 11:45 CST (17:45 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `05aa4ce5a` (sim-silentvanish-b tip; verified in worktree: `git log` HEAD = 05aa4ce5a, branch `journey-deepening`, status clean). Origin divergence note: local master is 8 ahead of origin/master, 0 behind — `git pull` no-op, no reconciliation, no push; the ship loop owns pushes.
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`.
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-13T17:54:25Z` (created 17:54:25Z; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r188.sh`, 10-min cadence. Check the loop PROCESS is alive at each phase, not just that the script exists (r187 lesson: the nohup'd loop died silently before its first cycle).
- **Policy:** competent. Seeds: fresh **100041–100048** (8-seed panel); smoke **100049**. Freshness verified: 0 hits in `evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md` and in all `evidence/ --include='*-prereg.md'` for 100041–100049 (grep ran 2026-11-13 ~17:57Z). DAYCAP=100. CONVO_DAYS [45, 60, 80].
- **Single-seed-per-process (r183 adoption finding):** every seed runs as its own `node` invocation, parallel across processes.

## Pre-flight notes (this run)

- Main tree clean at run start (full `git status` took ~26.5 min on the saturated host; its `D` hits on `evidence/2026-11-13/journey-establishment-r85-*` were a transient index-clobber artifact from a sibling landing mid-scan: file is in HEAD at blob 9ad7e933, worktree copy hashes identically, second full status empty in 13s with warm index). Disk 40%.
- **Combat-play gate (Steve 2026-10-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue/instrument + conversation-flow code only, so the gate does not bind it (same as r129/r130/r183/r184/r187).
- **Canon (read before fixing):** docs/CANON.md + docs/CONVERSATIONS.md — "No repeats, ever: `convoPick` tracks said lines by TEXT across ALL threads per villager." The Q2 double-ask is a repeat of one line in one sitting, i.e. a canon violation, not just roughness. Bond-initiation gate read from `src/js/bond-initiation.js` (bondProposalLine pool = the analyzer's BOND_ASK_POOL, 3 lines, verbatim; stageBondProposal needs trustOf(vid) ≥ 12 + bondDriveLive + scorer win + 18% lottery + one-staging-per-day cap).

## Standing context (read before scoring)

- **r187 (deepening, landed 2026-11-12, commit 152e77ef3):** SECRET-SILENT watch CLOSED — FIRES (2 driver-sitting confessions + sharedEnd 36; the confession path was never quiet). **Carried fix, this run's Q1: V-INIT scan is broken** — bondSittings=2, both false positives on "outing" (a water-haul outing ask, Greta d34; an outing resume), while the REAL staged proposal — "You and me — we should be bonded. Not just neighbors. Will you stick with me?" (Chantal d34, seed 100033) — did NOT match ("bonded" isn't in the regex). Telemetry is authoritative until the scan is fixed (BOND-TELEMETRY: proposals 66, decisions 26, accepts 11, scholarTargeted 30). **Carried roughness, this run's Q2: Chantal double-ask** — the proposal speaks twice in one sitting: opener line, generic "Yes." answer, teaching wander, then the SAME line re-surfaces verbatim with the bond:accept/decline menu and the player accepts. Bond DID form; reads slightly odd. Mechanism hypothesis: the generic yes doesn't consume the pending proposal, so the held beat (`c.bondPending`, conversation.js) is re-spoken by a continuer later in the sitting.
- **r184 (deepening):** place-lesson rotation CONFIRMED in the wild; guard-beat dial CLOSED. **Watch carried: place-knowledge thinness** — only 3/99 sittings with any place known on r187 (vs 15/51 on r184); no agency-code change between bases, read as seed variance; re-check this panel via carried Q1-PLACEPROBE.
- **Carried (not this run's to build):** Baraka unvoiced raise; Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side — Loop B bisect is the top job); scholar-payment open item (Steve-call); scale.json baseline regime re-label; preserve_food has no villager-side job; taken-kin pod sentence / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) — this run's change is dialogue/instrument-only, so the pair is carried, not rebuilt; reaper-lock self-contention fix (Steve-approved 2026-11-12 — needs the build, not this run).

## Q1 (PRIMARY) — V-INIT SCAN REPAIR (r187's carried fix)

**The question.** Does the repaired scan find the villager-initiated bond proposals the telemetry says are there, without flagging outing/task asks? The r187 scan failed both ways (2 false positives, 1 false negative on the one true proposal).

**The fix (analyzer-only, `analyze-journey-deepening-r188-20261113.js`).**
- Counted V-INIT-BOND = a THEM line whose normalized text is an ask line (`isAskLine` → 'bond' from the 3-line BOND_ASK_POOL, or 'link' from the linkRaiseLine templates) OR matches /bonded|stick with me|bonded friend|watch each other's backs/i.
- Bare `outing` leaves the counted regex entirely. The broad shapes (join me, travel together, link village, covenant, trade pact, be my partner/ally, let's go/hunt/forage together) move to a V-INIT-CANDIDATE list printed for manual review, never counted.
- Regression corpus in the analyzer proof test: synthetic transcripts replicating the r187 shapes — Chantal's true proposal line (must count 1), Greta's water-haul outing ask ("I know the creek bend... come with me and we'll fill packs before dark" — must count 0), the outing resume ("We still have the outing to finish" — must count 0), a link-raise line (must count 1).

**Pre-registered decision.** Run the fresh 8-seed panel with the repaired scan.
- If ≥1 true V-INIT sitting is flagged AND 0 task/outing asks are flagged: verdict **REPAIRED** — the scan now agrees with telemetry on the sitting set; read every flagged sitting in full (people check).
- If the scan still flags a task/outing ask: verdict **FIX-INCOMPLETE** — diagnose which shape fired, do not re-score; the fix is reworked, not waved through.
- If 0 sittings flagged while BOND-TELEMETRY scholarTargeted ≥ 1 on the panel: verdict **SCAN-BLIND** — name whether the staged proposals expired before a driver sitting (r187's binding stage: lottery/scorer/cap + 2-day expiry) or the scan missed a shape; not a defect verdict on the game.
- The BOND-TELEMETRY panel line is the cross-check: every staged proposal that reaches a driver sitting must be flagged by the scan.

## Q2 (SECONDARY) — DOUBLE-ASK CENSUS (Chantal r187, canon: "No repeats, ever")

**The question.** Does the same bond ask line speak twice in one sitting on a fresh panel, and which code path re-speaks it?

**Instrument (analyzer-only):** scanDoubleAsk — per transcript, count sittings where the same BOND_ASK_POOL / link-raise line appears ≥2 times as THEM lines; record the YOU picks between the two speakings and the menu offered at the second speaking (bond:accept/decline vs generic). No driver change; transcripts already record every line.

**Pre-registered decision.**
- If ≥1 double-ask recurs: verdict **RECURS** — read each in full and name the single trigger path from the transcript + code (opener-carried record vs `c.bondPending` held-beat continuer vs beat re-speak). If the diagnosis is a single clear path, build the fix + proof test in this run and re-run the panel as before/after (driver unchanged; the fix is in `src/js/conversation.js` / `src/js/bond-initiation.js`). If the trigger is ambiguous or the fix needs a design call, carry the diagnosis with the transcript evidence — no fix, no re-scoring.
- If 0 recur: verdict **NOT-REPRODUCED** — the r187 case stands as a single observed roughness; the scan stays as a carried watch for the next deepening panel.

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SECRET-PROBE funnel (r187 instrument carried — sharedEnd is the game-level count), GUARDLINES on the r134 6-line pool, FAVOUR-BLOCK / PARTNER-BLOCK / AWAY re-verify under the r130 rotation, PLACEPROBE (place-knowledge thinness watch), REQUESTS, B-SIT / B-FOLLOW / P-KEEP / RE-ASK / FIZZLE / MENU-FLIP / LANGGATE / LANGARC / REPLAY / D-THING / RAJ-PHOTO, GOALJOIN, TRUST. PANEL VERDICTS read as before.

## Shape

prereg → analyzer fork (r187 → r188: BOND_THEM fix + DOUBLE-ASK scan + proof test; no other scan change) → driver fork (r187 → r188: seed band + run tag + EVIDIR date only) → smoke 100049 × DAYCAP=45 → pilot 100041, 100042 × DAYCAP=100 (single-seed processes; pilot gates: crash, census errors > 0, 0 census rows) → 8-seed panel 100041–100048 (single-seed processes, parallel) → analyzer verdicts (fresh panel + full-transcript reads of any V-INIT / double-ask firings) → run note → gate → merge. Heartbeat loop: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-hbloop-r188.sh`, 10-min cadence.

## Seed freshness

Band 100041–100049. Rejected bands, all used: 100001–100040 (r129/r130/r183/r184/r187 + smokes), 2501–2516 (r133/r134), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms). Freshness check (grep all `*-prereg.md` under evidence/ for 100041–100049): 0 hits, recorded above.

## Metric review (to fill at closeout)

- Q1: scan repair verdict (REPAIRED / FIX-INCOMPLETE / SCAN-BLIND) + false-positive/false-negative counts vs telemetry.
- Q2: double-ask recurrence count + named trigger path (or NOT-REPRODUCED).
- Whether the 8-seed panel was enough for the Q1 read, or the watch needs a scripted sitting.
- Whether Q2 favour/partner lines stayed VARIED (r130 rotation holds) and whether place-knowledge thinness persisted.
