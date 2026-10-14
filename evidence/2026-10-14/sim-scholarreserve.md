# SCHOLAR FOOD RESERVE — diagnostic + lever verdict (scale-onramp r28 ARM 3, 2026-10-14)

Axis: scale-onramp, food-distribution lens. Open blank from r27: SCHOLAR
STARVES WHILE THE PANTRY IS FULL — the s88 probe showed "STARVING: health
and energy falling" daily d63-81 while the pantry held 5–8 fresh days and
village meals fired daily. The engine keeps 2000 kcal in the scholar's pack
at homecoming (game.js:7272, the forager homecoming split). This arm asked:
does a policy-side reserve (the scholar carrying ~2 days instead of 1)
close the blank?

**VERDICT: lever KILLED on diagnostic evidence.** The attribution lands on a
TRUST/LEDGER bind, not reserve depth. Details below.

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **DIAGNOSTIC (phase 1)**: 8-seed courtship road (seeds 11/22/33/44/55/66/77/88
  × leadfeast = leadcourt + FEASTSCALE_R13=1), 180d death-aware. Instrument
  scholar-day kcal flows on hungry/starving days: pack food at dusk/dawn,
  unloaded/kept kcal (say-line capture), eaten kcal, pantry fresh-days, hunger
  signal. Attribute each scholar-starving day (scholar bar min < 500) to a
  named mechanism. **DIAGNOSTIC GO: ≥80% of scholar-starving days attributed
  to a named mechanism, instrument honest on all 8 seeds.**
- **LEVER (phase 2, gated)**: scripts/policies/scholarreserve.js
  (SCHOLARRESERVE=1, default OFF, on leadfeast): dusk top-up to 4000 kcal when
  pack < 3000 AND pantry ≥ 3 fresh-days AND not exiled, via the honest
  ledger-recorded take path (never one take ≥ min(4000, pantryKcal/2)).
- **PRIMARY (lever)**: scholar-starving days ≤ 50% of baseline.
- **GUARDRAILS**: median survival ≥ baseline−5d; national ≥ baseline−2;
  exiled ≤ baseline; theftConfrontation ≤ baseline+1.
- **GO on primary + all guardrails, else KILL per §14.**

## Diagnostic: scholar-day kcal census

Script: `scripts/scholar-reserve-census-20261014.js`. Read-only instrument:
filtered say capture (meal/unload/keep/camp-wild/ration lines only — the full
stream is ~200+/day of chatter; a head-slice would miss everything past day
~4, caught and fixed mid-run), eat/take/donate wraps recording kcal deltas,
sleep wrap for dusk/dawn bar+pack samples, `v.lastPlayerMeal` engine-state
read for the night's meal (say-parse as cross-check).

**Instrument-honesty proof**: `--det 55` — wraps on vs wraps off, same seed:
40/40 engine-state hashes (day, bar, pack, pantry, roster, health at
policy.daily) BYTE-IDENTICAL. The wraps are read-only. 8/8 seeds ran clean,
0 instrument exceptions. Meal capture cross-check: 62/66 days agree
say-vs-engine; 4 disagree by <130 kcal (say prints the rounded share, the
draw is best-fit granular) or are full-ration days where lastPlayerMeal was
re-read as 0 — mechanisms unaffected.

