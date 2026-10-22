# sim-recallsignal-b — earlier-signal DIAG for the expedition recall (named next of sim-recalldiag-b)

Run: fleshout-loop-b, arm sim-recallsignal-b (the explicit named next of loop-B
arm sim-recalldiag-b, run fleshout-loop-b-20261022T1830Z,
evidence/2026-10-22/sim-recalldiag-b.md READ — RECALL-TRIGGER v1 spec, the 5
trail collapses, lead-time measurements, corpus location — ALL READ).
OFFLINE DIAG — zero new sims, zero src/js, instrument-only. This arm answers
recalldiag-b's steve-call: "the recall design needs an EARLIER signal (pack
kcal at decision time, HP-gated ranging, or the expected-forecast voiced
prospectively as 'the patch is dying') or must accept the recall as a 1-2d
emergency response." This arm measures whether the earlier signals exist on
the EXISTING meal-row corpus — it does NOT design the recall mechanism.

Worker tree: ~/workspace/worktrees/sim-recallsignal-b. Base: master 55c6299f6
(verified via git rev-parse HEAD; no mid-run rebase needed).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the judged analysis run)

- **Question**: do the three steve-call earlier-signal variants buy the
  missing lead time (≥3d on ≥4/5 trail collapses), measured OFFLINE on the
  existing corpus (evidence/2026-10-22/perseed-deathcause-b/, 16 per-seed
  JSONs + trailstarve-census-b.json)? The corpus is meal rows per
  villager-day (d, vid, ate, drawn, gave, fasting, away, produced,
  expected, need) + deaths + deathDayLines/lossDayLines + daily pantry.
  The corpus location and the 5 trail cases are established by
  sim-recalldiag-b (NOT re-discovered here — fixture-driven development
  on inspected shapes, judged numbers from the script run only).
- **Variant (a) PACK** — "pack kcal at decision time (pack buffer < X days
  of need at the moment of the trigger evaluation)". Corpus check FIRST:
  is any pack-kcal field retained per villager-day across the 16 files?
  If 0/16 files carry a pack field, the variant is UNMEASURABLE on this
  corpus and counts as a MISS on the primary (an unmeasurable signal buys
  no lead time — never re-scored). Best available proxy, also measured:
  pre-cliff `drawn` — did any case draw from pack in the 3 days BEFORE the
  cliff day? If none did, the proxy buys nothing and the finding is
  "pack state is corpus-blind".
- **Variant (b) HP-GATE** — "HP-gated ranging (villager HP below a threshold
  gates the away decision)". Corpus check FIRST: is per-villager-day HP
  retained in any of the 16 files? If 0/16, the threshold rule itself is
  UNMEASURABLE and counts as a MISS on the primary. Measurable proxy via
  the wound retainer (taxonomy-recalldiag-b.woundBeats): (i) wound beats
  in [cliffDay−7, deathDay] — was an HP signal present before death at
  all? (ii) wound beats in [expeditionStart−7, expeditionStart] where
  expeditionStart = first away-day of the maximal trailing away-run ending
  on the death day — would an HP gate AT DEPARTURE have kept them home?
  The proxy is reported as evidence for the steve-call, not as lead time
  for the primary (it cannot be — the threshold is unmeasurable).
- **Variant (c) FORECAST** — "the engine's expected-forecast voiced
  prospectively". TRIGGER FORECAST (triggerDayF): same as v1 Rule A
  (away, away-majority ≥4/7, pack-draw drawn[d] ≥ 0.30×need[d]) but the
  cliff condition on `expected` instead of `produced`: expected[d] ≤
  0.50×mean(expected over trailing 7 away-days before d), ≥3 away-days in
  baseline, baseline mean ≥800. Episode/lead machinery IDENTICAL to v1
  (episodes = maximal fire-day runs with gaps ≤2d; lead = death_day −
  first fire day of the LAST episode ending within 7d before death; 0 if
  none). Per case: first-fire day of FORECAST vs first-fire day of v1
  Rule A (= the cliff day). Also lead-lag: on the 3 days before each
  cliff, does expected dip while produced holds (any of the 5 cases)?
- **PRIMARY (binding)**: the best variant buys ≥3d lead time on ≥4/5
  trail-starvation collapses. Variants unmeasurable on this corpus count
  as misses. (The bar is the same one v1 failed at 1/5 — the steve-call
  bar.)
- **SECONDARY**: false positives ≤1/week on surviving runs — same 7
  survivors, same conservative episode definition (an episode after which
  the triggered villager does NOT die within 10d of the episode's last
  fire day; rate = FP_episodes / simulated weeks). Measured for the
  FORECAST variant (the only measurable trigger). For (a)/(b): FP is not
  measurable corpus-blind — recorded as unmeasurable, not as a pass.
