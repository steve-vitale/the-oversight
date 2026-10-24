# sim-pdvalue-b — PLENTYDEPRI=1 value re-examination (LEVER verdict, fresh seeds)

Run: oversight-flesh-out-loop-b-20261024T0812Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-pdvalue-b.
LEVER arm: measurement only, zero src/js changes. Backlog #871 (from loop B
arm sim-pdtradeoff-b DIAG-GO, run fleshout-loop-b-20261024T0630Z,
evidence/2026-10-24/sim-pdtradeoff-b.md — read in full before designing).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder — the
plenty-depri throttle sits on the production side of the ladder, easing
hauling when the pantry reads plentiful so the glut doesn't rot). **No
canon doc covers plentydepri's tradeoff** — the tradeoff (small
survival/national cost for large rot reduction) is a measured property of
the landed lever, not a designed value, as pdtradeoff-b documented.
Documented here, not invented.

## The question (backlog #871)

On current master the PD=1 rot benefit is 0.77–1.20x (pdtradeoff,
seeds 9250–9265), vs the landed 4–6x headline, with a 1.197x rot INCREASE
on belongfeast/dg1. Does PD=1 earn its (small) survival/national costs on
current master, or did drift change the lever's rank among rot levers?
This arm answers with a LEVER verdict on FRESH seeds — never the
pdtradeoff corpus seeds (9250–9265), never sibling pooled blocks.

## PRE-REGISTRATION (bound per §14 — a miss is NO-GO, never re-scored)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every
  script), 100d death-aware horizons (dead villages stop; +10d tail max —
  the food-economy question answers in the first 100 days), policies
  {leadfeast, belongfeast}. SEATDRIVE=0 is the pre-seat regime: wins are
  structurally 0 — said here, not chased.
- Cells: {PLENTYDEPRI=0/1} x {DEPOSITGATE=0/1} explicit env (DG explicit on
  every config, never unset).
- Seeds: PILOT 94001–94008 (8 fresh seeds); CONFIRM 94011–94026 (16 fresh
  seeds) only if the pilot passes. Pilot = 8 seeds x 2 policies x 4 cells
  = 64 configs; full = 24 seeds x 2 policies x 4 cells = 192 configs.
- C1 freshness proof: seeds verified absent from all existing corpora —
  scan of per-seed "seed" fields in this worktree's corpus dirs plus the
  sibling trees' 2026-10-24 evidence filenames; pooled blocks 9250–9265,
  92801–92816, 92831–92846 are all taken and all avoided. The analyzer
  re-asserts C1 (taken blocks + pdtradeoff corpus scan) and aborts on
  any hit — a verdict on reused seeds would be void by construction.
- PRIMARY (binding): rot/100d PD=1/PD=0 ≤ 0.85 on at least 3 of 4 cells.
  rot/100d = (rotFreshKcal + rotPreservedKcal) absolute kcal per 100 days
  alive, aggregate sum(rot)/sum(days)*100 — the SAME operationalization
  as the pdtradeoff/substrate runs. Adopted as briefed (0.77–1.20 anchor
  makes 0.85 a real test, not a gimme).
- GUARDRAILS (binding, per cell): exposure-normalized starvation
  ≤ control+0.02/100vd; national ≥ control−2; no new death modes (no
  kind-mapped cause kind present in PD=1 with ≥2 deaths and absent from
  its control).
- VERDICT: GO ("earns its costs") iff PRIMARY + all guardrails pass;
  otherwise NO-GO with the rank implication written up explicitly (where
  PD=1 ranks among rot levers now — below the KEEPCEIL volume knob?
  below rack-rescue? — and whether the lever should stay, be re-priced,
  or be parked).
- PILOT GATE: the pilot's own bar is the primary on 8 seeds (≤0.85 on
  ≥3/4 cells). A pilot that already fails the primary is killed-at-pilot;
  confirm spend never rescues a failed primary — it only adds power to a
  passing one.
