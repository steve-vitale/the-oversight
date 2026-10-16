# sim-fightopen — FIGHT-OPENING execution (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-fightopen, axis scale-onramp (blocking).
**Type:** GAME-CODE arm. Tests named-next option 4 from evidence/2026-10-16/sim-execensus.md
("gate/fight-shape alignment, the root-cause candidate"): the execensus census measured the
execution funnel's sharpest break — 65% of post-learning wave-4/5 field fights end with
CONDITIONS-NEVER-MET. The trick gates assume multi-round fights (congregation/argue needs
round%3===0; editor/continuity and cancellation/offscript need 2 strikes; reunion/novelty
needs 2 strikes; audit/jank needs round%3===0) but hyper-lethal wave-4/5 field fights are
one-round massacres. The villagers KNOW the tricks; the fights don't last long enough for
the conditions to arise. Per the execensus root-cause read: either the tricks need round-1
forms or the fights need to last longer. This arm tests the first: FIGHT-OPENING execution.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (canon drift noted in
sim-counterwire.md — doc is stale vs data: 56→72 defs, wave-4/5 roster drift; NOT rewritten
here). Trick fictions taken from each def's reveal text + the signature mechanics
(sigW4.js/sigW5.js) — never invented.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** if village-known tricks whose gates are multi-round or strike-count based get a
fight-OPENING evaluation (on round 1, the fighter opens with the trick's first action instead
of striking), does the conditions-never-met share fall on identical seeds?

**PRIMARY (binding):** GO iff conditions-never-met share on post-learning wave-4/5 field
fights <= 40% on the treatment arm (vs 65% measured by execensus on the same instrument).
**SECONDARY:** trick resolutions > 0 movement, where a resolution = trick-attributed kill
(vKill with non-empty trickLog) OR mFlee/vFlee with >= 2 trick actions in the fight's
trickLog (the counterwire metric-review definition).
**Guardrails:** no new death mode (no treatment-only death causes) · national >= control − 2
· median survival >= control − 10d · wave reach not worse.
**Horizon:** 180d death-aware (the trick game lives late: execensus learnings landed d65–d148).
**Seeds:** 8 FRESH [975–982] — verified 0 `-s<seed>.json` per-seed filename hits across
evidence/ before the run. **Policies:** leadfeast / belongfeast (the tribfloor courtship-road
stack, same composition as the execensus census). **Substrate:** pre-seat courtship —
SEATDRIVE=0 explicit, FEASTSCALE_R13=1, NODEWITNESS=1. **Control:** identical seeds,
FIGHTOPEN unset (the layer is default-OFF; det-gate proves zero trace).
**Gates before spend:** proof RED→GREEN (scripts/test-fightopen-20261016.js, 39/39: unit
openers, negatives, DET-GATE byte-identical 40d pairs HEAD-bare vs layer-off, SMOKE with
sense lines); node --check on new scripts; no jest concurrency.

## The build (src/js/fieldFights.js ONLY — villagerTrickAction region)

A FIGHTOPEN=1 branch after the knowledge check, before the counter section. On round 1,
villageKnowsTrick, wave>=4 (the fight-shape proxy — wave-3 fights run 4-6 rounds, long enough
for the multi-round gates to fire on their own), it returns the SAME action the later-round
gate would have returned (same type+why). Cost parity (Steve 2026-10-13): the opening IS the
fighter's round-1 action — the fight loop's trickAct branch means no strike that round, no
NPC advantage.

The five openers (each mechanically real in the abstract field model):
- **congregation → argue** (same as the round-3 gate): rec.trickArgue persists until the
  next round%3===1 beam check (sigW4FieldMonster consumes it there) — the beam never falls
  on round 1 (villager wins initiative) or round 4. "Bound by liturgy, it MUST engage the
  argument — the beam never falls." (The execensus spec prescribes this verbatim; the beam
  fires on round%3===1, i.e. round 1 — which is why congregation fights are massacres.)
