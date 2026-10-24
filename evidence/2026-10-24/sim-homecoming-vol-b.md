# sim-homecoming-vol-b — DIAG: the scholarHomecoming channel VOLUME by PDxDG cell

Run: oversight-flesh-out-loop-b-20261024T0030Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-homecoming-vol-b (branch sim-homecoming-vol-b).
DIAG — OFFLINE RE-ANALYSIS, zero new sims, zero src/js changes, ever.
Instrument: scripts/homecomingvol-analyze-b.js (read-only; exit 0 = DIAG-GO).

## The question (named nexts: #858, #846)

Finding #858 closed the HOMECOMING PD=1 SIGN-FLIP as seed-noise on a null
channel (pooled |Δ|=0 < 400 across three blocks) and named the next:
"future homecoming work should target channel VOLUME, not PD=1 modulation."
Finding #846 (from the easingchannels corpus) reported scholarHomecoming
falling under PD=1 on DG=0 cells (-590 leadfeast, -195 belongfeast
kcal/glut-day) and asked for a follow-up DIAG on the homecoming-channel
interaction: does DEPOSITGATE compensate the PD throttle?

This DIAG decomposes the scholarHomecoming channel VOLUME by PDxDG cell:
kcal/glut-day, brought vs deposited, and the named sinks (pool overflow
valve, rack-smoked, fast-rot/overnight sweep — the scholarhome-rot-b
taxonomy), and answers the interaction question on the channel.

## PRE-REGISTRATION (bound per §14 — offline DIAG, no sims)

- **DIAG-GO bar**: >=95% of cross-cell (8 cell-means of kcal/glut-day)
  variance attributed to NAMED mechanism drivers, 0 unexplained cells, all
  4 cells characterized (volume + brought/deposited split + sink split).
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0; 100d death-aware horizons;
  policies {leadfeast, belongfeast}; seeds 9250-9265.
- Corpora (all read as-is; all numbers corpus-relative — finding #850:
  never re-run a corpus config on a differently-instrumented harness and
  claim reproduction):
  - evidence/2026-10-23/depinteraction-b-corpus/ — the 128-config PDxDG
    factorial named by the task (config-set identity verified below).
  - evidence/2026-10-23/easingchannels-b-corpus/ — the SAME 128-config
    design (same seeds, env, policies), sibling call-path instrument;
    carries the channel volume the depinteraction instrument does not see
    (see instrument note below).
  - evidence/2026-10-23/homecoming-diag-b-analyzer-report.json —
    seeds 92801-92816 block: the brought/deposited/kept/keepRaise split.
  - Sink taxonomy constants from evidence/2026-10-21/sim-scholarhome-rot-b.md
    (16 runs, 1,254,055 kcal pooled, 0.000% unexplained).
