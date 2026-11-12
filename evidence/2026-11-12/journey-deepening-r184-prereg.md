# journey-deepening r184 — deepening leg (days 40–80), Lane A — PREREG

- **Run:** `playtest-loop-a-20261112T0345CST`, scheduled Thu 2026-11-12 03:45 CST (09:45 UTC).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2` at run start; advance 2→3 owed after landing. Never touch `journey-rotation-b.txt` or `journey-rotation.txt`.
- **Base:** local master `0436a04e0` (r133 run-note commit; verified in worktree: `git log` HEAD = 0436a04e0, branch `journey-deepening`, status clean — the chained `git status` took ~14 min on the 12G tree, output empty = clean). Origin divergence note: local master is ahead of origin/master (unpushed loop landings) — no reconciliation, no merge of origin/master, no push; the ship loop / main session owns it.
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 09:58Z, FIRST attempt — flap probe 5/5 WRITE-OK before it).
- **Lock:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock`, run_id `2026-11-12T09:55:38Z` (created 09:55:38Z; no prior lock existed). **Delete at end, re-reading it first.**
- **Heartbeat loop:** `~/workspace/worktrees/journey-deepening-hbloop-r184.sh`, 10-min cadence, started 10:13Z (PID 16954); manual heartbeat 10:12:44Z.
- **Policy:** competent. Seeds: fresh **100027–100030** (4-seed panel — pilot-scale; see Shape); smoke **100031**. Freshness verified below. DAYCAP=100. CONVO_DAYS [45, 60, 80].
- **Single-seed-per-process (r183 adoption finding):** the r183 driver leaks state between seeds in one process — run every seed as its own `node` invocation (SEEDS=<one>), parallel across processes.

## Pre-flight notes (this run)