- **reunion → wait:reunion-novel** (same as the 2-strike gate): round-1 non-strike pushes
  the mirror's wear (0.85^(n-2) from the 3rd strike) from round 3 to round 4. "Do something
  you have never done" FIRST, not after 2 strikes (execensus spec verbatim).
- **editor → continuity** (same as the 2-strike gate): actionKinds opens non-strike, so any
  editorCuts check fails ("the scissors can't cut cleanly"). The contradiction attempted
  round 1 (execensus spec).
- **cancellation → offscript** (same as the 2-strike gate): variety from round 1 — the
  stamp on round 4 finds no script to cancel. "Go off-script FIRST."
- **audit → inefficient** (same as the round-3 gate): rec.trickInefficient banks until
  audit day (round 3) — the clipboard finds nothing to tax.

Dishonest as openers — documented, never faked: influencer/focus_followers (on round 1
fol=0 — no follower exists to hunt; the Ratio formula only grows followers from round 2),
eater/poison (material gate — needs spoiled food on the fighter — not multi-round),
spoiler/prone (spN%4===3 timing tied to the prophecy schedule; a round-1 prone would invent
a due prophecy), nielsen (already opens boring), network_note/bad_note (already fires round
1 unconditionally), shout/meet_demand (reactive — hurting — not openings; parity),
gavel/confess (needs an active trial), eulogy/contradict (already fires every round),
suburb/leave (already round 1), ad_break/look_away and chorus_line/dance (schedule-timed),
herald/finale/rerun/timeslot/finale_crew/finale_opening (the engine's documented
un-actuatable gap).

**Decided, documented for overrule (Steve 2026-10-07 — figure it out yourself):**
- Wave>=4 as the fight-shape proxy (not a per-species lethality table): the execensus
  measured the break on w4/5; w3 fights demonstrably last 4-6 rounds (MONSTER-WAVES.md bands).
- Same type+why as the normal gates (not new actions): the tally and trickLog stay
  consistent; the opener is the same action performed earlier, not a new verb.
- FIGHTOPEN=1 env flag, default OFF — this changes combat feel, hence [needs-eyes].

## Results

### Round 1 (pilot): 8 fresh seeds [975–982] × 2 policies × 2 arms, 180d death-aware — 32/32 runs, 0 crashes

Per-seed JSONs: evidence/2026-10-16/perseed-fightopen/ · judge: scripts/analyze-fightopen-20261016.js.

| metric | treatment (FIGHTOPEN=1) | control (flag unset) |
|---|---|---|
| w4/5 post-learning field fights | 5 | 3 |
| conditions-never-met | 0/5 = 0.0% | 0/3 = 0.0% |
| funnel classes | flee 3, trick-fired-but-failed 2 | flee 2, trick-fired-but-failed 1 |
| resolutions | 2 | 1 |
| fights with any trick fire | 5 | 3 |
| opener-first fights | 0 | 0 |
| national / table / won | 8/16 / 14/16 / 0/16 | 9/16 / 14/16 / 0/16 |
| wave-4 / wave-5 reached | 14/16 / 8/16 | 14/16 / 8/16 |
| median / max survival | 157.5d / 180d | 145d / 180d |

**Verdict on the pre-registered PRIMARY: INCONCLUSIVE (insufficient data), not GO.** The 0.0%
is vacuous — the break did not reproduce in this sample (control is 0/3 too), and
opener-first fights are 0/5: the witness-sourced learnings that landed (4/arm, identical
across arms — algorithm w4, spoiler w5, redactor w3, murkcap w1) contain ZERO opener-eligible
species (congregation/reunion/editor/cancellation/audit). The algorithm's gate has no round
restriction — it fires every round with or without the layer — so its 5 treatment fights
(3 flee, 2 trick-fired-but-failed; 2 resolutions via wait:algorithm-tank) say nothing about
the 65% break. Per §14 this is not a GO: the PRIMARY's phenomenon (multi-round-gate species
vs one-round fights) had n=0 opportunities. It is not a NO-GO either — the layer is proven
correct (39/39) and simply never met its target in the wild sample.

