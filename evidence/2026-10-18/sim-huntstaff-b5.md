# sim-huntstaff-b5 — bear/boar engagement measurement (ARM sim-huntstaff-b5)

Lever arm, loop B food-economy axis, run fleshout-loop-b-20261018T1530Z.

Named next from finding #539 (sim-findings.md:539): the sim-killaudit-b
census (evidence/2026-10-18/sim-killaudit-b.md, 8 runs, 1,281 run-days)
attributed 0 boar/bear kills to STAFFING omissions — no hunt duties fire
(HUNTSTAFF landed but default-OFF), pit_trap never armed. sim-huntstaff-b4
(GO, landed default-OFF) proved the hunt-staffing mechanism engages (110
assignments, 187k kcal meat). This arm turns the landed layer ON
(HUNTSTAFF=1) and measures: do hunt duties engage boar and bear, do the
hunts resolve, at what cost? Policy-side only — zero src/js changes.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §§9–12, 14–15)

- **QUESTION:** with hunt duties staffed, do boar/bear enter the village's
  kill orbit, and is bear-hunt engagement survivable?
- **PRIMARY (binding):** hunt-duty boar+bear ENGAGEMENTS (duties resolving
  with picked prey wild_boar or black_bear — kill or stalk-miss) >= 6
  across the armed side. Control expected ~0 (control fires no layer
  hunts; rare engine task-lead stalks measured and reported, not gated).
- **ENGAGEMENT (kill-fast):** hunt duties assigned >= 8 armed side. If 0
  duties assigned at pilot, KILL.
- **GUARDRAILS:**
  - Assigned-hunter deaths <= control+2 per-pair, with WOUND-CHAIN
    attribution (lesson #535: an assigned-hunter death within ~7d of a
    wounding hunt resolve, where the fatal condition's onset followed the
    wound, counts as hunt-attributable even if the cause string says
    'sickness').
  - Median survival >= control−10d.
  - No new death mode (armed vs control cause-sets).
  - det-gate byte-identical (gate-off vs base; armed+observation vs armed).
- **HORIZON:** 180d death-aware (dead villages stop; +10d tail max).
- **SUBSTRATE:** FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT; mode leanwinter;
  master verified by probe (tree-local `git rev-parse` vs main-tree master).
