# Talk-turn confirm — PRE-REGISTRATION (arm sim-talkturn-confirm-b)

Run: fleshout-loop-b-20261111T0330Z (Loop B). Axis: scale-onramp /
winnability chain (the polity half of sim-findings #2061).
Confirms the talkturn-a pilot
(evidence/2026-11-10/sim-talkturn-a.md,
evidence/2026-11-10/sim-talkturn-a-prereg.md). Policy-side
instrument only, zero src/js. Do NOT move readyDemand numbers
or any win price/deed gate. Do NOT flip any default — landing
the COMPETENT_TALK default is a coordinator/Steve call; this
run reports the verdict only.

Committed BEFORE any judged computation.

Base: worktree tip ad6a04b27 at prereg time. Pilot tip
1234056be and counterconfirm tip a581b3778 verified ancestors
of this worktree (`git merge-base --is-ancestor`, both YES).
If master moves before landing, rebase onto the explicit
current master SHA and re-run proof green.

## Canon read before this prereg

- `docs/CANON.md` (manifest). No canon doc covers village-link
  raising or polity formation as a system; the mechanics are
  grounded in code, not invented canon. `docs/SCALE.md` is the
  scale-ladder canon: a polity is one primary with >= 3 SEASONED
  subordinates; seasoned = 30+ days old AND trust 40+
  (links form at trust 30 — tending required); LEAD is the built
  realm road. `docs/CONVERSATIONS.md` covers dialogue/talk
  generally (no link-raise section) — the talk behavior is
  grounded in `scripts/policies/competent.js` and
  `src/js/bond-initiation.js`, not in the canon doc.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged seeds,
  death-aware horizons, pre-registration, convergence, metric
  binding, balanced panels). This run follows them as written.

## The pilot, pinned (what is being confirmed)

sim-talkturn-a, band 150201–150208, 150d, competent, armed
`COMPETENT_TALK=1` vs control (flag unset), identical seeds.
Primary: armed **7/8** seeds formed a second link (20 via
raise) vs control **0/8** — GO candidate. Cost bar as written
FAILED on raw deaths (696 vs 603) while the per-day rate was
identical (armed 696/985 = 0.707/day, control 603/851 =
0.708/day). Verdict: GO CANDIDATE, HELD BY THE COST BAR; no
landing claim, confirm band NOT spent. The pilot's metric
review says the raw-death bar is the wrong denominator and
proposes deaths-per-village-day for the next run. This confirm
is that re-judged run, under the revised cost bar below.

Counter-close precedent (sim-counterconfirm-a, GO a581b3778):
confirm GO on 16 fresh seeds under the same conjunction
(primary + zero stalled at unanswered counters) and the same
per-day cost-bar form (deaths/100d +2.6 inside the +10% cap,
review_required on the panel). This confirm adopts that
precedent's bar shape.

## Band freshness (skill: local_seed_band_freshness)

- Band: **150233–150248 (16 seeds)**. Pilot gate on the first 8
  (150233–150240); confirm extends to all 16.
- **150209–150216 NOT used — stays reserved for tendexact-a.**
  Verified, not assumed: sim-tendexact-a.md verdict is GO with
  "Confirm band 150209-150216 is RESERVED for this arm per its
  prereg (freshness re-check at confirm time); this run does not
  spend it — the confirm is the next run's work." No
  `perseed-*-s15020[9]*` / `s15021*` corpus files exist, so
  tendexact-a has NOT spent it — but the reservation stands
  (also named in sim-talkturn-a-prereg.md, sim-answermail-drive-
  a-prereg.md, sim-raiserseat-a-prereg.md, sim-diplo-a-prereg.md,
  sim-cookfirst-a-prereg.md, sim-counterconfirm-a-prereg.md as
  tendexact-a's / the talkturn re-judge's). Per the freshness
  skill a naming reserves a band, so a fresh band is required.
- **150217–150232 spent** by sim-counterconfirm-a (16-seed
  confirm corpus in perseed-counterconfirm-a/). Not reused.
- Freshness search for 150233–150248 (before this prereg was
  written): `grep -rn` for each seed number over
  `evidence/*/sim-*-prereg.md` and `evidence/*/sim-*.md` —
  ZERO hits. `find evidence -name "*15023[3-9]*" -o -name
  "*15024[0-8]*"` — ZERO corpus files. `grep` over
  `hidden_files/*.md` + `hidden_files/lever-claims/*.json` —
  ZERO hits. The 10 files naming a forbidden/contaminated band
  list (evidence/2026-10-25/sim-preserveact-b.md,
  evidence/2026-11-01/sim-fullseat-recheck-a-prereg.md,
  sim-scale-onramp-round-0615.md, sim-trajband-a-prereg.md,
  sim-vet2mfg-a-prereg.md, sim-vet2mfg-a.md,
  evidence/2026-11-04/sim-tendfloor-guard-b-prereg.md,
  evidence/2026-11-05/journey-deepening-r104-prereg.md,
  journey-deepening-r104.md, journey-deepening-r105-prereg.md)
  grepped for the same numbers — ZERO hits. Bands in use and
  avoided: 150201–150208 (pilot + siblings), 150209–150216
  (tendexact-a reserved), 150217–150232 (counterconfirm-a),
  140201–140224 (Loop B).
- Band 150233–150248 is FRESH. This prereg names it, reserving
  it for this confirm.

## Primary metric (binds the run, §14)

Second links formed per 16 seeds (a second link = a link held
with a village other than the seed's first-formed link, formed
on that seed, any path; formed-via-raise reported separately),
plus the counter-stall half (see below).

