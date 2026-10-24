# sim-bufferdepri-b — PLENTYDEPRI=2 buffer-aware easing lever

Run: oversight-flesh-out-loop-b-20261024T0130Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-bufferdepri-b.

## The question (origin: sim-depinteraction-b + sim-easingchannels-b, 2026-10-23)

PLENTYDEPRI=1 collapses rot/100d 4–6x (the design value), BUT the glut is
also the buffer: exposure-normalized starvation rose +0.02–0.06/100vd on
every cell and national reach fell on 2 cells (leadfeast/dg0 13→8,
belongfeast/dg1 6→3; findings #847, #849). Root cause (mechanism-carried,
never freehand): the throttles cut the GLUT, and the glut was also the
BUFFER — on seeds that turn lean, the armed village's floor is thinner.

The lever: **PLENTYDEPRI=2 = buffer-aware easing.** The plenty-depri ease
STANDS DOWN when the pantry buffer is thin. The engine's plenty definition
is binary (duty-PRODTHROTTLE's ">4 fresh days"; hungryStreak>=3 stands it
down) — it has NO thin/thick concept. So "thin" is read from the engine's
OWN deep-reserve sensor — pantryDaysEstimate() (whole pantry:
fresh+preserved+rendered+pemmican, at the measured burn rate) — against the
SAME >4 line. No new threshold (see "Design question" below).

Implementation (one env-gated gate edit in src/js/game.js, zero behavior
change when unset):
- `_plentyDepriBufferClear()`: true unless PLENTYDEPRI=2 AND
  pantryDaysEstimate() <= 4. Read-only (no state writes, no RNG), so
  gate-off and PD=1 trajectories cannot diverge through it.
- `villagerDayProduction`: when the sensor reads plentiful but the buffer
  gate fails, the villager keeps hauling (full production, own meal
  untouched); the ledger records standDown/standDownKcal/standDownVids.
- `_plentyDepriDayVoice`: the stand-down is voiced once per day (own day
  guard, rotating speaker, per-speaker line key, deterministic) — the
  PRODTHROTTLE hunger-exemption voice pattern. Never silent.

PD=1 behavior is byte-identical (the new branch is unreachable unless
PLENTYDEPRI=2; browser default unchanged — typeof process === 'undefined'
returns true from the buffer gate).

## Design question (engine definition coverage)

The engine's plenty definition does NOT cover this gate's "thin" — it is
binary (>4 fresh days). This lever reuses the SAME >4 line on the engine's
existing deep-reserve sensor (pantryDaysEstimate). Whether "thin" should
instead mean a fresh-days margin above 4 (e.g. ease only when freshDays is
comfortably above the line) is a STEVE-CALL design question, documented
here, not a new constant. The pilot/full sweep measures whether the
deep-reserve reading repairs the starvation guardrail without losing the
rot design value.

## Hook verification (pre-sweep, REQUIRED GREEN)

- scripts/test-bufferdepri-b.js: ALL GREEN (44/44) — RED (PD=0) gate
  unreachable; PD=1 easing math + voice re-asserted identical to landed;
  PD=2 buffer-clear eases exactly like PD=1; PD=2 buffer-thin stands down
  (no easing, ledger standDown(Kcal) counts, stand-down voice once/day,
  idempotent, real-villager speaker); invariants carried over (hunger
  stretch, lean pantry, no-surplus, determinism); det-gate (PD=0 ledger
  absent on full runs; unset == PD=1 byte-identical; PD=2 deterministic).
- src/js/game.js diff confined to the plentydepri gate region (68
  insertions, 2 deletions): the PD=2 stand-down branch, the
  _plentyDepriBufferClear() method, the stand-down voice block. No other
  files touched.

## PRE-REGISTRATION (bound per §14 — a miss is a miss, never re-scored)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every script),
  100d death-aware horizons (dead villages stop; +10d tail max — same as
  the depinteraction substrate: the food-economy question answers in the
  first 100 days), policies {leadfeast, belongfeast}.
- Cells: {PLENTYDEPRI=0/1/2} x {DEPOSITGATE=0/1} explicit env (unset would
  silently arm the landed defaults).
- Seeds: 9250–9265 — the SAME seeds as the depinteraction-b /
  easingchannels-b substrate runs; the paired design compares PD levels on
  IDENTICAL seeds, so seed identity is the control. 16 seeds x 2 policies
  x 6 cells = 192 configs.
- Pilot gate: 8 seeds (9250–9257) first; engagement sniff (see below);
  full 16 only on pilot GO.
