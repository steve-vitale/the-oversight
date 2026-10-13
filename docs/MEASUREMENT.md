# MEASUREMENT.md — the house standard (Steve 2026-10-11)

How the loops test, measure, and prove. Short and enforceable, not
aspirational. If your run doesn't meet this, say so in the evidence file —
don't silently lower the bar.

## 1. Identical seeds, always

Every before/after claim runs the SAME seeds on both sides. Seeds are fixed
literals in the script or env (`SEEDS="7,42,99"`), never "a few random ones".
The standard runner is `scripts/sweep-compare.js`:

```
LEVER="my lever" SEEDS="7,42,99" POLICIES="competent,risk-aware" DAYS=60 \
  OUT=/tmp/out.json node scripts/sweep-compare.js
```

Minimum: 3 seeds × 60 days for a smoke claim; 6+ seeds × 200 days for a
reachability claim. Fewer than that is a probe, not a result — label it.

## 2. Multi-policy, always

One policy can't see strategy-dependence. Every lever runs at least TWO
policies on identical seeds: `competent` (the default baseline — its behavior
is pinned; don't "improve" it inside a lever run) plus the policy that
isolates your lever's question (`risk-aware` for fear, `larceny-leaning` vs
`kind` for justice, `deed-seeking` for deed curves, `winseek` for the ceiling).
The policy library lives in `scripts/policies/` with a README. If no existing
policy isolates your question, add one (one file, documented, deterministic)
instead of hand-rolling behavior into the sweep.

## 3. Seeded PRNG in proofs — no exceptions

A proof test asserting aggregate behavior over unseeded Math.random is flaky
by construction. Seed before eval (the harness does this: mulberry32 installed
as Math.random BEFORE modules load, because several capture it at load time),
expose a SEED env override, and re-run green on ≥3 seeds before calling it
done. Sample-gate share assertions (skip when n is tiny); day-normalize rate
comparisons.

## 4. Sense-reads are the bar, not the garnish

