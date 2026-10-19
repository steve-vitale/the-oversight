# sim-spikechar-b — intra-day glut-spike characterization (diagnostic on the landed surplusfeed layer)

Run: fleshout-loop-b-20261019T0317Z, arm sim-spikechar-b.
Worker tree: ~/workspace/worktrees/sim-spikechar-b.
Brief: parent task 20261019T0317Z — the named next from sim-leanclass-b
(evidence/2026-10-18/sim-leanclass-b.md, 32 runs 6417–6424): 468/9305 trims
(5.0%) fired with dawn freshDays <= 4 but fire-time > 4 — a productive day
pushes the pantry over 4 fresh-days by meal time, the governor trims that
day's share, next dawn reads lean again. Open question: is the pilot's +16%
mild-hunger-day watch item REAL — caused by spike trims — or noise?
Findings backlog item (hidden_files/sim-findings.md:605) marked `claimed`
for this arm.
Canon: docs/CANON.md + docs/PRESERVATION.md read first. The landed layer is
the surplusFeedGovernor (game.js, SURPLUSFEED=1, default OFF) — glut-gated
(pantryFreshDays() > 4) share trim, eating untouched, zero RNG draws, zero
writes when idle. This arm is INSTRUMENT-ONLY: no game-code changes, no new
layer — it instruments the landed default-OFF layer.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

**Diagnostic question:** does the spike-trim channel cause mild-hunger days?
Measure mild-hunger incidence against spike-trim dose PER PAIR.

**Design:**
- 8 pairs = seeds 6611–6618 (FRESH: no seed-context hits in evidence/ or
  scripts/; the one "6611" hit is a game.js line-number false positive in
  sim-rackscap-b.md) × {leadfeast, belongfeast}. BOTH arms of every pair run
  the governor (SURPLUSFEED=1 on all 16 runs) so the spike channel is live.
  The brief's "paired armed-vs-control" maps to the within-pair DOSE
  comparison: the pair's high-spike run vs its low-spike run (same seed,
  different policy) — the only armed-vs-control contrast available when both
  arms are governor-live by design.
- Horizon: 180d death-aware (dead villages stop, +10d tail).
- Substrate: FEASTSCALE_R13=1 / SEATDRIVE=0 EXPLICIT both sides (sweep asserts
  up front, stops on mismatch). No policies verified unused elsewhere this run.

**Instruments (scripts/sweep-spikechar-b.js, proof in scripts/test-spikechar-b.js):**
- Gov call-site log, full precision (leanclass's 3-decimal rounding caused
  one false lean-window flag; metric review demanded full precision):
  {seq, day, give, r, fireFd, dawnFd, hs, trim}. dawnFd is looked up per
  scholar-day from dawnByDay (post-sleep dawn readings); dawnFd < 0 = "no
  dawn sample", classified unknown-dawn, NEVER spike (fixes leanclass's
  -1<=4 vacuity).
- Trim classification (full precision): spike = trim ∧ dawnFd ≥ 0 ∧
  dawnFd ≤ 4 ∧ fireFd > 4; glut = trim ∧ dawnFd > 4; unknownDawn = trim ∧
  dawnFd < 0 ∧ fireFd > 4; leanWindow = trim ∧ fireFd ≤ 4.
- Hunger census at sleep, TWO phases (event-sequence probe proved
  Game.sleep() itself runs catch-up villagerMealDay calls — gov@D fires
  INSIDE sleep(D→D+1), so a pre-sleep census does NOT post-date all day-D
  trims): pre-roll (pilot phase, comparable to the pilot's policy.daily
  sample) and post-roll (attribution phase). {seq, dayEnded, phase, nLiving,
  nMild (hunger in (50,70]), nHungry (hunger > 70), maxHunger}. Seq assigned
  in true call order: pre < any in-sleep gov call < post.
- Mild-hunger day (primary, pilot-comparable): post-census with ≥1 living
  villager with npcNeeds.hunger > 70 (same >70 band as the pilot's
  starveDays instrument; the pilot's 19.7/100d scale reproduced on leanclass
  seeds: armed 20.36/100d, control 18.6/100d).
