# MEALBANK — no-take discipline WITH a pack-banking guarantee (loop B food-economy ARM 3, 2026-10-20)

Axis: food-economy. Run: fleshout-loop-b-20261020T1630Z. Arm: sim-mealbank-b.
Answers backlog #182 (PACK-DEPENDENCE FRAGILITY, open): the killed mealonly
arm (loop B ARM 1, 2026-10-14, evidence/2026-10-14/sim-mealonly-b.md) removed
the scholar's pantry top-up ENTIRELY → hungry days +59–75%, the starvation
hatch fired 106x, scholar deaths rose. #182's named next: any future no-take
discipline needs a PACK-BANKING GUARANTEE, not just a take refusal.

The lever (policy-side, scripts/policies/mealbank-b.js, MEALBANK=1,
default-OFF, zero src/js): refuse the scholar's pantry top-up (takeFromPantry
/ takeFromPantryBulk) ONLY when the pack bank ≥ 3 days of burn; otherwise the
take flows through the original verb untouched. The whole mechanism is the
guarantee — the scholar must always have the pack to live on.

## Pre-registered header (docs/MEASUREMENT.md §§9-12, 14 — BINDING)

- **Road**: 8 fresh seeds (82002–82009; banned-list + judged-run clean, inline
  in scripts/sweep-mealbank-b.js; 5411–5426 reserved for the sibling
  sim-retagrot-confirm-b arm) × {leadmealbank, belongmealbank} × {control
  (MEALBANK unset), armed (MEALBANK=1)} = 32 runs. Base-courtship substrate
  (no FEASTSCALE/SEATDRIVE flags) — exactly the parent mealonly road.
- **Det-gate**: 32/32 bit-identical pairs (8 seeds × 2 policies × 2 sides,
  60d) — must pass before the pilot.
- **PRIMARY**: scholar hungry-days (scholar-days with kcal<1200 at the daily
  read — the engine's own scholar hunger line, per finding #277's
  calibration) pooled lead+belong: armed/control ≤ 0.75x.
- **GUARDRAILS** (hard): starvation deaths ≤ control+2 (parent's
  operationalization, reported); median village survival ≥ control−10d (the
  brief's "scholar survival" operationalized as the village median, same as
  the parent pilot, with scholar/player deaths ≤ control+2 as the hard
  scholar-side line); national ≥ control−2; no new death mechanism
  (mechanism-triaged, not the naive string check).
- **Horizon**: 180d death-aware (never a fixed 200d; dead villages stop
  simulating).
- **Verdict form**: pilot GO → confirm named for a later run (NOT run here).
  NO-GO → kill protocol: layer deleted zero-trace, instruments + evidence
  kept.
