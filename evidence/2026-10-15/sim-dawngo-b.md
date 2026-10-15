# sim-dawngo-b — DAWN GO-INSIDE + REACTIVE pantry draw (loop B, axis food-economy, 2026-10-15)

Claims sim-findings #328's named next (a): "dawn pack-lunch with a REAL go-inside verb before the draw."
Claims #314's pantry-draw side (the killed middaymeal/trustguard series) — the leanest variant the series allows.

Policy-side lever, zero src/js changes. run_id: fleshout-b-20261015T2022Z.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #314 measured ~97% of hunger-days are the scholar's. The killed series:
  dawnmeal (0.869x vs 0.60 — the inside/outside pantry wall: 415/475 dawn draws refused at
  havenStoresAccess()==='none', #328), goinside (1.158x — 420 takes taxed the trust ledger:
  takes feed v.takes[vid], net<−5000 drops trust, half-rations persist, #329), trustguard
  (1.001x, pro-cyclical take-blocking: starvation 12 vs 2). The binding constraint is the
  TRUST THROTTLE (lifetime ledger, median endNet −26k), not the pantry door. This arm asks
  whether the LEANEST variant — real go-inside verb + strictly reactive emergency draw —
  moves scholar hunger-days at all: no EWMA projection, no packed-lunch mid-day chain
  (killed twice on noise-scale), no take-blocking, no habit. Emergency only.
- **Lever**: scripts/policies/dawngo.js (gate DAWNGO=1, default off), wrapping
  leadcourt/belongseek, composed with the FEASTSCALE_R13=1 courtship substrate (identical
  both sides). At dawn (dayPart==0), BEFORE the base upkeep, IF the pack holds no edible
  food (#169 pre-fill ban — never pre-fill a fed pack) AND the scholar is GENUINELY
  hungry (kcal < 0.5*kcalCap — below the base policy's own 0.85*cap pantry fallback,
  i.e. a sub-base emergency the base itself would not reach) AND no take happened today
  yet: FIRST the REAL Game.enterBuilding() when havenStoresAccess()==='none' and the
  scholar is on the haven tile (engine guards honored as-is — mid-fight, already-inside,
  tent rooms, off-haven all refuse honestly and are counted/voiced; no exit-after-draw
  because travelTo clears insideHaven on arrival), THEN ONE honest Game.takeFromPantry
  with the competent policy's scoring (cooked/smoked/preserved/rendered first, meat_human
  never, raw meat last), eaten IMMEDIATELY via honest Game.eat() — no packed lunch,
  no mid-day machinery. The enter sits BEHIND the draw gates: never go inside without
  drawing. One take/day, hard. No silent branches: refusals, the inside move, and the
  take/eat all voice honestly (item names via Game.itemDisplayName, knowledge-gated).
- **BASELINE REALITY (read from src/js during build)**: the base competent upkeep
  ALREADY emergency-eats from the pantry at dawn (competentEat: pack first, pantry
  second — takes and eats immediately when kcal < 0.85*cap). The layer's novel verb
  chain is ENTER → draw+eat at the sub-base emergency line the base cannot reach
  outside the hall. The control arm's pantry fallback goes through the same honest
  verb; the armed arm steps inside first when access is 'none'.
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.75x control (pooled).
  (Deliberately looser than the series' 0.60x: the arm is an emergency-only handful
  of takes; 0.75x is the honest claim for a strict-reactivity lever.)
- **GUARDRAILS**: scholar starvation-deaths <= control+2; national armed >=
  control-2/16; no new death mode (n>=3 armed-only).
- **MEDIAN SURVIVAL: REPORT-ONLY** (fragile per metric review — record it, never
  score it; the goinside run proved pooled hunger-days confound with survival).
- **FREQUENCY BOUND (#169 boundary)**: armed takes/run expected ~single digits
  (emergency-only). <=1 take/day hard in the layer.
- **GO** → commit the layer for landing. **MISS** → KILLED AT PILOT: layer deleted
  per kill protocol, evidence + instruments only.
- **Horizon**: 180d death-aware (+10d tail). **Seeds**: 109/218/327/436/545/654/763/872
  x {leadcourt, belongseek} x {control, armed} = 32 runs, OWN control in the SAME
  sweep (never an inherited baseline — #247 CONTROL BASELINE DRIFT). This is the
  PILOT (8 seeds); a confirm (12–16) only follows a GO.
- **Det-gate**: scripts/test-dawngo-20261015.js PART C green before sweep spend.
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): 2-3 dawn episodes read in the transcripts — the
  enter + draw + eat must read as a hungry person ducking inside for a bite,
  not a robot or a pantry raid.
- **Canon**: docs/CANON.md read; docs/PRESERVATION.md and docs/DIRECTIVES.md read.
  NO food-distribution canon doc exists — stated here per the canon rule; no
  canon invented. All mechanics read from src/js as-is (cited in the layer header).

## PROOF (before measurement)

scripts/test-dawngo-20261015.js — ALL GREEN:
- PART A (13 fixtures): gate off returns base itself (A1) / named exports are
  the base policies (A2); gate on wraps (A3, base untouched); fires at dawn
  outside → ENTERS via honest enterBuilding (A4: insideHaven true, _dgEnters 1,
  pantry −1, kcal 1000→1400 eaten immediately, "eat it here" beat, _dgTakeDay
  set); no double-enter when already inside (A4b); silent when the pack has
  food — #169 pre-fill ban, pantry untouched, no enter (A5); silent when
  kcal >= 0.5*cap (A6); silent on dayParts 1/2/3 (A7); one take/day hard (A8);
  honest refusal honored + counted, never retried (A9); pantry empty →
  no-gain (A10); scoring cooked-plant first / human meat never / raw meat
  last (A11); mid-fight → the engine guard is honored, no enter, counted
  (A12); off the haven tile → no enter, honest refusal counted (A13).
  (Fixture correction during build, honest: A9 first asserted the layer's
  take-detection via the verb's return — the engine returns null on success
  AND refusal. Fixed in the LAYER, not the test: success is measured as
  pantry-units-before > pantry-units-after.)
- PART B (live engine, REAL RED): B1 RED — the base's honest takeFromPantry
  at dawn, scholar outside on the haven tile → "The pantry is in the hall.
  Your hands are not." (the dawnmeal kill, reproduced live). B2 RED — the
  layer at the same state → enterBuilding fires (insideHaven true), then ONE
  unit taken AND eaten (pantry 235→234, kcal 1000→1200, _dgTakes 1,
  _dgEnters 1). B2b RED — the base's dawn upkeep OUTSIDE draws nothing and
  never enters (the access wall bites the base too). B3 RED — silent at dawn
  when kcal >= 0.5*cap (live). B4 — silent at dawn when the pack has food
  (live).
- PART C det-gate: 16/16 byte-identical (30d x 8 seeds x 2 policies,
  base vs wrapped+pack-seeder). The pack seeder keeps the pack full so the
  draw gate — and with it the enter gate, which sits behind the draw
  gates — can never pass; dawn log rows ran hot (27–30/run) with zero takes
  and zero enters — the trigger machinery is trajectory-neutral; the ONLY
  lever effect is honest enter + honest take + honest eat.
- SMOKE=1 (proof): ALL GREEN — 25d belongseek s109: 25 dawn rows, 2 triggers,
  2 takes, 2 enters, every take/enter beat-voiced.
- SMOKE=1 (sweep): ALL GREEN — 180d belongseek s109 armed: 180 dawn rows,
  11 takes, 13 enters, 2,450 kcal; audit consistent.

## RESULTS — sweep: 32 runs, 180d death-aware, FEASTSCALE_R13=1 both sides

Sweep JSON: evidence/2026-10-15/dawngo-sweep.json. Per-seed:
evidence/2026-10-15/perseed-dawngo/. Transcripts:
evidence/2026-10-15/dawngo-transcripts/.

### Pooled (16 control / 16 armed)

| side | scholarHunger | hunger | starveDeaths | median | national/16 | table | won | wave4 | wave5 | dgTakes | dgKcal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 874 | 896 | 4 | 120d | 10 | 13 | 0 | 14 | 6 | 0 | 0 |
| armed | 753 | 796 | 9 | 120d | 12 | 13 | 0 | 14 | 8 | 89 | 20,991 |

Armed audit: dgTriggers 89, dgEnters 69, dgTakes 89 (5.6/run — strictly
reactive vs goinside's 26.3), dgTakeDays 89, dgNoGain 38, dgRefused 11.

Per-policy: leadcourt armed scholarHunger 360 vs 417 control (0.863),
starveDeaths 5 vs 2, median 119d vs 121d, national 6/8 vs 5/8, takes 39;
belongseek armed 393 vs 457 (0.860), starveDeaths 4 vs 2, median 120d vs
120d, national 6/8 vs 5/8, takes 50. Armed hunger lower on 11/16 seeds.

**PRIMARY: 753/874 = 0.862 > 0.75 → MISS.**

**GUARDRAILS:**
- scholar starvation-deaths 9 > 4+2=6 → **MISS** (8 of the 9 armed
  starvation deaths are on ONE seed, s109 — see autopsy)
- national 12 ≥ 8 (control−2) ✓ (armed +2/16)
- new death mode: none (armed-only causes at n≥3: none — "Dustboar",
  "the night" all n=1) ✓
- median survival 120d = 120d (REPORT-ONLY, not scored)

**VERDICT: NO-GO** (§14 — primary miss 0.862 vs 0.75 bar; starvation
guardrail miss). The layer is deleted per kill protocol; evidence +
instruments retained.

### MECHANISM AUTOPSY — why 20,991 kcal moved hunger 0.862x and starvation rose

1. **The trust-throttle channel moved — the regime didn't.** The distrhalf
   channels (a=empty-pantry, b=trust-throttled half-ration, c=other-named):
   control 164/379/353 → armed 155/252/389. The arm DID relieve
   trust-throttled hunger-days (b: 379→252, −33%). But "other-named" rose
   and the total only fell 896→796. One 150–400 kcal unit against a ~1000+
   kcal daily shortfall treats the morning, not the regime: the evening
   bowl stays "Half ration — they don't trust you yet." every single day
   in the transcripts, and STARVING fires most mornings anyway.
2. **Famine-seed pro-cyclicality (the starvation miss).** Seed s109: the
   pantry ran dry by d33 ("⚠ Haven's pantry is empty. Day 1 of hunger.");
   the scholar had taken 11 × ~200 kcal ≈ 2,200 kcal from that pantry in
   35 days — the dawn takes pulled the empty-pantry day forward on a seed
   already collapsing. Armed village-lost at d35 (both policies) vs
   control d55/d141; 8 of the 9 armed starvation deaths are on s109
   (control s109: 2). The reactive draw is pro-cyclical on famine seeds:
   it feeds the scholar from a commons that can't afford it, and the takes
   tax the trust ledger (#329's mechanism at 1/5 the take rate).
   Whether s109 is noise or harm is undecidable on n=1 seed — the
   guardrail binds as pre-registered; the miss stands.
3. **38 no-gains: enters into an empty pantry.** The layer enters before
   scoring the pantry — 38 times the scholar ducked in and found nothing
   takeable. Honest, but wasted motion; a presence-gated variant would
   score the pantry BEFORE entering. (Not chased — the arm is killed.)
4. **Reach held.** wave4 14/16 both, wave5 8 vs 6 armed, table 13/16 both
   (the FEASTSCALE_R13 substrate), national 12 vs 10 armed. The arm is
   reach-positive and hunger-positive; it is starvation-negative on the
   famine margin — exactly the wrong margin for a hunger lever.

### SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — belongseek s654, d7: the emergency draw.**
"You duck into the hall for the stores — the evening bowl's been thin,
and the trail won't wait." → "You take the Dried beans from the pantry
stores and eat it here — better than an empty belly. (+150 kcal)".
Reads as a hungry person, not a robot or a raid: it names the why, it's
one unit, the item name is knowledge-gated.

**Episode 2 — belongseek s654, d10: the unidentified name.**
"You take the Foraged food (dried) from the pantry stores and eat it here
— better than an empty belly. (+400 kcal)". The display name degrades
honestly when the scholar doesn't know the item — the knowledge gate
holds inside the layer's voice.

**Episode 3 — leadcourt s109, d33–35: the famine.**
"⚠ Haven's pantry is empty. Day 1 of hunger." → "You duck into the hall
for the stores…" (no take — the no-gain path) → "Kai went to sleep
hungry. Nobody says anything." The layer's voice stays honest when
there's nothing to take; the village's hunger beats name individuals.

**Verdict**: the voice passes — enter, draw, eat, and the empty-pantry
no-gain all read as one hungry person's morning. The behavior is the
honest signature of the finding: an emergency draw that treats the
morning while the regime starves the village.

**Voice wart found (filed, not chased):** when the scholar is outside the
hall at dawn and kcal < 0.85*cap, the BASE policy's pantry fallback
guard-loop voices "The pantry is in the hall. Your hands are not." ~40–50
times in a single dawn (d4 transcripts). Honest but noisy — the base
should refuse once per dawn, not per guard iteration. Filed to
sim-findings.md.

## What the village looked like (assessor's notes)

The village looks like a half-ration regime under chronic trust deficit —
on both sides. The evening bowl reads "Half ration — they don't trust
you yet." nearly every day; STARVING fires most mornings; the scholar
ducks into the hall a few dawns a week for one honest unit (150–400 kcal)
and it doesn't change the shape of the day. Villagers die in combat first
(combat 330–335, villager combat 105–122, monster ~80–100 — the same
combat-shaped profile both sides), then to the pantry running dry on bad
seeds. Nobody thrives distinctively; the courtship roads diverge as before
(leadcourt reaches wave5/global more; belongseek survives the same).
The FEASTSCALE_R13 substrate did its job: table 13/16 both sides, national
10–12/16 — the scale wall's lower rungs are reachable; the table itself
never converts (0 wins). The blank this run fills: the #314 pantry-draw
side is now measured at THREE strictness levels — dawnmeal 0.869x,
goinside 1.158x, dawngo 0.862x. The draw side cannot beat the trust
throttle. The blank it documents: remaining #314 answers are design-side
(bank-cap-vs-need: cap 2400 < an active day's ~4900 burn; the evening meal
itself) or trust-ledger-side — not pantry-draw-side. A fourth draw
variant would be churn.

**Villager people-check (sampled):** the capture window covered hunger
beats + layer lines only, so no dialogue transcripts were in scope; the
sampled lines show named villagers with individual hunger beats ("Kai went
to sleep hungry. Nobody says anything."), gossip with distortion ("A
traveler swears Thornfield… is feasting — a whole elk, they say. (They're
wrong. Thornfield is starving.)"), and event choices with costs. Nothing
robotic or repeated in the sample; no flags.

## Wall numbers (standing directive)

national 12/16 (armed) vs 10/16 (control); table 13/16 both; won 0/16 both;
wave4 14/16 both; wave5 8/16 vs 6/16; median survival 120d both.
The scale wall stands: national in most runs, the table reached but never
converted, no wins — the FEASTSCALE_R13 substrate holds the lower rungs.

TELEMETRY DEVIATION CHECK: not run by this worker (coordinator step per
the loop body); per-seed evidence glob
evidence/2026-10-15/perseed-dawngo/ is in place for it.

## Metric review (§14)

NO-GO as pre-registered (primary miss 0.862 vs 0.75; starvation guardrail
miss 9 vs ≤6; national + no-new-mode pass; median 120=120 report-only).
No re-scoring. Notes for the NEXT run:
1. The starvation guardrail miss concentrates on ONE seed (s109: 8/9
   armed starvation deaths; the arm's takes plausibly pulled the
   pantry-empty day forward). Pre-registering a seed-concentration rule
   (e.g. "guardrail evaluated excluding a single-seed collapse, flagged
   not scored") would be friendlier — but this run is judged as
   pre-registered, and the famine-seed mechanism is real enough to respect.
2. The median report-only discipline held and was vindicated: 120=120, no
   survival confound — the 0.862 is a clean read, unlike goinside's.
3. Frequency landed where designed: 5.6 takes/run, strictly reactive —
   the #169 spirit held at a quarter of goinside's rate. Reactivity was
   not the problem; the regime was.
4. The distrhalf channel split (b: 379→252) is the most encouraging
   sub-signal of the #314 series — the arm relieves trust-throttled
   hunger-days specifically. If a future trust-ledger-side arm needs a
   scholar-side companion, this mechanism (not this layer) is the shape.

## Convergence state

**killed-at-pilot** (NO-GO on primary 0.862x vs 0.75x bar and the
starvation guardrail 9 vs ≤6; national + no-new-mode green). The #314
pantry-draw side is now measured at three strictness levels and cannot
beat the trust throttle — the next #314 work must be design-side
(bank-cap-vs-need, the evening meal) or trust-ledger-side, never a fourth
draw variant.

## Findings filed (not chased — out-of-axis notes for the backlog)

- [open] 2026-10-15 — food/policy — DAWNGO KILLED AT PILOT: the leanest
  #314 pantry-draw variant (real go-inside + strictly reactive dawn draw,
  no EWMA, no mid-day chain; 89 takes, 5.6/run, 20,991 kcal) moved scholar
  hunger 0.862x vs the 0.75 bar; the trust-throttle channel fell (b:
  379→252) but the half-ration regime persisted; famine-seed
  pro-cyclicality (s109: takes pulled the pantry-empty day forward,
  village-lost d35 vs d55/d141, 8/9 armed starvation deaths on that seed);
  starvation guardrail 9 vs ≤6. The draw side is now measured at three
  strictness levels (dawnmeal 0.869, goinside 1.158, dawngo 0.862) — it
  cannot beat the trust throttle. Next #314 work must be design-side
  (bank-cap-vs-need, the evening meal) or trust-ledger-side, never a
  fourth draw variant. (sim-dawngo-b evidence)
- [open] 2026-10-15 — food/policy — BASE DAWN PANTRY-FALLBACK REFUSAL
  SPAM: when the scholar is outside the hall at dawn and kcal < 0.85*cap,
  the base competent policy's pantry-fallback guard-loop voices "The
  pantry is in the hall. Your hands are not." ~40–50 times in a single
  dawn (d4 transcripts). Honest but noisy — should refuse once per dawn,
  not per guard iteration. (sim-dawngo-b evidence)

## Kill protocol

Per the pre-registered MISS: scripts/policies/dawngo.js DELETED.
Retained as instruments: scripts/test-dawngo-20261015.js (ALL GREEN,
layer-absent skips), scripts/sweep-dawngo-20261015.js,
evidence/2026-10-15/sim-dawngo-b.md, evidence/2026-10-15/dawngo-sweep.json,
evidence/2026-10-15/perseed-dawngo/, evidence/2026-10-15/dawngo-transcripts/.
Committed as scripts+evidence only.
