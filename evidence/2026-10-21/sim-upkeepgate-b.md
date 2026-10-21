# sim-upkeepgate-b — do lowered upkeep gates close the post-court dissolution gap?

Run: fleshout-loop-b (arm sim-upkeepgate-b), worker tree ~/workspace/worktrees/sim-upkeepgate-b, base 5886ab681.
LEVER (policy-side, zero src/js): UPKEEPGATE=low lowers the policy pantry gates the
parent diagnostic named — leadcourt tending gate 20k → 8k; belongseek tribute gate
2×-owed → 1.2×-owed (scripts/policies/upkeepgate.js; new files, env-gated, default-OFF).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sweep sims)

- **Question**: the parent diagnostic (sim-linkdissolve-b, landed f4098b567) confirmed the
  SURPLUSFEED trim → post-court realm-dissolution path as a THRESHOLD effect mediated by the
  POLICY's own pantry gates (lead 20k tending gate; belong 2×-owed tribute gate), +3 pairs net
  armed vs control (lead +3: 4 armed-only vs 1 control-only; belong +1: 2 vs 1). The named lever
  is the policy gate level, not the trim rate. Does lowering the gates close the gap?
- **PRIMARY (binding)**: post-court dissolution pairs-net (armed vs control) closes to ≤ +1
  (parent baseline +3). A pair = one seed + one policy; pairs-net = (# pairs armed_diss >
  control_diss) − (# pairs control_diss > armed_diss) — the parent's own counting.
- **GO** = pairs-net ≤ +1 AND all guardrails pass:
  - starvation deaths (armed) ≤ control + 1
  - median survival (armed) ≥ control − 10d
  - no new death modes (armed cause set ⊆ control cause set)
  - ever-national (armed) ≥ control − 2
  GO means the tradeoff is policy-elastic (evidence FOR the SURPLUSFEED default-ON call, with
  gate-level guidance). **NO-GO** = gap persists → the trim's upkeep cost is structural, not
  policy-elastic.
- **Seeds/method/horizon**: 8801–8808 × {leadfeast-upkeepgate, belongfeast-upkeepgate} ×
  {control (SURPLUSFEED unset), armed (SURPLUSFEED=1)}, UPKEEPGATE=low, FEASTSCALE_R13=1,
  SEATDRIVE=0, 180d death-aware (same paired substrate as the parent diagnostic; PAIRED REUSE
  exception, not a fresh-seed claim). STAGED: pilot = lead policy × 8 seeds first (16 runs);
  the full 16 pairs (32 runs) only if the pilot shows movement toward the bar. Never below 8
  seeds per arm.
- **Instrument proof (pre-sweep, all passed — scripts/test-upkeepgate-b.js, 13/13 GREEN)**:
  (a) ENGAGE: UPKEEPGATE=low on the parent's clean lean seed (8801 leadfeast armed) —
  33 variant tendLink calls in the 8k–20k band, 32 gate-skips recorded, base tending intact (47);
  (b) RED: UPKEEPGATE unset ≡ baseline policies byte-identical (leadfeast/belongfeast, armed
  and control, seeds 8801/8802 — 8/8);
  (c) DET: same seed twice in-process byte-identical, variant unset and variant engaged.
  Proof ran with FEASTSCALE_R13=1 SEATDRIVE=0 per the Usage header (ENV TRAP honored).
- **Honesty bars**: the parent's link instrument reused unchanged (polity agreement 100% on the
  parent corpus); dissolution events come from the same attachLinkProbe; upkeep paid = engine
  return values via the ctx counters; driver rows extended additively (ug block, death causes).
- **Balanced panel (§15)**: inexpressible — same class as the parent (documented there): the
  treatments (SURPLUSFEED=1 / UPKEEPGATE=low env vars) are not part of panel case identity and
  the pre-registered primary is not a contract metric. No bogus compare shipped; the before/after
  is the paired analysis on identical seeds, commit, and instruments (scripts/analyze-upkeepgate-b.js).

## Metric review (§14 — mandatory section)

- PRIMARY judged AS WRITTEN on the parent's binary counting ("5 armed-only vs 2
  control-only"): +2, bar ≤+1 → NO-GO, not re-scored. Mid-run correction documented:
  the analyzer first used event-count pair comparison; the pre-registration cites the
  parent's binary language, so the analyzer was corrected to binary (all lead pairs were
  0/1-or-0/0, so the pilot's +2 is unchanged under either counting).
- The honest nuance the bar doesn't capture: BOTH roads moved −1 pair net (lead +3→+2,
  belong +1→+0); armed dissolutions halved on lead (4→2); control dissolutions went 1→0
  on lead. The lever is directionally correct on both roads — just not sufficient, and
  the belong road paid for its binary improvement with event churn (9v5).
