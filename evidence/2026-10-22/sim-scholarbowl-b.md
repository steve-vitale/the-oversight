# sim-scholarbowl-b — "the scholar's bowl": thin-day player-side voiced meal choice (pilot)

Run: oversight-flesh-out-loop-b, arm sim-scholarbowl-b. Worker tree:
~/workspace/worktrees/sim-scholarbowl-b (base master e32d4e8c4; instrument
proof scripts/test-scholarbowl-b.js re-run on the new base 2026-10-22 —
28/28 green: E0 unit + E1 det-gate + E2 smoke + E3 det all pass; the base
move carries sibling src/js changes in game.js/ledger.js/encounters.js/
villager-objectives.js, so the previous worker's 17 old-base
(55c6299f6) per-seed JSONs were archived off-repo and the full 32-config
pilot was re-run from scratch on e32d4e8c4 — no base-mixing, per the
stale-base lesson).
Axis: food-economy. Named next of the KILLED-AT-PILOT thindefer-b arm
(backlog #816, the sim-poolscholar-b companion lever — Lever 2 of the
pool-thickness theory).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: the pool-thickness theory (sim-poolscholar-b, DIAG-GO)
  found the scholar's trust-scaled villageMeal (~1000/2000/2200 kcal/day)
  is ~50% of ALL pooled draws at EVERY thickness quintile —
  thickness-independent by design, the pool's single largest fixed cost.
  The villager-side thin-deference arm (thindefer-b, killed-at-pilot with
  teeth) fired correctly (177 deferrals, 18,474 kcal) but was structurally
  undersized (~44 kcal/day/village vs the scholar's ~2000/day): no
  villager-side lever can move the pool's fate. This arm touches the actual
  binding constraint: the scholar's draw, on thin days, becomes a VOICED
  choice — take half — exercised sim-side as the "take half on thin days"
  policy with the per-day voiced beat (thindefer's sense-PASS voice
  pattern). NEVER a silent override of the player's draw (#761
  sense-hostility constraint; canon "No silent actions"). The real choice
  UI (full / half / leave it) is Steve's design task and is OUT OF SCOPE;
  this arm measures the half-choice's economics headless.
