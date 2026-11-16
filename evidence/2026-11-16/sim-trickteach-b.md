# sim-trickteach-b — LEVER: one observation teaches a wave-4 trick

**Arm:** sim-trickteach-b · **Loop B run:** fleshout-loop-b-20261116T1530Z
**Prereg:** `evidence/2026-11-16/sim-trickteach-b-prereg.md` (commit `04314c97f`, frozen first)
**Lever commit:** `ba3476258` · **Proof-fix commit:** `c0bc8953a`
**Band:** seeds 102211–102218 (8 seeds, competent policy, 150d death-aware)
**Verdict: PILOT NO-GO** — bar 1 failed (0 armed launched wave-4 kills vs ≥ 2).
The lever is reverted on the branch; the prereg, evidence, instrument,
corpora, analysis and panel are kept — the measurement is worth recording
(see Metric review).

## What the lever was

The village learns a monster's trick after **two** survived observations
("two observations teach the village the trick", `docs/MONSTER-WAVES.md`).
The lever made **one** observation enough, env-gated (`TRICKTEACH=1`,
`trickLearnThreshold()` in `src/js/game.js`, default OFF, zero behaviour
change when unset), applied on one shared bar to all three learning
channels: villager survived encounters, witnessed kills, and the scholar
channel. Narration is threshold-aware ("one sighting was enough" at 1,
"lived to tell it, twice" at 2).