Non-regression signal (kept): the layer did not disturb the already-firing gates —
algorithm-tank fired in 5/5 treatment fights, resolutions 2 vs 1 control, guardrails all OK
(no treatment-only death causes; national 8 ≥ 7; median survival 157.5 ≥ 135; wave reach
22 = 22).

### Round 2 (pre-registered BEFORE any round-2 trajectory observed — adaptive enrollment)

The pilot's failure mode is sampling, not the lever: witness-sourced learnings of the five
opener species are rare (~6/16 runs in the execensus). Round 2 enrolls FRESH seeds in
batches of 4 (× 2 policies × 2 arms = 16 runs/batch, ~10 min at 4-way parallel) until the
pooled post-learning field-fight count vs OPENER-ELIGIBLE species (congregation, reunion,
editor, cancellation, audit) reaches ≥24 across both arms, or 16 more seeds max (2 batches).
Identical seeds both arms (learning is FIGHTOPEN-independent — confirmed identical in round 1).

**PRIMARY (round 2, binding):** treatment conditions-never-met share ≤ 40% on the
opener-eligible pool. Calibration: the execensus measured 11/11 = 100% cnm on these exact
species (congregation 3/3, reunion 3/3, editor 5/5). **SECONDARY:** resolutions movement > 0
on the same pool. **Guardrails:** as round 1. This is a new pre-registration for round 2,
not a re-score of round 1 (round 1 stands INCONCLUSIVE).

### Round 2: adaptive enrollment — 4 fresh seeds [983–986] × 2 policies × 2 arms (16 runs), pool-gated

Enrollment stopped after batch 1: pooled opener-eligible post-learning field fights = 28
≥ 24 (treatment 7, control 21). Learnings identical across arms (reunion ×3/arm; editor ×1
control) — learning is FIGHTOPEN-independent, confirmed again.

| metric (opener-eligible pool) | treatment (FIGHTOPEN=1) | control (flag unset) |
|---|---|---|
| post-learning field fights | 7 | 21 |
| conditions-never-met | 0/7 = **0.0%** | 20/21 = **95.2%** |
| fights with any trick fire | 7/7 | 1/21 |
| opener-first fights | 7/7 (all wait:reunion-novel) | 0/21 |
| resolutions | 0 | 0 |
| national | 4/8 | 5/8 |
| median / max survival | 126.0d / 180d | 144.0d / 180d |
| wave-4 + wave-5 reached | 12 | 12 |

**PRIMARY: GO.** 0.0% ≤ 40% on the pre-registered pool, and the control reproduces the
execensus break at 95.2% on identical seeds. The identical-seed pairing is exact: e.g.
leadfeast-s984 d88 — control: vFlee r1 cnm, vDie r1 cnm → treatment: vFlee r1 (trick fired),
vDie r1 (trick fired). The gate/fight-shape mismatch is FIXED at the gate level: the
villagers open with the trick they know instead of never meeting the conditions.

**SECONDARY: MISS (0 vs 0).** The openers fire 7/7 but no fight resolves — every opener
fight still ends vFlee/vDie. This is the execensus's "firing isn't the same as mattering":
against the reunion the novelty buys mirror-wear delay, not damage, and the fights are
damage races the trick doesn't touch. (The congregation opener — the one with proven
survival value, beam prevention — had no eligible learning in this sample; its value is
proven only synthetically.)

