# sim-condbreak — conditions-never-met decomposition of the execensus corpus (flesh-out loop ARM, 2026-10-17)

**Run:** flesh-out loop ARM sim-condbreak, axis scale-onramp (blocking). Steve-call #411 OPEN (options named, not picked).
**Type:** READ-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes. Instruments + evidence only.
**Corpus:** evidence/2026-10-16/perseed-execensus/ (16 runs: 8 fresh seeds × leadfeast/belongfeast), schema per evidence/2026-10-16/sim-execensus.md. The corpus ran with FIGHTOPEN unset (default OFF) — the fights were decided by the base gates in `villagerTrickAction` (src/js/fieldFights.js).
**Named from:** sim-execensus DESIGN FINDING "gate/fight-shape mismatch — villagers know the tricks, fights don't last long enough for conditions to arise" (13/20 post-learning field fights conditions-never-met, 65%).

## Pre-registration (docs/MEASUREMENT.md §14 — BINDING, written BEFORE any classification)

**Question:** which (trick-kind × reason) pairs in the execensus conditions-never-met set are actually fixable, and which are fight-shape fate? The verdict is the lever spec for steve-call #411.

**PRIMARY (diagnostic GO, binding):** 100% of conditions-never-met (fight, kind) rows in the corpus classified with a reason — material-missing, rounds-missing, knowledge-missing, position-missing, or other (named) — ZERO unattributed rows, ZERO instrument errors (e.g. a row whose rounds reach the gate's round requirement but still never fired, which would be an instrument/engine inconsistency, not a classification).

**SECONDARY:** for each of the top-3 kind × reason cells by row count, name the concrete lever in one sentence and tag it policy-side, engine-side, or needs-Steve-call.

**A miss is NO-GO (instrument incomplete), never re-scored.** Judge the work against this header; if the metric proves wrong, it goes under "metric review" for the next run.

**Method:** read-only analyzer (scripts/condbreak-20261017.js) over the corpus. Gate conditions grounded in the engine's own `villagerTrickAction` (src/js/fieldFights.js) — the classification is a lookup from (kind, rounds, evals, fires), not inference. Knowledge is proven per-row by `fight.seq > learn.seq` (the funnel is post-learning by construction); a row violating that is an instrument error. The proof test (scripts/test-condbreak-20261017.js) asserts the gate table against the engine source and the classification against synthetic + real rows.

Status: classifying (results below appended after the run).

## Results (classification run 2026-10-17)

Analyzer: scripts/condbreak-20261017.js (read-only over the corpus). Proof: scripts/test-condbreak-20261017.js — **38/38 GREEN** (unit reason paths, gate predicates grounded in src/js/fieldFights.js, full-corpus integration).

**PRIMARY: GO.** 13/13 conditions-never-met (fight, kind) rows classified with a reason; **0 unattributed rows; 0 instrument errors.** Every row proven post-learning (fight.seq > learn.seq, asserted per row).

### Per-kind reason table

| kind | trick (gate) | reason | rows | median rounds | performer survival |
|---|---|---|---|---|---|
| editor | contradict yourself — needs 2 consecutive strikes (fires round-3 eval at earliest) | rounds-missing | 5 | 1 | vDie 3 / vFlee 2 |
| congregation | argue theology — needs round%3===0 (beam-schedule) | rounds-missing | 3 | 1 | vDie 2 / vFlee 1 |
| reunion | improvise — needs 2 strikes thrown, last action strike (fires round-3 eval at earliest) | rounds-missing | 3 | 1 | vDie 2 / vFlee 1 |
| eater | poison the meal — needs spoiled food on the fighter (fires ANY round when stocked) | material-missing | 2 | 1 | vDie 1 / vFlee 1 |
| belltoad (shout) | — | (0 post-learning fights; nothing to classify) | 0 | — | — |

Reason shares: **rounds-missing 11/13 (84.6%)**, **material-missing 2/13 (15.4%)**, knowledge-missing 0, position-missing 0, other 0.

- **knowledge-missing = 0 by construction:** the funnel is post-learning; knowledge held is asserted per row (fight.seq > learn.seq). The execensus corpus says the village KNOWS — no knowledge gap was measured here.
- **position-missing = 0:** none of the four kinds' gates references grid position. The position-needing kinds (move_windup/move_x2/sidestep/keep_distance etc.) are documented UN-ACTUABLE and have zero learnings in the corpus.
- **Fight-shape facts:** the rounds-missing fights are 1-round massacres (median 1; max 2) with 63.6% performer death; the two material-missing fights are also 1-round (median 1), 50% death. The eater gate has NO round component — a 10-round fight with an unstocked fighter would still classify material-missing.

### The verdict for steve-call #411: which pairs are fixable, which are fight-shape fate

**11/13 rounds-missing pairs are NOT fight-shape fate — they are already fixed in landed code.** The FIGHTOPEN round-1 opener block (src/js/fieldFights.js, landed 2026-10-16, env flag default OFF) converts exactly these gates to round-1 forms: congregation/argue, reunion/novelty (round-1 wait), editor/continuity, cancellation/offscript, audit/jank. sim-fightopen round-2 (evidence/2026-10-16/sim-fightopen.md) measured PRIMARY GO: 0.0% conditions-never-met on the opener-eligible pool vs 95.2% control. The corpus rows above are the PRE-opener world; with the flag on they fire. The remaining work on these pairs is measurement, not gate design: fightopen's SECONDARY (do opener-fights improve outcomes?) was 0/0 — unmeasurable. And that unmeasurability is structural now: the wave-4 combat-readiness gate (design call #4, landed 2026-10-16 19:52 UTC — AFTER this corpus) makes w4+ seed-conditional on the pre-seat substrate (trickmatter: 0/48 runs cleared readiness; this corpus's w4/5 fights can't be re-sampled here). Re-running the outcome measurement needs a readiness-satisfying substrate — a coordinator call, not a gate redesign.

**2/13 material-missing (eater × poison) is not a fight-shape problem at all — it is a logistics blank, and no gate tweak fixes it.** The gate is honest and round-independent: `villagerHasSpoiledFood(vid)` is the ONLY precondition. Fires=0 with evals≥1 PROVES the fighter carried no spoiled food — in any-length fight, same result. The fix space is material sourcing (pack habit, pantry draw, pre-fight prep — #411 option 2), which is a new logistical system, not a gate adjustment. This pair is the one that needs Steve's design ruling.

### SECONDARY: levers for the top-3 kind × reason cells

1. **editor × rounds-missing (5/13):** the FIGHTOPEN opener (editor/continuity as round-1 action, `actionKinds` opens non-strike so the scissors can't cut cleanly) is landed code — **engine-side**; next is an outcome confirm on a readiness-satisfying substrate (fightopen SECONDARY was 0/0 there), not more gate design.
2. **congregation × rounds-missing (3/13):** the FIGHTOPEN opener (round-1 argue; rec.trickArgue persists, beam never falls round 1 or 4) is landed code — **engine-side**; the congregation-specific outcome measurement (trickmatter PRIMARY(a) beam-prevention resolutions) was killed at pilot on an empty pool — needs a targeted congregation re-run on a readiness-satisfying substrate.
3. **reunion × rounds-missing (3/13):** the FIGHTOPEN opener (round-1 wait as reunion-novel, pushing the mirror's wear to round 4) is landed code — **engine-side**; the reunion strike-cost hypothesis (trickmatter PRIMARY(b)) is UNTESTED (0 reunion fights in that pool) — needs the same targeted re-run.

Plus the qualitative fourth: **eater × material-missing (2/13):** nothing to widen — **needs-Steve-call** (#411 option 2: material sourcing as a logistical system; a fighter stocking spoiled meat is a pack/prep habit, not a combat gate).

## Metric review (§14)

- **The PRIMARY was the binding instrument check (100% classification, 0 unattributed, 0 errors) and it is met as written.** It forced per-row knowledge proof (fight.seq > learn.seq via the learnId join — the funnel entry itself carries no seq, found during build and handled in the analyzer), gate-table grounding against the engine source (the proof test greps the actual predicates in fieldFights.js), and the inconsistency detector (a row reaching the gate's round requirement without firing would be an instrument error, not a classification — none found).
- **No re-scoring.** The "other" reason class exists and is tested (synthetic unmapped kind) but empty on the real corpus — reported honestly, not filled.
- **The metric did not prove wrong.** Proposed revision for the NEXT run: none for this instrument. The natural follow-on is a readiness-satisfying-substrate outcome arm measuring opener-fight survival movement (the fightopen SECONDARY the corpus-era substrate can no longer produce).

## Village assessment (read from the rows, SENSE-TESTING LAW)

The 13 rows are 13 one-round (median 1) massacres where the village knew the trick and the engine consulted the gate (median evals 1) and said no. The cruelty is legible per kind: the three congregation fighters walked in with "argue theology" and died or fled before round 3, the only round the liturgy listens; the three reunion fighters never got to throw their second strike, so the mirror never had to improvise; the five editor fighters never assembled two consecutive strikes, so the scissors never found a script to cut — and in all eleven cases the knowledge was real and inapplicable. The two eater fighters are the other kind of tragedy: Zoe's d118 fight (leadfeast-s966) evaluated the poison gate once, found no spoiled meat, and she died round 1 — the village's pantry held the cure and the fighter's pack didn't. 8 of the 13 performers died (61.5%); the 5 who fled lived with the knowledge.

## Convergence state

scale-onramp: **converging** (diagnostic — measures, does not move). The execensus "gate/fight-shape mismatch" is now decomposed per (kind × reason) with a named lever spec for steve-call #411: 11/13 rounds-missing pairs already converted to round-1 forms by the landed FIGHTOPEN openers (measurement outstanding, substrate-blocked); 2/13 material-missing (eater) is a logistics blank needing Steve's ruling on material sourcing. #411 stays open; this verdict is its evidence input.

## Proof artifacts

- scripts/condbreak-20261017.js — the read-only analyzer (gate table grounded in villagerTrickAction; knowledge proved per row via learnId→seq join)
- scripts/test-condbreak-20261017.js — proof: 38/38 GREEN (unit reason paths incl. error paths, engine-source predicate grounding, full-corpus integration)
- evidence/2026-10-17/sim-condbreak.md — this file (pre-registration header written before classification)

## Blank-fill record

- FILLED (instrument): conditions-never-met decomposition of the execensus corpus — 13/13 rows classified, per-reason fight-shape facts (median rounds, performer survival), kind×reason lever spec.
- DOCUMENTED (not fixed — needs-Steve-call #411 option 2): eater poison material sourcing — fighters never carry spoiled food; a gate tweak cannot fix it.
- DOCUMENTED (structural): the wave-4 readiness gate (design call #4, post-corpus) makes the corpus's w4/5 trick fights un-re-samplable on the pre-seat substrate — the fightopen outcome measurement needs a readiness-satisfying substrate.
