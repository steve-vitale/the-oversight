# sim-mealdraw-reprereg-b — meal-draw re-prereg pinned to a base commit (INSTRUMENT ONLY, no game change)

Run: oversight-flesh-out-loop-b, axis food-economy, arm
sim-mealdraw-reprereg-b (20261026T2029Z). Takes the 1930Z
coordinator's next blank 1: a meal-draw re-prereg pinned to
a base commit, with a stockdoor-only control sweep on that
HEAD first, then a re-judgment of the residual pair. The
prior arm (sim-mealdraw-b) was NO-GO because its prereg
bound its endpoints to a base that moved mid-run (commit
1377d03c3); its metric review ordered exactly this design:
pin the base, control first, judge against the control —
never against stale numbers.
Instrument: `scripts/mealdraw-capture.js` reused UNCHANGED
(no instrument rewrite; neutrality is itself a judged leg).
Sweeps: `scripts/sweep-stockdoor-b.js` (control) and
`scripts/sweep-mealdraw-b.js` (judged) reused UNCHANGED;
substrate, inflow, resid, and stockdoor captures reused
UNCHANGED; zero src/js changes. Analyzer:
`scripts/analyze-mealdraw-reprereg-b.js` (parameterized by
corpus directory; it reads control numbers from the control
corpus AT ANALYSIS TIME and hardcodes NO prior corpus's
numbers). Proof: `scripts/test-mealdraw-reprereg-b.js`.
Canon: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned
2d < cooked 5d < smoked 30d; smoking 16 ticks; "rot can't be
smoked back into food"; smoke yields 0.95 known / 0.80 rough).

## Pre-registration (binding, MEASUREMENT.md §14 — written AND committed BEFORE any sweep ran)

Full text: evidence/2026-10-26/
sim-mealdraw-reprereg-b-prereg.md (committed as fd95c270,
with a leg-0 correction committed as b20548293, both before
any sweep). Pinned base: f89a9b32d5c652e046caf27c25d2220212673988
("journey-social r57"). The pin is on the GAME TREE at that
commit (ancestor + empty game-tree diff on src/, index.html,
and all sweep/capture/harness/policy paths), not on the
literal branch tip — committing the prereg itself advances
HEAD by an evidence-only commit, so literal HEAD equality
would fail on the prereg commit and prove nothing about
trajectories; the correction is documented in the prereg
itself and was committed before any sweep.

Band: seeds 9750–9757, competent-nofeast (COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1), 100d death-aware, CAP=1. This 8-seed band IS
the pilot gate. Control corpus: evidence/2026-10-26/
sim-mealdraw-reprereg-b-control-corpus/. Judged corpus:
evidence/2026-10-26/sim-mealdraw-reprereg-b-corpus/.

GO threshold (all must hold): leg 0 base pin (ancestor +
empty game-tree diff at three checks); leg 1 control gate
(8/8 seeds, no truncation); leg 2 determinism (judged
matches control on every game-output field, 8/8 seeds);
leg 3 surplus-window reconciliation on focus seed 9750
(every checkable window closes residual 0, at least 3
checkable); leg 4 residual-pair disposition (control
pre-fourth-door residuals reported verbatim; old pair
absence is a finding, any present residual's covering
window must close); leg 5 cross-checks (meal-call,
drawSpoiled diff, truncation, ctxKcalMatch, resid join);
leg 6 confirm (16 fresh seeds 9780–9795, ONLY if legs 0–5
pass — the pilot gate binds).

## Verdict: NO-GO — on legs 3 and 4, literally, and this time the base did NOT move

Judged against the header only, never re-scored: NO-GO.
The failing legs, named:

- Leg 0 (base pin): PASS. Ancestor check passed and the
  game-tree diff to the pin was empty (0 lines) before the
  control sweep, between the sweeps, and after the judged
  sweep. No game-code or sweep/capture change since the pin.
- Leg 1 (control gate): PASS. Control sweep completed 8/8
  seeds, no truncation flag on any file, no write failure.
- Leg 2 (determinism): PASS, exactly. Judged corpus matches
  control corpus on every game-output field on all 8 seeds
  (dayTable classes, attribution flags, daysAlive, deaths,
  deathCauses, rank, waveReach, national/table/win,
  endReason) — 0 mismatches. The instrument is neutral on
  the pinned base, proven the correct way this time: two
  sweeps, one HEAD, identical game outputs.
