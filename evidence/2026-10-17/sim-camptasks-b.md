# sim-camptasks-b — camp-task coverage census (finding #479 second half)

Diagnostic arm, loop B food-economy axis, run fleshout-b-20261017T1355Z.
Sibling: sim-shelltask-b (the lever — teaches the policy to shell). This arm
is the AUDIT: a coverage census of the camp food-processing surface on the
base substrate (NO shelltask layer — the world as it is today).

## PRE-REGISTRATION (binding; written BEFORE sims)

- PRIMARY: coverage classification per verb. Any camp-task verb firing 0x
  across all 16 runs = STRUCTURAL BLANK (candidate for a future lever).
  Any verb firing >0 = report its rate, actor, and context.
- SECONDARY: the top-3 processable-but-unprocessed kcal pools on lean days
  (nuts in-shell / cookable-raw / cleaned-unpreserved-at-risk / raw fat /
  carcasses), with kcal numbers.
- SEEDS: 7101-7108 (fresh; not on the used list: 4801-4808, 4101-4108,
  6101-6108, 9701-9708, 5201-5208, 931-938, 1801-1808, 4201-4208, 3801-3808,
  107-884, 1940809, 962-969, 941-948, 951-958, 4001-4004, 1253, 2601457,
  1404-1406, 2026, 2031, 2042, 3050, 3055, 3061, 8801-8808, 8701-8708,
  8901-8908, 1707, 1060511, 1802, s967).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT;
  16 runs total). 180d death-aware horizons (engine tail) — no fixed 200d.
- INSTRUMENT: scripts/camptask-census-b.js (read-only wraps: stack-capture
  + counters only; zero RNG draws; zero state writes; zero src/js and zero
  scripts/policies changes).
- INSTRUMENT HONESTY: scripts/test-camptasks-b.js — PART A RED-verified
  fixture (synthetic known firings counted exactly; attribution resolved;
  samplePools kcal exact; RED = no instrument → nothing counted),
  PART B det-gate byte-identical trajectories instrument-on vs off
  (4 seeds x {leadfeast,belongfeast} x 60d), SMOKE green.
- COMPLETION GATES: 16/16 runs complete, schema-clean output
  (required keys; every event attributable), 0 instrument errors,
  100% event attribution for the verbs counted.
- Sense-testing (law): sample ONE day where processable food sat
  unprocessed while someone went hungry — read the beat transcript and
  say whether the fiction makes sense (person choosing badly) or it's a
  system blank (no actor exists).

## Canon read

- docs/CANON.md: the ladder is cleaned < cooked < smoked < rendered <
  pemmican; human skills ≠ alien abilities (processing = human skill lane,
  correctly); "If you don't know, it doesn't show."
- docs/PRESERVATION.md: blind penalties teach; rot can't be smoked back;
  cooking never destroys calories senselessly; smoking pace 16 ticks
  (Steve's final word); pemmican is the payoff (needs render knowledge).
- Finding #479: competent policy never shells in-shell nuts (0 camp-task
  calls for shell) — this census extends that audit to every camp verb.
- Finding #476: scholar's pack NEVER holds cookable food at the evening
  window (0/60 days) — the division of labor routes cookable to pantry/duty
  cook. Expect cook* verbs structurally starved on the scholar side.
- Duty-side prior art: cook duty's smoke-racks drive (game.js ~6518, preserves
  ~0.5-2k kcal/day against a 12k/day budget, eligibility-bound — finding
  #462); hunt duty flat cleaning 0.60/0.78 (game.js villagerHuntResolve).

## Results

COMPLETION GATES (pre-registered): 16/16 runs complete, 0 instrument errors,
0 unattributed events (2769/2769 attributed), all 16 per-seed JSONs
schema-clean. Det-gate (instrument on vs off): 8/8 byte-identical 60d
trajectories. RED fixture: known firings counted exactly, attribution
resolved, samplePools kcal exact.

### PRIMARY — coverage classification

16 runs × up to 180d (death-aware), 2769 counted verb firings:

| Verb | Firings | Actor / container | Verdict |
|---|---|---|---|
| shell (`shellNuts`) | **0** | — | **STRUCTURAL BLANK** |
| cook_single (`cookFood`) | **0** | — | **STRUCTURAL BLANK** |
| cook_batch (`cookAll`) | **0** | — | **STRUCTURAL BLANK** |
| butcher (`cleanCarcass`) | 268 | policy:competent (139 pack, 129 stash) | alive — scholar-side trapper loop works |
| preserve (`preserveFood`) | **0** | — | **STRUCTURAL BLANK** |
| render (`renderFat`) | **0** | — | **STRUCTURAL BLANK** |
| pemmican (`makePemmican`) | **0** | — | **STRUCTURAL BLANK** |
| duty_preserve (cook smoke racks) | 842 + 1519 racks-full refusals | duty:cook / pantry | alive — the duty is the entire preservation actor |
| duty_cook (haven meals) | 140 | duty:cook / haven | alive (credit-only meals) |
| hunt_duty_clean | **0** | wrap proven working in manual probe | substrate blank: hunt duties NEVER ASSIGNED (672 duty resolutions probed, 0 'hunt') — the cleaning verb exists but has no duties to clean through |

