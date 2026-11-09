# sim-sitdrive-rebaseline-b — addendum prereg (frozen-band re-baseline, NOT a new experiment)

**Arm:** sim-sitdrive-winseek-b (re-baseline) · **Run:** fleshout-loop-b-20261109T0930Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sitdrive-winseek-b, base master **`8cee6a8d2`** (worktree `~/workspace/worktrees/sim-sitdrive-winseek-b`; branch rebased onto master `8cee6a8d2`, head `f37924c96` at spawn) · **Prereg committed BEFORE any judged computation on the new master.** · **Original prereg:** `evidence/2026-11-09/sim-sitdrive-winseek-b-prereg.md` (base `514e4fa6e`, pilot GO + confirm GO) · **Original evidence:** `evidence/2026-11-09/sim-sitdrive-winseek-b.md` (stays as-is — judged on `514e4fa6e`; this file re-judges, never rewrites it).

## Why this addendum exists

The arm was PILOT GO + CONFIRM GO on master `514e4fa6e` (pilot: sits 2/2 reachable 53003/53006, offered-not-taken empty, cost bars pass, proof 72/72; confirm: panel table 0/16→3/16 on band 54209–54224). The LANDING GATE FAILED on the rebase onto master `8cee6a8d2`: the proof re-run is **67 passed / 5 failed**. All 5 failures are REAL-sim legs on seed 53003: armed 53003 no longer sits (seatTaken=0, classifies never-offered) and gate-off 53003 classifies never-offered instead of offered-not-taken — on BOTH legs, so the seed's trajectory moved with master (journey src changes between `514e4fa6e` and `60eb9a5bb`) and it never reaches a ready seat on the new master. Gate-off == plain winseek byte-identical still PASSES, and every corpus/fixture leg passes: the drive is NOT broken, the demonstration seed moved. The arm is therefore HELD, not killed.