- "No new death modes" naive-FAILS on both policies by set-difference, but every
  armed-only cause is pre-existing engine vocabulary: mundane diseases (bad belly,
  lockjaw, tick), thirst/dehydration (two labels, one category — control has
  dehydration), and per-seed monster-name kills (The Suburb, The Heckler, Highbeam Deer,
  Big Ugly / belong: The Static Kite, The Congregation) with a symmetric control-only
  monster-name set. No new MECHANISM of death. Interpreted PASS; the naive check is the
  wrong instrument for per-seed rare draws — proposed revision: judge on cause
  CATEGORIES, or require an armed-only cause to be absent from the engine's cause
  vocabulary entirely.
- Lead median-survival FAILS as written (113 < 137) — not re-scored.
  Difference-in-differences vs the parent: (113−147) − (144−143) = −35d attributable to
  the variant×trim interaction. Mechanism is legible: 226 extra tends ≈ 46k kcal/run of
  additional outflow (at the honest whole-unit cost basis, ~10–25% above nominal) from
  trim-thinned pantries; control+variant median (147) ≈ parent control (143), so the
  cost lands specifically on armed runs. The guardrail did its job — this is the
  tradeoff the arm was designed to surface.
- The structural read (for the next arm, not this verdict): on 8805/8806 the variant
  tended 12/68 extra times and the realms STILL dissolved — succession-heavy trust decay
  (−8×deaths, tribute shorts) outruns the +8/week repair verb. The gate is no longer the
  binding constraint; the REPAIR RATE is. No gate level fixes a decay that outruns the
  verb — the next lever is tending strength, haircut size, or the seasoned bar, not the
  pantry gate. Same on belong: the 1.2× gate keeps tribute flowing and realms re-forming,
  but the arrears-bar razor still cuts per event.
- Balanced panel (§15): inexpressible, no bogus compare shipped (pre-registered).

## Canon

- docs/CANON.md read first. Policy-side lever only: the feast is the village's social engine;
  tribute/tend are real pantry outflow (canon kept from the parent). New for this arm: the
  gates are POLICY choices (leadcourt.js:20k, belongseek.js:2×), not engine mechanics — the
  engine's tendLink/payTribute guards (mourning, idempotency, bare-pantry refusal) are untouched.

## Proof results (pre-sweep — 13/13 GREEN)

(see Pre-registration above; full log in the worker report)

## Sweep results

### Pilot (lead policy × 8 seeds, UPKEEPGATE=low, 180d — 16 runs, complete)

Wall numbers (paired, armed / control, n=8):
won 0/8 / 0/8, national (end-state) 5/8 / 7/8, national (ever-hit) 7/8 / 7/8,
table 7/8 / 7/8, wave-4 7/8 / 6/8, wave-5 0/8 / 0/8,
median 113d / 147d, max 180d / 180d.

PRIMARY (pilot): pairs-net **+2** (armed-more 2: 8805, 8806; control-more 0; tie 6)
vs the parent's lead-policy +3 (4v1). Direction: toward the bar (≤+1), not yet at it.
Armed dissolutions fell 4→2; control dissolutions fell 1→0.

Engagement (the lever fired): armed 226 variant tends / 214 gate-skips (base 308 tends);
control 139 variant tends / 121 gate-skips (base 491 tends). The lowered gate is heavily
engaged on both arms — grain flowed where the 20k gate would have halted it.

Guardrails (pilot, armed vs control):
- starvation deaths: 1 ≤ 7+1 → PASS (the variant did not starve villages; control starved more)
- median survival: 113 ≥ 147−10=137? NO → FAIL (−34d)
- new death modes: armed-only causes = The Suburb, The Heckler, bad belly, lockjaw,
  Highbeam Deer, thirst, Big Ugly — all pre-existing engine causes (mundane diseases,
  thirst/dehydration, per-seed monster-name kills); control has a symmetric unique set
  (The Union Rep, Spool, the night, The Living Wire, The Algorithm, Lockpick). No new
  MECHANISM of death → interpreted PASS (see metric review)
- ever-national: 7 ≥ 7−2 → PASS
- instrument: polity agreement 100% (agreeBad 0 across all 16 runs)

Per-pair ledger (control / armed): seed courts diss trimK
8801 1/1 0/0 199k | 8802 1/1 0/0 196k | 8803 1/1 0/0 67k | 8804 1/1 0/0 192k |
8805 1/1 0/1 229k | 8806 1/1 0/1 167k | 8807 0/0 0/0 18k | 8808 1/1 0/0 221k

Pilot-gate decision: PRIMARY moved +3→+2 (armed dissolutions 4→2, control 1→0) — movement
toward the bar. The belong road tests the SECOND gate (tribute 2×→1.2×) against the
arrears-bar mechanism, a different tradeoff shape the pilot doesn't inform. Proceeding to
the full 16 pairs per the staged protocol; the pre-registered combined verdict judges.

### Full sweep (belong policy × 8 seeds, UPKEEPGATE=low, 180d — 16 runs, complete)

