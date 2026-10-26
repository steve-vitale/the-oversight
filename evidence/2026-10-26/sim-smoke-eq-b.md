# sim-smoke-eq-b — the three-term smoke equation closes (INSTRUMENT ONLY, no game change)

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-smoke-eq-b (20261026T2130Z). Takes the 2029Z run's
next blank (1): a meal-draw re-prereg with the THREE-TERM
smoke equation. The 2029 verdict was NO-GO because the
window equation omitted the morning smoke: window 28
proves it exactly (night-28 surplus 2000, 0 draws, 600
left, gap exactly 1400; day-29 worked cook gains exactly
1737 dried kcal incl. 7x160 = 1120 = 1400 x 0.80 rough
yield). The morning cook smokes the surplus BEFORE the
first-cook snapshot. This arm does NOT re-score that
NO-GO: its verdict is ONLY whether writes − draws −
evidenced smoke closes the surplus windows. It does, on
every checkable window, on the pilot band and on a fresh
16-seed confirm band.

Instrument: `scripts/smoke-eq-capture.js` (NEW — sibling
capture files untouched) + `scripts/sweep-smoke-eq-b.js`
(NEW, mirrors sweep-mealdraw-b.js plus the smoke capture)
+ `scripts/analyze-smoke-eq-b.js` + `scripts/test-smoke-eq-b.js`
(all NEW, additive-only). Control: `scripts/sweep-stockdoor-b.js`
reused UNCHANGED. Zero src/js changes. Sweeps:
`scripts/sweep-stockdoor-b.js` (control) and
`scripts/sweep-smoke-eq-b.js` (judged) reused/mirrored;
substrate, inflow, resid, stockdoor, mealdraw captures
reused UNCHANGED. Canon: docs/CANON.md +
docs/PRESERVATION.md (ladder: cleaned 2d < cooked 5d <
smoked 30d; smoking 16 ticks; "rot can't be smoked back
into food"; smoke yields 0.95 known / 0.80 rough;
villager cook smoke: reserve ~2 nights of pantry draw,
soonest-spoiling first, budget ~4000 kcal).

## Pre-registration (binding, MEASUREMENT.md §14 — written AND committed BEFORE any sweep ran)

Full text: evidence/2026-10-26/
sim-smoke-eq-b-prereg.md (committed as 4321579e5, with
the instrument scripts in the same commit, before any
sweep). Pinned base: a02b0c8f2 ("sim-food-economy-round-
2029-b: coordinator evidence", this branch tip at prereg
time). PIN CHANGE, stated explicitly: the 2029 pin
f89a9b32d moved by exactly one file on the game-tree
path list — scripts/policies/w4dmg-diag.js (243 lines, a
wave-4 damage diagnostic policy, referenced only by its
own test sweep, never loaded by the competent substrate
— the sweeps require() only scripts/policies/competent.js).
The current master tip (9490f7da1) adds exactly one more
such file, scripts/policies/w4opp-diag.js (287 lines,
also unloaded). src/, index.html, harness, and every
reused sweep/capture file are byte-identical across the
2029 pin, this branch tip, and the master tip. The pin
is therefore on the GAME TREE at a02b0c8f2 (ancestor +
empty game-tree diff on src/, index.html, and all
sweep/capture/harness/policy paths), not on the literal
branch tip — committing the prereg itself advances HEAD
by an evidence-only commit, so literal HEAD equality
would fail on the prereg commit and prove nothing about
trajectories; the correction is documented in the prereg
itself and was committed before any sweep.

Band: seeds 9750–9757, competent-nofeast (COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1), 100d death-aware, CAP=1. This 8-seed band
IS the pilot gate (paired reuse of the 9750–9757 band,
stated as such, for comparability with the 2029 windows).
Control corpus: evidence/2026-10-26/
sim-smoke-eq-b-control-corpus/. Judged corpus:
evidence/2026-10-26/sim-smoke-eq-b-corpus/. Confirm
band: seeds 9780–9795 (verified free at prereg time: no
9780–9795 seed file in evidence/2026-10-26/, no
sim-mealdraw-reprereg-b-confirm* directory — the 2029
arm spent no confirm).

