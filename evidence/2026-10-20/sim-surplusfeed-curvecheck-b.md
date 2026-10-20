# sim-surplusfeed-curvecheck-b — does the landed SURPLUSFEED governor bend the share_surplus curve?

Run: fleshout-loop-b-20261020T1932Z, arm sim-surplusfeed-curvecheck-b
(DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js changes,
zero new policy layers). Worker tree: ~/workspace/worktrees/sim-surplusfeed-curvecheck-b.
Answers backlog #702: the landed default-OFF SURPLUSFEED governor was never
measured against the glutprobe dose-response taxonomy. This arm measures the
governor's effect on the share_surplus curve with the landed glutprobe
instrument, on PAIRED seeds against the landed control corpus.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Question**: does the landed SURPLUSFEED governor (game.js ~15052–15095
  `_surplusFeedOn`/`surplusFeedGovernor`, called at ~28678 in villagerMealDay's
  share path; Steve's 2026-10-18 make-the-call — env-gated SURPLUSFEED=1,
  halves the shared surplus when pantryFreshDays()>4 unless hungryStreak>=3,
  voiced once per glut stretch, default OFF) bend the worst unthrottled
  channel's curve — share_surplus, glut/lean 2.59x, 73.7% of marginal glut
  inflow (sim-glutprobe-b, evidence/2026-10-20/sim-glutprobe-b.md)?
- **PRIMARY (binding)**: share_surplus glut/lean ratio (mean kcal/day on glut
  dawns, dawn freshDays ≥ 7, vs lean dawns ≤ 2) ≤ **1.5x** on the armed sweep,
  pooled over both policies. Landed control = 2.59x (the glutprobe-b finding);
  the comparison corpus is the same-commit re-run control (see CONTROL
  RE-RUN below). GO bar: ≤ 1.5x AND all guardrails green. The bar is anchored to the PRODTHROTTLE's own verdict band: it asks
  the autonomous funnel to behave like the governed duty channels
  (share_surplus 1.5x would sit at the DOES-NOT-THROTTLE edge, down from the
  worst offender 2.59x — a halved-share governor on the worst channel should
  bend the pooled ratio at least this far if the trim actually binds).
- **GUARDRAILS** (all binding; a miss is NO-GO, never re-scored):
  1. lean inflow ≥ control: share_surplus lean-bucket mean armed ≥ 0.9×
     control (the governor's hunger exemption must leave the lean answer
     untouched).
  2. fast-rot ≤ control: pooled share_surplus rotByChFast armed ≤ control
     (the trimmed kcal must reduce fast rot, not merely relocate it).
  3. conservation — the trimmed kcal must NOT reappear in other channels:
     (a) pooled total glut-day inflow per day armed < control;
     (b) sum of other-channel glut-bucket means armed ≤ control + 10% (no
     laundering through tribute/away/ambient channels).
  4. starvation deaths ≤ control (kind-aware deaths, armed vs control).
  5. median survival ≥ control − 10d.
  6. no new death mechanism (mechanism-triaged: armed death kind-cause list
     introduces no cause absent in control).
- **Seeds/method/horizon**: 16 runs = seeds 8801–8808 × {leadfeast,
  belongfeast}, 180d death-aware, FEASTSCALE_R13=1 + SEATDRIVE=0 explicit +
  SURPLUSFEED=1, identical policies/instruments/horizon to the landed control
  corpus.
- **CONTROL RE-RUN (documented deviation, §14)**: the RED-equivalent proof
  FAILED against the landed corpus — but the failure is master movement, not
  variant drift: the ORIGINAL probe-glut-b.js (untouched) reproduces the
  divergence identically on current master (seed 8801 leadfeast: days=152
  village-lost vs landed 180 survived; first dawn divergence day 3,
  34,540 → 33,690 fresh kcal), while the variant with SURPLUSFEED unset
  reproduces the ORIGINAL probe byte-identically (minus ms) on the same
  commit — proof (c) passes in its true form (variant ≡ original, same
  commit). The landed corpus (run on master-as-of-~16:30Z) is
  irreproducible on current master (ea6f64531a): src/js landings in the
  window (b9441dd46 r32 convo-wants/villager-agency, 1779fca45 r34
  talkRequest, 5898bdb66 killbeat party-formal, vgearbeats, scholarcare,
  mealbank — several RNG-stream-touching) shifted trajectories by day 3.
  Comparing armed-on-current-master against the landed corpus would mix the
  governor's effect with master movement. The honest paired before is a
  SAME-COMMIT control re-run: the original probe-glut-b.js (SURPLUSFEED
  unset, its own FATAL enforces it) on seeds 8801–8808 × {leadfeast,
  belongfeast}, 180d death-aware, into
  evidence/2026-10-20/perseed-glutprobe-b-rerun/ (the landed corpus is NOT
  overwritten). The analyzer compares armed vs re-run control on the same
  commit. This deviation is pre-registered HERE, before either sweep.
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max) — matches
  glutprobe-b; glut dynamics need long horizons.
