# Journey deepening r118 — listening, unstuck + goal lines indoors

- Leg: 2 DEEPENING (days 40–80: wave 2–3, knowledge economy, regional links, scale pressure)
- Run id: 2026-11-08T01:22:39Z (Lane A, scheduled 18:45 CST 2026-11-07)
- Base: master fdff404ddfb3702f32ae20ef7ab7dc563c2ce60b (worktree registered at b1dc80086 02:13Z, rebased onto fdff404dd 02:20Z — three landings during the flap-wait: pellet-pass 685dc9ec4, endgame r156 b1dc80086, mirror-cap evidence fdff404dd)
- Seeds: 96601–96604 (fresh by the full check; 96501–96504 REJECTED — named in sim-preserverleg2-a-prereg.md, band 96500–96515 in live use) + smoke 96600 (DAYCAP=45, excluded from the panels — see metric review)
- Policy: competent, LISTEN in BOTH panels (speak_back if offered, else nv:listen every turn after the goon pass). The policy is fixed — the before-panel runs base code, the after-panel runs fixed code, same seeds. One seed per process.
- Prereg: evidence/2026-11-08/journey-deepening-r118-prereg.md (committed 84e07032)
- Infrastructure: the run waited out an EPERM write flap 01:37–02:07Z (probe loop, first window 02:07:35Z). The before-panel ran from a second registered worktree (`journey-deepening-before`, pinned to the prereg base fdff404dd) because the fixes were already committed in the main worktree for the proof tests; it is released with this run.

## Q1 (PRIMARY) — the listen-menu flip; does the arc complete?

**Binding verdicts (panel-level, per prereg):**
- Before-panel: **ARC-UNEXERCISED** — 6 nonverbal sittings, 0 grants, 0 flips. **MENU-FLIP: 6/6 sittings flipped** (17 listen turns) — the defect reproduces in the wild on every sitting.
- After-panel: **ARC-FIRES** — 5 sittings, 2 grants, 2 flips, 3 post-flip decisions, 0 unmatched flips. **MENU-FLIP: 0/5 flips** (31 listen turns) — the fix holds.

**The arc, in plain words (seed 96601, after-panel):** Petra the glazier speaks only Polish. The scholar sits with her on day 45 and listens four times — the narrations cycle ("listen hard…" → "hold still…" → "lean in…" → "listen hard…" again) and the menu keeps offering gestures every turn. That sitting crosses exposure 25: the scholar gains Polish. Petra proposes a bond the same day; the scholar declines ("Not like that. Not yet." / "Fair enough. Rain check."). The scholar dies later; the heir does not know Polish, re-learns it by listening again, and on day 80 the grant fires a second time — and Petra's bond proposal is ACCEPTED that day (comm 'partial' both times). The language opened the bond. That is the arc completing, twice over, with the payoff surviving a succession.

**What was broken (mechanism, verified in source):** the listen line was one fixed narration + one of 4 foreign phrases. The 5th listen repeated verbatim (2nd in the harness, where the phrase never renders — see metric review), sayLine's no-repeat fallback tagged the beat `endtopic`, and buildMenu's endtopic branch — which precedes the nonverbal branch — returned the verbal `dlg:subject`/`leave` menu in a no-words sitting. No gestures, no `nv:listen`, for the rest of the sitting. Before-panel: 2–3 listens/sitting, ~+7 exposure; the arc could not reach 25.