GO threshold (all must hold): leg 0 base pin (ancestor
+ empty game-tree diff at four checks: before control,
between sweeps, after judged, and before confirm);
leg 1 control gate (8/8 seeds, no truncation); leg 2
determinism (judged matches control on every
game-output field, 8/8 seeds); leg 3 three-term
surplus-window reconciliation on focus seed 9750
(every checkable window closes residual3 exactly 0, at
least 3 checkable); leg 4 residual disposition per-seed
explicit (every control pre-fourth-door residual's
covering window on THAT seed must close three-term);
leg 5 cross-checks (meal-call, drawSpoiled, truncation,
ctxKcalMatch, resid join, plus the worked-line gate:
day-29 first-cook smoke must reproduce surplus fresh
1400, surplus preserved 1120, parsed keptKcal 1737);
leg 6 confirm (16 fresh seeds 9780–9795, ONLY if legs
0–5 pass — the pilot gate binds).

## Verdict: GO — pilot and confirm, on every leg

Judged against the header only, never re-scored: GO.
The passing legs, named:

- Leg 0 (base pin): PASS at all four checks. Ancestor
  check passed and the game-tree diff to the pin was
  empty (0 lines) before the control sweep, between
  the sweeps, after the judged sweep, and before each
  confirm sweep. No game-code or sweep/capture change
  since the pin. (The analyzer's surplus-preserved
  identification was corrected mid-run — see
  "Reproduction check" — an instrument fix, not a
  game-tree change: the leg-0 path list contains no
  new script, and the proof's leg-0 check passed after
  the fix.)
- Leg 1 (control gate): PASS. Control sweep completed
  8/8 seeds, no truncation flag on any file, no write
  failure.
- Leg 2 (determinism): PASS, exactly. Judged corpus
  matches control corpus on every game-output field on
  all 8 seeds (dayTable classes, attribution flags,
  daysAlive, deaths, deathCauses, rank, waveReach,
  national/table/win, endReason) — 0 mismatches. The
  new smoke instrument is neutral on the pinned base,
  proven the correct way: two sweeps, one HEAD,
  identical game outputs. Smoke records equal cook
  lines exactly per seed (9750: 191/191), as designed
  — one record per cook duty.
- Leg 3 (three-term surplus windows, focus seed 9750):
  PASS. 81 checkable windows, 81 closed, residual3
  exactly 0 on every one. The 14 windows that were
  OPEN two-term now close with smokeFresh exactly
  equal to the old gap (28: 1400, 30: 1400, 31: 1000,
  32: 800, 33: 400, 34: 1400, 35: 600, 36: 2000, 37:
  600, 38: 2200, 40: 1800, 43: 1800, 47: 1800, 54:
  1200). Windows 81–83 close as before (smoke term 0
  there — racks full, no smoke runs).
- Leg 4 (residual-pair disposition): PASS. The pilot
  control pre-fourth-door view has exactly one
  residual, (9754,80) — the same sole residual as the
  2029 control — and its covering window (9754 window
  79: gross 3800, surviving 1000, draws 0, smokeFresh
  2800) closes with residual3 exactly 0. The 2029
  arm's ready-made test case closes under the revised
  equation, as its metric review predicted.
- Leg 5 (cross-checks): PASS, and stricter than the
  prior arm (all seeds, not just 9750): 4631
  villager-home meal calls, 0 mismatches (fresh +
  spoiled == drawn); 17 drawSpoiled calls, 0 diff-sum
  mismatches; no mealdraw truncation; no smoke
  truncation (1729 smoke records, 1729 cook duties);
  ctxKcalMatch 0 mismatches over 1729 lines; resid
  join 0 misses; worked-line gate exact (see below).
- Leg 6 (confirm): PASS — spent because the pilot
  GOed, and only then. Confirm band seeds 9780–9795,
  control + judged sweeps on the pinned HEAD (pin
  re-verified before each): (a) neutrality judged==
  control on all 16 seeds on every game-output field
  (0 mismatches); (b) cross-checks pass (10134
  meal calls, 0 mismatches; 12 drawSpoiled, 0
  mismatches; no truncation); (c) every checkable
  surplus window across all 16 seeds closes with
  residual3 exactly 0 — 1207 checkable, 0 open (the
  ≥8 checkable requirement is exceeded 150-fold).
  The confirm control's pre-fourth-door view has NO
  residuals at all (bound 655 / attributed 570 /
  unattributed 85, coverage 85/85, lag 1x78 / 2x7,
  median 1) — on fresh seeds, the three-door view is
  fully explained.

