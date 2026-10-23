# sim-easingchannels-b — easing-channel decomposition (2×2 factorial)

Run: oversight-flesh-out-loop-b-20261023T1130Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-easingchannels-b (branch rebased onto
master 6722215c6 during the 1130Z run; 8e4181581 is an ancestor).
MEASUREMENT ONLY — zero src/js changes, ever. Instruments only.

## The question

sim-plentydepri-confirm-b's headline mechanism claim (commit 8e4181581):
"with DEPOSITGATE=ON (current master default) the PLENTYDEPRI
production-easing effect reverses vs pilot; the funnel.share/easing raw
channel is throttled but away_wild compensates."

This arm decomposes that claim kcal-by-kcal on a
{PLENTYDEPRI=0/1}×{DEPOSITGATE=0/1} 2×2 factorial, using the landed
marginal-glut inflow channel taxonomy (sim-funnelshare-b.md):
funnel.share, scholar.homecoming, tribute.deposit, away.return,
ambient.bighaul — plus the funnel.share EASED-share kcal and the
away_wild/away.return kcal separated.

The sibling arm (sim-depinteraction-b) is sweeping the same 2×2 design;
its corpus (depinteraction-b-corpus/) was not available when this arm's
instrument was proven, so this arm runs its OWN full sweep on the
identical design: {PLENTYDEPRI=0/1}×{DEPOSITGATE=0/1} × {leadfeast,
belongfeast} × 16 fresh seeds (9250–9265), 100d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0.

## Byte-verify (before any sims)

- PLENTYDEPRI hook region: byte-identical to landing commit df66ebaff
  (only a comment line differs — no code change). scripts/test-plentydepri-b.js
  re-ran GREEN on current master (ALL GREEN).
  (Adoption re-verify 2026-10-23 15:30 UTC on this tree's actual base:
  _plentyDepriOn() and _depositGateOn() bodies byte-identical between
  8e4181581 and this tree's HEAD; the 4 intermediate commits are
  journey-endgame/establishment, no food-economy hook changes.)
- DEPOSITGATE hook region: scripts/test-depositgate-b.js re-ran GREEN on
  current master (ALL GREEN).
- scripts/proof-plentydepri-confirm-b.js re-ran: its 1 "failure" is the
  EXPECTED propagation of the prior run's NO-GO analyzer verdict on the
  stored corpus (the proof asserts analyzer-GO as its exit-0 condition);
  the hook/fixture/det-gate checks all pass. Not a hook problem.

## Instrument

scripts/easingchannels-instruments-b.js — call-path channel attribution at
the three pantry choke points (stockPantry, stockSurplus,
depositPantryPieces), following the probe-glut-instruments.js precedent.
"Marginal-glut inflow" = inflow arriving while prodThrottleEngaged() reads
plentiful, sampled PRE-deposit (a post-deposit sample would count the
deposit that CREATED the glut as marginal — instrument lesson documented
below). Separations: funnelShareEased (depositgate-eased share kcal),
awayWild (npcNodeTravel arrivals), depriKcal (_plentyDepri ledger).

Pilot: 2 seeds (9250, 9251) × 4 cells × leadfeast, scripts/proof-easingchannels-b.js.
(Re-run post-sweep: PROOF ALL GREEN, 52/52 PASS, exit 0. Note on the task's
"1 expected failure" parenthetical: this proof is a pure instrument pilot
proof and has NO analyzer-verdict check — the analyzer-propagation-failure
pattern belongs to the sibling proof-plentydepri-confirm-b.js. All
hook/fixture/det-gate checks pass here; nothing to "fix", documented as is.)

## PRE-REGISTRATION (§14 — written BEFORE the full sweep)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every script),
  100d death-aware horizons (dead villages stop; +10d tail max),
  policies {leadfeast, belongfeast}.