- Attributed mild-hunger day: mild day D with ≥1 spike trim on day D or
  D−1 AND trimSeq < postCensusSeq_D (seq-verified; the brief's "spike trim
  precedes the mild-hunger day within the same day/night cycle").

**Primary metric (binding):** per pair, pooled day-level Pearson(spikeD,
mildD) at lag-0 and lag-1 (spikeD = # spike trims on day D, mildD =
post-census mild-hunger indicator) + the within-pair dose delta
(high-spike vs low-spike run mild-hunger rate/100d) with attribution.

**Diagnostic GO bar (all three required — else clean NO-GO with the watch
item explained away):**
1. leanWindowTrims = 0 across all 16 runs (the landed layer cannot trim
   lean; 100% of trims classified, causal set = verified spikes only).
2. ≥6/8 pairs show ≥1 attributed same-cycle ordering. (The brief's "≥6/16
   pairs" maps to the 8 pairs: both runs of a pair are armed, so the
   ordering verdict is per pair; run-level count reported descriptively.)
3. Dose-response positive: median over the 8 pairs of max(r_lag0, r_lag1)
   > 0 AND ≥6/8 pairs positive.

**Judgment:** diagnostic, not a lever arm — verdict is the characterization:
GO → the watch item is REAL (spike trims cause mild hunger) → named next is
the lean-regime mild-hunger lever spec; NO-GO → the watch item is explained
away → named next retires it in sim-findings.md. No confirm needed beyond
the sweep (§14 metric binding applies throughout).

**Wall numbers:** national/table/wins, wave 4–5 unlocks, median survival
reported (standing directive).

## Instruments

- scripts/sweep-spikechar-b.js — 16-run armed-only sweep (seeds 6611–6618 ×
  {leadfeast, belongfeast}), per-seed JSONs under
  evidence/2026-10-19/perseed-spikechar-b/.
- scripts/test-spikechar-b.js — proof fixtures (T1 determinism, T2
  classification incl. spike visibility, T3 ordering by construction,
  T4 pilot-comparability). ALL GREEN before sims (see below).
- scripts/analyze-spikechar-b.js — per-pair Pearson, dose deltas,
  attribution counts, bar judging, wall numbers.
- scripts/sense-spikechar-b.js — narration replay around attributed
  spike→hunger sequences (SENSE-TESTING LAW).

## Proof test (run BEFORE sims)

scripts/test-spikechar-b.js — ALL GREEN (2026-10-19, before the sweep):
- T1 twin determinism: PASS — gov=302/302, census=80/80 byte-identical
  (9628ced9bae6e94b/9628ced9bae6e94b).
- T2 classification: PASS — 516 trims: spike=20, glut=494, unknownDawn=2,
  leanWindow=0, unclassified=0 (seed 6407, 80d; 6401/6402 stay spike-free in
  range on this horizon — the spike needs a lean dawn, which is seed-luck).
- T3 ordering: PASS — 339 gov calls checked, 0 with trimSeq >= post-census
  seq; 1 day-1 gov call with no census (expected: day 1 ends mid-loop-day).
  Event-sequence probe proved Game.sleep() runs catch-up villagerMealDay
  calls (gov@D fires INSIDE sleep(D→D+1)) — the pre-sleep census does NOT
  post-date all day-D trims; the post-sleep census does. Instruments use the
  two-phase census (pre = pilot phase, post = attribution phase).
- T4 comparability: PASS — pre-census mild-days are a superset of the
  pilot's policy.daily starveDays (uncovered=0, ratio=2.00). Probed
  mechanism for the 2x: the pacing tick-burn sits between policy.daily and
  sleep (hunger rises), and in-sleep catch-up meals bring it back down
  (post < pre). The pre-census catches everything the pilot's instrument
  catches.

## Results

Substrate as pre-registered: 8 fresh seeds 6611–6618 × {leadfeast, belongfeast},
all SURPLUSFEED=1 (16 armed runs, 8 pairs), 180d death-aware,
FEASTSCALE_R13=1 / SEATDRIVE=0. Per-seed JSONs:
evidence/2026-10-19/perseed-spikechar-b/. Analysis:
evidence/2026-10-19/perseed-spikechar-b/spikechar-b-analysis.json.
One mid-run service restart wiped /tmp and killed the first sweep attempt at
6/8 lead seeds (no output written — the batch wrote only at the end); the
sweep was re-run with per-seed incremental writes (restart loses at most one
seed). Seed 6611 reproduced byte-identical summary numbers across the restart.

### Trim classification (full precision, 10,339 trims)

| class | n | share |
|---|---|---|
| spike (dawn ≤ 4, fire > 4) | 421 | 4.1% |
| glut (dawn > 4) | 9,612 | 93.0% |
| unknownDawn (no dawn sample) | 306 | 3.0% |
| leanWindow (fire ≤ 4) | **0** | 0% |

The leanclass 5.0% spike rate reproduces at 4.1% under the stricter
classification (unknown-dawn no longer vacuous-spikes). Zero true
lean-window trims — the landed layer cannot trim lean (third confirmation).

### Primary: per-pair dose-response (post-census mild-hunger days)

61 post-census mild days across 16 runs (3.8/run — end-of-day hunger is
rare; the in-sleep catch-up meals feed nearly everyone).

| pair | pooled r_lag0 | pooled r_lag1 | doseΔ (spikes) | mildRateΔ/100d | attributed |
|---|---|---|---|---|---|
| 6611 | −0.019 | −0.020 | 34 | −1.23 | 0 |
| 6612 | −0.031 | −0.031 | 25 | −5.00 | 0 |
| 6613 | 0.365 | −0.011 | 1 | +0.37 | 0 |
| 6614 | −0.014 | 0.189 | 42 | 0.00 | 1 |
| 6615 | −0.035 | −0.036 | 33 | +2.62 | 0 |
| 6616 | −0.067 | −0.067 | 29 | +10.18 | 0 |
| 6617 | 0.200 | 0.203 | 73 | +2.57 | 4 |
| 6618 | −0.028 | −0.029 | 2 | −1.00 | 0 |

- Only **5/61 mild days (8%)** have any preceding spike trim; only **2/8
  pairs** show even one attributed same-cycle ordering (6614: 1, 6617: 4).
- 21 spike trims fired AFTER their day's post-census (stale day label —
  see metric review) and were correctly excluded by the seq rule
  (seqViolations, not counted as attributions).