- **Lever**: "the scholar's bowl" — at villageMeal, when
  pantryFreshDays()<2 (the Q1 thin gate), halve the trust-scaled share
  intent (want = min(share, room), halved at the pantryDraw choke point),
  with a first-person voiced beat once per day ("You take half your share
  — 'the bins are thin. Leave the rest for the village.'", deterministic
  (day+seed)%5 line pick, depositgate voice pattern). The empty-pantry
  thin day halves intent but stays silent (the pristine "No food in the
  pantry" beat owns the empty bin). Implemented as a LAYER
  (scripts/layers/scholarbowl-b.js, env SCHOLARBOWL=1) wrapping
  villageMeal/pantryDraw — ZERO src/js modifications, disjoint namespace
  (SCHOLARBOWL_B, _sbHalve) from all loop-A arms (checked: dmg-bands,
  splitclose, mantlechain, w5opens, rogue-text/luck/heatmap — no hook-point
  or namespace overlap) and from thindefer-b's THINDEFER_B/_thinDefer.
  Gate-off = install() never wraps (byte-identical delegation — the proof
  test's E1 det-gate pins it).
- **Substrate**: FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause-b /
  poolscholar-b / thindefer-b substrate — the substrate the theory was
  measured on).
- **Policies**: competent-player leadfeast + belongfeast (feastscale).
- **Seeds**: 8 fresh (67401–67408, freshness-verified 2026-10-22: no repo
  content in src/scripts/docs uses these numbers as seeds; evidence-dir
  substring hits are float-artifact kcal values, e.g. 10.793367401380214 —
  the documented filename-freshness criterion; inline assertion in the
  sweep). Pilot gate: 8 seeds per arm per policy × {control, armed} = 32
  configs, paired identical seeds.
- **Horizon**: 180d death-aware (dead villages stop simulating; the
  deathcause-b corpus horizon — the corpus the theory was built on). Never
  a fixed 200d.
- **PRIMARY (binding GO)**: thin-pool starvation deaths (cause-class
  'starvation' AND death-day pantryFreshDays<2), corpus totals over the 16
  paired configs: armed ≤ control−2 AND control ≥ 1 (mechanism bar — the
  bar thindefer missed; this arm attacks the binding constraint directly,
  so the same bar is the honest judge).
- **Guardrails** (all corpus-total / paired, must all PASS):
  1. total starvation deaths armed ≤ control;
  2. median survival (game days) armed ≥ control−10d;
  3. no new death modes (armed mechanism-class set ⊆ control set —
     starvation/dehydration/combat/sickness/wound/contest/raid; the
     thindefer-b metric-review bar-construction fix);
  4. no median pantry collapse (median of per-run median daily
     pantryFreshDays: armed ≥ 0.8 × control).
- **Instrument**: the balanced panel (scripts/balance-panel.js) per §15 is
  the instrument for the before/after comparison; the pre-registered
  threshold above is the judge. Env-gated lever ⇒ automated panel compare
  is descriptive-by-construction (sim-findings.md #796); the manual
  paired-row comparison judges. The panel compare .md is attached.
- **Verdict classes**: GO (all bars) / NO-GO (primary or any guardrail
  missed — never re-scored per §14) / killed-at-pilot (mechanism never
  fired — fast kill). Convergence: converging | converged | parked |
  killed-at-pilot.
- **Instrument proof** (scripts/test-scholarbowl-b.js, BEFORE the sweep):
  gate-off byte-identity (methods unwrapped, short-sim digest identical),
  mechanism (stubbed-Game: thin-day halves intent 1000→500, thick-day
  untouched, empty-pantry silent, one deterministic voice/day, zero
  Math.random consumed), sim smoke (mechanism fires in the wild), DET.

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (food ladder),
  docs/STORAGE.md (stash/ledger/trust; pantry cap 120,000 "tight, not
  cruel"), docs/DECISIONS.md 2026-10-21 SURPLUSFEED ruling (behavioral,
  bottom-up, never post-hoc — this lever is the draw-side, thin-side
  behavioral choice), docs/SURVIVAL-LEVERS.md (lever register — entry on
  landing).
- Code-grounded: villageMeal (game.js:27899 — trust-scaled 1000/2000/2200,
  best-fit pantryDraw, voiced; the joined-village and camp-wild branches
  never call pantryDraw, so the layer's flag is inert there);
  pantryFreshDays (game.js:15260); depositgate/thindefer voice pattern
  (one line/day, deterministic, narration-only).
- Sense-hostility constraint (backlog #761): the scholar IS the player —
  the choice is voiced by construction, never a silent override (canon:
  "No silent actions. Every action narrates honestly, including failures.").
- No canon doc covers the scholar's thin-day meal choice —
  sim-poolscholar-b.md §"The named lever (d)" is this lever's first written
  form; this arm builds it.

## Design calls (Steve 2026-10-07: figure it out yourself, document it)

1. Thin gate = pantryFreshDays()<2, evaluated at the scholar's meal (the
   Q1 thin quintile gate; same gate as thindefer-b's villager-side arm).
2. Halve the SHARE INTENT at the pantryDraw choke point (want = min(share,
   room), then halved) — the trust scaling stays (it's the village's
   offer); the THIN choice is the player's. Saved kcal = share/2 stays in
   the bins (conservation — nothing destroyed).
3. Sim-side the policy always exercises HALF on thin days (the choice UI's
   full/half/leave options are Steve's design task, out of scope). The
   voiced beat names the choice every time it fires — no silent override,
   ever.
4. Voice = day-voice (not per-meal): one line/day max, fired only when the
   pantry actually holds food (empty-pantry thin days belong to the
   pristine "No food" beat — deferring from an empty bin is not a choice).
   Line varies by DAY (deterministic (day+seed)%5) — the thindefer
   per-speaker repetition nit is avoided by construction (the speaker is
   the player).
5. Layer, not game code: the sibling loop is live with uncommitted game.js
   trees; zero src/js keeps the lanes disjoint. Gate OFF runs the exact
   pristine path (det-gate E1).

## RESULTS (pilot complete 2026-10-22, 32/32 configs on e32d4e8c4)

- **Sweep execution**: 32/32 configs, paired identical seeds (8 seeds ×
  {leadfeast, belongfeast} × {control, armed}), 180d death-aware horizons,
  substrate FEASTSCALE_R13=1 / SEATDRIVE=0 (inline seed-freshness assertion
  green). Base note: the previous worker's 17 old-base (55c6299f6) JSONs
  were archived off-repo and the whole pilot re-run on e32d4e8c4 — the
  base move carries sibling src/js changes (game.js, ledger.js,
  encounters.js, villager-objectives.js), so base-mixing was not
  defensible. All 32 rows carry anchor e32d4e8c4.
- **Mechanism telemetry (armed, 16 configs)**: thinMeals=275, halves=268,
  savedKcal=276,700, voices=137, errors=0. The mechanism FIRED at scale —
  this is NOT a killed-at-pilot candidate: the voice beat sounded 137
  times, the layer conserved ~277k kcal into the bins.
- **PRIMARY (binding)**: thin-pool starvation corpus totals —
  control=8, armed=7. Bar: armed ≤ control−2 (≤6) AND control ≥ 1 → MISS
  (7 > 6). **Verdict: NO-GO.** Per §14 a miss is NO-GO — never re-scored.
- **g1 total starvation**: control=15, armed=9 → PASS.
- **g2 median survival**: control=136d, armed=129d, bar armed ≥
  control−10 (=126) → PASS.
- **g3 death modes** (mechanism-class level): armed-only raw labels were
  `other:bad belly` (d17, both armed s67404 configs) and `other:Big Loud`
  (armed-leadfeast s67408 d66). Cause provenance: "bad belly" is foodborne
  illness — the paired controls show the same villager (gen_wk9hyxo) dying
  of sickness (d53) / monster (d99) later; it maps to the sickness
  (mundane-disease) class. "Big Loud" is a monster nickname (table.js
  sense-read: "They faced Big Loud and lived to sit here") → combat class.
  With the pre-registered mechanism-class mapping: armed ⊆ control →
  **PASS** (taxonomy fix goes in the next run's analyzer; this run is not
  re-scored).
- **g4 median pantry** (per-run median daily pantryFreshDays): control=4.27,
  armed=5.26, bar armed ≥ 0.8×control → PASS — the pool really did get
  thicker.
- **Panel** (§15 instrument): evidence/2026-10-22/scholarbowl-panel-primary.md
  attached (compare exit 2 = review_required, a decision not a crash).
  Env-gated lever ⇒ descriptive-by-construction (#796); the manual paired
  comparison judged. Panel signals noted: leadfeast player-deaths/100d
  regression_signal (6.42→9.21), community-loss regression_signal
  (0.625→1.0 leadfeast); belongfeast neutral.
- **Sense-test** (scripts/sense-scholarbowl-b.js, transcript in context —
  SENSE-TESTING LAW): the beat reads coherently. Seed 67401, day 1: the
  STARVING warning fires ("You went to bed on an empty stomach"),
  immediately followed by "🍽️ You wave off the second scoop — 'half's
  plenty for me tonight.'", then the meal line "Village meal: +800 kcal...
  (Half ration — they don't trust you yet.)". It is a named, deliberate
  choice — never a silent override; one beat/day, no repetition, canon
  "No silent actions" honored. **Sense verdict: PASS.** Wrinkle (metric
  review): the beat fired on day 1 while the player was already on a
  trust-half ration and under a starving warning — the sim policy "always
  half on thin days" can self-starve the scholar. The real UI
  (full/half/leave) is Steve's design task; this measures the half-policy
  headless only.
- **Paired deltas** (thin→, tot→, days): belongfeast s67401 0→1/0→1/181→82;
  s67403 2→4/3→4/38→50; s67404 0→0/0→0/108→181; s67405 1→0/2→2/49→136;
  leadfeast s67402 0→0/1→0/111→167; s67403 2→1/3→1/38→124;
  s67405 1→0/2→0/181→166; s67407 1→0/2→0/136→91. Everywhere else parity.
  Heterogeneous: on good seeds the lever extends life (s67404: village
  SURVIVES to 181d armed vs lost at 108d; s67405 49→136d); on thin seeds it
  trades villager lives for pantry depth (s67403 armed: 13 halves/13k
  saved, yet 4 thin-pool starvation deaths — the saved kcal thickened the
  bins while the mouths still starved).

### Wall numbers (national / table / wins; wave 4–5; survival)

- control: won 0/16, national 9/16, table 11/16, wave4 10/16, wave5 0/16,
  exiled 0, median 136d, max 181d.
- armed: won 0/16, national 11/16, table 12/16, wave4 15/16, wave5 0/16,
  exiled 0, median 129d, max 181d.
- The scale wall stands: zero wins on this substrate in either arm, no
  wave-5 unlocks. Armed villages reached wave 4 in 15/16 (vs 10/16
  control) but converted none of it.

### Village assessment (assessor's read)

The villages look like thin-soup villages in a harsh spring: the pool
oscillates around the thin gate (median fresh-days 4.27 control), and the
scholar's fixed ~2000 kcal/day draw is indeed the load-bearing cost. With
the lever, the pool runs measurably thicker (5.26) and two villages that
would have died mid-spring lived to see the year's end — but the
deferral is blind: the layer can't tell a starving scholar from a
comfortable one, so on seeds where the village was already failing, the
halves piled kcal into the bins while villagers (including, once, the
scholar's own household) starved on thin days anyway. s67403 is the
parable: 13 voiced deferrals, 13,000 kcal banked, and four thin-day
starvation funerals. The lever saved the pantry, not the people.

**Blank filled**: none in game code (layer-only arm; killed/no-land).
**Blank documented**: the deferral-routing gap — conserved pool kcal does
not reach starving mouths on thin days. This is the next lever's target,
not this run's work.

### Metric review (for the NEXT run, per §14)

1. PRIMARY horizon-exposure sensitivity: the death-aware 180d horizon lets
   armed villages live LONGER (s67404 +73d, s67405 +87d), accumulating more
   thin-day exposure — a corpus-total thin-pool count punishes the arm for
   its own success. Next run: normalize thin-pool starvation per 100
   village-days, or pre-register exposure-matched bars.
2. g3 taxonomy: sweep-time pclassOf maps "bad belly"→other, monster
   nicknames not in monsters.json→other. Next run's analyzer maps
   foodborne sentences→sickness, all named-threat kills→combat, at the
   pre-registered mechanism-class level.
3. Sense policy: the sim "always half" policy self-starves the scholar on
   day-1-style thin days. Next run: add a "defer only when the scholar's
   own fullness is safe" variant arm — or mark it Steve-call for the real
   UI (full/half/leave).
4. Effect decomposition: g1 (total starvation 15→9) PASSED while PRIMARY
   missed — the lever reduces starvation overall but not the thin-pool
   class it targeted. Next run pre-registers WHICH class it moves, not
   just "fewer deaths."

### Convergence

- **Verdict: NO-GO** (PRIMARY missed by 1: 7 vs bar ≤6; all four guardrails
  passed). Convergence state: **converging** — the pool-thickness theory
  holds its diagnosis (the scholar's fixed draw IS the binding cost) but
  this half-choice lever is not the treatment: it banks kcal without
  routing them to the starving. Not killed-at-pilot — the mechanism fired
  (268 halves, 137 voices, 0 errors); it was measured and rejected.
- **Telemetry deviation** (Steve 2026-10-13): telemetry-check fired 2
  LOUD lines (national 12→20, wins 16→0). Investigated same-run: both are
  regime artifacts — the baseline's _regime label is the winseat stack
  (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=1), while this arm's substrate is the pre-seat
  deathcause-b/poolscholar-b substrate (FEASTSCALE_R13=1, SEATDRIVE=0)
  where wins are structurally ~0 in CONTROL too (0/16). The baseline
  itself warns not to compare these regimes. No baseline update (would
  drop the regime label; coordinator territory).
