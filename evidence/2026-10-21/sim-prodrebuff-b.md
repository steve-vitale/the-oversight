# sim-prodrebuff-b — the production rebound, throttle coefficients + governor-hook audit (food-economy DIAG, then lever)

Run: fleshout-loop-b-20261021T1112Z, arm sim-prodrebuff-b (DIAG first, lever
conditional). Worker tree: ~/workspace/worktrees/sim-prodrebuff-b.
Answers backlog #570 (FEAST-DRAW PERVERSE DOSE-RESPONSE, 2026-10-18), the
named next: "the next arm on this axis must investigate the production
rebound (inflow-side: why the village over-produces into gluts it cannot
eat) before any further draw/supply lever."

Where this sits: sim-glutprobe-b (2026-10-20, 16 runs seeds 8801-8808) named
the six unthrottled channels with glut/lean ratios — share_surplus 2.59x
(73.7% of marginal glut inflow), tribute 2.03x (9.3%), away_wild 1.29x
(6.3%), ambient:villagelives 1.53x (5.7%), scholar_home 8.72x (2.6%),
traps 2.78x (0.4%). sim-surplusfeed-curvecheck-b (2026-10-20) proved the
landed default-OFF SURPLUSFEED governor bends share_surplus (armed 1.22x vs
control 2.12x, GO) and cut permanent-glut configs 14/16 → 6/16. What NEITHER
run did: measure the RESPONSE SHAPE per channel (fine fresh-day buckets +
a throttle coefficient — the slope of the curve, not just one ratio), and
audit each remaining unthrottled channel for a clean policy-side governor
hook (SURPLUSFEED pattern: engine-honest gating, default-OFF env var,
voice-honest, conservation-clean).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

### DIAG question
For each unthrottled channel (excluding share_surplus — governed — and the
throttling duties), what is the dose-response SHAPE vs pantry fullness, and
which channel carries a clean policy-side throttle hook?

### Throttle coefficient (binding)
Per channel: Spearman rho between dawn freshDays and same-day inflow,
restricted to freshDays ∈ [2,30] (the informative range — excludes deep
lean where everything moves and the 100d shelf where nothing does), pooled
over all runs. Reported alongside the glutprobe glut/lean ratio for
continuity. rho > 0 = ramps with fullness; rho < 0 = throttles. A channel
is "unthrottled" when rho ≥ 0 AND glut/lean ratio ≥ 0.80.

### Fine buckets (binding)
0–1 / 1–2 / 2–4 / 4–7 / 7–14 / 14–30 / 30+ fresh-days: mean kcal/day per
channel per bucket — the curve shape the single ratio collapses. Plus
doomed-stock buckets (0 / 1–2k / 2–10k / >10k) for the two candidate lever
channels only (away_wild, ambient:villagelives).

### DIAG-GO (binding — "hook audit complete")
ALL of (a) ≥ 90% of marginal-glut inflow sits in named channels with
measured throttle coefficients (instrument-honest, unattributed < 1%
per run, proven by scripts/test-prodrebuff-b.js GREEN + det-gate);
(b) glut and lean buckets each ≥ 30 pooled day-pairs; (c) every
unthrottled channel carries a hook verdict: intake decision point
(file+line), env-gate shape, conservation story, voice plan, feasibility;
(d) the single most-leverable unthrottled channel is NAMED. NO-GO:
instrument dishonest or buckets under-powered.

### Sweep substrate
16 runs = seeds 8801–8808 × {leadfeast, belongfeast}, 180d death-aware,
FEASTSCALE_R13=1 / SEATDRIVE=0 / SURPLUSFEED unset explicit (asserted;
sweep exits on mismatch). PAIRED REUSE EXCEPTION: 8801–8808 are reused
seeds (not a fresh-seed claim) — the control corpus must be on THIS commit
(master movement since 2026-10-20 shifts trajectories; diagnosed by
sim-surplusfeed-curvecheck-b). Instrument: landed probe-glut-instruments.js
(attachProbe), zero changes — the instrument needs no new fields:
dawnSamples (freshDays, doomedKcal) × dayInflow (day → channel → kcal)
already carry everything the coefficient needs. The analyzer computes
buckets + coefficients offline.

### Expected hook audit (pre-registered hypotheses, not verdicts)
- away_wild: npcNodeTravel forage-return (game.js ~15867)
  stockPantry(kcal,'Foraged food') — single call site, voiced return line
  exists → likely MOST LEVERABLE.
- ambient:villagelives: villageLives BIG DAY (game.js ~26747) — single
  site, but the beat is a villager's "day of their life"; trimming it is
  sense-risky → likely second.