- Dose deltas split both ways: the highest-dose pair (6617, Δ73 spikes)
  does show +2.57 mild/100d, but 6612 (Δ25) shows −5.00 and 6611 (Δ34)
  shows −1.23.

### Bar judgment (binding)

1. leanWindowTrims = 0: **PASS** (0/10,339).
2. ≥6/8 pairs with ≥1 attributed ordering: **FAIL** (2/8).
3. Dose-response positive (median max(r) > 0, ≥6/8 positive): **FAIL**
   (median −0.024; 3/8 positive: 6613, 6614, 6617).

**VERDICT: NO-GO — the watch item is explained away (see below).**

### Secondary: pilot-phase (pre-census) dose-response (not pre-registered — informs the named next, does not re-judge)

Per-pair rPre_lag0: −0.011, −0.024, 0.024, 0.061, −0.020, 0.118, 0.051,
0.136 (median ≈ +0.04, max 0.136). Dose deltas split 5–3 (6611 +21 mild
days on the high-dose run; 6614 −13; 6618 −34). Even at the pilot's own
phase, with seq-valid trims only, the spike-dose signal is weak and
sign-inconsistent — no lever-grade causal channel.

### The explanation (why the watch item is noise)

1. **The watch item doesn't replicate by seed set.** Pilot (6401–6408):
   +16% mild-hunger-day rate armed vs control. Leanclass (6417–6424,
   same >70 instrument): +9.5% (20.36 vs 18.6/100d). Surplusfeed confirm
   (6409–6416): starve-rate 0.882x armed (DOWN), starvation deaths 9→3
   (DOWN). A real lever effect does not flip sign across fresh seed sets;
   the pilot's +16% is the high draw, not the mechanism.
2. **The spike channel specifically is dose-flat.** Within 16 armed runs,
   runs with 5–10x the spike dose do not have more mild-hunger days
   (primary median r −0.024; secondary median +0.04, max 0.136).
