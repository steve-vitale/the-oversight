# Journey landing — r131 run note

**Leg:** landing (days 1–14 judged, horizon d28) · **Run:** r131 · **Date:** 2026-11-13 (CST schedule date)
**Seeds:** 1142–1151 (r121 band, 11th run — deliberate reuse, freshness verified in prereg)
**Base:** master `8c83b6a9a` (journey-scale r196; r130 D3 fix on master via `6ccbd325e`)
**Verdict: GO.** Q1 gate metric WARNED-BUT-UNRESOLVED 0 (was 1 on the r130 BEFORE); D3 0 (was 1); all Q2/Q3 bars met or identical-to-BEFORE; telemetry quiet; gate green (see below).

## Q1 (PRIMARY) — HEED fix: DONE, proof green both directions, panel confirms

**The defect, pinned in code before any edit.** The warn_you want's warning (`convoWantWarning`, the engageBeat) was spoken by two paths that never advanced the want stage, while the want-menu path (dlg:details) does:
- `alive:want` handler (conversation.js, WANT RESUME branch, stage 1–2): spoke engageBeat, then set `stage = max(stage, 1)` — stage stayed 1. Its own comment cites the arc ("0 selected -> 1 surfaced -> 2 engaged, code: convoWantEngage") but never called it.
- `alive:thread` handler with thread 'want': spoke `convoThreadBeat` (t==='want' routes to engageBeat) with no stage change.
- Wild proof (r130 corpus, 1150 d6 Dauletkhan, 21 turns): warning delivered TWICE (turn 5 via `[alive:thread:want]`, turn 19 via `[alive:want:warn_you]`) while the want sat stage 1 and ended stage 3 'unresolved'.

**Fix** (`src/js/conversation.js`, 2 sites marked `HEED-ENGAGE`): on both paths, when the engageBeat line is actually delivered (non-null), call `convoWantEngage(vid, 'engage')` — the exact transition dlg:details performs, and the guard pattern dlg:more/askwhy/comfort already use ("THREAD-COHERENT ENGAGEMENT", gap-closure 2026-10-17). Settled-favor and stage-0-opener branches untouched (not engageBeat); null beats never engage. `convoWantWarning` returns null only when ALL pool variants are ledger-blocked (rotation skips blocked variants), so a non-null return is speakable. Out of scope (note if reproduced): same shape in the gq resumeOffer path and the dlg:react 60% continuation.

**Proof test** (`scripts/test-journey-landing-r131-heed-engage.js`): **22/22 PASS on fixed code**. Cases: (1) alive:want re-ask delivers warning, stage 1→2, stage-2 menu drops dlg:details but keeps dlg:heed, re-ask stays stage 2, dlg:heed keeps stage 2, closes 'engaged'; (2) alive:thread:want resume (via dlg:subject → ask:village → dlg:subject sequence mirroring the 1150 transcript) delivers warning, stage 1→2, closes 'engaged'; (3) guard: village-thread dlg:more follow-ups leave want stage 1, no warning delivered, closes 'unresolved'. **FAIL-control RED on pristine HEAD** (scratch copy, deleted after): "case1 want engaged stage 2:: stage=1" — the exact pre-fix defect.

**Panel (10 seeds, AFTER; BEFORE = r130 corpus re-counted with the same updated instrument):**

| metric | BEFORE (r130) | AFTER (r131) | bar |
|---|---|---|---|
| WARNED-BUT-UNRESOLVED (gate) | 1 (1150 d6) | **0** | 0 |
| D3 (injured question → tension line) | 1 | **0** | 0 |
| D2 (verbatim warning repeats) | 0 | **0** | 0 |
| warnStuck10 | 1 | **0** | — |
| HEED legacy (≥10 turns, heed/details ≥3×, never taken) | 1 (21 turns) | 1 (16 turns, watch only) | — |
| D1 garbled label | 7 | 7 (out of scope) | document only |

The fixed 1150 d6 sitting (Dauletkhan, ex-crossing guard) now runs 16 turns: turn 3 "How are the injured doing?" → "Honestly? 3 people are injured; there's tension about who's in charge." (D3 fix in the wild); turn 5 thread resume delivers the warning and the want moves to stage 2 immediately; turn 6 menu drops dlg:details, offers only dlg:heed/dlg:react; rest is real content (personal: crossing-guard past life; fears: "Footsteps that stop."; past: "My crossing guard instincts keep firing at the wrong things."); ends via wind-down + "They're smiling as you go. 'Come back anytime.'" with resolution 'engaged'. The HEED legacy watch still fires because the player explored other topics after hearing the warning — legitimate play, not a stuck want.

