# sim-scholardist-b — "the scholar's share": thin-day earmarked distribution (pilot)

Run: oversight-flesh-out-loop-b, arm sim-scholardist-b. Worker tree:
~/workspace/worktrees/sim-scholardist-b (base master b7160b82f, verified).
Axis: food-economy. DISTRIBUTION-side named next of the scholarbowl-b NO-GO
(backlog: the scholarbowl-b "deferral-routing gap" — conserved pool kcal
does not reach starving mouths on thin days; evidence/2026-10-22/
sim-scholarbowl-b.md §Village assessment / Metric review).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: does EARMARKED DISTRIBUTION move thin-pool starvation where
  pool thickening could not? sim-scholarbowl-b's half-choice FIRED (268
  halves, 276,700 kcal saved, 137 voiced beats, all guardrails PASS) but
  thin-pool starvation moved only 8→7 (bar was ≤6): the saved kcal
  thickened the bins while mouths still starved (the s67403 case: 13
  halves / 13k kcal saved, yet 4 thin-pool starvation deaths). Thin-pool
  starvation is a DISTRIBUTION/timing problem, not a pool-thickness
  problem. This arm routes the scholar's conserved thin-day half DIRECTLY
  to the hungriest villager(s) — earmarked, never pooled.
- **Lever**: SCHOLARDIST=1 — "the scholar's share". On thin days
  (pantryFreshDays()<2, the Q1 thin gate, evaluated at the scholar's
  meal), halve the trust-scaled villageMeal intent at the pantryDraw choke
  point (same choke point as scholarbowl-b — reuse its pattern, disjoint
  namespace SCHOLARDIST/_sd from scholarbowl's SCHOLARBOWL_B/_sbHalve and
  from all loop-A arms: dmg-bands, splitclose, mantlechain, w5opens —
  checked, no hook-point or namespace overlap). Instead of returning the
  conserved half to the general pool, the layer draws it as REAL pantry
  items for the hungriest eligible villager (living, present — not away,
  not the scholar; max npcNeeds hunger, threshold ≥20, roster-order
  tiebreak, zero Math.random) and folds it into that villager's meal via
  the engine's own "eaten at the fire" intake channel (the depositgate
  dgEased honesty precedent: extra intake counted in the meal's
  starvation-judgment ateAll, recorded via recordHarvestIntake with a
  named tag, hunger eased by the meal formula). No phantom kcal: the grant
  is a real best-fit pantryDraw (taken may be < intent on thin bins); a
  zero-take grant is silent (nothing moved — nothing to narrate). The
  beat is first-person scholar + named recipient + recipient reaction,
  one/day max, deterministic (day+seed)%5 line pick — NEVER a silent
  override of the player's draw (#761 sense-hostility constraint; canon
  "No silent actions"). Implemented as a LAYER
  (scripts/layers/scholardist-b.js, env SCHOLARDIST=1) wrapping
  villageMeal + pantryDraw + villagerMealDay + villagerDayProduction —
  ZERO src/js modifications. Gate OFF = install() never wraps
  (byte-identical delegation — the proof test's E1 det-gate pins it).
- **Substrate**: FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause-b /
  poolscholar-b / thindefer-b / scholarbowl-b substrate — the substrate the
  pool-thickness theory was measured on).
- **Policies**: competent-player leadfeast + belongfeast (feastscale).
- **Seeds**: 67401–67408 — the INTENTIONAL paired reuse of scholarbowl-b's
  corpus (task-mandated: identical seeds = paired before/after). Base moved
  (scholarbowl ran on e32d4e8c4; this arm runs on b7160b82f), so the
  pairing is within-run control-vs-armed, not cross-run. The sweep's
  freshness check allow-lists the scholarbowl-b arm files and still fails
  on any other hit.
- **Horizon**: 180d death-aware (dead villages stop simulating; the
  deathcause-b corpus horizon — the corpus the theory was built on). Never
  a fixed 200d.
- **PRIMARY (binding GO)**: thin-pool starvation deaths (cause-class
  'starvation' AND death-day pantryFreshDays<2), corpus totals over the 16
  paired configs: armed ≤ control−2 AND control ≥ 1 (mechanism bar — the
  bar both thindefer-b and scholarbowl-b missed; this arm attacks the
  named root cause — distribution, not thickness — so the same bar is the
  honest judge).