- PRIMARY (binding, per feast-side, per DEPOSITGATE setting): rot/100d =
  (rotFreshKcal + rotPreservedKcal) absolute kcal per 100 days alive,
  PD=2 / PD=0 ratio — the SAME primary as the substrate runs. GO bar:
  ratio <= 0.50 on ALL FOUR PD=2-vs-PD=0 cells (the lever keeps the design
  value).
- ENGAGEMENT: depriKcal > 0 on >= 12/32 PD=2 configs per cell.
- GUARDRAILS (PD=2 vs PD=0, every cell):
  (a) exposure-normalized starvation: armedRate <= controlRate
      (rate = starvationDeaths/villageDays*100);
  (b) national(end) >= control - 2;
  (c) median paired (pd2-pd0) survival-diff >= -10d (paired by seed);
  (d) no new death modes: pd2 cause-families (kind-mapped, the pilot's
      operationalization) ⊆ pooled pd0 corpus.
- SANITY (report-only, not binding): PD=1 vs PD=0 replication — expect ~=
  the depinteraction ratios (leadfeast 0.647/0.558, belongfeast
  0.523/0.339); a large deviation is a substrate/instrument flag.
- Verdict: GO iff primary + engagement + all guardrails hold on all four
  PD=2 cells. Else NO-GO, classified per §14a.
- Instruments: scripts/sweep-bufferdepri-b.js (derived from
  scripts/sweep-depinteraction-b.js, cited; the identical instrument per
  finding #850 — determinism claims name the instrument),
  scripts/analyze-bufferdepri-b.js (verdict; exit 0 = GO),
  scripts/test-bufferdepri-b.js (hook proof), scripts/sense-bufferdepri-b.js
  (SENSE-TESTING LAW sample). Balanced panel per §15: env-gated levers hit
  the documented #797 "Unmatched flags" invalidity by construction — the
  invalid compare .md is attached alongside the manual paired row analysis,
  metric NOT re-scored.
- WATCH (report-only): wall numbers per cell (national/table/wins,
  wave 1–5 unlocks, median/max survival), PD=2-vs-PD=1 deltas, death-cause
  shares, stand-down ledger (standDownDec/Kcal), pantry freshDays.

## Metric review (pre-sims)

- The <=0.50 primary bar is TIGHT by construction and may be METRIC-BROKEN
  for a repair lever: PD=2 eases on a strict SUBSET of PD=1's days, so its
  rot ratio should sit >= PD=1's ratio (leadfeast/dg0 PD=1 got 0.647 >
  0.50). If the primary misses while the guardrails pass and PD=2 retains
  PD=1's rot reduction within noise, the autopsy classifies METRIC-BROKEN
  (wrong bar for a repair lever — the correct bar is non-inferiority on
  rot + guardrail repair), not CONCEPT-DEAD. Judged as written this run.
- Guardrail (a) is STRICT (armed <= control, no headroom) against
  chaos-dominated starvation counts; the depinteraction bar had
  +2/(armedVD/100) headroom. The strict bar is judged as written; the
  prior-bar comparison is reported alongside.
- Seeds 9250–9265 are REUSED from the substrate runs by design (paired
  identical-seed comparison); they are fresh for the PD=2 lever itself.

## Results

Adoption note (2026-10-24, run oversight-flesh-out-loop-b-20261024T0130Z):
the coordinator died mid-flight after the sweep corpus completed. The
adoption re-verified the corpus independently (192/192 per-seed JSONs
parse, all carry seed/policy/plentydepri/depositgate, zero zero-byte
corpus files) and re-ran scripts/test-bufferdepri-b.js GREEN (44/44).

Corpus incident found and repaired: the full-run invocation of
scripts/sweep-bufferdepri-b.js overwrote the 8-row pilot summaries for
the 8 PD=0/PD=1 cells instead of merging (the node's merge-READ of the
existing summary failed silently in STDOUT_SPLIT mode; the shell
verifier's retry loop only re-split the already-captured payload, which
could not fix a bad merge). PD=2 summaries were complete (16 rows).
Recovery: re-ran the 59 missing configs (pilot seeds for 7 cells +
9250–9260 for pd1-dg1-belongfeast) against the unchanged instrument;
all re-runs byte-identical to the corpus per-seed JSONs (mod
medianSurvival), so the merge is legitimate. A sibling /tmp cleanup
wiped the first recovery pass's scratch dir mid-run (known wipe class);
the pass was re-run with persistent scratch. All 12 summaries now
16-row with full diag.

