# Journey — social life r226 (Lane B, leg 5)

**Run:** Lane B occurrence 09:00 CST Nov 16, 2026 (run `loop2-20261116T145748Z`) — timed out after 3600s with no committed outcomes. Adopted and closed by the main session the same morning. Worktree `journey2-5`, base `ef8bd7177` (rebased onto master tip at landing — see below).

**Leg question (prereg `evidence/2026-11-16/journey-social-life-r226-prereg.md`):** does social life hold up across a full run — invitations sometimes taken, bonds proposed and answered by character, moots firing, conversations reading as people, wants surviving across sittings without drying into the "...lost my train of thought" dead line?

**Panel:** seeds 45701–45704, DAYCAP 140, policy `journey`. Driver `scripts/journey-social-life-r226-20261116.js`, analyzer `scripts/analyze-journey-social-r226-20261116.js`, helpers `scripts/journey-social-r226-helpers.js`. Panel JSONs `evidence/2026-11-16/journey-social-life-r226-4570{1..4}.json`, analysis `journey-social-life-r226-analysis.txt` (802 lines).

## Panel outcome

- 45701: d138 survived (alive 8). 45702: d140. 45703: d108 scattered (alive 5). 45704: d103 village-lost (alive 2: Olivia + Arnav).
- 500 transcripts / 508 conversations.
- **M1 GO** — plots 7; arms grievance-linked 7/7 by the reasons bar; either-direction 4/7.
- **M2** — 133 villager-initiated proposals (person 47, link 86), 33 accepted, 14 villager-person accepted, rate 0.272/village-day (anchors: r195 0.328, r200 0.177, r206 0.268, r215 0.235, r220 0.294). maxPerInitiator 13 — the combined-cap design-look threshold (≥20) not reached.
- **M3** — sometimes taken: lure accept 357 / decline 346; party 22/7; bond 6/15.
- **M4** — candidates read as people (Olivia + David Kim candidates in the analysis).
- **M5** — 4/4 past d100.
- **M6 GO** (gate definition; strict on-tile away total 53 = the known metric/gate discrepancy, not a fail).
- **M7 HOLDS** (NARR-DUP verbatimRepeats 0).
- **M8 SETTLED** (1 link formed via driver settle, 0 BLOCKED re-raises).
- **M9 HOLDS** (recap maxPresses 3, capFailures 0).
- **M10 HOLDS, FACE HOLDS.**
- **M11 GO** (recap-empty 0/168).
- **M12** — door-req flags 96/168 (19.2% of conversations, informational); **M12-native HOLDS** (threeTimes total 56, maxPerSitting 1, sittings2plus 0, exits 172).
- **Double-confession watch CLEAN** (CONFESS total 70, confessed 12, doubleSittings 0).
- Vendetta maxUnordered 4 (trend 7, 4, 2, 4 — bar retired, watch only).
- Goal-thread offers: reactOffered 3398 (agree 0, joke 0), longestContinuerRun 4.
- Moots fired (2 on 45701 — the 0-moots watch does not trigger).
- Successions on 45701: Gabriel→Morgan d58, Morgan→Esteban d78, Esteban→… d92.

## Job-B transcript reads (my own greps over the 4 panel JSONs)

