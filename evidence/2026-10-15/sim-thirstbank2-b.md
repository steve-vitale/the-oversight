# SIM-THIRSTBANK2 — the thirst-safe banking shape, re-measured with the regime-aware hunger bar (loop B ARM 2, 2026-10-15)

**Run:** fleshout-b-20261015T1229Z · ARM 2 of 2 · sim-findings **#300** (named next; #286 stays open)
**Date:** 2026-10-15 · worktree `~/workspace/worktrees/sim-thirstsafe`
**Axis:** food-economy (scale-wall lens)

## Canon note

docs/CANON.md read first, docs/PRESERVATION.md read. **There is no
water/thirst canon doc** — stated per the canon rule, not invented. All water
mechanics (cistern 40L cap, villager 2L/day draw via `villageDrinks`, health
−5/day when unmet, `registerDeath` cause `'thirst'`, hearth boiling 6L/wood,
villager task `'water'` hauling 10–14L into the dirty side, autonomous WATER
objectives +2–4L clean when `clean<3`, obedience-gated `assignTask`) are read
from `src/js/game.js` / `src/js/villager-objectives.js` / `scripts/policies/competent.js`
as-is. Zero src/js changes in this arm. Policy-side only.

## Lineage

sim-scholarreserve → sim-mealonly → sim-trusthalf (killed: exposure price) →
sim-bankleg (killed: thirst 9 vs ≤2) → sim-banklegrecal (killed: thirst 9 vs ≤2
on the letter; h1200 0.512 GO — the corrected metric vindicated the mechanism) →
sim-thirstinst (instrument; phenomenon absent unlayered — deleted-lever artifact) →
sim-thirstsafe v1 (pilot GO: thirst 1 vs 9, h1200 0.617×, trust 1.669×; confirm
killed-at-confirm: h1200 1.000× — regime-dependent hunger win) → sim-thirstsafe
v2 (killed: whole-shape gate worse — thirst 3, h1200 0.998×) → sim-thirstbank
(killed at pilot: h1200 0.751× vs ≤0.650 bar, both roads miss — the v1 shape's
hunger win does not replicate on current master) → **this arm: the v1 thirst-safe
shape re-measured with the regime-aware hunger bar (#299's own named next)**.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question:** the v1 thirst-safe banking shape (always-on take-discipline +
  haven-adjacent pack-banking leg, the leg trust-gated at 25 so water/wood
  duties keep working below the gate — sim-findings #300's named mechanism)
  holds thirst (1 vs 9 in the probe; 0/0 at pilot on current master) and
  trust (1.42× twice), but its hunger win is regime-dependent (0.617× on
  hungry seeds, 1.000× on easy seeds, 0.751× on the current-master pilot).
  The sim-thirstbank metric review's named next: a future hunger lever
  pre-registers a regime-aware bar. Does the v1 shape clear a regime-aware
  hunger bar while holding the thirst guardrail on current master?
- **Layer:** `scripts/policies/thirstbank2.js`, `THIRSTBANK2=1` (default OFF).
  Rebuilt honestly from the record (the layers were deleted per kill
  protocol; nothing from memory): `hidden_files/bankleg-layer-20261015.js.bak`
  (the r43b bankleg shape: take-discipline + low-exposure haven-adjacent
  guarantee leg — garden harvest / haven fish / haven forage; tile-identity
  asserted per leg; zero wild-tile visits; GUARANTEE_FLOOR = Game.kcalCap();
  at most one leg/day) PLUS the v1 trust gate (below trust 25 the leg YIELDS
  the day to the base policy; `legYielded` counted, never silent; the
  take-discipline stays ALWAYS-ON — discipline != leg). Zero src/js changes.
- **Road:** 8 seeds (11/22/33/44/55/66/77/88) × {belongseek, leadcourt} ×
  {control, armed}, 180d death-aware (+10d tail max), identical seeds both
  sides. Own control in the SAME sweep (CONTROL BASELINE DRIFT #247). If the
  sibling loop lands on master mid-run, `git rebase master` in this tree,
  re-run proofs, then report.
- **PRIMARY:** villager thirst deaths armed ≤ 2/16 (the killed shape fired
  9; control expected 0; the probe's gated shape hit 1).
- **CO-PRIMARY:** scholar hunger h1200 (daily min bar < 1200) armed ≤ 0.75×
  control (the honest hunger bar standing — #299's named next: a regime-aware
  bar, not the 0.65 bar the regime-dependence killed twice).
- **GUARDRAILS:** median survival ≥ control−10d; national ≥ control−2/16;
  scholar starveDeaths ≤ control+2; no new death mode (≥3 armed-only).
- **GO:** primary + co-primary + all guardrails. A miss is NO-GO (§14),
  never re-scored. GO → commit the layer (scripts + evidence; [needs-eyes]
  — the hatch line is player-visible narration). MISS → delete the layer per
  kill protocol, evidence + instruments only.
- **ANSWERABILITY:** if control h1200 < 8 across the 16 control runs, the
  primary ratio is noise-powered → INFO-SKIP, no verdict.
- **Confirm:** 12–16 seeds ONLY on pilot GO.
- **Gates before sims:** `scripts/test-thirstbank2-20261015.js` — PART A
  fixtures (gate off/on, REAL RED natural takes, NON-AGGRESSION gate-off
  wrapped == raw base 20d byte-identical, gate-on refusals, REAL hatch +
  narrated, hatch closed-states, trust-high leg fires exactly 1,
  trust-low leg YIELDS + discipline STILL refuses, exposure tile-identical
  + zero travel); PART B live engine REAL RED (trust-low early-siege
  fixture: old ungated shape → cistern 0; new trust-gated shape →
  cistern > 0, honest); PART C det-gate byte-identical 30d × 8 seeds ×
  2 policies. SMOKE=1 instrument-honesty gates in proof AND sweep.

## Proof results

`scripts/test-thirstbank2-20261015.js` — **98/98 assertions RED→GREEN** on a
live Game, both policies (belongseek + leadcourt), measured on base
`e4160f0f`:
- PART 0 (module + gate): all named exports incl. `trustMean`, `TRUST_GATE`;
  `TRUST_GATE===25`; gate off/on correct (`THIRSTBANK2` unset/`=1`).
- PART 1 (RED): gate-off base.upkeep fires real takeFromPantry calls drawing
  kcal (the voluntary-take bind is real).
- PART 2 (NON-AGGRESSION): gate-off wrapped == raw base, 20d byte-identical.
- PART 3 (GREEN): gate-on, 0 real kcal taken, refusals climb, hatch shut
  while a meal is coming.
- PART 4 (HATCH): estranged, bar<1200, empty pack → REAL ledger-recorded
  take, hatchTakes==1, narrated ("The discipline breaks — hunger wins…").
- PART 5 (HATCH-CLOSED): fed / pack food / meal coming / away — all shut;
  hungry + empty + at hall + no meal → open.
- PART 6 (GUARANTEE, trust high): thin pack → exactly 1 leg; legYielded==0.
- PART 7 (TRUST-GATE, trust low): **NO leg, legYielded==1** — and the
  take-discipline STILL refuses (discipline ≠ leg). The v1 shape proven,
  not asserted.
- PART 8 (EXPOSURE): 3 direct leg calls, tile identical before/after, zero
  travelTo, 3 legs counted.
- **PART B (REAL RED, live engine):** the diagnostic probe's own reproducing
  substrate (belongseek seed 33, 45d). OLD ungated shape (rebuilt inline
  from the .bak record): cistern hits **0L**, **4 villager thirst deaths**
  via the real `registerDeath` pipeline (d20, d30×2, d32 — the diagnostic's
  exact collapse). NEW trust-gated shape: cistern min **28L**, **0** villager
  thirst deaths. Scholar thirst 0/0 both sides (cistern-draw competition
  stays ruled out). The #300 mechanism, gated, on the real water economy —
  honest, not simulated.
- PART C (det-gate): **32/32 byte-identical** (8 seeds × 2 policies ×
  2 sides, 30d).
- SMOKE=1: instrument-honesty green in proof AND sweep (unwrap + live marker
  + policy.daily ≥10×/run + pacing >0).

## Sweep results

32 runs: 8 seeds (11/22/33/44/55/66/77/88) × {belongseek, leadcourt} ×
{control, armed}, 180d death-aware, identical seeds both sides, own control
in the same sweep. Measured on base `e4160f0f` (master moved to `d9711e60`
— loop A sim-succgrace + sim-holdvillage — during the run; tree rebased
after, proof re-run). Per-seed rows: `evidence/2026-10-15/perseed-thirstbank2/`;
beats: `evidence/2026-10-15/thirstbank2-beats/`; raw log:
`evidence/2026-10-15/thirstbank2-sweep.log`.

### Per-policy

| metric | belongseek armed/ctl | bar | verdict |
|---|---|---|---|
| CO-PRIMARY h1200 | 171/223 = **0.767** | ≤ 0.750 | **MISS** |
| PRIMARY villager thirst | 0 | ≤ 2 | GO |
| median survival | 180 vs 155 | ≥ 145 | GO |
| national | 3/8 vs 4/8 | ≥ 2 | GO |
| starveDeaths | 8 vs 8 | ≤ ctl+2 | GO |

| metric | leadcourt armed/ctl | bar | verdict |
|---|---|---|---|
| CO-PRIMARY h1200 | 151/206 = **0.733** | ≤ 0.750 | **GO** |
| PRIMARY villager thirst | 0 | ≤ 2 | GO |
| median survival | 145 vs 146 | ≥ 136 | GO |
| national | 6/8 vs 4/8 | ≥ 2 | GO |
| starveDeaths | 13 vs 8 | ≤ ctl+2 (10) | **MISS** |

### Pooled verdict (pre-registered form, per lineage precedent)

| metric | armed / control | ratio | bar | verdict |
|---|---|---|---|---|
| **PRIMARY villager thirst** | 0 / 0 | — | ≤ 2 | **GO** |
| **CO-PRIMARY h1200** | 322 / 429 | **0.751** | ≤ 0.750 | **MISS** |
| median survival | 147 / 146 | — | ≥ 136 | **GO** |
| national | 9/16 / 8/16 | — | ≥ 6 | **GO** |
| starveDeaths (all-form) | 21 / 16 | — | ≤ 18 | **MISS** |
| new death mode (n≥3) | none | — | none | **GO** |

**OVERALL: NO-GO at pilot.** The co-primary misses on the letter (0.751 >
0.750 — one hunger-day over the bar) and the starveDeaths guardrail misses
on the measured all-form (21 > 18). Per §14 neither is re-scored.
**Arm killed per protocol** (layer deleted; proof 98/98 + det-gate 32/32 +
SMOKE + sweep + evidence retained with INFO-SKIP guards).

**Byte-identical rebuild confirmed:** the sweep reproduced the killed
sim-thirstbank run's numbers EXACTLY (h1200 322/429 pooled, 171/223
belongseek, 151/206 leadcourt; belongseek-armed-s55: 182d, hatch=29,
legs=158/yield=12 — identical down to the counters). The rebuild from the
record is behavior-identical to the deleted layer.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read belongseek-armed-s33 (the siege run: yield=34, legs=8, village-lost
d44, 0 thirst deaths) d1–21 and belongseek-armed-s55 (thriving: 182d,
hatch=29) d19.
- The water duty economy WORKS under the yield: Olga hauls 10–18L daily,
  the cistern fills ("only holds 0L more"), the hearth boils 30–36L when
  wood allows. The honest tension is voiced: "The cistern holds 20L of
  creek water and no wood to boil it. Someone's drinking dirty tonight."
  (d14) — the wood lockout the diagnostic named, but the village keeps
  hauling and the cistern never hits 0. "The cistern is dry. Haul from a
  creek (risky water), or put someone on water duty." (d16/d19) — the
  warning fires, the village answers. The yield reads as people managing
  their own water under siege, not automation.
- The hatch: 6 breaks on d19 (150 kcal each as the pantry thins — honest
  amounts), "The discipline breaks — hunger wins… the ledger will
  remember." The verbatim repeat (6× one day, 29× the run) is the known
  template-repetition class (already filed: raid/pantry-check beats) —
  not a new finding.
- No dehydration/thirst death beats in any armed run (16/16 checked).
  **PASS.**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max | exiled |
|---|---|---|---|---|---|---|---|---|
| control | 8/16 | 1/16 | 0/16 | 4 | 0 | 146d | 182d | 0 |
| armed | 9/16 | 0/16 | 0/16 | 5 | 0 | 147d | 182d | 0 |

The scale wall stands — 0 wins either side in 32 runs; table 1/16 control
only. The arm moves hunger/trust, not the wall. Wave-4 reach: control 4,
armed 5 (within noise).

## Death-cause shares

Control (164 deaths): combat 72, villager combat 22, monster 18, starvation
16, "a wound that wouldn't close" 14, sickness 10, contest 7, Nevermore 2,
lockjaw 2, expedition 1, thirst 0.
Armed (201): combat 106, starvation 21, monster 20, villager combat 19,
sickness 18, contest 7, "a wound that wouldn't close" 8, expedition 1,
Ugly-Eyes 1, thirst 0. Scholar-side thirst: 0 vs 0. No new death mode
(n≥3 armed-only; Ugly-Eyes is n=1).

The armed combat-death rise (106 vs 72) is NOT an exposure price — the leg
added zero wild visits by construction (the thirstbank exposure verdict
stands) — it rides combat-heavy trajectories on paired seeds (SEED-88-CLASS
NOISE #103/#111), while scholar deaths fall. The starvation rise (21 vs 16)
is the same regime effect the h1200 miss names: on easy seeds the always-on
discipline lowers the eating equilibrium.

## Village assessment (plain words)

Thirty-two villages lived twice — once with the scholar's discipline and
the trust-gated banking leg, once without — and the two lives came out
byte-identical to the killed thirstbank run, which is the point: the
rebuild is faithful, and the verdict is the same. The villages trusted
more where the discipline ran, the cistern kept flowing through the
sieges (the leg yielded 8–34 times on the hard seeds and the water duty
kept hauling), and nobody died of thirst on either side. But the scholars
went hungry more days, not fewer, on the pooled count (322 vs 429 = 0.751
— one hunger-day over the 0.75 bar), and starvation deaths ran 21 vs 16.
On easy seeds the always-on discipline starves a scholar who wasn't
starving; on hungry seeds it helps (s55: 24 vs 99). The hunger win the
thirstsafe pilot saw (0.617) was regime luck; the confirm (1.000), the
thirstbank re-measurement (0.751), and this re-measurement (0.751,
byte-identical) agree. The shape is thirst-safe, trust-positive, and
exposure-free — and it is not a hunger lever. The axis's next hunger work
needs the pantry-gated discipline or a harm-anchored metric, per #299.

## Blanks filled / documented

- **#300 — named next ANSWERED, arm killed.** The v1 thirst-safe shape
  (take-discipline + trust-gated low-exposure leg) re-measured with the
  regime-aware 0.75 hunger bar: co-primary MISS on the letter (0.751),
  starveDeaths guardrail MISS on the measured all-form (21 vs 16 > 18).
  The rebuild is proven behavior-identical (byte-identical sweep to the
  killed thirstbank run). The shape stays dead; the mechanism record
  (trust-gated leg prevents the #300 collapse — PART B REAL RED: old 4
  thirst deaths, new 0) stands for future water/siege levers.
- **#286 — reconfirmed by absence (third time).** 0 villager thirst deaths
  on 16 armed runs AND 0 on 16 controls. The collapse needs the ungated
  shape; the phenomenon is absent otherwise.
- **DOCUMENTED (method): telemetry-check LOUD was a denominator artifact.**
  The 32-file glob (16 control + 16 armed + summary.json) counted 17
  nationals against a 16-run baseline of 8. Control-only re-run: quiet
  (16 files, 4 metrics, no deviations); control nationals 8/16 = baseline
  8 exactly. Lesson: pass per-side globs to telemetry-check, never the
  mixed sweep dir.

## Metric review (§14)

1. **PRIMARY (villager thirst armed ≤ 2/16): GO — 0/0.** The guardrail
   holds; the phenomenon is absent on both sides this run.
2. **CO-PRIMARY (h1200 armed ≤ 0.75× control): MISS — 322/429 = 0.751.**
   One hunger-day over the bar (429×0.75 = 321.75; armed = 322). Pooled
   is the verdict form per lineage precedent; per-policy split
   (belongseek 0.767 MISS, leadcourt 0.733 GO) confirms it's not a
   single-road artifact. **NO-GO per §14.** The 0.75 bar was #299's named
   regime-aware bar; the shape misses it by the smallest possible margin
   on a metric that reproduced byte-identical — the hunger effect is
   regime-dependent, not a lever.
3. **GUARDRAIL starveDeaths (≤ control+2): MISS on the measured form —
   21 vs 16 (bar 18).** INSTRUMENT LIMITATION (owned): the pre-registered
   bar says "scholar starveDeaths" but the sweep's cause-counter measures
   ALL starvation deaths (villager + scholar); the sweep did not record
   the d.player×cause split needed for the scholar form. The all-form
   miss (+5, concentrated leadcourt: 13 vs 8) is real and reported as a
   miss; the scholar-form is unmeasured. Next run: record the split.
4. **GUARDRAILS median/national/new-mode: GO.** Median 147 ≥ 136;
   national 9/16 ≥ 6/16; no armed-only death mode ≥3.
5. **Answerability:** control h1200 = 429 ≥ 8 → the ratio is real, not
   noise-powered. Verdict stands.
6. **Metric for the NEXT run:** the h1200 count is run-length-confounded
   (armed s11: 17 vs 12 while surviving 182d vs 28d) and regime-dependent.
   A future hunger lever should pre-register a harm-anchored metric
   (starvation deaths, scholar-attributed) or a days-normalized hunger
   rate — and gate the discipline on pantry stress rather than running it
   unconditionally.

## Convergence state

food-economy: **killed-at-pilot** (sim-thirstbank2). The v1 thirst-safe
banking shape fails its pre-registered bars on current master for the
second time (h1200 0.751 vs 0.750, byte-identical to the killed
sim-thirstbank run; starveDeaths 21 vs 16). The hunger win is
regime-dependent (helps on hungry seeds, hurts on easy seeds); the
take-discipline + low-exposure banking shape is NOT a hunger lever. What
stands: the trust-gated leg's thirst safety (PART B REAL RED: old shape
4 thirst deaths, new shape 0 — the #300 mechanism, gated on the live
engine), the zero exposure price, the trust win (1.42× twice). The axis's
next hunger work: pantry-gated discipline or a harm-anchored metric
(#299's named next, refined).
