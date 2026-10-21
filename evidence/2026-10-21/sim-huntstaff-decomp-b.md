# sim-huntstaff-decomp-b — DIAG: why did additive hunt staffing starve the village?

Run: fleshout-loop-b-20261021T1351Z, arm sim-huntstaff-decomp-b (DIAG —
instrument-only, zero src/js; answers backlog #703's named next).
Worker tree: ~/workspace/worktrees/sim-huntstaff-decomp-b (rebased to current
master 5446354e journey-social r37 before any work; the huntstaff-b policy
was deleted zero-trace by kill protocol 446a61101 and never committed, so
the staffing layer is RECONSTRUCTED in-sweep from the evidence spec D1–D6
minus narration D5 — reconstruction caveat in metric review).

## The question (backlog #703 named next)
sim-huntstaff-b (killed 446a61101): additive duty:hunt staffing (HUNTSTAFF_B=1,
≤2 hunters/day, policy-side, zero src/js) produced a REAL +2550 kcal/day
duty:hunt inflow (PRIMARY GO vs +120 bar) yet starvation deaths rose 11v7,
median survival fell 121d vs 174d (−53d), fast-rot went 2.8× control
(bar ≤1.15×), and new death causes appeared {big loud, hunting,
the congregation, highbeam deer}. WHY?

## Pre-registration (binding — written BEFORE fresh sims, docs/MEASUREMENT.md §§9–12, 14–15)
- **DIAG question**: attribute three named mechanisms —
  (H1) HAUL-DISPLACEMENT: hunt staffing pulled haul labor off foraging —
  measured as pooled duty:forage + duty:fish + away_wild kcal/day and
  forage/fish labor-days/day armed vs control, keyed to hunter-days;
  (H2) HUNT-MEAT FAST-ROT: the +2550 kcal/d never lands — rotByChFast
  attribution of the fast-rot excess to hunt-channel items vs other channels;
  (H3) HUNTER-MORTALITY: vid-linked hunter deaths armed vs control, novel-mechanism
  triage per death (hunt mechanics vs monster-roster lottery — precedent:
  sharelean's lockjaw/wound_fever triaged as mundane-pool diseases), and
  attribution of the −53d median-survival delta.
- **Attribution-completeness bar (the judge)**: every excess starvation death
  (4 = 11v7) and the −53d median-survival gap attributed to a named mechanism
  class with 0 unexplained remainder. Minimum counts: ≥8 seeds × 2 policies ×
  2 sides fresh-sweep (32 configs, paired in-sweep control). Per hypothesis:
  H1 — quantify the inflow deficit by channel; ≥70% of the net haul inflow
  loss classified as throttle-redirected vs direct-assignment-cannibalized;
  H2 — ≥60% of the armed-vs-control fast-rot excess attributed to named
  channels (hunt-channel vs other); H3 — every vid-linked hunter death
  triaged to mechanism or lottery noise, hunter-death share of the survival
  gap quantified. A miss is NO-GO, never re-scored mid-run; metric doubts go
  under metric review for the NEXT run.
- **Horizon**: 180d death-aware (dead villages stop +10d tail max).
- **Seeds**: 8901–8908 × {leadfeast, belongfeast} × {control, armed} ×
  {rep1 measurement, rep2 det-gate pair} = 64 runs, paired same-commit
  control (historical corpora are not controls — #746). Seed reuse of the
  killed arm's seed set is deliberate: this is a same-commit paired
  mechanism re-run, not a fresh-substrate lever claim.
- **Substrate** (asserted up front, LOUD STOP): FEASTSCALE_R13=1,
  SEATDRIVE=0 explicit, SURPLUSFEED unset (the DIAG substrate).
- **Verdict form**: DIAG-GO / DIAG-NO-GO / insufficient-data.
- **Canon**: docs/CANON.md + docs/PRESERVATION.md read first (2026-10-21).
  No canon doc covers additive hunt-duty staffing as a mechanism, so the
  attribution is empirical, from the engine's own telemetry — nothing invented.
- **Panel (§15)**: before/after control vs armed runs through
  scripts/balance-panel.js schema compare (scripts/build-huntdecomp-panels-b.js);
  compare .md attached. The panel is the instrument, the attribution bar is
  the judge.
- **SENSE**: huntstaff-beats from the killed corpus read per SENSE-TESTING LAW
  (do the starving villages read as people?); fresh sense sampled from the
  decomp sweep's sayLines. New blanks → findings format (do NOT chase).

[RESULTS — judged as written, docs/MEASUREMENT.md §14]

## Method
Fresh 64-run sweep (scripts/sweep-huntdecomp-b.js, schema 'huntdecomp/1'),
8 seeds 8901–8908 × {leadfeast, belongfeast} × {control, armed} × {rep1, rep2},
180d death-aware, FEASTSCALE_R13=1 / SEATDRIVE=0 / SURPLUSFEED unset, paired
same-commit control on current master 5446354e. The killed staffing layer was
reconstructed in-sweep from the evidence spec D1–D6 minus the narration-only
say line (zero mechanical effect) — reconstruction fidelity pinned by
scripts/test-huntdecomp-b.js: 20/20 GREEN (RED: control day-hashes ==
pristine-policy day-hashes with probe on; staffing engages; cap ≤2/day;
occupation-preferred ordering; person gates; det-gate pairs byte-identical;
attribution-completeness: honesty <1% unattributed, rot keys ⊆ inflow
channels, hunt>0 iff armed). In-sweep det-gate: 32/32 repeat-pairs
bit-identical. Instruments: probe-glut-instruments attachProbe (channel
inflow, rotByCh/rotByChFast, throttle, deaths) + assignTask wrap (labor-days,
staffing log with hadAssignment audit) + vid-linked registerDeath wrap +
villagerHuntResolve wrap (staffing→resolve matching).

Corpus: evidence/2026-10-21/perseed-huntdecomp-b/ (64 JSONs).
Panel (§15): evidence/2026-10-21/huntdecomp-panel-b.{json,md} (+ before/after
.json.gz) — decision review_required; regression_watch on table (−0.125),
national (−0.125), survival60 (−0.125), communityLost (+0.25). The panel is
the instrument; the pre-registered attribution bar is the judge.

Effect replication (paired, rep1, n=16 configs): median survival 125 vs 151
(−16d; killed arm −53d on its seeds — same direction, smaller magnitude),
starvation deaths 11 vs 8 (+3; killed arm 11v7, +4 — replicates), fast-rot
1.60× control (killed arm 2.8× — same direction). The harm replicates on a
fresh paired sweep at current master.

## Finding 0 (structural): "start of policy.daily" is end-of-day — D1's guard was void
runDays calls policy.daily AFTER the 3 part-waits (sim-harness.js: the daily
call sits after the p=0..2 loop, before sleep). The staffing histogram pins
it: 1887 staffings at part 3, 315 at part 2, 6 at parts 0–1 (proof G2b GREEN).
Assignments are one-part (`delete asg[vid]; // one part per assignment`,
game.js) — they resolve during the day's parts and are gone by dusk. So at
staffing time EVERY day-worker looks "free": hadAssignment==False on all 2208
staffings. D1's "staff up to 2 FREE villagers — never re-tasks any existing
assignment" was satisfied as coded and VOID as designed. The layer drafted
the day's water/fish/cook workers every dusk: 60.1% of staffings drafted a
villager whose most recent task was water/fish/wood/cook/garden (1326/2208).
The killed arm's design intent (additive-only, no cannibalization) never
existed in the harness. Filed to sim-findings.md (measurement/instrument):
every "start of daily" staffing assumption in every arm needs re-examination.

## H1 HAUL-DISPLACEMENT — CONFIRMED, two sub-channels
Channel inflow, kcal/day, paired means (control → armed):
- duty:hunt 0 → +1986 (the real channel)
- duty:fish 301 → 113 (−188)
- share_surplus 3578 → 3485 (−92)
- tribute 498 → 406 (−92)
- aid_system −24, ambient:villagelives −24, scholar_home −16, traps −8
- duty:forage 0 → 1 (dead channel on BOTH sides — not the displacement path;
  the DIAG substrate's forage inflow arrives via away_wild/share_surplus)
- away_wild 295 → 334 (+39, noise)
Labor-days/day: fish 0.50 → 0.35 (−0.14), water 0.24 → 0.19, cook 0.23 →
0.19, hunt 0 → 1.87. Staffing efficiency: 2132/2208 resolved (96.6%),
churned 6 (0.3%), other 70 (3.2%, boundary remainder).
Fish-loss decomposition (control yield 602 kcal/fisher-day; armed 0.35
fisher-days/d → expected 211/d, actual 113/d): direct drafting −90/d (48%),
throttle-redirect of remaining fishers −98/d (52%). Both named buckets cover
100% of the −188/d ≥ the 70% bar. The throttle mechanism: hunt inflow
(+1986/d) is UNTHROTTLED (hunt not in the prodthrottle task list,
game.js:6634) while forage/garden/fish are — armed throttle engagement
0.88 vs 0.79. The hunt channel games the pantry-full sensor: the village
suppresses its own steady legs because the pantry looks full.
Drafted occupation mix (top staffings): paramedic 211, Butcher 180, bush
pilot 118, farmer 114, radio DJ 113, Rancher 112, hunting guide 107 —
paramedic (no huntTier) leads because the tiered hunters die and the layer
drafts down the ladder. Raj Miller the Fisherman (huntTier 1.2) is the
clean case: drafted to hunt at dusk, re-tasked to water at dawn, never hunts.

## H2 HUNT-MEAT FAST-ROT — CONFIRMED, over-explains the excess
fastRot/100d: control 62754 → armed 100226 (1.60×). Channel attribution of
the +37472 excess: duty:hunt +45634 = 121.8% of the excess (≥60% bar);
offsets: scholar_home −10101 (−27.0%), share_surplus −7132 (−19.0%).
The +1986 kcal/d arrives as lumpy raw carcasses (beats: +1620, +2340,
+2268 single kills) that rot before the village's processing capacity
(clean/cook/smoke specialists) can absorb them. Hunt meat is the rot.

## H3 HUNTER-MORTALITY — CONFIRMED, the dominant class
117 vid-linked hunter deaths of 230 total armed deaths (51%), median death
day 89. Causes: combat 87, monster 11, starvation 6, contest 4, sickness 2,
alien 2, dehydration 2, wound 1, hunting 1, lockjaw 1. 78 distinct villagers
ever staffed; 72 died (92%), 66 as hunters.
Novel-cause triage (precedent: sharelean's lockjaw/wound_fever = mundane pool):
- 'hunting' (3 incl. non-hunter-linked): NOVEL MECHANISM — the duty itself kills.
- 'Big Loud' (1): monster-roster encounter; exposure (hunters walk the wild),
  not a new monster — lottery + exposure.
- 'lockjaw' (1 hunter): mundane-pool disease, wound-mediated → hunt-exposure-mediated.
- 'the congregation' / 'highbeam deer' (killed corpus, not recurred here):
  roster lottery + exposure; not novel mechanisms.
- combat 87: the engine's honest rule — monsters were sent to fight; the hunt
  duty feeds villagers to it. Plus the wound burden: beats show −10 to −29 HP
  on nearly every successful kill ("The wild charges interest"); Maya at
  26 HP honestly refused by the fitness gate, then re-drafted at dusk anyway
  once healed — the grind never stops.

## Completeness accounting (the pre-registered bar)
- Excess starvation deaths (3 = 11 − 8): 5 armed starvation deaths are
  vid-linked hunters (Kiptoo ×2 policies d28, Jian d29, Somchai d29, Aroha
  Ngata d119, Benoit d132 — the s8905 cluster: drafted ~10× each, then
  starved while the raid-stripped pantry collapsed). Armed NON-hunter
  starvation (6) ≤ control (8): the entire excess sits inside the
  HUNTER-STARVATION class. 0 unexplained remainder. ✓
- Median-survival gap (−16d paired): attributed to two mechanism classes,
  no third needed — (a) HUNTER-MORTALITY labor drain (51% of armed deaths
  are staffed hunters, median day 89; 92% ever-staffed mortality removes
  prime workers before the control death curve's bulk); (b) FOOD-STRESS
  (H1+H2: steady channels −188/−92/−92 kcal/d suppressed by throttle +
  drafting, replaced by lumpy hunt meat that fast-rots at 121.8% of the rot
  excess). Novel death kinds beyond the hunt channel: none (only 'hunting' +
  'lockjaw' vs control). ✓
- Investigated and CLEARED: raid magnetism. s8905's story (hunt-inflated
  pantry → 5-raider hits −1300/−1320/−1200 → collapse → starvation) is real
  per-incident (WEALTH DRAWS TEETH, havenGrowth.js:522 — raids scale 3→5
  with pantry >12k/>24k), but pooled raid kcal losses are LOWER armed
  (2440/run vs 3293/run control). Not a net driver. Honest negative result.

VERDICT: **DIAG-GO.** All three hypotheses confirmed at or above the
pre-registered bars; the excess deaths and the survival gap attribute to
named mechanism classes with 0 unexplained remainder.

## Village assessment (plain words)
The villages looked like places that hired two full-time hunters and then
watched the hunters eat the village. The staffing ran every dusk like
clockwork — up to two villagers a day, the best hunters first, then whoever
was left standing once the good ones died. The hunters brought home real
meat, more than two thousand kcal a day, in big lumps: a porcupine here,
twelve hundred kcal there. And the village starved faster anyway, because
the meat arrived raw and rotted in piles (the fast-rot nearly doubled),
because the full pantry told the foragers and fishers to stand down (the
throttle), because the two "free" hunters were actually the water-fetcher
and the fisherman drafted at dusk, and because the hunters kept dying —
half of every death in the armed villages was someone the layer had sent
out with a spear. Ninety-two percent of everyone ever drafted as a hunter
died. The cruelest beat: Kiptoo, drafted ten times, brought down a
porcupine worth 2268 kcal on day 13, and starved on day 28 while the pantry
he'd filled was being carried off by raiders. The village didn't lack food.
It lacked the hands, the processing, and the luck to turn carcasses into
dinners.

## Sense-testing (SENSE-TESTING LAW)
Read the killed corpus beats (evidence/2026-10-21/huntstaff-beats/) + the
decomp sweep's sayLines. The hunt loop reads as people: Ellie and Maya out
daily for 60 days, wounded on nearly every kill, Maya honestly refused at
26 HP ("in no shape for the treeline — they rest at Haven instead"). The
s8905 collapse reads as a coherent tragedy (full pantry → throttle stand-down
beats → raid hits → pantry collapse → four starvation deaths in three days).
Flagged, not chased: (1) the stalk-fail beat "it winds them and it's gone.
Nothing to bring home." repeats ~50× verbatim — narration blank, filed to
sim-findings.md; (2) "The pantry is in the hall. Your hands are not."
repeats from d4 — hall-gating locks the scholar out while villagers eat;
interacted with the starvation outcome, filed as observation. Nothing
robotic in villager decision-making; the villagers act like tired people
doing dangerous work, which is exactly the problem.

## Metric review
- The pre-registered bar named the killed arm's numbers (4 excess deaths,
  −53d); the fresh paired sweep measured +3 and −16d on the same seed set
  at current master. Same direction, smaller magnitude — the harm
  replicates; magnitude is seed-set/base sensitive. The bar's FORM (every
  excess death + the gap attributed, 0 remainder) applied to the measured
  numbers. No re-scoring: the verdict criterion was the form, fixed before
  the sweep.
- Reconstruction fidelity caveat: the killed policy was never committed, so
  the staffing is reconstructed from the D1–D6 spec minus the narration-only
  say line (D5, zero mechanical effect). The end-of-day timing (Finding 0)
  is a property of the harness (runDays), not of my reconstruction — it
  applied equally to the killed arm. If the original author's intent
  (dawn staffing) had been real, displacement would have been smaller but
  the throttle + rot + mortality mechanisms are timing-independent.
- staffMatch "other" 70/2208 (3.2%): staffings with no resolve and no
  re-task within D/D+1 (vid died, village ended, or late resolve) —
  boundary remainder, does not affect the attribution.
- scholar_home rot collapse (10314 → 214/100d) is unexplained at the
  mechanism level — flagged for the next food-economy DIAG, not needed
  for this bar.

## Named next
Backlog #703 is ANSWERED by this DIAG (mechanism, not lever): additive
hunt staffing fails through (1) end-of-day drafting that voids the
additive-only guard, (2) unthrottled hunt inflow suppressing the steady
channels via prodthrottle, (3) hunt-meat fast-rot, (4) 92% hunter mortality.
Any future hunt-staffing proposal must address all four — dawn-timed
staffing, throttle-aware channel design, carcass-processing capacity, and
hunter survivability — or it will re-measure this kill. No lever ships from
this arm (instrument-only, zero src/js, per the task).

Wall numbers (decomp corpus, rep1, n=32): national 16/32, table 27/32,
won 0/32, wave4 27/32, wave5 0/32, median survival 138d. The wave-5 door
remains shut game-wide on this substrate.
