# sim-pair-b98e3ef-a — bandfreeze verdicts RE-CONFIRMED on current master: b98f MOVER (exact), e3ef INERT (exact), freeze STABLE (DIAG, zero src/js)

**Arm:** sim-pair-b98e3ef-a (DIAG, zero src/js) · **Run:** fleshout-20261110T0216Z (Loop A) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-pair-b98e3ef-a, base master `1fc09bbe3` (verified: worktree `git log --oneline -1` reads `1fc09bbe3`; worktree tree clean, 0 untracked at start) · **Prereg:** `evidence/2026-11-09/sim-pair-b98e3ef-a-prereg.md` (committed `05d51b8bc` BEFORE any judged computation) · **Instrument:** DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg, 150d death-aware, band seeds 53011–53018, env PLENTYDEPRI=1 DEPOSITGATE=1. Corpora committed under `evidence/2026-11-09/perseed-pair-b98e3ef-a/` (40 files: F0r 8 + L3r–L6r 8 each). Proof `scripts/test-pair-b98e3ef-a.js` **189 passed, 0 failed, 0 skipped**.

## Verdict: BOTH FREEZE VERDICTS CONFIRMED EXACT + FREEZE STABLE ON CURRENT MASTER

This is a stability re-confirm, not a first run. The pairs were already run once by sim-bandfreeze-b (landed `52e8caec0`): b98ac0730 MOVER (5/8 with, 0 against), e3ef2b612 INERT (0/8, byte-identical daily rows). Master has since moved `fd306cac1` → `1fc09bbe3` (journey lanes and sim arms, including src/js changes in `contests.js`, `conversation.js`, `convo-dialogue.js`, `convo-wants.js`). The re-confirm:

- **F0r — FREEZE STABLE.** All 8 seeds reproduce their F0 endpoints exactly on current master — every binding field, every fallen list, every daily row. The only differing keys between F0r and F0 files are `run` and `anchorCommit` (the known anchor quirk). The post-freeze src changes are inert on the doorwalk baseline band: current master still yields the frozen endpoints byte-for-byte.
- **b98ac0730 — MOVER CONFIRMED (exact).** L3r/L4r judge MOVER under the band rule (5/8 with, 0 against), per-seed verdicts identical to bandfreeze (53013, 53014, 53015, 53017, 53018 with; 53011, 53012, 53016 none), first divergences identical (d11, d29, d21, d9, d18, d75, d15, d9), every corpus identical to bandfreeze modulo `run`/`anchorCommit`. No endpoint differs anywhere. This is the strongest confirmation the prereg's deciding rule allows.
- **e3ef2b612 — INERT CONFIRMED (exact).** L5r/L6r judge INERT (0/8 move on any field), first divergence null on all 8 seeds, daily rows byte-identical to bandfreeze on all 8 seeds. The place-line fix changes no trajectory the band can see — on current master exactly as on the freeze base.

Nothing flipped. No verdict softened, no re-freeze needed, no silent anything: the frozen reference is still the reference on current master.

## The frozen band, re-checked (F0r, current master `1fc09bbe3` — identical to F0)

| seed | days / end | standing | maxWave | seat | w4 kills / faced | fallen | living | pantry | veterans | mechanism (frozen) |
|---|---|---|---|---|---|---|---|---|---|---|
| 53011 | 150, survived | 784 | 5 | lesser d90 | 12 / 8 | 14 | 5 | 9,100 | 1/2 | combat-led |
| 53012 | 44, village-lost | 125 | 4 | none | 0 / 1 | 9 | 4 | 0 | 0/2 | starvation-led |
| 53013 | 150, survived | 370 | 5 | lesser d90 | 3 / 5 | 9 | 7 | 6,697 | 0/2 | combat-led |
| 53014 | 82, village-lost | 325 | 5 | none | 4 / 6 | 14 | 0 | 0 | 0/2 | combat-led |
| 53015 | 150, survived | 199 | 4 | lesser d109 | 0 / 1 | 1 | 11 | 16,832 | 0/2 | combat-led * |
| 53016 | 150, survived | 384 | 5 | lesser d90 | 3 / 3 | 9 | 8 | 9,531 | 0/2 | combat-led |
| 53017 | 150, survived | 199 | 4 | lesser d90 | 2 / 7 | 15 | 8 | 11,390 | 1/2 | combat-led |
| 53018 | 150, survived | 199 | 4 | lesser d90 | 3 / 6 | 16 | 8 | 10,758 | 1/2 | combat-led |