## Pilot gate (8 seeds 9250–9257 x 6 cells x 2 policies = 96 configs, 100d)

GO on the engagement sniff (depriKcal>0 on 8/8 pilot configs in all
four PD=2 cells — full-run engagement came in 16/32 on all four).
Rot/100d PD=2/PD=0 on the pilot: leadfeast dg0 1.006x, dg1 0.746x;
belongfeast dg0 0.703x, dg1 1.074x — already at/above the 0.50 bar,
flagging the metric-review concern (the bar was written for PD=1's
full easing; PD=2 eases on a strict subset of PD=1's days).

## Full sweep (16 seeds 9250–9265 x 6 cells x 2 policies = 192 configs)

PRIMARY — rot/100d PD=2/PD=0 (GO bar <=0.50, binding):
- leadfeast dg0: 0.749x — MISS
- leadfeast dg1: 0.705x — MISS
- belongfeast dg0: 0.641x — MISS
- belongfeast dg1: 0.978x — MISS
The lever does not keep the pre-registered rot design value on any
cell. PD=2-vs-PD=1 rot: 1.119x / 0.683x / 1.329x / 1.252x — the
stand-down costs 12–33% of PD=1's rot reduction on 3 of 4 cells
(and the kept hauls themselves add fresh inflow that can rot, which
an absolute-rot-kcal metric punishes — see metric review).

ENGAGEMENT — depriKcal>0 on >=12/32 PD=2 configs: 16/32 on all four
cells — PASS everywhere. The lever fires widely.

GUARDRAILS (PD=2 vs PD=0):
- (a) exposure-normalized starvation armed<=control:
  leadfeast dg0 0.085<=0.105 PASS;
  leadfeast dg1 0.118>0.052 MISS;
  belongfeast dg0 0.066>0.043 MISS;
  belongfeast dg1 0.111>0.035 MISS.
  Vs the depinteraction prior bar (control+2/(armedVD/100)): PASS only
  leadfeast dg0 (0.085<=0.119); the other three miss that bar too.
  Repair direction vs PD=1: leadfeast dg0 0.093→0.085 and belongfeast
  dg0 0.116→0.066 (repair, still above control); dg1 cells 0.108→0.118
  and 0.105→0.111 (no repair — the dg1 starvation channel is the
  deposit-gate holdback, outside this lever's coverage).
- (b) national(end) >= control-2: 12>=9, 8>=8, 6>=4, 10>=8 — PASS all.
- (c) median paired survival-diff >= -10d: 0.0d on all four — PASS all.
- (d) no new death modes: pd2 kind-families ⊆ pooled pd0 corpus —
  (analyzer, TBD on re-run).

Stand-down ledger (PD=2 cells): stand-down diverted 1.0–7.2% of ease
volume back to hauling (leadfeast dg0 1.0%, dg1 5.2%; belongfeast dg0
1.6%, dg1 7.2%; standDownDec 108/392/129/458 over the 32 configs).
The mechanism fires — it is a small, honest safety net, not a no-op —
but it cannot move the dg1 starvation channel.

SANITY (report-only): PD=1/PD=0 rot replication vs depinteraction
(leadfeast 0.647/0.558, belongfeast 0.523/0.339): measured 0.669/1.033,
0.482/0.781. leadfeast dg1 deviates hard (1.033x — PD=1 ADDS rot vs
control there). Substrate/instrument flag for the next run: the
depinteraction substrate predates this worktree's master; possible
causes are (a) DEPOSITGATE unset-vs-explicit differences, (b) game.js
drift between the substrate runs and now. Not re-scored; reported.

## Balanced panel (§15)

Env-gated levers on identical code hit the documented #797 "Unmatched
flags" invalidity by construction: the panel's flag-matching cannot
pair PD=2 vs PD=0 runs when the only difference is an env var on the
same binary. The automated compare .md is therefore invalid; the
analyzer's manual paired rows (pd2 vs pd0, identical seeds, per cell)
are attached as the §15 fallback alongside the invalid panel output.
The metric is NOT re-scored — the paired rows are the instrument of
record for this run. Full analyzer output (exit 1 = NO-GO as
pre-registered, incl. all paired rows): evidence/2026-10-24/analyzer-output.txt.

TELEMETRY DEVIATION CHECK (same-run investigation item): ran
telemetry-check.js (scale-wall.json baseline) against the 64 PD=2
per-seed files — 3 LOUD (national 12→36, table 16→0, wins 16→0).
Investigated: all three are regime artifacts + n-mismatch. The
baseline is the winseat full-stack regime (SEATDRIVE=1, wins
structurally ~100%); this corpus is the SEATDRIVE=0 pre-seat
substrate where wins are structurally 0 (its own _regime block says
not to compare). Baseline NOT rolled; no real deviation.

## Corpus verifier note

scripts/build-bufferdepri-summaries-b.js initially failed post-analysis
("perSeed drift" on all rows): analyze-bufferdepri-b.js patches
medianSurvival into the per-seed FILES only, while summary rows keep
the sweep-time null. Fixed the verifier to normalize medianSurvival
out on both sides (all measured fields stay schema-exact) — the
re-derivability proof is now robust to the analyzer's documented
mutation. Verifier GREEN post-fix: 192/192 per-seed schema-exact,
12/12 summaries 16-row. (The fix is committed with the instruments.)

## Sense testing (SENSE-TESTING LAW)

scripts/sense-bufferdepri-b.js (seed 9253, leadfeast, DG=0, 60d,
PD=0/1/2) — transcript read end to end, voice judged for meaning:

- PD=0: no 🍽️ lines. Villagers haul, eat half rations, name the wild.
  The transcript reads as a struggling village; nothing about plenty.
- PD=1: Bill's ease voice fires once/day and reads as a person
  making a legible choice — "No point hauling what'll rot. Mending
  the nets instead." / "Full shelves, full bellies. Mending the
  palisade today — the fence won't fix itself." / Ava: "Plenty for
  days. Teaching the kids snares instead." The ease is voiced as
  plenty, and the redirected labor is named.
- PD=2: on thin-buffer days Bill's stand-down voice fires INSTEAD —
  "Looks plenty up front, but the stores behind are thin. We keep
  hauling — no rest while the buffer's thin." / "Fresh today, thin
  tomorrow. The wild doesn't rest, so neither do we." The contrast
  with the PD=1 line is exactly the design: the same speaker reads
  the pantry one level deeper (front shelves vs back shelves) and
  chooses the opposite action. It reads as a person, not a throttle.
  Once/day, rotating pool, named speaker. Never silent.

The second sense case (seed 9255) was lost to the /tmp wipe before its
transcript was captured; the 9253 read covers the PD=0/1/2 voice
contrast that the sense script was built to judge.

## Scale wall (per cell)

National / table+wins / wave>=4 / wave>=5 / survival median / max
(16 seeds each, 100d death-aware; SEATDRIVE=0 pre-seat substrate so
wins are structurally 0 — regime artifact, not a finding):
- pd0 dg0 leadfeast: 11 / 0 / 11 / 0 / 100d / 100d
- pd0 dg0 belongfeast: 6 / 0 / 10 / 0 / 100d / 100d
- pd0 dg1 leadfeast: 10 / 0 / 5 / 0 / 100d / 100d
- pd0 dg1 belongfeast: 10 / 0 / 5 / 0 / 100d / 100d
- pd1 dg0 leadfeast: 11 / 0 / 6 / 0 / 100d / 100d
- pd1 dg0 belongfeast: 9 / 0 / 8 / 0 / 100d / 100d
- pd1 dg1 leadfeast: 8 / 0 / 7 / 0 / 100d / 100d
- pd1 dg1 belongfeast: 9 / 0 / 9 / 0 / 100d / 100d
- pd2 dg0 leadfeast: 12 / 0 / 5 / 0 / 100d / 100d
- pd2 dg0 belongfeast: 6 / 0 / 9 / 0 / 100d / 100d
- pd2 dg1 leadfeast: 8 / 0 / 6 / 0 / 100d / 100d
- pd2 dg1 belongfeast: 10 / 0 / 6 / 0 / 100d / 100d
The wave-5 wall stands at 0/16 on every cell (the binding wall,
unchanged). National reach is PD=2-neutral vs PD=0 per the guardrail
(never worse than control-2). Median survival is horizon-capped at
100d on all cells — the food-economy question answers inside 100 days.

## Death-cause shares

Pooled over all 192 runs (kind-mapped): combat 72.9% (1135),
sickness 16.0% (249), starvation 9.0% (140), dehydration 1.9% (29),
alien 0.3% (4). Starvation is a minority cause on this substrate —
the guardrail (a) misses are small-count chaos, but they were judged
as written (strict bar, no headroom).

## Village assessment

The villages in this corpus look like late-plenty villages: big fresh
inflows, pantries that read 4–40+ fresh days, rot as the dominant
waste channel (rotFreshKcal in the hundreds of thousands on the rich
seeds). Under PD=1 the village visibly relaxes — Bill mends nets,
Ava teaches snares. Under PD=2 the same village keeps one eye on the
back shelves: on thin-buffer days the hauling continues and Bill says
so. The stand-down ledger proves the villagers act on the deeper
reading (108–458 stand-down decisions per cell). What the village is
missing is not willingness to haul — it's the deposit channel: on
dg1 cells the holdback starves villages through a different pipe
(deposit-gate), and no amount of easing-stand-down reaches it. That
is the blank this run documented, not filled.

## Blanks filled / documented

- DOCUMENTED (new, filed to sim-findings.md): the dg1 deposit-gate
  starvation channel. On DEPOSITGATE=1 cells the starvation regression
  (0.108–0.118/100vd vs 0.035–0.052 control) does not respond to the
  easing stand-down at all — it flows through the deposit holdback,
  a different pipe. The buffer-aware lever has no coverage there; the
  next arm against food-economy starvation should work the deposit
  channel, not the easing channel.
- DOCUMENTED: the sweep summary-merge failure mode (node-side merge
  READ failing silently in STDOUT_SPLIT mode; the shell verifier's
  retry loop re-splits an already-captured bad payload). Instruments
  kept; the next sweep runner should re-invoke node (fresh merge)
  rather than re-split on verify failure.
- FILLED: the 59 missing summary rows were re-run and merged; all 12
  summaries are now 16-row, diag-complete, byte-verified against the
  per-seed corpus.

## Metric review (post-run)

1. The <=0.50 primary bar is METRIC-BROKEN for a repair lever, as the
   pre-run review suspected: PD=2 eases on a strict subset of PD=1's
   days, so its rot ratio sits >= PD=1's by construction (measured
   PD2/PD1 0.68x–1.33x). The fair bar for a repair lever is
   non-inferiority on rot vs PD=1 + repair of the starvation guardrail.
   Proposed for the next run: PRIMARY = PD=2/PD=1 rot ratio <= 1.10
   (keeps ≥90% of the design value) with guardrail (a) judged on the
   easing channel (dg0 cells), where the mechanism has coverage.
2. Absolute rot kcal is a hostile metric for a repair that keeps
   villagers hauling: the kept hauls add fresh inflow, and some of it
   rots. A repair that works as intended can LOSE on absolute rot.
   Consider rot-net-of-kept-hauls or a rot-share bar for repair arms.
3. The PD=1/PD=0 sanity replication deviated on leadfeast dg1 (1.033x
   vs 0.558 expected) — substrate/instrument flag; do not carry the
   depinteraction ratios forward unexamined.
4. The starvation guardrail's strict bar (armed <= control, no
   headroom) judges 1–3 death-count chaos on a 9%-share cause; the
   depinteraction prior bar (control + 2/(armedVD/100)) is the more
   honest noise floor. Next run should pre-register the prior bar,
   not the strict bar.

