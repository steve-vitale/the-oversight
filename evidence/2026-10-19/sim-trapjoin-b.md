# sim-trapjoin-b — trapper-joiner first-class channel (2026-10-19)

Loop-B food-economy lever arm, run fleshout-loop-b-20261019T0317Z.
Named next from sim-npctrap-b's turnover economy: the NPC pit line is a
turnover economy — 10/10 day-0 trappers died (median ~d70), joiners
sustained the line (≥4/16 runs, incl. Ethan: 5 catches/3,915 kcal), and
knowledge outlives hands ~half the time (scholar acquisition 11/16).
"Treat the joiner flow as a first-class channel, not seed luck."
DISTINCT from pitstaff-b2 (KILLED, pitstaff 0-for-2 — no day-0 staffing
here; this arm is joiner-focused only). The #556 bear-stalk steve-call is
OUT OF SCOPE, untouched.

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface ("If you don't know, it
  doesn't show"); human skills ≠ alien abilities (knowsPit is a human
  skill — the layer assigns LABOR, never magic); no silent actions (every
  welcome/duty/refusal is narrated by the engine); trust ≠ reputation.
- docs/BEAR.md: boar meat carries trichinosis — only `foodState: 'cooked'`
  clears it (unchanged; the pit's boar kcal enters the existing food
  ladder via stockPantry, no new ladder logic).
- docs/PRESERVATION.md: pit catches enter the existing food ladder —
  the channel needs no new ladder logic.
- **No hunting/traps canon doc exists** (docs/ has no HUNTING.md or
  TRAPS.md — verified 2026-10-19, same as the npctrap census). The trap
  species table lives in src/data/recipes.json (pit_trap). Stated here
  instead of invented.

## The lever (POLICY-SIDE, zero src/js changes)

`scripts/policies/trapjoin.js` (env gate TRAPJOIN=1; unset = pure
delegation, proven byte-identical by RED-2). Wraps feastscale's
leadfeast/belongfeast. The scholar acts as the trap line's integrator:

1. **Joiner watch** (upkeep): roster vid-appearance events — vids appearing
   after day 0 are joiners (the census's 30d-snapshot caveat: events, not
   snapshots). Records join day, occupation, trapper?, knowsPit.
2. **Welcome** (daily, at haven, one sitting/day): held conversations with
   trapper-occupation joiners (hunting_guide / trail_crew / rancher),
   trust < ASK_GATE. The engine's talk stipend builds trust honestly.
3. **Teach duty** (daily, at haven): for askable trapper joiners
   (trust ≥ ASK_GATE = 20 — the engine's OWN obedience gate for non-food
   work, game.js checkObedience), the scholar asks them onto the 'teach'
   chore via the engine's own assignTask. The teach chore at Haven fires
   agencyTeachVillager → the trust-gated pit apprenticeship
   (villager-agency.js:1128, regard gate 15, 85% land, need-driven) hands
   knowsPit to fellow villagers — the line grows, and the new hands take
   TRAPS purposes on their own schedule. One duty per joiner per 14d;
   refusals are narrated by the engine and never overridden (7d backoff).

Design calls (Steve can overrule):
- The layer never edits trust directly (bumpTrust is the scholar's own
  regard — earned through conversation, never fabricated).
- The layer never touches NPC purposes ('traps' is not a delegateTasks
  task — purposes are NPC autonomy; the layer routes knowledge, not
  labor orders).
- The duty's ask gate (20) is the engine's obedience gate, not the
  lesson gate (15) — the layer never asks when the engine wouldn't
  listen; the 15 lesson gate rides along inside.

## PRE-REGISTRATION (binding; written BEFORE the pilot sweep — MEASUREMENT.md §14)

- PRIMARY: pit kcal/100d (npc_pit tele sum / run-days × 100). GO = on-side
  ≥ 1.5 × off-side (paired, identical seeds; same policy objects, env gate
  only). Calibration: off-side ≈ 858.9/100d (sim-npctrap-b census).
- SECONDARY: npc_pit catches on ≥ off + 5 (census: 25 catches / 16 runs).
- ENGAGEMENT: the layer fires on ≥ 3 runs with a trapper-occupation
  joiner (≥1 welcome sitting OR ≥1 teach duty attempt).
- MECHANISM (joiner attribution): joiner-caught kcal share of the on-side
  delta — the delta must ride on joiner-attributed catches, not day-0
  trappers.
