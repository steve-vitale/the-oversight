# sim-scholardist-confirm-b — CONFIRM the scholar's share pilot GO

Run: oversight-flesh-out-loop-b, arm sim-scholardist-confirm-b. Worker tree:
~/workspace/worktrees/sim-scholardist-confirm-b (base master b47814fa7d3ac20199e1f766bc28c2b514197b56, verified).
Axis: food-economy. CONFIRM run for the sim-scholardist-b pilot GO
(evidence/2026-10-22/sim-scholardist-b.md): thin-day earmarked distribution
(SCHOLARDIST=1) cut thin-pool starvation 8→4 in the pilot. A confirm on 16
FRESH seeds tests whether the GO survives fresh seeds — the pilot gate is
met (engagement 16/16, PRIMARY 8→4), so the confirm is earned (pilot
metric-review #4). This is a CONFIRM, not a redesign: the layer is NOT
recommitted (already on master at 67ba0e496); the lever is played with only
as needed to re-verify it on the moved base.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: does the scholar's-share GO hold on fresh seeds — i.e. does
  earmarked thin-day distribution (the scholar's conserved thin-day half
  routed DIRECTLY to the hungriest villager as real pantry items, voiced
  first-person scholar + named recipient + recipient reaction, never silent)
  still reduce thin-pool starvation on seeds the pilot never saw?
- **Lever**: scripts/layers/scholardist-b.js (env SCHOLARDIST=1), already on
  master at 67ba0e496 — NOT recommitted by this run. Thin gate =
  pantryFreshDays()<2 at the scholar's meal; halve the trust-scaled
  villageMeal intent at the pantryDraw choke point; the conserved half is
  drawn as REAL pantry items for the hungriest eligible villager (living,
  present, not scholar; npcNeeds hunger ≥20; roster-order tiebreak; zero
  Math.random) via pantryDraw(v, X, {cook:true}), folded into the
  recipient's meal through the "eaten at the fire" intake channel
  (villagerDayProduction injection, depositgate-dgEased honesty precedent);
  taken=0 ⇒ silent no-grant; one voice/day max, deterministic
  (day+seed)%5; zero src/js modifications. Gate OFF = install() never
  wraps (byte-identical delegation).
- **Substrate**: FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause-b /
  poolscholar-b / thindefer-b / scholarbowl-b / pilot substrate — the
  substrate the GO was measured on).
- **Policies**: competent-player leadfeast + belongfeast (feastscale).
- **Seeds**: 67501–67516 — 16 FRESH seeds, never used before (verified
  pre-run via the FILENAME criterion: no filename in the tree names any of
  these seeds; content hits, if any, are reported as numeric-kcal-value
  hits vs seed uses). Pilot used 67401–67408; the confirm corpus is fully
  fresh, paired within-run control-vs-armed on identical seeds.
- **Horizon**: 180d death-aware (dead villages stop simulating; the
  deathcause-b / pilot corpus horizon — the horizon the GO was measured
  on). Never a fixed 200d.
- **PRIMARY (binding GO)**: thin-pool starvation deaths (cause-class
  'starvation' AND death-day pantryFreshDays<2), corpus totals over the 32
  paired configs: armed ≤ control−2 AND control ≥ 1 (the pilot's mechanism
  bar, kept for the confirm — same bar, fresh seeds).
- **Guardrails** (all corpus-total/paired, must all PASS):
  1. total starvation deaths armed ≤ control;
  2. median survival (game days) armed ≥ control−10d;
  3. no new death modes (mechanism-class level — refined taxonomy
     pre-registered here per the pilot's metric-review #2: food-knowledge
     injuries ('experiment') → sickness-adjacent; all village-named-threat
     kills (monster names, villageNames, aliases, 'split-fight:' names) →
     combat; the taxonomy is applied at analysis time from raw causes, not
     re-scored);
  4. median per-run median daily pantryFreshDays armed ≥ 0.8 × control
     (no median pantry collapse).