**Analyzer update** (`scripts/analyze-landing-q1-dialogue.js`): new gate metric WARNED-BUT-UNRESOLVED (warning delivered AND final resolution unresolved/abandoned, bar 0); `warnStuck10` corrected to read the LAST stage in the sitting (r130 version counted any stage-1 line anywhere, including opening turns); legacy HEED kept as watch-only — a long sitting whose want properly engaged is a dodging player, not a stuck want.

**Test-design lessons learned while writing the proof (record):**
- Seed opener ledger blocking: identical seed notes make identical voiced seed-opener lines ("About <note> — <opener>"), which the 48-entry run ledger blocks on the next sitting, so the sitting falls through to small talk (stage 0, thread 'small'). Test uses distinct notes per case ('the warning from the treeline' / 'what moved past the treeline' / 'the warning about the woods').
- Never probe-then-reuse a villager in one run: a probe sitting speaks their single-variant warn_you opener, ledger-blocking it for the real sitting. Case 3 uses roster[4] directly (verified stage-1 opener on seed 4242) with a stage-1 assertion that fails loudly if roster gen changes.
- Some villagers open on small talk (stage 0, thread 'small') — on seed 4242, roster[0,1,4,6,10] open stage 1; roster[2,3,5,7,8,9] open stage 0.

**Follow-up (not this run):** dlg:heed calls `convoWantEngage('engage')`, not `'commit'` — so the 'heeded' resolution and warn_you's close line ("Good. Just — be careful. I mean it.") are unreachable; no warn_you menu offers dlg:commit. Heeding closes 'engaged', which is the honest current behavior. Same-shape candidates if reproduced: gq resumeOffer path, dlg:react 60% continuation.

## Q2 (carried) — PRACTICE / HUNT

- Practice: movedCells d1→d28 **98** (bar ≥50; r130: 97), **10/10** seeds moving, skill0→pos **47** (r130: 46), practiceReps **2814** (r130: 2757). **GO.**
- Hunt: kills **229** (r130: 223), huntReps **0** — the carried shape, 14th panel running (H1-ESTABLISHED: no hunt assignments resolve in the landing window). Watch-only; no hunt lever in this leg.

## Q3 (carried) — BINDINGS