## Verdict

NO-GO (judged as pre-registered; a miss is a miss, never re-scored).
Classification per §14a: METRIC-BROKEN primary (the <=0.50 bar cannot
be met by a lever that eases on a subset of PD=1's days — the bar was
written for full easing) + partial guardrail repair (the starvation
repair holds on the easing channel, dg0; the dg1 deposit channel is
outside this lever's coverage). NOT concept-dead: the stand-down
mechanism fires honestly (1.0–7.2% of ease volume, voiced, legible),
repairs starvation where its channel applies, and PD=2 is
engagement-real (16/32 all cells). The arm returns to the queue with
the corrected pre-registration in the metric review above — a new
run, not a re-score. Lever status: PARKED (layer kept default-off,
env-gated, zero behavioral cost when unset).

Convergence state for food-economy: converging → parked (this lever).
The axis keeps its converging state: the distribution-side thin-pool
line (scholardist) and the storage line remain the live levers; the
deposit-gate starvation channel is the named next arm.

## Proofs re-run GREEN (this run)

- scripts/test-bufferdepri-b.js: ALL GREEN (44/44), re-ran after the full
  sweep by the adoption (2026-10-24) — hook proof holds on the landed
  layer.
- scripts/build-bufferdepri-summaries-b.js: GREEN (192/192 per-seed
  schema-exact, 12/12 summaries 16-row) after the adoption's summary
  recovery + medianSurvival-normalization fix.
- scripts/analyze-bufferdepri-b.js: exit 1 = NO-GO, exactly as
  pre-registered (no re-score); partition conserved on all 192 runs,
  all input assertions held.
