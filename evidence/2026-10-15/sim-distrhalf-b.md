# sim-distrhalf-b — distribution-starvation instrument (loop B ARM 3, 2026-10-15)

Claims sim-findings #272 (TRUST-THROTTLED HALF-RATIONS: VILLAGERS GO HUNGRY WITH A FULL PANTRY).
Instrument-only: zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #272 found a village voting half-rations while the pantry held
  ~24–34 fresh-days, the meal beat naming the cause ("Half ration — they
  don't trust you yet"). Attribute EVERY hunger-day on the courtship
  substrate to a named channel:
  (a) empty-pantry (fresh-days < 2 at dawn),
  (b) trust-throttled half-ration (pantry deep ≥ 2 fresh-days AND the meal
      beat names a half-ration or the ration vote is active AND trust < 30,
      the engine's real gate — game.js villageMeal: `trust < 30 ? 1000 : ...`,
      beat `trust < 30 ? ' (Half ration — they don't trust you yet.)' : ''`),
  (c) other-named with sub-labels (exile-withheld, away-wild-no-pantry,
      draw-order-exhausted, floor1-crumbs, spoiled-insufficient,
      meal-served-still-starved, ...).
- **Populations**: villagers (sharcensus rows: ate < 0.6×need, the engine's
  starvation branch) AND the scholar (the engine's own scholar-starvation
  signal: overnight resolveDay STARVING warning). The sharcensus skips the
  scholar (player-parity) — that skip is exactly why #272's episode never
  registered.
- **DIAGNOSTIC GO**: ≥ 90% of villager hunger-days attributed to a NAMED
  channel (a/b/c-with-sub-label), and channel (b) quantified in villager-days
  and share of total hunger-days.
- **MISS** → instrument repaired, evidence only.
- **Horizon**: 180d death-aware (dead villages stop +10d tail).
- **Seeds**: 11/22/33/44/55/66/77/88. **Policies**: leadcourt, belongseek
  (the courtship substrate). 16 runs, control substrate only — diagnostic,
  no armed side.
- **Det-gate**: instrumented vs pristine byte-identical 60d × 8 seeds ×
  2 policies BEFORE measurement spend (test PART C).
- **SMOKE**: SMOKE=1 instrument-honesty (meals/nights/dawns captured,
  0 unattributed, 0 beat-gate mismatches).
- **Sense-test** (Steve's law): 2–3 half-ration episodes read in the
  transcripts — does the fiction say why, do villagers react, does the
  trust number move the next day?
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented.

## PROOF (before measurement)

scripts/test-distrhalf-20261015.js — ALL GREEN:
- PART A (9/9): classifier fixtures — (a) villager empty-pantry; (b) scholar
  deep-pantry + half-ration beat + trust<30 (and via ration vote); (b) refused
  when trust ≥ 30; (c) draw-order-exhausted, floor1-crumbs, low-trust villager
  on a half-ration day is NOT (b) (design assertion: the engine never
  trust-gates a villager's draw), meal-served-still-starved, exile-withheld.
- PART B (live engine, constructed states only): B1 — real villageMeal at
  trust=10, deep pantry → real 'Half ration' beat, taken in the half-share
  regime, beat text == engine gate (0 mismatches), real overnight STARVING →
  b/trust-throttled-half-ration. B2 — real villagerMealDay on a bare pantry →
  a/empty-pantry at freshDaysDawn<2, c/draw-order-exhausted at 25. B3 — mixed
  day: scholar=b + villager=c, 0 unattributed.
- PART C det-gate: 16/16 byte-identical (60d × 8 seeds × leadcourt/belongseek,
  pristine vs instrumented per-day state hashes).
- SMOKE=1: policy.daily fired, meals/nights/dawns captured, 0 unattributed,
  0 beat-gate mismatches.

## RESULTS — sweep: 16 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/distrhalf-sweep.json. Per-seed:
evidence/2026-10-15/perseed-distrhalf/. Transcripts:
evidence/2026-10-15/distrhalf-transcripts/.

### Channel attribution (pooled)

| channel | days | share of 1594 |
|---|---|---|
| (a) empty-pantry | 214 | 13.4% |
| (b) trust-throttled half-ration | 551 | 34.6% |
| (c) other-named | 829 | 52.0% |

By label: empty-pantry 214, trust-throttled-half-ration 551,
meal-served-still-starved 622, exile-withheld 142, away-wild-no-pantry 60,
floor1-crumbs 2, away-pack-short 3. **Unattributed: 0. Named share: 100%.**

By subject × channel:
- scholar: a=173, b=551, c=824 (622 meal-served-still-starved / 142 exile-withheld / 60 away-wild-no-pantry)
- villager: a=41, c=5 (3 away-pack-short / 2 floor1-crumbs)
- villager (b): **0** — by engine design, not by luck: villager draws are
  first-come-first-served in roster order; trust enters only through surplus
  sharing (`gave = (produced - need) * trustFactor`). The instrument evaluates
  the (b) gate for villagers and it never fires.

Per policy: leadcourt 719 hunger-days (a=74 b=309 c=336); belongseek 875
(a=140 b=242 c=493). Zero unattributed on both.

### GO verdict: GO
- Named attribution 100.0% ≥ 90% ✓
- Channel (b) quantified: **551 villager-days, 34.6% of all hunger-days** ✓
  (fresh-days on (b) days: min 2.10, p10 5.95, median 22.6, max 73.7 — the
  throttle fires on pantries holding up to 73 fresh-days; cleanly above the
  2.0 boundary, no boundary straddling).
- The (b) disjunct "(or the ration state is half)" had **zero instances** on
  this substrate: no ration-vote episode in 16 runs (the relief 'rations'
  option never fired under these policies). All 551 (b) days are the trust<30
  gate.

### The census undercount, quantified
The old census (villager rows only) would have seen **46 of 1594 hunger-days
(2.9%)**. The scholar is 1548/1594 (97.1%). Of the 551 (b) days, 501 had the
scholar's meal < 0.6×need and 50 had meal ≥ 0.6×need — those 50 are invisible
even to a scholar-inclusive census, exactly the undercount #272 suspected.

### Wall numbers (standing directive)
national 8/16, table 1/16 (leadcourt s66, 180d survived, wave 4, global),
won 0/16, wave4 4/16, wave5 0/16, maxWave 4, median survival 147d, max 182d.
Death causes: combat 72, villager combat 22, monster 18, "a wound that
wouldn't close" 14, starvation 16, sickness 10, contest 7, lockjaw 2,
Nevermore 2, expedition 1. The scale wall stands: national in half the runs,
the table once, no wins.

## SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — belongseek s77, d1–d25: the 25-day half-ration grind.**
The beat fires every single night, naming the cause verbatim: "Village meal:
+1000 kcal, +1L water from the communal pantry. (Half ration — they don't
trust you yet.)" The fiction says why, nightly, no ambiguity. Villagers react
in-kind: "Why should I listen to you?" / "Ask someone who trusts you."
(Trust too low.) — the same low trust gates social verbs, so the half-ration
reads as one facet of being a distrusted newcomer, not a food bug. Does the
trust number move? Yes, slowly: 15 → 23 (d9, "mediator: village trust +10")
→ 26 → 29 across three weeks — the throttle is STICKY, trust gains from the
work systems are +1–2/day (cf. sim-trustdelta-b). It lifts ~d26 (trust 60 by
d28 — a large trust event), and the beat stops. Coherent: the fiction's
promise ("they don't trust you yet") resolves through play.

**Episode 2 — belongseek s55, d30–d42+: trust collapse → exile.**
Raids hammer trust ("Trust -10", Stonebridge/Thornfield, d33–36). At trust 0
the village exiles the scholar on d34; every night after: "The pantry is
closed to you." — 88 consecutive nights (d34–d122), STARVING firing nightly.
Cause → effect is legible: the village told you why (raids, trust 0), told
you the consequence (exile), and the bowl stays closed. Nothing robotic.

**Episode 3 — leadcourt s88, d36: the +5900 kcal starvation.**
"Village meal: +5900 kcal" — and the scholar STARVES that night anyway.
The probe shows why: the ceil-draw took a whole 5900-kcal piece (want was
2000; "no fractionating" ceil), the 2400 bank cap banked only 2400 (3500
vanished silently — no beat), daytime burned 270, overnight need 2200 →
2130 − 2200 < 0. A player reading "+5900 kcal" then "STARVING" would rightly
feel lied to: the cap waste is silent. Filed to sim-findings (BANK-CAP WASTE).
The attribution (c/meal-served-still-starved) is honest; the fiction around
the cap is not.

**Correction to an earlier claim**: the voted rationing is NOT fiction-only.
safetynets.js wraps villagerMealDay (halves kcalPerDay → half draws while the
vote holds) and villageMeal (claws back half the scholar's meal into the
pantry: "You eat half and put the rest back in the bins"). My first read
(grepping game.js only) missed the wrapper. It simply never fired on this
substrate's 16 runs.

## What the village looked like (assessor's notes)

On the courtship roads the scholar is the hungriest mouth in Haven: 1548 of
1594 hunger-days. Villagers almost never starve (46) — the village feeds
itself; it is the bearer <redacted> goes hungry, first from distrust (551
days of half-rations, pantries groaning at median 22 fresh-days), then — once
trusted — from a body that outspends its bank (622 days: full 2000+ meals,
still STARVING; the 2400 cap sits below an active day's ~4900 total burn).
Exile (142) and wild-camping (60) are the other scholar hungers. The village
itself is legible throughout: it says why the bowl is half ("they don't trust
you yet"), says when the bowl is closed ("The pantry is closed to you"), and
releases the throttle when trust is earned. The distribution story of #272 is
real, measured, and scholar-side: the census saw 2.9% of it.

## Metric review (§14)

GO met as pre-registered. Notes for the NEXT run:
1. "Villager hunger-day" conflates two populations with different engines
   (census-branch villagers vs bank-based scholar); the scholar is 97%.
   Pre-register them as separate primaries next time.
2. The (b) ration-vote disjunct needs a crisis-relief-driving policy to get
   any instances — zero on courtship roads.
3. Fresh-days < 2 boundary: early-game burnHistory fallback makes d1 noisy
   (1.97 → (a)); consider a small epsilon or dawn+dusk pair.
4. No metric changes mid-run were made; none needed.

## Convergence state
Instrument: **converged** (landed). Axis finding: the trust-throttle channel
is now quantified (551/1594 = 34.6%, all scholar-side, median 22.6
fresh-days on the shelves). The adjacent scholar-daily-deficit and bank-cap
waste findings are filed to sim-findings for lever design. Sim-findings #272:
**fixed** by this instrument (marked; coordinator confirms on landing).