\* 53015 reads combat-led on a single death (Vasyl, contest, d106) — the classifier rule applied mechanically to n=1; the label is technically per-rule but meaningless on one grave (carried from bandfreeze § Metric review).

## Pair (b/b98f): secret-response, L3r (`992888172`) vs L4r (`b98ac0730`) — MOVER CONFIRMED (exact)

Per-seed endpoints; pair direction read off the data = standing↑ + w4↑ (fallen tied, no direction):

| seed | L3r pre-secret | L4r secret | moves (st / w4 / fallen) | seed verdict |
|---|---|---|---|---|
| 53011 | 150d surv, 199, 4, 16 | 66d lost, 199, 0, 15 | 0 / −1 / −1 | none |
| 53012 | 44d lost, 125, 0, 8 | 44d lost, 125, 0, 9 | 0 / 0 / +1 | none |
| 53013 | 65d lost, 199, 0, 7 | 62d lost, 284, 3, 4 | +1 / +1 / −1 | **with** |
| 53014 | 79d lost, 199, 3, 19 | 82d lost, 325, 4, 14 | +1 / +1 / −1 | **with** |
| 53015 | 111d lost, 199, 1, 18 | 150d surv, 495, 5, 13 | +1 / +1 / −1 | **with** |
| 53016 | 150d surv, 669, 4, 13 | 150d surv, 559, 6, 15 | −1 / +1 / +1 | none |
| 53017 | 62d lost, 135, 0, 6 | 148d lost, 695, 12, 26 | +1 / +1 / +1 | **with** |
| 53018 | 150d surv, 159, 0, 12 | 150d surv, 199, 3, 16 | +1 / +1 / +1 | **with** |

**Verdict: MOVER CONFIRMED (exact) — with=5, against=0, anyMove=8.** First divergences L3r/L4r: d11, d29, d21, d9, d18, d75, d15, d9 — identical to bandfreeze. Band totals from the corpora: wave-4 kills 12 → 33, standing 1,884 → 2,881 (see the text-total note in § Metric review — the per-seed tables above are the binding numbers). The conversation-branch change (a confession now gets an answer instead of dead-ending) re-routes seeded streams toward stronger villages on 5 of 8 seeds, on current master exactly as on the freeze base. Scope, as bandfreeze stated it: a MOVER verdict says the commit moves band endpoints consistently upward in standing and kills — it does NOT by itself prove `b98ac0730` caused the single-seed NEW→MIDDLE step (the band has no NEW/MIDDLE reference).

## Pair (b/e3ef): place-line, L5r (`5582c19b9`) vs L6r (`e3ef2b612`) — INERT CONFIRMED (exact)

| seed | L5r pre-place | L6r place | moves |
|---|---|---|---|
| 53011 | 62d lost, 199, 2, 14 | 62d lost, 199, 2, 14 | none |
| 53012 | 44d lost, 125, 0, 8 | 44d lost, 125, 0, 8 | none |
| 53013 | 65d lost, 199, 0, 7 | 65d lost, 199, 0, 7 | none |
| 53014 | 80d lost, 345, 3, 19 | 80d lost, 345, 3, 19 | none |
| 53015 | 150d surv, 754, 11, 8 | 150d surv, 754, 11, 8 | none |
| 53016 | 150d surv, 539, 7, 12 | 150d surv, 539, 7, 12 | none |
| 53017 | 52d lost, 135, 0, 6 | 52d lost, 135, 0, 6 | none |
| 53018 | 150d surv, 159, 0, 12 | 150d surv, 159, 0, 12 | none |

