# journey-landing r129 — LANDING leg, terrain pocket FIXED (adoption closeout)

**Run id:** playtest-loop-a-20261113T0744Z (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28).
**Base:** local master `f7352f946`. **Rotation:** read 0 → wrote 0→1 at run start (verified by read-back; file now reads 1 — adoption does NOT re-advance).
**Adoption:** the execution pass ended before closeout (timeout). This note was written by the adoption coordinator, who re-verified every claim below from the corpora (not from the timed-out report). Gate + merge + release done in adoption; see Gate section.
**Prereg:** `evidence/2026-11-13/journey-landing-r129-prereg.md` (committed with this run).
**Panel seeds 1142–1151** (deliberate reuse, 9th run on the r121 band, sanctioned in prereg). **Fresh band 1200–1209** (scan-after only).
**Drivers:** `scripts/journey-landing-r129-20261113.js` (AFTER), `scripts/journey-landing-r129-before-20261113.js` (BEFORE, frozen point per Q1), `scripts/journey-landing-r129-probe-20261113.js` (probe, seed 1209).
**Corpora (goal hidden_files, outside repo):** `evidence/2026-11-13/landing-r129-before/`, `landing-r129-after/`, `landing-r129-probe/`, `landing-r129-scan-after/`.

## Verdict: LAND the fix — Q1 GO on all three metrics

The r128 remainder — the scholar sealed in a terrain pocket at (8,0), seed 1209 d13 — is fixed in game code, proven both directions, and absent from the AFTER panel and the fresh-band scan. D1 (garbled menu label) is fixed and live in transcripts. D2/D3 carried (see Q3). The warn_you heed-cycle filler loop is a NEW defect filed in this run (see Q3). No threshold, bar, price, or gate changed (gating freeze stands). No policy change: the BEFORE freeze is the base `src/js` (fix is game code; policy identical both sides).

## Q1 (PRIMARY) — THE TERRAIN POCKET: GO

**The fix (game.js, two sites + one dialogue line in convo-scene.js is D1):**
1. `findWalkableEntry` no longer counts ANY walkable neighbor as an exit. It BFSes the tile's connected components once, with `findPath`'s own step rules (orthogonal, or diagonal with both orthogonal sides clear), and prefers the nearest walkable cell in the LARGEST component. A sealed pocket is never the largest component on a real tile; the fallback (nearest walkable anywhere) fires only when the whole tile is pockets.
2. `startCombat` stacked spawn: when the world monster stands ON the scholar's tile (it walked into you) or the source cell is terrain-blocked, the first monster spawns on the nearest free cell instead of stacked on the player (seed 1209 d13: the kite at (8,0) = the scholar's tile). Two fighters never share a tile — the pack rule says "No stacking".

**M-Q1a (probe reproduces + names the mechanism): PASS.** Probe on seed 1209, BEFORE code: 3 fights, 1 with move data, stuckTurns=4, pocketFights=1 — 1209 d13, 4 stuck turns, 12 strikes, 16 rounds, won, hpEnd 85, vs the Static Kite, sealed region **6 cells**, monster inside the region. The `scholarTrace129` shows the entry: a day-3 travel step lands the scholar at (8,0) — **H1 (tile-boundary trap) confirmed**: `travelTo` placed the scholar in the sealed corner cell; `microMove` never checks whether a destination has an exit. Blocking cells: the 6-cell corner region {(8,0),(7,0),(6,0),(7,1),(5,0),(5,1)} sealed by trees. `closeStuckTurns=4` on the fight entry.
**M-Q1b (fix, ZERO pocket fights on AFTER): PASS.** AFTER panel (1142–1151): 6 fights, stuckTurns=0, pocketFights=0. BEFORE panel: also 0 pocket fights (the 1209 pocket is not in the panel band — the probe is the reproduction, the panel is the regression watch). Fresh-band scan AFTER (1200–1209): 19 fights, stuckTurns=1, pocketFights=0. The single stuck turn is one turn in one fight, not the pocket shape (≥3 stuck turns + never moved). The defect seed on AFTER: 1209 d21, scholar at (8,0) in region **79** — the main region. The fix holds where the pocket lived.
**M-Q1c (proof): PASS both directions, verified by the adoption coordinator.** `scripts/test-journey-landing-r129-pocket.js` ALL GREEN on fixed code (6 cases: pocket-1209, open-entry, diagonal-only, one-cell-pocket, no-walkable, stacked-spawn); `scripts/test-journey-landing-r129-thread-label.js` ALL GREEN on fixed code. FAIL-control run by the coordinator in a scratch copy restored byte-identical to HEAD (unfixed): pocket-1209 **4 FAILURES (exit 1)**, diagonal-only **2 FAILURES (exit 1)**, stacked-spawn FAIL, thread-label **2 FAILURES** ("We never finished — themselves."); one-cell-pocket and open-entry GREEN on both versions (preserved-behavior pins, as documented in the test). Scratch copy deleted after the control.