- Instruments: scripts/sweep-pdvalue-b.js (derived from
  scripts/sweep-pdtradeoff-b.js with the declared deltas — pdvalue
  naming/corpus/mode, default seed list 94001–94008, header rewording),
  scripts/analyze-pdvalue-b.js (verdict analyzer; C1 freshness gate,
  verdict logic, manual paired rows), scripts/test-pdvalue-b.js (proof:
  P1 derivation, P2 determinism, P3 schema, P4 FATAL asserts, P5 analyzer
  exit semantics, P6 C1 freshness, P7 verdict logic),
  scripts/run-pdvalue-b.sh (runner with verify + resume),
  scripts/panel-pdvalue-b.js (§15 panel attempt),
  scripts/sense-pdvalue-b.js (sense; seed env-driven, fresh seed only).
- Balanced panel per §15: env-gated -> the documented #797 "Unmatched
  flags" invalidity by construction; the attempt is documented in
  ./pdvalue-b-panel-compare.md and the verdict is judged on manual paired
  rows. The metric is NOT re-scored.
- WATCH (report-only): wall numbers per cell (national/table/wins,
  wave 1–5 unlocks, median/max survival), death-cause shares, PD=1-vs-PD=0
  deltas, villager behavior (SENSE-TESTING LAW: transcripts read, not
  just counts).

## Metric review (pre-sims)

- The 0.85 bar is adopted as briefed, not softened: pdtradeoff's anchor
  (0.773/0.913/0.979/1.197) already straddles it, so the bar discriminates
  rather than rubber-stamps.
- The guardrail starvation bar (+0.02/100vd) is tight relative to
  pdtradeoff's observed ±0.012 deltas — a real cost showing up above
  that line fails the lever even if rot passes. That is the intended
  tradeoff discipline: the lever must earn its costs, not merely cut rot.
- The "no new death modes" guardrail operationalization (≥2 deaths of a
  kind absent from control) is this arm's, chosen before sweeping: a
  single stray death is noise; a repeated new kind is a signal.
- The analyzer's ms field is never byte-compared (pdtradeoff metric
  review: the wall-clock ms gap made byte-reproduce unpassable by
  construction). Trajectories are compared, not timings.

## Results

PILOT (8 fresh seeds 94001-94008, 64 configs, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0,
policies {leadfeast,belongfeast}, cells {pd0,pd1}x{dg0,dg1}).
Full paired analysis: ./pdvalue-b-pilot-analyzer-report.txt (analyzer 2026-10-24T09:14Z).

PRIMARY (binding, bar rot/100d ratio <=0.85 on >=3/4 cells): 4/4 PASS.
leadfeast dg0 0.793x | leadfeast dg1 0.421x | belongfeast dg0 0.337x | belongfeast dg1 0.817x.
(The pdtradeoff anchor 0.773/0.913/0.979/1.197 straddled the bar; the fresh-seed pilot
reproduces rot reduction on all four cells — the rot cut is real, not a seed artifact.)

GUARDRAILS (binding): FAIL on 2 cells.
belongfeast dg0: starvation 0.076->0.097/100vd (delta +0.020, bar +0.02) FAIL;
belongfeast dg1: starvation 0.054->0.106/100vd (delta +0.053) FAIL, plus new death modes
(dehydration, alien — >=2 deaths of kinds absent from control).
leadfeast cells pass guardrails (starvation deltas 0.000/+0.019, national 8->6, no new modes).
National end-counts hold or rise on 3/4 cells; no table on any cell.

A confirm sweep was started after the pilot and aborted by the executor timeout at one
partial cell (pd0-dg0-leadfeast seeds 94011-94025, incomplete). Per the pilot verdict
below (KILLED-AT-PILOT: no confirm spend) that partial corpus is NOT committed and is
NOT part of this verdict; it is recorded here only so the next run does not mistake the
partial files for a confirm.

## Metric review (post-run)

- The guardrail bar behaved as designed: the tight +0.02 starvation bar caught a real
  cost (belongfeast starvation rises on both dg cells) even though the primary passed
  4/4. This is the intended tradeoff discipline — the lever must earn its costs.
- Balanced panel per §15: the automated compare is invalid BY CONSTRUCTION for
  env-gated levers (#797 — "Unmatched flags"; see ./pdvalue-b-panel-compare.md).
  The verdict rests on the analyzer's manual paired rows (§15 fallback, as in
  pdtradeoff); the metric is NOT re-scored.