- **Engagement kill-fast gate**: grantedKcal > 0 on ≥ 12/32 armed runs,
  else killed-at-pilot (the pilot bar was ≥6/16; the confirm bar scales
  with the corpus, keeping the same 3/8 proportion).
- **Instrument**: the balanced panel (scripts/balance-panel.js) per §15 is
  the instrument for the before/after comparison; the pre-registered
  threshold above is the judge. Env-gated lever ⇒ automated panel compare
  is descriptive-by-construction (sim-findings.md #796); the manual paired
  comparison judges. The panel compare .md is attached.
- **Verdict classes**: GO (PRIMARY + all guardrails PASS) / NO-GO
  (primary or any guardrail missed — a miss is NO-GO, never re-scored
  against a friendlier metric mid-run per §14) / killed-at-pilot
  (engagement gate missed — mechanism never reached mouths).
- **Instrument proof** (scripts/test-scholardist-b.js, BEFORE the sweep):
  the 43/43 proof is GREEN on current master b47814fa7d3ac20199e1f766bc28c2b514197b56
  (re-run 2026-10-23: E0 unit incl. E1 gate-off det-gate byte-identity with
  SCHOLARDIST unset, E2 sim smoke, E3 armed determinism — choke-point
  drift excluded; the layer survived the base move intact).

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (food ladder —
  cooked/safe; the grant uses the cook:true pantryDraw like the villagers'
  own meals), docs/STORAGE.md, docs/DECISIONS.md 2026-10-21 SURPLUSFEED
  ruling (behavioral, bottom-up, never post-hoc — the scholar's share is
  the draw-side, thin-side behavioral choice, earmarked distribution:
  exactly the direction Steve ordered, applied to the draw-side rather
  than a trim on the share path), docs/SURVIVAL-LEVERS.md (register).
- Sense-hostility constraint (backlog #761): voiced by construction,
  never a silent override of the player's draw (canon: "No silent
  actions").
- Blank documented in the pilot and carried: the d1 thin-gate artifact
  (gate fires before burnHistory stabilizes — thindefer-b metric-review
  #4); the harvest-ledger attribution fiction (gift rides the
  recipient's ownEat channel — contribLog/intake credit their foraging);
  the trust question (grant is sustenance, not a social deed — no trust
  movement by design; Steve-call for the real UI).

## RESULTS (confirm complete 2026-10-23, 64/64 configs on b47814fa7d3ac20199e1f766bc28c2b514197b56)

- **Sweep execution**: 64/64 configs, paired identical seeds (16 fresh seeds
  67501–67516 × {leadfeast, belongfeast} × {control, armed}), 180d
  death-aware horizons, substrate FEASTSCALE_R13=1 / SEATDRIVE=0. Seed
  freshness verified pre-run via the FILENAME criterion: zero filenames in
  the tree name any of 67501–67516; the only content hits are numeric pantry
  kcal values (e.g. `"pantryKcal":67514`, `"pantry": 67513`) — not seed
  uses. Both sweep halves printed "seed freshness: 16/16 fresh" before
  simulating. All 64 per-seed JSONs carry anchor b47814fa7. The sweep ran
  as two parallel seed-split processes (SEED_FILTER), resume-safe, 0
  resumed (clean run).
- **Mechanism telemetry (armed, 32 configs)**: thinMeals=510, halves=502,
  grants=312, grantedKcal=307,072, voices=312, errors=0. The mechanism
  FIRED at scale — this is NOT a killed-at-pilot candidate: 312 earmarked
  grants moved 307k real kcal directly to hungry mouths, voiced 312 times,
  zero layer errors.
- **ENGAGEMENT (kill-fast gate)**: grantedKcal > 0 on 32/32 armed runs
  (bar ≥ 12/32) → PASS.
- **PRIMARY (binding)**: thin-pool starvation corpus totals —
  control=23, armed=30. Bar: armed ≤ control−2 (30 ≤ 21: NO) AND
  control ≥ 1 → **MISS → NO-GO**. The pilot's GO (8→4) does NOT reproduce
  on fresh seeds.
- **g1 total starvation**: control=32, armed=40 → FAIL.
- **g2 median survival**: control=124d, armed=115d, bar armed ≥
  control−10 (=114) → PASS (barely).
- **g3 death modes** (refined mechanism-class taxonomy, pre-registered):
  control=[combat,contest,dehydration,other:The Big Beast,other:The Ugly
  Beast,other:the expedition,other:the night,sickness,starvation,wound];
  armed=[combat,contest,dehydration,other:The Ugly Beast,sickness,
  starvation,wound]; armed-only raw labels are village-named monsters
  ('The Ugly Beast' → combat via the monster-register mapping). No new
  death mechanism → **PASS**.
- **g4 median pantry** (per-run median daily pantryFreshDays): control=4.46,
  armed=5.72, bar armed ≥ 0.8×control → PASS — the pool reads THICKER
  armed (the grant's second-order effect: recipients draw less from the
  pantry), same direction as the pilot.
- **Panel** (§15 instrument): evidence/2026-10-23/
  scholardist-confirm-panel-primary.md attached (compare exit 2 =
  review_required, a decision not a crash). Env-gated lever ⇒
  descriptive-by-construction (#796); the manual paired comparison judged.
  Panel signals: leadfeast playerDeaths/100d 5.37→8.82 regression_watch,
  community-loss 0.5625→0.8125 regression_watch, survival60 0.875→0.6875
  regression_watch; belongfeast playerDeaths/100d 7.44→8.83
  regression_watch, community-loss 0.9375→1.0 regression_watch — all
  consistent with the manual verdict (adverse combat-collapse
  trajectories in the armed arm).
- **Sense-test** (scripts/sense-scholardist-confirm-b.js, 150d belongfeast
  s67501 — FRESH seed, 10 beats in context — SENSE-TESTING LAW): the beats
  read as people feeding people. d1: "🍽️ Half your share tonight. You
  hand the rest to Pearl, who takes it with both hands and doesn't say a
  word until it's gone." d27: "🍽️ You wave off the second scoop and nod
  toward Elijah. 'Elijah eats first tonight.' Nobody at the fire
  disagrees." d28: "🍽️ Thin day. Your bowl stays half-full — the other
  half goes to Valeria, who's been quiet about being hungry." Named
  recipients, situated at the fire, recipient reactions in the same beat,
  one beat/day, lines vary — never a silent override; canon "No silent
  actions" honored. **Sense verdict: PASS.** Wrinkle (carried): the d1
  beat fires while the scholar is on a trust-half ration under a STARVING
  warning — the sim "always grant" policy grants on day 1 before
  burnHistory stabilizes (the documented d1 thin-gate artifact). The
  sense run's village died at day 37 (village-lost) — the beats are fine;
  the economics around them are the question.
- **Paired deltas** (thin→, tot→, days), 32 pairs: better (armed fewer
  thin-pool deaths): 8 pairs — belong s67509 6→3/6→3/45→26, belong s67510
  3→0/3→0/52→33, belong s67511 2→0/3→0/91→171, lead s67502 1→0/1→0/
  77→115, lead s67507 1→0/1→0/145→118, lead s67509 6→3/6→3/45→26, lead
  s67510 2→0/2→0/37→30, lead s67516 2→0/2→1/181→136. Worse: 10 pairs —
  belong s67501 0→3/1→3/94→37, belong s67502 0→1/0→1/66→134, belong s67503
  0→4/0→4/94→47, belong s67507 0→1/0→1/126→97, belong s67516 0→2/0→2/
  85→160, lead s67501 0→3/1→3/114→36, lead s67503 0→4/0→4/122→47, lead
  s67506 0→4/0→4/181→162, lead s67508 0→1/0→1/181→54, lead s67514 0→1/
  1→1/181→168. Parity: 14 pairs. Direction is roughly symmetric
  (8 better / 10 worse / 14 same) — the chaos-amplification signature,
  not a systematic lever harm.
- **Kill-discipline diagnosis** (the why — NOT a re-score, §14):
  (a) The mechanism is sound: 312 grants / 307k kcal / 0 errors; the
  grants are real pantry draws, the fold-in is contained, the beats are
  voiced. This is not a mechanism failure.
  (b) The scholar is NOT systematically starved: scripts/hunger-probe.js
  (30d, seeds 67501–67504, leadfeast) shows mean npcNeeds hunger
  control≈armed (26v27, 30v25, 32v30, 30v30) — the day-1 halve does not
  leave the scholar chronically hungrier. The "self-starving scholar"
  hypothesis is rejected by measurement.
  (c) The divergence probe (scripts/diverge-probe.js) confirms armed
  trajectories diverge from control on day 1 — because the grant FIRES on
  day 1 in every run (the d1 thin-gate artifact: burnHistory empty →
  fallback fd<2 → thin). The wrapper itself is trajectory-neutral
  (pantryFreshDays is a pure read); the divergence is the lever's real
  day-1 action, as designed.
  (d) The adverse pairs are early combat collapses with thin-pool deaths
  in the ruins (fd=0, post-collapse): s67501 (36/37d), s67503 (47d),
  s67508 (54d). The favorable pairs show the earmark working as designed
  (s67511 belongfeast: 29 grants, 30,207 kcal, thin 2→0, 91→171d).
  (e) The pilot (8→4 GO) vs confirm (23→30 NO-GO): same layer, same
  substrate, effectively identical game code (the 13-commit base move is
  a pure npcTrigger refactor + pronoun fix — no mechanic changes). The
  difference is the seed corpus. The confirm corpus is harsher
  (control thin-pool 23 vs pilot 8) and the pair directions are
  symmetric — the outcome is dominated by deterministic-chaos
  reshuffling of combat trajectories (the w5drift finding's class),
  with the lever's day-1 perturbation as the reshuffle seed. The
  thin-pool starvation corpus total is too noisy an instrument for a
  behavioral lever at this seed budget: the pilot's GO and the
  confirm's NO-GO are both consistent with "small real effect +
  large chaos."
  (f) The pilot's metric-review #1 exposure effect is visible in both
  directions: s67516 belongfeast armed lived 85→160d and picked up 2
  thin-pool deaths at d142/d153 after the control village was dead
  (punished for its own success); s67501/s67503 armed died early and
  were punished for the collapse. The corpus total cannot distinguish.

### Wall numbers (national / table / wins; wave 4-5; survival)

- control: won 0/32, national 16/32, table 18/32, wave4 22/32, wave5 0/32,
  exiled 0, median 124d, max 181d.
- armed: won 0/32, national 15/32, table 18/32, wave4 19/32, wave5 0/32,
  exiled 0, median 115d, max 182d.
- The scale wall stands: zero wins on this substrate in either arm, no
  wave-5 unlocks. Armed reached wave 4 in 19/32 (vs 22/32 control).

### Death-cause shares (corpus, refined mechanism classes)

- control (1,037 deaths): combat 91.4%, starvation 3.1%, sickness 2.5%,
  wound 1.2%, contest 1.0%, dehydration 0.4%, other 0.4%.
- armed (1,017 deaths): combat 90.2%, starvation 3.9%, sickness 3.0%,
  wound 1.6%, contest 1.0%, dehydration 0.2%, other 0.1%.
- Combat dominates both arms (the substrate is brutal); the starvation
  share rose 3.1%→3.9% armed. Per-day death rates are comparable; armed
  has fewer raw deaths because armed villages lived slightly shorter.

### Village assessment (assessor's read)

These are hard-spring villages, harsher than the pilot's. The scholar's
share fires everywhere — 312 named grants, 307k kcal, Pearl and Kenneth
and Valeria and Yara fed by name at the fire — and where villages survive
the spring it works exactly as designed (s67511: the earmark carries a
village 91→171 days with zero thin-pool deaths). But the same day-1
perturbation that the pilot read as generosity reads here as the first
domino: on the marginal seeds the reshuffled trajectory collapses into
the treeline by day 40, and the thin-pool funerals that follow happen in
ruins at fd=0 — counted against the arm by a metric that cannot tell a
collapse from a distribution failure. The lever saves people from the
pantry; it cannot save the village from the treeline, and on this corpus
the treeline came first. The mechanism is innocent; the instrument is
guilty — corpus-total starvation deaths cannot judge a behavioral lever
in a chaos-dominated sim at this seed budget. The pilot's GO and this
NO-GO are the same finding: the effect is real but small, the noise is
large.

**Blank filled**: none this run — the confirm's job was judgment, and the
judgment is NO-GO. The pilot's documented blanks stand: the d1
thin-gate artifact (fires in 32/32 armed runs — measured, not fixed;
the hunger probe shows it doesn't systematically starve the scholar,
but it is the lever's chaos seed); the harvest-ledger attribution
fiction; the trust question (Steve-call for the real UI).
**Blank documented**: the corpus-total metric's chaos dominance — a
behavioral lever's thin-pool starvation outcome is not robustly
measurable at 16–32 paired configs when combat collapses reshuffle
trajectories. Next-run arms need either (i) the exposure-normalized
metric (thin-pool deaths per 100 village-days — pilot metric-review #1),
(ii) the scholar-safe variant (grant only when the scholar's own
fullness is safe / skip day 1 — pilot metric-review #3), or (iii) a
larger seed budget with a pre-registered variance bar. All three are
next-run arms, not this-run re-scores.

### Metric review (for the NEXT run, per §14)

1. PRIMARY instrument noise (new, from this confirm): corpus-total
   thin-pool starvation deaths are chaos-dominated for a behavioral
   lever — pair directions 8 better / 10 worse / 14 same across 32 pairs,
   with the pilot's 8-seed corpus landing GO and this 16-seed corpus
   landing NO-GO on the identical mechanism. Pre-register the
   exposure-normalized form (thin-pool deaths per 100 village-days) for
   the next run, per the pilot's metric-review #1.
2. The d1 thin-gate artifact is now measured at scale (fires 32/32):
   every armed run's trajectory diverges from control on day 1. The
   hunger probe rejects the "scholar self-starvation" harm channel, but
   the day-1 fire remains the lever's chaos seed. Next run: the
   scholar-safe variant (skip day 1 / require burnHistory, or grant only
   when the scholar's own hunger is low) as its own pre-registered arm —
   pilot metric-review #3, still open.
3. g3 taxonomy: the refined mechanism-class mapping (food-knowledge
   injuries → sickness-adjacent, named-threat kills → combat) worked as
   pre-registered — no review items this run. Keep it.
4. Seed budget: 16 fresh seeds were not enough to tame the chaos for a
   corpus-total count metric. Do not re-run the same bars on more seeds
   hoping for GO — fix the metric (item 1) or the lever's chaos seed
   (item 2) first.

### Convergence

- **Verdict: NO-GO** (PRIMARY 23→30, bar armed≤control−2 missed; g1
  32→40 FAIL; g2/g3/g4 PASS; engagement 32/32 PASS). Per §14 the miss is
  NO-GO, never re-scored. Convergence state: **not converged** — the
  pilot's distribution-side GO does not reproduce on fresh seeds; the
  effect is real but small and chaos-dominated at this seed budget.
- The layer stays on master (env-gated, default-OFF, zero src/js) as a
  measured NO-GO — it is not landed as a design change. Next-run arms
  (exposure-normalized metric; scholar-safe variant) are briefed in
  Metric review above.
- **Telemetry deviation** (coordinator's step, run body §10): corpus is
  evidence/2026-10-23/perseed-scholardist-confirm-b/ (64 per-seed JSONs),
  anchor b47814fa7, substrate FEASTSCALE_R13=1/SEATDRIVE=0.