## Q2 — PRACTICE (carried): GO

AFTER: movedCells d1→d28=**93**, seedsWithMove **10/10**, skill0→pos 45, practiceReps 2483. BEFORE: 97, 10/10, 46, 2757. Bar (≥50, 10/10 moving): GO both sides. Hunt reps **0** on both (twelfth panel running — the hunt-assignment policy question carries; huntpractice: kills 212, huntReps=0, H1-ESTABLISHED).

## Q3 — DIALOGUE DEFECTS (r128 M5 D1–D3)

- **D1 FIXED + LIVE:** `[alive:thread:personal]` menu label rendered "We never finished — themselves." The menu now routes through `convoThreadAbout`, like the resume line and the close — "We never finished — your story." Proof test ALL GREEN (see M-Q1c); live in AFTER transcripts (1142 d6, 1147 d8, 1151 d5/d6). The stored ledger label stays "themselves" (control: the fix changes rendering, not the ledger).
- **D2 NOT FIXED, carried:** `warn_you` verbatim repeat (r128: the same warning line at turn 5 and turn 19, 1150 d6). The pool was not changed — no second line added. The verbatim repeat did **not** recur on the AFTER re-read of the same sitting (1150 d6): turn 5 delivers "I don't know what's moving out there, but something is. Keep your eyes up past the treeline." via the thread resume, turn 19 delivers "Something's been moving out past the treeline. I can't name it, but I can feel it. Don't go out alone." via the want opener — different lines via different paths. The single-line-per-path premise still stands (the repeated line is not in `src/js/convo-wants.js` — its pool home needs pinning). Carry to r130 with a pool audit; do not re-score D2 as fixed.
- **D3 NOT FIXED, RECURRED, filed:** ask:village "How are the injured doing?" answered with leadership tension ("Honestly? there's tension about who's in charge.") — same sitting, 1150 d6 turn 3, on AFTER. The answer belongs to the live tension event, not the question asked. Filed in `sim-findings.md` (r129). Carry to r130.
- **NEW DEFECT — warn_you HEED-CYCLE FILLER LOOP (filed in `sim-findings.md`, r129):** the same 1150 d6 sitting (Dauletkhan, warn_you stage 1) runs **20 turns** without the want ever advancing past stage 1. The policy picks `[dlg:subject]` "Can I ask you something else?" six times plus `[menu:more]` paging and `[observe]` (R55 wind-down NO-LEAVE fallthrough); the NPC cycles brush-offs — "Forget I said anything. What did you want?", "That can wait — it isn't going anywhere. What's on your mind?", "Anyway — that's my problem, not yours. What did you want?", "Look, forget it. You wanted something?" The `[dlg:heed]` / `[dlg:details]` options are offered at turns 0, 6, 10, 14, 18, 20 and never picked; the sitting ends unresolved (stage 3) only when the R55 wind-down surfaces at turn 20. The want has no exit pressure against a dodging player — the same brush-off variants repeat while the warning stalls. This is the SENSE-TESTING LAW's "no filler loops" violated in the heed cycle, not a policy artifact (the policy's dodge is legitimate play; the conversation must answer it). Needs content/design work (a heed that lands, a details beat that advances the want, or a wind-down that arrives sooner), not a logic fix. Evidence: `landing-r129-after/journey-landing-r62-transcript-1150-day6.txt`.