- **Verdict classes**: DIAG-GO | DIAG-insufficient-data | NO-GO (never
  re-scored).
- **Instrument proof** (pre-registered, scripts/test-recallsignal-b.js):
  (a) fixture RED→GREEN: FORECAST fires on the prospective shape
  (expected collapses while produced still holds), no-fire on EACH single
  missing condition (not-away, no-majority, no-expected-dip, the 0.50×
  boundary, thin baseline, baseline-too-low, no-pack-draw), episode
  grouping and lead-time computation reuse the base machinery; (b) the
  HP-window measurement fixtures: wound beats attach in the pre-cliff
  window, expedition-start window logic (maximal trailing away-run),
  corpus-blindness assertions (no pack/hp keys in any meal row);
  (c) DET: two in-memory runSignalDiag() passes byte-identical.
  Proof-test RNG: mulberry32, fixed default, SEED env override (the
  instrument is deterministic offline; the seed governs synthetic corpus
  generation in the proof). The corpus application is the JUDGED
  ANALYSIS, not a proof gate.
- **Method note**: meal-row shapes were inspected during instrument design
  (fixture-driven development, same as the prior arm); the judged numbers
  below come from the script run, not from the inspection.

## Canon

- docs/CANON.md read first. **No canon doc covers expedition recall or
  villager death attribution** — same canon gap as the parent arm: the
  CANON.md manifest lists no expedition doc; docs/WORLD-REGIONS.md mentions
  expeditions only in the Kin/scattering context. Per the manifest's rule
  ("if no doc covers your area, say so instead of inventing"), the earlier
  signals are INSTRUMENTS over engine-state variables (away flag, daily
  production, the engine's own expected forecast, pack draws, say-line
  wound beats), not canon. Nothing was invented from scratch; the FORECAST
  rule is RECALL-TRIGGER v1 with the cliff condition moved from `produced`
  to `expected`.

## Proof results (scripts/test-recallsignal-b.js: 17/17 GREEN, default SEED and SEED=42)

- A1–A10 FORECAST fixtures: fires on the prospective shape (expected
  collapses 0.50× while produced still holds — and v1 does NOT fire on the
  same day, pinning that the shape genuinely leads); fires when both
  collapse together (the corpus shape); no-fire on not-away, no-majority
  (3/7), no-expected-dip, the 0.51× boundary, baseline-too-low, no-pack-draw;
  episode/lead reuse of the base machinery; a seeded (mulberry32,
  SEED env override) synthetic expedition proves the forecast leads the
  produced cliff when the shape occurs.
- B1–B6 proxy fixtures: woundBeatsWindow attaches beats in arbitrary
  windows and excludes other victims; expeditionStart = first away-day of
  the maximal trailing away-run ending at death; preCliffDrawn reports
  d-3..d-1 drawn/need; corpus-blindness pins the 16-file meal-key union to
  exactly [ate,away,d,drawn,expected,fasting,gave,need,produced,vid] with 0
  files carrying a pack field and 0 carrying an HP field.
- C1 DET: two in-memory runSignalDiag() passes byte-identical.

## Judged analysis (scripts/taxonomy-recallsignal-b.js on the corpus)

### Corpus blindness (variants (a) and (b))

- 16/16 files; meal-row key union exactly
  {ate, away, d, drawn, expected, fasting, gave, need, produced, vid}.
- Files with a pack-kcal field: **0**. Files with a per-day HP field: **0**.
- Homecoming invKcal rows for the 5 trail victims: **0** (they never came
  home — the scholar-homecoming sensor covers none of them).
- Per the pre-registration: variant (a) PACK and variant (b) HP-GATE are
  **unmeasurable as threshold rules on this corpus** and both count as
  MISSES on the primary. Their proxies are measured below as evidence for
  the steve-call, not as lead time.

### Variant (c) FORECAST lead times vs v1 Rule A

| case | cliff (=v1 1st fire) | firesF | leadF | leadA |
|---|---|---|---|---|
| Theo belong s66050 d29 | d24 | d24–d29 | **5d** | 5d |
| Juan belong s66053 d8 | d6 | d6, d7 | **2d** | 2d |
| Irving belong s66053 d21 | d8 | d6, d8, d20, d21 | **1d** | 1d |
| Zinaida belong s66053 d36 | d35 | d35, d36 | **1d** | 1d |
| Juan lead s66053 d8 | d6 | d6, d7 | **2d** | 2d |

FORECAST ≥3d: **1/5** (bar ≥4/5) — identical to v1. The forecast fires on
exactly the same days as the cliff trigger in every hard cliff.