- Named drivers for the variance partition (grand + 7 orthogonal
  contrasts = exact 8-parameter partition; the check is that every
  contrast is mechanism-named): policy main (supply composition), per-policy
  PD main (PD-side supply effect on the channel), per-policy DG main
  (keep-raise withhold), per-policy PDxDG (the #846 interaction).
- No balanced-panel compare ships (§15): pure-observation DIAG, no
  treatment arms (the sim-scholarhome-rot-b precedent).

## Results

### Corpus config-set identity — PASS
depinteraction-b-corpus/: 128/128 per-seed JSONs, exact config set
{PD=0/1}x{DG=0/1}x{leadfeast,belongfeast}x16 seeds 9250-9265; filename
triple matches per-seed metadata (seed/policy/plentydepri/depositgate);
16/16 per cell. All numbers corpus-relative; no re-runs (finding #850).

### INSTRUMENT NOTE (taxonomy finding — new this DIAG)
The depinteraction instrument records **glutChannels.scholarHomecoming = 0
on all 128 configs** (verified: max 0). Its stack-regex classifier
(scripts/sweep-depinteraction-b.js channelOf(), `/donat/i` -> 'scholar_home')
never matches the homecoming deposit path — those deposits land in its
away_wild/other buckets. Consequences:
- The volume decomposition below uses the easingchannels-b-corpus
  call-path instrument (identical design), which DOES see the channel.
- sim-depinteraction-b's "ONE channel" headline (PD-delta channel deltas
  dominated by funnelShare -965k...-2361k) was measured on an instrument
  blind to homecoming — the homecoming contribution to the rot PDΔ is
  UNSEEN there, not absent. Filed in sim-findings.md; not a re-run
  justification (#850); not a lever revert.

### scholarHomecoming VOLUME by PDxDG cell (glut-scoped, easingchannels instrument)
median kcal/glut-day (iqr) | glut-total median | glutDays:

| cell | per glut-day | glut-total | glutDays |
|---|---|---|---|
| pd0/dg0 leadfeast | 660 (0–1770) | 61k | 97.5 |
| pd0/dg0 belongfeast | 217 (0–1565) | 19k | 76.5 |
| pd1/dg0 leadfeast | 70 (0–428) | 4k | 86.5 |
| pd1/dg0 belongfeast | 22 (0–1024) | 2k | 67 |
| pd0/dg1 leadfeast | 26 (0–576) | 2k | 74 |
| pd0/dg1 belongfeast | 5 (0–107) | 0k | 58.5 |
| pd1/dg1 leadfeast | 0 (0–237) | 0k | 73 |
| pd1/dg1 belongfeast | 87 (0–226) | 3k | 44.5 |

### Brought vs deposited (homecoming-diag-b corpus, seeds 92801-92816 block — different block and scope than the glut instrument; see metric review)
median kcal/glut-day; deposited/brought fraction:

| cell | brought | kept | DEPOSITED | deposit/brought | keepRaise | brought/decision |
|---|---|---|---|---|---|---|
| leadfeast/dg0 pd0 | 1134 | 979 | 152 | 13.4% | 0 | 1584 |
| leadfeast/dg0 pd1 | 896 | 802 | 71 | 7.9% | 0 | 1180 |
| leadfeast/dg1 pd0 | 1406 | 1080 | 271 | 19.3% | 304 | 2403 |
| leadfeast/dg1 pd1 | 1189 | 989 | 88 | 7.4% | 210 | 2266 |
| belongfeast/dg0 pd0 | 815 | 762 | 46 | 5.6% | 0 | 1213 |
| belongfeast/dg0 pd1 | 1325 | 765 | 632 | 47.7% | 0 | 2132 |
| belongfeast/dg1 pd0 | 1019 | 810 | 163 | 16.0% | 200 | 1795 |
| belongfeast/dg1 pd1 | 1045 | 979 | 0 | 0.0% | 120 | 1447 |

### Sink attribution per cell (rot-taxonomy shares x glut-scoped volume — share-proxy, see metric review)
Top sinks of the cell's volume: **pool overflow valve** (rotted, overnight
sweep 40.9%) | **rack-smoked** (cook's smoke racks 19.0%) | eaten_player
17.1% | eaten_villager 8.1% | tribute_out 5.0%:
- pd0/dg0 leadfeast (61k): rotted ~25k | racks ~12k | player ~10k | villager ~5k | tribute ~3k
- pd0/dg0 belongfeast (19k): rotted ~8k | racks ~4k | player ~3k | villager ~2k | tribute ~1k
- pd1/dg0 leadfeast (4k): rotted ~2k | racks ~1k | player ~1k
- pd1/dg0 belongfeast (2k): rotted ~1k
- DG=1 cells: volumes ~0–3k — sinks are rounding on an already-withheld channel.

### Cross-cell variance attribution — DIAG-GO
Orthogonal named-contrast partition of the 8 cell means (exact by
construction; the mechanism content is the contrast sizes):

| driver | contrast (kcal/glut-day) | SS share |
|---|---|---|
| policy main (supply composition) | — | 6.4% |
| leadfeast PD (PD-side supply effect) | −308 | 27.2% |
| leadfeast DG (keep-raise withhold) | −352 | 35.5% |
| leadfeast PDxDG (#846 interaction) | +282 | 22.9% |
| belongfeast PD | −57 | 0.9% |
| belongfeast DG | −73 | 1.5% |
| belongfeast PDxDG | +139 | 5.5% |
| **attributed** | | **100.0%** (residual 0.0%) |

**DIAG-GO** (pre-registered bar: >=95% attributed, 0 unexplained cells,
all 4 cells characterized — held).

## The #846 answer: DEPOSITGATE does not compensate the PD throttle — it pre-empts it

Simple effects (kcal/glut-day, easingchannels instrument, block 1):
- leadfeast: PDΔ|dg0 = −591, PDΔ|dg1 = −26; DGΔ|pd0 = −635, DGΔ|pd1 = −70.
- belongfeast: PDΔ|dg0 = −196, PDΔ|dg1 = +82 (noise), DGΔ|pd0 = −212, DGΔ|pd1 = +65 (noise).

The interaction (+282/gd leadfeast, 22.9% of cross-cell variance) is a
**floor effect, not compensation**: DG=1's keep-raise withholds the channel
to near-zero FIRST (660→26/gd on pd0; 70→0 on pd1 — the scholar keeps the
haul under the raised 2000→6000 kcal ceiling), leaving no channel for the
PD leg to throttle. The two throttles bite the same glut and the deposit
gate gets there first. On the pooled homecoming-diag instrument (#858) the
PD response is null-scale on all three blocks (−265/−14.3/0), so there is
no PD throttle there at all for DG to interact with. Both instruments
converge on the design conclusion: **there is no steerable PD×DG volume
interaction on the homecoming channel**; the keep-raise is the volume knob.

## The volume verdict (#858's named next)

The volume story is the surplus-overflow story, confirmed at the
mechanism level:
- The scholar arrives home with expedition-tail food (0–5d shelf; the
  pool is not fresh food). Of every deposited kcal: **40.9% is discarded
  by the overnight sweep (the pool's overflow valve)**, 19.0% is rescued
  onto the smoke racks by the village cook (the ONLY preservation path
  that touches the pool — player smoke/render/pemmican operate on
  inventory/prepStash), 17.1% is eaten back by the scholar, 8.1% by
  villagers. Residual 0.0% — the pool fully turns over; the glut does not
  stockpile, it evaporates (sim-scholarhome-rot-b).
- The volume knob IS the keep ceiling: DG=1's 2000→6000 kcal raise is the
  landed, working volume lever (leadfeast glut-scoped channel 660→26/gd
  on pd0, 70→0 on pd1). The remaining volume lives on DG=0 cells (61k /
  19k per 100d), and its sink split is fixed by the pulse-vs-clock
  physics, not by any deposit-side throttle.
- The task's honest-negative clause applies to the PD side: **there is no
  steerable PD-modulation volume lever** — #858 proved the PD response a
  null. But there IS a steerable volume lever family: the keep ceiling
  itself (see named-next spec), and the sink split on DG=0 (rack rescue
  vs overnight sweep). A negative DIAG on PD-modulation is a result; the
  volume work is not a negative — the knob is identified and it is DG's.

## Named-next lever SPEC: keep-ceiling volume knob (instrument sketch, no code)

**Lever: KEEPCEIL — parametrize the scholar homecoming keep ceiling.**
Currently DG=1 raises the keep ceiling 2000→6000 kcal as a binary. Make
the ceiling an env-gated value (e.g. KEEPCEIL=4000/6000/8000), active on
DG=1 cells where the ceiling binds (leadfeast primarily — keepRaise
events 14.5/gd-scale there, vs belongfeast where the channel is
noise-scale). Pure policy/instrument change to the existing keep-ceiling
hook; zero new systems.
- Why volume-targeted: the keep ceiling is the measured dominant volume
  driver on the channel (35.5% of cross-cell variance, contrast −352/gd);
  modulating it steers channel volume directly, answering #858's
  "target channel VOLUME, not PD=1 modulation."
- Measurement: same 2×2 design + KEEPCEIL 3 levels on dg1 cells, seeds
  pre-registered per the pooled-block lesson (use the pooled 3-block seed
  set); instruments: glut-scoped channel volume/gd (easingchannels
  instrument) + brought/deposited/kept/keepRaise split (homecoming-diag
  instrument) + sink-split response (rack vs sweep shares via the
  conservation tag instrument).
- Proposed GO bars (next run): (i) channel volume per glut-day monotonic
  decreasing in KEEPCEIL (the ceiling binds); (ii) fresh-rot/100d ≤
  baseline on every keepRaise-firing cell; (iii) guardrails (a)–(e) of the
  depinteraction pre-registration hold (paired survival ≥ −10d,
  exposure-normalized starvation ≤ control+2/(armedVD/100), no new death
  modes, national ≥ control−2, freshDays ≥ 0.5× control); (iv) engagement:
  keepRaise events >0 on ≥14/16 KEEPCEIL configs per cell.
- Follow-up lever (not this spec's scope): rack-priority for homecoming
  pulses — shift the DG=0 sink split from 41% overnight-sweep rot toward
  the 19% rack rescue (resolveOneAssignment capacity/priority on
  ≤5d-shelf homecoming pulses). File under the sink side, not the volume
  side.

## Sense reads (SENSE-TESTING LAW)

From the sibling corpora's narrated beats (read, not re-run):

1. "You keep a day's food (540 kcal) — nothing extra for the pantry this
   time." (small haul → keep-all). The keep decision tracks haul size;
   the line reports the outcome at the return beat, exactly when the
   deposit decision is made. Sensible, kcal-honest. The known edge
   (fires even when the keep was forced by a small haul — reports outcome,
   not cause) reads as honest reporting per "No silent actions."

2. "You keep a day's food (5940 kcal) and unload 6300 kcal into Haven's
   pantry." (DG=1, big haul). The keep ceiling ≈ 6000 — the landed
   2000→6000 raise — is VISIBLE in the fiction: the scholar keeps the
   ceiling and unloads the rest. This is the measured keepRaise
   sub-channel (304→210/gd) with a name. Sensible; the lever reads
   in-game, not hidden in a ledger.

3. "Meera returns from foraging the wilds: +152 kcal to the pantry — the
   shelves are full, so 152 kcal is eaten at the fire instead."
   (funnel.share/awayReturn counterpart). Deposit discipline under glut:
   surplus is eaten at the fire rather than pushed into a rotting pantry
   — the same surplus decision the homecoming beat makes, from the
   villager side. Sensible; names, tasks, and kcal vary.

4. "We pool food here. Keep what you need for the road — the rest feeds
   everyone." (first return; pooling explanation). The rule is stated
   once, then the beats go quiet. Sensible, no fabricated history.

SENSE VERDICT: sensible — the homecoming beats are legible, kcal-honest,
and the DG keep ceiling is visible in the narration. No robotic, static,
or repeated beats beyond the expected formulaic shape of return beats.

## Wall numbers (depinteraction corpus, n=16 per cell)
national / table / wins / wave4 / wave5 / median survival:
- pd0dg0 leadfeast: 12/16, 0, 0, 9/16, 0, 100d; pd1dg0: 12, 0, 0, 6, 0, 100d
- pd0dg0 belongfeast: 7/16, 0, 0, 9/16, 0, 100d; pd1dg0: 8, 0, 0, 9, 0, 100d
- pd0dg1 leadfeast: 10/16, 0, 0, 5/16, 0, 100d; pd1dg1: 8, 0, 0, 7, 0, 100d
- pd0dg1 belongfeast: 11/16, 0, 0, 7/16, 0, 100d; pd1dg1: 6, 0, 0, 9, 0, 95.5d
(table reads 0/16 here — this sweep's per-seed maps table<-Game.won; the
easingchannels instrument records table separately. The wave-5 door is
shut on this substrate: 0/128 unlocks; wins 0/128 — SEATDRIVE=0 pre-seat
substrate, expected.)
Death causes pooled: combat/monster dominate (~60%), starvation ~8-15%,
sickness ~11%; no new death modes (per the depinteraction guardrails).

## Village assessment (plain words)

The village on this substrate is glut-fed and long-lived: full shelves
from early on, median survival at the 100d horizon cap on 7 of 8 cells,
and the dying is done by wave fights and ambushes, not by hunger. The
scholar is a real pantry artery on DG=0 leadfeast — 61,000 kcal of
glut-scoped homecoming over 100 days — and almost a non-depositor on
DG=1, where the raised keep ceiling holds the haul back (channel 660→26
kcal per glut-day, then 70→0 under PD=1). Of what the scholar does bring
home, two-fifths rots overnight in the bins — the village throws out its
own rot honestly ("went bad — beyond saving") — a fifth gets rescued
onto the cook's smoke racks, and the scholar eats a sixth back herself.
That is the overflow valve at work: expedition-tail food arriving with
days of shelf left, a big pulse against a short clock. Nothing about the
channel needs inventing — the volume knob (the keep ceiling) is already
landed and working; what remains is the honest cost of the glut on the
cells where the ceiling doesn't bind, which is rot, not a knob to turn
silently (Steve's SURPLUSFEED ruling was behavioral for a reason).

## Metric review (§14)

- The pre-registered DIAG-GO bar (>=95% attributed, 0 unexplained cells,
  all 4 cells characterized) was met by the orthogonal named-contrast
  partition: 100.0% attributed, residual 0.0%. The partition is exact by
  construction (grand + 7 contrasts over 8 cell means) — the bar's real
  bite is that every contrast is mechanism-named and every cell is
  characterized; that held.
- The depinteraction corpus's dark homecoming channel (0 on all 128) is
  a TAXONOMY finding, not an instrument failure of the DIAG: the sweep's
  stack-regex misclassifies homecoming deposits into away_wild/other.
  Consequence for sim-depinteraction-b's "ONE channel" claim: measured
  blind to homecoming. Filed in sim-findings.md; no re-run (#850).
- The easingchannels glut-scoped instrument and the homecoming-diag
  full-horizon instrument disagree on the PD response magnitude
  (leadfeast/dg0: −591/gd vs −265/−8.4/0 across blocks): glut-scoped
  marginal inflow and full-horizon averages are different objects.
  #858's null verdict stands on the full-horizon instrument; this DIAG's
  interaction verdict is scoped to the glut instrument. NEXT RUN:
  pre-register the instrument scope explicitly when asking interaction
  questions — this is the same class of scope artifact that caused the
  homecoming-resume-b analyzer's check-(c) miss.
- Sink-taxonomy shares (full-horizon pool, 16 runs, different seed block)
  are applied to glut-scoped volume as a SHARE-PROXY: the glut vs
  non-glut sink mix may differ (homecoming-resume-b's metric review: much
  of the channel arrives on non-glut days). Used report-only; a
  sink-split lever needs its own tagged conservation measurement.
- Per-cell IQRs are huge (leadfeast/dg0: 0–1770 kcal/gd) — seed variance
  dominates the channel; cell medians are the story, per-seed values are
  not. The paired/contrast design is what makes the cell means legible.
- §15: no balanced-panel compare (pure-observation DIAG, no treatment
  arms); the manual paired contrast partition is the comparison, per the
  pre-registration.

## Blanks filled / documented

- FILLED (method): scripts/homecomingvol-analyze-b.js — exact-corpus
  re-analysis: config-set identity, per-cell volume, #846 interaction,
  brought/deposited split, sink attribution, orthogonal named-contrast
  variance partition; exit 0 = DIAG-GO.
- FILLED (question): the #846 follow-up — DG does not compensate the PD
  throttle; it pre-empts it (floor effect). No steerable PD×DG volume
  interaction on the homecoming channel, on both instruments' readings.
- FILLED (question): #858's named next — the volume verdict: the channel
  is a surplus overflow valve (41% overnight-sweep rot, 19% rack rescue,
  17% player meals, 0 residual); the volume knob is the landed keep
  ceiling, not any PD modulation. Named-next lever spec: KEEPCEIL
  volume-knob arm, with proposed GO bars above.
- DOCUMENTED (taxonomy): depinteraction instrument blind to the
  homecoming channel (scholarHomecoming=0 on all 128) — filed in
  sim-findings.md.