Context: killfail (band 102041–102048) found trick-unknown 9/9 on launched
wave-4 fights — villagers reach the fight without knowing the monster's
trick, and the gate demands a known trick. This arm is the lever form of
that finding (tracker blank #2 / killfail finding #2436). Loop A (1515Z)
runs the learning-rate DIAG on band 102141–102148 — untouched by this arm.

## Pilot results — before / after (control vs armed)

Both legs exit 0, 8/8 files each, 0 instrument errors.

| Metric | Control | Armed (TRICKTEACH=1) | Bar |
| --- | --- | --- | --- |
| Launched wave-4+ fights | 5 | **0** | — |
| Launched wave-4+ kills (distinct meetings) | 0 | **0** | ≥ 2 — **FAIL** |
| Trick species learned / transitions | 10 / 23 | 15 / 40 | mechanism |
| Wild fights trick-known at contact | 48/114 (42%) | 157/202 (78%) | mechanism |
| All-origins wave-4 kills | 7 | 11 | diagnostic |
| All-origins wave-5 kills | 1 | 0 | diagnostic |
| Wild fights (all origins) | 114 | 202 | diagnostic |
| Wild kill rate per wild fight | 8/114 = 7.0% | 11/202 = 5.4% | diagnostic |
| Gate rows seek / avoid / null | 0 / 21 / 4 (25) | 0 / 8 / 5 (13) | diagnostic |
| Starvation deaths | 5 | 7 | ≤ control+2 — PASS |
| Median survival | 151d | 149.5d | ≥ 0.8× control (120.8d) — PASS |
| Total deaths | 546 | 597 | diagnostic |
| Wins | 0/8 | 0/8 | wall |
| National by scaleRank ≥ 2 | 0/8 | 0/8 | wall |
| National by standing ≥ 200 | 3/8 | 4/8 | wall |
| Wave-4 unlocked | 8/8 | 8/8 | wall |
| Wave-5 unlocked | 3/8 | 4/8 | wall |

**Bar 1 FAIL.** The armed leg formed **zero launched fights at all**, so
the pre-registered primary could not pass — not "the lever failed to turn
fights into kills", but "the judged population never formed on the armed
leg". The control leg's own launched count is the binding comparator:
5 launched fights, 0 kills (outcomes vFlee 3, vDie 1, evade 1; trick-unknown
4/5, mauled 4/5). The killfail baseline (0/9 launched fights) is reference
only.

**Bar 2 PASS.** Starvation 7 vs 5 (≤ control+2); median survival 149.5d vs
151d (≥ 120.8d).

**Bar 3 PASS.** Instrument clean: 0 errors, 8/8 parse both legs. Proof test
52/52 green on the lever tip (see below).

**The mechanism DID move.** Tricks learned rose 10→15 species (23→40
transitions); trick-known at wild contact rose 42%→78%. All-origins wave-4
kills rose 7→11 — but wild fights nearly doubled (114→202), so the kill
rate per wild fight actually fell (7.0%→5.4%). The lever bought more
fights, not better fights. And every one of the 11 armed wild kills had
the trick known at contact (true→true), while on the control leg only 3/8
wild kills did — including a 10-round, 536-damage herald kill with the
trick unknown. Knowing the trick is neither necessary nor sufficient for a
wild kill; see the sense test.

## Balanced panel

`evidence/2026-11-16/trickteach-b-panel.{json,md}` — **decision:
review_required** (8 paired cases). No win/national movement. Two death
signals: villageDeaths regression_watch (+6.375/run, CI −8.25 to 22) and
villageDeaths100Days **regression_signal (+8.29, CI 0.23 to 17.64)**. The
pre-registered cost bar (starvation + median survival) passes, but the
panel says the lever's price is deaths — armed villages die faster per
calendar day even though they survive nearly as long in median. That price
is part of the NO-GO picture, not a separate verdict.

## Reachability verdict

**The lever does not reach the winnability chain.** It changes what the
village knows, and it changes wild-fight outcomes, but it does not produce
a single launched wave-4 fight on 8 seeds — the population the gate needs
never forms. The gate's SEEK never fired on either leg (0 seek both legs;
control avoid 21, armed avoid 8). Faster trick learning is not the binding
constraint on launched kills; whatever keeps villagers from launching
(trip windows, party formation, the gate's other conditions) is upstream of
trick knowledge. A follow-up that re-runs this lever needs a different
primary (see Metric review) and, more importantly, a diagnosis of why
launches are 0–5 per 8 villages at all.

## Village assessment (assessor's read)

The armed villages are busier and bloodier: they meet more monsters
(202 wild fights vs 114), know more tricks, and kill more wave-4 beasts in
the wild — and die more for it (597 deaths vs 546, +8.29 deaths/100d). The
extra knowledge does not make the village safer; it makes it bolder, and
the boldness costs lives. Two armed villages were lost by day 83
(102212 d83, 102216 d82); the control leg's earliest loss was day 117.
Standing is slightly better armed (national by standing 4/8 vs 3/8), but
no village reaches national by scaleRank on either leg and none wins.
The village that knows the trick still dies to the trick (see below).

## Sense test — read the fights, not just the counts

**The prereg asked for one armed-leg launched fight quoted end to end.
There is none to quote** — the armed leg launched zero fights. What follows
is the control leg's most telling launched sequence, plus the learn beats
the lever produces (proven live by the proof test — the judged corpora
carry no narration; `say` is silenced in sims, so no COUNTER LEARNED beat
appears in any per-seed file).

### Dmitri Sokolov vs the Eulogy — seed 102212, day 65, control leg

Three meetings with the same beast in one day, at ever-lower health:

**Meeting 1** — vFlee, 3 rounds, 63 dealt, 46 taken, trick false→false.
> Dmitri has Crude bow but no arrows — the string stays drawn, useless.
> R1: Dmitri strikes for 17 (658 left) … R1: Epitaph hits Dmitri for 17 (63 left)
> R2: Dmitri strikes for 13 … Dmitri is losing — shouts for help! Ingrid charges in!
> R3: Dmitri strikes for 13 … R3: Epitaph hits Dmitri for 13 (34 left)
> Dmitri sees how this ends — and runs while running still works.

**Meeting 2** — vFlee, 1 round, 16 dealt, 17 taken, trick false→**true**.
The second survived observation teaches him the Eulogy's trick (threshold 2).
> R1: Dmitri strikes for 16 (596 left) … R1: Epitaph hits Dmitri for 17 (17 left)
> Dmitri is past holding — they run while running still works.

**Meeting 3** — **vDie, 1 round, 0 dealt, 17 taken, trick true→true.**
He knew the trick. He performed it — and died anyway.
> Dmitri has Crude bow but no arrows — the string stays drawn, useless.
> R1: Dmitri contradicts the narration — it says Dmitri runs — Dmitri advances.
> Dmitri's gear absorbs 35.
> R1: Final Chapter hits Dmitri for 17 (0 left)

He entered the third meeting at 17 HP and the Eulogy's finishing move took
exactly 17. The counter is a real, voiced action ("contradicts the
narration") — it is not a damage number. Knowing the trick and using it
does not save a fighter who walks back into the same beast the same day
with no arrows, no rest, and 17 HP. The binding constraint here is not
knowledge; it is the decision to re-engage while crippled, and the gear
(a bow with no arrows) that leaves him dry in all three meetings.

### The learn beat, armed (TRICKTEACH=1, proof-test live child)

The beat is fully voiced, trick + reveal + threshold-aware count language:

> 💡 COUNTER LEARNED — a wall of almost-faces, all watching you: Lose on
> purpose — tank the prediction. It is about the NEXT action, not your
> history — the predictable get countered. Lose on purpose: stand there
> and take the soft prediction for two rounds and its model goes mushy.
> (The most engaging thing is an upset; be the upset.) (you lived to
> tell it — one sighting was enough — the village pieced it together.)

> 💡 COUNTER LEARNED — a sound like a feast with no people at it: Poison
> the meal. It cannot tell good food from bad — it gorges, it does not
> chew, and it eats the grid first, you second. Feed it spoiled or
> diseased meat and watch it vomit out the fight. (Or starve the field:
> burn your own crops and deny it fuel. Guard the pantry — always.)
> (You lived to tell it — one sighting was enough, and now you see the
> pattern.)

Judgment: the learning **is** voiced — a villager who learns a trick says
so, names the counter, and the "one sighting was enough" phrasing tells
the player the rule changed. What is not voiced anywhere is the *cost*:
nothing in the beat says the village paid for the knowledge, and nothing
in the fight log says Dmitri should not have gone back. The narration
teaches the trick; it does not teach judgment.

### Armed wild kills — the lever's real effect

All 11 armed wave-4 wild kills had the trick known at contact. The real
fights (not 0-round finish-offs of already-wounded beasts): Omar Farouk vs
herald, d96, 6 rounds, 134 dealt / 52 taken; Ruby Callaghan vs
congregation, d128, 8 rounds, 188 dealt / 51 taken; Giulia Bianchi vs
audit, d149, 2 rounds, 125 dealt / 13 taken; Amelia Graham vs herald,
d148, 5 rounds, 65 dealt / 65 taken. Four of the 11 are 0-round kills
(dealt 11–17, taken 0) — defenders finishing a crippled beast that walked
in already nearly dead (the wound-mill behaviour, not a fight).

## Blanks filled

- **Tracker blank #2 (lever form of killfail #2436):** one observation
  teaches — mechanism proven (15 species / 40 transitions vs 10 / 23;
  wild trick-known 78% vs 42%), but the judged population (launched
  wave-4 fights) never formed on the armed leg, so the lever form of the
  finding is NO-GO. The finding itself stands: trick-unknown 4/5 on the
  control leg's launched fights.
- **Drift check:** frozen D3 said DRIFT on 7/8 seeds. The first-learn probe
  (`scripts/trickteach-firstlearn-probe.js`, armed, days = first-divergence
  day) settles it — first learn (any wave/channel) precedes or equals the
  divergence day on all 7 seeds (see Metric review). Corrected verdict:
  **CLEAN 8/8**. No substrate drift; the legs differ only by the flag.
- **Cost bar precedent:** starvation + median survival pass; the panel's
  deaths/100d regression_signal is the price the pre-registered bar did
  not capture — see Metric review.

## Metric review (for the NEXT run — this run is not re-scored)

1. **D3 first-lever-day was defined too narrowly.** It only saw wave-4/5
   *fight-row* trick transitions, but the lever also fires on waves 1–2
   (from day 1) and via the scholar channel — invisible to fight rows.
   Probe results (armed, first learn any wave/channel vs first divergence
   day): 102211 d8 ≤ d31; 102212 d8 ≤ d28; 102213 d32 ≤ d32; 102214 d32 ≤
   d33; 102215 d33 ≤ d41; 102217 d9 ≤ d9; 102218 d30 ≤ d51. Every
   divergence is explained by lever action on or before that day; the
   only CLEAN seed (102216, diverges d51 = first lever day d51) is the
   exception that proves the rule. Next drift check must define
   first-lever-day as first learn on any wave/channel (the probe's
   definition), not first wave-4/5 fight-row transition.
2. **Bar 1's population never formed.** "Armed launched wave-4 kills ≥ 2"
   assumes launches happen; on this band the armed leg launched 0 fights
   in 8 villages. A revised primary for the next run: **all-origins wave-4
   kills** (armed 11 vs control 7 here — the lever's real effect, wild
   fights included), with launched kills as a secondary, and a floor on
   launches (e.g. report launched-fight count; if 0, the run is
   uninformative on the gate, not a lever failure). Do not re-score this
   run: it stays NO-GO on its frozen bar.
3. **The cost bar missed the deaths price.** Starvation + median survival
   pass while deaths/100d is a panel regression_signal (+8.29, CI 0.23 to
   17.64). Next run's cost bar should include total deaths (or
   deaths/100d) alongside starvation — the panel caught what the bar did
   not.
4. **Instrument note — wild-row null `hpEntry`.** `fighter.hpEntry` is null
   for some wild rows (a visitor/joiner with no village health record;
   `hpAtEntry` fallbacks all miss) and `mHpEntry` is null for ephemeral
   meetings with range HP. The analyzer tolerates wild rows (reconstructs
   via `effectiveMhp`); the proof test now scopes its row-shape check to
   launched fights only, where 100% classify. No data lost.
5. **0-round wild kills** (dealt 11–17, taken 0) are wound-mill finish-offs
   of already-wounded beasts, not fights. A future kill metric should
   separate them (rounds ≥ 1) from real fights.

## Wall numbers (both national definitions)

| | Control | Armed |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National by scaleRank ≥ 2 | 0/8 | 0/8 |
| National by standing ≥ 200 | 3/8 | 4/8 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 3/8 | 4/8 |
| Median survival | 151d | 149.5d |
| Total deaths | 546 | 597 |
| Starvation deaths | 5 | 7 |

## Drift check (corrected)

Frozen D3 (`scripts/trickteach-drift-check.js`, first-lever-day = first
wave-4/5 fight-row learn): DRIFT on 7/8 seeds (first-divergence days
9–51 vs first wave-4/5 learn days 51–122 or null). **Corrected by the
first-learn probe: CLEAN 8/8** — every divergence is preceded (or matched)
by a lever action on an earlier wave or the scholar channel. The
divergence is the lever working, not the substrate drifting. Legs differ
only by the TRICKTEACH flag; D1 proves the armed tip deterministic.

## Proof test

`scripts/test-trickteach-b.js` — **52 passed, 0 failed** on the lever tip
(commit `c0bc8953a`): static (src diff game.js only; flag read once; 3
threshold sites all `_th`; no stale `/2`); threshold flip live on all 3
channels (armed: 1 observation teaches; control: needs 2; narration
correct per channel); gate/fight reader anchors; recorder shape;
D1 repeatability + D2 wrap neutrality at 150d, seed 102211. Two proof bugs
found and fixed in `c0bc8953a` (bare `loadGame` leaves `Game.state`
undefined so the learn-beat template throws; row-shape check scoped to
launched fights). Post-revert the test runs in off mode
(`TRICKTEACH_PROOF_MODE=off`): src diff empty, no flag read, no threshold
helper, control 2-observation path still behaves.

## NO-GO closeout

- Lever reverted (`src/js/game.js` back to base `47477d874`); proof test
  green post-revert in off mode; `check.js --quick` green (see revert
  commit).
- Kept: prereg, this evidence, instrument (driver, analyzer, panel
  builder, drift check, first-learn probe, proof test), corpora
  (`perseed-trickteach-b-control/`, `perseed-trickteach-b-lever/`), analysis
  (`trickteach-b-analysis.json`), panel (`trickteach-b-panel.{json,md}`),
  before/after `.json.gz`.
- The measurement is worth recording: the mechanism works and the
  population doesn't form — that distinction is the finding, and the D3
  definition gap + deaths-price cost-bar gap are lessons for the next run.
- Corroboration from Loop A (1515Z, evidence
  `sim-winnability-round-1515.md`): its tricklearn DIAG independently found
  the trick the binding constraint (37 tricks learned, all at exactly obs 2;
  gate consulted 29× with the trick unknown every time, yet only 2
  trick-holds) and judged a 2→1 threshold would have saved only 1 of 2
  windows. This pilot is the lever form of that judgment: the threshold
  move works, and still doesn't open the gate.
- Next steps belong to the coordinator/main session, not this arm:
  diagnose why launches are 0–5 per 8 villages before re-running any
  trick lever; a re-run should use all-origins wave-4 kills as primary
  and add deaths/100d to the cost bar.

## Files

- Prereg: `evidence/2026-11-16/sim-trickteach-b-prereg.md`
- Evidence: `evidence/2026-11-16/sim-trickteach-b.md`
- Analysis: `evidence/2026-11-16/trickteach-b-analysis.json`
- Panel: `evidence/2026-11-16/trickteach-b-panel.{json,md}`
- Corpora: `evidence/2026-11-16/perseed-trickteach-b-control/`,
  `evidence/2026-11-16/perseed-trickteach-b-lever/`
- Instrument: `scripts/trickteach-driver-20261116.js`,
  `scripts/analyze-trickteach-b.js`,
  `scripts/build-trickteach-panels-20261116.js`,
  `scripts/trickteach-drift-check.js`,
  `scripts/trickteach-firstlearn-probe.js`,
  `scripts/test-trickteach-b.js`
