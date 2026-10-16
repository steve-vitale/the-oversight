# sim-eveningmeal-b — the scheduled evening meal (loop B, 2026-10-16)

ARM: sim-eveningmeal-b. Finding #314 named design-side next: bank-cap-vs-need.
The scholar's bank cap (~2400, `Game.kcalCap()` in src/js/food.js) sits below
an active courtship day's burn (~4900 on leadcourt) — one dawn fill is
structurally insufficient. The killed sibling arms were REACTIVE
(pack-empty + kcal<0.5cap: dawnmeal 0.869, dawngo 0.862, sleepin 0.787) or
location-state (goinside 1.158). THIS arm is a SCHEDULED second meal: at dusk,
every day, fill the bank to 95% — the day's intake completed before the night
burn. A different mechanism class, explicitly named as the design-side next.

## PRE-REGISTRATION (written BEFORE any sims — binding per MEASUREMENT.md §§9–12, 14)

- **Primary metric:** per-day-alive scholar hunger-days armed <= 0.75x control
  (pooled; the sleepin metric-review recommendation). Hunger-days = census
  STARVING-night rows (trustcensus instrument); days-alive = census rows.
- **Guardrails (binding):** starvation deaths armed <= control+2; scholar
  starvation armed <= control+1; no new death mode (armed-only cause n>=3);
  national armed >= control-2; median survival armed >= control-10d.
- **Watch (report-only, do NOT kill on it):** day the cumulative -5000 trust
  bar crosses armed vs control (the #340 tension — the evening meal is a
  voluntary take that deepens v.takes); half-ration beat counts; justice-heat
  (-15000) tier landings.
- **GO → land the layer. MISS → kill protocol: delete the layer, commit
  evidence + instruments only.**
- **Horizon:** 180d death-aware (+10d tail max). Reason: the evening meal is
  a nightly habit — its hunger effect compounds over multi-week courtship
  arcs; 180d matches the sleepin/dawnmeal substrate cadence. Dead villages
  stop simulating.
- **Seeds:** 107,218,329,440,551,662,773,884 × {leadcourt,belongseek} ×
  {control,armed} = 32 runs. Own paired control in the SAME sweep.
  FEASTSCALE_R13=1 both sides (feastscale courtship substrate:
  leadcourt→leadfeast, belongseek→belongfeast per the sleepin precedent).
- **ZERO src/js changes.** Policy-side layer only (`EVENINGMEAL=1`, default OFF).
- **Det-gate:** proof test RED→GREEN before sweep spend; gate-off
  byte-identical trajectories on 2 seeds × 2 policies (PART C).
- **Convergence state:** GO → land; MISS → killed-at-pilot.

## Canon read