## Control view (verbatim from the pilot control corpus)

Pre-fourth-door view, three doors only, identical
counting rules to analyze-mealdraw-b.js: neutrality 383
bound / 338 attributed / 45 unattributed;
attribution-flag reproduction 0 mismatches; lag
distribution 1x40 / 2x4 / 3x1; median lag 1.0;
coverage 44/45; sole residual (9754,80). Context, not
a leg: the pilot control corpus matches the 2029
control corpus on every game-output field on all 8
seeds — the pinned base's trajectories are the 2029
pin's trajectories on this band, as the pin analysis
predicted (the only delta is an unloaded policy file).
This GO is therefore not a base-movement artifact in
either direction: same trajectories, corrected equation,
all windows close.

## Gross vs surviving pile, every judged night (focus seed 9750, three-term)

Surplus class ('Foraged food', 200, D+3, granaryDays
null) per window D (first-cook D to first-cook D+1).
Gross = night-D stockdoor writes; surviving =
dayPantry[D+1] value of the surplus class; before is 0
on every window below (the class is newly written each
night). Smoke = surplus-class fresh kcal lost in
cook-duty calls on day D+1 with cookLinesSeenBefore ==
0 (before the first cook line of day D+1). Residual3 =
surviving − (before + gross − draws − smoke). A
night's gross write is NEVER its surviving pile — the
table keeps them separate, and the smoke column is
exactly where the two-term "gap" went.