3. **Mechanism: the pantry constraint doesn't bind eating.** Post-census
   (all meals done, incl. in-sleep catch-ups) hunger is ~zero (61 mild
   days / 16 runs). The governor halves the *deposit*, not the eating;
   villagers eat their fill by end of day. Transient pre-sleep hunger is
   meal *timing* (who hasn't eaten yet), and it resolves in-sleep —
   which is why the pilot's phase sees it and the post-census doesn't.
4. **Confound noted:** spike trims fire on productive days by construction
   (dawn ≤ 4, fire-time > 4 needs a big production day). Productive days
   have different meal timing (villagers out foraging eat later), which
   alone can nudge pre-sleep hunger — the trim and the transient hunger
   share a common cause (a big day), not a causal arrow.

Named next: **retire the watch item** in sim-findings.md (marked `fixed`
with this characterization). No lean-regime mild-hunger lever spec — there
is no lever-grade channel to pull. (A future armed-vs-control mild-day arm
could re-ask the glut-trim variant, but the confirm's starve-rate result
— down, with fewer starvation deaths — makes it low value.)

## Metric review (§14)

- **Nothing re-scored mid-run.** The three bars were judged as
  pre-registered; the NO-GO stands on the primary (post-census) instrument.
- **Sleep does not always roll the day (instrument refinement).** The
  event-sequence probe for the proof test assumed gov@D always precedes
  sleep(D→D+1). The sweep shows Game.sleep() can fire without rolling the
  scholar clock, and gov calls with stale day labels fire after their day's
  post-census (21/10,339 trims, e.g. 6617-lead day 84: post-census seq 723,
  then gov@84 seqs 724–729). The analyzer's seq rule (trimSeq < censusSeq)
  already excludes these from attribution — the 21 are reported as
  seqViolations, not attributions — so the verdict is unaffected. But the
  proof test's T3 ("every gov call precedes its day's post census") is too
  strong as a universal claim; it passed on seed 6402 by trajectory luck.
  Revision for the next run: T3 should assert the analyzer's seq rule
  directly (no post-observation trim is ever counted as an attribution) on
  a trajectory known to contain post-sleep stale-label meals.
- **dawnFd overwrite on non-rolling sleeps.** dawnByDay[day] is written at
  every sleep; a non-rolling sleep overwrites the true dawn reading with a
  mid-day value (typically higher), which can only reclassify a true spike
  as glut, never invent one. The 4.1% spike rate is a lower bound; the
  direction of the bias does not help the GO case.
- **Post-census mild days are sparse (61/16 runs).** The primary instrument
  has low power by construction — end-of-day hunger is rare because
  in-sleep catch-up meals feed everyone. The secondary (pre-census) analysis
  was added post-hoc to check the pilot's own phase; it agrees (no
  dose-response). Proposed revision for any future mild-hunger arm: use the
  pre-census phase as primary with seq-valid trims, and pre-register the
  productive-day timing confound as a covariate.
- **Service restart mid-sweep** wiped /tmp and killed the first attempt at
  6/8 lead seeds with no output (batch wrote only at end). Re-ran with
  per-seed incremental writes; seed 6611 reproduced byte-identical summary
  numbers across the restart (determinism held). Lesson already in
  AGENTS.md (keep recovery-critical files under ~/workspace); the sweep now
  writes incrementally by default.

## Sense read (SENSE-TESTING LAW)

Seed 6617 leadfeast (most attributed orderings: 4), narration live, 180d —
scripts/sense-spikechar-b.js, transcript saved as
evidence/2026-10-19/sense-spikechar-b-6617.txt. Read the narration around
each attributed spike→mild-hunger sequence for meaning: consequence, or
weather?

**Weather.** Every attributed mild-hunger day sits inside a busy village
where the hunger is visibly caused by something bigger than the trim:

- Day 84 (Joyce:71, Adaeze:71): "You camp wild tonight — no pantry meal.
  Eat from your pack." + "⚠ DEHYDRATED: find and treat water today." The
  scholar was out on expedition; a trader came through; Nour taught
  Chanterelle by the fire. The hunger is expedition hunger, not pantry
  hunger.