This run is a **re-baseline of the same experiment on the new master, not a new experiment**. The question is whether the verdict survives the master move. The same bars, the same bands, the same driver/analyzer/proof shape — only the master and the re-derived reachable set change.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/TABLE.md` — the seat (full/lesser bars), the seven paths, the sticky offer (Steve 2026-11-06: once announced, a dipped bar never withdraws the offer), overtime (clock starts the dawn the Table is announced, runs only while the seat is not taken), "the table prices the run, never gates on godhood; reachable by competent non-god play", and the day-90 floor (`tablePreview()` is null before day 90).
- `docs/MEASUREMENT.md` §§9–12, 14–15 read: pilot gate, death-aware horizons, pre-registration, metric binding, balanced panels.

## What changes vs the original prereg

- **Base master: `8cee6a8d2`.** All judged computation in this run happens on this master. The branch head at spawn is `f37924c96` (the arm's own commits only: policy + driver + analyzer + proof + prereg + evidence; zero src/js difference from `514e4fa6e` except the rebase base).
- **Reachable set TO BE RE-DERIVED from this run's before leg** (plain winseek, frozen band 53001–53008, 150d, same driver). Do NOT assume {53003, 53006}: on `514e4fa6e` the reachable set was {53003, 53006} and on the DIAG master `9d5fe8ab6` it was {53001, 53002, 53007} — the set moves with master, and the original prereg's own metric-review note prescribes re-derivation from the run's own before leg. The re-derivation is stated in the evidence before the pilot verdict is judged.
- **New corpora, fresh dirs — never overwrite the judged `514e4fa6e` corpora:** pilot armed `evidence/2026-11-09/perseed-sitdrive-winseek-b-rebase/`, pilot before `evidence/2026-11-09/perseed-sitdrive-winseek-b-rebase-baseline/`. New panel dirs (e.g. `sitdrive-winseek-panel-before-rebase` / `-after-rebase` / `-before-gateoff-rebase` as needed); the new compare `.md` is attached to the evidence.
- **Confirm re-runs on the SAME band 54209–54224** (same seeds, new master). This is deliberate: the question is whether the verdict survives the master move, so re-use is the control. This is a re-baseline of the same experiment, not a new experiment — re-using the band is the point, not a freshness violation. The original freshness check (prereg, 54209–54224 fresh vs all dated preregs + evidence) stands for the experiment; the re-baseline re-runs it on a new master.
- **The proof's REAL legs will be re-pointed at whatever new demonstration seed(s) reach the seat on the new master**, if any. The proof must still fail on a broken drive (RED-phase legs kept — gate ignored, double-take, fight-skip missing, preview-null treated as ready, rule-order swap). NEVER weaken an assertion to go green. If NO seed on the new master reaches the seat, that is itself the finding: the pilot re-baseline judges it, the proof cannot demonstrate a sit that never happens, and the evidence must say so plainly rather than faking a demonstration. The proof must be green on the new base before the arm is reported ready-to-merge.
- **Stop rule (unchanged):** pilot NO-GO → confirm does not run, drive does not land.

## What does NOT change

- The same 6 pilot bars, the same 3 confirm bars (restated below with the re-derived reachable set).
- The same driver (`scripts/sitdrive-winseek-driver-20261109.js`), the same analyzer (`scripts/analyze-sitdrive-winseek-20261109.js`), the same policy (`scripts/policies/winseek-sitdrive-b.js`, gate `SITDRIVE_B=1`, default OFF, zero src/js), the same horizon (150d death-aware), the same defaults (no `POINTER_GATED`, `WINSEEK_R8` default on).
- The analyzer's verdict logic is NOT silently edited. If it needs a change for the new reachable set, the change is justified in the evidence and covered in the proof.
- Do NOT re-run panel sweeps unless a corpus proves invalid.
- No landing, no push, no version bump — report ready-to-merge or HELD/NO-GO; the coordinator lands it.

## GO bars (binding — same as the original prereg, reachable set re-derived)

**Pilot (frozen band 53001–53008, 150d death-aware, before vs after on identical seeds, same master `8cee6a8d2`):**
1. **Primary metric — sits:** armed sits **all reachable seeds** (reachable = alive at the day-90 floor with a ready preview on THIS run's before leg) AND the **offered-not-taken class is empty** on the armed leg (0/8). A sit on a seed the before leg classed reached-never-sat is reported as a finding (the drive cannot extend life — if it happens, the trajectory moved and the mechanism is named, never smoothed).
2. **Cost bars:** starvation deaths (fallen cause exactly `starvation`) armed **≤ control + 2** on band totals AND on arm-only deaths (starvation deaths on the seeds where the drive fired — the sat seeds — armed ≤ control on those same seeds + 2); true median survival armed **≥ 0.8× control median**.
3. **G1 det-gate PASS** (proof `scripts/test-sitdrive-winseek-b.js`: drive-fires unit legs on fixtures + gate-OFF neutrality + broken-drive sensitivity; see Proof).
4. **G2 recorder neutrality PASS** on the armed leg (armed-recorded vs armed-unrecorded trajectory identical — headline + daily living/fallen/end fields — on control seeds 53008 and 53004, same code, same master; same two seeds as the original arm).
5. **G3 corpus integrity PASS** (every corpus JSON: daily rows span first→last day, end snapshot present, `sitgap` present on every row, fallen list consistent with daily living drops, 0 instrument errors) — 8/8 both legs.
6. **Gate-OFF neutrality PASS (real sim):** the gate-off leg (policy `winseek-sitdrive-b`, `SITDRIVE_B` unset) reproduces the plain-winseek leg byte-identically on the demonstration seed (headline + daily rows + fallen + `takeseatStats`) — the composite with the gate off IS winseek.

**Confirm (same band 54209–54224, 16 seeds, 150d death-aware, before vs after through the balanced panel, §15) — runs only if the pilot is GO:**
7. **Confirm primary:** panel `table` (sittings, ruling 665) after ≥ before + the pilot's reachable-seed rule restated on the fresh band: every fresh-band seed that reaches day 90 alive with a ready preview on the before leg sits on the after leg; offered-not-taken empty on the after leg. The panel compare `.md` is attached to the evidence file.
8. **Confirm cost bars:** same starvation + median bars as the pilot, judged on the panel rows (panel `deaths`/`gameDays` series where the contract carries them) AND on the recorder corpora.
9. Panel validity: sources stable, observer neutrality proofs match, no cohort warnings (the panel itself enforces this — an invalid panel is a failed confirm, not a re-run).

If the pilot is NO-GO, the confirm does not run and the drive does not land. The arm stays HELD (the drive is not broken — the demonstration seed moved) and the evidence says what the next step is.

## Proof

`scripts/test-sitdrive-winseek-b.js` (det-gate + neutrality + corpus-integrity legs, modeled on `scripts/test-sitgap-winseek-b.js`). Must FAIL on a broken drive (gate ignored fixture; double-take fixture; fight-skip missing fixture; preview-null treated as ready fixture) and on a broken classifier (rule-order swap fixture), and PASS on the real ones. Legs:
- **Unit:** drive fires exactly once on a ready fixture (announced + ready + at Haven + no fight + not over) and records day/kind/doors; second call is a no-op (already-taken); `tableDone` blocks; live fight → skip `fight`, no call; not announced → skip; preview null → skip `preview-null`; not ready → skip `not-ready:<why>`; gate OFF → no call and zero stats even when ready (RED phase).
- **Gate-OFF neutrality (real sim, /tmp output, not evidence):** demonstration seed gate-off vs plain winseek through the same driver — byte-identical corpora (headline + daily + fallen + `takeseatStats`).
- **Measurement (real sim, /tmp output):** demonstration seed armed sits (seatTaken 1, seatDay = the first ready day, kind lesser, doors offered ≥1) vs gate-off 0 sits — re-pointed at the seed that sits on the new master, if any.
- **G1 classifier:** the analyzer reproduces the five classes on synthetic fixtures (sat with doors; offered-not-taken with REAL skip diffs — the mechanism may cite skips now, and must NOT state "no sit drive runs"); the winseek DIAG analyzer's no-sit-drive sentence must NOT appear in any armed-leg mechanism.
- **G2/G3:** recorder neutrality + corpus integrity on the pilot corpora when present (skip-until-present, as the original proof does); driver `writeFileRetry` round-trip (reused function).
- Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-sitdrive-rebaseline-b`.

## Metric review (pre-registered note)

- The primary metric is sits on identical seeds, judged against the bars above — not a friendlier re-scoring of the band's health. The reachable-set re-derivation is prescribed by the original prereg's own metric-review note and by this addendum: the bar names exactly the reachable universe defined by this run's before leg.
- The winseek leg never walks a trial door and never wins by design; national/table/wins are reported as wall numbers, not judged. A sit is a sitting, not a win. (On `514e4fa6e` a sit became a win 2/2 pilot and 3/3 confirm through first-option feared-path play — reported honestly there, not a judged metric; if it recurs here it is reported the same way.)
- Panel (§15): the confirm runs through the panel; the pilot is a recorder-corpus before/after (the panel refuses recorder corpora by design). The pilot verdict does not wait on the panel; the confirm verdict does.
- Flap protocol: probe-gate EVERY git write (`git update-ref refs/heads/probe HEAD` before each safe-commit); if the probe fails, do read work and retry later — never force a write, never route around a denial with a manual ref edit.
- Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob.