**Verdict: INERT CONFIRMED (exact) — with=0, against=0, anyMove=0.** Daily rows, fallen lists, and wave-kill logs are byte-identical on all 8 seeds; first divergence null everywhere. The place-line fix (a dry place-share line now speaks) changes no trajectory the band can see — on current master exactly as on the freeze base. This suspect stays closed.

## Village assessment — what the villages looked like

The re-confirm reproduces the bandfreeze villages exactly, so the assessment is the same villages seen again — and one contrast is worth stating plainly because the secret-response pair makes it visible twice over. 53015 is two different villages depending on the conversation code: on the freeze and the pre-secret tree it is the peaceful village (one death in 150 days, zero wave-4 kills, the door to wave 5 shut on an empty veterans bar); on the secret-response tree it is bloody and ready (thirteen graves, five wave-4 kills, all four readiness bars met, veterans 3/2 — the only wave-5-ready village in the arm). The fix doesn't just lift numbers; it re-routes the village into a harder, stronger shape, and the price is written in the graves: Naomie to a wound that wouldn't close on day 38, then nine dead to the wild in the last fifty days, including three on day 84 alone. 53012 is the control seed again: the village starves at day 44 on all five legs (F0r, L3r, L4r, L5r, L6r), three starvation graves in the last four days, pantry at zero — the hunger-scattering shape, stable across every tree. 53017 on the secret tree kills twelve wave-4 monsters and still dies at day 148 with twenty-six graves and nobody alive — kills and survival decouple completely there, reproduced exactly. The post-freeze journey landings (conversation, convo-dialogue, convo-wants, contests) left no mark on any of these roads: the freeze held on current master, so the villages above are current-master villages, not museum pieces.

## Sense-test (seed 53015, L4r — the wave-5-ready village)

The mourning beats cohere and the names rotate correctly, with one systematic flaw visible as a lag. The d38 first-grave beat is the strongest line in the corpus: "◈ CRISIS — THE FIRST GRAVE. Naomie is dead. The village digs its first grave, and everyone understands at once: this place can kill you. It just did." The d7 radio line is vivid and in-voice: "Why do the small humans keep putting organic matter in their FACE-HOLES? We built you a fusion pellet! ...You BURIED it. WHY did you bury the pellet?!" But the grave-speaker template names the wrong person in its "speak for" slot: at Kate's grave on day 56 the line reads "At the grave, Carlos, Linda, Lucia and 6 more speak for Hunter — 'Kate trusted them. We saw it. Give them the fire's hearing.'" — the speakers speak for Hunter (who dies day 64, next), while the quote correctly names Kate, the one just buried. The same pattern repeats on every grave: day 64, "speak for Carlos — 'Hunter trusted them'" at Hunter's grave; day 65, "speak for Marcus — 'Lucia trusted them'" at Lucia's grave. The "speak for" name is always the next death, not the deceased — a one-grave lag in one slot of the template, while the quoted name is right. This is the bandfreeze grave-speaker finding with its mechanism now visible: a one-grave lag, not a one-off misname. The "bring them home" beat repeats verbatim for every death ("That night, they bring Kate home. Nobody asks you to help carry; nobody has to..."), eight times across days 57–89 — coherent but formulaic. The pellet tension from bandfreeze recurs here on day 25: the reactor is installed ("FUSION REACTOR: the pellet goes in — properly, inside you") and the same day a pass is narrated (Kate → Quinn, "the pellet moved to hungrier hands") — install and pass on the same day, again. The `deathSays` filter still catches "deadfall": the first ~118 of the 400 capped entries are deadfall-gathering lines, not deaths, and the cap truncates later death lines.

## Wall numbers (this run — doorwalk baseline leg, 8 seeds per leg)

