# sim-leanclass-b — lean-regime divergence census (diagnostic on the landed surplusfeed layer)

Run: fleshout-loop-b-20261019T0130Z, arm sim-leanclass-b.
Worker tree: ~/workspace/worktrees/sim-leanclass-b.
Brief: parent task 20261019T0130Z — diagnostic census of the lean-regime
divergence class named in evidence/2026-10-18/sim-surplusfeed-b.md
(6416-pair class: short-lived runs where the control twin dies before glut).
Canon: docs/CANON.md + docs/PRESERVATION.md read first. The landed layer is
the surplusFeedGovernor (game.js, SURPLUSFEED=1, default OFF) — glut-gated
(pantryFreshDays() > 4) share trim, eating untouched, zero RNG draws, zero
writes when idle. This arm is INSTRUMENT-ONLY: no game-code changes, no new
layer — it instruments the landed default-OFF layer.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

**Diagnostic questions:**
- Q1: what diverges between the twins in lean regimes (the short-lived class)?
- Q2: does the governor trim when there is no glut — i.e. any trim whose
  fire-time pantryFreshDays() ≤ 4 (lean-window harm potential of the landed layer)?
- Q3: is the divergence a governor effect or a trajectory artifact?

**Attribution bar (pre-registered):**
- Class L (lean-divergence pair): a seed×policy pair with min(days_control,
  days_armed) < 120 — at least one twin died early on a death-aware horizon.
- Channel G (governor effect): per-dawn trajectory fingerprints identical
  through the armed twin's first-trim day, first difference on a later dawn.
  The twins share seed+policy and the gate-off path draws no RNG and writes
  nothing, so pre-first-trim identity is the null; anything after is the
  governor's causal channel (including its narration beat).
- Channel A (artifact): fingerprint divergence on/before the first-trim dawn,
  or ANY divergence when the armed twin never trimmed. Impossible under the
  landed layer's spec — a hit is a harness determinism failure, not a lever
  finding. Bar: **0 artifact pairs** across 16 pairs; a miss is instrument
  NO-GO (loud), not a lever verdict.
- Lean-window trim: a trim event with fire-time freshDays ≤ 4. The gate is
  `pantryFreshDays() > 4`, so by construction this is 0. Bar: **0 lean-window
  trims** across 32 runs; a miss means the landed layer CAN trim lean — a
  defect of the landed layer reported loud (instrument-only: no fix here).
- Sanity: control-side "would-have-trimmed" days (same condition evaluated
  read-only) — the FIRST would-trim day must equal the armed first-trim day
  (identical trajectories to that point); later days may differ post-divergence.

**Judgment:** this is a diagnostic, not a lever arm — verdict is the census
itself: % of Class-L pairs per channel, lean-window trim count, divergence
onset distribution, death-cause attribution for Class-L pairs.

**Substrate (identical to surplusfeed-b):** 8 FRESH seeds 6417–6424 (documented
fresh: pilot used 6401–6408, confirm 6409–6416; no seed-context hits for
6417–6424 in evidence/ or scripts/) × {leadfeast, belongfeast} ×
{control(SURPLUSFEED=0), armed(SURPLUSFEED=1)} = 32 runs, 180d death-aware,
FEASTSCALE_R13=1 both sides, SEATDRIVE=0 EXPLICIT (asserted up front in the
sweep; run stops on mismatch). Own in-sweep paired control, identical seeds.

**Instruments (this arm):**
- scripts/test-leanclass-b.js — determinism fixtures: (T1) same seed, same env,
  twice → byte-identical fingerprint series; (T2) control vs armed, same seed →
  identical through the armed twin's first-trim day; (T3) no trim fires with
  fire-time freshDays ≤ 4 on a full armed run.
- scripts/sweep-leanclass-b.js — the surplusfeed-b sweep + per-dawn trajectory
  fingerprint (day, living, pantry kcal, freshDays, cum ate, cum share) +
  per-invocation governor log: {day, give, result, fireFreshDays, dawnFreshDays}
  armed; control side logs read-only "would-have-trimmed" moments. No game-code
  changes — wrappers only.
