# sim-fusioncell-fix-a — NO-GO (supply fixed, volley never fires, deaths guardrail fails)

**Arm:** sim-fusioncell-fix-a · **Loop A run:** fleshout-20261119T1815Z (adoption closeout)
**Type:** BUILD + measure — the fix for finding #2599 (the searcaster that can never fire).
**Prereg:** `evidence/2026-11-19/sim-fusioncell-fix-a-prereg.md` (frozen 2026-11-19 ~13:30 UTC).
**Base:** master `7e0810eea`; branch anchor `7e0810eea5fb` (no branch commits — the fix was
uncommitted in the worktree when the run timed out; the adoption finished the arm).
**Verdict: NO-GO** — bars 2 and 4 fail. Per the frozen verdict ladder the fix is
**REVERTED before commit** (killed arms leave no trace — game code reverted, only
instrument + evidence commit). Finding #2599 stays OPEN.

## 1. The question

The diag answered #2599: 3 fusion cells band-wide, ALL from contest prizes, max 1 per holder;
the searcaster holder (chen_wei, 97 days) never held a cell, so the gun could never fire. This
arm builds the fix the finding names — a searcaster contest-prize grant bundles 2 fusion cells,
and the standalone cell contest-prize weight goes up (tier-4 contest roll: 0.25 outright cell
pick) — and proves, on a panel, that a searcaster holder with cells actually fires a volley in
a wave-4+ fight. Same band as the diag (107021–107028), 8 seeds × 150d, two legs differing
ONLY by FUSIONCELL.

## 2. Frozen bars (verbatim from the prereg)

| # | Bar | Control | Arm | Result |
|---|-----|---------|-----|--------|
| 1 | Armed holder at entry ≥ 1 (searcaster holder with ≥1 cell at a wave-4+ fight entry) | 0 | **7** | PASS |
| 2 | Armed volley FIRED ≥ 1 (volley FROM a searcaster in a wave-4+ fight, `rangedId === 'searcaster'` AND `volley.shots > 0`) | 0 | **0** | **FAIL** |
| 3 | Cell supply band-wide ≥ 6 (appearance deltas) OR ≥ 2 searcaster holders with cells | 3 cells, 0 holders | **14 cells, 3 holders** (cell grants 15 vs 3; searcaster grants 3 vs 4) | PASS |
| 4 | No-regression guardrails: median survival arm ≥ 0.8× ctl; deaths/run arm ≤ ctl × 1.10 | median 143.5, deaths 76.6/run | median **147.5** (pass); deaths **91.0/run** (bar ≤ 84.3) | **FAIL** |

**NO-GO = any bar misses → the fix is reverted.** Bars 1 and 3 pass — the supply fix works
exactly as designed. Bars 2 and 4 fail — the gun still never fires, and the villages die more.

## 3. The participation finding (bar 2) — the gun never meets the fight

All 7 armed-holder entries are ONE village, ONE holder, ONE week: seed **107028**, holder
**nora_wilson**, 2 cells, alive, days 131–143. In every one of the 7 wave-4+ meetings she is
an **ally, never the lead fighter** (leads: app_mgpsphru785 ×5, visjoin_136, visjoin_140).
The volley is the LEAD fighter's only (fieldFights.js), so her searcaster never fires — and
every one of the 7 fights ends **vFlee**: the party runs. The prereg's risk note called this
exact shape: "A NO-GO on bars 1–2 with bar 3 passing is a PARTICIPATION finding (the gun
still never meets the fight), not a supply finding." The follow-up belongs to a participation
arm (who leads a wave-4+ fight — and why a party with an armed searcaster flees seven times
running), not a bigger bundle. The bundle cannot fix lead selection, and the weight increase
cannot fix fleeing.

Note the diag's holder is gone on the arm leg: chen_wei holds no searcaster on the arm leg at
all (holders are gen_lmee5q7 on 107027, 50 days / 4 cell-days, and nora_wilson on 107028,
15 days / 15 cell-days). Same seeds, different worlds — see §6.

## 4. Supply (bar 3) — the fix works as designed

- Cell supply: arm 14 vs ctl 3 (bar ≥ 6). Cell grants: arm 15 vs ctl 3, all contest-prize.
  Searcaster grants: arm 3 vs ctl 4. Searcaster holders with cells: arm 3 vs ctl 0 (bar ≥ 2
  alternate path also passes).
- Cell-holder days: arm 239 vs ctl 57. Max cells ever held: arm 2 (the bundle) vs ctl 1.
  Scholar cell appearances: arm 5 vs ctl 1; scholar max cells: arm 2 vs ctl 1.
- Attribution: cells 11/11 (1.000) on the arm leg; searcaster appearances 2, attributed 1
  (0.5 — one unexplained searcaster appearance, recorded, not judged).
