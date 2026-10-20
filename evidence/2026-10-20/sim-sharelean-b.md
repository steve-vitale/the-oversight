# SIM-SHARELEAN-B — share_surplus lean valve pilot (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-sharelean-b
Axis: food-economy (scale-wall lens) — the named next lever of the sim-prodrebound-b
DIAG-GO (evidence/2026-10-20/sim-prodrebound-b.md): "share_surplus lean valve".
Base SHA: b050dcb26 (worktree tip at proof time).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sims)

- **Question**: the DIAG proved the autonomous share_surplus funnel is pro-cyclical
  (lean 0.46x fat, Pearson +0.555) — it collapses exactly when the pantry is lean,
  and no production channel answers a lean pantry except duty_fish (31.46x, the
  PRODTHROTTLE disengage leg). Does a policy-side lean valve — re-tagging the
  trust-hoarded share of autonomous surplus into the PANTRY funnel (stockPantry)
  on lean days — make the funnel answer lean the way duty_fish does, without
  touching the throttle or the fat-side sharing culture?
- **Lever**: SHARELEAN valve (policy-side, scripts/policies/sharelean.js, ZERO src/js
  changes). Wraps leadfeast/belongfeast (scripts/policies/feastscale.js).
  SHARELEAN=1 default OFF (unset → pure delegation, byte-identical — pinned by the
  proof's RED phase). Requires FEASTSCALE_R13=1 (loud SHARELEAN STOP otherwise).
  Mechanic: once per daily (dawn posture, mirroring inflowguard D3), if
  Game.pantryFreshDays() <= 4 (the PRODTHROTTLE threshold — prodThrottleEngaged()
  is literally `pantryFreshDays() > 4`), the valve arms for the coming village
  day. During that day's villagerMealDay loop the share gate opens fully
  (trust → full share: the engine's own CRISIS SHARING precedent — "the village
  pulls together when it has to" — made absolute at the throttle threshold) and
  the share write is re-tagged from stockSurplus into the PANTRY funnel
  (Game.stockPantry(give, 'Foraged food'), ≤500-kcal pieces, fresh clock). The
  villager's own meal (ownEat, pantry/pack draws) is untouched — nobody eats
  less. Fat days (> 4) keep trust-gated sharing: the fat-side culture is
  untouched, the throttle is untouched.
- **Method**: paired before/after on identical seeds, pooled over lead+belong.
  Control: SHARELEAN unset. Armed: SHARELEAN=1. Both sides leadsharelean/
  belongsharelean policies (sharelean wrapping feastscale's leadfeast/belongfeast)
  + FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset.
- **PRIMARY (binding)**: lean-day inflow ratio (armed/control on identical seeds,
  pooled lead+belong) >= 1.3x. Lean-day inflow = Σ per-day total pantry inflow
  over days whose DAWN pantryFreshDays ≤ 4 (the DIAG's lean definition).
- **GUARDRAILS (hard)**: fast-rot pooled/100d ≤ 1.15x control (the valve must not
  turn lean glut into fat rot); starvation deaths ≤ control; median survival ≥
  control−10d; national ≥ control−2; laundering 0; no new death mode.
- **Horizon**: 180d death-aware (dead villages stop +10d tail max).
- **Seeds**: 5201–5208 × leadsharelean/belongsharelean = 16 configs. Fresh:
  not on the coordinator's banned list and unused by any prior run (checked
  evidence/2026-10-20 + hidden_files: only kcal-amount false positives;
  inflowguard-b header's used list is 4901–4908; prodrebound-b used
  6810/6811/6813/6814/6815/6816/6817/6912). The sweep asserts the banned list
  inline and STOPS on any hit.
- **Det-gate**: 16/16 bit-identical repeat-pairs on BOTH sides (control×2,
  armed×2 per config) before trusting any number (r27 rule). Gate-off
  byte-identical (SHARELEAN unset ≡ base policy) pinned in the proof.
- **Panel (§15)**: attempt the balanced panel via scripts/balance-panel.js; NOTE
  the documented env-flag caveat (pantryguard-b2/inflowguard-b evidence): if an
  env-flag treatment cannot produce a valid panel compare, document it honestly
  and do NOT ship a bogus panel — the pre-registered metrics bind regardless.
- **Verdict form**: GO (pilot meets PRIMARY + guardrails → confirm 12–16 seeds) /
  NO-GO (kill fast at pilot — layer deleted zero-trace per kill protocol,
  instruments + evidence kept).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. The valve moves kcal between
  funnels; it never converts, cooks, or re-clocks food — "rot can't be smoked
  back into food" holds, and the laundering guardrail is satisfied by
  construction + measured.
- The lean threshold (≤ 4 fresh-days) IS the PRODTHROTTLE threshold by
  construction (game.js prodThrottleEngaged). The valve answers the same lean
  the throttle's disengage leg answers (duty_fish 31.46x) — one funnel's lean
  answer, not a second throttle.
- CRISIS SHARING (game.js villagerMealDay, bal-survival 2026-10-10): "when the
  pantry is nearly empty, people share more — hunger is a better motivator than
  trust. The village pulls together when it has to." The valve is that design
  made absolute at the throttle threshold, policy-side. No new canon invented.
- No-silent-actions: the valve voices one line per active lean day (deduped).

## Design calls (Steve: "figure it out yourself" — numbered, overrulable)

- **D1**: Lean evaluated ONCE per daily call (dawn posture for the coming village
  day — policy.daily runs just before Game.sleep() → endDay → villageEats).
  Per-meal evaluation would let the morning meals clear lean before the evening
  share (inflowguard D3 precedent).
- **D2**: SHARELEAN=1 without FEASTSCALE_R13=1 throws a loud SHARELEAN STOP —
  the arm can never silently run on the wrong substrate (inflowguard D2).
- **D3**: The valve opens the share gate via the engine's own trustFactor (trust
  100 → factor 1.0, the engine's defined "share everything" level), scoped to
  one villagerMealDay call, save/restored in finally. No engine locals
  replicated; the ledger (v.gives, giveHist), surplusFeedGovernor, and the
  remainder-carry honesty fixes all run their natural course. villagerMealDay
  performs no trust writes (verified by grep), so save/restore is exact.
- **D4**: The share write is re-tagged into the PANTRY funnel:
  Game.stockPantry(give, 'Foraged food') instead of stockSurplus — the DIAG's
  named shape. The patched stockSurplus returns the kcal actually stored
  (pantryKcal before/after diff) so the CAPDOOR ledger path stays honest.
  When CAPDOOR=1 the re-tag defers to the original stockSurplus (the landed
  cap-door's refusal honesty outranks the funnel tag; the full share still
  flows through the cap-door path).
- **D5**: stockPantry is not pantry-cap-bound (only stockSurplus/pantryAdd bind
  the cap — substrate fact). The valve fires only on lean days (pantry nearly
  empty), so the 120,000-kcal cap cannot bind; no cap logic added, noted here.
- **D6**: Voice: at most one line per armed day, only when the valve actually
  moved kcal — "no silent actions" without transcript spam.
- **D7**: Seeds 5201–5208 (fresh per the banned/used check above). Paired control
  re-measured on the current tip in the same sweep.

[RESULTS PENDING — layer + proof + det-gate + pilot sweep at time of pre-registration write]

## Proof results

scripts/test-sharelean-b.js — 15/15 checks passed (FEASTSCALE_R13=1, base b050dcb26),
run BEFORE any pilot sims:

RED (gate-off byte-identical, SHARELEAN unset):
- R-off: belongsharelean≡belongfeast and leadsharelean≡leadfeast on seeds 5201/5202,
  40d — trajectory rows + say-stream + death counts bit-identical (4/4).
- R-stop: SHARELEAN=1 without FEASTSCALE_R13=1 throws loud SHARELEAN STOP.

GREEN (SHARELEAN=1):
- G0: layerOn() true.
- G1a: 200k-stocked pantry (6–8 fresh-days) → 3/3 daily evals not lean, 0 arms.
- G1b: mid-run drain → valve arms on lean posture.
- SMOKE/G2a (honesty gate): valve is LIVE — 33,396 kcal re-tagged over 9 voiced
  valve-days on the drained 40d run (leadsharelean s5202).
- G2b: funnel re-tag complete — zero stockSurplus calls on armed lean days
  (per-day attribution; the 318 armed-side calls all fell on fat days, where the
  valve correctly does not engage).
- G2c: control still uses the share funnel (stockSurplus calls > 0).
- G2d: no leaked wraps post-run (vmd/sleep restored, arm flag clear).
- G2e: outer stockSurplus wrap intact (per-meal save/restore).
- G3: armed trust-drift == control trust-drift over a drained-pantry day —
  the per-meal trust patch leaves zero residue (natural engine writes identical
  on both sides).
- G4: armed run deterministic (repeat bit-identical).

SENSE: the valve's voice reads honest and human, deduped to one line per active
lean day: "🍲 The pantry shelves are thin (almost no fresh food left). The
village pulls together — today's surplus goes to the common store, not into
packs."

## Det-gate

(PENDING)

## Pilot results

(PENDING)

## Metric review (§14)

(PENDING — written after the pilot judges against the header above)

## Village assessment (plain words)

(PENDING)

## Sense-testing

(PENDING)

## Convergence state

(PENDING)