- National (final rank) 0/8 on every leg; wins 0/8 on every leg (baseline leg never walks a door, by design).
- Lesser seats: F0r 6/8, L3r 4/8, L4r 3/8, L5r 3/8, L6r 3/8 — identical to bandfreeze.
- Wave-4 unlocks 8/8 on every leg; wave-5 unlocks (maxWave 5): F0r 4/8, L3r 1/8, L4r 5/8, L5r 3/8, L6r 3/8 — identical to bandfreeze.
- Wave-5 readiness (`readiness5.ready`): F0r 0/8, L3r 0/8, L4r 1/8 (53015, veterans 3/2), L5r 2/8 (53015 vet 3, 53016 vet 2), L6r 2/8 — identical to bandfreeze.
- Median survival (days): F0r 150, L3r 95, L4r 115, L5r 72.5, L6r 72.5 — identical to bandfreeze.
- Wave-4 kill link (kills / faced types, band totals): F0r 27/37, L3r 12/36, L4r 33/45, L5r 23/41, L6r 23/41 — identical to bandfreeze.
- The veterans bar is the binding number on the freeze: 0/8 wave-5-ready, best 1/2 living veterans (53011, 53017, 53018). On L4r/L5r the bar clears on 53015 (3/2) — the fix trees, not the freeze, hold the only ready villages.
- Cost bar (scalemetric-adapted): medians equal bandfreeze exactly on all four pair legs (within 20d bar — 0d observed); starvation deaths equal bandfreeze exactly (L3r 5, L4r 4, L5r 4, L6r 4 — bar allows +2, 0 observed). **HELD.**
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Balanced panel (§15): not run — DIAG recorder corpora; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Proof

`node scripts/test-pair-b98e3ef-a.js` — **189 passed, 0 failed, 0 skipped**:

- G1 det-gate — PASS on fixtures + committed corpora (arena classifier fixtures, band-rule synthetics: MOVER 5/8, INERT 0/8, MIXED 3-with-2-against, standing ±5 tolerance boundary at +5/+6).
- G1 reproduction — PASS on all 40 new corpora: F0r endpoints == F0 endpoints exact on all 8 seeds; L3r/L4r/L5r/L6r endpoints == bandfreeze exact on all 8 seeds each; every new corpus == its bandfreeze corpus modulo `run`/`anchorCommit` only.
- G1 verdicts — PASS as judged legs: b98f MOVER (with=5, against=0, per-seed map identical to bandfreeze, first divergences identical); e3ef INERT (anyMove=0, first divergence null on all seeds); per-seed (standing, w4, fallen) == bandfreeze evidence tables on all four pair legs; cost bar held on all four legs.
- G3 integrity — PASS on all 40 new corpora (rows span d2..`gameDays`, diag on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).
- G2 recorder neutrality — CARRIED from bandfreeze-b, not re-run: the recorder is unchanged since `fd306cac1` (frozen-instrument diff over `fd306cac1`..`1fc09bbe3` is empty), and bandfreeze proved neutrality on the F0/F0b pair.

## GO bars (binding)

1. F0r judged: 8/8 band seeds run on current master `1fc09bbe3` with full daily corpora + end snapshots — **STABLE** (exact reproduction, no FREEZE BROKEN).
2. Both pairs judged against the band rule with confirmed/overturned status per the prereg deciding rule — **MET** (b98f MOVER CONFIRMED exact; e3ef INERT CONFIRMED exact).
3. Cost bar held on all four pair legs — **MET** (medians and starvation counts equal bandfreeze exactly).
4. G1 det-gate — **PASS** (proof 189/0/0).
5. G2 recorder neutrality — **CARRIED** from bandfreeze-b (recorder unchanged; see § Proof).
6. G3 corpus integrity — **PASS** on every new corpus in `perseed-pair-b98e3ef-a/` (40/40).

## Method note

