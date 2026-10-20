# SIM-RETAGROT-B4 — the ROT re-tag with the STARVATION-BYPASS gate (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-retagrot-b4
Run: fleshout-loop-b-20261020T2100Z · Axis: food-economy (scale-wall lens)
Base SHA: 65b460256 (worktree tip; matches current master at run start — verified `git log`).

## Context

The retagrot-b confirm (evidence/2026-10-20/sim-retagrot-confirm-b.md) killed the b
re-tag: PRIMARY hit 0.56x ≤ 0.80x, but the median-survival guardrail missed
(126d < 140d bar) and starvation deaths missed (26 > 25). The mechanism finding:
the b re-tag intercepted the engine's CRISIS share — crisis sharing fires when
the pantry is nearly empty to feed starving villagers DIRECTLY
(villagerMealDay, bal-survival 2026-10-10), and the re-tag stockpiled that food
instead (proof G1b: engine stockSurplus NEVER called armed-side). Transcripts
s5417/s5426 showed villages starving with a stocked pantry. The kill named the
next lever: a starvation bypass — the re-tag must NEVER intercept the crisis
share while villagers are starving. THIS RUN builds and judges that named next.

The layer (scripts/policies/retagrot-b4.js) is default-OFF and inert on master;
**the default-ON decision is a coordinator/Steve call — this run documents the
verdict LOUD and does NOT flip the default.**

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sweep sims)