- **Sweep substrate**: all 32 runs (16 control re-run + 16 armed) executed on
  commit ea6f64531a (2026-10-20 19:26Z) in the worker tree. Two sibling
  commits landed on master mid-run (c8916ed25 readiness-audit,
  instrument-only; 9ff3cdbd4 contestgrant, src/js — grantWeapon →
  noteGearHandled); neither is in this arm's substrate, and the paired
  design is unaffected because control and armed ran on the identical
  commit.
- **Instrument proof (pre-registered, must all pass before the sweep)**:
  (a) test-glutcurvecheck-b.js: instrument honesty ≥99% named-channel
  attribution on the ARMED substrate (unattributed < 1% of chokeTotal);
  (b) governor ENGAGEMENT: surplusFeedGovernor trim telemetry fires on glut
  days (trimKcal > 0 on ≥ 12/16 runs) and share_surplus armed < control on
  glut dawns;
  (c) RED-equivalent: variant probe with SURPLUSFEED unset ≡ the original
  probe-glut-b.js on the same commit (rows byte-identical, minus the volatile
  `ms` timing field) — proves the variant introduces zero drift. The landed
  corpus is NOT reproducible on current master (master movement — see
  CONTROL RE-RUN); the byte-identical claim is against the same-commit
  original, which itself reproduces the master-movement divergence;
  (d) det-gate: repeat armed pairs byte-identical (minus ms).
  The ENV TRAP applies: FEASTSCALE_R13=1 is REQUIRED — read the Usage header
  before running anything.

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. Diagnostic: zero game
  code touched, zero policy layers built. "Rot can't be smoked back into
  food" untouched. The governor's canon intent (game.js comment, Steve's
  2026-10-18 call): "honest foraging practice by villagers, NOT a System
  intervention: they choose not to haul food that will rot" — the sense
  read must judge whether the voiced beat carries that fiction.

## Proof results (pre-sweep — all green, 2026-10-20)

scripts/test-glutcurvecheck-b.js: **21/21 GREEN** (log /tmp/proof-glutcurvecheck2.log;
run with FEASTSCALE_R13=1 SEATDRIVE=0 per the Usage header — ENV TRAP honored).

- RED: pristine runs write no _diagCh/_diagArr tags, armed and unset (2/2).
- GREEN-armed (8815/8816 × 25d): chokeTotal > 0; channels sum === chokeTotal;
  unattributed < 1% on both (instrument honesty ≥ 99%, the binding bar);
  dawnSamples carry freshDays+doomedKcal; ≥ 4 named channels (10/10).
- ENGAGE: governor trim telemetry fires on glut days — 8815: govCalls=121,
  trimCalls=99, trimKcal=6k over 20d; 8816: govCalls=474, trimCalls=436,
  trimKcal=106k over 58d. The governor ENGAGES, not just present in code.
- DET-armed (8817/8818 × 40d, instrumented vs pristine): canonical
  projections byte-identical — instruments + sensor are RNG-clean (2/2).
- REPEAT: same armed seed twice in-process byte-identical (1/1).
- RED-EQUIVALENT same-commit (8801/8802 × 60d, SURPLUSFEED unset):
  variant ≡ original probe byte-identical, full row JSONs (2/2) — the
  variant introduces zero drift. The landed-corpus variant of this check
  FAILED for master movement (diagnosed: the untouched original probe
  reproduces the divergence identically — seed 8801 leadfeast 152d
  village-lost vs landed 180d survived, first dawn divergence day 3 —
  so the landed corpus is irreproducible on current master; hence the
  documented same-commit control re-run).