| night | gross | draws | smoke | surviving | residual3 | |
| 8 | 2000 | 800 | 0 | 1200 | 0 | CLOSED |
| 18 | 1800 | 600 | 0 | 1200 | 0 | CLOSED |
| 21 | 2400 | 1600 | 0 | 800 | 0 | CLOSED |
| 22 | 2200 | 1600 | 0 | 600 | 0 | CLOSED |
| 23 | 3000 | 1200 | 0 | 1800 | 0 | CLOSED |
| 24 | 1400 | 600 | 0 | 800 | 0 | CLOSED |
| 25 | 1400 | 600 | 0 | 800 | 0 | CLOSED |
| 26 | 2400 | 1200 | 0 | 1200 | 0 | CLOSED |
| 27 | 2000 | 0 | 0 | 2000 | 0 | CLOSED |
| 28 | 2000 | 0 | 1400 | 600 | 0 | CLOSED |
| 29 | 2000 | 0 | 0 | 2000 | 0 | CLOSED |
| 30 | 2200 | 0 | 1400 | 800 | 0 | CLOSED |
| 31 | 2800 | 0 | 1000 | 1800 | 0 | CLOSED |
| 32 | 2200 | 0 | 800 | 1400 | 0 | CLOSED |
| 33 | 3000 | 0 | 400 | 2600 | 0 | CLOSED |
| 34 | 2800 | 0 | 1400 | 1400 | 0 | CLOSED |
| 35 | 2600 | 0 | 600 | 2000 | 0 | CLOSED |
| 36 | 2600 | 0 | 2000 | 600 | 0 | CLOSED |
| 37 | 2600 | 0 | 600 | 2000 | 0 | CLOSED |
| 38 | 2800 | 0 | 2200 | 600 | 0 | CLOSED |
| 39 | 2000 | 0 | 0 | 2000 | 0 | CLOSED |
| 40 | 2400 | 0 | 1800 | 600 | 0 | CLOSED |
| 41 | 2600 | 0 | 0 | 2600 | 0 | CLOSED |
| 42 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 43 | 3800 | 0 | 1800 | 2000 | 0 | CLOSED |
| 44 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 45 | 2600 | 0 | 0 | 2600 | 0 | CLOSED |
| 46 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 47 | 3600 | 0 | 1800 | 1800 | 0 | CLOSED |
| 48 | 3000 | 0 | 0 | 3000 | 0 | CLOSED |
| 49 | 2800 | 0 | 0 | 2800 | 0 | CLOSED |
| 50 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 51 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 52 | 2600 | 0 | 0 | 2600 | 0 | CLOSED |
| 53 | 2600 | 0 | 0 | 2600 | 0 | CLOSED |
| 54 | 2000 | 0 | 1200 | 800 | 0 | CLOSED |
| 55 | 2400 | 0 | 0 | 2400 | 0 | CLOSED |
| 56 | 2400 | 0 | 0 | 2400 | 0 | CLOSED |
| 57 | 2200 | 0 | 0 | 2200 | 0 | CLOSED |
| 58 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 59 | 2800 | 0 | 0 | 2800 | 0 | CLOSED |
| 60 | 3800 | 0 | 0 | 3800 | 0 | CLOSED |
| 61 | 2800 | 0 | 0 | 2800 | 0 | CLOSED |
| 62 | 2800 | 0 | 0 | 2800 | 0 | CLOSED |
| 63 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 64 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 65 | 2400 | 0 | 0 | 2400 | 0 | CLOSED |
| 66 | 3600 | 0 | 0 | 3600 | 0 | CLOSED |
| 67 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 68 | 3000 | 0 | 0 | 3000 | 0 | CLOSED |
| 69 | 2200 | 0 | 0 | 2200 | 0 | CLOSED |
| 70 | 2800 | 0 | 0 | 2800 | 0 | CLOSED |
| 71 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 72 | 3600 | 0 | 0 | 3600 | 0 | CLOSED |
| 73 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 74 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 75 | 4200 | 0 | 0 | 4200 | 0 | CLOSED |
| 76 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 77 | 3200 | 0 | 0 | 3200 | 0 | CLOSED |
| 78 | 4600 | 0 | 0 | 4600 | 0 | CLOSED |
| 79 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 80 | 3800 | 0 | 0 | 3800 | 0 | CLOSED |
| 81 | 3600 | 0 | 0 | 3600 | 0 | CLOSED |
| 82 | 3800 | 0 | 0 | 3800 | 0 | CLOSED |
| 83 | 4400 | 0 | 0 | 4400 | 0 | CLOSED |
| 84 | 4000 | 0 | 0 | 4000 | 0 | CLOSED |
| 85 | 4600 | 0 | 0 | 4600 | 0 | CLOSED |
| 86 | 4400 | 0 | 0 | 4400 | 0 | CLOSED |
| 87 | 2800 | 0 | 0 | 2800 | 0 | CLOSED |
| 88 | 4000 | 0 | 0 | 4000 | 0 | CLOSED |
| 89 | 4400 | 0 | 0 | 4400 | 0 | CLOSED |
| 90 | 2800 | 0 | 0 | 2800 | 0 | CLOSED |
| 91 | 3800 | 0 | 0 | 3800 | 0 | CLOSED |
| 92 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 93 | 3400 | 0 | 0 | 3400 | 0 | CLOSED |
| 94 | 3600 | 0 | 0 | 3600 | 0 | CLOSED |
| 95 | 4400 | 0 | 0 | 4400 | 0 | CLOSED |
| 96 | 3000 | 0 | 0 | 3000 | 0 | CLOSED |
| 97 | 4400 | 0 | 0 | 4400 | 0 | CLOSED |
| 98 | 3800 | 0 | 0 | 3800 | 0 | CLOSED |
| 99 | 3600 | 0 | 0 | 3600 | 0 | CLOSED |

81 checkable windows, 81 closed. The open windows
cluster early (days 28–54, when the cook still smokes)
and vanish after day 54 (when the surplus survives
whole every night) — the same shape the 2029 arm
reported, now explained to the kcal: early on the
racks are not full, the cook smokes daily, and the
smoke takes fresh surplus; later the racks fill and
the smoke term goes to 0. Non-checkable nights (days
1–7, 9–17, 19–20, 100) lack a dayPantry endpoint and
are not judged — they are not open windows.

## The worked line, reproduced exactly (leg 5f)

Seed 9750, day 29, first cook (record seq 21, cook
Sierra). The line, verbatim from the judged corpus:

"🍲 Sierra cooked for the haven — meals stretched.
Sierra worked the smoke racks too — 3 batches
preserved (~1737 kcal, keeps a couple of weeks)."

The smoke record for that single duty, verbatim
deltas (fresh lost / preserved gained):

- 'Foraged food', 500 kcalEach, spoilDay 31: 1 unit
  lost (500 fresh) → 'Foraged food (dried)', 400
  kcalEach, spoilDay 44: 1 unit gained (400).
- 'Foraged food', 271 kcalEach, spoilDay 31: 1 unit
  lost (271 fresh) → 'Foraged food (dried)', 217
  kcalEach, spoilDay 44: 1 unit gained (217).
- 'Foraged food', 200 kcalEach, spoilDay 31 (THE
  SURPLUS CLASS, night-28 writes): 10 units before,
  3 units after — 7 units lost (1400 fresh) →
  'Foraged food (dried)', 160 kcalEach, spoilDay 44:
  7 units gained (1120).

Totals: fresh lost 2171, preserved gained 1737,
parsed keptKcal 1737. The line's "3 batches" is the
three converted stacks; its "~1737 kcal" is the
preserved total to the kcal; "a couple of weeks" is
the 15-day rough stamp (spoilDay 44 = day 29 + 15).
The surplus class keeps 3 units (600 kcal) fresh —
exactly the window-28 "surviving" pile. Nothing here
is inferred from the line: the record and the line
agree independently, stack by stack.

## Sense sample (plain words — meaning, not just counts)

Seed 9750, night 28 into morning 29 (the window the
2029 arm proved the smoke on): the village banks
2000 kcal of surplus at night — ten 200-kcal units
of foraged food, all stamped to spoil on day 31.
Nobody draws from it overnight (0 draws). Next
morning Sierra works the smoke racks: she smokes the
about-to-spoil pile — the night's surplus plus two
older foraged stacks, all stamped day 31 — keeps 3
surplus units fresh for dinner, and dries the rest at
the rough yield (1400 → 1120, 500 → 400, 271 → 217).
She says she preserved 3 batches (~1737 kcal, keeps
a couple of weeks), and the pantry record shows
exactly that: 1737 kcal of new dried stock, stamped
day 44. The story coheres completely: the village
banks surplus at night, the cook smokes the
about-to-rot excess in the morning while keeping a
dinner share fresh, and she says so with true
numbers. The "gap" was never food vanishing — it was
preserved food, narrated. Nothing robotic, static, or
repeated is flagged: the repeated plain-cook template
fires with true numbers and true situations, and the
smoke term varies night by night (0 to 2200) with the
racks' fullness and the pile's age, as a real cook's
judgment would.

## Village assessment (what the village looked like)

Seed 9750 (focus, pinned base): survived the full 100d
horizon, village rank, wave 2 reached, haven tier 3
(the granary stands). Two deaths: one ambush, one the
arena — a village losing people to the world and the
show, not to hunger: no starvation or dehydration
deaths on this seed. The cooks work the smoke racks
daily (129 villager preserve batches, 97,910 kcal
preserved on this seed in the identical trajectory;
the control corpus reproduces it). Knowledge/
capabilities missing on this seed: anything past wave
2 — the scale wall stands here as everywhere on this
band.

Pilot band (8 seeds, competent-nofeast, 100d): 7
villages survived to the horizon, 1 lost early (9751
at day 48). Median survival 100d (censored at the
horizon). Deaths 31 total; top causes: the arena 13,
starvation 5, ambush 3, sickness 3, monster 2, a wound
that wouldn't close 2, dehydration 1, contest 1,
lockjaw 1. Wave reach: wave 3 on 3 seeds (9753, 9754,
9755), wave 2 on the rest; wave 4/5 on none. Rank
stayed village on all 8 seeds. Who thrived: the
villages that reached wave 3 with a granary and
working cooks; who died and why: the arena dominates
the band's deaths, then starvation — the show takes
people, and the food economy still starves villages
that cannot keep the pantry ahead of the throttle.
The blank this run filled is a measurement blank (the
three-term equation now closes on every window, pilot
and confirm); the village's own blanks (wave 4+,
skilled preserver depth) are documented, not filled.