- The proof test (`scripts/test-fusioncell-fix-a.js`, 26/26, rewritten by the adoption after
  the worker's file was lost to the flap as 0 bytes — see §7) proves the mechanism directly:
  the bundle gives the same holder +2 cells for villager and player; the 0.25 override fires
  only on tier-4 contest rolls (trade and kill-loot paths consume no extra draw); control-leg
  identity holds (FUSIONCELL unset: same prize, no bundle, no override draw); the armed
  volley fires 64–68 damage per hit on the encounter-gear fixture.
- Secondary: searcaster departures with cells arm 9 (7 of them zero-cell — the holder departs
  without cells more often than with); "no fusion cells" log lines 0 on both legs.

## 5. No-regression (bar 4) — deaths fail, survival passes

- Median survival: arm 147.5d vs ctl 143.5d (bar ≥ 114.8: PASS).
- Deaths/run: arm 91.0 vs ctl 76.6 (bar ≤ 84.3: **FAIL**, 1.19×).
- Starvation deaths: arm 1 vs ctl 3 (better). Community lost: 4/8 both. Wave-5 unlocks:
  arm 4/8 vs ctl 2/8. National 0/8 both; wins 0/8 both.
- Panel (§15) `fusioncell-fix-a-panel.md`: **review_required** with a **regression_signal**
  on village deaths per run (+14.375, 95% exploratory interval 4.75 to 23.625 — does NOT
  straddle zero). Deaths per 100 calendar days is regression_watch (+3.84, interval straddles
  zero). The deaths gap is a real paired signal on this panel — it is not noise, and it is
  not waived.

## 6. Metric review (§14) — the exposure confound (recorded, NOT a re-score)

The deaths gap cannot be read as "the fix kills villagers" without the exposure ledger:

- Wave-4+ meetings: arm **192** vs ctl **85**; engaged: arm **171** vs ctl **63**. The arm
  leg fought 2.7× as many wave-4+ fights.
- The gap is concentrated in two seeds: **107024** (ctl 0 meetings → arm 73) and **107028**
  (ctl 4 → arm 39). The other six seeds are close (32/33, 0/0, 8/7, 15/19, 4/4, 22/17).
  Same seeds, different worlds.
- Cause of the divergence: the fix consumes one extra `Math.random()` draw per tier-4
  contest roll on the arm leg (the 0.25 override). Every extra draw shifts the whole RNG
  stream downstream, so the two legs' worlds diverge — different monsters, different
  encounters, different deaths. This is a property of the harness (seeded RNG, legs differ
  by one flag), not of the fix's game effect.
- Normalized by exposure, the arm leg is SAFER per fight: deaths per engaged meeting
  ctl 613/63 = **9.73** vs arm 728/171 = **4.26**. The raw guardrail fails only because
  the arm leg fought far more.
- A second possible (minor) mechanism: the 0.25 override turns ~12 tier-4 contest prizes
  into cells instead of gear (cell grants 15 vs 3). Twelve missing tier-4 items across 8
  villages cannot plausibly drive +115 deaths; exposure is the dominant explanation. But
  the split cannot be proven on this panel — which is exactly why the bar is written as a
  guardrail, and why the verdict stands NO-GO: the fix as designed cannot prove it is safe
  on this band.
- **Proposal for the NEXT run (not a re-score here):** judge the no-regression guardrail
  exposure-normalized (deaths per engaged wave-4+ meeting, or deaths per 100 fight-days),
  and/or use a draw-neutral design (the override consumes its draw on BOTH legs, with the
  flag deciding only what the draw means). The raw deaths/run bar punishes any flag that
  consumes RNG draws, however harmless the flag is.

## 7. Flap record (this arm's run)

- The fix (contests.js + game.js) and the prereg were written before the 19:56Z+ flap window
  and survived. The driver (102 KB), analyzer (40 KB) and panel builder (5 KB) survived.
- The proof test `scripts/test-fusioncell-fix-a.js` was **lost to the flap as 0 bytes**
  (written 19:55Z, during the window — the classic flap signature: file created, write
  refused). The adoption rewrote it from the prereg + the diag test template (26 checks,
  26/26 GREEN; the diag test still 40/40 GREEN with the fix present but ungated).
- The panel sweep ran clean after the flap cleared (~20:22Z): ctl exit 0, arm exit 0, all
  16 corpora verified (seed / mode / fusioncellOn / anchor `7e0810eea`), 0 instrument
  errors. Analyzer `--selftest` 34/34.
- The timed-out run's worker was cancelled before the panel ran; the adoption ran the
  sweep, analysis, panel and evidence.

## 8. Revert (per the frozen ladder)

The fix is reverted in this worktree before commit: `src/js/contests.js` and `src/js/game.js`
restored to master (`git checkout --`). No `src/` change lands from this arm. The commit
carries instrument + evidence only: prereg, driver, analyzer, panel builder, proof test,
analysis, panel, corpora, logs. The FUSIONCELL gate, the bundle and the weight change are
NOT on master and must not be re-applied without a new prereg (participation arm first).
Finding **#2599 stays OPEN** — supply is now proven fixable (bars 1+3), the volley is a
participation problem (bar 2), and the guardrail needs the exposure-normalized revision (§6).

## 9. Verification (adoption)

- Proof test `scripts/test-fusioncell-fix-a.js`: 26/26 GREEN (rewritten, see §7).
- Diag test `scripts/test-fusioncell-a.js`: 40/40 GREEN (no regression from the fix code).
- Analyzer `--selftest`: 34/34.
- All 16 corpora verified (seed/mode/fusioncellOn/anchor, 0 errors).
- Panel compare attached: `evidence/2026-11-19/fusioncell-fix-a-panel.md`
  (+ `fusioncell-fix-a-panel-before.json.gz` / `-after.json.gz`).
- Analysis: `evidence/2026-11-19/fusioncell-fix-a-analysis.json`.
- Gate: see the round evidence `evidence/2026-11-19/sim-scale-onramp-round-1815.md`.

## 10. Village assessment (plain words)

Eight villages, same seeds, two different worlds. Give the villages the fix and the cells
finally arrive — fourteen of them, where three came before, and three villagers walk around
with a loaded alien gun for the first time. But the gun never goes off. The one villager
who carries it into seven wave-4 fights in a single week is never the one leading the
fight, and her party runs from every single one of them. A loaded gun in the second row of
a fleeing party is decoration. And the villages that got the cells died more — not because
the cells hurt anyone, but because their worlds happened to throw twice as many monsters
at them, and every extra fight costs a life. The supply problem is solved. The fight
problem — who leads, and why they run — is now the whole question.