- GO requires BOTH halves:
  (a) armed second links > control second links;
  (b) zero armed seeds stalled at unanswered counters at end
      (a seed counts as stalled if a `pendingCounter` is still
      open at the final snapshot — the counterconfirm-a class:
      fresh counter never answered, blocked re-knocks).
- NO-GO: either half fails. A miss is NO-GO, never re-scored
  against a friendlier metric mid-run. Metric problems go under
  "metric review" for the NEXT run.
- Note on half (b): the talk flag does not answer counters —
  that is the COUNTER_ANSWER lever's job (confirmed GO,
  a581b3778). A stall on the armed leg would be a counter-wall
  instance, not a talk failure; if (a) passes while (b) fails,
  the verdict is NO-GO under this header with the mechanism
  named and the remedy being the already-confirmed counter
  lever — not a re-score.

## Cost bar (REVISED — see metric-review note, §14)

The pilot's raw-total clause is REPLACED before this run (the
revision the pilot's metric review proposed; re-scoring the
pilot under it is not done here — the pilot's HELD verdict
stands as recorded). The revised bar:

- Deaths per 100 village-days armed <= control + 10%.
- Starvation deaths armed <= control + 2.
- Arm-only starvation (armed starvation on seeds where control
  starvation = 0) <= 2.
- Median survival armed >= 0.8x control median.
- If the cost bar fails, a GO is HELD, not landed.

Why the change: the pilot's raw-total clause (`total deaths
armed <= control total`) penalizes any arm that extends
survival — a village that lives longer accumulates more deaths
at an unchanged daily rate. On the pilot band the daily rates
were identical to three decimals (0.707 vs 0.708) while the
raw totals differed by 93 — the clause measured days lived,
not lives cost. The per-day form is the honest denominator;
the counterconfirm-a confirm passed under exactly this form.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim.
  Armed leg: `COMPETENT_TALK=1`. Control leg: the flag unset
  (identical seeds, identical code — the ONLY difference is the
  env var, set explicitly by the driver per leg so ambient env
  cannot leak across legs).
- Seeds: 150233–150248, FRESH band (see above). Pilot gate:
  first 8 seeds (150233–150240) both legs first; gate = armed
  second links > control second links on those 8. Spend the
  remaining 8 (150241–150248) only if the gate passes.
- Horizon: 150 days, death-aware (dead villages stop
  simulating; harness runDays death handling), to match the
  pilot and the counterconfirm (reachability lever: waves 4–5,
  national, table, wins).
- Pilot-legs reproduction check BEFORE spending the confirm
  band: `scripts/test-talkturn-a.js` re-run on current master
  (11/11) — its live miniatures prove the flag-on/flag-off
  behavior (real held turns with the flag on, byte-identical
  control with it off) on the code this confirm runs against.
- Instrument: the pilot's driver/analyzer, copied with ONLY
  these changes: new RUN (`talkturn-confirm`), new output
  directory (`evidence/2026-11-10/perseed-talkturn-confirm-b/`),
  new band, the revised cost bar (per-day form + arm-only
  starvation), the counter-stall half (from the counterconfirm
  classification: pendingCounter at end + fresh vs blocked
  re-knock split), and `/8` print labels corrected to the
  seed count. The recorder, the talk-turn wraps, the say-wrap,
  the snapshot cadence, and the second-link counting are
  UNCHANGED from the pilot — the confirm measures the same
  thing the same way.
  Files: `scripts/talkturn-confirm-driver-20261110.js`,
  `scripts/talkturn-confirm-analyze-20261110.js` (reuses
  `scripts/secondlink-instrument-20261110.js` and
  `scripts/secondlink-analyze-20261110.js` unchanged).
- Proof: `scripts/test-talkturn-confirm-b.js` — (a) confirm
  analyzer cost bar on synthetic per-seed JSON: per-day form
  PASSES when the raw total is higher but the rate is within
  +10% (the pilot's exact numbers as a fixture), FAILS when
  the rate exceeds +10%, starvation and arm-only-starvation
  clauses fire correctly, median floor fires correctly;
  (b) counter-stall classification on synthetic JSON (stalled
  vs answered vs no-counter); (c) confirm driver writes to
  `perseed-talkturn-confirm-b/` and refuses to overwrite;
  (d) analyzer second-link counting unchanged from the pilot
  (regression fixture). The pilot proof
  (`scripts/test-talkturn-a.js`, 11/11) is re-run as the
  legs-reproduction check.
- Balanced panel (§15): before/after through
  `scripts/balance-panel.js` on the 16 confirm seeds, 150d,
  competent policy, intervention flag COMPETENT_TALK (before =
  flag unset, after = flag set). Compare `.md` attached to the
  evidence file. The panel is the instrument, not the judge:
  it never overrides the pre-registered GO.
- Telemetry deviation check (body step 10): attempt
  `node scripts/telemetry-check.js` against the scale-wall
  baseline; record the outcome (counterconfirm-a found the tool
  refuses recorder corpora — if it refuses here, record that
  and do not force it).
- Sense-test (SENSE-TESTING LAW): read at least one transcript
  where a raise is answered (or expires / a counter stalls)
  and judge whether the exchange reads like people, not just
  counts; quote the lines.
- Scale-wall numbers every run: national / table / wins, wave
  4–5 unlocks, median survival, seasoning count, polities.

## Convergence state

Pilot: GO candidate, HELD by the (since-revised) cost bar.
This confirm re-judges under the revised bar. Convergence
line to be written in the evidence: converging | converged |
parked | killed-at-pilot, as the verdict dictates.