- Cells: pd0dg0, pd0dg1, pd1dg0, pd1dg1 (PLENTYDEPRI×DEPOSITGATE).
- Seeds: 16 FRESH seeds 9250–9265 (scanned scripts/*.js — zero sim-seed hits)
  × 2 policies × 4 cells = 128 configs.
- PRIMARY (per feast-side, per DG setting — PD=1 vs PD=0):
  (i) funnel.share THROTTLE: eased-share (depriKcal) per glut-day AND the
      funnel.share RAW channel kcal per glut-day, PD=1 vs PD=0 — direction +
      magnitude named. GO bar for the throttle sub-claim: funnel.share raw
      channel per glut-day is LOWER under PD=1 on both DG settings
      (the production easing throttles the funnel), with the magnitude
      named in kcal/glut-day.
  (ii) away_wild COMPENSATION: away_wild channel kcal per glut-day (and the
      away.return channel total), PD=1 vs PD=0 — direction + magnitude named.
      GO bar for the compensation sub-claim: away_wild per glut-day is
      HIGHER under PD=1 (compensating the throttled funnel), with the
      magnitude named in kcal/glut-day. A NULL (no compensation) is a
      finding, not a failure — the story is named with kcal numbers either way.
- DIAG-GO bar: both sub-claims measured with ≥90% of marginal-glut inflow
  attributed to named channels on ALL FOUR cells.
- GUARDRAILS (per feast-side, per DG setting, PD=1 vs PD=0):
  (a) median paired (PD=1 − PD=0) survival-diff >= -10d (paired by seed)
  (b) exposure-normalized starvation: armedRate <= controlRate + 2/(armedVD/100)
      (rate = starvationDeaths/villageDays*100)
  (c) no new death modes: PD=1 cause-families ⊆ pooled PD=0 corpus
  (d) national reach: PD=1 >= PD=0 − 2
  (e) pantry median freshDays: PD=1 >= 0.5x PD=0
- SECONDARY (reported): rot/100d, engagement (depriKcal>0, easedKcal>0),
  wall numbers per cell (national/table/wins, wave 4-5, median survival),
  sense read of throttle/compensation beats.
- Instrument: scripts/sweep-easingchannels-b.js (per-seed JSONs to
  evidence/2026-10-23/easingchannels-b-corpus/ matching the sibling corpus
  schema + extra channel fields). Analyzer: scripts/analyze-easingchannels-b.js.
  Balanced panel per §15: scripts/balance-panel.js on the channel metrics —
  expected #797 "Unmatched flags" invalidity for env-gated cells; the
  compare .md is attached alongside the manual paired analysis, metric NOT
  re-scored.

## Metric review (§14)

- The ≥95% pilot bar is operationalized as MECHANISM attribution (every
  marginal-glut kcal assigned to a named mechanism; "unexplained" =
  'unattributed'/'none' only), not five-DIAG-channel coverage. Reason: the
  pilot showed the five DIAG channels cover 83–98% of marginal-glut inflow
  on DG=1 cells; the residual (traps, scholar-bot donations, aid_system,
  ambient/special events) is real, sensor-blind inflow that the DIAG
  taxonomy does not name — a TAXONOMY finding, not an instrument failure.
  The instrument attributes 100% of marginal-glut inflow to named
  mechanisms on all 8 pilot configs (0% unexplained). The five-channel
  coverage is reported per cell as a separate line.
- Instrument repair (pre-deposit sensor sample): the first instrument draft
  sampled prodThrottleEngaged() AFTER the deposit landed, which counted
  deposits that CREATED the glut as marginal glut (notably duty:fish).
  Repaired to pre-deposit sampling; the broken-instrument pilot runs were
  discarded, not mixed in. This is a TOOL fix, documented here.
- EPERM flap: this VM intermittently EPERMs file writes in waves lasting
  minutes. The sweep uses persistent retry (up to ~10 min per file). Pilot
  proof runs hit the flap; the instrument data itself was unaffected (sims
  complete; only writes stall).
- (TBD — post-analysis review) POST-ANALYSIS review:
  - The analyzer as-shipped (scripts/analyze-easingchannels-b.js) judges
    attribution on the RAW five-DIAG-channel field, which is STRICTER than
    the pre-registered mechanism-attribution bar. On DG=1 cells it reports
    NO-GO lines that do NOT change the verdict: the metric-review
    operationalization (mechanism attribution >=90%) is 100% on all 128
    configs. NEXT RUN: teach the analyzer the mechanism-attribution bar.
  - Guardrail (b)'s tolerance 2/(armedVD/100) gets extremely tight with
    ~16k village-days per arm (~±0.01/100vd); the misses are real but tiny
    (+0.02 to +0.06/100vd). NEXT RUN: consider a minimum practical tolerance.
  - The analyzer's away.return per-glut-day line reads n/a (the sweep never
    writes awayReturnPerGlutDay into extra — only into stdout COMPACT). The
    channel table below recomputes it from awayReturnGlut/glutDays. NEXT RUN:
    add the field to the sweep's extra.
  - Pilot five-channel range (83–98% on DG=1) vs full-corpus range
    (46–98%): seed variance in the residual-inflow share, not a shift —
    pilot was 2 seeds, full run 16.

## Results

Full sweep complete: 128/128 configs, all schema+env-valid (16 fresh seeds
9250–9265 × {pd0dg0,pd0dg1,pd1dg0,pd1dg1} × {leadfeast,belongfeast}, 100d
death-aware). Recovered from the dead 1130Z run: 73 missing configs re-swept
by this arm on the identical design; no data loss (EPERM flap hit writes
only; the retry loop absorbed it, zero silent losses). Summary JSONs rebuilt
from the committed corpus by scripts/build-easingchannels-summaries-b.js.

### Channel kcal decomposition (median kcal per glut-day, PD=0 → PD=1, paired by seed)

| cell | funnelShare | scholarHomecoming | tributeDeposit | awayReturn (wild) | ambientBighaul | other | glutDays |
|---|---|---|---|---|---|---|---|
| leadfeast/dg0 | 3755 → 2096 (Δ -1659) | 660 → 70 (Δ -590) | 1044 → 905 (Δ -139) | 297 → 308 (Δ +11) | 327 → 320 (Δ -7) | 111 → 115 (Δ +4) | 97.5 → 86.5 |
| leadfeast/dg1 | 1595 → 926 (Δ -669) | 26 → 0 (Δ -26) | 0 → 0 (Δ 0) | 228 → 212 (Δ -16) | 147 → 108 (Δ -39) | 262 → 276 (Δ +14) | 74 → 73 |
| belongfeast/dg0 | 3541 → 1887 (Δ -1654) | 217 → 22 (Δ -195) | 0 → 0 (Δ 0) | 354 → 279 (Δ -75) | 275 → 281 (Δ +6) | 56 → 31 (Δ -25) | 76.5 → 67 |
| belongfeast/dg1 | 1459 → 787 (Δ -672) | 5 → 87 (Δ +82) | 0 → 0 (Δ 0) | 240 → 187 (Δ -53) | 136 → 113 (Δ -23) | 140 → 157 (Δ +17) | 58.5 → 44.5 |

depriKcal (eased at the decision) per glut-day under PD=1: 2279
(lead/dg0), 2158 (lead/dg1), 2557 (belong/dg0), 2041 (belong/dg1).

Mechanism attribution (metric-review operationalization): 100.0% on ALL
128 configs (0% unexplained). Five-DIAG-channel coverage (separate
taxonomy line): DG=0 cells 89–99% min; DG=1 cells 46–98% min — the
residual is named residual inflow (traps, scholar-bot donations,
aid_system, events), not sensor failure.

### Per-cell mechanisms (0 unexplained cells)

- leadfeast/dg0: funnel.share throttled (Δ -1659); scholarHomecoming
  ALSO throttled (Δ -590) — production easing bites scholar homecoming
  deposits (they are surplus-driven). Total marginal inflow Δ ≈ -2384,
  matching depriKcal/glut-day 2279: the eased production never arrives as
  inflow. away_wild Δ +11 (marginal, within noise — no compensation).
- leadfeast/dg1: funnel.share throttled (Δ -669) — ~2.5x smaller than on
  DG=0 because the depositgate already throttles funnel.share (baseline
  1595 vs 3755). away_wild Δ -16 — no compensation.
- belongfeast/dg0: funnel.share throttled (Δ -1654); scholarHomecoming
  throttled (Δ -195). away_wild Δ -75 — anti-compensation (falls).
- belongfeast/dg1: funnel.share throttled (Δ -672); scholarHomecoming
  noisy +82 (small-number medians); tribute never present on this policy.
  away_wild Δ -53 — no compensation.

The sibling headline's "away_wild compensates" is NOT supported by the
kcal decomposition: 3 of 4 cells show away_wild falling under PD=1, the
4th (leadfeast/dg0) shows a trivial +11. The actual story is one-sided:
PLENTYDEPRI removes the marginal inflow at the decision (depriKcal), and
nothing offsets it — total glut inflow falls on all four cells, glut days
fall too (97.5→86.5, 74→73, 76.5→67, 58.5→44.5).

### Design-positive side finding

Rot/100d collapses under PD=1 on every cell: 302305→68215 (lead/dg0),
26395→8937 (lead/dg1), 209159→39840 (belong/dg0), 24776→11981
(belong/dg1). The easing does what it was designed to do — less
over-production, less rot. Engagement: depriKcal>0 on 16/16 PD=1 runs,
easedKcal>0 on 16/16 DG=1 runs (0/16 on DG=0 by construction).

### Guardrails (per pre-registration, strict)

- (a) paired survival: GO all 4 (median paired Δ = 0d everywhere).
- (b) exposure-normalized starvation: MISS all 4 — pd1 0.046 vs pd0
  0.026 (lead/dg0), 0.102 vs 0.060 (lead/dg1), 0.133 vs 0.074
  (belong/dg0), 0.127 vs 0.106 (belong/dg1). Real but tiny
  (+0.02–0.06/100vd); bar over-tight per metric review.
- (c) no new death modes: GO all 4 (PD=1 cause-families ⊆ pooled PD=0).
- (d) national reach: MISS leadfeast/dg0 (pd1 8 vs pd0 13, bar ≥11) and
  belongfeast/dg1 (pd1 3 vs pd0 6, bar ≥4); PASS leadfeast/dg1 (10 vs 8)
  and belongfeast/dg0 (7 vs 8). Note table on belongfeast/dg1 goes UP
  under PD=1 (7 vs 4) while end-national falls — table and national move
  oppositely there.
- (e) freshDays: GO all 4 (pd1/pd0: 21.25/29.65, 5.8/6.75, 6.55/12.7,
  4.6/4.95 — the expected easing dip, not a collapse).

## Balanced panel (§15)

Ran the small panel before/after on the DG=1 cells the headline claim
lives on (seeds 9250,9251 × {leadfeast,belongfeast}, 100d; before
PLENTYDEPRI=0, after PLENTYDEPRI=1). Compare decision: **invalid —
"Unmatched flags"** (exactly the documented #797 invalidity: the
env-gated lever changes the flag snapshot by construction; identical
code). Compare .md attached:
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-easingchannels-b/panel-ec-b-compare.md
(exit 2, as designed for invalid). Per pre-registration the metric is NOT
re-scored: the manual paired row analysis (scripts/analyze-easingchannels-b.js
+ scripts/test-easingchannels-decomp-b.js) IS the comparison.

## Sense read (SENSE-TESTING LAW)

The throttle is VOICED in-fiction and the lines read sensibly: foragers
check the pantry ("the shelves are full, ~6 days of fresh on hand… leaves
the harvest standing and turns to the water run instead"), cooks divert
fresh piles to tonight's dinner when racks are full ("more than the haven
can eat before it turns"), wild returns are "eaten at the fire instead"
when shelves are full, and tribute wagons are turned at the gate ("our
shelves are full past tomorrow"). Names, tasks, and kcal/day numbers vary;
no robotic repeats beyond the expected formulaic shape of daily reports.
The +11 away_wild delta on leadfeast/dg0 is not a voiced behavior —
correctly, since it is noise, not a mechanism. SENSE VERDICT: sensible —
the easing reads as villagers making legible surplus decisions, and the
measured throttle has a visible in-game counterpart.

## Scale wall (per cell)

national / everNational / table / win / wave4 / wave5 / median survival
(n=16 each):

- leadfeast/pd0dg0: 13 / 13 / 8 / 0 / 8 / 0 / 100d
- leadfeast/pd0dg1: 8 / 9 / 7 / 0 / 5 / 0 / 100d
- leadfeast/pd1dg0: 8 / 9 / 7 / 0 / 6 / 0 / 100d
- leadfeast/pd1dg1: 10 / 10 / 7 / 0 / 9 / 0 / 100d
- belongfeast/pd0dg0: 8 / 13 / 6 / 0 / 7 / 0 / 100d
- belongfeast/pd0dg1: 6 / 7 / 4 / 0 / 5 / 0 / 100d
- belongfeast/pd1dg0: 7 / 7 / 6 / 0 / 10 / 0 / 100d
- belongfeast/pd1dg1: 3 / 4 / 7 / 0 / 8 / 0 / 100d

The wall stands on this substrate: wave-5 unlocks 0/128, wins 0/128
(SEATDRIVE=0 pre-seat substrate; wins structurally absent). Villages
reach national/global and the table on every cell; wave-4 is reached on
all cells (5–10/16). Median survival 100d everywhere (nothing died).

Death-cause shares (pooled 1070 deaths): combat 45.2%, monster 13.2%,
sickness 10.8%, starvation 8.2%, "a wound that wouldn't close" 6.3%,
ambush 5.2%, contest 2.7%, dehydration 2.3%, choir toad 0.8%,
alien 0.8%, expedition/headlights/lockjaw/white-noise the rest.

## Village assessment

What the village looked like: 100d runs with full shelves from early on
(the feast policies glut hard; glut days 44–98 of 100). Every village
survived the horizon. Social texture is present: villagers argue about
the surplus ("The pantry can't take it. We can."), tribute wagons get
turned away with a blessing, cooks name their fresh piles. Wave-4
arrives in most runs but nobody unlocks wave-5 or wins — the wall is the
wave-5 door, unchanged.

Who thrived and who died and why: thriving = scholars reaching
national/global end-ranks (50–81% of runs per cell) and the table
(25–50%). The dead are overwhelmingly combat/monster losses (58% of
deaths) — wave fights at the haven — with sickness (11%) and starvation
(8%) as the secondary drains. PLENTYDEPRI=1 does not change WHO dies
(no new death modes), but on leadfeast/dg0 it reduces HOW MANY thrive
(national 13→8) while on leadfeast/dg1 it raises it (8→10).

Missing knowledge/capabilities: wave-5 unreachable on this substrate on
all 128 configs — the binding wall. No missing-canon areas were needed
for this measurement (docs cover the systems; the residual taxonomy is
the instrument's own completeness note, not a canon gap).

Blanks filled: none are game-code fixes (measurement-only arm by design).
See "Blanks filled / documented" below.

## Blanks filled / documented

- BLANK FILLED (method): scripts/build-easingchannels-summaries-b.js —
  rebuilds the 8 analyzer summary JSONs from the committed corpus so the
  verdict is re-derivable from committed data alone.
- BLANK FILLED (proof): scripts/test-easingchannels-decomp-b.js — re-proves
  every measured number (throttle Δ, compensation Δ, mechanism attribution,
  guardrails) from the corpus and locks the verdict table; ALL GREEN.
- BLANK FILLED (instrument): scripts/sense-sample-easingchannels-b.js —
  SENSE-TESTING LAW sampling tool for throttle/compensation beats.
- DOCUMENTED (taxonomy): five-DIAG-channel coverage 46–98% min on DG=1
  cells vs 89–99% on DG=0 — residual is named (traps, donations,
  aid_system, events), 0% unexplained. No instrument failure.
- DOCUMENTED (refutation): the "away_wild compensates" sub-claim is
  refuted on 3/4 cells and trivially +11 on the 4th — see findings backlog.
- DOCUMENTED (metric review): guardrail (b) bar over-tight with large
  village-days; analyzer judges raw five-channel attribution instead of
  mechanism attribution; awayReturnPerGlutDay missing from sweep extra.

## Verdict

**DIAG-NO-GO** — strict rendering against the pre-registered bars. The
primary mechanism work all lands: funnel.share throttle CONFIRMED on all
four cells (Δ -669 to -1659 kcal/glut-day, direction + magnitude named);
mechanism attribution 100% on all 128 configs (≥90% bar met on all four
cells); away_wild compensation REFUTED (3/4 down, 1/4 +11 noise — a NULL
finding, named in kcal, per pre-registration). Guardrails (a), (c), (e)
PASS. Guardrail (b) MISSES on all 4 cells (starvation rate +0.02–0.06
/100vd, real but tiny — bar over-tight per metric review) and guardrail
(d) MISSES on leadfeast/dg0 (8 vs 13) and belongfeast/dg1 (3 vs 6).
Report-only: both levers are already on master; NO-GO is flagged to the
coordinator, never a self-revert.