- Leg 3 (surplus windows, focus seed 9750): FAIL. 81
  checkable windows; 67 closed, 14 OPEN, all with draws 0
  from the surplus class and negative residuals: days 28
  (−1400), 30 (−1400), 31 (−1000), 32 (−800), 33 (−400),
  34 (−1400), 35 (−600), 36 (−2000), 37 (−600), 38 (−2200),
  40 (−1800), 43 (−1800), 47 (−1800), 54 (−1200). Windows
  81, 82, 83 close exactly (see table below) — the prior
  arm's post-hoc finding reproduces — but the leg as
  written demands EVERY checkable window, and 14 fail.
- Leg 4 (residual-pair disposition): FAIL on the strict
  reading. The old pair (9750,83)/(9750,84) is ABSENT on
  the pinned base — a finding, not a failure, exactly as
  the prereg provides. But the control pre-fourth-door
  view has one other residual, (9754,80), and its covering
  window (9754 window 79: gross 3800, surviving 1000,
  draws 0, residual −2800) is OPEN. The prereg's "any
  other residual" clause therefore fails alongside leg 3.
- Leg 5 (cross-checks): PASS, and stricter than the prior
  arm (all seeds, not just 9750): 4631 villager-home meal
  calls, 0 mismatches (fresh + spoiled == drawn); 17
  drawSpoiled calls, 0 diff-sum mismatches — the
  desperation path's accounting is exercised for the
  first time on this band and it balances exactly;
  no mealdraw truncation; ctxKcalMatch 0 mismatches over
  1729 lines; resid join 0 misses.
- Leg 6 (confirm): NOT SPENT. Legs 0–5 did not all pass,
  so the pilot gate forbids confirm spend. No 9780–9795
  sweep ran. The generalized scan (586 checkable windows
  across the pilot band, 175 open) already shows the
  confirm equation would fail under the current form —
  the confirm must wait for the corrected equation (see
  "Metric review"), not run against a known-broken one.

## Control view (verbatim from the control corpus)

Pre-fourth-door view, three doors only, identical counting
rules to analyze-mealdraw-b.js: neutrality 383 bound / 338
attributed / 45 unattributed; attribution-flag reproduction
0 mismatches; lag distribution 1x40 / 2x4 / 3x1; median lag
1.0; coverage 44/45; sole residual (9754,80). Context, not
a leg: the control corpus matches the committed
sim-mealdraw-b corpus on every game-output field on all 8
seeds (0 mismatches) — the pinned base's trajectories are
the prior arm's base's trajectories on this band. The
journey landings between the prior arm and f89a9b32 did
NOT move this band. This NO-GO is therefore about the
metric, not about base movement: the re-prereg design
worked (control first, pinned tree), and the equation it
carried was incomplete.

## Gross vs surviving pile, every judged night (focus seed 9750)

Surplus class ('Foraged food', 200, D+3, granaryDays null)
per window D (first-cook D to first-cook D+1). Gross =
night-D stockdoor writes; surviving = dayPantry[D+1] value
of the surplus class; before is 0 on every window below
(the class is newly written each night). A night's gross
write is NEVER its surviving pile — the table keeps them
separate, and the OPEN rows are exactly the nights where
they differ without any meal draw.