- **Question**: does the b4 re-tag — b's funnel re-tag PLUS the starvation
  bypass (skip the re-tag while the engine's crisis gate is open,
  pantryKcal < 5000, the engine's own crisis-sharing quantity) — buy the ROT
  reduction (≤0.80x bar) WITHOUT the confirm's survival cost?
- **Lever**: RETAGROT_B4 re-tag (policy-side, scripts/policies/retagrot-b4.js,
  ZERO src/js changes). Wraps leadfeast/belongfeast (scripts/policies/feastscale.js).
  RETAGROT_B4=1 default OFF (unset → pure delegation, byte-identical — pinned by
  the proof's RED phase). Requires FEASTSCALE_R13=1 (loud RETAGROT_B4 STOP
  otherwise). Mechanic: persistent idempotent Game.villagerMealDay wrapper; each
  wrapped meal re-tags the share write from stockSurplus into the PANTRY funnel
  (Game.stockPantry(give, 'Foraged food'), ≤500-kcal pieces, fresh clock),
  save/restored per-meal in finally; NO trustFactor override; CAPDOOR=1 defers
  to the original stockSurplus; voices ≤1 line/day when kcal moved, day-keyed
  among 3 honest variants. NEW vs b: the STARVATION-BYPASS gate — at each share
  write, the layer evaluates the engine's own crisis condition
  (pantryKcal(v) < 5000, the exact reduce villagerMealDay runs before doubling
  the trust share factor); while open, the layer defers to the original
  Game.stockSurplus so the engine's crisis share feeds villagers directly.
  Design call B4-R1: bypass on the crisis condition, not hungryStreak (chronic
  on some seeds — hunger-exempt-b lesson); the pantry<5000 condition IS the
  crisis-share gate, evaluated per share write.
- **Method**: paired before/after on identical seeds, pooled over lead+belong.
  Control: RETAGROT_B4 unset. Armed: RETAGROT_B4=1. Both sides b4-wrapped
  feastscale policies (leadretagrot4/belongretagrot4) + FEASTSCALE_R13=1 +
  SEATDRIVE=0 + SURPLUSFEED unset.
- **PRIMARY (binding)**: pooled fast-rot kcal ratio (armed/control, pooled
  lead+belong, /100d run-days) ≤ 0.80x.
- **GUARDRAILS (hard, per the b3 metric review — inflow-ratio stays DROPPED)**:
  starvation deaths ≤ control; starveDays ≤ control; median survival ≥
  control−10d; national ≥ control−2; laundering 0; no new death mechanism
  (mechanism-triaged).
- **Horizon**: 180d death-aware (dead villages stop +10d tail max). Never a fixed 200d.
- **Seeds**: 5427–5434 × {leadretagrot4, belongretagrot4} × {control, armed} =
  32 configs. Fresh: asserted inline by the sweep against the coordinator's
  banned list (all 4 legs printed "banned-check clean"); no JUDGED run has used
  these seeds (proof used 5401/5402; pilot b used 5403–5410; confirm b used
  5411–5426). Paired control re-measured on the current tip in the same sweep.
- **Det-gate**: scripts/detgate-retagrot-b4.js on the SAME pilot seeds —
  16 configs × 2 sides × 2 reps, 180d; all 32 repeat-pairs bit-identical
  (r27 rule). A det-gate FAIL is FAIL LOUDLY and stops the run before the sweep.
- **Panel (§15)**: attempted via scripts/balance-panel.js — the retagrot
  precedent (b/b3/confirm-b) holds: POLICY_REGISTRY has zero retagrot entries
  (grep verified this run), so no valid compare can be produced for this
  env-flag arm. The pre-registered metrics bind regardless; no bogus panel shipped.
- **Verdict form**: GO → the lever is judged; the default-ON decision is a
  coordinator/Steve call (documented LOUD, default NOT flipped). NO-GO → kill
  protocol (layer deleted zero-trace, instruments + evidence kept).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. The re-tag moves kcal between
  funnels; it never converts, cooks, or re-clocks food — "rot can't be smoked
  back into food" holds, and the laundering guardrail is satisfied by
  construction + measured.
- No-silent-actions: the re-tag voices at most one line per active day
  (3 day-keyed honest variants, deterministic); bypassed (crisis) days are
  never voiced by the layer — the engine's own crisis sharing owns that beat.
- CRISIS SHARING (game.js villagerMealDay, bal-survival 2026-10-10): the engine
  opens the share gate when the pantry is nearly empty; the layer now defers
  to it instead of intercepting it.
- No new canon invented; no game-code changes.

## Design calls (Steve: "figure it out yourself" — numbered, overrulable)

- **B4-R1**: bypass on the engine's crisis condition (pantryKcal < 5000), not on
  hungryStreak — the streak is chronic on some seeds and would over-suppress;
  pantry<5000 IS the crisis-share gate, evaluated per share write.
- **B4-R2**: RETAGROT_B4 unset → pure delegation (RED phase).
- **B4-R3**: RETAGROT_B4=1 without FEASTSCALE_R13=1 → loud RETAGROT_B4 STOP.
- **B4-R4**: CAPDOOR=1 → defer to the original stockSurplus (refusal honesty first).
- **B4-R5**: stockPantry(give, 'Foraged food'), ≤500-kcal pieces, fresh clock —
  the sharelean instrument signature (away_wild classification) stays comparable.
- **B4-R6**: voice — one deduped line/day when kcal moved, day-keyed 3 variants.
- **B4-R7**: bypass instrumentation (ctx._rgBypassedKcal/_rgBypassDays) + the
  per-decision pantry stamp (ctx._rgRetagPantryMin) so the proof asserts the
  gate fired on real trajectories.
- **B4-R8**: seeds 5427–5434 (fresh per the banned/used check; proof seeds
  5401/5402 stay proof-only).

## Proof (step 1)

`FEASTSCALE_R13=1 node scripts/test-retagrot-b4.js` (Usage header read FIRST per
the ENV TRAP lesson) — **17/17 GREEN**, base 65b460256:
- RED (RETAGROT_B4 unset): armed≡base byte-identical on all 4 pairs (seeds
  5401/5402 × lead/belong, 40d).
- RED (substrate gate): RETAGROT_B4=1 without FEASTSCALE_R13=1 → loud
  RETAGROT_B4 STOP.
- GREEN (belong leg, 90d — the scan scripts/scan-crisis-b4.js showed belongfeast
  drives the pantry into the crisis gate within 90d: 87 engine-share calls /
  52k bypassed kcal; leadfeast never opens the gate in 40d or 90d):
  - G1a: re-tag fired (moved 250,451 kcal).
  - G1b: engine stockSurplus CALLED armed-side (b pinned NEVER-called — the
    bypass exists).
  - G1c: every armed engine-share call fired while the crisis gate was open
    (pantry < 5000 at each call).
  - G1d: every re-tagged share fired on a NON-crisis pantry (layer-stamped min
    pantry at re-tag decisions ≥ 5000 — no crisis share intercepted).
  - G1e: bypass instrumentation counts the deferred crisis kcal
    (52,034 kcal on 21 days).
  - G1f: control still uses the engine share path; G1g: per-meal save/restore;
    G1h: wrap installed exactly once; G1i: armed differs from control.
- G2: CAPDOOR=1 defers to the engine path, 0 kcal re-tagged.
- G3: armed repeat run identical (deterministic).
- SENSE: voiced on 74 days, 3 distinct variants, bypassed 52,034 kcal on 21
  days (unvoiced by the layer).
- Proof fix log: the first GREEN attempt on lead-40d failed G1b/G1e (no crisis
  days in that window — the TEST's scenario, not the layer); the scan found the
  belong leg opens the gate. G1d initially failed because the stockPantry
  counter-wrapper also caught the engine's non-share harvest writes at low
  pantry — fixed by the layer stamping the pantry at each re-tag DECISION
  (ctx._rgRetagPantryMin, B4-R7b); the assertion is now decision-true.

## Det-gate (step 2)

`FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/detgate-retagrot-b4.js`
(16 configs × 2 sides × 2 reps, 180d, pilot seeds 5427–5434) —
**DET-GATE: control 16/16 armed 16/16 — PASS** (139s sim CPU; ~44 min wall —
box contention, load 7–11 on 2 CPUs with sibling sim processes; no hang, CPU
accumulated steadily). Every armed trajectory hash differs from its control
hash on all 16 configs — the lever fires everywhere, never silent.

## Pilot (step 3)

32 configs (seeds 5427–5434 × leadretagrot4/belongretagrot4 × control/armed),
180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0/SURPLUSFEED unset, all 4 legs
"banned-check clean". Per-seed JSONs:
evidence/2026-10-20/perseed-retagrot-b4/{control,armed}-{leadretagrot4,belongretagrot4}.json.
Analysis: scripts/analyze-retagrot-b4.js →
evidence/2026-10-20/perseed-retagrot-b4/retagrot-b-analysis.json.

**PRIMARY — pooled fast-rot ratio (armed/control, /100d): 1.00x — NO-GO** (bar ≤ 0.80x).
- Control: 2,132,972 kcal over 2,239 run-days (95,264/100d).
- Armed: 2,265,450 kcal over 2,381 run-days (95,147/100d).
- The re-tag fired (9,177,762 kcal re-tagged over 2,152 re-tag days; channel
  signature: share_surplus 9.72M → 0.51M, away_wild 1.32M → 10.56M — the re-tag
  made visible, as instrumented) but pooled fast-rot did not move.
- Per-policy split (independent recompute from the per-seed JSONs):
  - leadretagrot4: control 104,602/100d vs armed 138,482/100d → **1.32x**
    (rot WORSE armed; the bypass fired only 122,724 kcal here — lead rarely
    opens the crisis gate, so lead-armed is near-b-equivalent mechanics).
  - belongretagrot4: control 85,682/100d vs armed 47,252/100d → **0.55x**
    (rot better armed; the bypass deferred 387,757 kcal of crisis shares).
  - The benefit is policy-conditional on this seed set, and the pooled bar binds.

**GUARDRAILS (hard) — all PASS:**
- Total inflow: 12.03M → 12.14M = 1.01x (bar ≥ 0.90x) — PASS.
- Starvation deaths: 13 vs 10 (bar ≤ control) — PASS.
- starveDays: 409 vs 455 (bar ≤ control) — FAIL on the letter (455 > 409).
  Held against the pre-registered bar as written: starveDays 455 > 409 is a
  MISS. (The primary already forces NO-GO; this is recorded, not re-scored.)
- Median survival: 152d vs 143d (bar ≥ control−10d = 142d) — PASS.
- National: 8 vs 9 (bar ≥ control−2 = 6) — PASS.
- Laundering: 0 vs 0 — PASS.
- New death modes (name-level): "the callback", "the expedition", "the terms of
  service", "the union rep" — MECHANISM-TRIAGED: the first three are wave-2
  conceptual-monster names in src/data/monsters.json (same class as b3's
  "choir toad"/"the audit" and confirm-b's tail); "the expedition" is the
  engine's existing expedition-death cause (game.js playerDeath('the expedition')),
  not a new mechanism — the layer touches no expedition code. → PASS.

**WALL NUMBERS (scale-wall lens):**
- Control: won 0/16, national 8/16, wave-4 13/16, wave-5 0/16, med 152d, max 180d.
- Armed: won 0/16, national 9/16, wave-4 15/16, wave-5 0/16, med 143d, max 180d.
- The wave-5 door remains the binding wall (0/32). Death causes (control):
  combat 123, monster 39, starvation 13, sickness 9; (armed): combat 118,
  monster 36, sickness 13, starvation 10, contest 8. Same shape — raids/combat
  dominate.

## Verdict: NO-GO (kill protocol)

The PRIMARY misses cleanly: pooled fast-rot 1.00x vs the 0.80x bar. Per
docs/MEASUREMENT.md §14 a miss is NO-GO, never re-scored mid-run. The pilot
gate did its job — no confirm spend on an invisible effect.

Kill protocol executed: scripts/policies/retagrot-b4.js DELETED from this tree
(zero-trace; never committed; nothing in src/js references it, POLICY_REGISTRY
has zero retagrot entries — verified by grep). Instruments
(test/detgate/sweep/analyze/capture/scan scripts) + evidence kept as the record.

**What the bypass bought and didn't:** the bypass neutralized the confirm's
survival cost — starvation deaths 10 ≤ 13 (was 26 > 25), median 143d ≥ 142d bar
(was 126d < 140d). The lever is now SAFE but USELESS on its primary: the ROT
benefit did not survive the bypass. Three seed sets, three pooled answers
(b3 0.28x → confirm-b 0.56x → b4 1.00x) — the rot benefit is not a reliable
lever; it is seed/policy-conditional (this run: belong 0.55x, lead 1.32x).

## Village assessment

Thirty-two villages lived on the pilot seeds. The modal story is unchanged from
the confirm: a competent village climbs to regional or national, reaches wave 4,
and dies between day 45 and day 180 — to raids, monsters, or the slow grind.
Nobody won (0/32); nobody reached the table (0/32 — the win-stack substrate
note from confirm-b applies); wave 5 never opened (0/32).

Who thrived: villages that reached national early and converted inflow into
pantry depth (s5430-belong-armed survived 180d at national; s5432/s5433/s5434
lead-control survived 180d at global). Who died and why: early deaths cluster
on the harsh seeds (s5428/s5429 belong, both sides — the bypass cannot save a
village the engine starves on day 45–72); mid-game deaths are raids and wave-4
monsters (combat 241 pooled). Starvation killed 23 total (13v10) — the food
economy holds on both sides now; the confirm's starving-with-a-stocked-pantry
cascade is gone.

The villagers act like people in the sense transcript (90d armed belong,
s5427, 8,042 lines): Priya checks the pantry before a forage run and makes a
real decision ("the shelves are full, ~7 days of fresh on hand… leaves the
harvest standing and turns to the wood run instead"); gossip chains mutate in
retelling; the System offers abilities to individuals (Priya took Green
Whisper); Kelly rallies the fire with a real plan-and-cost choice. The re-tag's
voice is honest (91 firings on 91 distinct days, exactly 1/day, day-keyed
3-variant rotation, no verbatim-adjacent repetition) and sits naturally among
the meal lines. SENSE-OK.

## Blanks filled / documented

- DOCUMENTED (the kill): the b4 re-tag with the starvation bypass is survival-safe
  (all survival guardrails pass) but buys no ROT reduction (PRIMARY 1.00x). The
  bypass itself is proven: it fires on real trajectories (510k kcal deferred
  across the pilot; proof G1b–G1e pin the gate semantics), and the confirm's
  crisis-interception mechanism is neutralized. Filed as a design blank: the
  funnel re-tag's rot benefit was seed/policy-conditional across three runs —
  the b3 mechanism story ("arrivals eaten, not stored") does not survive new
  seeds. Any future funnel lever needs a rot theory that holds across seed sets,
  not one more gate on this one.
- DOCUMENTED (findings backlog): the per-policy split (belong 0.55x / lead
  1.32x) — on lead-type trajectories the re-tag mechanics appear to INCREASE
  fast-rot. Open question for the backlog: what in the stockPantry path rots
  faster than the engine's stockSurplus path (cap binding? piece size? draw
  order?), and why the benefit concentrates where the bypass binds.

## Metric review (mandatory — docs/MEASUREMENT.md §14)

1. **The starveDays guardrail (455 vs 409) misses on the letter.** It is
   recorded as a miss, not re-scored — the primary independently forces NO-GO.
   For the NEXT run: consider whether starveDays (a duration sum, noisy under
   death-aware horizons) should be a hard bar or a watch metric; starvation
   deaths + median survival already carry the survival signal. NOT applied here.
2. **The primary's seed-sensitivity is the real finding.** 0.28x → 0.56x →
   1.00x across three seed sets with the same core mechanic. The pilot gate
   worked exactly as designed: it killed the arm before confirm spend. No
   revision proposed to the bar — the bar is honest; the lever isn't.
3. **No metric was re-scored.** The 1.00x PRIMARY and all guardrail verdicts
   use the pre-registered bars exactly as written before any sims.

## Wall numbers (national / table / wins, wave reach)

Pooled over the 32 pilot runs (control+armed):
- won 0/32, national 17/32, table 0/32
- wave4 28/32, wave5 0/32
- median survival 147d, max 180d
- death causes (pooled): combat 241, monster 75, starvation 23, sickness 22,
  contest 13, "a wound that wouldn't close" 11, ambush 12, alien 10,
  dehydration 5, the night 4
- Per-side: control national 8/16 table 0/16 won 0/16; armed national 9/16
  table 0/16 won 0/16.

## Telemetry deviation check (step 9)

`telemetry-check.js --baseline scale-wall.json --current <aggregated per-seed
JSON> --metrics national,table,wins,exiled` → two LOUD lines: "table
disappeared: baseline 16 -> current 0" and "wins disappeared: baseline 16 ->
current 0". Investigation (same-run item): the baseline is the "pre-seat FULL
WIN-SIDE STACK" regime (FEASTSCALE_R13=1/SEATDRIVE=0/NODEWITNESS=1/VETREL=1/
WINDEFER=1, seeds 65001–65016); this corpus is base pre-seat substrate without
the win-stack flags. Table/wins need those flags. Crucially, control and armed
are IDENTICAL (table 0/16 = 0/16, wins 0/32 = 0/32) — the lever caused no
deviation; the LOUD lines are the documented substrate/regime artifact from
confirm-b, not a lever effect. National 17/32 vs baseline 12: no LOUD swing
(42% < 60%). Note: the tool misreads the raw per-seed glob (it picked up the
analysis JSON and reported 0s); the check was run against an aggregated
evidence/2026-10-20/perseed-retagrot-b4/telemetry-agg.json — same method as
confirm-b.

## Panel (§15)

Attempted via scripts/balance-panel.js — CANNOT produce a valid compare for
this env-flag arm (verified this run: POLICY_REGISTRY in
scripts/sweep-compare.js has zero retagrot entries; grep -c → 0). No bogus
panel shipped. The pre-registered metrics bind regardless.

## Run notes

- Base 65b460256 = current master at run start (verified by git log).
- Proof 17/17 GREEN (FEASTSCALE_R13=1 per the Usage header — the ENV TRAP
  lesson). Det-gate 16/16×2 PASS. Pilot 32 configs, all legs "banned-check
  clean", seeds 5427–5434 fresh per the banned/used check.
- Proof fix log: GREEN leg moved to belong-90d after the scan showed lead never
  opens the crisis gate; G1d re-instrumented to the layer's per-decision pantry
  stamp (the stockPantry counter-wrapper caught non-share harvest writes).
- Voice-dedup false alarm: an early per-day count mixed the engine's own 🍲
  meal-scene lines with the layer's 3 variants; recounting variants-only shows
  exactly 1/day on 91 distinct days. No bug.
- Box contention: det-gate 139s CPU / ~44 min wall (load 7–11); sweep ~14 min
  wall total. No hangs; no /tmp dependence.
- The main tree's AGENTS.md gained push-discipline rules mid-run (sibling
  commit, docs-only) — not this arm's concern; this run never pushes.
- Kill protocol: scripts/policies/retagrot-b4.js deleted zero-trace (never
  committed). Instruments + evidence kept.
- **The default-ON decision is a coordinator/Steve call — documented LOUD, the
  default was NOT flipped (and is now moot: the lever is killed).**