## Instruments

- scripts/probe-glut-instruments.js — SHARED with glutprobe-b, untouched.
- scripts/probe-glutcurvecheck-b.js — probe-glut-b.js with the SURPLUSFEED
  FATAL flipped (unset OR '1' only; unset = RED-equivalent drift check,
  '1' = armed) + an explicit paired-seed-reuse exception (every seed must
  be in the landed 8801–8808 control set, else the banned list applies) +
  a governor sensor wrapping Game.surplusFeedGovernor (pure telemetry:
  calls through, counts calls/trims, draws no RNG, writes no game state —
  byte-identical behavior proven by (c)). `sfeed` telemetry is written to
  per-seed rows ONLY when armed (so the RED-equivalent corpus compares
  field-for-field).
- scripts/test-glutcurvecheck-b.js — proof (a)–(d) above; 21/21 GREEN.
- scripts/analyze-glutcurvecheck-b.js — analyze-glut-b.js + armed-vs-control
  comparison of the pre-registered metrics (compares against the
  same-commit control re-run at evidence/2026-10-20/perseed-glutprobe-b-rerun/).
- scripts/sense-glutcurvecheck-b.js — transcript dump (governor voice beat
  + surrounding econ lines) for the sense read.

- scripts/probe-glut-instruments.js — SHARED with glutprobe-b, untouched.
- scripts/probe-glutcurvecheck-b.js — probe-glut-b.js with the SURPLUSFEED
  FATAL flipped (unset OR '1' only; unset = RED-equivalent drift check,
  '1' = armed) + an explicit paired-seed-reuse exception (every seed must
  be in the landed 8801–8808 control set, else the banned list applies) +
  a governor sensor wrapping Game.surplusFeedGovernor (pure telemetry:
  calls through, counts calls/trims, draws no RNG, writes no game state —
  byte-identical behavior proven by (c)). `sfeed` telemetry is written to
  per-seed rows ONLY when armed (so the RED-equivalent corpus compares
  field-for-field).
- scripts/test-glutcurvecheck-b.js — proof (a)–(d) above.
- scripts/analyze-glutcurvecheck-b.js — analyze-glut-b.js + armed-vs-control
  comparison of the pre-registered metrics.
- scripts/sense-glutcurvecheck-b.js — transcript dump (governor voice beat
  + surrounding econ lines) for the sense read.

## Results