| night | gross | draws | surviving | residual | |
| 8 | 2000 | 800 | 1200 | 0 | CLOSED |
| 18 | 1800 | 600 | 1200 | 0 | CLOSED |
| 21 | 2400 | 1600 | 800 | 0 | CLOSED |
| 22 | 2200 | 1600 | 600 | 0 | CLOSED |
| 23 | 3000 | 1200 | 1800 | 0 | CLOSED |
| 24 | 1400 | 600 | 800 | 0 | CLOSED |
| 25 | 1400 | 600 | 800 | 0 | CLOSED |
| 26 | 2400 | 1200 | 1200 | 0 | CLOSED |
| 27 | 2000 | 0 | 2000 | 0 | CLOSED |
| 28 | 2000 | 0 | 600 | -1400 | OPEN |
| 29 | 2000 | 0 | 2000 | 0 | CLOSED |
| 30 | 2200 | 0 | 800 | -1400 | OPEN |
| 31 | 2800 | 0 | 1800 | -1000 | OPEN |
| 32 | 2200 | 0 | 1400 | -800 | OPEN |
| 33 | 3000 | 0 | 2600 | -400 | OPEN |
| 34 | 2800 | 0 | 1400 | -1400 | OPEN |
| 35 | 2600 | 0 | 2000 | -600 | OPEN |
| 36 | 2600 | 0 | 600 | -2000 | OPEN |
| 37 | 2600 | 0 | 2000 | -600 | OPEN |
| 38 | 2800 | 0 | 600 | -2200 | OPEN |
| 39 | 2000 | 0 | 2000 | 0 | CLOSED |
| 40 | 2400 | 0 | 600 | -1800 | OPEN |
| 41 | 2600 | 0 | 2600 | 0 | CLOSED |
| 42 | 3200 | 0 | 3200 | 0 | CLOSED |
| 43 | 3800 | 0 | 2000 | -1800 | OPEN |
| 44 | 3400 | 0 | 3400 | 0 | CLOSED |
| 45 | 2600 | 0 | 2600 | 0 | CLOSED |
| 46 | 3400 | 0 | 3400 | 0 | CLOSED |
| 47 | 3600 | 0 | 1800 | -1800 | OPEN |
| 48 | 3000 | 0 | 3000 | 0 | CLOSED |
| 49 | 2800 | 0 | 2800 | 0 | CLOSED |
| 50 | 3400 | 0 | 3400 | 0 | CLOSED |
| 51 | 3400 | 0 | 3400 | 0 | CLOSED |
| 52 | 2600 | 0 | 2600 | 0 | CLOSED |
| 53 | 2600 | 0 | 2600 | 0 | CLOSED |
| 54 | 2000 | 0 | 800 | -1200 | OPEN |
| 55 | 2400 | 0 | 2400 | 0 | CLOSED |
| 56 | 2400 | 0 | 2400 | 0 | CLOSED |
| 57 | 2200 | 0 | 2200 | 0 | CLOSED |
| 58 | 3200 | 0 | 3200 | 0 | CLOSED |
| 59 | 2800 | 0 | 2800 | 0 | CLOSED |
| 60 | 3800 | 0 | 3800 | 0 | CLOSED |
| 61 | 2800 | 0 | 2800 | 0 | CLOSED |
| 62 | 2800 | 0 | 2800 | 0 | CLOSED |
| 63 | 3200 | 0 | 3200 | 0 | CLOSED |
| 64 | 3200 | 0 | 3200 | 0 | CLOSED |
| 65 | 2400 | 0 | 2400 | 0 | CLOSED |
| 66 | 3600 | 0 | 3600 | 0 | CLOSED |
| 67 | 3200 | 0 | 3200 | 0 | CLOSED |
| 68 | 3000 | 0 | 3000 | 0 | CLOSED |
| 69 | 2200 | 0 | 2200 | 0 | CLOSED |
| 70 | 2800 | 0 | 2800 | 0 | CLOSED |
| 71 | 3200 | 0 | 3200 | 0 | CLOSED |
| 72 | 3600 | 0 | 3600 | 0 | CLOSED |
| 73 | 3400 | 0 | 3400 | 0 | CLOSED |
| 74 | 3400 | 0 | 3400 | 0 | CLOSED |
| 75 | 4200 | 0 | 4200 | 0 | CLOSED |
| 76 | 3200 | 0 | 3200 | 0 | CLOSED |
| 77 | 3200 | 0 | 3200 | 0 | CLOSED |
| 78 | 4600 | 0 | 4600 | 0 | CLOSED |
| 79 | 3400 | 0 | 3400 | 0 | CLOSED |
| 80 | 3800 | 0 | 3800 | 0 | CLOSED |
| 81 | 3600 | 0 | 3600 | 0 | CLOSED |
| 82 | 3800 | 0 | 3800 | 0 | CLOSED |
| 83 | 4400 | 0 | 4400 | 0 | CLOSED |
| 84 | 4000 | 0 | 4000 | 0 | CLOSED |
| 85 | 4600 | 0 | 4600 | 0 | CLOSED |
| 86 | 4400 | 0 | 4400 | 0 | CLOSED |
| 87 | 2800 | 0 | 2800 | 0 | CLOSED |
| 88 | 4000 | 0 | 4000 | 0 | CLOSED |
| 89 | 4400 | 0 | 4400 | 0 | CLOSED |
| 90 | 2800 | 0 | 2800 | 0 | CLOSED |
| 91 | 3800 | 0 | 3800 | 0 | CLOSED |
| 92 | 3400 | 0 | 3400 | 0 | CLOSED |
| 93 | 3400 | 0 | 3400 | 0 | CLOSED |
| 94 | 3600 | 0 | 3600 | 0 | CLOSED |
| 95 | 4400 | 0 | 4400 | 0 | CLOSED |
| 96 | 3000 | 0 | 3000 | 0 | CLOSED |
| 97 | 4400 | 0 | 4400 | 0 | CLOSED |
| 98 | 3800 | 0 | 3800 | 0 | CLOSED |
| 99 | 3600 | 0 | 3600 | 0 | CLOSED |

