# sim-trustguard-b — trust-ledger guard layer (loop B ARM 1, 2026-10-15)

Claims sim-findings #329's named next: "PANTRY TAKES TAX THE TRUST LEDGER".
Axis: food-economy. Run: fleshout-b-20261015T1455Z.

Policy-side lever, zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: sim-goinside-b answered the inside/outside pantry wall (420
  dawn takes, 15,286 kcal packed, 208 mid-day meals) but scholar hunger-days
  rose pooled 1.158x vs the 0.60x bar — the binding constraint is the TRUST
  THROTTLE, not the pantry door: takes feed v.takes[vid], net < −5000 drops
  trust, half-rations persist (957 vs 664 "Half ration" beats). The
  sim-trustdelta instrument (r44b) found the unlayered scholar's generosity
  channels ABSENT (donations 25 ticks net +12; giveFood/amends/comfort/meal/
  mediate ZERO fires) — the scholar's ledger is takes-only. Can a guard
  that refuses takes when the trailing-7d ledger nears the trust-tax bar —
  and gives honestly-earned wild food alongside instead — break the
  take-without-giving cycle?
- **Lever**: scripts/policies/trustguard.js (gate TRUSTGUARD=1, default off),
  wrapping leadcourt/belongseek. Rebuilds the go-inside-proven dawn chain
  (REAL Game.enterBuilding() before the draw, one honest Game.takeFromPantry
  unit, pack the lunch, mid-day eat via honest Game.eat() — all proven in
  the goinside proof) and adds the TRUST-LEDGER GUARD before each dawn
  take: read the trailing-7d net in the ENGINE's sign convention
  (net7 = gives7 − takes7) from the REAL takeHist/giveHist
  (src/js/game.js:14171-14230, same day>=day-6 window the engine's
  takeRate7/giveRate7 use); project the candidate unit
  (projected = net7 − candidateKcal); if projected < −5000 + MARGIN,
  DO NOT TAKE. MARGIN = 2000 (documented): the guard engages at a projected
  trailing-7d deficit of 3000 kcal — 2000 kcal of headroom before the
  engine's −5000 trust-tax bar (takeFromPantry, src/js/game.js:14579:
  `net = gives − takes; if (net < -5000) trust −2`), acting while the ledger
  is recoverable. On block: fire the trust-positive channel ALONGSIDE —
  donate honestly-earned wild food from the scholar's own pack
  (foraged/hunted/trapped — never pantry-taken food; pantry-stamped stacks
  are refused: the honest-laundering refusal) via the honest
  Game.donateToPantry (src/js/game.js:14037: hall gate, writes v.gives +
  recordGiveHist, trust via trustGainProgressive), with an honest beat. If
  nothing honest to give, skip the day. At most one take/day, hard.
  Design note: the pack-empty gate (#169) sits before the guard, so a block
  dawn usually has an empty pack and takes the skip branch — the give branch
  is live whenever wild food IS present at a block, and is fixture-proven.
  Also fixes the goinside +0 kcal voice wart (mid-day voice/count gated on
  ate > 0).
- **BASELINE REALITY (read from src/js during build)**: the engine's actual
  trust-tax bar is on the LIFETIME cumulative net (v.takes/v.gives,
  game.js:14579: `if (net < -5000)` → trust −2 per take; bulk path
  game.js:14482 scales the bar by pantry depth). The freeloader clock
  judges the trailing-7d NET RATE (game.js:27125: netRate7 > fairShare).
  The guard manages the trailing-7d net — the actionable, recoverable
  quantity — against the engine's −5000 number. The sweep reports the
  lifetime net as a diagnostic alongside.
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.60x control
  (pooled). (Same bar that killed goinside at 1.158x.)
- **CO-PRIMARY (binding, mechanism fires not vacuous)**: guard blocks ≥ 5
  takes/run average across armed runs AND ≤ 2 armed runs end the run with
  trailing-7d net < −5000 more than once.
  Operationalization: blocks/run = Σ_ctx._tgBlocks / 16 armed runs (≥ 5);
  end-of-run trailing-7d net read from the real takeHist/giveHist at the
  final snapshot (engine sign); ≤ 2 of 16 armed runs may finish with
  net7 < −5000. Per-run below-bar day counts reported as diagnostic.
- **GUARDRAILS**: median survival armed >= control−10d; national armed >=
  control−2/16; scholar starveDeaths <= control+2; no new death mode
  (n>=3 armed-only); takes/day <= 1 hard (in the layer).
- **GO** → commit the layer for landing. **MISS** → layer deleted per kill
  protocol, evidence + instruments only.
- **Horizon**: 180d death-aware (+10d tail). **Seeds**:
  11/22/33/44/55/66/77/88 x {leadcourt, belongseek} x {control, armed} =
  32 runs, OWN control in the SAME sweep (never an inherited baseline —
  #247). This is the PILOT (8 seeds); a confirm (12–16) only follows a GO.
- **Det-gate**: scripts/test-trustguard-20261015.js PART C green before
  sweep spend (16/16 byte-identical, trigger path hot, takes/blocks/gives
  0 under the pack seeder).
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2-3 guard-block / donation episodes read in
  the transcripts — the skipped dawns and the donation beats must read as
  a person managing their standing in the village, not a robot or a raid.
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented. NO trust canon doc
  exists either (stated in sim-trustdelta-b). All mechanics read from src/js
  as-is (cited in the layer header).

## PROOF (before measurement)

scripts/test-trustguard-20261015.js — ALL GREEN:
- PART A (25 fixtures): gate off returns base itself (A1) / named exports
  are the base policies (A2); gate on wraps (A3, base untouched,
  BLOCK_AT=-3000); guard passes on a healthy ledger — take lands, stamped,
  voiced, audit row (A4: net7=-500, projected=-900); guard blocks on a red
  ledger — handleGuardBlock donates honest wild food via honest
  donateToPantry (voiced, counted, giveHist written) (A5); full dawnStep
  blocks with empty pack — no take, skip day, counted (A5b);
  honest-laundering refusal — stamped food never donated, no donate call
  (A6); margin boundary — projected -3000 passes (strict <), -3001 blocks
  (A7); one take/day hard (A8); enter+take chain preserved (A9); mid-day
  wart fix — ate>0 voiced+counted, ate=0 silent (A10); trailingNet7 reads
  the real histories, engine window+sign (A11); picker scoring — cooked
  plant first / human meat never / raw meat last / cap-bounded (A12); burn
  EWMA — seeds, 0.7/0.3, negative clamps, stale anchor no-op (A13); #169
  pre-fill ban (A14); silent when covered (A15).
- PART B (live engine, REAL RED): B1 RED — the base's takeFromPantry on a
  deep lifetime ledger fires the engine's -5000 trust-tax bar (trust drops;
  the bar is REAL, game.js:14579). B2 RED — the layer with a healthy ledger
  takes (pantry -1, pack +1, provenance stamped). B3 RED — the guard reads
  the REAL takeHist (seeded by 8 real takeFromPantry calls, net7 <= -3500)
  and blocks (no take, pantry untouched). B4 RED — the blocked take's
  donateToPantry writes the real books (v.gives +600, giveHist +1). B5 —
  the mid-day wart fix on the live engine (no "+0 kcal" over-claim when the
  base ate the lunch first).
- PART C det-gate: 16/16 byte-identical (30d x 8 seeds x 2 policies,
  gate-off vs gate-on, pack-seeded). The pack seeder keeps the pack full so
  the draw gate — and the guard behind it — never fires; dawn log rows ran
  hot with zero takes/blocks/gives — the trigger machinery is
  trajectory-neutral; the ONLY lever effect is honest enter + honest take +
  honest eat + honest give.
- SMOKE=1 (proof): ALL GREEN — 25d belongseek s11: dawn rows hot, takes /
  blocks / gives consistent, every counted take/block/give beat-voiced, no
  +0 kcal over-claim.
- SMOKE=1 (sweep): ALL GREEN — 180d belongseek s11 armed: audit consistent.

## RESULTS — sweep: 32 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/trustguard-sweep.json. Per-seed:
evidence/2026-10-15/perseed-trustguard/. Transcripts:
evidence/2026-10-15/trustguard-transcripts/.

### Pooled (16 control / 16 armed)

| side | scholarHunger | hunger | starveDeaths | median | national/16 | table | won | wave4 | wave5 | tgTakes | tgBlocks | tgGives | endNet7below |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 968 | 1068 | 2 | 163d | 12 | 0 | 0 | 7 | 0 | 0 | 0 | 0 | 3 |
| armed | 969 | 1000 | 12 | 181d | 13 | 0 | 0 | 8 | 0 | 149 | 157 | 0 | 1 |

Per-policy: leadcourt armed scholarHunger 393 vs 457 control (0.86x),
starveDeaths 5 vs 1, takes 71, blocks 79; belongseek armed 576 vs 511
(1.13x), starveDeaths 7 vs 1, takes 78, blocks 78.

**PRIMARY: 969/968 = 1.001 > 0.60 → MISS.**

**CO-PRIMARY: blocks/run = 9.8 ≥ 5 ✓ (mechanism fires, not vacuous);
endNet7<-5000 runs = 1/16 ≤ 2 ✓. CO-PRIMARY PASSES.**

**GUARDRAILS:**
- median survival 181d ≥ 153d (control−10) ✓ (armed +18d)
- national 13 ≥ 10 (control−2) ✓ (armed +1/16)
- scholar starvation-deaths 12 ≤ 4 (control+2) ✗ **FAIL** (armed +10)
- new death mode: none (armed-only causes at n≥3: none) ✓
- takes/day ≤ 1 hard: held in the layer (audit: no dupDay violations) ✓

**VERDICT: NO-GO** (§14 — primary miss 1.001 vs 0.60; starvation-death
guardrail blown 12 vs 2). The layer is deleted per kill protocol;
evidence + instruments retained.

### MECHANISM AUTOPSY — the guard is pro-cyclical

The guard FIRED — 157 blocks (9.8/run), the co-primary's "not vacuous"
bar cleared with margin. The trailing-7d ledger is the right quantity to
watch (control runs hit endNet7 < −5000 three times; the armed side's
median endNet7 is 0 vs control's −810). And yet scholar hunger-days are
identical pooled (969 vs 968) while starvation deaths rose 6x (12 vs 2).

The resolution: the guard blocks takes EXACTLY when the scholar is
hungriest. The trailing-7d deficit is deepest after a hungry week of
takes — which is when the projection fires (pack empty, evening meal
uncovered). The guard then refuses the lunch and, because the pack-empty
gate (#169) sits before the guard, there is never honest wild food to
donate: tgGives = 0 across all 32 runs, tgSkipDay = 157 — every single
block ended in "Nothing of your own in the pack to give back — you leave
the pantry alone today." The trust-positive channel, the whole point of
the arm, never fired once in live sims.

So the layer is a take-blocker without a calorie replacement: it removes
the packed lunch on the worst days and replaces it with nothing. The
scholar's chronic hunger is unchanged (the half-ration regime dominates
both sides — the evening meal is trust-throttled regardless), but the
acute safety net is gone on exactly the days it was needed: leadcourt
armed shows the signature (hunger-days DOWN to 0.86x, starvation deaths UP
5 vs 1 — the scholar dies on days that would otherwise have been
hunger-days).

The deeper problem the pilot exposes: the engine's actual trust-tax bar
is on the LIFETIME cumulative net (takeFromPantry, game.js:14579:
`if (net < -5000)` → trust −2 per take). The sweep's endLifeNet shows the
armed scholars finishing at a median −26,158 — every take past the first
weeks costs −2 trust, guard or no guard. The trailing-7d guard manages a
recoverable quantity, but the tax that keeps trust under 30 (and the
half-ration with it) is lifetime-cumulative and never forgives. A guard
that only throttles the trailing week cannot lift a lifetime deficit —
and throttling the week starves the scholar.

The honest next variant (for the backlog, not this run): the fix must
address the LIFETIME ledger or the half-ration trust threshold itself —
give-first (earn the take with a prior give), or the evening meal — not a
trailing-week take-blocker.

### SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — belongseek s22, d7–d14: the starvation loop.**
"You duck into the hall for the stores — pack a lunch before the day
starts." → "The ledger's running red — 3,000 kcal more taken than given
this week. You can't in good conscience take another lunch from the
pantry." → "Nothing of your own in the pack to give back — you leave the
pantry alone today." → "Village meal: +1000 kcal… (Half ration — they
don't trust you yet.)" — eight dawns in a row, the deficit climbing
3,000 → 5,250, then "⚠ STARVING: health and energy falling" on d13. Reads
as a person, not a robot: the voice is coherent, the numbers are honest,
the conscience is legible. But it is a person trapped in a loop the
mechanism built: hungry → ledger red → no lunch → hungrier. The behavior
is the honest signature of the finding — a take-blocker without a calorie
replacement is a starvation machine with good manners.

**Episode 2 — leadcourt s11, d4–d58: the takes that land.**
"You pack Dried beans from the pantry stores before heading out — the
morning's work will burn what the evening bowl can't cover. (packed
lunch)" → "You eat the Foraged food (dried) you packed this morning, out
on the trail — the afternoon's work will need it. (+44 kcal)". The
goinside chain reads as one person's morning; the +0 kcal wart fix holds
(meals of +44/+2/+30, never +0). But every evening ends "(Half ration —
they don't trust you yet.)" — the lunches don't move the trust, because
the lifetime ledger taxes every take −2 and the guard's blocks don't add
a single give.

**Verdict**: the voice passes — blocks, skips, takes, and meals all read
as a person managing their standing. The mechanism fails: the person it
portrays starves politely.

## What the village looked like (assessor's notes)

The villages look the same on both sides by every measure except the
two that matter: scholar hunger-days flat (969 vs 968), starvation deaths
up 6x (12 vs 2). Death is combat-shaped on both sides (combat 299/266,
villager combat 164/172, monster 69/76 — the same profile as the goinside
runs). National reach is unchanged (13/16 vs 12/16), wave4 parity (8 vs
7), the table never, no wins. Nobody thrives distinctively; the courtship
roads diverge as before. The blank this run fills: #329's named mechanism
— a trailing-7d trust-ledger guard with a give-alongside channel — is now
MEASURED. The guard fires (9.8 blocks/run), the give channel is
structurally unreachable behind the pack-empty gate (0 gives in 32 runs),
and the take-blocking is pro-cyclical: it removes food on the hungriest
days. The blank it documents: the binding constraint is the LIFETIME
cumulative ledger (median endLifeNet −26k armed) and the trust<30
half-ration it sustains — no trailing-week throttle can lift it, and
throttling the week starves the scholar. The next #329 variant must answer
the lifetime ledger (give-first? the evening meal itself?), not the week.

## Wall numbers (standing directive)

national 13/16 (armed) vs 12/16 (control); table 0/16 both; won 0/16 both;
wave4 8/16 vs 7/16; wave5 0/16 both; median survival 181d vs 163d.
The scale wall stands: national in most runs, the table never, no wins.

TELEMETRY DEVIATION CHECK: not run by this worker (coordinator step per
the loop body); per-seed evidence glob
evidence/2026-10-15/perseed-trustguard/ is in place for it.

## Metric review (§14)

NO-GO as pre-registered (primary miss 1.001 vs 0.60; starvation-death
guardrail blown 12 vs 2; co-primary passed). No re-scoring. Notes for the
NEXT run:
1. The co-primary's "blocks ≥ 5/run" bar was met (9.8) but measured the
   wrong thing: blocks are not trust-positive acts. A future guard arm
   should pre-register the GIVE rate (or the net-7d recovery rate), not
   the block rate — blocking is the cost, giving is the mechanism.
2. The primary (pooled scholar hunger-days) again shows the goinside
   confounding: leadcourt armed hunger-days FELL (0.86x) while starvation
   deaths ROSE (5 vs 1) — dead scholars don't accumulate hunger-days. For
   arms that move mortality, starvation deaths deserve co-primary weight
   alongside hunger-days.
3. The endNet7/endLifeNet split is now measured: trailing-7d is the
   recoverable quantity, lifetime is the taxed quantity. Any future ledger
   lever must name which one it moves — this arm moved the former and was
   taxed on the latter.
4. Guardrails held except the one that mattered: the arm is safe on
   survival/national/waves and harmful on starvation. The starvation-death
   guardrail did its job — it caught the harm the primary couldn't see.

## Convergence state

**killed-at-pilot** (NO-GO on primary 1.001x vs 0.60x bar; starvation-death
guardrail blown 12 vs 2; co-primary passed — the mechanism fired but the
give channel never did). #329's named mechanism is now MEASURED and
answered: a trailing-7d guard that blocks takes without replacing calories
is pro-cyclical — it starves the scholar on the hungriest days while the
lifetime ledger keeps taxing every take. The trust throttle is a lifetime-
ledger problem; the next variant must answer the lifetime ledger or the
half-ration threshold, not the trailing week.

## Findings filed (not chased — out-of-axis notes for the backlog)

- [open] 2026-10-15 — food-economy — the trustguard arm's pro-cyclical
  take-block: a trailing-7d guard blocks pantry takes exactly when the
  scholar is hungriest (deep deficit follows hungry weeks); with the
  pack-empty gate before the guard, the give-alongside channel never fires
  (0 gives / 32 runs) and the scholar starves (12 vs 2 starvation deaths).
  Any future take-throttle needs a calorie replacement, not just a block
  (sim-trustguard-b evidence).
- [open] 2026-10-15 — food-economy — lifetime vs trailing ledger: the
  engine's trust-tax bar is lifetime-cumulative (takeFromPantry,
  game.js:14579; median endLifeNet −26k) while the freeloader clock judges
  the trailing-7d rate; a lever must name which ledger it moves — moving
  the trailing week does not lift the lifetime tax (sim-trustguard-b
  evidence).