- GUARDRAILS (binding):
  (a) no new death mode — death-cause corpus recorded both sides; any
      cause absent from the off-side corpus appearing on >2 on-side runs
      is a same-run investigation item;
  (b) median survival on ≥ off − 10d;
  (c) starvation deaths on ≤ off + 2 (the 'teach' duty takes a trapper
      off the food line for a day — watch this);
  (d) boar band intact: mean boar kcal on-side within the designed
      400–1000 carried-share band.
- HORIZON: 180d death-aware (dead villages stop). SUBSTRATE:
  FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT (pre-seat); PITKNOWLEDGE unset
  (on). Env asserted up front; SWEEP STOPS on mismatch.
- SEEDS: 6621–6628 (freshness verified against evidence/ + scripts/ +
  hidden_files/ before any sims) × {leadfeast, belongfeast} × {on, off}
  = 32 runs (16 pairs). PILOT GATE: these 16 pairs ARE the pilot — no
  confirm spend before judging them.
- A miss is NO-GO, never re-scored against a friendlier metric mid-run.
  Metric doubts go under "metric review".

## Proof test

`scripts/test-trapjoin-b.js` — all pass (2026-10-19):
- RED-1: gate-off layer is zero-write, pure delegation (no _tj* ctx keys,
  daily returns base.daily's value).
- RED-2: 20d trajectory identical gate-off vs base (seed 6621).
- GREEN-1: joiner injected through the engine's real join path
  (background_survivors seed → arrivals → arrivalTick → hydrateSeed)
  detected as a vid-appearance event, trapper occupation flagged,
  knowsPit=true from the occupation.
- GREEN-2: welcome held (3 turns, trust 5 → 10 — the engine's stipend).
- GREEN-3: teach duty assigned via the engine's own assignTask
  ('teach', trust 45, no refusal).
- GREEN-4: reluctance-band duty (trust 25) honestly accepted by the
  engine, logged, no override.
- GREEN-5: refusal backoff holds (no re-ask within 7d).

Instrument smoke: 1 seed × both sides before the pilot (results below).

## Pilot result — 32 runs (6621–6628 × {leadfeast,belongfeast} × {on,off})

Per-seed JSONs: `evidence/2026-10-19/perseed-trapjoin-b/`. Env asserted up
front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit); the off side runs the SAME
policy objects with TRAPJOIN unset (RED-2: gate-off trajectory identical).

| side | kcal/100d | catches | joiner kcal | boar (avg) | lessons | teaches | welcomes | duties (ok/ref) | med surv | starv |
|------|-----------|---------|-------------|------------|---------|---------|----------|-----------------|----------|-------|
| on (TRAPJOIN=1) | 790.4 | 24 | 2,025 (3 catches) | 7 (717) | 5 | 7 | 0 | 4 (3/1) | 136d | 6 |
| off (unset) | 723.5 | 22 | 700 (1 catch) | 7 (717) | 5 | 8 | 0 | 0 | 136d | 6 |

Species (on): wild_boar 7, opossum 5, white_tailed_deer 7, raccoon 5 —
the pit_trap table's shape, same as the census.

The paired structure is the whole story: **15 of 16 pairs are
bit-identical** (on == off to the decimal on kcal/100d). The single
divergent pair is leadfeast-6624 (on 920.1 vs off 0.0): 3 teach duties
fired for its 2 trapper-occupation joiners (trail crew d98, rancher
d140), and the joiners caught a raccoon (844) and a deer (481) on their
own autonomous TRAPS purposes. The designed mechanism — duty → teach
chore → pit_lesson apprenticeship → new knowsPit hands — produced
**0 lessons from 4 duties** across the whole pilot. The 2 catches are the
joiners working the line themselves (which they do on the off-side too,
subject to RNG/schedule perturbation from the layer's own engine-verb
RNG footprint), not knowledge spread.

Trapper-occupation joiners are rare: 3 across 8 leadfeast seeds (s6622:
hunting guide d175; s6624: trail crew d98, rancher d140) — the channel
the layer serves fires on ~25% of runs. Arrivals start at trust 20 ≥
ASK_GATE, so the welcome (trust < 20) fired 0 times in 16 runs — it only
serves joiners whose trust rotted below the ask gate.

## Pre-registration verdicts

- **PRIMARY (binding, on ≥ 1.5 × off): 790.4 vs 723.5 = 1.09× — MISS.**
  Recorded as a miss per §14, not re-scored.
- **SECONDARY (catches ≥ off + 5 = 27): 24 — MISS.**
- **ENGAGEMENT (layer fires on ≥ 3 trapper-joiner runs): 2 — MISS.**
  (4 duties across s6622 + s6624; 0 welcomes.)
- **GUARDRAILS:** (a) no new death mode — PASS (corpora identical:
  violence 143/139, monster 68/69, disease 11/11, starvation 6/6,
  contest 7/6, wounds 3/3, alien 3/3, dehydration 2/2, sunbasker 1/1,
  ambush 1/1); (b) median survival 136d vs 136d (bar −10d) — PASS;
  (c) starvation 6 vs 6 (bar +2) — PASS; (d) boar band intact, avg 717
  both sides (designed 400–1000) — PASS.
- **MECHANISM:** the on-side delta (+1,325 kcal) is entirely
  joiner-attributed (+1,325 joiner kcal), but it rides on autonomous
  joiner TRAPS purposes in ONE pair, not on the layer's apprenticeship
  mechanism (0 lessons from 4 duties).

**Verdict: KILLED AT PILOT.** The channel is real but too thin to move
the aggregate: trapper-occupation joiners are rare (~25% of runs), the
duty→lesson chain is leaky (learner need + 85% + chore-tick gates the
layer cannot direct), and 15/16 pairs are bit-identical. Per kill
protocol the layer is deleted zero-trace; instruments + evidence land.

## Village assessment (plain words)

The villages are the competent pre-seat villages of the npctrap census,
one layer deeper: the pit line is still the turnover economy. On 6624
the layer's best case plays out — a trail-crew joiner walks in on day
98 and a rancher on day 140, the scholar asks them to teach (twice yes,
once an honest no), and they work the line themselves: Jude's raccoon
(+844) and Jerónimo's deer (+481) land in the pantry with their names
on the beats. But nobody learns the pit from them — the classroom stays
empty all sixteen runs. On the other fifteen seeds the layer is a ghost:
same catches, same deaths, same days, to the decimal. The blank this
arm fills is a negative one, and it's worth writing down: the joiner
flow sustains the line by working it, not by teaching it. Knowledge
spreads through the pit_lesson apprenticeship at its own pace (5
lessons both sides, all natural) — the scholar asking doesn't hasten
it, because the lesson needs a hungry or novice learner in the room and
the layer cannot choose who sits by the fire.

## Sense-test (SENSE-TESTING LAW)

Read evidence/2026-10-19/sense-trapjoin-b.txt (seed 6624, TRAPJOIN=1,
144d, 404 trap/teach/join lines):

- "🪤 Jude is back from the pit line: Raccoon in the pit — +844 kcal to
  the pantry." / "🪤 Jerónimo is back from the pit line: White-tailed
  Deer in the pit — +481 kcal to the pantry." — the two trapper joiners
  arrive as strangers ("A curious wanderer grins wide. Haven grows by
  one.") and become named trappers working both lines (Jude's snare
  +246 the same day as his pit raccoon).
- "🪤 A man, maybe 30s catches you watching the pit line. '...Want to
  actually SEE one?' They walk you out to it — the depth, the sharpened
  stakes at the bottom, where the game trail runs. 'Brush it over with
  leaves. And mark it well — your own pit will take you too.'" — the
  d1 pit_teach from Owen Smith, the day-0 trapper, still the line's
  best teacher.
- The teach duties themselves are narrated by the engine's assignment
  verbs (in-person asks, one honest refusal at trust 25: "Not today.
  Sorry."), never silent.

Judgment: sensical. The joiners act like people with a trade — they
arrive, they work, their catches have names and consequences. What the
transcript does NOT show, on any of the 404 lines, is a scholar-asked
teach duty turning into a lesson. The classroom beat is absent because
the lesson never landed, not because it wasn't narrated.

## Metric review (mandatory)

- PRIMARY (binding, 1.5×): MISSED 1.09×. Not a bar-calibration miss —
  the paired structure shows the layer is near-inert (15/16 identical
  pairs). The bar was honest; the lever is weak. No re-score.
- SECONDARY (catches ≥ off+5): MISSED 24/27. Same root cause.
- ENGAGEMENT (≥3 runs): MISSED 2/3. The welcome's trust<20 gate never
  fires because arrivals start at trust 20 — the welcome is dead code
  on the arrival path (it only serves trust-rotted joiners, of which
  there were none in 16 runs). If this line is ever revived, the
  welcome should greet every trapper joiner, not just the distrusted.
- The 1.5× bar assumed the duty would COMPOUND (each duty → ~1 lesson
  → ~1 new trapper → their catches). Empirically the duty → lesson
  step is ~0/4. The chain's leaky step is the learner gate
  (hungry-or-novice + 85% + 22% chore tick), which no policy-side layer
  can direct — a structural finding, filed below.
- Instrument note: the layer's engine verbs (talkTo, assignTask) consume
  game RNG, so on-side divergence on a pair (s6624) mixes mechanism
  with RNG/schedule perturbation. The 15/16 identical pairs bound the
  perturbation small; the mechanism attribution (0 lessons) is clean.

## Wall numbers (report-only)

On-side (16 runs): national 8/16, table 13/16, wins 0/16, wave-4 16/16,
wave-5 0/16, median survival 136d, max 180d, maxArc 4.
Off-side (16 runs): national 8/16, table 13/16, wins 0/16, wave-4 16/16,
wave-5 0/16, median survival 136d, max 180d, maxArc 4.
Identical to the pair. The scale wall is unmoved: no wins, no wave-5,
national/table at the pre-seat census level.
TELEMETRY: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall-preseat.json --current
'evidence/2026-10-19/perseed-trapjoin-b/on-*.json'` fired one LOUD
(wall.tableWaiting "newly appeared") — investigated: pure schema
artifact (baseline key `table` vs my dot-path `wall.tableWaiting`).
Regime-aligned manual comparison: baseline 9/14/0 vs current 8/13/0
(national/table/won) — all within the quiet band. Baseline NOT rolled.

## §15 balanced-panel compare

Built before/after through scripts/balance-panel.js on the named registry
policies (trapjoinlead, trapjoinbelong — additive entries in
scripts/sweep-compare.js, reverted post-kill), same 8 seeds × 180d,
gate-off (TRAPJOIN unset) vs TRAPJOIN=1, env FEASTSCALE_R13=1/SEATDRIVE=0
both builds. Both panels valid (16 cases each, neutrality proofs green,
no validity errors — the manifest is identical across builds since the
lever is file-identical and only the env gate differs). Compare:
evidence/2026-10-19/trapjoin-panel-compare.md (panel.json.gz +
compare.json alongside; cases/ caches not committed per §15).

**Decision: review_required.** The belong road is all no_material_signal
(every paired delta exactly 0). The lead road carries three
regression_watch flags: player deaths per run +0.625 (9.625→10.25,
interval 0–1.875), per 100d +0.39 (interval 0–1.08), community loss
+0.125 (interval 0–0.375) — all intervals touch 0, 8-pair screen.
Judgment: on a killed arm with 15/16 identical pilot pairs and clean
binding guardrails (median survival 136d both, starvation 6v6, no new
death mode), these read as RNG-perturbation noise from the layer's
engine-verb RNG footprint on a small screen, not a layer harm signal —
recorded as watch items per the instrument, not as findings. The panel
is the instrument; the pre-registered primary/guards were the judge,
and they killed the arm.

## Convergence state

**killed-at-pilot** — food-economy axis stays **converging**. The
trapper-joiner channel as a policy-side lever is dead: the joiner flow
sustains the line by working it (autonomous TRAPS purposes), not by
being asked to teach it.

## Named next (for the findings backlog)

1. The duty→lesson chain's leaky step is the LEARNER gate
   (hungry-or-novice + 85% + 22% chore tick, learner picked at random).
   No policy-side layer can direct who sits by the fire. If the line
   is ever to grow on demand, the apprentice-matching needs an
   engine-side hook (e.g. the teach chore preferring need-driven
   learners for pit topics) — game-code work, not policy work.
2. The welcome's trust<20 gate is dead on the arrival path (arrivals
   start at trust 20). Any revival should greet every trapper joiner.
3. s6623's d79 "farmer" joiner arrived WITH knowsPit=True (learned,
   not background) — the turnover economy's second sustain path
   (learned-pit joiners). A future joiner-channel could serve them;
   this arm's occupation scope excluded them by design.
4. The layer's engine verbs consume game RNG (talkTo/assignTask) —
   future policy-side arms that act in the world should assert the
   RED-2 trajectory check WITH the layer's verbs stubbed, or accept
   the perturbation as part of the measured effect.