81 checkable windows, 67 closed, 14 open. The open
windows cluster early (days 28–54, when the cook still
smokes) and vanish after day 54 (when the surplus
survives whole every night) — the shape of the missing
term, not random noise.

## The missing term, proven on window 28: the morning smoke

The prereg's equation has two consumers: meal draws and
nothing else. Window 28 proves a third consumer — the
next morning's first cook smoke, which runs before the
first-cook snapshot that defines the window's "after":

- Night 28 writes 2000 kcal of surplus (7 stockdoor
  calls, all 'Foraged food', spoilDay 31). Window draws
  from the surplus class: exactly 0. Day-29 first-cook
  snapshot shows only 600 kcal of the class left: gap
  exactly 1400 kcal, with no draw to explain it.
- Day 29's first cook line is WORKED: "Sierra worked the
  smoke racks too — 3 batches preserved (~1737 kcal,
  keeps a couple of weeks)." The day-29 snapshot's new
  dried stacks total exactly 1737 kcal — the narration
  and the record agree to the kcal.
- Of that 1737, exactly 1120 kcal is a new dried stack of
  7 × 160-kcal units at spoilDay 44: 1400 fresh × 0.80
  (the rough smoke yield in canon) = 1120, unit for unit
  (7 × 200 fresh → 7 × 160 dried). The surplus gap IS
  the smoke: the morning cook smoked 1400 kcal of the
  night's own surplus before the snapshot was taken.
- Why windows 81–83 close: those mornings' first cooks
  are racksFull/plain (no smoke runs — the racks are
  full, so the cook leaves the fresh pile for dinner),
  so the smoke term is 0 and the two-term equation
  holds exactly. Why the open windows cluster early:
  early on the racks are not full, the cook smokes
  daily, and the smoke takes fresh surplus; later the
  racks fill and the smoke term goes to 0. The equation
  needs the smoke term; the prior arm's leg-5 pattern
  already shows how to evidence it (dried stacks
  appearing in dayPantry[D+1] absent in dayPantry[D],
  converted back at the cook's yield, cross-checked
  against the worked line's kcal). Which fresh stacks
  the smoke picks (it took the freshest surplus here,
  not the oldest) is a separate question for the next
  run's analysis — the term's existence and size are
  proven, its picking rule is not yet.

Corroboration across the band (not a leg): 586
checkable surplus windows across all 8 judged seeds,
175 open, all with the same signature (draws 0 or
small, surviving below gross by the smoked amount).
The smoke term is systematic, not a seed-9750 quirk.

## Sense samples (plain words — meaning, not just counts)

Seed 9750, night 28 (an OPEN window, judged against the
smoke story): the player eats first — want 50, took one
200-kcal unit at spoilDay 29, the soonest-spoiling stack
(honest indivisible overdraw, as before). Then all nine
villagers eat 1798–2200 kcal each from their own day's
work, draw NOTHING from the pantry, and bank surplus
(gives 0–709; seven stockdoor calls, 2000 kcal stored).
Nobody went hungry; nobody touched the surplus. Next
morning Sierra says she smoked 3 batches (~1737 kcal)
— and the record shows exactly 1737 kcal of new dried
stock, including the surplus's 1120. The story coheres
completely: the village banks surplus at night and the
cook smokes part of it in the morning, and she says so
with true numbers. The "gap" is not food from nowhere
or food vanishing — it is preserved food, narrated.

Seed 9750, night 82 (a CLOSED window): the player eats
first — want 170, took 355 (one 155-kcal Expedition haul
+ one 200-kcal Foraged food, both spoilDay 81, the
soonest-spoiling stacks). One villager tops up: 200
kcal at spoilDay 81. Everyone else eats 1719–2300 from
their own work and banks 18–1047 (eight stockdoor calls,
3800 kcal). Next morning: plain cook lines only, no
smoke, no racks-full complaint — the surplus survives
whole (3800 = 3800), exactly as the record says. The two
nights together are the same village at different
fullness: when the cook smokes, surplus converts; when
she doesn't, it survives. Nothing robotic, static, or
repeated is flagged: the repeated plain-cook template
fires with true numbers and true situations, and the
villagers' differing gives (18 vs 1047) are real people
differing.

## Village assessment (what the village looked like)

Seed 9750 (focus, pinned base): survived the full 100d
horizon, village rank, wave 2 reached, haven tier 3 (the
granary stands). Two deaths: one ambush, one the arena —
a village losing people to the world and the show, not
to hunger: no starvation or dehydration deaths on this
seed. The cooks, Sierra and Heidi, work the smoke racks
daily (129 villager preserve batches, 97,910 kcal
preserved on this seed in the prior arm's identical
trajectory; the control corpus reproduces it).
Knowledge/capabilities missing on this seed: anything
past wave 2 — the scale wall stands here as everywhere
on this band.

Band (8 seeds, competent-nofeast, 100d): 7 villages
survived to the horizon, 1 lost early (9751 at day 48).
Median survival 100d (censored at the horizon). Deaths
31 total; top causes: the arena 13, starvation 5, ambush
3, sickness 3, monster 2, a wound that wouldn't close 2,
dehydration 1, contest 1, lockjaw 1. Wave reach: wave 3
on 3 seeds (9753, 9754, 9755), wave 2 on the rest; wave
4/5 on none. Rank stayed village on all 8 seeds. Who
thrived: the villages that reached wave 3 with a granary
and working cooks; who died and why: the arena dominates
the band's deaths, then starvation — the show takes
people, and the food economy still starves villages that
cannot keep the pantry ahead of the throttle. The blank
this run filled is a measurement blank (the re-prereg
ran, the control-first design validated, the smoke term
identified); the village's own blanks (wave 4+, skilled
preserver depth) are documented, not filled.