Confirm band (16 seeds, competent-nofeast, 100d): all
16 villages survived the horizon. Median survival
100d. Deaths 69 total; top causes: the arena 34,
contest 6, a wound that wouldn't close 6, monster 5,
sickness 5, ambush 5, starvation 1. Wave reach: wave
3 on 8 seeds, wave 2 on 8 seeds; wave 4/5 on none.
Rank village on all 16 seeds. The confirm band eats
better than the pilot band (1 starvation death in 69
vs 5 in 31) and still reaches nothing past wave 3 —
the scale wall stands on fresh seeds too.

## Reachability verdict

On both bands, reachable: waves 1–3, village rank,
haven tier 3, the full preserve ladder as used by
villagers (smoking exercised daily, including on
surplus stock). NOT reached on either band: waves
4–5, regional → national, the table, the win flag,
Arc II/III/IV (not recorded in these corpora's
top-level fields). The scale wall stands on both
bands; this arm closes a food-economy measurement
blank (the three-term equation runs clean, pilot and
confirm), it does not move the wall numbers.

## Wall numbers

Pilot judged corpus, competent-nofeast, seeds
9750–9757: national / table / wins: 0/8. Wave-4/5
unlocks: 0/8. Wave reach: wave 3 on 3 seeds, wave 2
on 5 seeds. Median survival: 100d (censored at the
100d horizon; 1 village lost early — 9751 at day 48).
Deaths 31 total (causes above). Rank village on all
8 seeds. Control corpus wall numbers are identical
(determinism leg).

Confirm judged corpus, competent-nofeast, seeds
9780–9795: national / table / wins: 0/16. Wave-4/5
unlocks: 0/16. Wave reach: wave 3 on 8 seeds, wave 2
on 8 seeds. Median survival: 100d (all 16 survived
the horizon). Deaths 69 total (causes above). Rank
village on all 16 seeds. Control corpus wall numbers
are identical (determinism leg 6a).

## Metric review

- The pre-registered metric did its job and the bar
  was honored: legs 0–5 pass exactly on the pilot,
  legs 6a–6c pass exactly on the confirm; no
  re-scoring was done. The 2029 NO-GO stands under
  its header (the two-term equation omits the smoke);
  this arm's GO stands under its header (the
  three-term equation closes). The correction is a
  new equation judged on fresh control-first sweeps,
  not an edit to the old verdict.
- Metric doubt, stated honestly: the equation still
  attributes all surplus-class change inside a window
  to the three terms. A three-door write of the EXACT
  surplus class inside a window would break closure
  as a positive residual — and no such residual
  appeared in 586 pilot + 1207 confirm checkable
  windows, so the limitation did not bite on either
  band. If a future band shows positive residuals,
  that is the named suspect, not a reason to re-open
  this verdict.
- The smokeFresh definition (cook duties before the
  first line of day D+1) proved robust: it covers the
  duty that says the first line (conversion precedes
  line) and any duty that smokes without a line, and
  it never double-counts (later cooks that day have
  cookSeenBefore ≥ 1 and belong to the next window).
  The 14 formerly-open pilot windows close with
  smokeFresh exactly equal to their two-term gaps —
  the term is measured, not fitted: no yield, rate,
  or scale factor is estimated anywhere in the
  analyzer (fresh kcal lost is read off the record;
  the 0.80 yield appears only in the worked-line
  identification, confirmed by the 15-day stamp).
- Balanced panel (MEASUREMENT.md §15): no panel
  comparison exists for this arm, for the reason
  stated in the prereg — §15 panels compare a base
  Game root against a lever-applied Game root over
  panel-driver observer rows, and this arm applies no
  lever and changes no game code. The before/after
  comparison here is instrument-off (control) vs
  instrument-on (judged) on identical seeds, judged
  by exact per-field equality (legs 2/6a), which is
  strictly stronger than a 23-metric panel aggregate
  for an instrument-neutrality question. No panel
  compare .md is attached, deliberately.
