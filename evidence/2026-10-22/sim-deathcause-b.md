# sim-deathcause-b — death-cause census + starvation-channel attribution (DIAG, instrument-only)

Run: fleshout-loop-b, arm sim-deathcause-b (the explicit named next of run
fleshout-loop-b-20261022T1530Z's sim-surpluskeep2-b... and of the lineage:
sim-surpluskeep-diag-b → sim-surpluskeep2-b → [named next: death-cause
census] → sim-deathcensus-b (10-21, ran it) → THIS arm). DIAGNOSTIC — no
lever, no landing, instrument-only, ZERO src/js changes, zero policy edits.
Worker tree: ~/workspace/worktrees/sim-deathcause-b.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the census)

- **Question 1 (the named next)**: on the 180d non-seat substrate, 7/8 armed
  leadfeast villages in sim-surpluskeep2-b died d106-150 with nationalLive
  still true — villages starve with loyal subordinates. Attribute EVERY
  villager death (cause, day, pantry kcal at death, realm state, days-hungry
  before death, who ate what). sim-deathcensus-b (2026-10-21, loop B) ran
  the same substrate design (16 runs, seeds 66041–66048) and closed the
  proximate-cause question at 100% named / 0 unexplained — its instrument is
  REUSED here, but the substrate has MOVED since: SURPLUSFEED is REMOVED
  (Steve 2026-10-21: "take it off") and depositgate + plentydepri are
  LANDED (2026-10-22) — both behavioral food-economy code that directly
  touches inflow/distribution. So: 16 FRESH seeds (66049–66056, freshness
  asserted inline in the sweep) × {leadfeast, belongfeast} = 16 runs,
  180d death-aware (dead villages stop; harness loop ends on Game.over),
  env FEASTSCALE_R13=1/SEATDRIVE=0, on the worktree's commit. Plus the
  NEW fields the prior census lacked: days-hungry before death per
  deceased, who-ate-what per deceased (trailing-14d meal rows), and the
  starvation channels.
- **Question 2 (the explicit second named question)**: the feast verb was
  EXONERATED as the starvation channel (sim-fragilityfeast-b KILLED-AT-PILOT,
  evidence/2026-10-19/sim-fragilityfeast-b.md: starvation rose 0→3 with
  fragility gates working and feasts taxed 79→32) — so WHERE does the
  hunger come from? Attribute every starvation death to CHANNELS:
  inflow-failure? distribution (food existed, didn't reach them —
  trust-gated hoarding, depositgate-eased shares)? rot? homecoming-pool
  timing (scholar away, haul arrives late / kept for the road)? scholar
  eating from the haul?
- **Design**: the proven deathcensus instrument
  (scripts/deathcensus-instrument-20261021.js — 75/75 green, REUSED
  unchanged) rides on every run, PLUS the new starvation-channel
  instrument (scripts/starvechan-instrument-b.js): per-day per-villager
  meal rows (ate, drawn, gave, fasting, away, produced, expected, need),
  dawn rot scans (spoiled kcal in pantry + spoiled-eaten via drawSpoiled),
  depositPantryPieces source tags (homecoming window vs other), the
  scholar's villageMeal draw, and scholar at-haven per day. All wraps are
  call-through with pure reads in the gaps — zero game-state writes, zero
  RNG draws, zero src/js changes.
  Per-seed JSONs in evidence/2026-10-22/perseed-deathcause-b/.
- **PRIMARY (DIAG-GO)**: (a) ≥95% of person deaths attributed to named
  proximate causes (the deathcensus taxonomy), 0 unexplained; AND
  (b) ≥95% of starvation deaths attributed to a named STARVATION CHANNEL
  (primary channel per the taxonomy below), 0 channel-unattributed.
