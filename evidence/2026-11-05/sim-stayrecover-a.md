# Evidence — sim-stayrecover-a (build: longer staying in fights)

Prereg: `evidence/2026-11-05/sim-stayrecover-a-prereg.md` (committed before
any judged sweep). Judge strictly against the prereg; this file reports the
numbers against its bars. Steve order 2026-11-05: "Address all gaps, get all
this built."

## Question

The wave-4 wall is a STAYING gap (sim-killconv-a, DIAG-GO): lost fights
land median 2 strikes in 5 rounds; median 44 dmg/strike vs 900-HP beast =
20.5 strikes to kill. Gap factors 2.5x strike density x 4.1x rounds
survived. The named fix direction is LONGER STAYING (flee repair +
in-fight recovery), NOT damage, beast HP, or gates.

## What was built (branch build-stayrecover, anchor e5e6aa59b)

1. **Flee repair — CONFIRMED, not rebuilt.** The pilot code (Nov 4,
   `scripts/policies/competent.js` gates + `competent-fleerepair-a.js`)
   was already on master. This arm re-ran its proof
   (`test-fleerepair-20261104.js`, ALL PASS on this anchor) and re-ran
   the confirm panel on fresh seeds (below). No pilot code changed.
2. **In-fight recovery — BUILT.** `Game.tbEatRations()` (src/js/game.js):
   one bite = 250 kcal from the day pack → +25 HP (1 HP / 10 kcal),
   capped at maxHp via addHealth; a 100–249 kcal pack is eaten whole;
   under 100 kcal or at full HP or already acted it refuses honestly
   and spends nothing. Costs the ACTION, not the movement. Food is real
   (packSpend on the day's pack). Player button 🍗 Eat in app.js
   (same selfbar pattern as Wait; title names the price).
   Policy (scripts/policies/competent.js, gate COMPETENT_RECOVER=1,
   default OFF; variant `competent-stayrecover-a.js` opts into the 3
   flee gates + recover): eat when hpPct < 0.50, a monster is in weapon
   range, the weakest living monster's HP > 50 (never instead of a
   killing blow), pack >= 100 kcal. Flee and ability/trick play still
   outrank eating. Instrument: stayrecover-instrument (fleerepair copy
   + tbEatRations wrap, kind 'eat'); analyzer adds the 'eat' turn
   class; summarizer adds eats / HP restored / kcal / rounds survived
   in lost fights / the approach-loop metric.
   Proof: `scripts/test-stayrecover-20261105.js` ALL PASS (verb on the
   real engine, policy stub guards, variant gates, analyzer+summarizer
   fixture). `check.js --quick`: **284 passed / 6 failed** (788s) —
   all 6 in the standing failure families (measurement-proof-update,
   measurement-workflow, mobile-combat-cadence, occupation-panels,
   phone-frame-proof, establishment-r20-fixes); NO new failures.
   Phone-frame-proof note: it was already failing (standing); the Eat
   button adds app.js to its mismatched inputs. The refresh needs real
   phone receipts (browser playtest) — not done here; same standing
   caveat as the 2026-11-03 ability buttons.

## Panel

- Seeds **99613–99624** (12, fresh — verified against all dated preregs
  + forbidden-band lists before the prereg), 140 days, death-aware,
  single anchor e5e6aa59b, single-base judging (all three legs run the
  same code; only the policy gates differ).
- Legs: **B** baseline (competent verbatim), **F** fleerepair
  (competent-fleerepair-a), **R** recovery (competent-stayrecover-a:
  flee gates + recover).
- Corpus: `evidence/2026-11-05/perseed-stayrecover-a/` (36 files).
  All 36 legs exit 0; 0 instrument errors on every leg; 0 orphans.
- Incident: the panel shell died once mid-R-leg (~17:35 UTC, after R
  seed 99616 — runtime teardown, no error in the log; same pattern as
  the morning service restarts). B and F were complete; the R leg was
  resumed cleanly for the remaining 8 seeds (99617–99624). No leg was
  re-run; no file was overwritten (the driver refuses to overwrite).

## Results (per-leg aggregates from stayrecover-summarize-20261105.js)

| metric | B baseline | F fleerepair | R recovery |
|---|---|---|---|
| TB exposures | 38 | 48 | 71 |
| wave-4 faced (TB + field) | 54 | 72 | 116 |
| wave-4 kills (killRows / linked) | 4 / 3 | 11 / 11 | 14 / 13 |
| escapes (TB) | 0 | 6 | 7 |
| flee-triggered fights | 23 | 2 | 2 |
| flee-attempt turns | 64 | 3 | 2 |
| barrier pushes | 0 | 1 | 0 |
| zero-tile moves | 70 | 0 | 11 |
| median strikes / fight | 2 | 3 | 3 |
| median strikes (lost fights) | 2 | 3 | 3 |
| median damage fraction (lost) | 0.061 | 0.094 | 0.157 |
| median rounds survived (lost) | 5 | 6 | 8 |
| median survival (days) | 83 | 87.5 | 89 |
| starvation deaths (total / player) | 3 / 0 | 5 / 0 | 5 / 0 |
| eats (successful) | 0 | 0 | 145 |
| HP restored by eating | 0 | 0 | 3,509 |
| kcal eaten in fights | 0 | 0 | 35,111 |
| median HP per eat | — | — | 25 |
| approach-loop fights (≥3 turns) | 0 | 0 | 1 (3 turns) |
| wins / national / table / wave-5 faced | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| median standing (final) | 125 | 125 | 200 |
| max standing | 275 | 405 | 345 |

## Verdicts (prereg bars)