Five of seven scholar-side camp verbs have ZERO actors in real play —
not rare, not thin: zero. The engine exposes them only to UI clicks
(app.js stash buttons) and the sims have no UI, so on the courtship
substrate the whole scholar-side processing ladder (shell → cook →
preserve → render → pemmican) is decoration. The division-of-labor design
(finding #476) starves them: haul routes cookable to pantry/duty-cook the
same day; the duty cook does meals + smoking but never touches the scholar
verbs; the policy has zero calls for them (competent.js: 0 camp-task calls
besides cleanCarcass).

### SECONDARY — top-3 unprocessed pools on lean days

147 lean-day samples (scholar < 50% cap), gross kcal:

1. **cookableRaw: 2,026,279 kcal total, 13,784/lean-day** — needsCooking
   bulk (dried beans, rice) sitting in the pantry. Verified composition on
   leadfeast-7101 d5: 62×150kcal dried beans + 65×200kcal rice = 22,300 kcal
   while the scholar starved at 367/2400, no fire nearby. Nobody cooks it —
   cookAll/cookFood never fire, the duty cook doesn't batch-cook.
2. **in-shell nuts: 838,550 kcal total, 5,704/lean-day** — prep-stash +
   pack + pantry. Verified leadfeast-7108 d174: 14 stacks of in-shell acorns
   and hickory nuts on the prep counter while the scholar starved at
   27 kcal, fire nearby. They ROT there: "Overnight, Hickory Nuts (in
   shell) went bad — beyond saving." Shell = 0 firings.
3. **carcasses: 10,630 kcal total, 72/lean-day** — small because the butcher
   verb drains it (268 competent firings). The one healthy pool.