Road outcome (180d death-aware): all 8 runs ended village-lost (d47–d123);
wave reach 2–5 (s22/s44 hit wave 5). Per-run nondeterminism (#113): s88 died
d47 this invocation — the parent's d63-81 s88 trajectory did not reproduce,
so the diagnostic characterizes the road's hunger events, not that exact
trajectory.

## Attribution table

**Starving days (bar min < 500): 2/2 attributed = 100% ≥ 80% GO.**

| seed/day | scholar | minBar | mechanism | story |
|---|---|---|---|---|
| s44 d44 | Minh | 79 | burn-over-reserve (+half-ration) | mid-day feastburn/combat dip to 79; meal was half-ration (1000); took 1384 from pantry, ate 2244, recovered to 2313 by dusk |
| s66 d62 | Cheryl | 0 | meal-missed | pantry was 0 (fresh 0 — hollow context); no meal possible; pack 1990→630, ate 1313, recovered to 2390 |

**Hungry days (500 ≤ bar min < 1200): 60/64 attributed = 93.8%.**

| mechanism | days | share |
|---|---|---|
| half-ration | 57 | 89.1% |
| burn-over-reserve:heavy-day | 2 | 3.1% |
| away-no-pantry | 1 | 1.6% |
| dawn-dip-recovered (woke ~1000-1190, ate to full by dusk — arguably not a real hunger event) | 4 | 6.2% |

Half-ration days: n=58 (incl. starving), range d5–d46, median d11. The
scholar's trust sits < 30, so the village meal is 1000–1300 instead of
2000–2200; the bar sits ~1000–1350 — chronically under the engine's 1200
"Hunger gnaws" line — while the pantry holds 20–50k (1–2.6 village-days,
not actually rich).

## The causal chain (the named finding)

The scholar's early-game hunger is a **ledger-asymmetry bind**, not a
reserve-depth bind:

1. The scholar eats from the communal pantry via takeFromPantry (~60
   calls/day early, s22 d1–11) and the nightly village meal. Every take
   writes `v.takes[vid]` (cumulative gross, no time decay); the meal does
   too. With net (gives−takes) < −5000, **every takeFromPantry costs −2
   trust** (the old cumulative-ledger penalty — the r8/r9 rate-based
   fair-share repairs did not replace this path).
2. The scholar's contributions — the homecoming unload ("unload 1260 kcal
   into Haven's pantry") — **never write `v.gives[vid]`** (game.js
   ~7344–7352: givenKcal is computed for the say line and never recorded;
   no recordGiveHist call). The ledger is blind to the scholar feeding the
   village.
3. Measured 30d: s11 takes=42148/gives=0/trust=0; s22 takes=31741/gives=0
   (1260 unloaded, unrecorded)/trust=34. Trust craters → meals halve →
   bar sits ~1000–1350 → "Hunger gnaws" daily.