- Out-of-arm observations (for the coordinator to
  append to sim-findings.md; NOT chased in this run):
  - Morning-smoke picking rule, now evidenced: the
    day-29 smoke took the freshest surplus last in
    order — the reserve keeps soonest-spoiling stock
    fresh first, and the surplus (spoilDay 31, the
    latest clock among the day-29 eligible pile) is
    smoked only past the reserve. The picking rule is
    now readable off the record, not just the code.
  - The (9754,80) pre-fourth-door residual is CLOSED
    under the three-term equation (covering window 79,
    smokeFresh 2800) — the 2029 arm's ready-made test
    case is resolved, not just re-observed.
  - Confirm control has zero pre-fourth-door
    residuals (85/85 explained) — on fresh seeds the
    three-door view needs no fourth door at all.
  - The three-door-inside-window limitation did not
    bite on 1793 checkable windows across both bands;
    it remains a stated limitation, not a live doubt.

## Reproduction check (this run)

- Analyzer `scripts/analyze-smoke-eq-b.js` runs
  read-only against the four new corpora and prints
  the control view, determinism, focus + generalized
  windows, cross-checks, worked-line detail, and wall
  numbers.
- Proof `scripts/test-smoke-eq-b.js` requires the
  analyzer and asserts every prereg leg (pilot mode)
  plus the confirm legs with `--confirm`. Pilot run
  in this worktree: 6 PASS, 0 FAIL (legs 0–5). Confirm
  run: 4 PASS, 0 FAIL (legs 0, 6a–6c). Exit 0 both
  times. The proof encodes the prereg; the passes ARE
  the verdict.
- Analyzer correction, reported honestly: the first
  analyzer draft identified surplus preserved by
  name-prefix + spoilDay 44 only, which over-summed
  (1737 — it caught the other two Foraged-food stacks
  smoked the same morning, 500→400 and 271→217).
  The fix adds the yield-linked kcalEach 160 filter
  (200 × 0.80 rough, confirmed by the 15-day stamp);
  surplus preserved is then exactly 1120. This is an
  instrument fix, not a threshold change: the
  prereg's gated numbers (1400/1120/1737) never moved,
  and the proof's leg-0 check passed after the fix.
  The corrected analyzer is committed with the
  evidence (see below).
- Sweeps: control 8 seeds + judged 8 seeds (pilot),
  control 16 seeds + judged 16 seeds (confirm), no
  failures, no truncation, no write failures on any
  sweep. Per-seed log lines: pilot control 9750 days
  100 / deaths 2 / cook 191 / batches 129 / res 45 /
  stockdoor 658; pilot judged adds mealdraw 1376 +
  smokeEq 191; confirm control 9780 days 100 / deaths
  1 / cook 326 / batches 72 / res 30 / stockdoor 793;
  confirm judged adds mealdraw 1452 + smokeEq 326.
  No game harness changes, zero src/js changes, no
  jest run (nothing to test in js — the proof is node,
  not jest). No [needs-eyes]: this lands a
  measurement, not a player-visible change.
- Per-seed corpora: evidence/2026-10-26/
  sim-smoke-eq-b-control-corpus/ (8 files,
  stockdoor-b-cap1 band), evidence/2026-10-26/
  sim-smoke-eq-b-corpus/ (8 files, smoke-eq-b-cap1
  band), evidence/2026-10-26/
  sim-smoke-eq-b-confirm-control-corpus/ (16 files),
  evidence/2026-10-26/sim-smoke-eq-b-confirm-corpus/
  (16 files).
- Infrastructure notes: the container EPERM write flap
  blocked this run twice — first the safe-commit
  (git object writes failing) and shell writes
  generally (even `echo` redirection and `git init`
  in /tmp failed at the flap's peak); a background
  retry loop landed the prereg commit on attempt 2
  after ~3 min, and the sweeps' writeRobust retries
  absorbed the rest. The safe-commit index clobber
  hit the prereg commit (staged-deletion variant) —
  repaired via HEAD-blob cacheinfo, commits verified
  correct, worktree clean at each step. The `cp`
  of the sweep script failed persistently under the
  flap (0-byte files) while the tool-runtime write
  path succeeded — the sweep file was written that
  way and verified by diff against the mealdraw sweep
  (only intended changes). The two analyzer log files
  (worktree /tmp) are not committed.