- cleanedAtRisk: 0 — the duty smoke drive handles it (842 firings vs 1519
  racks-full refusals: refused 1.8× more than fired; cf. finding #462).
- rawFat: 0 — no raw fat ever accumulates in pack/pantry on lean days.
  The render ladder has no input on this substrate at all (audit the fat
  pipeline before any render lever — an open question, not measured here).

### Wall numbers (standing directive)

16 runs: national 13/16, table 13/16, wins n/a (no modal driver on this
road), arc≥3 16/16, wave-4 unlocks 1/16, wave-5 0/16, exiled 0/16,
village starved-days 44, deaths 779 (5 starvation).

## Sense-test (law)

Sample: leadfeast-7108 d174. The scholar sits at 27/2400 kcal (starving,
"Your stomach is a fist. Eat — anything real, now.") with a fire nearby
and ~42,100 kcal of in-shell acorns and hickory nuts — named, known, with
"Shell them — 4 ticks · everyone knows how" on the card — on their own
kitchen counter (the policy's homecoming pooling put them there). The
policy's starvation loop eats "Foraged food (200 kcal)" when available and
voices "Nothing edible" over trapped carcasses — but never shells. One
stack rots overnight. VERDICT: system blank, not a bad choice. No actor
exists for any scholar-side processing verb: the policy never calls them,
the duty cook's job covers only meals + smoking, and no UI clicks in sims.
A person choosing badly would at least see the option; here the option is
present on the item card but absent from every actor's repertoire. The
fix is a missing actor, not a missing incentive — exactly what
sim-shelltask-b (the sibling lever) is building.

## Metric review (mandatory)

- The pre-registered PRIMARY (coverage classification) was answered exactly
  as framed: 5 scholar verbs at 0/16 runs, 3 duty actors quantified.
- The pre-registered SECONDARY (top-3 pools with kcal) is answered with
  composition-verified numbers, not just aggregates.
- Lean-day threshold (scholar < 50% cap) yielded 147 samples across 16
  runs — adequate; no metric change proposed.
- Instrument limitation (not a metric miss): the census counts verb
  INVOCATIONS (attempts), not effective conversions. For the 0-firing
  verbs attempt==conversion==0, so the classification is unaffected; for
  butcher (268 attempts) effectiveness is unmeasured. If a future arm
  needs conversion accounting, extend the wrap with outcome capture per
  verb — recorded here, not rescored.
- Det-gate ran 60d (not 180d): the instrument's reads are day-invariant,
  so a longer gate adds no information. Set before spend, not rescored.
- No metric was re-scored mid-run. No §14 event: this run met its
  pre-registration.

## Named next arms

1. **sim-shelltask-b (sibling, LIVE)** — teaches the competent policy to
   shell in-shell nuts on lean/starvation days. Census headroom:
   ~5,700 kcal/lean-day in-shell pool, 0 baseline firings. Watch for: the
   "Nothing edible" beat count on starvation days (it should fall), and
   the fixture case (nuts rotting on the counter at 27 kcal).
2. **sim-cookbulk-b (proposed)** — a cook-bulk lever: teach the duty cook
   (or the competent policy) to batch-cook needsCooking pantry bulk
   (beans/rice) on lean days. Headroom: ~13,800 kcal/lean-day, the
   largest pool, with 0 actors today. PRIMARY: cookableRaw-pool kcal
   converted > 0 with armed starvation ≤ control. Fire-proximity is the
   known gate (leadfeast-7101 d5 had none) — pre-register it as a covariate.
3. **sim-huntduty-b (proposed audit)** — hunt duties are never assigned
   (0/672 duty resolutions; the assignment mix was garden/wood/water/fish/
   cook/stone). The hunt_duty_clean verb works but has no substrate.
   Audit: is hunt assignment suppressed by the courtship duty priorities,
   and what would turning it back on do to cleaned-kcal throughput?
4. **sim-fatpipe-b (proposed audit)** — rawFat pool = 0 on lean days;
   fat items never accumulate. Before any render/pemmican lever, audit
   where butchered fat goes (eaten? spoiled? never separated?). The
   render ladder is input-starved, not actor-starved — different blank
   than shell/cook.

## Village assessment

The villages of this substrate look well-fed from the pantry view —
bulk beans and rice, preserved stores at the racks-full cap, 13/16 reach
national and the table. But the scholar's body tells a different story:
lean stretches arrive with the pack full of not-food-yet (trapped
carcasses waiting for the dawn cleaning pass, in-shell nuts no one
shells) and the counter full of bulk nobody cooks. The cook duty keeps
the haven fed and smokes what the racks allow (842 smoke events against
1519 refusals — the racks, not the cook, are the bind). Villagers behave
as duty-bound laborers — forage, fish, garden, cook, smoke — who never
hunt and never process; the knowledge economy of food processing lives
entirely in UI buttons no sim actor presses. 44 village starved-days and
779 deaths (only 5 from starvation — combat and raids do the killing)
with wave-4 unlocked once in 16 runs: the food economy isn't what's
killing these villages; it's what they're starving beside.

## Findings backlog note (#479 sub-note)

Finding #479 remains OPEN — the fix call belongs to sim-shelltask-b (the
lever worker). This census is the audit half. Companion finding for the
backlog, in the file's format:

- [open] 2026-10-17 — food/camp-tasks — FIVE OF SEVEN SCHOLAR CAMP VERBS
  FIRE 0x IN REAL PLAY (loop B sim-camptasks-b, run
  fleshout-b-20261017T1355Z, evidence/2026-10-17/sim-camptasks-b.md,
  16-run census 7101-7108 x {leadfeast,belongfeast},
  FEASTSCALE_R13=1/SEATDRIVE=0, instrument-honest: det-gate 8/8
  byte-identical 60d, RED fixture exact):
  shell/cookFood/cookAll/preserveFood/renderFat/makePemmican = 0 firings
  across 16 runs (147 lean-day samples); only cleanCarcass fires (268x,
  policy:competent) plus the duty-side cook (140 haven meals, 842 smoke
  events, 1519 racks-full refusals). Hunt-duty cleaning exists but hunt
  duties are never assigned (0/672 duty resolutions). Unprocessed pools on
  lean days: cookableRaw 2.03M kcal (13.8k/lean-day, beans+rice never
  cooked), in-shell nuts 839k kcal (5.7k/lean-day, rot on the counter),
  carcasses 10.6k (healthy — drained by the butcher verb), cleanedAtRisk
  0, rawFat 0 (render ladder input-starved). Sense-test (leadfeast-7108
  d174): scholar at 27 kcal starving beside 42k kcal of shelled-able nuts
  with a fire lit — SYSTEM BLANK, no actor exists for the scholar verbs,
  not a bad choice. NAMED NEXT: sim-shelltask-b (sibling, LIVE — nuts);
  proposed sim-cookbulk-b (bean/rice batch-cooking, headroom 13.8k/lean-day);
  proposed sim-huntduty-b audit (hunt duties never assigned);
  proposed sim-fatpipe-b audit (fat never accumulates — render ladder
  input-starved).

