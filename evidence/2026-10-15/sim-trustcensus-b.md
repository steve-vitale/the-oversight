# sim-trustcensus-b — trust-ledger trajectory census (loop B ARM 2, 2026-10-15)

Sibling diagnostic for ARM 1 (sim-trustguard, sim-findings #329's lever).
Instrument-only: zero src/js changes (scripts + evidence only).

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sweep spend)

- **Question**: does the trustguard's firing window EXIST on courtship roads?
  The killed sim-goinside arm showed the binding constraint is the TRUST
  THROTTLE: takes feed v.takes[vid], net < −5000 drops trust (game.js:14579),
  half-rations persist (957 vs 664 "Half ration" beats). The sim-trustdelta
  instrument decomposed trust sources: trust comes from villager work; the
  unlayered scholar's generosity channels are ABSENT (donations 25 ticks net
  +12 across 24 runs; giveFood/amends/comfort/meal/mediate ZERO fires).
  This census characterizes the SCHOLAR's own ledger trajectory: when does
  the net cross −5000, what precedes it, does the village recover?
- **Instrument**: scripts/trustcensus-lib-20261015.js — read-only census
  layer over leadcourt/belongseek (TRUSTCENSUS=1 env gate, default off;
  det-gate byte-identical when off). Per completed game-day, per scholar
  vid: trailing-7d takes sum, trailing-7d gives sum, net, cumulative
  takes/gives/net, voluntary-vs-meal decomposition (the communal bowl
  writes v.takes WITHOUT a takeHist entry — game.js:26622, r8), trust,
  half-ration flag, hunger-day flag (overnight STARVING). Per run: day of
  FIRST net < −5000 crossing on the CUMULATIVE bar (the actual trust-drop
  bar, game.js:14579) AND on the trailing-7d window (the brief's stated
  window); the takes/gives composition that produced it; half-ration days
  after; whether trust recovered above the crossing level and how (which
  gives, if any); hunger-days before vs after.
- **PRIMARY (binding)**: ≥ 90% of −5000 crossings attributed to a
  takes/gives composition on the same ledger (no silent crossings); the
  census NAMES the window — median crossing day, takes-binge vs slow-drip
  composition, recovery rate.
