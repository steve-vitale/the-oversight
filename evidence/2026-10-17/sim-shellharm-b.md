# sim-shellharm-b — harm-model diagnostic for the sim-shellcounter-b kill (loop B, axis food-economy)

DIAGNOSTIC (read-only instrumentation, no behavior change). Resolves the harm
model behind the sim-shellcounter-b kill (evidence/2026-10-17/sim-shellcounter-b.md):
the counter-shelling layer killed zero-trace at pilot on a REAL guardrail miss —
starvation deaths 22 vs 7 (pooled Δ=15; villager-only 18 vs 5, Δ=13), paired sign
1/6/9 — while the pantry gained ~671k shelled kcal and the scholar drew 298k less.
WHY did starvation rise when food rose?

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§14-15 — written 2026-10-17 16:55 CDT, before any sim)

- PRIMARY: share of the pooled control→armed starvation delta explained by an
  identified mechanism. GO target: **≥80% of the delta attributed** to a named
  mechanism (collapse-tail re-timing / neutral-perturbation timing replication /
  food-channel displacement). Villager-only deaths (exclude the scholar) are the
  harm read; pooled is reported for continuity with the original verdict.
- SUB-METRICS:
  (a) per-pair villager-starvation deaths split pre-collapse (day < villageLostDay)
      vs collapse-tail (day ≥ villageLostDay; day ≥ 9999-normalized for never-lost);
  (b) neutral-perturbation replication: perturb−control Δ per pair, direction and
      magnitude vs shell−control Δ, on the same seeds;
  (c) food-channel: pantry displacement (scholar takes control−armed, villager takes
      totals, per pair), pre-collapse lean-day pantry levels armed vs control,
      biggest-sheller pairs (s7308-belongfeast etc.) starvation vs paired controls;
  (d) collapse timing: villageLostDay and first-pantry-empty day per arm per pair
      (armed earlier/later/same).
- VERDICT CLASSES (mutually exclusive, judged in this order):
  1. GENUINE HARM — a food-channel or systematic mechanism explains ≥80% of Δ
     (e.g. displacement ≤ 0, or pre-collapse lean-day pantry systematically lower armed).
  2. TAIL-TIMING NOISE — ≥80% of Δ is collapse-tail deaths and/or the neutral
     perturbation replicates the shell-arm shift (same direction, ≥50% magnitude)
     on the famine-prone pairs. The guardrail counted the wrong thing: tail
     deaths are a different regime, and the arm's true perturbation is time, not food.
  3. UNRESOLVED-BUT-SCOPED — residual after all three lenses, bounded in size,
     with the exact scope of what a revival must measure.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail). Never a fixed horizon.
- SEEDS: 7301–7308 × {leadfeast, belongfeast} × {control, shell-armed, perturb-armed}
  = 48 runs, own in-sweep controls, identical seeds. Substrate FEASTSCALE_R13=1,
  SEATDRIVE=0, mode leanwinter — identical to the original corpus.
- INSTRUMENTS: scripts/policies/shellcounter.js (faithful reconstruction of the
  killed layer, read-only diagnostic instrument, never landed); scripts/policies/perturbdawn.js
  (neutral 4-tick dawn busywork: identical gates, no shelling, no put-away, no kcal
  change — isolates the timing vector from the food channel);
  scripts/sweep-shellharm-b.js (extended death/collapse/pantry telemetry);
  scripts/test-shellharm-b.js (instrument proof: fidelity RED/GREEN both layers,
  det-gate byte-identical gates-off, attribution unit test).
- SENSE-TESTING LAW: read the death beats of the extra starvation cases — do they
  read as the shelling taking food out of mouths, or as chaos? Reported below.
- §15: the official balance-panel driver cannot express this arm (same deviation as
  shellcounter-b: policy-side layers, FEASTSCALE_R13 substrate, leadfeast/belongfeast
  not panel policies, contract lacks starvation/shelled-kcal/pantry metrics). Light
  per-seed panel-schema JSONs (control/shell/perturb) + compare .md in
  evidence/2026-10-17/panel-shellharm/; pre-registered metrics judged directly.

## Instruments

All instruments green on master 47fbea56 (`node scripts/test-shellharm-b.js`:
**15/15 ok, 0 failed**, 2026-10-18 ~01:47 UTC; the prior run's Part-C OOM was
box pressure, not the test — the full det-gate ran clean this time):