## Q4 — M-PR1 INVESTIGATION (analysis-only): CAUSE NAMED, PASSES ON AFTER

r128: M-PR1 MISSED — 1149 had two never-offered sittings (d13, d15). On the r129 BEFORE corpus the same two sittings are still never-offered, so the cause is read off BEFORE:
- **1149 d13 (Jovan, ask_favor stage 0):** the scholar LEAVES at turn 0. The want is never engaged, so no offer can fire. Not an offer-machinery defect — a sitting that ends before it starts.
- **1149 d15 (Desmond, ask_favor stage 0):** the sitting wanders into gossip (turns 2–4+); the want stays stage 0; the policy never picks the want item (`[alive:want:ask_favor]` is offered at turn 2 and passed over). The commit-offer never fires because the want is never engaged.
**Cause (both): no offer fires when the want isn't engaged.** The offer machinery is never reached; the starvation is upstream in sitting choices (early leave, gossip detour).
**M-PR1 on AFTER: PASS** — max per-seed never-offered **1** (1146 d9, 1148 d8, 1150 d10 — one each). 1149 d13/d15 are offered+promised on AFTER via path divergence (the fix changes movement, so the same seed/day reaches different sittings) — that is divergence, not a targeted fix; the Q4 cause above stands as the explanation of the BEFORE shape.

## Carried bindings (judged fresh on AFTER; BEFORE in parens)

