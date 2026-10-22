# sim-recalldiag-b — expedition-recall trigger DIAG (backlog #815 named next, OFFLINE)

Run: fleshout-loop-b, arm sim-recalldiag-b (the explicit named next of loop-B
arm sim-trailstarve-b, run fleshout-loop-b-20261022T1830Z,
evidence/2026-10-22/sim-trailstarve-b.md + trailstarve-census-b.json — BOTH
READ). DIAGNOSTIC — no lever, no landing, instrument-only, ZERO src/js
changes, ZERO policy edits, ZERO new sims, ZERO lever design commitment (the
recall mechanism design is steve-call-sized — this arm delivers the trigger's
evidence, not the mechanism). Worker tree:
~/workspace/worktrees/sim-recalldiag-b. Base: master 8720dc2c7 (verified via
git rev-parse HEAD).

The finding it diagnoses: 5/13 starvation deaths are trail-starvation —
away-villagers whose expedition production CLIFFED 80-95% overnight (cliff
ratios ~0.08-0.26) while they stayed on the trail, pack draws 700-1000/d vs
~2000 need, village pantry AMPLE at death (8.6k-33k). No mechanism recalls a
villager when trail production collapses.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the judged analysis run)

- **Question**: develop the expedition-recall trigger rule OFFLINE against
  the existing corpus (evidence/2026-10-22/perseed-deathcause-b/ 16 per-seed
  JSONs + trailstarve-census-b.json): a code-grounded,
  triggerable-from-engine-state rule. Measure per-case lead time (how many
  days before death the trigger would have fired, case by case), the
  false-positive rate on surviving runs, and build the wound-beat retainer
  (backlog #818) so the next census names wound-compounding.
- **RECALL-TRIGGER v1** (per villager-day d; engine-state grounding in
  parentheses). FIRE iff ALL hold:
  1. away[d] is true (engine: villager location == expedition/trail —
     meal-row `away`, the engine's own away flag)
  2. away-majority: ≥4 of the last 7 calendar days (d-6..d, fewer when
     d<7) are away-days (engine: expedition in progress, not a day trip)
  3. production cliff: produced[d] ≤ 0.40 × mean(produced over the trailing
     7 away-days before d), requiring ≥3 away-days in the baseline AND
     baseline mean ≥ 800 kcal/d (engine: the expedition's recent daily
     yields collapse ≥60% — the trailstarve "cliff"; the engine's own
     `expected` patch-yield forecast collapses the same day, corroborating
     that the signal is engine-visible, not instrument-invented)
  4. pack-draw dependence: drawn[d] ≥ 0.30 × need[d] (engine: the villager
     is drawing from pack — the trailstarve evidence established that
     away-rows' `drawn` are pack draws)
  5. (Rule B only) ample pantry: pantryKcal[d] ≥ 5000 at the home village
     (engine: village pantry — the "food is at the fire" condition; KNOWLEDGE
     CAVEAT: the away villager cannot see the pantry — Rule B is only
     evaluable by an omniscient trigger (the System), not by the villager.
     Rule A (conditions 1–4) is villager-knowable. Both are measured.)
- **Lead time** (per trail-starvation death): death_day − (first fire day of
  the LAST trigger episode), where an episode = maximal run of fire-days
  with gaps ≤2d, and the episode must END within 7d before death; if no
  episode ends within 7d before death, lead = 0 (never fired). Both Rule A
  and Rule B measured; the bar is judged on Rule A (the villager-knowable
  rule — the mechanism must work without omniscience).
- **False positives** (on the 7 surviving runs, endReason='survived':
  s66051/54/56-belong, s66049/53/54/56-lead): every trigger episode across
  every villager's meal rows; FP = an episode after which the triggered
  villager does NOT die (any cause) within 10d of the episode's last fire
  day. Rate = FP_episodes / total simulated weeks. GO: ≤1/week. (A
  conservative FP definition — a collapse the villager survives by coming
  home counts as FP — so the bar is harder to pass, not easier.)
- **Wound-beat retainer** (backlog #818): scan deathDayLines AND
  lossDayLines (the prior instrument scanned deathDayLines only — the
  corpus-blindness was a scanner gap, not a corpus gap; see Metric review)
  for wound beats naming the deceased within 3d before/on the death day.
  Beat patterns: `mauled <Name> (-N health)`, `<Name> is (still )?hurting
  (N HP)`. Ground truth (transcript-confirmed, sim-deathcause-b): Zinaida
  (mauled −12, d36), Zihao (hurting 2 HP, d41/43), Kenneth (mauled −85,
  d143), Laura (hurting 11 HP, d65). GO: retainer names wound-compounding
  on all 4.
- **PRIMARY (DIAG-GO, conjunctive)**: trigger fires ≥3d before death in
  ≥4/5 trail-starvation cases (Rule A) AND false positives ≤1/week on
  surviving runs AND wound-beat retainer names wound-compounding on all 4
  transcript-confirmed cases.
- **Verdict classes**: DIAG-GO | DIAG-insufficient-data | NO-GO (never
  re-scored).
- **Instrument proof** (pre-registered, scripts/test-recalldiag-b.js):
  (a) fixture RED→GREEN: synthetic meal rows exercise trigger fire on the
  exact signature and no-fire on EACH single missing condition (not-away,
  no-majority, no-cliff, 3-day-minimum baseline, baseline-too-low,
  no-pack-draw, pantry-not-ample for Rule B), episode grouping, and
  lead-time computation; (b) wound retainer RED→GREEN on synthetic say
  lines (deathDayLines + lossDayLines, name matching, 3d window, non-victim
  exclusion); (c) DET: two in-memory runDiag() passes byte-identical.
  The corpus application is the JUDGED ANALYSIS, not a proof gate.
- **Method note**: meal-row shapes were inspected during instrument design
  (fixture-driven development, same as the prior arm); the judged numbers
  below come from the script run, not from the inspection.

## Canon

- docs/CANON.md read first. **No canon doc covers expedition recall or
  village death attribution** — the CANON.md manifest lists no expedition
  doc; docs/WORLD-REGIONS.md mentions expeditions only in the Kin/scattering
  context. Per the manifest's rule ("if no doc covers your area, say so
  instead of inventing"), the recall trigger is an INSTRUMENT over
  engine-state variables (away flag, daily production, pack draws, pantry),
  not canon. Nothing was invented from scratch; the rule's conditions are
  the trailstarve evidence's own signature (away-majority + cliff +
  pack-draws + ample pantry), operationalized per-day.

## Proof results (scripts/test-recalldiag-b.js: 21/21 GREEN)

- A1–A14 trigger fixtures: fires on the exact signature (Rule A and Rule B
  with ample pantry); no-fire on not-away, no-majority (3/7), no-cliff,
  the 0.41× cliff boundary, the 3-away-day minimum baseline, baseline <800
  (patch never produced), no-pack-draw, and Rule-B pantry-not-ample (with
  Rule A still firing — the knowledge caveat, pinned); episode grouping
  with ≤2d gaps; lead-time from the last episode within 7d; lead 0 when the
  only episode is older than 7d or fires on the death day.
- B1–B6 wound retainer fixtures: maul beat in deathDayLines; maul AND
  hurting beats in lossDayLines (the Kenneth/Laura gap, pinned); outside
  the 3d window does not attach; another victim's wound line does not
  attach; 2d-prior hurting beat attaches (Zihao d41→d43); gossip/patch/pack
  lines never match.
- C1 DET: two in-memory runDiag() passes byte-identical.

## Trigger lead times (judged analysis — scripts/taxonomy-recalldiag-b.js on the corpus)

| case | fire days (Rule A) | lead A | fire days (Rule B) | lead B |
|---|---|---|---|---|
| Theo belong s66050 d29 | d24–d29 | **5d** | d24–d27, d29 | **5d** |
| Juan belong s66053 d8 | d6, d7 | **2d** | d6 | **2d** |
| Irving belong s66053 d21 | d8, d20, d21 | **1d** | d8, d20 | **1d** |
| Zinaida belong s66053 d36 | d35, d36 | **1d** | d35, d36 | **1d** |
| Juan lead s66053 d8 | d6, d7 | **2d** | d6 | **2d** |

Rule A ≥3d: **1/5** (bar ≥4/5). Rule B fires identically in lead terms —
the pantry condition never delayed a first fire (pantry on every fire day:
6,034–20,500, all ≥5000; the Rule-B drops on d7/d21/d28 are missing daily
pantry rows, not thin pantries — see Metric review).

**PRIMARY leg 1: MISSED → the conjunctive bar fails → NO-GO (never re-scored).**

Why it misses — the root cause, measured: the cliffs are single-day events
with NO pre-cliff signal in any corpus variable. Production, `expected`
(the engine's own patch forecast — it collapses the same day as produced:
Theo 4050→324, Zinaida 3000→780), `gave`, and pack draws all flip on the
cliff day itself. Collapse→death intervals are intrinsic: Theo 5d, Juan 2d,
Irving 1d, Zinaida 1d. A cliff-triggered rule cannot fire before the cliff,
and after the cliff there are 1–2 days left for 4/5 cases. The bar's ≥3d
assumed an early-warning signal that the engine does not emit in any
variable the corpus retains.

## False-positive rate (judged analysis — 7 surviving runs, 180 weeks)

- FP episodes: 13, TP episodes: 10, rate **0.072/week** (bar ≤1/week) —
  **PASSES by ~14×.**
- Qualitative audit of all 13 FPs: they are REAL collapses the villagers
  survived, not trigger noise. Devon (belong s66051): expedition collapse
  d9–d12 (prod 668→373, draws 600–972), came home d13, recovered, died d36
  to a monster. Jovan (lead s66049): collapse d67–d69 (prod 553→385, draws
  ~1100/d), came home d70, recovered, died d145 in combat. Irving (lead
  s66053): the natural experiment — same vid, same seed, same d8 and d20
  collapses as his belong-self; came home d22, recovered, died d53 in a
  contest (The Moderator). Priya-class single-day dips (d31, d51, d94,
  d136, d173–174): 1-day production dips with pack draws, all recovered.
- The conservative FP definition counts "collapse survived by coming home"
  as FP; the true noise-FP rate (trigger fired, no collapse, no danger) is
  ~0/180 weeks. The trigger is precise, not twitchy.

## Wound-beat retainer (judged analysis — re-run census, backlog #818)

Retainer (deathDayLines + lossDayLines) over all 13 starvation deaths —
derived census: evidence/2026-10-22/recalldiag-woundcoverage-b.json.

| death | census flags (prior) | retainer |
|---|---|---|
| Zinaida d36 | wound-compounded | WOUND-COMPOUNDED (maul −12 @d36) |
| Zihao d43 | wound-compounded | WOUND-COMPOUNDED (hurting 2HP @d41, @d43) |
| Kenneth d143 | — | **WOUND-COMPOUNDED (maul −85 @d143)** — recovered from lossDayLines |
| Laura d65 | — | **WOUND-COMPOUNDED (hurting 11HP @d65)** — recovered from lossDayLines |
| other 9 | — | — (no spurious flags) |

**4/4 transcript-confirmed cases named → PASSES.** CORRECTION to the prior
arm (sim-trailstarve-b metric review #3): Kenneth's −85 maul was NOT
corpus-blind. It is in lossDayLines d143 — the scattering day WAS d143
(village-lost d143), his death day, and the beat reads "🩸 The Big Beast
mauled Kenneth (-85 health) over 2 rounds" two lines above "💀 Kenneth
starved." The blindness was the scanner's (deathDayLines only), not the
corpus's. Same for Laura's 11-HP hurting beat (lossDayLines d65). The
retainer (scripts/taxonomy-recalldiag-b.js woundBeats()) is the instrument
fix; the next census should use it.

## Reachability verdict

Not applicable by design: DIAG instrument on an existing corpus, no lever,
no new sims. Wall numbers from the corpus are unchanged from
sim-deathcause-b / sim-trailstarve-b: won 0/16, national(end) 5/16, table
14/16, wave4 14/16, wave5 0/16, median survival 172d.

## Sense-testing (SENSE-TESTING LAW — transcripts read, not counted)

The 5 trail cases, in human terms — who would have come home:

- **Theo (belong s66050, d29)**: 29 days on the trail, producing 2,300–4,600
  kcal/d for 23 days — a great expedition. d24 the patch dies (293) and he
  starts drawing 700–1,000/d from his pack against 2,300 need. The village
  is alive and eating the whole time ("Zihao cooked for the haven — meals
  stretched", "Village meal: +2000 kcal", "Cormac returns with foraged food:
  +378/+495/+538 kcal to the pantry"). He keeps contributing knowledge
  ("Theo brought you a sample. The Codex grows.") the day he dies. The
  trigger fires d24 — 5 days' warning, pantry at 6,034 and the fire is lit.
  **The recall would have mattered for Theo: he had time to walk home, and
  home had food.** He is the one case the mechanism works for as designed.
- **Juan (s66053, d8, both policies, byte-identical)**: 8 days out, cliff d6
  (2,130→453), dead d8. Trigger fires d6 — 2 days. Two days to get home
  from the trail on a collapsing pack: marginal at best. **The recall
  probably would NOT have mattered for Juan** — the window is too short,
  and there was no signal before d6.
- **Irving (belong s66053, d21)**: the two-collapse story. d8: production
  386, draws 1,000 — the trigger fires, and he comes home d9 on his own,
  recovers, goes back out. d20: production 382 — the trigger fires again,
  and this time he STAYS on the trail and dies d21. His lead-policy twin
  (same seed, same vid, same d8+d20 collapses) came home d22 and lived to
  die d53 fighting The Moderator in a contest. **The recall would have
  mattered for Irving's second collapse — 1 day's warning, and the
  difference between his two fates was exactly "came home vs stayed".**
  But 1 day is not the 3 the bar demands, and nothing signaled the d20
  collapse before d20.
- **Zinaida (belong s66053, d36)**: cliff d35 (2,756→769), mauled (−12) d36,
  dead d36. Trigger fires d35 — 1 day. But the arithmetic: ≤8 starvation
  damage in-window vs 100 HP — she was already grievously HP-compromised
  before the cliff, and the maul did the real killing the same day she
  starved. **The recall is the wrong instrument for Zinaida** — even a
  same-day recall couldn't have saved her; wound care (or not ranging at
  low HP) is the load-bearing fix.
- The game never voices the recall decision — no beat says "the patch
  collapsed, come home." Villagers DO come home organically after collapses
  (Devon d13, Jovan d70, Irving-lead d22, Irving-belong d9) — the behavior
  exists; it is just not reliable. The blank is real and unvoiced.

## Village assessment

Same 16 villages as sim-deathcause-b (SURPLUSFEED gone, depositgate +
plentydepri live) — this arm adds no new sims. What the trigger evidence
adds to the picture:

**Who would have been recalled**: 5 trail-starvation deaths, 5 trigger
episodes. The trigger detects every collapse (5/5 fired; 0 missed
collapses) — as a *detector* it is complete. As an *early warning* it fails
4/5: the collapse-to-death interval is 1–2d because the engine's starvation
branch deals 8/damage per below-60% day AND every victim was already
HP-compromised (≤48 starvation-path damage in-window vs 100 HP — the prior
arm's arithmetic). The pack (700–1,000/d draws vs ~2,000 need) buys 2–4
days, not a week.

**What was missing**: (1) an EARLIER signal than the cliff — the corpus
retains none (production, expected, gave, draws all flip on the cliff day;
pack state and HP are engine-known but corpus-blind); (2) wound care — the
Zinaida class dies of wounds-with-hunger, not hunger alone; (3) the
knowledge problem — the away villager cannot see the pantry, so a
pantry-conditioned recall must be System-voiced, not villager-decided.

**Blanks filled**: (1) the recall trigger rule, developed offline and
measured: RECALL-TRIGGER v1 (scripts/taxonomy-recalldiag-b.js) — precise
(0.072 FP/week, FPs are real collapses survived), complete as a detector
(5/5), but 1–2d late as an early warning for 4/5; (2) backlog #818 FIXED —
the wound-beat retainer (deathDayLines + lossDayLines) names
wound-compounding on 4/4 transcript-confirmed cases with 0 spurious flags,
and corrects the prior arm's corpus-blindness claim; (3) the FP audit —
villagers already come home after collapses organically; the trigger would
reinforce existing behavior, not invent it.
**Blanks documented**: (1) the recall DESIGN stays steve-call-sized — this
evidence redirects it: a cliff trigger buys 1–2d, not 3d+; the design
needs an earlier signal (pack state at decision time, HP-gated ranging, or
the engine's expected-forecast voiced as "the patch is dying") or must
accept the recall as a 1–2d emergency response; (2) Rule B's pantry join
has daily-series gaps (d7/d21/d28 missing) — the next census instrument
should carry the pantry forward, not require the exact day; (3) the
HP-compromise finding belongs in the wound-care evidence, not the recall
evidence.

## Metric review (§14)

1. **PRIMARY MISSED → NO-GO (never re-scored).** 1/5 ≥3d vs bar 4/5. The
   bar was written before the judged run and judged as written. The miss is
   a finding about the engine (no pre-cliff signal exists; collapse→death
   is 1–2d), not an instrument failure — the trigger detected 5/5
   collapses.
2. **Kenneth/Laura correction**: the prior arm's "corpus-blind" claim
   (metric review #3) is corrected — both beats were in lossDayLines all
   along; the scanner only read deathDayLines. No corpus change was needed,
   only the retainer.
3. **Rule B pantry gaps**: daily[].pantryKcal is missing for some days
   (d7, d21, d28 in the case files) — Rule B dropped those fire-days on
   missing data, not thin pantries. The verdict is judged on Rule A per the
   pre-registration; a production instrument should forward-fill the pantry.
4. **FP conservatism**: the pre-registered FP definition counts
   real-collapses-survived as FP (Irving-lead d8/d20, Devon d9–12, Jovan
   d67–69). The true noise-FP rate is ~0. The bar passed at 0.072/week
   against ≤1/week — the margin is large enough that the definitional
   conservatism does not flip the leg.
5. **The bar's hidden assumption**: "fires ≥3d before death" assumed a
   pre-cliff early-warning signal exists in engine state. The corpus shows
   the cliff is a single-day event in every retained variable. If Steve
   wants a 3d+ recall, the signal must come from variables the corpus does
   not retain (pack kcal at decision time, HP, the expected-forecast
   voiced prospectively) — a new-sensor question, not a re-score.
6. **Metric binding honored**: the bar, the rule, the episode/lead/FP
   definitions, and the wound ground truth were all written before the
   judged run. The Irving-d8 episode (13d before death, outside the 7d
   episode window) was NOT counted toward lead — judged as written.

## Convergence state

**NO-GO on the pre-registered primary** (1/5 ≥3d, bar 4/5; FP leg PASS at
0.072/week; wound leg PASS at 4/4). The NO-GO is load-bearing, not a
failure: it converts the steve-call recall question from "what should the
trigger be?" to "the cliff buys 1–2d — do we build an earlier signal, or
design the recall as a 1–2d emergency response?" food-economy stays
converging; the wall is unmoved (wins 0/16, wave-5 0/16 on this corpus).
Named nexts: (1) steve-call on recall design with this evidence; (2) the
wound retainer ships with the next census instrument; (3) pack-state/HP as
earlier-signal candidates need a sensor, not a re-score.

## Telemetry note

Coordinator's step (per the run body §10); the corpus for it is
evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs +
_summary.json), anchor cd68e6dd3, substrate FEASTSCALE_R13=1/SEATDRIVE=0.
This arm adds: scripts/taxonomy-recalldiag-b.js (trigger + wound retainer
instrument), scripts/test-recalldiag-b.js (proof, 21/21 GREEN),
evidence/2026-10-22/recalldiag-woundcoverage-b.json (re-run wound-flag
census), and this file. The committed trailstarve-census-b.json is the
prior arm's evidence and is left untouched.
