# SIM-SMOKE-SIBLINGS — batch-cook rot-laundering sibling (ARM 1, food economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-smokesib-b
Run id: 2026-10-14T08-29-38Z · Axis: food economy (scale-wall lens)
Claims: sim-findings item #82 (spoilsmoke siblings: tribute payments, direct cooking calls)

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Primary metric:** laundered kcal at convert time — kcal of already-spoiled
  stacks converted by the G.cookAll batch pipeline's meat path (measured via
  temporary SMOKESIB-MEASURE instrumentation inside the pipeline, reverted
  before commit; sim-findings #100: post-hoc checks produce false positives).
- **GO:** mechanism RED-verified (pristine launders, fixed does not — crafted
  proof test) AND the 8-seed pilot's after-side launders 0 kcal.
- **Guardrails:** national(after) ≥ national(before) − 2 per policy; median
  survival report-only with A/A calibration; fresh-rot proxy per-vd
  ≤ control × 1.335 (r25b calibration). Miss on national = KILL.
- **Horizon:** 150d death-aware (+10d tail max) — dead villages stop early.
- **Seeds:** 11/22/33/44/55/66/77/88 · **Policies:** leadcourt, belongseek
  (the scale-courting pair from the dinreserve baseline).
- **Canon:** docs/PRESERVATION.md — "Rot can't be smoked back into food.
  Spoiled meat is discarded honestly."

## The blank (from sim-spoilsmoke.md's documented follow-up)