The Irving d6 fire needs a footnote: it is NOT a prospective signal. At
d6, produced AND expected collapsed together (prod 1381→739, exp
1353→778) — v1's 0.40× boundary missed it (0.43×) while FORECAST's 0.50×
boundary caught it (0.42×). A threshold-boundary artifact on a two-stage
soft decline, not the forecast seeing the future. The d6 episode ends d6 —
15d before death, outside the pre-registered 7d episode window — and Irving
came home d9 on his own anyway, so it changes no outcome.

### Lead-lag: does `expected` ever dip before `produced`?

On the 3 days before each v1 cliff, in all 5 cases, expected tracks
produced at full value — no dip while production holds:

- Theo (cliff d24): d21–d23 exp=4050/4050/4050 vs prod 4640/3483/3839
- Juan (cliff d6): d4–d5 exp=1906/2150 vs prod 1777/2130
- Irving (cliff d8): d5–d7 exp=1353/778/860 vs prod 1381/739/918 (both
  declining together — the soft-decline stage, already below baseline)
- Zinaida (cliff d35): d32–d34 exp=3000/3000/3000 vs prod 2726/2734/2756
- Juan-lead: same as Juan

**Answer: no.** In every hard cliff the engine's own forecast dies on the
cliff day itself. Voiced prospectively ("the patch is dying"), the
forecast has nothing to say before the cliff.

### Variant (a) PACK proxy: pre-cliff drawn (d-3..d-1)

- Theo: 0/0/0. Zinaida: 0/0/0. Juan (both): 170 (d3, home day), 312 (d4,
  expedition start, production healthy at 1777 — provisioning, not
  distress), 0 (d5).
- Irving: 632/912/628 on d5–d7 — but these accompany the soft-decline
  stage itself, not a pre-decline signal.

**Answer: no pre-cliff pack signal in 4/5; the 5th's draws are the decline
itself.** The corpus retains no pack-kcal, and the drawn proxy buys no
earlier lead.

### Variant (b) HP proxy: wound beats in [cliffDay−7, deathDay] and [expeditionStart−7, expeditionStart]

- woundsPreCliff: Theo none, Juan none, Irving none, Zinaida maul@d36
  (the death day itself — same-day, not earlier), Juan-lead none.
- woundsAtDeparture (final expedition starts: Theo d1, Juan d4, Irving
  d17, Zinaida d1): **none in all 5**.

**Answer: an HP gate at departure would have blocked 0/5; an HP-aware
trigger would have fired 0/5 before any cliff.** No HP signal existed
before any collapse. Zinaida's maul confirms the parent's finding that
the Zinaida class is wound-with-hunger (the recall is the wrong
instrument), but it gives no earlier lead either.

### SECONDARY: FORECAST false positives (7 surviving runs, 180 weeks)

- FP episodes: 19, TP: 11, rate **0.106/week** (bar ≤1/week) — **PASSES**
  by ~9×. Slightly above v1's 0.072 (the d6-class early soft-decline fires
  add episodes) but far under the bar.
- For (a)/(b): FP is not measurable corpus-blind — recorded as
  unmeasurable, not as a pass.

**PRIMARY: 1/5 (FORECAST) + 2 unmeasurable misses (PACK, HP-GATE) →
MISSED → NO-GO (never re-scored).**

## Reachability verdict

Not applicable by design: DIAG instrument on an existing corpus, no lever,
no new sims. Wall numbers from the corpus are unchanged from
sim-deathcause-b / sim-trailstarve-b / sim-recalldiag-b: won 0/16,
national(end) 5/16, table 14/16, wave4 14/16, wave5 0/16, median survival
172d.

## Sense-testing (SENSE-TESTING LAW — transcripts read, not counted)

