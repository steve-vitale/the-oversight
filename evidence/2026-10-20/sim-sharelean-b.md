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

scripts/detgate-sharelean-b.js — 16/16 bit-identical repeat-pairs on BOTH sides
(seeds 5201–5208 × leadsharelean/belongsharelean × {control, armed} × 2 reps,
180d death-aware, no instruments): control 16/16, armed 16/16 — PASS (126s).
Per-day [pantryKcal, roster, deaths] + say-stream hashed; control vs armed are
NOT expected to match (the lever moves kcal on lean days — confirmed: all 16
configs diverge control≠armed). Infra note: a mid-run service restart wiped
/tmp and killed the first attempt at 3/16; re-ran with the log under
~/workspace/ (AGENTS.md lesson) — no work lost (all scripts committed).

## Pilot results

32 runs (seeds 5201–5208 × leadsharelean/belongsharelean × control/armed),
180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, SURPLUSFEED unset. Corpus:
evidence/2026-10-20/perseed-sharelean-b/{control,armed}-{lead,belong}.json;
verdict: evidence/2026-10-20/perseed-sharelean-b/sharelean-b-analysis.json.

**PRIMARY — lean-day inflow ratio (armed/control, pooled lead+belong): 1.05x
vs the ≥ 1.3x bar → NO-GO.**
- Control: 1,299,826 kcal over 381 lean-days. Armed: 1,369,831 kcal over
  430 lean-days.
- Fat-day inflow (the fat-side culture check): control 7,143,216 vs armed
  7,726,306 = 1.08x — the valve does not disturb fat-side sharing.
- Paired per-seed ratios are noise-dominated (0.00x–25.07x; median 1.015x):
  s5201-lead 25.07x (control base: 5 lean-days, 6k kcal — tiny denominator),
  s5206-belong 10.06x, s5206-lead 0.00x (armed: zero lean days), the other
  thirteen 0.23x–1.92x. No systematic 1.3x on any reading.

**The valve works mechanically — the funnel re-tag is textbook:**
- share_surplus (instrument-classified): control 775,000 → armed 68,400
  (0.09x) on lean days. away_wild: 206,330 → 940,816 (4.56x) — the re-tagged
  kcal read as away_wild (the instrument classifies the valve's
  stockPantry('Foraged food') by name; documented in the analyzer header).
- Valve telemetry (armed): 474 armed daily-evals, 419 voiced valve-days,
  843,167 kcal re-tagged into the PANTRY funnel.