- PART A (shellcounter fidelity, RED→GREEN fixture): base upkeep leaves
  counter nuts in shell; wrapped (SHELLCOUNTER=1) shells the counter batch,
  putAway moves it to the pantry, engine pantry-eat eats it (scholar 300 →
  >1500 kcal). The reconstruction is faithful to the killed arm's evidence
  description (same gates: lean day, at Haven stores, counter nuts, 4+64 tick
  margin, once/day; same engine calls: Game.shellNuts + Game.putAwayFinished).
- PART B (perturb neutrality): PERTURBDAWN=1 burns exactly 4 extra ticks,
  moves NO food (pantry delta == base delta), changes NO kcal, fires under
  the same gate schedule, never on FED days.
- PART C (det-gate): both wrappers gate-off vs unwrapped base, 30d x 4 seeds
  x 2 policies — per-day trajectory hashes **byte-identical** (base-vs-base
  control disambiguates substrate noise).
- PART D (attribution unit test): synthetic death lists — tail deaths
  attribute to re-timing, pre-collapse excess with replicated perturb shift
  attributes to timing, unexplained pre-collapse excess stays residual.
- PART E (smoke): 6/6 short runs, no exceptions.

Sweep: 48/48 runs on master 47fbea56 (single consistent base — see Recovery),
FEASTSCALE_R13=1, SEATDRIVE=0, mode leanwinter, 180d death-aware. ~21s/run,
~17 min wall on the quiet box (vs the ~6h projection on the overloaded box).
Per-run cost measured first (21s); full fresh re-run chosen over mixed-base
(see Recovery status).

## Before / after

THE HARM DID NOT REPRODUCE. The original kill (sim-shellcounter-b, same seeds
7301–7308, same policies, older master): starvation 22 vs 7 pooled (Δ=15),
villager-only 18 vs 5 (Δ=13), paired sign 1/6/9. On current master:

| metric | control (16) | shell (16) | perturb (16) |
|---|---|---|---|
| shell days | 0 | **86** (= original's 86) | 0 |
| shelled kcal converted (total) | 0 | **821,128** (orig 671,458) | 0 |
| starvation deaths (pooled) | 4 | **2** (orig 22) | 4 |
| villager starvation deaths | 3 | **1** (orig 18) | 3 |
| scholar starvation deaths | 1 | 1 (orig 4) | 1 |
| paired vill-starv sign (better/worse/tied) | — | **2 / 0 / 14** (orig 1/6/9) | — |
| scholar pantry takes (kcal) | 655k-class | **armed draws MORE** (disp −219,123; orig +298,220) | = control |
| villager pantry takes (kcal) | — | **armed eats MORE** (disp −568,751) | = control |
| national | 14 | 15 | 14 |
| table | 14 | 16 | 14 |
| wins / exiled | 0 / 1 | 0 / 0 | 0 / 1 |
| wave4 / wave5 | 0 / 0 | 0 / 0 | 0 / 0 |
| median survival | 172d | 175.5d | 172d |

The mechanism engages HARDER than the original (821k vs 671k kcal, identical
86 shell days) — yet starvation fell on every count. The two pairs where
arms differed both favor shell (belong s7305: control 1 vill-starv → shell 0;
leadfeast s7308: control 2 → shell 1), and both shell-arm villages outlived
their paired controls (135→136 collapse, 136→167 collapse). The perturb arm
is trajectory-IDENTICAL to control on all 16 pairs (survival, national, table,
starvation, and the full death-cause histogram byte-equal: combat 442 /
villager-combat 178 / monster 65 / expedition 40 / contest 12 / wound 11 /
sickness 9 / experiment 7 in both) — the neutral 4-tick dawn perturbation
(1–46 perturb days/run, mean 13.2) changes literally nothing.

## Attribution breakdown

PRIMARY: share of the pooled control→armed starvation delta explained by an
identified mechanism, GO ≥80%. **The delta is now zero/negative** (pooled
4→2, villager-only 3→1), so the metric is degenerate: excess (floored per
pair) = 0, timing-attributed = 0, residual = 0. (The analyzer initially
printed "100% attributed / TAIL-TIMING NOISE" for the 0/0 case — caught and
fixed in scripts/analyze-shellharm-b.js this run: HARM NOT REPRODUCED with
an n/a share. The verdict is HARM NOT REPRODUCED, see below.) The lenses report:

(a) COLLAPSE-TAIL SPLIT: nothing to split. The only shell-arm starvation
    deaths (scholar d103 leadfeast-s7303; villager d160 leadfeast-s7308) are
    pre-collapse (lost 170 / 167) in villages that outlived their paired
    controls by 104d and 31d respectively. Collapse timing shell vs control:
    earlier 4 / later 6 / same 6 — symmetric re-timing, no systematic earlier
    collapse.

(b) NEUTRAL-PERTURBATION REPLICATION: the perturb arm replicates NOTHING —
    it is identical to control on all 16 pairs (see Before/after). The timing
    vector is provably inert on this substrate: 4-tick dawn busywork, fired
    1–46 days/run, moves zero trajectories. This rules the timing channel OUT
    as an explanation for any arm difference: had the shell arm shown excess,
    it could not have been the 4 ticks.

(c) FOOD-CHANNEL DISPLACEMENT: the channel runs the OPPOSITE of harm.
    Pantry displacement (control−shell): scholar −219,123 kcal, villagers
    −568,751 kcal — the armed villages EAT MORE from the pantry (the original
    had +298,220, scholar eating less armed). Pre-collapse lean-day mean
    pantry: control 25,669 vs shell 29,560 kcal (+3,891 mean, min −7,423, max
    +15,946, 16 pairs). Biggest shellers vs paired controls (vill-starv c/s):
    belong s7306 131,612 kcal/6d → 0/0; leadfeast s7308 100,201/9d → 2/1
    (shell better); leadfeast s7306 85,606/5d → 0/0; belong s7308 80,626/9d →
    0/0. No pair shows starvation excess alongside heavy shelling.

## Sense-test (death beats)

The sense script found no worst pairs (no shell-control excess > 0 anywhere),
so the two shell-arm deaths and their paired controls were read directly:

- **shell leadfeast-s7303 (scholar Mateo Alvarez, d103)**: quiet death, no
  food-death beats in the window. The village lived to day 170 (control: 66).
  The death reads as a late, quiet starvation in a long-lived village — not
  theft.
- **control leadfeast-s7303 (scholar d65)**: the money shot for the whole
  diagnostic — the control scholar starves WHILE the beats read "Overnight,
  Hickory Nuts (in shell) went bad — beyond saving" and "Nothing edible.
  (Hickory Nuts (in shell) — not food yet: Needs shelling — crack and pick
  the nutmeats.)" This is finding #484's blank in the raw: nuts rotting on
  the counter while a man dies of hunger 3 feet away. The shell arm's d103
  death is the same man dying 38 days later, after 79,426 kcal of counter
  nuts reached the pantry.
- **shell leadfeast-s7308 (Kayla, villager, d160)**: "💀 Kayla starved.
  Slowly. The village is 5 now." / "⚠ Haven's pantry is empty. Day 1 of
  hunger." / half-ration votes, foragers going out hungry, squirrel meat
  spoiling. Classic collapse-tail famine in a village of 5 that lost at 167.
  Chaos of collapse, not instrument theft — no beat connects the shelling to
  any mouth.
- **control leadfeast-s7308 (2 villagers, d135/d137)**: same shape, earlier:
  pantry empty day 4 of hunger, "Hickory Nuts (in shell) went bad — beyond
  saving" three days running, half-ration votes, village lost 136. The
  control deaths are the SAME ordinary famine the shell arm's village met
  24–31 days later.

Verdict of the sense read: nothing in the beats shows the shelling taking
food out of anyone's mouth. The shell-arm deaths are longer-lived villages
meeting the same famine later.

## Harm-model verdict

**HARM NOT REPRODUCED** — the original 22-vs-7 signal does not exist on
current master (47fbea56). The three pre-registered classes, judged in order:

1. **GENUINE HARM** — NO. Requires a food-channel/systematic mechanism
   explaining ≥80% of Δ. Δ ≤ 0; the food-channel audit shows the channel
   running beneficial (more pantry eaten, higher lean-day pantry, biggest
   shellers at 0 excess). Excluded by measurement, not by assumption.
2. **TAIL-TIMING NOISE** — NOT APPLICABLE as written (no positive Δ to
   explain), but its key instrument delivers the diagnostic's strongest
   negative result: the neutral perturbation is trajectory-identical to
   control on 16/16 pairs — the timing vector is inert. Timing cannot explain
   an arm difference on this substrate, period.
3. **UNRESOLVED-BUT-SCOPED** — residual = 0. Nothing in the mechanism is
   unresolved. What remains is a question about the ORIGINAL signal: on the
   older master, 6 of 16 pairs drove 22 vs 7 with 9 ties. Whether that was a
   substrate-specific food-flow artifact (plausibly the pre-r13 scholar-eat
   flow: the original showed the scholar drawing 298k LESS armed while
   starving more) or trajectory noise in a 16-pair corpus cannot be settled
   from here — and settling it is not required for the kill to stand: the
   kill was judged on its own corpus per §14.

PRIMARY (GO ≥80% attributed): **UNMET — degenerate**. The pre-registration
assumed a replicating positive Δ; the data refuted the assumption. Per §14
this is reported as a miss, not re-scored. The diagnostic's real finding is
stronger than its metric: the mechanism engages harder (821k kcal, 86 shell
days — identical engagement count to the original) and the village is
strictly better fed with no starvation signal. The killed layer's guardrail
verdict stands on the original corpus; on current master the layer would
PASS its guardrail (armed 2 ≤ control+2 = 6 pooled).

## Revival guardrail spec (for the future lever revival)

1. **Freeze the base first.** Record the exact master SHA of the revival
   corpus. The harm signal is base-dependent (present on the ~10-17 ~19:40Z
   master, absent on 47fbea56); cross-base corpora are invalid for this arm.
2. **Reproduce before attributing.** On the frozen base, re-run the original
   16-pair corpus (seeds 7301–7308 × {leadfeast,belongfeast} ×
   {control,shell}) and confirm the 22-vs-7-class signal (pooled armed >
   control+2). If the signal does not reproduce, there is nothing to revive —
   the kill stands on the original evidence and the revival is closed.
3. **If it reproduces**, run this diagnostic's three lenses on the frozen
   base with the perturb arm added (scripts/policies/perturbdawn.js,
   scripts/sweep-shellharm-b.js support SEEDS/POLICIES/ARMS). Note the new
   null result: the neutral perturbation is inert (16/16 identical), so any
   reproduced excess must be a REAL mechanism — the food channel is the only
   remaining candidate. Measure scholar pantry-takes displacement FIRST
   (the original's +298k scholar-eats-less-armed is the anomaly to chase).
4. **Do not re-litigate engagement.** 86/86 shell days, 821k kcal — the
   mechanism engages deterministically. Engagement is settled.

## Metric review

1. THE PRE-REGISTRATION'S CORE ASSUMPTION FAILED — HONESTLY. The diagnostic
   was pre-registered to explain a positive starvation delta; the delta is
   gone on current master. This is reported as a PRIMARY miss (degenerate
   denominator), not re-scored against a friendlier reading. (The analyzer's
   0/0 printout was caught and fixed this run — see the PRIMARY section; the
   compare .md now reads HARM NOT REPRODUCED with an n/a share.)
2. THE PERTURB INSTRUMENT IS STRONGER THAN DESIGNED. It was built to isolate
   the timing vector; it proved the timing vector is exactly zero (16/16
   trajectory-identical pairs, byte-equal death-cause histograms). Any future
   arm difference on this substrate cannot be attributed to dawn-tick timing
   — a genuinely useful null instrument for the whole food-economy axis.
3. BASE-DEPENDENCE IS THE FINDING. Same seeds, same policies, same 86 shell
   days, more kcal engaged (821k vs 671k) — and the sign flipped. Between the
   original corpus and 47fbea56, the r13 dawn-after-kill haul prioritization
   (e85d00f0) and witness/exposure/ledger work landed. The revival spec
   (above) requires a frozen base before any re-attribution.
4. §15 DEVIATION (unchanged from pre-reg): the official balance-panel driver
   cannot express this arm (policy-side layers, FEASTSCALE_R13 substrate,
   leadfeast/belongfeast not panel policies, contract lacks
   starvation/shelled-kcal/pantry metrics). Light per-seed panel-schema JSONs
   (control/shell/perturb.json) + compare-shellharm-b.md in
   evidence/2026-10-17/panel-shellharm/; pre-registered metrics judged
   directly.

## Reachability / wall numbers

Scale wall (16 pairs, 48 runs, death-aware 180d):

| metric | control | shell | perturb |
|---|---|---|---|
| national | 14 | 15 | 14 |
| table | 14 | 16 | 14 |
| wins | 0 | 0 | 0 |
| exiled | 1 | 0 | 1 |
| wave4 / wave5 unlocks | 0 / 0 | 0 / 0 | 0 / 0 |
| arc4 reach | 14 | 16 | 14 |
| four-realm formation | 0 | 0 | 0 |
| median survival | 172d | 175.5d | 172d |
| max survival | 182d | 182d | 182d |

Wall report (Steve's standing directive): national and table invitations are
routine (14–16/16), Arc IV reached (14–16/16), but **wins = 0/48, wave 4/5 =
0/48, four-realm = 0/48** — the scale wall stands exactly where the original
corpus left it. This is a corpus/substrate property (feastscale road, no
modal driver), not an arm effect: all three arms agree. Telemetry-check LOUD
lines (national 12→43, table 16→44, wins 16→0 vs scale-wall.json) triaged as
the known explained substrate-mismatch (original evidence:
sim-shellcounter-b.md telemetry section) — arms agree identically, baseline
NOT rolled.

Death-cause shares (top): combat 442/574/442, villager combat 178/167/178,
monster 65/89/65, expedition 40/38/40, contest 12/19/12 (control/shell/
perturb). The shell arm's extra combat/monster deaths are longer-lived
villages fighting more days, not a new killing mode — no new death mode on
any arm (starvation strings identical; no armed-only cause strings).

## Village assessment (plain words)

Sixteen villages, three fates each. The story the sims tell is not the one
the diagnostic was built to find. The counter-shelling scholar — the one the
original kill said was starving his village — shells 821,000 kcal of
counter nuts across the corpus, and his villages eat better, keep fuller
pantries on lean days (+3,891 kcal mean), reach the table more often (16 vs
14), and lose FEWER people to hunger (1 villager vs 3). The two villages
where anyone starved under the shell arm are the two that lived longest:
one scholar dying quietly at day 103 in a village that survived to 170, one
villager going slowly at day 160 in a village of five voting half-rations
with an empty pantry — the ordinary end-of-the-world famine, met a month
later than their un-shelled twins.

The control runs are the indictment of the OLD world, not the new: twice we
watch the scholar starve while in-shell hickory nuts rot on the counter
three feet away — "Nothing edible. (Hickory Nuts (in shell) — not food yet:
Needs shelling.)" — the exact blank the killed layer filled. In the shell
arm those nuts become 79,000 kcal of pantry food and the same man lives 38
more days. The pantry doesn't hoard the shelled food; the village eats it
(scholar takes UP 219k, villager takes UP 569k vs control).

The perturb villages are the eeriest finding: sixteen villages, four ticks
of dawn busywork every lean morning for up to 46 days — and not one death,
not one pantry level, not one survival day differs from control. The
feastscale policies absorb the perturbation completely. Time, at that scale,
is not the lever anyone thought it was.

Nobody acts like a robot here; the beats read as people — foragers heading
out ("Back before dark. Probably."), the System filing away a death "with
visible satisfaction. It has so few words for things that bleed," villages
voting half-rations "or the hunters go out hungry and bring back more than
hunger." What dies is villages, not characters — and they die of the same
famine in all three arms, just later in the shell arm.

## Recovery status (2026-10-18, run fleshout-b-20261018T0030Z)

This run inherited the tree from dead run fleshout-b-20261017T2320Z with
committed partial work (19/48 per-seed files on base 213fdda2) plus
uncommitted churn: staged deletions of 9 per-seed + 3 panel files and
untracked re-run outputs from a mid-rebase pass whose results contradicted
the committed ones on identical seeds (e.g. control-leadfeast-s7301:
committed "survived 182d" vs re-run "village-lost 163d") — the re-run pass
was contaminated by a base change mid-sweep and was discarded in full
(index reset, worktree checkout, untracked outputs removed; the sweep log
archived at /tmp/shellharm-recovery-archive/).

DECISION (documented): re-ran all 48 fresh on current master 47fbea56
(single consistent base; ~21s/run, ~17 min wall) rather than mixing the 19
old-base outputs with 29 new-base ones. The src/js diff 213fdda2→47fbea56
is witness/exposure/ledger/table only (no food/pantry/starvation systems),
but the discarded re-run's contradiction on identical seeds proved outputs
are not portable across bases — mixed-base aggregation would have been
dishonest. Branch rebased cleanly onto 47fbea56 first.

Proof test 15/15 green on the new base (the prior run's Part-C OOM was box
pressure). Det-gate byte-identical gates-off. The detcheck-remainder script
from the prior run was archived, not needed.