- **GO (diagnostic)**: the census is complete and honest on all 16 runs
  (rows == unique nights — duplicate nights from frozen days rebuild the
  row in place, counted as nDupNights; zero instrument errors, tr7
  reconciliation exact, cumulative closure exact), and it states whether a
  guard has a firing window (e.g. "crossings happen d40+ after 5+ take-days
  with zero gives" vs "crossings are instant and unavoidable").
- **MISS**: instrument gaps (unattributed crossings > 10%) — fix the
  instrument, not the game.
- **Horizon**: 180d death-aware (+10d tail; runDays breaks on Game.over /
  deadTail). **Seeds**: 11/22/33/44/55/66/77/88 × {leadcourt, belongseek} =
  16 runs, current master tip, NO lever — pure measurement.
- **Det-gate**: scripts/test-trustcensus-20261015.js PART B green before
  sweep spend (gate-off AND gate-on byte-identical, 30d × 2 seeds × 2
  policies). **SMOKE=1**: instrument-honesty green before sweep spend.
- **Sense-test** (Steve's law): 2–3 −5000-crossing episodes read in the
  transcripts — the moot/confrontation/half-ration lead-up must read as
  people reacting to a taker, with meaning and consequences. Flag anything
  robotic.
- **Canon**: docs/CANON.md read. NO food-distribution canon doc exists —
  stated here per the canon rule; no canon invented. All mechanics read
  from src/js as-is and cited in the lib header (takeFromPantry −5000 bar,
  takeHist/giveHist, capdraw2 undated meal takes, villageMeal trust<30
  half-ration, justice.js heat tiers, freeloaderTick trailing-7d net rate,
  ledger.js succession book-reset).

## PROOF (before measurement)

scripts/test-trustcensus-20261015.js — ALL GREEN (run 2026-10-15):
- PART A (fixtures): A1 engine window e.day >= day-6 exact on synthetic
  histories; A2 binge-vs-drip composition (nDays/maxDay); A3 strict `<`
  crossings (exact −5000 does NOT cross); A4 gate-off wraps NOTHING;
  A5–A7 fake-Game integration — dated voluntary + undated meal takes
  decompose the cumulative book exactly (vol=300/meal=800), half-ration
  beat + STARVING night captured, crossing composition exact
  (cum=7700/vol=5300/meal=2400/gives=500, mealShare=0.312), succession
  resets the book (ledger.js:841-844 mirrored); A6b mystery takes (book
  with no dated history) flagged UNATTRIBUTED.
- PART B det-gate: B1 gate-off AND B2 gate-on byte-identical vs pristine,
  30d × {11,22} × {leadcourt, belongseek} — per-dawn ledger hashes
  (day/health/kcal/roster/trust/takes/gives) identical. The census is
  trajectory-neutral.
- SMOKE=1: leadcourt s11 15d — rows == unique nights (8/8), zero instrument
  errors, tr7 reconciliation exact (750/750), cumulative closure exact
  (cum=9512 = vol+meal), uninstall restores all wraps.
- Mid-build instrument fix (before sweep spend): the first SMOKE sweep
  showed 172 rows for 173 nights — a frozen day produced two sleeps under
  one day label, and the naive dedupe dropped the second night. Fixed in
  the instrument (not the game): duplicate nights REBUILD the day's row in
  place with the later ledger state (previous accumulation subtracted via
  track.adds, hunger ORs across both nights), counted as nDupNights.
  Covered by new fixture A8 (rebuild: cum=2300/vol=700/meal=1600, no
  double-count, hunger ORs). Full proof re-run ALL GREEN after the fix.
- Second mid-build fix (before sweep spend): the 180d run showed 172 rows
  for 173 nights with 0 dups — the day loop's FINAL sleep() has no
  subsequent policy.daily, so the last completed night never got a dawn.
  The sweep driver (and the SMOKE test driver) now call track.dawn(Game)
  once after runDays — idempotent via nightsRowed. Proof re-run ALL GREEN.

## RESULTS

Sweep: 16 runs (8 seeds × {leadcourt, belongseek}), 180d death-aware,
identical seeds across policies, current master tip, NO lever — pure
measurement. Sweep JSON: evidence/2026-10-15/trustcensus-sweep.json (274s).
Per-seed: evidence/2026-10-15/perseed-trustcensus/. Analyzer:
scripts/analyze-trustcensus-20261015.js.

### The census table (per-seed crossing day, composition, half-ration days, recovery)

CUMx = first day cumulative net (gives−takes) < −5000 — the actual trust-drop
bar (game.js:14579). TR7x = first day trailing-7d voluntary net < −5000.
JUSx = first day cumulative net < −15000 — justice heat+25 tier
(justice.js:104). HRaft = half-ration days after the CUM crossing.
giveAft = dated give kcal after crossing. hungB/A = hunger-days before/after.

| seed | policy | days | CUMx | TR7x | JUSx | trust@x | volTake | mealTake | gives | mealShr | takeDays | HRaft | recov | giveAft | hungB/A |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s11 | leadcourt | 174 | 4 | 59 | 14 | 15 | 750 | 4434 | 0 | 0.86 | 1 | 75 | Y* | 0 | 1/112 |
| s22 | leadcourt | 182 | 4 | 88 | 13 | 15 | 600 | 4899 | 0 | 0.89 | 1 | 74 | Y* | 0 | 1/73 |
| s33 | leadcourt | 96 | 4 | 28 | 17 | 15 | 750 | 4448 | 0 | 0.86 | 1 | 44 | Y* | 0 | 1/28 |
| s44 | leadcourt | 149 | 4 | 122 | 14 | 15 | 600 | 4692 | 0 | 0.89 | 1 | 62 | Y* | 0 | 2/45 |
| s55 | leadcourt | 159 | 4 | 23 | 19 | 15 | 750 | 4365 | 0 | 0.85 | 1 | 35 | Y* | 0 | 1/73 |
| s66 | leadcourt | 96 | 4 | 28 | 13 | 15 | 600 | 4772 | 0 | 0.89 | 1 | 70 | Y* | 0 | 1/38 |
| s77 | leadcourt | 153 | 4 | 38 | 19 | 15 | 750 | 4620 | 0 | 0.86 | 1 | 69 | Y* | 0 | 1/59 |
| s88 | leadcourt | 39 | 4 | — | 18 | 15 | 750 | 4716 | 0 | 0.86 | 1 | 7 | Y* | 0 | 1/11 |
| s11 | belongseek | 173 | 4 | — | 14 | 15 | 750 | 4434 | 0 | 0.86 | 1 | 154 | Y* | 0 | 1/21 |
| s22 | belongseek | 163 | 4 | 45 | 13 | 15 | 600 | 4899 | 0 | 0.89 | 1 | 70 | Y* | 0 | 1/71 |
| s33 | belongseek | 175 | 4 | 26 | 17 | 15 | 750 | 4448 | 0 | 0.86 | 1 | 89 | Y* | 0 | 1/102 |
| s44 | belongseek | 124 | 4 | — | 14 | 15 | 600 | 4692 | 0 | 0.89 | 1 | 39 | Y* | 0 | 2/47 |
| s55 | belongseek | 182 | 4 | 32 | 19 | 15 | 750 | 4365 | 0 | 0.85 | 1 | 92 | Y* | 0 | 1/86 |
| s66 | belongseek | 181 | 4 | — | 13 | 15 | 600 | 4772 | 0 | 0.89 | 1 | 33 | Y* | 0 | 1/87 |
| s77 | belongseek | 77 | 4 | — | 19 | 15 | 750 | 4620 | 0 | 0.86 | 1 | 8 | Y* | 0 | 1/39 |
| s88 | belongseek | 182 | 4 | — | 18 | 15 | 600 | 4716 | 0 | 0.86 | 1 | 7 | Y* | 0 | 1/41 |

\* "recov Y" is succession-driven — see the recovery finding below. Same-vid
recovery is 2/16 (both dead-cat +9 bumps that never lift half-rations).

### PRIMARY: attribution 42/42 = 100.0% (bar ≥90%) — GO

42 crossings (16 CUM + 10 TR7 + 16 JUSTICE), every one attributed to a
named takes/gives composition on the same ledger. Zero silent crossings.
Instrument: 0 errors, 0 incomplete runs (rows == unique nights on 16/16;
nDupNights counted, rebuild-verified by fixture A8).

### THE WINDOW — the guard-window verdict

- **CUMULATIVE −5000 (the bar that actually drops trust): NO usable
  window.** It fires at day 4 on 16/16 runs, both roads, every seed. The
  composition is 85–89% COMMUNAL MEALS (undated takes the scholar doesn't
  choose — the village feeding them) + exactly ONE voluntary take-day
  (600–750 kcal) + ZERO gives. A guard watching this bar would fire before
  the game has started, against the village's own feeding. There is no
  "5+ take-days with zero gives" lead-up — it is instant and unavoidable.
- **TRAILING-7d voluntary −5000: the window EXISTS.** 10/16 runs cross at
  median day 35, in both flavors — binge (s22 leadcourt d88: 2 take-days,
  4,561 kcal max day) and slow-drip (s55 belongseek d32: 6 take-days,
  1,446 max day). Nameable: "voluntary takes exceed 5,000 kcal in any
  7-day window." This is the ledger a take-guard must watch — the dated
  one, not the cumulative one.
- **JUSTICE −15000 (heat+25): 16/16 at median day 14** — the moot ladder
  gets its fuel within two weeks, overwhelmingly from the meal-drip.
- **Recovery: the village replaces, it doesn't forgive.** Same-vid trust
  recovery above crossing level: 2/16 (s77 both roads: a +9 dead-cat bump
  to 24, still half-rations, bearer gone by day 11). In 14/16 the original
  bearer's trust grinds 15 → 0 and stays until death/succession (1–11
  successions/run). Dated gives after crossing: 0 kcal on all 16 runs —
  the scholar NEVER donates, all run long (trustdelta's absent-generosity
  finding, confirmed on the scholar's own book).
- **The regime after:** half-rations dominate post-crossing life (7–154
  half-ration days/run), hunger-days pile up after the crossing (e.g.
  1/112, 1/102), while the cumulative net plunges past −100k on meal-drip
  alone.

### SENSE-TEST (Steve's law — episodes read, not just counts)

**Episode 1 — take-binge (s22 leadcourt, d80–95):** the d88 TR7 binge lands
one honest beat — "Someone watches you take food. They say nothing, but
you feel it." — inside a living week: grain gifts OUT to Emberhold
("Peter weeps, openly"), night raids, a funeral where the village speaks
for the dead. It reads as a person noticing, with meaning. The irony is
legible: the village watches the scholar take while accepting 1,775 kcal
grain gifts from the same hands.

**Episode 2 — slow-drip (s55 belongseek, d24–40):** "Caught red-handed!
They saw you steal. Trust -20." — the thief-ability caught branch firing
inside the drip, with real consequences. Around it the moot machinery
works as people: "They're named, every one: Ben Mendez, Kenji Rhee. Your
move — call a MOOT on it..." then "They waited three days at the edge of
your fire. Nobody called the moot. Ben nods — not angry, just done — and
they walk." And through it all, the daily bowls: "(Half ration — they
don't trust you yet.)" — the throttle as weather.

**Episode 3 — half-ration grind (s11 leadcourt, d8–20):** the throttle
regime in miniature. "Emma shakes their head. 'Ask someone who trusts
you.' (Trust too low.)" — trust gating social verbs; the journal: "The
village has gone quiet around me. I know why." — the cold-shoulder note.
These read as people reacting to a distrusted bearer. But the ledger says
the scholar took voluntarily ONCE (750 kcal, day 3) — the village's
coldness is 86% its own feeding read back as the scholar's hoarding. The
fiction ("I know why") blames the scholar for bowls the village served.

**Verdict:** the beats pass — people, not robots. The fiction's blame
assignment does not survive the ledger: that mismatch is filed below.

### What the village looked like (assessor's notes)

Sixteen courtship villages, all living the same opening: four days of
bowls, then the ledger quietly arms against the eater. Who thrives: the
SUCCESSORS — bearers 2–4 step into fresh books with trust 46–83, eat full
rations (2,100+ kcal bowls), and stop hungering; the village forgives by
replacement. Who dies: the first bearers, ground down at trust 0 under
half-rations, plus the usual combat toll (monster:combat 179,
monster:villager combat 172 across the sweep). Knowledge/capabilities
missing: the scholar's generosity channels are absent on every run —
zero donations, zero gives, all 16 — so the ONLY trust-positive channel
the scholar has is one the policies never use. The blank this run fills:
the guard's window is NAMED — day-4 cumulative (unwinnable, meal-driven)
vs median-day-35 voluntary (real, binge-or-drip). The blank it documents:
r8's "the village feeding you is not evidence against you" was applied
to the freeloader clock but NOT to the −5000 trust bar or the −15000
justice-heat tier — both still read the meal-inflated cumulative.

## Wall numbers (standing directive)

national 9/16; table 0/16; won 0/16; wave4 8/16; wave5 0/16;
median survival 161d; max 182d.
The scale wall stands: national in about half the runs, the table never,
no wins. Deaths are combat-shaped (see death causes above); starvation is
present but not the modal killer on these roads.

TELEMETRY DEVIATION CHECK: not run by this worker (coordinator step per
the loop body); per-seed evidence glob
evidence/2026-10-15/perseed-trustcensus/ is in place for it.

## Metric review (§14)

GO as pre-registered: PRIMARY 100.0% ≥ 90% attribution; the census is
complete and honest on 16/16 runs (0 instrument errors, rows == unique
nights everywhere, tr7 reconciliation and cumulative closure verified in
SMOKE); the window is named (day-4 cumulative vs median-day-35
voluntary). No re-scoring needed. Notes for the NEXT run:
1. The pre-registered "recovery" metric (trust above crossing level) is
   succession-confounded — 16/16 "recovered" but 14/16 never recovered
   same-vid. The honest recovery metric is same-vid trust > crossing
   level (2/16 here). Future censuses should pre-register the same-vid
   form.
2. The analyzer's per-run "recov" column currently reports the naive form;
   scripts/analyze-trustcensus-20261015.js should gain a same-vid column
   next run (the per-seed JSONs carry vid per row, so this is computable
   without re-sweeping).
3. The 300-cap say ring floods on policy probe chatter ("You are full
   enough" × dozens) — crossingBeats need a meaningful-beat filter
   (trust/food/social/confrontation) rather than a raw cap, or the
   sense-test excerpts drown. The focused re-run script used for the
   sense-test above (/tmp, ephemeral) shows the filter shape.

## Convergence state

**converged** (instrument GO; diagnostic complete). The trust-ledger
trajectory on courtship roads is now measured: the −5000 trust bar is a
day-4 meal-driven trip (85–89% communal bowls), the voluntary window is
median day 35 (10/16, binge-or-drip), same-vid recovery is ~nil, gives are
zero. ARM 1 (sim-trustguard) should guard the DATED voluntary ledger —
the cumulative bar has no take-behavior window. Sim-findings #329's
"P ANTRY TAKES TAX THE TRUST LEDGER" is now decomposed: pantry takes are
~11–15% of the crossing; the village's own bowls are the other ~86%.

## Findings filed (not chased — out-of-axis notes for the backlog)

- [open] 2026-10-15 — food/trust — HALF-APPLIED R8: THE MEAL-DRIP STILL
  ARMS THE TRUST BAR AND JUSTICE HEAT (sim-trustcensus-b): r8
  ("the village feeding you is not evidence against you") excluded the
  communal bowl from takeHist (freeloader clock) but v.takes still
  accumulates the undated bowls, and BOTH the −5000 trust-drop bar
  (game.js:14579) and the −15000/−5000 justice-heat tiers (justice.js:104-106)
  read the meal-inflated cumulative. Measured: the CUM −5000 trips day 4 on
  16/16 courtship runs at 85–89% meal share with exactly one voluntary
  take-day; the −15000 heat tier lands median day 14 — the cold-shoulder
  fiction ("I know why") blames the scholar for bowls the village served.
  steve-call: should the trust/justice bars read the dated voluntary
  ledger (like the freeloader clock) instead of the meal-inflated
  cumulative, or is the current arming intended?
- [open] 2026-10-15 — food/trust — SAME-VID TRUST NEVER RECOVERS ON
  COURTSHIP ROADS (sim-trustcensus-b): 14/16 original bearers grind
  15 → 0 with no recovery before death/succession; 2/16 show a +9
  dead-cat bump. Dated gives are zero across all runs — the scholar's
  generosity channels (donations/giveFood/amends) never fire, so the
  ledger offers no road back. The village recovers trust by replacement
  (1–11 successions/run), not forgiveness. Design question for the
  trustguard arm: is a take-guard sufficient, or does the road need a
  give-channel opener alongside it?