**Guardrails:** no new death mode — 'starvation' and 'The Spoiler' appear treatment-only in
the n=8 slice but both are pre-existing causes (starvation in round-1 control runs and
2026-10-15 evidence). National 4 ≥ 3 (control−2) OK. Wave reach 12 = 12 OK. **Median
survival: BREACH on the letter** — 126.0d vs 144.0d (bar: ≥ 134.0d), driven by the s985
pair (treatment 96/117d vs control 122/151d; the other three pairs are −4/−10/0/0/+17/0).
n=8 — noisy, but flagged honestly: the opener costs the round-1 strike, and for reunion
the novelty buys nothing in a 1–2 round damage race, so the trade is plausibly negative
there. The next arm should test whether the strike-cost shortens survival (congregation's
beam-prevention has proven positive value; reunion's opener may be pure cost).

## Village assessment

The villages that learned the reunion trick now fight like they know something — and die
anyway. Round 2's treatment arm is the execensus's cruelest arc made routine: the village
learns ("Do something you have never done"), the fighter walks out and OPENS with the poem
on round 1 (7/7 fights), and the Reunion kills or routs her regardless (0 resolutions).
Knowledge applied correctly, outcome unchanged — the funnel is fixed, the fight is not.

Who thrived: nobody in particular — the opener-eligible fights are all losses on both arms.
Who died: Renee (fled, d88), Tatiana (died round 1, d104), and the s985 villagers (3 vDie
on treatment). The control arm's villagers died the same deaths without ever attempting the
trick (20/21 conditions-never-met) — the knowledge sat in their heads while they swung
sticks.

What was missing: not knowledge, not the opening — damage. The reunion's mirror-wear is a
round-3+ mechanic; these fights end round 1–2. The opener moves the funnel class but not
the outcome class. The blank filled: the gate now fires. The blank documented: firing
without mattering — the trick game needs either longer fights or tricks that cash out in
round 1–2 (the congregation's beam-prevention is the template; it never met a wild
learning in this sample).

## Sense-reads (SENSE-TESTING LAW)

**Arc 1: leadfeast-s984 d88, Renee vs the Reunion (vFlee) — the opener reads as a fighter
acting with knowledge.**

> R1: Renee does something they have never done — stands on one foot and recites a poem mid-fight. The Reunion falters; it has nothing to wear. (Novelty.)
> Renee's gear absorbs 9.
> R1: Your Move hits Renee for 62 (23 left)

Meaning: Renee wins initiative and OPENS with the trick — proactive, round 1, the correct
trick for the species she knows. No hesitation, no wasted strike. Coherence: the action is
legible as knowledge applied — she does the strange thing FIRST because she knows the
mirror wears the familiar. Relevance: this is the exact behavior the execensus spec asked
for ("do something you have never done" FIRST), and the control twin of this fight
(same seed, same day) ended conditions-never-met. Consequence: she still flees — the
trick fired, the damage race didn't care.

**Arc 2: leadfeast-s984 d104, Tatiana vs the Reunion (vDie) — the trick as a last act.**

> R1: Your Move hits Tatiana for 66 (0 left)
> R1: Tatiana does something they have never done — stands on one foot and recites a poem mid-fight. The Reunion falters; it has nothing to wear. (Novelty.)

Meaning: Tatiana loses initiative, takes the full hit to 0 — and still gets the trick off
(the engine lets a 0-HP fighter act that round; pre-existing behavior, not the layer's).
Coherence: it reads as a dying fighter's last act being the thing she knows — grim, not
robotic. Relevance: the opener fires even when the fight is already lost; the gate is
fixed, the lethality is not. A person acting with knowledge, correctly, and dying anyway —
the funnel's honest endpoint.

## Metric review (§14)

- **Round 1's PRIMARY was judged INCONCLUSIVE, not re-scored.** The phenomenon had n=0
  opportunities (no opener-eligible learnings in 32 runs); 0.0% on both arms was vacuous.
  Round 2 was pre-registered separately with adaptive enrollment (pool ≥24 or 16 seeds max)
  — a new measurement, not a friendlier metric on the same data.
- **Round 2's PRIMARY (≤40% cnm on the opener-eligible pool) was met (0/7) and the spirit
  holds.** The control reproduces the break at 95.2% on identical seeds, so the 0% is a
  real fix, not a quiet sample. The pool gate (≥24) was met at 28 before any verdict was
  computed.
- **The SECONDARY miss (0 vs 0 resolutions) is reported as a miss, not re-scoped.**
  Proposed revision for the NEXT run: split "execution" (gate fires — FIXED here) from
  "mattering" (outcome movement). The next arm should measure whether round-1 tricks that
  cash out immediately (congregation's beam prevention) move survival, and whether the
  strike-cost of openers that don't (reunion) shortens it — the median-survival guardrail
  breach (−18d, s985-driven, n=8) is the open question.
- **No re-scoring:** round 1 stands INCONCLUSIVE; round 2 stands PRIMARY-GO / SECONDARY-MISS
  with one guardrail breach flagged.

## Convergence state

scale-onramp: **converging** (game-code arm — the named lever is implemented, landed
pending, and measured). The execution-window metric moved: conditions-never-met on
opener-eligible w4/5 fights went from 95–100% (control/ execensus) to 0% (treatment) —
the gate/fight-shape mismatch (the execensus's root-cause candidate) CONFIRMS as the
mechanism: tricks needed round-1 forms. What did NOT move: resolutions (0/0) and the
scale wall itself (national 4/8 vs 5/8, no wins by pre-seat design). The next arm on this
axis is the "mattering" arm: round-1 tricks must cash out in damage races, or the fights
must last longer.

## Telemetry deviation check (Steve 2026-10-13)

`telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-16/perseed-fightopen/*.json' --metrics national,table,wins,exiled` fired
3 LOUD lines — ALL EXPLAINED, no baseline roll:

1. `LOUD: wins disappeared: baseline 16 -> current 0` — EXPLAINED: baseline seeded on the
   win-side stack; this sweep runs pre-seat (SEATDRIVE=0 explicit) where wins are 0 by
   design. Same substrate-mismatch class as the execensus/nodewitness findings.
2. `LOUD: national swung 117%: baseline 12 -> current 26 (n=48 files)` — EXPLAINED: raw
   counts over 48 files (both arms, 12 seeds) vs the baseline's 16; the rate is 26/48 =
   54% on pre-seat (no seat driver) vs 12/16 = 75% win-side. Substrate mismatch, not drift.
3. `LOUD: table swung 163%: baseline 16 -> current 42 (n=48 files)` — EXPLAINED: same
   class; 42/48 = 87.5% on pre-seat vs 16/16 win-side.

## Per-seed JSONs

evidence/2026-10-16/perseed-fightopen/ (48 runs: 12 seeds × {leadfeast,belongfeast} ×
{treatment,control}; round 1 = seeds 975–982, round 2 = seeds 983–986; numeric wall-metric
keys national/table/won/wins/exiled) · beats: evidence/2026-10-16/fightopen-beats/ (say
beats + trick-fight logs for sense-reads)

## Proof artifacts

- scripts/test-fightopen-20261016.js — proof: 39/39 GREEN (RED probes on HEAD-materialized file, GREEN openers + 13 negatives, DET-GATE byte-identical 40d pairs, SMOKE synthetic fights with sense lines)
- scripts/sweep-fightopen-20261016.js — the pilot sweep (execensus instrument reused: attachExecensusCapture + classifyLearning; FIGHTOPEN toggled per arm in-process)
- scripts/analyze-fightopen-20261016.js — the judge (PRIMARY/SECONDARY verdicts, guardrails)

## Blank-fill record

- FILLED (code): fight-opening execution — 5 round-1 opener forms for village-known w4/5 tricks with multi-round/strike-count gates (fieldFights.js villagerTrickAction region only)
- FILLED (measurement): proof 39/39 (real RED→GREEN, det-gate byte-identical, SMOKE); round-1 pilot 32 runs (INCONCLUSIVE — sampling, not the lever); round-2 adaptive enrollment 16 runs (PRIMARY GO 0% vs 95.2% control; SECONDARY MISS 0/0; 1 guardrail breach flagged)
- FILLED (sense): two transcript reads — the opener as knowledge applied (Renee), the trick as a last act (Tatiana)
- DOCUMENTED (not built — dishonest as openers): influencer, eater, spoiler, nielsen, bad_note, shout, meet_demand, gavel, eulogy, suburb, ad_break, chorus_line, herald/finale/rerun/timeslot/finale_crew/finale_opening
- DOCUMENTED (not fixed — the next arm): firing≠mattering (0 resolutions both arms); median-survival guardrail breach (−18d, s985-driven, n=8) — is the round-1 strike cost shortening survival where the opener buys nothing?
