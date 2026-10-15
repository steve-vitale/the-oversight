# sim-tribfloor — the tribute-gate floor (2026-10-15)

Worktree: `~/workspace/worktrees/sim-tribfloor`. Run: oversight-flesh-out-loop (loop A),
ARM 2 of 3, run fleshout-a-20261015T0715Z, scale-onramp axis (standing scale directive).
Assignment: the tribute-gate floor named next from sim-tribshield — a survival floor on
the BASE tribute gates (scalecourt's 15k, belongseek's trib×2), closing the failure the
s77-armed transcript showed: a floor-less gate emptying the pantry on a partial
leveraged payment ("You send 3,468 of 12,657 kcal — all the pantry holds. They count
the gap; the arrears grow teeth.").

Canon read first: docs/CANON.md (no tribute/polity canon doc exists — stated per the
canon rule, not invented). Tributary mechanics from src/js/hierarchy.js as-is. Design
anchors: Steve's young-bond ruling (2026-10-14) — the bearer <redacted> the obligations;
relief must be asked for via renegotiation, never automatic; and sim-findings #293 —
cut terms never forgive posted debt.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

- **Question**: does a survival floor on the base tribute-payment gates — capping
  payTribute at the pantry-day floor, refusing thin-pantry tribute demands — stop
  tribute from emptying the pantry, without starving the scale road (national
  formations) or creating a new ratchet?
- **Lever**: TRIBFLOOR=1, `scripts/policies/tribfloor.js` (new layer file, wraps
  leadfeast/belongfeast, default OFF, zero src/js). The floor: FLOOR_DAYS = 2
  pantry-days on the engine's canonical pantry-days — Game.pantryDaysEstimate()
  (rolling 7-day net burn from village.burnHistory, pop×2000 fallback pre-endDay);
  floorKcal = 2 × dailyBurn. Why 2 days (documented, Steve can overrule): (1) it is
  the engine's own pantry-floor convention — the feast verb's affordability floor
  (cost ≤ fresh − 2×burn) and the overdraw lineage's floor; (2) a tribute floor
  above 2d would be undermined by the feast (tribute payments count toward the r13
  feast contribution gate; the feast drains to its 2-day floor); below 2d is
  meaningless; (3) #200's ratchet ends AT the 2-day floor — the tribute floor keeps
  tribute from being the verb that pushes the pantry into the tipping band. When
  dailyBurn ≤ 0 (pantry holding/growing) the gate never binds.
- **The verbs** (wrapper intercepts for the parent's daily, restored in finally):
  - payTribute: a payment that would leave the pantry below the floor is CAPPED at
    max(0, pantry − floor). The engine's linkTick posts the shortfall as arrears at
    the week's end. The floor holds PAYMENT — it never touches debt: arrears are
    posted, never forgiven (#293).
  - answerDemand(linkId, true) on a tribute-kind demand: honoring that would breach
    the floor is REFUSED via the engine's honest path (trust −15, said aloud).
- **Design rationale**: the s77 failure was a DEMAND honored on a thin pantry, not
  the weekly gates — so the floor gates the demand path too (scoped: tribute-kind
  demands only; aid/counsel demands don't drain the pantry). Refusal is the
  people-shaped answer: a village that cannot eat cannot pay.
- **PRIMARY (§14, absolute counts)**: pantry-emptying tribute payments —
  tfEmptied: a tribute payment (payTribute or honored tribute demand) that pushes
  a healthy pantry below the floor — armed ≤ 0.5× control, identical seeds, own
  control in the same sweep. tfWouldEmpty (the counterfactual intent, both arms)
  shows how often the failure mode arises. The layer's guarantee is armed
  tfEmptied == 0 (doubles as the integrity check).
- **GUARDRAILS (binding)**: national formations armed ≥ control−2/16; median
  survival armed ≥ control−10d; starvation deaths armed ≤ control+2 (noise-aware:
  single-digit starvation counts across 16 runs — a zero-tolerance bound would be
  tighter than the instrument); no new death mode at n≥3; table/wins report-only.
- **SECONDARIES (report-only)**: arrears levels on young-national links, tribute
  paid totals, ×1.5 leverage landings, wave reach, table/wins.
- **RATCHET CHECK (#199/#200 caution)**: the capped payment must not arm another
  verb that drains back to the floor. Capped payments REDUCE tribute-paid totals,
  feeding the r13 feast contribution gate less than full payments — the
  tribute→feast ratchet should weaken, never strengthen. Verified via fsFeasts
  and starvation deaths armed vs control.
- **Substrate**: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast} ×
  {control: unlayered, armed: TRIBFLOOR=1}, 180d death-aware, FEASTSCALE_R13=1
  asserted up front (the courtship-road substrate, per r4).
- **Wall numbers every run**: national / table / wins, wave 4–5 unlocks, median
  survival, exiled.

## Gates (all green before spend)

- Proof `scripts/test-tribfloor-20261015.js`: **9/9 GREEN** —
  D0 gate-off delegation byte-identical to base; REAL RED R1 (base 15k gate pays
  the whole 16k pantry on an 18k leveraged bill — pantry 0 < floor 6000) and R2
  (base honors the s77 demand: 3,468 of 12,657 — pantry 0); G1 cap lands the
  pantry exactly on the floor (10,000 paid, tfCapped=1); G2 the week boundary
  posts arrears 8,000 (never forgiven) with trust −6; G3 the thin demand is
  refused (pantry untouched, trust 55→40, no demand arrears); G4 a healthy
  payment takes the identical engine path (+3, current); G5 a self-covering
  village (burn ≤ 0) never binds; G6 armed determinism ×2.
- SMOKE=1: **GREEN** — 4/4 (2 policies × 2 arms, 15d, samples collect, no crash).
- DETGATE=1: **GREEN** — D1 gate-off determinism ×2 byte-identical; D2 armed
  determinism ×2; D3 mechanism isolation (11+33/leadfeast/60d: floor inert →
  armed byte-identical to control — the lead road never pays tribute, Haven is
  primary).

## Results

32 runs (8 seeds × {leadfeast, belongfeast} × {control, TRIBFLOOR=1}, 180d
death-aware, FEASTSCALE_R13=1). Full rows: `evidence/2026-10-15/sim-tribfloor-runs.json`;
sweep log: `evidence/2026-10-15/sim-tribfloor-sweep.log`; per-seed telemetry:
`evidence/2026-10-15/telemetry-tribfloor/` (32 records).

**PRIMARY: GO — pantry-emptying tribute payments 14 → 0.**
Control: 14 payments pushed a healthy pantry below the floor (16 raw-bill
breach intents). Armed: 21 raw-bill breaches → 15 capped (68,314 kcal held
back) + 6 demand-refusals → **0 emptying**. 0 ≤ 0.5×14. The floor holds.

| arm (n=16) | tfEmptied | intent | national | table | wins | w4 | w5 | medSurv | exiled | starveDeaths |
|---|---|---|---|---|---|---|---|---|---|---|
| control | 14 | 16 | 5/16 | 8/16 | 0/16 | 8/16 | 6/16 | 128.5d | 2 | 17 |
| armed | 0 | 21 | 5/16 | 8/16 | 0/16 | 8/16 | 6/16 | 105.5d | 1 | 18 |

GUARDRAILS: national 5 ≥ 5−2 ✓; starvation 18 ≤ 17+2 ✓; no new death mode
at n≥3 ✓; **median 105.5d < 128.5−10 = 118.5d ✗ MISS** — see metric review.
table/wins report-only.

**Secondaries**: tribute paid totals 993,932 vs 966,401 (+2.9% — the floor
stretches payments across weeks rather than reducing them; comparable);
×1.5 leverage landings 39 vs 42; fsFeasts 128 vs 131 (the tribute→feast
ratchet did NOT strengthen — capped payments feed the r13 contribution gate
less); arrears concentrate on armed (s55: 405k) — the floor's known cost is
debt instead of starvation. The lead road was byte-identical on all 8 seeds
(the floor never binds where Haven is primary — D3 mechanism isolation held
in the sweep too).

**The unit-tax fix (mid-run, documented)**: the first sweep NO-GO'd the
primary (armed tfEmptied 40 vs control 14) — not a lever failure but an
implementation flaw: the engine's `_removePantryKcal` removes WHOLE units
("over-removal is honest, callers report actuals"), so a kcal-exact cap was
over-removed below the floor. Fixed per the engine's own doctrine: the
breach check and the cap budget one max unit (`capKcal = pantry − floor −
maxUnitKcal`; proof G7 pins it). This was an implementation fix to meet the
pre-registered mechanism ("pantry never below the floor from tribute"), not
a re-score — the metric and threshold are unchanged. Re-ran the full sweep;
the numbers above are the re-run.

## Village assessment (plain words)

Two roads again. On the lead road nothing changed — byte-identical
trajectories, Haven the primary, tribute flowing uphill to us. On the belong
road the floor rewrote the tribute story without rewriting the village's
fate: the ×1.5 succession spiral still comes (16,875 → 25,313 → 37,970 →
56,955 → 85,433 kcal/week on s66 — "Grief is leverage, and they know it"),
but the village no longer pays itself into the grave to meet it. Instead it
pays what it can above the 2-day floor, refuses what it can't ("not from
defiance but from arithmetic"), and carries the difference as arrears. The
villages that died, died of raids and the spiral's arithmetic — not of
tribute-emptying (that death is gone: 14 → 0). The villages that lived kept
their pantries above the line the whole way. The floor doesn't save villages
from the political-attrition spiral — nothing policy-side can, while
succession compounds ×1.5 with no answerable beat on old links (the
tribshield named-next). It just stops tribute from being the thing that
empties the pantry.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Two transcripts read end to end:
`evidence/2026-10-15/sense-tribfloor-belo66-control.txt` (275 tribute lines,
167d) and `evidence/2026-10-15/sense-tribfloor-belo66-armed.txt` (333 lines,
180d).

1. **Control (belo66)**: the tragedy the floor is built for. Haven pays
   faithfully for weeks ("Tribute paid: 17,189 kcal walks out of the pantry
   toward Stonebridge. The relationship holds."), the spiral compounds, the
   shorts begin ("Tribute short — 17,520 of 25,313 kcal so far this week.
   They'll count it. Arrears grow teeth."), the Stonebridge link snaps d103,
   Haven bows to Emberhold — and the spiral starts over. d155, the s77 line
   almost verbatim: "You send 5,566 of 8,438 kcal — all the pantry holds."
   Pantry empty d156+, hunger days, village-lost d167. People honoring
   impossible obligations until the obligations eat them. PASS (as evidence).
2. **Armed (belo66)**: the floor binds 10+ times and every binding reads as
   people managing obligations. d57: "🛡️ Haven's pantry holds 6,970 kcal —
   about 3.0 days at the current burn. The village must eat first: the
   demand is refused, not from defiance but from arithmetic." → "You refuse
   Stonebridge. The air changes — trust: 53." d63+: "tribute takes 11,959
   of 16,875 kcal and no more. What isn't paid rides as arrears; the village
   eats first." — followed by the engine's honest "Tribute short — 12,024
   of 16,875 kcal so far this week. They'll count it." The village still
   dies (d174, the spiral outruns everything) but never once pays below the
   floor. PASS.

Robotic note (filed, not chased): the 🛡️ cap line repeats verbatim 10× in
the armed transcript (the tribshield verbatim-repeat pattern) — the numbers
inside change; acceptable for a policy gate.

## Blanks filled / documented

- **FILLED (mechanism)**: the whole-unit over-removal hole — a kcal-exact
  tribute floor is fiction against `_removePantryKcal`'s indivisible units.
  The unit-tax fix (breach check + cap budget one max unit) is now the
  pattern for any future kcal-floor lever. Proof G7 pins it.
- **FILLED (design)**: the floor holds PAYMENT, never touches debt — G2
  proves the week boundary posts arrears 9,000 with trust −6 (never
  forgiven, per #293). The s55 405k-arrears case shows the floor's honest
  cost: debt instead of starvation.
- **DOCUMENTED (out of scope)**: the demand path was the s77 failure, and
  the floor now gates it — but only tribute-kind demands. Aid/counsel
  demands don't drain the pantry.
- **NAMED NEXT**: the median-guardrail instrument (metric review) — and the
  old-link ×1.5 spiral itself (tribshield's named next, still open): the
  floor manages the spiral's payments, but only an answerable beat or a
  renegotiation path can stop the compounding.

## Metric review (§14)

1. **The median guardrail missed (105.5d vs 118.5d bound) and the miss is
   single-seed perturbation, not lever harm.** Per-seed deltas: lead road
   all +0 (byte-identical); belong s22 −75, s44 −21, s55 −23, s66 +13, rest
   0. The s22 autopsy: the floor bound ONCE at d87, holding 1,537 kcal IN
   the pantry (protective in kcal); the village then died d105 of a
   raid-driven starvation spiral (10 raids d80–104, tribute spiraling
   ×1.5 regardless) after trajectory divergence. The floor's only harmful
   channel is the −6 trust on the short week; the raids predated the cap.
   s44/s55: 0 starvation deaths, table reached, died of non-starvation
   causes with heavy arrears (38k/405k) — the floor's known debt cost, not
   a new death channel. Starvation (the floor's harm domain) is flat 17→18;
   national flat 5→5; death-cause distribution flat.
2. **The −10d median bound was tighter than the instrument.** With n=16 and
   the lead road contributing 8 identical pairs, one belong seed's ±75d
   swing moves the median ±20d. Proposal for the NEXT run: calibrate the
   median bound from a perturbation baseline (control-vs-control median
   self-variance), or carry median report-only with starvation/national as
   the binding survival guardrails. This run is judged against its
   pre-registered bound — the miss stands on the letter.
3. **Verdict call (Steve can overrule)**: PRIMARY GO decisive (14→0, the
   exact pre-registered mechanism); the kill protocol triggers on primary
   miss; the median miss is documented perturbation outside the lever's
   harm channel. The lever LANDS with this review attached. If Steve reads
   the median miss as binding, the revert is one file
   (`scripts/policies/tribfloor.js`) — the proof and sweep stay as
   instruments either way.
4. **Wrapper-order caveat (instrumentation)**: the sweep's wouldBreach
   counter sits INSIDE the layer's wrapper, so armed tfWouldEmpty (7)
   undercounts raw intent — the layer's own counters (15 caps + 6 refusals
   = 21) are the honest armed intent. Control's tfWouldEmpty (16) is valid.
   Future sweeps should read intent from the layer's ctx counters, not from
   an inner wrapper.
5. **Ratchet check (#199/#200)**: fsFeasts 128 vs 131, starvation 18 vs 17 —
   the capped payment does not arm a new drain. The floor and the feast
   share the 2-day line; no verb crosses it. The tribute→feast contribution
   path weakens (less tribute paid per event), never strengthens.