- The pilot verdict binds per §14: the aborted confirm partial is not a confirm and
  does not soften or overturn the pilot NO-GO.

## SENSE (SENSE-TESTING LAW)

Transcript-tested in the finish pass (this paragraph replaces the earlier
"not separately transcript-tested" note): instrument
scripts/sense-pdvalue-b.js, seed 94005 — the pilot's strongest-rot
leadfeast/dg0 PD=0 seed (566,123 rot kcal) — 60d, PD=0 vs PD=1, DG=0.
SENSE PASS. The ease voice reads as people making legible pantry
decisions on current master, in both arms: "Willow checks the pantry
before heading out — the shelves are full, ~N days of fresh on hand…
leaves the harvest standing and turns to the wood/water/stone run
instead." PD=1's deprioritization is voiced as specific alternative
work, not robotic repetition: "Ines leaves the foraging basket at the
door. 'The pantry can't take more — sitting with the elders instead.'",
"Willow weighs the day's basket against the pantry shelves and puts it
down. 'Enough. Carving bowls instead'", "Ines eyes the groaning pantry
shelves and packs light today. 'No point hauling what'll rot. Mending
the nets instead.'" Named villagers (Willow, Mara, Elena, Ines, Quinn,
Dante, Bessie) vary in voice and chore. Two limits, stated plainly:
lines are instrument-truncated at 170 chars, so full-sentence judgment
is partial; and the ease voice does NOT explain the guardrail failure —
nothing in these transcripts accounts for the belongfeast dehydration /
alien deaths, so the cost-side mechanism stays an open question (named
next 2), not a sense-cleared one.

## Verdict

PILOT VERDICT (8 seeds): NO-GO — KILLED-AT-PILOT, no confirm spend.
PD=1 does NOT earn its costs on fresh seeds: the rot cut reproduces (4/4 cells at bar)
but the starvation cost on belongfeast breaks the guardrails on 2/4 cells. Rank
implication for the food-economy axis (from the pilot report): PD=1's value proposition
is now a re-price-or-park question, not a confirm question — the same finding the
pdtradeoff DIAG-GO left open ("PD=1 value proposition re-exam"). No lever code ships
from this arm; instruments + pilot corpus + analyzer report are the kill record.

## Finish-work addendum (adopted-arm finish, 2026-10-24 ~10:30–11:00Z)

This addendum completes the arm without disturbing the 10:40Z edit above
(which filled in Results / Metric review / Verdict while this finish run
was underway — preserved verbatim; only the SENSE paragraph was replaced,
because this finish task explicitly requires a transcript read and the
10:40 note declined one).

### Proof (pre-commit, exact gates)

- First run: 8 PASS, 3 FAIL — all three failures P2 determinism, all
  caused by the container EPERM flap hitting the proof's /tmp temp-dir
  writes (`WRITE FAIL LOUDLY /tmp/pdvalue-proof-pilot-a/... EPERM`),
  not by nondeterminism. No instrument was changed.
- Retry after backoff: **11 PASS, 0 FAIL** (P1 derivation, P2
  determinism byte-identical, P3 schema, P4 FATAL asserts, P5 analyzer
  exit semantics, P6 C1 freshness, P7 verdict logic, P8 retry-wait
  clock). The earlier failure is environmental, confirmed by the clean
  retry — reported here, not hidden.

### Scale wall + reachability numbers (from the pilot analyzer report)

Per cell (national count / table+wins / wave≥4 count / wave≥5 count /
survival median / max, out of 8 runs):

- pd0-dg0 leadfeast 8/0/5/0/100d/100d; belongfeast 6/0/5/0/100d/100d
- pd1-dg0 leadfeast 6/0/2/0/100d/100d; belongfeast 6/0/5/0/100d/100d
- pd0-dg1 leadfeast 8/0/3/0/100d/100d; belongfeast 4/0/6/0/100d/100d
- pd1-dg1 leadfeast 6/0/5/0/100d/100d; belongfeast 6/0/3/0/100d/100d

Table 0, wins 0 (structural SEATDRIVE=0), wave 5 zero in all 64
configs, national in 4–8 of 8 per cell. The scale wall stands.

### Death-cause shares (pooled, 531 villager deaths)