- tribute: hierarchy.js ~1100 depositPantryPieces — needs a Steve design
  call (refusal has diplomatic cost; only a diversion is canon-safe) →
  NOT a clean policy hook this arm.
- scholar_home: returnToVillage ~8348 depositPantryPieces — governing the
  player's own haul deposit is sense-hostile → NOT clean.
- traps: 0.4% of glut inflow → immaterial.

### Conditional LEVER pre-registration (activates ONLY if the DIAG names a clean hook)
**Lever: RETURNINTAKE governor (env-gated, default OFF)** on the named
channel (pre-registered expectation: away_wild's forage-return intake).
Shape (mirrors SURPLUSFEED, game.js):
- game.js `returnIntakeGovernor(vid, kcal)` — engine-honest gating,
  `process.env.RETURNINTAKE === '1'`, default OFF everywhere (browser: no
  process → off). When ON and pantryFreshDays() > 4 and no hunger crisis
  (hungryStreak < 3): the returning forager's haul is halved — they ate on
  the trail and left the surplus standing where it grew. The trimmed kcal
  is never conjured, eaten-in-fiction, or stored: the haul is simply
  smaller (the away return calls no depleteRandomTile, so there is no
  conservation ledger to break). Voice: once per glut stretch (first trim
  after ≥5 untrimmed days), the existing return line extends honestly —
  "looks at the groaning shelves, eats from the trail bag instead. 'No
  point hauling what'll rot.'"
- Zero RNG draws on either path; gate-off returns kcal exactly (det-gate
  reads this path).

**LEVER-GO (binding)**: primary — armed away_wild glut/lean ratio ≤ 0.9x
(control 1.29x) with permanent-glut days ≤ 0.7x control; guardrails — lean
inflow (away_wild ≤2d bucket) ≥ control, starvation deaths ≤ control,
median survival ≥ control−10d, laundering == 0 (other-channel glut-bucket
means ≤ control+10%), no new death mechanism. Pilot: 8 armed runs
(8801–8804 × {leadfeast, belongfeast}, RETURNINTAKE=1) vs the matching 8
seeds from the 16-run DIAG control corpus (same commit, paired).
Kill zero-trace on miss; each winning arm lands as its own commit.

## Canon
docs/CANON.md + docs/PRESERVATION.md read first. The DIAG is
instrument-only (zero src/js); the conditional lever follows the landed
SURPLUSFEED pattern (Steve's 2026-10-18 make-the-call), same env-gate
shape, same voice discipline. "Rot can't be smoked back into food"
untouched. No silent actions: any trim is voiced.

[RESULTS — sweep complete 2026-10-21 ~07:30 CDT]

## DIAG results (this commit: 76421939b)

16 runs (seeds 8801–8808 × {leadfeast, belongfeast}, 180d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0/SURPLUSFEED-unset/RETURNINTAKE-unset; paired
reuse documented in pre-registration). 2034 pooled day-pairs. Corpus:
evidence/2026-10-21/perseed-prodrebuff-b/{leadfeast,belongfeast}.json;
aggregate: evidence/2026-10-21/prodrebuff-analysis.json.

Instrument honesty: **unattributed = 0.00% on all 16 runs** — 100% of
choke-point inflow in named call-path channels. DIAG-GO (a) MET.

### Throttle coefficients (Spearman rho fd→inflow on fd∈[2,30]) + glut/lean ratio + marginal-glut share

| channel | rho | glut/lean | marg. glut share | verdict |
|---|---|---|---|---|
| share_surplus | +0.21 | 2.89x | 62.2% | unthrottled (governed by SURPLUSFEED, OFF here) |
| scholar_home | +0.07 | 30.96x | 16.2% | unthrottled — composition SHIFT vs glutprobe (2.6% → 16.2%) |
| tribute | +0.07 | 1.68x | 9.6% | unthrottled |
| away_wild | +0.18 | 1.53x | 5.4% | unthrottled |
| ambient:villagelives | +0.03 | 2.06x | 4.7% | unthrottled |
| aid_system | −0.02 | 0.68x | 1.2% | lean-responsive (good direction) |
| events:ambient | −0.02 | 2.19x | 0.3% | flat / tiny |
| traps | −0.00 | 6.95x | 0.2% | unthrottled, immaterial |
| duty:fish | −0.49 | 0.01x | 0.2% | THROTTLES (PRODTHROTTLE) |
| duty:forage | null | Inf (lean=0) | 0.0% | throttles |

Named channels with measured coefficients cover **98.1%** of marginal
glut inflow (share_surplus+scholar_home+tribute+away_wild+ambient) —
DIAG-GO (a) ≥90% MET. Glut 1246 + lean 335 day-pairs — DIAG-GO (b) MET.

### Fine-bucket curves (mean kcal/day)

away_wild: 210→260→235→**203**→273→419→358 — flat through the
PRODTHROTTLE's >4-day region (203 at 4–7d), then ramps into glut
(rho +0.18). The curve ignores the throttle threshold entirely: the
channel has no feedback of its own.

scholar_home: 29→44→461→468→391→1160→1595 — the steepest glut ramp of
any channel (30+ bucket: 1,595 kcal/d). vs doomed: 26→55→185→221 in the
landed taxonomy; on this commit it feeds the glut pile directly. The
homecoming pool scales with village success — no pantry check at the
return (game.js returnToVillage ~8348 depositPantryPieces).

ambient:villagelives: 111→219→294→296→**308→279→311** — saturates at
~300/d across ALL glut buckets (flat: rho +0.03). Personality-driven
autonomous income; no feedback, but also no ramp — it doesn't chase
fullness, it just never backs off.

tribute: 398→302→117→325→409→556→872 — noisy U, ramps late. vs doomed:
252→468→710→162 (10k+ bucket noisy, n=74). Diplomatic intake.

share_surplus: 843→2508→2805→2719→3337→3831→4786 — monotonic, smooth
through every threshold. The funnel the SURPLUSFEED governor bends.

Permanent-glut configs: 13/16 (glutShare ≥ 0.40) — the substrate's
normal state holds on this commit (was 16/16 on the landed taxonomy
commit; master movement shifted survival, not the glut shape).

Wall numbers: won 0/16, national 5/16, table 14/16, wave4 14/16,
wave5 0/16, median 126d, max 180d, starveDays 0. The wall stands.

### Hook audit (binding question c) — per unthrottled channel

1. **away_wild** — intake: game.js ~15864 npcNodeTravel forage-return,
   `this.stockPantry(kcal, 'Foraged food', ...)` — SINGLE call site.
   Env-gate: clean (`_returnIntakeOn`, mirrors `_surplusFeedOn`).
   Conservation: the return calls no depleteRandomTile — the haul is
   abstract; a smaller haul breaks no ledger. Voice: the return line
   already exists ("returns from foraging the wilds"); the governor
   extends it once per glut stretch. **Verdict: CLEANEST HOOK — the
   DIAG names away_wild the single most-leverable unthrottled channel.**
2. **ambient:villagelives** — intake: game.js ~26747 villageLives BIG
   DAY `stockPantry(kcalBig, 'Foraged food')` — single site, but the
   beat is a villager's "day of their life" and the channel is
   personality-driven (generous shares all, selfish keeps half).
   Trimming it reads as "don't have a good day" — sense-risky.
   Verdict: technically hookable, NOT clean.
3. **tribute** — intake: hierarchy.js ~1100 depositPantryPieces, no
   pantry check. Refusing tribute has diplomatic cost; the canon-safe
   lever is a diversion (tribute → feast/relations), not a refusal.
   **Needs a Steve design call before any arm.** Verdict: NOT clean
   this arm.
4. **scholar_home** — intake: game.js ~8348 returnToVillage
   depositPantryPieces. The deposit is the SCHOLAR'S (the player's) own
   haul pooling home. Governing it overrides the player — sense-hostile.
   **Needs a design call; never a silent governor.** Verdict: NOT
   clean this arm. (Its 2.6% → 16.2% composition shift is the DIAG's
   biggest new finding — logged to the findings backlog.)
5. **traps** — objReturnEffect 'traps', 0.2% of marginal glut. Verdict:
   immaterial.

### DIAG-GO: MET on all four clauses

(a) 98.1% of marginal-glut inflow in named channels with measured
coefficients (unattributed 0.00%); (b) glut 1246 + lean 335 day-pairs;
(c) five hook verdicts with intake points, env-gate shapes,
conservation stories, voice plans; (d) **the single most-leverable
unthrottled channel: away_wild.**

### Metric review (§14)

- The DIAG-GO bar binds as written; no re-scoring. All four clauses MET.
- Same-commit control shift (curvecheck lesson, applied): this commit's
  DIAG control measures share_surplus 2.89x (landed 2.59x), away_wild
  1.53x (landed 1.29x), and a NEW composition: scholar_home 16.2%
  (landed 2.6%). Master movement between 2026-10-20 ~16:30Z and this
  commit (76421939b) reshaped the glut mix — the LEVER pilot is compared
  against the same-commit pilot control, not the landed taxonomy.
- The away_wild 0.9x lever bar was anchored to the landed 1.29x; the
  absolute bar (≤ 0.9x) still binds. The expected armed ratio (~0.75x)
  clears it on either base.
- The throttle verdict band (≥0.80 / ≤0.50) classified every channel
  cleanly again; the rho coefficient adds the slope dimension the
  ratio collapses. No channel needed the PARTIAL band.

### Convergence state

**DIAG-GO.** #570's inflow-side question is now answered with
coefficients: the village over-produces into gluts because five of its
six inflow channels have no pantry feedback — and the fine buckets show
the SHAPE: the funnel ramps monotonically (rho +0.21), the away returns
ramp into glut (rho +0.18), the scholar homecoming ramps steeply
(rho +0.07, ratio 30.96x — the fastest-growing channel on this commit),
tribute ramps late, ambient saturates flat at ~300/d. Only the duty
channels throttle (duty:fish rho −0.49, ratio 0.01x) and aid is
lean-responsive. The conditional lever activates: RETURNINTAKE on
away_wild.

## LEVER phase — RETURNINTAKE (conditional pre-registration ACTIVATED)

The DIAG named away_wild with a clean hook; the lever builds per the
conditional pre-registration (game.js `_returnIntakeOn` +
`returnIntakeGovernor`, called in npcNodeTravel's forage-return intake;
env-gated RETURNINTAKE=1, default OFF; hunger exemption mirrors the
throttle; voiced once per glut stretch; zero RNG draws on either path).

[PILOT RESULTS — complete 2026-10-21 ~08:00 CDT. One runtime restart
mid-pilot killed the belongfeast-armed leg; the three written legs were
verified complete and the missing leg was re-run alone on the same commit
(same lever code, same seeds — no corpus corruption).]

16 runs = seeds 8801–8804 × {leadfeast, belongfeast} × {control unset,
armed RETURNINTAKE=1}, 180d death-aware, same commit, same instruments.
Corpora: evidence/2026-10-21/perseed-prodrebuff-pilot/{control,armed}/;
aggregate: evidence/2026-10-21/prodrebuff-pilot-analysis.json.

Governor engagement: **93k kcal trimmed over 478 trim calls, 8/8 armed
runs** (rintGovCalls 21–133 per run) — the governor engages everywhere
glut days exist. Gate-off: zero trims, byte-identical trajectories
(proof 12/12 GREEN).

### PRIMARY (binding): away_wild glut/lean ratio — GO

| | lean ≤2 (kcal/d) | glut ≥7 (kcal/d) | ratio | rho |
|---|---|---|---|---|
| armed (RETURNINTAKE=1) | 374 | 160 | **0.44x** | −0.01 |
| control (unset) | 265 | 329 | 1.23x | +0.14 |

**Armed 0.44x ≤ 0.9x bar → PRIMARY GO.** The governor bends its channel
decisively: the glut-bucket inflow halves (329 → 160 kcal/d) and the
channel flips from pro-cyclical to flat (rho +0.14 → −0.01). The lean
answer is untouched (265 → 374 kcal/d — the rise is trajectory-divergence
composition, guardrail passes).

### GUARDRAILS (binding — a miss is NO-GO)

| guardrail | control | armed | bar | verdict |
|---|---|---|---|---|
| perm-glut day-pairs | 636 | 669 | ≤ 0.7x | **MISS (+5%)** |
| perm-glut configs | 6/8 | 8/8 | — | directionally wrong |
| lean away_wild inflow | 265 | 374 | ≥ control | PASS |
| starvation deaths | 0 | 0 | ≤ control | PASS |
| median survival | 126d | 180d | ≥ control−10d | PASS |
| laundering | — | aid_system, ambient:villagelives, events:special glut means > control+10% | == 0 | **MISS** |
| new death mechanism | — | none | none | PASS |

### VERDICT: KILLED-AFTER-PILOT (NO-GO)

Two binding misses, judged honestly:

1. **The glut didn't move.** Permanent-glut day-pairs 636 → 669 (+5%),
   configs 6/8 → 8/8. The governor bends its channel (0.44x) but
   away_wild is 5.4% of marginal glut inflow — trimming it cannot move a
   glut state dominated by share_surplus (62%) + scholar_home (16%) +
   tribute (10%). The lever's purpose was to reduce permanent glut; it
   didn't. A channel-level win that doesn't move the state is not a win.
2. **Laundering guardrail tripped.** aid_system (+12 kcal/d), ambient:
   villagelives (+32 kcal/d), events:special (tiny base) exceeded
   control+10% on the glut bucket. Mechanism note (§14 metric review):
   this is NOT conservation laundering — the trimmed kcal never enters
   any ledger (the return path calls no depleteRandomTile; the haul is
   simply smaller), so it cannot mechanically reappear elsewhere. It is
   trajectory divergence: the armed runs live different days (median
   survival 180 vs 126d), and aid_system is lean-responsive aid that
   flows when villages are in trouble. But the bar was written as a
   mechanical check and it binds as written — a miss is NO-GO, never
   re-scored against a friendlier interpretation.

Kill protocol: the lever is reverted zero-trace (`git checkout --
src/js/game.js` — the only uncommitted file; all 59 inserted lines were
the lever). No src/js changes land. Instruments + evidence + corpora
land as the killed-verdict record.

### Sense read (SENSE-TESTING LAW)

Transcript: evidence/2026-10-21/prodrebuff-armed-sense.txt (leadfeast
8802, 60d, armed).

**Verdict: the throttle reads as a villager making a choice — killed
for metric reasons, not for voice.** The beat: "Hunter looks at the
groaning pantry shelves and eats from the trail bag instead. 'No point
hauling what'll rot.'" followed by "🌿 Hunter returns from foraging the
wilds: +239 kcal to the pantry." It sits in the same register as the
landed PRODTHROTTLE beat ("Deborah checks the pantry before heading
out — the shelves are full, ~13 days of fresh on hand… leaves the
harvest standing and turns to the stone pile instead") — a person
reading the shelves and making the sensible call. Nothing about it
reads as a silent knob; the copy and the halved deposit agree. If a
future arm attacks a bigger glut channel with this governor shape, the
voice pattern is proven here.

### Village assessment (plain words)

Eight villages on each side of the treatment. The armed villages trim
their away-foragers' hauls ~93k kcal in aggregate — every trim is
voiced, every haul that lands is honestly smaller. And the pantries
look exactly the same: 51–92% of days at 7+ fresh-days, the dawn sweep
throwing out spoiled stores daily. The village is drowning in the
funnel's 4.3k/d and the scholar's homecoming 1.2k/d; bailing with the
foragers' 160 kcal/d teaspoon doesn't move the waterline. Who thrives:
nobody new — the armed median survival (180d) beats control (126d) on
8 seeds but the glut state is unchanged and the difference is
trajectory wobble, not a lever effect (no mechanism for it: the trim
is ~5% of glut inflow).

### Balanced panel (§15) — attempted, inexpressible, no bogus compare shipped

Same class as sim-surplusfeed-curvecheck-b (documented there): the
panel's case identity (`identity` in balance-panel.js) does not include
the RETURNINTAKE env treatment — RETURNINTAKE is not in `flagNames`
(verified: scripts/balance-panel.js:203), so an armed panel generation
would collide with unarmed case caches across the treatment boundary.
The panel's substrate is fixed by the §15 contract (POLICY_REGISTRY
policies, 150d — not leadfeast/belongfeast + FEASTSCALE_R13=1, 180d
death-aware), and its contract metrics don't cover the pre-registered
primary (away_wild glut/lean dose-response ratio from a call-path
instrument). No compare shipped; the before/after is the paired
dose-response analysis (scripts/analyze-prodrebuff-b.js) on identical
seeds, commit, and instruments.

### Metric review (§14)

- The LEVER-GO bars bound the run as written; the 0.9x primary bar was
  anchored to the landed 1.29x but binds absolutely — armed 0.44x clears
  it on either base. The same-commit pilot control measured away_wild
  1.23x (curvecheck lesson applied: same-commit comparison).
- The laundering bar's mechanical form tripped on trajectory
  divergence, not conservation failure. The bar stays as written for
  future arms; the mechanism note is recorded here, not used to
  re-score.
- The perm-glut bar did its job: it asked the only question that
  matters — does the glut move? It didn't. The kill is the finding.

### Convergence state

**DIAG-GO, LEVER KILLED-AFTER-PILOT.** #570's production-rebound
question is answered with coefficients (see DIAG results above); the
most-leverable unthrottled channel (away_wild) carries a working,
voice-honest governor that bends its channel (0.44x) — but the channel
is too small to move the glut state, and the guardrails tripped. The
axis's next question is now sharply defined: the glut is dominated by
share_surplus (62%, governor landed-OFF) and scholar_home (16%,
needs a steve-call design ruling — backlog entry appended). No
scale-wall movement (wins 0/32 across DIAG+pilot, wave-5 0/32).

### Wall numbers (this run, all phases)

DIAG 16 runs + pilot 16 runs: won 0/32, national 7/32, table 26/32,
wave-4 26/32, wave-5 0/32, median 126d, max 180d, starveDays 0.
The wall stands.