4. competentEat compensates with MORE takes → more −2 hits → trust pinned
   at 0. Vicious cycle. It breaks only when trust recovers through other
   channels (~d46+; s22's meals went full-ration by d47+).

The reserve-depth mechanism (burn-over-reserve) is real but minor: 1 of 2
starving days, 2 of 64 hungry days (4.5%). The pantry on this road holds
1–2.6 fresh-days on hunger days — the top-up's ≥3-fresh-days gate would
rarely fire.

## Lever decision: KILLED

The diagnostic does not support the reserve-depth lever:

- The dominant mechanism (89% of hungry days) is the trust/half-ration
  bind — a social/ledger system, not reserve depth. The brief: "do NOT
  build a policy lever over an engine bind."
- The top-up's takes are ledger-recorded by design — each one deepens the
  very takes-hole that pins trust at 0. The lever would feed the disease.
- The ≥3-fresh-days gate rarely fires on this road (observed 1–2.6).
- The pre-registered primary (starving days ≤ 50% of baseline=2) is
  unmeasurable noise at n=2 — and the one starving day the lever could
  address (s44 d44) had fresh-days 2.3 the day before, so the gate
  wouldn't even have fired.
- Killed arms leave no trace: no policy file was created; the census
  script + this evidence remain.

What WOULD address the bind (filed, not built — out of this arm's
policy-only scope): an engine fix recording the homecoming unload as
`v.gives[vid]` (+recordGiveHist), and/or routing the per-take trust
penalty through the r8/r9 rate-based ledger instead of cumulative net.
→ sim-findings entries below.

## Sense-test (SENSE-TESTING LAW)

Read the d1–14 (s11) hunger beats. They read as people, and the fiction
names the reason honestly: "Village meal: +1128 kcal… (Half ration — they
don't trust you yet.)" beside "Hunger gnaws. The pack is thin — work the
green, haul it back, get it named at camp." The village IS telling the
scholar why they're eating half. The beats are not the blank — the ledger
mechanics underneath are. No robotic flags in this slice.

## Village assessment

- **s11** (lost d52, wave 2): the trust-crater run. Scholar took 42k in 30d,
  gave 0 (zero unloads — small hauls, all kept), trust 0. Chronically hungry
  d5–46 on half rations. Who thrived: nobody; the village lost d52.
- **s22** (lost d123, wave 5): the long run. Trust recovered to 34 by d30
  (mechanism unclear — not unloads, which don't record), meals went full by
  d47; late hunger was burn-over-reserve heavy days (d119: minBar 677,
  pantry nearly empty at 0.2 fresh-days). Wave 5 reached.
- **s44** (lost d123, wave 5): the feastburn-dip run. s44 d44's starving dip
  (bar 79 mid-day) is the reserve-depth mechanism incarnate — but one day
  in 123.
- **s66** (lost d62, wave 4): the hollow-adjacent run. d62's starving day had
  pantry=0 — the village was already out of food; no reserve policy fixes
  an empty pantry.
- **s33/s55/s77/s88**: pre-wall attrition (lost d47–117, waves 1–4).

## Reachability verdict

Waves 1–5 reachable on this road (2/8 hit wave 5: s22, s44). No national,
no table, no wins on any seed — all 8 village-lost by d123. The scale wall
stands: villages die of the combat bleed + hollow before the on-ramp.

## Blanks filled / documented

- **r27 open blank "SCHOLAR STARVES WHILE THE PANTRY IS FULL" — DIAGNOSED,
  reframed.** On the measured road the scholar is chronically *hungry*
  (not starving) on half-rations while the pantry holds 1–2.6 village-days.
  Named mechanism: ledger-asymmetry → trust crater → half-ration meals
  (89% of hungry days); reserve-depth (burn-over-reserve) covers 4.5%.
  The parent's d63-81 s88 trajectory did not reproduce this invocation
  (#113 noise) — the finding characterizes the road, flagged honestly.
- **New blank #1 (engine, steve-call adjacent): LEDGER-BLIND UNLOADS** —
  the homecoming forager split (game.js ~7344) never records v.gives[vid];
  the scholar's largest food contribution is invisible to the trust
  machinery. → sim-findings.
- **New blank #2 (lever-5): CUMULATIVE TAKE PENALTY vs RATE LEDGER** —
  takeFromPantry's −2 trust per take still keys on cumulative net < −5000
  while r8/r9 built the rate-based takeHist/giveHist; the two ledgers
  disagree and the old one drives. → sim-findings.
- **Future-arm seed (policy-side, pre-registerable): TAKE-DISCIPLINE** —
  a meal-only/never-take policy variant to test whether breaking the
  take→trust-crater cycle recovers trust and ends half-ration hunger.
  Not built here (would be mid-run redesign per §14).

## Metric review (§14, mandatory)

- Diagnostic GO (≥80% starving-day attribution): MET — 100% starving,
  93.8% hungry. No re-scoring.
- Lever primary (starving ≤ 50% of baseline): NOT MEASURED — lever killed
  at the diagnostic gate per the brief's own kill condition ("do NOT build
  a policy lever over an engine bind"). This is not a metric miss; the
  gate fired before measurement.
- Metric concern for future arms: scholar-starving days are too rare on
  this road (2/8 seeds) to power a before/after — pre-register hungry-day
  mechanisms or a richer road next time. Proposed for the NEXT run, not
  this one.
- Convergence report: diagnostic — census delivered, blank reframed,
  lever killed on evidence. Axis scale-onramp: still blocked (0/8 national).