- Day 101 (Joyce:71, Mateo:77, Adaeze:71): "🌙 Raid — The Bloodied II came
  in the night... carried off ~1000 kcal from the pantry." A RAID took a
  thousand kcal the same night; Joyce "had the day of their life — 1194
  kcal." The trim (halving one day's deposit, tens of kcal) is a rounding
  error next to the raid.
- Day 111 (Joyce:71, Aki:92): "⚠ STARVING: health and energy falling" +
  "Village meal: +2150 kcal" + "The land is getting tired. The easy food
  is thinning." Broad foraging pressure, not a trim artifact.
- Day 154/155 (Victorine:100, Marie:100 → 78): "🌙 Raid — Emberhold...
  carried off ~1200 kcal" + "⚠ WARNING: reserves critical" + a System
  arena grab taking Nikos and the scholar. Raids and the show, not the
  trim.

The 5 "attributed" orderings are temporal coincidences in a loud village —
which is exactly why the dose-response is flat. The governor's own beat
fired twice in 180 days ('Brooklyn looks at the groaning pantry shelves
and leaves the extra standing. "No point hauling what'll rot."' day 2;
Joyce day 82) — one-shot per glut stretch, a person behaving sensibly, and
note the novelistic touch the sim produced honestly: Joyce calls the trim
on day 82 and is herself one of the hungry (71) on day 84. A tradeoff made
by a person, felt by the same person, at trivial magnitude.

Verdict on the sense question: **the hunger reads as weather.** Nothing
robotic, no spam, no contradiction — the village feels alive throughout.

## Village assessment

Sixteen armed villages (seeds 6611–6618 × {leadfeast, belongfeast}), all with
the governor live from day 2. What they looked like:

- **They died fighting, not starving.** 227 deaths: combat 138, monster 57,
  dehydration 8, contest 7, alien 5, "a wound that wouldn't close" 3,
  starvation **2**. The governor trims the pantry deposit and the villages
  still eat — starvation is essentially absent as a death mode, same as the
  leanclass census found.
- **The pantry runs lean but never empty.** Spike trims (421, 4.1% of all
  trims) fire on productive days when the dawn pantry reads ≤4 fresh-days;
  the villages absorb them. Post-census (all meals done) hunger >70 shows
  on only 61 villager-days across 16 runs — the in-sleep catch-up meals
  feed nearly everyone, every night.
- **Who went hungry:** transient, borderline, personal. The attributed
  sequences name names: Joyce trims on day 82 ('leaves the extra standing')
  and is herself at hunger 71 on day 84; Adaeze 71; Mateo 77; Aki 92;
  Victorine and Marie hit 100 on day 154. No one starves; the hungriest
  moments are single villagers on single days, resolved by the next meals.
- **What was missing:** nothing in-arm. These villages didn't need more
  food knowledge or a hungrier governor — they needed to win fights
  (195/227 deaths are combat/monster). The food economy is not their
  binding constraint; the wave monsters are.
- **Blank filled:** the question itself — the intra-day spike channel is
  characterized (4.1% of trims, dose-flat against mild hunger on both
  census phases), and the pilot's +16% mild-hunger watch item is explained
  as seed noise, not a lever effect. No blank left open that a lever could
  fill.

## Wall numbers

(armed, 16 runs — standing directive: the scale wall)

national 6/16, table 15/16, wins 0/16, wave-4 11/16, wave-5 0/16, median
survival 142d, max 180d. The wall stands: villages reach the table (15/16)
but win nothing; wave-5 remains at zero.

## Convergence state

**NO-GO — characterization complete.** The intra-day glut-spike firing
pattern is real (421/10,339 trims, 4.1%, third confirmation of zero
lean-window trims) but it does not cause the pilot's mild-hunger watch
item: dose-response flat on both census phases (primary median r −0.024;
secondary median +0.04), only 2/8 pairs show any attributed ordering, and
the watch item itself flips sign across seed sets (+16% pilot, +9.5%
leanclass, −12% starve-rate confirm). Named next: **retire the watch item**
— sim-findings.md:605 marked `fixed` with this characterization. No
lean-regime mild-hunger lever spec: there is no lever-grade causal channel
to pull. All work is instruments + evidence (no game-code changes);
merged locally, pending ship.