sim-spoilsmoke fixed the duty-time cook drive's eligible loop (game.js) — its
convert() rewrote spoilDay for already-spoiled stacks. The sibling audit
(sim-findings #82) covered every convert()/preserve/cook entry point in src/js:

GUARDED (no action needed): duty drive (landed fix); preserveFood dropRotten;
renderFat !isSpoiled filter; makePemmican/pemmicanPlan/pemmicanSets
isSpoiled filters; cleanCarcass dropRotten; G.cookFood per-item guard
(2026-10-08); askSpecialist any-task guard (2026-10-08); tribute arrival
(fresh spoil-dated grain, hierarchy.js); tribute payment (removes
freshest-first, no preservation); stockPantry/granary (additive only);
corpses loot (honest clocks); the plant batch-cook branch (never rewrites
spoilDay).

UNGUARDED (this arm): the G.cookAll batch wrapper's meat pipeline (food.js):
`if (item.foodKind === 'meat' && (item.foodState === 'cleaned' ||
item.undercooked))` — no spoiled check before
`item.foodState = 'cooked'; item.safe = true; item.spoilDay = day + 5`.

## The change (one-line class)

Before the pipeline's conversion loop, discard spoiled items it would
convert — same voice as the per-item guard above (cookFood, 2026-10-08):

```js
// SPOILAGE (smoke-siblings 2026-10-14): the batch path cooked spoiled
// cleaned meat back into 'safe' cooked food (spoilDay = day+5) — the same
// laundering class as the duty drive's. Rot can't be cooked back into food.
// Same voice as the per-item guard above; bonus-aware boundary like every
// other player-side guard (cookFood, preserveFood, askSpecialist).
for (let ri = inv.length - 1; ri >= 0; ri--) {
  const rit = inv[ri];
  if (rit && rit.foodKind === 'meat' && (rit.foodState === 'cleaned' || rit.undercooked)
      && this.isSpoiled(rit)) {
    this.say(`The ${rit.name} went bad — cooking won't save it. You leave it for the flies.`);
    inv.splice(ri, 1);
  }
}
```

**Design call (Steve 2026-10-07: make the call, document it, he can overrule):**
the bonus-aware isSpoiled (not the raw duty-loop boundary). Every other
player-side cook/preserve guard (cookFood, preserveFood, askSpecialist,
cleanCarcass) uses the bonus-aware boundary — the player's
preservation_instinct honestly extends edibility, and cooking what they'd
eat is coherent. The duty loop's raw boundary belongs to its own 0..2-day
convention. Discard (not skip) — consistent with the per-item guard's
"leave it for the flies" behavior for the same input.

## Proof (REAL red/green)

`scripts/test-smokesib-20261014.js` — full src/js harness, seeded RNG, no
Game.save stub; nearFire stubbed true only to reach the fire-gated batch
path in headless node.

| | pristine (RED) | fixed (GREEN) |
|---|---|---|
| Phase A spoiled cleaned stack (sd=day−1) laundered | **1** (FAIL) | **0** (PASS) |
| Phase A stack discarded | no | yes ("cooking won't save it. You leave it for the flies.") |
| Phase A rot refusal said aloud | no | yes |
| Phase B about-to-rot (sd=day+1) batch-cooked | yes (spoilDay=day+5) | yes (spoilDay=day+5) |

The legit about-to-rot batch flow is untouched; only rot stops hitting the fire.

## Pilot results (150d death-aware, 8 seeds × leadcourt/belongseek)

Instrumented at convert time (SMOKESIB-MEASURE, reverted before commit).
Raw JSON: /tmp/smokesib-before.json, /tmp/smokesib-aa.json,
/tmp/smokesib-after.json. Sweep driver committed as
scripts/sweep-smokesib-20261014.js.

**Primary metric — GO:**

| side | laundered kcal | laundered stacks | cookAll calls |
|---|---|---|---|
| before | 0 | 0 | 0 |
| A/A (identical config) | 0 | 0 | 0 — byte-identical to before |
| after | **0** | **0** | 0 |

**Guardrails — all pass:**

| metric | before | after | identical? |
|---|---|---|---|
| national (leadcourt / belongseek) | 3 / 4 | 3 / 4 | yes (≥ baseline−2) |
| table | 1 / 0 | 1 / 0 | yes |
| wins | 0 / 0 | 0 / 0 | yes |
| wave4 / wave5 unlocks | 3,0 / 0,0 | 3,0 / 0,0 | yes |
| exiled | 0 / 1 | 0 / 1 | yes |
| median survival (leadcourt) | 82d | 82d | yes (report-only) |
| median survival (belongseek) | 129d | 129d | yes (report-only) |
| fresh-rot per-vd (leadcourt) | 3.17 | 3.17 | yes (≤ ×1.335) |
| fresh-rot per-vd (belongseek) | 3.21 | 3.21 | yes (≤ ×1.335) |

Verdict: **GO** — land the fix. The mechanism proof carries the verdict
(RED→GREEN on the exact conversion line); the pilot confirms zero in-sim
impact (the sim policies cook per-item, never via the batch button).

## Metric review

The primary metric's in-sim component measured 0 on the BEFORE side, not
the ≥1 a naïve reading of "before ≥ 1, after = 0" would expect. Per §14 I
am not re-scoring — reported exactly as measured. The mechanism proof
(crafted, RED on pristine) is where the laundering was reproduced; the
16-seed pilot is a no-regression confirmation. The honest reading: this
sibling is a UI-path bug (the "Cook (N raw)" batch button), not a
policy-path bug — the sims' competent policies never call cookAll
(measured cookAllCalls = 0 on all 32 instrumented runs), so the pilot can
only confirm no collateral change, which it does byte-identically
(medians 82d/129d both sides, A/A byte-identical).

Fresh-rot guardrail note: r25b's exact calibration methodology wasn't
recoverable from the tree, so the guardrail uses a stock proxy — spoiled
kcal sitting in pack + pantry at run end, divided by village-days survived.
Proxy is identical before/after (3.17/3.21 both sides), so no blowup under
any reading.

## Village assessment

The 16 pilot runs show the established scale-wall picture: most villages
die to wave-2 pressure (median 72–129d across policies); 3–4 per policy
reach national; one leadcourt trajectory touched the table; none win or
reach wave 5. The fix changed nothing in-sim (byte-identical trajectories)
— the batch button is a player action the policies don't take. In-fiction
nothing the player sees changes except that a batch cook with a spoiled
stack now says the same honest refusal the per-item cook already said.

SENSE check: the new line ("The Old deer (cleaned) went bad — cooking
won't save it. You leave it for the flies.") reads coherently alongside
the existing per-item refusal — same voice, same loss. No new dialogue
otherwise; no [needs-eyes] needed.

## Blanks filled / documented

- FILLED: the batch-cook spoiled-laundering sibling (sim-findings #82's
  remaining "direct cooking calls" item). One pre-pass in the G.cookAll
  batch meat pipeline + proof test + pilot.
- DOCUMENTED (not chased, per findings-backlog discipline): the sim
  policies never exercise the batch UI path — any future lever that tunes
  batch cooking can't be validated in-sim without a policy that presses the
  batch button. Appended to hidden_files/sim-findings.md.

## Convergence

food-economy axis: the spoilsmoke sibling class is closed — every
convert()/preserve/cook entry point in src/js now refuses spoiled food at
conversion time (audited above). The scale wall itself is unchanged by this
arm (national/table/wins byte-identical) — the wall work continues in the
sibling loop's lanes.