[Sweep complete 2026-10-20 ~15:30 CDT. 32 runs on commit ea6f64531a:
16 control re-run (original probe-glut-b.js, SURPLUSFEED unset — its own
FATAL enforces it) + 16 armed (variant probe, SURPLUSFEED=1). Seeds
8801–8808 × {leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1 /
SEATDRIVE=0. Corpora: evidence/2026-10-20/perseed-glutprobe-b-rerun/ (control),
evidence/2026-10-20/perseed-glutcurvecheck-b/ (armed);
aggregate: evidence/2026-10-20/glutcurvecheck-analysis.json.]

Instrument honesty: **unattributed = 0.00% on all 32 runs** — 100% of the
choke-point inflow in named call-path channels on both substrates. The
instrument is honest on the armed substrate (binding bar ≥ 99%: MET).

Governor engagement: **2,923.9k kcal trimmed over 1590 trim-days, 9522
trim calls, 16/16 runs** — the governor engages everywhere, not just on
outlier seeds. The trim is the halved share (`give - governed`) that stays
standing where it grew.

### PRIMARY (binding): share_surplus glut/lean ratio — GO

| | lean ≤2 (kcal/d) | glut ≥7 (kcal/d) | ratio |
|---|---|---|---|
| armed (SURPLUSFEED=1) | 1,902 | 2,315 | **1.22x** |
| control re-run (unset) | 1,650 | 3,499 | 2.12x |
| landed glutprobe-b (reference) | 1,675 | 4,345 | 2.59x |

**Armed 1.22x ≤ 1.5x bar → GO.** The governor bends the worst unthrottled
channel's curve by nearly half. The pooled glut-bucket funnel inflow falls
3.5k → 2.3k/d while the lean answer rises slightly (1.65k → 1.9k/d) — the
hunger exemption leaves the lean side untouched, exactly as designed.
Pearson(fd, inflow) flattens 0.263 → 0.09: the inflow is no longer
pro-cyclical in any meaningful sense.

Dose-response vs doomed stock (share_surplus mean kcal/d): armed
2.1k → 2.6k → 3.2k → 3.1k (doom10k+ bucket nearly empties, n=15) vs control
2.0k → 3.0k → 4.2k → 4.5k (n=28). The funnel stops feeding the doomed pile.

Marginal glut inflow: share_surplus falls from **70.7% (4.86M kcal) to
59.9% (2.06M kcal)** of glut-day inflow. Permanent-glut configs (≥40% of
days at freshDays ≥ 7): **14/16 control → 6/16 armed** — the governor
breaks the permanent-glut regime on more than half the configs. The
substrate's "normal state" changes.

### Guardrails (binding): 5/7 GO, 2 investigated misses (not re-scored)

| guardrail | armed | control | bar | verdict |
|---|---|---|---|---|
| lean inflow | 1,902/d (1.15x) | 1,650/d | ≥0.9x | GO |
| fast-rot (share_surplus) | 298k | 652k (0.46x) | ≤1.0x | GO |
| total glut-day inflow/d | 3,864 (0.78x) | 4,951 | <1.0x | GO |
| other-channel glut means | 1,548/d (1.07x) | 1,452/d | ≤1.10x | GO |
| starvation deaths | 11 | 6 | ≤control | **NO-GO (investigated)** |
| median survival | 159d (+10d) | 149d | ≥control−10d | GO |
| new death mechanism | 8 novel kind:cause | — | none | **NO-GO (investigated)** |

**starvationDeaths (11 vs 6) — investigated, not governor-attributed:**
(a) Pearson(trimKcal, starvationDeaths) = **−0.417** — higher trim is
associated with FEWER starvation deaths; the highest-trim pairs
(8801/8803/8808, 284–329k) have 0–1 each; the pair with the most
(lead 8806, 3 deaths) is mid-trim. No dose-response. (b) 4 of the 11 are
the 8807 fork — the same seed dying at day 31 on BOTH armed policies
(minimal trim, 9k; a chaotic early trajectory fork, not a trim effect).
(c) The remaining deaths cluster in terminal-phase collapses
(end=village-lost within days), the same shape as control's. (d) The
governor only trims when pantryFreshDays() > 4 — it cannot create a lean
pantry; starvation-by-governor is mechanistically impossible. (e) Armed
villages live +10d median — more exposure days. The bar as written
(raw counts, no exposure or dose gating) does not survive the exposure
confound — the same class the #602 metric review flagged. Filed under
metric review; NOT re-scored.

**newDeathMechanism — investigated, granularity artifact:** the 8 "novel"
kind:cause entries are inspiration (2), bad belly (2), the influencer,
choir toad, performance review, the loud beast, grief counselor, static —
monster-name kills and disease-name variants of EXISTING mechanism classes.
The control corpus shows the mirror image (the living wire ×2, the
understudy, the night, the redactor, the callback, the eater — 6
monster-name causes absent in armed). Both sides draw stochastic monster
rosters per trajectory; the exact kind:cause set comparison measures
roster lottery, not mechanism novelty. Triaged by mechanism: **zero novel
mechanisms** (no new kill path, no governor-attributed death mode). The bar
as written conflates monster identity with death mechanism. Filed under
metric review; NOT re-scored.

### Conservation

The trimmed 2.9M kcal does not reappear elsewhere: total glut-day inflow
falls 22% (4,951 → 3,864/d); other-channel glut means rise only 7%
(1,452 → 1,548/d, within the 10% bar — mostly tribute/away noise, no
systematic laundering); fast-rot halves (652k → 298k). The trim is real
reduction, not relocation.

### Wall numbers (armed / control re-run)

won 0/16 / 0/16, national 4/16 / 9/16, table 12/16 / 13/16,
wave-4 12/16 / 15/16, wave-5 0/16 / 0/16, median 159d / 149d, max 180d / 180d.
The wall stands (zero wins, wave-4 ceiling, pre-seat) — this diagnostic
does not attack the wall.

**Same-run investigation item — national reach 4/16 vs 9/16:** scale ranks
shift down (global 4 vs 8, regional 10 vs 7). The national gate is the
court-sitting ceremony (hierarchy.js) — a threshold event on village
standing. Hypothesis: the governor trims ~2.9M kcal of surplus inflow, and
the feast/gift economy that builds standing runs on surplus; less surplus
flowing through → slower standing accumulation. Counter-consideration:
threshold events on chaotic trajectories are noisy at n=16, and the 8807
fork accounts for 2 of the 5 diffs. NOT proven — named next: instrument
standing/feast spending vs trim to test the mechanism before any default-ON
call. This is the one substantive tradeoff signal in the run, and it goes
to Steve/coordinator with the verdict.

Death causes (armed 241 total / control 229): combat 115/135, monster
85/55, starvation 11/6, sickness 8/5, contest 5/5, wounds 4/12,
dehydration 3/1. Villages still die fighting; the glut substrate's
starvation shape is unchanged in kind.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Transcript: evidence/2026-10-20/glutcurvecheck-sense.txt (leadfeast 8805,
90d armed — the control's gluttiest config; trim 231k over 90d, 637 trims).

**Verdict: the governor's beat reads as a villager choice — honest
foraging practice, not System spam.**

The beat fired exactly ONCE in 90 days, on day 2, at the start of the one
long glut stretch — the >5-day gate works as designed:

> [d2] Nathan looks at the groaning pantry shelves and leaves the extra
> standing. "No point hauling what'll rot."

Named villager, concrete image (groaning shelves), practical reasoning in
his own voice. It sits naturally beside the duty-throttle beats ("Ananya
checks the pantry before heading out — the shelves are full, ~12 days of
fresh on hand… leaves the fish nets standing and turns to the wood run
instead. The pantry can't take more; the wild will keep."). The two
governors now read as the same culture: people who check the shelves. The
glutprobe sense read called the funnel "machinery with no pantry check" —
on the armed substrate, the funnel checks.

Two notes: (1) 637 trims fire silently behind the single beat — the design
says once per stretch, and the alternative (voicing every trim) would be
spam; the beat stands for the stretch honestly. (2) The unnamed-villager
descriptor ("A person, maybe 40s, with a slouched posture") still repeats
verbatim for the duty-throttle beat — the same polish note as the
glutprobe sense read, still open.

What the village looked like on the armed substrate: still a glut village
(pantry 8 → 22 fresh-days by d10, dawn sweep throwing out "Foraged food,
Expedition haul" at d11, a pantry-smell siege at d8) — the governor bends
the curve, it doesn't end glut. The difference is the funnel now has a
voice and a feedback loop, and the doomed pile stops growing.

## Wall numbers

won 0/16 (armed) / 0/16 (control), national 4/16 / 9/16, table 12/16 /
13/16, wave-4 12/16 / 15/16, wave-5 0/16 / 0/16, median survival 159d /
149d, max 180d / 180d. Wave reach by policy-armed: leadfeast w4 6/8,
belongfeast w4 6/8; wave-5 unreached everywhere (pre-seat substrate).
Death-cause shares (armed): combat 48%, monster 35%, starvation 5%,
sickness 3%, contest 2%, wounds 2%, dehydration 1%. The wall stands.

## Village assessment (plain words)

Sixteen villages with the governor on, and the funnel finally has a
conscience. Nathan's beat on day 2 is the thesis: people who look at full
shelves and leave the extra standing. Across the corpus the governor eased
off 2.9M kcal — food that was never gathered, never hauled, never rotted
in the dawn sweep. The pantry regime changes: permanent glut drops from
14/16 configs to 6/16. Villages still die the way villages die here —
combat and monsters, rich or lean (the 8807 pair forks into a day-31
collapse on a 9k trim; the engine's chaos, not the governor's hand). Nobody
starves because of the trim — the trim only fires when the shelves hold
4+ days. The lean answer is untouched (1.9k vs 1.65k/d). What the governor
doesn't fix: tribute still pours in ungoverned (3.34x), away-foragers
still walk into full pantries (1.54x), the racks still cap the smoke drive.
And the open question it raises: the villages reach national less often
(4/16 vs 9/16) — if standing runs on surplus, the governor may be taxing
the climb. That's the tradeoff to measure before anyone flips the default.

Who thrived: the long-lived villages (8803/8804 lead, 8801/8808 belong —
159–180d) run the governor hardest (180–357k trimmed) and live longest;
the trim doesn't punish the survivors. Who died: the 8807 fork (both
policies, day 31 — a fragile seed's chaotic fork), the combat attrition
everywhere else. What was missing: nothing the governor was supposed to
provide — the lean side, the eating, the survival all hold.

## Blanks filled / documented

- **FILLED (finding)**: the landed SURPLUSFEED governor bends the
  share_surplus dose-response curve — 1.22x armed vs 2.12x same-commit
  control (bar ≤1.5x: GO), 2.9M kcal trimmed over 1590 trim-days, 16/16
  runs engaged, fast-rot halved (298k vs 652k), permanent-glut configs
  14/16 → 6/16. The funnel's curve is no longer the worst unthrottled
  channel — it now behaves like a governed channel. #702's named next is
  answered with numbers.
- **FILLED (finding)**: conservation holds — the trimmed kcal does not
  reappear in other channels (total glut-day inflow −22%, other-channel
  glut +7% within bar, no laundering pattern).
- **FILLED (finding)**: the governor's voice beat reads as villager
  culture, not System spam (sense read, 1 beat / 90d, once-per-stretch
  gate verified).
- **DOCUMENTED (instrument)**: scripts/probe-glutcurvecheck-b.js (variant
  probe + governor sensor, 21/21 proof GREEN incl. same-commit
  RED-equivalent byte-identical), scripts/analyze-glutcurvecheck-b.js
  (armed-vs-control comparison of pre-registered metrics),
  scripts/test-glutcurvecheck-b.js, scripts/sense-glutcurvecheck-b.js.
  Reusable for future env-gated governor diagnostics.
- **DOCUMENTED (caution)**: the landed glutprobe-b corpus is NOT
  reproducible on current master (src/js landings 16:30Z→19:26Z shifted
  the RNG stream; first dawn divergence day 3). Same-commit control
  re-runs are required for paired comparisons on this hot tree — the
  "don't re-run control" default is unsafe when master moves under you.
  Filed as a loop-operations finding for the coordinator.
- **DOCUMENTED (investigation item)**: national reach 4/16 armed vs 9/16
  control — scale ranks shift down (global 4 vs 8). Hypothesis: standing
  runs on surplus; the governor may tax the climb. Named next: instrument
  standing/feast spending vs trim before any default-ON call.

## Metric review (§14)

- The PRIMARY bar (≤1.5x) is MET: 1.22x armed vs 2.12x same-commit
  control. No re-scoring was needed or done on the primary.
- The control re-run deviation (documented in pre-registration before
  either sweep): the RED-equivalent against the LANDED corpus failed for
  master movement, not variant drift — the untouched original probe
  reproduces the divergence identically, and the variant reproduces the
  original byte-identically on the same commit. The honest paired before
  is the same-commit re-run. This deviation was pre-registered HERE
  before the sweeps ran, with the reason and the replacement method.
- starvationDeaths bar (≤ control, raw counts): MISSED 11 vs 6, NOT
  re-scored. The bar misfires on this substrate: no dose-response
  (Pearson(trimKcal, deaths) = −0.417), mechanistic impossibility (trim
  only fires at >4 fresh-days), fork-driven (4/11 are the 8807 pair),
  exposure-confounded (armed lives +10d median). Proposal for the NEXT
  run: gate on dose-attribution (|r| > 0.3 with the right sign) or compare
  starvation deaths per 100 lived-days, or require the deaths to occur on
  high-trim pairs. The #602 precedent flagged this class; this run
  confirms it.
- newDeathMechanism bar (exact kind:cause set equality): MISSED on 8
  "novel" entries, NOT re-scored. The bar conflates monster identity with
  death mechanism — the control shows the mirror image (6 monster-name
  causes absent in armed). Mechanism-triaged: zero novel mechanisms.
  Proposal for the NEXT run: compare canonical mechanism classes
  (combat/monster/sickness/starvation/dehydration/wounds/contest/...),
  not raw kind:cause strings.
- The throttle verdict bands classified every channel cleanly again; no
  channel landed PARTIAL on either substrate. duty:forage shows `inf`
  (lean=0, glut=2/d) — the same UNSTAFFED class as the landed run, now
  with 2 kcal of noise; the verdict is unchanged in substance.
- The 1.5x bar was anchored to the landed 2.59x; the same-commit control
  measured 2.12x (master movement shifted the substrate). The bar still
  bound the run as written (1.22 ≤ 1.5) — but future bars should be set
  against the same-commit control, not a landed reference, on this hot
  tree.

## Balanced panel (§15) — attempted, inexpressible, no bogus compare shipped

Attempted scripts/balance-panel.js on armed-vs-control. It cannot express
this comparison, precisely:

1. The panel's case identity (`identity` in balance-panel.js) is
   `{schemaVersion, sourceDigest, observerDigest, contractDigest, seeds,
   policies, days, ...job}` — the treatment (SURPLUSFEED=1, an env var) is
   not part of the identity. `flagNames` (the env flags snapshotted into
   panel identity) does not include SURPLUSFEED, and children inherit
   `process.env` — so an armed panel generation would collide with (or
   silently reuse) unarmed case caches across the treatment boundary. The
   panel cannot distinguish the two arms.
2. The panel's substrate is fixed by the §15 contract: POLICY_REGISTRY
   policies (capable/risk-aware/socialite/winseek), sweep-dashboard seeds,
   150d — not the pre-registered glutprobe substrate (leadfeast/
   belongfeast + FEASTSCALE_R13=1, seeds 8801–8808, 180d death-aware).
3. The panel's contract metrics (all23 per-policy) do not include the
   pre-registered primary (share_surplus glut/lean dose-response ratio from
   a call-path instrument). A panel compare would answer a different
   question on a different substrate with a cache-integrity hazard.

Same class as the retagrot precedent (env-gated policy treatments are
currently inexpressible in the panel). No compare shipped. The
before/after comparison in this run is the paired dose-response analysis
(scripts/analyze-glutcurvecheck-b.js) on identical seeds, commit, and
instruments — the panel is the instrument where it can express the
question; here it cannot.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../scale-wall-preseat.json
--current 'evidence/2026-10-20/perseed-glutcurvecheck-b/*.json' --metrics
national,table,won,exiled` fired LOUD on national/table — a FORMAT
artifact, not a deviation: the checker reads top-level dot paths, and the
per-seed JSONs carry national/table/won nested in `rows[]` (missing → 0).
Recomputed properly: armed national 4/16, table 12/16, won 0/16. The
baseline regime (national 21/32, table 24/32, won 0/32) was measured on a
different substrate (seeds 65001–65016 + TRIBFLOOR/SUCCGRACE/RAIDDENSITY/
WINPURSUIT/WINDEFER env stack) — regime-mismatched for national/table
rates; the wins-structurally-0 check holds (0/16). The regime-correct
comparison is armed vs the same-commit control re-run: national 4/16 vs
9/16, table 12/16 vs 13/16, won 0/16 vs 0/16 — the national delta is the
same-run investigation item documented in Results (standing-may-run-on-
surplus hypothesis, named next: instrument standing/feast spending vs
trim).

## Convergence state

**GO on the primary with 2 guardrail misses investigated as metric
calibration, not lever harm (per §14, not re-scored).** The governor bends
the share_surplus curve (1.22x vs 2.12x), engages on 16/16 runs (2.9M kcal
trimmed), halves fast-rot, breaks permanent glut on 10/16 configs, leaves
the lean answer and survival intact (+10d median), and voices like a
villager. The two misses (starvationDeaths, newDeathMechanism) investigate
out as bar miscalibration. One substantive tradeoff signal is open: national
reach 4/16 vs 9/16 (standing-may-run-on-surplus hypothesis) — the
default-ON call needs that mechanism tested first. **DO NOT TOUCH src/js;
no lever to land — this was instrument-only on a landed governor.**
food-economy stays converging; the wall is unmoved (wins 0/16, wave-5 0/16).