- **Starvation-channel taxonomy (pre-registered, evaluated per starvation
  death on its trailing-14d window)** — each death gets {primary, flags}
  where flags is every channel whose boolean holds, primary by precedence:
  1. `rot`: trailing rot-lost (first-sight spoiled kcal) ≥ 20% of trailing
     inflow (produced + deposits) AND pantry at death < 5,000.
  2. `distribution`: the deceased's trailing ate/need < 0.6 while the
     trailing village mean ate/need ≥ 0.9 OR pantry at death ≥ 15,000 —
     food was in the village but didn't reach this person (trust-gated
     hoarding, eased shares kept by producers).
  3. `homecoming-timing`: scholar away ≥ 10 of the trailing 14 days AND
     (a homecoming deposit ≥ 5,000 kcal arrived within 3 days after the
     death OR the scholar kept ≥ 4,000 kcal while the village hungry-day
     counter was nonzero).
  4. `scholar-from-haul`: scholar away ≥ 7 of trailing 14 days AND the
     scholar's trailing ate/need ≥ 1.0 while the deceased's trailing
     ate/need < 0.6 — the scholar ate while the village starved.
  5. `inflow-failure`: trailing inflow (Σ produced + Σ deposits) < 0.9 ×
     trailing need AND pantry at death < 5,000 — the village simply didn't
     bring in food.
  6. `unattributed`: none of the above (honest — counts against bar (b)).
- **SECONDARY (report-only)**: wall numbers (national/table/wins, wave-4/5,
  median survival), d100–150 cluster reproduction, pantry-crash anatomy,
  national-live-at-death share, depositgate/plentydepri voice sanity (no
  new silent actions — the arms landed with narration; confirm no unvoiced
  refusal strands food).
