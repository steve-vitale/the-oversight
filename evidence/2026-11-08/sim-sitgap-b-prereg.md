# sim-sitgap-b — prereg (DIAG, zero src/js)

**Arm:** sim-sitgap-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T0130Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sitgap-b, base current master `6e69df4ef` (worktree `~/workspace/worktrees/sim-sitgap-b`, branch already at that SHA; no rebase needed — the worktree tip IS the base). **Prereg committed BEFORE any judged computation.**

## The question

Why do villages that reach the table never sit? On the prior master (`6680d7924`, sim-53007-a) seed 53008 survives 150 days, kills a wave-4 monster, stands at 175, and never takes the seat — while its healed-endpoint self sat on day 97. At panel scale the same shape appears (sim-flipsocial-b § reached-but-never-sat): villages reach the table and never sit under winseek play on either endpoint. This arm names the blocker, seed by seed, on current master.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/TABLE.md` — the seat (full/lesser bars), the seven paths, the sticky offer (Steve 2026-11-06: once announced, a dipped bar never withdraws the offer), overtime (clock starts the dawn the Table is announced, runs only while the seat is not taken), and "the table prices the run, never gates on godhood; reachable by competent non-god play".
- `docs/MEASUREMENT.md` §§9–12, 14–15 read: pilot gate, death-aware horizons, pre-registration, metric binding, balanced panels. This is a DIAG classification, not a lever — §§14–15 apply as: the classification rule below binds the run; `balance-panel.js` refuses recorder corpora by design (recorded, not forced), same standing as the bisect arms — the panel is not run and that is recorded, not hidden.

## The sit chain, as the code stages it (verified from src/js, not guessed)

1. **Arc IV fires** (`src/js/progression.js:834`): `pg.tableWaiting = true`; if day ≥ 90, `pg.tableAnnounced = true` + "The table is being set" line. A re-fire (`progression.js:713`) re-sets `tableWaiting` when arc ≥ 4 and the seat bar holds again.
2. **Dawn announce** (`src/js/ledger.js:1773`): if `tableWaiting && !tableDone && systemArrived`, `tableAnnounce()` runs. If the seat is `none` and never announced, the table withdraws aloud and clears `tableWaiting`; if already announced, the offer HOLDS (one holding line per dip) and re-fires when the case is whole again. Sitting stays gated on the LIVE seat.
3. **Preview** (`src/js/table.js:1165` `tablePreview()`): null unless `tableWaiting && !tableDone`, seat ≠ `none`, and day ≥ 90 (`winDayFloorOk`). `ready = !tableEntryBlock()`.
4. **Entry block** (`table.js:1156` `tableEntryBlock()`): expedition over/won; active contest; in combat / scholar monster; `havenStoresAccess() === 'none'` ("Return to Haven to take your seat").
5. **Sit drive** (policy, `scripts/policies/competent-linkfeast-b.js` `takeSeatDrive`): sits only when `tableAnnounced` AND scholar at Haven (`playerAtHaven()`) AND preview non-null AND ready — then calls the real `Game.tableTakeSeat()`. Every early exit is classified in `takeseatStats.skips` (never an attempt).
6. **Sit** (`table.js:1301` `tableTakeSeat()`): preview + entry block + ready, then `tableScene()` sets `pg.tableDone`, phase `paths`, offers the earned doors.

"Reached the table" in this arm means `tableWaiting` true at any point (Arc IV fired). "Offered" means the preview is non-null with a seat priced (lesser/full) — the seat the audit names. "Sat" means `tableDone` via `tableTakeSeat`.

## Endpoints actually read — and what this classification rests on

- **Prior roots (expectations, NOT bindings):** sim-53007-a on master `6680d7924`, doorwalk baseline leg, 150d: 53001 69d village-lost standing 150; 53002 60d village-lost 125; 53003 150d survived 240 lesser d90; 53004 150d survived 409 lesser d90; 53005 89d village-lost 199; 53006 140 scholar-days survived 175 lesser d90; 53007 150d survived 584 lesser d95; 53008 150d survived 175, never sat. Median 150d, sits 5/8, national 0/8, wins 0/8.
- **Finding #1944 (frozen-band roots must be re-verified on current master):** 4/8 of the 0245Z roots no longer occur. The 53007-a roots above are on a different master (`6680d7924`) than this run's base (`6e69df4ef`). This run RE-VERIFIES the band by re-running all 8 seeds on `6e69df4ef` and printing the delta against the committed `perseed-53007-a/` corpora — the analyzer reads those corpora for the prior headlines, it does not trust the md table. Any divergence is named in the evidence, never smoothed into the classification.
- **Substrate/policy files re-verified present on this base:** `scripts/sim-harness.js`, `scripts/sitstep-instrument-20261107.js`, `scripts/recorder-53007-20261108.js`, `scripts/policies/competent-doorwalk-b.js`, `scripts/policies/competent-linkfeast-b.js`, `scripts/policies/competent-stageally-a.js`, `scripts/policies/competent-rally-bankkiller-b.js`. The doorwalk baseline leg is TAKESEAT_B=1, DOORWALK_B off — sits happen, doors never answered, by design.

## Substrate

- Fresh DIAG recorder (`scripts/recorder-sitgap-20261108.js`, new, scripts only) on the frozen band 53001–53008, doorwalk baseline leg, 150d death-aware, current master `6e69df4ef`.
- The recorder wraps the sitstep instrument snapshot (same pattern as the 53007 recorder) and adds ONE pure-read `sitgap` object per daily row: cumulative takeseat skip counts (`takeseatStats().skips` — a plain copy of the policy module's counters), cumulative `seatAttempts` / `seatTaken` / `seatFailed`, `seatDay`, `seatKind`. The sitstep snapshot already carries, per day: `seat` + `seatDetail` (w1–w5, contestsN, crisesN, rank, stage, foodDeeds), `fullSeat`, `preview` (seat/doors/ready/why/overtime/fullReady), `entryBlock`, `gate` (classifyGate), `tableWaiting` / `tableAnnounced` / `tableDone`, `winDayFloorOk`, `scaleRankSnap`, `raw` standing (base snapshot), `scholarAtHaven`, `livingVeterans`, `seatTakerOptions`. The 53007 recorder's `diag` (pantry, sick/wounded, hunger, pellet) stays armed alongside — the village assessment needs it.
- Reading policy module counters draws no RNG and writes no game state. Neutrality is proven, not assumed (G2 below).
- Corpus under `evidence/2026-11-08/perseed-sitgap-b/`. Driver: `scripts/sitgap-driver-20261108.js` (doorwalk-53007-driver pattern + sitgap recorder install, `DIAG_RECORDER=0` runs unrecorded for the G2 control — unrecorded means NEITHER recorder). Analyzer: `scripts/analyze-sitgap-20261108.js`.

## Classification rule (pre-registered, applied mechanically, first match wins)

Per seed, from its daily rows + final stats. Every class carries a named mechanism (the numbers at the decision point + what the village was doing instead).

1. **sat** — `tableDone` true at end. Mechanism: seat kind (lesser/full) + sit day (first day `tableDone` true; `takeseatStats.seatDay`) + the seat detail on that day.
2. **offered-not-taken** — `tableAnnounced` true AND ≥1 daily row with `preview.ready` true AND `tableDone` false at end. Mechanism: the ready window (first → last ready day), the dominant takeseat skip reason across the ready-days (per-day diffs of the cumulative `sitgap.tsSkips`), the scholar's state on ready days (`scholarAtHaven`, `entryBlock`, `preview.why`), and the end state (survived to horizon / died while ready).
3. **offered-declined** — `tableAnnounced` true AND the seat dips to `none` after announcement (holding) AND ends unseated AND never had a ready day. Mechanism: which deed bar dipped (seatDetail on the last seat day vs the first none day) — the announced offer lapsed because the case fell apart.
4. **reached-never-sat** — `tableWaiting` true at any point AND preview never ready AND not class 2 or 3. Mechanism: the first failing link per `classifyGate` on the last `tableWaiting` day (seat none → missing bars named; preview null → `tableWaiting`/`winDayFloorOk`; entry-blocked → `preview.why`).
5. **never-offered** — `tableWaiting` never true, OR the seat never ≠ `none` while waiting. Mechanism: furthest arc reached + `seatDetail` missing bars at end.

**Rule validation (pre-registered):** the classifier must reproduce the sim-53007-a labels on the committed `perseed-53007-a/` corpora: 53003/53004/53006/53007 → **sat** (lesser, d90/d90/d90/d95); 53008 → **never-offered** — verified against the committed corpus before the sweep: max arc 3, `tableWaiting` never true, seat `none` on all 149 rows, final seat detail w1 18 / w2 9 / **w3 2** / contests 14 / crises 3 / regional / stage 3 / foodDeeds true, takeseat skips 448× `not-announced` + 2× `fight`. The ONLY missing lesser-seat bar is wave-3 faced 2/3. Correction to the task brief's shorthand, recorded before any judged computation: on the baseline leg 53008 does not "reach the table and never sit" — it never reaches Arc IV at all. The reached-but-never-sat shape lives in the winseek panel (sim-flipsocial-b) and in the healed endpoint (where 53008 sat d97); this arm reports, per seed, which shape each seed actually shows. If the classifier returns `never-offered` for a seed the old corpus shows sitting, the rule is wrong and the classification is reported as unjudged, not re-scored.

## GO bars (binding — DIAG-GO requires ALL)

1. **Primary metric — classification coverage:** ≥7/8 seeds classified with a named mechanism under the rule above.
2. **53008's blocker named with evidence:** standing/deed numbers at the decision point, what the village was doing instead (ready window, skip reasons, scholar location).
3. **G1 det-gate PASS** (proof `scripts/test-sitgap-b.js`: classifier returns the pre-registered class on synthetic fixtures for all five classes AND on the committed `perseed-53007-a/` corpora; a broken classifier — rule order swapped — fails the fixtures).
4. **G2 recorder neutrality PASS** (armed recorder reproduces the unrecorded trajectory exactly — headline + daily living/fallen/end fields identical — on control seeds 53008 and 53004, same code, same master).
5. **G3 corpus integrity PASS** (every corpus JSON: daily rows span first→last day, end snapshot present, `sitgap` present on every row, fallen list consistent with daily living drops, 0 instrument errors).
6. **Band roots re-verified:** every seed's headline on `6e69df4ef` recorded against the `perseed-53007-a/` headlines with divergences named.

If a fix suggests itself, NAME it precisely with its prereg shape for the next arm — do NOT build it here (DIAG only, zero src/js).

## Proof

`scripts/test-sitgap-b.js` (det-gate + neutrality + corpus-integrity legs). The proof must FAIL on a broken recorder (sitgap field dropped fixture) and on a broken classifier (rule-order swap fixture) and PASS on the real ones. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-sitgap-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change, no door walked (baseline leg), no win by design.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Flap protocol: probe-gate EVERY git write; if the probe fails, do read work and retry later — never force a write, never route around a denial with a manual ref edit. The `muse.write` tool bypasses the flap for file writes; git writes go through the probe.

## Metric review (pre-registered note)

- The primary metric is classification coverage with a named mechanism, judged against the bars above — not a friendlier re-scoring of the band's health. If current-master 53008 sits (the old-master blocker is gone), that is a finding about master movement, not a reason to re-score the classification — the run still classifies all 8 seeds and names whatever blocker the new 53008 (or its replacement) shows.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Panel (§15): not a panel verdict — DIAG classification on a recorder corpus, same standing as the bisect arms; `balance-panel.js` refuses recorder corpora by design.