- **SEEDS:** 105101, 105102, 105103, 105104 (the killaudit's clean baseline)
  + 107201, 107202, 107203, 107204 (fresh — verified zero evidence-usage
  matches across evidence/ filenames and 2026-10-18 content). 2 policies
  (leadfeast, belongfeast) x 2 arms x 8 seeds = 32 runs. Own paired control,
  identical seeds both sides.
- **METRIC BINDING (§14):** a miss is NO-GO, never re-scored mid-run.
  Metric doubts go under "metric review" for the next run.
- **§15 balanced panel:** scripts/build-huntstaff-panels-b5.js builds
  control ("before") and armed ("after") panels; compare .md attached.
  The panel is the instrument, the pre-registered threshold is the judge.
- **SENSE-TESTING LAW:** read boar/bear hunt beats (departure, stalk,
  resolve) — judge whether they read like people hunting, never just counts.
- **DEATH INSTRUMENTS:** death tele KIND captured; villager counts filter
  kind person/villager (lesson #525); v.taskLeads snapshotted per day
  alongside the assignTask wrap (lesson #528).
- **CONVERGENCE STATE:** converging | converged | parked | killed-at-pilot
  — set in VERDICT.

## Canon read

- docs/CANON.md (this run). Hunting is human-skill lane: the layer assigns
  LABOR, never an alien ability; no System slot, no magic.
- docs/BEAR.md: the black bear is an animal but **a FIGHT, not stalkable
  prey** — "Bear should be a non monster monster fight." Maul 8–17 at range
  ≤2; spear reach halves it; butchering yields 24×500-kcal portions + 6
  separable fat slabs; trichinosis cleared ONLY by 'cooked' (smoking does
  NOT); ungated bear-kill instructions were removed. **Canon tension, named
  not resolved:** the engine's villagerHuntResolve picks bear as prey and
  resolves a stalk-kill at 0.15 (hard difficulty) — no fight, no maul, no
  knowledge gate. If armed hunts stalk-kill bears, that is a canon
  violation the layer only EXPOSES — fixing it is game-code work and a named
  next for another arm, not this one.
- Boar (wild_boar, 21,000 kcal, 3 fat slabs, hard) has no canon doc; it is
  animal prey, fight-free by design.
- docs/PRESERVATION.md (b2): hunt returns 'Game meat' — the layer only puts
  meat in the pipeline; bear fat/trichinosis lanes belong to the canon doc.

## Instruments

- scripts/policies/huntengage.js (NEW): read-only observation wraps —
  villagerHuntResolve records engagement {aid/kill/source} (source:
  'layer-staffed' when v.assignments[vid].task==='hunt', else
  'engine-tasklead'); hurtVillager records 'hunting'-cause wounds for the
  wound-chain instrument. Applied ONLY when HUNTSTAFF=1 (armed side), so
  gate-off det-gate neutrality holds. Zero RNG draws, zero Game state writes.
- scripts/test-huntstaff-b5.js: RED->GREEN fixture pins on the landed layer
  + engagement-instrument fixtures + det-gate (gate-off vs base AND
  armed+observation vs armed), byte-identical.
- scripts/sweep-huntstaff-b5.js: 32-run sweep, schema 'huntstaff-wall/5'.
- scripts/build-huntstaff-panels-b5.js: §15 panel builder.

## Results (32/32 runs complete, 2026-10-18)

Sweep: seeds 105101–105104 + 107201–107204 × {leadfeast,belongfeast} ×
{armed,control}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0,
mode leanwinter, base b9d5f242 (re-based onto current master before the
sweep; two sibling commits landed after tree registration). 0 instrument
errors. Corpus: evidence/2026-10-18/perseed-huntstaff-b5/ (32 JSONs,
schema 'huntstaff-wall/5'). Analyzer: scripts/analyze-huntstaff-b5.js →
evidence/2026-10-18/huntstaff-b5-analysis.json (deterministic). Panel:
scripts/build-huntstaff-panels-b5.js → evidence/2026-10-18/
huntstaff-panel-b5.{json,md} (+ before/after .json.gz). Proof:
scripts/test-huntstaff-b5.js — ALL GREEN (13 fixture pins, 9 instrument
pins, det-gate 8/8 byte-identical: 4/4 gate-off vs base, 4/4
armed+observation vs armed, 0 substrate-noise, 0 divergent).

**PRIMARY (boar/bear engagement): GO** — 15 hunt-duty engagements against
black_bear across the armed side (bar ≥6), 0 on control. Breakdown:
13 stalk-kills (263,520 kcal of bear meat into pantries) + 2 stalk-misses.
By source: 8 layer-staffed, 7 engine-tasklead (the engine's contender-
challenge hunt domain — finding #528 — firing in the layer's wake; see
below). By prey: **black_bear 15/15, wild_boar 0/15** — boar never
engaged on these seeds despite the killaudit's near-Haven abundance
(122/127 snaps); the nearest-tile + count-weighted pick favored bear on
the firing seeds. Boar engagement remains unmeasured (the sibling arm
sim-pitstaff-b covers pit-trap boar).

**ENGAGEMENT (kill-fast): GO** — 73 hunt duties assigned on the armed side
(bar ≥8): s105104 lead 5 / belong 23, s107201 lead 9 / belong 28,
s107204 belong 8. Control hunt assignments: 0 everywhere. Zero-fire pairs
(s105101–s105103, s107202–s107203) are byte-identical armed≡control —
the layer is a true no-op when it doesn't fire.

**ASSIGNED-HUNTER DEATHS (wound-chain): GO** — 16/16 pairs: armed
hunt-attributable assigned-hunter deaths ≤ control+2. In fact 0
hunt-attributable on both sides: the wound-chain rule (death within ~7d
of a wounding hunt resolve) attributed nothing. Two assigned hunters died
and deserve honest autopsy (see below) — neither meets the pre-registered
rule, and per §14 the rule binds; the tension is documented, not re-scored.

**MEDIAN SURVIVAL: GO** — 130.5d armed vs 130.5d control (bar ≥ control−10d).

**NO NEW DEATH MODE: MISS** — armed-only villager death causes:
'hunting' (Ruby Callaghan ×2, s105104), 'Highbeam Deer' (Jae Ward,
s107201), 'starvation' (Indira Yessimova, Julieta Guevara, s107201).
Mechanism-by-mechanism (the cause-set letter and the mechanism agree
this is a miss):
- **'hunting' — genuine layer-correlated signal.** The engine's task-lead
  hunt domain fired 12 day-rows on armed vs 0 on control — all on s105104,
  the seed where the layer fired (5–23 assignments), both policies. Ruby
  (lifeguard, NOT layer-staffed — the engine's contender took the hunt
  domain) stalked bears d16–d20, was wounded d17 (−22) and d20 (−30),
  went febrile d19 ("a cut gone hot and angry"), and died d20/d22 of the
  wounds. Same pattern as b4's s8473 ("the engine's contender-challenge
  hunt domain fired right after the layer's last assignment as Ayaan
  declined"). The layer doesn't wound Ruby directly; it creates the
  condition for the engine's follow-on hunts, and those hunts kill.
- **'starvation' — genuine second-order signal.** Armed-belongfeast-s107201:
  the layer re-staffed Teresa (exterminator, visjoin_148) d160–177 while
  she accumulated 8 hunting wounds (d160 −20, d163 −13, d166 −28, d169
  −30, d170 −20, d174 −27 — plus a Spool mauling −40 d169). The b4 metric
  review PREDICTED this: the HP gate reads the overnight-recovered map,
  masking the person's true decline, so a wounded hunter is re-staffed
  daily. Meanwhile Indira and Julieta starved d162–163. Control: 0
  villager starvation deaths, Teresa on other duties. Correlation with a
  plausible mechanism (labor misallocation + re-staffing bug); not proven
  causal — documented as a signal, not a verdict.
- **'Highbeam Deer' — sample-size on the mode, hunt-correlated on the
  death.** The mode is substrate-native (the benchmark wave-1 monster;
  "every animal might kill you"); its absence on control is the 81-vs-92
  death draw. But Jae Ward (hunting guide, the layer's assigned hunter,
  d14 bear-killer) died to it d41, two days after his d39 assignment,
  with hunting wounds d17/d28 outside the 7d chain. The pre-registered
  rules (wound-chain 7d; b4's d/d+1 window) both say not-attributable —
  they bind. The plain reading (the layer sends people into the wild;
  the wild kills them) is the honest tension, recorded here.

**DET-GATE: GO** — byte-identical (proof Part B).

**Wall (pre-seat, report-only):** national 12/16 vs 12/16 · table 15/16 vs
13/16 · wins 0/16 both · wave-4 13/16 vs 12/16 · wave-5 0/16 both ·
Arc II 16/16 both · Arc III 16/16 both · Arc IV 15/16 vs 13/16 ·
four-realm 0/16 both · median survival 130.5d vs 130.5d · max 182d both ·
exiled 0/16 both.

**§15 panel:** decision review_required. leadfeast: table / national /
survival60 regression_watch (−0.125, every CI includes 0). belongfeast:
table regression_watch (−0.125, CI [−0.375, 0]). Zero regression_signal.
Compare .md attached: evidence/2026-10-18/huntstaff-panel-b5.md. (Panel
carries wall metrics only; the engagement/guardrail gates are judged from
the corpus + analyzer, per the b4 deviation note.)

**Telemetry:** node scripts/telemetry-check.js fired LOUD on
national/table/wins — all regime artifacts: the baseline
(hidden_files/telemetry-baselines/scale-wall.json) is the WINSEAT regime
(SEATDRIVE=1, full win stack; its own note says DO NOT compare pre-seat
substrates against it). Not rolled, per the brief.

## VERDICT: NO-GO (guardrail miss) — convergence state: converging

PRIMARY GO (bears enter the kill orbit: 15 engagements, 13 kills,
263,520 kcal). ENGAGEMENT GO. But the "no new death mode" guardrail
misses on a genuine layer-correlated signal (engine task-lead hunts in
the layer's wake killing Ruby) and a genuine second-order signal
(wounded-hunter re-staffing coinciding with starvation). Per §14 the miss
is NO-GO, never re-scored. The layer itself is unaffected — it remains
landed default-OFF from sim-huntstaff-b4; this arm proposed no layer
change. The axis is converging: the measurement answered its question
and the costs are now characterized, each with a named next (below).
Not killed-at-pilot: the mechanism engaged; the pilot gate passed.

## Named nexts

1. **The re-staffing guard** (b4 metric-review revision 2, now OBSERVED):
   refuse re-assignment within 2d of a wounding hunt resolve, or read
   person-level HP instead of the overnight-recovered map. Teresa's
   8-wound arc (d160–174) is the proof. Policy-side layer change — a
   future arm. (No game-code change made here per the arm's policy-only
   constraint.)
2. **The task-lead wake**: engine task-lead hunts fired 12 rows on armed
   vs 0 on control, all on the layer-firing seed. Designed experiment
   needed: map the contender-challenge hunt domain's trigger and test
   whether the layer causes it or merely precedes it.
3. **The bear stalk-kill canon violation** (steve-call): villagerHuntResolve
   resolves black_bear as a 0.15 stalk-kill narrated "clean kill" —
   docs/BEAR.md says the bear is a FIGHT (maul 8–17 at range ≤2; spear
   reach halves it; ungated bear-kill instructions were removed). The
   duty either needs a bear refusal ("too dangerous") or must route
   through the maul fight. Game-code work — Steve's design call.
4. **Boar engagement unmeasured**: 15/15 engagements were bear. A seed
   where the nearest tile is boar-heavy (or the pitstaff-b sibling arm)
   still needs to answer whether boar enters the orbit.
5. **narration:true diverges long trajectories** (harness finding, this
   run): sense scripts capturing beats with narration:true over >~30d
   read a NEARBY trajectory, not the measured one (s107201: Teresa's
   entire d160–177 arc vanished under narration:true; reproduced exactly
   under narration:false). Proven safe: Game.say wrap + narration:false
   (engagements/wounds/deaths byte-identical to the sweep). All sense-*
   scripts should switch to that pattern.

## Metric review (mandatory)

- The wound-chain attribution rule (lesson #535) worked as designed and
  attributed nothing this run — which is itself informative: the two
  assigned-hunter deaths (Theo d32, Jae d41) both fell outside the 7d
  wound window, and Theo had no hunting wound in the ledger at all
  (collapse casualty). The rule's narrowness is honest, but Jae's case
  (assigned hunter killed by the benchmark monster 2d after assignment)
  exposes the rule's blind spot: it only sees wound-mediated deaths,
  never encounter-mediated ones. A future revision should add the
  hunt-exposure window (b4's d/d+1) alongside the wound chain — proposed
  for the next run, not applied here.
- The raw cause-set comparison for "no new death mode" is oversensitive
  to sample size ('Highbeam Deer') but it caught two genuine signals the
  count guardrails missed. Keep the letter (it fired honestly), but pair
  it with the mechanism autopsy as done here.
- The engagement instrument (huntengage.js) proved out: kill-aid capture
  + miss-name parsing + source attribution (layer vs task-lead) +
  wound capture, zero RNG draws, zero state writes, det-gate 8/8.
  The miss-name parser is the fragile part (depends on the engine's
  stalk-miss message template); if the template changes, engagements
  undercount silently — a future revision should prefer an engine aid
  on the miss return (game-code, named not done).
- Median survival identical to the decimal (130.5 vs 130.5) is a
  collapse-substrate artifact (many paired village-lost runs), not a
  finding.

## Sense-test (law)

Two reads; both judged as a player.

**Read 1 — Theo/Ruby bear window** (armed-leadfeast-s105104, d9–d24;
transcript verified against the measured ledger — engagements and wounds
identical). Theo (trail crew lead) walks out d11: "📋 Theo — 🏹 Hunt.
They'll report back by next part." → "🏹 Theo brings down a Black Bear —
clean kill, +18000 kcal to the pantry." Nobody in the fiction reacts to
the bear as a fight — it reads EXACTLY like the owl he takes d13
("+360 kcal"). That is the canon violation made visible: a black bear
should be the scariest animal in the woods, and the village treats it as
a big rabbit. Around the hunts everyone stays people: Theo quiet at the
fire after the kill ("Night Court — I put it down today"), Ruby telling
hunting stories ("the American Woodcock, how it moves, where it feeds"),
Meera patching the wounded, Siobhan figuring out the Hushpuppy counter
("Wound the lead and the pack breaks"). Ruby's wound chain reads as the
village losing someone to the wild's interest payments: d17 hurt (−22),
d19 "🤒 Ruby is feverish, a cut gone hot and angry", d20 hurt again
(−30) — and in the measured run she died that day of the wounds.
Nothing robotic; the cost is legible and sad.

**Read 2 — Teresa's late arc** (armed-belongfeast-s107201, d160–172;
valid transcript via the narration:false + say-wrap pattern after the
narration:true run diverged — see named next 5). Teresa (exterminator,
late joiner) is a whole person around the mechanism: teaching Ginkgo Nut
and Prickly Pear by the fire, checking snares ("Wire doesn't lie"),
hauling wood, fishing between hunts, discovering Apex Sense, sitting
with someone crying quietly in the bunks. And the mechanism is visibly
sick: wounded d160 (−20), patched (62→87), re-staffed d161; wounded
d163 (−13), re-staffed; d166 (−28); d167 brings down the bear (+21,600 —
again narrated as a clean kill, no fight); d169 mauled by the Spool
(−40, 4 rounds) AND wounded on the hunt (−30); d170 (−20). "🩹 Teresa is
hurting (69 HP) — You patch them up before they head out" — patched and
sent right back into the treeline. Meanwhile d162: Julieta to Teresa by
the fire: "The pantry's the thing. We don't raise The Granary on empty
shelves — 4,346 of 20,000 kcal." And d167: "Teresa set out an extra bowl
before catching themself. Nobody mentioned it." (Indira and Julieta
starved d162–163.) The fiction is people-like; the staffing logic is not
— it cannot see that its hunter is being used up.

## Village assessment

The substrate ran collapse-heavy: 20 of 32 runs ended village-lost
(wave-2/3/4 pressure on the new master base), and the killaudit's clean
baseline seeds collapsed early on leadfeast (d69–d164). The villages
that engaged hunts were the lean ones — the layer fired only where the
pantry ran thin, exactly as designed.

Who thrived: **Teresa Godínez** (exterminator) — 28 assignments across
d12–d177 on belongfeast-s107201, the village's workhorse: bear, deer,
squirrel, snake, bobcat, plus fishing/foraging/snares/cooking between
hunts; discovered Apex Sense; taught Field Dressing. She survived 8
hunting wounds and a Spool mauling because the village kept patching her
— and because the layer kept sending her out. **Theo Lindqvist** (trail
crew lead) — 5 assignments, 2 bear stalk-kills (36,000 kcal), dead d32
in the s105104 collapse ("a wound that wouldn't close" — no hunting
wound in the ledger; the wave-2 collapse took him, not the hunt).

Who died and why: **Ruby Callaghan** (lifeguard) — killed by the engine's
task-lead hunts, which fired only in the layer's wake (12 rows armed vs
0 control), dying of hunting wounds d20/d22 on both policies of s105104.
**Jae Ward** (hunting guide) — the layer's assigned hunter, stalk-killed
a bear d14, then killed by a Highbeam Deer d41: the benchmark monster
doing exactly what Steve designed it to do to people in the wild.
**Indira Yessimova** (veterinarian) and **Julieta Guevara** (cook) —
starved d162–163 while the village poured its wounded hunter back into
the treeline.

What knowledge was missing: the village never learns the bear as a
fight — there is no fight to learn from, only clean kills. Trichinosis
and fat-rendering knowledge (docs/BEAR.md L4) presumably sits ungained;
the bear's 6 fat slabs never surface distinctly in the duty's flat
cleaning (18,000 = 30,000 × 0.6 — the portion/fat law is bypassed by the
duty path). The village also never learns *not* to send a wounded hunter
back out — the staffing logic can't see wounds.

Which blank was filled: the engagement instrument
(scripts/policies/huntengage.js) + the measurement itself — finding
#539's huntstaff half is now answered: **yes, bears enter the kill orbit
when hunts are staffed (15 engagements, 13 kills), but not as prey — as
a canon-violating stalk-kill; boar remains unmeasured.** Documented, not
fixed: the bear stalk-kill canon violation, the re-staffing bug
(observed, not just predicted), the task-lead wake, the narration
divergence.

## Convergence state

**converging** — the axis question (do staffed hunts reach boar/bear?)
is answered for bear; the costs are characterized with named nexts; the
layer stays landed default-OFF. Not converged: boar unmeasured, the
re-staffing guard unbuilt, the task-lead wake unexplained, the bear
canon violation awaiting Steve's design call.