- Main tree clean at run start; disk 38%. Worktree reaper (pre-flight run): removed nothing; 4 LOUD dirty trees (sim-siegedialog-a, journey2-social, sim-bisect-r5-cut1-a, sim-bisect-r5-cut2-a) — none mine, left alone. Active 13/16, cap has room.
- **REGISTRY FLOCK BLOCK (10:11–10:12Z):** after registration, `worktree-heartbeat.sh` timed out twice — the flock on `~/workspace/worktrees/REGISTRY.lock` was held by a stuck `worktree-reap.sh` subprocess chain from MY OWN registration (PID 13820 `bash scripts/worktree-reap.sh` + child 16454 python reaper, holding fd 200 since 09:58; earlier I killed 13679/13821, its siblings). The reaper was stuck ~14 min doing per-tree git status on this slow host. Killed 13820 + 16454 (my own registration's subprocesses; the reap is a cleanup step, registration itself had already completed), flock freed, heartbeat landed 10:12:44Z in 1.6s. The other agent's queued heartbeat (sim-bisect-r5-cut1-a) was unblocked too. **Lesson: the register script's internal reap can wedge the registry lock for the whole run — if a heartbeat ever times out, check `fuser REGISTRY.lock` + `/proc/<pid>/fd` for a stuck reap before assuming a flap.**
- **Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability tuning until the fight-play census lands. This run touches dialogue/instrument code only, so the gate does not bind it (same as r129/r130/r183).

## Standing context (read before scoring)

- **r183 (deepening, landed):** `convoTeachPlaceLine` 4-frame rotation landed + proof 16/16; before AND after panels read NO-FRAMES (0 place lessons in 16 seed-runs). Mechanism proven by the proof test; wild confirmation still owed. Named next step, verbatim: "a targeted probe (a scripted sitting with a villager who knows places) would confirm it in the wild faster than another panel." That is this run's Q1.
- **r133 (establishment, landed 2026-11-12):** preserver unit cap N=2/day, Q1 GO; metric review names the next people-check dial: the "softens" / "warmth" canned go-on responses are 11× each and rising — "a conversation-flow question is owed (what should a 'go on' actually do when the NPC has nothing soft or warm to offer?). Name it as the next people-check dial; do not fold it into a grant-path run." That is this run's Q2.
- **r130 (deepening):** favour/partner/away rotation landed; per-villager rotation proven. Q2 re-verify carried read-only.
- **Carried (not this run's to build):** Baraka unvoiced raise (French-only speaker); Stella/Nathan trap-line invitation swallowed by raise-answer template; guest deaths (Bing) prereg; survival-collapse cause (combat side — Loop B bisect is the top job); scholar-payment open item (Steve-call); scale.json baseline regime re-label; preserve_food has no villager-side job; taken-kin pod sentence / deflect pivot / quiet-place walk / stockpile / night-thread repetition items (r128 counts); r171 M2b scholar-open proof still owed; measurement-proof refresh (fresh neutral panel + `balance-proof-update.js`) — this run's change is dialogue/instrument-only, so the pair is carried, not rebuilt.

## Q1 (PRIMARY) — PLACE-LESSON WILD PROBE (r183's named next step)

**The question.** The rotation is proven in the engine (r183 proof 16/16) but the lesson fired 0 times in 16 seed-runs. Is the bottleneck (a) villagers don't know places by day 45–80, (b) the `agency:ask_field` pick is never chosen, or (c) a monster/plant lesson spends first? The probe instruments the sitting: per sitting, `placesKnown` (agencyState().know[vid].places at sitting start), `askFieldPicks` (count of `agency:ask_field` picks), `askFieldLines` (THEM lines after those picks). The analyzer summarizes the funnel: sittings → sittings with placesKnown ≥ 1 → askFieldPicks → place frames fired (via the existing PLACE_FRAME_PATTERNS).

**Pre-registered decision.** If ≥1 sitting fires ≥2 place lessons, the binding bar is distinctFrames ≥ 2 with maxSameFrame 1 (the rotation working in the wild). If 0 lessons fire again, the verdict is NO-FRAMES with the bottleneck stage named — NOT a fix failure, and NOT a re-score: the probe's finding is the bottleneck, and the fix (if any) targets that stage next run. The proof test already covers the mechanism; no new fix is built on a NO-FRAMES read.

**Instrument change (driver only, no simulation change):** runConversation records a `placeProbeSittings` entry per sitting (day, vid, placesKnown, askFieldPicks, askFieldLines) into the seed JSON; the analyzer adds `summarizePlaceProbe`. The picker is untouched — the probe observes, never steers.

## Q2 (SECONDARY, people-check dial) — "SOFTENS" / "WARMTH" CANNED GO-ON RESPONSES

**The defect class (r133 metric review).** Two canned lines fire as generic "go on" responses:
- `"Something in them almost softens — then doesn't. Not yet."` — 11× on the r133 panel (r132: 9×, rising).
- `"They hear the warmth in it."` — 11× (r132: 8×, rising).
Example from r133: the softens line fired after a gossip line about Joyce humming at the beans, where nothing soft was happening. The question: what should a "go on" do when the NPC has nothing soft or warm to offer?

**Corpora.** PRIMARY: the r183 after-panel transcripts (110/110 sittings, 8 seeds, days 45/60/80, base d33ca69f9) — the conversation code is untouched by r133's `src/js/game.js` preserver change (verify by grep before scoring). CONFIRMATION: this run's fresh 4-seed panel on current master. The analyzer adds `summarizeSoftWarm`: counts per line + every firing with its preceding THEM line (the context the response answers).

**Metric (pre-registered).** Read every firing's preceding line in full. A firing is a MISS when the preceding line carries no soft/warm content for the response to answer (gossip, logistics, a plain statement). **Defect iff MISS rate ≥ 50% on the primary corpus.** If defect: the fix is OWED, not built in this run — a convo-flow change needs its own proof test + panel, and this run's remaining time does not carry it; the run note carries the fix design (a neutral go-on line when the NPC has nothing soft/warm to offer) to the next run. If MISS rate < 50%, document as style and move on. No re-scoring mid-run.

**Amendment A2 — Q2 trigger correction, corrected again (recorded 2026-11-12 ~10:50Z, BEFORE any scoring, from reading the code + a full transcript).** Amendment A1 said the trigger is the firing turn's player pick. That is ALSO wrong. The code (`src/js/conversation.js:6370-6376`, `convo-mood.js:155-161`): `goon` is the CONTINUER — it reveals a beat QUEUED on an earlier turn ("Nothing else happens this turn — the beats belonged to the turn that queued them"). The guard beat is queued by `convoMoodShift` on the turn the player makes the warming move, flushed into `heldBeats`, and spoken only when the player later picks `goon` ("Go on" / "I'm listening" / "Take your time"). Verified in the wild (r183 after-corpus, seed 100019 day 45, Yara): the player tells her something funny (`ans:q_laugh:a_story`), she really laughs ("the first real one you've heard in days... I needed that") — the warming move — and the NEXT turn's goon pick reveals "Something in them almost softens — then doesn't. Not yet." The line is CORRECT there: she almost softens after shared laughter and holds back. **Corrected metric (final): a firing is a MISS iff the pick that QUEUED the beat — the last non-goon, non-leave YOU pick before the firing — was NOT a warming move.** The analyzer captures `triggerPick` (last non-goon YOU pick) alongside the goon `pick` and `prevThem`. All 16 firings on the r183 after-corpus carry a `[goon]` pick (scan output in the run note) — the goon pick is the revealer, never the trigger. The ≥50% MISS bar and the fix-owed consequence are unchanged.

## Q3 (census)

Plain-words village assessment per seed; waves 2–3 reached, knowledge economy (counters taught, places learned, meat tested/cooked), regional links; books close on all seeds; unattributed 0.

## Q4 (carried, read-only)

LADDER (opens/mints/holds), SURV-CONTROL-4, regression watches (langGate 0 'none', replay 0, menuFlip 0, goalLine capture >0, V-INIT, D-THING, RAJ-PHOTO), Q2-TRUST carried, all-tracks read. PANEL VERDICTS read as before. Q1-VARIETY / Q1-TEACHFRAME / Q1-FAVORBLOCK / Q1-PARTNERBLOCK / Q3-AWAY carried (r183 holds).

## Shape

prereg → driver/analyzer fork (r183 → r184, seed band + run tag + EVIDIR date only, PLUS the Q1 probe instrument + Q2 soft/warm scan; no other instrument change) → smoke 100031 × DAYCAP=45 → pilot 100027, 100028 × DAYCAP=100 (single-seed processes; pilot gates: crash, census errors > 0, 0 census rows; place-frame silence is NOT a stop — see Q1 pre-registered decision) → 4-seed panel 100027–100030 (single-seed processes, parallel) → analyzer verdicts (fresh panel + r183 corpus soft/warm scan) → run note → gate → merge. Heartbeat loop: `~/workspace/worktrees/journey-deepening-hbloop-r184.sh`, 10-min cadence.

## Seed freshness

Band 100027–100031. Rejected bands, all used: 100001–100026 (r129/r130/r183 + smoke), 2501–2516 (r133), 44001–44016 (r124), 45001–45016 (r125), 46001–46064 (enddaybeats), 47001–47040 (spandraw), 48001–48040 (mootgate), 49001–49040 (gorgeharness), 50001–50003 (journey-scale3), 51001–51008 (fightinterior), 52001–52008 (fightopen4), 53001–53008 (baseline9), 54001–61001 + 70001–77001 + 110001 (assorted sim arms). Freshness check (grep evidence + scripts + filenames) recorded in the run note.

## Metric review (to fill at closeout)

- Q1: the bottleneck stage (knowledge / ask / spend-first), and whether any sitting fired ≥2 place lessons (binding bar distinctFrames ≥ 2, maxSameFrame 1).
- Q2: soft/warm counts + MISS rate on both corpora, and whether the fix is owed.
- Whether the 4-seed pilot-scale panel was enough for the Q2 read, or the next run needs a full 8-seed panel.
- Whether Q2 favour lines stayed VARIED (r130 rotation holds).