- **M1 ALIVE-D14:** 10/10 villages alive at d28 (over=no on all 10 seeds).
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9: nine at d8, 1149 at d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger (zerodmg-v2 byTrigger {} ; no unknown-trigger lines in analyzer output).
- **M5 PEOPLE:** PASS (sense-read below).
- **Zero-DMG invariant:** `test-landing-r115-zerodmg-invariant.js` PASS on AFTER (6 fights, 0 violations) and on BEFORE (6 fights, 0 violations). Scholar-turns: AFTER zeroDmg=0, B-shape=0; BEFORE zeroDmg=1 (one no-strikes fight), B-shape=0 — seed variance in a 6-fight sample, not a fix effect.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** starvation deaths **0** (0 starvation autopsies). Hungry share not re-derived in adoption (no hungry flag in this panel's census rows; the driver summary carries no hungry key) — do not quote r128's 5/10 against this panel.
- **R73 narrow windows:** not separately re-derived in adoption (no narrow-window flag in the analyzer tails run here).
- **Mantle latency:** vacuous on this panel (mantleLog empty on AFTER — no mantle passes in d1–d28).
- **1130-d6 amnesia shape:** 0 recurrences (transcript grep).
- **Scholar-turns watch:** verb totals AFTER {player-wait 1, player-move 2, player-barrier-exit 0, player-ability 0}; no living 0-strike ≥3-move fight (B-shape 0).
- **Deflect-fallback repetition:** 0 `fellBack` flags on AFTER.
- **6394 flat fall-through:** 0 occurrences observed (transcript grep).
- **Kill-mean trend:** huntpractice kills 212 across the panel (per-seed mean not re-derived in adoption).
- **Poison re-test:** 0 live re-tests observed.
- **Q6 M7 GOAROUND:** not re-derived in adoption (R84/R85 markers absent from the AFTER driver log).
- **Personal bridge (r125 fix):** 0 repeats in a sitting on AFTER (104 sittings, 15 servings, 0 repeat sittings, 0 repeat instances) — holds.
- **Small bridge (r127 fix):** 0 repeats in a sitting on AFTER (plans/gossip/small all 0/0) — holds.
- **Q1 r126 (combat-interrupted evening chain):** presshop farUnreached **1 before, 1 after** (identical; H-ROUTE, combatInterruptedNodes=0 both) — no regression from the fix. Metric-review note: the prereg's "farUnreached stays 0" was written against r128's number; the base carries 1 on both sides of this panel, so the bar as written is not met on either side and the comparison, not the fix, is the story. Do not re-score; the regression check (identical before/after) is what binds.
- **Outingchain (r118):** CHAIN-COMPLETES-FAR on AFTER (asked 23, kept 6, deliver 1) and BEFORE (asked 28, kept 6, deliver 2). Evening-blocked 1 (AFTER) vs 2 (BEFORE).
- **Move-refusals (r128):** byReason {} (no refusals by reason on AFTER), stuckFights 0.
- **Telemetry:** `telemetry-check.js` on AFTER vs `telemetry-baselines/landing.json`: **quiet** (10 files, 4 metrics, no large deviations). Run by the adoption coordinator.

## People check (M5 — sense-read, AFTER transcripts)

- **D1 fixed in the wild:** "We never finished — your story." reads correctly in four sittings (1142 d6, 1147 d8, 1151 d5/d6); the goal-thread label is untouched ("We never finished — wanting to find a place that feels like home.").
- **1150 d6 (Dauletkhan, warn_you):** the warning lands and reads ("I don't know what's moving out there, but something is."), the mirror-back at turn 19 reads as a second, distinct warning — but the sitting is the 20-turn filler loop filed above. The defeat is legible; the loop is the defect.
- **1149 d13/d15 (BEFORE, Q4):** Jovan's immediate leave and Desmond's gossip drift both read as real people making real choices; the never-offered shape is a consequence, not incoherence.
- **1142 d6 (Dmitri):** the fixed personal-thread menu item sits naturally among the other options; no garbling, no dangling pronoun.

## Reachable / fun / winnable (leg 0, d1–28)

- **Reachable:** yes — 10/10 villages alive at d28, System contact d8–9 on all seeds, fights/outing chains/practice all firing.
- **Fun:** yes, with the filed caveat — the pocket fix removes a real softlock shape (a player walking into (8,0) was stranded with zero grid moves); the warn_you loop is the remaining dull spot in this leg's dialogue.
- **Winnable:** leg 0 is the on-ramp, not the win; the panel's job is a live village with moving practice (93 cells) and no stranded scholar — met.

## Metric review (MEASUREMENT.md §14)

- The frozen metrics bound the run: M-Q1a/b/c, Q2, M-PR1 judged exactly as preregged. No re-scoring: the presshop "stays 0" wording (above) is a prereg-number mismatch against a base property, recorded here rather than re-scored; the regression check (before == after) is what binds and it holds.
- M-Q1b's standing case (seed 1209 d13) is judged on the probe (BEFORE reproduction) + the scan-after (1209 d21 in the main region), since the panel band 1142–1151 does not contain seed 1209. The scan's single stuck turn is reported, not hidden.
- The proof tests' FAIL-control was executed by the adoption coordinator in a scratch copy (byte-identical to HEAD), not by the timed-out run — the run's report claimed it without a recorded control run. The control is now on file in this note.
- The timed-out report claimed the warn_you filler-loop defect was "documented" — it was not in `sim-findings.md` or any run file when adoption began. It is documented here and filed by the adoption coordinator (see Q3).
- Metric lesson for r130: the presshop "stays 0" bar should be written as "before == after on farUnreached, combatInterruptedNodes == 0" (the regression shape), not an absolute 0; and a prereg that names a per-path single line (D2) should pin the pool file first.

## Gate — NO-GO, adoption BLOCKED (do not merge)

`node scripts/check.js --quick` in this worktree, **329 passed, 11 failed in 1406s** (log `evidence/2026-11-13/journey-landing-r129-check.log`). Adjudication, verified by the adoption coordinator:

| Failure | Verdict |
|---|---|
| test-living-garden-deed-attainment.js (120.1s timeout) | Load artifact — re-ran standalone **exit 0**. |
| test-occupation-panels.js (120.1s timeout) | Load artifact — standalone **exit 0 (25/25)**. |
| test-one-person-army-deed-attainment.js (120.2s timeout) | Load artifact — standalone **exit 0**. |
| test-trust-observer-neutrality.js (120.2s timeout) | Load artifact — standalone **exit 0 (6/6)**. |
| test-synergy-stall.js (120.2s timeout) | Load artifact — standalone **exit 0**. |
| test-capable-bot-20261014.js (120.2s timeout) | Load artifact — standalone **exit 0 (42/42)**. |
| test-measurement-cache-flags.js (1/4, 75.4s) | Known load artifact (scores track box load) — standalone **exit 0 (4/4)**. |
| test-measurement-proof-update.js + test-measurement-workflow.js ("Proof source inputs are not current") | Staleness pair — owed to proof refresh round 11 (r134 changed src/js after b10), not a regression. |
| test-phone-frame-proof.js (receipt stale) | Known standing stale item (r135 gap: phone-frame receipt needs a browser refresh), not a regression. |
| **test-person-trust-20261108.js (FORAGE:1 vs 2)** | **ATTRIBUTABLE TO THE r129 CHANGE — BLOCKS THE MERGE.** See below. |

**The blocking failure, proven:** `scripts/test-person-trust-20261108.js` fails on the fixed code — "non-aimed errands within ±25% of prereg baseline — FORAGE:1 vs 2", FAIL 1 / pass 18, panel `{maxTrust:75, entries:54, trustedOpen:5, kinds:{LEAVE:2, WATER:215, EAT:62, VISIT:11, FORAGE:1, SEEK:19}}`. It fails identically standalone (rerun log `evidence/2026-11-13/rerun-test-person-trust-20261108.log`). The adoption coordinator ran the **pristine control** — the same test on master without the fix (main tree at `0b22103b0`; `git diff f7352f946..HEAD -- src/js scripts/sim-harness.js scripts/godpath scripts/test-person-trust-20261108.js scripts/policies` is empty, so the game code, harness, and test are identical to the worktree base) — and it **PASSES: FORAGE:2, PASS all 19**, panel `{maxTrust:53, entries:46, trustedOpen:2, kinds:{LEAVE:2, WATER:198, EAT:59, VISIT:11, FORAGE:2, SEEK:19}}`. **Determinism check:** the test re-run twice more on the fixed code gives the byte-identical panel both times (FORAGE:1, FAIL) — the difference is the code change, not dice. The movement fix changes where villagers walk, who they meet, and the errand mix (maxTrust 53→75, entries 46→54, WATER 198→215, FORAGE 2→1). The bar is brittle — ±25% on a count of 2 means a single errand flip fails — but the failure is real and caused by this change, so per the adoption brief and the repo's no-waiver rule the merge does **not** proceed.

**What the merge needs:** a decision on the trust-panel bar — re-baseline the FORAGE count for the new movement (the bar dates to 2026-11-08, before this fix), investigate the one lost forage errand as a possible movement side-effect, or a Steve call. The branch is preserved unmerged (see below); the worktree, lock, and rotation are left exactly as the run left them for that decision. No rebase was attempted (nothing to rebase onto a merge that isn't happening).

## Files committed (adoption)

- Fix + proofs: `src/js/game.js`, `src/js/convo-scene.js`, `scripts/test-journey-landing-r129-pocket.js`, `scripts/test-journey-landing-r129-thread-label.js`, `scripts/analyze-landing-r129-pocket.js`.
- Drivers + evidence: `scripts/journey-landing-r129-20261113.js`, `scripts/journey-landing-r129-before-20261113.js`, `scripts/journey-landing-r129-probe-20261113.js`, `evidence/2026-11-13/journey-landing-r129-prereg.md`, `evidence/2026-11-13/journey-landing-r129.md` (this note), `evidence/2026-11-13/journey-landing-r129-*.log` / `*.err`, `evidence/2026-11-13/journey-landing-r129-check.log`, `evidence/2026-11-13/rerun-*.log` (standalone gate re-runs + pristine-control record).
- Panel corpora stay in goal hidden_files (`evidence/2026-11-13/landing-r129-*`), outside the repo, per §15.
- No `[needs-eyes]`: correctness fix + label fix, no feel/combat/UI change for Steve to playtest.