- scripts/analyze-leanclass-b.js — pair census, onset detection, channel
  classification, lean-window trim count, wall numbers.

**Wall numbers:** national/table/wins, wave 4–5 unlocks, median survival
reported every run (standing directive).

## Results

Substrate as pre-registered: 8 fresh seeds 6417–6424 × {leadfeast, belongfeast}
× {control, armed} = 32 runs, 180d death-aware, FEASTSCALE_R13=1 /
SEATDRIVE=0 both sides, own in-sweep paired control. Per-seed JSONs:
evidence/2026-10-18/perseed-leanclass-b/. Census: evidence/2026-10-18/leanclass-b-census.json.

Determinism fixtures (scripts/test-leanclass-b.js) — ALL GREEN before sims:
- T1: same seed, same env, twice → byte-identical fingerprint series (40d).
- T2: control vs armed, same seed → identical through the armed twin's
  first-trim day (firstTrimDay=2, onset day 3 — exactly the expected pattern).
- T3: 180d armed run, 501 trims, zero with fire-time freshDays ≤ 4.

### Q3 first — attribution (the binding bar)

| channel | pairs /16 | Class-L pairs /10 |
|---|---|---|
| governor-effect (onset strictly after first-trim day) | **16** | **10** |
| artifact (onset ≤ first-trim day, or divergence with zero trims) | **0** | **0** |
| identical | 0 | 0 |

- **artifactPairs = 0/16 — bar met.** Every divergent pair is byte-identical
  through the armed twin's first-trim day and diverges on the very next dawn
  (onset − firstTrimDay = exactly 1 on all 16 pairs). First trim fires day
  2–5 on every pair (10/16 on day 2); firstWouldDay (control, read-only)
  equals firstTrimDay on all 16 pairs — the twins reach the first glut
  identically, then the governor's trims fork the trajectory.
- The prior evidence's "exposure-trajectory artifact" framing for the 6416
  class is retired: the controls on fresh seeds all see glut (36–163
  dawn-glut days); there is no "control dies before glut" class. Divergence
  is 100% the governor's causal channel — the twins cannot diverge any other
  way, because the gate-off path draws no RNG and writes nothing.

### Q2 — does the governor trim when there is no glut?

- 9,305 trim events across 32 runs. Trims with true fire-time
  freshDays ≤ 4: **0**. The one flagged event (belong s6421, day 109, give
  65 → 33, rounded fireFd "4") was re-run at full precision:
  rawFireFd = **4.000489117143556** — strictly greater than 4. The gate fired
  legitimately; the "4" was my instrument's 3-decimal rounding. Bar met in
  substance (0 true lean-window trims); the landed layer cannot trim lean.
- Mechanism characterization (not a defect): 468/9305 trims (5.0%) fired on
  **intra-day glut spikes** — dawn freshDays ≤ 4, fire-time > 4. A productive
  day pushes the pantry over 4 fresh-days by meal time; the governor trims
  that day's share; by next dawn it reads lean again. The governor is more
  active than the dawn-glut metric suggests (this is the confirm's
  trimDays/glutDays = 1.389). This is also the likely mechanism of the
  pilot's +16% mild-hunger watch item — filed to sim-findings.md as a
  next-arm question.

### Q1 — what diverges in lean regimes (Class L: min(days) < 120, 10/16 pairs)?

- All 10 are governor-effect channel. Pre-trim deaths: **zero on both sides**
  (first trim day 2–5 precedes all deaths). Post-trim death mix is
  combat/monster-dominated on both sides (control 110/147, armed 127/160);
  starvation 5 vs 9. Villages die fighting wave monsters, not starving —
  the lever changes WHEN trajectories fork, not HOW villages die.
