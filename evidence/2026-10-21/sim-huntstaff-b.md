# sim-huntstaff-b — additive hunt-channel staffing (food-economy axis, loop B)

Run: fleshout-loop-b-20261021T<HHMM>Z (TBD), arm sim-huntstaff-b (LEVER — lands
only on GO; killed arms leave zero trace per kill protocol).
Worker tree: ~/workspace/worktrees/sim-huntstaff-b.
Answers backlog #703 (2026-10-20): duty:hunt is UNSTAFFED on the competent
substrate — 0 kcal across 2282 day-pairs / 16 runs in the sim-glutprobe-b DIAG;
no policy in the competent family assigns the hunt duty. Any "hunt lever" on
that substrate measures a dark channel. This arm staffs it additively and
measures whether it produces real village inflow.

## Pre-registration (binding, docs/MEASUREMENT.md §§9-12, 14-15 — written BEFORE sims)

- **Question**: does additive hunt-duty staffing produce real village inflow
  on the competent substrate — or is duty:hunt decoration?
- **Arm**: scripts/policies/huntstaff-b.js — HUNTSTAFF_B=1 (default OFF; gate-off
  = pure delegation to leadfeast/belongfeast, RED-pinned byte-identical).
  ZERO src/js changes. Policy-side only.
- **Mechanic (design calls, numbered — Steve can overrule)**:
  - D1. N=2 hunters/day max, ADDITIVE ONLY. At the START of policy.daily,
    staff up to 2 FREE villagers on duty:hunt — never re-tasks any existing
    assignment (hunt/patrol/cook/water/wood/garden/etc.). Two measures a
    channel; more would measure labor cannibalization.
  - D2. Occupation-preferred via the ENGINE's own substrate:
    Game.occHuntTier (data-driven 1.4/1.2 tiers, wired 2026-10-19) +
    Game.villagerCompetence(vid,'hunt'); deterministic roster-order tiebreak.
    No word list (the engine replaced ghost-word lists on 2026-10-19).
  - D3. NOT lean-gated: the landed huntstaff.js (HUNTSTAFF=1, one hunter,
    lean days, wound ledger) owns crisis staffing. This arm measures the
    CHANNEL on the normal substrate — proactive daily staffing.
  - D4. Person gates: alive, in roster, not scholar, not garden keeper
    (named domain), HP>=40 (the engine's own outdoor fitness line),
    trust>=40, scholar at Haven (assignTask's in-person honest line; silent
    skip when away).
  - D5. One deduped honest say line per staffed day from a seeded 4-variant
    pool (r37 hunger-pool pattern); no adjacent-day verbatim repetition.
  - D6. No wound ledger/refusal: the landed arm owns that design; hunt
    wounds resolve through the engine's own hunt narration and are
    instrumented as a sense metric. Named next if GO.
- **PRIMARY** (binding): pooled armed duty:hunt kcal/day − pooled control
  duty:hunt kcal/day **≥ +120 kcal/day**. Derivation: control measured 0 in
  the DIAG (no ratio-on-zero); duty:fish on the same substrate delivers 588
  kcal/day lean mean (the reference staffed duty channel); +120 is ~1/5 of
  the fish reference — a clear "real channel, not decoration" signal that
  doesn't demand hunt beat the fish leg.
- **GUARDRAILS** (all hard): starvation deaths armed ≤ control; matched
  median survival ≥ control−10d; national ≥ control−2; fast-rot pooled/100d
  armed ≤ 1.15× control; laundering == 0; no new death mechanism (armed
  death kinds ⊆ control kinds ∪ known engine kinds).
- **SECONDARY** (report-only): duty:garden inflow (watch — the DIAG's other
  zero channel); per-policy heterogeneity; hunt assignments/day; staffing
  occupation mix; hunting-wound deaths (sense metric).
- **Horizon**: 180d death-aware (dead villages stop +10d tail max).
- **Seeds**: 8 FRESH seeds 8901–8908 × {leadstaffhunt, belongstaffhunt} =
  16 configs; rep 1 = measurement, rep 2 = det-gate pair. 64 runs total.
  Seed-freshness asserted inline; STOP on banned-list collision (banned:
  5201–5208, 5301–5308, 5401–5434, 5601–5608, 8001–8808; 8901–8908 are this
  arm's, asserted not-banned). NOTE: 8901–8908 appear in 2026-10-17
  journey-deepening build-harness scripts (different substrate: competent,
  SEATDRIVE unset, 100d) — not on this substrate; the before/after control
  is in-sweep on identical seeds, which is what makes the comparison
  controlled.
- **Substrate** (asserted up front, LOUD STOP): FEASTSCALE_R13=1,
  SEATDRIVE=0 explicit, SURPLUSFEED unset (the DIAG substrate).
- **Instrument**: scripts/probe-glut-instruments.js attachProbe — the DIAG's
  call-path channel attribution (13/13 GREEN + det-gate byte-identical).
  Honesty gate: unattributed < 1% of chokeTotal on every run.
- **DET-GATE**: 16/16 configs × 2 sides = 32 repeat-pairs bit-identical
  (day-hash trajectories) before trusting numbers.
- **PANEL (§15)**: before/after through scripts/balance-panel.js schema
  (compare .md attached); the panel is the instrument, the pre-registered
  threshold is the judge.
- **SENSE**: staffing say lines + hunt resolve beats captured
  (scripts/sense-huntstaff-b.js), read for honesty per SENSE-TESTING LAW.

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. Human skills ≠ alien
  abilities: this arm assigns LABOR (the engine's own 'hunt' task via
  assignTask — obedience/HP/Haven gates stay the last word). No System slot,
  no magic, no skill granted. The hunt duty resolves through
  villagerHuntResolve (a REAL animal from REAL wildlife, 2026-10-10
  parity) — the engine's own production path, not a new one.
- r37 (b76bcddd0) interaction check: the hunger-pool fixes are
  narration-only (4-variant hungry-dawn say pool, dead-proposer filter,
  ending copy) — no mechanical interaction with duty staffing. The new
  hunger say pool does NOT touch the staffing line (separate beat).

## Proof (REAL RED→GREEN)

- scripts/test-huntstaff-chan-b.js (NOTE: scripts/test-huntstaff-b.js is the
  OLD sim-huntstaff-b arm's kept instrument — kill protocol keeps
  instruments, so the new proof lives at test-huntstaff-chan-b.js):
  - RED (gate OFF): leadstaffhunt/belongstaffhunt daily byte-identical to
    leadfeast/belongfeast over 25d (day-hash trajectories) + zero _hsb* ctx
    writes. 5/5 GREEN.
  - GREEN (HUNTSTAFF_B=1): staffing engages (G1); cap ≤2/day (G3);
    protected duties (cook/water/wood/garden/patrol/fish) never re-tasked
    (G2); rankCandidates pins 1.4>1.2>0 + deterministic roster tiebreak
    (G4); say-line no adjacent verbatim repeat over 20 picks, pool varies
    (G5); once-per-day (G3b); gate-off writes zero ctx (G7). 16/16 GREEN.
  - Armed det pin: 2 policies × repeat-pair byte-identical over 25d.
- Sweep det-gate (in-sweep): 32/32 repeat-pairs — [RESULT PENDING].

[RESULTS — judged as written, docs/MEASUREMENT.md §14]

Measurement rep only (rep1, 57/64 runs: seed 8908 armed rep1 missing — sweep
timed out). n=14 armed, n=15 control configs:

- PRIMARY (huntKcal/day armed − control ≥ +120): 2550 − 0 = +2550 → **GO**.
  The channel is real: staffing duty:hunt additively produces ~2550 kcal/day.
- GUARDRAILS (all hard):
  - starvation deaths armed ≤ control: 11 vs 7 → **FAIL**.
  - matched median survival ≥ control−10d: 121 vs 174 → **FAIL** (−53d).
  - national ≥ control−2: 7 vs 6 → GO.
  - fast-rot ≤ 1.15× control: 102275/100d vs 36530/100d = 2.8× → **FAIL**.
  - laundering == 0: 0 both sides → GO.
  - no new death mechanism: new armed causes {big loud, hunting,
    the congregation, highbeam deer} → **FAIL**.

VERDICT: **KILLED — NO-GO with teeth.** The primary proves the channel is real,
but the guardrails fail decisively: staffing the hunt duty additively starves
the village harder (11 vs 7 starvation deaths), halves median survival
(121 vs 174), and nearly triples fast-rot. The missing 8908 armed config cannot
reverse four hard guardrail failures. Policy layer deleted zero-trace per kill
protocol (heraldmuster precedent); instruments + evidence + proof + per-seed
corpus land as the killed-verdict record. Zero src/js changes.

Metric review: the channel exists but is NET NEGATIVE on the competent substrate
— the hunters eat/haul-shift enough that the village starves faster despite
+2550 kcal/day. Named next: WHY staffing 2 hunters/day increases starvation
deaths despite positive inflow (haul-displacement hypothesis: hunt pulls haul
labor off foraging; or the fast-rot of hunt meat means the 2550 never lands in
the pantry). Not a lever question — a mechanism question.