- **B1 GO** — F5 settled-favor variants all served in the wild (variant counts 2/3/3 = 8 servings; r225's wild check was vacuous, this is the first real read) — with the all-blocked remainder fixed under F6 site 3.
- **B2 NO-GO — THE FINDING** (see below).
- **B3 GO** — 4 hits for "has an edge today" are all legitimate NARR mood beats ("Raj has an edge today — something curdled."), NOT resume openers quoting a drift note; other tails 0.
- **B4** — F3 (commit-refusal as memory) STILL UNPROVEN in the wild: 3 "refus" hits are the NPC's own words ("I refuse to let that be true"), no refused-bond resurface; watch, not a fail (same as r220).
- **B5** — funeral lines 19; stats per seed funerals 5/4/4/4, linksMended 20/17/14/5, kcalSpent 30000/25500/20380/7047; lines voice true kcal + outcome; the empty-pantry line is honest (45704 d98 Alfredo: "the pantry holds nothing to feed a shaken fire — Stonebridge go unmended"); per-funeral partial-vs-full split NOT instrumented (totals only) — a gap for the next run, not a fail.
- **B6** — stage-0 persistence evidence: 20/21 dry-line drops have a next sitting where the topic resurfaces (wants stay live, per the Lane A r225 fix); the direct stage-3-'deflected'-from-stage-0 count is NOT instrumented in this panel (JSONs carry no want-resolution rows).

## B2 — the finding: 21 dropped threads, ALL the dry line

By seed: 45701: 3, 45702: 1, 45703: 1, **45704: 16**. Every one is the dry line "...Sorry, lost my train of thought." The r224 F4a/F4c dry-line fixes do NOT hold in the wild.

**Mechanism** (traced via probe driver `scripts/probe-dry-r226.js`: 204 blocked-line events, 16 served dry; 432 opener events). Dry servings by want: repay 11, curious 4, ask_favor 1. All thread 'want'; recorded stages 1 (15) + 2 (1) — the stage-1 events are the alive:want handler bumping stage 0→1 before `done()`. Three sites hand `sayLine` a ledger-blocked line with no `convoWouldBlock` check:

1. The `alive:want` handler's stage-0 opener branch (`conversation.js` ~7196–7273) guards ONLY ask_favor (r53/r191/r146 rungs: followup/whyLine/needLine); repay's fulfilled-favor opener is a SINGLE fixed line ("You came through on the food I needed. I won't forget it.", `convo-wants.js` repay.opener) — Olivia dried on it 7× (probe d64–d80); a resumed curious question re-hangs via seedQid WITHOUT the F4a ledger-aware pick filter (all 4 curious dry events are fromSeed resumes, run-blocked question texts).
2. `repay.engageBeat` thanks pool (`convo-wants.js` ~1170): 2 variants via `convoPickCycle`, no ledger check.
3. The settled-favor F5 branch (`conversation.js` ~7169): 3 variants via `convoPickCycle`, no ledger check — probe d97 Olivia dried on variant 2.

**Key fact:** `convoPickCycle` is per-villager cycle memory (c.said lists); it does NOT check the cross-villager 48-entry run ledger — the r225 F5 comment claiming "the cycle skips the ledger-blocked variant" is FALSE. `sayLine` (`conversation.js:916`) substitutes `convoDryLine` on a run-block or an earlier-sitting self-block and returns the dry line TRUTHY, so callers' `!said` checks never fire; `convoWouldBlock(vid, line)` mirrors sayLine's block decision for non-exempt lines. The startConvo opener flow (`conversation.js:3699–3737`) already has the OPENER SKIP + STALE OPENER escape (`convoWantStaleOpener`, `convo-wants.js:2735`); the request-thread continuation (`conversation.js:4092`) too; the alive:want handler did not. `convoWantOpener` restores prior pendingQ and returns `{line, thread, question}`; `convoAcceptWantQuestion` is NOT called in the alive:want path (the question is never hung there — pre-existing, NOT the B2 defect; the F6 fix is behavior-preserving except dry→stale).

## F6 — the fix (landed this run, [needs-eyes])

Same class at all three sites — check the ledger BEFORE handing sayLine a line, fall to a fresh phrasing. Diff +56/−7 (`src/js/conversation.js`, `src/js/convo-wants.js`).

- **Site 1** — `conversation.js` settled-favor branch: pool hoisted to `handledPool`; after the cycle pick, if `convoWouldBlock` → try the other variants in order; all three blocked keeps the pick (rare residual, noted); the misleading r225 comment corrected.
- **Site 2** — `conversation.js` alive:want else-branch, inserted after the ask_favor guard's closing brace, before the stage bump (~line 7271): if `wline` still WouldBlocks → try the stale opener (`c.want.def.staleOpener` if a function, else `convoWantStaleOpener`), WouldBlock-checked; if fresh use it, else `wline = null` (the handler's existing `"Okay. Here's the thing —"` default speaks).
- **Site 3** — `convo-wants.js` repay.engageBeat fulfilled branch: `thanks` array (2 variants), cycle pick, WouldBlock-check → try the other variant → both blocked return **null** (callers fall through honestly: the t==='want' continuation at `conversation.js:4062` returns null → honest dry admission; the alive:want handler's null → default line).

NOT fixed (filed as remainders): repay.engageBeat broken/open pools (same class, unobserved); the all-3-blocked F5 residual.

**Proof** — `scripts/test-journey-social-life-r226-f6-dry-opener-20261116.js` (godpath-lib pattern, real sittings + real sayLine ledger; poison via ANOTHER villager's sitting, donor villager supplies the repay def, favor + want staged AFTER opening since opening a repay sitting consumes the favor via onSurfaced, poison always BEFORE opening):

- On fix: **49 passed, 0 failed.**
- On base (only the two src files stashed, explicit refs): **44 passed, 5 failed** — the 5 failures are exactly the F6 discriminator assertions (repay opener dries, curious resume dries, both-blocked thanks returns a line instead of null). Case 4 (settled-favor two-blocked → variant 3) passes on base too — the cycle happened to land on variant 3 there; it is a guard, not a discriminator.
- Stash restored with explicit `stash apply stash@{0}` + `stash drop stash@{0}`; sibling stashes untouched; fix re-verified 49/49 after restore.

**Confirmation re-run (worst seed 45704, same driver, fix in): 0 dry servings (was 16).** Output `evidence/2026-11-16/confirm-f6/journey-social-life-r226-45704.json` (+ panel log/err).

## Village assessment (plain words)

Four villages, one lost. The two that lived to day 140 did so with people still talking to each other — 133 villager-started proposals across the panel, a third of them accepted, and the social fabric held: moots fired, bonds formed, successions passed three times on 45701 without the village falling apart. The two that broke (45703 scattered at day 108, 45704 lost at day 103 with only Olivia and Arnav left) broke the usual way — people dying out in the wild, not starving at home. What was missing on the worst seed wasn't food or friends, it was follow-through: sixteen times a villager started to say the thing that mattered — thanking someone for food they kept their word on, picking up a question they'd been turning over — and the game answered with a shrug ("...Sorry, lost my train of thought."). That's the B2 finding, and it's fixed now: the same seed, same driver, zero shrugs.

## People check

Read in the panel analysis and the probe: villagers propose, refuse by character, remember what they owe. The dry line was the one place they stopped sounding like people — a villager who owes you thanks going blank mid-sentence, seven times for the same debt. The stale-opener fallback now lets them say the awkward version of the thing instead ("About the food I needed — I keep thinking..."). The "has an edge today" lines are real mood beats, not quoted notes. Funeral lines voice true pantry numbers and true outcomes.

## Verdicts

- **Reachable:** the leg's content fires across full runs (moots, proposals, successions, funerals all observed).
- **Fun:** the social fabric reads as people — except where the dry line cut threads, now fixed.
- **Winnable:** not this leg's question (social life is a full-run leg; the win chain is tracked by the endgame leg). No win movement claimed.

## Gate

`node scripts/check.js --quick` in the worktree: **331 passed, 9 failed in 1195s** (`evidence/2026-11-16/journey-social-life-r226-check-quick.log`). All 9 match the known standing/load-artifact set, **0 attributable** to the F6 fix:

- measurement-proof staleness pair (2) — standing.
- phone-frame-proof stale receipt (1) — standing.
- ladder-bundle guard side-effect (1) — standing (`control: 200 monster turns WITHOUT delivery fire the ambient raid — fires 0`).
- measurement-cache-flags 1/4 (1) — load artifact per the r187 lesson (scores track box load; r225's quiet-box A/B: pristine base 3/4, fix branch 4/4). Box load during this gate was 8–10.
- Exact-120s timeouts (4): living-garden, occupation-panels, one-person-army, capable-bot — all in the known intermittent-timeout family.
- Standalone re-runs: capable-bot **40/40 green**, occupation-panels **25/25 green**, one-person-army **7/7 green**, living-garden **8/8 green** (all four timeout tests confirmed green standalone; logs `journey-social-life-r226-onepersonarmy-standalone.log` / `journey-social-life-r226-livinggarden-standalone.log`).

## Metric review

- The B2 dry-line count is the panel's sharpest instrument: 21 drops, all one line, all traceable to three unguarded sites. It discriminates the fix cleanly (16 → 0 on the worst seed).
- M6's strict on-tile away total (53) vs the gate definition remains a known metric/gate discrepancy, not a fail — same as prior runs.
- B5's per-funeral partial-vs-full split is uninstrumented; the next social run should instrument it (totals only, this panel).
- B6's direct stage-3-'deflected'-from-stage-0 count is uninstrumented (no want-resolution rows in the JSONs); the 20/21 next-sitting resurface is the proxy evidence.
- Q3-style double-counting caution (r225 metric review) applies to any canned-line needle counted over convo txt — count per sitting, not per print.

## Telemetry

Not run as a separate check this adoption (the panel's analyzer is the instrument of record; the social leg's baselines carry the known schema-drift LOUD lines from prior runs — see r220/r225 notes). No baseline rolled.

## Closeout

- Fix + proof + driver + analyzer + panel JSONs + confirm run committed via safe-commit in the worktree, rebased onto master tip, ff-merged, tree released, branch deleted.
- Rotation B: 5 → 6.
- Lock `playtest-loop-2.lock` deleted (run_id `loop2-20261116T145748Z` verified before deletion).
- Reported to Steve in the per-run lane-loop report.