## Reachability verdict

On this band, reachable: waves 1–3, village rank, haven
tier 3, the full preserve ladder as used by villagers
(smoking exercised daily, including on surplus stock).
NOT reached on this band: waves 4–5, regional →
national, the table, the win flag, Arc II/III/IV (not
recorded in this corpus's top-level fields). The scale
wall stands on this band; this arm closes a
food-economy measurement blank (the re-prereg ran clean
and the smoke term is proven), it does not move the
wall numbers.

## Wall numbers (judged corpus, competent-nofeast, seeds 9750–9757)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave
reach: wave 3 on 3 seeds, wave 2 on 5 seeds. Median
survival: 100d (censored at the 100d horizon; 1 village
lost early — 9751 at day 48). Deaths 31 total (causes
above). Rank village on all 8 seeds. Control corpus wall
numbers are identical (determinism leg).

## Metric review

- The pre-registered metric did its job and the bar was
  honored: legs 0, 1, 2, and 5 pass exactly; legs 3 and 4
  fail on named numbers; no re-scoring was done. The
  NO-GO is not a base-movement artifact this time — the
  pin held, the control reproduced the prior corpus
  exactly, and the equation still missed. That is the
  metric working as designed: it caught an incomplete
  equation instead of a moved base.
- Metric doubt, stated honestly: leg 3's equation
  (after = before + writes − draws) omits the morning
  smoke term. The omission was invisible on windows
  81–83 (smoke term 0 there) and fatal on early windows
  (smoke term up to 2200). The equation also omits
  three-door writes inside the window (inflow records
  carry no spoilDay, so those writes cannot be
  attributed to a class) — on window 28 the non-surplus
  dried gain (617 kcal) has no matching fresh drop in
  the window's class deltas, consistent with fresh
  written inside the window and smoked before the
  snapshot. A complete equation needs: after = before +
  stockdoorWrites + threeDoorWritesToClass − draws −
  smokeFresh, with the smoke term evidenced as in the
  prior arm's leg 5 (new dried stacks in dayPantry[D+1]
  converted back at the cook's yield, cross-checked
  against the worked line's kcal) and the three-door
  term bounded or instrumented separately.
- Proposed revision for the NEXT run (not applied here):
  pre-register the three-term equation (writes − draws
  − smokeFresh, smoke evidenced per above, with the
  worked-line kcal as the cross-check); judge the focus
  seed's windows under it; keep the control-first +
  game-tree pin design unchanged (it worked); keep the
  strict leg-4 covering-window rule, but state it
  per-seed explicitly (the current prereg's parenthetical
  assumed 9750, and the proof had to extend it to
  9754 — the extension is reported here, and the next
  prereg should write it out). Do NOT spend a confirm
  band until the revised equation passes the pilot.
- No revision is applied to THIS run's verdict. The
  prior arms' verdicts stand under their own headers;
  this arm's NO-GO stands under its header; the smoke
  term is a finding for the next prereg, not an edit to
  this verdict.
- Balanced panel (MEASUREMENT.md §15): no panel
  comparison exists for this arm, for the reason stated
  in the prereg — §15 panels compare a base Game root
  against a lever-applied Game root over panel-driver
  observer rows, and this arm applies no lever and
  changes no game code. The before/after comparison
  here is instrument-off (control) vs instrument-on
  (judged) on identical seeds, judged by exact
  per-field equality (leg 2, passing). No panel compare
  .md is attached, deliberately.
- Out-of-arm observations (for the coordinator to append
  to sim-findings.md; NOT chased in this run):
  - Morning-smoke picking rule: the day-29 smoke took
    the freshest surplus (spoilDay 31, latest clock),
    not the oldest stock — the smoke's stack-picking
    order is unproven and worth one focused trace.
  - drawSpoiled now exercised: 17 drawSpoiled calls on
    this band (0 on seed 9750 alone in the prior arm),
    all 17 diff sums matching exactly — the desperation
    path's accounting is now proven on real draws.
  - The (9754,80) pre-fourth-door residual persists on
    the pinned base with the same signature as the old
    pair (a bound day whose pile the three doors don't
    explain); its covering window is open by the smoke
    term, so it should close under the revised equation
    — a ready-made test case for the next prereg.
  - First-cook snapshot timing: dayPantry snapshots are
    taken at say-time of the first cook line, AFTER that
    cook's smoke has run (window 28 proves it: the
    snapshot already contains the smoked dried stock).
    Any future window equation must treat the first
    cook's smoke as inside the window, not after it.