The Irving d6 footnote, in human terms: d5–d7 Irving is on a patch that's
softening — production 1381→739→918, drawing 600–900/d from his pack. The
d8 say lines show him already back at the fire that evening ("Irving's
stomach knots — something in their meal was off"; "Daniyar sits with
Irving — cool cloth, bitter tea, watching the breathing") — the village
notices him, cares for him, and he goes back out d17 anyway and dies d21
after the second collapse. The soft decline was *visible* to the village
in a way the instrument's numbers only approximate — but he recovered
from it, which is exactly why a hair-trigger recall on soft declines
would misfire: the d5–d7 episode was survivable, the d20 one wasn't, and
no number distinguished them in advance. This is the FP story in human
form: real collapses, survived, then the one that wasn't.

Theo remains the one case the mechanism works for as designed (5d lead,
pantry ample, he was contributing to the Codex the day he died) — and the
forecast adds nothing for him either: expected=4050 right up to d23.

Zinaida: no wound beat before the death day, no pre-cliff draw, no
forecast dip. She ranged from d1, produced ~2,700–3,000/d for 34 days, the
patch died d35, a maul landed d36, she starved d36. Nothing the corpus
retains would have recalled her a day earlier. The wound-care evidence
(the parent's blank #2) is the only load-bearing direction for her class.

## Village assessment

Same 16 villages as sim-deathcause-b (SURPLUSFEED gone, depositgate +
plentydepri live) — this arm adds no new sims. What the earlier-signal
evidence adds to the picture:

**Who would have been recalled earlier**: nobody. FORECAST recalls
exactly the same days as the v1 cliff trigger. PACK and HP-GATE cannot be
evaluated — the corpus never recorded pack kcal or per-day HP, and the
proxies (pre-cliff drawn, wound beats in the pre-cliff and
at-departure windows) are empty for all 5 cases.

**What was missing**: the sensors, not the signals. The three steve-call
variants split cleanly: (c) is measurable and buys nothing (the forecast
dies with the cliff); (a) and (b) are unmeasurable on this corpus. If
Steve wants a pack-buffer or HP-gated earlier signal, the next sweep
instrument must add per-villager-day pack-kcal and HP to the meal rows —
the recalldiag-b metric review #2 already named this pattern (pantry
forward-fill). Until then, the recall design's honest options are the two
the parent named: accept the 1–2d emergency response, or instrument first.

**Blanks filled**: (1) the earlier-signal question, closed with
measurements: FORECAST 1/5 ≥3d (no gain over v1), FP 0.106/week (passes);
(b) the Irving d6 boundary artifact, characterized (0.50 vs 0.40
threshold, not a prospective signal); (c) the lead-lag table for all 5
cases — expected never dips before produced.
**Blanks documented**: (1) pack-kcal and per-day HP are corpus-blind
across all 16 files (pinned by proof B5) — the sensor gap for the next
sweep instrument; (2) the recall DESIGN stays steve-call-sized — this
evidence constrains it: no earlier signal exists in any retained
variable; (3) the HP story belongs to wound care, not the recall trigger
— Zinaida's maul is same-day, and 0/5 had any pre-cliff HP signal.

## Metric review (§14)

1. **PRIMARY MISSED → NO-GO (never re-scored).** FORECAST: 1/5 ≥3d vs bar
   4/5. PACK and HP-GATE: unmeasurable on this corpus (0/16 files retain
   the fields), counted as misses per the pre-registration — they buy no
   lead time on this corpus. The bar, the variants, the blindness gate,
   the episode/lead/FP definitions were all written before the judged run
   and judged as written.
2. **The Irving d6 fire**: a 0.50×-vs-0.40× threshold-boundary artifact on
   a soft two-stage decline, not a prospective forecast signal — verified
   by reading the d5–d8 meal rows (produced and expected fell together).
   It does not change the lead (the d6 episode ends 15d before death,
   outside the 7d window, judged as written) and Irving recovered from it
   on his own.
3. **FP leg for (a)/(b)**: unmeasurable, recorded as unmeasurable — not
   smuggled in as a pass. Only FORECAST's FP (0.106/week, bar ≤1/week)
   was judged.
4. **Metric binding honored**: the pre-registration header was written
   before the judged analysis run; the corpus-blindness gate (miss if
   0/16) was specified up front and applied as written. The lead-lag and
   proxy measurements are reported as evidence, not re-scores.
5. **Metric review for the NEXT run**: if a future arm adds pack-kcal/HP
   sensors, the primary should be re-registered against the new corpus —
   this NO-GO does not pre-judge that corpus. The wound-retainer windows
   (pre-cliff, at-departure) ship with the next census instrument as
   free evidence.

## Convergence state

**NO-GO on the pre-registered primary** (FORECAST 1/5 ≥3d, bar 4/5; PACK
and HP-GATE unmeasurable corpus-blind → misses; FORECAST FP leg PASS at
0.106/week). The NO-GO is load-bearing, not a failure: it answers the
steve-call with measurements — no earlier signal exists in any
corpus-retained variable; the forecast dies with the cliff, pack and HP
are sensor gaps. The recall design's honest options are now: accept the
1–2d emergency response, or instrument pack-kcal/HP before evaluating
pack/HP-based signals. food-economy stays converging; the wall is unmoved
(wins 0/16, wave-5 0/16 on this corpus).

## Telemetry note

Coordinator's step (per the run body §10); the corpus for it is
evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs), anchor
cd68e6dd3, substrate FEASTSCALE_R13=1/SEATDRIVE=0. This arm adds:
scripts/taxonomy-recallsignal-b.js (earlier-signal instrument),
scripts/test-recallsignal-b.js (proof),
evidence/2026-10-22/recallsignal-windowcoverage-b.json (per-case windows +
beats), and this file. The committed trailstarve-census-b.json and
recalldiag-woundcoverage-b.json are the prior arms' evidence and are left
untouched.
