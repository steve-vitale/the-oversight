# sim-readinessgate2 — the readiness gate v2 (faced-experience + plenty cap + monotonic) (2026-10-15)

Worktree: `~/workspace/worktrees/sim-readinessgate`. Run: oversight-flesh-out-loop, 2026-10-15.

## Context: v1 killed, diagnostic landed, bar re-drafted
- v1 (evidence/2026-10-15/sim-readinessgate.md): kill/counter/armor bar — KILLED AT PILOT on the pre-registered primary (holder rate 0.833 < 0.9725 bar, §14). Game code reverted; instruments kept.
- Sibling diagnostic (evidence/2026-10-15/sim-readinessbind.md, landed 613eb8d7): NO unlock-day-covariate bar is supportable. Kill/counter covariates degenerate on diplomacy/plenty roads (median 0 both groups); armor and trust INVERT (corpses more armored/trusted — a gate on armor/trust gates the WRONG village); waves 4–5 counter-less by design. Candidate teeth: "≥N distinct wave-4 types faced" as a T5 tooth; cap plenty's Standing contribution toward T5; monotonic-or-handle re-lock (2/5 w5 unlocks re-locked on link break); the w5 "wave-4 faced" prong is toothless (all 5 w5 unlocks faced exactly 1 distinct wave-4 type, w4→w5 lag median 4d).
- This run re-drafts the bar on the diagnostic's design basis and re-runs the pilot.

## The lever (game code, src/js/standing.js only — v2)
- `waveUnlockReady(w)`: FACED-EXPERIENCE — distinct wave-(w-1) types faced blow-by-blow (`waveEngaged`: fleeing counts, you stood on the grid). The war-road-native signal; reachable on diplomacy/plenty roads (unlike kills/counters). Thresholds (sim starting points, not canon — Steve can overrule):
  - wave 4: `readyFacedW3 = 3` distinct wave-3 types faced
  - wave 5: `readyFacedW4 = 2` distinct wave-4 types faced (diagnostic: all 5 w5 unlocks had faced exactly 1 — N=2 has teeth)
- `standingPlentyCappedTotal()`: plenty counts at most `plentyCapT5 = 100` toward the T5 bar — bread alone cannot buy the fifth draft (the diagnostic's plenty accelerator: w4 at 5 feasts → w5 1–4d later).
- Monotonic unlocks (`_standingPeakWave`): once the gated total releases wave w, the effective total never drops below that wave's threshold again — the diagnostic's accidental re-lock on link break becomes a one-way ratchet. Design call (Steve can overrule): the deferral beat promises the draft "opens"; revoking it on a broken link is incoherent fiction.
- `villageStandingTotal()` (only reader: `unlockedWave()` in game.js): applies the plenty cap (raw ≥ t5 but capped < t5 → held at t5-1, one-time System beat), the faced-experience deferral (capped t4-1/t5-1, engagement beat + weekly reminders), then the peak ratchet. `standingLine()` names holds/caps — no silent gates.
- Dropped from v1 per the diagnostic: kill-type, counter, and armor criteria; any trust term.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)
- **Axis**: scale-onramp (the wall), lever-2 lens. Same tree, identical seeds, in-script standing.js swap (pristine HEAD vs armed v2; no stash).
- **Seeds**: 11/22/33/44/55/66/77/88 x leadfeast/belongfeast (= leadcourt/belongseek via FEASTSCALE_R13). **Horizon**: 180d death-aware.
- **PRIMARY** (kept as briefed): 30d post-unlock holder rate among w4/5 Standing unlockers driven by diplomacy/plenty (war < threshold **at the unlock**, when the wave actually opens) >= control x 1.25.
  - INSTRUMENT FIX (2026-10-15, before the scored run): the first sweep evaluated "driven" at the Standing *crossing* sample — but a deferred unlock crosses T4 while the wave is still held at 3, so every deferred unlock was systematically excluded from the primary population (armed 0/0). The pre-registered intent is "diplomacy/plenty-driven *unlockers*"; the instrument now evaluates war < threshold at the unlock day. This is a bug fix to the instrument, not a re-scoring of the metric — the scored run below uses the fixed instrument on both legs.
