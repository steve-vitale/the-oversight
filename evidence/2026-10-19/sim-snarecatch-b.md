# sim-snarecatch-b — the snare witnessed-catch bootstrap (backlog #633's named next)

Worker: fleshout-loop-b run fleshout-loop-b-20261019T2059Z, arm sim-snarecatch-b.
Worktree: ~/workspace/worktrees/sim-snarecatch-b.

## Pre-registration (binding; written BEFORE any sims — MEASUREMENT.md §14)

- **Base SHA (frozen):** 6693d94299fd3d18aaa79fd31736bb542b38d24d — worktree
  HEAD at run start, verified clean (`git status --short` empty). Tree delta
  during measurement: src/js/villager-objectives.js only (the bootstrap),
  scripts/test-snarecatch-b.js + sweep + analyzer (instruments), this note.
- **Primary metric:** scholar snare-L1 learn rate on UNSCREENED fresh seeds
  — runs with a recipe-learn event / 16 pilot runs (the wirewatch metric
  review: screened knower-present seeds saturate the rate at 16/16 — use
  unscreened composition where the learn can actually fail).
- **GO threshold:** armed learn-rate ≥ control + 2/16 AND armed ≥ 5/16,
  with ≥2 MECHANISM-ATTRIBUTED learns. A rate lift with zero
  mechanism-attributed learns is trajectory noise → NO-GO (the
  wirebootstrap-b2 lesson).
- **Mechanism attribution:** a learn is mechanism-attributed iff a
  'snare_catch_learn' tele event fired on the same run (the hook fires the
  tele in the same breath as its grant — measurement infrastructure, zero
  gameplay effect; the grant itself keeps the pit's type 'witnessed'
  naming exactly, since grantKnowledge rebuilds src as {type, by, day}
  and drops extra fields). Both sides log recipeLearns with day/type/by
  via the sweep's _grantRecipe wrapper, plus snare_catch_learn days via
  the tele wrapper.
- **Guardrails (binding):** (a) median survival ≥ control − 10d;
  (b) paired starvation deaths ≤ control + 1; (c) no new death mode — any
  death-cause key absent from the control corpus appearing on ≥2 armed runs
  is a same-run investigation item.
- **Det-gate (structural, reported alongside GO):** the patch consumes no
  RNG (no R() calls in the hook — verified by diff inspection). On
  knowers0==0 pairs the hook cannot fire, so before/after rows must be
  BIT-IDENTICAL (JSON-equal). Any divergence on a no-knower pair is a
  same-run investigation item. Additionally the proof test verifies the
  pit's witnessed-catch bootstrap still fires post-patch (pit channel
  unchanged behaviorally).