- Per-pair survival deltas are symmetric noise (−113 to +127; median armed
  136d vs control 148d on this seed set, reversed from the confirm's +59d).
  Not a judged metric on a diagnostic; reported as observed.
- Extremes: belong s6421 (Δ+127) — control starved/dehydrated out on day 53
  (d46 dehydration ×2, d53–54 starvation ×3); armed lived 180d as fighters
  (all 14 deaths combat/monster). belong s6420 (Δ−113) — armed bled out in
  fights by day 57 (7 combat deaths d15–55, then starvation d58); control
  fought 170d. Same death mix, forked timing — the governor's channel.

### Wall numbers (armed, this census)

national 7/16, table 12/16, wins 0/16, wave-4 10/16, wave-5 0/16,
median survival 136d (control 148d), max 180d. The wall stands.

## Metric review (§14)

- **artifactPairs bar (0): met** — 0/16. The instrument's twin-identity
  argument held on fresh seeds.
- **leanWindowTrims bar (0): met in substance** — 1 rounded flag, proven
  raw 4.000489117143556 > 4 (full-precision re-run, fps byte-identical to
  the sweep). Instrument revision for the next run: record fireFd at full
  precision in the sweep (the 3-decimal rounding created a false flag that
  cost a full investigation).
- **Hand-rolled replays are not a valid determinism check.** Three bespoke
  replay scripts diverged from the sweep at ~day 108 while the EXACT sweep
  command re-run reproduced all 8 seeds byte-identical (fps + trim-day sets).
  The transcription difference was never identified; lesson: determinism
  claims rest on re-running the canonical script, never on a rewrite.
- Nothing was re-scored mid-run. The diagnostic's verdict is the census
  itself; no lever GO/NO-GO applies.

## Sense read (SENSE-TESTING LAW)

Seed 6421 belongfeast, narration live: one beat on day 2 — 'Asher looks at
the groaning pantry shelves and leaves the extra standing. "No point
hauling what'll rot."' One-shot per glut stretch (1 beat in 60 days despite
54 trim-days); named villager; reads as a person behaving sensibly, not a
System intervention. Death lists across Class-L pairs show named villagers
dying to varied, fictionally coherent causes (combat, monster, sickness,
dehydration, "a wound that wouldn't close", the occasional named oddity
like "the focus group"). No robotic repetition, no spam, no contradiction
observed in this corpus.

## Village assessment

- **belong s6421** (Δ+127, the protective extreme): the control village
  starved in the dark — two dehydrations on day 46, three starvations and a
  dehydration on days 53–54, village lost at 53d despite 43 dawn-glut days
  earlier (the untrimmed share rotted instead of buffering). The armed twin
  trimmed from day 2, kept a leaner pantry, and lived 180 days as fighters —
  every one of its 14 deaths was combat or monster across the whole run.
- **belong s6420** (Δ−113, the harmful-looking extreme): the armed village
  bled out in wave fights by day 57 — seven combat deaths between days 15
  and 55, then Tom Baker starved on day 58. The control twin fought the same
  war for 170 days. Same death mix, forked timing: the first trim on day 2
  reshaped the pantry trajectory, which reshaped foraging, which reshaped
  which fights the village walked into.
- Who thrived: fighters, on both sides. Who died: fighters, on both sides,
  plus the control-6421 villagers who died of thirst and hunger in the dark.
  Knowledge/capability blanks: none new in-arm — the missing piece these
  villages needed was not food knowledge but fight outcomes, which is
  outside this axis.
- Blanks filled: the divergence-class question itself — characterized,
  with the 6416 "dies before glut" framing corrected.

## Wall numbers

national 7/16, table 12/16, wins 0/16, wave-4 10/16, wave-5 0/16,
median survival armed 136d / control 148d, max 180d. The wall stands.

## Convergence state

**converged** — the diagnostic question is answered: the lean-regime
divergence class is 100% governor-channel (16/16 pairs, 10/10 Class-L),
0% artifact, with zero true lean-window trims. The "control twin dies
before glut" framing from sim-surplusfeed-b is retired — controls see glut
on all fresh seeds; divergence onset is always the dawn after the first
trim. Named next (filed to sim-findings.md): the intra-day glut-spike
firing pattern (5.0% of trims) as the candidate mechanism for the pilot's
mild-hunger watch item — a lean-regime characterization arm, not a
glut-regime one.