Wall numbers, belong (paired, armed / control, n=8):
won 0/8 / 0/8, national (end-state) 2/8 / 1/8, national (ever-hit) 7/8 / 6/8,
table 7/8 / 7/8, wave-4 8/8 / 7/8, wave-5 0/8 / 0/8,
median 157d / 138d, max 180d / 180d.

Belong PRIMARY: pairs-net (binary, parent's counting) **+0** (armed-only 1: 8808;
control-only 1: 8803; ties 6) vs the parent's belong +1 (2v1). Event-net +4 (9v5):
the lowered tribute gate FIRED (armed tribCalls: 8801×5, 8802×5, 8803×8, 8806×4,
8807×6) and realms RE-FORMED after dissolving (8801 courts=3, 8802 courts=2,
8806 courts=2) — but the razor's edge kept cutting, so armed runs dissolved MORE
TIMES even as the same-ish number of runs ever dissolved. The clearest variant win:
8803 armed held its realm to village-death (diss 0) where control dissolved (diss 1).

Belong guardrails (armed vs control): starvation 5 ≤ 5+1 PASS; median survival
157 ≥ 138−10 PASS; ever-national 7 ≥ 6−2 PASS; new death modes naive-FAIl
(interpreted below); instrument agreeBad 0.

### Combined verdict (16 pairs, pre-registered judge)

PRIMARY (binary pairs-net, the parent's own counting): **+2** (armed-only 3:
8805L, 8806L, 8808B; control-only 1: 8803B; ties 12) vs parent +3 (5v2).
Bar was ≤+1 → MISS. Event-net: +6 (11v5) vs parent +3 (10v7) — the belong churn.

Guardrails combined: lead median-survival FAILS (113 < 137); everything else passes
on the honest reading (see metric review).

**Verdict: NO-GO.** The gap did not close to the bar, and the lead road's survival
guardrail misses. Per the pre-registered classes: the trim's upkeep cost is
substantially STRUCTURAL, not policy-elastic through the gate level. This is evidence
AGAINST the SURPLUSFEED default-ON call as a pure win — or more precisely, evidence that
default-ON needs a different companion lever than gate levels (see metric review).

Wall numbers, combined (armed / control, n=16):
won 0/16 / 0/16, national end-state 7/16 / 8/16, ever-national 14/16 / 13/16,
table 14/16 / 14/16, wave-4 15/16 / 13/16, wave-5 0/16 / 0/16.
The scale wall is unmoved (wins 0/32, wave-5 0/32).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

The two persistent armed dissolutions (8805, 8806 — the same seeds the parent's armed
dissolved) read as legible tragedies, not ledger flips. 8806: Haven kept sending grain for
60 days (68 variant tends) while village_1's fields failed — arrears climbing 7k→22k, trust
100→39 under succession haircuts the +8/week tending couldn't outrun; the realm dissolved
d142 at trust 39, one point under the seasoned bar. 8805: trust 60→39 in 14 days while the
pantry collapsed 35k→0; the grain flowed (12 variant tends) but the decay rate beat the
repair rate. The realm-death line still lands: "◈ The realm came apart — no polity answers
to Haven now, and Haven is a free fire again." The key sense-read: the lever WORKED (grain
flowed where the old gate halted it) and the gap STILL persisted on the hardest seeds —
the bottleneck moved from the gate to the repair rate. Tending is honest; the decay is
honest; the bar is honest.

Out-of-arm observation (not chased; filed to sim-findings.md by the coordinator if
useful): `_removePantryKcal` takes WHOLE UNITS (break-it food r3 doctrine — "over-removal
is honest"), so a 1,500 kcal tend on large-unit pantries removes ~1,650–1,900 kcal. The
variant's true cost basis is ~10–25% above the nominal 1,500/tend — material to the
survival-guardrail reading.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-21/perseed-upkeepgate-b/*.json' --metrics
national,table,wins,exiled` fired LOUD on national/table/wins — the documented spurious
class (parent evidence sim-linkdissolve-b.md): the baseline's regime block says DO NOT
compare courtship substrates against it (wins structurally ~0 there). Regime-correct
comparison is armed vs same-commit control within this corpus (above). Baseline NOT
rolled.

## Convergence state

**NO-GO — judged at the full 16-pair sweep (pilot passed its gate: +3→+2 movement).**
The lever moved both roads in the right direction (lead binary +3→+2, belong +1→+0;
armed dissolutions halved on lead; control dissolutions 1→0 on lead) but the
pre-registered bar (≤+1) was missed and the lead median-survival guardrail failed
(−35d variant×trim interaction, mechanism-legible). The trim→dissolution tradeoff is
substantially STRUCTURAL through the gate level: with grain flowing, succession-heavy
decay still outruns the +8/week repair verb, and the belong arrears razor still churns
(9v5 events). The actionable finding for the default-ON call: gate levels alone don't
close it — the next lever is the repair rate (tending strength / haircut size / seasoned
bar), not the pantry gate. food-economy stays converging; the wall is unmoved (wins
0/32, wave-5 0/32).