- **Horizon:** 180d death-aware (dead villages stop simulating + 10d tail
  max — the harness's own deadTail; never a fixed grind).
- **Seeds:** 42101–42108 — 8 fresh UNSCREENED seeds × {leadfeast, belongfeast}
  = 16 runs per side, before/after on IDENTICAL seeds. Freshness verified:
  zero word-boundary hits for 42101–42108 in scripts/*.js, zero hits in
  evidence/2026-10-19/sim-*.md and hidden_files/*.md (2026-10-19). No
  screening — knower composition is whatever the seed deals, including
  0-knower seeds (the channel is dead there by construction; they double
  as the det-gate pairs).
- **Policies:** leadfeast, belongfeast (competent family; FEASTSCALE_R13=1
  substrate, SEATDRIVE=0 pre-seat per the run claim — matches the teach
  lane's substrate).
- **Convergence:** food-economy axis converging (teach sub-axis moved —
  snareteach landed; witness sub-axis closed by wirewatch's kill; trapline
  sub-axis open — wireacquire-b3 killed substrate-missing; the bootstrap
  closes #633's named game-code next for the catch channel).

## Canon read

- docs/CANON.md read: human skills are teachable earthly knowledge — the
  snare is a RECIPE (knowledge, taught/seen), taught villager→player;
  knowledge gates every surface; "If you don't know, it doesn't show."
- No hunting/traps canon doc exists in docs/ (verified 2026-10-19 — same
  finding as the trapjoin, npctrap, and wirewatch arms). Stated here, not
  invented: the snare learn beats live in src/js/villager-objectives.js
  (see Engine reading below). The pit's witnessed-catch bootstrap is the
  port's canon-adjacent precedent (pitknowledge 2026-10-18, code).

## Engine reading (from code, 2026-10-19 — the brief's required first step)

The pit witnessed-catch bootstrap (pitknowledge 2026-10-18,
villager-objectives.js objReturnEffect 'traps' branch, ~:1288): inside the
pit-catch block (`if (_knowsPit && R() < 0.18)`), after the pantry stock +
say + tele('npc_pit') — a nested try/catch reads the scholar's pit_trap
recipe level; if `playerAtHaven && level < 1 && this.grantKnowledge`, it
grants `{ type: 'witnessed', by: nm }` and says "Watching … you finally see
the shape of it. You could dig one now." NO trust gate. No once-per flag —
the L0 check is the gate. No new RNG: no R() calls in the block.

The snare side of the same function (~:1251): the snare-catch block
(`if (_knowsSnare && R() < 0.4)`) stocks the pantry, says the return line,
teles 'npc_trap' — and has NO learn hook. The two trust-15 snare channels
are the TRAP TEACHING beat (~:1307: `playerAtHaven && _knowsSnare && L0 &&
!_vp.taughtSnare && _tr >= 15`, grant `{ type: 'taught' }`, once per
teacher) and SNARE OVERHEAR (~:1186: trust(teacher) ≥ 15, grant
`{ type: 'witnessed' }`).

Also found in code: the player's OWN trap learnability beat (pacing build
2026-10-10, game.js:3679) — a witnessed catch from YOUR snare grants
recipe L1 ("Watching the snare do its work… You could build one now.").
The pit comment frames its bootstrap as "the checkTraps learnability
beat, through the village's own hands instead of yours." This arm is the
snare's equivalent of exactly that.

One engine fact that shaped attribution: `grantKnowledge` (game.js:17802)
rebuilds src as `{ type, by, day }` — extra fields (a `channel` marker)
are stripped before `_grantRecipe`. So the grant keeps the pit's naming
exactly, and a SIM-TELEMETRY line ('snare_catch_learn', the
trapline-2026-10-13 convention) fires beside the grant for attribution —
zero gameplay effect.

## The lever (game-code, src/js/villager-objectives.js)

A 15-line block inside the snare-catch branch, placed after the
tele('npc_trap') line — the same structural position the pit bootstrap
holds in its branch (before the PIT LINE / teaching beats). It fires only
on `_caught && playerAtHaven`, checks scholar snare L0, grants
`{ type: 'witnessed', by: nm }`, teles 'snare_catch_learn', and narrates:

> 🪤 Watching Jorge work the snares — the loop, the trigger stick, where
> the run narrows between the roots — you finally see the shape of it.
> You could set one now.

Design calls (Steve can overrule):
1. **The no-trust-gate choice.** The hook has NO trust gate — it follows
   the pit's pattern exactly. The trust-15 gates stay on the TRAP TEACHING
   beat and the SNARE OVERHEAR channel; this is a separate witnessed
   channel (a villager's own catch doing the teaching through the
   village's own hands). Precedent: pitknowledge 2026-10-18 shipped the
   identical shape for the pit. If the snare should stay trust-gated even
   on witnessed catches, say so and the hook gets the gate.
2. **The learn-beat narration.** Mirrors the pit catch line's skeleton
   ("Watching … — … — you finally see the shape of it. You could set one
   now") with the established snare phrase ("the loop, the trigger stick,
   where the run narrows between the roots" — the exact phrase the teach
   beat and the overhear both use). The wirewatch arm's PASS sense-read of
   the overhear learn ("Your hands don't know it yet. Your eyes do") set
   the tone bar: physical, specific, earned. Sense-read in transcripts
   below.
3. **Attribution tele instead of a channel field.** grantKnowledge strips
   extra src fields, so a channel marker could not survive; the
   'snare_catch_learn' tele is the repo's SIM TELEMETRY convention and
   changes nothing gameplay-side.
4. **Ordering.** The bootstrap sits before the TRAP TEACHING beat in the
   function — the same order the pit's bootstrap holds relative to PIT
   TEACHING. On a high-trust witnessed catch, the bootstrap fires first
   and the teach beat's L0 check then fails — the catch steals the teach's
   thunder. Same as the pit's existing behavior; flagged rather than
   reordered.

## Proof test

scripts/test-snarecatch-b.js — 10 checks, real harness
(loadGame+setupGame, seed 300, cast has snare+pit knower jorge_silva),
real Game.objReturnEffect driven directly, trust pinned at 10 per call
so the trust-15 teach beat can never confound the catch channel.

- RED (unpatched tree): 6 pass / 4 fail — the four new-behavior checks
  fail (home-catch grant, caught-call pairing, L1-gate postcondition,
  narration). The witness gate (away: no grant), the teach beat staying
  off at trust 10, and the pit bootstrap firing all PASS pre-patch —
  the behavioral baselines the lever must not disturb.
- GREEN (patched tree): **10/10 pass.** Witnessed catch at trust 10 →
  snare L1, grant type 'witnessed' (the pit's naming), snare_catch_learn
  tele fired; every grant fired on a caught call (hook lives in the catch
  block); no 'taught' grant at trust 10; no second grant at L1+; the
  learn beat narrates; pit det-gate: the pit bootstrap still fires on a
  witnessed pit catch post-change.

Det-gate (structural): the hook contains no R() calls (diff-inspected) —
on no-knower seeds it cannot fire and consumes no RNG, so before/after
pairs must be bit-identical (adjudicated in the analyzer below).

## Before/after (identical seeds)

Driver: scripts/sweep-snarecatch-b.js (per-seed JSONs:
evidence/2026-10-19/snarecatch-snarecatch-{baseline,armed}/).
Balanced panel: scripts/balance-panel.js on the pilot seeds, before/after
per §15 (compare .md attached: evidence/2026-10-19/snarecatch-panel-b.md).

### Pilot results

| Metric (16 before / 16 after) | baseline | armed |
|---|---|---|
| scholar snare-L1 learn rate | 7/16 | 7/16 |
| mechanism-attributed learns | 0 | 2 (s42106 × 2 policies) |
| median learn day | 9 | 1 |
| learn vias | taught ×5, witnessed ×2 | taught ×3, witnessed ×4 |
| npc_trap returns / caught | 234 / 90 | 260 / 102 |
| snare_catch_learn teles | 0 | 2 |
| snare_lessons (NPC→NPC) | 6 | 11 |
| snare_overhears | 0 | 0 |
| median survival (days) | 117 | 109 |
| max survival | 180 | 180 |
| starvation deaths | 10 | 10 |
| death causes | combat 289, villager combat 105, monster 47, … | combat 290, villager combat 105, monster 51, … (no new mode) |
| national / table / wins | 9 / 0 / 0 | 9 / 0 / 0 |
| waveMax / wave4 / wave5 | 4 / 8 / 0 | 4 / 8 / 0 |

Per-seed: 15/16 pairs have IDENTICAL survival days. The single divergent
pair is belongfeast-s42106 (117→109): the armed run learned the wire at
day 1 (catch hook) instead of day 9 (teach beat); the earlier learn put
the recipe in hand 8 days sooner and the village died 8 days earlier —
the mechanism's footprint is real but costs nothing the guardrails forbid
(median 109 ≥ 107 = control−10; the medians differ by exactly this one
pair's 8-day shift). The 6 no-knower pairs are JSON bit-identical
(det-gate PASS — the hook is RNG-free and cannot fire without a knower).

Where the hook engaged: s42106 (both policies) — a witnessed snare catch
on day 1 granted L1 via the new channel (attributed ×2), 8 days before
the control's trust-15 teach beat would have fired. Where it did not:
s42101 (died 61/82d, 11 catches, none witnessed — the village died in the
wave-1 grinder before any co-presence) and s42102 (survived 139/180d, 36
catches, 4 NPC lessons, zero witnessed — the trapper worked a full
trapline the scholar never saw; trust/presence never aligned). The hook
accelerates learns where the teach channels already work; it converts
zero control-failures, because the failures are social (no witnessed
co-presence), not mechanical.

### Panel (§15)

`node scripts/balance-panel.js compare --before
panel-snarecatch-b-before/panel.json.gz --after
panel-snarecatch-b-after/panel.json.gz --out snarecatch-panel-b` →
decision **review_required** (the panel's default posture — no
auto-clear), with **no_material_signal on every observed metric** (all
paired deltas 0 or noise-scale: e.g. belongfeast player deaths/run
−0.125, mean living NPCs +0.0375). Both panels valid (16 cases each,
sourcesStable true, neutrality clean). The instrument worked; the
before/after are materially identical — consistent with the sweep's
NO-GO. Compare report: evidence/2026-10-19/snarecatch-panel-b.md (+ .json).
Panel case caches deleted per cache hygiene (panel.json.gz + compare
only).

## GO adjudication — KILLED AT PILOT

Adjudicated by scripts/analyze-snarecatch-b.js against the pre-registered
header (run BEFORE any sims; §14):

- **Primary (pre-registered, armed ≥ control+2 AND ≥5/16 with ≥2
  mechanism-attributed): MISS.** 7/16 vs 7/16 (+0). The floor (≥5/16) and
  the attribution clause (2) are met, but the rate delta is zero.
- **Guardrails: all PASS.** Median survival 109 vs 117−10=107; starvation
  10 vs 10+1; no new death mode (armed death-cause keys ⊆ control keys).
- **Det-gate: PASS.** 6 no-knower pairs JSON bit-identical.
- **Panel (§15):** TBD — attached when the after-panel lands.

**Verdict: KILLED-AT-PILOT.** Classification: **mechanism-engaged but
rate-inert** — not substrate-missing (the hook fired twice, both
attributed, with a real day-9→day-1 acceleration), not metric-broken
(the bar was honest and the unscreened composition was the right call —
the control rate is 7/16, not saturated). The failure is substantive:
on the competent substrate the trust-15 teach channels already win every
seed where a witnessed catch can happen; the remaining no-learn seeds
are no-learn because the scholar never witnesses the trapline at all
(s42101: early death; s42102: 36 catches, zero witnessed) — a
co-presence/trust gap the catch bootstrap cannot bridge, since it needs
the very witness the teach channels also need.

Per kill protocol the game-code block is reverted (killed arms leave no
trace); instruments + evidence land.

## Sense test

The hook engaged on s42106 (both policies), so there is a real learn
transcript to read — scripts/sense-snarecatch-b.js captured the
trapline beats (evidence/2026-10-19/snarecatch-sense-b/). Read whole:

> [d1] A person, maybe 50s, with a nervous tic heads out to check the
> snares. "Wire doesn't lie."
> [d1] 🪤 A person, maybe 50s, with a nervous tic is back from the snares:
> +169 kcal to the pantry.
> [d1] ★ RECIPE LEARN: snare L1 via=witnessed by=A person, maybe 50s,
> with a nervous tic
> [d1] Recipe: Snare (Level 1). You have seen a snare. A loop, a stick,
> an animal.
> [d1] 🪤 Watching A person, maybe 50s, with a nervous tic work the
> snares — the loop, the trigger stick, where the run narrows between
> the roots — you finally see the shape of it. You could set one now.

Reads as earned: a person came home with meat in hand (+169 kcal to the
pantry — the catch is real, not a lesson prop), and watching them work
the line taught the shape. Physical and specific, no mechanic-speak —
the same tone bar the wirewatch arm's PASS sense-read set. Notably the
teacher is a STRANGER (never named in 40 days — "A person, maybe 50s,
with a nervous tic"), which is exactly the sub-trust-15 channel the hook
was built for: the trust-15 teach/overhear gates would not have fired
for this trapper on day 1. The control learned the same seed's wire on
day 9 via the teach beat — the hook bought 8 days by watching a
stranger's hands instead of waiting for regard. PASS.

The village reads alive around it: dawn trapline patter ("Wire doesn't
lie."), honest empty lines ("Snares were empty. They'll keep."),
NPC→NPC teaching ("Daniyar is showing Ekaterina how to tie a snare.
Hands patient. It takes three tries."), a night raid, a Living Wire
kill with a counter learned and passed on. Neighbor observation, not
this arm: the garden sowing line repeats verbatim when the scholar sows
3× (same finding as wirewatch's sense read — honest, slightly robotic).
Noted, not chased.

## Village assessment

Sixteen villages on the pre-seat feast substrate, unscreened
composition: 10 runs with wire-knowers at day 0, 6 without (one of
those grew a knower mid-run). The shape: the wave-1 meat grinder
dominates (median survival 109–117d; death causes combat 290, villager
combat 105, monster 51 — starvation only 10 across 32 runs). Villages
die to teeth, not hunger, on this substrate. National 9/16 both sides;
table 0; waves stall at 4 (8/16 reach wave 4, 0 reach wave 5) — the
standing scale-wall shape, wire or no wire.

Who thrived and who died: the two s42106 villages are the trapline
success story — a working wire line from day 1 (armed), steady catches
through day 40, NPC→NPC teaching spreading the craft. s42101's villages
died at 61/82d with 11 snare catches the scholar never witnessed — the
trapper worked, the village died around them. s42102's leadfeast village
survived all 180 days with 27 snare catches and 3 NPC snare lessons and
never learned the wire — the trapper and the scholar lived in different
orbits for six months; a whole trapline the scholar never once saw.

What knowledge was missing: nothing mechanical about the wire — on
knower-present seeds the learn channels (teach, overhear, now catch)
fire wherever co-presence exists. What's missing is SOCIAL: witnessed
co-presence between the scholar and the trapper. The catch bootstrap
proved it can teach through a stranger's hands (s42106), but it cannot
manufacture the witness — and the seeds where the control fails are
exactly the seeds where no witness happens (s42101: early death;
s42102: 36 catches, zero witnessed). That is the trust/presence drive's
lane (snareteach, landed), not a fourth learn channel.

## Blanks filled / documented

- **DOCUMENTED (this arm, #633 learnability sub-gap CLOSED):** the
  witnessed-catch bootstrap for the snare ENGAGES (2/16
  mechanism-attributed learns, day-9→day-1 acceleration on s42106,
  proof test 10/10, guardrails pass, det-gate bit-identical) but is
  RATE-REDUNDANT with the trust-15 teach channels on the competent
  substrate: 7/16 vs 7/16, zero converted control-failures. The remaining
  snare fragility is not learnability — it is (a) knower presence at day
  0 (6/16 unscreened runs), and (b) witnessed co-presence between scholar
  and trapper (s42101/s42102). #633's named game-code next is answered:
  the hook works, and the answer is that the wire's learn problem was
  never the missing channel.
- **KILL PROTOCOL (this arm):** the arm missed its pre-registered GO bar
  → killed-at-pilot → the game-code block is REVERTED (leave no trace).
  src/js/villager-objectives.js returns to HEAD. The instruments (proof
  test — currently RED on the reverted tree, kept as the instrument for
  the next trapline arm; sweep; analyzer; sense script; both panels;
  this note) are kept. The evidence stands as the record.
- **DOCUMENTED (engine fact):** grantKnowledge (game.js:17802) rebuilds
  src as {type, by, day} — extra fields are stripped before
  _grantRecipe. Any future channel-attribution on grants needs either a
  tele line (this arm's route) or a grantKnowledge change (game.js —
  out of this arm's file scope).
- **DOCUMENTED (metric):** median survival as a regression gate is
  sensitive to single-pair shifts on 16-run pilots (109 vs 117 here is
  exactly one pair's 8-day move). Fine for a guardrail, not for ranking.

## Telemetry deviation check (run-body step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall-preseat.json --current
'evidence/2026-10-19/snarecatch-snarecatch-armed/*.json' --metrics
national,table,won,exiled` → fired LOUD on "national disappeared:
baseline 21 → current 0" and "table disappeared: baseline 24 → current
0". Investigated: **regime/flag artifact, not a deviation** — same as
the wirewatch arm's finding. The preseat baseline was built from the
winsupport-decomp corpus (NODEWITNESS=1/VETREL=1/WINDEFER=1 flags); this
pilot's substrate is the plain feast pre-seat (FEASTSCALE_R13=1/
SEATDRIVE=0). Additionally a schema mismatch: the checker reads a
`national` boolean/count field; my per-seed JSONs carry
`nationalHeldDays` (scale-repro), so it reads 0 for every file
regardless. The honest comparison is armed vs control (my own
identical-seed baseline): national 9/16 both, table 0/16 both, wins
0/16 both — identical. No layer deviation. Baseline NOT rolled.

## Metric review

- The pre-registered GO bar was honest and the pilot honored it: the
  rate delta is the judge, and 7/16 vs 7/16 is a clean MISS — not
  re-scored against the friendlier acceleration (day 9→1, real but
  unregistered). Per §14 the acceleration is documented here and the
  metric stands for the next run.
- The unscreened composition was the right call (the wirewatch metric
  review): control 7/16, not saturated — the learn can genuinely fail,
  and the failures are interpretable (no-knowers; no-witness).
- Mechanism attribution via the adjacent tele line worked cleanly (2/2
  attributed learns matched catchLearnDays) after the channel-field
  approach died on grantKnowledge's src rebuild — noted above as the
  engine fact for future arms.
- Median-learn-day as a secondary metric: armed 1 vs control 9 — the
  hook's real effect. If a future arm re-tries this lane, pre-register
  on the day margin (or on low-trust seeds specifically), not the raw
  rate.
- Guardrail sensitivity: with n=16, median survival moves on single
  pairs — keep it as a guardrail (it passed), never as a GO metric.

## Convergence state

**killed-at-pilot** — food-economy axis stays **converging**. The snare
learnability sub-axis is now closed: teach (landed) + overhear +
witnessed-catch (proven, redundant) saturate every seed where a witness
happens. The trapline's open gaps remain knower presence (seed
composition), the trust/presence drive (snareteach's lane, landed), and
the materials/crafting gate (wirebootstrap's open ACQUIRE leg).