### CONFIRM replication (F vs B) — GO (confirm)

1. Escapes >= 2 corroborated: **6, all 6 corroborated** (BARRIER CROSSED
   + "You escape" in the full fight transcript; the lines are said at
   fight end, after the last player turn closes — a turn-sayLines-only
   check misses them, which is why the first pass read 1/6 before the
   transcript check). B: 0. **PASS.**
2. Median strikes/fight: F 3 >= B 2. **PASS.**
3. Cost bar: starvation F 5 <= B 3 + 2 = 5 (exactly at the bound);
   player-flagged starvation 0 <= 0 + 2; median survival F 87.5 >=
   0.8 x 83 = 66.4. **PASS.**
   The pilot flee-repair code replicates on the current anchor with
   fresh seeds. The Nov 4 confirm's GO stands, now re-verified on
   e5e6aa59b with seeds 99613–99624.

### RECOVERY (R vs F) — GO

4. Median rounds survived in lost fights: R 8 > F 6; target 5 → 8+
   met exactly. **PASS.**
5. Median strikes in lost fights: R 3 >= F 3. **PASS** (held, not
   gained — the extra rounds convert to damage fraction, bar 6, not
   to more strikes).
6. Wave-4 kills: R 14 > F 11 (linked 13 > 11). **PASS.**
7. Eat actually used: 145 eats, 35,111 kcal, median 25 HP/eat
   (>= 20). **PASS.** The bite is real, not a counter.
8. Cost bar: starvation R 5 <= F 5 + 2; player-flagged 0; median
   survival R 89 >= 0.8 x 87.5 = 70. **PASS.**

## Sense-test (pre-registered) — PASS

Read 3 eat turns + 2 flee fights in the transcripts before judging.
Eating reads as a person grabbing food to stay alive: "You tear into
your rations mid-fight — 250 kcal, +25 HP. The pack is lighter now.
(830 kcal left)" — honest numbers, dwindling pack. One fighter ate 5
times in a single 12-round fight (seed 99613, day 86, vs The Reunion),
emptying the pack 950 → 700 → 450 → 200 → 0 kcal, and still died —
eating buys rounds, not invulnerability, and the narration says so
every time. Fleeing reads as a person escaping: "🚪 BARRIER CROSSED —
you crash through into Haven. The gate shuts behind you. The wild
goes quiet." + "You escape. The thicket keeps its secrets." No silent
no-op loops.

## What the numbers mean, plainly

- The flee repair holds on a fresh band: escapes go 0 → 6, all real,
  and the flee-attempt churn collapses (64 turns → 3). Fighters stop
  hammering a barrier that won't open and either get out or fight.
- Recovery works as designed: fighters stay in fights longer (lost
  fights last 8 rounds instead of 6), deal a bigger share of the
  beast's health before dying (0.094 → 0.157 of max HP), and kill
  more wave-4 beasts (11 → 14). The eat verb fires 145 times and
  every bite is paid for in real pack food.
- The wall at the top did NOT move: wins 0/36, national 0/36, wave-5
  faced 0/36 on every leg. Recovery buys rounds and kills, not wins
  (yet). The kill delta (+3 on 12 seeds) is small — the direction is
  consistent across all three recovery bars, but this panel does not
  claim the wave-4 wall is broken.
- Exposures rise (38 → 48 → 71): fighters survive to meet MORE
  wave-4 beasts, so the panel sees more fights per village, not just
  longer ones. Standing follows (median final 125 → 200).
- The approach loop did NOT reproduce on this band: 0 loop fights in
  B/F, 1 three-turn run in R — against the Nov 4 confirm's 5 fights /
  34 turns on seeds 99601–99612. The loop is band/geometry-specific,
  not a standing feature of this anchor. The approach fallback (landed
  separately, gated OFF in all three legs here) remains the named
  mechanism for that geometry; this panel does not judge it.
- Cost is real but bounded: fighters ate 35,111 kcal inside fights —
  food not eaten at dinner — and starvation totals did not move (5/5
  vs the 3 baseline, inside the cost bar; zero player starvations on
  any leg). The dinner test holds by measurement, not just by design.

## Metric review (for the next run, not this verdict)

- The escape corroboration must read the exposure's FULL transcript,
  not per-turn sayLines: the escape lines are said at fight end, after
  the last player turn closes. A sayLines-only check undercounts
  (1/6 on first pass vs 6/6 on the transcript).
- killRows vs linked kills differ by the unlinked row (B: 4 vs 3) —
  the bar cites killRows and the linked count is reported alongside;
  keep both.
- Median strikes in lost fights held flat (3 → 3) while damage
  fraction rose (0.094 → 0.157): the extra rounds are landing damage
  through abilities/tricks/ally hits, not through more player strikes.
  The next instrument should attribute the extra damage fraction by
  source (player strike vs ally vs ability vs trick).

## Next levers (named, not built here)

- **Wound-mill** (prereg-named secondary): 6/7 killconv kills were on
  pre-wounded beasts; the outmatched assessment still uses max HP, so
  a hurt fighter walks away from a crippled beast it could finish.
  Current-HP assessment is the named next lever.
- **Phone verification**: the 🍗 Eat button at 390x844 (tap, disable
  state, no layout break) — outstanding, same as the ability buttons.
  Needs a real browser playtest; node cannot prove it.
- **Scale**: the kill delta is +3 on 12 seeds. A bigger holdout
  (64-seed) re-measure is owed before anyone claims the wall moved.
- The flee repair + recovery ship as ONE staying package (the R
  variant), gated off by default. Landing as default play is a
  coordinator/Steve call, never made here.