## Reproduction check (this run)

- Analyzer `scripts/analyze-mealdraw-reprereg-b.js` runs
  read-only against the two new corpora and prints the
  control view, determinism, focus + generalized windows,
  cross-checks, and wall numbers.
- Proof `scripts/test-mealdraw-reprereg-b.js` requires the
  analyzer and asserts every prereg leg (pilot mode) plus
  the strict leg-4 covering-window rule. Run in this
  worktree: 15 PASS, 2 FAIL — the failures are leg 3
  (14 open focus windows, residuals listed) and leg 4
  (strict: (9754,80) covering window 79 open, residual
  −2800). Exit 1. The failures ARE the verdict: the proof
  encodes the prereg, and the prereg's equation omits
  the smoke term. Every instrument-internal check passes
  (determinism 8/8, meal-call 4631/4631, drawSpoiled
  17/17, ctxKcalMatch, resid join, no truncation).
- Confirm mode (`--confirm`) was NOT run: the pilot gate
  forbids it, and no confirm corpora exist.
- Sweeps: control 8 seeds (re-run: the first control
  attempt wrote seeds 9750–9753 then its background
  session was lost with no crash evidence — process
  gone, no log; the re-run with a log file completed
  8/8 deterministically, per-seed log lines identical
  for the re-done seeds); judged 8 seeds, no failures.
  No truncation, no write failures on either sweep.
  Per-seed log lines: control 9750 days 100 / deaths 2 /
  cook 191 / batches 129 / res 45 / stockdoor 658;
  judged adds mealdraw counts (9750: 1183+ records —
  judged adds mealdraw counts (9750: 1376 records).
  No game harness changes, zero src/js
  changes, no jest run (nothing to test in js — the
  proof is node, not jest). No [needs-eyes]: this lands
  a measurement, not a player-visible change.
- Per-seed corpora: evidence/2026-10-26/
  sim-mealdraw-reprereg-b-control-corpus/ (8 files,
  stockdoor-b-cap1 band) and evidence/2026-10-26/
  sim-mealdraw-reprereg-b-corpus/ (8 files,
  mealdraw-b-cap1 band).
- Infrastructure notes: the safe-commit index clobber
  hit BOTH prereg commits (staged-deletion variant on
  the first, stale-blob variant on the second) — repaired
  via HEAD-blob cacheinfo each time, commits verified
  correct, worktree clean at each step. The two sweep
  log files (worktree root) are deleted before the final
  commit and are not committed.