- duty_fish (the throttle's own lean answer): 1.20x — unharmed, still answering.

**GUARDRAILS (hard):**
- fast-rot pooled/100d: control 74,061 vs armed 38,168 = **0.52x** (bar ≤ 1.15x)
  → PASS — the valve HALVED fast rot (lean-day arrivals are eaten, not stored).
- starvation deaths: 11 vs 11 (bar ≤ control) → PASS.
- median survival: control 115d vs armed 135d (bar ≥ control−10d) → PASS (+20d).
- national: control 8/16 vs armed 7/16 (bar ≥ control−2) → PASS.
- laundering: 0 vs 0 → PASS.
- new death modes: the analyzer's naive string-set check flagged 10 armed-only
  causes — triaged as procedural noise, NOT new modes (see metric review).
  No new death MECHANISM: lockjaw/wound_fever are mundane-pool diseases
  (docs/DISEASES.md: tetanus from dirty wounds, infected wounds); the rest
  ("the eater", "big ugly", "sunbasker"…) are procedural monster names, and the
  control side has 4 of its own unique ones ("the static kite", "the loud
  beast"…). The valve moves food; it cannot mint monsters or diseases.

**Wall numbers:** control won 0/16, national 8/16, med 115d, max 180d;
armed won 0/16, national 7/16, med 135d, max 169d. Deaths: combat 96→133,
monster 22→37, starvation 11→11, sickness 19→10. Villages die fighting while
hungry on both sides — the scale wall does not move on the pre-seat substrate
(wins structurally 0; SEATDRIVE=0 by design).

**Telemetry deviation check:** telemetry-check.js vs scale-wall.json fires the
known regime-artifact LOUD (wins/national/table "disappeared") — triaged, not
an arm effect: the baseline's own _regime block warns "DO NOT compare pre-seat
substrates against this baseline — wins are structurally ~0 there"; both arms
agree (wins 0/16 both, national 8 vs 7). The layer changed nothing about win
reachability (shelltask-b2 precedent).

## Metric review (§14)

- **The primary correctly killed the arm.** The valve's mechanism story, now
  measured: the DIAG's lean-day share_surplus collapse is NOT a hoarding
  problem — it is compositional (fewer villagers alive on lean days → less
  production) plus the engine's own CRISIS SHARING already opening the gate
  (pantryKcal < 5000 → trustFactor ×2, capped 1.0) on exactly the days the
  valve fires. The valve re-tagged 843k kcal (more than control's entire 775k
  lean share_surplus — the gate-opening is real), yet pooled lean inflow moved
  only +70k (+5%): there is no hidden trust-hoard to unlock because crisis
  sharing already unlocked it. A future SHARING-side lever cannot beat this
  bar; the axis's next arm must attack lean-day PRODUCTION (the DIAG's second
  candidate: duty_fish scale-up) or the compositional roster collapse.
- **Lean-day classification is endogenous to the treatment** (paired lean-day
  counts swing 5d↔51d between sides on identical seeds): the valve changes the
  pantry trajectory, which changes which days count as lean. The pooled-total
  primary is still the honest judge (it measures what the village actually
  received on its lean days), but per-day ratios are not interpretable —
  hence the pooled form pre-registered.
- **The "new death modes" string check is too naive for procedural content**
  (monster names are generated per run). Judge "no new death mode" on
  mechanisms, not name strings: no new mechanism appeared.
- **Positive side-effects worth recording for the next arm:** fast-rot halved
  (0.52x) and median survival +20d — the PANTRY-funnel re-tag on lean days is
  rot-honest (arrivals eaten, not stored). A future arm could pursue the
  re-tag's rot benefit with a different primary, but the re-tag alone moves
  ~zero inflow and would not meet a lean-inflow bar either.
- **Metric for the NEXT run (proposal, not applied here):** any follow-up
  sharing-side lever should pre-register on per-villager surplus capture
  (kcal/person/lean-day) rather than pooled inflow, to separate the
  compositional roster effect from the funnel effect.

## Village assessment (plain words)

Thirty-two villages, sixteen pairs of identical twins, and the valve twin
keeps its people fed a little longer (+20d median) without changing any
village's fate: twelve of sixteen pairs still die, mostly between day 40 and
day 172, killed by combat and monsters while carrying hundreds of starvation
days between them. The valve's story in the numbers is a quiet one — on the
days the pantry runs thin, the surplus that villagers would have kept in their
packs goes to the common store instead, and it gets eaten the same day. The
pantry doesn't grow; the rot pile shrinks. The people who thrive are the same
on both sides: the fishers (duty_fish still the only channel that truly
answers lean), the fighters who live long enough to matter. The people who
die are the same too: fighters weakening into raids, a few starving when the
roster thins past the point where sharing matters. The blank this arm
documented rather than filled: the lean collapse is a PRODUCTION blank, not a
sharing blank — there is no hoard to unlock, only hands missing from the work.

## Sense-testing

scripts/sense-sharelean-b.js — 60d transcript capture (leadsharelean s5201,
armed), valve voiced on days 1, 2, 33, 34, 35. Read in full.

- **The valve's fiction coheres.** One line per active lean day, placed
  naturally in the evening flow: "🍲 The pantry shelves are thin (~2 days of
  fresh left). The village pulls together — today's surplus goes to the common
  store, not into packs." On starving days (d34–35, the scholar eating spoiled
  dried beans, "Your stomach is a fist") it reads as shared hardship, not a
  bug. The line repeats identically each firing — same robotic-repetition
  class the DIAG flagged on the smoke-rack line; a narration-variety
  follow-up candidate, not a blocker (the arm is killed regardless).
- **Villagers act like people.** Names learned around the fire (Zhigang,
  Elijah, Yuki), gossip mutating in retelling, Katarina's water/fish/garden
  rounds, real fights ("Onni stood down the Ugly Beast and kept walking — 3
  rounds, bloodied but breathing"), grief and barter. Nothing robotic
  attributable to the valve.
- **No contradiction with the throttle's voice:** on day 2 the throttle
  redirect ("the shelves are full, ~6 days of fresh on hand… the pantry can't
  take more") fires at midday and the valve fires at night (~2 days left) —
  both true at their hour; the pantry genuinely swings intraday on thin days.

## Balanced panel (§15)

**Attempted; documented as unbuildable for this arm (no bogus panel shipped).**
The treatment is the SHARELEAN env flag: scripts/lib/simulation-flags.js
discover() source-discovers `process.env.SHARELEAN` from
scripts/policies/sharelean.js (verified: discover() returns SHARELEAN), so a
before panel (SHARELEAN unset → null) vs after panel (SHARELEAN=1) records
different flag values and comparePanels correctly invalidates on "Unmatched
flags" — the exact pantryguard-b2/inflowguard-b precedent ("an env-flag
treatment cannot produce a valid compare"). Per the pre-registration, the
pre-registered metrics bind regardless: the 16/16 det-gate and 15/15 proof are
the instrument, the primary + guardrails are the judge.

## Convergence state

**KILLED-AT-PILOT.** Primary 1.05x vs ≥ 1.3x bar (paired median 1.015x, no
systematic effect). All hard guardrails passed; the kill is on the primary
alone, per the binding pre-registration. food-economy stays converging; the
named next is a PRODUCTION-side lean lever (duty_fish scale-up, the DIAG's
second candidate), not another sharing-side valve. No scale-wall movement
claimed or observed (wins 0/32, pre-seat substrate by design).