- docs/CANON.md (knowledge law; no silent actions — every take narrates
  through the engine's beats; human skills ≠ alien abilities).
- docs/PRESERVATION.md: the ladder (cleaned 2d < cooked 5d < smoked 30d <
  rendered 90d < pemmican 120d); blind penalties teach; rot can't be smoked
  back; no nonsensical calorie loss. The meal's pantry scan prefers
  cooked/smoked/preserved/rendered (the base's competentEat scoring).
- docs/DISEASES.md (mandatory): NEVER meat_human (trembles — kuru/prion,
  cooking does NOT kill it, no cure). The scan excludes it; never raw meat
  (trichinosis/gutrot).

## The lever (policy-side, scripts/policies/eveningmeal.js)

`wrapPolicy(base)` — EVENINGMEAL=1 opt-in (default OFF; gate-off returns the
base itself, det-gate pinned). Chains base.upkeep then the dinner beat:

**eveningMeal(Game, ctx)** — gates in order:
1. dusk only (`Game.dayPart === 2`) — dinner before the night burn.
2. once per dusk (`ctx._emDay`) — a scheduled meal, not a loop.
3. bank ROOM: skip when kcal >= 95% cap (`emSkippedFull`).
4. hands: skip when `havenStoresAccess()==='none'` (`emBlocked`) — the
   engine would honestly refuse; the base already voiced it (DAWNREFUSE
   precedent) — no refusal spam.
5. PANTRY HONEST BUFFER (feastscale/winseek pattern): fire only when
   `Game.pantryFreshDays() >= 1.5` (`emPantryHold`) — the engine's own
   fresh-days convention; a dinner is one bank-fill and must never feast
   the pantry into famine.
6. disease-aware scan (the base's competentEat scoring): cooked/safe first,
   never raw meat, NEVER meat_human (`emNothingTakeable`).

Then the honest verbs: `Game.takeFromPantry(best)` + `Game.eat()` in a
guarded loop until 95% cap (max 20 units, stops if kcal stops rising —
refused takes don't spin). Every take narrates through the engine's beats
("Took X.", "You eat X and Y (N kcal)."); the layer adds one closing beat
("Dinner, eaten properly — the bank is full for the night."). Takes are
VOLUNTARY/dated (takeFromPantry records takeHist) — the trust ledger taxes
them like any honest take; the -5000 crossing is WATCHED, not hidden.

**Pre-pilot sniff diagnostic (documented, not hidden):** a 60d leadcourt-s107
probe showed the marginal is the 85–95% band — the base's dusk competentEat
already fills to 95% on most dusks (41/57 skipped-full; 8 fires; 8 blocked;
0 pantry-holds). The meal fires ~13% of dusks, topping up ≤10% cap each.
Small but nonzero; the pilot judges whether the margin flips starving nights.

## Proof test (scripts/test-eveningmeal-20261016.js) — ALL GREEN (28/28)

- PART A (mock): gate-off identity; gate-on wrap; fires at dusk with room
  (kcal 1800→2300, "Took"/"You eat"/dinner beats); skips on full bank,
  non-dusk, buffer floor, blocked hands (quietly), meat_human never taken,
  once-per-dusk.
- PART B (live engine, constructed states, REAL RED→GREEN): RED (gate off,
  90% cap, fat pantry) — no dinner, kcal 2160→2160. GREEN (gate on) — bank
  2160→2400 (≥95% cap), takes 0→600 (voluntary/dated). Buffer held at 0.02
  fresh-days. Bank-full skipped. Hands-blocked skipped quietly, no takes.
  meat_human-only pantry (above the buffer floor): never taken.
- PART C (det-gate): 30d × {leadfeast, belongfeast} × 2 seeds, gate-off
  wrapPolicy vs bare base — per-day hashes byte-identical (4/4).

## Pilot results — KILLED AT PILOT (NO-GO)

Sweep: 8 seeds × {leadcourt,belongseek} × {control,armed}, 180d death-aware,
own paired control, FEASTSCALE_R13=1 both sides. 32/32 runs completed.

### Pooled (16 control / 16 armed)

| side | perDayAlive | hunger/daysAlive | starve (scholar) | median | national/16 | table | won | wave4 | wave5 | maxArc | crossDay | halfR | justice |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 0.3301 | 688/2084 | 4 (4) | 135d | 13 | 15 | 0 | 15 | 8 | 4 | 4.0 (16/16) | 613 | 16 |
| armed | 0.3432 | 809/2357 | 4 (4) | 158d | 14 | 14 | 0 | 15 | 9 | 4 | 6.5 (16/16) | 1335 | 16 |

**PRIMARY: 0.3432/0.3301 = 1.04 > 0.75 → MISS.** The armed side had slightly
MORE hunger per day-alive, not less.

Per-policy: leadcourt armed 0.3457 vs control 0.3510 (0.985x); belongseek
armed 0.3406 vs control 0.3116 (1.093x). Neither policy is near the bar.

**GUARDRAILS (all pass):**
- starvation deaths 4 ≤ 6 (control+2) ✓ (scholar starve 4 vs 4 ✓ — all
  starvation deaths were the scholar on both sides)
- national 14 ≥ 11 (control−2) ✓
- median survival 158d ≥ 125d (control−10d) ✓
- new death mode: none — armed-only causes all at n≤2 ("the night" 1,
  Dustboar 2, The Rerun 1, lockjaw 1, alien 1, The Loud Beast 2, Glasswing
  Darter 1, The Reunion 1, The Algorithm 1); "a wound that wouldn't close"
  9→0 favored armed ✓

**VERDICT: NO-GO** (§14 — primary miss; all guardrails pass; median favors
armed). The layer is deleted per kill protocol; evidence + instruments
retained.

### MECHANISM AUTOPSY — why the scheduled meal didn't move hunger

The layer engaged (240 dinners, 252 takes, 49,240 kcal over 16 armed runs —
~15 dinners/run, ~205 kcal/dinner), but the audit counters show the marginal
was the 85–95% band, exactly as the pre-pilot sniff diagnosed:

| skip reason | count | meaning |
|---|---|---|
| emSkippedFull | 1697 | bank already ≥95% — the base's dusk competentEat filled it first |
| emBlocked | 238 | hands blocked (scholar outside the hall at dusk) |
| emPantryHold | 74 | pantry below the 1.5 fresh-days floor |
| emMeals (fired) | 240 | the 85–95% top-up band |

The base's reactive dusk draw already fills the bank to 95% whenever kcal <
85% cap — the scheduled meal only adds the top-up when competentEat's
pack-eat landed kcal in [85%, 95%). ~205 kcal/dinner × 15 dinners/run ≈
3,000 kcal over 180 days ≈ 17 kcal/day against a ~4,900 courtship burn
(0.3%). The margin is real but two orders of magnitude below the bar.

The deeper lesson for #314: the bank-cap-vs-need gap is not closable by
filling the same 2,400-cap bank more often — the dawn + dusk reactive fills
already run twice daily. The structural answers live elsewhere (cap size,
burn rate, or a third scheduled intake), not in a second fill of the same
bank. This was the last "more fills" variant of the #314 line (dawnmeal,
dawngo, sleepin, goinside all killed); the line is exhausted.

### #340 WATCH (report-only)

- **Trust-bar crossing:** armed 6.5d vs control 4.0d (both policies) — the
  evening meal DELAYED the cumulative -5000 crossing by ~2.5 days. All 16
  runs crossed on both sides. Counterintuitive (more takes should cross
  earlier); the dinner only fires when the pantry is fat (freshDays ≥ 1.5),
  which correlates with giving — but the composition is not decomposed here.
- **Half-rations:** armed 1,335 vs control 613 — more than double, ~2x per
  day-alive on both policies (leadcourt 0.554/d vs 0.274/d; belongseek
  0.580/d vs 0.312/d). The #340 tension is REAL: the voluntary dinner takes
  deepen the trust deficit after the crossing and half-rations persist.
  Extreme case: belongseek s329 armed — half-ration EVERY night (180/180)
  with only 7 dinners fired.
- **Justice-heat (-15000) tier:** 16/16 crossings on BOTH sides — the
  courtship substrate crosses it universally; not caused by the arm.

### Reachability verdict

Content is reachable on both sides (the arm neither opened nor closed
doors): wave 4 on 15/16 runs both sides; wave 5 on 8 control / 9 armed;
national on 13 control / 14 armed; table waiting on 15/14; maxArc 4 both;
0 wins both (the win flag remains unreached on this substrate — consistent
with all recent courtship pilots). Median survival 135d→158d favored armed
(report-only per the sleepin metric review).

### Village assessment

The villages lived the full courtship arc on both sides. What they looked
like: fat pantries early (Marta/Kennedy/Peyton cooking, "meals stretched,"
racks full at ~18k kcal), then the mid-game squeeze — raids from Thornfield,
Ashford, The Hungry Road, Emberhold carrying off 800–1,800 kcal a night
(Trust -10 each), runners with commons complaints, aid offers from
Stonebridge answered. The coalition food economy visibly worked (aid taken,
tribute/tend flowing on the feastscale substrate).

Who thrived: the cooks and the courtship engine — villages that reached
national/global (13-14/16) kept pantries turning. Who died and why: combat
dominates (402-406 combat deaths + 116-120 villager combat + 90-106 monster),
the scale wall's violence, not hunger — starvation killed only the scholar
(4/4 on both sides), never a villager. The scholar starves alone because the
village meal feeds the roster while the scholar's bank can't cover the
courtship burn: the #314 gap, confirmed from the death side.

What was missing: nothing the arm could fill — the village's food system
works (pantry, cooks, aid, tribute); the scholar's personal bank is the
bottleneck, and it is already filled twice daily by the base policy. The
blank is structural (cap vs burn), not behavioral.

### Sense-test (transcripts)

The dinner reads as a person eating dinner, not a bot double-dipping. Best:
d1 leadcourt-s440-armed — "Took Dried beans." / "You eat Dried meat
(300 kcal)." / "Dinner, eaten properly — the bank is full for the night."
The takes interleave with the eating; the aid economy shows up honestly
("Took Aid from Stonebridge (dried). You eat Aid from Stonebridge (dried)
(400 kcal)."). The closing beat lands as a finished meal.

Worst: d1 belongseek-s329-armed — "Dinner, eaten properly — the bank is
full for the night." followed IMMEDIATELY by "⚠ STARVING: health and energy
falling. The spiral has started." and a half-ration village meal. The bank
was "full" at dusk and the scholar starved that same night — the 2,400 cap
cannot carry the burn, and the beat sequence reads as the game
contradicting itself. That contradiction is the #314 gap in one transcript.

Village reactions to the takes: no "Someone watches you load up" beats
fired in the sampled transcripts (30% chance per take, small takes); the
trust tax arrived as the d89 "Caught red-handed! They saw you steal. Trust
-20." (thief ability on a take) and the persistent half-ration regime. Theft
is allowed and socially punished per Steve's hard rules — the ledger taxed
the dinners exactly as designed; the punishment just outweighed the food.

### Metric review (for the NEXT run, never this one — §14)

1. The per-day-alive primary (the sleepin recommendation) worked as
   designed — it told the truer story (armed lived 13% longer; the pooled
   total would have flattered it further). Keep it.
2. The 0.75 bar is now 0/5 on the #314 "more fills" line (dawnmeal 0.869,
   dawngo 0.862, sleepin 0.787, goinside 1.158, eveningmeal 1.04). The bar
   is not the problem; the mechanism class is exhausted. The next #314 arm
   must change cap, burn, or intake count — not fill timing.
3. Median survival as report-only held up again (158d vs 135d, direction
   consistent). Keep it report-only.
4. The half-ration watch deserves a first-class metric on any future
   take-side arm: the 2x half-ration rate is the #340 cost made visible,
   and it moved opposite to the crossing day. Crossing-day alone would have
   misled (later crossing, worse rations).

## Kill protocol

PRIMARY MISS → layer deleted: `scripts/policies/eveningmeal.js` removed.
Evidence (this file), instruments (scripts/test-eveningmeal-20261016.js,
scripts/sweep-eveningmeal-20261016.js), and sweep outputs
(eveningmeal-sweep.json, perseed-eveningmeal/, eveningmeal-transcripts/)
retained and committed.

## New findings

- [open] 2026-10-16 — food-economy — the #314 "more fills" line is
  exhausted (5/5 killed): dawnmeal, dawngo, sleepin, goinside, eveningmeal.
  The bank is already filled twice daily by the base policy; the cap-vs-burn
  gap needs cap, burn, or intake-count changes, not fill timing.
  (sim-eveningmeal-b evidence.)
- [open] 2026-10-16 — trust — take-side arms need a half-ration-rate metric:
  the evening meal delayed the -5000 crossing (+2.5d) while DOUBLING the
  half-ration rate (1,335 vs 613). Crossing-day alone misleads; the #340
  cost is in the ration regime, not the crossing. (sim-eveningmeal-b watch.)