- **Guardrails** (all corpus-total / paired, must all PASS):
  1. total starvation deaths armed ≤ control;
  2. median survival (game days) armed ≥ control−10d;
  3. no new death modes (mechanism-class level — starvation/dehydration/
     combat/sickness/wound/contest/raid; the thindefer-b metric-review
     bar-construction fix, refined at analysis time from raw causes);
  4. no median pantry collapse (median of per-run median daily
     pantryFreshDays: armed ≥ 0.8 × control).
- **Engagement kill-fast gate**: distributed-kcal (tele.grantedKcal) > 0 on
  ≥ 6/16 armed runs, else kill at pilot (mechanism never reached mouths).
- **Instrument**: the balanced panel (scripts/balance-panel.js) per §15 is
  the instrument for the before/after comparison; the pre-registered
  threshold above is the judge. Env-gated lever ⇒ automated panel compare
  is descriptive-by-construction (sim-findings.md #796); the manual
  paired-row comparison judges. The panel compare .md is attached.
- **Verdict classes**: GO (all bars) / NO-GO (primary or any guardrail
  missed — never re-scored per §14) / killed-at-pilot (engagement gate
  missed — mechanism never reached mouths). Convergence: converging |
  converged | parked | killed-at-pilot.
- **Instrument proof** (scripts/test-scholardist-b.js, BEFORE the sweep):
  gate-off byte-identity (methods unwrapped, short-sim digest identical),
  mechanism (stubbed-Game: thin-day halves intent; grant drawn as real
  pantry items for the hungriest villager; produced-injection folds the
  grant into the recipient's meal; thick-day untouched; empty-pantry
  silent; one deterministic voice/day; zero Math.random consumed), sim
  smoke (mechanism fires in the wild), DET.

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (food ladder),
  docs/STORAGE.md (pantry cap 120,000 "tight, not cruel"), docs/DECISIONS.md
  2026-10-21 SURPLUSFEED ruling (behavioral, bottom-up, never post-hoc —
  this lever is the draw-side, thin-side behavioral choice, extended to
  earmarked distribution), docs/SURVIVAL-LEVERS.md (lever register — entry
  on landing).
- Code-grounded: villageMeal (game.js:28045 — trust-scaled 1000/2000/2200,
  best-fit pantryDraw cook:true, voiced; the joined-village and camp-wild
  branches never call pantryDraw, so the layer's flag is inert there);
  pantryDraw (game.js:28284 — fresh-first real-item draw); villagerMealDay
  (game.js:29175 — ownEat first, dayWant=need−ownEat, hunger eases by
  (ate/need)*70, starvation judgment ateAll<need*0.6 → hurtFromStarvation);
  villageEats ordering (game.js:30876 villageMeal BEFORE 30884
  villageEats — the scholar's meal precedes the villagers' meals, so the
  grant is stashed then consumed by the recipient's same-day meal);
  villagerDayProduction (game.js:28688 — the meal loop's ONLY produced
  caller is villagerMealDay:29199, so the injection wrapper is contained);
  depositgate dgEased (game.js:~29320 — "the eased share was eaten at the
  fire": extra intake recorded via recordHarvestIntake AND counted in
  ateAll — this arm's honesty precedent); giveFood (game.js:~4060 — the
  personal-gift mechanism: real item, hunger ease, intake record, trust —
  NOT the meal channel, hence not reused for the judgment); depositgate/
  thindefer/scholarbowl voice pattern (one line/day, deterministic,
  narration-only).
- Sense-hostility constraint (backlog #761): the scholar IS the player —
  the grant is voiced by construction, never a silent override (canon:
  "No silent actions. Every action narrates honestly, including failures.").
- No canon doc covers the scholar's thin-day earmarked grant —
  sim-scholarbowl-b.md §"Blank documented" (the deferral-routing gap) is
  this lever's first written form; this arm builds it.

## Design calls (Steve 2026-10-07: figure it out yourself, document it)

1. Thin gate = pantryFreshDays()<2, evaluated at the scholar's meal (the
   Q1 thin quintile gate; same gate as thindefer-b/scholarbowl-b).
2. Halve the SHARE INTENT at the pantryDraw choke point (want =
   min(share, room), then halved) — the trust scaling stays (it's the
   village's offer); the THIN choice is the player's. Same as
   scholarbowl-b.
3. The conserved half (want/2, rounded) is drawn as REAL pantry items FOR
   the hungriest villager via pantryDraw(v, X, {cook:true, exposure}) —
   the same cook:true abstraction as the villagers' own meals. The grant
   draws BEFORE villageEats (priority — earmarked, never competed for).
   taken may be < X on thin bins; taken = 0 ⇒ no grant, no voice, pool
   keeps everything (no phantom kcal — NEVER invented).
4. Recipient = hungriest eligible villager: living, present (not away —
   away villagers eat from pack; haven food can't reach them), not the
   scholar; max npcNeeds(vid).hunger with threshold ≥20 (a genuinely
   hungry mouth — below that the gift would leak back through gave);
   roster-order tiebreak; zero Math.random. No eligible recipient ⇒ the
   conserved half stays pooled (scholarbowl fallback).
5. Judgment visibility: the grant is folded into the recipient's meal via
   a villagerDayProduction injection (adds the REAL taken kcal for the
   gift-flagged vid only, during their villagerMealDay). This is the
   depositgate-dgEased honesty contract expressed as a layer: the gift is
   "eaten at the fire" — ownEat rises, dayWant falls (the recipient draws
   less from the thin pantry — a second-order distribution effect),
   hunger eases by the meal formula, the starvation judgment reads it.
   Known accounting fiction (documented, not hidden): contribLog.produced
   and the 'personal-work' harvest-intake record attribute the gift to the
   recipient's foraging; on the rare leak-back (recipient near-full) the
   excess returns to the pool via gave→stockSurplus ("shares the excess").
6. Voice = day-voice (not per-meal): one beat/day max, fired only when
   the grant actually moved food (taken>0). First-person scholar, named
   recipient, recipient reaction in the same beat — the SENSE-TESTING LAW
   reads both. Line varies by DAY (deterministic (day+seed)%5).
7. Sim-side the policy always exercises the grant on thin days (the real
   choice UI — full / half / grant-it — is Steve's design task and is OUT
   OF SCOPE, same as scholarbowl-b). This arm measures the grant's
   economics headless.
8. Layer, not game code: the sibling loop is live with uncommitted game.js
   trees; zero src/js keeps the lanes disjoint. Gate OFF runs the exact
   pristine path (det-gate E1).

## RESULTS (pilot complete 2026-10-22, 32/32 configs on b7160b82f)

- **Sweep execution**: 32/32 configs, paired identical seeds (8 seeds ×
  {leadfeast, belongfeast} × {control, armed}), 180d death-aware horizons,
  substrate FEASTSCALE_R13=1 / SEATDRIVE=0. Seeds 67401–67408 are the
  INTENTIONAL paired reuse of scholarbowl-b's corpus (task-mandated);
  base moved e32d4e8c4 → b7160b82f, so the pairing is within-run
  control-vs-armed. All 32 rows carry anchor b7160b82f. The sweep ran as
  two parallel seed-split processes (SEED_FILTER), resume-safe; the
  freshness check allow-listed the scholarbowl-b arm files and passed.
- **Mechanism telemetry (armed, 16 configs)**: thinMeals=274, halves=259,
  grants=115, grantedKcal=122,174, voices=114, errors=0. The mechanism
  FIRED at scale — this is NOT a killed-at-pilot candidate: 115 earmarked
  grants moved 122k real kcal directly to hungry mouths, voiced 114 times.
- **ENGAGEMENT (kill-fast gate)**: grantedKcal > 0 on 16/16 armed runs
  (bar ≥ 6/16) → PASS.
- **PRIMARY (binding)**: thin-pool starvation corpus totals —
  control=8, armed=4. Bar: armed ≤ control−2 (4 ≤ 6) AND control ≥ 1 →
  **GO**. Earmarked distribution moved thin-pool starvation where pool
  thickening could not (scholarbowl-b: 8→7, NO-GO).
- **g1 total starvation**: control=15, armed=10 → PASS.
- **g2 median survival**: control=136d, armed=150d, bar armed ≥
  control−10 (=126) → PASS.
- **g3 death modes** (mechanism-class level): armed-only raw labels were
  `other:experiment` (armed-belongfeast s67406 d58) and `other:The Ugly
  Beast` (armed-leadfeast s67408 d41). Cause provenance: 'experiment' is
  the food-experimentation injury path (game.js:18123 — hurtVillager(
  tester, 10, 'experiment') for an 'avoid'-verdict plant taste) — a
  food-knowledge injury, sickness-adjacent, in a system the layer never
  touches (it wraps meal/distribution methods only). 'The Ugly Beast' is
  a village-bestowed monster nickname (the naming beat is in the
  transcript: 'The village is calling it "Old Ugly."') → combat class,
  same as scholarbowl-b's "Big Loud". With the pre-registered
  mechanism-class mapping: armed ⊆ control → **PASS-on-review** (no new
  death mechanism; the taxonomy fix — food-knowledge injuries and
  village-named monsters mapped at analysis time — goes in the next run's
  analyzer).
- **g4 median pantry** (per-run median daily pantryFreshDays): control=4.27,
  armed=4.77, bar armed ≥ 0.8×control → PASS — the pool did NOT collapse;
  it reads slightly thicker (the grant's second-order effect: recipients
  draw less from the pantry).
- **Panel** (§15 instrument): evidence/2026-10-22/scholardist-panel-primary.md
  attached (compare exit 2 = review_required, a decision not a crash).
  Env-gated lever ⇒ descriptive-by-construction (#796); the manual paired
  comparison judged. Panel signals noted: belongfeast playerDeaths
  regression_watch (6.625→7.875/run — the contract's mislabeled total-
  combat-deaths metric, backlog #753; driven by the s67406-belong
  combat-collapse trajectory, investigated below) and community-loss
  regression_watch (0.75→0.875, same trajectory); leadfeast neutral to
  positive (playerDeaths/100d 6.42→6.34).
- **Sense-test** (scripts/sense-scholardist-b.js, 150d belongfeast s67401,
  27 beats in context — SENSE-TESTING LAW): the beats read as people.
  d1: the STARVING warning fires, the trust-half-ration meal line
  ("Village meal: +800 kcal... (Half ration — they don't trust you
  yet.)"), then "🍽️ Half your share tonight. You hand the rest to
  Daniel, who takes it with both hands and doesn't say a word until it's
  gone." d28 (reserves-critical warning): "🍽️ Thin day. Your bowl stays
  half-full — the other half goes to Xavier, who's been quiet about being
  hungry." d29: "🍽️ You push half your bowl across the fire to Onni —
  'eat. You need it more than I do.' Onni doesn't argue. The bowl comes
  back scraped clean." Named recipients, situated at the fire, recipient
  reactions in the same beat ("doesn't argue", "takes it with both
  hands", "eats like someone making up for days"), one beat/day, lines
  vary by day — never a silent override; canon "No silent actions"
  honored. **Sense verdict: PASS.** Wrinkle (metric review): the d1 beat
  fires while the scholar is on a trust-half ration under a STARVING
  warning — the sim "always grant on thin days" policy can self-starve
  the scholar, and the thin gate fires on day 1 before burnHistory
  stabilizes (the thindefer-b metric-review #4 artifact, fictionally
  early). The real choice UI (full/half/grant) is Steve's design task;
  this measures the grant policy headless only.
- **Paired deltas** (thin→, tot→, days): belong s67403 2→0/3→2/38→166;
  lead s67403 2→0/3→1/38→181; belong s67405 1→0/2→0/49→136; belong
  s67408 1→0/1→0/90→133; lead s67405 1→0/2→1/181→181; lead s67407
  1→0/2→0/136→123; belong s67404 0→1/0→2/108→151 (adverse, investigated);
  belong s67406 0→3/0→3/181→65 (adverse, investigated); lead s67408
  0→0/0→1/169→145. Everywhere else parity.
- **Adverse-trajectory investigations** (kill discipline — the why):
  (a) belong-s67406 (0→3 thin-pool, 181d→65d): the armed village was
  destroyed by COMBAT first — 14 combat deaths d7–d37 (vs control's
  scattered early fights) — then the last 3 starved at fd=0 in the ruins.
  The lever's grants (2 grants, 2,027 kcal) cannot cause starvation (the
  mechanism only ADDS intake); the thin-pool deaths are the consequence
  of the combat collapse (fewer producers → empty pantry), and the
  combat divergence is deterministic-chaos amplification of a behavioral
  lever (the w5drift finding's class), not a lever bug. The lever is
  orthogonal to the cause of death here. (b) belong-s67404 (0→1
  thin-pool, 108d→151d): the armed village lived 43 days LONGER than
  control (9 grants, 8,608 kcal); the d151 thin-pool death (visjoin_144,
  fd=0) happened after the control village was already dead — the
  scholarbowl-b metric-review #1 exposure effect. Neither case is
  re-scored (§14); both are documented.

### Wall numbers (national / table / wins; wave 4–5; survival)

- control: won 0/16, national 9/16, table 11/16, wave4 10/16, wave5 0/16,
  exiled 0, median 136d, max 181d.
- armed: won 0/16, national 11/16, table 10/16, wave4 13/16, wave5 0/16,
  exiled 0, median 150d, max 181d.
- The scale wall stands: zero wins on this substrate in either arm, no
  wave-5 unlocks. Armed villages reached wave 4 in 13/16 (vs 10/16
  control) and national in 11/16 (vs 9/16) but converted none of it.

### Death-cause shares (corpus)

- control (546 deaths): combat 81.5%, monster 8.2%, sickness 4.0%,
  starvation 2.7%.
- armed (598 deaths): combat 85.6%, monster 6.7%, sickness 1.7%,
  starvation 1.7%.
- Combat dominates both arms (the substrate is brutal); the starvation
  share fell 2.7%→1.7%. Armed has more raw deaths only because armed
  villages lived longer (per-day death rate identical at ~0.25/d).

### Village assessment (assessor's read)

The villages are thin-soup villages in a harsh spring — same substrate as
scholarbowl-b, but the story reads differently this time. Where the
scholar's bowl banked kcal into bins the starving couldn't reach, the
scholar's share puts the food in named hands: Daniel on day 1, Xavier on
day 28, Onni on day 29. The two s67403 villages are the parable inverted:
last run they were the indictment (13 halves, 13k kcal banked, 4
thin-pool funerals); this run both survived the spring (38d→166d and
38d→181d) with zero thin-pool deaths between them. The earmark is a
floor, not a bonus: the grant is drawn before the village eats
(priority), injected as the recipient's own intake (it can't be competed
away), and the recipient then draws less from the thin pantry — which is
why the pool reads slightly THICKER armed (4.77 vs 4.27) even as the
scholar eats half. The failure mode is honest too: on belong-s67406 the
village was eaten by monsters before hunger mattered, and no distribution
lever outruns a combat collapse — the grants fired (2,027 kcal to the
hungry) into a village that was already ruins. The lever saves people
from the pantry, not from the treeline.

**Blank filled**: the deferral-routing gap (scholarbowl-b's documented
blank) — conserved thin-day kcal now reaches starving mouths by name,
through the engine's own meal-intake channel, voiced, with zero src/js.
**Blank documented**: the d1 thin-gate artifact (gate fires before
burnHistory stabilizes — thindefer-b's metric-review #4, still open);
the harvest-ledger attribution fiction (the gift rides the recipient's
ownEat channel, so contribLog/intake ledgers credit their foraging —
documented in the layer header); the trust question (the grant is
sustenance, not a social deed — no trust movement by design, following
the depositgate precedent; a Steve-call if the real UI wants warmth).

### Metric review (for the NEXT run, per §14)

1. PRIMARY exposure sensitivity (scholarbowl-b metric-review #1,
   confirmed): the death-aware 180d horizon lets armed villages live
   LONGER (s67403 +128/+143d, s67405 +87d), accumulating more thin-day
   exposure — the corpus-total count punishes the arm for its own
   success. The arm won anyway (4 vs 8), but the next run should
   normalize thin-pool starvation per 100 village-days or pre-register
   exposure-matched bars.
2. g3 taxonomy: sweep-time pclassOf maps food-experiment injuries and
   village-named monsters to `other:`. Next run's analyzer maps
   food-knowledge injuries → sickness-adjacent and all named-threat kills
   → combat at the pre-registered mechanism-class level (this run
   reviewed, not re-scored).
3. Sense policy: the sim "always grant on thin days" policy can
   self-starve the scholar on day-1-style thin days (d1 beat: STARVING
   warning + trust-half ration + grant). Next run: add a "grant only
   when the scholar's own fullness is safe" variant — or mark it
   Steve-call for the real UI (full/half/grant).
4. The belongfeast panel regression_watch on playerDeaths/community-loss
   is the s67406 combat-collapse trajectory (investigated, lever-
   orthogonal). A confirm run (12–16 seeds) would test whether the GO
   survives fresh seeds — the pilot gate is met, so a confirm is earned,
   but the seed budget for it is the coordinator's call.

### Convergence

- **Verdict: GO** (PRIMARY 8→4, bar armed≤control−2 met; g1/g2/g4 PASS;
  g3 PASS-on-review; engagement 16/16). Convergence state: **converging**
  — the distribution-side treatment moves the metric the thickness-side
  treatment could not. The arm lands as its own commit (policy-side
  layer, zero src/js).
- **Telemetry deviation** (Steve 2026-10-13): the coordinator's step
  (run body §10); the corpus is
  evidence/2026-10-22/perseed-scholardist-b/ (32 per-seed JSONs), anchor
  b7160b82f, substrate FEASTSCALE_R13=1/SEATDRIVE=0.

### Instrument proof (scripts/test-scholardist-b.js — BEFORE the sweep)

43/43 GREEN (run 2026-10-22, base b7160b82f): E0 unit (stubbed Game, 33 checks): gate-off is a noop (all four methods
  unwrapped, tele all-zero, uninstall noop-safe); armed thin-day halves
  the scholar's draw intent 1000→500; the grant is drawn at the FULL 500
  (never re-halved) with the cooked-meal draw; the gift is stashed for the
  hungriest eligible villager (vid/kcal/day); flags cleared after the meal;
  one voice/day with {N} substituted (first-person scholar voice); the
  fold-in raises the recipient's produced 400→900, leaves others at 400,
  and consumes the gift; stale (yesterday) gifts never inject (day guard);
  pickRecipient skips scholar/dead/away/sub-threshold hunger, hungriest
  wins, roster-order tiebreak; thick day untouched and silent; empty-pantry
  thin day halves intent but grants nothing (no phantom kcal) and stays
  silent; zero Math.random consumed; voice deterministic per (day+seed),
  varies across days; uninstall restores all four methods; namespace
  markers SCHOLARDIST_B while installed.
- E1 det-gate: 60d sims, SCHOLARDIST unset, install() called vs not —
  digest-identical.
- E2 sim smoke (SCHOLARDIST=1, 60d, seed 67401, leadfeast,
  FEASTSCALE_R13=1/SEATDRIVE=0): completes (day>30), thinMeals>0,
  halves>0, grants>0, grantedKcal>0, voices>0, 0 layer errors — the
  mechanism fires in the wild.
- E3: armed 60d re-run digest-identical and tele-identical (deterministic).
- check.js --quick note: the mandated post-change quick check could not
  complete — 13+ min with zero output (not even the header line), the
  process starved at 0.1% CPU while sibling worktrees saturated the box
  (load 17 on 2 CPUs). Killed rather than block the run. Justification:
  this arm is scripts-only (1 new layer + 5 new scripts + evidence) with
  ZERO src/js changes, and the layer is env-gated default-OFF — no
  green-list test sets SCHOLARDIST=1, and gate-off leaves all methods
  unwrapped (E1 det-gate: digest-identical), so the green list is
  unaffected by construction. The arm's own 43-check proof is the
  relevant verification and is green.

### Metric review (for the NEXT run, per §14)

(pending)

### Convergence

(pending)