Buttons working is not the bar (Steve 2026-10-11: "not just that things work
but that they are sensical"). Every proof test that touches player-facing copy
prints the lines and the author reads them for meaning, coherence, and
relevance. Transcripts over counts: a conversation proof shows the exchange,
not just the exchange count.

## 5. What "green" means

- Proof test: all assertions pass on ≥3 seeds (state the seeds).
- Closest regression suites: green on the same tree (name them).
- Ontology: `scripts/validate-ontology.js` passes (headers valid).
- Determinism spot-check for new harness code: same seeds twice →
  identical tables (see sweep-compare self-test pattern).
- No bare `git commit`; `scripts/safe-commit.sh` only; merge `--ff-only`;
  never push/bump (ship loop owns it).

## 6. When a lever needs [needs-eyes]

Anything that changes feel, combat, or UI — damage numbers, new on-screen
copy, new beats, pacing changes — gets `[needs-eyes]` in the commit message.
The ship loop fast-tracks flagged batches to Steve's phone. When in doubt,
flag it: a false positive costs a tag, a false negative costs his trust.

## 7. Pacing is measured, not estimated

- Sims: `runDays` always records `result.pacing` — mean verbs/day,
  policy-calls/day, ticks/day, plus per-day rows. Quote these in lever
  evidence instead of guessing day length.
- Live: `endDay()` records real minutes-per-day into `state.pacing`
  (ring buffer, local only, never a network call); `Game.pacingStats()`
  reads it; the 🐞 debug panel shows median min/day. This is the data
  behind the 40-hour question — cite it, don't estimate.

## 8. Tooling changes nothing about balance

Measurement workers don't pull levers. If the harness spots a balance issue,
document it in the evidence file for the loops — don't fix it in the tooling
commit.

## 9. Staged seeds: the pilot gate (Steve 2026-10-12)

Never spend 12–20 seeds before knowing the lever does anything visible.
Every lever runs in stages, cheapest first:

- **Stage 0 — smoke (2–3 seeds, short horizon).** Does the lever's code path
  even fire? Does the primary metric move at all? If nothing fires, fix the
  wiring, not the tuning.
- **Stage 1 — pilot (8 seeds, question-appropriate horizon, before/after on
  identical seeds).** The GO/NO-GO gate. GO only if the effect is *obvious*
  in 8 seeds — visible in the raw numbers without statistics. (Steve
  2026-10-13: seeds are ~3s each — stop under-powering experiments; the old
  4-seed pilot was sized for expensive sims that no longer exist.)
- **Stage 2 — confirm (12–16 seeds).** Only on a pilot GO. This is the
  publishable measurement.

**Kill rule:** pilot delta below the pre-registered threshold → document it,
kill the lever, move on. No confirm spend on invisible effects.

The gate is a sniff test, not a significance test. If you need 20 seeds and
a p-value to see the lever's effect, the lever isn't pulling hard enough —
redesign it or park it.

Wall-clock budget (hourly loops): the pilot must fit in ~15 minutes. The
confirm gets the rest of the run. If the pilot can't fit, shrink the horizon
first (section 10), then the seed count — never skip the gate.

## 10. Death-aware horizons (Steve 2026-10-12)

A fixed 200-day horizon is waste when villages die at day 63. Set the horizon
from the lever's question and the measured survival distribution:

- **Early-game levers** (landing, food basics, wave 1): 60 days.
- **Mid-game levers** (waves 2–3, knowledge, regional): 100 days.
- **Reachability levers** (waves 4–5, national, table, wins): 150–200 days.
- **Adaptive rule:** horizon = min(cap, p95 village-death day from the
  baseline sweep + 15 days tail). The baseline sweep gives you the survival
  distribution for free — use it.
- **Stop rule:** a seed whose village is dead or scattered stops simulating.
  Succession/epilogue behavior gets at most a 10-day tail, then the seed is
  done. Never tick a dead village to fill a horizon.

Quote the horizon choice and its reason in the evidence header (section 11).

## 11. Pre-register the run (Steve 2026-10-12)

The evidence file header states, BEFORE running:

- primary metric (one — the thing this run is trying to move),
- minimum meaningful effect (the GO threshold for the pilot gate),
- horizon + why (section 10),
- seeds (exact literals), policies.

Judge the run against its header. If the data makes you move the goalposts,
record the change in the evidence file as a correction — never a quiet edit.
A run that pre-registered honestly and killed its lever is a good run.

## 12. Convergence and lever budgets (Steve 2026-10-12)

Tuning converges; it doesn't just continue.

- A lever is **converged** when two consecutive tuning steps move the primary
  metric less than the meaningful-effect threshold, or the metric hits its
  design target. Say so in the evidence file and move to the next lever.
- **Budget:** 3 rounds without passing the pilot gate → park the lever,
  document why, move on. Sunk cost is not a strategy.
- Every run reports convergence state in one line:
  `converging | converged | parked | killed-at-pilot`.

## 13. Playstyle balance (Steve 2026-10-13)

"Playstyles relatively balanced" is a standing target alongside winnability.
No degenerate single-build endgame: reaching national and winning must be
possible through multiple roads (LEAD/BELONG), multiple table paths (the 7 ×
light/dark), and multiple ability builds — not one solved route.

- The sweep (`scripts/sweep-winstats-deep.js`) records tablePath/tableBranch,
  abilities, synergies, road, and ascension per run. The analyzer
  (`scripts/analyze-winstats-deep.js`) prints a BALANCE VERDICT.
- Verdicts: `insufficient-data` (< 10 wins — distribution not judgeable yet) ·
  `DEGENERATE` (one path ≥ 60% of wins, or one ability in ≥ 70% of wins) ·
  `skewed` (one path ≥ 40%, or one ability in ≥ 55%) · `even` (otherwise).
- Honest sequencing: with ~1 win per 145 runs, balance is unmeasurable today.
  The verdict activates when wins exist. Levers keep working winnability
  first; when the win-path axis unblocks, the first balance verdict gates
  whether tuning continues or the design needs a real shake-up.
- Steve's ascension law holds in sims: the ending follows the village's
  story, and the analyzer's WINS DETAIL stays the audit trail.

## 14. Metric binding — the anti-drift rule (Steve 2026-10-13)

"Continually reevaluate our success metrics to prevent drift." Re-evaluation
happens BETWEEN runs, never within one. The failure mode: a run misses its
pre-registered GO, and the analyst re-scores the same run against a friendlier
metric instead of reporting the miss. (2026-10-13: the villager-counter pilot's
strict rule said NO-GO on attributed kills; the run was read as GO on ledger
kills instead — the metric moved mid-judgment.)

- Pre-registered metrics are BINDING for the run. Judge the run against the
  header (§11) exactly as written. A miss is a miss; report NO-GO.
- If the metric proves wrong (bad proxy, taxonomy artifact, blind channel),
  write it up under "metric review" in the evidence file and propose the
  revised metric FOR THE NEXT RUN. Never re-score the same run.
- Every evidence file carries a "metric review" section, even if it says
  "none — metrics held." The review is where drift gets caught: is the GO
  still measuring what Steve cares about (winnability, tedium, reachability),
  or has it become a number that moves without the game improving?
- Category/taxonomy changes (e.g. the 2026-10-13 corpseTakeItem social→food
  fix) invalidate previously published tables. When a taxonomy changes,
  regenerate the tables and stamp a dated CORRECTION note — never silently
  re-issue.
- Guardrails are metrics too: a GO met with a guardrail breached is NO-GO.
