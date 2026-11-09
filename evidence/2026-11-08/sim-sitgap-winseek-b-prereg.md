# sim-sitgap-winseek-b — prereg (DIAG, zero src/js)

**Arm:** sim-sitgap-winseek-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T0330Z (Loop B, arm 1 of 3) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sitgap-winseek-b, base master `9d5fe8ab6` (worktree `~/workspace/worktrees/sim-sitgap-winseek-b`; current master at spawn is `55b5e5aae` — two evidence-only journey-scale commits ahead; do NOT rebase onto it until landing time, and then only onto an explicit SHA read fresh from the main tree). **Prereg committed BEFORE any judged computation.**

## The question

Which class does each winseek seed show on current master, and what blocks the sit? The sit gap does not exist on the doorwalk baseline leg (sim-sitgap-b: 6/8 sit, 0 offered-not-taken) — the reached-but-never-sat shape lives under **winseek** play (sim-flipsocial-b § reached-but-never-sat: winseek `row.table` 7/8 → 5/8, `entered` 0/8 on both endpoints). This arm runs the same sitgap recorder + classifier on the winseek policy, frozen band 53001–53008, 150d death-aware, current master, and names the blocker seed by seed.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/TABLE.md` — the seat (full/lesser bars), the seven paths, the sticky offer (Steve 2026-11-06: once announced, a dipped bar never withdraws the offer), overtime (clock starts the dawn the Table is announced, runs only while the seat is not taken), and "the table prices the run, never gates on godhood; reachable by competent non-god play".
- `docs/MEASUREMENT.md` §§9–12, 14–15 read: pilot gate, death-aware horizons, pre-registration, metric binding, balanced panels. This is a DIAG classification, not a lever — §§14–15 apply as: the classification rule below binds the run; `balance-panel.js` refuses recorder corpora by design (recorded, not forced), same standing as the bisect arms — the panel is not run and that is recorded, not hidden.

## The sit chain, as the code stages it (verified from src/js, not guessed)

Same chain as sim-sitgap-b (Arc IV → `tableWaiting` → dawn announce → `tablePreview()` → sit drive → `tableTakeSeat()` → `tableScene()`), with one difference that IS this arm's question: **under winseek there is no sit drive at all.**

## Code verification — winseek never attempts a sit (verified BEFORE any judged computation)

Read `scripts/policies/winseek.js` and `scripts/policies/competent.js` in full, plus the harness and `src/js/table.js` entry points:

1. **winseek extends base competent, NOT linkfeast.** `winseek.js:24` requires only `./competent` (plus `./idle`, which is required but never called — the only `idle` mention in the file is the require line). It never requires `competent-linkfeast-b`, `competent-doorwalk-b`, or any `takeseat`/`seatdrive` module. It defines no `takeSeatDrive`, no `takeseatStats`, and contains no `tableTakeSeat` / `tablePreview` / `takeSeatDrive` string anywhere.
2. **Base competent never calls the seat verb.** `scripts/policies/competent.js` contains ZERO matches for `takeSeatDrive`, `tableTakeSeat`, `takeseatStats`, `tablePreview`, `tableChoices`, or `chooseTableOption` (grep, whole file). `competent.daily` / `competent.upkeep` therefore never call `takeSeatDrive` or `Game.tableTakeSeat`. winseek's `upkeep` calls `competent.upkeep` + `huntPatrol` + `contestRoad`; its `daily` calls `competent.daily` + the winseek roads. None of those roads touches the seat.
3. **winseek's only table interaction is `tableRoad`** (`winseek.js`, TABLE section): it drains pending `scholar.tableChoices` prompts via `Game.chooseTableOption(tc.options[0].id)`, first-option beats only, up to 30 answers. `tableChoices` is only ever set by `table.js:964` (`tablePrompt`), inside the table challenge flow, which only starts after `tableTakeSeat()` → `tableScene()`. Since nothing under winseek calls `tableTakeSeat`, no `tableChoices` can ever be pending, so `tableRoad` can never fire either.
4. **No other caller exists in the node path.** The harness (`scripts/sim-harness.js`) only categorizes `chooseTableOption` as a 'social' verb for telemetry; it never calls `tableTakeSeat`. The only other `tableTakeSeat` caller is the DOM Haven-panel button (`src/js/app.js:17020`), which is not loaded in node. `Game.tableTakeSeat` is the single entry to `tableScene`/`tableDone`.

**Consequence, pre-registered:** under winseek, `tableDone` can never become true, `tableTakeSeat` is never called, and the takeseat skip diffs will be EMPTY (the recorder is fed a zero-stats stub — see Substrate). **The mechanism for offered-not-taken must therefore be written from the sitstep snapshot fields (ready window, scholar location, entry block, `preview.why`) plus the verified fact that no sit drive runs — NOT from skip reasons that never fire.** The classifier's own `classifyGate` already names this shape per day: `offer-not-taken` = "preview ready; policy never called tableTakeSeat". If the sweep contradicts this verification (any `tableTakeSeat` call recorded, any seed sitting), that is a finding about the verification, reported loudly — never smoothed.

## The seat-capture for the winseek leg (pre-registered)

The sitstep snapshot fields are policy-independent and carry the classification:

- `tableWaiting` / `tableAnnounced` / `tableDone` — Arc IV fired / announced / sat.
- `seat` + `seatDetail` (w1–w5, contestsN, crisesN, rank, stage, foodDeeds) — what the seat prices.
- `preview` (`seat`/`doors`/`ready`/`why`/`overtime`/`fullReady`) — null before day 90 (`winDayFloorOk`), `ready = !tableEntryBlock()`.
- `entryBlock` — the engine's block string ("Return to Haven to take your seat", "Finish the current encounter before taking your seat", …).
- `scholarAtHaven` — the scholar's location on each ready day.
- `gate` (`classifyGate`: sat / no-seat / no-preview / entry-blocked / offer-not-taken) — the first failing link per day.
- `sitAttempts` (instrument wrap on `tableTakeSeat` / `chooseTableOption`) — expected EMPTY on all 8 seeds; any entry is a contradiction of the code verification above.
- `doorVerbMsgs` (driver wrap on the same verbs) — expected EMPTY; an independent second witness to zero seat attempts.

The new analyzer (`scripts/analyze-sitgap-winseek-20261109.js`) reuses the sitgap-b `classifySit` rule unchanged (same five classes, first match wins) and, for any offered-not-taken seed, replaces the skip-reason mechanism with a winseek mechanism built from the snapshot fields: ready window (first → last ready day), scholar away-from-Haven count on ready days, entry-block / `preview.why` values on ready days, gate counts across the ready window, end state, plus the sentence "no sit drive runs under winseek (verified from code: winseek extends base competent; no takeSeatDrive; tableRoad answers only pending tableChoices, which never exist pre-sit)". Other classes keep the sitgap-b mechanism (they are already written from snapshot fields).

## Endpoints actually read — and what this classification rests on

- **Prior roots (expectations, NOT bindings):** sim-sitgap-b on master `6e69df4ef`, doorwalk baseline leg, 150d: 53001 69d village-lost standing 150; 53002 60d village-lost 125; 53003 150d survived 240 lesser d90; 53004 150d survived 409 lesser d90; 53005 96d village-lost 385 lesser d90; 53006 150d survived 175 lesser d90; 53007 150d survived 584 lesser d95; 53008 150d survived 199 lesser d99. Median 150d, sits 6/8, national 0/8, wins 0/8.
- **The flipsocial shape (the shape this arm explains):** winseek panel, healed leg (`c9fea16ee`): `row.table` 5/8, `entered` 0/8, gameDays 47, 47, 58, 65, 76, 77, 78, 80, wave reach 3, 3, 4, 4, 4, 4, 4, 4; collapsed leg: `row.table` 7/8, `entered` 0/8, gameDays 34, 48, 61, 79, 83, 84, 109, 111. The panel's winseek villages reach the table and never sit on either endpoint.
- **Finding #1944 (frozen-band roots must be re-verified on current master):** this run RE-VERIFIES the band by re-running all 8 seeds on `9d5fe8ab6` under winseek and printing the delta against the committed `perseed-sitgap-b/` headlines. That delta confounds TWO changes (doorwalk → winseek policy, and `6e69df4ef` → `9d5fe8ab6` master) — it is named as a policy+master delta, never attributed to one cause. The cleaner master-movement read is the same-policy comparison: this run's winseek gameDays / reach against the flipsocial healed winseek panel rows above (same policy, older master `c9fea16ee`). `fieldFights.js` moved in the fightblend landing `3f405ff78` between those masters, so movement is expected — report it, never smooth it. Any divergence is named in the evidence, never smoothed into the classification.
- **Substrate/policy files re-verified present on this base:** `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/recorder-53007-20261108.js`, `scripts/recorder-sitgap-20261108.js`, `scripts/analyze-sitgap-20261108.js`, `scripts/policies/winseek.js`, `scripts/policies/competent.js`. Winseek runs at default env (no `POINTER_GATED`, `WINSEEK_R8` default on) — the same defaults the flipsocial panel used.

## Substrate

- Fresh DIAG driver (`scripts/sitgap-winseek-driver-20261109.js`, new, scripts only) on the frozen band 53001–53008, winseek policy, 150d death-aware, current master `9d5fe8ab6`. The driver is the sitgap-driver pattern with the policy leg swapped: `WINSEEK.winseek` instead of `DOORWALK.doorwalk`; no `TAKESEAT_B`/`DOORWALK_B` env (winseek has no such gates); no doorwalk/stageally/rally stats (those modules are not in this leg).
- The sitgap recorder (`scripts/recorder-sitgap-20261108.js`) is reused READ-ONLY and fed a **zero-stats stub** in the driver: `function zeroTakeseatStats() { return { skips: {}, seatAttempts: 0, seatTaken: 0, seatFailed: 0, seatDay: null, seatKind: null, events: [] }; }` — a pure function returning a fresh zero object, no game-state read, no RNG draw. The recorder therefore writes `sitgap.tsSkips: {}`, `tsAttempts: 0`, `tsTaken: 0` on every row: present, never null, and the skip diffs are empty by construction. The driver's corpus `takeseatStats` field is the same zero object. The 53007 recorder's `diag` (pantry, sick/wounded, hunger, pellet) stays armed alongside — the village assessment needs it. `DIAG_RECORDER=0` runs unrecorded for the G2 control — unrecorded means NEITHER recorder.
- Corpus under `evidence/2026-11-08/perseed-sitgap-winseek-b/`. Analyzer: `scripts/analyze-sitgap-winseek-20261109.js` (new; reuses `classifySit`/`seatEvents`/`skipActivity`/`checkCorpusSit`/`neutralityCompareSit` from `analyze-sitgap-20261108.js` — READ-ONLY, do not edit it — and adds the winseek mechanism rewrite + the ready-day caveat flag + the flipsocial healed-leg comparison).

## Classification rule (pre-registered, applied mechanically, first match wins)

The sitgap-b rule, unchanged (see sim-sitgap-b-prereg.md): **sat** / **offered-not-taken** / **offered-declined** / **reached-never-sat** / **never-offered**. Every class carries a named mechanism. Under winseek the expected distribution is 0 sat (no sit drive exists) and the question is which of the other four each seed shows. The winseek mechanism rewrite (above) applies to offered-not-taken; all other classes use the sitgap-b mechanism text verbatim.

**Rule validation (pre-registered):** the analyzer must reproduce the sim-53007-a labels on the committed `perseed-53007-a/` corpora (53003/53004/53006/53007 → **sat**; 53008 → **never-offered**), exactly as the sitgap-b proof does — the classifier function is the same one, reused, not re-implemented. If the wrapper returns a different class than the reused `classifySit` on any fixture or root, the wrapper is wrong and the classification is reported as unjudged, not re-scored.

**Ready-day caveat (carried from sim-sitgap-b):** `readyDays` counts only days where the end-of-day snapshot saw preview ready. A seed that becomes ready and dies the same day — before any snapshot sees the ready preview — would misclassify as reached-never-sat instead of offered-not-taken. The analyzer flags any seed whose last daily row's day is before its final `gameDays` (an unsnapshotted final day) and the evidence checks each flagged seed's last rows by hand. No such seed occurred in the sitgap-b band; the check is carried, not assumed.

## GO bars (binding — DIAG-GO requires ALL)

1. **Primary metric — classification coverage:** ≥7/8 seeds classified with a named mechanism under the rule above.
2. **The winseek blocker named with evidence per seed:** ready window / day-90 floor / encounter block / away block / no-sit-drive, with the numbers at the decision point (ready days, scholar location on ready days, entry block / `preview.why`, end state).
3. **G1 det-gate PASS** (proof `scripts/test-sitgap-winseek-b.js`: classifier returns the pre-registered class on synthetic fixtures for all five classes AND on the committed `perseed-53007-a/` corpora; a broken classifier — rule order swapped — fails the fixtures; the winseek mechanism rewrite is itself fixture-tested: an offered-not-taken fixture with EMPTY skip diffs must still name the ready window + scholar location + no-sit-drive, never a skip reason).
4. **G2 recorder neutrality PASS** (armed recorder reproduces the unrecorded trajectory exactly — headline + daily living/fallen/end fields identical — on control seeds 53008 and 53004, same code, same master).
5. **G3 corpus integrity PASS** (every corpus JSON: daily rows span first→last day, end snapshot present, `sitgap` present on every row, fallen list consistent with daily living drops, 0 instrument errors) — 8/8.
6. **Band roots re-verified:** every seed's headline on `9d5fe8ab6` recorded against the `perseed-sitgap-b/` headlines with divergences named (policy+master delta), plus the same-policy comparison against the flipsocial healed winseek panel rows (gameDays, wave reach, table reach vs entered).

If a fix suggests itself, NAME it precisely with its prereg shape for the next arm — do NOT build it here (DIAG only, zero src/js).

## Proof

`scripts/test-sitgap-winseek-b.js` (det-gate + neutrality + corpus-integrity legs, modeled on `scripts/test-sitgap-b.js`). The proof must FAIL on a broken recorder (sitgap field dropped fixture) and on a broken classifier (rule-order swap fixture) and on a winseek mechanism that cites a skip reason, and PASS on the real ones. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-sitgap-winseek-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change, no door walked (winseek never walks the trial; `tableRoad` answers first-option beats only — do NOT change that), no win by design.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Flap protocol: probe-gate EVERY git write (`git update-ref refs/heads/probe HEAD` before each safe-commit); if the probe fails, do read work and retry later — never force a write, never route around a denial with a manual ref edit. The `muse.write` tool bypasses the flap for file writes; git writes go through the probe.
- Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob.

## Metric review (pre-registered note)

- The primary metric is classification coverage with a named mechanism, judged against the bars above — not a friendlier re-scoring of the band's health. If a winseek seed sits (contradicting the code verification), that is a finding about the verification, not a reason to re-score the classification — the run still classifies all 8 seeds and names whatever blocker the sitting seed (or its replacement) shows.
- The winseek leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Panel (§15): not a panel verdict — DIAG classification on a recorder corpus, same standing as the bisect arms; `balance-panel.js` refuses recorder corpora by design.
- The expected verdict shape is 0 sat / N offered-not-taken: the classification distinguishes *why* the seat is never taken (never ready vs ready-but-no-driver vs died-before-floor), and that distinction is the deliverable — a band of 8 offered-not-taken with identical mechanisms would still be a complete answer, not a failed one.