**Fixes (game code, commit 5f85ea5f):**
- A. `buildMenu` skips the endtopic early-return when the thread is nonverbal.
- B. `nvRespond` listen cycles 3 narration variants via `convoPickCycle` (first entry preserves the old line verbatim, mirroring the r72 react pools) — 4 phrases × 3 narrations = 12 distinct listen lines in the live game.
- C. `G.convoChoices` wrapper skips the agency extras (`agency:ask_expedition` / `agency:ask_field`) when the thread is nonverbal — words have no place in a no-words sitting.
- D. `speakBack` no longer appends "." to a phrase that already ends in terminal punctuation ("Eso mismo. Diste en el clavo.." → "…clavo."; the elder branch's "clavo.," → "clavo,"). Questions stay questions.
- Proof tests (RED before, GREEN after): listen-menu 19/19, goalline 8/8, analyzer 26/26.

**POLICY DECISION (binding, per prereg):** the competent player **KEEPS sitting no-language holders and listens**. The dead `npcComm` guards are removed as dead code in the cleanup commit below (they read the nonexistent `Game.npcComm` and always fell through to `{level:'full'}` — they never skipped anyone).

## Q2 — safety goal lines: the indoor channel

**Binding verdicts (after-panel): GOALS-FIXED.** Safety: tops 14 → lined 3 → indoorLined 2 → **capture 110** (before-panel: tops 15 → lined 3 → indoorLined 2 → capture 0, GOALS-FAULT). The safety line ('Better close to the fire today.') is now heard from the hall: 21/34/22/33 hits per seed. Knowledge stays GOALS-FAULT (tops 1, lined 0) — reported, not fixed (the quiet-beat design stands: SEEK gets no new beat).

**Mechanism:** safety maps only to `HAVEN_CHORE`, and HAVEN_CHORE objectives never depart — so the departure line, the only goalLine channel, never spoke for them. Fix E: `objTick`'s indoor beats (chore, finds fallback, visit) append `o.goalLine` when present. The beat fires only ~22% of day-parts per villager and only when the player is at haven, so the volume stays departure-like.

## Regression watches (both panels)

- langGate: 0 'none' offers/decisions both panels (before 29/25, after 35/29) — the r114 fix holds.
- Replay scan: 0 replays both panels — the r114 fix holds.
- SURV-CONTROL-4: **2/4 survive both panels** (before: 96601 lost d91, 96602 survived d101, 96603 lost d60, 96604 survived d101; after: 96601 lost d84, 96602 survived d101, 96603 lost d69, 96604 survived d101) — funnel unchanged. Death days moved on the two lost seeds: listening instead of leaving changes the scholar's days, so the sims diverge downstream; the survival count does not.
- V-INIT: bondSittings **1** in the after-panel (0 in the before-panel, 0 in both r116 panels) — the first villager-initiated bond sitting this leg has ever recorded. Carried question, still open (one sitting is a sighting, not a pattern).
- Bond telemetry: PRESENT both panels (before 72 tele / 39 proposals / 14 decisions / 5 accepts / 12 link raises / 6 initiated; after 78 / 43 / 14 / 5 / 13 / 8).
- Q1-REQUESTS: REACHED both panels (before 25/29 decided; after 29/32, 1 expired-talkable-untalked).
- check.js --quick: **284 passed, 6 failed** — identical to the r114/r116 baseline, no regressions.
- Telemetry check (deepening baseline, after-panel seeds): quiet — 4 files, 5 metrics, no large deviations. Baseline not rolled forward (nothing LOUD to investigate).

## Village assessment (plain words)

Two villages lived to day 101 (96602, 96604 — both panels, deterministic-identical where no nonverbal sitting happened); two scattered (96601, 96603 — scholar died with no successor). Wave 4 was faced on all four seeds. Meat: tested, revealed, and dined on every seed (19–35 kills). Bonds: 6–13 proposals per seed, about a third accepted. The after-panel's villages are the same shape as the before-panel's — the fixes change conversations, not the survival funnel. The one human story that matters: on 96601 the scholar learned Polish by listening, declined a bond, died, and the heir learned Polish again and accepted. The village still scattered — listening is not a win condition, it is a door.

## Carried items

- **Elif trust 39→92 (r116, mechanism verified in source):** `playerDeath` pays every roster member trust on every scholar death. Panel check NOT instrumented this run — the driver records no trust time-series (census trust is end-state only), so a death-day jump cannot be read from these seed JSONs. Needs a trust instrument; the design call (fix or not) stays with the main session.
- Mantle 2-day latency (r117): still open — later run instruments succession sweep timing.
- r110 nits #3/#4/#6, R70/R71 kept-promise gap, Eamon fallback live exercise: watch, not re-judged.
- The 96601 day-80 re-grant (heir re-learning Polish after succession) is the r116 mantle fix working as designed: the heir starts at 0 exposure for tongues they don't know and earns the language live.

## Metric review

1. **Grant events work.** The `langGrants` wrap recorded 0 grants before (6 sittings, no crossing) and 2 after, with 0 unmatched flips — no sitting reached 25 without a grant event, so the instrument has no gaps this run. End-state languages no longer count as flips (r116 metric-review #1): 96604 ends with Polish at level 2 and 0 grants — correctly NOT a flip (the scholar already knew it).
2. **Smoke seeds must be excluded from panels.** The 96600 smoke file (DAYCAP=45) was picked up by the analyzer's seed regex and inflated the first before-analysis (bondTele 75 vs 72, B-SIT 15 vs 13). r116's evidence dir has no 96400 file — its smoke was excluded the same way. The 96600 files now live in `hidden_files/evidence/2026-11-08/smoke-96600/`; the panel analysis was re-run on 96601–96604 only.
3. **The harness does not load foreignSpeech data.** `godpath/lib` never loads `src/data/*.json`, so in the harness `renderForeign` returns null and every listen line ends "Sounds, and the shape of meaning just out of reach." The flip therefore lands at the 2nd listen in the harness and the 5th in the live game (where the phrase renders — 4 per language, verified in the data file). Panels compare harness-to-harness, so the comparison is valid, but the absolute listen counts (17 before, 31 after) are harness numbers, not live numbers.
4. **The goalSnap is a sparse sample.** One snapshot per convo day: on 96602 day 45 the snapshot shows 2 safety tops, neither lined — yet 13 safety hits were captured that day. Objectives change through the day; the snapshot catches a moment, the capture counts the day. The join's lined counts understate the day's lined villagers; the capture counts are the ground truth for volume.
5. **The run ledger blocks across villagers.** sayLine's 48-entry run ledger means a listen line said by one villager blocks the same line for the next villager — the proof test had to call `nvRespond` directly for the narration cycle (a sitting-level check would be flaky). This is existing behavior, not a defect: it is why fix A (never flip in nonverbal) matters even with fix B (the narration still repeats on the 4th listen in the harness, the 13th live).

## What changed (commits in this worktree)

- 84e07032 prereg.
- 5f85ea5f fixes A–E + r118 driver/analyzer/proof tests [needs-eyes] (conversation feel: listen narrations, speakBack punctuation).
- (cleanup commit) dead npcComm guards removed from the driver (tooling only, zero game code; proof tests re-run green 19/19, 26/26, 8/8).
- (run-note commit) this note.

## Merge status

Merged locally, pending ship. No bump, no push, no live verification (ship loop owns those).