combat 76.6% (407) | sickness 13.2% (70) | starvation 7.9% (42) |
dehydration 1.3% (7) | alien 0.9% (5).

### Village assessment in plain words

Most villages here make it to day 100 — they fight constantly (combat
is three-quarters of all villager deaths), they sicken, they sometimes
starve, but the village usually holds. PD=1 genuinely cuts spoilage.
But on belongfeast villages the easing charges lives: starvation rises
and death kinds unseen on the PD=0 side appear. The village this lever
builds is a less-rotten pantry paid for in belongfeast lives — and no
transcript in this arm explains the payment. That unexplained payment
is why the verdict is PARK, not "fix and confirm."

### Confirm-anomaly timeline (UTC, mtimes + report header; contents never read)

- 09:14:24–25Z pilot analyzer verdict: NO-GO / KILLED-AT-PILOT.
- 09:15:02Z confirm-run.log header (37s AFTER the verdict) — the
  confirm was launched after the kill, not before it.
- 09:20–09:29Z nine confirm per-seed files (s94017–94025); 09:38Z and
  09:42Z two empty cell logs plus one 0-byte atomic-write temp file
  (EPERM-flap failed writes).
- 10:02Z writeRobust fix committed (62b0ee4ed); 10:04–10:09Z six more
  confirm files on resume (s94011–94016). Adoption stopped it there.
- Final confirm state: 15/16 seeds of ONE cell only
  (pd0-dg0-leadfeast, 94011–94025, missing 94026); all other cells
  untouched; no confirm analyzer report exists.
- Mechanism: `scripts/run-pdvalue-b.sh` has NO pilot gate — it runs
  whatever SEEDS env it is given. The gate was procedural and the 09:15
  invocation bypassed it. (The 10:40 note's "aborted by the executor
  timeout" describes the session end; the file record above is the
  launch-and-write evidence.)
- Disposition: DELETED, unanalyzed — the 15 confirm JSONs, the 0-byte
  temp file, and the two empty (0-byte) cell logs, removed without
  their contents ever being read for a verdict. The confirm-run.log
  header is committed as the anomaly record; this section plus
  ./pdvalue-b-corpus-note.md is the exact filename/count record. The
  pilot corpus (64 per-seed + 8 sweep files) is committed as the
  verdict basis; the corpus dir now holds pilot files only.

### Metric-review extensions (post-run, for the NEXT run — not a re-score)

- Strict-vs-inclusive bar edge: belongfeast dg0 sits exactly ON the
  +0.02 starvation bar (Δ0.020) and fails under the analyzer's strict
  reading. The next pre-registration must state < vs ≤ up front.
- ≥2 new-mode threshold sensitivity: the guardrail fired on small
  pooled counts (7 dehydration, 5 alien in 64 configs). At 8 seeds
  that threshold is thin; whether it is too sensitive is a next-run
  pre-registration question, not a reason to re-score this kill.
- Guardrail-power tension: a pilot that fails guardrails never earns
  confirm power to check whether the firing was noise. Consider
  pre-registering a guardrail-focused re-measurement path (e.g. a
  belongfeast-only cost-side arm) for the next run.
- Horizon saturation: median survival sits at the 100d cap in every
  cell — survival does not separate the arms here. A survival question
  would need a longer horizon; the food-economy question does not.
- Panel §15: invalid by construction (#797); manual paired rows judge.
  Not re-scored. No canon doc covers plentydepri's tradeoff (stated in
  the Canon section; nothing invented here).

### Named nexts (candidates for the coordinator — NOT appended to the backlog by this run)

1. Runner pilot-gate (tooling): make the sweep runner refuse confirm
   seeds when a NO-GO analyzer report exists — the 09:15 launch
   bypassed a procedural gate that should be mechanical.
2. Belongfeast cost-side arm: why PD=1 concentrates starvation +
   new death modes on belongfeast cells — needs a transcript/causal
   read of those deaths, not just counts.
3. Guardrail-threshold review for the next pre-registration: ≥2
   new-mode sensitivity at 8 seeds; strict vs inclusive starvation bar.
4. Wave-5 wall: 0/64 configs here — the scale-wall standing directive
   still binds.