- M1 alive at d28: **10/10** (over=0 on all seeds; r130: 10/10).
- M2 System contact: **10/10 by d9** (systemDay=8 on every seed; r130: 10/10, d8).
- M3 fight-log: 7 fights, 1 zero-DMG, trigger **pending-face** only — 0 unknown/mixed trigger (r130: 6 fights, 1 zero-DMG). Zero-DMG invariant test **PASS** (7 fights, 0 violations).
- M5 people sense-read: **PASS** (below).
- Personal bridge: 104 sittings, 15 servings, **0 repeats**. Small bridge: 11 servings, **0 repeats**.
- Presshop: farUnreached **1** — identical to r130 (bar re-worded per r130 metric review: "identical to the previous panel"). nearUnreached 1, hopUnreached 2 (H-ROUTE), hopReached 10.
- Outingchain: **CHAIN-COMPLETES-FAR** (kept ≥1 with haul from a far node); breaks: together-blocked 7, evening-blocked 2, press-fail 1.
- Commit-offer (M-PR1, judged against the BEFORE shape per metric review): sittings 19, offered 15, picked 15, promised 13, neverOffered 3 (one settled-favor excluded per r122); max per-seed never-offered **2** (1149 d13/d15) — **identical to r130**. 
- Topic-dwell: want dwell **136** (r130: 147), servings **43** (r130: 44). askPicks: personal 15, past 6, goal 5, village 4, plans 3, fears 3, gossip 2.
- Move-refusals: 7 moves, **0 failed**, byReason {}, stuckFights 0.
- 1130-d6 amnesia shape: **0 recurrences**. (Two "I don't remember" hits are the player's own bespoke-answer options — "I don't dream anymore. Or I don't remember." / "I don't remember. It's a blur." — not a villager forgetting shared history.)
- Miriam line: **0** "That's settled". Starvation deaths: **0**. Mantle latency: vacuous (no mantle pass fired).
- Scholar-turns: B-shape 0; player-move 7, player-wait 0, player-ability 0.

## Q4 (owed maintenance) — TELEMETRY BASELINE RE-SEED: DONE

- `telemetry-baselines/landing-split.json` re-seeded this run (old file backed up `.20261114-pre-r131.bak`): systemDay **80**, villagerDeaths **5**, monsterKills **219**, folTelemetry.fires **14**, starvAutopsies **0** (pooled mean of 10-seed panel totals, r66 precedent).
- M-Q4b on the full panel: `telemetry-check` **quiet** — 10 files, 5 metrics, no large deviations. Panel totals: systemDay 80, villagerDeaths 5, monsterKills 229, fires 13, starvAutopsies 0.

## Village assessment (plain words)

All ten villages are alive at day 28, with 11–12 people each. The System makes first contact by day 9 everywhere. Each village killed 17–25 monsters and lost about half a person on average (5 deaths across 10 villages) — nobody starved. The pantry stays fed. Villagers are practicing and getting better at real work: 98 skill cells moved, 47 skills grown from nothing, nearly three thousand practice repetitions. But nobody went on a hunt in the landing window — that's fourteen panels in a row now, and it means the villages still don't go looking for monsters on their own. The conversations are the bright spot this run: when a villager warns you about something in the trees, the game now hears that warning as a real commitment instead of letting it evaporate — the 1150 villager's warning landed, the menu changed, and the talk ended warmly instead of fizzling out.

## People check (sense-read)

- **1150 d6 (Dauletkhan, fixed sitting):** reads as a real person — injured villagers named, tension about who's in charge, a warning delivered and taken seriously, then personal history (crossing guard past, footsteps that stop) before a warm wind-down. PASS.
- **1149 d13 (Jovan):** the player leaves at turn 0; the villager never gets room to ask his favor (never-offered shape). Two naming beats still fire. Coherent — a player who walks away immediately gets no ask. Same shape as r130.
- **1143 d6 (Kupe):** 14-turn probe sitting. The player deflects the opening sleep question; Kupe shutters slightly ("Okay."), the player pages menus, watches him twice, takes a moment to think, then asks about the tension around the fire ("You feel that? The air before a storm. That's the village right now.") and winds down honestly ("I stay out of it. Mostly. It's getting harder."). A real person being deflected and then drawn back out. PASS.

## Reachable / fun / winnable

- **Reachable:** yes — System contact, favors, outings, fights, naming, teaching all fired across the panel.
- **Fun:** yes — the fixed warning arc makes the landing's central conversation feel consequential instead of looping.
- **Winnable:** the leg's job is the first fortnight; all villages alive, no starvation, kills accumulating. The binding link stays the same as ever: wild wave-4 kills, not landing survival.

## Metric review

- Presshop bar re-worded this run (per r130 review): "identical to the previous panel (r130: 1)" — farUnreached 1, met. Keep the re-wording; a single far node unreached across ten villages is the stable shape, not a regression signal.
- M-PR1 (commit-offer) judged against the BEFORE shape, not the AFTER divergence — applied this run, met (max per-seed never-offered 2, same as r130).
- Legacy HEED is now watch-only (since r131): a long sitting whose want properly engaged is a dodging player, not a stuck want. The gate metric is WARNED-BUT-UNRESOLVED.
- Proposed for next run: none. The Q1 instrument is settled; the 'heeded'-unreachable follow-up is a design question (does heeding need its own close line?), not a metric change.

## Gate

`node scripts/check.js --quick` in the worktree with `--cacheDirectory=/tmp/jest-cache-playtest`:
- First run: 331 passed, 9 failed in 930s — output truncated by `tail -40`, full failure list lost.
- **Re-run (full log): `evidence/2026-11-13/journey-landing-r131-gate.log`: 332 passed, 8 failed in 850s** (exit 1).
- **Verdict: GO — 0 attributable failures** (adjudication below; standalone re-runs in `evidence/2026-11-13/journey-landing-r131-gate-adj.log`).

| failure | cause | evidence |
|---|---|---|
| test-living-garden-deed-attainment.js (120.1s timeout) | load (check.js 120s timeout) | standalone re-run — see adj log |
| test-one-person-army-deed-attainment.js (120.0s timeout) | load (check.js 120s timeout) | standalone re-run — see adj log |
| test-measurement-proof-update.js ("Proof source inputs are not current") | pre-existing staleness (standing trio) | fails identically to r130, which verified it identically on master 249da4729; proof refresh round 12 owed |
| test-measurement-workflow.js (8 passed, 1 failed — same neutrality-proof assertion) | pre-existing staleness (standing trio) | identical shape to r130's master-verified failure |
| test-phone-frame-proof.js (3 passed, 3 failed — same three assertions) | pre-existing staleness (standing trio) | identical shape to r130's master-verified failure |
| test-telemetry-check-recorder.js (EPERM write) | flap (EPERM write) | gate log shows `code: 'EPERM', syscall: 'write'`; standalone re-run — see adj log |
| test-sw-audio-cache-20261012.js (EPERM copyfile sw.js → /tmp) | flap (EPERM) | gate log shows `Error: EPERM: operation not permitted, copyfile`; standalone re-run — see adj log |
| test-foodpower-20261014.js (ontology step) | flap (ONTOLOGY.md truncated to 0 bytes by the flap during the gate's validator run, 05:18:31Z — same signature as the 2026-11-12 ONTOLOGY.md emptying) | restore via `git checkout HEAD -- docs/ONTOLOGY.md` in a clear window, then standalone re-run — see adj log |

The gate ran through an active flap window (EPERM write refusals hit the gate itself, the registry heartbeat writes at ~05:19–05:20Z, and the flap-watch tracer's own log at 05:21:26Z on a fresh VM boot 5fbd163b after a service restart ~05:06Z). The HEED fix touches only two dialogue call sites in `src/js/conversation.js` (plus a test, an analyzer, and evidence); no failure names conversation.js, convo-wants.js, or any dialogue test, and the fix cannot produce EPERM write refusals or 120s sim timeouts. The staleness trio is the standing set (proof refresh round 12 owed, incl. r195's src/js changes).

## Bookkeeping

- Rotation: `journey-rotation-a.txt` 0 → 1 (verified by read-back). Never touched `journey-rotation-b.txt` / `journey-rotation.txt`.
- Lock: `playtest-loop.lock`, run_id `2026-11-14T03:54:34Z` — deleted at closeout after run_id verification.
- Worktree: `journey-landing-r131`, branch `journey-landing-r131`, registered (owner `oversight-playtest-loop`).
- Out of scope (documented only, never re-fixed or cherry-picked): branch `journey-landing` (r129 terrain-pocket fix, commit `59ad7c479`, awaiting Steve's (a)-re-baseline / (c)-leave-unmerged call); D1 garbled label ("We never finished — themselves."), 7 occurrences, unchanged from r130.
- Write flap: ALL-OK at 2026-11-14T04:39Z; no flap during the panel. A hard episode began ~05:19Z and was still active at 05:41Z (EPERM on /home AND /tmp writes; flap-watch A=FAIL@write errno=1, B=FAIL update-ref). It hit the gate itself (2 EPERM failures), the registry heartbeat writes (~05:19–05:20Z, 5 attempts failed), and emptied worktree `docs/ONTOLOGY.md` to 0 bytes at 05:18:31Z (flap signature — same as the 2026-11-12 emptying; restore from HEAD in a clear window, do NOT commit the 0-byte file). A service restart + VM replacement (boot 5fbd163b) hit ~05:06Z, killing the original hbloop; restarted 05:20Z (PID 10054). Heartbeat last landed 05:04:28Z; the tree is dirty (uncommitted fix + files), which protects it from the reaper while the heartbeat is stale. A sibling's `build-medicduty-h` registration held REGISTRY.lock ~04:43–05:04Z (20 min), queueing heartbeats — since cleared, no medicduty tree registered.
- Panel log: `evidence/2026-11-13/landing-r131-panel.log`; analyzers log: `evidence/2026-11-13/landing-r131-analyzers.log`; corpus: `evidence/2026-11-13/landing-r131-after/` (104 transcript files, 10 census files).
- Bonus (only after the leg mission is committed): complete the r129 fixed-side probe detail (which errand Chantal picks instead on day 28 on fixed code); delete the stale `~/workspace/scratch-fixed/` tree (0-byte game.js/convo-scene.js) if the probe is not completed.