- CANON.md read first; MONSTER-WAVES.md for the wave/fight context (wave-4 gate standing ≥ 100; wave-5 gate standing ≥ 200 AND wave-4 faced; "Monster encounters are fought, not rolled"). AGENTS.md (repo house rules) read. MEASUREMENT.md §§9–12, 14–15 read. SIMULATING.md read. Bandfreeze evidence + prereg read first for the freeze method and the original pair verdicts. No canon doc covers seed attribution — the question was answered from measurement.
- Base verified with `git log --oneline -1` = `1fc09bbe3` before any judged work. Both pair commits verified reachable (`git cat-file -t b98ac0730` / `e3ef2b612` → `commit`); parents `992888172` / `5582c19b9`; src diffs single-file as bandfreeze recorded (conversation.js +97/−3; villager-agency.js +14/−1).
- Master move `fd306cac1`→`1fc09bbe3`: frozen instruments UNCHANGED (empty diff over the driver/recorder/analyzer/sim-harness/3 instruments/11 policies); `src/data` unchanged; src/js changed in 4 files (contests.js +23, conversation.js +57, convo-dialogue.js +25, convo-wants.js +24) — those changes enter only the F0r leg (worktree itself), never the SHA-pinned pair extractions.
- Env PLENTYDEPRI=1 DEPOSITGATE=1: behaviorally identical to bandfreeze's unset env (both gates armed unless the var is `'0'`, per `src/js/game.js`); the re-confirm runs under the same game behavior bandfreeze did.
- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C scratch-pair-<leg>/`, frozen instruments overlaid from the current tip, scratch dirs under the worktree (deleted after use — reproducible from `git archive`). Code identity verified per leg by `game.js` hash match against the commit blob (all four legs: `cd5416e93f28ef84dd6cb7af1c2fd7c349e38475` — the same game.js hash as bandfreeze's six legs) AND the overlaid instruments hash-match the current tip. 2-day smokes passed on all four extracted trees (0 errors) before any judged seed. The corpus `anchorCommit` reads the worktree tip (the prereg commit `05d51b8bc`), not the SHA under test — the known anchor quirk; the SHA under test is recorded here (`1fc09bbe3` for F0r; `992888172`/`b98ac0730`/`5582c19b9`/`e3ef2b612` for L3r–L6r).
- Flap: no write was refused during this run (prereg commit, corpus writes, proof run); no retry observed. Safe-commit index clobber struck the prereg commit (file showed staged-deleted with the worktree copy intact) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, hash-object matched the HEAD blob before repair, status clean + `git diff HEAD` empty after.
- No process loss this run (bandfreeze's L2 incident did not recur); all five legs ran straight through, 8/8 seeds each, 0 instrument errors.
- Code identity: the F0r leg used the worktree's `src/` directly at `1fc09bbe3`; `git diff HEAD -- src/` is empty (no game-code change). No game-code change anywhere in this arm. `git diff HEAD -- src/` is empty.

## Metric review

- The primary metric is the per-seed headline + the band-rule verdict, judged against the decision tree — and the tree held: both re-runs reproduce their bandfreeze verdicts exactly, per-seed for per-seed, so there was nothing to re-score and nothing was re-scored. The ±5 standing tolerance never engaged on any seed in either pair (every endpoint reproduced exactly), which makes this confirmation stronger than the prereg's minimum bar (verdict holds) — it is verdict-holds-plus-byte-identical.
- **Bandfreeze text-total discrepancy (found before the prereg, confirmed here).** The bandfreeze evidence text reports band standing totals L3 1,955 → L4 3,036, but the committed corpora sum to L3 1,884 and L4 2,881; per-seed standing/w4/fallen values in the bandfreeze evidence tables match the corpora exactly, so the text totals appear mis-added (the proof test in this arm asserts per-seed values against the bandfreeze tables, not the text totals, and passes). The discrepancy cannot change any verdict in either arm — both arms' verdicts bind on per-seed with/against counts — but the bandfreeze record should carry a dated correction. Flagged for the coordinator; not silently fixed here (this arm does not edit another arm's evidence).
- The mechanism label is not a binding field, and this arm shows why it should stay that way: 53015/F0r reads combat-led on a single grave (1/1 violent), and 53012 reads starvation-led on every leg while its village is also combat-bled. Labels on n=1 or on mixed-cause villages are descriptions, not verdicts. The frozen-rule label is reported alongside the corrected rule; neither judged anything.
- First-divergence reads used the first-row-per-day helper throughout (bandfreeze artifact: the naive helper returns the final day on dead seeds because the closing snapshot duplicates it). The e3ef null divergences are real nulls — the daily arrays are byte-identical, not just endpoint-equal.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged. The one wave-5-ready village (53015/L4r, veterans 3/2) is readiness, not a facing — the leg cannot show a wave-5 fight.
- Classifier notes carried (unchanged): `'the arena'` registered VIOLENT in this arm's classifier (as bandfreeze did); the frozen analyzer still keys `'arena'`. Monster-name causes (`'Hushpuppy'`, `'Ugly-Eyes'`, `'Night Court'`, `'Grief Counselor'`, `'The Reunion'`) are unmapped in both maps and sit in OTHER. The `deathSays` filter still catches "deadfall" (first ~118 deathSays entries on 53015/L4r are deadfall-gathering lines, not deaths; the 400 cap truncates later death lines). Neither affected any judgment.
- The kill link vs survival decoupling (53017/L4r: 12 kills, village dead d148; 53015/F0r: 0 kills, village alive 150d) reproduces exactly — kills and survival move independently on this band, so a future arm that judges winnability by kills alone would misread both villages. The band table carries both numbers for that reason.
- G2 not re-run is a stated scope choice, not a gap: the recorder file is byte-identical to the one bandfreeze proved neutral on, and the frozen-instrument diff over the master move is empty. If the recorder ever changes, neutrality must be re-proved before any attribution leg runs on the new recorder.

## Findings for the backlog

- **BOTH FREEZE VERDICTS CONFIRMED EXACT ON CURRENT MASTER.** b98ac0730 MOVER (5/8 with, 0 against, per-seed identical, first divergences identical); e3ef2b612 INERT (0/8 move, byte-identical daily rows). The freeze itself is STABLE on `1fc09bbe3` (F0r reproduces F0 exactly on all 8 seeds). No re-freeze needed; the frozen reference is still the reference.
- **Post-freeze src changes inert on this band.** `conversation.js`, `convo-dialogue.js`, `convo-wants.js`, `contests.js` changed between `fd306cac1` and `1fc09bbe3`, yet F0r reproduces F0 byte-for-byte. The journey-lane landings since the freeze did not move any doorwalk-baseline trajectory on these 8 seeds. (Scope: this band, this leg — not a general claim about those commits.)
- **Bandfreeze text-total mis-add (correction owed, not a verdict item).** Bandfreeze evidence text totals L3 1,955 → L4 3,036 vs corpora L3 1,884 / L4 2,881; per-seed tables are correct. Coordinator to stamp a dated CORRECTION note on the bandfreeze record (§14).
- **Grave-speaker one-grave lag (53015/L4r, sense-test — mechanism found).** At each grave the "speak for" name is the next death, not the deceased, while the quoted trust line correctly names the newly dead: "At the grave, Carlos, Linda, Lucia and 6 more speak for Hunter — 'Kate trusted them...'" at Kate's grave; "speak for Carlos — 'Hunter trusted them'" at Hunter's grave. Bandfreeze found the misname; this run names the lag (one slot of the template, one death off). A future instrument/code arm should check the grave-beat template's name binding.
- **Pellet install/pass same-day tension recurs (53015/L4r d25).** The reactor is installed ("the pellet goes in — properly, inside you") and the same day a pass is narrated (Kate → Quinn, "the pellet moved to hungrier hands"). Same tension bandfreeze found on 53011/F0 d29, new instance. A future instrument arm should check whether the pass line and the holder field agree.
- **Grief-card / "bring them home" repetition (53015/L4r).** The bring-home beat repeats verbatim for every death (8×, d57–d89); "Your understanding is... deepening!" repeats (d11 on both 53015/L4r and 53017/L4r). Coherent but formulaic — the same template texture as the 53007 chain and bandfreeze.
- **Thumbnails / Sam's begging:** not re-checked on this road (no new observation this run; bandfreeze's trajectory-dependent notes stand).
- **53012 is the band's control seed, confirmed again.** Same headline (44d, 125, 0 w4 kills) on all five legs of this run (F0r, L3r, L4r, L5r, L6r) — a village that starves in six weeks no matter which conversation or fight code runs.
- **Kill/survival decoupling reproduces exactly (53017/L4r).** 12 wave-4 kills, standing 695, village dead d148 with living 0 and 26 fallen. The kill link is not survival. Future winnability arms must carry both numbers (this arm's tables do).
- **Wave-5 readiness on the band: 0/8 frozen, 1/8 on L4r, 2/8 on L5r/L6r.** The only ready village is 53015/L4r (veterans 3/2, all bars met). The veterans bar is the binding number on the freeze (best 1/2) — the chain's binding link, same as on the lead seed.
- **Monster-name-cause gap, still band-wide.** `'Ugly-Eyes'`, `'Night Court'`, `'Grief Counselor'`, `'The Reunion'` (and `'Hushpuppy'` on 53007) sit in OTHER under both VIOLENT maps. A future instrument arm should register monster-name causes (or map cause→monsterId) in the shared analyzer with a proof refresh; never silently bucket.
- **Classifier gap (carried):** `'the arena'` registered VIOLENT in this arm's classifier; the frozen analyzer still keys `'arena'`.
- **`deathSays` deadfall quirk + 400 cap (53015/L4r).** The first ~118 of 400 capped entries are deadfall-gathering lines; the cap truncates later death lines. A future instrument should filter `deadfall` out of the death regex and/or raise the cap for sense-test reads.

## Convergence state

scale-onramp stays **converging** (NOT converged): the band is frozen AND stable on current master, both pair verdicts re-confirmed exactly — but the scale wall itself has not moved: national 0/8, wins 0/8, wave-5-ready 0/8 on the freeze, median survival 150d on a leg that never walks a door. The instrument is now proven stable across a master move, which is what makes the next blanks cheap: (1) the (c) MIDDLE→FIFTH suspect set on the frozen band (prereg + legs); (2) a food-rung before/after on the band (L3/L5 observation, unjudged); (3) the wave-4 kill link at 27/37 faced on the freeze, with wave 5 held open by the veterans bar (0/2 best 1/2), is the chain's binding number — the veterans bar, not the kill count, is what a build arm should attack next.

## Adoption handoff

1. **Verdict: BOTH CONFIRMED EXACT + FREEZE STABLE.** `b98ac0730` MOVER CONFIRMED (5/8 with, 0 against, per-seed identical to bandfreeze, first divergences identical). `e3ef2b612` INERT CONFIRMED (0/8 move, byte-identical daily rows). F0r reproduces F0 exactly on current master `1fc09bbe3` — the freeze holds after the master move; no re-freeze needed.
2. **Freeze: 53011–53018, STABLE on `1fc09bbe3`.** Endpoints: 53011 150d/784/12 kills; 53012 44d died/starvation; 53013 150d/370/3; 53014 82d died/living 0; 53015 150d/199/0 kills/1 fallen; 53016 150d/384/3; 53017 150d/199/2; 53018 150d/199/3. G3 PASS (40/40 corpora), proof 189/0/0.
3. **Wall numbers (freeze):** national 0/8, lesser seats 6/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 4/8, wave-5-ready 0/8, median survival 150d, kill link 27/37 faced. Cost bar held exactly on all four pair legs.
4. **Notable roads:** 53015/L4r is the only wave-5-ready village in the arm (veterans 3/2) and the bloodiest flip in the band (1 grave on the freeze → 13 graves, 5 kills); 53017/L4r kills 12 wave-4 monsters and still dies d148 with 26 fallen (kill/survival decoupling); 53012 starves at d44 on all five legs (the band's control seed).
5. **Proof:** 189 passed, 0 failed, 0 skipped. G1/G3 all PASS; G2 carried from bandfreeze-b (recorder unchanged).
6. **Findings backlog:** twelve items under § Findings for the backlog above (both verdicts confirmed; post-freeze src inert on the band; bandfreeze text-total correction owed; grave-speaker one-grave lag; pellet d25 tension; grief/home-beat repetition; 53012 control seed; kill/survival decoupling; wave-5 readiness; monster-name-cause gap; 'the arena' gap carried; deathSays deadfall quirk + cap).
7. Worktree `~/workspace/worktrees/sim-pair-b98e3ef-a`, branch `sim-pair-b98e3ef-a`. No game-code trace: prereg + proof + 40 corpora + this evidence. Scratch dirs deleted after use (never committed). No flap-retry preload committed. No process loss this run.