- **Verdict classes**: DIAG-GO (instrument proves out, ≥95% named,
  starvation channels attributed), DIAG-insufficient-data (<4 starvation
  deaths — the channels can't be judged; report-only), or NO-GO
  (instrument fails gates or attribution falls short).
- **Instrument proof** (pre-registered, scripts/test-deathcause-b.js):
  (a) RED: pristine runs carry no starvechan instrument state; meal rows
  empty, rot tallies zero; (b) GREEN: 40d armed run records non-empty meal
  rows (one per villager per day), rot scan non-empty when rot exists,
  deposit tags split homecoming vs other, scholar meal captured, villageMeal
  at-haven recorded; (c) DET: instrumented (deathcensus + starvechan) vs
  pristine canonical projection byte-identical on 2 seeds × 60d (all wraps
  RNG-clean); (d) REPEAT: same seed twice byte-identical incl. meal rows;
  (e) channel-classifier fixtures: synthetic starvation deaths exercise
  every channel + unattributed + precedence ordering.

## Canon

- docs/CANON.md read first. docs/DISEASES.md (disease-death cause
  vocabulary — the two-pool law; the classifier names the disease string
  the engine recorded, per the deathcensus instrument's canon section),
  docs/BEAR.md (trichinosis: only 'cooked' clears it; smoking doesn't —
  relevant to rot/desparation eating of smoked bear), docs/PRESERVATION.md
  (the food ladder; "rot can't be smoked back into food"), docs/MONSTER-WAVES.md
  (monster-death taxonomy; combat-readiness bars — waves 4-5 are the sharp
  end of combat deaths). **No canon doc covers village death / village-loss
  triggers** — the three trigger sites are code-grounded from src/js (per
  sim-deathcensus-b's canon section: game.js scattering path, game.js
  extinction path, ledger.js succession path) — captured verbatim from the
  engine's say stream, never templated.
- The channel taxonomy is an INSTRUMENT, not canon: it measures the engine's
  food flows (villageEats → villagerMealDay per-person draws, pantryDraw,
  stockSurplus, depositPantryPieces homecoming split, hurtFromStarvation)
  as the code implements them. Steve's replacement direction for the
  removed SURPLUSFEED is behavioral/bottom-up ("villagers deprioritize
  PRODUCTION and STORAGE when food is plentiful" — the production decision,
  not a post-hoc trim) — depositgate-b2 (landed 2026-10-22) implements the
  storage half (funnel.share easing when plentiful, homecoming keep
  2000→6000) and plentydepri-b (landed 2026-10-22) the production half.
  This census measures against THAT substrate.

## Proof results (pre-sweep — all green, 2026-10-22)

scripts/test-deathcause-b.js: **32/32 GREEN** (run with FEASTSCALE_R13=1
SEATDRIVE=0 per the Usage header — ENV TRAP honored).

- RED (pristine): no starvechan markers on the pristine Game; install wraps
  all 6 wrapped methods; uninstall restores all 6 to the ORIGINAL function
  references (=== — the store-original fix); instrument consumes 0
  Math.random calls (comment-stripped check) and performs 0 game-state
  writes (assignment-only check).
- GREEN (40d armed, seed 66202): meal rows non-empty (>100, spanning ≥20
  days, schema-valid), haven-day rows ≥20, rot scans ≥20, scholar meal rows
  >0, deposit schema valid, 0 starvechan errors, 0 deathcensus errors, the
  reused deathcensus instrument still unexplained=0.
- DET (2 seeds × 60d): instrumented (deathcensus + starvechan) vs pristine
  canonical outcome fields byte-identical (all wraps RNG-clean,
  read-only, behavior-neutral).
- REPEAT: same seed twice byte-identical incl. meal rows, deposits,
  homecomings, scholar meals, rotLostByDay, rotEaten, and the starv
  enrichment payload.
- Classifier fixtures: every channel fires (distribution, inflow-failure,
  rot, homecoming-timing, scholar-from-haul, unattributed); precedence
  verified (rot > inflow-failure; scholar-from-haul > inflow-failure);
  days-below-60 counts honestly on synthetic rows.

## Sweep results (16/16, seeds 66049–66056 × {leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, anchor cd68e6dd3)

Wall (n=16): won 0/16, national(end) 5/16, national(ever) 15/16, table
14/16, wave4 14/16, wave5 0/16, exiled 0/16, median 172d, max 181d.
Losses: 9 village-lost (scattering 6, succession 3 — no extinction path),
7 survived to the 180d horizon. The d100–150 cluster REPRODUCES: 6/9
losses fall in d100–150 (loss days: 66, 108, 120, 123, 143, 160, 162,
172; median 123d). national-live-at-loss: 1/9 (11%) — lower than the
surpluskeep2-b/deathcensus-b signal, but the corpus still shows the
realm outliving the village (s66052-leadfeast scattered d123 with
nationalLive true; a subordinate offered 2,266 kcal aid the day before
the walk — the realm was alive while the village left).

**PRIMARY (a) — DIAG-GO**: 233 person deaths, 233 named (100.0%),
unexplained 0. Bar was ≥95% / 0 unexplained.

**PRIMARY (b) — NO-GO**: 13 starvation deaths, 5 to a named channel
(38.5%), 8 unattributed. Bar was ≥95%. Per §14 a miss is NO-GO — never
re-scored. Root cause below: the pre-registered taxonomy missed the
corpus's dominant starvation pattern (trail-starvation + wound
compounding), it is not an instrument failure — every one of the 8 has a
complete meal history and a characterizable story.

Death-cause shares (n=233): combat 179 (76.8%), starvation 13 (5.6%),
other 11 (4.7%), sickness 11 (4.7%), wound 9 (3.9%), dehydration 5
(2.1%), contest 5 (2.1%). combat-unknown 7 (family-level only — the #788
hurtVillager threading gap, still open). Per policy: leadfeast 127
deaths, belongfeast 106.

## Channel attribution — where the hunger comes from

The 13 starvation deaths decompose into three fully-characterized
shapes. (All numbers from trailing-14d windows; "coverage" = ate/need;
ownEat ≈ ate − drawn; the pantry equation uses the engine's own flows.)

**Shape 1 — inflow-failure famine (5/13, all s66050-leadfeast, d43–65).
Channel fired as pre-registered.** The village produced 0.71–0.81× of
need for two straight weeks (prod 128–199k vs need 158–268k per 14d);
village coverage 0.70–0.75; pantry 6,000→0; the village scattered d66.
The deceased's own rows show the famine honestly (Zihao: below60 8/15d,
ownEat 641/d, pantry draw 563/d, prod 700/d). This is the genuine
famine: the village didn't bring in food. Note the transcript: Zihao
was at 2 HP from wounds on d41/d43 ("🩹 Zihao is still hurting (2 HP) —
no healer at haven") and Laura at 11 HP d65 — even the famine deaths
are last-hit-on-wounded in the sampled beats.

**Shape 2 — trail-starvation (6/13). The taxonomy miss.** Theo (belong
s66050 d29), Juan ×2 (belong+lead s66053 d8 — the SAME villager, same
seed, byte-identical meal rows on both policies: the early expedition
death is seed-determined, policy-independent), Irving (belong s66053
d21), Zinaida (belong s66053 d36), Kenneth (belong s66050 d143).
Signature: away-majority windows (6–15/15 away days), expedition
production CLIFFS (Theo 4640→293, Zinaida 2756→769, Irving 2085→382,
Juan 2130→453 kcal/day — 80–95% overnight collapses, not gradual
depletion), pack-buffer draws of 700–1,000/d against ~2,000 need, and
the village pantry AMPLE at death (8,604 / 16,900 / 8,860 / 10,774 —
full). Mean coverage looks fine (0.76–0.92) because the killing is in
the SPIKES: 1–6 below-60% days at the end of the window, each firing
the engine's 8-damage starvation branch. The food was at the fire; the
villager was on the trail. The village cannot feed someone who isn't
there — and the expedition didn't come home when production collapsed.
Wound compounding is transcript-confirmed in 2/6: Zinaida was mauled by
The Inspiration (−12) the same day she died; Kenneth was mauled by The
Big Beast (−85) on the scattering day. The arithmetic demands prior
damage in all 6 (≤48 starvation-path damage in-window vs 100 HP).

**Shape 3 — pantry-crash on ~100% production (2/13).** Somchai (belong
s66050 d135), Ingrid (belong s66050 d141). The village produced
0.98–1.03× of need in the trailing window and coverage was 0.80–0.84 —
yet the pantry crashed (5,350→~1,000; 4,450→500) and both died with
drawn≈0 on their final days (ate 26/29, prod 26/29 — they produced
nothing and drew nothing). The pantry equation for these windows:
IN = trust-gated shared surplus only (44.7k/31.6k per 14d — ~20% of
production; the other ~80% is ownEat, never pooled); OUT = villager
top-up draws (14.7k/15.2k) + THE SCHOLAR'S PANTRY MEALS (22.9k/22.3k —
the scholar draws a full ~2,000–2,200 kcal/day from the pooled surplus;
51–70% of everything the village shared) + unmeasured rot. The pool
drains while the village "produces enough" because production is
privatized at the source and the pool carries fixed costs. (Caveat: the
final-day drawn=0 with 500–1,000 kcal still in the pantry is
unexplained — possibly an all-spoiled pantry; the rot sensor's phase
bug (see Metric review) blocks confirmation. Filed as an open
question, not a claim.)

**The scholar finding**: across all 13 windows the scholar drew
5,172–28,218 kcal from the pantry per 14d (one full trust-scaled
villageMeal daily when at haven). The scholar is the pooled pantry's
largest single customer — on thin-surplus villages, 50–91% of the
shared surplus. The brief's candidate "scholar eating from the haul"
never fired as a channel (0/13): the scholar's pack-keep is not the
hunger vector; the scholar's PANTRY MEAL is. "Homecoming-timing" also
never fired (0/13). "Rot" never fired — the sensor was phase-broken
(see Metric review), so this is instrument silence, not evidence of
absence.

**The answer to the second named question** ("the feast verb is
exonerated — where does the hunger come from?"): it comes from three
places, none of them the feast — (1) genuine village-wide production
shortfalls (the s66050-leadfeast famine, 5/13); (2) expeditions whose
production collapses while the villager stays on the trail, with the
pack as the only buffer and the full village pantry unreachable (6/13);
(3) the pooled pantry draining under fixed costs (scholar's full daily
meal + top-ups + rot) while only the trust-gated surplus ever pools
(2/13). Plus the cross-cutting amplifier: starvation is frequently the
LAST HIT on wound-weakened villagers (transcript-confirmed maulings
−12/−85 same-day, 2-HP/11-HP hurting beats), so the "starvation" cause
overstates hunger's solo share.

## Balanced panel (§15)

Not applicable by design: this is a single-substrate DIAG census (no
treatment arm, no before/after). §15 governs before/after comparisons
through the balanced panel; there is no comparison here. The corpus is
the instrument output itself (16 per-seed JSONs are the panel-equivalent
raw record). No panel file produced; this section documents the §15
consideration as the methodology requires. (Same standing as
sim-deathcensus-b.)

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read the death-day and loss-day say lines for the starvation deaths and
the d100–150 losses:

- The starvation beats are voiced and distinct: "💀 Theo starved.
  Slowly. The talk dies fast around the fire. Nobody has the words
  yet." / "💀 Zinaida starved. Slowly. Somebody's sleeping-roll stays
  rolled out. Nobody puts it away." / "💀 Theo starved. Slowly. The
  talk dies fast around the fire." — plus the crisis beat "◈ CRISIS —
  THE FIRST GRAVE. Theo is dead. The village digs its first grave, and
  everyone understands at once: this place can kill you. It just did."
  The deaths read as tragedy, not engine output. SENSE-PASS.
- The wound compounding is IN the transcript, not inferred: "🩸 The
  Inspiration mauled Zinaida (−12 health) over 1 round." the day she
  starved; "🩸 The Big Beast mauled Kenneth (−85 health) over 2
  rounds." on the scattering day; "🩹 Zihao is still hurting (2 HP) —
  no healer at haven. They rest today instead of ranging out." The
  engine narrates the setup honestly. SENSE-PASS.
- The loss beats read as literature: "Haven couldn't hold. On the
  third hungry day, people started walking — in different directions.
  The scattering, again." — preceded by the village VOTING on relief
  ("Half rations for three days, voted and held — or a hard hunt now,
  hungry...") and a subordinate arriving unprompted: "🛟 Kenji of
  Thornfield walks into Haven unannounced, pack-mules behind. 'Heard
  your bins are echoing. Thornfield has grain to spare — 2,266 kcal,
  no tribute, no ceremony. Say the word.'" The realm was alive and
  generous while the village walked. SENSE-PASS — this is the
  starve-with-loyal-subordinates story the arm was named for.
- The succession beat holds: "No one is left to pick up the Codex. The
  village dies out — quietly, the way villages do. The season ends
  here." SENSE-PASS.
- Rot is voiced in-game ("Overnight, White Oak Acorns (in shell) went
  bad — beyond saving. You leave it for the flies." / "Fresh food
  keeps days, not weeks. Smoke it over a fire to make it last.") — the
  instrument's zero-rot reading is a sensor phase bug, not an engine
  absence. Noted, not chased.
- No robotic repetition in the death/loss beats. The Juan×2 case (same
  villager, same seed, byte-identical meal rows, both policies) is
  determinism, not a bug — the early expedition death is
  seed-determined.

## Metric review (§14)

1. **PRIMARY (b) missed: 5/13 (38.5%) vs the ≥95% bar → NO-GO, not
   re-scored.** The miss is a TAXONOMY miss, not an instrument failure:
   the pre-registered channel list (rot/distribution/homecoming-timing/
   scholar-from-haul/inflow-failure) had no name for the corpus's
   dominant pattern — trail-starvation (away + production cliff + pack
   buffer, 6/13) — and no name for wound-compounded starvation (the
   last-hit amplifier, transcript-confirmed in 4/13). The instrument
   captured everything needed to characterize all 13; the names were
   incomplete. Per §14 the bar binds as written: NO-GO.
2. **PRIMARY (a) passed: 233/233 named (100.0%), 0 unexplained →
   DIAG-GO.** The census question is closed on this substrate.
3. **Mean-coverage vs spike**: the distribution/inflow rules keyed off
   trailing-MEAN coverage, but the killing happens in below-60% SPIKES
   (each firing the engine's 8-damage branch). A villager at 0.92 mean
   coverage can still die of hunger. The next taxonomy must key
   channels off below-60-day counts and their context (away? pantry
   state that day?), not means.
4. **Rot sensor phase bug (instrument)**: the dawn rot scan runs AFTER
   the engine's sleep, but sweepSpoiled() discards rot INSIDE the dawn
   sequence (game.js:30900) — the sensor raced the sweep and read 0
   across 16 runs while the game narrates rot ("White Oak Acorns went
   bad"). The rot channel boolean could never fire: instrument silence,
   not evidence. Fix for the next run: wrap Game.sweepSpoiled
   (before-call scan, the fragilityfeast measure's phase), not the
   dawn pantry.
5. **Pantry-at-death join**: the dawn series has gap days (sleep doesn't
   fire every game day); deaths on gap days got panAtDeath=null. The
   analysis used nearest-dawn ≤ death-day join. The classifier should
   do the same (currently exact-day join).
6. **The `drawn` field conflates pantry and pack draws** (away
   villagers draw from pack). Pantry-equation work must split them —
   the instrument has the away flag per row, so this is an analyzer
   fix, not a re-run.
7. **Depositgate-eased intake is unmeasured**: on engaged days the
   eased share is real intake but my coverage uses ate (=ownEat+drawn),
   understating true intake. The #798 probe found victims ate ~50% of
   per-capita eased mean, so the bias is small — but the next
   instrument should read v._depositGate.days for per-vid eased kcal.
8. **What would change this verdict**: a re-run with the extended
   taxonomy (trail-starvation: away-majority window + production
   cliff + pack draws; wound-compounded: wound-beat or hurting-beat
   within 3d of death; net-based inflow-failure: inflow < outflows
   over the window) + the sweepSpoiled-phase rot sensor. The corpus
   already contains the meal rows to develop the classifier offline;
   only the rot sensor needs a fresh sweep.

## Village assessment

Sixteen villages on the current master (SURPLUSFEED gone, depositgate +
plentydepri live). Nine died, seven lived to the horizon. The deaths
came in the familiar shapes — scattering when the pantry hit zero
(6), succession when the scholar fell with no heir (3) — and the
d100–150 cluster reproduced (6/9 losses, median 123d).

**Who thrived**: villages that kept their expeditions' production
alive and their scholars home. s66049-leadfeast and s66054-leadfeast
survived 180d with national + table; their pantries never hit the
floor because production stayed above need AND the pooled surplus
covered the scholar's meals.

**Who died and why**: s66050-leadfeast is the textbook famine —
production ran at 70–80% of need for a month, the pantry bled
6,000→0, five villagers starved d43–65 (two of them already at 2/11
HP from wounds), and the village walked d66. The belong-road deaths
are the subtler story: villages producing ~100% of need whose
pantries still crashed, because only ~20% of production ever pools
(the rest is ownEat) while the scholar alone draws ~2,000/day from
the pool — plus expeditions that stayed out too long after their
patches collapsed. Nobody died of the feast. Nobody died of the
trim (it's gone). They died of empty trails and thin pools.

**What was missing**: (1) expedition recall — no mechanism brings a
villager home when trail production collapses; the pack is the only
buffer and it runs dry in days; (2) pool thickness — the trust-gated
surplus share is too thin to carry the scholar's fixed daily draw +
top-ups + rot when production ≈ need; (3) wound care — "no healer at
haven" while 2-HP villagers rest instead of ranging, then starve.

**Blanks filled**: the d100–150 cluster's hunger question is answered
— the feast verb is exonerated (again), the hunger comes from
inflow-failure famine (5/13), trail-starvation (6/13), and thin-pool
drain (2/13), with wound-compounding as the cross-cutting amplifier.
**Blanks documented**: the trail-starvation channel (needs a named
next with the extended taxonomy); the rot sensor phase bug; the
drawn=0 final-day mystery (Somchai/Ingrid); the scholar-as-largest-
pantry-customer measurement (50–91% of pooled surplus).

## Convergence state

**NO-GO on the pre-registered (b) bar — taxonomy miss, root-caused,
not an instrument failure.** 233/233 person deaths to named proximate
causes (100.0%, 0 unexplained) — the census DIAG-GO'd. 5/13 starvation
deaths to named channels (38.5% vs ≥95%) — the channel taxonomy missed
trail-starvation and wound-compounding; every one of the 8 has a
complete meal history and a characterized story. The hunger question
the arm was named for is ANSWERED: inflow-failure famine, expedition
trail-starvation with production cliffs, and thin-pool drain under the
scholar's fixed daily draw — none of it the feast. food-economy stays
converging; the wall is unmoved (wins 0/16, wave-5 0/16). Named nexts:
(1) re-run the census with the extended taxonomy (trail-starvation,
wound-compounded, net-based inflow-failure) + sweepSpoiled-phase rot
sensor — the meal-row corpus already exists to develop the classifier
offline; (2) the expedition-recall blank (who brings a villager home
when trail production collapses?) is a design question, possibly a
steve-call; (3) the thin-pool finding (scholar = 50–91% of pooled
surplus) belongs in the replacement-direction evidence — the
behavioral deprioritization of storage needs a pool-thickness theory.

## Telemetry note

Telemetry deviation check is the coordinator's step (per the run
body §10); the corpus for it is evidence/2026-10-22/perseed-
deathcause-b/ (16 per-seed JSONs + _summary.json), anchor cd68e6dd3,
substrate FEASTSCALE_R13=1/SEATDRIVE=0. Not run by this arm.