- **GUARDRAILS** (kept as briefed): wave-4 unlock rate within 0.20-0.60 (deferral shifts timing — the 0.30-0.50 tune band is the review reference, NOT the kill bar); median survival >= control-10d; national >= control-2/16 (16 runs/side; the brief's /8 applied strictly); no new death mode at the cause-FAMILY level (strip player:/villager: prefix, named-monster kills -> 'monster'; armed-only family with n>=3 = new mode).
- **SECONDARIES** (non-binding, for the metric review): absolute 30d post-unlock deaths (control vs armed); deferral engagement (defer4Ever/defer5Ever, median held days — is the faced bar vacuous or does it bite?); plenty-cap bind days; faced counts at unlock; per-channel release attribution.
- **Gates before spend**: proof scripts/test-readinessgate-20261015.js (v2) RED->GREEN; det-gate 16/16 identical both sides; SMOKE=1 instrument-honesty (named-export unwrap + v2 mechanism reachable on scripted fixtures).
- **GO**: primary met at pilot -> confirm 12-16 seeds before calling GO. A miss is NO-GO, never re-scored mid-run. The diagnostic's numbers inform the metric review, not the GO.

## Design calls documented for Steve's overrule
1. N4=3 / N5=2 faced thresholds — sim starting points. N5=2 chosen because the diagnostic's w5 unlocks all sat at exactly 1 faced type; N4=3 is unmeasured (no wave-3 faced data) — the pilot's defer4Ever tells us if it bites.
2. Plenty cap 100 toward T5 — the "two full avenues" rule: bread can carry half the fifth draft, never all of it.
3. Monotonic unlocks — answers the diagnostic's spec question ("should unlocks stick?") with YES.
4. Armor P and trust are OUT of the bar (diagnostic: both invert).

## Results (pilot, 8 seeds x leadfeast/belongfeast, 180d death-aware, identical seeds, fixed instrument)

Gates before spend (all green): proof scripts/test-readinessgate-20261015.js
(v2) REAL RED (pristine: gate absent → INFO-SKIP) -> GREEN 29/29 armed
(faced deferral fires; each channel releases; plenty cap binds; monotonic
ratchet holds; no-win-before-90 intact). Det-gate 16/16 identical on BOTH
sides. SMOKE=1 instrument-honesty green both sides (named-export unwrap +
v2 mechanism reachable on scripted fixtures).

| metric | control (pristine) | armed (v2 gate) | pre-reg bar | verdict |
|---|---|---|---|---|
| PRIMARY: 30d holder rate, non-war-driven w4/5 unlockers | 0.800 (16/20) | 0.938 (15/16) | >= 1.000 (=control x 1.25) | MISS |
| wave-4 unlock rate | 0.688 | 0.688 | within 0.20-0.60 | band missed BOTH sides |
| median survival | 109d | 176d | >= control-10d | HOLD (+67d) |
| national | 6/16 | 8/16 | >= control-2 | HOLD |
| new death mode (family, n>=3) | — | none ('lockjaw' n=1) | none | HOLD |
| wall: table / wins | 7 / 0 | 12 / 0 | — | — |
| SECONDARY: absolute 30d post-unlock deaths | 4 | 1 | — | -75% |
| SECONDARY: deferral engagement | — | defer4 11/16, defer5 5/16, median held 13d | — | bar has teeth |
| SECONDARY: wave-5 unlocks | 9/16 | 6/16 | — | plenty cap + faced tooth bite |

**VERDICT: KILLED AT PILOT — NO-GO on the pre-registered primary**
(0.938 < 1.000). Per §14 the miss binds; the arm is not re-scored.
Kill protocol executed: `src/js/standing.js` reverted byte-clean
(`git checkout HEAD --`, no stash); proof degrades to INFO-SKIP exit 0;
det-gate, sweep, sense instruments and this evidence kept.

## Why it missed (honest diagnosis)
The mechanism worked — absolute post-unlock deaths 4 → 1, holder rate
0.800 → 0.938, median survival +67d, national +2, table +5, all guardrails
HOLD. But the pre-registered bar (control × 1.25 = 1.000) demands a PERFECT
holder rate: with control at 0.800, no rate can clear ×1.25 except 1.000
(rates are bounded by 1). The armed side lost exactly one village in the
30d window (15/16); the bar required zero. A relative ×1.25 bar on a
high-control rate is unachievable by construction — the primary was
mis-specified, not the mechanism. (v1's kill had the same shape: bar 0.9725
on control 0.778.)

## Metric review (§14 — for the NEXT run, not this one)
1. **Relative rate bars break when control is high.** ×1.25 on 0.800 = 1.000
   (perfect). Future primaries on this axis: absolute 30d post-unlock deaths
   (4 → 1 here), or a bar like "holder rate ≥ control + 0.10" (0.900 —
   cleared here), or time-to-event survival analysis. Never a relative
   multiplier on a rate with control ≥ 0.8.
2. **Instrument bug fixed mid-run (documented, not rescored).** The first
   sweep evaluated "driven" at the Standing crossing — deferred unlocks cross
   T4 while held at wave 3, so all were excluded (armed 0/0). The scored run
   evaluates war < threshold at the actual unlock day on both legs. The fix
   implements the pre-registered intent ("diplomacy/plenty-driven
   *unlockers*"); the GO verdict uses the fixed instrument.
3. **The faced bar has teeth (not vacuous).** defer4Ever 11/16, median held
   13d, max 89d (leadfeast s88: held 89d, released d144, survived 180).
   N4=3 / N5=2 were the right starting points — the bar engages without
   hanging (all held unlocks eventually released or the run ended).
4. **The plenty cap rarely bound** (median plentyCapDays 0 armed) — it is a
   backstop for the pure-plenty path, not a frequent gate. Its effect is
   visible in wave-5 unlocks (9 → 6): the cap + faced tooth filtered the
   bread-only ascents. Whether the cap alone (without the faced tooth)
   would suffice is untested.
5. **Monotonicity untested in the wild.** No run in the pilot hit the
   re-lock scenario (standing collapse after unlock), so the peak ratchet
   fired only in the proof fixtures. The diagnostic's 2/5 re-locks were on
   a different substrate (fourthlink/belongseek). A future run should
   deliberately include a link-break scenario.
6. **The 0.20–0.60 wave-4 band is miscalibrated for this substrate** (both
   sides 0.688, as in v1). The band needs re-basing before it can judge
   anything on courtship roads.

## SENSE-TESTING (armed leadfeast s33 — 32d held, wave-4 d89, wave-5 d135, survived 180)
- d57: the faced-experience hold beat fires in the System's voice —
  "the Mirror Draft is not for strangers. Face what hunts you now — stand
  on the grid with the Final Draft, more than once, more than one kind."
  Weekly reminders d64/71/78/85 keep the hold legible.
- d88: release composes — "RATINGS ARE UP... Wave 4 talent has been
  released" only after the faced bar passes. d104: the wave-5 hold beat
  ("the fifth draft stays in the wings... Stand before the Mirror Draft's
  champions"), reminders d111/118/125/132, wave-5 unlock d135.
- The beats name the bar honestly in both directions; the player is never
  told they're "ready" — the world responds when they are.
- PASS on meaning and coherence. No new beats for the plenty cap fired on
  this seed (the cap didn't bind — consistent with secondary #4).

## Village assessment (plain words)
The armed villages are the control villages with a bouncer at the door —
and the bouncer asks for scars, not trophies. Control villages feast and
befriend their way to wave 4 by day ~55 and wave 5 days later; one in five
of the diplomacy/plenty unlockers is dead or hollow within a month
(median 109 days). Armed villages hit the same Standing numbers and hear
*not yet* — and in the held weeks (11–89 days) they keep living: they
face the Final Draft's monsters, they season their links, they fight.
When the drafts open, they open onto villages that have stood on the grid.
Median 176 days, table 12/16. The one armed corpse in the primary window
is the honest remainder: the gate delays the war, it doesn't win it.

## Blanks filled / documented
- FILLED (then killed): the v2 readiness gate — faced-experience bar +
  plenty cap toward T5 + monotonic unlocks, built in `src/js/standing.js`
  only, proved RED->GREEN 29/29, det-gated 16/16 both sides, measured
  against its own paired control, killed per protocol. Reverted byte-clean;
  instruments kept.
- DOCUMENTED (sim-findings backlog): (1) relative ×1.25 rate bars are
  unachievable when control ≥ 0.8 — future primaries must be absolute
  counts or additive bars; (2) the instrument bug (driven-at-crossing vs
  at-unlock) is fixed in the kept sweep script; (3) monotonicity still
  needs a wild test with a link-break scenario; (4) the plenty cap's
  standalone effect is untested.
- CANDIDATE for a future arm (from the diagnostic, untested here):
  "≥N distinct wave-4 types faced" as a T5 tooth is now MEASURED
  (N=2 held 5/16 runs' wave-5 unlocks; all released or run-ended).

## Convergence
scale-onramp: CONVERGING (unchanged). The v2 gate is the strongest
readiness-gate measurement to date (post-unlock deaths 4 → 1, holder rate
0.800 → 0.938, median +67d, every guardrail HOLD), but it was killed on a
pre-registered bar that demanded perfection (1.000). The axis does not
move until a run with an achievable primary lands a version of this gate —
the mechanism is proven, the metric needs the fix.

## Files
- `src/js/standing.js` — REVERTED byte-clean per kill protocol (no trace).
- `scripts/test-readinessgate-20261015.js` — proof, REAL RED -> GREEN 29/29
  (v2); now INFO-SKIP exit 0 on pristine (kept).
- `scripts/det-gate-readinessgate-20261015.js` — det-gate 16/16 identical,
  both sides, v2-sensitive hash (kept).
- `scripts/sweep-readinessgate-20261015.js` — pilot sweep, SMOKE=1 gate,
  in-script pristine/armed swap with byte-verified restore, fixed
  at-unlock driven measurement (kept).
- `scripts/sense-readinessgate-20261015.js` — beat-capture sense replay
  (kept).
- `evidence/2026-10-15/sim-readinessgate2.json` — full per-seed rows both
  sides, fixed instrument (kept; national/table/wins/exiled per-row fields
  present — coordinator owns the telemetry-check baseline roll).
- `evidence/2026-10-15/sim-readinessgate2.md` — this file.