- **§15 panel note**: env-flag arms cannot register in sweep-compare's
  POLICY_REGISTRY — the pantryguard-b2 precedent applies: the inert-panel
  fallback is documented, no bogus panel is shipped. The before/after runs
  on identical seeds with a shared harness (the panel's job) via the
  paired sweep.

## Canon

- docs/CANON.md read; docs/PRESERVATION.md read (pack-food travel, the
  ladder, "energy is never created" — the arm creates no kcal, it only
  gates a take verb).
- food.js: kcalCap() baseline 2400 "~a day"; fullLine() "fed" — the floor's
  day-of-burn is the engine's own number, not an invented constant.
- No-silent-actions (CANON.md): every refusal voices honestly (MB6).
- Steve 2026-10-11 human-skills/abilities boundary: untouched (no
  grants/unlocks).

## Design calls (numbered, Steve overrulable)

- MB1: floor = 3 × fullLine() — the engine's own day-of-burn, scales with
  metabolic mult (god-build scholars get an honest floor).
- MB2: bank under eat()'s exact predicate (kcalEach>0, units>0,
  edible!==false, not spoiled with eat()'s spoil bonus); meat_human
  excluded — the policy never banks on cannibalism.
- MB3: uniform verb gate — takeFromPantry AND takeFromPantryBulk gate on the
  floor (bulk is inert on this road; the gate keeps them consistent).
- MB4: NO starvation hatch (unlike mealonly) — the floor re-opens takes
  well above the hunger line; a refusal can never create a starvation
  firing condition. The mechanism self-regulates: as the pack drains below
  the floor, takes resume.
- MB5: engine-would-refuse takes pass through to the original verb — the
  policy never silences "The pantry is in the hall. Your hands are not.",
  never counts them as refusals.
- MB6: voice — one deduped line per scholar-day max, day-keyed among 3
  honest variants (never verbatim-adjacent), only on days a take was
  actually refused.
- MB7: wrap installed in the wrapped daily, persistent + idempotent per run
  (retagrot pattern); gate-off = pure delegation.
- MB8: wrappers belongmealbank/belongseek + leadmealbank/leadcourt mirror
  the retagrot lead/belong naming; base = base courtship (no FEASTSCALE
  gate, unlike retagrot).
- MB9: the promise-draw path (competent.js, fires only when pack units < 3)
  passes the floor gate in practice — it fires exactly when the pack is
  thin. If the floor ever refuses one, that's the discipline working as
  designed (a banked scholar doesn't draw) and the promise goes unfulfilled
  honestly (no food moves, no take recorded).
- MB10: MEALBANK unset → pure delegation, byte-identical (proof pins).

## Proof

scripts/test-mealbank-b.js — 56/56 assertions RED→GREEN→RED-REVERSAL on a
live Game, both policies (Usage: `node scripts/test-mealbank-b.js`, no env):
- RED: base.upkeep fires 13 real takeFromPantry calls drawing 2316 kcal
  (the top-up the arm gates is real — without this the proof stops).
- NON-AGGRESSION: 20-day day-hashes byte-identical, wrapped (gate off) vs
  raw base.
- GREEN: banked pack (10400 ≥ 7200 floor) → 2 takes refused, 0 real kcal
  drawn, exactly 1 refusal line voiced, the pack still feeds (Game.eat
  works — the guarantee is real).
- RED-REVERSAL: pack below the floor (1500 < 7200) → take flows (150 kcal),
  refused == 0.
- PASS-THROUGH: away from the hall → engine's own refusal speaks, refused
  == 0, never silenced.
- VOICE: 3 refusals one day → 1 line; next day → a second, different line.
- BANK-HONESTY: bank == 8000 with spoiled/inedible/gear/human-meat in the
  pack; eat() feeds from the bankable pool only (bar 2400/2400), spoiled
  meat discarded as rot, inedible + human meat untouched.

## Det-gate

scripts/detgate-mealbank-b.js (Usage: `node scripts/detgate-mealbank-b.js`):
32/32 IDENTICAL (8 seeds × leadmealbank/belongmealbank × MEALBANK unset/1,
60d each, ~20.7 min). The layer is RNG-free and deterministic on both
sides; the gate-off side proves pure delegation.

## Pilot

32 runs (8 fresh seeds 82002–82009 × {leadmealbank, belongmealbank} ×
{control (MEALBANK unset), armed (MEALBANK=1)}), 180d death-aware,
base-courtship substrate. Per-seed JSONs:
evidence/2026-10-20/perseed-mealbank-b/{armed,control}-{lead,belong}.json.
Analysis: scripts/analyze-mealbank-b.js.

| | armed | control | bar | verdict |
|---|---|---|---|---|
| PRIMARY hungry-days (pooled) | 188 | 188 | ≤0.75x | **1.000x MISS** |
| lead hungry-days | 98 | 98 | — | 1.00x |
| belong hungry-days | 90 | 90 | — | 1.00x |
| starvation deaths | 23 | 23 | ≤25 | PASS (vacuous) |
| median survival | 165d | 165d | ≥155d | PASS (vacuous) |
| national | 12/16 | 12/16 | ≥10 | PASS (vacuous) |
| scholar deaths | 70 | 70 | ≤72 | PASS (vacuous) |
| new death mechanisms | none | — | triaged | PASS |
| mechanism: refused takes | 0 | — | — | **zero engagement** |
| refuse-days / voiced-days | 0 / 0 | — | — | — |

The armed side is identical to control on every seed (same days, same
endReasons, same 481 death causes to the event). The layer never fired once
in 16 armed runs.

**Mechanism autopsy (the kill's root cause):** a probe run (seed 82002, 60d,
armed, wrap confirmed installed in the sweep path) counted 45
takeFromPantry calls; the pack bank at EVERY take was 0 kcal (max 0, mean 0)
against the 7200 floor. competentEat eats the pack first (packEatOnce —
"HONEST EATING: eat from the PACK first, pantry second") and the take loop
fires only when the bar is still low after the pack is exhausted. Takes
happen exactly when the pack is empty — gating the take on "already banked
≥3 days" is structurally inverted: the take IS the banking action. No value
of X fixes this (the bank at take time is 0, not small).

## Sense

Sense slice: leadmealbank s82003 (hungriest armed: 28 hungry-days,
refused=0, voicedDays=0) — evidence/2026-10-20/sense-mealbank-b.txt, 90d
re-run with say-capture.

The scholar reads as a person, and the fiction is honest: daily
"⚠ STARVING: health and energy falling", "Hunger gnaws. The pack is thin —
work the green, haul it back, get it named at camp", half-ration village
meals (+1000–1200 kcal, "they don't trust you yet"), and the engine's own
"The pantry is in the hall. Your hands are not." (the scholar is away from
the hall most days — takes are physically impossible anyway). No robotic
flags, no repeated filler.

But the arm contributed nothing: zero 🎒 refusal lines in 7133 say lines —
the discipline never spoke because it never fired. The beats are identical
to what control shows. The "pack-banking guarantee" is a fiction the sims
never instantiate. Sense verdict: honest person, decorative layer.

## Verdict

**NO-GO at pilot per §14.** Primary missed (1.000x vs ≤0.75x); mechanism
engagement zero. Kill protocol: layer scripts/policies/mealbank-b.js
deleted zero-trace; instruments + evidence + 32 per-seed JSONs kept. The
instruments degrade to INFO-SKIP without the layer (mealonly precedent).
Pilot GO would have named a confirm for a later run — not applicable.

## Village assessment

The 32 villages (both sides identical): national 12/16, wave 4 reached
5/16, wave 5 0/16, table 0/16, wins 0/16, arc4+ 0/16, median survival 165d,
max 180d. The scale wall stands — national without the table, the same
signature as sim-wallcensus-b on the base-courtship substrate (courtship
play reaches national and stops). Death causes (481 both sides): combat
42%, villager combat 27%, expedition 9%, sickness 6%, monster 5%,
starvation 5%, "a wound that wouldn't close" 2%, contest 1%. The villages
that lost scholars did so with food in the pantry — the distribution/trust
failure signature, not scarcity (same as the mealonly/takedisc villages).

## Metric review (§14, mandatory)

- PRIMARY (scholar hungry-days armed/control ≤ 0.75x): MISSED — 1.000x.
  NO-GO per §14. Not re-scored; the layer is killed.
- The primary was well-specified (the engine's own kcal<1200 scholar hunger
  line, per finding #277's calibration). The null is real — and stronger
  than a null: mechanism engagement is exactly 0, so the 1.000x is
  structural, not noise.
- Guardrails (starvation ≤ control+2, median ≥ control−10d, national ≥
  control−2, scholar deaths ≤ control+2, no new mechanisms): all PASS, all
  vacuously (byte-identical trajectories).
- **Structural finding**: the base policy's eating order (competentEat: pack
  first via packEatOnce, pantry second; the take loop only fires when the
  pack is exhausted) already IS a pack-banking guarantee — the scholar
  never double-dips. The brief's imagined "banked scholar topping up the
  pantry" state does not occur in the wild. Backlog #182 answered with this
  lesson.
- **Metric note for the next run** (cookdrive2-b precedent): a take-gate
  lever needs a mechanism-engagement pre-condition (e.g. refused > 0 on
  ≥2/8 seeds in a short instrumented probe) before spending a 32-run pilot.
  The det-gate proves determinism, not engagement.

## Convergence

Arm killed at pilot. Mechanism (floor-gated refusal + honest voice) proven
on fixtures (proof 56/56, det-gate 32/32) but the blank answered
negatively — the take-discipline sub-lane is now exhausted three ways on
the food-economy axis: ledgerpenalty re-route (killed), mealonly blanket
refusal (killed), mealbank floor gate (killed at zero engagement). The
axis's next work is the inflow/production side (the sibling sim-glutprobe-b
diagnostic of this run). State: killed-at-pilot.
